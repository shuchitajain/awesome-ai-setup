---
name: generate-architecture
version: 0.1.0
description: Analyze the repository to detect the actual architecture and generate an accurate ARCHITECTURE.md from observed patterns
---

# Generate ARCHITECTURE.md

You are generating an `ARCHITECTURE.md` file for this repository.

This file will be loaded as persistent context for AI coding assistants. Its job is to tell AI tools where things belong, how the system is organized, and what the rules are — before they write a single line of code.

**Accuracy matters more than completeness.** An incomplete file that is entirely correct is more useful than a comprehensive file with invented details.

---

## Step 1 — Read the Repository

Before writing anything, gather information. Read these in order:

1. **Top-level directory listing** — understand the repo structure
2. **Primary source directory** (`lib/`, `src/`, `app/`, or equivalent) — list all subdirectories
3. **Dependency manifest** — read `pubspec.yaml`, `package.json`, `Cargo.toml`, `go.mod`, or equivalent. Note the state management, routing, DI, and testing libraries actually present.
4. **Detect the primary framework version** by running the appropriate command:
   - Flutter → `flutter --version` (captures Flutter version, Dart version, and channel)
   - Node.js / React / Next.js → `node --version`; read `react`, `next`, `vue`, `svelte`, or `angular` version from the manifest
   - Rust → `rustc --version`
   - Go → `go version`
   - Python → `python3 --version`
   If the command fails or the tool is not on PATH, note "version unavailable" and continue.
5. **Sample 4–6 files** from different areas of the codebase:
   - A file that manages state (store, provider, notifier, view model, reducer)
   - A screen, view, or component file
   - A data access file (repository, service, API client, data source)
   - A domain/business logic file (use case, interactor, domain service) if present
   - A test file
5. **Router/navigation config** if it exists as a separate file

Do not proceed to Step 2 until you have read actual code. Do not infer from dependency names alone.

---

## Reference Example (Optional)

Check for a reference example in this order:
1. `.ai/reference/*/ARCHITECTURE.md` — if the user copied one during setup
2. `node_modules/awesome-ai-setup/examples/*/ARCHITECTURE.md` — if the package is installed locally

If neither path exists, skip this section entirely and proceed to Step 2.

Use it as a **structural guide only** — what sections to include and how to format them. Do not copy its content; it describes a different project. All content must come from reading this codebase in Step 1.

---

## Step 2 — Answer These Questions

Based only on what you read in Step 1, answer each question. If you cannot answer from evidence, write "not observed".

**Code Organization**
- Is the project organized by layer (models/, controllers/, views/) or by feature/module?
- What is the primary source directory?
- Are features/modules self-contained vertical slices, or do they share a common layer structure?
- Are there any naming patterns in folder names? (e.g., `*_feature`, `*_module`, `screens/`)

**State Management**
- What library/pattern is used for state management? (name it from the actual import, not a guess)
- How is state structured? (classes, records, sealed classes, plain objects?)
- Where do state changes originate — in the UI layer, a controller/notifier layer, or a dedicated store?

**Data Access**
- Is there a repository pattern (interfaces separate from implementations)?
- Is there a local persistence layer (cache, database, shared preferences)?
- How does the app communicate with remote services? (REST, GraphQL, Firebase SDK, gRPC, etc.)
- Are API/data models separate from domain entities?

**Navigation**
- What navigation library or pattern is used?
- Are routes defined in one place (centralized) or per-screen?
- Is there route-level authentication/authorization guarding?

**Dependency Injection**
- Is there a DI container or service locator?
- Or are dependencies composed through the state management layer (e.g., Riverpod providers)?

**Naming Conventions**
- File naming: snake_case, camelCase, PascalCase?
- Class naming patterns: what suffixes are used? (Repository, Service, Controller, ViewModel, Notifier, Store?)
- Test file naming: where are tests located, what suffix?

---

## Step 3 — Generate ARCHITECTURE.md

Using your answers from Step 2, generate the file.

**Structure your output with these sections** (omit sections that don't apply to this project):

### System Overview
3–5 sentences describing how this project is actually organized. Mention the organizational principle (feature-first, layer-first, domain-driven), the state management approach, and the data flow direction. **Include the exact primary framework and runtime versions detected in Step 1.4** (e.g. `Flutter 3.29.3 • Dart 3.7.2` or `Next.js 15.3.2 • Node 22.13.0`). If the version was unavailable, note that explicitly.

### Folder Structure
Show the actual directory tree with annotations. Use the real folder names from Step 1. Annotate each folder with its purpose (one short phrase). Do not invent folders that don't exist.

```
[actual source root]/
├── [actual folder]/    # what this folder is for
│   └── [actual subfolder]/    # what this is for
```

### Layer Rules (if a layered architecture exists)
State the import rules explicitly. What can import what? What cannot import what?

### Data Flow
A concise diagram showing how data moves from user action to data source and back. Use the actual layer names from this codebase.

### State Management Pattern
Describe how state is structured and updated in this specific project. Show a representative example pattern using actual class names if possible.

### Navigation
How routing is configured and how navigation calls are made in this project.

### Key Conventions
A table or list of naming conventions, file organization rules, and any other patterns that are consistent across the codebase.

---

## Constraints

**Include only observed patterns.** If you didn't see a repository pattern in the actual files, don't document one.

**Use actual names.** Use the real folder names, file names, class names, and library names from this project. Replace generic terms ("YourFeature", "SomeService") with actual examples from the codebase.

**Mark uncertainty explicitly.** If you observed something inconsistent, note it. If you're uncertain about a pattern, mark the section with `<!-- TODO: verify -->`.

**No generic explanations.** Do not explain what Clean Architecture is, what Redux is, what dependency injection is. Assume the reader knows these patterns. Document how *this project* uses them.

**No aspirational content.** Do not write "this should be..." or "ideally...". Document current reality only.

**Length target: 200–400 lines.** This file needs to be fully read by AI tools on every invocation. Prioritize what AI needs to know to put code in the right place and follow the right patterns.

---

## Output

Generate the file content directly. Begin the output with:

```markdown
# Architecture
```

Do not preface the output with explanation. Do not add a preamble about what you did. Just produce the file.
