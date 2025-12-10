from enum import Enum

from darwin.exceptions import InvalidEnvironmentError, InvalidDarwinInitModeError, InvalidSparkLoggingLevelError


class ComputeStatus(Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class Environment(Enum):
    PROD = "PROD"
    UAT = "UAT"
    STAG = "STAG"
    DEV = "DEV"
    LOCAL = "LOCAL"

    @classmethod
    def from_str(cls, env_str: str) -> "Environment":
        # Aliases for environment names (maps alternative names to canonical names)
        aliases = {
            "DARWIN-LOCAL": "LOCAL",
            "DARWIN-DEV": "DEV",
            "DARWIN-STAG": "STAG",
            "DARWIN-UAT": "UAT",
            "DARWIN-PROD": "PROD",
        }
        env_upper = env_str.upper()
        # Check for aliases first
        if env_upper in aliases:
            env_upper = aliases[env_upper]
        if env_upper not in cls.__members__:
            raise InvalidEnvironmentError(
                f"Invalid environment '{env_str}'. Expected one of {list(cls.__members__.keys())} "
                f"or aliases {list(aliases.keys())}"
            )
        return cls.__members__[env_upper]


class SparkLoggingLevel(Enum):
    ALL = "ALL"
    TRACE = "TRACE"
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    FATAL = "FATAL"
    OFF = "OFF"

    @classmethod
    def from_str(cls, level_str: str) -> "SparkLoggingLevel":
        """
        Convert a string to a LoggingLevel Enum.
        Raises ValueError if the provided string is invalid.
        """
        if level_str not in cls.__members__:
            raise InvalidSparkLoggingLevelError(
                f"Invalid logging level. Expected one of {list(cls.__members__.keys())}"
            )
        return cls.__members__[level_str]
