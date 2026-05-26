# Agents

A collection of AI agents that inspect your repository and generate accurate, project-specific context files — rather than asking you to adapt static templates.

Each agent is a markdown file with frontmatter (`name`, `description`) compatible with the open AGENTS.md convention. They work across Claude Code, Cursor, GitHub Copilot, Codex, and any other tool that can read a file and follow instructions.

---

## How to Use

Install the agents into your project first (run once from your project root):

```bash
npx awesome-ai-setup
```

Then invoke agents using your tool's native syntax:

**Claude Code**
```
Read agents/diagnose-and-setup.md and execute it on this repository.
```

**Cursor**
```
@agents/diagnose-and-setup.md — execute this on the current codebase
```

**GitHub Copilot (VS Code)**
```
#file:agents/diagnose-and-setup.md execute the instructions in this file on this codebase
```

Swap the filename to run any other agent — the syntax stays the same.

---

## Start Here

**Run `diagnose-and-setup` first.** It assesses your current AI setup, determines your maturity level, and produces a prioritized list of exactly which agents to run next — skipping what's already done, flagging what needs to be added.

This works for all three starting points:
- Fresh or early-stage project
- Existing project with no AI setup
- Existing project with partial setup

---

## Agent Reference

| File | Generates | Notes |
|------|-----------|-------|
| `diagnose-and-setup.md` | Prioritized action plan | Run first — works at any stage |
| `generate-architecture.md` | `ARCHITECTURE.md` | Needs an active codebase (40+ source files) |
| `generate-context.md` | `CONTEXT.md` | Run after architecture is documented |
| `update-memory.md` | `MEMORY.md` | Run after architecture and context exist |
| `generate-scoped-instructions.md` | `*.instructions.md` + global instructions file | Works with minimal code |
| `generate-mcp-config.md` | `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json` | Detects stack → generates tool-specific MCP stubs |
| `generate-agent-workflows.md` | `AGENTS.md`, `workflows/` | Run after Levels 1–4 are in place |

---

## After Running

1. **Review the output** before committing. AI should not invent patterns — if something looks speculative, flag it or remove it.
2. **Fill in gaps.** Agents mark uncertain sections with `<!-- TODO: verify -->`. These need human input.
3. **Re-run periodically.** After major architecture changes, re-run the relevant agent to keep documentation accurate.
4. **Commit the generated files.** These files persist context across AI sessions — they're worth version controlling.

---

## Why "Agents" and Not "Prompts"?

These files follow the AGENTS.md convention — they have a `name`, a `description`, and well-structured instructions. Tools that support agent discovery (Cursor, Copilot, Codex, and others) can find and invoke them by name. Tools that don't support discovery can still read them as plain markdown.

The content is the same as a prompt would be. The frontmatter and conventions make them composable with the broader AI tooling ecosystem.

---

## Reference Examples

The `presets/` directory contains examples of what high-quality agent output looks like for the Flutter + Riverpod + Clean Architecture stack. Use these as a quality bar when reviewing AI-generated output for your own project.
