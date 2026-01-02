import asyncio
import time
from datetime import datetime, timedelta
from functools import lru_cache
from typing import Dict, List

import shortuuid
from dateutil.tz import gettz
from loguru import logger

from compute_app_layer.models.log_central_pod_config import LogCentralPodConfig
from compute_app_layer.models.request.cluster_search import Filter
from compute_core.constant.config import Config
from compute_core.constant.constants import (
    HTTP,
    HTTPS,
    ResourceType,
    CLOUD_ENV_CONFIG_KEY_DEFAULT,
    CLOUD_ENV_CONFIG_KEY_JOB,
    CLOUD_ENV_CONFIG_KEY_REMOTE_KERNEL,
)
from compute_core.dao.runtime_dao import RuntimeDao, RuntimeV2Dao
from compute_core.dto.cluster_resource_dto import RayClusterResourceDTO
from compute_core.dto.maven_dto import MavenLibrary
from compute_model.cluster_status import UIClusterStatusMapping, ClusterStatus
from compute_model.gpu_node import GPUNodeEnum
from compute_model.ray_start_params import RayStartParams
from compute_core.dto.node_selector_dto import NodeSelector

import re


def add_list_to_query(query: str, query_list: list) -> str:
    if len(query_list) > 1:
        query = query + str(tuple(query_list))
    else:
        query = query + str(tuple(query_list)).replace(",)", ")")

    return query


def format_maven_response(maven_resp: List[Dict[str, str]], num_found: int) -> MavenLibrary:

    packages = [
        {"group_id": item["g"], "artifact_id": item["a"], "version": item["latestVersion"]} for item in maven_resp
    ]

    return MavenLibrary(result_size=num_found, packages=packages)


def is_valid_email(email: str) -> bool:
    # Define the regex pattern for a basic email validation
    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    # Check if the email matches the basic pattern
    if not re.match(email_pattern, email):
        return False

    return True


def urljoin(*urls, https: bool = False) -> str:
    """
    Join all the urls without focusing on / at the end or start
    :params *urls: all the urls in sequence
    :params https: If url starts with https://
    :returns: concatenated url
    """
    final_url = ""
    if urls[0].startswith(HTTP) or urls[0].startswith(HTTPS):
        final_url += urls[0]
        urls = urls[1:]
    else:
        final_url += HTTPS if https else HTTP
    for url in urls:
        if final_url.endswith("/") and url.startswith("/"):
            final_url += url[1:]
        elif final_url.endswith("/") or url.startswith("/"):
            final_url += url
        else:
            final_url += "/" + url
    return final_url


def get_random_id(prefix: str = "id-"):
    shortuuid.set_alphabet("23456789abcdefghijkmnopqrstuvwxyz")
    rand_id = prefix + shortuuid.random()[:16]
    return rand_id


# TODO: Hardcoded timezone "Asia/Kolkata" - should be configurable or use UTC consistently
def get_ist_time():
    timestamp = datetime.now(tz=gettz("Asia/Kolkata"))
    timestamp = timestamp.replace(tzinfo=None).isoformat(timespec="seconds")
    return timestamp


# TODO: get_utc_time() doesn't actually return UTC - datetime.now() returns local time without timezone
def get_utc_time():
    timestamp = datetime.now()
    timestamp = timestamp.replace(tzinfo=None).isoformat(timespec="seconds")
    return timestamp


def get_run_id():
    random_id = get_random_id("run_id-")
    return random_id


