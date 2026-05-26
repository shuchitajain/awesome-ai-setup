# Context Engineering

How to write context that actually improves AI output.

---

## What Context Engineering Is

Context engineering is the practice of structuring your repository so AI tools have accurate, useful information before they generate code.

It's not:
- Writing longer prompts
- Documenting everything
- Adding more comments
- Fine-tuning a model

It's the deliberate design of what information AI tools can access, how that information is structured, and how it's scoped to different situations.

The mental model: you're building the briefing that a new senior engineer would need to contribute effectively to your codebase on day one. Except this engineer starts every session with zero memory of previous conversations.

---

## Types of Context

There are five distinct types of context. Each one has a different job.

### 1. Structural Context

**What:** How your code is organized. Layer boundaries. What lives where. Naming conventions. File structure.

**Where:** `ARCHITECTURE.md`

**Job:** Prevent AI from putting code in the wrong place. Enable AI to understand dependencies correctly. Let AI generate code that fits the system shape without you explaining it every time.

### 2. Domain Context

**What:** What your application does. Business terminology. User workflows. Edge cases. Feature behavior.

**Where:** `CONTEXT.md`

**Job:** Reduce hallucination on domain-specific behavior. Help AI understand the "why" behind features. Prevent suggestions that violate business rules.

### 3. Memory Context

**What:** Decisions you've made and don't want to revisit. Patterns you've moved away from and why. Anti-patterns specific to your codebase. Past mistakes.

**Where:** `MEMORY.md`

**Job:** Prevent AI from recommending patterns you've already rejected. Carry forward the reasoning behind architectural decisions. Avoid repeating corrected mistakes across sessions.

### 4. Instruction Context

**What:** Conventions, preferences, rules that should always apply. What to use and what to avoid.

**Where:** `CLAUDE.md`, `copilot-instructions.md`, scoped instruction files

**Job:** Set the baseline for every interaction. Equivalent to team standards written once, applied automatically.

### 5. Tool Context

**What:** Real-time access to your actual project state - file system, database schema, documentation, external APIs.

**Where:** MCP integrations

**Job:** Bridge the gap between what you've documented and what's actually true. Let AI query live data instead of relying on descriptions.

---

## Writing Structural Context (ARCHITECTURE.md)

This is the most impactful context file for most projects. Here's how to write one that works.

**Lead with the shape of the system.**

Start with a 3-5 sentence summary of how the system is organized. What are the major layers? What's the data flow direction? What's the primary organizational principle (feature-first, layer-first, domain-driven)?

```markdown
## System Overview

This app uses a feature-first Clean Architecture with three layers:
data, domain, and presentation. Each feature is self-contained under
`lib/features/`. State management is Riverpod throughout. Data flows
one direction: UI → providers → use cases → repositories → data sources.
```

**Include the folder structure with intent, not just names.**

Don't just paste `tree` output. Annotate what each folder is for.

```markdown
lib/
├── core/                    # shared infrastructure, not feature-specific
│   ├── errors/              # failure types and exception hierarchy
│   ├── router/              # GoRouter configuration
│   └── theme/               # design tokens, not widget styling
├── features/
│   └── [feature_name]/
│       ├── data/            # implementation detail - repositories, API calls
│       ├── domain/          # business rules - entities, repository interfaces, use cases
│       └── presentation/    # Flutter-specific - screens, widgets, providers
└── shared/
    └── widgets/             # reusable UI components used across features
```

**Make layer rules explicit.**

AI needs to know what can import what. Implicit rules get violated. Write them as constraints.

```markdown
## Layer Rules

- Presentation imports from domain only (never from data)
- Domain has zero Flutter dependencies
- Data implements domain interfaces
- Core is importable by all layers
- Features do not import from other features directly
```

**Describe the data flow concretely.**

A diagram is worth the space. Even ASCII art.

```markdown
## Data Flow

User Action → Widget → Provider (Riverpod) → UseCase → Repository (interface)
                                                              ↓
                                                    RepositoryImpl (data layer)
                                                              ↓
                                                    RemoteDataSource / LocalDataSource
```

**Include a feature template.**

Show what a complete feature looks like. AI will model new features on this.

**Keep it scannable.** Use headers, bullet points, and code blocks. Dense prose doesn't get processed well. AI reads this file token by token - structure matters.

---

## Writing Domain Context (CONTEXT.md)

