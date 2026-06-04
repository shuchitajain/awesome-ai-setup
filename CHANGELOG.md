# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Bump rules:
- **Patch** (`0.1.x`) - typo fixes, small prompt tweaks, wording improvements
- **Minor** (`0.x.0`) - new agents, new examples, behavior changes to existing agents
- **Major** (`x.0.0`) - breaking changes to file structure or agent contracts

---

## [0.6.0] - 2026-06-04

### Changed
- `diagnose-and-setup` (→ 0.4.0): updated Cursor global instructions path to `.cursor/rules/global.mdc` (current); `.cursorrules` now flagged as legacy/stale if found without `global.mdc`; removed `.claudeignore` from Claude Code detection signal; updated tool config table to reflect `.cursor/rules/global.mdc` as Cursor's primary global file
- `generate-agent-workflows` (→ 0.3.0): updated Cursor instruction file reference from `.cursorrules` to `.cursor/rules/global.mdc`; corrected tool detection signals to match `generate-scoped-instructions`; added `alwaysApply: false` to Cursor scoped rule frontmatter template; updated Copilot agent `tools` field format to `read/readFile, edit/editFiles, execute/runInTerminal`
- `generate-scoped-instructions` (→ 0.6.0): added `.cursor/rules/global.mdc` to existing-file scan; removed `.claudeignore` from Claude Code detection signal; Cursor global file target updated from `.cursorrules` to `.cursor/rules/global.mdc` with `alwaysApply: true`; added comma-separated globs note for Copilot `applyTo` frontmatter; fixed Cursor agent skills location from `.agents/skills/` to `.cursor/skills/`; updated Copilot wrapper `tools` format to `search/codebase, edit/editFiles, read/readFile`
- CLI: removed "ignore files" prompt — ignore file install is now always applied silently
- `src/install.js`: `IGNORE_FILE` updated — only Cursor receives a `.cursorignore`; Claude Code and Copilot entries set to `null` (neither has a supported ignore file equivalent)
- `src/detect.js`: `empty` maturity threshold changed from `=== 0` to `< 5` source files

---

## [0.5.0] - 2026-06-02

### Added
- `AGENTS.md` (repo root) — canonical agent context file for AI tools working on this repository
- `test/lint-agents.js` — automated test suite validating agent frontmatter, cross-references, example structure, and install constants
- `.github/agents/review-repo.md` — Copilot agent for auditing repo integrity and semantic consistency

### Changed
- `generate-scoped-instructions` (→ 0.5.0): now AGENTS.md-aware — skips `.cursorrules` if `AGENTS.md` is present (Cursor reads it natively), conditionally skips `.github/copilot-instructions.md` for Copilot, and generates `CLAUDE.md` with an explicit `Read AGENTS.md` instruction for Claude Code
- `generate-agent-workflows` (→ 0.2.0): `AGENTS.md` generation now produces a `### Project Instructions` section (replaces `### Purpose`) with global constraints for all agents; adds context preamble explaining AGENTS.md's cross-tool role

---

## [0.4.0] - 2026-06-02

### Changed
- `generate-scoped-instructions` now appends a `## Project Context` block to generated global instruction files (`CLAUDE.md`, `copilot-instructions.md`, `.cursorrules`), referencing whichever of `ARCHITECTURE.md`, `CONTEXT.md`, `MEMORY.md`, and `AGENTS.md` exist at generation time — making those files auto-discoverable by the AI without manual setup

---

## [0.3.0] - 2026-06-02

### Changed
- Cursor agent destination updated from `.cursor/commands/` to `.cursor/skills/<name>/SKILL.md` (Cursor Agent Skills format, replaces deprecated slash commands)
- Cursor invocation updated from `@.cursor/commands/<name>.md` to `/<name>` in Agent chat
- GitHub Copilot agent files now use `.md` extension (not `.agent.md`) in `.github/agents/`
- Detection signal for Cursor updated from `.cursor/commands` to `.cursor/skills`
- Active constraints now live in `ARCHITECTURE.md` (not `MEMORY.md`); `MEMORY.md` references `ARCHITECTURE.md` for them instead of duplicating
- `update-memory` agent, `CONTEXT_ENGINEERING.md`, `MATURITY_MODEL.md`, and both examples updated to reflect the corrected ARCHITECTURE/MEMORY boundary

---

## [0.2.0] - 2026-06-01

### Added
- Node.js example (`examples/nodejs/`) with `ARCHITECTURE.md`, `CONTEXT.md`, `MEMORY.md`, `AGENTS.md`, `copilot-instructions.md`, and workflow templates
- Config file reference diagram in README showing every tool's file locations at a glance
- MCP config mirroring: CLI detects existing MCP configs across all tools and mirrors servers instead of generating a generic stub

### Changed
- `generate-scoped-instructions` now generates scoped instruction files for all detected tools (Copilot `.github/instructions/`, Claude Code `.claude/rules/`, Cursor `.cursor/rules/`)
- Install overwrite prompt reworded to avoid misleading behavior

---

## [0.1.1] - 2026-05-27

### Fixed
- Package entry point and `package.json` warnings

---

## [0.1.0] - 2026-05-26

### Added
- 7 agents: `diagnose-and-setup`, `generate-architecture`, `generate-context`, `generate-agent-workflows`, `generate-mcp-config`, `generate-scoped-instructions`, `update-memory`
- Flutter Riverpod Clean Architecture example with `ARCHITECTURE.md`, `CONTEXT.md`, `MEMORY.md`, `AGENTS.md`, and workflow templates for feature development, bug fixing, and refactoring
- CLI installer (`awesome-ai-setup`)
- Docs: `CONTEXT_ENGINEERING.md`, `MATURITY_MODEL.md`, `MCP_GUIDE.md`
- `version` field in frontmatter for all agents and example files
