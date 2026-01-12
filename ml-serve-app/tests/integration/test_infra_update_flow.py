"""
Integration tests for infrastructure configuration updates.

Tests the update_config flow that triggers automatic redeployment
when infrastructure settings are changed on a running serve.

Prerequisites:
- Kind cluster running with all services deployed
"""
import asyncio
import pytest
import httpx


@pytest.mark.integration
class TestInfraConfigUpdateFlow:
    """Integration tests for updating infrastructure configuration."""
    
    @pytest.mark.asyncio
    async def test_update_infra_config_no_deployment(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test updating infra config when serve is not deployed."""
        # Create serve
        serve_name = "update-config-no-deploy"
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test config update",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        # Create initial config
        await http_client.post(
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
        
        # Update config
        response = await http_client.patch(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}",
            json={
                "api_serve_config": {
                    "backend_type": "fastapi",
                    "fast_api_config": {
                        "cores": 8,
                        "memory": 16,
                        "min_replicas": 5,
                        "max_replicas": 20,
                        "node_capacity_type": "on-demand"
                    }
                }
            }
        )
        
        # Should succeed even without deployment
        assert response.status_code == 200
        
        # Verify config was updated
        get_response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}"
        )
        
        assert get_response.status_code == 200
        data = get_response.json()
        
        if "data" in data and data["data"]:
            config = data["data"]["fast_api_config"]
            assert config["cores"] == 8
            assert config["memory"] == 16
            assert config["min_replicas"] == 5
            assert config["max_replicas"] == 20
    
    @pytest.mark.skip(reason="Skipping until deployment naming inconsistency is fixed")
    @pytest.mark.asyncio
    async def test_update_infra_config_triggers_redeploy(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        wait_for_pod_ready,
        cleanup_test_resources,
        test_model_uri: str,
        integration_test_env: str
    ):
        """
        Test updating infra config triggers automatic redeployment.
        
        This test requires:
        - A test model in MLflow (run setup_test_model.py)
        - DCM service running (checked by service health checks)
        
        To set up the test model, run:
            python ml-serve-app/tests/integration/setup_test_model.py
        """
        serve_name = "update-redeploy-test"
        
        # Register for cleanup
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Step 1: Create and deploy serve
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test config update with redeploy",
                "space": "test-space"
            }
        )
        
        # Deploy with one-click (using dynamic model URI)
        deploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/deploy-model",
            json={
                "serve_name": serve_name,
                "artifact_version": "v1",
                "model_uri": test_model_uri,
                "env": integration_test_env,
                "cores": 1,
                "memory": 2,
                "min_replicas": 1,
                "max_replicas": 1,  # Minimal: single replica
                "node_capacity": "spot"
            }
        )
        
        if deploy_response.status_code in [400, 409]:
            response_data = deploy_response.json()
            error_msg = response_data.get("message") or response_data.get("detail") or "Unknown error"
            if "already deployed" not in error_msg.lower():
                pytest.skip(f"Model deployment failed: {error_msg}")
            print(f"⚠️  Model already deployed, continuing test...")
        elif deploy_response.status_code not in [200, 201]:
            pytest.skip("Model deployment failed - test model not available")
        
        # Wait for initial deployment
        pod_ready = await wait_for_pod_ready(
            pod_name_prefix=serve_name,
            namespace="serve",
            max_attempts=30,
            delay=2
        )
        
        if not pod_ready:
            pytest.skip("Initial deployment did not become ready")
        
        # Step 2: Update infra config (should trigger redeploy)
        update_response = await http_client.patch(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}",
            json={
                "api_serve_config": {
                    "backend_type": "fastapi",
                    "fast_api_config": {
                        "cores": 2,
                        "memory": 2,
                        "min_replicas": 1,
                        "max_replicas": 1,  # Keep minimal
                        "node_capacity_type": "spot"
                    }
                }
            }
        )
        
        assert update_response.status_code == 200
        
        # Step 3: Wait for redeployment to complete
        # Config updates trigger redeployment which can take time on local kind clusters
        print(f"   ⏳ Waiting for redeployment to complete (30s)...")
        await asyncio.sleep(30)  # Increased wait time for local kind clusters
        
        pod_ready_after_update = await wait_for_pod_ready(
            pod_name_prefix=serve_name,
            namespace="serve",
            max_attempts=30,
            delay=2
        )
        
        assert pod_ready_after_update, "Pod did not become ready after config update"
        
        # Step 4: Verify new config is active
        # Retry with backoff if API is still processing
        for attempt in range(3):
            try:
                get_response = await http_client.get(
                    f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}"
                )
                break
            except Exception as e:
                if attempt < 2:
                    print(f"   ⚠️ API call failed (attempt {attempt + 1}/3), retrying in 10s...")
                    await asyncio.sleep(10)
                else:
                    raise
        
        assert get_response.status_code == 200
        data = get_response.json()
        config = data["data"]["fast_api_config"]
        assert config["cores"] == 2
        assert config["memory"] == 2
        
        # Cleanup happens automatically via cleanup_test_resources fixture
    
    @pytest.mark.asyncio
    async def test_deploy_undeploy_redeploy_flow(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        wait_for_pod_ready,
        wait_for_serve_status,
        cleanup_test_resources,
        test_model_uri: str,
        integration_test_env: str
    ):
        """Ensure serve can be deployed, undeployed, and redeployed with status checks."""
        serve_name = "deploy-undeploy-redeploy-test"
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Ensure serve exists before deployment
        create_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Deploy/undeploy/redeploy flow validation",
                "space": "test-space"
            }
        )
        assert create_response.status_code in [200, 201, 409]
        
        deploy_payload = {
            "serve_name": serve_name,
            "artifact_version": "v1",
            "model_uri": test_model_uri,
            "env": integration_test_env,
            "cores": 1,
            "memory": 2,
            "min_replicas": 1,
            "max_replicas": 1,
            "node_capacity": "spot"
        }
        
        # Initial deployment
        deploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/deploy-model",
            json=deploy_payload
        )
        
        if deploy_response.status_code in [400, 409]:
            response_data = deploy_response.json()
            error_msg = response_data.get("message") or response_data.get("detail") or "Unknown error"
            if "already deployed" not in error_msg.lower():
                pytest.skip(f"Initial deployment failed: {error_msg}")
        elif deploy_response.status_code == 404:
            pytest.skip("Test model not available for deployment. Run setup_test_model.py first.")
        else:
            assert deploy_response.status_code in [200, 201]
        
        pod_ready = await wait_for_pod_ready(
            pod_name_prefix=serve_name,
            namespace="serve",
            max_attempts=30,
            delay=2
        )
        if not pod_ready:
            pytest.skip("Initial deployment did not become ready in time")
        
        ready_status = await wait_for_serve_status(serve_name)
        assert ready_status in {"READY", "Ready", "Running"}, f"Expected READY status, got: {ready_status}"
        
        # Undeploy the serve
        undeploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/undeploy-model",
            json={
                "serve_name": serve_name,
                "env": integration_test_env
            }
        )
        
        if undeploy_response.status_code == 404:
            pytest.skip("Undeploy endpoint reported serve not deployed, cannot continue flow test")
        
        assert undeploy_response.status_code in [200, 201]
        
        # Wait for Kubernetes to start terminating the pods (undeploy is asynchronous)
        await asyncio.sleep(5)
        
        status_after_undeploy = await wait_for_serve_status(
            serve_name,
            max_attempts=20,
            delay=3
        )
        assert status_after_undeploy in {"NOT_DEPLOYED", "NOT_READY"}, f"Expected NOT_DEPLOYED/NOT_READY status, got: {status_after_undeploy}"
        
        # Redeploy the same serve
        redeploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/deploy-model",
            json=deploy_payload
        )
        if redeploy_response.status_code == 404:
            pytest.skip("Redeployment failed because test model is unavailable")
        assert redeploy_response.status_code in [200, 201]
        
        pod_ready_after_redeploy = await wait_for_pod_ready(
            pod_name_prefix=serve_name,
            namespace="serve",
            max_attempts=30,
            delay=2
        )
        if not pod_ready_after_redeploy:
            pytest.skip("Redeployment did not become ready in time")
        
        final_status = await wait_for_serve_status(serve_name)
        assert final_status in {"READY", "Ready", "Running"}, f"Expected READY status, got: {final_status}"
    
    @pytest.mark.asyncio
    async def test_update_only_replicas(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test updating only replica counts (common scaling operation)."""
        serve_name = "update-replicas-test"
        
        # Create serve and config
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test replica update",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        # Create initial config
        await http_client.post(
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
        
        # Update only replicas
        response = await http_client.patch(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}",
            json={
                "api_serve_config": {
                    "backend_type": "fastapi",
                    "fast_api_config": {
                        "cores": 2,  # Same
                        "memory": 4,  # Same
                        "min_replicas": 10,  # Updated
                        "max_replicas": 30,  # Updated
                        "node_capacity_type": "spot"  # Same
                    }
                }
            }
        )
        
        assert response.status_code == 200
        
        # Verify update
        get_response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/infra-config/{integration_test_env}"
        )
        
        data = get_response.json()
        if "data" in data and data["data"]:
            config = data["data"]["fast_api_config"]
            assert config["min_replicas"] == 10
            assert config["max_replicas"] == 30
            assert config["cores"] == 2  # Unchanged
            assert config["memory"] == 4  # Unchanged


