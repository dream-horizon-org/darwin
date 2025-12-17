from workflow_core.utils.logging_util import get_logger
from datetime import datetime, timezone, timedelta
from typing import Dict, List

import httpx
import requests
import aiohttp
import asyncio

from workflow_core.constants.configs import Config
from workflow_core.constants.constants import AIRFLOW_ENDPOINT, AUTH_TOKEN, STOP_RUN, RESUME_RUN, PAUSE_RUN, STRING
from workflow_core.error.errors import RunNotFoundException, TaskNotFoundException

LOGGER = get_logger(__name__)

class AirflowApi:
    def __init__(self, env: str):
        self._config = Config(env)
        self.airflow_url = self._config.get_airflow_url
        self.temp_auth = self._config.get_airflow_auth
        self.commuter_url = self._config.get_commuter_url

    def get_dags(self):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags"
        resp = requests.request(method='GET', url=url, headers={'Authorization': AUTH_TOKEN}, timeout=10)
        if resp.status_code == 200:
            return resp.json()

    async def get_dag_async(self, dag_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id
        timeout = httpx.Timeout(10.0)
        async with httpx.AsyncClient() as client:
            headers = {'Authorization': self.temp_auth}
            response = await client.get(url, headers=headers, timeout=timeout)
            if response.status_code == 200:
                return response.json()

    def get_dag(self, dag_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id
        try:
            resp = requests.request(method='GET', url=url, headers={'Authorization': AUTH_TOKEN}, timeout=5)
            if resp.status_code == 200:
                return resp.json()
            elif resp.status_code >= 400 and resp.status_code < 500:
                LOGGER.error("Dag not found in airflow: " + dag_id)
                return resp.json()
            else:
                LOGGER.warning(f"Error in fetching dag with id: {dag_id}, status: {resp.status_code}")
                return {}
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.RequestException) as e:
            LOGGER.warning(f"Airflow not available, returning empty response for dag: {dag_id}. Error: {str(e)}")
            return {}
        except Exception as e:
            LOGGER.warning(f"Unexpected error fetching dag {dag_id}: {str(e)}")
            return {}



    def get_latest_dag_runs(self, dag_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns"
        params = {'order_by': '-execution_date'}
        resp = requests.request(method='GET', url=url, params=params,
                                headers={'Authorization': AUTH_TOKEN}, timeout=10)
        if resp.status_code == 200:
            return resp.json()

    async def get_latest_dag_runs_async(self, dag_id: str, limit: int = 100):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns"
        params = {'order_by': '-execution_date', 'limit': limit}
        timeout = httpx.Timeout(10.0)
        try:
            async with httpx.AsyncClient() as client:
                headers = {'Authorization': self.temp_auth}
                response = await client.get(url, params=params, headers=headers, timeout=timeout)
                if response.status_code == 200:
                    return response.json()
                else:
                    # Return empty dag_runs list if API call fails
                    return {"dag_runs": [], "total_entries": 0}
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error getting DAG runs for {dag_id}: {e}")
            # Return empty dag_runs list on timeout or error
            return {"dag_runs": [], "total_entries": 0}

    def get_latest_dag_runs_by_days(self, dag_id: str, limit: int, offset: int, state: str = None,
                                    days_past: int = None, start_date: str = None, end_date: str = None):
        import logging
        logger = logging.getLogger(__name__)
        
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns"
        params = {'order_by': '-execution_date'}
        params['limit'] = limit
        params['offset'] = offset
        if state:
            params['state'] = state
        if days_past:
            time_minus_30_days_formatted = (datetime.now(timezone.utc) - timedelta(days=30)).strftime(
                "%Y-%m-%dT%H:%M:%S")
            params['execution_date_gte'] = time_minus_30_days_formatted + "z"
        if start_date:
            params['execution_date_gte'] = start_date
        if end_date:
            params['execution_date_lte'] = end_date
        
        logger.info(f"[DEBUG Airflow API] dag_id={dag_id}, params={params}")

        try:
            resp = requests.request(method='GET', url=url, params=params,
                                    headers={'Authorization': AUTH_TOKEN}, timeout=10)
            logger.info(f"[DEBUG Airflow API] status_code={resp.status_code}, response_length={len(resp.text)}")
            if resp.status_code == 200:
                response_json = resp.json()
                logger.info(f"[DEBUG Airflow API] dag_runs count={len(response_json.get('dag_runs', []))}")
                return response_json
            else:
                # Return empty dag_runs list if API call fails
                logger.warning(f"Airflow API returned {resp.status_code} for DAG {dag_id}, response: {resp.text[:500]}")
                return {"dag_runs": [], "total_entries": 0}
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error getting DAG runs for {dag_id}: {e}")
            # Return empty dag_runs list on timeout or error
            return {"dag_runs": [], "total_entries": 0}

    async def get_a_dag_run(self, dag_id: str, run_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns/" + run_id
        resp = requests.request(method='GET', url=url, headers={'Authorization': AUTH_TOKEN}, timeout=10)
        if not 200 <= resp.status_code < 300:
            raise RunNotFoundException(f"Run with ID '{run_id}' not found.")
        return resp.json()

    def get_tasks(self, dag_id: str, run_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns/" + run_id + "/taskInstances?limit=1000"
        resp = requests.request(method='GET', url=url, headers={'Authorization': AUTH_TOKEN}, timeout=10)
        return resp.json()

    async def get_task(self, dag_id: str, run_id: str, task_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns/" + run_id + "/taskInstances/" + task_id
        resp = requests.request(method='GET', url=url, headers={'Authorization': AUTH_TOKEN}, timeout=10)
        if not 200 <= resp.status_code < 300:
            raise TaskNotFoundException(f"Task with ID '{task_id}' not found.")
        return resp.json()

    def pause_a_dag(self, dag_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id
        resp = requests.request(method='PATCH', url=url, headers={'Authorization': AUTH_TOKEN}, json=PAUSE_RUN, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            raise Exception

    def resume_a_dag(self, dag_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id
        resp = requests.request(method='PATCH', url=url, headers={'Authorization': AUTH_TOKEN}, json=RESUME_RUN, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            raise Exception("Error in resuming dag with id: " + dag_id)

    def stop_a_run(self, dag_id: str, run_id: str):
        url = f"{self.airflow_url}{AIRFLOW_ENDPOINT}/dags/{dag_id}/dagRuns/{run_id}"
        headers = {'Authorization': AUTH_TOKEN}
        resp = requests.request(method='PATCH', url=url, headers=headers, json=STOP_RUN, timeout=10)

        if resp.status_code == 200:
            return resp.json()
        else:
            raise RunNotFoundException(f"Run with ID '{run_id}' not found.")

    def run_now(self, dag_id: str, parameters: dict = None):
        """
        Triggers a DAG run in Airflow with optional parameters.

        :param dag_id: ID of the DAG to trigger.
        :param parameters: Dictionary of parameters to pass to the DAG run.
        :return: JSON response from the Airflow API if successful.
        :raises Exception: If the API call fails.
        """
        endpoint = f"{self.airflow_url}/api/v1/dags/{dag_id}/dagRuns"
        headers = {'Authorization': AUTH_TOKEN}
        payload = {"conf": parameters} if parameters else {}

        response = requests.post(url=endpoint, headers=headers, json=payload, timeout=30)

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to trigger DAG. Status code: {response.status_code}, Response: {response.text}")

    def get_task_output_log(self, dag_id: str, run_id: str, task_id: str, try_number: int = 1):
        if try_number < 1:
            try_number = 1
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id + "/dagRuns/" + run_id + "/taskInstances/" + \
              task_id + "/logs/" + str(try_number)
        resp = requests.request(method='GET', url=url, headers={'Authorization': AUTH_TOKEN}, json={}, timeout=30)
        if resp.status_code == 200:
            return resp.text, STRING
        else:
            raise Exception

    async def get_task_output_log_async(self, dag_id: str, run_id: str, task_id: str, try_number: int = 1):
        headers = {'Authorization': AUTH_TOKEN}
        try:
            if try_number < 1:
                try_number = 1
            timeout = httpx.Timeout(10.0)
            url = (f"{self.airflow_url}{AIRFLOW_ENDPOINT}/dags/{dag_id}/dagRuns/{run_id}/taskInstances/{task_id}/logs/"
                   f"{try_number}")
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, timeout=timeout)
                response.raise_for_status()
                return try_number, response.text
        except Exception as e:
            LOGGER.exception("Error in getting task output log: " + str(e))
            return ""

    def delete_dag(self, dag_id: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/dags/" + dag_id
        resp = requests.request(method='DELETE', url=url, headers={'Authorization': AUTH_TOKEN}, timeout=10)
        if resp.status_code == 204:  # No content
            return "No content returned by the server."
        elif not 200 <= resp.status_code < 300:
            raise Exception(f"Error in deleting dag with id: {dag_id}")

        return None

    def create_variable(self, key: str, value: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/variables"
        headers = {'Authorization': AUTH_TOKEN}
        payload = {"key": key, "value": value}
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            raise Exception(f"Error in creating variable with key: {key}")

    def get_variable(self, key: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/variables/" + key
        headers = {'Authorization': AUTH_TOKEN}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            LOGGER.error(f"Error in fetching variable with key: {key}")
            return None

    def update_variable(self, key: str, value: str):
        url = self.airflow_url + AIRFLOW_ENDPOINT + "/variables/" + key
        headers = {'Authorization': AUTH_TOKEN}
        payload = {"key": key, "value": value}
        resp = requests.patch(url, headers=headers, json=payload, timeout=10)
        if resp.status_code == 200:
            return resp.json()
        else:
            raise Exception(f"Error in updating variable with key: {key}")

    async def repair_dag_run(self, run_id: str, dag_id: str, selected_tasks: List[str]) -> Dict:
        """
        Repairs a DAG run in Airflow by rerunning specified tasks.
        :param run_id: The run ID of the DAG run to repair.
        :param dag_id: The ID of the DAG.
        :param selected_tasks: List of task IDs that need to be rerun.
        :return: JSON response from the Airflow API.
        :raises Exception: If the API call fails.
        """
        url = f"{self.airflow_url}/api/v1/dags/{dag_id}/clearTaskInstances"
        headers = {'Authorization': AUTH_TOKEN}
        payload = {
            "dry_run": False,
            "task_ids": selected_tasks,
            "dag_run_id": run_id,
            "reset_dag_runs": True,
            "only_failed": False,
            "include_downstream": True
        }
        try:
            run_resp = await self.get_a_dag_run(dag_id, run_id)
            start_date = datetime.fromisoformat(run_resp['start_date'])
            end_date = datetime.fromisoformat(run_resp['end_date'])
            duration = abs((end_date - start_date).total_seconds())
            for task_id in selected_tasks:
                await self.get_task(dag_id, run_id, task_id)
            try:
                key1 = f"repair_run_{dag_id}_{run_id}"
                value = ",".join(selected_tasks)
                self.create_variable(key1, value)

                key2 = f"run_duration_{dag_id}_{run_id}"
                variable = self.get_variable(key2)

                if variable is not None:
                    current_duration = float(variable['value']) if variable['value'] else 0.0
                    self.update_variable(key2, str(current_duration + duration))
                else:
                    self.create_variable(key2, str(duration))
            except Exception as e:
                raise Exception(f"Failed to store selected tasks for repair run {run_id} for DAG {dag_id}: {e}")

            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to repair run {run_id} for DAG {dag_id}: {e}")

    def clear_tasks(self, dag_id: str, run_id: str, task_ids: List[str]):
        """
        Clears a list of task instances for a given DAG run.
        """
        url = f"{self.airflow_url}/api/v1/dags/{dag_id}/clearTaskInstances"
        headers = {'Authorization': AUTH_TOKEN}
        payload = {
            "dry_run": False,
            "task_ids": task_ids,
            "dag_run_id": run_id,
            "reset_dag_runs": False,
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        if resp.status_code == 200:
            LOGGER.info(f"Successfully cleared tasks: {task_ids}")
            return resp.json()
        else:
            LOGGER.error(f"Error clearing tasks {task_ids}: {resp.text}")
            return None