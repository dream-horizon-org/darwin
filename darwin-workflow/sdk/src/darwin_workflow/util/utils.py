from typing import Union
import logging

import yaml
from compute_model.compute_cluster import ComputeClusterDefinition
from typeguard import typechecked

from darwin_workflow.model.workflow_model import DarwinYaml, UpdateWorkflow, CreateWorkflow, WorkflowTask, YamlRequest
from workflow_model.job_cluster import CreateJobClusterDefinitionRequest
from workflow_model.response import WorkflowWorkflowIdGetResponseData
from workflow_model.workflow import CreateWorkflowRequest, Package

logger = logging.getLogger('darwin_workflow')

def read_yaml(file_path: str):
    """
    Reads and parses a YAML file.
    
    Args:
        file_path: Path to the YAML file
        
    Returns:
        Dictionary containing parsed YAML data
        
    Raises:
        Exception: If file cannot be read or YAML is invalid
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        data = yaml.safe_load(file)
        return data


def validate_workflow_data(workflow_data: dict):
    for task in workflow_data['tasks']:
        if 'dependent_libraries' in task and not isinstance(task['dependent_libraries'], list):
            raise Exception(
                "Dependent libraries field should be a list of string or empty."
                "Please format the yaml file correctly. "
                "Check the example yaml file for reference present in the documentation "
                "(https://app.gitbook.com/o/4LSU9ku5mbRRmXIp618W/s/zYqBEdbcZFclAUGnPe64/key-concepts/workflows/getting-started/schedule-a-dag-via-cli)."
            )


def get_workflow_definition_from_yaml_values(workflow_yaml_data: dict):
    validate_workflow_data(workflow_yaml_data)
    updated_tasks = []
    for task in workflow_yaml_data['tasks']:
        if isinstance(task['dependent_libraries'], list):
            task['dependent_libraries'] = ",".join(task['dependent_libraries'])
        else:
            task['dependent_libraries'] = ""

        updated_tasks.append(task)

    workflow_yaml_data['tasks'] = updated_tasks

    return CreateWorkflowRequest.from_dict(workflow_yaml_data)


# TODO write test - @test.user
def job_clusters_validation(cluster_info: dict):
    if "auto_termination_policies" in cluster_info:
        raise Exception("auto_termination_policies is not supported for job cluster")
    if "inactive_time" in cluster_info:
        raise Exception("inactive_time is not supported for job cluster")
    if "gpu_pod" in cluster_info["head_node"]["node"]:
        raise Exception("gpu_pod is not supported for job cluster")

    if 'worker_group' in cluster_info:
        for worker_group in cluster_info["worker_group"]:
            if "gpu_pod" in worker_group["node"]:
                raise Exception("gpu_pod is not supported for job cluster")


@typechecked
def get_job_cluster_definition_from_yaml_values(cluster_info: dict, cluster_name: str, user: str):
    job_clusters_validation(cluster_info)

    worker_group_list = []
    for worker_group in cluster_info['worker_group']:
        worker_group["cores_per_pods"] = worker_group['node']["cores"]
        worker_group["memory_per_pods"] = worker_group['node']["memory"]
        del worker_group['node']
        worker_group_list.append(worker_group)

    if "advance_config" in cluster_info:
        init_script = ""
        for commands in cluster_info["advance_config"]["init_script"]:
            init_script += commands + "\n"
        del cluster_info["advance_config"]["init_script"]
        cluster_info["advance_config"]["init_script"] = init_script

        if "ray_start_params" in cluster_info["advance_config"]:
            cluster_info["advance_config"]["ray_params"] = cluster_info["advance_config"]["ray_start_params"]
            if "object_store_memory_perc" in cluster_info["advance_config"]["ray_start_params"]:
                cluster_info["advance_config"]["ray_params"]["object_store_memory"] = \
                cluster_info["advance_config"]["ray_start_params"]["object_store_memory_perc"]

            if "num_cpus_on_head" in cluster_info["advance_config"]["ray_start_params"]:
                cluster_info["advance_config"]["ray_params"]["cpus_on_head"] = \
                cluster_info["advance_config"]["ray_start_params"]["num_cpus_on_head"]

            if "num_gpus_on_head" in cluster_info["advance_config"]["ray_start_params"]:
                cluster_info["advance_config"]["ray_params"]["gpus_on_head"] = \
                cluster_info["advance_config"]["ray_start_params"]["num_gpus_on_head"]

            del cluster_info["advance_config"]["ray_start_params"]

            cluster_info["advance_config"]["environment_variables"] = cluster_info["advance_config"][
                "env_variables"]

            del cluster_info["advance_config"]["env_variables"]

    job_cluster_definition = CreateJobClusterDefinitionRequest(
        cluster_name=cluster_name,
        tags=["job_cluster"],
        runtime=cluster_info['runtime'],
        inactive_time=-1,
        auto_termination_policies=[],
        head_node_config=cluster_info['head_node']['node'],
        worker_node_configs=worker_group_list,
        advance_config=cluster_info['advance_config'],
        user=user
    )

    return job_cluster_definition


def validate_cluster_type_in_cluster_and_workflow_yaml(yaml_data: dict):
    cluster_info_from_workflow_yaml = dict(
        [(x['cluster_id'], x['cluster_type']) for x in yaml_data['workflow']['tasks']])
    cluster_info_from_cluster_yaml = dict([(x['name'], x['is_job_cluster']) for x in yaml_data['clusters']])

    for cluster_id, cluster_type in cluster_info_from_workflow_yaml.items():
        if cluster_id in cluster_info_from_cluster_yaml:
            if cluster_type == "job" and not cluster_info_from_cluster_yaml[cluster_id]:
                raise Exception(f"Cluster type mismatch for cluster_id: {cluster_id} in workflow section yaml and "
                                f"clusters section yaml")
            if cluster_type == "basic" and cluster_info_from_cluster_yaml[cluster_id]:
                raise Exception(f"Cluster type mismatch for cluster_id: {cluster_id} in workflow section yaml and "
                                f"clusters section yaml")


def get_cluster_type_from_id(cluster_id: str):
    return "basic" if cluster_id.split("-")[0] == "id" else "job"


def map_worklfow_response_clusters(workflow_resp:WorkflowWorkflowIdGetResponseData):
    task_name_to_cluster_id_map = {}
    task_name_to_cluster_type_map = {}

    for workflow_resp_task in workflow_resp.tasks:
        workflow_resp_task_cluster_id = workflow_resp_task.attached_cluster.cluster_id
        task_name_to_cluster_id_map[workflow_resp_task.task_name] = workflow_resp_task_cluster_id
        task_name_to_cluster_type_map[workflow_resp_task.task_name] = get_cluster_type_from_id(
            workflow_resp_task_cluster_id)

    return task_name_to_cluster_id_map, task_name_to_cluster_type_map


def get_cluster_definition_from_yaml_values(cluster: dict,cluster_type:str):
    if cluster_type == "job":
        job_clusters_validation(cluster)

    cluster_definition=ComputeClusterDefinition.from_dict(cluster)
    if cluster_type == "job":
        return CreateJobClusterDefinitionRequest(**cluster_definition.convert())
    elif cluster_type == "basic":
        return cluster_definition


def get_pypi_package(yaml_package:dict):
    package = {'source': 'pypi', 'body': {
        'name': yaml_package['pypi']['package'].split('==')[0],
    }}
    if len(yaml_package['pypi']['package'].split('==')) > 1:
        package['body']['version'] = yaml_package['pypi']['package'].split('==')[1]
    if 'path' in yaml_package.keys():
        package['path'] = yaml_package['path']
    return package


def get_maven_package(yaml_package:dict):
    package = {'source': 'maven', 'body': {
        'name': yaml_package['maven']['package'],
        'version': yaml_package['maven']['version'],
        'metadata': {
            'repository': yaml_package['maven']['repository'],
        }
    }}
    if 'exclusions' in yaml_package['maven']:
        package['body']['metadata']['exclusions'] = yaml_package['maven']['exclusions']
    return package


def get_s3_package(yaml_package:dict):
    package = {'source': 's3', 'body': {
        'path': yaml_package['s3']['path']
    }}
    return package


def get_workspace_package(yaml_package:dict):
    package = {'source': 'workspace', 'body': {
        'path': yaml_package['workspace']['path']
    }}
    return package


def convert_task_packages(package_list)->list[dict]:

    # Convert task packages from User YAML fromat
    # into format of Workflow API contract
    try:
        transformed_packages = []
        for item in package_list:
            if 'pypi' in item.keys():
                package=get_pypi_package(item)
            elif 'maven' in item.keys():
                package=get_maven_package(item)
            elif 'workspace' in item.keys():
                package=get_workspace_package(item)
            else:
                package=get_s3_package(item)

            transformed_packages.append(package)

        return transformed_packages
    except Exception as e:
        raise Exception(f"Incorrect format of task packages - {e}")


def get_cluster_definition(yaml_data: dict)->dict[str, Union[dict[str, Union[CreateJobClusterDefinitionRequest, str]], dict[str, Union[ComputeClusterDefinition, str]]]]:
    clusters={}
    if 'clusters' not in yaml_data or yaml_data['clusters'] == []:
        # No clusters defined in YAML, all existing clusters will be used
        return clusters
    for cluster in yaml_data['clusters']:
        try:
            if cluster['is_job_cluster']:
                cluster_obj=get_cluster_definition_from_yaml_values(cluster=cluster, cluster_type='job')
                cluster_dict={'cluster':cluster_obj,'cluster_type':'job'}
                clusters[cluster_obj.cluster_name]=cluster_dict

            else :
                cluster_obj = get_cluster_definition_from_yaml_values(cluster=cluster, cluster_type='basic')
                cluster_dict = {'cluster': cluster_obj, 'cluster_type': 'basic'}
                clusters[cluster_obj.name]=cluster_dict

        except Exception as e:
            logger.exception(f"Incorrect cluster - {cluster['name']} definition - {e}")
            raise Exception(f"Incorrect cluster - {cluster['name']} definition - {e}")

    return clusters


def get_workflow_definition(yaml_data: dict, mode:str)->list[Union[ UpdateWorkflow,CreateWorkflow]]:
    # converts yaml data to workflow object
    workflows = []
    for workflow in yaml_data['workflows']:
        try:
            logger.info(f"Validating workflow {workflow['workflow_name']}")
            workflow_tasks = []
            for task in workflow['tasks']:
                task_lib = []

                if 'packages' in task:
                    for packages in task['packages']:
                        lib = Package(body=packages['body'], source=packages['source'])
                        task_lib.append(lib)

                workflow_tasks.append(WorkflowTask(packages=task_lib,
                                                          **{key: value for key, value in task.items() if
                                                             key != 'packages'}))
            workflow_object = (
                CreateWorkflow(tasks=workflow_tasks,
                                      **{key: value for key, value in workflow.items() if key != 'tasks'})
            ) if mode == 'CREATE' else (
                UpdateWorkflow(tasks=workflow_tasks,
                                      **{key: value for key, value in workflow.items() if key != 'tasks'}))
            workflows.append(workflow_object)

        except Exception as e:
            logger.exception(f"Incorrect workflow - {workflow['workflow_name']} definition - {e}")
            raise Exception(f"Incorrect workflow - {workflow['workflow_name']} definition - {e}")

    return workflows

def format_yaml_clusters(yaml_data:dict):
    """
    Formats and validates cluster definitions in YAML data.
    
    Ensures all necessary fields are present in cluster definitions
    and sets default values where needed.
    
    Args:
        yaml_data: Dictionary containing parsed YAML data
        
    Raises:
        Exception: If required fields are missing or invalid
    """
    # Format and validate cluster section in YAML
    if 'clusters' not in yaml_data or yaml_data['clusters'] == []:
        # No clusters defined in YAML, all existing clusters will be used
        return
    for cluster in yaml_data['clusters']:
        try:
            cluster['user'] = yaml_data['darwin']['created_by']
            if 'worker_group' not in cluster:
                cluster['worker_group'] = []
            if 'tags' not in cluster:
                cluster['tags'] = []
            if 'start_cluster' not in cluster:
                cluster['start_cluster'] = False
        except Exception as e:
            logger.exception(f"Incorrect cluster - {cluster['name']} definition - {e}")
            raise Exception(f"Incorrect cluster - {cluster['name']} definition - {e}")


def format_workflow_task(yaml_data:dict, base_dir:str):
    """
    Formats workflow tasks in YAML data with necessary fields.
    
    Updates task definitions with base directory and processes
    package information for each task.
    
    Args:
        yaml_data: Dictionary containing parsed YAML data
        base_dir: Base directory for resolving relative paths
        
    Raises:
        Exception: If required fields are missing or invalid
    """
    # Format workflow task section in YAML
    for workflow in yaml_data['workflows']:
        try:
            for task in workflow['tasks']:
                if 'source_type' not in task.keys():
                    task['source_type'] = 'workspace'

                task['file_path'] = task['source']
                task['source'] = base_dir

                #use cluster_name from clusters section of YAML, this name will help in mapping with clusters key of YAML

                if 'existing_cluster_id' in task.keys() and task['cluster_type']=='basic':
                    #use existing basic cluster
                    task['cluster_id'] = task['existing_cluster_id']
                else:
                    task['cluster_id'] = task['cluster_name']

                if 'packages' in task.keys():
                    task_packages = convert_task_packages(task['packages'])
                    task['packages'] = task_packages
        except Exception as e:
            logger.exception(f"Incorrect workflow - {workflow['name']} definition - {e}")
            raise Exception(f"Incorrect workflow - {workflow['workflow_name']} definition - {e}")


def transform_yaml_data(yaml_data: dict, mode:str):
    """
    Transforms raw YAML data into structured object models.
    
    Converts dictionary data into workflow and cluster definition objects
    suitable for API operations.
    
    Args:
        yaml_data: Dictionary containing parsed YAML data
        mode: Mode of operation ('CREATE' or 'UPDATE')
        
    Returns:
        YamlRequest object containing transformed data
        
    Raises:
        Exception: If transformation fails
    """
    # Converts Yaml dict to Workflow
    # and Cluster definition classes
    try:
        darwin_key=DarwinYaml(**yaml_data['darwin'])
        clusters=get_cluster_definition(yaml_data)
        workflows=get_workflow_definition(yaml_data, mode)
        return YamlRequest(clusters=clusters,workflows=workflows,darwin=darwin_key)
    except Exception as e:
        logger.exception(f"Incorrect YAML format - {e}")
        raise Exception(f"Incorrect YAML format - {e}")