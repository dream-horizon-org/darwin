from __future__ import annotations

import logging
from typing import Dict, Optional
from workflow_core.constants.constants import auth, JOB_CLUSTER, ZIP, DARWIN_DEFAULT_CHANNEL
from workflow_core.entity.events_entities import WorkflowState
from workflow_core.utils.workflow_utils import create_modified_entry_point, \
    create_json_from_dag_args, \
    upload_to_airflow, upload_to_s3, _create_variable, _get_variable, _delete_variable, \
    string_packages_to_dict, \
    get_job_submit_details, get_params_value, wait_for_api_success_v2, wait_for_update_success, get_workflow_by_name, \
    create_workflow_event, publish_event

logging.getLogger('kafka').setLevel(logging.ERROR)
LOGGER = logging.getLogger('main')
LOGGER.setLevel(logging.INFO)


# TODO: JobPlanBuilder accumulates state (dag_args, tasks, dependencies) - not thread-safe for concurrent DAG creation
# TODO: Consider builder pattern with immutable intermediate states
class JobPlanBuilder:
    """
        Base class for darwin JobPlanBuilder,
    """

    def __init__(self):
        self.dag = None
        self.dag_args = {}
        self.tasks = []
        self.dependencies = []
        self.env = None

    def create_dag(self, dag_id: str, description: str, timetable: str, tags: list,
                   created_by: str, start_date: str, end_date: str, retries: int = 1, notify_on: str = "",
                   max_concurrent_runs: int = 16,
                   env: str = None, expected_run_duration: int=None,
                   parameters: dict = None,
                   queue_enabled:bool=True, tenant:str='d11'):
        """
        :param dag_id:  dag_id
        :param description: description
        :param timetable: cron expression
        :param tags: tags
        :param env: Environment
        :param created_by: created_by
        :param start_date: start_date
        :param end_date: end_date
        :param retries: retries
        :param notify_on: Slack Notification Channel
        :param max_concurrent_runs: max_concurrent_runs
        :param expected_run_duration: Expected run duration
        :param queue_enabled: queue enabled
        :param parameters: parameters
        :param tenant: tenant for which this dag needs to be created
        """
        self.env = env
        if notify_on is None or notify_on == "":
            notify_on = DARWIN_DEFAULT_CHANNEL
        self.dag_args = {
            'dag_id': dag_id, 'description': description, 'timetable': timetable, 'tags': tags, 'notify_on': notify_on,
            'retries': retries, 'concurrency': max_concurrent_runs, 'created_by': created_by,
            'start_date': start_date, 'end_date': end_date,
            'expected_run_duration': expected_run_duration,
            'queue_enabled': queue_enabled,
            'parameters': parameters,
            'tenant': tenant
        }

    def add_task(self, task_id: str, source: str, source_type: str, entry_point: str, dynamic_artifact: bool,
                 cluster_id: str, cluster_type: str, dependent_libraries="", input_params=None,
                 task_notification_preference: Optional[Dict[str, bool]] = None, task_notify_on: Optional[str] = None,
                 retries: int = 0, timeout: int = 360000, trigger_rule: str = "all_success"):
        """
        :param task_id: id of the task aka task name
        :param source: source
        :param source_type: source type
        :param entry_point: entrypoint of the task
        :param input_params: input params for the task
        :param dynamic_artifact: dynamic artifact
        :param dependent_libraries: dependent libraries to be installed
        :param cluster_id: cluster_id
        :param cluster_type: cluster_type
        :param retries: retries
        :param timeout: timeout
        :param task_notification_preference: task-level notification preference (optional)
        :param task_notify_on: task-level notify_on (optional)
        :param trigger_rule: Airflow trigger rule for the task
        :return: task
        """

        if input_params is None:
            input_params = {}

        runtime_env = string_packages_to_dict(dependent_libraries)

        entry_point, runtime_env = get_job_submit_details(
            dag_id=self.dag_args['dag_id'],
            dynamic_artifact=dynamic_artifact,
            source_type=source_type,
            source=source,
            file_path=entry_point,
            pip_packages=runtime_env,
            env=self.env
        )
        parameters = get_params_value(entry_point, input_params)
        new_entry_point, task_type = create_modified_entry_point(entry_point, task_id, self.env,
                                                                 self.dag_args['dag_id'])
        _create_variable(key=f"params_{self.dag_args['dag_id']}_{task_id}", value=parameters, env=self.env)
        task_args = {
            "cluster_id": cluster_id,
            "cluster_type": cluster_type,
            "entry_point_cmd": new_entry_point,
            "source_type": source_type,
            "path": entry_point,
            "dynamic_artifact": dynamic_artifact,
            "source": source,
            "runtime_env": runtime_env,
            "retries": retries,
            "input_parameters": input_params,
            "timeout": timeout,
            "trigger_rule": trigger_rule
        }
        if task_notification_preference is not None:
            task_args["task_notification_preference"] = task_notification_preference
        if task_notify_on is not None:
            task_args["task_notify_on"] = task_notify_on
        self.tasks.append((task_id, task_args))
        LOGGER.info(f'Task with {task_id} is added to dag')

    def add_edge(self, task1_id, task2_id):
        """
        :param task1_id: task1_id
        :param task2_id: task2_id
        """
        self.dependencies.append((task1_id, task2_id))
        edge = f"{task1_id} -> {task2_id}"
        LOGGER.info(f"Edge has been added to dag: {edge}")

    # TODO: build_and_deploy_workflow and build_and_deploy_workflow_v2 have significant duplication - extract common logic
    # TODO: Synchronous upload_to_airflow vs async upload_to_s3 - standardize deployment approach
    def build_and_deploy_workflow(self):
        dag, json_data = create_json_from_dag_args(self.env, self.dag_args, self.tasks, self.dependencies)
        LOGGER.info(f"Starting DAG upload for dag_id: {self.dag_args.get('dag_id')}")
        status = upload_to_airflow(dag, self.dag_args['dag_id'], env=self.env)

        dag_id = self.dag_args['dag_id']
        workflow_id = get_workflow_by_name(dag_id)['data']['workflow_id']
        if status:
            event = create_workflow_event(workflow_id, WorkflowState.WORKFLOW_CREATION_SUCCESS,
                                          {"workflow_name": dag_id, "workflow_id": workflow_id})
            # TODO: publish_event is a blocking call that can hang API responses - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=workflow_id, event=event)
        else:
            event = create_workflow_event(workflow_id, WorkflowState.WORKFLOW_CREATION_FAILED,
                                          {"workflow_name": dag_id, "workflow_id": workflow_id})
            # TODO: publish_event is a blocking call that can hang API responses - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=workflow_id, event=event)

        return status

    async def build_and_deploy_workflow_v2(self):
        dag, json_data = create_json_from_dag_args(self.env, self.dag_args, self.tasks, self.dependencies)
        dag_id = self.dag_args['dag_id']
        upload_to_s3(dag, self.dag_args['dag_id'], env=self.env)
        LOGGER.info(f'DAG file uploaded to S3 for "{dag_id}". Waiting for Airflow to sync...')
        status = await wait_for_api_success_v2(dag_id, self.env, f'Deploying the DAG "{dag_id}" to Darwin. Please wait....',
                                         5)
        workflow_id = get_workflow_by_name(dag_id)['data']['workflow_id']
        if status:
            LOGGER.info(f'DAG "{dag_id}" successfully deployed to Airflow')
            event = create_workflow_event(workflow_id, WorkflowState.WORKFLOW_CREATION_SUCCESS,
                                          {"workflow_name": dag_id, "workflow_id": workflow_id})
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=workflow_id, event=event)
        else:
            LOGGER.warning(f'DAG "{dag_id}" deployment timed out or failed. DAG file is in S3 but Airflow may not have synced it yet.')
            event = create_workflow_event(workflow_id, WorkflowState.WORKFLOW_CREATION_FAILED,
                                          {"workflow_name": dag_id, "workflow_id": workflow_id})
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=workflow_id, event=event)
        LOGGER.info(f'DAG "{dag_id}" deployment process completed. Status: {"SUCCESS" if status else "FAILED"}')
        return status

    async def update_and_deploy_workflow(self, last_parsed_time: str):
        dag, json_data = create_json_from_dag_args(self.env, self.dag_args, self.tasks, self.dependencies)
        dag_id = self.dag_args['dag_id']
        upload_to_s3(dag, self.dag_args['dag_id'], env=self.env)
        status = await wait_for_update_success(dag_id, self.env, 5, last_parsed_time)

        if status:
            workflow_id = get_workflow_by_name(dag_id)['data']['workflow_id']
            event = create_workflow_event(workflow_id, WorkflowState.WORKFLOW_UPDATION_SUCCESS,
                                          {"workflow_name": dag_id, "workflow_id": workflow_id})
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=get_workflow_by_name(dag_id)['data']['workflow_id'], event=event)
        else:
            workflow_id = get_workflow_by_name(dag_id)['data']['workflow_id']
            event = create_workflow_event(
                workflow_id, WorkflowState.WORKFLOW_UPDATION_FAILED,
                {"workflow_name": dag_id, "workflow_id": workflow_id}
            )
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(workflow_id=get_workflow_by_name(dag_id)['data']['workflow_id'], event=event)

        LOGGER.info(f'DAG "{dag_id}" is now visible in DARWIN UI.')
        return status
