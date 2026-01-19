"""Catalog service for API calls."""

import requests
from typing import Dict, Any, Optional, List

from darwin_catalog.constant.config import Config


class CatalogException(Exception):
    """Custom exception for Catalog API errors."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def parse_api_exception(response: requests.Response) -> None:
    """Parse API exception from response."""
    try:
        error_data = response.json()
        message = error_data.get("message", response.text)
    except Exception:
        message = response.text
    raise CatalogException(
        f"[API_ERROR {response.status_code}] {message}",
        status_code=response.status_code
    )


class CatalogService:
    """Service class for Catalog API operations."""

    def __init__(self, config: Optional[Config] = None):
        self._config = config or Config()
        self._base_url = self._config.catalog_base_url

    @property
    def _headers(self) -> Dict[str, str]:
        """Get default headers."""
        headers = {"Content-Type": "application/json"}
        token = self._config.client_token
        if token:
            headers["client-token"] = token
        return headers

    # ==================== Search ====================

    def search_assets(
        self,
        asset_name_regex: str,
        asset_prefix_regex: Optional[str] = None,
        depth: int = -1,
        offset: int = 0,
        page_size: int = 50,
    ) -> Dict[str, Any]:
        """Search assets by regex.

        POST /v1/search
        """
        url = f"{self._base_url}/v1/search"
        params = {"depth": depth, "offset": offset, "page_size": page_size}
        payload = {"asset_name_regex": asset_name_regex}
        if asset_prefix_regex:
            payload["asset_prefix_regex"] = asset_prefix_regex

        response = requests.post(url, params=params, json=payload, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    # ==================== Asset Operations ====================

    def list_assets(
        self,
        regex: str,
        offset: int = 0,
        page_size: int = 50,
        fields: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """List assets with regex filter.

        POST /v1/assets
        """
        url = f"{self._base_url}/v1/assets"
        params: Dict[str, Any] = {"offset": offset, "page_size": page_size}
        if fields:
            params["fields"] = ",".join(fields)

        payload = {"regex": regex}

        response = requests.post(url, params=params, json=payload, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    def get_asset(
        self,
        fqdn: str,
        fields: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Get asset by FQDN.

        GET /v1/assets/{asset_fqdn}
        """
        url = f"{self._base_url}/v1/assets/{fqdn}"
        params: Dict[str, Any] = {}
        if fields:
            params["fields"] = ",".join(fields)

        response = requests.get(url, params=params, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    # ==================== Lineage Operations ====================

    def get_lineage(self, fqdn: str) -> Dict[str, Any]:
        """Get lineage for an asset.

        GET /v1/assets/{asset_fqdn}/lineage
        """
        url = f"{self._base_url}/v1/assets/{fqdn}/lineage"

        response = requests.get(url, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()


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

        GET /v1/schemas/classification
        """
        url = f"{self._base_url}/v1/schemas/classification"
        params: Dict[str, Any] = {"offset": offset, "page_size": page_size}
        if category:
            params["category"] = category
        if status:
            params["status"] = status
        if method:
            params["method"] = method

        response = requests.get(url, params=params, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    # ==================== Rule Operations ====================

    def list_rules(self, fqdn: str) -> List[Dict[str, Any]]:
        """Get rules for an asset.

        GET /v1/assets/{asset_fqdn}/rules
        """
        url = f"{self._base_url}/v1/assets/{fqdn}/rules"

        response = requests.get(url, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    def create_rule(self, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a rule for an asset.

        POST /v1/assets/rules
        """
        url = f"{self._base_url}/v1/assets/rules"

        response = requests.post(url, json=rule_data, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    def update_rule(self, rule_id: int, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a rule.

        PATCH /v1/assets/rules/{rule_id}
        """
        url = f"{self._base_url}/v1/assets/rules/{rule_id}"

        response = requests.patch(url, json=rule_data, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    def delete_rule(self, fqdn: str, rule_id: int) -> None:
        """Delete a rule.

        DELETE /v1/assets/{asset_fqdn}/rules/{rule_id}
        """
        url = f"{self._base_url}/v1/assets/{fqdn}/rules/{rule_id}"

        response = requests.delete(url, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)

    # ==================== Metrics Operations ====================

    def push_metrics(self, metrics_data: Dict[str, Any]) -> Dict[str, Any]:
        """Push bulk metrics.

        POST /v1/metric/bulk
        """
        url = f"{self._base_url}/v1/metric/bulk"

        response = requests.post(url, json=metrics_data, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

    # ==================== Description Operations ====================

    def update_descriptions(self, descriptions_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update bulk descriptions.

        PUT /v1/descriptions/bulk
        """
        url = f"{self._base_url}/v1/descriptions/bulk"

        response = requests.put(url, json=descriptions_data, headers=self._headers)
        if response.status_code != 200:
            parse_api_exception(response)
        return response.json()

