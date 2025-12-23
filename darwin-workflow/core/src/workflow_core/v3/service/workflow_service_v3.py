
from datetime import datetime


from workflow_core.constants.constants import SUCCESS, UPDATING_ARTIFACT, RESUMING, PAUSING, CREATING_ARTIFACT, \
    INACTIVE, ACTIVE, SKIPPED, EXTERNAL, MANUAL
from workflow_core.entity.events_entities import WorkflowState
from workflow_core.utils.logging_util import get_logger
from workflow_core.utils.workflow_utils import create_workflow_event, publish_event, get_env
from workflow_core.error.errors import WorkflowNotFound, InvalidWorkflowException
from workflow_core.v3.repository.workflow_core_v3_repo import WorkflowCoreV3Repo
from workflow_core.v3.repository.workflow_run_v3_repo import WorkflowRunV3Repo
from workflow_core.v3.service.airflow_service_v3 import AirflowV3
from workflow_model.constants.constants import DEFAULT_SCHEDULE, DEFAULT_TIMEZONE
from workflow_model.utils.validators import check_if_start_date_is_yet_to_come, check_if_end_date_has_passed
from workflow_model.v3.request import UpdateWorkflowRequestV3, WorkflowsGetRequestV3
from workflow_model.v3.response import WorkflowListDataV3
from workflow_model.v3.workflow import create_workflow_v3_from_request, update_workflow_v3_from_request, WorkflowV3
from workflow_model.response import WorkflowWorkflowIdDeleteResponseData, LastRunDetails
from typing import Dict
from workflow_model.v3.darwin_workflow import TaskType, WorkflowRunV3
from typing import Optional, Tuple, List
from workflow_model.v3.task import TaskV3, PelicanConfig, DarwinConfig

logger = get_logger(__name__)


