import traceback
from datetime import datetime, timedelta, timezone
from typing import Optional

from loguru import logger

from compute_app_layer.routers.dependency_cache import get_compute, get_library_manager
from compute_core.compute import Compute
from compute_core.dto.chronos_dto import ChronosEvent
from compute_core.dto.cluster_resource_dto import ClusterResourceDTO
from compute_core.dto.request.es_compute_cluster_definition import ESComputeDefinition
from compute_core.util.package_management.package_manager import LibraryManager
from compute_model.cluster_status import ClusterStatus, UIClusterStatusMapping
from compute_script.constant.constants import (
    CLUSTER_DIED_STATUS_TIMEOUT_IN_MINS,
    CLUSTER_DIED_ACTION,
    CLUSTER_MAX_CREATION_TIMEOUT_IN_MINS,
    ACTIVE_ACTION,
    WORKER_NODES_DIED_ACTION,
    CLUSTER_START_ACTION,
    CLUSTER_RESTART_ACTION,
)
from compute_script.constant.event_states import ClusterTimeoutState
from compute_script.dao.sql_dao import ScriptMySQLDao
from compute_script.dto.cluster_metadata import ClusterMetadata
from compute_script.dto.cluster_status_graph import generate_status_graph
from compute_script.get_compute_cluster_state import (
    get_compute_cluster_resources_required,
    get_compute_cluster_dto,
    get_compute_cluster_current_status,
)
from compute_script.util.darwin_slack_alert import DarwinSlackAlert
from compute_script.util.custom_metrics import CustomMetrics

# TODO: Global status_graph instance - consider lazy initialization or dependency injection
status_graph = generate_status_graph()


# TODO: This function has multiple responsibilities - consider splitting into status update and event sending
def update_status_and_send_events(
    compute: Compute,
    cluster: ClusterMetadata,
    k8s_resources: list[ClusterResourceDTO],
    old_status: ClusterStatus,
    new_status: ClusterStatus,
):
    logger.debug(f"Updating Status of {cluster.cluster_id} from {old_status.value} to {new_status.value}")
    actions = status_graph.get_transition_actions(old_status, new_status)
    logger.debug(f"Actions for {cluster.cluster_id} from {old_status.value} to {new_status.value}: {actions}")
    for action in actions:
        compute.dao.insert_cluster_action(
            run_id=cluster.active_cluster_runid,
            action=action.action,
            message=action.message,
            cluster_id=cluster.cluster_id,
            artifact_id=cluster.artifact_id,
        )
    logger.debug(f"Inserted cluster actions for {cluster.cluster_id} from {old_status.value} to {new_status.value}")
    chronos_event_actions = status_graph.get_chronos_event_actions(old_status, new_status)
    k8s_resources_dict = [resource.to_dict(encode_json=True) for resource in k8s_resources]
    for action in chronos_event_actions:
        compute.send_event(
            ChronosEvent(
                cluster_id=cluster.cluster_id,
                event_type=action.event_type,
                message=action.message,
                metadata={"cluster": cluster.to_dict(encode_json=True), "k8s_resources": k8s_resources_dict},
            )
        )
    logger.debug(f"Sent chronos events for {cluster.cluster_id} from {old_status.value} to {new_status.value}")
    compute.update_status(
        cluster.cluster_id, new_status.value, cluster.active_pods, cluster.available_memory, cluster.last_updated_at
    )
    logger.debug(f"Updated Status of {cluster.cluster_id} to {new_status.value}")


def eligible_for_cluster_died_to_inactive(cluster: ClusterMetadata, new_status: ClusterStatus) -> bool:
    if new_status == ClusterStatus.cluster_died:
        # TODO: Creating new ScriptMySQLDao() instance on each call is inefficient - use dependency injection
        # Check if the cluster is in cluster_died state for more than 60 minutes
        cluster_died_time = ScriptMySQLDao().get_cluster_action_time(cluster.active_cluster_runid, CLUSTER_DIED_ACTION)
        if cluster_died_time and datetime.now() - cluster_died_time > timedelta(
            minutes=CLUSTER_DIED_STATUS_TIMEOUT_IN_MINS
        ):
            return True
    return False


