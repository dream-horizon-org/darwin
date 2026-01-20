"""Utility helpers for Darwin CLI."""

import asyncio
import os
import sys
from typing import Callable, Optional

import typer
from compute_model.compute_cluster import ComputeClusterDefinition
from compute_model.head_node import HeadNode
from compute_model.worker_group import WorkerGroup
from loguru import logger

from darwin_cli.config.config import Config
from darwin_cli.config.constants import ENV_VAR, SUPPORTED_ENV, LOCAL_ENV



def _run_sync(func: Callable, *args, retries: int = 1, **kwargs):
    """
    Run a blocking SDK call in a worker thread with simple retry logic.
    """
    last_exc = None
    func_name = getattr(func, "__name__", str(func))

    for attempt in range(1, retries + 1):
        try:
            # Run the blocking function in a separate thread via asyncio.
            return asyncio.run(asyncio.to_thread(func, *args, **kwargs))
        except Exception as exc:
            last_exc = exc
            if attempt >= retries:
                logger.error("All {} attempts failed for {}: {}", retries, func_name, exc)
                raise
            logger.warning(
                "Attempt {}/{} failed for {}: {}. Retrying...",
                attempt,
                retries,
                func_name,
                exc,
            )



def set_working_env() -> None:
    """Ensure process ENV is aligned with the CLI's selected environment.

    Rules:
    - For `darwin config set ...` we do NOT enforce env, so users can bootstrap.
    - For all other commands, env must be set AND supported, otherwise we fail fast
      with a clear error message.
    """

    # Set env only for commands except `darwin config set ...`
    argv = sys.argv[1:]

    if not argv:
        return

    # If last arg is help → show help command with local env
    if argv[-1] in ("--help", "-h"):
        os.environ[ENV_VAR] = LOCAL_ENV
        return

    # If command is: config set --env <val>
    if len(argv) == 4 and argv[0] == "config" and argv[1] == "set" and argv[2] == "--env":
        os.environ[ENV_VAR] = argv[3]
        return

    cfg = Config()
    env = cfg.get_env


    if env is None:
        # Hard fail for all commands except config set
        raise RuntimeError(
            "Environment is not set. Please configure it with 'darwin config set --env <env>'."
        )

    if env not in SUPPORTED_ENV:
        raise RuntimeError(
            f"Unsupported environment '{env}'. Supported environments: {', '.join(sorted(SUPPORTED_ENV))}. Please configure it with: 'darwin config set --env <env>'"
        )

    os.environ[ENV_VAR] = env
    logger.info("Using environment '{}' from CLI config", env)


def build_compute_definition_inline(
    *,
    name: str,
    runtime: str,
    head_cores: int,
    head_memory: int,
    worker_cores: int,
    worker_memory: int,
    worker_min: int,
    worker_max: int,
    terminate_after: Optional[int],
    user: Optional[str],
    tags: Optional[str],
) -> ComputeClusterDefinition:
    """
    Build ComputeClusterDefinition from inline CLI parameters.
    """

    # Path 2: Inline parameters (same shape as create)
    missing_params = [
        flag
        for flag, value in [
            ("--name", name),
            ("--runtime", runtime),
            ("--head-cores", head_cores),
            ("--head-memory", head_memory),
            ("--worker-cores", worker_cores),
            ("--worker-memory", worker_memory),
            ("--worker-min", worker_min),
            ("--worker-max", worker_max),
        ]
        if value is None
    ]
    if missing_params:
        raise typer.BadParameter(
            f"Missing required parameters when --file is not provided: {', '.join(missing_params)}"
        )

    head_node = HeadNode(node={"cores": head_cores, "memory": head_memory}, node_type=None)
    worker_group = WorkerGroup(
        node={"cores": worker_cores, "memory": worker_memory},
        min_pods=worker_min,
        max_pods=worker_max,
        node_type=None,
    )

    tags_list = [t.strip() for t in tags.split(",")] if tags else []

    return ComputeClusterDefinition(
        name=name,
        tags=tags_list,
        runtime=runtime,
        head_node=head_node,
        worker_group=[worker_group],
        terminate_after_minutes=terminate_after or 60,
        user=user or "sdk",
    )


def str_to_list(value: str) -> list[str]:
    """Convert a comma-separated string into a list of non-empty, trimmed values."""
    return [item.strip() for item in value.split(",") if item.strip()]


def to_dict(obj):
    """Convert object to dict if it has a to_dict method, otherwise return as-is."""
    return obj.to_dict() if hasattr(obj, 'to_dict') else obj


def load_yaml_file(file_path: str) -> dict:
    """Load and parse a YAML file."""
    import yaml
    try:
        with open(file_path, "r") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("File not found: {}", file_path)
        raise typer.Exit(1)
    except yaml.YAMLError as e:
        logger.error("Error parsing YAML file {}: {}", file_path, e)
        raise typer.Exit(1)


def build_job_cluster_definition(config: dict):
    """
    Build a CreateJobClusterDefinitionRequest from a config dictionary (parsed from YAML).
    """
    from workflow_model.job_cluster import (
        CreateJobClusterDefinitionRequest,
        HeadNodeConfig,
        WorkerNodeConfig,
        AdvanceConfig,
        AutoTerminationPolicy,
    )
    
    # Build head node config
    head_node = None
    if "head_node" in config:
        head_node = HeadNodeConfig(**config["head_node"])
    
    # Build worker node configs
    worker_configs = []
    for wg in config.get("worker_group", []):
        worker_configs.append(WorkerNodeConfig(**wg))
    
    # Build advance config
    advance_cfg = None
    if "advance_config" in config:
        advance_cfg = AdvanceConfig(**config["advance_config"])
    
    # Build auto termination policies
    auto_term = []
    for policy in config.get("auto_termination_policies", []):
        auto_term.append(AutoTerminationPolicy(**policy))
    
    # Build the job cluster definition request
    return CreateJobClusterDefinitionRequest(
        cluster_name=config["cluster_name"],
        runtime=config["runtime"],
        tags=config.get("tags", []),
        inactive_time=config.get("terminate_after_minutes", -1),
        auto_termination_policies=auto_term,
        head_node_config=head_node,
        worker_node_configs=worker_configs,
        advance_config=advance_cfg,
        user=config.get("user", "cli-user@darwin.local"),
    )
