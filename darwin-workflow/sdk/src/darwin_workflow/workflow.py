import os
import uuid

import yaml
from darwin_compute.compute import ComputeCluster
from typeguard import typechecked

from workflow_model.job_cluster import CreateJobClusterDefinitionRequest
from workflow_model.workflow import CreateWorkflowRequest
from darwin_workflow.service.workflow_app_layer import WorkflowAppLayer
from darwin_workflow.util.utils import read_yaml, get_job_cluster_definition_from_yaml_values, \
validate_cluster_type_in_cluster_and_workflow_yaml, get_workflow_definition_from_yaml_values


@typechecked
class WorkflowSDK:
    """
    Workflow SDK
    """

    def __init__(self, env: str):
        self.env = env
        self.app_layer = WorkflowAppLayer(self.env)

    def create_workflow(self, workflow_request: CreateWorkflowRequest, user_email: str = "SDK"):
        return self.app_layer.create_workflow(workflow_request=workflow_request, user_email=user_email)

    def create_workflow_async(self, workflow_request: CreateWorkflowRequest, user_email: str = "SDK"):
        return self.app_layer.create_workflow_async(workflow_request=workflow_request, user_email=user_email)

    def update_workflow(self, workflow_id: str, workflow_request: CreateWorkflowRequest, user_email: str = "SDK"):
        return self.app_layer.update_workflow(workflow_id=workflow_id, workflow_request=workflow_request,
                                              user_email=user_email)

    def update_workflow_async(self, workflow_id: str, workflow_request: CreateWorkflowRequest, user_email: str = "SDK"):
        return self.app_layer.update_workflow_async(workflow_id=workflow_id, workflow_request=workflow_request,
                                                    user_email=user_email)

    def list_workflows(self):
        return self.app_layer.list_workflows()

    def delete_workflow(self, workflow_id: str, user_email: str = "SDK"):
        return self.app_layer.delete_workflow(workflow_id=workflow_id, user_email=user_email)

    def create_with_yaml(self, file_path: str):
        yaml_data = read_yaml(file_path)

        self.__create_cluster(yaml_data)

        workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
        return self.create_workflow(workflow_request=workflow_request, user_email=yaml_data["workflow"]['created_by'])

    def create_with_yaml_async(self, file_path: str):
        yaml_data = read_yaml(file_path)

        self.__create_cluster(yaml_data)

        workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
        return self.create_workflow_async(workflow_request=workflow_request,
                                          user_email=yaml_data["workflow"]['created_by'])

    def update_with_yaml(self, workflow_id: str, file_path: str):
        yaml_data = read_yaml(file_path)

        self.__create_cluster(yaml_data)

        workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
        return self.update_workflow(workflow_id=workflow_id, workflow_request=workflow_request,
                                    user_email=yaml_data["workflow"]['created_by'])

    def update_with_yaml_async(self, workflow_id: str, file_path: str):
        yaml_data = read_yaml(file_path)

        self.__create_cluster(yaml_data)

        workflow_request: CreateWorkflowRequest = get_workflow_definition_from_yaml_values(yaml_data["workflow"])
        return self.update_workflow_async(workflow_id=workflow_id, workflow_request=workflow_request,
                                          user_email=yaml_data["workflow"]['created_by'])

    def run_with_params(self, workflow_name: str, params: dict = {}, user_email: str = "SDK"):
        return self.app_layer.run_with_params(workflow_name=workflow_name, user_email=user_email, params=params)

    def trigger_workflow(self, workflow_id: str, params: dict = {}, user_email: str = "SDK"):
        return self.app_layer.trigger_workflow(workflow_id=workflow_id, user_email=user_email, params=params)

    def stop_run(self, run_id: str, workflow_name: str = "", workflow_id: str = ""):
        return self.app_layer.stop_run(workflow_name=workflow_name, workflow_id=workflow_id, run_id=run_id)

    def get_workflow_details(self, workflow_id: str):
        return self.app_layer.get_workflow_details(workflow_id=workflow_id)

    def get_workflow_by_name(self, workflow_name: str):
        return self.app_layer.get_workflow_id(workflow_name=workflow_name)

    def __create_cluster(self, yaml_data: dict):
        validate_cluster_type_in_cluster_and_workflow_yaml(yaml_data)

        compute_sdk = ComputeCluster(self.env, user=yaml_data['workflow']['created_by'])

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
                    res = self.app_layer.create_job_cluster_definition(job_cluster_definition=job_cluster_definition)
                    cluster_id = res['data']['job_cluster_definition_id']
                else:
                    cluster_id = compute_sdk.create_with_yaml(f"{random_cluster_name}.yaml",cluster_info['start_cluster'])["data"]["cluster_id"]

                cluster_map[cluster_name] = {"id": cluster_id}
                os.remove(f"{random_cluster_name}.yaml")

        for task in yaml_data['workflow']['tasks']:
            if task['cluster_id'] in cluster_map:
                cluster_id = cluster_map[task['cluster_id']]['id']
                task['cluster_id'] = cluster_id

    def get_workflow_runs(self, workflow_id: str):
        return self.app_layer.get_workflow_runs(workflow_id=workflow_id)

    def get_workflow_run_details(self, workflow_id: str, run_id: str):
        return self.app_layer.get_workflow_run_details(workflow_id=workflow_id, run_id=run_id)

    def get_workflow_task_details(self, workflow_id: str, run_id: str, task_id: str):
        return self.app_layer.get_workflow_task_details(workflow_id=workflow_id, run_id=run_id, task_id=task_id)

    def resume_workflow(self, workflow_id: str):
        return self.app_layer.resume_workflow(workflow_id=workflow_id)

    def pause_workflow(self, workflow_id: str):
        return self.app_layer.pause_workflow(workflow_id=workflow_id)

    def get_workflow_run_status(self, workflow_id: str, run_id: str = ""):
        return self.app_layer.get_workflow_run_status(workflow_id=workflow_id, run_id=run_id)

    def list_job_cluster_definitions(self):
        return self.app_layer.list_job_cluster_definitions()

    def create_job_cluster_definition(self, job_cluster_definition: CreateJobClusterDefinitionRequest):
        return self.app_layer.create_job_cluster_definition(job_cluster_definition=job_cluster_definition)

    def update_job_cluster_definition(self, job_cluster_definition: CreateJobClusterDefinitionRequest,
                                      job_cluster_definition_id: str):
        return self.app_layer.update_job_cluster_definition(job_cluster_definition=job_cluster_definition,
                                                            job_cluster_definition_id=job_cluster_definition_id)

    def get_job_cluster_definition(self, job_cluster_definition_id: str):
        return self.app_layer.get_job_cluster_definition(job_cluster_definition_id=job_cluster_definition_id)

    def repair_workflow_run(self, workflow_id: str, run_id: str, selected_tasks: list):
        return self.app_layer.repair_workflow_run(workflow_id=workflow_id, run_id=run_id, selected_tasks=selected_tasks)