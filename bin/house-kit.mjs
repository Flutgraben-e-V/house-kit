#!/usr/bin/env node
// house-kit: start a house project, and check that one still keeps the house contract.
//
//   house-kit init <folder> [--name <name>] [--kit <install spec>]
//   house-kit check
//
// check prints one verdict line: "house-kit check: passed", "house-kit check:
// FAILED: <names>" or "house-kit check: INCONCLUSIVE: <why>". Read that line,
// never the exit code alone.

import { execFileSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KIT = JSON.parse(readFileSync(join(KIT_DIR, 'package.json'), 'utf8'));
const HOUSE = JSON.parse(readFileSync(join(KIT_DIR, 'house.json'), 'utf8'));

const [command, ...args] = process.argv.slice(2);
if (command === 'init') init(args);
else if (command === 'check') check();
else {
  console.error('usage: house-kit init <folder> [--name <name>] [--kit <spec>] | house-kit check');
  process.exit(2);
}

// ── init ─────────────────────────────────────────────────────────────────────

function flag(list, name) {
  const i = list.indexOf(name);
  return i === -1 ? undefined : list[i + 1];
}

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function init(list) {
  const target = resolve(list.find((a, i) => !a.startsWith('--') && !list[i - 1]?.startsWith('--')) ?? '.');
  const name = flag(list, '--name') ?? basename(target);
  const [major, minor] = KIT.version.split('.');
  const kitSpec = flag(list, '--kit') ?? `^${major}.${minor}.0`;

  if (existsSync(join(target, 'package.json'))) {
    console.error(`house-kit init: ${target} already has a package.json; nothing written.`);
    process.exit(1);
  }
  mkdirSync(target, { recursive: true });
  cpSync(join(KIT_DIR, 'template'), target, { recursive: true });
  renameSync(join(target, 'gitignore'), join(target, '.gitignore'));
  // The published package drops the executable bit (pnpm pack writes every file that is
  // not a bin as 0644), and git silently skips a hook it cannot execute.
  chmodSync(join(target, '.githooks/pre-push'), 0o755);
  for (const file of walk(target)) {
    const text = readFileSync(file, 'utf8');
    if (text.includes('__NAME__')) writeFileSync(file, text.replaceAll('__NAME__', name));
  }

  const pkg = {
    name,
    version: '0.1.0',
    private: true,
    engines: { node: HOUSE.node },
    packageManager: HOUSE.packageManager,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      'build:hostinger': 'next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/',
      'start:hostinger': 'node .next/standalone/server.js',
      lint: 'eslint',
      typecheck: 'tsc --noEmit',
      check: 'house-kit check',
      gates: 'pnpm typecheck && pnpm lint && pnpm check',
      prepare: 'git config core.hooksPath .githooks 2>/dev/null || true',
    },
    dependencies: { '@flutgraben/house-kit': kitSpec, ...HOUSE.dependencies },
    devDependencies: { ...HOUSE.devDependencies },
    'house-kit': { colours: ['src/app/globals.css'] },
  };
  writeFileSync(join(target, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  console.log(`house-kit init: ${name} written to ${target}.`);
  console.log('Next: cd into it, git init, pnpm install, pnpm gates, pnpm dev.');
}

// ── check ────────────────────────────────────────────────────────────────────

function check() {
  const root = process.cwd();
  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) return verdict([], 'no package.json in this folder');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const failed = [];
  const src = join(root, 'src');
  const files = existsSync(src) ? walk(src) : [];
  const rel = (f) => relative(root, f);

  // 1. Pins: every house version, exactly as the kit states it.
  const drift = [];
  for (const group of ['dependencies', 'devDependencies']) {
    for (const [dep, want] of Object.entries(HOUSE[group])) {
      const have = pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep];
      if (have !== want) drift.push(`${dep}: ${have ?? 'missing'}, the house pin is ${want}`);
    }
  }
  if (pkg.engines?.node !== HOUSE.node) drift.push(`engines.node: ${pkg.engines?.node ?? 'missing'}, the house pin is ${HOUSE.node}`);
  if (pkg.packageManager !== HOUSE.packageManager) drift.push(`packageManager: ${pkg.packageManager ?? 'missing'}, the house pin is ${HOUSE.packageManager}`);
  report('pins', drift, failed);

  // 2. Colours: raw colour values live only in the project's own colour files, or the
  //    project's own lint rule judges them. The kit never fixes names or values: each
  //    project keeps its own design system (Sina, 2026-11-10: practice only).
  const own = pkg['house-kit'] ?? {};
  const colourProblems = [];
  if (own.colourLint) {
    const config = ['eslint.config.mjs', 'eslint.config.js'].map((n) => join(root, n)).find(existsSync);
    if (!config || !readFileSync(config, 'utf8').includes(own.colourLint)) colourProblems.push(`house-kit.colourLint names ${own.colourLint}, which the ESLint config does not switch on`);
    else console.log(`ℹ colours are judged by this project's own lint rule ${own.colourLint}.`);
  } else {
    const homes = (own.colours ?? []).map((c) => join(root, c));
    if (!homes.length) colourProblems.push('package.json "house-kit" names neither colours (the files that hold colour values) nor colourLint (the rule that judges them)');
    for (const h of homes) if (!existsSync(h)) colourProblems.push(`house-kit.colours names ${rel(h)}, which does not exist`);
    const RAW = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/;
    for (const f of files) {
      if (homes.includes(f) || !/\.(css|tsx)$/.test(f)) continue;
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const code = line.replace(/\/\*.*?\*\/|\/\/.*$/g, '');
        if (RAW.test(code) && (f.endsWith('.css') || /className|style|color/i.test(code))) colourProblems.push(`${rel(f)}:${i + 1}  ${line.trim()}`);
      });
    }
  }
  report('colours', colourProblems, failed);

  // 3. Languages: every active language holds every key English holds.
  const routing = join(src, 'i18n/routing.ts');
  const messages = join(src, 'messages');
  const langProblems = [];
  if (existsSync(routing) && existsSync(join(messages, 'en.json'))) {
    const locales = [...(readFileSync(routing, 'utf8').match(/locales\s*=\s*\[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
    const keys = (o, p = '') => (o && typeof o === 'object' && !Array.isArray(o) ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k)) : [p]);
    const en = keys(JSON.parse(readFileSync(join(messages, 'en.json'), 'utf8')));
    for (const locale of locales.filter((l) => l !== 'en')) {
      const file = join(messages, `${locale}.json`);
      if (!existsSync(file)) { langProblems.push(`${rel(file)} is missing`); continue; }
      const have = new Set(keys(JSON.parse(readFileSync(file, 'utf8'))));
      for (const k of en) if (!have.has(k)) langProblems.push(`${rel(file)} is missing ${k}`);
    }
  }
  report('languages', langProblems, failed);

  // 4. The pre-push hook: the only gate before a push (there is no CI). Git skips it without
  //    a word when it is missing, not executable, or not where git looks for hooks, and a
  //    clone elsewhere gets it non-executable when git recorded it without the bit.
  const hook = join(root, '.githooks/pre-push');
  const hookProblems = [];
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  const gitOr = (fallback, ...a) => { try { return git(...a); } catch { return fallback; } };
  if (!existsSync(hook)) hookProblems.push('.githooks/pre-push is missing, so nothing runs pnpm gates before a push');
  else if (!(statSync(hook).mode & 0o111)) hookProblems.push('.githooks/pre-push is not executable, so git skips it and pnpm gates never runs on push. Fix: chmod +x .githooks/pre-push && git update-index --chmod=+x .githooks/pre-push');
  const top = gitOr('', 'rev-parse', '--show-toplevel');
  if (!top) console.log('ℹ not a git repository yet, so the hook wiring is not checked.');
  else if (existsSync(hook)) {
    const hooksPath = gitOr('', 'config', '--get', 'core.hooksPath');
    const wanted = realpathSync(join(root, '.githooks'));
    const actual = hooksPath && existsSync(resolve(top, hooksPath)) ? realpathSync(resolve(top, hooksPath)) : '';
    if (actual !== wanted) hookProblems.push(`git looks for hooks in ${hooksPath || '.git/hooks'}, not .githooks, so the pre-push hook never runs. Fix: git config core.hooksPath .githooks (pnpm install does it once git exists)`);
    const recorded = gitOr('', 'ls-files', '-s', '--', '.githooks/pre-push').split(' ')[0];
    if (recorded && recorded !== '100755') hookProblems.push(`git records .githooks/pre-push as ${recorded}, so every other clone gets it non-executable. Fix: git update-index --chmod=+x .githooks/pre-push, then commit`);
  }
  report('hook', hookProblems, failed);

  // 5. A newer kit: said, never failed (updating is a choice, not a defect).
  try {
    const newest = execFileSync('npm', ['view', KIT.name, 'version'], { encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'ignore'] })
      .trim().split('.').map(Number);
    const mine = KIT.version.split('.').map(Number);
    if (newest.length === 3 && (newest[0] - mine[0] || newest[1] - mine[1] || newest[2] - mine[2]) > 0) {
      console.log(`ℹ house-kit ${newest.join('.')} exists; this project runs ${KIT.version}. Update: pnpm update @flutgraben/house-kit`);
    } else console.log(`✓ house-kit ${KIT.version} is the newest.`);
  } catch {
    console.log('ℹ could not reach the npm registry to look for a newer kit (offline?).');
  }

  verdict(failed);
}

function report(name, problems, failed) {
  if (!problems.length) return console.log(`✓ ${name}`);
  failed.push(name);
  console.error(`✗ ${name}:\n${problems.map((p) => `    ${p}`).join('\n')}`);
}

function verdict(failed, inconclusive) {
  if (inconclusive) {
    console.log(`house-kit check: INCONCLUSIVE: ${inconclusive}`);
    process.exit(2);
  }
  if (failed.length) {
    console.log(`house-kit check: FAILED: ${failed.join(', ')}`);
    process.exit(1);
  }
  console.log('house-kit check: passed');
}
