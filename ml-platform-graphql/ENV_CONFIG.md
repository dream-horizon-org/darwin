# Environment Configuration

This document lists all the service URLs extracted from `config/default.json` for the ML Platform module.

## How to Configure

Create a `.env` file in the `modules/ml-platform` directory with the following configuration:

```bash
# ML Platform GraphQL Configuration

# Server Configuration
PORT=4000
NODE_ENV=development

# Backend Service Hosts
# The %TEAM_SUFFIX% and %VPC_SUFFIX% placeholders are replaced at runtime
# %TEAM_SUFFIX% examples: "", "-team-stag", "-uat"
# %VPC_SUFFIX% examples: "", "-stag"
# %DOMAIN% is your organization's domain

# Default service (fallback)
DEFAULT_SERVICE_HOST=http://api%VPC_SUFFIX%.%DOMAIN%

# ML Platform Services (from config/default.json SERVICE_HOSTS)

# Workspace Service
DARWIN_WORKSPACE_SERVICE_HOST=http://<workspace-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
MLP_WORKSPACE_STAG=http://<workspace-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
MLP_WORKSPACE_UAT=http://<workspace-service>-uat.%DOMAIN%
MLP_WORKSPACE_PROD=http://<workspace-service>.%DOMAIN%

# Compute Service (Primary ML Platform Compute Service)
DARWIN_COMPUTE_SERVICE_HOST=http://<compute-service>.%DOMAIN%
MLP_COMPUTE_STAG=http://<compute-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
MLP_COMPUTE_UAT=http://<compute-service>-uat.%DOMAIN%
MLP_COMPUTE_PROD=http://<compute-service>.%DOMAIN%

# Workflows Service
DARWIN_WORKFLOWS_SERVICE_HOST=http://<workflow-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
MLP_WORKFLOWS_STAG=http://<workflow-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
MLP_WORKFLOWS_UAT=http://<workflow-service>-uat.%DOMAIN%
MLP_WORKFLOWS_PROD=http://<workflow-service>.%DOMAIN%

# Data Catalog Service
DARWIN_DATA_CATALOG_SERVICE_HOST=http://<data-catalog-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%

# Feature Store Service
FEATURE_STORE_SERVICE_HOST=http://<feature-registry-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
FEATURE_STORE_V2=http://<feature-store-v2>.%DOMAIN%:8000
MLP_FEATURE_STORE_SERVICE_HOST=http://<feature-store-app-layer>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%

# ML Flow / Experimentation
MLP_EXPERIMENTATION=http://<mlflow-service>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%
MLP_ML_FLOW_STAG=http://<mlflow-service>-stag.%DOMAIN%%VPC_SUFFIX%
MLP_ML_FLOW_UAT=http://<mlflow-service>-uat.%DOMAIN%
MLP_ML_FLOW_PROD=http://<mlflow-service>.%DOMAIN%

# BYOR (Bring Your Own Runtime)
MLP_BYOR_STAG=http://<byor-service-ip>:8000
MLP_BYOR_UAT=http://<byor-service>-uat.%DOMAIN%
MLP_BYOR_PROD=http://<byor-service>.%DOMAIN%

# ML On Edge
MLP_ON_EDGE_STAG=http://<edge-service>-stag.%DOMAIN%%VPC_SUFFIX%
MLP_ON_EDGE_UAT=http://<edge-service>-uat.%DOMAIN%
MLP_ON_EDGE_PROD=http://<edge-service>.%DOMAIN%

# Logging
LOG_LEVEL=info
CURL_LOGGING=true

# GraphQL
ENABLE_MOCKS=false
ENABLE_PLAYGROUND=true
ENABLE_INTROSPECTION=true
ENABLE_TRACING=false

# OpenTelemetry (Optional)
# OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
# OTEL_SERVICE_NAME=ml-platform-graphql
```

## Service URL Mapping

Here's the complete list of ML Platform service URLs from `config/default.json`:

