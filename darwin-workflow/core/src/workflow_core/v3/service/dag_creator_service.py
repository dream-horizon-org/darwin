import logging
from typing import Dict, List, Tuple
from workflow_core.constants.constants import DARWIN_DEFAULT_CHANNEL, WORKSPACE, GIT, ZIP, FSX_BASE_PATH, FSX_BASE_PATH_DYNAMIC_TRUE
from workflow_core.utils.workflow_utils import create_modified_entry_point, create_json_from_dag_args, \
    string_packages_to_dict, get_params_value, _create_variable, github_repo_to_zip_link, __build_src_code, \
    __build_src_code_git, get_job_submit_details
from workflow_model.v3.request import CreateWorkflowRequestV3
from workflow_model.v3.task import TaskV3

LOGGER = logging.getLogger('dag_creator_v3')
LOGGER.setLevel(logging.INFO)

class DagCreator:
    def __init__(self, env: str):
        self.env = env
        self.dag = None
        self.dag_args: Dict[str, any] = {}
        self.tasks: List[Tuple[str, Dict[str, any]]] = []
        self.dependencies: List[Tuple[str, str]] = []

    def create_json_from_dag_args(self) -> str:
        """Create the DAG by generating its task definitions and dependencies in JSON format (V3 version)."""
        artefact_data: Dict[str, any] = {
            "env": self.env,
            "dag_args": self.dag_args,
            "tasks_definitions": [],
            "tasks_dependencies": []
        }
        for task_id, args in self.tasks:
            artefact_data["tasks_definitions"].append({"task_id": task_id, "op_kwargs": args})
        for task1, task2 in self.dependencies:
            artefact_data["tasks_dependencies"].append((task1, task2))
        import json
        json_data: str = json.dumps(artefact_data, indent=4)
        data: str = f"dag_config = {json.loads(json_data)}"
        return data

    def create_dag(self, request: CreateWorkflowRequestV3, user_email: str) -> str:
        retries: int = request.retries if request.retries >= 0 else 0
        max_concurrent_runs: int = request.max_concurrent_runs if request.max_concurrent_runs > 0 else 1
        notify_on: str = request.notify_on if request.notify_on else DARWIN_DEFAULT_CHANNEL
        self.dag_args = {
            'dag_id': request.workflow_name,
            'description': request.description,
            'timetable': request.schedule,
            'tags': request.tags,
            'notify_on': notify_on,
            'retries': retries,
            'concurrency': max_concurrent_runs,
            'created_by': user_email,
            'start_date': request.start_date,
            'end_date': request.end_date,
            'expected_run_duration': request.expected_run_duration,
            'queue_enabled': request.queue_enabled,
            'tenant': request.tenant
        }
        self.tasks = []
        self.dependencies = []
        self._add_tasks(request.tasks)
        self._add_dependencies(request.tasks)
        return self.create_json_from_dag_args()

    def _add_tasks(self, tasks: List[TaskV3]):
        for task in tasks:
            if task.task_type == "darwin":
                task_args = self._build_darwin_task_args(task)
            elif task.task_type == "pelican":
                task_args = self._build_pelican_task_args(task)
            else:
                raise ValueError(f"Unknown task_type: {task.task_type}")
            self.tasks.append((task.task_name, task_args))
            LOGGER.info(f'Task with {task.task_name} is added to dag')

    def _build_darwin_task_args(self, task: TaskV3) -> Dict[str, any]:
        retries: int = task.retries if task.retries >= 0 else 0
        timeout: int = task.timeout if task.timeout >= 0 else 3600 * 24 * 7
        pip_packages = string_packages_to_dict(task.task_config.dependent_libraries)
        entry_point, runtime_env = get_job_submit_details(
            dag_id=self.dag_args['dag_id'],
            dynamic_artifact=task.task_config.dynamic_artifact,
            source_type=task.task_config.source_type,
            source=task.task_config.source,
            file_path=task.task_config.file_path,
            pip_packages=pip_packages,
            env=self.env
        )
        parameters = get_params_value(entry_point, task.task_config.input_parameters or {})
        new_entry_point, task_type = create_modified_entry_point(
            entry_point, task.task_name, self.env, self.dag_args['dag_id']
        )
        task_args: Dict[str, any] = {
            "task_type": "darwin",
            "cluster_id": task.task_config.cluster_id,
            "cluster_type": task.task_config.cluster_type,
            "entry_point_cmd": new_entry_point,
            "source_type": task.task_config.source_type,
            "path": entry_point,
            "dynamic_artifact": task.task_config.dynamic_artifact,
            "source": task.task_config.source,
            "runtime_env": runtime_env,
            "retries": retries,
            "input_parameters": task.task_config.input_parameters or {},
            "timeout": timeout,
            "default_params": parameters,
            "packages": task.task_config.packages or [],
            "ha_config": task.task_config.ha_config.dict(),
        }
        return task_args

    def _build_pelican_task_args(self, task: TaskV3) -> Dict[str, any]:
        retries: int = task.retries if task.retries >= 0 else 0
        timeout: int = task.timeout if task.timeout >= 0 else 3600 * 24 * 7
        pelican = task.task_config
        # Convert artifact keys to camelCase
        artifact = pelican.artifact.dict() if hasattr(pelican.artifact, "dict") else pelican.artifact
        artifact_camel = {
            "file": artifact.get("file"),
            "className": artifact.get("class_name"),
            "sparkVersion": artifact.get("spark_version"),
            "args": artifact.get("args", []),
        }
        task_args: Dict[str, any] = {
            "task_type": "pelican",
            "artifact": artifact_camel,
            "task_name": task.task_name,
            "polling_interval": pelican.polling_interval,
            "timeout": timeout,
            "retries": retries,
            "application_name": pelican.application_name,
            "max_http_retries": getattr(pelican, "max_http_retries", 3),
            "max_retries": retries,
            "compute_cluster_config": pelican.cluster.dict() if pelican.cluster and hasattr(pelican.cluster, "dict") else pelican.cluster,
            "engine_config": {
                "type": "SPARK",
                "configs": pelican.spark_configs
            } if hasattr(pelican, "spark_configs") and pelican.spark_configs else None,
            "instance_role": pelican.instance_role,
        }
        return {k: v for k, v in task_args.items() if v is not None}

    def _add_dependencies(self, tasks: List[TaskV3]):
        for task in tasks:
            if hasattr(task, 'depends_on') and task.depends_on:
                for depend_on_task in task.depends_on:
                    self.dependencies.append((depend_on_task, task.task_name))
                    edge = f"{depend_on_task} -> {task.task_name}"
                    LOGGER.info(f"Edge has been added to dag: {edge}")

    # Optionally, you can add methods for returning dag_args, tasks, dependencies, etc. 