import time

from loguru import logger

from compute_app_layer.models.create_cluster import ClusterRequest
from compute_app_layer.models.request.library import InstallRequest
from compute_app_layer.utils.response_util import Response
from compute_core.cluster_cost import PredictAPI
from compute_core.compute import Compute
from compute_core.constant.config import Config
from compute_core.constant.event_states import ComputeState
from compute_core.dto.chronos_dto import ChronosEvent
from compute_core.dto.library_dto import LibraryStatus
from compute_core.remote_command import RemoteCommand
from compute_core.util.package_management.package_manager import LibraryManager


def add_packages(request: ClusterRequest, cluster_id: str, lib_manager: LibraryManager) -> list:
    """
    This function is used to add packages in the cluster.
    It will either take packages from the cloned cluster or the packages passed in the request.
    """
    packages_resp = []
    if request.packages_clone_from is not None and request.packages_clone_from != "":
        clone_packages = lib_manager.get_cluster_libraries(request.packages_clone_from)
        request.packages = [InstallRequest.from_library_dto(package) for package in clone_packages]
    if request.packages and len(request.packages):
        packages_resp = lib_manager.add_library(cluster_id, "inactive", request.packages)
    return packages_resp


def start_cluster(
    cluster_id: str, user: str, compute: Compute, lib_manager: LibraryManager, remote_command: RemoteCommand
):
    lib_manager.update_libraries_for_cluster(cluster_id=cluster_id, status=LibraryStatus.RUNNING.value)
    remote_command.update_execution_status_to_running(cluster_id=cluster_id)
    compute.start(cluster_id, user=user)


async def create_cluster(
    request: ClusterRequest,
    compute: Compute,
    lib_manager: LibraryManager,
    remote_command: RemoteCommand,
    predict_api: PredictAPI,
    attempt: int = 1,
):
    try:
        logger.debug(f"Received create cluster request, attempt number {attempt}: {request}")
        cluster = request.convert()
        min_cost, max_cost = predict_api.get_ray_cluster_cost(
            head_details=request.head_node_config, worker_details=request.worker_node_configs
        )
        cluster.estimated_cost = f"{min_cost}-{max_cost}"
        logger.debug(f"Modified create cluster request, attempt number {attempt}: {cluster}")
        cluster_create_res = compute.create_cluster(cluster)
        logger.debug(f"Cluster created: {cluster_create_res}")

        packages_resp = add_packages(request, cluster_create_res["cluster_id"], lib_manager)
        cluster_create_res["packages"] = packages_resp

        if cluster.start_cluster:
            start_cluster(cluster_create_res["cluster_id"], request.user, compute, lib_manager, remote_command)

        return Response.success_response(message="Cluster created successfully", data=cluster_create_res)
    except ValueError as e:
        logger.exception(f"Failed to create cluster because {e}")
        return Response.bad_request_error_response(message=str(e))
    except Exception as e:
        logger.exception(f"Cluster create failed for request , attempt number {attempt}: {request} due to :{e}")
        return Response.internal_server_error_response(message=e.__str__(), data=None)


# TODO: This retry logic is synchronous (time.sleep) in an async function - use asyncio.sleep instead
async def create_cluster_controller(
    request: ClusterRequest,
    compute: Compute,
    config: Config,
    lib_manager: LibraryManager,
    remote_command: RemoteCommand,
    predict_api: PredictAPI,
):
    try:
        response = None
        # TODO: Different retry behavior for job vs non-job clusters should be documented
        retry_attempts = config.cluster_create_retry_attempts if request.is_job_cluster else 1

        for i in range(retry_attempts + 1):
            response = await create_cluster(request, compute, lib_manager, remote_command, predict_api, i + 1)
            if response.status_code == 200:
                logger.debug(f"Cluster created successfully: {response}")
                return response
            logger.error(f"Cluster create failed for request after {i + 1} attempts: {request}")
            # TODO: Use asyncio.sleep instead of time.sleep in async context
            time.sleep((i + 1) * 0.5)

        return response
    except Exception as e:
        logger.exception(f"Cluster creation tries failed for request: {request} due to error :{e}")
        event = ChronosEvent(
            cluster_name=request.cluster_name,
            event_type=ComputeState.CLUSTER_CREATION_FAILED.name,
            message=e.__str__(),
            metadata={"request": request},
        )
        compute.send_event(event)
        return Response.internal_server_error_response(message=e.__str__(), data=None)
