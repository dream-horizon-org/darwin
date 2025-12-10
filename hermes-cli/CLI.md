# Hermes CLI Documentation

## Overview

The Hermes CLI is a command-line tool designed to facilitate the creation and management of ML model serving repositories. It provides a set of commands to create, configure, and deploy services and artifacts in a standardized manner.

## Setup

If you are using the CLI for the first time, you need to run the `configure` command to set up your authentication token.

1. Set `HERMES_USER_TOKEN` environment variable:
   ```bash
   export HERMES_USER_TOKEN=admin-token-default-change-in-production
   ```
   The token is required for authentication with Hermes services.


2. Run the `configure` command:
   ```bash
   hermes configure
   ```
   This command must be executed before using any other Hermes CLI commands. It sets up the necessary configuration using your authentication token.

## Commands
- Run ```hermes``` to list down all the commands
- Add ```--help``` flag ahead of any command to show details about the command. For eg. ```hermes create-environment --help```

### 1. `configure`

- **Description**: Configures the user token.
- **Usage**:
  ```bash
  hermes configure
  ```

### 2. `create-environment`

- **Description**: Creates a new environment configuration for the Hermes platform.
- **Usage**:
  ```bash
  hermes create-environment --name <env_name> --domain-suffix <suffix> --cluster-name <cluster> --namespace <namespace> --ft-redis-url <url> --workflow-url <url> --security-group <sg_id> --subnets <subnets>
  ```
- **Options**:
  - `--name`: Name of the environment (e.g., 'local', 'dev', 'staging'). **Required**
  - `--domain-suffix`: Domain suffix for the environment (e.g., '.local'). Default: `.local`
  - `--cluster-name`: Kubernetes cluster name (must be 'kind'). Default: `kind`
  - `--namespace`: Kubernetes namespace (must be 'serve'). Default: `serve`
  - `--ft-redis-url`: Feature store Redis URL. Optional
  - `--workflow-url`: Workflow service URL. Optional
  - `--security-group`: AWS security group ID. Optional
  - `--subnets`: AWS subnet IDs. Optional
- **Sample Command**:
  ```bash
  hermes create-environment --name local --domain-suffix .local --cluster-name kind
  ```

### 3. `create-serve-repo`

- **Description**: Creates a new project from a template using an optional YAML configuration.
- **Usage**:
  ```bash
  hermes create-serve-repo --template <template_path> --filename <yaml_file> --output <output_path>
  ```
- **Options**:
  - `--template`, `-t`: Path to the template folder. Default is `hermes/src/template`.
  - `--filename`, `-f`: Path to the YAML file.
  - `--output`, `-o`: Output path for the generated project.

**Note**:
If you are using the following CLI commands inside a project created by the CLI itself then it would pick configurations values from `.hermes` folder according to the environment given ie you can skip all flags except for env flag.

### 4. `create-serve`

- **Description**: Creates a new serve. All optional arguments need to be provided if Model repo isn't created via hermes CLI (Except filename).
- **Usage**:
  ```bash
  hermes create-serve --filename <filename> --name <serve_name> --type <type> --space <space> --description <description>
  ```
- **Options**:
  - `--name`: Name of the serve.
  - `--type`: Type of the serve (Currently supported: ["api"]).
  - `--space`: Space for the serve, e.g., Serve.
  - `--description`: Description of the serve.
  - `--filename`: Path to the YAML file for serve configuration. Optional
- **Sample Command**:
  ```bash
  hermes create-serve --name test --type api --space serve --description "Test serve"
  ```

### 5. `create-serve-config`

- **Description**: Creates serve infrastructure configuration. All optional arguments need to be provided if Model repo isn't created via hermes CLI (Except filename).
- **Usage**:
  ```bash
  hermes create-serve-config --serve_name <name> --api_config <api_config> --workflow_config <workflow_config> --filename <filename>
  ```
- **Options**:
  - `--serve_name`: Name of the serve.
  - `--api_config`: API serve configuration.
  - `--workflow_config`: Workflow serve configuration. Optional
  - `--filename`: Path to the YAML file for serve configuration. Optional
