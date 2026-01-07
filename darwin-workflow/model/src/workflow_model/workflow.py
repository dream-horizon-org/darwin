from enum import Enum
from datetime import datetime, timezone
from datetime import datetime as dd
from typing import List, Optional, Dict, Literal, Type, Any, Union
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Json, validator, root_validator, ValidationError, Field

from workflow_model.constants.constants import INACTIVE, CREATING_ARTIFACT, DEFAULT_INTEGER_VALUE, DEFAULT_SCHEDULE, \
    DEFAULT_TIMEZONE, ACTIVE
from workflow_model.meta_data import MetaData
from workflow_model.utils.utils import get_current_time, get_workflow_id, get_workflow_cluster_id
from workflow_model.utils.validators import validate_timezone, \
    validate_optional_integer, is_valid_timetable

# TODO: DEFAULT_NOTIFICATION_PREFERENCE differs between task-level (on_fail, on_skip) and workflow-level (on_start, on_fail, on_success, on_skip)
# TODO: Notification preference structure should be unified across task and workflow levels
DEFAULT_NOTIFICATION_PREFERENCE = {
    "on_fail": False,
    "on_skip": False
}

def validate_notification_preference(value):
    allowed_keys = {"on_fail", "on_skip"}
    if value is not None:
        for key in value:
            if key not in allowed_keys:
                raise ValueError(f"Invalid key '{key}' in notification_preference. Only {allowed_keys} are allowed.")
    return value

class ClusterDetails(BaseModel):
    cluster_id: str
    runtime: str
    cluster_name: str
    cluster_status: str
    memory: int
    cores: int
    ray_dashboard: str
    logs_dashboard: str
    events_dashboard: str
    created_by: Optional[str]
    created_at: Optional[str]
    estimated_cost: Optional[str]

    def to_dict(self):
        return self.dict()

    @validator("cluster_id", pre=True)
    def validate_optional_retries(cls, value):
        if value is None:
            return ""
        try:
            return str(value)
        except (ValueError, TypeError):
            raise ValueError("Value must be an str or None")

    @classmethod
    def from_dict(cls, data):
        return cls(
            cluster_id=data['cluster_id'],
            runtime=data['runtime'],
            cluster_name=data['cluster_name'],
            cluster_status=data['cluster_status'],
            memory=data['memory'],
            cores=data['cores'],
            ray_dashboard=data['ray_dashboard'],
            logs_dashboard=data['logs_dashboard'],
            events_dashboard=data['events_dashboard']
        )

class SourceEnum(str, Enum):
    S3 = "s3"
    PYPI = "pypi"
    WORKSPACE = "workspace"
    MAVEN = "maven"

class RepositoryEnum(str, Enum):
    SPARK = "spark"
    CENTRAL = "maven"

# Library structures
class S3Library(BaseModel):
    path: str  # S3 path

class PyPILibrary(BaseModel):
    name: str  # Package name
    version: Optional[str] = None  # Package version (nullable)
    path: Optional[str] = None  # Index URL (nullable)

class WorkspaceLibrary(BaseModel):
    path: str  # Workspace path

class MavenMetadata(BaseModel):
    repository: RepositoryEnum  # Enum: SPARK | CENTRAL
    exclusions: Optional[str] = None  # Nullable

class MavenLibrary(BaseModel):
    name: str  # group_id:artifact_id
    version: str
    metadata: Optional[MavenMetadata] = None

# Mapping from source to the corresponding body model
SOURCE_MODEL_MAP: dict[SourceEnum, Type[BaseModel]] = {
    SourceEnum.S3: S3Library,
    SourceEnum.PYPI: PyPILibrary,
    SourceEnum.WORKSPACE: WorkspaceLibrary,
    SourceEnum.MAVEN: MavenLibrary,
}

