import os
import re
from datetime import datetime, date
from typing import Any, Literal, List
from zoneinfo import ZoneInfo

from croniter import croniter

from workflow_core.constants.constants import GIT, WORKSPACE, FSX_BASE_PATH, FSX_BASE_PATH_DYNAMIC_TRUE, JOB_CLUSTER, \
    BASIC_CLUSTER
from workflow_model.constants.constants import DEFAULT_SCHEDULE, DEFAULT_INTEGER_VALUE, DEFAULT_TIMEZONE


def validate_timezone(value: str) -> str:
    """
    Validate that the timezone is either 'UTC' or 'IST'.

    Args:
        value: The timezone value to validate

    Returns:
        str: The validated timezone

    Raises:
        ValueError: If the timezone is invalid
    """
    if value not in ["UTC", "IST"]:
        raise ValueError("Timezone must be either 'UTC' or 'IST'")
    return value


def validate_optional_integer(value: Any) -> int:
    """
    Validate and convert an optional integer to a non-negative integer.

    Args:
        value: The value to validate

    Returns:
        int: The validated non-negative integer

    Raises:
        ValueError: If the value cannot be converted to a non-negative integer
    """
    if value is None:
        return DEFAULT_INTEGER_VALUE
    try:
        val = int(value)
        if val < 0:
            raise ValueError("Value must be a non-negative integer")
        return val
    except (ValueError, TypeError):
        raise ValueError("Value must be a non-negative integer")


def validate_and_convert_start_or_end_date(value: str, timezone: str = DEFAULT_TIMEZONE) -> str:
    """
    Validate and convert a start date based on timezone.

    Args:
        value: The date string to validate
        timezone: The timezone to use for validation (default is "IST")

    Returns:
        str: The validated and converted date

    Raises:
        ValueError: If the date is invalid
    """
    try:
        if not value:
            return value

        return parse_and_convert_date_to_utc(value, timezone)
    except ValueError as e:
        raise ValueError(str(e))


def parse_and_convert_date_to_utc(date_str: str, timezone: Literal["UTC", "IST"] = DEFAULT_TIMEZONE) -> str:
    """
    Parse a date string and convert it to UTC.

    Args:
        date_str: The date string to parse
        timezone: The source timezone (defaults to IST)
        is_end_date: Whether this is an end date (affects default time)

    Returns:
        str: UTC date string in format '%Y-%m-%dT%H:%M:%S'
    """
    if not date_str:
        return date_str

    try:
        tz = ZoneInfo("UTC" if timezone == "UTC" else "Asia/Kolkata")
        try:
            # Try parsing with time first
            dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            try:
                # Try parsing date only
                dt = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                raise ValueError(f"Date is not in valid format. Expected 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS'.")

        dt = dt.replace(tzinfo=tz)
        return dt.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%S")
    except Exception as e:
        raise ValueError(str(e))


def is_valid_timetable(timetable: str) -> bool:
    """
    Validate if the timetable is a valid cron expression.
    """
    try:
        # This will raise an exception if the timetable is not a valid cron expression.
        if timetable == "@once" or timetable == "None":
            return True
        croniter(timetable)
        return True
    except ValueError:
        return False


def check_if_end_date_has_passed(end_date: str) -> bool:
    """
    Check if the given end date has passed the current date.
    
    Args:
        end_date: The end date to check in format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS
        
    Returns:
        bool: True if end date has passed, False otherwise
    """
    if not end_date or end_date == "":
        return False

    if isinstance(end_date, datetime):
        end_date_obj = end_date.date()
    elif isinstance(end_date, date):
        end_date_obj = end_date  # already a date
    else:
        try:
            # Parse end date
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S").date()
        except ValueError:
            try:
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("End date is not in valid format. Expected 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'.")

    # Get current date in IST timezone
    current_date = datetime.now(ZoneInfo("Asia/Kolkata")).date()
    return end_date_obj < current_date


def check_if_start_date_is_yet_to_come(start_date: str) -> bool:
    """
    Check if the given start date is yet to come.

    Args:
        start_date: The start date to check in format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS

    Returns:
        bool: True if end date has passed, False otherwise
    """
    if not start_date or start_date == "":
        return False
    if isinstance(start_date, datetime):
        start_date_obj = start_date.date()
    elif isinstance(start_date, date):
        start_date_obj = start_date  # already a date
    else:
        try:
               # Parse end date
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S").date()
        except ValueError:
            try:
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("start date is not in valid format. Expected 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM:SS'.")

    # Get current date in IST timezone
    current_date = datetime.now(ZoneInfo("Asia/Kolkata")).date()
    return start_date_obj > current_date


