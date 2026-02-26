# SDLC Implementation Plan: Spec-Driven, Tool-Agnostic Workflow

This document is the single plan for implementing the spec-driven SDLC workflow. **Layer 1** is repo-based and works with any IDE/agent (Cursor, Claude, etc.). **Layer 2** is Cursor-specific glue. 

---

## 1. Overview

### 1.1 Goals

- **Spec as contract:** Every change traces to a spec; no code without an agreed spec and test list.
- **Human checkpoints:** Review at Define (spec), Specify tests (English list), and optionally before Ship (code).
- **Tool-agnostic core:** Workflow, standards, and artifacts live in the repo; any agent can follow them.
- **Cursor/Claude parity:** Same standards and flow; only the way you trigger phases differs per tool.

### 1.2 Phases (high level)

| Phase | What happens | Checkpoint? | Main artifacts |
|-------|----------------|-------------|-----------------|
| **Define** | Create/update spec (or change proposal + deltas) from the user's request. | Yes — human reviews | Spec or proposal + spec deltas |
| **Specify tests** | From spec, produce English test list (Given/When/Then or scenarios). | Yes — human reviews | Acceptance / test list doc |
| **Implement tests** | Write test code from the list; no production code yet (TDD, red). | No | Test files |
| **Implement** | Implement until tests go green. | Optional — code review | Production code |
| **Ship** | Draft change summary, branch name, commit message, PR description. Human pushes and opens PR. | Yes — human does final review/merge | PR description + summary |

### 1.3 Design choices

- **Spec model:** OpenSpec-style **living specs** + **change proposals** with **deltas** (ADDED/MODIFIED/REMOVED). Keeps "current truth" in `specs/` and "what we're changing" in `changes/<id>/`.
- **Single workflow doc:** One canonical `SDLC-WORKFLOW.md` that any tool can follow.
- **Standards as repo docs:** Spec format, acceptance format, and PR format live in `docs/sdlc/` as markdown so Cursor and Claude both read the same files.
- **Cursor layer:** Slash commands and one rule that reference the workflow and standards; no workflow logic in Cursor-specific format.

---

## 2. Layer 1 — Tool-agnostic (repo-based)

All of this lives in the repo. No Cursor-, Claude-, or IDE-specific paths. Any agent is instructed to "follow docs/SDLC-WORKFLOW.md and the standards in docs/sdlc/."

### 2.1 Directory and file layout

```
docs/
  SDLC-WORKFLOW.md              # Canonical workflow (phases, checkpoints, artifact locations)
  sdlc/
    SPEC-STANDARD.md             # How we write specs (sections, format, GIVEN/WHEN/THEN)
    ACCEPTANCE-STANDARD.md       # How we write the English test list
    PR-STANDARD.md               # Branch naming, commit message, PR template
    REVIEW-CHECKLIST.md          # Optional: what to check when reviewing spec / tests / code

openspec/                        # Or docs/sdlc/artifacts/ — same structure
  specs/                         # Current source of truth, one folder per capability/area
    <capability>/                # e.g. auth-session, catalog-api
      spec.md
  changes/                       # Active change proposals (one per ticket/feature)
    <change-id>/                 # e.g. CATALOG-42, add-remember-me
      proposal.md                # What we're changing and why
      design.md                  # Technical decisions (optional)
      tasks.md                   # Implementation task list
      acceptance.md              # English test list (Given/When/Then) — our addition
      specs/                     # Spec deltas only (what's ADDED/MODIFIED/REMOVED)
        <capability>/
          spec.md                # Delta content, not full spec
  archive/                        # Optional: completed change ids for reference
```

**Naming:**

- `change-id`: ticket id (e.g. `CATALOG-42`) or kebab-case feature name (e.g. `add-remember-me`).
- `capability`: functional area (e.g. `auth-session`, `catalog-api`, `checkout-cart`).

### 2.2 File-by-file specification (Layer 1)

#### 2.2.1 `docs/SDLC-WORKFLOW.md`

**Purpose:** The single canonical description of the SDLC. Every agent and every human follows this.

**Contents (to be written):**

1. **Introduction**
   - One paragraph: spec as contract, human checkpoints, tool-agnostic.
   - Who this is for (all devs, any IDE/agent).

2. **Artifact locations**
   - Table or list: where specs live (`openspec/specs/<capability>/spec.md`), where changes live (`openspec/changes/<change-id>/`), what each file in a change contains (proposal, design, tasks, acceptance, specs/ deltas).

