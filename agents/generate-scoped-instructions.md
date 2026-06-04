---
name: generate-scoped-instructions
version: 0.6.0
description: Detect per-file-type conventions across the codebase and generate scoped AI instruction files plus a global instructions file
---

# Generate Scoped Instruction Files

You are generating scoped instruction files for this repository.

Scoped instructions are per-file-type rules that AI coding assistants apply automatically when working with specific files. Unlike a global instructions file (`CLAUDE.md`, `copilot-instructions.md`), scoped instructions apply only to matching files - making them more precise and less likely to cause noise.

**The goal is to capture conventions that are actually present in the codebase, not conventions you'd recommend for this type of project.**

---

## Step 1 - Read the Repository

Gather the information needed to detect actual conventions.

**Required reading:**

1. **Dependency manifest** - what libraries are actually in use (state management, testing, UI framework, code generation)
2. **Existing instruction files** - `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/global.mdc`, `.cursorrules` - don't duplicate what's there
3. **Architecture file** - `ARCHITECTURE.md` if present - understand the layer structure before generating layer-specific instructions

**File sampling - read 3–5 examples of each relevant type:**

For each file type that's significant in this project, sample files to detect conventions:

- **UI components/widgets/screens** - detect base class, spacing patterns, state approach, theming patterns
- **State management files** - detect provider/store/reducer patterns, state structure, naming
- **Test files** - detect mock strategy, test structure, fixture patterns, assertion style
- **Data/API layer files** - detect error handling patterns, serialization approach
- **Domain/business logic files** - detect use case structure, entity patterns

---

## Step 2 - Detect Conventions Per File Type

For each relevant file type, identify the consistent patterns. Assess each pattern:

- **Consistent** (90%+ of sampled files follow it) → include as a rule
- **Majority** (60–90% follow it) → include as a guideline, note it's not universal
- **Mixed** → do not include (inconsistency is something to fix, not document as a convention)

**For each file type, answer:**

*Naming*
- What are files named? (pattern, suffix, case)
- What are classes/components named? (pattern, suffix, case)

*Structure*
- What base class or interface is used consistently?
- What is the consistent internal structure of these files?
- Are there consistent import patterns?

*Patterns*
- What approach is used consistently for state/data/logic in these files?
- What approach is conspicuously absent (never used, even though common in the ecosystem)?

*Anti-patterns*
- Are there any explicit comments warning against specific patterns in these files?
- Is there an inconsistent minority that should be flagged as wrong?

---

## Step 3 - Determine Which Instruction Files to Create

Create one instruction file per meaningful file type grouping. Common groupings:

| File Type | Typical Glob | Typical Coverage |
|-----------|-------------|-----------------|
| UI screens/views | `**/screens/**/*.dart`, `**/views/**/*.tsx` | Layout, state access, navigation |
| UI components/widgets | `**/widgets/**/*.dart`, `**/components/**/*.tsx` | Props, local state, styling |
| State management | `**/*_provider.dart`, `**/*Store.ts`, `**/*.slice.ts` | Structure, naming, patterns |
| Tests | `**/*_test.dart`, `**/*.test.ts`, `**/*.spec.tsx` | Mocking, structure, assertions |
| Data/repositories | `**/*_repository*.dart`, `**/repositories/**` | Error handling, interfaces |

Only create files for groupings where you found meaningful, consistent conventions to document. Do not create empty or generic instruction files.

---

## Step 4 - Generate the Instruction Files

For each file type grouping identified in Step 3, generate scoped instruction files for every AI tool detected as in use.

**Detect which tools are active** by checking:
- `agents/` or `.mcp.json` present → Claude Code in use
- `.github/agents/` or `.github/copilot-instructions.md` or `.vscode/mcp.json` present → Copilot in use
- `.cursor/` or `.cursor/rules/` or `.cursorrules` present → Cursor in use

Generate the same conventions to all detected tools using the format for each:

| Tool | Location | File naming | Frontmatter |
|------|----------|-------------|-------------|
| GitHub Copilot | `.github/instructions/` | `[name].instructions.md` | `applyTo: "[glob]"` |
| Claude Code | `.claude/rules/` | `[name].md` | none required |
| Cursor | `.cursor/rules/` | `[name].mdc` | `globs: [glob]` + `alwaysApply: false` |

Do not generate for tools not detected as in use.

**GitHub Copilot frontmatter:**
```markdown
---
applyTo: "[glob pattern matching the target files]"
---
```
Use comma-separated globs for multiple patterns: `"**/*.ts, **/*.tsx"`.

**Cursor frontmatter:**
```markdown
---
globs: [glob pattern matching the target files]
alwaysApply: false
---
```

**Claude Code:** No frontmatter. Start directly with the `# [File Type] Conventions` heading.

**Content structure for each file:**

```markdown
---
applyTo: "[glob]"
---

# [File Type] Conventions

Brief one-line description of what these conventions cover.

---

## [Category 1]

[Rule or convention with concise explanation]

[Code example showing the correct pattern - use real patterns from the codebase]

---

## [Category 2]
...
```

**Rules for writing each instruction:**

- State what to do, not just what not to do
- Include a code example for any non-obvious rule
- Reference actual class names, library names, and patterns from the codebase
- If a pattern is forbidden, show both the forbidden version and the correct version
- Keep each file under 150 lines - these are scoped for a reason

---

## What to Cover (by file type)

**UI Component/Widget files:**
- Base class or component type
- Local state approach
- Spacing and styling conventions
- Loading and error state handling
- Accessibility considerations that are consistently applied

**State Management files:**
- Class structure and naming
- State shape conventions (immutability, class vs. records)
- Async handling patterns
- How mutations are structured
- What should and should not live in state

