import asyncio
import json
import os
from typing import List
import logging

# TODO: Move DD telemetry configuration to environment variables or config file instead of hardcoding
os.environ["DD_TELEMETRY_ENABLED"] = "false"
os.environ["DD_TELEMETRY_DEPENDENCY_COLLECTION_ENABLED"] = "false"

from ddtrace import patch, tracer, patch_all
from fastapi import FastAPI, Header, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from workflow_app_layer.constants.constants import origins
from workflow_core.constants.constants import INACTIVE, \
    RESUMING, ACTIVE, PAUSING, UPDATING_ARTIFACT, CREATING_ARTIFACT
from workflow_core.constants.constants import SUCCESS, CLUSTER_NAME_ALREADY_EXISTS_ERROR, CREATION_FAILED
from workflow_core.entity.events_entities import WorkflowState
from workflow_core.error.errors import WorkflowNotFound, RunNotFoundException, TaskNotFoundException, \
    JobClusterNotFoundException, InvalidWorkflowException, UpdateWorkflowException, WorkflowNotActiveException, \
    ClusterNotFoundException, RepairRunException, RunNotInRunningStateException
from workflow_core.orchestrator.workflow_deployer import WorkflowDeployer
from workflow_core.utils.logging_util import get_logger
from workflow_core.utils.validation_utils import validate_workflow
from workflow_core.utils.workflow_utils import error_handler, create_workflow_event, publish_event

# Initialize logger early so we can use it for error handling
logger = get_logger(__name__)
from workflow_core.v3.service.task_run_service import TaskRunService
from workflow_core.v3.service.workflow_run_service_v3 import WorkflowRunV3Impl
from workflow_core.v3.service.workflow_service_v3 import WorkflowCoreV3Impl
from workflow_core.workflow_core_impl import WorkflowCoreImpl
from workflow_model.constants.constants import DEFAULT_SCHEDULE
from workflow_model.job_cluster import CheckUniqueJobClusterRequest, \
    UpdateJobClusterDefinitionRequest, CreateJobClusterDefinitionRequest
from workflow_model.requests import WorkflowsPostRequest, CheckUniqueWorkflowNamePostRequest, UpdateWorkflowTagsRequest, \
    RetrieveWorkflowRunsRequest, PostRunDetailsRequest, PostTaskDetailsRequest, PostTaskRequest, \
    StopRunWorkflowIdPutRequest, WorkflowIdRequest, UpdateWorkflowScheduleRequest, \
    UpdateWorkflowMaxConcurrentRunsRequest, UpdateWorkflowRetriesRequest, TriggerWithParamsRequest, CallbackRequest, \
    JobClusterDefinitionListRequest, InsertWorkflowRunRequest, UpdateWorkflowRunRequest, MissedWorkflowRunRequest, \
    InsertUpdateWorkflowRunRequest, MetadataRequest, UpdateWorkflowStatusRequest, SearchRequest, UpdateMetadataRequest
from workflow_model.response import CreateWorkflowResponse, WorkflowsPostResponse, CheckUniqueWorkflowNamePostResponse, \
    FiltersGetResponse, WorkflowWorkflowIdDeleteResponse, RecentlyVisitedGetResponse, \
    PauseScheduleWorkflowIdPutResponse, ResumeScheduleWorkflowIdPutResponse, StopRunWorkflowIdPutResponse, \
    RunNowWorkflowIdPutResponse, WorkflowWorkflowIdGetResponse, UpdateWorkflowTagsResponse, \
    RetrieveWorkflowRunsResponse, DownloadWorkflowYamlResponse, RetrieveRunDetailsResponse, TaskDetailsResponse, \
    WorkflowTasksResponse, HealthCheckResponse, UpdateWorkflowResponse, WorkflowIdResponse, \
    CheckUniqueJobClusterResponse, \
    CreateJobClusterDefinitionResponse, \
    UpdateJobClusterDefinitionResponse, JobClusterDetailsResponse, JobClusterDefinitionListResponse, \
    WorkflowTaskClusterResponse, UpdateWorkflowScheduleResponse, \
    UpdateWorkflowMaxConcurrentRunsResponse, UpdateWorkflowRetriesResponse, TriggerWithParamsResponse, \
    TriggerStatusResponse, TaskDetailsResponseV2, CallbackResponse, ClusterWorkflowResponse, \
    ResumeScheduleWorkflowIdPutResponseData, PauseScheduleWorkflowIdPutResponseData, RepairRunResponse, \
    RetrieveRunDetailsResponseV2, RetrieveWorkflowRunsResponseV2, TaskDetailsResponseV3, InsertWorkflowRunResponse, \
    UpdateWorkflowRunResponse, DarwinWorkflowRunResponse, WorkflowRunResponse, MetadataResponse, WorkflowListDataV2, \
    RunNowWorkflowRequest, JobClusterDefinitionDeleteResponse, UpdateWorkflowStatusResponseData, \
    UpdateWorkflowStatusResponse, UpdateMetadataResponse
from workflow_model.workflow import CreateWorkflowRequest, UpdateWorkflowRequest, \
    WorkflowTaskClusterRequest, Workflow, convert_workflow_to_update_request, RepairRunRequest, \
    WorkflowTaskClusterRequestV2

# Import V3 router
from workflow_app_layer.v3.workflow_api import router as v3_router, setup_v3_router
from workflow_app_layer.v3.workflow_run_api import runs_router as v3_runs_router, setup_v3_runs_router
from workflow_app_layer.v3.task_run_api import task_runs_router as v3_tasks_router, setup_v3_task_runs_router

# Create FastAPI app (use print for early initialization since logger might not be ready)
print("Creating FastAPI app...")
root_path = os.environ.get("ROOT_PATH", "")
app = FastAPI(
    title='Workflow APIs',
    version='1.0.0',
    debug=True,
    root_path=root_path,
)
print("✅ FastAPI app created")

# Patch with ddtrace
try:
    print("Patching with ddtrace...")
    patch_all()
    print("✅ ddtrace patching completed")
except Exception as e:
    print(f"⚠️  ddtrace patching failed (non-critical): {e}")

# Print environment variables at startup for staging/dev
if os.getenv("ENV", "stag") in ["stag", "dev"]:
    print("--- ENVIRONMENT VARIABLES AT STARTUP ---")
    for k, v in os.environ.items():
        print(f"{k}={v}")
    print("--- END ENVIRONMENT VARIABLES ---")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Lets keep it centralized. A lot of places, the same line is being used.
env = 'stag' if os.getenv("ENV", "stag") in ['dev', 'stag'] else os.getenv("ENV")

wf_core = WorkflowCoreImpl(env)
# Logger already initialized above

log_file_root = '/var/www/fsx/workspace/workflows/logs'

# Static files mounting - skip if directories don't exist (local development)
if not os.getenv("DEV"):
    import os.path
    if os.path.exists(log_file_root):
        app.mount("/static", StaticFiles(directory=log_file_root), name="static")
    elif os.path.exists("static"):
        app.mount("/static", StaticFiles(directory="static"), name="static")
    else:
        print(f"⚠️  Static files directory not found - skipping static file serving (OK for local dev)")

try:
    wf_core.darwin_workflow_dao.init_db(app)
    logger.info("✅ Database initialization completed")
except Exception as e:
    logger.error(f"❌ Database initialization failed: {e}", exc_info=True)
    raise

# Global exception handler to capture all errors with stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    span = tracer.current_span()
    if span:
        span.error = True
        span.set_tag("error.message", str(exc))
        span.set_tag("error.type", type(exc).__name__)
    return error_handler(str(exc))

# Setup and include V3 router
# Pass env explicitly to ensure it's set correctly
try:
    logger.info("Setting up V3 routers...")
    setup_v3_router(WorkflowCoreV3Impl(env=env))
    setup_v3_runs_router(WorkflowRunV3Impl(env=env))
    setup_v3_task_runs_router(TaskRunService())
    logger.info("✅ V3 routers setup completed")
except Exception as e:
    logger.error(f"❌ V3 router setup failed: {e}", exc_info=True)
    raise

