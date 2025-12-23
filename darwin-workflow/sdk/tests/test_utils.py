from unittest import TestCase
from workflow_model.job_cluster import RayParams
from darwin_workflow.util.utils import validate_cluster_type_in_cluster_and_workflow_yaml, \
    get_workflow_definition_from_yaml_values
from darwin_workflow.util.utils import get_job_cluster_definition_from_yaml_values


class TestWorkflowSDKUtils(TestCase):
    def test_validate_cluster_type_in_cluster_and_workflow_yaml(self):
        yaml_data = {
            "env": "prod",
            "clusters": [
                {
                    "name": "cluster_name",
                    "runtime": "Ray2.0.0-Py39-Spark3.2.0-CPU",
                    "tags": [
                        "test"
                    ],
                    "is_job_cluster": "True",
                    "head_node": {
                        "node": {
                            "cores": 4,
                            "memory": 8
                        }
                    },
                    "worker_group": [
                        {
                            "node": {
                                "cores": 16,
                                "memory": 32,
                                "node_capacity_type": "ondemand"
                            },
                            "min_pods": 4,
                            "max_pods": 8
                        }
                    ],
                },
                {
                    "name": "test-cluster-2",
                    "runtime": "Ray2.2.0-Py39-Spark3.3.1-CPU",
                    "is_job_cluster": "False",
                    "tags": [
                        "test2"
                    ],
                    "head_node": {
                        "node": {
                            "cores": 4,
                            "memory": 8
                        }
                    },
                    "worker_group": [
                        {
                            "node": {
                                "cores": 16,
                                "memory": 32
                            },
                            "min_pods": 4,
                            "max_pods": 8
                        }
                    ],
                }
            ],
            "workflow": {
                "workflow_name": "workflow_name",
                "description": "desc",
                "created_by": "test.user@example.com",
                "schedule": "0 10 * * *",
                "retries": 0,
                "notify_on": "slack_channel",
                "max_concurrent_runs": 16,
                "tags": [
                    "tag_1",
                    "tag_2"
                ],
                "tasks": [
                    {
                        "task_name": "test_1",
                        "cluster_id": "cluster_name",
                        "cluster_type": "basic",
                        "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                        "source_type": "workspace",
                        "file_path": "workflow_test.py",
                        "dynamic_artifact": "False",
                        "dependent_libraries": "mlflow==1.28.0 pymysql==1.0.2",
                        "input_parameters": {},
                        "retries": 0,
                        "timeout": 36000,
                        "depends_on": []
                    },
                    {
                        "task_name": "test_2",
                        "cluster_id": "cluster_name_2",
                        "cluster_type": "job",
                        "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                        "source_type": "workspace",
                        "dynamic_artifact": "False",
                        "file_path": "workflow_test.py",
                        "dependent_libraries": "mlflow==1.28.0 pymysql==1.0.2",
                        "input_parameters": {},
                        "retries": 0,
                        "timeout": 36000,
                        "depends_on": [
                            "test_1"
                        ]
                    }
                ]
            }
        }

        try:
            validate_cluster_type_in_cluster_and_workflow_yaml(yaml_data)
        except Exception as e:
            assert e.__str__() == ("Cluster type mismatch for cluster_id: cluster_name in workflow section yaml and "
                                   "clusters section yaml")

    def test_validate_cluster_type_in_cluster_and_workflow_yaml_scenario_2(self):
        yaml_data = {
            "env": "prod",
            "clusters": [
                {
                    "name": "cluster_name",
                    "runtime": "Ray2.0.0-Py39-Spark3.2.0-CPU",
                    "tags": [
                        "test"
                    ],
                    "is_job_cluster": "True",
                    "head_node": {
                        "node": {
                            "cores": 4,
                            "memory": 8
                        }
                    },
                    "worker_group": [
                        {
                            "node": {
                                "cores": 16,
                                "memory": 32,
                                "node_capacity_type": "ondemand"
                            },
                            "min_pods": 4,
                            "max_pods": 8
                        }
                    ],
                },
                {
                    "name": "test-cluster-2",
                    "runtime": "Ray2.2.0-Py39-Spark3.3.1-CPU",
                    "is_job_cluster": "True",
                    "tags": [
                        "test2"
                    ],
                    "head_node": {
                        "node": {
                            "cores": 4,
                            "memory": 8
                        }
                    },
                    "worker_group": [
                        {
                            "node": {
                                "cores": 16,
                                "memory": 32
                            },
                            "min_pods": 4,
                            "max_pods": 8
                        }
                    ],
                }
            ],
            "workflow": {
                "workflow_name": "workflow_name",
                "description": "desc",
                "created_by": "test.user@example.com",
                "schedule": "0 10 * * *",
                "retries": 0,
                "notify_on": "slack_channel",
                "max_concurrent_runs": 16,
                "tags": [
                    "tag_1",
                    "tag_2"
                ],
                "tasks": [
                    {
                        "task_name": "test_1",
                        "cluster_id": "test-cluster-2",
                        "cluster_type": "basic",
                        "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                        "source_type": "workspace",
                        "file_path": "workflow_test.py",
                        "dynamic_artifact": "False",
                        "dependent_libraries": "mlflow==1.28.0 pymysql==1.0.2",
                        "input_parameters": {},
                        "retries": 0,
                        "timeout": 36000,
                        "depends_on": []
                    },
                    {
                        "task_name": "test_2",
                        "cluster_id": "cluster_name_2",
                        "cluster_type": "job",
                        "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                        "source_type": "workspace",
                        "dynamic_artifact": "False",
                        "file_path": "workflow_test.py",
                        "dependent_libraries": "mlflow==1.28.0 pymysql==1.0.2",
                        "input_parameters": {},
                        "retries": 0,
                        "timeout": 36000,
                        "depends_on": [
                            "test_1"
                        ]
                    }
                ]
            }
        }

        try:
            validate_cluster_type_in_cluster_and_workflow_yaml(yaml_data)
        except Exception as e:
            assert e.__str__() == ("Cluster type mismatch for cluster_id: test-cluster-2 in workflow section yaml "
                                   "and clusters section yaml")

    def test_get_job_cluster_definition_from_yaml_values(self):
        cluster_info = {'name': 'test_cluster', 'runtime': 'Ray2.0.0-Py39-Spark3.2.0-CPU', 'tags': ['test'],
                        'is_job_cluster': True, 'head_node': {'node': {'cores': 4, 'memory': 8}}, 'worker_group': [
                {'node': {'cores': 16, 'memory': 32, 'node_capacity_type': 'ondemand'}, 'min_pods': 4, 'max_pods': 8}],
                        'advance_config': {'env_variables': '', 'log_path': '', 'init_script': ['test_script.py'],
                                           'instance_role': '', 'availability_zone': '',
                                           'ray_start_params': {'object_store_memory_perc': 10, 'num_cpus_on_head': 0}}}

        cluster_definition_request = get_job_cluster_definition_from_yaml_values(cluster_info, "test_cluster",
                                                                                 "test_user")

        assert cluster_definition_request.cluster_name == "test_cluster"
        assert cluster_definition_request.advance_config.ray_params == RayParams(object_store_memory=10, cpus_on_head=0,
                                                                                 gpus_on_head=0)

    def test_get_workflow_definition_from_yaml_values(self):
        yaml_data = {
            "workflow_name": "workflow_name",
            "description": "desc",
            "created_by": "test.user@example.com",
            "schedule": "0 10 * * *",
            "retries": 0,
            "notify_on": "slack_channel",
            "max_concurrent_runs": 16,
            "tags": [
                "tag_1",
                "tag_2"
            ],
            "tasks": [
                {
                    "task_name": "test_1",
                    "cluster_id": "243243",
                    "cluster_type": "basic",
                    "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                    "source_type": "workspace",
                    "file_path": "workflow_test.py",
                    "dynamic_artifact": False,
                    "dependent_libraries": [
                        "mlflow==1.28.0", "pandas==1.3.3"
                    ],
                    "input_parameters": {},
                    "retries": 0,
                    "timeout": 36000,
                    "depends_on": []
                },
                {
                    "task_name": "test_2",
                    "cluster_id": "243243",
                    "cluster_type": "job",
                    "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                    "source_type": "workspace",
                    "dynamic_artifact": False,
                    "file_path": "workflow_test.py",
                    "dependent_libraries": None,
                    "input_parameters": {},
                    "retries": 0,
                    "timeout": 36000,
                    "depends_on": [
                        "test_1"
                    ]
                }
            ]
        }

        workflow_request = get_workflow_definition_from_yaml_values(yaml_data)

        self.assertEqual(workflow_request.workflow_name, "workflow_name")
        self.assertEqual(workflow_request.description, "desc")
        self.assertEqual(workflow_request.schedule, "0 10 * * *")
        self.assertEqual(len(workflow_request.tasks), 2)
        self.assertEqual(workflow_request.tasks[0].task_name, "test_1")
        self.assertEqual(workflow_request.tasks[0].cluster_id, "243243")
        self.assertEqual(workflow_request.tasks[0].cluster_type, "basic")
        self.assertEqual(workflow_request.tasks[0].dependent_libraries, "mlflow==1.28.0,pandas==1.3.3")
        self.assertEqual(workflow_request.tasks[1].dependent_libraries, "")

    def test_get_workflow_definition_from_yaml_values_with_notifications_and_trigger_rule(self):
        yaml_data = {
            "workflow_name": "workflow_name",
            "description": "desc",
            "created_by": "test.user@example.com",
            "schedule": "0 10 * * *",
            "retries": 0,
            "notify_on": "slack_channel",
            "max_concurrent_runs": 16,
            "tags": [
                "tag_1",
                "tag_2"
            ],
            "tasks": [
                {
                    "task_name": "test_1",
                    "cluster_id": "243243",
                    "cluster_type": "basic",
                    "source": "test.user@example.com/Connected_Experience/affinity_to_sports",
                    "source_type": "workspace",
                    "file_path": "workflow_test.py",
                    "dynamic_artifact": False,
                    "dependent_libraries": [
                        "mlflow==1.28.0", "pandas==1.3.3"
                    ],
                    "input_parameters": {},
                    "retries": 0,
                    "timeout": 36000,
                    "depends_on": [],
                    "notify_on": "on_fail",
                    "notification_preference": {"on_start": False, "on_fail": True, "on_success": False, "on_skip": False},
                    "trigger_rule": "one_failed"
                }
            ]
        }

        workflow_request = get_workflow_definition_from_yaml_values(yaml_data)
        task = workflow_request.tasks[0]
        self.assertEqual(task.notify_on, "on_fail")
        self.assertEqual(task.notification_preference, {"on_start": True, "on_fail": True, "on_success": False, "on_skip": False})
        self.assertEqual(str(task.trigger_rule), "one_failed")
