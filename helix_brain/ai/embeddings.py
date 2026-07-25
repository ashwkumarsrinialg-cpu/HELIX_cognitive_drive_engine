"""
HELIX: Advanced Enterprise Cognitive Genome Platform - Embeddings & Hybrid Search Module
"""

import math
import os
import re
import hashlib
from typing import List, Dict, Any, Tuple


def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)


def bm25_lexical_score(
    query: str,
    document: str,
    k1: float = 1.5,
    b: float = 0.75,
    avg_dl: float = 100.0
) -> float:
    """Computes BM25 lexical keyword relevance score for hybrid RAG search."""
    query_terms = re.findall(r'\w+', query.lower())
    doc_terms = re.findall(r'\w+', document.lower())

    if not query_terms or not doc_terms:
        return 0.0

    doc_len = len(doc_terms)
    term_counts = {}
    for term in doc_terms:
        term_counts[term] = term_counts.get(term, 0) + 1

    score = 0.0
    for term in set(query_terms):
        if term in term_counts:
            tf = term_counts[term]
            num = tf * (k1 + 1)
            den = tf + k1 * (1 - b + b * (doc_len / avg_dl))
            score += (num / den)

    return round(score, 4)


def hybrid_rrf_score(
    vector_rank: int,
    lexical_rank: int,
    rrf_k: int = 60
) -> float:
    """Reciprocal Rank Fusion (RRF) algorithm to combine vector and lexical search rankings."""
    v_score = 1.0 / (rrf_k + vector_rank) if vector_rank > 0 else 0.0
    l_score = 1.0 / (rrf_k + lexical_rank) if lexical_rank > 0 else 0.0
    return round(v_score + l_score, 6)


class EmbeddingEngine:
    """
    Advanced Embedding Engine for HELIX.
    Generates 1536-dimensional L2-normalized dense vector representations for documents and queries.
    """

    def __init__(self, model_name: str = "text-embedding-3-small", dimension: int = 1536):
        self.model_name = model_name
        self.dimension = dimension
        self.openai_client = None

        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=api_key)
            except Exception:
                self.openai_client = None

    def embed_text(self, text: str) -> List[float]:
        """Generates a dense float vector embedding for a single text string."""
        if not text or not text.strip():
            return [0.0] * self.dimension

        if self.openai_client:
            try:
                response = self.openai_client.embeddings.create(
                    input=text,
                    model=self.model_name
                )
                return response.data[0].embedding
            except Exception:
                pass

        return self._generate_fallback_embedding(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text strings."""
        if not texts:
            return []

        if self.openai_client:
            try:
                response = self.openai_client.embeddings.create(
                    input=texts,
                    model=self.model_name
                )
                return [item.embedding for item in response.data]
            except Exception:
                pass

        return [self._generate_fallback_embedding(t) for t in texts]

    def _generate_fallback_embedding(self, text: str) -> List[float]:
        """Generates a deterministic 1536-dimensional L2-normalized vector embedding."""
        vec = [0.0] * self.dimension
        cleaned = text.lower().strip()
        words = re.findall(r'\w+', cleaned)

        if not words:
            return vec

        tokens = list(words)
        for w in words:
            for n in range(3, min(6, len(w) + 1)):
                tokens.append(w[:n])
                tokens.append(w[-n:])

        for token in tokens:
            hash_bytes = hashlib.sha256(token.encode('utf-8')).digest()
            for idx in range(0, len(hash_bytes) - 1, 2):
                bucket = (hash_bytes[idx] << 8 | hash_bytes[idx+1]) % self.dimension
                val = 1.0 if (hash_bytes[idx] % 2 == 0) else -1.0
                vec[bucket] += val

        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]

        return vec
