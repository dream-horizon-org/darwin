"""
Unit test fixtures for ml-serve-app.

This module provides fixtures used exclusively for unit tests with mocked dependencies.
"""
import os
import pytest
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

from tortoise import Tortoise
from tortoise.contrib.test import initializer, finalizer
from ml_serve_model import User, Environment, Serve, Artifact
from ml_serve_model.enums import ServeType

# Set test environment variables for unit tests
os.environ["ENV"] = "local"
os.environ["MYSQL_HOST"] = "localhost"
os.environ["MYSQL_DATABASE"] = "test_db"
os.environ["MYSQL_USERNAME"] = "test"
os.environ["MYSQL_PASSWORD"] = "test"
os.environ["DCM_URL"] = "http://test-dcm:8080"
os.environ["ARTIFACT_BUILDER_URL"] = "http://test-artifact-builder:8000"
os.environ["MLFLOW_TRACKING_URI"] = "http://test-mlflow:8080"
os.environ["DEFAULT_RUNTIME"] = "localhost:5000/serve-md-runtime:latest"
os.environ["CONTAINER_REGISTRY"] = "localhost:5000"


@pytest.fixture(scope="session")
def anyio_backend():
    """Configure anyio backend for async tests."""
    return "asyncio"


@pytest.fixture(scope="function")
async def db_session():
    """
    Initialize SQLite in-memory database for tests.
    This fixture is function-scoped to ensure clean state between tests.
    """
    # Initialize Tortoise ORM with SQLite in-memory
    await Tortoise.init(
        db_url="sqlite://:memory:",
        modules={"models": ["ml_serve_model"]}
    )
    await Tortoise.generate_schemas()
    
    yield
    
    # Clean up
    await Tortoise.close_connections()


@pytest.fixture
async def test_user(db_session):
    """Create a test user."""
    user = await User.create(
        username="test@example.com",
        token="test-token-123"
    )
    return user


@pytest.fixture
async def test_environment(db_session):
    """Create a test environment."""
    env = await Environment.create(
        name="test-env",
        cluster_name="kind",
        namespace="darwin",
        env_configs={
            "domain_suffix": "",
            "cluster_name": "kind",
            "namespace": "darwin",
            "security_group": "",
            "ft_redis_url": "",
            "workflow_url": ""
        },
        is_protected=False
    )
    return env


@pytest.fixture
async def test_serve(db_session, test_user):
    """Create a test serve."""
    serve = await Serve.create(
        name="test-serve",
        type=ServeType.API.value,
        description="Test serve for unit tests",
        space="test-space",
        created_by=test_user
    )
    return serve


@pytest.fixture
async def test_artifact(db_session, test_serve, test_user):
    """Create a test artifact."""
    artifact = await Artifact.create(
        serve=test_serve,
        version="v1.0.0",
        github_repo_url="https://github.com/test/repo",
        branch="main",
        image_url="localhost:5000/test-serve:v1.0.0",
        created_by=test_user
    )
    return artifact


@pytest.fixture
def mock_dcm_client():
    """Mock DCM client for unit tests."""
    client = AsyncMock()
    client.build_resource.return_value = {
        "body": {
            "status": "success",
            "artifact_id": "test-artifact"
        }
    }
    client.start_resource.return_value = {
        "body": {
            "status": "running",
            "pod": "test-pod-123"
        }
    }
    client.stop_resource.return_value = {
        "body": {
            "status": "stopped"
        }
    }
    client.update_resource.return_value = {
        "body": {
            "status": "updated"
        }
    }
    client.get_status.return_value = "Running"
    return client


@pytest.fixture
def mock_mlflow_client():
    """Mock MLflow client for unit tests."""
    client = AsyncMock()
    client.validate_model_uri.return_value = (True, None)
    client.get_model_info.return_value = {
        "name": "test-model",
        "version": "1",
        "run_id": "test-run-123"
    }
    # Mock get_model_size to return a reasonable size (500 MB)
    client.get_model_size = AsyncMock(return_value=500 * 1024 * 1024)
    return client


@pytest.fixture
def mock_artifact_builder_client():
    """Mock Artifact Builder client for unit tests."""
    client = AsyncMock()
    client.build_artifact.return_value = {
        "job_id": "test-job-123",
        "status": "pending"
    }
    client.get_build_status.return_value = {
        "status": "success",
        "image_url": "localhost:5000/test-serve:v1.0.0"
    }
    return client


@pytest.fixture
def mock_http_client():
    """Mock HTTP client for unit tests."""
    client = AsyncMock()
    client.post.return_value = {
        "status_code": 200,
        "body": {"status": "success"}
    }
    client.get.return_value = {
        "status_code": 200,
        "body": {"data": "test"}
    }
    client.patch.return_value = {
        "status_code": 200,
        "body": {"status": "updated"}
    }
    return client
