import pytest
from typing import List
from pydantic import ValidationError

from workflow_model.v3.task import (
    PelicanArtifact,
    PelicanConfig,
    DarwinConfig,
    TaskV3,
)


class TestPelicanArtifact:
    """Test cases for PelicanArtifact model"""

    def test_valid_pelican_artifact(self):
        """Test valid PelicanArtifact creation"""
        artifact = PelicanArtifact(
            file="s3://bucket/test.jar",
            class_name="org.example.TestClass",
            spark_version="3.5.0",
            args=["arg1", "arg2"]
        )
        
        assert artifact.file == "s3://bucket/test.jar"
        assert artifact.class_name == "org.example.TestClass"
        assert artifact.spark_version == "3.5.0"
        assert artifact.args == ["arg1", "arg2"]

    def test_pelican_artifact_without_args(self):
        """Test PelicanArtifact creation without args"""
        artifact = PelicanArtifact(
            file="s3://bucket/test.jar",
            class_name="org.example.TestClass",
            spark_version="3.5.0"
        )
        
        assert artifact.args == []

    def test_pelican_artifact_missing_required_fields(self):
        """Test PelicanArtifact validation with missing required fields"""
        with pytest.raises(ValidationError):
            PelicanArtifact(
                file="s3://bucket/test.jar",
                # Missing class_name and spark_version
            )

    def test_pelican_artifact_invalid_args_type(self):
        """Test PelicanArtifact with invalid args type"""
        with pytest.raises(ValidationError):
            PelicanArtifact(
                file="s3://bucket/test.jar",
                class_name="org.example.TestClass",
                spark_version="3.5.0",
                args="not_a_list"  # Should be a list
            )


