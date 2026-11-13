// Shared helpers for the test suite. Tests run against the built package (dist/),
// the same code the CLI ships, so `npm test` builds first.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

/** The name ⇄ Unicode engine (CommonJS, shared with the browser tool). */
export const engine = require(resolve(ROOT, 'tools/glyphname-unicode-converter/lankaglyphset-map.js'));
export const YAML = require('yaml');

export const TAMIL_FILES = ['tamil-0-kernel.yaml', 'tamil-1-core.yaml', 'tamil-2-pro.yaml'];

/** A glyphset file as the YAML library parses it, independent of the package's own reader. */
export function rawGlyphset(file) {
  return YAML.parse(readFileSync(resolve(ROOT, 'glyphsets', file), 'utf8'));
}

/** Run the CLI; returns { status, stdout, stderr }. */
export function cli(...args) {
  const r = spawnSync(process.execPath, [resolve(ROOT, 'dist/cli/index.js'), ...args], {
    encoding: 'utf8',
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

export const chr = (...cps) => String.fromCodePoint(...cps);
