import ast
import json
import os
import re
import time
from typing import List
from urllib.parse import urljoin
import random
import requests
from airflow.models import Variable
from airflow.operators.python import get_current_context
from workflow_core.models.constants import Entity
from datetime import datetime as dd, datetime, timezone
from airflow_core.constants.constants import ENV, WORKSPACE, FSX_BASE_PATH_DYNAMIC_TRUE
from aenum import extend_enum
from airflow_core.constants.configs import Config
from workflow_core.models.event_entity import StateSubclass, Event
from airflow_core.constants.constants import AIRFLOW_LOGS_BASE_PATH
import logging
from dateutil.tz import gettz
from airflow_core.entity.events_entities import WorkflowEvent, WorkflowState
from airflow_core.clients.callback_events import CallbackListener, DarwinEventsListener
import asyncio


LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.INFO)

# Only extend enum if WORKFLOW doesn't already exist
if not hasattr(Entity, 'WORKFLOW'):
    extend_enum(Entity, "WORKFLOW", "WORKFLOW")


def get_env():
    """
    Returns the environment. Defaults to 'stag' if the ENV variable is either 'dev' or 'stag',
    otherwise returns the value of the ENV variable.
    """
    env = Variable.get("ENV", "stag")
    return env if env not in ["dev", "stag"] else "stag"


def get_logs_url(task_id: str, dag_id: str, run_id: str):
    _config = Config(ENV)
    DARWIN_URL = _config.get_darwin_url
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "msd-user": json.dumps({"email": "sdk"}),
        "Content-Type": "application/json",
    }

    workflow_id = api_request(
        "POST",
        f"{APP_LAYER_URL}/workflow_id",
        headers=headers,
        data={"workflow_name": dag_id},
    )["workflow_id"]
    logs_url = f"{DARWIN_URL}{workflow_id}/runs/{run_id}/tasks/{task_id}"
    return logs_url


def get_error_slack_msg(task_id, dag_id, run_id) -> str:
    return """
                :red_circle: Task Failed.
                *Task*: {task}
                *Dag*: {dag}
                *Log Url*: {log_url}
                """.format(
        task=task_id,
        dag=dag_id,
        log_url=get_logs_url(dag_id=dag_id, task_id=task_id, run_id=run_id),
    )


def get_metadata(
    task_id: str = None,
    dag_id: str = None,
    run_id: str = None,
    try_number: int = None,
    cluster_id: str = None,
):
    """
    Get metadata for the task
    :param task_id: Task id
    :param dag_id: Dag id
    :param run_id: Run id
    :param try_number: Try number
    :param cluster_id: Cluster id
    :return: Metadata
    """
    metadata = {}
    if task_id:
        metadata["task_id"] = task_id
    if dag_id:
        metadata["dag_id"] = dag_id
    if run_id:
        metadata["run_id"] = run_id
    if try_number:
        metadata["try_number"] = try_number
    if cluster_id:
        metadata["cluster_id"] = cluster_id
    return metadata


def get_base_folder_path(
    workflow_name: str, run_id: str, task_id: str, retry_number: int
) -> str:
    logs_dir = f"{AIRFLOW_LOGS_BASE_PATH}/workflows/logs/{workflow_name}/{run_id}/{task_id}/try_{retry_number}"
    os.makedirs(logs_dir, exist_ok=True)
    return logs_dir


