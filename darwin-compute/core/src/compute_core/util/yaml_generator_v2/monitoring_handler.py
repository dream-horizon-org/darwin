from compute_core.constant.constants import CONFIGS_MAP
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.utils import set_handler_status, is_gcp_cluster
from compute_core.util.yaml_generator_v2.base_class import ConfigHandler
from compute_model.compute_cluster import ComputeClusterDefinition


class MonitoringHandler(ConfigHandler):
    """
    This class is responsible for updating the prometheus and grafana values in the yaml file
    """

    @staticmethod
    def _update_prometheus_node_selector(values: dict, compute_request: ComputeClusterDefinition, env: str) -> None:
        if is_gcp_cluster(compute_request.cloud_env):
            values["prometheus"]["nodeSelector"] = {"cloud.google.com/compute-class": "darwin-default"}
        if env == "darwin-local":
            values["prometheus"]["nodeSelector"] = {}

    def _update_prometheus_values(self, values: dict, compute_request: ComputeClusterDefinition, env: str) -> None:
        """
        This function updates the prometheus values in the yaml file
        """
        values["prometheus"]["replicas"] = 1
        values["prometheus"]["remoteWrite"][0]["url"] = CONFIGS_MAP[env]["thanos_remote_write_url"]
        self._update_prometheus_node_selector(values, compute_request, env)

    def _update_grafana_values(self, values: dict, compute_request: ComputeClusterDefinition, env: str) -> None:
        """
        This function updates the grafana values in the yaml file
        """
        # Grafana Image value is updated in image_handler.py
        values["grafana"]["rootPath"] = f"/{compute_request.cloud_env}/{compute_request.cluster_id}-metrics/"
        if is_gcp_cluster(compute_request.cloud_env):
            values["grafana"]["nodeSelector"] = {"cloud.google.com/compute-class": "darwin-default"}
        if env == "darwin-local":
            values["grafana"]["nodeSelector"] = {}
        values["grafana"]["domain"] = CONFIGS_MAP[env]["host_url"]

    def handle(
        self,
        values: dict,
        compute_request: ComputeClusterDefinition,
        env: str,
        step_status_list: list,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        self._update_prometheus_values(values, compute_request, env)
        self._update_grafana_values(values, compute_request, env)
        step_status_list = set_handler_status("monitoring_handler", "SUCCESS", step_status_list)
        return super().handle(values, compute_request, env, step_status_list, remote_commands)
