from typing import Optional

from pydantic import BaseModel, field_validator


class FastApiConfig(BaseModel):
    min_replicas: int
    max_replicas: int
    cores: int
    memory: int
    node_capacity_type: str


class WorkerNodeConfig(BaseModel):
    cores_per_pods: int
    memory_per_pods: int
    min_pods: int
    max_pods: int
    node_capacity_type: Optional[str]


class HeadNodeConfig(BaseModel):
    cores: int
    memory: int
    node_capacity_type: Optional[str]


class DeploymentConfig(BaseModel):
    health_check_path: str
    start_command: str
    app_port: int = 8080
    envs: dict[str, str] = {}


class EnvConfig(BaseModel):
    """
    Class for Environment Configuration
    Args:
        domain_suffix: domain suffix for the environment
        cluster_name: cluster name for the environment
        security_group: security group for the environment (comma-separated if multiple)
        subnets: subnets for the environment (comma-separated if multiple)
        ft_redis_url: redis url for the environment
        workflow_url: workflow url for the environment
        namespace: namespace for the environment
        enable_istio: whether Istio is available for canary deployments (default False)
    """
    domain_suffix: str
    cluster_name: str
    security_group: str
    subnets: Optional[str] = None
    ft_redis_url: str
    workflow_url: str
    namespace: str
    enable_istio: Optional[bool] = False

    @field_validator("enable_istio", mode="before")
    @classmethod
    def coerce_enable_istio(cls, v):
        """Coerce None to False for backward compatibility with existing env_configs."""
        if v is None:
            return False
        return v
