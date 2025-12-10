import asyncio
import typer
import os
from typing import Optional, Dict
from hermes.src.template_service.cookiecutter_context_validation import (
    create_serve_repo_from_template,
)
from hermes.src.cli.hermes_deployer import HermesDeployer
from hermes.src.config.config import Config
from hermes.src.cli.deployer_request_dtos import APIServeConfig, APIServeDeploymentConfig
from hermes.src.cli.hermes_exceptions import HermesException, HermesErrorCodes
from hermes.src.utils.template_utils import read_json_file


# Global environment variable check
ENV = os.getenv("ENV", "local")


def get_deployer(env: Optional[str] = None):
    if env is None:
        env = ENV
    config = Config(env=env)
    return HermesDeployer(config)


def get_deployment_config(env: str = "uat") -> dict:
    filename: str = f".hermes/deployment_{env}.json"
    return read_json_file(filename)


app = typer.Typer(
    name="hermes",
    help="CLI tool for generating projects from templates",
    no_args_is_help=True,
)


@app.command(name="create-environment")
def create_environment(
    name: str = typer.Option(..., help="Name of the environment (e.g. 'local'). Currently supported env: ['local']"),
    domain_suffix: str = typer.Option(".local", help="Domain suffix for the environment (e.g., '.local')"),
    cluster_name: str = typer.Option("kind", help="Kubernetes cluster name (must be 'kind')"),
    namespace: str = typer.Option("serve", help="Kubernetes namespace (must be 'serve')"),
    ft_redis_url: str = typer.Option("", help="Feature store Redis URL"),
    workflow_url: str = typer.Option("", help="Workflow service URL"),
    security_group: str = typer.Option("", help="AWS security group ID (optional)"),
    subnets: Optional[str] = typer.Option(None, help="AWS subnet IDs (optional)"),
):
    """CLI command to create a new environment."""
    try:
        os.environ["ENV"] = name
        ENV = name
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
        print(f"Error: {e.__str__()}")


@app.command(name="create-serve-repo")
def create_serve_repo(
    template: str = typer.Option(
        "hermes/src/templates/fastapi_template/",
        "--template",
        "-t",
        help="Path to the template folder",
    ),
    filename: Optional[str] = typer.Option(None, "--filename", "-f", help="Path to the YAML file"),
    output_path: Optional[str] = typer.Option(None, "--output", "-o", help="Output path for the generated project"),
):
    """
    Create a new project from a template using optional YAML configuration.
    """
    try:
        create_serve_repo_from_template(template, filename, output_path)
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="create-serve")
def create_serve(
    name: Optional[str] = typer.Option(None, help="Name of the serve"),
    type: Optional[str] = typer.Option(None, help='Type of the serve (Currently supported: ["api"])'),
    space: Optional[str] = typer.Option(None, help="Space for the serve, eg: Serve"),
    description: Optional[str] = typer.Option(None, help="Description of the serve"),
    filename: Optional[str] = typer.Option(None, help="Path to the YAML file for serve configuration"),
):
    """CLI command to create a new serve. All optional arguments need to be provided if Model repo isn't created via hermes CLI (Except filename)."""
    try:
        if filename:
            serve_config = read_json_file(filename)
        else:
            serve_config = read_json_file(".hermes/serve_config.json")
        serve_name = name
        serve_type = type
        serve_space = space
        serve_description = description
        if serve_config and len(serve_config) > 0:
            serve_name = name if name else serve_config["name"]
            serve_type = type if type else serve_config["type"]
            serve_space = space if space else serve_config["space"]
            serve_description = description if description else serve_config["description"]

        asyncio.run(get_deployer(ENV).create_serve(serve_name, serve_type, serve_space, serve_description))
    except Exception as e:
        print(f"Error: {e.__str__()}")


