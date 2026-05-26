# Memory

This file records architectural decisions, lessons learned, and patterns to avoid. It exists so AI tools don't recommend approaches we've already evaluated and moved away from.

**Maintenance:** Add an entry when you make a significant architectural decision, complete a migration, or fix a recurring AI suggestion problem. Date each entry.

---

## Architectural Decisions

### [2024-06] Chose Riverpod over BLoC

**Context:** Evaluated BLoC (flutter_bloc 8.x) and Riverpod 2.x for state management. The codebase had grown to where BLoC boilerplate was slowing feature development significantly — each feature required a Cubit class, state classes, and verbose test setup.

**Decision:** Riverpod 2.x with `riverpod_annotation` and code generation.

**Why Riverpod won:**
- Less boilerplate for simple state (Notifier vs. Cubit + State classes)
- Provider composition without BuildContext (useful in repositories and use cases)
- Better support for async state with `AsyncNotifier`
- Test setup with `ProviderContainer` is cleaner than `BlocProvider` trees in tests

**What to avoid:** Do not suggest BLoC, Cubit, or the `flutter_bloc` package. If asked to compare state management options, the decision is made — Riverpod is the answer.

---

### [2024-08] Chose GoRouter over auto_route

**Context:** Started with `auto_route` for type-safe navigation. The code generation approach worked but added friction — generated files were large, and the type-safe navigator required significant boilerplate for each new route.

**Decision:** Migrated to `go_router` with string route constants in `core/router/routes.dart`.

**Why GoRouter won:**
- Simpler configuration for our routing needs
- Better integration with Firebase Auth state for redirect guards
- Less generated code
- Maintained by the Flutter team

**What to avoid:** Do not suggest `auto_route` or `Navigator.push/pop`. All navigation is through GoRouter using `context.go()` and `context.push()`.

---

### [2024-09] Chose Freezed over hand-written value objects

**Context:** We had inconsistent value object implementations — some used `equatable`, some implemented `==` manually, some neither. This caused subtle bugs with Riverpod state comparison and `ListView` diffing.

