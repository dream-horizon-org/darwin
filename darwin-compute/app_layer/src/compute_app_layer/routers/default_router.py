import json

from fastapi import APIRouter, Depends, Header

from compute_app_layer.controllers import (
    deep_healthcheck_controller,
    search_controller,
    get_runtimes_controller,
    get_disk_types_controller,
    get_instance_role_controller,
    get_az_controller,
    get_tags_controller,
    get_limits_controller,
    node_types_controller,
    get_gpu_pods_controller,
    get_filters_controller,
    update_init_script_status_controller,
    add_custom_runtime_controller,
    get_running_clusters_controller,
)
from compute_app_layer.controllers.cluster_config.create_cluster_config import create_cluster_config_controller
from compute_app_layer.controllers.cluster_config.get_all_cluster_config import get_all_cluster_config_controller
from compute_app_layer.controllers.cluster_config.get_cluster_config import get_cluster_config_controller
from compute_app_layer.controllers.cluster_config.update_cluster_config import update_cluster_config_controller
from compute_app_layer.controllers.jupyter.jupyter_path import get_jupyter_path_controller
from compute_app_layer.controllers.jupyter.restart_jupyter import restart_jupyter_controller
from compute_app_layer.controllers.jupyter.start_jupyter import start_jupyter_controller
from compute_app_layer.controllers.recently_visited import (
    add_recently_visited_controller,
    get_recently_visited_controller,
)
from compute_app_layer.models import SearchEntity, UpdateInitScriptStatusEntity, CustomRuntimeRequest
from compute_app_layer.models.cluster_config import ClusterConfig, ClusterConfigUpdateRequest
from compute_app_layer.models.jupyter_request import JupyterPodRequest, JupyterRequest
from compute_app_layer.models.recently_visited import RecentlyVisitedRequest
from compute_app_layer.routers.dependency_cache import get_compute, get_config
from compute_app_layer.utils.response_util import Response
from compute_core.compute import Compute
from compute_core.constant.config import Config

router = APIRouter(prefix="")


@router.get("/healthcheck")
@router.get("/health")
async def health():
    return {"status": "SUCCESS", "message": "OK"}


@router.get("/health/deep")
async def deep_health(compute: Compute = Depends(get_compute)):
    return await deep_healthcheck_controller(compute=compute)


@router.post("/search")
async def search(request: SearchEntity, compute: Compute = Depends(get_compute)):
    return await search_controller(request=request, compute=compute)


@router.get("/get-runtimes")
async def get_runtimes(compute: Compute = Depends(get_compute)):
    return await get_runtimes_controller(compute=compute)


@router.get("/get-disk-types")
async def get_disk_types(compute: Compute = Depends(get_compute)):
    return await get_disk_types_controller(compute=compute)


@router.get("/get-instance-role")
async def get_instance_role(compute: Compute = Depends(get_compute)):
    return await get_instance_role_controller(compute=compute)


@router.get("/get-az")
async def get_az(compute: Compute = Depends(get_compute)):
    return await get_az_controller(compute=compute)


@router.get("/get-tags")
async def get_tags(compute: Compute = Depends(get_compute)):
    return await get_tags_controller(compute=compute)


@router.get("/get-limits")
async def get_limits(config: Config = Depends(get_config)):
    return await get_limits_controller(config=config)


@router.get("/node-types")
async def get_node_types(compute: Compute = Depends(get_compute)):
    return await node_types_controller(compute=compute)


@router.get("/gpu-pods")
async def get_gpu_pods():
    return await get_gpu_pods_controller()


@router.get("/filters")
async def get_filters(compute: Compute = Depends(get_compute)):
    return await get_filters_controller(compute=compute)


@router.put("/init-script-status")
async def update_init_script_status(
    request: UpdateInitScriptStatusEntity, compute: Compute = Depends(get_compute), config: Config = Depends(get_config)
):
    init_log_path = config.get_init_script_path()
    return await update_init_script_status_controller(compute=compute, request=request, log_path=init_log_path)


@router.post("/custom-runtime")
async def add_custom_runtime(request: CustomRuntimeRequest, compute: Compute = Depends(get_compute)):
    return await add_custom_runtime_controller(compute=compute, request=request)


@router.get("/running-clusters/{running_time}")
async def get_running_clusters(running_time: int, compute: Compute = Depends(get_compute)):
    return await get_running_clusters_controller(compute=compute, running_time=running_time)


@router.post("/recently-visited")
async def add_recently_visited(
    request: RecentlyVisitedRequest, msd_user=Header(None), compute: Compute = Depends(get_compute)
):
    user = json.loads(msd_user)["email"]
    return await add_recently_visited_controller(compute=compute, request=request, user=user)


@router.get("/recently-visited")
async def get_recently_visited(msd_user=Header(None), compute: Compute = Depends(get_compute)):
    user = json.loads(msd_user)["email"]
    return await get_recently_visited_controller(compute=compute, user=user)


@router.get("/cluster-config")
async def get_all_cluster_config(offset: int = 0, limit: int = 100, compute: Compute = Depends(get_compute)):
    return await get_all_cluster_config_controller(compute=compute, offset=offset, limit=limit)


@router.post("/cluster-config")
async def create_cluster_config(request: ClusterConfig, compute: Compute = Depends(get_compute)):
    return await create_cluster_config_controller(compute=compute, request=request)


@router.put("/cluster-config/{key}")
async def update_cluster_config(key: str, request: ClusterConfigUpdateRequest, compute: Compute = Depends(get_compute)):
    return await update_cluster_config_controller(compute=compute, key=key, request=request)


@router.get("/cluster-config/{key}")
async def get_cluster_config(key: str, compute: Compute = Depends(get_compute)):
    return await get_cluster_config_controller(compute=compute, key=key)


@router.post("/jupyter-pod")
async def start_jupyter(
    request: JupyterPodRequest, compute: Compute = Depends(get_compute), config: Config = Depends(get_config)
):
    return await start_jupyter_controller(compute=compute, config=config, request=request)


@router.post("/jupyter/restart")
async def restart_jupyter(
    request: JupyterRequest, compute: Compute = Depends(get_compute), config: Config = Depends(get_config)
):
    return await restart_jupyter_controller(compute=compute, request=request, config=config)


@router.get("/jupyter/path/{release_name}")
async def get_jupyter_path(
    release_name: str, compute: Compute = Depends(get_compute), config: Config = Depends(get_config)
):
    return await get_jupyter_path_controller(compute=compute, config=config, release_name=release_name)
