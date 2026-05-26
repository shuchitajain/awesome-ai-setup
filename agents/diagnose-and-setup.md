---
name: diagnose-and-setup
description: Assess the repository's current AI context maturity and produce a prioritized action plan pointing to the agents that should run next
---

# Diagnose AI Setup

You are diagnosing the current AI development setup for this repository and producing a short, prioritized action plan.

The output is a numbered list of agents to run — specific to what's missing in this project, in the right order. Nothing more.

---

## Step 1 — Check for Existing AI Setup Files

Check whether each of these files exists. Read the ones that do.

**Global instruction files** (read if present):
- `CLAUDE.md` (root)
- `.github/copilot-instructions.md`
- `.cursorrules`
- `.windsurfrules`

**Architecture and context files** (read if present):
- `ARCHITECTURE.md` (root)
- `CONTEXT.md` (root)
- `MEMORY.md` (root)

**Scoped instruction files:**
- `.github/instructions/` — list any `.instructions.md` files present

**Tooling:**
- `.vscode/mcp.json` or `.cursor/mcp.json` — note if present

**Agentic:**
- `AGENTS.md` — note if present
- `workflows/` — list any workflow files present

For each file that exists, assess its quality:
- **Thin** — file exists but has fewer than 30 meaningful lines, or contains only placeholder content
- **Partial** — file has real content but is missing major sections
- **Complete** — file has substantive, project-specific content

---

## Step 2 — Assess Codebase Maturity

1. List the top-level directory
2. Identify the primary source directory (`lib/`, `src/`, `app/`, or equivalent)
3. Read the dependency manifest (`pubspec.yaml`, `package.json`, `Cargo.toml`, etc.) — identify the tech stack and key libraries
4. Estimate codebase size by listing the source directory

**Classify as one of:**
- **Empty** — no source directory yet, or fewer than 5 source files
- **Early** — 5–40 source files, architecture starting to form but patterns not yet established
- **Active** — 40+ source files, consistent patterns visible across the codebase

---

## Step 3 — Determine Current Maturity Level

Based on Steps 1 and 2:

| Level | Criteria |
|-------|----------|
| **0** | No AI setup files exist |
| **1** | At least one instruction file exists and has real content |
| **2** | `ARCHITECTURE.md` exists and documents real structure |
| **3** | MCP configuration exists |
| **4** | `MEMORY.md` exists with real entries |
| **5** | `AGENTS.md` and at least one workflow file exist |

Note gaps within the current level (e.g., "Level 1 — but instruction file is thin").

---

## Step 4 — Generate Action Plan

Produce the action plan in this exact format:

```markdown
## AI Setup Diagnosis

**Codebase:** [Empty / Early / Active]
**Tech stack:** [detected from dependency manifest — list primary frameworks and key libraries]
**Current level:** [0–5] — [level name from the maturity model]

### What you have
[One bullet per AI setup file found, with quality assessment]
[Or: "No AI setup files found." if none]

### Recommended next steps

[one of the three blocks below — choose based on codebase maturity]
```

**If codebase is Empty or Early:**

```markdown
Your codebase doesn't have enough established patterns for context-generation agents to produce accurate output. Running them now would generate generic documentation that doesn't reflect your real project.

Do this now:
1. Run `generate-scoped-instructions.md`
   → Generates a global instructions file from your tech stack and any patterns detectable so far.
   → Fill in the placeholder sections by hand as your codebase develops.

Return to this diagnostic after your first 2–3 features are built. At that point, run:
2. `generate-architecture.md` — documents your folder structure and layer conventions
3. `generate-context.md` — documents your domain model and business rules
4. `update-memory.md` — records decisions made during early development
```

**If codebase is Active — no existing AI setup (Level 0):**

```markdown
Run these agents in order:

1. `generate-architecture.md`
   → Foundation for everything else. Establishes structure, layers, and conventions.

2. `generate-context.md`
   → Domain model, business rules, terminology. Reduces hallucination on domain-specific behavior.

3. `update-memory.md`
   → Decisions made, patterns abandoned, anti-patterns to avoid. Run after completing 1 and 2.

4. `generate-scoped-instructions.md`
   → Per-file-type instruction files and a global instructions file. Run after completing 1.

Run 1, then 4 can run in parallel with 2 and 3.
After all four: consider `generate-agent-workflows.md` if you want structured agentic development.
```

**If codebase is Active — partial AI setup (Level 1–4):**

```markdown
You have [X]. You're missing [Y].

[List only the agents needed for the gaps found. Skip anything already covered by complete files.]

[If an existing file is thin or stale, note: "Re-run [agent] — existing [file] is [thin/stale]."]
```

---

## Constraints

**Don't recommend agents for files that already exist and appear complete.** If `ARCHITECTURE.md` has substantial, project-specific content, skip `generate-architecture`.

**Do recommend re-running for thin or stale files.** A 20-line `ARCHITECTURE.md` with no folder structure documentation should be flagged.

**Be direct about the early-codebase limitation.** Running context-generation agents on a project with fewer than 5 features produces output that will need to be thrown away and regenerated. Say this plainly.

**Keep the action plan short.** The numbered list is the output. No lengthy explanations, no repeating information the user already has.

**Don't diagnose quality problems in the codebase itself.** This agent assesses AI setup files only — not code quality, architectural violations, or technical debt.

---

## Output

Produce the action plan directly. No preamble. No explanation of what you checked or how you arrived at the recommendations.

Start with:

```markdown
## AI Setup Diagnosis
```
