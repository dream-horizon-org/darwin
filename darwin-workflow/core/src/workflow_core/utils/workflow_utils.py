import datetime
import itertools
import json
import logging
import os
import traceback
from typing import Tuple
import random
import re
import shutil
import sys
import threading
import time
import uuid
from datetime import datetime as dd
import boto3
import requests
import nbformat
import yaml
from nbconvert import HTMLExporter
from fastapi.responses import JSONResponse

from workflow_core.api.airlfow import AirflowApi
from workflow_core.artifactory.s3_artifactory import S3Artifactory
from workflow_core.clients.callback_events import CallbackListener, DarwinEventsListener
from workflow_core.models.event_entity import StateSubclass, Event
from workflow_core.constants.configs import Config
from workflow_core.constants.constants import auth, AUTH_TOKEN, GIT_OWNER, GIT_TOKEN, GIT_FC_TOKEN, \
    WORKSPACE, GIT, FSX_BASE_PATH, ZIP, TIMEOUT, FSX_BASE_PATH_DYNAMIC_TRUE, HTML, COMMUTER, STATIC_FILES_ENDPOINT, \
    BASIC, EXTERNAL, SCHEDULED, MANUAL
from dateutil.tz import gettz
from datetime import datetime as dd
from aenum import extend_enum
from workflow_core.models.constants import State, Entity
from typing import List, TypeVar, Union
import re

from workflow_core.entity.events_entities import WorkflowEvent
from workflow_core.error.errors import RunNotFoundException
from workflow_core.utils.cluster_utils import ClusterUtils
from workflow_core.utils.commuter_utils import CommuterUtils
from workflow_model.workflow import Workflow
import asyncio

LOGGER = logging.getLogger(__name__)

# Create an instance of the S3Artifactory class
artifactory = S3Artifactory()
# WORKFLOW already exists in Entity enum, no need to extend

# Constants for GitHub URL parsing
GITHUB_ORG_PATTERN = r'github\.com/([^/]+)/'

# Organization to token mapping
ORG_TOKEN_MAPPING = {
    'ds-fancode': GIT_FC_TOKEN,
    'darwin': GIT_TOKEN,
    # Add more organizations as needed
}

def _extract_github_organization(repo_url: str) -> str:
    """
    Extract organization name from GitHub URL
    
    :param repo_url: The repository URL
    :return: Organization name or default organization
    """
    match = re.search(GITHUB_ORG_PATTERN, repo_url)
    if match:
        return match.group(1)
    return 'darwin'  # Default organization


def _get_git_token_for_organization(org_name: str) -> str:
    """
    Get the appropriate git token for an organization.
    
    :param org_name: The organization name
    :return: The appropriate git token
    """
    return ORG_TOKEN_MAPPING.get(org_name, GIT_TOKEN)

def get_env():
    env = os.getenv("ENV", "stag")
    return 'stag' if env in ['dev', 'stag'] else env

def _create_variable(key, value, env):
    """
    Create an Airflow variable. Returns None on failure (non-blocking).
    This is called during DAG creation but failure should not block deployment.
    """
    try:
        _config = Config(env)
        variable_data = {"key": key, "value": value}
        AIRFLOW_URL = _config.get_airflow_url
        AUTH_TOKEN = _config.get_airflow_auth
        variables_url = f"{AIRFLOW_URL}/api/v1/variables"
        headers = {'Content-Type': 'application/json', 'Authorization': AUTH_TOKEN} if AUTH_TOKEN else {'Content-Type': 'application/json'}
        response = requests.post(variables_url, headers=headers, json=variable_data, timeout=5)
        if response.status_code not in [200, 201]:
            LOGGER.warning(f"Failed to create Airflow variable '{key}': {response.status_code} - {response.text[:200]}")
        return response
    except Exception as e:
        # Log but don't raise - variable creation is not critical for deployment
        LOGGER.warning(f"Error creating Airflow variable '{key}': {e}. Continuing with deployment...")
        return None


def _get_variable(key, env):
    _config = Config(env)
    AIRFLOW_URL = _config.get_airflow_url
    AUTH_TOKEN = _config.get_airflow_auth
    variables_url = f"{AIRFLOW_URL}/api/v1/variables"
    headers = {'Content-Type': 'application/json', 'Authorization': AUTH_TOKEN} if AUTH_TOKEN else {'Content-Type': 'application/json'}
    response = requests.get(f"{variables_url}/{key}", headers=headers)
    return response


def _delete_variable(key, env):
    _config = Config(env)
    AIRFLOW_URL = _config.get_airflow_url
    AUTH_TOKEN = _config.get_airflow_auth
    variables_url = f"{AIRFLOW_URL}/api/v1/variables"
    headers = {'Content-Type': 'application/json', 'Authorization': AUTH_TOKEN} if AUTH_TOKEN else {'Content-Type': 'application/json'}
    response = requests.delete(f"{variables_url}/{key}", headers=headers)
    return response


def is_valid_dag_id(dag_id: str, env) -> bool:
    """
    Check if the DAG with the specified dag_id already exists in Airflow.
    """
    try:
        _config = Config(env)
        AIRFLOW_URL = _config.get_airflow_url
        AUTH_TOKEN = _config.get_airflow_auth

        airflow_api_url = f"{AIRFLOW_URL}/api/v1/dags/{dag_id}"
        headers = {'Authorization': AUTH_TOKEN} if AUTH_TOKEN else {}
        response = requests.get(airflow_api_url, headers=headers, timeout=5)
        return response.status_code == 200
    except Exception as e:
        # Log but return False - DAG doesn't exist if we can't check
        LOGGER.debug(f"Error checking DAG {dag_id}: {e}")
        return False


def is_dag_updated(dag_id: str, env, last_parsed_time) -> bool:
    """
    Check if the DAG with the specified dag_id is updated in Airflow.
    """
    airflow = AirflowApi(env)
    dag = airflow.get_dag(dag_id)
    last_parsed_time_from_airflow = dag.get('last_parsed_time')
    if last_parsed_time_from_airflow > last_parsed_time:
        return True
    return False


def extract_libraries_as_string(input_data):
    libraries = input_data.get("pip", [])
    libraries_string = ",".join(libraries)
    return libraries_string


def create_directory_if_not_exists(path):
    """Creates a directory if it does not exist.

    :param path: Path to the directory
    :return: Created path
    """
    if not os.path.exists(path):
        os.makedirs(path)
    return path


