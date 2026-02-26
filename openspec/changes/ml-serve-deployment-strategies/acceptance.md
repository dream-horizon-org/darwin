## Acceptance scenarios

### AC-1: Default strategy is rolling
- GIVEN an API serve deployment request omits a deployment strategy
- WHEN the deployment is started
- THEN the system selects the `rolling` strategy

### AC-2: Strategy names are case-insensitive and normalized
- GIVEN an API serve deployment request specifies strategy `ROLLING`
- WHEN the deployment is started
- THEN the system treats the strategy as `rolling`
- AND the system persists the normalized strategy name as `rolling`

### AC-3: Unknown strategy is rejected
- GIVEN an API serve deployment request specifies strategy `banana`
- WHEN the deployment is started
- THEN the system rejects the request
- AND the error message indicates the supported strategies

### AC-4: Rolling strategy accepts optional rollout parameters
- GIVEN an API serve deployment request specifies strategy `rolling`
- AND the request includes optional rolling configuration
- WHEN the deployment is started
- THEN the system accepts the request

### AC-5: Canary strategy missing required configuration is rejected
- GIVEN an API serve deployment request specifies strategy `canary`
- AND the request omits required canary configuration
- WHEN the deployment is started
- THEN the system rejects the request
- AND the error message identifies the missing configuration key(s)

### AC-6: Canary strategy with invalid configuration is rejected
- GIVEN an API serve deployment request specifies strategy `canary`
- AND the request provides canary configuration with invalid values
- WHEN the deployment is started
- THEN the system rejects the request
- AND the error message identifies the invalid configuration field(s)

### AC-7: Strategy and configuration are persisted with the deployment
- GIVEN an API serve deployment is started with strategy `canary` and configuration `C`
- WHEN the system creates the deployment record
- THEN the system persists strategy `canary`
- AND the system persists configuration `C` with the deployment

### AC-8: Rolling deployment performs rolling-update semantics
- GIVEN an API serve has an existing active deployment
- AND a new version is deployed with strategy `rolling`
- WHEN the deployment progresses
- THEN the system performs a rolling update consistent with configured rollout parameters

### AC-9: Canary deployment fails fast without provider prerequisites
- GIVEN an API serve deployment request specifies strategy `canary`
- AND the target environment does not support canary execution
- WHEN the deployment is started
- THEN the system rejects the request
- AND the error message describes the missing prerequisite(s)
- AND the system does not start deployment execution

### AC-10: Canary rollout succeeds and is promoted
- GIVEN an API serve has an existing active deployment
- AND a new version is deployed with strategy `canary`
- AND the target environment supports canary execution
- WHEN the deployment progresses and analysis succeeds
- THEN the system runs the new version alongside the stable version during rollout
- AND the system shifts traffic from stable to canary in configured increments
- AND the system promotes the new version to stable

### AC-11: Canary rollout fails and is rolled back
- GIVEN an API serve has an existing active deployment
- AND a new version is deployed with strategy `canary`
- AND the target environment supports canary execution
- WHEN health evaluation fails beyond the configured threshold during rollout
- THEN the system rolls back to stable
- AND the rollout is marked as failed

### AC-12: Redeploy reuses the last active strategy and configuration when omitted
- GIVEN an API serve has an active deployment with strategy `canary` and configuration `C`
- WHEN a redeploy is initiated without specifying a strategy
- THEN the system uses strategy `canary` with configuration `C`

### AC-13: Redeploy treats unknown stored strategy as rolling
- GIVEN an API serve has an active deployment with a stored strategy name that is unknown
- WHEN a redeploy is initiated without specifying a strategy
- THEN the system treats the strategy as `rolling`

