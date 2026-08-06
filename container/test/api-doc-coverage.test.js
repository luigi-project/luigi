/**
 * Assert that every method declared in a container typings file (.d.ts)
 * appears as a documented section in the corresponding generated API doc.
 *
 * Background: jsdoc-to-markdown silently drops doclets when the source
 * has certain parser-confusing shapes (e.g. `void {}` instead of `void {};`
 * on empty method bodies). The generated .md then omits methods without
 * any error signal — CI, doc-check, and `npm run docu:container` all pass,
 * and the regression only surfaces when someone reads the docs.
 * See PR #5401 / #5402 for a real instance where six container methods
 * disappeared from the generated docs after a formatter reflow.
 *
 * This test is a defense against that class of failure. It reads each
 * container .d.ts, extracts every method-style declaration (attribute-style
 * property declarations like `viewurl: string;` don't match), then verifies
 * each one has a `### name` heading in the generated .md. Deprecated methods
 * (headed as `### ~~name~~`) count as present.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * Extract top-level method names from a .d.ts class body.
 *
 * Matches `  methodName(...): ReturnType {...}` — the trailing `{` is what
 * distinguishes methods (with a stub body) from attribute-style property
 * declarations like `viewurl: string;`. Two-space indent matches the class
 * body indent used consistently in the container typings.
 */
function extractMethodNames(typingsSource) {
  const methodRegex = /^ {2}(\w+)\s*\([^)]*\)\s*:\s*[^{;]+\{/gm;
  const names = new Set();
  let match;
  while ((match = methodRegex.exec(typingsSource)) !== null) {
    if (match[1] === 'constructor') continue;
    names.add(match[1]);
  }
  return names;
}

/**
 * Extract every `### name` heading (including `### ~~name~~` deprecated ones)
 * from a generated API .md.
 */
function extractDocumentedHeadings(mdSource) {
  const headingRegex = /^### (?:~~)?(\w+)(?:~~)?(?:&nbsp;)?\s*$/gm;
  const names = new Set();
  let match;
  while ((match = headingRegex.exec(mdSource)) !== null) {
    names.add(match[1]);
  }
  return names;
}

const cases = [
  {
    label: 'LuigiContainer',
    typings: 'container/typings/LuigiContainer.svelte.d.ts',
    md: 'docs/luigi-container-api.md'
  },
  {
    label: 'LuigiCompoundContainer',
    typings: 'container/typings/LuigiCompoundContainer.svelte.d.ts',
    md: 'docs/luigi-compound-container-api.md'
  }
];

describe('API doc coverage', () => {
  cases.forEach(({ label, typings, md }) => {
    test(`every method declared in ${label} typings is documented in the generated .md`, () => {
      const typingsSource = fs.readFileSync(path.join(REPO_ROOT, typings), 'utf8');
      const mdSource = fs.readFileSync(path.join(REPO_ROOT, md), 'utf8');

      const methods = extractMethodNames(typingsSource);
      const documented = extractDocumentedHeadings(mdSource);

      const missing = [...methods].filter(name => !documented.has(name));

      // Guard against a regex that matches nothing — if extractMethodNames
      // ever silently returns an empty set, the assertion below would pass
      // vacuously.
      expect(methods.size).toBeGreaterThan(0);

      if (missing.length > 0) {
        // Custom message on failure — Jest's default `expect([...]).toEqual([])`
        // output for arrays of names is fine, but a hint about the likely
        // cause saves the next debugger a lot of time.
        const hint =
          `\n\nMethods declared in ${typings} are missing from ${md}:\n` +
          missing.map(n => `  - ${n}`).join('\n') +
          '\n\nThis usually indicates that jsdoc-to-markdown silently dropped ' +
          'doclets during doc generation. Common causes:\n' +
          '  - Empty method bodies changed from `void {};` to `void {}`\n' +
          '    (a formatter or manual cleanup may have stripped the `;`).\n' +
          '  - Malformed JSDoc block above one of the affected methods.\n' +
          '\nRegenerate the docs with `npm run docu:container` from the ' +
          '`scripts/` folder and inspect the diff.\n';
        throw new Error(hint);
      }
    });
  });
});