**Test files:**
- Mock strategy (what layer to mock)
- Test structure (describe/it, test/group naming)
- Fixture/factory patterns
- Assertion style
- Async handling in tests
- What NOT to test (generated code, framework behavior)

**Data/Repository files:**
- Error handling and exception types
- Interface vs. implementation patterns
- Serialization approach

---

## Also Generate: Global Instructions Files

`AGENTS.md` is natively supported by Cursor and GitHub Copilot as a canonical agent-facing project context file. Check whether `AGENTS.md` exists in the project root before generating tool-specific global files.

**If `AGENTS.md` is already present:**
- **Cursor:** Skip generating a separate Cursor global instructions file. Cursor reads `AGENTS.md` natively as a built-in rule type alongside `.cursor/rules/`.
- **GitHub Copilot:** Skip `.github/copilot-instructions.md` unless there is Copilot-specific content to add (e.g. code review behavior, path-scoped rules, or repository-wide policies distinct from agent instructions). Copilot reads the nearest `AGENTS.md` natively for agent instructions.
- **Claude Code:** Still generate `CLAUDE.md` if absent. First-party documentation does not yet confirm Claude Code auto-loads `AGENTS.md`. If `AGENTS.md` is present, add the following as the **first line** of the generated `CLAUDE.md`:
  ```
  Read AGENTS.md at the start of every session for project context, architectural constraints, and agent definitions.
  ```
  This makes the read explicit and active — Claude Code will follow it.

**General rule for any tool that does not natively read `AGENTS.md`:** If `AGENTS.md` is present and you are generating that tool's global instructions file, prepend the same explicit read instruction above. Do not silently omit a passive reference — it must be phrased as a direct instruction.

**If `AGENTS.md` is absent:**

Generate the appropriate global file for each detected tool:

| Tool | File | Notes |
|------|------|-------|
| GitHub Copilot | `.github/copilot-instructions.md` | Repository-wide instructions; also used by Copilot code review |
| Claude Code | `CLAUDE.md` | Read at every session start |
| Cursor | `.cursor/rules/global.mdc` | Fallback when AGENTS.md is not present; use `alwaysApply: true` frontmatter |

If a file already exists, skip it — do not overwrite.

When generating a global file, it should cover:
- Tech stack (libraries actually in use)
- Architectural rules (what layers exist and their import rules)
- Critical "do not use" list (packages or patterns that are wrong for this project)
- Code generation commands (if build_runner, codegen, etc. is used)

**Also include a Project Context block** — but only for files that actually exist at the time of generation. Before writing the global file, check which of these files are present in the repo:

- `ARCHITECTURE.md`
- `CONTEXT.md`
- `MEMORY.md`
- `AGENTS.md`

If at least one exists, append a `## Project Context` section listing only the files that are present, one bullet each:

```markdown
## Project Context

- ARCHITECTURE.md — project structure, layers, and conventions
- CONTEXT.md — domain model and business rules
- MEMORY.md — past decisions; do not contradict them
- AGENTS.md — canonical agent context: project guidance, agent definitions, and invoke templates
```

Omit any bullet for a file that does not exist. Omit the section entirely if none of the four files exist.

Do not reference `workflows/` here — `generate-agent-workflows` adds that reference when it runs.

Keep it under 80 lines. Scoped files handle the details.

---

## Also Generate: Named Agent Wrappers

Named agent wrappers make the agents in `agents/` natively discoverable in each tool - as a mode dropdown entry in Copilot or a `/skill-name` slash command in Cursor - without duplicating any agent logic.

**How to generate them:**

Scan all `agents/*.md` files. For each, read the `name` and `description` from the YAML frontmatter.

Generate wrappers only for tools detected as in use (same detection logic as scoped instruction files). Skip Claude Code - its `agents/` folder is already the native format. Skip any wrapper file that already exists.

---

### GitHub Copilot wrapper

**Location:** `.github/agents/<name>.md`

```markdown
---
name: <name>
description: <description from source agent frontmatter>
tools: [search/codebase, edit/editFiles, read/readFile]
---

Read agents/<name>.md and execute it on this repository.
```

Each wrapper appears in the Copilot Chat mode dropdown by name. One file per agent.

---

### Cursor wrapper (Agent Skill)

**Location:** `.cursor/skills/<name>/SKILL.md`

The `name` frontmatter field must exactly match the containing folder name.

```markdown
---
name: <name>
description: <description from source agent frontmatter>
---

Read agents/<name>.md and execute it on this repository.
```

Invoke with `/<name>` in Cursor Agent chat, or let the agent auto-trigger based on the description. One folder per agent.

---

## Constraints

**Only document observed conventions, not recommended ones.** If the codebase inconsistently uses two approaches, do not pick one and document it as the convention - flag it instead.

**No generic best practices.** "Prefer composition over inheritance" is not a codebase-specific convention. "Use `HookConsumerWidget` as the base class for all stateful widgets" is.

**Reference actual library names and class names.** Not "the state management library" - "Riverpod's `AsyncNotifier`".

**Scoped files should be additive, not duplicative.** If a rule appears in the global instructions file, don't repeat it in a scoped file.

**Code examples should compile.** Use actual patterns from the codebase. If an example uses a class name, that class should exist (or be a realistic naming-convention example).

---

## Output

For each file to create, output the full file content with a header indicating the file path:

```
## File: [path]

[file content]
```

Group output by file type (e.g. all three screens files together), not by tool. This makes it easier to verify the conventions are consistent across tools.

After all instruction files, list any gaps - conventions that should exist but are too inconsistent in the current codebase to document.

After gaps, list any agent wrapper files to create (Copilot `.github/agents/` and Cursor `.cursor/skills/`), grouped by tool.
