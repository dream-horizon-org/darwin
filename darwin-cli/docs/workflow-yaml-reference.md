# Workflow YAML Reference

This document describes the YAML structure for creating and updating workflows using the Darwin CLI.

## Darwin Section

| Key | Type | Required | Default | Description                                                                                                                                                                                       |
|-----|------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dir` | string | ✅ | — | Base source path for all task files. Example: If actual path is `https://github.com/<your-user-name>/test.py`, then `base_dir` is `https://github.com/<your-user-name>` and `source` is `test.py` |
| `created_by` | string | ❌ | — | Creator email. Overrides the value set by `workflow configure` command                                                                                                                            |

## Workflow Section

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `workflow_name` | string | ✅ | — | Unique workflow identifier |
| `display_name` | string | ❌ | "" | Human-readable name |
| `workflow_status` | string | ✅ | — | Used only in Update workflow YAML. Values: `active`, `inactive` |
| `description` | string | ❌ | "" | Description of the workflow |
| `tags` | List[string] | ❌ | [] | Tags associated with the workflow |
| `schedule` | string | ❌ | No schedule | Cron schedule expression |
| `timezone` | string | ❌ | IST | Timezone for Workflow Schedule: `IST` or `UTC` |
| `retries` | int | ❌ | 1 | Number of retries on failure |
| `notify_on` | string | ❌ | "" | Comma-separated Slack channel names for alerts. E.g., `"channel_1, channel_2"` |
| `start_date` | string | ❌ | Current IST timestamp | Workflow start date |
| `end_date` | string | ❌ | — | Workflow end date |
| `callback_url` | List[string] | ❌ | [] | URLs to notify on event |
| `event_types` | List[string] | ❌ | [] | Triggering events |
| `max_concurrent_runs` | int | ❌ | 1 | Maximum concurrent instances |
| `expected_run_duration` | int | ❌ | null | Expected time to run (in seconds) |
| `queue-enabled` | bool | ❌ | false | Queue when concurrent runs exceed max |
| `notification_preference` | Dict[str, bool] | ❌ | `{on_start: false, on_fail: true, on_success: false, on_skip: false}` | Notification settings |
| `tenant` | string | ❌ | "d11" | Tenant identifier |
| `tasks` | List[Task] | ✅ | — | Task definitions |

## Task Section

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `task_name` | string | ✅ | — | Task name |
| `source` | string | ✅ | — | Notebook/script source location |
| `source_type` | string | ❌ | workspace | Enum: `git` / `workspace` |
| `file_path` | string | ❌ | — | Path to notebook or script if `source_type` is `git` |
| `dynamic_artifact` | bool | ❌ | true | Whether to auto-fetch artifact |
| `cluster_name` | string | ✅* | — | Name of the cluster definition defined in `clusters` section. *Not required when `existing_cluster_id` is given |
| `existing_cluster_id` | string | ❌ | — | ID of an existing cluster to use |
| `cluster_type` | string | ✅ | — | Enum: `basic` / `job` |
| `dependent_libraries` | string | ❌ | — | Comma-separated list of libraries. E.g., `'lib1,lib2'` |
| `depends_on` | List[string] | ❌ | [] | List of task names this task depends on |
| `input_parameters` | Dict | ❌ | {} | Input parameters for the task |
| `retries` | int | ❌ | 1 | Number of retries on failure |
| `timeout` | int | ❌ | 7200 | Task timeout in seconds |
| `packages` | List[Package] | ❌ | [] | Package dependencies (see Package Section) |
| `ha_config` | Dict | ❌ | — | High availability configuration |

### Package Types

Packages can be specified in multiple formats:

```yaml
packages:
  - pypi: {'package': 'numpy==1.24.0', 'path': 'pypi_index_url'}
  - maven: {'package': 'org.apache.spark:spark-sql_2.12', 'version': '3.3.0', 'repository': 'SPARK', 'exclusions': 'org.slf4j:slf4j-log4j12'}
  - s3: {'path': 's3://my-bucket/libs/my-library.whl'}
  - workspace: {'path': '/Users/my_user/libs/utils.py'}
```

### HA Config

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `enable_ha` | bool | ❌ | false | Enable high availability |
| `replication_factor` | int | ❌ | 3 | Replication factor |
| `cluster_expiration_time` | int | ❌ | 86400 | Cluster expiration time in seconds |

## Cluster Section

