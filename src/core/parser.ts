/**
 * YAML parser for glyphset definition files
 */

import { parse as parseYaml } from 'yaml';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Glyph, GlyphsetDefinition, GlyphsetLevel, GlyphMetadata } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Path to the glyphsets directory (where YAML data files are located) */
const GLYPHSETS_DIR = resolve(__dirname, '..', '..', 'glyphsets');

/** Glyphset file names in order of level */
const GLYPHSET_FILES: Record<GlyphsetLevel, string> = {
  0: 'sinhala-0-kernel.yaml',
  1: 'sinhala-1-core.yaml',
  2: 'sinhala-2-plus.yaml',
  3: 'sinhala-3-pro.yaml',
};

/**
 * Parse a unicode hex string (e.g., "0x0D85") to a number
 */
function parseUnicode(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.startsWith('0x')) {
    return parseInt(value, 16);
  }
  return undefined;
}

/**
 * Parse a YAML glyphset file and return the raw definition
 */
export function parseGlyphsetFile(filePath: string): GlyphsetDefinition {
  const content = readFileSync(filePath, 'utf-8');
  return parseYaml(content) as GlyphsetDefinition;
}

/**
 * Get the file path for a glyphset level
 */
export function getGlyphsetPath(level: GlyphsetLevel): string {
  return resolve(GLYPHSETS_DIR, GLYPHSET_FILES[level]);
}

/**
 * Convert raw YAML definition to processed Glyph objects
 */
export function parseGlyphs(
  definition: GlyphsetDefinition,
  level: GlyphsetLevel
): Glyph[] {
  const glyphs: Glyph[] = [];
  const namespace = definition.namespace;
  const excludeNamespaceFrom = definition['Exclude namespace from'] || [];

  for (const [categoryName, categoryGlyphs] of Object.entries(definition.categories)) {
    if (!categoryGlyphs) continue;

    const useNamespace = !excludeNamespaceFrom.includes(categoryName);

    for (const [glyphName, metadata] of Object.entries(categoryGlyphs)) {
      // Skip commented out entries (they appear as null or undefined)
      if (glyphName.startsWith('#')) continue;

      const fullName = useNamespace ? `${glyphName}-${namespace}` : glyphName;
      const glyphMeta = metadata as GlyphMetadata | null;

      const glyph: Glyph = {
        name: glyphName,
        fullName,
        category: categoryName,
        level,
        unicode: parseUnicode(glyphMeta?.unicode),
        decompose: glyphMeta?.decompose,
        signs: glyphMeta?.signs,
        conjunct: glyphMeta?.conjunct,
        touch: glyphMeta?.touch,
      };

      glyphs.push(glyph);
    }
  }

  return glyphs;
}

/**
 * Load and parse a glyphset by level
 */
export function loadGlyphset(level: GlyphsetLevel): Glyph[] {
  const filePath = getGlyphsetPath(level);
  const definition = parseGlyphsetFile(filePath);
  return parseGlyphs(definition, level);
}

/**
 * Load glyphsets up to and including the specified level (cumulative)
 */
export function loadGlyphsetsCumulative(maxLevel: GlyphsetLevel): Glyph[] {
  const allGlyphs: Glyph[] = [];

  for (let level = 0; level <= maxLevel; level++) {
    const glyphs = loadGlyphset(level as GlyphsetLevel);
    allGlyphs.push(...glyphs);
  }

  return allGlyphs;
}
