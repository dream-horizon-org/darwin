<!-- New capability spec (delta form). When merging, this becomes the canonical spec at `openspec/specs/ml-serve-deployment-strategies/spec.md`. -->

+ # ml-serve deployment strategies — Specification
+
+ ## Purpose
+
+ Define how `ml-serve-app` deploys API serves using explicit deployment strategies, so operators can choose between standard rolling updates and progressive delivery (canary) in a controlled, repeatable way.
+
+ ## Terms
+
+ - **API serve**: A serve whose runtime is deployed as a Kubernetes workload (e.g., FastAPI backend) and receives online traffic.
+ - **Environment**: A deployment target for a serve (e.g., a named combination of cluster and namespace) as used by `ml-serve-app`.
+ - **Redeploy**: Starting deployment execution for an already-deployed serve/environment without changing the artifact version, typically to reapply infrastructure or configuration changes.
+
+ ## Requirements
+
+ ### Requirement: Strategy selection
+
+ The system MUST allow an API serve deployment to declare a deployment strategy.
+
+ The system MUST support, at minimum, the following strategies:
+
+ - `rolling`
+ - `canary`
+
+ The system MUST treat an omitted strategy as `rolling`.
+
+ The system MUST treat strategy names as case-insensitive and MUST persist the normalized (lowercase) strategy name.
+
+ ### Requirement: Strategy validation
+
+ The system MUST reject deployments with an unknown strategy.
+
+ When a strategy requires additional configuration, the system MUST validate that configuration and reject invalid inputs with an actionable error.
+
+ ### Requirement: Strategy configuration contract
+
+ The system MUST accept strategy configuration as an object associated with the deployment strategy.
+
+ For the `rolling` strategy, the system MUST support the following optional configuration keys:
+
+ - `max_surge`: the maximum surge during rollout (integer or percentage string)
+ - `max_unavailable`: the maximum unavailable during rollout (integer or percentage string)
+ - `progress_deadline_seconds`: maximum time allowed for rollout progress (integer seconds)
+
+ For the `canary` strategy, the system MUST support the following configuration keys:
+
+ - `provider`: identifier of the canary execution provider (e.g., `flagger`)
+ - `interval`: analysis interval (duration string)
+ - `threshold`: maximum number of failed checks before rollback (integer)
+ - `max_weight`: maximum traffic percentage routed to canary (integer 0–100)
+ - `step_weight`: traffic increment step (integer 0–100)
+ - `metrics`: list of metric checks (provider-defined, but MUST be a list)
+
+ If a required key for the chosen strategy is missing, the system MUST reject the deployment with an actionable error.
+
+ ### Requirement: Strategy persistence
+
+ The system MUST persist the chosen strategy and the strategy configuration with the deployment record.
+
+ ### Requirement: Rolling deployment behavior
+
+ When the deployment strategy is `rolling`, the system MUST update the running deployment using rolling-update semantics such that:
+
+ - availability is maintained to the extent permitted by configured rollout parameters
+ - old and new versions MAY overlap during rollout (surge)
+
+ ### Requirement: Canary deployment behavior
+
+ When the deployment strategy is `canary`, the system MUST perform a progressive rollout that:
+
+ - starts the new version alongside the stable version
+ - shifts traffic from stable to canary in increments defined by configuration
+ - continuously evaluates rollout health using configured checks/metrics
+ - rolls back to stable when health checks fail beyond configured thresholds
+ - completes by promoting the canary version to stable when the rollout succeeds
+
+ If the runtime environment does not support canary execution (missing provider prerequisites), the system MUST fail the deployment request with a clear error describing what is missing.
+
+ ### Requirement: Deterministic redeployments
+
+ When redeploying an API serve without explicitly changing the deployment strategy, the system MUST reuse the previously active deployment’s strategy and configuration for that serve/environment.
+
+ If the previously active deployment’s stored strategy is unknown, the system MUST treat it as `rolling` for redeployments.
+
+ ### Requirement: Prerequisite checks happen before execution
+
+ When validating a `canary` deployment request, the system MUST verify provider prerequisites before starting deployment execution.
+
+ If prerequisites are missing, the system MUST reject the request without starting deployment execution.
+
+ ## Scenarios
+
+ #### Scenario: Default strategy is rolling
+
+ - GIVEN an API serve deployment request that omits a deployment strategy
+ - WHEN the deployment is started
+ - THEN the system selects the `rolling` strategy
+
+ #### Scenario: Unknown strategy is rejected
+
+ - GIVEN an API serve deployment request with strategy `banana`
+ - WHEN the deployment is started
+ - THEN the system rejects the request
+ - AND the error message indicates the supported strategies
+
+ #### Scenario: Canary strategy with missing configuration is rejected
+
+ - GIVEN an API serve deployment request with strategy `canary`
+ - AND the request omits required canary configuration
+ - WHEN the deployment is started
+ - THEN the system rejects the request
+ - AND the error message identifies the missing configuration key(s)
+
+ #### Scenario: Rolling deployment honors rollout parameters
+
+ - GIVEN an API serve is deployed with strategy `rolling`
+ - AND rollout parameters are configured
+ - WHEN a new version is deployed
+ - THEN the system performs a rolling update consistent with those parameters
+
+ #### Scenario: Canary rollout succeeds and is promoted
+
+ - GIVEN an API serve is deployed with strategy `canary`
+ - AND the environment supports canary execution
+ - WHEN a new version is deployed
+ - THEN the system starts the new version alongside stable
+ - AND shifts traffic in configured increments
+ - AND promotes the new version to stable after successful analysis
+
+ #### Scenario: Canary rollout fails and is rolled back
+
+ - GIVEN an API serve is deployed with strategy `canary`
+ - AND the environment supports canary execution
+ - WHEN health evaluation fails beyond the configured threshold during rollout
+ - THEN the system rolls back traffic to the stable version
+ - AND the rollout is marked as failed
+
+ #### Scenario: Canary request fails fast without provider prerequisites
+
+ - GIVEN an API serve deployment request with strategy `canary`
+ - AND the target environment does not support canary execution
+ - WHEN the deployment is started
+ - THEN the system rejects the request
+ - AND the error message describes the missing prerequisite(s)
+
+ #### Scenario: Redeploy reuses the last strategy
+
+ - GIVEN an API serve has an active deployment with strategy `canary` and configuration `C`
+ - WHEN a redeploy is initiated without specifying a strategy
+ - THEN the system uses strategy `canary` with configuration `C`
+
+ ## Out of scope
+
+ - Workflow serve deployments.
+ - Additional strategies beyond `rolling` and `canary` (e.g., blue/green, shadow) for this slice.
+ - Defining a user interface for strategy management.
+
+ ## Non-functional
+
+ - The strategy selection and validation MUST be deterministic and environment-independent (except for provider prerequisite checks).
+ - Errors for invalid strategies/config MUST be actionable (identify the field and expected values).

