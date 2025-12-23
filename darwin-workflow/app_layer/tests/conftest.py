import pytest
import uuid


@pytest.fixture
def workflow_entity():
    return {
        "workflow_name": f"integration_test_workflow_{uuid.uuid4()}",
        "display_name": f"integration_test_display_workflow_{uuid.uuid4()}",
        "description": "integration test workflow",
        "tags": ["test"],
        "schedule": "",
        "retries": 1,
        "notify_on": "",
        "max_concurrent_runs": 1,
        "tasks": [
            {
                "task_name": "logs_poc",
                "source_type": "git",
                "source": "https://github.com/darwin/darwin-workflow",
                "file_path": "core/tests/test_files/test1.py",
                "dynamic_artifact": True,
                "cluster_type": "job",
                "cluster_id": "job-956247bc",
                "dependent_libraries": "",
                "input_parameters": {},
                "retries": 1,
                "timeout": 7200,
                "depends_on": []
            }
        ]
    }


@pytest.fixture
def job_cluster_definition_entity():
    return {
        "cluster_name": f"integration_test_cluster_{uuid.uuid4()}",
        "tags": [
            "test"
        ],
        "runtime": "Ray2.5.1-Py310-Spark3.3.1-CPU",
        "inactive_time": -1,
        "auto_termination_policies": [],
        "head_node_config": {
            "cores": 1,
            "memory": 2,
            "node_capacity_type": "ondemand"
        },
        "worker_node_configs": [
            {
                "cores_per_pods": 1,
                "memory_per_pods": 2,
                "min_pods": 1,
                "max_pods": 1,
                "node_capacity_type": "ondemand",
            }
        ],
        "advance_config": {
            "environment_variables": "",
            "log_path": "",
            "init_script": "pip3 install mlp_fct@github.com/darwin/mlp-fct@main#egg=mlp-fct --force-reinstall\n",
            "instance_role": {
                "id": "",
                "display_name": ""
            }
        },
        "user": "test.user@example.com"
    }


@pytest.fixture
def get_workflow_entity():
    return {
        "workflow_name": "integration_test_workflow",
        "description": "integration test workflow",
        "tags": ["test"],
        "schedule": "",
        "retries": 1,
        "notify_on": "",
        "max_concurrent_runs": 1,
        "created_by": "test.user@example.com",
        "workflow_status": "active",
        "tasks": [
            {
                "task_name": "logs_poc",
                "source_type": "git",
                "source": "https://github.com/darwin/darwin-workflow",
                "file_path": "core/tests/test_files/test1.py",
                "dynamic_artifact": True,
                "cluster_type": "job",
                "attached_cluster": {
                    "cluster_id": "job-956247bc",
                    "runtime": "Ray2.2.0-Py39-Spark3.3.1-CPU",
                    "cluster_name": "pacman-cluster",
                    "cluster_status": "",
                    "memory": 20,
                    "cores": 10,
                    "ray_dashboard": "",
                    "logs_dashboard": "",
                    "events_dashboard": ""
                },
                "dependent_libraries": "",
                "input_parameters": {},
                "retries": 1,
                "timeout": 7200,
                "depends_on": [],
                "task_validation_status": "VALID",
                "run_status": "INACTIVE"
            }
        ],
        "next_run_time": ""
    }