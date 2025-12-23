# Mock logging configuration to prevent import issues in tests
import sys
import asyncio
from datetime import datetime
from unittest.mock import patch

# Mock the logging configuration before importing any modules
with patch('logging.config.fileConfig'):
    pass

import pytest
from unittest.mock import Mock, patch, AsyncMock
from workflow_core.v3.service.workflow_service_v3 import WorkflowCoreV3Impl
from workflow_core.error.errors import WorkflowNotFound, InvalidWorkflowException
from workflow_core.constants.constants import SUCCESS, UPDATING_ARTIFACT, RESUMING, PAUSING, CREATING_ARTIFACT, INACTIVE, ACTIVE
from workflow_model.v3.request import CreateWorkflowRequestV3, UpdateWorkflowRequestV3, WorkflowsGetRequestV3
from workflow_model.v3.response import WorkflowListDataV3
from workflow_model.v3.workflow import WorkflowV3
from workflow_model.response import WorkflowWorkflowIdDeleteResponseData, LastRunDetails
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig
from workflow_model.v3.workflow_run import WorkflowRunOut


class TestWorkflowCoreV3Impl:
    """Test WorkflowCoreV3Impl service"""

    @pytest.fixture
    def workflow_service(self):
        """Create a WorkflowCoreV3Impl instance with mocked dependencies"""
        with patch('workflow_core.v3.service.workflow_service_v3.WorkflowCoreV3Repo') as mock_repo, \
             patch('workflow_core.v3.service.workflow_service_v3.WorkflowRunV3Repo') as mock_run_repo, \
             patch('workflow_core.v3.service.workflow_service_v3.AirflowV3') as mock_airflow:
            
            service = WorkflowCoreV3Impl(env="test")
            service.repo = mock_repo.return_value
            service.run_repo = mock_run_repo.return_value
            service.airflow_v3 = mock_airflow.return_value
            return service

    @pytest.fixture
    def sample_create_request(self):
        """Sample CreateWorkflowRequestV3 for testing"""
        return CreateWorkflowRequestV3(
            workflow_name="test_workflow",
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="test_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact={
                            "file": "s3://bucket/test.jar",
                            "class_name": "org.example.TestClass",
                            "spark_version": "3.5.0"
                        }
                    )
                )
            ]
        )

    @pytest.fixture
    def sample_update_request(self):
        """Sample UpdateWorkflowRequestV3 for testing"""
        return UpdateWorkflowRequestV3(
            workflow_name="updated_workflow",
            description="Updated workflow",
            tags=["test"],
            schedule="0 1 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            workflow_status=ACTIVE,
            tasks=[]
        )

    @pytest.fixture
    def sample_workflow(self):
        """Sample database workflow object for testing (what repository would return)"""
        # Create a mock that represents what the repository would return
        mock_workflow = Mock()
        mock_workflow.workflow_id = "test-workflow-id"
        mock_workflow.workflow_name = "test_workflow"
        mock_workflow.description = "Test workflow"
        mock_workflow.tags = ["test"]
        mock_workflow.schedule = "0 0 * * *"
        mock_workflow.retries = 1
        mock_workflow.notify_on = "failure"
        mock_workflow.max_concurrent_runs = 1
        mock_workflow.start_date = "2024-01-01T00:00:00"
        mock_workflow.end_date = None
        mock_workflow.created_by = "test@example.com"
        mock_workflow.last_updated_on = "2024-01-01T00:00:00"
        mock_workflow.created_at = "2024-01-01T00:00:00"
        mock_workflow.workflow_status = ACTIVE
        mock_workflow.tasks = []
        mock_workflow.display_name = None
        mock_workflow.parameters = {}
        mock_workflow.max_concurrent_runs = 1
        mock_workflow.callback_urls = []
        mock_workflow.event_types = []
        mock_workflow.tenant = "d11"
        mock_workflow.expected_run_duration = None
        mock_workflow.queue_enabled = False
        mock_workflow.notify_on_states = ['FAILED']
        mock_workflow.timezone = "UTC"
        
        return mock_workflow

    def test_validate_workflow_state_valid(self, workflow_service):
        """Test workflow state validation with valid state"""
        # Should not raise exception
        workflow_service._validate_workflow_state(ACTIVE)
        workflow_service._validate_workflow_state(INACTIVE)

    def test_validate_workflow_state_invalid(self, workflow_service):
        """Test workflow state validation with invalid states"""
        invalid_states = [RESUMING, PAUSING, UPDATING_ARTIFACT]
        
        for state in invalid_states:
            with pytest.raises(InvalidWorkflowException) as exc_info:
                workflow_service._validate_workflow_state(state)
            assert "Cannot update the workflow" in str(exc_info.value)

    def test_handle_inactive_workflow_schedule_activation(self, workflow_service, sample_update_request):
        """Test handling inactive workflow schedule when activating"""
        sample_update_request.workflow_status = ACTIVE
        original_schedule = sample_update_request.schedule
        
        workflow_service._handle_inactive_workflow_schedule(sample_update_request, INACTIVE)
        
        # Schedule should remain unchanged when activating
        assert sample_update_request.schedule == original_schedule

    def test_handle_inactive_workflow_schedule_remaining_inactive(self, workflow_service, sample_update_request):
        """Test handling inactive workflow schedule when remaining inactive"""
        sample_update_request.workflow_status = INACTIVE
        
        workflow_service._handle_inactive_workflow_schedule(sample_update_request, INACTIVE)
        
        # Schedule should be set to default when remaining inactive
        assert sample_update_request.schedule == "0 0 31 2 *"

    @pytest.mark.asyncio
    async def test_create_workflow_v3_success(self, workflow_service, sample_create_request):
        """Test successful workflow creation"""
        # Mock repository methods
        workflow_service.repo.check_workflow_exists_by_name.return_value = asyncio.Future()
        workflow_service.repo.check_workflow_exists_by_name.return_value.set_result(False)
        workflow_service.repo.create_workflow.return_value = asyncio.Future()
        workflow_service.repo.create_workflow.return_value.set_result(sample_create_request)
        
        # Mock event creation
        with patch('workflow_core.v3.service.workflow_service_v3.create_workflow_event') as mock_create_event, \
             patch('workflow_core.v3.service.workflow_service_v3.publish_event') as mock_publish_event:
            
            mock_create_event.return_value = {"event": "data"}
            
            result, workflow = await workflow_service.create_workflow_v3(sample_create_request, "test@example.com")
            
            assert result == SUCCESS
            assert workflow is not None
            assert workflow.workflow_name == "test_workflow"
            
            # Verify repository calls
            workflow_service.repo.check_workflow_exists_by_name.assert_called_once_with("test_workflow")
            workflow_service.repo.create_workflow.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_workflow_v3_already_exists(self, workflow_service, sample_create_request):
        """Test workflow creation when workflow already exists"""
        workflow_service.repo.check_workflow_exists_by_name.return_value = asyncio.Future()
        workflow_service.repo.check_workflow_exists_by_name.return_value.set_result(True)
        
        result, workflow = await workflow_service.create_workflow_v3(sample_create_request, "test@example.com")
        
        assert result == "Workflow with name test_workflow already exists"
        assert workflow is None

    @pytest.mark.asyncio
    async def test_create_workflow_v3_exception(self, workflow_service, sample_create_request):
        """Test workflow creation with exception"""
        workflow_service.repo.check_workflow_exists_by_name.return_value = asyncio.Future()
        workflow_service.repo.check_workflow_exists_by_name.return_value.set_result(False)
        workflow_service.repo.create_workflow.side_effect = Exception("Database error")
        
        result, workflow = await workflow_service.create_workflow_v3(sample_create_request, "test@example.com")
        
        assert "Database error" in result
        assert workflow is None

    @pytest.mark.asyncio
    async def test_update_workflow_v3_success(self, workflow_service, sample_update_request, sample_workflow):
        """Test successful workflow update"""
        # Mock repository methods
        workflow_service.repo.get_workflow_by_id.return_value = asyncio.Future()
        workflow_service.repo.get_workflow_by_id.return_value.set_result(sample_workflow)
        workflow_service.repo.update_workflow.return_value = asyncio.Future()
        workflow_service.repo.update_workflow.return_value.set_result(sample_workflow)
        
        # Mock event creation
        with patch('workflow_core.v3.service.workflow_service_v3.create_workflow_event') as mock_create_event, \
             patch('workflow_core.v3.service.workflow_service_v3.publish_event') as mock_publish_event:
            
            mock_create_event.return_value = {"event": "data"}
            
            result, workflow = await workflow_service.update_workflow_v3(sample_update_request, "test-workflow-id")
            
            assert result == SUCCESS
            assert workflow is not None
            
            # Verify repository calls
            workflow_service.repo.update_workflow.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_workflow_v3_not_found(self, workflow_service, sample_update_request):
        """Test workflow update when workflow not found"""
        future = asyncio.Future()
        future.set_exception(WorkflowNotFound("Workflow not found"))
        workflow_service.repo.get_workflow_by_id.return_value = future
        
        result, workflow = await workflow_service.update_workflow_v3(sample_update_request, "invalid-id")
        
        assert "Workflow not found" in result
        assert workflow is None

    @pytest.mark.asyncio
    async def test_update_workflow_v3_invalid_state(self, workflow_service, sample_update_request, sample_workflow):
        """Test workflow update with invalid state"""
        sample_workflow.workflow_status = UPDATING_ARTIFACT
        workflow_service.repo.get_workflow_by_id.return_value = asyncio.Future()
        workflow_service.repo.get_workflow_by_id.return_value.set_result(sample_workflow)
        
        result, workflow = await workflow_service.update_workflow_v3(sample_update_request, "test-workflow-id")
        
        assert "Cannot update the workflow" in result
        assert workflow is None

    @pytest.mark.asyncio
    async def test_search_workflows_v3_success(self, workflow_service):
        """Test successful workflow search"""
        # Mock repository methods
        mock_workflows = [
            Mock(
                workflow_id="workflow-1",
                workflow_name="workflow1",
                display_name="Workflow 1",
                description="Test workflow 1",
                workflow_status=ACTIVE,
                tags=["test"],
                schedule="0 0 * * *",
                parameters={},
                created_by="test@example.com",
                next_run=Mock(strftime=lambda fmt: "2024-01-01 00:00:00")
            ),
            Mock(
                workflow_id="workflow-2", 
                workflow_name="workflow2",
                display_name="Workflow 2",
                description="Test workflow 2",
                workflow_status=INACTIVE,
                tags=["prod"],
                schedule="0 1 * * *",
                parameters={},
                created_by="test2@example.com",
                next_run=None
            )
        ]
        
        workflow_service.repo.search_workflows.return_value = asyncio.Future()
        workflow_service.repo.search_workflows.return_value.set_result((2, mock_workflows))
        workflow_service.run_repo.get_recent_runs_by_workflow_id.return_value = asyncio.Future()
        workflow_service.run_repo.get_recent_runs_by_workflow_id.return_value.set_result([])
        
        search_request = WorkflowsGetRequestV3(
            query="test",
            offset=0,
            page_size=10
        )
        
        total, workflows = await workflow_service.search_workflows_v3(search_request)
        
        assert total == 2
        assert len(workflows) == 2
        assert isinstance(workflows[0], WorkflowListDataV3)
        assert workflows[0].workflow_name == "workflow1"
        assert workflows[1].workflow_name == "workflow2"

    @pytest.mark.asyncio
    async def test_get_workflow_by_id_v3_success(self, workflow_service, sample_workflow):
        """Test successful workflow retrieval by ID"""
        workflow_service.repo.get_workflow_by_id.return_value = asyncio.Future()
        workflow_service.repo.get_workflow_by_id.return_value.set_result(sample_workflow)
        
        result = await workflow_service.get_workflow_by_id_v3("test-workflow-id")
        
        assert result is not None
        assert result.workflow_id == "test-workflow-id"
        workflow_service.repo.get_workflow_by_id.assert_called_once_with("test-workflow-id")

    @pytest.mark.asyncio
    async def test_get_workflow_by_id_v3_not_found(self, workflow_service):
        """Test workflow retrieval by ID when not found"""
        future = asyncio.Future()
        future.set_exception(WorkflowNotFound("Workflow not found"))
        workflow_service.repo.get_workflow_by_id.return_value = future
        
        with pytest.raises(WorkflowNotFound):
            await workflow_service.get_workflow_by_id_v3("invalid-id")

    @pytest.mark.asyncio
    async def test_delete_workflow_v3_success(self, workflow_service, sample_workflow):
        """Test successful workflow deletion"""
        workflow_service.repo.get_workflow_by_id.return_value = asyncio.Future()
        workflow_service.repo.get_workflow_by_id.return_value.set_result(sample_workflow)
        workflow_service.repo.delete_workflow.return_value = asyncio.Future()
        workflow_service.repo.delete_workflow.return_value.set_result(sample_workflow)
        
        result = await workflow_service.delete_workflow_v3("test-workflow-id")
        
        assert isinstance(result, WorkflowWorkflowIdDeleteResponseData)
        assert result.workflow_id == "test-workflow-id"
        workflow_service.repo.delete_workflow.assert_called_once_with("test-workflow-id")

    @pytest.mark.asyncio
    async def test_delete_workflow_v3_not_found(self, workflow_service):
        """Test workflow deletion when not found"""
        future = asyncio.Future()
        future.set_exception(WorkflowNotFound("Workflow not found"))
        workflow_service.repo.get_workflow_by_id.return_value = future
        
        with pytest.raises(WorkflowNotFound):
            await workflow_service.delete_workflow_v3("invalid-id")

    @pytest.mark.asyncio
    async def test_get_workflow_by_name_v3_success(self, workflow_service, sample_workflow):
        """Test successful workflow retrieval by name"""
        workflow_service.repo.get_workflow_by_name.return_value = asyncio.Future()
        workflow_service.repo.get_workflow_by_name.return_value.set_result(sample_workflow)
        
        result = await workflow_service.get_workflow_by_name_v3("test_workflow")
        
        assert result is not None
        assert result.workflow_name == "test_workflow"
        workflow_service.repo.get_workflow_by_name.assert_called_once_with("test_workflow")

    @pytest.mark.asyncio
    async def test_get_workflow_by_name_v3_not_found(self, workflow_service):
        """Test workflow retrieval by name when not found"""
        future = asyncio.Future()
        future.set_exception(WorkflowNotFound("Workflow not found"))
        workflow_service.repo.get_workflow_by_name.return_value = future
        
        with pytest.raises(WorkflowNotFound):
            await workflow_service.get_workflow_by_name_v3("invalid_workflow")

    @pytest.mark.asyncio
    async def test_run_now_success(self, workflow_service, sample_workflow):
        """Test successful run now execution"""
        workflow_service.repo.get_workflow_by_id.return_value = asyncio.Future()
        workflow_service.repo.get_workflow_by_id.return_value.set_result(sample_workflow)
        workflow_service.airflow_v3.run_now.return_value = {"dag_run_id": "test-run-id", "state": "RUNNING", "run_type": "MANUAL"}
        
        # Mock the WorkflowRunV3Repo.count_running_runs_by_workflow_id method
        with patch('workflow_core.v3.service.workflow_service_v3.WorkflowRunV3Repo.count_running_runs_by_workflow_id') as mock_count:
            mock_count.return_value = 0  # No running runs
            
            # Mock WorkflowRunV3.create
            with patch('workflow_core.v3.service.workflow_service_v3.WorkflowRunV3.create') as mock_create:
                mock_create.return_value = Mock()  # Return a mock workflow run
                
                parameters = {"param1": "value1"}
                result = await workflow_service.run_now("test-workflow-id", parameters)
                
                assert result is not None
                workflow_service.airflow_v3.run_now.assert_called_once_with("test_workflow", parameters)

    @pytest.mark.asyncio
    async def test_run_now_workflow_not_found(self, workflow_service):
        """Test run now when workflow not found"""
        future = asyncio.Future()
        future.set_exception(WorkflowNotFound("Workflow not found"))
        workflow_service.repo.get_workflow_by_id.return_value = future
        
        with pytest.raises(WorkflowNotFound):
            await workflow_service.run_now("invalid-id", {})

    def test_convert_tasks_to_v3_format(self, workflow_service):
        """Test conversion of tasks to V3 format"""
        # Mock workflow tasks with proper PelicanConfig structure
        mock_pelican_config = Mock()
        mock_pelican_config.artifact = {
            "file": "s3://bucket/test.jar",
            "class_name": "org.example.TestClass",
            "spark_version": "3.5.0"
        }
        mock_pelican_config.cluster = {
            "engineType": "SPARK",
            "engineVersion": "3.5.0"
        }
        mock_pelican_config.spark_configs = {
            "spark.executor.memory": "4g"
        }
        mock_pelican_config.instance_role = "ds_dataengineering_role"
        mock_pelican_config.args = ["arg1", "arg2"]
        mock_pelican_config.polling_interval = 15
        mock_pelican_config.application_name = "test_app"
        
        mock_tasks = [
            Mock(
                task_name="task1",
                task_type="pelican",
                pelican_config=mock_pelican_config,
                darwin_config=None,
                retries=2,
                timeout=3600,
                depends_on=[],
                pool="default"
            )
        ]
        
        result = workflow_service._convert_tasks_to_v3_format(mock_tasks)
        
        assert len(result) == 1
        assert isinstance(result[0], TaskV3)
        assert result[0].task_name == "task1"
        assert result[0].task_type == "pelican"

    def test_convert_workflow_to_v3(self, workflow_service):
        """Test conversion of workflow to V3 format"""
        mock_workflow = Mock(
            workflow_id="test-id",
            workflow_name="test_workflow",
            display_name=None,
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            parameters={},
            max_concurrent_runs=1,
            start_date="2024-01-01T00:00:00",
            end_date=None,
            callback_urls=[],
            event_types=[],
            created_by="test@example.com",
            last_updated_on="2024-01-01T00:00:00",
            created_at="2024-01-01T00:00:00",
            workflow_status=ACTIVE,
            tenant="d11",
            expected_run_duration=None,
            tasks=[],
            queue_enabled=False,
            notify_on_states=['FAILED'],
            timezone="UTC"
        )
        
        result = workflow_service._convert_workflow_to_v3(mock_workflow)
        
        assert isinstance(result, WorkflowV3)
        assert result.workflow_id == "test-id"
        assert result.workflow_name == "test_workflow"
        assert result.workflow_status == ACTIVE 