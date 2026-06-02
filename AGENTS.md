# AGENTS.md — awesome-ai-setup

Context for AI agents working on this repository.

---

## What This Repo Is

**awesome-ai-setup** is an npm CLI tool + a collection of executable AI agents that help developers set up AI-native development context for any codebase.

Published as `npx awesome-ai-setup`. Current version: `0.4.0`.

The core philosophy: instead of shipping static template files for humans to adapt, this repo ships *agents* — markdown instruction files that tell an AI assistant to inspect a real codebase and generate accurate, project-specific documentation from what it finds. Static templates rot; agents can be re-run.

---

## Repository Structure

```
awesome-ai-setup/
├── bin/
│   └── cli.js              # Entry point — interactive CLI (ESM)
├── src/
│   ├── detect.js           # Detects project state (agents exist?, maturity level)
│   ├── install.js          # Copies agent files and scaffolds ignore/MCP config files
│   └── output.js           # Prints post-install summary to the terminal
├── agents/                 # The 7 executable AI agents (core product)
│   ├── README.md           # Invocation reference for all agents across tools
│   ├── diagnose-and-setup.md
│   ├── generate-architecture.md
│   ├── generate-context.md
│   ├── generate-mcp-config.md
│   ├── generate-scoped-instructions.md
│   ├── generate-agent-workflows.md
│   └── update-memory.md
├── examples/               # Reference output for target project types
│   ├── flutter/            # Flutter + Riverpod + Clean Architecture
│   └── nodejs/             # Node.js + Express + TypeScript + Prisma
├── docs/
│   ├── MATURITY_MODEL.md
│   ├── CONTEXT_ENGINEERING.md
│   └── MCP_GUIDE.md
├── package.json            # name: awesome-ai-setup, main: bin/cli.js
├── README.md
├── CONTRIBUTING.md
└── CHANGELOG.md
```

---

## Tech Stack

- **Runtime:** Node.js ≥ 16, ESM (`"type": "module"`)
- **Dependencies:** `fs-extra` (file operations), `prompts` (interactive CLI prompts)
- **No build step.** Source is plain JS, runs directly with Node.
- **No test framework** is currently configured.

---

## Key Concepts

### The Two Audiences

1. **Users of this tool** — developers who run `npx awesome-ai-setup` to install agents into *their* project.
2. **Agents installed by this tool** — the markdown agent files in `agents/` are shipped into target projects and executed there, not here.

When working on this repo, be clear which audience a change affects.

### Agent File Format

Every file in `agents/*.md` follows this structure:

```markdown
---
name: agent-name
version: x.y.z
description: one-line description
---

# Agent Title
...instructions...
```

The YAML frontmatter (`name`, `description`) is used by GitHub Copilot's agent picker. The markdown body is the actual agent instructions. Both matter.

### Tool Compatibility

Agents are installed to different directories depending on the target tool:

| Tool | Destination directory |
|------|-----------------------|
| Claude Code | `agents/` |
| Cursor | `.cursor/skills/` |
| GitHub Copilot | `.github/agents/` |

This mapping lives in `src/install.js` (`AGENTS_DEST`). The agent markdown files are identical across all three — only the destination path differs.

### Maturity Classification

`src/detect.js` classifies a target project as `empty`, `early`, or `active` based on source file count in `lib/`, `src/`, or `app/`. This is used to tailor the install experience.

---

## CLI Flow

```
npx awesome-ai-setup
  → detect.js: check for existing agents/, src file count → maturity
  → cli.js: interactive prompts (tools used, example stack)
  → install.js: copy agents/, write ignore file, write MCP config stub
  → output.js: print summary + next steps
```

The CLI is non-destructive by default: if `agents/` already exists, it asks before overwriting. Ignore files and MCP configs are never overwritten on a refresh run.

---

## Conventions

- **ESM only.** All files use `import`/`export`. Do not introduce `require()`.
- **No TypeScript.** Plain JS. Do not add a build step.
- **Agent files are instructions, not code.** When editing `agents/*.md`, the output is human-readable markdown that an AI assistant will execute. Write them as precise instructions with explicit "Do NOT" guardrails.
- **Examples are reference output.** Files in `examples/flutter/` and `examples/nodejs/` are sample outputs that agents would produce on those stacks. Keep them realistic and complete.
- **Versioning:** `package.json` version and each agent's frontmatter `version` are independent. Update an agent's version when its instructions change meaningfully.

---

## Common Tasks