3. **Phases (detailed)**
   - For each phase:
     - **Name** (Define / Specify tests / Implement tests / Implement / Ship).
     - **Input:** What you need (e.g. user request, approved spec, approved acceptance list).
     - **Actions:** Step-by-step what to do (e.g. "Create or update openspec/changes/<id>/proposal.md and openspec/changes/<id>/specs/... with deltas. Follow docs/sdlc/SPEC-STANDARD.md.").
     - **Output:** Which files are created/updated.
     - **Checkpoint:** "Stop and ask for human review. Do not proceed until the user approves or gives feedback."
     - **Next phase:** What comes after (e.g. after Define → Specify tests).

4. **Checkpoint rules**
   - At Define and Specify tests: always stop for review.
   - At Implement: optional code review before Ship.
   - At Ship: human pushes branch and opens PR; human does final review/merge.

5. **How to use this (per tool)**
   - Short section: "In Cursor, use the slash commands (e.g. /sdlc-define). In Claude (or other tools), refer to this doc by phase name (e.g. 'Do Phase 1: Define') and follow the steps."

**Format:** Markdown, clear headings, no tool-specific logic—only phases, paths, and checkpoint behavior.

---

#### 2.2.2 `docs/sdlc/SPEC-STANDARD.md`

**Purpose:** How we write specs so they are consistent and reviewable.

**Contents (to be written):**

1. **Sections required**
   - e.g. Purpose, Requirements, Scenarios (or Behavior), Out of scope, Non-functional (if needed).
2. **Requirement format**
   - One requirement per heading; use "SHALL" or "MUST" for mandatory behavior; optional use of EARS (Easy Approach to Requirements Syntax) or similar.
3. **Scenario format**
   - GIVEN / WHEN / THEN (and optionally AND). One scenario per requirement or per behavior.
4. **Delta convention**
   - When proposing a change, mark lines/sections as ADDED, MODIFIED, or REMOVED (OpenSpec-style).
5. **Principles**
   - Minimal: one slice per change; human-reviewable; no "and" chains that balloon scope.
   - References: link to ticket or change-id where useful.

**Format:** Markdown; examples optional but helpful.

---

#### 2.2.3 `docs/sdlc/ACCEPTANCE-STANDARD.md`

**Purpose:** How we write the English test list (acceptance scenarios) so they map cleanly to specs and to test code.

**Contents (to be written):**

1. **Location**
   - One file per change: `openspec/changes/<change-id>/acceptance.md`.
2. **Structure**
   - Same scenario style as specs: GIVEN / WHEN / THEN (and AND). One scenario = one test case.
3. **Coverage**
   - Must cover all acceptance criteria from the spec (or from the proposal); no implementation detail (e.g. "click button X"); focus on behavior and outcomes.
4. **Traceability**
   - Optional: scenario id or short title that can be referenced in test code (e.g. `AC-1: Default session timeout`).

**Format:** Markdown; one or two short examples.

---

#### 2.2.4 `docs/sdlc/PR-STANDARD.md`

**Purpose:** How we name branches, write commit messages, and structure PR descriptions so PRs are consistent and traceable.

**Contents (to be written):**

1. **Branch naming**
   - Pattern: e.g. `feature/<change-id>-short-name` or `fix/<change-id>-short-name`. Example: `feature/CATALOG-42-add-validation`.
2. **Commit message**
   - Short subject line; optional body with "Refs: <change-id>" or "Refs: <ticket>".
3. **PR description template**
   - Sections: Summary, Change ID / Ticket, Spec (link or path), Acceptance (link or path), What to review (checklist), Testing notes.
4. **Change summary (for Ship phase)**
   - What was built, which capabilities/specs changed, which acceptance scenarios were added/updated, and any manual testing or deployment notes.

**Format:** Markdown; copy-pasteable template snippet.

---

#### 2.2.5 `docs/sdlc/REVIEW-CHECKLIST.md` (optional)

**Purpose:** Quick checklist for humans (or agents) when reviewing spec, test list, or code.

**Contents (to be written):**

1. **Reviewing a spec (or proposal + deltas)**
   - Complete? Clear? Minimal? Backward-compatible (if API)? GIVEN/WHEN/THEN consistent?
2. **Reviewing acceptance.md**
   - Covers all acceptance criteria? No implementation detail? Unambiguous?
3. **Reviewing code (optional checkpoint)**
   - Matches spec and acceptance? Tests pass? Obvious edge cases or error handling missing?

**Format:** Short bullet lists.

---

#### 2.2.6 Example spec and example change (scaffolding)