def dict_to_list_of_dicts(input_dict):
    return [{key: value} for key, value in input_dict.items()]


def delete_directory(path):
    """Deletes a directory.

    :param path: Path to the directory
    """
    try:
        shutil.rmtree(path)
    except FileNotFoundError:
        # Directory doesn't exist, which is fine for cleanup operations
        pass


def prepend_content_to_file(file_path: str, new_content: str):
    """Prepends new content to a file.

    :param file_path: The path to the file to prepend to.
    :param new_content: The content to be prepended.
    """
    try:
        with open(file_path, 'r+') as file:
            lines = file.readlines()
            file.seek(0)
            file.write(new_content + '\n')
            for line in lines:
                file.write(line)
    except Exception as e:
        LOGGER.error("Failed to prepend content to file: %s", e)
        raise


def _get_git_token_for_repo(repo_url: str) -> str:
    """
    Determine which git token to use based on the repository organization.
    
    :param repo_url: The repository URL
    :return: The appropriate git token
    """
    org_name = _extract_github_organization(repo_url)
    return _get_git_token_for_organization(org_name)


def __build_src_code_git(dag_id: str, repo_url: str, env: str) -> str:
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[DEBUG __build_src_code_git] Starting: dag_id={dag_id}, repo_url={repo_url}, env={env}")
    
    try:
        branch_available = False
        if repo_url.endswith('.git'):
            repo_url = repo_url[:-4]
            parts = repo_url.split('/')
            repo_name = parts[-1]
        elif repo_url.find('tree') != -1:
            parts = repo_url.split('/tree/')
            parts_2 = parts[0].split('/')
            repo_name = parts_2[-1]
            branch = parts[-1]
            branch_available = True
        else:
            parts = repo_url.split('/')
            repo_name = parts[-1]
        
        logger.info(f"[DEBUG] Parsed repo_name={repo_name}, branch_available={branch_available}")
        
        # Determine the appropriate organization
        org_name = _extract_github_organization(repo_url)
        logger.info(f"[DEBUG] Extracted org_name={org_name}")
        
        if branch_available:
            ZIP_URL = f"https://api.github.com/repos/{org_name}/{repo_name}/zipball/{branch}"
        else:
            ZIP_URL = f"https://api.github.com/repos/{org_name}/{repo_name}/zipball"
        
        logger.info(f"[DEBUG] Fetching ZIP from: {ZIP_URL}")
        git_token = _get_git_token_for_repo(repo_url)
        
        # Only add auth header if token is available
        headers = {}
        if git_token and git_token != "":
            headers["Authorization"] = f"token {git_token}"
            logger.info(f"[DEBUG] Using GitHub token for authentication")
        else:
            logger.info(f"[DEBUG] No GitHub token, attempting public repo access")
        
        response = requests.get(ZIP_URL, headers=headers, timeout=30)
        logger.info(f"[DEBUG] GitHub API response status: {response.status_code}")
        
        if response.status_code == 200:
            import boto3
            import os
            # Configure S3 client with endpoint override for LocalStack/local development
            s3_config = {}
            endpoint_url = os.getenv("AWS_ENDPOINT_OVERRIDE") or os.getenv("AWS_ENDPOINT_URL")
            if endpoint_url:
                s3_config['endpoint_url'] = endpoint_url
                aws_access_key = os.getenv("AWS_ACCESS_KEY_ID", "minioadmin")
                aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "minioadmin")
                s3_config['aws_access_key_id'] = aws_access_key
                s3_config['aws_secret_access_key'] = aws_secret_key
            
            logger.info(f"[DEBUG] Creating S3 client with config: {s3_config}")
            s3 = boto3.client('s3', **s3_config)
            current_datetime = datetime.datetime.now()
            _config = Config(env)
            AIRFLOW_S3_FOLDER = _config.get_airflow_s3_folder
            timestamp_str = current_datetime.strftime("%Y_%m_%d-%H_%M_%S")
            s3_key = f"{AIRFLOW_S3_FOLDER}/zips/{dag_id}-{repo_name}-{timestamp_str}.zip"
            BUCKET_NAME = Config(env).get_s3_bucket
            
            logger.info(f"[DEBUG] Uploading ZIP to S3: bucket={BUCKET_NAME}, key={s3_key}")
            s3.put_object(Bucket=BUCKET_NAME, Key=s3_key, Body=response.content)
            s3_uri = "s3://" + BUCKET_NAME + "/" + s3_key
            logger.info(f"[DEBUG] Successfully uploaded to: {s3_uri}")
            return s3_uri
        else:
            error_msg = f"Failed to download GitHub repo ZIP. Status code: {response.status_code}, URL: {ZIP_URL}"
            logger.error(f"[DEBUG] {error_msg}")
            return ""  # Return empty string instead of None
    except Exception as e:
        logger.error(f"[DEBUG] Exception in __build_src_code_git: {e}", exc_info=True)
        return ""  # Return empty string on error


def __build_src_code(dag_id: str, src_code_path: str, env: str) -> str:
    """
    Build the source code artifact and upload it to the Artifactory.

    :param dag_id: The dag_id of the project
    :param src_code_path: The path of the source code.
    :return: The remote URL of the source code artifact.
    """
    current_timestamp = dd.now().strftime("%Y-%m-%d_%H-%M-%S")
    _config = Config(env)
    AIRFLOW_S3_FOLDER = _config.get_airflow_s3_folder
    artefact_name = f"{dag_id}-{current_timestamp}"
    src_code_zip_path = f"{AIRFLOW_S3_FOLDER}/zips/{artefact_name}.zip"
    remote_url_for_src_code = artifactory.build_artefact_abs_path(src_code_path, src_code_zip_path,
                                                                  _config.get_s3_bucket)

    LOGGER.info("All the parameters of the DAG have been verified . Uploading the source code to s3://{}/{}".format(
        _config.get_s3_bucket, src_code_zip_path))
    return remote_url_for_src_code


def create_modified_entry_point(entry_point: str, task_id: str, env: str = "prod",
                                dag_id: str = ""):
    """
    :param entry_point: entry_point
    :param task_id: task_id
    :param run_time_params: run_time_params
    :param env : Environment
    :return: modified entry_point
    """
    _config = Config(env)
    AIRFLOW_S3_FOLDER = _config.get_airflow_s3_folder
    task_type = ""
    if entry_point.endswith(".ipynb"):
        new_entry_point = f"papermill {entry_point} "
        new_entry_point += f"s3://{_config.get_s3_bucket}/{AIRFLOW_S3_FOLDER}/output_notebooks/{dag_id}/{task_id}.ipynb"
        task_type = "notebook"
    else:
        new_entry_point = f"ipython {entry_point}"
        task_type = "script"

    return new_entry_point, task_type


