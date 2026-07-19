#!/usr/bin/env node
/*
 * sync-standard.mjs
 * =================
 * One command that regenerates every tracked artifact derived from the
 * canonical standard in glyphsets/*.yaml, so a version bump can never ship
 * stale data.
 *
 *   node scripts/sync-standard.mjs           regenerate the artifacts
 *   node scripts/sync-standard.mjs --check    regenerate, then FAIL if anything
 *                                             changed (CI drift guard) or if the
 *                                             recorded standard versions disagree
 *
 * The tracked, hand-regenerated artifacts:
 *   1. tools/glyphname-unicode-converter/lankaglyphset-map.js  (name↔unicode engine)
 *   2. tools/_generated/shaping-exceptions.js                  (depends on #1)
 *   3. tools/_generated/lanka-glyph-data.js                    (CLI export-json)
 *
 * The lankafea (PyPI) copy of the YAMLs is NOT handled here: its setup.py copies
 * glyphsets/*.yaml into the wheel at build time and the on-disk copy is
 * gitignored, so it is drift-proof by construction.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const ARTIFACTS = [
  'tools/glyphname-unicode-converter/lankaglyphset-map.js',
  'tools/_generated/shaping-exceptions.js',
  'tools/_generated/lanka-glyph-data.js',
];

const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'inherit' });

// Regenerate — order matters: build-shaping-exceptions.js require()s the engine
// table produced by build-glyphset.js, so the engine must be rebuilt first.
run('npm run build'); // tsc → dist/, needed for the export-json CLI below
run('node tools/glyphname-unicode-converter/build-glyphset.js');
run('node tools/_generated/build-shaping-exceptions.js');
run('node dist/cli/index.js export-json --format js -o tools/_generated/lanka-glyph-data.js');

// Version consistency: the standard version each package RECORDS must match the
// single source of truth in glyphsets/manifest.yaml. (What each package BUNDLES
// is kept in sync automatically — npm ships glyphsets/, lankafea copies it in.)
const problems = [];
const manifest = parseYaml(readFileSync(resolve(ROOT, 'glyphsets/manifest.yaml'), 'utf8'));
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
if (pkg.standardVersion !== manifest.version) {
  problems.push(
    `package.json "standardVersion" (${pkg.standardVersion}) != ` +
      `glyphsets/manifest.yaml "version" (${manifest.version})`
  );
}

if (check) {
  try {
    execSync(`git diff --exit-code -- ${ARTIFACTS.join(' ')}`, { cwd: ROOT, stdio: 'inherit' });
  } catch {
    problems.push(
      'generated artifacts are out of sync with glyphsets/ — ' +
        'run `npm run sync` and commit the result'
    );
  }
  if (problems.length) {
    console.error('\n✗ standard sync check failed:');
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
  }
  console.log('\n✓ standard in sync; recorded versions consistent');
} else {
  if (problems.length) {
    console.error('\n⚠ version mismatch (regeneration still ran):');
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
  }
  console.log('\n✓ regenerated:\n  - ' + ARTIFACTS.join('\n  - '));
}
