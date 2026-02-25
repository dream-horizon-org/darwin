## 1. API contract (strategy + config) and validation

- [x] 1.1 Define canonical strategy IDs (e.g., `rolling`, `canary`) and document them in the API schema (`ml-serve-app/app_layer/src/ml_serve_app_layer/dtos/requests.py`)
- [x] 1.2 Replace `deployment_strategy: Optional[str]` with a constrained enum/`Literal` (case-insensitive normalization) and add clear validation errors for unsupported values
- [x] 1.3 Introduce typed `deployment_strategy_config` models (rolling: optional tuning; canary: Flagger/Istio analysis settings) and validate shape/value ranges (e.g., weights 0–100, required fields)
- [x] 1.4 Update request/response examples in `ml-serve-app/README.md` to include rolling (default) and canary payloads
- [x] 1.5 Add unit tests for validation (unknown strategy rejected; default strategy applied; invalid config rejected) under `ml-serve-app/tests/unit/`

## 2. Core strategy architecture (dispatch + rendering)

- [x] 2.1 Create `ml-serve-app/core/src/ml_serve_core/deployment_strategies/` package with:
  - [x] 2.1.1 `base.py` strategy interface (validate + render values)
  - [x] 2.1.2 `rolling.py` implementation (default behavior)
  - [x] 2.1.3 `canary_istio_flagger.py` implementation (Flagger/Istio progressive delivery)
  - [x] 2.1.4 `factory.py` to map `deployment_strategy` → implementation and handle defaults
- [x] 2.2 Add strategy-specific error types (e.g., unsupported strategy, prerequisites missing, invalid config) and ensure errors translate to user-facing API errors
- [x] 2.3 Update `ml-serve-app/core/src/ml_serve_core/service/deployment_service.py` to:
  - [x] 2.3.1 Normalize/validate strategy + config
  - [x] 2.3.2 Render strategy-specific Helm values
  - [x] 2.3.3 Execute DCM calls using the rendered values (no behavior change for rolling)
- [x] 2.4 Ensure the persisted `AppLayerDeployment.deployment_strategy` and `deployment_params` store the canonical strategy ID and the effective (defaults-applied) config

## 3. Helm values generation (strategy-aware)

- [x] 3.1 Extend `ml-serve-app/core/src/ml_serve_core/utils/yaml_utils.py` to accept strategy + config inputs and produce values that toggle strategy behavior
- [x] 3.2 Implement rolling toggles in values output (ensure `flagger.enabled=false`, `service.enabled=true` in the emitted values)
- [x] 3.3 Implement canary toggles in values output (ensure `flagger.enabled=true` and any required chart flags such as `service.enabled=false`)
- [x] 3.4 Map canary `deployment_strategy_config` into chart values (`.Values.flagger.*`, metrics configuration, deadlines, etc.)
- [x] 3.5 Add unit tests (golden/value assertions) to ensure emitted values differ correctly between rolling vs canary

## 4. `darwin-fastapi-serve` Helm chart updates (rolling default + canary mode)

- [x] 4.1 Add/fix missing Flagger-related values keys referenced by templates (e.g., `flagger.progressDeadlineSeconds`) in `darwin-cluster-manager/charts/darwin-fastapi-serve/values.yaml`
- [x] 4.2 Make rolling update settings independent from Flagger defaults (so rolling deploys do not depend on canary settings)
- [x] 4.3 Ensure canary mode renders all required Kubernetes resources without Helm template failures (Flagger `Canary`, required metric templates, etc.)
- [x] 4.4 Resolve ingress/service wiring for canary mode:
  - [x] 4.4.1 Decide which Service Ingress targets in canary mode (primary vs managed service)
  - [x] 4.4.2 Update `_helpers.tpl` / ingress templates accordingly
- [x] 4.5 Add or reference required Istio routing resources for Flagger (Gateway/VirtualService/DestinationRule) OR explicitly document the required pre-existing gateway and how it is named
- [x] 4.6 Update chart README/docs to describe how to enable canary mode and what cluster prerequisites are required

## 5. Redeploy / infra update behavior (strategy preservation)

- [x] 5.1 Update `redeploy_api_serve_with_updated_infra_config()` in `ml-serve-app/core/src/ml_serve_core/service/deployment_service.py` to rehydrate strategy intent from the active deployment when rebuilding full values
- [x] 5.2 Ensure infra-only patches are strategy-safe (rolling and canary both behave predictably under Helm deep-merge semantics)
- [x] 5.3 Add tests in `ml-serve-app/tests/unit/test_infra_update.py` to assert strategy + config are preserved across redeploy paths (update succeeds vs rebuild fallback)

## 6. Compatibility, migrations, and guardrails

- [x] 6.1 Confirm backward compatibility: existing clients omitting `deployment_strategy` still deploy successfully (rolling default)
- [x] 6.2 Add guardrails: canary is rejected with actionable error messages when prerequisites are missing (e.g., `ENABLE_ISTIO` off)
- [x] 6.3 Add safe defaults for canary config (interval, threshold, step weight, max weight) so minimal config is usable

## 7. End-to-end verification and documentation

- [x] 7.1 Update/add unit tests in `ml-serve-app/tests/unit/test_artifact_deployment.py` to cover:
  - [x] 7.1.1 Rolling deploy values toggles
  - [x] 7.1.2 Canary deploy values toggles
- [x] 7.2 (Optional) Add an integration test or manual test script to deploy a canary in a cluster with Flagger/Istio installed and verify progressive traffic shifting behavior
- [x] 7.3 Update `ml-serve-app/README.md` with a “Deployment strategies” section including prerequisites, example payloads, and operational notes (rollback expectations, analysis behavior)

