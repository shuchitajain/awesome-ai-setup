# AI Maturity Model

A diagnostic framework for evaluating how well your repository supports AI-assisted development.

The goal is not to reach Level 5. The goal is to identify where you are, understand the gap, and decide which investment makes sense for your team right now.

---

## The Model

```
Level 0 ──── Level 1 ──── Level 2 ──── Level 3 ──── Level 4 ──── Level 5
  Raw          Instructions  Architecture  Tool-        Memory-      Agentic
  Autocomplete               Aware         Connected    Aware
```

---

## Level 0 - Raw Autocomplete

**What you have:** An AI coding assistant installed. Nothing project-specific configured.

**What AI can do:** Suggest idiomatic code in your language. Complete function bodies. Answer general questions about libraries.

**What AI cannot do:** Know your architecture. Know your conventions. Know what decisions you've already made. Know what packages you use or avoid. Know your domain.

**The experience:** Useful for boilerplate and syntax. Actively harmful when it suggests patterns that violate your architecture or recreates things you've moved away from.

**How to level up:** Add a top-level instructions file. `AGENTS.md` is the cross-tool canonical option (natively read by Cursor and GitHub Copilot). Tool-specific alternatives: `CLAUDE.md`, `copilot-instructions.md`, `.cursorrules`. Even 20 lines of focused conventions improves suggestions significantly.

---

## Level 1 - Instructions

**What you have:** A project-level instructions file that AI reads before generating suggestions.

**Common files:**
- `AGENTS.md` - cross-tool canonical agent context (natively read by Cursor and GitHub Copilot)
- `CLAUDE.md` - for Claude Code
- `.github/copilot-instructions.md` - for GitHub Copilot (also handles code review)
- `.cursorrules` - for Cursor
- `.windsurfrules` - for Windsurf

**What AI can do:** Follow basic conventions. Use the right packages. Apply naming patterns. Avoid anti-patterns you've listed.

**What AI cannot do:** Understand your system's shape. Know where things belong. Reason about layer boundaries. Understand your domain.

**How to level up:** The instructions file tells AI what you use and prefer. The next step is telling it *how the system is shaped* - that's `ARCHITECTURE.md`.

---

## Level 2 - Architecture-Aware

**What you have:** Structured documentation of your system that AI can use to reason about where things belong.

**Key files:**
- `ARCHITECTURE.md` - system shape, layers, data flow, conventions
- `CONTEXT.md` - domain model, business logic, terminology, user roles

**What AI can do at this level:**
- Understand where new features should live
- Know which layer a piece of code belongs to
- Understand your data flow before writing a single line
- Apply the repository pattern correctly
- Generate code in the right place with the right dependencies

**In practice:** Without `ARCHITECTURE.md`, AI may create files anywhere and mix concerns across layers. With it, AI knows which folder each piece belongs in and respects layer boundaries without being told.

**The value of `CONTEXT.md`:**

`CONTEXT.md` covers domain knowledge that architecture docs don't - business terminology, user workflows, edge cases, feature intent. It reduces hallucination on domain-specific behavior and prevents AI from suggesting features that contradict your business model.

**How to level up:** Add MCP integrations so AI can query live data - your actual schema, file system, or API.

---

## Level 3 - Tool-Connected

**What you have:** MCP (Model Context Protocol) integrations that give AI access to live data and tools.

**What this enables:**
- AI can read your actual file system and understand real structure, not just documented structure
- AI can query your database schema directly
- AI can search your codebase for usage patterns
- AI can access documentation, APIs, and external services

**Common integrations at this level:**
- **Filesystem MCP** - AI can list, read, and search actual project files
- **GitHub MCP** - AI can read issues, PRs, and comments in context
- **Database MCP** (Supabase, Firebase, Postgres) - AI can query schema directly
- **Search MCP** - AI can search documentation or internal wikis

**The practical difference:**

Without MCP: You describe your database schema in `CONTEXT.md` and hope it's accurate.

With MCP: AI queries the actual schema directly, catches drift between docs and reality, and generates migrations that match the real structure.

**Important caveats:**

MCP is a relatively new protocol and the ecosystem is still forming. Server quality varies significantly. Treat integrations as experimental infrastructure - useful when they work, but don't build critical workflows that depend on them without fallbacks.

