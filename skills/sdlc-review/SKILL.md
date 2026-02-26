---
name: sdlc-review
description: Review a spec (proposal + deltas), acceptance list, or code changes in the SDLC workflow. Use at the Define checkpoint, Specify tests checkpoint, or optional code-review checkpoint before Ship. Also invoked as a subagent by other phase skills.
---

# SDLC Review

Use this skill when reviewing a spec (proposal + deltas), the acceptance list (`acceptance.md`), or code changes. Can be used directly in the main chat or invoked as a subagent by phase skills. The canonical reference is `docs/sdlc/REVIEW-CHECKLIST.md`.

## Reviewing a spec (Phase 1 checkpoint)

- [ ] **Complete** — All acceptance criteria for the change are captured; no obvious gaps.
- [ ] **Clear** — Requirements are unambiguous; scenarios are readable.
- [ ] **Minimal** — One slice per change; no scope creep or long "and" chains.
- [ ] **Backward compatibility** — If the change touches an API or contract, breaking changes are called out and justified.
- [ ] **GIVEN/WHEN/THEN** — Scenarios use consistent format; no implementation detail in the spec.
- [ ] **Design** — If `design.md` is present: approach is clear, decisions are justified, open questions are noted.

## Reviewing acceptance.md (Phase 2 checkpoint)

- [ ] **Coverage** — Every acceptance criterion from the spec (or proposal) has at least one scenario.
- [ ] **No implementation detail** — Scenarios describe behavior and outcomes, not UI or API mechanics.
- [ ] **Unambiguous** — Each scenario can be turned into a test without guesswork.
- [ ] **Traceable** — Each scenario has an `AC-n` id for reference in test code.

## Reviewing code (optional Phase 4 checkpoint)

- [ ] **Matches spec and acceptance** — Implementation fulfills the requirements and scenarios.
- [ ] **Tests pass** — All tests (including acceptance-based tests) are green.
- [ ] **Edge cases and errors** — Obvious edge cases or error paths are handled or documented.
- [ ] **Security** — No obvious injection, auth bypass, or data exposure issues introduced.

## Report format

When producing a review report (e.g. as a subagent), structure findings as:

- **(a)** Gaps or ambiguities
- **(b)** Suggestions for clarity or completeness
- **(c)** Backward-compatibility or consistency concerns (for spec), or bugs/deviations from spec (for code)

Return only the report; do not edit files unless explicitly asked to fix.
