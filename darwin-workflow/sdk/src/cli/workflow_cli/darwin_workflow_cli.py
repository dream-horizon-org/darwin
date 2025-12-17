import os

import typer
from pydantic import ValidationError

from cli.workflow_cli.auth_utils import authenticate_with_github, logout_from_gh
from cli.workflow_cli.configuration import Configuration
from darwin_workflow.client import create_workflows_with_yaml, update_workflows_with_yaml

app = typer.Typer(help="Darwin Workflow CLI")

CONFIG_PATH: str = os.path.join(os.getenv("HOME"), ".darwin-workflow/config")


def _validate_and_load_config() -> "Configuration":
    """
    Validates the configuration file to ensure all required variables are present.
    Returns:
        Configuration: The validated configuration object.
    """
    try:
        return Configuration.load()
    except (FileNotFoundError, ValidationError) as e:
        typer.echo(f"Error: {e}")
        raise typer.Exit(code=1)


def _validate_file_exists(file: str) -> None:
    """
    Validate that the given file exists.
    Args:
        file (str): The path to the file to validate.
    Raises:
        typer.Exit: If the file does not exist.
    """
    if not os.path.exists(file):
        typer.echo(f"Error: File '{file}' not found.")
        raise typer.Exit(code=1)


@app.command()
def configure(reconfigure: bool = typer.Option(False, "--reconfigure", help="Reconfigure the existing setup")):
    """
    Stores the user email required for workflow creation in $HOME/.darwin-workflow/config.
    """
    if reconfigure:
        # Remove existing configuration if reconfiguring
        if os.path.exists(CONFIG_PATH):
            os.remove(CONFIG_PATH)
            typer.echo(f"Existing configuration removed.")
        else:
            typer.echo("No existing configuration found.")
        logout_from_gh()
    config_data = {}
    user_email = authenticate_with_github()
    config_data["user_email"] = user_email
    for field_name, field in Configuration.__fields__.items():
        # Check for custom 'user_input' metadata
        is_user_input = field.field_info.extra.get('user_input', False)
        if is_user_input:
            # Prompt the user for input if 'user_input' is True
            value = typer.prompt(f"Enter {field_name.replace('_', ' ').capitalize()}").strip()
            config_data[field_name] = value

    try:
        config = Configuration(**config_data)
        config.save()
        typer.echo(f"Configuration successful!")
    except ValidationError as e:
        typer.echo(f"Error in configuration see below for more details: {e}")
        raise typer.Exit(code=1)


@app.command()
def create(
    file: str = typer.Option(..., "-f", help="Path to the workflow YAML file"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Simulate the workflow creation without making changes")
):
    """
    Create a workflow using the provided YAML file.
    Args:
        file (str): The path to the workflow YAML file.
        dry_run (bool): If True, simulate the workflow creation without making changes.
    """
    config = _validate_and_load_config()
    _validate_file_exists(file)

    try:
        user_email = config.user_email
        result = create_workflows_with_yaml(file, created_by=user_email, dry_run=dry_run)
        typer.echo(result)
    except Exception as e:
        typer.echo(f"Error creating workflow: {e}")
        raise typer.Exit(code=1)


@app.command()
def update(
        file: str = typer.Option(..., "-f", help="Path to the workflow YAML file"),
        dry_run: bool = typer.Option(False, "--dry-run", help="Simulate the workflow update without making changes")
):
    """
    Update a workflow using the provided YAML file.
    Args:
        file (str): The path to the workflow YAML file.
        dry_run (bool): If True, simulate the workflow update without making changes.
    """
    config = _validate_and_load_config()
    _validate_file_exists(file)

    try:
        user_email = config.user_email
        result = update_workflows_with_yaml(file, created_by=user_email, dry_run=dry_run)
        typer.echo(result)
    except Exception as e:
        typer.echo(f"Error updating workflow: {e}")
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
