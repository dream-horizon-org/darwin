import aiohttp
import asyncio
import logging
from typing import List, Optional

# Base URL for Slack API
SLACK_API_URL = "https://slack.com/api/"


class SlackNotifier:
    def __init__(self, slack_token: str):
        """
        Initialize the SlackNotifier with a Slack token.

        :param slack_token: The token used to authenticate with the Slack API.
        """
        self.slack_token = slack_token
        self.logger = logging.getLogger(__name__)

    async def send_message(self, channel: str, text: str, attachments=None):
        """
        Send a message to a specific Slack channel.
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

        # Send an asynchronous POST request to the Slack API
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                if response.status != 200:
                    # Log an error if the message fails to send
                    self.logger.error(
                        f"Failed to send Slack message to {channel}: {await response.text()}"
                    )
                return await response.json()

    async def send_message_to_channels(self, channels: List[str], text: str, attachments=None):
        """
        Send a message to multiple Slack channels concurrently.
        """
        tasks = [
            self.send_message(channel, text, attachments)
            for channel in channels
        ]
        # Use asyncio.create_task to run all tasks concurrently
        for task in tasks:
            asyncio.create_task(task)

    async def get_user_id_by_email(self, email: str) -> Optional[str]:
        """
        Retrieve a Slack user ID based on their email address.
        """
        url = f"{SLACK_API_URL}users.lookupByEmail"
        headers = {
            "Authorization": f"Bearer {self.slack_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        params = {"email": email}

        # Send an asynchronous GET request to the Slack API with timeout
        timeout = aiohttp.ClientTimeout(total=3.0)  # 3 second timeout
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.get(url, headers=headers, params=params) as response:
                    data = await response.json()
                    if data.get("ok"):
                        # Return the user ID if the request is successful
                        return data["user"]["id"]
                    else:
                        # Log an error if the user lookup fails
                        self.logger.error(
                            f"Failed to get Slack user ID for {email}: {data.get('error')}"
                        )
                    return None
        except asyncio.TimeoutError:
            self.logger.warning(f"Timeout while looking up Slack user ID for {email}")
            return None
        except Exception as e:
            self.logger.error(f"Error while looking up Slack user ID for {email}: {e}")
            return None

    async def notify_workflow_event(
            self,
            user_email: str,
            channels_string: str,
            workflow_id: str,
            workflow_name: str,
            run_id: str,
            state: str,
            expected_run_duration: int = None,
            additional_fields: Optional[dict] = None,
    ):
        """
        Notify Slack channels and/or a user about a workflow event.
        """
        # Parse the comma-separated channels string into a list
        channels = [channel.strip() for channel in channels_string.split(",")]

        # Define color codes for different workflow states
        color_map = {
            "running": "#36a64f",
            "skipped": "#ffcc00",
            "success": "#2eb886",
            "failed": "#ff0000",
            "sla_exceeded": "#ff6600",
        }

        # Get the Slack user ID for the provided email
        user_id = await self.get_user_id_by_email(user_email)
        mention = f"<@{user_id}>" if user_id else user_email
        message = f":zap: *Workflow Run Update* {mention} :zap:"

        # Prepare the fields for the Slack message
        fields = [
            {"type": "mrkdwn", "text": f"*Workflow ID:* `{workflow_id}`"},
            {"type": "mrkdwn", "text": f"*Workflow Name:* `{workflow_name}`"},
            {"type": "mrkdwn", "text": f"*Run ID:* `{run_id}`"},
            {"type": "mrkdwn", "text": f"*State:* `{state}`"},
        ]

        # Add expected run duration if provided
        if expected_run_duration is not None:
            fields.append({"type": "mrkdwn", "text": f"*Expected Run Duration:* `{expected_run_duration} min`"})

        # Add additional fields from the key-value dictionary
        if additional_fields:
            for key, value in additional_fields.items():
                fields.append({"type": "mrkdwn", "text": f"*{key}:* `{value}`"})

        # Create the Slack message attachment
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

        # Notify all specified channels
        asyncio.create_task(self.send_message_to_channels(channels, message, attachments=attachment))

        # Notify the user directly if user_id is found
        if user_id:
            asyncio.create_task(
                self.send_message(user_id, message, attachments=attachment)
            )
        else:
            # Log an error if the user ID could not be found
            self.logger.error(f"Could not find Slack user for email {user_email}")
