import datetime
import unittest
from unittest.mock import MagicMock, patch

from workflow_core.constants.constants import ERROR, SCHEDULED, AUTOMATIC, JOB
from workflow_core.error.errors import WorkflowNotFound, RunNotFoundException
from workflow_core.workflow_core_impl import WorkflowCoreImpl
from workflow_model.requests import (
    RetrieveWorkflowRunsRequest,
    UpdateWorkflowRetriesRequest,
)
from workflow_model.response import WorkflowWorkflowIdGetResponseData
from workflow_model.workflow import Workflow, WorkflowTask
from workflow_core.api.airlfow import AirflowApi


class TestWorkflowCore(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.workflow_core = WorkflowCoreImpl("stag")
        self.workflow_core.es = MagicMock()
        self.task_details = WorkflowTask(
            task_id="task1",
            task_name="task1",
            source="source1",
            source_type="notebook",
            retries=3,
            timeout=60,
            cluster_type=JOB,
            attached_cluster={
                "cluster_id": "job-7c3031a4",
                "runtime": "Ray2.2.0-Py39-Spark3.3.1-CPU",
                "cluster_name": "pacman-npu01-susmit-ad5c9bca",
                "cluster_status": "",
                "memory": 512,
                "cores": 48,
                "ray_dashboard": "",
                "logs_dashboard": "",
                "events_dashboard": "",
            },
            file_path="notebook.ipynb",
            dynamic_artifact=False,
            dependent_libraries="",
            input_parameters={},
            task_validation_status="VALID",
            run_status="INACTIVE",
            depends_on=[],
        )
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
            tasks=[self.task_details],
        )

    # @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    # @patch.object(AirflowApi, "stop_a_run")
    # @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.get_run_details_from_workflow")
    # async def test_stop_run_workflow_success(
    #     self, mock_get_run_details, mock_stop_run, mock__find_workflow_by_id
    # ):
    #     """Test successful stopping of a workflow run."""
    #     workflow_id = "123"
    #     run_id = "run_id"
    #     mock__find_workflow_by_id.return_value = MagicMock(
    #         status="SUCCESS", data=[self.workflow_details]
    #     )
    #     mock_stop_run.return_value = {"state": "killed"}
    #     mock_get_run_details.return_value = {
    #         "workflow_id": "123",
    #         "run_id": "run_id",
    #         "status": "running",
    #         "start_time": "2024-01-01T00:00:00",
    #         "end_time": None,
    #         "repair_time": None,
    #         "parameters": {},
    #         "expected_run_duration": None,
    #         "sla_exceeded": False,
    #         "created_at": "2024-01-01T00:00:00",
    #         "updated_at": "2024-01-01T00:00:00",
    #     }
    #
    #     workflow_core = WorkflowCoreImpl("stag")
    #
    #     result = await workflow_core.stop_run_workflow(workflow_id, run_id)
    #
    #     self.assertEqual(result.workflow_id, workflow_id)
    #     self.assertEqual(result.run_id, run_id)
    #     self.assertEqual(result.run_status, "killed")
    #     mock__find_workflow_by_id.assert_called_once_with(workflow_id=workflow_id)
    #     mock_stop_run.assert_called_once_with("my_workflow", run_id)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_stop_run_workflow_not_found(self, mock__find_workflow_by_id):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        run_id = "run_id"
        mock__find_workflow_by_id.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.stop_run_workflow(workflow_id, run_id)

        self.assertIn(f"Workflow with id {workflow_id} not found", str(e.exception))

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_latest_dag_runs_async")
    @patch.object(AirflowApi, "run_now")
    async def test_run_now_workflow_success(
        self, mock_run_airflow, mock_airflow, mock_find_by_id
    ):
        """Test successful workflow run now."""
        workflow_id = "123"
        workflow_name = "my_workflow"
        end_date = (
            (datetime.datetime.utcnow() + datetime.timedelta(days=1)).date().isoformat()
        )
        start_date = (
            (datetime.datetime.utcnow() - datetime.timedelta(days=1)).date().isoformat()
        )
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
            workflow_status="active",
            tasks=[],
            start_date=start_date,
            end_date=end_date,
        )
        mock_find_by_id.return_value = MagicMock(data=[workflow_details])
        mock_airflow.return_value = {"dag_runs": []}
        mock_run_airflow.return_value = {
            "dag_run_id": "run_id_123",
            "start_date": datetime.datetime.utcnow().isoformat(),
            "state": "running",
            "external_trigger": True,
            "run_type": "manual",
        }

        workflow_core = WorkflowCoreImpl("stag")
        response = await workflow_core.run_now_workflow(
            workflow_id, user_email="user_email"
        )

        # Assertions
        self.assertEqual(response.workflow_id, workflow_id)
        self.assertEqual(response.last_run.run_id, "run_id_123")
        self.assertEqual(response.last_run.run_status, "running")
        self.assertEqual(response.last_run.trigger, "manual")
        self.assertEqual(response.last_runs_status, [])  # No previous runs

        # Verify method calls
        mock_airflow.assert_called_once_with(workflow_name)
        mock_run_airflow.assert_called_once_with(workflow_name, None)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_run_now_workflow_not_found(self, mock_find_by_id):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        mock_find_by_id.return_value = MagicMock(data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.run_now_workflow(workflow_id, user_email="user_email")

        self.assertIn(f"Workflow with id {workflow_id} not found", str(e.exception))

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_run_now_workflow_end_date_passed(self, mock_find_by_id):
        """Test error handling when end date has passed."""
        workflow_id = "123"
        past_date = (
            (datetime.datetime.utcnow() - datetime.timedelta(days=2)).date().isoformat()
        )
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
            end_date=past_date,
        )

        mock_find_by_id.return_value = MagicMock(data=[workflow_details])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            await workflow_core.run_now_workflow(workflow_id, user_email="user_email")

        self.assertIn("End date has passed", str(e.exception))
        # Verify method calls
        mock_find_by_id.assert_called_once_with(workflow_id=workflow_id)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_run_now_workflow_start_date_future(self, mock_find_by_id):
        """Test error handling when start date in the future."""
        workflow_id = "123"
        future_date = (
            (datetime.datetime.utcnow() + datetime.timedelta(days=2)).date().isoformat()
        )
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
            start_date=future_date,
        )

        mock_find_by_id.return_value = MagicMock(data=[workflow_details])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            await workflow_core.run_now_workflow(workflow_id, user_email="user_email")

        self.assertIn("Start date has yet to come", str(e.exception))
        # Verify method calls
        mock_find_by_id.assert_called_once_with(workflow_id=workflow_id)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_latest_dag_runs_by_days")
    async def test_retrieve_workflow_runs_success(
        self, mock_airflow_get_days, mock_find_by_id
    ):
        """Test successful workflow run retrieval."""
        workflow_id = "123"
        body = RetrieveWorkflowRunsRequest(
            page_size=10,
            offset=0,
            start_date="2024-01-01",
            end_date="2024-03-25",
            filters=["SUCCESS"],
        )
        mock_find_by_id.return_value = MagicMock(data=[self.workflow_details])
        mock_airflow_response = {
            "dag_runs": [
                {
                    "dag_run_id": "run1",
                    "start_date": "2024-03-25",
                    "end_date": "2024-03-27",
                    "state": "RUNNING",
                    "external_trigger": False,
                    "run_type": "scheduled",
                },
                {
                    "dag_run_id": "run2",
                    "start_date": "2024-03-20",
                    "end_date": "2024-03-28",
                    "state": "SUCCESS",
                    "external_trigger": True,
                    "run_type": "manual",
                },
            ],
            "total_entries": 2,
        }
        mock_airflow_get_days.return_value = mock_airflow_response

        workflow_core = WorkflowCoreImpl("stag")
        (
            total_entries,
            page_size,
            offset,
            data,
        ) = await workflow_core.retrieve_workflow_runs(workflow_id, body)

        self.assertEqual(total_entries, 2)
        self.assertEqual(page_size, 10)
        self.assertEqual(offset, 0)
        self.assertEqual(data.workflow_id, workflow_id)
        self.assertEqual(len(data.runs), 2)
        self.assertEqual(data.runs[0].run_id, "run1")
        self.assertEqual(data.runs[0].start_time, "2024-03-25")
        self.assertEqual(
            data.runs[0].duration > 0, True
        )  # Running duration calculation
        self.assertEqual(data.runs[0].run_status, "RUNNING")
        self.assertEqual(data.runs[0].trigger, "scheduled")
        self.assertEqual(data.runs[1].run_id, "run2")
        self.assertEqual(data.runs[1].start_time, "2024-03-20")
        self.assertEqual(data.runs[1].duration, 691200)  # 4 days
        self.assertEqual(data.runs[1].run_status, "SUCCESS")
        self.assertEqual(data.runs[1].trigger, "manual")

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_retrieve_workflow_runs_not_found(self, mock_find_by_id):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        body = RetrieveWorkflowRunsRequest(
            page_size=10,
            offset=0,
            start_date="2024-01-01",
            end_date="2024-03-25",
            filters=["SUCCESS"],
        )
        mock_find_by_id.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.retrieve_workflow_runs(workflow_id, body)

        self.assertIn(f"Workflow with id {workflow_id} not found", str(e.exception))
        # No Airflow calls are made

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_latest_dag_runs_by_days")
    async def test_retrieve_workflow_runs_airflow_error(
        self, mock_airflow_get_days, mock_find_by_id
    ):
        """Test handling of Airflow errors."""
        workflow_id = "123"
        body = RetrieveWorkflowRunsRequest(
            page_size=10,
            offset=0,
            start_date="2024-01-01",
            end_date="2024-03-25",
            filters=["SUCCESS"],
        )
        mock_find_by_id.return_value = MagicMock(data=[self.workflow_details])
        mock_airflow_get_days.return_value = Exception("Airflow error")
        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            await workflow_core.retrieve_workflow_runs(workflow_id, body)
        self.assertIn("Exception", str(e.exception))
        self.assertEqual(mock_find_by_id.call_count, 1)
        mock_find_by_id.assert_called_once_with(workflow_id=workflow_id)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_latest_dag_runs_by_days")
    async def test_retrieve_workflow_runs_invalid_filter(
        self, mock_airflow_get_days, mock_find_by_id
    ):
        """Test handling of invalid filter in request body."""
        workflow_id = "123"
        body = RetrieveWorkflowRunsRequest(
            page_size=10,
            offset=0,
            filters=["INVALID_STATUS"],
            start_date="2024-01-01",
            end_date="2024-03-25",
        )
        mock_find_by_id.return_value = MagicMock(data=[self.workflow_details])
        mock_airflow_get_days.return_value = {"dag_runs": [], "total_entries": 0}
        workflow_core = WorkflowCoreImpl("stag")

        # No exception raised, only valid filters are used
        (
            total_entries,
            page_size,
            offset,
            data,
        ) = await workflow_core.retrieve_workflow_runs(workflow_id, body)

        self.assertEqual(total_entries, 0)  # No runs retrieved with invalid filter
        self.assertEqual(page_size, 10)
        self.assertEqual(offset, 0)
        self.assertEqual(data.workflow_id, workflow_id)
        self.assertEqual(len(data.runs), 0)

    @patch(
        "workflow_core.workflow_core_impl.WorkflowCoreImpl.get_workflow_by_workflow_runid"
    )
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl._get_workflow_tasks")
    @patch.object(AirflowApi, "get_a_dag_run")
    async def test_get_run_details_success(
        self, mock_airflow, mock_get_tasks, mock_get_workflow
    ):
        """Test successful retrieval of run details."""
        workflow_id = "123"
        run_id = "run_id"
        user_id = "user_id"
        mock_get_workflow.return_value = WorkflowWorkflowIdGetResponseData(
            workflow_id=workflow_id,
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
            tasks=[self.task_details],
            next_run_time="",
        )
        mock_airflow_response = {
            "external_trigger": False,
            "start_date": "2024-03-20T08:00:00",
            "end_date": "2024-03-20T08:15:00",
            "state": "SUCCESS",
        }
        mock_airflow.return_value = mock_airflow_response
        mock_tasks, mock_events = [], []  # Mocked task and event data
        mock_get_tasks.return_value = mock_tasks, mock_events

        workflow_core = WorkflowCoreImpl("stag")

        run_details = await workflow_core.get_run_details(workflow_id, run_id, user_id)

        self.assertEqual(run_details.workflow_id, workflow_id)
        self.assertEqual(run_details.run_id, run_id)
        self.assertEqual(run_details.start_time, "2024-03-20T08:00:00")
        self.assertEqual(run_details.end_time, "2024-03-20T08:15:00")
        self.assertEqual(run_details.duration, 900)  # 15 minutes
        self.assertEqual(run_details.run_status, "SUCCESS")
        self.assertEqual(run_details.trigger, SCHEDULED)
        self.assertEqual(run_details.trigger_by, AUTOMATIC)
        self.assertEqual(run_details.events, mock_events)
        self.assertEqual(run_details.tasks, mock_tasks)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_a_dag_run")
    async def test_get_run_details_workflow_not_found(
        self, mock_airflow, mock_get_workflow
    ):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        run_id = "run_id"
        user_id = "user_id"
        mock_airflow.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.get_run_details(workflow_id, run_id, user_id)

    @patch(
        "workflow_core.workflow_core_impl.WorkflowCoreImpl.get_workflow_by_workflow_runid"
    )
    @patch.object(AirflowApi, "get_a_dag_run")
    async def test_get_run_details_airflow_error(self, mock_airflow, mock_get_workflow):
        """Test handling of Airflow errors."""
        workflow_id = "123"
        run_id = "run_id"
        user_id = "user_id"
        mock_get_workflow.return_value = MagicMock(data=self.workflow_details)
        mock_airflow.side_effect = RunNotFoundException("Airflow error")

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(RunNotFoundException) as e:
            await workflow_core.get_run_details(workflow_id, run_id, user_id)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_get_task_details_with_retries_workflow_not_found(
        self, mock_get_workflow
    ):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        run_id = "run_id"
        task_id = "task_id"
        user_id = "user_id"
        mock_get_workflow.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.get_task_details_with_retries(
                workflow_id, run_id, task_id, user_id
            )

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_task")
    async def test_get_task_details_with_retries_task_not_found(
        self, mock_airflow, mock_get_workflow
    ):
        """Test handling when task not found in workflow."""
        workflow_id = "123"
        run_id = "run_id"
        task_id = "invalid_task_id"
        user_id = "user_id"
        mock_get_workflow.return_value = MagicMock(data=[self.workflow_details])
        mock_airflow.return_value = {"state": "SUCCESS"}

        workflow_core = WorkflowCoreImpl("stag")

        # Assert expected behavior (log message or exception)
        with self.assertRaises(Exception) as e:
            await workflow_core.get_task_details_with_retries(
                workflow_id, run_id, task_id, user_id
            )

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_get_workflow_run_status_and_logs_url_workflow_not_found(
        self, mock_find_by_id
    ):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        mock_find_by_id.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.get_workflow_run_status_and_logs_url_by_id(workflow_id)

        self.assertIn(f"Workflow with id {workflow_id} not found", str(e.exception))
        # No Airflow calls are made

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_latest_dag_runs_async")
    async def test_get_workflow_run_status_and_logs_url_no_runs(
        self, mock_airflow, mock_find_by_id
    ):
        """Test handling of no runs found."""
        workflow_id = "123"
        mock_find_by_id.return_value = MagicMock(data=[self.workflow_details])
        mock_airflow.return_value = {"dag_runs": []}

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(RunNotFoundException) as e:
            await workflow_core.get_workflow_run_status_and_logs_url_by_id(workflow_id)

        self.assertIn("No runs found for workflow my_workflow", str(e.exception))

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(AirflowApi, "get_latest_dag_runs_async")
    async def test_get_workflow_run_status_and_logs_url_airflow_error(
        self, mock_airflow, mock_find_by_id
    ):
        """Test handling of Airflow errors."""
        workflow_id = "123"
        mock_find_by_id.return_value = MagicMock(data=[self.workflow_details])
        mock_airflow.return_value = Exception("Airflow error")

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            await workflow_core.get_workflow_run_status_and_logs_url_by_id(workflow_id)

        self.assertIn("Exception", str(e.exception))

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__update_workflow")
    @patch("workflow_core.workflow_core_impl.WorkflowCoreImpl.create_or_update_workflow")
    async def test_update_workflow_retries_success(
        self, mock_create_or_update, mock__update_workflow, mock__find_workflow_by_id
    ):
        """Test successful update of workflow retries."""
        workflow_id = "123"
        retries = 5
        mock__find_workflow_by_id.return_value = MagicMock(
            status="SUCCESS", data=[self.workflow_details]
        )
        mock__update_workflow.return_value = MagicMock(status="SUCCESS")
        mock_create_or_update.return_value = None  # Mock the async method

        workflow_core = WorkflowCoreImpl("stag")

        result = await workflow_core.update_workflow_retries(
            workflow_id, UpdateWorkflowRetriesRequest(retries=retries)
        )

        self.assertEqual(result.workflow_id, workflow_id)
        self.assertEqual(result.retries, retries)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_update_workflow_retries_workflow_not_found(
        self, mock__find_workflow_by_id
    ):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        mock__find_workflow_by_id.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(WorkflowNotFound) as e:
            await workflow_core.update_workflow_retries(
                workflow_id, UpdateWorkflowRetriesRequest(retries=5)
            )

        self.assertIn("Workflow with id invalid_id not found", str(e.exception))

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_update_workflow_retries_error_searching_workflow(
        self, mock__find_workflow_by_id
    ):
        """Test error handling when searching for workflow fails."""
        workflow_id = "123"
        mock__find_workflow_by_id.return_value = MagicMock(
            status=ERROR, message="Error searching workflow"
        )

        workflow_core = WorkflowCoreImpl("stag")

        result = await workflow_core.update_workflow_retries(
            workflow_id, UpdateWorkflowRetriesRequest(retries=5)
        )

        self.assertFalse(result)  # Returns False on error

    @patch(
        "workflow_core.workflow_core_impl.WorkflowCoreImpl.get_workflow_by_workflow_id"
    )
    @patch.object(AirflowApi, "get_tasks")
    async def test_get_workflow_tasks_airflow_error(
        self, mock_airflow, mock_get_workflow
    ):
        """Test handling of Airflow errors."""
        workflow_id = "123"
        run_id = "run_id"
        user_id = "user_id"
        mock_get_workflow.return_value = MagicMock(
            status="SUCCESS", data=[self.workflow_details]
        )
        mock_airflow.return_value = Exception("Airflow error")

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            await workflow_core._get_workflow_tasks(workflow_id, run_id, user_id)

    @patch.object(WorkflowCoreImpl, "_WorkflowCoreImpl__find_workflow_by_id")
    async def test_get_workflow_tasks_no_workflow_found(self, mock_get_workflow):
        """Test error handling when workflow not found."""
        workflow_id = "invalid_id"
        run_id = "run_id"
        user_id = "user_id"
        mock_get_workflow.return_value = MagicMock(status="SUCCESS", data=[])

        workflow_core = WorkflowCoreImpl("stag")

        with self.assertRaises(Exception) as e:
            await workflow_core._get_workflow_tasks(workflow_id, run_id, user_id)