# Spec-Driven SDLC Workflow

A rigorous, tool-agnostic SDLC framework that enforces specification-first development with human checkpoints. Every code change flows through a defined process: spec → acceptance tests → test code → implementation → ship.

## Overview

This project provides a complete workflow system for managing software changes using:

- **Living specifications** with change proposals and deltas (OpenSpec-style)
- **English acceptance criteria** (GIVEN/WHEN/THEN) before any code
- **Human review checkpoints** at critical phases
- **Tool-agnostic standards** that work with any IDE or AI agent
- **Cursor integration** via slash commands and rules
- **Claude Code integration** via `CLAUDE.md` and skills

## Key Features

- **Spec as contract**: No code without an approved spec and test list
- **Human checkpoints**: Mandatory reviews at Define and Specify tests phases
- **TDD workflow**: Write tests first (red), then implement (green)
- **Full traceability**: User request → spec → acceptance → tests → code → PR
- **Change lifecycle**: Active changes tracked in `openspec/changes/`; archived after merge
- **Tool-agnostic**: Core workflow works with Cursor, Claude Code, or any agent
- **No duplication**: Standards live once in `docs/`; skills are the single execution layer for all tools

## The 5-Phase Workflow

| Phase | Purpose | Checkpoint | Output |
|-------|---------|------------|--------|
| **1. Define** | Create spec/proposal with deltas, optional design doc | Human review | `proposal.md`, spec deltas, `design.md` (optional) |
| **2. Specify tests** | Write English test scenarios | Human review | `acceptance.md` |
| **3. Implement tests** | Write failing test code (TDD) | None | Test files (red) |
| **4. Implement** | Make tests pass | Optional | Production code (green) |
| **5. Ship** | Draft PR materials | Human ships | Branch, commit, PR |
| **Post-merge** | Apply spec deltas, archive change | Human | Updated canonical specs |

## Quick Start

### Using with Claude Code

1. **Start a change:**
   ```
   /sdlc-define Add user session timeout feature
   ```

2. **Review the spec**, approve or give feedback

3. **Generate acceptance tests:**
   ```
   /sdlc-specify-tests
   ```

4. **Review acceptance scenarios**, approve or give feedback

5. **Implement tests** (TDD red):
   ```
   /sdlc-implement-tests
   ```

6. **Implement the feature** (TDD green):
   ```
   /sdlc-implement
   ```

7. **Ship the change:**
   ```
   /sdlc-ship
   ```

8. **After PR merge:** Follow `docs/sdlc/MERGE-CHECKLIST.md`

### Using with Cursor

Same slash commands — `/sdlc-define`, `/sdlc-specify-tests`, etc. Cursor commands load the phase skills and use `generalPurpose` subagents for reviews.

### Using with Other Tools

Point your project instructions to `docs/SDLC-WORKFLOW.md` and run phases by name:

```
"Do Phase 1: Define for adding user session timeout"
```

## Directory Structure

```
CLAUDE.md                             # Claude Code always-on context (routing only)

docs/
  SDLC-WORKFLOW.md                    # Canonical workflow (phases, checkpoints, lifecycle)
  sdlc/
    SPEC-STANDARD.md                  # How to write specs
    ACCEPTANCE-STANDARD.md            # How to write test lists
    DESIGN-STANDARD.md                # How to write design docs
    PR-STANDARD.md                    # Branch naming, commits, PRs
    REVIEW-CHECKLIST.md               # Review criteria
    MERGE-CHECKLIST.md                # Post-merge: apply deltas, archive change

openspec/
  specs/                              # Current truth (one per capability)
    <capability>/
      spec.md
  changes/                            # Active changes (one per feature/fix)
    <change-id>/
      proposal.md                     # What & why
      design.md                       # Technical decisions (optional)
      acceptance.md                   # English test scenarios
      specs/                          # Spec deltas only
        <capability>/
          spec.md
    archive/                          # Completed changes (post-merge)
      <change-id>/

skills/                               # Agent Skills (agentskills.io standard)
  sdlc-define/                        # Phase 1: Define
  sdlc-specify-tests/                 # Phase 2: Specify tests
  sdlc-implement-tests/               # Phase 3: Implement tests
  sdlc-implement/                     # Phase 4: Implement
  sdlc-ship/                          # Phase 5: Ship
  sdlc-review/                        # Reviews at any checkpoint

.cursor/
  rules/
    sdlc-workflow.mdc                 # Always-on SDLC context (routing only)
  commands/
    sdlc-define.md                    # Phase 1 → loads skills/sdlc-define/
    sdlc-specify-tests.md             # Phase 2 → loads skills/sdlc-specify-tests/
    sdlc-implement-tests.md           # Phase 3 → loads skills/sdlc-implement-tests/
    sdlc-implement.md                 # Phase 4 → loads skills/sdlc-implement/
    sdlc-ship.md                      # Phase 5 → loads skills/sdlc-ship/
```

