import logging
import configparser


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colored output"""
    BRIGHT_CYAN = '\033[1;96m'
    BRIGHT_YELLOW = '\033[1;93m'
    BRIGHT_RED = '\033[1;91m'
    BRIGHT_GREEN = '\033[1;92m'
    RESET = '\033[0m'

    def format(self, record):
        original_levelname = record.levelname

        if record.levelname == 'INFO':
            record.levelname = f"{self.BRIGHT_CYAN}{original_levelname}{self.RESET}"
        elif record.levelname == 'WARNING':
            record.levelname = f"{self.BRIGHT_YELLOW}{original_levelname}{self.RESET}"
        elif record.levelname == 'ERROR':
            record.levelname = f"{self.BRIGHT_RED}{original_levelname}{self.RESET}"
        elif record.levelname == 'SUCCESS':
            record.levelname = f"{self.BRIGHT_GREEN}{original_levelname}{self.RESET}"

        result = super().format(record)
        record.levelname = original_levelname
        return result


def setup_logging():
    config_path = 'logging.conf'
    logger = logging.getLogger('darwin_workflow')

    if logger.handlers:
        return logger

    config = configparser.ConfigParser()
    config.read(config_path)

    level_name = config.get('logging', 'level', fallback='INFO').upper()
    fmt = config.get('logging', 'format', fallback='%(asctime)s %(levelname)s: %(message)s')
    datefmt = config.get('logging', 'datefmt', fallback='%Y-%m-%d %H:%M:%S')

    level = getattr(logging, level_name, logging.INFO)
    logger.setLevel(level)

    formatter = ColoredFormatter(fmt, datefmt=datefmt)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(level)

    logger.addHandler(console_handler)

    return logger