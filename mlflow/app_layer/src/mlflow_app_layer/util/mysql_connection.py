from typing import Callable, Optional, Any

from mysql.connector import pooling
from mysql.connector.connection import MySQLConnection


class ConnectionPool:
    """
    Creates a connection pool with the config provided
    """

    def __init__(self, config):
        self.connection_pool = pooling.MySQLConnectionPool(
            pool_name=config["database"] + "_pool", pool_size=24, **config
        )

    def get_connection_pool(self):
        """
        Returns a connection pool
        """
        return self.connection_pool


class Connection:
    """
    Base class for the MySQL connection
    """

    def __init__(self, connector: MySQLConnection):
        self.connector = connector
        self.cursor = self.connector.cursor(dictionary=True)

    def read(self, query: str, data: dict[str, Any]):
        """
        For reading data from MySQL DB
        :param query: SQL Query
        :param data: Values to be fed inside SQL Query.
        :return: result returned after executing query
        """
        self.cursor.execute(query, data)
        return self.cursor.fetchall()

    def write(self, query: str, data: dict[str, Any], func: Callable[[], Any]):
        """
        For writing transaction to MySQL DB
        :param query: SQL Query
        :param data: Values to be fed inside SQL Query.
        :param func: function to be executed during the transaction.
        :return: id of last row executed and total number of rows in which changes were made and func response
        """
        self.cursor.execute(query, data)
        try:
            func_resp = func()
            self.commit()
            return self.cursor.lastrowid, self.cursor.rowcount, func_resp
        except Exception as e:
            self.rollback()
            raise e

    def commit(self):
        """
        Commits the transaction
        """
        self.connector.commit()

    def rollback(self):
        """
        Rolls back the transaction
        """
        self.connector.rollback()

    def close(self):
        """
        Closes MySQL cursor & connector
        """
        self.cursor.close()
        self.connector.close()

    def start_transaction(self):
        """
        Starts a transaction
        """
        self.connector.start_transaction()

    def execute_query(self, query: str, data: Optional[dict[str, Any]] = None):
        """
        Executes a query
        """
        self.cursor.execute(query, data)
