from loguru import logger

from compute_app_layer.models.search_entity import SearchEntity
from compute_app_layer.utils.response_util import Response
from compute_core.compute import Compute
from compute_model.cluster_status import UIClusterStatusMapping, ClusterStatus


def get_total_resources(head_node, worker_groups):
    head_node_cores = head_node["node"]["cores"]
    head_node_memory = head_node["node"]["memory"]

    worker_group_cores = 0
    worker_group_memory = 0
    for w in worker_groups:
        worker_group_cores += w["node"]["cores"] * w["max_pods"]
        worker_group_memory += w["node"]["memory"] * w["max_pods"]

    return {"total_cores": head_node_cores + worker_group_cores, "total_memory": head_node_memory + worker_group_memory}


async def search_controller(request: SearchEntity, compute: Compute):
    try:
        request.filters["is_job_cluster"] = [request.is_job_cluster]
        search_resp = compute.search_cluster(
            search_keyword=request.query,
            filters=request.filters,
            exclude_filters=request.exclude_filters,
            page_size=request.page_size,
            offset=request.offset,
            sort_fields={request.sort_by: request.sort_order},
        )

        search_cluster_res = [x["_source"] for x in search_resp["hits"]["hits"]]
        result_size = search_resp["hits"]["total"]["value"]

        cluster_ids = []
        for cluster in search_cluster_res:
            cluster_ids.append(cluster["cluster_id"])

        cluster_status_res = compute.get_clusters_from_list(cluster_ids)

        search_response = {
            "status": "SUCCESS",
            "result_size": result_size,
            "page_size": request.page_size,
            "offset": request.offset,
            "data": [],
        }

        for cluster in search_cluster_res:
            cluster_with_status = [item for item in cluster_status_res if item["cluster_id"] == cluster["cluster_id"]]
            if len(cluster_with_status):
                cluster_with_status = cluster_with_status[0]
                total_resources = get_total_resources(cluster["head_node"], cluster["worker_group"])
                search_response["data"].append(
                    {
                        "cluster_id": cluster["cluster_id"],
                        "name": cluster["name"],
                        "tags": cluster["tags"],
                        "status": UIClusterStatusMapping.get_status(ClusterStatus[cluster_with_status["status"]]),
                        "runtime": cluster["runtime"],
                        "active_pod": cluster_with_status["active_pods"],
                        "total_memory": total_resources["total_memory"],
                        "total_cores": total_resources["total_cores"],
                        "last_used_on": cluster_with_status["last_used_at"],
                        "create_by": cluster["user"],
                        "created_on": cluster["created_on"],
                        "estimated_cost": cluster.get("estimated_cost", None),
                    }
                )

        return search_response

    except Exception as e:
        logger.error(f"Error while searching cluster {request}, Error: {e.__str__()}")
        return Response.internal_server_error_response(message=e.__str__(), data=None)
