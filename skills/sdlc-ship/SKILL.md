---
name: sdlc-ship
description: Run Phase 5 (Ship) of the SDLC workflow — draft the branch name, commit message, PR description, and change summary. Use when the user asks to ship, prepare a PR, or proceed to Phase 5.
---

# SDLC Phase 5: Ship

Run Phase 5 of the spec-driven workflow. Produces all PR and shipping materials for the human to push and open. Does not push or create the PR itself.

## Steps

1. Determine the **change-id** from context or from `openspec/changes/`.
2. Read `openspec/changes/<change-id>/proposal.md`, `acceptance.md`, and the spec deltas.
3. Produce and present to the user:
   - **Suggested branch name** — `feature/<change-id>-short-name` or `fix/<change-id>-short-name`
   - **Suggested commit message** — imperative subject line + optional `Refs: <change-id>` body line
   - **PR description** — using the template below
   - **Change summary** — what was built, which specs changed, which ACs were added/updated
4. Do **not** run `git push` or create the PR. Provide the text; the human pushes and opens the PR.
5. Remind the user to run `docs/sdlc/MERGE-CHECKLIST.md` after the PR is merged.

Follow `docs/sdlc/PR-STANDARD.md` for full conventions.

## PR description template

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
