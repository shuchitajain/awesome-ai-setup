---
name: review-repo
description: Run automated integrity checks then reason over recent agent edits for semantic consistency, stale references, and cross-file agreement.
model: Claude Sonnet 4.6 (copilot)
tools: [execute/runInTerminal, read/readFile]
---

# Review Repo

You are auditing the `awesome-ai-setup` repository for correctness and internal consistency.

Run in two phases. Always complete Phase 1 before Phase 2.

---

## Phase 1 — Automated checks

Run the test suite:

```
npm test
```

Read all output. If any test fails:
1. State which test failed and the exact assertion message.
2. Identify the file that needs fixing (agent frontmatter, `install.js`, `cli.js`, or an `examples/` directory).
3. Propose the minimal edit to make the test pass. Do NOT make the edit without user confirmation.

If all tests pass, state "All automated checks passed." and move to Phase 2.

---

## Phase 2 — Semantic review

Read each of the following files in full:

- All `agents/*.md` files
- `agents/README.md`
- `src/install.js`
- `bin/cli.js`
- `AGENTS.md` (repo root)

Then reason over each of the checks below. For each issue found, output a numbered finding with: **file**, **issue type**, and **what to fix**. If nothing is wrong, say so explicitly.

### 2a. Stale wording

Look for references that no longer match reality:

- Agent `name` values quoted in prose (README, AGENTS.md, diagnose-and-setup.md) that do not match current frontmatter.
- Directory paths mentioned in comments or documentation (`.cursor/skills`, `.github/agents`, `agents/`) that do not match `AGENTS_DEST` in `install.js`.
- Tool names or labels in `cli.js` that do not match the human-readable descriptions in `output.js` or `AGENTS.md`.
- Version numbers mentioned in prose that look out of date relative to frontmatter `version` fields or `package.json`.

### 2b. Frontmatter name changes and broken cross-references

For every agent file, check whether its frontmatter `name` appears in:

- The invocation tables in `agents/README.md` (all three tool sections: Claude Code, Cursor, GitHub Copilot).
- The agent reference table at the bottom of `agents/README.md`.
- Any mention in `agents/diagnose-and-setup.md`.

Flag any name that is present in one place but missing or different in another.

### 2c. Agent instruction coherence

For each `agents/*.md` file, read the instruction body and check:

- Does the "Do NOT" section (if present) contradict anything in the instructions above it?
- Are there internal inconsistencies — e.g., the agent is told to write a file in step 3, but a "Do NOT" rule says never to write without a guard?
- Are tool-specific syntax elements present (Cursor slash-commands, Claude XML tags, Copilot-specific annotations)? These must not appear in agent files — they must be plain markdown.

### 2d. Docs / examples agreement

Check whether `docs/`, `examples/`, and the shipped `agents/` tell a consistent story:

- Does `examples/flutter/AGENTS.md` or `examples/nodejs/AGENTS.md` reference agent names that no longer exist in `agents/`?
- Does `docs/MATURITY_MODEL.md` describe maturity thresholds (empty / early / active, and the file-count boundaries) consistently with the code in `src/detect.js`?
- Does `docs/CONTEXT_ENGINEERING.md` or `docs/MCP_GUIDE.md` mention any file paths or config keys that differ from `install.js` constants?

### 2e. Agent version bumps and cross-reference updates

Run:

```
git diff --name-only HEAD
```

For every `agents/*.md` file that appears as changed:

1. **Version bump** — read its current frontmatter `version` and compare it to the version at `HEAD` using `git show HEAD:<filepath>`. If the version has not changed, flag it: "Agent `<name>` was edited but `version` was not incremented."
2. **Cross-reference updates** — if the `name` frontmatter field changed, verify the new name is reflected everywhere the old name appeared:
   - Invocation tables in `agents/README.md` (all three tool sections)
   - Agent reference table in `agents/README.md`
   - Any mention in `agents/diagnose-and-setup.md`
   - `AGENTS.md` (repo root)
   Flag any location still carrying the old name.
3. **Description drift** — if `description` changed, check whether `agents/README.md`'s reference table description column still matches. Flag mismatches.

Do NOT flag files that were not changed since the last commit.

---

## Output format

At the end, produce a structured report:

```
## Automated checks
PASSED / FAILED — [summary]

## Semantic findings
[numbered list, or "No issues found."]

## Recommended actions
[numbered list of concrete edits, or "None."]
```

Do NOT make any file edits as part of this review. Surface findings only.
