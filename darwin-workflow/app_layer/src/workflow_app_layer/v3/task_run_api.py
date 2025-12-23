from fastapi import APIRouter, HTTPException
from typing import List
from workflow_core.utils.logging_util import get_logger
from workflow_model.v3.darwin_workflow import TaskRun, WorkflowTask
from workflow_model.v3.task_run import TaskRunV3, TaskRunOut

task_runs_router = APIRouter(prefix="/v3", tags=["Task Runs V3"])
logger = get_logger(__name__)

def setup_v3_task_runs_router(v3_tr_service):
    """
    Setup function to inject dependencies into the V3 router.
    This allows us to access the global objects from main.py
    """
    global task_run_service
    task_run_service = v3_tr_service

@task_runs_router.post("/task_run", response_model=TaskRunOut)
async def create_task_run(task_run: TaskRunV3):
    try:
        run = await task_run_service.create(task_run)
        return await TaskRunOut.from_tortoise_orm(run)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@task_runs_router.put("/task_run", response_model=TaskRunOut)
async def update_task_run(task_run: TaskRunV3):
    try:
        run = await task_run_service.update(task_run)
        return await TaskRunOut.from_tortoise_orm(run)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@task_runs_router.get("/task_run/{workflow_id}/{run_id}/{task_name}", response_model=List[TaskRunOut])
async def get_task_run(workflow_id: str, run_id: str, task_name: str):
    try:
        runs = await task_run_service.get(workflow_id, run_id, task_name)
        return [await TaskRunOut.from_tortoise_orm(run) for run in runs]
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Task run not found: {e}")


@task_runs_router.get("/task_runs/{workflow_id}/{run_id}", response_model=List[TaskRunOut])
async def list_task_runs(workflow_id: str, run_id: str):
    runs = await task_run_service.list(workflow_id, run_id)
    return [await TaskRunOut.from_tortoise_orm(run) for run in runs]