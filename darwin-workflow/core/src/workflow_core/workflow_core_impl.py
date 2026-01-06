import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, TypeVar, Any, Literal
from urllib.parse import urljoin

import pytz
from workflow_core.models.dao_response import DaoResponse
from workflow_core.models.identifier import Identifier

from workflow_core.utils.cost_utils import get_cost_estimate
from workflow_core.v3.service.task_run_service import TaskRunService
from workflow_core.v3.service.workflow_run_service_v3 import WorkflowRunV3Impl
from workflow_model.meta_data import MetaData
from workflow_core.models.search_query import SearchQuery

from workflow_core.api.airlfow import AirflowApi
from workflow_core.api.compute import ComputeApi
from workflow_core.constants.configs import Config
from workflow_core.constants.constants import (
    INDEX, DELETED, ACTIVE, INACTIVE, FAIL, SUCCESS, ERROR, QUEUED, RUNNING, SCHEDULED, EXTERNAL, MANUAL,
    AUTOMATIC, VALID, JOB, CLUSTER_NAME_ALREADY_EXISTS_ERROR, CREATING_ARTIFACT, CREATION_FAILED,
    UPDATING_ARTIFACT, STRING, PAUSING, RESUMING, REPAIRING, SKIPPED, STOPPING, EXPIRED
)
from workflow_core.constants.constants import auth, SLACK_TOKEN, HTML
from workflow_core.dao.Airflow_dao import AirflowDao
from workflow_core.dao.darwin_workflow_dao import DarwinWorkflowConn
from workflow_core.dao.elasticsearch_dao import ElasticSearchConnection, RecentlyVisitedConnection, \
    WorkflowHistoryElasticSearchConnection
from workflow_core.dao.job_clusters_es_dao import JobClusElasticSearchConnection
from workflow_core.dao.manual_run_stop_es_dao import LatestTaskRunElasticSearchConnection
from workflow_core.dao.workflow_clusters_es_dao import WorkflowClusterElasticSearchConnection
from workflow_core.entity.events_entities import WorkflowState
from workflow_core.entity.workflow_es_dto import (
    WorkflowEsDtoIdentifier, RecentlyVisitedDtoIdentifier
)
from workflow_core.error.errors import JobClusterNotFoundException, RunNotFoundException, \
    TaskNotFoundException, WorkflowNotActiveException, ClusterNotFoundException, \
    RepairRunException, RunNotInRunningStateException
from workflow_core.error.errors import WorkflowNotFound
from workflow_core.utils.commuter_utils import CommuterUtils
from workflow_core.utils.datetime_utils import get_time_from_date_time
from workflow_core.utils.es_query import (
    ElasticSearchQuery, WorkFlowSearchFromName, WorkflowDeleteUsingName, WorkflowCreatedUsers,
    WorkFlowSearchFromId, WorkFlowSearchFromParam, RecentlyVisitedQuery, JobClusterSearchFromName,
    JobClusterSearchFromId, ListJobClusters, GetWorkflowCluster, WorkFlowSearchFromRunId, WorkFlowSearchFromClusterId,
    WorkflowSearchFromDisplayName, GetWorkflowClusterV2, GetLatestTaskInstance, WorkFlowSearchFromClusterID
)
from workflow_core.utils.job_cluster_es_dto import JobClusterEsDtoIdentifier
from workflow_core.utils.job_cluster_utils import get_memory, get_cores
from workflow_core.utils.logging_util import get_logger
from workflow_core.utils.rest_utils import api_request
from workflow_core.utils.slack_notifier import SlackNotifier
from workflow_core.utils.workflow_utils import _request, check_if_output_notebook_exists_in_s3, get_date, \
    check_if_output_notebook_exists_in_s3_v2, get_all_output_notebooks, delete_workflow_from_s3, create_workflow_event, \
    publish_event, \
    get_timestamp_from_run_id, check_if_output_notebook_folder_exists, get_logs_from_efs, get_output_notebook_path, \
    write_airflow_logs_to_efs, generate_workflow_yaml, update_workflow_ha_config, create_workflow_ha_config, \
    get_trigger, update_run_in_db
from workflow_core.workflow_core_interface import WorkflowCoreInterface
from workflow_model.constants.constants import STATUSES, DEFAULT_SCHEDULE, DEFAULT_INTEGER_VALUE, \
    DEFAULT_DISPLAY_TIMEZONE
from workflow_model.darwin_workflow import Workflow as DarwinWorkflow
from workflow_model.darwin_workflow import WorkflowRun as DarwinWorkflowRun
from workflow_model.job_cluster import JobClusterDefinition, \
    CheckUniqueJobClusterRequest, UpdateJobClusterDefinitionRequest, \
    CreateJobClusterDefinitionRequest, HeadNodeConfig, WorkerNodeConfig
from workflow_model.requests import (
    WorkflowsPostRequest, CheckUniqueWorkflowNamePostRequest, UpdateWorkflowTagsRequest, RetrieveWorkflowRunsRequest,
    UpdateWorkflowScheduleRequest, UpdateWorkflowMaxConcurrentRunsRequest, UpdateWorkflowRetriesRequest,
    JobClusterDefinitionListRequest, SearchRequest, UpdateMetadataRequest
)
from workflow_model.response import (
    CheckUniqueWorkflowNamePostResponseData, WorkflowListData, FiltersGetResponseData,
    WorkflowWorkflowIdDeleteResponseData, RecentlyVisitedGetResponseData, PauseScheduleWorkflowIdPutResponseData,
    ResumeScheduleWorkflowIdPutResponseData, RunNowWorkflowIdPutResponseData, StopRunWorkflowIdPutResponseData,
    WorkflowTagsData, WorkflowRun, WorkflowRuns, WorkflowYaml, RunDetails, TaskEvent, TaskDetails,
    TaskDetailsWithoutRun, WorkflowWorkflowIdGetResponseData, WorkflowIdResponse,
    CheckUniqueJobClusterResponseData, JobClusterDetailsResponseData, JobClusterDefinitionListResponseData,
    WorkflowTaskClusterResponseData,
    CreateJobClusterDefinitionResponseData, UpdateJobClusterDefinitionResponseData, WorkflowScheduleData,
    WorkflowMaxConcurrentRunsData, UpdateWorkflowRetriesData, TaskOutput, TaskDetailsV2,
    WorkflowDetails, RepairRunResponseData, RepairRunStatus, RunDetailsV2, RepairRun, WorkflowRunsV2, TaskOutputV2,
    TaskDetailsV3, WorkflowListDataV2, LastRunDetails, InsertWorkflowRunResponse, JobClusterDefinitionDeleteResponseData
)
from workflow_model.utils.utils import get_current_time
# Import the timezone conversion helper
from workflow_model.workflow import CreateWorkflowRequest, get_workflow, get_workflow_v2, WorkflowTask, ClusterDetails, \
    UpdateWorkflowRequest, get_update_workflow, WorkflowTaskRequest, get_current_workflow, \
    VersionedWorkflow, WorkflowTaskClusterRequest, get_workflow_task_cluster, RepairRunRequest, \
    WorkflowTaskClusterRequestV2, \
    get_workflow_task_cluster_v2, LatestTaskRun
from workflow_model.workflow import Workflow, RecentlyVisitedDto
from workflow_model.darwin_workflow import Metadata
from workflow_core.v3.service.workflow_service_v3 import WorkflowCoreV3Impl

logger = get_logger(__name__)

D = TypeVar('D', bound=MetaData)
Q = TypeVar('Q', bound=SearchQuery)
I = TypeVar('I', bound=Identifier)
Response = DaoResponse[D]


