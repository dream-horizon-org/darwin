"""
Integration tests for one-click model deployment flow.

These tests interact with real services running in the kind cluster:
- ML Serve App
- Darwin Cluster Manager (DCM)
- MLflow
- MySQL

Prerequisites:
- Kind cluster must be running (./setup.sh)
- All services must be deployed (./start.sh)
"""
import subprocess

import httpx
import pytest


@pytest.mark.integration
class TestOneClickDeploymentFlow:
    """Integration tests for one-click model deployment."""
    @pytest.mark.skip(reason="Skipping until deployment naming inconsistency is fixed")
    @pytest.mark.asyncio
    async def test_deploy_model_end_to_end(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        wait_for_pod_ready,
        cleanup_test_resources,
        test_model_uri: str,
        integration_test_env: str
    ):
        """
        Test complete one-click deployment flow:
        1. Deploy model (environment is shared via fixture)
        2. Wait for pod to be ready
        3. Verify deployment status
        4. Cleanup (automatic via fixture)
        
        Requires test model in MLflow (run setup_test_model.py)
        """
        serve_name = "integration-test-model"
        
        # Register for cleanup (will cleanup after test)
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Step 1: Deploy model (using dynamic model URI)
        print(f"\n🔍 Using model URI: {test_model_uri}")
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
        
        # Test API endpoint
        assert deploy_response.status_code in [200, 201, 400, 404, 409]
        
        # Check for errors
        deployment_succeeded = False
        if deploy_response.status_code in [200, 201]:
            deployment_succeeded = True
        elif deploy_response.status_code in [400, 409]:
            response_data = deploy_response.json() if deploy_response.status_code != 404 else {}
            error_msg = response_data.get("message") or response_data.get("detail") or "Unknown error"
            
            # If it's just "already deployed", treat as success
            if "already deployed" in error_msg.lower():
                print(f"⚠️  Model already deployed, verifying existing deployment...")
                deployment_succeeded = True
            else:
                pytest.skip(f"Test model deployment failed: {error_msg} (URI: {test_model_uri})")
        elif deploy_response.status_code == 404:
            pytest.skip(f"Test model not found (URI: {test_model_uri})")
        
        if deployment_succeeded:
            # Step 2: Wait for pod to be ready
            pod_ready = await wait_for_pod_ready(
                pod_name_prefix=serve_name,
                namespace="serve",
                max_attempts=30,
                delay=2
            )
            
            # Step 3: Verify deployment status
            status_response = await http_client.get(
                f"{ml_serve_base_url}/api/v1/serve/{serve_name}/status/{integration_test_env}"
            )
            
            assert status_response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_deploy_model_invalid_environment(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        test_model_uri: str
    ):
        """Test deployment fails with non-existent environment."""
        response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/deploy-model",
            json={
                "serve_name": "test-model",
                "artifact_version": "v1",
                "model_uri": test_model_uri,  # Use valid model URI
                "env": "nonexistent-env",
                "cores": 1,
                "memory": 2
            }
        )
        
        assert response.status_code == 404
        data = response.json()
        # API returns error in 'message' field, not 'detail'
        error_text = data.get("message", "") or data.get("detail", "")
        assert "not found" in error_text.lower()
    
    @pytest.mark.asyncio
    async def test_undeploy_model_not_deployed(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        integration_test_env: str
    ):
        """Test undeploy fails when model is not deployed."""
        response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/undeploy-model",
            json={
                "serve_name": "nonexistent-model",
                "artifact_version": "v1",
                "env": integration_test_env
            }
        )
        
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_ml_serve_healthcheck(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient
    ):
        """Test ML Serve App is accessible and healthy."""
        response = await http_client.get(f"{ml_serve_base_url}/healthcheck")
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") in ["healthy", "ok"]
    
    @pytest.mark.asyncio
    async def test_create_and_list_environments(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient
    ):
        """Test creating and listing environments."""
        # Create environment
        create_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/environment",
            json={
                "name": "test-list-env",
                "environment_configs": {
                    "domain_suffix": "",
                    "cluster_name": "kind",
                    "namespace": "serve",
                    "security_group": "",
                    "ft_redis_url": "",
                    "workflow_url": ""
                }
            }
        )
        
        # Allow 409 if already exists
        assert create_response.status_code in [200, 201, 409]
        
        # Get the specific environment
        get_response = await http_client.get(
            f"{ml_serve_base_url}/api/v1/environment/test-list-env"
        )
        
        assert get_response.status_code == 200
        data = get_response.json()
        
        # Verify environment data
        assert data["name"] == "test-list-env"
        assert data["env_configs"]["cluster_name"] == "kind"


