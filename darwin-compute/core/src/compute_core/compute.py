import time

from datetime import datetime
from dateutil.tz import gettz
from loguru import logger
from typeguard import typechecked
from typing import Dict, List

from compute_core.constant.config import Config
from compute_core.constant.constants import (
    ALREADY_EXIST,
    INVALID_USER_NAME,
    CLOUD_ENV_CONFIG_KEY_DEFAULT,
    CLOUD_ENV_CONFIG_KEY_JOB,
    ResourceType,
)
from compute_core.constant.event_states import ComputeState
from compute_core.dao.cluster_dao import ClusterDao
from compute_core.dao.runtime_dao import RuntimeDao
from compute_core.dto.chronos_dto import ChronosEvent
from compute_core.dto.cluster_resource_dto import RayClusterResourceDTO
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.dto.request.es_compute_cluster_definition import ESComputeDefinition
from compute_core.dto.exceptions import ClusterInvalidStateException
from compute_core.service.dcm import DarwinClusterManager
from compute_core.service.event_service import EventService
from compute_core.service.ray_cluster import RayClusterService
from compute_core.util.utils import (
    get_random_id,
    get_run_id,
    urljoin,
    list_action_groups_mapper,
    events_mapper,
    process_filters,
    is_valid_email,
    calculate_active_resource,
    generate_ray_cluster_dashboard_url,
    get_resource_type_config_key,
)
from compute_model.compute_cluster import ComputeClusterDefinition
from compute_model.constant.constants import DISK_TYPE, INSTANCE_ROLE, AZS, NODE_LABELS


