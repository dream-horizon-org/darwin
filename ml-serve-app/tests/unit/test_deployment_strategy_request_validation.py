"""
Unit tests for deployment strategy request validation.
"""

import pytest
from fastapi.exceptions import RequestValidationError

from ml_serve_app_layer.dtos.requests import APIServeDeploymentConfigRequest


@pytest.mark.unit
class TestDeploymentStrategyRequestValidation:
    """Validation tests for deployment_strategy and deployment_strategy_config."""

    def test_defaults_to_rolling_when_strategy_omitted(self):
        """When deployment_strategy is omitted, it should default to rolling."""
        req = APIServeDeploymentConfigRequest(environment_variables={"A": "B"})
        assert req.deployment_strategy == "rolling"

    def test_normalizes_strategy_identifier_to_lowercase(self):
        """Strategy identifiers should be normalized case-insensitively."""
        req = APIServeDeploymentConfigRequest(deployment_strategy="RoLlInG")
        assert req.deployment_strategy == "rolling"

    def test_rejects_unknown_strategy(self):
        """Unknown deployment strategies should be rejected with a clear error."""
        with pytest.raises(RequestValidationError):
            APIServeDeploymentConfigRequest(deployment_strategy="bluegreen")

    def test_rejects_config_when_strategy_missing(self):
        """Config without an explicit strategy is rejected to avoid ambiguity."""
        with pytest.raises(RequestValidationError):
            APIServeDeploymentConfigRequest(deployment_strategy_config={"max_weight": 50})

    def test_treats_empty_config_object_as_absent(self):
        """Empty config objects should be treated as absent for compatibility."""
        req = APIServeDeploymentConfigRequest(deployment_strategy_config={})
        assert req.deployment_strategy == "rolling"
        assert req.deployment_strategy_config is None

    def test_canary_rejects_step_weight_greater_than_max_weight(self):
        """Canary config should enforce step_weight <= max_weight."""
        with pytest.raises(RequestValidationError):
            APIServeDeploymentConfigRequest(
                deployment_strategy="canary",
                deployment_strategy_config={"step_weight": 50, "max_weight": 10},
            )

