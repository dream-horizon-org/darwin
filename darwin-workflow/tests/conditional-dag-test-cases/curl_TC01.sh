curl --location "${WORKFLOW_API_URL:-http://localhost:8000}/v2/workflow" \
--header 'msd-user: {"email":"test.user@example.com","id":""}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "workflow_name": "TC01_test_trigger_rule_all_success",
    "display_name": "TC01_test_trigger_rule_all_success",
    "description": "Test case TC01: target task3, trigger_rule all_success, upstream statuses: Failed, success",
    "tags": [
        "test_user", "TC01"
    ],
    "schedule": "",
    "retries": 1,
    "notify_on": "",
    "parameters": {},
    "callback_urls": [],
    "event_types": [],
    "max_concurrent_runs": 1,
    "created_by": "test.user@example.com",
    "tasks": [
        {
            "task_name": "test_task1",
            "source": "https://github.com/darwin/darwin-workflow/tree/feat/notification+trigger+abort",
            "source_type": "git",
            "file_path": "test.py",
            "dynamic_artifact": true,
            "cluster_type": "job",
            "cluster_id": "job-5154523f",
            "attached_cluster": {
                "cluster_id": "job-5154523f",
                "runtime": "Ray2.5.1-Py310-Spark3.3.1-CPU",
                "cluster_name": "test-cluster-121123",
                "cluster_status": "",
                "memory": 10,
                "cores": 10,
                "ray_dashboard": "",
                "logs_dashboard": "",
                "events_dashboard": "",
                "created_by": null,
                "created_at": "2025-05-27T16:39:01",
                "estimated_cost": "0.21 - 0.212"
            },
            "dependent_libraries": "",
            "input_parameters": {},
            "retries": 3,
            "timeout": 7200,
            "depends_on": [],
            "task_validation_status": "VALID",
            "packages": [],
            "run_status": "INACTIVE",
            "ha_config": {
                "enable_ha": false,
                "cluster_ids": [],
                "replication_factor": 3,
                "cluster_expiration_time": 86400
            },
            "notification_preference": {},
            "notify_on": "test_workflow_mohit"
        },
        {
            "task_name": "test_task2",
            "source": "https://github.com/darwin/darwin-workflow/tree/feat/notification+trigger+abort",
            "source_type": "git",
            "file_path": "test.py",
            "dynamic_artifact": true,
            "cluster_type": "job",
            "cluster_id": "job-5154523f",
            "attached_cluster": {
                "cluster_id": "job-5154523f",
                "runtime": "Ray2.5.1-Py310-Spark3.3.1-CPU",
                "cluster_name": "test-cluster-121123",
                "cluster_status": "",
                "memory": 10,
                "cores": 10,
                "ray_dashboard": "",
                "logs_dashboard": "",
                "events_dashboard": "",
                "created_by": null,
                "created_at": "2025-05-27T16:39:01",
                "estimated_cost": "0.21 - 0.212"
            },
            "dependent_libraries": "",
            "input_parameters": {},
            "retries": 3,
            "timeout": 7200,
            "depends_on": [],
            "task_validation_status": "VALID",
            "packages": [],
            "run_status": "INACTIVE",
            "ha_config": {
                "enable_ha": false,
                "cluster_ids": [],
                "replication_factor": 3,
                "cluster_expiration_time": 86400
            },
            "notification_preference": {},
            "notify_on": "test_workflow_mohit"
        },
        {
            "task_name": "test_task3",
            "source": "https://github.com/darwin/darwin-workflow/tree/feat/notification+trigger+abort",
            "source_type": "git",
            "file_path": "test.py",
            "dynamic_artifact": true,
            "cluster_type": "job",
            "cluster_id": "job-5154523f",
            "attached_cluster": {
                "cluster_id": "job-5154523f",
                "runtime": "Ray2.5.1-Py310-Spark3.3.1-CPU",
                "cluster_name": "test-cluster-121123",
                "cluster_status": "",
                "memory": 10,
                "cores": 10,
                "ray_dashboard": "",
                "logs_dashboard": "",
                "events_dashboard": "",
                "created_by": null,
                "created_at": "2025-05-27T16:39:01",
                "estimated_cost": "0.21 - 0.212"
            },
            "dependent_libraries": "",
            "input_parameters": {},
            "retries": 3,
            "timeout": 7200,
            "depends_on": ["test_task1", "test_task2"],
            "task_validation_status": "VALID",
            "packages": [],
            "run_status": "INACTIVE",
            "ha_config": {
                "enable_ha": false,
                "cluster_ids": [],
                "replication_factor": 3,
                "cluster_expiration_time": 86400
            },
            "notification_preference": {},
            "notify_on": "test_workflow_mohit"
            "trigger_rule": "all_success"
        }
    ],
    "next_run_time": "",
    "expected_run_duration": null,
    "queue_enabled": false,
    "notification_preference": {
        "on_start": true,
        "on_fail": true,
        "on_success": true,
        "on_skip": true
    }
}' 