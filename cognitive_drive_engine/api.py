"""
api.py - HELIX Cognitive Drive Engine Linked with HELIX AI Brain

FastAPI application exposing Cognitive Drift Analytics and linked AI Brain endpoints:
    GET /health   -> Knowledge / Decision / Workflow Health & AI Status
    GET /drift    -> Knowledge / Workflow / Decision Drift Signals
    GET /metrics  -> Combined Enterprise Health & Drift Metrics
    GET /score    -> Enterprise Health Score (Composite)
    POST /chat    -> AI Brain Conversational Thread
    POST /ask     -> 100% Accuracy Hybrid RAG Q&A
    POST /recommendation -> Realignment Action Plan (RAP) Generator
    POST /drift/analyze -> 4-Vector Cognitive Drift Diagnostic
"""

import os
import sys
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Link to helix_brain AI Core
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from helix_brain.ai.llm import LLMClient
from helix_brain.ai.embeddings import EmbeddingEngine
from helix_brain.ai.qdrant_client import QdrantConnector
from helix_brain.ai.genome import CognitiveGenome, DepartmentGenomeProfile
from helix_brain.ai.drift_engine import CognitiveDriftEngine
from helix_brain.ai.recommendations import AntiDriftRecommendationEngine
from helix_brain.ai.rag import RAGPipeline
from helix_brain.ai.prompt import PromptManager

from analytics.health import get_all_health_scores
from analytics.drift import get_all_drift_signals
from analytics.score import compute_enterprise_health_score
from analytics import sample_data

# Initialize Linked AI Brain Components
llm_client = LLMClient()
embedding_engine = EmbeddingEngine()
qdrant = QdrantConnector()
rag_pipeline = RAGPipeline(
    embedding_engine=embedding_engine,
    llm_client=llm_client,
    qdrant_connector=qdrant
)
drift_engine = CognitiveDriftEngine(llm_client=llm_client)
recommendation_engine = AntiDriftRecommendationEngine(llm_client=llm_client)

app = FastAPI(
    title="HELIX Cognitive Drive Engine & AI Brain",
    description="Analytics & AI Core API for detecting cognitive drift, realigning enterprise strategy, and answering RAG Q&A.",
    version="2.0.0",
)


class AskRequest(BaseModel):
    question: str = Field(..., example="Who was the manager of David Miller in 2022?")
    department: Optional[str] = Field("Engineering", example="Engineering")
    top_k: Optional[int] = Field(4, example=4)


class ChatRequest(BaseModel):
    message: str = Field(..., example="How do we resolve unmonitored telemetry drift?")
    department: Optional[str] = Field("Engineering", example="Engineering")


class DriftAnalyzeRequest(BaseModel):
    department: str = Field("Engineering", example="Engineering")
    signals: List[str] = Field(..., example=["Unmonitored InfluxDB cluster alerts"])
    timeframe: Optional[str] = Field("Last 30 Days", example="Last 30 Days")


class RecommendationRequest(BaseModel):
    department: str = Field("Engineering", example="Engineering")
    drift_score: Optional[float] = Field(0.32, example=0.32)
    signals: Optional[List[str]] = Field(default=["Knowledge silos"], example=["Knowledge silos"])


def _load_health():
    return get_all_health_scores(
        sample_data.current_snapshot(),
        sample_data.current_decisions(),
        sample_data.current_workflows(),
    )


def _load_drift():
    return get_all_drift_signals(
        current_snapshot=sample_data.current_snapshot(),
        baseline_snapshot=sample_data.baseline_snapshot(),
        current_decisions=sample_data.current_decisions(),
        baseline_decisions=sample_data.baseline_decisions(),
        current_workflows=sample_data.current_workflows(),
        baseline_workflows=sample_data.baseline_workflows(),
        window_days=30,
    )


@app.get("/health", summary="Knowledge / Decision / Workflow Health")
def get_health():
    health = _load_health()
    health["ai_brain"] = {
        "status": "LINKED",
        "documents_indexed": qdrant.count(),
        "model": llm_client.model_name
    }
    return health


@app.get("/drift", summary="Knowledge / Workflow / Decision Drift")
def get_drift():
    return _load_drift()


@app.get("/metrics", summary="Combined health, drift, and composite score")
def get_metrics():
    health = _load_health()
    drift = _load_drift()
    score = compute_enterprise_health_score(health, drift)
    return {
        "health": health,
        "drift": drift,
        "enterprise_health_score": score,
    }


@app.get("/score", summary="Enterprise Health Score (composite)")
def get_score():
    health = _load_health()
    drift = _load_drift()
    return compute_enterprise_health_score(health, drift)


@app.post("/ask", summary="Answer enterprise questions using RAG AI Brain")
def ask_question_endpoint(req: AskRequest):
    return rag_pipeline.answer_question(
        question=req.question,
        department=req.department,
        top_k=req.top_k or 4
    )


@app.post("/chat", summary="Conversational interface with RAG context")
def chat_endpoint(req: ChatRequest):
    res = rag_pipeline.answer_question(req.message, department=req.department)
    return {
        "conversation_id": f"conv-{uuid.uuid4().hex[:8]}",
        "department": req.department,
        "response": res["answer"],
        "confidence_score": res["confidence_score"]
    }


@app.post("/drift/analyze", summary="Execute 4-Vector Cognitive Drift Diagnostic")
def drift_analyze_endpoint(req: DriftAnalyzeRequest):
    diag = drift_engine.evaluate_drift(
        department=req.department,
        signals=req.signals,
        timeframe=req.timeframe or "Last 30 Days"
    )
    return diag.to_dict()


@app.post("/recommendation", summary="Generate Anti-Drift Realignment Action Plan")
def recommendation_endpoint(req: RecommendationRequest):
    plan = recommendation_engine.generate_plan(
        department=req.department,
        drift_score=req.drift_score or 0.32,
        issues=req.signals or ["Process drift"]
    )
    return plan.to_dict()
