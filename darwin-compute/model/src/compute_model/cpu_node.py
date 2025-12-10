import os
from dataclasses import dataclass
from typing import Optional

from dataclasses_json import DataClassJsonMixin

from compute_model.constant.constants import NODE_CAPACITY_TYPE, NODE_TYPE, CPU_NODE_LIMITS
from compute_model.disk import Disk


@dataclass
class CPUNode(DataClassJsonMixin):
    """
    CPU node configuration for compute request.
    """

    cores: int
    memory: int
    disk: Optional[Disk] = None
    node_capacity_type: Optional[str] = None
    node_type: Optional[str] = None

    def __post_init__(self):
        if not isinstance(self.cores, int):
            raise TypeError("cores must be int")
        if not isinstance(self.memory, int):
            raise TypeError("memory must be int")
        if self.disk is not None and not isinstance(self.disk, Disk):
            raise TypeError("disk must be Disk")
        if self.node_type is not None and not isinstance(self.node_type, str):
            raise TypeError("node_type must be str")
        if self.node_capacity_type is not None and not isinstance(self.node_capacity_type, str):
            raise TypeError("node_capacity_type must be str")

        if (
            self.cores < CPU_NODE_LIMITS["cores"]["min"]
            or self.cores >= CPU_NODE_LIMITS["cores"]["max"]
        ):
            raise ValueError(f"cores {self.cores} is not a valid input")
        if (
            self.memory < CPU_NODE_LIMITS["memory"]["min"]
            or self.memory >= CPU_NODE_LIMITS["memory"]["max"]
        ):
            raise ValueError(f"memory {self.memory} is not a valid input")
        if self.node_type is not None and self.node_type not in NODE_TYPE:
            raise ValueError(f"node_type {self.node_type} is not a valid input")
        if self.node_capacity_type is not None and self.node_capacity_type not in NODE_CAPACITY_TYPE:
            raise ValueError(f"node_capacity_type {self.node_capacity_type} is not a valid input")
