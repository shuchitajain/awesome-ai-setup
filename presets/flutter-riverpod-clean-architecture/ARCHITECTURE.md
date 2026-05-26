# Architecture

This document describes the structure, layers, and conventions of this Flutter application. It is the primary context file for AI tools to understand where code belongs and how the system is organized.

---

## System Overview

This app uses **feature-first Clean Architecture** with three layers per feature: data, domain, and presentation. All state management is handled by Riverpod 2.x with code generation. Navigation uses GoRouter. Dependency injection is handled entirely through Riverpod providers.

Data flows in one direction: UI triggers → Riverpod providers → use cases → repository interfaces → repository implementations → data sources.

The codebase is organized around features, not layers. Each feature is a self-contained vertical slice that includes its own data access, business logic, and UI. Shared infrastructure lives in `core/` and shared UI components live in `shared/`.

---

## Folder Structure

```
lib/
├── core/                          # Shared infrastructure — not feature-specific
│   ├── constants/
│   │   ├── app_constants.dart     # App-wide constants (timeout, pagination limits)
│   │   └── api_constants.dart     # Base URLs, endpoint paths
│   ├── errors/
│   │   ├── exceptions.dart        # Exception types (ServerException, CacheException)
│   │   └── failures.dart          # Failure sealed class for domain layer errors
│   ├── network/
│   │   ├── dio_client.dart        # dio instance with interceptors
│   │   └── interceptors/
│   │       ├── auth_interceptor.dart
│   │       └── logging_interceptor.dart
│   ├── router/
│   │   ├── app_router.dart        # GoRouter configuration and route definitions
│   │   └── routes.dart            # Route name constants (avoid magic strings)
│   ├── storage/
│   │   └── local_storage.dart     # SharedPreferences / Hive wrapper
│   └── theme/
│       ├── app_theme.dart         # ThemeData construction
│       ├── app_colors.dart        # Color tokens (semantic names, not hex values)
│       └── app_text_styles.dart   # TextStyle definitions
│
├── features/
│   ├── auth/                      # Authentication and session management
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   └── auth_local_datasource.dart
│   │   │   ├── models/
│   │   │   │   ├── user_model.dart          # extends User entity, adds fromJson/toJson
│   │   │   │   └── session_model.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart                # Pure Dart, no Flutter/JSON dependencies
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart     # Abstract interface
│   │   │   └── usecases/
│   │   │       ├── sign_in_with_email.dart
│   │   │       ├── sign_out.dart
│   │   │       └── get_current_user.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   └── register_screen.dart
│   │       ├── widgets/
│   │       │   ├── email_field.dart
│   │       │   └── password_field.dart
│   │       └── providers/
│   │           ├── auth_provider.dart       # AsyncNotifier, exposes auth state
│   │           └── auth_state.dart          # Freezed state class
│   │
│   ├── tasks/                     # Task management (core feature)
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── task_remote_datasource.dart
│   │   │   │   └── task_local_datasource.dart   # Hive cache
│   │   │   ├── models/
│   │   │   │   └── task_model.dart
│   │   │   └── repositories/
│   │   │       └── task_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── task.dart
│   │   │   ├── repositories/
│   │   │   │   └── task_repository.dart
│   │   │   └── usecases/
│   │   │       ├── get_tasks.dart
│   │   │       ├── create_task.dart
│   │   │       ├── update_task.dart
│   │   │       └── delete_task.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   ├── task_list_screen.dart
│   │       │   └── task_detail_screen.dart
│   │       ├── widgets/
│   │       │   ├── task_card.dart
│   │       │   └── task_form.dart
│   │       └── providers/
│   │           ├── task_list_provider.dart
│   │           ├── task_detail_provider.dart
│   │           └── task_form_provider.dart
│   │
│   └── profile/                   # User profile and settings
│       └── [same structure]
│
└── shared/
    ├── widgets/
    │   ├── app_button.dart        # Primary/secondary button variants
    │   ├── app_text_field.dart    # Shared form field with validation display
    │   ├── loading_overlay.dart   # Full-screen loading state
    │   ├── error_view.dart        # Standardized error display
    │   └── empty_state.dart       # Empty list/result state
    └── providers/
        └── shared_providers.dart  # Cross-feature providers (connectivity, locale)
```

