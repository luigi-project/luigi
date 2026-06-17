// Copy /blog/*.md (canonical blog source at the repo root) into src/blog/
// before each build. The .md files in src/blog/ are gitignored build artifacts;
// the directory data file (src/blog/blog.11tydata.cjs) is the only committed
// source there. Decoupling the build location from the canonical source keeps
// the legacy author workflow ("drop a .md into /blog/ and run build") intact.
//
// Run automatically as part of `npm run build` via the `prebuild` lifecycle.

import { readdirSync, mkdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Walk upward from this script's directory until we find a sibling `blog/`
// directory whose contents look like blog posts (YYYY-MM-DD-*.md). This
// works whether this script lives at landingpage-11ty/scripts/copy-blog.js
// (during the migration) or landingpage/dev/scripts/copy-blog.js (after).
function findRepoBlogDir() {
  let current = __dirname;
  while (true) {
    const candidate = join(current, 'blog');
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      const entries = readdirSync(candidate);
      if (entries.some((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))) {
        return candidate;
      }
    }
    const parent = dirname(current);
    if (parent === current) break; // reached filesystem root
    current = parent;
  }
  return null;
}

const SRC = findRepoBlogDir();
const DEST = resolve(__dirname, '..', 'src', 'blog');

if (!SRC) {
  console.error('copy-blog: could not find /blog/ directory in any ancestor of', __dirname);
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

const posts = readdirSync(SRC).filter((f) => f.endsWith('.md'));
for (const f of posts) {
  copyFileSync(join(SRC, f), join(DEST, f));
}

console.log(`copy-blog: copied ${posts.length} blog post${posts.length === 1 ? '' : 's'} from ${SRC} to ${DEST}`);

