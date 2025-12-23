import json
from dataclasses import dataclass
from typing import List

from workflow_core.models.search_query import SearchQuery

from workflow_core.constants.constants import INACTIVE, ACTIVE
from workflow_model.requests import SearchRequest


@dataclass
class ElasticSearchQuery(SearchQuery):
    query: dict

    def get_query(self) -> any:
        return json.loads(json.dumps(self.query))


@dataclass
class WorkFlowSearchFromParam(SearchQuery):

    def build_query_from_request(self, request: SearchRequest):
        """
        Builds the query parameters for Elasticsearch from the provided SearchRequest.

        Args:
            request (SearchRequest): The validated search request object containing filter/sort parameters.

        Returns:
            dict: Query parameters suitable for Elasticsearch.

        Raises:
            ValueError: If the request is malformed or query generation fails.
        """
        # Convert request (pydantic model) to dict and pass as keyword arguments to get_query
        return self.get_query(request.filters.user, request.filters.status, request.query, request.sort_by,
                              request.sort_order, request.offset, request.page_size, request.filters.exclude_users, request.filters.exclude_clusters,
                              workflow=False)

    def get_query(self, users: List[str], statuses: List[str], query: str, sort_by: str, sort_order: str, offset: int,
                  page_size: int, exclude_users: List[str] = None, exclude_clusters: List[str] = None, workflow = True) -> SearchQuery:
        filters = []
        exclude_filters = []
        status_terms = []
        created_by_terms = []
        search_query = ".*" + query + ".*"

        if users and workflow:
            for user in users:
                user_filter = {"term": {"created_by": {"value": user}}}
                created_by_terms.append(user_filter)
        elif not workflow:
            for user in users:
                user_filter = {"term": {"user.keyword": {"value": user}}}
                created_by_terms.append(user_filter)
        if statuses and workflow:
            for status in statuses:
                status_filter = {"term": {"workflow_status": {"value": status}}}
                status_terms.append(status_filter)
        elif workflow:
            for status in [ACTIVE, INACTIVE]:
                status_filter = {"term": {"workflow_status": {"value": status}}}
                status_terms.append(status_filter)

        elif not workflow:
            if statuses:
                for status in statuses:
                    status_filter = {"term": {"cluster_status": {"value": status}}}
                    status_terms.append(status_filter)
            else:
                for status in [ACTIVE]:
                    status_filter = {"term": {"cluster_status": {"value": status}}}
                    status_terms.append(status_filter)

        if exclude_users:
            for exclude_user in exclude_users:
                exclude_user_filter = {"term": {"user.keyword": {"value": exclude_user}}}
                exclude_filters.append(exclude_user_filter)

        if exclude_clusters:
            for exclude_cluster in exclude_clusters:
                exclude_cluster_filter = {"term": {"job_cluster_definition_id.keyword": {"value": exclude_cluster}}}
                exclude_filters.append(exclude_cluster_filter)

        if workflow:
            name_filter = {"bool": {"should": [
                {"regexp": {"display_name.keyword": {"value": search_query}}}
            ]}}
            filters.append(name_filter)
        else:
            name_filter = {"bool": {"should": [
                {"regexp": {"cluster_name.keyword": {"value": search_query}}}
            ]}}
            filters.append(name_filter)
        
        # Only add status filter if there are status terms
        if status_terms:
            status_or = {"bool": {"should": status_terms}}
            filters.append(status_or)
        
        # Only add created_by filter if there are user terms
        if created_by_terms:
            created_by_or = {"bool": {"should": created_by_terms}}
            filters.append(created_by_or)
        # For text fields with keyword subfields, use .keyword for sorting
        sort_field = f"{sort_by}.keyword" if sort_by in ["created_at", "last_updated_on", "display_name", "workflow_name"] else sort_by
        
        return {
            "query": {
                "bool": {
                    "must": filters,
                    "must_not": exclude_filters,
                }
            },
            "from": offset, "size": page_size,
            "sort": [
                {
                    sort_field: {
                        "order": sort_order
                    }
                }
            ]
        }


@dataclass
class WorkFlowSearchFromName(SearchQuery):
    """
    class to search a given workflow from name
    """

    def get_query(self, name: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "workflow_name": {
                                    "value": name
                                }
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "term": {
                                "workflow_status": {
                                    "value": "deleted"
                                }
                            }
                        }
                    ]
                }
            }
        }


@dataclass
class WorkflowSearchFromDisplayName(SearchQuery):
    """
    class to search a given workflow from display name
    """

    def get_query(self, display_name: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "display_name.keyword": {
                                    "value": display_name
                                }
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "term": {
                                "workflow_status": {
                                    "value": "deleted"
                                }
                            }
                        }
                    ]
                }
            }
        }


@dataclass()
class RecentlyVisitedQuery(SearchQuery):
    """
    class to search recently visited for given user_id
    """

    def get_query(self, user_id: str):
        return {
            "query": {
                "bool": {
                    "should": [
                        {
                            "term": {
                                "user_id": {
                                    "value": user_id
                                }
                            }
                        }
                    ]
                }
            }
        }