app.include_router(v3_router)
app.include_router(v3_runs_router)
app.include_router(v3_tasks_router)

@app.on_event("startup")
async def startup():
    try:
        logger.info("Starting database initialization in startup event...")
        await wf_core.darwin_workflow_dao.init_tortoise()
        logger.info("✅ Tortoise initialization completed in startup")
    except Exception as e:
        logger.error(f"❌ Tortoise initialization failed: {e}", exc_info=True)
        # Don't raise - allow app to start even if migrations fail
        pass
    
    try:
        await wf_core.initialize_db()
        logger.info("✅ Airflow database connection pool initialized")
    except Exception as e:
        logger.warning(f"⚠️  Airflow database initialization failed (this is OK if Airflow is not available): {e}")
        # Don't raise - allow app to start even if Airflow DB is not available
        pass
    
    try:
        from workflow_core.artifactory.s3_artifactory import S3Artifactory
        s3_artifactory = S3Artifactory()
        s3_artifactory.ensure_bucket_exists()
        logger.info("✅ S3 bucket initialization completed")
    except Exception as e:
        logger.warning(f"⚠️  S3 bucket initialization failed (this is OK if S3 is not available): {e}")
        # Don't raise - allow app to start even if S3 is not available
        pass


@app.on_event("shutdown")
async def close():
    await wf_core.darwin_workflow_dao.close_tortoise()

@app.get('/healthcheck')
@app.get('/health')
def health_check():
    try:
        wf_core.health_check_core()
        return {"status": "SUCCESS", "message": "OK"}
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get("/health/deep")
async def deep_health_check():
    return await wf_core.deep_healthcheck()


@app.post('/workflow_id', response_model=WorkflowIdResponse,
          responses={
              200: {"description": "Workflow ID retrieved successfully"},
              404: {"description": "Workflow not found"},
              500: {"description": "Internal Server Error"}
          }
          )
