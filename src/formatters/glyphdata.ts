/**
 * GlyphData.xml formatter for Glyphs app
 * Glyph names are used exactly as defined in the YAML files (e.g. ka-sinh, kVI-sinh)
 */

import type { Glyph } from '../types/index.js';

const CATEGORY_MAP: Record<string, { category: string; subCategory?: string }> = {
  'Letters': { category: 'Letter' },
  'Signs': { category: 'Mark' },  // subCategory per sign: signSubCategory()
  'Punctuation': { category: 'Punctuation' },
  'Format controls': { category: 'Separator' },
  'Ligated consonant conjuncts': { category: 'Letter', subCategory: 'Ligature' },
  'Orthographical conjuncts': { category: 'Letter', subCategory: 'Ligature' },
  'Typographical conjunct ligatures': { category: 'Letter', subCategory: 'Ligature' },
  'Sinhala numerals': { category: 'Number' },
  'Stylistic alternates': { category: 'Letter' },
};

// Unicode Mn (nonspacing) Sinhala signs: candrabindu, al-lakuna, ි ී ු ූ.
// Every other encoded sign is Mc (spacing combining): ං ඃ ා ැ ෑ ෘ–ෟ ෲ ෳ.
const NONSPACING_SIGNS = new Set([0x0D81, 0x0DCA, 0x0DD2, 0x0DD3, 0x0DD4, 0x0DD6]);
// Unencoded signs that advance like Mc: yansaya follows its base.
const SPACING_UNENCODED_SIGNS = new Set(['yasign']);

function signSubCategory(glyph: Glyph): string {
  const spacing = glyph.unicode !== undefined
    ? !NONSPACING_SIGNS.has(glyph.unicode)
    : SPACING_UNENCODED_SIGNS.has(glyph.name);
  return spacing ? 'Spacing Combining' : 'Nonspacing';
}

function toHex(unicode: number): string {
  return unicode.toString(16).toUpperCase().padStart(4, '0');
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function glyphToXml(glyph: Glyph, namespace: string): string {
  const catInfo = CATEGORY_MAP[glyph.category] ?? { category: 'Letter' };
  const attrs: string[] = [];

  if (glyph.unicode !== undefined) {
    attrs.push(`unicode="${toHex(glyph.unicode)}"`);
  }

  attrs.push(`name="${escapeXml(glyph.fullName)}"`);
  attrs.push(`category="${catInfo.category}"`);

  const subCategory = glyph.category === 'Signs' ? signSubCategory(glyph) : catInfo.subCategory;
  if (subCategory) {
    attrs.push(`subCategory="${subCategory}"`);
  }

  attrs.push(`script="sinhala"`);

  if (glyph.decompose && glyph.decompose.length > 0) {
    const components = glyph.decompose.map(c => `${c}-${namespace}`);
    attrs.push(`decompose="${escapeXml(components.join(', '))}"`);
  }

  if (glyph.signs && glyph.signs.length > 0) {
    attrs.push(`anchors="${escapeXml(glyph.signs.join(', '))}"`);
  }

  return `  <glyph ${attrs.join(' ')}/>`;
}

export function formatAsGlyphData(glyphs: Glyph[], namespace: string): string {
  const dtd = `<?xml version='1.0' encoding='UTF-8'?>
<!DOCTYPE glyphData [
<!ELEMENT glyphData (glyph)+>
<!ELEMENT glyph EMPTY>
<!ATTLIST glyph unicode CDATA #IMPLIED>
<!ATTLIST glyph name CDATA #REQUIRED>
<!ATTLIST glyph category CDATA #REQUIRED>
<!ATTLIST glyph subCategory CDATA #IMPLIED>
<!ATTLIST glyph script CDATA #IMPLIED>
<!ATTLIST glyph decompose CDATA #IMPLIED>
]>`;

  const lines = glyphs.map(g => glyphToXml(g, namespace));
  return `${dtd}\n<glyphData>\n${lines.join('\n')}\n</glyphData>\n`;
}
