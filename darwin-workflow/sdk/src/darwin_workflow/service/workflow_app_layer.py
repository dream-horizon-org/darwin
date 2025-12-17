from typing import Dict, Any

import requests
from darwin_workflow.model.workflow_model import CreateWorkflow, UpdateWorkflow
from workflow_model.job_cluster import CreateJobClusterDefinitionRequest
from workflow_model.workflow import CreateWorkflowRequest, UpdateWorkflowRequest
from darwin_workflow.constant.config import Config
from darwin_workflow.constant.constants import START_DATE


class WorkflowAppLayer:
    """
    WorkflowAppLayer class to interact with Workflow app layer service over http
    """

    def __init__(self, env: str):
        self.env = env
        self._config = Config(self.env)

    @staticmethod
    def _request(method: str, url: str, timeout=120, params: Dict[str, str] = None, headers: Dict[str, Any] = None,
                 payload: Dict[str, Any] = None):
        resp = requests.request(method, url, params=params, headers=headers, json=payload, timeout=timeout)
        resp_json = resp.json()
        if not 200 <= resp.status_code < 300:
            raise IOError(resp, resp_json)
        return resp_json

    def _get_url(self, endpoint: str):
        url = f"{self._config.get_workflow_url}{endpoint}"
        return url

    def get_workflow_ui_base_url(self):
        return self._config.get_workflow_ui_base_url

    def get_workflow_ui_url(self, wf_id: str):
        """
        Returns the workflow UI URL for a given workflow ID.
        """
        return f"{self.get_workflow_ui_base_url()}/{wf_id}/tasks"

    def create_workflow(self, workflow_request: CreateWorkflowRequest, user_email: str):
        url = self._get_url("/workflow")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = workflow_request.to_dict()
        resp = self._request(method="POST", url=url, payload=payload, headers=headers)
        return resp

    def create_workflow_async(self, workflow_request: CreateWorkflow, user_email: str):
        url = self._get_url("/v2/workflow")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = workflow_request.to_dict()
        resp = self._request(method="POST", url=url, payload=payload, headers=headers)
        return resp

    def update_workflow(self, workflow_id: str, workflow_request: CreateWorkflowRequest, user_email: str):
        url = self._get_url(f"/workflow/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = workflow_request.to_dict()
        resp = self._request(method="PUT", url=url, payload=payload, headers=headers)
        return resp

    def update_workflow_async(self, workflow_id: str, workflow_request: UpdateWorkflow, user_email: str):
        url = self._get_url(f"/v2/workflow/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = workflow_request.to_dict()
        resp = self._request(method="PUT", url=url, payload=payload, headers=headers)
        return resp

    def list_workflows(self, user_email: str = "SDK"):
        url = self._get_url("/workflows")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = {
            "query": "",
            "filters": {"user": [], "status": []},
            "page_size": 10000,
            "offset": 0,
            "sort_by": "created_at",
            "sort_order": "desc"
        }
        resp = self._request(method="POST", url=url, headers=headers, payload=payload)
        return resp

    def delete_workflow(self, workflow_id: str, user_email: str):
        url = self._get_url(f"/workflow/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="DELETE", url=url, headers=headers)
        return resp

    def run_with_params(self, workflow_name: str, user_email: str, params: dict = {}):
        url = self._get_url(f"/trigger/{workflow_name}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = {"params": params}
        resp = self._request(method="POST", url=url, payload=payload, headers=headers)
        return resp

    def trigger_workflow(self, workflow_id: str, user_email: str, params: dict = {}):
        url = self._get_url(f"/trigger/workflow/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = {"params": params}
        resp = self._request(method="POST", url=url, payload=payload, headers=headers)
        return resp

    def resume_workflow(self, workflow_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/resume_schedule/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="PUT", url=url, headers=headers)
        return resp

    def pause_workflow(self, workflow_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/pause_schedule/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="PUT", url=url, headers=headers)
        return resp

    def stop_run(self, workflow_name: str, workflow_id: str, run_id: str, user_email: str = "SDK"):
        if not workflow_id:
            workflow_id = self.get_workflow_id(workflow_name=workflow_name)['workflow_id']
        url = self._get_url(f"/stop_run/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = {"run_id": run_id}
        resp = self._request(method="PUT", url=url, payload=payload, headers=headers)
        return resp

    def get_workflow_details(self, workflow_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/v2/workflow/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="GET", url=url, headers=headers)
        return resp

    def get_workflow_id(self, workflow_name: str):
        url = self._get_url(f"/workflow_id")
        payload = {"workflow_name": workflow_name}
        resp = self._request(method="POST", url=url, payload=payload)
        return resp

    def get_workflow_runs(self, workflow_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/v2/runs/{workflow_id}")
        headers = {"msd-user": f'{{"id": "{user_email}"}}'}
        payload = {
            "end_date": "None",
            "filters": [],
            "offset": 0,
            "page_size": 1000,
            "start_date": START_DATE
        }
        resp = self._request(method="POST", url=url, headers=headers, payload=payload)
        return resp

    def get_workflow_run_details(self, workflow_id: str, run_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/v2/run_details/{workflow_id}")
        headers = {"msd-user": f'{{"id":5513,"email": "{user_email}"}}'}
        payload = {"run_id": run_id}
        resp = self._request(method="POST", url=url, headers=headers, payload=payload)
        return resp

    def get_workflow_task_details(self, workflow_id: str, run_id: str, task_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/v3/task_details/{workflow_id}")
        headers = {"msd-user": f'{{"id":5513,"email": "{user_email}"}}'}
        payload = {"run_id": run_id, "task_id": task_id}
        resp = self._request(method="POST", url=url, headers=headers, payload=payload)
        return resp

    def get_workflow_run_status(self, workflow_id: str, run_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/workflows/{workflow_id}/runs/{run_id}/status")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="GET", url=url, headers=headers)
        return resp

    def create_job_cluster_definition(self, job_cluster_definition: CreateJobClusterDefinitionRequest):
        url = self._get_url(f"/job-cluster-definition")
        payload = job_cluster_definition.to_dict()
        resp = self._request(method="POST", url=url, payload=payload)
        return resp

    def update_job_cluster_definition(self, job_cluster_definition: CreateJobClusterDefinitionRequest,
                                      job_cluster_definition_id: str):
        url = self._get_url(f"/job-cluster-definition/{job_cluster_definition_id}")
        payload = job_cluster_definition.to_dict()
        resp = self._request(method="PUT", url=url, payload=payload)
        return resp

    def list_job_cluster_definitions(self, user_email: str = "SDK",job_cluster_name:str=None):
        url = self._get_url(f"/job-cluster-definitions")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        params={'query':job_cluster_name } if job_cluster_name else {}
        resp = self._request(method="GET", url=url, headers=headers,params=params)
        return resp

    def get_job_cluster_definition(self, job_cluster_definition_id: str, user_email: str = "SDK"):
        url = self._get_url(f"/job-cluster-definitions/{job_cluster_definition_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="GET", url=url, headers=headers)
        return resp

    def check_job_cluster_unique_name(self, job_cluster_name: str, user_email: str = "SDK"):
        url = self._get_url(f"/check-unique-job-cluster")
        payload = {"cluster_name": job_cluster_name}
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        resp = self._request(method="POST", url=url, headers=headers,payload=payload)
        return resp

    def repair_workflow_run(self, workflow_id: str, run_id: str, selected_tasks: list, user_email: str = "SDK"):
        url = self._get_url(f"/v1/repair_run/{workflow_id}")
        headers = {"msd-user": f'{{"email": "{user_email}"}}'}
        payload = {"run_id": run_id, "selected_tasks": selected_tasks}
        resp = self._request(method="PUT", url=url, headers=headers, payload=payload)
        return resp