"""
Unit tests for deployment strategy fallback and values generation in deploy_fastapi_serve.

Tests fallback behavior when canary is requested but Istio is not enabled,
and verifies that generate_fastapi_values is called with correct parameters.
"""
import pytest
from unittest.mock import patch, MagicMock

from ml_serve_app_layer.dtos.requests import (
    APIServeDeploymentConfigRequest,
    DeploymentRequest,
)
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_model import Serve, Artifact, Environment
from ml_serve_model.enums import BackendType
from ml_serve_model.serve_configs import APIServeInfraConfig
from ml_serve_model.app_layer_deployments import AppLayerDeployment
from ml_serve_model.active_deployment import ActiveDeployment
from ml_serve_model.deployment import Deployment


@pytest.mark.unit
class TestDeployFastapiServeFallback:
    """Tests for deploy_fastapi_serve fallback behavior."""

    @pytest.mark.asyncio
    async def test_canary_without_istio_returns_fallback_fields(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """When canary requested and enable_istio=false, response includes fallback fields."""
        # Arrange: environment without Istio (test_environment has no enable_istio in env_configs)
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

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

        # Act
        result = await service.deploy_fastapi_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_deployment_config=deployment_config,
            infra_config=infra_config,
            user=test_user,
        )

        # Assert
        assert "service_url" in result
        assert result["deployment_strategy_requested"] == "canary"
        assert result["deployment_strategy_applied"] == "rolling"
        assert result["fallback_reason"] == "Istio not enabled for environment"

    @pytest.mark.asyncio
    async def test_canary_with_istio_no_fallback_fields(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        mock_dcm_client,
    ):
        """When canary requested and enable_istio=true, no fallback fields in response."""
        # Create environment with enable_istio=True
        env = await Environment.create(
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

        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=env,
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

        # Act
        result = await service.deploy_fastapi_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=env,
            api_deployment_config=deployment_config,
            infra_config=infra_config,
            user=test_user,
        )

        # Assert - no fallback fields
        assert "service_url" in result
        assert "deployment_strategy_requested" not in result
        assert "deployment_strategy_applied" not in result
        assert "fallback_reason" not in result

    @pytest.mark.asyncio
    async def test_rolling_no_fallback_fields(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """When rolling requested, no fallback fields in response."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

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
            deployment_strategy_config=None,
            environment_variables=None,
        )

        # Act
        result = await service.deploy_fastapi_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_deployment_config=deployment_config,
            infra_config=infra_config,
            user=test_user,
        )

        # Assert
        assert "service_url" in result
        assert "deployment_strategy_requested" not in result
        assert "deployment_strategy_applied" not in result
        assert "fallback_reason" not in result

    @pytest.mark.asyncio
    async def test_deploy_artifact_propagates_fallback_fields(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """deploy_artifact returns api_deployment_resp with fallback fields when applicable."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

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

        deployment_request = DeploymentRequest(
            env=test_environment.name,
            artifact_version=test_artifact.version,
            api_serve_deployment_config=APIServeDeploymentConfigRequest(
                deployment_strategy="canary",
                deployment_strategy_config=None,
                environment_variables=None,
            ),
        )

        result = await service.deploy_artifact(
            serve=test_serve,
            artifact=test_artifact,
            serve_config=infra_config,
            env=test_environment,
            deployment_request=deployment_request,
            user=test_user,
        )

        assert result is not None
        assert "service_url" in result
        assert result["deployment_strategy_requested"] == "canary"
        assert result["deployment_strategy_applied"] == "rolling"
        assert result["fallback_reason"] == "Istio not enabled for environment"


@pytest.mark.unit
class TestDeployFastapiServeValuesGeneration:
    """Tests that deploy_fastapi_serve passes correct params to generate_fastapi_values."""

    @pytest.mark.asyncio
    async def test_generate_fastapi_values_called_with_effective_strategy_on_fallback(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """When canary+!istio, generate_fastapi_values receives effective strategy=rolling."""
        mock_gen = MagicMock(return_value={"name": "test", "envs": {}, "rolling": {}, "flagger": {}})
        with patch(
            "ml_serve_core.service.deployment_service.generate_fastapi_values",
            mock_gen,
        ):
            service = DeploymentService()
            service.dcm_client = mock_dcm_client

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
                deployment_strategy_config={"max_surge": "50%"},
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

            mock_gen.assert_called_once()
            call_kwargs = mock_gen.call_args.kwargs
            assert call_kwargs["deployment_strategy"] == "rolling"
            assert call_kwargs["deployment_strategy_config"] == {"max_surge": "50%"}
            assert call_kwargs["enable_istio"] is False

    @pytest.mark.asyncio
    async def test_generate_fastapi_values_called_with_canary_when_istio_enabled(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        mock_dcm_client,
    ):
        """When canary+istio, generate_fastapi_values receives strategy=canary."""
        env = await Environment.create(
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

        mock_gen = MagicMock(return_value={"name": "test", "envs": {}, "rolling": {}, "flagger": {}})
        with patch(
            "ml_serve_core.service.deployment_service.generate_fastapi_values",
            mock_gen,
        ):
            service = DeploymentService()
            service.dcm_client = mock_dcm_client

            infra_config = await APIServeInfraConfig.create(
                serve=test_serve,
                environment=env,
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
                env=env,
                api_deployment_config=deployment_config,
                infra_config=infra_config,
                user=test_user,
            )

            mock_gen.assert_called_once()
            call_kwargs = mock_gen.call_args.kwargs
            assert call_kwargs["deployment_strategy"] == "canary"
            assert call_kwargs["enable_istio"] is True


@pytest.mark.unit
class TestRedeployPreservesDeploymentStrategy:
    """Tests that redeploy_api_serve_with_updated_infra_config preserves deployment strategy."""

    @pytest.mark.asyncio
    async def test_redeploy_full_rebuild_passes_deployment_strategy_to_generate_values(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """Full rebuild path passes deployment_strategy from AppLayerDeployment to generate_fastapi_values."""
        from tests.fixtures.mock_responses import MockDCMResponses

        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        mock_dcm_client.update_resource.side_effect = Exception("Update failed")
        mock_dcm_client.build_resource.return_value = MockDCMResponses.BUILD_SUCCESS
        mock_dcm_client.start_resource.return_value = MockDCMResponses.START_SUCCESS

        config = await APIServeInfraConfig.create(
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

        deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=test_environment,
            created_by=test_user,
        )

        await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy="canary",
            deployment_params={"max_surge": "10%", "max_unavailable": 1},
            environment_variables={"TEST": "value"},
        )

        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=deployment,
        )

        mock_gen = MagicMock(return_value={"name": "test", "envs": {}, "rolling": {}, "flagger": {}})
        with patch(
            "ml_serve_core.service.deployment_service.generate_fastapi_values",
            mock_gen,
        ):
            await service.redeploy_api_serve_with_updated_infra_config(
                serve=test_serve,
                api_serve_config=config,
                env=test_environment,
                user=test_user,
            )

            mock_gen.assert_called_once()
            call_kwargs = mock_gen.call_args.kwargs
            # Canary requested but env has no enable_istio -> effective rolling
            assert call_kwargs["deployment_strategy"] == "rolling"
            assert call_kwargs["deployment_strategy_config"] == {
                "max_surge": "10%",
                "max_unavailable": 1,
            }

    @pytest.mark.asyncio
    async def test_redeploy_full_rebuild_preserves_canary_when_istio_enabled(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        mock_dcm_client,
    ):
        """Full rebuild with stored canary and enable_istio passes canary to generate_fastapi_values."""
        from tests.fixtures.mock_responses import MockDCMResponses

        env = await Environment.create(
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

        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        mock_dcm_client.update_resource.side_effect = Exception("Update failed")
        mock_dcm_client.build_resource.return_value = MockDCMResponses.BUILD_SUCCESS
        mock_dcm_client.start_resource.return_value = MockDCMResponses.START_SUCCESS

        config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=env,
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

        deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=env,
            created_by=test_user,
        )

        await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy="canary",
            deployment_params=None,
            environment_variables=None,
        )

        await ActiveDeployment.create(
            serve=test_serve,
            environment=env,
            deployment=deployment,
        )

        mock_gen = MagicMock(return_value={"name": "test", "envs": {}, "rolling": {}, "flagger": {}})
        with patch(
            "ml_serve_core.service.deployment_service.generate_fastapi_values",
            mock_gen,
        ):
            await service.redeploy_api_serve_with_updated_infra_config(
                serve=test_serve,
                api_serve_config=config,
                env=env,
                user=test_user,
            )

            mock_gen.assert_called_once()
            call_kwargs = mock_gen.call_args.kwargs
            assert call_kwargs["deployment_strategy"] == "canary"
            assert call_kwargs["enable_istio"] is True
