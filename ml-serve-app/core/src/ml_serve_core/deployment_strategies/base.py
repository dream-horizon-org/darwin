"""
Base interfaces for deployment strategies.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional


@dataclass(frozen=True)
class DeploymentStrategyContext:
    """
    Context available to deployment strategies.

    This is intentionally small and serializable. Strategies should not depend
    on heavy objects (DB models, clients) unless strictly necessary.
    """

    istio_enabled: bool


class DeploymentStrategy(ABC):
    """
    A deployment strategy transforms base Helm values into strategy-specific values.
    """

    strategy_id: str

    @abstractmethod
    def validate(self, config: Optional[dict[str, Any]], ctx: DeploymentStrategyContext) -> None:
        """
        Validate the strategy configuration.

        Args:
            config: Strategy-specific configuration (already normalized).
            ctx: DeploymentStrategyContext with environment capabilities.

        Raises:
            DeploymentStrategyError subclasses on invalid configs or missing prerequisites.
        """

    @abstractmethod
    def apply(self, values: dict[str, Any], config: Optional[dict[str, Any]], ctx: DeploymentStrategyContext) -> dict[str, Any]:
        """
        Apply strategy-specific toggles/settings to Helm values.

        Args:
            values: Base Helm values for the deployment.
            config: Strategy-specific configuration (already normalized).
            ctx: DeploymentStrategyContext with environment capabilities.

        Returns:
            Updated Helm values dict.
        """

