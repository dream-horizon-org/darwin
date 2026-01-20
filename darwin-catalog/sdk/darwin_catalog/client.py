"""Darwin Catalog Client - Main entry point for the SDK."""

from typing import Dict, Any, Optional, List

from darwin_catalog.constant.config import Config
from darwin_catalog.service.catalog_service import CatalogService


class CatalogClient:
    """Main client class for Darwin Catalog SDK."""

    def __init__(self, config: Optional[Config] = None):
        """Initialize the Catalog client.

        Args:
            config: Optional configuration. If not provided, uses default config.
        """
        self._config = config or Config()
        self._service = CatalogService(self._config)

    # ==================== Search ====================

    def search(
        self,
        regex: str,
        depth: int = -1,
        offset: int = 0,
        page_size: int = 50,
    ) -> Dict[str, Any]:
        """Search assets by regex pattern.

        Args:
            regex: Regex pattern to match asset names
            depth: Search depth (-1 for all)
            offset: Pagination offset
            page_size: Page size

        Returns:
            Paginated search results
        """
        return self._service.search_assets(
            asset_name_regex=regex,
            depth=depth,
            offset=offset,
            page_size=page_size,
        )

    # ==================== Asset Operations ====================

    def list_assets(
        self,
        regex: str,
        offset: int = 0,
        page_size: int = 50,
        fields: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """List assets with regex filter.

        Args:
            regex: Regex pattern to filter assets
            offset: Pagination offset
            page_size: Page size
            fields: Optional list of fields to include

        Returns:
            Paginated list of assets
        """
        return self._service.list_assets(
            regex=regex,
            offset=offset,
            page_size=page_size,
            fields=fields,
        )

    def get_asset(
        self,
        fqdn: str,
        fields: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Get asset by FQDN.

        Args:
            fqdn: Fully qualified domain name of the asset
            fields: Optional list of fields to include

        Returns:
            Asset details
        """
        return self._service.get_asset(fqdn=fqdn, fields=fields)

    # ==================== Lineage Operations ====================

    def get_lineage(self, fqdn: str) -> Dict[str, Any]:
        """Get lineage for an asset.

        Args:
            fqdn: Asset FQDN

        Returns:
            Lineage graph and asset info
        """
        return self._service.get_lineage(fqdn)

    # ==================== Schema Operations ====================

    def list_schemas(
        self,
        offset: int = 0,
        page_size: int = 50,
        category: Optional[str] = None,
        status: Optional[str] = None,
        method: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get schemas with classification filter.

        Args:
            offset: Pagination offset
            page_size: Page size
            category: Classification category (e.g., PII)
            status: Classification status
            method: Classification method

        Returns:
            Paginated list of schemas
        """
        return self._service.list_schemas(
            offset=offset,
            page_size=page_size,
            category=category,
            status=status,
            method=method,
        )

    # ==================== Rule Operations ====================

    def list_rules(self, fqdn: str) -> List[Dict[str, Any]]:
        """Get rules for an asset.

        Args:
            fqdn: Asset FQDN

        Returns:
            List of rules
        """
        return self._service.list_rules(fqdn)

    def create_rule(self, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a rule for an asset.

        Args:
            rule_data: Rule configuration

        Returns:
            Created rule
        """
        return self._service.create_rule(rule_data)

    def update_rule(self, rule_id: int, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a rule.

        Args:
            rule_id: Rule ID
            rule_data: Updated rule configuration

        Returns:
            Updated rule
        """
        return self._service.update_rule(rule_id, rule_data)

    def delete_rule(self, fqdn: str, rule_id: int) -> None:
        """Delete a rule.

        Args:
            fqdn: Asset FQDN
            rule_id: Rule ID
        """
        self._service.delete_rule(fqdn, rule_id)

    # ==================== Metrics Operations ====================

    def push_metrics(self, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Push bulk metrics.

        Args:
            metrics_data: Metrics data with list of metrics

        Returns:
            Result with failed assets if any
        """
        return self._service.push_metrics(metrics_data)

    # ==================== Description Operations ====================

    def update_descriptions(self, descriptions_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update bulk descriptions.

        Args:
            descriptions_data: Descriptions data

        Returns:
            Update result
        """
        return self._service.update_descriptions(descriptions_data)

