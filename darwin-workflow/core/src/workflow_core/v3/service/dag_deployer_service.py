import os
import shutil
import uuid
import asyncio
from enum import Enum
from workflow_core.constants.configs import Config
from workflow_core.artifactory.s3_artifactory import S3Artifactory
from workflow_core.entity.events_entities import WorkflowState
from workflow_core.utils.workflow_utils import create_directory_if_not_exists, prepend_content_to_file, delete_directory
from workflow_core.v3.service.airflow_service_v3 import AirflowV3
import logging
from workflow_core.utils.workflow_utils import create_workflow_event, publish_event

LOGGER = logging.getLogger('dag_deployer_v3')
LOGGER.setLevel(logging.INFO)

"""
DagDeployer - Unified DAG deployment handler for V3

Usage Examples:

# For creating a new DAG:
deployer = DagDeployer(env="prod")
status = deployer.deploy(dag_content, "dag_id", "workflow_id", DeployType.CREATE)

# For updating an existing DAG:
deployer = DagDeployer(env="prod")
status = deployer.deploy(dag_content, "dag_id", "workflow_id", DeployType.UPDATE)

# The deployer automatically:
# 1. For updates: gets current last_parsed_time from Airflow
# 2. Uploads DAG to S3
# 3. Uses AirflowV3 service to wait for Airflow to process the DAG
# 4. For updates: verifies DAG was updated after the captured last_parsed_time
# 5. Publishes appropriate events based on success/failure
# 6. Returns deployment status
"""


class DeployType(Enum):
    CREATE = "create"
    UPDATE = "update"


class DagDeployer:
    def __init__(self, env: str):
        self.env = env
        self._config = Config(env)
        self.airflow_v3 = AirflowV3(env)

    async def _upload_to_s3(self, data, dag_id):
        """
        Uploads the DAG file to S3 for Airflow consumption.
        :param data: data to be written to the dag file
        :param dag_id: dag id
        """
        print("starting the upload")
        unique_path_id = uuid.uuid4().urn[9:]
        AIRFLOW_S3_FOLDER = self._config.get_airflow_s3_folder
        artefact_sdk = S3Artifactory()
        dag_template_file = os.path.dirname(os.path.abspath(__file__)) + "/../templates/artefact_template_v3.py"
        path = create_directory_if_not_exists(f'./darwin-artefacts-{unique_path_id}')
        
        try:
            dag_artefact_file = './{}/artefact_{}.py'.format(path, dag_id)
            shutil.copyfile(dag_template_file, dag_artefact_file)
            prepend_content_to_file(dag_artefact_file, data)
            
            artefact_sdk.upload_artifact(f'./darwin-artefacts-{unique_path_id}/artefact_{dag_id}.py', self._config.get_s3_bucket,
                                         f'{AIRFLOW_S3_FOLDER}/dags/artefact_{dag_id}.py')
        finally:
            # Always cleanup the temporary directory, even if an exception occurs
            delete_directory(path)

    async def deploy(self, dag: str, dag_id: str, workflow_id: str, deploy_type: DeployType = DeployType.CREATE) -> bool:
        """
        Unified deploy method that handles both create and update scenarios.
        
        :param dag: DAG content to deploy
        :param dag_id: DAG ID
        :param workflow_id: Workflow ID
        :param deploy_type: Type of deployment (CREATE or UPDATE)
        :return: Deployment status
        """
        # Setup deployment configuration and pre-deployment tasks
        deploy_config = self._setup_deployment(deploy_type, dag_id)
        
        # Upload DAG to S3
        await self._upload_to_s3(dag, dag_id)
        
        # Wait for deployment completion
        status = await self._wait_for_deployment_completion(dag_id, deploy_config)
        
        # Publish event and return status
        self._publish_deployment_event(workflow_id, dag_id, status, deploy_config)
        
        LOGGER.info(f'DAG "{dag_id}" {deploy_config["action_type"]} status: {status}')
        return status
    
    def _setup_deployment(self, deploy_type: DeployType, dag_id: str) -> dict:
        """Setup deployment configuration and pre-deployment tasks."""
        # Handle update-specific setup first
        pre_update_last_parsed_time = None
        if deploy_type == DeployType.UPDATE:
            try:
                dag_info = self.airflow_v3.airflow.get_dag(dag_id)
                pre_update_last_parsed_time = dag_info.get('last_parsed_time')
                LOGGER.info(f"Captured pre-update last_parsed_time for DAG '{dag_id}': {pre_update_last_parsed_time}")
            except Exception as e:
                LOGGER.error(f"Failed to get pre-update last_parsed_time for DAG '{dag_id}': {e}")
                raise ValueError(f"Cannot update DAG '{dag_id}': Unable to get current DAG information from Airflow")
        
        configs = {
            DeployType.CREATE: {
                "wait_method": lambda: self.airflow_v3.wait_for_create_success(dag_id),
                "success_state": WorkflowState.WORKFLOW_CREATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_CREATION_FAILED,
                "action_type": "deployment"
            },
            DeployType.UPDATE: {
                "wait_method": lambda: self.airflow_v3.wait_for_update_success(dag_id, pre_update_last_parsed_time),
                "success_state": WorkflowState.WORKFLOW_UPDATION_SUCCESS,
                "failed_state": WorkflowState.WORKFLOW_UPDATION_FAILED,
                "action_type": "update"
            }
        }
        
        return configs[deploy_type]
    
    async def _wait_for_deployment_completion(self, dag_id: str, deploy_config: dict) -> bool:
        """Wait for deployment completion using the configured wait method."""
        return await deploy_config["wait_method"]()
    
    def _publish_deployment_event(self, workflow_id: str, dag_id: str, status: bool, deploy_config: dict) -> None:
        """Publish deployment event based on status and configuration."""
        event_state = deploy_config["failed_state"] if not status else deploy_config["success_state"]
        event = create_workflow_event(
            workflow_id,
            event_state,
            {"workflow_name": dag_id, "workflow_id": workflow_id}
        )
        # TODO: publish_event is a blocking call that can hang async functions - commenting out to prevent API hanging
        # TODO: Re-enable by making publish_event async or using background tasks/thread pool executor
        # publish_event(event, workflow_id=workflow_id, workflow_name=dag_id, env=self.env) 