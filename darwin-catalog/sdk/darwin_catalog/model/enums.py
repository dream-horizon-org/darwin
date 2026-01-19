"""Enums for Darwin Catalog SDK."""

from enum import Enum


class Comparator(str, Enum):
    """Rule comparator types."""
    LESS_THAN = "LESS_THAN"
    LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO"
    GREATER_THAN = "GREATER_THAN"
    GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_QUAL_TO"
    EQUAL_TO = "EQUAL_TO"
    NOT_EQUAL_TO = "NOT_EQUAL_TO"


class MetricType(str, Enum):
    """Rule metric types."""
    FRESHNESS = "FRESHNESS"
    COMPLETENESS = "COMPLETENESS"
    CORRECTNESS = "CORRECTNESS"


class Severity(str, Enum):
    """Rule severity types."""
    INCIDENT = "INCIDENT"
    OPS_GENIE = "OPS_GENIE"
    SLACK_ALERT = "SLACK_ALERT"


class TableType(str, Enum):
    """Table types for lineage parsing."""
    REDSHIFT = "REDSHIFT"
    LAKEHOUSE = "LAKEHOUSE"


class ClassificationCategory(str, Enum):
    """Schema classification categories."""
    PII = "PII"


class ClassificationStatus(str, Enum):
    """Schema classification statuses."""
    NOT_REQUIRED = "NOT_REQUIRED"
    REQUIRED = "REQUIRED"
    CLASSIFICATION_APPROVAL_PENDING = "CLASSIFICATION_APPROVAL_PENDING"
    CLASSIFICATION_REJECTED = "CLASSIFICATION_REJECTED"
    CLASSIFIED = "CLASSIFIED"


class ClassificationMethod(str, Enum):
    """Schema classification methods."""
    MANUAL = "MANUAL"
    AUTOMATED = "AUTOMATED"
    ML_ASSISTED = "ML_ASSISTED"