### Adding a new agent
1. Create `agents/<name>.md` with YAML frontmatter (`name`, `version`, `description`) and the instruction body.
2. Add the invocation reference to `agents/README.md` (all three tool variants: Claude Code, Cursor, GitHub Copilot).
3. If the agent should appear in the diagnose-and-setup output plan, add a reference in `agents/diagnose-and-setup.md`.
4. Add a corresponding example output file to both `examples/flutter/` and `examples/nodejs/` if the agent generates a persistent file.

### Modifying the CLI install flow
- Tool-to-path mappings: `src/install.js` — `AGENTS_DEST`, `IGNORE_FILE`, `MCP_CONFIG_PATH`.
- Default ignore file content: `src/install.js` — `IGNORE_CONTENT` constant.
- Prompts and flow logic: `bin/cli.js`.
- Detection logic: `src/detect.js`.

### Recording key decisions
- When a conversation produces a meaningful repo-level decision, update `decisions.md` in the repo root before finishing the task.
- Record decisions that affect product direction, tool support claims, file semantics, generation strategy, or other guidance future agents should follow.
- Keep entries concise and action-oriented. Capture the decision, any important confidence boundary, and the practical implication for the repo.
- Do not log trivial implementation details or temporary thoughts that did not become an actual decision.

### Testing a change locally
```bash
cd /some/scratch-project
node /path/to/awesome-ai-setup/bin/cli.js
```
There is no automated test suite. Validate by running the CLI against a scratch directory.

---

## What NOT To Do

- Do not add runtime dependencies without strong justification. The tool installs via `npx`; a heavy dep graph increases cold-start time.
- Do not add tool-specific syntax to agent markdown files. They must remain portable across Claude Code, Cursor, and GitHub Copilot.
- Do not hardcode project-specific assumptions in `detect.js`. Detection logic must be generic across stacks.
- Do not overwrite user ignore files or MCP configs on an update run — this is an explicit design decision to preserve user customizations.
- Do not hallucinate framework versions or paths inside agent instruction files. Every agent has a "Do NOT" section — keep those guardrails current.

---

## Guardrails

These apply to any AI agent working on this repository. Treat them as hard constraints, not suggestions.

### Code & architecture
- **Do NOT introduce `require()` or CommonJS syntax.** This repo is ESM (`"type": "module"`). Every file must use `import`/`export`.
- **Do NOT add a build step, transpiler, or TypeScript.** Plain JS only. If you find yourself reaching for `tsc` or `esbuild`, stop.
- **Do NOT add dependencies to `package.json` without explicit user approval.** Cold-start time of `npx` is directly affected.
- **Do NOT modify `src/detect.js` to be stack-specific.** Detection logic must remain generic — no Flutter-specific or Node-specific checks.
- **Do NOT change the `AGENTS_DEST` / `IGNORE_FILE` / `MCP_CONFIG_PATH` mappings in `src/install.js` without updating `agents/README.md` to match.**

### Agent files (`agents/*.md`)
- **Do NOT add tool-specific syntax** (e.g. Cursor slash-command syntax, Claude tool-use XML tags) to any agent `.md` file. Agent files must be plain markdown, portable across all tools.
- **Do NOT remove or weaken the "Do NOT" section** of any agent file. Hallucination guardrails are as important as generation instructions.
- **Do NOT change an agent's `name` frontmatter field** without updating every invocation reference in `agents/README.md` and `agents/diagnose-and-setup.md`.
- **Do NOT ship an agent that writes files destructively** (no overwrite without a guard or user confirmation step).

### Examples (`examples/`)
- **Do NOT use placeholder or lorem-ipsum content** in example files. They are reference output — they must look like real project documentation.
- **Do NOT add a third example stack** without also updating the CLI prompt options in `bin/cli.js` and the `EXAMPLES` array.

### CLI behavior
- **Do NOT make the CLI overwrite existing ignore files or MCP configs on a refresh run.** This is a deliberate design decision to preserve user customizations.
- **Do NOT add interactive prompts that block in non-TTY environments** without a `--yes` / `--non-interactive` fallback.
- **Do NOT `process.exit()` with a non-zero code** for user-initiated cancellations (e.g. answering "No" to a prompt). Only exit non-zero on genuine errors.

### General
- **Do NOT commit secrets, API keys, or credentials** in any form, including inside example files.
- **Do NOT rename or restructure top-level directories** (`bin/`, `src/`, `agents/`, `examples/`, `docs/`) — these paths are referenced in `package.json` `files` and in published documentation.
- **Do NOT bump `package.json` version** without user instruction. Version bumps accompany npm releases, not routine edits.