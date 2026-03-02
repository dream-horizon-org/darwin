from tortoise import models, fields

from ml_serve_core.dtos.dtos import EnvConfig


class Environment(models.Model):
    """
    Environments table: e.g., dev, staging, prod.
    Environment names must be unique.
    """
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255, unique=True)  # Enforce unique environment names
    env_configs = fields.JSONField(null=False)

    is_protected = fields.BooleanField(default=False)

    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    def _get_env_configs(self) -> EnvConfig:
        return EnvConfig(**self.env_configs)

    def _set_env_configs(self, env_configs: EnvConfig):
        self.env_configs = env_configs.model_dump()

    @property
    def domain_suffix(self):
        return self._get_env_configs().domain_suffix

    @domain_suffix.setter
    def domain_suffix(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.domain_suffix = value
        self._set_env_configs(env_configs)

    @property
    def cluster_name(self):
        return self._get_env_configs().cluster_name

    @cluster_name.setter
    def cluster_name(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.cluster_name = value
        self._set_env_configs(env_configs)

    @property
    def security_group(self):
        return self._get_env_configs().security_group

    @security_group.setter
    def security_group(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.security_group = value
        self._set_env_configs(env_configs)

    @property
    def subnets(self):
        return self._get_env_configs().subnets

    @subnets.setter
    def subnets(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.subnets = value
        self._set_env_configs(env_configs)

    @property
    def ft_redis_url(self):
        return self._get_env_configs().ft_redis_url

    @ft_redis_url.setter
    def ft_redis_url(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.ft_redis_url = value
        self._set_env_configs(env_configs)

    @property
    def workflow_url(self):
        return self._get_env_configs().workflow_url

    @workflow_url.setter
    def workflow_url(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.workflow_url = value
        self._set_env_configs(env_configs)

    @property
    def namespace(self):
        return self._get_env_configs().namespace

    @namespace.setter
    def namespace(self, value: str):
        env_configs = self._get_env_configs()
        env_configs.namespace = value
        self._set_env_configs(env_configs)

    @property
    def enable_istio(self) -> bool:
        """Whether Istio is available for canary deployments in this environment."""
        return self._get_env_configs().enable_istio

    @enable_istio.setter
    def enable_istio(self, value: bool):
        env_configs = self._get_env_configs()
        env_configs.enable_istio = value
        self._set_env_configs(env_configs)

    class Meta:
        table = "environments"

    def __str__(self):
        return f"Environment(id={self.id}, name={self.name})"