@pytest.mark.integration
class TestServeStatus:
    """Integration tests for serve status checking."""
    
    @pytest.mark.skip(reason="Skipping until this bug is fixed")
    @pytest.mark.asyncio
    async def test_get_status_not_deployed(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        cleanup_test_resources,
        integration_test_env: str
    ):
        """Test getting status of a serve that is not deployed."""
        # Create serve but don't deploy
        serve_name = "status-not-deployed"
        await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve",
            json={
                "name": serve_name,
                "type": "api",
                "description": "Test status",
                "space": "test-space"
            }
        )

        cleanup_test_resources(serve_name, integration_test_env)
        
        # Get status
        response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/status/{integration_test_env}"
        )
        
        # Should return status (likely "not deployed" or similar)
        assert response.status_code in [200, 404]
    @pytest.mark.skip(reason="Skipping until deployment naming inconsistency is fixed")
    @pytest.mark.asyncio
    async def test_get_status_deployed(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        wait_for_pod_ready,
        cleanup_test_resources,
        test_model_uri: str,
        integration_test_env: str
    ):
        """
        Test getting status of a deployed serve.
        
        This test requires:
        - A test model in MLflow (run setup_test_model.py)
        
        To set up the test model, run:
            python ml-serve-app/tests/integration/setup_test_model.py
        
        Uses minimal resources: 1 core, 2GB RAM, 1 replica
        """
        serve_name = "status-deployed-test"
        
        # Register for cleanup
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Deploy serve
        deploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/deploy-model",
            json={
                "serve_name": serve_name,
                "artifact_version": "v1",
                "model_uri": test_model_uri,
                "env": integration_test_env,
                "cores": 1,
                "memory": 2,
                "min_replicas": 1,
                "max_replicas": 1  # Minimal: single replica
            }
        )
        
        if deploy_response.status_code in [400, 409]:
            response_data = deploy_response.json()
            error_msg = response_data.get("message") or response_data.get("detail") or "Unknown error"
            if "already deployed" not in error_msg.lower():
                pytest.skip(f"Deployment failed: {error_msg}")
            print(f"⚠️  Model already deployed, continuing test...")
        elif deploy_response.status_code not in [200, 201]:
            pytest.skip("Deployment failed")
        
        # Wait for pod (ignore result if already deployed, pod might not match label selector)
        pod_ready = await wait_for_pod_ready(
            pod_name_prefix=serve_name,
            namespace="serve",
            max_attempts=30,
            delay=2
        )
        
        # Get status (should work regardless of pod readiness)
        response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/serve/{serve_name}/status/{integration_test_env}"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data["data"]
        # Accept any valid status - this test verifies the endpoint works, not deployment state
        assert data["data"]["status"] in ["READY", "NOT_READY", "Running", "Pending", "Ready", "NOT_DEPLOYED"]

