---
applyTo: "lib/**/*.dart"
---

# Widget Conventions

These conventions apply to all Flutter widget code in `lib/`.

---

## Base Class

Use `HookConsumerWidget` as the default base class.

```dart
// Standard widget - use this by default
class TaskCard extends HookConsumerWidget {
  const TaskCard({super.key, required this.task});

  final Task task;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ...;
  }
}

// Pure display widget - use this when there is no state or provider usage
class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status});

  final TaskStatus status;

  @override
  Widget build(BuildContext context) {
    return ...;
  }
}
```

Do not use `StatefulWidget`, `ConsumerWidget`, `ConsumerStatefulWidget`, or `HookWidget`.

---

## Local State

Local widget state uses `useState` and `useAnimationController` hooks - not `setState`.

```dart
// Correct
final isExpanded = useState(false);
final tabController = useTabController(initialLength: 3);
final textController = useTextEditingController();
final scrollController = useScrollController();

// Wrong - do not use
// setState(() { _isExpanded = true; });
```

Hooks are called at the top of `build()` before any conditional returns. Never call hooks inside conditionals or loops.

---

## Spacing and Layout

Use spacing constants from `AppSpacing` - do not hardcode pixel values.

```dart
// Correct
Padding(
  padding: EdgeInsets.all(AppSpacing.md),
)
SizedBox(height: AppSpacing.sm)
SizedBox(width: AppSpacing.xs)

// Wrong
Padding(padding: EdgeInsets.all(16))
SizedBox(height: 8)
```

Spacing scale:
- `AppSpacing.xs` = 4
- `AppSpacing.sm` = 8
- `AppSpacing.md` = 16
- `AppSpacing.lg` = 24
- `AppSpacing.xl` = 32
- `AppSpacing.xxl` = 48

---

## Theming

Access colors and text styles through `Theme.of(context)` or the `AppColors` / `AppTextStyles` constants. Do not hardcode colors.

```dart
// Correct
color: Theme.of(context).colorScheme.primary
color: AppColors.taskOverdue
style: AppTextStyles.bodyMedium

// Wrong
color: Color(0xFF2563EB)
style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)
```

For colors that are semantic (status colors, priority colors), use named constants in `AppColors`:

```dart
AppColors.statusTodo
AppColors.statusInProgress
AppColors.statusDone
AppColors.priorityUrgent
AppColors.priorityHigh
```

---

## Responsiveness

Use `LayoutBuilder` or `MediaQuery` for responsive adjustments. Do not hardcode pixel widths for layout.

```dart
// Preferred for layout decisions
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 600) {
      return WideLayout(...);
    }
    return NarrowLayout(...);
  },
)
```

For font scaling, rely on `TextScaler` from `MediaQuery` - do not disable text scaling.

---

## const Constructors

Mark widgets and their factory calls `const` wherever possible. This is a compile-time optimization and a correctness signal.

```dart
// Correct
const SizedBox(height: AppSpacing.md)
const Icon(Icons.add)
const Divider()
const TaskCard(task: task) // only if task is const

// Wrong
SizedBox(height: AppSpacing.md) // missing const
```

Run the analyzer - it flags missing `const` opportunities.

---

## Widget Decomposition

Prefer small, focused widgets over one large `build()` method. Extract when a widget has distinct visual responsibilities or when a sub-tree can be independently `const`.

```dart
// Preferred - composable parts
class TaskDetailScreen extends HookConsumerWidget {
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(children: [
      TaskHeader(task: task),
      TaskStatusBar(task: task),
      TaskDescription(task: task),
      TaskComments(taskId: task.id),
    ]);
  }
}

// Avoid - one massive build method with nested builders
```

When extracting widgets, prefer separate classes over private methods returning `Widget`. Private builder methods like `_buildHeader()` don't benefit from Flutter's widget rebuild optimization.

---

## Keys

Use `ValueKey` for list items that can change order or be filtered. Use `GlobalKey` only for scroll-to-top and form state - never for identity.

```dart
// List items
ListView.builder(
  itemBuilder: (context, index) => TaskCard(
    key: ValueKey(tasks[index].id),
    task: tasks[index],
  ),
)
```

---

## Loading and Error States

Use the shared `AppAsyncBuilder` widget (or handle `AsyncValue` with `when()`) - do not write ad-hoc loading/error UI in screens.

```dart
// Preferred
ref.watch(taskListProvider).when(
  data: (state) => TaskList(tasks: state.tasks),
  loading: () => const TaskListSkeleton(),
  error: (error, _) => ErrorView(
    message: error.toString(),
    onRetry: () => ref.invalidate(taskListProvider),
  ),
);
```

The `ErrorView` and `TaskListSkeleton` (or equivalent feature skeleton) are in `shared/widgets/`.

---

## Navigation from Widgets

Navigation always goes through GoRouter - never through `Navigator` directly.

```dart
// Correct
context.go(Routes.taskDetail, extra: task);
context.push(Routes.createTask);

// Wrong
Navigator.push(context, MaterialPageRoute(builder: (_) => TaskDetailScreen()));
```

Do not put navigation logic in widget `build()`. Navigation belongs in event callbacks (`onPressed`, `onTap`).
