# Contributing

## What's welcome

**New agents** - if you've built an agent that generates a useful context file and it works across at least two AI tools (Claude Code, Cursor, Copilot), it belongs here. Follow the existing agent format: YAML frontmatter with `name`, `version`, and `description`, then clear step-by-step instructions, a "Do NOT" section, and an output template.

**Example improvements** - corrections to the Flutter or Node.js examples (outdated package versions, wrong patterns, missing layers), or new examples for other stacks (Next.js, Django, Rails, etc.). An example needs: `ARCHITECTURE.md`, `CONTEXT.md`, `MEMORY.md`, `README.md`, at least one workflow, and a scoped instructions example.

**Doc fixes** - typos, broken links, stale version numbers in `docs/`.

## What's out of scope

**CLI feature expansion** - the CLI does one thing: copies agents and writes ignore/MCP stubs. PRs that add flags, subcommands, config files, or telemetry will be declined. Keep it simple.

**Tool-specific syntax** - agents must stay tool-agnostic (plain markdown). Don't add Cursor-specific `@`-references or Copilot `#file:` syntax into agent instructions.

**AI model recommendations** - the repo takes no position on which model to use. Don't add model comparisons or "best for X" claims.

## How to test

**Agents** - copy the agent into a real project, run it in your AI tool, and include the generated output (or a trimmed excerpt) in the PR description. Show that `<!-- TODO: verify -->` markers appear where appropriate.

**CLI changes** - run `node bin/cli.js` from a fresh temp directory and verify the install summary lists what you expect:

```bash
mkdir /tmp/test-pr && cd /tmp/test-pr
node /path/to/awesome-ai-setup/bin/cli.js
ls agents/
```

**Examples** - open the generated files as a new user of that stack. If you'd need to make significant edits before using them, they're not ready.

## Submitting

Open a PR with a short description of what changed and why. For new agents or examples, include one example of the generated output.
