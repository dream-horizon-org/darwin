# Post-merge checklist

Steps to complete after a change's PR is merged into the main branch. Run this for every merged change.

---

## Who does this

The author or tech lead who merged the PR.

---

## Steps

### 1. Apply spec deltas to canonical specs

For each capability with spec deltas under `openspec/changes/<change-id>/specs/`:

- [ ] Open `openspec/specs/<capability>/spec.md`
- [ ] Apply ADDED, MODIFIED, and REMOVED markers from the delta file
- [ ] Verify the canonical spec now reflects the merged behavior
- [ ] Commit the updated spec (message: `Update <capability> spec for <change-id>`)

### 2. Archive the change folder

- [ ] Move `openspec/changes/<change-id>/` to `openspec/changes/archive/<change-id>/`
- [ ] Commit the move (message: `Archive change <change-id>`)

### 3. Verify

- [ ] `openspec/specs/<capability>/spec.md` reflects the merged behavior
- [ ] No folder for this change-id remains under `openspec/changes/` (only in `archive/`)
- [ ] The archive contains the complete change record: `proposal.md`, `design.md` (if written), `acceptance.md`, spec deltas

---

## Change lifecycle convention

| Location | Meaning |
|---|---|
| `openspec/changes/<change-id>/` | Active — in progress or awaiting merge |
| `openspec/changes/archive/<change-id>/` | Complete — PR merged, spec applied |

Active changes are in flight. Anything in `archive/` is a historical record only; do not edit.

---

## Why this matters

`openspec/specs/` is the source of truth for future changes. Without this step, canonical specs drift from actual system behavior, and future spec deltas will be based on stale information.
