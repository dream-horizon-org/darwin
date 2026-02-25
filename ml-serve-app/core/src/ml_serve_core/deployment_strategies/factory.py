"""
Factory for resolving deployment strategies by identifier.
"""

from __future__ import annotations

from typing import Optional

from ml_serve_core.deployment_strategies.base import DeploymentStrategy
from ml_serve_core.deployment_strategies.canary_istio_flagger import CanaryIstioFlaggerDeploymentStrategy
from ml_serve_core.deployment_strategies.errors import UnsupportedDeploymentStrategyError
from ml_serve_core.deployment_strategies.rolling import RollingDeploymentStrategy


def get_deployment_strategy(strategy_id: Optional[str]) -> DeploymentStrategy:
    """
    Resolve the strategy implementation for a strategy identifier.

    Args:
        strategy_id: Strategy ID (case-insensitive). If None/empty, defaults to rolling.

    Returns:
        DeploymentStrategy implementation.

    Raises:
        UnsupportedDeploymentStrategyError: if the strategy is not supported.
    """
    if not strategy_id:
        return RollingDeploymentStrategy()

    sid = strategy_id.strip().lower()
    if sid == RollingDeploymentStrategy.strategy_id:
        return RollingDeploymentStrategy()
    if sid == CanaryIstioFlaggerDeploymentStrategy.strategy_id:
        return CanaryIstioFlaggerDeploymentStrategy()

    raise UnsupportedDeploymentStrategyError(f"Unsupported deployment strategy: {strategy_id}")

