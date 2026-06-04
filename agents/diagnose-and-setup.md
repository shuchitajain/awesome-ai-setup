---
name: diagnose-and-setup
version: 0.4.0
description: Assess the repository's current AI context maturity and produce a prioritized action plan pointing to the agents that should run next
---

# Diagnose AI Setup

You are diagnosing the current AI development setup for this repository and producing a short, prioritized action plan.

The output is a numbered list of agents to run - specific to what's missing in this project, in the right order. Nothing more.

---

## Step 1 - Check for Existing AI Setup Files

Check whether each of these files exists. Read the ones that do.

**Global instruction files** (read if present):
- `CLAUDE.md` (root) — Claude Code
- `.github/copilot-instructions.md` — GitHub Copilot
- `.cursor/rules/global.mdc` — Cursor (current path)
- `.cursorrules` — Cursor (legacy path — if found but `global.mdc` is absent, note as stale)

**Architecture and context files** (read if present):
- `ARCHITECTURE.md` (root)
- `CONTEXT.md` (root)
- `MEMORY.md` (root)

**Scoped instruction files:**
- `.github/instructions/` - list any `.instructions.md` files present (GitHub Copilot)
- `.claude/rules/` - list any `.md` files present (Claude Code)
- `.cursor/rules/` - list any `.mdc` files present (Cursor)

**Tooling — MCP config:**

Check project-level first, then user-level as fallback:

| Tool | Project-level path | User-level path |
|------|-------------------|----------------|
| GitHub Copilot | `.vscode/mcp.json` | `~/.config/github-copilot/intellij/mcp.json` (JetBrains/Android Studio) |
| Claude Code | `.mcp.json` (root) | `~/.claude.json` (contains `mcpServers` key) |
| Cursor | `.cursor/mcp.json` | `~/.cursor/mcp.json` |

For each tool detected as in use, report MCP status as one of:
- **Project-level** — `[path]` present ✓
- **User-level only** — no project config found, but `[user path]` exists (servers apply globally, not project-specifically — flag as a gap)
- **Missing** — no config at either level ✗

**Agentic:**
- `AGENTS.md` - note if present
- `workflows/` - list any workflow files present

