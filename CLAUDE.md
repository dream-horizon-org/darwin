<!-- ROUTING FILE ONLY.
     Allowed: pointer to docs/SDLC-WORKFLOW.md, artifact locations, skills list, checkpoint rule.
     Not allowed: standards content, phase instructions, workflow details, requirement formats.
     To change behavior: edit docs/sdlc/ or skills/ instead. -->

# SDLC Workflow

This project follows a **spec-driven SDLC**. Every change flows through a defined process: spec → acceptance tests → test code → implementation → ship.

**Full workflow:** `docs/SDLC-WORKFLOW.md`

## Artifact locations

| Artifact | Path |
|---|---|
| Current specs | `openspec/specs/<capability>/spec.md` |
| Active changes | `openspec/changes/<change-id>/` |
| Archived changes | `openspec/changes/archive/<change-id>/` |

## Skills

Use the skill for each phase when the user initiates that phase:

| Phase | Skill |
|---|---|
| 1 – Define | `skills/sdlc-define/` |
| 2 – Specify tests | `skills/sdlc-specify-tests/` |
| 3 – Implement tests | `skills/sdlc-implement-tests/` |
| 4 – Implement | `skills/sdlc-implement/` |
| 5 – Ship | `skills/sdlc-ship/` |
| Review (any checkpoint) | `skills/sdlc-review/` |

## Checkpoint rule

At **Define** (Phase 1) and **Specify tests** (Phase 2), always stop and ask for human approval before proceeding to the next phase.
