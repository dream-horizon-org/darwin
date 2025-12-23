import os

os.environ["ENV"] = 'stag'

from unittest import TestCase

from sdk.src.darwin_workflow import client
from workflow_model.workflow import WorkflowTaskRequest, CreateWorkflowRequest


class TestWorkflowSDK(TestCase):
    def setUp(self):
        self.env = "stag"
        self.sdk = client
        self.email = "test.user@example.com"
        self.workflow_id = "wf_id-34ursrxnfcajeab6is8bhx5thf"
        self.workflow_name = "workflow_sdk_test_case"
        self.run_id = "manual__2023-12-06T13:25:16.836593+00:00"
        self.task = WorkflowTaskRequest(
            task_name="test_1",
            source="https://github.com/darwin/FACT/tree/scraping_jobs",
            source_type="git",
            file_path="scraping/iceberg_scraping.ipynb",
            dynamic_artifact=False,
            cluster_id="id-ribacijg4gcotaau",
            cluster_type="basic",
            dependent_libraries="",
            input_parameters={},
            retries=2,
            timeout=10000,
            depends_on=[]
        )
        self.create_req = CreateWorkflowRequest(
            workflow_name=self.workflow_name,
            description="testing workflow",
            tags=["test"],
            schedule="* 2 * * *",
            retries=1,
            notify_on="darwin_test",
            max_concurrent_runs=1,
            tasks=[self.task]
        )
        self.update_req = CreateWorkflowRequest(
            workflow_name="workflow_sdk_test",
            description="testing UPDATE functionality of workflow",
            tags=["test"],
            schedule="* 4 * * *",
            retries=1,
            notify_on="darwin_test",
            max_concurrent_runs=1,
            tasks=[self.task]
        )

    def test_create_workflow_async(self):
        resp = self.sdk.create_workflow_async(workflow_request=self.create_req, user_email=self.email)
        print(f"Create workflow response: {resp}")
        assert resp['status'] == 'SUCCESS'

    def test_update_workflow(self):
        resp = self.sdk.update_workflow(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
                                        workflow_request=self.update_req, user_email=self.email)
        print(f"Update workflow response: {resp}")
        assert resp['status'] == 'SUCCESS'

    def test_delete_workflow(self):
        resp = self.sdk.delete_workflow(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
                                        user_email=self.email)
        print(f"Delete workflow response: {resp}")
        assert resp['data']['is_deleted'] is True

    def test_create_with_yaml(self):
        import os
        file_path = os.getcwd() + "/request.yaml"
        resp = self.sdk.create_with_yaml(file_path=file_path)
        print(f"Create with yaml response: {resp}")
        assert resp['status'] == 'SUCCESS'

    def test_update_with_yaml(self):
        import os
        file_path = os.getcwd() + "/request.yaml"
        resp = self.sdk.update_with_yaml(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
                                         file_path=file_path)
        print(f"Update with yaml response: {resp}")
        assert resp['status'] == 'SUCCESS'

    def test_run_with_params(self):
        resp = self.sdk.run_with_params(workflow_name=self.workflow_name, params={})
        print(f"Run now response: {resp}")
        assert resp['run_id']

    def test_stop_run(self):
        resp = self.sdk.stop_run(workflow_name=self.workflow_name, run_id=self.run_id)
        print(f"Stop now response: {resp}")
        assert resp['data']['workflow_id']

    def test_get_workflow(self):
        resp = self.sdk.get_workflow(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'])
        print(f"Get workflow: {resp}")

    def test_get_workflow_id(self):
        resp = self.sdk.get_workflow_id(workflow_name=self.workflow_name)
        print(f"Get workflow ID: {resp}")

    def test_resume_workflow(self):
        resp = self.sdk.resume_workflow(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
                                        user_email=self.email)
        print(f"Resume workflow response: {resp}")
        assert resp['status'] == 'SUCCESS'

    def test_pause_workflow(self):
        resp = self.sdk.pause_workflow(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
                                       user_email=self.email)
        print(f"Pause workflow response: {resp}")
        assert resp['status'] == 'SUCCESS'

    def test_list_workflows(self):
        resp = self.sdk.list_workflows()
        print(f"List workflows response: {resp}")
        assert resp['data']

    def test_get_workflow_runs(self):
        resp = self.sdk.get_workflow_runs(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'])
        print(f"Get workflow runs response: {resp}")
        assert resp['data']

    def test_get_workflow_details(self):
        resp = self.sdk.get_workflow_details(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'])
        print(f"Get workflow details response: {resp}")
        assert resp['data']

    def test_get_workflow_run_details(self):
        resp = self.sdk.get_workflow_run_details(
            workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
            run_id=self.run_id)
        print(f"Get workflow run details response: {resp}")
        assert resp['data']

    def test_get_workflow_task_details(self):
        resp = self.sdk.get_workflow_task_details(
            workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
            run_id=self.run_id, task_id="task_id")
        print(f"Get workflow task details response: {resp}")
        assert resp['data']

    def test_get_workflow_run_status(self):
        resp = self.sdk.get_workflow_run_status(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'],
                                                run_id=self.run_id)
        print(f"Get workflow run status response: {resp}")
        assert resp['data']

    def test_get_workflow_status(self):
        resp = self.sdk.get_workflow_status(workflow_id=self.sdk.get_workflow_id(self.workflow_name)['workflow_id'])
        print(f"Get workflow status response: {resp}")
        assert resp['data']

    def test_list_job_cluster_definitions(self):
        resp = self.sdk.list_job_cluster_definitions()
        print(f"List job cluster definitions response: {resp}")
        assert resp['data']

    def test_create_job_cluster_definition(self):
        resp = self.sdk.create_job_cluster_definition(job_cluster_definition={})
        print(f"Create job cluster definition response: {resp}")
        assert resp['data']

    def test_update_job_cluster_definition(self):
        resp = self.sdk.update_job_cluster_definition(job_cluster_definition={},
                                                      job_cluster_definition_id="job_cluster_definition_id")
        print(f"Update job cluster definition response: {resp}")
        assert resp['data']

    def test_get_job_cluster_definition(self):
        resp = self.sdk.get_job_cluster_definition(job_cluster_definition_id="job_cluster_definition_id")
        print(f"Get job cluster definition response: {resp}")
        assert resp['data']