def create_json_from_dag_args(env, dag_args, tasks, dependencies):
    """Create the DAG by generating its task definitions and dependencies.

    :param env: Environment
    :param dag_args: Dictionary containing DAG arguments
    :param tasks: List of tuples (task_id, args) representing task definitions
    :param dependencies: List of tuples (task1, task2) representing task dependencies
    :return: JSON data representing the DAG
    """
    artefact_data = {"env": env, "dag_args": dag_args, "tasks_definitions": [], "tasks_dependencies": []}

    for task_id, args in tasks:
        artefact_data["tasks_definitions"].append({"task_id": task_id, "op_kwargs": args})

    for task1, task2 in dependencies:
        artefact_data["tasks_dependencies"].append((task1, task2))

    json_data = json.dumps(artefact_data, indent=4)
    data = f"dag_config = {json.loads(json_data)}"

    return data, json_data


def upload_to_airflow(data, dag_id, env):
    """
    :param data: data to be written to the dag file
    :param dag_id: dag id
    :param env: Environment
    :param is_yaml: Is dag created via yaml
    :return: None
    """
    _config = Config(env)
    unique_path_id = uuid.uuid4().urn[9:]
    AIRFLOW_URL = _config.get_airflow_url
    AIRFLOW_S3_FOLDER = _config.get_airflow_s3_folder
    DARWIN_URL = _config.get_darwin_url
    artefact_sdk = S3Artifactory()
    dag_template_file = os.path.dirname(os.path.abspath(__file__)) + "/artefact_template.py"
    path = create_directory_if_not_exists(f'./darwin-artefacts-{unique_path_id}')
    dag_artefact_file = './darwin-artefacts-{}/artefact_{}.py'.format(unique_path_id, dag_id)
    shutil.copyfile(dag_template_file, dag_artefact_file)
    prepend_content_to_file(dag_artefact_file, data)
    artefact_sdk.upload_artifact(f'./darwin-artefacts-{unique_path_id}/artefact_{dag_id}.py', _config.get_s3_bucket,
                                 f'{AIRFLOW_S3_FOLDER}/dags/artefact_{dag_id}.py')
    status = wait_for_api_success(dag_id, env, f'Deploying the DAG "{dag_id}" to Darwin. Please wait....', 5)
    DARWIN_WORKFLOWS_URL = DARWIN_URL
    LOGGER.info(f'DAG "{dag_id}" is now visible in DARWIN UI.Please check {DARWIN_WORKFLOWS_URL}')
    delete_directory(path)
    return status


def upload_to_s3(data, dag_id, env):
    """
    :param data: data to be written to the dag file
    :param dag_id: dag id
    :param env: Environment
    :param action_type: It's value can be either create or update
    :return: None
    """
    def log_debug(msg):
        try:
            with open("/tmp/workflow_debug.log", "a") as f:
                from datetime import datetime
                timestamp = datetime.now().isoformat()
                f.write(f"[{timestamp}] {msg}\n")
                f.flush()
        except:
            pass

    log_debug(f'[S3_UPLOAD_START] Starting S3 upload for DAG "{dag_id}", env={env}')
    _config = Config(env)
    print("starting the upload")
    unique_path_id = uuid.uuid4().urn[9:]
    AIRFLOW_S3_FOLDER = _config.get_airflow_s3_folder
    log_debug(f'[S3_UPLOAD] S3 bucket={_config.get_s3_bucket}, folder={AIRFLOW_S3_FOLDER}')
    
    try:
        artefact_sdk = S3Artifactory()
        dag_template_file = os.path.dirname(os.path.abspath(__file__)) + "/artefact_template.py"
        path = create_directory_if_not_exists(f'./darwin-artefacts-{unique_path_id}')
        dag_artefact_file = './{}/artefact_{}.py'.format(path, dag_id)
        shutil.copyfile(dag_template_file, dag_artefact_file)
        prepend_content_to_file(dag_artefact_file, data)
        log_debug(f'[S3_UPLOAD] Local file created at {dag_artefact_file}, uploading to S3...')
        
        artefact_sdk.upload_artifact(f'./darwin-artefacts-{unique_path_id}/artefact_{dag_id}.py', _config.get_s3_bucket,
                                     f'{AIRFLOW_S3_FOLDER}/dags/artefact_{dag_id}.py')
        log_debug(f'[S3_UPLOAD_SUCCESS] Successfully uploaded DAG "{dag_id}" to S3')
        delete_directory(path)
    except Exception as e:
        log_debug(f'[S3_UPLOAD_ERROR] Failed to upload DAG "{dag_id}" to S3: {e}')
        raise


def wait_for_api_success(dag_id: str, env: str, message: str, interval: int = 1):
    status = True

    def animate():
        for c in itertools.cycle(['|', '/', '-', '\\']):
            if done:
                break
            sys.stdout.write('\r' + c)
            sys.stdout.flush()
            time.sleep(0.1)

    done = False
    t = threading.Thread(target=animate)
    t.start()
    time_waited = 0
    while not done:
        # Call the API function to check for success
        if TIMEOUT < time_waited:
            done = True
            status = False
        if is_valid_dag_id(dag_id, env):
            done = True
        else:
            time_waited = time_waited + interval
            time.sleep(interval)

    done = True
    t.join()
    return status


