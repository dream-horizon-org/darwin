# Darwin CLI

**Unified Command Line Interface for Darwin ML Platform**

Darwin CLI provides a single entry point to interact with all Darwin ML Platform services including Compute, Workspace, Serve, MLflow, Feature Store, and Catalog.

---

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Services](#services)
  - [Config](#config-commands)
  - [Compute](#compute-commands)
  - [Workspace](#workspace-commands)
  - [Serve](#serve-commands)
  - [MLflow](#mlflow-commands)
  - [Feature Store](#feature-store-commands)
  - [Catalog](#catalog-commands)
  - [Workflow](#workflow-commands)

---

## Installation

### Prerequisites

- Python 3.9.7+
- pip

### Install from Source

```bash

# Create virtual environment (optional but recommended)
python3.9 -m venv .venv
source .venv/bin/activate

# Install the CLI
cd darwin-cli
python setup.py sdist && pip install --upgrade pip && pip install dist/darwin-cli-1.0.0.tar.gz --force-reinstall
```

### Verify Installation

```bash
darwin --help
```

---

## Configuration

Before using the CLI, you must set the environment:

```bash
# Set environment (required for first-time setup)
darwin config set --env darwin-local
```

### Config Commands

| Command | Description | Example |
|---------|-------------|---------|
| `config set` | Set CLI environment | `darwin config set --env darwin-local` |
| `config get` | Get current config | `darwin config get` |
| `config get --env` | Get config for specific env | `darwin config get --env darwin-local` |

---

## Services

---

## Compute Commands

Manage Ray compute clusters for ML workloads.

### Cluster Operations

| Command | Description | Example |
|---------|-------------|---------|
| `compute create` | Create cluster (inline) | See below |
| `compute create --file` | Create cluster (from YAML) | `darwin compute create --file examples/compute/cluster-config.yaml` |
| `compute list` | List all clusters | `darwin compute list --page-size 10` |
| `compute get` | Get cluster details | `darwin compute get --cluster-id <CLUSTER_ID>` |
| `compute get --metadata` | Get cluster metadata | `darwin compute get --cluster-id <CLUSTER_ID> --metadata` |
| `compute start` | Start a stopped cluster | `darwin compute start --cluster-id <CLUSTER_ID>` |
| `compute stop` | Stop a running cluster | `darwin compute stop --cluster-id <CLUSTER_ID>` |
| `compute restart` | Restart a cluster | `darwin compute restart --cluster-id <CLUSTER_ID>` |
| `compute update` | Update cluster config | See below |
| `compute delete` | Delete a cluster | `darwin compute delete --cluster-id <CLUSTER_ID>` |

#### Create Cluster (Inline Parameters)

```bash
darwin compute create \
  --name my-ml-cluster \
  --runtime 0.0 \
  --head-cores 4 \
  --head-memory 8 \
  --worker-cores 2 \
  --worker-memory 4 \
  --worker-min 1 \
  --worker-max 3 \
  --terminate-after 60 \
  --user user@example.com \
  --tags ml-training,experiment
```

#### Update Cluster (Inline Parameters)

```bash
darwin compute update \
  --cluster-id <CLUSTER_ID> \
  --name updated-cluster \
  --runtime 0.0 \
  --head-cores 8 \
  --head-memory 16 \
  --worker-cores 4 \
  --worker-memory 8 \
  --worker-min 2 \
  --worker-max 5
```

### Package Management

| Command | Description | Example |
|---------|-------------|---------|
| `compute packages list` | List installed packages | `darwin compute packages list --cluster-id <CLUSTER_ID>` |
| `compute packages install` | Install a package | See below |
| `compute packages uninstall` | Uninstall packages | `darwin compute packages uninstall --cluster-id <CLUSTER_ID> --package-ids 1,2,3` |

#### Install Package

Install packages from different sources:

**PyPI Package:**
```bash
darwin compute packages install \
  --cluster-id <CLUSTER_ID> \
  --source pypi \
  --name tensorflow \
  --version 2.19.0
```

**Maven Package:**
```bash
darwin compute packages install \
  --cluster-id <CLUSTER_ID> \
  --source maven \
  --name "org.apache.commons:commons-csv" \
  --version 1.14.0 \
  --repository maven
```

**Maven Package (Spark repository):**
```bash
darwin compute packages install \
  --cluster-id <CLUSTER_ID> \
  --source maven \
  --name "org.apache.spark:spark-sql_2.12" \
  --version 3.5.0 \
  --repository spark
```

**S3 Package:**
```bash
darwin compute packages install \
  --cluster-id <CLUSTER_ID> \
  --source s3 \
  --path s3://bucket/packages/custom-lib.whl
```

**Workspace Package:**
```bash
darwin compute packages install \
  --cluster-id <CLUSTER_ID> \
  --source workspace \
  --path /workspace/project/dist/my-lib-1.0.0.whl
```

---

## Workspace Commands

Manage projects and codespaces for collaborative ML development.

### Project Operations

| Command | Description | Example |
|---------|-------------|---------|
| `workspace project create` | Create a project | See below |
| `workspace project list` | List projects | `darwin workspace project list --user user@example.com` |
| `workspace project count` | Get project count | `darwin workspace project count --user user@example.com` |
| `workspace project update` | Update project name | See below |
| `workspace project delete` | Delete a project | `darwin workspace project delete --project-id 1 --user user@example.com` |
| `workspace project check-unique` | Check name uniqueness | `darwin workspace project check-unique --name my-project --user user@example.com` |

#### Create Project

```bash
darwin workspace project create \
  --project-name my-ml-project \
  --codespace-name default \
  --user user@example.com
```

#### Update Project

```bash
darwin workspace project update \
  --project-id 1 \
  --project-name renamed-project \
  --user user@example.com
```

### Codespace Operations

| Command | Description | Example |
|---------|-------------|---------|
| `workspace codespace create` | Create a codespace | See below |
| `workspace codespace list` | List codespaces | `darwin workspace codespace list --project-id 1` |
| `workspace codespace launch` | Launch codespace | `darwin workspace codespace launch --project-id 1 --codespace-id 1 --user user@example.com` |
| `workspace codespace update` | Update codespace | See below |
| `workspace codespace delete` | Delete codespace | `darwin workspace codespace delete --project-id 1 --codespace-id 2 --user user@example.com` |
| `workspace codespace check-unique` | Check name uniqueness | `darwin workspace codespace check-unique --name dev --project-id 1 --user user@example.com` |

#### Create Codespace

```bash
darwin workspace codespace create \
  --project-id 1 \
  --codespace-name development \
  --user user@example.com
```

#### Update Codespace

```bash
darwin workspace codespace update \
  --project-id 1 \
  --codespace-id 1 \
  --codespace-name renamed-codespace \
  --user user@example.com
```

### Cluster Attachment

| Command | Description | Example |
|---------|-------------|---------|
| `workspace cluster attach` | Attach cluster to codespace | See below |
| `workspace cluster detach` | Detach cluster | `darwin workspace cluster detach --codespace-id 1 --cluster-id <CLUSTER_ID> --user user@example.com` |
| `workspace cluster codespaces` | Get codespaces by cluster | `darwin workspace cluster codespaces --cluster-id <CLUSTER_ID>` |

#### Attach Cluster

```bash
darwin workspace cluster attach \
  --codespace-id 1 \
  --cluster-id <CLUSTER_ID> \
  --project-id 1 \
  --user user@example.com
```

---

## Serve Commands

Deploy and manage ML model serving endpoints.

### Environment Operations

| Command | Description | Example |
|---------|-------------|---------|
| `serve environment create` | Create environment | See below |
| `serve environment get` | Get environment details | `darwin serve environment get --name darwin-local` |
| `serve environment update` | Update environment | See below |
| `serve environment delete` | Delete environment | `darwin serve environment delete --name darwin-local` |

#### Create Environment

```bash
darwin serve environment create \
  --name darwin-local \
  --domain-suffix .local \
  --cluster-name kind \
  --namespace serve
```

#### Update Environment

```bash
darwin serve environment update \
  --name darwin-local \
  --namespace serve-updated
```

### Serve Operations

| Command | Description | Example |
|---------|-------------|---------|
| `serve list` | List all serves | `darwin serve list` |
| `serve create` | Create a serve | See below |
| `serve get` | Get serve overview | `darwin serve get --name my-serve` |
| `serve status` | Get serve status | `darwin serve status --name my-serve --env darwin-local` |
| `serve undeploy` | Undeploy serve | `darwin serve undeploy --name my-serve --env darwin-local` |

#### Create Serve

```bash
darwin serve create \
  --name my-serve \
  --type api \
  --space ml-models \
  --description "My ML model serving endpoint"
```

### Config Operations

| Command | Description | Example |
|---------|-------------|---------|
| `serve config create` | Create serve config | See below |
| `serve config get` | Get serve config | `darwin serve config get --serve-name my-serve --env darwin-local` |
| `serve config update` | Update serve config | Similar to create |

#### Create Serve Config

```bash
darwin serve config create \
  --serve-name my-serve \
  --env darwin-local \
  --backend-type fastapi \
  --cores 2 \
  --memory 4 \
  --node-capacity ondemand \
  --min-replicas 1 \
  --max-replicas 3
```

Or using a file:

```bash
darwin serve config create \
  --serve-name my-serve \
  --env darwin-local \
  --file examples/serve/infra_config.yaml
```

### Artifact Operations

| Command | Description | Example |
|---------|-------------|---------|
| `serve artifact create` | Create artifact | See below |
| `serve artifact list` | List artifacts | `darwin serve artifact list --serve-name my-serve` |
| `serve artifact jobs` | List builder jobs | `darwin serve artifact jobs` |
| `serve artifact status` | Get build status | `darwin serve artifact status --job-id <JOB_ID>` |

#### Create Artifact

```bash
darwin serve artifact create \
  --serve-name my-serve \
  --version v1.0.0 \
  --github-repo-url https://github.com/org/repo \
  --branch main
```

### Deployment Operations

| Command | Description | Example |
|---------|-------------|---------|
| `serve deploy` | Deploy artifact | `darwin serve deploy --serve-name my-serve --file examples/serve/deploy_artifact.yaml` |
| `serve deploy-model` | One-click model deploy | See below |
| `serve undeploy-model` | Undeploy model | `darwin serve undeploy-model --serve-name my-serve --env darwin-local` |

#### Deploy Model (One-Click)

```bash
darwin serve deploy-model \
  --serve-name my-model \
  --artifact-version v1.0.0 \
  --model-uri models:/my-model/1 \
  --env darwin-local \
  --cores 2 \
  --memory 4 \
  --node-capacity ondemand \
  --min-replicas 1 \
  --max-replicas 3
```

### Repository Template

| Command | Description | Example |
|---------|-------------|---------|
| `serve repo create` | Create serve repo from template | `darwin serve repo create --template hermes/src/templates/fastapi_template/ --output ./my-serve` |

---

## MLflow Commands

Manage experiment tracking and model registry.

### Experiment Operations

| Command | Description | Example |
|---------|-------------|---------|
| `mlflow experiment create` | Create experiment | `darwin mlflow experiment create --name my-experiment` |
| `mlflow experiment get` | Get experiment | `darwin mlflow experiment get --experiment-id 1` |
| `mlflow experiment update` | Rename experiment | `darwin mlflow experiment update --experiment-id 1 --name new-name` |
| `mlflow experiment delete` | Delete experiment | `darwin mlflow experiment delete --experiment-id 1` |

### Run Operations

| Command | Description | Example |
|---------|-------------|---------|
| `mlflow run create` | Create a run | `darwin mlflow run create --experiment-id 1 --run-name training-run` |
| `mlflow run get` | Get run details | `darwin mlflow run get --experiment-id 1 --run-id <RUN_ID>` |
| `mlflow run log` | Log metric/param | See below |
| `mlflow run delete` | Delete a run | `darwin mlflow run delete --experiment-id 1 --run-id <RUN_ID>` |

#### Log Metric

```bash
darwin mlflow run log \
  --run-id <RUN_ID> \
  --metric-key accuracy \
  --metric-value 0.95
```

#### Log Parameter

```bash
darwin mlflow run log \
  --run-id <RUN_ID> \
  --param-key learning_rate \
  --param-value "0.001"
```

### Model Registry Operations

| Command | Description | Example |
|---------|-------------|---------|
| `mlflow model list` | List all models | `darwin mlflow model list` |
| `mlflow model search` | Search models | `darwin mlflow model search --query house` |
| `mlflow model get` | Get model details | `darwin mlflow model get --name my-model` |
| `mlflow model get --version` | Get model version | `darwin mlflow model get --name my-model --version 1` |

---

## Feature Store Commands

Manage entities, feature groups, and features for ML.

> **Note**: Features read/write operations require properly configured backend service URLs.

### Entity Operations

| Command | Description | Example |
|---------|-------------|---------|
| `feature-store entity create` | Create entity from YAML | `darwin feature-store entity create --file examples/feature_store/entity-config.yaml` |
| `feature-store entity get` | Get entity by name | `darwin feature-store entity get --name user_entity` |

### Feature Group Operations

| Command | Description | Example |
|---------|-------------|---------|
| `feature-store feature-group create` | Create feature group | `darwin feature-store feature-group create --file examples/feature_store/feature-group-config.yaml` |
| `feature-store feature-group create --upgrade` | Create or upgrade FG version | `darwin feature-store feature-group create --file examples/feature_store/feature-group-config.yaml --upgrade` |
| `feature-store feature-group get` | Get feature group | `darwin feature-store feature-group get --name user_features` |
| `feature-store feature-group get --version` | Get specific FG version | `darwin feature-store feature-group get --name user_features --version v1` |
| `feature-store feature-group schema` | Get FG schema | `darwin feature-store feature-group schema --name user_features` |
| `feature-store feature-group version` | Get latest FG version | `darwin feature-store feature-group version --name user_features` |
| `feature-store feature-group update-state` | Update FG state (LIVE/ARCHIVED) | `darwin feature-store feature-group update-state --name user_features --version v1 --state LIVE` |

### Feature Read/Write Operations

| Command | Description | Example |
|---------|-------------|---------|
| `feature-store features read` | Read features from FG | `darwin feature-store features read --file examples/feature_store/read-features.yaml` |
| `feature-store features write` | Write features to FG | `darwin feature-store features write --file examples/feature_store/write-features.yaml` |

---

## Catalog Commands

Discover and manage data assets, lineage, and quality rules.

### Search

| Command | Description | Example |
|---------|-------------|---------|
| `catalog search` | Search assets | `darwin catalog search --regex ".*users.*"` |

### Asset Operations

| Command | Description | Example |
|---------|-------------|---------|
| `catalog asset list` | List assets | `darwin catalog asset list --regex ".*" --page-size 10` |
| `catalog asset get` | Get asset by FQDN | `darwin catalog asset get --fqdn db.schema.table` |
| `catalog asset get --fields` | Get specific fields | `darwin catalog asset get --fqdn db.schema.table --fields name,description,owner` |

### Lineage Operations

| Command | Description | Example |
|---------|-------------|---------|
| `catalog lineage get` | Get asset lineage | `darwin catalog lineage get --fqdn db.schema.table` |

### Schema Operations

| Command | Description | Example |
|---------|-------------|---------|
| `catalog schema list` | List schemas | `darwin catalog schema list --category PII --status CLASSIFIED` |

### Rule Operations

| Command | Description | Example |
|---------|-------------|---------|
| `catalog rules list` | List rules for asset | `darwin catalog rules list --fqdn db.schema.table` |
| `catalog rules create` | Create a rule | `darwin catalog rules create --file examples/catalog/post-rule.yaml` |
| `catalog rules update` | Update a rule | `darwin catalog rules update --rule-id 1 --file examples/catalog/update-rule.yaml` |
| `catalog rules delete` | Delete a rule | `darwin catalog rules delete --fqdn db.schema.table --rule-id 1` |

### Metrics Operations

| Command | Description | Example |
|---------|-------------|---------|
| `catalog metrics push` | Push bulk metrics | `darwin catalog metrics push --file examples/catalog/bulk-metrics.yaml` |

### Description Operations

| Command | Description | Example |
|---------|-------------|---------|
| `catalog descriptions update` | Update descriptions | `darwin catalog descriptions update --file examples/catalog/bulk-descriptions.yaml` |

---

## Workflow Commands

Orchestrate and manage ML workflows and pipelines.

> 📖 **[Workflow YAML Reference](docs/workflow-yaml-reference.md)** - Complete documentation for workflow YAML structure including all fields, types, and examples.

### Workflow Operations

| Command | Description | Example                                                                          |
|---------|-------------|----------------------------------------------------------------------------------|
| `workflow create` | Create workflow from YAML | `darwin workflow create --file examples/workflow/workflow-config.yaml`           |
| `workflow update` | Update workflow from YAML | `darwin workflow update --file examples/workflow/workflow-config.yaml`           |
| `workflow list` | List all workflows | `darwin workflow list`                                                           |
| `workflow get` | Get workflow by ID or name | `darwin workflow get --name my-workflow`                                         |
| `workflow delete` | Delete a workflow | `darwin workflow delete --workflow-id wf_id-abc123`                              |
| `workflow trigger` | Trigger workflow run | `darwin workflow trigger --workflow-id wf_id-abc123`                             |
| `workflow run-with-params` | Run with parameters | `darwin workflow run-with-params --name my-workflow --params '{"key": "value"}'` |
| `workflow pause` | Pause a workflow | `darwin workflow pause --workflow-id wf_id-abc123`                               |
| `workflow resume` | Resume a workflow | `darwin workflow resume --workflow-id wf_id-abc123`                              |

#### Create Workflow

```bash
darwin workflow create \
  --file examples/workflow/workflow-config.yaml \
  --created-by user@example.com
```

#### Trigger Workflow with Parameters

```bash
darwin workflow trigger \
  --workflow-id wf_id-abc123 \
  --params '{"input_date": "2024-01-01", "mode": "full"}' \
  --user user@example.com
```

### Workflow Run Operations

| Command | Description | Example |
|---------|-------------|---------|
| `workflow run list` | List runs for workflow | `darwin workflow run list --workflow-id wf_id-abc123` |
| `workflow run get` | Get run details | `darwin workflow run get --workflow-id wf_id-abc123 --run-id run-xyz` |
| `workflow run status` | Get run status | `darwin workflow run status --workflow-id wf_id-abc123` |
| `workflow run stop` | Stop a running workflow | `darwin workflow run stop --run-id run-xyz --workflow-id wf_id-abc123` |
| `workflow run task` | Get task details | `darwin workflow run task --workflow-id wf_id-abc123 --run-id run-xyz --task-id task-1` |
| `workflow run repair` | Retry failed tasks | `darwin workflow run repair --workflow-id wf_id-abc123 --run-id run-xyz --tasks task1,task2` |

### Job Cluster Operations

| Command | Description | Example                                                                                                    |
|---------|-------------|------------------------------------------------------------------------------------------------------------|
| `workflow job-cluster list` | List job clusters | `darwin workflow job-cluster list`                                                                         |
| `workflow job-cluster get` | Get job cluster details | `darwin workflow job-cluster get --job-cluster-id job-abc123`                                              |
| `workflow job-cluster create` | Create job cluster | `darwin workflow job-cluster create --file examples/workflow/job-cluster.yaml`                             |
| `workflow job-cluster update` | Update job cluster | `darwin workflow job-cluster update --job-cluster-id job-abc123 --file examples/workflow/job-cluster.yaml` |

#### Create Job Cluster

```bash
darwin workflow job-cluster create \
  --file examples/workflow/job-cluster.yaml
```

**Job Cluster YAML Format:**

```yaml
cluster_name: my-job-cluster
runtime: spark-conect-verf4
tags:
  - ml-training
  - production
terminate_after_minutes: 60
head_node:
  cores: 4
  memory: 16
  node_capacity_type: ondemand
worker_group:
  - cores_per_pods: 4
    memory_per_pods: 16
    min_pods: 1
    max_pods: 3
    node_capacity_type: spot
advance_config:
  spark_config:
    spark.executor.memory: "4g"
  init_script: "pip install pandas numpy"
  instance_role:
    id: "1"
    display_name: darwin-ds-role
user: user@example.com
```

---

## Global Options

All commands support these common options:

| Option | Description | Default |
|--------|-------------|---------|
| `--retries` | Number of retry attempts | 1 |
| `--help` | Show command help | - |

---

## Examples Directory

The `examples/` directory contains sample YAML configuration files:

```
examples/
├── catalog/
│   ├── bulk-descriptions.yaml
│   ├── bulk-metrics.yaml
│   ├── openlineage-event.yaml
│   ├── post-rule.yaml
│   └── update-rule.yaml
├── compute/
│   └── cluster-config.yaml
├── feature_store/
│   ├── entity-config.yaml
│   ├── entity-update.yaml
│   ├── feature-group-config.yaml
│   ├── feature-group-update.yaml
│   ├── multi-read-features.yaml
│   ├── read-features.yaml
│   ├── read-partition.yaml
│   ├── run-data.yaml
│   ├── tenant-config.yaml
│   ├── tenant-update.yaml
│   └── write-features.yaml
├── serve/
│   ├── deploy_artifact.yaml
│   └── infra_config.yaml
└── workflow/
    ├── workflow-config.yaml
    └── job-cluster.yaml
```

---

## Troubleshooting

### Environment Not Set

```
RuntimeError: Environment is not set. Please configure it with 'darwin config set --env <env>'.
```

**Solution:** Run `darwin config set --env darwin-local`

### Service Not Available

If a service returns connection errors, ensure:
1. The Darwin platform is running locally (Kind cluster)
2. Port forwarding is set up correctly
3. The service pods are healthy

### Check Service Status

```bash
export KUBECONFIG=kind/config/kindkubeconfig.yaml
kubectl get pods -n darwin
```

---