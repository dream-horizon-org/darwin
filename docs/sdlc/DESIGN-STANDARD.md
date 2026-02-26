# Design standard

When to write a technical design document, what it should contain, and how to keep it useful.

---

## When to write one

`design.md` is **optional**. Write one when the change involves:

- A non-obvious technical approach (e.g. choosing between patterns, data models, or libraries)
- Significant trade-offs that reviewers should understand before reviewing code
- Constraints not evident from the spec (e.g. performance budgets, backward-compatibility requirements, third-party limitations)

Skip it for straightforward changes where the spec implies the implementation clearly.

---

## Sections

- **Approach** — One paragraph: how this change will be built. Implementation-facing (the spec says *what*; design says *how*).
- **Decisions** — Key technical choices and rationale. One per bullet or heading.
- **Alternatives considered** (optional) — What was rejected and why.
- **Constraints** (optional) — Technical constraints that shaped the approach.
- **Open questions** (optional) — Unresolved technical questions at time of writing; note when they must be resolved.

---

## Format

```markdown
# Design — <change-id>

## Approach
<One paragraph: how this will be built.>

## Decisions
- **<Decision name>:** <Rationale.>
- **<Decision name>:** <Rationale.>

## Alternatives considered
- **<Alternative>:** Rejected because <reason>.

## Constraints
- <Constraint and its impact on the approach.>

## Open questions
- <Question> — to be resolved before/during Phase 4.
```

---

## Principles

- **Brief:** A design doc is a decision record, not an essay. If it exceeds one page, it's probably too detailed.
- **Separate from spec:** Reference `proposal.md` and spec deltas for behavior; `design.md` covers implementation approach only.
- **Living:** Update it when significant decisions change during implementation. Stale design docs are worse than none.
- **Reviewed at Phase 1 checkpoint:** If written, reviewers should check it alongside the spec before approving.
