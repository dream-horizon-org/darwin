import pytest
from unittest.mock import Mock, patch, MagicMock
import json
from datetime import datetime
import ast

from workflow_model.v3.request import CreateWorkflowRequestV3
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig, PelicanArtifact
from workflow_core.v3.service.dag_creator_service import DagCreator
from workflow_core.v3.service.workflow_service_v3 import WorkflowCoreV3Impl


class TestV3Integration:
    """Integration tests for V3 workflow system"""

    def setup_method(self):
        """Setup test fixtures"""
        self.env = "dev"
        self.user_email = "test@example.com"

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_complete_pelican_workflow_creation(self, mock_create_variable):
        """Test complete Pelican workflow creation flow"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_pelican_workflow",
            description="Test Pelican workflow with args",
            schedule="0 0 * * *",
            retries=2,
            timeout=3600,
            max_concurrent_runs=3,
            notify_on="failure",
            tags=["test", "v3", "pelican"],
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            expected_run_duration=1800,
            queue_enabled=True,
            tenant="d11",
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test.jar",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0",
                            args=["10", "20", "30"]  # Testing args field
                        ),
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
                    ),
                    retries=3,
                    timeout=7200
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        assert data["env"] == self.env
        assert data["dag_args"]["dag_id"] == "test_pelican_workflow"
        assert data["dag_args"]["description"] == "Test Pelican workflow with args"
        assert data["dag_args"]["timetable"] == "0 0 * * *"
        assert data["dag_args"]["retries"] == 2
        assert data["dag_args"]["concurrency"] == 3
        assert data["dag_args"]["created_by"] == self.user_email
        assert data["dag_args"]["tenant"] == "d11"

        # Check task definition
        assert len(data["tasks_definitions"]) == 1
        task_def = data["tasks_definitions"][0]
        assert task_def["task_id"] == "pelican_task"
        assert task_def["op_kwargs"]["task_type"] == "pelican"
        
        # Check artifact with args
        artifact = task_def["op_kwargs"]["artifact"]
        assert artifact["file"] == "s3://bucket/test.jar"
        assert artifact["className"] == "org.example.TestClass"
        assert artifact["sparkVersion"] == "3.5.0"
        assert artifact["args"] == ["10", "20", "30"]  # Args should be preserved

        # Check other task configs
        assert task_def["op_kwargs"]["compute_cluster_config"]["engineType"] == "SPARK"
        assert task_def["op_kwargs"]["engine_config"]["configs"]["spark.executor.memory"] == "4g"
        assert task_def["op_kwargs"]["polling_interval"] == 30
        assert task_def["op_kwargs"]["application_name"] == "test_app"
        assert task_def["op_kwargs"]["retries"] == 3
        assert task_def["op_kwargs"]["timeout"] == 7200

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_complete_darwin_workflow_creation(self, mock_create_variable):
        """Test complete Darwin workflow creation flow"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_darwin_workflow",
            description="Test Darwin workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="darwin_task",
                    task_type="darwin",
                    task_config=DarwinConfig(
                        source="workspace.ipynb",
                        source_type="Workspace",
                        file_path="workspace.ipynb",
                        cluster_type="basic",
                        cluster_name="test-cluster",
                        input_parameters={"param1": "value1"},
                        ha_config={"enable_ha": True},
                        packages=[
                            {
                                "source": "pypi",
                                "body": {
                                    "name": "pandas",
                                    "version": "1.5.0"
                                }
                            }
                        ]
                    ),
                    retries=2,
                    timeout=3600
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        assert data["dag_args"]["dag_id"] == "test_darwin_workflow"
        
        # Check task definition
        assert len(data["tasks_definitions"]) == 1
        task_def = data["tasks_definitions"][0]
        assert task_def["task_id"] == "darwin_task"
        assert task_def["op_kwargs"]["task_type"] == "darwin"
        assert task_def["op_kwargs"]["cluster_type"] == "basic"
        assert task_def["op_kwargs"]["source_type"] == "Workspace"
        assert task_def["op_kwargs"]["source"] == "workspace://test"
        assert task_def["op_kwargs"]["input_parameters"]["param1"] == "value1"
        assert task_def["op_kwargs"]["retries"] == 2
        assert task_def["op_kwargs"]["timeout"] == 3600

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_mixed_workflow_with_dependencies(self, mock_create_variable):
        """Test workflow with both Pelican and Darwin tasks and dependencies"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_mixed_workflow",
            description="Test mixed workflow with dependencies",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="bucket/test.py",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0",
                            args=["10"]
                        )
                    )
                ),
                TaskV3(
                    task_name="darwin_task",
                    task_type="darwin",
                    task_config=DarwinConfig(
                        source="workspace://test",
                        file_path="workspace://test",
                        cluster_type="basic"
                    ),
                    depends_on=["pelican_task"]  # Dependency
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        assert len(data["tasks_definitions"]) == 2
        assert len(data["tasks_dependencies"]) == 1
        assert data["tasks_dependencies"][0] == ("pelican_task", "darwin_task")

        # Check Pelican task
        pelican_task = next(t for t in data["tasks_definitions"] if t["task_id"] == "pelican_task")
        assert pelican_task["op_kwargs"]["task_type"] == "pelican"
        assert pelican_task["op_kwargs"]["artifact"]["args"] == ["10"]

        # Check Darwin task
        darwin_task = next(t for t in data["tasks_definitions"] if t["task_id"] == "darwin_task")
        assert darwin_task["op_kwargs"]["task_type"] == "darwin"

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_workflow_with_multiple_pelican_tasks_and_args(self, mock_create_variable):
        """Test workflow with multiple Pelican tasks having different args"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_multiple_pelican",
            description="Test multiple Pelican tasks",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="pelican_task_1",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test1.jar",
                            class_name="org.example.TestClass1",
                            spark_version="3.5.0",
                            args=["100", "200"]
                        )
                    )
                ),
                TaskV3(
                    task_name="pelican_task_2",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test2.jar",
                            class_name="org.example.TestClass2",
                            spark_version="3.5.0",
                            args=["300", "400", "500"]
                        )
                    ),
                    depends_on=["pelican_task_1"]
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        assert len(data["tasks_definitions"]) == 2
        assert len(data["tasks_dependencies"]) == 1

        # Check first task args
        task1 = next(t for t in data["tasks_definitions"] if t["task_id"] == "pelican_task_1")
        assert task1["op_kwargs"]["artifact"]["args"] == ["100", "200"]

        # Check second task args
        task2 = next(t for t in data["tasks_definitions"] if t["task_id"] == "pelican_task_2")
        assert task2["op_kwargs"]["artifact"]["args"] == ["300", "400", "500"]

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_workflow_with_empty_args(self, mock_create_variable):
        """Test workflow with Pelican task having empty args"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_empty_args",
            description="Test Pelican task with empty args",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test.jar",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0",
                            args=[]  # Empty args
                        )
                    )
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        task_def = data["tasks_definitions"][0]
        assert task_def["op_kwargs"]["artifact"]["args"] == []  # Empty args should be preserved

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_workflow_without_args_field(self, mock_create_variable):
        """Test workflow with Pelican task without args field"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_no_args",
            description="Test Pelican task without args field",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test.jar",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0"
                            # No args field
                        )
                    )
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        task_def = data["tasks_definitions"][0]
        assert task_def["op_kwargs"]["artifact"]["args"] == []  # Should default to empty list

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_json_serialization_with_args(self, mock_create_variable):
        """Test that JSON serialization works correctly with args field"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_json_serialization",
            description="Test JSON serialization",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test.jar",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0",
                            args=["10", "20", "30"]
                        )
                    )
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Serialize to JSON and back
        json_string = json.dumps(data)
        deserialized_data = json.loads(json_string)

        # Assert
        assert deserialized_data["tasks_definitions"][0]["artifact"]["args"] == ["10", "20", "30"]
        assert isinstance(deserialized_data["tasks_definitions"][0]["artifact"]["args"], list)

    @patch('workflow_core.utils.workflow_utils._create_variable')
    def test_complex_args_types(self, mock_create_variable):
        """Test workflow with complex args types (numbers, strings, booleans as strings)"""
        # Arrange
        mock_create_variable.return_value = None
        
        request = CreateWorkflowRequestV3(
            workflow_name="test_complex_args",
            description="Test complex args types",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            max_concurrent_runs=1,
            tasks=[
                TaskV3(
                    task_name="pelican_task",
                    task_type="pelican",
                    task_config=PelicanConfig(
                        artifact=PelicanArtifact(
                            file="s3://bucket/test.jar",
                            class_name="org.example.TestClass",
                            spark_version="3.5.0",
                            args=["10", "hello", "true", "3.14", "false", "test_value"]
                        )
                    )
                )
            ]
        )

        # Act
        dag_creator = DagCreator(self.env)
        data_string = dag_creator.create_dag(request, self.user_email)
        
        # Parse the string to extract the actual dictionary
        data = ast.literal_eval(data_string.replace("json = ", ""))

        # Assert
        task_def = data["tasks_definitions"][0]
        expected_args = ["10", "hello", "true", "3.14", "false", "test_value"]
        assert task_def["artifact"]["args"] == expected_args

        # Test JSON serialization
        json_string = json.dumps(data)
        deserialized_data = json.loads(json_string)
        assert deserialized_data["tasks_definitions"][0]["artifact"]["args"] == expected_args 