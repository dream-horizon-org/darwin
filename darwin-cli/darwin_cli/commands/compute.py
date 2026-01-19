"""Compute cluster management commands."""

from typing import Optional

import typer
from compute_model.package import Package, PackageDetails, PackageSource
from darwin_cli.utils.utils import _run_sync, build_compute_definition_inline, str_to_list
from darwin_compute import client as compute_client
from loguru import logger

app = typer.Typer(help="Ray cluster management", no_args_is_help=True)


@app.command()
def create(
    file: Optional[str] = typer.Option(
        None,
        "--file",
        help="Path to cluster configuration YAML file. If not provided, inline parameters are used.",
    ),
    name: Optional[str] = typer.Option(
        None,
        "--name",
        help="Cluster name (required when --file is not provided)",
    ),
    runtime: Optional[str] = typer.Option(
        None,
        "--runtime",
        help="Runtime name (required when --file is not provided)",
    ),
    head_cores: Optional[int] = typer.Option(
        None,
        "--head-cores",
        help="Number of vCPUs for head node (required when --file is not provided)",
    ),
    head_memory: Optional[int] = typer.Option(
        None,
        "--head-memory",
        help="Memory (GB) for head node (required when --file is not provided)",
    ),
    worker_cores: Optional[int] = typer.Option(
        None,
        "--worker-cores",
        help="Number of vCPUs for each worker (required when --file is not provided)",
    ),
    worker_memory: Optional[int] = typer.Option(
        None,
        "--worker-memory",
        help="Memory (GB) for each worker (required when --file is not provided)",
    ),
    worker_min: Optional[int] = typer.Option(
        None,
        "--worker-min",
        help="Minimum number of worker pods (required when --file is not provided)",
    ),
    worker_max: Optional[int] = typer.Option(
        None,
        "--worker-max",
        help="Maximum number of worker pods (required when --file is not provided)",
    ),
    terminate_after: Optional[int] = typer.Option(
        None,
        "--terminate-after",
        help="Auto-termination time in minutes (default 60 if not provided)",
    ),
    user: Optional[str] = typer.Option(
        None,
        "--user",
        help="Requesting user (default 'sdk' if not provided)",
    ),
    tags: Optional[str] = typer.Option(
        None,
        "--tags",
        help="Comma-separated list of tags",
    ),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Create a new compute cluster."""
    # Path 1: YAML-based creation
    if file:
        logger.info("Creating compute cluster from file: {}", file)
        result = _run_sync(compute_client.create_with_yaml, file, retries=retries)
        typer.echo(result)
        return

    compute_def = build_compute_definition_inline(
        name=name,
        runtime=runtime,
        head_cores=head_cores,
        head_memory=head_memory,
        worker_cores=worker_cores,
        worker_memory=worker_memory,
        worker_min=worker_min,
        worker_max=worker_max,
        terminate_after=terminate_after,
        user=user,
        tags=tags,
    )

    logger.info("Creating compute cluster inline: {}", compute_def.name)
    result = _run_sync(compute_client.create, compute_def, retries=retries)
    typer.echo(result)


@app.command()
def start(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID to start"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Start an existing cluster."""
    logger.info("Starting cluster: {}", cluster_id)
    result = _run_sync(compute_client.start, cluster_id, retries=retries)
    typer.echo(result)


@app.command()
def stop(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID to stop"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Stop a running cluster."""
    logger.info("Stopping cluster: {}", cluster_id)
    result = _run_sync(compute_client.stop, cluster_id, retries=retries)
    typer.echo(result)


@app.command()
def restart(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID to restart"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Restart a cluster."""
    logger.info("Restarting cluster: {}", cluster_id)
    result = _run_sync(compute_client.restart, cluster_id, retries=retries)
    typer.echo(result)


@app.command()
def delete(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID to delete"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Delete a cluster."""
    logger.info("Deleting cluster: {}", cluster_id)
    result = _run_sync(compute_client.delete, cluster_id, retries=retries)
    typer.echo(result)


@app.command()
def update(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID to update"),
    file: Optional[str] = typer.Option(
        None,
        "--file",
        help="Path to updated configuration YAML file. If not provided, inline parameters are used.",
    ),
    name: Optional[str] = typer.Option(
        None,
        "--name",
        help="Cluster name (required for inline update when --file is not provided)",
    ),
    runtime: Optional[str] = typer.Option(
        None,
        "--runtime",
        help="Runtime name (required for inline update when --file is not provided)",
    ),
    head_cores: Optional[int] = typer.Option(
        None,
        "--head-cores",
        help="Number of vCPUs for head node (required for inline update when --file is not provided)",
    ),
    head_memory: Optional[int] = typer.Option(
        None,
        "--head-memory",
        help="Memory (GB) for head node (required for inline update when --file is not provided)",
    ),
    worker_cores: Optional[int] = typer.Option(
        None,
        "--worker-cores",
        help="Number of vCPUs for each worker (required for inline update when --file is not provided)",
    ),
    worker_memory: Optional[int] = typer.Option(
        None,
        "--worker-memory",
        help="Memory (GB) for each worker (required for inline update when --file is not provided)",
    ),
    worker_min: Optional[int] = typer.Option(
        None,
        "--worker-min",
        help="Minimum number of worker pods (required for inline update when --file is not provided)",
    ),
    worker_max: Optional[int] = typer.Option(
        None,
        "--worker-max",
        help="Maximum number of worker pods (required for inline update when --file is not provided)",
    ),
    terminate_after: Optional[int] = typer.Option(
        None,
        "--terminate-after",
        help="Auto-termination time in minutes (default 60 if not provided, for inline update)",
    ),
    user: Optional[str] = typer.Option(
        None,
        "--user",
        help="Requesting user (default 'sdk' if not provided, for inline update)",
    ),
    tags: Optional[str] = typer.Option(
        None,
        "--tags",
        help="Comma-separated list of tags (for inline update)",
    ),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Update cluster configuration."""
    # Path 1: YAML-based update
    if file:
        logger.info("Updating cluster {} from file: {}", cluster_id, file)
        result = _run_sync(compute_client.update_with_yaml, cluster_id, file, retries=retries)
        typer.echo(result)
        return

    compute_def = build_compute_definition_inline(
        name=name,  # type: ignore[arg-type]
        runtime=runtime,  # type: ignore[arg-type]
        head_cores=head_cores,  # type: ignore[arg-type]
        head_memory=head_memory,  # type: ignore[arg-type]
        worker_cores=worker_cores,  # type: ignore[arg-type]
        worker_memory=worker_memory,  # type: ignore[arg-type]
        worker_min=worker_min,  # type: ignore[arg-type]
        worker_max=worker_max,  # type: ignore[arg-type]
        terminate_after=terminate_after,
        user=user,
        tags=tags,
    )

    logger.info("Updating cluster {} inline with new configuration", cluster_id)
    result = _run_sync(compute_client.update, cluster_id, compute_def, retries=retries)
    typer.echo(result)


@app.command()
def get(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID to get"),
    metadata: bool = typer.Option(
        False,
        "--metadata",
        help="Get cluster metadata (maps to get_info). If not set, detailed info is returned.",
    ),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Get cluster information."""
    # If metadata flag is set, return metadata; otherwise return detailed info.
    if metadata:
        logger.info("Getting cluster metadata for: {}", cluster_id)
        result = _run_sync(compute_client.get_info, cluster_id, retries=retries)
    else:
        logger.info("Getting cluster details for: {}", cluster_id)
        result = _run_sync(compute_client.get_details, cluster_id, retries=retries)
    typer.echo(result)


@app.command(name="list")
def list_clusters(
    query: Optional[str] = typer.Option(None, "--query", help="Search query"),
    page_size: int = typer.Option(50, "--page-size", help="Number of results per page"),
    offset: int = typer.Option(0, "--offset", help="Result offset"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """List all clusters."""
    logger.info("Listing clusters (query={}, page_size={}, offset={})", query, page_size, offset)
    result = _run_sync(compute_client.get_all, query or "", page_size, offset, retries=retries)
    typer.echo(result)


# Package management subcommands
packages_app = typer.Typer(help="Package management", no_args_is_help=True)
app.add_typer(packages_app, name="packages")


@packages_app.command("list")
def packages_list(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID"),
    key: str = typer.Option(
        "",
        "--key",
        help="Search key for filtering packages",
    ),
    sort_by: str = typer.Option(
        "created_at",
        "--sort-by",
        help="Sort by field",
    ),
    sort_order: str = typer.Option(
        "desc",
        "--sort-order",
        help="Sort order (asc/desc)",
    ),
    offset: int = typer.Option(
        0,
        "--offset",
        help="Offset for pagination",
    ),
    page_size: int = typer.Option(
        10,
        "--page-size",
        help="Number of items per page",
    ),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """List packages installed on a cluster."""
    logger.info(
        "Listing packages for cluster: {} (key={}, sort_by={}, sort_order={}, offset={}, page_size={})",
        cluster_id,
        key,
        sort_by,
        sort_order,
        offset,
        page_size,
    )
    result = _run_sync(
        compute_client.get_packages,
        cluster_id,
        key,
        sort_by,
        sort_order,
        offset,
        page_size,
        retries=retries,
    )
    typer.echo(result)


@packages_app.command("install")
def packages_install(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID"),
    source: str = typer.Option(..., "--source", help="Package source (pypi, maven, s3, workspace)"),
    name: Optional[str] = typer.Option(None, "--name", help="Package name (for pypi/maven)"),
    version: Optional[str] = typer.Option(None, "--version", help="Package version (for pypi/maven)"),
    path: Optional[str] = typer.Option(None, "--path", help="Package path (for s3/workspace, e.g., s3://bucket/lib.whl or /workspace/path)"),
    repository: Optional[str] = typer.Option(None, "--repository", help="Maven repository (maven or spark, for maven source only)"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Install a package on a cluster.
    
    Examples:
        # PyPI package
        darwin compute packages install --cluster-id <id> --source pypi --name tensorflow --version 2.19.0
        
        # Maven package
        darwin compute packages install --cluster-id <id> --source maven --name org.apache.commons:commons-csv --version 1.14.0 --repository maven
        
        # S3 package
        darwin compute packages install --cluster-id <id> --source s3 --path s3://bucket/packages/custom-lib.whl
        
        # Workspace package
        darwin compute packages install --cluster-id <id> --source workspace --path /workspace/project/dist/my-lib-1.0.0.whl
    """
    try:
        package_source = PackageSource(source)
    except ValueError as exc:
        raise typer.BadParameter(
            f"Invalid package source '{source}'. Valid values: {[s.value for s in PackageSource]}"
        ) from exc

    # Validate based on source type
    if package_source == PackageSource.PYPI:
        if not name or not version:
            raise typer.BadParameter(f"--name and --version are required for {source} source")
    elif package_source == PackageSource.MAVEN:
        if not name or not version:
            raise typer.BadParameter(f"--name and --version are required for {source} source")
        if not repository:
            raise typer.BadParameter(f"--repository is required for maven source (valid values: maven, spark)")
    elif package_source in [PackageSource.S3, PackageSource.WORKSPACE]:
        if not path:
            raise typer.BadParameter(f"--path is required for {source} source")

    # Build metadata for maven (pass string value to avoid enum serialization issues)
    metadata = None
    if package_source == PackageSource.MAVEN and repository:
        from compute_model.package import MvnMetadata, MvnRepository
        try:
            # Validate the repository value
            MvnRepository(repository)
            metadata = MvnMetadata(repository=repository)
        except ValueError:
            raise typer.BadParameter(f"Invalid repository '{repository}'. Valid values: maven, spark")

    logger.info(
        "Installing package from source {} on cluster: {} (name={}, version={}, path={})",
        source,
        cluster_id,
        name,
        version,
        path,
    )

    details = PackageDetails(name=name, version=version, path=path, metadata=metadata)
    package = Package(source=package_source.value, body=details)

    result = _run_sync(compute_client.install_package, cluster_id, package, retries=retries)
    typer.echo(result)


@packages_app.command("uninstall")
def packages_uninstall(
    cluster_id: str = typer.Option(..., "--cluster-id", help="Cluster ID"),
    package_ids: str = typer.Option(..., "--package-ids", help="Comma-separated package IDs"),
    retries: int = typer.Option(
        1,
        "--retries",
        help="Number of times to retry the SDK call on failure",
    ),
):
    """Uninstall packages from a cluster."""
    ids = str_to_list(package_ids)
    if not ids:
        raise typer.BadParameter("Please provide at least one package id in --package-ids.")

    logger.info("Uninstalling packages {} from cluster: {}", ids, cluster_id)
    result = _run_sync(compute_client.uninstall_packages, cluster_id, ids, retries=retries)
    typer.echo(result)

