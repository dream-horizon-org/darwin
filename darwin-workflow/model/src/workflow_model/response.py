import json
from typing import List, Dict, Any

from pydantic import BaseModel, Field, root_validator
from pydantic.utils import Optional

from workflow_model.job_cluster import HeadNodeConfig, WorkerNodeConfig, AdvanceConfig, AutoTerminationPolicy
from workflow_model.workflow import DEFAULT_NOTIFICATION_PREFERENCE, Workflow, WorkflowTask, ClusterDetails, Package


# todo add validations for all the models. The entity shold not be created if the validations fail

class CheckUniqueWorkflowNamePostResponseData(BaseModel):
    unique: bool


class CheckUniqueWorkflowNamePostResponse(BaseModel):
    data: CheckUniqueWorkflowNamePostResponseData


class RecentlyVisitedGetResponseData(BaseModel):
    workflow_name: str
    display_name: Optional[str] = Field(default="")
    status: str
    workflow_id: str
    last_run_time: str


class RecentlyVisitedGetResponse(BaseModel):
    data: List[RecentlyVisitedGetResponseData]


class CreateWorkflowResponse(BaseModel):
    status: str
    message: str = ""
    data: Workflow = None


class UpdateWorkflowResponse(BaseModel):
    status: str
    message: str = ""
    data: Workflow = None


class WorkflowListData(BaseModel):
    workflow_name: str
    display_name: Optional[str] = Field(default="")
    description: str
    status: str
    workflow_id: str
    tags: List[str]
    schedule: str
    last_runs_status: List[str]
    next_run_time: str
    owner: str

    @root_validator
    def set_display_name(cls, values):
        if not values.get('display_name'):
            values['display_name'] = values.get('workflow_name', '')
        return values


class LastRunDetails(BaseModel):
    run_status: str
    is_run_duration_exceeded: bool = False
    expected_run_duration: Optional[int] = None

class WorkflowListDataV2(BaseModel):
    workflow_name: str
    display_name: Optional[str] = Field(default="")
    description: str
    status: str
    workflow_id: str
    tags: List[str]
    schedule: str
    last_run_details: List[LastRunDetails] = None
    next_run_time: str
    owner: str

    @root_validator
    def set_display_name(cls, values):
        if not values.get('display_name'):
            values['display_name'] = values.get('workflow_name', '')
        return values

class WorkflowsPostResponse(BaseModel):
    result_size: int
    page_size: int
    offset: int
    data: List[WorkflowListDataV2]


class FiltersGetResponseData(BaseModel):
    users: List[str]
    status: List[str]


class FiltersGetResponse(BaseModel):
    data: FiltersGetResponseData


class WorkflowRun(BaseModel):
    run_id: str
    start_time: Optional[str]
    duration: float
    run_status: str
    trigger: str
    trigger_by: str
    expected_run_duration : Optional[int]
    is_run_duration_exceeded: Optional[bool]


class RepairRun(BaseModel):
    run_id: Optional[str] = Field(default="")
    status: Optional[str] = Field(default="")


class RepairRunStatus(BaseModel):
    status: Optional[str] = Field(default="")


class WorkflowRuns(BaseModel):
    workflow_id: str
    runs: List[WorkflowRun]


class WorkflowRunsV2(BaseModel):
    workflow_id: str
    runs: List[WorkflowRun]
    repair_run: Optional[RepairRun]


class RetrieveWorkflowRunsResponse(BaseModel):
    result_size: int
    page_size: int
    offset: int
    data: WorkflowRuns


class RetrieveWorkflowRunsResponseV2(BaseModel):
    result_size: int
    page_size: int
    offset: int
    data: WorkflowRunsV2


class WorkflowWorkflowIdDeleteResponseData(BaseModel):
    workflow_id: str
    is_deleted: bool


class WorkflowWorkflowIdDeleteResponse(BaseModel):
    data: WorkflowWorkflowIdDeleteResponseData


class PauseScheduleWorkflowIdPutResponseData(BaseModel):
    workflow_status: str
    workflow_id: str


class PauseScheduleWorkflowIdPutResponse(BaseModel):
    data: PauseScheduleWorkflowIdPutResponseData