async def workflow_id(
        body: WorkflowIdRequest
) -> WorkflowIdResponse:
    try:
        resp = await wf_core.find_workflow_id_async(workflow_name=body.workflow_name)
        return resp
    except WorkflowNotFound as err:
        return error_handler(err.__str__(), 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/check_unique_workflow_name',
    response_model=CheckUniqueWorkflowNamePostResponse,
    tags=['Workflow Create/Delete'],
    responses={
            200: {"description": "Checked workflow name uniqueness"},
            500: {"description": "Internal Server Error"}
        }
)
async def post_check_unique_workflow_name(
        body: CheckUniqueWorkflowNamePostRequest,
        msd_user: str = Header(..., alias='msd-user')
) -> CheckUniqueWorkflowNamePostResponse:
    """
    Checks if a workflow name is unique.
    -- checks in Elasticsearch for existing workflow name
    """
    try:
        data = await wf_core.check_unique_name(body)
        return CheckUniqueWorkflowNamePostResponse(data=data)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get(
    '/recently_visited',
    response_model=RecentlyVisitedGetResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Recently visited workflows retrieved successfully"},
        500: {"description": "Internal Server Error"}
    }
)
async def get_recently_visited(
        msd_user: str = Header(..., alias='msd-user')
) -> RecentlyVisitedGetResponse:
    """
    Retrieves the recently visited workflows by the users.
    -- retrieve from the sql db that records each action of the user.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.recently_visited_workflows(msd_user_dict['id'])
        return RecentlyVisitedGetResponse(data=data)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/v2/workflow', response_model=CreateWorkflowResponse, tags=['Workflow Create/Delete'],
    responses={
            200: {"description": "Workflow created successfully"},
            400: {"description": "Invalid workflow request"},
            500: {"description": "Internal Server Error"}
        }
)
async def post_workflow_v2(
        body: CreateWorkflowRequest,
        background_tasks: BackgroundTasks,
        msd_user: str = Header(..., alias='msd-user')
) -> CreateWorkflowResponse:
    """
    Creates a workflow.
    -- create a workflow in the elasticsearch entry
    -- we may need to deploy the workflow in Airflow
    """
    try:
        # if wf_core.check_if_end_date_has_passed(body.end_date):
        #     raise InvalidWorkflowException("End date has passed. Please select a future date.")

        if not body.display_name:
            body.display_name = body.workflow_name
        if not wf_core.check_unique_display_name_bool(
                CheckUniqueWorkflowNamePostRequest(name=body.workflow_name)).unique:
            raise InvalidWorkflowException("Workflow name already exist. Please use a different name.")
        msd_user_dict = json.loads(msd_user)
        validate_workflow(body)
        status, data = await wf_core.create_workflow_v2(body, user_email=msd_user_dict['email'])
        if body.workflow_status == INACTIVE:
            body.schedule = DEFAULT_SCHEDULE
        background_tasks.add_task(deployable_workflow, request=body, user_email=msd_user_dict['email'])
        if status == SUCCESS:
            return CreateWorkflowResponse(status="SUCCESS", data=data)
        else:
            return error_handler(f"failed to register the dag in system, "
                                 f"dag created in the airflow due to error {status}")
    except InvalidWorkflowException as err:
        return error_handler(err.message, 400)
    except Exception as err:
        import traceback
        logger.error(traceback.format_exc())
        logger.error(err.__str__())
        return error_handler(traceback.format_exc())





# TODO: Refactor deployable_workflow and deployable_update_workflow into a single function with mode parameter
# TODO: The deployment logic (create_dag -> deploy -> activate) is duplicated across create/update paths
def deployable_workflow(request: CreateWorkflowRequest, user_email: str):
    # TODO: Replace debug file logging with proper structured logging
    # TODO: This debug log writes to /tmp which may not exist in all environments
    def log_debug(msg):
        try:
            with open("/tmp/workflow_debug.log", "a") as f:
                from datetime import datetime
                timestamp = datetime.now().isoformat()
                f.write(f"[{timestamp}] {msg}\n")
                f.flush()
        except:
            pass
    
    try:
        log_debug(f'[DEPLOY_START] Starting deployment for "{request.workflow_name}"')
        deployer = WorkflowDeployer(env=env)
        deployer.create_dag(request=request, user_email=user_email)
        log_debug(f'[DEPLOY_DAG_CREATED] DAG created for "{request.workflow_name}", calling deploy_v2()')
        status = asyncio.run(deployer.deploy_v2())
        log_debug(f'[DEPLOY_V2_DONE] deploy_v2() returned {status} for "{request.workflow_name}"')
        if not status:
            log_debug(f'[DEPLOY_FAILED] Deployment failed for "{request.workflow_name}", marking as creation_failed')
            workflow_response = wf_core.find_workflow_id(request.workflow_name)
            workflow_id = workflow_response.workflow_id
            wf_core.update_workflow_status(workflow_id, CREATION_FAILED)
            return
        log_debug(f'[DEPLOY_SUCCESS] Deployment successful for "{request.workflow_name}", calling activate_dag_v2()')
        if request.workflow_status == INACTIVE:
            result = wf_core.activate_dag_v2(request.workflow_name, INACTIVE)
            log_debug(f'[ACTIVATE_DONE] activate_dag_v2(INACTIVE) completed for "{request.workflow_name}"')
            return result
        result = wf_core.activate_dag_v2(request.workflow_name)
        log_debug(f'[ACTIVATE_DONE] activate_dag_v2(ACTIVE) completed for "{request.workflow_name}"')
        return result
    except Exception as err:
        log_debug(f'[DEPLOY_EXCEPTION] Exception in deployable_workflow for "{request.workflow_name}": {err}')
        logger.error(err.__str__())
        # Update workflow status to CREATION_FAILED on exception
        try:
            workflow_response = wf_core.find_workflow_id(request.workflow_name)
            workflow_id = workflow_response.workflow_id
            wf_core.update_workflow_status(workflow_id, CREATION_FAILED)
        except Exception as update_err:
            logger.error(f"Failed to update workflow status: {update_err}")
        return error_handler(err.__str__())


# TODO: No error handling for DAG update failures - should update workflow status to UPDATE_FAILED on exception
# TODO: Missing event publishing for workflow update success/failure (similar to create path)
def deployable_update_workflow(request: UpdateWorkflowRequest, user_email: str, last_parsed_time: str, workflow_id: str,
                               workflow_status: str):
    deployer = WorkflowDeployer(env=env)
    deployer.create_dag(request=request, user_email=user_email)
    asyncio.run(deployer.update_dag(last_parsed_time))
    if workflow_status == INACTIVE or workflow_status == PAUSING:
        return wf_core.activate_dag_v2(request.workflow_name, INACTIVE)
    return wf_core.activate_dag_v2(request.workflow_name)


@app.put(
    '/workflow/{workflow_id}', response_model=UpdateWorkflowResponse, tags=['Workflow Create/Delete'],
    responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowResponse},
        400: {"description": "Invalid workflow request"},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_update_workflow(
        body: UpdateWorkflowRequest,
        background_tasks: BackgroundTasks,
        workflow_id: str = ...,
        msd_user: str = Header(..., alias='msd-user')
) -> UpdateWorkflowResponse:
    """
    Updates a workflow.
    -- Updates a workflow in the elasticsearch entry
    """
    try:
        if not body.display_name:
            body.display_name = body.workflow_name
        find_resp = wf_core.get_workflow_by_id(workflow_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound("Workflow doesn't exist")
        validate_workflow(body, find_resp.data[0])
        existing_user_email = find_resp.data[0].created_by
        workflow_status = find_resp.data[0].workflow_status

        if body.workflow_status not in [ACTIVE, INACTIVE, ""]:
            raise Exception(f"Workflow Status should be {ACTIVE} or {INACTIVE}, not {body.workflow_status}")
        if workflow_status in [RESUMING, PAUSING, UPDATING_ARTIFACT]:
            raise Exception(f"Cannot Update the workflow as it is in the process of {workflow_status} the artifact")

        dag = wf_core.get_dag_from_airflow(find_resp.data[0].workflow_name)
        last_parsed_time = dag["last_parsed_time"]
        status, data = await wf_core.update_workflow_v2(body, workflow_id, existing_user_email)
        if workflow_status == INACTIVE and body.workflow_status != ACTIVE:
            body.schedule = DEFAULT_SCHEDULE

        # Start date / End date should not be modified to None
        body.start_date = data.start_date
        body.end_date = data.end_date

        background_tasks.add_task(
            deployable_update_workflow,
            request=body,
            user_email=existing_user_email,
            last_parsed_time=last_parsed_time,
            workflow_id=workflow_id,
            workflow_status=workflow_status
        )
        if status == SUCCESS:
            return UpdateWorkflowResponse(status="SUCCESS", data=data)
        else:
            return error_handler("failed to update the dag in system, dag was updated in the airflow")
    except WorkflowNotFound as err:
        return error_handler(err.__str__(), 404)
    except InvalidWorkflowException as err:
        return error_handler(err.__str__(), status_code=400)
    except Exception as err:
        import traceback
        logger.error(traceback.format_exc())
        logger.error(err.__str__())
        return error_handler(traceback.format_exc())


# TODO: put_update_workflow and put_update_workflow_v2 are nearly identical - consolidate
# TODO: The only difference is how workflow_status is handled in background_tasks.add_task
@app.put(
    '/v2/workflow/{workflow_id}', response_model=UpdateWorkflowResponse, tags=['Workflow Create/Delete'],
        responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowResponse},
        400: {"description": "Invalid workflow request"},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_update_workflow_v2(
        body: UpdateWorkflowRequest,
        background_tasks: BackgroundTasks,
        workflow_id: str = ...,
        msd_user: str = Header(..., alias='msd-user')
) -> UpdateWorkflowResponse:
    """
    Updates a workflow.
    -- Updates a workflow in the elasticsearch entry
    """
    try:
        if not body.display_name:
            body.display_name = body.workflow_name
        find_resp = wf_core.get_workflow_by_id(workflow_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound("Workflow doesn't exist")
        validate_workflow(body, find_resp.data[0])
        existing_user_email = find_resp.data[0].created_by
        workflow_status = find_resp.data[0].workflow_status

        if body.workflow_status not in [ACTIVE, INACTIVE, ""]:
            raise Exception(f"Workflow Status should be {ACTIVE} or {INACTIVE}, not {body.workflow_status}")
        if workflow_status in [RESUMING, PAUSING, UPDATING_ARTIFACT]:
            raise Exception(f"Cannot Update the workflow as it is in the process of {workflow_status} the artifact")

        dag = wf_core.get_dag_from_airflow(find_resp.data[0].workflow_name)
        last_parsed_time = dag["last_parsed_time"]
        status, data = await wf_core.update_workflow_v2(body, workflow_id, existing_user_email)
        if workflow_status == INACTIVE and body.workflow_status != ACTIVE:
            body.schedule = DEFAULT_SCHEDULE

        # Start date / End date should not be modified to None
        body.start_date = data.start_date
        body.end_date = data.end_date

        workflow_status = workflow_status if body.workflow_status == "" else body.workflow_status
        background_tasks.add_task(
            deployable_update_workflow,
            request=body,
            user_email=existing_user_email,
            last_parsed_time=last_parsed_time,
            workflow_id=workflow_id,
            workflow_status=workflow_status
        )
        if status == SUCCESS:
            return UpdateWorkflowResponse(status="SUCCESS", data=data)
        else:
            return error_handler("failed to update the dag in system, dag was updated in the airflow")
    except WorkflowNotFound as err:
        return error_handler(err.__str__(), 404)
    except InvalidWorkflowException as err:
        return error_handler(err.__str__(), status_code=400)
    except UpdateWorkflowException as err:
        return error_handler(err.__str__(), status_code=400)
    except Exception as err:
        import traceback
        logger.error(traceback.format_exc())
        logger.error(err.__str__())
        return error_handler(traceback.format_exc())


@app.post(
    '/workflows',
    response_model=WorkflowsPostResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Successfully retrieved workflows", "model": WorkflowsPostResponse},
        500: {"description": "Internal server error"}
    }

)
async def post_workflows(
        body: WorkflowsPostRequest,
        msd_user: str = Header(..., alias='msd-user')) -> WorkflowsPostResponse:
    """
    Searches and retrieves workflows based on the provided parameters.
    -- searches in elasticsearch and return the data
    """
    try:
        total, data = await wf_core.search_workflows_v2_optimised(body)
        return WorkflowsPostResponse(
            result_size=total,
            page_size=body.page_size,
            offset=body.offset,
            data=data
        )
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())

@app.get("/workflows", response_model=List[WorkflowListDataV2])
async def fetch_workflows(cluster_id: str = Query(..., description="Cluster ID to search workflows for")):
    """
    Fetch workflows attached to a specific cluster ID.

    This endpoint queries workflows that are associated with the given cluster ID.

    Args:
        cluster_id (str): The unique ID of the cluster for which workflows need to be fetched.

    Returns:
        List[WorkflowListDataV2]: A list of workflows associated with the provided cluster ID.
    """
    # Fetch workflows linked to the specified cluster_id
    workflows = wf_core.get_workflows_by_cluster_id(cluster_id)

    # Return the list of workflows serialized into WorkflowListDataV2 model
    return workflows


@app.post(
    '/v2/workflows',
    response_model=WorkflowsPostResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Successfully retrieved workflows", "model": WorkflowsPostResponse},
        500: {"description": "Internal server error"}
    }
)
async def get_all_workflows(
        body: WorkflowsPostRequest,
        msd_user: str = Header(..., alias='msd-user')) -> WorkflowsPostResponse:
    """
    Searches and retrieves workflows based on the provided parameters.
    -- searches in elasticsearch and return the data
    """
    try:
        total, data = await wf_core.search_workflows_v2_optimised(body)
        return WorkflowsPostResponse(
            result_size=total,
            page_size=body.page_size,
            offset=body.offset,
            data=data
        )
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get('/filters/', response_model=FiltersGetResponse, tags=['Workflow Listing'],
         responses={
             200: {"description": "Successfully retrieved list of filters", "model": FiltersGetResponse},
             500: {"description": "Internal server error"}
         }
         )
def get_filters(msd_user: str = Header(..., alias='msd-user')) -> FiltersGetResponse:
    """
    Returns a list of filters for workflow listing.
    -- list of filters available for the UI.
    """
    try:
        return FiltersGetResponse(data=wf_core.get_filters())
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.delete(
    '/workflow/{workflow_id}',
    response_model=WorkflowWorkflowIdDeleteResponse,
    tags=['Workflow Listing'],
    responses={
                 200: {"description": "Successfully deleted a workflow", "model": WorkflowWorkflowIdDeleteResponse},
                 404: {"description": "Workflow not found"},
                 500: {"description": "Internal server error"}
             }
)
async def delete_workflow_workflow_id(
        msd_user: str = Header(..., alias='msd-user'), workflow_id: str = ...
) -> WorkflowWorkflowIdDeleteResponse:
    """
    Soft deletes a workflow.
    -- soft delete the workflow details in the elasticsearch
    -- we may need to delete the workflow from Airflow
    """
    try:
        data = await wf_core.soft_delete_workflow_by_id(workflow_id)
        return WorkflowWorkflowIdDeleteResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/pause_schedule/{workflow_id}',
    response_model=PauseScheduleWorkflowIdPutResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Workflow successfully updated", "model": PauseScheduleWorkflowIdPutResponse},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
def put_pause_schedule_workflow_id(
        background_tasks: BackgroundTasks,
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
) -> PauseScheduleWorkflowIdPutResponse:
    """
    Pauses a specific workflow identified by the workflow_id.
    -- pause the workflow in Airflow.
    -- update the status of the workflow in Elasticsearch.
    """
    try:
        find_resp = wf_core.get_workflow_by_id(workflow_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound("Workflow doesn't exist")
        wf: Workflow = find_resp.data[0]

        if wf.workflow_status in [UPDATING_ARTIFACT, CREATING_ARTIFACT]:
            raise Exception("Cannot pause the workflow as it is in the process of updating the artifact")

        data = wf_core.pause_workflow(wf)
        if data.workflow_status == ACTIVE:
            raise Exception("Failed to pause the workflow")

        update_request = convert_workflow_to_update_request(wf)
        dag = wf_core.get_dag_from_airflow(find_resp.data[0].workflow_name)
        last_parsed_time = dag["last_parsed_time"]

        wf_core.update_workflow_status(workflow_id, PAUSING)
        update_request.schedule = DEFAULT_SCHEDULE
        background_tasks.add_task(
            deployable_update_workflow,
            request=update_request,
            user_email=wf.created_by,
            last_parsed_time=last_parsed_time,
            workflow_id=workflow_id,
            workflow_status=PAUSING,
        )

        event = create_workflow_event(
            workflow_id,
            WorkflowState.WORKFLOW_PAUSED,
            {"workflow_name": wf.workflow_name}
        )
        # TODO: publish_event is a blocking call that can hang API responses - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=workflow_id, event=event)
        return PauseScheduleWorkflowIdPutResponse(
            data=PauseScheduleWorkflowIdPutResponseData(
                workflow_id=wf.workflow_id,
                workflow_status=PAUSING
            )
        )
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/resume_schedule/{workflow_id}',
    response_model=ResumeScheduleWorkflowIdPutResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Workflow successfully updated", "model": ResumeScheduleWorkflowIdPutResponse},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
def put_resume_schedule_workflow_id(
        background_tasks: BackgroundTasks,
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...
) -> ResumeScheduleWorkflowIdPutResponse:
    """
    Resumes a specific workflow (schedule) identified by the workflow_id that was previously paused.
    -- resume the workflow in Airflow.
    -- update the status of the workflow in Elasticsearch.
    """
    try:
        find_resp = wf_core.get_workflow_by_id(workflow_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound("Workflow doesn't exist")
        wf: Workflow = find_resp.data[0]

        if wf.workflow_status in [UPDATING_ARTIFACT, CREATING_ARTIFACT]:
            raise Exception("Cannot resume the workflow as it is in the process of updating the artifact")

        update_request = convert_workflow_to_update_request(wf)
        dag = wf_core.get_dag_from_airflow(find_resp.data[0].workflow_name)
        last_parsed_time = dag["last_parsed_time"]
        wf_core.update_workflow_status(workflow_id, RESUMING)
        update_request.schedule = wf.schedule
        background_tasks.add_task(
            deployable_update_workflow,
            request=update_request,
            user_email=wf.created_by,
            last_parsed_time=last_parsed_time,
            workflow_id=workflow_id,
            workflow_status=RESUMING,
        )
        event = create_workflow_event(
            wf.workflow_id,
            WorkflowState.WORKFLOW_RESUMED,
            {"workflow_name": wf.workflow_name}
        )
        # TODO: publish_event is a blocking call that can hang API responses - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(workflow_id=wf.workflow_id, event=event)
        return ResumeScheduleWorkflowIdPutResponse(
            data=ResumeScheduleWorkflowIdPutResponseData(
                workflow_id=wf.workflow_id,
                workflow_status=RESUMING
            )
        )
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/run_now/{workflow_id}',
    response_model=RunNowWorkflowIdPutResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Workflow successfully updated", "model": RunNowWorkflowIdPutResponse},
        400: {"description": "Invalid workflow request"},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_run_now_workflow_id(
        body: RunNowWorkflowRequest,
        msd_user: str = Header(..., alias='msd-user'), workflow_id: str = ...,
) -> RunNowWorkflowIdPutResponse:
    """
    Runs a workflow immediately.
    -- Run the workflow in Airflow.
    -- update the status of the workflow in Elasticsearch.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        parameters = body.parameters
        data = await wf_core.run_now_workflow(workflow_id, msd_user_dict['email'], parameters)
        return RunNowWorkflowIdPutResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except WorkflowNotActiveException as err:
        return error_handler(err.message, 400)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/stop_run/{workflow_id}',
    response_model=StopRunWorkflowIdPutResponse,
    tags=['Workflow Listing'],
    responses={
        200: {"description": "Workflow successfully updated", "model": StopRunWorkflowIdPutResponse},
        400: {"description": "Run is not in running state"},
        404: {"description": "Workflow not found / run not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_stop_run_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: StopRunWorkflowIdPutRequest = ...
) -> StopRunWorkflowIdPutResponse:
    """
    Stops a specific run of a workflow identified by the workflow_id.
    -- stop the workflow in the airflow.
    -- update the status of the workflow in the elasticsearch.
    """
    try:
        logger.info(f"Stopping run /stop_run/ {body.run_id} for workflow {workflow_id}")
        data = await wf_core.stop_run_workflow(workflow_id, run_id=body.run_id)
        return StopRunWorkflowIdPutResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except RunNotInRunningStateException as err:
        return error_handler(err.message, 400)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get(
    '/workflow/{workflow_id}',
    response_model=WorkflowWorkflowIdGetResponse,
    tags=['Workflow/Run Details'],
responses={
        200: {"description": "Successfully retrieved workflow details", "model": WorkflowWorkflowIdGetResponse},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_workflow_workflow_id(
        msd_user: str = Header(..., alias='msd-user'), workflow_id: str = ...
) -> WorkflowWorkflowIdGetResponse:
    """
    Get a workflow.
    -- gets the workflow details in the elasticsearch
    """
    try:
        msd_user_dict = json.loads(msd_user)
        logger.info(f"msd_user_dict: {msd_user_dict}")
        data = await wf_core.get_workflow_by_workflow_id_v2(workflow_id=workflow_id, user_id=msd_user_dict['email'])
        logger.info(f"response from get_workflow_workflow_id with workflow id {workflow_id}: {data}")
        return WorkflowWorkflowIdGetResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        import traceback
        traceback.print_exc()
        logger.exception(err.__str__())
        return error_handler(err.__str__())


# TODO: get_workflow_workflow_id and get_workflow_by_workflow_id are identical - remove duplicate endpoint
@app.get(
    '/v2/workflow/{workflow_id}',
    response_model=WorkflowWorkflowIdGetResponse,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Successfully retrieved workflow details", "model": WorkflowWorkflowIdGetResponse},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }

)
async def get_workflow_by_workflow_id(
        msd_user: str = Header(..., alias='msd-user'), workflow_id: str = ...
) -> WorkflowWorkflowIdGetResponse:
    """
    Get a workflow.
    -- gets the workflow details in the elasticsearch
    """
    try:
        msd_user_dict = json.loads(msd_user)
        logger.info(f"msd_user_dict: {msd_user_dict}")
        data = await wf_core.get_workflow_by_workflow_id_v2(workflow_id=workflow_id, user_id=msd_user_dict['email'])
        logger.info(f"response from get_workflow_workflow_id with workflow id {workflow_id}: {data}")
        return WorkflowWorkflowIdGetResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        import traceback
        traceback.print_exc()
        logger.exception(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/tags/{workflow_id}',
    response_model=UpdateWorkflowTagsResponse,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowTagsResponse},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_tags_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: UpdateWorkflowTagsRequest = ...,
) -> UpdateWorkflowTagsResponse:
    """
    Updates the tags of a specific workflow identified by its ID.
    """
    try:
        data = await wf_core.update_workflow_tags(workflow_id=workflow_id, body=body)
        return UpdateWorkflowTagsResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/schedule/{workflow_id}',
    response_model=UpdateWorkflowScheduleResponse,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowScheduleResponse},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_schedule_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: UpdateWorkflowScheduleRequest = ...,
) -> UpdateWorkflowScheduleResponse:
    """
    Updates the schedule of a specific workflow identified by its ID.
    """
    try:
        wf, workflow_request = await wf_core.get_create_workflow_req(workflow_id=workflow_id)
        workflow_request.schedule = body.schedule if body.schedule != "" else DEFAULT_SCHEDULE

        if wf.workflow_status in [RESUMING, PAUSING, UPDATING_ARTIFACT, CREATING_ARTIFACT]:
            raise Exception(f"Cannot Update the workflow as it is in the process of {wf.workflow_status} the artifact")

        if wf.workflow_status == ACTIVE:
            msd_user_dict = json.loads(msd_user)
            deployer = WorkflowDeployer(env=env)
            deployer.create_dag(request=workflow_request, user_email=msd_user_dict['email'])
            deployer.deploy()
        data = await wf_core.update_workflow_schedule(workflow_id=workflow_id, body=body)
        return UpdateWorkflowScheduleResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return err.__str__()


