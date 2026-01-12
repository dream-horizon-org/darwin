# TODO: lru_cache creates effectively singleton instances - document this behavior or use explicit singleton pattern
from functools import lru_cache

from compute_core.compute import Compute
from compute_core.constant.config import Config
from compute_core.dao.jupyter_dao import JupyterDao
from compute_core.dao.spark_history_server_dao import SparkHistoryServerDAO
from compute_core.remote_command import RemoteCommand
from compute_core.service.dcm import DarwinClusterManager
from compute_core.service.spark_history_server import SparkHistoryServerService
from compute_core.util.package_management.package_manager import LibraryManager
from compute_script.dao.sql_dao import ScriptMySQLDao


# TODO: Consider adding cache invalidation mechanism for testing and hot-reloading scenarios
@lru_cache
def get_remote_command() -> RemoteCommand:
    return RemoteCommand()


@lru_cache
def get_compute() -> Compute:
    return Compute()


@lru_cache
def get_config() -> Config:
    return Config()


@lru_cache
def get_library_manager() -> LibraryManager:
    return LibraryManager()


@lru_cache
def get_shs_dao():
    return SparkHistoryServerDAO()


@lru_cache
def get_shs_service():
    return SparkHistoryServerService()


@lru_cache
def get_dcm():
    return DarwinClusterManager()


@lru_cache
def get_script_sql_dao():
    return ScriptMySQLDao()


@lru_cache
def get_jupyter_dao():
    return JupyterDao()
