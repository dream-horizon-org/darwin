import pytest
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime
import sys

# Create mock Airflow modules
class MockAirflowException(Exception):
    """Mock AirflowException for testing"""
    pass

class MockContext:
    """Mock Context for testing"""
    pass

class MockBaseOperator:
    """Mock BaseOperator for testing"""
    def __init__(self, **kwargs):
        self.log = MagicMock()
        for key, value in kwargs.items():
            setattr(self, key, value)

# Create mock modules
mock_airflow_exceptions = type('MockModule', (), {'AirflowException': MockAirflowException})()
mock_airflow_context = type('MockModule', (), {'Context': MockContext})()
mock_airflow_models = type('MockModule', (), {'BaseOperator': MockBaseOperator})()

# Replace modules in sys.modules before importing
sys.modules['airflow.exceptions'] = mock_airflow_exceptions
sys.modules['airflow.utils.context'] = mock_airflow_context
sys.modules['airflow.models'] = mock_airflow_models

# Now import the operator
from operators.pelican_operator import PelicanOperator

class TestPelicanOperator:
    """Test cases for PelicanOperator"""

    def setup_method(self):
        """Setup test fixtures"""
        self.artifact = {
            "file": "s3://bucket/test.jar",
            "className": "org.example.TestClass",
            "sparkVersion": "3.5.0",
            "args": ["10", "20"]  # Testing args field
        }
        self.compute_cluster_config = {
            "engineType": "SPARK",
            "engineVersion": "3.5.0",
            "clusterName": "test-cluster"
        }
        self.engine_config = {
            "type": "SPARK",
            "configs": {
                "spark.executor.memory": "4g",
                "spark.executor.cores": "2"
            }
        }
        self.tags = {"env": "test", "project": "workflow"}

    def test_pelican_operator_initialization(self):
        """Test PelicanOperator initialization"""
        # Act
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican",
            compute_cluster_config=self.compute_cluster_config,
            engine_config=self.engine_config
        )

        # Assert
        assert operator.artifact == self.artifact
        assert operator.task_name == "test_pelican"
        assert operator.compute_cluster_config == self.compute_cluster_config
        assert operator.engine_config == self.engine_config
        assert operator.max_retries == 0  # Default value
        assert operator.poll_interval == 15  # Default value
        assert operator.timeout == 3600  # Default value

    def test_pelican_operator_with_custom_values(self):
        """Test PelicanOperator with custom values"""
        # Act
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican",
            max_retries=3,
            poll_interval=30,
            timeout=7200,
            max_http_retries=5,
            compute_cluster_config=self.compute_cluster_config,
            engine_config=self.engine_config
        )

        # Assert
        assert operator.max_retries == 3
        assert operator.poll_interval == 30
        assert operator.timeout == 7200
        assert operator.max_http_retries == 5

    @patch.object(PelicanOperator, '_post_json')
    @patch.object(PelicanOperator, '_poll_run_status')
    def test_execute_main_success(self, mock_poll_status, mock_post_json):
        """Test successful execution"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        # Mock create application response
        mock_post_json.return_value = {
            "data": {
                "applicationId": "app-123"
            }
        }

        # Mock trigger response
        mock_post_json.side_effect = [
            {"data": {"applicationId": "app-123"}},  # Create response
            {"data": {"runId": "run-456", "applicationId": "app-123"}}  # Trigger response
        ]

        # Mock poll status response
        mock_poll_status.return_value = {
            "state": {
                "life_cycle_state": "FINISHED",
                "result_state": "SUCCESS"
            }
        }

        # Create mock context
        mock_context = {
            "dag": Mock(),
            "run_id": "test_run_123",
            "task": Mock()
        }
        mock_context["dag"].dag_id = "test_dag"
        mock_context["task"].task_id = "test_task"

        # Act
        result = operator.execute_main(context=mock_context)

        # Assert
        assert result["state"]["result_state"] == "SUCCESS"
        assert mock_post_json.call_count == 2
        mock_poll_status.assert_called_once_with("app-123", "run-456", mock_context)

    @patch.object(PelicanOperator, '_post_json')
    def test_execute_main_create_application_failure(self, mock_post_json):
        """Test execution when application creation fails"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        # Set up required attributes that would normally be set by pre_execute
        operator._start_time = datetime.utcnow()

        # Mock failed create application response
        mock_post_json.return_value = {
            "data": {}  # Missing applicationId
        }

        # Create mock context
        mock_context = {
            "dag": Mock(),
            "run_id": "test_run_123",
            "task": Mock()
        }
        mock_context["dag"].dag_id = "test_dag"
        mock_context["task"].task_id = "test_task"

        # Act & Assert
        with pytest.raises(MockAirflowException, match="applicationId missing"):
            operator.execute_main(context=mock_context)

    @patch.object(PelicanOperator, '_post_json')
    def test_execute_main_trigger_failure(self, mock_post_json):
        """Test execution when trigger fails"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        # Set up required attributes that would normally be set by pre_execute
        operator._start_time = datetime.utcnow()

        # Mock successful create but failed trigger
        mock_post_json.side_effect = [
            {"data": {"applicationId": "app-123"}},  # Create response
            {"data": {}}  # Trigger response without runId
        ]

        # Create mock context
        mock_context = {
            "dag": Mock(),
            "run_id": "test_run_123",
            "task": Mock()
        }
        mock_context["dag"].dag_id = "test_dag"
        mock_context["task"].task_id = "test_task"

        # Act & Assert
        with pytest.raises(MockAirflowException, match="runId missing"):
            operator.execute_main(context=mock_context)

    @patch.object(PelicanOperator, '_post_json')
    @patch.object(PelicanOperator, '_poll_run_status')
    def test_execute_main_poll_failure(self, mock_poll_status, mock_post_json):
        """Test execution when polling fails"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        # Set up required attributes that would normally be set by pre_execute
        operator._start_time = datetime.utcnow()

        # Mock successful create and trigger
        mock_post_json.side_effect = [
            {"data": {"applicationId": "app-123"}},
            {"data": {"runId": "run-456", "applicationId": "app-123"}}
        ]

        # Mock poll status with failure
        mock_poll_status.return_value = {
            "state": {
                "life_cycle_state": "FINISHED",
                "result_state": "FAILED"
            }
        }

        # Create mock context
        mock_context = {
            "dag": Mock(),
            "run_id": "test_run_123",
            "task": Mock()
        }
        mock_context["dag"].dag_id = "test_dag"
        mock_context["task"].task_id = "test_task"

        # Act & Assert
        with pytest.raises(MockAirflowException, match="finished with result_state \"FAILED\""):
            operator.execute_main(context=mock_context)

    @patch.object(PelicanOperator, '_retry_request')
    def test_retry_request_success(self, mock_retry_request):
        """Test successful retry request"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        mock_retry_request.return_value = {"status": "success"}

        # Act
        result = operator._post_json("/test", {"data": "test"})

        # Assert
        assert result == {"status": "success"}
        mock_retry_request.assert_called_once_with(
            "post", "/test", json_payload={"data": "test"}
        )

    @patch.object(PelicanOperator, '_retry_request')
    def test_retry_request_failure(self, mock_retry_request):
        """Test retry request failure"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        mock_retry_request.side_effect = MockAirflowException("Request failed")

        # Act & Assert
        with pytest.raises(MockAirflowException, match="Request failed"):
            operator._post_json("/test", {"data": "test"})

    def test_template_fields(self):
        """Test that template fields are correctly defined"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        # Assert
        expected_fields = (
            'task_name',
            'artifact',
            'max_retries',
            'compute_cluster_config',
            'engine_config',
        )
        assert operator.template_fields == expected_fields

    def test_workload_name_generation(self):
        """Test workload name generation"""
        # Arrange
        operator = PelicanOperator(
            task_id="test_task",
            artifact=self.artifact,
            task_name="test_pelican"
        )

        # Act
        workload_name = operator.workload_name

        # Assert
        assert workload_name.startswith("test_pelican_")
        assert len(workload_name) > len("test_pelican_")
