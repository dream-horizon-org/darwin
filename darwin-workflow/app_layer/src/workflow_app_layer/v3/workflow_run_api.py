from fastapi import APIRouter, HTTPException
from workflow_core.utils.logging_util import get_logger
from workflow_core.v3.service.workflow_run_service_v3 import WorkflowRunV3Impl
from workflow_model.response import RetrieveRunDetailsResponseV2
from workflow_model.v3.workflow_run import (
    WorkflowRunsListQuery,
    WorkflowRunOut,
    WorkflowRunCreate,
    WorkflowRunUpdate, StopRunWorkflowRunRequest, WorkflowRunsResponse, RunNowWorkflowRequest
)
from workflow_core.error.errors import WorkflowNotFound, RunNotFoundException

runs_router = APIRouter(prefix="/v3/runs", tags=["Workflow Runs V3"])
logger = get_logger(__name__)


def setup_v3_runs_router(v3_runs_impl):
    """
    Setup function to inject dependencies into the V3 router.
    This allows us to access the global objects from main.py
    """
    global wf_runs_v3_instance
    wf_runs_v3_instance = v3_runs_impl

@runs_router.post("/{workflow_id}", response_model=WorkflowRunsResponse, tags=["Workflow Runs Listing"])
async def list_workflow_runs(payload: WorkflowRunsListQuery, workflow_id: str) -> WorkflowRunsResponse:
    """
    Lists workflow runs for a specific workflow ID with optional date and field filters, with pagination.
    """
    try:
        return await WorkflowRunV3Impl.list_workflow_runs_by_id(workflow_id, payload)
    except Exception as err:
        logger.error(f"List failed: {err}")
        raise HTTPException(status_code=500, detail=str(err))

@runs_router.post("/", response_model=WorkflowRunOut, tags=["Workflow Runs V3"])
async def create_workflow_run(payload: WorkflowRunCreate) -> WorkflowRunOut:
    """
    Create a new workflow run.
    """
    try:
        return await WorkflowRunV3Impl.create_workflow_run(payload)
    except Exception as err:
        logger.error(f"Create failed: {err}")
        raise HTTPException(status_code=500, detail=str(err))


@runs_router.put("/{workflow_id}/{run_id}", response_model=WorkflowRunOut, tags=["Workflow Runs V3"])
async def update_workflow_run(workflow_id: str, run_id: str, payload: WorkflowRunUpdate) -> WorkflowRunOut:
    try:
        return await WorkflowRunV3Impl.update_workflow_run_by_id(workflow_id, run_id, payload)
    except WorkflowNotFound as err:
        raise HTTPException(status_code=404, detail=err.message)
    except Exception as err:
        logger.error(f"Update failed: {err}")
        raise HTTPException(status_code=500, detail=str(err))


@runs_router.put("/stop/{workflow_id}", tags=["Workflow Runs V3"])
async def stop_workflow_run(workflow_id: str, payload: StopRunWorkflowRunRequest):
    """
    Stops a workflow run using workflow_id and run_id.
    """
    try:
        return await wf_runs_v3_instance.stop_workflow_run(workflow_id, run_id=payload.run_id)
    except WorkflowNotFound as err:
        raise HTTPException(status_code=404, detail=err.message)
    except RunNotFoundException as err:
        raise HTTPException(status_code=404, detail=err.message)
    except Exception as err:
        logger.error(f"Stop failed: {err}")
        raise HTTPException(status_code=500, detail=str(err))

@runs_router.get("/{workflow_id}/{run_id}", response_model=WorkflowRunOut, tags=["Workflow Run details"])
async def get_run_details(workflow_id: str, run_id: str) -> WorkflowRunOut:
    """
    Lists workflow runs for a specific workflow ID with optional date and field filters, with pagination.
    """
    try:
        return await WorkflowRunV3Impl.get_run_details(run_id, workflow_id)
    except RunNotFoundException as err:
        raise RunNotFoundException(message="Run not found")
    except Exception as err:
        logger.error(f"List failed: {err} ",  exc_info=True)
        raise HTTPException(status_code=500, detail=str(err))