async def wait_for_api_success_v2(dag_id: str, env: str, message: str, interval: int = 5):
    """
    Wait for DAG to appear in Airflow after S3 upload.
    Returns True if DAG is found, False if timeout.
    """
    import sys
    import os
    
    # Write debug info to file
    debug_file = "/tmp/workflow_debug.log"
    def log_debug(msg):
        try:
            with open(debug_file, "a") as f:
                from datetime import datetime
                timestamp = datetime.now().isoformat()
                f.write(f"[{timestamp}] {msg}\n")
                f.flush()
        except:
            pass
    
    status = True
    done = False
    time_waited = 0
    # Reduced timeout for local/darwin-local environments only
    local_envs = ['local', 'darwin-local']
    if env in local_envs:
        wait_timeout = 300  # 5 minutes for local environments
    else:
        wait_timeout = 600  # 10 minutes for other environments
    
    log_debug(f'[WAIT_START] DAG "{dag_id}" with timeout {wait_timeout}s and env {env}')
    print(f'[WAIT_DAG_DEBUG] Starting wait for DAG "{dag_id}" with timeout {wait_timeout}s and env {env}', flush=True)
    sys.stdout.flush()
    sys.stderr.flush()
    LOGGER.info(f'Waiting for DAG "{dag_id}" to appear in Airflow (timeout: {wait_timeout}s, env: {env})...')
    
    while not done:
        # Call the API function to check for success
        if wait_timeout < time_waited:
            done = True
            status = False
            log_debug(f'[WAIT_TIMEOUT] DAG "{dag_id}" after {time_waited}s')
            print(f'[WAIT_DAG_DEBUG] TIMEOUT for DAG "{dag_id}" after {time_waited}s', flush=True)
            sys.stdout.flush()
            LOGGER.warning(f'Timeout waiting for DAG "{dag_id}" to appear in Airflow after {time_waited}s')
        elif is_valid_dag_id(dag_id, env):
            done = True
            log_debug(f'[WAIT_FOUND] DAG "{dag_id}" after {time_waited}s')
            print(f'[WAIT_DAG_DEBUG] DAG "{dag_id}" FOUND after {time_waited}s', flush=True)
            sys.stdout.flush()
            LOGGER.info(f'DAG "{dag_id}" found in Airflow after {time_waited}s')
        else:
            time_waited = time_waited + interval
            if time_waited % 30 == 0:  # Log every 30 seconds
                log_debug(f'[WAIT_PROGRESS] Still waiting for DAG "{dag_id}"... ({time_waited}/{wait_timeout}s)')
                print(f'[WAIT_DAG_DEBUG] Still waiting for DAG "{dag_id}"... ({time_waited}/{wait_timeout}s)', flush=True)
                sys.stdout.flush()
                LOGGER.debug(f'Still waiting for DAG "{dag_id}"... ({time_waited}/{wait_timeout}s)')
            await asyncio.sleep(interval)
    
    if status:
        log_debug(f'[WAIT_SUCCESS] DAG "{dag_id}" completed successfully')
        print(f'[WAIT_DAG_DEBUG] DAG "{dag_id}" wait completed SUCCESSFULLY', flush=True)
        sys.stdout.flush()
        LOGGER.info(f'DAG "{dag_id}" successfully appeared in Airflow')
    else:
        log_debug(f'[WAIT_FAIL] DAG "{dag_id}" failed')
        print(f'[WAIT_DAG_DEBUG] DAG "{dag_id}" wait FAILED', flush=True)
        sys.stdout.flush()
        LOGGER.warning(f'DAG "{dag_id}" did not appear in Airflow within timeout. DAG file is in S3, but Airflow may not have synced it yet.')
    return status


async def wait_for_update_success(dag_id: str, env: str, interval: int = 1, last_parsed_time: str = None):
    status = True
    done = False
    time_waited = 0
    while not done:
        # Call the API function to check for success
        if TIMEOUT < time_waited:
            done = True
            status = False
        if is_dag_updated(dag_id, env, last_parsed_time):
            done = True
        else:
            time_waited = time_waited + interval
            await asyncio.sleep(interval)
    return status


def github_repo_to_zip_link(repo_url):
    is_main_branch = True
    if repo_url.endswith('.git'):
        repo_url = repo_url[:-4]
        parts = repo_url.split('/')
        repo_name = parts[-1]
    elif repo_url.find('tree') != -1:
        branch = repo_url.split('/tree/')[-1]
        repo_name = repo_url.split('/tree/')[0].split("/")[-1]
        is_main_branch = False
    else:
        parts = repo_url.split('/')
        repo_name = parts[-1]
    
    # Determine the appropriate token and organization
    git_token = _get_git_token_for_repo(repo_url)
    org_name = _extract_github_organization(repo_url)
    
    if is_main_branch:
        zip_link = f'https://{org_name}:{git_token}@github.com/{org_name}/{repo_name}/archive/HEAD.zip'
    else:
        zip_link = f'https://{org_name}:{git_token}@github.com/{org_name}/{repo_name}/archive/refs/heads/{branch}.zip'

    return zip_link


def string_packages_to_dict(input_string: str):
    """
    :param input_string: input_string
    :return: dict
    """
    if input_string is None or input_string.strip() == "":
        return {"pip": []}
    packages = [p.strip() for p in input_string.split(',') if p.strip()]
    result = {"pip": packages}
    return result


def get_job_submit_details(dag_id: str, dynamic_artifact: bool, source_type: str, source: str, file_path: str,
                           pip_packages: dict, env: str):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"[DEBUG get_job_submit_details] dag_id={dag_id}, dynamic_artifact={dynamic_artifact}, source_type={source_type}, source={source}, file_path={file_path}")
    
    # Normalize source_type to lowercase for case-insensitive comparison
    source_type_lower = source_type.lower() if source_type else ""
    logger.info(f"[DEBUG] Normalized source_type: {source_type_lower}")
    
    entry_point : str = ""
    runtime_env = {}

    if dynamic_artifact:
        # Files will be picked up from source dynamically every time during workflow execution
        if source_type_lower == WORKSPACE:
            source_path = FSX_BASE_PATH_DYNAMIC_TRUE + source
            entry_point = source_path + "/" + file_path
        elif source_type_lower == GIT:
            source_path = github_repo_to_zip_link(source)
            pip_packages['pip'].append('smart_open')
            runtime_env = pip_packages | {"working_dir": source_path}
            entry_point = file_path
    else:
        # Files will be picked up during workflow creation once and uploaded to S3
        if source_type_lower == WORKSPACE:
            source_path = FSX_BASE_PATH + source
            s3_uri_path = __build_src_code(dag_id, source_path, env)
            runtime_env = pip_packages | {"working_dir": s3_uri_path}
            entry_point = file_path
        elif source_type_lower == GIT:
            logger.info(f"[DEBUG] Calling __build_src_code_git for dag_id={dag_id}, source={source}")
            s3_uri_path = __build_src_code_git(dag_id, source, env)
            logger.info(f"[DEBUG] __build_src_code_git returned: s3_uri_path={s3_uri_path}")
            # Ensure ipython is in pip packages for script execution
            if 'pip' in pip_packages and 'ipython' not in pip_packages['pip']:
                pip_packages['pip'].append('ipython')
            elif 'pip' not in pip_packages:
                pip_packages['pip'] = ['ipython']
            runtime_env = pip_packages | {"working_dir": s3_uri_path}
            # For local development with Localstack, pass AWS_ENDPOINT_URL to Ray so smart_open can access it
            endpoint_url = os.getenv("AWS_ENDPOINT_OVERRIDE") or os.getenv("AWS_ENDPOINT_URL")
            if endpoint_url:
                runtime_env["env_vars"] = {
                    "AWS_ENDPOINT_URL": endpoint_url,
                    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID", "test"),
                    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY", "test"),
                }
            entry_point = file_path
            logger.info(f"[DEBUG] Set entry_point={entry_point}, runtime_env={runtime_env}")
        elif source_type_lower == ZIP:
            runtime_env = pip_packages | {"working_dir": source}
            entry_point = file_path
    
    logger.info(f"[DEBUG get_job_submit_details] Returning entry_point={entry_point}, runtime_env={runtime_env}")
    return entry_point, runtime_env


