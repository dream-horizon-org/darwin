from __future__ import annotations

import asyncio
import json
import random
import time
import traceback
import threading
from enum import Enum
from typing import Optional, List, Dict
from datetime import datetime, timezone, timedelta
import requests
from typeguard import typechecked
from airflow.exceptions import AirflowException, AirflowSkipException
from airflow_core.constants.constants import (
    ENV,
    ENV_TYPE,
    JOB,
    NUM_HA_CLUSTERS,
    DEFAULT_SLACK_CHANNEL,
)
from airflow_core.constants.configs import Config
from airflow_core.entity.cluster_entities import PackageStatus
from airflow_core.entity.events_entities import WorkflowState
from airflow_core.entity.job_entity import JobStatus
from airflow_core.error.errors import ClusterCreationFailed
from airflow_core.jobs.job_runner_interface import JobRunnerInterface
from airflow.models import TaskInstance, DagRun, Variable
from airflow.utils.state import State
from airflow_core.utils.airflow_job_runner_utils import (
    get_base_folder_path,
    get_workflow_by_name,
    api_request,
    create_workflow_event,
    get_metadata,
    publish_event,
    get_thread_id_key,
    set_cluster_id_key,
    get_updated_entry_point_cmd,
    get_updated_parameters,
    update_cluster_details_in_workflow,
    get_workflow_task_details,
    fetch_cluster_events,
    get_cluster_id_key_for_task,
    get_installed_package_status,
    get_package_name_by_id,
    get_workflow_run_status,
    get_workflow_run_details_by_dag_id
)
from airflow_core.utils.cluster_utils import ClusterUtils, ClusterStatus
from airflow_core.utils.commuter_utils import CommuterUtils
from airflow_core.utils.logging_util import LoggingUtil
from airflow_core.utils.slack_util import SlackUtil
from airflow_core.utils.slack_notifier import SlackNotifier

logging_util = LoggingUtil()
LOGGER = logging_util.get_logger()

AIRFLOW_FINISHED_STATES = {
    State.SUCCESS,
    State.FAILED,
    State.SKIPPED,
    State.UPSTREAM_FAILED
}

PRE_EXECUTE_TASK_ID = "pre_execute"
POST_EXECUTE_TASK_ID = "post_execute"

def append_parameter_to_entry_point_cmd(entry_point_cmd: str, parameters: str):
    if entry_point_cmd.startswith("papermill"):
        return entry_point_cmd + " " + parameters
    else:
        return entry_point_cmd + " --colors=NoColor -- " + parameters

def terminate(kill_cluster_flag, **kwargs):
    """
        determines whether to terminate the cluster.
        - Uses kill_cluster_flag as default
        - If siblings are provided, checks via REST API if any are still running
        """
    siblings = kwargs.get('siblings', None)
    cluster_parent = kwargs.get('cluster_parent', None)
    if kill_cluster_flag and cluster_parent is None:
        return True
    if kill_cluster_flag and siblings is None:
        return True
    elif not kill_cluster_flag:
        return False
    elif siblings is not None:
        dag_run = kwargs["dag_run"]
        dag = kwargs.get('dag')
        for sibling in siblings:
            sibling_task = dag.get_task(sibling)
            sibling_ti = TaskInstance(task=sibling_task, execution_date=dag_run.execution_date)
            sibling_ti.refresh_from_db()
            sibling_state = sibling_ti.state
            if sibling_state not in AIRFLOW_FINISHED_STATES:
                LOGGER.info(f"[terminate] ⏳ Sibling '{sibling}' still in state: {sibling_state}")
                return False
        return True
    else:
        return kill_cluster_flag


