import pytest
from unittest.mock import Mock, MagicMock
import json
from datetime import datetime

from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig, PelicanArtifact
from workflow_model.v3.request import CreateWorkflowRequestV3


@pytest.fixture
def sample_pelican_artifact():
    """Sample PelicanArtifact for testing"""
    return PelicanArtifact(
        file="s3://bucket/test.jar",
        class_name="org.example.TestClass",
        spark_version="3.5.0",
        args=["10", "20", "30"]
    )


@pytest.fixture
def sample_pelican_artifact_without_args():
    """Sample PelicanArtifact without args for testing"""
    return PelicanArtifact(
        file="s3://bucket/test.jar",
        class_name="org.example.TestClass",
        spark_version="3.5.0"
    )


@pytest.fixture
def sample_pelican_config(sample_pelican_artifact):
    """Sample PelicanConfig for testing"""
    return PelicanConfig(
        artifact=sample_pelican_artifact,
        cluster={
            "engineType": "SPARK",
            "engineVersion": "3.5.0",
            "clusterName": "test-cluster"
        },
        spark_configs={
            "spark.executor.memory": "4g",
            "spark.executor.cores": "2"
        },
        tags={"env": "test", "project": "workflow"},
        polling_interval=30,
        application_name="test_app"
    )


@pytest.fixture
def sample_darwin_config():
    """Sample DarwinConfig for testing"""
    return DarwinConfig(
        source="workspace://test",
        source_type="Workspace",
        cluster_type="basic",
        cluster_name="test-cluster",
        input_parameters={"param1": "value1"},
        ha_config={"enabled": True},
        packages=[{"name": "pandas", "version": "1.5.0"}]
    )


@pytest.fixture
def sample_pelican_task(sample_pelican_config):
    """Sample Pelican TaskV3 for testing"""
    return TaskV3(
        task_name="test_pelican_task",
        task_type="pelican",
        task_config=sample_pelican_config,
        retries=3,
        timeout=7200,
        depends_on=["task1", "task2"],
        pool="default"
    )


@pytest.fixture
def sample_darwin_task(sample_darwin_config):
    """Sample Darwin TaskV3 for testing"""
    return TaskV3(
        task_name="test_darwin_task",
        task_type="darwin",
        task_config=sample_darwin_config,
        retries=2,
        timeout=3600
    )


@pytest.fixture
def sample_workflow_request(sample_pelican_task, sample_darwin_task):
    """Sample CreateWorkflowRequestV3 for testing"""
    return CreateWorkflowRequestV3(
        workflow_name="test_workflow",
        description="Test workflow with args",
        schedule="0 0 * * *",
        retries=2,
        timeout=3600,
        max_concurrent_runs=3,
        notify_on="failure",
        tags=["test", "v3"],
        start_date="2025-01-01T00:00:00",
        end_date="2025-12-31T23:59:59",
        expected_run_duration=1800,
        queue_enabled=True,
        tenant="d11",
        tasks=[sample_pelican_task, sample_darwin_task]
    )


@pytest.fixture
def sample_pelican_workflow_request(sample_pelican_task):
    """Sample CreateWorkflowRequestV3 with only Pelican task for testing"""
    return CreateWorkflowRequestV3(
        workflow_name="test_pelican_workflow",
        description="Test Pelican workflow",
        tags=["test"],
        schedule="0 0 * * *",
        retries=1,
        notify_on="failure",
        max_concurrent_runs=1,
        tasks=[sample_pelican_task]
    )


@pytest.fixture
def sample_darwin_workflow_request(sample_darwin_task):
    """Sample CreateWorkflowRequestV3 with only Darwin task for testing"""
    return CreateWorkflowRequestV3(
        workflow_name="test_darwin_workflow",
        description="Test Darwin workflow",
        tags=["test"],
        schedule="0 0 * * *",
        retries=1,
        notify_on="failure",
        max_concurrent_runs=1,
        tasks=[sample_darwin_task]
    )


