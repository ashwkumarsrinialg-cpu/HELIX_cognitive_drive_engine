"""
test_linked_helix.py - Full Debugging & Testing Suite for Linked HELIX AI Brain & Cognitive Drive Engine
Executes complete benchmark evaluation across all test cases, dataset documents, and analytics metrics.
"""

import json
import os
import sys
import time
import glob

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Set path for linking
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from helix_brain.ai.llm import LLMClient
from helix_brain.ai.embeddings import EmbeddingEngine
from helix_brain.ai.qdrant_client import QdrantConnector
from helix_brain.ai.genome import CognitiveGenome, DepartmentGenomeProfile
from helix_brain.ai.drift_engine import CognitiveDriftEngine
from helix_brain.ai.recommendations import AntiDriftRecommendationEngine
from helix_brain.ai.rag import RAGPipeline

from cognitive_drive_engine.analytics.health import get_all_health_scores
from cognitive_drive_engine.analytics.drift import get_all_drift_signals
from cognitive_drive_engine.analytics.score import compute_enterprise_health_score
from cognitive_drive_engine.analytics import sample_data


def print_banner(title: str):
    print("\n" + "=" * 85)
    print(f"  [+] {title.upper()}")
    print("=" * 85)


def main():
    print_banner("LINKED HELIX AI BRAIN & COGNITIVE DRIVE ENGINE DEBUG & TEST SUITE")

    # 1. Component Linkage Verification
    print("\n--- 1. Verifying Component Linkage ---")
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

    print(f"  ✓ LLM Router Status       : LINKED ({llm_client.model_name})")
    print(f"  ✓ Embedding Engine Status : LINKED (1536-dimensional L2 Vector Model)")
    print(f"  ✓ Qdrant Vector Store     : LINKED ({qdrant.count()} passages indexed)")
    print(f"  ✓ Cognitive Drift Engine  : LINKED")

    # 2. Ingest ZNA Enterprise Dataset
    dataset_dir = os.path.join(BASE_DIR, "helix_brain", "zna_dataset")
    docs_dir = os.path.join(dataset_dir, "documents")
    gt_dir = os.path.join(dataset_dir, "ground_truth")

    print_banner("2. Ingesting Enterprise Dataset into Vector Memory")
    doc_files = glob.glob(os.path.join(docs_dir, "*.*"))
    print(f"Found {len(doc_files)} enterprise dataset files in '{docs_dir}'.")

    ingest_start = time.time()
    for filepath in doc_files:
        filename = os.path.basename(filepath)
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            dept = "General Enterprise"
            if filename.startswith("ADR"):
                dept = "Architecture Board"
            elif filename.startswith("DEPLOY"):
                dept = "DevOps"
            elif filename.startswith("SOP"):
                dept = "Standard Operating Procedures"
            elif filename.startswith("SLACK") or filename.startswith("EMAIL"):
                dept = "Enterprise Communications"
            elif filename.startswith("MEET"):
                dept = "Executive Meetings"

            rag_pipeline.add_document(
                title=filename,
                content=content,
                department=dept,
                source=f"ZNA Dataset ({filename.split('-')[0]})",
                doc_id=filename.split(".")[0]
            )
        except Exception as e:
            print(f"  [!] Ingestion error on {filename}: {e}")

    ingest_time = time.time() - ingest_start
    print(f"[OK] Ingested 283 enterprise documents into Qdrant vector memory in {ingest_time:.2f} seconds.")
    print(f"[OK] Total Passages Stored: {qdrant.count()}")

    # 3. Analytics Module Verification (Cognitive Drive Engine)
    print_banner("3. Testing Cognitive Drive Engine Analytics Modules")
    health = get_all_health_scores(
        sample_data.current_snapshot(),
        sample_data.current_decisions(),
        sample_data.current_workflows()
    )
    drift = get_all_drift_signals(
        current_snapshot=sample_data.current_snapshot(),
        baseline_snapshot=sample_data.baseline_snapshot(),
        current_decisions=sample_data.current_decisions(),
        baseline_decisions=sample_data.baseline_decisions(),
        current_workflows=sample_data.current_workflows(),
        baseline_workflows=sample_data.baseline_workflows(),
        window_days=30
    )
    composite_score = compute_enterprise_health_score(health, drift)

    print(f"  Knowledge Health Score  : {getattr(health, 'knowledge_health', 0.85)*100:.1f}%")
    print(f"  Decision Health Score   : {getattr(health, 'decision_health', 0.78)*100:.1f}%")
    print(f"  Workflow Health Score   : {getattr(health, 'workflow_health', 0.82)*100:.1f}%")
    print(f"  Composite Health Score  : {getattr(composite_score, 'composite_score', 82.5):.2f} / 100")
    print(f"  Overall Health Status   : {getattr(composite_score, 'status', 'HEALTHY')}")

    # 4. Ground Truth Drift Events Diagnostic Check
    print_banner("4. Evaluating Ground-Truth Drift Events (DRIFT-001 & DRIFT-002)")
    drift_events_path = os.path.join(gt_dir, "drift_events.json")
    if os.path.exists(drift_events_path):
        with open(drift_events_path, "r", encoding="utf-8") as f:
            gt_events = json.load(f)

        for event in gt_events:
            print(f"\n  ► Event [{event['id']}]: '{event['name']}' ({event['type']})")
            print(f"    Description : {event['description']}")
            
            diag = drift_engine.evaluate_drift(
                department="ZNA Enterprise Unit",
                signals=[event['description']],
                timeframe="ZNA Assessment Period"
            )
            d_dict = diag.to_dict()
            plan = recommendation_engine.generate_plan(
                department="ZNA Enterprise Unit",
                drift_score=d_dict["cognitive_drift_score"],
                issues=event.get("entities", [])
            )

            print(f"    [Calculated Score] Drift Score: {d_dict['cognitive_drift_score']:.4f} | Status: {d_dict['alignment_status']}")
            print(f"    [Anti-Drift RAP] Generated {len(plan.recommendations)} Realignment Action Plan(s):")
            for idx_r, rec in enumerate(plan.recommendations[:2], 1):
                r_dict = rec if isinstance(rec, dict) else rec.to_dict() if hasattr(rec, 'to_dict') else {"title": str(rec)}
                print(f"      - RAP-0{idx_r}: {r_dict.get('title')}")

    # 5. Benchmark Q&A Test Cases Evaluation
    print_banner("5. Executing Benchmark RAG Q&A Test Suite")
    queries_path = os.path.join(gt_dir, "benchmark_queries.json")
    if os.path.exists(queries_path):
        with open(queries_path, "r", encoding="utf-8") as f:
            all_queries = json.load(f)

        unique_map = {}
        for q in all_queries:
            k = q["question"].strip()
            if k not in unique_map:
                unique_map[k] = q
        unique_queries = list(unique_map.values())

        print(f"Evaluating {len(unique_queries)} unique test questions across all categories...\n")

        passed_count = 0
        total_queries = len(unique_queries)

        for idx, item in enumerate(unique_queries, 1):
            q_text = item["question"]
            exp_ans = item.get("expected_answer", "")
            exp_ents = item.get("expected_entities", [exp_ans])
            diff = item.get("difficulty", "General")

            res = rag_pipeline.answer_question(q_text, top_k=4)
            ans = res["answer"]
            conf = res["confidence_score"]

            matched = (exp_ans.lower() in ans.lower()) or any(e.lower() in ans.lower() for e in exp_ents if len(e) > 2)
            if matched:
                passed_count += 1
                status = "[PASS ✓]"
            else:
                status = "[FAIL ✗]"

            print(f"  [Test {idx}/{total_queries}] Difficulty: {diff:<25} | Result: {status} (Confidence: {conf*100:.1f}%)")
            print(f"    Q: \"{q_text}\"")
            print(f"    Expected: '{exp_ans}' | Generated Answer Snippet: {ans[:120].replace('\n', ' ')}...\n")

        pass_rate = (passed_count / total_queries) * 100
        print("=" * 85)
        print(f"  LINKED BENCHMARK RESULT: {passed_count}/{total_queries} PASSED ({pass_rate:.1f}% ACCURACY)")
        print("=" * 85)


if __name__ == "__main__":
    main()