class Package(BaseModel):
    source: SourceEnum
    body: Any

    @root_validator(pre=True)
    def enforce_correct_body_model(cls, values):
        source = values.get("source")
        body = values.get("body")

        if source is None or body is None:
            raise ValueError("Both 'source' and 'body' are required")

        expected_model = SOURCE_MODEL_MAP.get(source)
        if expected_model is None:
            raise ValueError(f"Unsupported source type: {source}")

        try:
            values["body"] = expected_model.parse_obj(body)
        except ValidationError as e:
            raise ValueError(f"Invalid body for source '{source}': {e}")

        return values


class HAConfig(BaseModel):
    enable_ha: Optional[bool] = False
    cluster_ids: Optional[List[str]] = []
    replication_factor: Optional[int] = 3
    cluster_expiration_time: Optional[int] = 86400


class TriggerRuleEnum(str, Enum):
    """
    Airflow Trigger Rules Enum:
    all_success: (default) The task runs only when all upstream tasks have succeeded.
    all_failed: The task runs only when all upstream tasks are in a failed or upstream_failed state.
    all_done: The task runs once all upstream tasks are done with their execution.
    all_skipped: The task runs only when all upstream tasks have been skipped
    one_failed: The task runs when at least one upstream task has failed.
    one_success: The task runs when at least one upstream task has succeeded.
    none_failed: The task runs only when all upstream tasks have not failed or upstream_failed.
    none_failed_min_one_success: The task runs only when all upstream tasks have not failed or upstream_failed, and at least one upstream task has succeeded.
    none_skipped: The task runs only when no upstream task is in a skipped state.
    """
    ALL_SUCCESS = "all_success"
    ALL_FAILED = "all_failed"
    ALL_DONE = "all_done"
    ALL_SKIPPED = "all_skipped"
    ONE_FAILED = "one_failed"
    ONE_SUCCESS = "one_success"
    NONE_FAILED = "none_failed"
    NONE_FAILED_MIN_ONE_SUCCESS = "none_failed_min_one_success"
    NONE_SKIPPED = "none_skipped"

    def __str__(self):
        return self.value

    @classmethod
    def from_str(cls, value):
        """Convert a string to an enum instance."""
        try:
            return cls(value)
        except ValueError:
            raise ValueError(f"'{value}' is not a valid {cls.__name__}")

    def __eq__(self, other):
        """Allow direct comparison with strings."""
        if isinstance(other, str):
            return self.value == other
        return super().__eq__(other)



class WorkflowTaskRequest(BaseModel):
    task_name: str
    source: str
    source_type: str
    file_path: str
    dynamic_artifact: bool
    cluster_id: str
    cluster_type: str
    dependent_libraries: str
    input_parameters: dict
    retries: int
    timeout: int
    depends_on: List[str]
    ha_config: Optional[HAConfig]
    trigger_rule: Optional[TriggerRuleEnum] = TriggerRuleEnum.ALL_SUCCESS
    packages: Optional[List[Package]]
    notification_preference: Optional[Dict[str, bool]] = Field(default_factory=lambda: DEFAULT_NOTIFICATION_PREFERENCE.copy())
    notify_on: Optional[str] = None

    def to_dict(self):
        d = self.dict()
        if isinstance(self.trigger_rule, TriggerRuleEnum):
            d['trigger_rule'] = self.trigger_rule.value
        return d

    @classmethod
    def from_dict(cls, data):
        def trigger_rule_parse(data):
            return TriggerRuleEnum(data.get('trigger_rule', TriggerRuleEnum.ALL_SUCCESS)) \
            if data.get('trigger_rule') is not None and not isinstance(data.get('trigger_rule'), TriggerRuleEnum) \
            else data.get('trigger_rule', TriggerRuleEnum.ALL_SUCCESS)
        
        return cls(
            task_name=data['task_name'],
            source=data['source'],
            source_type=data['source_type'],
            file_path=data['file_path'],
            dynamic_artifact=data['dynamic_artifact'],
            cluster_id=data['cluster_id'],
            cluster_type=data['cluster_type'],
            dependent_libraries=data['dependent_libraries'],
            input_parameters=data['input_parameters'],
            retries=data['retries'],
            timeout=data['timeout'],
            depends_on=data['depends_on'],
            packages=data['packages'],
            notification_preference=data.get('notification_preference', DEFAULT_NOTIFICATION_PREFERENCE.copy()),
            notify_on=data.get('notify_on', ""),
            trigger_rule=trigger_rule_parse(data)
        )

    @validator("retries", pre=True)
    def validate_optional_retries(cls, value):
        return validate_optional_integer(value)

    @validator("timeout", pre=True)
    def validate_optional_timeout(cls, value):
      return validate_optional_integer(value)

    @validator("trigger_rule", pre=True)
    def validate_trigger_rule(cls, value):
        if value is None:
            return TriggerRuleEnum.ALL_SUCCESS
        if isinstance(value, str):
            try:
                return TriggerRuleEnum(value)
            except ValueError:
                raise ValueError(f"Invalid trigger rule: {value}")
        if isinstance(value, TriggerRuleEnum):
            return value
        raise ValueError("trigger_rule must be a string or TriggerRuleEnum")

    @validator("notification_preference")
    def notification_preference_validator(cls, value):
        return validate_notification_preference(value)