**Decision:** All state classes and domain entities use `@freezed`. All model classes use `@JsonSerializable` (via Freezed's `fromJson`/`toJson` support).

**What to avoid:** Do not write manual `==`/`hashCode` implementations. Do not use `equatable`. Do not write `copyWith` by hand. Use Freezed.

---

### [2024-11] Decided NOT to use Either for use case return values

**Context:** Initially tried `Either<Failure, T>` from `fpdart` for use case return types (common functional programming pattern for error handling in Clean Architecture).

**What happened:** The `Either` pattern required chaining `.fold()` calls at every layer boundary. This was significantly more verbose than alternatives and confused team members unfamiliar with functional programming. Test assertions on `Either` were awkward.

**Decision:** Use cases throw typed exceptions (extending `AppException`). Providers catch them with `AsyncValue.guard()` and `try/catch`. Error types propagate as `AsyncError` state.

**What to avoid:** Do not suggest `Either`, `fpdart`, `dartz`, or functional error handling patterns. The pattern was evaluated and rejected. Errors are handled with standard Dart exceptions.

---

### [2025-01] Standardized on HookConsumerWidget

**Context:** Mixed usage of `StatelessWidget`, `StatefulWidget`, `ConsumerWidget`, `ConsumerStatefulWidget`, `HookWidget`, and `HookConsumerWidget` across the codebase. Inconsistency made it hard to add local state or watch providers consistently.

**Decision:** Use `HookConsumerWidget` as the default widget base class for all screen and complex widget implementations, regardless of whether the current implementation uses hooks or providers. This makes it trivial to add either without class refactoring.

**Exception:** Use `StatelessWidget` only for pure display widgets with no state and no provider dependencies (e.g., `AppButton`, `ErrorView` when receiving all data as parameters).

**What to avoid:** Do not suggest `StatefulWidget` for new widgets. Do not suggest `ConsumerWidget` or `ConsumerStatefulWidget`. Do not suggest `HookWidget`. The standard is `HookConsumerWidget` or `StatelessWidget`.

---

## Migrations Completed

### [2024-06] BLoC → Riverpod migration

All Cubit and BLoC classes have been removed. The `flutter_bloc` package is not in `pubspec.yaml`. If you encounter any BLoC pattern in a suggestion, it is not valid for this codebase.

### [2024-08] auto_route → GoRouter migration

All route configuration is now in `core/router/app_router.dart`. Route name constants are in `core/router/routes.dart`. There are no `@RoutePage` annotations, no `AppRouter` generated class, no auto_route imports anywhere.

### [2024-10] Removed global loading state

Previously used a global `LoadingOverlay` provider that could be triggered from any layer. This caused flickering and made loading state attribution ambiguous (which operation was loading?). Removed in favor of per-provider `AsyncValue.loading()` state.

### [2025-02] Moved from `shared_preferences` to Hive for local cache

Task data is now cached in Hive boxes, not SharedPreferences. SharedPreferences is still used for simple key/value settings (theme, locale). Do not use SharedPreferences for complex object storage.

---

## Anti-Patterns

These patterns have caused bugs or been explicitly removed. Do not reintroduce them.

### Direct Navigator calls

**Pattern:**
```dart
Navigator.push(context, MaterialPageRoute(builder: (_) => SomeScreen()));
Navigator.of(context).pushNamed('/route');
```

**Problem:** Bypasses GoRouter's redirect guards. Auth-protected routes can be reached without authentication. Deep linking breaks.

**Correct approach:**
```dart
context.go(Routes.someRoute);
context.push(Routes.someRoute, extra: data);
```

---

### Provider calls inside build()

**Pattern:**
```dart
Widget build(BuildContext context, WidgetRef ref) {
  final result = ref.read(someNotifierProvider.notifier).doSomething(); // bad
  return ...;
}
```

**Problem:** `ref.read` inside `build` doesn't subscribe to state changes. Use `ref.watch` to subscribe, `ref.read` only in callbacks (event handlers, not build).

**Correct approach:**
```dart
Widget build(BuildContext context, WidgetRef ref) {
  final state = ref.watch(someNotifierProvider); // subscribe here
  return ElevatedButton(
    onPressed: () => ref.read(someNotifierProvider.notifier).doSomething(), // act here
  );
}
```

---

### Business logic in widgets

**Pattern:**
```dart
onPressed: () async {
  final result = await apiClient.createTask(title, description); // direct API call
  if (result.success) { ... }
}
```

**Problem:** Violates layer boundaries. Untestable. API details leak into UI.

**Correct approach:** All mutations go through a Notifier method, which calls a use case, which calls the repository.

---

### Hardcoded strings in UI

**Pattern:**
```dart
Text('No tasks found');
Text('Error: something went wrong');
```

**Problem:** No i18n support, inconsistent copy across the app.

**Correct approach:** All user-facing strings go through the localization system (`AppLocalizations`). Even if we're not translating yet, the infrastructure should be correct.

---

### setState in HookConsumerWidget

**Pattern:**
```dart
class _MyWidgetState extends State<MyWidget> {
  bool _isExpanded = false;
  // ... setState calls
}
```

**Problem:** `HookConsumerWidget` uses hooks for local state, not `setState`.

**Correct approach:**
```dart
class MyWidget extends HookConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    final isExpanded = useState(false);
    // use isExpanded.value and isExpanded.value = true
  }
}
```

---

## Known Technical Debt

These issues are acknowledged and tracked. Do not work around them with new abstractions — fix them directly when addressing the relevant feature area.

- **Pagination not implemented** — task lists currently load all tasks. This will become a problem with large datasets. Tracked in the backlog, not a blocking issue yet.
- **Offline support is incomplete** — the app shows cached data when offline but cannot create or edit tasks. Network detection exists but error messaging is inconsistent.
- **Error messages are too generic** — most `ServerFailure` messages show "Something went wrong". Proper error categorization is a backlog item.

---

## Recurring AI Suggestion Problems

Problems that keep appearing in AI suggestions, documented here to prevent repetition:

- **Suggesting `Provider` package** — We do not use `provider`. The package is not in `pubspec.yaml`. Riverpod is the only state management solution.
- **Using `context.mounted` incorrectly** — `context.mounted` checks should always wrap `context` usage after an `await`. If code uses `context` after an `await` without a mounted check, flag it as a bug.
- **Missing `const` constructors** — Freezed-generated classes support `const` constructors. Prefer `const` for immutable objects.
- **Suggesting `StatefulWidget` for animations** — Use `AnimationController` with `SingleTickerProviderStateMixin` only for complex custom animations. For simple animations, use `flutter_animate` or `AnimatedSwitcher`. Never use `StatefulWidget` just for a simple animation.
