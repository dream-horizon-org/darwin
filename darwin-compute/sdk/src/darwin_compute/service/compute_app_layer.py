from typing import Dict, Any

import requests

from compute_model.compute_cluster import ComputeClusterDefinition
from compute_model.package import Package
from darwin_compute.constant.config import Config


class ComputeAppLayer:
    """
    ComputeAppLayer class to interact with compute app layer service over http
    TODO: Consider adding retry logic with exponential backoff for transient failures
    """

    def __init__(self, env: str):
        self.env = env
        self._config = Config(self.env)

    @staticmethod
    def _request(
        method: str,
        url: str,
        params: Dict[str, str] = None,
        headers: Dict[str, Any] = None,
        payload: Dict[str, Any] = None,
    ):
        # TODO: 60s timeout is hardcoded - should be configurable per operation type
        resp = requests.request(method, url, params=params, headers=headers, json=payload, timeout=60)
        if not 200 <= resp.status_code < 300:
            # TODO: Use a custom ComputeAPIError with status code and response body for better debugging
            raise IOError(resp.text)
        resp_json = resp.json()
        return resp_json

    def _get_url(self, endpoint: str):
        url = f"{self._config.get_compute_url}{endpoint}"
        return url

    def create(self, compute_request: ComputeClusterDefinition):
        url = self._get_url("/cluster")
        payload = compute_request.convert()
        resp = self._request(method="POST", url=url, payload=payload)
        return resp

    def start(self, cluster_id: str):
        url = self._get_url(f"/cluster/start-cluster/{cluster_id}")
        # TODO: Hardcoded user header "sdk" should be configurable or use actual user identity
        headers = {"msd-user": '{"email": "sdk"}'}
        resp = self._request(method="POST", url=url, headers=headers)
        return resp

    def stop(self, cluster_id: str):
        url = self._get_url(f"/cluster/stop-cluster/{cluster_id}")
        headers = {"msd-user": '{"email": "sdk"}'}
        resp = self._request(method="POST", url=url, headers=headers)
        return resp

    def restart(self, cluster_id: str):
        url = self._get_url(f"/cluster/restart-cluster/{cluster_id}")
        headers = {"msd-user": '{"email": "sdk"}'}
        resp = self._request(method="POST", url=url, headers=headers)
        return resp

    def update(self, cluster_id: str, compute_request: ComputeClusterDefinition):
        url = self._get_url(f"/cluster/{cluster_id}")
        payload = compute_request.convert()
        resp = self._request(method="PUT", url=url, payload=payload)
        return resp

    def delete(self, cluster_id: str):
        url = self._get_url(f"/cluster/{cluster_id}")
        resp = self._request(method="DELETE", url=url)
        return resp

    def get_info(self, cluster_id: str):
        url = self._get_url(f"/cluster/{cluster_id}/metadata")
        resp = self._request(method="GET", url=url)
        return resp

    def get_details(self, cluster_id: str):
        url = self._get_url(f"/cluster/{cluster_id}")
        resp = self._request(method="GET", url=url)
        return resp

    def get_all(self, query: str = "", page_size: int = 100, offset: int = 0):
        url = self._get_url("/search")
        body = {
            "query": query,
            "filters": {},
            "page_size": page_size,
            "offset": offset,
            "sort_by": "created_on",
            "sort_order": "desc",
        }
        resp = self._request(method="POST", url=url, payload=body)
        return resp

    def force_update(self, cluster_id: str):
        url = self._get_url(f"/cluster/force/{cluster_id}")
        resp = self._request(method="PUT", url=url)
        return resp

    def get_packages(
        self,
        cluster_id: str,
        key: str = "",
        sort_by: str = "created_at",
        sort_order: str = "desc",
        offset: int = 0,
        page_size: int = 10,
    ):
        url = self._get_url(f"/cluster/{cluster_id}/library")
        params = {"key": key, "sort_by": sort_by, "sort_order": sort_order, "offset": offset, "page_size": page_size}
        resp = self._request(method="GET", url=url, params=params)
        return resp

    def install_package(self, cluster_id: str, request: Package):
        url = self._get_url(f"/cluster/{cluster_id}/library/install")
        payload = request.to_dict()
        resp = self._request(method="POST", url=url, payload=payload)
        return resp

    def uninstall_packages(self, cluster_id: str, ids: list[str]):
        url = self._get_url(f"/cluster/{cluster_id}/library/uninstall")
        payload = {"id": ids}
        resp = self._request(method="PUT", url=url, payload=payload)
        return resp
