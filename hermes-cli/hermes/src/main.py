import asyncio
import os
from typing import Optional, Dict
import typer
from hermes.src.cli.deployer_request_dtos import APIServeConfig, APIServeDeploymentConfig
from hermes.src.cli.hermes_deployer import HermesDeployer
from hermes.src.cli.hermes_exceptions import HermesException, HermesErrorCodes
from hermes.src.config.config import Config
from hermes.src.template_service.cookiecutter_context_validation import create_serve_repo_from_template
from hermes.src.utils.template_utils import read_file
from loguru import logger
ENV = os.getenv("ENV", "darwin-local")


def get_deployer(env: Optional[str] = None):
    if env is None:
        env = ENV
    config = Config(env=env)
    return HermesDeployer(config)


def get_deployment_config(env: str = "uat") -> dict:
    file: str = f".hermes/deployment_{env}.json"
    return read_file(file)


# Top-level serve app
app = typer.Typer(
    name="serve",
    help="Manages model serving and deployment.",
    no_args_is_help=True,
)

# Sub-apps
env_app = typer.Typer(help="Environment operations", no_args_is_help=True)
config_app = typer.Typer(help="Serve config operations", no_args_is_help=True)
artifact_app = typer.Typer(help="Artifact operations", no_args_is_help=True)
repo_app = typer.Typer(help="Serve repository templates", no_args_is_help=True)

app.add_typer(env_app, name="environment")
app.add_typer(config_app, name="config")
app.add_typer(artifact_app, name="artifact")
app.add_typer(repo_app, name="repo")


# ----------------------------
# Environment Operations
# ----------------------------

@env_app.command("create")
def env_create(
    name: str = typer.Option(..., "--name", help="Environment name (e.g., darwin-local)"),
    domain_suffix: str = typer.Option(".local", "--domain-suffix", help="Domain suffix"),
    cluster_name: str = typer.Option("kind", "--cluster-name", help="Kubernetes cluster name"),
    namespace: str = typer.Option("serve", "--namespace", help="Kubernetes namespace"),
    security_group: str = typer.Option("", "--security-group", help="AWS security group ID"),
    ft_redis_url: str = typer.Option("", "--ft-redis-url", help="Feature store Redis URL"),
    workflow_url: str = typer.Option("", "--workflow-url", help="Workflow service URL"),
    subnets: Optional[str] = typer.Option(None, "--subnets", help="AWS subnet IDs"),
):
    """Create environment."""
    try:
        asyncio.run(
            get_deployer(ENV).create_environment(
                name=name,
                domain_suffix=domain_suffix,
                cluster_name=cluster_name,
                namespace=namespace,
                ft_redis_url=ft_redis_url,
                workflow_url=workflow_url,
                security_group=security_group,
                subnets=subnets,
            )
        )
    except Exception as e:
        logger.error(f"Error: {e}")


@env_app.command("get")
def env_get(name: str = typer.Option(..., "--name", help="Environment name")):
    """Get environment details."""
    try:
        asyncio.run(get_deployer().get_environment(name))
    except Exception as e:
        logger.error(f"Error: {e}")


@env_app.command("update")
def env_update(
    name: str = typer.Option(..., "--name", help="Environment name"),
    domain_suffix: Optional[str] = typer.Option(None, "--domain-suffix", help="Domain suffix"),
    cluster_name: Optional[str] = typer.Option(None, "--cluster-name", help="Kubernetes cluster name"),
    namespace: Optional[str] = typer.Option(None, "--namespace", help="Kubernetes namespace"),
    security_group: Optional[str] = typer.Option(None, "--security-group", help="AWS security group ID"),
    subnets: Optional[str] = typer.Option(None, "--subnets", help="AWS subnet IDs"),
    ft_redis_url: Optional[str] = typer.Option(None, "--ft-redis-url", help="Feature store Redis URL"),
    workflow_url: Optional[str] = typer.Option(None, "--workflow-url", help="Workflow service URL"),
):
    """Update environment (partial update allowed)."""
    try:
        asyncio.run(
            get_deployer().update_environment(
                env_name=name,
                domain_suffix=domain_suffix,
                cluster_name=cluster_name,
                namespace=namespace,
                security_group=security_group,
                subnets=subnets,
                ft_redis_url=ft_redis_url,
                workflow_url=workflow_url,
            )
        )
    except Exception as e:
        logger.error(f"Error: {e}")


