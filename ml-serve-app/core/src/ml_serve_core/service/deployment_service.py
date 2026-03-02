import os
import re
from typing import Optional, List

from fastapi import HTTPException
from tortoise.transactions import in_transaction

from ml_serve_app_layer.dtos.requests import DeploymentRequest, APIServeDeploymentConfigRequest, \
    WorkflowServeDeploymentConfigRequest, ModelDeploymentRequest, ModelUndeployRequest
from ml_serve_core.client.darwin_workflow_client import DarwinWorkflowClient
from ml_serve_core.client.dcm_client import DCMClient
from ml_serve_core.client.mlflow_client import MLflowClient
from ml_serve_core.constants.constants import (
    FASTAPI_SERVE_RESOURCE_NAME,
    FASTAPI_SERVE_CHART_VERSION,
    JOB_CLUSTER_RUNTIME,
    DEFAULT_RUNTIME,
)
from ml_serve_core.config.configs import Config
from ml_serve_core.dtos.dtos import EnvConfig
from ml_serve_core.service.serve_config_service import ServeConfigService
from ml_serve_core.utils.utils import get_host_name, get_service_url, get_service_url_for_one_click
from ml_serve_core.utils.yaml_utils import (
    generate_fastapi_values,
    generate_fastapi_infra_values,
    generate_fastapi_values_for_one_click_model_deployment,
    _normalize_deployment_strategy,
)
from ml_serve_core.utils.storage_strategy import determine_storage_strategy
from ml_serve_model import Serve, Artifact, Environment, APIServeInfraConfig, User, ScheduledWorkflowDeployment, \
    Deployment
from ml_serve_model.active_deployment import ActiveDeployment
from ml_serve_model.app_layer_deployments import AppLayerDeployment
from ml_serve_model.deployment import Deployment
from loguru import logger
from ml_serve_model.serve_configs import ServeConfig, WorkflowServeInfraConfig
from ml_serve_model.enums import BackendType, ServeType, DeploymentStatus
from datetime import datetime, timezone


