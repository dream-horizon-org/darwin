import json
from fastapi import APIRouter, Header, BackgroundTasks
from typing import Optional, List

from workflow_core.constants.constants import (
    SUCCESS, INACTIVE
)
from workflow_core.error.errors import (
    InvalidWorkflowException, WorkflowNotFound, 
    UpdateWorkflowException
)
from workflow_core.utils.logging_util import get_logger
from workflow_core.utils.workflow_utils import error_handler
from workflow_model.constants.constants import DEFAULT_SCHEDULE, ACTIVE
from workflow_model.requests import WorkflowsPostRequest
from workflow_model.v3.response import (
    CreateWorkflowResponseV3, UpdateWorkflowResponseV3, 
    WorkflowsPostResponseV3, WorkflowWorkflowIdGetResponseV3, 
    WorkflowWorkflowIdDeleteResponseV3
)
from workflow_model.v3.request import (
    CreateWorkflowRequestV3, UpdateWorkflowRequestV3, WorkflowsGetRequestV3
)
from workflow_app_layer.v3.workflow_background_task_deployer import WorkflowBackgroundTaskDeployer
from workflow_core.v3.service.dag_deployer_service import DeployType
from workflow_model.v3.workflow_run import RunNowWorkflowRequest

# Create router for V3 APIs
router = APIRouter(prefix="/v3", tags=["Workflow V3"])
logger = get_logger(__name__)

background_deployer = WorkflowBackgroundTaskDeployer()


def setup_v3_router(wf_core_v3):
    """
    Setup function to inject dependencies into the V3 router.
    This allows us to access the global objects from main.py
    """
    global wf_core_v3_instance
    wf_core_v3_instance = wf_core_v3


@router.post(
    '/workflow', 
    response_model=CreateWorkflowResponseV3, 
    responses={
        200: {"description": "Workflow created successfully"},
        400: {"description": "Invalid workflow request"},
        500: {"description": "Internal Server Error"}
    }
)
async def post_workflow_v3(
    body: CreateWorkflowRequestV3,
    background_tasks: BackgroundTasks,
    msd_user: str = Header(..., alias='msd-user')
) -> CreateWorkflowResponseV3:
    """
    Creates a new workflow using V3 API contract.
    - Stores workflow configuration in the database
    - Triggers asynchronous DAG creation in Airflow
    """
    try:
        # Parse user info
        msd_user_dict = json.loads(msd_user)
        
        # First try to create the workflow
        status, data = await wf_core_v3_instance.create_workflow_v3(body, user_email=msd_user_dict['email'])
        
        if status == SUCCESS:
            # Only add background task if workflow creation succeeded
            background_tasks.add_task(
                background_deployer.deploy_workflow, 
                request=body, 
                user_email=msd_user_dict['email'],
                deploy_type=DeployType.CREATE
            )
            return CreateWorkflowResponseV3(status="SUCCESS", data=data)
        else:
            return error_handler(status)
    except InvalidWorkflowException as err:
        return error_handler(err.__str__(), status_code=400)
    except Exception as err:
        return error_handler(err.__str__())


