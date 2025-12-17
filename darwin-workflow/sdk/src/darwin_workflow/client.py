import json
import os
import uuid
from typing import Union

import yaml
import darwin_compute
from compute_model.compute_cluster import ComputeClusterDefinition

from darwin_workflow.model.workflow_model import CreateWorkflow, UpdateWorkflow, YamlRequest
from workflow_model.job_cluster import CreateJobClusterDefinitionRequest
from workflow_model.workflow import CreateWorkflowRequest
from darwin_workflow.service.workflow_app_layer import WorkflowAppLayer
from darwin_workflow.util.utils import read_yaml, get_job_cluster_definition_from_yaml_values, \
    validate_cluster_type_in_cluster_and_workflow_yaml, get_workflow_definition_from_yaml_values, transform_yaml_data, \
    format_workflow_task, format_yaml_clusters
from darwin_workflow.util.logging_util import raise_on_failure, get_final_log_message, get_error_message
from darwin_workflow.constant.logging_config import setup_logging

"""
Workflow SDK
"""
env = os.environ.get("ENV", "prod")
app_layer = WorkflowAppLayer(env)
compute_sdk = darwin_compute

# Setup logging
logger = setup_logging()

def _check_existing_job_cluster_definition(workflows_job_cluster:list, clusters_cluster_data:dict, created_cluster_name_to_id_map:dict):
    """
    Checks for uniqueness of job cluster names and validates job cluster definitions.
    
    If a cluster name is not unique, compares the existing cluster definition with 
    the one defined in YAML to verify they match.
    
    Args:
        workflows_job_cluster: List of job cluster names from workflow tasks
        clusters_cluster_data: Dictionary mapping cluster names to their definitions
        created_cluster_name_to_id_map: Dictionary to store mapping of cluster names to IDs
        
    Raises:
        Exception: If a cluster name is not unique and definitions don't match
    """
    workflow_cluster_visited = set()
    for yaml_cluster_name in workflows_job_cluster:
        if yaml_cluster_name in workflow_cluster_visited:
            # validated this cluster already
            continue
        else:
            workflow_cluster_visited.add(yaml_cluster_name)

        is_unique = app_layer.check_job_cluster_unique_name(yaml_cluster_name)['data']['is_unique']

        if not is_unique:
            resp = app_layer.list_job_cluster_definitions(job_cluster_name=yaml_cluster_name)
            for data in resp['data']:
                existing_cluster_name = data['cluster_name']
                existing_cluster_id = data['job_cluster_definition_id']
                if existing_cluster_name == yaml_cluster_name:
                    job_resp = app_layer.get_job_cluster_definition(existing_cluster_id)['data']
                    job_cluster_definition = CreateJobClusterDefinitionRequest(**job_resp)
                    yaml_cluster_definition = CreateJobClusterDefinitionRequest(
                        **ComputeClusterDefinition.from_dict(clusters_cluster_data[yaml_cluster_name]).convert())
                    if job_cluster_definition != yaml_cluster_definition:
                        logger.exception(f'Cluster {yaml_cluster_name} is not unique')
                        raise Exception(f'Cluster {yaml_cluster_name} is not unique')
                    else:
                        created_cluster_name_to_id_map[yaml_cluster_name] = existing_cluster_id
                    break
        else:
            continue

def _validate_clusters_in_yaml(yaml_data: dict,created_cluster_name_to_id_map:dict):
    """
    Performs validations related to clusters in YAML data.
    
    Args:
        yaml_data: Dictionary containing parsed YAML data
        created_cluster_name_to_id_map: Dictionary to map cluster names to their IDs
        
    Raises:
        Exception: If duplicate cluster name is found or cluster is not unique
    """

    if 'clusters' not in yaml_data or yaml_data['clusters'] == []:
        # No clusters defined in YAML, all existing clusters will be used
        return

    workflows_job_cluster =[]
    for workflow in yaml_data['workflows']:
        try:
            for task in workflow['tasks']:
                if task['cluster_type'] == 'job':
                    workflows_job_cluster.append(task['cluster_id'])
        except Exception as e:
            logger.exception(f"Incorrect workflow - {workflow['workflow_name']} definition - {e}")
            raise Exception(f"Incorrect workflow - {workflow['workflow_name']} definition in YAML: {e}")

    clusters_cluster_data = {}

    for cluster_info in yaml_data['clusters']:
        if cluster_info['name'] in clusters_cluster_data.keys():
            logger.exception(f"Duplicate cluster name - {cluster_info['name']} ")
            raise Exception(f"ERROR: Duplicate cluster name - {cluster_info['name']} ")
        clusters_cluster_data[cluster_info['name']] = cluster_info

    _check_existing_job_cluster_definition(workflows_job_cluster,clusters_cluster_data,created_cluster_name_to_id_map)


