from dataclasses import dataclass
from dataclasses_json import DataClassJsonMixin
from typing import List, Optional, Dict


@dataclass
class AutoTerminationPolicy(DataClassJsonMixin):
    policy_name: str
    params: Dict[str, Optional[int]]
    enabled: bool


@dataclass
class HeadNodeConfig(DataClassJsonMixin):
    head_node_cores: int
    head_node_memory: int
    node_type: Optional[str]
    node_capacity_type: str
    gpu_pod: Optional[str]


@dataclass
class WorkerNodeConfig(DataClassJsonMixin):
    cores: int
    memory: int
    min_pods: int
    max_pods: int
    disk_setting: Optional[str]
    node_type: Optional[str]
    node_capacity_type: str
    gpu_pod: Optional[str]


@dataclass
class RayStartParams(DataClassJsonMixin):
    object_store_memory_perc: int
    num_cpus_on_head: int
    num_gpus_on_head: int


@dataclass
class AdvanceConfig(DataClassJsonMixin):
    env_variables: str
    log_path: str
    init_script: str
    instance_role: Optional[str]
    availability_zone: Optional[str]
    ray_start_params: RayStartParams
    spark_config: Dict[str, str]


@dataclass
class DashboardsData(DataClassJsonMixin):
    jupyter_lab_url: str
    ray_dashboard_url: str
    spark_ui_url: str
    grafana_dashboard_url: str
    code_server_url: str


@dataclass
class Dashboards(DataClassJsonMixin):
    status: str
    data: DashboardsData


@dataclass
class ClusterData(DataClassJsonMixin):
    cluster_id: str
    name: str
    tags: List[str]
    runtime: str
    auto_termination_policies: List[AutoTerminationPolicy]
    inactive_time: int
    status: str
    user: str
    head_node_config: HeadNodeConfig
    worker_node_configs: List[WorkerNodeConfig]
    advance_config: AdvanceConfig
    dashboards: Dashboards
    created_on: str
    is_job_cluster: bool

    @property
    def has_ondemand_worker_group(self) -> bool:
        """
        Check if the cluster has a worker group with node_capacity_type 'ondemand'.
        :return: True if an on-demand worker group exists, otherwise False.
        """
        return any(worker.node_capacity_type == "ondemand" for worker in self.worker_node_configs)

    @property
    def min_pod(self) -> str:
        """
        Get the minimum of all worker node min_pods.
        :return: minimum number of pods
        """
        return str(min(worker.min_pods for worker in self.worker_node_configs))

    @property
    def max_pod(self) -> str:
        """
        Get the maximum of all worker node max_pods.
        :return: maximum number of pods
        """
        return str(max(worker.max_pods for worker in self.worker_node_configs))

    @property
    def spark_config(self) -> Dict[str, str]:
        """
        Get the Spark configuration from the advance config.
        :return: Spark configuration dictionary
        """
        return self.advance_config.spark_config if self.advance_config else {}


@dataclass
class ClusterResponse(DataClassJsonMixin):
    status: str
    data: ClusterData
