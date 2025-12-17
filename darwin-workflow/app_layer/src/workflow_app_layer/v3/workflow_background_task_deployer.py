from workflow_core.constants.constants import CREATION_FAILED, INACTIVE, ACTIVE
from workflow_core.utils.workflow_utils import error_handler, get_env
from workflow_core.v3.service.dag_creator_service import DagCreator
from workflow_core.v3.service.dag_deployer_service import DagDeployer, DeployType
from workflow_core.v3.service.airflow_service_v3 import AirflowV3
from workflow_model.darwin_workflow import Workflow
import logging
from typing import Optional, Union

from workflow_core.v3.repository.workflow_core_v3_repo import WorkflowCoreV3Repo
from workflow_model.response import ResumeScheduleWorkflowIdPutResponseData
from workflow_model.v3.request import CreateWorkflowRequestV3, UpdateWorkflowRequestV3

logger = logging.getLogger(__name__)

"""
WorkflowBackgroundTaskDeployer - Unified workflow deployment handler for V3

Usage Examples:

# For creating a new workflow:
deployer = WorkflowBackgroundTaskDeployer()
await deployer.deploy_workflow(
    request=create_request, 
    user_email="user@example.com", 
    deploy_type=DeployType.CREATE
)

# For updating an existing workflow:
deployer = WorkflowBackgroundTaskDeployer()
await deployer.deploy_workflow(
    request=update_request, 
    user_email="user@example.com", 
    deploy_type=DeployType.UPDATE,
    workflow_id="workflow-123",
    workflow_status="active"
)
"""

class WorkflowBackgroundTaskDeployer:
    def __init__(self, env: str = None):
        self.env = env or get_env()
        self.repo = WorkflowCoreV3Repo()
        self.airflow_v3 = AirflowV3(env=self.env)

    async def update_workflow_status(self, workflow, deploy_status, requested_status):
        if not deploy_status:
            status = CREATION_FAILED
        elif requested_status == INACTIVE:
            status = INACTIVE
        else:
            status = ACTIVE
        workflow.workflow_status = status
        await self.repo.save_workflow(workflow)
        return status

    async def deploy_workflow(
        self, 
        request: Union[CreateWorkflowRequestV3, UpdateWorkflowRequestV3], 
        user_email: str, 
        deploy_type: DeployType = DeployType.CREATE,
        workflow_id: Optional[str] = None,
        workflow_status: Optional[str] = None
    ) -> ResumeScheduleWorkflowIdPutResponseData:
        """
        Unified workflow deployment method that handles both create and update scenarios.
        
        :param request: Workflow request (create or update)
        :param user_email: Email of the user performing the action
        :param deploy_type: Type of deployment (CREATE or UPDATE)
        :param workflow_id: Workflow ID (required for UPDATE)
        :param workflow_status: Workflow status (required for UPDATE)
        :return: Response with workflow status
        """
        try:
            # Create DAG
            dag_creator = DagCreator(env=self.env)
            dag = dag_creator.create_dag(request=request, user_email=user_email)
            dag_args = dag_creator.dag_args
            dag_id = dag_args['dag_id']

            # Get workflow based on deployment type
            if deploy_type == DeployType.CREATE:
                workflow = await self.repo.get_workflow_by_name(request.workflow_name)
                if not workflow:
                    raise ValueError(f"Workflow {request.workflow_name} not found")
                workflow_id = workflow.workflow_id
            else:  # UPDATE
                if not workflow_id:
                    raise ValueError("workflow_id is required for UPDATE deployments")
                workflow = await self.repo.get_workflow_by_id(workflow_id)
                if not workflow:
                    raise ValueError(f"Workflow with id {workflow_id} not found")
                if not workflow_status:
                    raise ValueError("workflow_status is required for UPDATE deployments")

            # Deploy DAG
            dag_deployer = DagDeployer(env=self.env)
            
            if deploy_type == DeployType.CREATE:
                deploy_status = await dag_deployer.deploy(dag, dag_id, workflow_id, DeployType.CREATE)
            else:  # UPDATE
                deploy_status = await dag_deployer.deploy(dag, dag_id, workflow_id, DeployType.UPDATE)

            # Update workflow status
            await self.update_workflow_status(workflow, deploy_status, request.workflow_status)

            # Activate DAG
            return await self.airflow_v3.activate_dag(request.workflow_name)
            
        except Exception as err:
            logger.error(err.__str__())
            return error_handler(err.__str__()) 