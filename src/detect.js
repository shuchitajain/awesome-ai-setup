'use strict';

const fs = require('fs');
const path = require('path');

function countFilesIn(dir) {
  let count = 0;
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        count += countFilesIn(path.join(dir, entry.name));
      } else if (entry.isFile()) {
        count++;
      }
    }
  } catch {}
  return count;
}

function detect(cwd) {
  const agentsExist = fs.existsSync(path.join(cwd, 'agents'));

  const srcDir = ['lib', 'src', 'app'].find(d =>
    fs.existsSync(path.join(cwd, d))
  );

  const sourceFileCount = srcDir ? countFilesIn(path.join(cwd, srcDir)) : 0;
  const maturity =
    sourceFileCount === 0 ? 'empty' :
    sourceFileCount < 40  ? 'early' : 'active';

  return { agentsExist, maturity };
}

module.exports = { detect };
