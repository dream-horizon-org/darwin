"""Event entity models to replace mlp_commons.kafka.event_entity"""
from enum import Enum
from datetime import datetime
from typing import Any, Dict, Optional
from workflow_core.models.constants import State, Entity


class StateSubclass:
    """StateSubclass for workflow state changes"""
    
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
    """Event for event publishing"""
    
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
        self.state = state
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}
        self.metadata.update(kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary"""
        return {
            "entity": self.entity.value if hasattr(self.entity, 'value') else str(self.entity),
            "entity_id": self.entity_id,
            "state": self.state.value if hasattr(self.state, 'value') else str(self.state),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "metadata": self.metadata
        }
    
    def to_json(self) -> str:
        """Convert event to JSON string"""
        import json
        return json.dumps(self.to_dict())
    
    def publish(self, topic: str = None):
        """Publish to event stream (mock implementation)"""
        # In local mode, this is a no-op
        return True
    
    def __repr__(self):
        return f"Event(entity={self.entity}, entity_id={self.entity_id}, state={self.state})"

