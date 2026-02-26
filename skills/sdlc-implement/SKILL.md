---
name: sdlc-implement
description: Run Phase 4 (Implement) of the SDLC workflow — implement the feature so acceptance-based tests pass (TDD green). Use when the user asks to implement, proceed to Phase 4, or make tests green.
---

# SDLC Phase 4: Implement

Run Phase 4 of the spec-driven workflow. Implements production code until all acceptance-based tests pass.

## Steps

1. Determine the **change-id** from context or from `openspec/changes/`.
2. Read `openspec/changes/<change-id>/acceptance.md`, the spec deltas, and `design.md` if present.
3. Implement production code so acceptance-based tests pass. Use the spec and acceptance scenarios as the definition of done.
4. Run the project's test command (e.g. `npm test`, `mvn test`, `pytest`). Fix failures and re-run until green.
5. Run the optional code review subagent (see below) and present the report to the user.
6. Stop and ask whether to proceed to Ship or iterate.

## Subagents

### Run-and-fix subagent prompt

> In this project, run the test command (use `npm test`, `mvn test`, `pytest`, or the project's standard test command). If any tests fail, edit the relevant production code to fix the failures, then re-run. Repeat until all tests pass or you cannot fix further. Return a brief summary: whether tests are green, and if not, which failures remain and what was attempted.

### Code review subagent prompt

> You are reviewing code changes for an SDLC workflow. Read the current git diff (or the changed files) for the change at `openspec/changes/<change-id>/`. Using the spec (proposal + spec deltas), `openspec/changes/<change-id>/acceptance.md`, and `docs/sdlc/REVIEW-CHECKLIST.md`, produce a short report: (a) potential bugs or edge cases, (b) deviations from the spec or acceptance criteria, (c) suggested improvements. Return only the report; do not edit files.
