---
example: nodejs
version: 0.1.0
---

# Memory

This file records architectural decisions, lessons learned, and patterns to avoid. It exists so AI tools don't recommend approaches we've already evaluated and moved away from.

**Maintenance:** Add an entry when you make a significant architectural decision, complete a migration, or fix a recurring AI suggestion problem. Date each entry.

---

## Architectural Decisions

### [2024-03] Chose Express over NestJS

**Context:** Evaluated NestJS and Express for the initial stack. NestJS's decorator-based DI and opinionated structure were appealing for a team familiar with Spring/Angular.

**Decision:** Express 5 with a manually structured layered architecture.

**Why Express won:**
- Smaller team (3 devs) — NestJS's module system added ceremony without proportional benefit at our scale
- Faster onboarding — Express conventions are universally understood
- No magic — dependency injection via constructor arguments is explicit and easy to test
- NestJS's generated boilerplate made PRs harder to review

**What to avoid:** Do not suggest NestJS modules, decorators (`@Injectable`, `@Controller`, `@Module`), or NestJS-specific patterns. If dependency injection is needed, pass dependencies as constructor arguments.

---

### [2024-03] Chose Prisma over TypeORM

**Context:** Evaluated TypeORM (familiar from other projects) and Prisma for the ORM layer.

**Decision:** Prisma with PostgreSQL.

**Why Prisma won:**
- Schema-first migrations are safer than TypeORM's `synchronize: true` (which we accidentally ran in staging)
- Prisma's generated client is fully type-safe with no decorator overhead
- `prisma.$transaction()` API is simpler than TypeORM's QueryRunner pattern
- Prisma Studio is useful for debugging data issues quickly

**What to avoid:** Do not suggest TypeORM, `@Entity`, `@Column`, `synchronize: true`, or QueryRunner patterns. Do not suggest Drizzle — the Prisma investment is made. Do not suggest raw SQL for queries that Prisma can express cleanly.

---

### [2024-04] Chose Vitest over Jest

**Context:** Started with Jest (team familiarity). Build times grew as the test suite expanded.

**Decision:** Migrated to Vitest.

**Why Vitest won:**
- 4x faster test runs with identical assertion API
- Native ESM support — no `transform` config fighting TypeScript
- `vi.fn()` and `vi.spyOn()` are drop-in replacements for Jest equivalents
- Vitest runs in the same process as Vite (if we ever add a frontend) — unified toolchain

**What to avoid:** Do not suggest Jest, `jest.fn()`, `jest.mock()`, or Jest configuration. The test runner is Vitest. Use `vi.fn()`, `vi.spyOn()`, `vi.mock()`.

---

### [2024-05] Prices stored as integer cents — never floats

**Context:** Initial implementation stored prices as `Float` in Prisma. Hit floating-point rounding bugs in order total calculations (`$9.99 + $0.01 = $10.000000000002`).

**Decision:** All prices are stored as `Int` (cents) in the database. Formatting to display strings (`$9.99`) happens only at the response serialization layer.

**What to avoid:** Do not use `Float`, `Decimal`, or `number` (TypeScript) for monetary values at the service or repository layer. Do not do arithmetic on formatted strings. All money math uses integer cents.

---

### [2024-07] Zod schemas are the single source of truth for request shape

**Context:** Had duplicate validation: TypeScript interfaces defined request shapes and separate validation logic checked them at runtime. They drifted.

**Decision:** Zod schemas in `src/schemas/` define the shape. TypeScript types are inferred from Zod schemas with `z.infer<typeof Schema>`. Validation middleware uses the same schema.

**What to avoid:** Do not write separate TypeScript interfaces for request bodies. Do not use `express-validator` or Joi. Do not duplicate type definitions — infer from Zod.

---

### [2024-09] Refresh token rotation — single use

**Context:** Implemented long-lived refresh tokens without rotation. Identified that a stolen refresh token could be silently reused indefinitely.

**Decision:** Refresh tokens are single-use. Each use invalidates the current token and issues a new one. Tokens are stored hashed in the `RefreshToken` table. Reuse of an invalidated token triggers a family revocation (all refresh tokens for that user are invalidated).

**What to avoid:** Do not implement stateless refresh tokens (JWT-signed, no database storage). Do not allow refresh token reuse. Do not store raw refresh tokens — always store the hash.

---

## Recurring AI Suggestion Problems

### AI suggests calling Prisma in controllers
Every time. Controllers must not import from `@prisma/client` or call `db.*` directly. All database access goes through repositories in `src/repositories/`.

### AI suggests `process.env.VARIABLE` directly in service/utility files
Environment variables must be accessed through the validated `env` object from `src/env.ts`. Direct `process.env` access is only permitted in `src/env.ts`.

### AI suggests storing prices as floats or decimals
Prices are integers (cents). This is non-negotiable. See decision above.

### AI suggests `any` type to resolve TypeScript errors
Never use `any`. Use `unknown` with type narrowing, or define the correct type. If a third-party library returns `any`, wrap it in a typed function at the boundary.

### AI suggests in-memory database for integration tests
Integration tests run against a real PostgreSQL database (Docker Compose in CI). Do not use SQLite or in-memory databases — they hide real-world query behavior and Prisma-specific issues.
