import json
import yaml
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict


@dataclass
class EnvironmentConfig:
    domain_suffix: str
    cluster_name: str
    namespace: str
    ft_redis_url: str
    workflow_url: str
    security_group: Optional[str] = None
    subnets: Optional[str] = None

    def to_dict(self):
        # Only include non-None values
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class CreateEnvironmentRequest:
    name: str
    environment_configs: EnvironmentConfig

    def to_dict(self):
        return {"name": self.name, "environment_configs": self.environment_configs.to_dict()}


@dataclass
class DeployModelRequest:
    env: str
    serve_name: str
    artifact_version: str
    model_uri: str
    cores: int
    memory: int
    node_capacity: str
    min_replicas: int
    max_replicas: int

    def to_dict(self):
        return asdict(self)


@dataclass
class UndeployModelRequest:
    serve_name: str
    env: str

    def to_dict(self):
        return asdict(self)


@dataclass
class APIServeDeploymentConfig:
    deployment_strategy: Optional[str] = None
    deployment_strategy_config: Optional[Dict] = None
    environment_variables: Optional[Dict] = None

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def api_serve_deployment_config(config_str: Optional[str]) -> "APIServeDeploymentConfig":
        if config_str is None:
            raise ValueError("Configuration string cannot be None")
        try:
            config_data = json.loads(config_str)
        except json.JSONDecodeError:
            try:
                config_data = yaml.safe_load(config_str)
            except yaml.YAMLError as e:
                raise ValueError("Invalid JSON or YAML format") from e
        # Validate config_data here if needed
        return APIServeDeploymentConfig(**config_data)


@dataclass
class APIServeConfig:
    backend_type: str
    cores: int
    memory: int
    min_replicas: int
    max_replicas: int
    node_capacity_type: str = "spot"
    additional_hosts: Optional[List[str]] = None

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def api_serve_config(config_str: Optional[str]) -> "APIServeConfig":
        if config_str is None:
            raise ValueError("Configuration string cannot be None")
        try:
            config_data = json.loads(config_str)
        except json.JSONDecodeError:
            try:
                config_data = yaml.safe_load(config_str)
            except yaml.YAMLError as e:
                raise ValueError("Invalid JSON or YAML format") from e
        # Validate config_data here if needed
        return APIServeConfig(**config_data)


@dataclass
class WorkflowNodeConfig:
    cores: int
    memory: int
    node_capacity_type: str = "spot"

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def workflow_node_config(config_str: Optional[str]) -> "WorkflowNodeConfig":
        if config_str is None:
            raise ValueError("Configuration string cannot be None")
        try:
            config_data = json.loads(config_str)
        except json.JSONDecodeError:
            try:
                config_data = yaml.safe_load(config_str)
            except yaml.YAMLError as e:
                raise ValueError("Invalid JSON or YAML format") from e
        # Validate config_data here if needed
        return WorkflowNodeConfig(**config_data)


@dataclass
class WorkflowWorkerConfig:
    cores_per_pods: int
    memory_per_pods: int
    min_pods: int
    max_pods: int
    node_capacity_type: str = "spot"

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def workflow_worker_config(config_str: Optional[str]) -> "WorkflowWorkerConfig":
        if config_str is None:
            raise ValueError("Configuration string cannot be None")
        try:
            config_data = json.loads(config_str)
        except json.JSONDecodeError:
            try:
                config_data = yaml.safe_load(config_str)
            except yaml.YAMLError as e:
                raise ValueError("Invalid JSON or YAML format") from e
        # Validate config_data here if needed
        return WorkflowWorkerConfig(**config_data)


@dataclass
class WorkflowServeConfig:
    schedule: str
    head_node_config: WorkflowNodeConfig
    worker_node_config: List[WorkflowWorkerConfig]

    def to_dict(self):
        return asdict(self)

    @staticmethod
    def workflow_serve_config(config_str: Optional[str]) -> "WorkflowServeConfig":
        if config_str is None:
            raise ValueError("Configuration string cannot be None")
        try:
            config_data = json.loads(config_str)
        except json.JSONDecodeError:
            try:
                config_data = yaml.safe_load(config_str)
            except yaml.YAMLError as e:
                raise ValueError("Invalid JSON or YAML format") from e
        # Validate config_data here if needed
        return WorkflowServeConfig(**config_data)
