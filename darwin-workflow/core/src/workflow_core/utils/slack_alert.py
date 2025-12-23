import logging

from workflow_core.utils.slack_alert_local import SlackAlert, Attachment, Block
from workflow_core.constants.constants import DARWIN_DEFAULT_CHANNEL, SLACK_USERNAME

LOGGER = logging.getLogger(__name__)


class WorkflowSlackNotifier:
    def __init__(self, slack_token: str, slack_channel: str = DARWIN_DEFAULT_CHANNEL,
                 slack_user_name: str = SLACK_USERNAME):
        self.slack = SlackAlert(slack_token, slack_user_name, slack_channel)

    def send_alert(self, message: str = ""):
        try:
            self.slack.post_message(text=message)
        except Exception as e:
            LOGGER.error(f'Error while sending slack message, {e}')

    def send_alert_with_attachment(self, header: str, params: dict, message: str = ""):
        try:
            attachments = Attachment.message(header, params)
            self.slack.post_message(attachments=attachments, text=message)
        except Exception as e:
            LOGGER.error(f'Error while sending slack message, {e}')
