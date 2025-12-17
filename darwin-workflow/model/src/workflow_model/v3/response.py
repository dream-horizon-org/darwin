from typing import List, Optional
from pydantic import BaseModel, Field, root_validator

from workflow_model.response import WorkflowWorkflowIdDeleteResponseData, LastRunDetails
from workflow_model.v3.workflow import WorkflowV3


# V3 Response Models
class CreateWorkflowResponseV3(BaseModel):
    status: str
    message: str = ""
    data: WorkflowV3 = None


class UpdateWorkflowResponseV3(BaseModel):
    status: str
    message: str = ""
    data: WorkflowV3 = None


# V3 workflow list data (includes parameters field)
class WorkflowListDataV3(BaseModel):
    workflow_name: str
    display_name: Optional[str] = Field(default="")
    description: str
    status: str
    workflow_id: str
    tags: List[str]
    schedule: str
    parameters: Optional[dict] = {}
    last_run_details: List[LastRunDetails] = None
    next_run_time: str
    owner: str

    @root_validator
    def set_display_name(cls, values):
        if not values.get("display_name"):
            values["display_name"] = values.get("workflow_name", "")
        return values


class WorkflowsPostResponseV3(BaseModel):
    result_size: int
    page_size: int
    offset: int
    data: List[WorkflowListDataV3]


# V3 workflow details response (uses WorkflowV3 model with TaskRequestV3)
class WorkflowWorkflowIdGetResponseV3(BaseModel):
    data: WorkflowV3


# V3 delete response (same as V2 since it doesn't contain workflow data structures)
class WorkflowWorkflowIdDeleteResponseV3(BaseModel):
    data: WorkflowWorkflowIdDeleteResponseData 