from os import environ
from typing import Optional

from compute_model.compute_cluster import ComputeClusterDefinition
from compute_model.package import Package
from darwin_compute.service.compute_app_layer import ComputeAppLayer
from darwin_compute.util.utils import read_yaml

"""
Compute SDK
"""
env = environ.get("ENV", "darwin-local")
app_layer = ComputeAppLayer(env)


def create(compute_request: ComputeClusterDefinition):
    """
    Create cluster and starts it using compute definition
    :param compute_request: Cluster definition object
    :return: Return the status of cluster creation and cluster_id
    """
    return app_layer.create(compute_request)


def create_with_yaml(file_path: str, start_cluster: Optional[bool] = True):
    """
    Create cluster and starts it using configuration stored in yaml file.
    :param file_path: File path containing Cluster definition details
    :param start_cluster: Flag to indicate if cluster should be started after creation
    :return: Return the status of cluster creation and cluster_id
    """
    req_dict = read_yaml(file_path)
    compute_request: ComputeClusterDefinition = ComputeClusterDefinition.from_dict(req_dict)
    compute_request.start_cluster = start_cluster
    return create(compute_request)


def start(cluster_id: str):
    """
    Start Cluster using cluster_id
    :param cluster_id: Cluster identification
    :return: Returns the status of the request and cluster_id along with jupyter and dashboard links
    """
    return app_layer.start(cluster_id)


def stop(cluster_id: str):
    """
    Stops Cluster using cluster_id
    :param cluster_id: Cluster identification
    :return: Returns the status of the request and cluster_id
    """
    return app_layer.stop(cluster_id)


def restart(cluster_id: str):
    """
    Restart Cluster using cluster_id
    :param cluster_id: Cluster identification
    :return: Returns the status of the request and cluster_id along with jupyter and dashboard links
    """
    return app_layer.restart(cluster_id)


def update(cluster_id: str, compute_request: ComputeClusterDefinition):
    """
    Update cluster using compute definition
    :param cluster_id: Cluster identification
    :param compute_request: Cluster definition object
    :return: Returns the status of the request and cluster_id
    """
    return app_layer.update(cluster_id, compute_request)


def update_with_yaml(cluster_id: str, file_path: str):
    """
    Update cluster using configuration stored in yaml file.
    :param cluster_id: Cluster identification
    :param file_path: Path of the yaml file containing configurations for the cluster
    :return: Returns the status of the request and cluster_id
    """
    req_dict = read_yaml(file_path)
    compute_request: ComputeClusterDefinition = ComputeClusterDefinition.from_dict(req_dict)
    return update(cluster_id, compute_request)


def delete(cluster_id: str):
    """
    Delete cluster using cluster_id
    :param cluster_id: Cluster identification
    :return: Returns the status of the request
    """
    return app_layer.delete(cluster_id)


def get_info(cluster_id: str):
    """
    Get cluster Metadata using cluster_id
    :param cluster_id: Cluster identification
    :return: Returns the status of the request and cluster metadata
    """
    return app_layer.get_info(cluster_id)


def get_details(cluster_id: str):
    """
    Get cluster details using cluster_id
    :param cluster_id: Cluster identification
    :return: Returns the status of the request and cluster details
    """
    return app_layer.get_details(cluster_id)


def get_all(query: str = "", page_size: int = 100, offset: int = 0):
    """
    Get all clusters
    :return: Returns the status of the request and list of clusters
    """
    return app_layer.get_all(query, page_size, offset)


def get_packages(
    cluster_id: str,
    key: str = "",
    sort_by: str = "created_at",
    sort_order: str = "desc",
    offset: int = 0,
    page_size: int = 10,
):
    """
    Get packages installed on a cluster.
    :param cluster_id: Cluster identification
    :param key: Search key
    :param sort_by: Sort by field
    :param sort_order: Sort order
    :param offset: Offset for pagination
    :param page_size: Number of items per page
    :return: Returns the status of the request and list of packages
    """
    return app_layer.get_packages(cluster_id, key, sort_by, sort_order, offset, page_size)


def install_package(cluster_id: str, request: Package):
    """
    Install package on a cluster.
    :param cluster_id: Cluster identification
    :param request: Package details
    :return: Returns the status of the request and package details
    """
    return app_layer.install_package(cluster_id, request)


def uninstall_packages(cluster_id: str, ids: list[str]):
    """
    Uninstall packages on a cluster.
    :param cluster_id: Cluster identification
    :param ids: List of package ids to uninstall
    :return: Returns the status of the request and package details
    """
    return app_layer.uninstall_packages(cluster_id, ids)
