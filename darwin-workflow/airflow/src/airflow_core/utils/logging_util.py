import logging
import logging.config
from os import path


def get_logger(name: str = None) -> logging.Logger:
    return logging.getLogger(name)


class LoggingUtil:
    """Singleton class to manage logging configuration."""

    _instance = None

    def __new__(cls, *args, **kwargs):
        """Creates a singleton instance of LoggingUtil."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._logger = logging.getLogger(__name__)
        return cls._instance

    @classmethod
    def get_logger(cls):
        """Returns the configured logger instance."""
        return cls._instance._logger

    @classmethod
    def configure_logger(
        cls, file_path: str, level=logging.INFO, format=None, datefmt=None
    ):
        """
        Configures the logger with a file handler and specified level.

        Args:
            file_path (str): Path to the log file.
            level (int, optional): The logging level for the handler. Defaults to INFO.
            format (str, optional): The log message format. Defaults to None.
            datefmt (str, optional): The date/time format for log messages. Defaults to None.
        """
        file_handler = logging.FileHandler(file_path)
        file_handler.setLevel(level)

        formatter = logging.Formatter(format, datefmt)
        file_handler.setFormatter(formatter)

        cls.get_logger().setLevel(level)
        cls.get_logger().addHandler(file_handler)
