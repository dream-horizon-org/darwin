from dataclasses import dataclass
from typing import Optional, Union

from dataclasses_json import DataClassJsonMixin

from compute_model.constant.constants import NODE_TYPE
from compute_model.cpu_node import CPUNode
from compute_model.gpu_node import GPUNode


@dataclass
class WorkerGroup(DataClassJsonMixin):
    """
    Worker group configuration for compute request.
    TODO: Consider using Pydantic with validators instead of manual type checking in __init__
    """

    node: Union[CPUNode, GPUNode]
    min_pods: int
    max_pods: int
    node_type: Optional[str] = None

    def __init__(
        self,
        node: dict,
        min_pods: int,
        max_pods: int,
        node_type: Optional[str] = None,
    ):
        if node_type is not None and not isinstance(node_type, str):
            raise TypeError("node_type must be str")
        if not isinstance(min_pods, int):
            raise TypeError("min_pods must be int")
        if not isinstance(max_pods, int):
            raise TypeError("max_pods must be int")
        if node_type is not None and node_type not in NODE_TYPE:
            raise ValueError(f"node_type = {self.node_type} is not a valid input")
        self.node_type = node_type
        if self.node_type == "gpu":
            self.node = GPUNode.from_dict(node)
            self.node.verify()
        else:
            self.node = CPUNode.from_dict(node)
        self.node.node_type = self.node_type
        if min_pods < 0:
            raise ValueError(f"min_pods = {min_pods} is not a valid input")
        self.min_pods = min_pods
        if max_pods < min_pods:
            raise ValueError(f"max_pods = {max_pods} is not a valid input")
        self.max_pods = max_pods

    def convert(self):
        """
        Convert WorkerGroup to app layer dict.
        Returns:
            Dict[Any, Any]: Dict representation of WorkerGroup
        TODO: Duplicated conversion logic for CPU vs GPU - consider using polymorphism
        """
        if self.node_type == "gpu":
            return {
                "cores_per_pods": self.node.cores,
                "memory_per_pods": self.node.memory,
                "min_pods": self.min_pods,
                "max_pods": self.max_pods,
                "node_type": self.node_type,
                "gpu_pod": self.node.convert(),
            }
        else:
            return {
                "cores_per_pods": self.node.cores,
                "memory_per_pods": self.node.memory,
                "min_pods": self.min_pods,
                "max_pods": self.max_pods,
                "node_type": self.node_type,
                "disk_setting": (self.node.disk.convert() if self.node.disk is not None else None),
                "node_capacity_type": (self.node.node_capacity_type if self.node.node_capacity_type else "ondemand"),
            }
