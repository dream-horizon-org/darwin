from __future__ import annotations

import os
import time
import traceback
from datetime import datetime
from typing import Any, Dict, Sequence, Optional, List
import json

import requests
from airflow.exceptions import AirflowException
from airflow.utils.context import Context
from operators.workflow_operator import WorkflowOperator

from airflow_core.constants.configs import Config
from airflow_core.utils.airflow_job_runner_utils import get_env, api_request
from airflow_core.jobs.airflow_job_runner import AirflowJobRunner
from airflow_core.constants.constants import ENV

# TODO: DarwinOperator extends WorkflowOperator but pre_execute/post_execute are commented out in execute() - clarify lifecycle
# TODO: Default timeouts (12000s for cluster, 360000s for job) are very long - should be environment-configurable
class DarwinOperator(WorkflowOperator):
    '''
    Submit and monitor a Darwin job workload.

    :param cluster_id: Cluster identification of the cluster to use for job execution
    :param entry_point_cmd: The shell command to run for this job
    :param cluster_type: Type of cluster to use for job execution (default: "job")
    :param time_out_in_sec_for_cluster: Waiting time for the cluster setup (default: 12000 seconds)
    :param time_out_in_sec_for_job: Waiting time for job completion (default: 360000 seconds)
    :param wait_time_for_shutdown_in_sec: Time to wait before shutting down the cluster (default: 600 seconds)
    :param runtime_env: Additional runtime environment variables for the job (default: None)
    :param notify_on: Slack notification settings (default: uses DEFAULT_SLACK_CHANNEL env var or "workflow-alerts")
    :param default_params: Default parameters for the task (default: None)
    :param runtime_params: Runtime parameters for the task (default: None)
    :param workflow_params: Workflow parameters for the task (default: None)
    :param user_email: Email of the user (default: None)
    :param kill_cluster: Whether to kill the cluster after job completion (default: True)
    '''

    template_fields: Sequence[str] = (
        'cluster_id',
        'entry_point_cmd',
        'cluster_type',
        'runtime_env',
        'default_params',
        'runtime_params',
        'workflow_params',
        'user_email',
    )

    def __init__(
        self,
        *,
        cluster_id: str,
        entry_point_cmd: str,
        cluster_type: str = "job",
        time_out_in_sec_for_cluster: int = 12000,
        time_out_in_sec_for_job: int = 360000,
        wait_time_for_shutdown_in_sec: int = 600,
        runtime_env: Dict[str, Any] | None = None,
        notify_on: str | None = None,
        default_params: str | None = None,
        runtime_params: str | None = None,
        workflow_params: Dict[str, Any] | None = None,
        user_email: str | None = None,
        kill_cluster: bool = True,
        packages : Optional[List[Dict]] = [],
        ha_config: Optional[Dict[str, Any]] =None,
        **kwargs,
    ) -> None:
        super().__init__(**kwargs)
        self.env = get_env()
        self.config = Config(self.env)
        self.workflow_host = self.config.get_app_layer.rstrip('/') + '/v3/task_run'
        self.cluster_id = cluster_id
        self.entry_point_cmd = entry_point_cmd
        self.cluster_type = cluster_type
        self.time_out_in_sec_for_cluster = time_out_in_sec_for_cluster
        self.time_out_in_sec_for_job = time_out_in_sec_for_job
        self.wait_time_for_shutdown_in_sec = wait_time_for_shutdown_in_sec
        self.runtime_env = runtime_env or {}
        # Use environment variable for default Slack channel if notify_on is not provided
        self.notify_on = notify_on if notify_on is not None else os.getenv('DEFAULT_SLACK_CHANNEL', 'workflow-alerts')
        self.default_params = default_params
        self.runtime_params = runtime_params
        self.workflow_params = workflow_params or {}
        self.user_email = user_email
        self.kill_cluster = kill_cluster
        self._run_url_sent = False

    def execute_main(self, context: Context) -> dict:
        """
        Execute the Darwin job using the AirflowJobRunner.
        """
        try:
            # Initialize the job runner
            job_runner = AirflowJobRunner(self.env)
            
            # Get context information
            dag_id = context["dag"].dag_id
            task_id = context["task"].task_id
            run_id = context["run_id"]

            #TODO: Add event publishing logic in workflow operator
            # Execute the job using run_job_till_completion
            result = job_runner.run_job_till_completion(
                cluster_id=self.cluster_id,
                entry_point_cmd=self.entry_point_cmd,
                cluster_type=self.cluster_type,
                run_id=run_id,
                dag_id=dag_id,
                task_id=task_id,
                time_out_in_sec_for_cluster=self.time_out_in_sec_for_cluster,
                time_out_in_sec_for_job=self.time_out_in_sec_for_job,
                wait_time_for_shutdown_in_sec=self.wait_time_for_shutdown_in_sec,
                runtime_env=self.runtime_env,
                notify_on=self.notify_on,
                default_params=self.default_params,
                runtime_params=self.runtime_params,
                workflow_params=self.workflow_params,
                user_email=self.user_email,
                kill_cluster=self.kill_cluster,
                packages=self.packages,
                ha_config=self.ha_config,
                ti=context["task_instance"],  # TaskInstance
                task_instance=context["task_instance"],  # Alternative name for ti
                dag_run=context["dag_run"],  # DagRun object
                dag=context["dag"],  # DAG object
            )
            
            self.log.info('Darwin job completed successfully')
            self.status = "SUCCESS"
            return result

        except Exception as e:
            tb_str = traceback.format_exc()
            self.log.error("Exception occurred: %s", str(e))
            self.log.error("Traceback: %s", tb_str)
            self.status = "FAILED"
            self.log.error("Failed to execute Darwin job with task_id: %s, dag_id: %s, run_id: %s",
                           context["task"].task_id, context["dag"].dag_id, context["run_id"])
            
            raise AirflowException(f'Darwin job failed: {str(e)}')
