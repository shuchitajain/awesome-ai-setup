#!/usr/bin/env node
'use strict';

import { existsSync } from 'fs';
import { join } from 'path';
import prompts from 'prompts';
import { detect } from '../src/detect.js';
import { install } from '../src/install.js';
import { printSummary } from '../src/output.js';

const PROJECT_MARKERS = ['package.json', 'pubspec.yaml', 'Cargo.toml', 'go.mod', '.git'];

const EXAMPLES = [
  { title: 'Flutter + Riverpod + Clean Architecture', value: 'flutter', tag: 'Flutter' },
  { title: 'Node.js REST API (Express + TypeScript + Prisma)', value: 'nodejs', tag: 'Node.js' },
];

const MCP_LABEL = {
  'claude-code': '.mcp.json',
  'cursor': '.cursor/mcp.json',
  'copilot': '.vscode/mcp.json',
};

async function main() {
  console.log('\nawesome-ai-setup\n');

  const cwd = process.cwd();

  // Guard: warn if run outside a recognisable project directory
  const isProjectRoot = PROJECT_MARKERS.some(m => existsSync(join(cwd, m)));
  if (!isProjectRoot) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `No project files found in ${cwd}. Proceed anyway?`,
      initial: false,
    });
    if (proceed === undefined || !proceed) process.exit(0);
  }

  const state = detect(cwd);

  // Handle existing agents/ folder
  if (state.agentsExist) {
    const { update } = await prompts({
      type: 'confirm',
      name: 'update',
      message: 'Agent files already exist. Refresh them to the latest version? (ignore files and MCP configs will not be changed)',
      initial: false,
    });
    if (update === undefined) process.exit(0);
    if (!update) {
      console.log('\nNo changes made.\n');
      return;
    }
  }

  // Which AI tools?
  const { tools } = await prompts({
    type: 'multiselect',
    name: 'tools',
    message: 'Which AI coding tools do you use?',
    choices: [
      { title: 'GitHub Copilot', value: 'copilot', selected: true },
      { title: 'Claude Code', value: 'claude-code', selected: false },
      { title: 'Cursor', value: 'cursor', selected: false },
    ],
    min: 1,
    hint: '— Space to select, Enter to confirm',
  });
  if (!tools) process.exit(0);

  // What else to set up — choices built dynamically from selected tools
  const mcpLabels = tools.map(t => MCP_LABEL[t]).filter(Boolean).join(', ');

  const extraChoices = [
    {
      title: `MCP config stubs  (${mcpLabels})`,
      value: 'mcp',
      selected: false,
      description: 'Starter MCP server config — edit to add your tokens and stack-specific servers',
    },
  ];

  if (state.maturity !== 'empty') {
    EXAMPLES.forEach(p => {
      extraChoices.push({
        title: `${p.tag} reference example`,
        value: `example:${p.value}`,
        selected: false,
        description: `Copied to .ai/reference/${p.value}/ — AI agents use it as a structural guide when generating your context files`,
      });
    });
  }

  const { extras } = await prompts({
    type: 'multiselect',
    name: 'extras',
    message: 'What else would you like to set up?',
    choices: extraChoices,
    hint: '— Space to select, Enter to confirm',
  });
  if (extras === undefined) process.exit(0);

  const exampleChoice = extras.find(e => e.startsWith('example:'));
  const example = exampleChoice ? exampleChoice.replace('example:', '') : null;

  const result = await install(cwd, {
    tools,
    example,
    ignoreFiles: true,
    mcpStubs: extras.includes('mcp'),
  });

  printSummary(result, tools);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
