/**
 * YAML parser for glyphset definition files
 */

import { parse as parseYaml } from 'yaml';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Glyph, GlyphsetDefinition, GlyphsetLevel, GlyphMetadata, Script,
} from '../types/index.js';
import { SCRIPTS, composeName, scriptOfNamespace } from './scripts.js';
import { TAMIL_SIGN_BY_NAME, tamilStem } from './tamil.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Path to the glyphsets directory (where YAML data files are located) */
const GLYPHSETS_DIR = resolve(__dirname, '..', '..', 'glyphsets');

/** Category given to the sign alternates expanded from a `groups:` block */
export const SIGN_ALTERNATES_CATEGORY = 'Sign alternates';

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
export function getGlyphsetPath(level: GlyphsetLevel, script: Script = 'sinhala'): string {
  const file = SCRIPTS[script].files[level];
  if (!file) {
    throw new Error(`${script} has no level ${level} (highest is ${SCRIPTS[script].maxLevel})`);
  }
  return resolve(GLYPHSETS_DIR, file);
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
  const scriptDef = SCRIPTS[scriptOfNamespace(namespace)];
  const excludeNamespaceFrom = definition['Exclude namespace from'] || [];
  const grantha = new Set(definition.grantha ?? []);

  for (const [categoryName, categoryGlyphs] of Object.entries(definition.categories)) {
    if (!categoryGlyphs) continue;

    const useNamespace = !excludeNamespaceFrom.includes(categoryName);

    for (const [glyphName, metadata] of Object.entries(categoryGlyphs)) {
      // Skip commented out entries (they appear as null or undefined)
      if (glyphName.startsWith('#')) continue;

      const fullName = useNamespace ? composeName(glyphName, scriptDef) : glyphName;
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
      if (grantha.has(glyphName)) glyph.grantha = true;

      glyphs.push(glyph);
    }
  }

  if (definition.groups) applyShapeGroups(glyphs, definition, level);

  return glyphs;
}

/**
 * Expand a `groups:` block: mark each consonant + sign form that a group
 * alternate can also meet (Glyph.alternate), and append the alternates
 * themselves as glyphs in the "Sign alternates" category.
 */
function applyShapeGroups(
  glyphs: Glyph[],
  definition: GlyphsetDefinition,
  level: GlyphsetLevel
): void {
  const scriptDef = SCRIPTS[scriptOfNamespace(definition.namespace)];
  const alternateOf = new Map<string, string>();   // form name -> "sign.group"
  const alternates: Glyph[] = [];

  for (const [signName, groups] of Object.entries(definition.groups ?? {})) {
    const sign = TAMIL_SIGN_BY_NAME.get(signName);
    if (!sign) throw new Error(`groups: unknown sign "${signName}"`);
    for (const [groupName, members] of Object.entries(groups)) {
      const bare = `${signName}.${groupName}`;
      for (const member of members) alternateOf.set(tamilStem(member) + sign.suffix, bare);
      alternates.push({
        name: bare,
        fullName: composeName(bare, scriptDef),
        category: SIGN_ALTERNATES_CATEGORY,
        level,
        variantOf: signName,
        group: members,
      });
    }
  }

  // A form lives in "Orthographical conjuncts", or in a stylistic-set category for
  // the traditional forms (ss09 …); letters and signs are never forms.
  for (const glyph of glyphs) {
    const alt = alternateOf.get(glyph.name);
    if (alt && glyph.category !== 'Letters' && glyph.category !== 'Signs') glyph.alternate = alt;
  }
  glyphs.push(...alternates);
}

/**
 * Load and parse a glyphset by level
 */
export function loadGlyphset(level: GlyphsetLevel, script: Script = 'sinhala'): Glyph[] {
  const filePath = getGlyphsetPath(level, script);
  const definition = parseGlyphsetFile(filePath);
  return parseGlyphs(definition, level);
}

/**
 * Load glyphsets up to and including the specified level (cumulative)
 */
export function loadGlyphsetsCumulative(
  maxLevel: GlyphsetLevel,
  script: Script = 'sinhala'
): Glyph[] {
  const allGlyphs: Glyph[] = [];

  for (let level = 0; level <= maxLevel; level++) {
    const glyphs = loadGlyphset(level as GlyphsetLevel, script);
    allGlyphs.push(...glyphs);
  }

  return allGlyphs;
}
