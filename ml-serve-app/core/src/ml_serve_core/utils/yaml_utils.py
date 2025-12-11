import os

import yaml
from typing import Optional
import importlib.resources as pkg_resource
import ml_serve_core.resources as rs
from ml_serve_core.config.configs import Config

from ml_serve_core.constants.constants import (
    APPLICATION_PORT,
    HEALTHCHECK_PATH,
    FASTAPI_VALUES_TEMPLATE_NAME,
    ENABLE_ISTIO,
    ISTIO_SERVICE_NAME,
    ISTIO_NAMESPACE,
    KUBE_INGRESS_CLASS,
    ALB_LOGS_ENABLED,
    ALB_LOGS_BUCKET,
    ALB_LOGS_PREFIX,
    ORGANIZATION_NAME
)
from ml_serve_core.dtos.dtos import EnvConfig
from ml_serve_core.utils.utils import get_host_name
from ml_serve_model import APIServeInfraConfig

ENV = os.getenv("ENV", "local")

# Namespace where serves are deployed in local environment
LOCAL_SERVE_NAMESPACE = os.getenv("LOCAL_SERVE_NAMESPACE", "serve")


def configure_ingress_for_local(values: dict, serve_name: str, namespace: str) -> None:
    """
    Configure ingress for local environment with nginx path-based routing.

    URL Pattern: http://localhost/{serve-name}/
    Example: http://localhost/test-iter1/healthcheck

    Args:
        values: The Helm values dict to modify
        serve_name: The name of the serve (used as path prefix)
        namespace: The namespace where the service is deployed

    Swagger UI:
        For Swagger UI to work correctly, deployed FastAPI apps must read the
        ROOT_PATH environment variable (automatically set by this function) and
        pass it to FastAPI(root_path=...). See ml-serve-app README for details.
    """
    # Set serviceName to match the path - this ensures ingress routes to correct service
    values['serviceName'] = serve_name

    values['ingressInt']['enabled'] = True
    values['ingressInt']['ingressClass'] = 'nginx'
    values['ingressInt']['namespace'] = namespace
    values['ingressInt']['hosts'] = ['localhost']
    values['ingressInt']['path'] = f"/{serve_name}(/|$)(.*)"
    values['ingressInt']['pathType'] = 'ImplementationSpecific'

    # Set ROOT_PATH for FastAPI OpenAPI/Swagger docs to work behind reverse proxy
    # This ensures /docs loads /openapi.json from the correct path prefix
    values['envs']['ROOT_PATH'] = f"/{serve_name}"

    # Clear ALB-specific settings
    values['ingressInt']['albLogs'] = {'enabled': False}
    values['ingressInt']['tags'] = ''


def configure_ingress_for_production(
        values: dict,
        host_name: str,
        env_config: EnvConfig,
        serve_name: str,
        env: str,
        user_email: str,
        additional_hosts: list = None
) -> None:
    """
    Configure ingress for production environment with hostname-based routing.

    In production, we use ALB with hostname-based routing and external-dns
    for automatic DNS record creation.

    Args:
        values: The Helm values dict to modify
        host_name: Primary hostname for the service
        env_config: Environment configuration
        serve_name: The name of the serve
        env: Environment name
        user_email: User email for tags
        additional_hosts: Optional additional hostnames
    """
    values['ingressInt']['ingressClass'] = KUBE_INGRESS_CLASS
    values['ingressInt']['namespace'] = env_config.namespace

    # Keep the default path for ALB (set in template)
    # values['ingressInt']['path'] is already set to '/*' in the template

    values['ingressInt']['annotations']['external-dns.alpha.kubernetes.io/hostname'] = host_name

    if env_config.security_group:
        values['ingressInt']['annotations']['alb.ingress.kubernetes.io/security-groups'] = env_config.security_group
    if env_config.subnets:
        values['ingressInt']['annotations']['alb.ingress.kubernetes.io/subnets'] = env_config.subnets

    values['ingressInt']['tags'] = (
        f"Environment={env}, Service={serve_name}, squad=darwin, provisioned-by-user={user_email}, "
        f"environment_name={env}, component_name={serve_name}-alb, service_name={serve_name}, resource_type=alb, "
        f"component_type=application, org_name={ORGANIZATION_NAME}")

    host_list = [host_name]
    if additional_hosts:
        host_list.extend(additional_hosts)

    values['ingressInt']['hosts'] = host_list
    values['ingressInt']['albLogs']['enabled'] = ALB_LOGS_ENABLED
    values['ingressInt']['albLogs']['bucket'] = ALB_LOGS_BUCKET
    values['ingressInt']['albLogs']['prefix'] = ALB_LOGS_PREFIX