def update_cluster_details_in_workflow(
    dag_id: str, job_id: str, task_id: str, cluster_id: str, env: str, try_number: int
):
    """
    :param dag_id: dag_id
    :param job_id: job_id
    :param task_id: task_id
    :param cluster_id: cluster_id
    :param env: Environment
    :param try_number: try_number
    :return: Response from the API
    """
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    url = f"{APP_LAYER_URL}/v2/update-workflow-cluster-details"

    payload = json.dumps(
        {
            "workflow_name": dag_id,
            "run_id": job_id,
            "task_name": task_id,
            "cluster_id": cluster_id,
            "try_number": try_number,
        }
    )
    headers = {
        "Authorization": "Basic ZGFyd2luOmphcCE3UiZzNUw=",
        "Content-Type": "application/json",
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    # Check for Elasticsearch disk space issues
    is_elasticsearch_disk_issue = False
    error_message = ""
    
    for retry in range(3):
        if response.status_code != 200:
            try:
                error_json = response.json()
                error_message = error_json.get('message', response.text)
                # Check for Elasticsearch disk space issues
                if 'disk usage exceeded' in error_message or 'read-only-allow-delete block' in error_message or 'cluster_block_exception' in error_message:
                    is_elasticsearch_disk_issue = True
                    LOGGER.error(
                        f"Elasticsearch disk space issue detected: {error_message}. "
                        f"This is a non-critical operation and will not block workflow execution."
                    )
                    # Don't retry for disk space issues - they won't resolve quickly
                    break
            except:
                error_message = response.text
            
            LOGGER.warning(
                f"Failed to update cluster details in workflow (attempt {retry + 1}/3) with params {payload}: "
                f"{error_message} (status code: {response.status_code})"
            )
            
            if not is_elasticsearch_disk_issue:
                # Only retry if it's not a disk space issue
                response = requests.request("POST", url, headers=headers, data=payload)
                random_time = random.randint(10, 30)
                LOGGER.info(f"Retrying in {random_time} seconds...")
                time.sleep(random_time)
            else:
                break
        else:
            LOGGER.info(f"Successfully updated cluster details in workflow")
            break

    if response.status_code != 200:
        if is_elasticsearch_disk_issue:
            # Log as warning but don't fail the workflow - this is metadata only
            LOGGER.warning(
                f"⚠️  WARNING: Could not update cluster details in ElasticSearch due to disk space issue. "
                f"Workflow will continue, but cluster tracking may be incomplete. "
                f"Error: {error_message}. "
                f"Please free up disk space on Elasticsearch cluster."
            )
            # Return a mock success response to allow workflow to continue
            return type('Response', (), {'status_code': 200, 'text': 'Skipped due to ES disk space issue'})()
        else:
            # For other errors, still raise exception but with better message
            raise Exception(
                f"Failed to update cluster details in ElasticSearch after 3 retries: {error_message} "
                f"(Status: {response.status_code}). This is a non-critical operation."
            )

    return response


def is_run_id_required(workflow_name: str, env: str = "prod") -> bool:
    """
    Get workflow details from ElasticSearch
    :param workflow_name: Name of the workflow
    :param env: Environment (default is "prod")
    :return: True if run_id_required is True, False otherwise
    """
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "msd-user": json.dumps({"email": "sdk"}),
        "Content-Type": "application/json",
    }

    # Get workflow_id
    workflow_id_response = requests.post(
        f"{APP_LAYER_URL}/workflow_id",
        headers=headers,
        data=json.dumps({"workflow_name": workflow_name}),
    )
    if workflow_id_response.status_code != 200:
        return False
    workflow_id = workflow_id_response.json().get("workflow_id")

    # Check if workflow_id is None
    if workflow_id is None:
        return False

    # Get workflow details
    url = f"{APP_LAYER_URL}/workflow/{workflow_id}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return False

    # Check if 'data' key and 'tasks' key exist
    first_task = response.json()["data"]["tasks"][0]
    if "run_id_required" in first_task["input_parameters"]:
        return first_task["input_parameters"]["run_id_required"]

    return False


def get_default_callback_url(env: str):
    """
    Retrieves the default callback URL based on the environment.

    Args:
        env (str): Environment identifier.

    Returns:
        str: Default callback URL.
    """
    default_callback_url = Config(env).get_default_callback_url
    return default_callback_url


def get_workflow_details(workflow_id: str, workflow_name: str, env: str):
    """
    Retrieves details of a workflow.

    Args:
        workflow_id (str): ID of the workflow.
        workflow_name (str): Name of the workflow.
        env (str): Environment identifier.

    Returns:
        dict: Details of the workflow.
    """
    try:
        if workflow_id:
            return get_workflow_by_id(workflow_id, env)
        elif workflow_name:
            return get_workflow_by_name(workflow_name, env)
    except Exception as e:
        LOGGER.error(f"Failed to get workflow details: {e}")


def publish_event(
    event: Event,
    workflow_id: str = "",
    workflow_name: str = "",
    callback_urls: List[str] = None,
    event_types: List[str] = None,
    env: str = None,
    source: str = "WORKFLOW_APP_LAYER",
):
    """
    Publishes an event to callback listeners and Kafka.

    Args:
        event (Event): The event to be published.
        workflow_id (str, optional): ID of the workflow associated with the event. Defaults to "".
        workflow_name (str, optional): Name of the workflow associated with the event. Defaults to "".
        callback_urls (List[str], optional): List of callback URLs. Defaults to None.
        event_types (List[str], optional): List of event types. Defaults to None.
        env (str, optional): Environment identifier. Defaults to None.
        source: Source can be either workflow app layer or airflow
    """
    try:
        # Initialize variables
        callback_urls = callback_urls or []
        event_types = event_types or []
        if not env:
            env = (
                "stag"
                if os.getenv("ENV", "stag") in ["dev", "stag"]
                else os.getenv("ENV")
            )

        # Attempt to retrieve workflow details
        workflow_details = get_workflow_details(workflow_id, workflow_name, env)
        if workflow_details:
            callback_urls.extend(workflow_details["data"].get("callback_urls", []))
            event_types.extend(workflow_details["data"].get("event_types", []))

        LOGGER.info(f"Callback URLs: {callback_urls}")

        # Initialize callback listener and trigger event
        callback_listener = CallbackListener(
            callback_urls=callback_urls, event_types=event_types
        )
        callback_listener.on_event(event)

        LOGGER.info(f"Event published to callback listeners.")

        # Initialize Darwin Events Listener and trigger event
        darwin_events_listener = DarwinEventsListener(env=env, source=source)
        event = WorkflowEvent(event).get_event()
        darwin_events_listener.on_event(event)

        LOGGER.info(f"Event published to Darwin Events.")

    except Exception as e:
        LOGGER.error(f"Failed to trigger event: {e}")