@app.put(
    '/max_concurrent_runs/{workflow_id}',
    response_model=UpdateWorkflowMaxConcurrentRunsResponse,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowMaxConcurrentRunsResponse},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_max_concurrent_runs_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: UpdateWorkflowMaxConcurrentRunsRequest = ...,
) -> UpdateWorkflowMaxConcurrentRunsResponse:
    """
    Updates the max_concurrent_runs of a specific workflow identified by its ID.
    """
    try:
        wf, workflow = await wf_core.get_create_workflow_req(workflow_id=workflow_id)
        workflow.max_concurrent_runs = body.max_concurrent_runs if body.max_concurrent_runs > 0 else 1
        workflow_status = wf.workflow_status

        if workflow_status in [RESUMING, PAUSING, UPDATING_ARTIFACT, CREATING_ARTIFACT]:
            raise Exception(f"Cannot Update the workflow as it is in the process of {wf.workflow_status} the artifact")

        if workflow_status == INACTIVE:
            workflow.schedule = DEFAULT_SCHEDULE
        msd_user_dict = json.loads(msd_user)
        deployer = WorkflowDeployer(env=env)
        deployer.create_dag(request=workflow, user_email=msd_user_dict['email'])
        resp = deployer.deploy()
        if resp:
            data = await wf_core.update_workflow_max_concurrent_runs(workflow_id=workflow_id, body=body)
            return UpdateWorkflowMaxConcurrentRunsResponse(data=data)
        else:
            raise Exception
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        import traceback
        traceback.print_exc()
        logger.error(err.__str__())
        return err.__str__()


