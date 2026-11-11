#!/usr/bin/env node
/*
 * check-pinned.js — verify all direct dependencies in the Luigi monorepo
 * are pinned to exact versions (no ^, ~, >= ranges), except @luigi-project/*.
 *
 * Scans every git-tracked `package.json` that has a sibling git-tracked
 * `package-lock.json` (excluding anything under node_modules). Reads each
 * package.json's `dependencies` and `devDependencies` and flags any version
 * that starts with ^, ~, >=, >, <=, <, contains ||, or is `*` / `latest`.
 *
 * Exceptions (never flagged):
 *   - @luigi-project/* packages — intentionally use ^ ranges
 *   - versions starting with `file:` or containing `://` — local/linked
 *
 * Read-only. Exits 0 if clean, 1 if violations found.
 *
 * Static-script port of the `check-pinned` Claude Code skill.
 *
 * Usage:
 *   node scripts/check-pinned.js         # human-readable table
 *   node scripts/check-pinned.js --json  # machine-readable output
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const AS_JSON = args.has('--json');

// ---------- 1. Collect tracked files via git ------------------------------

function gitLsFiles() {
  const res = spawnSync('git', ['ls-files', '*package.json', '*package-lock.json'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 32 * 1024 * 1024
  });
  if (res.status !== 0) {
    console.error('git ls-files failed:', res.stderr);
    process.exit(2);
  }
  return (res.stdout || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/'));
}

// ---------- 2. Find dirs with both tracked files --------------------------

function findPackageDirs(tracked) {
  const byDir = new Map(); // dir -> { pj: bool, lock: bool }
  for (const f of tracked) {
    if (f.includes('/node_modules/') || f.startsWith('node_modules/')) continue;
    const base = path.posix.basename(f);
    const dir = path.posix.dirname(f) || '.';
    if (!byDir.has(dir)) byDir.set(dir, { pj: false, lock: false });
    const entry = byDir.get(dir);
    if (base === 'package.json') entry.pj = true;
    if (base === 'package-lock.json') entry.lock = true;
  }
  const dirs = [];
  for (const [dir, { pj, lock }] of byDir) {
    if (pj && lock) dirs.push(dir);
  }
  dirs.sort();
  return dirs;
}

// ---------- 3. Flag unpinned versions -------------------------------------

const UNPINNED_RE = /^(?:\s*[\^~]|\s*>=?|\s*<=?)/;

function isUnpinned(version) {
  if (typeof version !== 'string') return false;
  const v = version.trim();
  if (v === '*' || v.toLowerCase() === 'latest') return true;
  if (v.includes('||')) return true;
  if (UNPINNED_RE.test(v)) return true;
  return false;
}

function isExempt(name, version) {
  if (name.startsWith('@luigi-project/')) return true;
  if (typeof version === 'string') {
    const v = version.trim();
    if (v.startsWith('file:')) return true;
    if (v.includes('://')) return true;
  }
  return false;
}

function checkPackageJson(dir) {
  const abs = path.join(ROOT, dir, 'package.json');
  let json;
  try {
    json = JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (err) {
    return [{ directory: dir, dependency: '(parse error)', version: err.message }];
  }
  const violations = [];
  for (const bucket of ['dependencies', 'devDependencies']) {
    const deps = json[bucket];
    if (!deps || typeof deps !== 'object') continue;
    for (const [name, version] of Object.entries(deps)) {
      if (isExempt(name, version)) continue;
      if (isUnpinned(version)) {
        violations.push({ directory: dir, dependency: name, version, bucket });
      }
    }
  }
  return violations;
}

// ---------- Main ----------------------------------------------------------

function main() {
  const tracked = gitLsFiles();
  const dirs = findPackageDirs(tracked);
  const violations = [];
  for (const d of dirs) violations.push(...checkPackageJson(d));

  if (AS_JSON) {
    process.stdout.write(JSON.stringify({ scanned: dirs, violations }, null, 2) + '\n');
    process.exit(violations.length > 0 ? 1 : 0);
  }

  if (violations.length === 0) {
    console.log(`Scanned ${dirs.length} package(s).`);
    console.log('All dependencies are pinned to exact versions.');
    process.exit(0);
  }

  console.log(
    `Scanned ${dirs.length} package(s). Found ${violations.length} unpinned dependenc${violations.length === 1 ? 'y' : 'ies'}:\n`
  );
  console.log('| Directory | Dependency | Version |');
  console.log('|-----------|------------|---------|');
  for (const v of violations) {
    console.log(`| ./${v.directory} | ${v.dependency} | ${v.version} |`);
  }
  process.exit(1);
}

main();