def format_value(value):
    if isinstance(value, (list, dict)):
        return f"'{json.dumps(value)}'"
    elif isinstance(value, str):
        escaped = value.replace('"', '\\"')
        return f"\"{escaped}\""
    return str(value)


def get_params_value(entry_point: str, input_params: dict):
    """
    :param entry_point: entry_point
    :param input_params: input_params
    :return: parameters
    """
    if entry_point.endswith('.ipynb'):
        parameters = [f"-p {key} {format_value(value)}" for key, value in input_params.items()]
    else:
        parameters = [f"--{key} {format_value(value)}" for key, value in input_params.items()]

    return " ".join(parameters)



def update_cluster_details_in_workflow(dag_id: str, job_id: str, task_id: str, cluster_id: str, env: str):
    """
    :param dag_id: dag_id
    :param job_id: job_id
    :param task_id: task_id
    :param cluster_id: cluster_id
    :param env: Environment
    :return: Response from the API
    """
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    url = f"{APP_LAYER_URL}/update-workflow-cluster-details"

    payload = json.dumps({
        "workflow_name": dag_id,
        "run_id": job_id,
        "task_name": task_id,
        "cluster_id": cluster_id
    })
    headers = {
        'Authorization': 'Basic ZGFyd2luOmphcCE3UiZzNUw=',
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)

    for retry in range(3):
        if response.status_code != 200:
            response = requests.request("POST", url, headers=headers, data=payload)
            LOGGER.info(
                f"Response from update cluster details in workflow with params {payload}: {response.text} and status code: {response.status_code}")
            random_time = random.randint(10, 30)
            LOGGER.info(f"Sleeping for {random_time} seconds")
            time.sleep(random_time)
        else:
            break

    if response.status_code != 200:
        raise Exception(f"Failed to update cluster details in ElasticSearch: {response.text}")

    return response


def error_handler(message: str = None, status_code: int = 500):
    if not message:
        message = "Something went wrong"
    
    # Track error in ddtrace for non-200 responses
    if status_code >= 400:
        try:
            from ddtrace import tracer
            span = tracer.current_span()
            if span:
                span.error = True
                span.set_tag("error.message", message)
                span.set_tag("error.type", f"HTTP_{status_code}")
                span.set_tag("http.status_code", status_code)
        except ImportError:
            # ddtrace not available, skip tracking
            pass
    
    return JSONResponse(status_code=status_code, content={
        'status': 'ERROR',
        'message': message
    })


def _request(method: str, url: str, params: dict = None, payload: dict = None, auth=None):
    headers = {'Content-Type': 'application/json'}  # Update headers as needed

    response = requests.request(
        method=method,
        url=url,
        params=params,
        json=payload,
        headers=headers,
        auth=auth
    )

    if not 200 <= response.status_code < 300:
        raise Exception(f"Status: {response.status_code} - {response.text}")

    try:
        json_response = response.json()
    except ValueError:
        json_response = None

    return json_response


# def get_date(date: str):
#     """
#     :param date: date
#     """
#     if not date:
#         return None
#     else:
#         try:
#             year, month, day = map(int, date.split('-'))
#             return dd(year, month, day)
#         except ValueError:
#             print("Invalid date format or out-of-range values.")
#             return None


def get_date(date:str):
    try:
        return dd.strptime(date, "%Y-%m-%dT%H:%M:%S")  # Try full datetime
    except ValueError:
        try:
            return dd.strptime(date, "%Y-%m-%d")  # Try only date (defaults time to 00:00:00)
        except ValueError:
            raise ValueError(f"⚠️ Invalid date format: '{date}'. Expected 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'.")


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
        'msd-user': json.dumps({
            'email': 'sdk'
        }),
        'Content-Type': 'application/json'
    }

    # Get workflow_id
    workflow_id_response = requests.post(f"{APP_LAYER_URL}/workflow_id", headers=headers,
                                         data=json.dumps({"workflow_name": workflow_name}))
    if workflow_id_response.status_code != 200:
        return False
    workflow_id = workflow_id_response.json().get('workflow_id')

    # Check if workflow_id is None
    if workflow_id is None:
        return False

    # Get workflow details
    url = f"{APP_LAYER_URL}/workflow/{workflow_id}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return False

    # Check if 'data' key and 'tasks' key exist
    first_task = response.json()['data']['tasks'][0]
    if 'run_id_required' in first_task['input_parameters']:
        return first_task['input_parameters']['run_id_required']

    return False


def check_if_output_notebook_exists_in_s3(dag_id: str, run_id: str, task_id: str):
    """
    check if notebook exists in s3
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :return: True if exists, False otherwise
    """
    folder_path = f'output_notebooks/{dag_id}/{task_id}/'
    return artifactory.check_file_exists_in_s3_bucket(folder_path, f'{run_id}.ipynb')


def delete_workflow_from_s3(dag_id: str):
    """
    Delete the workflow from S3.
    :param dag_id: Name of the workflow
    :param env: Environment
    """
    env = os.getenv('ENV')
    _config = Config(env)
    AIRFLOW_S3_FOLDER = _config.get_airflow_s3_folder
    folder_path = f'{AIRFLOW_S3_FOLDER}/dags/artefact_{dag_id}.py'
    artifactory.delete_from_s3(_config.get_s3_bucket, folder_path)