def _validate_and_transform_data_from_yaml(file_path: str,created_by:str, mode:str ,created_cluster_name_to_id_map:dict)->YamlRequest:
    """
    Validates YAML data and transforms it into YamlRequest object.
    
    Args:
        file_path: Path to the YAML file
        created_by: User who created the workflow
        mode: Mode of operation ('CREATE' or 'UPDATE')
        created_cluster_name_to_id_map: Dictionary to map cluster names to their IDs
        
    Returns:
        YamlRequest object containing validated and transformed data
        
    Raises:
        Exception: If validation fails or transformation error occurs
    """
    logger.info(f"Validating YAML file: {file_path}")

    yaml_data = read_yaml(file_path)

    if 'created_by' not in yaml_data['darwin']:
        yaml_data['darwin']['created_by'] = created_by if created_by else "SDK"

    format_yaml_clusters(yaml_data)

    format_workflow_task(yaml_data, yaml_data['darwin']['base_dir'])

    _validate_clusters_in_yaml(yaml_data=yaml_data ,created_cluster_name_to_id_map=created_cluster_name_to_id_map)

    return transform_yaml_data(yaml_data,mode)


def _create_cluster(cluster_from_yaml:dict):
    """
    Creates job or basic cluster from the definition with same name in clusters section of YAML.
    
    Args:
        cluster_from_yaml: Cluster definition from YAML
        
    Returns:
        cluster_id: ID of the created cluster
        
    Raises:
        Exception: If cluster creation fails
    """
    try:
        if cluster_from_yaml['cluster_type'] == "job":
            yaml_cluster_name = cluster_from_yaml['cluster'].cluster_name
            resp = app_layer.create_job_cluster_definition(cluster_from_yaml['cluster'])
            cluster_id = resp['data']['job_cluster_definition_id']
        else:
            yaml_cluster_name = cluster_from_yaml['cluster'].name
            cluster_id = compute_sdk.create(cluster_from_yaml['cluster'])['data']['cluster_id']

        return cluster_id
    except Exception as e:
        logger.exception(f"Failed to create cluster - {cluster_from_yaml['cluster']} - {e}")
        raise Exception(f'Failed to create cluster {yaml_cluster_name}: {e}')


def _stop_and_delete_basic_clusters(created_basic_cluster_ids_of_current_workflow:list, created_cluster_name_to_id_map:dict,clusters_from_yaml:dict):
    """
    Stops and deletes basic clusters that were created during workflow creation/update.
    
    Args:
        created_basic_cluster_ids_of_current_workflow: List of dictionaries mapping cluster names to IDs
        created_cluster_name_to_id_map: Dictionary mapping cluster names to their IDs
        clusters_from_yaml: Dictionary containing cluster definitions from YAML
    """
    # stop and delete the basic clusters created
    for cluster in created_basic_cluster_ids_of_current_workflow:
        for cluster_name, cluster_id in cluster.items():
            if clusters_from_yaml[cluster_name]['cluster'].start_cluster:
                # if cluster is started, stop it
                compute_sdk.stop(cluster_id=cluster_id)

            compute_sdk.delete(cluster_id=cluster_id)
            del created_cluster_name_to_id_map[cluster_name]