@app.command(name="create-serve-config")
def create_serve_config(
    serve_name: Optional[str] = typer.Option(None, help="Name of the serve"),
    api_config: Optional[APIServeConfig] = typer.Option(
        None, parser=APIServeConfig.api_serve_config, help="API serve configuration"
    ),
    filename: Optional[str] = typer.Option(None, help="Path to the YAML file for serve configuration"),
):
    """CLI command to create serve infrastructure configuration. All optional arguments need to be provided if Model repo isn't created via hermes CLI (Except filename)."""
    try:
        env = ENV
        serve_name = serve_name
        if serve_name is None:
            try:
                if filename:
                    serve_config = read_json_file(filename)
                else:
                    serve_config = read_json_file(".hermes/serve_config.json")
                serve_name = serve_config["name"]
            except Exception as e:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name is required fields and it not passed or .hermes/serve_config.json is not present.",
                )
        deployment_config = get_deployment_config(env)
        serve_api_config = api_config
        if deployment_config and len(deployment_config) > 0:
            serve_api_config = (
                api_config
                if api_config
                else APIServeConfig(**deployment_config["infrastructure_config"]["api_serve_config"])
            )

        asyncio.run(get_deployer(env).create_serve_config(serve_name, env, serve_api_config))
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="update-serve-config")
def update_serve_config(
    serve_name: Optional[str] = typer.Option(None, help="Name of the serve"),
    api_config: Optional[APIServeConfig] = typer.Option(
        None, parser=APIServeConfig.api_serve_config, help="API serve configuration"
    ),
):
    """CLI command to update serve infrastructure configuration."""
    try:
        env = ENV
        serve_name = serve_name
        if serve_name is None:
            try:
                serve_config = read_json_file(".hermes/serve_config.json")
                serve_name = serve_config["name"]
            except Exception as e:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name is required fields and it not passed or .hermes/serve_config.json is not present.",
                )
        deployment_config = get_deployment_config(env)
        serve_api_config = api_config
        if deployment_config and len(deployment_config) > 0:
            serve_api_config = (
                api_config
                if api_config
                else APIServeConfig(**deployment_config["infrastructure_config"]["api_serve_config"])
            )

        asyncio.run(get_deployer(env).update_serve_config(serve_name, env, serve_api_config))
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="create-artifact")
def create_artifact(
    serve_name: Optional[str] = typer.Option(None, help="Name of the serve"),
    version: str = typer.Option(..., help="Version of the artifact"),
    github_repo_url: Optional[str] = typer.Option(None, help="GitHub repository URL"),
    branch: Optional[str] = typer.Option(None, help="GitHub repository branch"),
):
    """CLI command to create a new artifact. All optional arguments need to be provided if Model repo isn't created via hermes CLI."""
    try:
        serve_version = version
        serve_github_repo_url = github_repo_url
        if serve_name is None or github_repo_url is None:
            try:
                serve_config = read_json_file(".hermes/serve_config.json")
                serve_name = serve_name if serve_name else serve_config["name"]
                serve_github_repo_url = github_repo_url if github_repo_url else serve_config["github_repo_url"]
            except Exception as e:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name and github_repo_url are required fields and it not passed or .hermes/serve_config.json is not present.",
                )

        asyncio.run(get_deployer().create_artifact(serve_name, serve_version, serve_github_repo_url, branch))
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="deploy-artifact")
def deploy_artifact(
    serve_name: Optional[str] = typer.Option(None, help="Name of the serve"),
    artifact_version: Optional[str] = typer.Option(..., help="Version of the artifact"),
    api_serve_deployment_config: Optional[APIServeDeploymentConfig] = typer.Option(
        None,
        parser=APIServeDeploymentConfig.api_serve_deployment_config,
        help="API deployment configuration",
    ),
):
    """CLI command to deploy an artifact."""
    try:
        env = ENV
        serve_name = serve_name
        if serve_name is None:
            try:
                serve_config = read_json_file(".hermes/serve_config.json")
                serve_name = serve_config["name"]
            except FileNotFoundError:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name is required fields and it not passed or .hermes/serve_config.json is not present.",
                )
        deployment_config = get_deployment_config(env)
        serve_artifact_version = artifact_version
        serve_api_config = api_serve_deployment_config
        if deployment_config and len(deployment_config) > 0:
            serve_artifact_version = (
                artifact_version if artifact_version else deployment_config["deployment_config"]["artifact_version"]
            )
            serve_api_config = (
                api_serve_deployment_config
                if api_serve_deployment_config
                else APIServeDeploymentConfig(**deployment_config["deployment_config"]["api_serve_deployment_config"])
            )
        api_config_dict: Optional[dict] = None

        if serve_api_config:
            api_config_dict = serve_api_config.to_dict()

        asyncio.run(
            get_deployer(env).deploy_artifact(
                serve_name,
                env,
                serve_artifact_version,
                api_config_dict,
            )
        )
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="deploy-model")
def deploy_model(
    serve_name: str = typer.Option(..., help="Name of the serve"),
    artifact_version: str = typer.Option(..., help="Version label for the one-click artifact"),
    model_uri: str = typer.Option(..., help="MLflow model URI (e.g., 's3://bucket/path/to/model')"),
    cores: int = typer.Option(..., help="Number of CPU cores (e.g., 4)"),
    memory: int = typer.Option(..., help="Memory in GB (e.g., 8)"),
    node_capacity: str = typer.Option(..., help="Node capacity type (e.g., 'spot')"),
    min_replicas: int = typer.Option(..., help="Minimum number of replicas (e.g., 1)"),
    max_replicas: int = typer.Option(..., help="Maximum number of replicas (e.g., 1)"),
):
    """CLI command for one-click deploy serve with model."""
    try:
        asyncio.run(
            get_deployer(ENV).deploy_model(
                env=ENV,
                serve_name=serve_name,
                artifact_version=artifact_version,
                model_uri=model_uri,
                cores=cores,
                memory=memory,
                node_capacity=node_capacity,
                min_replicas=min_replicas,
                max_replicas=max_replicas,
            )
        )
    except Exception as e:
        print(f"Error: {e.__str__()}")


