# Acceptance (test list) standard

How we write the English test list so it maps cleanly to the spec and to test code.

---

## Location

One file per change: `openspec/changes/<change-id>/acceptance.md`.

---

## Structure

- Use the same scenario style as specs: **GIVEN / WHEN / THEN** (and **AND** if needed).
- One scenario = one test case. Give each scenario a short heading so it can be referenced in test code (e.g. `AC-1: Default session timeout`).

Example:

```markdown
## Acceptance scenarios

### AC-1: Default session timeout
- GIVEN a user has authenticated
- WHEN 24 hours pass without activity
- THEN the session token is invalidated
- AND the user is required to re-authenticate

### AC-2: Extended session with remember me
- GIVEN the user checked "Remember me" at login
- WHEN 30 days have passed
- THEN the session token is invalidated
- AND the persistent cookie is cleared
```

---

## Coverage

- The acceptance list **must** cover all acceptance criteria from the spec (or from the change proposal).
- Focus on **behavior and outcomes**, not implementation detail (e.g. avoid "click the submit button"; prefer "when the user submits the form, then …").
- If the spec has multiple requirements or scenarios, ensure each has at least one corresponding acceptance scenario (or justify why one is omitted).

---

## Traceability

- Optional but recommended: give each scenario an id (e.g. `AC-1`, `AC-2`) or a short title. Test code can reference these so we can trace from requirement → acceptance scenario → test.