## Architecture: No Duplication

Standards and phase logic each live in exactly one place:

| What | Where | Updated when |
|---|---|---|
| Standards & format rules | `docs/sdlc/` | Standard changes |
| Phase execution logic | `skills/sdlc-*/` | Workflow changes |
| Subagent prompts | `skills/sdlc-*/` | Review logic changes |
| Tool routing (Claude Code) | `CLAUDE.md` | New tool added |
| Tool routing (Cursor) | `.cursor/rules/` + `.cursor/commands/` | Cursor API changes |

`CLAUDE.md` and `.cursor/rules/sdlc-workflow.mdc` are routing files only — they contain no standards content. To change behavior, edit `docs/sdlc/` or `skills/`.

## Change Lifecycle

| State | Location |
|---|---|
| In progress | `openspec/changes/<change-id>/` |
| Merged and complete | `openspec/changes/archive/<change-id>/` |

After a PR is merged, run `docs/sdlc/MERGE-CHECKLIST.md`: apply spec deltas to `openspec/specs/` and move the change folder to `openspec/changes/archive/`.

## Standards

All specs and acceptance tests use **GIVEN/WHEN/THEN** format:

```markdown
### Scenario: Session timeout
- GIVEN a user has authenticated
- WHEN 24 hours pass without activity
- THEN the session token is invalidated
- AND the user must re-authenticate
```

### Spec Deltas

Changes are tracked as deltas (not full rewrites):

- `+` or **ADDED**: New requirements/scenarios
- `±` or **MODIFIED**: Changed behavior
- `-` or **REMOVED**: Deleted requirements

## Human Checkpoints

The workflow enforces mandatory stops:

1. **After Define**: Human reviews and approves the spec (and design doc if written)
2. **After Specify tests**: Human reviews and approves acceptance scenarios
3. **After Implement** (optional): Human reviews code
4. **Ship**: Human pushes branch and opens PR
5. **Post-merge**: Human applies spec deltas and archives the change

The agent will **not proceed** until you approve at checkpoints.

## Documentation

### Core Standards
- **Workflow details**: [`docs/SDLC-WORKFLOW.md`](docs/SDLC-WORKFLOW.md)
- **Spec standard**: [`docs/sdlc/SPEC-STANDARD.md`](docs/sdlc/SPEC-STANDARD.md)
- **Acceptance standard**: [`docs/sdlc/ACCEPTANCE-STANDARD.md`](docs/sdlc/ACCEPTANCE-STANDARD.md)
- **Design standard**: [`docs/sdlc/DESIGN-STANDARD.md`](docs/sdlc/DESIGN-STANDARD.md)
- **PR standard**: [`docs/sdlc/PR-STANDARD.md`](docs/sdlc/PR-STANDARD.md)
- **Review checklist**: [`docs/sdlc/REVIEW-CHECKLIST.md`](docs/sdlc/REVIEW-CHECKLIST.md)
- **Merge checklist**: [`docs/sdlc/MERGE-CHECKLIST.md`](docs/sdlc/MERGE-CHECKLIST.md)

### Agent Skills
- **Skills overview**: [`skills/README.md`](skills/README.md)

## FAQ

**Q: Why separate specs from changes?**
A: `specs/` holds the current truth. `changes/<id>/` holds deltas. When merged, apply deltas to specs. This keeps history clean and supports parallel changes.

**Q: When do I write a design.md?**
A: When the change involves non-obvious technical decisions or significant trade-offs. Skip it for straightforward changes. See `docs/sdlc/DESIGN-STANDARD.md`.

**Q: What happens after the PR is merged?**
A: Run the post-merge checklist: apply spec deltas to `openspec/specs/` and move the change to `openspec/changes/archive/`. See `docs/sdlc/MERGE-CHECKLIST.md`.

**Q: Can I skip phases?**
A: Not recommended. The workflow prevents moving forward without approval at checkpoints. Skipping phases defeats the purpose of spec-driven development.

**Q: What if I just want to fix a typo?**
A: For trivial changes (typos, formatting — no behavioral change, single file, no new tests required), you can bypass the workflow. Use judgment. The workflow is for behavioral changes.

**Q: Can I use this without Cursor or Claude Code?**
A: Yes. The workflow in `docs/SDLC-WORKFLOW.md` and standards in `docs/sdlc/` are fully tool-agnostic. Point any agent or IDE at those files.

**Q: How do I add support for another tool (VS Code, etc.)?**
A: Create a thin entrypoint for that tool pointing to `docs/SDLC-WORKFLOW.md` and the `skills/` directory. No changes to standards or skills needed.

## Contributing to This Framework

To improve the framework itself:

1. Propose changes as you would for any project using this workflow
2. Create a change under `openspec/changes/` describing the workflow improvement
3. Update relevant documentation
4. Test with a sample project

## License

[Your License Here]
