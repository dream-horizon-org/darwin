"""
Integration tests for deployment strategy flow (rolling, canary, fallback).

These tests exercise the full service layer (DeploymentService) with real
values generation and mocked DCM. They verify that:
- Rolling strategy produces correct Helm values (rolling block, flagger disabled)
- Canary with enable_istio=true produces flagger-enabled values (skipAnalysis, webhooks)
- Canary with enable_istio=false falls back to rolling and returns fallback fields

No cluster required; uses in-memory SQLite and mock DCM.
Marked as both unit and integration for flexible test runs.
"""
import os

import pytest

# Set test env for yaml_utils (local mode)
os.environ.setdefault("ENV", "local")


def _make_capture_mock_dcm():
    """Create mock DCM client that captures values passed to build_resource."""
    from unittest.mock import AsyncMock

    from tests.fixtures.mock_responses import MockDCMResponses

    captured = []

    async def capture_build(*args, **kwargs):
        captured.append(kwargs.get("values", {}))
        return MockDCMResponses.BUILD_SUCCESS

    client = AsyncMock()
    client.build_resource.side_effect = capture_build
    client.start_resource.return_value = MockDCMResponses.START_SUCCESS
    client.stop_resource.return_value = {"body": {"status": "stopped"}}
    client.update_resource.return_value = {"body": {"status": "updated"}}
    return client, captured


@pytest.mark.unit
@pytest.mark.integration
class TestDeploymentStrategyIntegration:
    """Integration tests for deployment strategy values and fallback behavior."""

    @pytest.mark.asyncio
    async def test_rolling_strategy_values_passed(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
    ):
        """Deploy with rolling strategy: verify values include rolling block and flagger disabled."""
        from ml_serve_model import APIServeInfraConfig
        from ml_serve_model.enums import BackendType
        from ml_serve_app_layer.dtos.requests import APIServeDeploymentConfigRequest
        from ml_serve_core.service.deployment_service import DeploymentService

        mock_dcm, captured = _make_capture_mock_dcm()
        service = DeploymentService()
        service.dcm_client = mock_dcm

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 3,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling",
            deployment_strategy_config={"max_surge": "50%", "max_unavailable": 1},
            environment_variables=None,
        )

        await service.deploy_fastapi_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_deployment_config=deployment_config,
            infra_config=infra_config,
            user=test_user,
        )

        assert len(captured) == 1
        values = captured[0]
        assert values.get("rolling", {}).get("maxSurge") == "50%"
        assert values.get("rolling", {}).get("maxUnavailable") == 1
        assert values.get("flagger", {}).get("enabled") is False

    @pytest.mark.asyncio
    async def test_canary_with_istio_values_include_flagger_and_manual_mode(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
    ):
        """Deploy with canary + enable_istio=true: verify flagger enabled, skipAnalysis, webhooks."""
        from ml_serve_model import Environment, APIServeInfraConfig
        from ml_serve_model.enums import BackendType
        from ml_serve_app_layer.dtos.requests import APIServeDeploymentConfigRequest
        from ml_serve_core.service.deployment_service import DeploymentService

        env_istio = await Environment.create(
            name="istio-env",
            cluster_name="kind",
            namespace="darwin",
            env_configs={
                "domain_suffix": "",
                "cluster_name": "kind",
                "namespace": "darwin",
                "security_group": "",
                "ft_redis_url": "",
                "workflow_url": "",
                "enable_istio": True,
            },
            is_protected=False,
        )

        mock_dcm, captured = _make_capture_mock_dcm()
        service = DeploymentService()
        service.dcm_client = mock_dcm

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=env_istio,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 3,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config=None,
            environment_variables=None,
        )

        await service.deploy_fastapi_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=env_istio,
            api_deployment_config=deployment_config,
            infra_config=infra_config,
            user=test_user,
        )

        assert len(captured) == 1
        values = captured[0]
        flagger = values.get("flagger", {})
        assert flagger.get("enabled") is True
        assert flagger.get("skipAnalysis") is True
        assert flagger.get("metrics") == []
        webhooks = flagger.get("webhooks", [])
        assert len(webhooks) >= 1
        confirm_webhook = next(
            (w for w in webhooks if w.get("type") == "confirm-promotion"), None
        )
        assert confirm_webhook is not None
        assert "flagger-loadtester" in confirm_webhook.get("url", "")

    @pytest.mark.asyncio
    async def test_canary_without_istio_fallback_and_response_fields(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
    ):
        """Deploy with canary + enable_istio=false: verify fallback to rolling and response fields."""
        from ml_serve_model import APIServeInfraConfig
        from ml_serve_model.enums import BackendType
        from ml_serve_app_layer.dtos.requests import APIServeDeploymentConfigRequest
        from ml_serve_core.service.deployment_service import DeploymentService

        mock_dcm, captured = _make_capture_mock_dcm()
        service = DeploymentService()
        service.dcm_client = mock_dcm

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 3,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config=None,
            environment_variables=None,
        )

        result = await service.deploy_fastapi_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_deployment_config=deployment_config,
            infra_config=infra_config,
            user=test_user,
        )

        # Response contains fallback fields
        assert result.get("deployment_strategy_requested") == "canary"
        assert result.get("deployment_strategy_applied") == "rolling"
        assert "Istio" in (result.get("fallback_reason") or "")

        # Values passed to DCM use rolling (flagger disabled)
        assert len(captured) == 1
        values = captured[0]
        assert values.get("flagger", {}).get("enabled") is False
        assert "rolling" in values
        assert values.get("rolling", {}).get("maxSurge") is not None


