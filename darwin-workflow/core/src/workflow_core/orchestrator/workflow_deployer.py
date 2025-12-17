from typing import List

from workflow_core.orchestrator.job_plan_builder import JobPlanBuilder
from workflow_model.workflow import CreateWorkflowRequest, WorkflowTaskRequest, UpdateWorkflowRequest


class WorkflowDeployer:
    def __init__(self, env: str):
        self.env = env
        self.job_plan_builder = JobPlanBuilder()

    def __add_tasks(self, tasks: List[WorkflowTaskRequest]):
        for task in tasks:
            retries = task.retries if task.retries is not None and task.retries >= 0 else 0
            timeout = task.timeout if task.timeout is not None and task.timeout >= 0 else 3600 * 24 * 7
            trigger_rule = getattr(task, 'trigger_rule', None)
            if trigger_rule is None:
                trigger_rule = 'all_success'
            elif hasattr(trigger_rule, 'value'):
                trigger_rule = trigger_rule.value
            else:
                trigger_rule = "all_success"
            self.job_plan_builder.add_task(
                task_id=task.task_name,
                source=task.source,
                source_type=task.source_type,
                entry_point=task.file_path,
                dynamic_artifact=task.dynamic_artifact,
                cluster_id=task.cluster_id,
                cluster_type=task.cluster_type,
                dependent_libraries=task.dependent_libraries,
                input_params=task.input_parameters,
                retries=retries,
                timeout=timeout,
                task_notification_preference=task.notification_preference,
                task_notify_on=task.notify_on,
                trigger_rule=trigger_rule
            )

    def __add_dependencies(self, tasks: List[WorkflowTaskRequest]):
        for task in tasks:
            if task.depends_on is not None and task.depends_on != []:
                for depend_on_task in task.depends_on:
                    self.job_plan_builder.add_edge(depend_on_task, task.task_name)

    def create_dag(self, request: CreateWorkflowRequest, user_email: str):
        retries = request.retries if request.retries >= 0 else 0
        max_concurrent_runs = request.max_concurrent_runs if request.max_concurrent_runs > 0 else 1
        self.job_plan_builder.create_dag(
            dag_id=request.workflow_name,
            description=request.description,
            timetable=request.schedule,
            tags=request.tags,
            created_by=user_email,
            retries=retries,
            notify_on=request.notify_on,
            max_concurrent_runs=max_concurrent_runs,
            env=self.env,
            start_date=request.start_date,
            end_date=request.end_date,
            expected_run_duration=request.expected_run_duration,
            queue_enabled=request.queue_enabled,
            parameters=request.parameters,
            tenant=request.tenant
        )
        self.__add_tasks(request.tasks)
        self.__add_dependencies(request.tasks)

    def deploy(self):
        return self.job_plan_builder.build_and_deploy_workflow()

    async def deploy_v2(self):
        return await self.job_plan_builder.build_and_deploy_workflow_v2()

    async def update_dag(self, last_parsed_time: str):
        return await self.job_plan_builder.update_and_deploy_workflow(last_parsed_time)

    def deploy_via_yaml(self):
        # return self.job_plan_builder.build_and_deploy_workflow_via_yaml()
        raise NotImplementedError
