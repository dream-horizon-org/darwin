from __future__ import annotations

import time
from datetime import datetime
from typing import Any, Dict, Sequence
import json

import requests
from airflow.exceptions import AirflowException
from airflow.utils.context import Context
from operators.workflow_operator import WorkflowOperator

from airflow_core.constants.configs import Config
from airflow_core.utils.airflow_job_runner_utils import get_env, api_request

class PelicanOperator(WorkflowOperator):
    '''
    Submit and monitor a Pelican Spark workload.

    :param pelican_gateway_host: Base URL for Pelican Gateway (e.g. http://pelican-gateway.darwin.local)
    :param artifact: Dict describing the artifact (file, className, sparkVersion)
    :param task_name: Name of the task to generate workload name
    :param poll_interval: Seconds to wait between successive status polls
    :param timeout: Maximum time (seconds) to wait for run completion
    :param max_http_retries: Maximum HTTP retries for API calls
    :param max_retries: Maximum retries for the application (passed to API)
    :param compute_cluster_config: Compute cluster configuration for the application (passed to API)
    :param engine_config: Engine configuration for the application (passed to API)
    '''

    template_fields: Sequence[str] = (
        'task_name',
        'artifact',
        'max_retries',
        'compute_cluster_config',
        'engine_config',
    )

    def __init__(
        self,
        *,
        artifact: Dict[str, Any],
        task_name: str,
        poll_interval: int = 15,
        timeout: int = 60 * 60,
        max_http_retries: int = 3,
        max_retries: int = 0,
        compute_cluster_config: Dict[str, Any] | None = None,
        engine_config: Dict[str, Any] | None = None,
        instance_role: str = 'arn:aws:iam::275481790157:instance-profile/databricks-datainfra-pelican-role',
        pelican_gateway_host: str | None = None,
        **kwargs,
    ) -> None:
        super().__init__(**kwargs)
        self.env = get_env()
        self.config = Config(self.env)
        self.pelican_gateway_host = self.config.get_pelican_url.rstrip('/')
        self.artifact = artifact
        self.task_name = task_name
        self.poll_interval = poll_interval
        self.timeout = timeout
        self.max_http_retries = max_http_retries
        self.max_retries = max_retries
        self.compute_cluster_config = compute_cluster_config or {}
        self.engine_config = engine_config or {}
        self.workload_name = f"{task_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self._run_url_sent = False
        self.instance_role = instance_role

    def _retry_request(
        self,
        method: str,
        path: str,
        *,
        json_payload: Dict[str, Any] | None = None,
        timeout: int = 30
    ) -> Dict[str, Any]:
        url = f'{self.pelican_gateway_host}{path}'
        attempt = 0

        while attempt < self.max_http_retries:
            try:
                self.log.info('%s %s', method.upper(), url)
                if json_payload is not None:
                    self.log.info('Payload: %s', json.dumps(json_payload))
                if method.lower() == 'post':
                    response = requests.post(url, json=json_payload, timeout=timeout)
                elif method.lower() == 'get':
                    response = requests.get(url, timeout=timeout)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")

                if response.status_code >= 400:
                    raise AirflowException(f'{method.upper()} {url} failed: {response.status_code} - {response.text}')
                return response.json()

            except Exception as e:
                attempt += 1
                self.log.warning('%s attempt %d failed: %s', method.upper(), attempt, str(e))
                if attempt >= self.max_http_retries:
                    raise AirflowException(f'{method.upper()} {url} failed after {self.max_http_retries} attempts') from e
                time.sleep(5)

    def _post_json(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._retry_request('post', path, json_payload=payload)

    def _get_json(self, path: str) -> Dict[str, Any]:
        return self._retry_request('get', path)

    def _poll_run_status(self, application_id: str, run_id: str, context: Context) -> dict:
        """Poll the Pelican run status until a result_state is present or times out."""
        status_endpoint = f'/api/v1/applications/{application_id}/runs/{run_id}/status'
        start_time = time.monotonic()
        while True:
            status_resp = self._get_json(status_endpoint)
            self.log.info('Poll status API response: %s', json.dumps(status_resp))
            data = status_resp.get('data', {})
            run_page_url = data.get('run_page_url')
            self.log.info('data:- %s', data)
            self.log.info('marking run page url %s', run_page_url)
            if run_page_url and not self._run_url_sent:
                self.log.info('marking run page url %s', run_page_url)
                retry_attempt = context["task_instance"].try_number
                payload = {
                    "workflow_id": self.workflow_id,
                    "run_id": context["run_id"],
                    "task_name": context["task"].task_id,
                    "run_status": "RUNNING",
                    "attempt": retry_attempt,
                    "run_metadata": {
                        "run_url": run_page_url
                    }
                }
                response = api_request("PUT", self.workflow_task_run_update_url, data=payload)
                self.log.info('wf response: %s', json.dumps(response))
                self._run_url_sent = True

            state = data.get('state', {})
            life_cycle_state = state.get('life_cycle_state', '').upper()
            result_state = state.get('result_state', '').upper()
            self.log.info('LifeCycleState=%s; ResultState=%s; elapsed=%ss', life_cycle_state, result_state, int(time.monotonic() - start_time))

            # Stop polling as soon as a result_state is present (not empty)
            if result_state:
                return data

            if time.monotonic() - start_time > self.timeout:
                raise AirflowException('Pelican run timed out after %s seconds' % self.timeout)

            time.sleep(self.poll_interval)

    def execute_main(self, context: Context) -> dict:
        # Step 1: Create application (update payload to match API contract)
        create_payload = {
            'applicationName': self.task_name,  # or use a separate field if needed
            'artifact': self.artifact,
            'maxRetries': self.max_retries,
            'computeClusterConfig': self.compute_cluster_config,
            'engineConfig': self.engine_config,
            'instanceRole': self.instance_role
        }
        create_resp = self._post_json('/api/v1/applications', create_payload)
        self.log.info('Create application API response: %s', json.dumps(create_resp))
        data = create_resp.get('data', {})
        application_id = data.get('applicationId')
        if not application_id:
            raise AirflowException('applicationId missing from create application response')
        self.log.info('Created application %s (id=%s)', self.task_name, application_id)

        # Step 2: Trigger job (update to match API contract)
        trigger_payload = {
            'applicationId': application_id,
        }
        trigger_resp = self._post_json('/api/v1/applications/trigger', trigger_payload)
        self.log.info('Trigger job API response: %s', json.dumps(trigger_resp))
        data = trigger_resp.get('data', {})
        run_id = data.get('runId')
        application_id = data.get('applicationId', application_id)
        if not run_id:
            raise AirflowException('runId missing from trigger job response')
        self.log.info('Execution triggered for application %s (runId=%s)', self.task_name, run_id)

        # Step 3: Poll run status using the new helper
        run_details = self._poll_run_status(application_id, run_id, context)
        self.log.info('Poll status API final response: %s', json.dumps(run_details))

        # Step 4: handle result
        life_cycle_state = run_details.get('state', {}).get('life_cycle_state', '').upper()
        result_state = run_details.get('state', {}).get('result_state', '').upper()
        self.log.info('Run finished with life_cycle_state=%s, result_state=%s', life_cycle_state, result_state)

        if result_state != 'SUCCESS':
            self.status = "FAILED"
            raise AirflowException(f'Pelican run {run_id} finished with result_state "{result_state}"')
        else:
            self.status = "SUCCESS"
            self.log.info('Pelican run %s completed successfully', run_id)

        return run_details
