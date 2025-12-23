import json
import logging
import time
from enum import Enum

import requests

from workflow_core.constants.configs import Config
from workflow_core.constants.constants import ENV_TYPE
from workflow_core.entity.cluster_entities import ClusterData
from workflow_core.error.errors import ClusterCreationFailed
from workflow_core.utils.logging_util import LoggingUtil

LOGGER = LoggingUtil().get_logger()


class ClusterStatus(str, Enum):
    """An enumeration for describing the status of a cluster."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    CREATING = "creating"

    def __str__(self) -> str:
        return f"{self.value}"

    def created(self) -> bool:
        return self.value in {"active"}


class ClusterUtils:
    """
    Utility class to interact with compute service via direct HTTP API calls.
    This replaces compute_sdk to avoid dependencies and use compute service endpoints directly.

    Usage:
        from workflow_core.utils.cluster_utils import ClusterUtils

        sdk = ClusterUtils("prod")
    """

    def __init__(self, env: ENV_TYPE, email: str = None):
        """
        :param env: String representing the environment or domain.
                    Valid values for env are ["prod", "stag", "test", "local"]
        :param email: User email (optional, used for headers)
        """
        self.env = env
        self.email = email or "sdk"
        self._config = Config(env)
        self.AIRFLOW_URL = self._config.get_airflow_url
        self.compute_url = self._config.get_compute_app_layer
        self.compute_base_url = self._config.get_compute_url
        
    def _get_headers(self):
        """Get headers for compute service requests"""
        return {
            "Content-Type": "application/json",
            "msd-user": json.dumps({"email": self.email})
        }
    
    def _request(self, method: str, endpoint: str, data: dict = None, params: dict = None):
        """Make HTTP request to compute service"""
        url = f"{self.compute_base_url}{endpoint}"
        headers = self._get_headers()
        try:
            if method.upper() == "GET":
                response = requests.request(method, url, headers=headers, params=params, timeout=60)
            else:
                response = requests.request(method, url, headers=headers, json=data, timeout=60)
            
            if not 200 <= response.status_code < 300:
                error_msg = response.text
                try:
                    error_json = response.json()
                    if error_json.get('status') == 'ERROR':
                        error_msg = error_json.get('message', error_json.get('data', error_msg))
                except:
                    pass
                raise Exception(f"Compute service error: {error_msg}")
            
            return response.json()
        except requests.exceptions.RequestException as e:
            LOGGER.error(f"Error calling compute service {method} {url}: {str(e)}")
            raise

    def get_cluster_details(self, cluster_id: str):
        """
        Get cluster details from compute service
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :return: Returns the status of the request and cluster_id
        """
        resp = self._request("GET", f"/cluster/{cluster_id}")
        return resp

    def get_cluster_status(self, cluster_id: str):
        """Get cluster status"""
        resp = self._request("GET", f"/cluster/{cluster_id}")
        return resp['data']['status']

    def get_num_nodes(self, cluster_id: str):
        """Get total number of nodes in cluster"""
        resp = self._request("GET", f"/cluster/{cluster_id}")
        total_nodes = 0
        logging.debug(f'get_num_nodes response {cluster_id}: {resp}')
        worker_groups = resp['data'].get('worker_node_configs', [])
        for group in worker_groups:
            total_nodes += group.get('min_pods', 0)

        return total_nodes + 1

    def create_cluster_with_yaml(self, yaml_path: str):
        """Create cluster from YAML file"""
        import yaml
        with open(yaml_path, 'r') as f:
            cluster_data = yaml.safe_load(f)
        
        # Extract cluster definition from YAML
        cluster_definition = cluster_data.get('cluster', cluster_data)
        
        resp = self._request("POST", "/cluster", data=cluster_definition)
        cluster_id = resp['data']['cluster_id']
        return cluster_id

    def get_pods_status(self, url: str):
        """

        :param url : url
        :return: Return the status of pods
        """
        response = requests.get(url=url)
        logging.debug(f'get_pods_status response {url}: {response}')
        return response.json()['data']['Resources']

    def get_resource_status_count(self, status, resources):
        """

        :param status:
        :param resources:
        :return:
        """
        count = 0
        for resource in resources:
            if resource['Status'] == status:
                count += 1
        return count

    def restart_cluster(self, cluster_id: str):
        """
        Restart a cluster
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :return: Returns the status of the request and cluster_id
        """
        resp = self._request("POST", f"/cluster/restart-cluster/{cluster_id}")
        return resp

    def start_cluster(self, cluster_id: str):
        """
        Start a cluster
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :return: Returns the status of the request and cluster_id
        """
        resp = self._request("POST", f"/cluster/start-cluster/{cluster_id}")
        return resp

    def stop_cluster(self, cluster_id: str):
        """
        Stop a cluster
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :return: Returns the status of the request and cluster_id
        """
        resp = self._request("POST", f"/cluster/stop-cluster/{cluster_id}")
        return resp

    def get_ray_dashboard_url(self, cluster_id: str):
        """
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :return: Returns the ray dashboard url
        """
        # Add retry logic
        internal_dashboards_url = f"{self.compute_base_url}/cluster/{cluster_id}/dashboards?internal=True"
        retries = 0
        while retries < 3:
            try:
                headers = self._get_headers()
                response = requests.request("GET", internal_dashboards_url, headers=headers, timeout=60)
                if response.status_code == 200:
                    response_json = response.json()
                    ray_dashboard_url = response_json["data"]["ray_dashboard_url"]
                    return ray_dashboard_url[:-1] if ray_dashboard_url.endswith('/') else ray_dashboard_url
                else:
                    raise Exception(f"Failed to get dashboard URL: {response.status_code}")
            except Exception as e:
                LOGGER.error(f"Error in getting ray dashboard url. Retrying. Error: {str(e)}")
                retries += 1
                if retries < 3:
                    time.sleep(5)
                else:
                    raise

    def start_cluster_and_wait(self, cluster_id: str, num_pods_active: int = 1,
                               time_out_in_sec_for_cluster: int = 3600):
        """

        :param num_pods_active: Number of pods which should be active
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :param time_out_in_sec_for_cluster: Maximum time for which you can wait for cluster to come up
        :return: Returns the status of the request and cluster_id along with jupyter and dashboard links
        """
        ray_dashboard_url = ""
        start = time.time()
        status = self.get_cluster_status(cluster_id)

        if status == ClusterStatus.ACTIVE:
            ray_dashboard_url = self.get_ray_dashboard_url(cluster_id)
            LOGGER.info(f"Cluster {cluster_id} is already up. Ray dashboard URL: {ray_dashboard_url}")
            return ClusterStatus.ACTIVE, ray_dashboard_url

        if status == ClusterStatus.INACTIVE:
            LOGGER.info(f"Cluster {cluster_id} is inactive. starting the cluster")
            start_response = self.start_cluster(cluster_id)
            LOGGER.info(start_response)
            if start_response['status'] == 'ERROR':
                msg = start_response['data']
                LOGGER.info(
                    f'Failed to restart the cluster for id {cluster_id}. Error message is {msg}', )
                return status, msg

        while time.time() - start <= time_out_in_sec_for_cluster:
            cm_status = self.get_cluster_status(cluster_id)
            LOGGER.info(f'Current Cluster Status is {cm_status}')
            if cm_status == ClusterStatus.ACTIVE:
                status = ClusterStatus.ACTIVE
                LOGGER.info(f'Current Cluster Status is {status}')
                ray_dashboard_url = self.get_ray_dashboard_url(cluster_id)
                break
            elif cm_status == ClusterStatus.INACTIVE:
                raise Exception("Cluster Creation Failed")
            else:
                time.sleep(10)

        if not status.created():
            LOGGER.info(
                f'Spent {time_out_in_sec_for_cluster} in waiting but the the cluster is still not up')
            LOGGER.info(f'Aborting the run')
            stop_response = self.stop_cluster(cluster_id)
            if stop_response['status'] == 'ERROR':
                msg = stop_response['data']
                LOGGER.info(
                    f'Failed to stop the cluster for id {cluster_id}. Error message is {msg}', )
                return status, msg
            raise Exception("Cluster Creation Timed Out")
        LOGGER.info(
            f'Total time taken for the cluster to come up is {time.time() - start} sec')
        return status, ray_dashboard_url

    def shutdown_cluster(self, cluster_id: str, wait_time_for_shutdown_in_sec):
        """
        Shutdown a cluster after waiting
        :param cluster_id: Cluster identification of the cluster which needs to be shut down
        :param wait_time_for_shutdown_in_sec: Wait time required to shut down cluster
        :return: Returns the status of the request and cluster_id
        """
        try:
            start = time.time()
            while time.time() - start <= wait_time_for_shutdown_in_sec:
                time.sleep(12)
                LOGGER.info(
                    f'Will be shutting down cluster in {wait_time_for_shutdown_in_sec - (time.time() - start)} sec')
            LOGGER.info(f'Shutting down cluster {cluster_id}')
            return self.stop_cluster(cluster_id)
        except Exception as e:
            raise e

    def delete_cluster(self, cluster_id: str):
        """
        Delete a cluster
        :param cluster_id: Cluster identification of the cluster which needs to be deleted
        :return: Returns the status of the request and cluster_id
        """
        resp = self._request("DELETE", f"/cluster/{cluster_id}")
        return resp

    def create_cluster_from_job_definition(self, job_cluster_definition_id: str, user_email: str, try_number: int = 1):
        """
        :param job_cluster_definition_id: Job cluster definition id
        :param user_email: User email
        :param try_number: Retry number
        :return: Returns the cluster id
        """
        if not user_email:
            user_email = "sdk"
        app_layer_url = self._config.get_app_layer
        Workflow_URL = app_layer_url
        url = f"{Workflow_URL}/job-cluster-definitions/{job_cluster_definition_id}"
        LOGGER.info("Creating job cluster from definition")
        response = requests.request("GET", url)
        if not 200 <= response.status_code < 300:
            raise Exception(f"Error in fetching job cluster definition. Error is {response.text}")
        job_cluster_definition = response.json()['data']
        job_cluster_definition['is_job_cluster'] = True
        job_cluster_definition['user'] = user_email
        job_cluster_definition['advance_config']['environment_variables'] = \
            job_cluster_definition['advance_config']['environment_variables'] + f"\nWORKFLOW_RETRY_NUMBER={try_number}\n"
        
        # Use compute service endpoint to create cluster
        compute_resp = self._request("POST", "/cluster", data=job_cluster_definition)
        if compute_resp.get('status') == 'ERROR':
            raise ClusterCreationFailed(f"Error in creating job cluster. Error is {compute_resp.get('data', compute_resp.get('message', 'Unknown error'))}")
        cluster_id = compute_resp['data']['cluster_id']

        return cluster_id

    def create_cluster_from_job_definition_v2(self, job_cluster_definition_id: str, user_email: str):
        """
        :param job_cluster_definition_id: Job cluster definition id
        :param user_email: User email
        :return: Returns the cluster id
        """
        if not user_email:
            user_email = "sdk"
        app_layer_url = self._config.get_app_layer
        Workflow_URL = app_layer_url
        url = f"{Workflow_URL}/job-cluster-definitions/{job_cluster_definition_id}"
        LOGGER.info("Creating job cluster from definition")
        response = requests.request("GET", url)
        if not 200 <= response.status_code < 300:
            raise Exception(f"Error in fetching job cluster definition. Error is {response.text}")
        job_cluster_definition = response.json()['data']
        job_cluster_definition['inactive_time'] = -1
        job_cluster_definition['auto_termination_policies'] = []
        job_cluster_definition['user'] = user_email
        
        # Use compute service endpoint to create cluster
        compute_resp = self._request("POST", "/cluster", data=job_cluster_definition)
        if compute_resp.get('status') == 'ERROR':
            raise ClusterCreationFailed(f"Error in creating job cluster. Error is {compute_resp.get('data', compute_resp.get('message', 'Unknown error'))}")
        cluster_id = compute_resp['data']['cluster_id']
        return cluster_id

    def get_job_cluster_definition(self, job_cluster_definition_id: str):
        """
        :param job_cluster_definition_id: Job cluster definition id
        :return: Returns the job cluster definition
        """
        app_layer_url = self._config.get_app_layer
        Workflow_URL = app_layer_url
        url = f"{Workflow_URL}/job-cluster-definitions/{job_cluster_definition_id}"
        LOGGER.info("Fetching job cluster definition")
        response = requests.request("GET", url)
        if not 200 <= response.status_code < 300:
            raise Exception(f"Error in fetching job cluster definition. Error is {response.text}")
        return response.json()

    def get_cluster_definition(self, cluster_id: str, cluster_type: str):
        """
        Gets the cluster definition based on the cluster ID and type.
        """
        if cluster_type == "job":
            cluster_data_dict = self.get_job_cluster_definition(cluster_id)['data']
            if cluster_data_dict['advance_config']['ray_params']:
                cluster_data_dict['advance_config']['ray_start_params'] = cluster_data_dict['advance_config'][
                    'ray_params']
                cluster_data_dict['advance_config']['ray_start_params']['object_store_memory_perc'] = \
                    cluster_data_dict['advance_config']['ray_params']['object_store_memory']
                del cluster_data_dict['advance_config']['ray_params']
                del cluster_data_dict['advance_config']['ray_start_params']['object_store_memory']
        else:
            cluster_data_dict = self.get_cluster_details(cluster_id)['data']
            cluster_data_dict['cluster_name'] = cluster_data_dict['name']
            cluster_data_dict['head_node_config']['cores'] = cluster_data_dict['head_node_config']['head_node_cores']
            cluster_data_dict['head_node_config']['memory'] = cluster_data_dict['head_node_config']['head_node_memory']
            for worker_config in cluster_data_dict.get('worker_node_configs', []):
                worker_config['cores_per_pods'] = worker_config.pop('cores', 0)
                worker_config['memory_per_pods'] = worker_config.pop('memory', 0)

        # Convert the raw data dictionary into a ClusterData instance
        cluster_data = ClusterData(**cluster_data_dict)

        # Use the convert method to get the ClusterDict
        return cluster_data.convert()
