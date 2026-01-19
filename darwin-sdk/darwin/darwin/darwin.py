from typing import Optional

from pyspark.sql import SparkSession

from darwin.compute.get_cluster_response_dto import ClusterResponse
from darwin.compute.service import ComputeService
from darwin.spark.spark import get_raydp_spark_session, start_spark, stop_raydp_spark
from darwin.util.enums import SparkLoggingLevel
from darwin.util.utils import (
    assert_ondemand_worker_group_is_attached,
    get_cluster_id,
    str_to_bool,
)


def init_spark(**kwargs) -> SparkSession:
    """
    Initialize the darwin spark session, if present, it will use the existing session.
    :param kwargs: Additional keyword arguments for Spark session initialization.
    :return: SparkSession object
    """
    compute_metadata: ClusterResponse = ComputeService(get_cluster_id()).get_compute_metadata()
    assert_ondemand_worker_group_is_attached(compute_metadata)
    return start_spark(
        spark_conf=compute_metadata.data.spark_config,
        working_dir=compute_metadata.data.spark_config.get("spark.darwin.workingDir"),
        enable_remote_shuffle=str_to_bool(compute_metadata.data.spark_config.get("spark.darwin.enableRemoteShuffle")),
        dynamic_allocation=str_to_bool(
            compute_metadata.data.spark_config.get("spark.darwin.dynamicAllocation.enabled")
        ),
        spark_logging_level=SparkLoggingLevel.from_str(
            compute_metadata.data.spark_config.get("spark.darwin.loggingLevel", "ERROR")
        ),
    )


def init_spark_with_configs(
    spark_configs: Optional[dict] = None,
    working_dir: Optional[str] = None,
    remote_shuffle: bool = False,
    dynamic_allocation_with_remote_shuffle: bool = False,
) -> SparkSession:
    """
    Initialize the darwin spark session with custom configurations.
    :param spark_configs: Custom Spark configurations as a dictionary.
    :param working_dir: Optional working directory for Spark.
    :param remote_shuffle: Whether to enable remote shuffle.
    :param dynamic_allocation_with_remote_shuffle: Whether to enable dynamic allocation with remote shuffle.
    :return: SparkSession object
    """
    compute_metadata: ClusterResponse = ComputeService(get_cluster_id()).get_compute_metadata()
    assert_ondemand_worker_group_is_attached(compute_metadata)
    return start_spark(
        spark_conf=spark_configs,
        working_dir=working_dir,
        enable_remote_shuffle=remote_shuffle,
        dynamic_allocation=dynamic_allocation_with_remote_shuffle,
    )


def stop_spark():
    """
    Stop the spark session
    """
    stop_raydp_spark()


def get_spark_session():
    """
    Get the spark session
    """
    return get_raydp_spark_session()
