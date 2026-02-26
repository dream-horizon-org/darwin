# PR and ship standard

How we name branches, write commit messages, and structure PR descriptions so changes are consistent and traceable.

---

## Branch naming

- **Pattern:** `feature/<change-id>-short-name` or `fix/<change-id>-short-name`.
- **Example:** `feature/CATALOG-42-add-validation`, `fix/add-remember-me-session-cookie`.

Use the same `change-id` as in `openspec/changes/<change-id>/`.

---

## Commit message

- **Subject line:** Short, imperative (e.g. "Add session expiration configuration").
- **Body (optional):** One line: `Refs: <change-id>` or `Refs: <ticket>`.

Example:

```
Add configurable session expiration

Refs: add-remember-me
```

---

## PR description template

Use this structure when drafting the PR (e.g. in the Ship phase):

```markdown
## Summary
<1–3 sentences: what was built and why>

## Change ID / Ticket
<e.g. CATALOG-42 or add-remember-me>

## Spec
- Proposal: `openspec/changes/<change-id>/proposal.md`
- Spec deltas: `openspec/changes/<change-id>/specs/`

## Acceptance
- `openspec/changes/<change-id>/acceptance.md`

## What to review
- [ ] Behavior matches spec and acceptance scenarios
- [ ] Tests pass
- [ ] No obvious regressions or missing edge cases

## Testing notes
<Manual testing or deployment notes if any>
```

---

## Change summary (for Ship phase)

When producing the change summary in Phase 5, include:

- What was built (short).
- Which capabilities/specs changed (paths or names).
- Which acceptance scenarios were added/updated (list or reference to acceptance.md).
- Any manual testing or deployment notes.

This summary can be pasted into the PR description or used for handoff.
