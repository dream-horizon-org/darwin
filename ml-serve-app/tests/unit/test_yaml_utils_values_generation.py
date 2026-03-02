"""
Unit tests for deployment strategy and values generation in yaml_utils.

Tests generate_fastapi_values and generate_fastapi_values_for_one_click_model_deployment
with rolling/canary strategy params, and the internal helpers for strategy resolution.
"""
import pytest
from unittest.mock import MagicMock

from ml_serve_core.dtos.dtos import EnvConfig
from ml_serve_core.utils.yaml_utils import (
    _normalize_deployment_strategy,
    _resolve_rolling_params,
    _apply_deployment_strategy_values,
    generate_fastapi_values,
    generate_fastapi_values_for_one_click_model_deployment,
)


@pytest.mark.unit
class TestNormalizeDeploymentStrategy:
    """Tests for _normalize_deployment_strategy."""

    def test_none_returns_rolling(self):
        """None strategy should default to rolling."""
        assert _normalize_deployment_strategy(None) == "rolling"

    def test_empty_string_returns_rolling(self):
        """Empty string should default to rolling."""
        assert _normalize_deployment_strategy("") == "rolling"

    def test_rolling_case_insensitive(self):
        """Rolling should be normalized case-insensitively."""
        assert _normalize_deployment_strategy("rolling") == "rolling"
        assert _normalize_deployment_strategy("Rolling") == "rolling"
        assert _normalize_deployment_strategy("ROLLING") == "rolling"

    def test_canary_case_insensitive(self):
        """Canary should be normalized case-insensitively."""
        assert _normalize_deployment_strategy("canary") == "canary"
        assert _normalize_deployment_strategy("Canary") == "canary"
        assert _normalize_deployment_strategy("CANARY") == "canary"

    def test_invalid_value_defaults_to_rolling(self):
        """Invalid values should default to rolling (conservative)."""
        assert _normalize_deployment_strategy("invalid") == "rolling"
        assert _normalize_deployment_strategy("blue-green") == "rolling"
        assert _normalize_deployment_strategy("  ") == "rolling"

    def test_non_string_returns_rolling(self):
        """Non-string types should default to rolling."""
        assert _normalize_deployment_strategy(123) == "rolling"
        assert _normalize_deployment_strategy({}) == "rolling"


@pytest.mark.unit
class TestResolveRollingParams:
    """Tests for _resolve_rolling_params."""

    def test_none_config_returns_defaults(self):
        """None config should return default maxSurge and maxUnavailable."""
        assert _resolve_rolling_params(None) == ("25%", 0)

    def test_empty_dict_returns_defaults(self):
        """Empty dict should return defaults."""
        assert _resolve_rolling_params({}) == ("25%", 0)

    def test_custom_max_surge_and_unavailable(self):
        """Custom config should be used."""
        config = {"max_surge": "50%", "max_unavailable": 1}
        assert _resolve_rolling_params(config) == ("50%", 1)

    def test_partial_config_uses_defaults_for_missing(self):
        """Partial config should use defaults for missing keys."""
        assert _resolve_rolling_params({"max_surge": "10%"}) == ("10%", 0)
        assert _resolve_rolling_params({"max_unavailable": 2}) == ("25%", 2)

    def test_max_unavailable_negative_falls_back_to_default(self):
        """Negative max_unavailable should fall back to default 0."""
        assert _resolve_rolling_params({"max_unavailable": -1}) == ("25%", 0)
        assert _resolve_rolling_params({"max_unavailable": -5}) == ("25%", 0)

    def test_max_unavailable_non_int_falls_back_to_default(self):
        """Non-int max_unavailable (e.g. str, float) should fall back to default 0."""
        assert _resolve_rolling_params({"max_unavailable": "invalid"}) == ("25%", 0)
        assert _resolve_rolling_params({"max_unavailable": 1.5}) == ("25%", 0)
        assert _resolve_rolling_params({"max_unavailable": {}}) == ("25%", 0)

    def test_max_surge_invalid_falls_back_to_default(self):
        """Invalid max_surge (negative, empty, bad format) should fall back to default 25%."""
        assert _resolve_rolling_params({"max_surge": -1}) == ("25%", 0)
        assert _resolve_rolling_params({"max_surge": ""}) == ("25%", 0)
        assert _resolve_rolling_params({"max_surge": "   "}) == ("25%", 0)
        assert _resolve_rolling_params({"max_surge": "invalid"}) == ("25%", 0)

    def test_max_surge_valid_int_accepted(self):
        """Valid positive int max_surge should be accepted."""
        assert _resolve_rolling_params({"max_surge": 0}) == ("0", 0)
        assert _resolve_rolling_params({"max_surge": 1}) == ("1", 0)
        assert _resolve_rolling_params({"max_surge": 3}) == ("3", 0)

    def test_max_surge_valid_percentage_string_accepted(self):
        """Valid percentage string max_surge (e.g. 25%) should be accepted."""
        assert _resolve_rolling_params({"max_surge": "25%"}) == ("25%", 0)
        assert _resolve_rolling_params({"max_surge": "50%"}) == ("50%", 0)
        assert _resolve_rolling_params({"max_surge": "100%"}) == ("100%", 0)

    def test_max_surge_valid_integer_string_accepted(self):
        """Valid integer string max_surge (e.g. '1') should be accepted."""
        assert _resolve_rolling_params({"max_surge": "1"}) == ("1", 0)
        assert _resolve_rolling_params({"max_surge": "2"}) == ("2", 0)


