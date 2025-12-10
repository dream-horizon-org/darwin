from typing import Optional, Callable

from darwin.exceptions import UnsupportedSparkConfigError
from darwin.util.utils import get_default_jars_path

# Define a type alias for the merge strategy function, similar to Enums
MergeStrategy = Callable[[Optional[str], Optional[str]], str]


class SparkConfigMergeStrategies:
    """
    This class defines various merge strategies for Spark configuration options.
    Each strategy is a callable that takes two parameters: the default value and the user-provided
    value, and returns the merged value as a string.
    """

    """
    COMMA: MergeStrategy based on comma.
    """
    COMMA: MergeStrategy = lambda default, user: (user or "" if not default else f"{default},{user}")

    """
    COLON: MergeStrategy for merging class paths.
    """
    COLON: MergeStrategy = lambda default, user: (user or "" if not default else f"{default}:{user}")

    """
    Space: MergeStrategy for merging Java options.
    """
    SPACE: MergeStrategy = lambda default, user: (user or "" if not default else f"{default} {user}")

    """
    Jars: For merging jars raise exception, if it contains user value, else return default.
    """
    UNSUPPORTED: MergeStrategy = lambda default, user: (
        (_ for _ in ()).throw(
            UnsupportedSparkConfigError(
                "Setting 'spark.jars' and 'spark.jars.packages' manually is not supported — it must be derived automatically. Use libraries to install jars."
            )
        )
        if user
        else default
    )

    """
    OVERWRITE: MergeStrategy that overwrites the default value with the user-provided value.
    If the user value is empty, it defaults to an empty string.
    """
    OVERWRITE: MergeStrategy = lambda default, user: user or ""
