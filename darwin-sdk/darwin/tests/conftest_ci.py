"""
CI-specific pytest fixtures for Darwin SDK integration tests.

These fixtures are designed to work with a real Ray cluster deployed
via the Darwin platform (init.sh -> setup.sh -> start.sh).

To use these fixtures, run pytest with:
    pytest --confcutdir=tests tests/test_integration.py
"""

import os
import json
from unittest.mock import MagicMock, patch

import pytest


def pytest_configure(config):
    """Configure pytest for CI environment."""
    # Register custom markers
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "ray_cluster: mark test as requiring a Ray cluster"
    )
    config.addinivalue_line(
        "markers", "raydp: mark test as requiring RayDP (Spark on Ray)"
    )


@pytest.fixture(scope="session", autouse=True)
def setup_ci_environment():
    """
    Setup fixture for CI environment.
    Sets necessary environment variables for local/CI testing.
    """
    # Detect CI environment
    is_ci = os.getenv("CI") == "true" or os.getenv("GITHUB_ACTIONS") == "true"
    is_local = os.getenv("ENV") in ("LOCAL", "local")
    
    # Set default environment variables for CI
    defaults = {
        "ENV": "LOCAL",
        "CLUSTER_ID": "ray-test",
        "AWS_ACCESS_KEY_ID": "test",
        "AWS_SECRET_ACCESS_KEY": "test",
        "AWS_DEFAULT_REGION": "us-east-1",
        "AWS_REGION": "us-east-1",
        "AWS_EC2_METADATA_DISABLED": "true",
        "DARWIN_COMPUTE_URL": "http://localhost:8000",
    }
    
    # Only set defaults if not already set
    original_values = {}
    for key, value in defaults.items():
        original_values[key] = os.environ.get(key)
        if os.environ.get(key) is None:
            os.environ[key] = value
    
    yield {
        "is_ci": is_ci,
        "is_local": is_local,
        "ray_address": os.getenv("RAY_ADDRESS", "local")
    }
    
    # Restore original values
    for key, value in original_values.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


@pytest.fixture(scope="session")
def ray_cluster_info():
    """
    Get Ray cluster information.
    Returns a dict with cluster connection details.
    """
    ray_address = os.getenv("RAY_ADDRESS", "local")
    
    return {
        "address": ray_address,
        "is_local": ray_address == "local",
        "is_remote": ray_address.startswith("ray://"),
    }


@pytest.fixture(scope="function")
def mock_compute_response():
    """
    Mock compute service response for testing.
    Returns a dict that mimics the compute service API response.
    """
    return {
        "data": {
            "cluster_id": os.getenv("CLUSTER_ID", "ray-test"),
            "name": "ci-test-cluster",
            "status": "RUNNING",
            "has_ondemand_worker_group": True,
            "worker_groups": [
                {
                    "name": "ondemand",
                    "replicas": 2,
                    "min_replicas": 1,
                    "max_replicas": 4,
                    "resources": {
                        "CPU": 2,
                        "memory": 4294967296  # 4GB
                    }
                }
            ],
            "spark_config": {
                "spark.app.name": "darwin-ci-test",
                "spark.master": "local[2]",
                "spark.executor.cores": "1",
                "spark.executor.memory": "1G",
                "spark.executor.instances": "2",
                "spark.driver.cores": "1",
                "spark.driver.memory": "1G",
                "spark.sql.shuffle.partitions": "4",
                "spark.darwin.workingDir": "/tmp/darwin",
                "spark.darwin.enableRemoteShuffle": "false",
                "spark.darwin.dynamicAllocation.enabled": "false",
                "spark.darwin.loggingLevel": "WARN"
            }
        }
    }