def create_workflow_event(entity_id: str, state: StateSubclass, data: dict):
    timestamp = get_ist_time()
    return Event(
        entity=Entity.WORKFLOW,
        entity_id=entity_id,
        state=state,
        metadata=data,
        timestamp=timestamp,
    )


def get_workflow_by_id(workflow_id: str, env: str = None):
    """
    Get workflow details from ElasticSearch
    :param workflow_id: ID of the workflow
    :param env: Environment
    :return: Workflow details
    """

    if not env:
        env = os.getenv("ENV")
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "msd-user": json.dumps({"email": "sdk"}),
        "Content-Type": "application/json",
    }

    workflow = api_request(
        "GET", f"{APP_LAYER_URL}/v2/workflow/{workflow_id}", headers=headers
    )
    return workflow


def get_workflow_by_name(workflow_name: str, env: str = None):
    """
    Get workflow details from ElasticSearch
    :param workflow_name: Name of the workflow
    :param env: Environment
    :return: Workflow details
    """

    if not env:
        env = os.getenv("ENV")
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "msd-user": json.dumps({"email": "sdk"}),
        "Content-Type": "application/json",
    }

    workflow_id = api_request(
        "POST",
        f"{APP_LAYER_URL}/workflow_id",
        headers=headers,
        data={"workflow_name": workflow_name},
    )["workflow_id"]

    return get_workflow_by_id(workflow_id, env)


def api_request(
    method: str, url: str, params: dict = None, data: dict = None, headers: dict = None
):
    """
    Sends a request to the given URL and returns the response.
    :param method: HTTP method
    :param url: URL
    :param params: Query parameters
    :param data: Request body
    :param headers: Request headers
    :return: Response
    """
    RETRY_COUNT = 0
    while RETRY_COUNT < 3:
        response = requests.request(
            method, url, params=params, json=data, headers=headers
        )
        if not 200 <= response.status_code < 300:
            RETRY_COUNT += 1
        else:
            response_json = response.json()
            return response_json
    raise Exception(f"Status: {response.status_code} - {response.text}")


def get_ist_time():
    timestamp = dd.now(tz=gettz("Asia/Kolkata"))
    timestamp = timestamp.replace(tzinfo=None).isoformat(timespec="seconds")
    return timestamp


def get_date(date: str):
    if not date:
        return None
    else:
        try:
            return dd.strptime(date, "%Y-%m-%dT%H:%M:%S")  # Try full datetime
        except ValueError:
            try:
                return dd.strptime(
                    date, "%Y-%m-%d"
                )  # Try only date (defaults time to 00:00:00)
            except ValueError:
                print(
                    f"⚠️ Invalid date format: '{date}'. Expected 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'."
                )
                return None


def get_updated_entry_point_cmd(
    entry_point_cmd: str,
    dynamic_artifact: str,
    source_type: str,
    source: str,
    file_path: str,
    try_number: int,
):
    """
    :param entry_point_cmd: Entry point command
    :param dynamic_artifact: Dynamic artifact
    :param source_type: Source type
    :param source: Source
    :param file_path: File path
    :param try_number: Try Number

    :return: Updated entry point command
    """
    if entry_point_cmd.startswith("papermill"):
        updated_entry_point_cmd = (
            f"{entry_point_cmd.strip()[:-6]}/try_{try_number}.ipynb"
        )
        if dynamic_artifact and source_type == WORKSPACE:
            # remove prefix from file_path. Remove FSX_BASE_PATH_DYNAMIC_TRUE + source
            # For example if file_path is /home/ray/fsx/workspace/test.user@example.com/Playground/default/test/main.ipynb then we need to get test/main.ipynb
            reduced_file_path = file_path.replace(
                FSX_BASE_PATH_DYNAMIC_TRUE + source + "/", ""
            )
            current_working_dir_path = "/".join(reduced_file_path.split("/")[:-1])
            updated_entry_point_cmd = (
                updated_entry_point_cmd
                + " --cwd "
                + FSX_BASE_PATH_DYNAMIC_TRUE
                + source
                + "/"
                + current_working_dir_path
            )
        else:
            current_working_dir_path = "/".join(file_path.split("/")[:-1])
            updated_entry_point_cmd = (
                updated_entry_point_cmd + " --cwd " + current_working_dir_path
            )
        updated_entry_point_cmd = updated_entry_point_cmd + " -k python3"
    else:
        updated_entry_point_cmd = entry_point_cmd
    return updated_entry_point_cmd


