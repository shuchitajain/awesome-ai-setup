---
name: generate-context
description: Extract the domain model, business rules, terminology, and user roles from the codebase and generate a CONTEXT.md
---

# Generate CONTEXT.md

You are generating a `CONTEXT.md` file for this repository.

This file captures domain knowledge — what the application does, who uses it, what the core entities are, and what business rules govern them. It is read by AI tools to reduce hallucination on domain-specific behavior and to prevent suggestions that contradict business rules.

**The goal is to document what the application actually does, not what a similar application might do.**

---

## Step 1 — Read the Repository

Gather information from the codebase before writing anything.

**Primary sources (read these):**
1. Any existing documentation: `README.md`, `docs/`, `CONTEXT.md`, wiki files
2. **Entity and model definitions** — files in `domain/entities/`, `models/`, `types/`, or equivalent. These reveal the core domain vocabulary.
3. **Use cases or service layer** — files in `domain/usecases/`, `services/`, `interactors/`, or equivalent. These reveal business operations and rules.
4. **Repository or API interfaces** — reveal what data operations exist
5. **Auth-related files** — reveal user roles and permissions
6. **Routing configuration** — reveals what screens/views exist (= what workflows exist)
7. **Validation logic** — reveals business rules as code

**Secondary sources (read if primary sources are sparse):**
- UI screens/components — reveal user workflows from the user's perspective
- API client code — reveals backend capabilities and data structures
- Test files — often contain realistic domain examples and edge cases

---

## Step 2 — Extract Domain Information

Based on what you read, extract the following. For each item, note your source (file name) and confidence level (certain / inferred / uncertain).

**Core Entities**
List the primary domain objects. For each:
- Name (use the exact class/type name from the code)
- Key fields (from the model definition)
- Relationships to other entities (from foreign keys, nested objects, or join models)
- Status/state machine if present (from enum definitions)

**User Roles**
From auth code, middleware, or role-related models:
- What roles exist?
- What distinguishes each role's permissions?

**Business Operations**
From use cases, service methods, or API endpoints:
- What are the primary operations users can perform?
- What conditions or validations govern those operations?

**Integration Points**
From API client code, SDK usage, or configuration:
- What external services does the app integrate with?
- What is each integration responsible for?

**Constraints and Rules**
From validation code, guards, conditions in use cases:
- What rules govern entity creation or modification?
- What operations are restricted to certain roles?
- What states are mutually exclusive?

---

## Step 3 — Identify Gaps

Some domain context cannot be inferred from code alone. Identify what's missing:

- Business rules that are enforced by the backend but not in the client code
- The "why" behind domain decisions (e.g., why are "completed" and "archived" separate states?)
- User workflows that span multiple screens (hard to infer from individual screen files)
- Out-of-scope features (what the app intentionally does NOT do)
- Non-obvious terminology distinctions

Mark these as `<!-- TODO: add domain context — cannot infer from code -->` in the output.

---

## Step 4 — Generate CONTEXT.md

Using your extracted information, generate the file.

**Structure:**

### Application Overview
2–4 sentences: What does this application do? Who is the primary user? What problem does it solve?

### Core Domain Model
For each primary entity:
```
**[EntityName]** — one-line description
- Key fields and their significance
- Relationships to other entities
- Status values (if applicable)
```

### User Roles
Table or list of roles with their capabilities and restrictions.

### Business Rules
Explicit rules that govern the system. Favor rules that a developer might not infer from reading the code — the non-obvious constraints.

### User Workflows
The primary workflows from the user's perspective. Not screen-by-screen navigation, but the meaningful sequences of actions.

### Domain Terminology
A table of domain-specific terms and how they map to user-facing language or technical concepts. Include terms that could be ambiguous or confused.

### What This Application Does Not Do
Explicit scope boundaries. What features are out of scope? What does the app intentionally exclude?

### Integration Points
What external services the app integrates with and what each one is responsible for.

---

## Constraints

**Document actual domain, not hypothetical.** If an entity is in the code, document it. If a feature isn't implemented, don't document it as if it is.

**Use the exact names from the codebase.** If the model is `WorkspaceMember` not `TeamMember`, use `WorkspaceMember`.

**Don't document generic CRUD.** "Users can create tasks" is not useful domain context — it's obvious from the name. Document non-obvious rules: "a Task cannot be assigned to a Guest user" or "Archiving a Project does not delete its Tasks."

**Flag inferences explicitly.** If you're inferring a business rule from a validation function rather than documentation, note it: `(inferred from validation logic in task_repository_impl.dart)`.

**Mark gaps honestly.** Use `<!-- TODO: verify -->` where you're uncertain, and `<!-- TODO: add domain context -->` where information is missing from the code entirely.

**Length target: 150–300 lines.** Focus on what's non-obvious and what AI tools would get wrong without this context.

---

## Output

Generate the file content directly. Begin with:

```markdown
# Domain Context
```

Do not preface with explanation. Produce the file content only.
