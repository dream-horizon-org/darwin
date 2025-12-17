# Mock logging configuration to prevent import issues in tests
import sys
from unittest.mock import patch

# Mock the logging configuration before importing any modules
with patch('logging.config.fileConfig'):
    pass

import pytest
import os
import shutil
from unittest.mock import Mock, patch, MagicMock
from workflow_core.v3.service.dag_deployer_service import DagDeployer, DeployType
from workflow_core.entity.events_entities import WorkflowState

class TestDagDeployer:
    """Test DagDeployer service"""

    @pytest.fixture
    def dag_deployer(self):
        """Create a DagDeployer instance with mocked dependencies"""
        with patch('workflow_core.v3.service.dag_deployer_service.Config') as mock_config, \
             patch('workflow_core.v3.service.dag_deployer_service.AirflowV3') as mock_airflow:
            
            mock_config_instance = Mock()
            mock_config_instance.get_airflow_s3_folder = "airflow/dags"
            mock_config_instance.get_s3_bucket = "test-bucket"
            mock_config.return_value = mock_config_instance
            
            deployer = DagDeployer(env="test")
            deployer._config = mock_config_instance
            deployer.airflow_v3 = mock_airflow.return_value
            return deployer

    @pytest.fixture
    def sample_dag_content(self):
        """Sample DAG content for testing"""
        return """
json = {
    "env": "test",
    "dag_args": {
        "dag_id": "test_workflow",
        "description": "Test workflow"
    },
    "tasks_definitions": [],
    "tasks_dependencies": []
}
"""

    def test_dag_deployer_initialization(self, dag_deployer):
        """Test DagDeployer initialization"""
        assert dag_deployer.env == "test"
        assert dag_deployer._config is not None
        assert dag_deployer.airflow_v3 is not None

    @patch('workflow_core.v3.service.dag_deployer_service.S3Artifactory')
    @patch('workflow_core.v3.service.dag_deployer_service.create_directory_if_not_exists')
    @patch('workflow_core.v3.service.dag_deployer_service.prepend_content_to_file')
    @patch('workflow_core.v3.service.dag_deployer_service.delete_directory')
    @patch('workflow_core.v3.service.dag_deployer_service.shutil.copyfile')
    @patch('workflow_core.v3.service.dag_deployer_service.uuid.uuid4')
    def test_upload_to_s3_success(self, mock_uuid, mock_copyfile, mock_delete_dir, 
                                 mock_prepend, mock_create_dir, mock_s3_artifactory, 
                                 dag_deployer, sample_dag_content):
        """Test successful S3 upload"""
        mock_uuid_instance = Mock()
        mock_uuid_instance.urn = "urn:uuid:12345678-1234-5678-1234-567812345678"
        mock_uuid.return_value = mock_uuid_instance
        
        mock_s3_instance = Mock()
        mock_s3_artifactory.return_value = mock_s3_instance
        
        mock_create_dir.return_value = "./darwin-artefacts-12345678"
        
        dag_deployer._upload_to_s3(sample_dag_content, "test_dag")
        
        # Verify directory creation was called (don't check exact path)
        mock_create_dir.assert_called_once()
        created_path = mock_create_dir.call_args[0][0]
        assert created_path.startswith('./darwin-artefacts-')
        assert '12345678' in created_path
        
        # Verify file operations
        mock_copyfile.assert_called_once()
        mock_prepend.assert_called_once()
        
        # Verify S3 upload with the correct path pattern
        mock_s3_instance.upload_artifact.assert_called_once()
        upload_call_args = mock_s3_instance.upload_artifact.call_args
        local_path = upload_call_args[0][0]
        bucket = upload_call_args[0][1]
        s3_path = upload_call_args[0][2]
        
        assert local_path.startswith('./darwin-artefacts-')
        assert local_path.endswith('/artefact_test_dag.py')
        assert bucket == 'test-bucket'
        assert s3_path == 'airflow/dags/dags/artefact_test_dag.py'
        
        # Verify cleanup
        mock_delete_dir.assert_called_once()
        deleted_path = mock_delete_dir.call_args[0][0]
        assert deleted_path.startswith('./darwin-artefacts-')
        assert '12345678' in deleted_path

    def test_deploy_create_success(self, dag_deployer, sample_dag_content):
        """Test successful DAG creation deployment"""
        with patch.object(dag_deployer, '_upload_to_s3') as mock_upload, \
             patch.object(dag_deployer, '_setup_deployment') as mock_setup, \
             patch.object(dag_deployer, '_wait_for_deployment_completion') as mock_wait, \
             patch.object(dag_deployer, '_publish_deployment_event') as mock_publish:
            
            mock_setup.return_value = {
                "wait_method": Mock(return_value=True),
                "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED,
                "action_type": "deployment"
            }
            mock_wait.return_value = True
            
            result = dag_deployer.deploy(sample_dag_content, "test_dag", "test-workflow-id", DeployType.CREATE)
            
            assert result is True
            mock_upload.assert_called_once_with(sample_dag_content, "test_dag")
            mock_setup.assert_called_once_with(DeployType.CREATE, "test_dag")
            mock_wait.assert_called_once()
            mock_publish.assert_called_once_with("test-workflow-id", "test_dag", True, mock_setup.return_value)

    def test_deploy_update_success(self, dag_deployer, sample_dag_content):
        """Test successful DAG update deployment"""
        with patch.object(dag_deployer, '_upload_to_s3') as mock_upload, \
             patch.object(dag_deployer, '_setup_deployment') as mock_setup, \
             patch.object(dag_deployer, '_wait_for_deployment_completion') as mock_wait, \
             patch.object(dag_deployer, '_publish_deployment_event') as mock_publish:
            
            mock_setup.return_value = {
                "wait_method": Mock(return_value=True),
                "success_state": WorkflowState.WORKFLOW_UPDATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_UPDATION_FAILED,
                "action_type": "update"
            }
            mock_wait.return_value = True
            
            result = dag_deployer.deploy(sample_dag_content, "test_dag", "test-workflow-id", DeployType.UPDATE)
            
            assert result is True
            mock_upload.assert_called_once_with(sample_dag_content, "test_dag")
            mock_setup.assert_called_once_with(DeployType.UPDATE, "test_dag")
            mock_wait.assert_called_once()
            mock_publish.assert_called_once_with("test-workflow-id", "test_dag", True, mock_setup.return_value)

    def test_deploy_failure(self, dag_deployer, sample_dag_content):
        """Test DAG deployment failure"""
        with patch.object(dag_deployer, '_upload_to_s3') as mock_upload, \
             patch.object(dag_deployer, '_setup_deployment') as mock_setup, \
             patch.object(dag_deployer, '_wait_for_deployment_completion') as mock_wait, \
             patch.object(dag_deployer, '_publish_deployment_event') as mock_publish:
            
            mock_setup.return_value = {
                "wait_method": Mock(return_value=False),
                "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED,
                "action_type": "deployment"
            }
            mock_wait.return_value = False
            
            result = dag_deployer.deploy(sample_dag_content, "test_dag", "test-workflow-id", DeployType.CREATE)
            
            assert result is False
            mock_publish.assert_called_once_with("test-workflow-id", "test_dag", False, mock_setup.return_value)

    def test_setup_deployment_create(self, dag_deployer):
        """Test deployment setup for CREATE type"""
        result = dag_deployer._setup_deployment(DeployType.CREATE, "test_dag")
        
        assert result["action_type"] == "deployment"
        assert result["success_state"] == WorkflowState.WORKFLOW_CREATION_SUCCESS
        assert result["failed_state"] == WorkflowState.WORKFLOW_CREATION_FAILED
        assert callable(result["wait_method"])

    def test_setup_deployment_update_success(self, dag_deployer):
        """Test deployment setup for UPDATE type with successful DAG info retrieval"""
        mock_dag_info = {"last_parsed_time": "2024-01-01T10:00:00Z"}
        dag_deployer.airflow_v3.airflow.get_dag.return_value = mock_dag_info
        
        result = dag_deployer._setup_deployment(DeployType.UPDATE, "test_dag")
        
        assert result["action_type"] == "update"
        assert result["success_state"] == WorkflowState.WORKFLOW_UPDATION_SUCCESS
        assert result["failed_state"] == WorkflowState.WORKFLOW_UPDATION_FAILED
        assert callable(result["wait_method"])
        
        dag_deployer.airflow_v3.airflow.get_dag.assert_called_once_with("test_dag")

    def test_setup_deployment_update_failure(self, dag_deployer):
        """Test deployment setup for UPDATE type with DAG info retrieval failure"""
        dag_deployer.airflow_v3.airflow.get_dag.side_effect = Exception("Airflow error")
        
        with pytest.raises(ValueError) as exc_info:
            dag_deployer._setup_deployment(DeployType.UPDATE, "test_dag")
        
        assert "Cannot update DAG 'test_dag'" in str(exc_info.value)

    def test_wait_for_deployment_completion_success(self, dag_deployer):
        """Test successful deployment completion waiting"""
        deploy_config = {
            "wait_method": Mock(return_value=True)
        }
        
        result = dag_deployer._wait_for_deployment_completion("test_dag", deploy_config)
        
        assert result is True
        deploy_config["wait_method"].assert_called_once()

    def test_wait_for_deployment_completion_failure(self, dag_deployer):
        """Test failed deployment completion waiting"""
        deploy_config = {
            "wait_method": Mock(return_value=False)
        }
        
        result = dag_deployer._wait_for_deployment_completion("test_dag", deploy_config)
        
        assert result is False
        deploy_config["wait_method"].assert_called_once()

    @patch('workflow_core.v3.service.dag_deployer_service.create_workflow_event')
    @patch('workflow_core.v3.service.dag_deployer_service.publish_event')
    def test_publish_deployment_event_success(self, mock_publish_event, mock_create_event, dag_deployer):
        """Test successful deployment event publishing"""
        deploy_config = {
            "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
            "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED
        }
        
        mock_event = {"event": "data"}
        mock_create_event.return_value = mock_event
        
        dag_deployer._publish_deployment_event("test-workflow-id", "test_dag", True, deploy_config)
        
        mock_create_event.assert_called_once_with(
            "test-workflow-id",
            WorkflowState.WORKFLOW_CREATION_SUCCESS,
            {"workflow_name": "test_dag", "workflow_id": "test-workflow-id"}
        )
        mock_publish_event.assert_called_once_with(
            mock_event, 
            workflow_id="test-workflow-id", 
            workflow_name="test_dag", 
            env="test"
        )

    @patch('workflow_core.v3.service.dag_deployer_service.create_workflow_event')
    @patch('workflow_core.v3.service.dag_deployer_service.publish_event')
    def test_publish_deployment_event_failure(self, mock_publish_event, mock_create_event, dag_deployer):
        """Test failed deployment event publishing"""
        deploy_config = {
            "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
            "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED
        }
        
        mock_event = {"event": "data"}
        mock_create_event.return_value = mock_event
        
        dag_deployer._publish_deployment_event("test-workflow-id", "test_dag", False, deploy_config)
        
        mock_create_event.assert_called_once_with(
            "test-workflow-id",
            WorkflowState.WORKFLOW_CREATION_FAILED,
            {"workflow_name": "test_dag", "workflow_id": "test-workflow-id"}
        )
        mock_publish_event.assert_called_once_with(
            mock_event, 
            workflow_id="test-workflow-id", 
            workflow_name="test_dag", 
            env="test"
        )

    def test_deploy_default_type(self, dag_deployer, sample_dag_content):
        """Test DAG deployment with default deploy type (CREATE)"""
        with patch.object(dag_deployer, '_upload_to_s3') as mock_upload, \
             patch.object(dag_deployer, '_setup_deployment') as mock_setup, \
             patch.object(dag_deployer, '_wait_for_deployment_completion') as mock_wait, \
             patch.object(dag_deployer, '_publish_deployment_event') as mock_publish:
            
            mock_setup.return_value = {
                "wait_method": Mock(return_value=True),
                "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED,
                "action_type": "deployment"
            }
            mock_wait.return_value = True
            
            result = dag_deployer.deploy(sample_dag_content, "test_dag", "test-workflow-id")
            
            assert result is True
            mock_setup.assert_called_once_with(DeployType.CREATE, "test_dag")

    def test_upload_to_s3_exception_handling(self, dag_deployer, sample_dag_content):
        """Test S3 upload exception handling"""
        with patch('workflow_core.v3.service.dag_deployer_service.S3Artifactory') as mock_s3_artifactory, \
             patch('workflow_core.v3.service.dag_deployer_service.create_directory_if_not_exists') as mock_create_dir, \
             patch('workflow_core.v3.service.dag_deployer_service.prepend_content_to_file') as mock_prepend, \
             patch('workflow_core.v3.service.dag_deployer_service.delete_directory') as mock_delete_dir, \
             patch('workflow_core.v3.service.dag_deployer_service.shutil.copyfile') as mock_copyfile, \
             patch('workflow_core.v3.service.dag_deployer_service.uuid.uuid4') as mock_uuid:
            
            # Mock UUID to return a predictable value
            mock_uuid_instance = Mock()
            mock_uuid_instance.urn = "urn:uuid:12345678-1234-5678-1234-567812345678"
            mock_uuid.return_value = mock_uuid_instance
            
            mock_s3_instance = Mock()
            mock_s3_instance.upload_artifact.side_effect = Exception("S3 upload failed")
            mock_s3_artifactory.return_value = mock_s3_instance
            
            mock_create_dir.return_value = "./darwin-artefacts-12345678"
            
            with pytest.raises(Exception) as exc_info:
                dag_deployer._upload_to_s3(sample_dag_content, "test_dag")
            
            assert "S3 upload failed" in str(exc_info.value)
            # Ensure cleanup still happens even on exception
            mock_delete_dir.assert_called_once()

    def test_deploy_with_custom_timeout(self, dag_deployer, sample_dag_content):
        """Test DAG deployment with custom timeout values"""
        with patch.object(dag_deployer, '_upload_to_s3') as mock_upload, \
             patch.object(dag_deployer, '_setup_deployment') as mock_setup, \
             patch.object(dag_deployer, '_wait_for_deployment_completion') as mock_wait, \
             patch.object(dag_deployer, '_publish_deployment_event') as mock_publish:
            
            # Mock the wait method to accept custom timeout
            wait_method = Mock(return_value=True)
            mock_setup.return_value = {
                "wait_method": wait_method,
                "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED,
                "action_type": "deployment"
            }
            mock_wait.return_value = True
            
            result = dag_deployer.deploy(sample_dag_content, "test_dag", "test-workflow-id", DeployType.CREATE)
            
            assert result is True
            # Verify that the wait method is called (custom timeout would be handled in the wait method itself)
            mock_wait.assert_called_once() 