def get_updated_parameters(
    runtime_params: str,
    default_params: str,
    updated_entry_point_cmd: str,
    dag_id: str,
    run_id: str,
    workflow_params: dict = None,
):
    """
    :param runtime_params: Runtime parameters
    :param default_params: Default parameters
    :param updated_entry_point_cmd: Updated entry point command
    :param dag_id: Dag id
    :param run_id: Run id
    :param workflow_params: Workflow parameters

    :return: Updated parameters
    """

    def format_value(value):
        if isinstance(value, (list, dict)):
            return f"'{json.dumps(value)}'"
        elif isinstance(value, str):
            escaped = value.replace('"', '\\"')
            return f"\"{escaped}\""
        return str(value)

    final_params = {}

    # Parse runtime_params if it exists
    if runtime_params:
        runtime_params = ast.literal_eval(runtime_params)
    else:
        runtime_params = {}

    # Inject workflow_run_id if needed
    if is_run_id_required(dag_id, Variable.get("env")):
        default_params = default_params.replace("--run_id_required True", "")
        runtime_params["workflow_run_id"] = run_id

    # Merge order: workflow_params (after default) < runtime_params (highest precedence)
    if workflow_params:
        final_params.update(workflow_params)

    final_params.update(runtime_params)

    # Format parameters based on the command
    if updated_entry_point_cmd.startswith("papermill"):
        formatted_params = [
            f"-p {key} {format_value(value)}" for key, value in final_params.items()
        ]
    else:
        formatted_params = [
            f"--{key} {format_value(value)}" for key, value in final_params.items()
        ]

    # Concatenate everything
    parameters = default_params + " " + " ".join(formatted_params)

    return parameters


def get_workflow_task_details(workflow_id: str, task_id: str, env: str):
    """
    Retrieves details for a specific task in a workflow.

    :param workflow_id: ID of the workflow (DAG)
    :param task_id: ID of the task
    :param env: Environment
    :return: Details of the specified task
    """
    workflow_details = get_workflow_by_id(workflow_id, env)
    tasks = workflow_details.get("data", {}).get("tasks", [])
    return next((task for task in tasks if task["task_name"] == task_id), None)


def get_thread_id_key(dag_id: str, task_id: str, run_id: str):
    return f"slack_thread_id_{dag_id}_{task_id}_{run_id}"


def get_cluster_id_key(dag_id: str, task_id: str, run_id: str):
    return f"cluster_id_{dag_id}_{task_id}_{run_id}"

def get_cluster_id_key_for_task(dag_id: str, task_id: str, run_id: str):
    """
    :param dag_id: The DAG ID of the workflow.
    :param task_id: The ID of the task in the workflow.
    :param run_id: A unique ID for this job.
    :param cluster_id: Cluster identification of the cluster to use for job execution.
    """
    try:
        LOGGER.info(f"Getting cluster ID for {get_cluster_id_key(dag_id, task_id, run_id)}")
        cluster_id = Variable.get(key=get_cluster_id_key(dag_id, task_id, run_id))
        LOGGER.info(f"Got cluster ID {cluster_id} for {get_cluster_id_key(dag_id, task_id, run_id)}")
        return cluster_id
    except Exception as e:
        LOGGER.error(f"Error while getting cluster id, {e}")
        raise e


def set_cluster_id_key(dag_id: str, task_id: str, run_id: str, cluster_id: str):
    """
    :param dag_id: The DAG ID of the workflow.
    :param task_id: The ID of the task in the workflow.
    :param run_id: A unique ID for this job.
    :param cluster_id: Cluster identification of the cluster to use for job execution.
    """
    try:
        LOGGER.info(f"Setting cluster ID for {get_cluster_id_key(dag_id, task_id, run_id)} to {cluster_id}")
        Variable.set(key=get_cluster_id_key(dag_id, task_id, run_id), value=cluster_id)
    except Exception as e:
        LOGGER.error(f"Error while setting cluster id, {e}")