@dataclass
class WorkFlowSearchFromId(SearchQuery):
    """
    class to search a given workflow from name
    """

    def get_query(self, workflow_id: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "workflow_id": {
                                    "value": workflow_id
                                }
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "term": {
                                "workflow_status": {
                                    "value": "deleted"
                                }
                            }
                        }
                    ]
                }
            },
            "version": True
        }


class WorkFlowSearchFromRunId(SearchQuery):
    """
    class to search a given workflow from name
    """

    def get_query(self, workflow_id: str, timestamp: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "workflow_id": {
                                    "value": workflow_id
                                }
                            }
                        },
                        {
                            "range": {
                                "last_updated_on": {
                                    "lte": timestamp
                                }
                            }
                        }
                    ]
                }
            },
            "sort": [
                {
                    "last_updated_on": {
                        "order": "desc"
                    }
                }
            ],
            "size": 1
        }


@dataclass
class WorkflowDeleteUsingName(SearchQuery):
    """
    class to delete a workflow with the given name
    """

    def get_query(self, workflow_name: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "workflow_name": {
                                    "value": workflow_name
                                }
                            }
                        }
                    ]
                }
            }
        }


@dataclass
class WorkflowCreatedUsers(SearchQuery):
    """
    class to get the list of users
    """

    def get_query(self):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "regexp": {
                                "created_by": {
                                    "value": ".*.*"
                                }
                            }
                        }
                    ]
                }
            },
            "aggs": {
                "databases": {
                    "terms": {
                        "field": "created_by",
                        "size": 1000,
                        "order": {
                            "_key": "asc"
                        },
                    }
                }
            },
            "size": 0
        }


class JobClusterSearchFromName(SearchQuery):
    """
    class to search a given workflow from name
    """

    def get_query(self, name: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "cluster_name.keyword": {
                                    "value": name
                                }
                            }
                        },
                        {"term": {"cluster_status": {"value": ACTIVE}}}
                    ]
                }
            }
        }


class JobClusterSearchFromId(SearchQuery):

    def get_query(self, job_cluster_definition_id: str):
        return {
            "query": {
                "bool": {
                    "should": [
                        {
                            "term": {
                                "job_cluster_definition_id.keyword": {
                                    "value": job_cluster_definition_id
                                }
                            }
                        }
                    ]
                }
            }
        }

class ListJobClusters(SearchQuery):
    def get_query(self, offset: int = 0, page_size: int = 10, cluster_name: str = None):
        query = {
            "match_all": {}
        }
        if cluster_name:
            query = {
                "bool": {
                    "must": [
                        {
                            "wildcard": {
                                "cluster_name.keyword": f"*{cluster_name}*"
                            }
                        }
                    ]
                }
            }
        return {
            "query": query,
            "from": offset,
            "size": page_size,
            "aggs": {
                "total_count": {
                    "value_count": {
                        "field": "job_cluster_definition_id.keyword"
                    }
                }
            }
        }

class GetWorkflowCluster(SearchQuery):
    def get_query(self, workflow_name: str, run_id: str, task_name: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"workflow_name.keyword": {"value": workflow_name}}},
                        {"term": {"run_id.keyword": {"value": run_id}}},
                        {"term": {"task_name.keyword": {"value": task_name}}}
                    ]
                }
            }
        }


class WorkFlowSearchFromClusterId(SearchQuery):
    """
    class to search a given workflow from name
    """

    def get_query(self, cluster_id: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "cluster_id.keyword": {
                                    "value": cluster_id
                                }
                            }
                        }
                    ]
                }
            }
        }


class GetWorkflowClusterV2(SearchQuery):
    def get_query(self, workflow_name: str, run_id: str, task_name: str, try_number: int = None):
        must_conditions = [
            {"term": {"workflow_name.keyword": {"value": workflow_name}}},
            {"term": {"run_id.keyword": {"value": run_id}}},
            {"term": {"task_name.keyword": {"value": task_name}}}
        ]

        should_conditions = []
        if try_number is not None:
            should_conditions.append({"term": {"try_number": {"value": try_number}}})

        should_conditions.append({"bool": {"must_not": {"exists": {"field": "try_number"}}}})

        return {
            "query": {
                "bool": {
                    "must": must_conditions,
                    "should": should_conditions,
                    "minimum_should_match": 1
                }
            }
        }


class GetLatestTaskInstance(SearchQuery):
    def get_query(self, dag_id: str, run_id: str, task_id: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"dag_id.keyword": {"value": dag_id}}},
                        {"term": {"run_id.keyword": {"value": run_id}}},
                        {"term": {"task_id.keyword": {"value": task_id}}}
                    ]
                }
            }
        }

@dataclass
class WorkFlowSearchFromClusterID(SearchQuery):
    """
    class to search a given workflow from name based on cluster_id
    """

    def get_query(self, cluster_id: str):
        return {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "tasks.attached_cluster.cluster_id.keyword": {
                                    "value": cluster_id
                                }
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "term": {
                                "workflow_status": {
                                    "value": "deleted"
                                }
                            }
                        }
                    ]
                }
            }
        }