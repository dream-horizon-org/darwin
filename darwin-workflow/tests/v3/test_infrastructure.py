"""
Test infrastructure for V3 integration tests.
Provides setup for real services and test data management.
"""
import os
import pytest
import asyncio
from typing import Dict, Any, Optional
from unittest.mock import Mock

from workflow_core.v3.service.workflow_service_v3 import WorkflowCoreV3Impl
from workflow_core.v3.repository.workflow_core_v3_repo import WorkflowCoreV3Repo
from workflow_core.v3.repository.workflow_run_v3_repo import WorkflowRunV3Repo
from workflow_core.v3.service.airflow_service_v3 import AirflowV3
from workflow_model.v3.request import CreateWorkflowRequestV3, UpdateWorkflowRequestV3
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig, PelicanArtifact


class TestInfrastructure:
    """Setup test infrastructure with real services"""
    
    @classmethod
    def setup_test_airflow(cls):
        """Start test Airflow instance or configure connection"""
        # For now, we'll use a mock Airflow client
        # In production, this would start a real Airflow instance
        return Mock()
    
    @classmethod
    def setup_test_database(cls):
        """Setup test database with real schema"""
        # This would initialize a real test database
        # For now, we'll use the existing test database
        return True
    
    @classmethod
    def setup_test_s3(cls):
        """Setup test S3 bucket"""
        # This would create a test S3 bucket
        # For now, we'll use a mock S3 client
        return Mock()
    
    @classmethod
    def setup_test_environment(cls):
        """Setup complete test environment"""
        cls.airflow_client = cls.setup_test_airflow()
        cls.database_ready = cls.setup_test_database()
        cls.s3_client = cls.setup_test_s3()
        return True


class TestDataManager:
    """Manage test data across integration tests"""
    
    def __init__(self):
        self.test_workflows = []
        self.test_runs = []
    
    def create_test_workflow_data(self, workflow_type: str = "pelican") -> Dict[str, Any]:
        """Create realistic test workflow data"""
        if workflow_type == "pelican":
            return {
                "workflow_name": f"test_pelican_workflow_{os.getpid()}",
                "description": "Test Pelican workflow for integration testing",
                "schedule": "0 0 * * *",
                "retries": 2,
                "timeout": 3600,
                "max_concurrent_runs": 3,
                "notify_on": "failure",
                "tags": ["test", "v3", "pelican", "integration"],
                "start_date": "2025-01-01T00:00:00",
                "end_date": "2025-12-31T23:59:59",
                "expected_run_duration": 1800,
                "queue_enabled": True,
                "tenant": "d11",
                "tasks": [
                    {
                        "task_name": "pelican_task",
                        "task_type": "pelican",
                        "task_config": {
                            "artifact": {
                                "file": "s3://bucket/test.jar",
                                "class_name": "org.example.TestClass",
                                "spark_version": "3.5.0",
                                "args": ["10", "20", "30"]
                            },
                            "cluster": {
                                "engineType": "SPARK",
                                "engineVersion": "3.5.0",
                                "clusterName": "test-cluster"
                            },
                            "spark_configs": {
                                "spark.executor.memory": "4g",
                                "spark.executor.cores": "2"
                            },
                            "tags": {"env": "test", "project": "workflow"},
                            "polling_interval": 30,
                            "application_name": "test_app"
                        },
                        "retries": 3,
                        "timeout": 7200
                    }
                ]
            }
        elif workflow_type == "darwin":
            return {
                "workflow_name": f"test_darwin_workflow_{os.getpid()}",
                "description": "Test Darwin workflow for integration testing",
                "schedule": "0 0 * * *",
                "retries": 1,
                "timeout": 3600,
                "max_concurrent_runs": 1,
                "notify_on": "failure",
                "tags": ["test", "v3", "darwin", "integration"],
                "start_date": "2025-01-01T00:00:00",
                "end_date": "2025-12-31T23:59:59",
                "expected_run_duration": 1800,
                "queue_enabled": True,
                "tenant": "d11",
                "tasks": [
                    {
                        "task_name": "darwin_task",
                        "task_type": "darwin",
                        "task_config": {
                            "source": "workspace://test",
                            "source_type": "Workspace",
                            "file_path": "workspace://test",
                            "cluster_type": "basic",
                            "cluster_name": "test-cluster",
                            "input_parameters": {"param1": "value1"},
                            "ha_config": {"enable_ha": True},
                            "packages": [
                                {
                                    "source": "pypi",
                                    "body": {
                                        "name": "pandas",
                                        "version": "1.5.0"
                                    }
                                }
                            ]
                        },
                        "retries": 2,
                        "timeout": 3600
                    }
                ]
            }
        else:
            raise ValueError(f"Unknown workflow type: {workflow_type}")
    
    def cleanup_test_data(self):
        """Clean up test data after tests"""
        # This would clean up test workflows, runs, etc.
        self.test_workflows.clear()
        self.test_runs.clear()
    
    def setup_test_environment(self):
        """Setup complete test environment"""
        return TestInfrastructure.setup_test_environment()


class TestConfig:
    """Configuration for different test environments"""
    
    @classmethod
    def get_integration_config(cls):
        """Get config for integration tests"""
        return {
            "database_url": os.getenv("TEST_DATABASE_URL", "sqlite:///test.db"),
            "airflow_url": os.getenv("TEST_AIRFLOW_URL", "http://localhost:8080"),
            "s3_bucket": os.getenv("TEST_S3_BUCKET", "test-workflow-bucket"),
            "use_real_services": os.getenv("USE_REAL_SERVICES", "false").lower() == "true",
            "test_environment": "integration"
        }
    
    @classmethod
    def get_test_workflow_service(cls) -> WorkflowCoreV3Impl:
        """Get configured workflow service for testing"""
        config = cls.get_integration_config()
        return WorkflowCoreV3Impl(env=config["test_environment"])
    
    @classmethod
    def get_test_repository(cls) -> WorkflowCoreV3Repo:
        """Get configured repository for testing"""
        return WorkflowCoreV3Repo()
    
    @classmethod
    def get_test_run_repository(cls) -> WorkflowRunV3Repo:
        """Get configured run repository for testing"""
        return WorkflowRunV3Repo()
    
    @classmethod
    def get_test_airflow_service(cls) -> AirflowV3:
        """Get configured Airflow service for testing"""
        config = cls.get_integration_config()
        return AirflowV3(env=config["test_environment"]) 