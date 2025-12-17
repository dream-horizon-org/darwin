from fastapi import HTTPException

from workflow_core.error.errors import WorkflowNotFound, RunNotFoundException
from workflow_core.utils.workflow_utils import get_env
from workflow_core.v3.repository.workflow_core_v3_repo import WorkflowCoreV3Repo
from workflow_core.v3.repository.workflow_run_v3_repo import WorkflowRunV3Repo
from workflow_core.v3.service.airflow_service_v3 import AirflowV3
from workflow_model.v3.darwin_workflow import WorkflowRunV3
from workflow_model.v3.workflow_run import WorkflowRunOut, WorkflowRunsListQuery, WorkflowRunsResponse, \
    WorkflowRunUpdate, WorkflowRunCreate

class WorkflowRunV3Impl:
    """
    V3-specific implementation of workflow core operations.
    This class contains V3 workflow operations that were moved from the main WorkflowCoreImpl.
    """

    def __init__(self, env: str = None):
        self.env = env or get_env()
        self.repo = WorkflowCoreV3Repo()
        self.airflow_v3 = AirflowV3(env=self.env)

    @staticmethod
    async def list_workflow_runs_by_id(workflow_id: str, query: WorkflowRunsListQuery) -> WorkflowRunsResponse:
        runs = await WorkflowRunV3Repo.list_runs_by_workflow_id(
            workflow_id=workflow_id,
            start_date=query.start_date,
            end_date=query.end_date,
            filters=query.filters,
            offset=query.offset,
            limit=query.page_size
        )

        total = await WorkflowRunV3Repo.count_runs_by_workflow_id(
            workflow_id=workflow_id,
            start_date=query.start_date,
            end_date=query.end_date,
            filters=query.filters
        )

        return WorkflowRunsResponse(
            result_size=total,
            page_size=query.page_size,
            offset=query.offset,
            data=[WorkflowRunOut.from_orm(r) for r in runs]
        )

    @staticmethod
    async def update_workflow_run_by_id(workflow_id: str,run_id: str, payload: WorkflowRunUpdate) -> WorkflowRunOut:
        instance = await WorkflowRunV3Repo.get_by_workflow_and_run_id(workflow_id, run_id)
        if not instance:
            raise WorkflowNotFound(f"Workflow run with id {run_id} not found.")

        updated = await WorkflowRunV3Repo.update(instance, payload)
        return await WorkflowRunOut.from_tortoise_orm(updated)

    @staticmethod
    async def create_workflow_run(payload: WorkflowRunCreate) -> WorkflowRunOut:
        """
        Creates a new WorkflowRunV3 record in the database.
        """
        try:
            instance, _ = await WorkflowRunV3.update_or_create(defaults=payload.dict(exclude={"workflow_id", "run_id"}),
                                                               workflow_id=payload.workflow_id,
                                                               run_id=payload.run_id)
            return await WorkflowRunOut.from_tortoise_orm(instance)
        except Exception as e:
            raise e

    async def stop_workflow_run(self, workflow_id: str, run_id: str) -> dict:
        """
        Stops a workflow run by setting its state to 'STOPPED'.
        """
        workflow = await self.repo.get_workflow_by_id(workflow_id)
        if not workflow:
            raise WorkflowNotFound(f"Workflow ID {workflow_id} not found")

        run = await WorkflowRunV3.get_or_none(workflow_id=workflow_id, run_id=run_id)
        if not run:
            raise RunNotFoundException(f"Run {run_id} for workflow {workflow_id} not found.")

        run.state = "STOPPING"
        await run.save()

        self.airflow_v3.stop_run(workflow.workflow_name, run_id)

        return {
            "workflow_id": workflow_id,
            "run_id": run_id,
            "status": "STOPPING"
        }

    @staticmethod
    async def get_run_details(run_id: str, workflow_id: str) -> WorkflowRunOut:
        run = await WorkflowRunV3Repo.get_by_run_and_workflow(run_id, workflow_id)
        if not run:
            raise RunNotFoundException(message="Run not found")
        return await WorkflowRunOut.from_tortoise_orm(run)