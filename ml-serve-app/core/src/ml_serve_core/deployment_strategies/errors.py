"""
Error types for deployment strategy selection and validation.
"""


class DeploymentStrategyError(Exception):
    """Base class for deployment-strategy related errors."""


class UnsupportedDeploymentStrategyError(DeploymentStrategyError):
    """Raised when a requested deployment strategy is not supported."""


class DeploymentStrategyPrerequisiteError(DeploymentStrategyError):
    """Raised when a strategy cannot be used due to missing prerequisites."""


class DeploymentStrategyConfigError(DeploymentStrategyError):
    """Raised when a strategy configuration is invalid."""

