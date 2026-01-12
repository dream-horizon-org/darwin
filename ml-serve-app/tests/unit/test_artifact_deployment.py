"""
Unit tests for custom artifact build and deployment flow.

Tests the artifact creation, building via artifact-builder, and
deployment through DCM with mocked external dependencies.
"""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from ml_serve_app_layer.dtos.requests import (
    CreateServeRequest,
    CreateArtifactRequest,
    DeploymentRequest,
    APIServeDeploymentConfigRequest,
    ServeConfigRequest,
    APIServeConfigRequest,
    FastAPIServeConfigRequest
)
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_core.service.artifact_service import ArtifactService
from ml_serve_core.service.serve_service import ServeService
from ml_serve_core.service.serve_config_service import ServeConfigService
from ml_serve_model import Serve, Artifact, Deployment
from ml_serve_model.enums import ServeType, BackendType, DeploymentStatus
from ml_serve_model.serve_configs import APIServeInfraConfig
from ml_serve_model.app_layer_deployments import AppLayerDeployment
from ml_serve_model.active_deployment import ActiveDeployment
from tests.fixtures.mock_responses import MockDCMResponses, MockArtifactBuilderResponses


@pytest.mark.unit
class TestArtifactCreation:
    """Test suite for artifact creation and building."""
    
    @pytest.mark.asyncio
    async def test_create_serve_success(
        self,
        db_session,
        test_user
    ):
        """Test successful serve creation."""
        # Arrange
        service = ServeService()
        request = CreateServeRequest(
            name="my-model-serve",
            type="api",
            description="Production model serving",
            space="ml-team"
        )
        
        # Act
        serve = await service.create_serve(request, test_user)
        
        # Assert
        assert serve is not None
        assert serve.name == "my-model-serve"
        assert serve.type == ServeType.API.value
        assert serve.description == "Production model serving"
        assert serve.space == "ml-team"
        
        # Verify in database
        db_serve = await Serve.get(name="my-model-serve")
        assert db_serve.name == serve.name
    
    @pytest.mark.asyncio
    async def test_get_artifacts_by_serve(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact
    ):
        """Test retrieving artifacts for a serve."""
        # Arrange
        service = ArtifactService()
        
        # Act
        artifacts = await service.get_artifacts_by_serve_id(test_serve.id)
        
        # Assert
        assert len(artifacts) > 0
        assert artifacts[0].id == test_artifact.id


@pytest.mark.unit
class TestArtifactDeployment:
    """Test suite for deploying custom artifacts."""
    
    @pytest.mark.asyncio
    async def test_deploy_artifact_success(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test successful artifact deployment."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        
        # Create infra config first
        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 4,
                "memory": 8,
                "min_replicas": 2,
                "max_replicas": 10,
                "node_capacity_type": "spot"
            },
            created_by=test_user,
            updated_by=test_user
        )
        
        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling",
            environment_variables={
                "MODEL_PATH": "/models/production"
            }
        )
        
        # Act
        deployment, response = await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user
        )
        
        # Assert
        assert deployment is not None
        assert response is not None
        assert "service_url" in response
        
        # Verify DCM was called
        assert mock_dcm_client.build_resource.called
        assert mock_dcm_client.start_resource.called
        
        # Verify deployment in database
        db_deployment = await Deployment.get(id=deployment.id)
        assert db_deployment.status == DeploymentStatus.ACTIVE.value
    
    @pytest.mark.asyncio
    async def test_deploy_artifact_with_environment_variables(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test deployment with custom environment variables."""
        # Arrange
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
                "node_capacity_type": "spot"
            },
            created_by=test_user,
            updated_by=test_user
        )
        
        custom_env_vars = {
            "MODEL_PATH": "/models/production",
            "LOG_LEVEL": "DEBUG",
            "API_KEY": "secret-key"
        }
        
        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling",
            environment_variables=custom_env_vars
        )
        
        # Act
        deployment, response = await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user
        )
        
        # Assert
        app_deployment = await AppLayerDeployment.get(deployment=deployment)
        assert app_deployment.environment_variables == custom_env_vars
    
    @pytest.mark.asyncio
    async def test_deploy_artifact_calls_dcm(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test deployment calls DCM with correct parameters."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        
        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 4,
                "memory": 8,
                "min_replicas": 2,
                "max_replicas": 10,
                "node_capacity_type": "on-demand"
            },
            created_by=test_user,
            updated_by=test_user
        )
        
        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling",
            environment_variables={"TEST": "value"}
        )
        
        # Act
        await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user
        )
        
        # Assert - verify DCM was called
        assert mock_dcm_client.build_resource.called
        assert mock_dcm_client.start_resource.called
    
    @pytest.mark.asyncio
    async def test_deploy_artifact_updates_active_deployment(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test deployment updates active deployment pointer."""
        # Arrange
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
                "node_capacity_type": "spot"
            },
            created_by=test_user,
            updated_by=test_user
        )
        
        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling"
        )
        
        deployment_request = DeploymentRequest(
            env="test-env",
            artifact_version=test_artifact.version,
            api_serve_deployment_config=deployment_config
        )
        
        # Act
        await service.deploy_artifact(
            serve=test_serve,
            artifact=test_artifact,
            serve_config=infra_config,
            env=test_environment,
            deployment_request=deployment_request,
            user=test_user
        )
        
        # Assert - verify active deployment exists
        active = await ActiveDeployment.get_or_none(
            serve=test_serve,
            environment=test_environment
        )
        assert active is not None
        
        deployment = await active.deployment
        artifact = await deployment.artifact
        assert artifact.id == test_artifact.id


@pytest.mark.unit
class TestServeConfiguration:
    """Test suite for serve infrastructure configuration."""
    
    @pytest.mark.asyncio
    async def test_create_api_serve_config(
        self,
        db_session,
        test_user,
        test_serve,
        test_environment
    ):
        """Test creating API serve infrastructure config."""
        # Arrange
        service = ServeConfigService()
        
        # Act
        config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 4,
                "memory": 8,
                "min_replicas": 2,
                "max_replicas": 10,
                "node_capacity_type": "spot"
            },
            created_by=test_user,
            updated_by=test_user
        )
        
        # Assert
        assert config is not None
        assert config.backend_type == BackendType.FastAPI.value
        assert config.fast_api_config["cores"] == 4
        assert config.fast_api_config["memory"] == 8
        
        # Verify in database
        db_config = await APIServeInfraConfig.get(id=config.id)
        serve = await db_config.serve
        assert serve.id == test_serve.id
    
    @pytest.mark.asyncio
    async def test_get_serve_config(
        self,
        db_session,
        test_user,
        test_serve,
        test_environment
    ):
        """Test retrieving serve configuration."""
        # Arrange
        # Create config
        created_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 3,
                "node_capacity_type": "spot"
            },
            created_by=test_user,
            updated_by=test_user
        )
        
        # Act - retrieve config directly
        config = await APIServeInfraConfig.get_or_none(
            serve=test_serve,
            environment=test_environment
        )
        
        # Assert
        assert config is not None
        assert config.id == created_config.id
        assert config.fast_api_config["cores"] == 2