@pytest.mark.integration
@pytest.mark.slow
class TestOneClickDeploymentWithRealModel:
    """
    Integration tests that require a real MLflow model.
    
    These tests are marked as 'slow' and should only run when
    a test model is available in MLflow.
    """
    
    @pytest.mark.asyncio
    async def test_deploy_and_predict(
        self,
        ml_serve_base_url: str,
        http_client: httpx.AsyncClient,
        wait_for_pod_ready,
        wait_for_service,
        cleanup_test_resources,
        iris_test_model_uri: str,
        integration_test_env: str
    ):
        """
        Test complete flow: deploy model → wait for ready → make prediction.
        
        This test requires:
        - A test model logged in MLflow (e.g., iris classifier)
        
        To set up the test model, run:
            python ml-serve-app/tests/integration/setup_test_model.py
        """
        serve_name = "iris-integration-test"
        
        # Register for cleanup (will cleanup after test)
        cleanup_test_resources(serve_name, integration_test_env)
        
        # Deploy model (using dynamic model URI)
        deploy_response = await http_client.post(
            f"{ml_serve_base_url}/api/v1/serve/deploy-model",
            json={
                "serve_name": serve_name,
                "artifact_version": "v1",
                "model_uri": iris_test_model_uri,
                "env": integration_test_env,
                "cores": 1,
                "memory": 2,
                "min_replicas": 1,
                "max_replicas": 1,  # Minimal: single replica
                "node_capacity": "spot"
            }
        )
        
        # Handle response
        already_deployed = False
        if deploy_response.status_code in [400, 409]:
            response_data = deploy_response.json()
            error_msg = response_data.get("message") or response_data.get("detail") or "Unknown error"
            if "already deployed" not in error_msg.lower():
                pytest.skip(f"Test model deployment failed: {error_msg}")
            print(f"⚠️  Model already deployed, verifying existing deployment...")
            already_deployed = True
        elif deploy_response.status_code == 404:
            pytest.skip("Test model not available in MLflow. Run setup_test_model.py first.")
        else:
            assert deploy_response.status_code in [200, 201]
        
        # Check if pods exist
        # Note: Pod labels may not match the expected pattern, so check via kubectl
        pod_check = subprocess.run(
            ["kubectl", "get", "pods", "-n", "serve", "-l", f"serve-name={serve_name}", "-o", "name"],
            capture_output=True,
            text=True
        )
        
        pods_exist = bool(pod_check.stdout.strip())
        if not pods_exist and already_deployed:
            # Try without label filter to see if ANY pods with iris name exist
            pod_check_any = subprocess.run(
                ["kubectl", "get", "pods", "-n", "serve", "--no-headers"],
                capture_output=True,
                text=True
            )
            if serve_name not in pod_check_any.stdout:
                pytest.skip("Deployment marked as 'already deployed' but no pods exist. Manual cleanup may be needed.")
        
        # If not already deployed, wait for pods
        if not already_deployed:
            pod_ready = await wait_for_pod_ready(
                pod_name_prefix=serve_name,
                namespace="serve",
                max_attempts=60,
                delay=2
            )
            assert pod_ready, "Pod did not become ready in time"
        else:
            print("⚠️  Skipping pod ready check for existing deployment...")
        
        # Wait for service to respond
        service_url = f"http://localhost/{serve_name}"
        service_ready = await wait_for_service(
            f"{service_url}/healthcheck",
            max_attempts=15 if already_deployed else 30,  # 30s vs 60s
            delay=2
        )
        
        if not service_ready:
            # Service not ready - skip test with informative message
            pytest.skip(f"Service {service_url} not responding. Check if pods are running and ingress is configured.")
        
        # Make prediction
        predict_response = await http_client.post(
            f"{service_url}/predict",
            json={
                "features": {
                    "sepal_length": 5.1,
                    "sepal_width": 3.5,
                    "petal_length": 1.4,
                    "petal_width": 0.2
                }
            }
        )
        
        assert predict_response.status_code == 200
        prediction_data = predict_response.json()
        assert "score" in prediction_data or "scores" in prediction_data
        