import aiohttp
import asyncio
import logging
from typing import Optional, List

from airflow_core.constants.constants import SLACK_TOKEN, SLACK_API_URL


class SlackNotifier:
    """
    SlackNotifier is a class that sends messages to Slack.
    """
    def __init__(self):
        self.slack_token = SLACK_TOKEN
        self.logger = logging.getLogger(__name__)
        self.session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create the aiohttp session."""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session

    async def close(self):
        """Close the aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()

    async def send_message(self, channel: str, text: str, attachments=None):
        """
        Send a message to a Slack channel.
        """
        url = f"{SLACK_API_URL}chat.postMessage"
        headers = {
            "Authorization": f"Bearer {self.slack_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "channel": channel,
            "text": text,
            "attachments": attachments if attachments else [],
        }

        session = await self._get_session()
        async with session.post(url, headers=headers, json=payload) as response:
            if response.status != 200:
                self.logger.error(
                    f"Failed to send Slack message: {await response.text()}"
                )
            return await response.json()

    async def get_user_id_by_email(self, email: str):
        """
        Get the Slack user ID by email.
        """
        url = f"{SLACK_API_URL}users.lookupByEmail"
        headers = {
            "Authorization": f"Bearer {self.slack_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        params = {"email": email}

        session = await self._get_session()
        async with session.get(url, headers=headers, params=params) as response:
            data = await response.json()
            if data.get("ok"):
                return data["user"]["id"]
            else:
                self.logger.error(
                    f"Failed to get Slack user ID for {email}: {data.get('error')}"
                )
            return None

    
    async def notify_workflow_task_event(self, user_email, channels, workflow_id: str, dag_id: str, run_id: str, task_id: str, state: str):
        """
        Notify a workflow task event.
        """
        color_map = {
            "running": "#36a64f",
            "skipped": "#ffcc00",
            "success": "#2eb886",
            "failed": "#ff0000"
        }

        user_id = await self.get_user_id_by_email(user_email) if user_email else None
        
        mention = f"<@{user_id}>" if user_id else user_email
        message = f":zap: *Workflow Run Update* {mention} :zap:"

        fields = [
            {"type": "mrkdwn", "text": f"*Workflow ID:* `{workflow_id}`"},
            {"type": "mrkdwn", "text": f"*Dag ID:* `{dag_id}`"},
            {"type": "mrkdwn", "text": f"*Run ID:* `{run_id}`"},
            {"type": "mrkdwn", "text": f"*State:* `{state}`"},
            {"type": "mrkdwn", "text": f"*Task ID:* `{task_id}`"},
        ]

        attachment = [
            {
                "fallback": message,
                "color": color_map.get(state, "#cccccc"),
                "blocks": [
                    {"type": "divider"},
                    {
                        "type": "section",
                        "fields": fields,
                    },
                ],
            }
        ]
        tasks = []
        if channels:
            for channel in channels:
                tasks.append(self.send_message(channel, message, attachments=attachment))
        else:
            self.logger.error("No channels provided for notification")

        if user_id:
            tasks.append(self.send_message(user_id, message, attachments=attachment))
        else:
            self.logger.error("Could not find Slack user for email %s", user_email)

        if tasks:
            await asyncio.gather(*tasks)