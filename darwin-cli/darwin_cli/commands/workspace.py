"""Workspace project and codespace management commands."""

from typing import Optional

import typer
from loguru import logger

from darwin_cli.utils.utils import _run_sync
from darwin_workspace import (
    attach_cluster,
    detach_cluster,
    check_unique_codespace_name,
    check_unique_project_name,
    create_codespace,
    create_project,
    delete_codespace,
    delete_project,
    edit_codespace,
    edit_project,
    get_codespaces,
    get_project_count,
    get_projects,
    get_workspaces_and_codespaces,
    launch_codespace,
)
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


app = typer.Typer(help="Workspace projects and codespaces", no_args_is_help=True)

project_app = typer.Typer(help="Project operations", no_args_is_help=True)
codespace_app = typer.Typer(help="Codespace operations", no_args_is_help=True)
cluster_app = typer.Typer(help="Cluster attachment operations", no_args_is_help=True)

app.add_typer(project_app, name="project")
app.add_typer(codespace_app, name="codespace")
app.add_typer(cluster_app, name="cluster")


# ----------------------
# Project commands
# ----------------------

@project_app.command("create")
def project_create(
    project_name: str = typer.Option(..., "--project-name", help="Project name"),
    codespace_name: str = typer.Option(..., "--codespace-name", help="Initial codespace name"),
    user: str = typer.Option(..., "--user", help="User email"),
    cluster_id: Optional[str] = typer.Option(
        None,
        "--cluster-id",
        help="Optional cluster id to attach at project creation time",
    ),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Create project (with initial codespace), optionally attaching a cluster."""
    req = CreateProjectRequest(
        project_name=project_name,
        codespace_name=codespace_name,
        user=user,
        cluster_id=cluster_id,
    )
    logger.info("Creating project '{}' for user '{}' (cluster_id={})", project_name, user, cluster_id)
    result = _run_sync(create_project, req, retries=retries)
    typer.echo(result)


@project_app.command("list")
def project_list(
    user: str = typer.Option(..., "--user", help="User email"),
    my_projects: bool = typer.Option(True, "--my-projects", help="List my projects if true, others otherwise"),
    sort_by: str = typer.Option(
        "last_updated",
        "--sort-by",
        help="Sort field (e.g. last_updated or name)",
    ),
    query: str = typer.Option("", "--query", help="Search query"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """List projects for a user."""
    logger.info("Listing projects for user='{}' (my_projects={}, sort_by='{}', query='{}')", user, my_projects, sort_by, query)
    result = _run_sync(get_projects, user, my_projects, sort_by, query, retries=retries)
    typer.echo(result)


@project_app.command("count")
def project_count(
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Get project count for a user."""
    logger.info("Getting project count for user='{}'", user)
    result = _run_sync(get_project_count, user, retries=retries)
    typer.echo(result)


@project_app.command("update")
def project_update(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    project_name: str = typer.Option(..., "--project-name", help="New project name"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Update a project's name."""
    req = UpdateProjectRequest(project_id=project_id, project_name=project_name, user=user)
    logger.info("Updating project_id={} to name='{}' (user='{}')", project_id, project_name, user)
    result = _run_sync(edit_project, req, retries=retries)
    typer.echo(result)


@project_app.command("delete")
def project_delete(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Delete a project and all its codespaces."""
    logger.info("Deleting project_id={} (user='{}')", project_id, user)
    result = _run_sync(delete_project, project_id, user, retries=retries)
    typer.echo(result)


@project_app.command("check-unique")
def project_check_unique(
    name: str = typer.Option(..., "--name", help="Project name to validate"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Check if a project name is unique for a user."""
    req = CheckUniqueProjectNameRequest(project_name=name, user=user)
    logger.info("Checking uniqueness of project name='{}' for user='{}'", name, user)
    result = _run_sync(check_unique_project_name, req, retries=retries)
    typer.echo(result)


# ----------------------
# Codespace commands
# ----------------------

@codespace_app.command("create")
def codespace_create(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    codespace_name: str = typer.Option(..., "--codespace-name", help="Codespace name"),
    user: str = typer.Option(..., "--user", help="User email"),
    cluster_id: Optional[str] = typer.Option(
        None,
        "--cluster-id",
        help="Cluster id to attach to the codespace",
    ),
    clone_from: Optional[str] = typer.Option(
        None,
        "--clone-from",
        help="Existing codespace name to clone from",
    ),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Create a codespace for a project (optionally attach cluster and/or clone)."""
    req = CreateCodespaceRequest(
        project_id=str(project_id),
        codespace_name=codespace_name,
        user=user,
        cluster_id=cluster_id,
        clone_from_codespace_name=clone_from,
    )
    logger.info(
        "Creating codespace '{}' for project_id={} (user='{}', cluster_id={}, clone_from={})",
        codespace_name,
        project_id,
        user,
        cluster_id,
        clone_from,
    )
    result = _run_sync(create_codespace, req, retries=retries)
    typer.echo(result)


@codespace_app.command("list")
def codespace_list(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """List codespaces for a project."""
    logger.info("Listing codespaces for project_id={}", project_id)
    result = _run_sync(get_codespaces, project_id, retries=retries)
    typer.echo(result)


@codespace_app.command("launch")
def codespace_launch(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    codespace_id: int = typer.Option(..., "--codespace-id", help="Codespace id"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Launch a codespace (start Jupyter environment)."""
    req = LaunchCodespaceRequest(project_id=project_id, codespace_id=codespace_id, user=user)
    logger.info("Launching codespace_id={} for project_id={} (user='{}')", codespace_id, project_id, user)
    result = _run_sync(launch_codespace, req, retries=retries)
    typer.echo(result)


@codespace_app.command("update")
def codespace_update(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    codespace_id: int = typer.Option(..., "--codespace-id", help="Codespace id"),
    codespace_name: str = typer.Option(..., "--codespace-name", help="New codespace name"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Update a codespace name."""
    req = UpdateCodespaceRequest(
        project_id=str(project_id),
        codespace_id=str(codespace_id),
        codespace_name=codespace_name,
        user=user,
    )
    logger.info(
        "Updating codespace_id={} for project_id={} to name='{}' (user='{}')",
        codespace_id,
        project_id,
        codespace_name,
        user,
    )
    result = _run_sync(edit_codespace, req, retries=retries)
    typer.echo(result)


@codespace_app.command("delete")
def codespace_delete(
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    codespace_id: int = typer.Option(..., "--codespace-id", help="Codespace id"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Delete a codespace."""
    logger.info("Deleting codespace_id={} for project_id={} (user='{}')", codespace_id, project_id, user)
    result = _run_sync(delete_codespace, project_id, codespace_id, user, retries=retries)
    typer.echo(result)


@codespace_app.command("check-unique")
def codespace_check_unique(
    name: str = typer.Option(..., "--name", help="Codespace name to validate"),
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Check if a codespace name is unique within a project."""
    req = CheckUniqueCodespaceNameRequest(
        project_id=project_id,
        codespace_name=name,
        user=user,
    )
    logger.info(
        "Checking uniqueness of codespace name='{}' for project_id={} (user='{}')",
        name,
        project_id,
        user,
    )
    result = _run_sync(check_unique_codespace_name, req, retries=retries)
    typer.echo(result)


# ----------------------
# Cluster commands
# ----------------------

@cluster_app.command("attach")
def cluster_attach(
    codespace_id: int = typer.Option(..., "--codespace-id", help="Codespace id"),
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster id"),
    project_id: int = typer.Option(..., "--project-id", help="Project id"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Attach a cluster to a codespace."""
    req = AttachClusterRequest(
        codespace_id=codespace_id,
        cluster_id=cluster_id,
        project_id=project_id,
        user=user,
    )
    logger.info(
        "Attaching cluster_id='{}' to codespace_id={} (project_id={}, user='{}')",
        cluster_id,
        codespace_id,
        project_id,
        user,
    )
    result = _run_sync(attach_cluster, req, retries=retries)
    typer.echo(result)


@cluster_app.command("detach")
def cluster_detach(
    codespace_id: int = typer.Option(..., "--codespace-id", help="Codespace id"),
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster id"),
    user: str = typer.Option(..., "--user", help="User email"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Detach a cluster from a codespace."""
    req = DetachClusterRequest(
        codespace_id=codespace_id,
        cluster_id=cluster_id,
        user=user,
    )
    logger.info(
        "Detaching cluster_id='{}' from codespace_id={} (user='{}')",
        cluster_id,
        codespace_id,
        user,
    )
    result = _run_sync(detach_cluster, req, retries=retries)
    typer.echo(result)


@cluster_app.command("codespaces")
def cluster_codespaces(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster id"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Get workspaces and codespaces by cluster id."""
    logger.info("Getting workspaces and codespaces for cluster_id='{}'", cluster_id)
    result = _run_sync(get_workspaces_and_codespaces, cluster_id, retries=retries)
    typer.echo(result)