@app.put(
    '/retries/{workflow_id}',
    response_model=UpdateWorkflowRetriesResponse,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowRetriesResponse},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_retries_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: UpdateWorkflowRetriesRequest = ...,
) -> UpdateWorkflowRetriesResponse:
    """
    Updates the retries of a specific workflow identified by its ID.
    """
    try:
        wf, workflow = await wf_core.get_create_workflow_req(workflow_id=workflow_id)
        workflow.retries = body.retries if body.retries >= 0 else 0
        workflow_status = wf.workflow_status

        if workflow_status in [RESUMING, PAUSING, UPDATING_ARTIFACT, CREATING_ARTIFACT]:
            raise Exception(f"Cannot Update the workflow as it is in the process of {wf.workflow_status} the artifact")

        if workflow_status == INACTIVE:
            workflow.schedule = DEFAULT_SCHEDULE
        msd_user_dict = json.loads(msd_user)
        deployer = WorkflowDeployer(env=env)
        deployer.create_dag(request=workflow, user_email=msd_user_dict['email'])
        resp = deployer.deploy()
        if resp:
            data = await wf_core.update_workflow_retries(workflow_id=workflow_id, body=body)
            return UpdateWorkflowRetriesResponse(data=data)
        else:
            raise Exception
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return err.__str__()


@app.post(
    '/runs/{workflow_id}',
    response_model=RetrieveWorkflowRunsResponse,
    tags=['Workflow/Run Details'],
responses={
        200: {"description": "Successfully Retrieved the runs of a specific workflow identified by its ID", "model": RetrieveWorkflowRunsResponse},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def post_runs_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: RetrieveWorkflowRunsRequest = ...,
) -> RetrieveWorkflowRunsResponse:
    """
    Retrieves the runs of a specific workflow identified by its ID.
    """
    try:
        result_size, page_size, offset, data = await wf_core.retrieve_workflow_runs(workflow_id=workflow_id, body=body)
        return RetrieveWorkflowRunsResponse(result_size=result_size, page_size=page_size, offset=offset, data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


# TODO: Function name post_runs_workflow_id is reused for v1 and v2 endpoints - rename to post_runs_workflow_id_v2
@app.post(
    '/v2/runs/{workflow_id}',
    response_model=RetrieveWorkflowRunsResponseV2,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Successfully Retrieved the runs of a specific workflow identified by its ID", "model": RetrieveWorkflowRunsResponseV2},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def post_runs_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: RetrieveWorkflowRunsRequest = ...,
) -> RetrieveWorkflowRunsResponseV2:
    """
    Retrieves the runs of a specific workflow identified by its ID.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        result_size, page_size, offset, data = await wf_core.retrieve_workflow_runs_v3(workflow_id=workflow_id,
                                                                                       body=body,
                                                                                       user_id=msd_user_dict['id'])
        return RetrieveWorkflowRunsResponseV2(result_size=result_size, page_size=page_size, offset=offset, data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get(
    '/yaml/{workflow_id}',
    response_model=DownloadWorkflowYamlResponse,
    tags=['Workflow/Run Details'],
responses={
        200: {"description": "Successfully Downloaded the YAML file of a specific workflow identified by its ID", "model": DownloadWorkflowYamlResponse},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_yaml_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...
) -> DownloadWorkflowYamlResponse:
    """
    Downloads the YAML file of a specific workflow identified by its ID.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_workflow_yaml(workflow_id=workflow_id, user_id=msd_user_dict['id'])
        return DownloadWorkflowYamlResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/run_details/{workflow_id}',
    response_model=RetrieveRunDetailsResponse,
    tags=['Workflow/Run Details'],
    responses={
        200: {"description": "Retrieved the details of a specific run within a workflow", "model": RetrieveRunDetailsResponse},
        404: {"description": "workflow not found/Run not found"},
        500: {"description": "Internal server error"}
    }
)
async def post_run_details_workflow_id_run_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: PostRunDetailsRequest = ...,
) -> RetrieveRunDetailsResponse:
    """
    Retrieves the details of a specific run within a workflow.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_run_details(workflow_id=workflow_id, run_id=body.run_id, user_id=msd_user_dict['id'])
        return RetrieveRunDetailsResponse(data=data)

    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        import traceback
        traceback.print_exc()
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/v2/run_details/{workflow_id}',
    response_model=RetrieveRunDetailsResponseV2,
    tags=['Workflow/Run Details'],
responses={
        200: {"description": "Retrieved the details of a specific run within a workflow", "model": RetrieveRunDetailsResponseV2},
        404: {"description": "Workflow not found/ Run not found"},
        500: {"description": "Internal server error"}
    }
)
async def post_run_details_workflow_id_run_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: PostRunDetailsRequest = ...,
) -> RetrieveRunDetailsResponseV2:
    """
    Retrieves the details of a specific run within a workflow.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_run_details_v2(workflow_id=workflow_id, run_id=body.run_id,
                                                user_id=msd_user_dict['id'])
        return RetrieveRunDetailsResponseV2(data=data)

    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        import traceback
        traceback.print_exc()
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/task_details/{workflow_id}',
    response_model=TaskDetailsResponse,
    tags=['Workflow/Run Details'],
