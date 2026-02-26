---
name: sdlc-specify-tests
description: Run Phase 2 (Specify tests) of the SDLC workflow — write the English acceptance scenarios for the current change. Use when the user asks to specify tests, write acceptance criteria, or proceed to Phase 2.
---

# SDLC Phase 2: Specify tests

Run Phase 2 of the spec-driven workflow. Writes the English acceptance scenarios that become test cases. Stops for human review before proceeding to Phase 3.

## Steps

1. Determine the **change-id** from context or from `openspec/changes/`.
2. Read `openspec/changes/<change-id>/proposal.md` and spec deltas at `openspec/changes/<change-id>/specs/`.
3. Create or update `openspec/changes/<change-id>/acceptance.md` with GIVEN/WHEN/THEN scenarios. One scenario = one test case. Give each an id: `AC-1`, `AC-2`, etc.
4. Ensure every acceptance criterion in the spec has at least one corresponding scenario.
5. Follow `docs/sdlc/ACCEPTANCE-STANDARD.md`.
6. Run the subagent review (see below) and present the report to the user.
7. **Checkpoint:** Stop and ask for human review. Do not proceed to Phase 3 until the user approves or gives feedback.

## Rules

- Focus on **behavior and outcomes**, not implementation detail (avoid "click the button"; prefer "when the user submits the form, then…").
- Scenario ids (`AC-1`, `AC-2`, etc.) enable traceability from requirement → acceptance scenario → test code.
- Reference the full standard: `docs/sdlc/ACCEPTANCE-STANDARD.md`.

## Subagent review prompt

> You are reviewing an acceptance test list for an SDLC workflow. Read: (1) the change proposal and spec deltas at `openspec/changes/<change-id>/`, (2) `openspec/changes/<change-id>/acceptance.md`. Using `docs/sdlc/ACCEPTANCE-STANDARD.md` and `docs/sdlc/REVIEW-CHECKLIST.md`, produce a short report: (a) scenarios missing relative to the spec's acceptance criteria, (b) redundant or overlapping scenarios, (c) unclear or implementation-coupled wording. Return only the report; do not edit files.
