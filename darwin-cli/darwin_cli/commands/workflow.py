"""Workflow orchestration and management commands for darwin-cli."""

import json
import os
from typing import Optional

import typer
import yaml as pyyaml
from loguru import logger

from darwin_cli.utils.utils import _run_sync, build_job_cluster_definition
from darwin_workflow import client as workflow_client

app = typer.Typer(help="Workflow orchestration and management", no_args_is_help=True)

# Sub-apps
job_cluster_app = typer.Typer(help="Job cluster definition operations", no_args_is_help=True)
run_app = typer.Typer(help="Workflow run operations", no_args_is_help=True)

app.add_typer(job_cluster_app, name="job-cluster")
app.add_typer(run_app, name="run")


# =============================================================================
# Workflow Operations
# =============================================================================


@app.command("create")
def workflow_create(
    file: str = typer.Option(..., "--file", help="Path to the workflow YAML file"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Validate without creating"),
    created_by: Optional[str] = typer.Option(None, "--created-by", help="User email"),
    exit_on_failure: bool = typer.Option(False, "--exit-on-failure", help="Exit on first failure"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create workflow(s) from a YAML file.
    
    Example:
        darwin workflow create -f examples/workflow/workflow-config.yaml
    """
    if not os.path.exists(file):
        typer.echo(f"Error: File '{file}' not found.")
        raise typer.Exit(code=1)
    
    user = created_by or os.getenv("WORKFLOW_USER_EMAIL", "cli-user@darwin.local")
    
    logger.info("Creating workflow from file: {}", file)
    
    try:
        result = _run_sync(
            workflow_client.create_workflows_with_yaml,
            file,
            dry_run=dry_run,
            created_by=user,
            exit_on_failure=exit_on_failure,
            retries=retries,
        )
        if dry_run:
            typer.echo("Dry-run validation completed successfully.")
        else:
            typer.echo("Workflow creation initiated successfully.")
    except Exception as e:
        typer.echo(f"Error: {e}")
        raise typer.Exit(code=1)


@app.command("update")
def workflow_update(
    file: str = typer.Option(..., "--file", help="Path to the workflow YAML file"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Validate without updating"),
    created_by: Optional[str] = typer.Option(None, "--created-by", help="User email"),
    exit_on_failure: bool = typer.Option(False, "--exit-on-failure", help="Exit on first failure"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Update workflow(s) from a YAML file.
    
    Example:
        darwin workflow update -f examples/workflow/workflow-config.yaml
    """
    if not os.path.exists(file):
        typer.echo(f"Error: File '{file}' not found.")
        raise typer.Exit(code=1)
    
    user = created_by or os.getenv("WORKFLOW_USER_EMAIL", "cli-user@darwin.local")
    
    logger.info("Updating workflow from file: {}", file)
    
    try:
        result = _run_sync(
            workflow_client.update_workflows_with_yaml,
            file,
            dry_run=dry_run,
            created_by=user,
            exit_on_failure=exit_on_failure,
            retries=retries,
        )
        if dry_run:
            typer.echo("Dry-run validation completed successfully.")
        else:
            typer.echo("Workflow update initiated successfully.")
    except Exception as e:
        typer.echo(f"Error: {e}")
        raise typer.Exit(code=1)


@app.command("list")
def workflow_list(
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """List all workflows.
    
    Example:
        darwin workflow list
    """
    logger.info("Listing all workflows")
    result = _run_sync(workflow_client.list_workflows, retries=retries)
    typer.echo(result)


@app.command("get")
def workflow_get(
    workflow_id: Optional[str] = typer.Option(None, "--workflow-id", help="Workflow ID"),
    name: Optional[str] = typer.Option(None, "--name", help="Workflow name"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get workflow details by ID or name.
    
    Examples:
        darwin workflow get --workflow-id wf_id-abc123
        darwin workflow get --name my-workflow
    """
    if not workflow_id and not name:
        typer.echo("Error: Either --workflow-id or --name is required.")
        raise typer.Exit(code=1)
    
    if workflow_id:
        logger.info("Getting workflow details for ID: {}", workflow_id)
        result = _run_sync(workflow_client.get_workflow_details, workflow_id, retries=retries)
    else:
        logger.info("Getting workflow by name: {}", name)
        result = _run_sync(workflow_client.get_workflow_by_name, name, retries=retries)
    
    typer.echo(result)


@app.command("delete")
def workflow_delete(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    user: Optional[str] = typer.Option(None, "--user", help="User email"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Delete a workflow.
    
    Example:
        darwin workflow delete --workflow-id wf_id-abc123
    """
    user_email = user or os.getenv("WORKFLOW_USER_EMAIL", "cli-user@darwin.local")
    
    logger.info("Deleting workflow: {}", workflow_id)
    result = _run_sync(workflow_client.delete_workflow, workflow_id, user_email, retries=retries)
    typer.echo(result)


@app.command("trigger")
def workflow_trigger(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    params: Optional[str] = typer.Option(None, "--params", help="JSON parameters"),
    user: Optional[str] = typer.Option(None, "--user", help="User email"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Trigger a workflow run.
    
    Example:
        darwin workflow trigger --workflow-id wf_id-abc123 --params '{"key": "value"}'
    """
    user_email = user or os.getenv("WORKFLOW_USER_EMAIL", "cli-user@darwin.local")
    params_dict = json.loads(params) if params else {}
    
    logger.info("Triggering workflow: {}", workflow_id)
    result = _run_sync(
        workflow_client.trigger_workflow, workflow_id, params_dict, user_email, retries=retries
    )
    typer.echo(result)


@app.command("run-with-params")
def workflow_run_with_params(
    name: str = typer.Option(..., "--name", help="Workflow name"),
    params: Optional[str] = typer.Option(None, "--params", help="JSON parameters"),
    user: Optional[str] = typer.Option(None, "--user", help="User email"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Run a workflow by name with parameters.
    
    Example:
        darwin workflow run-with-params --name my-workflow --params '{"key": "value"}'
    """
    user_email = user or os.getenv("WORKFLOW_USER_EMAIL", "cli-user@darwin.local")
    params_dict = json.loads(params) if params else {}
    
    logger.info("Running workflow '{}' with params", name)
    result = _run_sync(
        workflow_client.run_with_params, name, params_dict, user_email, retries=retries
    )
    typer.echo(result)


@app.command("pause")
def workflow_pause(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Pause a workflow.
    
    Example:
        darwin workflow pause --workflow-id wf_id-abc123
    """
    logger.info("Pausing workflow: {}", workflow_id)
    result = _run_sync(workflow_client.pause_workflow, workflow_id, retries=retries)
    typer.echo(result)


@app.command("resume")
def workflow_resume(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Resume a paused workflow.
    
    Example:
        darwin workflow resume --workflow-id wf_id-abc123
    """
    logger.info("Resuming workflow: {}", workflow_id)
    result = _run_sync(workflow_client.resume_workflow, workflow_id, retries=retries)
    typer.echo(result)


# =============================================================================
# Workflow Run Operations
# =============================================================================


@run_app.command("list")
def run_list(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """List runs for a workflow.
    
    Example:
        darwin workflow run list --workflow-id wf_id-abc123
    """
    logger.info("Listing runs for workflow: {}", workflow_id)
    result = _run_sync(workflow_client.get_workflow_runs, workflow_id, retries=retries)
    typer.echo(result)


@run_app.command("get")
def run_get(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get details for a specific workflow run.
    
    Example:
        darwin workflow run get --workflow-id wf_id-abc123 --run-id run-xyz
    """
    logger.info("Getting run details: workflow={}, run={}", workflow_id, run_id)
    result = _run_sync(
        workflow_client.get_workflow_run_details, workflow_id, run_id, retries=retries
    )
    typer.echo(result)


@run_app.command("status")
def run_status(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    run_id: Optional[str] = typer.Option(None, "--run-id", help="Run ID (optional)"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get status of workflow run(s).
    
    Examples:
        darwin workflow run status --workflow-id wf_id-abc123
        darwin workflow run status --workflow-id wf_id-abc123 --run-id run-xyz
    """
    logger.info("Getting run status: workflow={}, run={}", workflow_id, run_id or "all")
    result = _run_sync(
        workflow_client.get_workflow_run_status, workflow_id, run_id or "", retries=retries
    )
    typer.echo(result)


@run_app.command("stop")
def run_stop(
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    workflow_name: Optional[str] = typer.Option(None, "--workflow-name", help="Workflow name"),
    workflow_id: Optional[str] = typer.Option(None, "--workflow-id", help="Workflow ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Stop a running workflow.
    
    Example:
        darwin workflow run stop --run-id run-xyz --workflow-id wf_id-abc123
    """
    logger.info("Stopping run: {}", run_id)
    result = _run_sync(
        workflow_client.stop_run,
        run_id,
        workflow_name or "",
        workflow_id or "",
        retries=retries,
    )
    typer.echo(result)


@run_app.command("task")
def run_task_details(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    task_id: str = typer.Option(..., "--task-id", help="Task ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get task details for a workflow run.
    
    Example:
        darwin workflow run task --workflow-id wf_id-abc123 --run-id run-xyz --task-id task-1
    """
    logger.info("Getting task details: workflow={}, run={}, task={}", workflow_id, run_id, task_id)
    result = _run_sync(
        workflow_client.get_workflow_task_details, workflow_id, run_id, task_id, retries=retries
    )
    typer.echo(result)


@run_app.command("repair")
def run_repair(
    workflow_id: str = typer.Option(..., "--workflow-id", help="Workflow ID"),
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    tasks: str = typer.Option(..., "--tasks", help="Comma-separated list of task names to retry"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Repair/retry failed tasks in a workflow run.
    
    Example:
        darwin workflow run repair --workflow-id wf_id-abc123 --run-id run-xyz --tasks task1,task2
    """
    task_list = [t.strip() for t in tasks.split(",")]
    
    logger.info("Repairing run: workflow={}, run={}, tasks={}", workflow_id, run_id, task_list)
    result = _run_sync(
        workflow_client.repair_workflow_run, workflow_id, run_id, task_list, retries=retries
    )
    typer.echo(result)


# =============================================================================
# Job Cluster Operations
# =============================================================================


@job_cluster_app.command("list")
def job_cluster_list(
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """List all job cluster definitions.
    
    Example:
        darwin workflow job-cluster list
    """
    logger.info("Listing job cluster definitions")
    result = _run_sync(workflow_client.list_job_cluster_definitions, retries=retries)
    typer.echo(result)


@job_cluster_app.command("get")
def job_cluster_get(
    job_cluster_id: str = typer.Option(..., "--job-cluster-id", help="Job cluster definition ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get job cluster definition details.
    
    Example:
        darwin workflow job-cluster get --job-cluster-id job-abc123
    """
    logger.info("Getting job cluster definition: {}", job_cluster_id)
    result = _run_sync(workflow_client.get_job_cluster_definition, job_cluster_id, retries=retries)
    typer.echo(result)


@job_cluster_app.command("create")
def job_cluster_create(
    file: str = typer.Option(..., "--file", help="Path to job cluster YAML file"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create a job cluster definition from YAML.
    
    Example:
        darwin workflow job-cluster create -f examples/workflow/job-cluster.yaml
    """
    if not os.path.exists(file):
        typer.echo(f"Error: File '{file}' not found.")
        raise typer.Exit(code=1)
    
    with open(file, "r") as f:
        config = pyyaml.safe_load(f)
    
    job_cluster_def = build_job_cluster_definition(config)
    
    logger.info("Creating job cluster definition: {}", config["cluster_name"])
    result = _run_sync(workflow_client.create_job_cluster_definition, job_cluster_def, retries=retries)
    typer.echo(result)


@job_cluster_app.command("update")
def job_cluster_update(
    job_cluster_id: str = typer.Option(..., "--job-cluster-id", help="Job cluster definition ID"),
    file: str = typer.Option(..., "--file", help="Path to job cluster YAML file"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Update a job cluster definition from YAML.
    
    Example:
        darwin workflow job-cluster update --job-cluster-id job-abc123 -f examples/workflow/job-cluster.yaml
    """
    if not os.path.exists(file):
        typer.echo(f"Error: File '{file}' not found.")
        raise typer.Exit(code=1)
    
    with open(file, "r") as f:
        config = pyyaml.safe_load(f)
    
    job_cluster_def = build_job_cluster_definition(config)
    
    logger.info("Updating job cluster definition: {}", job_cluster_id)
    result = _run_sync(
        workflow_client.update_job_cluster_definition, job_cluster_def, job_cluster_id, retries=retries
    )
    typer.echo(result)
