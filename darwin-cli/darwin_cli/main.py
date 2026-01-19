import sys
import typer
from loguru import logger
from darwin_cli.commands import compute, config, workspace, serve, mlflow, feature_store, catalog, workflow


app = typer.Typer(
    name="darwin",
    help="Unified CLI for Darwin ML Platform",
    add_completion=True,
    no_args_is_help=True,
)

app.add_typer(compute.app, name="compute", help="Ray cluster management")
app.add_typer(config.app, name="config", help="CLI configuration")
app.add_typer(workspace.app, name="workspace", help="Workspace projects and codespaces")
app.add_typer(serve.app, name="serve", help="Serve (Hermes) commands")
app.add_typer(mlflow.app, name="mlflow", help="MLflow experiment tracking and model registry")
app.add_typer(feature_store.app, name="feature-store", help="Feature store operations")
app.add_typer(catalog.app, name="catalog", help="Data asset discovery and lineage")
app.add_typer(workflow.app, name="workflow", help="Workflow orchestration and management")


def main():
    """Main entry point for the CLI."""
    try:
        app()
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

