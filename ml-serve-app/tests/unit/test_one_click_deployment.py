"""
Unit tests for one-click model deployment flow.

Tests the deploy_model and undeploy_model functionality with mocked
external dependencies (DCM, MLflow).
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from pydantic import ValidationError

from ml_serve_app_layer.dtos.requests import ModelDeploymentRequest, ModelUndeployRequest
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_model import Serve, Environment, Artifact
from ml_serve_model.enums import ServeType
from ml_serve_model.active_deployment import ActiveDeployment
from ml_serve_model.app_layer_deployments import AppLayerDeployment
from ml_serve_model.serve_configs import APIServeInfraConfig
from tests.fixtures.mock_responses import MockMLflowResponses


@pytest.mark.unit
class TestOneClickDeployment:
    """Test suite for one-click model deployment."""

    @pytest.mark.asyncio
    async def test_deploy_model_success(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test successful one-click model deployment."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-iris-model",
            artifact_version="v1",
            model_uri="models:/iris-classifier/1",
            env="test-env",
            cores=2,
            memory=4,
            min_replicas=1,
            max_replicas=3,
            node_capacity="spot"
        )

        # Act
        result = await service.deploy_model(request, test_user)

        # Assert
        assert "service_url" in result
        assert mock_dcm_client.build_resource.called
        assert mock_dcm_client.start_resource.called

        # Verify serve was created
        serve = await Serve.get_or_none(name="test-iris-model")
        assert serve is not None
        assert serve.type == ServeType.API.value

        # Verify artifact was created
        artifact = await Artifact.get_or_none(serve=serve, version="v1")
        assert artifact is not None
        assert artifact.github_repo_url == "models:/iris-classifier/1"

        # Verify active deployment was created
        active = await ActiveDeployment.get_or_none(serve=serve, environment=test_environment)
        assert active is not None

    @pytest.mark.asyncio
    async def test_deploy_model_invalid_model_uri(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test deployment fails with invalid model URI."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        # Mock MLflow to return validation error
        mock_mlflow_client.validate_model_uri.return_value = MockMLflowResponses.VALIDATE_MODEL_NOT_FOUND

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/nonexistent/1",
            env="test-env",
            cores=2,
            memory=4
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.deploy_model(request, test_user)

        assert exc_info.value.status_code == 400
        assert "Invalid model URI" in str(exc_info.value.detail)

        # Verify DCM was not called
        assert not mock_dcm_client.build_resource.called

    @pytest.mark.asyncio
    async def test_deploy_model_environment_not_found(
        self,
        db_session,
        test_user,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test deployment fails when environment doesn't exist."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="nonexistent-env",
            cores=2,
            memory=4
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.deploy_model(request, test_user)

        assert exc_info.value.status_code == 404
        assert "Environment" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_deploy_model_already_deployed_version(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test deployment fails when same version is already deployed."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        # First deployment
        request1 = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4
        )
        await service.deploy_model(request1, test_user)

        # Try to deploy same version again
        request2 = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.deploy_model(request2, test_user)

        assert exc_info.value.status_code == 400
        assert "already deployed" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_deploy_model_creates_infra_config(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test deployment creates API serve infra config."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=4,
            memory=8,
            min_replicas=2,
            max_replicas=5,
            node_capacity="ondemand"
        )

        # Act
        await service.deploy_model(request, test_user)

        # Assert
        serve = await Serve.get(name="test-model")
        config = await APIServeInfraConfig.get_or_none(serve=serve, environment=test_environment)

        assert config is not None
        assert config.fast_api_config["cores"] == 4
        assert config.fast_api_config["memory"] == 8
        assert config.fast_api_config["min_replicas"] == 2
        assert config.fast_api_config["max_replicas"] == 5

    @pytest.mark.asyncio
    async def test_deploy_model_with_storage_strategy(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test deployment with explicit storage strategy."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4,
            storage_strategy="pvc"
        )

        # Act
        result = await service.deploy_model(request, test_user)

        # Assert
        assert "service_url" in result

        # Verify build_resource was called with storage strategy in values
        build_call_args = mock_dcm_client.build_resource.call_args
        values = build_call_args.kwargs["values"]
        # The storage strategy should be in the values passed to DCM
        assert "modelCache" in values or "storage" in str(values)


@pytest.mark.unit
class TestOneClickUndeploy:
    """Test suite for one-click model undeployment."""

    @pytest.mark.asyncio
    async def test_undeploy_model_success(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test successful model undeployment."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        # First deploy a model
        deploy_request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4
        )
        await service.deploy_model(deploy_request, test_user)

        # Act - undeploy
        undeploy_request = ModelUndeployRequest(
            serve_name="test-model",
            artifact_version="v1",
            env="test-env"
        )
        result = await service.undeploy_model(undeploy_request)

        # Assert
        assert "message" in result
        assert "Undeploy initiated" in result["message"]
        assert mock_dcm_client.stop_resource.called

        # Verify active deployment was removed
        serve = await Serve.get(name="test-model")
        active = await ActiveDeployment.get_or_none(serve=serve, environment=test_environment)
        assert active is None

    @pytest.mark.asyncio
    async def test_undeploy_model_not_found(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test undeploy fails when serve doesn't exist."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        undeploy_request = ModelUndeployRequest(
            serve_name="nonexistent-model",
            artifact_version="v1",
            env="test-env"
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.undeploy_model(undeploy_request)

        assert exc_info.value.status_code == 404
        assert "not found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_undeploy_model_no_active_deployment(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client
    ):
        """Test undeploy fails when no active deployment exists."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        # Create serve but don't deploy
        await Serve.create(
            name="test-model",
            type=ServeType.API.value,
            description="Test",
            space="test",
            created_by=test_user
        )

        undeploy_request = ModelUndeployRequest(
            serve_name="test-model",
            artifact_version="v1",
            env="test-env"
        )

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.undeploy_model(undeploy_request)

        assert exc_info.value.status_code == 404
        assert "No active deployment" in str(exc_info.value.detail)


