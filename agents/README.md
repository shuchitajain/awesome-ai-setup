# Agents

A collection of AI agents that inspect your repository and generate accurate, project-specific context files - rather than asking you to adapt static templates.

Each agent is a markdown file with frontmatter (`name`, `version`, `description`) compatible with the open AGENTS.md convention. They work across Claude Code, Cursor, GitHub Copilot, Codex, and any other tool that can read a file and follow instructions.

---

## How to Use

Install the agents first - see [Quick Start in the root README](../README.md#quick-start).

Once installed, invoke any agent using your tool's native syntax:

**Claude Code**

| Agent | Command |
|-------|---------|
| `diagnose-and-setup` | `Read agents/diagnose-and-setup.md and execute it on this repository.` |
| `generate-architecture` | `Read agents/generate-architecture.md and execute it on this repository.` |
| `generate-context` | `Read agents/generate-context.md and execute it on this repository.` |
| `update-memory` | `Read agents/update-memory.md and execute it on this repository.` |
| `generate-scoped-instructions` | `Read agents/generate-scoped-instructions.md and execute it on this repository.` |
| `generate-mcp-config` | `Read agents/generate-mcp-config.md and execute it on this repository.` |
| `generate-agent-workflows` | `Read agents/generate-agent-workflows.md and execute it on this repository.` |

**Cursor**

| Agent | Command |
|-------|---------|
| `diagnose-and-setup` | `@.cursor/commands/diagnose-and-setup.md - execute this on the current codebase` |
| `generate-architecture` | `@.cursor/commands/generate-architecture.md - execute this on the current codebase` |
| `generate-context` | `@.cursor/commands/generate-context.md - execute this on the current codebase` |
| `update-memory` | `@.cursor/commands/update-memory.md - execute this on the current codebase` |
| `generate-scoped-instructions` | `@.cursor/commands/generate-scoped-instructions.md - execute this on the current codebase` |
| `generate-mcp-config` | `@.cursor/commands/generate-mcp-config.md - execute this on the current codebase` |
| `generate-agent-workflows` | `@.cursor/commands/generate-agent-workflows.md - execute this on the current codebase` |

**GitHub Copilot (VS Code)**

Open Copilot Chat, click the agent picker (mode dropdown), select the agent by name, then send:
```
execute this on the current codebase
```

The agent name in the picker matches the filename (e.g. `diagnose-and-setup`, `generate-architecture`).

---

## Start Here

**Run `diagnose-and-setup` first.** It assesses your current AI setup, determines your maturity level, and produces a prioritized list of exactly which agents to run next - skipping what's already done, flagging what needs to be added.

This works for all three starting points:
- Fresh or early-stage project
- Existing project with no AI setup
- Existing project with partial setup

---

## Agent Reference

| Agent | Generates | Requires | Notes |
|-------|-----------|----------|-------|
| `diagnose-and-setup` | Prioritized action plan | Nothing - works on any repo | Run first |
| `generate-architecture` | `ARCHITECTURE.md` | 40+ source files | Re-run after major refactors |
| `generate-context` | `CONTEXT.md` | `ARCHITECTURE.md` recommended | Run after architecture is documented |
| `update-memory` | `MEMORY.md` | `ARCHITECTURE.md` + `CONTEXT.md` | Run after architectural decisions or migrations |
| `generate-scoped-instructions` | `.github/instructions/*.instructions.md` + `.github/copilot-instructions.md` | Works with minimal code | Run at any stage |
| `generate-mcp-config` | `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json` | Package manifest (`pubspec.yaml`, `package.json`) | Detects stack from dependencies |
| `generate-agent-workflows` | `AGENTS.md`, `workflows/` | Levels 1–4 in place | Run last |

---

## After Running

1. **Review the output** before committing. AI should not invent patterns - if something looks speculative, flag it or remove it.
2. **Fill in gaps.** Agents mark uncertain sections with `<!-- TODO: verify -->`. These need human input.
3. **Re-run periodically.** After major architecture changes, re-run the relevant agent to keep documentation accurate.
4. **Commit the generated files.** These files persist context across AI sessions - they're worth version controlling.

---

## Why "Agents" and Not "Prompts"?

These files follow the AGENTS.md convention - they have a `name`, a `version`, a `description`, and well-structured instructions. Tools that support agent discovery (Cursor, Copilot, Codex, and others) can find and invoke them by name. Tools that don't support discovery can still read them as plain markdown.

The content is the same as a prompt would be. The frontmatter and conventions make them composable with the broader AI tooling ecosystem.

---

## Reference Examples

The `examples/` directory contains examples of what high-quality agent output looks like for the Flutter + Riverpod + Clean Architecture stack and Node.js REST API stack. Use these as a quality bar when reviewing AI-generated output for your own project.
