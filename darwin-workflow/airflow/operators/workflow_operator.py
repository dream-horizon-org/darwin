from datetime import datetime

import requests
from airflow.models import BaseOperator
from airflow.utils.context import Context
from typing import Any, Optional

from airflow_core.constants.configs import Config
from airflow_core.utils.airflow_job_runner_utils import get_env, api_request

class WorkflowOperator(BaseOperator):
    """
    Base operator that wraps pre- and post-execution logic around `execute_main`.

    Subclasses should override `execute_main`, NOT `execute`.
    `execute()` is already implemented to call pre_execute → execute_main → post_execute.
    """
    workflow_name: Optional[str]
    run_id: Optional[str]
    task_name: Optional[str]
    _start_time: Optional[Any]
    task_run: Optional[Any]
    workflow_task_run_update_url: Optional[str]
    status: str

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.workflow_name = None
        self.workflow_id = None
        self.run_id = None
        self.task_name = None
        self._start_time = None
        self.task_run = None
        self.env = get_env()
        self.config = Config(self.env)
        self.workflow_task_run_update_url = self.config.get_app_layer.rstrip('/') + '/v3/task_run'
        self.status = "RUNNING"

    def pre_execute(self, context: Context) -> None:
        self.log.info(f"pre execute called")
        self.workflow_name = context["dag"].dag_id
        self.run_id = context["run_id"]
        self.task_name = context["task"].task_id
        self._start_time = datetime.utcnow()
        workflow_data = self.get_workflow_by_name_v3(self.workflow_name)
        if not workflow_data:
            raise Exception(f"Workflow {self.workflow_name} not found")

        self.workflow_id = workflow_data["data"]["workflow_id"]
        # Get retry attempt from Airflow context
        retry_attempt = context["task_instance"].try_number
        payload = {
            "workflow_id": self.workflow_id,
            "run_id": self.run_id,
            "task_name": self.task_name,
            "start_time": self._start_time.isoformat(),
            "run_status": self.status,
            "attempt": retry_attempt
        }
        self.log.info(f"Payload for workflow start: {payload}")
        response = api_request("POST", self.workflow_task_run_update_url, data=payload)
        # Log the response
        self.log.info(f"Workflow response: {response}")

    def execute_main(self, context: Context) -> Any:
        raise NotImplementedError("Subclasses must implement `execute_main`.")

    def post_execute(self, context: Context) -> None:
        self.log.info(f"post execute called")
        end_time = datetime.utcnow()
        duration = int((end_time - self._start_time).total_seconds())
        
        # Get retry attempt from Airflow context
        retry_attempt = context["task_instance"].try_number

        payload = {
            "workflow_id": self.workflow_id,
            "run_id": self.run_id,
            "task_name": self.task_name,
            "end_time": end_time.isoformat(),
            "duration": duration,
            "run_status": self.status,
            "attempt": retry_attempt
        }
        self.log.info(f"Payload for workflow start: {payload}")
        response = api_request("PUT", self.workflow_task_run_update_url, data=payload)
        self.log.info(f"Workflow response: {response}")

    # TODO: pre_execute and post_execute are commented out - either enable or remove the methods entirely
    # TODO: If pre/post execute are needed, use Airflow's native callbacks instead of manual implementation
    def execute(self, context: Context) -> Any:
        self.log.info(f"execute called")
        # self.pre_execute(context)
        result = self.execute_main(context)
        # self.post_execute(context)
        return result

    def get_workflow_by_name_v3(self, workflow_name: str, headers: dict = None):
        """
        V3 version of get_workflow_by_name that calls V3 API directly.
        """
        self.log.info(f"Calling V3 API to get workflow by name: {workflow_name}")
        # Use the configured workflow app layer URL instead of hardcoded URL
        base_url = self.config.get_app_layer.rstrip('/')
        response = api_request(
            "GET",
            f"{base_url}/v3/workflow/name/{workflow_name}",
            headers=headers,
        )
        self.log.info(f"V3 API response for workflow {workflow_name}: {response}")
        return response