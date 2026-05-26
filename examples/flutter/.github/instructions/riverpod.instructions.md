---
applyTo: "lib/**/*.dart"
---

# Riverpod Conventions

These conventions apply to all Riverpod provider code in `lib/`.

---

## Provider Types

Use the right provider type for the situation:

| Situation              | Use                        | Why                             |
|------------------------|----------------------------|---------------------------------|
| Async state with logic | `AsyncNotifier`            | Build is async, exposes methods |
| Sync state with logic  | `Notifier`                 | Build is sync, exposes methods  |
| Simple computed value  | `@riverpod` function       | No methods needed               |
| Async data fetch       | `@riverpod` async function | Simple read-only async value    |

```dart
// Async state with user actions
@riverpod
class TaskList extends _$TaskList {
  @override
  Future<TaskListState> build() async { ... }

  Future<void> createTask(CreateTaskParams params) async { ... }
}

// Simple async data provider
@riverpod
Future<List<Project>> userProjects(UserProjectsRef ref) async {
  return ref.watch(projectRepositoryProvider).getProjects();
}

// Synchronous computed value
@riverpod
bool hasOverdueTasks(HasOverdueTasksRef ref) {
  final tasks = ref.watch(taskListProvider).valueOrNull?.tasks ?? [];
  return tasks.any((t) => t.isOverdue);
}
```

---

## Naming

Provider classes (Notifiers) use `PascalCase` describing the state they manage:

```dart
@riverpod
class TaskList extends _$TaskList { }          // → taskListProvider
@riverpod
class TaskDetail extends _$TaskDetail { }      // → taskDetailProvider
@riverpod
class AuthState extends _$AuthState { }        // → authStateProvider
@riverpod
class TaskForm extends _$TaskForm { }          // → taskFormProvider
```

For non-class providers (functions), use descriptive names for what they provide:

```dart
@riverpod
TaskRepository taskRepository(...)             // → taskRepositoryProvider
@riverpod
Future<User?> currentUser(...)                 // → currentUserProvider
@riverpod
bool isAuthenticated(...)                      // → isAuthenticatedProvider
```

---

## State Classes

All non-trivial state uses Freezed. Do not write `copyWith`, `==`, or `hashCode` manually.

```dart
@freezed
class TaskListState with _$TaskListState {
  const factory TaskListState({
    @Default([]) List<Task> tasks,
    @Default(false) bool isLoading,
    @Default(TaskFilter.all) TaskFilter activeFilter,
    String? errorMessage,
  }) = _TaskListState;
}
```

State classes go in the same providers/ directory as the notifier, in a separate file named `[feature]_state.dart`.

For simple providers that only need a single value, a state class is not needed - return the value type directly.

---

## Async State Pattern

```dart
@riverpod
class TaskList extends _$TaskList {
  @override
  Future<TaskListState> build() async {
    // Providers watched here will trigger rebuild when they change
    final filter = ref.watch(activeFilterProvider);
    final tasks = await ref.watch(taskRepositoryProvider).getTasks(filter: filter);
    return TaskListState(tasks: tasks);
  }

  Future<void> createTask(CreateTaskParams params) async {
    // Optimistic update or loading state before async operation
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(createTaskUseCaseProvider).call(params);
      // Re-fetch or update state after mutation
      return build();
    });
  }

  Future<void> deleteTask(String taskId) async {
    final previousState = state;
    // Optimistic removal
    state = state.whenData((s) => s.copyWith(
      tasks: s.tasks.where((t) => t.id != taskId).toList(),
    ));
    try {
      await ref.read(deleteTaskUseCaseProvider).call(taskId);
    } catch (e) {
      // Rollback on failure
      state = previousState;
      rethrow;
    }
  }
}
```

---

## ref.watch vs ref.read

- `ref.watch` in `build()` - subscribes to changes, triggers rebuild
- `ref.read` in callbacks - reads once, does not subscribe
- Never `ref.read` inside `build()` to get reactive state
- Never `ref.watch` inside callbacks or async methods

```dart
Widget build(BuildContext context, WidgetRef ref) {
  // Correct - reactive subscription
  final state = ref.watch(taskListProvider);

  return ElevatedButton(
    onPressed: () {
      // Correct - one-time read in callback
      ref.read(taskListProvider.notifier).createTask(params);
    },
    child: ...,
  );
}
```

---

## Provider Dependencies

Providers declare dependencies explicitly via `ref.watch` in the build method. Avoid dependency on mutable external state.

```dart
@riverpod
TaskRepositoryImpl taskRepository(TaskRepositoryRef ref) {
  return TaskRepositoryImpl(
    remoteDataSource: ref.watch(taskRemoteDataSourceProvider),
    localDataSource: ref.watch(taskLocalDataSourceProvider),
  );
}
```

For providers that need to react to auth state changes, watch the auth provider:

```dart
@riverpod
class TaskList extends _$TaskList {
  @override
  Future<TaskListState> build() async {
    // When auth state changes, this provider is automatically invalidated
    final user = ref.watch(authStateProvider).valueOrNull;
    if (user == null) return const TaskListState();
    return ...;
  }
}
```

---

## Invalidation

Use `ref.invalidate(provider)` to force a fresh fetch. Use `ref.invalidateSelf()` from inside a notifier.

```dart
// From outside (e.g., after a successful delete)
ref.invalidate(taskListProvider);

// From inside a notifier
ref.invalidateSelf();
```

Do not call `build()` manually from inside a notifier to refresh - use `ref.invalidateSelf()` instead.

---

## AutoDispose

All providers defined with `@riverpod` are `autoDispose` by default (with code generation). This means providers are disposed when no widget is watching them.

For providers that should survive navigation (e.g., auth state), use `@Riverpod(keepAlive: true)`:

```dart
@Riverpod(keepAlive: true)
class AuthState extends _$AuthState { ... }
```

Keep the list of `keepAlive` providers small - most providers should autoDispose.

---

## Family Providers

For providers that take parameters:

```dart
@riverpod
Future<Task> taskById(TaskByIdRef ref, String taskId) async {
  return ref.watch(taskRepositoryProvider).getTaskById(taskId);
}

// Usage
ref.watch(taskByIdProvider(taskId))
```

Family parameters must be comparable (implement `==` and `hashCode`). Use simple types (`String`, `int`, `enum`) or Freezed objects as family parameters.

---

## Testing

Override providers at the `ProviderScope` level in tests:

```dart
testWidgets('shows task list', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        taskRepositoryProvider.overrideWithValue(MockTaskRepository()),
      ],
      child: const MaterialApp(home: TaskListScreen()),
    ),
  );
  ...
});
```

Never mock Riverpod providers directly - override the repository or data source provider, letting the real notifier run against the mock.

---

## Common Mistakes

**Using `context.read` instead of `ref.read`**
`context.read<T>()` is from the `provider` package. This project uses Riverpod's `ref.read`.

**Exposing mutable state**
State exposed from notifiers should be immutable (Freezed). Never expose a mutable list or map directly.

**Forgetting to await provider in tests**
Async providers need `await tester.pump()` or `pumpAndSettle()` to complete before assertions.

**Mixing Riverpod 1.x and 2.x APIs**
This project uses Riverpod 2.x with code generation. Do not use `StateProvider`, `StateNotifierProvider`, `FutureProvider` directly - use `@riverpod` annotations.