@env_app.command("delete")
def env_delete(name: str = typer.Option(..., "--name", help="Environment name")):
    """Delete environment (will fail if referenced)."""
    try:
        asyncio.run(get_deployer().delete_environment(name))
    except Exception as e:
        logger.error(f"Error: {e}")


# ----------------------------
# Serve Operations
# ----------------------------

@app.command("list")
def serve_list():
    """List serves."""
    try:
        asyncio.run(get_deployer().list_serves())
    except Exception as e:
        logger.error(f"Error: {e}")


@app.command("create")
def serve_create(
    name: str = typer.Option(..., "--name", help="Serve name (no underscores, max 16 chars)"),
    type: str = typer.Option(..., "--type", help="Serve type (api|workflow)"),
    space: str = typer.Option(..., "--space", help="Serve space"),
    description: str = typer.Option(..., "--description", help="Serve description"),
    file: Optional[str] = typer.Option(None, "--file", help="Serve config YAML/JSON"),
):
    """Create serve (name/type/space/description)."""
    try:
        if file:
            serve_config = read_file(file)
        else:
            serve_config = read_file(".hermes/serve_config.json")
        serve_name = name or serve_config.get("name")
        serve_type = type or serve_config.get("type")
        serve_space = space or serve_config.get("space")
        serve_description = description or serve_config.get("description")

        asyncio.run(get_deployer(ENV).create_serve(serve_name, serve_type, serve_space, serve_description))
    except Exception as e:
        logger.error(f"Error: {e}")


@app.command("get")
def serve_get(name: str = typer.Option(..., "--name", help="Serve name")):
    """Get serve overview."""
    try:
        asyncio.run(get_deployer().get_serve_overview(name))
    except Exception as e:
        logger.error(f"Error: {e}")


@app.command("status")
def serve_status(
    name: str = typer.Option(..., "--name", help="Serve name"),
    env: str = typer.Option(..., "--env", help="Environment"),
):
    """Get serve status for an environment."""
    try:
        asyncio.run(get_deployer().get_serve_status(name, env))
    except Exception as e:
        logger.error(f"Error: {e}")


@app.command("undeploy")
def serve_undeploy(
    name: str = typer.Option(..., "--name", help="Serve name"),
    env: str = typer.Option(..., "--env", help="Environment"),
):
    """Undeploy serve from environment."""
    try:
        asyncio.run(get_deployer().undeploy_serve(name, env))
    except Exception as e:
        logger.error(f"Error: {e}")


# ----------------------------
# Config Operations
# ----------------------------

@config_app.command("create")
def config_create(
    serve_name: str = typer.Option(..., "--serve-name", help="Serve name"),
    env: str = typer.Option(..., "--env", help="Environment"),
    backend_type: Optional[str] = typer.Option(None, "--backend-type", help="Backend type (fastapi). Required if file not given."),
    cores: Optional[int] = typer.Option(None, "--cores",help="Required if file not given."),
    memory: Optional[int] = typer.Option(None, "--memory",help="Required if file not given."),
    node_capacity: Optional[str] = typer.Option(None, "--node-capacity",help="Required if file not given."),
    min_replicas: Optional[int] = typer.Option(None, "--min-replicas",help="Required if file not given."),
    max_replicas: Optional[int] = typer.Option(None, "--max-replicas",help="Required if file not given."),
    file: Optional[str] = typer.Option(None, "--file", help="Infra config YAML/JSON. Required if other configs are not given."),
):
    """Create serve infrastructure config (API)."""
    try:
        if file:
            api_config = APIServeConfig.from_file(file)
        else:
            api_config = APIServeConfig(
                backend_type=backend_type,
                cores=cores,
                memory=memory,
                node_capacity_type=node_capacity,
                min_replicas=min_replicas,
                max_replicas=max_replicas,
            )

        asyncio.run(get_deployer().create_serve_config(serve_name, env, api_config))
    except Exception as e:
        logger.error(f"Error: {e}")


