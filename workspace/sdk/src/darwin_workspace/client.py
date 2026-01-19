from os import environ
from typing import Any

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
from darwin_workspace.service.workspace_app_layer import WorkspaceAppLayer

"""
Workspace SDK

High-level, env-aware client for the Workspace app-layer service.
ENV is used to pick the correct workspace_url from the SDK's CONFIGS_MAP.
"""

env = environ.get("ENV", "darwin-local")
app_layer = WorkspaceAppLayer(env)



def get_projects(user: str, my_projects: bool = True, sort_by: str = "last_updated", query: str = "") -> Any:
    """Get list of projects for a user."""
    return app_layer.get_projects(user=user, my_projects=my_projects, sort_by=sort_by, query=query)


def get_codespaces(project_id: int) -> Any:
    """Get list of codespaces for a given project."""
    return app_layer.get_codespaces(project_id=project_id)


def get_workspaces() -> Any:
    """Get list of workspaces."""
    return app_layer.get_workspaces()


def get_project_count(user_id: str) -> Any:
    """Get count of projects (mine and others) for the given user."""
    return app_layer.get_project_count(user_id=user_id)


def get_workspaces_and_codespaces(cluster_id: str) -> Any:
    """Get workspaces and codespaces for a given cluster."""
    return app_layer.get_workspaces_and_codespaces(cluster_id=cluster_id)


def create_project(request: CreateProjectRequest) -> Any:
    """Create a new project and its initial codespace."""
    return app_layer.create_project(request)


def create_codespace(request: CreateCodespaceRequest) -> Any:
    """Create a new codespace for an existing project."""
    return app_layer.create_codespace(request)


def launch_codespace(request: LaunchCodespaceRequest) -> Any:
    """Launch a codespace."""
    return app_layer.launch_codespace(request)


def attach_cluster(request: AttachClusterRequest) -> Any:
    """Attach a cluster to a codespace."""
    return app_layer.attach_cluster(request)


def detach_cluster(request: DetachClusterRequest) -> Any:
    """Detach a cluster from a codespace."""
    return app_layer.detach_cluster(request)


def delete_project(project_id: int, user: str) -> Any:
    """Delete a project and its codespaces."""
    return app_layer.delete_project(project_id, user)


def delete_codespace(project_id: int, codespace_id: int, user: str) -> Any:
    """Delete a codespace."""
    return app_layer.delete_codespace(project_id, codespace_id, user)


def edit_codespace(request: UpdateCodespaceRequest) -> Any:
    """Edit codespace details."""
    return app_layer.edit_codespace(request)


def edit_project(request: UpdateProjectRequest) -> Any:
    """Edit project details."""
    return app_layer.edit_project(request)


def check_unique_project_name(request: CheckUniqueProjectNameRequest) -> Any:
    """Check if a project name is unique for a user."""
    return app_layer.check_unique_project_name(request)


def check_unique_codespace_name(request: CheckUniqueCodespaceNameRequest) -> Any:
    """Check if a codespace name is unique within a project."""
    return app_layer.check_unique_codespace_name(request)
