import json
import os
from configparser import ConfigParser

import pytest
import responses

from darwin.compute.get_cluster_response_dto import ClusterResponse
from darwin.compute.service import ComputeService


def _set_aws_credentials():
    """
    Set AWS credentials for testing purposes.
    This is necessary for mocking AWS services in tests.
    """
    config = ConfigParser()
    config.read(os.path.expanduser("~/.aws/credentials"))
    os.environ["AWS_ACCESS_KEY_ID"] = config.get("default", "aws_access_key_id")
    os.environ["AWS_SECRET_ACCESS_KEY"] = config.get("default", "aws_secret_access_key")
    os.environ["AWS_SESSION_TOKEN"] = config.get(
        "default", "aws_session_token", fallback=""
    )
    os.environ["AWS_REGION"] = config.get("default", "region", fallback="us-east-1")
    os.environ["AWS_DEFAULT_REGION"] = os.environ["AWS_REGION"]


@pytest.fixture(scope="session", autouse=True)
def setup_session():
    """
    Setup fixture to run before any tests in the session.
    This can be used to initialize resources or configurations needed for the tests.
    It sets the environment variable for the environment and configures AWS credentials for local testing.
    """
    if os.getenv("ENV") is None:
        os.environ["ENV"] = "dev"
        _set_aws_credentials()
        os.environ["AWS_EC2_METADATA_DISABLED"] = "true"
    yield
    # Any teardown code can go here


@pytest.fixture(scope="function")
def mock_cluster_response(request):
    json_path = os.path.join(os.path.dirname(__file__), "resources", request.param)
    with open(json_path) as f:
        raw_data = json.load(f)

    yield ClusterResponse.from_dict(raw_data)


@pytest.fixture(scope="function")
def patch_compute_service(monkeypatch, mock_compute_service):
    monkeypatch.setattr(
        "darwin.compute.service.ComputeService", lambda cluster_id: mock_compute_service
    )


@pytest.fixture
def mock_compute_service(mock_cluster_response, request):
    """
    Fixture to mock the ComputeService for testing.
    This fixture sets up the ComputeService with a mocked cluster response.
    """
    cluster_id = mock_cluster_response.data.cluster_id
    base_url = "http://mock-compute-service.org-dev.local"
    # Register the HTTP mock
    if mock_cluster_response.data.cluster_id == "UNKNOWN_CLUSTER_ID":
        responses.add(
            responses.GET,
            f"{base_url}/cluster/{cluster_id}/",
            json={"detail": "Cluster not found"},
            status=404,
        )
    else:
        responses.add(
            responses.GET,
            f"{base_url}/cluster/{cluster_id}/",
            json=mock_cluster_response.to_dict(),
            status=200,
        )
    # Register cluster id
    os.environ["CLUSTER_ID"] = cluster_id

    return ComputeService(cluster_id)
