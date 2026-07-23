#!/usr/bin/env node
/*
 * easy-audit-fixes.js — Luigi monorepo dependency audit sweeper.
 *
 * Walks every directory that has both package.json and package-lock.json
 * (excluding node_modules), runs `npm audit fix` (never `--force`) to apply
 * only the SemVer-safe portion of dependency security fixes, then prints a
 * summary of before/after vulnerability counts, files changed, and findings
 * still open.
 *
 *
 * Usage:
 *   node scripts/easy-audit-fixes.js            # interactive confirm
 *   node scripts/easy-audit-fixes.js --yes      # skip confirmation
 *   node scripts/easy-audit-fixes.js --dry-run  # list only, no mutation
 *
 * Never uses --force. Never runs git commit.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const AUTO_YES = args.has('--yes') || args.has('-y');
const DRY_RUN = args.has('--dry-run');

// ---------- 1. Package list -----------------------------------------------

// Hardcoded set of Luigi packages to audit. Matches the scope defined in
// the `easy-audit-fixes` skill. Order matters: root last so per-package
// fixes settle before any root-level lockfile rewrite.
const PACKAGES = [
  'core',
  'core-modular',
  'client',
  'container',
  'plugins',
  'scripts',
  'core/examples/luigi-example-angular',
  'client-frameworks-support/client-support-angular',
  'client-frameworks-support/client-support-ui5',
  'client-frameworks-support/testing-utilities',
  'client-frameworks-support/testing-utilities/test',
  'website/docs',
  'website/fiddle',
  'website/landingpage/dev',
  'test/e2e-test-application',
  'test/e2e-test-application/externalMf',
  'test/e2e-js-test-application',
  'test/e2e-client-api-test-app',
  '.'
];

function resolvePackages(root) {
  const found = [];
  const missing = [];
  for (const rel of PACKAGES) {
    const abs = path.join(root, rel);
    const pj = path.join(abs, 'package.json');
    const lock = path.join(abs, 'package-lock.json');
    if (fs.existsSync(pj) && fs.existsSync(lock)) {
      found.push(rel);
    } else {
      missing.push(rel);
    }
  }
  return { found, missing };
}

// ---------- Helpers --------------------------------------------------------

function runNpmAuditJson(dir) {
  const res = spawnSync('npm', ['audit', '--json'], {
    cwd: path.join(ROOT, dir),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 32 * 1024 * 1024
  });
  // npm audit exits non-zero when findings exist — that's expected.
  try {
    const j = JSON.parse(res.stdout || '{}');
    const v = (j.metadata && j.metadata.vulnerabilities) || {};
    const packages = j.vulnerabilities ? Object.keys(j.vulnerabilities) : [];
    return {
      critical: v.critical || 0,
      high: v.high || 0,
      moderate: v.moderate || 0,
      low: v.low || 0,
      info: v.info || 0,
      packages
    };
  } catch {
    return { critical: 0, high: 0, moderate: 0, low: 0, info: 0, packages: [], error: 'parse-failed' };
  }
}

function runAuditFix(dir) {
  const logPath = path.join(os.tmpdir(), `audit-fix-${dir.replace(/[^\w.-]+/g, '_')}.log`);
  const res = spawnSync('npm', ['audit', 'fix', '--no-audit', '--no-fund'], {
    cwd: path.join(ROOT, dir),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 32 * 1024 * 1024
  });
  const output = (res.stdout || '') + (res.stderr || '');
  try {
    fs.writeFileSync(logPath, output);
  } catch { /* ignore */ }

  const summary = [];
  for (const line of output.split(/\r?\n/)) {
    if (/^(changed|added|removed|up to date|found|fixed)\b/i.test(line)) summary.push(line.trim());
    if (/vulnerabilit(y|ies)/i.test(line)) summary.push(line.trim());
  }
  return {
    ok: res.status === 0 || res.status === 1, // 1 is common if some issues remain
    status: res.status,
    logPath,
    summary: summary.slice(0, 6),
    stderrHead: (res.stderr || '').split(/\r?\n/).slice(0, 5).join('\n')
  };
}

function gitStatusFor(dir) {
  const res = spawnSync(
    'git',
    ['-C', ROOT, 'status', '--porcelain', '--', `${dir}/package.json`, `${dir}/package-lock.json`],
    { encoding: 'utf8', shell: process.platform === 'win32' }
  );
  return (res.stdout || '').split(/\r?\n/).filter(Boolean);
}

function fmtCounts(c) {
  return `${c.critical} / ${c.high} / ${c.moderate} / ${c.low}`;
}

