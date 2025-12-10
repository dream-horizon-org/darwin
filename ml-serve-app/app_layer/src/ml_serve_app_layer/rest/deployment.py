from typing import Optional, List

from fastapi import APIRouter

from ml_serve_app_layer.dtos.requests import DeploymentRequest, APIServeDeploymentConfigRequest, \
    WorkflowServeDeploymentConfigRequest, ModelDeploymentRequest, ModelUndeployRequest
from ml_serve_app_layer.utils.auth_utils import AuthorizedUser
from ml_serve_app_layer.utils.response_util import Response
from ml_serve_core.service.artifact_service import ArtifactService
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_core.service.environment_service import EnvironmentService

from ml_serve_core.service.serve_config_service import ServeConfigService
from ml_serve_core.service.serve_service import ServeService
from fastapi.responses import JSONResponse

from ml_serve_model import Deployment
from ml_serve_model.enums import ServeType


class DeploymentRouter:
    def __init__(self):
        self.router = APIRouter()
        self.serve_service = ServeService()
        self.artifact_service = ArtifactService()
        self.environment_service = EnvironmentService()
        self.deployment_service = DeploymentService()
        self.serve_config_service = ServeConfigService()
        self.register_routes()

    def register_routes(self):
        self.router.post("/{serve_name}/deploy")(self.deploy_artifact)
        self.router.get("/{serve_name}/deployments")(self.get_deployments)
        self.router.post("/deploy-model")(self.deploy_model)
        self.router.post("/undeploy-model")(self.undeploy_model)

    async def get_deployments(self, serve_name: str, status: Optional[str] = None, page: int = 1,
                              limit: int = 50) -> JSONResponse:
        """
        Get deployments for a serve.
        """
        serve = await self.serve_service.get_serve_by_name(serve_name)

        # Check if the serve exists
        if not serve:
            return Response.not_found_error_response(f"Serve with name {serve_name} not found")

        deployments: Optional[list[Deployment]] = await self.deployment_service.get_deployment_by_serve_id(serve.id)

        if not deployments:
            return Response.not_found_error_response(f"No deployments found for serve {serve_name}")

        # Optional status filter (ACTIVE/ENDED/ALL)
        if status and status.upper() in ("ACTIVE", "ENDED"):
            deployments = [d for d in deployments if getattr(d, "status", None) == status.upper()]

        # Pagination
        page = max(page, 1)
        limit = min(max(limit, 1), 200)
        start = (page - 1) * limit
        end = start + limit
        page_items = deployments[start:end]

        resp = []
        for deployment in page_items:
            artifact = await deployment.artifact
            created_by = await deployment.created_by
            environment = await deployment.environment
            resp.append({
                "artifact_version": artifact.version,
                "env": environment.name,
                "created_at": deployment.created_at,
                "created_by": created_by.username,
                "status": getattr(deployment, "status", None),
                "ended_at": getattr(deployment, "ended_at", None),
            })

        return Response.success_response(
            f"Deployments for serve {serve_name}",
            {
                "data": resp,
                "page": page,
                "limit": limit,
                "total": len(deployments)
            }
        )

    async def deploy_artifact(self, serve_name: str, request: DeploymentRequest, user: AuthorizedUser) -> JSONResponse:
        """
        Deploy the artifact to the serve.
        """
        serve = await self.serve_service.get_serve_by_name(serve_name)

        # Check if the serve exists
        if not serve:
            return Response.not_found_error_response(f"Serve with name {serve_name} not found")

        env = await self.environment_service.get_environment_by_name(request.env)

        # Check if the environment exists
        if not env:
            return Response.bad_request_error_response(f"Environment with name {request.env} not found")

        serve_config = await self.serve_config_service.get_serve_config(
            serve.id, env.id, serve.type
        )

        # Check if the serve config exists
        if not serve_config:
            return Response.not_found_error_response(
                f"Serve config not found for serve {serve.name} and env {env.name}")

        artifact = await self.artifact_service.get_artifact_by_version(serve.id, request.artifact_version)

        # Check if the artifact exists
        if not artifact:
            return Response.not_found_error_response(f"Artifact with version {request.artifact_version} not found")

        resp = await self.deployment_service.deploy_artifact(
            serve=serve,
            artifact=artifact,
            env=env,
            serve_config=serve_config,
            deployment_request=request,
            user=user
        )

        return Response.success_response(
            f"Deployment started for artifact {request.artifact_version} to {request.env}",
            resp
        )

    async def deploy_model(
            self,
            request: ModelDeploymentRequest,
            user: AuthorizedUser
    ):
        """
        One-click model deployment.

        Deploy an MLflow model directly without creating serves or artifacts.
        """
        return await self.deployment_service.deploy_model(
            request,
            user
        )

    async def undeploy_model(
            self,
            request: ModelUndeployRequest,
            user: AuthorizedUser
    ) -> JSONResponse:
        """
        Undeploy a one-click model deployment.

        Stop and remove a model that was deployed via the deploy-model API.
        This is the counterpart to deploy_model for cleanup.
        """
        result = await self.deployment_service.undeploy_model(request)
        return Response.success_response(
            result["message"],
            {
                "serve_name": result["serve_name"],
                "environment": result["environment"]
            }
        )


deployment_router = DeploymentRouter().router
