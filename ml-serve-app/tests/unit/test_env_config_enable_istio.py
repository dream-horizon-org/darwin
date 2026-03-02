"""
Unit tests for EnvConfig enable_istio and Environment enable_istio support.

Tests backward compatibility of EnvConfig deserialization and Environment
create/update/get behavior for enable_istio.
"""
import pytest

from ml_serve_core.dtos.dtos import EnvConfig
from ml_serve_model import Environment


@pytest.mark.unit
class TestEnvConfigEnableIstio:
    """Tests for EnvConfig enable_istio field and backward compatibility."""

    def test_env_config_without_enable_istio_deserializes_with_default_false(self):
        """Existing env_configs without enable_istio should deserialize with default False."""
        legacy_config = {
            "domain_suffix": "example.com",
            "cluster_name": "prod",
            "security_group": "sg-123",
            "ft_redis_url": "redis://localhost",
            "workflow_url": "http://workflow",
            "namespace": "default",
        }
        config = EnvConfig(**legacy_config)
        assert config.enable_istio is False

    def test_env_config_with_enable_istio_true(self):
        """EnvConfig with enable_istio=True should deserialize correctly."""
        config_dict = {
            "domain_suffix": "example.com",
            "cluster_name": "prod",
            "security_group": "sg-123",
            "ft_redis_url": "redis://localhost",
            "workflow_url": "http://workflow",
            "namespace": "default",
            "enable_istio": True,
        }
        config = EnvConfig(**config_dict)
        assert config.enable_istio is True

    def test_env_config_with_enable_istio_false(self):
        """EnvConfig with enable_istio=False should deserialize correctly."""
        config_dict = {
            "domain_suffix": "example.com",
            "cluster_name": "prod",
            "security_group": "sg-123",
            "ft_redis_url": "redis://localhost",
            "workflow_url": "http://workflow",
            "namespace": "default",
            "enable_istio": False,
        }
        config = EnvConfig(**config_dict)
        assert config.enable_istio is False

    def test_env_config_with_enable_istio_none_coerces_to_false(self):
        """EnvConfig with enable_istio=None should coerce to False for backward compatibility."""
        config_dict = {
            "domain_suffix": "example.com",
            "cluster_name": "prod",
            "security_group": "sg-123",
            "ft_redis_url": "redis://localhost",
            "workflow_url": "http://workflow",
            "namespace": "default",
            "enable_istio": None,
        }
        config = EnvConfig(**config_dict)
        assert config.enable_istio is False

    def test_env_config_model_dump_includes_enable_istio(self):
        """EnvConfig.model_dump() should include enable_istio for persistence."""
        config = EnvConfig(
            domain_suffix="example.com",
            cluster_name="prod",
            security_group="sg-123",
            ft_redis_url="redis://localhost",
            workflow_url="http://workflow",
            namespace="default",
            enable_istio=True,
        )
        dumped = config.model_dump()
        assert "enable_istio" in dumped
        assert dumped["enable_istio"] is True


@pytest.mark.unit
class TestEnvironmentEnableIstio:
    """Tests for Environment model enable_istio property."""

    @pytest.mark.asyncio
    async def test_environment_enable_istio_getter_setter(self, db_session):
        """Environment enable_istio property should read and write via env_configs."""
        env = await Environment.create(
            name="istio-test-env",
            env_configs={
                "domain_suffix": "",
                "cluster_name": "kind",
                "namespace": "darwin",
                "security_group": "",
                "ft_redis_url": "",
                "workflow_url": "",
                "enable_istio": False,
            },
            is_protected=False,
        )
        assert env.enable_istio is False

        env.enable_istio = True
        await env.save()

        # Reload from DB to verify persistence
        reloaded = await Environment.get(name="istio-test-env")
        assert reloaded.enable_istio is True

    @pytest.mark.asyncio
    async def test_environment_legacy_env_configs_enable_istio_defaults_false(self, db_session):
        """Environment with legacy env_configs (no enable_istio) should return False."""
        env = await Environment.create(
            name="legacy-env",
            env_configs={
                "domain_suffix": "",
                "cluster_name": "kind",
                "namespace": "darwin",
                "security_group": "",
                "ft_redis_url": "",
                "workflow_url": "",
            },
            is_protected=False,
        )
        assert env.enable_istio is False