class WorkflowCoreV3Impl:
    """
    V3-specific implementation of workflow core operations.
    This class contains V3 workflow operations that were moved from the main WorkflowCoreImpl.
    """
    
    def __init__(self, env: str = None):
        """
        Initialize V3 implementation with access to main core instance.
        
        :param core_instance: Instance of WorkflowCoreImpl to access DAOs and APIs
        """
        self.env = env or get_env()
        self.repo = WorkflowCoreV3Repo()
        self.run_repo = WorkflowRunV3Repo()
        self.airflow_v3 = AirflowV3(env=self.env)
        self.logger = get_logger(__name__)

    def _validate_workflow_state(self, current_status: str):
        """
        Validate if workflow is in a state that allows updates.
        
        :param current_status: Current workflow status
        :raises: InvalidWorkflowException if workflow is in an invalid state
        """
        invalid_states = [RESUMING, PAUSING, UPDATING_ARTIFACT]
        if current_status in invalid_states:
            raise InvalidWorkflowException(f"Cannot update the workflow as it is in the process of {current_status}")

    def _handle_inactive_workflow_schedule(self, workflow_request_v3: UpdateWorkflowRequestV3, current_status: str):
        """
        Handle schedule for inactive workflows.
        If workflow is inactive and not being activated, set schedule to default.
        
        :param workflow_request_v3: The update request
        :param current_status: Current workflow status
        """
        if current_status == INACTIVE and workflow_request_v3.workflow_status != ACTIVE:
            workflow_request_v3.schedule = DEFAULT_SCHEDULE

    async def create_workflow_v3(self, workflow_request_v3, user_email: str) -> tuple[str, Optional[WorkflowV3]]:
        """
        Create a workflow using v3 API contract
        :param workflow_request_v3: CreateWorkflowRequestV3 object
        :param user_email: email of the user
        """
        
        # Set default display name if not provided
        if not workflow_request_v3.display_name:
            workflow_request_v3.display_name = workflow_request_v3.workflow_name

        # Check if workflow already exists
        if await self.repo.check_workflow_exists_by_name(workflow_request_v3.workflow_name):
            error_msg = f"Workflow with name {workflow_request_v3.workflow_name} already exists"
            logger.error(error_msg)
            return error_msg, None
        
        try:
            # Convert V3 request directly to WorkflowV3
            workflow = create_workflow_v3_from_request(workflow_request_v3, user_email)
            workflow_id = workflow.workflow_id
            
            # Store workflow using repository
            db_workflow = await self.repo.create_workflow(workflow)
            
            # Create workflow event
            event = create_workflow_event(
                workflow_id,
                WorkflowState.WORKFLOW_CREATION_REQUEST_RECEIVED,
                {"workflow_name": workflow.workflow_name, "workflow_id": workflow_id}
            )
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=workflow_id, event=event)
            
            return SUCCESS, workflow
        except Exception as e:
            logger.error(f"Error creating workflow v3: {e}")
            return str(e), None

    async def update_workflow_v3(self, workflow_request_v3, workflow_id: str, status: str = UPDATING_ARTIFACT) -> tuple[str, Optional[WorkflowV3]]:
        """
        Update a workflow using v3 API contract
        :param workflow_request_v3: UpdateWorkflowRequestV3 object
        :param workflow_id: workflow id
        :param user_email: email of the user
        :param status: workflow status
        """
        try:
            # Check if workflow exists - will raise WorkflowNotFound if not
            existing_workflow = await self.get_workflow_by_id_v3(workflow_id)
            
            # Validate workflow state
            self._validate_workflow_state(existing_workflow.workflow_status)

            # Handle schedule for inactive workflows
            self._handle_inactive_workflow_schedule(workflow_request_v3, existing_workflow.workflow_status)
            
            # Update with request data
            updated_workflow = update_workflow_v3_from_request(workflow_request_v3, existing_workflow)
            updated_workflow.workflow_status = status
            
            # Update workflow using repository
            db_workflow = await self.repo.update_workflow(updated_workflow)
            
            # Create workflow event
            event = create_workflow_event(
                workflow_id,
                WorkflowState.WORKFLOW_UPDATION_REQUEST_RECEIVED,
                {"workflow_name": updated_workflow.workflow_name, "workflow_id": workflow_id}
            )
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(event, callback_urls=workflow_request_v3.callback_urls, event_types=workflow_request_v3.event_types)
            
            return SUCCESS, db_workflow
        except Exception as e:
            logger.error(f"Error updating workflow v3: {e}")
            return str(e), None

    async def search_workflows_v3(self, body: WorkflowsGetRequestV3) -> Tuple[int, List[WorkflowListDataV3]]:
        """
        Search workflows and convert results to V3 format.
        
        :param body: Search request containing filters and pagination
        :return: Tuple of (total_count, list of WorkflowListDataV3)
        """
        try:
            # Get raw workflows from repository
            total, workflows = await self.repo.search_workflows(
                query=body.query,
                user_filters=body.user_filters,
                status_filters=body.status_filters,
                offset=body.offset,
                page_size=body.page_size
            )

            # Convert to V3 format
            v3_data = []
            for workflow in workflows:
                # Get last 5 runs for this workflow using the repository
                last_runs = await self.run_repo.get_recent_runs_by_workflow_id(
                    workflow_id=workflow.workflow_id,
                    limit=5
                )

                # Convert runs to LastRunDetails format
                last_run_details = []
                for run in last_runs:
                    last_run_details.append(LastRunDetails(
                        run_status=run.state,
                        is_run_duration_exceeded=run.sla_exceeded if hasattr(run, 'sla_exceeded') else False,
                        expected_run_duration=run.expected_run_duration
                    ))

                # Get next run time
                next_run_time = workflow.next_run.strftime("%Y-%m-%d %H:%M:%S") if workflow.next_run else ""

                # Create V3 workflow item
                v3_workflow_item = WorkflowListDataV3(
                    workflow_name=workflow.workflow_name,
                    display_name=workflow.display_name or workflow.workflow_name,
                    description=workflow.description,
                    status=workflow.workflow_status,
                    workflow_id=workflow.workflow_id,
                    tags=workflow.tags,
                    schedule=workflow.schedule,
                    parameters=workflow.parameters,
                    last_run_details=last_run_details,
                    next_run_time=next_run_time,
                    owner=workflow.created_by
                )
                v3_data.append(v3_workflow_item)

            return total, v3_data

        except Exception as e:
            self.logger.error(f"Error in search_workflows_v3: {e}")
            raise

    def _convert_tasks_to_v3_format(self, workflow_tasks) -> List[TaskV3]:
        """
        Convert workflow tasks to V3 format.
        
        :param workflow_tasks: List of workflow tasks from database
        :return: List of TaskV3 objects
        """
        v3_tasks = []
        for task in workflow_tasks:
            # Get the appropriate config based on task type
            if task.task_type == TaskType.PELICAN and task.pelican_config:
                task_config = PelicanConfig(
                    artifact=task.pelican_config.artifact,
                    cluster=task.pelican_config.cluster,
                    spark_configs=task.pelican_config.spark_configs,
                    instance_role=task.pelican_config.instance_role,
                    args=task.pelican_config.args,
                    polling_interval=task.pelican_config.polling_interval,
                    application_name=task.pelican_config.application_name
                )
            elif task.task_type == TaskType.DARWIN and task.darwin_config:
                task_config = DarwinConfig(
                    source=task.darwin_config.source,
                    source_type=task.darwin_config.source_type,
                    file_path=task.darwin_config.file_path,
                    dynamic_artifact=task.darwin_config.dynamic_artifact,
                    cluster_name=task.darwin_config.cluster_name,
                    cluster_id=task.darwin_config.cluster_id,
                    cluster_type=task.darwin_config.cluster_type,
                    dependent_libraries=task.darwin_config.dependent_libraries,
                    input_parameters=task.darwin_config.input_parameters,
                    ha_config=task.darwin_config.ha_config,
                    packages=task.darwin_config.packages
                )
            else:
                self.logger.warning(f"Task {task.task_name} has no config or unknown type {task.task_type}")
                continue

            # Create V3 task
            v3_task = TaskV3(
                task_name=task.task_name,
                task_type=task.task_type,
                task_config=task_config, 
                retries=task.retries,
                timeout=task.timeout,
                depends_on=task.depends_on,
                pool=task.pool
            )
            v3_tasks.append(v3_task)
        
        return v3_tasks

    def _convert_workflow_to_v3(self, workflow) -> WorkflowV3:
        """
        Convert DarwinWorkflow to WorkflowV3 format.
        
        :param workflow: DarwinWorkflow instance from database
        :return: WorkflowV3 instance
        """
        # Convert tasks to V3 format
        v3_tasks = self._convert_tasks_to_v3_format(workflow.tasks)

        # Convert DarwinWorkflow to WorkflowV3
        workflow_v3 = WorkflowV3(
            workflow_id=workflow.workflow_id,
            workflow_name=workflow.workflow_name,
            display_name=workflow.display_name or workflow.workflow_name,
            description=workflow.description,
            tags=workflow.tags,
            schedule=workflow.schedule,
            retries=workflow.retries,
            notify_on=workflow.notify_on,
            parameters=workflow.parameters,
            max_concurrent_runs=workflow.max_concurrent_runs,
            start_date=workflow.start_date.strftime("%Y-%m-%d %H:%M:%S") if workflow.start_date and hasattr(workflow.start_date, 'strftime') else workflow.start_date,
            end_date=workflow.end_date.strftime("%Y-%m-%d %H:%M:%S") if workflow.end_date and hasattr(workflow.end_date, 'strftime') else workflow.end_date,
            callback_urls=workflow.callback_urls,
            event_types=workflow.event_types,
            created_by=workflow.created_by,
            last_updated_on=workflow.last_updated_on.strftime("%Y-%m-%d %H:%M:%S") if workflow.last_updated_on and hasattr(workflow.last_updated_on, 'strftime') else workflow.last_updated_on,
            created_at=workflow.created_at.strftime("%Y-%m-%d %H:%M:%S") if workflow.created_at and hasattr(workflow.created_at, 'strftime') else workflow.created_at,
            workflow_status=workflow.workflow_status,
            tenant=workflow.tenant,
            expected_run_duration=workflow.expected_run_duration,
            tasks=v3_tasks,
            queue_enabled=workflow.queue_enabled,
            notification_preference=self._convert_notify_on_states_to_preference(workflow.notify_on_states),
            timezone=workflow.timezone or DEFAULT_TIMEZONE
        )

        return workflow_v3

    def _convert_notify_on_states_to_preference(self, notify_on_states) -> Dict[str, bool]:
        """
        Convert notify_on_states list to notification_preference dictionary.

        :param notify_on_states: List of states to notify on (e.g., ['FAILED'])
        :return: Dictionary with notification preferences
        """
        if not notify_on_states:
            notify_on_states = ['FAILED']  # Default

        return {
            "on_start": "RUNNING" in notify_on_states,
            "on_fail": "FAILED" in notify_on_states,
            "on_success": "SUCCESS" in notify_on_states,
            "on_skip": "SKIPPED" in notify_on_states
        }

    async def get_workflow_by_id_v3(self, workflow_id: str) -> WorkflowV3:
        """
        Get workflow by ID and convert to V3 format.
        
        :param workflow_id: ID of workflow to retrieve
        :return: WorkflowV3 instance
        :raises: WorkflowNotFound if workflow doesn't exist
        """
        try:
            # Use existing get_workflow_by_id from repository
            workflow = await self.repo.get_workflow_by_id(workflow_id)
            
            if not workflow:
                raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

            return self._convert_workflow_to_v3(workflow)

        except WorkflowNotFound:
            raise
        except Exception as e:
            self.logger.error(f"Error in get_workflow_by_id_v3: {e}")
            raise

    async def delete_workflow_v3(self, workflow_id: str) -> WorkflowWorkflowIdDeleteResponseData:
        """
        Soft delete a workflow and return response in V3 format.
        
        :param workflow_id: ID of workflow to delete
        :return: Response data confirming deletion
        :raises: WorkflowNotFound if workflow doesn't exist
        """
        try:
            # First check if workflow exists and is in a valid state
            workflow = await self.repo.get_workflow_by_id(workflow_id)
            
            # Check if workflow is in a state that allows deletion
            if workflow.workflow_status in [CREATING_ARTIFACT, UPDATING_ARTIFACT, RESUMING, PAUSING]:
                raise InvalidWorkflowException(f"Cannot delete workflow in {workflow.workflow_status} state")
            
            # Proceed with deletion using repository function
            deleted_workflow = await self.repo.delete_workflow(workflow_id)
            
            # Create and publish workflow deleted event
            event = create_workflow_event(
                workflow_id,
                WorkflowState.WORKFLOW_DELETED,
                {"workflow_name": workflow.workflow_name, "workflow_id": workflow_id}
            )
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(event)
            
            # Convert to V3 response format
            return WorkflowWorkflowIdDeleteResponseData(
                workflow_id=workflow_id,
                is_deleted=True,
            )
            
        except (WorkflowNotFound, InvalidWorkflowException):
            raise
        except Exception as e:
            self.logger.error(f"Error in delete_workflow_v3: {e}")
            raise

    async def get_workflow_by_name_v3(self, workflow_name: str) -> WorkflowV3:
        """
        Get workflow by name and convert to V3 format.
        
        :param workflow_name: Name of workflow to retrieve
        :return: WorkflowV3 instance
        :raises: WorkflowNotFound if workflow doesn't exist
        """
        try:
            # Use existing get_workflow_by_name from repository
            workflow = await self.repo.get_workflow_by_name(workflow_name)
            
            if not workflow:
                raise WorkflowNotFound(f"Workflow with name {workflow_name} not found")

            return self._convert_workflow_to_v3(workflow)

        except WorkflowNotFound:
            raise
        except Exception as e:
            self.logger.error(f"Error in get_workflow_by_name_v3: {e}")
            raise


    async def run_now(self, workflow_id: str, parameters: dict = None):
        try:
            workflow = await self.repo.get_workflow_by_id(workflow_id)
            self._validate_workflow_dates(workflow)

            running_count = await WorkflowRunV3Repo.count_running_runs_by_workflow_id(workflow_id)
            can_run = running_count <= workflow.max_concurrent_runs

            if not can_run:
                if workflow.queue_enabled:
                    self.logger.info(f" skipped run for workflow: {workflow_id}")
                    skipped_run_data = self._build_run_data(
                        workflow, parameters, state=SKIPPED,
                        run_id=f"manual__{datetime.utcnow().isoformat()}", start_time=datetime.utcnow()
                    )
                    await WorkflowRunV3.create(**skipped_run_data)
                    return  # early return if queuing is allowed
                else:
                    raise Exception(f"Max concurrent runs exceeded for workflow: {workflow_id}")

            # Trigger DAG via Airflow
            resp = self.airflow_v3.run_now(workflow.workflow_name, parameters)

            triggered_run_data = self._build_run_data(
                workflow,
                parameters,
                run_id=resp["dag_run_id"],
                state=resp["state"],
                run_type=resp.get("run_type", MANUAL),
                start_time=resp.get("start_date") or datetime.utcnow(),
                attempt=1
            )

            wf_run = await WorkflowRunV3.create(**triggered_run_data)
            return wf_run

        except WorkflowNotFound:
            raise
        except Exception as e:
            self.logger.error(f"Error in run_now for workflow {workflow_id}: {e}")
            self.logger.error(f"Error in run_now: {e}")
            raise

    def _validate_workflow_dates(self, workflow):
        if check_if_end_date_has_passed(workflow.end_date):
            raise Exception("End date has passed. Please update it to run this workflow.")
        if check_if_start_date_is_yet_to_come(workflow.start_date):
            raise Exception("Start date is in the future. Please update it to run this workflow.")

    def _build_run_data(
            self,
            workflow,
            parameters: dict,
            run_id: str,
            state: str,
            run_type: str = MANUAL,
            triggered_by: str = EXTERNAL,
            start_time: datetime = None,
            attempt: int = 1
    ) -> dict:
        return {
            "run_id": run_id,
            "workflow_id": workflow.workflow_id,
            "workflow_name": workflow.workflow_name,
            "dag_id": workflow.workflow_name,  # assuming dag_id = workflow_name
            "state": state,
            "parameters": parameters or workflow.parameters,
            "run_type": run_type,
            "triggered_by": triggered_by,
            "start_time": start_time or datetime.utcnow(),
            "attempt": attempt
        }