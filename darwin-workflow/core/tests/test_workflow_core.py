import os
import unittest
from unittest.mock import MagicMock, patch

from workflow_core.api.airlfow import AirflowApi
from workflow_core.constants.constants import SUCCESS, ERROR, ACTIVE, INACTIVE
from workflow_core.error.errors import WorkflowNotFound, ClusterNotFoundException
from workflow_core.workflow_core_impl import WorkflowCoreImpl
from workflow_model.job_cluster import HeadNodeConfig, WorkerNodeConfig
from workflow_model.requests import JobClusterDefinitionListRequest
from workflow_model.workflow import (
    Workflow,
    CreateWorkflowRequest,
    UpdateWorkflowRequest, WorkflowTaskCluster,
)


class TestWorkflowValidation(unittest.TestCase):
    def setUp(self) -> None:
        self.workflow_core = WorkflowCoreImpl("stag")
        self.workflow_details = Workflow(
            workflow_id="123",
            workflow_name="my_workflow",
            schedule="",
            description="my_workflow description",
            tags=["tag1", "tag2"],
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            created_by="",
            last_updated_on="",
            created_at="",
            workflow_status="",
            tasks=[],
            start_date="2021-01-01",
            end_date="2030-12-31",
        )

    def test_check_if_end_date_has_passed(self):
        self.assertTrue(self.workflow_core.check_if_end_date_has_passed("2021-01-01"))
        self.assertFalse(self.workflow_core.check_if_end_date_has_passed("2030-01-01"))

    def test_check_if_start_date_has_yet_to_come(self):
        self.assertTrue(
            self.workflow_core.check_if_start_date_has_yet_to_come("2030-01-01")
        )
        self.assertFalse(
            self.workflow_core.check_if_start_date_has_yet_to_come("2022-01-01")
        )

    @patch.object(AirflowApi, "resume_a_dag")
    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    def test_resume_workflow_success(self, mock_find_id, mock_resume_dag):
        """Test successful workflow activation."""
        workflow_id = "123"
        workflow = Workflow(
            workflow_id="123",
            workflow_name="my_workflow",
            schedule="",
            description="my_workflow description",
            tags=["tag1", "tag2"],
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            created_by="",
            last_updated_on="",
            created_at="",
            workflow_status="",
            tasks=[],
        )
        mock_resume_dag.return_value = {"is_paused": False}
        workflow_details = Workflow(
            workflow_id="123",
            workflow_name="my_workflow",
            schedule="",
            description="my_workflow description",
            tags=["tag1", "tag2"],
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            created_by="",
            last_updated_on="",
            created_at="",
            workflow_status="",
            tasks=[],
        )

        mock_find_id.return_value = MagicMock(data=[workflow_details])

        response = self.workflow_core.resume_workflow(workflow)

        self.assertEqual(response.workflow_status, ACTIVE)
        self.assertEqual(response.workflow_id, "123")

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_name")
    @patch("workflow_model.workflow.get_workflow_v2")
    @patch("workflow_core.dao.elasticsearch_dao.WorklfowElasticSearchDao.create")
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.create_or_update_workflow")
    def test_create_workflow_v2(self, mock_create_or_update, mock_es, mock_get_workflow, mock_find_by_name):
        """Test successful workflow creation."""

        self.workflow_core = WorkflowCoreImpl("stag")

        # Mock the return values of the methods
        mock_find_by_name.return_value = MagicMock(status="SUCCESS", data=[])
        mock_get_workflow.return_value = self.workflow_details
        mock_es.return_value = MagicMock(status="SUCCESS", data=self.workflow_details)
        mock_create_or_update.return_value = None  # Mock the async method

        # Create a workflow request object
        workflow_request = CreateWorkflowRequest(
            workflow_name="my_workflow",
            description="new_workflow_description",
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            tags=["tag1", "tag2"],
            schedule="",
            tasks=[],
        )
        user_email = "test@example.com"

        # Call the method under test using asyncio.run()
        import asyncio
        success, response = asyncio.run(self.workflow_core.create_workflow_v2(
            workflow_request, user_email
        ))

        # Assertions
        self.assertEqual(success, SUCCESS)
        self.assertEqual(response.workflow_id, "123")
        self.assertEqual(response.workflow_name, "my_workflow")
        self.assertEqual(response.schedule, "")

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "pause_a_dag")
    def test_pause_workflow_success(self, mock_airflow, mock__find_workflow_by_id):
        """Test successful pausing of workflow."""
        workflow_id = "123"
        workflow = Workflow(
            workflow_id="123",
            workflow_name="my_workflow",
            schedule="",
            description="my_workflow description",
            tags=["tag1", "tag2"],
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            created_by="",
            last_updated_on="",
            created_at="",
            workflow_status="",
            tasks=[],
        )
        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS", data=[self.workflow_details]
        )
        mock_airflow.return_value = {"is_paused": True}

        workflow_core = WorkflowCoreImpl("stag")

        result = workflow_core.pause_workflow(workflow)

        self.assertEqual(result.workflow_id, workflow_id)
        self.assertEqual(result.workflow_status, INACTIVE)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "pause_a_dag")
    def test_pause_workflow_error(self, mock_airflow, mock__find_workflow_by_id):
        """Test handling of error when pausing fails."""
        workflow_id = "123"
        workflow = Workflow(
            workflow_id="123",
            workflow_name="my_workflow",
            schedule="",
            description="my_workflow description",
            tags=["tag1", "tag2"],
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            created_by="",
            last_updated_on="",
            created_at="",
            workflow_status="",
            tasks=[],
        )
        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS", data=[self.workflow_details]
        )
        mock_airflow.return_value = {"is_paused": False}

        workflow_core = WorkflowCoreImpl("stag")

        result = workflow_core.pause_workflow(workflow)

        self.assertEqual(result.workflow_id, workflow_id)
        self.assertEqual(result.workflow_status, ACTIVE)

    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.get_workflow_by_id_v2")
    @patch("workflow_core.dao.elasticsearch_dao.WorklfowElasticSearchDao.create")
    @patch("workflow_core.dao.elasticsearch_dao.WorklfowElasticSearchDao.update")
    def test_update_workflow_success(
            self, mock_es_update, mock_es_create, mock__find_workflow_by_id
    ):
        """Test successful update of workflow."""
        workflow_id = "123"
        user_email = "test@example.com"

        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS",
            data={
                "hits": {
                    "hits": [
                        {"_source": self.workflow_details.to_dict(), "_version": 1},
                    ]
                }
            },
        )

        mock_es_create.return_value = MagicMock(
            status="SUCCESS", data=self.workflow_details
        )
        mock_es_update.return_value = MagicMock(
            status="SUCCESS", data={"result": "updated"}
        )

        workflow_core = WorkflowCoreImpl("stag")

        workflow_update_reqeust = UpdateWorkflowRequest(
            workflow_name="new_workflow_name",
            description="new_workflow_description",
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            tags=["tag1", "tag2"],
            schedule="",
            tasks=[],
        )

        result, data = workflow_core.update_workflow(
            workflow_update_reqeust, workflow_id, user_email
        )

        self.assertEqual(result, SUCCESS)
        self.assertEqual(data, {"result": "updated"})
        mock__find_workflow_by_id.assert_called_once_with(workflow_id)
        mock_es_create.assert_called_once()
        mock_es_update.assert_called_once()

    @patch.object(WorkflowCoreImpl, "get_workflow_by_id_v2")
    def test_update_workflow_workflow_not_found(self, mock__find_workflow_by_id):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        user_email = "test@example.com"
        mock__find_workflow_by_id.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        workflow_update_reqeust = UpdateWorkflowRequest(
            workflow_name="new_workflow_name",
            description="new_workflow_description",
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            tags=["tag1", "tag2"],
            schedule="",
            tasks=[],
        )

        with self.assertRaises(Exception) as e:
            workflow_core.update_workflow(
                workflow_update_reqeust, workflow_id, user_email
            )

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    def test_update_workflow_error_finding_workflow(self, mock__find_workflow_by_id):
        """Test error handling when finding the workflow fails."""
        workflow_id = "123"
        user_email = "test@example.com"
        mock__find_workflow_by_id.return_value = MagicMock(
            status=ERROR, data="Error message"
        )

        workflow_core = WorkflowCoreImpl("stag")

        workflow_update_reqeust = UpdateWorkflowRequest(
            workflow_name="new_workflow_name",
            description="new_workflow_description",
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            tags=["tag1", "tag2"],
            schedule="",
            tasks=[],
        )

        with self.assertRaises(Exception) as e:
            workflow_core.update_workflow(
                workflow_update_reqeust, workflow_id, user_email
            )

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch("workflow_core.dao.elasticsearch_dao.ElasticSearchConnection")
    def test_update_workflow_error_updating(self, mock_es, mock__find_workflow_by_id):
        """Test error handling when updating the workflow fails."""
        workflow_id = "123"
        user_email = "test@example.com"
        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS", data=[self.workflow_details]
        )
        mock_es.es_dao.update.return_value = MagicMock(
            status="ERROR", data="Update failed"
        )

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            workflow_core.update_workflow(
                UpdateWorkflowRequest(), workflow_id, user_email
            )

    @patch.object(os, "getenv")
    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(WorkflowCoreImpl, "pause_workflow")
    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__update_workflow")
    @patch("workflow_core.artifactory.s3_artifactory.S3Artifactory.delete_from_s3")
    @patch.object(AirflowApi, "delete_dag")
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.create_or_update_workflow")
    def test_soft_delete_workflow_by_id_success(
            self,
            mock_create_or_update,
            mock_airflow,
            mock_delete_workflow_from_s3,
            mock__update_workflow,
            mock_pause_workflow,
            mock__find_workflow_by_id,
            mockenv,
    ):
        """Test successful deletion of workflow."""
        workflow_id = "123"
        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS", data=[self.workflow_details]
        )
        mock_pause_workflow.return_value = MagicMock(workflow_status=INACTIVE)
        mock__update_workflow.return_value = MagicMock(status="SUCCESS")
        mock_delete_workflow_from_s3.return_value = MagicMock(status="SUCCESS")
        mock_airflow.return_value = MagicMock(status="SUCCESS")
        mockenv.return_value = "stag"
        mock_create_or_update.return_value = None  # Mock the async method

        workflow_core = WorkflowCoreImpl("stag")

        import asyncio
        result = asyncio.run(workflow_core.soft_delete_workflow_by_id(workflow_id))

        self.assertEqual(result.workflow_id, workflow_id)
        self.assertTrue(result.is_deleted)
        mock_delete_workflow_from_s3.assert_called_once_with(
            "darwin-workflow-staging",
            "darwin_workflow/airflow_artifacts/dags/artefact_my_workflow.py",
        )

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.create_or_update_workflow")
    def test_soft_delete_workflow_by_id_workflow_not_found(
            self, mock_create_or_update, mock__find_workflow_by_id
    ):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        mock__find_workflow_by_id.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        import asyncio
        with self.assertRaises(WorkflowNotFound) as e:
            asyncio.run(workflow_core.soft_delete_workflow_by_id(workflow_id))

        self.assertIn("Workflow with id invalid_id not found", str(e.exception))

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.create_or_update_workflow")
    def test_soft_delete_workflow_by_id_error_searching_workflow(
            self, mock_create_or_update, mock__find_workflow_by_id
    ):
        """Test error handling when searching for workflow fails."""
        workflow_id = "123"
        mock__find_workflow_by_id.return_value = MagicMock(
            status=ERROR, message="Error searching workflow"
        )
        mock_create_or_update.return_value = None  # Mock the async method
        workflow_core = WorkflowCoreImpl("stag")
        import asyncio
        result = asyncio.run(workflow_core.soft_delete_workflow_by_id(workflow_id))
        self.assertFalse(result)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(WorkflowCoreImpl, "pause_workflow")
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.create_or_update_workflow")
    def test_soft_delete_workflow_by_id_pause_fails(
            self, mock_create_or_update, mock_pause_workflow, mock__find_workflow_by_id
    ):
        """Test handling when pausing the workflow fails."""
        workflow_id = "123"
        workflow_details = Workflow(
            workflow_id="123",
            workflow_name="my_workflow",
            schedule="",
            description="my_workflow description",
            tags=["tag1", "tag2"],
            retries=3,
            timeout=3600,
            notify_on="",
            max_concurrent_runs=1,
            created_by="",
            last_updated_on="",
            created_at="",
            workflow_status="",
            tasks=[],
        )
        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS", data=[workflow_details]
        )
        mock_pause_workflow.return_value = MagicMock(
            workflow_status="RUNNING"
        )  # Pause failed
        mock_create_or_update.return_value = None  # Mock the async method

        workflow_core = WorkflowCoreImpl("stag")

        import asyncio
        result = asyncio.run(workflow_core.soft_delete_workflow_by_id(workflow_id))

        self.assertFalse(result.is_deleted)

    @patch("requests.request")
    def test_trigger_dag_with_params_error(self, mock_request):
        """Test handling of error during triggering."""
        dag_id = "my_workflow"
        params = {"param1": "value1"}
        mock_request.return_value = MagicMock(status_code=400, text="Error message")

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            workflow_core.trigger_dag_with_params(dag_id, params)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_cluster_id")
    def test_get_workflow_by_cluster_id(self, mock__find_workflow_by_cluster_id):
        """Test getting workflows by cluster id."""
        cluster_id = "id-z2yz92fb78vfwau4"
        workflow_core = WorkflowCoreImpl("stag")
        mock__find_workflow_by_cluster_id.return_value = MagicMock(
            status="SUCCESS", data=[WorkflowTaskCluster(workflow_cluster_id='id-89baa045-4914-4d67-a8a1-ee48613e09dd',
                                                        workflow_name='alert_testing_workflow',
                                                        run_id='manual__2024-04-25T07:15:17.263027+00:00',
                                                        task_name='test_alert_task_1', cluster_id='id-z2yz92fb78vfwau4',
                                                        try_number=1)])
        result = workflow_core.get_workflow_by_cluster_id(cluster_id)
        self.assertEqual(result.workflow_name, 'alert_testing_workflow')
        self.assertEqual(result.run_id, 'manual__2024-04-25T07:15:17.263027+00:00')
        self.assertEqual(result.task_name, 'test_alert_task_1')

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_cluster_id")
    def test_get_workflow_by_cluster_id_not_found(self,mock__find_workflow_by_cluster_id):
        mock__find_workflow_by_cluster_id.return_value = MagicMock(
            status="SUCCESS", data=[])
        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(ClusterNotFoundException) as e:
            workflow_core.get_workflow_by_cluster_id("invalid_cluster_id")

    @patch.object(WorkflowCoreImpl, 'es_job_cluster', create=True)
    def test_list_all_job_clusters_success(self, mock_es_job_cluster):
        """Test successful retrieval of job clusters."""
        mock_es_job_cluster.es_dao.aggregation_search.return_value = MagicMock(
            data={
                "hits": {
                    "hits": [
                        {
                            "_source": {
                                "job_cluster_definition_id": "1",
                                "cluster_name": "test_cluster",
                                "tags": ["tag1", "tag2"],
                                "runtime": "runtime_value",
                                "inactive_time": 123456,
                                "user": "test_user",
                                "head_node_config": {
                                    "cores": 1,
                                    "memory": 1
                                },
                                "worker_node_configs": [
                                    {
                                        "cores_per_pods": 1,
                                        "memory_per_pods": 1,
                                        "max_pods": 1,
                                        "min_pods": 1
                                    }
                                ]
                            }
                        }
                    ]
                },
                "aggregations": {
                    "total_count": {
                        "value": 1
                    }
                }
            }
        )
        self.workflow_core.es_job_cluster = mock_es_job_cluster
        request = JobClusterDefinitionListRequest(offset=0, page_size=10, query="test")
        response, total_count = self.workflow_core.list_all_job_clusters(request)

        self.assertEqual(len(response), 1)
        self.assertEqual(response[0].job_cluster_definition_id, "1")
        self.assertEqual(response[0].cluster_name, "test_cluster")
        self.assertEqual(total_count, 1)

    @patch.object(WorkflowCoreImpl, 'es_job_cluster', create=True)
    def test_list_all_job_clusters_empty(self, mock_es_job_cluster):
        """Test retrieval of job clusters with no results."""
        mock_es_job_cluster.es_dao.aggregation_search.return_value = MagicMock(
            data={
                "hits": {
                    "hits": []
                },
                "aggregations": {
                    "total_count": {
                        "value": 0
                    }
                }
            }
        )

        self.workflow_core.es_job_cluster = mock_es_job_cluster
        request = JobClusterDefinitionListRequest(offset=0, page_size=10, query="test")
        response, total_count = self.workflow_core.list_all_job_clusters(request)

        self.assertEqual(len(response), 0)
        self.assertEqual(total_count, 0)

    @patch.object(WorkflowCoreImpl, 'es_job_cluster', create=True)
    def test_list_all_job_clusters_with_pagination(self, mock_es_job_cluster):
        """Test retrieval of job clusters with pagination."""
        mock_es_job_cluster.es_dao.aggregation_search.return_value = MagicMock(
            data={
                "hits": {
                    "hits": [
                        {
                            "_source": {
                                "job_cluster_definition_id": "1",
                                "cluster_name": "test_cluster_1",
                                "tags": ["tag1", "tag2"],
                                "runtime": "runtime_value",
                                "inactive_time": 123456,
                                "user": "test_user",
                                "head_node_config": {
                                    "cores": 1,
                                    "memory": 1
                                },
                                "worker_node_configs": [
                                    {
                                        "cores_per_pods": 1,
                                        "memory_per_pods": 1,
                                        "max_pods": 1,
                                        "min_pods": 1
                                    }
                                ]
                            }
                        },
                        {
                            "_source": {
                                "job_cluster_definition_id": "2",
                                "cluster_name": "test_cluster_2",
                                "tags": ["tag3", "tag4"],
                                "runtime": "runtime_value",
                                "inactive_time": 123456,
                                "user": "test_user",
                                "head_node_config": {
                                    "cores": 1,
                                    "memory": 1
                                },
                                "worker_node_configs": [
                                    {
                                        "cores_per_pods": 1,
                                        "memory_per_pods": 1,
                                        "max_pods": 1,
                                        "min_pods": 1
                                    }
                                ]
                            }
                        }
                    ]
                },
                "aggregations": {
                    "total_count": {
                        "value": 2
                    }
                }
            }
        )

        self.workflow_core.es_job_cluster = mock_es_job_cluster
        request = JobClusterDefinitionListRequest(offset=0, page_size=2, query="test")
        response, total_count = self.workflow_core.list_all_job_clusters(request)

        self.assertEqual(len(response), 2)
        self.assertEqual(response[0].job_cluster_definition_id, "1")
        self.assertEqual(response[1].job_cluster_definition_id, "2")
        self.assertEqual(total_count, 2)