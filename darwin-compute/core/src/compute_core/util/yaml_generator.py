import copy

from compute_model.ray_start_params import RayStartParams
from loguru import logger

from compute_core.constant.constants import CONFIGS_MAP, KubeCluster
from compute_core.util.utils import get_node_preferred_scheduling
from compute_core.dao.cluster_dao import ClusterDao
from compute_core.dao.runtime_dao import RuntimeDao

ZONES = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d"]
NODE_TYPE_INSTANCE_CATEGORY_MAP = {"general": "m", "compute": "c", "memory": "r"}
AWS_INIT_CONTAINER_IMAGE = "000375658054.dkr.ecr.us-east-1.amazonaws.com/busybox:1.28"
GCP_INIT_CONTAINER_IMAGE = "gcr.io/d11-causality/busybox:1.28"

rss_fsx_name = None
rss_per_fsx_claim_num = 0
cloud = "aws"


def update_resource(cores: int, memory: int, gpu_count: int = 0):
    resource = {
        "limits": {"cpu": 0, "memory": "0G"},
        "requests": {"cpu": 0, "memory": "0G"},
    }
    resource["limits"]["cpu"] = cores
    resource["limits"]["memory"] = f"{memory}G"

    if gpu_count > 0:
        resource["limits"]["nvidia.com/gpu"] = gpu_count

    resource["requests"] = resource["limits"]

    logger.debug(f"Values.yaml resource: {resource}")

    return resource


def add_annotation(group, kube_cluster: KubeCluster):
    group["annotations"] = {}

    if kube_cluster == KubeCluster.GCP:
        group["annotations"]["cluster-autoscaler.kubernetes.io/safe-to-evict"] = "false"
    else:
        group["annotations"]["karpenter.sh/do-not-disrupt"] = "true"


def update_head_group_ray_start_params(
    head_group_ray_start_params, ray_start_params: RayStartParams, head_node_memory: int
):
    head_group_ray_start_params["num-cpus"] = f"{ray_start_params.num_cpus_on_head}"
    head_group_ray_start_params["num-gpus"] = f"{ray_start_params.num_gpus_on_head}"
    object_store_memory = int((ray_start_params.object_store_memory_perc * head_node_memory / 100) * 1024 * 1024 * 1024)
    head_group_ray_start_params["object-store-memory"] = f"{object_store_memory}"


def add_volume_mount(name: str, claim_name: str, mount_path: str, group):
    group["volumes"].append({"name": name, "persistentVolumeClaim": {"claimName": claim_name}})
    group["volumeMounts"].append({"name": name, "mountPath": mount_path})


def update_karpenter_node_selector(group, node_type, node_capacity_type, cloud_env):
    group["nodeSelector"] = {}
    if cloud_env not in [KubeCluster.GCP.value]:
        group["nodeSelector"]["app"] = "ray"

    if node_capacity_type == "ondemand":
        group["nodeSelector"]["karpenter.sh/capacity-type"] = "on-demand"
    elif node_capacity_type == "spot":
        group["affinity"] = {"nodeAffinity": get_node_preferred_scheduling()}

    # Commenting this for future use
    # if node_type is not None and node_type in NODE_TYPE_INSTANCE_CATEGORY_MAP:
    #     group["nodeSelector"]["karpenter.k8s.aws/instance-category"] = NODE_TYPE_INSTANCE_CATEGORY_MAP[node_type]


def add_ondemand_resource(group):
    group["rayStartParams"]["resources"] = r'"{\"ondemand\": 100}"'


def add_spot_resource(group):
    group["rayStartParams"]["resources"] = r'"{\"spot\": 200}"'


def update_worker_group_ray_start_params(
    wg_ray_start_params, ray_start_params: RayStartParams, worker_node_memory: int
):
    object_store_memory = int(
        (ray_start_params.object_store_memory_perc * worker_node_memory / 100) * 1024 * 1024 * 1024
    )
    wg_ray_start_params["object-store-memory"] = f"{object_store_memory}"


