# Mock logging configuration to prevent import issues in tests
import sys
from unittest.mock import patch

# Mock the logging configuration before importing any modules
with patch('logging.config.fileConfig'):
    pass

import pytest
from unittest.mock import Mock, patch, AsyncMock
from workflow_core.v3.service.workflow_run_service_v3 import WorkflowRunV3Impl
from workflow_core.error.errors import WorkflowNotFound, RunNotFoundException
from workflow_model.v3.workflow_run import WorkflowRunsListQuery, WorkflowRunsResponse, WorkflowRunUpdate, WorkflowRunCreate, WorkflowRunOut
from workflow_model.v3.darwin_workflow import WorkflowRunV3


class TestWorkflowRunV3Impl:
    """Test WorkflowRunV3Impl service"""

    @pytest.fixture
    def workflow_run_service(self):
        """Create a WorkflowRunV3Impl instance with mocked dependencies"""
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowCoreV3Repo') as mock_repo, \
             patch('workflow_core.v3.service.workflow_run_service_v3.AirflowV3') as mock_airflow:
            
            service = WorkflowRunV3Impl(env="test")
            service.repo = mock_repo.return_value
            service.airflow_v3 = mock_airflow.return_value
            return service

    @pytest.fixture
    def sample_list_query(self):
        """Sample WorkflowRunsListQuery for testing"""
        return WorkflowRunsListQuery(
            start_date="2024-01-01T00:00:00Z",
            end_date="2024-12-31T23:59:59Z",
            filters=[{"status": "success"}],
            offset=0,
            page_size=10
        )

    @pytest.fixture
    def sample_run_update(self):
        """Sample WorkflowRunUpdate for testing"""
        return WorkflowRunUpdate(
            state="success",
            expected_run_duration=3600
        )

    @pytest.fixture
    def sample_run_create(self):
        """Sample WorkflowRunCreate for testing"""
        from datetime import datetime
        return WorkflowRunCreate(
            workflow_id="test-workflow-id",
            run_id="test-run-id",
            dag_id="test_dag",
            state="running",
            start_time=datetime(2024, 1, 1, 12, 0, 0),
            expected_run_duration=3600
        )

    @pytest.fixture
    def sample_workflow_run(self):
        """Sample WorkflowRunV3 for testing"""
        return Mock(
            workflow_id="test-workflow-id",
            run_id="test-run-id",
            state="running",
            expected_run_duration=3600
        )

    @pytest.mark.asyncio
    async def test_list_workflow_runs_by_id_success(self):
        """Test successful workflow runs listing"""
        query = WorkflowRunsListQuery(
            start_date="2024-01-01T00:00:00Z",
            end_date="2024-12-31T23:59:59Z",
            filters=[{"status": "success"}],
            offset=0,
            page_size=10
        )
        
        # Create a proper mock with all required fields
        from datetime import datetime
        mock_run = Mock()
        mock_run.id = 1
        mock_run.workflow_id = "test-workflow-id"
        mock_run.run_id = "run-1"
        mock_run.workflow_name = "test_workflow"
        mock_run.dag_id = "test_dag"
        mock_run.state = "success"
        mock_run.parameters = {}
        mock_run.run_type = "scheduled"
        mock_run.triggered_by = "scheduled"
        mock_run.start_time = datetime(2024, 1, 1, 12, 0, 0)
        mock_run.end_time = datetime(2024, 1, 1, 12, 30, 0)
        mock_run.duration = 1800
        mock_run.repair_time = None
        mock_run.expected_run_duration = 3600
        mock_run.sla_exceeded = False
        mock_run.created_at = datetime(2024, 1, 1, 12, 0, 0)
        mock_run.updated_at = datetime(2024, 1, 1, 12, 30, 0)
        
        mock_runs = [mock_run]
        
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.list_runs_by_workflow_id') as mock_list_runs, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.count_runs_by_workflow_id') as mock_count_runs:
            
            mock_list_runs.return_value = mock_runs
            mock_count_runs.return_value = 1
            
            result = await WorkflowRunV3Impl.list_workflow_runs_by_id("test-workflow-id", query)
            
            assert isinstance(result, WorkflowRunsResponse)
            assert result.result_size == 1
            assert len(result.data) == 1

    @pytest.mark.asyncio
    async def test_list_workflow_runs_by_id_empty(self, sample_list_query):
        """Test workflow runs listing with no results"""
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.list_runs_by_workflow_id') as mock_list_runs, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.count_runs_by_workflow_id') as mock_count_runs:
            
            mock_list_runs.return_value = []
            mock_count_runs.return_value = 0
            
            result = await WorkflowRunV3Impl.list_workflow_runs_by_id("test-workflow-id", sample_list_query)
            
            assert result.result_size == 0
            assert len(result.data) == 0

    @pytest.mark.asyncio
    async def test_update_workflow_run_by_id_success(self):
        """Test successful workflow run update"""
        update_data = WorkflowRunUpdate(state="success")
        
        # Create a proper mock with all required fields
        from datetime import datetime
        mock_instance = Mock()
        mock_instance.id = 1
        mock_instance.workflow_id = "test-workflow-id"
        mock_instance.run_id = "test-run-id"
        mock_instance.workflow_name = "test_workflow"
        mock_instance.dag_id = "test_dag"
        mock_instance.state = "running"
        mock_instance.parameters = {}
        mock_instance.run_type = "scheduled"
        mock_instance.triggered_by = "scheduled"
        mock_instance.start_time = datetime(2024, 1, 1, 12, 0, 0)
        mock_instance.end_time = datetime(2024, 1, 1, 12, 30, 0)
        mock_instance.duration = 1800
        mock_instance.repair_time = None
        mock_instance.expected_run_duration = 3600
        mock_instance.sla_exceeded = False
        mock_instance.created_at = datetime(2024, 1, 1, 12, 0, 0)
        mock_instance.updated_at = datetime(2024, 1, 1, 12, 30, 0)
        
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.get_by_workflow_and_run_id') as mock_get, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.update') as mock_update, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunOut.from_tortoise_orm') as mock_from_orm:
            
            mock_get.return_value = mock_instance
            mock_update.return_value = mock_instance
            mock_from_orm.return_value = WorkflowRunOut(
                id=1,
                workflow_id="test-workflow-id",
                run_id="test-run-id",
                workflow_name="test_workflow",
                dag_id="test_dag",
                state="success",
                parameters={},
                run_type="scheduled",
                triggered_by="scheduled",
                start_time=datetime(2024, 1, 1, 12, 0, 0),
                end_time=datetime(2024, 1, 1, 12, 30, 0),
                duration=1800,
                repair_time=None,
                expected_run_duration=3600,
                sla_exceeded=False,
                created_at=datetime(2024, 1, 1, 12, 0, 0),
                updated_at=datetime(2024, 1, 1, 12, 30, 0)
            )
            
            result = await WorkflowRunV3Impl.update_workflow_run_by_id("test-workflow-id", "test-run-id", update_data)
            
            assert isinstance(result, WorkflowRunOut)
            mock_update.assert_called_once_with(mock_instance, update_data)

    @pytest.mark.asyncio
    async def test_update_workflow_run_by_id_not_found(self):
        """Test workflow run update when run not found"""
        update_data = WorkflowRunUpdate(state="success")
        
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.get_by_workflow_and_run_id') as mock_get:
            mock_get.return_value = None
            
            with pytest.raises(WorkflowNotFound):
                await WorkflowRunV3Impl.update_workflow_run_by_id("test-workflow-id", "invalid-run-id", update_data)

    @pytest.mark.asyncio
    async def test_create_workflow_run_success(self):
        """Test successful workflow run creation"""
        from datetime import datetime
        create_data = WorkflowRunCreate(
            workflow_id="test-workflow-id",
            run_id="test-run-id",
            dag_id="test_dag",
            state="running",
            start_time=datetime(2024, 1, 1, 12, 0, 0)
        )
        
        # Create a proper mock with all required fields
        from datetime import datetime
        mock_instance = Mock()
        mock_instance.id = 1
        mock_instance.workflow_id = "test-workflow-id"
        mock_instance.run_id = "test-run-id"
        mock_instance.workflow_name = "test_workflow"
        mock_instance.dag_id = "test_dag"
        mock_instance.state = "running"
        mock_instance.parameters = {}
        mock_instance.run_type = "scheduled"
        mock_instance.triggered_by = "scheduled"
        mock_instance.start_time = datetime(2024, 1, 1, 12, 0, 0)
        mock_instance.end_time = None
        mock_instance.duration = None
        mock_instance.repair_time = None
        mock_instance.expected_run_duration = None
        mock_instance.sla_exceeded = False
        mock_instance.created_at = datetime(2024, 1, 1, 12, 0, 0)
        mock_instance.updated_at = datetime(2024, 1, 1, 12, 0, 0)
        
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3.create') as mock_create, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunOut.from_tortoise_orm') as mock_from_orm:
            
            mock_create.return_value = mock_instance
            mock_from_orm.return_value = WorkflowRunOut(
                id=1,
                workflow_id="test-workflow-id",
                run_id="test-run-id",
                workflow_name="test_workflow",
                dag_id="test_dag",
                state="running",
                parameters={},
                run_type="scheduled",
                triggered_by="scheduled",
                start_time=datetime(2024, 1, 1, 12, 0, 0),
                end_time=None,
                duration=None,
                repair_time=None,
                expected_run_duration=None,
                sla_exceeded=False,
                created_at=datetime(2024, 1, 1, 12, 0, 0),
                updated_at=datetime(2024, 1, 1, 12, 0, 0)
            )
            
            result = await WorkflowRunV3Impl.create_workflow_run(create_data)
            
            assert isinstance(result, WorkflowRunOut)
            assert result.workflow_id == "test-workflow-id"

    @pytest.mark.asyncio
    async def test_create_workflow_run_exception(self, sample_run_create):
        """Test workflow run creation with exception"""
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3.create') as mock_create:
            mock_create.side_effect = Exception("Database error")
            
            with pytest.raises(Exception) as exc_info:
                await WorkflowRunV3Impl.create_workflow_run(sample_run_create)
            
            assert "Database error" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_stop_workflow_run_success(self, workflow_run_service):
        """Test successful workflow run stop"""
        # Mock the repository method call
        workflow_run_service.repo.get_workflow_by_id = AsyncMock(return_value=Mock(
            workflow_id="test-workflow-id",
            workflow_name="test_workflow"
        ))
        
        mock_run = Mock(workflow_id="test-workflow-id", run_id="test-run-id", state="running")
        mock_run.save = AsyncMock()
        
        with patch('workflow_model.v3.darwin_workflow.WorkflowRunV3.get_or_none') as mock_get_or_none:
            mock_get_or_none.return_value = mock_run
            
            result = await workflow_run_service.stop_workflow_run("test-workflow-id", "test-run-id")
            
            assert result["status"] == "STOPPING"
            assert mock_run.state == "STOPPING"
            mock_run.save.assert_called_once()
            workflow_run_service.airflow_v3.stop_run.assert_called_once_with("test_workflow", "test-run-id")

    @pytest.mark.asyncio
    async def test_stop_workflow_run_workflow_not_found(self, workflow_run_service):
        """Test workflow run stop when workflow not found"""
        workflow_run_service.repo.get_workflow_by_id = AsyncMock(return_value=None)
        
        with pytest.raises(WorkflowNotFound):
            await workflow_run_service.stop_workflow_run("invalid-workflow-id", "test-run-id")

    @pytest.mark.asyncio
    async def test_stop_workflow_run_run_not_found(self, workflow_run_service):
        """Test workflow run stop when run not found"""
        workflow_run_service.repo.get_workflow_by_id = AsyncMock(return_value=Mock(
            workflow_id="test-workflow-id",
            workflow_name="test_workflow"
        ))
        
        with patch('workflow_model.v3.darwin_workflow.WorkflowRunV3.get_or_none') as mock_get_or_none:
            mock_get_or_none.return_value = None
            
            with pytest.raises(RunNotFoundException):
                await workflow_run_service.stop_workflow_run("test-workflow-id", "invalid-run-id")

    @pytest.mark.asyncio
    async def test_stop_workflow_run_exception(self, workflow_run_service):
        """Test workflow run stop with exception"""
        workflow_run_service.repo.get_workflow_by_id = AsyncMock(side_effect=Exception("Database error"))
        
        with pytest.raises(Exception) as exc_info:
            await workflow_run_service.stop_workflow_run("test-workflow-id", "test-run-id")
        
        assert "Database error" in str(exc_info.value)

    def test_workflow_run_service_initialization(self):
        """Test WorkflowRunV3Impl initialization"""
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowCoreV3Repo') as mock_repo, \
             patch('workflow_core.v3.service.workflow_run_service_v3.AirflowV3') as mock_airflow:
            
            service = WorkflowRunV3Impl(env="test")
            
            assert service.env == "test"
            assert service.repo is not None
            assert service.airflow_v3 is not None

    def test_workflow_run_service_default_env(self):
        """Test WorkflowRunV3Impl initialization with default env"""
        with patch('workflow_core.v3.service.workflow_run_service_v3.get_env') as mock_get_env, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowCoreV3Repo') as mock_repo, \
             patch('workflow_core.v3.service.workflow_run_service_v3.AirflowV3') as mock_airflow:
            
            mock_get_env.return_value = "default_env"
            
            service = WorkflowRunV3Impl()
            
            assert service.env == "default_env"
            mock_get_env.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_workflow_runs_with_filters(self):
        """Test workflow runs listing with various filters"""
        query = WorkflowRunsListQuery(
            start_date="2024-01-01T00:00:00Z",
            end_date="2024-12-31T23:59:59Z",
            filters=[{"status": "success"}, {"duration": ">3600"}],
            offset=5,
            page_size=20
        )
        
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.list_runs_by_workflow_id') as mock_list_runs, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.count_runs_by_workflow_id') as mock_count_runs:
            
            mock_list_runs.return_value = []
            mock_count_runs.return_value = 0
            
            result = await WorkflowRunV3Impl.list_workflow_runs_by_id("test-workflow-id", query)
            
            # Verify filters are passed correctly
            mock_list_runs.assert_called_once_with(
                workflow_id="test-workflow-id",
                start_date="2024-01-01T00:00:00Z",
                end_date="2024-12-31T23:59:59Z",
                filters=[{"status": "success"}, {"duration": ">3600"}],
                offset=5,
                limit=20
            )

    @pytest.mark.asyncio
    async def test_update_workflow_run_partial_update(self):
        """Test workflow run update with partial data"""
        partial_update = WorkflowRunUpdate(
            state="success"
            # Only updating state, not expected_run_duration
        )
        
        # Create a proper mock with all required fields
        from datetime import datetime
        mock_instance = Mock()
        mock_instance.id = 1
        mock_instance.workflow_id = "test-workflow-id"
        mock_instance.run_id = "test-run-id"
        mock_instance.workflow_name = "test_workflow"
        mock_instance.dag_id = "test_dag"
        mock_instance.state = "running"
        mock_instance.parameters = {}
        mock_instance.run_type = "scheduled"
        mock_instance.triggered_by = "scheduled"
        mock_instance.start_time = datetime(2024, 1, 1, 12, 0, 0)
        mock_instance.end_time = datetime(2024, 1, 1, 12, 30, 0)
        mock_instance.duration = 1800
        mock_instance.repair_time = None
        mock_instance.expected_run_duration = 3600
        mock_instance.sla_exceeded = False
        mock_instance.created_at = datetime(2024, 1, 1, 12, 0, 0)
        mock_instance.updated_at = datetime(2024, 1, 1, 12, 30, 0)
        
        with patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.get_by_workflow_and_run_id') as mock_get, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunV3Repo.update') as mock_update, \
             patch('workflow_core.v3.service.workflow_run_service_v3.WorkflowRunOut.from_tortoise_orm') as mock_from_orm:
            
            mock_get.return_value = mock_instance
            mock_update.return_value = mock_instance
            mock_from_orm.return_value = WorkflowRunOut(
                id=1,
                workflow_id="test-workflow-id",
                run_id="test-run-id",
                workflow_name="test_workflow",
                dag_id="test_dag",
                state="success",
                parameters={},
                run_type="scheduled",
                triggered_by="scheduled",
                start_time=datetime(2024, 1, 1, 12, 0, 0),
                end_time=datetime(2024, 1, 1, 12, 30, 0),
                duration=1800,
                repair_time=None,
                expected_run_duration=3600,
                sla_exceeded=False,
                created_at=datetime(2024, 1, 1, 12, 0, 0),
                updated_at=datetime(2024, 1, 1, 12, 30, 0)
            )
            
            result = await WorkflowRunV3Impl.update_workflow_run_by_id("test-workflow-id", "test-run-id", partial_update)
            
            assert isinstance(result, WorkflowRunOut)
            mock_update.assert_called_once_with(mock_instance, partial_update) 