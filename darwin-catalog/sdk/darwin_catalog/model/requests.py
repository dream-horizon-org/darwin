"""Request models for Darwin Catalog SDK."""

from dataclasses import dataclass, field
from dataclasses_json import dataclass_json, config
from typing import Optional, List, Dict, Any

from darwin_catalog.model.enums import Comparator, MetricType, Severity, TableType


@dataclass_json
@dataclass
class SearchRequest:
    """Search request for assets."""
    asset_name_regex: str = field(metadata=config(field_name="asset_name_regex"))
    asset_prefix_regex: Optional[str] = field(
        default=None, metadata=config(field_name="asset_prefix_regex")
    )


@dataclass_json
@dataclass
class ListAssetsRequest:
    """List assets request."""
    regex: str


@dataclass_json
@dataclass
class ParseLineageRequest:
    """Parse lineage from SQL request."""
    source_query: str = field(metadata=config(field_name="source_query"))
    table_type: TableType = field(metadata=config(field_name="table_type"))


@dataclass_json
@dataclass
class CreateRuleRequest:
    """Create rule request."""
    asset_fqdn: str = field(metadata=config(field_name="asset_fqdn"))
    left_expression: str = field(metadata=config(field_name="left_expression"))
    comparator: Comparator
    right_expression: str = field(metadata=config(field_name="right_expression"))
    type: MetricType
    schedule: Optional[str] = None
    severity: Optional[Severity] = None
    slack_channel: Optional[str] = field(
        default=None, metadata=config(field_name="slack_channel")
    )


@dataclass_json
@dataclass
class UpdateRuleRequest:
    """Update rule request."""
    asset_fqdn: str = field(metadata=config(field_name="asset_fqdn"))
    left_expression: Optional[str] = field(
        default=None, metadata=config(field_name="left_expression")
    )
    comparator: Optional[Comparator] = None
    right_expression: Optional[str] = field(
        default=None, metadata=config(field_name="right_expression")
    )
    type: Optional[MetricType] = None
    schedule: Optional[str] = None
    severity: Optional[Severity] = None
    slack_channel: Optional[str] = field(
        default=None, metadata=config(field_name="slack_channel")
    )


@dataclass_json
@dataclass
class MetricItem:
    """Single metric item for bulk metrics push."""
    metric_name: str = field(metadata=config(field_name="metric_name"))
    asset_fqdn: str = field(metadata=config(field_name="asset_fqdn"))
    value: float
    timestamp: int


@dataclass_json
@dataclass
class BulkMetricsRequest:
    """Bulk metrics push request."""
    metrics: List[MetricItem]


@dataclass_json
@dataclass
class AssetDescription:
    """Asset description for bulk update."""
    asset_fqdn: str = field(metadata=config(field_name="asset_fqdn"))
    description: str


@dataclass_json
@dataclass
class FieldDescription:
    """Field description for bulk update."""
    asset_fqdn: str = field(metadata=config(field_name="asset_fqdn"))
    field_name: str = field(metadata=config(field_name="field_name"))
    description: str


@dataclass_json
@dataclass
class BulkDescriptionsRequest:
    """Bulk descriptions update request."""
    asset_descriptions: Optional[List[AssetDescription]] = field(
        default=None, metadata=config(field_name="asset_descriptions")
    )
    field_descriptions: Optional[List[FieldDescription]] = field(
        default=None, metadata=config(field_name="field_descriptions")
    )


@dataclass_json
@dataclass
class OpenLineageRun:
    """OpenLineage run information."""
    runId: str = field(metadata=config(field_name="runId"))


@dataclass_json
@dataclass
class OpenLineageJob:
    """OpenLineage job information."""
    namespace: str
    name: str


@dataclass_json
@dataclass
class OpenLineageDataset:
    """OpenLineage dataset information."""
    namespace: str
    name: str


@dataclass_json
@dataclass
class OpenLineageEvent:
    """OpenLineage event for lineage submission."""
    eventType: str = field(metadata=config(field_name="eventType"))
    eventTime: str = field(metadata=config(field_name="eventTime"))
    run: OpenLineageRun
    job: OpenLineageJob
    inputs: List[OpenLineageDataset] = field(default_factory=list)
    outputs: List[OpenLineageDataset] = field(default_factory=list)

