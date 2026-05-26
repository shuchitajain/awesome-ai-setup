# awesome-ai-setup

Practical agents and patterns for AI-native repository workflows.

This is not a prompt collection. It's a structured approach to context engineering — using AI itself to analyze your repository and generate accurate, project-specific documentation that makes AI coding assistants significantly more effective.

---

## The Core Idea

Most AI setup guides give you static files to copy. The problem: static files describe a hypothetical project, not yours.

This repository takes a different approach.

**The AI assistant is the execution engine.** Instead of shipping a static `ARCHITECTURE.md` for you to adapt, this repo ships an agent that instructs your AI assistant to analyze your actual codebase and generate an accurate `ARCHITECTURE.md` from what it finds.

```
# Instead of this:
copy examples/flutter/ARCHITECTURE.md → your-project/ARCHITECTURE.md
# and manually adapt 300 lines of template...

# You do this:
"Read agents/generate-architecture.md and execute it on this repository."

# AI inspects your actual folder structure, detects your patterns,
# infers your conventions, and generates an accurate file.
```

The result is documentation that reflects your real project — not a generic ideal.

---

## Why This Matters

**Static templates rot.** A copied `ARCHITECTURE.md` is accurate on day one, stale by month three, and actively misleading by year two. Agents can be re-executed when the architecture evolves.

**Templates describe averages, not your project.** Your project doesn't have every layer a template assumes. It has patterns a template doesn't cover. AI-generated context from your actual code is more precise than any template.

**Works across tools.** These agents follow the open AGENTS.md convention. They work with Claude Code, Cursor, Copilot, Codex, Aider, and any other AI assistant with codebase access. No vendor lock-in.

**Leverages what AI is actually good at.** Modern AI assistants are excellent at reading codebases and inferring patterns. Use them for that, not for adapting templates manually.

---

## What's in This Repo

```
awesome-ai-setup/

README.md

agents/                               # The core product — executable AI agents
  README.md                           # How to use the agents
  diagnose-and-setup.md               # Assess current AI setup → generate action plan
  generate-architecture.md            # Analyze repo → generate ARCHITECTURE.md
  generate-context.md                 # Analyze domain → generate CONTEXT.md
  update-memory.md                    # Audit patterns → generate MEMORY.md
  generate-scoped-instructions.md     # Analyze conventions → generate instruction files
  generate-mcp-config.md              # Detect stack → generate tool-specific MCP config
  generate-agent-workflows.md         # Analyze workflows → generate project-specific AGENTS.md

docs/
  MATURITY_MODEL.md                   # Diagnostic framework for AI readiness
  CONTEXT_ENGINEERING.md              # How to write context that actually helps
  MCP_GUIDE.md                        # Model Context Protocol integration guide

examples/
  flutter/
    README.md                         # How to use this example
    ARCHITECTURE.md                   # Reference example of generated output
    CONTEXT.md                        # Reference example of generated output
    MEMORY.md                         # Reference example of generated output
    AGENTS.md                         # Reference example of generated output

    .github/
      copilot-instructions.md
      instructions/
        widgets.instructions.md
        riverpod.instructions.md
        testing.instructions.md

    .vscode/
      mcp.json

    workflows/
      feature-development.md
      bug-fixing.md
      refactoring.md

  nodejs/
    README.md
    ARCHITECTURE.md
    CONTEXT.md
    MEMORY.md
    AGENTS.md

    .github/
      copilot-instructions.md

    workflows/
      feature-development.md
      bug-fixing.md
      refactoring.md
```

---

## Quick Start

### Step 1 — Install the agents into your project

Run this from your project root. It copies the `agents/` folder and asks which tools you use.

```bash
npx awesome-ai-setup
```

### Step 2 — Run the diagnostic

Start here regardless of where you are: fresh project, existing project with no AI setup, or existing project with a partial setup.

**Claude Code**
```
Read agents/diagnose-and-setup.md and execute it on this repository.
```

**Cursor**
```
@.cursor/commands/diagnose-and-setup.md — execute this on the current codebase
```

**GitHub Copilot (VS Code)**

Open Copilot Chat, click the agent picker (mode dropdown), select **diagnose-and-setup**, then send:
```
execute the diagnostic on this codebase
```