responses={
        200: {"description": "Retrieved the details of a specific task within a workflow", "model": TaskDetailsResponse},
        404: {"description": "workflow not found/ task not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_task_details_workflow_id_run_id_task_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: PostTaskDetailsRequest = ...,
) -> TaskDetailsResponse:
    """
    Retrieves details of a specific task within a workflow run.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_task_details(workflow_id=workflow_id, run_id=body.run_id, task_id=body.task_id,
                                              user_id=msd_user_dict['id'])
        return TaskDetailsResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except TaskNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.exception(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/v2/task_details/{workflow_id}',
    response_model=TaskDetailsResponseV2,
    tags=['Workflow/Run Details'],

responses={
        200: {"description": "Retrieved the details of a specific task within a workflow", "model": TaskDetailsResponseV2},
    400: {"description": "JSON decoding error"},
    404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_task_details(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: PostTaskDetailsRequest = ...,
) -> TaskDetailsResponseV2:
    """
    Retrieves details of a specific task within a workflow run.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_task_details_with_retries(
            workflow_id=workflow_id,
            run_id=body.run_id,
            task_id=body.task_id,
            user_id=msd_user_dict['id']
        )
        return TaskDetailsResponseV2(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except TaskNotFoundException as err:
        return error_handler(err.message, 404)
    except json.JSONDecodeError as json_err:
        logger.exception(f"JSON decoding error: {json_err}")
        raise HTTPException(status_code=400, detail="JSON decoding error: {json_err}")
    except Exception as general_err:
        logger.exception(f"Failed to retrieve task details. Error Msg: {general_err}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task details. Error Msg: {general_err}")


@app.post(
    '/v3/task_details/{workflow_id}',
    response_model=TaskDetailsResponseV3,
    tags=['Workflow/Run Details'],

responses={
        200: {"description": "Retrieved the details of a specific task within a workflow", "model": TaskDetailsResponseV3},
        400: {"description": "JSON decoding error"},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_task_details(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: PostTaskDetailsRequest = ...,
) -> TaskDetailsResponseV3:
    """
    Retrieves details of a specific task within a workflow run.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_task_details_with_retries_v3(
            workflow_id=workflow_id,
            run_id=body.run_id,
            task_id=body.task_id,
            user_id=msd_user_dict['id']
        )
        return TaskDetailsResponseV3(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except TaskNotFoundException as err:
        return error_handler(err.message, 404)
    except json.JSONDecodeError as json_err:
        logger.exception(f"JSON decoding error: {json_err}")
        raise HTTPException(status_code=400, detail="JSON decoding error: {json_err}")
    except Exception as general_err:
        logger.exception(f"Failed to retrieve task details. Error Msg: {general_err}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve task details. Error Msg: {general_err}")


@app.post(
    '/task_details_without_run/{workflow_id}',
    response_model=WorkflowTasksResponse,
    tags=['Workflow/Run Details'],

responses={
        200: {"description": "Retrieved the list of tasks within the workflow", "model": WorkflowTasksResponse},
        404: {"description": "workflow not found / Task not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_task_details_workflow_id(
        msd_user: str = Header(..., alias='msd-user'),
        workflow_id: str = ...,
        body: PostTaskRequest = ...,
) -> WorkflowTasksResponse:
    """
    Retrieves the list of tasks within the workflow.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.get_task_list(workflow_id=workflow_id, task_id=body.task_id, user_id=msd_user_dict['id'])
        return WorkflowTasksResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except TaskNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/check-unique-job-cluster',
    response_model=CheckUniqueJobClusterResponse,
    tags=['Job Cluster Details'],
responses={
        200: {"description": "job cluster name is unique", "model": CheckUniqueJobClusterResponse},
        500: {"description": "Internal server error"}
    }
)
async def check_unique_job_cluster(
        body: CheckUniqueJobClusterRequest
) -> CheckUniqueJobClusterResponse:
    """
    Checks if a job cluster name is unique.
    -- checks in Elasticsearch for existing job cluster name
    """
    try:
        data = await wf_core.check_unique_job_cluster_name(body)
        return CheckUniqueJobClusterResponse(data=data)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post(
    '/job-cluster-definition',
    response_model=CreateJobClusterDefinitionResponse,
    tags=['Job Cluster Details'],
responses={
        200: {"description": "Created a job cluster definition.", "model": CreateJobClusterDefinitionResponse},
        400: {"description": "Cluster name already exists"},
        500: {"description": "Internal server error"}
    }
)
async def create_job_cluster_definition(
        body: CreateJobClusterDefinitionRequest
) -> CreateJobClusterDefinitionResponse:
    """
    Creates a job cluster definition.
    -- create a job cluster definition in the elasticsearch entry
    """
    try:
        status, data = wf_core.create_job_cluster_definition(body)
        if status == CLUSTER_NAME_ALREADY_EXISTS_ERROR:
            raise HTTPException(400, "Cluster name already exists")
        return CreateJobClusterDefinitionResponse(data=data)
    except HTTPException as err:
        return error_handler(err.detail, err.status_code)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put(
    '/job-cluster-definition/{job_cluster_definition_id}',
    response_model=UpdateJobClusterDefinitionResponse,
    tags=['Job Cluster Details'],
    responses={
        200: {"description": "job cluster successfully updated", "model": UpdateJobClusterDefinitionResponse},
        404: {"description": "job cluster not found"},
        500: {"description": "Internal server error"}
    }
)
def update_job_cluster_definition(
        body: UpdateJobClusterDefinitionRequest,
        job_cluster_definition_id: str = ...
) -> UpdateJobClusterDefinitionResponse:
    """
    Updates a job cluster definition.
    -- Updates a job cluster definition in the elasticsearch entry
    """
    try:
        status, data = wf_core.update_job_cluster_definition(body, job_cluster_definition_id)
        return UpdateJobClusterDefinitionResponse(data=data)
    except JobClusterNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())

@app.get(
    '/job-cluster-definitions',
    response_model=JobClusterDefinitionListResponse,
    tags=['Job Cluster Details'],
responses={
        200: {"description": "Retrieved the list of job cluster definitions", "model": JobClusterDefinitionListResponse},
        500: {"description": "Internal server error"}
    }
)
def get_job_cluster_definitions(
    page_size: int = Query(10000, description="Number of items per page"),
    offset: int = Query(0, description="Offset for pagination"),
    query: str = Query(None, description="Search query string")
) -> JobClusterDefinitionListResponse:
    """
    Retrieves the list of job cluster definitions.
    """
    try:
        request = JobClusterDefinitionListRequest(page_size=page_size, offset=offset, query=query)
        data, total_count = wf_core.list_all_job_clusters(request)
        return JobClusterDefinitionListResponse(data=data, total_count = total_count)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())



@app.delete(
    '/job-cluster-definitions/{job_cluster_definition_id}',
    response_model=JobClusterDefinitionDeleteResponse,
    tags=['cluster'],
    responses={
                 200: {"description": "Successfully deleted a Job Cluster Definition", "model": JobClusterDefinitionDeleteResponse},
                 500: {"description": "Internal server error"}
             }
)
def delete_job_cluster_definition_id(
        msd_user: str = Header(..., alias='msd-user'), job_cluster_definition_id: str = ...
) -> JobClusterDefinitionDeleteResponse:
    """
    Soft deletes a job-cluster-definitions.
    -- soft delete the job-cluster-definitions details in the elasticsearch
    """
    try:
        data = wf_core.soft_delete_job_cluster_definition_by_id(job_cluster_definition_id)
        return JobClusterDefinitionDeleteResponse(data=data)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())