def _attach_cluster_to_task(yaml_workflow:Union[CreateWorkflow,UpdateWorkflow],created_cluster_name_to_id_map:dict,clusters_from_yaml:dict):
    """
    Attaches clusters to workflow tasks by replacing cluster names with cluster IDs.
    
    Args:
        yaml_workflow: Workflow object (CreateWorkflow or UpdateWorkflow)
        created_cluster_name_to_id_map: Dictionary mapping cluster names to their IDs
        clusters_from_yaml: Dictionary containing cluster definitions from YAML
        
    Returns:
        List of dictionaries mapping cluster names to IDs for basic clusters created for this workflow
        
    Raises:
        Exception: If cluster creation fails
    """
    basic_clusters_of_current_workflow = []
    for task in yaml_workflow.tasks:
        #use basic cluster's existing id
        if task.existing_cluster_id and task.cluster_type=='basic':
            continue

        # cluster already created in previous iteration OR using existing job cluster definition
        if task.cluster_id in created_cluster_name_to_id_map.keys():
            task.cluster_id = created_cluster_name_to_id_map[task.cluster_id]
        else:
            created_cluster_id = _create_cluster(clusters_from_yaml[task.cluster_id])
            if task.cluster_type == 'basic':
                basic_clusters_of_current_workflow.append({task.cluster_id: created_cluster_id})
            created_cluster_name_to_id_map[task.cluster_id] = created_cluster_id
            task.cluster_id = created_cluster_id
    return basic_clusters_of_current_workflow

def _attach_cluster_and_create_workflows(workflows_from_yaml:list[Union[CreateWorkflow, UpdateWorkflow]], clusters_from_yaml:dict, exit_on_failure:bool, created_by:str, workflows_create_resp:list, workflow_creation_failures:list,created_cluster_name_to_id_map:dict,dry_run: bool):
    """
    Replaces task's cluster_id with actual cluster IDs and creates workflows.
    
    Args:
        workflows_from_yaml: List of workflow objects from YAML
        clusters_from_yaml: Dictionary containing cluster definitions from YAML
        exit_on_failure: Whether to exit on failure
        created_by: User who created the workflow
        workflows_create_resp: List to store successfully created workflow names
        workflow_creation_failures: List to store workflow names that failed to create
        created_cluster_name_to_id_map: Dictionary mapping cluster names to their created/existing IDs
        dry_run: Whether to perform validation only without creating workflows
        
    Raises:
        Exception: If workflow creation fails and exit_on_failure is True
    """
    for yaml_workflow in workflows_from_yaml:
        try:
            try:
                if not dry_run:
                    logger.info(f"Creating workflow - {yaml_workflow.workflow_name}")
                get_workflow_by_name(yaml_workflow.workflow_name)
                raise Exception(f"Workflow - {yaml_workflow.workflow_name} already exists")
            except Exception as e:
                if len(e.args) == 2:
                    resp, resp_json = e.args
                    # If Status 404 for Workflow not exist, proceed to create else raise
                    if getattr(resp, "status_code", None) != 404:
                        raise e
                else:
                    #Handle other exceptions due to connection, timeout
                    raise e
            if dry_run:
                continue

            basic_clusters_of_current_workflow = _attach_cluster_to_task(yaml_workflow, created_cluster_name_to_id_map,
                                                                         clusters_from_yaml)
            try:
                resp = create_workflow_async(yaml_workflow, user_email=created_by)
                wf_ui = app_layer.get_workflow_ui_url(wf_id=resp['data']['workflow_id'])
                workflows_create_resp.append(resp['data']['workflow_name'])
                logger.info(f"Successfully created workflow - {yaml_workflow.workflow_name} . Available at : {wf_ui}")
            except Exception as e:
                #workflow creation failed, so delete attached basic clusters that were created
                _stop_and_delete_basic_clusters(basic_clusters_of_current_workflow,created_cluster_name_to_id_map,clusters_from_yaml)
                raise e
        except Exception as e:
            logger.exception(f"Failed to create workflow - {yaml_workflow.workflow_name} - {e}")
            workflow_creation_failures.append(yaml_workflow.workflow_name)
            err_message,err = get_error_message(e,dry_run, yaml_workflow.workflow_name, operation="creating")
            raise_on_failure(err=f"{err_message} - {err}",exit_on_failure=exit_on_failure)


