from typing import List, Optional, Dict, Literal, Union, Any
from pydantic import BaseModel, root_validator
from workflow_model.utils.utils import get_current_time, get_workflow_id

from workflow_model.meta_data import MetaData
from workflow_model.constants.constants import (
    DEFAULT_TIMEZONE
)
from workflow_model.v3.request import UpdateWorkflowRequestV3, CreateWorkflowRequestV3
from workflow_model.workflow import WorkflowTask
from workflow_model.v3.task import (
    TaskV3, DarwinConfig
)


# V3 Workflow model for response data (uses TaskRequestV3 instead of WorkflowTask)
class WorkflowV3(BaseModel, MetaData):
    workflow_id: str
    workflow_name: str
    display_name: Optional[str] = ""
    description: str
    tags: List[str]
    schedule: str
    retries: int
    notify_on: str
    parameters: Optional[dict] = {}  # V3 includes parameters field
    max_concurrent_runs: int
    start_date: str
    end_date: Optional[str]
    callback_urls: Optional[List[str]] = []
    event_types: Optional[List[str]] = []
    created_by: str
    last_updated_on: str
    created_at: str
    workflow_status: str = "active"
    tenant: str = "d11"
    expected_run_duration: int = None
    tasks: List[TaskV3]  # V3 uses TaskRequestV3 instead of WorkflowTask
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

    def update_from_request(self, request: UpdateWorkflowRequestV3):
        """Update workflow fields from an update request."""
        updated = self.copy()
        for field, value in request.dict(exclude_unset=True).items():
            if value is not None:
                setattr(updated, field, value)
        return updated


# Conversion function from WorkflowTask to TaskRequestV3
def convert_workflow_task_to_task_request_v3(task: WorkflowTask) -> TaskV3:
    """Convert WorkflowTask to TaskRequestV3 for V3 API responses"""
    
    # Determine task type and create appropriate config
    if task.cluster_type == "job":
        # This is likely a Pelican task if it's using job clusters
        # For now, we'll map to Darwin config as we need more context to determine Pelican vs Darwin
        task_config = DarwinConfig(
            source=task.source,
            source_type=task.source_type,
            file_path=task.file_path,
            dynamic_artifact=task.dynamic_artifact,
            cluster_id=task.attached_cluster.cluster_id if task.attached_cluster else None,
            cluster_type=task.cluster_type,
            dependent_libraries=task.dependent_libraries,
            input_parameters=task.input_parameters,
            ha_config=task.ha_config,
            packages=task.packages or []
        )
        task_type = "darwin"
    else:
        # Default to Darwin config
        task_config = DarwinConfig(
            source=task.source,
            source_type=task.source_type,
            file_path=task.file_path,
            dynamic_artifact=task.dynamic_artifact,
            cluster_id=task.attached_cluster.cluster_id if task.attached_cluster else None,
            cluster_type=task.cluster_type,
            dependent_libraries=task.dependent_libraries,
            input_parameters=task.input_parameters,
            ha_config=task.ha_config,
            packages=task.packages or []
        )
        task_type = "darwin"
    
    return TaskV3(
        task_name=task.task_name,
        task_type=task_type,
        task_config=task_config,
        retries=task.retries,
        timeout=task.timeout,
        depends_on=task.depends_on
    )


# Conversion function from Workflow to WorkflowV3
def convert_workflow_to_workflow_v3(workflow) -> WorkflowV3:
    """Convert Workflow to WorkflowV3 for V3 API responses"""
    
    return WorkflowV3(
        workflow_id=workflow.workflow_id,
        workflow_name=workflow.workflow_name,
        display_name=workflow.display_name,
        description=workflow.description,
        tags=workflow.tags,
        schedule=workflow.schedule,
        retries=workflow.retries,
        notify_on=workflow.notify_on,
        parameters=workflow.parameters,
        max_concurrent_runs=workflow.max_concurrent_runs,
        start_date=workflow.start_date,
        end_date=workflow.end_date,
        callback_urls=workflow.callback_urls,
        event_types=workflow.event_types,
        created_by=workflow.created_by,
        last_updated_on=workflow.last_updated_on,
        created_at=workflow.created_at,
        workflow_status=workflow.workflow_status,
        tenant=workflow.tenant,
        expected_run_duration=workflow.expected_run_duration,
        tasks=[convert_workflow_task_to_task_request_v3(task) for task in workflow.tasks],
        queue_enabled=workflow.queue_enabled,
        notification_preference=workflow.notification_preference,
        timezone=workflow.timezone
    )


# Conversion functions for V3 models
def create_workflow_v3_from_request(request: 'CreateWorkflowRequestV3', user_email: str) -> WorkflowV3:
    """Convert CreateWorkflowRequestV3 to WorkflowV3 for database storage"""
    current_time = get_current_time()
    
    return WorkflowV3(
        workflow_id=get_workflow_id(),
        workflow_name=request.workflow_name,
        display_name=request.display_name or request.workflow_name,
        description=request.description,
        tags=request.tags,
        schedule=request.schedule,
        retries=request.retries,
        notify_on=request.notify_on,
        parameters=request.parameters,
        max_concurrent_runs=request.max_concurrent_runs,
        start_date=request.start_date,
        end_date=request.end_date,
        callback_urls=request.callback_urls,
        event_types=request.event_types,
        created_by=user_email,
        last_updated_on=current_time,
        created_at=current_time,
        workflow_status=request.workflow_status,
        tenant=request.tenant,
        expected_run_duration=request.expected_run_duration,
        tasks=request.tasks,  # Already TaskRequestV3
        queue_enabled=request.queue_enabled,
        notification_preference=request.notification_preference,
        timezone=request.timezone
    )

def update_workflow_v3_from_request(request: 'UpdateWorkflowRequestV3', existing_workflow: WorkflowV3) -> WorkflowV3:
    """Update WorkflowV3 with UpdateWorkflowRequestV3 data"""
    from workflow_model.utils.utils import get_current_time
    
    # Create a copy of the existing workflow
    updated = existing_workflow.copy()
    
    # Update fields from request
    updated.workflow_name = request.workflow_name
    updated.display_name = request.display_name or request.workflow_name
    updated.description = request.description
    updated.tags = request.tags
    updated.schedule = request.schedule
    updated.retries = request.retries
    updated.notify_on = request.notify_on
    updated.parameters = request.parameters
    updated.max_concurrent_runs = request.max_concurrent_runs
    updated.start_date = request.start_date
    updated.end_date = request.end_date
    updated.callback_urls = request.callback_urls
    updated.event_types = request.event_types
    updated.workflow_status = request.workflow_status
    updated.tenant = request.tenant
    updated.expected_run_duration = request.expected_run_duration
    updated.tasks = request.tasks  # Already TaskRequestV3
    updated.queue_enabled = request.queue_enabled
    updated.notification_preference = request.notification_preference
    updated.timezone = request.timezone
    updated.last_updated_on = get_current_time()
    
    return updated 
