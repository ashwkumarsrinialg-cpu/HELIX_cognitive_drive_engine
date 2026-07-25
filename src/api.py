"""
api.py

FastAPI application exposing the Cognitive Drift Engine's analytics as
HTTP endpoints:

    GET /health   -> current Knowledge / Decision / Workflow Health
    GET /drift    -> current Knowledge / Workflow / Decision Drift
    GET /metrics  -> raw + aggregated metrics feeding health and drift
    GET /score    -> Enterprise Health Score (composite) — recommended
                      addition alongside the three endpoints from the
                      original spec, so the composite score has its own
                      stable route rather than being buried in /metrics

Run locally:
    pip install -r requirements.txt
    uvicorn api:app --reload

Then visit http://127.0.0.1:8000/docs for interactive API docs.

Data sourcing is currently mocked via analytics/sample_data.py — swap
those calls out for real queries against your knowledge graph, decision
log, and workflow log stores when they're available.
"""

from fastapi import FastAPI

from analytics.health import get_all_health_scores
from analytics.drift import get_all_drift_signals
from analytics.score import compute_enterprise_health_score
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