def api_request(method: str, url: str, params: dict = None, data: dict = None, headers: dict = None):
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
        response = requests.request(method, url, params=params, json=data, headers=headers)
        if not 200 <= response.status_code < 300:
            RETRY_COUNT += 1
        else:
            response_json = response.json()
            return response_json
    raise Exception(f"Status: {response.status_code} - {response.text}")


def get_logs_url(task_id: str, dag_id: str, run_id: str):
    env = os.getenv('ENV')
    _config = Config(env)
    DARWIN_URL = _config.get_darwin_url
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        'msd-user': json.dumps({
            'email': 'sdk'
        }),
        'Content-Type': 'application/json'
    }

    workflow_id = api_request("POST", f"{APP_LAYER_URL}/workflow_id", headers=headers,
                              data={"workflow_name": dag_id})['workflow_id']
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
        log_url=get_logs_url(dag_id=dag_id, task_id=task_id, run_id=run_id)
    )


def check_if_output_notebook_folder_exists(dag_id: str, run_id: str, task_id: str):
    """
    check if notebook exists in s3
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :return: True if exists, False otherwise
    """
    folder_path = f'output_notebooks/{dag_id}/{task_id}/{run_id}/'
    return artifactory.check_if_folder_exist(folder_path)


def check_if_output_notebook_exists_in_s3_v2(dag_id: str, run_id: str, task_id: str, retry_number: str):
    """
    check if notebook exists in s3
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :param retry_number: Retry number
    :return: True if exists, False otherwise
    """
    folder_path = f'output_notebooks/{dag_id}/{task_id}/{run_id}/'
    return artifactory.check_file_exists_in_s3_bucket(folder_path, f'try_{retry_number}.ipynb')


def get_all_output_notebooks(dag_id: str, run_id: str, task_id: str) -> dict[int, str]:
    """
    Get all output notebooks from S3
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :return: List of output notebooks
    """
    folder_path = f'output_notebooks/{dag_id}/{task_id}/{run_id}/'
    output_notebooks = artifactory.get_all_output_notebooks(folder_path)

    output_notebooks.sort()
    output_notebooks_dict = {
        int(notebook.split('/')[-1].split('_')[-1].split('.')[0]): notebook for notebook in output_notebooks
    }

    return output_notebooks_dict


def check_if_html_output_exists_in_efs(dag_id: str, run_id: str, task_id: str, retry_number: int = 0):
    """
    Check if the HTML output exists in EFS
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :param retry_number: Retry number
    :return: True if the HTML output exists, False otherwise
    """
    folder_path = f'{FSX_BASE_PATH}workflows/logs/{dag_id}/{run_id}/{task_id}/try_{retry_number}'
    file_path = os.path.join(folder_path, 'output.html')

    if os.path.exists(file_path):
        return True
    else:
        return False


def load_html_from_efs(dag_id: str, run_id: str, task_id: str, output_type: str = HTML, retry_number: int = 0):
    """
    Load the HTML output from EFS
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :param output_type: Type of output
    :param retry_number: Retry number
    :return: HTML content as a string
    """
    try:
        folder_path = f'{FSX_BASE_PATH}workflows/logs/{dag_id}/{run_id}/{task_id}/try_{retry_number}'
        file_path = os.path.join(folder_path, 'output.html')

        with open(file_path, 'r') as file:
            html_string = file.read()

        _config = Config(os.getenv("ENV", "prod"))
        html_file_path = _config.get_app_layer_public + f'/{STATIC_FILES_ENDPOINT}/{dag_id}/{run_id}/{task_id}/try_{retry_number}/output.html'
        output = html_file_path if output_type == HTML else html_string

        return output, HTML
    except Exception as e:
        tb = traceback.format_exc()
        LOGGER.error(f"Error loading HTML from EFS: {e} - {tb}")
        commuter_utils = CommuterUtils(os.getenv("ENV", "prod"))
        return commuter_utils.get_commuter_link(dag_id=dag_id, task_id=task_id, run_id=run_id, try_number=retry_number)


def write_html_to_folder(html_string, folder_path):
    """
    Write the HTML content to a folder
    :param html_string: HTML content as a string
    :param folder_path: Path to the folder
    """
    try:
        # Create the folder if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)

        # Write the HTML content to a file
        with open(os.path.join(folder_path, 'output.html'), 'w') as html_file:
            html_file.write(html_string)
    except Exception as e:
        LOGGER.error(f"Failed to write the HTML content to the folder: {e}")


def write_airflow_logs_to_efs(logs: str, dag_id: str, run_id: str, task_id: str, retry_number: int = 0):
    """
    Write the HTML content to a folder
    :param logs: Logs content as a string
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :param retry_number: Retry number

    :return: Path to the logs file
    """
    try:
        folder_path = f'{FSX_BASE_PATH}workflows/logs/{dag_id}/{run_id}/{task_id}/try_{retry_number}'

        # Create the folder if it doesn't exist
        os.makedirs(folder_path, exist_ok=True)

        log_file_path = os.path.join(folder_path, 'airflow.log')

        # Check if the file already exists
        if not os.path.isfile(log_file_path):
            # Write the logs content to the file if it doesn't exist
            with open(log_file_path, 'w') as logs_file:
                logs_file.write(logs)

        _config = Config(os.getenv("ENV", "prod"))

        logs_file_path = _config.get_app_layer_public + f'/{STATIC_FILES_ENDPOINT}/{dag_id}/{run_id}/{task_id}/try_{retry_number}/airflow.log'

        return logs_file_path

    except Exception as e:
        LOGGER.error(f"Failed to write the HTML content to the folder: {e}")