---

## Layer Rules

These rules are strict. Cross-layer violations are rejected in code review.

```
┌─────────────────────────────────────────────────┐
│  Presentation (Flutter-specific)                 │
│  screens/, widgets/, providers/                  │
│  Can import: domain only                         │
│  Cannot import: data layer, other feature data   │
├─────────────────────────────────────────────────┤
│  Domain (pure Dart)                              │
│  entities/, repositories/ (abstract), usecases/ │
│  Can import: nothing outside core/errors         │
│  Cannot import: Flutter, data, presentation      │
├─────────────────────────────────────────────────┤
│  Data (implementation detail)                    │
│  datasources/, models/, repositories/ (impl)     │
│  Can import: domain interfaces, core/network     │
│  Cannot import: presentation                     │
└─────────────────────────────────────────────────┘
         ↑ All layers can import from core/
```

**Key rule:** The domain layer has zero Flutter dependencies. If you're importing from the Flutter SDK in a `domain/` file, it belongs somewhere else.

---

## Data Flow

```
User Interaction
      │
      ▼
Widget (HookConsumerWidget)
      │  ref.watch / ref.read
      ▼
Provider (AsyncNotifier / Notifier)
      │  calls use case
      ▼
UseCase
      │  calls repository interface
      ▼
Repository Interface (domain/repositories/)
      │  implemented by
      ▼
RepositoryImpl (data/repositories/)
      │  calls
      ▼
RemoteDataSource ←──── dio ────→ REST API
LocalDataSource  ←──── Hive ───→ Local cache
```

Providers do not call data sources directly. They call use cases. Use cases call repository interfaces. This boundary is important — it keeps business logic testable without Flutter or network dependencies.

---

## Riverpod Conventions

### Provider naming

```dart
// Notifiers — describe the state they manage
@riverpod
class TaskList extends _$TaskList { ... }          // taskListProvider

@riverpod
class TaskDetail extends _$TaskDetail { ... }      // taskDetailProvider

// Simple providers — describe what they provide
@riverpod
TaskRepository taskRepository(TaskRepositoryRef ref) { ... }

@riverpod
Future<User?> currentUser(CurrentUserRef ref) { ... }
```

### State pattern

All significant state uses Freezed:

```dart
@freezed
class TaskListState with _$TaskListState {
  const factory TaskListState({
    @Default([]) List<Task> tasks,
    @Default(false) bool isLoading,
    String? error,
    @Default(TaskFilter.all) TaskFilter filter,
  }) = _TaskListState;
}
```

### AsyncNotifier pattern

```dart
@riverpod
class TaskList extends _$TaskList {
  @override
  Future<TaskListState> build() async {
    final tasks = await ref.watch(taskRepositoryProvider).getTasks();
    return TaskListState(tasks: tasks);
  }

  Future<void> createTask(CreateTaskParams params) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(createTaskProvider).call(params),
    );
  }
}
```

Do not mix `AsyncNotifier` and `Notifier` — if the build method is async, the class extends `AsyncNotifier`.

---

## Navigation (GoRouter)

Routes are defined in `core/router/app_router.dart`. Route name constants live in `core/router/routes.dart`.

```dart
// routes.dart
abstract class Routes {
  static const home = '/';
  static const login = '/login';
  static const taskDetail = '/tasks/:id';
  static const profile = '/profile';
}

// Navigation — always use named routes
context.go(Routes.home);
context.push(Routes.taskDetail, extra: task);
context.pop();

// Never use
Navigator.push(context, ...);   // ← do not use
Navigator.of(context).push(...); // ← do not use
```

Authentication guards are handled by GoRouter's `redirect` callback, not inside individual screens.

---

## Feature Structure Template

When adding a new feature, follow this structure exactly:

