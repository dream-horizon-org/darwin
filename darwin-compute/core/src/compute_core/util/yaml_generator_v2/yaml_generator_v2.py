import importlib.resources as pkg_resource
import io
import json

import yaml
from loguru import logger

import compute_core.util.resources as rs
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.yaml_generator_v2.addition_yaml_values_handler import AdditionalYamlValuesHandler
from compute_core.util.yaml_generator_v2.disk_handler import DiskHandler
from compute_core.util.yaml_generator_v2.env_handler import EnvVariablesUpdateHandler
from compute_core.util.yaml_generator_v2.head_node_handler import HeadNodeUpdateHandler
from compute_core.util.yaml_generator_v2.image_handler import ImageUpdateHandler
from compute_core.util.yaml_generator_v2.long_running_cluster_handler import LongRunningClusterHandler
from compute_core.util.yaml_generator_v2.monitoring_handler import MonitoringHandler
from compute_core.util.yaml_generator_v2.remote_command_handler import RemoteCommandHandler
from compute_core.util.yaml_generator_v2.resource_handler import ResourceUpdateHandler
from compute_core.util.yaml_generator_v2.rss_handler import RssHandler
from compute_core.util.yaml_generator_v2.service_account_handler import ServiceAccountHandler
from compute_core.util.yaml_generator_v2.worker_node_handler import WorkerNodeUpdateHandler
from compute_core.util.yaml_generator_v2.zone_handler import ZoneHandler
from compute_model.compute_cluster import ComputeClusterDefinition

# TODO: Global handler chain initialization - consider using a factory pattern for better testability
image_handler = ImageUpdateHandler()
resource_handler = ResourceUpdateHandler()
env_handler = EnvVariablesUpdateHandler()
head_node_handler = HeadNodeUpdateHandler()
worker_node_handler = WorkerNodeUpdateHandler()
rss_handler = RssHandler()
additional_values_handler = AdditionalYamlValuesHandler()
zone_handler = ZoneHandler()
long_running_cluster_handler = LongRunningClusterHandler()
service_account_handler = ServiceAccountHandler()
monitoring_handler = MonitoringHandler()
remote_command_handler = RemoteCommandHandler()
disk_handler = DiskHandler()

# TODO: Handler chain order is implicit and fragile - consider using explicit registration or configuration
head_node_handler.set_next(service_account_handler)
service_account_handler.set_next(worker_node_handler)
worker_node_handler.set_next(image_handler)
image_handler.set_next(resource_handler)
resource_handler.set_next(env_handler)
env_handler.set_next(additional_values_handler)
additional_values_handler.set_next(rss_handler)
rss_handler.set_next(zone_handler)
zone_handler.set_next(monitoring_handler)
monitoring_handler.set_next(remote_command_handler)
remote_command_handler.set_next(long_running_cluster_handler)
long_running_cluster_handler.set_next(disk_handler)


def create_yaml_v2(
    compute_request: ComputeClusterDefinition, remote_commands: list[RemoteCommandDto] = None, env: str = "stag"
):
    """
    :param compute_request: ComputeClusterDefinition
    :param remote_commands: list[RemoteCommandDto]
    :param env: str
    :return: YAML
    """
    # TODO: Simple string replacement for CLUSTER_ID is fragile - use proper templating
    with pkg_resource.open_text(rs, "values.yaml") as stream:
        stream = stream.read().replace("CLUSTER_ID", compute_request.cluster_id)
        values = yaml.safe_load(stream)

    logger.debug(f"Initial Values.yaml for {compute_request.cluster_id}: {values}")
    step_status_list = []
    final_values = head_node_handler.handle(values, compute_request, env, step_status_list, remote_commands)
    logger.debug(f"Yaml generated for cluster {compute_request.cluster_id} with step : {step_status_list}")
    logger.debug(f"YAML file generated for {compute_request.cluster_id}: {values}")
    new_file = io.StringIO(json.dumps(final_values, ensure_ascii=False))

    return new_file, final_values
