"""
Test data factories for creating model instances.

These factories provide convenient methods for creating test data
with sensible defaults while allowing customization.
"""
from typing import Optional, Dict, Any
from ml_serve_model import Serve, Environment, Artifact, User, Deployment
from ml_serve_model.enums import ServeType, DeploymentStatus, BackendType
from ml_serve_model.serve_configs import APIServeInfraConfig, WorkflowServeInfraConfig
from ml_serve_model.app_layer_deployments import AppLayerDeployment


class UserFactory:
    """Factory for creating User instances."""
    
    @staticmethod
    async def create(
        username: str = "test@example.com",
        token: str = "test-token-123",
        **kwargs
    ) -> User:
        """Create a test user."""
        return await User.create(
            username=username,
            token=token,
            **kwargs
        )


class EnvironmentFactory:
    """Factory for creating Environment instances."""
    
    @staticmethod
    async def create(
        name: str = "test-env",
        cluster_name: str = "kind",
        namespace: str = "serve-test",
        env_configs: Optional[Dict[str, Any]] = None,
        is_protected: bool = False,
        **kwargs
    ) -> Environment:
        """Create a test environment."""
        if env_configs is None:
            env_configs = {
                "domain_suffix": "",
                "cluster_name": cluster_name,
                "namespace": namespace,
                "security_group": "",
                "ft_redis_url": "",
                "workflow_url": ""
            }
        
        return await Environment.create(
            name=name,
            cluster_name=cluster_name,
            namespace=namespace,
            env_configs=env_configs,
            is_protected=is_protected,
            **kwargs
        )


class ServeFactory:
    """Factory for creating Serve instances."""
    
    @staticmethod
    async def create(
        name: str = "test-serve",
        serve_type: str = ServeType.API.value,
        description: str = "Test serve",
        space: str = "serve-test",
        created_by: Optional[User] = None,
        **kwargs
    ) -> Serve:
        """Create a test serve."""
        if created_by is None:
            created_by = await UserFactory.create()
        
        return await Serve.create(
            name=name,
            type=serve_type,
            description=description,
            space=space,
            created_by=created_by,
            **kwargs
        )


class ArtifactFactory:
    """Factory for creating Artifact instances."""
    
    @staticmethod
    async def create(
        serve: Optional[Serve] = None,
        version: str = "v1.0.0",
        github_repo_url: str = "https://github.com/test/repo",
        branch: str = "main",
        image_url: str = "localhost:5000/test-serve:v1.0.0",
        created_by: Optional[User] = None,
        **kwargs
    ) -> Artifact:
        """Create a test artifact."""
        if serve is None:
            serve = await ServeFactory.create()
        if created_by is None:
            created_by = await UserFactory.create()
        
        return await Artifact.create(
            serve=serve,
            version=version,
            github_repo_url=github_repo_url,
            branch=branch,
            image_url=image_url,
            created_by=created_by,
            **kwargs
        )


class APIServeInfraConfigFactory:
    """Factory for creating APIServeInfraConfig instances."""
    
    @staticmethod
    async def create(
        serve: Optional[Serve] = None,
        environment: Optional[Environment] = None,
        backend_type: str = BackendType.FastAPI.value,
        fast_api_config: Optional[Dict[str, Any]] = None,
        additional_hosts: Optional[str] = None,
        created_by: Optional[User] = None,
        updated_by: Optional[User] = None,
        **kwargs
    ) -> APIServeInfraConfig:
        """Create a test API serve infra config."""
        if serve is None:
            serve = await ServeFactory.create()
        if environment is None:
            environment = await EnvironmentFactory.create()
        if created_by is None:
            created_by = await UserFactory.create()
        if updated_by is None:
            updated_by = created_by
        if fast_api_config is None:
            fast_api_config = {
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 3,
                "node_capacity_type": "spot"
            }
        
        return await APIServeInfraConfig.create(
            serve=serve,
            environment=environment,
            backend_type=backend_type,
            fast_api_config=fast_api_config,
            additional_hosts=additional_hosts,
            created_by=created_by,
            updated_by=updated_by,
            **kwargs
        )


class DeploymentFactory:
    """Factory for creating Deployment instances."""
    
    @staticmethod
    async def create(
        serve: Optional[Serve] = None,
        artifact: Optional[Artifact] = None,
        environment: Optional[Environment] = None,
        status: str = DeploymentStatus.ACTIVE.value,
        created_by: Optional[User] = None,
        **kwargs
    ) -> Deployment:
        """Create a test deployment."""
        if serve is None:
            serve = await ServeFactory.create()
        if artifact is None:
            artifact = await ArtifactFactory.create(serve=serve)
        if environment is None:
            environment = await EnvironmentFactory.create()
        if created_by is None:
            created_by = await UserFactory.create()
        
        return await Deployment.create(
            serve=serve,
            artifact=artifact,
            environment=environment,
            status=status,
            created_by=created_by,
            **kwargs
        )


class AppLayerDeploymentFactory:
    """Factory for creating AppLayerDeployment instances."""
    
    @staticmethod
    async def create(
        deployment: Optional[Deployment] = None,
        deployment_strategy: Optional[str] = "rolling",
        deployment_params: Optional[Dict[str, Any]] = None,
        environment_variables: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> AppLayerDeployment:
        """Create a test app layer deployment."""
        if deployment is None:
            deployment = await DeploymentFactory.create()
        if environment_variables is None:
            environment_variables = {
                "TEST_VAR": "test_value"
            }
        
        return await AppLayerDeployment.create(
            deployment=deployment,
            deployment_strategy=deployment_strategy,
            deployment_params=deployment_params,
            environment_variables=environment_variables,
            **kwargs
        )

