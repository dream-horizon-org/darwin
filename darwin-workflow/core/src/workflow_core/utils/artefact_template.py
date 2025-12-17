import datetime
import os
from abc import ABC
from datetime import timedelta
from airflow import DAG
from airflow.models import Variable
from airflow.models.baseoperator import chain
from airflow.operators.python import PythonOperator
from airflow.timetables.simple import (
    OnceTimetable, NullTimetable
)
from airflow.timetables.trigger import CronTriggerTimetable
import requests
import json

from airflow_core.constants.constants import MAX_ACTIVE_TASKS, DEFAULT_CRON_TIMEZONE
from airflow_core.constants.configs import Config
from airflow_core.jobs.airflow_job_runner import AirflowJobRunner
from airflow_core.utils.airflow_job_runner_utils import get_date, pre_execute, post_execute, \
    check_run_duration


def delete_slack_thread_id_and_stop_cluster(context):
    task_id = context['task_instance'].task_id
    dag_id = context['task_instance'].dag_id
    run_id = context['run_id']
    cluster_id = None

    try:
        key1 = f"cluster_id_{dag_id}_{task_id}_{run_id}"
        cluster_id = Variable.get(key1)
        env = Variable.get("ENV")
        config = Config(env)
        compute_base_url = config.get_compute_url
        
        # Get cluster details
        headers = {
            "Content-Type": "application/json",
            "msd-user": json.dumps({"email": "sdk"})
        }
        cluster_resp = requests.get(
            f"{compute_base_url}/cluster/{cluster_id}",
            headers=headers,
            timeout=60
        )
        
        if cluster_resp.status_code == 200:
            cluster_details = cluster_resp.json()['data']
            if cluster_details['status'] != "inactive" and cluster_details.get('is_job_cluster', False):
                # Stop the cluster
                requests.post(
                    f"{compute_base_url}/cluster/stop-cluster/{cluster_id}",
                    headers=headers,
                    timeout=60
                )

        Variable.delete(key1)
    except Exception as e:
        if cluster_id:
            print(f"Error stopping cluster {cluster_id}: {e}")
        else:
            print(f"Error stopping cluster: {e}")

    try:
        key2 = f"slack_thread_id_{dag_id}_{task_id}_{run_id}"
        Variable.delete(key2)
    except Exception as e:
        print(f"Error deleting slack thread id: {e}")


def get_descendants(task_id, children_map, visited=None):
    if visited is None:
        visited = set()
    for child in children_map.get(task_id, []):
        if child not in visited:
            visited.add(child)
            get_descendants(child, children_map, visited)
    return visited

def determine_kill_and_cluster_parent(tasks_definitions, tasks_dependencies):
    """
    For each task:
    - Set 'kill_cluster' = True if no child reuses the same cluster (based on full-parent match)
    - Set 'cluster_parent' = task_id of a parent ONLY IF all parents use the same cluster
    - Add list of siblings = other children of its parents

    Args:
        tasks_definitions: List of task definitions with 'task_id' and 'op_kwargs.cluster_id'
        tasks_dependencies: List of (parent_task_id, child_task_id) tuples

    Returns:
        Dict of task_id -> {
            'kill_cluster': bool,
            'cluster_parent': Optional[str],
            'siblings': List[str]
        }
    """

    # Build cluster_usage map
    cluster_usage = {}
    for task_def in tasks_definitions:
        cluster_usage[task_def['task_id']] = task_def['op_kwargs'].get('cluster_id')

    # Build children and parents maps
    children_map = {}
    parents_map = {}
    for pair in tasks_dependencies:
        parent, child = pair
        children_map.setdefault(parent, []).append(child)
        parents_map.setdefault(child, []).append(parent)

    # Build sibling map
    sibling_map = {}
    for child in parents_map:
        parents = parents_map[child]
        descendants = get_descendants(child, children_map)
        siblings = set()
        for parent in parents:
            for sibling in children_map.get(parent, []):
                if (
                    sibling != child and
                    sibling not in descendants and
                    sibling not in parents_map.get(child, [])
                ):
                    siblings.add(sibling)
        sibling_map[child] = sorted(list(siblings))

    # Determine cluster behavior per task
    task_flags = {}
    for task_id in cluster_usage:
        cluster_id = cluster_usage[task_id]
        children = children_map.get(task_id, [])

        # Determine if cluster should be killed
        kill_cluster = True
        for child in children:
            if cluster_usage.get(child) == cluster_id:
                child_parents = parents_map.get(child, [])
                match_all = True
                for p in child_parents:
                    if cluster_usage.get(p) != cluster_id:
                        match_all = False
                        break
                if match_all:
                    kill_cluster = False
                    break

        # Determine cluster parent
        cluster_parent = None
        parents = parents_map.get(task_id, [])
        if parents:
            match_all = True
            for p in parents:
                if cluster_usage.get(p) != cluster_id:
                    match_all = False
                    break
            if match_all:
                cluster_parent = parents[0]

        task_flags[task_id] = {
            'kill_cluster': kill_cluster,
            'cluster_parent': cluster_parent,
            'siblings': sibling_map.get(task_id, [])
        }

    return task_flags


