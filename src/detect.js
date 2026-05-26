'use strict';

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

function countFilesIn(dir) {
  let count = 0;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        count += countFilesIn(join(dir, entry.name));
      } else if (entry.isFile()) {
        count++;
      }
    }
  } catch { }
  return count;
}

const AGENT_DIRS = ['agents', '.cursor/commands', '.github/agents'];

function detect(cwd) {
  const agentsExist = AGENT_DIRS.some(d => existsSync(join(cwd, d)));

  const srcDir = ['lib', 'src', 'app'].find(d =>
    existsSync(join(cwd, d))
  );

  const sourceFileCount = srcDir ? countFilesIn(join(cwd, srcDir)) : 0;
  const maturity =
    sourceFileCount === 0 ? 'empty' :
      sourceFileCount < 40 ? 'early' : 'active';

  return { agentsExist, maturity };
}

export { detect };
