from compute_core.constant.constants import KubeCluster
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.utils import set_handler_status, get_image_details
from compute_core.util.yaml_generator_v2.base_class import ConfigHandler
from compute_model.compute_cluster import ComputeClusterDefinition


def cloud_image_handler(values, compute_request):
    if compute_request.cloud_env == KubeCluster.GCP.value:
        values["image"]["repository"] = "gcr.io/d11-causality/ray-images"
        values["grafana"]["image"] = "gcr.io/d11-causality/darwin:grafana"
    elif compute_request.cloud_env == KubeCluster.KIND_0.value:
        values["grafana"]["image"] = "docker.io/grafana/grafana:latest"


class ImageUpdateHandler(ConfigHandler):
    """
    This class is responsible for updating the image in the yaml file for the cluster
    """

    def handle(
        self,
        values: dict,
        compute_request: ComputeClusterDefinition,
        env: str,
        step_status_list: list,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        values["image"]["repository"], values["image"]["tag"] = get_image_details(compute_request.runtime, env)

        cloud_image_handler(values, compute_request)
        step_status_list = set_handler_status("image_handler", "SUCCESS", step_status_list)
        return super().handle(values, compute_request, env, step_status_list, remote_commands)