@pytest.mark.unit
class TestApplyDeploymentStrategyValues:
    """Tests for _apply_deployment_strategy_values."""

    def test_rolling_sets_flagger_disabled_and_rolling_block(self):
        """Rolling strategy should set flagger.enabled=false and rolling block."""
        values = {}
        _apply_deployment_strategy_values(
            values,
            deployment_strategy="rolling",
            deployment_strategy_config=None,
            enable_istio=False,
            namespace="darwin",
        )
        assert values["flagger"]["enabled"] is False
        assert values["flagger"]["maxSurge"] == "25%"
        assert values["flagger"]["maxUnavailable"] == 0
        assert values["rolling"]["maxSurge"] == "25%"
        assert values["rolling"]["maxUnavailable"] == 0

    def test_canary_with_istio_sets_flagger_enabled_and_webhooks(self):
        """Canary with enable_istio should set flagger.enabled=true and webhooks."""
        values = {}
        _apply_deployment_strategy_values(
            values,
            deployment_strategy="canary",
            deployment_strategy_config=None,
            enable_istio=True,
            namespace="prod-ns",
        )
        assert values["flagger"]["enabled"] is True
        assert values["flagger"]["skipAnalysis"] is True
        assert values["flagger"]["metrics"] == []
        assert values["flagger"]["maxWeight"] == 100
        assert values["flagger"]["stepWeight"] == 100
        assert values["flagger"]["loadtesterNamespace"] == "prod-ns"
        assert len(values["flagger"]["webhooks"]) == 1
        assert values["flagger"]["webhooks"][0]["type"] == "confirm-promotion"
        assert "flagger-loadtester.prod-ns.svc.cluster.local" in values["flagger"]["webhooks"][0]["url"]
        assert values["rolling"]["maxSurge"] == "25%"
        assert values["rolling"]["maxUnavailable"] == 0

    def test_canary_without_istio_falls_back_to_rolling(self):
        """Canary with enable_istio=False should behave like rolling (caller passes resolved strategy)."""
        values = {}
        _apply_deployment_strategy_values(
            values,
            deployment_strategy="rolling",
            deployment_strategy_config=None,
            enable_istio=False,
            namespace="darwin",
        )
        assert values["flagger"]["enabled"] is False

    def test_canary_with_custom_rolling_params(self):
        """Canary should use deployment_strategy_config for maxSurge/maxUnavailable."""
        values = {}
        _apply_deployment_strategy_values(
            values,
            deployment_strategy="canary",
            deployment_strategy_config={"max_surge": "10%", "max_unavailable": 1},
            enable_istio=True,
            namespace="darwin",
        )
        assert values["flagger"]["maxSurge"] == "10%"
        assert values["flagger"]["maxUnavailable"] == 1
        assert values["rolling"]["maxSurge"] == "10%"
        assert values["rolling"]["maxUnavailable"] == 1

    def test_progress_deadline_seconds_from_config(self):
        """progress_deadline_seconds should be read from config when provided."""
        values = {}
        _apply_deployment_strategy_values(
            values,
            deployment_strategy="canary",
            deployment_strategy_config={"progress_deadline_seconds": 900},
            enable_istio=True,
            namespace="darwin",
        )
        assert values["flagger"]["progressDeadlineSeconds"] == 900


