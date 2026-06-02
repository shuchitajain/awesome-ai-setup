# Node.js REST API Example

This is a reference example of what a fully set-up AI context looks like for an **Express + TypeScript + Prisma** REST API project.

The files here are example outputs from the `awesome-ai-setup` agents - they show the format, depth, and specificity that makes AI context useful. They describe a fictional "ShopAPI" (multi-vendor e-commerce). When you run the agents on your actual project, they will generate files specific to your real codebase.

---

## Stack

- Node.js 22.x + TypeScript (strict)
- Express 5.x
- Prisma 6.x + PostgreSQL
- Zod 4.x (validation)
- Vitest (testing)
- Pino (logging)
- JWT + refresh token rotation

---

## What's in this example

| File | What it shows |
|---|---|
| `ARCHITECTURE.md` | Folder structure, layer conventions, error handling, response format, auth pattern |
| `CONTEXT.md` | Domain model (ShopAPI entities), business rules, API conventions |
| `MEMORY.md` | Key decisions (Express over NestJS, Prisma over TypeORM, Vitest over Jest, integer prices) and recurring AI anti-patterns |
| `AGENTS.md` | Canonical agent context: project-wide guidance + five agent definitions (API Designer, Service Layer Implementer, Repository Writer, Controller Writer, API Test Writer) |
| `workflows/feature-development.md` | 7-step workflow: schema → repository → service → controller → routes → integration tests |
| `workflows/bug-fixing.md` | Reproduce-first debugging workflow with layer tracing |
| `workflows/refactoring.md` | Layer-by-layer refactoring with blast-radius analysis |
| `.github/copilot-instructions.md` | Optional Copilot overlay: stack, layer rules, conventions, and what NOT to suggest (AGENTS.md handles agent instructions) |

---

## How to use this example

### Option A - Run the agents on your project (recommended)

```bash
# From your project root
node /path/to/awesome-ai-setup/bin/cli.js
# Or after npm install:
npx awesome-ai-setup
```

Then run the `diagnose-and-setup` agent. It will generate files specific to your actual codebase. Use this example as a quality bar - your generated files should be at least this specific.

### Option B - Adapt directly

If your project is also Express + TypeScript + Prisma, you can start from these files and adapt them:
- Replace "ShopAPI" domain model with your actual entities and business rules
- Replace `MEMORY.md` decisions with your actual architectural choices
- Replace agent definitions with roles that match your actual layer structure
- Update `copilot-instructions.md` with your real tech stack and conventions

---

## What makes this context useful

- **Specific, not generic** - "Controllers must not import `@prisma/client`" is useful. "Follow clean architecture principles" is not.
- **Decisions are locked in** - MEMORY.md says "do not suggest NestJS" because the team evaluated it and moved on. AI tools stop relitigating decided questions.
- **Anti-patterns are named** - "AI suggests storing prices as floats" documents a real recurring problem. Naming it prevents it.
- **Workflows are architecture-specific** - "Use `db.$transaction()` for multi-model writes" is specific to this stack. Generic "write tests" advice wastes tokens.
