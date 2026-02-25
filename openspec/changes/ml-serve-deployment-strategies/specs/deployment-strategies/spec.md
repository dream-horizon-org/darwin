## ADDED Requirements

### Requirement: API serve deployments support a rollout strategy
The system SHALL allow API serve deployments to specify a rollout strategy that determines how a new artifact version is rolled out.

#### Scenario: Client deploys an artifact with an explicit strategy
- **WHEN** a client calls the API-serve deployment endpoint with `deployment_strategy` set to a supported strategy ID
- **THEN** the system SHALL execute the deployment using that strategy’s behavior

#### Scenario: Client deploys an artifact without specifying a strategy
- **WHEN** a client calls the API-serve deployment endpoint without `deployment_strategy`
- **THEN** the system SHALL default the strategy to `rolling`

### Requirement: Strategy identifiers are validated and normalized
The system SHALL validate `deployment_strategy` and SHALL reject unsupported strategies with a clear error. The system SHALL normalize supported strategy identifiers to canonical lowercase IDs.

#### Scenario: Unsupported strategy is rejected
- **WHEN** a client specifies `deployment_strategy` as an unknown value
- **THEN** the system SHALL return an error indicating the strategy is not supported

#### Scenario: Strategy identifier is normalized
- **WHEN** a client specifies `deployment_strategy` using mixed case (e.g., `ROLLING`)
- **THEN** the system SHALL treat it as the canonical lowercase ID (e.g., `rolling`)

### Requirement: Rolling strategy uses standard deployment semantics
When `deployment_strategy` is `rolling`, the system SHALL roll out the new artifact version using standard Kubernetes rolling update semantics as expressed by the `darwin-fastapi-serve` chart.

#### Scenario: Rolling strategy deploy triggers the standard DCM flow
- **WHEN** the strategy is `rolling`
- **THEN** the system SHALL build Helm values for the deployment and invoke the DCM resource build/start flow for the new artifact version

### Requirement: Canary strategy performs progressive delivery via Flagger
When `deployment_strategy` is `canary`, the system SHALL configure the deployed resources to perform progressive delivery via Flagger, using strategy configuration to control analysis and traffic shifting.

#### Scenario: Canary strategy deploy enables progressive delivery resources
- **WHEN** the strategy is `canary`
- **THEN** the system SHALL emit Helm values that enable Flagger canary resources for the deployment

#### Scenario: Canary strategy config controls analysis cadence and weights
- **WHEN** the client provides `deployment_strategy_config` for `canary`
- **THEN** the system SHALL apply those configuration values to the Flagger analysis/traffic-shifting settings

### Requirement: Canary strategy is rejected when prerequisites are not met
The system SHALL reject `canary` deployments when required prerequisites (traffic router and controllers) are not available for the target environment.

#### Scenario: Canary is rejected when Istio/Flagger support is disabled
- **WHEN** a client requests `canary` in an environment where canary prerequisites are not enabled
- **THEN** the system SHALL return an error describing the missing prerequisite(s) and how to enable them

### Requirement: Strategy configuration is validated per strategy
The system SHALL validate `deployment_strategy_config` against the selected strategy’s schema and SHALL reject invalid configurations with a clear error.

#### Scenario: Canary config is invalid
- **WHEN** a client requests `canary` with a malformed or invalid config (e.g., invalid weights or missing required fields)
- **THEN** the system SHALL return an error indicating which config fields are invalid

### Requirement: Strategy intent is persisted per deployment
The system SHALL persist the final selected `deployment_strategy` and the normalized/validated `deployment_strategy_config` for each API serve deployment.

#### Scenario: Deployment row captures strategy and parameters
- **WHEN** a deployment is created for an API serve
- **THEN** the system SHALL store the chosen `deployment_strategy` and the effective strategy parameters alongside the deployment record

### Requirement: Infra-only redeploy preserves strategy intent
When the system redeploys an already-deployed API serve due to infra configuration changes, it SHALL preserve the previously active deployment’s strategy intent.

#### Scenario: Full rebuild redeploy reuses previous strategy
- **WHEN** an infra update triggers a redeploy and the system performs a full values rebuild
- **THEN** the system SHALL re-apply the previously active deployment’s `deployment_strategy` and strategy parameters when rendering the new values

