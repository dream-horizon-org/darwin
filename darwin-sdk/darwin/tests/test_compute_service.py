import pytest
import responses

from darwin.compute.get_cluster_response_dto import ClusterResponse
from darwin.exceptions import UnableToFetchComputeMetadataError


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
def test_cluster_metadata_structure_response(mock_compute_service, mock_cluster_response):
    metadata: ClusterResponse = mock_compute_service.get_compute_metadata()

    assert metadata.data.cluster_id == mock_cluster_response.data.cluster_id
    assert metadata.data.name == mock_cluster_response.data.name
    assert metadata.data.status == mock_cluster_response.data.status


@responses.activate
@pytest.mark.parametrize(
    "mock_cluster_response",
    ["compute_response_with_unknown_cluster.json"],
    indirect=True,
)
def test_compute_service_raises_custom_exception(mock_compute_service, mock_cluster_response):
    with pytest.raises(UnableToFetchComputeMetadataError, match="Unable to fetch compute metadata"):
        mock_compute_service.get_compute_metadata()


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_ondemand_node.json"], indirect=True)
def test_is_ondemand_worker_worker_group_attached(mock_compute_service, mock_cluster_response):
    metadata: ClusterResponse = mock_compute_service.get_compute_metadata()
    assert metadata.data.has_ondemand_worker_group is True


@responses.activate
@pytest.mark.parametrize(
    "mock_cluster_response",
    ["compute_response_without_ondemand_node.json"],
    indirect=True,
)
def test_is_ondemand_worker_worker_group_not_attached(mock_compute_service, mock_cluster_response):
    metadata: ClusterResponse = mock_compute_service.get_compute_metadata()
    assert metadata.data.has_ondemand_worker_group is False


@responses.activate
@pytest.mark.parametrize("mock_cluster_response", ["compute_response_with_spark_conf.json"], indirect=True)
def test_spark_config(mock_compute_service, mock_cluster_response):
    metadata: ClusterResponse = mock_compute_service.get_compute_metadata()
    spark_config = metadata.data.spark_config

    assert spark_config.get("spark.app.name") == "test"
