# Mock logging configuration to prevent import issues in tests
import asyncio
import sys
from unittest.mock import patch

# Mock the logging configuration before importing any modules
with patch('logging.config.fileConfig'):
    pass

import pytest
from unittest.mock import Mock, patch
from workflow_core.v3.service.airflow_service_v3 import AirflowV3
from workflow_core.constants.constants import ACTIVE, INACTIVE, TIMEOUT


class TestAirflowV3:
    """Test AirflowV3 service"""

    @pytest.fixture
    def airflow_service(self):
        """Create an AirflowV3 instance with mocked dependencies"""
        with patch('workflow_core.v3.service.airflow_service_v3.AirflowApi') as mock_airflow_api, \
             patch('workflow_core.v3.service.airflow_service_v3.Config') as mock_config:
            
            mock_config_instance = Mock()
            mock_config_instance.get_airflow_url = "http://airflow:8080"
            mock_config.return_value = mock_config_instance
            
            service = AirflowV3(env="test")
            service.airflow = mock_airflow_api.return_value
            service._config = mock_config_instance
            return service

    def test_is_dag_updated_since_timestamp_updated(self, airflow_service):
        """Test DAG update check when DAG is updated"""
        mock_dag = {"last_parsed_time": "2024-01-02T10:00:00Z"}
        airflow_service.airflow.get_dag.return_value = mock_dag
        
        result = airflow_service.is_dag_updated_since_timestamp("test_dag", "2024-01-01T10:00:00Z")
        
        assert result is True
        airflow_service.airflow.get_dag.assert_called_once_with("test_dag")

    def test_is_dag_updated_since_timestamp_not_updated(self, airflow_service):
        """Test DAG update check when DAG is not updated"""
        mock_dag = {"last_parsed_time": "2024-01-01T10:00:00Z"}
        airflow_service.airflow.get_dag.return_value = mock_dag
        
        result = airflow_service.is_dag_updated_since_timestamp("test_dag", "2024-01-02T10:00:00Z")
        
        assert result is False

    def test_is_dag_updated_since_timestamp_no_last_parsed_time(self, airflow_service):
        """Test DAG update check when no last_parsed_time exists"""
        mock_dag = {}
        airflow_service.airflow.get_dag.return_value = mock_dag
        
        result = airflow_service.is_dag_updated_since_timestamp("test_dag", "2024-01-01T10:00:00Z")
        
        assert result is False

    def test_is_dag_updated_since_timestamp_exception(self, airflow_service):
        """Test DAG update check with exception"""
        airflow_service.airflow.get_dag.side_effect = Exception("Airflow error")
        
        result = airflow_service.is_dag_updated_since_timestamp("test_dag", "2024-01-01T10:00:00Z")
        
        assert result is False

    @pytest.mark.asyncio
    async def test_activate_dag_success_active(self, airflow_service):
        """Test successful DAG activation to active state"""
        mock_response = {"is_paused": False}
        airflow_service.airflow.resume_a_dag.return_value = mock_response
        
        result = await airflow_service.activate_dag("test_workflow")
        
        assert isinstance(result, dict)
        assert result == mock_response
        assert result["is_paused"] is False
        airflow_service.airflow.resume_a_dag.assert_called_once_with("test_workflow")

    @pytest.mark.asyncio
    async def test_activate_dag_success_inactive(self, airflow_service):
        """Test successful DAG activation to inactive state"""
        mock_response = {"is_paused": True}
        airflow_service.airflow.resume_a_dag.return_value = mock_response
        
        result = await airflow_service.activate_dag("test_workflow")
        
        assert isinstance(result, dict)
        assert result == mock_response
        assert result["is_paused"] is True
        airflow_service.airflow.resume_a_dag.assert_called_once_with("test_workflow")

    def test_get_dag_from_airflow_success(self, airflow_service):
        """Test successful DAG retrieval from Airflow"""
        mock_dag = {"dag_id": "test_dag", "is_paused": False}
        airflow_service.airflow.get_dag.return_value = mock_dag
        
        result = airflow_service.get_dag_from_airflow("test_dag")
        
        assert result == mock_dag
        airflow_service.airflow.get_dag.assert_called_once_with(dag_id="test_dag")

    @patch('workflow_core.v3.service.airflow_service_v3.requests.get')
    def test_is_valid_dag_id_success(self, mock_requests_get, airflow_service):
        """Test successful DAG ID validation"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_requests_get.return_value = mock_response
        
        result = airflow_service.is_valid_dag_id("test_dag")
        
        assert result is True
        mock_requests_get.assert_called_once_with(
            "http://airflow:8080/api/v1/dags/test_dag",
            headers={'Authorization': 'None'}
        )

    @patch('workflow_core.v3.service.airflow_service_v3.requests.get')
    def test_is_valid_dag_id_not_found(self, mock_requests_get, airflow_service):
        """Test DAG ID validation when DAG not found"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_requests_get.return_value = mock_response
        
        result = airflow_service.is_valid_dag_id("invalid_dag")
        
        assert result is False

    @patch('workflow_core.v3.service.airflow_service_v3.requests.get')
    def test_is_valid_dag_id_exception(self, mock_requests_get, airflow_service):
        """Test DAG ID validation with exception"""
        mock_requests_get.side_effect = Exception("Network error")
        
        result = airflow_service.is_valid_dag_id("test_dag")
        
        assert result is False

    @patch('workflow_core.v3.service.airflow_service_v3.time.sleep')
    def test_wait_for_deployment_success(self, mock_sleep, airflow_service):
        """Test successful deployment waiting"""
        check_function = Mock()
        check_function.return_value = True
        
        result = asyncio.run(airflow_service.wait_for_deployment("test_dag", check_function, timeout=10, interval=2))
        
        assert result is True
        check_function.assert_called_once_with("test_dag")
        mock_sleep.assert_not_called()  # Should not sleep if successful on first try

    @patch('workflow_core.v3.service.airflow_service_v3.asyncio.sleep')
    def test_wait_for_deployment_timeout(self, mock_sleep, airflow_service):
        """Test deployment waiting with timeout"""
        check_function = Mock()
        check_function.return_value = False
        
        result = asyncio.run(airflow_service.wait_for_deployment("test_dag", check_function, timeout=5, interval=2))
        
        assert result is False
        # Should call check_function multiple times and sleep between attempts
        assert check_function.call_count >= 2
        assert mock_sleep.call_count >= 1

    @patch('workflow_core.v3.service.airflow_service_v3.time.sleep')
    def test_wait_for_deployment_exception(self, mock_sleep, airflow_service):
        """Test deployment waiting with exception in check function"""
        check_function = Mock()
        check_function.side_effect = Exception("Check function error")
        
        result = asyncio.run(airflow_service.wait_for_deployment("test_dag", check_function, timeout=5, interval=2))
        
        assert result is False
        check_function.assert_called()

    def test_wait_for_create_success(self, airflow_service):
        """Test waiting for DAG creation success"""
        with patch.object(airflow_service, 'wait_for_deployment') as mock_wait:
            mock_wait.return_value = True
            
            result = asyncio.run(airflow_service.wait_for_create_success("test_dag", timeout=30, interval=5))
            
            assert result is True
            mock_wait.assert_called_once_with("test_dag", airflow_service.is_valid_dag_id, 30, 5)

    def test_wait_for_update_success(self, airflow_service):
        """Test waiting for DAG update success"""
        with patch.object(airflow_service, 'wait_for_deployment') as mock_wait:
            mock_wait.return_value = True
            
            result = asyncio.run(airflow_service.wait_for_update_success("test_dag", "2024-01-01T10:00:00Z", timeout=30, interval=5))
            
            assert result is True
            mock_wait.assert_called_once_with(
                "test_dag", 
                airflow_service.is_dag_updated_since_timestamp, 
                30, 
                5, 
                pre_last_parsed_time="2024-01-01T10:00:00Z"
            )

    def test_stop_run_success(self, airflow_service):
        """Test successful run stop"""
        airflow_service.airflow.stop_a_run.return_value = {"status": "stopped"}
        
        result = airflow_service.stop_run("test_workflow", "test_run_id")
        
        assert result == {"status": "stopped"}
        airflow_service.airflow.stop_a_run.assert_called_once_with("test_workflow", "test_run_id")

    def test_run_now_success(self, airflow_service):
        """Test successful run now execution"""
        parameters = {"param1": "value1"}
        airflow_service.airflow.run_now.return_value = {"run_id": "new_run_id"}
        
        result = airflow_service.run_now("test_workflow", parameters)
        
        assert result == {"run_id": "new_run_id"}
        airflow_service.airflow.run_now.assert_called_once_with("test_workflow", parameters)

    def test_airflow_service_initialization(self):
        """Test AirflowV3 initialization"""
        with patch('workflow_core.v3.service.airflow_service_v3.AirflowApi') as mock_airflow_api, \
             patch('workflow_core.v3.service.airflow_service_v3.Config') as mock_config:
            
            mock_config_instance = Mock()
            mock_config_instance.get_airflow_url = "http://airflow:8080"
            mock_config.return_value = mock_config_instance
            
            service = AirflowV3(env="test")
            
            assert service.airflow is not None
            assert service._config == mock_config_instance

    def test_default_timeout_constant(self, airflow_service):
        """Test that TIMEOUT constant is used as default"""
        with patch.object(airflow_service, 'wait_for_deployment') as mock_wait:
            mock_wait.return_value = True
            
            asyncio.run(airflow_service.wait_for_create_success("test_dag"))
            
            # Should use TIMEOUT constant as default timeout
            mock_wait.assert_called_once_with("test_dag", airflow_service.is_valid_dag_id, TIMEOUT, 5)

    def test_custom_timeout_and_interval(self, airflow_service):
        """Test custom timeout and interval values"""
        with patch.object(airflow_service, 'wait_for_deployment') as mock_wait:
            mock_wait.return_value = True
            
            asyncio.run(airflow_service.wait_for_create_success("test_dag", timeout=60, interval=10))
            
            mock_wait.assert_called_once_with("test_dag", airflow_service.is_valid_dag_id, 60, 10) 