@config_app.command("get")
def config_get(
    serve_name: str = typer.Option(..., "--serve-name", help="Serve name"),
    env: str = typer.Option(..., "--env", help="Environment"),
):
    """Get serve config."""
    try:
        asyncio.run(get_deployer().get_serve_config(serve_name, env))
    except Exception as e:
        logger.error(f"Error: {e}")


@config_app.command("update")
def config_update(
    serve_name: str = typer.Option(..., "--serve-name", help="Serve name"),
    env: str = typer.Option(..., "--env", help="Environment"),
    backend_type: Optional[str] = typer.Option(None, "--backend-type",help="Backend type (fastapi). Required if file not given."),
    cores: Optional[int] = typer.Option(None, "--cores", help="Required if file not given."),
    memory: Optional[int] = typer.Option(None, "--memory", help="Required if file not given."),
    node_capacity: Optional[str] = typer.Option(None, "--node-capacity", help="Required if file not given."),
    min_replicas: Optional[int] = typer.Option(None, "--min-replicas", help="Required if file not given."),
    max_replicas: Optional[int] = typer.Option(None, "--max-replicas", help="Required if file not given."),
    file: Optional[str] = typer.Option(None, "--file",help="Infra config YAML/JSON. Required if other configs are not given."),
):
    """Update serve config (partial update allowed)."""
    try:
        if file:
            api_config = APIServeConfig.from_file(file)
        else:
            api_config = APIServeConfig(
                backend_type=backend_type,
                cores=cores,
                memory=memory,
                node_capacity_type=node_capacity,
                min_replicas=min_replicas,
                max_replicas=max_replicas,
            )

        asyncio.run(get_deployer().update_serve_config(serve_name, env, api_config))
    except Exception as e:
        logger.error(f"Error: {e}")


# ----------------------------
# Artifact Operations
# ----------------------------

@artifact_app.command("create")
def artifact_create(
    serve_name: str = typer.Option(..., "--serve-name", help="Serve name"),
    version: str = typer.Option(..., "--version", help="Artifact version"),
    github_repo_url: Optional[str] = typer.Option(None, "--github-repo-url", help="GitHub repo URL"),
    branch: Optional[str] = typer.Option(None, "--branch", help="Git branch"),
    file_path: Optional[str] = typer.Option(None, "--file-path", help="Workflow file path (for workflow serve)"),
):
    """Create artifact (Docker image)."""
    try:
        serve_version = version
        serve_github_repo_url = github_repo_url
        if serve_name is None or serve_github_repo_url is None:
            try:
                serve_config = read_file(".hermes/serve_config.json")
                serve_name = serve_name if serve_name else serve_config["name"]
                serve_github_repo_url = serve_github_repo_url if serve_github_repo_url else serve_config["github_repo_url"]
            except Exception:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name and github_repo_url are required or .hermes/serve_config.json missing.",
                )

        asyncio.run(get_deployer().create_artifact(serve_name, serve_version, serve_github_repo_url, branch, file_path))
    except Exception as e:
        logger.error(f"Error: {e}")


@artifact_app.command("list")
def artifact_list(serve_name: str = typer.Option(..., "--serve-name", help="Serve name")):
    """List artifacts for a serve."""
    try:
        asyncio.run(get_deployer().list_artifacts(serve_name))
    except Exception as e:
        logger.error(f"Error: {e}")


@artifact_app.command("jobs")
def artifact_jobs():
    """List artifact builder jobs."""
    try:
        asyncio.run(get_deployer().list_artifact_builder_jobs())
    except Exception as e:
        logger.error(f"Error: {e}")


@artifact_app.command("status")
def artifact_status(
    job_id: str = typer.Option(..., "--job-id", help="Artifact builder job ID"),
):
    """Get artifact build status."""
    try:
        asyncio.run(get_deployer(ENV).get_artifact_status(job_id))
    except Exception as e:
        logger.error(f"Error: {e}")


