# Spec standard

How we write specs so they are consistent, reviewable, and usable as the source of truth.

---

## Sections required

Every spec (and every change proposal that affects behavior) should include:

- **Purpose** — One or two sentences: what this capability or change is for.
- **Requirements** — What the system SHALL/MUST do. One requirement per heading.
- **Scenarios (or Behavior)** — GIVEN/WHEN/THEN for each requirement or behavior that needs examples.
- **Out of scope** (optional) — Explicitly what we are not doing in this change.
- **Non-functional** (optional) — Performance, security, or other constraints if relevant.

---

## Requirement format

- Use **SHALL** or **MUST** for mandatory behavior (e.g. "The system SHALL expire sessions after a configured duration.").
- One requirement per heading: `### Requirement: <short name>`.
- Keep each requirement testable and minimal; avoid long "and" chains that balloon scope.

---

## Scenario format

Use the same style for scenarios in specs and in acceptance lists:

- **GIVEN** — Initial context or preconditions.
- **WHEN** — The action or trigger.
- **THEN** — Expected outcome.
- **AND** (optional) — Additional outcomes or steps.

Example:

```markdown
#### Scenario: Default session timeout
- GIVEN a user has authenticated
- WHEN 24 hours pass without activity
- THEN invalidate the session token
- AND require re-authentication
```

One scenario per requirement or per distinct behavior. Scenarios should be implementation-agnostic (behavior and outcomes, not "click the button" or "call API X").

---

## Delta convention

When proposing a **change** to an existing spec, do not rewrite the whole file. Use **deltas** with clear markers:

- **ADDED** — New requirement or scenario (prefix lines with `+` or mark section as ADDED).
- **MODIFIED** — Changed wording or behavior (show before/after or mark as MODIFIED).
- **REMOVED** — Deleted requirement or scenario (prefix with `-` or mark as REMOVED).

Example (diff-style):

```markdown
### Requirement: Session expiration
- The system SHALL expire sessions after a configured duration.
+ The system SHALL support configurable session expiration periods.

#### Scenario: Default session timeout
- GIVEN a user has authenticated
- - WHEN 24 hours pass without activity
+ - WHEN 24 hours pass without "Remember me"
- THEN invalidate the session token
+ #### Scenario: Extended session with remember me
+ - GIVEN user checks "Remember me" at login
+ - WHEN 30 days have passed
+ - THEN invalidate the session token
```

Store deltas under `openspec/changes/<change-id>/specs/<capability>/spec.md`. The canonical current spec lives in `openspec/specs/<capability>/spec.md`; when the change is merged, apply the deltas there.

---

## Principles

- **Minimal:** One slice per change. Human-reviewable. No "and" chains that grow scope.
- **Traceability:** Reference ticket or change-id in the proposal where useful.
- **Backward compatibility:** For APIs or contracts, consider compatibility at design time; call out breaking changes explicitly in the proposal.