# TODO: Function name has typo - "timout" should be "timeout"
def eligible_for_stop_cluster_after_creation_timout(cluster: ClusterMetadata) -> bool:
    # TODO: Multiple ScriptMySQLDao() instantiations - pass DAO as parameter or use singleton
    latest_worker_nodes_died_action_time = ScriptMySQLDao().get_cluster_action_ending_time(
        cluster.active_cluster_runid, WORKER_NODES_DIED_ACTION
    )
    logger.debug(
        f"Latest time of Worker Nodes Died action of cluster {cluster.cluster_id}: {latest_worker_nodes_died_action_time}"
    )
    latest_started_action_time = ScriptMySQLDao().get_cluster_action_ending_time(
        cluster.active_cluster_runid, CLUSTER_START_ACTION
    )
    logger.debug(f"Latest time of Started action of cluster {cluster.cluster_id}: {latest_started_action_time}")
    latest_restarting_action_time = ScriptMySQLDao().get_cluster_action_ending_time(
        cluster.active_cluster_runid, CLUSTER_RESTART_ACTION
    )
    logger.debug(f"Latest time of Restarting action of cluster {cluster.cluster_id}: {latest_restarting_action_time}")

    latest_active_action_time = ScriptMySQLDao().get_cluster_action_ending_time(
        cluster.active_cluster_runid, ACTIVE_ACTION
    )
    logger.debug(f"Latest time of Running action of cluster {cluster.cluster_id}: {latest_active_action_time}")

    latest_time = max(
        (
            time
            for time in [
                latest_worker_nodes_died_action_time,
                latest_started_action_time,
                latest_restarting_action_time,
                latest_active_action_time,
            ]
            if time is not None
        ),
        default=None,
    )

    # Convert to aware datetime object if not aware
    if latest_time is not None and latest_time.tzinfo is None:
        latest_time = latest_time.replace(tzinfo=timezone.utc)
    # Check if the cluster is in creating state for more than 60 minutes
    if latest_time and datetime.now(tz=timezone.utc) - latest_time > timedelta(
        minutes=CLUSTER_MAX_CREATION_TIMEOUT_IN_MINS
    ):
        return True
    return False


# TODO: This function is too long (60+ lines) - extract K8s resource fetching and status calculation into helpers
def status_poller_job(cluster: ClusterMetadata, custom_metric_util: CustomMetrics) -> Optional[ClusterStatus]:
    try:
        compute: Compute = get_compute()
        lib_manager: LibraryManager = get_library_manager()

        cluster_id = cluster.cluster_id
        old_status = ClusterStatus(cluster.status)

        cluster_details: ESComputeDefinition = compute.get_cluster(cluster_id)
        logger.debug(f"Cluster Details of {cluster_id}: {cluster_details}")
        runtime = cluster_details.runtime

        namespace = compute.runtime_dao.get_runtime_namespace(runtime)
        kube_cluster = compute.get_kube_cluster(cluster_id)

        k8s_resources = compute.dcm.cluster_status(cluster_id, namespace, kube_cluster)
        logger.debug(f"K8s resources of {cluster_id}: {k8s_resources}")

        jupyter_link = compute.get_internal_dashboards(cluster_id)["jupyter_lab_url"]
        logger.debug(f"Jupyter link of {cluster_id}: {jupyter_link}")

        compute_cluster_dto = get_compute_cluster_dto(cluster_id, k8s_resources, jupyter_link)
        logger.debug(f"Compute Cluster DTO of {cluster_id}: {compute_cluster_dto}")

        compute_cluster_resource_required = get_compute_cluster_resources_required(cluster_details)
        logger.debug(f"Compute Cluster Resources Required of {cluster_id}: {compute_cluster_resource_required}")

        new_status = get_compute_cluster_current_status(
            compute_cluster_dto, old_status, compute_cluster_resource_required.worker_nodes
        )
        logger.debug(f"New Status of {cluster_id}: {new_status.name}")

        cluster.active_pods = compute_cluster_dto.get_active_nodes()
        cluster.available_memory = compute_cluster_resource_required.total_memory

        if new_status in [ClusterStatus.creating, ClusterStatus.head_node_up, ClusterStatus.jupyter_up]:
            ScriptMySQLDao().update_last_used_at(cluster_id)
        if old_status != new_status:
            update_status_and_send_events(compute, cluster, k8s_resources, old_status, new_status)
        else:
            logger.debug(f"Cluster Status of {cluster_id} remains {old_status.name}")
            if eligible_for_cluster_died_to_inactive(cluster, new_status):
                update_status_and_send_events(compute, cluster, k8s_resources, old_status, ClusterStatus.inactive)
                DarwinSlackAlert().cluster_dead_to_inactive(cluster_id, cluster.cluster_name)
                logger.debug(f"Marked {cluster_id} as inactive from cluster_died state")

        if new_status not in UIClusterStatusMapping.active.value:
            # TODO: This timeout logic should be in a separate function for better readability
            if eligible_for_stop_cluster_after_creation_timout(cluster) is True:
                compute.stop(cluster_id, user="Timeout Job")
                lib_manager.delete_uninstalled_library(cluster_id)
                lib_manager.update_running_libraries_to_created(cluster_id)

                DarwinSlackAlert().cluster_timeout(cluster_id, cluster.cluster_name)
                event = ChronosEvent(
                    cluster_id=cluster_id,
                    event_type=ClusterTimeoutState.CLUSTER_TIMEOUT.name,
                    message=f"Cluster timed out because it was stuck in creating state for more than {CLUSTER_MAX_CREATION_TIMEOUT_IN_MINS} minutes",
                )
                compute.send_event(event)
                logger.debug(f"Cluster {cluster_id} terminated after reaching creation timeout threshold")

        return new_status
    except Exception as err:
        # TODO: Broad exception catch - consider catching specific exceptions and handling differently
        tb = traceback.format_exc()
        logger.error(f"{cluster.cluster_id} - {err} - {tb}")
        custom_metric_util.increment("aws.ec2.darwin.status_poller.job.failures")
        DarwinSlackAlert().cluster_error(cluster.cluster_id, cluster.cluster_name, err, tb)
