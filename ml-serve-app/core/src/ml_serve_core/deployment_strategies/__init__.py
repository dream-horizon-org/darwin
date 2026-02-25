"""
Deployment strategy implementations for API serves.

This package provides a small strategy layer that converts a deployment request
(`deployment_strategy` + `deployment_strategy_config`) into concrete Helm values
that are passed to Darwin Cluster Manager (DCM).
"""

from ml_serve_core.deployment_strategies.base import DeploymentStrategy
from ml_serve_core.deployment_strategies.factory import get_deployment_strategy

__all__ = [
    "DeploymentStrategy",
    "get_deployment_strategy",
]