Domain context is harder to write because it requires translating business knowledge into documentation. Focus on what's ambiguous or non-obvious.

**Start with the domain model.**

What are the core entities? What are their relationships? What terminology is domain-specific?

```markdown
## Core Entities

**Task** - a unit of work with a due date, assignee, and status. Tasks can be
           standalone or part of a Project.
**Project** - a container for related Tasks with its own deadline and owner.
**Workspace** - top-level organizational boundary. A User belongs to one or
                more Workspaces.
```

**Document user roles and their capabilities.**

```markdown
## User Roles

**Owner** - full admin access, can delete workspace
**Admin** - can manage members and billing, cannot delete workspace
**Member** - can create and edit tasks, cannot change workspace settings
**Guest** - read-only access to specific projects only
```

**Call out non-obvious business rules.**

```markdown
## Business Rules

- Archiving a Project does not delete its Tasks - they become orphaned
- A Task cannot be assigned to a Guest user
- Due dates are stored in UTC, displayed in the user's local timezone
- "Completed" and "Archived" are different states - completed tasks remain
  visible; archived tasks are hidden by default
```

**Document what the app does NOT do.**

This prevents AI from suggesting features outside your scope.

```markdown
## Out of Scope

- This app does not support real-time collaboration - no live cursors, no
  operational transforms
- There is no public API - all data access is through the app
- We do not support SSO - email/password and Google sign-in only
```

---

## Writing Memory Context (MEMORY.md)

`MEMORY.md` is a decision log, not documentation. The format should emphasize *why* over *what*.

**Structure entries like this:**

```markdown
## [Date] Decision: Migrated from BLoC to Riverpod

**Context:** We had 40+ BLoC classes, many with identical patterns.
Boilerplate was significant and test setup was verbose.

**Decision:** Migrate to Riverpod 2.x with Notifiers.

**Consequences:**
- No more Cubit/BLoC classes anywhere in the codebase
- State classes use Freezed
- Providers replace BLoC injection in widget tree

**What to avoid:** Do not suggest BLoC, Cubit, or flutter_bloc package.
If asked about state management, the answer is Riverpod.
```

**Be direct about anti-patterns:**

```markdown
## Anti-Pattern: Direct Navigator calls

We had bugs from Navigator.push() being called inside business logic.
All navigation is now handled through GoRouter via named routes.
Never use Navigator.push/pop directly. Use context.push() or context.go()
from the GoRouter API.
```

---

## Common Mistakes

**Writing for humans, not AI.** AI doesn't need prose-heavy explanations. It needs clear structure, explicit rules, and concrete examples. Be direct and specific.

**Documenting the obvious.** Don't explain Riverpod to AI - it already knows Riverpod. Document how *your* project uses Riverpod. The conventions, the patterns, the specific rules that are unique to your codebase.

**Too much context.** Token limits are real. A 5,000-line `ARCHITECTURE.md` is worse than a focused 500-line one. AI tools may not process the full file, or may weight later content less. Prioritize ruthlessly.

**Static files in dynamic projects.** Context files that don't get updated become liabilities. If your architecture changed and `ARCHITECTURE.md` still describes the old structure, AI will confidently generate wrong code. Assign ownership for keeping these files accurate.

**One file for everything.** Scoped context is more useful than one giant instructions file. A `riverpod.instructions.md` scoped to `*.dart` files is more precise than adding Riverpod conventions to a global file and hoping they apply.

**Not testing your context.** After writing `ARCHITECTURE.md`, ask AI where a new feature should be created. Does it get it right? Ask it to generate a new repository - does it follow the pattern? Context files need testing like code does.

---

## Context Quality Checklist

Before publishing a context file:

- [ ] Does it explain *your* conventions, not general ones?
- [ ] Does it use your actual folder names and file names?
- [ ] Does it include explicit rules, not just descriptions?
- [ ] Can you scan it quickly and find specific information?
- [ ] Does it cover what AI gets wrong most often in your codebase?
- [ ] Is it short enough that AI will process the whole thing?
- [ ] Is there an owner responsible for keeping it updated?

---

## Token Budget Considerations

Different AI tools have different context windows and use different strategies for what they include. Some general guidance:

- Keep each file focused on one type of context
- Put the most critical information at the top of the file
- Use headers to help AI locate relevant sections
- Prefer lists and code blocks over long paragraphs
- Avoid repeating information across files (it wastes budget and can create conflicts)

These guidelines will evolve as AI context handling improves.
