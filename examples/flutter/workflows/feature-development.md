---
example: flutter
version: 0.1.0
---

# Workflow: Feature Development

A structured process for implementing new features in this Flutter Riverpod Clean Architecture project.

Use this workflow when starting a new feature from a requirement or issue. It produces consistently structured code that respects layer boundaries and testing expectations.

---

## When to Use This

- Implementing a new user-facing feature from a product requirement
- Adding a new data domain (new entity, new backend integration)
- Building a new screen or user flow

Do NOT use this for bug fixes (see `bug-fixing.md`) or refactors (see `refactoring.md`).

---

## Before You Start

**Gather:**
1. The feature requirement or ticket description
2. Any design/wireframes if available
3. Relevant API documentation or schema changes

**Check:**
- Does this feature already partially exist? (`grep -r "[feature_name]" lib/`)
- Does this feature add a new entity to the domain? If so, does it need a data source?
- Does this feature affect navigation? If so, what routes need updating?
- Does this feature affect auth/permissions? Does it need role checks?

---

## Implementation Sequence

Follow this order. Each step should be complete before moving to the next.

### Step 1 - Define the Domain

Start in `lib/features/[feature_name]/domain/`.

**Entities first:**
```dart
// domain/entities/[entity].dart
// Pure Dart class - no Flutter, no JSON, no external packages
// Use Freezed for immutability

@freezed
class Project with _$Project {
  const factory Project({
    required String id,
    required String name,
    required String workspaceId,
    required ProjectStatus status,
    String? description,
    DateTime? dueDate,
  }) = _Project;
}

enum ProjectStatus { active, archived, completed }
```

**Repository interface next:**
```dart
// domain/repositories/project_repository.dart
abstract class ProjectRepository {
  Future<List<Project>> getProjects({ProjectStatus? status});
  Future<Project> getProjectById(String id);
  Future<Project> createProject(CreateProjectParams params);
  Future<Project> updateProject(String id, UpdateProjectParams params);
  Future<void> archiveProject(String id);
}
```

**Use cases last in domain:**
```dart
// domain/usecases/get_projects.dart
class GetProjects {
  const GetProjects({required this.repository});
  final ProjectRepository repository;

  Future<List<Project>> call({ProjectStatus? status}) =>
    repository.getProjects(status: status);
}
```

One use case per file. One public method per use case. No business logic in use case constructors.

---

### Step 2 - Implement the Data Layer

In `lib/features/[feature_name]/data/`.

**Model (extends entity, adds serialization):**
```dart
// data/models/project_model.dart
@freezed
class ProjectModel with _$ProjectModel {
  const factory ProjectModel({
    required String id,
    required String name,
    @JsonKey(name: 'workspace_id') required String workspaceId,
    required String status,
    String? description,
    @JsonKey(name: 'due_date') DateTime? dueDate,
  }) = _ProjectModel;

  factory ProjectModel.fromJson(Map<String, dynamic> json) =>
    _$ProjectModelFromJson(json);
}

extension ProjectModelMapper on ProjectModel {
  Project toEntity() => Project(
    id: id,
    name: name,
    workspaceId: workspaceId,
    status: ProjectStatus.values.byName(status),
    description: description,
    dueDate: dueDate,
  );
}
```

**Remote data source:**
```dart
// data/datasources/project_remote_datasource.dart
abstract class ProjectRemoteDataSource {
  Future<List<ProjectModel>> getProjects({String? status});
  Future<ProjectModel> getProjectById(String id);
  Future<ProjectModel> createProject(Map<String, dynamic> data);
}

class ProjectRemoteDataSourceImpl implements ProjectRemoteDataSource {
  const ProjectRemoteDataSourceImpl({required this.client});
  final DioClient client;

  @override
  Future<List<ProjectModel>> getProjects({String? status}) async {
    final response = await client.get(
      '/projects',
      queryParameters: status != null ? {'status': status} : null,
    );
    return (response.data as List)
      .map((json) => ProjectModel.fromJson(json as Map<String, dynamic>))
      .toList();
  }
}
```

**Repository implementation:**
```dart
// data/repositories/project_repository_impl.dart
class ProjectRepositoryImpl implements ProjectRepository {
  const ProjectRepositoryImpl({required this.remoteDataSource});
  final ProjectRemoteDataSource remoteDataSource;

  @override
  Future<List<Project>> getProjects({ProjectStatus? status}) async {
    try {
      final models = await remoteDataSource.getProjects(
        status: status?.name,
      );
      return models.map((m) => m.toEntity()).toList();
    } on DioException catch (e) {
      throw ServerException(e.message ?? 'Network error');
    }
  }
}
```

