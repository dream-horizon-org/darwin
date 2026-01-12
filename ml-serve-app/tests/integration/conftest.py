"""
Integration test specific fixtures.

These fixtures are used for integration tests that interact with
real services running in the kind cluster.
"""
import asyncio
import os
import subprocess
from typing import AsyncGenerator, Callable

import pytest
import httpx
import mlflow

from tests.integration.setup_test_model import setup_mlflow_test_models as setup_func


@pytest.fixture(scope="session")
def test_auth_token() -> str:
    """
    Get authentication token for integration tests.
    
    Set the token here directly to avoid exporting environment variables.
    This token must match a user in the deployed environment.
    """
    # Replace this with your actual token
    return "admin-token-default-change-in-production"


@pytest.fixture(scope="session")
def kube_context():
    """
    Verify Kubernetes cluster is running.
    Skip integration tests if cluster is not available.
    """
    try:
        result = subprocess.run(
            ["kubectl", "cluster-info"],
            capture_output=True,
            timeout=5
        )
        if result.returncode != 0:
            pytest.skip("Kind cluster not running. Run setup.sh first.")
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pytest.skip("kubectl not available or cluster not responding.")
    
    yield


@pytest.fixture(scope="session")
def kubeconfig_path() -> str:
    """Get the kubeconfig path for the kind cluster."""
    # Check environment variable first
    kubeconfig = os.environ.get("KUBECONFIG")
    
    if not kubeconfig:
        # Compute path relative to project root (darwin directory)
        # This file is at: darwin/ml-serve-app/tests/integration/conftest.py
        # We need to go up to: darwin/kind/config/kindkubeconfig.yaml
        current_file = os.path.abspath(__file__)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_file))))
        kubeconfig = os.path.join(project_root, "kind", "config", "kindkubeconfig.yaml")
    
    if not os.path.exists(kubeconfig):
        pytest.skip(f"Kubeconfig not found at {kubeconfig}")
    return kubeconfig


@pytest.fixture(scope="session")
def ml_serve_base_url(kube_context) -> str:
    """
    Get the base URL for ml-serve-app.
    
    In the kind cluster, ml-serve-app is accessible via ingress at:
    http://localhost/ml-serve
    """
    return "http://localhost/ml-serve"


@pytest.fixture(scope="session")
def dcm_base_url(kube_context) -> str:
    """Get the base URL for darwin-cluster-manager."""
    return "http://localhost/cluster-manager"


@pytest.fixture(scope="session")
def artifact_builder_base_url(kube_context) -> str:
    """Get the base URL for artifact-builder."""
    return "http://localhost/artifact-builder"


@pytest.fixture(scope="session")
def mlflow_base_url(kube_context) -> str:
    """Get the base URL for MLflow."""
    return "http://localhost/mlflow"


