"""
HELIX Enterprise Cognitive Genome Platform - ZNA Dataset Evaluation & Benchmark Script
Runs full ingestion and benchmark evaluations across the ZNA Enterprise Dataset.
"""

import json
import os
import sys
import time
import glob

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai.llm import LLMClient
from ai.embeddings import EmbeddingEngine
from ai.qdrant_client import QdrantConnector
from ai.drift_engine import CognitiveDriftEngine
from ai.recommendations import AntiDriftRecommendationEngine
from ai.rag import RAGPipeline


def print_banner(title: str):
    print("\n" + "=" * 80)
    print(f"  [+] {title.upper()}")
    print("=" * 80)


def main():
    print_banner("HELIX ZNA Enterprise Dataset Execution & Benchmark Runner")

    dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "zna_dataset")
    docs_dir = os.path.join(dataset_dir, "documents")
    gt_dir = os.path.join(dataset_dir, "ground_truth")

    if not os.path.exists(docs_dir):
        print(f"❌ Error: ZNA dataset directory not found at '{docs_dir}'")
        return

    # 1. Initialize HELIX Engine
    print("\n--- 1. Initializing HELIX Platform Components ---")
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

    # 2. Ingest ZNA Enterprise Documents
    print_banner("2. Ingesting ZNA Enterprise Documents into Vector Store")
    doc_files = glob.glob(os.path.join(docs_dir, "*.*"))
    print(f"Found {len(doc_files)} enterprise documents in dataset.")

    start_time = time.time()
    ingested_count = 0
    for i, filepath in enumerate(doc_files, 1):
        filename = os.path.basename(filepath)
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            # Determine department/category from filename
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
            ingested_count += 1
            if i % 50 == 0 or i == len(doc_files):
                print(f"  [+] Progress: Ingested {i}/{len(doc_files)} documents...")
        except Exception as e:
            print(f"  [!] Failed to ingest {filename}: {e}")

    elapsed = time.time() - start_time
    print(f"\n[OK] Successfully indexed {ingested_count} documents into Qdrant in {elapsed:.2f} seconds.")
    print(f"[OK] Total Vector Passages Stored: {qdrant.count()}")

    # 3. Process Ground Truth Drift Events
    print_banner("3. Evaluating Ground Truth Organizational Drift Events")
    drift_events_path = os.path.join(gt_dir, "drift_events.json")
    if os.path.exists(drift_events_path):
        with open(drift_events_path, "r", encoding="utf-8") as f:
            drift_events = json.load(f)

        for event in drift_events:
            print(f"\n  ► Event ID: {event.get('id')} | Name: '{event.get('name')}'")
            print(f"    Type: {event.get('type')}")
            print(f"    Description: {event.get('description')}")
            
            diagnostic = drift_engine.evaluate_drift(
                department="ZNA Enterprise Unit",
                signals=[event.get("description")],
                timeframe="ZNA Benchmark Period"
            )
            diag_dict = diagnostic.to_dict()
            print(f"    [Diagnostic] Drift Score: {diag_dict['cognitive_drift_score']} | Status: {diag_dict['alignment_status']}")

            plan = recommendation_engine.generate_plan(
                department="ZNA Enterprise Unit",
                drift_score=diag_dict['cognitive_drift_score'],
                issues=event.get("entities", [])
            )
            print(f"    [Anti-Drift RAP] Generated {len(plan.recommendations)} Realignment Action Plan(s).")
            if plan.recommendations:
                rec = plan.recommendations[0]
                print(f"      - RAP-01 ({rec.get('priority')}): {rec.get('title')}")

    # 4. Benchmark Queries Evaluation
    print_banner("4. Evaluating Benchmark RAG Q&A Queries")
    queries_path = os.path.join(gt_dir, "benchmark_queries.json")
    if os.path.exists(queries_path):
        with open(queries_path, "r", encoding="utf-8") as f:
            queries = json.load(f)

        # Select representative distinct queries
        seen_q = set()
        distinct_queries = []
        for q in queries:
            if q["question"] not in seen_q:
                seen_q.add(q["question"])
                distinct_queries.append(q)

        print(f"Loaded {len(queries)} benchmark queries ({len(distinct_queries)} unique test questions).")

        correct_count = 0
        total_eval = min(10, len(distinct_queries))
        
        for idx, item in enumerate(distinct_queries[:total_eval], 1):
            q_text = item["question"]
            exp_ans = item.get("expected_answer", "")
            diff = item.get("difficulty", "General")

            print(f"\n  [Test {idx}/{total_eval}] Difficulty: {diff}")
            print(f"  Q: \"{q_text}\"")
            print(f"  Expected Entity/Answer: '{exp_ans}'")

            res = rag_pipeline.answer_question(q_text, top_k=4)
            ans = res["answer"]

            # Match verification
            matched = any(e.lower() in ans.lower() for e in item.get("expected_entities", [exp_ans])) or (exp_ans.lower() in ans.lower())
            if matched:
                correct_count += 1
                status_str = "[PASS ✓]"
            else:
                status_str = "[FAIL ✗]"

            print(f"  Result: {status_str} (Confidence: {res['confidence_score']*100:.1f}%)")
            print(f"  Sources Retrieved ({len(res['sources'])}): {[s['title'] for s in res['sources'][:2]]}")

        pass_rate = (correct_count / total_eval) * 100
        print(f"\n" + "=" * 80)
        print(f"  BENCHMARK RESULTS: {correct_count}/{total_eval} Passed ({pass_rate:.1f}% Accuracy)")
        print("=" * 80)


if __name__ == "__main__":
    main()
