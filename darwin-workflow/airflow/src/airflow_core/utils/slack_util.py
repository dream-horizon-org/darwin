import logging

import requests
from airflow.models import Variable
from workflow_core.utils.slack_alert_local import SlackAlert, Attachment, Block
import workflow_core.utils.slack_alert_local as slack_alert

from airflow_core.constants.constants import SLACK_TOKEN, SLACK_USERNAME
from airflow_core.utils.airflow_job_runner_utils import get_logs_url

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)


class SlackUtil:
    def __init__(self, notify_on: str, thread_id_key: str = None):
        self.slack = None
        self.notify_on = notify_on
        self.thread_id_key = thread_id_key

    def _post_message_to_slack_thread(
        self,
        attachments=None,
        message: str = "",
        error: str = "",
        thread_id: str = None,
    ) -> str:
        """
        :param attachments: The attachments to be sent to Slack
        :param message: The message to be sent to slack
        :param error: The error message to be sent to slack
        :param thread_id: The thread id of the slack message where the message should be sent
        :return: thread_id of the slack message
        """
        try:
            if self.notify_on:
                if self.slack is None:
                    self.slack = SlackAlert(
                        SLACK_TOKEN, SLACK_USERNAME, self.notify_on
                    )

                if thread_id:
                    self.slack.thread_id = thread_id

                if attachments:
                    return self.slack.post_message(
                        attachments=attachments, text=message
                    )

                if error:
                    return self.slack.post_message(text=error)

                if message:
                    return self.slack.post_message(text=message)

        except Exception as e:
            LOGGER.error(f"Error while sending slack message, {e}")
            return None

    def get_slack_user_id(self, user_email):
        """
        :param user_email: Email of the user
        :return: Slack user ID
        """
        try:
            if user_email is None:
                return None

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {SLACK_TOKEN}",
            }
            response = requests.get(
                "https://slack.com/api/users.lookupByEmail",
                params={"email": user_email},
                headers=headers,
            ).json()
            if not response["ok"]:
                raise Exception(response["error"])

            return response["user"]["id"]
        except Exception as e:
            LOGGER.error(f"Error while getting slack user id, {e}")
            return None

    def send_slack_message(self, attachments=None, message: str = "", error: str = ""):
        """
        :param attachments: The attachments to be sent to Slack
        :param message: The message to be sent to slack
        :param error: The error message to be sent to slack
        """
        try:
            thread_id = Variable.get(key=self.thread_id_key, default_var=None)
            response = self._post_message_to_slack_thread(
                attachments=attachments,
                message=message,
                error=error,
                thread_id=thread_id,
            )
            if thread_id is None:
                Variable.set(key=self.thread_id_key, value=response)
        except Exception as e:
            LOGGER.error(f"Error while getting slack thread id, {e}")

    def send_error_message_on_slack(
        self,
        error_message: str,
        task_id: str,
        dag_id: str,
        run_id: str,
        try_number: int,
        user_email: str,
    ):
        """
        :param error_message: The message to be sent to slack
        :param task_id: The ID of the task in the workflow.
        :param dag_id: The DAG ID of the workflow.
        :param run_id: A unique ID for this job.
        :param try_number: The number of times the task has been retried
        :param user_email: The email of the user
        :return:
        """
        try:
            user_id = self.get_slack_user_id(user_email)
            attachment = Attachment(error=True)
            if user_id is not None:
                slack_username = f"<@{user_id}>"
            else:
                slack_username = None
            attachment.add_block(Block.header(":red_circle: Task Failed."))
            attachment.add_block(Block.divider())
            attachment.add_block(
                Block.section(
                    {
                        "Task": task_id,
                        "Dag": dag_id,
                        "Try Number": try_number,
                        "Log Url": get_logs_url(
                            dag_id=dag_id, task_id=task_id, run_id=run_id
                        ),
                        "Error Message": error_message,
                    }
                )
            )
            if slack_username:
                self.send_slack_message(
                    attachments=attachment.get_attachment(), message=slack_username
                )
            else:
                self.send_slack_message(attachments=attachment.get_attachment())

        except Exception as e:
            LOGGER.error(f"Error while sending slack error message, {e}")
            return None

    def notify_starting_workflow(
        self,
        workflow_name: str,
        cluster_id: str,
        entry_point_cmd: str,
        runtime_env: dict,
        run_id: str,
        task_id: str,
        try_number: int,
    ):
        """
        :param workflow_name: Name of the workflow
        :param cluster_id: Cluster identification of the cluster to use for job execution.
        :param entry_point_cmd: The shell command to run for this job.
        :param runtime_env: Additional runtime environment variables for the job (default: None).
        :param run_id: A unique ID for this job.
        :param task_id: The ID of the task in the workflow.
        :param try_number: Try number of the task
        :return:
        """
        try:
            params = {
                "cluster_id": cluster_id,
                "entry_point_cmd": entry_point_cmd,
                "runtime_env": runtime_env,
                "run_id": run_id,
                "task_name": task_id,
                "try_number": try_number,
            }
            att = Attachment.message(
                f"New run for the workflow {workflow_name} is triggered", params
            )
            self.send_slack_message(attachments=att)
            self.send_slack_message(
                message=f"Darwin UI link for viewing workflows : {get_logs_url(dag_id=workflow_name, task_id=task_id, run_id=run_id)}"
            )
            self.send_slack_message(message=f"starting cluster - {cluster_id}")
        except Exception as e:
            LOGGER.error(f"Error while notifying starting workflow, {e}")
