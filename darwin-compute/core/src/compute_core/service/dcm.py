"""
This module contains the class for Darwin Cluster Manager
"""

import json
import random
import time
import requests
from loguru import logger

from compute_app_layer.models.spark_history_server import SparkHistoryServer
from compute_core.constant.config import Config
from compute_core.constant.constants import (
    CLUSTER_CREATE_URL,
    CLUSTER_START_URL,
    CLUSTER_STOP_URL,
    CLUSTER_RESTART_URL,
    HOST_NAME_DARWIN,
    CLUSTER_STATUS_URL,
    JUPYTER_START_URL,
    JUPYTER_RESTART,
    JUPYTER_DELETE,
    SPARK_HISTORY_SERVER_STOP,
    SPARK_HISTORY_SERVER_START,
)
from compute_core.dao.jupyter_dao import JupyterDao
from compute_core.dto.cluster_resource_dto import ClusterResourceDTO
from compute_core.util.utils import urljoin, get_random_id
from compute_core.util.yaml_generator_v2.yaml_generator_v2 import create_yaml_v2
from compute_core.dto.remote_command_dto import RemoteCommandExecuteDCMDto, RemoteCommandDto
from compute_model.compute_cluster import ComputeClusterDefinition


class DarwinClusterManager:
    """
    Proxy Class for interacting with Cluster Manager
    TODO: Consider adding circuit breaker pattern for DCM API calls to handle failures gracefully
    """

    def __init__(self, env: str = None):
        _config = Config(env)
        self.env = _config.env
        self.client = _config.dcm_url
        # TODO: Environment-specific header logic should be encapsulated in Config class
        self.headers = {"host": HOST_NAME_DARWIN} if self.env in ["prod", "uat"] else {}
        self.jupyter_dao = JupyterDao(env)

    # TODO: Extract HTTP client logic into a reusable utility class with proper retry and circuit breaker patterns
    def _request(
        self,
        method: str,
        url: str,
        data: dict = None,
        files: dict = None,
        is_json: bool = False,
    ):
        if is_json:
            data = json.dumps(data).encode("utf-8")
        # TODO: 600s timeout is very long - consider making it configurable per operation type
        response = requests.request(method, url, headers=self.headers, data=data, files=files, timeout=600)
        if not 200 <= response.status_code < 300:
            # TODO: Logging request body may expose sensitive data - sanitize before logging
            logger.error(f"Error occurred in API {method} - {url} - {response.text}, body - {data}")
            # TODO: Use a custom exception class with structured error information
            raise Exception(f"Error occurred in API {method} - {url} - {response.text}")
        return response.json()

    def _generate_config_file(
        self, compute_definition: ComputeClusterDefinition, remote_commands: list[RemoteCommandDto] = None
    ):
        file, _ = create_yaml_v2(compute_definition, remote_commands, self.env)
        logger.debug(f"Generated Config File for cluster id {compute_definition.cluster_id}: {file.getvalue()}")
        return file

    def healthcheck(self) -> dict:
        """
        Healthcheck for Darwin Cluster Manager
        Returns:
            dict: JSON response from DCM (best-effort). Typically: {"status": "SUCCESS", "message": "OK"}
        """
        url = urljoin(self.client, "/healthcheck")
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        try:
            return resp.json()
        except ValueError:
            return {"status": "UNKNOWN", "message": resp.text}

    def create_cluster(
        self,
        cluster_id: str,
        artifact_name: str,
        compute_request: ComputeClusterDefinition,
    ):
        url = urljoin(self.client, CLUSTER_CREATE_URL)
        params = {"cluster_name": cluster_id, "artifact_name": artifact_name}
        config_file = {"file": self._generate_config_file(compute_request)}
        resp = self._request("POST", url, data=params, files=config_file)
        return resp

    def update_cluster(
        self,
        cluster_id: str,
        artifact_name: str,
        compute_request: ComputeClusterDefinition,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        url = urljoin(self.client, CLUSTER_CREATE_URL)
        params = {"cluster_name": cluster_id, "artifact_name": artifact_name}
        config_file = {"file": self._generate_config_file(compute_request, remote_commands)}
        resp = self._request("PUT", url, data=params, files=config_file)
        return resp

    def start_cluster(self, cluster_id: str, artifact_name: str, namespace: str, kube_cluster: str):
        url = urljoin(self.client, CLUSTER_START_URL)
        params = {
            "cluster_name": cluster_id,
            "artifact_name": artifact_name,
            "namespace": namespace,
            "kube_cluster": kube_cluster,
        }
        resp = self._request("PUT", url, data=params)
        logger.debug(f"Cluster Manager Start Cluster Response: {resp}")
        return resp

    def stop_cluster(self, cluster_id: str, namespace: str, kube_cluster: str):
        url = urljoin(self.client, CLUSTER_STOP_URL)
        params = {
            "cluster_name": cluster_id,
            "namespace": namespace,
            "kube_cluster": kube_cluster,
        }
        resp = self._request("PUT", url, data=params)
        return resp

    def restart_cluster(self, cluster_id: str, artifact_name: str, namespace: str, kube_cluster: str):
        url = urljoin(self.client, CLUSTER_RESTART_URL)
        params = {
            "cluster_name": cluster_id,
            "artifact_name": artifact_name,
            "namespace": namespace,
            "kube_cluster": kube_cluster,
        }
        resp = self._request("PUT", url, data=params)
        return resp

    def cluster_status(self, cluster_id: str, namespace: str, kube_cluster: str) -> list[ClusterResourceDTO]:
        url = urljoin(self.client, CLUSTER_STATUS_URL)
        params = {
            "cluster_name": cluster_id,
            "namespace": namespace,
            "kube_cluster": kube_cluster,
        }
        resp = self._request("PUT", url, data=params)
        if not resp or resp.get("Resources") is None:
            return []
        return [ClusterResourceDTO(**resource) for resource in resp["Resources"]]

    def start_jupyter_client(self, namespace: str, kube_cluster: str, kube_cluster_key: str, consumer_id: str):
        release_name = get_random_id(prefix="id-jup-")
        url = urljoin(self.client, JUPYTER_START_URL)
        # TODO: Hardcoded "0.0.0.0" and fsx-claim range (0-19) should be configurable
        params = {
            "jupyter_path": "0.0.0.0",
            "release_name": release_name,
            "namespace": namespace,
            "kube_config": kube_cluster,
            "kube_cluster_key": kube_cluster_key,
            "fsx_claim": f"fsx-claim-{random.randint(0, 19)}",
        }

        logger.info(f"Starting Jupyter Client with params {params}")
        resp = self._request(method="POST", url=url, data=params, is_json=True)
        resp["release_name"] = release_name

        if resp["Err"] != "" and resp["Err"] is not None:
            # TODO: Returning None on error is ambiguous - consider raising an exception
            logger.exception(f"Error occurred while starting jupyter client {resp['Err']}")
            return
        dao_resp = self.jupyter_dao.insert_pod_details(
            pod_name=release_name, jupyter_link=resp["JupyterLink"], consumer_id=consumer_id
        )

        logger.info("Jupyter dao insert response: %s", dao_resp)
        return resp

    def get_jupyter_client(self, namespace: str, kube_cluster: str, kube_cluster_key: str, consumer_id: str):
        # TODO: Move this logic to dao, instead of here - this method mixes orchestration with data access
        pod = self.jupyter_dao.get_pod_by_consumer_id(consumer_id=consumer_id)

        logger.info(f"Pod details for consumer id {consumer_id} is {pod}")
        if pod is not None:
            logger.info(f"Returning jupyter link {pod['jupyter_link']}")
            return pod["jupyter_link"]
        resp = self.jupyter_dao.get_unattached_pod()
        if resp is not None:
            logger.info(f"Updating pod consumer details for pod {resp['pod_name']} with consumer id {consumer_id}")
            res = self.jupyter_dao.update_pod_consumer_details(pod_name=resp["pod_name"], consumer_id=consumer_id)
            return resp["jupyter_link"]
        else:
            logger.info(f"Starting new jupyter client for consumer id {consumer_id}")
            new_jupyter = self.start_jupyter_client(namespace, kube_cluster, kube_cluster_key, consumer_id)
            return new_jupyter["JupyterLink"]

    def restart_jupyter_client(
        self, jupyter_path: str, release_name: str, namespace: str, kube_cluster: str, kube_cluster_key: str
    ):
        url = urljoin(self.client, JUPYTER_RESTART)
        params = {
            "jupyter_path": jupyter_path,
            "release_name": release_name,
            "namespace": namespace,
            "kube_config": kube_cluster,
            "kube_cluster_key": kube_cluster_key,
            "fsx_claim": f"fsx-claim-{random.randint(0, 19)}",
        }
        resp = self._request(method="PUT", url=url, data=params, is_json=True)
        return resp

    def delete_jupyter_client(self, release_name: str, namespace: str, kube_cluster: str):
        url = urljoin(self.client, JUPYTER_DELETE)
        params = {
            "release_name": release_name,
            "namespace": namespace,
            "kube_config": kube_cluster,
        }
        logger.info(f"Deleting jupyter client with params {params}")
        resp = self._request(method="POST", url=url, data=params, is_json=True)
        logger.info(f"Deleting jupyter client response {resp}")
        return resp

    def start_spark_history_server(self, shs: SparkHistoryServer, kube_cluster: str, namespace: str):
        logger.debug(f"Start Spark History Server DCM Request: {shs}")
        url = urljoin(self.client, SPARK_HISTORY_SERVER_START)
        data = {
            "id": shs.id,
            "resource": shs.resource,
            "filesystem": shs.filesystem.value,
            "events_path": shs.events_path,
            "ttl": shs.ttl,
            "user": shs.user,
            "kube_cluster_key": shs.cloud_env,
            "kube_cluster": kube_cluster,
            "namespace": namespace,
        }
        resp = self._request("POST", url, data=data, is_json=True)
        logger.debug(f"Start Spark History Server for id: {shs.id}: DCM Response: {resp}")
        return resp

    def stop_spark_history_server(self, spark_history_server_id: str, kube_cluster: str, namespace: str):
        logger.debug(f"Stop Spark History Server DCM Request: {spark_history_server_id}")
        url = urljoin(self.client, SPARK_HISTORY_SERVER_STOP)
        data = {
            "id": spark_history_server_id,
            "kube_cluster": kube_cluster,
            "namespace": namespace,
        }
        resp = self._request("POST", url, data=data, is_json=True)
        logger.debug(f"Stop Spark History Server for id: {spark_history_server_id}: DCM Response: {resp}")
        return resp

    def get_spark_history_server_status(self, spark_history_server_id: str):
        logger.debug(f"Get Spark History Server Status DCM Request: {spark_history_server_id}")
        url = urljoin(self.client, "/spark-history-server", spark_history_server_id, "/status")
        resp = self._request("GET", url)
        logger.debug(f"Get Spark History Server Status for id: {spark_history_server_id}: DCM Response: {resp}")
        return resp

    def execute_command_on_cluster(
        self, kube_cluster: str, ns: str, cluster_id: str, request: RemoteCommandDto, pod_type: str
    ):
        logger.debug(f"Executing Command: {request.execution_id} on Cluster: {cluster_id} on {pod_type}")
        url = urljoin(self.client, f"/execute")

        # TODO: Hardcoded label selectors and container names should be constants or configurable
        label_selector = f"rayCluster={cluster_id}-kuberay, ray.io/node-type={pod_type}"
        container_name = f"ray-{pod_type}"
        # TODO: Shell command construction is vulnerable to injection - sanitize request.command
        command = f"nohup /tmp/remote-command/run-remote-command.sh {request.execution_id} '{request.command}' {request.timeout} >> logs/remote-command.log 2>&1 &"
        dcm_request = RemoteCommandExecuteDCMDto(
            kube_cluster=kube_cluster,
            kube_namespace=ns,
            label_selector=label_selector,
            container_name=container_name,
            command=command,
        )
        data = dcm_request.to_dict(encode_json=True)
        resp = self._request("POST", url, data=data, is_json=True)
        logger.debug(f"Command Execution: {request.execution_id} on cluster: {cluster_id} start response: {resp}")
        return resp

    def execute_multiple_commands_on_cluster(
        self, kube_cluster: str, ns: str, cluster_id: str, remote_commands: list[RemoteCommandDto], pod_type: str
    ):
        logger.debug(f"Executing Multiple Commands on Cluster: {cluster_id} on {pod_type}")
        url = urljoin(self.client, f"/execute")

        label_selector = f"rayCluster={cluster_id}-kuberay, ray.io/node-type={pod_type}"
        container_name = f"ray-{pod_type}"
        commands = []
        for request in remote_commands:
            command = f"nohup /tmp/remote-command/run-remote-command.sh {request.execution_id} '{request.command}' {request.timeout} >> logs/remote-command.log 2>&1 &"
            commands.append(command)

        dcm_request = RemoteCommandExecuteDCMDto(
            kube_cluster=kube_cluster,
            kube_namespace=ns,
            label_selector=label_selector,
            container_name=container_name,
            command=" ".join(commands),
        )
        data = dcm_request.to_dict(encode_json=True)
        resp = self._request("POST", url, data=data, is_json=True)
        logger.debug(f"Multiple Command Execution on cluster: {cluster_id} start response: {resp}")
        return resp
