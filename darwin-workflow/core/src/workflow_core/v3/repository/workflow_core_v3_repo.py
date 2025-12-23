from workflow_core.utils.logging_util import get_logger
from workflow_core.error.errors import WorkflowNotFound
from workflow_model.constants.constants import CREATING_ARTIFACT
from workflow_model.v3.darwin_workflow import WorkflowV3 as DarwinWorkflow, WorkflowTask, TaskType, \
    DarwinConfig, PelicanConfig
from workflow_model.v3.task import TaskV3
from workflow_model.v3.workflow import WorkflowV3
from typing import List, Tuple, Optional
from tortoise.expressions import Q
from tortoise.transactions import in_transaction
import logging

logger = get_logger(__name__)


class WorkflowCoreV3Repo:
    """
    Repository class for V3 workflow database operations.
    Handles all database interactions for V3 workflows.
    """
    
    def __init__(self):
        """Initialize V3 repository"""
        self.logger = logging.getLogger(__name__)

    async def _create_or_update_task_configs(self, task: WorkflowTask, task_data: TaskV3):
        """
        Create or update task-specific configurations (Pelican or Darwin).
        
        :param task: WorkflowTask instance
        :param task_data: Task configuration data
        """
        try:
            if task.task_type == TaskType.PELICAN:
                # Handle Pelican config
                pelican_data = task_data.task_config.dict()
                if pelican_data:
                    await PelicanConfig.update_or_create(
                        task=task,
                        defaults={
                            'artifact': pelican_data.get('artifact', {}),
                            'cluster': pelican_data.get('cluster'),
                            'spark_configs': pelican_data.get('spark_configs', {}),
                            'instance_role': pelican_data.get('instance_role', 'ds_dataengineering_role'),
                            'args': pelican_data.get('args', []),
                            'polling_interval': pelican_data.get('polling_interval', 15),
                            'application_name': pelican_data.get('application_name')
                        }
                    )
            elif task.task_type == TaskType.DARWIN:
                # Handle Darwin config
                darwin_data = task_data.task_config.dict()
                if darwin_data:
                    await DarwinConfig.update_or_create(
                        task=task,
                        defaults={
                            'source': darwin_data.get('source', ''),
                            'source_type': darwin_data.get('source_type', 'Workspace'),
                            'file_path': darwin_data.get('file_path'),
                            'dynamic_artifact': darwin_data.get('dynamic_artifact', True),
                            'cluster_name': darwin_data.get('cluster_name'),
                            'cluster_id': darwin_data.get('cluster_id'),
                            'cluster_type': darwin_data.get('cluster_type', ''),
                            'dependent_libraries': darwin_data.get('dependent_libraries'),
                            'input_parameters': darwin_data.get('input_parameters', {}),
                            'ha_config': darwin_data.get('ha_config', {}),
                            'packages': darwin_data.get('packages', [])
                        }
                    )
        except Exception as e:
            self.logger.error(f"Error creating/updating task config: {e}")
            raise

    async def _create_or_update_tasks(self, workflow: DarwinWorkflow, workflow_v3: WorkflowV3):
        """
        Create or update workflow tasks and their configurations.
        
        :param workflow: DarwinWorkflow instance
        :param workflow_v3: WorkflowV3 instance containing task data
        """
        try:
            # Get existing tasks for cleanup
            existing_tasks = set(await WorkflowTask.filter(workflow=workflow).values_list('task_name', flat=True))
            current_tasks = set()

            # Create or update tasks
            for task_data in workflow_v3.tasks:
                task_name = task_data.task_name
                current_tasks.add(task_name)
                
                # Create or update task
                task, _ = await WorkflowTask.update_or_create(
                    workflow=workflow,
                    task_name=task_name,
                    defaults={
                        'task_type': task_data.task_type,
                        'retries': task_data.retries,
                        'timeout': task_data.timeout,
                        'depends_on': task_data.depends_on,
                        'pool': task_data.pool
                    }
                )
                await task.save()  # Ensure the task is saved and has a valid PK
                
                # Create or update task-specific config
                await self._create_or_update_task_configs(task, task_data)

            # Remove tasks that no longer exist
            tasks_to_remove = existing_tasks - current_tasks
            if tasks_to_remove:
                await WorkflowTask.filter(workflow=workflow, task_name__in=tasks_to_remove).delete()

        except Exception as e:
            self.logger.error(f"Error creating/updating tasks: {e}")
            raise

    async def create_workflow(self, workflow_v3: WorkflowV3) -> WorkflowV3:
        """
        Store workflow and its related entities in the database.
        
        :param workflow_v3: WorkflowV3 entity to store
        :return: The same WorkflowV3 instance that was passed in
        """
        try:
            async with in_transaction():
                # Create new DarwinWorkflow instance
                workflow = DarwinWorkflow(workflow_id=workflow_v3.workflow_id)
                
                # Update all fields from workflow_v3
                workflow.workflow_name = workflow_v3.workflow_name
                workflow.workflow_status = CREATING_ARTIFACT
                workflow.description = workflow_v3.description
                workflow.max_concurrent_runs = workflow_v3.max_concurrent_runs
                workflow.schedule = workflow_v3.schedule
                workflow.notify_on = workflow_v3.notify_on
                workflow.parameters = workflow_v3.parameters
                workflow.retries = workflow_v3.retries
                workflow.queue_enabled = workflow_v3.queue_enabled
                workflow.expected_run_duration = workflow_v3.expected_run_duration
                workflow.notify_on_states = workflow_v3.notification_preference
                workflow.callback_urls = workflow_v3.callback_urls
                workflow.event_types = workflow_v3.event_types
                workflow.display_name = workflow_v3.display_name
                workflow.created_by = workflow_v3.created_by
                workflow.tags = workflow_v3.tags
                workflow.start_date = workflow_v3.start_date
                workflow.end_date = workflow_v3.end_date
                workflow.created_at = workflow_v3.created_at
                workflow.last_updated_on = workflow_v3.last_updated_on
                workflow.tenant = workflow_v3.tenant
                workflow.timezone = workflow_v3.timezone
                
                # Save the workflow to the database
                await workflow.save()
                
                # Create tasks and their configurations
                await self._create_or_update_tasks(workflow, workflow_v3)
                
            self.logger.info(f"Successfully created workflow and related entities in database: {workflow.workflow_id}")
            return workflow_v3
        except Exception as e:
            self.logger.error(f"Error in repository create_workflow: {e}")
            raise

    async def update_workflow(self, workflow_v3: WorkflowV3) -> WorkflowV3:
        """
        Update workflow and its related entities in the database.
        
        :param workflow_v3: WorkflowV3 entity to update
        :return: The same WorkflowV3 instance that was passed in
        """
        try:
            async with in_transaction():
                # Try to retrieve the workflow by workflow_id
                workflow = await DarwinWorkflow.filter(workflow_id=workflow_v3.workflow_id).first()
                
                if workflow is None:
                    raise WorkflowNotFound(f"Workflow with id {workflow_v3.workflow_id} not found")
                
                # Update all fields from workflow_v3
                workflow.workflow_name = workflow_v3.workflow_name
                workflow.workflow_status = workflow_v3.workflow_status
                workflow.description = workflow_v3.description
                workflow.max_concurrent_runs = workflow_v3.max_concurrent_runs
                workflow.schedule = workflow_v3.schedule
                workflow.notify_on = workflow_v3.notify_on
                workflow.parameters = workflow_v3.parameters
                workflow.retries = workflow_v3.retries
                workflow.queue_enabled = workflow_v3.queue_enabled
                workflow.expected_run_duration = workflow_v3.expected_run_duration
                workflow.notify_on_states = workflow_v3.notification_preference
                workflow.callback_urls = workflow_v3.callback_urls
                workflow.event_types = workflow_v3.event_types
                workflow.display_name = workflow_v3.display_name
                workflow.created_by = workflow_v3.created_by
                workflow.tags = workflow_v3.tags
                workflow.start_date = workflow_v3.start_date
                workflow.end_date = workflow_v3.end_date
                workflow.last_updated_on = workflow_v3.last_updated_on
                workflow.tenant = workflow_v3.tenant
                workflow.timezone = workflow_v3.timezone
                
                # Save the updated workflow to the database
                await workflow.save()
                
                # Update tasks and their configurations
                await self._create_or_update_tasks(workflow, workflow_v3)
                
            self.logger.info(f"Successfully updated workflow and related entities in database: {workflow.workflow_id}")
            return workflow_v3
        except Exception as e:
            self.logger.error(f"Error in repository update_workflow: {e}")
            raise

    async def get_workflow_by_id(self, workflow_id: str) -> DarwinWorkflow:
        """
        Retrieve workflow and all its related entities by ID from the database.
        
        :param workflow_id: Workflow ID to retrieve
        :return: DarwinWorkflow instance with all related data prefetched
        :raises: WorkflowNotFound if workflow doesn't exist
        """
        try:
            # Fetch workflow with all related entities prefetched
            workflow = await DarwinWorkflow.filter(workflow_id=workflow_id).prefetch_related(
                'tasks',
                'tasks__pelican_config',
                'tasks__darwin_config'
            ).first()
            
            if workflow is None:
                raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
            
            self.logger.info(f"Successfully retrieved workflow and related entities from database: {workflow_id}")
            return workflow
        except Exception as e:
            self.logger.error(f"Error in repository get_workflow_by_id: {e}")
            raise

    async def check_workflow_exists_by_name(self, workflow_name: str) -> bool:
        """
        Check if workflow exists by name in the database.
        
        :param workflow_name: Workflow name to check
        :return: True if exists, False otherwise
        """
        try:
            workflow = await DarwinWorkflow.filter(workflow_name=workflow_name).first()
            exists = workflow is not None
            self.logger.info(f"Workflow existence check for '{workflow_name}': {exists}")
            return exists
        except Exception as e:
            self.logger.error(f"Error checking workflow existence: {e}")
            return False

    async def search_workflows(self, query: Optional[str] = None, user_filters: Optional[List[str]] = None, 
                             status_filters: Optional[List[str]] = None, offset: int = 0, 
                             page_size: int = 10) -> Tuple[int, List[DarwinWorkflow]]:
        """
        Search workflows in the database based on the provided filters.
    
        :param query: Optional text to search in workflow name/display name
        :param user_filters: Optional list of users to filter by
        :param status_filters: Optional list of statuses to filter by
        :param offset: Pagination offset
        :param page_size: Number of items per page
        :return: Tuple of (total_count, list of DarwinWorkflow)
        """
        try:
            # Build base query
            base_query = DarwinWorkflow.all()

            # Add text search filter if query is provided
            if query:
                base_query = base_query.filter(
                    Q(workflow_name__icontains=query) |
                    Q(display_name__icontains=query)
                )

            # Add user filter if provided
            if user_filters:
                base_query = base_query.filter(created_by__in=user_filters)

            # Add status filter if provided
            if status_filters:
                base_query = base_query.filter(workflow_status__in=status_filters)

            # Get total count
            total = await base_query.count()

            # Get paginated workflows
            workflows = await base_query.offset(offset).limit(page_size).all()

            return total, workflows

        except Exception as e:
            self.logger.error(f"Error in repository search_workflows: {e}")
            raise

    async def delete_workflow(self, workflow_id: str) -> DarwinWorkflow:
        """
        Delete a workflow and its related tasks from the database.
        
        :param workflow_id: ID of workflow to delete
        :return: The deleted DarwinWorkflow instance
        :raises: WorkflowNotFound if workflow doesn't exist
        """
        try:
            # Get workflow
            workflow = await DarwinWorkflow.filter(workflow_id=workflow_id).first()
            
            if not workflow:
                raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

            # Store workflow data before deletion for event publishing
            deleted_workflow = workflow

            # Delete the workflow (this will cascade delete tasks and configs due to foreign key relationships)
            await workflow.delete()

            self.logger.info(f"Successfully deleted workflow {workflow_id} and its related tasks")
            return deleted_workflow

        except WorkflowNotFound:
            raise
        except Exception as e:
            self.logger.error(f"Error in repository delete_workflow: {e}")
            raise

    async def get_workflow_by_name(self, workflow_name: str) -> Optional[DarwinWorkflow]:
        """
        Retrieve a workflow by its name from the database with all related entities.
        :param workflow_name: Name of the workflow
        :return: Workflow object with related entities or None if not found
        """
        return await DarwinWorkflow.filter(workflow_name=workflow_name).prefetch_related(
            'tasks',
            'tasks__pelican_config',
            'tasks__darwin_config'
        ).first()

    async def save_workflow(self, workflow: DarwinWorkflow):
        """
        Save the given DarwinWorkflow instance to the database.
        :param workflow: DarwinWorkflow instance to save
        """
        try:
            await workflow.save()
            self.logger.info(f"Saved workflow {workflow.workflow_id} to the database.")
        except Exception as e:
            self.logger.error(f"Error saving workflow {getattr(workflow, 'workflow_id', None)}: {e}")
            raise 