@typechecked
class AirflowJobRunner(JobRunnerInterface):
    """
    Implementation of JobRunner using ray job submit APIs
     This is mainly created to avoid circular dependencies between compute and darwin-deployer.
     In all the other cases, we can directly use compute SDK
     Usage:
         from darwin_deployer.jobs.job_runner_impl import ApiBackedJobRunner
         sdk = DarwinJobRunner("prod")
    """

    def __init__(self, env: ENV_TYPE):
        """
        :param env: String representing the environment or domain.
                    Valid values for env are ["prod", "stag", "test", "local"]
        """
        self.notify_on = None
        self.head_node_ip = ""
        self._config = Config(env)
        self.AIRFLOW_URL = self._config.get_airflow_url
        self.DARWIN_URL = self._config.get_darwin_url
        self.commuter_utils = CommuterUtils(env)
        self.slack = None
        self.thread_id_key = None
        self.user_email = None
        self.env = env
        self.dag_id = ""
        self.workflow_id = ""
        self.task_id = ""
        self.run_id = ""
        self.job_id = ""
        self.try_number = 1
        self.cluster_id = ""
        self.BASE_PATH_LOG = None
        self.slack_notifier = SlackNotifier()

    def submit_job(
        self,
        entry_point_cmd: str,
        task_id: str,
        dag_id: str,
        run_id: str,
        try_number: int,
        runtime_env=None,
    ):
        """
        :param entry_point_cmd:The shell command to run for this job.
        :param task_id: The ID of the task in the workflow.
        :param dag_id: The DAG ID of the workflow.
        :param run_id: A unique ID for this job.
        :param runtime_env:The directory in which job should run
        :param try_number: The number of times the task has been retried
        :return: The submission ID of the submitted job
        """
        resp = None
        if runtime_env is None:
            runtime_env = {}
        try:
            LOGGER.info(f"entry_point_cmd: {entry_point_cmd}")
            LOGGER.info(f"runtime_env: {runtime_env}")
            LOGGER.info(f"self.head_node_ip: {self.head_node_ip}")
            LOGGER.info(f"Url of api jobs - {self.head_node_ip}/api/jobs/")
            data = {
                "entrypoint": entry_point_cmd,
                "runtime_env": runtime_env,
            }
            resp = api_request(
                method="POST",
                url=f"{self.head_node_ip}/api/jobs/",
                data=data,
            )
            job_id = resp["job_id"]
            LOGGER.info(f"The job ID is {job_id}")
            return job_id
        except Exception as e:
            LOGGER.error(f"Error while submitting job, {resp.text}")
            raise e

    def get_status(self, job_id: str, time_out_in_sec_for_job: int = 18000):
        """
        :param job_id:The job ID or submission ID of the job whose status is being requested
        :param time_out_in_sec_for_job: Waiting time for job running
        :return: Status of the submitted job.
        """
        try:
            start = time.time()
            url = f"{self.head_node_ip}/api/jobs/{job_id}"
            LOGGER.info(f"You can track the progress with :: {url}")
            # self.send_slack_message(message=f'You can track the progress with :: {url}/logs')
            # Initialize exception counter
            exception_count = 0

            while time.time() - start <= time_out_in_sec_for_job:
                try:
                    resp = requests.get(url)
                    resp.raise_for_status()  # Raise exception for non-2xx responses
                    rst = json.loads(resp.text)
                    status = rst["status"]
                    LOGGER.info(f"status of the job with job id {job_id} is {status}")
                    if status == JobStatus.RUNNING:
                        self.dump_logs_to_file(job_id)
                    if status in {
                        JobStatus.SUCCEEDED,
                        JobStatus.STOPPED,
                        JobStatus.FAILED,
                    }:
                        self.dump_logs_to_file(job_id)
                        return status
                except Exception as e:
                    if 400 <= resp.status_code < 500:
                        raise Exception(
                            f"Cluster is either terminated or head node might have been restarted. Aborting the run"
                        )

                    # Increment the exception counter
                    exception_count += 1
                    LOGGER.warning(f"Exception occurred: {e}")
                    if exception_count > 60:
                        raise Exception(
                            "Failed to retrieve the status of the job. Aborting the run"
                        )
                time.sleep(12)
            return "TIMED_OUT"
        except Exception as e:
            self.slack.send_slack_message(
                message=f"Error while getting status of job, {e}"
            )
            raise e

    def get_logs(self, job_id: str):
        """
        :param job_id: The job ID or submission ID of the job whose logs are being requested
        :return: A string containing the full logs of the job.
        """
        try:
            resp = requests.get(f"{self.head_node_ip}/api/jobs/{job_id}/logs")
            rst = json.loads(resp.text)
            logs = rst["logs"]
            return logs
        except Exception as e:
            LOGGER.error(f"Error while getting logs of job, {e}")
            self.slack.send_slack_message(
                message=f"Error while getting logs of job, {e}"
            )
            raise e

    def get_env_setup_logs(self, job_id: str):
        try:
            resp = api_request("GET", f"{self.head_node_ip}/api/jobs/{job_id}")
            return resp
        except Exception as e:
            LOGGER.error(f"Error while getting env setup logs of job, {e}")
            self.slack.send_slack_message(
                message=f"Error while getting logs of job, {e}"
            )

    def list_all_jobs(self, filter_func=None):
        """
        :param filter_func:
        :return:
        """
        resp = requests.get(f"{self.head_node_ip}/api/jobs/")
        if not 200 <= resp.status_code < 300:
            raise Exception(f"Error while listing all jobs, {resp.text}")
        all_jobs = resp.json()
        if filter is not None:
            return list(filter(filter_func, all_jobs))
        return all_jobs

    def get_all_job_details(self, job_id: str):
        """
        :param job_id:A unique ID for this job.
        :return:
        """
        try:
            return self.list_all_jobs(lambda x: x["submission_id"] == job_id)
        except Exception as e:
            return [{"status": "Failed to fetch final status", "message": str(e)}]

    def list_failed_jobs(self):
        try:
            return self.list_all_jobs(lambda x: x["status"] == JobStatus.FAILED)
        except Exception as e:
            raise e

    def list_running_jobs(self):
        try:
            return self.list_all_jobs(lambda x: x["status"] == JobStatus.RUNNING)
        except Exception as e:
            LOGGER.error(f"Error while listing running jobs, {e}")

    def dump_logs_to_file(
        self,
        job_id: Optional[str] = None,
        logs: Optional[str] = None,
        log_type: str = "application",
        mode: str = "w",
    ):
        """
        Dump logs to a file.
        :param job_id: A unique ID for this job.
        :param logs: Logs content to dump. If None, it fetches logs using self.get_logs(job_id).
        :param log_type: Type of logs to dump (e.g., "application", "error").
        :param mode: Mode to open the file (e.g., "w", "a").
        :return: Path to the log file
        """
        try:
            if logs is None:
                logs = self.get_logs(job_id)

            if log_type not in ["application", "error"]:
                raise ValueError(
                    "Invalid log_type. It should be 'application' or 'error'."
                )

            output_path = self.BASE_PATH_LOG + f"/{log_type}.log"

            # Write logs to the file only if it does not exist
            with open(output_path, mode) as file:
                file.write(logs)

            # Also print logs to Airflow logger so they appear in the Airflow UI
            if log_type == "application" and logs:
                LOGGER.info("=" * 60)
                LOGGER.info("RAY JOB OUTPUT (application.log):")
                LOGGER.info("=" * 60)
                for line in logs.strip().split('\n'):
                    LOGGER.info(line)
                LOGGER.info("=" * 60)

            return output_path
        except Exception as e:
            self.slack.send_slack_message(
                message=f"Error while dumping logs to file, {e}"
            )
            raise e

    def initialize_job_run(
        self,
        dag_id: str,
        task_id: str,
        run_id: str,
        notify_on: str = None,
        user_email: str = "sdk",
        cluster_type: str = "job",
        **kwargs,
    ):
        """
        Initialize the job run by publishing a 'WORKFLOW_TASK_START_REQUESTED' event for the workflow.

        :param dag_id: The DAG ID of the workflow.
        :param task_id: The ID of the task in the workflow.
        :param run_id: A unique ID for this job.
        :param notify_on: Slack notification settings (default: uses DEFAULT_SLACK_CHANNEL constant).
        :param user_email: Email of the user (default: "sdk").
        :param cluster_type: Type of cluster to use for job execution (default: "job").
        :param kwargs: Additional keyword arguments.

        :return: A tuple containing the workflow ID and the try number.
        """
        ti = kwargs["ti"]
        try_number = ti.try_number
        # Use DEFAULT_SLACK_CHANNEL if notify_on is not provided
        self.notify_on = notify_on if notify_on is not None else DEFAULT_SLACK_CHANNEL
        self.thread_id_key = get_thread_id_key(dag_id, task_id, run_id)
        self.user_email = user_email
        self.dag_id = dag_id
        self.task_id = task_id
        self.run_id = run_id
        self.try_number = try_number
        self.slack = SlackUtil(
            notify_on=DEFAULT_SLACK_CHANNEL, thread_id_key=self.thread_id_key
        )
        self.BASE_PATH_LOG = get_base_folder_path(
            workflow_name=dag_id,
            run_id=run_id,
            task_id=task_id,
            retry_number=try_number,
        )
        logging_util.configure_logger(
            file_path=self.BASE_PATH_LOG + "/system.log",
            format="%(asctime)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        LOGGER.info(f"cluster_type: {cluster_type}")

    def get_workflow_cluster_id(
        self,
        user_email: str,
        cluster_type: str,
        cluster_id: str,
        workflow_id: str,
        **kwargs
    ):

        """
        Retrieves or creates a cluster for the given workflow.

        :param user_email: User's email
        :param cluster_type: Type of the cluster (e.g., job)
        :param cluster_id: Initial cluster ID
        :param workflow_id: Workflow ID
        :return: Tuple of cluster_id and HA (High Availability) enabled status
        """
        compute_utils = ClusterUtils(self.env, user_email)
        workflow_task_details = get_workflow_task_details(
            workflow_id=workflow_id, task_id=self.task_id, env=self.env
        )
        packages = workflow_task_details.get("packages")
        LOGGER.info(f"Workflow task details: {workflow_task_details}")

        ha_enabled = False
        ha_config = workflow_task_details.get("ha_config")

        # Check if High Availability (HA) is enabled
        if ha_config and ha_config.get("enable_ha"):
            ha_enabled = True
            active_clusters = [
                cluster_id
                for cluster_id in ha_config.get("cluster_ids", [])
                if compute_utils.get_cluster_status(cluster_id) == ClusterStatus.ACTIVE
            ]

            if active_clusters:
                cluster_id = random.choice(active_clusters)
            else:
                ha_clusters = ha_config.get("cluster_ids", [])
                cluster_id = random.choice(ha_clusters)
                LOGGER.info(
                    f"No active clusters available. Please check status of {cluster_id}"
                )

        # If not HA, attempt to create a cluster if it's a job cluster
        elif cluster_type == "job":
            cluster_parent = kwargs.get('cluster_parent', None)
            if cluster_parent is not None:
                parent_cluster_id = get_cluster_id_key_for_task(self.dag_id, cluster_parent, self.run_id)
                if parent_cluster_id is None:
                    cluster_id, packages = self.create_job_cluster(compute_utils, cluster_id, user_email, packages)
                else:
                    cluster_id = parent_cluster_id
            else:
                cluster_id, packages = self.create_job_cluster(compute_utils, cluster_id, user_email, packages)

        # Update cluster details in the workflow (non-blocking - failures are logged but don't stop execution)
        try:
            update_cluster_details_in_workflow(
                dag_id=self.dag_id,
                task_id=self.task_id,
                job_id=self.run_id,
                cluster_id=cluster_id,
                env=self.env,
                try_number=self.try_number,
            )
        except Exception as e:
            # Log the error but don't fail the workflow - cluster details update is metadata only
            LOGGER.warning(
                f"⚠️  Failed to update cluster details in workflow (non-critical): {str(e)}. "
                f"Workflow execution will continue."
            )

        return cluster_id, ha_enabled, packages

    def create_job_cluster(self, compute_utils, cluster_id, user_email, packages):
        try:
            cluster_id, packages = compute_utils.create_cluster_from_job_definition(
                cluster_id, user_email, self.try_number, packages
            )
            LOGGER.info(f"Job cluster created with cluster ID: {cluster_id}")
            self.send_workflow_event(
                WorkflowState.WORKFLOW_CLUSTER_CREATION_SUCCESS
            )
            return cluster_id, packages
        except ClusterCreationFailed as e:
            LOGGER.error(f"Failed to create cluster: {e}")
            self.send_workflow_event(WorkflowState.WORKFLOW_CLUSTER_CREATION_FAILED)
            raise e
        except Exception as e:
            LOGGER.error(f"Error updating cluster details in Elasticsearch: {e}")
            resp = compute_utils.stop_cluster(cluster_id)
            LOGGER.info(f"Cluster shutdown response: {resp}")
            raise e

    def get_job_submit_details(
        self,
        entry_point_cmd: str,
        default_params: str,
        runtime_params: str,
        cluster_id: str,
        cluster_type: str,
        workflow_params: dict = None,
        **kwargs,
    ):
        """
        :param entry_point_cmd: Entry point command
        :param default_params: Default parameters
        :param runtime_params: Runtime parameters
        :param cluster_id: Cluster id
        :param cluster_type: Cluster type
        :param workflow_params: Workflow parameters
        """
        updated_entry_point_cmd = get_updated_entry_point_cmd(
            entry_point_cmd=entry_point_cmd,
            dynamic_artifact=kwargs.get("dynamic_artifact"),
            source_type=kwargs.get("source_type"),
            source=kwargs.get("source"),
            file_path=kwargs.get("path"),
            try_number=self.try_number,
        )
        parameters = get_updated_parameters(
            runtime_params=runtime_params,
            default_params=default_params,
            workflow_params=workflow_params,
            updated_entry_point_cmd=updated_entry_point_cmd,
            dag_id=self.dag_id,
            run_id=self.run_id,
        )
        updated_entry_point_cmd = append_parameter_to_entry_point_cmd(updated_entry_point_cmd, parameters)
        cluster_id, ha_enabled, packages = self.get_workflow_cluster_id(
            workflow_id=self.workflow_id,
            cluster_id=cluster_id,
            user_email=self.user_email,
            cluster_type=cluster_type,
            **kwargs
        )
        self.cluster_id = cluster_id
        return updated_entry_point_cmd, cluster_id, ha_enabled, packages

    def start_workflow_cluster(
        self,
        dag_id: str,
        task_id: str,
        run_id: str,
        time_out_in_sec_for_cluster: int,
        cluster_id: str,
        updated_entry_point_cmd: str,
        runtime_env: dict = None,
    ):
        compute_utils = ClusterUtils(self.env, self.user_email)
        set_cluster_id_key(dag_id, task_id, run_id, cluster_id)
        self.slack.notify_starting_workflow(
            workflow_name=dag_id,
            task_id=task_id,
            run_id=run_id,
            cluster_id=cluster_id,
            entry_point_cmd=updated_entry_point_cmd,
            runtime_env=runtime_env,
            try_number=self.try_number,
        )
        self.send_workflow_event(WorkflowState.WORKFLOW_CLUSTER_START_REQUESTED)
        status, head_node_ip = compute_utils.start_cluster_and_wait(
            cluster_id, time_out_in_sec_for_cluster
        )
        self.head_node_ip = head_node_ip
        LOGGER.info(f"Ray Cluster Dashboard - {head_node_ip}/")

        if status.created():
            self.send_workflow_event(WorkflowState.WORKFLOW_CLUSTER_START_SUCCESS)
        else:
            self.send_workflow_event(WorkflowState.WORKFLOW_CLUSTER_START_FAILED)
            raise Exception("Cluster is not up. Aborting the run")

    def install_packages_in_cluster(
        self, cluster_type:str, cluster_id: str, packages: Optional[List[dict]] = None
    ):
        """Installs packages in the given cluster while handling installation status."""

        package_ids = []
        if not packages:
            LOGGER.warning(
                f"No packages provided for installation in cluster {cluster_id}"
            )
            return

        if cluster_type=="basic":
            for package in packages:
                compute_app_layer = self._config.get_compute_app_layer
                resp = api_request("POST",compute_app_layer+f"/{cluster_id}/library/install",data=package)
                package_ids.append(resp["data"]["id"])
        else:
            package_ids = [package.get("id") for package in packages if "id" in package]
            if not package_ids:
                LOGGER.warning(
                    f"Package list contains no valid IDs for cluster {cluster_id}"
                )
                return

        LOGGER.info(f"Installing packages in cluster {cluster_id}")
        LOGGER.info(f"Library IDs: {package_ids}")
        for package_id in package_ids:
            package_name = get_package_name_by_id(cluster_id=cluster_id,package_id=package_id)
            while True:
                status = get_installed_package_status(
                    cluster_id=cluster_id, package_id=package_id
                )
                if status in [PackageStatus.SUCCESS.value, PackageStatus.UNINSTALL_PENDING.value]:
                    LOGGER.info(
                        f"Package {package_name} is installed in cluster {cluster_id}"
                    )
                    break  # Move to the next library

                elif status == PackageStatus.FAILED.value:
                    raise Exception(
                        f"Package {package_name} installation failed in cluster {cluster_id}"
                    )

                elif status == PackageStatus.RUNNING.value:
                    LOGGER.info(
                        f"Package {package_name} installation in progress in cluster {cluster_id}"
                    )

                else:
                    LOGGER.warning(
                        f"Unexpected status {status} for package {package_name} in cluster {cluster_id}"
                    )

                # Wait before checking again
                time.sleep(10)

    def execute_job(
        self,
        entry_point_cmd: str,
        try_number: int,
        run_id: Optional[str] = None,
        runtime_env: dict = None,
        time_out_in_sec_for_job: int = 36000,
        notify_on: Optional[str] = None,
        dag_id: Optional[str] = None,
        task_id: Optional[str] = None,
    ):
        """
        Execute a job and track its progress until completion.

        :param entry_point_cmd: The shell command to run for this job.
        :param try_number: The number of times the task has been retried
        :param run_id: A unique ID for this job.
        :param runtime_env: Additional runtime environment variables for the job (default: None).
        :param time_out_in_sec_for_job: Waiting time for job completion (default: 36000 seconds).
        :param dag_id: The DAG ID of the workflow.
        :param task_id: The ID of the task in the workflow.
        :param notify_on: Slack notification channels (default: uses DEFAULT_SLACK_CHANNEL constant). It can be a comma-separated string of channels.
        :param notification_preferences: Notification preferences for the task (default: None).
        :return: A tuple containing job information, status, and message.
        """
        runtime_env = runtime_env or {}

        try:
            job_id = self.submit_job(
                entry_point_cmd=entry_point_cmd,
                dag_id=dag_id,
                task_id=task_id,
                run_id=run_id,
                try_number=try_number,
                runtime_env=runtime_env,
            )
            self.job_id = job_id
            self.send_workflow_event(WorkflowState.WORKFLOW_TASK_STARTED)
            status = self.get_status(job_id, time_out_in_sec_for_job)
            if status == JobStatus.FAILED:
                env_setup_logs = self.get_env_setup_logs(job_id)
                self.dump_logs_to_file(logs=env_setup_logs["message"], log_type="error")
                self.send_workflow_event(WorkflowState.WORKFLOW_TASK_FAILED)
                raise Exception(f"Job Failed with status {status}")

            self.send_workflow_event(WorkflowState.WORKFLOW_TASK_SUCCESS)
            if self.slack:
                self.slack.send_slack_message(
                    message=f"The final status for the job id {job_id} is {status}"
                )
            LOGGER.info(f"The final status for the job id {job_id} is {status}")

        except AirflowException as e:
            self.dump_logs_to_file(logs=str(e), log_type="error", mode="a")
            raise e

    def send_task_notification(self, state: str, notification_channels: list[str]) -> None:
        """
        Send task notification to Slack.
        """
        # Running in a separate thread to avoid "event loop is already running" error
        def send_notification():
            asyncio.run(self.slack_notifier.notify_workflow_task_event(
                user_email=self.user_email,
                channels=notification_channels,
                workflow_id=self.workflow_id,
                dag_id=self.dag_id,
                run_id=self.run_id,
                task_id=self.task_id,
                state=state
            ))

        thread = threading.Thread(target=send_notification)
        thread.start()
        thread.join(timeout=10)

    def run_job_till_completion(
        self,
        cluster_id: str,
        entry_point_cmd: str,
        cluster_type: str = Enum("job", "basic"),
        run_id: Optional[str] = None,
        dag_id: str = None,
        task_id: str = None,
        time_out_in_sec_for_cluster: int = 12000,
        time_out_in_sec_for_job: int = 360000,
        wait_time_for_shutdown_in_sec: int = 600,
        runtime_env: dict = None,
        notify_on: str = None,
        default_params: str = None,
        runtime_params: str = None,
        workflow_params: dict = None,
        user_email: str = None,
        notification_preferences: Optional[Dict[str, bool]] = None,
        trigger_rule: str = "all_success",
        **kwargs,
    ):
        """
        Run a job until its completion, including cluster setup and monitoring.

        :param cluster_id: Cluster identification of the cluster to use for job execution.
        :param entry_point_cmd: The shell command to run for this job.
        :param cluster_type: Type of cluster to use for job execution (default: "job").
        :param run_id: Airflow run id
        :param dag_id: The DAG ID of the workflow.
        :param task_id: The ID of the task in the workflow.
        :param time_out_in_sec_for_cluster: Waiting time for the cluster setup (default: 12000 seconds).
        :param time_out_in_sec_for_job: Waiting time for job completion (default: 36000 seconds).
        :param wait_time_for_shutdown_in_sec: Time to wait before shutting down the cluster (default: 600 seconds).
        :param runtime_env: Additional runtime environment variables for the job (default: None).
        :param notify_on: Slack notification settings (default: None).
        :param default_params: Default parameters for the task (default: None).
        :param runtime_params: Runtime parameters for the task (default: None).
        :param user_email: Slack user name to use when sending notifications (default: None).
        :param workflow_params: Workflow parameters for the task (default: None).
        :param user_email: Email of the user
        :param notification_preferences: Notification preferences for the task (default: None).
        :return: A tuple containing job information, status, and message.
        """
        resp = get_workflow_run_details_by_dag_id(dag_id, run_id)
        LOGGER.info(f"Workflow run status: {resp}")

        if not resp or "status" not in resp:
            raise AirflowException(f"Workflow run {run_id} not found or has no status.")

        if resp["status"] == "stopping":
            LOGGER.info(f"Workflow run {run_id} is stopping. Aborting the task.")
            raise AirflowException(f"Workflow run {run_id} is stopping. Aborting the task.")

        ha_enabled = False
        kill_cluster_flag = kwargs.get('kill_cluster', True)
        task_notify_on = kwargs.get('task_notify_on', "")
        task_notification_preference = kwargs.get('task_notification_preference', {})

        try:

            self.initialize_job_run(
                dag_id=dag_id,
                task_id=task_id,
                run_id=run_id,
                notify_on=notify_on,
                user_email=user_email,
                cluster_type=cluster_type,
                **kwargs,
            )

            # Check custom trigger rule before any expensive operations
            if not self._evaluate_trigger_rule(trigger_rule, **kwargs):
                LOGGER.info(f"Task {self.task_id} skipped due to trigger rule: {trigger_rule}")
                kill_cluster_flag = False
                self._handle_skipped_task(trigger_rule, task_notify_on, task_notification_preference)

            LOGGER.info(f"Task {self.task_id} running due to trigger rule: {trigger_rule}")
            # Always use the notify_on from kwargs, which is set from WorkflowTaskRequest.notify_on
            self.send_workflow_event(WorkflowState.WORKFLOW_TASK_START_REQUESTED)
            updated_entry_point_cmd, cluster_id, ha_enabled, packages = (
                self.get_job_submit_details(
                    entry_point_cmd=entry_point_cmd,
                    default_params=default_params,
                    runtime_params=runtime_params,
                    cluster_id=cluster_id,
                    workflow_params=workflow_params,
                    cluster_type=cluster_type,
                    **kwargs,
                )
            )

            self.start_workflow_cluster(
                dag_id=dag_id,
                task_id=task_id,
                run_id=run_id,
                cluster_id=cluster_id,
                time_out_in_sec_for_cluster=time_out_in_sec_for_cluster,
                updated_entry_point_cmd=updated_entry_point_cmd,
                runtime_env=runtime_env,
            )

            self.install_packages_in_cluster(cluster_type=cluster_type, cluster_id=cluster_id, packages=packages)

            self.execute_job(entry_point_cmd=updated_entry_point_cmd, try_number=self.try_number,
                                        run_id=run_id, runtime_env=runtime_env,
                                        time_out_in_sec_for_job=time_out_in_sec_for_job, dag_id=dag_id,
                                        task_id=task_id)
        except AirflowSkipException as e:
            LOGGER.info(f"Task {self.task_id} skipped due to trigger rule: {trigger_rule}")
            raise e
        except Exception as e:
            tb_str = traceback.format_exc()
            LOGGER.error("Exception occurred: %s", str(e))
            LOGGER.error("Traceback: %s", tb_str)
            self.send_workflow_event(WorkflowState.WORKFLOW_TASK_FAILED)
            self.slack.send_error_message_on_slack(
                error_message=str(e),
                task_id=task_id,
                dag_id=dag_id,
                run_id=run_id,
                try_number=self.try_number,
                user_email=self.user_email,
            )
            LOGGER.info(f"Task Notification preference are {task_notification_preference}") # TODO: Remove this
            LOGGER.info(f"slack_notifier1: {self.slack_notifier}")
            LOGGER.info(f"task_notification_preference: {task_notification_preference}")
            LOGGER.info(f"on_fail value: {task_notification_preference.get('on_fail', False)}")
            LOGGER.info(f"bool value: {self.slack_notifier and bool(task_notification_preference.get('on_fail', False))}")
            if self.slack_notifier and bool(task_notification_preference.get("on_fail", False)):
                LOGGER.info("Sending failure notification to Slack")
                notification_channels = []

                LOGGER.info(f"task_notify_on value: {task_notify_on}")

                if isinstance(task_notify_on, str):
                    LOGGER.info(f"task_notify_on is a string: {task_notify_on}")
                    notification_channels = [channel.strip() for channel in task_notify_on.split(",")]
                    LOGGER.info(f"Notification channels: {notification_channels}")

                self.send_task_notification(state="failed", notification_channels=notification_channels)
            kill_cluster_flag = True
            raise e

        finally:
            if self.job_id:
                job_info = self.get_all_job_details(self.job_id)
                LOGGER.info(json.dumps(job_info, indent=4))
                self.slack.send_slack_message(
                    message=f"Job Info: {json.dumps(job_info, indent=4)}"
                )

                self.stop_job(self.job_id)
                self.delete_job(self.job_id)
            if terminate(kill_cluster_flag, **kwargs):
                LOGGER.info("Terminating the cluster...")
                self.stop_workflow_cluster(
                    cluster_id=cluster_id, cluster_type=cluster_type, ha_enabled=ha_enabled
                )
            else:
                LOGGER.info("cluster will be reused!")

            if ha_enabled:
                running_jobs = self.list_running_jobs()
                num_ha_active_clusters = self.get_num_ha_active_clusters()
                LOGGER.info("Number of active ha clusters: %s", num_ha_active_clusters)
                if not running_jobs and num_ha_active_clusters == NUM_HA_CLUSTERS:
                    self.restart_workflow_cluster(cluster_id=cluster_id)
                else:
                    LOGGER.info(
                        f"Jobs running on the cluster: {running_jobs}. Skipping restart."
                    )

    def _evaluate_trigger_rule(self, trigger_rule: str, **kwargs) -> bool:
        """
        Evaluate custom trigger rules
        """
        dag_run = kwargs.get("dag_run")
        task_instance = kwargs.get("task_instance") or kwargs.get("ti")
        current_task = task_instance.task
        LOGGER.info(f"Trigger rule: {trigger_rule}")
        # Get parent task instances
        parent_task_instances = []
        for parent_task in current_task.upstream_list:
            parent_ti = dag_run.get_task_instance(parent_task.task_id)
            if parent_ti:
                parent_task_instances.append(parent_ti)
            else:
                LOGGER.warning(f"Parent task {parent_task.task_id} not found in dag run")
        # Print parent task instances in a readable format
        for parent_task_instance in parent_task_instances: # TODO: Remove this after testing
            LOGGER.info(f"Parent task instance: {parent_task_instance.task_id} - {parent_task_instance.state}")

        if not parent_task_instances:
            return True  # No parents, always run

        # Helper sets for states
        failed_states = {"failed", "upstream_failed"}
        success_states = {"success"}
        skipped_states = {"skipped"}
        done_states = {"success", "failed", "skipped", "upstream_failed"}


        # check if the parent task is pre_execute or post_execute and if it is, then check if the parent task is in a failed state
        for parent_task_instance in parent_task_instances:
            if parent_task_instance.task_id in [PRE_EXECUTE_TASK_ID, POST_EXECUTE_TASK_ID] and parent_task_instance.state in failed_states:
                raise AirflowSkipException(f"Task {self.task_id} skipped due to trigger rule: {trigger_rule}")

        if trigger_rule == "all_success":
            # The task runs only when all upstream tasks have succeeded.
            return all(ti.state in success_states for ti in parent_task_instances)

        elif trigger_rule == "all_failed":
            # The task runs only when all upstream tasks are in a failed or upstream_failed state.
            return all(ti.state in failed_states for ti in parent_task_instances)

        elif trigger_rule == "all_done":
            # The task runs once all upstream tasks are done with their execution.
            return all(ti.state in done_states for ti in parent_task_instances)

        elif trigger_rule == "all_skipped":
            # The task runs only when all upstream tasks have been skipped.
            return all(ti.state in skipped_states for ti in parent_task_instances)

        elif trigger_rule == "one_failed":
            # The task runs when at least one upstream task has failed.
            return any(ti.state in failed_states for ti in parent_task_instances)

        elif trigger_rule == "one_success":
            # The task runs when at least one upstream task has succeeded.
            return any(ti.state in success_states for ti in parent_task_instances)

        elif trigger_rule == "none_failed":
            # The task runs only when all upstream tasks have not failed or upstream_failed.
            return not any(ti.state in failed_states for ti in parent_task_instances)

        elif trigger_rule == "none_failed_min_one_success":
            # The task runs only when all upstream tasks have not failed or upstream_failed, and at least one upstream task has succeeded.
            return all(ti.state not in failed_states for ti in parent_task_instances) and any(ti.state in success_states for ti in parent_task_instances)

        elif trigger_rule == "none_skipped":
            # The task runs only when no upstream task is in a skipped state.
            return not any(ti.state in skipped_states for ti in parent_task_instances)
        else:
            LOGGER.warning(f"Unknown trigger rule: {trigger_rule}, defaulting to all_success")
            return all(ti.state == "success" for ti in parent_task_instances)

    def _handle_skipped_task(self, trigger_rule: str, task_notify_on: str, task_notification_preference: dict) -> None:
        """
        Handle tasks that are skipped due to trigger rules
        """
        try:
            # Send appropriate workflow events
            self.send_workflow_event(WorkflowState.WORKFLOW_TASK_SKIPPED)

            if task_notification_preference.get("on_skip", False):
                self.send_task_notification(state="skipped", notification_channels=task_notify_on.split(","))

        except Exception as e:
            LOGGER.warning(f"Error in sending skipped task event or notification: {e}")

        LOGGER.info(f"Task {self.task_id} was skipped due to trigger rule evaluation")

        raise AirflowSkipException(f"Task {self.task_id} skipped due to trigger rule: {trigger_rule}")

    def stop_job(self, job_id: str):
        """
        Stops a job with the given job ID.
        :param job_id: Job identification of the job which needs to be stopped
        :return: Response from the stop job request
        """
        try:
            url = f"{self.head_node_ip}/api/jobs/{job_id}/stop"
            rst = api_request(method="POST", url=url)
            LOGGER.info(f"Job {job_id} stopped successfully")
            return rst
        except Exception as e:
            LOGGER.info(f"Error in stopping job {job_id}")

    def delete_job(self, job_id: str):
        """
        Deletes a job with the given job_id.
        :param job_id: Job identification of the job which needs to be deleted
        :return: The result of the DELETE request, or None in case of an error
        """
        try:
            url = f"{self.head_node_ip}/api/jobs/{job_id}"
            rst = api_request(method="DELETE", url=url)
            LOGGER.info(f"Job {job_id} deleted successfully")
            return rst
        except Exception as e:
            LOGGER.error(f"Error in deleting job {job_id}: {e}")
            return None

    def tail_job_logs(self, job_id: str):
        """
        :param job_id: Job identification of the job which needs to be deleted
        :return:
        """
        resp = requests.get(f"{self.head_node_ip}/api/jobs/{job_id}/logs/tail")
        rst = json.loads(resp.text)
        return rst

    def get_num_ha_active_clusters(self):
        """
        :param workflow_id: Workflow identification of the workflow
        :return: Number of HA clusters
        """
        compute_utils = ClusterUtils(self.env, self.user_email)
        workflow_task_details = get_workflow_task_details(
            workflow_id=self.workflow_id, task_id=self.task_id, env=self.env
        )
        LOGGER.info(f"Workflow task details: {workflow_task_details}")
        active_clusters = []
        ha_config = workflow_task_details.get("ha_config")
        if ha_config and ha_config.get("enable_ha"):
            active_clusters = [
                cluster_id
                for cluster_id in ha_config.get("cluster_ids", [])
                if compute_utils.get_cluster_status(cluster_id) == ClusterStatus.ACTIVE
            ]
        return len(active_clusters)


    def stop_workflow_cluster(
        self, cluster_id: str, cluster_type: str = JOB, ha_enabled: bool = False
    ):
        """
        :param cluster_id: Cluster identification of the cluster to stop
        :param cluster_type: Type of cluster to stop (default: "job")
        :param ha_enabled: Enable/Disable HA cluster setup (default: False)

        Stops the cluster associated with the workflow.
        """
        compute_utils = ClusterUtils(self.env, self.user_email)
        if cluster_type == JOB and not ha_enabled:
            resp = compute_utils.stop_cluster(cluster_id)
            LOGGER.info(f"Cluster shutdown response - {resp}")
            if resp["status"] == "SUCCESS":
                self.send_workflow_event(WorkflowState.WORKFLOW_CLUSTER_STOPPED)
            else:
                LOGGER.error("Workflow cluster stop failed")

    def restart_workflow_cluster(self, cluster_id: str):
        """
        Restarts the cluster associated with the workflow if it hasn't been restarted in the last 24 hours.

        :param cluster_id: Cluster identification of the cluster to stop.
        """
        try:
            resp = fetch_cluster_events(
                cluster_id=cluster_id,
                event_types=[
                    "CLUSTER_RESTART_REQUEST_RECEIVED",
                    "CLUSTER_START_REQUEST_RECEIVED",
                ],
            )

            if len(resp["data"]) == 0:
                LOGGER.info(
                    f"No cluster start or restart events found for cluster_id: {cluster_id}."
                )
                return

            last_restarted_timestamp = resp["data"][0]["timestamp"]
            last_restarted_time = datetime.fromisoformat(
                last_restarted_timestamp.rstrip("Z")
            ).replace(tzinfo=timezone.utc)
            LOGGER.info(f"Last restarted timestamp: {last_restarted_timestamp}")

            current_time = datetime.now(timezone.utc)
            time_diff = current_time - last_restarted_time

            # Restart the cluster if the last restart was more than 24 hours ago
            if time_diff > timedelta(hours=24):
                compute_utils = ClusterUtils(self.env, self.user_email)
                resp = compute_utils.restart_cluster(cluster_id)
                LOGGER.info(f"Cluster restart response - {resp}")
            else:
                LOGGER.info(
                    f"Cluster was restarted {time_diff.total_seconds() / 3600:.2f} hours ago. No restart needed."
                )

        except Exception as e:
            LOGGER.error(f"Failed to restart workflow cluster: {str(e)}")

    def send_workflow_event(self, state: WorkflowState):
        """
        :param state: State of the workflow

        Publishes a workflow event
        """
        try:
            if not self.workflow_id:
                try:
                    resp = get_workflow_by_name(self.dag_id, ENV)
                    self.workflow_id = resp["data"]["workflow_id"]
                except Exception as e:
                    LOGGER.error(f"Failed to get workflow_id for dag_id={self.dag_id}: {e}")
                    return  # Do not propagate the error
            event = create_workflow_event(
                entity_id=self.workflow_id,
                state=state,
                data=get_metadata(
                    dag_id=self.dag_id,
                    task_id=self.task_id,
                    run_id=self.run_id,
                    try_number=self.try_number,
                    cluster_id=self.cluster_id,
                ),
            )
            # TODO: publish_event is a blocking call that can hang Airflow tasks - commenting out to prevent task hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=self.workflow_id, event=event, env=ENV)
        except Exception as e:
            LOGGER.error(f"Failed to send workflow event for state {state}: {e}")
            # Do not propagate the error, just log it