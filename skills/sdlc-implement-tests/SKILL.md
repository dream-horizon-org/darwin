---
name: sdlc-implement-tests
description: Run Phase 3 (Implement tests) of the SDLC workflow — write failing test code from the approved acceptance scenarios (TDD red). Use when the user asks to implement tests or proceed to Phase 3.
---

# SDLC Phase 3: Implement tests

Run Phase 3 of the spec-driven workflow. Writes test code from the approved acceptance scenarios. Tests must fail (red) before proceeding to implementation.

## Steps

1. Determine the **change-id** from context or from `openspec/changes/`.
2. Read `openspec/changes/<change-id>/acceptance.md`.
3. Write **test code only** — no production implementation beyond the minimal stubs needed for compilation. Use the project's test framework and conventions.
4. Map each acceptance scenario (`AC-1`, `AC-2`, etc.) to one or more test cases. Reference the AC id in the test name or a comment for traceability.
5. Report Phase 3 complete. Suggest the user runs the test command to confirm red before proceeding to Phase 4.

## Test quality rules

- Every AC scenario must have at least one corresponding test.
- Tests must have real assertions — no empty test bodies or assertion-free stubs.
- Test names should reflect the scenario (e.g. `test_session_expires_after_24h_inactivity`).
- Do not write production logic. If a stub is needed to compile, write the minimal interface only.

## No checkpoint

Phase 3 has no human checkpoint. The user confirms red by running tests and then proceeds to Phase 4.
