# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Bump rules:
- **Patch** (`0.1.x`) - typo fixes, small prompt tweaks, wording improvements
- **Minor** (`0.x.0`) - new agents, new examples, behavior changes to existing agents
- **Major** (`x.0.0`) - breaking changes to file structure or agent contracts

---

## [0.1.0] - 2026-05-26

### Added
- 7 agents: `diagnose-and-setup`, `generate-architecture`, `generate-context`, `generate-agent-workflows`, `generate-mcp-config`, `generate-scoped-instructions`, `update-memory`
- Flutter Riverpod Clean Architecture example with `ARCHITECTURE.md`, `CONTEXT.md`, `MEMORY.md`, `AGENTS.md`, and workflow templates for feature development, bug fixing, and refactoring
- CLI installer (`awesome-ai-setup`)
- Docs: `CONTEXT_ENGINEERING.md`, `MATURITY_MODEL.md`, `MCP_GUIDE.md`
- `version` field in frontmatter for all agents and example files
