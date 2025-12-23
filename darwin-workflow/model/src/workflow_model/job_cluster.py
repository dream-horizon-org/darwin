from typing import List, Any
from datetime import datetime, timezone
from pydantic import BaseModel, validator
from pydantic.utils import Optional

from workflow_model.constants.constants import ACTIVE
from workflow_model.meta_data import MetaData
from workflow_model.utils.utils import get_job_cluster_definition_id


class GPUNodeConfig(BaseModel):
    name: str
    cores: int
    memory: int
    gpu_count: int
    g_ram_memory: int
    g_ram_type: str

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

    @validator("gpu_count", pre=True)
    def validate_gpu_count(cls, value):
        if value < 1:
            raise ValueError("gpu_count should be greater than 0")
        return value

    @validator("g_ram_memory", pre=True)
    def validate_g_ram_memory(cls, value):
        if value <= 0:
            raise ValueError("g_ram_memory should be greater than 0")
        return value


class WorkerNodeConfig(BaseModel):
    cores_per_pods: int
    memory_per_pods: int
    min_pods: int
    max_pods: int
    node_type: Optional[str] = None
    node_capacity_type: str = 'ondemand'
    gpu_pod: Optional[GPUNodeConfig] = None

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
        if value not in ["ondemand", "spot"]:
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
    cores: int
    memory: int
    node_type: Optional[str] = None
    node_capacity_type: str = 'ondemand'
    gpu_pod: Optional[GPUNodeConfig] = None

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
        if value not in ["ondemand", "spot"]:
            raise ValueError("node_capacity_type should be either ondemand or spot")
        return value


class RayParams(BaseModel):
    object_store_memory: int = 25
    cpus_on_head: int = 0
    gpus_on_head: int = 0


class InstanceRole(BaseModel):
    id: str = "1"
    display_name: str = "darwin-ds-role"


class AdvanceConfig(BaseModel):
    environment_variables: Optional[str] = ""
    log_path: Optional[str] = ""
    init_script: Optional[str] = ""
    ray_params: Optional[RayParams]
    instance_role: Optional[InstanceRole] = {}
    spark_config: dict[str, Any] = {}

    @validator("spark_config",  pre=True)
    def validate_spark_config(cls, value):
        if not isinstance(value, dict):
            raise TypeError("spark_config must be a dictionary")
        if not all(isinstance(key, str) for key in value.keys()):
            raise TypeError("spark_config keys must be strings")
        if not all(isinstance(val, (str, int, float, bool)) for val in value.values()):
            raise TypeError("spark_config values must be str, int, float, or boolean")
        return value

    def to_dict_for_elasticsearch(self):
        """Convert to dict with dots replaced only in spark_config for Elasticsearch storage"""
        base_dict = self.dict()
        # Only replace dots in spark_config
        if "spark_config" in base_dict and base_dict["spark_config"]:
            base_dict["spark_config"] = {key.replace(".", "\\."): value for key, value in self.spark_config.items()}
        return base_dict

    @classmethod
    def from_elasticsearch_dict(cls, data):
        """Create from Elasticsearch dict with dots restored only in spark_config"""
        spark_config = data.get("spark_config", {})
        # Restore dots from escaped format only in spark_config
        if spark_config:
            restored_spark_config = {key.replace("\\.", "."): value for key, value in spark_config.items()}
            data = data.copy()  # Don't modify original data
            data["spark_config"] = restored_spark_config
        
        return cls(**data)



class AutoTerminationPolicy(BaseModel):
    policy_name: str
    enabled: bool
    params: dict


class CreateJobClusterDefinitionRequest(BaseModel):
    cluster_name: str
    tags: List[str]
    runtime: str
    inactive_time: int
    head_node_config: HeadNodeConfig
    worker_node_configs: List[WorkerNodeConfig]
    user: str
    auto_termination_policies: Optional[List[AutoTerminationPolicy]] = []
    advance_config: Optional[AdvanceConfig] = AdvanceConfig()
    cluster_status:str = ACTIVE


    def to_dict(self):
        return self.dict()

    @validator("cluster_name", pre=True)
    def validate_cluster_name(cls, value):
        if " " in value:
            raise ValueError("Cluster name should not contain spaces")
        return value


class CheckUniqueJobClusterRequest(BaseModel):
    cluster_name: str


class JobClusterDefinition(BaseModel, MetaData):
    job_cluster_definition_id: str
    cluster_name: str
    tags: List[str]
    runtime: str
    inactive_time: int
    auto_termination_policies = []
    head_node_config: HeadNodeConfig
    worker_node_configs: Optional[List[WorkerNodeConfig]]
    advance_config: Optional[AdvanceConfig] = AdvanceConfig()
    user: str
    cluster_status: str = "active"
    created_at:Optional[str]
    estimated_cost:Optional[str]= None

    def to_dict(self):
        """Convert to dict with dots replaced only in spark_config for Elasticsearch storage"""
        base_dict = self.dict()
        # Only apply special handling to advance_config.spark_config
        if "advance_config" in base_dict and base_dict["advance_config"]:
            base_dict["advance_config"] = self.advance_config.to_dict_for_elasticsearch()
        return base_dict

    @classmethod
    def from_create_def(cls, data):
        print("Creating job cluster definition")
        return cls(
            job_cluster_definition_id=get_job_cluster_definition_id(),
            cluster_name=data.cluster_name,
            tags=data.tags,
            runtime=data.runtime,
            inactive_time=data.inactive_time,
            auto_termination_policies=data.auto_termination_policies,
            head_node_config=data.head_node_config,
            worker_node_configs=data.worker_node_configs,
            advance_config=data.advance_config,
            user=data.user,
            cluster_status=data.cluster_status,
            created_at= datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
        )

    @classmethod
    def from_update_def(cls, data, job_cluster_definition_id):
        return cls(
            job_cluster_definition_id=job_cluster_definition_id,
            cluster_name=data.cluster_name,
            tags=data.tags,
            runtime=data.runtime,
            inactive_time=data.inactive_time,
            auto_termination_policies=data.auto_termination_policies,
            head_node_config=data.head_node_config,
            worker_node_configs=data.worker_node_configs,
            advance_config=data.advance_config,
            cluster_status=data.cluster_status,
            user=data.user,
            created_at=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
        )

    @classmethod
    def from_dict(cls, data):
        """Create from Elasticsearch dict with dots restored only in spark_config"""
        # Handle advance_config specially to restore dots in spark_config
        if "advance_config" in data and data["advance_config"]:
            advance_config = AdvanceConfig.from_elasticsearch_dict(data["advance_config"])
            data = data.copy()  # Don't modify original data
            data["advance_config"] = advance_config
        
        return cls(**data)


class UpdateJobClusterDefinitionRequest(BaseModel):
    cluster_name: str
    tags: Optional[List[str]]
    runtime: str
    inactive_time: int
    auto_termination_policies: Optional[List[AutoTerminationPolicy]] = []
    head_node_config: Optional[HeadNodeConfig]
    worker_node_configs: Optional[List[WorkerNodeConfig]]
    advance_config: Optional[AdvanceConfig] = AdvanceConfig()
    user: str
    cluster_status: Optional[str] = ACTIVE

    @validator("cluster_name", pre=True)
    def validate_cluster_name(cls, value):
        if " " in value:
            raise ValueError("Cluster name should not contain spaces")
        return value
