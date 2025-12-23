from datetime import datetime
from tortoise.expressions import Q
from workflow_core.utils.logging_util import get_logger
import logging
from typing import Optional, List, Dict, Any

from workflow_model.v3.darwin_workflow import WorkflowRunV3
from workflow_model.v3.workflow_run import WorkflowRunUpdate

logger = get_logger(__name__)


class WorkflowRunV3Repo:
    """
    Repository class for V3 workflow database operations.
    Handles all database interactions for V3 workflows.
    """
    
    def __init__(self):
        """Initialize V3 repository"""
        self.logger = logging.getLogger(__name__)

    @staticmethod
    def _build_filters(workflow_id: str, start_date: str, end_date: str, filters: List[Dict[str, Any]]) -> Q:
        q = Q(workflow_id=workflow_id)

        if start_date != "None":
            q &= Q(start_time__gte=datetime.fromisoformat(start_date))
        if end_date != "None":
            q &= Q(start_time__lte=datetime.fromisoformat(end_date))

        for f in filters:
            field = f.get("field")
            value = f.get("value")
            match = f.get("match", "icontains")  # supports exact, icontains, etc.
            if field and value:
                q &= Q(**{f"{field}__{match}": value})

        return q

    @staticmethod
    def _build_queryset(start_date, end_date, filters):
        q_filters = WorkflowRunV3Repo._build_filters(start_date, end_date, filters)
        return WorkflowRunV3.filter(q_filters)

    @staticmethod
    async def list_runs_by_workflow_id(
            workflow_id: str,
            start_date: str,
            end_date: str,
            filters: List[Dict[str, Any]],
            offset: int,
            limit: int
    ):
        """
        Returns paginated list of workflow runs matching the workflow ID and optional filters.
        """
        q = WorkflowRunV3Repo._build_filters(workflow_id, start_date, end_date, filters)
        return await WorkflowRunV3.filter(q).offset(offset).limit(limit)

    @staticmethod
    async def count_runs_by_workflow_id(
            workflow_id: str,
            start_date: str,
            end_date: str,
            filters: List[Dict[str, Any]]
    ):
        """
        Returns count of workflow runs matching the workflow ID and optional filters.
        """
        q = WorkflowRunV3Repo._build_filters(workflow_id, start_date, end_date, filters)
        return await WorkflowRunV3.filter(q).count()


    @staticmethod
    async def get_by_run_id(run_id: str) -> Optional[WorkflowRunV3]:
        return await WorkflowRunV3.get_or_none(run_id=run_id)

    @staticmethod
    async def update(instance: WorkflowRunV3, payload: WorkflowRunUpdate) -> WorkflowRunV3:
        for key, value in payload.dict(exclude_unset=True).items():
            setattr(instance, key, value)
        await instance.save()
        return instance

    @staticmethod
    async def get_by_workflow_and_run_id(workflow_id: str, run_id: str):
        return await WorkflowRunV3.filter(workflow_id=workflow_id, run_id=run_id).first()

    @staticmethod
    async def get_recent_runs_by_workflow_id(workflow_id: str, limit: int = 5):
        """
        Get recent runs for a workflow, ordered by start_time descending.
        
        :param workflow_id: ID of the workflow
        :param limit: Maximum number of runs to return
        :return: List of recent WorkflowRunV3 instances
        """
        return await WorkflowRunV3.filter(
            workflow_id=workflow_id
        ).order_by('-start_time').limit(limit)

    @staticmethod
    async def count_running_runs_by_workflow_id(workflow_id: str) -> int:
        return await WorkflowRunV3.filter(workflow_id=workflow_id, state="RUNNING").count()

    @staticmethod
    async def get_by_run_and_workflow(run_id: str, workflow_id: str):
        return await WorkflowRunV3.get_or_none(run_id=run_id, workflow_id=workflow_id)