def fetch_cluster_events(cluster_id: str, event_types: list):
    """
    Fetches events for a given cluster from the Chronos API.

    :param cluster_id: The ID of the cluster to query events for.
    :param event_types: A list of event types to filter the events.
    :return: The response from the API as text.
    """
    env = Variable.get("env")
    url = urljoin(Config(env).get_darwin_events_url, "api/v1/cluster/events")

    payload = {"cluster_id": cluster_id, "filters": {"event_types": event_types}}

    headers = {"Content-Type": "application/json"}
    response = api_request("POST", url, data=payload, headers=headers)
    return response


def insert_run(run_id, workflow_id, dag_id, state, start_time, expected_run_duration):
    _config = Config(get_env())
    APP_LAYER_URL = _config.get_app_layer
    url = f"{APP_LAYER_URL}/v1/workflow/{workflow_id}/create_and_update_run"
    payload = {
        "run_id": run_id,
        "dag_id": dag_id,
        "state": state,
        "start_time": start_time.isoformat(),
        "expected_run_duration": expected_run_duration,
    }
    LOGGER.info(f"Sending POST request to {url} with payload: {payload}")
    headers = {"Content-Type": "application/json"}
    response = api_request("POST", url, data=payload, headers=headers)
    LOGGER.info(f"Response received: {response}")
    return response


def update_run(run_id, workflow_id, state=None, end_time=None, sla_exceeded=None):
    _config = Config(get_env())
    APP_LAYER_URL = _config.get_app_layer
    url = f"{APP_LAYER_URL}/v1/workflow/{workflow_id}/create_and_update_run"

    # Build the payload dynamically
    payload = {"run_id": run_id}

    if sla_exceeded is not None:
        payload["sla_exceeded"] = sla_exceeded

    if state is not None:
        payload["state"] = state

    if end_time is not None:
        payload["end_time"] = end_time.isoformat()

    headers = {"Content-Type": "application/json"}
    response = api_request("POST", url, data=payload, headers=headers)
    return response


def pre_execute(**kwargs):
    dag_run = kwargs["dag_run"]
    LOGGER.info("Pre-execution task started.")
    workflow_id = get_workflow_by_name(dag_run.dag_id, ENV)["data"]["workflow_id"]
    insert_run(
        run_id=dag_run.run_id,
        workflow_id=workflow_id,
        dag_id=dag_run.dag_id,
        state="running",
        start_time=dag_run.start_date,
        expected_run_duration=kwargs["expected_run_duration"],
    )
    send_workflow_event(
        workflow_id=workflow_id,
        dag_id=dag_run.dag_id,
        state=WorkflowState.WORKFLOW_RUN_STARTED,
        metadata={
            "run_id": dag_run.run_id,
            "state": "running",
            "start_time": dag_run.start_date.isoformat(),
            "logical_date": dag_run.execution_date.isoformat(),
            "expected_run_duration": kwargs["expected_run_duration"],
        },
    )

TERMINAL_STATES = {"success", "failed", "skipped", "upstream_failed"}

def check_task_states(dag_run, task_instance):
    """
    Check task states using Airflow's built-in methods with polling.
    This approach is needed because post_execute is connected only to the last task,
    but parallel dependencies of the last task could still be running.

    :param dag_run: The DAG run object
    :param task_instance: The current task instance (to exclude from checking)
    :return: Tuple of (any_failed, all_success)
    """
    while True:
        # Get fresh task instances using Airflow's built-in method
        task_instances = dag_run.get_task_instances()

        # Filter out the current task and check_run_duration task
        relevant_task_instances = [
            ti for ti in task_instances
            if ti.task_id not in (task_instance.task_id, "check_run_duration")
        ]

        # Check if all relevant tasks are in terminal states
        non_terminal = [ti for ti in relevant_task_instances if ti.state not in TERMINAL_STATES]
        if not non_terminal:
            break
        LOGGER.info(
            f"Waiting for tasks to complete. Current states: {[ti.state for ti in relevant_task_instances]}"
        )
        time.sleep(5)  # Poll every 5 seconds

    #Log all task states along with task id
    LOGGER.info(f"All task states: {[ti.task_id + ' - ' + ti.state for ti in task_instances]}")

    any_failed = any(ti.state == "failed" for ti in task_instances)
    all_success = all(ti.state in ["success", "skipped"] for ti in task_instances)

    return any_failed, all_success

