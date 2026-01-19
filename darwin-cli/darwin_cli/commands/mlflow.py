"""MLflow CLI commands for experiment tracking and model registry."""

import typer
from typing import Optional
from loguru import logger

from darwin_cli.utils.utils import _run_sync


def get_mlflow_client():
    """Get the MLflow client instance from the SDK."""
    from darwin_mlflow.client import mlflow_client
    return mlflow_client


app = typer.Typer(
    name="mlflow",
    help="Manages experiment tracking and model registry.",
    no_args_is_help=True,
)

# Sub-apps
experiment_app = typer.Typer(help="Experiment operations", no_args_is_help=True)
run_app = typer.Typer(help="Run operations", no_args_is_help=True)
model_app = typer.Typer(help="Model registry operations", no_args_is_help=True)

app.add_typer(experiment_app, name="experiment")
app.add_typer(run_app, name="run")
app.add_typer(model_app, name="model")


# ----------------------------
# Experiment Operations
# ----------------------------

@experiment_app.command("create")
def experiment_create(
    name: str = typer.Option(..., "--name", help="Experiment name"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create a new experiment."""
    try:
        client = get_mlflow_client()
        experiment_id = _run_sync(client.create_experiment, name, retries=retries)
        logger.info("Created experiment '{}' with ID: {}", name, experiment_id)
        typer.echo(f"Experiment created with ID: {experiment_id}")
    except Exception as e:
        logger.error("Error creating experiment: {}", e)
        raise typer.Exit(1)


@experiment_app.command("get")
def experiment_get(
    experiment_id: str = typer.Option(..., "--experiment-id", help="Experiment ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get experiment details by ID."""
    try:
        client = get_mlflow_client()
        experiment = _run_sync(client.get_experiment, experiment_id, retries=retries)
        logger.info("Fetched experiment: {}", experiment)
        typer.echo(experiment)
    except Exception as e:
        logger.error("Error getting experiment: {}", e)
        raise typer.Exit(1)


@experiment_app.command("update")
def experiment_update(
    experiment_id: str = typer.Option(..., "--experiment-id", help="Experiment ID"),
    name: str = typer.Option(..., "--name", help="New experiment name"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Update experiment name."""
    try:
        client = get_mlflow_client()
        _run_sync(client.rename_experiment, experiment_id, name, retries=retries)
        logger.info("Updated experiment {} to name '{}'", experiment_id, name)
        typer.echo(f"Experiment {experiment_id} renamed to '{name}'")
    except Exception as e:
        logger.error("Error updating experiment: {}", e)
        raise typer.Exit(1)


@experiment_app.command("delete")
def experiment_delete(
    experiment_id: str = typer.Option(..., "--experiment-id", help="Experiment ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Delete an experiment."""
    try:
        client = get_mlflow_client()
        _run_sync(client.delete_experiment, experiment_id, retries=retries)
        logger.info("Deleted experiment: {}", experiment_id)
        typer.echo(f"Experiment {experiment_id} deleted")
    except Exception as e:
        logger.error("Error deleting experiment: {}", e)
        raise typer.Exit(1)


# ----------------------------
# Run Operations
# ----------------------------

@run_app.command("create")
def run_create(
    experiment_id: str = typer.Option(..., "--experiment-id", help="Experiment ID"),
    run_name: Optional[str] = typer.Option(None, "--run-name", help="Run name"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create a new run in an experiment."""
    try:
        client = get_mlflow_client()
        run = _run_sync(client.create_run, experiment_id, run_name=run_name, retries=retries)
        logger.info("Created run: {}", run.info.run_id)
        typer.echo(f"Run created with ID: {run.info.run_id}")
    except Exception as e:
        logger.error("Error creating run: {}", e)
        raise typer.Exit(1)


@run_app.command("get")
def run_get(
    experiment_id: str = typer.Option(..., "--experiment-id", help="Experiment ID"),
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get run details."""
    try:
        client = get_mlflow_client()
        run = _run_sync(client.get_run, run_id, retries=retries)
        logger.info("Fetched run: {}", run)
        typer.echo(run)
    except Exception as e:
        logger.error("Error getting run: {}", e)
        raise typer.Exit(1)


@run_app.command("log")
def run_log(
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    metric_key: Optional[str] = typer.Option(None, "--metric-key", help="Metric key"),
    metric_value: Optional[float] = typer.Option(None, "--metric-value", help="Metric value"),
    param_key: Optional[str] = typer.Option(None, "--param-key", help="Parameter key"),
    param_value: Optional[str] = typer.Option(None, "--param-value", help="Parameter value (max 6000 bytes)"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Log metric or param to a run."""
    try:
        client = get_mlflow_client()

        if metric_key is not None and metric_value is not None:
            _run_sync(client.log_metric, run_id, metric_key, metric_value, retries=retries)
            logger.info("Logged metric {}={} to run {}", metric_key, metric_value, run_id)
            typer.echo(f"Logged metric {metric_key}={metric_value}")
        elif param_key is not None and param_value is not None:
            _run_sync(client.log_param, run_id, param_key, param_value, retries=retries)
            logger.info("Logged param {}={} to run {}", param_key, param_value, run_id)
            typer.echo(f"Logged param {param_key}={param_value}")
        else:
            typer.echo("Error: Provide either --metric-key/--metric-value or --param-key/--param-value")
            raise typer.Exit(1)
    except Exception as e:
        logger.error("Error logging to run: {}", e)
        raise typer.Exit(1)


@run_app.command("delete")
def run_delete(
    experiment_id: str = typer.Option(..., "--experiment-id", help="Experiment ID"),
    run_id: str = typer.Option(..., "--run-id", help="Run ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Delete a run."""
    try:
        client = get_mlflow_client()
        _run_sync(client.delete_run, run_id, retries=retries)
        logger.info("Deleted run: {}", run_id)
        typer.echo(f"Run {run_id} deleted")
    except Exception as e:
        logger.error("Error deleting run: {}", e)
        raise typer.Exit(1)


# ----------------------------
# Model Registry Operations
# ----------------------------

@model_app.command("list")
def model_list(
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """List all registered models."""
    try:
        client = get_mlflow_client()
        models = _run_sync(client.search_registered_models, retries=retries)
        logger.info("Listed {} registered models", len(models))
        for model in models:
            typer.echo(f"- {model.name}")
    except Exception as e:
        logger.error("Error listing models: {}", e)
        raise typer.Exit(1)


@model_app.command("search")
def model_search(
    query: str = typer.Option(..., "--query", help="Search query (e.g., 'house')"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Search registered models by name."""
    try:
        client = get_mlflow_client()
        filter_string = f"name LIKE '%{query}%'"
        models = _run_sync(client.search_registered_models, filter_string=filter_string, retries=retries)
        logger.info("Found {} models matching '{}'", len(models), query)
        for model in models:
            typer.echo(f"- {model.name}")
    except Exception as e:
        logger.error("Error searching models: {}", e)
        raise typer.Exit(1)


@model_app.command("get")
def model_get(
    name: str = typer.Option(..., "--name", help="Model name"),
    version: Optional[int] = typer.Option(None, "--version", help="Model version (optional)"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get model details or specific version."""
    try:
        client = get_mlflow_client()

        if version is not None:
            model_version = _run_sync(client.get_model_version, name, str(version), retries=retries)
            logger.info("Fetched model version: {}", model_version)
            typer.echo(model_version)
        else:
            model = _run_sync(client.get_registered_model, name, retries=retries)
            logger.info("Fetched model: {}", model)
            typer.echo(model)
    except Exception as e:
        logger.error("Error getting model: {}", e)
        raise typer.Exit(1)
