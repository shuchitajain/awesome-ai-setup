---
example: nodejs
version: 0.1.0
---

# Agent Definitions

This file defines the AI agents used in this project, their responsibilities, scope boundaries, and how to invoke them.

---

## How to Invoke an Agent

```
"Act as the [Agent Name] for this project.
 Read ARCHITECTURE.md and MEMORY.md first.
 Your task: [specific task description]"
```

---

## API Designer

**Role:** Design and document REST endpoints - routes, request/response shapes, status codes, and Zod schemas.

**Scope:** `src/routes/`, `src/schemas/`, `src/types/api.ts`

**Prerequisite context to read:**
- `ARCHITECTURE.md` - response format conventions and layer rules
- `CONTEXT.md` - domain model and business rules

**Invoke with:**
```
Act as the API Designer for this project.
Read ARCHITECTURE.md and CONTEXT.md first.
Your task: Design the REST endpoints for [feature].
- Define the route paths, HTTP methods, and status codes
- Write the Zod request schemas in src/schemas/[feature].schema.ts
- Document the response shape using ApiResponse<T>
- Flag any authorization rules (who can access what)
- Do NOT write controller or service code
```

**Output:** Route definitions + Zod schemas + response type documentation
**Does NOT:** Write business logic, touch the database, or implement controllers

---

## Service Layer Implementer

**Role:** Implement business logic in services and corresponding unit tests.

**Scope:** `src/services/`, `tests/unit/services/`

**Prerequisite context to read:**
- `ARCHITECTURE.md` - service layer conventions (no Express imports, throw typed errors)
- `CONTEXT.md` - business rules for the domain being implemented
- `MEMORY.md` - decisions on error handling, pricing, and validation patterns

**Invoke with:**
```
Act as the Service Layer Implementer for this project.
Read ARCHITECTURE.md, CONTEXT.md, and MEMORY.md first.
Your task: Implement [ServiceName] for [feature].
- Business logic only - no Express/Fastify imports
- Use repositories for all data access (inject via constructor)
- Throw typed ApiError subclasses from src/utils/errors.ts on failure
- Write unit tests in tests/unit/services/[ServiceName].test.ts
- Mock repositories with vi.fn()
```

**Output:** Service class + unit tests
**Does NOT:** Write controllers, modify schemas, or write Prisma queries directly

---

## Repository Writer

**Role:** Write Prisma repository classes and database migration schema changes.

**Scope:** `src/repositories/`, `prisma/schema.prisma`, `prisma/migrations/`

**Prerequisite context to read:**
- `ARCHITECTURE.md` - repository conventions and transaction patterns
- `MEMORY.md` - Prisma decisions (no TypeORM, integer prices, no raw SQL for standard queries)

**Invoke with:**
```
Act as the Repository Writer for this project.
Read ARCHITECTURE.md and MEMORY.md first.
Your task: Implement [RepositoryName] for [model].
- All Prisma queries go here - no Prisma calls outside src/repositories/
- Use db.$transaction() for multi-model operations
- Handle PrismaClientKnownRequestError and translate to ApiError where appropriate
- If schema changes are needed, describe the prisma/schema.prisma changes required
```

**Output:** Repository class + schema changes (if needed)
**Does NOT:** Write business logic, call other repositories from within a repository

---

## Controller and Route Writer

**Role:** Wire validated routes to services via thin controllers.

**Scope:** `src/controllers/`, `src/routes/`, `src/middleware/`

**Prerequisite context to read:**
- `ARCHITECTURE.md` - controller conventions (thin, no business logic, error propagation)
- Relevant schema file from `src/schemas/`

**Invoke with:**
```
Act as the Controller and Route Writer for this project.
Read ARCHITECTURE.md first.
Your task: Implement the controller and routes for [feature].
- Controllers must be thin: validate input, call one service method, return response
- Apply authMiddleware and validate(Schema) at the route level
- Do not add business logic to controllers - throw to the error handler
- Follow the response envelope format from ARCHITECTURE.md
```

**Output:** Controller class + route registration
**Does NOT:** Write services, repositories, or schemas

---

## API Test Writer

**Role:** Write integration tests for API endpoints and unit tests for utilities.

**Scope:** `tests/`

**Prerequisite context to read:**
- `ARCHITECTURE.md` - testing conventions (real DB for integration, mocked repos for unit)
- `MEMORY.md` - Vitest usage (not Jest)

**Invoke with:**
```
Act as the API Test Writer for this project.
Read ARCHITECTURE.md and MEMORY.md first.
Your task: Write tests for [feature/endpoint].
- Integration tests in tests/integration/api/ - use real Express app and real test DB
- Use tests/fixtures/factories.ts for test data
- Clean up between tests using tests/fixtures/db.ts helpers
- Unit tests for services in tests/unit/services/ - mock repositories with vi.fn()
- Use Vitest (vi.fn(), vi.spyOn()) - not Jest
```

**Output:** Integration tests + unit tests
**Does NOT:** Modify application code, write mocked DB tests for integration scenarios
