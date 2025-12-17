from datetime import datetime
from typing import List, Optional, Dict
from zoneinfo import ZoneInfo
from pydantic import validator, root_validator, BaseModel

from workflow_model.constants.constants import (
    ACTIVE, INACTIVE, DEFAULT_TIMEZONE, DEFAULT_SCHEDULE,
)
from workflow_model.workflow import CreateWorkflowRequest, UpdateWorkflowRequest
from workflow_model.utils.validators import (
    validate_timezone, validate_and_convert_start_or_end_date,
    is_valid_timetable, validate_optional_integer, validate_name, validate_task_dependencies,
    check_if_end_date_has_passed
)
from workflow_model.v3.task import TaskV3


class CreateWorkflowRequestV3(CreateWorkflowRequest):
    # Override tasks field with V3 task type
    tasks: List[TaskV3]
    # V3 includes parameters field
    parameters: Optional[Dict] = {}
    
    @validator('workflow_name')
    def validate_workflow_name(cls, value):
        return validate_name(value, "workflow name")

    @validator('schedule')
    def validate_schedule(cls, value):
        if not value:
            return DEFAULT_SCHEDULE
        if not is_valid_timetable(value):
            raise ValueError("Not a valid cron expression for the timetable. Please check https://crontab.guru/ for valid expressions")
        return str(value)

    @validator('timezone')
    def validate_timezone(cls, value):
        return validate_timezone(value)

    @validator('start_date', pre=True)
    def validate_start_date(cls, value, values):
        if not value:
            timezone_value = values.get('timezone', DEFAULT_TIMEZONE)
            timezone_str = "Asia/Kolkata" if timezone_value == "IST" else "UTC"
            return datetime.now(ZoneInfo(timezone_str)).strftime("%Y-%m-%dT%H:%M:%S")
        return validate_and_convert_start_or_end_date(value, values.get('timezone', DEFAULT_TIMEZONE))

    @validator('end_date', pre=True)
    def validate_end_date(cls, value, values):
        if not value:
            return value
        return validate_and_convert_start_or_end_date(value, values.get('timezone', DEFAULT_TIMEZONE))

    @validator('retries', 'max_concurrent_runs', pre=True)
    def validate_optional_integers(cls, value):
        return validate_optional_integer(value)

    @root_validator
    def validate_tasks(cls, values):
        tasks = values.get('tasks', [])
        validate_task_dependencies(tasks)
        return values

    @root_validator
    def validate_end_date_not_passed(cls, values):
        """Validate that end date is not in the past"""
        end_date = values.get('end_date')
        if end_date and check_if_end_date_has_passed(end_date):
            raise ValueError("End date has passed. Please select a future date.")
        return values

class UpdateWorkflowRequestV3(UpdateWorkflowRequest):
    # Override tasks field with V3 task type
    tasks: List[TaskV3]
    # V3 includes parameters field
    parameters: Optional[Dict] = {}
    
    @validator('workflow_status')
    def validate_workflow_status_v3(cls, value):
        if value and value not in [ACTIVE, INACTIVE]:
            raise ValueError(f"Workflow Status should be {ACTIVE} or {INACTIVE}, not {value}")
        return value

    @validator('workflow_name')
    def validate_workflow_name(cls, value):
        return validate_name(value, "workflow name")

    @validator('schedule')
    def validate_schedule(cls, value):
        if not value:
            return DEFAULT_SCHEDULE
        if not is_valid_timetable(value):
            raise ValueError("Not a valid cron expression for the timetable. Please check https://crontab.guru/ for valid expressions")
        return str(value)

    @validator('timezone')
    def validate_timezone(cls, value):
        return validate_timezone(value)

    @validator('start_date', pre=True)
    def validate_start_date(cls, value, values):
        if not value:
            return value
        return validate_and_convert_start_or_end_date(value, values.get('timezone', DEFAULT_TIMEZONE))

    @validator('end_date', pre=True)
    def validate_end_date(cls, value, values):
        if not value:
            return value
        return validate_and_convert_start_or_end_date(value, values.get('timezone', DEFAULT_TIMEZONE))

    @validator('retries', 'max_concurrent_runs', pre=True)
    def validate_optional_integers(cls, value):
        return validate_optional_integer(value)

    @root_validator
    def validate_tasks(cls, values):
        tasks = values.get('tasks', [])
        validate_task_dependencies(tasks)
        return values

    @root_validator
    def validate_end_date_not_passed(cls, values):
        """Validate that end date is not in the past"""
        end_date = values.get('end_date')
        if end_date and check_if_end_date_has_passed(end_date):
            raise ValueError("End date has passed. Please select a future date.")
        return values

# V3 GET request model for workflows search using query parameters
class WorkflowsGetRequestV3(BaseModel):
    query: str = ""
    user_filters: Optional[List[str]] = None
    status_filters: Optional[List[str]] = None
    page_size: int = 10
    offset: int = 0
    sort_by: str = "created_at"
    sort_order: str = "desc" 