**Purpose:** So the structure is clear and agents have a pattern to follow.

**Files:**

- `openspec/specs/_example/spec.md` — One minimal example spec (one capability, one requirement, one scenario). Comment at top: "Example only; delete or replace when adding real capabilities."
- `openspec/changes/_example/` — One minimal example change:
  - `proposal.md` — One paragraph + link to example spec.
  - `acceptance.md` — One or two GIVEN/WHEN/THEN scenarios.
  - `tasks.md` — Two or three placeholder tasks.
  - `specs/_example/spec.md` — One delta (e.g. one ADDED scenario).

These are templates; real work uses new capability names and change-ids.

---

### 2.3 Layer 1 file list (summary)

| Path | Purpose |
|------|---------|
| `docs/SDLC-WORKFLOW.md` | Canonical workflow: phases, checkpoints, artifact locations |
| `docs/sdlc/SPEC-STANDARD.md` | How we write specs and deltas |
| `docs/sdlc/ACCEPTANCE-STANDARD.md` | How we write the English test list |
| `docs/sdlc/PR-STANDARD.md` | Branch naming, commit message, PR template, change summary |
| `docs/sdlc/REVIEW-CHECKLIST.md` | Optional review checklist for spec / acceptance / code |
| `openspec/specs/_example/spec.md` | Example spec (template) |
| `openspec/changes/_example/proposal.md` | Example proposal |
| `openspec/changes/_example/acceptance.md` | Example acceptance list |
| `openspec/changes/_example/tasks.md` | Example tasks |
| `openspec/changes/_example/specs/_example/spec.md` | Example spec delta |

Directories to create: `docs/sdlc/`, `openspec/specs/`, `openspec/changes/`, `openspec/specs/_example/`, `openspec/changes/_example/specs/_example/`. Optional: `openspec/archive/`.

---

## 3. Layer 2 — Cursor-specific

Cursor-only. Other tools ignore these or use their own instructions that point at Layer 1.

### 3.1 Cursor rule (one file)

**Path:** `.cursor/rules/sdlc-workflow.mdc`

**Purpose:** Always-on context so the agent knows the SDLC exists and where to look.

**Contents (to be written):**

- **Frontmatter:** `description`, `alwaysApply: true` (or `globs` if you prefer file-scoped).
- **Body:**
  - One short paragraph: this project uses a spec-driven SDLC; workflow and standards are in the repo.
  - Paths: workflow = `docs/SDLC-WORKFLOW.md`; standards = `docs/sdlc/*.md`; artifacts = `openspec/specs/` and `openspec/changes/<id>/`.
  - Rule: at Define and Specify tests, always stop and ask for human review; do not advance until the user approves or gives feedback.
  - Optional: when the user says "define", "specify tests", "implement tests", "implement", or "ship", follow the corresponding phase from the workflow doc.

**Format:** Markdown with YAML frontmatter (Cursor rule format).

---

### 3.2 Cursor slash commands (one file per phase)

**Directory:** `.cursor/commands/`

Each command is a single markdown file. The file name becomes the command name (e.g. `sdlc-define.md` → `/sdlc-define`).

**Convention:** Each command (1) states the phase, (2) tells the agent to read the workflow doc and the relevant standard, (3) tells the agent to perform the phase and then stop for review where specified.

---

#### 3.2.1 `.cursor/commands/sdlc-define.md`

**Purpose:** Run Phase 1: Define (create/update spec or change proposal + deltas).

**Contents (to be written):**

- Title: e.g. "SDLC Phase 1: Define"
- Instruction: Read `docs/SDLC-WORKFLOW.md` (Phase 1) and `docs/sdlc/SPEC-STANDARD.md`.
- From the user's request (and any ticket/change-id they give), create or update the change in `openspec/changes/<change-id>/`: `proposal.md`, and under `specs/` the spec deltas. If the capability doesn't exist yet, create `openspec/specs/<capability>/spec.md` as needed; for the change, only add deltas under `changes/<id>/specs/<capability>/spec.md`.
- Follow SPEC-STANDARD for format and GIVEN/WHEN/THEN.
- **Subagent (optional):** After updating, launch the **Spec review** subagent with the prompt in section 3.3 (filling in &lt;change-id&gt; and &lt;capability&gt;). Present the subagent’s report to the user.
- After that (or if not using the subagent), stop and ask for human review. Do not proceed to Specify tests until the user approves or gives feedback.

---

#### 3.2.2 `.cursor/commands/sdlc-specify-tests.md`

