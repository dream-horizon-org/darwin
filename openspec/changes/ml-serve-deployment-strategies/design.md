## Context

### Current state (ml-serve-app)

- The deployment API already accepts `api_serve_deployment_config.deployment_strategy` and an opaque `deployment_strategy_config`, and the database model `app_layer_deployments` persists:
  - `deployment_strategy` (string)
  - `deployment_params` (JSON)
  - `environment_variables` (JSON)
- However, `ml_serve_core.service.deployment_service.DeploymentService.deploy_fastapi_serve()` currently ignores the strategy and always executes the same flow:
  - generate `darwin-fastapi-serve` Helm values
  - call DCM `build_resource(...)`
  - call DCM `start_resource(...)`

### Current state (chart/DCM integration)

- The `darwin-fastapi-serve` chart is the unit of deployment used by DCM for API serves.
- The chart already contains some Flagger-oriented values/templates (e.g., `templates/flagger.yaml`) but needs to be made coherent and strategy-driven (rolling default, canary only when enabled, correct required values, correct ingress/service wiring).

### Constraints

- `ml-serve-app` does not talk directly to Kubernetes; it delegates resource lifecycle to DCM.
- Any deployment strategy must be expressed either:
  - by emitting different Helm values/templates (preferred), and/or
  - by extending DCM capabilities (avoid unless required).
- Local development clusters may not have Istio/Flagger; canary should fail fast with clear errors or be explicitly unavailable.

## Goals / Non-Goals

**Goals:**

- Make `deployment_strategy` a **first-class, enforced behavior** for API serves (FastAPI backend initially).
- Provide a stable strategy dispatch layer in `ml_serve_core` that:
  - validates strategy + config
  - renders strategy-specific Helm values (and related toggles)
  - calls DCM consistently
- Support two strategies end-to-end:
  - **rolling**: standard Kubernetes rolling update/Helm upgrade semantics
  - **canary (Flagger + Istio)**: progressive delivery via Flagger resources, configurable analysis/weights/metrics, with rollback handled by Flagger
- Preserve backward compatibility:
  - absent strategy → defaults to rolling
  - existing callers passing `"rolling"` continue to work

**Non-Goals:**

- Workflow serve deployment strategies (out of scope for this change).
- Providing a full UI/UX for canary analysis status in the control plane (may be added later).
- Building a generic “Kubernetes orchestration layer” inside `ml-serve-app` (DCM remains the single K8s abstraction).

## Decisions

### Decision: Strategy pattern in `ml_serve_core` (dispatch + validation + value rendering)

**Choice:** Introduce a `ml_serve_core.deployment_strategies` package with a small, explicit interface:

- `strategy_id` (e.g., `"rolling"`, `"canary"`)
- `validate(config, context)` → raises a typed error for invalid config / missing dependencies (e.g., Istio disabled)
- `render_values(base_values, config, context)` → returns Helm values ready for DCM `build_resource`
- optional: `render_infra_patch(infra_values, config, context)` for infra-only updates

**Rationale:**

- Keeps `DeploymentService` thin (retrieve inputs + persist DB rows + call DCM).
- Makes it easy to add future strategies (blue/green, shadow, etc.) without growing conditional logic in core services.

**Alternatives considered:**

- Inline `if/else` branching in `DeploymentService`: simplest initially but quickly becomes hard to extend and test.
- Strategy implemented only in Helm chart via values with no core abstraction: pushes all validation and behavior into chart logic and makes API errors opaque.

### Decision: Typed strategy config at the API boundary (Pydantic models)

**Choice:** Replace free-form `deployment_strategy: Optional[str]` with:

- a constrained enum/`Literal` for `deployment_strategy`
- a discriminated config model for `deployment_strategy_config` (strategy-specific schema)

**Rationale:**

- Prevents invalid configs from reaching deployment orchestration.
- Enables clear error messages and strong test coverage.

**Alternatives considered:**

- Keep config opaque JSON and validate only in strategies: more flexible, but produces weaker API contracts and inconsistent error surfaces.

