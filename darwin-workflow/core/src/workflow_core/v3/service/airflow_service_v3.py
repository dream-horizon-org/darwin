import asyncio
from typing import Optional
import time
import requests
from workflow_core.api.airlfow import AirflowApi
from workflow_core.constants.constants import ACTIVE, INACTIVE, TIMEOUT, AUTH_TOKEN
from workflow_core.constants.configs import Config
from workflow_model.darwin_workflow import Workflow
from workflow_model.response import ResumeScheduleWorkflowIdPutResponseData
import logging

LOGGER = logging.getLogger(__name__)


class AirflowV3:
    """V3 implementation of Airflow operations using database instead of Elasticsearch"""
    
    def __init__(self, env: str):
        self.airflow = AirflowApi(env)
        self._config = Config(env)
        
    def is_dag_updated_since_timestamp(self, dag_id: str, pre_last_parsed_time: str) -> bool:
        """
        Check if DAG has been updated since the given last_parsed_time.
        
        :param dag_id: DAG ID to check
        :param pre_last_parsed_time: Previous last_parsed_time to compare against
        :return: True if DAG is updated, False otherwise
        """
        try:
            dag = self.airflow.get_dag(dag_id)
            current_last_parsed_time = dag.get('last_parsed_time')
            if not current_last_parsed_time:
                return False
            
            # Compare the last_parsed_time strings directly
            return current_last_parsed_time > pre_last_parsed_time
        except Exception as e:
            LOGGER.error(f"Error checking DAG update: {e}")
            return False

    async def activate_dag(self, workflow_name: str) :
        """
        Activate or deactivate a DAG in Airflow and return the pause state.
        Args:
            workflow_name: Name of the workflow/DAG
            status: Target status (ACTIVE or INACTIVE)
        Returns:
            Response object with workflow name and status
        """
        # Call Airflow API to resume/unpause the DAG
        resp = self.airflow.resume_a_dag(workflow_name)

        return resp

    def get_dag_from_airflow(self, dag_id: str):
        return self.airflow.get_dag(dag_id=dag_id)

    def is_valid_dag_id(self, dag_id: str) -> bool:
        """
        Check if the DAG with the specified dag_id already exists in Airflow.
        
        :param dag_id: DAG ID to check
        :return: True if DAG exists, False otherwise
        """
        AIRFLOW_URL = self._config.get_airflow_url
        airflow_api_url = f"{AIRFLOW_URL}/api/v1/dags/{dag_id}"
        
        try:
            response = requests.get(airflow_api_url, headers={'Authorization': AUTH_TOKEN})
            LOGGER.debug(f"Airflow response: {response}")
            return response.status_code == 200
        except Exception as e:
            LOGGER.error(f"Error checking DAG validity: {e}")
            return False

    async def wait_for_deployment(self, dag_id: str, check_function, timeout: int = TIMEOUT, interval: int = 5, **kwargs) -> bool:
        """
        Generic waiting function for deployment verification.
        
        :param dag_id: DAG ID to check
        :param check_function: Function to call for verification
        :param timeout: Maximum time to wait in seconds
        :param interval: Interval between checks in seconds
        :param kwargs: Additional arguments to pass to check_function
        :return: True if successful, False if timed out
        """
        time_waited = 0
        
        while time_waited < timeout:
            try:
                if check_function(dag_id, **kwargs):
                    LOGGER.info(f"DAG '{dag_id}' deployment verification successful")
                    return True
            except Exception as e:
                LOGGER.warning(f"Error during deployment verification: {e}")
            
            await asyncio.sleep(interval)
            time_waited += interval
            LOGGER.debug(f"Waiting for DAG '{dag_id}' deployment... ({time_waited}/{timeout}s)")
        
        LOGGER.error(f"DAG '{dag_id}' deployment verification timed out after {timeout}s")
        return False

    async def wait_for_create_success(self, dag_id: str, timeout: int = TIMEOUT, interval: int = 5) -> bool:
        """
        Wait for DAG creation to be successful.
        
        :param dag_id: DAG ID to check
        :param timeout: Maximum time to wait in seconds
        :param interval: Interval between checks in seconds
        :return: True if successful, False if timed out
        """
        LOGGER.info(f"Waiting for DAG '{dag_id}' creation to complete...")
        return await self.wait_for_deployment(dag_id, self.is_valid_dag_id, timeout, interval)

    async def wait_for_update_success(self, dag_id: str, pre_update_last_parsed_time: str, timeout: int = TIMEOUT, interval: int = 5) -> bool:
        """
        Wait for DAG update to be successful using pre-captured last_parsed_time.
        
        :param dag_id: DAG ID to check
        :param pre_update_last_parsed_time: last_parsed_time captured before the update process began
        :param timeout: Maximum time to wait in seconds
        :param interval: Interval between checks in seconds
        :return: True if successful, False if timed out
        """
        LOGGER.info(f"Waiting for DAG '{dag_id}' update to complete...")
        
        return await self.wait_for_deployment(
            dag_id, 
            self.is_dag_updated_since_timestamp, 
            timeout, 
            interval, 
            pre_last_parsed_time=pre_update_last_parsed_time
        )

    def stop_run(self, workflow_name, run_id):
        return self.airflow.stop_a_run(workflow_name, run_id)

    def run_now(self, workflow_id, parameters):
        return self.airflow.run_now(workflow_id, parameters)
