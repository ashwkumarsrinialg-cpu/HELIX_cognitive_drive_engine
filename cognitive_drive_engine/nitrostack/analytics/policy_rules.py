"""
policy_rules.py

The set of enterprise OKR / policy rules that telemetry text is checked
against for Hybrid Drift Evaluation. Each rule pairs a human-readable
policy statement with the exact regex triggers that count as a hard,
deterministic violation of it.

Replace `sample_policy_rules()` with a real query against your policy /
OKR store when one exists — nothing outside this file needs to change.
"""

from dataclasses import dataclass, field
from typing import List


@dataclass
class PolicyRule:
    rule_id: str
    category: str
    rule_text: str
    regex_trigger_names: List[str] = field(default_factory=list)


def sample_policy_rules() -> List[PolicyRule]:
    return [
        PolicyRule(
            rule_id="POL-AUDIT-01",
            category="compliance",
            rule_text=(
                "SOC 2 Type II compliance requires quarterly access-control "
                "audits. Skipping, bypassing, or waiving a scheduled audit "
                "without Compliance sign-off is a policy violation."
            ),
            regex_trigger_names=["SOC2"],
        ),
        PolicyRule(
            rule_id="POL-SEC-02",
            category="security",
            rule_text=(
                "AWS credentials — secret keys, access tokens, or API keys — "
                "must never appear in plaintext telemetry, logs, chat "
                "exports, or code comments. All secrets must be stored in "
                "the managed secrets vault."
            ),
            regex_trigger_names=["AWS_SECRET_KEY", "GENERIC_API_KEY"],
        ),
        PolicyRule(
            rule_id="POL-PRIV-03",
            category="privacy",
            rule_text=(
                "Customer PII must be handled per GDPR Article 5 "
                "data-minimization principles. No personally identifiable "
                "data may leave the EU data boundary without an active "
                "Data Processing Agreement (DPA)."
            ),
            regex_trigger_names=["PII", "GDPR"],
        ),
        PolicyRule(
            rule_id="POL-PRICE-04",
            category="pricing",
            rule_text=(
                "Sales discounts of 30% or greater require VP-level "
                "approval per enterprise pricing policy. Reps may not "
                "verbally commit to a discount above policy threshold "
                "without written sign-off."
            ),
            regex_trigger_names=["DISCOUNT_THRESHOLD"],
        ),
    ]
