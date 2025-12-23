"""Local slack_alert implementation to replace mlp_commons.utils.slack_alert"""
import logging
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


class Block:
    """Slack block"""
    
    @staticmethod
    def header(text: str) -> Dict[str, Any]:
        """Create a header block"""
        return {"type": "header", "text": {"type": "plain_text", "text": text}}
    
    @staticmethod
    def divider() -> Dict[str, Any]:
        """Create a divider block"""
        return {"type": "divider"}
    
    @staticmethod
    def section(fields: Dict[str, Any]) -> Dict[str, Any]:
        """Create a section block with fields"""
        field_list = [{"type": "mrkdwn", "text": f"*{k}*: {v}"} for k, v in fields.items()]
        return {"type": "section", "fields": field_list}


class Attachment:
    """Slack attachment"""
    
    def __init__(self, error: bool = False):
        self.color = "danger" if error else None
        self.blocks: List[Dict[str, Any]] = []
        self.fields: List[Dict[str, Any]] = []
    
    def add_block(self, block: Dict[str, Any]):
        """Add a block to the attachment"""
        self.blocks.append(block)
    
    def get_attachment(self) -> List[Dict[str, Any]]:
        """Get the attachment as a list (for Slack API)"""
        attachment = {}
        if self.color:
            attachment["color"] = self.color
        if self.blocks:
            attachment["blocks"] = self.blocks
        if self.fields:
            attachment["fields"] = self.fields
        return [attachment] if attachment else []
    
    @classmethod
    def message(cls, header: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create a message attachment"""
        fields = [{"title": k, "value": str(v), "short": True} for k, v in params.items()]
        attachment = cls()
        attachment.fields = fields
        attachment.blocks = [Block.header(header)]
        return attachment.get_attachment()


class SlackAlert:
    """Slack alert sender (mock implementation for local)"""
    
    def __init__(self, slack_token: str, slack_user_name: str = "Darwin", slack_channel: str = "#darwin"):
        self.slack_token = slack_token
        self.slack_user_name = slack_user_name
        self.slack_channel = slack_channel
        self.thread_id: Optional[str] = None
        logger.info(f"SlackAlert initialized for channel {slack_channel} (mock mode)")
    
    def post_message(self, text: str = "", attachments: Optional[List[Dict[str, Any]]] = None) -> Optional[str]:
        """Post a message to Slack (mock implementation)"""
        logger.info(f"Mock Slack Alert to {self.slack_channel}: {text}")
        if attachments:
            logger.info(f"  Attachments: {attachments}")
        if self.thread_id:
            logger.info(f"  Thread ID: {self.thread_id}")
        # Return a mock thread ID
        return "mock_thread_id_12345"

