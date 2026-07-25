"""
sparse_match.py

Sparse retrieval layer for Hybrid Drift Evaluation.

Two mechanisms, deliberately kept separate:

  1. BM25 — classic sparse lexical ranking over policy rule text. Good
     for "mostly the right words, different order/inflection."
  2. Regex hard-trigger scanning — deterministic pattern matching for
     non-negotiable enterprise compliance triggers (exact secret key
     formats, PII/GDPR mentions, discount thresholds, etc). These
     should NEVER be left to a similarity score's discretion — a
     literal AWS key in telemetry is a violation regardless of how far
     away it lands in embedding space that day.

Pure Python, no external dependencies, so this runs anywhere the rest
of the analytics package runs.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import Dict, List

from .embeddings import tokenize


# ---------------------------------------------------------------------------
# BM25
# ---------------------------------------------------------------------------

@dataclass
class BM25Index:
    doc_ids: List[str]
    doc_tokens: List[List[str]]
    doc_freqs: List[Dict[str, int]]
    df: Dict[str, int]
    avg_doc_len: float
    k1: float = 1.5
    b: float = 0.75

    @property
    def n_docs(self) -> int:
        return len(self.doc_ids)


def build_bm25_index(documents: Dict[str, str]) -> BM25Index:
    """documents: mapping of doc_id -> raw text (e.g. policy rule text)."""
    doc_ids: List[str] = []
    doc_tokens: List[List[str]] = []
    doc_freqs: List[Dict[str, int]] = []
    df: Dict[str, int] = {}

    for doc_id, text in documents.items():
        tokens = tokenize(text)
        freqs: Dict[str, int] = {}
        for tok in tokens:
            freqs[tok] = freqs.get(tok, 0) + 1
        doc_ids.append(doc_id)
        doc_tokens.append(tokens)
        doc_freqs.append(freqs)
        for tok in freqs:
            df[tok] = df.get(tok, 0) + 1

    total_len = sum(len(t) for t in doc_tokens)
    avg_len = total_len / len(doc_tokens) if doc_tokens else 0.0

    return BM25Index(
        doc_ids=doc_ids,
        doc_tokens=doc_tokens,
        doc_freqs=doc_freqs,
        df=df,
        avg_doc_len=avg_len,
    )


def bm25_scores(index: BM25Index, query: str) -> Dict[str, float]:
    """Returns raw (un-normalized) BM25 score per doc_id for the query."""
    query_tokens = tokenize(query)
    scores: Dict[str, float] = {doc_id: 0.0 for doc_id in index.doc_ids}
    n = index.n_docs
    if n == 0:
        return scores

    for i, doc_id in enumerate(index.doc_ids):
        freqs = index.doc_freqs[i]
        doc_len = len(index.doc_tokens[i])
        score = 0.0
        for term in query_tokens:
            if term not in freqs:
                continue
            df = index.df.get(term, 0)
            idf = math.log(1 + (n - df + 0.5) / (df + 0.5))
            tf = freqs[term]
            denom = tf + index.k1 * (1 - index.b + index.b * doc_len / max(index.avg_doc_len, 1e-9))
            score += idf * (tf * (index.k1 + 1)) / max(denom, 1e-9)
        scores[doc_id] = score

    return scores


def normalize_scores(scores: Dict[str, float]) -> Dict[str, float]:
    """Min-max normalize a score dict into [0, 1].

    NOTE: min-max is *relative* to whatever rules happen to be in the
    corpus -- with only a handful of policy rules, even a genuinely
    irrelevant telemetry item will always have its best-matching rule
    pushed to 1.0, which overstates weak matches. Prefer
    `saturate_scores` (absolute, not corpus-relative) when fusing BM25
    into a combined score. This is kept for cases where relative
    ranking within a single corpus is genuinely what's wanted."""
    if not scores:
        return scores
    values = list(scores.values())
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return {k: 0.0 for k in scores}
    return {k: (v - lo) / (hi - lo) for k, v in scores.items()}


def saturate_scores(scores: Dict[str, float], k: float = 2.0) -> Dict[str, float]:
    """Maps raw BM25 scores into [0, 1) via score / (score + k) -- an
    absolute saturating transform (a 0 raw score stays 0; scores need
    real magnitude to approach 1) rather than min-max's corpus-relative
    stretch. This is what feeds the hybrid fusion score, so a telemetry
    item with no real lexical overlap to *any* rule doesn't get an
    inflated sparse signal just because the rule corpus is small."""
    return {doc_id: (v / (v + k) if v > 0 else 0.0) for doc_id, v in scores.items()}


# ---------------------------------------------------------------------------
# Regex hard triggers
# ---------------------------------------------------------------------------

@dataclass
class RegexTrigger:
    name: str
    pattern: str
    flags: int = re.IGNORECASE

    def compiled(self) -> re.Pattern:
        return re.compile(self.pattern, self.flags)


# High-risk enterprise policy triggers. Each maps to one or more
# regex_triggers referenced by PolicyRule in policy_rules.py, so a hit
# here can be tied straight back to the specific rule it violates.
HARD_TRIGGERS: List[RegexTrigger] = [
    RegexTrigger("AWS_SECRET_KEY", r"AWS_SECRET_KEY|AWS_SECRET_ACCESS_KEY|AKIA[0-9A-Z]{16}"),
    RegexTrigger("GENERIC_API_KEY", r"\b(api[_-]?key|secret[_-]?key)\s*[:=]\s*['\"]?[A-Za-z0-9_\-\/+]{12,}"),
    RegexTrigger("PII", r"\bPII\b|\bsocial security\b|\bSSN\b"),
    RegexTrigger("GDPR", r"\bGDPR\b"),
    RegexTrigger("SOC2", r"\bSOC[\s-]?2\b"),
    RegexTrigger("DISCOUNT_THRESHOLD", r"\b([3-9][0-9]|[1-9][0-9]{2,})\s?%\s?(discount|off)\b"),
    RegexTrigger("CREDIT_CARD", r"\b(?:\d[ -]*?){13,16}\b"),
]


def scan_hard_triggers(text: str, triggers: List[RegexTrigger] = HARD_TRIGGERS) -> List[Dict[str, str]]:
    """Returns a list of {name, matched_text} for every trigger that fires
    against `text`. Used both to compute the sparse "hard trigger" signal
    and to populate the Genome Trace with the exact matched substring."""
    hits: List[Dict[str, str]] = []
    for trigger in triggers:
        match = trigger.compiled().search(text)
        if match:
            hits.append({"name": trigger.name, "matched_text": match.group(0)})
    return hits
