from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, validator, model_validator, field_validator
from typing import Optional, List, Literal, Union, Any
from ml_serve_model.enums import BackendType, ServeType
from ml_serve_core.client.mlflow_client import MLflowClient


class CreateServeRequest(BaseModel):
    name: str = Field(..., description="Name of the serve.")
    type: ServeType = Field(..., description="Type of the serve.")
    description: str = Field("", description="Description of the serve.")
    space: str = Field("", description="Serve space of the serve.")

    @validator("name")
    def validate_name(cls, value: str):
        if "_" in value:
            raise RequestValidationError("serve name cannot contain underscores.")
        return value


class CreateArtifactRequest(BaseModel):
    serve_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Name of the serve (1–50 characters)."
    )
    github_repo_url: Optional[str] = Field(None, description="GitHub repository URL.")
    version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version of the artifact (1–50 characters)."
    )
    branch: Optional[str] = Field(None, description="Branch of the repository.")
    file_path: Optional[str] = Field(None, description="File path of the artifact.")

    @field_validator("serve_name", "version", mode="before")
    def strip_whitespace(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    def validation_for_workflow_serve_artifact_create_request(self):
        if self.branch is None:
            raise RequestValidationError("branch is required.")
        if self.file_path is None:
            raise RequestValidationError("file_path is required.")
        return self


class FastAPIServeConfigRequest(BaseModel):
    cores: Optional[int] = Field(None, gt=0,
                                 description="Number of CPU cores allocated for this configuration (must be positive).")
    memory: Optional[int] = Field(None, gt=0, description="Amount of memory allocated for this configuration (must be "
                                                          "positive).")
    node_capacity_type: Optional[str] = Field(default="spot",
                                              description="Capacity type of the node, e.g., 'spot' or 'on-demand'.")
    min_replicas: Optional[int] = Field(None, gt=0,
                                        description="Minimum number of replicas for the FastAPI application (must be "
                                                    "positive).")
    max_replicas: Optional[int] = Field(None, gt=0,
                                        description="Maximum number of replicas for the FastAPI application (must be "
                                                    "positive).")

    @validator("node_capacity_type")
    def validate_node_capacity_type(cls, value):
        allowed_values = ["spot", "on-demand"]
        if value is not None and value not in allowed_values:
            raise RequestValidationError(f"Invalid node_capacity_type. Must be one of {allowed_values}.")
        return value

    def validation_for_create_request(self):
        if self.min_replicas is None:
            raise RequestValidationError("min_replicas is required.")
        if self.max_replicas is None:
            raise RequestValidationError("max_replicas is required.")
        if self.cores is None:
            raise RequestValidationError("cores is required.")
        if self.memory is None:
            raise RequestValidationError("memory is required.")
        return self


class APIServeConfigRequest(BaseModel):
    backend_type: Optional[BackendType] = Field(None, description="Type of the backend, e.g., 'fastapi'.")

    additional_hosts: Optional[List[str]] = Field(None, description="Additional hosts for the FastAPI application.")

    fast_api_config: FastAPIServeConfigRequest = Field(..., description="Configuration for the FastAPI "
                                                                        "application.")

    @validator("additional_hosts")
    def validate_additional_hosts(cls, value):
        if value is not None and not isinstance(value, list):
            raise RequestValidationError("additional_hosts must be a list of strings.")
        return value

    @validator("fast_api_config")
    def validate_fast_api_config(cls, value):
        if value is not None and value.min_replicas > value.max_replicas:
            raise RequestValidationError("min_replicas must be less than or equal to max_replicas.")
        return value

    def validation_for_create_request(self):
        if self.backend_type is None:
            raise RequestValidationError("backend_type is required.")
        if self.fast_api_config is None:
            raise RequestValidationError("fast_api_config is required.")
        self.fast_api_config.validation_for_create_request()
        return self


class WorkerNodeConfig(BaseModel):
    cores_per_pods: int = Field(..., gt=0,
                                description="Number of CPU cores allocated per pod (must be positive).")
    memory_per_pods: int = Field(..., gt=0,
                                 description="Amount of memory allocated per pod (must be positive).")
    min_pods: int = Field(..., gt=0, description="Minimum number of pods (must be positive).")
    max_pods: int = Field(..., gt=0, description="Maximum number of pods (must be positive).")
    node_capacity_type: Optional[str] = Field(default="spot",
                                              description="Capacity type of the node, e.g., 'spot' or 'on-demand'.")

    @validator("cores_per_pods", pre=True)
    def validate_cores_per_pods(cls, value):
        if value < 1:
            raise ValueError("cores should be greater than 0")
        return value

    @validator("memory_per_pods", pre=True)
    def validate_memory_per_pods(cls, value):
        if value <= 0:
            raise ValueError("memory should be greater than 0")
        return value

    @validator("node_capacity_type", pre=True)
    def validate_node_capacity_type(cls, value):
        if value is not None and value not in ["ondemand", "spot"]:
            raise ValueError("node_capacity_type should be either ondemand or spot")
        return value

    @validator("min_pods", pre=True)
    def validate_min_pods(cls, value):
        if value < 1:
            raise ValueError("min_pods should be greater than 0")
        return value

    @validator("max_pods", pre=True)
    def validate_max_pods(cls, value):
        if value < 1:
            raise ValueError("max_pods should be greater than 0")
        return value


class HeadNodeConfig(BaseModel):
    cores: int = Field(..., gt=0,
                       description="Number of CPU cores allocated for this configuration (must be positive).")
    memory: int = Field(..., gt=0, description="Amount of memory allocated for this configuration (must be positive).")
    node_capacity_type: Optional[str] = Field(default="spot",
                                              description="Capacity type of the node, e.g., 'spot' or 'on-demand'.")

    @validator("cores", pre=True)
    def validate_cores(cls, value):
        if value < 1:
            raise ValueError("cores should be greater than 0")
        return value

    @validator("memory", pre=True)
    def validate_memory(cls, value):
        if value <= 0:
            raise ValueError("memory should be greater than 0")
        return value

    @validator("node_capacity_type", pre=True)
    def validate_node_capacity_type(cls, value):
        if value is not None and value not in ["ondemand", "spot"]:
            raise ValueError("node_capacity_type should be either ondemand or spot")
        return value


class WorkflowServeConfigCreateRequest(BaseModel):
    schedule: Optional[str] = Field(None, description="Schedule for the workflow serve.")
    head_node_config: Optional[HeadNodeConfig] = Field(None, description="Configuration for the head node.")
    worker_node_config: Optional[List[WorkerNodeConfig]] = Field(None,
                                                                 description="Configuration for the worker nodes.")

    def validation_for_create_request(self):
        if self.schedule is None:
            raise RequestValidationError("schedule is required.")
        for worker_node in self.worker_node_config:
            worker_node.validation_for_create_request()
        return self


class ServeConfigRequest(BaseModel):
    api_serve_config: Optional[APIServeConfigRequest] = Field(None, description="Configuration for the API serve.")

    workflow_serve_config: Optional[WorkflowServeConfigCreateRequest] = Field(None, description="Configuration for the "
                                                                                                "workflow serve.")

    def validation_for_create_request(self):
        if self.api_serve_config is None and self.workflow_serve_config is None:
            raise RequestValidationError("Either api_serve_config or workflow_serve_config is required.")
        if self.api_serve_config is not None:
            self.api_serve_config.validation_for_create_request()
        if self.workflow_serve_config is not None:
            self.workflow_serve_config.validation_for_create_request()
        return self


DeploymentStrategyId = Literal["rolling", "canary"]


class RollingDeploymentStrategyConfigRequest(BaseModel):
    """
    Rolling-update tuning parameters for Kubernetes Deployments.

    These map to `spec.strategy.rollingUpdate.{maxSurge,maxUnavailable}`.
    Kubernetes accepts either an integer or a percentage string (e.g., "10%").
    """

    max_surge: Optional[Union[int, str]] = Field(
        None,
        description="Max surge for rolling update (int or percentage string, e.g. 1 or '10%').",
    )
    max_unavailable: Optional[Union[int, str]] = Field(
        None,
        description="Max unavailable for rolling update (int or percentage string, e.g. 0 or '25%').",
    )

    @field_validator("max_surge", "max_unavailable", mode="before")
    def _normalize_int_or_percent(cls, value: Any) -> Any:
        """Normalize whitespace and allow int-like strings for rolling update knobs."""
        if value is None:
            return value
        if isinstance(value, str):
            v = value.strip()
            if v == "":
                return None
            # Accept "1" as int, but keep "10%" as string.
            if v.isdigit():
                return int(v)
            return v
        return value

    @field_validator("max_surge", "max_unavailable", mode="after")
    def _validate_int_or_percent(cls, value: Any) -> Any:
        """Validate that rolling update knobs are either non-negative ints or percent strings."""
        if value is None:
            return value
        if isinstance(value, int):
            if value < 0:
                raise RequestValidationError("rolling strategy config values must be >= 0")
            return value
        if isinstance(value, str):
            if value.endswith("%") and value[:-1].isdigit():
                return value
            raise RequestValidationError(
                "rolling strategy config values must be an int or a percentage string like '10%'"
            )
        raise RequestValidationError("rolling strategy config values must be an int or percentage string")


class CanaryMetricConfigRequest(BaseModel):
    """Metric configuration for Flagger canary analysis."""

    name: str = Field(..., min_length=1, description="Metric template name used by Flagger.")
    threshold_max: float = Field(
        ...,
        ge=0,
        description="Max allowed value for the metric (Flagger thresholdRange.max).",
    )
    interval: str = Field("1m", min_length=2, description="Metric check interval (e.g., '30s', '1m').")

    @field_validator("name", mode="before")
    def _normalize_name(cls, value: Any) -> Any:
        """Trim metric name whitespace."""
        if isinstance(value, str):
            return value.strip()
        return value


class CanaryDeploymentStrategyConfigRequest(BaseModel):
    """
    Flagger/Istio canary rollout configuration.

    These map to `.Values.flagger.*` in the `darwin-fastapi-serve` chart.
    """

    interval: str = Field("1m", min_length=2, description="Analysis interval (e.g., '30s', '1m').")
    threshold: int = Field(2, ge=1, description="Max failed checks before rollback.")
    max_weight: int = Field(60, ge=1, le=100, description="Maximum traffic percentage routed to canary.")
    step_weight: int = Field(20, ge=1, le=100, description="Traffic increment step for canary.")
    progress_deadline_seconds: int = Field(600, ge=1, description="Max seconds for canary to make progress.")
    skip_analysis: bool = Field(False, description="Skip canary analysis (dangerous; for debugging only).")
    metrics: Optional[List[CanaryMetricConfigRequest]] = Field(
        None,
        description="Optional list of Flagger metric templates to use during analysis.",
    )

    @model_validator(mode="after")
    def _validate_weights(self) -> "CanaryDeploymentStrategyConfigRequest":
        """Validate step/max weight constraints."""
        if self.step_weight > self.max_weight:
            raise RequestValidationError("canary step_weight must be <= max_weight")
        return self


class APIServeDeploymentConfigRequest(BaseModel):
    deployment_strategy: Optional[DeploymentStrategyId] = Field(
        None,
        description="Deployment strategy for the API serve. Supported: 'rolling', 'canary'. Defaults to 'rolling'.",
    )
    deployment_strategy_config: Optional[
        Union[RollingDeploymentStrategyConfigRequest, CanaryDeploymentStrategyConfigRequest]
    ] = Field(
        None,
        description="Deployment strategy configuration (typed per strategy).",
    )
    environment_variables: Optional[dict] = Field(None, description="Environment variables for the API serve.")

    @model_validator(mode="before")
    def _normalize_and_parse_strategy(cls, data: Any) -> Any:
        """
        Normalize strategy identifiers and parse the strategy config into a typed model.

        This keeps the public API shape stable (`deployment_strategy` + `deployment_strategy_config`)
        while ensuring callers get strong validation and canonical IDs.
        """
        if not isinstance(data, dict):
            return data

        strategy = data.get("deployment_strategy")
        config = data.get("deployment_strategy_config")

        # Treat empty config as absent (common in clients that always send an object).
        if config == {}:
            config = None
            data["deployment_strategy_config"] = None

        if strategy is None:
            # Avoid ambiguous config parsing when strategy is missing.
            if config is not None:
                raise RequestValidationError(
                    "deployment_strategy is required when deployment_strategy_config is provided"
                )
            return data

        if isinstance(strategy, str):
            strategy = strategy.strip().lower()
            data["deployment_strategy"] = strategy

        if strategy not in ("rolling", "canary"):
            raise RequestValidationError("Unsupported deployment_strategy. Must be one of: rolling, canary")

        if config is None or isinstance(
            config, (RollingDeploymentStrategyConfigRequest, CanaryDeploymentStrategyConfigRequest)
        ):
            return data

        if not isinstance(config, dict):
            raise RequestValidationError("deployment_strategy_config must be an object")

        if strategy == "rolling":
            data["deployment_strategy_config"] = RollingDeploymentStrategyConfigRequest(**config)
        elif strategy == "canary":
            data["deployment_strategy_config"] = CanaryDeploymentStrategyConfigRequest(**config)

        return data

    @model_validator(mode="after")
    def _default_strategy(self) -> "APIServeDeploymentConfigRequest":
        """Default the deployment strategy to rolling when omitted."""
        if self.deployment_strategy is None:
            self.deployment_strategy = "rolling"
        return self


class WorkflowServeDeploymentConfigRequest(BaseModel):
    input_parameters: dict = Field({}, description="Input parameters for the workflow serve.")


class DeploymentRequest(BaseModel):
    env: str = Field(..., min_length=1, description="Environment name (e.g., 'local', 'prod').")
    artifact_version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version label for the one-click artifact (1–50 characters).",
    )
    api_serve_deployment_config: Optional[APIServeDeploymentConfigRequest] = Field(None,
                                                                                   description="Deployment configuration for the API serve.")
    workflow_serve_deployment_config: Optional[WorkflowServeDeploymentConfigRequest] = Field(None,
                                                                                             description="Deployment configuration for the workflow serve.")

    @field_validator("artifact_version", mode="before")
    def strip_artifact_version(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value


class EnvironmentConfigRequest(BaseModel):
    domain_suffix: Optional[str] = Field(None, description="Domain suffix for the environment.")
    cluster_name: Optional[str] = Field(None, description="Cluster name for the environment.")
    security_group: Optional[str] = Field(None, description="Security group for the environment (comma-separated if multiple).")
    subnets: Optional[str] = Field(None, description="Subnets for the environment (comma-separated if multiple).")
    ft_redis_url: Optional[str] = Field(None, description="Redis URL for the environment.")
    workflow_url: Optional[str] = Field(None, description="Workflow URL for the environment.")
    namespace: Optional[str] = Field(None, description="Namespace for the environment.")

    def validation_for_create_request(self):
        if self.domain_suffix is None:
            raise RequestValidationError("domain_suffix is required.")
        if self.cluster_name is None:
            raise RequestValidationError("cluster_name is required.")
        if self.security_group is None:
            raise RequestValidationError("security_group is required.")
        if self.ft_redis_url is None:
            raise RequestValidationError("ft_redis_url is required.")
        if self.workflow_url is None:
            raise RequestValidationError("workflow_url is required.")
        if self.namespace is None:
            raise RequestValidationError("namespace is required.")
        # Note: subnets is optional and defaults to empty string
        return self


class EnvironmentRequest(BaseModel):
    name: str
    environment_configs: EnvironmentConfigRequest

    def validation_for_create_request(self):
        self.environment_configs.validation_for_create_request()
        return self


class ModelDeploymentRequest(BaseModel):
    serve_name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Name of the serve to deploy to (1–50 characters). Serve will be auto-created if it doesn't exist.",
    )
    artifact_version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version label for the one-click artifact (1–50 characters).",
    )
    model_uri: str = Field(
        ..., min_length=1, description="URI of the model."
    )
    env: str = Field(..., description="Environment name (e.g., 'local', 'prod')")
    storage_strategy: Optional[Literal["auto", "emptydir", "pvc"]] = Field(
        "auto",
        description="Storage strategy for model download: auto (default), emptydir, or pvc.",
    )

    cores: int = Field(4, ge=1, le=64, description="Number of CPU cores to allocate (1–64).")
    memory: int = Field(8, ge=1, le=512, description="Amount of memory in GB (1–512).")

    node_capacity: Literal["spot", "ondemand"] = Field(
        "spot", description="Type of node capacity: 'spot' or 'ondemand'."
    )

    min_replicas: int = Field(1, ge=1, le=100, description="Minimum number of replicas (1–100).")
    max_replicas: int = Field(1, ge=1, le=100, description="Maximum number of replicas (1–100).")

    @model_validator(mode="after")
    def validate_replica_range(self) -> 'ModelDeploymentRequest':
        if self.min_replicas > self.max_replicas:
            raise ValueError("min_replicas cannot be greater than max_replicas")
        return self

    @field_validator("serve_name", mode="before")
    def validate_serve_name(cls, value):
        if isinstance(value, str):
            value = value.strip().lower()
            if "_" in value:
                raise ValueError("serve_name cannot contain underscores")
        return value

    @field_validator("model_uri", "artifact_version", mode="before")
    def strip_whitespace(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("storage_strategy", mode="before")
    def normalize_strategy(cls, value):
        if value is None:
            return "auto"
        if isinstance(value, str):
            value = value.strip().lower()
            if value not in {"auto", "emptydir", "pvc"}:
                raise ValueError("storage_strategy must be one of: auto, emptydir, pvc")
        return value

    @field_validator("model_uri", mode="after")
    def validate_model_uri_format(cls, value):
        """
        Validate model URI format to fail fast with clear error messages.
        
        Uses MLflowClient's parse logic to ensure consistency.
        """
        if not value:
            raise ValueError("model_uri is required")
            
        client = MLflowClient()
        identifier, artifact_path, uri_type, _ = client._parse_model_uri(value)
        
        # Also support standard storage/web URIs that might not be parsed by MLflowClient
        # Note: MLflowClient._parse_model_uri returns None uri_type for storage URIs
        is_storage_uri = any(value.startswith(p) for p in ["s3://", "gs://", "file://", "http://", "https://"])
        
        if uri_type is None and not is_storage_uri:
             raise ValueError(
                f"Invalid model_uri format: '{value}'. "
                f"Must be a valid MLflow URI (models:/, runs:/, mlflow-artifacts:/) or storage URL."
            )

        return value


class ModelUndeployRequest(BaseModel):
    """Request to undeploy a one-click model deployment."""
    serve_name: str = Field(
        ..., min_length=1, max_length=50, description="Name of the serve to undeploy (1–50 characters)."
    )
    env: str = Field(..., description="Environment name where the model is deployed (e.g., 'local', 'prod')")

    @field_validator("serve_name", mode="before")
    def strip_whitespace(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

