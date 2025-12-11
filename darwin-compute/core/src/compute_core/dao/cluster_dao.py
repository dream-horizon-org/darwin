import datetime
from typing import List, Dict

from elasticsearch.exceptions import NotFoundError
from loguru import logger

from compute_core.constant.constants import TAGS_FIELD, USER_FIELD
from compute_core.dao.es_dao import ESDao
from compute_core.dao.mysql_dao import MySQLDao, CustomTransaction
from compute_core.dao.queries.es_queries import (
    search_cluster_name,
    search_query,
    agg_query,
    get_job_clusters,
)
from compute_core.dao.queries.sql_queries import (
    CREATE_CLUSTER,
    GET_CLUSTER_STATUS,
    DELETE_CLUSTER,
    GET_CLUSTER_ARTIFACT_ID,
    UPDATE_CLUSTER_NAME_AND_ARTIFACT,
    GET_CLUSTER_RUN_ID,
    START_CLUSTER,
    STOP_CLUSTER,
    RESTART_CLUSTER,
    UPDATE_CLUSTER_NAME,
    GET_CLUSTER_METADATA,
    GET_ALL_CLUSTERS_METADATA,
    GET_CLUSTERS_FROM_LIST,
    GET_CLUSTER_ACTIONS_FOR_CLUSTER_RUN_ID,
    GET_CLUSTER_RUNTIME_IDS,
    GET_FIRST_AND_LAST_EVENT,
    INSERT_CLUSTER_ACTION,
    INSERT_CUSTOM_RUNTIME,
    INSERT_RECENTLY_VISITED,
    GET_RECENTLY_VISITED,
    SET_DELETED_RECENTLY_VISITED,
    GET_ALL_CLUSTERS_RUNNING_FOR_THRESHOLD_TIME,
    CREATE_CLUSTER_CONFIG,
    UPDATE_CLUSTER_CONFIG,
    GET_CLUSTER_CONFIG,
    GET_CLUSTER_ACTION,
    UPDATE_CLUSTER_STATUS,
    GET_CLUSTER_LAST_UPDATED_AT,
    GET_CLUSTERS_LAST_USED_BEFORE_DAYS,
    GET_ALL_CLUSTER_CONFIG,
    GET_CLUSTER_LAST_STARTED_TIME,
    GET_CLUSTER_LAST_STOPPED_TIME,
    UPDATE_CLUSTER_LAST_USED_AT,
)
from compute_core.dto.exceptions import ClusterNotFoundError, ClusterRunIdNotFoundError
from compute_core.dto.request.es_compute_cluster_definition import ESComputeDefinition
from compute_core.util.utils import serialize_date


