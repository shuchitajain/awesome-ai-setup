#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const { detect } = require('../src/detect');
const { install } = require('../src/install');
const { printSummary } = require('../src/output');

const PROJECT_MARKERS = ['package.json', 'pubspec.yaml', 'Cargo.toml', 'go.mod', '.git'];

const PRESETS = [
  { title: 'Flutter + Riverpod + Clean Architecture', value: 'flutter-riverpod-clean-architecture' },
];

// Human-readable ignore file names per tool, for the prompt label
const IGNORE_LABEL = {
  'claude-code': '.claudeignore',
  'cursor': '.cursorignore',
  'copilot': '.copilotignore',
};

const MCP_LABEL = {
  'claude-code': '.mcp.json',
  'cursor': '.cursor/mcp.json',
  'copilot': '.vscode/mcp.json',
};

async function main() {
  console.log('\nawesome-ai-setup\n');

  const cwd = process.cwd();

  // Guard: warn if run outside a recognisable project directory
  const isProjectRoot = PROJECT_MARKERS.some(m => fs.existsSync(path.join(cwd, m)));
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
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: 'agents/ already exists. Overwrite?',
      initial: false,
    });
    if (overwrite === undefined) process.exit(0);
    if (!overwrite) {
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
      { title: 'Claude Code', value: 'claude-code', selected: true },
      { title: 'Cursor', value: 'cursor' },
      { title: 'GitHub Copilot', value: 'copilot' },
    ],
    min: 1,
    hint: '— Space to select, Enter to confirm',
  });
  if (!tools) process.exit(0);

  // What else to set up — choices built dynamically from selected tools
  const ignoreLabels = tools.map(t => IGNORE_LABEL[t]).filter(Boolean).join(', ');
  const mcpLabels = tools.map(t => MCP_LABEL[t]).filter(Boolean).join(', ');

  const extraChoices = [
    {
      title: `Ignore files  (${ignoreLabels})`,
      value: 'ignore',
      selected: true,
      description: 'Exclude secrets, build artifacts, and generated files from AI context',
    },
    {
      title: `MCP config stubs  (${mcpLabels})`,
      value: 'mcp',
      selected: false,
      description: 'Starter MCP server config — edit to add your tokens and stack-specific servers',
    },
  ];

  if (state.maturity !== 'empty') {
    extraChoices.push({
      title: 'Stack preset reference',
      value: 'preset',
      selected: false,
      description: 'Copy a reference example showing what high-quality agent output looks like',
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

  // Preset selection (only if user selected it above)
  let preset = null;
  if (extras.includes('preset')) {
    const { selected } = await prompts({
      type: 'select',
      name: 'selected',
      message: 'Which preset?',
      choices: PRESETS,
    });
    if (selected === undefined) process.exit(0);
    preset = selected;
  }

  const result = await install(cwd, {
    tools,
    preset,
    ignoreFiles: extras.includes('ignore'),
    mcpStubs: extras.includes('mcp'),
  });

  printSummary(result, tools);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
