from typing import Any, Dict, Optional

import requests
from typeguard import typechecked

from darwin_workspace.constant.config import Config
from workspace_model.attach_cluster_request import AttachClusterRequest
from workspace_model.cheque_unique_request import (
    CheckUniqueCodespaceNameRequest,
    CheckUniqueProjectNameRequest,
)
from workspace_model.create_codespace_request import CreateCodespaceRequest
from workspace_model.create_project_request import CreateProjectRequest
from workspace_model.detach_cluster_request import DetachClusterRequest
from workspace_model.launch_codespace_request import LaunchCodespaceRequest
from workspace_model.update_codespace import UpdateCodespaceRequest
from workspace_model.update_project_request import UpdateProjectRequest

@typechecked
class WorkspaceAppLayer:
    """HTTP client for the Workspace app-layer FastAPI service."""

    def __init__(self, env: str):
        self.env = env
        self._config = Config(self.env)

    def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        payload: Optional[Dict[str, Any]] = None,
    ) -> Any:
        url = f"{self._config.workspace_url}{endpoint}"
        resp = requests.request(method, url, params=params, json=payload, timeout=60)
        if not 200 <= resp.status_code < 300:
            raise IOError(resp.text)
        return resp.json()

    def get_projects(self, user: str, my_projects: bool = True, sort_by: str = "last_updated", query: str = "") -> Any:
        params = {"user": user, "myProjects": my_projects, "sortBy": sort_by, "query": query}
        return self._request("GET", "/get-projects", params=params)

    def get_project_count(self, user_id: str) -> Any:
        params = {"user_id": user_id}
        return self._request("GET", "/get-count-of-projects", params=params)


    def get_workspaces(self) -> Any:
        return self._request("GET", "/workspaces")


    def create_project(self, request: CreateProjectRequest) -> Any:
        return self._request("POST", "/create-project/v2", payload=request.dict())

    def delete_project(self, project_id: int, user: str) -> Any:
        params = {"project_id": project_id, "user": user}
        return self._request("DELETE", "/delete-project/v2", params=params)

    def get_codespaces(self, project_id: int) -> Any:
        params = {"project_id": project_id}
        return self._request("GET", "/get-codespaces", params=params)

    def get_workspaces_and_codespaces(self, cluster_id: str) -> Any:
        return self._request("GET", f"/codespaces/{cluster_id}")

    def create_codespace(self, request: CreateCodespaceRequest) -> Any:
        return self._request("POST", "/create-codespace/v2", payload=request.dict())

    def launch_codespace(self, request: LaunchCodespaceRequest) -> Any:
        return self._request("POST", "/launch-codespace/v2", payload=request.dict())

    def attach_cluster(self, request: AttachClusterRequest) -> Any:
        return self._request("PUT", "/attach-cluster/v2", payload=request.dict())

    def detach_cluster(self, request: DetachClusterRequest) -> Any:
        return self._request("PUT", "/detach-cluster/v2", payload=request.dict())

    def delete_codespace(self, project_id: int, codespace_id: int, user: str) -> Any:
        params = {"project_id": project_id, "codespace_id": codespace_id, "user": user}
        return self._request("DELETE", "/delete-codespace/v2", params=params)

    def edit_codespace(self, request: UpdateCodespaceRequest) -> Any:
        return self._request("POST", "/edit-codespace/v2", payload=request.dict())

    def edit_project(self, request: UpdateProjectRequest) -> Any:
        return self._request("POST", "/edit-project/v2", payload=request.dict())

    def check_unique_project_name(self, request: CheckUniqueProjectNameRequest) -> Any:
        return self._request("POST", "/check-unique-project-name", payload=request.dict())

    def check_unique_codespace_name(self, request: CheckUniqueCodespaceNameRequest) -> Any:
        return self._request("POST", "/check-unique-codespace-name", payload=request.dict())