def convert_ipynb_to_html(dag_id: str, task_id: str, run_id: str, retry_number: int = 0, write_to_folder: bool = False,
                          output_type: str = "html"):
    """
    Convert the IPython notebook to HTML
    :param dag_id: Name of the workflow
    :param task_id: Task id for workflow
    :param run_id: run_id of workflow
    :param retry_number: Retry number
    :param write_to_folder: Flag to write the HTML content to a folder
    :param output_type: Type of output
    """

    try:
        _config = Config(os.getenv("ENV", "prod"))
        s3_bucket = _config.get_s3_bucket
        s3_folder = _config.get_airflow_s3_folder
        html_file_path = ""
        if retry_number:
            s3_key = f'{s3_folder}/output_notebooks/{dag_id}/{task_id}/{run_id}/try_{retry_number}.ipynb'
        else:
            s3_key = f'{s3_folder}/output_notebooks/{dag_id}/{task_id}/{run_id}.ipynb'

        # Create an S3 client
        s3_client = artifactory.s3

        # Download the notebook from S3
        response = s3_client.get_object(Bucket=s3_bucket, Key=s3_key)
        notebook_content = nbformat.read(response['Body'], as_version=4)

        # Create an HTML exporter
        html_exporter = HTMLExporter()

        # Convert the notebook to HTML
        html_output, resources = html_exporter.from_notebook_node(notebook_content)

        # Now, 'html_output' contains the HTML content as a string
        html_string = html_output

        if write_to_folder:
            folder_path = f'{FSX_BASE_PATH}workflows/logs/{dag_id}/{run_id}/{task_id}/try_{retry_number}/outputs'
            write_html_to_folder(html_string, folder_path)
            html_file_path = _config.get_app_layer_public + f'/{STATIC_FILES_ENDPOINT}/{dag_id}/{run_id}/{task_id}/try_{retry_number}/outputs/output.html'

        output = html_file_path if output_type == HTML else html_string

        return output, HTML

    except Exception as e:
        tb = traceback.format_exc()
        LOGGER.error(f"Error converting IPython notebook to HTML: {e} - {tb}")
        commuter_utils = CommuterUtils(os.getenv("ENV", "prod"))
        return commuter_utils.get_commuter_link(dag_id=dag_id, task_id=task_id, run_id=run_id,
                                                try_number=retry_number), COMMUTER


def get_ist_time():
    timestamp = dd.now(tz=gettz('Asia/Kolkata'))
    timestamp = timestamp.replace(tzinfo=None).isoformat(timespec='seconds')
    return timestamp


def create_workflow_event(entity_id: str, state: StateSubclass, data: dict):
    timestamp = get_ist_time()
    return Event(entity=Entity.WORKFLOW, entity_id=entity_id, state=state, metadata=data, timestamp=timestamp)


def get_workflow_by_id(workflow_id: str, env: str = None):
    """
    Get workflow details from ElasticSearch
    :param workflow_id: ID of the workflow
    :param env: Environment
    :return: Workflow details
    """

    if not env:
        env = os.getenv('ENV')
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        'msd-user': json.dumps({
            'email': 'sdk'
        }),
        'Content-Type': 'application/json'
    }

    workflow = api_request("GET", f"{APP_LAYER_URL}/v2/workflow/{workflow_id}", headers=headers)
    return workflow


def get_workflow_by_name(workflow_name: str, env: str = None):
    """
    Get workflow details from ElasticSearch
    :param workflow_name: Name of the workflow
    :param env: Environment
    :return: Workflow details
    """

    if not env:
        env = os.getenv('ENV')
    _config = Config(env)
    APP_LAYER_URL = _config.get_app_layer
    headers = {
        'msd-user': json.dumps({
            'email': 'sdk'
        }),
        'Content-Type': 'application/json'
    }

    workflow_id = api_request("POST", f"{APP_LAYER_URL}/workflow_id", headers=headers,
                              data={"workflow_name": workflow_name})['workflow_id']

    return get_workflow_by_id(workflow_id, env)


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


def publish_event(event: Event, workflow_id: str = "", workflow_name: str = "",
                  callback_urls: List[str] = None,
                  event_types: List[str] = None, env: str = None, source: str = "WORKFLOW_APP_LAYER"):
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
            env = get_env()

        # Attempt to retrieve workflow details
        workflow_details = get_workflow_details(workflow_id, workflow_name, env)
        if workflow_details:
            callback_urls.extend(workflow_details['data'].get('callback_urls', []))
            event_types.extend(workflow_details['data'].get('event_types', []))

        # Add default callback URL
        default_callback_url = get_default_callback_url(env)
        callback_urls.append(default_callback_url)

        LOGGER.info(f"Callback URLs: {callback_urls}")

        # Initialize callback listener and trigger event
        callback_listener = CallbackListener(callback_urls=callback_urls, event_types=event_types)
        callback_listener.on_event(event)

        LOGGER.info(f"Event published to callback listeners.")

        # Initialize Darwin Events Listener and trigger event
        darwin_events_listener = DarwinEventsListener(env=env, source=source)
        event = WorkflowEvent(event).get_event()
        darwin_events_listener.on_event(event)

        LOGGER.info(f"Event published to Darwin Events.")

    except Exception as e:
        LOGGER.error(f"Failed to trigger event: {e}")


def get_timestamp_from_run_id(run_id: str):
    """
    :param run_id: timestamp
    """
    if not run_id:
        return None
    else:
        try:
            # Extract the datetime string from the original string
            dt_str = run_id.split("__")[1]

            # Parse the datetime string as UTC
            dt_utc = dd.fromisoformat(dt_str)

            # Create a timezone object for IST (Indian Standard Time)
            ist_tz = datetime.timezone(datetime.timedelta(hours=5, minutes=30))  # IST is UTC+5:30

            # Convert the UTC datetime to IST
            dt_ist = dt_utc.astimezone(ist_tz)

            # Convert to string
            dt_ist = dt_ist.strftime("%Y-%m-%d %H:%M:%S.%f%z")

            return dt_ist

        except ValueError:
            LOGGER.info("Invalid run_id format.")
            raise RunNotFoundException("Invalid run_id format")


def get_output_notebook_path(dag_id: str, run_id: str, task_id: str, output_type: str, retry_number: int = 0,
                             run_status: str = "success"):
    """
    Get the path of the output notebook
    :param dag_id: Name of the workflow
    :param run_id: run_id of workflow
    :param task_id: Task id for workflow
    :param output_type: Type of output
    :param retry_number: Retry number
    :param run_status: Status of the run
    :return: Path of the output notebook
    """
    if run_status == "running":
        output, output_type = convert_ipynb_to_html(dag_id=dag_id, run_id=run_id, task_id=task_id,
                                                    retry_number=retry_number, write_to_folder=True,
                                                    output_type=output_type)
    else:
        if check_if_html_output_exists_in_efs(dag_id=dag_id, run_id=run_id, task_id=task_id,
                                              retry_number=retry_number):
            output, output_type = load_html_from_efs(dag_id=dag_id, run_id=run_id, task_id=task_id,
                                                     retry_number=retry_number, output_type=output_type)
        else:
            output, output_type = convert_ipynb_to_html(dag_id=dag_id, run_id=run_id, task_id=task_id,
                                                        retry_number=retry_number, write_to_folder=True,
                                                        output_type=output_type)

    return output, output_type


