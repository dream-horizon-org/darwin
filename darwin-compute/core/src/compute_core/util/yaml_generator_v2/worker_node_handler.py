import copy
from random import randint

from compute_app_layer.models.log_central_pod_config import LogCentralPodConfig
from compute_core.constant.constants import KubeCluster, WORKSPACE_MOUNT_PATH
from compute_core.dto.pod_label_dto import PodLabel
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.utils import (
    set_handler_status,
    update_gpu_node_selector,
    update_gcp_node_selector,
    add_gcp_node_toleration,
    add_node_selector,
    update_affinity,
    add_custom_annotation,
    get_log_central_pod_annotation,
    add_eks_tolerations,
)
from compute_core.util.yaml_generator import (
    add_ondemand_resource,
    update_karpenter_node_selector,
    add_annotation,
    add_volume_mount,
    update_worker_group_ray_start_params,
    add_spot_resource,
)
from compute_core.util.yaml_generator_v2.base_class import ConfigHandler
from compute_core.util.yaml_generator_v2.head_node_handler import add_pod_label
from compute_model.compute_cluster import ComputeClusterDefinition
from compute_core.dto.node_selector_dto import NodeSelector
from compute_model.worker_group import WorkerGroup


def add_log_central_worker_pod_annotation(worker_group, compute_request: ComputeClusterDefinition):
    add_custom_annotation(
        worker_group,
        *get_log_central_pod_annotation(
            LogCentralPodConfig(
                container_name="ray-worker",
                service_name=f"{compute_request.cluster_id}-ray-worker",
                source="ray-worker",
            )
        ),
    )


def add_pod_affinity(worker_group, compute_request: ComputeClusterDefinition):
    """
    Adds pod affinity to the worker group based on the compute request.
    This is used to ensure that worker pods are scheduled on nodes with specific labels.
    """
    if "podAffinity" not in worker_group["affinity"]:
        worker_group["affinity"]["podAffinity"] = {"preferredDuringSchedulingIgnoredDuringExecution": []}

    worker_group["affinity"]["podAffinity"]["preferredDuringSchedulingIgnoredDuringExecution"].append(
        {
            "weight": 100,
            "podAffinityTerm": {
                "labelSelector": {
                    "matchExpressions": [
                        {"key": "app.kubernetes.io/instance", "operator": "In", "values": [compute_request.cluster_id]}
                    ],
                },
                "topologyKey": "kubernetes.io/hostname",
            },
        }
    )


class WorkerNodeUpdateHandler(ConfigHandler):
    """
    Handler to update worker node configuration for the yaml generator v2
    """

    kube_cluster: KubeCluster

    def update_worker(self, worker_group, wg_value: WorkerGroup, compute_request: ComputeClusterDefinition):
        worker_group["replicas"] = wg_value.min_pods
        worker_group["minReplicas"] = wg_value.min_pods
        worker_group["maxReplicas"] = wg_value.max_pods

        ray_start_params = compute_request.advance_config.ray_start_params

        update_worker_group_ray_start_params(worker_group["rayStartParams"], ray_start_params, wg_value.node.memory)

        if wg_value.node_type == "gpu":
            # Update NodeSelectors in accordance with GPU Node
            update_gpu_node_selector(worker_group, wg_value.node.name)
            add_eks_tolerations(worker_group)
        else:
            if self.kube_cluster == KubeCluster.GCP:
                # If GCP cluster but not GPU node, update NodeSelectors in accordance with GCP Cluster with NPC
                darwin_resource = "ray-cluster-job" if compute_request.is_job_cluster else "ray-cluster-all-purpose"
                update_gcp_node_selector(
                    worker_group, wg_value.node_type, wg_value.node.node_capacity_type, darwin_resource
                )
                update_affinity(worker_group, darwin_resource)
                add_gcp_node_toleration(worker_group, wg_value.node_type, wg_value.node.node_capacity_type)
                add_pod_label(worker_group, [PodLabel("darwin_resource", darwin_resource)])
            # else:
            #     if compute_request.is_job_cluster:
            #         update_karpenter_node_selector(
            #             worker_group, wg_value.node_type, wg_value.node.node_capacity_type, compute_request.cloud_env
            #         )
            #         add_node_selector(worker_group, [NodeSelector("darwin.dream11.com/resource", "ray-cluster-job")])
            #
            #     else:
            #         update_karpenter_node_selector(
            #             worker_group, wg_value.node_type, wg_value.node.node_capacity_type, compute_request.cloud_env
            #         )
            #         add_node_selector(
            #             worker_group, [NodeSelector("darwin.dream11.com/resource", "ray-cluster-all-purpose")]
            #         )
            #
            #     add_eks_tolerations(worker_group)

            # add_annotation(worker_group, self.kube_cluster)

            if wg_value.node.node_capacity_type == "ondemand":
                add_ondemand_resource(worker_group)
            else:
                add_spot_resource(worker_group)

        if compute_request.labels.get("workspace") == "shared":
            workspace_claim_name = f"fsx-claim-{randint(0, 19)}"
            add_volume_mount("persistent-storage", workspace_claim_name, WORKSPACE_MOUNT_PATH, worker_group)
        
        # add_log_central_worker_pod_annotation(worker_group, compute_request)
        # add_pod_affinity(worker_group, compute_request)

        return worker_group

    def update_additional_worker_groups(self, values, compute_request: ComputeClusterDefinition):
        worker_node_list = compute_request.worker_group[1:]

        additional_wg = values["additionalWorkerGroups"]["wg1"]
        additional_wg["disabled"] = False
        values["additionalWorkerGroups"].clear()

        if len(worker_node_list) > 0:
            for i in range(len(worker_node_list)):
                additional_wg_i = copy.deepcopy(additional_wg)
                additional_wg_i = self.update_worker(additional_wg_i, worker_node_list[i], compute_request)
                wg_name = "wg" + str(i + 1)
                values["additionalWorkerGroups"][wg_name] = additional_wg_i
        else:
            values.pop("additionalWorkerGroups")

    def handle(
        self,
        values: dict,
        compute_request: ComputeClusterDefinition,
        env: str,
        step_status_list: list,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        self.kube_cluster = KubeCluster(compute_request.cloud_env)

        if compute_request.worker_group and len(compute_request.worker_group) > 0:
            worker_group = compute_request.worker_group[0]
            worker_group_values = values["worker"]
            self.update_worker(worker_group_values, worker_group, compute_request)
        else:
            values["worker"].clear()
            values["worker"]["disabled"] = True
            values["head"]["enableInTreeAutoscaling"] = False

        self.update_additional_worker_groups(values, compute_request)
        step_status_list = set_handler_status("worker_node_handler", "SUCCESS", step_status_list)
        return super().handle(values, compute_request, env, step_status_list, remote_commands)
