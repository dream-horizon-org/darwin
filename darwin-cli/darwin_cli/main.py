import sys
import typer
from loguru import logger
from darwin_cli.commands import compute, config


app = typer.Typer(
    name="darwin-cli",
    help="Unified CLI for Darwin ML Platform",
    add_completion=True,
    no_args_is_help=True,
)

app.add_typer(compute.app, name="compute", help="Ray cluster management")
app.add_typer(config.app, name="config", help="CLI configuration")


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