def get_logs_from_efs(dag_id: str, run_id: str, task_id: str, retry_number: int = 0) -> Tuple[str, str, str]:
    """
    Get the logs from EFS.

    :param dag_id: Name of the workflow
    :param run_id: Run ID of the workflow
    :param task_id: Task ID for the workflow
    :param retry_number: Retry number, default is 0
    :return: Tuple containing paths of application and system logs and content of error log as a string
    """
    try:
        # Retrieve environment and config
        env = os.getenv('ENV')
        _config = Config(env)
        workflow_app_layer_url = _config.get_app_layer_public

        # Define paths
        folder_path = f'{FSX_BASE_PATH}workflows/logs/{dag_id}/{run_id}/{task_id}/try_{retry_number}'
        app_layer_path = f'{workflow_app_layer_url}/{STATIC_FILES_ENDPOINT}/{dag_id}/{run_id}/{task_id}/try_{retry_number}'

        application_log_file_path = os.path.join(folder_path, 'application.log')
        application_layer_log_path = f'{app_layer_path}/application.log'

        system_log_file_path = os.path.join(folder_path, 'system.log')
        system_layer_log_path = f'{app_layer_path}/system.log'

        error_log_file_path = os.path.join(folder_path, 'error.log')

        # Determine application and system log paths
        application_log_path = application_layer_log_path if os.path.exists(application_log_file_path) else ""
        system_log_path = system_layer_log_path if os.path.exists(system_log_file_path) else ""

        # Read error log content
        error_log_content = ""
        if os.path.exists(error_log_file_path):
            with open(error_log_file_path, 'r') as file:
                error_log_content = file.read()

        return application_log_path, system_log_path, error_log_content

    except Exception as e:
        raise Exception(f"Failed to get logs from EFS: {e}")


def get_clusters_from_workflow_data(data: dict):
    """
    Get the clusters from the workflow data
    :param data: Workflow data
    :return: List of clusters
    """
    env = get_env()
    compute_utils = ClusterUtils(env)
    clusters = []
    for task in data['tasks']:
        cluster = task['attached_cluster']
        clusters.append(compute_utils.get_cluster_definition(cluster['cluster_id'], task['cluster_type']))
    return clusters


def generate_workflow_yaml(data: dict):
    """
    Generate workflow yaml file
    :param data: data
    :return: yaml file
    """
    env = os.getenv('ENV')
    yaml_structure = {
        "env": env,
        "clusters": get_clusters_from_workflow_data(data),
        "workflow": {
            "workflow_name": data['display_name'],
            "description": data['description'],
            "created_by": data['created_by'],
            "schedule": data['schedule'],
            "retries": data['retries'],
            "notify_on": data['notify_on'],
            "max_concurrent_runs": data['max_concurrent_runs'],
            "tags": data.get('tags', []),
            "tasks": []
        }
    }

    for task in data['tasks']:
        yaml_task = {
            "task_name": task['task_name'],
            "cluster_id": task['attached_cluster']['cluster_name'],
            "cluster_type": task['cluster_type'],
            "source": task['source'],
            "source_type": task['source_type'],
            "file_path": task['file_path'],
            "dynamic_artifact": task['dynamic_artifact'],
            "dependent_libraries": task.get('dependent_libraries', '').split(','),
            "input_parameters": task['input_parameters'],
            "retries": task['retries'],
            "timeout": task['timeout'],
            "depends_on": task.get('depends_on', [])
        }
        yaml_structure['workflow']['tasks'].append(yaml_task)

    return yaml.dump(yaml_structure, default_flow_style=False)

def create_workflow_ha_config(workflow: Workflow):
    """
    Create the HA config of the workflow.

    :param workflow: Workflow object
    :return: Updated workflow with modified HA config.
    """
    env = get_env()
    compute_utils = ClusterUtils(env)
    user_email = workflow.created_by

    for task in workflow.tasks:
        ha_config = task.ha_config
        cluster_id = task.attached_cluster.cluster_id

        if ha_config and ha_config.enable_ha and task.cluster_type == BASIC:
            return Exception("High Availability for task is not available for all purpose cluster")

        if not ha_config or task.cluster_type == BASIC:
            continue

        clusters = []
        if ha_config.enable_ha:
            if ha_config.cluster_ids:
                clusters = ha_config.cluster_ids
            else:
                clusters = [
                    compute_utils.create_cluster_from_job_definition_v2(cluster_id, user_email)
                    for _ in range(ha_config.replication_factor)
                ]
        ha_config.cluster_ids = clusters

    return workflow

def update_workflow_ha_config(workflow: Workflow, existing_workflow_resp):
    """
    Update the HA config of the workflow.

    :param workflow: Workflow object
    :return: Updated workflow with modified HA config.
    """
    env = get_env()
    compute_utils = ClusterUtils(env)
    user_email = workflow.created_by

    for task in workflow.tasks:
        ha_config = task.ha_config
        cluster_id = task.attached_cluster.cluster_id
        existing_task = next(
            (t for t in existing_workflow_resp['tasks'] if t['task_name'] == task.task_name),
            None
        )

        if ha_config and ha_config.enable_ha and task.cluster_type == BASIC:
            return Exception("High Availability for task is not available for all purpose cluster")

        existing_clusters = []
        if existing_task:
            existing_ha_config = existing_task['ha_config']
            if existing_ha_config and existing_ha_config['enable_ha']:
                if existing_ha_config['cluster_ids']:
                    existing_clusters = existing_ha_config['cluster_ids']

        if existing_clusters:
            for cluster in existing_clusters:
                compute_utils.stop_cluster(cluster)
                LOGGER.info(f"Stopping cluster {cluster}")

        if not ha_config or task.cluster_type == BASIC:
            continue

        clusters = []
        if ha_config.enable_ha:
            if ha_config.cluster_ids:
                clusters = ha_config.cluster_ids
            else:
                clusters = [
                    compute_utils.create_cluster_from_job_definition_v2(cluster_id, user_email)
                    for _ in range(ha_config.replication_factor)
                ]
        ha_config.cluster_ids = clusters


    return workflow


def get_trigger(run_id):
    if run_id and "manual" in run_id.lower():
        triggered_by = EXTERNAL
    else:
        triggered_by = SCHEDULED

    if run_id and "manual" in run_id.lower():
        run_type = MANUAL
    else:
        run_type = SCHEDULED

    return run_type, triggered_by


def update_run_in_db(run_id, workflow_id, state=None, end_time=None, sla_exceeded=None):
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