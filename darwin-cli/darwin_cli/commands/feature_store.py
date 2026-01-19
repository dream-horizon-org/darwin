"""Feature Store CLI commands for darwin-cli.
"""

from typing import Optional

import typer
import yaml
from loguru import logger

from darwin_cli.utils.utils import _run_sync, to_dict, load_yaml_file
import darwin_fs.client as fs_client
from darwin_fs.model.create_entity_request import CreateEntityRequest
from darwin_fs.model.entity import Entity
from darwin_fs.model.feature_column import FeatureColumn
from darwin_fs.model.create_feature_group_request import CreateFeatureGroupRequest
from darwin_fs.model.feature_group import FeatureGroup
from darwin_fs.model.read_features_request import ReadFeaturesRequest
from darwin_fs.model.primary_keys import PrimaryKeys
from darwin_fs.model.write_features_request import WriteFeaturesRequest
from darwin_fs.model.write_features import WriteFeatures
from darwin_fs.constant.constants import DataType, FeatureGroupType, State


app = typer.Typer(
    name="feature-store",
    help="Feature Store operations - entities, feature groups, and features",
    no_args_is_help=True,
)

entity_app = typer.Typer(help="Entity operations")
fg_app = typer.Typer(help="Feature group operations")
features_app = typer.Typer(help="Feature read/write operations")

app.add_typer(entity_app, name="entity")
app.add_typer(fg_app, name="feature-group")
app.add_typer(features_app, name="features")


def _build_entity_from_config(config: dict) -> tuple[Entity, CreateEntityRequest]:
    """Build Entity and CreateEntityRequest from config dict."""
    entity_config = config.get("entity", {})
    features = [
        FeatureColumn(
            name=f["name"],
            type=DataType(f["type"]),
            description=f.get("description", ""),
            tags=f.get("tags", [])
        )
        for f in entity_config.get("features", [])
    ]
    
    entity = Entity(
        table_name=entity_config["table_name"],
        primary_keys=entity_config["primary_keys"],
        features=features,
        ttl=entity_config.get("ttl", 0)
    )
    
    request = CreateEntityRequest(
        entity=entity,
        owner=config.get("owner", ""),
        tags=config.get("tags", []),
        description=config.get("description", "")
    )
    return entity, request


def _build_feature_group_from_config(config: dict) -> tuple[FeatureGroup, CreateFeatureGroupRequest]:
    """Build FeatureGroup and CreateFeatureGroupRequest from config dict."""
    fg_config = config.get("feature_group", {})
    features = [
        FeatureColumn(
            name=f["name"],
            type=DataType(f["type"]),
            description=f.get("description", ""),
            tags=f.get("tags", [])
        )
        for f in fg_config.get("features", [])
    ]
    
    fg_type_str = fg_config.get("feature_group_type", "ONLINE")
    fg_type = FeatureGroupType.ONLINE if fg_type_str == "ONLINE" else FeatureGroupType.OFFLINE
    
    feature_group = FeatureGroup(
        feature_group_name=fg_config["feature_group_name"],
        entity_name=fg_config["entity_name"],
        features=features,
        feature_group_type=fg_type,
        version_enabled=fg_config.get("version_enabled", True)
    )
    
    request = CreateFeatureGroupRequest(
        feature_group=feature_group,
        owner=config.get("owner", ""),
        tags=config.get("tags", []),
        description=config.get("description", "")
    )
    return feature_group, request


# Entity Operations

