---
example: flutter
version: 0.1.0
---

# Domain Context

This file describes the application's domain model, business rules, and user workflows. It exists to help AI tools understand what this app does and why - reducing hallucination on domain-specific behavior and preventing suggestions that contradict business requirements.

---

> **Adapter note:** This file uses "TaskFlow" as a placeholder app name. Replace all domain content here with your actual app's domain model. The structure and format are what matters - not the example content.

---

## Application Overview

**TaskFlow** is a collaborative task management tool for small teams (2–50 members). It allows teams to create workspaces, organize tasks into projects, assign work to members, and track progress across multiple concurrent workstreams.

The app is used primarily on mobile (iOS and Android) with feature parity. There is no separate web app - the Flutter app is the only client.

---

## Core Domain Model

### Workspace

The top-level organizational boundary. Everything in the system belongs to a Workspace.

- A User can belong to multiple Workspaces
- Workspaces are isolated - data does not cross Workspace boundaries
- Each Workspace has a subscription tier that determines feature limits
- Workspaces can be Personal (single user) or Team (multiple members)

```
Workspace
├── Members (WorkspaceMember join entity)
├── Projects (one or more)
└── Settings (workspace-level config)
```

### Project

A container for related Tasks with a defined scope and timeline.

- Projects belong to exactly one Workspace
- Projects have a status: `active`, `archived`, `completed`
- A Project can have one Owner and multiple Contributors
- Projects are not deleted - they are archived. Archived Projects are hidden by default but not removed.

```
Project
├── Tasks (many)
├── Members (subset of Workspace members)
├── Status (active | archived | completed)
└── Metadata (name, description, due date, color)
```

### Task

The core unit of work.

- Tasks belong to exactly one Project
- Tasks have a Status: `todo`, `in_progress`, `done`, `cancelled`
- Tasks can be assigned to one User (the Assignee)
- Tasks can have sub-tasks (one level deep - sub-tasks cannot have sub-tasks)
- Tasks have a Priority: `none`, `low`, `medium`, `high`, `urgent`
- Completed and Cancelled are distinct states - "done" means finished successfully, "cancelled" means abandoned

```
Task
├── Status (todo | in_progress | done | cancelled)
├── Priority (none | low | medium | high | urgent)
├── Assignee (User | null)
├── Due date (DateTime | null)
├── Sub-tasks (List<Task>, max one level)
└── Comments (List<Comment>)
```

### User

An authenticated person with access to one or more Workspaces.

- Users have a global profile (name, avatar) but workspace-specific roles
- A User's role is per-Workspace, not global
- Users cannot delete their own accounts directly - they contact support

### WorkspaceMember

The join entity between User and Workspace. Carries the role.

```
WorkspaceMember
├── User (reference)
├── Workspace (reference)
├── Role (owner | admin | member | guest)
└── Status (active | invited | suspended)
```

---

## User Roles

| Role       | Description                                        | Key Capabilities                                                      |
|------------|----------------------------------------------------|-----------------------------------------------------------------------|
| **Owner**  | Created the workspace or was transferred ownership | Full admin access, can delete workspace, transfer ownership           |
| **Admin**  | Elevated member                                    | Manage members, manage billing, cannot delete workspace               |
| **Member** | Standard team member                               | Create/edit tasks and projects, cannot change workspace settings      |
| **Guest**  | External collaborator                              | Read-only access to specific Projects only, cannot see other projects |

**Important:** Guests are scoped to Projects, not the full Workspace. A Guest has no visibility into Projects they weren't explicitly invited to.

---

## Business Rules

These rules are enforced in the domain layer and must not be bypassed by UI shortcuts:

**Workspace rules:**
- Archiving a Project does not delete its Tasks - they remain in the system but are hidden from default views
- A Workspace must always have exactly one Owner - ownership must be transferred before the current Owner can leave
- Free tier Workspaces are limited to 3 Projects and 10 Members

