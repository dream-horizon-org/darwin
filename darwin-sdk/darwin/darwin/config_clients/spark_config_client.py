import os
from configparser import ConfigParser
from typing import Dict, List, Tuple

from darwin.exceptions import ConfigNotFoundError
from darwin.util.constants import (
    EXTRA_JARS_PATH,
    SPARK_CONFIG_SECTION,
    SPARK_DYNAMIC_ALLOCATION_SECTION,
    SPARK_JARS_KEY,
    SPARK_JARS_SECTION,
    SPARK_RSS_CONFIGS_SECTION,
)
from darwin.util.utils import get_default_jars_path


class SparkConfigClient:
    """
    SparkConfigClient class is responsible for managing the spark configs. It reads the default spark configs from
    the config file and parses them, later fed to raydp for spark session creation.
    Parameters:
        config_path (str): The path to the config file.
    """

    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config_parser = ConfigParser(allow_no_value=True)
        self.config_parser.optionxform = str  # Preserve the case of the keys
        self.config_parser.read(self.config_path)
        self.default_spark_configs: Dict[str, str] = self.get_spark_configs()
        self.set_jars()

    def get_spark_configs(self) -> Dict[str, str]:
        return dict(self.config_parser.items(SPARK_CONFIG_SECTION))

    def get_all_spark_configs_dict(self) -> Dict[str, str]:
        return self.default_spark_configs

    def get_default_jars(self) -> List[Tuple[str, str]]:
        if not self.config_parser.has_section(SPARK_JARS_SECTION):
            raise ConfigNotFoundError("Jars section not found")
        return self.config_parser.items(SPARK_JARS_SECTION)

    def get_rss_config(self) -> Dict[str, str]:
        if not self.config_parser.has_section(SPARK_RSS_CONFIGS_SECTION):
            raise ConfigNotFoundError("Remote shuffle configs section not found")
        rss_configs: Dict[str, str] = dict(
            self.config_parser.items(SPARK_RSS_CONFIGS_SECTION)
        )
        return self._set_and_get_rss_configs(rss_configs)

    def get_dynamic_allocation_config(self) -> Dict[str, str]:
        if not self.config_parser.has_section(SPARK_DYNAMIC_ALLOCATION_SECTION):
            raise ConfigNotFoundError("Dynamic allocation section not found")
        return dict(self.config_parser.items(SPARK_DYNAMIC_ALLOCATION_SECTION))

    def set_jars(self) -> None:
        default_jars_path: str = get_default_jars_path()
        jars: List[str] = [
            f"{default_jars_path}/{jar}" for _, jar in self.get_default_jars()
        ]
        self.default_spark_configs[SPARK_JARS_KEY] = ",".join(jars)
        self._set_extra_jars()

    def _set_extra_jars(self) -> None:
        """
        This is to set extra download jars from in '/home/ray/darwin_pkgs/jars' folder
        """
        if os.path.exists(EXTRA_JARS_PATH):
            jars_path = EXTRA_JARS_PATH
            jars = [
                f"{jars_path}/{jar}"
                for jar in os.listdir(jars_path)
                if jar.endswith(".jar")
            ]
            if jars:
                self.default_spark_configs[SPARK_JARS_KEY] += "," + ",".join(jars)

    def _set_and_get_rss_configs(self, rss_configs: Dict[str, str]) -> Dict[str, str]:
        """
        This is to set celeborn jars from default jars folder
        """
        celeborn_jars_path: str = (
            get_default_jars_path() + "/" + rss_configs.get("celeborn.jar")
        )
        rss_configs.pop("celeborn.jar")
        rss_configs["spark.executor.extraClassPath"] = celeborn_jars_path
        rss_configs["spark.driver.extraClassPath"] = celeborn_jars_path
        rss_configs["raydp.executor.extraClassPath"] = celeborn_jars_path
        rss_configs["raydp.driver.extraClassPath"] = celeborn_jars_path
        return rss_configs
