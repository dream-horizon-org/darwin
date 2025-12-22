import os
from loguru import logger

from compute_core.constant.config import Config
from compute_core.constant.constants import CONFIGS_MAP
from compute_core.dto.remote_command_dto import RemoteCommandDto
from compute_core.util.utils import set_handler_status, get_runtime_details
from compute_core.util.yaml_generator_v2.base_class import ConfigHandler
from compute_model.compute_cluster import ComputeClusterDefinition


def env_variable(key: str, value: any):
    return {"name": key, "value": str(value)}


def add_env_variable_excluding_mandatory_env(
    compute_request: ComputeClusterDefinition, mandatory_envs: list[dict], environ: list[dict]
):
    adv_config_envs = compute_request.advance_config.env_variables.split("\n")
    for adv_config_env in adv_config_envs:
        if adv_config_env == "":
            break
        adv_config_env_name, adv_config_env_value = adv_config_env.split("=")
        for mandatory_env in mandatory_envs:
            if mandatory_env["name"] == adv_config_env_name:
                logger.error(
                    f"Failed updating predefined env variable {adv_config_env_name} with value {adv_config_env_value} for cluster id {compute_request.cluster_id}"
                )
                raise Exception("Predefined environment cannot be overridden")
        logger.info(
            f"Updating env variable {adv_config_env_name} with value {adv_config_env_value} for cluster id {compute_request.cluster_id}"
        )
        environ.append(env_variable(adv_config_env_name, adv_config_env_value))


def add_gcp_env_variable(compute_request: ComputeClusterDefinition, gcp_envs: list[dict]):
    adv_config_envs = compute_request.advance_config.env_variables.split("\n")
    for adv_config_env in adv_config_envs:
        if adv_config_env == "":
            break
        gcp_env_name, gcp_env_value = adv_config_env.split("=")
        for gcp_env in gcp_envs:
            if gcp_env["name"] == gcp_env_name:
                gcp_env["value"] = gcp_env_value
                logger.info(
                    f"Updating gcp env variable {gcp_env_name} with value {gcp_env_value} for cluster id {compute_request.cluster_id}"
                )
                break


def get_spark_properties(env, runtime):
    """
    This function returns the spark properties for the given environment and runtime.
    """
    runtime_details = get_runtime_details(env, runtime)
    runtime_details["spark_connect"] = "true" if runtime_details["spark_connect"] == 1 else "false"
    runtime_details["spark_auto_init"] = "true" if runtime_details["spark_auto_init"] == 1 else "false"
    return runtime_details


def update_env_variables(values, compute_request, env, rss: bool = False):
    """
    This function updates the environment variables except those that are not predefined.
    """
    runtime_details = get_spark_properties(env, compute_request.runtime)
    environ = []
    mandatory_envs = [
        env_variable("TERMINATE_AFTER", compute_request.terminate_after_minutes),
        env_variable("CLUSTER_NAME", compute_request.name),
        env_variable("CLUSTER_ID", compute_request.cluster_id),
        env_variable("INIT_SCRIPT_API", CONFIGS_MAP[env]["init_script_api"]),
        env_variable(
            "RAY_PROMETHEUS_HOST", f"http://{compute_request.cluster_id}-prometheus.prometheus.svc.cluster.local:9090"
        ),
        env_variable(
            "RAY_GRAFANA_HOST", f"http://{compute_request.cluster_id}-grafana.prometheus.svc.cluster.local:3000"
        ),
        env_variable(
            "RAY_GRAFANA_IFRAME_HOST",
            f"http://{CONFIGS_MAP[env]['host_url']}/{compute_request.cloud_env}/{compute_request.cluster_id}-metrics",
        ),
        env_variable("RAY_PROMETHEUS_NAME", "prometheus"),
        env_variable("ENV", env),
        env_variable("CREATED_BY", compute_request.user),
        env_variable("CLOUD", "GCP" if "gcp" in compute_request.cloud_env else "AWS"),
        env_variable("RSS", rss),
        env_variable("SPARK_CONNECT_ENABLED", runtime_details["spark_connect"]),
        env_variable("IS_SPARK_AUTO_INITIALIZATION", runtime_details["spark_auto_init"]),
        env_variable("CHRONOS_API_URL", CONFIGS_MAP[env]["chronos_url"]),
    ]
    if env == "darwin-local":
        mandatory_envs.extend(
            [
                env_variable("AWS_ENDPOINT_URL_S3", f"{CONFIGS_MAP[env]['s3']['url']}"),
                env_variable("AWS_DEFAULT_REGION", f"{CONFIGS_MAP[env]['s3']['region']}"),
                env_variable("AWS_ACCESS_KEY_ID", f"{CONFIGS_MAP[env]['s3']['access_key']}"),
                env_variable("AWS_SECRET_ACCESS_KEY", f"{CONFIGS_MAP[env]['s3']['secret_access_key']}"),
            ]
        )

    add_env_variable_excluding_mandatory_env(compute_request, mandatory_envs, environ)

    environ.extend(mandatory_envs)
    values["common"]["containerEnv"].extend(environ)


