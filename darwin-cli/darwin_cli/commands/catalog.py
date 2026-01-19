"""Darwin CLI - Catalog Commands.

Manages data asset discovery, lineage, rules, and metrics.
"""

import typer
from typing import Optional, List
from loguru import logger
import yaml

from darwin_cli.utils.utils import _run_sync


app = typer.Typer(name="catalog", help="Catalog operations")
asset_app = typer.Typer(name="asset", help="Asset operations")
lineage_app = typer.Typer(name="lineage", help="Lineage operations")
schema_app = typer.Typer(name="schema", help="Schema operations")
rules_app = typer.Typer(name="rules", help="Rule operations")
metrics_app = typer.Typer(name="metrics", help="Metrics operations")
descriptions_app = typer.Typer(name="descriptions", help="Description operations")

app.add_typer(asset_app, name="asset")
app.add_typer(lineage_app, name="lineage")
app.add_typer(schema_app, name="schema")
app.add_typer(rules_app, name="rules")
app.add_typer(metrics_app, name="metrics")
app.add_typer(descriptions_app, name="descriptions")


def get_catalog_client():
    """Get catalog client lazily."""
    from darwin_catalog import CatalogClient
    return CatalogClient()


def read_yaml_file(file_path: str) -> dict:
    """Read YAML file and return dict."""
    with open(file_path, "r") as f:
        return yaml.safe_load(f)


# ==================== Search ====================

