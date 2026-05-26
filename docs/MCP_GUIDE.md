# MCP Integration Guide

Model Context Protocol (MCP) lets AI tools connect to external data sources and services. This guide covers what MCP is, where it's useful for development workflows, and what to expect given the current state of the ecosystem.

---

## What MCP Is

MCP is an open protocol (developed by Anthropic) that standardizes how AI assistants connect to external data and tools. An MCP server exposes capabilities — read files, query databases, search codebases — and an AI client can use those capabilities during a conversation.

The practical effect: AI can query your actual database schema instead of relying on your description of it. It can list the real files in a directory instead of working from documented structure. It can read a GitHub issue directly instead of you copy-pasting it.

Think of MCP servers as plugins that extend what AI can access, not just what it knows.

---

## Current State (as of mid-2025)

MCP is in active development. The protocol itself is stable, but the ecosystem around it is not.

**What's working well:**
- Filesystem access (reading and searching local files)
- GitHub integration (reading issues, PRs, repo contents)
- SQLite and PostgreSQL schema inspection
- Documentation search

**What's variable:**
- Server quality varies significantly — some are production-ready, many are prototypes
- Authentication and permissions handling is inconsistent across servers
- Performance with large file sets can be slow
- Some servers have incomplete implementations of the protocol

**What to expect:**
- Integration details will change as the ecosystem matures
- Server APIs are not fully stable
- Some useful integrations don't exist yet as servers

**Recommendation:** Treat MCP as optional, additive infrastructure. Build workflows that work without it, then enhance them with MCP where it's reliable. Don't build critical paths that depend on specific MCP servers staying operational.

---

## Where MCP Adds Real Value in Development

### 1. Schema Inspection

**Without MCP:** You describe your database schema in `CONTEXT.md`, then update it manually when it changes. AI generates code based on what you've told it, which may be stale.

**With MCP:** AI queries the actual schema directly. It generates migrations against the real structure, catches discrepancies between documented and actual schema, and validates that queries are correct.

**Useful for:** Any project with a relational database (Postgres, SQLite, MySQL).

### 2. Codebase Search

**Without MCP:** You describe your file structure. AI can only see files you explicitly open in the conversation.

**With MCP:** AI can search your codebase for existing patterns, find all usages of a function, or locate where a specific pattern is already implemented before generating a new one.

**Useful for:** Large codebases where patterns are scattered, refactors that need to find all affected call sites.

### 3. GitHub Integration

**Without MCP:** You copy-paste issue descriptions, PR diffs, or review comments into conversations.

**With MCP:** AI can read issues and PRs directly, understand historical context, and generate code against actual requirements rather than your summary of them.

**Useful for:** Feature development from issues, PR review, tracking what's been decided in discussions.

### 4. Documentation Access

**Without MCP:** AI relies on training data for library documentation, which may be outdated.

**With MCP:** AI can fetch current documentation for frameworks and services you use.

**Useful for:** Projects on rapidly evolving frameworks, or when using APIs that post-date model training.

---

## Configuration

MCP servers are configured in tool-specific files. The config structure is the same across tools — only the file path and root key differ.

| Tool | Config path | Root key |
|------|-------------|----------|
| Claude Code | `.mcp.json` (project root) | `"mcpServers"` |
| Cursor | `.cursor/mcp.json` | `"mcpServers"` |
| GitHub Copilot / VS Code | `.vscode/mcp.json` | `"servers"` |

**Claude Code / Cursor (`.mcp.json`, `.cursor/mcp.json`):**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

**GitHub Copilot / VS Code (`.vscode/mcp.json`):**
```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

Use `generate-mcp-config.md` to generate the right config for your stack automatically, or see the Flutter example for an annotated reference: [`../examples/flutter/.vscode/mcp.json`](../examples/flutter/.vscode/mcp.json)

---

## Common Integrations

| Integration | MCP Server | What It Enables |
|-------------|-----------|-----------------|
| Filesystem | `@modelcontextprotocol/server-filesystem` | Read/search actual project files |
| GitHub | `@modelcontextprotocol/server-github` | Read issues, PRs, actions results |
| PostgreSQL | `@modelcontextprotocol/server-postgres` | Query schema, inspect tables |
| Supabase | `@supabase/mcp-server-supabase` | Query tables, inspect schema, read policies |
| SQLite | `@modelcontextprotocol/server-sqlite` | Query local SQLite databases |
| Firebase | (experimental) | Query Firestore schema, read rules |

**Note:** Server availability changes frequently. Verify current package names before configuring.

---

## Security Considerations

MCP servers run as local processes with access to whatever resources you grant them. Before adding a server:

- Check what permissions the server requests
- Verify the server is from a trusted source
- Be careful with filesystem servers in projects containing secrets
- Don't commit `mcp.json` files with embedded credentials — use environment variable references

For team projects, keep `mcp.json` as an example configuration that each developer adapts to their local setup rather than a shared config with actual credentials.

---

## What To Avoid

**Building required workflows around MCP.** If your development process can't function when an MCP server is unavailable, you've created a fragile dependency on experimental infrastructure.

**Adding every available server.** More servers means more context, more potential security surface, and slower response times. Add servers that solve specific, real problems you have today.

**Assuming server stability.** MCP server APIs can change. If you build workflows that depend on specific server behavior, test them after any server updates.

**Over-indexing on MCP vs. static context.** A well-written `ARCHITECTURE.md` provides persistent, reliable context. MCP provides dynamic access. Both have roles, but static context is currently more reliable for most teams.

---

## Decision Guide

| Situation | Use MCP? |
|-----------|----------|
| AI keeps generating code for wrong schema | Yes — database MCP |
| AI doesn't know about recently added files | Yes — filesystem MCP |
| AI needs to reference GitHub issues | Yes — GitHub MCP |
| AI doesn't understand your architecture | No — write ARCHITECTURE.md instead |
| AI suggests wrong patterns | No — write MEMORY.md instead |
| You want AI to be aware of your conventions | No — use instruction files |

---

*The MCP ecosystem is moving quickly. This document will be updated as patterns stabilize.*