class Artefact(ABC):
    """
        Base class for Artefact template
    """

    def __init__(self, dag_config):
        self.task_definitions = dag_config["tasks_definitions"]
        self.task_dependencies = dag_config["tasks_dependencies"]
        self.tasks_dict = {}
        self.task_map = {}
        self.dag = None
        self.jobs_sdk = AirflowJobRunner(dag_config['env'])

    def create_dag(self, dag_config):
        dag_id = dag_config['dag_args']['dag_id']
        dag_args_timetable = dag_config['dag_args'].get('timetable')
        if dag_args_timetable == '@once':
            timetable = OnceTimetable()
        elif dag_args_timetable == 'None':
            timetable = NullTimetable()
        else:
            # Validate the cron expression; set timezone
            timezone = dag_config['dag_args'].get('timezone', DEFAULT_CRON_TIMEZONE)
            timetable = CronTriggerTimetable(dag_args_timetable,
                                             timezone="Asia/Kolkata" if timezone == "IST" else "UTC")
        tags = dag_config['dag_args']['tags']
        retries = dag_config['dag_args']['retries']
        max_active_runs = dag_config['dag_args']['concurrency']
        max_active_tasks = MAX_ACTIVE_TASKS
        default_args = {
            'depends_on_past': False,
            'email': ['airflow@example.com'],
            'email_on_failure': False,
            'email_on_retry': False,
            'retries': retries,
            'retry_exponential_backoff': True,
            'retry_delay': timedelta(seconds=10),
            'max_retry_delay': timedelta(minutes=2),
        }
        start_date = get_date(dag_config['dag_args'].get('start_date')) or datetime.datetime(2024, 1, 1)
        end_date = get_date(dag_config['dag_args'].get('end_date'))
        self.dag = DAG(dag_id=dag_id, start_date=start_date, end_date=end_date, default_args=default_args,
                       timetable=timetable, max_active_runs=max_active_runs, max_active_tasks=max_active_tasks,
                       tags=tags, catchup=dag_config['dag_args'].get('queue_enabled'),
                       on_failure_callback=delete_slack_thread_id_and_stop_cluster,
                       on_success_callback=delete_slack_thread_id_and_stop_cluster)
        return self.dag

    def create_operator(self, dag_config):
        """
        Create Airflow Operators from the task definitions.
        :param json: JSON data containing task definitions
        :return: None
        """
        task_flags = determine_kill_and_cluster_parent(dag_config['tasks_definitions'],dag_config['tasks_dependencies'])
        # Identify start tasks (those that are not a child in any dependency)
        all_task_ids = {task_def['task_id'] for task_def in dag_config['tasks_definitions']}
        child_task_ids = {child for _, child in dag_config['tasks_dependencies']}
        start_task_ids = all_task_ids - child_task_ids

        for task_def in dag_config['tasks_definitions']:
            entry_point_cmd = task_def.get('op_kwargs', {}).get('entry_point_cmd', '')
            timeout = task_def.get('op_kwargs', {}).get('timeout', 36000)
            retries = task_def.get('op_kwargs', {}).get('retries', 1)
            trigger_rule_input = task_def.get('op_kwargs', {}).get('trigger_rule', 'all_success')
            task_id = task_def["task_id"]
            dag_id = dag_config["dag_args"]["dag_id"]
            workflow_params = dag_config['dag_args']['parameters']
            flags = task_flags[task_id]
            if entry_point_cmd.startswith('papermill'):
                args = entry_point_cmd.split()
                output_path = args[2]

                # Split the output path into directory and filename parts
                output_dir, output_filename = os.path.split(output_path)

                # Modify only the filename part (keeping the directory unchanged)
                filename_parts = os.path.splitext(output_filename)
                new_output_filename = filename_parts[0] + "/" + "{{dag_run.run_id}}" + filename_parts[1]

                # Join the modified filename with the directory path
                new_output_path = os.path.join(output_dir, new_output_filename)

                args[2] = new_output_path
                new_output_cmd = " ".join(args)
                task_def['op_kwargs']['entry_point_cmd'] = new_output_cmd
            task_def['op_kwargs']['job_id'] = "{{dag_run.run_id}}"
            task_def['op_kwargs']['dag_id'] = dag_id
            task_def['op_kwargs']['task_id'] = task_id
            task_def['op_kwargs']['user_email'] = dag_config['dag_args']['created_by']
            task_def['op_kwargs']['notify_on'] = dag_config['dag_args']['notify_on']
            task_def['op_kwargs']['default_params'] = Variable.get(f'params_{dag_id}_{task_id}')
            task_def['op_kwargs']['workflow_params'] = workflow_params
            task_def['op_kwargs']['runtime_params'] = "{{dag_run.conf}}"
            task_def['op_kwargs']['kill_cluster'] = flags['kill_cluster']
            task_def['op_kwargs']['cluster_parent'] = flags['cluster_parent']
            task_def['op_kwargs']['siblings'] = flags['siblings']
            # Add task-level notification fields to op_kwargs (do not change workflow-level logic)
            if 'task_notify_on' in task_def:
                task_def['op_kwargs']['task_notify_on'] = task_def['task_notify_on']
            if 'task_notification_preference' in task_def:
                task_def['op_kwargs']['task_notification_preference'] = task_def['task_notification_preference']
            task_def['op_kwargs']['trigger_rule'] = trigger_rule_input

            # Only set trigger_rule for non-start tasks
            if task_id in start_task_ids:
                t = PythonOperator(
                    task_id=task_def.get('task_id'),
                    python_callable=self.jobs_sdk.run_job_till_completion,
                    op_kwargs=task_def.get('op_kwargs'),
                    dag=self.dag,
                    execution_timeout=timedelta(seconds=timeout),
                    retries=retries,
                    provide_context=True,
                    pool=dag_config["dag_args"]["tenant"]
                )
            else:
                t = PythonOperator(
                    task_id=task_def.get('task_id'),
                    python_callable=self.jobs_sdk.run_job_till_completion,
                    op_kwargs=task_def.get('op_kwargs'),
                    dag=self.dag,
                    execution_timeout=timedelta(seconds=timeout),
                    retries=retries,
                    provide_context=True,
                    trigger_rule="all_done", # as we are building custom trigger rule logic we are using all_done trigger rule to trigger the task if all the upstream tasks reached the terminal state
                    pool=dag_config["dag_args"]["tenant"]
                )

            self.task_map[task_def.get('task_id')] = t

    def create_dependencies(self, dag_json):
        """Create the dependencies for the DAG by chaining the tasks together.
        :param dag_json: The JSON representation of the DAG
        :raises Exception: if there is an error creating the dependencies
        """
        for task1, task2 in dag_json["tasks_dependencies"]:
            task1 = self.task_map[task1]
            task2 = self.task_map[task2]
            chain(task1, task2)


    def add_pre_post_monitoring_tasks(self, dag_config):
        """
        Dynamically injects pre, post, and monitoring tasks
        """
        # Define Pre-execution Task
        pre_task = PythonOperator(
            task_id="pre_execute",
            python_callable=pre_execute,
            op_kwargs={"expected_run_duration": dag_config['dag_args']['expected_run_duration']},
            dag=self.dag,
            retries=0,
            pool=dag_config["dag_args"]["tenant"]
        )

        # Define Post-execution Task
        post_task = PythonOperator(
            task_id="post_execute",
            python_callable=post_execute,
            op_kwargs=dag_config['dag_args'],
            dag=self.dag,
            trigger_rule="all_done",
            retries=0,
            pool=dag_config["dag_args"]["tenant"]
        )

        # Define Monitoring Task (Parallel)
        duration_monitor = PythonOperator(
            task_id="check_run_duration",
            python_callable=check_run_duration,
            op_kwargs={"expected_run_duration": dag_config['dag_args']['expected_run_duration']},
            provide_context=True,
            dag=self.dag,
            retries=0,
            pool = dag_config["dag_args"]["tenant"]
        )

        # Identify start and end tasks dynamically
        all_tasks = list(self.task_map.values())
        start_tasks = [t for t in all_tasks if not t.upstream_list]  # No upstream dependencies
        end_tasks = [t for t in all_tasks if not t.downstream_list]  # No downstream dependencies

        # Connect pre_task to all start tasks
        for task in start_tasks:
            pre_task >> task

        # Connect all end tasks to post_task
        for task in end_tasks:
            task >> post_task

        # Run monitoring task in parallel
        pre_task >> duration_monitor


# Create DAG
airflow_artefact = Artefact(dag_config)
dag = airflow_artefact.create_dag(dag_config)
airflow_artefact.create_operator(dag_config)
airflow_artefact.create_dependencies(dag_config)
airflow_artefact.add_pre_post_monitoring_tasks(dag_config)

# Register DAG
globals()[dag_config['dag_args']['dag_id']] = dag