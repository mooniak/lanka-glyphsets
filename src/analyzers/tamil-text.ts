/**
 * Tamil text → glyph names.
 *
 * Cluster rules (a Tamil syllable never needs a joiner):
 * - C + vowel sign          → consonant + sign form       (kI, nnnUu, kAa)
 * - C + pulli               → pure consonant              (k, nnn)
 * - C (bare)                → base consonant              (ka)
 * - ka + pulli + ssa [+ sign] → the க்ஷ conjunct           (kSsa, kSsI, kSs)
 * - sa|sha + pulli + ra + ீ  → ஸ்ரீ / ஶ்ரீ                 (shree)
 * Any other consonant + pulli + consonant is two clusters: Tamil has no other
 * conjunct glyphs.
 *
 * The glyph inventory is read from glyphsets/tamil-*.yaml, so nothing here can
 * drift from the standard; only the sign abbreviations live in core/tamil.ts.
 */

import { loadGlyphsetsCumulative } from '../core/parser.js';
import {
  TAMIL_SIGN_BY_CHAR, TAMIL_SIGN_BY_NAME, TAMIL_VIRAMA, ZWJ, ZWNJ, DOTTED_CIRCLE,
  isTamilConsonant, tamilFormName,
} from '../core/tamil.js';
import type { Glyph } from '../types/index.js';
import { PUNCTUATION, isSpaceChar, type GlyphOccurrence } from './common.js';

interface TamilTables {
  /** Every glyph by bare name */
  byName: Map<string, Glyph>;
  /** Atomic glyphs (those with a codepoint) by codepoint */
  byCodepoint: Map<number, Glyph>;
}

let _tables: TamilTables | undefined;

function tables(): TamilTables {
  if (_tables) return _tables;
  const byName = new Map<string, Glyph>();
  const byCodepoint = new Map<number, Glyph>();
  for (const g of loadGlyphsetsCumulative(2, 'tamil')) {
    if (!byName.has(g.name)) byName.set(g.name, g);
    if (g.unicode !== undefined && !byCodepoint.has(g.unicode)) byCodepoint.set(g.unicode, g);
  }
  _tables = { byName, byCodepoint };
  return _tables;
}

const SA = 'ஸ';
const SHA = 'ஶ';
const SSA = 'ஷ';
const RA = 'ர';
const II_SIGN = 'ீ';
const KA = 'க';

/** Add what the standard says about a name: canonical, level, alternate. */
function describe(occ: GlyphOccurrence, components?: string[]): GlyphOccurrence {
  const glyph = tables().byName.get(occ.name);
  if (components) occ.components = components;
  occ.canonical = glyph !== undefined;
  if (glyph) {
    occ.level = glyph.level;
    if (glyph.alternate) occ.alternate = glyph.alternate;
  }
  return occ;
}

/** Extract all glyph-name occurrences from Tamil text. */
export function extractTamilGlyphNames(text: string): GlyphOccurrence[] {
  const { byCodepoint } = tables();
  const chars = [...text.normalize('NFC')];
  const out: GlyphOccurrence[] = [];
  let i = 0;

  while (i < chars.length) {
    const char = chars[i];
    const cp = char.codePointAt(0)!;

    if (isSpaceChar(char)) {
      out.push({ name: 'space', type: 'space', sequence: char });
      i++;
      continue;
    }

    if (char === ZWJ) { out.push(control('zerowidthjoiner', char)); i++; continue; }
    if (char === ZWNJ) { out.push(control('zerowidthnonjoiner', char)); i++; continue; }
    if (char === DOTTED_CIRCLE) { out.push(control('dottedCircle', char)); i++; continue; }

    if (isTamilConsonant(cp)) {
      const result = parseCluster(chars, i);
      out.push(...result.occurrences);
      i = result.next;
      continue;
    }

    // Any other encoded glyph: vowels, aytham, signs, numerals, symbols.
    const glyph = byCodepoint.get(cp);
    if (glyph) {
      out.push(describe({ name: glyph.name, type: atomicType(glyph), sequence: char }));
      i++;
      continue;
    }

    if (PUNCTUATION[char]) {
      out.push({ name: PUNCTUATION[char], type: 'punctuation', sequence: char });
      i++;
      continue;
    }

    i++;   // unknown character
  }
  return out;
}

function control(name: string, char: string): GlyphOccurrence {
  return describe({ name, type: 'control', sequence: char });
}

function atomicType(glyph: Glyph): GlyphOccurrence['type'] {
  switch (glyph.category) {
    case 'Letters': return 'vowel';              // independent vowels and the aytham
    case 'Signs': return 'sign';
    case 'Tamil numerals': return 'number';
    case 'Tamil symbols': return 'symbol';
    default: return 'sign';
  }
}

function parseCluster(chars: string[], start: number): { occurrences: GlyphOccurrence[]; next: number } {
  const { byCodepoint } = tables();
  const c1 = chars[start];
  let i = start + 1;

  // ஸ்ரீ / ஶ்ரீ: one ligature glyph for both spellings.
  if ((c1 === SA || c1 === SHA) && chars[i] === TAMIL_VIRAMA && chars[i + 1] === RA && chars[i + 2] === II_SIGN) {
    const seq = chars.slice(start, i + 3).join('');
    return {
      occurrences: [describe(
        { name: 'shree', type: 'conjunct', sequence: seq },
        [c1 === SA ? 'sa' : 'sha', 'virama', 'ra', 'iisign']
      )],
      next: i + 3,
    };
  }

  let base = byCodepoint.get(c1.codePointAt(0)!)?.name ?? 'unknown';
  let isConjunct = false;
  let seq = c1;
  let parts = [base];

  // க்ஷ: ka + pulli + ssa
  if (c1 === KA && chars[i] === TAMIL_VIRAMA && chars[i + 1] === SSA) {
    base = 'kSsa';
    isConjunct = true;
    seq = c1 + TAMIL_VIRAMA + SSA;
    parts = ['ka', 'virama', 'ssa'];
    i += 2;
  }

  const sign = i < chars.length ? TAMIL_SIGN_BY_CHAR.get(chars[i]) : undefined;
  if (sign) {
    const name = tamilFormName(base, sign.name);
    const type: GlyphOccurrence['type'] = isConjunct ? 'conjunct'
      : sign.name === 'virama' ? 'pure-consonant' : 'consonant-vowel';
    return {
      occurrences: [describe(
        { name, type, sequence: seq + chars[i] },
        [...(isConjunct ? [base] : parts), sign.name]
      )],
      next: i + 1,
    };
  }

  return {
    occurrences: [describe(
      { name: base, type: isConjunct ? 'conjunct' : 'consonant', sequence: seq },
      isConjunct ? parts : undefined
    )],
    next: i,
  };
}

/** Sign glyphs the text needs, from the components of its clusters. */
export function getRequiredTamilSigns(text: string): string[] {
  const signs = new Set<string>();
  for (const occ of extractTamilGlyphNames(text)) {
    if (occ.type === 'sign') signs.add(occ.name);
    for (const part of occ.components ?? []) {
      if (TAMIL_SIGN_BY_NAME.has(part)) signs.add(part);
    }
  }
  return Array.from(signs).sort();
}

/** Base consonants the text needs. */
export function getRequiredTamilBaseConsonants(text: string): string[] {
  const bases = new Set<string>();
  for (const occ of extractTamilGlyphNames(text)) {
    if (occ.type === 'consonant') bases.add(occ.name);
    else if (occ.type === 'consonant-vowel' || occ.type === 'pure-consonant') {
      if (occ.components) bases.add(occ.components[0]);
    }
  }
  return Array.from(bases).sort();
}
