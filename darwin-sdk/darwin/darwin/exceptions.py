class InvalidVersionError(Exception):
    """Raises when the configuration file is missing."""


class NoSuchModuleFoundError(Exception):
    """Raises when a module is not found."""


class UnsupportedPysparkVersionError(Exception):
    """Raises when a pyspark version is not supported."""


class UnableToCreateSessionError(Exception):
    """Raises when a session is not created."""


class NoActiveSessionError(Exception):
    """Raises when there is no active session."""


class ConfigNotFoundError(Exception):
    """Raises when the configuration file is not found."""


class ConfigAlreadyExistsError(Exception):
    """Raises when the configuration file already exists."""


class InvalidEnvironmentError(Exception):
    """Raises when an invalid environment is passed."""


class ApplicationConfigFileNotFoundError(Exception):
    """Raises when the application configuration file is not found."""


class PackageNotFoundError(Exception):
    """Raises when a package is not found."""


class NoActiveSparkSessionError(Exception):
    """Raises when there is no active spark session."""


class FailedToBuildSparkDependenciesError(Exception):
    """Raises when there is an error building spark dependencies."""


class InvalidSparkLoggingLevelError(Exception):
    """Raises when an invalid spark logging level is passed."""


class FailedToRetrieveCredentialsError(Exception):
    """Raises when there is an error retrieving credentials for hive metastore"""


class InvalidClusterAttachedError(Exception):
    """Raises when the cluster attached is invalid"""


class InvalidDarwinInitModeError(Exception):
    """Raises when the mode passed is invalid"""


class UnsupportedSparkVersionError(Exception):
    """Raises when the spark version is not supported."""


class UnableToFetchComputeMetadataError(Exception):
    """Raises when there is an error fetching compute metadata."""


class UnsupportedSparkConfigError(Exception):
    """Raises when the spark configuration is not supported."""


class FailedToSetupSparkSDK(Exception):
    """Raises when there is an error setting up the Spark SDK."""
