import json

from fastapi import APIRouter, Depends, Header

from compute_app_layer.controllers import (
    get_cluster_resources,
    create_cluster_controller,
    get_action_group_details_controller,
    get_action_groups_controller,
    get_cluster_dashboard_controller,
    get_cluster_metadata_controller,
    get_cluster_pods_controller,
    start_cluster_controller,
    stop_cluster_controller,
    restart_cluster_controller,
    update_and_restart_cluster_controller,
    update_cluster_name_controller,
    update_cluster_user_controller,
    force_update_cluster_controller,
    update_cluster_tags_controller,
    delete_cluster_controller,
)
from compute_app_layer.controllers.cluster import get_cluster_cost_controller
from compute_app_layer.controllers.cluster.labels.search_labels_controller import search_labels_controller
from compute_app_layer.controllers.cluster.labels.get_label_values_controller import get_label_values_controller
from compute_app_layer.controllers.cluster.search_v2_controller import search_v2_controller
from compute_app_layer.controllers.cluster.update_cloud_env_controller import update_cloud_env_controller
from compute_app_layer.controllers.cluster.get_cluster import get_head_node_ip_controller, get_cluster_controller
from compute_app_layer.controllers.get_job_clusters_used_before_days import get_job_clusters_used_before_days_controller
from compute_app_layer.controllers.remote_command.remote_command_execution_controller import (
    execute_command_on_cluster_controller,
    get_command_execution_status_controller,
    set_pod_command_execution_status_controller,
    add_remote_commands_to_cluster_controller,
    delete_remote_command_from_cluster_controller,
    get_cluster_remote_commands_controller,
)
from compute_app_layer.models import UpdateNameEntity, UpdateTagsEntity
from compute_app_layer.models.create_cluster import ClusterRequest
from compute_app_layer.models.remote_command.remote_command_request import (
    RemoteCommandRequest,
    PodCommandExecutionStatusReportRequest,
    AddRemoteCommandsRequest,
)
from compute_app_layer.models.request.cluster_search import SearchClusterRequest
from compute_app_layer.models.request.labels import LabelValuesRequest
from compute_app_layer.models.update_user import UpdateUserEntity
from compute_app_layer.routers.dependency_cache import get_compute, get_config, get_library_manager, get_remote_command
from compute_core.compute import Compute
from compute_core.constant.config import Config
from compute_core.remote_command import RemoteCommand
from compute_core.util.package_management.package_manager import LibraryManager
from compute_core.cluster_cost import PredictAPI

router = APIRouter(prefix="/cluster")


@router.get("/{cluster_id}")
async def get_cluster_details(cluster_id, compute: Compute = Depends(get_compute)):
    return await get_cluster_controller(compute=compute, cluster_id=cluster_id)


@router.get("/{cluster_id}/metadata")
async def get_cluster_metadata(cluster_id: str, compute: Compute = Depends(get_compute)):
    return await get_cluster_metadata_controller(compute=compute, cluster_id=cluster_id)


@router.get("/{cluster_id}/dashboards")
async def get_cluster_dashboards(cluster_id: str, internal: bool = False, compute: Compute = Depends(get_compute)):
    return await get_cluster_dashboard_controller(compute=compute, cluster_id=cluster_id, internal=internal)


@router.get("/{cluster_id}/pods")
async def get_cluster_pods(cluster_id: str, compute: Compute = Depends(get_compute)):
    return await get_cluster_pods_controller(compute=compute, cluster_id=cluster_id)


@router.post("")
async def create_cluster(
    request: ClusterRequest,
    compute: Compute = Depends(get_compute),
    config: Config = Depends(get_config),
    lib_manager: LibraryManager = Depends(get_library_manager),
    remote_command: RemoteCommand = Depends(get_remote_command),
    predict_api: PredictAPI = Depends(PredictAPI),
):
    return await create_cluster_controller(
        request=request,
        compute=compute,
        config=config,
        lib_manager=lib_manager,
        remote_command=remote_command,
        predict_api=predict_api,
    )


