"""
sample_data.py

Mock data providers so the Cognitive Drift Engine API is runnable and
testable standalone, without a live knowledge graph / decision log /
workflow log backing it yet.

Replace each function body with a real query against your actual data
stores once they exist. Nothing outside this file should need to change
when you do that swap — health.py, drift.py, and score.py only depend on
the GraphSnapshot / DecisionRecord / WorkflowRecord shapes, not on how
they were produced.
"""

from typing import List

from .metrics import GraphSnapshot, DecisionRecord, WorkflowRecord


def current_snapshot() -> GraphSnapshot:
    return GraphSnapshot(
        total_nodes=1000,
        stale_nodes=80,
        contradictory_nodes=40,
        covered_domains=17,
        expected_domains=20,
    )


def baseline_snapshot() -> GraphSnapshot:
    return GraphSnapshot(
        total_nodes=950,
        stale_nodes=60,
        contradictory_nodes=25,
        covered_domains=17,
        expected_domains=20,
    )


def current_decisions() -> List[DecisionRecord]:
    return [
        DecisionRecord("d1", aligned_with_policy=True),
        DecisionRecord("d2", aligned_with_policy=True),
        DecisionRecord("d3", aligned_with_policy=False),
        DecisionRecord("d4", aligned_with_policy=True),
        DecisionRecord("d5", aligned_with_policy=True),
    ]


def baseline_decisions() -> List[DecisionRecord]:
    return [
        DecisionRecord("d0a", aligned_with_policy=True),
        DecisionRecord("d0b", aligned_with_policy=True),
        DecisionRecord("d0c", aligned_with_policy=True),
    ]


def current_workflows() -> List[WorkflowRecord]:
    return [
        WorkflowRecord("w1", conforms_to_pattern=True),
        WorkflowRecord("w2", conforms_to_pattern=False),
        WorkflowRecord("w3", conforms_to_pattern=False),
        WorkflowRecord("w4", conforms_to_pattern=True),
    ]


def baseline_workflows() -> List[WorkflowRecord]:
    return [
        WorkflowRecord("w0a", conforms_to_pattern=True),
        WorkflowRecord("w0b", conforms_to_pattern=True),
        WorkflowRecord("w0c", conforms_to_pattern=True),
        WorkflowRecord("w0d", conforms_to_pattern=True),
    ]