@pytest.fixture
async def http_client(test_auth_token: str) -> AsyncGenerator[httpx.AsyncClient, None]:
    """
    Create an async HTTP client for integration tests with authentication.
    
    Note: Integration tests require a valid authentication token.
    See README or TESTING.md for setup instructions.
    
    Timeout is set to 60 seconds for local kind clusters which can be slow.
    """
    headers = {
        "Authorization": f"Bearer {test_auth_token}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=60.0, headers=headers, verify=False) as client:
        yield client


@pytest.fixture
async def wait_for_service():
    """
    Fixture that provides a function to wait for a service to be ready.
    """
    async def _wait(url: str, max_attempts: int = 30, delay: int = 2) -> bool:
        """
        Wait for a service to respond with 200 OK.
        
        Args:
            url: The URL to check
            max_attempts: Maximum number of attempts
            delay: Delay between attempts in seconds
            
        Returns:
            True if service is ready, False otherwise
        """
        async with httpx.AsyncClient(timeout=5.0, verify=False) as client:
            for attempt in range(max_attempts):
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        return True
                except (httpx.RequestError, httpx.TimeoutException):
                    pass
                
                if attempt < max_attempts - 1:
                    await asyncio.sleep(delay)
        
        return False
    
    return _wait


@pytest.fixture
async def wait_for_serve_status(
    http_client: httpx.AsyncClient,
    ml_serve_base_url: str,
    integration_test_env: str,
    wait_for_pod_ready: Callable
):
    """
    Fixture that provides a function to get serve status.
    
    Tries the status API first, then falls back to kubectl to check pod readiness.
    This approach is more reliable in Kind/local environments where the status API
    may fail due to internal networking restrictions.
    """
    async def _wait(
        serve_name: str,
        max_attempts: int = 20,
        delay: int = 3
    ):
        """
        Wait for and return the serve status.
        
        Returns:
            Status string ("READY", "NOT_READY", "NOT_DEPLOYED", etc.) or None if cannot determine
        """
        for attempt in range(max_attempts):
            # 1. Try the status API first
            try:
                response = await http_client.get(
                    f"{ml_serve_base_url}/api/v1/serve/{serve_name}/status/{integration_test_env}"
                )

                if response.status_code == 200:
                    data = response.json()
                    status = data.get("data", {}).get("status")
                    if status:
                        return status
                elif response.status_code == 404:
                    return "NOT_DEPLOYED"
            except Exception:
                pass

            # 2. Fallback: Check pod status via kubectl
            # Check if pods exist and are ready
            if await wait_for_pod_ready(serve_name, namespace="serve", max_attempts=1, delay=0):
                return "READY"
            
            # Check if pods are completely gone (NOT_DEPLOYED)
            try:
                result = subprocess.run(
                    ["kubectl", "get", "pods", "-n", "serve", "-l", f"app.kubernetes.io/name={serve_name}", "--no-headers"],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0 and not result.stdout.strip():
                    return "NOT_DEPLOYED"
            except Exception:
                pass

            if attempt < max_attempts - 1:
                await asyncio.sleep(delay)

        return None

    return _wait


@pytest.fixture
async def wait_for_pod_ready():
    """
    Fixture that provides a function to wait for a pod to be ready.
    """
    async def _wait(
        pod_name_prefix: str,
        namespace: str = "serve",
        max_attempts: int = 60,
        delay: int = 2
    ) -> bool:
        """
        Wait for a pod to be in Running state.
        
        Args:
            pod_name_prefix: Prefix of the pod name to wait for
            namespace: Kubernetes namespace
            max_attempts: Maximum number of attempts
            delay: Delay between attempts in seconds
            
        Returns:
            True if pod is ready, False otherwise
        """
        for attempt in range(max_attempts):
            try:
                result = subprocess.run(
                    [
                        "kubectl", "get", "pods",
                        "-n", namespace,
                        "-l", f"app.kubernetes.io/name={pod_name_prefix}",
                        "-o", "jsonpath={.items[0].status.phase}"
                    ],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                if result.returncode == 0 and result.stdout.strip() == "Running":
                    # Also check if pod is ready
                    ready_result = subprocess.run(
                        [
                            "kubectl", "get", "pods",
                            "-n", namespace,
                            "-l", f"app.kubernetes.io/name={pod_name_prefix}",
                            "-o", "jsonpath={.items[0].status.conditions[?(@.type=='Ready')].status}"
                        ],
                        capture_output=True,
                        text=True,
                        timeout=5
                    )
                    
                    if ready_result.returncode == 0 and ready_result.stdout.strip() == "True":
                        return True
                
            except subprocess.TimeoutExpired:
                pass
            
            if attempt < max_attempts - 1:
                await asyncio.sleep(delay)
        
        return False
    
    return _wait


@pytest.fixture(scope="session")
async def integration_test_env(ml_serve_base_url: str, test_auth_token: str) -> AsyncGenerator[str, None]:
    """
    Session-scoped fixture to create and reuse the integration-test-env environment.
    
    This environment is shared across all tests to minimize resource usage.
    Created once per test session and reused by all tests.
    """
    headers = {
        "Authorization": f"Bearer {test_auth_token}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=30.0, headers=headers, verify=False) as client:
        # Create environment if it doesn't exist
        env_response = await client.post(
            f"{ml_serve_base_url}/api/v1/environment",
            json={
                "name": "integration-test-env",
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
        
        # Allow 409 if already exists (idempotent)
        if env_response.status_code not in [200, 201, 409]:
            print(f"⚠️  Warning: Could not create integration-test-env: {env_response.status_code}")
        
        yield "integration-test-env"


@pytest.fixture
async def cleanup_test_resources(
    ml_serve_base_url: str,
    test_auth_token: str
) -> AsyncGenerator[Callable[[str, str], None], None]:
    """
    Cleanup test resources after integration tests.
    
    This fixture yields first, then cleans up any test serves/deployments
    created during the test. It properly undeploys via API and deletes database entries.
    
    Optimized for minimal resource usage on local kind cluster.
    """
    created_serves = set()
    created_deployments = {}  # Track serve_name -> env mapping
    
    def register_serve(serve_name: str, env: str = "integration-test-env"):
        """Register a serve for cleanup."""
        created_serves.add(serve_name)
        created_deployments[serve_name] = env
    
    yield register_serve
    
    # Cleanup: undeploy all test serves and wait for resources to be freed
    headers = {
        "Authorization": f"Bearer {test_auth_token}",
        "Content-Type": "application/json"
    }
    
    for serve_name in created_serves:
        env = created_deployments.get(serve_name, "integration-test-env")
        print(f"\n🧹 Cleaning up {serve_name} in {env}...")
        
        try:
            # Step 1: Attempt to undeploy via API (for one-click deployments)
            async with httpx.AsyncClient(timeout=30.0, headers=headers, verify=False) as client:
                # Try undeploy-model endpoint first (for one-click deployments)
                undeploy_response = await client.post(
                    f"{ml_serve_base_url}/api/v1/serve/undeploy-model",
                    json={
                        "serve_name": serve_name,
                        "env": env
                    }
                )
                
                # If that fails, try the regular undeploy endpoint
                if undeploy_response.status_code == 404:
                    undeploy_response = await client.post(
                        f"{ml_serve_base_url}/api/v1/serve/{serve_name}/undeploy/{env}"
                    )
                
                if undeploy_response.status_code in [200, 201]:
                    print(f"   ✅ Undeployed {serve_name} via API")
                else:
                    print(f"   ⚠️  Undeploy API returned {undeploy_response.status_code}")
        except Exception as e:
            # Best effort cleanup via API
            print(f"   ⚠️ API undeploy failed: {e}")

        # Step 2: Delete Kubernetes resources in proper order
        # First delete deployments (which cascade delete pods), then services, then other resources
        try:
            print(f"   🗑️  Deleting Kubernetes resources...")
            
            # Delete deployments first (this will cascade to pods)
            for label_selector in [
                f"app.kubernetes.io/name={serve_name}",
                f"serve-name={serve_name}",
                f"app={serve_name}"
            ]:
                for resource_type in ["deployment", "statefulset", "daemonset", "replicaset"]:
                    subprocess.run(
                        [
                            "kubectl", "delete", resource_type,
                            "-n", "serve",
                            "-l", label_selector,
                            "--ignore-not-found=true",
                            "--wait=false"  # Don't wait, we'll check manually
                        ],
                        capture_output=True,
                        timeout=30
                    )
            
            # Force-delete any remaining pods
            for label_selector in [
                f"app.kubernetes.io/name={serve_name}",
                f"serve-name={serve_name}",
                f"app={serve_name}"
            ]:
                subprocess.run(
                    [
                        "kubectl", "delete", "pods", 
                        "-n", "serve",
                        "-l", label_selector,
                        "--force", 
                        "--grace-period=0",
                        "--ignore-not-found=true"
                    ],
                    capture_output=True,
                    timeout=30
                )
            
            # Delete services and ingress
            for resource_type in ["service", "ingress"]:
                for label_selector in [
                    f"app.kubernetes.io/name={serve_name}",
                    f"serve-name={serve_name}",
                    f"app={serve_name}"
                ]:
                    subprocess.run(
                        [
                            "kubectl", "delete", resource_type,
                            "-n", "serve",
                            "-l", label_selector,
                            "--ignore-not-found=true"
                        ],
                        capture_output=True,
                        timeout=30
                    )
        except subprocess.TimeoutExpired as e:
             print(f"   ⚠️ Resource deletion timed out: {e}")
        except Exception as e:
             print(f"   ⚠️ Resource deletion failed: {e}")

        # Step 3: Wait for pods to actually disappear (check all possible labels)
        print(f"   ⏳ Waiting for pods to terminate...")
        max_wait_time = 60  # Increased to 60 seconds for local kind clusters
        
        for attempt in range(max_wait_time):
            # Check all possible label selectors
            all_pods_gone = True
            for label_selector in [
                f"app.kubernetes.io/name={serve_name}",
                f"serve-name={serve_name}",
                f"app={serve_name}"
            ]:
                result = subprocess.run(
                    [
                        "kubectl", "get", "pods", 
                        "-n", "serve",
                        "-l", label_selector,
                        "--no-headers"
                    ],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.stdout.strip():
                    all_pods_gone = False
                    break
            
            # Also check by partial name match (in case labels don't catch everything)
            if all_pods_gone:
                result = subprocess.run(
                    ["kubectl", "get", "pods", "-n", "serve", "--no-headers"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                # Check if serve_name appears anywhere in pod names
                if any(serve_name in line for line in result.stdout.split('\n') if line.strip()):
                    all_pods_gone = False
            
            if all_pods_gone:
                print(f"   ✅ All resources cleared for {serve_name}")
                break
            
            await asyncio.sleep(1)
        else:
            # Last resort: list remaining pods for debugging
            result = subprocess.run(
                ["kubectl", "get", "pods", "-n", "serve", "--no-headers"],
                capture_output=True,
                text=True,
                timeout=5
            )
            remaining_pods = [line for line in result.stdout.split('\n') if serve_name in line and line.strip()]
            if remaining_pods:
                print(f"   ⚠️ Warning: {len(remaining_pods)} pod(s) still exist for {serve_name}:")
                for pod in remaining_pods[:3]:  # Show first 3
                    print(f"      - {pod.split()[0]}")
                print(f"   💡 Manual cleanup: kubectl delete pods,deployments -n serve --all --force")
        
        # Step 4: Give Kubernetes more time to fully clean up before next test
        # This is critical for sequential test execution
        print(f"   ⏸️  Waiting 5s for Kubernetes to settle...")
        await asyncio.sleep(5)


@pytest.fixture(scope="session")
def mlflow_tracking_uri() -> str:
    """Get MLflow tracking URI for tests."""
    return os.environ.get("MLFLOW_URI", "http://localhost/mlflow-lib")


@pytest.fixture(scope="session", autouse=True)
def setup_mlflow_test_models(mlflow_tracking_uri: str):
    """
    Automatically setup MLflow test models before integration tests run.
    
    This fixture:
    - Runs once per test session (before all tests)
    - Checks if test models exist in MLflow
    - Creates them if missing (takes ~20 seconds)
    - Skips silently if MLflow unavailable (tests will skip gracefully)
    - Uses the reusable setup_test_model.py script
    """
    try:
        mlflow.set_tracking_uri(mlflow_tracking_uri)
        client = mlflow.tracking.MlflowClient()
        
        # Quick check: do both test models already exist?
        models_needed = ["test-model", "iris-test"]
        models_exist = []
        
        print(f"\n🔍 Checking MLflow at {mlflow_tracking_uri}...")
        
        for model_name in models_needed:
            try:
                client.get_registered_model(model_name)
                models_exist.append(model_name)
            except:
                pass
        
        # If both exist, we're done (fast path - <1 second)
        if len(models_exist) == len(models_needed):
            print(f"✅ MLflow test models already exist: {models_exist}\n")
            return
        
        # Models missing - need to create them
        print(f"📦 Setting up MLflow test models (one-time ~20s setup)...")
        if models_exist:
            print(f"   Found: {models_exist}")
        print(f"   Creating: {list(set(models_needed) - set(models_exist))}")
        
        
        success = setup_func(mlflow_uri=mlflow_tracking_uri, verbose=True)
        
        if success:
            print(f"✅ MLflow test models created successfully!\n")
        else:
            print(f"\n⚠️  MLflow setup had issues")
            print(f"   Some model tests may be skipped")
            print(f"💡 To setup manually: python ml-serve-app/tests/integration/setup_test_model.py\n")
            
    except ImportError as e:
        # MLflow or sklearn not installed - tests will skip gracefully
        print(f"\n⚠️  Required packages not available: {e}")
        print(f"   Install with: pip install mlflow scikit-learn")
        print(f"   Model tests will be skipped\n")
    except Exception as e:
        # MLflow connection failed or other error - tests will skip gracefully
        print(f"\n⚠️  Could not setup MLflow models: {e}")
        print(f"   MLflow URI: {mlflow_tracking_uri}")
        print(f"   Model tests will be skipped")
        print(f"\n💡 Troubleshooting:")
        print(f"   - Check if MLflow is running: curl {mlflow_tracking_uri}")
        print(f"   - Or set MLFLOW_URI environment variable")
        print(f"   - Or run: python ml-serve-app/tests/integration/setup_test_model.py\n")


@pytest.fixture(scope="session")
def get_latest_model_uri(mlflow_tracking_uri: str):
    """
    Factory fixture to get the latest version of a registered model.
    
    Usage:
        model_uri = get_latest_model_uri("iris-test")
        # Returns: "models:/iris-test/1" (or latest version)
    """
    def _get_uri(model_name: str) -> str:
        try:
            mlflow.set_tracking_uri(mlflow_tracking_uri)
            client = mlflow.tracking.MlflowClient()
            
            # Try model registry first
            try:
                latest_versions = client.get_latest_versions(model_name, stages=["None"])
                if latest_versions:
                    version = latest_versions[0].version
                    return f"models:/{model_name}/{version}"
            except:
                # Registry not available, search for runs by name
                pass
            
            # Fall back to searching for runs by name
            run_name_mapping = {
                "iris-test": "iris-test-model",
                "test-model": "test-model"
            }
            run_name = run_name_mapping.get(model_name, model_name)
            
            # Search for the run in the default experiment
            runs = client.search_runs(
                experiment_ids=["0"],
                filter_string=f"tags.mlflow.runName = '{run_name}'",
                order_by=["start_time DESC"],
                max_results=1
            )
            
            if runs:
                run_id = runs[0].info.run_id
                return f"runs:/{run_id}/model"
            
            # Last resort: return a model registry URI (will fail if model doesn't exist)
            return f"models:/{model_name}/1"
            
        except ImportError:
            # MLflow not installed
            return f"models:/{model_name}/1"
        except Exception as e:
            print(f"Warning: Could not fetch model URI for {model_name}: {e}")
            return f"models:/{model_name}/1"
    
    return _get_uri


@pytest.fixture(scope="session")
def test_model_uri(get_latest_model_uri) -> str:
    """Get URI for test-model (used in most integration tests)."""
    return get_latest_model_uri("test-model")


@pytest.fixture(scope="session")
def iris_test_model_uri(get_latest_model_uri) -> str:
    """Get URI for iris-test model (used in prediction tests)."""
    return get_latest_model_uri("iris-test")

@pytest.fixture(scope="session", autouse=True)
async def cleanup_database(
    ml_serve_base_url: str,
    test_auth_token: str
) -> AsyncGenerator[None, None]:
    """
    Clean up database entries after all integration tests complete.
    
    This fixture automatically runs after all tests in the session to:
    - First undeploy any remaining deployments (to clean up Kubernetes resources)
    - Delete test serves created in test spaces
    - Delete associated artifacts and deployments
    - Delete test environments
    
    Note: Uses autouse=True to automatically run cleanup without explicit fixture usage.
    """
    # Yield first to let all tests run
    yield
    
    # Now cleanup after tests
    print("\n🧹 Cleaning up database after integration tests...")
    
    headers = {
        "Authorization": f"Bearer {test_auth_token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Import here to avoid circular dependencies
        from tortoise import Tortoise
        from ml_serve_model import Serve, Artifact, Environment, Deployment, ActiveDeployment
        
        # Initialize Tortoise connection using same settings as app
        # Note: Database name is 'darwin_ml_serve' in Kind cluster setup
        db_url = (
            f"mysql://{os.environ.get('MYSQL_USERNAME', 'root')}:"
            f"{os.environ.get('MYSQL_PASSWORD', 'password')}@"
            f"{os.environ.get('MYSQL_HOST', 'localhost')}:"
            f"{os.environ.get('MYSQL_PORT', '3306')}/"
            f"{os.environ.get('MYSQL_DATABASE', 'darwin_ml_serve')}"
        )
        
        await Tortoise.init(
            db_url=db_url,
            modules={"models": ["ml_serve_model"]}
        )
        
        # Step 1: Undeploy all active deployments first (to clean up Kubernetes resources)
        test_serves = await Serve.filter(space__in=["serve-test", "test-space"]).all()
        undeployed_count = 0
        
        async with httpx.AsyncClient(timeout=30.0, headers=headers, verify=False) as client:
            for serve in test_serves:
                # Find active deployments for this serve
                active_deployments = await ActiveDeployment.filter(serve=serve).all()
                
                for active_deployment in active_deployments:
                    env = await active_deployment.environment
                    if env:
                        try:
                            # Try undeploy-model endpoint first (for one-click deployments)
                            undeploy_response = await client.post(
                                f"{ml_serve_base_url}/api/v1/serve/undeploy-model",
                                json={
                                    "serve_name": serve.name,
                                    "env": env.name
                                }
                            )
                            
                            # If that fails, try the regular undeploy endpoint
                            if undeploy_response.status_code == 404:
                                undeploy_response = await client.post(
                                    f"{ml_serve_base_url}/api/v1/serve/{serve.name}/undeploy/{env.name}"
                                )
                            
                            if undeploy_response.status_code in [200, 201]:
                                undeployed_count += 1
                        except Exception:
                            # Best effort - continue with cleanup
                            pass
        
        if undeployed_count > 0:
            print(f"   ✅ Undeployed {undeployed_count} active deployment(s)")
            # Give some time for resources to be cleaned up
            await asyncio.sleep(5)
        
        # Step 2: Delete all serves in test spaces and their associated resources
        test_serves = await Serve.filter(space__in=["serve-test", "test-space"]).all()
        deleted_count = 0
        
        for serve in test_serves:
            # Delete associated deployments first
            await Deployment.filter(serve_id=serve.id).delete()
            
            # Delete associated artifacts
            await Artifact.filter(serve_id=serve.id).delete()
            
            # Delete active deployment pointers
            await ActiveDeployment.filter(serve=serve).delete()
            
            # Delete the serve
            await serve.delete()
            deleted_count += 1
        
        # Step 3: Delete test environments (integration tests create integration-test-env)
        # Note: We keep integration-test-env for reuse, but delete any other test envs
        test_envs = await Environment.filter(name__startswith="integration-test").all()
        for env in test_envs:
            # Only delete if it's not the main integration-test-env (to allow reuse)
            if env.name != "integration-test-env":
                await env.delete()
        
        print(f"✅ Cleaned up {deleted_count} test serve(s) and associated resources")
        
        # Close connections
        await Tortoise.close_connections()
        
    except ImportError:
        print(f"⚠️  Database cleanup skipped: Tortoise models not available")
    except Exception as e:
        # Cleanup failures are non-fatal but we should inform the user
        error_msg = str(e)
        if "Can't connect" in error_msg or "Connection refused" in error_msg:
            print(f"⚠️  Database cleanup skipped: MySQL connection not available")
            print(f"   Run './ml-serve-app/tests/scripts/cleanup-test-db.sh' manually if cleanup is needed")
        else:
            print(f"⚠️  Database cleanup failed (non-fatal): {e}")
        # Don't fail tests if cleanup fails
        pass