- **Sample Command**:
  ```bash
  hermes create-serve-config --serve-name test --api-config '{"backend_type":"fastapi","cores":2,"memory":4,"node_capacity_type":"spot","min_replicas":1,"max_replicas":3}'
  ```

### 6. `update-serve-config`

- **Description**: Updates serve infrastructure configuration.
- **Usage**:
  ```bash
  hermes update-serve-config --serve_name <name> --api_config <api_config> --workflow_config <workflow_config>
  ```
- **Options**:
  - `--serve_name`: Name of the serve.
  - `--api_config`: API serve configuration.
  - `--workflow_config`: Workflow serve configuration.
- **Sample Command**:
  ```bash
  hermes update-serve-config --serve-name test --api-config '{"backend_type":"fastapi","cores":2,"memory":4,"node_capacity_type":"spot","min_replicas":1,"max_replicas":3}'
  ```

### 7. `create-artifact`

- **Description**: Creates a new artifact. All optional arguments need to be provided if Model repo isn't created via hermes CLI.
- **Usage**:
  ```bash
  hermes create-artifact --serve_name <name> --version <version> --github_repo_url <url> --branch <branch>
  ```
- **Options**:
  - `--serve_name`: Name of the serve. Optional if `.hermes/serve_config.json` exists
  - `--version`: Version of the artifact. **Required**
  - `--github_repo_url`: GitHub repository URL. Optional if `.hermes/serve_config.json` exists
  - `--branch`: GitHub repository branch. Optional
- **Sample Command**:
  ```bash
  hermes create-artifact --version v1.0.0 --branch main
  ```

### 8. `deploy-artifact`

- **Description**: Deploys an artifact to the specified environment.
- **Usage**:
  ```bash
  hermes deploy-artifact --serve_name <name> --artifact_version <version> --api_serve_deployment_config <config>
  ```
- **Options**:
  - `--serve_name`: Name of the serve. Optional if `.hermes/serve_config.json` exists
  - `--artifact_version`: Deployment label for the artifact (not the image tag). **Required**
  - `--api_serve_deployment_config`: API deployment configuration (JSON string). Optional
- **Sample Command**:
  ```bash
  hermes deploy-artifact --artifact_version v1.0.0
  ```

### 9. `deploy-model`

- **Description**: One-click deploy serve with model. Combines serve creation, configuration, and deployment in a single command.
- **Usage**:
  ```bash
  hermes deploy-model --serve-name <name> --artifact-version <version> --model-uri <uri> --cores <cores> --memory <memory> --node-capacity <capacity> --min-replicas <min> --max-replicas <max>
  ```
- **Options**:
  - `--serve_name`: Name of the serve. **Required**
  - `--artifact_version`: One-click deployment label used to track/undeploy (not the runtime image tag). **Required**
  - `--model_uri`: MLflow model URI (e.g., 's3://bucket/path/to/model'). **Required**
  - `--cores`: Number of CPU cores (e.g., 4). **Required**
  - `--memory`: Memory in GB (e.g., 8). **Required**
  - `--node_capacity`: Node capacity type (e.g., 'spot'). **Required**
  - `--min_replicas`: Minimum number of replicas (e.g., 1). **Required**
  - `--max_replicas`: Maximum number of replicas (e.g., 1). **Required**

### 10. `undeploy-model`

- **Description**: Undeploy a model serve from the specified environment.
- **Usage**:
  ```bash
  hermes undeploy-model --serve-name <name> --artifact-version <version>
  ```
- **Options**:
  - `--serve_name`: Name of the serve to undeploy. **Required**
  - `--artifact_version`: One-click deployment label that identifies the deployment to remove (not the runtime image tag). **Required**
- **Note**: The environment is determined by the `ENV` environment variable.

### 11. `get-serve-status`

- **Description**: Gets the deployment status of a serve.
- **Usage**:
  ```bash
  hermes get-serve-status --serve-name <name>
  ```
- **Options**:
  - `--serve_name`: Name of the serve. Optional if `.hermes/serve_config.json` exists

### 12. `get-artifact-status`

- **Description**: Gets the status of an artifact builder job.
- **Usage**:
  ```bash
  hermes get-artifact-status --job_id <job_id>
  ```
- **Options**:
  - `--job_id`: Artifact builder job ID. **Required**