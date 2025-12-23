import requests

from workflow_core.constants.configs import Config
from workflow_core.constants.constants import JOB
from workflow_model.workflow import ClusterDetails


class ComputeApi:
    def __init__(self, env: str):
        self._config = Config(env)
        self.compute_url = self._config.get_compute_url

    def get_cluster(self, cluster_id: str):
        try:
            url = self.compute_url + "/cluster/" + cluster_id
            resp = requests.request(method='GET', url=url, timeout=60)
            if resp.status_code == 200:
                return resp.json()
            else:
                return None
        except Exception as e:
            # Log error but return None to maintain backward compatibility
            return None

    def get_job_cluster_details(self, cluster_id: str):
        # TODO Fetch job cluster details
        raise NotImplementedError

    def get_cores(self, head_node_config: dict, worker_node_configs: list[dict]):
        """
        Get cores
        :param head_node_config: dict
        :param worker_node_configs: List[dict]
        :return: cores
        """
        if not head_node_config or not worker_node_configs:
            return 0

        head_node_cores = head_node_config.get('head_node_cores', 0)
        total_worker_cores = sum(worker.get('cores', 0) * worker.get('max_pods', 0) for worker in worker_node_configs)

        return head_node_cores + total_worker_cores

    def get_memory(self, head_node_config: dict, worker_node_configs: list[dict]):
        """
        Get memory
        :param head_node_config: HeadNodeConfig
        :param worker_node_configs: List[WorkerNodeConfig]
        :return: memory
        """
        if not head_node_config or not worker_node_configs:
            return 0

        head_node_memory = head_node_config.get('head_node_memory', 0)
        total_worker_memory = sum(worker.get('memory', 0) * worker.get('max_pods', 0) for worker in worker_node_configs)

        return head_node_memory + total_worker_memory

    def get_cluster_details(self, cluster_id: str):
        """
        Get cluster details
        :param cluster_id: cluster id
        :return: ClusterDetails
        """
        resp = self.get_cluster(cluster_id=cluster_id)
        if resp is not None and resp['status'] == 'SUCCESS':
            return ClusterDetails(
                cluster_id=cluster_id,
                runtime=resp['data']['runtime'],
                cluster_name=resp['data']['name'],
                cluster_status=resp['data']['status'],
                cores=self.get_cores(
                    head_node_config=resp['data']['head_node_config'],
                    worker_node_configs=resp['data']['worker_node_configs']
                ),
                memory=self.get_memory(
                    head_node_config=resp['data']['head_node_config'],
                    worker_node_configs=resp['data']['worker_node_configs']
                ),
                ray_dashboard="",
                logs_dashboard="",
                events_dashboard=""
            )
        return ClusterDetails(
            cluster_id=cluster_id,
            runtime="",
            cluster_name="",
            cluster_status="",
            memory=0,
            cores=0,
            ray_dashboard="",
            logs_dashboard="",
            events_dashboard=""
        )