def generate_fastapi_values_for_one_click_model_deployment(
        name: str,
        env: str,
        runtime: str,
        env_config: EnvConfig,
        user_email: str,
        environment_variables: Optional[dict[str, str]],
        cores: int,
        memory: int,
        min_replicas: int,
        max_replicas: int,
        node_capacity_type: str
) -> dict:
    with pkg_resource.open_text(rs, FASTAPI_VALUES_TEMPLATE_NAME) as stream:
        stream_content = stream.read()
        values = yaml.safe_load(stream_content)

    # For one-click deployments, serve_name is just the name (no env suffix)
    serve_name = name
    host_name = get_host_name(name, env, env_config, is_environment_protected=False)

    values['replicaCount'] = min_replicas
    values['name'] = serve_name
    values['cluster_name'] = env_config.cluster_name

    values['envs']['ENV'] = env
    values['envs']['SERVICE_NAME'] = serve_name

    if environment_variables:
        for key, val in environment_variables.items():
            values['envs'][str.upper(key)] = val

    values['image']['repository'], values['image']['tag'] = runtime.rsplit(':', 1)
    values['service']['httpPort'] = APPLICATION_PORT
    values['hpa']['maxReplicas'] = max_replicas
    values['livenessProbe']['httpGet']['path'] = HEALTHCHECK_PATH
    values['livenessProbe']['httpGet']['port'] = APPLICATION_PORT
    values['readinessProbe']['httpGet']['path'] = HEALTHCHECK_PATH
    values['readinessProbe']['httpGet']['port'] = APPLICATION_PORT

    # Configure Istio if enabled
    if ENABLE_ISTIO:
        values['ingressInt']['serviceName'] = ISTIO_SERVICE_NAME
        values['istio']['serviceName'] = ISTIO_SERVICE_NAME
        values['istio']['enabled'] = True
    else:
        values['ingressInt']['serviceName'] = ""
        values['istio']['enabled'] = False

    values['ingressInt']['healthcheckPath'] = HEALTHCHECK_PATH
    values['org'] = ORGANIZATION_NAME

    # Configure ingress based on environment
    if ENV.lower() == 'local':
        # Local: Disable ingress, use ClusterIP service directly
        configure_ingress_for_local(values, serve_name, LOCAL_SERVE_NAMESPACE)
    else:
        # Production: Use ALB with hostname-based routing
        configure_ingress_for_production(
            values, host_name, env_config, serve_name, env, user_email
        )

    values['resources'] = update_resource(cores, memory)
    update_node_selector(values, node_capacity_type)
    return values


