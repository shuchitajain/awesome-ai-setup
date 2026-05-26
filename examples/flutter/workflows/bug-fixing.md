---
example: flutter
version: 0.1.0
---

# Workflow: Bug Fixing

A structured approach to investigating and fixing bugs in this Flutter Riverpod Clean Architecture project.

---

## Before Writing Any Code

Understand the bug fully before touching anything.

**Collect:**
1. Exact reproduction steps
2. Expected behavior vs. actual behavior
3. Error message or stack trace (if any)
4. Affected platform(s): iOS, Android, or both
5. Regression? When did it start? What changed?

**Locate the layer where the bug lives:**

```
Is the data wrong at the API level?          → Data source bug
Is the data correct but mapped wrong?        → Model/mapping bug
Is the business rule wrong?                  → Use case or entity bug
Is the state correct but UI shows wrong?     → Widget or provider bug
Is the UI correct but interaction is broken? → State update bug or navigation bug
```

Bugs in lower layers (data, domain) tend to manifest in the UI. Always trace to the root cause rather than patching the symptom in the presentation layer.

---

## Investigation Steps

### Step 1 - Reproduce Consistently

If you can't reproduce it reliably, you can't verify the fix. Identify the minimum set of steps to trigger the bug every time.

If the bug is intermittent, identify:
- Is it timing-dependent? (race condition, async gap)
- Is it state-dependent? (only after certain actions)
- Is it data-dependent? (specific values trigger it)

### Step 2 - Trace the Data Flow

Follow the data from UI to data source (or data source to UI for display bugs):

```
User action → Provider method → Use case → Repository → Data source
                                                           ↓ (response)
UI display ← AsyncValue state ← Provider state ← Repository → Entity
```

At each layer, ask: "Is the data correct here?" Add temporary debug logging if needed:

```dart
// Temporary - remove before committing
debugPrint('[DEBUG] Task from API: ${taskModel.toJson()}');
debugPrint('[DEBUG] Task entity: $task');
debugPrint('[DEBUG] Provider state: $state');
```

### Step 3 - Identify the Root Cause

Distinguish between:
- **Logic bug** - wrong calculation, wrong condition, wrong data transformation
- **State bug** - provider not updating, stale data, wrong invalidation
- **Navigation bug** - wrong route, missing route parameter
- **Async bug** - race condition, missing `await`, missing `mounted` check
- **Data bug** - API returning unexpected format, missing field

### Step 4 - Write a Failing Test First (when practical)

For non-trivial bugs, write a test that demonstrates the bug before fixing it:

```dart
test('task due date should preserve timezone offset', () async {
  // This test was failing before the fix
  final taskModel = TaskModel.fromJson({
    'id': 'task-1',
    'due_date': '2026-01-15T00:00:00Z',  // UTC midnight
  });
  final task = taskModel.toEntity();

  // Task.dueDate should be UTC, timezone display is UI responsibility
  expect(task.dueDate?.isUtc, isTrue);
});
```

Having a failing test means you know exactly when the fix is correct.

---

## Common Bug Patterns and Fixes

### Stale State

**Symptom:** UI shows old data after a mutation (create/update/delete).

**Cause:** Provider is not invalidated after mutation, or optimistic update logic is wrong.

**Investigation:**
```dart
// Check if the provider is being invalidated
// In the notifier method that performs the mutation:
Future<void> createTask(CreateTaskParams params) async {
  await ref.read(createTaskUseCaseProvider).call(params);
  // Is ref.invalidateSelf() being called here?
  // Is build() being called to refresh state?
}
```

**Fix patterns:**
```dart
// Option 1 - invalidate and rebuild
ref.invalidateSelf();

// Option 2 - optimistic update with rollback
final previous = state;
state = state.whenData((s) => s.copyWith(tasks: [...s.tasks, optimisticTask]));
try {
  final real = await repo.createTask(params);
  state = state.whenData((s) => s.copyWith(
    tasks: s.tasks.map((t) => t.id == optimisticTask.id ? real : t).toList(),
  ));
} catch (e) {
  state = previous;
}
```

---

### Missing mounted Check

**Symptom:** "setState() called after dispose()" or navigation errors after async operations.

**Pattern that causes it:**
```dart
onPressed: () async {
  await someAsyncOperation();
  // If widget disposed during await, context is invalid
  Navigator.pop(context);  // crashes
  ScaffoldMessenger.of(context).showSnackBar(...);  // crashes
}
```

**Fix:**
```dart
onPressed: () async {
  await someAsyncOperation();
  if (!context.mounted) return;  // check before any context usage
  context.pop();
}
```

---

### Provider Not Watching Dependency

**Symptom:** Provider has stale data even though a dependency changed.

**Cause:** Using `ref.read` instead of `ref.watch` in provider `build()`.

```dart
// Bug - doesn't react when auth changes
@override
Future<TaskListState> build() async {
  final user = ref.read(authStateProvider).valueOrNull;  // ← wrong
  ...
}

// Fix - reacts when auth changes
@override
Future<TaskListState> build() async {
  final user = ref.watch(authStateProvider).valueOrNull;  // ← correct
  ...
}
```

---

### Model Mapping Error

**Symptom:** Data from API is correct (verified in data source) but entity has wrong values.

**Investigation:** Check the `fromJson` mapping and the `toEntity()` extension.

```dart
// Check for field name mismatches
@JsonKey(name: 'due_date')  // API field name
DateTime? dueDate;           // model field name

// Check for enum parsing
// API returns: "in_progress"
// Wrong: TaskStatus.inProgress (name mismatch)
// Correct: TaskStatus.values.byName('in_progress')  // Dart convention: camelCase
// Or use @JsonValue annotations on the enum
```

---

### GoRouter Redirect Loop

**Symptom:** App shows blank screen or infinite loading. Console shows rapid navigation events.

**Cause:** Auth redirect logic creates a loop - redirecting to login redirects to login.

**Investigation:**
```dart
// Check app_router.dart redirect callback
redirect: (context, state) {
  final isLoggedIn = ...;
  final isOnLogin = state.matchedLocation == Routes.login;

  if (!isLoggedIn && !isOnLogin) return Routes.login;
  if (isLoggedIn && isOnLogin) return Routes.home;
  return null;  // ← must return null to stop redirecting
}
```

---

## Fix Quality Checklist

Before marking a bug as fixed:

- [ ] Root cause identified and documented (not just symptom patched)
- [ ] Fix is in the correct layer (not patching UI to hide a data bug)
- [ ] Test added that would have caught this bug
- [ ] Existing tests still pass
- [ ] `context.mounted` checks are present after any `await` with context usage
- [ ] Temporary debug logging removed
- [ ] Fix doesn't introduce layer boundary violations

---

## When to Escalate

Stop and gather more information before proceeding if:
- The bug only happens in production, not locally
- The bug involves data inconsistency that could point to a backend issue
- The fix would require significant refactoring (make a separate plan)
- Multiple issues are interrelated (fix one at a time)
