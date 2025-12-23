from tortoise.contrib.pydantic import pydantic_model_creator

from workflow_model.v3.darwin_workflow import TaskRun

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RunMetadata(BaseModel):
    error_type: Optional[str] = None
    message: Optional[str] = None
    stacktrace: Optional[str] = None
    run_url: Optional[str] = None

class TaskRunV3(BaseModel):
    workflow_id: str
    run_id: str
    task_name: str  # foreign key to TaskV3
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    run_status: Optional[str] = None
    attempt: Optional[int] = 1
    run_metadata: Optional[RunMetadata] = None


TaskRunOut = pydantic_model_creator(TaskRun, name="TaskRunOut")