@pytest.mark.unit
@pytest.mark.integration
class TestOneClickDeploymentStrategyIntegration:
    """Integration tests for one-click deploy with deployment strategy."""

    @pytest.mark.asyncio
    async def test_one_click_rolling_values(
        self,
        db_session,
        test_user,
        test_environment,
        mock_mlflow_client,
    ):
        """One-click deploy with rolling: verify values include rolling block, flagger disabled."""
        from ml_serve_app_layer.dtos.requests import ModelDeploymentRequest
        from ml_serve_core.service.deployment_service import DeploymentService

        mock_dcm, captured = _make_capture_mock_dcm()
        service = DeploymentService()
        service.dcm_client = mock_dcm
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="one-click-rolling-test",
            artifact_version="v1",
            model_uri="models:/test-model/1",
            env=test_environment.name,
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity="spot",
            deployment_strategy="rolling",
            deployment_strategy_config={"max_surge": "30%"},
        )

        await service.deploy_model(request, test_user)

        assert len(captured) == 1
        values = captured[0]
        assert values.get("rolling", {}).get("maxSurge") == "30%"
        assert values.get("flagger", {}).get("enabled") is False

    @pytest.mark.asyncio
    async def test_one_click_canary_fallback_response(
        self,
        db_session,
        test_user,
        test_environment,
        mock_mlflow_client,
    ):
        """One-click deploy with canary + !istio: verify fallback fields in response."""
        from ml_serve_app_layer.dtos.requests import ModelDeploymentRequest
        from ml_serve_core.service.deployment_service import DeploymentService

        mock_dcm, captured = _make_capture_mock_dcm()
        service = DeploymentService()
        service.dcm_client = mock_dcm
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="one-click-canary-fallback",
            artifact_version="v1",
            model_uri="models:/test-model/1",
            env=test_environment.name,
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity="spot",
            deployment_strategy="canary",
        )

        result = await service.deploy_model(request, test_user)

        assert result.get("deployment_strategy_requested") == "canary"
        assert result.get("deployment_strategy_applied") == "rolling"
        assert "fallback_reason" in result

        assert len(captured) == 1
        values = captured[0]
        assert values.get("flagger", {}).get("enabled") is False