Clusters are defined in the `clusters` section and referenced by name in tasks.

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `name` | string | ✅ | — | Unique cluster name |
| `runtime` | string | ✅ | — | Runtime version |
| `tags` | List[string] | ❌ | [] | Tags for the cluster |
| `terminate_after_minutes` | int | ❌ | -1 | Auto-terminate after idle time (-1 = disabled) |
| `is_job_cluster` | bool | ✅ | — | `true` = Job Cluster, `false` = All-purpose Cluster |
| `start_cluster` | bool | ❌ | false | Whether to start cluster immediately after creation |
| `head_node` | HeadNodeConfig | ✅ | — | Head node configuration |
| `worker_group` | List[WorkerNodeConfig] | ❌ | [] | Worker node configurations |
| `advance_config` | AdvanceConfig | ❌ | — | Advanced configuration options |

## HeadNodeConfig Section

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `cores` | int | ✅ | — | Number of CPU cores |
| `memory` | int | ✅ | — | Memory in GB |
| `node_type` | string | ❌ | null | Optional node type label |
| `node_capacity_type` | string | ❌ | ondemand | Capacity type: `ondemand` or `spot` |
| `gpu_pod` | object | ❌ | null | GPU configuration (if any) |

## WorkerNodeConfig Section

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `cores` | int | ✅ | — | CPU cores per pod |
| `memory` | int | ✅ | — | Memory per pod in GB |
| `min_pods` | int | ✅ | — | Minimum pod count |
| `max_pods` | int | ✅ | — | Maximum pod count |
| `node_type` | string | ❌ | null | Optional node type label |
| `node_capacity_type` | string | ❌ | ondemand | Capacity type: `ondemand` or `spot` |
| `gpu_pod` | object | ❌ | null | GPU configuration (if any) |

## AdvanceConfig Section

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `spark_config` | Dict[str, str] | ❌ | {} | Spark configuration parameters |
| `env_variables` | string | ❌ | "" | Environment variables |
| `init_script` | string | ❌ | "" | Initialization script (e.g., `pip install some-package`) |
| `instance_role` | Dict | ❌ | — | Instance role configuration with `id` and `display_name` |
| `ray_params` | Dict | ❌ | — | Ray start parameters |

### Ray Params

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `cpus_on_head` | int | ❌ | 0 | Number of CPUs on head node |
| `gpus_on_head` | int | ❌ | 0 | Number of GPUs on head node |
| `object_store_memory` | int | ❌ | 25 | Object store memory percentage |

## Example YAML

```yaml
variables:
  runtime: &runtime "1.0"
  terminate_after_minutes: &terminate_after_minutes 60
  
  spark_config: &spark_config
    spark.executor.memory: "4g"
    spark.driver.memory: "2g"

  head_node_config: &head_node_config
    node:
      cores: 2
      memory: 10
      node_capacity_type: ondemand

  worker_node_config: &worker_node_config
    max_pods: 2
    min_pods: 1
    node:
      cores: 4
      memory: 8
      node_capacity_type: spot

clusters:
  - name: my-job-cluster
    runtime: *runtime
    is_job_cluster: true
    start_cluster: false
    tags:
      - environment_tag
    terminate_after_minutes: *terminate_after_minutes
    head_node:
      <<: *head_node_config
    worker_group:
      - <<: *worker_node_config
    advance_config:
      spark_config:
        <<: *spark_config
      init_script: "pip install pandas numpy"
      instance_role:
        id: "1"
        display_name: "darwin-ds-role"
      ray_params:
        cpus_on_head: 0
        gpus_on_head: 0
        object_store_memory: 25

darwin:
  base_dir: "user@example.com/my_workspace"
  created_by: "user@example.com"
  env: "darwin-local"

workflows:
  - workflow_name: my-workflow
    display_name: "My ML Workflow"
    workflow_status: "active"
    description: "Example workflow for data processing"
    max_concurrent_runs: 1
    retries: 2
    schedule: "0 9 * * *"
    timezone: "IST"
    tags:
      - ml
      - data-processing
    notification_preference:
      on_start: false
      on_fail: true
      on_success: true
      on_skip: false
    tasks:
      - task_name: data_prep
        cluster_name: my-job-cluster
        cluster_type: job
        source: scripts/data_prep.py
        source_type: workspace
        depends_on: []
        retries: 1
        timeout: 3600
        input_parameters:
          date: "2024-01-01"
      
      - task_name: model_training
        cluster_name: my-job-cluster
        cluster_type: job
        source: scripts/train_model.py
        source_type: workspace
        depends_on:
          - data_prep
        retries: 2
        timeout: 7200
        packages:
          - pypi: {'package': 'scikit-learn==1.3.0', 'path': 'pypi_index_url'}
```

## Notes

- **Variables**: Use YAML anchors (`&`) and aliases (`*`) to define reusable variables
- **Workflow Status**: 
  - `inactive`: Only manual runs work
  - `active`: Both scheduled and manual runs work
- **Variable Override**: Use `<<:` operator to merge and override variable values
- **Multiple Workflows**: A single YAML file can contain multiple workflow definitions