# TODO: Inconsistent user extraction logic - extract to a shared dependency or utility
@router.put("/{cluster_id}")
async def update_and_restart_cluster(
    cluster_id,
    request: ClusterRequest,
    msd_user: str = Header(None),
    compute: Compute = Depends(get_compute),
    remote_command: RemoteCommand = Depends(get_remote_command),
    lib_manager: LibraryManager = Depends(get_library_manager),
):
    try:
        # TODO: "user_not_passed" is a magic string - use a constant or None
        user = json.loads(msd_user)["email"] if msd_user else "user_not_passed"
    except (json.JSONDecodeError, KeyError):
        user = "user_not_passed"
    return await update_and_restart_cluster_controller(
        cluster_id=cluster_id,
        request=request,
        user=user,
        compute=compute,
        remote_command=remote_command,
        lib_manager=lib_manager,
    )


# TODO: Missing error handling for json.loads - will crash if msd_user is invalid JSON
@router.post("/start-cluster/{cluster_id}")
async def start_cluster(
    cluster_id,
    msd_user=Header(None),
    compute: Compute = Depends(get_compute),
    lib_manager: LibraryManager = Depends(get_library_manager),
    remote_command: RemoteCommand = Depends(get_remote_command),
):
    user = json.loads(msd_user)["email"]
    return await start_cluster_controller(
        compute=compute, cluster_id=cluster_id, user=user, lib_manager=lib_manager, remote_command=remote_command
    )


@router.post("/stop-cluster/{cluster_id}")
async def stop_cluster(
    cluster_id,
    msd_user=Header(None),
    compute: Compute = Depends(get_compute),
    lib_manager: LibraryManager = Depends(get_library_manager),
):
    user = json.loads(msd_user)["email"]
    return await stop_cluster_controller(compute=compute, cluster_id=cluster_id, user=user, lib_manager=lib_manager)


@router.post("/restart-cluster/{cluster_id}")
async def restart_cluster(
    cluster_id,
    msd_user=Header(None),
    compute: Compute = Depends(get_compute),
    lib_manager: LibraryManager = Depends(get_library_manager),
    remote_command: RemoteCommand = Depends(get_remote_command),
):
    user = json.loads(msd_user)["email"]
    return await restart_cluster_controller(
        compute=compute, cluster_id=cluster_id, user=user, lib_manager=lib_manager, remote_command=remote_command
    )


@router.delete("/{cluster_id}")
async def delete_cluster(cluster_id, compute: Compute = Depends(get_compute)):
    return await delete_cluster_controller(compute=compute, cluster_id=cluster_id)


@router.put("/update-name/{cluster_id}")
async def update_cluster_name(cluster_id, request: UpdateNameEntity, compute: Compute = Depends(get_compute)):
    return await update_cluster_name_controller(compute=compute, cluster_id=cluster_id, new_name=request.cluster_name)


@router.put("/user/{cluster_id}")
async def update_cluster_user(
    cluster_id, request: UpdateUserEntity, msd_user=Header(None), compute: Compute = Depends(get_compute)
):
    user = json.loads(msd_user)["email"]
    return await update_cluster_user_controller(
        compute=compute, cluster_id=cluster_id, new_user=request.cluster_user, user=user
    )


@router.put("/update-tags/{cluster_id}")
async def update_cluster_tags(cluster_id, request: UpdateTagsEntity, compute: Compute = Depends(get_compute)):
    return await update_cluster_tags_controller(compute=compute, cluster_id=cluster_id, new_tags=request.tags)


@router.put("/{cluster_id}/cloud-env/{cloud_env}")
async def update_cloud_env(
    cluster_id: str,
    cloud_env: str,
    msd_user=Header(None),
    compute: Compute = Depends(get_compute),
    remote_command: RemoteCommand = Depends(get_remote_command),
):
    user = json.loads(msd_user)["email"]
    return await update_cloud_env_controller(
        compute=compute, remote_command=remote_command, cluster_id=cluster_id, cloud_env=cloud_env, user=user
    )