def validate_name(value: str, entity_type: str = "name") -> str:
    """Common validation for workflow and task names.

    Args:
        value: The name to validate
        entity_type: Type of entity (workflow/task) for error message

    Returns:
        The validated name if valid

    Raises:
        ValueError: If name is invalid
    """
    if not re.match(r'^[\w.-]+$', value):
        raise ValueError(f"Invalid {entity_type}. Only alphanumeric characters, dashes, dots and underscores are allowed.")
    return value


def validate_source_and_entry_point(source_type: str, source: str, file_path: str) -> None:
    """Validate source and entry point paths.

    Args:
        source_type: Type of source (workspace/git)
        source: Source path or URL
        file_path: Entry point file path

    Raises:
        ValueError: If validation fails
    """
    if source_type == GIT:
        if not source.startswith('https://github.com/'):
            raise ValueError(f"Invalid source for Git: {source}. Must be a GitHub URL.")

    elif source_type == WORKSPACE:
        full_source_path = FSX_BASE_PATH + source
        if not os.path.isdir(full_source_path):
            raise ValueError(f"Invalid source code path: {FSX_BASE_PATH_DYNAMIC_TRUE + source}")

        full_file_path = os.path.join(full_source_path, file_path)
        if not os.path.isfile(full_file_path):
            raise ValueError(f"Invalid entry point: {FSX_BASE_PATH_DYNAMIC_TRUE + source + '/' + file_path}")

    # Validate file extension for both source types
    _, file_extension = os.path.splitext(file_path)
    if file_extension not in ['.py', '.ipynb']:
        raise ValueError(f"Invalid entry point file type: {file_path}. Must be .py or .ipynb")


def validate_task_dependencies(tasks: List[Any]) -> None:
    """Validate task dependencies and check for duplicates.

    Args:
        tasks: List of workflow tasks

    Raises:
        ValueError: If validation fails
    """
    all_task_names = [task.task_name for task in tasks]
    seen_task_names = set()

    for task in tasks:
        if task.task_name in seen_task_names:
            raise ValueError(f"Task '{task.task_name}' is already added to the DAG.")
        seen_task_names.add(task.task_name)

        if not all(dep in all_task_names for dep in task.depends_on):
            raise ValueError(f"Invalid dependencies for task '{task.task_name}'")


def validate_ha_config(cluster_type: str, ha_config: Any) -> None:
    """Validate HA configuration.

    Args:
        cluster_type: Type of cluster
        ha_config: HA configuration object

    Raises:
        ValueError: If validation fails
    """
    if ha_config and ha_config.enable_ha:
        if cluster_type != 'job':
            raise ValueError("HA configuration can only be enabled for job clusters")


def validate_cluster_type(value: str) -> str:
    """Validate cluster type.

    Args:
        value: The cluster type to validate

    Returns:
        The validated cluster type if valid

    Raises:
        ValueError: If cluster type is invalid
    """
    if value not in [JOB_CLUSTER, BASIC_CLUSTER]:
        raise ValueError(f"{value} is not a valid cluster type.")
    return value


def validate_source_type(value: str) -> str:
    """Validate source type.

    Args:
        value: The source type to validate

    Returns:
        The validated source type if valid

    Raises:
        ValueError: If source type is invalid
    """
    if value not in [WORKSPACE, GIT]:
        raise ValueError(f"Invalid source type '{value}'. Must be either 'workspace' or 'git'.")
    return value


def validate_dependent_libraries(value: Any) -> Any:
    """Validate dependent libraries.

    Args:
        value: The dependent libraries value to validate

    Returns:
        The validated value if valid

    Raises:
        ValueError: If validation fails
    """
    if isinstance(value, str):
        return value
    if not isinstance(value, list):
        raise ValueError("dependent_libraries must be either a string or a list of strings")
    if not all(isinstance(lib, str) for lib in value):
        raise ValueError("All dependent libraries must be strings")
    return value
