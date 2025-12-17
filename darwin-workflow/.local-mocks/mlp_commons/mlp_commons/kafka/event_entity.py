"""Mock Kafka event entities for local development"""
import logging
from typing import Any, Dict, Optional
from datetime import datetime

# Import State and Entity from constants
try:
    from mlp_commons.constant.constants import State, Entity
except ImportError:
    # Fallback: define State here if import fails
    # State needs to be a base class that can be extended, not an Enum
    from enum import Enum
    class State(str, Enum):
        """Base State enum that can be extended"""
        pass
    
    class Entity(str, Enum):
        WORKFLOW = "WORKFLOW"
        PIPELINE = "PIPELINE"
        TASK = "TASK"
        JOB = "JOB"
        DATASET = "DATASET"
        MODEL = "MODEL"

logger = logging.getLogger(__name__)

# Export State so it can be imported from this module
__all__ = ['State', 'StateSubclass', 'Event']


class StateSubclass:
    """Mock StateSubclass for workflow state changes"""
    
    def __init__(self, state: str = None, substate: str = None, **kwargs):
        self.state = state
        self.substate = substate
        self.metadata = kwargs
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "state": self.state,
            "substate": self.substate,
            **self.metadata
        }
    
    def __repr__(self):
        return f"StateSubclass(state={self.state}, substate={self.substate})"


class Event:
    """Mock Event for Kafka event publishing"""
    
    def __init__(
        self,
        entity: Entity = None,
        entity_id: str = None,
        state: State = None,
        timestamp: datetime = None,
        metadata: Dict[str, Any] = None,
        **kwargs
    ):
        self.entity = entity or Entity.WORKFLOW
        self.entity_id = entity_id
        self.state = state or State.PENDING
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}
        self.metadata.update(kwargs)
        logger.info(f"Mock Event created: {self.entity}/{entity_id} - {self.state}")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary"""
        return {
            "entity": self.entity.value if hasattr(self.entity, 'value') else str(self.entity),
            "entity_id": self.entity_id,
            "state": self.state.value if hasattr(self.state, 'value') else str(self.state),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "metadata": self.metadata
        }
    
    def publish(self, topic: str = None):
        """Mock publish to Kafka (just logs)"""
        logger.info(f"Mock: Publishing event to topic '{topic}': {self.to_dict()}")
        return True
    
    def __repr__(self):
        return f"Event(entity={self.entity}, entity_id={self.entity_id}, state={self.state})"