class TestPelicanConfig:
    """Test cases for PelicanConfig model"""

    def test_valid_pelican_config(self):
        """Test valid PelicanConfig creation"""
        config = PelicanConfig(
            artifact=PelicanArtifact(
                file="s3://bucket/test.jar",
                class_name="org.example.TestClass",
                spark_version="3.5.0",
                args=["10"]
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
        )
        
        assert config.artifact.file == "s3://bucket/test.jar"
        assert config.cluster["engineType"] == "SPARK"
        assert config.spark_configs["spark.executor.memory"] == "4g"
        assert config.polling_interval == 15  # Default value
        assert config.instance_role == "ds_dataengineering_role"  # Default value

    def test_pelican_config_minimal(self):
        """Test PelicanConfig with minimal required fields"""
        config = PelicanConfig(
            artifact=PelicanArtifact(
                file="s3://bucket/test.jar",
                class_name="org.example.TestClass",
                spark_version="3.5.0"
            )
        )
        
        assert config.cluster is None
        assert config.spark_configs == {}
        assert config.polling_interval == 15

    def test_pelican_config_custom_values(self):
        """Test PelicanConfig with custom values"""
        config = PelicanConfig(
            artifact=PelicanArtifact(
                file="s3://bucket/test.jar",
                class_name="org.example.TestClass",
                spark_version="3.5.0"
            ),
            polling_interval=30,
            instance_role="custom_role",
            application_name="test_app"
        )
        
        assert config.polling_interval == 30
        assert config.instance_role == "custom_role"
        assert config.application_name == "test_app"


class TestDarwinConfig:
    """Test cases for DarwinConfig model"""

    def test_valid_darwin_config(self):
        """Test valid DarwinConfig creation"""
        config = DarwinConfig(
            source="https://github.com/example/repo",
            source_type="git",
            file_path="notebooks/test.ipynb",
            cluster_type="job",
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
        )
        
        assert config.source == "https://github.com/example/repo"
        assert config.source_type == "git"
        assert config.file_path == "notebooks/test.ipynb"
        assert config.cluster_type == "job"
        assert config.cluster_name == "test-cluster"
        assert config.input_parameters["param1"] == "value1"
        assert config.ha_config.enable_ha is True
        assert len(config.packages) == 1

    def test_darwin_config_minimal(self):
        """Test DarwinConfig with minimal required fields"""
        config = DarwinConfig(
            source="workspace://test",
            cluster_type="basic"
        )
        
        assert config.source_type == "Workspace"  # Default value
        assert config.dynamic_artifact is True  # Default value
        assert config.input_parameters == {}  # Default value
        assert config.packages == []  # Default value

    def test_darwin_config_missing_required_fields(self):
        """Test DarwinConfig validation with missing required fields"""
        with pytest.raises(ValidationError):
            DarwinConfig(
                # Missing source and cluster_type
            )


class TestTaskV3:
    """Test cases for TaskV3 model"""

    def test_valid_pelican_task(self):
        """Test valid Pelican TaskV3 creation"""
        task = TaskV3(
            task_name="test_pelican_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact=PelicanArtifact(
                    file="s3://bucket/test.jar",
                    class_name="org.example.TestClass",
                    spark_version="3.5.0",
                    args=["10"]
                )
            ),
            retries=3,
            timeout=7200,
            depends_on=["task1", "task2"],
            pool="default"
        )
        
        assert task.task_name == "test_pelican_task"
        assert task.task_type == "pelican"
        assert isinstance(task.task_config, PelicanConfig)
        assert task.retries == 3
        assert task.timeout == 7200
        assert task.depends_on == ["task1", "task2"]
        assert task.pool == "default"

    def test_valid_darwin_task(self):
        """Test valid Darwin TaskV3 creation"""
        task = TaskV3(
            task_name="test_darwin_task",
            task_type="darwin",
            task_config=DarwinConfig(
                source="workspace://test",
                cluster_type="basic"
            )
        )
        
        assert task.task_name == "test_darwin_task"
        assert task.task_type == "darwin"
        assert isinstance(task.task_config, DarwinConfig)
        assert task.retries == 1  # Default value
        assert task.timeout == 7200  # Default value

    def test_task_with_dict_config(self):
        """Test TaskV3 creation with dict config (auto-conversion)"""
        task = TaskV3(
            task_name="test_task",
            task_type="pelican",
            task_config={
                "artifact": {
                    "file": "s3://bucket/test.jar",
                    "class_name": "org.example.TestClass",
                    "spark_version": "3.5.0"
                }
            }
        )
        
        assert isinstance(task.task_config, PelicanConfig)
        assert task.task_config.artifact.file == "s3://bucket/test.jar"

    def test_task_invalid_task_type(self):
        """Test TaskV3 validation with invalid task type"""
        with pytest.raises(ValidationError):
            TaskV3(
                task_name="test_task",
                task_type="invalid_type",  # Invalid task type
                task_config=PelicanConfig(
                    artifact=PelicanArtifact(
                        file="s3://bucket/test.jar",
                        class_name="org.example.TestClass",
                        spark_version="3.5.0"
                    )
                )
            )

    def test_task_invalid_name(self):
        """Test TaskV3 validation with invalid task name"""
        with pytest.raises(ValidationError):
            TaskV3(
                task_name="invalid name with spaces",  # Invalid name
                task_type="pelican",
                task_config=PelicanConfig(
                    artifact=PelicanArtifact(
                        file="s3://bucket/test.jar",
                        class_name="org.example.TestClass",
                        spark_version="3.5.0"
                    )
                )
            )

    def test_task_negative_retries(self):
        """Test TaskV3 validation with negative retries"""
        with pytest.raises(ValidationError):
            TaskV3(
                task_name="test_task",
                task_type="pelican",
                task_config=PelicanConfig(
                    artifact=PelicanArtifact(
                        file="s3://bucket/test.jar",
                        class_name="org.example.TestClass",
                        spark_version="3.5.0"
                    )
                ),
                retries=-1  # Invalid negative value
            )

    def test_task_negative_timeout(self):
        """Test TaskV3 validation with negative timeout"""
        with pytest.raises(ValidationError):
            TaskV3(
                task_name="test_task",
                task_type="pelican",
                task_config=PelicanConfig(
                    artifact=PelicanArtifact(
                        file="s3://bucket/test.jar",
                        class_name="org.example.TestClass",
                        spark_version="3.5.0"
                    )
                ),
                timeout=-100  # Invalid negative value
            )

    def test_task_default_values(self):
        """Test TaskV3 default values"""
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
        
        assert task.retries == 1  # Default value
        assert task.timeout == 7200  # Default value
        assert task.depends_on == []  # Default value
        assert task.pool == "default"  # Default value 