def post_execute(**kwargs):
    dag_run = kwargs["dag_run"]
    task_instance = kwargs["task_instance"]  # Get the current task instance

    # Check task states with dynamic polling
    any_failed, all_success = check_task_states(dag_run, task_instance)
    state = "success" if all_success else "failed" if any_failed else "unknown"

    update_run(
        run_id=dag_run.run_id,
        workflow_id=get_workflow_by_name(dag_run.dag_id, ENV)["data"]["workflow_id"],
        state=state,
        end_time=datetime.utcnow(),
    )

    workflow_id = get_workflow_by_name(dag_run.dag_id, ENV)["data"]["workflow_id"]

    if state == "success":
        send_workflow_event(
            workflow_id=workflow_id,
            dag_id=dag_run.dag_id,
            state=WorkflowState.WORKFLOW_RUN_SUCCESS,
            metadata={
                "run_id": dag_run.run_id,
                "state": state,
                "start_time": dag_run.start_date.isoformat(),
                "logical_date": dag_run.execution_date.isoformat(),
                "expected_run_duration": kwargs["expected_run_duration"],
            },
        )
    elif state == "failed":
        send_workflow_event(
            workflow_id=workflow_id,
            dag_id=dag_run.dag_id,
            state=WorkflowState.WORKFLOW_RUN_FAILED,
            metadata={
                "run_id": dag_run.run_id,
                "state": state,
                "start_time": dag_run.start_date.isoformat(),
                "logical_date": dag_run.execution_date.isoformat(),
                "expected_run_duration": kwargs["expected_run_duration"],
            },
        )

    LOGGER.info(f"Post-execution task completed with state: {state}")


    if state == "failed":
        raise Exception("Post-execution state determined as failed.")


def check_run_duration(**kwargs):
    run_start = kwargs["dag_run"].start_date
    expected_run_duration = kwargs.get("expected_run_duration")

    # Skip everything if expected_run_duration is None
    if expected_run_duration is None:
        LOGGER.warning(
            "Skipping check_run_duration as expected_run_duration is not set."
        )
        return  # Exit early

    poll_interval = 10  # Poll every 10 seconds
    max_poll_time = 6 * 60 * 60  # Maximum polling time: 6 hours

    start_poll = time.time()

    while time.time() - start_poll < max_poll_time:
        now = datetime.utcnow().replace(tzinfo=timezone.utc)  # Ensure UTC timezone
        task_instance = kwargs["ti"]
        dag_run = task_instance.get_dagrun()
        post_execute_task = dag_run.get_task_instance("post_execute")

        if post_execute_task.state in ["success", "skipped", "failed"]:
            run_end = post_execute_task.end_date or now  # Use end_date if available
            LOGGER.info(
                f"Post-execute finished with state '{post_execute_task.state}', using end_date: {run_end}."
            )
            break
        else:
            run_end = now  # If post_execute is still running, use the current time

        run_duration = (run_end - run_start).total_seconds()

        if run_duration > expected_run_duration * 60:
            LOGGER.warning(
                f"DAG run exceeded threshold. Duration: {run_duration} seconds."
            )

            # Update run state to indicate SLA breach
            update_run(
                run_id=kwargs["dag_run"].run_id,
                workflow_id=get_workflow_by_name(kwargs["dag_run"].dag_id, ENV)["data"][
                    "workflow_id"
                ],
                sla_exceeded=True,
            )
            break  # Exit loop when threshold is exceeded

        LOGGER.info(
            f"DAG run within threshold. Duration: {run_duration} seconds. Sleeping for {poll_interval} sec."
        )
        time.sleep(poll_interval)


def send_workflow_event(
        workflow_id: str, dag_id: str, state: WorkflowState, metadata: dict = {}
):
    """
    :param state: State of the workflow
    Publishes a workflow event
    """
    if not workflow_id:
        workflow_id = get_workflow_by_name(dag_id, ENV)["data"]["workflow_id"]
    event = create_workflow_event(
        entity_id=workflow_id,
        state=state,
        data=metadata,
    )
    # TODO: publish_event is a blocking call that can hang Airflow tasks - commenting out to prevent task hanging
    # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
    # publish_event(workflow_id=workflow_id, event=event, env=ENV)


def get_installed_package_status(cluster_id: str, package_id: str):
    """
    :param cluster_id: Cluster ID
    :param package_id: Package ID
    """
    _config = Config(get_env())
    compute_app_layer = _config.get_compute_app_layer
    response = api_request("GET", compute_app_layer + f"/{cluster_id}/library/{package_id}")
    status = response["data"]["status"]
    return status


def get_package_name_by_id(cluster_id: str, package_id: str):
    """
    :param cluster_id: Cluster ID
    :param package_id: Package ID
    """
    _config = Config(get_env())
    compute_app_layer = _config.get_compute_app_layer
    response = api_request("GET", compute_app_layer + f"/{cluster_id}/library/{package_id}")
    name = response["data"]["name"]
    return name