def retry_with_exponential_backoff(retries: int = 3, delay: float = 0.1, backoff: float = 2.0):
    """
    Retry decorator with exponential backoff for both sync and async functions
    :param retries: Number of retries
    :param delay: Initial delay in seconds
    :param backoff: Backoff multiplier
    :return: Decorator function
    """

    def decorator(func):
        def sync_wrapper(*args, **kwargs):
            for attempt in range(retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries - 1:  # Last attempt
                        raise
                    time.sleep(delay * (backoff**attempt))

        async def async_wrapper(*args, **kwargs):
            for attempt in range(retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries - 1:  # Last attempt
                        raise
                    await asyncio.sleep(delay * (backoff**attempt))

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# TODO: This function assumes the date is UTC but doesn't validate - could produce incorrect timestamps
def serialize_date(date) -> str:
    """
    :param date: datetime
    :return: Date in ISO 8601 format
    """
    date = str(date)
    return date.replace(" ", "T") + "Z"


def events_mapper(events: list):
    mapped_events = []
    for event in events:
        obj = {"timestamp": event["updated_at"], "event_name": event["action"], "event_description": event["message"]}
        mapped_events.append(obj)
    return mapped_events


def list_action_groups_mapper(runtime_obj: dict, events: list):
    mapped_events = events_mapper(events)
    action_group = {
        "cluster_runtime_id": runtime_obj["cluster_runid"],
        "count_of_events": runtime_obj["event_count"],
        "first_event": mapped_events[1],
        "last_event": mapped_events[0],
    }
    return action_group


def remove_empty_filters(filters: dict[str, list[str]]) -> dict[str, list[str]]:
    """
    :param filters: dict of list of filters
    :return: dict of list of filters with empty filters removed
    """
    processed_filters = {}
    for filter_field, filter_values in filters.items():
        if len(filter_values):
            processed_filters[filter_field] = filter_values
    return processed_filters


def get_backend_status_from_ui_status(ui_status: list[str]) -> list[str]:
    """
    :param ui_status: list of statuses of the cluster from ui
    :return: list of equivalent statuses mapped in the backend
    """
    if not ui_status:
        return []

    processed_statuses = []
    for status in ui_status:
        processed_statuses.extend(UIClusterStatusMapping[status].value)
    processed_statuses = [status.value for status in processed_statuses]
    return processed_statuses


def get_ui_status_from_backend_status(cluster_status: list[str]) -> list[str]:
    """
    :param cluster_status: list of statuses of the cluster from backend
    :return: list of equivalent statuses mapped in the UI
    """
    if not cluster_status:
        return []

    processed_statuses = []

    for status in cluster_status:
        ui_status = UIClusterStatusMapping.get_status(ClusterStatus[status])
        if ui_status not in processed_statuses:
            processed_statuses.append(ui_status)
    return processed_statuses


def process_filters(filters: Dict[str, List]) -> Dict[str, List]:
    if "status" in filters:
        filters["status"] = get_backend_status_from_ui_status(filters["status"])
    processed_filters = remove_empty_filters(filters)
    return processed_filters


def process_filters_v2(filters: Dict[str, Filter]) -> Dict[str, Filter]:
    if "status" in filters:
        filters["status"].values = get_backend_status_from_ui_status(filters["status"].values)
    processed_filters = {}
    for filter_field, filter_values in filters.items():
        # Keep filters that have explicit values
        has_values = bool(filter_values.values)

        # Also keep filters where select_all is True and a non-empty query is provided
        has_select_all_query = bool(getattr(filter_values, "select_all", False) and getattr(filter_values, "query", ""))

        if has_values or has_select_all_query:
            processed_filters[filter_field] = filter_values
    return processed_filters


def get_image_details(runtime, env):
    image = RuntimeDao(env).get_runtime_image(runtime)
    last_colon = image.rfind(":")
    repository = image[:last_colon]
    tag = image[last_colon + 1 :]
    return repository, tag


def get_runtime_details(env, runtime):
    runtime_details = RuntimeV2Dao(env).get_runtime_by_name(runtime)
    return runtime_details


def get_update_head_group_init_args(init_args, ray_start_params: RayStartParams, head_node_memory: int):
    init_args["num-cpus"] = f"{ray_start_params.num_cpus_on_head}"
    init_args["num-gpus"] = f"{ray_start_params.num_gpus_on_head}"
    object_store_memory = int((ray_start_params.object_store_memory_perc * head_node_memory / 100) * 1024 * 1024 * 1024)
    init_args["object-store-memory"] = f"{object_store_memory}"

    return init_args


def set_handler_status(handler_name: str, handler_state: str, step_status_list: list):
    step_status_list.append({"name": handler_name, "status": handler_state})
    return step_status_list


def update_gpu_node_selector(group: dict, gpu_type: str):
    group["nodeSelector"] = {}
    group["nodeSelector"]["app"] = "gpu-v1"
    if gpu_type == GPUNodeEnum.NVIDIA_A100_40GB.value:
        group["nodeSelector"]["karpenter.k8s.aws/instance-family"] = "p4d"
    elif gpu_type == GPUNodeEnum.NVIDIA_A100_80GB.value:
        group["nodeSelector"]["karpenter.k8s.aws/instance-family"] = "p5"
    elif gpu_type == GPUNodeEnum.NVIDIA_A10.value:
        group["nodeSelector"]["karpenter.k8s.aws/instance-family"] = "g5"
    elif gpu_type == GPUNodeEnum.NVIDIA_T4.value:
        group["nodeSelector"]["karpenter.k8s.aws/instance-family"] = "g4dn"


def add_gcp_image_cache_selector(group: dict):
    group["nodeSelector"][
        f"cloud.google.com.node-restriction.kubernetes.io/gke-secondary-boot-disk-{Config().gcp_image_cache_id}"
    ] = f"CONTAINER_IMAGE_CACHE.{Config().gcp_project_id}"


def update_affinity(group: dict, placement_key: str):
    if "affinity" not in group:
        group["affinity"] = {}
    group["affinity"]["podAntiAffinity"] = {
        "requiredDuringSchedulingIgnoredDuringExecution": [
            {
                "labelSelector": {
                    "matchExpressions": [{"key": "darwin_resource", "operator": "NotIn", "values": [placement_key]}]
                },
                "topologyKey": "kubernetes.io/hostname",
            }
        ]
    }


def update_gcp_node_selector(group: dict, node_type: str, node_capacity_type: str, placement_key: str = None):
    group["nodeSelector"] = {}

    group["nodeSelector"]["cloud.google.com/compute-class"] = f"common"
    if not node_capacity_type:
        group["nodeSelector"]["cloud.google.com/compute-class"] += f"-ondemand"
    else:
        group["nodeSelector"]["cloud.google.com/compute-class"] += f"-{node_capacity_type}"

    if placement_key:
        update_affinity(group, placement_key)
    # add_gcp_image_cache_selector(group)


def add_gcp_node_toleration(group, node_type, node_capacity_type):
    group["tolerations"] = []
    node_capacity_type = "ondemand" if not node_capacity_type else node_capacity_type
    group["tolerations"].append(
        {
            "key": "cloud.google.com/compute-class",
            "value": f"common-{node_capacity_type}",
            "operator": "Equal",
            "effect": "NoSchedule",
        }
    )


def get_log_central_pod_annotation(log_central_pod_config: LogCentralPodConfig):
    """
    Get log central pod annotation
    """
    return (
        f"ad.datadoghq.com/{log_central_pod_config.container_name}.logs",
        f'[{{"source": "{log_central_pod_config.source}", "service": "{log_central_pod_config.service_name}"}}]',
    )


def add_custom_annotation(group, key: str, value):
    """
    Add custom annotation in the group
    group: dict
    key: str
    """
    if "annotations" not in group:
        group["annotations"] = {}
    group["annotations"][key] = value


def get_node_preferred_scheduling():
    return {
        "preferredDuringSchedulingIgnoredDuringExecution": [
            {
                "weight": 80,
                "preference": {
                    "matchExpressions": [{"key": "karpenter.sh/capacity-type", "operator": "In", "values": ["spot"]}]
                },
            },
            {
                "weight": 60,
                "preference": {
                    "matchExpressions": [
                        {"key": "karpenter.sh/capacity-type", "operator": "In", "values": ["ondemand"]}
                    ]
                },
            },
        ]
    }


def add_node_selector(resource, node_selectors: list[NodeSelector]):
    if "nodeSelector" not in resource:
        resource["nodeSelector"] = {}

    for node_selector in node_selectors:
        resource["nodeSelector"][node_selector.name] = node_selector.value


def is_gcp_cluster(env: str):
    return "gcp" in env


def default_events(all_events: list, default_cluster_events: set) -> list[dict]:
    event_list = []
    for event in all_events:
        current_event = {"event": event, "default": False}
        if event in default_cluster_events:
            current_event["default"] = True

        event_list.append(current_event)
    return event_list


def calculate_active_resource(nodes: list) -> RayClusterResourceDTO:
    total_cores = total_cpu_utilization = memory_used = memory_total = 0
    nodes_len = len(nodes)
    for node in nodes:
        if "cpu" in node:
            total_cores += node["cpus"][0]
            total_cpu_utilization += (node["cpu"]) * (node["cpus"][0])
            memory_used += node["mem"][3]
            memory_total += node["mem"][0]
        else:
            nodes_len -= 1
    return RayClusterResourceDTO(
        cores_used=int(round(total_cpu_utilization / total_cores, 0)) if total_cores else 0,
        memory_used=int(round(memory_used / memory_total, 2) * 100) if memory_total else 0,
    )


def calculate_total_resources(head_node: dict, worker_groups: dict):
    head_node_cores = head_node["node"]["cores"]
    head_node_memory = head_node["node"]["memory"]

    worker_group_cores = 0
    worker_group_memory = 0
    for w in worker_groups:
        worker_group_cores += w["node"]["cores"] * w["max_pods"]
        worker_group_memory += w["node"]["memory"] * w["max_pods"]

    return {"total_cores": head_node_cores + worker_group_cores, "total_memory": head_node_memory + worker_group_memory}


def add_volume(group, volume: dict):
    if "volumes" not in group:
        group["volumes"] = []
    group["volumes"].append(volume)
    return group


def add_volume_mount(group, volume_mount: dict):
    if "volumeMounts" not in group:
        group["volumeMounts"] = []
    group["volumeMounts"].append(volume_mount)
    return group


# TODO: LRU cache with DAO parameter means cache won't work correctly - DAO is unhashable
@lru_cache(maxsize=150)
def generate_ray_cluster_dashboard_url(cluster_id: str, datadog_host: str, dashboard_id: str, dao):
    start_time, end_time = dao.get_cluster_last_started_at(cluster_id), dao.get_cluster_last_stopped_at(cluster_id)
    logger.info(f"start_time_: {start_time}, end_time: {end_time} for cluster_id: {cluster_id}")
    # TODO: Magic number 6 hours fallback should be configurable
    if not start_time or not end_time or start_time > end_time:
        start_time = datetime.now() - timedelta(hours=6)
        end_time = datetime.now()
    from_ts = int(start_time.timestamp()) * 1000 if start_time else ""
    to_ts = int(end_time.timestamp()) * 1000 if end_time else ""
    return urljoin(
        datadog_host,
        "dashboard",
        "{}?fromUser=false&refresh_mode=paused&tpl_var_darwin_cluster_id%5B0%5D={}&from_ts={}&to_ts={}&live=false".format(
            dashboard_id, cluster_id, from_ts, to_ts
        ),
        https=True,
    )


def add_eks_tolerations(group: dict):
    if "tolerations" not in group:
        group["tolerations"] = []
    group["tolerations"].extend(
        [
            # Tolerate Cilium not-ready nodes
            {"key": "node.cilium.io/agent-not-ready", "operator": "Equal", "value": "true", "effect": "NoExecute"},
            # Tolerate Karpenter disrupted nodes
            {"key": "karpenter.sh/disrupted", "operator": "Exists", "effect": "NoSchedule"},
        ]
    )


def get_resource_type_config_key(resource_type: ResourceType) -> str:
    """
    Get the configuration key for the given resource type.
    :param resource_type: ResourceType enum value
    :return: Configuration key as a string
    """
    key = CLOUD_ENV_CONFIG_KEY_DEFAULT
    if resource_type == ResourceType.JOB_CLUSTER:
        key = CLOUD_ENV_CONFIG_KEY_JOB
    elif resource_type == ResourceType.REMOTE_KERNEL:
        key = CLOUD_ENV_CONFIG_KEY_REMOTE_KERNEL

    return key
