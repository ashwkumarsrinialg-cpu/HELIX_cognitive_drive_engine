"""
embeddings.py

Dense retrieval layer for Hybrid Drift Evaluation.

This module captures *semantic intent* — e.g. "skip the audit" should
register as close to "SOC2 compliance breach" even though the two
strings share zero literal words.

Design notes
------------
This ships with a fully offline, dependency-free embedder
(`ConceptHashingEmbedder`) so the demo/eval works with no API keys, no
model downloads, and deterministic output. It combines two signals:

  1. Feature hashing over word + character n-gram tokens (the same
     "hashing trick" used by scikit-learn's HashingVectorizer / Vowpal
     Wabbit) — this gives real vector similarity for lexical variants
     ("audit" vs "auditing") without needing a vocabulary.
  2. A small curated *concept map* for the enterprise-risk domain,
     which expands surface tokens into shared abstract concept tags
     (e.g. "skip", "bypass", "waive" -> POLICY_EXCEPTION;
     "audit", "SOC2", "certification" -> AUDIT_COMPLIANCE). Two texts
     that trigger the same concept tags get pulled together in vector
     space even with no shared vocabulary — this is what actually
     buys the "skip the audit" ~= "SOC2 compliance breach" behavior.

`EmbeddingProvider` is a small protocol so this can be swapped for a
real embedding model (Anthropic/OpenAI embeddings API, a local
sentence-transformers model, etc.) later without touching any caller —
every function in hybrid_drift.py depends on the interface, not this
implementation.
"""

from __future__ import annotations

import hashlib
import math
import re
from typing import Dict, List, Protocol

EMBEDDING_DIM = 256

_TOKEN_RE = re.compile(r"[a-zA-Z0-9_]+")

# Curated concept map for the enterprise policy-drift domain.
# Extend this as new risk categories are added; it is intentionally
# hand-authored (not learned) so its behavior stays auditable for the
# Genome Trace explainability story.
_CONCEPT_MAP: Dict[str, List[str]] = {
    "concept:policy_exception": [
        "skip", "skipping", "bypass", "bypassing", "waive", "waiver",
        "override", "overriding", "exception", "ignore", "ignoring",
        "shortcut", "cut corners", "without approval", "unapproved",
    ],
    "concept:audit_compliance": [
        "audit", "auditing", "auditor", "soc2", "soc", "compliance",
        "certification", "attestation", "control", "controls",
        "review", "assessment",
    ],
    "concept:secret_exposure": [
        "secret", "secrets", "credential", "credentials", "key", "keys",
        "token", "tokens", "password", "passwords", "apikey", "leak",
        "leaked", "exposed", "plaintext", "hardcoded",
    ],
    "concept:data_privacy": [
        "pii", "gdpr", "personal", "privacy", "personally",
        "identifiable", "data subject", "consent", "anonymize",
        "anonymized", "residency",
    ],
    "concept:pricing_deviation": [
        "discount", "discounted", "rebate", "markdown", "margin",
        "pricing", "price cut", "concession",
    ],
    "concept:breach_incident": [
        "breach", "incident", "violation", "non-compliant",
        "noncompliant", "infringement", "exposure",
    ],
}

# Flatten to a lookup: surface phrase -> concept tag(s)
_PHRASE_TO_CONCEPTS: Dict[str, List[str]] = {}
for concept, phrases in _CONCEPT_MAP.items():
    for phrase in phrases:
        _PHRASE_TO_CONCEPTS.setdefault(phrase, []).append(concept)


def tokenize(text: str) -> List[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text)]


def _char_ngrams(token: str, n: int = 3) -> List[str]:
    if len(token) <= n:
        return [token]
    return [token[i:i + n] for i in range(len(token) - n + 1)]


def _concept_tags(text_lower: str) -> List[str]:
    """Return concept tags triggered by any phrase found in the text."""
    tags: List[str] = []
    for phrase, concepts in _PHRASE_TO_CONCEPTS.items():
        if phrase in text_lower:
            tags.extend(concepts)
    return tags


def _hash_feature(feature: str, dim: int = EMBEDDING_DIM) -> int:
    # hashlib (not builtin hash()) so results are stable across runs/processes.
    digest = hashlib.md5(feature.encode("utf-8")).hexdigest()
    return int(digest, 16) % dim


class EmbeddingProvider(Protocol):
    def embed(self, text: str) -> List[float]:
        ...


class ConceptHashingEmbedder:
    """Offline dense embedder: hashed word/char n-grams + concept tags."""

    def __init__(self, dim: int = EMBEDDING_DIM):
        self.dim = dim

    def embed(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        text_lower = text.lower()
        tokens = tokenize(text)

        for tok in tokens:
            vec[_hash_feature(f"word:{tok}", self.dim)] += 1.0
            for ng in _char_ngrams(tok):
                vec[_hash_feature(f"char:{ng}", self.dim)] += 0.5

        # Concept tags get a strong weight — they're the mechanism that
        # bridges paraphrases with no shared vocabulary.
        for tag in _concept_tags(text_lower):
            vec[_hash_feature(tag, self.dim)] += 3.0

        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec


def cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    # a and b are already L2-normalized by ConceptHashingEmbedder, but
    # guard against callers passing in raw vectors.
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


default_embedder = ConceptHashingEmbedder()