```
features/[feature_name]/
├── data/
│   ├── datasources/
│   │   ├── [feature]_remote_datasource.dart
│   │   └── [feature]_local_datasource.dart   (if caching needed)
│   ├── models/
│   │   └── [entity]_model.dart
│   └── repositories/
│       └── [feature]_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── [entity].dart
│   ├── repositories/
│   │   └── [feature]_repository.dart          (abstract)
│   └── usecases/
│       └── [action]_[entity].dart              (one file per use case)
└── presentation/
    ├── screens/
    │   └── [feature]_screen.dart
    ├── widgets/
    │   └── [specific_component].dart
    └── providers/
        ├── [feature]_provider.dart
        └── [feature]_state.dart               (if using Freezed state)
```

---

## Dependency Injection

There is no DI container. Dependencies are wired entirely through Riverpod providers.

```dart
// datasource provider — created in data layer
@riverpod
TaskRemoteDataSource taskRemoteDataSource(TaskRemoteDataSourceRef ref) {
  return TaskRemoteDataSourceImpl(dioClient: ref.watch(dioClientProvider));
}

// repository provider — created in data layer, typed to domain interface
@riverpod
TaskRepository taskRepository(TaskRepositoryRef ref) {
  return TaskRepositoryImpl(
    remoteDataSource: ref.watch(taskRemoteDataSourceProvider),
    localDataSource: ref.watch(taskLocalDataSourceProvider),
  );
}

// use case providers — thin wrappers
@riverpod
GetTasks getTasks(GetTasksRef ref) {
  return GetTasks(repository: ref.watch(taskRepositoryProvider));
}
```

Provider overrides in tests replace the repository layer without touching the UI or use case layer.

---

## Naming Conventions

| Concept | Pattern | Example |
|---------|---------|---------|
| Feature folder | `snake_case` | `features/task_management/` |
| Screen | `[Name]Screen` | `TaskDetailScreen` |
| Widget | `[Name]` (descriptive) | `TaskCard`, `EmptyState` |
| Entity | `[Name]` (singular noun) | `Task`, `User`, `Project` |
| Model | `[Name]Model` | `TaskModel`, `UserModel` |
| Repository interface | `[Feature]Repository` | `TaskRepository` |
| Repository impl | `[Feature]RepositoryImpl` | `TaskRepositoryImpl` |
| DataSource interface | `[Feature]RemoteDataSource` | `TaskRemoteDataSource` |
| DataSource impl | `[Feature]RemoteDataSourceImpl` | `TaskRemoteDataSourceImpl` |
| UseCase | `[Verb][Entity]` | `GetTasks`, `CreateTask` |
| Notifier | `[Entity][Context]` | `TaskList`, `TaskDetail` |
| State | `[Notifier]State` | `TaskListState` |
| Provider (generated) | `[notifierName]Provider` | `taskListProvider` |

---

## Error Handling

The domain layer uses a sealed `Failure` class. Data sources throw typed exceptions. Repository implementations catch exceptions and convert them to failures.

```dart
// domain/errors/failures.dart
sealed class Failure {
  const Failure(this.message);
  final String message;
}

class ServerFailure extends Failure {
  const ServerFailure(super.message);
}

class NetworkFailure extends Failure {
  const NetworkFailure(super.message);
}

class CacheFailure extends Failure {
  const CacheFailure(super.message);
}

class AuthFailure extends Failure {
  const AuthFailure(super.message);
}
```

Use cases return `Either<Failure, T>` from `fpdart` or throw failures directly — this is a project-specific decision. Check `MEMORY.md` for which pattern this project settled on.

Providers catch failures and surface them via `AsyncError` state. Screens use `when()` on `AsyncValue` to handle loading, error, and data states.

---

## Code Generation

This project uses build_runner for code generation. Run after adding/modifying:
- `@riverpod` annotations → generates `.g.dart` files
- `@freezed` annotations → generates `.freezed.dart` files
- `@JsonSerializable` annotations → generates `.g.dart` files

```bash
dart run build_runner build --delete-conflicting-outputs
# or during development
dart run build_runner watch --delete-conflicting-outputs
```

Generated files (`.g.dart`, `.freezed.dart`) are committed to the repository.

---

## Architecture Decision Records

Significant architecture decisions are tracked in `MEMORY.md`. Check there before suggesting alternative approaches to state management, navigation, or dependency injection — these decisions have context.
