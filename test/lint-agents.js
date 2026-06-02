/**
 * Automated lint / integrity checks for awesome-ai-setup.
 *
 * Run: npm test
 * Requires Node >= 18 (uses node:test built-in).
 *
 * Checks:
 *   1. All agent files have valid YAML frontmatter (name, version, description).
 *   2. Every agent's frontmatter `name` is referenced in agents/README.md.
 *   3. examples/flutter and examples/nodejs have identical relative file structures.
 *   4. AGENTS_DEST keys in install.js match the tool values in cli.js.
 *   5. IGNORE_FILE and MCP_CONFIG_PATH keys in install.js match the same tool set.
 *   6. detect() classifies maturity thresholds correctly (empty / early / active).
 *   7. detect() finds existing agents across all three supported directories.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AGENTS_DIR = join(ROOT, 'agents');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const fm = {};
    for (const line of match[1].split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        if (key) fm[key] = value;
    }
    return fm;
}

function agentFiles() {
    return readdirSync(AGENTS_DIR)
        .filter(f => f.endsWith('.md') && f !== 'README.md')
        .sort();
}

function listRelative(dir, base) {
    base = base ?? dir;
    const results = [];
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const rel = join(dir, entry.name).slice(base.length + 1);
        if (entry.isDirectory()) {
            results.push(...listRelative(join(dir, entry.name), base));
        } else {
            results.push(rel);
        }
    }
    return results;
}

function makeTmp() {
    return mkdtempSync(join(tmpdir(), 'awesome-test-'));
}

function cleanup(dir) {
    rmSync(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// 1. Frontmatter validity
// ---------------------------------------------------------------------------

test('all agent files have valid frontmatter with required fields', () => {
    for (const file of agentFiles()) {
        const content = readFileSync(join(AGENTS_DIR, file), 'utf8');
        const fm = parseFrontmatter(content);

        assert.ok(fm, `${file}: missing YAML frontmatter block`);
        assert.ok(fm.name, `${file}: frontmatter missing "name"`);
        assert.ok(fm.version, `${file}: frontmatter missing "version"`);
        assert.ok(fm.description, `${file}: frontmatter missing "description"`);
        assert.match(fm.version, /^\d+\.\d+\.\d+$/, `${file}: version "${fm.version}" is not valid semver`);
        // name must be kebab-case slug (no spaces, no uppercase)
        assert.match(fm.name, /^[a-z0-9-]+$/, `${file}: name "${fm.name}" must be kebab-case`);
    }
});

// ---------------------------------------------------------------------------
// 2. Agent name sync — agents/README.md
// ---------------------------------------------------------------------------

test('every agent name is referenced in agents/README.md', () => {
    const readme = readFileSync(join(AGENTS_DIR, 'README.md'), 'utf8');

    for (const file of agentFiles()) {
        const content = readFileSync(join(AGENTS_DIR, file), 'utf8');
        const fm = parseFrontmatter(content);
        assert.ok(fm?.name, `${file}: no name to check`);

        const referenced =
            readme.includes(`\`${fm.name}\``) ||
            readme.includes(`/${fm.name}`) ||
            readme.includes(`${fm.name}.md`);

        assert.ok(referenced, `${file}: agent name "${fm.name}" not referenced in agents/README.md`);
    }
});

// ---------------------------------------------------------------------------
// 3. Example parity — flutter/ and nodejs/ must have matching core structure:
//    same root-level .md files and identical workflows/ entries.
//    Stack-specific .github/ scoped instructions are intentionally different.
// ---------------------------------------------------------------------------

function coreExampleFiles(exampleDir) {
    const results = [];
    // Root-level .md files
    for (const entry of readdirSync(exampleDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (entry.isFile() && entry.name.endsWith('.md')) results.push(entry.name);
    }
    // workflows/ entries
    const workflowsDir = join(exampleDir, 'workflows');
    try {
        for (const entry of readdirSync(workflowsDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            if (entry.isFile()) results.push(`workflows/${entry.name}`);
        }
    } catch { /* workflows/ is optional */ }
    return results;
}

test('examples/flutter and examples/nodejs have matching core file structures', () => {
    const flutterFiles = coreExampleFiles(join(ROOT, 'examples', 'flutter'));
    const nodejsFiles = coreExampleFiles(join(ROOT, 'examples', 'nodejs'));

    assert.deepEqual(
        flutterFiles,
        nodejsFiles,
        `Core file structure mismatch between examples/flutter and examples/nodejs.\n` +
        `flutter: ${JSON.stringify(flutterFiles)}\n` +
        `nodejs:  ${JSON.stringify(nodejsFiles)}`
    );
});

