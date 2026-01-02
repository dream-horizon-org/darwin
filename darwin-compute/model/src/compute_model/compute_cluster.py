import re
from dataclasses import dataclass, field
from typing import List, Optional

from dataclasses_json import DataClassJsonMixin

from compute_model.advance_config import AdvanceConfig
from compute_model.constant.constants import (
    K8S_LABEL_CHECK,
    USER_CHECK,
    REQUIRED_LABELS,
    LABELS_SIZE_LIMIT,
    DEFAULT_LABELS,
)
from compute_model.head_node import HeadNode
from compute_model.package import Package
from compute_model.policy_definition import PolicyDefinition
from compute_model.worker_group import WorkerGroup


# TODO: Consider using Pydantic for validation instead of manual __post_init__ checks
@dataclass
class ComputeClusterDefinition(DataClassJsonMixin):
    """
    Compute cluster definition.
    Args:
        name: Name of the compute cluster.
        tags: List of the tags
        labels: Darwin Labels. Supports special labels:
            - workspace: 'shared' - Mounts workspace at /home/ray/fsx on both
              head and worker nodes. Without this label, workspace is only mounted on
              the head node. This enables data sharing between head and worker pods.
        runtime: Darwin Runtimes
        head_node: Head Node
        worker_group: Worker group configuration of compute
        terminate_after_minutes: Time after which compute will be terminated
        auto_termination_policies: List of auto termination policies
        advance_config: Advance configuration for compute
        user: User who requested the compute cluster creation request
        created_on: Time when compute cluster was created
        cluster_id: Cluster ID of compute
        cloud_env: Cloud environment of compute
        is_job_cluster: Flag to indicate if compute cluster is a job cluster
        start_cluster: Flag to indicate if compute cluster should be started
        packages: List of packages to be installed on the compute cluster
    """

    name: str
    tags: list[str]
    runtime: str
    head_node: HeadNode
    worker_group: List[WorkerGroup]
    labels: dict[str, str] = field(default_factory=lambda: DEFAULT_LABELS)
    terminate_after_minutes: int = 60
    auto_termination_policies: List[PolicyDefinition] = field(
        default_factory=lambda: [
            PolicyDefinition("JupyterLabActivity"),
            PolicyDefinition("ClusterCPUUsage"),
            PolicyDefinition("ActiveRayJob"),
        ]
    )
    advance_config: AdvanceConfig = AdvanceConfig()
    user: str = "sdk"
    created_on: str = ""
    cluster_id: str = ""
    cloud_env: Optional[str] = None
    is_job_cluster: bool = False
    start_cluster: Optional[bool] = True
    # TODO: estimated_cost has trailing comma (None,) which creates a tuple - should be just None
    estimated_cost: Optional[str] = (None,)
    packages: Optional[list[Package]] = None

    # TODO: Manual type checking duplicates @typechecked decorator functionality - consider removing redundancy
    def __post_init__(self):
        if not isinstance(self.name, str):
            raise TypeError(f"name {self.name} should be str")
        if not isinstance(self.tags, list):
            raise TypeError(f"tags {self.tags} should be list")
        if not isinstance(self.runtime, str):
            raise TypeError(f"runtime {self.runtime} should be str")
        if not isinstance(self.head_node, HeadNode):
            raise TypeError(f"head_node {self.head_node} should be HeadNode")
        if not isinstance(self.worker_group, list):
            raise TypeError(f"worker_group {self.worker_group} should be list")
        if not isinstance(self.terminate_after_minutes, int):
            raise TypeError(f"terminate_after_minutes {self.terminate_after_minutes} should be int")
        if not isinstance(self.auto_termination_policies, list):
            raise TypeError(f"auto_termination_policies {self.auto_termination_policies} should be list")
        if not isinstance(self.advance_config, AdvanceConfig):
            raise TypeError(f"advance_config {self.advance_config} should be AdvanceConfig")
        if not isinstance(self.user, str):
            raise TypeError(f"user {self.user} should be str")
        if self.packages is not None and not isinstance(self.packages, list):
            raise TypeError(f"packages {self.packages} should be list")
        if not re.match(K8S_LABEL_CHECK, self.name):
            raise ValueError(f"name {self.name} should match the pattern: {K8S_LABEL_CHECK}")
        if not re.match(USER_CHECK, self.user):
            raise ValueError(f"user {self.user} should match the pattern: {USER_CHECK}")
        if self.terminate_after_minutes < 5 and self.terminate_after_minutes != -1:
            raise ValueError(f"terminate_after_minutes {self.terminate_after_minutes} is not a valid input")
        if self.advance_config.ray_start_params.num_cpus_on_head > self.head_node.node.cores:
            raise ValueError("num_cpus_on_head should be less than or equal to head_node_cores")
        if self.advance_config.ray_start_params.num_gpus_on_head > 0:
            raise ValueError("num_gpus_on_head option is not supported yet")
        min_memory = self.head_node.node.memory
        for worker in self.worker_group:
            min_memory = min(worker.node.memory, min_memory)
        min_object_store_memory = int(
            self.advance_config.ray_start_params.object_store_memory_perc * min_memory * 1024 / 100
        )
        if min_object_store_memory < 100:
            raise ValueError(
                f"object_store_memory should be more than 100MB. Current Value: {min_object_store_memory}MB"
            )
        self.validate_labels()

    def validate_labels(self):
        for key, val in self.labels.items():
            if len(key) > LABELS_SIZE_LIMIT:
                raise ValueError(f"Label {key} is too long")
            if len(val) > LABELS_SIZE_LIMIT:
                raise ValueError(f"Label {key} value is too long")
            if not re.match(K8S_LABEL_CHECK, key) or not re.match(K8S_LABEL_CHECK, val):
                raise ValueError(f"Invalid label {key}: {val}")

    def convert(self):
        """
        Convert the compute cluster definition to the format required by compute cluster service.
        Returns:
            dict: Compute cluster definition in the format required by compute cluster service.
        """
        return {
            "cluster_name": self.name,
            "tags": self.tags,
            "labels": self.labels,
            "runtime": self.runtime,
            "head_node_config": self.head_node.convert(),
            "worker_node_configs": [worker.convert() for worker in self.worker_group],
            "inactive_time": self.terminate_after_minutes,
            "auto_termination_policies": [policy.convert() for policy in self.auto_termination_policies],
            "advance_config": self.advance_config.convert(),
            "user": self.user,
            "is_job_cluster": self.is_job_cluster,
            "start_cluster": self.start_cluster,
            "packages": [package.to_dict(encode_json=True) for package in self.packages] if self.packages else None,
        }
