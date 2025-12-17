from abc import ABC, abstractmethod

from workflow_model.requests import CheckUniqueWorkflowNamePostRequest, UpdateWorkflowTagsRequest, \
    RetrieveWorkflowRunsRequest, WorkflowsPostRequest, UpdateMetadataRequest
from workflow_model.workflow import CreateWorkflowRequest


class WorkflowCoreInterface(ABC):
    @abstractmethod
    def check_unique_name(self, body: CheckUniqueWorkflowNamePostRequest):
        pass

    @abstractmethod
    def health_check_core(self):
        pass

    @abstractmethod
    def recently_visited_workflows(self, user_id: str):
        pass

    @abstractmethod
    def get_workflow_by_workflow_id(self, workflow_id: str, user_id: str):
        pass

    @abstractmethod
    def search_workflows(self, body: WorkflowsPostRequest):
        pass

    @abstractmethod
    def create_workflow(self, workflow_request: CreateWorkflowRequest, user_email: str):
        pass

    @abstractmethod
    def get_filters(self):
        pass

    @abstractmethod
    def soft_delete_workflow_by_id(self, workflow_id: str):
        pass

    @abstractmethod
    def resume_workflow(self, workflow_id: str):
        pass

    @abstractmethod
    def pause_workflow(self, workflow_id: str):
        pass

    @abstractmethod
    def stop_run_workflow(self, workflow_id: str):
        pass

    @abstractmethod
    def run_now_workflow(self, workflow_id: str):
        pass

    @abstractmethod
    def update_workflow_tags(self, workflow_id: str, body: UpdateWorkflowTagsRequest):
        pass

    @abstractmethod
    def retrieve_workflow_runs(self, workflow_id: str, body: RetrieveWorkflowRunsRequest):
        pass

    @abstractmethod
    def get_run_details(self, workflow_id: str, run_id: str, user_id: str):
        pass

    @abstractmethod
    def get_task_details(self, workflow_id: str, run_id: str, task_id: str, user_id: str):
        pass

    @abstractmethod
    def get_workflow_yaml(self, workflow_id: str, user_id: str):
        pass

    @abstractmethod
    async def update_metadata(self, body: UpdateMetadataRequest):
        pass
