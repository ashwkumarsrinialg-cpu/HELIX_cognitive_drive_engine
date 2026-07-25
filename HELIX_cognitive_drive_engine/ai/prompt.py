"""
HELIX: Advanced Enterprise Cognitive Genome Platform - Prompt Templates & Management Module
"""

import json
from typing import Dict, Any, List, Optional


SYSTEM_COGNITIVE_GENOME_PROMPT = """
You are HELIX, the Enterprise Cognitive Genome Platform—an advanced cognitive intelligence system engineered to model, detect, and prevent Organizational Cognitive Drift.

Organizational Cognitive Drift is the systematic divergence of team mental models, operational habits, decision frameworks, and institutional knowledge from core enterprise strategic baselines over time.

Core Operational Directives:
1. Maintain objective, data-backed evaluations of team alignment across 4 Cognitive Dimensions:
   - Strategic Horizon Alignment (Vision & Objectives)
   - Process & Protocol Consistency (ADR & Methodological Rigor)
   - Conceptual Cohesion (Domain Terminology & Mental Models)
   - Institutional Memory Retention (Knowledge Decay & Silo Prevention)
2. Use Chain-of-Thought reasoning to identify root causes of conceptual and operational drift.
3. Deliver high-impact, prioritized anti-drift recommendations with measurable alignment targets.
4. Synthesize enterprise knowledge strictly using verified RAG documents with explicit source citations.
""".strip()


COGNITIVE_DRIFT_PROMPT = """
Perform an Advanced Multi-Dimensional Cognitive Drift Diagnostic on the following enterprise unit.

Department/Team: {department}
Timeframe: {timeframe}

Telemetry Logs & Operational Signals:
{signals}

Enterprise Baseline Genome & Governance Blueprint:
{blueprint}

Execute a step-by-step diagnostic evaluation and output a JSON object adhering to this exact schema:
{{
  "department": "{department}",
  "cognitive_drift_score": <float 0.0 (perfect alignment) to 1.0 (critical drift)>,
  "alignment_status": "<OPTIMAL | LOW_DRIFT | MODERATE_DRIFT | CRITICAL_DRIFT>",
  "drift_dimensions": {{
    "strategic_alignment": <float 0.0 to 1.0>,
    "process_consistency": <float 0.0 to 1.0>,
    "conceptual_cohesion": <float 0.0 to 1.0>,
    "knowledge_retention": <float 0.0 to 1.0>
  }},
  "drift_acceleration": <float -1.0 (improving) to +1.0 (rapidly worsening)>,
  "root_causes": [
    "<detailed root cause 1>",
    "<detailed root cause 2>"
  ],
  "affected_workflows": [
    "<workflow 1>",
    "<workflow 2>"
  ],
  "risk_assessment": "<executive risk evaluation of unmitigated drift>",
  "summary": "<comprehensive diagnostic summary>"
}}
""".strip()


RECOMMENDATION_PROMPT = """
As HELIX Enterprise Cognitive Engine, generate an Anti-Drift Realignment Action Plan (RAP) for the target department.

Department: {department}
Current Cognitive Drift Score: {drift_score}
Key Misalignment Vectors: {issues}

Enterprise Knowledge Baseline & Policies:
{context}

Produce a structured JSON response matching this schema:
{{
  "department": "{department}",
  "drift_score": {drift_score},
  "executive_summary": "<strategic realignment summary>",
  "target_alignment_score": <projected drift score post-remediation>,
  "recommendations": [
    {{
      "id": "<RAP-01>",
      "category": "<STRATEGIC_REALIGNMENT | PROCESS_STANDARDIZATION | KNOWLEDGE_REINFORCEMENT | GOVERNANCE_SYNC>",
      "priority": "<CRITICAL | HIGH | MEDIUM | LOW>",
      "title": "<actionable title>",
      "description": "<detailed implementation steps>",
      "expected_impact": "<quantified alignment outcome>",
      "effort_level": "<LOW | MEDIUM | HIGH>",
      "estimated_roi_weeks": <number of weeks to measure impact>
    }}
  ]
}}
""".strip()


ENTERPRISE_QA_PROMPT = """
You are answering an enterprise inquiry using HELIX Hybrid RAG Context.

User Question: {question}
Department/Domain: {department}

Retrieved Institutional Knowledge & Document Passages:
{context}

Directives:
1. Provide a comprehensive, authoritative, executive-ready response grounded exclusively in the provided document passages.
2. Formally cite sources using the format `[Source: Title (Doc ID)]`.
3. If document sources contain conflicting policies or evidence of historical cognitive drift, explicitly call out the discrepancy.
4. Conclude with a concise "Key Governance Takeaways" section.
""".strip()


CHAT_SYSTEM_PROMPT = """
You are HELIX Enterprise Conversational Assistant, the interactive interface to the Enterprise Cognitive Genome Platform.
You assist employees, team leads, and executive leaders in navigating enterprise knowledge, understanding team alignment, preventing organizational cognitive drift, and adhering to organizational best practices.
Always provide structured, clear, and professional guidance.
""".strip()


class PromptManager:
    """Manages prompt template construction and variable injection for HELIX."""

    @staticmethod
    def get_drift_detection_prompt(
        department: str,
        signals: List[str],
        timeframe: str = "Last 30 Days",
        blueprint: Optional[str] = None
    ) -> str:
        formatted_signals = "\n".join(f"- {s}" for s in signals) if signals else "No specific telemetry logs attached."
        default_blueprint = (
            "Enterprise Baseline Blueprint: Unified strategic vision, quarterly review synchronization, "
            "mandatory Architecture Decision Records (ADRs), standard documentation, active cross-department knowledge sharing."
        )
        return COGNITIVE_DRIFT_PROMPT.format(
            department=department,
            timeframe=timeframe,
            signals=formatted_signals,
            blueprint=blueprint or default_blueprint,
        )

    @staticmethod
    def get_recommendation_prompt(
        department: str,
        drift_score: float,
        issues: List[str],
        context: str = ""
    ) -> str:
        formatted_issues = ", ".join(issues) if issues else "General mental model variance."
        return RECOMMENDATION_PROMPT.format(
            department=department,
            drift_score=drift_score,
            issues=formatted_issues,
            context=context or "Standard Enterprise Operating Framework 2026",
        )

    @staticmethod
    def get_enterprise_qa_prompt(
        question: str,
        context_docs: List[Dict[str, Any]],
        department: Optional[str] = "General Enterprise"
    ) -> str:
        if not context_docs:
            context_text = "No matching institutional documentation found in vector memory."
        else:
            doc_texts = []
            for i, doc in enumerate(context_docs, 1):
                title = doc.get("title", doc.get("metadata", {}).get("title", f"Doc {i}"))
                source = doc.get("source", doc.get("metadata", {}).get("source", "Internal Knowledge Base"))
                doc_id = doc.get("doc_id", f"ID-{i}")
                content = doc.get("content", doc.get("page_content", str(doc)))
                doc_texts.append(f"--- PASSAGE [{i}]: {title} (Doc ID: {doc_id} | Source: {source}) ---\n{content}")
            context_text = "\n\n".join(doc_texts)

        return ENTERPRISE_QA_PROMPT.format(
            question=question,
            department=department,
            context=context_text,
        )
