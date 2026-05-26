---
example: flutter
version: 0.1.0
---

# Agent Definitions

This file defines the AI agents used in this project, their responsibilities, scope boundaries, and how to invoke them.

Agents in this context are structured prompts that give an AI assistant a specific role for a specific class of task. They work best in Claude Code, Cursor, and similar tools that support persistent sessions with file context.

---

## Why Define Agents

Without defined agents, AI assistance tends toward being a general-purpose code generator. That's fine for isolated tasks, but for repeatable workflows - "add a new feature", "review a PR for architecture violations", "investigate this crash" - a scoped agent with explicit boundaries produces more consistent results.

Agents also make the AI's scope explicit. "Implement this feature" without scope can mean anything. "Act as the domain layer architect - generate entities, repository interfaces, and use cases only - stop before the data layer" is specific enough to be useful and verifiable.

---

## Agents

### Feature Architect

**Role:** Design the domain layer for a new feature.

**Scope:** `lib/features/[feature]/domain/` only. Entities, repository interfaces, use cases.

**Does NOT do:** Data layer implementation, providers, UI.

**Invoke with:**
```
Act as the Feature Architect for this Flutter project.
Your job: design the domain layer for a new [feature_name] feature.

Context files to read:
- ARCHITECTURE.md (system overview, layer rules, naming conventions)
- CONTEXT.md (domain model and business rules)
- MEMORY.md (decisions and patterns to avoid)

Deliver:
1. Entity class(es) with Freezed
2. Repository interface (abstract class)
3. Use case class(es) - one per operation

Rules:
- Domain layer is pure Dart - no Flutter, no Firebase, no dio imports
- Follow naming conventions in ARCHITECTURE.md
- Stop after domain layer - do not generate data or presentation code
- If a business rule is unclear, state the assumption explicitly
```

**Quality check:** The generated code should compile with `dart compile` and have no Flutter or external dependencies beyond `freezed_annotation`.

---

### Data Layer Engineer

**Role:** Implement the data layer for a defined domain.

**Scope:** `lib/features/[feature]/data/` only. Models, data sources, repository implementation.

**Prerequisite:** Domain layer (entities, repository interface) must exist first.

**Invoke with:**
```
Act as the Data Layer Engineer for this Flutter project.
Your job: implement the data layer for the [feature_name] feature.

Context files to read:
- ARCHITECTURE.md (layer structure, naming conventions)
- MEMORY.md (anti-patterns, migration history)
- lib/features/[feature]/domain/ (read all files - implement these interfaces)

API documentation / schema: [paste relevant docs or schema]

Deliver:
1. Model class(es) extending entities with fromJson/toJson (use Freezed)
2. Remote data source interface and implementation (using dio)
3. Local data source if caching is needed (using Hive)
4. Repository implementation (implements the domain interface)
5. Provider definitions for each new class

Rules:
- Repository implementation must implement the domain interface exactly
- Error handling: catch DioException, throw typed AppException subclasses
- Models map cleanly to entities via toEntity() extension
- Do not import from presentation layer
```

---

### Provider & State Engineer

**Role:** Wire Riverpod providers and define state for a feature.

**Scope:** `lib/features/[feature]/presentation/providers/` only.

**Prerequisite:** Domain and data layers must exist.

**Invoke with:**
```
Act as the Provider & State Engineer for this Flutter project.
Your job: implement Riverpod providers and state classes for the [feature_name] feature.

Context files to read:
- ARCHITECTURE.md (Riverpod conventions, provider naming)
- MEMORY.md (state management decisions, patterns to avoid)
- .github/instructions/riverpod.instructions.md
- lib/features/[feature]/domain/ (use these interfaces)

Deliver:
1. State class(es) using Freezed (if complex state needed)
2. AsyncNotifier or Notifier class(es)
3. Use case provider definitions
4. Repository and datasource provider definitions

Rules:
- Use riverpod_annotation (@riverpod) for all providers
- AsyncNotifier for async state, Notifier for sync state
- State classes use Freezed - no manual copyWith
- ref.watch in build(), ref.read in callbacks
- Expose methods that call use cases - no direct repository access from notifiers
- Do not generate any UI code
```

---

### UI Builder

**Role:** Implement screens and widgets from a spec.

**Scope:** `lib/features/[feature]/presentation/screens/` and `presentation/widgets/` only.

**Prerequisite:** Providers must be defined and working.

**Invoke with:**
```
Act as the UI Builder for this Flutter project.
Your job: implement the [screen_name] screen and its widgets.

Context files to read:
- ARCHITECTURE.md (UI conventions)
- MEMORY.md (widget anti-patterns)
- .github/instructions/widgets.instructions.md
- lib/features/[feature]/presentation/providers/ (use these providers)
- Design spec: [paste wireframe description or requirements]

Deliver:
1. Screen class (HookConsumerWidget)
2. Widget decomposition - identify sub-widgets and implement them
3. Skeleton/loading state
4. Error state with retry

Rules:
- HookConsumerWidget as default base class (StatelessWidget only for pure display)
- No hardcoded colors or spacing - use AppColors and AppSpacing
- All strings through AppLocalizations
- Navigation via GoRouter (context.go / context.push)
- ref.watch in build, ref.read in callbacks
- Do not touch providers or domain - consume existing interfaces only
```

---

### Test Writer

**Role:** Write tests for a completed feature layer.

**Scope:** `test/features/[feature]/` matching the layer specified.

**Invoke with:**
```
Act as the Test Writer for this Flutter project.
Your job: write tests for the [layer] layer of the [feature_name] feature.

Context files to read:
- .github/instructions/testing.instructions.md (conventions and patterns)
- ARCHITECTURE.md (layer rules)
- lib/features/[feature]/[layer]/ (all files being tested)
- test/helpers/ (available test helpers and fixtures)

Target layer: [domain | data | providers | widgets]

Deliver:
- Test file(s) with group/test structure following naming conventions
- Mock setup using mocktail
- Happy path and error path coverage
- Fixtures added to test/helpers/ if new entities are needed

Rules:
- Mock at repository layer (not data source) for provider and widget tests
- Use ProviderContainer for provider tests
- Use ProviderScope with overrides for widget tests
- Test behavior, not implementation
- Do not modify lib/ files - tests only
```

---

### Architecture Reviewer

**Role:** Review code for layer boundary violations and architectural correctness.

**Scope:** Read-only review of specified files.

**Invoke with:**
```
Act as the Architecture Reviewer for this Flutter project.
Your job: review [file paths or feature name] for architectural correctness.

Context files to read:
- ARCHITECTURE.md (layer rules, naming conventions)
- MEMORY.md (patterns to avoid)

Review for:
1. Layer boundary violations (e.g., domain importing Flutter, presentation importing data)
2. Naming convention violations
3. Missing or incorrect Riverpod patterns (ref.read in build, etc.)
4. Business logic in wrong layer
5. Navigation using Navigator instead of GoRouter
6. Hardcoded strings, colors, or spacing
7. StatefulWidget usage where HookConsumerWidget should be used

Deliver:
- List of violations with file:line references
- Brief explanation of why each is a violation
- Suggested fix for each

Do NOT rewrite the code - review and report only.
```

---

## Agent Limitations

These agents work best when:
- The relevant context files (`ARCHITECTURE.md`, `MEMORY.md`) are up to date
- The task is scoped to one layer at a time
- The prerequisite layers already exist

They work poorly when:
- Context files are stale or missing
- The task is vague ("make the app better")
- Multiple concerns are mixed in one request

Agents are starting points, not complete solutions. Review generated code against the same checklist you'd use for a human PR.
