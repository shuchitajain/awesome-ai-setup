---
name: generate-agent-workflows
description: Read the architecture, identify repeatable workflows, and generate project-specific AGENTS.md and workflow files
---

# Generate Agent Workflows

You are generating `AGENTS.md` and workflow files for this repository.

These files define structured AI agent roles and repeatable development workflows. They are used to give AI tools a scoped, consistent approach to common tasks like adding a new feature, fixing a bug, or refactoring code.

**Agent definitions should reflect this project's actual architecture.** Generic agents that could apply to any project are not useful. The value is in agents that know this codebase's specific layer structure, conventions, and patterns.

---

## Step 1 — Read the Repository Context

This agent should be run after architecture and context files exist. Read them first.

**Required reading:**
1. `ARCHITECTURE.md` — understand the layers, data flow, and conventions
2. `MEMORY.md` — understand decisions made and patterns to avoid
3. `CONTEXT.md` if present — understand the domain
4. The primary source directory structure
5. An existing feature (pick one that seems complete) — read its files across all layers to understand the actual development pattern

**Understand:**
- How many distinct layers exist? (e.g., domain / data / presentation)
- What is the typical development sequence for a new feature in this project?
- What are the natural "hand-off points" between layers?
- What repeatable tasks happen most often? (new feature, bug fix, refactor, migration?)
- What does a complete feature look like in terms of files? (count them, name the patterns)

---

## Step 2 — Identify the Repeatable Workflows

Based on the architecture you've read, identify 2–4 primary workflows that happen repeatedly in this project:

**Common workflows to consider:**
- New feature development (most projects have this)
- Bug investigation and fix
- Refactoring / migrating a pattern
- Adding tests to untested code
- Reviewing for architectural correctness

For each workflow, answer:
- What files are typically touched?
- What is the correct sequence of steps?
- What are the common mistakes or pitfalls specific to this architecture?
- What does "done" look like? (checklist)

---

## Step 3 — Identify the Agent Roles

Based on the layer structure and workflows, identify the distinct agent roles.

**Principles for defining agents:**
- One agent per layer (if the project has clear layers)
- One agent per distinct concern (domain design, implementation, testing, review)
- Agents should have clear input/output boundaries
- An agent's scope should be small enough to produce consistent, verifiable output

**For each agent, define:**
- Name (role-descriptive, e.g., "Domain Architect", "Test Writer")
- Scope: what files/folders it operates on
- Inputs: what it needs before starting (prerequisite files, context)
- Outputs: what it produces
- Constraints: what it must NOT do (important for preventing scope creep)

---

## Step 4 — Generate AGENTS.md

Generate the file with these sections:

### Purpose
2–3 sentences explaining what AGENTS.md is and how to use it.

### How to Invoke an Agent
Brief instructions for how to invoke an agent with an AI tool:
```
"Act as the [Agent Name] for this project.
 Read ARCHITECTURE.md and MEMORY.md first.
 Your task: [specific task description]"
```

### Agent Definitions

For each agent:

```markdown
## [Agent Name]

**Role:** [One sentence describing this agent's responsibility]
**Scope:** [What files/layers/directories this agent works on]

**Prerequisite context to read:**
- [File 1] — [why]
- [File 2] — [why]

**Invoke with:**
```
[The actual prompt text a developer would use to invoke this agent.
 Should be complete enough to use directly.
 Should reference ARCHITECTURE.md and MEMORY.md.
 Should specify exact output expected.
 Should list explicit constraints.]
```

**Output:** [What this agent produces — specific files or sections]
**Does NOT:** [What this agent explicitly does not do — prevents scope creep]
```

---

## Step 5 — Generate Workflow Files

For each primary workflow identified in Step 2, generate a workflow file.

**Location:** `workflows/[workflow-name].md`

**Structure for each workflow file:**

```markdown
# Workflow: [Name]

[One sentence: when to use this workflow]

## When to Use This
[2–3 sentences: what situations call for this workflow]

## Before You Start
[What information to gather, what to check before beginning]

## Steps
[Numbered sequence. For each step:
 - What to do
 - What files to create/modify
 - Code example if the pattern is non-obvious
 - What "done" looks like for this step]

## Checklist
[The "done" checklist for the entire workflow]

## Common Mistakes
[3–5 pitfalls specific to this architecture]
```

**Important:** Workflow steps should be specific to this project's architecture. Reference actual folder names, actual patterns, actual layer names. Generic advice ("write tests") is not useful — specific advice ("write a `ProviderContainer` test for the notifier before writing widget tests") is.

---

## Constraints

**Don't define agents that don't match the architecture.** If the project has no domain layer, don't define a "Domain Architect" agent. If there's no test suite, don't define a "Test Writer" agent. Match agents to the actual project structure.

**Agent prompts should be directly usable.** Someone should be able to copy the "Invoke with" text and paste it into an AI tool and get useful results. Vague invoke prompts like "implement the feature" are not useful.

**Workflows should be specific, not generic.** "Write tests" is not a workflow step. "Create a `ProviderContainer` with a mock repository override, call the notifier method, assert the state transition" is a workflow step.

**Acknowledge real risks.** Each workflow's "Common Mistakes" section should document mistakes that actually happen in this architecture — not generic software engineering pitfalls.

**Keep AGENTS.md focused.** 4–6 agents is the right range for most projects. More than that dilutes focus. Each agent should have a clear, distinct scope.

---

## Output

Output two sections:

**Section 1 — AGENTS.md content:**
Begin with:
```markdown
# Agent Definitions
```

**Section 2 — Workflow files:**
For each workflow, output the full file content with a header:
```
## File: workflows/[name].md
[content]
```

Do not preface with explanation. Produce the file content only.