class CreateWorkflowRequest(BaseModel):
    workflow_name: str
    display_name: str = ""
    description: str
    tags: List[str]
    schedule: str
    retries: int
    notify_on: str
    parameters: Optional[dict] = {}
    start_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"))
    end_date: Optional[str]
    callback_urls: Optional[List[str]] = []
    event_types: Optional[List[str]] = []
    max_concurrent_runs: int
    workflow_status: str = "active"
    tasks: List[WorkflowTaskRequest]
    tenant: str = "d11"
    expected_run_duration: int = None
    queue_enabled: Optional[bool] = False
    notification_preference: Optional[Dict[str, bool]] = {
        "on_start": False,  # or set as needed
        "on_fail": True,  # default is True
        "on_success": False,  # or set as needed
        "on_skip": False  # or set as needed
    }
    timezone: Literal["UTC", "IST"] = DEFAULT_TIMEZONE

    def to_dict(self):
        return self.dict()

    @classmethod
    def from_dict(cls, data):
        return cls(
            workflow_name=data['workflow_name'],
            description=data['description'],
            tags=data['tags'],
            schedule=data['schedule'],
            retries=data['retries'],
            notify_on=data['notify_on'],
            max_concurrent_runs=data['max_concurrent_runs'],
            workflow_status=data['workflow_status'],
            tasks=[
                WorkflowTaskRequest.from_dict(task)
                for task in data['tasks']
            ]
        )

    @root_validator(pre=True)
    def set_default_start_date(cls, values: dict) -> dict:
        # If the "start_date" is not provided, set it to the current date and time
        # based on the specified timezone ("IST" or "UTC").
        if not values.get("start_date"):
            tz_value = values.get("timezone", DEFAULT_TIMEZONE)
            timezone_value = "Asia/Kolkata" if tz_value == "IST" else "UTC"
            values["start_date"] = datetime.now(ZoneInfo(timezone_value)).strftime("%Y-%m-%dT%H:%M:%S")
        return values

    @validator("timezone")
    def validate_timezone(cls, value):
        # Validate the provided timezone value using the custom validator function.
        return validate_timezone(value)

    @validator("workflow_status")
    def validate_workflow_status(cls, value):
        if value not in [ACTIVE, INACTIVE, "", None]:
            raise ValueError(f"Workflow Status should be {ACTIVE} or {INACTIVE}, not {value}")
        return value

    @validator("retries", "max_concurrent_runs", pre=True)
    def validate_optional_integer(cls, value):
        return validate_optional_integer(value)

    @validator("start_date", pre=True)
    def validate_start_date(cls, value):
        try:
            get_date(value)
        except ValueError:
            raise ValueError("Start date is not in valid format. Expected 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'.")
        return value

    @validator("end_date", pre=True)
    def validate_end_date(cls, value):
        if value == "":
            return value
        try:
            get_date(value)
        except ValueError:
            raise ValueError("End date is not in valid format. Expected 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'.")
        return value

    @validator("schedule", pre=True)
    def validate_schedule(cls, value):
        if not value:
            return DEFAULT_SCHEDULE
        if is_valid_timetable(value):
            return str(value)
        else:
            raise ValueError("Schedule is not in valid format. Please check https://crontab.guru/ for valid expressions")


