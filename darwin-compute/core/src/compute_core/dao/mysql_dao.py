from typing import Callable
from loguru import logger
from typeguard import typechecked

from compute_core.constant.config import Config
from compute_core.util.mysql_connection import Connection, ConnectionPool

# TODO: Global mutable state - consider using a proper singleton pattern or dependency injection
connection_pool = None


class CustomTransaction:
    def __init__(self, mysql_connection):
        self.mysql_connection = mysql_connection

    def __enter__(self):
        self.mysql_connection.start_transaction()
        return self.mysql_connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            self.mysql_connection.commit()
        else:
            self.mysql_connection.rollback()
            logger.error(f"Error in transaction: {exc_type} {exc_val} {exc_tb}")
        if self.mysql_connection.connector.is_connected():
            self.mysql_connection.close()


@typechecked
class MySQLDao:
    """
    For executing read/write/update/delete queries using separate read/write DBs
    """

    # TODO: Connection pool initialization is not thread-safe - add locking or use a proper singleton
    def __init__(self, env: str = None):
        global connection_pool
        logger.debug(f"MySQLDao initializing with env: {env}")
        if connection_pool is None:
            config = Config(env).db_config()
            # TODO: Logging config with potential credentials is a security risk
            logger.debug(f"Creating connection pool with config: {config}")
            connection_pool = ConnectionPool(config)
        self.connection_pool = connection_pool
        logger.info("MySQLDao initialized.")

    def get_write_connection(self):
        """
        Gets a connection from write connection pool
        """
        logger.debug("Getting write connection.")
        return Connection(self.connection_pool.write_pool.get_connection())

    def get_read_connection(self):
        """
        Gets a connection from read connection pool
        """
        logger.debug("Getting read connection.")
        return Connection(self.connection_pool.read_pool.get_connection())

    def healthcheck(self):
        """
        Healthcheck of MySQL DB connections
        :return: Dict with read and write connection status
        """
        logger.debug("Performing healthcheck.")
        write_connection = self.get_write_connection()
        read_connection = self.get_read_connection()
        try:
            write_status = write_connection.connector.is_connected()
            read_status = read_connection.connector.is_connected()
            logger.info(f"Write connection status: {write_status}, Read connection status: {read_status}")
            return {"write": write_status, "read": read_status}
        finally:
            write_connection.close()
            read_connection.close()
            logger.debug("Healthcheck connections closed.")

    def create(self, query: str, data: dict, func: Callable = lambda: None):
        """
        For writing data to MySQL DB
        :param query: SQL query
        :param data: Data to be written
        :param func: Function to be executed in transaction
        :return: id of last row executed, func_resp
        """
        logger.debug(f"Creating data with data: {data}")
        mysql_connection = self.get_write_connection()
        try:
            created, _, func_resp = mysql_connection.write(query, data, func)
            logger.info(f"Data created, created id: {created}, func_resp: {func_resp}")
            return created, func_resp
        finally:
            if mysql_connection.connector.is_connected():
                mysql_connection.close()
                logger.debug("Create connection closed")

    def read(self, query: str, data: dict = None):
        """
        For reading data from MySQL DB
        :param query: SQL query
        :param data: Data to be written
        :return: result returned after executing query
        """
        data = data if data else {}
        logger.debug(f"Reading data with data: {data}")
        mysql_connection = self.get_read_connection()
        try:
            read_res = mysql_connection.read(query, data)
            logger.info(f"Read result: {read_res}")
            return read_res
        finally:
            if mysql_connection.connector.is_connected():
                mysql_connection.close()
                logger.debug("Read connection closed")

    def update(self, query: str, data: dict, func: Callable = lambda: None):
        """
        For updating data from MySQL DB
        :param query: SQL query
        :param data: Data to be written
        :param func: Function to be executed in transaction
        :return: total number of rows in which changes were made, func_resp
        """
        logger.debug(f"Updating data with data: {data}")
        mysql_connection = self.get_write_connection()
        try:
            _, updated, func_resp = mysql_connection.write(query, data, func)
            logger.info(f"Data updated, updated rows: {updated}, func_resp: {func_resp}")
            return updated, func_resp
        finally:
            if mysql_connection.connector.is_connected():
                mysql_connection.close()
                logger.debug("Update connection closed")

    def delete(self, query: str, data: dict, func: Callable = lambda: None):
        """
        For deleting data from MySQL DB
        :param query: SQL query
        :param data: Data to be written
        :param func: Function to be executed in transaction
        :return: total number of deleted rows, func_resp
        """
        logger.debug(f"Deleting data with data: {data}")
        mysql_connection = self.get_write_connection()
        try:
            _, deleted, func_resp = mysql_connection.write(query, data, func)
            logger.info(f"Data deleted, deleted rows: {deleted}, func_resp: {func_resp}")
            return deleted, func_resp
        finally:
            if mysql_connection.connector.is_connected():
                mysql_connection.close()
                logger.debug("Delete connection closed")
