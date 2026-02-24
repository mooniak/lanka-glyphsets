/**
 * Rakaransaya (rakar) combination generator
 * Based on attested data by Pushpananda Ekanayake and Pathum Egodawatta
 */

import { CONSONANTS, CONSONANT_MAP, dropTrailingA } from './consonants.js';
import { canTakeRakaransaya } from './exceptions.js';
import { getConjunctPairs, makeConjunctSequence } from './conjuncts.js';
import type { GeneratedGlyph } from '../types/index.js';

/** Rakaransaya sequence (al-lakuna + ZWJ + ra) */
const RAKARANSAYA = '්‍ර';

/**
 * Generate glyph name for a rakaransaya combination
 * Format: drop trailing 'a' from consonant, add 'ra'
 * e.g., ka -> kra, pa -> pra
 */
export function makeRakaransayaName(consonantName: string): string {
  return dropTrailingA(consonantName) + 'ra';
}

/**
 * Generate rakaransaya combination sequence
 */
export function makeRakaransayaSequence(base: string): string {
  return base + RAKARANSAYA;
}

/**
 * Generate all consonant + rakaransaya combinations
 */
export function generateConsonantRakaransaya(namespace: string = 'sinh'): GeneratedGlyph[] {
  const combinations: GeneratedGlyph[] = [];

  for (const consonant of CONSONANTS) {
    if (!canTakeRakaransaya(consonant.char)) continue;

    const name = makeRakaransayaName(consonant.name);
    const sequence = makeRakaransayaSequence(consonant.char);

    combinations.push({
      name,
      fullName: `${name}-${namespace}`,
      type: 'rakaransaya',
      sequence,
      components: [consonant.char, ...RAKARANSAYA.split('')],
    });
  }

  return combinations;
}

/**
 * Generate all conjunct + rakaransaya combinations
 */
export function generateConjunctRakaransaya(namespace: string = 'sinh'): GeneratedGlyph[] {
  const combinations: GeneratedGlyph[] = [];
  const conjunctPairs = getConjunctPairs();

  for (const [firstChar, secondChar] of conjunctPairs) {
    const first = CONSONANT_MAP.get(firstChar);
    const second = CONSONANT_MAP.get(secondChar);
    if (!first || !second) continue;

    const conjunctSequence = makeConjunctSequence(firstChar, secondChar);

    // Check if this conjunct can take rakaransaya
    if (!canTakeRakaransaya(conjunctSequence)) continue;

    // Build name: e.g., kVa + ra = kVra
    const baseName = dropTrailingA(first.name) + second.name.charAt(0).toUpperCase() + second.name.slice(1);
    const name = dropTrailingA(baseName) + 'ra';
    const sequence = conjunctSequence + RAKARANSAYA;

    combinations.push({
      name,
      fullName: `${name}-${namespace}`,
      type: 'rakaransaya',
      sequence,
      components: [...conjunctSequence.split(''), ...RAKARANSAYA.split('')],
    });
  }

  return combinations;
}

/**
 * Generate all rakaransaya combinations (consonants + conjuncts)
 */
export function generateAllRakaransaya(namespace: string = 'sinh'): GeneratedGlyph[] {
  return [
    ...generateConsonantRakaransaya(namespace),
    ...generateConjunctRakaransaya(namespace),
  ];
}
