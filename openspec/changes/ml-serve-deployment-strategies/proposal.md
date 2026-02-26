# Change proposal — ml-serve deployment strategies

## Summary

Add **first-class deployment strategies** for API-based serves in `ml-serve-app`, so a deployment can be executed as **rolling** (default) or **canary** (progressive traffic shifting) with strategy-specific configuration.

Today the API accepts `deployment_strategy` and stores it in `AppLayerDeployment`, but the chosen strategy **does not affect** the generated Helm values or the deployed Kubernetes resources. This change makes the strategy **behavioral** rather than purely informational.

## Change ID

`ml-serve-deployment-strategies`

## Affected capability

`ml-serve-deployment-strategies` (new; canonical spec at `openspec/specs/ml-serve-deployment-strategies/spec.md`).

## Background / current state

- API surface already includes `api_serve_deployment_config.deployment_strategy` and `deployment_strategy_config`.
- Database already stores `deployment_strategy` and `deployment_params` on `AppLayerDeployment`.
- FastAPI serves are deployed via DCM (Darwin Cluster Manager) by building Helm values (`generate_fastapi_values*`) and starting the `darwin-fastapi-serve` chart.
- The chart contains a Flagger canary template (`templates/flagger.yaml`) and rolling update knobs (`.Values.flagger.maxSurge/maxUnavailable`), but `ml-serve-app` never sets `.Values.flagger.enabled` or related canary config based on the requested strategy.

## Goals

- Make `deployment_strategy` **deterministic and enforced** for API serve deployments:
  - **Rolling**: standard Kubernetes rolling update semantics with configurable rollout parameters.
  - **Canary**: progressive delivery with configurable analysis/traffic shifting parameters (provider-backed).
- Keep the existing deployment API backward-compatible:
  - If `deployment_strategy` is omitted, behavior remains **rolling** with current chart defaults.
- Persist the chosen strategy and config with the deployment record for auditability and repeatability.
- Provide a clear, testable contract (spec) that Phase 2+ can convert into acceptance tests and implementation.

## Non-goals (this slice)

- Workflow serve deployments (non-API) are not changed.
- Multi-region / multi-cluster progressive delivery orchestration is out of scope.
- Advanced strategies (blue/green, shadow) are out of scope for the first slice, unless required to support canary reliably.
- Implementing a full UI for progressive delivery is out of scope (API/behavior only).

## Proposed approach (high level)

- Introduce a **deployment strategy engine** in `ml-serve-app` that:
  - Validates `deployment_strategy` and its config.
  - Produces **strategy-specific Helm values** to drive the chart behavior.
  - Encapsulates provider-specific details (e.g., Flagger/Istio/NGINX).
- Extend the `darwin-fastapi-serve` chart where necessary so that:
  - Rolling strategy is explicitly configurable via values (current knobs exist).
  - Canary strategy can be enabled via values and produces the required Kubernetes resources.
- Ensure redeploy paths preserve or reapply the configured strategy consistently (fresh deploy, redeploy on infra change, one-click deploy where applicable).

## Risks / constraints

- Canary delivery requires a supported progressive-delivery provider (e.g., Flagger with a routing provider like Istio/NGINX). Clusters without the provider must **fail fast** with a clear error that states what prerequisite is missing.
- Chart currently references Istio gateway names in Flagger CR; if the cluster is not using Istio, chart changes are required.
- Backward compatibility: existing clients may send arbitrary strings for `deployment_strategy`; validation must be strict but provide actionable errors.

## Rollout plan (execution outline)

- Define a stable contract in spec (requirements + scenarios) for rolling and canary.
- Implement strategy validation and Helm value generation in `ml-serve-app`.
- Update chart(s) and/or cluster prerequisites to support canary end-to-end.
- Add tests: unit tests for value generation + integration tests for strategy-specific resource intent (without requiring a live cluster).

## Detailed execution plan

### Application/API (ml-serve-app)

- Add a strategy enum and normalization rules (case-insensitive inputs; persist lowercase).
- Validate `deployment_strategy_config` by strategy:
  - rolling: validate `max_surge`, `max_unavailable`, `progress_deadline_seconds`
  - canary: validate `provider`, `interval`, `threshold`, `max_weight`, `step_weight`, `metrics`
- Introduce a strategy module (single responsibility: compute Helm value overrides):
  - `RollingStrategy.apply(values, config) -> values`
  - `CanaryStrategy.apply(values, config) -> values`
- Wire strategy into value generation:
  - Update `generate_fastapi_values(...)` and `generate_fastapi_values_for_one_click_model_deployment(...)` to apply strategy overrides.
  - Ensure env vars and infra overrides continue to work (no regression).
- Wire strategy into deploy flows:
  - `deploy_artifact` and `deploy_model` SHOULD pass strategy + config into values generation.
  - Redeploy-on-infra-update MUST reuse the last active strategy/config if not explicitly overridden.

### Cluster/chart (darwin-fastapi-serve)

- Confirm and standardize value keys used for rolling parameters:
  - Ensure `Deployment.spec.strategy.rollingUpdate.maxSurge/maxUnavailable` are driven by values that `ml-serve-app` can set.
- Make canary strategy render correctly for the chosen provider:
  - For Flagger: ensure `templates/flagger.yaml` is consistent with the routing provider (Istio vs NGINX) and that required dependent resources exist in-chart or are documented prerequisites.
  - Ensure Service creation is compatible with provider-managed services when canary is enabled.
- Document prerequisites and required cluster addons (CRDs/controllers, metrics provider).

### Tests and verification

- Unit tests for:
  - strategy normalization and validation
  - Helm values produced for rolling vs canary
- Integration tests (mock DCM client) asserting:
  - canary sets provider enablement values and disables conflicting resources (as applicable)
  - rolling sets the correct rolling-update parameters
- Docs/tests to validate backward compatibility:
  - “strategy omitted” still deploys successfully as rolling.

### Rollout safety

- Start with rolling strategy behavior parity (no functional change when omitted).
- Ship canary behind strict validation and prerequisite checks (fail fast with actionable errors).
- Add a migration/compatibility path for older deployments with unknown stored strategies (treat as rolling on redeploy).