→ See [MCP_GUIDE.md](MCP_GUIDE.md) for integration details.

---

## Level 4 - Memory-Aware

**What you have:** A persistent record of architectural decisions, lessons learned, and patterns to avoid.

**Key file:** `MEMORY.md`

**The problem this solves:**

AI assistants don't have persistent memory across conversations. Every new session, they start fresh. Without `MEMORY.md`, you'll repeatedly correct the same mistakes - it'll keep suggesting the same anti-patterns you've moved away from, the same approaches you've tried and abandoned.

`MEMORY.md` is a manually maintained record of decisions that should be permanent context.

**What belongs in `MEMORY.md`:**
- Why you chose Riverpod over BLoC (and why you don't want to revisit it)
- A migration you completed and what the old pattern looked like
- Bugs that came from architectural choices (so AI doesn't recreate the pattern)
- Packages you tried and abandoned, with reasons
- Performance optimizations you've already made
- Patterns that look reasonable but break something in your specific codebase

**What does NOT belong in `MEMORY.md`:**
- General best practices (those belong in instructions)
- Business requirements (those belong in `CONTEXT.md`)
- Architecture documentation (that belongs in `ARCHITECTURE.md`)

**The silent failure mode:**

`MEMORY.md` can become the only place a behavioral constraint lives. An agent reading `ARCHITECTURE.md` to implement a billing feature or refactor a widget will never read `MEMORY.md` unless explicitly instructed — and even when it is, `ARCHITECTURE.md` is treated as the authoritative source.

The fix: active constraints (rules the AI must follow when generating code) belong in `ARCHITECTURE.md` at the relevant section. `MEMORY.md` records the reasoning — what was rejected, what broke, why the decision was made. `MEMORY.md` entries cross-reference `ARCHITECTURE.md`; `ARCHITECTURE.md` does not cross-reference `MEMORY.md`.

**Maintenance:** `MEMORY.md` is only valuable if it's updated. Add an entry when you make a significant architectural decision, complete a migration, or fix a recurring mistake that came from AI suggestions. Stale memory is actively harmful.

---

## Level 5 - Agentic

**What you have:** Defined agents, skills, and multi-step workflows that AI can execute with minimal guidance.

**Key files:**
- `AGENTS.md` - agent role definitions and scope boundaries
- `workflows/` - structured multi-step workflows
- Skill definitions (tool-specific)

**What this enables:**

Instead of asking AI to write a feature from scratch, you ask it to execute a defined workflow:
1. Read the requirements
2. Check architecture for the right location
3. Generate the domain layer first
4. Generate the data layer
5. Generate the presentation layer
6. Generate tests following the project test conventions
7. Update `MEMORY.md` if a new architectural decision was made

**The critical boundary:**

Level 5 is powerful but requires solid foundations. Agentic workflows that don't have Level 1-4 in place produce fast, wrong results. Architecture-unaware agents create technical debt at scale.

---

## Progression Guide

| Your Situation | Recommended Next Step |
|----------------|----------------------|
| New project, fresh start | Level 1 instructions file from day one |
| Active project, AI suggestions feel generic | Add `ARCHITECTURE.md` |
| AI ignores your architecture | Check that AI tool is actually reading the file |
| AI keeps suggesting patterns you've moved away from | Add `MEMORY.md` |
| AI doesn't understand your domain | Add `CONTEXT.md` |
| AI has good context but suggestions are slow | Try MCP - run `generate-mcp-config` |
| Confident in Levels 1-4 | Define your first workflow in `workflows/` |

---

## Common Anti-Patterns

**Jumping to Level 5 with Level 0 foundations.** Agentic workflows need architecture context to be reliable. Without it, they're fast hallucination engines.

**Writing too much in instructions files.** An `ARCHITECTURE.md` that's 3,000 lines won't be fully read or processed. Prioritize ruthlessly. What does AI absolutely need to know?

**Letting files go stale.** A `MEMORY.md` from a year ago describing your old architecture is worse than nothing - AI will follow outdated guidance confidently.

**Global instructions when scoped would work better.** "When editing `*_test.dart` files, always mock via the repository interface" is more precise than adding it to a global instructions file and hoping AI applies it contextually.

**Treating MCP as required.** MCP is optional infrastructure. Levels 1, 2, and 4 produce more consistent value for most teams than Level 3 does today.
