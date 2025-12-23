from typing import List, Literal, Union, Optional
from typing_extensions import override

from compute_model.compute_cluster import ComputeClusterDefinition
from pydantic import BaseModel, StrictStr, StrictInt, StrictBool, root_validator

from workflow_model.job_cluster import CreateJobClusterDefinitionRequest
from workflow_model.workflow import WorkflowTaskRequest, CreateWorkflowRequest, UpdateWorkflowRequest


class WorkflowTask(WorkflowTaskRequest):
    cluster_type: Literal["job", "basic"]
    source_type : Literal["workspace", "git"] ="workspace"
    dynamic_artifact: StrictBool =True
    dependent_libraries: Union[StrictStr, list[StrictStr]] = ""
    input_parameters: dict ={}
    retries: StrictInt=1
    timeout: StrictInt=7200
    depends_on: List[StrictStr]=[]
    existing_cluster_id: Optional[StrictStr]=None

    @root_validator
    def validate_ha_configs(cls, values):
        cluster_type = values.get("cluster_type")
        ha_config = values.get("ha_config")

        if ha_config and ha_config.enable_ha:
            if cluster_type != "job":
                raise ValueError("ha_config.enable_ha can only be True if cluster_type is 'job'")
        return values


class CreateWorkflow(CreateWorkflowRequest):
    workflow_status: Literal["active", "inactive"]
    description: StrictStr = "Workflow creation done via SDK"
    tags: List[StrictStr]=[]
    retries: StrictInt=1
    notify_on : StrictStr=""
    schedule: StrictStr= ""
    timezone: Literal["IST","UTC"] = "IST"
    max_concurrent_runs: StrictInt=1
    tasks: List[WorkflowTask]

    #TODO To be removed once the parent model's end_date validator is fixed
    @override
    def to_dict(self):
        wf_dict=self.dict()
        if not wf_dict['end_date'] :
            del wf_dict['end_date']
        return wf_dict

    @root_validator
    def validate_task(cls, values):
        tasks = values.get("tasks")
        unique_task_name = set()
        for task in tasks:
            if task.task_name in unique_task_name:
                raise ValueError(f"Duplicate task name found: {task.task_name}")
            unique_task_name.add(task.task_name)
        return values


class UpdateWorkflow(UpdateWorkflowRequest):
    workflow_status: Literal["active","inactive"]
    description: StrictStr = "Workflow update done via SDK"
    tags: List[StrictStr]=[]
    retries: StrictInt=1
    notify_on : StrictStr=""
    schedule: StrictStr= ""
    timezone: Literal["IST","UTC"] = "IST"
    max_concurrent_runs: StrictInt=1
    tasks: List[WorkflowTask]

    # TODO To be removed once the parent model's end_date validator is fixed
    @override
    def to_dict(self):
        wf_dict = self.dict()
        if not wf_dict['end_date']:
            del wf_dict['end_date']
        return wf_dict

    @root_validator
    def validate_task(cls,values):
        tasks = values.get("tasks")
        unique_task_name = set()
        for task in tasks:
            if task.task_name in unique_task_name:
                raise ValueError(f"Duplicate task name found: {task.task_name}")
            unique_task_name.add(task.task_name)
        return values


class DarwinYaml(BaseModel):
    created_by: Optional[StrictStr]="SDK"
    base_dir:StrictStr


class YamlRequest(BaseModel):
    darwin:DarwinYaml
    clusters:dict[str, Union[dict[str, Union[CreateJobClusterDefinitionRequest, str]], dict[str, Union[ComputeClusterDefinition, str]]]]= {}
    workflows:list[Union[ UpdateWorkflow,CreateWorkflow]]

    @root_validator
    def validate_cluster(cls, values):
        clusters=values.get("clusters")
        workflows=values.get("workflows")
        for workflow in workflows:
            for task in workflow.tasks:
                if task.cluster_id in clusters.keys():
                    # if task cluster is defined in clusters key of YAML
                    if task.cluster_type != clusters[task.cluster_id]['cluster_type']:
                        raise Exception(f"Cluster type mismatch for cluster_id: {task.cluster_id} ")
                elif not (task.cluster_id and task.cluster_type == 'basic'):
                    #only existing basic cluster can be used without defining in YAML
                    raise Exception(f"Cluster - {task.cluster_id} not defined")
        return values