def generate_fastapi_values(
        name: str,
        env: str,
        runtime: str,
        env_config: EnvConfig,
        user_email: str,
        serve_infra_config: APIServeInfraConfig,
        environment_variables: Optional[dict[str, str]],
        is_environment_protected: bool
) -> dict:
    with pkg_resource.open_text(rs, FASTAPI_VALUES_TEMPLATE_NAME) as stream:
        stream_content = stream.read()
        values = yaml.safe_load(stream_content)

    if not is_environment_protected:
        serve_name = f"{name}-{env}"
    else:
        serve_name = f"{name}"

    host_name = get_host_name(name, env, env_config, is_environment_protected)

    values['replicaCount'] = serve_infra_config.fast_api_config_object.min_replicas
    values['name'] = serve_name
    values['cluster_name'] = env_config.cluster_name

    values['envs']['ENV'] = env
    values['envs']['SERVICE_NAME'] = serve_name

    if environment_variables:
        for key, val in environment_variables.items():
            values['envs'][str.upper(key)] = val

    values['image']['repository'], values['image']['tag'] = runtime.rsplit(':', 1)
    values['service']['httpPort'] = APPLICATION_PORT
    values['hpa']['maxReplicas'] = serve_infra_config.fast_api_config_object.max_replicas
    values['livenessProbe']['httpGet']['path'] = HEALTHCHECK_PATH
    values['livenessProbe']['httpGet']['port'] = APPLICATION_PORT
    values['readinessProbe']['httpGet']['path'] = HEALTHCHECK_PATH
    values['readinessProbe']['httpGet']['port'] = APPLICATION_PORT

    # Configure Istio if enabled
    if ENABLE_ISTIO:
        values['ingressInt']['serviceName'] = ISTIO_SERVICE_NAME
        values['istio']['serviceName'] = ISTIO_SERVICE_NAME
        values['istio']['enabled'] = True
    else:
        values['ingressInt']['serviceName'] = ""
        values['istio']['enabled'] = False

    values['ingressInt']['healthcheckPath'] = HEALTHCHECK_PATH
    values['org'] = ORGANIZATION_NAME

    # Configure ingress based on environment
    if ENV.lower() == 'local':
        # Local: Disable ingress, use ClusterIP service directly
        configure_ingress_for_local(values, serve_name, LOCAL_SERVE_NAMESPACE)
    else:
        # Production: Use ALB with hostname-based routing
        additional_hosts = serve_infra_config.additional_hosts_list if serve_infra_config.additional_hosts_list else None
        configure_ingress_for_production(
            values, host_name, env_config, serve_name, env, user_email, additional_hosts
        )

    values['resources'] = update_resource(
        serve_infra_config.fast_api_config_object.cores,
        serve_infra_config.fast_api_config_object.memory
    )
    update_node_selector(values, serve_infra_config.fast_api_config_object.node_capacity_type)
    return values


def generate_fastapi_infra_values(api_serve_config: APIServeInfraConfig) -> dict:
    values = dict()
    values['replicaCount'] = api_serve_config.fast_api_config_object.min_replicas

    # Initialize 'hpa' key as a dictionary before accessing 'maxReplicas'
    values['hpa'] = {}
    values['hpa']['maxReplicas'] = api_serve_config.fast_api_config_object.max_replicas

    values['resources'] = update_resource(
        api_serve_config.fast_api_config_object.cores,
        api_serve_config.fast_api_config_object.memory
    )

    if api_serve_config.additional_hosts_list is not None:
        values["ingressInt"] = values.get("ingressInt", {})
        values["ingressInt"]["additionalHosts"] = api_serve_config.additional_hosts_list

    update_node_selector(values, api_serve_config.fast_api_config_object.node_capacity_type)

    values['org'] = ORGANIZATION_NAME

    return values


def update_resource(cores, memory):
    resource = {'limits': {'cpu': 0, 'memory': '0G'}, 'requests': {'cpu': 0, 'memory': '0G'}}
    resource['limits']['cpu'] = cores
    resource['limits']['memory'] = f'{memory}G'
    resource['requests'] = resource['limits']
    return resource


def update_node_selector(group, node_capacity_type):
    """
    Update node selector for pod scheduling.

    Uses ml-serve-app's ENV environment variable (not the Environment entity)
    to determine whether to apply production node selectors.

    For local environment (ENV=local, Kind cluster):
        - Sets nodeSelector to None (YAML null) to DELETE the entire section
        - This overrides chart defaults during Helm merge
        - Pods can run on any node without labels

    For production environments (ENV != local):
        - Applies Karpenter capacity type (spot/on-demand)
        - Applies serve="true" label (as STRING, not boolean)
        - Kubernetes requires nodeSelector values to be strings

    Args:
        group: The values dict to update
        node_capacity_type: 'spot' or 'ondemand'

    IMPORTANT: Helm deep-merges values with chart defaults. An empty dict {}
    does NOT override nested keys - chart defaults are kept. Setting to None
    (YAML null) tells Helm to DELETE the entire section, overriding defaults.
    """
    if ENV.lower() == 'local':
        # Local: Set to None to DELETE nodeSelector from chart defaults
        # When Helm sees null, it removes the key entirely from merged values
        # This allows pods to schedule on any node without label requirements
        group['nodeSelector'] = None
        return

    # Production environments: apply Karpenter and serve labels AS STRINGS
    group['nodeSelector'] = {}
    if node_capacity_type == 'ondemand':
        group["nodeSelector"]["karpenter.sh/capacity-type"] = "on-demand"
    else:
        group["nodeSelector"]["karpenter.sh/capacity-type"] = "spot"
    group['nodeSelector']['serve'] = "true"

