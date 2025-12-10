from typing import Dict

from darwin.spark.config_manager.spark_config_merge_strategies import SparkConfigMergeStrategies, MergeStrategy


class SparkConfigAssembler:
    # Static strategy map
    merge_strategies: Dict[str, MergeStrategy] = {
        "spark.jars": SparkConfigMergeStrategies.UNSUPPORTED,
        "spark.jars.packages": SparkConfigMergeStrategies.UNSUPPORTED,
        "spark.jars.excludes": SparkConfigMergeStrategies.COMMA,
        "spark.files": SparkConfigMergeStrategies.COMMA,
        "spark.driver.extraClassPath": SparkConfigMergeStrategies.COLON,
        "spark.executor.extraClassPath": SparkConfigMergeStrategies.COLON,
        "spark.driver.extraJavaOptions": SparkConfigMergeStrategies.SPACE,
        "spark.executor.extraJavaOptions": SparkConfigMergeStrategies.SPACE,
    }

    @staticmethod
    def merge_conf(user_conf: Dict[str, str], default_conf: Dict[str, str]) -> Dict[str, str]:
        merged_conf = default_conf.copy()
        for key, user_value in user_conf.items():
            if user_value:
                strategy: MergeStrategy = SparkConfigAssembler.merge_strategies.get(
                    key, SparkConfigMergeStrategies.OVERWRITE
                )
                default_value = default_conf.get(key)
                merged_conf[key] = strategy(default_value, user_value)
        return merged_conf

    def __new__(cls, *args, **kwargs):
        raise TypeError(f"{cls.__name__} is a static utility class and cannot be instantiated.")