def update_gcp_env_variables(values, compute_request):
    """
    This function updates the GCP environment variables.
    """
    config = Config()
    env = [
        {
            "name": "AWS_ACCESS_KEY_ID",
            "valueFrom": {"secretKeyRef": {"name": "iam-keys", "key": "AWS_ACCESS_KEY_ID"}},
        },
        {
            "name": "AWS_DEFAULT_REGION",
            "valueFrom": {"secretKeyRef": {"name": "iam-keys", "key": "AWS_DEFAULT_REGION"}},
        },
        {
            "name": "AWS_SECRET_ACCESS_KEY",
            "valueFrom": {"secretKeyRef": {"name": "iam-keys", "key": "AWS_SECRET_ACCESS_KEY"}},
        },
        {
            "name": "AWS_REGION",
            "valueFrom": {"secretKeyRef": {"name": "iam-keys", "key": "AWS_DEFAULT_REGION"}},
        },
        {
            "name": "AWS_ENDPOINT_URL",
            "valueFrom": {"secretKeyRef": {"name": "iam-keys", "key": "AWS_ENDPOINT_URL"}},
        },
        env_variable("AWS_ENDPOINT_URL_S3", config.get_cci_config["s3_endpoint_url"]),
        env_variable("AWS_ENDPOINT_URL_GLUE", config.get_cci_config["glue_endpoint_url"]),
        env_variable("AWS_GLUE_ENDPOINT", config.get_cci_config["glue_endpoint_url"]),
        env_variable("METASTORE_USERNAME", os.getenv("VAULT_SERVICE_DARWIN_METASTORE_USERNAME")),
        env_variable("METASTORE_PASSWORD", os.getenv("VAULT_SERVICE_DARWIN_METASTORE_PASSWORD")),
    ]

    add_gcp_env_variable(compute_request, env)

    values["common"]["containerEnv"].extend(env)


def process_cloud_env(values, compute_request):
    """
    This function is responsible for updating the cloud environment variables in the yaml file
    """
    if "gcp" in compute_request.cloud_env:
        update_gcp_env_variables(values, compute_request)


class EnvVariablesUpdateHandler(ConfigHandler):
    """
    This class is responsible for updating the environment variables in the yaml file
    """

    def handle(
        self,
        values: dict,
        compute_request: ComputeClusterDefinition,
        env: str,
        step_status_list: list,
        remote_commands: list[RemoteCommandDto] = None,
    ):
        update_env_variables(values, compute_request, env)
        process_cloud_env(values, compute_request)
        step_status_list = set_handler_status("env_handler", "SUCCESS", step_status_list)

        return super().handle(values, compute_request, env, step_status_list, remote_commands)