def get_workflow_run_status(workflow_id: str, run_id: str):
    """
    Fetches the run status for a given workflow_id and run_id using the /v1/workflow/{workflow_id}/runs/{run_id} API.
    :param workflow_id: The workflow ID
    :param run_id: The run ID
    :return: The run status (and full run data)
    """
    _config = Config(get_env())
    APP_LAYER_URL = _config.get_app_layer
    url = f"{APP_LAYER_URL}/v1/workflow/{workflow_id}/runs/{run_id}"
    LOGGER.info(f"get_workflow_run_status url: {url}")
    headers = {"Content-Type": "application/json"}
    response = requests.get(url, headers=headers)
    if not 200 <= response.status_code < 300:
        raise Exception(f"Failed to fetch run status: {response.status_code} - {response.text}")
    data = response.json()
    # The response is expected to have a 'data' field with run details, including 'status'
    LOGGER.info(f"get_workflow_run_status resp: {data}")
    return data.get("data", {})


def get_workflow_run_details_by_dag_id(dag_id: str, run_id: str):
    """
    :param dag_id: The DAG ID
    :param run_id: The run ID
    :return: The run details (and full run data)
    """
    _config = Config(get_env())
    APP_LAYER_URL = _config.get_app_layer
    url = f"{APP_LAYER_URL}/v1/workflow/by-dag-id/{dag_id}/runs/{run_id}"
    LOGGER.info(f"get_workflow_run_status url: {url}")
    headers = {"Content-Type": "application/json"}
    response = requests.get(url, headers=headers)
    if not 200 <= response.status_code < 300:
        raise Exception(f"Failed to fetch run status: {response.status_code} - {response.text}")
    data = response.json()
    # The response is expected to have a 'data' field with run details, including 'status'
    LOGGER.info(f"get_workflow_run_status resp: {data}")
    return data.get("data", {})


def pre_execute_v3(**kwargs):
    """
    V3 version of pre_execute function using V3 APIs.
    Creates a workflow run record and sends workflow event.
    """
    dag_run = kwargs["dag_run"]
    LOGGER.info("V3 Pre-execution task started.")

    # Get workflow by name using V3 API
    workflow_data = get_workflow_by_name_v3(dag_run.dag_id, ENV)
    if not workflow_data:
        raise Exception(f"Workflow {dag_run.dag_id} not found")

    LOGGER.info(f"Workflow data retrieved: {workflow_data}")
    workflow_id = workflow_data["data"]["workflow_id"]
    LOGGER.info(f"Workflow ID: {workflow_id}")

    # Create workflow run using V3 API
    LOGGER.info(f"Creating workflow run for run_id: {dag_run.run_id}")
    insert_run_v3(
        run_id=dag_run.run_id,
        workflow_id=workflow_id,
        dag_id=dag_run.dag_id,
        state="running",
        start_time=dag_run.start_date,
        expected_run_duration=kwargs.get("expected_run_duration")
    )

    # Send workflow event using V3 API
    LOGGER.info(f"Sending workflow event for workflow_id: {workflow_id}")
    send_workflow_event_v3(
        workflow_id=workflow_id,
        dag_id=dag_run.dag_id,
        state=WorkflowState.WORKFLOW_RUN_STARTED,
        metadata={
            "run_id": dag_run.run_id,
            "state": "running",
            "start_time": dag_run.start_date.isoformat(),
            "logical_date": dag_run.execution_date.isoformat(),
            "expected_run_duration": kwargs.get("expected_run_duration"),
        }
    )
    LOGGER.info("V3 Pre-execution task completed successfully.")


