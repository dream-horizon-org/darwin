"""
Unit tests for infrastructure configuration updates and auto-redeployment.

Tests the update_config flow that triggers automatic redeployment
when infrastructure settings are changed.
"""
import pytest
from unittest.mock import AsyncMock, patch

from ml_serve_app_layer.dtos.requests import (
    ServeConfigRequest,
    APIServeConfigRequest,
    FastAPIServeConfigRequest
)
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_core.service.serve_config_service import ServeConfigService
from ml_serve_model import Deployment
from ml_serve_model.enums import BackendType, DeploymentStatus
from ml_serve_model.serve_configs import APIServeInfraConfig
from ml_serve_model.active_deployment import ActiveDeployment
from ml_serve_model.app_layer_deployments import AppLayerDeployment
from tests.fixtures.mock_responses import MockDCMResponses


@pytest.mark.unit
class TestInfraConfigUpdate:
    """Test suite for infrastructure configuration updates."""
    
    @pytest.mark.asyncio
    async def test_update_infra_config_success(
        self,
        db_session,
        test_user,
        test_serve,
        test_environment
    ):
        """Test successful infrastructure config update."""
        # Arrange
        service = ServeConfigService()
        
        # Create initial config
        initial_config = await APIServeInfraConfig.create(
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
        
        # New config values
        update_request = APIServeConfigRequest(
            backend_type="fastapi",
            fast_api_config=FastAPIServeConfigRequest(
                cores=8,
                memory=16,
                min_replicas=5,
                max_replicas=20,
                node_capacity_type="on-demand"
            )
        )
        
        # Act
        updated_config = await service.update_api_serve_configs(
            test_serve,
            test_environment,
            update_request
        )
        
        # Assert
        assert updated_config is not None
        assert updated_config.id == initial_config.id
        assert updated_config.fast_api_config["cores"] == 8
        assert updated_config.fast_api_config["memory"] == 16
        assert updated_config.fast_api_config["min_replicas"] == 5
        assert updated_config.fast_api_config["max_replicas"] == 20
        assert updated_config.fast_api_config["node_capacity_type"] == "on-demand"
    
    @pytest.mark.asyncio
    async def test_update_infra_config_partial_update(
        self,
        db_session,
        test_user,
        test_serve,
        test_environment
    ):
        """Test partial infrastructure config update (only some fields)."""
        # Arrange
        service = ServeConfigService()
        
        # Create initial config
        initial_config = await APIServeInfraConfig.create(
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
        
        # Update only replicas
        update_request = APIServeConfigRequest(
            backend_type="fastapi",
            fast_api_config=FastAPIServeConfigRequest(
                cores=2,  # Keep same
                memory=4,  # Keep same
                min_replicas=10,  # Update
                max_replicas=30,  # Update
                node_capacity_type="spot"  # Keep same
            )
        )
        
        # Act
        updated_config = await service.update_api_serve_configs(
            test_serve,
            test_environment,
            update_request
        )
        
        # Assert
        assert updated_config.fast_api_config["cores"] == 2
        assert updated_config.fast_api_config["memory"] == 4
        assert updated_config.fast_api_config["min_replicas"] == 10
        assert updated_config.fast_api_config["max_replicas"] == 30


@pytest.mark.unit
class TestAutoRedeployment:
    """Test suite for automatic redeployment on config updates."""
    
    @pytest.mark.asyncio
    async def test_redeploy_with_updated_infra_config(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test automatic redeployment when infra config is updated."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        
        # Create initial config
        initial_config = await APIServeInfraConfig.create(
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
        
        # Create an active deployment
        deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=test_environment,
            created_by=test_user
        )
        
        await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy="rolling",
            environment_variables={"TEST": "value"}
        )
        
        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=deployment
        )
        
        # Update config with new values
        updated_config = await APIServeInfraConfig.get(id=initial_config.id)
        updated_config.fast_api_config = {
            "cores": 8,
            "memory": 16,
            "min_replicas": 5,
            "max_replicas": 20,
            "node_capacity_type": "on-demand"
        }
        await updated_config.save()
        
        # Act - trigger redeployment
        await service.redeploy_api_serve_with_updated_infra_config(
            serve=test_serve,
            api_serve_config=updated_config,
            env=test_environment,
            user=test_user
        )
        
        # Assert
        # Verify DCM update_resource was called
        assert mock_dcm_client.update_resource.called or mock_dcm_client.build_resource.called
        
        # Verify start_resource was called to restart with new config
        assert mock_dcm_client.start_resource.called
    
    @pytest.mark.asyncio
    async def test_redeploy_no_active_deployment(
        self,
        db_session,
        test_user,
        test_serve,
        test_environment,
        mock_dcm_client
    ):
        """Test redeployment skips when no active deployment exists."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        
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
        
        # Act - try to redeploy without active deployment
        result = await service.redeploy_api_serve_with_updated_infra_config(
            serve=test_serve,
            api_serve_config=config,
            env=test_environment,
            user=test_user
        )
        
        # Assert - should return None and not call DCM
        assert result is None
        assert not mock_dcm_client.update_resource.called
        assert not mock_dcm_client.start_resource.called
    
    @pytest.mark.asyncio
    async def test_redeploy_preserves_environment_variables(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test redeployment preserves existing environment variables."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        
        config = await APIServeInfraConfig.create(
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
        
        # Create deployment with env vars
        deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=test_environment,
            created_by=test_user
        )
        
        original_env_vars = {
            "MODEL_PATH": "/models/production",
            "LOG_LEVEL": "DEBUG",
            "API_KEY": "secret"
        }
        
        await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy="rolling",
            environment_variables=original_env_vars
        )
        
        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=deployment
        )
        
        # Update config
        config.fast_api_config["cores"] = 8
        await config.save()
        
        # Mock update to fail, forcing rebuild path
        mock_dcm_client.update_resource.side_effect = Exception("Update failed")
        mock_dcm_client.build_resource.return_value = MockDCMResponses.BUILD_SUCCESS
        mock_dcm_client.start_resource.return_value = MockDCMResponses.START_SUCCESS
        
        # Act
        await service.redeploy_api_serve_with_updated_infra_config(
            serve=test_serve,
            api_serve_config=config,
            env=test_environment,
            user=test_user
        )
        
        # Assert - verify build was called with env vars preserved
        build_call = mock_dcm_client.build_resource.call_args
        values = build_call.kwargs["values"]
        
        # Check that original env vars are in the values
        assert "envs" in values
        for key in original_env_vars:
            assert key.upper() in values["envs"]
    
    @pytest.mark.asyncio
    async def test_redeploy_handles_dcm_update_failure_gracefully(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test redeployment falls back to rebuild when update fails."""
        # Arrange
        service = DeploymentService()
        service.dcm_client = mock_dcm_client
        
        config = await APIServeInfraConfig.create(
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
        
        deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=test_environment,
            created_by=test_user
        )
        
        await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy="rolling"
        )
        
        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=deployment
        )
        
        # Mock update to fail
        mock_dcm_client.update_resource.side_effect = Exception("Artifact not found")
        mock_dcm_client.build_resource.return_value = MockDCMResponses.BUILD_SUCCESS
        mock_dcm_client.start_resource.return_value = MockDCMResponses.START_SUCCESS
        
        # Act
        await service.redeploy_api_serve_with_updated_infra_config(
            serve=test_serve,
            api_serve_config=config,
            env=test_environment,
            user=test_user
        )
        
        # Assert - should fall back to full rebuild
        assert mock_dcm_client.update_resource.called
        assert mock_dcm_client.build_resource.called
        assert mock_dcm_client.start_resource.called
    
    @pytest.mark.asyncio
    async def test_update_config_triggers_redeploy_for_active_serve(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client
    ):
        """Test that updating config automatically triggers redeployment."""
        # Arrange
        deployment_service = DeploymentService()
        deployment_service.dcm_client = mock_dcm_client
        
        config_service = ServeConfigService()
        
        # Create initial deployment
        initial_config = await APIServeInfraConfig.create(
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
        
        deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=test_environment,
            created_by=test_user
        )
        
        await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy="rolling"
        )
        
        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=deployment
        )
        
        # Act - update config (this should trigger redeploy in the actual flow)
        update_request = APIServeConfigRequest(
            backend_type="fastapi",
            fast_api_config=FastAPIServeConfigRequest(
                cores=8,
                memory=16,
                min_replicas=5,
                max_replicas=20,
                node_capacity_type="on-demand"
            )
        )
        
        updated_config = await config_service.update_api_serve_configs(
            test_serve,
            test_environment,
            update_request
        )
        
        # Manually trigger redeploy (in actual code, this is called from the router)
        await deployment_service.redeploy_api_serve_with_updated_infra_config(
            serve=test_serve,
            api_serve_config=updated_config,
            env=test_environment,
            user=test_user
        )
        
        # Assert
        assert updated_config.fast_api_config["cores"] == 8
        assert mock_dcm_client.start_resource.called