def create_workflows_with_yaml(file_path: str, dry_run:bool=False, created_by:str="SDK", exit_on_failure:bool=False):
    """
    Args:
        file_path: YAML file path
        created_by: user_name
        dry_run: Check for validation,
                  If True, will validate
                  user request without actually applying user request
                  If False, will create workflows after validation
        exit_on_failure:
                  true: exits as any request fails,
                  False: continue executing next request after any request fails
    """
    workflows_create_resp = []
    workflow_creation_failures = []
    try:
        created_cluster_name_to_id_map={}
        yaml_request:YamlRequest= _validate_and_transform_data_from_yaml(file_path,created_by=created_by,mode="CREATE",created_cluster_name_to_id_map=created_cluster_name_to_id_map)

        clusters_from_yaml=yaml_request.clusters
        workflows_from_yaml=yaml_request.workflows
        created_by=yaml_request.darwin.created_by

        _attach_cluster_and_create_workflows(workflows_from_yaml, clusters_from_yaml, exit_on_failure, created_by, workflows_create_resp, workflow_creation_failures,created_cluster_name_to_id_map,dry_run)

        get_final_log_message(workflows_create_resp, workflow_creation_failures, dry_run, operation="creating")
    except Exception as e:
        if dry_run:
            logger.exception(f"Validation failed with error - {e}")
        else:
            logger.exception(f"Failed to create workflows - {e}")


def attach_cluster_and_update_workflows(workflows_from_yaml:list[Union[CreateWorkflow, UpdateWorkflow]], clusters_from_yaml:dict, exit_on_failure:bool, created_by:str, workflows_update_resp:list, workflow_updation_failures:list,created_cluster_name_to_id_map:dict,dry_run:bool):
    """
    Replaces task's cluster_id with actual cluster IDs and updates workflows.
    
    Args:
        workflows_from_yaml: List of workflow objects from YAML
        clusters_from_yaml: Dictionary containing cluster definitions from YAML
        exit_on_failure: Whether to exit on failure
        created_by: User who created the workflow
        workflows_update_resp: List to store successfully updated workflow names
        workflow_updation_failures: List to store workflow names that failed to update
        created_cluster_name_to_id_map: Dictionary mapping cluster names to their created/existing IDs
        dry_run: Whether to perform validation only without updating workflows
        
    Raises:
        Exception: If workflow update fails and exit_on_failure is True
    """
    for yaml_workflow in workflows_from_yaml:
        try:
            if not dry_run:
                logger.info(f"Updating workflow - {yaml_workflow.workflow_name}")
            workflow_name = yaml_workflow.workflow_name
            workflow_id = get_workflow_by_name(workflow_name=workflow_name)['workflow_id']

            if dry_run:
                continue

            basic_clusters_of_current_workflow = _attach_cluster_to_task(yaml_workflow, created_cluster_name_to_id_map,
                                                                         clusters_from_yaml)
            try:
                updated_workflow_resp = update_workflow_async(workflow_request=yaml_workflow, workflow_id=workflow_id,
                                                              user_email=created_by)
                workflows_update_resp.append(updated_workflow_resp['data']['workflow_name'])
                wf_ui = app_layer.get_workflow_ui_url(wf_id=updated_workflow_resp['data']['workflow_id'])
                logger.info(f"Successfully Updated workflow - {yaml_workflow.workflow_name}. Check at : {wf_ui}")
            except Exception as e:
                # workflow update failed, so delete attached basic clusters that were created
                _stop_and_delete_basic_clusters(basic_clusters_of_current_workflow, created_cluster_name_to_id_map,
                                                clusters_from_yaml)
                raise e
        except Exception as e:
            workflow_updation_failures.append(yaml_workflow.workflow_name)
            err_message,err = get_error_message(e,dry_run, yaml_workflow.workflow_name, operation="updating")
            raise_on_failure(err=f"{err_message} - {err}",exit_on_failure=exit_on_failure)