def post_execute_v3(**kwargs):
    """
    V3 version of post_execute function using V3 APIs.
    Updates workflow run state and sends workflow events.
    """
    dag_run = kwargs["dag_run"]
    task_instance = kwargs["task_instance"]  # Get the current task instance
    LOGGER.info("V3 Post-execution task started.")
    LOGGER.info(f"DAG ID: {dag_run.dag_id}, Run ID: {dag_run.run_id}")

    # Check task states with dynamic polling
    any_failed, all_success = check_task_states(dag_run, task_instance)
    state = "success" if all_success else "failed" if any_failed else "unknown"
    LOGGER.info(f"Determined final state: {state}")

    # Get workflow by name using V3 API
    LOGGER.info(f"Getting workflow by name: {dag_run.dag_id}")
    workflow_data = get_workflow_by_name_v3(dag_run.dag_id, ENV)
    if not workflow_data:
        raise Exception(f"Workflow {dag_run.dag_id} not found")

    workflow_id = workflow_data["data"]["workflow_id"]
    LOGGER.info(f"Workflow ID: {workflow_id}")

    # Update workflow run using V3 API
    LOGGER.info(f"Updating workflow run for run_id: {dag_run.run_id}")
    update_run_v3(
        run_id=dag_run.run_id,
        workflow_id=workflow_id,
        state=state,
        end_time=datetime.utcnow()
    )

    # Send workflow events based on state using V3 API
    if state == "success":
        LOGGER.info(f"Sending success workflow event for workflow_id: {workflow_id}")
        send_workflow_event_v3(
            workflow_id=workflow_id,
            dag_id=dag_run.dag_id,
            state=WorkflowState.WORKFLOW_RUN_SUCCESS,
            metadata={
                "run_id": dag_run.run_id,
                "state": state,
                "start_time": dag_run.start_date.isoformat(),
                "logical_date": dag_run.execution_date.isoformat(),
                "expected_run_duration": kwargs.get("expected_run_duration"),
            }
        )
    elif state == "failed":
        LOGGER.info(f"Sending failed workflow event for workflow_id: {workflow_id}")
        send_workflow_event_v3(
            workflow_id=workflow_id,
            dag_id=dag_run.dag_id,
            state=WorkflowState.WORKFLOW_RUN_FAILED,
            metadata={
                "run_id": dag_run.run_id,
                "state": state,
                "start_time": dag_run.start_date.isoformat(),
                "logical_date": dag_run.execution_date.isoformat(),
                "expected_run_duration": kwargs.get("expected_run_duration"),
            }
        )

    LOGGER.info(f"V3 Post-execution task completed with state: {state}")

    if state == "failed":
        raise Exception("Post-execution state determined as failed.")


def get_workflow_by_name_v3(workflow_name: str, env: str = None):
    """
    V3 version of get_workflow_by_name that calls V3 API directly.
    """
    if not env:
        env = os.getenv("ENV")
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "Content-Type": "application/json",
    }

    LOGGER.info(f"Calling V3 API to get workflow by name: {workflow_name}")
    response = api_request(
        "GET",
        f"{APP_LAYER_URL}/v3/workflow/name/{workflow_name}",
        headers=headers,
    )
    LOGGER.info(f"V3 API response for workflow {workflow_name}: {response}")
    return response


def insert_run_v3(run_id, workflow_id, dag_id, state, start_time, expected_run_duration):
    """
    V3 version of insert_run that calls V3 API directly.
    """
    _config = Config(get_env())
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "Content-Type": "application/json",
    }

    # Convert start_time to datetime string if it's a datetime object
    start_time_str = start_time.isoformat() if hasattr(start_time, 'isoformat') else str(start_time)

    data = {
        "run_id": run_id,
        "workflow_id": workflow_id,
        "dag_id": dag_id,
        "state": state,
        "start_time": start_time_str,
        "expected_run_duration": expected_run_duration,
        "parameters": {},  # Required field
    }

    LOGGER.info(f"Sending V3 POST request to create run with data: {data}")
    response = api_request(
        "POST",
        f"{APP_LAYER_URL}/v3/runs",
        headers=headers,
        data=data
    )
    LOGGER.info(f"V3 API response for creating run: {response}")
    return response


def update_run_v3(run_id, workflow_id, state=None, end_time=None, sla_exceeded=None):
    """
    V3 version of update_run that calls V3 API directly.
    """
    _config = Config(get_env())
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        "Content-Type": "application/json",
    }

    data = {}
    if state is not None:
        data["state"] = state
    if end_time is not None:
        data["end_time"] = end_time.isoformat() if hasattr(end_time, 'isoformat') else str(end_time)
    if sla_exceeded is not None:
        data["sla_exceeded"] = sla_exceeded

    LOGGER.info(f"Sending V3 PUT request to update run with data: {data}")
    response = api_request(
        "PUT",
        f"{APP_LAYER_URL}/v3/runs/{workflow_id}/{run_id}",
        headers=headers,
        data=data
    )
    LOGGER.info(f"V3 API response for updating run: {response}")
    return response


def send_workflow_event_v3(workflow_id: str, dag_id: str, state: WorkflowState, metadata: dict = {}):
    """
    V3 version of send_workflow_event that uses existing event system.
    """
    if not workflow_id:
        workflow_data = get_workflow_by_name_v3(dag_id, ENV)
        if workflow_data:
            workflow_id = workflow_data["data"]["workflow_id"]

    event = create_workflow_event(
        entity_id=workflow_id,
        state=state,
        data=metadata,
    )
    # TODO: publish_event is a blocking call that can hang Airflow tasks - commenting out to prevent task hanging
    # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
    # publish_event(workflow_id=workflow_id, event=event, env=ENV)