def env_variable(name: str, value: any):
    return {"name": name, "value": str(value)}


def update_env_variables(values, compute_request, env, rss: bool = False):
    env_list = compute_request.advance_config.env_variables.split("\n")
    environ = []
    for i in env_list:
        if i == "":
            break
        environ.append(env_variable(i.split("=")[0], i.split("=")[1]))
    mandatory_env = [
        env_variable("TERMINATE_AFTER", compute_request.terminate_after_minutes),
        env_variable("CLUSTER_NAME", compute_request.name),
        env_variable("CLUSTER_ID", compute_request.cluster_id),
        env_variable("INIT_SCRIPT_API", CONFIGS_MAP[env]["init_script_api"]),
        env_variable(
            "RAY_PROMETHEUS_HOST",
            f"http://{compute_request.cluster_id}-prometheus.prometheus.svc.cluster.local:9090",
        ),
        env_variable(
            "RAY_GRAFANA_HOST",
            f"http://{compute_request.cluster_id}-grafana.prometheus.svc.cluster.local:3000",
        ),
        env_variable(
            "RAY_GRAFANA_IFRAME_HOST",
            f"https://{CONFIGS_MAP[env]['host_url']}/{compute_request.cloud_env}/{compute_request.cluster_id}-metrics",
        ),
        env_variable("ENV", env),
        env_variable("CREATED_BY", compute_request.user),
        env_variable("CLOUD", "GCP" if "gcp" in compute_request.cloud_env else "AWS"),
        env_variable("RSS", rss),
    ]
    if env == "darwin-local":
        mandatory_env.extend(
            [
                env_variable("AWS_ENDPOINT_URL", f"{CONFIGS_MAP[env]['s3']['url']}"),
                env_variable("AWS_ENDPOINT_URL_S3", f"{CONFIGS_MAP[env]['s3']['url']}"),
                env_variable("AWS_DEFAULT_REGION", f"{CONFIGS_MAP[env]['s3']['region']}"),
                env_variable("AWS_ACCESS_KEY_ID", f"{CONFIGS_MAP[env]['s3']['access_key']}"),
                env_variable("AWS_SECRET_ACCESS_KEY", f"{CONFIGS_MAP[env]['s3']['secret_access_key']}"),
            ]
        )
    environ.extend(mandatory_env)
    values["head"]["containerEnv"].extend(environ)
    values["worker"]["containerEnv"].extend(environ)
    if "additionalWorkerGroups" in values.keys():
        for i in values["additionalWorkerGroups"]:
            values["additionalWorkerGroups"][i]["containerEnv"].extend(environ)


def update_spark_config(values, spark_config, cluster_id, cloud_env, env):
    values["sparkConfig"] = copy.deepcopy(spark_config)

    values["sparkConfig"]["spark.ui.proxyRedirectUri"] = "/"
    values["sparkConfig"]["spark.ui.proxyBase"] = f"/{cloud_env}/{cluster_id}-sparkui"
    # Prometheus integration for raydp
    values["sparkConfig"][
        "spark.metrics.conf.*.sink.prometheusServlet.class"
    ] = "org.apache.spark.metrics.sink.PrometheusServlet"
    values["sparkConfig"]["spark.metrics.conf.*.sink.prometheusServlet.path"] = "/metrics/prometheus"
    values["sparkConfig"]["spark.metrics.conf.master.sink.prometheusServlet.path"] = "/metrics/master/prometheus"
    values["sparkConfig"][
        "spark.metrics.conf.applications.sink.prometheusServlet.path"
    ] = "/metrics/applications/prometheus"
    values["sparkConfig"]["spark.ui.prometheus.enabled"] = "true"


def update_gcp_env_variables(values):
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
    ]
    values["common"]["containerEnv"].extend(env)
    # values["head"]["containerEnv"].extend(env)
    # values["worker"]["containerEnv"].extend(env)
    # if "additionalWorkerGroups" in values.keys():
    #     for i in values["additionalWorkerGroups"]:
    #         values["additionalWorkerGroups"][i]["containerEnv"].extend(env)