// ---------------------------------------------------------------------------
// 4. install.js constant key alignment with cli.js tool values
// ---------------------------------------------------------------------------

test('AGENTS_DEST / IGNORE_FILE / MCP_CONFIG_PATH keys match tool values in cli.js', () => {
    const installSrc = readFileSync(join(ROOT, 'src', 'install.js'), 'utf8');
    const cliSrc = readFileSync(join(ROOT, 'bin', 'cli.js'), 'utf8');

    // Extract example stack values to use as an exclusion list
    const examplesBlock = cliSrc.match(/const EXAMPLES\s*=\s*\[[\s\S]*?\];/)?.[0] ?? '';
    const exampleValues = [...examplesBlock.matchAll(/value:\s*'([^']+)'/g)].map(m => m[1]);

    // Extract tool values from the multiselect choices block in cli.js.
    // Exclude example stack values, and other non-tool choice values.
    const NON_TOOL_VALUES = new Set(['ignore', 'mcp', ...exampleValues]);
    const toolValues = [...cliSrc.matchAll(/value:\s*'([^']+)'/g)]
        .map(m => m[1])
        .filter(v => !v.startsWith('example:') && !NON_TOOL_VALUES.has(v));

    // Deduplicate
    const cliTools = [...new Set(toolValues)];

    function extractKeys(src, constName) {
        const match = src.match(new RegExp(`const ${constName}\\s*=\\s*\\{([\\s\\S]*?)\\};`));
        assert.ok(match, `${constName} not found in install.js`);
        return [...match[1].matchAll(/'([^']+)':/g)].map(m => m[1]);
    }

    for (const constName of ['AGENTS_DEST', 'IGNORE_FILE', 'MCP_CONFIG_PATH']) {
        const keys = extractKeys(installSrc, constName);
        for (const tool of cliTools) {
            assert.ok(keys.includes(tool), `Tool "${tool}" from cli.js is missing from ${constName} in install.js`);
        }
        for (const key of keys) {
            assert.ok(cliTools.includes(key), `${constName} key "${key}" in install.js has no matching tool choice in cli.js`);
        }
    }
});

// ---------------------------------------------------------------------------
// 5. detect() — maturity threshold classification
// ---------------------------------------------------------------------------

test('detect() classifies maturity: empty / early / active', async () => {
    const { detect } = await import('../src/detect.js');

    // empty: no src dir at all
    const emptyDir = makeTmp();
    assert.equal(detect(emptyDir).maturity, 'empty', 'no src dir should be "empty"');
    cleanup(emptyDir);

    // early: src/ exists with a single file
    const earlyDir = makeTmp();
    mkdirSync(join(earlyDir, 'src'));
    writeFileSync(join(earlyDir, 'src', 'index.js'), '');
    assert.equal(detect(earlyDir).maturity, 'early', '1-file src/ should be "early"');
    cleanup(earlyDir);

    // boundary: 39 files → early
    const earlyBoundaryDir = makeTmp();
    mkdirSync(join(earlyBoundaryDir, 'src'));
    for (let i = 0; i < 39; i++) writeFileSync(join(earlyBoundaryDir, 'src', `f${i}.js`), '');
    assert.equal(detect(earlyBoundaryDir).maturity, 'early', '39-file src/ should be "early"');
    cleanup(earlyBoundaryDir);

    // boundary: 40 files → active
    const activeDir = makeTmp();
    mkdirSync(join(activeDir, 'src'));
    for (let i = 0; i < 40; i++) writeFileSync(join(activeDir, 'src', `f${i}.js`), '');
    assert.equal(detect(activeDir).maturity, 'active', '40-file src/ should be "active"');
    cleanup(activeDir);
});

// ---------------------------------------------------------------------------
// 6. detect() — agentsExist across all supported directories
// ---------------------------------------------------------------------------

test('detect() finds agents in agents/, .cursor/skills/, and .github/agents/', async () => {
    const { detect } = await import('../src/detect.js');

    const agentDirs = ['agents', '.cursor/skills', '.github/agents'];

    for (const agentDir of agentDirs) {
        const tmp = makeTmp();
        mkdirSync(join(tmp, agentDir), { recursive: true });
        assert.equal(detect(tmp).agentsExist, true, `Should detect agents in ${agentDir}/`);
        cleanup(tmp);
    }

    // No agent dir → false
    const tmp = makeTmp();
    assert.equal(detect(tmp).agentsExist, false, 'Should return false when no agent dir exists');
    cleanup(tmp);
});