**Purpose:** Run Phase 2: Specify tests (English test list).

**Contents (to be written):**

- Title: "SDLC Phase 2: Specify tests"
- Instruction: Read `docs/SDLC-WORKFLOW.md` (Phase 2) and `docs/sdlc/ACCEPTANCE-STANDARD.md`.
- From the current change (proposal + spec deltas in `openspec/changes/<id>/`), create or update `openspec/changes/<id>/acceptance.md` with scenarios in GIVEN/WHEN/THEN form.
- Follow ACCEPTANCE-STANDARD. Ensure full coverage of acceptance criteria.
- **Subagent (optional):** After updating, launch the **Acceptance review** subagent with the prompt in section 3.3 (filling in &lt;change-id&gt;). Present the subagent’s report to the user.
- After that (or if not using the subagent), stop and ask for human review. Do not proceed to Implement tests until the user approves or gives feedback.

---

#### 3.2.3 `.cursor/commands/sdlc-implement-tests.md`

**Purpose:** Run Phase 3: Implement tests (TDD, red).

**Contents (to be written):**

- Title: "SDLC Phase 3: Implement tests"
- Instruction: Read `docs/SDLC-WORKFLOW.md` (Phase 3).
- From `openspec/changes/<id>/acceptance.md`, write test code only (no production implementation beyond stubs). Tests should fail (red). Use the project's test framework and style.
- Do not implement production code yet. Stop after tests are written and report that Phase 3 is done; user can run tests to confirm red.

---

#### 3.2.4 `.cursor/commands/sdlc-implement.md`

**Purpose:** Run Phase 4: Implement (make tests green).

**Contents (to be written):**

- Title: "SDLC Phase 4: Implement"
- Instruction: Read `docs/SDLC-WORKFLOW.md` (Phase 4).
- Implement the feature so that the acceptance-based tests pass.
- **Subagent (optional):** Delegate “run test command; if failures, fix and re-run until green” to the **Run tests and fix** subagent (prompt in section 3.3). If the subagent reports green, continue. If it reports remaining failures, surface them or try to fix in the main chat. If not using the subagent, run the test command in the main chat and fix until green.
- **Subagent (optional):** After tests are green, launch the **Code review** subagent (prompt in section 3.3) and present its report to the user for the optional code-review checkpoint.
- After that, stop and ask whether to proceed to Ship or iterate. Or proceed to Ship if the user prefers.

---

#### 3.2.5 `.cursor/commands/sdlc-ship.md`

**Purpose:** Run Phase 5: Ship (draft summary and PR; human pushes and opens PR).

**Contents (to be written):**

- Title: "SDLC Phase 5: Ship"
- Instruction: Read `docs/SDLC-WORKFLOW.md` (Phase 5) and `docs/sdlc/PR-STANDARD.md`.
- Produce: (1) short change summary, (2) suggested branch name, (3) suggested commit message, (4) PR description (using PR-STANDARD template). Do not run git push or create the PR; tell the user to push and open the PR manually, and optionally paste the PR description.

---

### 3.3 Cursor subagents

Subagents are used for focused, bounded tasks so the main chat stays clean and each task has clear context. The **main agent** (the chat running the slash command) invokes subagents via the available task/subagent mechanism (e.g. `mcp_task` or equivalent), then uses the subagent’s result and continues the phase. Subagent usage is **optional but recommended** where listed below.

**When to use which subagent**

| Phase | Subagent | When | What it does |
|-------|----------|------|----------------|
| **Define** | Spec review | After creating/updating proposal + spec deltas | Reviews the spec (and proposal) for gaps, ambiguities, and alignment with the user’s request; returns a short report. Human still reviews; the report supports the review. |
| **Specify tests** | Acceptance review | After creating/updating `acceptance.md` | Reviews the acceptance list against the spec/proposal for missing scenarios, redundancy, and clarity; returns a short report. Human still reviews; the report supports the review. |
| **Implement** | Run tests and fix | When making tests green (optional) | Runs the project test command; if failures, applies fixes and re-runs until green; returns success/failure and a brief summary. Keeps red→green iteration out of the main chat. |
| **Implement** (optional) | Code review | After tests are green, before Ship | Reviews the current diff for bugs, edge cases, and adherence to the spec and to `docs/sdlc/REVIEW-CHECKLIST.md`; returns a short report. Human can use it for the optional code-review checkpoint. |

**Subagent prompts (to be passed when launching each subagent)**

These prompts are included in the corresponding slash-command instructions so the main agent can launch the subagent with the right task. The subagent receives only the prompt and any file paths or context the main agent attaches.

