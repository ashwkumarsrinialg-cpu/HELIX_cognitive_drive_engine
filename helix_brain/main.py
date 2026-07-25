"""
HELIX: Advanced Enterprise Cognitive Genome Platform - REST API Server (helix_brain/main.py)
Endpoints:
- POST /chat
- POST /recommendation
- POST /ask
- POST /drift/analyze
- POST /index
- GET  /genome/{department}
- GET  /health
"""

import json
import os
import sys
import uuid
from typing import Dict, Any, List, Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from ai.llm import LLMClient
from ai.embeddings import EmbeddingEngine
from ai.qdrant_client import QdrantConnector
from ai.genome import CognitiveGenome, DepartmentGenomeProfile
from ai.drift_engine import CognitiveDriftEngine
from ai.recommendations import AntiDriftRecommendationEngine
from ai.rag import RAGPipeline
from ai.prompt import PromptManager

llm_client = LLMClient()
embedding_engine = EmbeddingEngine()
qdrant_connector = QdrantConnector()

rag_pipeline = RAGPipeline(
    embedding_engine=embedding_engine,
    llm_client=llm_client,
    qdrant_connector=qdrant_connector
)

drift_engine = CognitiveDriftEngine(llm_client=llm_client)
recommendation_engine = AntiDriftRecommendationEngine(llm_client=llm_client)

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field

    app = FastAPI(
        title="HELIX Standalone Enterprise Cognitive Genome API",
        description="REST API for detecting cognitive drift, generating anti-drift recommendations, and answering enterprise Q&A.",
        version="2.0.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class ChatRequest(BaseModel):
        message: str = Field(..., example="How do we prevent cognitive drift in our engineering team?")
        conversation_id: Optional[str] = Field(None, example="conv-101")
        department: Optional[str] = Field("Engineering", example="Engineering")
        context: Optional[Dict[str, Any]] = None

    class RecommendationRequest(BaseModel):
        department: str = Field("Engineering", example="Engineering")
        drift_score: Optional[float] = Field(0.35, example=0.35)
        signals: Optional[List[str]] = Field(
            default=["Inconsistent ADR reviews", "Knowledge silos across sub-teams"],
            example=["Inconsistent ADR reviews", "Unrecorded architecture decisions"]
        )

    class AskRequest(BaseModel):
        question: str = Field(..., example="What are our official architecture governance guidelines?")
        department: Optional[str] = Field("Engineering", example="Engineering")
        top_k: Optional[int] = Field(4, example=4)

    class DriftAnalyzeRequest(BaseModel):
        department: str = Field("Engineering", example="Engineering")
        signals: List[str] = Field(
            ...,
            example=["Inconsistent ADR adoption", "Knowledge silos across sub-teams"]
        )
        timeframe: Optional[str] = Field("Last 30 Days", example="Last 30 Days")

    class IndexDocumentRequest(BaseModel):
        title: str = Field(..., example="Security Review Guidelines 2026")
        content: str = Field(..., example="All external APIs must require OAuth 2.1 authorization tokens...")
        department: Optional[str] = Field("Security", example="Security")
        source: Optional[str] = Field("Internal Policy", example="Internal Policy")

    @app.get("/health")
    def health_check():
        return {
            "status": "HEALTHY",
            "service": "HELIX Standalone Enterprise Engine",
            "version": "2.0.0",
            "model": llm_client.model_name,
            "vector_store_documents": rag_pipeline.qdrant.count()
        }

    @app.post("/chat")
    def chat_endpoint(req: ChatRequest):
        conv_id = req.conversation_id or f"conv-{uuid.uuid4().hex[:8]}"

        context_docs = rag_pipeline.search_documents(query=req.message, top_k=3, department=req.department)
        context_text = "\n".join([d["content"] for d in context_docs]) if context_docs else ""

        full_prompt = (
            f"User Department: {req.department}\n"
            f"Institutional Knowledge Passages:\n{context_text}\n\n"
            f"User Question: {req.message}"
        )

        response_text = llm_client.generate(
            prompt=full_prompt,
            system_prompt=PromptManager.CHAT_SYSTEM_PROMPT
        )

        return {
            "conversation_id": conv_id,
            "department": req.department,
            "response": response_text,
            "cognitive_state": {
                "alignment_evaluated": True,
                "context_passages_retrieved": len(context_docs)
            }
        }

    @app.post("/recommendation")
    def recommendation_endpoint(req: RecommendationRequest):
        context_docs = rag_pipeline.search_documents(
            query=f"{req.department} alignment standards guidelines",
            top_k=3,
            department=req.department
        )

        plan = recommendation_engine.generate_plan(
            department=req.department,
            drift_score=req.drift_score or 0.35,
            issues=req.signals or ["Operational fragmentation"],
            context_docs=context_docs
        )

        return plan.to_dict()

    @app.post("/ask")
    def ask_endpoint(req: AskRequest):
        result = rag_pipeline.answer_question(
            question=req.question,
            department=req.department,
            top_k=req.top_k or 4
        )
        return result

    @app.post("/drift/analyze")
    def drift_analyze_endpoint(req: DriftAnalyzeRequest):
        diagnostic = drift_engine.evaluate_drift(
            department=req.department,
            signals=req.signals,
            timeframe=req.timeframe or "Last 30 Days"
        )
        return diagnostic.to_dict()

    @app.post("/index")
    def index_endpoint(req: IndexDocumentRequest):
        res = rag_pipeline.add_document(
            title=req.title,
            content=req.content,
            department=req.department or "General Enterprise",
            source=req.source or "Manual Ingestion"
        )
        return res

    @app.get("/genome/{department}")
    def get_department_genome(department: str):
        profile = drift_engine.department_profiles.get(department)
        if not profile:
            profile = DepartmentGenomeProfile(department)
            drift_engine.department_profiles[department] = profile
        return profile.to_dict()

except ImportError:
    import http.server
    import socketserver

    app = None
    print("FastAPI not detected. Native Python HTTP Server ready.")


def run_standalone_server(port: int = 8000):
    if app:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=port)
    else:
        class SimpleHandler(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                if self.path == "/health":
                    self._send_json({
                        "status": "HEALTHY",
                        "service": "HELIX Standalone Enterprise Engine",
                        "version": "2.0.0",
                        "documents_indexed": rag_pipeline.qdrant.count()
                    })
                elif self.path.startswith("/genome/"):
                    dept = self.path.split("/genome/")[-1]
                    profile = drift_engine.department_profiles.get(dept, DepartmentGenomeProfile(dept))
                    self._send_json(profile.to_dict())
                else:
                    self._send_json({"error": "Not Found"}, 404)

            def do_POST(self):
                length = int(self.headers.get('Content-Length', 0))
                body_bytes = self.rfile.read(length)
                try:
                    body = json.loads(body_bytes.decode('utf-8')) if body_bytes else {}
                except Exception:
                    body = {}

                if self.path == "/chat":
                    msg = body.get("message", "")
                    dept = body.get("department", "Engineering")
                    res = rag_pipeline.answer_question(msg, department=dept)
                    self._send_json({
                        "conversation_id": f"conv-{uuid.uuid4().hex[:8]}",
                        "department": dept,
                        "response": res["answer"]
                    })
                elif self.path == "/ask":
                    q = body.get("question", "")
                    dept = body.get("department", "Engineering")
                    res = rag_pipeline.answer_question(q, department=dept)
                    self._send_json(res)
                elif self.path == "/recommendation":
                    dept = body.get("department", "Engineering")
                    signals = body.get("signals", ["Process drift detected"])
                    plan = recommendation_engine.generate_plan(dept, 0.35, signals)
                    self._send_json(plan.to_dict())
                elif self.path == "/drift/analyze":
                    dept = body.get("department", "Engineering")
                    signals = body.get("signals", ["Process drift"])
                    diag = drift_engine.evaluate_drift(dept, signals)
                    self._send_json(diag.to_dict())
                elif self.path == "/index":
                    t = body.get("title", "Doc")
                    c = body.get("content", "")
                    d = body.get("department", "General Enterprise")
                    res = rag_pipeline.add_document(title=t, content=c, department=d)
                    self._send_json(res)
                else:
                    self._send_json({"error": "Endpoint not found"}, 404)

            def _send_json(self, data: dict, status: int = 200):
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

        print(f"🚀 Starting HELIX Standalone HTTP Server on port {port}...")
        with socketserver.TCPServer(("0.0.0.0", port), SimpleHandler) as httpd:
            httpd.serve_forever()


if __name__ == "__main__":
    run_standalone_server()