def _make_env_config(namespace: str = "darwin", enable_istio: bool = False) -> EnvConfig:
    """Create minimal EnvConfig for tests."""
    return EnvConfig(
        domain_suffix="example.com",
        cluster_name="kind",
        security_group="sg-123",
        ft_redis_url="redis://localhost",
        workflow_url="http://workflow",
        namespace=namespace,
        enable_istio=enable_istio,
    )


def _make_mock_serve_infra_config():
    """Create mock APIServeInfraConfig for generate_fastapi_values."""
    mock = MagicMock()
    mock.fast_api_config_object.min_replicas = 2
    mock.fast_api_config_object.max_replicas = 10
    mock.fast_api_config_object.cores = 4
    mock.fast_api_config_object.memory = 8
    mock.fast_api_config_object.node_capacity_type = "spot"
    mock.additional_hosts_list = None
    return mock


@pytest.mark.unit
class TestGenerateFastapiValues:
    """Tests for generate_fastapi_values with deployment strategy."""

    def test_rolling_emits_flagger_disabled_and_rolling_block(self):
        """generate_fastapi_values with rolling should emit correct blocks."""
        values = generate_fastapi_values(
            name="test-serve",
            env="prod",
            runtime="localhost:5000/image:tag",
            env_config=_make_env_config(),
            user_email="user@example.com",
            serve_infra_config=_make_mock_serve_infra_config(),
            environment_variables=None,
            is_environment_protected=False,
            deployment_strategy="rolling",
            deployment_strategy_config=None,
            enable_istio=False,
        )
        assert values["flagger"]["enabled"] is False
        assert values["rolling"]["maxSurge"] == "25%"
        assert values["rolling"]["maxUnavailable"] == 0

    def test_canary_without_istio_emits_rolling(self):
        """generate_fastapi_values with canary + enable_istio=False should emit rolling (flagger disabled)."""
        values = generate_fastapi_values(
            name="test-serve",
            env="prod",
            runtime="localhost:5000/image:tag",
            env_config=_make_env_config(enable_istio=False),
            user_email="user@example.com",
            serve_infra_config=_make_mock_serve_infra_config(),
            environment_variables=None,
            is_environment_protected=False,
            deployment_strategy="canary",
            deployment_strategy_config=None,
            enable_istio=False,
        )
        assert values["flagger"]["enabled"] is False
        assert values["rolling"]["maxSurge"] == "25%"
        assert values["rolling"]["maxUnavailable"] == 0

    def test_canary_with_istio_emits_flagger_enabled(self):
        """generate_fastapi_values with canary + enable_istio should emit flagger config."""
        values = generate_fastapi_values(
            name="test-serve",
            env="prod",
            runtime="localhost:5000/image:tag",
            env_config=_make_env_config(namespace="prod-ns", enable_istio=True),
            user_email="user@example.com",
            serve_infra_config=_make_mock_serve_infra_config(),
            environment_variables=None,
            is_environment_protected=False,
            deployment_strategy="canary",
            deployment_strategy_config=None,
            enable_istio=True,
        )
        assert values["flagger"]["enabled"] is True
        assert values["flagger"]["skipAnalysis"] is True
        assert values["flagger"]["metrics"] == []
        assert values["flagger"]["webhooks"][0]["url"].startswith(
            "http://flagger-loadtester.prod-ns."
        )

    def test_default_params_use_rolling(self):
        """Omission of deployment_strategy should default to rolling."""
        values = generate_fastapi_values(
            name="test-serve",
            env="prod",
            runtime="localhost:5000/image:tag",
            env_config=_make_env_config(),
            user_email="user@example.com",
            serve_infra_config=_make_mock_serve_infra_config(),
            environment_variables=None,
            is_environment_protected=False,
        )
        assert values["flagger"]["enabled"] is False
        assert "rolling" in values

    def test_deployment_strategy_config_overrides_defaults(self):
        """deployment_strategy_config should override rolling defaults."""
        values = generate_fastapi_values(
            name="test-serve",
            env="prod",
            runtime="localhost:5000/image:tag",
            env_config=_make_env_config(),
            user_email="user@example.com",
            serve_infra_config=_make_mock_serve_infra_config(),
            environment_variables=None,
            is_environment_protected=False,
            deployment_strategy="rolling",
            deployment_strategy_config={"max_surge": "50%", "max_unavailable": 2},
            enable_istio=False,
        )
        assert values["rolling"]["maxSurge"] == "50%"
        assert values["rolling"]["maxUnavailable"] == 2
        assert values["flagger"]["maxSurge"] == "50%"
        assert values["flagger"]["maxUnavailable"] == 2


