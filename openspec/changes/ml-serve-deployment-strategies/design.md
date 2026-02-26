# Design — ml-serve-deployment-strategies

## Approach

Implement deployment strategies for API serves by introducing a small **strategy engine** in `ml-serve-app` that converts a requested strategy + config into **Helm values** consumed by the `darwin-fastapi-serve` chart. This keeps strategy behavior centralized and testable in the application layer while using the cluster manager (DCM) as the execution backend.

## Decisions

- **Strategy-as-values (not new APIs to DCM):** Model strategies as chart values (e.g., Flagger enabled/configured) rather than introducing new DCM endpoints. Rationale: DCM already supports “build values + start resource”; strategies are chart-level concerns and should remain declarative.

- **Explicit strategy validation:** Restrict `deployment_strategy` to a small enum (initially `rolling`, `canary`) and validate `deployment_strategy_config` by strategy. Rationale: prevents “stored-but-ignored” configs and makes failures actionable.

- **Provider-aware canary:** Treat “canary” as a behavioral intent that requires a provider (initially Flagger). The system must detect/configure provider prerequisites (chart values + cluster prerequisites) and fail fast when unsupported. Rationale: canary traffic shifting is not available in plain Kubernetes Deployments.

- **No DB migrations in first slice:** Reuse existing `AppLayerDeployment.deployment_strategy` and `deployment_params`. Rationale: fields exist already; main gap is wiring and validation.

## Architecture changes

### Application layer (`ml-serve-app`)

- Add a dedicated module, e.g. `ml_serve_core/deployment_strategies/`:
  - `DeploymentStrategy` interface (compute Helm value overrides, validate config).
  - `RollingStrategy` (configures rolling update knobs and rollout timeouts).
  - `CanaryStrategy` (enables canary resources and configures analysis/traffic shifting).
- Update Helm value generation (`generate_fastapi_values*`) to accept a normalized strategy object and apply overrides to the base values template.
- Update request DTOs to:
  - Normalize strategy names (case/whitespace).
  - Provide helpful validation errors when config is missing/invalid.
- Ensure redeploy flows reapply the same strategy consistently:
  - Fresh deploy uses provided strategy (or default).
  - “Redeploy with updated infra config” preserves prior strategy unless explicitly overridden.

### Helm chart (`darwin-fastapi-serve`)

- Make “strategy” fully controllable by values:
  - Rolling: already uses `.Values.flagger.maxSurge/maxUnavailable` for `Deployment.spec.strategy.rollingUpdate`; ensure names/structure are stable.
  - Canary: ensure the chart can render the correct progressive-delivery resources for the chosen provider.
- Clarify and enforce service/ingress behavior when canary is enabled:
  - When using Flagger-managed Services, the chart’s own Service should be disabled (per existing README).
  - Ingress routing should point to the correct Service name for the provider.
- Resolve provider mismatch:
  - Current `templates/flagger.yaml` assumes Istio gateways but the chart does not define Gateway/VirtualService templates.
  - The chart must either:
    - (A) add the missing Istio resources (Gateway/VirtualService/DestinationRule) and gate them behind `.Values.istio.enabled`, or
    - (B) add an NGINX ingress provider variant (Flagger “ingress”/NGINX mode) and gate it behind `.Values.flagger.provider`.

## Alternatives considered

- **Argo Rollouts instead of Flagger:** Rejected for the first slice because the repo already contains Flagger scaffolding and adding Rollouts introduces new controllers/CRDs and a different operational model. Re-evaluate later if Flagger provider constraints are too limiting (e.g., ALB traffic shifting requirements).

- **Implement canary purely in application code (two Deployments + custom routing):** Rejected because reliable traffic shifting requires an ingress/service-mesh integration and health/metric analysis; re-implementing this in app code is high risk and operationally complex.

## Constraints

- Clusters must have the progressive-delivery provider installed (e.g., Flagger + routing provider). The system must document and validate prerequisites.
- Strategy configuration must remain **backward-compatible**: omitting strategy yields current rolling behavior.
 - **No fallback:** If canary prerequisites are missing, the deployment request is rejected (no automatic fallback to rolling).

## Open questions

- **Which canary routing provider is the production standard?**
  - Istio, NGINX, or another provider (App Mesh/Linkerd) impacts chart templates and prerequisites.
- **Do we require “promotion” controls?**
  - e.g., manual promotion, pause/resume, abort, rollback endpoints vs. fully automatic analysis.
- **What’s the source of truth for metrics/analysis?**
  - Current chart references Datadog templates; confirm whether Datadog is mandatory for canary analysis or if we need pluggable metrics.

