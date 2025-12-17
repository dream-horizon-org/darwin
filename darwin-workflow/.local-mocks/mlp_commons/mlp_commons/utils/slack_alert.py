"""Mock Slack alert utilities for local development"""
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class Attachment:
    """Mock Slack attachment"""
    
    def __init__(
        self,
        text: str = None,
        color: str = None,
        title: str = None,
        fields: List[Dict] = None,
        **kwargs
    ):
        self.text = text
        self.color = color
        self.title = title
        self.fields = fields or []
        self.metadata = kwargs
        
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "text": self.text,
            "color": self.color,
            "title": self.title,
            "fields": self.fields,
            **self.metadata
        }
    
    def __repr__(self):
        return f"Attachment(title={self.title}, color={self.color})"


class Block:
    """Mock Slack block"""
    
    def __init__(
        self,
        type: str = "section",
        text: Optional[Dict] = None,
        fields: List[Dict] = None,
        **kwargs
    ):
        self.type = type
        self.text = text
        self.fields = fields or []
        self.metadata = kwargs
        
    def to_dict(self):
        """Convert to dictionary"""
        return {
            "type": self.type,
            "text": self.text,
            "fields": self.fields,
            **self.metadata
        }
    
    def __repr__(self):
        return f"Block(type={self.type})"


def slack_alert(
    message: str = None,
    webhook_url: str = None,
    channel: str = None,
    username: str = "Darwin Workflow",
    attachments: List[Attachment] = None,
    blocks: List[Block] = None,
    **kwargs
) -> bool:
    """
    Mock Slack alert function - just logs instead of sending
    
    Args:
        message: Alert message
        webhook_url: Slack webhook URL (not used in mock)
        channel: Slack channel (not used in mock)
        username: Bot username
        attachments: Message attachments
        blocks: Message blocks
        **kwargs: Additional parameters
        
    Returns:
        bool: Always True (mock)
    """
    logger.info("=" * 80)
    logger.info("MOCK SLACK ALERT")
    logger.info("=" * 80)
    logger.info(f"Channel: {channel}")
    logger.info(f"Username: {username}")
    logger.info(f"Message: {message}")
    
    if attachments:
        logger.info("Attachments:")
        for att in attachments:
            logger.info(f"  - {att}")
    
    if blocks:
        logger.info("Blocks:")
        for block in blocks:
            logger.info(f"  - {block}")
    
    logger.info("=" * 80)
    
    # Always return success in mock mode
    return True


def send_slack_message(message: str, **kwargs) -> bool:
    """Convenience function for sending slack messages"""
    return slack_alert(message=message, **kwargs)







