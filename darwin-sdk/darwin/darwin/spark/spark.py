import builtins
from typing import Any, Dict

import pyspark
import raydp
from pyspark.sql import SparkSession

from darwin.exceptions import NoActiveSparkSessionError
from darwin.spark.config_manager.spark_config_assembler import SparkConfigAssembler
from darwin.spark.config_manager.spark_glue_configs_manager import (
    SparkGlueConfigsManager,
)
from darwin.spark.spark_resources import SparkResources, prepare_resources
from darwin.util.constants import DARWIN_SPARK_DEFAULT_APP_NAME, INT_MAX
from darwin.util.enums import Environment, SparkLoggingLevel
from darwin.util.utils import get_env, run_jupyter_line_magic, set_events_log_dir
from darwin.version import Version


def _set_configs_from_resources(
    default_spark_conf: Dict[str, Any], resources
) -> Dict[str, Any]:
    num_executors: int = int(resources.num_executors)
    cores: int = int(resources.executor_cores)
    partitions: int = num_executors * cores * 2
    default_spark_conf["spark.sql.shuffle.partitions"] = partitions
    default_spark_conf["spark.dynamicCoreAllocation.taskRetriesFactor"] = min(4, cores)
    default_spark_conf["spark.sql.adaptive.coalescePartitions.initialPartitionNum"] = (
        min(INT_MAX, partitions * 2)
    )  # stay within JVM int range
    return default_spark_conf


def start_spark(
    spark_conf: dict = None,
    working_dir: str = None,
    enable_remote_shuffle: bool = False,
    dynamic_allocation: bool = False,
    spark_logging_level: SparkLoggingLevel = SparkLoggingLevel.ERROR,
) -> SparkSession:
    resources: SparkResources = prepare_resources(spark_conf)

    pyspark_version: Version = Version(pyspark.__version__)

    default_spark_conf = SparkGlueConfigsManager(
        pyspark_version, enable_remote_shuffle, dynamic_allocation
    ).get_configs()

    # Skip S3 event log configuration for LOCAL environment
    if get_env() != Environment.LOCAL:
        default_spark_conf = set_events_log_dir(default_spark_conf)
    default_spark_conf = _set_configs_from_resources(default_spark_conf, resources)

    if SparkSession.getActiveSession() is None or builtins.spark is None:
        spark: SparkSession = raydp.init_spark(
            app_name=spark_conf.get("spark.app.name", DARWIN_SPARK_DEFAULT_APP_NAME),
            num_executors=resources.num_executors,
            executor_cores=resources.executor_cores,
            executor_memory=resources.executor_memory,
            enable_hive=True,
            configs=SparkConfigAssembler.merge_conf(spark_conf, default_spark_conf),
        )
        run_jupyter_line_magic("load_ext", "sparksql_magic")
    else:
        spark: SparkSession = SparkSession.getActiveSession()

    if working_dir is not None:
        zip_path = working_dir
        zip_path = zip_path.replace("s3:", "s3a:")
        spark.sparkContext.addPyFile(zip_path)

    builtins.spark = spark
    builtins.spark.sparkContext.setLogLevel(spark_logging_level.value)
    print(f"ApplicationId for Spark : {spark.sparkContext.applicationId}")
    return spark


def get_raydp_spark_session() -> SparkSession:
    try:
        spark_session: SparkSession = builtins.spark
    except AttributeError as e:
        raise NoActiveSparkSessionError(
            "Spark session is not initialized. Please init darwin to initialize the spark session."
        ) from e
    if spark_session is None:
        raise NoActiveSparkSessionError(
            "Spark session is not initialized. Please init darwin to initialize the spark session."
        )
    return spark_session


def stop_raydp_spark():
    raydp.stop_spark()
    builtins.spark = None
