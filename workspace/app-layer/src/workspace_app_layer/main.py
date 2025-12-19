from otel_bootstrap import OpenTelemetryMiddleware
import os

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

from typing import Optional

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from workspace_app_layer.constants.config import Config
from workspace_app_layer.controllers.workspace import *

from workspace_app_layer.controllers.workspace.get_project_id_and_codespace_id_rom_codespace_path import (
    get_project_id_and_codespace_id_from_codespace_path,
)
from workspace_app_layer.controllers.workspace.get_workspaces_and_codespaces import (
    get_workspaces_and_codespaces_by_cluster_id,
)

from workspace_app_layer.models.workspace import *

from workspace_app_layer.models.workspace.codespace_path_request import CodespacePathRequest
from workspace_app_layer.models.workspace.get_all_cluster_request import GetAllClusterRequest

from workspace_core.service.compute import Compute
from workspace_core.workspaces import WorkspacesSDK

ENV = os.getenv("ENV")

compute = Compute(env=ENV)
workspace = WorkspacesSDK(env=ENV)
log_file_root = Config(env=ENV).log_file_root

app = FastAPI()

app.add_middleware(OpenTelemetryMiddleware)

FastAPIInstrumentor.instrument_app(app)
RequestsInstrumentor().instrument()

if not os.getenv("DEV"):
    try:
        app.mount("/static", StaticFiles(directory=log_file_root), name="static")
    except RuntimeError:
        app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health")
def health():
    return {"status": "Success"}


@app.get("/get-projects")
def get_projects(user: str, myProjects: bool = True, sortBy: str = "last_updated", query: Optional[str] = ""):
    return get_all_projects(workspace, user_id=user, my_projects=myProjects, sort_by=sortBy, query=query)


@app.get("/get-codespaces")
def get_codespaces(project_id: int):
    return get_codespaces_by_project(workspace, project_id)


@app.post("/get-codespace-path-project-and-codespace")
def get_project_id_and_codespace_id_from_codespace(request: CodespacePathRequest):
    return get_project_id_and_codespace_id_from_codespace_path(workspace, request)


@app.get("/codespaces/{cluster_id}")
async def get_workspaces_and_codespaces(cluster_id: str):
    return await get_workspaces_and_codespaces_by_cluster_id(workspace, cluster_id)


@app.put("/detach-cluster/v2")
def detach_cluster_v2(request: DetachClusterRequest):
    return detach_cluster_v2_controller(workspace, request)


@app.put("/attach-cluster/v2")
async def attach_cluster_v2(request: AttachClusterRequest):
    return await attach_cluster_v2_controller(workspace, request, compute, ENV)


@app.get("/get-last-synced-time-for-codespace")
async def getcodespacelastsyncedtime(codespace_id: int):
    return await get_codespace_last_synced_time(workspace, codespace_id)


@app.get("/get-last-selected-codespace/v2")
async def get_last_selected_codespace_v2_controller(user: str):
    return await get_last_selected_codespace_by_user_v2_controller(workspace, user, compute, ENV)


@app.post("/launch-codespace/v2")
async def launch_codespace_v2(request: LaunchCodespaceRequest):
    return await launch_codespace_v3_controller(workspace, request, compute, ENV)


@app.post("/check-unique-project-name")
def checkuniqueprojectname(request: CheckUniqueProjectNameRequest):
    return check_unique_project_name(workspace, request)


@app.post("/check-unique-github-link")
def checkuniquegithublink(request: CheckUniqueGithubLinkRequest):
    return check_unique_github_link(workspace, request)


@app.post("/check-unique-codespace-name")
def checkuniquecodespacename(request: CheckUniqueCodespaceNameRequest):
    return check_unique_codespace_name(workspace, request)


@app.post("/create-project/v2")
def create_project_v2(request: CreateProjectRequest):
    return create_project_v2_controller(workspace, request, compute, ENV)


@app.post("/import-project")
def importproject(request: ImportProjectRequest):
    return import_project(workspace, request, compute, ENV)


@app.post("/create-codespace/v2")
async def create_codespace_v2(request: CreateCodespaceRequest):
    return await create_codespace_v2_controller(workspace, request, compute, ENV)


@app.post("/get-all-clusters")
async def getallclusters(request: GetAllClusterRequest):
    return await get_all_clusters(compute, request)


@app.post("/launch-imported-project")
def launchimportedproject(request: LaunchImportedProjectRequest):
    return launch_imported_project(compute, workspace, request.codespace_id, request.github_url)


@app.get("/cluster-resources")
def cluster_resources(cluster_id: str):
    return get_cluster_resources(cluster_id, compute, ENV)


@app.delete("/delete-project/v2")
async def delete_project_v2(project_id: int, user: str):
    return await delete_project_v2_controller(workspace, project_id, user)


@app.delete("/delete-codespace/v2")
def delete_codespace_v2(project_id: int, codespace_id: int, user: str):
    return delete_codespace_v2_controller(workspace, project_id, codespace_id, user)


@app.post("/edit-codespace/v2")
def edit_codespace_v2(request: UpdateCodespaceRequest):
    return edit_codespace_v2_controller(workspace, request)


@app.post("/edit-project/v2")
def edit_project_v2(request: UpdateProjectRequest):
    return edit_project_v2_controller(workspace, request)


@app.get("/get-count-of-projects")
def get_project_count(user_id: str):
    return get_project_count_controller(workspace, user_id)


@app.get("/workspaces")
def get_workspaces():
    return get_workspaces_controller(workspace)


@app.post("/folder-contents")
def folder_contents(request: FolderContentsRequest):
    return folder_contents_controller(workspace, request)