# TODO: This class is ~3500 lines - split into smaller focused services (WorkflowService, RunService, TaskService, ClusterService)
# TODO: Dual storage in Elasticsearch + MySQL creates consistency issues - consider single source of truth
# TODO: V1/V2/V3 implementations coexist with significant duplication - plan deprecation path for older versions. Or they can be in a different fils 
class WorkflowCoreImpl(WorkflowCoreInterface):
    def __init__(self, env: str):
        self.env = env
        self.es = ElasticSearchConnection(env)
        self.es_job_cluster = JobClusElasticSearchConnection(env)
        self.es_workflow_history = WorkflowHistoryElasticSearchConnection(env)
        self.es_workflow_cluster = WorkflowClusterElasticSearchConnection(env)
        self.es_latest_task_run = LatestTaskRunElasticSearchConnection(env)
        self.rec_vis_es = RecentlyVisitedConnection(env)
        self.airflow = AirflowApi(env)
        self.compute = ComputeApi(env)
        self.airflow_dao = AirflowDao(env)
        self.darwin_workflow_dao = DarwinWorkflowConn(env)
        self.logger = get_logger(__name__)
        self._config = Config(self.env)
        self.AIRFLOW_URL = self._config.get_airflow_url
        self.DARWIN_URL = self._config.get_darwin_url
        self.commuter_utils = CommuterUtils(env)
        self.slack_notifier = SlackNotifier(slack_token=SLACK_TOKEN)

        # Initialize V3 implementation with access to this instance
        self.v3_impl = WorkflowCoreV3Impl()
        self.v3_runs_impl = WorkflowRunV3Impl()
        self.v3_tr_service = TaskRunService()

    # TODO: find_workflow_id and find_workflow_id_async are identical except async keyword - consolidate
    def find_workflow_id(self, workflow_name: str):
        find_resp = self.__find_workflow_by_name(workflow_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound(f"Workflow with name {workflow_name} not found")
        return WorkflowIdResponse(workflow_id=find_resp.data[0].workflow_id)

    async def find_workflow_id_async(self, workflow_name: str):
        find_resp = self.__find_workflow_by_name(workflow_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound(f"Workflow with name {workflow_name} not found")
        return WorkflowIdResponse(workflow_id=find_resp.data[0].workflow_id)

    # TODO: Hardcoded 'Asia/Kolkata' timezone - should use workflow's configured timezone
    # TODO: Date validation methods exist in both workflow_core_impl.py and validators.py - consolidate
    def check_if_end_date_has_passed(self, end_date: str):
        if end_date == "" or end_date is None:
            return False

        end_date = get_date(end_date).date()
        current_date = datetime.now(pytz.timezone('Asia/Kolkata')).date()
        return end_date < current_date

    def check_if_start_date_has_yet_to_come(self, start_date: str):
        if start_date == "":
            return False

        start_date = get_date(start_date).date()
        current_date = datetime.now(pytz.timezone('Asia/Kolkata')).date()
        return start_date > current_date

    def get_dag_from_airflow(self, dag_id: str):
        return self.airflow.get_dag(dag_id=dag_id)

    def check_unique_name_bool(self, body: CheckUniqueWorkflowNamePostRequest):
        find_resp = self.__find_workflow_by_name(body.name)
        unique = False
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.debug(f"Workflow doesn't exist {body.name}")
            unique = True
        return CheckUniqueWorkflowNamePostResponseData(unique=unique)

    def check_unique_display_name_bool(self, body: CheckUniqueWorkflowNamePostRequest):
        find_resp = self.__find_workflow_by_display_name(body.name)
        unique = False
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.debug(f"Workflow doesn't exist {body.name}")
            unique = True
        return CheckUniqueWorkflowNamePostResponseData(unique=unique)

    async def check_unique_name(self, body: CheckUniqueWorkflowNamePostRequest):
        find_resp = self.__find_workflow_by_name(body.name)
        find_display_resp = self.__find_workflow_by_display_name(body.name)
        unique = "false"

        if (find_resp is None or find_resp.data is None or len(find_resp.data) == 0) and \
                (find_display_resp is None or find_display_resp.data is None or len(find_display_resp.data) == 0):
            self.logger.debug(f"Workflow name and display name don't exist: {body.name}")
            unique = "true"

        return CheckUniqueWorkflowNamePostResponseData(unique=unique)

    def __find_tasks_by_workflow_name(self, workflow_name: str, run_id: str):
        """
        Find task by workflow name
        :param workflow_name: name of the workflow
        :param run_id: run_id of the workflow
        :return: list of tasks
        """
        find_resp = self.__find_workflow_by_name(workflow_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound(f"Workflow with name {workflow_name} not found")
        task_resp = self.airflow.get_tasks(dag_id=workflow_name, run_id=run_id)
        if not task_resp or not task_resp['task_instances']:
            raise RunNotFoundException(f"Run with id {run_id} not found for workflow {workflow_name}")
        return task_resp['task_instances']

    def health_check_core(self):
        try:
            es_health = self.es.health_elasticsearch()
            # Convert boolean to string for response
            return "OK", str(es_health)
        except Exception as e:
            self.logger.warning(f"Health check error: {e}")
            return "OK", "False"

    async def initialize_db(self):
        await self.airflow_dao.initialize()

    async def get_recently_visited_object(self, workflow_id: str):
        try:
            if workflow_id == "" or workflow_id is None:
                return
            wf: Workflow = self.__find_workflow_by_id(workflow_id=workflow_id).data[0]

            results = await self.airflow_dao.execute_mysql_get_latest_state_async(wf.workflow_name)
            airflow_run_resp = results
            state = airflow_run_resp[0][0]
            if state == "running":
                last_run_time = ""
            else:
                last_run_time = airflow_run_resp[0][1].astimezone(pytz.timezone('Asia/Kolkata')).replace(
                    tzinfo=None).isoformat()
            return RecentlyVisitedGetResponseData(
                workflow_name=wf.workflow_name,
                display_name=wf.display_name,
                status=wf.workflow_status,
                workflow_id=workflow_id,
                last_run_time=last_run_time
            )
        except Exception as e:
            return

    async def recently_visited_workflows(self, user_id: str):
        resp = self.__find_recently_visited(user_id=user_id)
        if resp.data is None or len(resp.data) == 0:
            return []
        visited_list = resp.data[0].visited
        tasks = []
        for workflow_id in visited_list:
            tasks.append(self.get_recently_visited_object(workflow_id))
        resp_data = await asyncio.gather(*tasks)
        return [data for data in resp_data if data is not None]

    async def get_workflow_yaml(self, workflow_id: str, user_id: str):
        wf: Workflow = self.__find_workflow_by_id(workflow_id=workflow_id).data[0]
        wf_yaml = generate_workflow_yaml(wf.to_dict())
        return WorkflowYaml(workflow_id=workflow_id, yaml=wf_yaml)

    def _track_read_workflow(self, workflow_id: str, user_id: str):
        try:
            find_resp = self.__find_recently_visited(user_id=user_id)
            if not find_resp.is_success():
                self.logger.error(f"Error while querying the database for recently visited")
                return None

            if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
                # CREATE
                recently_visited = RecentlyVisitedDto(user_id=user_id, visited=[workflow_id, "", "", "", "", ""])
                create_resp = self.rec_vis_es.es_dao.create(recently_visited,
                                                            RecentlyVisitedDtoIdentifier(user_id=user_id))
                if not create_resp.is_success():
                    return ERROR
                return SUCCESS, create_resp.data
            else:
                # UPDATE
                if workflow_id in find_resp.data[0].visited:
                    find_resp.data[0].visited.remove(workflow_id)
                    find_resp.data[0].visited = find_resp.data[0].visited + [""]
                updated_visited = [workflow_id] + find_resp.data[0].visited
                updated_visited = updated_visited[:5]
                recently_visited = RecentlyVisitedDto(user_id=user_id, visited=updated_visited)
                update_resp = self.rec_vis_es.es_dao.update(recently_visited,
                                                            RecentlyVisitedDtoIdentifier(user_id=user_id))
                if not update_resp.is_success():
                    return ERROR
                return SUCCESS, update_resp.data
        except Exception as err:
            self.logger.error(f"Error occurred while updating recently visited userid: {user_id}")
            return err.__str__()

    def get_create_workflow_req(self, workflow_id: str):
        workflow, airflow_resp = self._sync_es_and_airflow(workflow_id=workflow_id)
        tasks = []
        for task in workflow.tasks:
            tasks.append(WorkflowTaskRequest(
                task_name=task.task_name,
                source=task.source,
                source_type=task.source_type,
                file_path=task.file_path,
                dynamic_artifact=task.dynamic_artifact,
                cluster_id=task.attached_cluster.cluster_id,
                cluster_type=task.cluster_type,
                dependent_libraries=task.dependent_libraries,
                packages=task.packages,
                input_parameters=task.input_parameters,
                retries=task.retries,
                timeout=task.timeout,
                depends_on=task.depends_on
            ))
        return workflow, CreateWorkflowRequest(
            workflow_name=workflow.workflow_name,
            display_name=workflow.display_name,
            description=workflow.workflow_name,
            tags=workflow.tags,
            schedule=workflow.schedule,
            retries=workflow.retries,
            notify_on=workflow.notify_on,
            callback_urls=workflow.callback_urls,
            event_types=workflow.event_types,
            max_concurrent_runs=workflow.max_concurrent_runs,
            tasks=tasks
        )

    async def get_workflow_by_workflow_id(self, workflow_id: str, user_id: str):
        wf, airflow_resp = await self._sync_es_and_airflow_v2(workflow_id=workflow_id)

        logger.info(f"Workflow: {wf}")
        logger.info(f"airflow_resp: {airflow_resp}")

        schedule = wf.schedule if wf.schedule != DEFAULT_SCHEDULE else ""
        logger.info(f"schedule: {schedule}")
        retries = wf.retries if wf.retries != DEFAULT_INTEGER_VALUE else None
        logger.info(f"retries: {retries}")
        max_concurrent_runs = wf.max_concurrent_runs if wf.max_concurrent_runs != DEFAULT_INTEGER_VALUE else None

        logger.info(f"max_concurrent_runs: {max_concurrent_runs}")
        tasks = []
        if wf.tasks is not None:
            for task in wf.tasks:
                task.timeout = task.timeout if task.timeout != DEFAULT_INTEGER_VALUE else None
                task.retries = task.retries if task.retries != DEFAULT_INTEGER_VALUE else None
                tasks.append(task)

        logger.info(f"tasks: {tasks}")
        if ("next_dagrun" in airflow_resp and airflow_resp["next_dagrun"] is not None):
            next_dagrun = airflow_resp["next_dagrun"]
        else:
            next_dagrun = ""

        data = WorkflowWorkflowIdGetResponseData(
            workflow_id=wf.workflow_id,
            workflow_name=wf.workflow_name,
            description=wf.description,
            tags=wf.tags,
            schedule=schedule,
            retries=retries,
            notify_on=wf.notify_on,
            callback_urls=wf.callback_urls,
            event_types=wf.event_types,
            max_concurrent_runs=max_concurrent_runs,
            created_by=wf.created_by,
            last_updated_on=wf.last_updated_on,
            created_at=wf.created_at,
            workflow_status=wf.workflow_status,
            tasks=tasks,
            next_run_time=next_dagrun,
        )
        logger.info(f"data: {data}")
        self._track_read_workflow(workflow_id=workflow_id, user_id=user_id)
        return data

    # TODO: _sync_es_and_airflow, _sync_es_and_airflow_v2, _sync_es_and_airflow_by_runid have overlapping logic - refactor into single method with options
    # TODO: Silent failures possible if Airflow is unreachable - add explicit error handling
    def _sync_es_and_airflow_by_runid(self, workflow_name=None, workflow_id=None, run_id=None):
        """Synchronizes workflow data between Elasticsearch and Airflow based on run ID."""

        dag_id = workflow_name
        if workflow_name:
            wf: Workflow = self.__get_workflow(workflow_name=workflow_name)
        else:
            es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
            if (len(es_response) == 0):
                raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
            wf: Workflow = es_response[0]
            dag_id = wf.workflow_name

        timestamp = get_timestamp_from_run_id(run_id)
        # Convert strings to datetime objects
        wf_last_updated_on = datetime.strptime(wf.last_updated_on, '%Y-%m-%d %H:%M:%S.%f%z')
        timestamp_datetime = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S.%f%z')

        if wf_last_updated_on > timestamp_datetime:
            es_response = self.__get_workflow_by_runid(workflow_id=workflow_id, timestamp=timestamp).data
            if (len(es_response) == 0):
                es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
            wf: Workflow = es_response[0]
            dag_id = wf.workflow_name

        airflow_resp = self.airflow.get_dag(dag_id=dag_id)

        wf.tasks = self._refresh_clusters(wf.tasks)
        return wf, airflow_resp

    def get_workflow_by_workflow_runid(self, workflow_id: str, run_id: str, user_id: str):
        wf, airflow_resp = self._sync_es_and_airflow_by_runid(workflow_id=workflow_id, run_id=run_id)

        logger.info(f"Workflow: {wf}")
        logger.info(f"airflow_resp: {airflow_resp}")

        schedule = wf.schedule if wf.schedule != DEFAULT_SCHEDULE else ""
        logger.info(f"schedule: {schedule}")
        retries = wf.retries if wf.retries != DEFAULT_INTEGER_VALUE else None
        logger.info(f"retries: {retries}")
        max_concurrent_runs = wf.max_concurrent_runs if wf.max_concurrent_runs != DEFAULT_INTEGER_VALUE else None

        logger.info(f"max_concurrent_runs: {max_concurrent_runs}")
        tasks = []
        for task in wf.tasks:
            task.timeout = task.timeout if task.timeout != DEFAULT_INTEGER_VALUE else None
            task.retries = task.retries if task.retries != DEFAULT_INTEGER_VALUE else None
            tasks.append(task)

        logger.info(f"tasks: {tasks}")
        if ("next_dagrun" in airflow_resp and airflow_resp["next_dagrun"] is not None):
            next_dagrun = airflow_resp["next_dagrun"]
        else:
            next_dagrun = ""

        data = WorkflowWorkflowIdGetResponseData(
            workflow_id=wf.workflow_id,
            workflow_name=wf.workflow_name,
            display_name=wf.display_name,
            description=wf.description,
            tags=wf.tags,
            schedule=schedule,
            retries=retries,
            notify_on=wf.notify_on,
            max_concurrent_runs=max_concurrent_runs,
            created_by=wf.created_by,
            last_updated_on=wf.last_updated_on,
            created_at=wf.created_at,
            workflow_status=wf.workflow_status,
            tasks=tasks,
            next_run_time=next_dagrun,
        )
        logger.info(f"data: {data}")
        self._track_read_workflow(workflow_id=workflow_id, user_id=user_id)
        return data

    async def get_workflow_by_workflow_id_v2(self, workflow_id: str, user_id: str):
        wf, airflow_resp = await self._sync_es_and_airflow_v2(workflow_id=workflow_id)

        schedule = wf.schedule if wf.schedule != DEFAULT_SCHEDULE else ""
        logger.info(f"schedule: {schedule}")

        retries = wf.retries if wf.retries != DEFAULT_INTEGER_VALUE else None
        logger.info(f"retries: {retries}")
        max_concurrent_runs = wf.max_concurrent_runs if wf.max_concurrent_runs != DEFAULT_INTEGER_VALUE else None

        logger.info(f"max_concurrent_runs: {max_concurrent_runs}")
        tasks = []
        if wf.tasks is not None:
            for task in wf.tasks:
                task.timeout = task.timeout if task.timeout != DEFAULT_INTEGER_VALUE else None
                task.retries = task.retries if task.retries != DEFAULT_INTEGER_VALUE else None
                tasks.append(task)

        logger.debug(f"tasks: {tasks}")

        if ("next_dagrun" in airflow_resp and airflow_resp["next_dagrun"] is not None):
            next_dagrun = airflow_resp["next_dagrun"]
        else:
            next_dagrun = ""

        data = WorkflowWorkflowIdGetResponseData(
            workflow_id=wf.workflow_id,
            workflow_name=wf.workflow_name,
            display_name=wf.display_name,
            description=wf.description,
            tags=wf.tags,
            schedule=schedule,
            retries=retries,
            notify_on=wf.notify_on,
            parameters = wf.parameters,
            callback_urls=wf.callback_urls,
            event_types=wf.event_types,
            max_concurrent_runs=max_concurrent_runs,
            created_by=wf.created_by,
            last_updated_on=wf.last_updated_on,
            created_at=wf.created_at,
            workflow_status=wf.workflow_status,
            tasks=tasks,
            next_run_time=next_dagrun, # Use converted next run time
            queue_enabled=wf.queue_enabled,
            expected_run_duration = wf.expected_run_duration,
            notification_preference = wf.notification_preference
        )
        logger.info(f"data: {data}")
        logger.debug(f"wf: {wf}")
        self._track_read_workflow(workflow_id=workflow_id, user_id=user_id)
        return data

    def _refresh_clusters(self, tasks: List[WorkflowTask]):
        result = []
        for task in tasks:
            if task.cluster_type == JOB:
                task.attached_cluster = self.get_job_cluster_details(task.attached_cluster.cluster_id)
            else:
                task.attached_cluster = self.compute.get_cluster_details(task.attached_cluster.cluster_id)
            result.append(task)
        return result

    def get_job_cluster_details(self, job_cluster_id: str):
        resp = self.get_job_cluster_definition(job_cluster_definition_id=job_cluster_id)
        memory = resp.head_node_config.memory
        core = resp.head_node_config.cores
        for worker in resp.worker_node_configs:
            core = core + worker.cores_per_pods * worker.max_pods
            memory = memory + worker.memory_per_pods * worker.max_pods
        return ClusterDetails(
            cluster_id=job_cluster_id,
            runtime=resp.runtime,
            cluster_name=resp.cluster_name,
            cluster_status="",
            memory=memory,
            cores=core,
            ray_dashboard="",
            logs_dashboard="",
            events_dashboard="",
            created_at=resp.created_at,
            estimated_cost=resp.estimated_cost,
        )

    def _sync_es_and_airflow(self, workflow_name: str = None, workflow_id: str = None):
        dag_id = workflow_name
        if workflow_name:
            wf: Workflow = self.__get_workflow(workflow_name=workflow_name)
        else:
            es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
            if (len(es_response) == 0):
                raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
            wf: Workflow = es_response[0]
            dag_id = wf.workflow_name
        airflow_resp = self.airflow.get_dag(dag_id=dag_id)

        wf.tasks = self._refresh_clusters(wf.tasks)
        self.__update_workflow(wf)
        return wf, airflow_resp

    async def _sync_es_and_airflow_v2(self, workflow_name: str = None, workflow_id: str = None):
        dag_id = workflow_name

        if workflow_name:
            wf: Workflow = self.__get_workflow(workflow_name=workflow_name)
        else:
            es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
            if es_response is None or len(es_response) == 0:
                raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
            wf: Workflow = es_response[0]
            dag_id = wf.workflow_name
        airflow_resp = self.airflow.get_dag(dag_id=dag_id)
        if wf.tasks is not None:
            wf.tasks = self._refresh_clusters(wf.tasks)
        self.__update_workflow(wf)
        return wf, airflow_resp

    async def _get_workflow_list_data(self, workflow, status: [str]):
        try:
            task1 = asyncio.create_task(self.airflow_dao.execute_mysql_get_dag_details_async(workflow['workflow_name']))
            task2 = asyncio.create_task(self.airflow_dao.execute_mysql_latest_dag_runs_async(workflow['workflow_name']))
            results = await asyncio.gather(task1, task2)
            airflow_resp = results[0]
            wf_runs = results[1]
            if (not (airflow_resp is not None and len(airflow_resp))):
                return None

            state = workflow['workflow_status']
            if status is not None and status != []:
                if state not in status:
                    return None
            schedule = "" if workflow['schedule'] == DEFAULT_SCHEDULE else workflow['schedule']

            if (wf_runs is not None and len(wf_runs)):
                last_runs_status = [wf_run[0] for wf_run in wf_runs]
            else:
                last_runs_status = []
            if airflow_resp[0][1] is not None:
                next_run_time = airflow_resp[0][1].astimezone(pytz.timezone('Asia/Kolkata')).replace(
                    tzinfo=None).isoformat()
            else:
                next_run_time = ""
            return WorkflowListData(
                workflow_name=workflow['workflow_name'],
                display_name=workflow['display_name'],
                description=workflow['description'],
                status=state,
                workflow_id=workflow['workflow_id'],
                tags=workflow['tags'],
                schedule=schedule,
                last_runs_status=last_runs_status,
                next_run_time=next_run_time,
                owner=workflow['created_by'],
            )

        except Exception as e:
            self.logger.error(f"Exception: {e}")

    async def _get_workflow_list_from_airflow(self, workflows, status: [str], request_id):

        try:
            # Check if MySQL connection pool is initialized
            if self.airflow_dao._mysql_dao.pool is None:
                self.logger.warning("MySQL connection pool not initialized, returning workflows with basic data from Elasticsearch")
                # Return workflows with basic data from Elasticsearch (without Airflow enrichment)
                workflow_response_list = []
                for workflow in workflows:
                    workflow_name = workflow['workflow_name']
                    display_name = workflow['display_name'] if 'display_name' in workflow and workflow[
                        'display_name'] else workflow_name
                    description = workflow['description']
                    tags = workflow['tags']
                    owner = workflow['created_by']
                    workflow_id = workflow['workflow_id']
                    schedule = "" if workflow['schedule'] == DEFAULT_SCHEDULE else workflow['schedule']
                    state = workflow['workflow_status']

                    if (state in status):
                        workflow_response_list.append(WorkflowListDataV2(
                            workflow_name=workflow_name,
                            display_name=display_name,
                            description=description,
                            status=state,
                            workflow_id=workflow_id,
                            tags=tags,
                            schedule=schedule,
                            last_run_details=[],  # Empty since we can't fetch from MySQL
                            next_run_time="",  # Empty since we can't fetch from MySQL
                            owner=owner,
                        ))
                return workflow_response_list

            logger.info(f"workflow filter time before sql search for request id {request_id}: {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
            dag_id_list = [workflow['workflow_name'] for workflow in workflows]
            workflow_id_list = [workflow['workflow_id'] for workflow in workflows]
            task1 = asyncio.create_task(self.airflow_dao.execute_mysql_get_all_dag_details_async(dag_id_list))
            task2 = asyncio.create_task(self.airflow_dao.execute_mysql_latest_dag_runs_for_all_dags_async(dag_id_list))
            results = await asyncio.gather(task1, task2)
            logger.info(f"workflow filter time after sql search for request id {request_id}: {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
            dag_details = results[0]
            wf_runs = results[1]
            workflow_db_runs = await self.fetch_runs_for_workflows(workflow_ids=workflow_id_list)
            workflow_map = self.get_workflow_map(dag_id_list, dag_details, wf_runs, workflow_db_runs)
            workflow_response_list = []

            for workflow in workflows:
                workflow_name = workflow['workflow_name']
                display_name = workflow['display_name'] if 'display_name' in workflow and workflow[
                    'display_name'] else workflow_name
                description = workflow['description']
                tags = workflow['tags']
                owner = workflow['created_by']
                workflow_id = workflow['workflow_id']
                schedule = "" if workflow['schedule'] == DEFAULT_SCHEDULE else workflow['schedule']
                # Set this to get the next_run_time for all the workflows in a certain timezone
                display_timezone = DEFAULT_DISPLAY_TIMEZONE

                # Get next run time converted to display timezone
                next_run_time = self.get_next_run(workflow_map[workflow_name]["dag_details_response"], display_timezone)
                last_run_details_list = workflow_map[workflow_name]["dag_run_response"][:5]  # Get only the last 5 runs
                last_run_details = [
                    LastRunDetails(**run) for run in last_run_details_list
                ] if last_run_details_list else []

                state = workflow['workflow_status']

                if (state in status):
                    workflow_response_list.append(WorkflowListDataV2(
                        workflow_name=workflow_name,
                        display_name=display_name,
                        description=description,
                        status=state,
                        workflow_id=workflow_id,
                        tags=tags,
                        schedule=schedule,
                        last_run_details=last_run_details,
                        next_run_time=next_run_time, # Already converted
                        owner=owner,
                    ))
            logger.info(f"workflow filter time after all process for request id {request_id}: {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
            return workflow_response_list
        except Exception as e:
            self.logger.error(f"Exception while fetching workflow data: {e}")
            # Fallback: return workflows with basic data from Elasticsearch if MySQL fails
            self.logger.warning("Falling back to basic workflow data from Elasticsearch due to error")
            workflow_response_list = []
            for workflow in workflows:
                workflow_name = workflow['workflow_name']
                display_name = workflow['display_name'] if 'display_name' in workflow and workflow[
                    'display_name'] else workflow_name
                description = workflow['description']
                tags = workflow['tags']
                owner = workflow['created_by']
                workflow_id = workflow['workflow_id']
                schedule = "" if workflow['schedule'] == DEFAULT_SCHEDULE else workflow['schedule']
                state = workflow['workflow_status']

                if (state in status):
                    workflow_response_list.append(WorkflowListDataV2(
                        workflow_name=workflow_name,
                        display_name=display_name,
                        description=description,
                        status=state,
                        workflow_id=workflow_id,
                        tags=tags,
                        schedule=schedule,
                        last_run_details=[],  # Empty since we can't fetch from MySQL
                        next_run_time="",  # Empty since we can't fetch from MySQL
                        owner=owner,
                    ))
            return workflow_response_list

    def get_workflow_map(self, dag_id_list, dag_details, dag_runs, workflow_db_runs):
        workflow_map = {dag_id: {"dag_details_response": {}, "dag_run_response": []} for dag_id in dag_id_list}

        # Map dag_id to details
        for i in dag_details:
            workflow_name = i['dag_id']
            workflow_map[workflow_name]['dag_details_response'] = i

        # Convert workflow_db_runs into a dictionary grouped by workflow_id
        workflow_db_runs_map = {}
        for run in workflow_db_runs:
            if run.workflow_id not in workflow_db_runs_map:
                workflow_db_runs_map[run.workflow_id] = []
            workflow_db_runs_map[run.workflow_id].append(run)

        # Sort and keep only last 5 runs per workflow
        for workflow_id, runs in workflow_db_runs_map.items():
            sorted_runs = sorted(runs, key=lambda x: x.start_time, reverse=True)[:5]
            workflow_db_runs_map[workflow_id] = sorted_runs

        # Populate the workflow map with run details
        for i in workflow_db_runs:
            workflow_name = i.dag_id
            workflow_id = i.workflow_id

            # Get additional details from workflow_db_runs if available
            db_runs = workflow_db_runs_map.get(workflow_id, [])

            run_details_list = []
            for db_run in db_runs:
                run_details_list.append({
                    "run_status": db_run.state,
                    "is_run_duration_exceeded": db_run.sla_exceeded,
                    "expected_run_duration": db_run.expected_run_duration
                })

            workflow_map[workflow_name]["dag_run_response"] = run_details_list  # Store only last 5 runs

        return workflow_map

    def get_next_run(self, dag_details_response, display_timezone: Literal["UTC", "IST"]):
        if "next_dagrun" in dag_details_response:
            next_run = dag_details_response["next_dagrun"]
            next_run_time = get_time_from_date_time(next_run, display_timezone)
        else:
            next_run_time = ""
        return next_run_time

    async def search_workflows(self, body: WorkflowsPostRequest):
        if body.filters.status is not None and body.filters.status != []:
            resp = self.__find_workflow_by_params(body.filters.user,
                                                  [ACTIVE, INACTIVE, RUNNING, CREATING_ARTIFACT,
                                                   CREATION_FAILED, UPDATING_ARTIFACT], body.query,
                                                  body.sort_by, body.sort_order, 0, 1500)
            if not resp.is_success():
                raise Exception
            workflows = [data['_source'] for data in resp.data['hits']['hits']]
            tasks = []
            for workflow in workflows:
                tasks.append(self._get_workflow_list_data(workflow, body.filters.status))
            resp_data = await asyncio.gather(*tasks)
            resp_data = [data for data in resp_data if data is not None]
            return len(resp_data), resp_data[body.offset:body.offset + body.page_size]
        else:
            resp = self.__find_workflow_by_params(body.filters.user,
                                                  [ACTIVE, INACTIVE, RUNNING, CREATING_ARTIFACT, CREATION_FAILED,
                                                   UPDATING_ARTIFACT],
                                                  body.query,
                                                  body.sort_by, body.sort_order, body.offset, body.page_size)
            if not resp.is_success():
                raise Exception
            total = resp.data['hits']['total']['value']
            workflows = [data['_source'] for data in resp.data['hits']['hits']]
            tasks = []
            for workflow in workflows:
                tasks.append(self._get_workflow_list_data(workflow, body.filters.status))
            resp_data = await asyncio.gather(*tasks)
            resp_data = [data for data in resp_data if data is not None]
            return total, resp_data

    async def search_workflows_v2(self, body: WorkflowsPostRequest):
        # Determine if status filtering is applied
        filter_status = body.filters.status is not None and body.filters.status != []

        # Set initial search parameters
        statuses = [ACTIVE, INACTIVE, RUNNING, CREATING_ARTIFACT, CREATION_FAILED, UPDATING_ARTIFACT]
        offset = 0 if filter_status else body.offset
        page_size = 1500 if filter_status else body.page_size

        # Execute search
        resp = self.__find_workflow_by_params(body.filters.user, statuses, body.query,
                                              body.sort_by, body.sort_order, offset, page_size)
        if not resp.is_success():
            raise Exception("Failed to find workflows")

        # Extract workflows
        workflows = [data['_source'] for data in resp.data['hits']['hits']]

        # Fetch additional data for each workflow asynchronously
        tasks = [self._get_workflow_list_data(workflow, body.filters.status) for workflow in workflows]
        resp_data = await asyncio.gather(*tasks)
        resp_data = [data for data in resp_data if data is not None]

        # Adjust response based on filtering status
        if filter_status:
            total = len(resp_data)
            resp_data = resp_data[body.offset:body.offset + body.page_size]
        else:
            total = resp.data['hits']['total']['value']

        return total, resp_data

    async def search_workflows_v2_optimised(self, body: WorkflowsPostRequest):
        # Determine if status filtering is applied
        filter_status = body.filters.status is not None and body.filters.status != []
        request_id = uuid.uuid4()
        # Set initial search parameters
        if not filter_status:
            statuses = [ACTIVE, INACTIVE, RUNNING, CREATING_ARTIFACT, CREATION_FAILED, UPDATING_ARTIFACT, RESUMING,
                        PAUSING]
        else:
            statuses = body.filters.status

        offset = 0 if filter_status else body.offset
        page_size = 2000 if filter_status else body.page_size

        # Execute search
        logger.info(f"workflow filter time before elastic search for request id {request_id}: {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
        resp = self.__find_workflow_by_params(body.filters.user, statuses, body.query,
                                              body.sort_by, body.sort_order, offset, page_size)
        if not resp.is_success():
            raise Exception("Failed to find workflows")

        logger.info(f"workflow filter time after elastic search for request id {request_id}:{datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
        # Extract workflows
        workflows = [data['_source'] for data in resp.data['hits']['hits']]
        resp_data = await self._get_workflow_list_from_airflow(workflows, statuses, request_id)

        # Adjust response based on filtering status
        if filter_status:
            total = len(resp_data)
            resp_data = resp_data[body.offset:body.offset + body.page_size]
        else:
            total = resp.data['hits']['total']['value']

        return total, resp_data

    def _delete(self, workflow_name: str):
        find_resp = self.__find_workflow_by_name(workflow_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.error(f"Workflow {workflow_name} doesn't exist.")
            return False
        else:
            resp = self.delete_workflow(workflow_name)
            if resp['deleted'] != 0:
                return True
        return False

    def create_workflow(self, workflow_request: CreateWorkflowRequest, user_email: str):
        """
        Create a workflow
        :param workflow_request: request object
        :param user_email: email of the user
        """

        find_resp = self.__find_workflow_by_name(workflow_request.workflow_name)
        if not find_resp.is_success():
            self.logger.error(f"Error while querying the database, {find_resp.status}, {find_resp.data}")
            raise Exception(f"Error while querying the database for workflow: {workflow_request.workflow_name}")
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            workflow_entity: Workflow = get_workflow(workflow_request, user_email)

            event = create_workflow_event(
                workflow_entity.workflow_id,
                WorkflowState.WORKFLOW_CREATION_REQUEST_RECEIVED,
                {"request": workflow_request.to_dict(), "user_email": user_email}
            )
            # TODO: publish_event is a blocking call that can hang API responses - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(event, callback_urls=workflow_request.callback_urls, event_types=workflow_request.event_types)

            create_resp = self.es.es_dao.create(workflow_entity,
                                                WorkflowEsDtoIdentifier(workflow_id=workflow_entity.workflow_id))
            if not create_resp.is_success():
                self.logger.error(f"Creating workflow failed with response {create_resp.error_message}")
                raise Exception(create_resp.error_message or "Creating workflow failed")
            if create_resp.data.schedule == DEFAULT_SCHEDULE:
                create_resp.data.schedule = ""
            self.airflow.resume_a_dag(workflow_entity.workflow_name)
            return SUCCESS, create_resp.data
        else:
            self.logger.debug(f"Workflow already exist {find_resp.data[0]}")
            raise Exception(f"Workflow already exist = {find_resp.data[0]}")

    async def create_or_update_workflow(self, workflow_entity):
        # Try to retrieve the workflow by workflow_id
        workflow = await DarwinWorkflow.filter(workflow_id=workflow_entity.workflow_id).first()

        # If no record is found, create a new instance.
        if workflow is None:
            workflow = DarwinWorkflow(workflow_id=workflow_entity.workflow_id)

        # Update the fields with values from workflow_entity.
        workflow.workflow_name = workflow_entity.workflow_name
        workflow.workflow_status = workflow_entity.workflow_status
        workflow.description = workflow_entity.description
        workflow.max_concurrent_runs = workflow_entity.max_concurrent_runs
        workflow.schedule = workflow_entity.schedule
        workflow.notify_on = workflow_entity.notify_on
        workflow.parameters = workflow_entity.parameters
        workflow.retries = workflow_entity.retries
        workflow.queue_enabled = workflow_entity.queue_enabled
        workflow.expected_run_duration = workflow_entity.expected_run_duration
        workflow.notify_on_states = workflow_entity.notification_preference
        workflow.callback_urls = workflow_entity.callback_urls
        workflow.event_types = workflow_entity.event_types
        workflow.display_name = workflow_entity.display_name
        workflow.created_by = workflow_entity.created_by
        workflow.tags = workflow_entity.tags
        workflow.start_date = workflow_entity.start_date
        workflow.end_date = workflow_entity.end_date
        workflow.last_updated_on = get_current_time()
        workflow.tenant = workflow_entity.tenant
        workflow.timezone = workflow_entity.timezone  # Add timezone field

        if workflow_entity.end_date is None or workflow_entity.end_date == "":
            workflow.end_date = None
        # Save the workflow to the database.
        await workflow.save()
        return workflow

    async def create_workflow_v2(self, workflow_request: CreateWorkflowRequest, user_email: str):
        """
        Create a workflow
        :param workflow_request: request object
        :param user_email: email of the user

        """
        find_resp = self.__find_workflow_by_name(workflow_request.workflow_name)
        if not find_resp.is_success():
            self.logger.error(f"Error while querying the database, {find_resp.status}, {find_resp.data}")
            raise Exception(f"Error while querying the database for workflow: {workflow_request.workflow_name}")
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            workflow_entity: Workflow = get_workflow_v2(workflow_request, user_email)
            workflow_entity = create_workflow_ha_config(workflow_entity)
            event = create_workflow_event(
                workflow_entity.workflow_id,
                WorkflowState.WORKFLOW_CREATION_REQUEST_RECEIVED,
                {"request": workflow_request.to_dict(), "user_email": user_email}
            )
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(event, callback_urls=workflow_request.callback_urls, event_types=workflow_request.event_types)
            try:
                await self.create_or_update_workflow(workflow_entity)
            except Exception as e:
                self.logger.error(f"Error while creating workflow, {e}")
                raise Exception(f"Error while creating workflow, {e}")
            create_resp = self.es.es_dao.create(workflow_entity,
                                                WorkflowEsDtoIdentifier(workflow_id=workflow_entity.workflow_id))
            self.logger.info('printing create response')
            self.logger.info(create_resp)
            if not create_resp.is_success():
                error_msg = create_resp.error_message or f"Creating workflow failed with status {create_resp.status}"
                self.logger.error(f"Creating workflow failed: {error_msg}")
                raise Exception(f"Error while creating workflow: {error_msg}")
            if create_resp.data.schedule == DEFAULT_SCHEDULE:
                create_resp.data.schedule = ""
            # self.airflow.resume_a_dag(workflow_entity.workflow_name) # dont resume during create flow
            return SUCCESS, create_resp.data
        else:
            self.logger.debug(f"Workflow already exist {find_resp.data[0]}")
            raise Exception(f"Workflow already exist = {find_resp.data[0]}")

    def activate_dag(self, workflow_name: str):
        resp = self.airflow.resume_a_dag(workflow_name)
        if resp['is_paused']:
            return WorkflowWorkflowIdGetResponseData(workflow_name=workflow_name, workflow_status=INACTIVE)
        else:
            return WorkflowWorkflowIdGetResponseData(workflow_name=workflow_name, workflow_status=ACTIVE)

    def activate_dag_v2(self, workflow_name: str, status: str = ACTIVE):
        import time
        
        # Wait a bit to ensure DAG is fully parsed by Airflow before attempting to unpause
        # This helps avoid race condition where we try to unpause before DAG exists in Airflow
        max_retries = 5
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                # Check if DAG exists in Airflow
                dag = self.airflow.get_dag(workflow_name)
                if dag:
                    self.logger.info(f"DAG {workflow_name} found in Airflow, attempting to unpause")
                    break
            except Exception as e:
                if attempt < max_retries - 1:
                    self.logger.warning(f"DAG {workflow_name} not yet available in Airflow (attempt {attempt + 1}/{max_retries}), retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                else:
                    self.logger.error(f"DAG {workflow_name} not available in Airflow after {max_retries} attempts")
        
        # Now unpause the DAG
        resp = self.airflow.resume_a_dag(workflow_name)
        self.logger.info(f"Unpause response for {workflow_name}: is_paused={resp.get('is_paused')}")
        
        wf_id_response = self.find_workflow_id(workflow_name)
        wf_id = wf_id_response.workflow_id
        self.update_workflow_status(workflow_id=wf_id, status=status)
        
        if resp['is_paused']:
            self.logger.warning(f"DAG {workflow_name} is still paused after unpause call")
            return ResumeScheduleWorkflowIdPutResponseData(workflow_id=wf_id, workflow_status=INACTIVE)
        else:
            self.logger.info(f"DAG {workflow_name} successfully unpaused")
            return ResumeScheduleWorkflowIdPutResponseData(workflow_id=wf_id, workflow_status=ACTIVE)

    def update_workflow(self, workflow_request: UpdateWorkflowRequest, workflow_id: str, user_email: str):
        find_resp = self.get_workflow_by_id_v2(workflow_id)
        if not find_resp.is_success():
            self.logger.error(f"Error while querying the database, {find_resp.status}, {find_resp.data}")
            raise Exception(f"Error while querying the database with resp {find_resp}")
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.error(f"Workflow doesn't exist with workflow_id {workflow_id}")
            raise Exception(f"Workflow doesn't exist with workflow_id {workflow_id}")
        else:
            workflows = [(data['_source'], data['_version']) for data in find_resp.data['hits']['hits']]
            workflow, workflow_version = workflows[0][0], workflows[0][1]
            self.logger.debug(f"workflow_version: {workflow_version}")
            current_workflow_entity: VersionedWorkflow = get_current_workflow(Workflow(**workflow), workflow_version)
            self.logger.debug(f"current_workflow_entity: {current_workflow_entity}")
            create_resp = self.es_workflow_history.es_dao.create(current_workflow_entity)

            if not create_resp.is_success():
                raise Exception(f"Creating workflow history failed with response {create_resp}")

            workflow_object = Workflow(**workflow)
            # if start date or end date is not provided in the request, use the existing values fetched from db
            start_date = workflow_object.start_date if workflow_request.start_date is None else workflow_request.start_date
            end_date = workflow_object.end_date if workflow_request.end_date is None else workflow_request.end_date

            updated_workflow_entity: Workflow = get_update_workflow(created_by=user_email, created_at=workflow_object.created_at,
                                                                    workflow_request=workflow_request, workflow_id=workflow_id,
                                                                    start_date=start_date, end_date=end_date)
            self.logger.debug(f"updated_workflow_entity: {updated_workflow_entity}")
            update_resp = self.es.es_dao.update(updated_workflow_entity,
                                                WorkflowEsDtoIdentifier(
                                                    workflow_id=updated_workflow_entity.workflow_id))

            if not update_resp.is_success():
                raise Exception(
                    f'failed to update workflow with workflow_id {workflow_id}, response: {update_resp.data}')

            return SUCCESS, update_resp.data

    async def update_workflow_v2(self, workflow_request: UpdateWorkflowRequest, workflow_id: str, user_email: str,
                           status: str = UPDATING_ARTIFACT):
        find_resp = self.get_workflow_by_id_v2(workflow_id)
        if not find_resp.is_success():
            self.logger.error(f"Error while querying the database, {find_resp.status}, {find_resp.data}")
            raise Exception(f"Error while querying the database with resp {find_resp}")
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.error(f"Workflow doesn't exist with workflow_id {workflow_id}")
            raise Exception(f"Workflow doesn't exist with workflow_id {workflow_id}")
        else:
            workflows = [(data['_source'], data['_version']) for data in find_resp.data['hits']['hits']]
            workflow, workflow_version = workflows[0][0], workflows[0][1]
            self.logger.debug(f"workflow_version: {workflow_version}")
            current_workflow_entity: VersionedWorkflow = get_current_workflow(Workflow(**workflow), workflow_version)
            self.logger.debug(f"current_workflow_entity: {current_workflow_entity}")
            create_resp = self.es_workflow_history.es_dao.create(current_workflow_entity)

            if not create_resp.is_success():
                raise Exception(f"Creating workflow history failed with response {create_resp}")

            workflow_request.workflow_name = workflow['workflow_name']
            if not workflow['display_name']:
                workflow_request.display_name = workflow['workflow_name']

            workflow_object = Workflow(**workflow)
            # if start date or end date is not provided in the request, use the existing values fetched from db
            start_date = workflow_object.start_date if workflow_request.start_date is None else workflow_request.start_date
            end_date = workflow_object.end_date if workflow_request.end_date is None else workflow_request.end_date

            updated_workflow_entity: Workflow = get_update_workflow(created_by = user_email, created_at= workflow_object.created_at,
                                                                    start_date = start_date,
                                                                    end_date = end_date,
                                                                    workflow_request= workflow_request, workflow_id= workflow_id)
            updated_workflow_entity.workflow_status = status
            updated_workflow_entity = update_workflow_ha_config(updated_workflow_entity,workflow)
            try:
                print('running query')
                await self.create_or_update_workflow(updated_workflow_entity)
            except Exception as e:
                self.logger.error(f"Error while creating workflow, {e}")
                raise Exception(f"Error while creating workflow, {e}")
            update_resp = self.__update_workflow(updated_workflow_entity)
            if not update_resp.is_success():
                raise Exception(
                    f'failed to update workflow with workflow_id {workflow_id}, response: {update_resp.data}')
            return SUCCESS, update_resp.data

    def delete_workflow(self, workflow_name: str):
        """

        :param workflow_name: name of the workflow to be deleted
        :return:
        """
        try:
            query = WorkflowDeleteUsingName().get_query(workflow_name)
            return self.es.es_dao.elasticsearch_client.delete_by_query(INDEX, body=query)
        except Exception as err:
            return err.__str__()

    def get_filters(self):
        total, users = self.__get_distinct_user_from_db()
        return FiltersGetResponseData(
            users=users,
            status=STATUSES
        )

    def __get_distinct_user_from_db(self):
        resp = self.es.es_dao.aggregation_search(ElasticSearchQuery(WorkflowCreatedUsers().get_query()))
        if not resp.is_success():
            raise Exception("Error occured while querying the database")
        if resp.data['aggregations']['databases']['sum_other_doc_count'] != 0:
            return []
        buckets = resp.data['aggregations']['databases']['buckets']
        return len(buckets), [resp_dict['key'] for resp_dict in buckets]

    async def soft_delete_workflow_by_id(self, workflow_id: str):
        """

        :return:
        """

        existing_workflow_resp = self.__find_workflow_by_id(workflow_id)
        if not existing_workflow_resp.is_success():
            self.logger.error(f"Error in searching workflow with id: {workflow_id} "f"{existing_workflow_resp.message}")
            return False

        if existing_workflow_resp is None or existing_workflow_resp.data is None or len(
                existing_workflow_resp.data) == 0:
            self.logger.debug(f"Workflow is not registered can not update it: {workflow_id}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        workflow = existing_workflow_resp.data[0]
        pause_resp = self.pause_workflow(workflow)
        if pause_resp.workflow_status != INACTIVE:
            return WorkflowWorkflowIdDeleteResponseData(is_deleted=False, workflow_id=workflow_id)

        if workflow.workflow_status == DELETED:
            return WorkflowWorkflowIdDeleteResponseData(is_deleted=False, workflow_id=workflow_id)
        workflow.workflow_status = DELETED
        try:
            print('running query')
            await self.create_or_update_workflow(workflow)
        except Exception as e:
            self.logger.error(f"Error while creating workflow, {e}")
            raise Exception(f"Error while creating workflow, {e}")
        update_resp = self.__update_workflow(workflow)

        if not update_resp.is_success():
            self.logger.error(f"Failed to delete workflow \n {update_resp.message}")
            return WorkflowWorkflowIdDeleteResponseData(is_deleted=False, workflow_id=workflow_id)

        # Delete workflow from s3
        delete_workflow_from_s3(dag_id=workflow.workflow_name)

        # delete the workflow from the airflow
        self.airflow.delete_dag(workflow.workflow_name)

        # TODO: publish_event is a blocking call - commenting out to prevent API hanging
        # Event publishing should be done asynchronously or with proper error handling
        # event = create_workflow_event(
        #     workflow_id,
        #     WorkflowState.WORKFLOW_DELETED,
        #     {"workflow_name": workflow.workflow_name}
        # )
        # publish_event(workflow_id=workflow_id, event=event)
        return WorkflowWorkflowIdDeleteResponseData(is_deleted=True, workflow_id=workflow_id)

    def resume_workflow(self, wf: Workflow):
        resp = self.airflow.resume_a_dag(wf.workflow_name)
        if resp['is_paused']:
            return ResumeScheduleWorkflowIdPutResponseData(workflow_id=wf.workflow_id, workflow_status=INACTIVE)
        else:
            return ResumeScheduleWorkflowIdPutResponseData(workflow_id=wf.workflow_id, workflow_status=ACTIVE)

    def pause_workflow(self, wf: Workflow):
        resp = self.airflow.pause_a_dag(wf.workflow_name)
        if resp['is_paused']:
            return PauseScheduleWorkflowIdPutResponseData(workflow_id=wf.workflow_id, workflow_status=INACTIVE)
        else:
            return PauseScheduleWorkflowIdPutResponseData(workflow_id=wf.workflow_id, workflow_status=ACTIVE)

    async def stop_run_workflow(self, workflow_id: str, run_id: str):
        logger.info(f"stop_run_workflow called for {run_id} and workflow {workflow_id}")
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        wf: Workflow = es_response[0]

        run_details = await self.get_run_details_from_workflow(workflow_id, run_id)
        if not run_details:
            logger.error(f"ERROR: Run with id {run_id} not found in workflow {workflow_id}")
            raise RunNotFoundException(f"Run with id {run_id} not found")
        current_status = run_details.get("status")
        if current_status != RUNNING:
            # Raise exception when run is not in running state
            logger.info(
                f"INFO:Cannot stop Run_id {run_id} as current status: {current_status} is not in running state for workflow_id - {workflow_id}")
            raise RunNotInRunningStateException(f"Cannot stop Run_id {run_id} as current status: {current_status} is not in running state")

        # Proceed to stop only if running
        logger.info(f"Stopping run {run_id} for workflow {workflow_id}")
        resp = update_run_in_db(run_id=run_id, workflow_id=workflow_id, state='stopping')
        logger.info(f"Updated stopping in db with resp: {resp}")

        self.airflow.stop_a_run(wf.workflow_name, run_id)
        logger.info(f"INFO: Successfully stopped Run_id - {run_id} for workflow_id - {workflow_id}")
        return StopRunWorkflowIdPutResponseData(workflow_id=workflow_id, run_id=run_id, run_status='stopping')

    async def fetch_and_store_task_instance(self, workflow_name: str, run_id: str, task_ids: List[str] = None):
        latest_task_runs = await self.airflow_dao.execute_mysql_get_all_task_instances_for_a_run(
                workflow_name, run_id
            )

        manual_runs = []
        for task_run in latest_task_runs:
            manual_runs.append(
                LatestTaskRun(
                    dag_id=workflow_name,
                    task_id=task_run[0],
                    run_id=run_id,
                    start_date=task_run[1].strftime('%Y-%m-%dT%H:%M:%SZ') if task_run[1] else "",
                    end_date=task_run[2].strftime('%Y-%m-%dT%H:%M:%SZ') if task_run[2] else "",
                    duration=task_run[3] if task_run[3] is not None else 0.0,
                    state=task_run[4],
                    try_number=task_run[5],
                )
            )

        if task_ids:
            manual_runs = [run for run in manual_runs if run.task_id in task_ids]

        stored_runs = []

        for run in manual_runs:
            stored_runs.append(self.es_latest_task_run.es_dao.create(run))

        return stored_runs

    async def run_now_workflow(self, workflow_id: str, user_email: str, parameters: dict = None):
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        # Run synchronous Elasticsearch call in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            es_response = await loop.run_in_executor(
                executor, 
                lambda: self.__find_workflow_by_id(workflow_id=workflow_id).data
            )
        
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        wf: Workflow = es_response[0]

        if self.check_if_end_date_has_passed(wf.end_date):
            raise Exception("End date has passed, you can not run the workflow after the end date. To run the "
                            "workflow, please update the end date.")

        if self.check_if_start_date_has_yet_to_come(wf.start_date):
            raise Exception("Start date has yet to come, you can not run the workflow before the start date. To run the"
                            " workflow, please update the start date.")

        workflow_parameters = wf.parameters or {}
        if parameters:
            workflow_parameters.update(parameters)
        wf_runs = (await self.airflow.get_latest_dag_runs_async(wf.workflow_name))['dag_runs']
        last_runs_status = []
        if wf_runs:
            last_runs_status = [wf_run['state'] for wf_run in wf_runs]
        running_count = last_runs_status.count("running")
        if running_count >= wf.max_concurrent_runs:
            if not wf.queue_enabled:
                await self.create_run(workflow_id=wf.workflow_id,dag_id=wf.workflow_name,
                                run_id=datetime.utcnow().strftime('manual__%Y-%m-%dT%H:%M:%S+00:00'),
                                state='skipped',
                                start_time = datetime.utcnow(),
                                parameters=workflow_parameters)
                raise Exception("Max concurrent runs reached, skipping run")
        
        # Run synchronous Airflow API call in thread pool to avoid blocking
        with ThreadPoolExecutor() as executor:
            resp = await loop.run_in_executor(
                executor,
                lambda: self.airflow.run_now(wf.workflow_name, parameters)
            )
        if resp['external_trigger']:
            trigger_by = EXTERNAL
        else:
            trigger_by = SCHEDULED
        if resp['state'] == "running" or resp['state'] == "queued":
            duration = 0
        else:
            duration = abs((datetime.fromisoformat(resp['start_date']) - datetime.fromisoformat(
                resp['end_date'])).total_seconds())
        start_date = resp['start_date'] if resp['start_date'] is not None else ""
        last_run = WorkflowRun(
            run_id=resp['dag_run_id'],
            start_time=start_date,
            duration=duration,
            run_status=resp['state'],
            trigger=resp['run_type'],
            trigger_by=trigger_by,
            is_run_duration_exceeded=False
        )
        await self.create_run(
            workflow_id=wf.workflow_id,
            dag_id=wf.workflow_name,
            run_id=resp['dag_run_id'],
            state='queued',
            start_time = datetime.utcnow(),
            parameters = workflow_parameters
        )
        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_TRIGGERED,
            {"workflow_name": wf.workflow_name, "run_id": resp['dag_run_id'], "user_email": user_email}
        )
        # TODO: publish_event is a blocking call that hangs the async event loop
        # Disabled temporarily until we can make it async or wrap in ThreadPoolExecutor
        # publish_event(workflow_id=workflow_id, event=event)

        return RunNowWorkflowIdPutResponseData(workflow_id=workflow_id, last_run=last_run,
                                               last_runs_status=last_runs_status[:5])

    async def update_workflow_tags(self, workflow_id: str, body: UpdateWorkflowTagsRequest):
        existing_workflow_resp = self.__find_workflow_by_id(workflow_id)
        if not existing_workflow_resp.is_success():
            self.logger.error(f"Error in searching workflow with id: {workflow_id} "f"{existing_workflow_resp.message}")
            return False

        if existing_workflow_resp is None or existing_workflow_resp.data is None or len(
                existing_workflow_resp.data) == 0:
            self.logger.debug(f"Workflow is not registered can not update it: {workflow_id}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        workflow = existing_workflow_resp.data[0]
        if workflow.workflow_status == DELETED:
            raise Exception
        workflow.tags = body.tags
        try:
            print('running query')
            await self.create_or_update_workflow(workflow)
        except Exception as e:
            self.logger.error(f"Error while creating workflow, {e}")
            raise Exception(f"Error while creating workflow, {e}")
        update_resp = self.__update_workflow(workflow)

        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_UPDATION_SUCCESS,
            {"workflow_name": workflow.workflow_name, "tags": body.tags}
        )
        # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=workflow_id, event=event)

        if not update_resp.is_success():
            self.logger.error(f"Failed to update workflow \n {update_resp.message}")
            raise Exception
        return WorkflowTagsData(workflow_id=workflow_id, tags=workflow.tags)

    def update_workflow_status(self, workflow_id: str, status: str):
        existing_workflow_resp = self.__find_workflow_by_id(workflow_id)
        if not existing_workflow_resp.is_success():
            self.logger.error(f"Error in searching workflow with id: {workflow_id} "f"{existing_workflow_resp.message}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        if existing_workflow_resp is None or existing_workflow_resp.data is None or len(
                existing_workflow_resp.data) == 0:
            self.logger.debug(f"Workflow is not registered can not update it: {workflow_id}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        workflow = existing_workflow_resp.data[0]
        if workflow.workflow_status == DELETED:
            raise Exception

        if workflow.workflow_status != EXPIRED and status == EXPIRED:

            if workflow.end_date is not None and self.check_if_end_date_has_passed(workflow.end_date):
                self.logger.error(f"Workflow end date is not expired yet, can not update it to expired")
                raise Exception

            event = create_workflow_event(
                workflow_id,
                WorkflowState.WORKFLOW_EXPIRED,
                workflow.to_dict()
            )
            # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
            # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
            # publish_event(event, callback_urls=workflow.callback_urls,
            #               event_types=workflow.event_types)

        workflow.workflow_status = status
        update_resp = self.__update_workflow(workflow)
        logger.info(f"updating status to {status} -> {update_resp}")
        if not update_resp.is_success():
            self.logger.error(f"Failed to update workflow \n {update_resp.message}")
            raise Exception
        return True

    async def update_workflow_schedule(self, workflow_id: str, body: UpdateWorkflowScheduleRequest):
        existing_workflow_resp = self.__find_workflow_by_id(workflow_id)
        if not existing_workflow_resp.is_success():
            self.logger.error(f"Error in searching workflow with id: {workflow_id} "f"{existing_workflow_resp.message}")
            return False

        if existing_workflow_resp is None or existing_workflow_resp.data is None or len(
                existing_workflow_resp.data) == 0:
            self.logger.debug(f"Workflow is not registered can not update it: {workflow_id}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        workflow = existing_workflow_resp.data[0]
        if workflow.workflow_status == DELETED:
            raise Exception
        workflow.schedule = body.schedule
        try:
            print('running query')
            await self.create_or_update_workflow(workflow)
        except Exception as e:
            self.logger.error(f"Error while creating workflow, {e}")
            raise Exception(f"Error while creating workflow, {e}")
        update_resp = self.__update_workflow(workflow)
        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_UPDATION_SUCCESS,
            {"workflow_name": workflow.workflow_name, "schedule": body.schedule}
        )
        # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=workflow_id, event=event)
        if not update_resp.is_success():
            self.logger.error(f"Failed to update workflow \n {update_resp.message}")
            raise Exception
        return WorkflowScheduleData(workflow_id=workflow_id, schedule=workflow.schedule)

    async def update_workflow_max_concurrent_runs(self, workflow_id: str, body: UpdateWorkflowMaxConcurrentRunsRequest):
        existing_workflow_resp = self.__find_workflow_by_id(workflow_id)
        if not existing_workflow_resp.is_success():
            self.logger.error(f"Error in searching workflow with id: {workflow_id} "f"{existing_workflow_resp.message}")
            return False

        if existing_workflow_resp is None or existing_workflow_resp.data is None or len(
                existing_workflow_resp.data) == 0:
            self.logger.debug(f"Workflow is not registered can not update it: {workflow_id}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        workflow = existing_workflow_resp.data[0]
        if workflow.workflow_status == DELETED:
            raise Exception
        workflow.max_concurrent_runs = body.max_concurrent_runs
        try:
            print('running query')
            await self.create_or_update_workflow(workflow)
        except Exception as e:
            self.logger.error(f"Error while creating workflow, {e}")
            raise Exception(f"Error while creating workflow, {e}")
        update_resp = self.__update_workflow(workflow)
        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_UPDATION_SUCCESS,
            {"workflow_name": workflow.workflow_name, "max_concurrent_runs": body.max_concurrent_runs}
        )
        # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=workflow_id, event=event)
        if not update_resp.is_success():
            self.logger.error(f"Failed to update workflow \n {update_resp.message}")
            raise Exception
        return WorkflowMaxConcurrentRunsData(workflow_id=workflow_id, max_concurrent_runs=workflow.max_concurrent_runs)

    async def update_workflow_retries(self, workflow_id: str, body: UpdateWorkflowRetriesRequest):
        existing_workflow_resp = self.__find_workflow_by_id(workflow_id)
        if not existing_workflow_resp.is_success():
            self.logger.error(f"Error in searching workflow with id: {workflow_id} "f"{existing_workflow_resp.message}")
            return False

        if existing_workflow_resp is None or existing_workflow_resp.data is None or len(
                existing_workflow_resp.data) == 0:
            self.logger.debug(f"Workflow is not registered can not update it: {workflow_id}")
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")

        workflow = existing_workflow_resp.data[0]
        if workflow.workflow_status == DELETED:
            raise Exception
        workflow.retries = body.retries
        try:
            print('running query')
            await self.create_or_update_workflow(workflow)
        except Exception as e:
            self.logger.error(f"Error while updating workflow, {e}")
            raise Exception(f"Error while updating workflow, {e}")
        update_resp = self.__update_workflow(workflow)

        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_UPDATION_SUCCESS,
            {"workflow_name": workflow.workflow_name, "retries": body.retries}
        )
        # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=workflow_id, event=event)

        if not update_resp.is_success():
            self.logger.error(f"Failed to update workflow \n {update_resp.message}")
            raise Exception
        return UpdateWorkflowRetriesData(workflow_id=workflow_id, retries=workflow.retries)

    def parse_date(self, date_str):
        # Parse date and convert to Airflow-compatible ISO format
        try:
            # Try parsing full ISO format first
            parsed_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%SZ')
            return parsed_date.strftime('%Y-%m-%dT%H:%M:%SZ')
        except ValueError:
            try:
                # Try parsing date-only format (YYYY-MM-DD)
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
                # For end dates, set to end of day (23:59:59)
                # For start dates, keep at 00:00:00
                return parsed_date.strftime('%Y-%m-%dT%H:%M:%SZ')
            except ValueError:
                # Return today's date in the same format if parsing fails
                return datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')

    def check_run_to_be_repaired(self, workflow_id: str, run_id: str, user_id: str):
        """
        Check if the run needs to be repaired
        :param workflow_id: workflow_id
        :param run_id: run_id
        :param user_id: user_id
        :return: bool
        """
        timestamp = get_timestamp_from_run_id(run_id)
        timestamp_past_week = datetime.now() - timedelta(days=7)
        if timestamp < timestamp_past_week.strftime('%Y-%m-%dT%H:%M:%SZ'):
            return False
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        wf: Workflow = es_response[0]
        if wf.workflow_status == UPDATING_ARTIFACT:
            return False
        workflow_tasks = [task.task_name for task in wf.tasks]
        if len(workflow_tasks) == 1:
            return False
        workflow_current_run_resp = self.get_workflow_by_workflow_runid(workflow_id=workflow_id, user_id=user_id,
                                                                        run_id=run_id)
        workflow_run_tasks = [task.task_name for task in workflow_current_run_resp.tasks]
        return set(workflow_run_tasks).issubset(set(workflow_tasks))

    async def retrieve_workflow_runs(self, workflow_id: str, body: RetrieveWorkflowRunsRequest):
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"[DEBUG retrieve_workflow_runs] workflow_id={workflow_id}, filters={body.filters}, start_date={body.start_date}, end_date={body.end_date}, page_size={body.page_size}, offset={body.offset}")
        
        states = []
        for status in body.filters:
            if status in [SUCCESS, FAIL, QUEUED, RUNNING]:
                states.append(status)
        
        logger.info(f"[DEBUG] Filtered states: {states}")
        
        responses = []
        dag_runs = []
        total_entries = 0
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        find_resp: Workflow = es_response[0]
        
        logger.info(f"[DEBUG] Found workflow: {find_resp.workflow_name}")

        # Parse dates to ISO format for Airflow API
        if body.start_date is not None:
            body.start_date = self.parse_date(body.start_date)
            logger.info(f"[DEBUG] Parsed start_date: {body.start_date}")
        
        if body.end_date is not None:
            body.end_date = self.parse_date(body.end_date)
            logger.info(f"[DEBUG] Parsed end_date: {body.end_date}")

        if states:
            for state in states:
                logger.info(f"[DEBUG] Calling Airflow API for state={state}")
                resp = self.airflow.get_latest_dag_runs_by_days(dag_id=find_resp.workflow_name, limit=body.page_size,
                                                                offset=body.offset, state=state,
                                                                start_date=body.start_date,
                                                                end_date=body.end_date)
                logger.info(f"[DEBUG] Airflow response for state={state}: dag_runs count={len(resp['dag_runs'])}, total_entries={resp['total_entries']}")
                responses.append(resp)
                dag_runs = dag_runs + resp['dag_runs']
                total_entries += resp["total_entries"]
        else:
            logger.info(f"[DEBUG] Calling Airflow API with no state filter")
            resp = self.airflow.get_latest_dag_runs_by_days(dag_id=find_resp.workflow_name, limit=body.page_size,
                                                            offset=body.offset, start_date=body.start_date,
                                                            end_date=body.end_date)
            logger.info(f"[DEBUG] Airflow response: dag_runs count={len(resp['dag_runs'])}, total_entries={resp['total_entries']}")
            responses.append(resp)
            dag_runs = dag_runs + resp['dag_runs']
            total_entries += resp["total_entries"]
        
        logger.info(f"[DEBUG] Total dag_runs collected: {len(dag_runs)}, total_entries: {total_entries}")
        workflow_runs = []
        for run in dag_runs:
            start_date = run['start_date'] if run['start_date'] is not None else ""
            duration = 0
            if run['external_trigger']:
                trigger_by = EXTERNAL
            else:
                trigger_by = SCHEDULED
            if (run['start_date'] is not None) and (run['state'] == RUNNING or run['state'] == QUEUED):
                current_timezone = pytz.timezone('Asia/Kolkata')
                duration = abs(
                    datetime.now().astimezone(current_timezone).replace(tzinfo=None) - datetime.fromisoformat(
                        run['start_date']).astimezone(current_timezone).replace(tzinfo=None)).total_seconds()
            elif run['start_date'] is not None:
                duration = abs((datetime.fromisoformat(run['start_date']) - datetime.fromisoformat(
                    run['end_date'])).total_seconds())
            workflow_run = WorkflowRun(run_id=run['dag_run_id'], start_time=start_date, duration=duration,
                                       run_status=run['state'], trigger=run['run_type'], trigger_by=trigger_by)
            workflow_runs.append(workflow_run)

        data = WorkflowRuns(workflow_id=workflow_id, runs=workflow_runs)
        return total_entries, body.page_size, body.offset, data

    async def get_latest_dag_runs_from_db(self, workflow_id: str, limit:int, offset: int, state: str = None,
                                          days_past: int = None, start_date: str = None, end_date: str = None):
        query = DarwinWorkflowRun.filter(workflow_id=workflow_id).order_by("-start_time")

        if state:
            query = query.filter(state=state)

        if days_past:
            past_date = datetime.now(timezone.utc) - timedelta(days=days_past)
            query = query.filter(start_time__gte=past_date)

        if start_date:
            query = query.filter(start_time__gte=datetime.fromisoformat(start_date.replace("Z", "+00:00")))

        if end_date:
            query = query.filter(start_time__lte=datetime.fromisoformat(end_date.replace("Z", "+00:00")))

        total_entries = await query.count()  # Get total count of runs
        dag_runs = await query.offset(offset).limit(limit)

        return {"total_entries": total_entries, "dag_runs": dag_runs}

    async def get_latest_dag_runs(self, workflow_id: str, limit: int, offset: int, state: str = None,
                                           days_past: int = None, start_date: str = None, end_date: str = None):

        dag_runs = await self.get_latest_dag_runs_from_db(
            workflow_id=workflow_id, limit=limit, offset=offset, state=state,
            days_past=days_past, start_date=start_date, end_date=end_date
        )
        dag_runs_list = []
        for run in dag_runs['dag_runs']:
            try:
                dag_runs_list.append({
                    "dag_id": run.dag_id,
                    "run_id": run.run_id,
                    "dag_run_id": run.run_id,
                    "state": run.state,
                    "execution_date": run.start_time.replace(
                        tzinfo=timezone.utc).isoformat() if run.start_time else None,
                    "start_date": run.start_time.replace(tzinfo=timezone.utc).isoformat() if run.start_time else None,
                    "end_date": run.end_time.replace(tzinfo=timezone.utc).isoformat() if run.end_time else None,
                    "repair_date": run.repair_time.replace(tzinfo=timezone.utc).isoformat() if run.repair_time else None,
                    "duration": run.duration,
                    "expected_run_duration": getattr(run, "expected_run_duration", None),  # Default to None if missing
                    "sla_exceeded": getattr(run, "sla_exceeded", False)  # Default to False if missing
                })
            except Exception as e:
                logger.warning(f"Skipping V2 entry due to missing fields: {e}, run: {run}")

        return {
            "total_entries":  dag_runs['total_entries'],
            "dag_runs": dag_runs_list
        }

    async def retrieve_workflow_runs_v2(self, workflow_id: str, body: RetrieveWorkflowRunsRequest, user_id: str):
        states = []
        for status in body.filters:
            if status in [SUCCESS, FAIL, QUEUED, RUNNING]:
                states.append(status)
        responses = []
        dag_runs = []
        total_entries = 0
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        find_resp: Workflow = es_response[0]

        if body.end_date is not None:
            body.end_date = self.parse_date(body.end_date)

        if states:
            for state in states:
                resp = self.airflow.get_latest_dag_runs_by_days(dag_id=find_resp.workflow_name, limit=body.page_size,
                                                                offset=body.offset, state=state,
                                                                start_date=body.start_date,
                                                                end_date=body.end_date)
                responses.append(resp)
                dag_runs = dag_runs + resp['dag_runs']
                total_entries += resp["total_entries"]
        else:
            resp = self.airflow.get_latest_dag_runs_by_days(dag_id=find_resp.workflow_name, limit=body.page_size,
                                                            offset=body.offset, start_date=body.start_date,
                                                            end_date=body.end_date)
            responses.append(resp)
            dag_runs = dag_runs + resp['dag_runs']
            total_entries += resp["total_entries"]
        workflow_runs = []
        for run in dag_runs:
            start_date = run['logical_date'] if run['logical_date'] is not None else ""
            duration = 0
            duration_prev = 0
            key = f"run_duration_{find_resp.workflow_name}_{run['dag_run_id']}"
            variable_results = await self.airflow_dao.execute_mysql_get_variable(key)
            if variable_results:
                duration_prev = float(variable_results[0][0])
            if run['external_trigger']:
                trigger_by = EXTERNAL
            else:
                trigger_by = SCHEDULED
            if (run['start_date'] is not None) and (run['state'] == RUNNING or run['state'] == QUEUED):
                current_timezone = pytz.timezone('Asia/Kolkata')
                duration = duration_prev + abs(
                    datetime.now().astimezone(current_timezone).replace(tzinfo=None) - datetime.fromisoformat(
                        run['start_date']).astimezone(current_timezone).replace(tzinfo=None)).total_seconds()
            elif run['start_date'] is not None:
                duration = duration_prev + abs((datetime.fromisoformat(run['start_date']) - datetime.fromisoformat(
                    run['end_date'])).total_seconds())
            workflow_run = WorkflowRun(run_id=run['dag_run_id'], start_time=start_date, duration=duration,
                                       run_status=run['state'], trigger=run['run_type'], trigger_by=trigger_by)
            workflow_runs.append(workflow_run)
        repair_run = None
        if workflow_runs and workflow_runs[0].run_status == FAIL:
            if self.check_run_to_be_repaired(workflow_id, workflow_runs[0].run_id, user_id):
                repair_run = RepairRun(run_id=workflow_runs[0].run_id, status=FAIL)

        timestamp_past_week = datetime.now() - timedelta(days=7)
        resp = self.airflow.get_latest_dag_runs_by_days(dag_id=find_resp.workflow_name, limit=1000,
                                                        state=RUNNING, start_date=timestamp_past_week.strftime('%Y-%m-%dT%H:%M:%SZ'),
                                                        offset=0)
        if resp['total_entries'] > 0:
            for run in resp['dag_runs']:
                if run['state'] == RUNNING and self.airflow.get_variable(f"repair_run_{find_resp.workflow_name}_{run['dag_run_id']}"):
                    repair_run = RepairRun(run_id=run['dag_run_id'], status=REPAIRING)

        data = WorkflowRunsV2(
            workflow_id=workflow_id,
            runs=workflow_runs,
            repair_run=repair_run
        )

        return total_entries, body.page_size, body.offset, data

    async def retrieve_workflow_runs_v3(self, workflow_id: str, body: RetrieveWorkflowRunsRequest, user_id: str):
        states = []
        for status in body.filters:
            if status in [SUCCESS, FAIL, QUEUED, RUNNING, SKIPPED]:
                states.append(status)
        responses = []
        dag_runs = []
        total_entries = 0
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        find_resp: Workflow = es_response[0]

        if body.end_date is not None:
            body.end_date = self.parse_date(body.end_date)

        if states:
            for state in states:
                resp = await self.get_latest_dag_runs(
                    workflow_id=workflow_id,
                    limit=body.page_size,
                    offset=body.offset,
                    state=state,
                    start_date=body.start_date,
                    end_date=body.end_date
                )
                responses.append(resp)
                dag_runs = dag_runs + resp['dag_runs']
                total_entries += resp["total_entries"]
        else:
            resp = await self.get_latest_dag_runs(
                workflow_id=workflow_id,
                limit=body.page_size,
                offset=body.offset,
                start_date=body.start_date,
                end_date=body.end_date
            )
            responses.append(resp)
            dag_runs = dag_runs + resp['dag_runs']
            total_entries += resp["total_entries"]

        workflow_runs = []
        for run in dag_runs:
            start_date = run.get('start_time', run.get('start_date', None))
            run_id = run.get('run_id', None)

            if run_id and "manual" in run_id.lower():
                trigger_by = EXTERNAL
            else:
                trigger_by = SCHEDULED

            if run_id and "manual" in run_id.lower():
                trigger = MANUAL
            else:
                trigger = SCHEDULED

            duration = run.get('duration') or 0
            duration_prev = 0
            key = f"run_duration_{find_resp.workflow_name}_{run['run_id']}"
            variable_results = await self.airflow_dao.execute_mysql_get_variable(key)

            if variable_results:
                duration_prev = float(variable_results[0][0])

            # Ensure start_date is a string before parsing
            start_date_str = run.get('start_date')
            end_date_str = run.get('end_date')
            repair_date_str = run.get('repair_date')

            if isinstance(start_date_str, datetime):
                start_date_str = start_date_str.isoformat()
            if isinstance(end_date_str, datetime):
                end_date_str = end_date_str.isoformat()
            if isinstance(repair_date_str, datetime):
                repair_date_str = repair_date_str.isoformat()

            if repair_date_str:
                start_date_str = repair_date_str

            if start_date_str and isinstance(start_date_str, str):
                if run['state'] in [RUNNING, STOPPING]:
                    current_timezone = pytz.timezone('Asia/Kolkata')
                    duration = duration_prev + abs(
                        datetime.now().astimezone(current_timezone).replace(tzinfo=None) -
                        datetime.fromisoformat(start_date_str).astimezone(current_timezone).replace(tzinfo=None)
                    ).total_seconds()
                elif end_date_str and isinstance(end_date_str, str):
                    duration = duration_prev + abs(
                        (datetime.fromisoformat(start_date_str) - datetime.fromisoformat(end_date_str)).total_seconds()
                    )

            if run['state']== "skipped":
                trigger_by = "-"
                duration = 0

            workflow_run = WorkflowRun(
                run_id=run['run_id'],
                start_time=start_date,
                duration=duration,
                run_status=run['state'],
                trigger=trigger,
                trigger_by=trigger_by,
                expected_run_duration = run['expected_run_duration'],
                is_run_duration_exceeded=run['sla_exceeded']
            )
            workflow_runs.append(workflow_run)

        # Handling failed runs
        repair_run = None
        if workflow_runs and workflow_runs[0].run_status == FAIL:
            if self.check_run_to_be_repaired(workflow_id, workflow_runs[0].run_id, user_id):
                repair_run = RepairRun(run_id=workflow_runs[0].run_id, status=FAIL)

        # Fetch latest DAG runs in the past week
        timestamp_past_week = datetime.now() - timedelta(days=7)
        resp = self.airflow.get_latest_dag_runs_by_days(
            dag_id=find_resp.workflow_name,
            limit=1000,
            state=RUNNING,
            start_date=timestamp_past_week.strftime('%Y-%m-%dT%H:%M:%SZ'),
            offset=0
        )

        if resp['total_entries'] > 0:
            for run in resp['dag_runs']:
                if run['state'] == RUNNING and self.airflow.get_variable(
                        f"repair_run_{find_resp.workflow_name}_{run['dag_run_id']}"):
                    repair_run = RepairRun(run_id=run['dag_run_id'], status=REPAIRING)

        data = WorkflowRunsV2(
            workflow_id=workflow_id,
            runs=workflow_runs,
            repair_run=repair_run
        )

        return total_entries, body.page_size, body.offset, data

    async def _get_workflow_tasks(self, workflow_id: str, run_id: str, user_id: str):
        workflow_resp = self.get_workflow_by_workflow_runid(workflow_id=workflow_id, user_id=user_id, run_id=run_id)
        task_resp = self.airflow.get_tasks(dag_id=workflow_resp.workflow_name, run_id=run_id)
        result = []
        events = []
        for task in task_resp['task_instances']:
            wf_task: WorkflowTask = self.__find_task(workflow_resp.tasks, task['task_id'])
            if wf_task:
                if wf_task.cluster_type == JOB:
                    attached_cluster = self.get_job_cluster_details_with_run_id(
                        wf_task.attached_cluster.cluster_id,
                        wf_task.task_name, run_id,
                        workflow_resp.workflow_name)
                else:
                    attached_cluster = self.compute.get_cluster_details(wf_task.attached_cluster.cluster_id)
                dependent_libraries = wf_task.dependent_libraries
                packages = wf_task.packages
                input_parameters = wf_task.input_parameters
                retries = wf_task.retries
                timeout = wf_task.timeout
                depends_on = wf_task.depends_on
                source = wf_task.source
                source_type = wf_task.source_type
                dynamic_artifact = wf_task.dynamic_artifact
                path = wf_task.file_path
                cluster_type = wf_task.cluster_type
                trigger_rule = wf_task.trigger_rule
                notification_preference = wf_task.notification_preference
                notify_on = wf_task.notify_on
                run_status = task['state'] if task['state'] is not None else ""
                result.append(
                    WorkflowTask(
                        task_name=task['task_id'],
                        source=source,
                        source_type=source_type,
                        file_path=path,
                        dynamic_artifact=dynamic_artifact,
                        attached_cluster=attached_cluster,
                        cluster_type=cluster_type,
                        dependent_libraries=dependent_libraries,
                        packages=packages,
                        input_parameters=input_parameters,
                        retries=retries,
                        timeout=timeout,
                        depends_on=depends_on,
                        task_validation_status=VALID,
                        run_status=run_status,
                        trigger_rule=trigger_rule,
                        notification_preference=notification_preference,
                        notify_on=notify_on
                    )
                )
                events.append(
                    TaskEvent(
                        timestamp="",
                        status="not available",
                        message="not available"
                    )
                )
        return result, events

    async def get_run_details(self, workflow_id: str, run_id: str, user_id: str):
        workflow_resp = self.get_workflow_by_workflow_runid(workflow_id=workflow_id, run_id=run_id, user_id=user_id)
        run_resp = await self.airflow.get_a_dag_run(dag_id=workflow_resp.workflow_name, run_id=run_id)
        if run_resp['external_trigger']:
            trigger_by = EXTERNAL
            trigger = MANUAL
        else:
            trigger_by = AUTOMATIC
            trigger = SCHEDULED
        # todo: fetch task event from another API call
        duration = 0
        end_time = run_resp['end_date'] if run_resp['end_date'] is not None else ""
        start_date = run_resp['start_date'] if run_resp['start_date'] is not None else ""
        workflow_tasks, task_events = await self._get_workflow_tasks(workflow_id=workflow_id, run_id=run_id,
                                                                     user_id=user_id)
        if (run_resp['start_date'] is not None) and (run_resp['state'] == RUNNING or run_resp['state'] == QUEUED):
            current_timezone = pytz.timezone('Asia/Kolkata')
            duration = abs(
                datetime.now().astimezone(current_timezone).replace(tzinfo=None) - datetime.fromisoformat(
                    run_resp['start_date']).astimezone(current_timezone).replace(tzinfo=None)).total_seconds()
            end_time = ""
        elif run_resp['start_date'] is not None:
            duration = abs((datetime.fromisoformat(run_resp['start_date']) - datetime.fromisoformat(
                run_resp['end_date'])).total_seconds())
            end_time = run_resp['end_date']
        return RunDetails(
            workflow_id=workflow_id,
            run_id=run_id,
            start_time=start_date,
            end_time=end_time,
            duration=duration,
            run_status=run_resp['state'],
            trigger=trigger,
            trigger_by=trigger_by,
            events=task_events,
            tasks=workflow_tasks
        )

    async def get_run_details_v2(self, workflow_id: str, run_id: str, user_id: str):
        workflow_resp = self.get_workflow_by_workflow_runid(workflow_id=workflow_id, run_id=run_id, user_id=user_id)
        if not workflow_resp:
            self.logger.error(f"Workflow not found for workflow_id={workflow_id}, run_id={run_id}")
            raise ValueError(f"Workflow not found for workflow_id={workflow_id}, run_id={run_id}")
        run_resp = await self.airflow.get_a_dag_run(dag_id=workflow_resp.workflow_name, run_id=run_id)
        if not run_resp:
            self.logger.error(f"dag not found for workflow_id={workflow_id}, run_id={run_id}")
            raise ValueError(f"dag not found for workflow_id={workflow_id}, run_id={run_id}")
        workflow_run_resp = await self.get_run_details_from_workflow(workflow_id=workflow_id, run_id=run_id)
        if not workflow_run_resp:
            self.logger.error(f"Run not found for workflow_id={workflow_id}, run_id={run_id}")
            raise ValueError(f"Run not found for workflow_id={workflow_id}, run_id={run_id}")
        if run_resp['external_trigger']:
            trigger_by = EXTERNAL
            trigger = MANUAL
        else:
            trigger_by = AUTOMATIC
            trigger = SCHEDULED
        # todo: fetch task event from another API call
        duration = 0
        duration_prev = 0
        key = f"run_duration_{workflow_resp.workflow_name}_{run_id}"
        variable_results = await self.airflow_dao.execute_mysql_get_variable(key)
        if variable_results:
            duration_prev = float(variable_results[0][0])
        end_time = workflow_run_resp['end_time'] if workflow_run_resp['end_time'] is not None else ""
        start_date = workflow_run_resp['start_time'] if workflow_run_resp['start_time'] is not None else ""
        repair_date = workflow_run_resp['repair_time'] if workflow_run_resp['repair_time'] is not None else ""
        parameters = workflow_run_resp.get('parameters') or workflow_resp.parameters
        if repair_date:
            start_date = repair_date

        logical_date = run_resp['logical_date'] if run_resp['logical_date'] is not None else ""
        expected_run_duration = workflow_run_resp.get("expected_run_duration", None)
        is_run_duration_exceeded = workflow_run_resp.get('sla_exceeded', None)
        workflow_tasks, task_events = await self._get_workflow_tasks(workflow_id=workflow_id, run_id=run_id,
                                                                     user_id=user_id)
        if (workflow_run_resp['start_time'] is not None) and (workflow_run_resp['status'] == RUNNING or workflow_run_resp['status'] == QUEUED):
            current_timezone = pytz.timezone('Asia/Kolkata')
            duration = duration_prev + abs(
                datetime.now().astimezone(current_timezone).replace(tzinfo=None) - datetime.fromisoformat(
                    start_date).astimezone(current_timezone).replace(tzinfo=None)).total_seconds()
            end_time = ""
        elif workflow_run_resp['start_time'] is not None:
            duration = duration_prev + abs((datetime.fromisoformat(start_date) - datetime.fromisoformat(
                workflow_run_resp['end_time'])).total_seconds())
            end_time = workflow_run_resp['end_time']

        repair_run = None
        if self.check_run_to_be_repaired(workflow_id, run_id, user_id) and workflow_run_resp['status'] == FAIL:
            repair_run = RepairRunStatus(status=FAIL)
        elif self.airflow.get_variable(f"repair_run_{workflow_resp.workflow_name}_{run_id}") and workflow_run_resp['status'] == RUNNING:
            repair_run = RepairRunStatus(status=REPAIRING)
        return RunDetailsV2(
            workflow_id=workflow_id,
            run_id=run_id,
            start_time=start_date,
            end_time=end_time,
            logical_date=logical_date,
            duration=duration,
            run_status=workflow_run_resp['status'],
            trigger=trigger,
            trigger_by=trigger_by,
            parameters=parameters,
            tasks=workflow_tasks,
            repair_run=repair_run,
            expected_run_duration = expected_run_duration,
            is_run_duration_exceeded = is_run_duration_exceeded
        )

    async def get_task_list(self, workflow_id: str, task_id: str, user_id: str):
        workflow_resp = await self.get_workflow_by_workflow_id(workflow_id=workflow_id, user_id=user_id)
        task: WorkflowTask = self.__find_task(workflow_resp.tasks, task_name=task_id)
        if task is None:
            return TaskNotFoundException(f"Task {task_id} not found in workflow {workflow_id}")
        retries = task.retries if task.retries != DEFAULT_INTEGER_VALUE else None
        timeout = task.timeout if task.timeout != DEFAULT_INTEGER_VALUE else None
        return TaskDetailsWithoutRun(
            workflow_id=workflow_id,
            task_id=task_id,
            source=task.source,
            source_type=task.source_type,
            file_path=task.file_path,
            dynamic_artifact=task.dynamic_artifact,
            dependent_libraries=task.dependent_libraries,
            packages=task.packages,
            depends_on=task.depends_on,
            input_parameters=task.input_parameters,
            retries=retries,
            timeout=timeout,
            attached_cluster=task.attached_cluster,
            message="",
            notification_preference=task.notification_preference,
            notify_on=task.notify_on,
            trigger_rule=task.trigger_rule
        )

    def get_job_cluster_details_with_run_id(self, job_cluster_id: str, task_id: str, run_id: str, workflow_name: str):
        workflow_cluster = self.get_workflow_cluster(workflow_name=workflow_name, run_id=run_id, task_name=task_id)
        if workflow_cluster is None:
            job_rsp = self.get_job_cluster_definition(job_cluster_definition_id=job_cluster_id)
            attached_cluster = ClusterDetails(
                cluster_id=job_rsp.cluster_id,
                runtime=job_rsp.runtime,
                cluster_name=job_rsp.cluster_name,
                cluster_status=FAIL,
                memory=get_memory(job_rsp.head_node_config, job_rsp.worker_node_configs),
                cores=get_cores(job_rsp.head_node_config, job_rsp.worker_node_configs),
                ray_dashboard="",
                logs_dashboard="",
                events_dashboard=""
            )
            return attached_cluster
        else:
            cluster_id = workflow_cluster.cluster_id
            return self.compute.get_cluster_details(cluster_id)

    def get_job_cluster_details_with_run_id_v2(self, job_cluster_id: str, task_id: str, run_id: str, workflow_name: str,
                                               try_number: int):
        """
        Get the job cluster details with the run_id
        :param job_cluster_id: job cluster id
        :param task_id: task id
        :param run_id: run id
        :param workflow_name: workflow name
        :param try_number: try number
        :return: ClusterDetails
        """
        workflow_cluster = self.get_workflow_cluster_v2(workflow_name=workflow_name, run_id=run_id, task_name=task_id,
                                                        try_number=try_number)
        if workflow_cluster is None:
            job_rsp = self.get_job_cluster_definition(job_cluster_definition_id=job_cluster_id)
            attached_cluster = ClusterDetails(
                cluster_id=job_rsp.cluster_id,
                runtime=job_rsp.runtime,
                cluster_name=job_rsp.cluster_name,
                cluster_status=FAIL,
                memory=get_memory(job_rsp.head_node_config, job_rsp.worker_node_configs),
                cores=get_cores(job_rsp.head_node_config, job_rsp.worker_node_configs),
                ray_dashboard="",
                logs_dashboard="",
                events_dashboard=""
            )
            return attached_cluster
        else:
            cluster_id = workflow_cluster.cluster_id
            return self.compute.get_cluster_details(cluster_id)

    async def get_task_details(self, workflow_id: str, run_id: str, task_id: str, user_id: str):
        workflow_resp = self.get_workflow_by_workflow_runid(workflow_id=workflow_id, run_id=run_id, user_id=user_id)
        task_resp = await self.airflow.get_task(dag_id=workflow_resp.workflow_name, run_id=run_id, task_id=task_id)

        wf_task: WorkflowTask = self.__find_task(workflow_resp.tasks, task_id)
        if wf_task is None:
            self.logger.error(f"Task doesn't exist: {task_id}")
        run_status = task_resp['state'] if task_resp['state'] is not None else QUEUED
        dag_id = workflow_resp.workflow_name
        retry_number = task_resp['try_number']
        if wf_task.file_path[-5:] == "ipynb":
            if check_if_output_notebook_exists_in_s3(dag_id=dag_id, run_id=run_id, task_id=task_id):
                output, output_type = get_output_notebook_path(dag_id=dag_id, run_id=run_id,
                                                               task_id=task_id, output_type=STRING)

            elif check_if_output_notebook_exists_in_s3_v2(dag_id=workflow_resp.workflow_name, run_id=run_id,
                                                          task_id=task_id, retry_number=retry_number):
                output, output_type = get_output_notebook_path(dag_id=workflow_resp.workflow_name,
                                                               run_id=run_id,
                                                               task_id=task_id,
                                                               retry_number=retry_number,
                                                               run_status=run_status,
                                                               output_type=STRING)
            else:
                output, output_type = self.airflow.get_task_output_log(
                    dag_id=workflow_resp.workflow_name,
                    run_id=run_id,
                    task_id=task_id,
                    try_number=task_resp['try_number'])
        else:
            output, output_type = self.airflow.get_task_output_log(dag_id=workflow_resp.workflow_name, run_id=run_id,
                                                                   task_id=task_id, try_number=task_resp['try_number'])
        trigger = ""
        trigger_by = ""
        if run_id[:6] == "manual":
            trigger_by = EXTERNAL
            trigger = MANUAL
        elif run_id[:9] == "scheduled":
            trigger_by = AUTOMATIC
            trigger = SCHEDULED
        if task_resp['state'] == "running":
            current_timezone = pytz.timezone('Asia/Kolkata')
            duration = abs(
                datetime.now().astimezone(current_timezone).replace(tzinfo=None) - datetime.fromisoformat(
                    task_resp['start_date']).astimezone(current_timezone).replace(tzinfo=None)).total_seconds()
            end_time = ""
        else:
            end_time = task_resp['end_date']
            duration = task_resp['duration']
        run_status = task_resp['state'] if task_resp['state'] is not None else QUEUED
        duration = duration if duration is not None else 0.0
        start_time = task_resp['start_date'] if task_resp['start_date'] is not None else ""
        end_time = end_time if end_time is not None else ""
        if wf_task.cluster_type == JOB:
            attached_cluster = self.get_job_cluster_details_with_run_id(wf_task.attached_cluster.cluster_id,
                                                                        task_id, run_id, workflow_resp.workflow_name)
        else:
            attached_cluster = self.compute.get_cluster_details(wf_task.attached_cluster.cluster_id)

        retries = wf_task.retries if wf_task.retries != DEFAULT_INTEGER_VALUE else None
        timeout = wf_task.timeout if wf_task.timeout != DEFAULT_INTEGER_VALUE else None
        return TaskDetails(
            workflow_id=workflow_id,
            run_id=run_id,
            task_id=task_id,
            start_time=start_time,
            end_time=end_time,
            duration=duration,
            source=wf_task.source,
            source_type=wf_task.source_type,
            file_path=wf_task.file_path,
            dynamic_artifact=wf_task.dynamic_artifact,
            dependent_libraries=wf_task.dependent_libraries,
            packages=wf_task.packages,
            input_parameters=wf_task.input_parameters,
            retries=retries,
            timeout=timeout,
            attached_cluster=attached_cluster,
            task_validation_status=wf_task.task_validation_status,
            run_status=run_status,
            trigger=trigger,
            trigger_by=trigger_by,
            output=output,
            output_type=output_type,
            task_events=[TaskEvent(timestamp="", status="", message="")],
            message="",
            notification_preference=wf_task.notification_preference,
            notify_on=wf_task.notify_on,
            trigger_rule=wf_task.trigger_rule
        )

    async def get_task_details_with_retries(self, workflow_id: str, run_id: str, task_id: str, user_id: str):
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        # Run synchronous call in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            workflow_resp = await loop.run_in_executor(
                executor,
                lambda: self.get_workflow_by_workflow_runid(workflow_id=workflow_id, run_id=run_id, user_id=user_id)
            )
        task_resp = await self.airflow.get_task(dag_id=workflow_resp.workflow_name, run_id=run_id, task_id=task_id)

        wf_task: WorkflowTask = self.__find_task(workflow_resp.tasks, task_id)
        if wf_task is None:
            self.logger.error(f"Task doesn't exist: {task_id}")

        run_status = task_resp['state'] if task_resp['state'] is not None else QUEUED
        if wf_task.file_path[-5:] == "ipynb":
            if check_if_output_notebook_folder_exists(dag_id=workflow_resp.workflow_name, run_id=run_id,
                                                      task_id=task_id):
                output = await self.__get_output_notebooks(workflow_id=workflow_resp.workflow_name, run_id=run_id,
                                                           task_id=task_id, latest_try_number=task_resp['try_number'],
                                                           latest_try_status=run_status)
            else:
                output = await self.__get_output_logs(workflow_id=workflow_resp.workflow_name, run_id=run_id,
                                                      task_id=task_id, latest_try_number=task_resp['try_number'],
                                                      latest_try_status=run_status)
        else:
            output = await self.__get_output_logs(workflow_id=workflow_resp.workflow_name, run_id=run_id,
                                                  task_id=task_id, latest_try_number=task_resp['try_number'],
                                                  latest_try_status=run_status)
        trigger = ""
        trigger_by = ""
        if run_id[:6] == "manual":
            trigger_by = EXTERNAL
            trigger = MANUAL
        elif run_id[:9] == "scheduled":
            trigger_by = AUTOMATIC
            trigger = SCHEDULED
        if task_resp['state'] == "running":
            current_timezone = pytz.timezone('Asia/Kolkata')
            duration = abs(
                datetime.now().astimezone(current_timezone).replace(tzinfo=None) - datetime.fromisoformat(
                    task_resp['start_date']).astimezone(current_timezone).replace(tzinfo=None)).total_seconds()
            end_time = ""
        else:
            end_time = task_resp['end_date']
            duration = task_resp['duration']
        duration = duration if duration is not None else 0.0
        start_time = task_resp['start_date'] if task_resp['start_date'] is not None else ""
        end_time = end_time if end_time is not None else ""
        
        # Run synchronous cluster details call in thread pool to avoid blocking
        with ThreadPoolExecutor() as executor:
            if wf_task.cluster_type == JOB:
                attached_cluster = await loop.run_in_executor(
                    executor,
                    lambda: self.get_job_cluster_details_with_run_id(wf_task.attached_cluster.cluster_id,
                                                                      task_id, run_id, workflow_resp.workflow_name)
                )
            else:
                attached_cluster = await loop.run_in_executor(
                    executor,
                    lambda: self.compute.get_cluster_details(wf_task.attached_cluster.cluster_id)
                )

        retries = wf_task.retries if wf_task.retries != DEFAULT_INTEGER_VALUE else None
        timeout = wf_task.timeout if wf_task.timeout != DEFAULT_INTEGER_VALUE else None
        output.sort(key=lambda x: x.try_number)

        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_TASK_DETAILS_RETRIEVED,
            {"workflow_name": workflow_resp.workflow_name, "run_id": run_id, "task_id": task_id}
        )
        # TODO: publish_event is a blocking call - commenting out to prevent API hanging
        # publish_event(workflow_id=workflow_id, event=event)

        return TaskDetailsV2(
            workflow_id=workflow_id,
            run_id=run_id,
            task_id=task_id,
            start_time=start_time,
            end_time=end_time,
            duration=duration,
            source=wf_task.source,
            source_type=wf_task.source_type,
            file_path=wf_task.file_path,
            dynamic_artifact=wf_task.dynamic_artifact,
            dependent_libraries=wf_task.dependent_libraries,
            packages=wf_task.packages,
            input_parameters=wf_task.input_parameters,
            retries=retries,
            timeout=timeout,
            attached_cluster=attached_cluster,
            task_validation_status=wf_task.task_validation_status,
            run_status=run_status,
            trigger=trigger,
            trigger_by=trigger_by,
            output=output,
            latest_try_output=output[-1],
            task_events=[TaskEvent(timestamp="", status="", message="")],
            message="",
            notification_preference=wf_task.notification_preference,
            notify_on=wf_task.notify_on,
            trigger_rule=wf_task.trigger_rule
        )

    async def get_task_details_with_retries_v3(self, workflow_id: str, run_id: str, task_id: str, user_id: str):
        workflow_resp = self.get_workflow_by_workflow_runid(workflow_id=workflow_id, run_id=run_id, user_id=user_id)
        task_resp = await self.airflow.get_task(dag_id=workflow_resp.workflow_name, run_id=run_id, task_id=task_id)
        workflow_run_resp = await self.get_run_details_from_workflow(workflow_id=workflow_id, run_id=run_id)
        wf_task: WorkflowTask = self.__find_task(workflow_resp.tasks, task_id)
        if wf_task is None:
            raise TaskNotFoundException(f"Task {task_id} not found in workflow {workflow_id}")

        run_status = task_resp['state'] if task_resp['state'] is not None else QUEUED
        cluster_type = wf_task.cluster_type
        try_number = task_resp['try_number']
        if try_number < 1:
            try_number = 1
        if wf_task.file_path[-5:] == "ipynb":
            if check_if_output_notebook_folder_exists(dag_id=workflow_resp.workflow_name, run_id=run_id,
                                                      task_id=task_id):
                output = await self.__get_output_notebooks_v3(workflow_id=workflow_resp.workflow_name, run_id=run_id,
                                                              task_id=task_id,
                                                              latest_try_number=try_number,
                                                              latest_try_status=run_status, cluster_type=cluster_type,
                                                              cluster_id=wf_task.attached_cluster.cluster_id,
                                                              workflow_name=workflow_resp.workflow_name)
            else:
                output = await self.__get_output_logs_v3(workflow_id=workflow_resp.workflow_name, run_id=run_id,
                                                         task_id=task_id, latest_try_number=try_number,
                                                         latest_try_status=run_status, cluster_type=cluster_type,
                                                         cluster_id=wf_task.attached_cluster.cluster_id,
                                                         workflow_name=workflow_resp.workflow_name)
        else:
            output = await self.__get_output_logs_v3(workflow_id=workflow_resp.workflow_name, run_id=run_id,
                                                     task_id=task_id, latest_try_number=try_number,
                                                     latest_try_status=run_status, cluster_type=cluster_type,
                                                     cluster_id=wf_task.attached_cluster.cluster_id,
                                                     workflow_name=workflow_resp.workflow_name)
        trigger = ""
        trigger_by = ""
        if run_id[:6] == "manual":
            trigger_by = EXTERNAL
            trigger = MANUAL
        elif run_id[:9] == "scheduled":
            trigger_by = AUTOMATIC
            trigger = SCHEDULED
        retries = wf_task.retries if wf_task.retries != DEFAULT_INTEGER_VALUE else None
        timeout = wf_task.timeout if wf_task.timeout != DEFAULT_INTEGER_VALUE else None
        parameters = wf_task.input_parameters or {}
        parameters.update(workflow_resp.parameters or {})
        parameters.update(workflow_run_resp.get('parameters') or {})
        output.sort(key=lambda x: x.try_number)
        return TaskDetailsV3(
            workflow_id=workflow_id,
            run_id=run_id,
            task_id=task_id,
            source=wf_task.source,
            source_type=wf_task.source_type,
            file_path=wf_task.file_path,
            dynamic_artifact=wf_task.dynamic_artifact,
            dependent_libraries=wf_task.dependent_libraries,
            packages=wf_task.packages,
            input_parameters=parameters,
            retries=retries,
            timeout=timeout,
            task_validation_status=wf_task.task_validation_status,
            run_status=run_status,
            trigger=trigger,
            trigger_by=trigger_by,
            output=output,
            message="",
            notification_preference=wf_task.notification_preference,
            notify_on=wf_task.notify_on,
            trigger_rule=wf_task.trigger_rule,
            depends_on=wf_task.depends_on,
        )

    async def __get_output_notebooks(self, workflow_id: str, run_id: str, task_id: str, latest_try_number: int,
                                     latest_try_status: str):
        output_links = get_all_output_notebooks(dag_id=workflow_id, run_id=run_id, task_id=task_id)

        if len(output_links) != latest_try_number:
            return await self.__get_output_logs(workflow_id, run_id, task_id, latest_try_number, latest_try_status)

        task_outputs = list()
        for try_number, output_link in output_links.items():
            application_logs, system_logs, error = get_logs_from_efs(workflow_id, run_id, task_id, try_number)
            output, output_type = get_output_notebook_path(dag_id=workflow_id, run_id=run_id,
                                                           task_id=task_id,
                                                           retry_number=try_number,
                                                           run_status=latest_try_status, output_type=HTML)
            if latest_try_number != try_number:
                task_outputs.append(TaskOutput(try_number=try_number, error=error, application_log=output,
                                               system_log=system_logs, logs=output, status=FAIL))
            else:
                task_outputs.append(TaskOutput(try_number=try_number, error=error, application_log=output,
                                               system_log=system_logs, logs=output, status=latest_try_status))

        return task_outputs

    async def __get_output_logs(self, workflow_id: str, run_id: str, task_id: str, latest_try_number: int,
                                latest_try_status: str):
        deferred_task_outputs = list()
        for try_number in range(1, latest_try_number + 1):
            output_log = self.airflow.get_task_output_log_async(workflow_id, run_id, task_id, try_number)
            deferred_task_outputs.append(output_log)

        results = await asyncio.gather(*deferred_task_outputs)
        task_outputs = []
        for try_number, output in results:

            application_logs, system_logs, error = get_logs_from_efs(workflow_id, run_id, task_id, try_number)

            airflow_logs = write_airflow_logs_to_efs(logs=output, dag_id=workflow_id, run_id=run_id, task_id=task_id,
                                                     retry_number=try_number)

            if latest_try_number != try_number:
                task_outputs.append(TaskOutput(try_number=try_number, error=error, application_log=application_logs,
                                               system_log=system_logs, logs=airflow_logs, status=FAIL))
            else:
                task_outputs.append(TaskOutput(try_number=try_number, error=error, application_log=application_logs,
                                               system_log=system_logs, logs=airflow_logs, status=latest_try_status))

        return task_outputs

    def _get_workflow_task_retry_cluster_details(self, cluster_type: str, cluster_id: str, task_id: str, run_id: str,
                                                 workflow_name: str,
                                                 try_number: int):
        """
        :param cluster_type: Cluster type (JOB or CLUSTER)
        :param cluster_id: Cluster id
        :param task_id: Task id
        :param run_id: Run id
        :param workflow_name: Workflow name
        :param try_number: Try number
        :return:
        """
        if cluster_type == JOB:
            attached_cluster = self.get_job_cluster_details_with_run_id_v2(cluster_id, task_id, run_id, workflow_name,
                                                                           try_number)
        else:
            attached_cluster = self.compute.get_cluster_details(cluster_id)

        return attached_cluster

    def get_latest_task_instance_from_es(self, dag_id: str, run_id: str, task_id: str):
        """
        Get the latest task instance of the task.
        :param dag_id: The id of the workflow.
        :param run_id: The id of the run.
        :param task_id: The id of the task.
        :return: The latest task instance.
        """
        resp = self.es_latest_task_run.es_dao.search(
            ElasticSearchQuery(GetLatestTaskInstance().get_query(dag_id, run_id, task_id))
        )

        latest_runs = []
        for run in resp.data:
            latest_runs.append(
                {
                    'start_date': run.start_date,
                    'end_date': run.end_date,
                    'duration': run.duration
                }
            )

        return latest_runs

    async def _get_workflow_task_retry_time_metrics(self, dag_id: str, run_id: str, task_id: str):
        """
        This function is used to get the workflow task retry time metrics.
        :param dag_id: The id of the workflow.
        :param run_id: The id of the run.
        :param task_id: The id of the task.
        :return: The start time, end time, and duration of the task.
        """

        task_failures = asyncio.create_task(
            self.airflow_dao.execute_mysql_get_workflow_task_failures(dag_id, run_id, task_id))
        latest_retry_time = asyncio.create_task(
            self.airflow_dao.execute_mysql_get_workflow_latest_retry_time(dag_id, run_id, task_id))

        results = await asyncio.gather(task_failures, latest_retry_time)

        task_failures = []
        for task in results[0]:
            start_date = task[0].strftime('%Y-%m-%dT%H:%M:%SZ') if task[0] else ""
            end_date = task[1].strftime('%Y-%m-%dT%H:%M:%SZ') if task[1] else ""
            duration = round(task[2], 2) if task[2] is not None else 0.0

            task_failures.append({
                'start_date': start_date,
                'end_date': end_date,
                'duration': duration
            })

        latest_task_retry = []
        for task in results[1]:
            start_date = task[0].strftime('%Y-%m-%dT%H:%M:%SZ') if task[0] else ""
            end_date = task[1].strftime('%Y-%m-%dT%H:%M:%SZ') if task[1] else ""
            duration = round(task[2], 2) if task[2] is not None else 0.0

            if start_date and not end_date:
                now_utc = datetime.now(pytz.utc)
                start_date_utc = datetime.strptime(start_date[:-1], '%Y-%m-%dT%H:%M:%S').replace(tzinfo=pytz.utc)
                duration = round((now_utc - start_date_utc).total_seconds(), 2)

            latest_task_retry.append({
                'start_date': start_date,
                'end_date': end_date,
                'duration': duration
            })

        task_instances = (
                task_failures + latest_task_retry + self.get_latest_task_instance_from_es(dag_id, run_id, task_id)
        )
        task_instances = sorted(task_instances, key=lambda x: x['start_date'])
        task_instances = [task for n, task in enumerate(task_instances) if
                         n == 0 or task['start_date'] != task_instances[n - 1]['start_date']]

        return task_instances

    async def __get_output_notebooks_v3(self, workflow_id: str, run_id: str, task_id: str, latest_try_number: int,
                                        latest_try_status: str, cluster_type: str, cluster_id: str, workflow_name: str):
        output_links = get_all_output_notebooks(dag_id=workflow_id, run_id=run_id, task_id=task_id)

        output_logs = []
        if len(output_links) != latest_try_number:
            # if jupyter links are not available, fetch airflow logs instead
            output_logs = await self.__get_output_logs_v3(workflow_id, run_id, task_id, latest_try_number, latest_try_status,
                                                   cluster_type, cluster_id, workflow_name)



        task_metrics = await self._get_workflow_task_retry_time_metrics(dag_id=workflow_name, run_id=run_id,
                                                                        task_id=task_id)
        task_outputs = []

        for try_number in range(1, latest_try_number + 1):
            if try_number in output_links:
                application_logs, system_logs, error = get_logs_from_efs(workflow_id, run_id, task_id, try_number)
                output, output_type = get_output_notebook_path(dag_id=workflow_id, run_id=run_id,
                                                               task_id=task_id,
                                                               retry_number=try_number,
                                                               run_status=latest_try_status, output_type=HTML)

                attached_cluster = self._get_workflow_task_retry_cluster_details(cluster_type, cluster_id, task_id,
                                                                                 run_id,
                                                                                 workflow_name, try_number)

                start_time, end_time, duration = (
                    task_metrics[try_number - 1]['start_date'],
                    task_metrics[try_number - 1]['end_date'],
                    task_metrics[try_number - 1]['duration']
                )

                task_outputs.append(TaskOutputV2(
                    try_number=try_number,
                    error=error,
                    application_log=output,
                    system_log=system_logs,
                    logs=output,
                    status=latest_try_status if latest_try_number == try_number else FAIL,
                    attached_cluster=attached_cluster,
                    start_time=start_time,
                    end_time=end_time,
                    duration=duration
                ))

            else:
                #if jupyter links are not available for the task number , add airflow logs in its place
                for output_log in output_logs:
                    if output_log.try_number == try_number:
                        task_outputs.append(output_log)
                        break

        return task_outputs

    async def __get_output_logs_v3(self, workflow_id: str, run_id: str, task_id: str, latest_try_number: int,
                                   latest_try_status: str, cluster_type: str, cluster_id: str, workflow_name: str):
        deferred_task_outputs = list()
        for try_number in range(1, latest_try_number + 1):
            output_log = self.airflow.get_task_output_log_async(workflow_id, run_id, task_id, try_number)
            deferred_task_outputs.append(output_log)

        task_metrics = await self._get_workflow_task_retry_time_metrics(dag_id=workflow_name, run_id=run_id,
                                                                        task_id=task_id)
        results = await asyncio.gather(*deferred_task_outputs)
        task_outputs = []
        for try_number, output in results:

            application_logs, system_logs, error = get_logs_from_efs(workflow_id, run_id, task_id, try_number)

            airflow_logs = write_airflow_logs_to_efs(logs=output, dag_id=workflow_id, run_id=run_id, task_id=task_id,
                                                     retry_number=try_number)

            attached_cluster = self._get_workflow_task_retry_cluster_details(cluster_type, cluster_id, task_id, run_id,
                                                                             workflow_name, try_number)
            start_time, end_time, duration = (
                task_metrics[try_number - 1]['start_date'],
                task_metrics[try_number - 1]['end_date'],
                task_metrics[try_number - 1]['duration']
            )

            if latest_try_number != try_number:

                task_outputs.append(TaskOutputV2(try_number=try_number, error=error, application_log=application_logs,
                                                 system_log=system_logs, logs=airflow_logs, status=FAIL,
                                                 attached_cluster=attached_cluster,
                                                 start_time=start_time,
                                                 end_time=end_time,
                                                 duration=duration))
            else:
                task_outputs.append(TaskOutputV2(try_number=try_number, error=error, application_log=application_logs,
                                                 system_log=system_logs, logs=airflow_logs, status=latest_try_status,
                                                 attached_cluster=attached_cluster,
                                                 start_time=start_time,
                                                 end_time=end_time,
                                                 duration=duration))

        return task_outputs

    def __find_task(self, workflow_tasks: List, task_name: str):
        for task in workflow_tasks:
            if task.task_name == task_name:
                return task
        return None

    def __get_workflow(self, workflow_name: str):
        find_resp = self.__find_workflow_by_name(workflow_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.debug(f"Workflow doesn't exist: {workflow_name}")
            return None
        return find_resp.data[0]

    def __get_workflow_by_id(self, workflow_id: str):
        find_resp = self.__find_workflow_by_id(workflow_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            self.logger.debug(f"Workflow doesn't exist: {workflow_id}")
            return None
        return find_resp.data[0]

    def __find_recently_visited(self, user_id: str):
        return self.rec_vis_es.es_dao.search(ElasticSearchQuery(RecentlyVisitedQuery().get_query(user_id)))

    def get_workflow_by_id(self, workflow_id):
        return self.es.es_dao.search(ElasticSearchQuery(WorkFlowSearchFromId().get_query(workflow_id)))

    def __get_workflow_by_runid(self, workflow_id: str, timestamp: str):
        return self.es_workflow_history.es_dao.search(
            ElasticSearchQuery(WorkFlowSearchFromRunId().get_query(workflow_id, timestamp)))

    def get_workflow_by_id_v2(self, workflow_id):
        return self.es.es_dao.aggregation_search(ElasticSearchQuery(WorkFlowSearchFromId().get_query(workflow_id)))

    def __find_workflow_by_id(self, workflow_id):
        return self.es.es_dao.search(ElasticSearchQuery(WorkFlowSearchFromId().get_query(workflow_id)))

    def __find_workflow_by_cluster_id(self, cluster_id):
        return self.es_workflow_cluster.es_dao.search(
            ElasticSearchQuery(WorkFlowSearchFromClusterId().get_query(cluster_id)))

    def __find_workflow_by_name(self, name: str):
        return self.es.es_dao.search(ElasticSearchQuery(WorkFlowSearchFromName().get_query(name)))

    def __find_workflow_by_display_name(self, display_name: str):
        return self.es.es_dao.search(ElasticSearchQuery(WorkflowSearchFromDisplayName().get_query(display_name)))

    def __find_workflow_by_params(self, user: [str], status: [str], query: str, sort_by: str, sort_order: str,
                                  offset: int, page_size: int):
        return self.es.es_dao.aggregation_search(ElasticSearchQuery(
            WorkFlowSearchFromParam().get_query(user, status, query, sort_by, sort_order, offset, page_size)))

    def __update_workflow(self, workflow: Workflow):
        try:
            # Perform the Elasticsearch update
            es_update_response = self.es.es_dao.update(workflow,
                                                       WorkflowEsDtoIdentifier(workflow_id=workflow.workflow_id))
            # Return the Elasticsearch update response
            return es_update_response
        except Exception as e:
            # Log the error and raise an exception to ensure consistency
            self.logger.error(f"Failed to update workflow: {e}")
            raise

    def __find_job_cluster_by_name(self, name: str):
        return self.es_job_cluster.es_dao.search(ElasticSearchQuery(JobClusterSearchFromName().get_query(name)))

    def __find_job_cluster_by_id(self, job_cluster_definition_id):
        return self.es_job_cluster.es_dao.search(
            ElasticSearchQuery(JobClusterSearchFromId().get_query(job_cluster_definition_id)))

    def __find_workflow_cluster(self, workflow_name, run_id, task_name):
        return self.es_workflow_cluster.es_dao.search(
            ElasticSearchQuery(GetWorkflowCluster().get_query(workflow_name, run_id, task_name)))

    def __find_workflow_cluster_v2(self, workflow_name, run_id, task_name, try_number):
        return self.es_workflow_cluster.es_dao.search(
            ElasticSearchQuery(GetWorkflowClusterV2().get_query(workflow_name, run_id, task_name, try_number)))

    def create_job_cluster_definition(self, job_cluster_request: CreateJobClusterDefinitionRequest):
        """
        Create a new job cluster definition
        :param job_cluster_request: CreateJobClusterDefinitionRequest
        :return: status, CreateJobClusterDefinitionResponse
        """
        try:
            find_resp = self.__find_job_cluster_by_name(job_cluster_request.cluster_name)
            if not find_resp.is_success():
                self.logger.error(f"Error while querying the Elastic Search, {find_resp.status}, {find_resp.data}")
                return "Error while querying the Elastic Search", None
            if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
                job_cluster_definition: JobClusterDefinition = JobClusterDefinition.from_create_def(job_cluster_request)
                job_cluster_definition.estimated_cost=get_cost_estimate(job_cluster_request)
                create_resp = self.es_job_cluster.create(job_cluster_definition)
                if not create_resp.is_success():
                    return ERROR, None
                return SUCCESS, CreateJobClusterDefinitionResponseData(
                    job_cluster_definition_id=create_resp.data.job_cluster_definition_id)
            else:
                self.logger.debug(f"Cluster Name already exists, {find_resp.data[0]}")
                return CLUSTER_NAME_ALREADY_EXISTS_ERROR, None
        except Exception as e:
            self.logger.error(f"Exception: {e.__str__()}")
            return e.__str__()

    def update_job_cluster_definition(self, job_cluster_request: UpdateJobClusterDefinitionRequest,
                                      job_cluster_definition_id: str):
        try:
            find_resp = self.__find_job_cluster_by_id(job_cluster_definition_id)
            if not find_resp.is_success():
                self.logger.error(f"Error while querying the Elastic Search, {find_resp.status}, {find_resp.data}")
                return "Error while querying the Elastic Search", None
            if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
                raise JobClusterNotFoundException(f"Job Cluster {job_cluster_definition_id} not found")
            job_cluster_definition: JobClusterDefinition = JobClusterDefinition.from_update_def(job_cluster_request,
                                                                                                job_cluster_definition_id)
            job_cluster_definition.estimated_cost=get_cost_estimate(job_cluster_request)
            update_resp = self.es_job_cluster.es_dao.update(job_cluster_definition,
                                                            JobClusterEsDtoIdentifier(
                                                                job_cluster_definition_id=job_cluster_definition.job_cluster_definition_id))
            if not update_resp.is_success():
                return ERROR
            return SUCCESS, UpdateJobClusterDefinitionResponseData(
                job_cluster_definition_id=job_cluster_definition_id)
        except Exception as e:
            self.logger.error(f"Exception: {e.__str__()}")
            return e.__str__()

    async def check_unique_job_cluster_name(self, body: CheckUniqueJobClusterRequest):
        find_resp = self.__find_job_cluster_by_name(body.cluster_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            return CheckUniqueJobClusterResponseData(is_unique=True)
        else:
            return CheckUniqueJobClusterResponseData(is_unique=False)

    def check_if_workflow_exists(self, workflow_name: str):
        find_resp = self.__find_workflow_by_display_name(workflow_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            return False
        else:
            return True

    def get_job_cluster_definition(self, job_cluster_definition_id: str):
        find_resp = self.__find_job_cluster_by_id(job_cluster_definition_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise JobClusterNotFoundException(f"Job Cluster {job_cluster_definition_id} not found")
        return JobClusterDetailsResponseData(
            cluster_id=find_resp.data[0].job_cluster_definition_id,
            cluster_name=find_resp.data[0].cluster_name,
            tags=find_resp.data[0].tags,
            runtime=find_resp.data[0].runtime,
            inactive_time=find_resp.data[0].inactive_time,
            auto_termination_policies=find_resp.data[0].auto_termination_policies,
            head_node_config=find_resp.data[0].head_node_config,
            worker_node_configs=find_resp.data[0].worker_node_configs,
            advance_config=find_resp.data[0].advance_config,
            user=find_resp.data[0].user,
            created_at=find_resp.data[0].created_at,
            estimated_cost=find_resp.data[0].estimated_cost,
            cluster_status=find_resp.data[0].cluster_status,
        )

    def list_all_job_clusters(self, job_cluster_definition_list_request: JobClusterDefinitionListRequest ) -> tuple[
        list[JobClusterDefinitionListResponseData], Any]:
        find_resp = self.es_job_cluster.es_dao.aggregation_search(
            ElasticSearchQuery(ListJobClusters().get_query(offset= job_cluster_definition_list_request.offset,
                                                           page_size= job_cluster_definition_list_request.page_size,
                                                           cluster_name= job_cluster_definition_list_request.query))
        )

        lambda_func = lambda raw_dict: JobClusterDefinition(**raw_dict)
        cluster_list = [lambda_func(x["_source"]) for x in find_resp.data["hits"]["hits"]]
        total_count = find_resp.data["aggregations"]["total_count"]["value"]
        return [
            JobClusterDefinitionListResponseData(
                job_cluster_definition_id=cluster.job_cluster_definition_id,
                cluster_name=cluster.cluster_name,
                runtime=cluster.runtime,
                estimated_cost=cluster.estimated_cost,
                created_at=cluster.created_at,
                cores=get_cores(cluster.head_node_config, cluster.worker_node_configs),
                memory=get_memory(cluster.head_node_config, cluster.worker_node_configs),
            ) for cluster in cluster_list
        ], total_count

    def update_cluster_details_in_workflow(self, workflow_cluster_request: WorkflowTaskClusterRequest):
        """
        Update cluster details in workflow
        :param workflow_cluster_request: WorkflowTaskClusterRequest
        :return: status, UpdateClusterDetailsResponse
        """

        workflow_cluster = get_workflow_task_cluster(workflow_cluster_request)

        existing_workflow_cluster = self.get_workflow_cluster(
            workflow_name=workflow_cluster.workflow_name,
            run_id=workflow_cluster.run_id,
            task_name=workflow_cluster.task_name
        )
        if existing_workflow_cluster is None:
            create_resp = self.es_workflow_cluster.create(workflow_cluster)
            if not create_resp.is_success():
                self.logger.error(f"failed to create an entry for cluster, response: {create_resp}")
                raise Exception(create_resp)
            else:
                return WorkflowTaskClusterResponseData(status=create_resp.status,
                                                       workflow_cluster_id=create_resp.data.workflow_cluster_id)
        else:
            workflow_cluster.workflow_cluster_id = existing_workflow_cluster.workflow_cluster_id
            update_resp = self.es_workflow_cluster.update(workflow_cluster)
            if not update_resp.is_success():
                self.logger.error(f"failed to update an entry for cluster, response: {update_resp.error_message}")
                raise Exception(update_resp.error_message or "Failed to update cluster")
            else:
                return WorkflowTaskClusterResponseData(status=update_resp.status if hasattr(update_resp, 'status') else ("error" if not update_resp.is_success() else "success"),
                                                       workflow_cluster_id=update_resp.data.workflow_cluster_id)

    def update_cluster_details_in_workflow_v2(self, workflow_cluster_request: WorkflowTaskClusterRequestV2):
        """
        Update cluster details in workflow
        :param workflow_cluster_request: WorkflowTaskClusterRequest
        :return: status, UpdateClusterDetailsResponse
        """

        workflow_cluster = get_workflow_task_cluster_v2(workflow_cluster_request)
        create_resp = self.es_workflow_cluster.create(workflow_cluster)
        if not create_resp.is_success():
            self.logger.error(f"failed to create an entry for cluster, response: {create_resp.error_message}")
            raise Exception(create_resp.error_message or "Failed to create cluster")
        else:
            return WorkflowTaskClusterResponseData(status=create_resp.status if hasattr(create_resp, 'status') else ("error" if not create_resp.is_success() else "success"),
                                                   workflow_cluster_id=create_resp.data.workflow_cluster_id)

    def get_workflow_cluster(self, workflow_name: str, run_id: str, task_name: str):
        find_resp = self.__find_workflow_cluster(workflow_name, run_id, task_name)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            return None
        else:
            return find_resp.data[0]

    def get_workflow_cluster_v2(self, workflow_name: str, run_id: str, task_name: str, try_number: int):
        """
        Get workflow cluster details
        :param workflow_name: Workflow name
        :param run_id: Run id
        :param task_name: Task name
        :param try_number: Try number
        :return: WorkflowClusterDetailsResponseData
        """
        find_resp = self.__find_workflow_cluster_v2(workflow_name, run_id, task_name, try_number)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            return None
        else:
            return find_resp.data[0]

    def trigger_dag_with_params(self, dag_id: str, params: dict = {}):
        """
        Triggers an Airflow DAG using its API and passes runtime parameters.
        :param dag_id: The ID of the DAG to trigger.
        :param params: The runtime parameters to pass to the DAG.
        :return: The ID of the triggered DAG run.
        """

        find_resp = self.__find_workflow_by_display_name(display_name=dag_id)

        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound(f"Workflow with name {dag_id} not found")

        workflow_name = find_resp.data[0].workflow_name

        url = f"{self.AIRFLOW_URL}/api/v1/dags/{workflow_name}/dagRuns"
        payload = {
            "conf": params
        }

        # If dag is not active, raise an exception
        dag_status = self.airflow.get_dag(workflow_name)['is_paused']
        if dag_status:
            raise WorkflowNotActiveException("Workflow is not active, please activate the workflow to run it")

        resp = _request(method="POST", url=url, payload=payload, auth=auth)
        workflow_id = self.find_workflow_id(workflow_name).workflow_id
        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_TRIGGERED,
            {"workflow_name": workflow_name}
        )
        # TODO: publish_event is a blocking call that can hang API responses - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=workflow_id, event=event)

        return resp['dag_run_id']

    async def get_workflow_run_status_and_logs_url(self, dag_id: str, run_id: str):
        """
        Get the status and logs URL for a given DAG run.

        :param dag_id: The ID of the DAG to trigger.
        :param run_id: The ID of the DAG run.
        :return: Tuple containing the state and logs URL.
        """

        find_resp = self.__find_workflow_by_display_name(display_name=dag_id)

        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound(f"Workflow with name {dag_id} not found")

        workflow_name = find_resp.data[0].workflow_name

        # Fetch the task id from workflow
        tasks_resp = self.__find_tasks_by_workflow_name(workflow_name=workflow_name, run_id=run_id)
        task_id, retry_number = tasks_resp[0]['task_id'], tasks_resp[0]['try_number']

        workflow_response = await self.find_workflow_id_async(workflow_name)
        workflow_id = workflow_response.workflow_id

        LOGS_URL = urljoin(self.DARWIN_URL, f"{workflow_id}/runs/{run_id}/tasks/{task_id}")
        url = f"{self.AIRFLOW_URL}/api/v1/dags/{workflow_name}/dagRuns/{run_id}"
        resp = _request(method="GET", url=url, auth=auth)
        return resp['state'], LOGS_URL

    def trigger_workflow_with_params(self, workflow_id: str, params: dict = {}):
        """
        Triggers an Airflow DAG using its API and passes runtime parameters.
        :param workflow_id: The ID of the DAG to trigger.
        :param params: The runtime parameters to pass to the DAG.
        :return: The ID of the triggered DAG run.
        """
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        wf: Workflow = es_response[0]
        dag_id = wf.workflow_name
        url = f"{self.AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns"
        payload = {
            "conf": params
        }
        resp = _request(method="POST", url=url, payload=payload, auth=auth)

        return resp['dag_run_id']

    async def get_workflow_run_status_and_logs_url_by_id(self, workflow_id: str, run_id: str = ""):
        """
        Get the status and logs URL for a given DAG run.
        :param workflow_id: The ID of the DAG to trigger.
        :param run_id: The ID of the DAG run.
        :return: Tuple containing the state and logs URL.
        """
        # Fetch the task id from workflow
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        wf: Workflow = es_response[0]
        dag_id = wf.workflow_name

        # If runid is not provided, get the latest run id
        if not run_id:
            wf_runs = (await self.airflow.get_latest_dag_runs_async(dag_id))['dag_runs']
            if len(wf_runs) == 0:
                raise RunNotFoundException(f"No runs found for workflow {dag_id}")
            run_id = wf_runs[0]['dag_run_id']

        tasks_resp = self.__find_tasks_by_workflow_name(workflow_name=dag_id, run_id=run_id)
        task_id, retry_number = tasks_resp[0]['task_id'], tasks_resp[0]['try_number']

        workflow_response = await self.find_workflow_id_async(dag_id)
        workflow_id = workflow_response.workflow_id

        LOGS_URL = urljoin(self.DARWIN_URL, f"{workflow_id}/runs/{run_id}/tasks/{task_id}")
        url = f"{self.AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns/{run_id}"
        resp = _request(method="GET", url=url, auth=auth)
        return resp['state'], LOGS_URL

    def handle_event(self, workflow_id: str, event: str, timestamp: str, metadata: dict):
        """
        Handles the event by sending to Slack channel
        :param workflow_id: The ID of the event.
        :param event: The event to handle.
        :param timestamp: The timestamp of the event.
        :param metadata: The metadata of the event.
        :return: The response of the event.
        """

        if "SUCCESS" in event:
            symbol = ":white_check_mark:"  # Consistent with success
        elif "REQUEST" in event:
            symbol = ":rocket:"  # Clear indication of update
        elif "FAILED" in event:
            symbol = ":x:"  # Standard Slack symbol for deletion
        elif "STOPPED" in event or "PAUSED" in event:
            symbol = "⛔"
        elif "RESUMED" in event or "STARTED" in event or "TRIGGERED" in event:
            symbol = "▶"
        else:
            symbol = ""

            # Construct the message
        message = "{} {}!\n\n" \
                  "*Workflow ID:* {}\n" \
                  "*Timestamp:* {}\n" \
                  "*Metadata:*\n" \
                  "```\n{}\n```".format(symbol, event, workflow_id, timestamp, metadata)

        self.logger.info(f"Sending event to Slack: {message}")

        # Initialize Slack notifier
        # slack = WorkflowSlackNotifier(slack_token=SLACK_TOKEN,
        #                               slack_channel='darwin-workflow-events')

        # Send the formatted message to Slack
        # slack.send_alert(message)

        return "Event sent to Slack"

    def get_workflow_by_cluster_id(self, cluster_id: str):
        es_response = self.__find_workflow_by_cluster_id(cluster_id=cluster_id).data
        if (len(es_response) == 0):
            raise ClusterNotFoundException(f"Cluster with id {cluster_id} not found")
        workflow_cluster = es_response[0]
        return WorkflowDetails(workflow_name=workflow_cluster.workflow_name,
                               run_id=workflow_cluster.run_id,
                               task_name=workflow_cluster.task_name)

    async def repair_run(self, workflow_id: str, body: RepairRunRequest, user_id: str):
        """
        Repairs a run.
        """
        es_response = self.__find_workflow_by_id(workflow_id=workflow_id).data
        if (len(es_response) == 0):
            raise WorkflowNotFound(f"Workflow with id {workflow_id} not found")
        wf: Workflow = es_response[0]
        dag_id = wf.workflow_name
        if not self.check_run_to_be_repaired(workflow_id, body.run_id, user_id):
            raise RepairRunException(f"Run {body.run_id} cannot be repaired")
        self.logger.info(f"Repairing run {body.run_id} for workflow {workflow_id}")
        await self.fetch_and_store_task_instance(dag_id, body.run_id, body.selected_tasks)
        await self.airflow.repair_dag_run(body.run_id, dag_id, body.selected_tasks)
        await self.update_run(run_id=body.run_id,workflow_id=workflow_id,state=RUNNING, repair_time=datetime.now(timezone.utc))
        return RepairRunResponseData(message=f"Repairing run with id {body.run_id}")

    async def fetch_runs_for_workflows(self,workflow_ids):
        workflow_runs = await DarwinWorkflowRun.filter(workflow_id__in=workflow_ids).all()
        if workflow_runs:
            self.logger.info(f"Found {len(workflow_runs)} runs for given workflow_ids: {workflow_ids}")
            return workflow_runs
        else:
            self.logger.info(f"No runs found for the given workflow_ids: {workflow_ids}")
            return []

    async def create_run(
            self,
            run_id: str,
            workflow_id: str,
            dag_id: str,
            state: str,
            start_time: datetime,
            end_time: datetime = None,
            expected_run_duration: int = None,
            parameters=None,
    ):
        if parameters is None:
            parameters = {}
        try:
            workflow = self.__get_workflow_by_id(workflow_id=workflow_id)
            run_type, triggered_by = get_trigger(run_id)
            workflow_run = await DarwinWorkflowRun.create(
                run_id=run_id,
                workflow_id=workflow_id,
                dag_id=dag_id,
                state=state,
                start_time=start_time.replace(tzinfo=timezone.utc),
                end_time=end_time.replace(tzinfo=timezone.utc) if end_time else None,
                expected_run_duration=expected_run_duration,
                run_type = run_type,
                triggered_by = triggered_by,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
                parameters=parameters
            )
            self.logger.info(f"Inserted Workflow Run: {workflow_run.run_id} for Workflow ID: {workflow_id}")
            user_email, slack_channels = workflow.created_by, workflow.notify_on
            expected_run_duration = getattr(workflow, "expected_run_duration", None)
            notification_preference = getattr(workflow, "notification_preference", None)
            state_notifications = {
                "skipped": "on_skip",
                "running": "on_start",
            }
            
            # Fire-and-forget Slack notification - should never block the main flow
            if state in state_notifications and notification_preference and notification_preference.get(state_notifications[state]):
                async def send_notification_safe():
                    try:
                        await asyncio.wait_for(
                            self.slack_notifier.notify_workflow_event(
                                user_email, slack_channels, workflow_id, dag_id, run_id, state, expected_run_duration
                            ),
                            timeout=5.0
                        )
                        self.logger.info(f"Notification sent for Workflow Run: {workflow_run.run_id} with state {state}")
                    except asyncio.TimeoutError:
                        self.logger.warning(f"Slack notification timed out for Workflow Run: {workflow_run.run_id}")
                    except Exception as e:
                        self.logger.error(f"Failed to send Slack notification for Workflow Run: {workflow_run.run_id}: {e}")
                
                # Create task without awaiting - fire and forget
                asyncio.create_task(send_notification_safe())

            return workflow_run

        except Exception as e:
            self.logger.error(f"Error while inserting workflow run {run_id}: {e}")
            return None

    async def update_run(
            self,
            run_id: str,
            workflow_id: str,
            state: str = None,
            end_time: datetime = None,
            sla_exceeded: bool = None,
            repair_time: datetime = None,
    ):
        try:
            # Try to fetch the existing record
            workflow_run = await DarwinWorkflowRun.get(run_id=run_id, workflow_id=workflow_id)

            # Update the existing record
            if state:
                workflow_run.state = state
            if end_time:
                workflow_run.end_time = end_time.replace(tzinfo=timezone.utc)
            if repair_time:
                workflow_run.repair_time = repair_time.replace(tzinfo=timezone.utc)
            if sla_exceeded:
                workflow_run.sla_exceeded = sla_exceeded
            workflow_run.updated_at = datetime.now(timezone.utc)

            logger.info(f"Updating run {run_id} - state: {state}, sla_exceeded: {sla_exceeded}")

            await workflow_run.save()
            logger.info(f"Updated Workflow Run: {workflow_run.run_id} for Workflow ID: {workflow_id}")

            workflow = self.__get_workflow_by_id(workflow_id=workflow_id)
            dag_id = workflow.workflow_name
            expected_run_duration = getattr(workflow, "expected_run_duration", None)
            notification_preference = getattr(workflow, "notification_preference", None)
            user_email, slack_channels = workflow.created_by, workflow.notify_on
            state_notifications = {
                "success": "on_success",
                "failed": "on_fail",
            }
            if state in state_notifications and notification_preference.get(state_notifications[state]):
                await self.slack_notifier.notify_workflow_event(
                    user_email, slack_channels, workflow_id, dag_id, run_id, state, expected_run_duration
                )
            if sla_exceeded:
                await self.slack_notifier.notify_workflow_event(
                    user_email, slack_channels, workflow_id, dag_id, run_id, "sla_exceeded", expected_run_duration
                )

            self.logger.info(f"Notification sent for Workflow Run: {workflow_run.run_id} with state {state}")

        except Exception as e:
            logger.error(f"Unexpected error for run {run_id}: {e}")
            return None

        return workflow_run

    async def create_and_update_run(
            self,
            run_id: str,
            workflow_id: str,
            dag_id: str,
            state: str,
            start_time: datetime,
            end_time: datetime = None,
            expected_run_duration: int = None,
            sla_exceeded: bool = None
    ):
        """
        API to create or update a workflow run.
        If the run_id exists, update the run; otherwise, create a new one.
        """
        existing_run = await DarwinWorkflowRun.get_or_none(run_id=run_id, workflow_id=workflow_id)

        if existing_run:
            if start_time:
                existing_run.start_time = start_time
            if state:
                existing_run.state = state
            if end_time:
                existing_run.end_time = end_time.replace(tzinfo=timezone.utc)
            if sla_exceeded:
                existing_run.sla_exceeded = sla_exceeded
            if expected_run_duration:
                existing_run.expected_run_duration = expected_run_duration
            existing_run.updated_at = datetime.now(timezone.utc)
            await existing_run.save()

            logger.info(f"Updated Workflow Run: {existing_run.run_id} for Workflow ID: {workflow_id}")
        else:
            # Create new run
            run_type, triggered_by = get_trigger(run_id)
            new_run = await DarwinWorkflowRun.create(
                run_id=run_id,
                workflow_id=workflow_id,
                dag_id=dag_id,
                state=state,
                start_time=start_time.replace(tzinfo=timezone.utc),
                end_time=end_time.replace(tzinfo=timezone.utc) if end_time else None,
                expected_run_duration=expected_run_duration,
                run_type=run_type,
                triggered_by=triggered_by,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )

            logger.info(f"Inserted Workflow Run: {new_run.run_id} for Workflow ID: {workflow_id}")
            existing_run = new_run

        # Notifications
        workflow = self.__get_workflow_by_id(workflow_id=workflow_id)
        notification_preference = getattr(workflow, "notification_preference", {})

        user_email, slack_channels = workflow.created_by, workflow.notify_on
        state_notifications = {
            "skipped": "on_skip",
            "running": "on_start",
            "success": "on_success",
            "failed": "on_fail",
        }

        if dag_id is None:
            dag_id = workflow.workflow_name

        if notification_preference and state in state_notifications and notification_preference.get(state_notifications[state]):
            await self.slack_notifier.notify_workflow_event(
                user_email, slack_channels, workflow_id, dag_id, run_id, state, expected_run_duration
            )

        if sla_exceeded:
            await self.slack_notifier.notify_workflow_event(
                user_email, slack_channels, workflow_id, dag_id, run_id, "sla_exceeded", expected_run_duration
            )

        return InsertWorkflowRunResponse(message="Workflow run processed successfully", run_id=existing_run.run_id)


    async def get_run_details_from_workflow(self, workflow_id: str, run_id: str):
        """
        Fetch details for a specific run ID.
        """
        try:
            run = await DarwinWorkflowRun.get(workflow_id=workflow_id, run_id=run_id)
            return {
                "workflow_id": run.workflow_id,
                "run_id": run.run_id,
                "status": run.state,
                "start_time": run.start_time.isoformat(),
                "end_time": run.end_time.isoformat() if run.end_time else None,
                "repair_time": run.repair_time.isoformat() if run.repair_time else None,
                "parameters": run.parameters,
                "expected_run_duration": run.expected_run_duration,
                "sla_exceeded": run.sla_exceeded,
                "created_at": run.created_at.isoformat(),
                "updated_at": run.updated_at.isoformat(),
            }
        except Exception as e:
            logger.error(f"Error fetching run details for run ID {run_id}: {e}")
            return None

    async def get_metadata(self, names: List[str] = None):
        """
        Retrieve metadata information for workflows.

        Args:
            names: List of configuration item names to retrieve

        Returns:
            Dictionary containing the requested metadata
        """
        result = {}

        if not names:
            return result

        try:
            # Fetch enabled metadata entries whose names are in the provided list
            requested_metadata = await Metadata.filter(enabled=True, name__in=names).all()
            # Build a dictionary for quick lookup
            metadata_dict = {entry.name: entry.config for entry in requested_metadata}
            # Populate the result, preserving the order of names and ensuring all requested names are present
            result.update({name: metadata_dict.get(name) for name in names})
        except Exception as e:
            logger.error(f"Error fetching metadata: {str(e)}")
            result.update({name: None for name in names})
        return result

    def list_all_job_clusters_v2(
        self, request: SearchRequest
    ) -> tuple[list[JobClusterDefinitionListResponseData], Any]:
        """
        Lists all job clusters based on the given search request.

        Args:
            request (SearchRequest): The search parameters

        Returns:
            tuple: A tuple containing:
                - list of JobClusterDefinitionListResponseData objects
                - total count of matched job clusters

        Raises:
            Exception: Propagates any unexpected exceptions for higher-level handling
        """
        try:
            # Build the Elasticsearch query using request parameters
            query = WorkFlowSearchFromParam().build_query_from_request(request)
            es_query = ElasticSearchQuery(query)
            # Perform the aggregation search using DAO
            find_resp = self.es_job_cluster.es_dao.aggregation_search(es_query)

            # Parse the ES response into JobClusterDefinitionListResponseData list
            lambda_func = lambda raw: JobClusterDefinitionListResponseData(
                job_cluster_definition_id=raw["job_cluster_definition_id"],
                cluster_name=raw["cluster_name"],
                cores=get_cores(HeadNodeConfig(**raw.get("head_node_config", {})), [WorkerNodeConfig(**cfg) for cfg in raw.get("worker_node_configs", [])]),
                memory=get_memory(HeadNodeConfig(**raw.get("head_node_config", {})), [WorkerNodeConfig(**cfg) for cfg in raw.get("worker_node_configs", [])]),
                runtime=raw["runtime"],
                created_at=raw.get("created_at", None),
                estimated_cost=raw.get("estimated_cost", None),
            )
            cluster_list = [
                lambda_func(hit["_source"])
                for hit in (find_resp.data.get("hits", {}).get("hits", []) if find_resp and find_resp.data else [])
                if hit and "_source" in hit
            ]
            # Extract total count from aggregations
            total_count = (
                find_resp.data.get("hits", {})
                .get("total", {})
                .get("value", 0)
                if find_resp and find_resp.data
                else 0
            )

            return cluster_list, total_count

        except KeyError as e:
            # Likely due to unexpected structure in the ES response
            self.logger.error(f"Key error while parsing ES response: {e}")
            return [], 0
        except Exception as e:
            # Catch-all for any other unexpected errors
            self.logger.exception(f"Unexpected error in list_all_job_clusters_v2: {e}")
            raise

    def get_workflows_by_cluster_id(self, cluster_id: str) -> List[WorkflowListDataV2]:
        """
        Fetch workflows associated with a given cluster ID.

        Args:
            cluster_id (str): The ID of the cluster to filter workflows.

        Returns:
            List[WorkflowListDataV2]: A list of parsed workflows matching the cluster ID.
        """
        # Build the Elasticsearch query using the provided cluster ID
        query = WorkFlowSearchFromClusterID().get_query(cluster_id)
        es_query = ElasticSearchQuery(query)
        # Execute the search query on Elasticsearch
        search_response = self.es.es_dao.aggregation_search(es_query)
        hits = search_response.data.get("hits", {}).get("hits", [])

        # Extract the _source field from each search hit
        workflows_data = [hit["_source"] for hit in hits]

        # If no workflows found, return an empty list
        if not workflows_data:
            return []

        parsed_workflows = []

        # Parse each workflow into the WorkflowListDataV2 model
        for wf in workflows_data:
            try:
                parsed_workflow = WorkflowListDataV2(
                    workflow_name=wf["workflow_name"],
                    display_name=wf.get("display_name", ""),
                    description=wf["description"],
                    status=wf["workflow_status"],
                    workflow_id=wf["workflow_id"],
                    tags=wf.get("tags", []),
                    schedule=wf["schedule"],
                    next_run_time="",  # Placeholder: Update if next run time is available
                    owner=wf.get("created_by", "")
                )
                parsed_workflows.append(parsed_workflow)
            except Exception as e:
                # Log validation failure and continue with other workflows
                print(f"Validation failed for workflow '{wf.get('workflow_name', 'Unknown')}': {e}")

        return parsed_workflows

    def soft_delete_job_cluster_definition_by_id(self, job_cluster_definition_id: str) -> JobClusterDefinitionDeleteResponseData:

        existing_job_cluster_definition_resp = self.get_job_cluster_definition(job_cluster_definition_id)

        if existing_job_cluster_definition_resp == ERROR:
            self.logger.error(f"Error in searching job_cluster_definition with id: {job_cluster_definition_id} "f"{existing_job_cluster_definition_resp.message}")
            return False


        if existing_job_cluster_definition_resp is None :
            self.logger.debug(f"job_cluster_definition is not registered can not update it: {job_cluster_definition_id}")
            raise WorkflowNotFound(f"job_cluster_definition with id {job_cluster_definition_id} not found")

        if existing_job_cluster_definition_resp.cluster_status == DELETED:
            return JobClusterDefinitionDeleteResponseData(is_deleted=True, job_cluster_id=job_cluster_definition_id)
        existing_job_cluster_definition_resp.cluster_status = DELETED
        update_resp = self.update_job_cluster_definition(existing_job_cluster_definition_resp, existing_job_cluster_definition_resp.cluster_id)

        if update_resp == "ERROR":
            self.logger.error(f"Failed to delete job_cluster_definition \n {update_resp.message}")
            return JobClusterDefinitionDeleteResponseData(is_deleted=False, job_cluster_id=job_cluster_definition_id)

        return JobClusterDefinitionDeleteResponseData(is_deleted=True, job_cluster_id=job_cluster_definition_id)

    async def update_metadata(self, body: UpdateMetadataRequest):
        """
        Update or create a metadata entry by name.
        Args:
            body: UpdateMetadataRequest with name, config, and optionally enabled
        Returns:
            The updated metadata entry as a dict
        """
        try:
            obj, created = await Metadata.update_or_create(
                name=body.name,
                defaults={
                    "config": body.config,
                    **({"enabled": body.enabled} if body.enabled is not None else {})
                }
            )
            # Fetch the latest state
            updated = await Metadata.filter(name=body.name).first()
            return {
                "name": updated.name,
                "config": updated.config,
                "enabled": updated.enabled,
                "created_at": str(updated.created_at),
                "updated_at": str(updated.updated_at)
            }
        except Exception as e:
            logger.error(f"Error updating metadata: {str(e)}")
            raise