---

### Step 3 - Wire Up Providers

In `lib/features/[feature_name]/presentation/providers/`.

**Datasource and repository providers (in data layer or a providers file):**
```dart
@riverpod
ProjectRemoteDataSource projectRemoteDataSource(ProjectRemoteDataSourceRef ref) {
  return ProjectRemoteDataSourceImpl(client: ref.watch(dioClientProvider));
}

@riverpod
ProjectRepository projectRepository(ProjectRepositoryRef ref) {
  return ProjectRepositoryImpl(
    remoteDataSource: ref.watch(projectRemoteDataSourceProvider),
  );
}
```

**Use case providers:**
```dart
@riverpod
GetProjects getProjects(GetProjectsRef ref) {
  return GetProjects(repository: ref.watch(projectRepositoryProvider));
}
```

**Feature notifier:**
```dart
@riverpod
class ProjectList extends _$ProjectList {
  @override
  Future<ProjectListState> build() async {
    final projects = await ref.watch(getProjectsProvider).call();
    return ProjectListState(projects: projects);
  }

  Future<void> filterByStatus(ProjectStatus? status) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final projects = await ref.read(getProjectsProvider).call(status: status);
      return ProjectListState(projects: projects, activeFilter: status);
    });
  }
}
```

Run code generation after adding providers:
```bash
dart run build_runner build --delete-conflicting-outputs
```

---

### Step 4 - Build the UI

In `lib/features/[feature_name]/presentation/`.

**Screens:**
- One file per screen
- Screen is responsible for layout and provider connection
- Delegate rendering to widgets

```dart
class ProjectListScreen extends HookConsumerWidget {
  const ProjectListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(projectListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Projects')),
      body: state.when(
        loading: () => const ProjectListSkeleton(),
        error: (error, _) => ErrorView(
          message: 'Could not load projects',
          onRetry: () => ref.invalidate(projectListProvider),
        ),
        data: (s) => s.projects.isEmpty
          ? const EmptyState(message: 'No projects yet')
          : ProjectList(projects: s.projects),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push(Routes.createProject),
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

**Widgets:**
- Each widget is focused on a single visual responsibility
- Receive data as parameters - do not watch providers inside list item widgets
- Use `const` where possible

---

### Step 5 - Update Navigation

In `core/router/app_router.dart`:

```dart
GoRoute(
  path: Routes.projects,
  builder: (context, state) => const ProjectListScreen(),
),
GoRoute(
  path: Routes.projectDetail,
  builder: (context, state) {
    final projectId = state.pathParameters['id']!;
    return ProjectDetailScreen(projectId: projectId);
  },
),
```

In `core/router/routes.dart`:
```dart
static const projects = '/projects';
static const projectDetail = '/projects/:id';
static const createProject = '/projects/new';
```

---

### Step 6 - Write Tests

Minimum test coverage for a new feature:

1. **Use case test** - happy path + error propagation
2. **Repository impl test** - verifies data source is called correctly, model is mapped to entity
3. **Provider test** - happy path, empty state, error state
4. **Widget smoke test** - screen renders without errors, key content visible

See `testing.instructions.md` for specific patterns.

---

### Step 7 - Review Checklist

Before marking the feature complete:

- [ ] Domain layer has no Flutter/external dependencies
- [ ] Presentation layer imports only from domain (not from data)
- [ ] All user-facing strings use `AppLocalizations`
- [ ] Navigation uses GoRouter, not Navigator
- [ ] New routes added to `routes.dart`
- [ ] Providers are `@riverpod` annotated and code is generated
- [ ] State uses Freezed
- [ ] Error states are handled in UI with retry option
- [ ] Loading states are handled with appropriate skeleton/spinner
- [ ] Tests exist for use cases and providers
- [ ] No hardcoded colors or spacing values
- [ ] `context.mounted` checks after `await` if using BuildContext

---

## Common Pitfalls

**Starting with UI.** Always start with domain. UI built before the domain model is defined tends to leak presentation concerns into business logic.

**Putting too much in providers.** Providers should be thin wrappers that call use cases. Business logic goes in use cases. Data transformation goes in models and repositories.

**Skipping the repository interface.** Even if there's only one implementation, define the abstract interface. This makes testing clean and leaves the door open for future implementations.

**Forgetting code generation.** After adding `@riverpod` or `@freezed`, the generated files need updating. Run build_runner.