@router.put(
    '/workflow/{workflow_id}', 
    response_model=UpdateWorkflowResponseV3,
    responses={
        200: {"description": "Workflow successfully updated", "model": UpdateWorkflowResponseV3},
        400: {"description": "Invalid workflow request"},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def put_update_workflow_v3(
        body: UpdateWorkflowRequestV3,
        background_tasks: BackgroundTasks,
        workflow_id: str = ...,
) -> UpdateWorkflowResponseV3:
    """
    Updates an existing workflow using V3 API contract.
    - Updates workflow configuration in the database
    - Triggers asynchronous DAG update in Airflow
    """
    try:

        
        # Update workflow
        status, data = await wf_core_v3_instance.update_workflow_v3(body, workflow_id)

        if status == SUCCESS:
            workflow_status = body.workflow_status if body.workflow_status else data.workflow_status
            background_tasks.add_task(
                background_deployer.deploy_workflow,
                request=body,
                user_email=data.created_by,
                workflow_id=workflow_id,
                workflow_status=workflow_status,
                deploy_type=DeployType.UPDATE
            )
            return UpdateWorkflowResponseV3(status="SUCCESS", data=data)
        else:
            return error_handler("failed to update the dag in system")

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


@router.get(
    '/workflows',
    response_model=WorkflowsPostResponseV3,
    responses={
        200: {"description": "Successfully retrieved workflows", "model": WorkflowsPostResponseV3},
        500: {"description": "Internal server error"}
    }
)
async def get_all_workflows_v3(
        query: str = "",
        user_filters: Optional[List[str]] = None,
        status_filters: Optional[List[str]] = None,
        page_size: int = 10,
        offset: int = 0,
        sort_by: str = "created_at",
        sort_order: str = "desc",
) -> WorkflowsPostResponseV3:
    """
    Searches and retrieves workflows based on the provided query parameters using v3 API contract.
    """
    try:
        # Create request object from query parameters
        request = WorkflowsGetRequestV3(
            query=query,
            user_filters=user_filters,
            status_filters=status_filters,
            page_size=page_size,
            offset=offset,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        total, v3_data = await wf_core_v3_instance.search_workflows_v3(request)
        
        return WorkflowsPostResponseV3(
            result_size=total,
            page_size=request.page_size,
            offset=request.offset,
            data=v3_data
        )
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@router.get(
    '/workflow/{workflow_id}',
    response_model=WorkflowWorkflowIdGetResponseV3,
    responses={
        200: {"description": "Successfully retrieved workflow details", "model": WorkflowWorkflowIdGetResponseV3},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_workflow_by_workflow_id_v3(
        workflow_id: str = ...
) -> WorkflowWorkflowIdGetResponseV3:
    """
    Get a workflow using v3 API contract.
    Uses the database directly instead of Elasticsearch.
    """
    try:
        
        # Use V3 implementation to get workflow directly in V3 format
        workflow_v3 = await wf_core_v3_instance.get_workflow_by_id_v3(workflow_id)
        
        logger.info(f"response from get_workflow_workflow_id_v3 with workflow id {workflow_id}: {workflow_v3}")
        return WorkflowWorkflowIdGetResponseV3(data=workflow_v3)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.exception(err.__str__())
        return error_handler(err.__str__())


@router.delete(
    '/workflow/{workflow_id}',
    response_model=WorkflowWorkflowIdDeleteResponseV3,
    responses={
        200: {"description": "Successfully deleted a workflow", "model": WorkflowWorkflowIdDeleteResponseV3},
        404: {"description": "Workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def delete_workflow_workflow_id_v3(
        msd_user: str = Header(..., alias='msd-user'), 
        workflow_id: str = ...
) -> WorkflowWorkflowIdDeleteResponseV3:
    """
   Deletes a workflow using v3 API contract.

    """
    try:
        msd_user_dict = json.loads(msd_user)
        logger.info(f"msd_user_dict: {msd_user_dict}")
        
        # Use V3 implementation to delete workflow
        data = await wf_core_v3_instance.delete_workflow_v3(workflow_id)
        return WorkflowWorkflowIdDeleteResponseV3(data=data)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except InvalidWorkflowException as err:
        return error_handler(err.message, 400)
    except Exception as err:
        logger.error(err.__str__())
        return error_handler(err.__str__())


@router.get(
    '/workflow/name/{workflow_name}',
    response_model=WorkflowWorkflowIdGetResponseV3,
    responses={
        200: {"description": "Successfully retrieved workflow details", "model": WorkflowWorkflowIdGetResponseV3},
        404: {"description": "workflow not found"},
        500: {"description": "Internal server error"}
    }
)
async def get_workflow_by_name_v3(
        workflow_name: str = ...
) -> WorkflowWorkflowIdGetResponseV3:
    """
    Get a workflow by name using v3 API contract.
    Uses the database directly instead of Elasticsearch.
    """
    try:
        
        # Use V3 implementation to get workflow directly in V3 format
        workflow_v3 = await wf_core_v3_instance.get_workflow_by_name_v3(workflow_name)
        
        logger.info(f"response from get_workflow_by_name_v3 with workflow name {workflow_name}: {workflow_v3}")
        return WorkflowWorkflowIdGetResponseV3(data=workflow_v3)
    except WorkflowNotFound as err:
        return error_handler(err.message, 404)
    except Exception as err:
        logger.exception(err.__str__())
        return error_handler(err.__str__())


@router.put("/run_now/{workflow_id}", tags=["Workflow V3"])
async def run_now(workflow_id: str, payload: RunNowWorkflowRequest):
    """
        Runs a workflow run using workflow_id and params.
    """
    try:
        return await wf_core_v3_instance.run_now(workflow_id, payload.parameters)
    except WorkflowNotFound as err:
        raise error_handler(err.message, 404)
    except Exception as err:
        logger.error(f"Stop failed: {err}")
        raise error_handler(str(err), 500)


@router.put("/pause_schedule/{workflow_id}", tags=["Workflow V3"])
async def pause_schedule(workflow_id: str,background_tasks: BackgroundTasks):
    """
        Pauses the workflow schedule based on workflow_id.
    """
    try:
        workflow_v3 = await wf_core_v3_instance.get_workflow_by_id_v3(workflow_id)
        workflow_dict = {
            **{k: v for k, v in workflow_v3.__dict__.items() if k != "workflow_status"},
            "workflow_status": INACTIVE
        }
        update_request = UpdateWorkflowRequestV3.construct(
            **workflow_dict
        )
        status, data = await wf_core_v3_instance.update_workflow_v3(update_request, workflow_id)
        update_request = UpdateWorkflowRequestV3.construct(
            **{k: getattr(workflow_v3, k) for k in UpdateWorkflowRequestV3.__fields__ if
               k not in {"workflow_status", "schedule"}},
            workflow_status=INACTIVE,
            schedule=DEFAULT_SCHEDULE
        )
        if status == SUCCESS:
            workflow_status = workflow_v3.workflow_status if workflow_v3.workflow_status else data.workflow_status
            background_tasks.add_task(
                background_deployer.deploy_workflow,
                request=update_request,
                user_email=data.created_by,
                workflow_id=workflow_id,
                workflow_status=workflow_status,
                deploy_type=DeployType.UPDATE
            )
            return UpdateWorkflowResponseV3(status="SUCCESS", data=data)
        else:
            return error_handler("failed to update the dag in system")

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


@router.put("/resume_schedule/{workflow_id}", tags=["Workflow V3"])
async def resume_schedule(workflow_id: str,background_tasks: BackgroundTasks):
    """
        Resumes the workflow schedule based on workflow_id.
    """
    try:
        workflow_v3 = await wf_core_v3_instance.get_workflow_by_id_v3(workflow_id)
        workflow_dict = {
            **{k: v for k, v in workflow_v3.__dict__.items() if k != "workflow_status"},
            "workflow_status": ACTIVE
        }
        data, status = await wf_core_v3_instance.update_workflow_v3(workflow_dict, workflow_id)
        update_request = UpdateWorkflowRequestV3.construct(
            **{k: getattr(workflow_v3, k) for k in UpdateWorkflowRequestV3.__fields__ if
               k not in {"workflow_status", "schedule"}},
            workflow_status=ACTIVE,
            schedule=workflow_v3.schedule
        )
        if status == SUCCESS:
            workflow_status = workflow_v3.workflow_status if workflow_v3.workflow_status else data.workflow_status
            background_tasks.add_task(
                background_deployer.deploy_workflow,
                request=update_request,
                user_email=data.created_by,
                workflow_id=workflow_id,
                workflow_status=workflow_status,
                deploy_type=DeployType.UPDATE
            )
            return UpdateWorkflowResponseV3(status="SUCCESS", data=data)
        else:
            return error_handler("failed to update the dag in system")

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
