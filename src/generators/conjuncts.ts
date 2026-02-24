/**
 * Ligated conjunct (sanyoga akuru) generator
 * Based on attested data by Pushpananda Ekanayake and Pathum Egodawatta
 */

import { CONSONANT_MAP, dropTrailingA } from './consonants.js';
import type { GeneratedGlyph } from '../types/index.js';

/** Unicode characters for conjunct formation */
const AL_LAKUNA = '්';
const ZWJ = '\u200D';

/**
 * Map of attested ligated conjunct pairs
 * Key: first consonant, Value: array of second consonants it can ligate with
 */
export const CONJUNCT_MAP: Record<string, string[]> = {
  'ක': ['ව', 'ෂ'],           // ka + va, ka + ssa
  'ත': ['ථ', 'ව'],           // ta + tha, ta + va
  'න': ['ථ', 'ද', 'ධ', 'ව'], // na + tha, na + da, na + dha, na + va
  'ග': ['ධ'],                // ga + dha
  'ට': ['ඨ'],                // tta + ttha
  'ද': ['ධ', 'ව'],           // da + dha, da + va
  'ඞ': ['ග'],                // ngga + ga
  'ච': ['ච'],                // ca + ca
  'ඤ': ['ච', 'ඡ', 'ජ'],     // nya + ca, nya + cha, nya + ja
  'ණ': ['ඩ'],                // nna + dda
  'බ': ['බ'],                // ba + ba
  'ම': ['බ'],                // ma + ba
};

/**
 * Generate all ligated conjunct pairs
 */
export function getConjunctPairs(): [string, string][] {
  const pairs: [string, string][] = [];
  for (const [first, seconds] of Object.entries(CONJUNCT_MAP)) {
    for (const second of seconds) {
      pairs.push([first, second]);
    }
  }
  return pairs;
}

/**
 * Generate a ligated conjunct Unicode sequence
 * Format: first + al-lakuna + ZWJ + second
 */
export function makeConjunctSequence(first: string, second: string): string {
  return first + AL_LAKUNA + ZWJ + second;
}

/**
 * Generate glyph name for a ligated conjunct
 * Format: drop trailing 'a' from first, capitalize second's name
 * e.g., ka + va = kVa, ta + tha = tTha
 */
export function makeConjunctName(firstName: string, secondName: string): string {
  const base = dropTrailingA(firstName);
  const secondCapitalized = secondName.charAt(0).toUpperCase() + secondName.slice(1);
  return base + secondCapitalized;
}

/**
 * Generate all ligated conjuncts as GeneratedGlyph objects
 */
export function generateConjuncts(namespace: string = 'sinh'): GeneratedGlyph[] {
  const conjuncts: GeneratedGlyph[] = [];
  const pairs = getConjunctPairs();

  for (const [firstChar, secondChar] of pairs) {
    const first = CONSONANT_MAP.get(firstChar);
    const second = CONSONANT_MAP.get(secondChar);

    if (!first || !second) continue;

    const name = makeConjunctName(first.name, second.name);
    const sequence = makeConjunctSequence(firstChar, secondChar);

    conjuncts.push({
      name,
      fullName: `${name}-${namespace}`,
      type: 'conjunct',
      sequence,
      components: [firstChar, AL_LAKUNA, ZWJ, secondChar],
    });
  }

  return conjuncts;
}

/**
 * Get all conjunct sequences (Unicode strings)
 */
export function getConjunctSequences(): string[] {
  return getConjunctPairs().map(([c1, c2]) => makeConjunctSequence(c1, c2));
}