class ResumeScheduleWorkflowIdPutResponseData(BaseModel):
    workflow_status: str
    workflow_id: str


class ResumeScheduleWorkflowIdPutResponse(BaseModel):
    data: ResumeScheduleWorkflowIdPutResponseData


class StopRunWorkflowIdPutResponseData(BaseModel):
    workflow_id: str
    run_id: str
    run_status: str


class StopRunWorkflowIdPutResponse(BaseModel):
    data: StopRunWorkflowIdPutResponseData


class RunNowWorkflowIdPutResponseData(BaseModel):
    workflow_id: str
    last_runs_status: List[str]
    last_run: WorkflowRun

class RunNowWorkflowRequest(BaseModel):
    parameters: Optional[dict] = {}

class RunNowWorkflowIdPutResponse(BaseModel):
    data: RunNowWorkflowIdPutResponseData


class WorkflowWorkflowIdGetResponseData(BaseModel):
    workflow_id: str
    workflow_name: str
    display_name: Optional[str] = ""
    description: str
    tags: List[str]
    schedule: str
    retries: Optional[int]
    notify_on: str
    parameters:Optional[dict]
    callback_urls:  Optional[List[str]]
    event_types:  Optional[List[str]]
    max_concurrent_runs: Optional[int]
    created_by: str
    last_updated_on: str
    created_at: str
    workflow_status: str
    tasks: List[WorkflowTask]
    next_run_time: str
    expected_run_duration: int = None
    queue_enabled: Optional[bool] = True
    notification_preference: Optional[Dict[str, bool]] = {
        "on_start": False,  # or set as needed
        "on_fail": True,  # default is True
        "on_success": False,  # or set as needed
        "on_skip": False  # or set as needed
    }


class WorkflowWorkflowIdGetResponse(BaseModel):
    data: WorkflowWorkflowIdGetResponseData


class WorkflowTagsData(BaseModel):
    workflow_id: str
    tags: List[str]


class UpdateWorkflowTagsResponse(BaseModel):
    data: WorkflowTagsData


class WorkflowScheduleData(BaseModel):
    workflow_id: str
    schedule: str


class UpdateWorkflowScheduleResponse(BaseModel):
    data: WorkflowScheduleData


class WorkflowMaxConcurrentRunsData(BaseModel):
    workflow_id: str
    max_concurrent_runs: int


class UpdateWorkflowMaxConcurrentRunsResponse(BaseModel):
    data: WorkflowMaxConcurrentRunsData


class UpdateWorkflowRetriesData(BaseModel):
    workflow_id: str
    retries: int


class UpdateWorkflowRetriesResponse(BaseModel):
    data: UpdateWorkflowRetriesData


class TaskEvent(BaseModel):
    timestamp: str
    status: str
    message: str


class RunDetails(BaseModel):
    workflow_id: str
    run_id: str
    start_time: str
    end_time: str
    duration: float
    run_status: str
    trigger: str
    trigger_by: str
    parameters: Optional[dict]
    events: List[TaskEvent]
    tasks: List[WorkflowTask]


class RunDetailsV2(BaseModel):
    workflow_id: str
    run_id: str
    start_time: str
    logical_date: str
    end_time: str
    duration: float
    run_status: str
    trigger: str
    trigger_by: str
    parameters: Optional[dict]
    tasks: List[WorkflowTask]
    repair_run: Optional[RepairRunStatus]
    expected_run_duration : Optional[float] = None
    is_run_duration_exceeded : Optional[bool] = False


class RetrieveRunDetailsResponse(BaseModel):
    data: RunDetails


class WorkflowYaml(BaseModel):
    workflow_id: str
    yaml: str


class DownloadWorkflowYamlResponse(BaseModel):
    data: WorkflowYaml


class RetrieveRunDetailsResponseV2(BaseModel):
    data: RunDetailsV2


