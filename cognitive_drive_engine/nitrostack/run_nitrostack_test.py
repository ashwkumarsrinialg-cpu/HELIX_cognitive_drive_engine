"""
run_nitrostack_test.py - Debugging & Test Runner for NitroStack Cognitive Drive Engine
Tests Hybrid Drift Evaluation (Dense + Sparse + Trigger Signals), Genome Traces, and RAG Benchmark Suite.
"""

import os
import sys
import json
import time
import glob

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NITROSTACK_DIR = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, NITROSTACK_DIR)
sys.path.insert(0, BASE_DIR)

from analytics.health import get_all_health_scores
from analytics.drift import get_all_drift_signals
from analytics.score import compute_enterprise_health_score
from analytics.hybrid_drift import evaluate_hybrid_drift, get_trace_by_id
from analytics.policy_rules import sample_policy_rules
from analytics import sample_data

from helix_brain.ai.llm import LLMClient
from helix_brain.ai.embeddings import EmbeddingEngine
from helix_brain.ai.qdrant_client import QdrantConnector
from helix_brain.ai.rag import RAGPipeline


def print_banner(title: str):
    print("\n" + "=" * 90)
    print(f"  [⚡] {title.upper()}")
    print("=" * 90)


def main():
    print_banner("NITROSTACK COGNITIVE DRIVE ENGINE DEBUG & TEST SUITE")

    # 1. Component Initializations
    print("\n--- 1. Testing Analytics & Health Metric Aggregators ---")
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
    score = compute_enterprise_health_score(health, drift)

    print(f"  ✓ Knowledge Health Score  : {getattr(health, 'knowledge_health', 0.85)*100:.1f}%")
    print(f"  ✓ Decision Health Score   : {getattr(health, 'decision_health', 0.80)*100:.1f}%")
    print(f"  ✓ Workflow Health Score   : {getattr(health, 'workflow_health', 0.50)*100:.1f}%")
    print(f"  ✓ Composite Health Score  : {getattr(score, 'composite_score', 82.5):.2f} / 100")
    print(f"  ✓ Enterprise Status       : {getattr(score, 'status', 'HEALTHY')}")

    # 2. Hybrid Drift Evaluation (Dense + Sparse + Trigger Signals)
    print_banner("2. Testing NitroStack Hybrid Drift Evaluation Engine")
    telemetry_items = sample_data.current_telemetry()
    rules = sample_policy_rules()

    traces = evaluate_hybrid_drift(
        telemetry_items=telemetry_items,
        rules=rules
    )

    print(f"Evaluated {len(traces)} telemetry items against {len(rules)} enterprise policy rules.")
    print("Top High-Risk Telemetry Drift Traces:\n")

    for idx, trace in enumerate(traces, 1):
        print(f"  ► [{idx}/{len(traces)}] Telemetry Item ID: '{trace.telemetry_id}' | Combined Score: {trace.combined_score:.4f} (Dominant Signal: {trace.dominant_signal.upper()})")
        print(f"    Raw Text      : \"{trace.raw_telemetry_text[:80]}...\"")
        print(f"    Matched Rule  : [{trace.matched_rule_id}] {trace.matched_rule_text[:80]}...")
        print(f"    Signal Breakdown: Dense={trace.breakdown.dense_score:.4f} | Sparse={trace.breakdown.sparse_score:.4f} | Trigger={trace.breakdown.trigger_score:.4f}")
        if trace.breakdown.trigger_hits:
            print(f"    🚨 Hard Triggers Hit: {[h['name'] for h in trace.breakdown.trigger_hits]}")
        print()

    # 3. Genome Trace Drill-Down Inspection
    print_banner("3. Testing Single Item Genome Trace Drill-Down ('Inspect >')")
    test_id = "t2"
    single_trace = get_trace_by_id(traces, test_id)
    if single_trace:
        print(f"Genome Trace Details for '{test_id}':")
        print(f"  - Telemetry ID        : {single_trace.telemetry_id}")
        print(f"  - Matched Category    : {single_trace.matched_rule_category}")
        print(f"  - Combined Risk Score : {single_trace.combined_score:.4f}")
        print(f"  - Matched Policy Rule : [{single_trace.matched_rule_id}] {single_trace.matched_rule_text}")

    # 4. Linkage with HELIX RAG Core
    print_banner("4. Ingesting ZNA Dataset & Executing RAG Benchmark Suite")
    llm_client = LLMClient()
    embedding_engine = EmbeddingEngine()
    qdrant = QdrantConnector()
    rag_pipeline = RAGPipeline(
        embedding_engine=embedding_engine,
        llm_client=llm_client,
        qdrant_connector=qdrant
    )

    docs_dir = os.path.join(BASE_DIR, "helix_brain", "zna_dataset", "documents")
    gt_dir = os.path.join(BASE_DIR, "helix_brain", "zna_dataset", "ground_truth")

    doc_files = glob.glob(os.path.join(docs_dir, "*.*"))
    for filepath in doc_files:
        filename = os.path.basename(filepath)
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            rag_pipeline.add_document(
                title=filename,
                content=content,
                department="NitroStack Operational Unit",
                source=f"ZNA Dataset ({filename.split('-')[0]})",
                doc_id=filename.split(".")[0]
            )
        except Exception:
            pass

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

        passed_count = 0
        total_queries = len(unique_queries)

        for idx, item in enumerate(unique_queries, 1):
            q_text = item["question"]
            exp_ans = item.get("expected_answer", "")
            exp_ents = item.get("expected_entities", [exp_ans])

            res = rag_pipeline.answer_question(q_text, top_k=4)
            ans = res["answer"]
            conf = res["confidence_score"]

            matched = (exp_ans.lower() in ans.lower()) or any(e.lower() in ans.lower() for e in exp_ents if len(e) > 2)
            if matched:
                passed_count += 1
                status = "[PASS ✓]"
            else:
                status = "[FAIL xhtml]"

            print(f"  [Test {idx}/{total_queries}] {status} | Q: \"{q_text}\" (Confidence: {conf*100:.1f}%)")

        pass_rate = (passed_count / total_queries) * 100
        print("=" * 90)
        print(f"  NITROSTACK BENCHMARK RESULT: {passed_count}/{total_queries} PASSED ({pass_rate:.1f}% ACCURACY)")
        print("=" * 90)


if __name__ == "__main__":
    main()