@app.post(
    '/v2/job-cluster-definitions',
    response_model=JobClusterDefinitionListResponse,
    tags=['Job Cluster Details'],
    responses={
        200: {"description": "Retrieved the list of job cluster definitions",
              "model": JobClusterDefinitionListResponse},
        500: {"description": "Internal server error"}
    }
)
def get_job_cluster_definitions(request: SearchRequest) -> JobClusterDefinitionListResponse:
    """
    Retrieves the list of job cluster definitions based on the search criteria.

    Args:
        request (SearchRequest): The search parameters sent by the client.

    Returns:
        JobClusterDefinitionListResponse: Contains the list of matched job cluster definitions and the total count.

    Raises:
        HTTPException: Raised with a 500 status code if an unexpected error occurs.
    """
    try:
        # Fetch data and total count from the workflow core service
        data, total_count = wf_core.list_all_job_clusters_v2(request)

        # Return the result in the expected response format
        return JobClusterDefinitionListResponse(data=data, total_count=total_count)

    except Exception as err:
        # Log the error with full traceback
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get(
    '/job-cluster-definitions/{job_cluster_definition_id}',
    response_model=JobClusterDetailsResponse,
    tags=['Job Cluster Details'],
    responses={
        200: {"description": "Retrieved a job cluster definition", "model": JobClusterDefinitionListResponse},
        404: {"description": "Job cluster not found"},
        500: {"description": "Internal server error"}
    }
)
def get_job_cluster_definition(
        job_cluster_definition_id: str = ...
) -> JobClusterDetailsResponse:
    """
    Retrieves a job cluster definition.
    """
    try:
        data = wf_core.get_job_cluster_definition(job_cluster_definition_id)
        return JobClusterDetailsResponse(data=data)
    except JobClusterNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


# TODO: Three get_job_cluster_definitions functions with same name - causes shadowing issues
@app.get(
    '/job-cluster-definitions',
    response_model=JobClusterDefinitionListResponse,
    tags=['Job Cluster Details'],
    responses={
        200: {"description": "Retrieved list of job cluster definitions", "model": JobClusterDefinitionListResponse},
        404: {"description": "Job cluster not found"},
        500: {"description": "Internal server error"}
    }
)
def get_job_cluster_definitions(
) -> JobClusterDefinitionListResponse:
    """
    Retrieves the list of job cluster definitions.
    """
    try:
        data = wf_core.list_all_job_clusters()
        return JobClusterDefinitionListResponse(data=data)
    except JobClusterNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post('/update-workflow-cluster-details',
          response_model=WorkflowTaskClusterResponse,
          tags=['Job Cluster Details'],
          responses={
              200: {"description": "Updated a job cluster definition",
                    "model": JobClusterDefinitionListResponse},
              500: {"description": "Internal server error"}
          }
          )
def update_cluster_details(
        body: WorkflowTaskClusterRequest,
) -> WorkflowTaskClusterResponse:
    """
    Updates a job cluster definition.
    -- Updates a job cluster definition in the elasticsearch entry
    """
    try:
        data = wf_core.update_cluster_details_in_workflow(body)
        return WorkflowTaskClusterResponse(data=data)
    except Exception as err:
        logger.exception(err.__str__())
        return error_handler(err.__str__())


@app.post('/v2/update-workflow-cluster-details',
          response_model=WorkflowTaskClusterResponse,
          tags=['Job Cluster Details'],
          responses={
              200: {"description": "Updated a job cluster definition",
                    "model": WorkflowTaskClusterResponse},
              500: {"description": "Internal server error"}
          }
          )
def update_cluster_details(
        body: WorkflowTaskClusterRequestV2,
) -> WorkflowTaskClusterResponse:
    """
    Updates a job cluster definition.
    -- Updates a job cluster definition in the elasticsearch entry
    """
    try:
        data = wf_core.update_cluster_details_in_workflow_v2(body)
        return WorkflowTaskClusterResponse(data=data)
    except Exception as err:
        logger.exception(err.__str__())
        return error_handler(err.__str__())


@app.post('/trigger/{workflow_name}',
          response_model=TriggerWithParamsResponse,
          responses={
              200: {"description": "Triggered a dag with requested params",
                    "model": TriggerWithParamsResponse},
              404: {"description": "Workflow not found"},
              500: {"description": "Internal server error"}
          }
          )
def trigger_with_params(
        workflow_name: str,
        body: TriggerWithParamsRequest = TriggerWithParamsRequest()
) -> TriggerWithParamsResponse:
    """
    Triggers a dag with requested params.
    """
    try:
        if not wf_core.check_if_workflow_exists(workflow_name):
            raise WorkflowNotFound(f"Workflow {workflow_name} not found")
        run_id = wf_core.trigger_dag_with_params(dag_id=workflow_name, params=body.params)
        return TriggerWithParamsResponse(run_id=run_id)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post('/trigger/workflow/{workflow_id}',
          response_model=TriggerWithParamsResponse,
          responses={
              200: {"description": "Triggered a dag with requested params",
                    "model": TriggerWithParamsResponse},
              404:{"description": "Workflow not found"},
              500: {"description": "Internal server error"}
          }
          )
def trigger_workflow_with_params(
        workflow_id: str,
        body: TriggerWithParamsRequest = TriggerWithParamsRequest()
) -> TriggerWithParamsResponse:
    """
    Triggers a dag with requested params.
    """
    try:
        run_id = wf_core.trigger_workflow_with_params(workflow_id=workflow_id, params=body.params)
        return TriggerWithParamsResponse(run_id=run_id)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get('/status/{workflow_name}/{run_id}',
         response_model=TriggerStatusResponse,
        responses={
              200: {"description": "Retrieves the status of a triggered workflow with params",
          "model": TriggerStatusResponse},
              404:{"description": "Workflow not found"},
              500: {"description": "Internal server error"}
          }
         )
async def get_workflow_status(
        workflow_name: str,
        run_id: str,
) -> TriggerStatusResponse:
    """
    Retrieves the status of a triggered workflow with params.
    """
    try:
        status, logs_url = await wf_core.get_workflow_run_status_and_logs_url(workflow_name, run_id)
        return TriggerStatusResponse(status=status, logs_url=logs_url)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get('/workflows/{workflow_id}/runs/{run_id}/status',
         response_model=TriggerStatusResponse,
         responses={
             200: {"description": "Retrieves the status of a triggered workflow with params",
                   "model": TriggerStatusResponse},
             404: {"description": "Workflow not found"},
             500: {"description": "Internal server error"}
         }
         )
async def get_workflow_run_status(
        workflow_id: str,
        run_id: str,
) -> TriggerStatusResponse:
    """
    Retrieves the status of a triggered workflow with params.
    """
    try:
        print(f"Received request for workflow_id: {workflow_id}, run_id: {run_id}")
        status, logs_url = await wf_core.get_workflow_run_status_and_logs_url_by_id(workflow_id, run_id)
        return TriggerStatusResponse(status=status, logs_url=logs_url)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post('/events', response_model=CallbackResponse,
          responses={
              200: {"description": "Handled events from the workflow engine",
                    "model": CallbackResponse},
              500: {"description": "Internal server error"}
          }
          )
def handle_callback_event(
        body: CallbackRequest
) -> CallbackResponse:
    """
    Handles events from the workflow engine.
    """
    try:
        message = wf_core.handle_event(body.entity_id, body.state, body.timestamp, body.metadata)
        return CallbackResponse(message=message)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.get('/clusters/{clusterId}/workflow', response_model=ClusterWorkflowResponse,
         responses={
             200: {"description": "Retrieved the cluster details of a workflow",
                   "model": ClusterWorkflowResponse},
             404: {"description": "cluster not found"},
             500: {"description": "Internal server error"}
         }
         )