class TaskDetails(BaseModel):
    workflow_id: str
    run_id: str
    task_id: str
    start_time: str
    end_time: str
    duration: float
    source: str
    source_type: str
    file_path: str
    dynamic_artifact: bool
    dependent_libraries: str
    packages: Optional[List[Package]]
    input_parameters: dict
    retries: Optional[int]
    timeout: Optional[int]
    attached_cluster: ClusterDetails
    task_validation_status: str
    run_status: str
    trigger: str
    trigger_by: str
    output: str
    output_type: str = "string"
    task_events: List[TaskEvent]
    message: str
    notification_preference: Optional[Dict[str, bool]] = Field(default_factory=lambda: DEFAULT_NOTIFICATION_PREFERENCE.copy())
    notify_on: Optional[str] = None
    trigger_rule: Optional[str] = None


class TaskOutput(BaseModel):
    try_number: int
    error: str = ""
    application_log: str = ""
    system_log: str = ""
    logs: str = ""
    status: str


class TaskOutputV2(BaseModel):
    try_number: int
    error: str = ""
    application_log: str = ""
    system_log: str = ""
    logs: str = ""
    status: str
    start_time: str
    end_time: str
    duration: float
    attached_cluster: ClusterDetails


class TaskDetailsResponse(BaseModel):
    data: TaskDetails


class TaskDetailsV2(BaseModel):
    workflow_id: str
    run_id: str
    task_id: str
    start_time: str
    end_time: str
    duration: float
    source: str
    source_type: str
    file_path: str
    dynamic_artifact: bool
    dependent_libraries: str
    packages: Optional[List[Package]]
    input_parameters: dict
    retries: Optional[int]
    timeout: Optional[int]
    attached_cluster: ClusterDetails
    task_validation_status: str
    run_status: str
    trigger: str
    trigger_by: str
    output: List[TaskOutput]
    latest_try_output: TaskOutput
    task_events: List[TaskEvent]
    message: str
    notification_preference: Optional[Dict[str, bool]] = Field(default_factory=lambda: DEFAULT_NOTIFICATION_PREFERENCE.copy())
    notify_on: Optional[str] = None
    trigger_rule: Optional[str] = None


class TaskDetailsV3(BaseModel):
    workflow_id: str
    run_id: str
    task_id: str
    source: str
    source_type: str
    file_path: str
    dynamic_artifact: bool
    dependent_libraries: str
    packages: Optional[List[Package]]
    input_parameters: dict
    retries: Optional[int]
    timeout: Optional[int]
    task_validation_status: str
    run_status: str
    trigger: str
    trigger_by: str
    output: List[TaskOutputV2]
    message: str
    notification_preference: Optional[Dict[str, bool]] = Field(default_factory=lambda: DEFAULT_NOTIFICATION_PREFERENCE.copy())
    notify_on: Optional[str] = None
    trigger_rule: Optional[str] = None
    depends_on: list[str]


class TaskDetailsResponseV3(BaseModel):
    data: TaskDetailsV3


class TaskDetailsResponseV2(BaseModel):
    data: TaskDetailsV2


class TaskDetailsWithoutRun(BaseModel):
    workflow_id: str
    task_id: str
    source: str
    source_type: str
    file_path: str
    dynamic_artifact: bool
    dependent_libraries: str
    packages: Optional[List[Package]]
    depends_on: list[str]
    input_parameters: dict
    retries: Optional[int]
    timeout: Optional[int]
    attached_cluster: ClusterDetails
    message: str
    notification_preference: Optional[Dict[str, bool]] = Field(default_factory=lambda: DEFAULT_NOTIFICATION_PREFERENCE.copy())
    notify_on: Optional[str] = None
    trigger_rule: Optional[str] = None


class WorkflowTasksResponse(BaseModel):
    data: TaskDetailsWithoutRun


class HealthCheckResponse(BaseModel):
    db: str
    app_layer: str
    core: str

    def __str__(self):
        return f"Health Check Response: \n{json.dumps(self.dict(), indent=4)}"


class WorkflowIdResponse(BaseModel):
    workflow_id: str


class CheckUniqueJobClusterResponseData(BaseModel):
    is_unique: bool


class CheckUniqueJobClusterResponse(BaseModel):
    data: CheckUniqueJobClusterResponseData


class CreateJobClusterDefinitionResponseData(BaseModel):
    job_cluster_definition_id: str