@app.command("search")
def catalog_search(
    regex: str = typer.Option(..., "--regex", help="Regex pattern to match asset names"),
    depth: int = typer.Option(-1, "--depth", help="Search depth (-1 for all)"),
    offset: int = typer.Option(0, "--offset", help="Pagination offset"),
    page_size: int = typer.Option(50, "--page-size", help="Page size"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Search assets by regex pattern."""
    try:
        client = get_catalog_client()
        result = _run_sync(
            client.search,
            regex,
            depth=depth,
            offset=offset,
            page_size=page_size,
            retries=retries,
        )
        logger.info("Search completed for pattern: {}", regex)
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error searching assets: {}", e)
        raise typer.Exit(1)


# ==================== Asset Operations ====================

@asset_app.command("list")
def asset_list(
    regex: str = typer.Option(..., "--regex", help="Regex pattern to filter assets"),
    offset: int = typer.Option(0, "--offset", help="Pagination offset"),
    page_size: int = typer.Option(50, "--page-size", help="Page size"),
    fields: Optional[str] = typer.Option(
        None, "--fields", help="Comma-separated list of fields (e.g., name,description,schema,owner)"
    ),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """List assets with regex filter."""
    try:
        client = get_catalog_client()
        fields_list = fields.split(",") if fields else None
        result = _run_sync(
            client.list_assets,
            regex,
            offset=offset,
            page_size=page_size,
            fields=fields_list,
            retries=retries,
        )
        logger.info("Listed assets matching pattern: {}", regex)
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error listing assets: {}", e)
        raise typer.Exit(1)


@asset_app.command("get")
def asset_get(
    fqdn: str = typer.Option(..., "--fqdn", help="Asset FQDN"),
    fields: Optional[str] = typer.Option(
        None, "--fields", help="Comma-separated list of fields"
    ),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get asset by FQDN."""
    try:
        client = get_catalog_client()
        fields_list = fields.split(",") if fields else None
        result = _run_sync(
            client.get_asset,
            fqdn,
            fields=fields_list,
            retries=retries,
        )
        logger.info("Retrieved asset: {}", fqdn)
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error getting asset: {}", e)
        raise typer.Exit(1)


# ==================== Lineage Operations ====================

@lineage_app.command("get")
def lineage_get(
    fqdn: str = typer.Option(..., "--fqdn", help="Asset FQDN"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get lineage for an asset."""
    try:
        client = get_catalog_client()
        result = _run_sync(client.get_lineage, fqdn, retries=retries)
        logger.info("Retrieved lineage for asset: {}", fqdn)
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error getting lineage: {}", e)
        raise typer.Exit(1)


# ==================== Schema Operations ====================

@schema_app.command("list")
def schema_list(
    offset: int = typer.Option(0, "--offset", help="Pagination offset"),
    page_size: int = typer.Option(50, "--page-size", help="Page size"),
    category: Optional[str] = typer.Option(None, "--category", help="Classification category (e.g., PII)"),
    status: Optional[str] = typer.Option(None, "--status", help="Classification status (e.g., CLASSIFIED)"),
    method: Optional[str] = typer.Option(None, "--method", help="Classification method (e.g., ML_ASSISTED)"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get schemas with classification filter."""
    try:
        client = get_catalog_client()
        result = _run_sync(
            client.list_schemas,
            offset=offset,
            page_size=page_size,
            category=category,
            status=status,
            method=method,
            retries=retries,
        )
        logger.info("Listed schemas with filters")
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error listing schemas: {}", e)
        raise typer.Exit(1)


# ==================== Rule Operations ====================

@rules_app.command("list")
def rules_list(
    fqdn: str = typer.Option(..., "--fqdn", help="Asset FQDN"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get rules for an asset."""
    try:
        client = get_catalog_client()
        result = _run_sync(client.list_rules, fqdn, retries=retries)
        logger.info("Listed rules for asset: {}", fqdn)
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error listing rules: {}", e)
        raise typer.Exit(1)


@rules_app.command("create")
def rules_create(
    file: str = typer.Option(..., "--file", help="Path to rule configuration YAML file"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create a rule for an asset."""
    try:
        client = get_catalog_client()
        rule_data = read_yaml_file(file)
        result = _run_sync(client.create_rule, rule_data, retries=retries)
        logger.info("Created rule for asset: {}", rule_data.get("asset_fqdn"))
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error creating rule: {}", e)
        raise typer.Exit(1)


@rules_app.command("update")
def rules_update(
    rule_id: int = typer.Option(..., "--rule-id", help="Rule ID"),
    file: str = typer.Option(..., "--file", help="Path to rule update YAML file"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Update a rule."""
    try:
        client = get_catalog_client()
        rule_data = read_yaml_file(file)
        result = _run_sync(client.update_rule, rule_id, rule_data, retries=retries)
        logger.info("Updated rule ID: {}", rule_id)
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error updating rule: {}", e)
        raise typer.Exit(1)


@rules_app.command("delete")
def rules_delete(
    fqdn: str = typer.Option(..., "--fqdn", help="Asset FQDN"),
    rule_id: int = typer.Option(..., "--rule-id", help="Rule ID"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Delete a rule."""
    try:
        client = get_catalog_client()
        _run_sync(client.delete_rule, fqdn, rule_id, retries=retries)
        logger.info("Deleted rule ID {} for asset: {}", rule_id, fqdn)
        typer.echo(f"Rule {rule_id} deleted successfully")
    except Exception as e:
        logger.error("Error deleting rule: {}", e)
        raise typer.Exit(1)


# ==================== Metrics Operations ====================

@metrics_app.command("push")
def metrics_push(
    file: str = typer.Option(..., "--file", help="Path to bulk metrics YAML file"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Push bulk metrics."""
    try:
        client = get_catalog_client()
        metrics_data = read_yaml_file(file)
        result = _run_sync(client.push_metrics, metrics_data, retries=retries)
        logger.info("Pushed bulk metrics")
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error pushing metrics: {}", e)
        raise typer.Exit(1)


# ==================== Description Operations ====================

@descriptions_app.command("update")
def descriptions_update(
    file: str = typer.Option(..., "--file", help="Path to bulk descriptions YAML file"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Update bulk descriptions."""
    try:
        client = get_catalog_client()
        descriptions_data = read_yaml_file(file)
        result = _run_sync(client.update_descriptions, descriptions_data, retries=retries)
        logger.info("Updated bulk descriptions")
        typer.echo(yaml.dump(result, default_flow_style=False))
    except Exception as e:
        logger.error("Error updating descriptions: {}", e)
        raise typer.Exit(1)

