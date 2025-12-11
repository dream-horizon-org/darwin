from typing import Optional

from fastapi import APIRouter, Depends

from compute_app_layer.controllers.libraries.libraries_controller import (
    get_libraries_controller,
    install_library_controller,
    get_library_status_controller,
    uninstall_libraries_controller,
    get_library_details_controller,
    retry_install_library_controller,
    install_package_batch_controller,
)
from compute_app_layer.models.request.library import (
    InstallRequest,
    SearchLibraryRequest,
    UninstallLibrariesRequest,
    InstallBatchRequest,
)
from compute_app_layer.routers.dependency_cache import get_library_manager, get_compute
from compute_core.compute import Compute
from compute_core.util.package_management.package_manager import LibraryManager

router = APIRouter(prefix="/cluster/{cluster_id}/library")


@router.get("")
async def get_libraries(
    cluster_id: str,
    key: Optional[str] = "",
    sort_by: Optional[str] = "id",
    sort_order: Optional[str] = "desc",
    offset: int = 0,
    page_size: int = 10,
    lib_manager: LibraryManager = Depends(get_library_manager),
):
    return await get_libraries_controller(
        SearchLibraryRequest(
            cluster_id=cluster_id, key=key, sort_by=sort_by, sort_order=sort_order, offset=offset, page_size=page_size
        ),
        lib_manager=lib_manager,
    )


@router.get("/{library_id}")
async def get_library_details(
    cluster_id: str,
    library_id: str,
    lib_manager: LibraryManager = Depends(get_library_manager),
):
    return await get_library_details_controller(cluster_id=cluster_id, library_id=library_id, lib_manager=lib_manager)


@router.post("/install")
async def install_library(
    cluster_id: str,
    request: InstallRequest,
    lib_manager: LibraryManager = Depends(get_library_manager),
    compute: Compute = Depends(get_compute),
):
    return await install_library_controller(
        cluster_id=cluster_id, library=request, lib_manager=lib_manager, compute=compute
    )


@router.post("/install/batch")
async def install_library_batch(
    cluster_id: str,
    request: InstallBatchRequest,
    lib_manager: LibraryManager = Depends(get_library_manager),
    compute: Compute = Depends(get_compute),
):
    return await install_package_batch_controller(
        cluster_id=cluster_id, request=request, lib_manager=lib_manager, compute=compute
    )


@router.get("/{library_id}/status")
async def get_library_status(
    cluster_id: str, library_id: str, lib_manager: LibraryManager = Depends(get_library_manager)
):
    return await get_library_status_controller(cluster_id=cluster_id, library_id=library_id, lib_manager=lib_manager)


@router.put("/uninstall")
async def uninstall_libraries(
    cluster_id: str,
    request: UninstallLibrariesRequest,
    lib_manager: LibraryManager = Depends(get_library_manager),
    compute: Compute = Depends(get_compute),
):
    return await uninstall_libraries_controller(
        cluster_id=cluster_id, request=request, lib_manager=lib_manager, compute=compute
    )


@router.patch("/{library_id}/install/retry")
async def retry_install_library(
    cluster_id: str,
    library_id: str,
    lib_manager: LibraryManager = Depends(get_library_manager),
    compute: Compute = Depends(get_compute),
):
    return await retry_install_library_controller(
        cluster_id=cluster_id, library_id=library_id, lib_manager=lib_manager, compute=compute
    )
