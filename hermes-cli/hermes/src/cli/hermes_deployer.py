from typing import Dict, List, Optional, Any
from hermes.src.cli.deployer_request_dtos import (
    APIServeConfig,
    WorkflowServeConfig,
    CreateEnvironmentRequest,
    EnvironmentConfig,
    DeployModelRequest,
    UndeployModelRequest,
)
from hermes.src.utils.api_caller_utils import call_api_endpoint_async
from hermes.src.config.config import Config
from hermes.src.cli.hermes_exceptions import (
    HermesException,
    HermesErrorCodes,
    handle_hermes_exception,
)
from hermes.src.cli.utils import print_hermes_response
from hermes.src.config.constants import CREDENTIALS_FILE_PATH
import os


class HermesDeployer:
    def __init__(self, config: Config):
        try:
            self.hermes_deployer_url = config.get_hermes_deployer_url
            self.headers = {
                "Authorization": f"Bearer {config.get_user_token}",
                "Content-Type": "application/json",
            }
        except Exception as e:
            raise HermesException(
                HermesErrorCodes.CONFIG_ERROR.value.code,
                f"Failed to initialize HermesDeployer: {str(e)}",
            )

    @staticmethod
    def _validate_str_length(value: Any, field_name: str, min_len: int = 1, max_len: int = 50) -> str:
        """
        Ensure a string field respects length constraints and trim surrounding whitespace.
        """
        if not isinstance(value, str):
            raise HermesException(
                HermesErrorCodes.INVALID_FIELD.value.code,
                f"{field_name} must be a string.",
            )

        value = value.strip()

        if len(value) < min_len or len(value) > max_len:
            raise HermesException(
                HermesErrorCodes.INVALID_FIELD.value.code,
                f"{field_name} must be between {min_len} and {max_len} characters.",
            )

        return value

    async def create_serve(self, name: str, serve_type: str, space: str, description: Optional[str] = None) -> Dict:
        """Create a new serve"""

        if "_" in name:
            raise HermesException(
                HermesErrorCodes.INVALID_FIELD.value.code,
                "Serve name cannot contain underscores",
            )
        try:
            if not name or not serve_type or not space:
                missing_fields = []
                if not name:
                    missing_fields.append("name")
                if not serve_type:
                    missing_fields.append("type")
                if not space:
                    missing_fields.append("space")
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    f"Missing required fields: {', '.join(missing_fields)}",
                )

            payload = {
                "name": name,
                "type": serve_type,
                "space": space,
                "description": description,
            }
            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print_hermes_response(response)
                return response

            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise e

    async def create_environment(
        self,
        name: str,
        domain_suffix: str,
        cluster_name: str,
        namespace: str,
        ft_redis_url: str,
        workflow_url: str,
        security_group: Optional[str] = None,
        subnets: Optional[str] = None,
    ) -> Dict:
        """Create a new environment"""
        try:
            if not name:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "Environment name is required",
                )

            # Validate required fields (allow empty strings for optional fields)
            required_fields = {
                "domain_suffix": domain_suffix,
                "cluster_name": cluster_name,
                "namespace": namespace,
            }

            missing_fields = [field for field, value in required_fields.items() if not value]
            if missing_fields:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    f"Missing required fields: {', '.join(missing_fields)}",
                )

            # Use empty string as "random value" for optional fields if not provided
            ft_redis_url = ft_redis_url or "redis://localhost:6379"
            workflow_url = workflow_url or "http://workflow-service:8080"

            # Namespace must be exactly "serve"
            if namespace != "serve":
                raise HermesException(
                    HermesErrorCodes.INVALID_FIELD.value.code,
                    f"Namespace must be 'serve', got '{namespace}'",
                )

            # Create environment config
            env_config = EnvironmentConfig(
                domain_suffix=domain_suffix,
                cluster_name=cluster_name,
                namespace=namespace,
                ft_redis_url=ft_redis_url,
                workflow_url=workflow_url,
                security_group=security_group,
                subnets=subnets,
            )

            request = CreateEnvironmentRequest(name=name, environment_configs=env_config)
            payload = request.to_dict()

            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/environment",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print(response)

            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise e

    async def deploy_model(
        self,
        env: str,
        serve_name: str,
        artifact_version: str,
        model_uri: str,
        cores: int,
        memory: int,
        node_capacity: str,
        min_replicas: int,
        max_replicas: int,
    ) -> Dict:
        """One-click deploy serve with model"""
        try:
            # Validate all required fields
            required_fields = {
                "env": env,
                "serve_name": serve_name,
                "artifact_version": artifact_version,
                "model_uri": model_uri,
                "cores": cores,
                "memory": memory,
                "node_capacity": node_capacity,
                "min_replicas": min_replicas,
                "max_replicas": max_replicas,
            }

            missing_fields = [field for field, value in required_fields.items() if value is None]
            if missing_fields:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    f"Missing required fields: {', '.join(missing_fields)}",
                )

            serve_name = self._validate_str_length(serve_name, "serve_name")
            artifact_version = self._validate_str_length(artifact_version, "artifact_version")

            # Create request payload
            request = DeployModelRequest(
                env=env,
                serve_name=serve_name,
                artifact_version=artifact_version,
                model_uri=model_uri,
                cores=cores,
                memory=memory,
                node_capacity=node_capacity,
                min_replicas=min_replicas,
                max_replicas=max_replicas,
            )
            payload = request.to_dict()

            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/deploy-model",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print(response)
                return response

            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise e

    async def undeploy_model(
        self,
        serve_name: str,
        artifact_version: str,
        env: str,
    ) -> Dict:
        """Undeploy a model serve"""
        try:
            # Validate all required fields
            if not serve_name:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name is a required field",
                )
            if not artifact_version:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "artifact_version is a required field",
                )
            if not env:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "env is a required field",
                )

            serve_name = self._validate_str_length(serve_name, "serve_name")
            artifact_version = self._validate_str_length(artifact_version, "artifact_version")

            # Create request payload
            request = UndeployModelRequest(
                serve_name=serve_name,
                artifact_version=artifact_version,
                env=env,
            )
            payload = request.to_dict()

            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/undeploy-model",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print(response)
                return response

            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise e

    async def create_serve_config(
        self,
        serve_name: str,
        env: str,
        api_config: Optional[APIServeConfig] = None,
        workflow_config: Optional[WorkflowServeConfig] = None,
    ) -> Dict:
        """Create serve infrastructure configuration"""
        try:
            if not serve_name or not env:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name and env are required fields",
                )

            if not api_config and not workflow_config:
                raise HermesException(
                    HermesErrorCodes.INVALID_REQUEST.value.code,
                    "Either api_config or workflow_config must be provided",
                )

            payload = {}

            if api_config:
                payload["api_serve_config"] = {
                    "backend_type": api_config.backend_type,
                    "additional_hosts": api_config.additional_hosts,
                    "fast_api_config": {
                        "cores": api_config.cores,
                        "memory": api_config.memory,
                        "node_capacity_type": api_config.node_capacity_type,
                        "min_replicas": api_config.min_replicas,
                        "max_replicas": api_config.max_replicas,
                    },
                }

            if workflow_config:
                payload["workflow_serve_config"] = {
                    "schedule": workflow_config.schedule,
                    "head_node_config": {
                        "cores": workflow_config.head_node_config.cores,
                        "memory": workflow_config.head_node_config.memory,
                        "node_capacity_type": workflow_config.head_node_config.node_capacity_type,
                    },
                    "worker_node_config": [
                        {
                            "cores_per_pods": worker.cores_per_pods,
                            "memory_per_pods": worker.memory_per_pods,
                            "min_pods": worker.min_pods,
                            "max_pods": worker.max_pods,
                            "node_capacity_type": worker.node_capacity_type,
                        }
                        for worker in workflow_config.worker_node_config
                    ],
                }
            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/{serve_name}/infra-config/{env}",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print_hermes_response(response)
                return response
            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to create serve config: {str(e)}")

    async def update_serve_config(
        self,
        serve_name: str,
        env: str,
        api_config: Optional[APIServeConfig] = None,
        workflow_config: Optional[WorkflowServeConfig] = None,
    ) -> Dict:
        """Update serve infrastructure configuration"""
        try:
            if not serve_name or not env:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name and env are required fields",
                )

            if not api_config and not workflow_config:
                raise HermesException(
                    HermesErrorCodes.INVALID_REQUEST.value.code,
                    "Either api_config or workflow_config must be provided",
                )

            payload = {}

            if api_config:
                payload["api_serve_config"] = {
                    "additional_hosts": api_config.additional_hosts,
                    "fast_api_config": {
                        "cores": api_config.cores,
                        "memory": api_config.memory,
                        "node_capacity_type": api_config.node_capacity_type,
                        "min_replicas": api_config.min_replicas,
                        "max_replicas": api_config.max_replicas,
                    },
                }

            if workflow_config:
                payload["workflow_serve_config"] = {
                    "schedule": workflow_config.schedule,
                    "head_node_config": {
                        "cores": workflow_config.head_node_config.cores,
                        "memory": workflow_config.head_node_config.memory,
                        "node_capacity_type": workflow_config.head_node_config.node_capacity_type,
                    },
                    "worker_node_config": [
                        {
                            "cores_per_pods": worker.cores_per_pods,
                            "memory_per_pods": worker.memory_per_pods,
                            "min_pods": worker.min_pods,
                            "max_pods": worker.max_pods,
                            "node_capacity_type": worker.node_capacity_type,
                        }
                        for worker in workflow_config.worker_node_config
                    ],
                }
            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/{serve_name}/infra-config/{env}",
                    method="PATCH",
                    headers=self.headers,
                    json_data=payload,
                )
                print_hermes_response(response)
                return response

            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to update serve config: {str(e)}")

    async def create_artifact(
        self,
        serve_name: str,
        version: str,
        github_repo_url: Optional[str] = None,
        branch: Optional[str] = None,
        file_path: Optional[str] = None,
    ) -> Dict:
        """Create a new artifact"""
        try:
            if not serve_name or not version:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name and version are required fields",
                )

            payload = {"serve_name": serve_name, "version": version}

            if github_repo_url:
                payload["github_repo_url"] = github_repo_url
            if branch:
                payload["branch"] = branch
            if file_path:
                payload["file_path"] = file_path
            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/artifact",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print_hermes_response(response)
                return response
            except Exception as e:
                handle_hermes_exception(e)

        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to create artifact: {str(e)}")

    async def deploy_artifact(
        self,
        serve_name: str,
        env: str,
        artifact_version: str,
        api_config: Optional[Dict] = None,
        workflow_config: Optional[Dict] = None,
    ) -> Dict:
        """Deploy an artifact"""
        try:
            if not serve_name or not env or not artifact_version:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name, env and artifact_version are required fields",
                )

            payload = {"env": env, "artifact_version": artifact_version}

            if api_config:
                payload["api_serve_deployment_config"] = api_config
            if workflow_config:
                payload["workflow_serve_deployment_config"] = workflow_config

            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/{serve_name}/deploy",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print_hermes_response(response)
                return response
            except Exception as e:
                handle_hermes_exception(e)
        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to deploy artifact: {str(e)}")

    async def update_scaling_config(
        self,
        serve_name: str,
        scaling_strategy: str,
        scaling_factor: float,
        scaling_ladder: Optional[Dict] = None,
    ) -> Dict:
        """Update scaling configuration for production deployment"""
        try:
            if not serve_name or not scaling_strategy or not scaling_factor:
                raise HermesException(
                    HermesErrorCodes.MISSING_FIELD.value.code,
                    "serve_name, scaling_strategy and scaling_factor are required fields",
                )

            payload = {
                "scaling_strategy": scaling_strategy,
                "scaling_factor": scaling_factor,
            }
            if scaling_ladder:
                payload["scaling_ladder"] = scaling_ladder
            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/{serve_name}/scaling-config",
                    method="POST",
                    headers=self.headers,
                    json_data=payload,
                )
                print_hermes_response(response)
                return response
            except Exception as e:
                handle_hermes_exception(e)
        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to update scaling config: {str(e)}")

    async def get_artifact_status(self, job_id: str) -> Dict:
        """Get artifact builder job status"""
        try:
            if not job_id:
                raise HermesException(HermesErrorCodes.MISSING_FIELD.value.code, "job_id is a required field")

            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/artifact_builder_job/{job_id}/status",
                    method="GET",
                    headers=self.headers,
                )
                print_hermes_response(response)
                return response
            except Exception as e:
                handle_hermes_exception(e)
        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to get artifact status: {str(e)}")

    async def get_serve_status(self, serve_name: str, env: str) -> Dict:
        """Get serve status"""
        try:
            if not serve_name:
                raise HermesException(HermesErrorCodes.MISSING_FIELD.value.code, "serve_name is a required field")

            try:
                response = await call_api_endpoint_async(
                    url=f"{self.hermes_deployer_url}/api/v1/serve/{serve_name}/status/{env}",
                    method="GET",
                    headers=self.headers,
                )
                print_hermes_response(response)
                return response
            except Exception as e:
                handle_hermes_exception(e)
        except HermesException:
            raise
        except Exception as e:
            raise HermesException(HermesErrorCodes.API_ERROR.value.code, f"Failed to get serve status: {str(e)}")

    @classmethod
    def set_user_token(cls):
        """Set user token by writing it to credentials file in format HERMES_USER_TOKEN=<token>"""
        try:
            token = os.getenv("HERMES_USER_TOKEN")
            if token == "default":
                raise ValueError("Hermes token not found in environment variables")

            credentials_path = os.path.expanduser(CREDENTIALS_FILE_PATH)

            # Create .hermes directory if it doesn't exist
            os.makedirs(os.path.dirname(credentials_path), exist_ok=True)

            # Write token to file in format HERMES_USER_TOKEN=<token>
            with open(credentials_path, "w") as f:
                f.write(f"HERMES_USER_TOKEN={token}")

        except Exception as e:
            raise HermesException(HermesErrorCodes.CONFIG_ERROR.value.code, f"Failed to set user token: {str(e)}")
