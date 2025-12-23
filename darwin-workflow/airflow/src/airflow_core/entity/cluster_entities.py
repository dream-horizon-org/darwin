from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from enum import Enum


class NodeConfig(BaseModel):
    cores: int
    memory: int
    node_capacity_type: str


class WorkerNodeConfig(BaseModel):
    cores_per_pods: int
    memory_per_pods: int
    node_capacity_type: str
    min_pods: int
    max_pods: int


class RayStartParams(BaseModel):
    object_store_memory_perc: int = 25
    cpus_on_head: int = 0
    gpus_on_head: int = 0


class AdvanceConfig(BaseModel):
    init_script: str = ""
    ray_start_params: Optional[RayStartParams] = None
    env_variables: Optional[str] = ""


class ClusterDict(BaseModel):
    name: str
    runtime: str
    tags: List[str]
    head_node: Dict[str, NodeConfig]
    worker_group: List[Dict[str, Any]]
    terminate_after_minutes: int
    advance_config: Dict[str, Any]
    is_job_cluster: bool = True
    start_cluster: bool = False


class ClusterData(BaseModel):
    cluster_name: str
    runtime: str
    tags: List[str]
    head_node_config: NodeConfig
    worker_node_configs: List[WorkerNodeConfig]
    auto_termination_policies = []
    inactive_time: int
    advance_config: AdvanceConfig
    is_job_cluster: bool = True
    start_cluster: bool = False

    def convert(self) -> dict:
        """
        Converts the ClusterData instance to a ClusterDict instance.
        """
        cluster_dict = ClusterDict(
            name=self.cluster_name,
            runtime=self.runtime,
            tags=self.tags,
            head_node={
                "node": {
                    "cores": self.head_node_config.cores,
                    "memory": self.head_node_config.memory,
                    "node_capacity_type": self.head_node_config.node_capacity_type,
                }
            },
            worker_group=[],
            terminate_after_minutes=self.inactive_time,
            advance_config={
                "init_script": self.advance_config.init_script.split("\n"),
                "ray_start_params": self.advance_config.ray_start_params,
                "env_variables": self.advance_config.env_variables,
            },
            is_job_cluster=self.is_job_cluster,
            start_cluster=self.start_cluster,
        )

        for worker_node_config in self.worker_node_configs:
            worker_group = {
                "node": {
                    "cores": worker_node_config.cores_per_pods,
                    "memory": worker_node_config.memory_per_pods,
                    "node_capacity_type": worker_node_config.node_capacity_type,
                },
                "min_pods": worker_node_config.min_pods,
                "max_pods": worker_node_config.max_pods,
            }
            cluster_dict.worker_group.append(worker_group)

        return cluster_dict.dict()


class PackageStatus(Enum):
    CREATED = "created"
    UNINSTALL_PENDING = "uninstall_pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"