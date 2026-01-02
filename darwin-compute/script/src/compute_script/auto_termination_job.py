import traceback

from loguru import logger

from compute_app_layer.routers.dependency_cache import get_library_manager
from compute_core.compute import Compute
from compute_core.dao.cluster_dao import ClusterDao
from compute_core.dto.chronos_dto import ChronosEvent
from compute_core.util.utils import serialize_date
from compute_model.policy_definition import PolicyDefinition
from compute_script.constant.event_states import AutoTerminationState
from compute_script.dto.cluster_info import ClusterInfo
from compute_script.dto.cluster_metadata import ClusterMetadata
from compute_script.dto.policy_factory import DefaultPolicyFactory
from compute_script.util.darwin_slack_alert import DarwinSlackAlert
from compute_script.util.recent_activity import recent_activity

# TODO: Default policies should be configurable via environment or config file
DEFAULT_POLICIES = [
    PolicyDefinition("JupyterLabActivity"),
    PolicyDefinition("ClusterCPUUsage"),
    PolicyDefinition("ActiveRayJob"),
]


class ClusterActivity:
    def __init__(self, cluster_id: str):
        compute = Compute()
        cluster_details = compute.get_cluster(cluster_id)
        dashboards = compute.get_internal_dashboards(cluster_id)
        self.cluster_data = ClusterInfo(
            cluster_id=cluster_id,
            dashboard_link=dashboards["ray_dashboard_url"],
            jupyter_link=dashboards["jupyter_lab_url"],
        )
        self.cluster_name = cluster_details.name
        self.policies = DefaultPolicyFactory().get_policies(
            cluster_details.auto_termination_policies
            if hasattr(cluster_details, "auto_termination_policies")
            else DEFAULT_POLICIES
        )
        self.dao = ClusterDao()

    def current_activity(self) -> bool:
        """
        Checks if activity in cluster according to given policies
        :return:
            true: Recent activity in Cluster
            false: No Recent activity in Cluster
        """
        # TODO: Policies are checked sequentially - consider parallel checks for independent policies
        logger.info(f"{self.cluster_data.cluster_id} with cluster name {self.cluster_name} has {self.policies}")
        for policy in self.policies:
            logger.debug(f"{self.cluster_data.cluster_id} - Checking {policy.policy_name}")
            if policy.apply_if_enabled(self.cluster_data):
                logger.debug(f"{self.cluster_data.cluster_id} - Activity due to {policy.policy_name}")
                return True
            else:
                logger.debug(f"{self.cluster_data.cluster_id} - No Activity due to {policy.policy_name}")
        return False

    def update_last_usage(self) -> bool:
        logger.debug(f"{self.cluster_data.cluster_id} - Updating Last Usage Time")
        if self.current_activity():
            self.dao.update_last_used_time(self.cluster_data.cluster_id)
            logger.debug(f"{self.cluster_data.cluster_id} - Cluster Last Usage Time Updated")
            return True
        return False


# TODO: Consider using dependency injection instead of instantiating Compute() in constructor
class ClusterAutoTermination:
    def __init__(self, cluster_id: str):
        self.id = cluster_id
        self.compute = Compute()
        self.lib_manager = get_library_manager()
        # TODO: Multiple API calls in constructor - consider lazy loading or passing pre-fetched data
        cluster_details = self.compute.get_cluster(cluster_id)
        self.expiry_time = cluster_details.terminate_after_minutes
        self.name = cluster_details.name
        cluster_metadata = self.compute.get_cluster_metadata(cluster_id)
        self.last_usage_time = serialize_date(cluster_metadata["last_used_at"])
        self.artifact_id = cluster_metadata["artifact_id"]
        self.active_cluster_runid = cluster_metadata["active_cluster_runid"]
        self._slack_alert = DarwinSlackAlert()

    def stop_unused_cluster(self):
        logger.debug(f"{self.id} - Terminating Cluster {self.name} due to Inactivity")
        self.compute.stop(self.id, user="Auto Termination Script")
        self.lib_manager.delete_uninstalled_library(self.id)
        self.lib_manager.update_running_libraries_to_created(self.id)
        self._slack_alert.cluster_termination(self.id, self.name, self.last_usage_time)
        event = ChronosEvent(
            cluster_id=self.id,
            event_type=AutoTerminationState.AUTO_TERMINATED.name,
            message="Cluster terminated due to inactivity",
        )
        self.compute.send_event(event)
        logger.info(f"{self.id} - Cluster {self.name} Terminated")

    def auto_terminate(self):
        if self.expiry_time == -1:
            logger.debug(f"{self.id} - Auto Termination is off for {self.name} cluster")
            return
        if not recent_activity(self.last_usage_time, self.expiry_time):
            logger.info(f"{self.id} - Last Activity more than {self.expiry_time} minutes ago")
            self.stop_unused_cluster()


def auto_termination_job(cluster: ClusterMetadata):
    # TODO: Creating new ClusterActivity and ClusterAutoTermination instances per call is expensive - consider caching
    try:
        if not ClusterActivity(cluster.cluster_id).update_last_usage():
            ClusterAutoTermination(cluster.cluster_id).auto_terminate()
    except Exception as err:
        tb = traceback.format_exc()
        logger.error(f"Error in Auto Termination Job of {cluster.cluster_id} - {err} - {tb}")
        DarwinSlackAlert().cluster_error(cluster.cluster_id, cluster.cluster_name, err, tb)
