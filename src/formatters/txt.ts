/**
 * Text formatter for glyph output
 */

import type { Glyph } from '../types/index.js';

/**
 * Format glyphs as a plain text list (one name per line)
 */
export function formatAsTxt(glyphs: Glyph[], includeNamespace: boolean = true): string {
  return glyphs
    .map(g => includeNamespace ? g.fullName : g.name)
    .join('\n');
}

/**
 * Format glyph names as a plain text list
 */
export function formatNamesAsTxt(names: string[]): string {
  return names.join('\n');
}

/**
 * Format glyphs as JSON
 */
export function formatAsJson(glyphs: Glyph[], includeNamespace: boolean = true): string {
  const names = glyphs.map(g => includeNamespace ? g.fullName : g.name);
  return JSON.stringify(names, null, 2);
}

/**
 * Format glyphs with full metadata as JSON
 */
export function formatGlyphsAsJson(glyphs: Glyph[]): string {
  return JSON.stringify(glyphs, null, 2);
}
