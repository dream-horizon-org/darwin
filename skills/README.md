# SDLC Agent Skills

These folders follow the [Agent Skills](https://agentskills.io/) open standard (folder + `SKILL.md` with YAML frontmatter and Markdown instructions). Compatible agents (e.g. Cursor, Claude Code) can discover and load them when relevant to the task.

Skills are the **single execution layer** for the SDLC workflow. Tool-specific entrypoints (`CLAUDE.md`, `.cursor/rules/`, `.cursor/commands/`) are thin routing wrappers that point here. All phase logic and subagent prompts live in these skill files.

The canonical source of truth for standards remains `docs/sdlc/`. Each skill references its doc and applies the rules without requiring the agent to re-read the full standard every time.

## Skills

| Skill | Phase | When to use |
|---|---|---|
| **sdlc-define** | Phase 1: Define | User asks to define, start, or spec out a change |
| **sdlc-specify-tests** | Phase 2: Specify tests | User asks to specify tests or write acceptance criteria |
| **sdlc-implement-tests** | Phase 3: Implement tests | User asks to implement tests or proceed to Phase 3 |
| **sdlc-implement** | Phase 4: Implement | User asks to implement or make tests green |
| **sdlc-ship** | Phase 5: Ship | User asks to ship, prepare a PR, or proceed to Phase 5 |
| **sdlc-review** | Any checkpoint | Reviewing spec, acceptance list, or code; also invoked as subagent by phase skills |

## Updating skills

- To change **phase execution logic** (steps, checkpoints, subagent prompts): edit the relevant phase skill.
- To change **standards** (spec format, acceptance format, PR format, review criteria): edit `docs/sdlc/`. Skills reference docs by path — no skill edits needed for standards changes.
- To add a **new tool**: create a thin entrypoint (e.g. `.vscode/`) that points to these skills. No skill edits needed.
