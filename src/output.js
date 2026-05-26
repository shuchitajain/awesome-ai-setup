'use strict';

const TOOL_COMMANDS = {
  'claude-code': {
    name: 'Claude Code',
    command: 'Read agents/diagnose-and-setup.md and execute it on this repository.',
  },
  'cursor': {
    name: 'Cursor',
    command: '@.cursor/commands/diagnose-and-setup.md — execute this on the current codebase',
  },
  'copilot': {
    name: 'GitHub Copilot',
    command: 'Open Copilot Chat → agent picker → select "diagnose-and-setup" → send: execute the diagnostic on this codebase',
  },
};

function printSummary({ installed }, tools) {
  console.log('\nInstalled:\n');
  for (const item of installed) {
    console.log(`  ✓  ${item.label}  (${item.detail})`);
  }

  console.log('\n\nNext: run the diagnostic in your AI tool\n');

  for (const toolKey of tools) {
    const tool = TOOL_COMMANDS[toolKey];
    if (!tool) continue;
    console.log(`  ${tool.name}`);
    console.log(`  ${tool.command}`);
    console.log();
  }

  console.log('The diagnostic checks your current AI setup level and tells you which agents to run next.\n');
}

export { printSummary };
