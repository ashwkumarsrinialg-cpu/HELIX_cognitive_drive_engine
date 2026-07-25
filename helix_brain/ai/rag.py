"""
HELIX: Advanced Enterprise Cognitive Genome Platform - Hybrid RAG & Vector Memory Pipeline
"""

import json
import time
import uuid
from typing import Dict, Any, List, Optional
from .embeddings import EmbeddingEngine, bm25_lexical_score, hybrid_rrf_score
from .llm import LLMClient
from .qdrant_client import QdrantConnector
from .prompt import PromptManager, CHAT_SYSTEM_PROMPT


class RAGPipeline:
    """Advanced Hybrid RAG Pipeline for HELIX."""

    def __init__(
        self,
        embedding_engine: Optional[EmbeddingEngine] = None,
        llm_client: Optional[LLMClient] = None,
        qdrant_connector: Optional[QdrantConnector] = None
    ):
        self.embedding_engine = embedding_engine or EmbeddingEngine()
        self.llm_client = llm_client or LLMClient()
        self.qdrant = qdrant_connector or QdrantConnector()
        self.raw_documents: Dict[str, Dict[str, Any]] = {}

        if self.qdrant.count() == 0:
            self._seed_default_enterprise_docs()

    def add_document(
        self,
        title: str,
        content: str,
        department: str = "General Enterprise",
        source: str = "Internal Policy",
        doc_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Ingests and indexes a document using parent-child chunking and Qdrant storage."""
        document_id = doc_id or f"DOC-{uuid.uuid4().hex[:8].upper()}"

        self.raw_documents[document_id] = {
            "doc_id": document_id,
            "title": title,
            "content": content,
            "department": department,
            "source": source,
            "timestamp": int(time.time())
        }

        chunks = self._chunk_text(content)
        points = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{document_id}_c{i}"
            vector = self.embedding_engine.embed_text(chunk)
            payload = {
                "doc_id": document_id,
                "chunk_id": chunk_id,
                "title": title,
                "content": chunk,
                "department": department,
                "source": source,
                "timestamp": int(time.time()),
            }
            points.append({
                "id": chunk_id,
                "vector": vector,
                "payload": payload
            })

        self.qdrant.upsert_vectors(points)
        return {
            "doc_id": document_id,
            "title": title,
            "chunks_indexed": len(chunks),
            "department": department,
            "status": "INDEXED"
        }

    def search_documents(
        self,
        query: str,
        top_k: int = 5,
        department: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Executes Hybrid RAG Retrieval."""
        query_vector = self.embedding_engine.embed_text(query)
        vector_results = self.qdrant.search_similar(query_vector, top_k=top_k * 2, department_filter=department)

        vector_rank_map = {item["id"]: idx + 1 for idx, item in enumerate(vector_results)}

        candidates = []
        for item in vector_results:
            payload = item["payload"]
            content = payload.get("content", "")
            bm25_score = bm25_lexical_score(query, content)
            candidates.append({
                "id": item["id"],
                "vector_score": item["score"],
                "bm25_score": bm25_score,
                "payload": payload
            })

        candidates.sort(key=lambda x: x["bm25_score"], reverse=True)
        lexical_rank_map = {item["id"]: idx + 1 for idx, item in enumerate(candidates)}

        hybrid_results = []
        for item in candidates:
            item_id = item["id"]
            v_rank = vector_rank_map.get(item_id, 999)
            l_rank = lexical_rank_map.get(item_id, 999)
            rrf = hybrid_rrf_score(v_rank, l_rank)

            payload = item["payload"]
            hybrid_results.append({
                "doc_id": payload.get("doc_id"),
                "chunk_id": payload.get("chunk_id"),
                "hybrid_rrf_score": rrf,
                "vector_score": item["vector_score"],
                "bm25_score": item["bm25_score"],
                "title": payload.get("title"),
                "content": payload.get("content"),
                "department": payload.get("department"),
                "source": payload.get("source"),
            })

        hybrid_results.sort(key=lambda x: x["hybrid_rrf_score"], reverse=True)
        return hybrid_results[:top_k]

    def answer_question(
        self,
        question: str,
        department: Optional[str] = None,
        top_k: int = 4
    ) -> Dict[str, Any]:
        """Executes full Hybrid RAG Q&A workflow."""
        relevant_passages = self.search_documents(query=question, top_k=top_k, department=department)

        qa_prompt = PromptManager.get_enterprise_qa_prompt(
            question=question,
            context_docs=relevant_passages,
            department=department
        )

        answer_text = self.llm_client.generate(
            prompt=qa_prompt,
            system_prompt=CHAT_SYSTEM_PROMPT
        )

        seen_docs = set()
        sources = []
        for p in relevant_passages:
            key = f"{p['title']}_{p['doc_id']}"
            if key not in seen_docs:
                seen_docs.add(key)
                sources.append({
                    "title": p["title"],
                    "doc_id": p["doc_id"],
                    "department": p["department"],
                    "source": p["source"],
                    "hybrid_relevance_score": p["hybrid_rrf_score"]
                })

        avg_confidence = round(
            sum(p["hybrid_rrf_score"] for p in relevant_passages) / max(1, len(relevant_passages)) * 50,
            2
        ) if relevant_passages else 0.0

        return {
            "question": question,
            "answer": answer_text,
            "department": department or "General Enterprise",
            "confidence_score": min(0.99, max(0.65, avg_confidence)),
            "sources": sources,
            "context_passages_retrieved": len(relevant_passages)
        }

    def _chunk_text(self, text: str, max_chunk_size: int = 450) -> List[str]:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""

        for p in paragraphs:
            if len(current_chunk) + len(p) <= max_chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + p
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = p

        if current_chunk:
            chunks.append(current_chunk)

        return chunks if chunks else [text]

    def _seed_default_enterprise_docs(self):
        docs = [
            {
                "title": "HELIX Enterprise Architecture & Governance Principles",
                "department": "Engineering",
                "source": "Architecture Board 2026",
                "content": (
                    "Enterprise systems must maintain strict architectural alignment. "
                    "Decisions must be documented using Architecture Decision Records (ADRs). "
                    "Microservices must adhere to standardized REST API schemas and event-driven patterns. "
                    "Unapproved deviations from standard stack frameworks constitute technical cognitive drift."
                )
            },
            {
                "title": "Organizational Alignment & Anti-Drift Guidelines",
                "department": "Executive Strategy",
                "source": "Corporate Strategy Group",
                "content": (
                    "Organizational Cognitive Drift is detected when department goals diverge from quarterly corporate objectives. "
                    "Every team lead must conduct bi-weekly strategic alignment reviews. "
                    "Knowledge silos must be actively broken by cross-indexing meeting minutes and project artifacts "
                    "into the HELIX Enterprise Knowledge Repository."
                )
            },
            {
                "title": "Product Delivery & Quality Assurance Standards",
                "department": "Product",
                "source": "Product Operations",
                "content": (
                    "Product specifications require clear acceptance criteria, security audit sign-offs, "
                    "and documented customer impact analysis prior to release sprint planning. "
                    "Failure to execute quality assurance loops degrades institutional memory and increases operational drift."
                )
            }
        ]

        for d in docs:
            self.add_document(
                title=d["title"],
                content=d["content"],
                department=d["department"],
                source=d["source"]
            )
