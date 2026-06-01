---
name: update-memory
version: 0.1.0
description: Audit current decisions, abandoned patterns, and anti-patterns in the codebase, and generate or update MEMORY.md
---

# Update MEMORY.md

You are generating or updating a `MEMORY.md` file for this repository.

This file records decisions that should persist across AI sessions - architectural choices that were made (and should not be re-litigated), patterns that were abandoned (and should not be reintroduced), and anti-patterns specific to this codebase (that AI tools repeatedly get wrong).

**MEMORY.md is a decision log, not documentation.** It should be opinionated, direct, and focused on what AI tools need to know to avoid repeating past mistakes.

---

## Step 1 - Read the Repository

Gather information to understand the current state and history.

**Read these sources:**

1. **Dependency manifest** (`pubspec.yaml`, `package.json`, etc.) - what's currently used tells you what was chosen. Look for what's notably absent (e.g., no `flutter_bloc` in a Flutter project means BLoC was either never used or was removed).

2. **Primary source directory structure** - the organizational pattern reveals architectural decisions.

3. **State management files** - how state is currently structured and what pattern is used.

4. **Existing `MEMORY.md`** or `ARCHITECTURE.md` if present - don't duplicate what's already there.

5. **Comments and TODOs in code** - `// TODO: migrate this`, `// legacy: remove after X`, `// do not use Provider here` - these are explicit memory signals left by developers.

6. **Any `CHANGELOG.md`, `DECISIONS.md`, or `ADR/` directory** - formal decision records.

7. **Test files** - the mock strategy reveals decisions about test boundaries.

**If git is available:**
- Run `git log --oneline -50` to see recent commit history. Migration commits, refactor commits, and "remove X" commits are strong signals.
- Check for commits with messages like "migrate from X to Y", "remove deprecated", "switch to", "replace".

---

## Reference Example (Optional)

Check for a reference example in this order:
1. `.ai/reference/*/MEMORY.md` - if the user copied one during setup
2. `node_modules/awesome-ai-setup/examples/*/MEMORY.md` - if the package is installed locally

If neither path exists, skip this section entirely and proceed to Step 2.

Use it as a **structural guide only** - what sections to include and how to format them. Do not copy its content; it describes a different project. All content must come from reading this codebase in Step 1.

---

## Step 2 - Identify Decisions

For each decision you can identify with confidence, note:
- **What was decided** (the current state)
- **What was not chosen** or what was abandoned (if detectable)
- **Evidence** (where you found this)

**Categories to look for:**

**Package/Library Choices**
- State management library: what's used, what's conspicuously absent
- Navigation library: what's used
- HTTP/networking: what's used
- Local storage: what's used
- Testing: what's used for mocks
- Code generation: what's used

**Architectural Pattern Choices**
- Feature organization vs. layer organization
- Repository pattern: present or absent
- Domain layer: pure vs. mixed
- DI approach: container vs. composition

**Widget/Component Conventions** (for Flutter/React/etc.)
- Base class or component type used consistently
- Local state approach (hooks, setState, etc.)

**Code Generation Decisions**
- What annotations are used consistently
- What generation tools are configured

---

## Step 3 - Identify Anti-Patterns

Look for signals that certain patterns were tried and abandoned or explicitly warned against:

1. **Code comments** explicitly warning against patterns: `// don't use Navigator directly`, `// avoid StatefulWidget here`
2. **TODO/FIXME comments** describing patterns to remove: `// TODO: migrate off Provider`
3. **Linting rules** in `analysis_options.yaml`, `.eslintrc`, etc. that ban specific patterns
4. **Test helper patterns** that reveal what should be mocked vs. not
5. **Consistency violations** - if 90% of widgets use pattern A but 10% use pattern B, pattern B is likely legacy

---

## Step 3.5 - Route Active Constraints to ARCHITECTURE.md

Before writing `MEMORY.md` entries, identify which findings are **active behavioral constraints** — rules that must affect how AI generates code right now (e.g., "never use float for prices", "always extend `HookConsumerWidget`", "never call Prisma outside repositories").

These constraints must exist in `ARCHITECTURE.md` at the relevant section. If the constraint is not already there, add it before (or alongside) writing the `MEMORY.md` entry.

`MEMORY.md` entries for these decisions should include a cross-reference:

```markdown
**Constraint documented in:** `ARCHITECTURE.md` > [Section Name] — this entry records the reasoning and what was rejected.
```

Do not let `MEMORY.md` be the only place a behavioral constraint lives. If an agent reads only `ARCHITECTURE.md` for a task, it will miss the constraint entirely.

---

## Step 4 - Generate MEMORY.md

Generate the file with entries organized into these sections:

### Architectural Decisions

One entry per significant decision. Format:

```markdown
### Decision: [short name]

**What:** [The decision that was made - stated directly]
**Evidence:** [Where you found this - file name, commit message, comment]
**What to avoid:** [The specific pattern/package/approach to NOT suggest]
```

If you can infer *why* from comments or commit messages, include it. If not, omit the why - do not fabricate reasons.

### Patterns In Use

List the established patterns AI should follow. These are not decisions with alternatives - they're the current standard:

```markdown
- [Pattern name]: [one-line description of the pattern as it exists in this project]
```

### Anti-Patterns

Patterns that have caused problems or been explicitly rejected. Direct and specific:

```markdown
### [Pattern name]

**Don't do this:**
[code example if helpful]

**Reason:** [Why this is wrong for this project - inferred from code, comments, or history]

**Do this instead:**
[correct approach]
```

Only include anti-patterns you have evidence for. Do not include generic best practices.

### Recurring AI Suggestion Problems

If you can identify patterns that are generically common but wrong for this project (e.g., a commonly suggested package that's not used), list them:

```markdown
- AI often suggests [X]. This project does not use [X] - use [Y] instead.
```

---

## Constraints

**Only document decisions with evidence.** If you cannot point to code, a comment, a commit, or a dependency file as evidence, do not create an entry. This file should not contain guesses.

**Be direct about what to avoid.** The audience is an AI tool. "Do not use flutter_bloc" is more useful than "Riverpod is preferred over BLoC for state management in this project."

**Do not document general best practices.** "Prefer const constructors" is a general Flutter rule, not a project-specific memory. Only document patterns specific to this codebase - patterns that AI would get wrong without this context.

**Do not repeat `ARCHITECTURE.md` content.** If the architectural decision is already described structurally in `ARCHITECTURE.md`, don't duplicate it. MEMORY.md captures the *decisions and warnings*, ARCHITECTURE.md captures the *current structure*.

**Mark speculation clearly.** If you're inferring a decision rather than observing it directly, write: `(inferred - verify with team)`.

**Length target: 100–250 lines.** This file should be focused. Long MEMORY.md files suggest everything was included, not the important things.

---

## If MEMORY.md Already Exists

Read it first. Then:
- Add new decisions you found that aren't already documented
- Update entries that appear to be stale (e.g., entry says "migrate from X" and the migration is complete)
- Flag entries that appear to conflict with current code with `<!-- TODO: verify if still current -->`
- Do not delete existing entries unless you have clear evidence they're wrong

---

## Output

Generate the file content directly. Begin with:

```markdown
# Memory
```

Followed by a brief one-line note:
```
_Last updated: [today's date]. Re-run the `update-memory` agent after major architectural changes._
```

Then the sections. Do not preface with explanation.
