import requests

from darwin.compute.get_cluster_response_dto import ClusterResponse
from darwin.config_clients.application_config_client import ApplicationConfigClient
from darwin.exceptions import UnableToFetchComputeMetadataError
from darwin.util.utils import get_application_config_path, retry


class ComputeService:
    """
    Service class for compute related operations
    """

    def __init__(self, cluster_id: str):
        self.cluster_id = cluster_id
        self.application_config_client = ApplicationConfigClient(get_application_config_path())

    @retry(
        retries=3,
        delay=1,
        exceptions=(
            requests.exceptions.ConnectionError,
            requests.exceptions.Timeout,
            UnableToFetchComputeMetadataError,
        ),
    )
    def get_compute_metadata(self) -> ClusterResponse:
        """
        Get the metadata for the current running cluster
        :return: ClusterResponse object
        """
        try:
            return ClusterResponse.from_dict(
                requests.get(self.application_config_client.get_compute_url() + f"/cluster/{self.cluster_id}/").json()
            )
        except Exception as e:
            raise UnableToFetchComputeMetadataError("Unable to fetch compute metadata") from e