class ClusterDao:
    def __init__(self, env: str = None):
        self._mysql_dao = MySQLDao(env)
        self._es_dao = ESDao(env)

    def healthcheck(self):
        mysql_health = self._mysql_dao.healthcheck()
        es_health = self._es_dao.healthcheck()
        logger.info(f"Healthcheck of MySQL: {mysql_health}, Elasticsearch: {es_health}")
        return mysql_health and es_health

    def search_cluster_name(self, name: str):
        return self._es_dao.aggregation_search(search_cluster_name(name))

    def get_cluster_status(self, cluster_id: str):
        sql_query = GET_CLUSTER_STATUS
        sql_data = {"cluster_id": cluster_id}
        result = self._mysql_dao.read(sql_query, sql_data)
        if not result:
            raise Exception(f"Cluster does not exist")
        cluster_status = result[0]["status"]
        return cluster_status

    def get_cluster_artifact_id(self, cluster_id: str):
        sql_query = GET_CLUSTER_ARTIFACT_ID
        sql_data = {"cluster_id": cluster_id}
        result = self._mysql_dao.read(sql_query, sql_data)
        artifact_id = result[0]["artifact_id"]
        return artifact_id

    def get_cluster_run_id(self, cluster_id: str):
        sql_query = GET_CLUSTER_RUN_ID
        sql_data = {"cluster_id": cluster_id}
        result = self._mysql_dao.read(sql_query, sql_data)
        run_id = result[0]["run_id"]
        return run_id

    def get_cluster_run_id_v2(self, cluster_id: str) -> str:
        with CustomTransaction(self._mysql_dao.get_read_connection()) as mysql_connection:
            logger.debug(f"Getting cluster run_id for {cluster_id}")
            sql_query = GET_CLUSTER_RUN_ID
            sql_data = {"cluster_id": cluster_id}
            mysql_connection.execute_query(sql_query, sql_data)
            result = mysql_connection.cursor.fetchone()
            if not result:
                logger.error(f"Cluster {cluster_id} not found")
                raise ClusterNotFoundError(cluster_id)
            run_id = result.get("run_id")
            if not run_id:
                logger.error(f"Cluster {cluster_id} has no run_id")
                raise ClusterRunIdNotFoundError(cluster_id)
            return run_id

    def create_cluster(self, cluster_id: str, artifact_id: str, compute_request: ESComputeDefinition):
        sql_query = CREATE_CLUSTER
        logger.info(f"Creating cluster with cluster_id in create cluster dao: {cluster_id}")
        sql_data = {
            "cluster_id": cluster_id,
            "artifact_id": artifact_id,
            "status": "inactive",
            "cluster_name": compute_request.name,
        }
        es_data = compute_request
        es_index = cluster_id
        result = self._mysql_dao.create(sql_query, sql_data, lambda: self._es_dao.create(es_index, es_data))
        return result

    def delete_cluster(self, cluster_id: str):
        sql_query = DELETE_CLUSTER
        sql_data = {"cluster_id": cluster_id}
        es_index = cluster_id
        result = self._mysql_dao.delete(sql_query, sql_data, lambda: self._es_dao.delete(es_index))
        return result

    def get_cluster_info(self, cluster_id: str):
        try:
            result = self._es_dao.read(cluster_id)
            return result
        except NotFoundError as e:
            logger.error(f"Cluster {cluster_id} not found")
            raise ClusterNotFoundError(cluster_id)

    def update_cluster_name_artifact(self, cluster_id: str, artifact_id: str, compute_request: ESComputeDefinition):
        sql_query = UPDATE_CLUSTER_NAME_AND_ARTIFACT
        sql_data = {
            "cluster_id": cluster_id,
            "artifact_id": artifact_id,
            "name": compute_request.name,
        }
        es_data = compute_request
        es_index = cluster_id
        result = self._mysql_dao.update(sql_query, sql_data, lambda: self._es_dao.update(es_index, es_data))
        return result

    def start_cluster(self, cluster_id: str, run_id: str):
        sql_query = START_CLUSTER
        sql_data = {"run_id": run_id, "cluster_id": cluster_id}
        es_data = self.get_cluster_info(cluster_id)
        es_data.status = "creating"
        es_index = cluster_id
        result = self._mysql_dao.update(sql_query, sql_data, lambda: self._es_dao.update(es_index, es_data))
        return result

    def stop_cluster(self, cluster_id: str):
        sql_query = STOP_CLUSTER
        sql_data = {"cluster_id": cluster_id}
        es_data = self.get_cluster_info(cluster_id)
        es_data.status = "inactive"
        es_data.active_pods = 0
        es_data.total_memory_in_gb = 0
        es_index = cluster_id
        result = self._mysql_dao.update(sql_query, sql_data, lambda: self._es_dao.update(es_index, es_data))
        return result

    def restart_cluster(self, cluster_id: str):
        sql_query = RESTART_CLUSTER
        sql_data = {"cluster_id": cluster_id}
        es_data = self.get_cluster_info(cluster_id)
        es_data.status = "creating"
        es_index = cluster_id
        result = self._mysql_dao.update(sql_query, sql_data, lambda: self._es_dao.update(es_index, es_data))
        return result

    def update_cluster_name(self, cluster_id: str, cluster_name: str):
        sql_query = UPDATE_CLUSTER_NAME
        sql_data = {"cluster_id": cluster_id, "name": cluster_name}
        es_data = self.get_cluster_info(cluster_id)
        es_data.name = cluster_name
        es_index = cluster_id
        result = self._mysql_dao.update(sql_query, sql_data, lambda: self._es_dao.update(es_index, es_data))
        return result

    def update_cluster_user(self, cluster_id: str, cluster_user: str) -> ESComputeDefinition:
        es_data: ESComputeDefinition = self.get_cluster_info(cluster_id)
        es_data.user = cluster_user
        es_index = cluster_id
        result = self._es_dao.update(es_index, es_data)
        return result

    def update_cluster_tags(self, cluster_id: str, tags: List[str]):
        es_data = self.get_cluster_info(cluster_id)
        es_data.tags = tags
        es_index = cluster_id
        result = self._es_dao.update(es_index, es_data)
        return result

    def search_cluster(
        self,
        key: str,
        query_fields: List[str],
        filters: Dict[str, List[str]],
        exclude_filters: Dict[str, List[str]],
        sort_fields: Dict[str, str],
        limit: int,
        offset: int,
    ):
        query = search_query(key, query_fields, filters, exclude_filters, sort_fields, limit, offset)
        result = self._es_dao.aggregation_search(query)
        return result

    def get_cluster_metadata(self, cluster_id: str):
        sql_query = GET_CLUSTER_METADATA
        sql_data = {"cluster_id": cluster_id}
        result = self._mysql_dao.read(sql_query, sql_data)
        if not result:
            raise ClusterNotFoundError(cluster_id)
        cluster_metadata = result[0]
        cluster_metadata["last_updated_at"] = serialize_date(cluster_metadata["last_updated_at"])
        return cluster_metadata

    def get_all_clusters_metadata(self):
        sql_query = GET_ALL_CLUSTERS_METADATA
        result = self._mysql_dao.read(sql_query)
        for cluster_metadata in result:
            cluster_metadata["last_updated_at"] = serialize_date(cluster_metadata["last_updated_at"])
        return result

    def get_all_tags(self):
        query = agg_query(TAGS_FIELD)
        resp = self._es_dao.aggregation_search(query)
        tag_list = [x["key"] for x in resp["aggregations"]["distinct"]["buckets"]]
        return tag_list

    def update_last_used_time(self, cluster_id: str):
        sql_query = UPDATE_CLUSTER_LAST_USED_AT
        sql_data = {"cluster_id": cluster_id}
        es_data = self.get_cluster_info(cluster_id)
        es_data.last_used_at = serialize_date(datetime.datetime.now())
        es_index = cluster_id
        result = self._mysql_dao.update(sql_query, sql_data, lambda: self._es_dao.update(es_index, es_data))
        return result

    def get_cluster_list(self, cluster_list: list):
        if len(cluster_list) == 0:
            return []
        elif len(cluster_list) > 1:
            sql_query = GET_CLUSTERS_FROM_LIST + str(tuple(cluster_list))
        else:
            sql_query = GET_CLUSTERS_FROM_LIST + str(tuple(cluster_list)).replace(",)", ")")
        result = self._mysql_dao.read(sql_query)
        for cluster_data in result:
            cluster_data["last_updated_at"] = serialize_date(cluster_data["last_updated_at"])
            cluster_data["last_used_at"] = serialize_date(cluster_data["last_used_at"])
        return result

    def get_cluster_actions(self, run_id: str, sort_order: str):
        sql_query = GET_CLUSTER_ACTIONS_FOR_CLUSTER_RUN_ID % {
            "run_id": run_id,
            "sort_order": sort_order,
        }
        result = self._mysql_dao.read(sql_query)
        for action in result:
            action["updated_at"] = serialize_date(action["updated_at"])
        return result

    def get_cluster_runtime_ids(self, cluster_id: str, offset: int, page_size: int, sort_order: str):
        sql_query = GET_CLUSTER_RUNTIME_IDS % {
            "cluster_id": cluster_id,
            "sort_order": sort_order,
            "offset": offset,
            "page_size": page_size,
        }
        result = self._mysql_dao.read(sql_query)
        return result

    def get_first_and_last_event(self, run_id: str):
        sql_query = GET_FIRST_AND_LAST_EVENT
        sql_data = {"run_id": run_id}
        result = self._mysql_dao.read(sql_query, sql_data)
        for event in result:
            event["updated_at"] = serialize_date(event["updated_at"])
        return result

    def insert_cluster_action(self, run_id: str, action: str, message: str, cluster_id: str, artifact_id: str):
        sql_query = INSERT_CLUSTER_ACTION
        sql_data = {
            "run_id": run_id,
            "action": action,
            "message": message,
            "cluster_id": cluster_id,
            "artifact_id": artifact_id,
        }
        result = self._mysql_dao.create(sql_query, sql_data)
        return result

    def get_cluster_action(self, action: str, cluster_id: str):
        sql_query = GET_CLUSTER_ACTION
        sql_data = {"action": action, "cluster_id": cluster_id}
        result = self._mysql_dao.read(sql_query, sql_data)
        return result

    def insert_custom_runtime(self, runtime: str, image: str, namespace: str, created_by: str, type: str):
        sql_query = INSERT_CUSTOM_RUNTIME
        sql_data = {
            "runtime": runtime,
            "image": image,
            "namespace": namespace,
            "created_by": created_by,
            "type": type,
        }
        result = self._mysql_dao.create(sql_query, sql_data)
        return result

    def get_all_users(self):
        query = agg_query(USER_FIELD)
        resp = self._es_dao.aggregation_search(query)
        user_list = [x["key"] for x in resp["aggregations"]["distinct"]["buckets"]]
        return user_list

    def add_recently_visited(self, cluster_id: str, user_email: str):
        query = INSERT_RECENTLY_VISITED
        data = {"user_email": user_email, "cluster_id": cluster_id}
        return self._mysql_dao.update(query, data)

    def get_recently_visited(self, user_email: str):
        query = GET_RECENTLY_VISITED
        data = {"user_email": user_email}
        result = self._mysql_dao.read(query, data)
        for cluster_data in result:
            cluster_data["visited_at"] = serialize_date(cluster_data["visited_at"])
        return result

    def delete_recently_visited(self, cluster_id: str):
        query = SET_DELETED_RECENTLY_VISITED
        data = {"cluster_id": cluster_id}
        return self._mysql_dao.delete(query, data)

    def get_all_clusters_running_for_threshold_time(self, threshold_time_in_min: int) -> list[dict]:
        query = GET_ALL_CLUSTERS_RUNNING_FOR_THRESHOLD_TIME % {
            "cluster_running_time_threshold_in_minutes": threshold_time_in_min
        }
        resp = self._mysql_dao.read(query)
        for cluster in resp:
            cluster["last_started_at"] = serialize_date(cluster["last_started_at"])
        return resp

    def create_cluster_config(self, key: str, value: str):
        query = CREATE_CLUSTER_CONFIG
        data = {"key": key, "value": value}
        return self._mysql_dao.create(query, data)

    def update_cluster_config(self, key: str, value: str):
        query = UPDATE_CLUSTER_CONFIG
        data = {"key": key, "value": value}
        return self._mysql_dao.update(query, data)

    def get_cluster_config(self, key: str):
        query = GET_CLUSTER_CONFIG
        data = {"key": key}
        return self._mysql_dao.read(query, data)

    def get_all_cluster_config(self, offset: int, limit: int):
        query = GET_ALL_CLUSTER_CONFIG
        data = {"offset": offset, "limit": limit}
        return self._mysql_dao.read(query, data)

    def get_job_cluster_ids(self, offset: int, limit: int) -> list[str]:
        query = get_job_clusters(offset, limit)
        response = self._es_dao.aggregation_search(query)

        job_cluster_ids = []

        if response and response["hits"]["hits"]:
            for hit in response["hits"]["hits"]:
                job_cluster_ids.append(hit["_id"])

        return job_cluster_ids

    def get_clusters_last_used_before_days(self, days: int, cluster_ids: list[str]) -> list[dict]:
        sql_query = GET_CLUSTERS_LAST_USED_BEFORE_DAYS

        if len(cluster_ids) == 0:
            return []
        elif len(cluster_ids) > 1:
            sql_query = sql_query + str(tuple(cluster_ids))
        else:
            sql_query = sql_query + str(tuple(cluster_ids)).replace(",)", ")")

        data = {"days": days}

        return self._mysql_dao.read(query=sql_query, data=data)

    def update_status(
        self,
        cluster_id: str,
        status: str,
        active_pods: int,
        available_memory: int,
        last_updated_at: datetime.datetime = None,
    ):
        with CustomTransaction(self._mysql_dao.get_write_connection()) as mysql_connection:
            if last_updated_at:
                mysql_connection.execute_query(GET_CLUSTER_LAST_UPDATED_AT, {"cluster_id": cluster_id})
                last_updated = mysql_connection.cursor.fetchone()["last_updated_at"]
                if last_updated > last_updated_at:
                    logger.info(f"Cluster status of {cluster_id} not updated as it was updated by another process")
                    return None
            es_data = self.get_cluster_info(cluster_id)
            es_data.status = status
            es_data.active_pods = active_pods
            es_data.available_memory = available_memory
            mysql_connection.execute_query(
                UPDATE_CLUSTER_STATUS,
                {
                    "status": status,
                    "cluster_id": cluster_id,
                    "active_pods": active_pods,
                    "available_memory": available_memory,
                },
            )
            self._es_dao.update(cluster_id, es_data)
            updated_rows = mysql_connection.cursor.rowcount
            logger.info(f"Updated status of {cluster_id} to {status}")
            return updated_rows

    def get_cluster_last_started_at(self, cluster_id: str) -> datetime:
        """
        Get the last started time of a cluster.
        :param cluster_id: The ID of the cluster.
        :return: The last started time as a datetime object.
        """
        result = self._mysql_dao.read(GET_CLUSTER_LAST_STARTED_TIME, {"cluster_id": cluster_id})
        if not result:
            return None
        return result[0]["last_started_time"] if "last_started_time" in result[0] else None

    def get_cluster_last_stopped_at(self, cluster_id: str) -> datetime:
        """
        Get the last stopped time of a cluster.
        :param cluster_id: The ID of the cluster.
        :return: The last stopped time as a datetime object.
        """
        result = self._mysql_dao.read(GET_CLUSTER_LAST_STOPPED_TIME, {"cluster_id": cluster_id})
        if not result:
            return None
        return result[0]["last_stopped_time"] if "last_stopped_time" in result[0] else None