# ----------------------------
# Deployment Operations
# ----------------------------

@app.command("deploy")
def serve_deploy(
    serve_name: str = typer.Option(..., "--serve-name", help="Serve name"),
    file: str = typer.Option(..., "--file", help="Deployment request YAML/JSON"),
):
    """Deploy artifact to environment (expects a deployment request file)."""
    try:
        # Simple passthrough using deploy_artifact; file parsing left to deployer
        deployment_config = read_file(file)
        env = deployment_config.get("env")
        artifact_version = deployment_config.get("artifact_version")
        api_cfg = deployment_config.get("api_serve_deployment_config")
        workflow_cfg = deployment_config.get("workflow_serve_deployment_config")
        api_cfg_obj = APIServeDeploymentConfig(**api_cfg) if api_cfg else None
        asyncio.run(
            get_deployer().deploy_artifact(
                serve_name,
                env,
                artifact_version,
                api_cfg_obj.to_dict() if api_cfg_obj else None,
                workflow_cfg,
            )
        )
    except Exception as e:
        logger.error(f"Error: {e}")


@app.command("deploy-model")
def serve_deploy_model(
    serve_name: str = typer.Option(..., "--serve-name", help="Serve name (1-16 chars, no underscores)"),
    artifact_version: str = typer.Option(..., help="Version label for the one-click artifact"),
    model_uri: str = typer.Option(..., help="MLflow model URI (e.g., 's3://bucket/path/to/model')"),
    env: str = typer.Option(..., "--env", help="Environment"),
    storage_strategy: str = typer.Option(
        "auto",
        help="Storage strategy for model download: auto (default), emptydir, or pvc",
    ),
    cores: int = typer.Option(..., help="Number of CPU cores (e.g., 4)"),
    memory: int = typer.Option(..., help="Memory in GB (e.g., 8)"),
    node_capacity: str = typer.Option(..., help="Node capacity type (e.g., 'spot')"),
    min_replicas: int = typer.Option(..., help="Minimum number of replicas (e.g., 1)"),
    max_replicas: int = typer.Option(..., help="Maximum number of replicas (e.g., 1)"),
):
    """One-click model deploy (create serve + config + artifact + deploy)."""
    try:
        asyncio.run(
            get_deployer().deploy_model(
                env=env,
                serve_name=serve_name,
                artifact_version=artifact_version,
                model_uri=model_uri,
                storage_strategy=storage_strategy,
                cores=cores,
                memory=memory,
                node_capacity=node_capacity,
                min_replicas=min_replicas,
                max_replicas=max_replicas,
            )
        )
    except Exception as e:
        logger.error(f"Error: {e}")


@app.command("undeploy-model")
def serve_undeploy_model(
    serve_name: str = typer.Option(..., "--serve-name", help="Name of the serve to undeploy"),
    env: str = typer.Option(..., "--env", help="Environment"),
):
    """Undeploy one-click model."""
    try:
        asyncio.run(
            get_deployer(ENV).undeploy_model(
                serve_name=serve_name,
                env=env,
            )
        )
    except Exception as e:
        logger.error(f"Error: {e}")


# ----------------------------
# Repository Template
# ----------------------------

@repo_app.command("create")
def repo_create(
    template: str = typer.Option(
        "hermes/src/templates/fastapi_template/",
        "--template",
        "-t",
        help="Path to the template folder",
    ),
    file: Optional[str] = typer.Option(None, "--file", "-f", help="Path to YAML/JSON config. Create via interactive session if not given"),
    output_path: Optional[str] = typer.Option(None, "--output", "-o", help="Output path"),
):
    """Create serve repository from template (interactive or from config)."""
    try:
        create_serve_repo_from_template(template, file, output_path)
    except Exception as e:
        logger.error(f"Error: {e}")


def main():
    try:
        app()
    except HermesException as e:
        print(e.get_cli_error_message())
    except Exception as e:
        print(e)


if __name__ == "__main__":
    main()