1. **Spec review (Define phase)**  
   - **Subagent type:** `generalPurpose` (or equivalent that can read files and reason).  
   - **Prompt (to be passed by main agent):**  
     "You are reviewing a spec change for an SDLC workflow. Read the following: (1) the user's original request or ticket, (2) the change proposal at openspec/changes/<change-id>/proposal.md, (3) the spec deltas at openspec/changes/<change-id>/specs/ (and the current spec at openspec/specs/<capability>/spec.md if relevant). Using docs/sdlc/SPEC-STANDARD.md and docs/sdlc/REVIEW-CHECKLIST.md as reference, produce a short report: (a) gaps or ambiguities in the spec, (b) suggestions for clarity or completeness, (c) any backward-compatibility or consistency concerns. Return only the report; do not edit files."

2. **Acceptance review (Specify tests phase)**  
   - **Subagent type:** `generalPurpose`.  
   - **Prompt:**  
     "You are reviewing an acceptance (test list) document for an SDLC workflow. Read: (1) the change proposal and spec deltas at openspec/changes/<change-id>/, (2) openspec/changes/<change-id>/acceptance.md. Using docs/sdlc/ACCEPTANCE-STANDARD.md and docs/sdlc/REVIEW-CHECKLIST.md, produce a short report: (a) missing scenarios relative to the spec’s acceptance criteria, (b) redundant or overlapping scenarios, (c) unclear or implementation-coupled wording. Return only the report; do not edit files."

3. **Run tests and fix (Implement phase)**  
   - **Subagent type:** `shell` or an agent that can run commands and edit files (e.g. `generalPurpose` with terminal + edit).  
   - **Prompt:**  
     "In this project, run the test command (e.g. mvn test, npm test, or the project’s standard test command). If any tests fail, edit the relevant production or test code to fix the failures, then re-run the tests. Repeat until all tests pass or you cannot fix further. Return a brief summary: whether tests are green, and if not, which failures remain and what was attempted."

4. **Code review (optional, after Implement)**  
   - **Subagent type:** `generalPurpose`.  
   - **Prompt:**  
     "You are reviewing code changes for an SDLC workflow. Read the current git diff (or the changed files) for the change at openspec/changes/<change-id>/. Using the spec (proposal + deltas) and acceptance.md for this change, and docs/sdlc/REVIEW-CHECKLIST.md, produce a short report: (a) potential bugs or edge cases, (b) deviations from the spec or acceptance criteria, (c) suggested improvements. Return only the report; do not edit files."

**Integration with slash commands**

- **sdlc-define.md:** After creating/updating the change (proposal + deltas), the main agent **may** launch the Spec review subagent with the prompt above (filling in `<change-id>` and `<capability>`). After the subagent returns, the main agent presents the report to the user and then stops for human review. If the subagent mechanism is unavailable, skip the subagent and go straight to “stop for human review.”
- **sdlc-specify-tests.md:** After creating/updating `acceptance.md`, the main agent **may** launch the Acceptance review subagent with the prompt above. Present the report, then stop for human review. If unavailable, skip and stop for human review.
- **sdlc-implement.md:** The main agent **may** delegate “run tests and fix until green” to the Run tests and fix subagent (e.g. after each significant edit, or once at the end). If the subagent reports green, the main agent continues (optional code review or Ship). If the subagent reports remaining failures, the main agent can try to fix or surface them to the user. If the subagent mechanism is unavailable, the main agent runs the test command and fixes in the main chat.
- **Code review subagent:** Optionally invoked from **sdlc-implement.md** after tests are green (“launch Code review subagent and present the report; then ask the user if they want to proceed to Ship or iterate”). Or the user can run Cursor’s built-in Agent Review on the diff instead.

**Notes**

- Subagent invocation is Cursor-specific (e.g. via the task/subagent API). The **prompts** and **reports** are plain text; the same prompts could be used in another tool that supports a similar “delegate task” pattern.
- If a subagent fails or is not available, the main agent falls back to doing the work in the main chat (no hard dependency on subagents).

---

### 3.4 Layer 2 file list (summary)

| Path | Purpose |
|------|---------|
| `.cursor/rules/sdlc-workflow.mdc` | Always-on SDLC context and checkpoint rule |
| `.cursor/commands/sdlc-define.md` | Phase 1: Define |
| `.cursor/commands/sdlc-specify-tests.md` | Phase 2: Specify tests |
| `.cursor/commands/sdlc-implement-tests.md` | Phase 3: Implement tests |
| `.cursor/commands/sdlc-implement.md` | Phase 4: Implement |
| `.cursor/commands/sdlc-ship.md` | Phase 5: Ship |

