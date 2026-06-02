# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Bump rules:
- **Patch** (`0.1.x`) - typo fixes, small prompt tweaks, wording improvements
- **Minor** (`0.x.0`) - new agents, new examples, behavior changes to existing agents
- **Major** (`x.0.0`) - breaking changes to file structure or agent contracts

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
