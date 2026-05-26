# Project Instructions

These instructions apply to this Node.js API project for all AI coding assistance.

---

## Tech Stack

- **Node.js 22.x** with TypeScript (strict mode - no `any`, no `noImplicitAny` overrides)
- **Express 5.x** for HTTP routing
- **Prisma 6.x** with PostgreSQL - schema-first, migrations only (no `db push`, no `synchronize`)
- **Zod 4.x** for request validation - schemas are the source of truth, types are inferred
- **Vitest** for unit and integration tests - not Jest
- **Pino** for structured JSON logging
- **jsonwebtoken** for JWT signing/verification
- **bcryptjs** for password hashing

---

## Architecture

Four layers - one-way dependency direction:

```
routes/ → controllers/ → services/ → repositories/ → Prisma
```

- **Routes** (`src/routes/`): register middleware, delegate to controllers
- **Controllers** (`src/controllers/`): extract request data, call one service, return response
- **Services** (`src/services/`): all business logic - no Express imports
- **Repositories** (`src/repositories/`): all Prisma queries - no business logic

See `ARCHITECTURE.md` for the full folder structure and layer conventions.

---

## Rules

### Layer boundaries
- Controllers must not import `@prisma/client` or call `db.*` directly
- Services must not import from `express` - no `Request`, `Response`, `NextFunction`
- Repositories must not contain business logic or call other repositories
- If you need data from another domain, call its service, not its repository

### Error handling
- Services throw typed errors from `src/utils/errors.ts` (`NotFoundError`, `ConflictError`, etc.)
- Controllers do not catch errors - let them propagate to `errorHandler` middleware
- Never return `null` from a service to indicate "not found" - throw `NotFoundError`

### Validation
- All `req.body`, `req.params`, and `req.query` input is validated via Zod schemas in `src/schemas/`
- Do not use `req.body as SomeType` without a Zod parse - trust nothing from the request
- Types are inferred from Zod schemas: `type CreateUser = z.infer<typeof CreateUserSchema>`
- Do not write separate TypeScript interfaces that duplicate Zod schema shapes

### Environment variables
- Access `process.env` only in `src/env.ts`
- Import `env` from `src/env.ts` everywhere else
- Never pass `process.env.SOMETHING` directly to a service or utility

### Prisma and database
- All Prisma queries live in `src/repositories/` - nowhere else
- Multi-model writes use `db.$transaction()`
- Migrations only - never `prisma db push` or `synchronize: true`
- Import the Prisma singleton from `src/db.ts` - never `new PrismaClient()` inline
- Prices are stored as integers (cents) - never floats or decimals for monetary values

### TypeScript
- `strict: true` is non-negotiable - do not add `@ts-ignore` or `as any`
- Use `unknown` with type guards instead of `any`
- No `noUnusedLocals` suppressions - remove unused code rather than suppressing the warning

### Testing
- Unit tests: `tests/unit/` - mock repositories with `vi.fn()`, no database
- Integration tests: `tests/integration/` - real Express app, real PostgreSQL test database
- Use Vitest: `vi.fn()`, `vi.spyOn()`, `vi.mock()` - not Jest equivalents
- Use `tests/fixtures/factories.ts` for test data - no inline hardcoded objects
- Do not use SQLite or in-memory databases for integration tests

---

## Response Format

All responses follow this envelope - do not deviate:

```typescript
// Success
res.json({ data: result });

// Paginated
res.json({ data: items, meta: { page, limit, total } });

// Error (handled by errorHandler middleware)
{ error: { code: 'RESOURCE_NOT_FOUND', message: '...' } }
```

Never return raw arrays at the top level. Never return raw Prisma model objects - serialize explicitly.

---

## What NOT to Suggest

- NestJS modules, decorators (`@Injectable`, `@Controller`), or NestJS patterns
- TypeORM, `@Entity`, `@Column`, QueryRunner, or `synchronize: true`
- Jest, `jest.fn()`, or Jest configuration
- `process.env.VARIABLE` outside `src/env.ts`
- `any` type - use `unknown` with type narrowing
- Floats for monetary values - use integer cents
- `prisma db push` - use migrations
- SQLite or in-memory databases for testing

---

## Development Workflows

For step-by-step procedures, follow the relevant workflow file in `./workflows/`:

- `workflows/feature-development.md` - implementing a new resource or capability end-to-end
- `workflows/bug-fixing.md` - investigating and fixing bugs layer by layer
- `workflows/refactoring.md` - safe refactoring with blast-radius control
