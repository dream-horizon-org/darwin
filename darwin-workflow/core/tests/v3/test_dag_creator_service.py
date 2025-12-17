import os
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import json
import ast

# Set LOG_FILE environment variable for testing
os.environ["LOG_FILE"] = "/tmp/test_workflow.log"

from workflow_core.v3.service.dag_creator_service import DagCreator
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig, PelicanArtifact
from workflow_model.v3.request import CreateWorkflowRequestV3


class TestDagCreatorService:
    """Test cases for DagCreator service"""

    def setup_method(self):
        """Setup test fixtures"""
        self.dag_creator = DagCreator("dev")

    def test_create_json_from_dag_args(self):
        """Test JSON creation from DAG arguments"""
        # Arrange
        self.dag_creator.dag_args = {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *"
        }
        self.dag_creator.tasks = [
            ("task1", {"task_type": "pelican"}),
            ("task2", {"task_type": "darwin"})
        ]
        self.dag_creator.dependencies = [("task1", "task2")]

        # Act
        data = self.dag_creator.create_json_from_dag_args()

        # Assert
        # data is a string in format "json = {dictionary}"
        assert isinstance(data, str)
        assert data.startswith("json = ")
        
        # Parse the data to extract the actual dictionary
        json_str = data.replace("json = ", "")
        parsed_json = ast.literal_eval(json_str)
        assert "env" in parsed_json
        assert parsed_json["env"] == "dev"
        assert "dag_args" in parsed_json
        assert parsed_json["dag_args"]["dag_id"] == "test_workflow"
        assert len(parsed_json["tasks_definitions"]) == 2
        assert parsed_json["tasks_definitions"][0]["task_id"] == "task1"
        assert len(parsed_json["tasks_dependencies"]) == 1
        assert parsed_json["tasks_dependencies"][0] == ["task1", "task2"]

    def test_build_pelican_task_args_success(self):
        """Test successful Pelican task args building"""
        # Arrange
        # Set up dag_args with required dag_id
        self.dag_creator.dag_args = {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *"
        }
        
        task = TaskV3(
            task_name="test_pelican",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact=PelicanArtifact(
                    file="s3://bucket/test.jar",
                    class_name="org.example.TestClass",
                    spark_version="3.5.0",
                    args=["arg1", "arg2"]
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
                polling_interval=30,
                application_name="test_app"
            ),
            retries=3,
            timeout=7200
        )

        # Act
        result = self.dag_creator._build_pelican_task_args(task)

        # Assert
        assert result["task_type"] == "pelican"
        assert result["artifact"]["file"] == "s3://bucket/test.jar"
        assert result["artifact"]["className"] == "org.example.TestClass"
        assert result["artifact"]["sparkVersion"] == "3.5.0"
        assert result["artifact"]["args"] == ["arg1", "arg2"]
        assert result["compute_cluster_config"]["engineType"] == "SPARK"
        assert result["engine_config"]["type"] == "SPARK"
        assert result["engine_config"]["configs"]["spark.executor.memory"] == "4g"
        assert result["polling_interval"] == 30
        assert result["application_name"] == "test_app"
        assert result["retries"] == 3
        assert result["timeout"] == 7200

    def test_build_pelican_task_args_minimal(self):
        """Test Pelican task args building with minimal config"""
        # Arrange
        task = TaskV3(
            task_name="test_pelican",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact=PelicanArtifact(
                    file="s3://bucket/test.jar",
                    class_name="org.example.TestClass",
                    spark_version="3.5.0"
                )
            )
        )

        # Act
        result = self.dag_creator._build_pelican_task_args(task)

        # Assert
        assert result["task_type"] == "pelican"
        assert result["artifact"]["file"] == "s3://bucket/test.jar"
        assert result["artifact"]["className"] == "org.example.TestClass"
        assert result["artifact"]["sparkVersion"] == "3.5.0"
        assert result["artifact"]["args"] == []

    @patch('workflow_core.v3.service.dag_creator_service._create_variable')
    def test_build_darwin_task_args_success(self, mock_create_variable):
        """Test successful Darwin task args building"""
        # Arrange
        # Set up dag_args with required dag_id
        self.dag_creator.dag_args = {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *"
        }
        
        # Mock the HTTP call
        mock_create_variable.return_value = None
        
        task = TaskV3(
            task_name="test_darwin",
            task_type="darwin",
            task_config=DarwinConfig(
                source="workspace://test",
                source_type="Workspace",
                file_path="test_notebook.ipynb",
                cluster_type="basic",
                cluster_name="test-cluster",
                input_parameters={"param1": "value1"},
                ha_config={"enabled": True},
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

        # Act
        result = self.dag_creator._build_darwin_task_args(task)

        # Assert
        assert result["task_type"] == "darwin"
        assert result["cluster_id"] is None
        assert result["cluster_type"] == "basic"
        assert result["source_type"] == "Workspace"
        assert result["source"] == "workspace://test"
        assert result["input_parameters"]["param1"] == "value1"
        assert result["retries"] == 2
        assert result["timeout"] == 3600

    @patch('workflow_core.v3.service.dag_creator_service._create_variable')
    def test_add_tasks_success(self, mock_create_variable):
        """Test successful task addition"""
        # Arrange
        # Mock the HTTP call
        mock_create_variable.return_value = None
        
        # Set up dag_args with required dag_id
        self.dag_creator.dag_args = {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *"
        }
        
        tasks = [
            TaskV3(
                task_name="task1",
                task_type="pelican",
                task_config=PelicanConfig(
                    artifact=PelicanArtifact(
                        file="s3://bucket/test.jar",
                        class_name="org.example.TestClass",
                        spark_version="3.5.0"
                    )
                )
            ),
            TaskV3(
                task_name="task2",
                task_type="darwin",
                task_config=DarwinConfig(
                    source="workspace://test",
                    file_path="test_notebook.ipynb",
                    cluster_type="basic"
                )
            )
        ]

        # Act
        self.dag_creator._add_tasks(tasks)

        # Assert
        assert len(self.dag_creator.tasks) == 2
        assert self.dag_creator.tasks[0][0] == "task1"
        assert self.dag_creator.tasks[0][1]["task_type"] == "pelican"
        assert self.dag_creator.tasks[1][0] == "task2"
        assert self.dag_creator.tasks[1][1]["task_type"] == "darwin"

    def test_add_tasks_invalid_task_type(self):
        """Test task addition with invalid task type"""
        # Arrange
        # Create a task with a valid task_type that passes Pydantic validation
        # but will fail in _add_tasks method when it encounters unsupported task type
        invalid_task = TaskV3(
            task_name="invalid_task",
            task_type="pelican",  # Valid task type for Pydantic validation
            task_config=PelicanConfig(
                artifact=PelicanArtifact(
                    file="s3://bucket/test.jar",
                    class_name="org.example.TestClass",
                    spark_version="3.5.0"
                )
            )
        )
        
        # Mock the task to have an invalid task_type that will be caught by _add_tasks
        invalid_task.task_type = "invalid_type"

        # Act & Assert
        with pytest.raises(ValueError, match="Unknown task_type"):
            self.dag_creator._add_tasks([invalid_task])

    @patch('workflow_core.v3.service.dag_creator_service._create_variable')
    def test_add_dependencies_success(self, mock_create_variable):
        """Test successful dependency addition"""
        # Arrange
        # Mock the HTTP call
        mock_create_variable.return_value = None
        
        # Set up dag_args with required dag_id
        self.dag_creator.dag_args = {
            "dag_id": "test_workflow",
            "description": "Test workflow",
            "timetable": "0 0 * * *"
        }
        
        tasks = [
            TaskV3(
                task_name="task1",
                task_type="pelican",
                task_config=PelicanConfig(
                    artifact=PelicanArtifact(
                        file="s3://bucket/test.jar",
                        class_name="org.example.TestClass",
                        spark_version="3.5.0"
                    )
                )
            ),
            TaskV3(
                task_name="task2",
                task_type="darwin",
                task_config=DarwinConfig(
                    source="workspace://test",
                    file_path="test_notebook.ipynb",
                    cluster_type="basic"
                ),
                depends_on=["task1"]
            )
        ]

        # Act
        self.dag_creator._add_dependencies(tasks)

        # Assert
        assert len(self.dag_creator.dependencies) == 1
        assert self.dag_creator.dependencies[0] == ("task1", "task2")

    def test_task_args_filtering_none_values(self):
        """Test that None values are filtered out from task args"""
        # Arrange
        task = TaskV3(
            task_name="test_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact=PelicanArtifact(
                    file="s3://bucket/test.jar",
                    class_name="org.example.TestClass",
                    spark_version="3.5.0"
                )
            )
        )

        # Act
        result = self.dag_creator._build_pelican_task_args(task)

        # Assert
        assert "engine_config" not in result  # Should be filtered out
        assert "tags" not in result  # Should be filtered out
        assert "application_name" not in result  # Should be filtered out 