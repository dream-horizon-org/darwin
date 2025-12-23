from typing import List
from tortoise.transactions import in_transaction

from workflow_model.v3.darwin_workflow import TaskRun, WorkflowTask
from workflow_model.v3.task_run import TaskRunV3


class TaskRunRepository:
    async def create_task_run(self, data: TaskRunV3) -> TaskRun:
        async with in_transaction():
            task = await WorkflowTask.get(workflow__workflow_id=data.workflow_id, task_name=data.task_name)
            task_run = await TaskRun.create(
                task=task,
                task_name=data.task_name,
                workflow_id=data.workflow_id,
                run_id=data.run_id,
                start_time=data.start_time,
                end_time=data.end_time,
                duration=data.duration,
                run_status=data.run_status,
                attempt=data.attempt,
                run_metadata=data.run_metadata.dict() if data.run_metadata else None
            )
            return task_run

    async def update_task_run(self, data: TaskRunV3) -> TaskRun:
        async with in_transaction():
            task = await WorkflowTask.get(workflow__workflow_id=data.workflow_id, task_name=data.task_name)
            task_run = await TaskRun.get(task=task, run_id=data.run_id, attempt=data.attempt)
            task_run.start_time = data.start_time
            task_run.end_time = data.end_time
            task_run.duration = data.duration
            task_run.run_status = data.run_status
            task_run.run_metadata = data.run_metadata.dict() if data.run_metadata else task_run.run_metadata
            await task_run.save()
            return task_run

    async def get_task_run(self, workflow_id: str, run_id: str, task_name: str) -> TaskRun:
        return await TaskRun.filter(task__workflow__workflow_id=workflow_id, run_id=run_id, task_name=task_name).prefetch_related("task")

    async def list_task_runs_for_workflow(self, workflow_id: str, run_id: str) -> List[TaskRun]:
        return await TaskRun.filter(task__workflow__workflow_id=workflow_id, run_id=run_id).prefetch_related("task")

    async def delete_task_run(self, workflow_id: str, run_id: str, task_name: str) -> None:
        task = await WorkflowTask.get(workflow__workflow_id=workflow_id, task_name=task_name)
        await TaskRun.filter(task=task, run_id=run_id).delete()
