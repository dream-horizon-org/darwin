import logging
import logging.config
from os import path
from typing import Optional

log_file_path = path.abspath(
    path.join(path.dirname(path.abspath(__file__)), "../constant/logging.conf")
)
logging.config.fileConfig(log_file_path)


def get_logger(name: Optional[str] = None) -> logging.Logger:
    return logging.getLogger(name)
