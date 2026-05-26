---
example: flutter
version: 0.1.0
---

# Workflow: Refactoring

A structured approach to refactoring in this Flutter Riverpod Clean Architecture project.

Refactoring without a plan in a layered architecture tends to cascade — a rename in the domain layer breaks data models, which breaks providers, which breaks widget tests. This workflow helps contain the blast radius.

---

## Before Refactoring

**Define scope clearly.** Refactoring "the task feature" is too vague. "Rename `TaskStatus` enum values to match API conventions" or "Extract task filtering logic from provider into a use case" is a workable scope.

**Check test coverage first.** A refactor without tests is a gamble. If the code you're changing isn't covered, write tests before touching anything. Tests are what let you verify the refactor didn't break behavior.

**Identify all affected call sites:**

```bash
# Find all usages of the symbol being changed
grep -r "TaskStatus" lib/ test/

# Find all files importing a module being moved
grep -r "features/tasks/domain/entities/task" lib/

# Find all places a specific pattern is used
grep -r "Navigator.push" lib/
```

---

## Refactoring Types and Approaches

### Rename Refactoring

Rename: entity, class, method, enum, provider, route constant.

1. Use your IDE's rename refactoring (F2 / right-click → Rename) — it updates all references automatically
2. Run the analyzer after: `dart analyze`
3. Run `dart run build_runner build --delete-conflicting-outputs` if renaming a `@riverpod` class or `@freezed` class
4. Check generated files have updated names (`.g.dart`, `.freezed.dart`)
5. Run tests

**Watch for:** Enum values serialized to/from JSON. If you rename `TaskStatus.inProgress` to `TaskStatus.inProgressStatus`, your `toJson` output changes unless you have `@JsonValue` annotations.

```dart
// Safe rename — JSON key is fixed regardless of Dart name
enum TaskStatus {
  @JsonValue('todo') todo,
  @JsonValue('in_progress') inProgress,  // rename this in Dart without breaking JSON
  @JsonValue('done') done,
}
```

---

### Extract Refactoring

Move logic from one place to a more appropriate one.

**Example: Extract filtering logic from notifier into use case**

Before:
```dart
// In TaskListNotifier — mixing state management with filtering logic
Future<void> filterByStatus(TaskStatus? status) async {
  final allTasks = await ref.read(taskRepositoryProvider).getTasks();
  final filtered = status == null
    ? allTasks
    : allTasks.where((t) => t.status == status).toList()
  ..sort((a, b) => a.dueDate?.compareTo(b.dueDate ?? DateTime.now()) ?? 0);
  state = AsyncValue.data(TaskListState(tasks: filtered));
}
```

After:
```dart
// New use case in domain/usecases/filter_tasks.dart
class FilterTasks {
  List<Task> call(List<Task> tasks, {TaskStatus? status}) {
    final filtered = status == null
      ? tasks
      : tasks.where((t) => t.status == status).toList();
    return filtered..sort((a, b) => ...);
  }
}

// Notifier is now thin
Future<void> filterByStatus(TaskStatus? status) async {
  state = const AsyncValue.loading();
  state = await AsyncValue.guard(() async {
    final tasks = await ref.read(getTasksProvider).call();
    final filtered = ref.read(filterTasksProvider).call(tasks, status: status);
    return TaskListState(tasks: filtered, activeFilter: status);
  });
}
```

Steps:
1. Write the extracted unit and its tests first
2. Replace the original with a call to the extracted unit
3. Remove dead code
4. Verify all tests pass

---

### Move Refactoring

Move a file or class to a different location (e.g., from `shared/` to a specific feature, or from a feature to `shared/`).

1. Move the file using your IDE (preserves git history better than copy+delete)
2. Update the import in the moved file if it references relative paths
3. Update all importing files: `grep -r "old/path" lib/ test/`
4. Run `dart analyze` to catch missed imports
5. Run tests

**Layer boundary rule:** When moving, confirm the destination layer is appropriate. A widget moving into `domain/` violates the layer rules.

---

### Structural Refactoring (Larger Scope)

Examples: splitting a large feature, merging two small features, reorganizing the shared layer.

These are riskier. Apply extra caution:

1. **Branch first.** Do structural refactors on a dedicated branch.
2. **One move at a time.** Don't move five files simultaneously. Move one, verify, commit, repeat.
3. **Don't mix refactor with feature work.** A refactor PR should only contain the refactor.
4. **Checkpoint commits.** Commit after each logical step with a clear message ("Move task filtering to domain use case"). This makes reverting specific steps possible.

---

## Migration Refactoring

Migrating from one pattern to another across the codebase (e.g., all `StatefulWidget` → `HookConsumerWidget`).

This project has done several such migrations (documented in `MEMORY.md`). The approach that works:

1. **Define done.** What is the complete list of things to migrate? Run the search before starting.
   ```bash
   grep -r "StatefulWidget" lib/ --include="*.dart" -l
   ```

2. **Migrate feature by feature.** Don't migrate all files at once. Pick one feature, migrate it completely, test it, merge it.

3. **Update conventions immediately.** Once the migration starts, update `MEMORY.md` to note the old pattern is being removed and when it's safe to assume the migration is complete.

4. **Document the completion state.** When done, add an entry to `MEMORY.md` noting the migration is complete so AI tools know the old pattern is gone.

---

## Refactoring Checklist

- [ ] Scope is clearly defined — I know exactly what's changing and what's not
- [ ] All call sites are identified before starting
- [ ] Tests exist for the code being changed (or written first)
- [ ] Refactor doesn't mix with unrelated changes
- [ ] Layer boundaries are preserved (domain stays pure Dart)
- [ ] Generated files are regenerated after changes to annotated code
- [ ] `dart analyze` shows no new warnings or errors
- [ ] All tests pass
- [ ] `MEMORY.md` updated if this changes a project-wide convention

---

## What Not to Do

**Don't refactor in the middle of a feature.** Finish the feature first, then clean up in a separate commit or PR. Mixed commits are harder to review and harder to revert.

**Don't fix bugs while refactoring.** If you find a bug while refactoring, note it and fix it separately. Combining refactor + bugfix makes it impossible to know which change fixed (or introduced) what.

**Don't refactor generated code.** `.g.dart` and `.freezed.dart` files are generated — modifying them directly will be overwritten by build_runner. Refactor the source annotations instead.
