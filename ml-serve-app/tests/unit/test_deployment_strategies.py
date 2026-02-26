"""
Unit tests for API serve deployment strategies (rolling, canary).

These tests implement Phase 3 (Implement tests) from acceptance scenarios:
`openspec/changes/ml-serve-deployment-strategies/acceptance.md`
"""

import pytest
from fastapi import HTTPException

from ml_serve_app_layer.dtos.requests import APIServeDeploymentConfigRequest, DeploymentRequest
from ml_serve_core.service.deployment_service import DeploymentService
from ml_serve_model.active_deployment import ActiveDeployment
from ml_serve_model.app_layer_deployments import AppLayerDeployment
from ml_serve_model.deployment import Deployment
from ml_serve_model.enums import BackendType
from ml_serve_model.serve_configs import APIServeInfraConfig


@pytest.mark.unit
class TestDeploymentStrategies:
    """Tests for strategy validation, persistence, and values wiring."""

    @pytest.mark.asyncio
    async def test_ac_1_default_strategy_is_rolling_when_omitted(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-1: Default strategy is rolling."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            environment_variables={"X": "1"}
        )

        deployment, _ = await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        app_deployment = await AppLayerDeployment.get(deployment=deployment)
        assert app_deployment.deployment_strategy == "rolling"

    @pytest.mark.asyncio
    async def test_ac_2_strategy_names_are_case_insensitive_and_normalized(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-2: Strategy names are case-insensitive and normalized."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="ROLLING",
            environment_variables={"X": "1"},
        )

        deployment, _ = await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        app_deployment = await AppLayerDeployment.get(deployment=deployment)
        assert app_deployment.deployment_strategy == "rolling"

    @pytest.mark.asyncio
    async def test_ac_3_unknown_strategy_is_rejected(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-3: Unknown strategy is rejected."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="banana",
            environment_variables={"X": "1"},
        )

        with pytest.raises(HTTPException) as exc:
            await service.deploy_api_serve(
                serve=test_serve,
                artifact=test_artifact,
                env=test_environment,
                api_serve_config=infra_config,
                api_deployment_config=deployment_config,
                user=test_user,
            )

        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_ac_4_rolling_strategy_accepts_optional_rollout_parameters_and_wires_to_values(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-4: Rolling strategy accepts optional rollout parameters."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling",
            deployment_strategy_config={
                "max_surge": "10%",
                "max_unavailable": 1,
                "progress_deadline_seconds": 900,
            },
            environment_variables={"X": "1"},
        )

        await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        build_call = mock_dcm_client.build_resource.call_args
        values = build_call.kwargs["values"]
        assert values["flagger"]["maxSurge"] == "10%"
        assert values["flagger"]["maxUnavailable"] == 1

    @pytest.mark.asyncio
    async def test_ac_5_canary_strategy_missing_required_config_is_rejected(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-5: Canary strategy missing required configuration is rejected."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config=None,
            environment_variables={"X": "1"},
        )

        with pytest.raises(HTTPException) as exc:
            await service.deploy_api_serve(
                serve=test_serve,
                artifact=test_artifact,
                env=test_environment,
                api_serve_config=infra_config,
                api_deployment_config=deployment_config,
                user=test_user,
            )

        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_ac_6_canary_strategy_invalid_config_is_rejected(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-6: Canary strategy with invalid configuration is rejected."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config={
                "provider": "flagger",
                "interval": "1m",
                "threshold": 2,
                "max_weight": 200,  # invalid
                "step_weight": 20,
                "metrics": [{"name": "sidecar-error-rate-measure"}],
            },
            environment_variables={"X": "1"},
        )

        with pytest.raises(HTTPException) as exc:
            await service.deploy_api_serve(
                serve=test_serve,
                artifact=test_artifact,
                env=test_environment,
                api_serve_config=infra_config,
                api_deployment_config=deployment_config,
                user=test_user,
            )

        assert exc.value.status_code == 400

    @pytest.mark.asyncio
    async def test_ac_7_strategy_and_configuration_are_persisted_with_deployment(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
        monkeypatch,
    ):
        """AC-7: Strategy and configuration are persisted with the deployment."""
        monkeypatch.setenv("ENABLE_CANARY", "true")
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        config_c = {
            "provider": "flagger",
            "interval": "1m",
            "threshold": 2,
            "max_weight": 60,
            "step_weight": 20,
            "metrics": [{"name": "sidecar-error-rate-measure"}],
        }

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config=config_c,
            environment_variables={"X": "1"},
        )

        deployment, _ = await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        app_deployment = await AppLayerDeployment.get(deployment=deployment)
        assert app_deployment.deployment_strategy == "canary"
        assert app_deployment.deployment_params == config_c

    @pytest.mark.asyncio
    async def test_ac_8_rolling_deployment_wires_strategy_to_values(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-8: Rolling deployment performs rolling-update semantics (values intent)."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="rolling",
            deployment_strategy_config={
                "max_surge": "25%",
                "max_unavailable": 0,
            },
            environment_variables={"X": "1"},
        )

        await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        build_call = mock_dcm_client.build_resource.call_args
        values = build_call.kwargs["values"]
        assert values["flagger"]["enabled"] is False
        assert values["flagger"]["maxSurge"] == "25%"
        assert values["flagger"]["maxUnavailable"] == 0

    @pytest.mark.asyncio
    async def test_ac_9_canary_fails_fast_when_environment_does_not_support_canary(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-9: Canary deployment fails fast without provider prerequisites."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config={
                "provider": "flagger",
                "interval": "1m",
                "threshold": 2,
                "max_weight": 60,
                "step_weight": 20,
                "metrics": [{"name": "sidecar-error-rate-measure"}],
            },
            environment_variables={"X": "1"},
        )

        with pytest.raises(HTTPException) as exc:
            await service.deploy_api_serve(
                serve=test_serve,
                artifact=test_artifact,
                env=test_environment,
                api_serve_config=infra_config,
                api_deployment_config=deployment_config,
                user=test_user,
            )

        assert exc.value.status_code == 400
        assert not mock_dcm_client.build_resource.called

    @pytest.mark.asyncio
    async def test_ac_10_canary_rollout_sets_progressive_delivery_values(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
        monkeypatch,
    ):
        """AC-10: Canary rollout succeeds and is promoted (values intent)."""
        monkeypatch.setenv("ENABLE_CANARY", "true")
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config={
                "provider": "flagger",
                "interval": "1m",
                "threshold": 2,
                "max_weight": 60,
                "step_weight": 20,
                "metrics": [{"name": "sidecar-error-rate-measure"}],
            },
            environment_variables={"X": "1"},
        )

        await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        build_call = mock_dcm_client.build_resource.call_args
        values = build_call.kwargs["values"]
        assert values["flagger"]["enabled"] is True
        assert values["flagger"]["type"] == "canary"
        assert values["flagger"]["interval"] == "1m"
        assert values["flagger"]["threshold"] == 2
        assert values["flagger"]["maxWeight"] == 60
        assert values["flagger"]["stepWeight"] == 20

    @pytest.mark.asyncio
    async def test_ac_11_canary_rollout_configures_rollback_thresholds_in_values(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
        monkeypatch,
    ):
        """AC-11: Canary rollout fails and is rolled back (values intent)."""
        monkeypatch.setenv("ENABLE_CANARY", "true")
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        deployment_config = APIServeDeploymentConfigRequest(
            deployment_strategy="canary",
            deployment_strategy_config={
                "provider": "flagger",
                "interval": "1m",
                "threshold": 2,
                "max_weight": 60,
                "step_weight": 20,
                "metrics": [{"name": "sidecar-error-rate-measure"}],
            },
            environment_variables={"X": "1"},
        )

        await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=deployment_config,
            user=test_user,
        )

        build_call = mock_dcm_client.build_resource.call_args
        values = build_call.kwargs["values"]
        assert values["flagger"]["threshold"] == 2

    @pytest.mark.asyncio
    async def test_ac_12_redeploy_reuses_last_strategy_and_configuration_when_omitted_and_normalizes(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
        monkeypatch,
    ):
        """AC-12: Redeploy reuses last strategy/config when omitted."""
        monkeypatch.setenv("ENABLE_CANARY", "true")
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        # Seed an existing active deployment with a non-normalized strategy.
        previous_deployment, _ = await service.deploy_api_serve(
            serve=test_serve,
            artifact=test_artifact,
            env=test_environment,
            api_serve_config=infra_config,
            api_deployment_config=APIServeDeploymentConfigRequest(
                deployment_strategy="CANARY",
                deployment_strategy_config={
                    "provider": "flagger",
                    "interval": "1m",
                    "threshold": 2,
                    "max_weight": 60,
                    "step_weight": 20,
                    "metrics": [{"name": "sidecar-error-rate-measure"}],
                },
                environment_variables={"A": "b"},
            ),
            user=test_user,
        )
        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=previous_deployment,
        )

        # Redeploy without specifying api_serve_deployment_config (should reuse previous).
        request = DeploymentRequest(
            env=test_environment.name,
            artifact_version=test_artifact.version,
            api_serve_deployment_config=None,
        )

        await service.deploy_artifact(
            serve=test_serve,
            artifact=test_artifact,
            serve_config=infra_config,
            env=test_environment,
            deployment_request=request,
            user=test_user,
        )

        active = await ActiveDeployment.get(serve=test_serve, environment=test_environment)
        current = await active.deployment
        app_deployment = await AppLayerDeployment.get(deployment=current)
        assert app_deployment.deployment_strategy == "canary"

    @pytest.mark.asyncio
    async def test_ac_13_redeploy_treats_unknown_stored_strategy_as_rolling(
        self,
        db_session,
        test_user,
        test_serve,
        test_artifact,
        test_environment,
        mock_dcm_client,
    ):
        """AC-13: Redeploy treats unknown stored strategy as rolling."""
        service = DeploymentService()
        service.dcm_client = mock_dcm_client

        infra_config = await APIServeInfraConfig.create(
            serve=test_serve,
            environment=test_environment,
            backend_type=BackendType.FastAPI.value,
            fast_api_config={
                "cores": 2,
                "memory": 4,
                "min_replicas": 1,
                "max_replicas": 2,
                "node_capacity_type": "spot",
            },
            created_by=test_user,
            updated_by=test_user,
        )

        # Seed an existing active deployment with an unknown stored strategy (legacy data).
        previous_deployment = await Deployment.create(
            serve=test_serve,
            artifact=test_artifact,
            environment=test_environment,
            created_by=test_user,
        )
        await AppLayerDeployment.create(
            deployment=previous_deployment,
            deployment_strategy="banana",
            deployment_params={"legacy": True},
            environment_variables={"A": "b"},
        )
        await ActiveDeployment.create(
            serve=test_serve,
            environment=test_environment,
            deployment=previous_deployment,
        )

        # Redeploy without specifying api_serve_deployment_config (should fall back to rolling).
        request = DeploymentRequest(
            env=test_environment.name,
            artifact_version=test_artifact.version,
            api_serve_deployment_config=None,
        )

        await service.deploy_artifact(
            serve=test_serve,
            artifact=test_artifact,
            serve_config=infra_config,
            env=test_environment,
            deployment_request=request,
            user=test_user,
        )

        active = await ActiveDeployment.get(serve=test_serve, environment=test_environment)
        current = await active.deployment
        app_deployment = await AppLayerDeployment.get(deployment=current)
        assert app_deployment.deployment_strategy == "rolling"

