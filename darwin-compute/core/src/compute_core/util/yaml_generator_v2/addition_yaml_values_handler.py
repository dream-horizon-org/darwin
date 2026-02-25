from compute_core.constant.constants import KubeCluster
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.utils import set_handler_status
from compute_core.util.yaml_generator import update_spark_config
from compute_core.util.yaml_generator_v2.base_class import ConfigHandler
from compute_model.compute_cluster import ComputeClusterDefinition
from compute_core.constant import constants


class AdditionalYamlValuesHandler(ConfigHandler):
    """
    This class is responsible for adding additional values to the yaml file
    """

    def handle(
        self,
        values: dict,
        compute_request: ComputeClusterDefinition,
        env: str,
        step_status_list: list,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        cloud_env = compute_request.cloud_env
        values["user"] = compute_request.user.split("@")[0]  # fetching only local part of email because of k8s naming
        values["email"] = compute_request.user
        values["cluster_name"] = compute_request.name
        values["cluster_type"] = "job_cluster" if compute_request.is_job_cluster else "all_purpose_cluster"
        values["kube_cluster_key"] = cloud_env
        values["commands"] = compute_request.advance_config.init_script

        update_spark_config(
            values, compute_request.advance_config.spark_config, compute_request.cluster_id, cloud_env, env
        )

        # Labels Handling
        values["labels"] = compute_request.labels

        step_status_list = set_handler_status("additional_yaml_values_handler", "SUCCESS", step_status_list)
        return super().handle(values, compute_request, env, step_status_list, remote_commands)
