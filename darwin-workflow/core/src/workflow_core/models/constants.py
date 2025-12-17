"""Constants to replace mlp_commons.constant.constants"""
from enum import Enum


class State(str, Enum):
    """Base State enum that can be extended by subclasses"""
    pass


class Entity(str, Enum):
    """Entity enum"""
    WORKFLOW = "WORKFLOW"
    PIPELINE = "PIPELINE"
    TASK = "TASK"
    JOB = "JOB"
    DATASET = "DATASET"
    MODEL = "MODEL"