@pytest.fixture
def mock_workflow_service():
    """Mock workflow service for testing"""
    mock_service = Mock()
    mock_service.create_workflow.return_value = {
        "workflow_id": "test-123",
        "workflow_name": "test_workflow",
        "status": "SUCCESS"
    }
    mock_service.get_workflow_by_id.return_value = {
        "workflow_id": "test-123",
        "workflow_name": "test_workflow",
        "description": "Test workflow",
        "status": "SUCCESS"
    }
    mock_service.get_workflow_by_name.return_value = {
        "workflow_id": "test-123",
        "workflow_name": "test_workflow",
        "description": "Test workflow",
        "status": "SUCCESS"
    }
    mock_service.update_workflow.return_value = {
        "workflow_id": "test-123",
        "workflow_name": "updated_workflow",
        "status": "SUCCESS"
    }
    mock_service.delete_workflow.return_value = {
        "workflow_id": "test-123",
        "status": "SUCCESS",
        "message": "Workflow deleted successfully"
    }
    mock_service.search_workflows.return_value = {
        "total_count": 2,
        "workflows": [
            {
                "workflow_id": "test-1",
                "workflow_name": "test_workflow_1"
            },
            {
                "workflow_id": "test-2",
                "workflow_name": "test_workflow_2"
            }
        ]
    }
    return mock_service


@pytest.fixture
def test_env():
    """Test environment for V3 tests"""
    return "test_env"


@pytest.fixture
def test_user_email():
    """Test user email for V3 tests"""
    return "test@example.com"


@pytest.fixture
def sample_dag_data():
    """Sample DAG data for testing"""
    return {
        "env": "test_env",
        "dag_args": {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *",
            "retries": 2,
            "concurrency": 3,
            "created_by": "test@example.com",
            "tenant": "d11"
        },
        "tasks_definitions": [
            {
                "task_id": "pelican_task",
                "task_type": "pelican",
                "artifact": {
                    "file": "s3://bucket/test.jar",
                    "className": "org.example.TestClass",
                    "sparkVersion": "3.5.0",
                    "args": ["10", "20", "30"]
                },
                "compute_cluster_config": {
                    "engineType": "SPARK",
                    "engineVersion": "3.5.0"
                },
                "engine_config": {
                    "type": "SPARK",
                    "configs": {
                        "spark.executor.memory": "4g",
                        "spark.executor.cores": "2"
                    }
                },
                "tags": {"env": "test"},
                "polling_interval": 30,
                "application_name": "test_app",
                "retries": 3,
                "timeout": 7200
            },
            {
                "task_id": "darwin_task",
                "task_type": "darwin",
                "cluster_id": None,
                "cluster_type": "basic",
                "source_type": "Workspace",
                "source": "workspace://test",
                "input_parameters": {"param1": "value1"},
                "retries": 2,
                "timeout": 3600
            }
        ],
        "tasks_dependencies": [
            ("pelican_task", "darwin_task")
        ]
    }


@pytest.fixture
def sample_json_data():
    """Sample JSON data for testing"""
    return json.dumps({
        "env": "test_env",
        "dag_args": {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *"
        },
        "tasks_definitions": [
            {
                "task_id": "pelican_task",
                "task_type": "pelican",
                "artifact": {
                    "file": "s3://bucket/test.jar",
                    "className": "org.example.TestClass",
                    "sparkVersion": "3.5.0",
                    "args": ["10", "20", "30"]
                }
            }
        ],
        "tasks_dependencies": []
    })


# Test data for different scenarios
@pytest.fixture
def complex_args_list():
    """Complex args list for testing various data types"""
    return ["10", "hello", "true", "3.14", "false", "test_value", "1000", "another_string"]


@pytest.fixture
def empty_args_list():
    """Empty args list for testing"""
    return []


@pytest.fixture
def single_arg_list():
    """Single arg for testing"""
    return ["single_argument"]


@pytest.fixture
def numeric_args_list():
    """Numeric args for testing"""
    return ["1", "2", "3", "100", "1000", "3.14", "2.718"]


@pytest.fixture
def boolean_args_list():
    """Boolean args for testing"""
    return ["true", "false", "True", "False", "TRUE", "FALSE"] 