class UpdateWorkflowRequest(BaseModel):
    workflow_name: str
    display_name: str = ""
    description: str
    tags: List[str]
    schedule: str
    retries: int
    notify_on: str
    parameters: Optional[dict] = {}
    max_concurrent_runs: int
    workflow_status: str = ""
    start_date: Optional[str]
    end_date: Optional[str]
    callback_urls: Optional[List[str]] = []
    event_types: Optional[List[str]] = []
    tasks: List[WorkflowTaskRequest]
    tenant: str = "d11"
    expected_run_duration: int = None
    queue_enabled: Optional[bool] = False
    notification_preference: Optional[Dict[str, bool]] = {
        "on_start": False,
        "on_fail": True,
        "on_success": False,
        "on_skip": False
    }
    timezone: Literal["UTC", "IST"] = DEFAULT_TIMEZONE

    def to_dict(self):
        return self.dict()

    @validator("timezone")
    def validate_timezone(cls, value):
        if value is None:
            return value
        return validate_timezone(value)

    @validator("schedule", pre=True)
    def validate_schedule(cls, value):
        if not value:
            return DEFAULT_SCHEDULE
        if is_valid_timetable(value):
            return str(value)
        else:
            raise ValueError(
                "Schedule is not in valid format. Please check https://crontab.guru/ for valid expressions")

    @validator("retries", "max_concurrent_runs", pre=True)
    def validate_optional_integer(cls, value):
        return validate_optional_integer(value)

    @validator("end_date", pre=True)
    def validate_end_date(cls, value):
        if value == "" or value is None:
            return ""
        try:
            get_date(value)
        except ValueError:
            raise ValueError("End date is not in valid format. Expected 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'.")
        return value


