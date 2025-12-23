import os
import requests
import json
import logging

from workflow_core.constants.configs import Config

LOGGER = logging.getLogger(__name__)


class TestWorkflow:
    shared_data = {}

    def setup_method(self):
        self.env = os.getenv("ENV", "uat")
        self.base_url = Config(self.env).get_app_layer
        self.headers = {
            "msd-user": '{"id":5513,"email":"test.user@example.com"}',
            "Content-Type": "application/json",
        }

    def test_healthcheck(self):
        url = f"{self.base_url}/healthcheck"
        response = requests.get(url)
        assert response.status_code == 200
        assert response.json() == {"app_layer": "OK", "core": "OK", "db": "True"}

    def test_check_unique_workflow_name(self, workflow_entity):
        url = f"{self.base_url}/check_unique_workflow_name"
        payload = {"name": workflow_entity["workflow_name"]}
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json() == {"data": {"unique": True}}

    def test_workflows_list(self):
        url = f"{self.base_url}/workflows"
        payload = {
            "query": "",
            "filters": {"user": [], "status": []},
            "page_size": 100,
            "offset": 0,
            "sort_by": "created_at",
            "sort_order": "desc",
        }
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert isinstance(response.json()["data"], list)

    def test_create_workflow(self, workflow_entity, job_cluster_definition_entity):
        url = f"{self.base_url}/v2/workflow"

        job_cluster_url = f"{self.base_url}/job-cluster-definition"
        response = requests.post(
            job_cluster_url,
            headers=self.headers,
            data=json.dumps(job_cluster_definition_entity),
        )
        job_cluster_id = response.json()["data"]["job_cluster_definition_id"]
        self.shared_data["job_cluster_id"] = job_cluster_id
        workflow_entity["tasks"][0]["cluster_id"] = job_cluster_id

        response = requests.post(
            url, headers=self.headers, data=json.dumps(workflow_entity)
        )
        assert response.status_code == 200
        assert "workflow_id" in response.json()["data"]

        # wait for workflow creation
        self.shared_data["workflow_id"] = response.json()["data"]["workflow_id"]
        self.shared_data["workflow_name"] = workflow_entity["workflow_name"]
        self.shared_data["display_name"] = workflow_entity["display_name"]

        url = f"{self.base_url}/v2/workflow/{self.shared_data['workflow_id']}"
        response = requests.get(url, headers=self.headers)

        assert response.json()["data"]["workflow_status"] == "creating_artifact"

        # check if workflow status is active in while loop
        while response.json()["data"]["workflow_status"] != "active":
            response = requests.get(url, headers=self.headers)

    def test_create_workflow_with_empty_display_name(self, workflow_entity, job_cluster_definition_entity):
        url = f"{self.base_url}/v2/workflow"

        job_cluster_url = f"{self.base_url}/job-cluster-definition"
        response = requests.post(
            job_cluster_url,
            headers=self.headers,
            data=json.dumps(job_cluster_definition_entity),
        )
        job_cluster_id = response.json()["data"]["job_cluster_definition_id"]
        self.shared_data["job_cluster_id"] = job_cluster_id
        workflow_entity["tasks"][0]["cluster_id"] = job_cluster_id
        workflow_entity["display_name"] = ""
        response = requests.post(
            url, headers=self.headers, data=json.dumps(workflow_entity)
        )
        assert response.status_code == 200
        assert "workflow_id" in response.json()["data"]

    def test_get_workflow(self, get_workflow_entity):
        url = f"{self.base_url}/v2/workflow/{self.shared_data['workflow_id']}"
        response = requests.get(url, headers=self.headers)
        get_workflow_entity["workflow_id"] = self.shared_data["workflow_id"]
        get_workflow_entity["workflow_name"] = self.shared_data["workflow_name"]
        workflow_response = response.json()["data"]
        del workflow_response["created_at"]
        del workflow_response["last_updated_on"]
        assert response.status_code == 200

    def test_get_invalid_workflow(self):
        invalid_workflow_id = "invalid-id"
        url = f"{self.base_url}/v2/workflow/{invalid_workflow_id}"
        response = requests.get(url, headers=self.headers)

        assert response.status_code == 404
        assert response.json().get("error", {}).get("message") == "workflow not found"

    def test_get_workflow_id(self):
        workflow_name = self.shared_data["workflow_name"]
        url = f"{self.base_url}/workflow_id"
        payload = {"workflow_name": workflow_name}
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["workflow_id"] == self.shared_data["workflow_id"]

    def test_get_filters(self):
        url = f"{self.base_url}/filters"
        response = requests.get(url, headers=self.headers)
        assert response.status_code == 200
        assert "users" in response.json()["data"]
        assert "status" in response.json()["data"]

    def test_recently_created(self):
        url = f"{self.base_url}/workflows"
        payload = {
            "query": "",
            "filters": {"user": ["test.user@example.com"], "status": []},
            "page_size": 100,
            "offset": 0,
            "sort_by": "created_by",
            "sort_order": "asc",
        }
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert self.shared_data["workflow_id"] in [
            workflow["workflow_id"] for workflow in response.json()["data"]
        ]

    # def test_workflow_update(self, workflow_entity):
    #     workflow_id = self.shared_data["workflow_id"]
    #     url = f"{self.base_url}/v2/workflow/{workflow_id}"
    #     payload = workflow_entity
    #     payload["schedule"] = "0 0 * * *"
    #     payload["tasks"][0]["cluster_id"] = self.shared_data["job_cluster_id"]
    #     response = requests.put(url, headers=self.headers, data=json.dumps(payload))
    #     assert response.status_code == 200
    #     assert response.json()["data"]["schedule"] == "0 0 * * *"
    #
    #     url = f"{self.base_url}/v2/workflow/{self.shared_data['workflow_id']}"
    #     response = requests.get(url, headers=self.headers)
    #
    #     assert response.json()["data"]["workflow_status"] == "updating_artifact"
    #
    #     # check if workflow status is active in while loop
    #     while response.json()["data"]["workflow_status"] != "active":
    #         response = requests.get(url, headers=self.headers)

    def test_update_tags(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/tags/{workflow_id}"
        payload = {"tags": ["tag1", "tag2"]}
        response = requests.put(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["data"]["tags"] == ["tag1", "tag2"]

    def test_retries_update(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/retries/{workflow_id}"
        payload = {"retries": 5}
        response = requests.put(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["data"]["retries"] == 5

    def test_schedule_update(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/schedule/{workflow_id}"
        payload = {"schedule": "0 0 * * *"}
        response = requests.put(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["data"]["schedule"] == "0 0 * * *"

    def test_max_concurrent_runs_update(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/max_concurrent_runs/{workflow_id}"
        payload = {"max_concurrent_runs": 3}
        response = requests.put(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["data"]["max_concurrent_runs"] == 3

    def test_run_now(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/run_now/{workflow_id}"
        response = requests.put(url, headers=self.headers)
        assert response.status_code == 200
        assert "run_id" in response.json()["data"]["last_run"]
        self.shared_data["run_id"] = response.json()["data"]["last_run"]["run_id"]

    def test_trigger_with_param(self):
        workflow_name = self.shared_data["display_name"]
        url = f"{self.base_url}/trigger/{workflow_name}"
        payload = {"params": {}}
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert "run_id" in response.json()
        self.shared_data["run_id_2"] = response.json()["run_id"]

    def test_get_runs(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/runs/{workflow_id}"
        payload = {
            "end_date": "2024-06-07T23:59:59Z",
            "filters": [],
            "offset": 0,
            "page_size": 10,
            "start_date": "2024-06-05",
        }
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200

    def test_get_run_details(self):
        workflow_id = self.shared_data["workflow_id"]
        run_id = self.shared_data["run_id"]
        payload = {"run_id": run_id}
        url = f"{self.base_url}/run_details/{workflow_id}"
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert "run_id" in response.json()["data"]

    def test_get_task_details_v2(self, workflow_entity):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/task_details/{workflow_id}"
        payload = {
            "run_id": self.shared_data["run_id"],
            "task_id": workflow_entity["tasks"][0]["task_name"],
        }
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200

    def test_get_status(self):
        workflow_name = self.shared_data["display_name"]
        run_id = self.shared_data["run_id"]
        url = f"{self.base_url}/status/{workflow_name}/{run_id}"
        response = requests.get(url, headers=self.headers)
        assert response.status_code == 200
        assert "status" in response.json()
        assert "logs_url" in response.json()

    def test_stop_run(self):
        workflow_id = self.shared_data["workflow_id"]
        run_id = self.shared_data["run_id"]
        payload1 = {"run_id": run_id}
        payload2 = {"run_id": self.shared_data["run_id_2"]}
        url = f"{self.base_url}/stop_run/{workflow_id}"
        response1 = requests.put(url, headers=self.headers, data=json.dumps(payload1))
        response2 = requests.put(url, headers=self.headers, data=json.dumps(payload2))
        assert response1.status_code == 200
        assert response2.status_code == 200
        assert response1.json()["data"]["run_status"] == "failed"
        assert response2.json()["data"]["run_status"] == "failed"

    def test_repair_run(self):
        workflow_id = self.shared_data["workflow_id"]
        run_id = self.shared_data["run_id"]
        payload = {"run_id": run_id, "selected_tasks": ["logs_poc"]}
        url = f"{self.base_url}/v1/repair_run/{workflow_id}"
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["data"]["message"] == f"Repairing run with id {run_id}"

        # Stop the run
        payload = {"run_id": run_id}
        url = f"{self.base_url}/stop_run/{workflow_id}"
        response = requests.put(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200
        assert response.json()["data"]["run_status"] == "failed"

    def test_create_job_cluster(self, job_cluster_definition_entity):
        url = f"{self.base_url}/job-cluster-definition"
        response = requests.post(
            url, headers=self.headers, data=json.dumps(job_cluster_definition_entity)
        )
        assert response.status_code == 200
        assert "job_cluster_definition_id" in response.json()["data"]
        self.shared_data["job_cluster_definition_id"] = response.json()["data"][
            "job_cluster_definition_id"
        ]

    def test_get_job_cluster(self, job_cluster_definition_entity):
        cluster_id = self.shared_data["job_cluster_definition_id"]
        url = f"{self.base_url}/job-cluster-definitions/{cluster_id}"
        response = requests.get(
            url,
            headers=self.headers,
        )
        job_cluster_response = response.json()["data"]
        job_cluster_response["cluster_id"] = cluster_id
        assert response.status_code == 200
        assert response.json()["data"] == job_cluster_response

    def test_update_job_cluster(self, job_cluster_definition_entity):
        cluster_id = self.shared_data["job_cluster_definition_id"]
        url = f"{self.base_url}/job-cluster-definition/{cluster_id}"
        payload = job_cluster_definition_entity
        payload["cluster_id"] = cluster_id
        payload["runtime"] = "Ray2.2.0-Py39-Spark3.3.1-CPU"
        response = requests.put(url, headers=self.headers, data=json.dumps(payload))
        assert response.status_code == 200

    def test_list_job_clusters(self):
        url = f"{self.base_url}/job-cluster-definitions"
        response = requests.get(url, headers=self.headers)
        assert response.status_code == 200
        assert isinstance(response.json()["data"], list)

    def test_list_job_clusters_with_pagination(self):
        url = f"{self.base_url}/job-cluster-definitions"

        # Test with page_size=2 and offset=0
        payload = {
            "page_size": 2,
            "offset": 0
        }
        response = requests.get(url, headers=self.headers, params=payload)
        assert response.status_code == 200
        assert isinstance(response.json()["data"], list)
        assert len(response.json()["data"]) <= 2

        # Test with page_size=2 and offset=2
        payload = {
            "page_size": 2,
            "offset": 2
        }
        response = requests.get(url, headers=self.headers, params=payload)
        assert response.status_code == 200
        assert isinstance(response.json()["data"], list)
        assert len(response.json()["data"]) <= 2

    def test_delete_workflow(self):
        workflow_id = self.shared_data["workflow_id"]
        url = f"{self.base_url}/workflow/{workflow_id}"
        response = requests.delete(url, headers=self.headers)
        payload = {"workflow_id": workflow_id, "is_deleted": True}
        assert response.status_code == 200
        assert response.json()["data"] == payload
