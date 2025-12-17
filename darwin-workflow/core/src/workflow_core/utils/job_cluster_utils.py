from typing import List

from workflow_model.job_cluster import HeadNodeConfig, WorkerNodeConfig


def get_cores(head_node_config: HeadNodeConfig, worker_node_configs: List[WorkerNodeConfig]):
    head_node_cores = head_node_config.cores
    worker_cores = 0
    for worker in worker_node_configs:
        worker_cores += worker.cores_per_pods
    return head_node_cores + (
        worker_cores * worker_node_configs[0].max_pods if worker_node_configs and worker_cores > 0 else 0)

def get_memory(head_node_config: HeadNodeConfig, worker_node_configs: List[WorkerNodeConfig]):
    head_node_memory = head_node_config.memory or head_node_config.gpu_pod.memory
    worker_memory = 0
    for worker in worker_node_configs:
        worker_memory += worker.memory_per_pods
    return head_node_memory + (
        worker_memory * worker_node_configs[0].max_pods if worker_node_configs and worker_memory > 0 else 0)