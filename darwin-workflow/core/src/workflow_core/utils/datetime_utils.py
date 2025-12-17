import logging
from datetime import datetime
from typing import Optional, Literal
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)


def get_time_from_date_time(data_time_obj: Optional[datetime], display_timezone: Literal["UTC", "IST"]) -> str:
    """
    Converts a datetime object to a string in the specified display timezone.

    Args:
        data_time_obj: The datetime object to convert.
        display_timezone: The target timezone for display ("UTC" or "IST").

    Returns:
        A string representation of the datetime in the specified timezone.
    """
    if data_time_obj is not None:
        try:
            # Ensure the datetime object is timezone-aware (assume UTC if naive)
            if data_time_obj.tzinfo is None:
                dt_utc = data_time_obj.replace(tzinfo=ZoneInfo("UTC"))
            else:
                dt_utc = data_time_obj.astimezone(ZoneInfo("UTC"))

            # Convert to the target display timezone
            display_tz = ZoneInfo("Asia/Kolkata" if display_timezone == "IST" else "UTC")
            dt_display = dt_utc.astimezone(display_tz)

            # Return in the desired string format
            return dt_display.strftime("%Y-%m-%dT%H:%M:%S")
        except Exception as e:
            logger.warning(f"Could not convert datetime object '{data_time_obj}' to {display_timezone}: {e}",
                           exc_info=True)
            # Fallback: return ISO format, possibly without timezone conversion
            try:
                return data_time_obj.isoformat()
            except:
                return ""  # give up if isoformat fails
    else:
        return ""


def convert_from_utc_to_display_timezone(utc_date_str: Optional[str], display_timezone: Literal["UTC", "IST"]) -> \
        Optional[str]:
    """Converts a UTC datetime string to the specified display timezone string."""
    if not utc_date_str:
        return None
    try:
        utc_tz = ZoneInfo("UTC")
        display_tz = ZoneInfo("Asia/Kolkata" if display_timezone == "IST" else "UTC")

        # Assuming stored format is always '%Y-%m-%dT%H:%M:%S'
        dt_utc = datetime.strptime(utc_date_str, "%Y-%m-%dT%H:%M:%S").replace(tzinfo=utc_tz)
        dt_display = dt_utc.astimezone(display_tz)

        # Return in a user-friendly format, e.g., without 'Z'
        return dt_display.strftime("%Y-%m-%dT%H:%M:%S")
    except (ValueError, TypeError):
        # Handle potential parsing errors or invalid input
        logger.warning(f"Could not convert UTC date string '{utc_date_str}' to {display_timezone}", exc_info=False)
        return utc_date_str  # Return original if conversion fails


