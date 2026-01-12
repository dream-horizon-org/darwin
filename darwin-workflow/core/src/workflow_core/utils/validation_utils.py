import os
import re

import requests

from workflow_core.constants.configs import Config
from workflow_core.constants.constants import JOB_CLUSTER, BASIC_CLUSTER, WORKSPACE, FSX_BASE_PATH, \
    FSX_BASE_PATH_DYNAMIC_TRUE, GIT
from workflow_core.error.errors import InvalidWorkflowException
from workflow_core.utils.cluster_utils import ClusterUtils
from workflow_model.utils.validators import validate_timezone, validate_and_convert_start_or_end_date, \
    is_valid_timetable
from workflow_model.workflow import CreateWorkflowRequest


# TODO: Validation functions are scattered across validation_utils.py, validators.py (in model), and inline in workflow_core_impl.py
# TODO: Consolidate all validation logic into a single ValidationService
def _is_valid_name(name: str) -> bool:
    """
    Check if the workflow name is valid.
    """
    if not re.match(r'^[\w.-]+$', name):
        return False
    return True


def is_valid_src_code_path(src_code_path: str) -> bool:
    """
    Validate if the source code path is a valid directory.
    """
    if not os.path.isdir(src_code_path):
        return False
    return True


def is_valid_git_source(task_id):
    return task_id.source.startswith('https://github.com/')


def is_valid_cluster_type(cluster_type):
    print(cluster_type)
    return cluster_type in {JOB_CLUSTER, BASIC_CLUSTER}


# TODO: is_valid_job_cluster_definition makes HTTP call during validation - slow and creates circular dependency
# TODO: Hardcoded localhost:8001 fallback is fragile - use service discovery or configuration
def is_valid_job_cluster_definition(job_cluster_definition_id: str):
    env = os.getenv("ENV", "prod")
    _config = Config(env)
    app_layer_url = _config.get_app_layer
    
    # If URL is malformed (contains template variables), use localhost as fallback
    # This handles cases where the service is calling itself
    if "{{" in str(app_layer_url) or "%7b" in str(app_layer_url).lower():
        app_layer_url = "http://localhost:8001"
    
    try:
        resp = requests.get(app_layer_url + f"/job-cluster-definitions/{job_cluster_definition_id}", timeout=5)
        if not 200 <= resp.status_code < 300:
            return False
        return True
    except (requests.exceptions.RequestException, requests.exceptions.ConnectionError):
        # If service is unavailable, return False (don't mock the workflow service)
        return False


def is_valid_cluster_id(cluster_type, cluster_id, compute_utils):
    if cluster_type == JOB_CLUSTER:
        return is_valid_job_cluster_definition(cluster_id)

    elif cluster_type == BASIC_CLUSTER:
        compute_details = compute_utils.get_cluster_details(cluster_id)
        return compute_details.get('status') == 'SUCCESS'

    return False


def is_valid_entry_point(entry_point: str, source_type: str) -> bool:
    """
    Validate if the entry_point is a valid .py or .ipynb file and if the file exists.
    """
    if source_type == WORKSPACE:
        if not os.path.isfile(entry_point):
            return False

    _, file_extension = os.path.splitext(entry_point)
    return file_extension in ('.py', '.ipynb')


# TODO: validate_workflow mixes validation with date conversion side effects - separate concerns
# TODO: Validation errors are generic - provide field-level error details for API responses
def validate_workflow(request: CreateWorkflowRequest, wf_dict=None):
    if not _is_valid_name(request.display_name):
        raise InvalidWorkflowException(
            "Invalid workflow name. Only alphanumeric characters, dashes, dots and underscores are allowed.")

    if not is_valid_timetable(request.schedule):
        raise InvalidWorkflowException(
            "Not a valid cron expression for the timetable. Please check https://crontab.guru/ for valid expressions")

    env = 'stag' if os.getenv("ENV", "stag") in ['dev', 'stag'] else os.getenv("ENV", "prod")
    tasks = []
    all_tasks = []
    for task in request.tasks:
        all_tasks.append(task.task_name)
    for task in request.tasks:
        if not _is_valid_name(task.task_name):
            raise InvalidWorkflowException(
                f"Invalid task name '{task.task_name}'. alphanumeric characters, dashes, dots and underscores are allowed.")

        if not is_valid_cluster_type(task.cluster_type):
            raise InvalidWorkflowException(f"{task.cluster_type} is not a valid cluster type.")

        if not is_valid_cluster_id(task.cluster_type, task.cluster_id, ClusterUtils(env)):
            raise InvalidWorkflowException(f"{task.cluster_id} is not a valid cluster id.")

        if task.task_name in tasks:
            raise InvalidWorkflowException(f"Task '{task.task_name}' is already added to the DAG.")

        if task.source_type == GIT:
            if not is_valid_git_source(task):
                raise InvalidWorkflowException(f"Invalid source for task '{task.task_name}'.")

            if not is_valid_entry_point(task.file_path, task.source_type):
                raise InvalidWorkflowException(f"Invalid entry point for task '{task.file_path}'.")

        if task.source_type == WORKSPACE:
            if not is_valid_src_code_path(FSX_BASE_PATH + task.source):
                raise InvalidWorkflowException(
                    f"Invalid source code path for task '{FSX_BASE_PATH_DYNAMIC_TRUE + task.source}'.")

            file_path = FSX_BASE_PATH + task.source + "/" + task.file_path
            file_path_dynamic_true = FSX_BASE_PATH_DYNAMIC_TRUE + task.source + "/" + task.file_path
            if not is_valid_entry_point(file_path, task.source_type):
                raise InvalidWorkflowException(f"Invalid entry point for task '{file_path_dynamic_true}'.")

        if not all(dep in all_tasks for dep in task.depends_on):
            raise InvalidWorkflowException(f"Invalid dependencies for task '{task.task_name}'")

        tasks.append(task.task_name)

    request.timezone = validate_timezone(request.timezone)
    if wf_dict:
        # Since wf_dict is fetched from DB and DB stores in UTC, no need of conversion if not given by user
        if not request.start_date:
            request.start_date = wf_dict.start_date
        else:
            request.start_date = validate_and_convert_start_or_end_date(request.start_date, request.timezone)
        if not request.end_date:
            request.end_date = wf_dict.end_date
        else:
            request.end_date = validate_and_convert_start_or_end_date(request.end_date, request.timezone)
    else:
        request.start_date = validate_and_convert_start_or_end_date(request.start_date, request.timezone)
        request.end_date = validate_and_convert_start_or_end_date(request.end_date, request.timezone)
    return True
