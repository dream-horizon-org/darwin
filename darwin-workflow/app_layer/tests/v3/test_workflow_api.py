import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import status

from workflow_app_layer.v3.workflow_api import router, setup_v3_router
from workflow_model.v3.request import CreateWorkflowRequestV3, UpdateWorkflowRequestV3
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig, PelicanArtifact
from workflow_core.v3.service.workflow_service_v3 import WorkflowCoreV3Impl
from workflow_model.v3.workflow import WorkflowV3
from workflow_model.response import WorkflowWorkflowIdDeleteResponseData
from workflow_model.v3.response import WorkflowListDataV3
from workflow_model.response import LastRunDetails


class TestWorkflowAPI:
    """Test cases for V3 Workflow API endpoints"""

    def setup_method(self):
        """Setup test fixtures"""
        # Create a mock workflow service instance
        self.mock_workflow_service = Mock(spec=WorkflowCoreV3Impl)
        
        # Setup the router with the mock service
        setup_v3_router(self.mock_workflow_service)
        
        self.client = TestClient(router)

    def test_create_workflow_success(self):
        """Test successful workflow creation"""
        # Arrange
        request_data = {
            "workflow_name": "test_workflow",
            "description": "Test workflow",
            "schedule": "0 0 * * *",
            "retries": 2,
            "timeout": 3600,
            "max_concurrent_runs": 3,
            "notify_on": "failure",
            "tags": ["test", "v3"],
            "start_date": "2025-01-01T00:00:00",
            "end_date": "2025-12-31T23:59:59",
            "expected_run_duration": 1800,
            "queue_enabled": True,
            "tenant": "d11",
            "tasks": [
                {
                    "task_name": "test_task",
                    "task_type": "pelican",
                    "task_config": {
                        "artifact": {
                            "file": "s3://bucket/test.jar",
                            "class_name": "org.example.TestClass",
                            "spark_version": "3.5.0",
                            "args": ["10"]
                        },
                        "cluster": {
                            "engineType": "SPARK",
                            "engineVersion": "3.5.0"
                        },
                        "tags": {"env": "test"}
                    },
                    "retries": 3,
                    "timeout": 7200
                }
            ]
        }

        # Create a proper WorkflowV3 mock object
        mock_task = TaskV3(
            task_name="test_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact={"file": "s3://bucket/test.jar", "class_name": "org.example.TestClass", "spark_version": "3.5.0", "args": ["10"]},
                cluster={"engineType": "SPARK", "engineVersion": "3.5.0"},
                spark_configs={},
                instance_role="ds_dataengineering_role",
                args=["10"],
                polling_interval=15,
                application_name="test_app"
            ),
            retries=3,
            timeout=7200
        )
        
        mock_workflow = WorkflowV3(
            workflow_id="test-123",
            workflow_name="test_workflow",
            display_name="test_workflow",
            description="Test workflow",
            tags=["test", "v3"],
            schedule="0 0 * * *",
            retries=2,
            notify_on="failure",
            parameters={},
            max_concurrent_runs=3,
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            callback_urls=[],
            event_types=[],
            created_by="test@example.com",
            last_updated_on="2025-01-01T00:00:00",
            created_at="2025-01-01T00:00:00",
            workflow_status="active",
            tenant="d11",
            expected_run_duration=1800,
            tasks=[mock_task],
            queue_enabled=True,
            notification_preference={"on_start": False, "on_fail": True, "on_success": False, "on_skip": False},
            timezone="UTC"
        )
        
        self.mock_workflow_service.create_workflow_v3.return_value = ("success", mock_workflow)

        # Act
        response = self.client.post(
            "/v3/workflow", 
            json=request_data,
            headers={"msd-user": '{"email": "test@example.com"}'}
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "SUCCESS"
        self.mock_workflow_service.create_workflow_v3.assert_called_once()

    def test_create_workflow_validation_error(self):
        """Test workflow creation with validation error"""
        # Arrange
        invalid_request_data = {
            "workflow_name": "",  # Invalid empty name
            "schedule": "invalid_cron",  # Invalid cron expression
            "tasks": []
        }

        # Act & Assert
        from fastapi.exceptions import RequestValidationError
        
        with pytest.raises(RequestValidationError):
            self.client.post(
                "/v3/workflow", 
                json=invalid_request_data,
                headers={"msd-user": '{"email": "test@example.com"}'}
            )

    def test_get_workflow_by_id_success(self):
        """Test successful workflow retrieval by ID"""
        # Arrange
        workflow_id = "test-123"
        
        # Create a proper WorkflowV3 mock object
        mock_task = TaskV3(
            task_name="test_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact={"file": "s3://bucket/test.jar", "class_name": "org.example.TestClass", "spark_version": "3.5.0", "args": ["10"]},
                cluster={"engineType": "SPARK", "engineVersion": "3.5.0"},
                spark_configs={},
                instance_role="ds_dataengineering_role",
                args=["10"],
                polling_interval=15,
                application_name="test_app"
            ),
            retries=3,
            timeout=7200
        )
        
        mock_workflow = WorkflowV3(
            workflow_id=workflow_id,
            workflow_name="test_workflow",
            display_name="test_workflow",
            description="Test workflow",
            tags=["test", "v3"],
            schedule="0 0 * * *",
            retries=2,
            notify_on="failure",
            parameters={},
            max_concurrent_runs=3,
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            callback_urls=[],
            event_types=[],
            created_by="test@example.com",
            last_updated_on="2025-01-01T00:00:00",
            created_at="2025-01-01T00:00:00",
            workflow_status="active",
            tenant="d11",
            expected_run_duration=1800,
            tasks=[mock_task],
            queue_enabled=True,
            notification_preference={"on_start": False, "on_fail": True, "on_success": False, "on_skip": False},
            timezone="UTC"
        )
        
        self.mock_workflow_service.get_workflow_by_id_v3.return_value = mock_workflow

        # Act
        response = self.client.get(
            f"/v3/workflow/{workflow_id}",
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["workflow_id"] == workflow_id
        self.mock_workflow_service.get_workflow_by_id_v3.assert_called_once_with(workflow_id)

    def test_get_workflow_by_id_not_found(self):
        """Test workflow retrieval when not found"""
        # Arrange
        workflow_id = "nonexistent-123"
        self.mock_workflow_service.get_workflow_by_id_v3.side_effect = Exception("Workflow not found")

        # Act
        response = self.client.get(
            f"/v3/workflow/{workflow_id}",
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    def test_get_workflow_by_name_success(self):
        """Test successful workflow retrieval by name"""
        # Arrange
        workflow_name = "test_workflow"
        
        # Create a proper WorkflowV3 mock object
        mock_task = TaskV3(
            task_name="test_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact={"file": "s3://bucket/test.jar", "class_name": "org.example.TestClass", "spark_version": "3.5.0", "args": ["10"]},
                cluster={"engineType": "SPARK", "engineVersion": "3.5.0"},
                spark_configs={},
                instance_role="ds_dataengineering_role",
                args=["10"],
                polling_interval=15,
                application_name="test_app"
            ),
            retries=3,
            timeout=7200
        )
        
        mock_workflow = WorkflowV3(
            workflow_id="test-123",
            workflow_name=workflow_name,
            display_name=workflow_name,
            description="Test workflow",
            tags=["test", "v3"],
            schedule="0 0 * * *",
            retries=2,
            notify_on="failure",
            parameters={},
            max_concurrent_runs=3,
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            callback_urls=[],
            event_types=[],
            created_by="test@example.com",
            last_updated_on="2025-01-01T00:00:00",
            created_at="2025-01-01T00:00:00",
            workflow_status="active",
            tenant="d11",
            expected_run_duration=1800,
            tasks=[mock_task],
            queue_enabled=True,
            notification_preference={"on_start": False, "on_fail": True, "on_success": False, "on_skip": False},
            timezone="UTC"
        )
        
        self.mock_workflow_service.get_workflow_by_name_v3.return_value = mock_workflow

        # Act
        response = self.client.get(
            f"/v3/workflow/name/{workflow_name}",
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["workflow_name"] == workflow_name
        self.mock_workflow_service.get_workflow_by_name_v3.assert_called_once_with(workflow_name)

    def test_update_workflow_success(self):
        """Test successful workflow update"""
        # Arrange
        workflow_id = "test-123"
        request_data = {
            "workflow_name": "updated_workflow",
            "description": "Updated workflow",
            "schedule": "0 0 * * *",
            "retries": 3,
            "timeout": 7200,
            "tags": ["test", "v3"],
            "notify_on": "failure",
            "max_concurrent_runs": 3,
            "tasks": []
        }

        # Create a proper WorkflowV3 mock object
        mock_task = TaskV3(
            task_name="test_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact={"file": "s3://bucket/test.jar", "class_name": "org.example.TestClass", "spark_version": "3.5.0", "args": ["10"]},
                cluster={"engineType": "SPARK", "engineVersion": "3.5.0"},
                spark_configs={},
                instance_role="ds_dataengineering_role",
                args=["10"],
                polling_interval=15,
                application_name="test_app"
            ),
            retries=3,
            timeout=7200
        )

        mock_workflow = WorkflowV3(
            workflow_id=workflow_id,
            workflow_name="updated_workflow",
            display_name="updated_workflow",
            description="Updated workflow",
            tags=["test", "v3"],
            schedule="0 0 * * *",
            retries=3,
            notify_on="failure",
            parameters={},
            max_concurrent_runs=3,
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            callback_urls=[],
            event_types=[],
            created_by="test@example.com",
            last_updated_on="2025-01-01T00:00:00",
            created_at="2025-01-01T00:00:00",
            workflow_status="active",
            tenant="d11",
            expected_run_duration=1800,
            tasks=[mock_task],
            queue_enabled=True,
            notification_preference={"on_start": False, "on_fail": True, "on_success": False, "on_skip": False},
            timezone="UTC"
        )

        self.mock_workflow_service.update_workflow_v3.return_value = ("success", mock_workflow)

        # Act
        response = self.client.put(
            f"/v3/workflow/{workflow_id}",
            json=request_data,
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["workflow_id"] == workflow_id
        assert response.json()["data"]["workflow_name"] == "updated_workflow"

    def test_delete_workflow_success(self):
        """Test successful workflow deletion"""
        # Arrange
        workflow_id = "test-123"
        
        # Create a proper WorkflowWorkflowIdDeleteResponseData mock object
        mock_response = WorkflowWorkflowIdDeleteResponseData(
            workflow_id=workflow_id,
            is_deleted=True
        )
        
        self.mock_workflow_service.delete_workflow_v3.return_value = mock_response

        # Act
        response = self.client.delete(
            f"/v3/workflow/{workflow_id}",
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["workflow_id"] == workflow_id
        self.mock_workflow_service.delete_workflow_v3.assert_called_once_with(workflow_id)

    def test_search_workflows_success(self):
        """Test successful workflow search"""
        # Arrange
        # Create proper WorkflowListDataV3 mock objects
        mock_workflows = [
            WorkflowListDataV3(
                workflow_name="workflow1",
                display_name="workflow1",
                description="Test workflow 1",
                status="active",
                workflow_id="test-1",
                tags=["test"],
                schedule="0 0 * * *",
                parameters={},
                last_run_details=[],
                next_run_time="2025-01-01T00:00:00",
                owner="test@example.com"
            ),
            WorkflowListDataV3(
                workflow_name="workflow2",
                display_name="workflow2",
                description="Test workflow 2",
                status="active",
                workflow_id="test-2",
                tags=["test"],
                schedule="0 0 * * *",
                parameters={},
                last_run_details=[],
                next_run_time="2025-01-01T00:00:00",
                owner="test@example.com"
            )
        ]
        
        self.mock_workflow_service.search_workflows_v3.return_value = (2, mock_workflows)

        # Act
        response = self.client.get(
            "/v3/workflows",
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["result_size"] == 2
        self.mock_workflow_service.search_workflows_v3.assert_called_once()

    def test_search_workflows_empty_result(self):
        """Test workflow search with empty result"""
        # Arrange
        self.mock_workflow_service.search_workflows_v3.return_value = (0, [])

        # Act
        response = self.client.get(
            "/v3/workflows",
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["result_size"] == 0
        assert len(response.json()["data"]) == 0

    def test_create_workflow_missing_required_fields(self):
        """Test workflow creation with missing required fields"""
        # Arrange
        invalid_request_data = {
            # Missing workflow_name and other required fields
            "description": "Test workflow"
        }

        # Act & Assert
        from fastapi.exceptions import RequestValidationError
        
        with pytest.raises(RequestValidationError):
            self.client.post(
                "/v3/workflow", 
                json=invalid_request_data,
                headers={"msd-user": '{"email": "test@example.com"}'}
            )

    def test_create_workflow_invalid_task_config(self):
        """Test workflow creation with invalid task configuration"""
        # Arrange
        invalid_request_data = {
            "workflow_name": "test_workflow",
            "schedule": "0 0 * * *",
            "tasks": [
                {
                    "task_name": "test_task",
                    "task_type": "pelican",
                    "task_config": {
                        # Missing required artifact fields
                        "cluster": {"engineType": "SPARK"}
                    }
                }
            ]
        }

        # Act & Assert
        from fastapi.exceptions import RequestValidationError
        
        with pytest.raises(RequestValidationError):
            self.client.post(
                "/v3/workflow", 
                json=invalid_request_data,
                headers={"msd-user": '{"email": "test@example.com"}'}
            )

    def test_create_workflow_service_error(self):
        """Test workflow creation when service returns error"""
        # Arrange
        request_data = {
            "workflow_name": "test_workflow",
            "description": "Test workflow",
            "schedule": "0 0 * * *",
            "retries": 1,
            "notify_on": "failure",
            "max_concurrent_runs": 1,
            "tags": ["test"],
            "tasks": [
                {
                    "task_name": "test_task",
                    "task_type": "pelican",
                    "task_config": {
                        "artifact": {
                            "file": "s3://bucket/test.jar",
                            "class_name": "org.example.TestClass",
                            "spark_version": "3.5.0",
                            "args": ["10"]
                        },
                        "cluster": {"engineType": "SPARK"},
                        "spark_configs": {"spark.sql.adaptive.enabled": "true"},
                        "instance_role": "test-role",
                        "args": ["--arg1", "value1"],
                        "polling_interval": 30,
                        "application_name": "test-app"
                    }
                }
            ]
        }

        # Mock service to return error
        with patch('workflow_app_layer.v3.workflow_api.wf_core_v3_instance.create_workflow_v3') as mock_create:
            mock_create.return_value = ("Database error", None)

            # Act
            response = self.client.post(
                "/v3/workflow", 
                json=request_data,
                headers={"msd-user": '{"email": "test@example.com"}'}
            )

        # Assert
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    def test_workflow_with_pelican_task_args(self):
        """Test workflow creation with Pelican task args field"""
        # Arrange
        request_data = {
            "workflow_name": "test_workflow",
            "description": "Test workflow",
            "schedule": "0 0 * * *",
            "retries": 1,
            "notify_on": "failure",
            "max_concurrent_runs": 1,
            "tags": ["test"],
            "tasks": [
                {
                    "task_name": "pelican_task",
                    "task_type": "pelican",
                    "task_config": {
                        "artifact": {
                            "file": "s3://bucket/test.jar",
                            "class_name": "org.example.TestClass",
                            "spark_version": "3.5.0",
                            "args": ["10"]
                        },
                        "cluster": {
                            "engineType": "SPARK",
                            "engineVersion": "3.5.0"
                        },
                        "spark_configs": {"spark.sql.adaptive.enabled": "true"},
                        "instance_role": "test-role",
                        "args": ["10", "20", "30"],  # Testing args field
                        "polling_interval": 30,
                        "application_name": "test-app"
                    }
                }
            ]
        }

        # Create a proper WorkflowV3 mock object
        mock_task = TaskV3(
            task_name="pelican_task",
            task_type="pelican",
            task_config=PelicanConfig(
                artifact={
                    "file": "s3://bucket/test.jar",
                    "class_name": "org.example.TestClass",
                    "spark_version": "3.5.0",
                    "args": ["10"]
                },
                cluster={"engineType": "SPARK", "engineVersion": "3.5.0"},
                spark_configs={"spark.sql.adaptive.enabled": "true"},
                instance_role="test-role",
                args=["10", "20", "30"],
                polling_interval=30,
                application_name="test-app"
            ),
            retries=1,
            timeout=3600
        )

        mock_workflow = WorkflowV3(
            workflow_id="test-123",
            workflow_name="test_workflow",
            display_name="test_workflow",
            description="Test workflow",
            tags=["test"],
            schedule="0 0 * * *",
            retries=1,
            notify_on="failure",
            parameters={},
            max_concurrent_runs=1,
            start_date="2025-01-01T00:00:00",
            end_date="2025-12-31T23:59:59",
            callback_urls=[],
            event_types=[],
            created_by="test@example.com",
            last_updated_on="2025-01-01T00:00:00",
            created_at="2025-01-01T00:00:00",
            workflow_status="active",
            tenant="d11",
            expected_run_duration=1800,
            tasks=[mock_task],
            queue_enabled=True,
            notification_preference={"on_start": False, "on_fail": True, "on_success": False, "on_skip": False},
            timezone="UTC"
        )

        self.mock_workflow_service.create_workflow_v3.return_value = ("success", mock_workflow)

        # Act
        response = self.client.post(
            "/v3/workflow", 
            json=request_data,
            headers={"msd-user": '{"email": "test@example.com"}'}
        )

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["workflow_name"] == "test_workflow"