The diagnostic produces a short action plan tailored to your situation:

- **Fresh or early-stage project** — identifies what's useful to set up now vs. what should wait until the codebase has established patterns
- **Existing project, no AI setup** — gives you a prioritized sequence of agents to run
- **Existing project, partial setup** — identifies gaps in what you already have and skips agents for files that are already complete

### Step 3 — Follow the generated action plan

Run the recommended agents in the same tool. For Claude Code and Cursor, swap the filename. For Copilot, select the agent from the picker. Review each output before committing — agents mark uncertain sections with `<!-- TODO: verify -->` for human review. Review each output before committing. Agents mark uncertain sections with `<!-- TODO: verify -->` for human review.

### Using an example as reference

On existing projects (where `src/`, `lib/`, or `app/` exists), the CLI will offer to copy an example during setup. You can also browse `examples/` directly at any time to see what high-quality agent output looks like for a specific stack.

Current examples:

| Example | Stack |
|---------|-------|
| `flutter` | Flutter, Riverpod 2.x, Clean Architecture, GoRouter, Freezed |
| `nodejs` | Node.js 22, Express 5, TypeScript (strict), Prisma, Zod, Vitest |

---

## The Agents

| Agent                          | What It Generates                                   | When to Use                                  |
|--------------------------------|-----------------------------------------------------|----------------------------------------------|
| `diagnose-and-setup`           | Prioritized action plan                             | **Start here** — any project, any stage      |
| `generate-architecture`        | `ARCHITECTURE.md`                                   | Active codebase setup, after major refactors |
| `generate-context`             | `CONTEXT.md`                                        | Active codebase setup, when domain evolves   |
| `update-memory`                | `MEMORY.md`                                         | After architectural decisions, migrations    |
| `generate-scoped-instructions` | `.github/instructions/*.md`                         | Any stage — works with minimal code          |
| `generate-mcp-config`          | `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json` | When adding tool connections (Level 3)       |
| `generate-agent-workflows`     | `AGENTS.md`, `workflows/`                           | After Levels 1–4 are in place                |

→ [Agents documentation](agents/README.md)

---

## AI Maturity Model

Use this as a diagnostic, not a checklist.

| Level | What You Have                                   | Next Step                                                                             |
|-------|-------------------------------------------------|---------------------------------------------------------------------------------------|
| **0** | AI autocomplete, no project context             | Run `diagnose-and-setup`                                                              |
| **1** | Instructions file (`CLAUDE.md`, `.cursorrules`) | Add `ARCHITECTURE.md` + `CONTEXT.md` via `generate-architecture` + `generate-context` |
| **2** | Architecture + domain context                   | Add MCP config via `generate-mcp-config`                                              |
| **3** | Tool-connected (MCP)                            | Add `MEMORY.md` via `update-memory`                                                   |
| **4** | Memory-aware                                    | Add agentic workflows via `generate-agent-workflows`                                  |
| **5** | Agentic workflows                               | —                                                                                     |

→ [Full maturity model](docs/MATURITY_MODEL.md)

---

## Design Principles

**AI as execution engine, not output recipient.** The agents instruct AI to analyze your actual codebase. The generated files are accurate because they're derived from your code, not from a template.

**Infer, don't invent.** Every agent has a "Do NOT" section. Constraints on hallucination are as important as instructions for what to generate.

**Re-executable over perfect.** An agent that can be re-run when your architecture evolves is more valuable than a perfectly crafted static file that goes stale.

**Works across tools.** These agents follow the open AGENTS.md convention — plain markdown with minimal frontmatter. They work with any AI assistant that can read files and a codebase. No vendor-specific syntax, no plugin required.

**Composable.** Run one agent or all seven. Add what's useful, skip what isn't. The files produced work independently.

---

## Docs

- [How to use the agents](agents/README.md)
- [AI Maturity Model](docs/MATURITY_MODEL.md)
- [Context Engineering Guide](docs/CONTEXT_ENGINEERING.md)
- [MCP Integration Guide](docs/MCP_GUIDE.md)

---

*These patterns reflect what's working in production today. The AI tooling ecosystem is moving fast — the agent-driven approach is specifically designed to stay useful as capabilities evolve.*
