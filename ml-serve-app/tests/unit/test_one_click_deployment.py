"""
Unit tests for one-click model deployment flow.

Tests the deploy_model and undeploy_model functionality with mocked
external dependencies (DCM, MLflow).
"""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from ml_serve_app_layer.dtos.requests import ModelDeploymentRequest, ModelUndeployRequest
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_model import Serve, Environment, Artifact, User
from ml_serve_model.enums import ServeType
from ml_serve_model.active_deployment import ActiveDeployment
from ml_serve_model.serve_configs import APIServeInfraConfig
from tests.fixtures.mock_responses import MockDCMResponses, MockMLflowResponses


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
        serve = await Serve.create(
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