**README:**
- Read `README.md` if present. Assess whether it contains real, project-specific content or is auto-generated / template boilerplate (e.g. scaffolded by a CLI tool, contains only installation placeholders, generic "Getting Started" sections with no project-specific detail, or identical to a framework's default README).

For each file that exists, assess its quality:
- **Thin** - file exists but has fewer than 30 meaningful lines, or contains only placeholder content
- **Partial** - file has real content but is missing major sections
- **Complete** - file has substantive, project-specific content

---

## Step 2 - Assess Codebase Maturity

1. List the top-level directory
2. Identify the primary source directory (`lib/`, `src/`, `app/`, or equivalent)
3. Read the dependency manifest (`pubspec.yaml`, `package.json`, `Cargo.toml`, etc.) - identify the tech stack and key libraries
4. Estimate codebase size by listing the source directory
5. **Detect the primary framework version** by running the appropriate command in the terminal:
   - Flutter project (`pubspec.yaml` present) → run `flutter --version` and extract the Flutter and Dart versions from the output
   - Node.js / React / Next.js project (`package.json` present) → run `node --version`; also read the `dependencies` / `devDependencies` fields for the exact `react`, `next`, `vue`, `svelte`, or `angular` version
   - Rust project (`Cargo.toml` present) → run `rustc --version`
   - Go project (`go.mod` present) → run `go version`
   - Python project (`pyproject.toml` / `requirements.txt` present) → run `python3 --version`
   If the command is unavailable (tool not on PATH), note "version unavailable - run manually" rather than guessing.

**Classify as one of:**
- **Empty** - no source directory yet, or fewer than 5 source files
- **Early** - 5–40 source files, architecture starting to form but patterns not yet established
- **Active** - 40+ source files, consistent patterns visible across the codebase

---

## Step 3 - Determine Current Maturity Level

Based on Steps 1 and 2:

| Level | Criteria |
|-------|----------|
| **0** | No AI setup files exist |
| **1** | At least one instruction file exists and has real content |
| **2** | `ARCHITECTURE.md` exists and documents real structure |
| **3** | MCP configuration exists for at least one active tool (`.vscode/mcp.json`, `.mcp.json`, or `.cursor/mcp.json`) |
| **4** | `MEMORY.md` exists with real entries |
| **5** | `AGENTS.md` and at least one workflow file exist |

Note gaps within the current level (e.g., "Level 1 - but instruction file is thin").

---

## Step 4 - Generate Action Plan

Produce the action plan in this exact format:

```markdown
## AI Setup Diagnosis

**Codebase:** [Empty / Early / Active]
**Tech stack:** [detected from dependency manifest - list primary frameworks and key libraries, including exact version from Step 2.5 - e.g. "Flutter 3.29.3 / Dart 3.7.2" or "React 19.1.0 / Node 22.13.0"]
**Current level:** [0–5] - [level name from the maturity model]

### What you have
[One bullet per AI setup file found, with quality assessment]
[Or: "No AI setup files found." if none]
[If README.md exists, include one bullet assessing whether it is auto-generated/boilerplate or project-specific. If auto-generated, flag it: "README.md - auto-generated template. Offer to rewrite."]

### Recommended next steps

[one of the three blocks below - choose based on codebase maturity]
```

**If codebase is Empty or Early:**

```markdown
Your codebase doesn't have enough established patterns for context-generation agents to produce accurate output. Running them now would generate generic documentation that doesn't reflect your real project.

Do this now:
1. Run `generate-scoped-instructions.md`
   → Generates a global instructions file from your tech stack and any patterns detectable so far.
   → Fill in the placeholder sections by hand as your codebase develops.

Return to this diagnostic after your first 2–3 features are built. At that point, run:
2. `generate-architecture.md` - documents your folder structure and layer conventions
3. `generate-context.md` - documents your domain model and business rules
4. `update-memory.md` - records decisions made during early development
```

**If codebase is Active - no existing AI setup (Level 0):**

```markdown
Run these agents in order:

1. `generate-architecture.md`
   → Foundation for everything else. Establishes structure, layers, and conventions.

2. `generate-context.md`
   → Domain model, business rules, terminology. Reduces hallucination on domain-specific behavior.

3. `update-memory.md`
   → Decisions made, patterns abandoned, anti-patterns to avoid. Needs 1 and 2 complete first.

4. `generate-scoped-instructions.md`
   → Per-file-type instruction files and a global instructions file. Needs 1, 2, and 3 complete first.

Run 1 → 2 → 3 → 4 in sequence.
```

**If codebase is Active - partial AI setup (Level 1–4):**

```markdown
You have [X]. You're missing [Y].

[List only the agents needed for the gaps found. Skip anything already covered by complete files.]

[If an existing file is thin or stale, note: "Re-run [agent] - existing [file] is [thin/stale]."]
```

---

## Constraints

**Assess each detected tool independently for its full set of config files.** Presence of config for one tool never satisfies a gap for another. Detect which tools are in use by checking: `agents/` or `.mcp.json` → Claude Code; `.github/agents/` or `.github/copilot-instructions.md` or `.vscode/mcp.json` → Copilot; `.cursor/` or `.cursorrules` or `.cursor/rules/` → Cursor.

For each tool detected as in use, the complete set of expected files is:

| Tool | Global instructions | Scoped rules | MCP config |
|------|--------------------|--------------|-----------|
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/instructions/*.instructions.md` | `.vscode/mcp.json` |
| Claude Code | `CLAUDE.md` | `.claude/rules/*.md` | `.mcp.json` |
| Cursor | `.cursor/rules/global.mdc` | `.cursor/rules/*.mdc` | `.cursor/mcp.json` |

Flag every missing file as a gap for that tool. If global instructions or scoped rules are missing, recommend `generate-scoped-instructions.md`. If MCP config is missing at project level, recommend `generate-mcp-config.md`.

**Don't recommend agents for files that already exist and appear complete.** If `ARCHITECTURE.md` has substantial, project-specific content, skip `generate-architecture`.

**Do recommend re-running for thin or stale files.** A 20-line `ARCHITECTURE.md` with no folder structure documentation should be flagged.

**Flag and offer to fix an auto-generated README.** If `README.md` reads like scaffolded output (generic sections, no project-specific detail, framework default text), call it out explicitly in the diagnosis and ask the user if they want you to rewrite it with accurate project context before proceeding with other agents.

**Be direct about the early-codebase limitation.** Running context-generation agents on a project with fewer than 5 features produces output that will need to be thrown away and regenerated. Say this plainly.

**Keep the action plan short.** The numbered list is the output. No lengthy explanations, no repeating information the user already has.

**Don't diagnose quality problems in the codebase itself.** This agent assesses AI setup files only - not code quality, architectural violations, or technical debt.

---

## Step 5 - Offer to Execute

After outputting the action plan, ask the user exactly this:

> "Want me to run these now? I'll execute each agent in the order above - starting with [first agent name], then [subsequent agents]. Just say yes to proceed."

If the user confirms:

1. Read the first agent's file from the agents directory (`agents/`, `.github/agents/`, or `.cursor/skills/` - whichever exists in this project). Execute its full instructions against this codebase.
2. Once complete, proceed to the next agent(s). Where the plan allows parallel execution, say so and execute them in sequence within this conversation.
3. After each agent completes, confirm what was produced before moving to the next.

Do not ask for confirmation between each agent - the user already said yes. Only pause if you encounter a genuine ambiguity that requires their input (e.g., conflicting patterns in the codebase).

Once all planned agents have completed, check whether any detected tool is missing a project-level MCP config. If at least one is missing, ask — naming the specific file and tool:

> "Core setup done. Want me to also generate an MCP config for this project? [List each missing file, e.g. '`.mcp.json` is missing for Claude Code, `.cursor/mcp.json` is missing for Cursor.'] I'll detect which integrations are relevant (database, GitHub, filesystem, external APIs) based on what the codebase actually uses and generate a config tailored to your stack - more accurate than the generic CLI stub."

If all detected tools already have a project-level MCP config, skip this offer entirely — do not mention it.

If yes, read and execute `generate-mcp-config` from the agents directory. If no, skip it.

Then ask:

> "Want me to also run `generate-agent-workflows`? It will generate `AGENTS.md` and structured workflow files tailored to this project's architecture - useful if you want a consistent AI-assisted development process across your team."

Run it if the user says yes. Skip it if they say no.

If the user says no to the initial offer, stop after the action plan.

## Output

Produce the action plan directly. No preamble. No explanation of what you checked or how you arrived at the recommendations.

Start with:

```markdown
## AI Setup Diagnosis
```