function delta(before, after) {
  const diffs = [];
  for (const k of ['critical', 'high', 'moderate', 'low']) {
    const d = (after[k] || 0) - (before[k] || 0);
    if (d !== 0) diffs.push(`${d > 0 ? '+' : ''}${d} ${k}`);
  }
  if (diffs.length === 0) {
    const stillOpen = (after.critical || 0) + (after.high || 0) + (after.moderate || 0) + (after.low || 0);
    return stillOpen > 0 ? 'no change — needs manual bump' : 'clean';
  }
  return diffs.join(', ');
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

// ---------- Main -----------------------------------------------------------

async function main() {
  console.log(`\n=== easy-audit-fixes — Luigi monorepo ===`);
  console.log(`Repo root: ${ROOT}\n`);

  const { found: dirs, missing } = resolvePackages(ROOT);
  if (dirs.length === 0) {
    console.log('None of the hardcoded packages have both package.json and package-lock.json.');
    process.exit(0);
  }

  console.log(`Directories to process (${dirs.length}):`);
  for (const d of dirs) console.log(`  - ${d}`);
  if (missing.length) {
    console.log(`\nSkipped (missing package.json or package-lock.json):`);
    for (const d of missing) console.log(`  - ${d}`);
  }
  console.log('');
  console.log('This runs `npm audit fix` (no --force) in each directory.');
  console.log('It will modify package-lock.json (and possibly package.json) for in-range patches.');
  console.log('node_modules symlinks set up by bootstrap.js may be replaced by real installs —');
  console.log('run `npm run symbolink` from the root afterwards to restore them.');
  console.log('');

  if (DRY_RUN) {
    console.log('--dry-run: exiting without changes.');
    process.exit(0);
  }

  if (!AUTO_YES) {
    const ans = (await prompt('Proceed? [y/N] ')).trim().toLowerCase();
    if (ans !== 'y' && ans !== 'yes') {
      console.log('Aborted.');
      process.exit(0);
    }
  }

  // Step 3: snapshot before
  console.log('\nSnapshotting current vulnerabilities...');
  const before = {};
  for (const d of dirs) {
    process.stdout.write(`  ${d} ... `);
    before[d] = runNpmAuditJson(d);
    console.log(fmtCounts(before[d]));
  }

  // Step 4: run audit fix sequentially
  console.log('\nRunning `npm audit fix` sequentially...');
  const fixResults = {};
  for (const d of dirs) {
    process.stdout.write(`  ${d} ... `);
    fixResults[d] = runAuditFix(d);
    const s = fixResults[d].summary.length > 0 ? fixResults[d].summary[0] : `exit ${fixResults[d].status}`;
    console.log(s);
  }

  // Step 5: snapshot after
  console.log('\nSnapshotting post-fix vulnerabilities...');
  const after = {};
  for (const d of dirs) {
    process.stdout.write(`  ${d} ... `);
    after[d] = runNpmAuditJson(d);
    console.log(fmtCounts(after[d]));
  }

  // Step 6: detect file changes
  const changed = {};
  const allChanges = [];
  for (const d of dirs) {
    const lines = gitStatusFor(d);
    if (lines.length) {
      changed[d] = lines;
      allChanges.push(...lines);
    }
  }

  // Step 7: restore symlinks if anything was processed
  const anyProcessed = Object.values(fixResults).some((r) => r.ok);
  if (anyProcessed) {
    console.log('\nRestoring symlinks (`npm run symbolink`)...');
    const res = spawnSync('npm', ['run', 'symbolink'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    if (res.status !== 0) {
      console.log(`  symbolink exited with ${res.status} — restore manually if needed.`);
    }
  }

  // Step 8: report
  console.log('\n\n=== Report ===\n');

  console.log('## Before / after vulnerability counts (C / H / M / L)\n');
  console.log('| Directory | Before | After | Δ |');
  console.log('|-----------|--------|-------|---|');
  for (const d of dirs) {
    const b = before[d];
    const a = after[d];
    const totalBefore = b.critical + b.high + b.moderate + b.low;
    const totalAfter = a.critical + a.high + a.moderate + a.low;
    if (totalBefore === 0 && totalAfter === 0) continue;
    console.log(`| \`./${d}\` | ${fmtCounts(b)} | ${fmtCounts(a)} | ${delta(b, a)} |`);
  }

  console.log('\n## Files modified\n');
  if (allChanges.length === 0) {
    console.log('_(none)_');
  } else {
    console.log('```');
    for (const line of allChanges) console.log(line);
    console.log('```');
  }

  console.log('\n## Findings still open\n');
  const stillOpen = dirs.filter((d) => (after[d].critical || 0) + (after[d].high || 0) > 0);
  if (stillOpen.length === 0) {
    console.log('_No remaining critical/high findings._');
  } else {
    for (const d of stillOpen) {
      const a = after[d];
      const pkgs = a.packages.slice(0, 8).join(', ') + (a.packages.length > 8 ? `, +${a.packages.length - 8} more` : '');
      console.log(`- \`./${d}\` — ${a.critical} critical, ${a.high} high — packages: ${pkgs || '(unknown)'}`);
    }
    console.log('\nThese require a manual major bump or a `--force` review and were intentionally NOT fixed by this script.');
  }

  console.log('\nDone. (No git commit was performed.)');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