@app.command(name="undeploy-model")
def undeploy_model(
    serve_name: str = typer.Option(..., help="Name of the serve to undeploy"),
    artifact_version: str = typer.Option(..., help="Version label for the one-click artifact"),
):
    """CLI command to undeploy a model serve."""
    try:
        asyncio.run(
            get_deployer(ENV).undeploy_model(
                serve_name=serve_name,
                artifact_version=artifact_version,
                env=ENV,
            )
        )
    except Exception as e:
        print(f"Error: {e.__str__()}")


@app.command(name="get-serve-status")
def get_serve_status(
    serve_name: Optional[str] = typer.Option(None, help="Name of the serve"),
):
    """CLI command to get serve deployment status."""
    try:
        env = ENV
        if serve_name is None:
            try:
                serve_config = read_json_file(".hermes/serve_config.json")
                serve_name = serve_config["name"]
            except FileNotFoundError:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name is required fields and it not passed or .hermes/serve_config.json is not present.",
                )
        asyncio.run(
            get_deployer(env).get_serve_status(
                serve_name,
                env,
            )
        )
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="get-artifact-status")
def get_artifact_status(
    job_id: str = typer.Option(..., help="Artifact builder job ID"),
):
    """CLI command to get artifact builder job status."""
    try:
        asyncio.run(get_deployer(ENV).get_artifact_status(job_id))
    except Exception as e:
        print(f"Error: {e}")


@app.command(name="configure")
def configure():
    """CLI command to configure the user token."""
    HermesDeployer.set_user_token()


def main():
    try:
        app()
    except HermesException as e:
        print(e.get_cli_error_message())
    except Exception as e:
        print(e)


if __name__ == "__main__":
    main()