class WorkflowTask(BaseModel):
    task_name: str
    source: str
    source_type: str
    file_path: str
    dynamic_artifact: bool
    cluster_type: str
    attached_cluster: ClusterDetails
    dependent_libraries: str
    input_parameters: dict
    retries: Optional[int]
    timeout: Optional[int]
    depends_on: List[str]
    task_validation_status: str
    packages: Optional[List[Package]] = None
    run_status: str
    ha_config: Optional[HAConfig]
    notification_preference: Optional[Dict[str, bool]] = Field(default_factory=lambda: DEFAULT_NOTIFICATION_PREFERENCE.copy())
    notify_on: Optional[str] = None
    trigger_rule: Optional[str] = None

    def to_dict(self):
        return self.dict()

    def to_yaml(self):
        task = self.to_dict()
        task['attached_cluster'] = self.attached_cluster.cluster_id
        task.pop("task_validation_status")
        task.pop("run_status")
        return task

    @classmethod
    def from_dict(cls, data):
        return cls(
            task_name=data['task_name'],
            source=data['source'],
            source_type=data['source_type'],
            file_path=data['file_path'],
            dynamic_artifact=data['dynamic_artifact'],
            attached_cluster=ClusterDetails.from_dict(data['attached_cluster']),
            dependent_libraries=data['dependent_libraries'],
            cluster_type=data['cluster_type'],
            input_parameters=data['input_parameters'],
            retries=data['retries'],
            timeout=data['timeout'],
            depends_on=data['depends_on'],
            task_validation_status=data['task_validation_status'],
            run_status=data['run_status'],
            notification_preference=data.get('notification_preference', DEFAULT_NOTIFICATION_PREFERENCE.copy()),
            notify_on=data.get('notify_on', ""),
            trigger_rule=data.get('trigger_rule', None),
        )
    
    @validator("notification_preference")
    def notification_preference_validator(cls, value):
        return validate_notification_preference(value)

    @validator("trigger_rule", pre=True)
    def validate_trigger_rule(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            try:
                TriggerRuleEnum(value)
                return value
            except ValueError:
                raise ValueError(f"Invalid trigger rule: {value}")
        raise ValueError("trigger_rule must be a string or TriggerRuleEnum")


class RecentlyVisitedDto(BaseModel, MetaData):
    user_id: str
    visited: List[str]

    def to_dict(self):
        return self.dict()

    @classmethod
    def from_dict(cls, data):
        return cls(
            user_id=data['user_id'],
            visited=data['visited']
        )


class Workflow(BaseModel, MetaData):
    workflow_id: str
    workflow_name: str
    display_name: Optional[str] = ""
    description: str
    tags: List[str]
    schedule: str
    retries: int
    notify_on: str
    parameters: Optional[dict] = {}
    max_concurrent_runs: int
    start_date: Optional[str]
    end_date: Optional[str]
    callback_urls: Optional[List[str]] = []
    event_types: Optional[List[str]] = []
    created_by: str
    last_updated_on: str
    created_at: str
    workflow_status: str
    tenant: str = "d11"
    expected_run_duration: int = None
    tasks: List[WorkflowTask]
    queue_enabled: Optional[bool] = False
    notification_preference: Optional[Dict[str, bool]] = {
        "on_start": False,  # or set as needed
        "on_fail": True,  # default is True
        "on_success": False,  # or set as needed
        "on_skip": False  # or set as needed
    }
    timezone: Literal["UTC", "IST"] = DEFAULT_TIMEZONE

    def to_dict(self):
        return self.dict()

    def to_yaml(self):
        tasks = []
        for task in self.tasks:
            task = task.to_yaml()
            tasks.append(task)
        workflow = self.to_dict()
        workflow['tasks'] = tasks
        return workflow

    @classmethod
    def from_dict(cls, data):
        return cls(
            workflow_id=data['workflow_id'],
            workflow_name=data['workflow_name'],
            display_name=data['display_name'],
            description=data['description'],
            tags=data['tags'],
            schedule=data['schedule'],
            retries=data['retries'],
            notify_on=data['notify_on'],
            parameters=data['parameters'],
            max_concurrent_runs=data['max_concurrent_runs'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            callback_urls=data['callback_urls'],
            event_types=data['event_types'],
            created_by=data['created_by'],
            last_updated_on=data['last_updated_on'],
            created_at=data['created_at'],
            workflow_status=data['workflow_status'],
            tasks=[
                WorkflowTask.from_dict(task)
                for task in data['tasks']
            ],
            queue_enabled=data['queue_enabled'],
            notification_preference=data['notification_preference']
        )


def get_cluster_details(cluster_type: str, cluster_id: str):
    return ClusterDetails(cluster_id=cluster_id, runtime="", cluster_name="", cluster_status="", memory=0, cores=0,
                          ray_dashboard="", logs_dashboard="", events_dashboard="")


def get_workflow_task(workflow_task_request: WorkflowTaskRequest):
    return WorkflowTask(
        task_name=workflow_task_request.task_name,
        source=workflow_task_request.source,
        source_type=workflow_task_request.source_type,
        file_path=workflow_task_request.file_path,
        dynamic_artifact=workflow_task_request.dynamic_artifact,
        cluster_type=workflow_task_request.cluster_type,
        attached_cluster=get_cluster_details(workflow_task_request.cluster_type, workflow_task_request.cluster_id),
        dependent_libraries=workflow_task_request.dependent_libraries,
        input_parameters=workflow_task_request.input_parameters,
        retries=workflow_task_request.retries,
        timeout=workflow_task_request.timeout,
        depends_on=workflow_task_request.depends_on,
        task_validation_status="VALID",
        run_status="INACTIVE",
        packages=workflow_task_request.packages,
        ha_config=workflow_task_request.ha_config,
        notification_preference=workflow_task_request.notification_preference,
        notify_on=workflow_task_request.notify_on,
        trigger_rule=str(workflow_task_request.trigger_rule) if workflow_task_request.trigger_rule is not None else None
    )


# TODO: To be removed once we have v3
def get_workflow(workflow_request: CreateWorkflowRequest, user_email: str):
    current_time = get_current_time()
    return Workflow(
        workflow_id=get_workflow_id(),
        workflow_name=workflow_request.workflow_name,
        display_name=workflow_request.display_name,
        description=workflow_request.description,
        tags=workflow_request.tags,
        schedule=workflow_request.schedule,
        retries=workflow_request.retries,
        notify_on=workflow_request.notify_on,
        parameters=workflow_request.parameters,
        max_concurrent_runs=workflow_request.max_concurrent_runs,
        start_date=workflow_request.start_date,
        end_date=workflow_request.end_date,
        callback_urls=workflow_request.callback_urls,
        event_types=workflow_request.event_types,
        created_by=user_email,
        last_updated_on=current_time,
        created_at=current_time,
        workflow_status=INACTIVE,
        tasks=[get_workflow_task(task) for task in workflow_request.tasks],
        expected_run_duration=workflow_request.expected_run_duration,
        queue_enabled=workflow_request.queue_enabled,
        notification_preference=workflow_request.notification_preference,
        timezone=workflow_request.timezone
    )


def get_workflow_v2(workflow_request: CreateWorkflowRequest, user_email: str):
    current_time = get_current_time()
    return Workflow(
        workflow_id=get_workflow_id(),
        workflow_name=workflow_request.workflow_name,
        display_name=workflow_request.display_name,
        description=workflow_request.description,
        tags=workflow_request.tags,
        schedule=workflow_request.schedule,
        retries=workflow_request.retries,
        notify_on=workflow_request.notify_on,
        parameters=workflow_request.parameters,
        max_concurrent_runs=workflow_request.max_concurrent_runs,
        start_date=workflow_request.start_date,
        end_date=workflow_request.end_date,
        callback_urls=workflow_request.callback_urls,
        event_types=workflow_request.event_types,
        created_by=user_email,
        last_updated_on=current_time,
        created_at=current_time,
        workflow_status=CREATING_ARTIFACT,
        tasks=[get_workflow_task(task) for task in workflow_request.tasks],
        tenant=workflow_request.tenant,
        expected_run_duration=workflow_request.expected_run_duration,
        queue_enabled=workflow_request.queue_enabled,
        notification_preference=workflow_request.notification_preference,
        timezone=workflow_request.timezone
    )


def get_update_workflow(created_by: str, created_at: str, workflow_request: UpdateWorkflowRequest, workflow_id: str, start_date: str, end_date: str):
    current_time = get_current_time()
    return Workflow(
        workflow_id=workflow_id,
        workflow_name=workflow_request.workflow_name,
        display_name=workflow_request.display_name,
        description=workflow_request.description,
        tags=workflow_request.tags,
        schedule=workflow_request.schedule,
        retries=workflow_request.retries,
        notify_on=workflow_request.notify_on,
        parameters=workflow_request.parameters,
        max_concurrent_runs=workflow_request.max_concurrent_runs,
        start_date=start_date,
        end_date=end_date,
        callback_urls=workflow_request.callback_urls,
        event_types=workflow_request.event_types,
        created_by=created_by,
        last_updated_on=current_time,
        created_at=created_at,
        workflow_status=INACTIVE,
        tasks=[get_workflow_task(task) for task in workflow_request.tasks],
        tenant=workflow_request.tenant,
        expected_run_duration=workflow_request.expected_run_duration,
        queue_enabled=workflow_request.queue_enabled,
        notification_preference=workflow_request.notification_preference,
        timezone=workflow_request.timezone
    )


class WorkflowTaskClusterRequest(BaseModel):
    workflow_name: str
    run_id: str
    task_name: str
    cluster_id: str

    def to_dict(self, encode_json=False) -> dict[str, Json]:
        return self.dict()

    @classmethod
    def from_dict(cls, data):
        return cls(
            workflow_name=data['workflow_name'],
            run_id=data['run_id'],
            task_name=data['task_name'],
            cluster_id=data['cluster_id']
        )


class WorkflowTaskClusterRequestV2(BaseModel):
    workflow_name: str
    run_id: str
    task_name: str
    cluster_id: str
    try_number: int

    def to_dict(self, encode_json=False) -> dict[str, Json]:
        return self.dict()

    @classmethod
    def from_dict(cls, data):
        return cls(
            workflow_name=data['workflow_name'],
            run_id=data['run_id'],
            task_name=data['task_name'],
            cluster_id=data['cluster_id'],
            try_number=data['try_number']
        )


class WorkflowTaskCluster(BaseModel, MetaData):
    workflow_cluster_id: str
    workflow_name: str
    run_id: str
    task_name: str
    cluster_id: str

    def to_dict(self, encode_json=False) -> dict[str, Json]:
        return self.dict()


class WorkflowTaskClusterV2(BaseModel, MetaData):
    workflow_cluster_id: str
    workflow_name: str
    run_id: str
    task_name: str
    cluster_id: str
    try_number: Optional[int]

    def to_dict(self, encode_json=False) -> dict[str, Json]:
        return self.dict()


def get_workflow_task_cluster(workflow_task_cluster_request: WorkflowTaskClusterRequest):
    return WorkflowTaskCluster(
        workflow_cluster_id=get_workflow_cluster_id(),
        workflow_name=workflow_task_cluster_request.workflow_name,
        run_id=workflow_task_cluster_request.run_id,
        task_name=workflow_task_cluster_request.task_name,
        cluster_id=workflow_task_cluster_request.cluster_id
    )


def get_workflow_task_cluster_v2(workflow_task_cluster_request: WorkflowTaskClusterRequestV2):
    return WorkflowTaskClusterV2(
        workflow_cluster_id=get_workflow_cluster_id(),
        workflow_name=workflow_task_cluster_request.workflow_name,
        run_id=workflow_task_cluster_request.run_id,
        task_name=workflow_task_cluster_request.task_name,
        cluster_id=workflow_task_cluster_request.cluster_id,
        try_number=workflow_task_cluster_request.try_number
    )


class LatestTaskRun(BaseModel, MetaData):
    dag_id: str
    run_id: str
    task_id: str
    start_date: str
    end_date: Optional[str]
    duration: Optional[float]
    state: Optional[str]
    try_number: int

    def to_dict(self):
        return self.dict()

    @classmethod
    def from_dict(cls, data):
        return cls(
            dag_id=data['dag_id'],
            run_id=data['run_id'],
            task_id=data['task_id'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            duration=data['duration'],
            state=data['state'],
            try_number=data['try_number']
        )


# TODO: Hardcoded default start_date "2021-01-01" is legacy - should use dynamic default
class VersionedWorkflow(BaseModel, MetaData):
    workflow_id: str
    workflow_version: int
    workflow_name: str
    display_name: str = ""
    description: str
    tags: List[str]
    schedule: str
    retries: int
    notify_on: str
    parameters: Optional[dict] = {}
    max_concurrent_runs: int
    start_date: str = "2021-01-01"
    end_date: Optional[str]
    callback_urls: Optional[List[str]] = []
    event_types: Optional[List[str]] = []
    created_by: str
    last_updated_on: str
    created_at: str
    workflow_status: str
    tasks: List[WorkflowTask]
    tenant: str = 'd11'
    queue_enabled: Optional[bool] = False
    notification_preference: Optional[Dict[str, bool]] = {
        "on_start": False,  # or set as needed
        "on_fail": True,  # default is True
        "on_success": False,  # or set as needed
        "on_skip": False  # or set as needed
    }

    def to_dict(self):
        return self.dict()

    def to_yaml(self):
        tasks = []
        for task in self.tasks:
            task = task.to_yaml()
            tasks.append(task)
        workflow = self.to_dict()
        workflow['tasks'] = tasks
        return workflow

    @classmethod
    def from_dict(cls, data):
        return cls(
            workflow_id=data['workflow_id'],
            version=data['version'],
            workflow_name=data['workflow_name'],
            display_name=data['display_name'],
            description=data['description'],
            tags=data['tags'],
            schedule=data['schedule'],
            retries=data['retries'],
            notify_on=data['notify_on'],
            parameters=data['parameters'],
            max_concurrent_runs=data['max_concurrent_runs'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            callback_urls=data['callback_urls'],
            event_types=data['event_types'],
            created_by=data['created_by'],
            last_updated_on=data['last_updated_on'],
            created_at=data['created_at'],
            workflow_status=data['workflow_status'],
            tasks=[
                WorkflowTask.from_dict(task)
                for task in data['tasks']
            ]
        )


def get_date(date:str):
    try:
        return dd.strptime(date, "%Y-%m-%dT%H:%M:%S")  # Try full datetime
    except ValueError:
        try:
            return dd.strptime(date, "%Y-%m-%d")  # Try only date (defaults time to 00:00:00)
        except ValueError:
            raise ValueError(f"⚠️ Invalid date format: '{date}'. Expected 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'.")


def get_current_workflow(workflow_request: Workflow, workflow_version: int):
    return VersionedWorkflow(
        workflow_id=workflow_request.workflow_id,
        workflow_version=workflow_version,
        workflow_name=workflow_request.workflow_name,
        display_name=workflow_request.display_name,
        description=workflow_request.description,
        tags=workflow_request.tags,
        schedule=workflow_request.schedule,
        retries=workflow_request.retries,
        notify_on=workflow_request.notify_on,
        parameters=workflow_request.parameters,
        max_concurrent_runs=workflow_request.max_concurrent_runs,
        start_date=workflow_request.start_date,
        end_date=workflow_request.end_date,
        callback_urls=workflow_request.callback_urls,
        event_types=workflow_request.event_types,
        created_by=workflow_request.created_by,
        last_updated_on=workflow_request.last_updated_on,
        created_at=workflow_request.created_at,
        workflow_status=INACTIVE,
        tasks=[task for task in workflow_request.tasks]
    )


def convert_task_to_workflow_task_request(task: WorkflowTask) -> WorkflowTaskRequest:
    return WorkflowTaskRequest(
        task_name=task.task_name,
        source=task.source,
        source_type=task.source_type,
        file_path=task.file_path,
        dynamic_artifact=task.dynamic_artifact,
        cluster_id=task.attached_cluster.cluster_id,
        cluster_type=task.cluster_type,
        dependent_libraries=task.dependent_libraries,
        input_parameters=task.input_parameters,
        packages=task.packages,
        retries=task.retries,
        timeout=task.timeout,
        depends_on=task.depends_on,
        notification_preference=task.notification_preference,
        notify_on=task.notify_on,
        ha_config=task.ha_config,
        trigger_rule=task.trigger_rule
    )


def convert_workflow_to_update_request(wf: Workflow) -> UpdateWorkflowRequest:
    return UpdateWorkflowRequest(
        workflow_name=wf.workflow_name,
        description=wf.description,
        schedule=wf.schedule,
        start_date=wf.start_date,
        end_date=wf.end_date,
        tags=wf.tags,
        retries=wf.retries,
        notify_on=wf.notify_on,
        parameters=wf.parameters,
        max_concurrent_runs=wf.max_concurrent_runs,
        callback_urls=wf.callback_urls,
        event_types=wf.event_types,
        tasks=[convert_task_to_workflow_task_request(task) for task in wf.tasks],
    )


class RepairRunRequest(BaseModel):
    run_id: str
    selected_tasks: List[str]


