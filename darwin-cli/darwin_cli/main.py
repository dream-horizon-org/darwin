import sys
import typer
from loguru import logger
from darwin_cli.commands import compute, config, workspace


app = typer.Typer(
    name="darwin-cli",
    help="Unified CLI for Darwin ML Platform",
    add_completion=True,
    no_args_is_help=True,
)

app.add_typer(compute.app, name="compute", help="Ray cluster management")
app.add_typer(config.app, name="config", help="CLI configuration")
app.add_typer(workspace.app, name="workspace", help="Workspace projects and codespaces")


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

