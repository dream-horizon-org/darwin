import traceback

from loguru import logger

from compute_app_layer.routers.dependency_cache import get_script_sql_dao
from compute_core.compute import Compute
from compute_core.constant.config import Config
from compute_model.cluster_status import UIClusterStatusMapping
from compute_script.auto_termination_job import auto_termination_job
from compute_script.dao.sql_dao import ScriptMySQLDao
from compute_script.dto.cluster_status_graph import ClusterStatus
from compute_script.remote_command_execution_status_update import remote_command_execution_status_update
from compute_script.status_poller_job import status_poller_job
from compute_script.jupyter_pods_management import add_jupyter_pod, auto_termination_jupyter
from compute_script.util.darwin_slack_alert import DarwinSlackAlert
from compute_script.util.custom_metrics import CustomMetrics


# TODO: Add distributed locking to prevent multiple instances from processing the same cluster
def run_job(custom_metric_util: CustomMetrics):
    try:
        dao: ScriptMySQLDao = get_script_sql_dao()
        cluster = dao.get_unpicked_cluster()
        if not cluster:
            return
        logger.debug(f"Cluster ID: {cluster.cluster_id}")

        custom_metric_util.increment("aws.ec2.darwin.status_poller.job.runs")
        logger.debug(f"Running status poller job for cluster_id: {cluster.cluster_id}")
        status: ClusterStatus = status_poller_job(cluster, custom_metric_util)
        logger.debug(f"Cluster status of cluster_id: {cluster.cluster_id}: {status}")
        custom_metric_util.increment("aws.ec2.darwin.status_poller.job.success")
        logger.debug(f"Status poller job successful")

        dao.update_cluster_last_updated_at(cluster.cluster_id)

        if status in UIClusterStatusMapping.active.value:
            auto_termination_job(cluster)

    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"Run job failed {e} - {tb}")
        DarwinSlackAlert().run_job_error(e, tb)
        custom_metric_util.increment("aws.ec2.darwin.run_job.job.failures")


def manage_jupyter_pods(compute: Compute, config: Config):
    """
    This function is used to manage jupyter pods
    :param compute: Compute: Compute object
    :param config: Config: Config object
    """
    add_jupyter_pod(compute, config)
    auto_termination_jupyter(compute, config)


def update_status_for_remote_command_execution(compute: Compute, config: Config):
    """
    This function is used to update the status of remote command execution
    :param compute: Compute object
    :param config: Config object
    """
    dao: ScriptMySQLDao = get_script_sql_dao()
    remote_command_execution_status_update(compute, dao, config)