class UpdateJobClusterDefinitionResponseData(BaseModel):
    job_cluster_definition_id: str


class CreateJobClusterDefinitionResponse(BaseModel):
    data: CreateJobClusterDefinitionResponseData


class UpdateJobClusterDefinitionResponse(BaseModel):
    data: UpdateJobClusterDefinitionResponseData


class UpdateClusterDetailsResponseData(BaseModel):
    status: str


class UpdateClusterDetailsResponse(BaseModel):
    data: UpdateClusterDetailsResponseData


class JobClusterDefinitionListResponseData(BaseModel):
    job_cluster_definition_id: str
    cluster_name: str
    cores: int
    memory: int
    runtime: str
    created_at:Optional[str]
    estimated_cost:Optional[str]


class ClusterListResponseData(BaseModel):
    cluster_id: str
    cluster_name: str
    cores: int
    memory: int
    runtime: str
    created_at:str
    estimated_cost:str
    created_by:str
    status: str


class JobClusterDefinitionListResponse(BaseModel):
    data: List[JobClusterDefinitionListResponseData]
    total_count: int



class JobClusterDefinitionDeleteResponseData(BaseModel):
    is_deleted: bool
    job_cluster_id: str


class JobClusterDefinitionDeleteResponse(BaseModel):
    data: JobClusterDefinitionDeleteResponseData


class JobClusterDetailsResponseData(BaseModel):
    cluster_id: str
    cluster_name: str
    tags: List[str]
    runtime: str
    inactive_time: int
    auto_termination_policies: Optional[List[AutoTerminationPolicy]] = []
    head_node_config: HeadNodeConfig
    worker_node_configs: List[WorkerNodeConfig]
    advance_config: AdvanceConfig
    user: str
    cluster_status: str
    created_at: Optional[str]
    estimated_cost: Optional[str]


class JobClusterDetailsResponse(BaseModel):
    data: JobClusterDetailsResponseData


class WorkflowTaskClusterResponseData(BaseModel):
    status: str
    workflow_cluster_id: str


class WorkflowTaskClusterResponse(BaseModel):
    data: WorkflowTaskClusterResponseData


class WorkflowDetails(BaseModel):
    workflow_name: str
    run_id: str
    task_name: str


class ClusterWorkflowResponse(BaseModel):
    data: WorkflowDetails


class TriggerWithParamsResponse(BaseModel):
    run_id: str


class TriggerStatusResponse(BaseModel):
    status: str
    logs_url: str


class CallbackResponse(BaseModel):
    message: str


class RepairRunResponseData(BaseModel):
    message: str


class RepairRunResponse(BaseModel):
    data: RepairRunResponseData

class InsertWorkflowRunResponse(BaseModel):
    message: str

class UpdateWorkflowRunResponse(BaseModel):
    message: str

class WorkflowRunResponse(BaseModel):
    workflow_id: str
    run_id: str
    status: str
    start_time: str
    end_time: str = None
    duration: float = None
    repair_date:str = None
    expected_run_duration: int = None
    sla_exceeded: bool
    created_at: str
    updated_at: str


class DarwinWorkflowRunResponse(BaseModel):
    data: Optional[WorkflowRunResponse]



class TriggerRule(BaseModel):
    id: int
    label: str
    value: str
    description: str


class MetadataResponseData(BaseModel):
    # Allow any field to be added dynamically
    __root__: Dict[str, Any] = {}
    
    class Config:
        extra = "allow"
        
    def __init__(self, **data):
        super().__init__(**{k: v for k, v in data.items()})


class MetadataResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]  # Use Dict[str, Any] for flexible configuration structure

class UpdateMetadataResponse(BaseModel):
    status: str
    message: str
    data: Dict[str, Any]

class UpdateWorkflowStatusResponseData(BaseModel):
    success: bool = Field(..., description="Whether the workflow status was updated successfully")

class UpdateWorkflowStatusResponse(BaseModel):
    data: UpdateWorkflowStatusResponseData = Field(..., description="Response data for updating workflow status")
    message: str = Field(..., description="Response message")
    status: str = Field(..., description="Response status")
