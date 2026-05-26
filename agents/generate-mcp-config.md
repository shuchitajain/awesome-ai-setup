# Agent: Generate MCP Configuration

You are generating MCP (Model Context Protocol) configuration files for this repository.

MCP connects AI tools to live data sources — your database schema, GitHub issues, filesystem, and external APIs — so they work with real state instead of documented state. This agent detects which integrations are relevant for this project and generates the correct config file for each AI tool in use.

---

## Step 1 — Detect the Stack and Existing Setup

**Read these sources:**

1. **Dependency manifest** (`pubspec.yaml`, `package.json`, `Cargo.toml`, etc.) — identify the tech stack and any backend services in use (Supabase, Firebase, PostgreSQL, etc.)
2. **Existing MCP configs** — check for `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`. Read them if present — don't overwrite entries that already exist.
3. **Environment files** — check `.env.example` or `.env` (keys only, never values) to understand what external services are configured
4. **README or docs** — may name backend services explicitly

**Identify which AI tools are in use** by checking for:
- `CLAUDE.md` → Claude Code → config goes in `.mcp.json`
- `.cursor/` or `.cursorrules` → Cursor → config goes in `.cursor/mcp.json`
- `.github/copilot-instructions.md` → GitHub Copilot → config goes in `.vscode/mcp.json`

If none are detected, generate all three.

---

## Step 2 — Select Relevant MCP Servers

Based on what you found, select from these servers. Only include servers with a clear reason to exist in this project.

**Universal (include for any project):**

| Server | npm package | When to include |
|--------|-------------|-----------------|
| GitHub | `@modelcontextprotocol/server-github` | Any project with a GitHub remote |
| Filesystem | `@modelcontextprotocol/server-filesystem` | Always — lets AI read actual files |

**Database / backend:**

| Server | npm package | When to include |
|--------|-------------|-----------------|
| PostgreSQL | `@modelcontextprotocol/server-postgres` | If `pg`, `postgres`, `drizzle-orm`, or `prisma` detected |
| Supabase | `@supabase/mcp-server-supabase` | If `@supabase/supabase-js` detected |
| Firebase | `mcp-server-firebase` | If `firebase` or `firebase-admin` detected |
| SQLite | `@modelcontextprotocol/server-sqlite` | If `sqlite3`, `better-sqlite3`, or `sqflite` detected |

**Search and documentation:**

| Server | npm package | When to include |
|--------|-------------|-----------------|
| Brave Search | `@modelcontextprotocol/server-brave-search` | Offer as optional — useful for any project |

Do not include servers you have no evidence for. A config with two well-chosen servers is better than one with eight speculative entries.

---

## Step 3 — Generate the Config Files

For each AI tool detected in Step 1, generate the appropriate config file.

**File format** (same structure, different paths):

```json
{
  "mcpServers": {
    "[server-name]": {
      "command": "npx",
      "args": ["-y", "[npm-package]"],
      "env": {
        "[ENV_VAR]": "YOUR_VALUE_HERE"
      }
    }
  }
}
```

**File paths by tool:**

| Tool | Config path |
|------|-------------|
| Claude Code | `.mcp.json` (project root) |
| Cursor | `.cursor/mcp.json` |
| GitHub Copilot / VS Code | `.vscode/mcp.json` |

**Required env vars per server:**

| Server | Required env var |
|--------|-----------------|
| GitHub | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| Supabase | `SUPABASE_ACCESS_TOKEN` |
| PostgreSQL | `POSTGRES_CONNECTION_STRING` |
| Firebase | `GOOGLE_APPLICATION_CREDENTIALS` |
| Brave Search | `BRAVE_API_KEY` |
| Filesystem | none — pass `.` as the directory arg |

For `filesystem`, use the args array to pass the working directory:
```json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
}
```

---

## Step 4 — If Config Already Exists

Read the existing file first. Then:
- Add new servers that aren't already present
- Do not modify or remove existing entries
- If a server is already configured, skip it
- Note any servers you skipped and why

---

## Constraints

**Only include servers with evidence.** Don't add PostgreSQL config because "most projects use a database." Add it because you saw `pg` or `prisma` in the manifest.

**Never write actual secrets.** Use `YOUR_VALUE_HERE` or `YOUR_TOKEN_HERE` as placeholders — never infer or generate real values.

**Don't add comments inside JSON.** MCP config files are parsed as JSON. Use the output section below to explain what needs to be filled in.

**Generate only for detected tools.** If only `CLAUDE.md` exists, generate only `.mcp.json`. Don't generate configs for tools that aren't in use.

---

## Output

For each file to create or update, output:

```
## File: [path]
```
followed by the file content as a JSON code block.

After all files, output a **Setup checklist** listing:
- Each env var that needs a real value and where to get it
- Any servers that were not included and why (so the developer can add them manually if needed)
- A note to add MCP config file paths to `.gitignore` if they contain secrets

Do not preface with explanation. Start directly with the first file.
