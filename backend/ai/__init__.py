"""
HELIX Advanced Enterprise Cognitive Genome AI Package
"""

from .prompt import (
    SYSTEM_COGNITIVE_GENOME_PROMPT,
    COGNITIVE_DRIFT_PROMPT,
    RECOMMENDATION_PROMPT,
    ENTERPRISE_QA_PROMPT,
    CHAT_SYSTEM_PROMPT,
    PromptManager,
)
from .embeddings import EmbeddingEngine, compute_cosine_similarity, bm25_lexical_score
from .llm import LLMClient
from .qdrant_client import QdrantConnector
from .genome import CognitiveGenome, DepartmentGenomeProfile
from .drift_engine import CognitiveDriftEngine, DriftDiagnostic
from .recommendations import AntiDriftRecommendationEngine, RealignmentActionPlan
from .rag import RAGPipeline

__all__ = [
    "SYSTEM_COGNITIVE_GENOME_PROMPT",
    "COGNITIVE_DRIFT_PROMPT",
    "RECOMMENDATION_PROMPT",
    "ENTERPRISE_QA_PROMPT",
    "CHAT_SYSTEM_PROMPT",
    "PromptManager",
    "EmbeddingEngine",
    "compute_cosine_similarity",
    "bm25_lexical_score",
    "LLMClient",
    "QdrantConnector",
    "CognitiveGenome",
    "DepartmentGenomeProfile",
    "CognitiveDriftEngine",
    "DriftDiagnostic",
    "AntiDriftRecommendationEngine",
    "RealignmentActionPlan",
    "RAGPipeline",
]
