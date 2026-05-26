---
example: nodejs
version: 0.1.0
---

# Workflow: Bug Fixing

A structured approach to investigating and fixing bugs in this Express + TypeScript + Prisma API.

---

## When to Use This
- A route returns an unexpected status code or response shape
- A service throws the wrong error or no error when one is expected
- A database write produces incorrect data or violates a constraint
- A test is failing after a refactor

---

## Before You Start
- Identify the layer where the bug manifests: route, controller, service, repository, or middleware
- Check `MEMORY.md` for any relevant past decisions that might explain the behavior
- Check if there is an existing integration test that should have caught this

---

## Steps

### 1. Reproduce with a test
Before touching any code, write a failing test that reproduces the bug:
- If the bug is in a service: write a unit test in `tests/unit/services/`
- If the bug is in route/middleware behavior: write an integration test in `tests/integration/api/`

A test that reproduces the bug is proof you understand the problem. If you can't write a reproducing test, you don't understand the bug yet.

### 2. Trace the request path
Follow the request from entry to failure:
```
Route (src/routes/) → Middleware (auth, validate) → Controller → Service → Repository → Database
```
Identify which layer has incorrect behavior. Check:
- Is the Zod schema rejecting valid input (or accepting invalid input)?
- Is the service throwing the right error type?
- Is the repository returning the expected data shape?
- Is the error handler serializing the error correctly?

### 3. Check for Prisma constraint errors
If the bug involves a database write failing silently or crashing:
- Check if `PrismaClientKnownRequestError` is being caught and translated in the repository
- Common codes: `P2002` (unique constraint), `P2025` (record not found), `P2003` (foreign key)
- Unhandled Prisma errors bubble up as 500s - check the Pino logs for `code` and `meta`

### 4. Check transaction boundaries
If partial writes are occurring (some models updated, others not):
- Verify multi-model operations use `db.$transaction()`
- Check if the transaction is wrapping the entire operation or only part of it

### 5. Fix the root cause
Fix at the layer where the bug lives - do not add workarounds in a higher layer.
- If a service returns wrong data → fix the service
- If a repository returns wrong data → fix the repository query
- Do not add `if` guards in the controller to paper over service bugs

### 6. Verify the fix
Run the reproducing test. It should now pass. Then run the full test suite:
```
npx vitest run
```

### 7. Add a regression test
If there was no test covering this case, the test you wrote in Step 1 is your regression test. Make sure it stays in the suite.

---

## Checklist

- [ ] Reproducing test written before any code change
- [ ] Bug located to a specific layer (not "somewhere in the service")
- [ ] Fix applied at the root cause layer - no workarounds in higher layers
- [ ] Full test suite passes after fix
- [ ] Regression test committed alongside the fix
- [ ] `MEMORY.md` updated if this was a recurring AI suggestion problem

---

## Common Mistakes

- **Fixing the symptom, not the cause** - if a controller is returning wrong data, the bug is in the service or repository, not the controller.
- **Adding try/catch in the controller** - errors propagate up by design. Catching them in the controller hides bugs.
- **Testing with `console.log` debugging instead of a failing test** - write the test first. Logs disappear; tests stay.
- **Assuming Prisma errors are being handled** - if you add a new query, check that `PrismaClientKnownRequestError` is caught for the relevant error codes.