@pytest.mark.unit
class TestOneClickDeployStrategy:
    """Tests for one-click deploy_model deployment strategy mapping and fallback."""

    @pytest.mark.asyncio
    async def test_deploy_model_canary_without_istio_returns_fallback_fields(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """When canary requested and enable_istio=false, response includes fallback fields."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4,
            deployment_strategy="canary",
            deployment_strategy_config=None,
        )

        result = await service.deploy_model(request, test_user)

        assert "service_url" in result
        assert result["deployment_strategy_requested"] == "canary"
        assert result["deployment_strategy_applied"] == "rolling"
        assert result["fallback_reason"] == "Istio not enabled for environment"

    @pytest.mark.asyncio
    async def test_deploy_model_fallback_persists_requested_strategy(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """When canary+!istio fallback occurs, AppLayerDeployment stores requested strategy for audit."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4,
            deployment_strategy="canary",
            deployment_strategy_config={"max_surge": "50%", "max_unavailable": 1},
        )

        await service.deploy_model(request, test_user)

        serve = await Serve.get(name="test-model")
        active = await ActiveDeployment.get_or_none(serve=serve, environment=test_environment)
        assert active is not None

        deployment = await active.deployment
        app_layer = await AppLayerDeployment.get_or_none(deployment=deployment)
        assert app_layer is not None
        # Requested strategy is persisted for audit even when fallback to rolling occurred
        assert app_layer.deployment_strategy == "canary"
        assert app_layer.deployment_params == {"max_surge": "50%", "max_unavailable": 1}

    @pytest.mark.asyncio
    async def test_deploy_model_canary_with_istio_no_fallback_fields(
        self,
        db_session,
        test_user,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """When canary requested and enable_istio=true, no fallback fields in response."""
        await Environment.create(
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
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="istio-env",
            cores=2,
            memory=4,
            deployment_strategy="canary",
            deployment_strategy_config=None,
        )

        result = await service.deploy_model(request, test_user)

        assert "service_url" in result
        assert "deployment_strategy_requested" not in result
        assert "deployment_strategy_applied" not in result
        assert "fallback_reason" not in result

    @pytest.mark.asyncio
    async def test_deploy_model_rolling_no_fallback_fields(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """When rolling requested, no fallback fields in response."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4,
            deployment_strategy="rolling",
            deployment_strategy_config=None,
        )

        result = await service.deploy_model(request, test_user)

        assert "service_url" in result
        assert "deployment_strategy_requested" not in result
        assert "deployment_strategy_applied" not in result
        assert "fallback_reason" not in result

    @pytest.mark.asyncio
    async def test_deploy_model_passes_effective_strategy_to_values_generator(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """When canary+!istio, generate_fastapi_values_for_one_click receives effective strategy=rolling."""
        mock_gen = MagicMock(return_value={"name": "test", "envs": {}, "rolling": {}, "flagger": {}})
        with patch(
            "ml_serve_core.service.deployment_service.generate_fastapi_values_for_one_click_model_deployment",
            mock_gen,
        ):
            service = DeploymentService()
            service.dcm_client = mock_dcm_client
            service.mlflow_client = mock_mlflow_client

            request = ModelDeploymentRequest(
                serve_name="test-model",
                artifact_version="v1",
                model_uri="models:/iris/1",
                env="test-env",
                cores=2,
                memory=4,
                deployment_strategy="canary",
                deployment_strategy_config={"max_surge": "50%"},
            )

            await service.deploy_model(request, test_user)

            mock_gen.assert_called_once()
            call_kwargs = mock_gen.call_args.kwargs
            assert call_kwargs["deployment_strategy"] == "rolling"
            assert call_kwargs["deployment_strategy_config"] == {"max_surge": "50%"}
            assert call_kwargs["enable_istio"] is False

    @pytest.mark.asyncio
    async def test_deploy_model_persists_strategy_in_app_layer_deployment(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """deploy_model persists deployment_strategy and deployment_params in AppLayerDeployment."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4,
            deployment_strategy="canary",
            deployment_strategy_config={"max_surge": "25%", "max_unavailable": 0},
        )

        await service.deploy_model(request, test_user)

        serve = await Serve.get(name="test-model")
        active = await ActiveDeployment.get_or_none(serve=serve, environment=test_environment)
        assert active is not None

        deployment = await active.deployment
        app_layer = await AppLayerDeployment.get_or_none(deployment=deployment)
        assert app_layer is not None
        assert app_layer.deployment_strategy == "canary"
        assert app_layer.deployment_params == {"max_surge": "25%", "max_unavailable": 0}

    @pytest.mark.asyncio
    async def test_deploy_model_default_strategy_persists_rolling(
        self,
        db_session,
        test_user,
        test_environment,
        mock_dcm_client,
        mock_mlflow_client,
    ):
        """When no strategy specified, deploy_model persists rolling for audit."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        service.mlflow_client = mock_mlflow_client

        request = ModelDeploymentRequest(
            serve_name="test-model",
            artifact_version="v1",
            model_uri="models:/iris/1",
            env="test-env",
            cores=2,
            memory=4,
        )

        await service.deploy_model(request, test_user)

        serve = await Serve.get(name="test-model")
        active = await ActiveDeployment.get_or_none(serve=serve, environment=test_environment)
        assert active is not None

        deployment = await active.deployment
        app_layer = await AppLayerDeployment.get_or_none(deployment=deployment)
        assert app_layer is not None
        assert app_layer.deployment_strategy == "rolling"
        assert app_layer.deployment_params is None


@pytest.mark.unit
class TestModelDeploymentRequestDeploymentStrategyValidation:
    """Unit tests for deployment_strategy validation."""

    def _minimal_request_kwargs(self):
        return {
            "serve_name": "test-model",
            "artifact_version": "v1",
            "model_uri": "models:/iris/1",
            "env": "test-env",
            "cores": 2,
            "memory": 4,
        }

    def test_accepts_rolling_lowercase(self):
        """deployment_strategy='rolling' is accepted and normalized."""
        req = ModelDeploymentRequest(
            **self._minimal_request_kwargs(),
            deployment_strategy="rolling",
        )
        assert req.deployment_strategy == "rolling"

    def test_accepts_rolling_case_insensitive(self):
        """Rolling/ROLLING normalized to 'rolling'."""
        for value in ("Rolling", "ROLLING", "  rolling  "):
            req = ModelDeploymentRequest(
                **self._minimal_request_kwargs(),
                deployment_strategy=value,
            )
            assert req.deployment_strategy == "rolling"

    def test_accepts_canary_lowercase(self):
        """deployment_strategy='canary' is accepted and normalized."""
        req = ModelDeploymentRequest(
            **self._minimal_request_kwargs(),
            deployment_strategy="canary",
        )
        assert req.deployment_strategy == "canary"

    def test_accepts_canary_case_insensitive(self):
        """Canary/CANARY normalized to 'canary'."""
        for value in ("Canary", "CANARY", "  canary  "):
            req = ModelDeploymentRequest(
                **self._minimal_request_kwargs(),
                deployment_strategy=value,
            )
            assert req.deployment_strategy == "canary"

    def test_accepts_none_omitted(self):
        """deployment_strategy=None or omitted is accepted."""
        req = ModelDeploymentRequest(**self._minimal_request_kwargs())
        assert req.deployment_strategy is None

        req2 = ModelDeploymentRequest(
            **self._minimal_request_kwargs(),
            deployment_strategy=None,
        )
        assert req2.deployment_strategy is None

    def test_accepts_empty_string_as_omitted(self):
        """deployment_strategy='' or whitespace-only is treated as omitted."""
        req = ModelDeploymentRequest(
            **self._minimal_request_kwargs(),
            deployment_strategy="",
        )
        assert req.deployment_strategy is None

        req2 = ModelDeploymentRequest(
            **self._minimal_request_kwargs(),
            deployment_strategy="   ",
        )
        assert req2.deployment_strategy is None

    def test_rejects_invalid_strategy(self):
        """Invalid deployment_strategy raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            ModelDeploymentRequest(
                **self._minimal_request_kwargs(),
                deployment_strategy="invalid",
            )
        errors = exc_info.value.errors()
        assert len(errors) >= 1
        err_str = str(exc_info.value).lower()
        assert "rolling" in err_str or "canary" in err_str
        assert "invalid" in err_str

    def test_rejects_blue_green_strategy(self):
        """deployment_strategy='blue-green' is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ModelDeploymentRequest(
                **self._minimal_request_kwargs(),
                deployment_strategy="blue-green",
            )
        errors = exc_info.value.errors()
        assert len(errors) >= 1
        err_str = str(exc_info.value).lower()
        assert (
            "deployment_strategy" in err_str
            or "rolling" in err_str
            or "canary" in err_str
        )
