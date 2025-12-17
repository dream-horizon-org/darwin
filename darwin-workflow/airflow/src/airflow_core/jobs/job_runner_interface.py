from __future__ import annotations

from abc import ABC
from enum import Enum


class JobRunnerInterface(ABC):
    """
    Base class for a running jobs on Ray clusters.
    We need to build the artifact for the job scripts before using this.
    Also, we need to create the cluster_definition before using this
    """

    def submit_job(self, entry_point_cmd: str, runtime_env=None):
        """

        :param entry_point_cmd:The shell command to run for this job.
        :param job_id:A unique ID for this job.
        :param remote_dirs:The directory in which job should run
        :return: The submission ID of the submitted job
        """
        pass

    def get_status(self, job_id: str, time_out_in_sec_for_job: int = 1800):
        """
        :param job_id:The job ID or submission ID of the job whose status is being requested
        :param time_out_in_sec_for_job: Waiting time for job running
        :return: Status of the submitted job.
        """
        pass

    def get_logs(self, job_id: str):
        """
        :param job_id: The job ID or submission ID of the job whose logs are being requested
        :return: A string containing the full logs of the job.
        """
        pass

    def list_all_jobs(self, filter_func=None):
        """
        :param filter_func:
        :return:
        """
        pass

    def get_all_job_details(self, job_id: str):
        """

        :param job_id:A unique ID for this job.
        :return:
        """
        pass

    def dump_logs_to_file(self, job_id):
        """

        :param job_id: A unique ID for this job.
        :return: Path to the log file
        """

    pass

    def create_cluster(self, yaml_path: str, env: str):
        """
        :param yaml_path: Path to the yaml file
        :return: cluster_id
        """

    pass

    def get_num_nodes_from_yaml(self, file_path="resources/cluster_config.yaml"):
        """
        :param file_path: Path to the yaml file
        :return: Number of nodes in the cluster
        """

    pass

    def run_job_till_completion(
        self,
        cluster_id: str,
        entry_point_cmd: str,
        cluster_type: str = Enum("job", "basic"),
        job_id: str = None,
        remote_dirs: str = None,
        num_pods_active: int = 17,
        time_out_in_sec_for_cluster=1200,
        time_out_in_sec_for_job: int = 3600,
        wait_time_for_shutdown_in_sec=600,
        runtime_env=None,
    ):
        """

        :param num_pods_active: Number of pods that are active
        :param cluster_id: Cluster identification of the cluster which needs to be updated
        :param entry_point_cmd: The shell command to run for this job.
        :param job_id: A unique ID for this job.
        :param remote_dirs: The directory in which job should run
        :param time_out_in_sec_for_cluster: Waiting time for cluster creation
        :param time_out_in_sec_for_job: Waiting time for running a job
        :param wait_time_for_shutdown_in_sec: Waiting time for cluster shutdown
        :return:
        """

    pass