def update_workflows_with_yaml(file_path: str, dry_run:bool=False, created_by:str="SDK", exit_on_failure:bool=False):
    """
    Args:
        file_path: YAML file path
        created_by: user_name
        dry_run: Check for validation,
                  If True, will validate user request without actually applying user request
                  If False, will apply user request after validation
        exit_on_failure:
                 true: exits as soon as any request fails,
                 False: continue executing next request after any request fails
    """
    workflows_update_resp = []
    workflow_updation_failures = []
    try:
        created_cluster_name_to_id_map = {}
        yaml_request: YamlRequest = _validate_and_transform_data_from_yaml(file_path, created_by=created_by,mode="UPDATE",created_cluster_name_to_id_map=created_cluster_name_to_id_map)

        clusters_from_yaml = yaml_request.clusters
        workflows_from_yaml = yaml_request.workflows
        darwin_key = yaml_request.darwin
        created_by = darwin_key.created_by
        attach_cluster_and_update_workflows(workflows_from_yaml,clusters_from_yaml,exit_on_failure,created_by,workflows_update_resp, workflow_updation_failures,created_cluster_name_to_id_map,dry_run)

        get_final_log_message(workflows_update_resp, workflow_updation_failures, dry_run, operation="updating")
    except Exception as e:
        if dry_run:
            logger.exception(f"Validation failed with error - {str(e)}")
        else:
            logger.exception(f"Failed to update workflows - {str(e)}")


def create_workflow(workflow_request: CreateWorkflowRequest, user_email: str = "SDK"):
    return app_layer.create_workflow(workflow_request=workflow_request, user_email=user_email)


def create_workflow_async(workflow_request: CreateWorkflow, user_email: str = "SDK"):
    """
    Creates a workflow asynchronously.
    
    Args:
        workflow_request: CreateWorkflow object containing workflow definition
        user_email: Email of the user creating the workflow
        
    Returns:
        Response from the API with workflow creation details
    """
    return app_layer.create_workflow_async(workflow_request=workflow_request, user_email=user_email)


def update_workflow(workflow_id: str, workflow_request: CreateWorkflowRequest, user_email: str = "SDK"):
    return app_layer.update_workflow(workflow_id=workflow_id, workflow_request=workflow_request,
                                     user_email=user_email)


def update_workflow_async(workflow_id: str, workflow_request: UpdateWorkflow, user_email: str = "SDK"):
    """
    Updates a workflow asynchronously.
    
    Args:
        workflow_id: ID of the workflow to update
        workflow_request: UpdateWorkflow object containing workflow definition
        user_email: Email of the user updating the workflow
        
    Returns:
        Response from the API with workflow update details
    """
    return app_layer.update_workflow_async(workflow_id=workflow_id, workflow_request=workflow_request,
                                           user_email=user_email)


def list_workflows():
    return app_layer.list_workflows()


def delete_workflow(workflow_id: str, user_email: str = "SDK"):
    return app_layer.delete_workflow(workflow_id=workflow_id, user_email=user_email)


def create_with_yaml(file_path: str):
    yaml_data = read_yaml(file_path)

    __create_cluster(yaml_data)

    workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
    return create_workflow(workflow_request=workflow_request, user_email=yaml_data["workflow"]['created_by'])


def create_with_yaml_async(file_path: str):
    yaml_data = read_yaml(file_path)

    __create_cluster(yaml_data)

    workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
    return create_workflow_async(workflow_request=workflow_request,
                                 user_email=yaml_data["workflow"]['created_by'])


def update_with_yaml(workflow_id: str, file_path: str):
    yaml_data = read_yaml(file_path)

    __create_cluster(yaml_data)

    workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
    return update_workflow(workflow_id=workflow_id, workflow_request=workflow_request,
                           user_email=yaml_data["workflow"]['created_by'])


def update_with_yaml_async(workflow_id: str, file_path: str):
    yaml_data = read_yaml(file_path)

    __create_cluster(yaml_data)

    workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
    return update_workflow_async(workflow_id=workflow_id, workflow_request=workflow_request,
                                 user_email=yaml_data["workflow"]['created_by'])


def run_with_params(workflow_name: str, params: dict = {}, user_email: str = "SDK"):
    return app_layer.run_with_params(workflow_name=workflow_name, user_email=user_email, params=params)


