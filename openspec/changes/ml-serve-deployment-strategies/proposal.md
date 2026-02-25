## Why

Today `ml-serve-app` accepts `deployment_strategy` (and persists it in `app_layer_deployments`) but the control-plane always performs the same “build Helm values → DCM build_resource/start_resource” flow. This means production rollouts have no first-class, policy-driven rollout mechanism (progressive delivery, automatic analysis/rollback, safe traffic shifting), increasing risk and operational toil as serves grow.

## What Changes

- Add a first-class **deployment strategy** concept for **API serves** (FastAPI backend initially) that determines how a new artifact version is rolled out.
- Support at least:
  - **Rolling**: default strategy; standard Kubernetes rolling update / Helm upgrade semantics.
  - **Canary**: progressive delivery driven by Flagger (Istio-based) with configurable analysis/weights/metrics and automated rollback on failed analysis.
- Validate and normalize `deployment_strategy` and `deployment_strategy_config` at the API boundary (clear errors for unsupported strategies / invalid configs).
- Persist the chosen strategy + config for each deployment and ensure redeploys (e.g., infra updates) preserve/rehydrate the strategy intent.
- Extend the `darwin-fastapi-serve` Helm chart values and templates to express strategy-specific resources (e.g., Flagger `Canary`) in a way that the control plane can toggle per deployment.

## Capabilities

### New Capabilities
- `deployment-strategies`: Allow API-serve deployments to select a rollout strategy (rolling, canary) with a typed strategy config that maps to underlying Kubernetes/Helm resources and rollout behavior.

### Modified Capabilities
- (none)

## Impact

- **ML Serve App (control plane)**:
  - `app_layer` request validation and API contract for `deployment_strategy` / `deployment_strategy_config`
  - `core` deployment orchestration (strategy dispatch) and Helm values generation
  - tests updated/added for strategy selection and chart values emitted for each strategy
- **Darwin Cluster Manager Helm chart**:
  - `darwin-fastapi-serve` values/templates updated to support progressive delivery resources (Flagger/Istio) and keep rolling behavior as the default
- **Runtime/cluster dependencies**:
  - Canary strategy requires Flagger + Istio (or an explicitly supported traffic router) to be installed and configured in target clusters