Subagents are defined in section 3.3 and are invoked from the slash commands (Define, Specify tests, Implement) as optional steps. If subagents are unavailable, the main agent performs the same work in the main chat.

---

## 4. Implementation order and checklist

Suggested order so that each step has what it needs:

1. **Create directories**
   - `docs/sdlc/`
   - `openspec/specs/`, `openspec/changes/`
   - `openspec/specs/_example/`, `openspec/changes/_example/specs/_example/`
   - `.cursor/rules/` (if missing), `.cursor/commands/` (if missing)

2. **Layer 1 content**
   - Write `docs/SDLC-WORKFLOW.md` (full phase details and checkpoint rules).
   - Write `docs/sdlc/SPEC-STANDARD.md`.
   - Write `docs/sdlc/ACCEPTANCE-STANDARD.md`.
   - Write `docs/sdlc/PR-STANDARD.md`.
   - Write `docs/sdlc/REVIEW-CHECKLIST.md` (optional).
   - Add example spec and example change files under `openspec/specs/_example/` and `openspec/changes/_example/`.

3. **Layer 2 content**
   - Write `.cursor/rules/sdlc-workflow.mdc`.
   - Write `.cursor/commands/sdlc-define.md` (including optional Spec review subagent step and prompt reference).
   - Write `.cursor/commands/sdlc-specify-tests.md` (including optional Acceptance review subagent step and prompt reference).
   - Write `.cursor/commands/sdlc-implement-tests.md`.
   - Write `.cursor/commands/sdlc-implement.md` (including optional Run tests and fix subagent and optional Code review subagent, with prompt references from section 3.3).
   - Write `.cursor/commands/sdlc-ship.md`.

4. **Validation**
   - Read through `docs/SDLC-WORKFLOW.md` and confirm it is self-contained and tool-agnostic.
   - Run one full pass in Cursor: trigger each command in order (Define → review → Specify tests → review → Implement tests → Implement → Ship) on a tiny sample change and confirm artifacts are created and checkpoints are respected. Optionally verify that subagents (Spec review, Acceptance review, Run tests and fix, Code review) are invoked when the commands run and that results are presented correctly.

---

## 5. What stays out of this plan

- **Claude-specific setup:** Not in this repo; a separate one-line note in `docs/SDLC-WORKFLOW.md` or a short `docs/sdlc/CLAUDE.md` can say: "Point your project instructions at docs/SDLC-WORKFLOW.md and docs/sdlc/*.md; run phases by name (e.g. 'Do Phase 1: Define')."
- **CI:** No automation in this plan (e.g. "PR must reference a change-id"). Can be added later.
- **OpenSpec CLI/tooling:** This plan uses OpenSpec-style layout and conventions only; it does not require installing OpenSpec npm package or any external tool.

---

## 6. Summary table: all files to create

| # | Layer | Path |
|---|--------|------|
| 1 | 1 | `docs/SDLC-WORKFLOW.md` |
| 2 | 1 | `docs/sdlc/SPEC-STANDARD.md` |
| 3 | 1 | `docs/sdlc/ACCEPTANCE-STANDARD.md` |
| 4 | 1 | `docs/sdlc/PR-STANDARD.md` |
| 5 | 1 | `docs/sdlc/REVIEW-CHECKLIST.md` |
| 6 | 1 | `openspec/specs/_example/spec.md` |
| 7 | 1 | `openspec/changes/_example/proposal.md` |
| 8 | 1 | `openspec/changes/_example/acceptance.md` |
| 9 | 1 | `openspec/changes/_example/tasks.md` |
| 10 | 1 | `openspec/changes/_example/design.md` (optional) |
| 11 | 1 | `openspec/changes/_example/specs/_example/spec.md` |
| 12 | 2 | `.cursor/rules/sdlc-workflow.mdc` |
| 13 | 2 | `.cursor/commands/sdlc-define.md` |
| 14 | 2 | `.cursor/commands/sdlc-specify-tests.md` |
| 15 | 2 | `.cursor/commands/sdlc-implement-tests.md` |
| 16 | 2 | `.cursor/commands/sdlc-implement.md` |
| 17 | 2 | `.cursor/commands/sdlc-ship.md` |

**Total:** 17 files (plus directory creation). After your go-ahead, implementation can proceed in a sample repo following this plan.
