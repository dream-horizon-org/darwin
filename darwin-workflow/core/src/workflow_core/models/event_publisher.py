"""EventPublisher to replace mlp_commons.kafka.event_publisher"""
import logging
from typing import Optional
from workflow_core.models.event_entity import Event

logger = logging.getLogger(__name__)


class EventPublisher:
    """Event publisher for publishing events (mock implementation for local)"""
    
    def __init__(self, topic: Optional[str] = None):
        self.topic = topic
    
    def publish(self, event: Event, topic: Optional[str] = None) -> bool:
        """Publish an event (mock implementation)"""
        publish_topic = topic or self.topic
        logger.info(f"Mock: Publishing event to topic '{publish_topic}': {event.to_dict()}")
        return True
    
    def publish_batch(self, events: list[Event], topic: Optional[str] = None) -> bool:
        """Publish a batch of events (mock implementation)"""
        publish_topic = topic or self.topic
        logger.info(f"Mock: Publishing {len(events)} events to topic '{publish_topic}'")
        return True