**Task rules:**
- A Task cannot be assigned to a Guest user
- Sub-tasks cannot have their own sub-tasks (enforced at creation)
- Due dates are stored in UTC. Display in the user's local timezone is the responsibility of the presentation layer
- Deleting a Task is a hard delete - there is no trash or undo
- "Completed" tasks stay visible in their Project; "Cancelled" tasks are visually dimmed

**Member rules:**
- An Admin cannot modify another Admin's role (only an Owner can)
- A suspended Member cannot be re-invited - their status must be changed from `suspended` to `active` first

---

## User Workflows

### Onboarding

1. Sign up with email/password or Google OAuth
2. Either create a new Workspace or accept a pending invitation
3. If creating: choose workspace name → complete
4. If accepting: invited workspace becomes the default → complete

### Daily Task Management

1. User opens app → sees Today view (tasks due today + overdue)
2. Navigate to a Project → see all tasks in that Project
3. Change a task's status by tapping the status indicator
4. Swipe a task card to quick-assign or change priority

### Adding a Feature (as a Member)

1. Open the target Project
2. Tap "+ Task"
3. Set title (required), description (optional), due date, priority, assignee
4. Save → Task appears in `todo` status

---

## Terminology

Use these terms consistently. AI suggestions should use domain language, not generic CRUD terms:

| Domain Term | Meaning                           | Do not say                     |
|-------------|-----------------------------------|--------------------------------|
| Workspace   | Top-level organization            | Organization, Team, Account    |
| Project     | Container for Tasks               | Board, Sprint, List            |
| Task        | Unit of work                      | Item, Ticket, Card, Issue      |
| Assignee    | User a Task is assigned to        | Owner (reserved for Workspace) |
| Member      | User with active workspace access | User (use Member in UI copy)   |
| Guest       | Read-only external collaborator   | Viewer, Observer               |
| Archive     | Hide without deleting             | Soft-delete                    |

---

## What This App Does Not Do

Understanding scope prevents AI from suggesting out-of-scope features:

- **No real-time collaboration.** There are no live cursors, no operational transforms, no conflict resolution for simultaneous edits. Data is refreshed via pull-to-refresh and periodic polling.
- **No public API.** All data access is through the mobile app. There is no developer API, no webhooks.
- **No time tracking.** Tasks have due dates and statuses, not time logs or estimates.
- **No SSO/SAML.** Authentication is email/password and Google OAuth only.
- **No file attachments.** Comments can include text and links, but not files.
- **No recurring tasks.** Tasks are created individually; there is no recurrence system.
- **No audit log.** Changes are not logged with attribution.

---

## Edge Cases to Handle

These are real situations that have caused bugs or confusion:

- **Deleted project member assigned to existing tasks:** When a Member is removed from a Project, their existing Task assignments remain. The Task shows their name even though they no longer have project access. This is by design.
- **Timezone boundary for due dates:** A task due "today" depends on the user's timezone. A task due at 2026-01-01 00:00 UTC appears overdue to a user in UTC+3 but due today to a user in UTC-5.
- **Guest user seeing sub-tasks:** A Guest invited to a Project can see all Tasks in that Project, including sub-tasks. There is no sub-task-level access control.
- **Workspace suspension:** A suspended Workspace (non-payment) makes it read-only - users can see data but not create or edit.

---

## Integration Points

| Integration        | Purpose                                   | Status     |
|--------------------|-------------------------------------------|------------|
| Firebase Auth      | Authentication tokens, session management | Production |
| Firestore          | Primary data store                        | Production |
| Firebase Storage   | User avatar uploads                       | Production |
| Firebase Messaging | Push notifications                        | Production |
| Google Sign-In     | OAuth flow                                | Production |
| RevenueCat         | Subscription management                   | Production |

All integrations go through repository interfaces in the domain layer. The presentation layer has no direct Firebase dependencies.
