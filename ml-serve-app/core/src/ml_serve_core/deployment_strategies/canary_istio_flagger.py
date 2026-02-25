"""
Canary deployment strategy using Flagger with Istio as the traffic router.
"""

from __future__ import annotations

from typing import Any, Optional

from ml_serve_core.constants.constants import ISTIO_SERVICE_NAME
from ml_serve_core.deployment_strategies.base import DeploymentStrategy, DeploymentStrategyContext
from ml_serve_core.deployment_strategies.errors import (
    DeploymentStrategyConfigError,
    DeploymentStrategyPrerequisiteError,
)


class CanaryIstioFlaggerDeploymentStrategy(DeploymentStrategy):
    """Progressive delivery using Flagger + Istio."""

    strategy_id = "canary"

    def validate(self, config: Optional[dict[str, Any]], ctx: DeploymentStrategyContext) -> None:
        """
        Validate canary strategy config and prerequisites.

        Prerequisite:
            - Istio support enabled in control-plane config (ENABLE_ISTIO=true).
        """
        if not ctx.istio_enabled:
            raise DeploymentStrategyPrerequisiteError(
                "Canary strategy requires Istio/Flagger support. Set ENABLE_ISTIO=true and ensure Flagger is installed."
            )

        if not config:
            return

        def _require_int_in_range(key: str, lo: int, hi: int) -> None:
            v = config.get(key)
            if v is None:
                return
            if not isinstance(v, int):
                raise DeploymentStrategyConfigError(f"{key} must be an integer")
            if v < lo or v > hi:
                raise DeploymentStrategyConfigError(f"{key} must be between {lo} and {hi}")

        _require_int_in_range("threshold", 1, 1000)
        _require_int_in_range("max_weight", 1, 100)
        _require_int_in_range("step_weight", 1, 100)
        _require_int_in_range("progress_deadline_seconds", 1, 86400)

        max_weight = config.get("max_weight")
        step_weight = config.get("step_weight")
        if isinstance(max_weight, int) and isinstance(step_weight, int) and step_weight > max_weight:
            raise DeploymentStrategyConfigError("step_weight must be <= max_weight")

        metrics = config.get("metrics")
        if metrics is None:
            return
        if not isinstance(metrics, list):
            raise DeploymentStrategyConfigError("metrics must be a list")
        for idx, m in enumerate(metrics):
            if not isinstance(m, dict):
                raise DeploymentStrategyConfigError(f"metrics[{idx}] must be an object")
            if not m.get("name"):
                raise DeploymentStrategyConfigError(f"metrics[{idx}].name is required")
            tr_max = m.get("threshold_max")
            if tr_max is None or not isinstance(tr_max, (int, float)):
                raise DeploymentStrategyConfigError(f"metrics[{idx}].threshold_max must be a number")

    def apply(
        self, values: dict[str, Any], config: Optional[dict[str, Any]], ctx: DeploymentStrategyContext
    ) -> dict[str, Any]:
        """
        Apply canary strategy toggles/settings.

        - Enables Flagger and disables the base Service (Flagger manages services/traffic).
        - Maps config into `.Values.flagger.*` keys expected by the chart.
        """
        values.setdefault("flagger", {})
        values["flagger"]["enabled"] = True
        values["flagger"].setdefault("type", "canary")

        # In canary mode, let Flagger own the traffic-shaping services.
        values.setdefault("service", {})
        values["service"]["enabled"] = False

        # Route ingress through Istio ingress gateway so Flagger/Istio can do traffic shifting.
        values.setdefault("ingressInt", {})
        ingress_int_service = values["ingressInt"].get("serviceName")
        if not ingress_int_service or ingress_int_service == "ISTIO_SERVICE_NAME":
            values["ingressInt"]["serviceName"] = ISTIO_SERVICE_NAME
        if "ingressExt" in values:
            values.setdefault("ingressExt", {})
            ingress_ext_service = values["ingressExt"].get("serviceName")
            if not ingress_ext_service or ingress_ext_service == "ISTIO_SERVICE_NAME":
                values["ingressExt"]["serviceName"] = ISTIO_SERVICE_NAME

        cfg = config or {}
        if "interval" in cfg and cfg["interval"] is not None:
            values["flagger"]["interval"] = cfg["interval"]
        if "threshold" in cfg and cfg["threshold"] is not None:
            values["flagger"]["threshold"] = cfg["threshold"]
        if "max_weight" in cfg and cfg["max_weight"] is not None:
            values["flagger"]["maxWeight"] = cfg["max_weight"]
        if "step_weight" in cfg and cfg["step_weight"] is not None:
            values["flagger"]["stepWeight"] = cfg["step_weight"]
        if "progress_deadline_seconds" in cfg and cfg["progress_deadline_seconds"] is not None:
            values["flagger"]["progressDeadlineSeconds"] = cfg["progress_deadline_seconds"]
        if "skip_analysis" in cfg and cfg["skip_analysis"] is not None:
            values["flagger"]["skipAnalysis"] = bool(cfg["skip_analysis"])

        metrics = cfg.get("metrics")
        if metrics:
            values["flagger"]["metrics"] = [
                {
                    "name": m["name"],
                    "thresholdRange": {"max": m["threshold_max"]},
                    "interval": m.get("interval", "1m"),
                }
                for m in metrics
            ]

        return values

