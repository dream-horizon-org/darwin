"""Mock constants for local development"""
from enum import Enum


class State(str, Enum):
    """Base State enum that can be extended by subclasses"""
    # Empty enum that can be extended
    pass


class Entity(str, Enum):
    """Mock Entity enum"""
    WORKFLOW = "WORKFLOW"
    PIPELINE = "PIPELINE"
    TASK = "TASK"
    JOB = "JOB"
    DATASET = "DATASET"
    MODEL = "MODEL"






