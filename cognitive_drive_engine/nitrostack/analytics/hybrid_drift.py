"""
hybrid_drift.py

Hybrid Drift Evaluation: fuses Dense Retrieval (semantic embeddings)
with Sparse Retrieval (BM25 + regex hard triggers) to score raw
telemetry text against enterprise OKR / policy rules, and produces a
"Genome Trace" explainability record for every score so a judge/user
clicking "Inspect >" can see exactly why a score is what it is.

Score fusion
------------
combined_score = dense_weight  * dense_similarity          (semantic intent)
                + sparse_weight * normalized_bm25            (lexical overlap)
                + trigger_weight * hard_trigger_hit (0 or 1) (exact policy hit)

Hard triggers are also given a score *floor*: if a regex hard trigger
fires (e.g. a literal AWS key, or "GDPR"), the combined score can never
be diluted below TRIGGER_FLOOR by weak dense/sparse signal. Exact
compliance triggers are treated as ground truth, not as one vote among
several — that's the whole point of adding the sparse/regex layer on
top of pure embeddings.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional

from .embeddings import EmbeddingProvider, default_embedder, cosine_similarity
from .policy_rules import PolicyRule
from .sparse_match import (
    build_bm25_index,
    bm25_scores,
    saturate_scores,
    scan_hard_triggers,
    HARD_TRIGGERS,
)

DENSE_WEIGHT = 0.5
SPARSE_WEIGHT = 0.3
TRIGGER_WEIGHT = 0.2
TRIGGER_FLOOR = 0.85  # minimum combined score when a hard trigger fires


@dataclass
class TelemetryItem:
    telemetry_id: str
    source: str
    raw_text: str
    timestamp: Optional[str] = None


@dataclass
class SignalBreakdown:
    dense_score: float
    sparse_score: float
    trigger_score: float
    trigger_hits: List[Dict[str, str]] = field(default_factory=list)


@dataclass
class GenomeTrace:
    """Everything the 'Inspect >' card needs to render, in one object:
    the raw telemetry text, the exact policy rule text it was scored
    against, the per-signal score breakdown, and which signal drove
    the final score."""
    telemetry_id: str
    raw_telemetry_text: str
    matched_rule_id: str
    matched_rule_text: str
    matched_rule_category: str
    combined_score: float
    dominant_signal: str
    breakdown: SignalBreakdown
    timestamp: str


def _dominant_signal(breakdown: SignalBreakdown) -> str:
    weighted = {
        "dense": DENSE_WEIGHT * breakdown.dense_score,
        "sparse": SPARSE_WEIGHT * breakdown.sparse_score,
        "trigger": TRIGGER_WEIGHT * breakdown.trigger_score,
    }
    return max(weighted, key=weighted.get)


def score_telemetry_against_rules(
    telemetry: TelemetryItem,
    rules: List[PolicyRule],
    embedder: EmbeddingProvider = default_embedder,
    bm25_scores_by_rule: Optional[Dict[str, float]] = None,
) -> GenomeTrace:
    """Scores one telemetry item against every rule and returns the
    Genome Trace for the single best-matching (highest combined score)
    rule — i.e. the rule the telemetry item most likely drifted
    against."""

    telemetry_vec = embedder.embed(telemetry.raw_text)
    hits = scan_hard_triggers(telemetry.raw_text)
    hit_names = {h["name"] for h in hits}

    best_trace: Optional[GenomeTrace] = None
    best_score = -1.0

    for rule in rules:
        rule_vec = embedder.embed(rule.rule_text)
        dense_score = cosine_similarity(telemetry_vec, rule_vec)

        sparse_score = 0.0
        if bm25_scores_by_rule is not None:
            sparse_score = bm25_scores_by_rule.get(rule.rule_id, 0.0)

        rule_trigger_hits = [h for h in hits if h["name"] in rule.regex_trigger_names]
        trigger_score = 1.0 if rule_trigger_hits else 0.0

        combined = (
            DENSE_WEIGHT * dense_score
            + SPARSE_WEIGHT * sparse_score
            + TRIGGER_WEIGHT * trigger_score
        )
        if trigger_score > 0:
            combined = max(combined, TRIGGER_FLOOR)

        if combined > best_score:
            breakdown = SignalBreakdown(
                dense_score=round(dense_score, 4),
                sparse_score=round(sparse_score, 4),
                trigger_score=trigger_score,
                trigger_hits=rule_trigger_hits,
            )
            best_score = combined
            best_trace = GenomeTrace(
                telemetry_id=telemetry.telemetry_id,
                raw_telemetry_text=telemetry.raw_text,
                matched_rule_id=rule.rule_id,
                matched_rule_text=rule.rule_text,
                matched_rule_category=rule.category,
                combined_score=round(combined, 4),
                dominant_signal=_dominant_signal(breakdown),
                breakdown=breakdown,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

    assert best_trace is not None  # rules list is never empty in practice
    return best_trace


def evaluate_hybrid_drift(
    telemetry_items: List[TelemetryItem],
    rules: List[PolicyRule],
    embedder: EmbeddingProvider = default_embedder,
) -> List[GenomeTrace]:
    """Scores every telemetry item against every rule, returning one
    Genome Trace per telemetry item (its single worst/most-drifted
    match), sorted by combined_score descending so the highest-risk
    items surface first."""

    # BM25 index is built once over all rule texts and reused per item —
    # this is the piece that makes this "real-time" viable: index build
    # is O(rules), scoring each item against it is cheap, so this scales
    # to a live telemetry stream rather than re-deriving stats per call.
    bm25_index = build_bm25_index({r.rule_id: r.rule_text for r in rules})

    traces: List[GenomeTrace] = []
    for item in telemetry_items:
        raw_bm25 = bm25_scores(bm25_index, item.raw_text)
        norm_bm25 = saturate_scores(raw_bm25)
        trace = score_telemetry_against_rules(
            item, rules, embedder=embedder, bm25_scores_by_rule=norm_bm25
        )
        traces.append(trace)

    traces.sort(key=lambda t: t.combined_score, reverse=True)
    return traces


def get_trace_by_id(traces: List[GenomeTrace], telemetry_id: str) -> Optional[GenomeTrace]:
    for t in traces:
        if t.telemetry_id == telemetry_id:
            return t
    return None
