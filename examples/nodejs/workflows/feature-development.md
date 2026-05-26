---
example: nodejs
version: 0.1.0
---

# Workflow: Feature Development

A structured process for implementing new features in this Express + TypeScript + Prisma API.

Use this workflow when implementing a new API resource or significant capability from a requirement or issue.

---

## When to Use This
- Adding a new resource (new model + CRUD endpoints)
- Adding a significant new capability to an existing resource (e.g., adding order cancellation)
- Any change that touches routes, controllers, services, and repositories together

---

## Before You Start
- Read `ARCHITECTURE.md` — understand layer boundaries before writing any code
- Read `CONTEXT.md` — understand the domain model and business rules for the feature
- Read `MEMORY.md` — check for relevant past decisions (pricing, error handling, test tooling)
- Identify: which Prisma models are affected? Do any schema changes need a migration?

---

## Steps

### 1. Schema changes (if needed)
Update `prisma/schema.prisma` with any new models or fields.
```
npx prisma migrate dev --name add_[feature]
```
Verify the generated migration SQL looks correct before proceeding. Never use `prisma db push` in any environment — always use migrations.

### 2. Write the Zod schema
Create `src/schemas/[feature].schema.ts`.
- One schema per operation: `CreateXSchema`, `UpdateXSchema`, `QueryXSchema`
- Infer TypeScript types: `type CreateX = z.infer<typeof CreateXSchema>`
- No separate TypeScript interfaces — types come from Zod

### 3. Write the repository
Create or update `src/repositories/[Model]Repository.ts`.
- One method per query — name methods after what they return, not how they query
- Use `db.$transaction()` for any multi-model writes
- No business logic — repositories only know how to read and write data

Write repository tests only if the query logic is complex (custom filtering, cursor pagination). Skip for simple CRUD.

### 4. Write the service
Create or update `src/services/[Feature]Service.ts`.
- Inject repositories via constructor
- All business rules live here
- Throw typed errors (`NotFoundError`, `ConflictError`, etc.) — never return `null` for "not found"
- No Express imports

Write unit tests in `tests/unit/services/[Feature]Service.test.ts`:
- Mock repositories with `vi.fn()`
- Test each business rule and error case explicitly

### 5. Write the controller
Create or update `src/controllers/[Feature]Controller.ts`.
- One static method per route handler
- Extract from `req.body` / `req.params` / `req.query`, call service, return `{ data: result }`
- No `try/catch` — let errors propagate to `errorHandler` middleware

### 6. Register the routes
Add to `src/routes/[feature].ts` and register in `src/routes/index.ts`.
- Apply `authMiddleware` to protected routes
- Apply `validate(Schema)` before controller methods
- Group by resource path

### 7. Write integration tests
Create `tests/integration/api/[feature].integration.test.ts`.
- Use `tests/fixtures/app.ts` to create the test Express app
- Use `tests/fixtures/factories.ts` for seed data
- Test the happy path and each error case (401, 403, 404, 409, 422)
- Clean up between tests with `tests/fixtures/db.ts`

---

## Checklist

- [ ] Prisma migration created and reviewed (if schema changed)
- [ ] Zod schema covers all request inputs
- [ ] Repository has no business logic
- [ ] Service has unit tests for all business rules and error paths
- [ ] Controller is thin — no conditions, no direct DB access
- [ ] Routes apply auth and validation middleware correctly
- [ ] Integration tests cover happy path + error cases
- [ ] `env.ts` updated if new environment variables were added
- [ ] `CONTEXT.md` updated if new domain rules were introduced

---

## Common Mistakes

- **Writing Prisma queries in the service** — repositories only. If you need data, add a repository method.
- **Returning `null` from a service** — throw `NotFoundError` instead. Controllers should never check for null.
- **Skipping the Zod schema and typing `req.body as SomeType`** — all request input goes through a Zod schema. Trust nothing from `req.body` without parsing.
- **Using `synchronize: true` or `prisma db push`** — migrations only. `db push` skips migration history.
- **Catching errors in the controller** — let them propagate. The error handler middleware is where errors become HTTP responses.
