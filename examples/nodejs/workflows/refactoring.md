---
example: nodejs
version: 0.1.0
---

# Workflow: Refactoring

A structured approach to refactoring in this Express + TypeScript + Prisma API.

Refactoring in a layered architecture has a predictable blast radius - a change in the repository layer can cascade to services, then controllers, then routes. This workflow keeps that blast radius contained.

---

## When to Use This
- Extracting duplicate logic into a shared utility or base class
- Renaming a domain concept across the codebase
- Splitting a service that has grown too large
- Migrating from one library to another (e.g., test runner, HTTP client)

---

## Before You Start
- Identify the exact scope: which files will change?
- Check `MEMORY.md` - has this refactor been attempted before? Was it abandoned?
- Make sure the test suite is green before starting. Do not refactor against a broken baseline.
- Commit current state so you have a clean rollback point

---

## Steps

### 1. Identify the blast radius
For each file you plan to change, list what depends on it:
- Repository change → which services use it?
- Service change → which controllers use it?
- Utility change → who imports it?
- Type change → what is inferred from it?

Use TypeScript's compiler to find all usages: rename the symbol or change the type and let `tsc` report all call sites.

### 2. Write characterization tests (if coverage is thin)
If the code you're refactoring has poor test coverage, write tests that document current behavior before changing anything. These are not permanent tests - they're scaffolding to catch regressions during the refactor.

### 3. Refactor one layer at a time
Start from the innermost layer and work outward:
```
Repository → Service → Controller → Route
```
Do not change multiple layers simultaneously. Compile and run tests between each layer change.

### 4. Keep TypeScript strict
Do not introduce `any` or `as unknown as X` casts to make the refactor compile faster. Fix the types properly at each layer. TypeScript is your safety net - do not disable it.

### 5. Update tests alongside the code
- Update unit tests as service signatures change
- Update integration tests if request/response shapes change
- Remove characterization tests written in Step 2 if permanent tests now cover the same cases

### 6. Run the full suite
```
npx vitest run
```
Do not commit until the full suite is green.

---

## Checklist

- [ ] Test suite green before starting
- [ ] Blast radius identified before any changes made
- [ ] Changes applied layer by layer (not all at once)
- [ ] No `any` or unsafe casts introduced
- [ ] Tests updated alongside code
- [ ] Full test suite green after refactor
- [ ] `MEMORY.md` updated if the refactor resolves a recurring problem or establishes a new convention

---

## Common Mistakes

- **Refactoring and fixing bugs simultaneously** - keep them separate. A refactor should not change behavior. If you find a bug, note it and fix it in a separate commit.
- **Changing the public interface and the implementation at the same time** - change the interface first, fix compilation errors, then change the implementation.
- **Skipping `tsc --noEmit` between layers** - TypeScript errors are your guide. Compile between layers to catch cascades early.
- **Using `as any` to make a type error go away** - this silences the compiler and allows the bug to survive the refactor undetected.
