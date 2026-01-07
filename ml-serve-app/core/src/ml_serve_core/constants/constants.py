import os
from typing import Dict

ENV_ENVIRONMENT_VARIABLE = "ENV"

# Default flavor used when detection fails (sklearn is lightest)
DEFAULT_FLAVOR = "sklearn"

# Valid image categories for one-click deployments
VALID_IMAGE_CATEGORIES = frozenset({"sklearn", "boosting", "pytorch", "tensorflow"})

# Model Flavor to Image Category Mapping
# Maps MLflow model flavors to Docker image categories for one-click deployments.
# This is used by mlflow_client.py for flavor detection.
FLAVOR_TO_IMAGE_CATEGORY: Dict[str, str] = {
    # Scikit-learn
    "sklearn": "sklearn",
    
    # Boosting models
    "xgboost": "boosting",
    "lightgbm": "boosting",
    "catboost": "boosting",
    
    # Deep learning - PyTorch
    "pytorch": "pytorch",
    "torch": "pytorch",
    
    # Deep learning - TensorFlow/Keras
    "tensorflow": "tensorflow",
    "keras": "tensorflow",
    "tf": "tensorflow",
    
    # Default fallback (sklearn image is lightest)
    "python_function": DEFAULT_FLAVOR,
}

CONFIGS_MAP = {
    "local": {
        "dcm_url": os.getenv("DCM_URL", "http://localhost:8080"),
        "artifact_builder_url": os.getenv("ARTIFACT_BUILDER_URL", "http://localhost:8081"),
        "artifact_builder_public_url": os.getenv("ARTIFACT_BUILDER_PUBLIC_URL", "http://localhost/artifact-builder"),
    },
    "prod": {
        "dcm_url": os.getenv("DCM_URL", "http://darwin-cluster-manager:8080"),
        "artifact_builder_url": os.getenv("ARTIFACT_BUILDER_URL", "http://darwin-artifact-builder:8081"),
        "artifact_builder_public_url": os.getenv("ARTIFACT_BUILDER_PUBLIC_URL", "http://localhost/artifact-builder"),
    },
}

FASTAPI_SERVE_RESOURCE_NAME = os.getenv("FASTAPI_SERVE_RESOURCE_NAME", "darwin-fastapi-serve")
FASTAPI_VALUES_TEMPLATE_NAME = os.getenv("FASTAPI_VALUES_TEMPLATE_NAME", "fastapi_values.yaml")

RAY_SERVE_RESOURCE_NAME = os.getenv("RAY_SERVE_RESOURCE_NAME", "RayService")
RAY_VALUES_TEMPLATE_NAME = os.getenv("RAY_VALUES_TEMPLATE_NAME", "ray_values.yaml")

FASTAPI_SERVE_CHART_VERSION = os.getenv("FASTAPI_SERVE_CHART_VERSION", "1.0.0")
RAY_SERVE_CHART_VERSION = os.getenv("RAY_SERVE_CHART_VERSION", "1.0.0")

HEALTHCHECK_PATH = os.getenv("HEALTHCHECK_PATH", "/healthcheck")
APPLICATION_PORT = int(os.getenv("APPLICATION_PORT", "8000"))

ENABLE_ISTIO = os.getenv("ENABLE_ISTIO", "false").lower() == "true"
ISTIO_SERVICE_NAME = os.getenv("ISTIO_SERVICE_NAME", "istio-ingressgateway")
ISTIO_NAMESPACE = os.getenv("ISTIO_NAMESPACE", "istio-system")

KUBE_INGRESS_CLASS = os.getenv("KUBE_INGRESS_CLASS", "nginx")

ALB_LOGS_ENABLED = os.getenv("ALB_LOGS_ENABLED", "false").lower() == "true"
ALB_LOGS_BUCKET = os.getenv("ALB_LOGS_BUCKET", "")
ALB_LOGS_PREFIX = os.getenv("ALB_LOGS_PREFIX", "alb-logs")

ORGANIZATION_NAME = os.getenv("ORGANIZATION_NAME", "my-org")

CONTAINER_REGISTRY = os.getenv("CONTAINER_REGISTRY", "localhost:5000")

# IMAGE_REPOSITORY is used for artifact-builder custom builds (e.g., serve-app:my-model_v1)
IMAGE_REPOSITORY = os.getenv("IMAGE_REPOSITORY", "serve-app")
IMAGE_TAG = os.getenv("IMAGE_TAG", "latest")

# RUNTIME_REPOSITORY is used for one-click MLflow model deployments
RUNTIME_REPOSITORY = os.getenv("RUNTIME_REPOSITORY", "serve-md-runtime")

# DEFAULT_RUNTIME is used for model downloader init containers
# Format: {registry}/{runtime_repository}:sklearn (lightest default)
DEFAULT_RUNTIME = os.getenv(
    "DEFAULT_RUNTIME",
    f"{CONTAINER_REGISTRY}/{RUNTIME_REPOSITORY}:sklearn"
)


# Workflow serve configuration (only needed if using workflow serves)
JOB_CLUSTER_RUNTIME = os.getenv("JOB_CLUSTER_RUNTIME", "")
