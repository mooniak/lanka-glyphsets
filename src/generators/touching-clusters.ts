/**
 * Touching consonant cluster (bendi akuru) generator
 * Based on attested data by Pushpananda Ekanayake and Pathum Egodawatta
 */

import { CONSONANT_MAP, dropTrailingA } from './consonants.js';
import type { GeneratedGlyph } from '../types/index.js';

/** Unicode characters for touching cluster formation */
const AL_LAKUNA = '්';
const ZWJ = '\u200D';

/**
 * Map of attested touching consonant cluster pairs
 * Key: first consonant, Value: array of second consonants it can touch with
 */
export const TOUCHING_CLUSTER_MAP: Record<string, string[]> = {
  'ක': ['ක', 'ඛ', 'ත', 'ම', 'න'],
  'ග': ['ග', 'ඝ'],
  'ඞ': ['ඞ', 'ක', 'ග', 'ඝ'],
  'ච': ['ච', 'ඡ'],
  'ජ': ['ජ', 'ඣ'],
  'ඤ': ['ච', 'ඤ'],
  'ට': ['ට', 'ඨ'],
  'ඩ': ['ඩ', 'ඪ'],
  'ණ': ['ණ', 'ඩ', 'ඨ', 'හ'],
  'ත': ['ත', 'ථ', 'ම', 'ව'],
  'ද': ['ද', 'ධ', 'ව'],
  'න': ['න', 'ට', 'ත', 'ද', 'ධ', 'ථ', 'ව', 'හ'],
  'ප': ['ප', 'ත', 'ඵ', 'බ', 'ද', 'හ'],
  'බ': ['බ', 'ද', 'භ'],
  'ම': ['ම', 'හ', 'ඵ', 'බ', 'ව', 'ප', 'ද', 'භ'],
  'ල': ['ල', 'ව'],
  'ව': ['හ'],
  'ශ': ['ට'],
  'ස': ['ස', 'ත', 'ව'],
  'හ': ['ම'],
};

/**
 * Generate all touching cluster pairs
 */
export function getTouchingClusterPairs(): [string, string][] {
  const pairs: [string, string][] = [];
  for (const [first, seconds] of Object.entries(TOUCHING_CLUSTER_MAP)) {
    for (const second of seconds) {
      pairs.push([first, second]);
    }
  }
  return pairs;
}

/**
 * Generate a touching cluster Unicode sequence
 * Format: first + ZWJ + al-lakuna + second
 * Note: Different from ligated conjuncts (which use first + al + ZWJ + second)
 */
export function makeTouchingClusterSequence(first: string, second: string): string {
  return first + ZWJ + AL_LAKUNA + second;
}

/**
 * Generate glyph name for a touching cluster
 * Format: drop trailing 'a' from first, capitalize second's name, add 'Touch'
 * e.g., ka + ka = kKaTouch, da + va = dVaTouch
 */
export function makeTouchingClusterName(firstName: string, secondName: string): string {
  const base = dropTrailingA(firstName);
  const secondCapitalized = secondName.charAt(0).toUpperCase() + secondName.slice(1);
  return base + secondCapitalized + 'Touch';
}

/**
 * Generate all touching clusters as GeneratedGlyph objects
 */
export function generateTouchingClusters(namespace: string = 'sinh'): GeneratedGlyph[] {
  const clusters: GeneratedGlyph[] = [];
  const pairs = getTouchingClusterPairs();

  for (const [firstChar, secondChar] of pairs) {
    const first = CONSONANT_MAP.get(firstChar);
    const second = CONSONANT_MAP.get(secondChar);

    if (!first || !second) continue;

    const name = makeTouchingClusterName(first.name, second.name);
    const sequence = makeTouchingClusterSequence(firstChar, secondChar);

    clusters.push({
      name,
      fullName: `${name}-${namespace}`,
      type: 'touching-cluster',
      sequence,
      components: [firstChar, ZWJ, AL_LAKUNA, secondChar],
    });
  }

  return clusters;
}

/**
 * Get all touching cluster sequences (Unicode strings)
 */
export function getTouchingClusterSequences(): string[] {
  return getTouchingClusterPairs().map(([c1, c2]) => makeTouchingClusterSequence(c1, c2));
}
