# Darwin MLflow Platform

A comprehensive MLflow platform implementation, providing experiment tracking, model management, and ML lifecycle management capabilities.

## ⚖️ Attribution

This project contains a modified version of [Apache MLflow](https://github.com/mlflow/mlflow), originally developed by Databricks, Inc. and licensed under the Apache License 2.0.

**Original Work:**
- Project: Apache MLflow
- Copyright: 2018 Databricks, Inc.
- License: Apache License 2.0
- Repository: https://github.com/mlflow/mlflow

**Modifications by DS Horizon:**

This Darwin MLflow Platform builds upon the original MLflow codebase with the following key modifications:
- Custom authentication and authorization layer
- Integration with Darwin's user management and permissions system
- Custom experiment and run management APIs
- Customized UI integration and proxy layer
- S3 bucket initialization utilities
- Integration with Darwin's MySQL database for metadata storage

All modifications are provided under the terms of the Apache License 2.0, maintaining full attribution to the original MLflow authors. See the [LICENSE](LICENSE) and [NOTICE](NOTICE) files for complete details.

## 📋 Table of Contents

- [Overview](#overview)
- [MLflow Version](#mlflow-version)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Important Flows](#important-flows)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)


## 🎯 Overview

This MLflow platform consists of two main components:

1.  **MLflow App Layer** (`app_layer/`) - A FastAPI-based web application that provides REST APIs and a UI for MLflow operations.
2.  **MLflow SDK** (`sdk/`) - A Python SDK wrapper around MLflow for easy integration with ML workflows.

This platform enables teams to:
- Track ML experiments and runs
- Manage model versions and artifacts
- Collaborate on ML projects
- Monitor model performance
- Deploy models to production

## 🔢 MLflow Version

- **MLflow Core**: `2.12.2`
- **Python**: `3.9.7`

## 📁 Project Structure

```
mlflow/
├── app_layer/                    # FastAPI application layer
│   ├── src/mlflow_app_layer/     # Main application source code
│   │   ├── controllers/          # API controllers
│   │   ├── dao/                  # Data access objects
│   │   ├── models/               # Pydantic models
│   │   ├── service/              # Business logic services
│   │   ├── util/                 # Utility functions
│   │   ├── config/               # Configuration constants
│   │   └── static-files/         # Frontend static files
│   ├── requirements.txt          # Production dependencies
│   ├── requirements_dev.txt      # Development dependencies
│   └── setup.py                  # Package setup
├── sdk/                          # MLflow SDK wrapper
│   ├── mlflow_sdk/               # SDK source code
│   ├── requirements.txt          # SDK dependencies
│   └── setup.py                  # SDK package setup
└── tests/                        # Test files
```

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   REST APIs     │    │   MLflow Core   │
│   (Static)      │◄──►│   (FastAPI)     │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   MySQL DB      │
                       │   (Metadata)    │
                       └─────────────────┘
```

### Component Details

1.  **App Layer (Port 8000)**
    - FastAPI-based REST API server
    - Serves MLflow UI static files
    - Handles authentication and authorization
    - Proxies requests to MLflow backend
    - Manages experiment permissions

2.  **MLflow Backend (Port 8080)**
    - Core MLflow tracking server
    - Handles experiment and run management
    - Manages model registry
    - Stores artifacts and metadata

3.  **MySQL Database**
    - Stores experiment permissions
    - User management data
    - Custom metadata

## 🔧 Prerequisites

- Python 3.9.7+
- MySQL 8.0+
- Git
- A virtual environment tool (like `venv`)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mlflow
```

### 2. Set Up Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Database Configuration
export VAULT_SERVICE_MYSQL_USERNAME=your_username
export VAULT_SERVICE_MYSQL_PASSWORD=your_password
export CONFIG_SERVICE_MYSQL_DATABASE=darwin
export CONFIG_SERVICE_MYSQL_MASTERHOST=localhost

# MLflow Configuration
export VAULT_SERVICE_MLFLOW_ADMIN_USERNAME=admin
export VAULT_SERVICE_MLFLOW_ADMIN_PASSWORD=admin_password
export CONFIG_SERVICE_S3_PATH=s3://your-mlflow-bucket

# Application URLs
export MLFLOW_UI_URL="http://localhost:8080"
export MLFLOW_APP_LAYER_URL="http://localhost:8000"
```

### 3. Install Dependencies

#### For App Layer:

```bash
cd app_layer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements_dev.txt
pip install -e .
```

#### For SDK:

```bash
cd sdk
pip install -e .
```

## 🏃‍♂️ Running the Project

### Local Development

#### 1. Start the App Layer

```bash
cd app_layer
source venv/bin/activate
uvicorn src.mlflow_app_layer.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start MLflow Backend (Separate Terminal)

```bash
mlflow server --backend-store-uri mysql://username:password@localhost:3306/darwin \
               --default-artifact-root s3://your-bucket \
               --host 0.0.0.0 --port 8080
```

### Manual Local Development

#### 1. Start the App Layer

```bash
cd app_layer
source venv/bin/activate
uvicorn src.mlflow_app_layer.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start the MLflow Backend (in a separate terminal)

```bash
# Ensure you have activated the venv from the app_layer
mlflow server --backend-store-uri mysql+pymysql://${VAULT_SERVICE_MYSQL_USERNAME}:${VAULT_SERVICE_MYSQL_PASSWORD}@${DARWIN_MYSQL_HOST}:${MYSQL_PORT}/${CONFIG_SERVICE_MYSQL_DATABASE} \
               --default-artifact-root ${MLFLOW_ARTIFACT_STORE} \
               --host 0.0.0.0 --port 8080
```

### Access the Application

-   **App Layer UI**: [http://localhost:8000](http://localhost:8000)
-   **MLflow Backend**: [http://localhost:8080](http://localhost:8080)
-   **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

## 📚 API Documentation

### Core Endpoints

#### Experiments
- `GET /experiments` - MLflow UI
- `GET /v1/experiment/{experiment_id}` - Get experiment details
- `POST /v1/experiment` - Create new experiment
- `PUT /v1/experiment/{experiment_id}` - Update experiment
- `DELETE /v1/experiment/{experiment_id}` - Delete experiment

#### Runs
- `GET /v1/experiment/{experiment_id}/run/{run_id}` - Get run details
- `POST /v1/experiment/{experiment_id}/run` - Create new run
- `DELETE /v1/experiment/{experiment_id}/run/{run_id}` - Delete run
- `POST /v1/run/{run_id}/log-data` - Log run data

#### Models
- `GET /v1/models` - Search models

#### Users
- `POST /v1/user` - Create user

### Authentication

All API endpoints require authentication via the `email` header:

```bash
curl -H "email: user@example.com" \
     -H "Authorization: Basic <base64-encoded-credentials>" \
     http://localhost:8000/v1/experiment/123
```


## 🛠️ Configuration

Configuration is managed through environment variables. For a production setup, you might use a configuration management service.

### Database Configuration

The following environment variables are used to configure the database connection (as defined in `app_layer/src/mlflow_app_layer/config/constants.py`):

```
DARWIN_MYSQL_HOST              # Database hostname
VAULT_SERVICE_MYSQL_USERNAME   # Database username
VAULT_SERVICE_MYSQL_PASSWORD   # Database password
CONFIG_SERVICE_MYSQL_DATABASE  # Database name
MYSQL_PORT                     # Database port (defaults to 3306)
```

## 💻 Development

### Code Structure

-   **Controllers**: Handle HTTP requests and responses.
-   **Services**: Implement business logic and MLflow integration.
-   **DAO**: Data access layer for database operations.
-   **Models**: Pydantic models for request/response validation.
-   **Utils**: Utility functions for authentication, logging, etc.

### Adding New Features

1.  Create a new controller in `controllers/`.
2.  Add business logic in `service/`.
3.  Define Pydantic models in `models/`.
4.  Add database queries in `dao/queries/`.
5.  Register new routes in `main.py`.

### Code Quality

This project uses the following tools to maintain code quality:

-   **Type Checking**: `mypy`
-   **Linting**: `pylint`
-   **Testing**: `pytest`
-   **Coverage**: `pytest-cov`

To run the quality checks:

```bash
# From the mlflow/app_layer directory
# Type checking
mypy src/

# Linting
pylint src/

# Testing
pytest tests/
```

## 🧪 Testing

### Running Tests

To run the full test suite with coverage:

```bash
cd app_layer
pytest --cov=mlflow_app_layer
```

### Test Structure

-   Unit tests for individual components.
-   Integration tests for API endpoints.
-   Dependencies like the MLflow backend and database should be mocked.

## 🚀 Deployment

### Container Deployment

The project includes Docker support and Kubernetes deployment configurations:

1. **Build**: Use the provided build scripts
2. **Deploy**: Deploy using Helm charts in the parent directory
3. **Monitor**: Use the health check endpoints

## 🤝 Contributing

We welcome contributions! Please follow this workflow:

1.  Fork the repository.
2.  Create a feature branch.
3.  Make your changes, following the code structure and quality guidelines.
4.  Add tests for new functionality.
5.  Ensure all quality checks and tests are passing.
6.  Submit a pull request.

### Code Standards

-   Follow PEP 8 style guidelines.
-   Use type hints for all functions.
-   Add docstrings for classes and methods.
-   Write unit and integration tests for new features.
-   Keep the documentation updated.