| Service Name | Key in Config | URL Pattern |
|-------------|---------------|-------------|
| Feature Store | `FEATURE_STORE` | `http://<feature-registry>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| Feature Store V2 | `FEATURE_STORE_V2` | `http://<feature-store-v2>.%DOMAIN%:8000` |
| MLP Compute (Stag) | `MLP_COMPUTE_STAG` | `http://<compute>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Compute (UAT) | `MLP_COMPUTE_UAT` | `http://<compute>-uat.%DOMAIN%` |
| MLP Compute (Prod) | `MLP_COMPUTE_PROD` | `http://<compute>.%DOMAIN%` |
| MLP Workspace (Stag) | `MLP_WORKSPACE_STAG` | `http://<workspace>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Workspace (UAT) | `MLP_WORKSPACE_UAT` | `http://<workspace>-uat.%DOMAIN%` |
| MLP Workspace (Prod) | `MLP_WORKSPACE_PROD` | `http://<workspace>.%DOMAIN%` |
| Darwin Data Catalog | `DARWIN_DATA_CATALOG` | `http://<data-catalog>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Feature Store | `MLP_FEATURE_STORE` | `http://<feature-store-app>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Workflows (Stag) | `MLP_WORKFLOWS_STAG` | `http://<workflow>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Workflows (UAT) | `MLP_WORKFLOWS_UAT` | `http://<workflow>-uat.%DOMAIN%` |
| MLP Workflows (Prod) | `MLP_WORKFLOWS_PROD` | `http://<workflow>.%DOMAIN%` |
| MLP BYOR (Stag) | `MLP_BYOR_STAG` | `http://<byor-ip>:8000` |
| MLP BYOR (UAT) | `MLP_BYOR_UAT` | `http://<byor>-uat.%DOMAIN%` |
| MLP BYOR (Prod) | `MLP_BYOR_PROD` | `http://<byor>.%DOMAIN%` |
| MLP Catalog (Stag) | `MLP_CATALOG_STAG` | `http://<catalog>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Catalog (UAT) | `MLP_CATALOG_UAT` | `http://<catalog>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Catalog (Prod) | `MLP_CATALOG_PROD` | `http://<catalog>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP Experimentation | `MLP_EXPERIMENTATION` | `http://<mlflow>%TEAM_SUFFIX%.%DOMAIN%%VPC_SUFFIX%` |
| MLP On Edge (Stag) | `MLP_ON_EDGE_STAG` | `http://<edge>-stag.%DOMAIN%%VPC_SUFFIX%` |
| MLP On Edge (UAT) | `MLP_ON_EDGE_UAT` | `http://<edge>-uat.%DOMAIN%` |
| MLP On Edge (Prod) | `MLP_ON_EDGE_PROD` | `http://<edge>.%DOMAIN%` |
| MLP ML Flow (Stag) | `MLP_ML_FLOW_STAG` | `http://<mlflow>-stag.%DOMAIN%%VPC_SUFFIX%` |
| MLP ML Flow (UAT) | `MLP_ML_FLOW_UAT` | `http://<mlflow>-uat.%DOMAIN%` |
| MLP ML Flow (Prod) | `MLP_ML_FLOW_PROD` | `http://<mlflow>.%DOMAIN%` |

## Environment-Specific Variables

The template variables `%TEAM_SUFFIX%`, `%VPC_SUFFIX%`, and `%DOMAIN%` are replaced based on the environment:

### Development (dev-local)
- `TEAM_SUFFIX`: `` (empty)
- `VPC_SUFFIX`: `` (empty)
- `DOMAIN`: `<your-domain>.local`

### Staging
- `TEAM_SUFFIX`: `-<team>-stag` (e.g., `-mlp-stag`)
- `VPC_SUFFIX`: `-stag`
- `DOMAIN`: `<your-domain>-stag.local`

### UAT
- `TEAM_SUFFIX`: `` (empty, uses specific UAT URLs)
- `VPC_SUFFIX`: `` (empty, uses specific UAT URLs)
- `DOMAIN`: `<your-domain>.local`

### Production
- `TEAM_SUFFIX`: `` (empty, uses specific prod URLs)
- `VPC_SUFFIX`: `` (empty, uses specific prod URLs)
- `DOMAIN`: `<your-domain>.local`

## Usage

1. Copy the configuration above into a `.env` file
2. Replace all placeholders (`<service-name>`, `%DOMAIN%`, etc.) with your actual service URLs
3. Update the `NODE_ENV` variable to match your environment
4. The `TEAM_SUFFIX` and `VPC_SUFFIX` values are set via command-line when running the server (see package.json scripts)
5. Run the server: `yarn start:dev`

## Notes

- The `.env` file is in `.gitignore` and should not be committed
- For production deployments, use environment-specific configuration management
- The `config/default.json` file is the source of truth for all service URLs
- **Important**: Replace all `<placeholder>` values with your actual service names and domains
- The primary service URLs (like `DARWIN_COMPUTE_SERVICE_HOST`) should point to production URLs as the default
- Use environment-specific URLs (`MLP_COMPUTE_STAG`, `MLP_COMPUTE_UAT`, etc.) based on your deployment environment
- The `/get-all-clusters` endpoint uses the compute service: ensure the correct service header is passed (e.g., `service: MLP_COMPUTE_PROD`)