@entity_app.command("create")
def entity_create(
    file: str = typer.Option(..., "--file", help="YAML config file for entity"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create an entity from YAML configuration."""
    config = load_yaml_file(file)
    try:
        _, request = _build_entity_from_config(config)
        _run_sync(fs_client.create_entity, request, retries=retries)
        logger.info("Entity created successfully")
    except Exception as e:
        logger.error("Error creating entity: {}", e)
        raise typer.Exit(1)


@entity_app.command("get")
def entity_get(
    name: str = typer.Option(..., "--name", help="Entity name"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get entity by name."""
    try:
        result = _run_sync(fs_client.get_entity, name, retries=retries)
        logger.info("Retrieved entity: {}", name)
        typer.echo(yaml.dump(to_dict(result), default_flow_style=False))
    except Exception as e:
        logger.error("Error getting entity: {}", e)
        raise typer.Exit(1)


# Feature Group Operations

@fg_app.command("create")
def fg_create(
    file: str = typer.Option(..., "--file", "-f", help="YAML config file for feature group"),
    upgrade: bool = typer.Option(False, "--upgrade", help="Upgrade version if exists"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Create a feature group from YAML configuration."""
    config = load_yaml_file(file)
    try:
        _, request = _build_feature_group_from_config(config)
        result = _run_sync(fs_client.create_feature_group, request, upgrade, retries=retries)
        logger.info("Feature group created successfully")
        typer.echo(result)
    except Exception as e:
        logger.error("Error creating feature group: {}", e)
        raise typer.Exit(1)


@fg_app.command("get")
def fg_get(
    name: str = typer.Option(..., "--name", help="Feature group name"),
    version: Optional[str] = typer.Option(None, "--version", help="Feature group version"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get feature group by name and optional version."""
    try:
        result = _run_sync(fs_client.get_feature_group, name, version, retries=retries)
        logger.info("Retrieved feature group: {}", name)
        typer.echo(yaml.dump(to_dict(result), default_flow_style=False))
    except Exception as e:
        logger.error("Error getting feature group: {}", e)
        raise typer.Exit(1)


@fg_app.command("schema")
def fg_schema(
    name: str = typer.Option(..., "--name", help="Feature group name"),
    version: Optional[str] = typer.Option(None, "--version", help="Feature group version"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get feature group schema."""
    try:
        result = _run_sync(fs_client.get_feature_group_schema, name, version, retries=retries)
        logger.info("Retrieved schema for feature group: {}", name)
        typer.echo(yaml.dump(to_dict(result), default_flow_style=False))
    except Exception as e:
        logger.error("Error getting feature group schema: {}", e)
        raise typer.Exit(1)


@fg_app.command("version")
def fg_version(
    name: str = typer.Option(..., "--name", help="Feature group name"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Get latest version of a feature group."""
    try:
        result = _run_sync(fs_client.get_latest_feature_group_version, name, retries=retries)
        logger.info("Retrieved latest version for feature group: {}", name)
        typer.echo(result)
    except Exception as e:
        logger.error("Error getting feature group version: {}", e)
        raise typer.Exit(1)


@fg_app.command("update-state")
def fg_update_state(
    name: str = typer.Option(..., "--name", help="Feature group name"),
    version: str = typer.Option(..., "--version", help="Feature group version (required)"),
    state: str = typer.Option(..., "--state", help="New state (LIVE|ARCHIVED)"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Update feature group state."""
    try:
        state_enum = State(state)
        _run_sync(fs_client.update_feature_group_state, state_enum, name, version, retries=retries)
        logger.info("Updated state for feature group '{}' version '{}' to '{}'", name, version, state)
    except Exception as e:
        logger.error("Error updating feature group state: {}", e)
        raise typer.Exit(1)


# Feature Read/Write Operations

@features_app.command("read")
def features_read(
    file: str = typer.Option(..., "--file", help="YAML file with read request"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Read features from a feature group."""
    config = load_yaml_file(file)
    try:
        pk_config = config.get("primary_keys", {})
        primary_keys = PrimaryKeys(
            names=pk_config.get("names", []),
            values=pk_config.get("values", [])
        )
        
        request = ReadFeaturesRequest(
            feature_group_name=config["feature_group_name"],
            feature_columns=config.get("feature_columns", []),
            primary_keys=primary_keys,
            feature_group_version=config.get("feature_group_version")
        )
        
        result = _run_sync(fs_client.read_features, request, retries=retries)
        logger.info("Read features from feature group: {}", config["feature_group_name"])
        typer.echo(yaml.dump(to_dict(result), default_flow_style=False))
    except Exception as e:
        logger.error("Error reading features: {}", e)
        raise typer.Exit(1)


@features_app.command("write")
def features_write(
    file: str = typer.Option(..., "--file", help="YAML file with write request"),
    retries: int = typer.Option(1, "--retries", help="Number of retries"),
):
    """Write features to a feature group."""
    config = load_yaml_file(file)
    try:
        features_config = config.get("features", {})
        features = WriteFeatures(
            names=features_config.get("names", []),
            values=features_config.get("values", [])
        )
        
        request = WriteFeaturesRequest(
            feature_group_name=config["feature_group_name"],
            features=features,
            feature_group_version=config.get("feature_group_version")
        )
        
        result = _run_sync(fs_client.write_features_sync, request, retries=retries)
        logger.info("Wrote features to feature group: {}", config["feature_group_name"])
        typer.echo(yaml.dump(to_dict(result), default_flow_style=False))
    except Exception as e:
        logger.error("Error writing features: {}", e)
        raise typer.Exit(1)