class DeploymentService:

    def __init__(self):
        self.dcm_client = DCMClient()
        self.serve_config_service = ServeConfigService()
        self.config = Config()  # Centralized configuration
        self.workflow_client = DarwinWorkflowClient()
        self.mlflow_client = MLflowClient()

    @staticmethod
    def _sanitize_identifier(value: str) -> str:
        sanitized = re.sub(r"[^a-z0-9-]", "-", value.lower())
        sanitized = re.sub(r"-+", "-", sanitized).strip("-")
        return sanitized

    def _default_space(self, user: User) -> str:
        username = (user.username or "").replace("@", "-")
        sanitized = self._sanitize_identifier(username) if username else "one-click"
        return sanitized or "one-click"

    def _build_one_click_env_vars(self, model_uri: str, artifact_version: str) -> dict:
        env_vars = {
            "MLFLOW_MODEL_URI": model_uri,
            "MODEL_VERSION": artifact_version
        }
        if self.config.mlflow_tracking_uri:
            env_vars["MLFLOW_TRACKING_URI"] = self.config.mlflow_tracking_uri
        if self.config.mlflow_tracking_username:
            env_vars["MLFLOW_TRACKING_USERNAME"] = self.config.mlflow_tracking_username
        if self.config.mlflow_tracking_password:
            env_vars["MLFLOW_TRACKING_PASSWORD"] = self.config.mlflow_tracking_password
        return env_vars

    async def _update_active_deployment(self, serve: Serve, env: Environment, deployment: Deployment):
        active_deployment = await ActiveDeployment.get_or_none(serve=serve, environment=env)
        if not active_deployment:
            await ActiveDeployment.create(serve=serve, environment=env, deployment=deployment)
            return

        # Mark previous deployment as ENDED
        previous = await active_deployment.deployment
        previous.status = DeploymentStatus.ENDED.value
        previous.ended_at = datetime.now(timezone.utc)
        await previous.save()

        active_deployment.previous_deployment = previous
        active_deployment.deployment = deployment
        await active_deployment.save()

    async def get_deployment_by_serve_id(self, serve_id: int) -> Optional[list[Deployment]]:
        if not await Deployment.exists(serve_id=serve_id):
            return None

        return await Deployment.filter(serve_id=serve_id, status=DeploymentStatus.ACTIVE.value).order_by("-created_at")

    async def get_app_layer_deployment_by_id(self, deployment_id: int) -> Optional[AppLayerDeployment]:
        if not await AppLayerDeployment.exists(deployment_id=deployment_id):
            return None

        return await AppLayerDeployment.filter(deployment_id=deployment_id).first()

    async def get_workflow_deployment_by_id(self, deployment_id: int) -> Optional[ScheduledWorkflowDeployment]:
        if not await ScheduledWorkflowDeployment.exists(deployment_id=deployment_id):
            return None

        return await ScheduledWorkflowDeployment.filter(deployment_id=deployment_id).first()

    async def get_deployment_from_name_and_env_and_version(
            self, serve_name: str, env_name: str, artifact_version: str
    ) -> Optional[Deployment]:
        if not await Deployment.exists(
                serve__name=serve_name,
                environment__name=env_name,
                artifact__version=artifact_version
        ):
            return None

        deployment = await Deployment.filter(
            serve__name=serve_name,
            environment__name=env_name,
            artifact__version=artifact_version
        ).order_by("-created_at").first()

        return deployment

    async def deploy_artifact(
            self,
            serve: Serve,
            artifact: Artifact,
            serve_config: ServeConfig,
            env: Environment,
            deployment_request: DeploymentRequest,
            user: User
    ):
        """
        Deploy an artifact to a serve in the target environment.

        For API serves, reads deployment_strategy from the request (or previous
        deployment), resolves effective strategy based on env.enable_istio, and
        returns api_deployment_resp including fallback fields when canary was
        requested but Istio is not available.

        Args:
            serve: The serve to deploy to.
            artifact: The artifact (image) to deploy.
            serve_config: Serve configuration.
            env: Target environment.
            deployment_request: Deployment request with optional api_serve_deployment_config.
            user: User initiating the deployment.

        Returns:
            For API serves: dict with service_url and optionally deployment_strategy_*
            fallback fields. For workflow serves: None.
        """
        previous_active_deployment = await ActiveDeployment.get_or_none(serve=serve, environment=env)
        api_deployment_resp = None

        previous_deployment_obj = None
        if previous_active_deployment:
            previous_deployment_obj = await previous_active_deployment.deployment
            previous_artifact = await previous_deployment_obj.artifact
            previous_artifact_version = previous_artifact.version

        deployment = None
        if serve.type == ServeType.API.value:
            if previous_deployment_obj:
                api_deployment_obj = await self.get_app_layer_deployment_by_id(previous_deployment_obj.id)
                if deployment_request.api_serve_deployment_config is None:
                    deployment_request.api_serve_deployment_config = APIServeDeploymentConfigRequest(
                        environment_variables=api_deployment_obj.environment_variables,
                        deployment_strategy=api_deployment_obj.deployment_strategy,
                        deployment_strategy_config=api_deployment_obj.deployment_params
                    )
                elif (
                        deployment_request.api_serve_deployment_config.environment_variables is None
                        or deployment_request.api_serve_deployment_config.environment_variables == {}
                ):
                    deployment_request.api_serve_deployment_config.environment_variables = api_deployment_obj.environment_variables

            deployment, api_deployment_resp = await self.deploy_api_serve(
                serve,
                artifact,
                env,
                serve_config,
                deployment_request.api_serve_deployment_config,
                user
            )
        elif serve.type == ServeType.WORKFLOW.value:
            workflow_deployment_obj = await self.get_workflow_deployment_by_id(previous_deployment_obj.deployment_id)
            if (deployment_request.workflow_serve_deployment_config.input_parameters is None
                    or deployment_request.workflow_serve_deployment_config.input_parameters == {}):
                deployment_request.workflow_serve_deployment_config.input_parameters = workflow_deployment_obj.input_params
            deployment = await self.deploy_workflow_serve(
                serve,
                artifact,
                env,
                serve_config,
                deployment_request.workflow_serve_deployment_config,
                user
            )

        if not previous_active_deployment:
            await ActiveDeployment.create(serve=serve, environment=env, deployment=deployment)
        else:
            previous_active_deployment.previous_deployment = await previous_active_deployment.deployment
            previous_active_deployment.deployment = deployment
            await previous_active_deployment.save()

        return api_deployment_resp

    async def deploy_api_serve(
            self,
            serve: Serve,
            artifact: Artifact,
            env: Environment,
            api_serve_config: APIServeInfraConfig,
            api_deployment_config: APIServeDeploymentConfigRequest,
            user: User
    ):
        """
        Deploy an API serve (FastAPI or other backend) to the target environment.

        Stores deployment_strategy and deployment_strategy_config from the request
        in AppLayerDeployment for audit. Returns deployment and response dict from
        deploy_fastapi_serve (including fallback fields when applicable).

        Args:
            serve: The serve to deploy.
            artifact: The artifact (image) to deploy.
            env: Target environment.
            api_serve_config: API serve infrastructure config.
            api_deployment_config: Deployment config (strategy, config, env vars).
            user: User initiating the deployment.

        Returns:
            Tuple of (Deployment, response_dict). Response dict includes service_url
            and optionally deployment_strategy_requested, deployment_strategy_applied,
            fallback_reason when fallback occurred.
        """
        resp = None
        if api_serve_config.backend_type == BackendType.FastAPI.value:
            resp = await self.deploy_fastapi_serve(
                serve, artifact, env, api_deployment_config, api_serve_config, user
            )

        async with in_transaction():
            deployment = await Deployment.create(
                serve=serve,
                artifact=artifact,
                environment=env,
                created_by=user,
            )
            if api_deployment_config is None:
                deployment_strategy = None
                deployment_params = None
                environment_variables = None
            else:
                deployment_strategy = api_deployment_config.deployment_strategy
                deployment_params = api_deployment_config.deployment_strategy_config
                environment_variables = api_deployment_config.environment_variables

            api_deployment = await AppLayerDeployment.create(
                deployment=deployment,
                deployment_strategy=deployment_strategy,
                deployment_params=deployment_params,
                environment_variables=environment_variables
            )

        return deployment, resp

    def _resolve_deployment_strategy(
        self,
        requested_strategy: Optional[str],
        enable_istio: bool,
    ) -> tuple[str, Optional[str], Optional[str], Optional[str]]:
        """
        Resolve effective deployment strategy from request and environment capability.

        When canary is requested but Istio is not enabled for the environment,
        falls back to rolling and returns fallback metadata.

        Args:
            requested_strategy: Raw strategy from request (e.g. "rolling", "canary", None).
            enable_istio: Whether Istio is available in the target environment.

        Returns:
            Tuple of (effective_strategy, deployment_strategy_requested,
            deployment_strategy_applied, fallback_reason).
            - effective_strategy: Strategy to pass to values generation ("rolling" or "canary").
            - deployment_strategy_requested: Normalized requested value, or None if no fallback.
            - deployment_strategy_applied: Effective strategy, or None if no fallback.
            - fallback_reason: Reason string when fallback occurred, or None.
        """
        normalized = _normalize_deployment_strategy(requested_strategy)
        if normalized == "canary" and not enable_istio:
            return (
                "rolling",
                normalized,
                "rolling",
                "Istio not enabled for environment",
            )
        return (normalized, None, None, None)

    async def deploy_fastapi_serve(
            self,
            serve: Serve,
            artifact: Artifact,
            env: Environment,
            api_deployment_config: APIServeDeploymentConfigRequest,
            infra_config: APIServeInfraConfig,
            user: User
    ):
        """
        Deploy a FastAPI serve to the target environment via DCM.

        Reads deployment_strategy and deployment_strategy_config from the request,
        resolves effective strategy (canary vs rolling) based on env.enable_istio,
        and passes the effective strategy to Helm values generation. When canary
        is requested but Istio is not available, falls back to rolling and includes
        fallback metadata in the response.

        Args:
            serve: The serve to deploy.
            artifact: The artifact (image) to deploy.
            env: Target environment.
            api_deployment_config: Deployment config (strategy, config, env vars).
            infra_config: API serve infrastructure config.
            user: User initiating the deployment.

        Returns:
            Dict with service_url and, when fallback occurred,
            deployment_strategy_requested, deployment_strategy_applied, fallback_reason.
        """
        if api_deployment_config is None:
            environment_variables = None
            deployment_strategy = None
            deployment_strategy_config = None
        else:
            environment_variables = api_deployment_config.environment_variables
            deployment_strategy = api_deployment_config.deployment_strategy
            deployment_strategy_config = api_deployment_config.deployment_strategy_config

        env_config = EnvConfig(**env.env_configs)
        enable_istio = env_config.enable_istio or False

        effective_strategy, req_strategy, applied_strategy, fallback_reason = (
            self._resolve_deployment_strategy(deployment_strategy, enable_istio)
        )

        values_json = generate_fastapi_values(
            name=serve.name,
            env=env.name,
            runtime=artifact.image_url,
            env_config=env_config,
            user_email=user.username,
            serve_infra_config=infra_config,
            environment_variables=environment_variables,
            is_environment_protected=env.is_protected,
            deployment_strategy=effective_strategy,
            deployment_strategy_config=deployment_strategy_config,
            enable_istio=enable_istio,
        )

        build_resp = await self.dcm_client.build_resource(
            darwin_resource=FASTAPI_SERVE_RESOURCE_NAME,
            artifact_id=f"{env.name}-{serve.name}-{artifact.version}",
            values=values_json,
            version=FASTAPI_SERVE_CHART_VERSION
        )

        start_resp = await self.dcm_client.start_resource(
            resource_id=f"{env.name}-{serve.name}",
            artifact_id=f"{env.name}-{serve.name}-{artifact.version}",
            kube_cluster=env.cluster_name,
            namespace=env.namespace,
            darwin_resource=FASTAPI_SERVE_RESOURCE_NAME
        )

        result = {
            "service_url": get_service_url(serve.name, env.name, env_config, env.is_protected)
        }
        if fallback_reason is not None:
            result["deployment_strategy_requested"] = req_strategy
            result["deployment_strategy_applied"] = applied_strategy
            result["fallback_reason"] = fallback_reason
        return result

    async def deploy_workflow_serve(
            self,
            serve: Serve,
            artifact: Artifact,
            environment: Environment,
            workflow_serve_config: WorkflowServeInfraConfig,
            workflow_serve_deployment_config: WorkflowServeDeploymentConfigRequest,
            user: User
    ):
        workflow_id = await self.workflow_client.get_workflow_id_by_name(environment.workflow_url, serve.name)

        if not workflow_id:
            job_cluster_definition_id = await self.workflow_client.create_job_cluster_definition(
                environment.workflow_url,
                {
                    "cluster_name": f"cluster-definition-{serve.name}",
                    "tags": [],
                    "runtime": JOB_CLUSTER_RUNTIME,
                    "inactive_time": "60",
                    "head_node_config": workflow_serve_config.head_node_config_object,
                    "worker_node_configs": workflow_serve_config.worker_node_config_list,
                    "user": user.username,
                }
            )

            workflow_id = await self.workflow_client.create_workflow_serve(
                environment.workflow_url,
                {
                    "workflow_name": serve.name,
                    "description": serve.description,
                    "tags": [serve.space],
                    "schedule": workflow_serve_config.schedule,
                    "retries": 2,
                    "notify_on": "",
                    "max_concurrent_runs": 1,
                    "tasks": [
                        {
                            "task_name": f"{serve.name}-workflow-task",
                            "source": f"{artifact.github_repo_url}/tree/{artifact.branch}",
                            "source_type": "git",
                            "file_path": artifact.file_path,
                            "dynamic_artifact": False,
                            "cluster_id": job_cluster_definition_id,
                            "cluster_type": "job",
                            "dependent_libraries": "",
                            "input_parameters": workflow_serve_deployment_config.input_parameters,
                            "retries": 2,
                            "timeout": 3600,
                            "depends_on": []
                        }
                    ]
                }
            )
        else:
            workflow = await self.workflow_client.get_workflow_by_id(environment.workflow_url, workflow_id)

            job_cluster_definition = await self.workflow_client.get_job_cluster_definition(
                environment.workflow_url,
                workflow["tasks"][0]["cluster_id"]
            )

            job_cluster_definition['head_node_config'] = workflow_serve_config.head_node_config_object
            job_cluster_definition['worker_node_configs'] = workflow_serve_config.worker_node_config_list
            job_cluster_definition['user'] = user.username

            await self.workflow_client.update_job_cluster_definition(
                environment.workflow_url,
                job_cluster_definition['cluster_id'],
                job_cluster_definition
            )

            workflow["schedule"] = workflow_serve_config.schedule
            workflow["tasks"][0]["input_parameters"] = workflow_serve_deployment_config.input_parameters
            workflow["tasks"][0]["source"] = f"{artifact.github_repo_url}/tree/{artifact.branch}"
            workflow["tasks"][0]["file_path"] = artifact.file_path

            await self.workflow_client.update_workflow_serve(
                environment.workflow_url,
                workflow_id,
                workflow
            )

        async with in_transaction():
            deployment = await Deployment.create(
                serve=serve,
                artifact=artifact,
                environment=environment,
                created_by=user,
            )

            await ScheduledWorkflowDeployment.create(
                workflow_id=workflow_id,
                input_params=workflow_serve_deployment_config.input_parameters,
                deployment=deployment
            )

        return deployment

    async def redeploy_api_serve_with_updated_infra_config(
            self,
            serve: Serve,
            env: Environment,
            user: User,
            api_serve_config: APIServeInfraConfig
    ):
        """
        Update the APIServeConfig and redeploy the serve.

        Tries to update the existing artifact via DCM. If update fails (e.g. artifact
        missing), performs a full rebuild. When doing a full rebuild, preserves
        deployment_strategy and deployment_params from the stored AppLayerDeployment,
        resolving canary vs rolling based on env.enable_istio.

        Note: This will only work if the serve has been deployed before.
        If no active deployment exists, the infra config will be updated in the database
        but no redeployment will occur (user must do a fresh deployment).
        """
        active_deployment = await ActiveDeployment.get_or_none(serve=serve, environment=env)

        if not active_deployment:
            logger.info(
                f"No active deployment found for serve '{serve.name}' in environment '{env.name}'. Infra config updated."
            )
            return None

        current_deployment: Deployment = await active_deployment.deployment
        artifact: Artifact = await current_deployment.artifact

        values = generate_fastapi_infra_values(
            api_serve_config
        )

        try:
            # Try to update the existing artifact
            update_resp = await self.dcm_client.update_resource(
                artifact_id=f"{env.name}-{serve.name}-{artifact.version}",
                values=values,
                darwin_resource=FASTAPI_SERVE_RESOURCE_NAME
            )

            # If update succeeds, restart with updated config
            start_resp = await self.dcm_client.start_resource(
                resource_id=f"{env.name}-{serve.name}",
                artifact_id=f"{env.name}-{serve.name}-{artifact.version}",
                kube_cluster=env.cluster_name,
                namespace=env.namespace,
                darwin_resource=FASTAPI_SERVE_RESOURCE_NAME
            )

            logger.info(
                f"Successfully redeployed serve '{serve.name}' in environment '{env.name}' "
                f"with updated infra config"
            )

        except Exception as e:
            # If update fails (e.g., artifact file doesn't exist in DCM), do a full rebuild
            logger.warning(
                f"Failed to update existing artifact for serve '{serve.name}' in environment '{env.name}'. "
                f"Performing full rebuild. Error: {e}"
            )

            # Get existing deployment strategy and env vars from AppLayerDeployment
            app_layer_deployment = await AppLayerDeployment.get_or_none(deployment=current_deployment)
            env_config = EnvConfig(**env.env_configs)
            enable_istio = env_config.enable_istio or False

            stored_strategy = None
            stored_strategy_config = None
            if app_layer_deployment:
                stored_strategy = app_layer_deployment.deployment_strategy
                stored_strategy_config = app_layer_deployment.deployment_params

            effective_strategy, _, _, _ = self._resolve_deployment_strategy(
                stored_strategy, enable_istio
            )

            # Generate full values (not just infra), preserving deployment strategy
            full_values = generate_fastapi_values(
                name=serve.name,
                env=env.name,
                runtime=artifact.image_url,
                env_config=env_config,
                user_email=user.username,
                serve_infra_config=api_serve_config,
                environment_variables=None,  # Will use existing env vars from deployment
                is_environment_protected=env.is_protected,
                deployment_strategy=effective_strategy,
                deployment_strategy_config=stored_strategy_config,
                enable_istio=enable_istio,
            )

            if app_layer_deployment and app_layer_deployment.environment_variables:
                for key, val in app_layer_deployment.environment_variables.items():
                    full_values['envs'][str.upper(key)] = val

            # Rebuild the artifact from scratch
            build_resp = await self.dcm_client.build_resource(
                darwin_resource=FASTAPI_SERVE_RESOURCE_NAME,
                artifact_id=f"{env.name}-{serve.name}-{artifact.version}",
                values=full_values,
                version=FASTAPI_SERVE_CHART_VERSION
            )

            # Start with new artifact
            start_resp = await self.dcm_client.start_resource(
                resource_id=f"{env.name}-{serve.name}",
                artifact_id=f"{env.name}-{serve.name}-{artifact.version}",
                kube_cluster=env.cluster_name,
                namespace=env.namespace,
                darwin_resource=FASTAPI_SERVE_RESOURCE_NAME
            )

            logger.info(
                f"Successfully rebuilt and redeployed serve '{serve.name}' in environment '{env.name}' "
                f"with updated infra config"
            )

    async def redeploy_workflow_serve_with_updated_infra_config(
            self,
            serve: Serve,
            env: Environment,
            user: User,
            workflow_serve_config: WorkflowServeInfraConfig
    ):
        """
        Update the WorkflowServeConfig and redeploy the serve.
        """
        active_deployment = await ActiveDeployment.get_or_none(serve=serve, environment=env)

        if not active_deployment:
            return None

        workflow_id = await self.workflow_client.get_workflow_id_by_name(env.workflow_url, serve.name)

        if not workflow_id:
            logger.error(f"Workflow with name {serve.name} not found")
            raise Exception("Workflow not found")

        workflow = await self.workflow_client.get_workflow_by_id(env.workflow_url, workflow_id)

        job_cluster_definition = await self.workflow_client.get_job_cluster_definition(
            env.workflow_url,
            workflow["tasks"][0]["cluster_id"]
        )

        job_cluster_definition['head_node_config'] = workflow_serve_config.head_node_config_object
        job_cluster_definition['worker_node_configs'] = workflow_serve_config.worker_node_config_list
        job_cluster_definition['user'] = user.username

        workflow["schedule"] = workflow_serve_config.schedule

        await self.workflow_client.update_job_cluster_definition(
            env.workflow_url,
            job_cluster_definition['cluster_id'],
            job_cluster_definition
        )

        await self.workflow_client.update_workflow_serve(
            env.workflow_url,
            workflow_id,
            workflow
        )

    async def deploy_model(self, request: ModelDeploymentRequest, user: User):
        """
        One-click model deployment: deploy an MLflow model directly to a FastAPI serve.

        Resolves deployment strategy from request (optional deployment_strategy,
        deployment_strategy_config). When canary is requested but env.enable_istio
        is false, falls back to rolling and includes fallback fields in the response.
        Persists chosen strategy and params in AppLayerDeployment for audit.

        Args:
            request: ModelDeploymentRequest with model_uri, env, and optional strategy.
            user: User initiating the deployment.

        Returns:
            Dict with service_url and, when fallback occurred,
            deployment_strategy_requested, deployment_strategy_applied, fallback_reason.
        """
        # Validate model URI exists in MLflow before proceeding
        is_valid, error_msg = await self.mlflow_client.validate_model_uri(request.model_uri)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Invalid model URI",
                    "error": error_msg,
                    "hint": "Please verify the model exists in MLflow and the URI is correct."
                }
            )

        # Get environment from database
        env = await Environment.get_or_none(name=request.env)
        if not env:
            raise HTTPException(
                status_code=404,
                detail=f"Environment '{request.env}' not found. Please create it first."
            )

        env_config = EnvConfig(**env.env_configs)
        serve_name = request.serve_name  # serve_name is required

        serve = await Serve.get_or_none(name=serve_name)
        if serve and serve.type != ServeType.API.value:
            raise HTTPException(
                status_code=400,
                detail=f"Serve '{serve_name}' exists but is not of API type."
            )

        if not serve:
            serve = await Serve.create(
                name=serve_name,
                type=ServeType.API.value,
                description="Auto-generated serve for one-click deployments",
                space=self._default_space(user),
                created_by=user,
            )

        # Check if this version is already actively deployed
        active = await ActiveDeployment.get_or_none(serve=serve, environment=env)
        if active:
            active_deployment_obj = await active.deployment
            active_artifact = await active_deployment_obj.artifact
            if active_artifact.version == request.artifact_version:
                raise HTTPException(
                    status_code=400,
                    detail=f"Version '{request.artifact_version}' is already deployed for serve '{serve_name}'. "
                )

        artifact = await Artifact.get_or_none(serve=serve, version=request.artifact_version)
        if not artifact:
            artifact = await Artifact.create(
                serve=serve,
                version=request.artifact_version,
                github_repo_url=request.model_uri,
                image_url=DEFAULT_RUNTIME,
                created_by=user,
            )
        else:
            artifact.github_repo_url = request.model_uri
            artifact.image_url = DEFAULT_RUNTIME
            await artifact.save()

        fast_api_config = {
            "cores": request.cores,
            "memory": request.memory,
            "node_capacity_type": request.node_capacity,
            "min_replicas": request.min_replicas,
            "max_replicas": request.max_replicas,
        }

        api_infra_config = await APIServeInfraConfig.get_or_none(serve=serve, environment=env)
        if not api_infra_config:
            api_infra_config = await APIServeInfraConfig.create(
                serve=serve,
                environment=env,
                backend_type=BackendType.FastAPI.value,
                fast_api_config=fast_api_config,
                additional_hosts=None,
                created_by=user,
                updated_by=user,
            )
        else:
            api_infra_config.fast_api_config = fast_api_config
            api_infra_config.updated_by = user
            await api_infra_config.save()

        environment_variables = self._build_one_click_env_vars(request.model_uri, request.artifact_version)

        # Determine optimal storage strategy for model caching
        try:
            storage_strategy = await determine_storage_strategy(
                user_strategy=request.storage_strategy or "auto",
                model_uri=request.model_uri,
                mlflow_client=self.mlflow_client,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        # Resolve effective deployment strategy (canary + !env.enable_istio -> rolling fallback)
        enable_istio = env_config.enable_istio or False
        effective_strategy, req_strategy, applied_strategy, fallback_reason = (
            self._resolve_deployment_strategy(request.deployment_strategy, enable_istio)
        )

        values_json = generate_fastapi_values_for_one_click_model_deployment(
            name=serve.name,
            env=request.env,
            runtime=DEFAULT_RUNTIME,
            env_config=env_config,
            user_email=user.username,
            environment_variables=environment_variables,
            cores=request.cores,
            memory=request.memory,
            min_replicas=request.min_replicas,
            max_replicas=request.max_replicas,
            node_capacity_type=request.node_capacity,
            storage_strategy=storage_strategy,
            model_uri=request.model_uri,
            model_downloader_image=self.config.model_downloader_image,
            model_cache_pvc_name=self.config.model_cache_pvc_name,
            model_cache_path=self.config.model_cache_path,
            tracking_uri=self.config.mlflow_tracking_uri,
            tracking_username=self.config.mlflow_tracking_username,
            tracking_password=self.config.mlflow_tracking_password,
            deployment_strategy=effective_strategy,
            deployment_strategy_config=request.deployment_strategy_config,
            enable_istio=enable_istio,
        )

        artifact_identifier = f"{env.name}-{serve.name}-{artifact.version}"

        await self.dcm_client.build_resource(
            darwin_resource=FASTAPI_SERVE_RESOURCE_NAME,
            artifact_id=artifact_identifier,
            values=values_json,
            version=FASTAPI_SERVE_CHART_VERSION
        )

        await self.dcm_client.start_resource(
            resource_id=serve.name,
            artifact_id=artifact_identifier,
            kube_cluster=env_config.cluster_name,
            namespace=env_config.namespace,
            darwin_resource=FASTAPI_SERVE_RESOURCE_NAME
        )

        # Persist deployment strategy for audit (normalized requested value)
        stored_strategy = _normalize_deployment_strategy(request.deployment_strategy)
        stored_params = request.deployment_strategy_config

        async with in_transaction():
            deployment = await Deployment.create(
                serve=serve,
                artifact=artifact,
                environment=env,
                created_by=user,
            )
            await AppLayerDeployment.create(
                deployment=deployment,
                deployment_strategy=stored_strategy,
                deployment_params=stored_params,
                environment_variables=environment_variables
            )

        await self._update_active_deployment(serve, env, deployment)

        result = {
            "service_url": get_service_url_for_one_click(serve.name, env_config)
        }
        if fallback_reason is not None:
            result["deployment_strategy_requested"] = req_strategy
            result["deployment_strategy_applied"] = applied_strategy
            result["fallback_reason"] = fallback_reason
        return result

    async def undeploy_model(self, request: ModelUndeployRequest) -> dict:
        """
        Undeploy a one-click model deployment.

        This stops the running Kubernetes resource for a model that was deployed
        via the deploy_model (one-click deployment) API.

        Args:
            request: ModelUndeployRequest containing serve_name and env

        Returns:
            dict with status message

        Raises:
            HTTPException: If environment not found, serve not found, or no active deployment
        """
        
        # 1. Validate environment exists
        env = await Environment.get_or_none(name=request.env)
        if not env:
            raise HTTPException(
                status_code=404,
                detail=f"Environment '{request.env}' not found."
            )

        # 2. Validate serve exists in DB
        serve_name = request.serve_name
        serve = await Serve.get_or_none(name=serve_name)
        if not serve:
            raise HTTPException(
                status_code=404,
                detail=f"Serve '{serve_name}' not found."
            )

        # 3. Validate active deployment exists
        active = await ActiveDeployment.get_or_none(serve=serve, environment=env)
        if not active:
            raise HTTPException(
                status_code=404,
                detail=f"No active deployment found for serve '{serve_name}' in environment '{request.env}'."
            )

        env_config = EnvConfig(**env.env_configs)
        
        # For one-click deployments, resource_id is just the serve_name
        # (unlike regular serves which use {env.name}-{serve.name})
        resource_id = serve_name

        # 4. Stop the resource via DCM
        try:
            await self.dcm_client.stop_resource(
                resource_id=resource_id,
                kube_cluster=env_config.cluster_name,
                namespace=env_config.namespace,
            )
            logger.info(
                f"Successfully initiated undeploy for model serve '{serve_name}' in environment '{request.env}'")
        except Exception as e:
            logger.error(f"Failed to undeploy model serve '{serve_name}': {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to undeploy model: {str(e)}"
            )

        # 5. Update DB state - mark deployment ENDED and remove active pointer
        current_deployment = await active.deployment
        current_deployment.status = DeploymentStatus.ENDED.value
        current_deployment.ended_at = datetime.now(timezone.utc)
        await current_deployment.save()
        await active.delete()

        return {
            "message": f"Undeploy initiated for model serve '{serve_name}' in environment '{request.env}'",
            "serve_name": serve_name,
            "environment": request.env
        }
