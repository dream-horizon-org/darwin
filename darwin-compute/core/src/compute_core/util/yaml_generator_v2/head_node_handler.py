from random import randint
from typing import List

from compute_app_layer.models.log_central_pod_config import LogCentralPodConfig
from compute_core.constant.constants import WORKSPACE_MOUNT_PATH, KubeCluster
from compute_core.dto.pod_label_dto import PodLabel
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.utils import (
    set_handler_status,
    update_gpu_node_selector,
    update_gcp_node_selector,
    add_gcp_node_toleration,
    add_custom_annotation,
    get_log_central_pod_annotation,
    add_node_selector,
    update_affinity,
    add_eks_tolerations,
)
from compute_core.util.yaml_generator import (
    update_karpenter_node_selector,
    add_volume_mount,
    add_annotation,
    update_head_group_ray_start_params,
)
from compute_core.util.yaml_generator_v2.base_class import ConfigHandler
from compute_model.compute_cluster import ComputeClusterDefinition
from compute_model.head_node import HeadNode
from compute_core.dto.node_selector_dto import NodeSelector
from compute_model.ray_start_params import RayStartParams


def add_log_central_head_annotation(head_group, compute_request: ComputeClusterDefinition):
    add_custom_annotation(
        head_group,
        *get_log_central_pod_annotation(
            LogCentralPodConfig(
                container_name="ray-head",
                service_name=f"{compute_request.cluster_id}-ray-head",
                source="ray-head",
            )
        ),
    )

    add_custom_annotation(
        head_group,
        *get_log_central_pod_annotation(
            LogCentralPodConfig(
                container_name="autoscaler",
                service_name=f"{compute_request.cluster_id}-autoscaler",
                source="ray-head",
            )
        ),
    )


def add_pod_label(group: dict, labels: List[PodLabel]):
    for label in labels:
        group["labels"][label.name] = label.value


def add_spark_ports(group: dict, from_port: int, to_port: int):
    for port in range(from_port, to_port):
        group["ports"].append({"containerPort": port, "name": f"spark{port}"})


def update_head_group(head_group, compute_request: ComputeClusterDefinition):
    hn_value: HeadNode = compute_request.head_node
    ray_start_params: RayStartParams = compute_request.advance_config.ray_start_params
    kube_cluster = KubeCluster(compute_request.cloud_env)

    update_head_group_ray_start_params(head_group["rayStartParams"], ray_start_params, hn_value.node.memory)
    # TODO: Cloud provider specific logic should be extracted into separate strategy classes
    if kube_cluster == KubeCluster.GCP:
        # If GCP cluster but not GPU node, update NodeSelectors in accordance with GCP Cluster with NPC
        darwin_resource = "ray-cluster-head-job" if compute_request.is_job_cluster else "ray-cluster-head"
        update_gcp_node_selector(head_group, hn_value.node_type, hn_value.node.node_capacity_type, darwin_resource)
        update_affinity(head_group, darwin_resource)
        add_gcp_node_toleration(head_group, hn_value.node_type, hn_value.node.node_capacity_type)
        add_pod_label(head_group, [PodLabel("darwin_resource", darwin_resource)])
    elif hn_value.node_type == "gpu":
        update_gpu_node_selector(head_group, hn_value.node.name)
        add_eks_tolerations(head_group)

    workspace_claim_name = f"fsx-claim-{randint(0, 19)}"
    add_volume_mount("persistent-storage", workspace_claim_name, WORKSPACE_MOUNT_PATH, head_group)
    # add_spark_ports(head_group, from_port=4041, to_port=4046)


class HeadNodeUpdateHandler(ConfigHandler):
    """
    Handler to update head node configuration for the yaml generator
    """

    def handle(
        self,
        values: dict,
        compute_request: ComputeClusterDefinition,
        env: str,
        step_status_list: list,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        head_group = values["head"]

        update_head_group(head_group, compute_request)
        step_status_list = set_handler_status("head_node_handler", "SUCCESS", step_status_list)
        return super().handle(values, compute_request, env, step_status_list, remote_commands)
