from pydantic import BaseModel, root_validator, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from tortoise.contrib.pydantic import pydantic_model_creator
from workflow_model.v3.darwin_workflow import WorkflowRunV3
from workflow_model.v3.task_run import TaskRunV3

# Constants
MANUAL = "MANUAL"
SCHEDULED = "SCHEDULED"
EXTERNAL = "EXTERNAL"

# 🧱 Base schema for reuse
class WorkflowRunBase(BaseModel):
    run_id: str
    workflow_id: str
    workflow_name: Optional[str]
    dag_id: str
    state: str
    parameters: Dict[str, Any] = {}
    attempt: Optional[int] = 1
    run_type: str
    triggered_by: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    repair_time: Optional[datetime] = None
    expected_run_duration: Optional[int] = None
    sla_exceeded: Optional[bool] = False

    @root_validator(pre=True)
    def autofill_fields(cls, values):
        run_id = values.get("run_id", "")
        dag_id = values.get("dag_id")

        # 🧠 Auto infer run_type & triggered_by from run_id
        if "manual" in run_id.lower():
            values.setdefault("run_type", MANUAL)
            values.setdefault("triggered_by", EXTERNAL)
        else:
            values.setdefault("run_type", SCHEDULED)
            values.setdefault("triggered_by", SCHEDULED)

        # 🧠 Default workflow_name = dag_id if not provided
        if not values.get("workflow_name") and dag_id:
            values["workflow_name"] = dag_id

        return values

# 🚀 Create schema (same as base)
class WorkflowRunCreate(WorkflowRunBase):
    pass

# UPDATE — All optional
class WorkflowRunUpdate(BaseModel):
    run_id: Optional[str]
    workflow_id: Optional[str]
    workflow_name: Optional[str]
    dag_id: Optional[str]
    state: Optional[str]
    parameters: Optional[Dict[str, Any]]
    attempt: Optional[int]
    run_type: Optional[str]
    triggered_by: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration: Optional[int]
    repair_time: Optional[datetime]
    expected_run_duration: Optional[int]
    sla_exceeded: Optional[bool]

    @root_validator(pre=True)
    def autofill_fields(cls, values):
        run_id = values.get("run_id", "")
        dag_id = values.get("dag_id")

        # 🧠 Auto infer run_type & triggered_by from run_id
        if "manual" in run_id.lower():
            values.setdefault("run_type", MANUAL)
            values.setdefault("triggered_by", EXTERNAL)
        else:
            values.setdefault("run_type", SCHEDULED)
            values.setdefault("triggered_by", SCHEDULED)

        # 🧠 Default workflow_name = dag_id if not provided
        if not values.get("workflow_name") and dag_id:
            values["workflow_name"] = dag_id

        return values

# 📤 Auto-generated output schema
WorkflowRunOut = pydantic_model_creator(
    WorkflowRunV3
)

# 📥 List query input
class WorkflowRunsListQuery(BaseModel):
    start_date: str
    end_date: str
    offset: int = 0
    page_size: int = 10
    filters: List[Dict[str, Any]] = []

# 📤 Paginated response
class WorkflowRunsResponse(BaseModel):
    result_size: int
    page_size: int
    offset: int
    data: List[WorkflowRunOut]

class StopRunWorkflowRunRequest(BaseModel):
    run_id: str

class RunNowWorkflowRequest(BaseModel):
    parameters: Optional[dict] = {}

class RepairRunStatus(BaseModel):
    status: Optional[str] = Field(default="")

class RunDetailsV3(BaseModel):
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
    tasks: List[TaskRunV3]
    repair_run: Optional[RepairRunStatus]
    expected_run_duration : Optional[float] = None
    is_run_duration_exceeded : Optional[bool] = False
