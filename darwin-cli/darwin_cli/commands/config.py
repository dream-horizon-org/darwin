from typing import Optional

import typer
from darwin_cli.config.config import Config
from darwin_cli.config.constants import SUPPORTED_ENV
from loguru import logger

app = typer.Typer(help="CLI configuration management", no_args_is_help=True)


@app.command()
def set(
    env: str = typer.Option(
        "darwin-local",
        "--env",
        help="Environment to use for the CLI configuration (supported: darwin-local)",
    ),
):
    """Set configuration values (currently only environment).

    Currently supported environments:
    - darwin-local
    """
    # Validate against the current supported environments
    if env not in SUPPORTED_ENV:
        raise typer.BadParameter(
            f"Unsupported environment '{env}'. Supported environments: {', '.join(sorted(SUPPORTED_ENV))}"
        )

    cfg = Config()
    cfg.set_env(env)
    logger.info("Configuration environment set to '{}'", env)
    typer.echo(f"Environment set to '{env}'")


@app.command()
def get(
    env: Optional[str] = typer.Option(
        None,
        "--env",
        help="Environment whose configuration to get. Defaults to the current env if not provided.",
    ),
):
    """Get configuration from YAML.

    - `darwin config get` → config dict of the current env.
    - `darwin config get --env <env>` → config dict of the specified env.
    """
    cfg = Config()

    current_env = cfg.get_env

    try:
        if env is None:
            env_conf = cfg.get_env_config(current_env)
        else:
            env_conf = cfg.get_env_config(env)
    except ValueError as exc:
        raise typer.BadParameter(str(exc)) from exc

    typer.echo(env_conf)