@typechecked
class Compute:
    """
    _config: Config
    dao: ClusterDao
    dcm: DarwinClusterManager
    event_service: EventService
    runtime_dao: RuntimeDao
    """

    def __init__(self, env: str = None):
        self._config = Config(env)
        env = self._config.env
        self.dao = ClusterDao(env)
        self.dcm = DarwinClusterManager(env)
        self.event_service = EventService()
        self.runtime_dao = RuntimeDao(env)

    def get_default_cloud_env(self, is_job_cluster: bool = False):
        result = self.dao.get_cluster_config(
            CLOUD_ENV_CONFIG_KEY_JOB if is_job_cluster else CLOUD_ENV_CONFIG_KEY_DEFAULT
        )
        logger.debug(f"Cloud env result: {result}")
        return result[0]["value"]

    def get_resource_default_cloud_env(self, resource_type: ResourceType = ResourceType.ALL_PURPOSE_CLUSTER):
        """
        Get the default cloud environment based on the resource type.
        :param resource_type: ResourceType enum value
        :return: Default cloud environment
        """
        cloud_env_key = get_resource_type_config_key(resource_type)
        default_cloud_env = self.dao.get_cluster_config(cloud_env_key)
        return default_cloud_env[0]["value"]

    def dcm_healthcheck(self):
        try:
            dcm_health = self.dcm.healthcheck()
        except Exception as e:
            dcm_health = False
        return dcm_health

    def healthcheck(self):
        return self.dao.healthcheck()

    def search_cluster_name(self, name: str):
        resp = self.dao.search_cluster_name(name)
        if len(resp["hits"]["hits"]) != 0:
            return True
        return False

    def _get_artifact_name(self, name: str, version: int):
        return f"{name}-v{str(version)}"

    def _get_latest_version(self, cluster_id: str):
        artifact_id = self.dao.get_cluster_artifact_id(cluster_id)
        return int(artifact_id[artifact_id.rfind("-v") + 2 :]) if artifact_id else 1

    def create_cluster(self, compute_request: ComputeClusterDefinition):
        """
        Create cluster using compute definition
        :param compute_request: Cluster definition object
        :return: Return the status of cluster creation and cluster_id
        """
        cloud_env = self._config.get_cloud_env(
            default_cloud_env=self.get_default_cloud_env(compute_request.is_job_cluster),
            cloud_env=compute_request.cloud_env,
        )
        cluster_id = get_random_id()
        logger.debug(f"Creating cluster with id: {cluster_id} in cloud env: {cloud_env}")

        if self.search_cluster_name(compute_request.name):
            compute_request.name = compute_request.name + "_" + cluster_id
        compute_request.cloud_env = cloud_env
        compute_request.cluster_id = cluster_id
        compute_request.created_on = str(datetime.now(tz=gettz("Asia/Kolkata")))

        compute_request = ESComputeDefinition.from_dict(compute_request.to_dict())

        version = 1
        artifact_name = self._get_artifact_name(cluster_id, version)

        event = ChronosEvent(
            cluster_id=cluster_id,
            cluster_name=compute_request.name,
            event_type=ComputeState.CLUSTER_CREATION_REQUEST_RECEIVED.name,
            artifact_name=artifact_name,
            metadata={"request": compute_request.to_dict(encode_json=True)},
        )
        self.send_event(event)

        response = self.dcm.create_cluster(cluster_id, artifact_name, compute_request)
        logger.debug(f"Cluster manager create response: {response}")
        self.dao.create_cluster(cluster_id, artifact_name, compute_request)

        event = ChronosEvent(
            cluster_id=cluster_id,
            cluster_name=compute_request.name,
            event_type=ComputeState.CLUSTER_CREATED.name,
            artifact_name=artifact_name,
            metadata={"request": compute_request.to_dict(encode_json=True)},
        )
        self.send_event(event)
        return {"cluster_id": response["ClusterName"]}

    def delete_cluster(self, cluster_id: str):
        """
        Delete cluster using cluster_id
        :param cluster_id: Cluster identification
        :return: Returns the status of the request
        """
        # If cluster is not in inactive state then throw error
        if self.dao.get_cluster_status(cluster_id) != "inactive":
            raise RuntimeError("Cluster is not in stop state")

        event = ChronosEvent(
            cluster_id=cluster_id,
            event_type=ComputeState.CLUSTER_DELETION_REQUEST_RECEIVED.name,
        )
        self.send_event(event)

        resp = self.dao.delete_cluster(cluster_id)

        event = ChronosEvent(
            cluster_id=cluster_id,
            event_type=ComputeState.CLUSTER_DELETED.name,
        )
        self.send_event(event)

        self.dao.delete_recently_visited(cluster_id)

    def get_cluster(self, cluster_id: str) -> ESComputeDefinition:
        """
        Fetch cluster details using cluster id
        :param cluster_id: Cluster identification
        :return: Returns the status of the request and cluster_id
        """
        resp = self.dao.get_cluster_info(cluster_id)
        return resp

    def update_cluster(
        self,
        cluster_id: str,
        compute_request: ComputeClusterDefinition,
        user: str,
        diff: dict = None,
        commands: list[RemoteCommandDto] = None,
    ):
        """
        Update cluster using compute definition
        :param cluster_id: Cluster identification
        :param compute_request: Cluster definition object
        :param user: user made changes
        :param diff: Difference between old and new cluster configurations
        :param commands: List of remote commands to be executed
        :return: Returns the cluster_id
        """

        try:
            # Get cluster details from ES and fill the missing fields in updated request
            cluster_info: ESComputeDefinition = self.get_cluster(cluster_id)
            cloud_env = self._config.get_cloud_env(
                default_cloud_env=self.get_default_cloud_env(cluster_info.is_job_cluster),
                cloud_env=cluster_info.cloud_env,
            )
            compute_request.cloud_env = cloud_env
            compute_request.cluster_id = cluster_id
            compute_request.user = cluster_info.user
            compute_request.created_on = cluster_info.created_on

            event_request = compute_request.to_dict(encode_json=True)
            compute_request = compute_request.to_dict()
            es_dict = cluster_info.to_dict()
            for key, value in compute_request.items():
                es_dict[key] = value
            es_compute_request = ESComputeDefinition.from_dict(es_dict)

            new_version = self._get_latest_version(cluster_id) + 1
            artifact_name = self._get_artifact_name(cluster_id, new_version)

            event = ChronosEvent(
                cluster_id=cluster_id,
                cluster_name=es_compute_request.name,
                event_type=ComputeState.CLUSTER_UPDATION_REQUEST_RECEIVED.name,
                artifact_name=artifact_name,
                metadata={
                    "request": event_request,
                    "user": user,
                    "diff": diff,  # the difference between old and new configurations
                },
            )
            self.send_event(event)

            logger.debug(f"Updating cluster with id: {cluster_id} in cloud env: {cloud_env}")

            response = self.dcm.update_cluster(cluster_id, artifact_name, es_compute_request, commands)
            logger.debug(f"Cluster manager update response: {response}")

            self.dao.update_cluster_name_artifact(cluster_id, artifact_name, es_compute_request)

            run_id = self.dao.get_cluster_run_id(cluster_id)
            if run_id:
                self.dao.insert_cluster_action(
                    run_id=run_id,
                    action="Updating",
                    message="Cluster is updating",
                    cluster_id=cluster_id,
                    artifact_id=artifact_name,
                )

            event = ChronosEvent(
                cluster_id=cluster_id,
                cluster_name=es_compute_request.name,
                event_type=ComputeState.CLUSTER_UPDATED.name,
                artifact_name=artifact_name,
                metadata={
                    "request": event_request,
                    "user": user,
                    "diff": diff,  # the difference between old and new configurations
                },
                session_id=run_id,
            )
            self.send_event(event)

            return {"cluster_id": response["ClusterName"]}
        except Exception as e:
            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_UPDATION_FAILED.name,
                message=e.__str__(),
                metadata={
                    "user": user,
                    "diff": diff,  # the difference between old and new configurations
                },
            )
            self.send_event(event)
            raise e

    def force_update_cluster(self, cluster_id: str, remote_commands: list[RemoteCommandDto]):
        """
        Force update cluster using cluster_id
        :param cluster_id: Cluster identification
        :param remote_commands: List of remote commands to be executed
        :return: Returns the cluster_id
        """
        # Get cluster details from ES.
        cluster_info: ESComputeDefinition = self.get_cluster(cluster_id)
        cluster_info.cloud_env = self._config.get_cloud_env(
            default_cloud_env=self.get_default_cloud_env(cluster_info.is_job_cluster),
            cloud_env=cluster_info.cloud_env,
        )

        artifact_name = self._get_artifact_name(cluster_id, self._get_latest_version(cluster_id) + 1)

        event = ChronosEvent(
            cluster_id=cluster_id,
            cluster_name=cluster_info.name,
            event_type=ComputeState.CLUSTER_UPDATION_REQUEST_RECEIVED.name,
            artifact_name=artifact_name,
            message="Cluster is forcefully updated by Darwin Team",
        )
        self.send_event(event)

        logger.debug(f"Force Updating cluster with id: {cluster_id}")

        response = self.dcm.update_cluster(cluster_id, artifact_name, cluster_info, remote_commands)
        logger.debug(f"Cluster manager force update response: {cluster_id}: {response}")

        self.dao.update_cluster_name_artifact(cluster_id, artifact_name, cluster_info)

        run_id = self.dao.get_cluster_run_id(cluster_id)
        if run_id:
            self.dao.insert_cluster_action(
                run_id=run_id,
                action="Updating",
                message="Cluster is forcefully updated by Darwin Team",
                cluster_id=cluster_id,
                artifact_id=artifact_name,
            )

        event = ChronosEvent(
            cluster_id=cluster_id,
            cluster_name=cluster_info.name,
            event_type=ComputeState.CLUSTER_UPDATED.name,
            artifact_name=artifact_name,
            message="Cluster is updated by Darwin Team",
            session_id=run_id,
        )
        self.send_event(event)

        return {"cluster_id": response["ClusterName"]}

    def update_cluster_cloud_env(
        self, cluster_id: str, user: str, new_cloud_env: str, remote_commands: list[RemoteCommandDto]
    ):
        """
        Update the cloud environment of the cluster, if the cluster is in inactive state.
        :param cluster_id: Cluster identification
        :param user: User that initiated the update
        :param new_cloud_env: New cloud environment
        :param remote_commands: List of remote commands to be executed
        :return: Returns the updated cloud environment
        """
        # Get cluster details from ES.
        cluster_info: ESComputeDefinition = self.get_cluster(cluster_id)

        # If the cluster is not in inactive state, raise an error
        if cluster_info.status != "inactive":
            raise ClusterInvalidStateException(cluster_id, cluster_info.status, "inactive")

        # If the new cloud environment is same as the old one, no need to update
        old_cloud_env = cluster_info.cloud_env
        if old_cloud_env == new_cloud_env:
            logger.debug(f"Cluster with id: {cluster_id} is already in cloud environment: {new_cloud_env}")
            return

        # Check if the new cloud environment is valid
        new_cloud_env = self._config.get_cloud_env(
            default_cloud_env=self.get_default_cloud_env(cluster_info.is_job_cluster), cloud_env=new_cloud_env
        )
        cluster_info.cloud_env = new_cloud_env

        if old_cloud_env in cluster_info.tags:
            cluster_info.tags.remove(old_cloud_env)
            cluster_info.tags.append(new_cloud_env)

        new_artifact_name = self._get_artifact_name(cluster_id, self._get_latest_version(cluster_id) + 1)
        run_id = self.dao.get_cluster_run_id(cluster_id)

        # Update the cluster info with the new cloud environment
        logger.debug(f"Updating cloud environment of cluster with id: {cluster_id} to {new_cloud_env}")
        event = ChronosEvent(
            cluster_id=cluster_id,
            session_id=run_id,
            cluster_name=cluster_info.name,
            event_type=ComputeState.CLUSTER_UPDATION_REQUEST_RECEIVED.name,
            artifact_name=new_artifact_name,
            message="Cluster cloud environment update requested",
            metadata={"user": user, "new_cloud_env": new_cloud_env},
        )
        self.send_event(event)

        response = self.dcm.update_cluster(cluster_id, new_artifact_name, cluster_info, remote_commands)
        logger.debug(f"Cluster manager force update response: {cluster_id}: {response}")

        self.dao.update_cluster_name_artifact(cluster_id, new_artifact_name, cluster_info)

        if run_id:
            self.dao.insert_cluster_action(
                run_id=run_id,
                action="Updating",
                message=f"Cluster cloud environment is updated to {new_cloud_env} by {user}",
                cluster_id=cluster_id,
                artifact_id=new_artifact_name,
            )

        event = ChronosEvent(
            cluster_id=cluster_id,
            session_id=run_id,
            cluster_name=cluster_info.name,
            event_type=ComputeState.CLUSTER_UPDATED.name,
            artifact_name=new_artifact_name,
            message="Cluster cloud environment updated",
            metadata={"user": user, "new_cloud_env": new_cloud_env},
        )
        self.send_event(event)

    def get_kube_cluster(self, cluster_id: str):
        resp = self.get_cluster(cluster_id)
        cloud_env = self._config.get_cloud_env(
            default_cloud_env=self.get_default_cloud_env(resp.is_job_cluster),
            cloud_env=resp.cloud_env,
        )
        return self._config.get_kube_cluster(cloud_env)

    def get_default_kube_cluster(self) -> str:
        return self._config.get_kube_cluster(self.get_default_cloud_env())

    def get_default_namespace(self) -> str:
        return self._config.default_namespace

    def get_namespace(self, cluster_id: str):
        resp = self.get_cluster(cluster_id)
        runtime = resp.runtime
        return self.runtime_dao.get_runtime_namespace(runtime)

    def get_cluster_pods(self, cluster_id: str):
        """
        Fetches all cluster pods along with their status
        :param cluster_id: cluster id
        :return: cluster resources
        """
        kube_cluster = self.get_kube_cluster(cluster_id)
        namespace = self.get_namespace(cluster_id)
        return self.dcm.cluster_status(cluster_id, namespace, kube_cluster)

    def start(self, cluster_id: str, user: str = "SDK"):
        """
        Start Cluster using cluster_id
        :param cluster_id: Cluster identification
        :param user: Requested by, default SDK
        :return: Returns the status of the request and cluster_id along with jupyter and dashboard links
        """
        try:
            ns = self.get_namespace(cluster_id)
            kube_cluster = self.get_kube_cluster(cluster_id)
            version = self._get_latest_version(cluster_id)
            artifact_name = self._get_artifact_name(cluster_id, version)
            logger.debug(f"Starting cluster with id: {cluster_id} in namespace: {ns} and kube_cluster: {kube_cluster}")

            response = self.dcm.start_cluster(cluster_id, artifact_name, ns, kube_cluster)

            run_id = get_run_id()

            self.dao.start_cluster(cluster_id, run_id)
            self.dao.insert_cluster_action(
                run_id=run_id,
                action="Started",
                message="Cluster started by " + user,
                cluster_id=cluster_id,
                artifact_id=artifact_name,
            )

            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_START_REQUEST_RECEIVED.name,
                artifact_name=artifact_name,
                session_id=run_id,
                metadata={
                    "user": user,  # the user who initiated the start
                },
            )
            self.send_event(event)

            return response
        except Exception as e:
            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_START_FAILED.name,
                message=e.__str__(),
                metadata={
                    "user": user,  # the user who initiated the start
                },
            )
            self.send_event(event)
            raise e

    def stop(self, cluster_id: str, user: str = "SDK"):
        """
        Stop Cluster using cluster_id
        :param cluster_id: Cluster identification
        :param user: User id that requested
        :return: Returns the status of the request
        """
        try:
            ns = self.get_namespace(cluster_id)
            kube_cluster = self.get_kube_cluster(cluster_id)
            version = self._get_latest_version(cluster_id)
            artifact_name = self._get_artifact_name(cluster_id, version)
            logger.debug(f"Stopping cluster with id: {cluster_id} in namespace: {ns} and kube_cluster: {kube_cluster}")

            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_STOP_REQUEST_RECEIVED.name,
                artifact_name=artifact_name,
                metadata={
                    "user": user,  # the user who initiated the stop
                },
            )
            self.send_event(event)

            response = self.dcm.stop_cluster(cluster_id, ns, kube_cluster)
            logger.debug(f"Cluster manager stop response: {response}")
            self.dao.stop_cluster(cluster_id)

            # Sleeping for ES to get updated - TODO: Need to check if refresh field works for ES_DAO, then can be removed
            time.sleep(0.5)

            run_id = self.dao.get_cluster_run_id(cluster_id)
            if not run_id:
                run_id = ""

            self.dao.insert_cluster_action(
                run_id=run_id,
                action="Stopped",
                message="Cluster is stopped by " + user,
                cluster_id=cluster_id,
                artifact_id=artifact_name,
            )

            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_STOPPED.name,
                artifact_name=artifact_name,
                session_id=run_id,
                metadata={
                    "user": user,  # the user who initiated the stop
                },
            )
            self.send_event(event)

            return None
        except Exception as e:
            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_STOP_FAILED.name,
                message=e.__str__(),
                metadata={
                    "user": user,  # the user who initiated the stop
                },
            )
            self.send_event(event)
            raise e

    def restart(self, cluster_id: str, user: str = "SDK"):
        """
        Restart Cluster using cluster_id
        :param cluster_id: Cluster identification
        :param user: user id that requested
        :return: Returns the status of the request and cluster_id along with jupyter and dashboard links
        """
        try:
            ns = self.get_namespace(cluster_id)
            kube_cluster = self.get_kube_cluster(cluster_id)
            version = self._get_latest_version(cluster_id)
            artifact_name = self._get_artifact_name(cluster_id, version)

            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_RESTART_REQUEST_RECEIVED.name,
                artifact_name=artifact_name,
                metadata={
                    "user": user,  # the user who initiated the restart
                },
            )
            self.send_event(event)

            response = self.dcm.restart_cluster(cluster_id, artifact_name, ns, kube_cluster)

            self.dao.restart_cluster(cluster_id)

            run_id = self.dao.get_cluster_run_id(cluster_id)
            if run_id:
                self.dao.insert_cluster_action(
                    run_id=run_id,
                    action="Restarting",
                    message="Cluster restarted by " + user,
                    cluster_id=cluster_id,
                    artifact_id=artifact_name,
                )

            return response
        except Exception as e:
            event = ChronosEvent(
                cluster_id=cluster_id,
                event_type=ComputeState.CLUSTER_RESTART_FAILED.name,
                message=e.__str__(),
                metadata={
                    "user": user,  # the user who initiated the restart
                },
            )
            self.send_event(event)
            raise e

    def update_and_apply_changes(
        self,
        cluster_id: str,
        compute_request: ComputeClusterDefinition,
        user: str,
        diff: dict,
        commands: list[RemoteCommandDto] = None,
    ):
        """
        Update and restart the cluster using the compute definition.

        :param cluster_id: Cluster identification
        :param compute_request: Cluster definition object
        :param user: User that initiated the update
        :param diff: A dictionary containing the differences between the old and new configurations.
        :param commands: List of remote commands to be executed
        :return: Returns the status of the request and cluster_id along with jupyter and dashboard links
        """
        self.update_cluster(cluster_id, compute_request, user, diff, commands)
        resp = self.start(cluster_id)
        return resp

    def update_cluster_name(self, cluster_id: str, cluster_name: str):
        """
        Update the cluster name
        :param cluster_id: Cluster identification
        :param cluster_name: New cluster name
        :return: Returns the status of the request and cluster id
        """
        # Check if the new cluster name already exists or not
        if self.search_cluster_name(cluster_name):
            raise Exception(ALREADY_EXIST)
        resp = self.dao.update_cluster_name(cluster_id, cluster_name)
        return resp

    def update_cluster_user(self, cluster_id: str, cluster_user: str) -> str:
        """
        Update the cluster user
        :param cluster_id: Cluster identification
        :param cluster_user: New cluster user
        :return: Returns the updated username
        """
        if not is_valid_email(cluster_user):
            raise Exception(INVALID_USER_NAME)
        resp: ESComputeDefinition = self.dao.update_cluster_user(cluster_id, cluster_user)
        return resp.user

    def update_cluster_tags(self, cluster_id: str, tags: list):
        """
        Update the cluster tags
        :param cluster_id: Cluster identification
        :param tags: New tag list
        :return: Returns the status of the request
        """
        resp = self.dao.update_cluster_tags(cluster_id, tags)
        return resp

    def search_cluster(
        self,
        search_keyword: str,
        filters: Dict[str, List],
        exclude_filters: Dict[str, List],
        sort_fields: Dict[str, str],
        page_size: int,
        offset: int,
    ):
        """
        Search function
        :param search_keyword: keyword to be searched
        :param filters: fields and values to be filtered
        :param exclude_filters: fields and values to be excluded.
        :param sort_fields: dict of sort_by and the order
        :param page_size: page size for search result
        :param offset: offset
        :return: list of clusters based on search, filters and sorting order provided
        """
        query_fields = ["name", "tags"]
        processed_filters = process_filters(filters)
        exclude_filters = process_filters(exclude_filters)
        resp = self.dao.search_cluster(
            search_keyword,
            query_fields,
            processed_filters,
            exclude_filters,
            sort_fields,
            page_size,
            offset,
        )
        return resp

    def get_runtimes(self):
        """
        Fetch all the runtimes
        :return: list of available runtimes
        """
        resp = self.runtime_dao.get_all_runtimes()
        return resp

    def get_disk_types(self):
        """
        Fetch all the disk types
        :return: list of templates for cluster
        """
        return DISK_TYPE

    def get_instance_role(self):
        """
        Fetch all the instance roles
        :return: list of instance roles
        """
        return INSTANCE_ROLE

    def get_az(self):
        """
        Fetch all the AZs
        :return: list of AZs
        """
        return AZS

    def get_tags(self):
        """
        Fetch all the tags used in the compute
        :return: list of tags from all compute
        """
        resp = self.dao.get_all_tags()
        return resp

    def get_cluster_metadata(self, cluster_id: str):
        """
        Fetch cluster info using cluster_id
        :param cluster_id: Cluster identification
        :return: status of request and cluster info
        """
        resp = self.dao.get_cluster_metadata(cluster_id)
        return resp

    def get_all_clusters_metadata(self):
        """
        Fetch cluster info of all the clusters
        :return: status of request and list of clusters along with their info
        """
        resp = self.dao.get_all_clusters_metadata()
        return resp

    @staticmethod
    def get_ray_cluster_dashboards(host: str, cloud_env: str, cluster_id: str, https: bool = False) -> dict:
        """
        Fetch all ray cluster dashboards urls using cluster_id
        :param host: Darwin host url
        :param cloud_env: Cloud environment
        :param cluster_id: Cluster identification
        :param https: True if the url should be https, False for http
        :return: ray cluster dashboards urls
        """
        return {
            "jupyter_lab_url": urljoin(host, cloud_env, f"{cluster_id}-jupyter", https=https),
            "ray_dashboard_url": urljoin(host, cloud_env, f"{cluster_id}-dashboard/", https=https),
            "spark_ui_url": urljoin(host, cloud_env, f"{cluster_id}-sparkui/", https=https),
            "grafana_dashboard_url": urljoin(host, cloud_env, f"{cluster_id}-metrics/", https=https),
            "code_server_url": urljoin(host, cloud_env, f"{cluster_id}-vscode/", https=https),
        }

    def get_dashboards(self, cluster_id: str):
        """
        Fetch all dashboards urls using cluster_id
        :param cluster_id: Cluster identification
        :return: dashboards urls
        """
        darwin_host = self._config.host_url
        datadog_host = self._config.datadog_host_url
        cluster_details = self.get_cluster(cluster_id)
        dashboard_id = self._config.datadog_dashboard_id
        cloud_env = cluster_details.cloud_env
        resp = self.get_ray_cluster_dashboards(host=darwin_host, cloud_env=cloud_env, cluster_id=cluster_id, https=False)
        resp["resource_utilization_dashboard_url"] = generate_ray_cluster_dashboard_url(
            cluster_id, datadog_host, dashboard_id, self.dao
        )
        return resp

    def get_internal_dashboards(self, cluster_id: str):
        """
        Fetch all dashboards internal urls using cluster_id
        :param cluster_id: Cluster identification
        :return: dashboards internal url
        """
        resp = self.get_cluster(cluster_id)
        cloud_env = self._config.get_cloud_env(
            default_cloud_env=self.get_default_cloud_env(resp.is_job_cluster), cloud_env=resp.cloud_env
        )
        darwin_host = self._config.internal_host_url(cloud_env)
        resp = self.get_ray_cluster_dashboards(host=darwin_host, cloud_env=cloud_env, cluster_id=cluster_id)
        return resp

    def get_node_types(self):
        """
        Fetch all the node types
        :return: list of node_types
        """
        return NODE_LABELS

    def get_clusters_from_list(self, cluster_list: list):
        """
        Fetches cluster details of a list of clusters
        :param cluster_list: List of clusters to fetch details for
        :return:
        """
        return self.dao.get_cluster_list(cluster_list)

    def get_action_details(self, cluster_runtime_id: str, sort_order: str):
        action_details = self.dao.get_cluster_actions(cluster_runtime_id, sort_order)
        return events_mapper(action_details)

    def list_action_groups(self, cluster_id, offset, page_size, sort_order):
        runtime_ids = self.dao.get_cluster_runtime_ids(cluster_id, offset, page_size, sort_order)
        action_groups = []
        for runtime_id in runtime_ids:
            first_and_last_event = self.dao.get_first_and_last_event(runtime_id["cluster_runid"])
            action_groups.append(list_action_groups_mapper(runtime_id, first_and_last_event))
        return action_groups

    def get_all_users(self):
        users = self.dao.get_all_users()
        return users

    def add_recently_visited(self, cluster_id: str, user: str):
        return self.dao.add_recently_visited(cluster_id, user)

    def get_recently_visited(self, user: str):
        return self.dao.get_recently_visited(user)

    def get_all_clusters_running_for_threshold_time(self, threshold_time: int) -> list[dict]:
        return self.dao.get_all_clusters_running_for_threshold_time(threshold_time)

    def update_status(
        self, cluster_id: str, status: str, active_pods: int, available_memory: int, last_updated_at: datetime = None
    ):
        logger.debug(
            f"Updating status of {cluster_id} to {status} with {active_pods} active pods and {available_memory} available memory"
        )
        return self.dao.update_status(cluster_id, status, active_pods, available_memory, last_updated_at)

    def send_event(self, event: ChronosEvent):
        try:
            logger.info(f"Sending event: {event}")
            self.event_service.send_event(event)
        except Exception as e:
            logger.error(f"Failed to send event: {event} due to error: {e}")

    def get_active_resources(self, cluster_id: str):
        try:
            ray_dashboard = self.get_internal_dashboards(cluster_id).get("ray_dashboard_url")
            nodes = RayClusterService(ray_dashboard).get_summary()
            return calculate_active_resource(nodes)
        except Exception as e:
            logger.error(f"Error while getting active resources: {e}")
            return RayClusterResourceDTO(cores_used=0, memory_used=0)

    def update_cluster_with_remote_commands(self, cluster_id: str, remote_commands: list[RemoteCommandDto]):
        """
        Add Remote Commands in the cluster chart
        :param cluster_id: Cluster identification
        :param remote_commands: List of remote commands
        :return: Returns the cluster_id
        """
        # Get cluster details from ES.
        cluster_info: ESComputeDefinition = self.get_cluster(cluster_id)
        artifact_name = self._get_artifact_name(cluster_id, self._get_latest_version(cluster_id) + 1)

        logger.debug(f"Adding remote commands: {remote_commands} to cluster chart with id: {cluster_id}")

        response = self.dcm.update_cluster(cluster_id, artifact_name, cluster_info, remote_commands)
        logger.debug(f"Cluster manager update response for {cluster_id}: {response}")

        self.dao.update_cluster_name_artifact(cluster_id, artifact_name, cluster_info)

        event = ChronosEvent(
            cluster_id=cluster_id,
            cluster_name=cluster_info.name,
            event_type=ComputeState.CLUSTER_UPDATED.name,
            artifact_name=artifact_name,
            message="Remote Command Updated on Cluster",
            metadata={"remote_commands": [cmd.to_dict(encode_json=True) for cmd in remote_commands]},
        )
        self.send_event(event)

        resp = {"cluster_id": response["ClusterName"], "artifact_name": artifact_name}
        logger.debug(f"Updated cluster with remote commands: {resp}")
        return resp