def get_workflow_by_cluster_id(
        clusterId: str,
) -> ClusterWorkflowResponse:
    """
    Retrieves the cluster details of a workflow.
    """
    try:
        data = wf_core.get_workflow_by_cluster_id(clusterId)
        return ClusterWorkflowResponse(data=data)
    except ClusterNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post('/v1/repair_run/{workflow_id}', response_model=RepairRunResponse,
          responses={
              200: {"description": "repaired a run",
                    "model": RepairRunResponse},
              404: {"description": "Workflow not found"},
              400: {"description": "error in repair run"},
              500: {"description": "Internal server error"}
          }
          )
async def repair_run(
        msd_user: str = Header(..., alias='msd-user'),
        body: RepairRunRequest = ...,
        workflow_id: str = ...,
) -> RepairRunResponse:
    """
    Repairs a run.
    """

    try:
        msd_user_dict = json.loads(msd_user)
        data = await wf_core.repair_run(workflow_id=workflow_id, body=body, user_id=msd_user_dict['email'])
        return RepairRunResponse(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except TaskNotFoundException as err:
        return error_handler(err.message, 404)
    except RepairRunException as err:
        return error_handler(err.message, 400)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post("/v1/workflow/{workflow_id}/runs")
async def insert_workflow_run(body: InsertWorkflowRunRequest, workflow_id: str) -> InsertWorkflowRunResponse:
    """
    API to insert a new workflow run into the database.
    """
    try:
        result = await wf_core.create_run(
            workflow_id=workflow_id,
            dag_id=body.dag_id,
            run_id=body.run_id,
            state=body.state,
            expected_run_duration=body.expected_run_duration,
            start_time = body.start_time,
            end_time = body.end_time
        )
        return InsertWorkflowRunResponse(message = "Workflow run inserted successfully", run_id =  result)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.post("/v1/workflow/{workflow_name}/missed_run")
async def insert_missed_run(body: MissedWorkflowRunRequest, workflow_name: str) -> InsertWorkflowRunResponse:
    """
    API to insert a new workflow run into the database.
    """
    try:
        wfid_resp = await wf_core.find_workflow_id_async(workflow_name=workflow_name)
        find_resp = wf_core.get_workflow_by_id(wfid_resp.workflow_id)
        if find_resp is None or find_resp.data is None or len(find_resp.data) == 0:
            raise WorkflowNotFound("Workflow doesn't exist")
        wf: Workflow = find_resp.data[0]
        state= 'queued' if wf.queue_enabled else 'skipped'
        result = await wf_core.create_run(
            workflow_id=wf.workflow_id,
            dag_id=body.dag_id,
            run_id=body.run_id,
            state=state,
            start_time = body.start_time
        )
        return InsertWorkflowRunResponse(message = "Workflow run inserted successfully", run_id =  result)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@app.put("/v1/workflow/{workflow_id}/runs/{run_id}")
async def update_workflow_run(body: UpdateWorkflowRunRequest, workflow_id: str, run_id: str) -> UpdateWorkflowRunResponse:
    """
    Updates the state of a workflow run in the database.
    """
    try:
        workflow_run = await wf_core.update_run(
            workflow_id=workflow_id,
            run_id=run_id,
            state=body.state or None,  # Ensure proper default handling
            end_time=body.end_time or None,
            sla_exceeded=body.sla_exceeded or None,
            repair_time=body.repair_time or None
        )
        if not workflow_run:
            raise ValueError("Workflow run update failed")
        return UpdateWorkflowRunResponse(message="Workflow run updated successfully")
    except Exception as err:
        logger.error(f"Update failed: {err}")
        return error_handler(str(err))


@app.post("/v1/workflow/{workflow_id}/create_and_update_run")
async def create_and_update_workflow_run(body: InsertUpdateWorkflowRunRequest, workflow_id: str) -> InsertWorkflowRunResponse:
    """
    Updates the state of a workflow run in the database.
    """
    try:
        await wf_core.create_and_update_run(
            dag_id=body.dag_id,
            workflow_id=workflow_id,
            run_id=body.run_id,
            state=body.state or None,
            start_time = body.start_time or None,
            end_time=body.end_time or None,
            expected_run_duration = body.expected_run_duration,
            sla_exceeded=body.sla_exceeded or None
        )
        return InsertWorkflowRunResponse(message="Workflow run updated successfully")
    except Exception as err:
        logger.error(f"Update failed: {err}")
        return error_handler(str(err))

@app.get("/v1/workflow/{workflow_id}/runs/{run_id}")
async def get_workflow_run(workflow_id: str, run_id: str) -> DarwinWorkflowRunResponse:
    """
    Get a workflow run in the database.
    """
    try:
        run = await wf_core.get_run_details_from_workflow(workflow_id=workflow_id, run_id=run_id)

        if not run:
            raise RunNotFoundException("Run not found")

        return DarwinWorkflowRunResponse(data=WorkflowRunResponse(**run))

    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)

@app.post(
    '/v2/meta_data',
    response_model=MetadataResponse,
    tags=['Metadata'],
    responses={
        200: {"description": "Successfully retrieved workflow metadata", "model": MetadataResponse},
        500: {"description": "Internal server error"}
    }
)
async def get_workflow_metadata(
    body: MetadataRequest,
    msd_user: str = Header(..., alias='msd-user')
) -> MetadataResponse:
    """
    Get workflow metadata such as trigger rules and other configuration.

    Request body: {"names": ["trigger_rules", "other_config_name"]}
    """
    try:
        msd_user_dict = json.loads(msd_user)
        metadata = await wf_core.get_metadata(names=body.names)

        return MetadataResponse(
            status="success",
            message="",
            data=metadata
        )
    except Exception as err:
        logger.exception("Error retrieving metadata: %s", err)
        return error_handler(str(err), 500)

@app.put(
    '/v2/meta_data',
    response_model=UpdateMetadataResponse,
    tags=['Metadata'],
    responses={
        200: {"description": "Successfully updated workflow metadata", "model": UpdateMetadataResponse},
        500: {"description": "Internal server error"}
    }
)
async def update_workflow_metadata(
    body: UpdateMetadataRequest,
    msd_user: str = Header(..., alias='msd-user')
) -> UpdateMetadataResponse:
    """
    Update workflow metadata such as trigger rules and other configuration.
    """
    try:
        msd_user_dict = json.loads(msd_user)
        updated = await wf_core.update_metadata(body)
        return UpdateMetadataResponse(
            status="success",
            message="",
            data=updated
        )
    except Exception as err:
        logger.exception("Error updating metadata: %s", err)
        return UpdateMetadataResponse(
            status="error",
            message=str(err),
            data={}
        )

@app.put('/workflow/{workflow_id}/status', response_model=UpdateWorkflowStatusResponse)
async def update_workflow_status(workflow_id: str, body: UpdateWorkflowStatusRequest):
    """
    Update the status of a workflow
    """
    try:
        success = wf_core.update_workflow_status(workflow_id, body.status)
        return UpdateWorkflowStatusResponse(
            data=UpdateWorkflowStatusResponseData(success=success),
            message="Workflow status updated successfully" if success else "Failed to update workflow status",
            status="success" if success else "error"
        )
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as e:
        return error_handler(str(e), 500)

@app.get("/v1/workflow/by-dag-id/{dag_id}/runs/{run_id}")
async def get_workflow_run_by_dag_id(dag_id: str, run_id: str) -> DarwinWorkflowRunResponse:
    """
    Get a workflow run in the database using dag_id and run_id.
    """
    try:
        # Find workflow_id by dag_id (display_name/workflow_name)
        wfid_resp = await wf_core.find_workflow_id_async(workflow_name=dag_id)
        workflow_id = wfid_resp.workflow_id
        run = await wf_core.get_run_details_from_workflow(workflow_id=workflow_id, run_id=run_id)
        if not run:
            raise RunNotFoundException("Run not found")
        return DarwinWorkflowRunResponse(data=WorkflowRunResponse(**run))
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except RunNotFoundException as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.error(str(err))
        return error_handler(str(err), 500)
