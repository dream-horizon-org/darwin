from typing import Dict
import os

from darwin.config_clients.spark_config_client import SparkConfigClient
from darwin.version import Version
from darwin.util.utils import get_default_spark_config_path, get_jars, overwrite_metastore_jars, get_default_jars_path, get_env
from darwin.util.enums import Environment


class SparkGlueConfigsManager:
    def __init__(
        self, pyspark_version: Version, enable_remote_shuffle: bool = False, enable_dynamic_allocation: bool = False
    ):
        """
        SparkGlueConfigsManager class is responsible for managing the spark configs for glue catalog.
        It reads the default and chooses the right configs with the options provided
        """
        self.pyspark_version = pyspark_version
        self.enable_remote_shuffle = enable_remote_shuffle
        self.enable_dynamic_allocation = enable_dynamic_allocation
        # For LOCAL environment, use basic configs without Glue dependencies
        if get_env() == Environment.LOCAL:
            self.spark_config_client = None
        else:
            self.spark_config_client = SparkConfigClient(get_default_spark_config_path(self.pyspark_version.__str__()))

    def get_configs(self) -> Dict[str, str]:
        # For LOCAL environment, return minimal configs without AWS Glue dependencies
        if get_env() == Environment.LOCAL:
            return self._get_local_configs()
        
        default_spark_configs: Dict = self.spark_config_client.get_all_spark_configs_dict()
        metastore_jars = get_jars(get_default_jars_path())
        driver_extra_classpath = overwrite_metastore_jars(get_default_jars_path(), metastore_jars, self.pyspark_version)
        if self.enable_remote_shuffle:
            default_spark_configs.update(self.spark_config_client.get_rss_config())
            if self.enable_dynamic_allocation:
                default_spark_configs.update(self.spark_config_client.get_dynamic_allocation_config())
            default_spark_configs["spark.driver.extraClassPath"] = (
                default_spark_configs.get("spark.executor.extraClassPath") + ":" + driver_extra_classpath
            )
        else:
            default_spark_configs["spark.driver.extraClassPath"] = driver_extra_classpath
        return default_spark_configs

    def _get_local_configs(self) -> Dict[str, str]:
        """Return minimal Spark configs for LOCAL environment without AWS Glue dependencies."""
        return {
            "spark.sql.execution.arrow.pyspark.enabled": "true",
            "spark.sql.session.timeZone": "UTC",
            "spark.driver.memory": "1g",
            "spark.executor.memory": "1g",
            "spark.sql.adaptive.enabled": "true",
            "spark.sql.adaptive.coalescePartitions.enabled": "true",
        }
