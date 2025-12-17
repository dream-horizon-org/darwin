import logging
import logging.config
import os
from os import path

log_file_path = path.abspath(path.join(path.dirname(path.abspath(__file__)), '../constants/logging.conf'))

# Only configure logging if LOG_FILE environment variable is set
if os.getenv("LOG_FILE"):
    try:
        logging.config.fileConfig(log_file_path)
    except Exception as e:
        # Fallback to basic console logging if file config fails
        logging.basicConfig(
            level=logging.INFO,
            format='[%(asctime)s %(filename)s->%(funcName)s():%(lineno)s] %(levelname)s : %(message)s'
        )
else:
    # Use basic console logging for test environments
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s %(filename)s->%(funcName)s():%(lineno)s] %(levelname)s : %(message)s'
    )


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
    def configure_logger(cls, file_path: str, level=logging.INFO, format=None, datefmt=None):
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