@router.put("/force/{cluster_id}")
async def force_update_cluster(
    cluster_id, compute: Compute = Depends(get_compute), remote_command: RemoteCommand = Depends(get_remote_command)
):
    return await force_update_cluster_controller(compute=compute, cluster_id=cluster_id, remote_command=remote_command)


@router.get("/job/inactive")
async def get_job_cluster_last_used_days_before(
    offset: int = 0, limit: int = 1000, days: int = 30, compute: Compute = Depends(get_compute)
):
    return await get_job_clusters_used_before_days_controller(compute=compute, offset=offset, limit=limit, days=days)


@router.post("/cost/predict")
async def get_cluster_cost(request: ClusterRequest, predict_api: PredictAPI = Depends(PredictAPI)):
    return await get_cluster_cost_controller.get_cluster_cost(request=request, predict_api=predict_api)


@router.get("/{cluster_id}/resources")
async def cluster_resources(cluster_id: str, compute: Compute = Depends(get_compute)):
    return await get_cluster_resources(cluster_id, compute=compute)


@router.post("/{cluster_id}/command")
async def add_remote_commands_to_cluster(
    cluster_id: str, request: AddRemoteCommandsRequest, remote_command: RemoteCommand = Depends(get_remote_command)
):
    return await add_remote_commands_to_cluster_controller(cluster_id, request, remote_command)


@router.post("/{cluster_id}/command/execute")
async def add_and_execute_remote_command_to_cluster(
    cluster_id: str, request: RemoteCommandRequest, remote_command: RemoteCommand = Depends(get_remote_command)
):
    return await execute_command_on_cluster_controller(cluster_id, request, remote_command)


@router.delete("/{cluster_id}/command/{execution_id}")
async def delete_remote_command_from_cluster(
    cluster_id: str, execution_id: str, remote_command: RemoteCommand = Depends(get_remote_command)
):
    return await delete_remote_command_from_cluster_controller(cluster_id, execution_id, remote_command)


@router.get("/{cluster_id}/command/{execution_id}/status")
async def get_command_execution_status(
    cluster_id: str, execution_id: str, remote_command: RemoteCommand = Depends(get_remote_command)
):
    return await get_command_execution_status_controller(cluster_id, execution_id, remote_command)


@router.get("/{cluster_id}/commands")
async def get_cluster_remote_commands(cluster_id: str, remote_command: RemoteCommand = Depends(get_remote_command)):
    return await get_cluster_remote_commands_controller(cluster_id, remote_command)


@router.post("/command/pod/status")
async def set_pod_command_execution_status(
    request: PodCommandExecutionStatusReportRequest, remote_command: RemoteCommand = Depends(get_remote_command)
):
    return await set_pod_command_execution_status_controller(request, remote_command)


@router.get("/{cluster_id}/head-node-ip")
async def get_head_node_ip(cluster_id: str, compute: Compute = Depends(get_compute)):
    return await get_head_node_ip_controller(compute=compute, cluster_id=cluster_id)


@router.get("/label/value")
async def search_labels(query: str, page_size: int, offset: int):
    return await search_labels_controller(query, page_size=page_size, offset=offset)


@router.post("/label/value")
async def get_label_values(request: LabelValuesRequest):
    return await get_label_values_controller(request)


@router.post("/search")
async def search_cluster_v2(request: SearchClusterRequest, compute: Compute = Depends(get_compute)):
    return await search_v2_controller(request, compute=compute)


@router.get("/get-action-groups/{cluster_id}")
async def get_action_groups(cluster_id, offset, page_size, sort_order, compute: Compute = Depends(get_compute)):
    return await get_action_groups_controller(
        compute=compute, cluster_id=cluster_id, offset=int(offset), page_size=int(page_size), sort_order=sort_order
    )


@router.get("/get-action-group-details/{cluster_runtime_id}")
async def get_action_groups_details(cluster_runtime_id, sort_order, compute: Compute = Depends(get_compute)):
    return await get_action_group_details_controller(
        compute=compute, cluster_runtime_id=cluster_runtime_id, sort_order=sort_order
    )
