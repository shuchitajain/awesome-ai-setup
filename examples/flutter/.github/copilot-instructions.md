# Project Instructions

These instructions apply to this Flutter project for all AI coding assistance.

---

## Tech Stack

- **Flutter 3.x** with Dart 3.x (null safety, records, sealed classes, patterns)
- **Riverpod 2.x** with `riverpod_annotation` and code generation
- **GoRouter** for navigation
- **Freezed** for immutable state classes and value objects
- **flutter_hooks** for local widget state (used via `HookConsumerWidget`)
- **dio** for HTTP with custom interceptors
- **Hive** for local data caching
- **Firebase** (Auth, Firestore, Storage, Messaging) for backend

---

## Architecture

Feature-first Clean Architecture with three layers per feature:
- `data/` - repository implementations, data sources, JSON models
- `domain/` - entities, repository interfaces, use cases (pure Dart, no Flutter)
- `presentation/` - screens, widgets, Riverpod providers

All new features go under `lib/features/[feature_name]/`. See `ARCHITECTURE.md` for the full structure.

---

## Rules

### Widgets

- Default base class is `HookConsumerWidget` - use it unless the widget is a pure display component with no state or providers
- Use `StatelessWidget` only for widgets that receive all data as parameters and have no side effects
- Do not use `StatefulWidget`. Do not use `ConsumerWidget`. Do not use `HookWidget`
- Widget file names: `snake_case.dart`. Widget class names: `PascalCase`
- All user-facing strings go through `AppLocalizations` - no hardcoded strings in UI

### State management

- All state management is Riverpod - do not use `setState`, `ValueNotifier`, `ChangeNotifier`, `InheritedWidget`, or the `provider` package
- Async state uses `AsyncNotifier` - sync state uses `Notifier`
- State classes use `@freezed` - no manual `==` / `hashCode` / `copyWith`
- `ref.watch` in build, `ref.read` in callbacks - never `ref.read` inside `build()`

### Navigation

- All navigation through GoRouter: `context.go()`, `context.push()`, `context.pop()`
- Route name constants live in `core/router/routes.dart`
- Do not use `Navigator.push/pop/pushNamed` directly

### Error handling

- Use cases throw typed exceptions (subclasses of `AppException`)
- Providers catch with `AsyncValue.guard()` or `try/catch`, surface as `AsyncError`
- Do not use `Either`, `fpdart`, or functional error handling patterns
- All `context` usage after `await` needs a `context.mounted` check

### Imports and packages

Do not suggest or import:
- `flutter_bloc` / BLoC / Cubit
- `provider` package
- `auto_route`
- `get_it` or any service locator
- `dartz` or `fpdart`
- `equatable`

### Layer boundaries

- Domain layer has zero Flutter imports - pure Dart only
- Presentation layer imports from domain only (never from data)
- Data layer implements domain interfaces
- Features do not import from other features directly - use shared providers if needed

---

## Code Style

- `const` everywhere possible - constructors, widgets, values
- Named parameters for anything with 2+ parameters
- Prefer `final` over `var`
- No unused imports
- Run `dart run build_runner build --delete-conflicting-outputs` after adding `@riverpod` or `@freezed` annotations

---

## When Generating New Features

Follow this sequence:
1. Domain entities first (no external dependencies)
2. Repository interface in `domain/repositories/`
3. Use cases in `domain/usecases/`
4. Data models extending entities
5. Data sources (remote, then local if needed)
6. Repository implementation
7. Riverpod providers
8. UI (screens → widgets)
9. Tests for each layer

Do not skip layers. Do not generate UI before domain is defined.

---

## Testing

- Widget tests use `ProviderScope` with overrides - no real network calls
- Mock at the repository layer, not the data source layer
- Use case tests are pure unit tests - no Flutter test runner required
- Test file naming: `[source_file_name]_test.dart` in matching `test/` hierarchy

See `.github/instructions/testing.instructions.md` for full testing conventions.

---

## Development Workflows

For step-by-step procedures, follow the relevant workflow file in `./workflows/`:

- `workflows/feature-development.md` - implementing a new feature end-to-end
- `workflows/bug-fixing.md` - investigating and fixing bugs
- `workflows/refactoring.md` - safe refactoring with blast-radius control
