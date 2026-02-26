# Review checklist

Quick checklist for humans (or agents) when reviewing spec, acceptance list, or code.

---

## Reviewing a spec (or proposal + deltas)

- [ ] **Complete** — All acceptance criteria for the change are captured; no obvious gaps.
- [ ] **Clear** — Requirements are unambiguous; scenarios are readable.
- [ ] **Minimal** — One slice per change; no scope creep or long "and" chains.
- [ ] **Backward compatibility** — If the change touches an API or contract, breaking changes are called out and justified.
- [ ] **GIVEN/WHEN/THEN** — Scenarios use consistent format; no implementation detail in the spec.

---

## Reviewing acceptance.md

- [ ] **Coverage** — Every acceptance criterion from the spec (or proposal) has at least one scenario.
- [ ] **No implementation detail** — Scenarios describe behavior and outcomes, not UI or API mechanics.
- [ ] **Unambiguous** — Each scenario can be turned into a test without guesswork.

---

## Reviewing code (optional checkpoint before Ship)

- [ ] **Matches spec and acceptance** — Implementation fulfills the requirements and scenarios.
- [ ] **Tests pass** — All tests (including the new acceptance-based tests) are green.
- [ ] **Edge cases and errors** — Obvious edge cases or error paths are handled or documented.
