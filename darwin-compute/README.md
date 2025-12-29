# darwin-compute

Darwin Compute App Layer.
This repo sits behind the Darwin Compute UI and is responsible for handling requests for Ray Clusters, Jupyter Pods and
Spark History Server.
It interacts with MySQL for storing metadata and Elasticsearch for storing detailed information about the clusters.

## Repository Structure

    .
    ├── README.md                   # The top-level README for developers using this project.
    ├── app_layer
    │   ├── src
    │   │   └── compute_app_layer   # FastAPI app layer
    │   └── tests
    │       └── conftest.py
    ├── core
    │   ├── src
    │   │   └── compute_core        # Core logic for the app layer
    │   └── tests
    │       └── conftest.py
    ├── model
    │   ├── src
    │   │   └── compute_model       # Data models for the app layer and sdk
    │   └── tests
    │       └── conftest.py
    ├── resources
    │   └── db
    │       └── mysql
    │           └── migrations      # Mysql migrations script
    ├── runtimes                    # Runtime dockerfiles
    │   ├── cpu
    │   │   └── tests
    │   ├── gpu
    │   │   └── tests
    │   └── runtime_doc_generator.py
    ├── script
    │   ├── src
    │   │   └── compute_script      # Scripts for the app layer
    │   └── tests
    │       └── conftest.py
    ├── sdk
    │   ├── src
    │   │   └── compute_sdk         # SDK for the app layer
    │   └── tests
    │       └── conftest.py
    └── utility_scripts             # Utility scripts for the project

## Environment Variables

| Environment Variable          | Description                   |
|-------------------------------|-------------------------------|
| ENV                           | Environment (stag, uat, prod) |
| TEAM_SUFFIX                   | Odin Team Suffix              |
| VPC_SUFFIX                    | Odin VPC Suffix               |
| VAULT_SERVICE_MYSQL_USERNAME  | Mysql Username                |
| VAULT_SERVICE_MYSQL_PASSWORD  | Mysql Password                |
| CONFIG_SERVICE_MYSQL_DATABASE | Mysql Database Name           |
| VAULT_SERVICE_ES_USERNAME     | Elasticsearch Username        |
| VAULT_SERVICE_ES_PASSWORD     | Elasticsearch Password        |
| VAULT_SERVICE_SLACK_TOKEN     | Slack Token for Alerts        |
| VAULT_SERVICE_SLACK_USERNAME  | Slack Username for Alerts     |
| LOG_DIR                       | Log Directory Path            |
| LOG_FILE                      | Log File Path                 |

## Project Setup Instructions

### Pycharm Setup

1. Mark all the `src` directories as source directories in PyCharm. (Right-click > Mark Directory as > Sources Root)

2. Mark all the `tests` directories as test directories in PyCharm. (Right-click > Mark Directory as > Test Sources
   Root)

3. Install dependencies after connecting with prod vpn.
    ```shell
    pip install -e app_layer/.
    pip install -e core/.
    pip install -e model/.
    pip install -e script/.
    pip install -e sdk/.

    pip install -r core/requirements_dev.txt
    ```

4. Install Black for linting purposes. Go to Settings > Tools > Black. In black settings add `-l 120`. Apply and OK.

5. Setup Plugins. Settings > Plugins
    1. Install Github Copilot and EnvFile Plugins from Pycharm Marketplace
    2. Setup EnvFile
        1. Create env folder and add test.env, local.env files in it.
    3. Go to Run/Debug Configurations > Edit configuration templates… > Python tests > pytest. Add the test.env path to
       `Paths to “.env” files:`

6. For setting up mysql in local, run the [migrations](resources/db/mysql/migrations/20230627145332_CreateTables.sql)
   file in local mysql.

7. For starting app layer in local, add a configuration for fastapi.
   ```yaml
   Application file : compute_app_layer/main.py (full path)
   Working dir: compute_app_layer
   Envfile: Add a envfile pointing to local.env.
   ```

## Special Labels

Darwin Compute supports special labels that modify cluster behavior:

| Label | Value | Description |
|-------|-------|-------------|
| `workspace` | `shared` | Mounts workspace at `/home/ray/fsx` on both head and worker nodes. Without this label, workspace is only mounted on the head node. |

### Shared Workspace Example

To enable shared workspace across all nodes in your cluster, add the `workspace: shared` label:

```yaml
labels:
  workspace: 'shared'  # Enables EFS/FSX mount on worker nodes
```

**Use cases for shared workspace:**
- Sharing datasets between head and worker nodes
- Distributed training with shared model checkpoints
- Collaborative workloads requiring common file access

## FAQ / Troubleshooting

### Cluster not starting due to long init script

If your `init_script` in the cluster configuration is too long, the cluster may fail to start. This happens because init scripts are executed during pod startup and have timeout limitations.

**Solutions:**
- Use the **Library Installation API** to install packages instead of putting them in init scripts
- Create a **custom runtime** with your dependencies pre-installed
- Split long scripts into smaller, essential commands only

## Other Instructions

1. Folder Level Readme for each module can be found in the respective folders.
   1. [app_layer](app_layer/README.md)
   2. [core](core/README.md)
   3. [model](model/README.md)
   4. [script](script/README.md)
   5. [sdk](sdk/README.md)