### Decision: Express strategy behavior via Helm values + templates (no new DCM APIs)

**Choice:** Keep DCM operations the same (`build_resource` + `start_resource` / `update_resource`), and express strategy by:

- emitting different values (e.g., `flagger.enabled=true`, `service.enabled=false`)
- ensuring chart templates are correct and complete for canary mode

**Rationale:**

- Avoids expanding the DCM API surface area.
- Keeps the “source of truth” for Kubernetes resources inside the chart.

## Strategy behaviors

### Rolling strategy

- **Defaults**:
  - `deployment_strategy = "rolling"` when omitted
  - `deployment_strategy_config = null` or empty dict
- **DCM calls**:
  - build full values and start resource (existing behavior)
- **Chart toggles**:
  - `flagger.enabled = false`
  - `service.enabled = true`
  - rolling update knobs (e.g., `maxSurge`, `maxUnavailable`) remain supported as optional tuning

### Canary strategy (Flagger + Istio)

- **Preconditions** (validated by strategy):
  - `ENABLE_ISTIO=true` (or an environment-level capability flag)
  - cluster has Flagger CRDs/controllers installed
  - chart is configured with an Istio traffic router setup that Flagger can use (VirtualService/DestinationRule and a gateway reference)
- **DCM calls**:
  - build full values including Flagger `Canary` object + required Istio routing objects
  - start resource (Flagger drives progressive delivery after the Deployment spec changes)
- **Chart toggles**:
  - `flagger.enabled = true`
  - `service.enabled = false` (Flagger owns services/traffic routing)
  - strategy config maps into `.Values.flagger.*` and metric templates

## Data model notes

- `AppLayerDeployment.deployment_strategy` and `deployment_params` remain the persistence point for strategy intent.
- Deploy flow should always persist the final normalized strategy + config:
  - `deployment_strategy`: lowercase canonical IDs (`"rolling"`, `"canary"`)
  - `deployment_params`: full config dict (including defaults applied)

## Redeploy / infra updates

`redeploy_api_serve_with_updated_infra_config()` currently tries `update_resource(values=infra_patch)` and falls back to a full rebuild.

Planned behavior:

- When doing a full rebuild fallback, rehydrate the previously active deployment’s strategy + params and re-render full values accordingly (so a canary stays a canary).
- When doing infra-only patch updates, ensure the patch is strategy-safe:
  - rolling: patch is applied directly
  - canary: patch should update the target Deployment used by Flagger (still a normal Deployment); chart values must merge cleanly

## Risks / Trade-offs

- **[Chart coherence risk]** Flagger/Istio templates in `darwin-fastapi-serve` must be correct (service/ingress/virtualservice wiring).  
  → **Mitigation:** add a “canary mode” chart unit test/helm template render in CI (or at least in `ml-serve-app` unit tests via golden values assertions).

- **[Environment variability]** Some environments will not have Istio/Flagger installed.  
  → **Mitigation:** validate preconditions and return a 400 with a clear hint; keep rolling as default.

- **[State reporting gap]** `ml-serve-app` may not reflect canary analysis success/failure in DB status.  
  → **Mitigation:** treat this change as enabling rollout mechanics; add follow-up work to surface rollout status via DCM/K8s if needed.

## Migration plan

- Deploy chart changes first (or behind feature flags) so canary templates/values are available.
- Deploy `ml-serve-app` changes:
  - rolling remains default → no behavior change for existing clients
  - canary becomes available only when explicitly requested and preconditions are met
- Rollback strategy:
  - disabling canary requests (config flag) or reverting `ml-serve-app` keeps rolling behavior intact
  - chart rollback reverts Flagger templates; existing rolling deployments remain unaffected

## Open questions

- Should canary be enabled per-environment via a DB flag (preferred) vs only via `ENABLE_ISTIO` env var?
- Should we support NGINX/Ingress-based canary (Flagger with nginx) for local clusters as an alternative to Istio?
- Do we need an API endpoint to fetch rollout status (Flagger/Deployment health) as part of this change, or is it a follow-up?