@pytest.fixture(scope="function")
def mock_compute_service(mock_compute_response):
    """
    Fixture to mock the ComputeService for testing.
    Provides a mocked compute service that returns local cluster configuration.
    """
    from darwin.compute.get_cluster_response_dto import ClusterResponse
    
    # Create a proper ClusterResponse mock
    mock_data = MagicMock()
    mock_data.cluster_id = mock_compute_response["data"]["cluster_id"]
    mock_data.name = mock_compute_response["data"]["name"]
    mock_data.status = mock_compute_response["data"]["status"]
    mock_data.has_ondemand_worker_group = mock_compute_response["data"]["has_ondemand_worker_group"]
    mock_data.spark_config = mock_compute_response["data"]["spark_config"]
    mock_data.worker_groups = mock_compute_response["data"]["worker_groups"]
    
    mock_response = MagicMock(spec=ClusterResponse)
    mock_response.data = mock_data
    
    mock_service = MagicMock()
    mock_service.get_compute_metadata.return_value = mock_response
    
    with patch("darwin.compute.service.ComputeService", return_value=mock_service):
        yield mock_service


@pytest.fixture(scope="function")
def local_spark_session():
    """
    Create a local Spark session for testing.
    Automatically stops the session after the test.
    """
    from pyspark.sql import SparkSession
    
    spark = SparkSession.builder \
        .appName("darwin-ci-test") \
        .master("local[2]") \
        .config("spark.driver.memory", "1g") \
        .config("spark.executor.memory", "1g") \
        .config("spark.sql.shuffle.partitions", "2") \
        .config("spark.ui.enabled", "false") \
        .config("spark.sql.warehouse.dir", "/tmp/spark-warehouse") \
        .getOrCreate()
    
    yield spark
    
    spark.stop()


@pytest.fixture(scope="function")
def ray_context():
    """
    Initialize Ray for testing.
    Handles both local and remote Ray cluster connections.
    """
    import ray
    
    # Shutdown any existing connection
    if ray.is_initialized():
        ray.shutdown()
    
    # Get Ray address from environment
    ray_address = os.getenv("RAY_ADDRESS", "local")
    
    if ray_address == "local":
        ray.init(
            num_cpus=4,
            include_dashboard=False,
            ignore_reinit_error=True
        )
    else:
        ray.init(
            address=ray_address,
            ignore_reinit_error=True
        )
    
    yield ray
    
    ray.shutdown()


@pytest.fixture(scope="function")
def raydp_spark_session(ray_context):
    """
    Create a RayDP Spark session for testing.
    Requires a running Ray cluster.
    """
    import raydp
    
    spark = raydp.init_spark(
        app_name="darwin-ci-raydp-test",
        num_executors=1,
        executor_cores=1,
        executor_memory="512m"
    )
    
    yield spark
    
    raydp.stop_spark()


@pytest.fixture(scope="function")
def temp_test_dir(tmp_path):
    """
    Create a temporary directory for test files.
    Automatically cleaned up after the test.
    """
    test_dir = tmp_path / "darwin_test"
    test_dir.mkdir(exist_ok=True)
    return str(test_dir)


# Pytest hooks for CI reporting
def pytest_collection_modifyitems(config, items):
    """
    Modify test collection for CI environment.
    Skip certain tests based on environment.
    """
    skip_ray_cluster = pytest.mark.skip(reason="Ray cluster not available")
    skip_raydp = pytest.mark.skip(reason="RayDP tests require real Ray cluster")
    
    ray_address = os.getenv("RAY_ADDRESS", "local")
    is_local_ray = ray_address == "local"
    
    for item in items:
        # Skip RayDP tests if running with local Ray
        if "raydp" in item.keywords and is_local_ray:
            item.add_marker(skip_raydp)
        
        # Skip ray_cluster tests if no real cluster
        if "ray_cluster" in item.keywords and is_local_ray:
            item.add_marker(skip_ray_cluster)


def pytest_report_header(config):
    """Add CI environment info to pytest report header."""
    lines = []
    lines.append(f"Darwin SDK CI Tests")
    lines.append(f"  ENV: {os.getenv('ENV', 'not set')}")
    lines.append(f"  RAY_ADDRESS: {os.getenv('RAY_ADDRESS', 'not set')}")
    lines.append(f"  CLUSTER_ID: {os.getenv('CLUSTER_ID', 'not set')}")
    return lines

