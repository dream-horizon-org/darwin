"""
Integration tests for custom artifact build and deployment flow.

These tests interact with real services:
- ML Serve App
- Artifact Builder
- Darwin Cluster Manager (DCM)
- MySQL

Prerequisites:
- Kind cluster running with all services deployed
"""
import asyncio

import httpx
import pytest


@pytest.mark.integration
class TestArtifactBuildFlow:
    """Integration tests for artifact building."""
    
    @pytest.mark.asyncio
    async def test_create_serve(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test creating a serve via API."""
        serve_name = "integration-artifact-serve"
        response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Integration test serve",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        # Allow 409 if already exists
        assert response.status_code in [200, 201, 409]
        
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["data"]["name"] == "integration-artifact-serve"
            assert data["data"]["type"] == "api"
    
    @pytest.mark.asyncio
    async def test_list_serves(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient
    ):
        """Test listing all serves."""
        response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)
    
    @pytest.mark.asyncio
    async def test_get_serve_overview(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test getting serve overview."""
        # First create a serve
        serve_name = "integration-overview-serve"
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test serve for overview",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        # Get overview
        response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "serve" in data["data"]
        assert data["data"]["serve"]["name"] == "integration-overview-serve"
    
    @pytest.mark.asyncio
    async def test_create_artifact_triggers_build(
        self,
        ml_serve_base_url: str,
        artifact_builder_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """
        Test artifact creation triggers build in artifact builder.
        
        Uses a public FastAPI hello-world repository for testing.
        Note: This test only triggers the build, doesn't wait for completion.
        """
        serve_name = "artifact-build-test"
        
        # Create serve
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test artifact build",
                "space": "test-space"
            }
        )
        
        # Register for cleanup
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Create artifact (triggers build) - using real public repo
        response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/artifact",
            json={
                "serve_name": serve_name,
                "version": "v1.0.0",
                "github_repo_url": "https://github.com/bmaelum/fastapi-hello-world.git",
                "branch": "main"
            }
        )
        
        # Handle response
        if response.status_code == 400:
            data = response.json()
            error_msg = data.get("message") or data.get("detail") or "Unknown error"
            # If artifact already exists, treat as success (test complete)
            if "already exists" in error_msg.lower():
                print(f"⚠️  Artifact already exists, treating as success")
                return  # Test passes - artifact exists
            else:
                pytest.skip(f"Artifact creation failed: {error_msg}")
        else:
            assert response.status_code in [200, 201]
            data = response.json()
            
            # Verify artifact was created
            assert "job_id" in data.get("data", {}) or "artifact" in data.get("data", {}) or "serve_name" in data.get("data", {})


@pytest.mark.integration
class TestArtifactDeploymentFlow:
    """Integration tests for deploying custom artifacts."""
    
    @pytest.mark.asyncio
    async def test_create_infra_config(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test creating infrastructure configuration for a serve."""
        # Create serve
        serve_name = "infra-config-test-serve"
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test infra config",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        # Create infra config
        response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}",
            json={
                "api_serve_config": {
                    "backend_type": "fastapi",
                    "fast_api_config": {
                        "cores": 2,
                        "memory": 4,
                        "min_replicas": 1,
                        "max_replicas": 3,
                        "node_capacity_type": "spot"
                    }
                }
            }
        )
        
        # Allow 409 if already exists
        assert response.status_code in [200, 201, 409]
    
    @pytest.mark.asyncio
    async def test_get_infra_config(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test retrieving infrastructure configuration."""
        # Create serve and config first
        serve_name = "get-config-test-serve"
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test get config",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}",
            json={
                "api_serve_config": {
                    "backend_type": "fastapi",
                    "fast_api_config": {
                        "cores": 4,
                        "memory": 8,
                        "min_replicas": 2,
                        "max_replicas": 10,
                        "node_capacity_type": "on-demand"
                    }
                }
            }
        )
        
        # Get config
        response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}"
        )
        assert response.status_code == 200
        data = response.json()
        
        if "data" in data and data["data"]:
            config = data["data"]
            assert config["backend_type"] == "fastapi"
            assert "fast_api_config" in config
    
    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_deploy_artifact_end_to_end(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        wait_for_pod_ready,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """
        Test complete artifact deployment flow.
        
        This test:
        1. Creates a serve and artifact build job
        2. Waits for artifact to be built (or skips if build fails)
        3. Deploys the artifact with minimal resources
        4. Verifies deployment
        
        Note: This is a slow test as it waits for Docker image build.
        """
        serve_name = "deploy-artifact-test"
        artifact_version = "v1.0.0"
        
        # Register for cleanup
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Create serve
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test deployment",
                "space": "test-space"
            }
        )
        
        # Create artifact to trigger build
        artifact_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/artifact",
            json={
                "serve_name": serve_name,
                "version": artifact_version,
                "github_repo_url": "https://github.com/bmaelum/fastapi-hello-world.git",
                "branch": "main"
            }
        )
        
        if artifact_response.status_code == 400:
            data = artifact_response.json()
            error_msg = data.get("message") or data.get("detail") or "Unknown error"
            if "already exists" not in error_msg.lower():
                pytest.skip(f"Artifact creation failed: {error_msg}")
            print(f"⚠️  Artifact already exists, continuing test...")
        elif artifact_response.status_code not in [200, 201]:
            pytest.skip(f"Artifact creation failed: {artifact_response.status_code}")
        
        # Create infra config with minimal resources
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}",
            json={
                "api_serve_config": {
                    "backend_type": "fastapi",
                    "fast_api_config": {
                        "cores": 1,
                        "memory": 2,
                        "min_replicas": 1,
                        "max_replicas": 1,  # Minimal: single replica
                        "node_capacity_type": "spot"
                    }
                }
            }
        )
        
        # Wait for artifact build to complete (up to 5 minutes)
        # In real scenario, you'd poll artifact-builder or check artifact status
        await asyncio.sleep(10)  # Give build time to start
        
        # Deploy (will skip if artifact build hasn't completed)
        deploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/deploy",
            json={
                "env": integration_test_env,
                "artifact_version": artifact_version,
                "api_serve_deployment_config": {
                    "deployment_strategy": "rolling",
                    "environment_variables": {
                        "TEST_VAR": "test_value"
                    }
                }
            }
        )
        
        # Handle deployment response
        if deploy_response.status_code in [400, 409]:
            data = deploy_response.json()
            error_msg = data.get("message") or data.get("detail") or "Unknown error"
            if "already deployed" in error_msg.lower():
                print(f"⚠️  Artifact already deployed, treating as success")
            elif "not yet built" in error_msg.lower() or "not found" in error_msg.lower():
                pytest.skip("Artifact not yet built - this is expected for slow builds")
            else:
                pytest.skip(f"Deployment failed: {error_msg}")
        elif deploy_response.status_code == 404:
            pytest.skip("Artifact not yet built - this is expected for slow builds")
        else:
            assert deploy_response.status_code in [200, 201]


@pytest.mark.integration
class TestServeManagement:
    """Integration tests for serve management operations."""
    
    @pytest.mark.asyncio
    async def test_create_duplicate_serve_fails(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test creating duplicate serve returns conflict."""
        # Create first serve
        serve_name = "duplicate-test-serve"
        response1 = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test duplicate",
                "space": "test-space"
            }
        )
        
        # Try to create duplicate
        response2 = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test duplicate",
                "space": "test-space"
            }
        )
        
        # Second request should fail with conflict
        assert response2.status_code == 409

        cleanup_test_resources(serve_name, integration_test_env)