def trigger_workflow(workflow_id: str, params: dict = {}, user_email: str = "SDK"):
    return app_layer.trigger_workflow(workflow_id=workflow_id, user_email=user_email, params=params)


def stop_run(run_id: str, workflow_name: str = "", workflow_id: str = ""):
    return app_layer.stop_run(workflow_name=workflow_name, workflow_id=workflow_id, run_id=run_id)


def get_workflow_details(workflow_id: str):
    return app_layer.get_workflow_details(workflow_id=workflow_id)


def get_workflow_by_name(workflow_name: str):
    """
    Retrieves a workflow by its name.
    
    Args:
        workflow_name: Name of the workflow to retrieve
        
    Returns:
        Dictionary containing workflow details including workflow_id
        
    Raises:
        Exception: If workflow with given name doesn't exist
    """
    return app_layer.get_workflow_id(workflow_name=workflow_name)


def __create_cluster(yaml_data: dict):
    validate_cluster_type_in_cluster_and_workflow_yaml(yaml_data)

    cluster_map = {}

    if 'clusters' in yaml_data:
        for cluster_info in yaml_data['clusters']:
            cluster_name = cluster_info['name']
            random_suffix = str(uuid.uuid4())[:8]
            random_cluster_name = f"{cluster_name}_{random_suffix}"

            with open(f"{random_cluster_name}.yaml", "w") as f:
                yaml.dump(cluster_info, f)

            if "is_job_cluster" in cluster_info and cluster_info['is_job_cluster'] is True:
                job_cluster_definition = get_job_cluster_definition_from_yaml_values(
                    cluster_info=cluster_info,
                    cluster_name=random_cluster_name,
                    user=yaml_data["workflow"]['created_by']
                )
                res = app_layer.create_job_cluster_definition(job_cluster_definition=job_cluster_definition)
                cluster_id = res['data']['job_cluster_definition_id']
            else:
                cluster_id = \
                    compute_sdk.create_with_yaml(f"{random_cluster_name}.yaml", cluster_info['start_cluster'])["data"][
                        "cluster_id"]

            cluster_map[cluster_name] = {"id": cluster_id}
            os.remove(f"{random_cluster_name}.yaml")

    for task in yaml_data['workflow']['tasks']:
        if task['cluster_id'] in cluster_map:
            cluster_id = cluster_map[task['cluster_id']]['id']
            task['cluster_id'] = cluster_id


def get_workflow_runs(workflow_id: str):
    return app_layer.get_workflow_runs(workflow_id=workflow_id)


def get_workflow_run_details(workflow_id: str, run_id: str):
    return app_layer.get_workflow_run_details(workflow_id=workflow_id, run_id=run_id)


def get_workflow_task_details(workflow_id: str, run_id: str, task_id: str):
    return app_layer.get_workflow_task_details(workflow_id=workflow_id, run_id=run_id, task_id=task_id)


def resume_workflow(workflow_id: str):
    return app_layer.resume_workflow(workflow_id=workflow_id)


def pause_workflow(workflow_id: str):
    return app_layer.pause_workflow(workflow_id=workflow_id)


def get_workflow_run_status(workflow_id: str, run_id: str = ""):
    return app_layer.get_workflow_run_status(workflow_id=workflow_id, run_id=run_id)


def list_job_cluster_definitions():
    return app_layer.list_job_cluster_definitions()


def create_job_cluster_definition(job_cluster_definition: CreateJobClusterDefinitionRequest):
    return app_layer.create_job_cluster_definition(job_cluster_definition=job_cluster_definition)


def update_job_cluster_definition(job_cluster_definition: CreateJobClusterDefinitionRequest,
                                  job_cluster_definition_id: str):
    return app_layer.update_job_cluster_definition(job_cluster_definition=job_cluster_definition,
                                                   job_cluster_definition_id=job_cluster_definition_id)


def get_job_cluster_definition(job_cluster_definition_id: str):
    return app_layer.get_job_cluster_definition(job_cluster_definition_id=job_cluster_definition_id)


def repair_workflow_run(workflow_id: str, run_id: str, selected_tasks: list):
    return app_layer.repair_workflow_run(workflow_id=workflow_id, run_id=run_id, selected_tasks=selected_tasks)
