"""
api.py

FastAPI application exposing the Cognitive Drift Engine's analytics as
HTTP endpoints:

    GET /health              -> current Knowledge / Decision / Workflow Health
    GET /drift               -> current Knowledge / Workflow / Decision Drift
    GET /metrics             -> raw + aggregated metrics feeding health and drift
    GET /score               -> Enterprise Health Score (composite) — recommended
                                 addition alongside the three endpoints from the
                                 original spec, so the composite score has its own
                                 stable route rather than being buried in /metrics
    GET /drift/hybrid        -> Hybrid Drift Evaluation: dense (semantic) +
                                 sparse (BM25/regex) scoring of raw telemetry
                                 text against enterprise OKR/policy rules,
                                 sorted highest-risk first
    GET /drift/hybrid/{id}   -> Genome Trace for one telemetry item — the
                                 side-by-side raw text vs. matched policy
                                 rule text plus the full signal breakdown,
                                 for the "Inspect >" drill-down view

Run locally:
    pip install -r requirements.txt
    uvicorn api:app --reload

Then visit http://127.0.0.1:8000/docs for interactive API docs.

Data sourcing is currently mocked via analytics/sample_data.py — swap
those calls out for real queries against your knowledge graph, decision
log, and workflow log stores when they're available.
"""

from fastapi import FastAPI, HTTPException

from analytics.health import get_all_health_scores
from analytics.drift import get_all_drift_signals
from analytics.score import compute_enterprise_health_score
from analytics.hybrid_drift import evaluate_hybrid_drift, get_trace_by_id
from analytics.policy_rules import sample_policy_rules
from analytics import sample_data

app = FastAPI(
    title="HELIX Cognitive Drift Engine",
    description=(
        "Analytics API for enterprise cognitive health and drift detection. "
        "Part of the HELIX Enterprise Cognitive Genome Platform."
    ),
    version="0.1.0",
)


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
    return _load_health()


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


def _load_hybrid_drift():
    return evaluate_hybrid_drift(
        telemetry_items=sample_data.current_telemetry(),
        rules=sample_policy_rules(),
    )


@app.get(
    "/drift/hybrid",
    summary="Hybrid Drift Evaluation (dense + sparse RAG scoring)",
)
def get_hybrid_drift():
    """Scores every current telemetry item against the enterprise
    OKR/policy rule set using dense (semantic embedding) retrieval
    fused with sparse (BM25 + regex hard-trigger) retrieval, returned
    sorted highest-risk first."""
    return _load_hybrid_drift()


@app.get(
    "/drift/hybrid/{telemetry_id}",
    summary="Genome Trace for one telemetry item ('Inspect >' drill-down)",
)
def get_genome_trace(telemetry_id: str):
    """Returns the side-by-side raw telemetry text vs. the exact policy
    rule text it was scored against, plus the full dense/sparse/trigger
    signal breakdown — everything the 'Inspect >' card needs to explain
    why a given drift score is what it is."""
    traces = _load_hybrid_drift()
    trace = get_trace_by_id(traces, telemetry_id)
    if trace is None:
        raise HTTPException(
            status_code=404,
            detail=f"No Genome Trace found for telemetry_id='{telemetry_id}'",
        )
    return trace