import json
from datetime import datetime
from typing import List, Any, Optional, Dict, Union

from pydantic import BaseModel, Field


class CheckUniqueWorkflowNamePostRequest(BaseModel):
    name: str


class WorkflowIdRequest(BaseModel):
    workflow_name: str


class Filters(BaseModel):
    user: List[str]
    status: List[str] = []
    exclude_users: List[str] = []
    exclude_clusters: List[str] = []


# todo: add validations for all the fields. like page_size cant be greater than `100 etc
class WorkflowsPostRequest(BaseModel):
    query: str
    filters: Filters
    page_size: int
    offset: int
    sort_by: str
    sort_order: str


class UpdateWorkflowTagsRequest(BaseModel):
    tags: List[str]


class UpdateWorkflowMaxConcurrentRunsRequest(BaseModel):
    max_concurrent_runs: int


class UpdateWorkflowRetriesRequest(BaseModel):
    retries: int


class UpdateWorkflowScheduleRequest(BaseModel):
    schedule: str


class UpdateWorkflowStatusRequest(BaseModel):
    status: str


class RetrieveWorkflowRunsRequest(BaseModel):
    start_date: str
    end_date: Optional[str]
    page_size: int
    offset: int
    filters: List[str]


class StopRunWorkflowIdPutRequest(BaseModel):
    run_id: str


class PostRunDetailsRequest(BaseModel):
    run_id: str


class PostTaskDetailsRequest(BaseModel):
    run_id: str
    task_id: str


class PostTaskRequest(BaseModel):
    task_id: str


class TriggerWithParamsRequest(BaseModel):
    params: dict = Field(default_factory=dict)


class CallbackRequest(BaseModel):
    entity_id: str
    entity: str
    timestamp: str
    state: str
    metadata: dict

    def to_json(self):
        return json.dumps(self.dict())


class JobClusterDefinitionListRequest(BaseModel):
    page_size: int
    offset: int
    query: Optional[str] = None


class InsertWorkflowRunRequest(BaseModel):
    dag_id: str
    run_id: str
    state: str
    start_time: datetime
    end_time: Optional[datetime] = None
    expected_run_duration: Optional[int] = None


class InsertUpdateWorkflowRunRequest(BaseModel):
    dag_id: Optional[str] = None
    run_id: str
    state: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    expected_run_duration: Optional[int] = None
    sla_exceeded: Optional[bool] = None


class MissedWorkflowRunRequest(BaseModel):
    dag_id: str
    run_id: str
    start_time: datetime


class UpdateWorkflowRunRequest(BaseModel):
    state: Optional[str] = None
    end_time: Optional[datetime] = None
    sla_exceeded: Optional[bool] = None
    repair_time: Optional[datetime] = None


class MetadataRequest(BaseModel):
    names: List[str] = []

class SearchRequest(BaseModel):
    query: str = None
    filters: Filters = None
    page_size: int = 5
    offset: int = 0
    sort_by: str = None
    sort_order: str = None

class UpdateMetadataRequest(BaseModel):
    name: str
    config: Any
    enabled: Optional[bool] = None
