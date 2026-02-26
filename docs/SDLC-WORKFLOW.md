# SDLC Workflow: Spec-Driven, Tool-Agnostic

This project uses a **spec-driven SDLC**: every change is defined by a spec (or change proposal with deltas) and an English acceptance list before any production code is written. Human review happens at defined checkpoints. The workflow and standards live in this repo so **any dev and any IDE/agent** (Cursor, Claude, etc.) can follow the same process.

---

## Artifact locations

| What | Where |
|------|--------|
| **Current specs** (source of truth) | `openspec/specs/<capability>/spec.md` — one folder per capability (e.g. `auth-session`, `catalog-api`) |
| **Active change** | `openspec/changes/<change-id>/` — one folder per in-flight change |
| **Archived change** | `openspec/changes/archive/<change-id>/` — moved here after PR merge and spec applied |
| **Inside a change** | `proposal.md` (what & why), `design.md` (optional technical decisions), `acceptance.md` (English test list), `specs/<capability>/spec.md` (spec deltas: ADDED/MODIFIED/REMOVED) |
| **Workflow & standards** | `docs/SDLC-WORKFLOW.md` (this file), `docs/sdlc/SPEC-STANDARD.md`, `ACCEPTANCE-STANDARD.md`, `DESIGN-STANDARD.md`, `PR-STANDARD.md`, `REVIEW-CHECKLIST.md`, `MERGE-CHECKLIST.md` |
| **Skills** | `skills/sdlc-define/`, `skills/sdlc-specify-tests/`, `skills/sdlc-implement-tests/`, `skills/sdlc-implement/`, `skills/sdlc-ship/`, `skills/sdlc-review/` |

---

## Phases (detailed)

### Phase 1: Define

**Input:** User's request (and optionally a ticket id or change-id).

**Actions:**

1. Determine or create a **change-id** (e.g. ticket id or kebab-case feature name).
2. Create or update `openspec/changes/<change-id>/proposal.md` — what we're changing and why.
3. Create or update spec deltas under `openspec/changes/<change-id>/specs/<capability>/spec.md`. Use ADDED/MODIFIED/REMOVED markers (see `docs/sdlc/SPEC-STANDARD.md`). If the capability doesn't exist yet, create `openspec/specs/<capability>/spec.md`; the change only holds deltas.
4. **Optional:** If the change involves non-obvious technical decisions, create `openspec/changes/<change-id>/design.md` (see `docs/sdlc/DESIGN-STANDARD.md`).
5. Follow `docs/sdlc/SPEC-STANDARD.md` for format and GIVEN/WHEN/THEN.

**Output:** `proposal.md`, spec deltas, and optionally `design.md`.

**Checkpoint:** Stop and ask for human review. Do not proceed to Phase 2 until the user approves or gives feedback.

**Next phase:** Specify tests.

---

### Phase 2: Specify tests

**Input:** Approved spec (proposal + deltas, and design if written) for the current change.

**Actions:**

1. Read the change at `openspec/changes/<change-id>/` (proposal, spec deltas).
2. Create or update `openspec/changes/<change-id>/acceptance.md` with scenarios in GIVEN/WHEN/THEN form. One scenario = one test case. Give each an id: `AC-1`, `AC-2`, etc.
3. Follow `docs/sdlc/ACCEPTANCE-STANDARD.md`. Ensure coverage of all acceptance criteria from the spec/proposal.

**Output:** `acceptance.md`.

**Checkpoint:** Stop and ask for human review. Do not proceed to Phase 3 until the user approves or gives feedback.

**Next phase:** Implement tests.

---

### Phase 3: Implement tests

**Input:** Approved `acceptance.md` for the current change.

**Actions:**

1. Read `openspec/changes/<change-id>/acceptance.md`.
2. Write **test code only** (no production implementation beyond stubs). Use the project's test framework and style. Tests should **fail (red)** because production behavior is not implemented yet.
3. Map each AC scenario id to one or more test cases. Reference the AC id in the test name or comment.
4. Ensure every test has real assertions — no empty test bodies.

**Output:** Test files in the repo (red).

**Checkpoint:** None. Report that Phase 3 is done; user confirms red by running tests.

**Next phase:** Implement.

---

### Phase 4: Implement

**Input:** Acceptance-based tests (red), spec/proposal, and design doc (if written).

**Actions:**

1. Implement the feature so that the acceptance-based tests pass.
2. Run the project's test command (e.g. `mvn test`, `npm test`). Fix failures and re-run until **green**.
3. (Optional) Before Ship: run a code-review step and present the report.

**Output:** Production code; tests green.

**Checkpoint:** Optional — human code review before Ship. Then ask whether to proceed to Ship or iterate.

**Next phase:** Ship.

---

### Phase 5: Ship

**Input:** Implemented change (tests green), spec, and acceptance list.

**Actions:**

1. Read `docs/sdlc/PR-STANDARD.md`.
2. Produce: (1) short **change summary**, (2) suggested **branch name**, (3) suggested **commit message**, (4) **PR description** using the PR template. Do **not** run `git push` or create the PR in the host (GitHub/GitLab); the human does that.
3. Remind the user to run the post-merge checklist (`docs/sdlc/MERGE-CHECKLIST.md`) after the PR is merged.

**Output:** Text for the user to paste (branch name, commit message, PR description).

**Checkpoint:** Human performs final review and merge in the host.

---

### Post-merge: Apply and archive

**Input:** Merged PR.

**Actions:** Follow `docs/sdlc/MERGE-CHECKLIST.md`:

1. Apply spec deltas to canonical specs in `openspec/specs/`.
2. Move the change folder to `openspec/changes/archive/<change-id>/`.

**Output:** Canonical specs updated; change archived.

---

## Checkpoint rules

- **Define** and **Specify tests:** Always stop for human review. Do not advance until the user approves or gives feedback.
- **Implement:** Optional code review before Ship; then user decides to proceed to Ship or iterate.
- **Ship:** Human pushes branch, opens PR, and does final review/merge.
- **Post-merge:** Human applies spec deltas and archives the change folder.

---

## Change lifecycle

| State | Location |
|---|---|
| In progress | `openspec/changes/<change-id>/` |
| Merged and complete | `openspec/changes/archive/<change-id>/` |

Active changes live in `openspec/changes/`. Once the PR is merged and the post-merge checklist is complete, move the folder to `openspec/changes/archive/`. Do not edit archived changes.

---

## How to use this (per tool)

- **Cursor:** Use the slash commands `/sdlc-define`, `/sdlc-specify-tests`, `/sdlc-implement-tests`, `/sdlc-implement`, `/sdlc-ship`. Each command loads the corresponding phase skill and stops at checkpoints as above.
- **Claude Code:** Use `/sdlc-define`, `/sdlc-specify-tests`, `/sdlc-implement-tests`, `/sdlc-implement`, `/sdlc-ship` skills directly. `CLAUDE.md` provides always-on context.
- **Other tools:** Point your project instructions at this file and at `docs/sdlc/*.md`. Run phases by name (e.g. "Do Phase 1: Define") and follow the steps and checkpoint rules above.
