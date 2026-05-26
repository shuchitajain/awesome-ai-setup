---
applyTo: "test/**/*.dart"
---

# Testing Conventions

These conventions apply to all test code in `test/`.

---

## Test Structure

Mirror the `lib/` structure in `test/`:

```
test/
├── features/
│   ├── tasks/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   └── task_remote_datasource_test.dart
│   │   │   └── repositories/
│   │   │       └── task_repository_impl_test.dart
│   │   ├── domain/
│   │   │   └── usecases/
│   │   │       ├── get_tasks_test.dart
│   │   │       └── create_task_test.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── task_list_screen_test.dart
│   │       └── providers/
│   │           └── task_list_provider_test.dart
├── core/
│   └── ...
└── helpers/
    ├── mock_factories.dart    # shared mock creation
    └── test_helpers.dart      # shared pump helpers
```

---

## Test Naming

```dart
// File naming - matches source file with _test suffix
// task_list_provider.dart → task_list_provider_test.dart

// Group structure - describe the subject
group('TaskListProvider', () {
  // Subgroup for specific behaviors
  group('build', () {
    test('returns empty state when user has no tasks', () async { ... });
    test('returns tasks sorted by due date', () async { ... });
    test('emits error state when repository throws', () async { ... });
  });

  group('createTask', () {
    test('adds task to list on success', () async { ... });
    test('reverts to previous state on failure', () async { ... });
  });
});
```

Test names should read as complete sentences: "returns empty state when user has no tasks".

---

## Mocking Strategy

**Mock at the repository layer.** Do not mock data sources in widget tests or provider tests. Repository mocks are the correct abstraction level for testing business logic and UI.

```dart
// Correct - mock the repository interface
class MockTaskRepository extends Mock implements TaskRepository {}

// Wrong - mocking too deep for a widget test
class MockTaskRemoteDataSource extends Mock implements TaskRemoteDataSource {}
```

Use `mocktail` for mocking (not `mockito` - avoids code generation for mocks):

```dart
import 'package:mocktail/mocktail.dart';

class MockTaskRepository extends Mock implements TaskRepository {}
class MockAuthRepository extends Mock implements AuthRepository {}

// Setup
final taskRepo = MockTaskRepository();
when(() => taskRepo.getTasks()).thenAnswer((_) async => [task1, task2]);
when(() => taskRepo.createTask(any())).thenAnswer((_) async => task1);
```

---

## Widget Tests

Widget tests use `ProviderScope` with repository overrides:

```dart
testWidgets('shows task list when tasks exist', (tester) async {
  final mockTaskRepo = MockTaskRepository();
  when(() => mockTaskRepo.getTasks()).thenAnswer((_) async => [fakeTask]);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        taskRepositoryProvider.overrideWithValue(mockTaskRepo),
      ],
      child: MaterialApp(
        home: const TaskListScreen(),
        // Include GoRouter if screens use context.go
      ),
    ),
  );
  await tester.pumpAndSettle();

  expect(find.text(fakeTask.title), findsOneWidget);
});
```

Do not use `MaterialApp.router` with real GoRouter in widget tests - use `MaterialApp` with a specific `home`.

**Don't test Riverpod internals.** Test what the user sees, not how the provider is structured internally. Prefer `find.text()`, `find.byType()`, and `find.byKey()` over reading provider state directly.

---

## Provider Tests (Unit)

Test providers in isolation using `ProviderContainer`:

```dart
test('createTask adds task to state', () async {
  final mockTaskRepo = MockTaskRepository();
  final container = ProviderContainer(
    overrides: [
      taskRepositoryProvider.overrideWithValue(mockTaskRepo),
    ],
  );
  addTearDown(container.dispose);

  when(() => mockTaskRepo.getTasks()).thenAnswer((_) async => []);
  when(() => mockTaskRepo.createTask(any())).thenAnswer((_) async => fakeTask);

  // Wait for initial build
  await container.read(taskListProvider.future);

  // Execute action
  await container.read(taskListProvider.notifier).createTask(fakeTaskParams);

  // Assert
  final state = await container.read(taskListProvider.future);
  expect(state.tasks, contains(fakeTask));
});
```

---

## Use Case Tests

Use case tests are pure unit tests - no Flutter test runner, no ProviderContainer:

```dart
void main() {
  late GetTasks useCase;
  late MockTaskRepository mockRepository;

  setUp(() {
    mockRepository = MockTaskRepository();
    useCase = GetTasks(repository: mockRepository);
  });

  test('returns tasks from repository', () async {
    when(() => mockRepository.getTasks()).thenAnswer((_) async => [fakeTask]);

    final result = await useCase.call();

    expect(result, [fakeTask]);
    verify(() => mockRepository.getTasks()).called(1);
  });

  test('propagates exception when repository throws', () async {
    when(() => mockRepository.getTasks()).thenThrow(ServerException('error'));

    expect(() => useCase.call(), throwsA(isA<ServerException>()));
  });
}
```

---

## Test Fixtures

Shared test data lives in `test/helpers/`:

```dart
// test/helpers/mock_factories.dart
final fakeUser = User(
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
);

final fakeTask = Task(
  id: 'task-123',
  title: 'Fix login bug',
  status: TaskStatus.todo,
  priority: TaskPriority.high,
  assigneeId: fakeUser.id,
  projectId: 'project-123',
  dueDate: DateTime(2026, 1, 15),
);

Task fakeTaskWith({
  String? title,
  TaskStatus? status,
  TaskPriority? priority,
}) => fakeTask.copyWith(
  title: title ?? fakeTask.title,
  status: status ?? fakeTask.status,
  priority: priority ?? fakeTask.priority,
);
```

Use factory helpers (`fakeTaskWith(status: TaskStatus.done)`) rather than duplicating fixture code across tests.

---

## Async Handling

Always await async operations in tests. Use `pumpAndSettle()` for animations. Use `pump(Duration)` when timing matters.

```dart
// Wait for async providers to complete
await tester.pumpAndSettle();

// Wait for a specific duration (e.g., debounce)
await tester.pump(const Duration(milliseconds: 500));

// For container tests, await the future directly
await container.read(someAsyncProvider.future);
```

---

## What NOT to Test

- Implementation details of generated code (Freezed, riverpod_annotation)
- Private methods - test through the public API
- Flutter framework behavior (e.g., that `Text` renders text)
- Generated `.g.dart` or `.freezed.dart` files

---

## Coverage Expectations

| Layer                 | Target | Notes                                                 |
|-----------------------|--------|-------------------------------------------------------|
| Domain / use cases    | High   | Pure Dart, fast, no mocking needed                    |
| Repository impls      | Medium | Focus on error handling and caching logic             |
| Notifiers / providers | Medium | Happy path + error state                              |
| Screens               | Low    | Smoke test for render, interaction for critical flows |
| Shared widgets        | Low    | Only when complex enough to have logic                |

Do not write tests purely for coverage numbers. Write tests for behavior that matters.
