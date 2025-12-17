from workflow_core.v3.repository.task_run_repo import TaskRunRepository
from workflow_model.v3.task_run import TaskRunV3


class TaskRunService:
    def __init__(self):
        self.repo = TaskRunRepository()

    async def create(self, task_run: TaskRunV3):
        return await self.repo.create_task_run(task_run)

    async def update(self, task_run: TaskRunV3):
        return await self.repo.update_task_run(task_run)

    async def get(self, workflow_id: str, run_id: str, task_name: str):
        return await self.repo.get_task_run(workflow_id, run_id, task_name)

    async def list(self, workflow_id: str, run_id: str):
        return await self.repo.list_task_runs_for_workflow(workflow_id, run_id)

    async def delete(self, workflow_id: str, run_id: str, task_name: str):
        return await self.repo.delete_task_run(workflow_id, run_id, task_name)
