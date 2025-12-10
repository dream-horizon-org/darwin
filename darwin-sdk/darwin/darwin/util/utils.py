import os
import time
from functools import wraps
from typing import Union, Dict, Optional
from urllib.parse import urlparse
import boto3

from darwin.compute.get_cluster_response_dto import ClusterResponse
from darwin.exceptions import InvalidClusterAttachedError
from darwin.util.enums import Environment
from darwin.version import Version
from darwin.util.constants import SPARK_EVENT_LOG_DIR


def run_jupyter_line_magic(magic: str, line: str):
    """
    Run a jupyter line magic command, only if running in jupyter.
    """
    try:
        from IPython import get_ipython

        if get_ipython() is not None:
            get_ipython().run_line_magic(magic, line)
    except ImportError:
        return


def get_default_spark_config_path(version: Union[str, Version]) -> str:
    if get_env() == Environment.DEV or get_env() == Environment.STAG:
        return os.path.join(
            os.path.dirname(__file__),
            "..",
            "spark",
            "configs",
            f"spark_configs_{version}_{get_env().value.lower()}.ini",
        )
    return os.path.join(os.path.dirname(__file__), "..", "spark", "configs", f"spark_configs_{version}.ini")


def get_application_config_path() -> str:
    return os.path.join(os.path.dirname(__file__), "..", "spark", "configs", "application_configs.ini")


def get_jars(directory: str) -> str:
    """Get Hive JARs for metastore integration."""
    files = os.listdir(directory)
    # Filter for Hive JARs needed for metastore
    jar_files = [
        directory + "/" + f 
        for f in files 
        if f.endswith(".jar") and f.startswith("hive-")
    ]
    return ":".join(jar_files)


def overwrite_metastore_jars_3_5_0(local_dir: str, metastore_jars: str) -> str:
    metastore_jars = f"{local_dir}/parquet-column-1.13.1.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/parquet-common-1.13.1.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/parquet-encoding-1.13.1.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/parquet-format-structures-1.13.1.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/parquet-hadoop-1.13.1.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/parquet-jackson-1.13.1.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/aws-java-sdk-core-1.12.31.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/aws-java-sdk-glue-1.12.31.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/aws-java-sdk-sts-1.12.31.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/log4j-api-2.17.2.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/log4j-core-2.17.2.jar" + ":" + metastore_jars
    metastore_jars = f"{local_dir}/log4j-slf4j-impl-2.17.2.jar" + ":" + metastore_jars
    return metastore_jars


def overwrite_metastore_jars(local_dir: str, metastore_jars: str, pyspark_version: Version) -> str:
    """Some jars needs overwritten based on the spark version for glue, it works only this way."""
    if pyspark_version == Version("3.5.0"):
        return overwrite_metastore_jars_3_5_0(local_dir, metastore_jars)


def get_default_jars_path() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "jars"))


def set_events_log_dir(default_spark_conf: Dict[str, str]) -> Dict[str, str]:
    default_event_logs_dir = SPARK_EVENT_LOG_DIR
    boto_client = boto3.client("s3")
    cluster_id: str = os.getenv("CLUSTER_ID", "")
    eventlog_dir = f"{default_event_logs_dir}/{cluster_id}/"
    parsed_url = urlparse(eventlog_dir)
    bucket_name = parsed_url.netloc
    folder_name = parsed_url.path.lstrip("/")
    if cluster_id != "":
        try:
            boto_client.head_object(Bucket=bucket_name, Key=folder_name)
        except boto_client.exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                boto_client.put_object(Bucket=bucket_name, Key=folder_name)
            else:
                eventlog_dir = default_event_logs_dir
        except Exception as e:
            eventlog_dir = default_event_logs_dir
    else:
        eventlog_dir = default_event_logs_dir

    default_spark_conf["spark.eventLog.dir"] = eventlog_dir
    return default_spark_conf


def get_env() -> Environment:
    env_str: str = os.getenv("ENV", "")
    if env_str == "":
        raise ValueError("ENV environment variable is not set.")
    return Environment.from_str(env_str.upper())


def get_cluster_id() -> str:
    cluster_id: str = os.getenv("CLUSTER_ID", "")
    if cluster_id == "":
        raise ValueError("CLUSTER_ID environment variable is not set.")
    return cluster_id


def retry(retries=3, delay=1, exceptions=(Exception,)):
    """
    A decorator to retry a function on exception.

    Parameters:
    - retries: Number of retries before giving up (default: 3).
    - delay: Delay in seconds between retries (default: 1 second).
    - exceptions: Tuple of exceptions to catch and retry on (default: Exception).
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < retries:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    attempts += 1
                    print(f"Attempt {attempts} failed with error: {e}")
                    if attempts < retries:
                        time.sleep(delay)
                    else:
                        print(f"All retries failed for function {func.__name__}")
                        raise e

        return wrapper

    return decorator


def assert_ondemand_worker_group_is_attached(compute_metadata: ClusterResponse):
    if not compute_metadata.data.has_ondemand_worker_group:
        raise InvalidClusterAttachedError(
            "No on-demand worker group found for the current running cluster. Please attach an on-demand worker group to the cluster."
        )


def str_to_bool(value: Optional[str]) -> bool:
    """
    Convert a string to a boolean value.
    :param value: String value to convert.
    :return: True if the string is 'true', '1', False otherwise.
    """
    if value is None:
        return False
    return value.lower() in ("true", "1")
