---
name: sdlc-define
description: Run Phase 1 (Define) of the SDLC workflow — create the change proposal, optional design doc, and spec deltas. Use when the user asks to define, start, or spec out a change.
---

# SDLC Phase 1: Define

Run Phase 1 of the spec-driven workflow. Creates the change proposal, optional technical design, and spec deltas. Stops for human review before proceeding to Phase 2.

## Steps

1. Determine the **change-id**: use the ticket id (e.g. `CATALOG-42`) or a kebab-case feature name (e.g. `add-remember-me`).
2. Create or update `openspec/changes/<change-id>/proposal.md` — what we're changing and why, and which capability is affected.
3. Create or update spec deltas at `openspec/changes/<change-id>/specs/<capability>/spec.md` using ADDED/MODIFIED/REMOVED markers. If the capability spec does not exist, create `openspec/specs/<capability>/spec.md`; the change folder holds deltas only.
4. **Optional:** If the change involves non-obvious technical decisions, create `openspec/changes/<change-id>/design.md`. Follow `docs/sdlc/DESIGN-STANDARD.md`.
5. Follow `docs/sdlc/SPEC-STANDARD.md` for spec format and GIVEN/WHEN/THEN scenarios.
6. Run the subagent review (see below) and present the report to the user.
7. **Checkpoint:** Stop and ask for human review. Do not proceed to Phase 2 until the user approves or gives feedback.

## Rules

- One requirement per heading: `### Requirement: <short name>`. Use **SHALL** or **MUST** for mandatory behavior.
- Scenarios must be implementation-agnostic — describe behavior and outcomes, not UI or API mechanics.
- One slice per change. No scope creep. Call out breaking changes explicitly.
- Reference the full standard: `docs/sdlc/SPEC-STANDARD.md`.

## Subagent review prompt

> You are reviewing a spec change for an SDLC workflow. Read: (1) the change proposal at `openspec/changes/<change-id>/proposal.md`, (2) the spec deltas at `openspec/changes/<change-id>/specs/`, (3) the current canonical spec at `openspec/specs/<capability>/spec.md` if it exists, (4) `openspec/changes/<change-id>/design.md` if it exists. Using `docs/sdlc/SPEC-STANDARD.md` and `docs/sdlc/REVIEW-CHECKLIST.md` as reference, produce a short report: (a) gaps or ambiguities in the spec, (b) suggestions for clarity or completeness, (c) backward-compatibility or consistency concerns. Return only the report; do not edit files.
