from typing import Optional

from loguru import logger

from compute_app_layer.models.remote_command.remote_command_request import PodCommandExecutionStatusReportRequest
from compute_core.compute import Compute
from compute_core.constant.config import Config
from compute_core.dao.remote_command_dao import RemoteCommandDao
from compute_core.dto.remote_command_dto import (
    PodCommandExecutionStatusDto,
    RemoteCommandDto,
    RemoteCommandStatus,
    RemoteCommandTarget,
)
from compute_core.service.dcm import DarwinClusterManager


# TODO: Consider using dependency injection for _dao, _dcm, _compute to improve testability
class RemoteCommand:
    def __init__(self):
        self._config = Config()
        self._dao = RemoteCommandDao()
        self._dcm = DarwinClusterManager()
        # TODO: Circular dependency potential - RemoteCommand creates Compute which may need RemoteCommand
        self._compute = Compute()

    def add_to_cluster(self, cluster_id: str, commands: list[RemoteCommandDto]) -> dict:
        logger.debug(f"Adding remote commands: {commands} to cluster: {cluster_id}")

        # Get the previous remote commands
        old_commands = [RemoteCommandDto.from_dict(rc) for rc in self.get_all_of_cluster(cluster_id)]

        # Insert the remote command into the database
        self._dao.add_remote_commands(commands, cluster_id)

        all_commands = old_commands + commands

        # Update Cluster Chart with remote commands
        update_resp = self._compute.update_cluster_with_remote_commands(cluster_id, all_commands)

        resp = {
            "remote_commands": [{"execution_id": cmd.execution_id} for cmd in commands],
            "artifact_name": update_resp.get("artifact_name"),
        }
        logger.debug(f"Added remote commands to cluster: {cluster_id} with response: {resp}")
        return resp

    def execute_on_cluster(self, cluster_id: str, request: RemoteCommandDto) -> dict:
        # TODO: Mutating request.status is a side effect - consider creating a copy
        logger.debug(f"Executing command on cluster: {cluster_id} with request: {request}")

        # Insert the remote command execution into the database with running status and update cluster chart
        request.status = RemoteCommandStatus.RUNNING
        add_resp = self.add_to_cluster(cluster_id, [request])

        kube_cluster = self._compute.get_kube_cluster(cluster_id)
        ns = self._compute.get_namespace(cluster_id)
        artifact_name = add_resp.get("artifact_name")

        # Apply the new chart to the k8s
        self._dcm.start_cluster(cluster_id, artifact_name, ns, kube_cluster)

        # Call the DarwinClusterManager to execute the command on the cluster with retries
        # TODO: "head" and "worker" string literals should be constants or enum values
        if request.target in [RemoteCommandTarget.cluster, RemoteCommandTarget.head]:
            self._dcm.execute_command_on_cluster(kube_cluster, ns, cluster_id, request, "head")
        if request.target in [RemoteCommandTarget.cluster, RemoteCommandTarget.worker]:
            self._dcm.execute_command_on_cluster(kube_cluster, ns, cluster_id, request, "worker")

        resp = add_resp.get("remote_commands")[0]
        logger.debug(f"Executed command on cluster: {cluster_id} with response: {resp}")
        return resp

    def execute_multiple_on_cluster(self, cluster_id: str, request: list[RemoteCommandDto]) -> dict:
        """
        Executes multiple remote commands on a ray cluster.
        :param cluster_id: The ID of the cluster to execute the commands on.
        :param request: A list of RemoteCommandDto objects representing the commands to execute
        """
        logger.debug(f"Executing multiple commands on cluster: {cluster_id} with request: {request}")

        # Insert the remote command executions into the database with running status
        for cmd in request:
            cmd.status = RemoteCommandStatus.RUNNING

        add_resp = self.add_to_cluster(cluster_id, request)

        kube_cluster = self._compute.get_kube_cluster(cluster_id)
        ns = self._compute.get_namespace(cluster_id)
        artifact_name = add_resp.get("artifact_name")

        # Apply the new chart to the k8s
        self._dcm.start_cluster(cluster_id, artifact_name, ns, kube_cluster)

        # Call the DarwinClusterManager to execute the commands on the cluster with retries
        head_commands = [
            cmd for cmd in request if cmd.target in [RemoteCommandTarget.head, RemoteCommandTarget.cluster]
        ]
        self._dcm.execute_multiple_commands_on_cluster(kube_cluster, ns, cluster_id, head_commands, "head")
        worker_commands = [
            cmd for cmd in request if cmd.target in [RemoteCommandTarget.worker, RemoteCommandTarget.cluster]
        ]
        self._dcm.execute_multiple_commands_on_cluster(kube_cluster, ns, cluster_id, worker_commands, "worker")

        logger.debug(f"Executed multiple commands on cluster: {cluster_id}: {add_resp}")

        return add_resp

    def delete_from_cluster(self, cluster_id: str, execution_ids: list[str]) -> dict:
        logger.debug(f"Deleting remote commands from cluster: {cluster_id} with execution ids: {execution_ids}")

        # Get the current remote commands of the cluster
        remote_commands = self.get_all_of_cluster(cluster_id)

        # Delete the remote commands from the database
        self._dao.remove_remote_command(execution_ids)

        # Remove the remote commands from the Cluster Chart
        # Parse the remote commands and remove the ones with the execution_ids
        remote_commands = [rc for rc in remote_commands if rc["execution_id"] not in execution_ids]
        remote_commands = [RemoteCommandDto.from_dict(rc) for rc in remote_commands]

        # Update the cluster chart with the remote commands removed
        self._compute.update_cluster_with_remote_commands(cluster_id, remote_commands)

        return {"execution_ids": execution_ids}

    def get_all_of_cluster(self, cluster_id: str) -> list[dict]:
        logger.debug(f"Getting all remote commands from cluster: {cluster_id}")

        # Get all the remote commands from the database
        resp = self._dao.get_all_remote_command_execution_status(cluster_id)

        return resp

    def get_execution_status(self, execution_id: str) -> dict:
        logger.debug(f"Getting command execution status for execution id: {execution_id}")

        # Get the command execution status from the database
        status = self._dao.get_remote_command_execution_status(execution_id)

        resp = {"status": status, "execution_id": execution_id}
        return resp

    def get_error_details_for_remote_command(self, execution_id: str) -> Optional[dict]:
        logger.debug(f"Getting error details for remote command with execution id: {execution_id}")

        return self._dao.get_error_details_for_remote_command(execution_id)

    def set_pod_status(self, request: PodCommandExecutionStatusReportRequest) -> dict:
        logger.debug(f"Setting pod command execution status with: {request}")

        # Get the current cluster_run_id for the cluster
        cluster_run_id = self._compute.dao.get_cluster_run_id_v2(request.cluster_id)

        data = PodCommandExecutionStatusDto(
            cluster_run_id=cluster_run_id,
            execution_id=request.execution_id,
            pod_name=request.pod_name,
            status=request.status.value,
        )

        # Insert the pod command execution status into the database
        self._dao.insert_pod_command_execution_status(data)

        return {
            "execution_id": request.execution_id,
            "cluster_run_id": cluster_run_id,
            "pod_name": request.pod_name,
            "status": request.status.value,
        }

    def update_execution_status_to_running(self, cluster_id: str) -> Optional[int]:
        logger.debug(f"Updating command execution status for cluster: {cluster_id} to running")

        # Update the command execution status in the database
        return self._dao.update_remote_commands_status_for_cluster_to_running(cluster_id)

    def update_running_commands_status_to_created(self, cluster_id: str) -> None:
        logger.debug(f"Updating running commands execution status for cluster: {cluster_id} to created")

        # Update the command execution status in the database
        self._dao.update_running_commands_status_to_created(cluster_id)