@pytest.mark.unit
class TestGenerateFastapiValuesForOneClickModelDeployment:
    """Tests for generate_fastapi_values_for_one_click_model_deployment with strategy."""

    def test_rolling_emits_correct_blocks(self):
        """One-click with rolling should emit flagger disabled and rolling block."""
        values = generate_fastapi_values_for_one_click_model_deployment(
            name="iris-model",
            env="prod",
            runtime="localhost:5000/serve-md-runtime:latest",
            env_config=_make_env_config(),
            user_email="user@example.com",
            environment_variables=None,
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity_type="spot",
            storage_strategy="emptydir",
            model_uri="models:/iris/1",
            model_downloader_image="localhost:5000/downloader:latest",
            model_cache_pvc_name="model-cache",
            model_cache_path="/model-cache",
            tracking_uri="http://mlflow",
            tracking_username="",
            tracking_password="",
            deployment_strategy="rolling",
            deployment_strategy_config=None,
            enable_istio=False,
        )
        assert values["flagger"]["enabled"] is False
        assert values["rolling"]["maxSurge"] == "25%"
        assert values["rolling"]["maxUnavailable"] == 0

    def test_canary_without_istio_emits_rolling(self):
        """One-click with canary + enable_istio=False should emit rolling (flagger disabled)."""
        values = generate_fastapi_values_for_one_click_model_deployment(
            name="iris-model",
            env="prod",
            runtime="localhost:5000/serve-md-runtime:latest",
            env_config=_make_env_config(enable_istio=False),
            user_email="user@example.com",
            environment_variables=None,
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity_type="spot",
            storage_strategy="emptydir",
            model_uri="models:/iris/1",
            model_downloader_image="localhost:5000/downloader:latest",
            model_cache_pvc_name="model-cache",
            model_cache_path="/model-cache",
            tracking_uri="http://mlflow",
            tracking_username="",
            tracking_password="",
            deployment_strategy="canary",
            deployment_strategy_config=None,
            enable_istio=False,
        )
        assert values["flagger"]["enabled"] is False
        assert values["rolling"]["maxSurge"] == "25%"
        assert values["rolling"]["maxUnavailable"] == 0

    def test_canary_with_istio_emits_flagger_config(self):
        """One-click with canary + enable_istio should emit flagger config."""
        values = generate_fastapi_values_for_one_click_model_deployment(
            name="iris-model",
            env="prod",
            runtime="localhost:5000/serve-md-runtime:latest",
            env_config=_make_env_config(namespace="ml-ns", enable_istio=True),
            user_email="user@example.com",
            environment_variables=None,
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity_type="spot",
            storage_strategy="emptydir",
            model_uri="models:/iris/1",
            model_downloader_image="localhost:5000/downloader:latest",
            model_cache_pvc_name="model-cache",
            model_cache_path="/model-cache",
            tracking_uri="http://mlflow",
            tracking_username="",
            tracking_password="",
            deployment_strategy="canary",
            deployment_strategy_config=None,
            enable_istio=True,
        )
        assert values["flagger"]["enabled"] is True
        assert "flagger-loadtester.ml-ns.svc.cluster.local" in values["flagger"]["webhooks"][0]["url"]

    def test_default_params_use_rolling(self):
        """Omission of strategy params should default to rolling."""
        values = generate_fastapi_values_for_one_click_model_deployment(
            name="iris-model",
            env="prod",
            runtime="localhost:5000/serve-md-runtime:latest",
            env_config=_make_env_config(),
            user_email="user@example.com",
            environment_variables=None,
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity_type="spot",
            storage_strategy="emptydir",
            model_uri="models:/iris/1",
            model_downloader_image="localhost:5000/downloader:latest",
            model_cache_pvc_name="model-cache",
            model_cache_path="/model-cache",
            tracking_uri="http://mlflow",
            tracking_username="",
            tracking_password="",
        )
        assert values["flagger"]["enabled"] is False
        assert "rolling" in values
