"""
Rolling deployment strategy (default).
"""

from __future__ import annotations

from typing import Any, Optional

from ml_serve_core.deployment_strategies.base import DeploymentStrategy, DeploymentStrategyContext
from ml_serve_core.deployment_strategies.errors import DeploymentStrategyConfigError


class RollingDeploymentStrategy(DeploymentStrategy):
    """Standard Kubernetes rolling update strategy."""

    strategy_id = "rolling"

    def validate(self, config: Optional[dict[str, Any]], ctx: DeploymentStrategyContext) -> None:
        """
        Validate rolling strategy config.

        Accepts:
          - max_surge: int or percent string
          - max_unavailable: int or percent string
        """
        if not config:
            return
        for key in ("max_surge", "max_unavailable"):
            if key not in config:
                continue
            v = config[key]
            if isinstance(v, int):
                if v < 0:
                    raise DeploymentStrategyConfigError(f"{key} must be >= 0")
            elif isinstance(v, str):
                if v.endswith("%") and v[:-1].isdigit():
                    continue
                if v.isdigit():
                    continue
                raise DeploymentStrategyConfigError(f"{key} must be an int or percentage string like '10%'")
            else:
                raise DeploymentStrategyConfigError(f"{key} must be an int or percentage string like '10%'")

    def apply(
        self, values: dict[str, Any], config: Optional[dict[str, Any]], ctx: DeploymentStrategyContext
    ) -> dict[str, Any]:
        """
        Apply rolling strategy toggles/settings.

        - Ensures Flagger is disabled
        - Ensures Service is enabled
        - Optionally sets rollingUpdate knobs under `.Values.deployment.rollingUpdate`
        """
        values.setdefault("flagger", {})
        values["flagger"]["enabled"] = False

        values.setdefault("service", {})
        values["service"]["enabled"] = True

        if config:
            values.setdefault("deployment", {})
            values["deployment"].setdefault("rollingUpdate", {})
            if "max_surge" in config and config["max_surge"] is not None:
                values["deployment"]["rollingUpdate"]["maxSurge"] = config["max_surge"]
            if "max_unavailable" in config and config["max_unavailable"] is not None:
                values["deployment"]["rollingUpdate"]["maxUnavailable"] = config["max_unavailable"]

        return values

