/**
 * Generators module - generates all glyph combinations from YAML definitions
 * Uses YAML as the single source of truth
 */

import { loadGlyphsetsCumulative } from '../core/parser.js';
import type { Glyph, GlyphsetLevel, GeneratedGlyph, GeneratedGlyphType } from '../types/index.js';

// Re-export data definitions for reference
export { CONSONANTS, CONSONANT_MAP, getConsonantName, dropTrailingA } from './consonants.js';
export { VOWEL_SIGNS, COMPOUND_SIGNS } from './vowels.js';

/** Unicode characters */
const AL_LAKUNA = '්';
const ZWJ = '\u200D';

/** Sign name to suffix mapping for glyph naming */
const SIGN_SUFFIX_MAP: Record<string, string> = {
  alSign: '',      // Pure consonant (no suffix, just drop 'a')
  aaSign: 'aa',
  aeSign: 'ae',
  aaeSign: 'aae',
  iSign: 'i',
  iiSign: 'ii',
  uSign: 'u',
  uuSign: 'uu',
  eSign: 'e',
  eeSign: 'ee',
  oSign: 'o',
  ooSign: 'oo',
  aiSign: 'ai',
  auSign: 'au',
  raSign: 'ra',    // Rakaransaya
  rephSign: '',    // Repaya (prefix, handled separately)
  yaSign: 'ya',    // Yansaya
};

/** Sign name to Unicode sequence mapping */
const SIGN_SEQUENCE_MAP: Record<string, string> = {
  alSign: '්',
  aaSign: 'ා',
  aeSign: 'ැ',
  aaeSign: 'ෑ',
  iSign: 'ි',
  iiSign: 'ී',
  uSign: 'ු',
  uuSign: 'ූ',
  eSign: 'ෙ',
  eeSign: 'ේ',
  oSign: 'ො',
  ooSign: 'ෝ',
  aiSign: 'ෛ',
  auSign: 'ෞ',
  raSign: '්‍ර',   // al + ZWJ + ra
  rephSign: 'ර්‍',  // ra + al + ZWJ
  yaSign: '්‍ය',   // al + ZWJ + ya
};

/**
 * Drop trailing 'a' from glyph name
 */
function dropTrailingA(name: string): string {
  return name.endsWith('a') ? name.slice(0, -1) : name;
}

/**
 * Get consonants from loaded glyphs (those in Letters category with signs property)
 */
function getConsonants(glyphs: Glyph[]): Glyph[] {
  return glyphs.filter(g =>
    g.category === 'Letters' &&
    g.signs &&
    g.signs.length > 0
  );
}

/**
 * Generate base glyph entries
 */
export function generateBaseGlyphs(level: GlyphsetLevel = 1, namespace: string = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);

  return consonants.map(c => ({
    name: c.name,
    fullName: `${c.name}-${namespace}`,
    type: 'base' as GeneratedGlyphType,
    sequence: String.fromCodePoint(c.unicode || 0),
    components: [c.name],
  }));
}

/**
 * Generate consonant + sign combinations
 */
export function generateConsonantSignCombinations(level: GlyphsetLevel = 1, namespace: string = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const combinations: GeneratedGlyph[] = [];

  for (const consonant of consonants) {
    if (!consonant.signs) continue;

    const baseChar = String.fromCodePoint(consonant.unicode || 0);

    for (const signName of consonant.signs) {
      // Skip rephSign as it's a prefix, not suffix
      if (signName === 'rephSign') continue;

      const suffix = SIGN_SUFFIX_MAP[signName];
      if (suffix === undefined) continue;

      const signSequence = SIGN_SEQUENCE_MAP[signName];
      if (!signSequence) continue;

      // Generate name: drop trailing 'a' and add suffix
      const baseName = dropTrailingA(consonant.name);
      const name = suffix ? baseName + suffix : baseName;

      // Determine type
      let type: GeneratedGlyphType = 'consonant-sign';
      if (signName === 'raSign') {
        type = 'rakaransaya';
      }

      combinations.push({
        name,
        fullName: `${name}-${namespace}`,
        type,
        sequence: baseChar + signSequence,
        components: [consonant.name, signName],
      });
    }
  }

  return combinations;
}

/**
 * Generate ligated conjuncts from YAML conjunct property
 */
export function generateConjuncts(level: GlyphsetLevel = 1, namespace: string = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const conjuncts: GeneratedGlyph[] = [];

  // Create a map for quick lookup
  const consonantMap = new Map<string, Glyph>();
  for (const c of consonants) {
    consonantMap.set(c.name, c);
  }

  for (const consonant of consonants) {
    if (!consonant.conjunct) continue;

    const firstChar = String.fromCodePoint(consonant.unicode || 0);

    for (const secondName of consonant.conjunct) {
      const second = consonantMap.get(secondName);
      if (!second) continue;

      const secondChar = String.fromCodePoint(second.unicode || 0);

      // Generate name: drop 'a' from first, capitalize second
      const baseName = dropTrailingA(consonant.name);
      const secondCapitalized = secondName.charAt(0).toUpperCase() + secondName.slice(1);
      const name = baseName + secondCapitalized;

      // Sequence: first + al-lakuna + ZWJ + second
      const sequence = firstChar + AL_LAKUNA + ZWJ + secondChar;

      conjuncts.push({
        name,
        fullName: `${name}-${namespace}`,
        type: 'conjunct',
        sequence,
        components: [consonant.name, 'alSign', 'zwj', secondName],
      });
    }
  }

  return conjuncts;
}

/**
 * Generate conjunct + sign combinations
 */
export function generateConjunctSignCombinations(level: GlyphsetLevel = 1, namespace: string = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const combinations: GeneratedGlyph[] = [];

  const consonantMap = new Map<string, Glyph>();
  for (const c of consonants) {
    consonantMap.set(c.name, c);
  }

  for (const consonant of consonants) {
    if (!consonant.conjunct) continue;

    const firstChar = String.fromCodePoint(consonant.unicode || 0);

    for (const secondName of consonant.conjunct) {
      const second = consonantMap.get(secondName);
      if (!second || !second.signs) continue;

      const secondChar = String.fromCodePoint(second.unicode || 0);
      const conjunctSequence = firstChar + AL_LAKUNA + ZWJ + secondChar;

      // Base conjunct name
      const conjunctBaseName = dropTrailingA(consonant.name) +
        secondName.charAt(0).toUpperCase() + secondName.slice(1);

      // Generate combinations with signs from the second consonant
      for (const signName of second.signs) {
        if (signName === 'rephSign') continue;

        const suffix = SIGN_SUFFIX_MAP[signName];
        if (suffix === undefined) continue;

        const signSequence = SIGN_SEQUENCE_MAP[signName];
        if (!signSequence) continue;

        const name = suffix ? dropTrailingA(conjunctBaseName) + suffix : dropTrailingA(conjunctBaseName);

        let type: GeneratedGlyphType = 'conjunct-sign';
        if (signName === 'raSign') {
          type = 'rakaransaya';
        }

        combinations.push({
          name,
          fullName: `${name}-${namespace}`,
          type,
          sequence: conjunctSequence + signSequence,
          components: [consonant.name, 'alSign', 'zwj', secondName, signName],
        });
      }
    }
  }

  return combinations;
}

/**
 * Generate touching clusters from YAML touch property
 */
export function generateTouchingClusters(level: GlyphsetLevel = 1, namespace: string = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const clusters: GeneratedGlyph[] = [];

  const consonantMap = new Map<string, Glyph>();
  for (const c of consonants) {
    consonantMap.set(c.name, c);
  }

  for (const consonant of consonants) {
    if (!consonant.touch) continue;

    const firstChar = String.fromCodePoint(consonant.unicode || 0);

    for (const secondName of consonant.touch) {
      const second = consonantMap.get(secondName);
      if (!second) continue;

      const secondChar = String.fromCodePoint(second.unicode || 0);

      // Generate name with Touch suffix
      const baseName = dropTrailingA(consonant.name);
      const secondCapitalized = secondName.charAt(0).toUpperCase() + secondName.slice(1);
      const name = baseName + secondCapitalized + 'Touch';

      // Sequence: first + ZWJ + al-lakuna + second (different from conjunct!)
      const sequence = firstChar + ZWJ + AL_LAKUNA + secondChar;

      clusters.push({
        name,
        fullName: `${name}-${namespace}`,
        type: 'touching-cluster',
        sequence,
        components: [consonant.name, 'zwj', 'alSign', secondName],
      });
    }
  }

  return clusters;
}

/**
 * Generate all glyphs including all combinations
 */
export function generateAllGlyphs(level: GlyphsetLevel = 1, namespace: string = 'sinh'): GeneratedGlyph[] {
  return [
    ...generateBaseGlyphs(level, namespace),
    ...generateConsonantSignCombinations(level, namespace),
    ...generateConjuncts(level, namespace),
    ...generateConjunctSignCombinations(level, namespace),
    ...generateTouchingClusters(level, namespace),
  ];
}

/**
 * Get counts of each generated glyph type
 */
export function getGeneratedCounts(level: GlyphsetLevel = 1, namespace: string = 'sinh'): Record<string, number> {
  const base = generateBaseGlyphs(level, namespace).length;
  const consonantSign = generateConsonantSignCombinations(level, namespace).length;
  const conjuncts = generateConjuncts(level, namespace).length;
  const conjunctSign = generateConjunctSignCombinations(level, namespace).length;
  const touching = generateTouchingClusters(level, namespace).length;

  return {
    base,
    consonantSign,
    conjuncts,
    conjunctSign,
    touchingClusters: touching,
    total: base + consonantSign + conjuncts + conjunctSign + touching,
  };
}

// ============================================================================
// COMPLETE GENERATION - All possible combinations (like the glyph chart)
// ============================================================================

/** All vowel marks for complete generation */
const ALL_VOWEL_MARKS = [
  { char: '', name: '', suffix: 'a' },        // Inherent vowel (base form)
  { char: 'ා', name: 'aaSign', suffix: 'aa' },
  { char: 'ැ', name: 'aeSign', suffix: 'ae' },
  { char: 'ෑ', name: 'aaeSign', suffix: 'aae' },
  { char: 'ි', name: 'iSign', suffix: 'i' },
  { char: 'ී', name: 'iiSign', suffix: 'ii' },
  { char: 'ු', name: 'uSign', suffix: 'u' },
  { char: 'ූ', name: 'uuSign', suffix: 'uu' },
  { char: 'ෘ', name: 'ruSign', suffix: 'ru' },
  { char: 'ෙ', name: 'eSign', suffix: 'e' },
  { char: 'ේ', name: 'eeSign', suffix: 'ee' },
  { char: 'ෛ', name: 'aiSign', suffix: 'ai' },
  { char: 'ො', name: 'oSign', suffix: 'o' },
  { char: 'ෝ', name: 'ooSign', suffix: 'oo' },
  { char: 'ෞ', name: 'auSign', suffix: 'au' },
  { char: 'ෟ', name: 'ruuSign', suffix: 'ruu' },
  { char: '්', name: 'alSign', suffix: '' },   // Virama (pure consonant)
];

/** All 41 consonants */
const ALL_CONSONANTS = [
  { char: 'ක', name: 'ka' },
  { char: 'ඛ', name: 'kha' },
  { char: 'ග', name: 'ga' },
  { char: 'ඝ', name: 'gha' },
  { char: 'ඞ', name: 'ngga' },
  { char: 'ඟ', name: 'nnga' },
  { char: 'ච', name: 'ca' },
  { char: 'ඡ', name: 'cha' },
  { char: 'ජ', name: 'ja' },
  { char: 'ඣ', name: 'jha' },
  { char: 'ඤ', name: 'nya' },
  { char: 'ඥ', name: 'jnya' },
  { char: 'ඦ', name: 'nyja' },
  { char: 'ට', name: 'tta' },
  { char: 'ඨ', name: 'ttha' },
  { char: 'ඩ', name: 'dda' },
  { char: 'ඪ', name: 'ddha' },
  { char: 'ණ', name: 'nna' },
  { char: 'ඬ', name: 'nndda' },
  { char: 'ත', name: 'ta' },
  { char: 'ථ', name: 'tha' },
  { char: 'ද', name: 'da' },
  { char: 'ධ', name: 'dha' },
  { char: 'න', name: 'na' },
  { char: 'ඳ', name: 'nda' },
  { char: 'ප', name: 'pa' },
  { char: 'ඵ', name: 'pha' },
  { char: 'බ', name: 'ba' },
  { char: 'භ', name: 'bha' },
  { char: 'ම', name: 'ma' },
  { char: 'ඹ', name: 'mba' },
  { char: 'ය', name: 'ya' },
  { char: 'ර', name: 'ra' },
  { char: 'ල', name: 'la' },
  { char: 'ව', name: 'va' },
  { char: 'ශ', name: 'sha' },
  { char: 'ෂ', name: 'ssa' },
  { char: 'ස', name: 'sa' },
  { char: 'හ', name: 'ha' },
  { char: 'ළ', name: 'lla' },
  { char: 'ෆ', name: 'fa' },
];

/** Conjunct pairs from the chart definitions */
const CONJUNCT_PAIRS = [
  ['ක', 'ව'], ['ක', 'ෂ'],
  ['ත', 'ථ'], ['ත', 'ව'],
  ['න', 'ථ'], ['න', 'ද'], ['න', 'ධ'], ['න', 'ව'],
  ['ග', 'ධ'],
  ['ට', 'ඨ'],
  ['ද', 'ධ'], ['ද', 'ව'],
  ['ඞ', 'ග'],
  ['ච', 'ච'],
  ['ඤ', 'ච'], ['ඤ', 'ඡ'], ['ඤ', 'ජ'],
  ['ණ', 'ඩ'],
  ['බ', 'බ'],
  ['ම', 'බ'],
];

/** Touching cluster pairs from the chart definitions */
const TOUCHING_PAIRS = [
  ['ක', 'ක'], ['ක', 'ඛ'], ['ක', 'ත'], ['ක', 'ම'], ['ක', 'න'],
  ['ග', 'ග'], ['ග', 'ඝ'],
  ['ඞ', 'ඞ'], ['ඞ', 'ක'], ['ඞ', 'ග'], ['ඞ', 'ඝ'],
  ['ච', 'ච'], ['ච', 'ඡ'],
  ['ජ', 'ජ'], ['ජ', 'ඣ'],
  ['ඤ', 'ච'], ['ඤ', 'ඤ'],
  ['ට', 'ට'], ['ට', 'ඨ'],
  ['ඩ', 'ඩ'], ['ඩ', 'ඪ'],
  ['ණ', 'ණ'], ['ණ', 'ඩ'], ['ණ', 'ඨ'], ['ණ', 'හ'],
  ['ත', 'ත'], ['ත', 'ථ'], ['ත', 'ම'], ['ත', 'ව'],
  ['ද', 'ද'], ['ද', 'ධ'], ['ද', 'ව'],
  ['න', 'න'], ['න', 'ට'], ['න', 'ත'], ['න', 'ද'], ['න', 'ධ'], ['න', 'ථ'], ['න', 'ව'], ['න', 'හ'],
  ['ප', 'ප'], ['ප', 'ත'], ['ප', 'ඵ'], ['ප', 'බ'], ['ප', 'ද'], ['ප', 'හ'],
  ['බ', 'බ'], ['බ', 'ද'], ['බ', 'භ'],
  ['ම', 'ම'], ['ම', 'හ'], ['ම', 'ඵ'], ['ම', 'බ'], ['ම', 'ව'], ['ම', 'ප'], ['ම', 'ද'], ['ම', 'භ'],
  ['ල', 'ල'], ['ල', 'ව'],
  ['ව', 'හ'],
  ['ශ', 'ට'],
  ['ස', 'ස'], ['ස', 'ත'], ['ස', 'ව'],
  ['හ', 'ම'],
];

/** Map consonant char to name */
const CONSONANT_CHAR_MAP = new Map(ALL_CONSONANTS.map(c => [c.char, c.name]));

/**
 * Generate ALL consonant + vowel mark combinations (complete set)
 */
export function generateCompleteConsonantCombinations(namespace: string = 'sinh'): GeneratedGlyph[] {
  const combinations: GeneratedGlyph[] = [];

  for (const consonant of ALL_CONSONANTS) {
    for (const vowel of ALL_VOWEL_MARKS) {
      const baseName = dropTrailingA(consonant.name);
      const name = vowel.suffix ? baseName + vowel.suffix : baseName;

      combinations.push({
        name,
        fullName: `${name}-${namespace}`,
        type: vowel.suffix === 'a' ? 'base' : 'consonant-sign',
        sequence: consonant.char + vowel.char,
        components: vowel.name ? [consonant.name, vowel.name] : [consonant.name],
      });
    }
  }

  return combinations;
}

/**
 * Generate ALL conjunct + vowel mark combinations (complete set)
 */
export function generateCompleteConjunctCombinations(namespace: string = 'sinh'): GeneratedGlyph[] {
  const combinations: GeneratedGlyph[] = [];

  for (const [first, second] of CONJUNCT_PAIRS) {
    const firstName = CONSONANT_CHAR_MAP.get(first) || first;
    const secondName = CONSONANT_CHAR_MAP.get(second) || second;

    const conjunctBase = dropTrailingA(firstName) + secondName.charAt(0).toUpperCase() + secondName.slice(1);
    const conjunctSequence = first + AL_LAKUNA + ZWJ + second;

    for (const vowel of ALL_VOWEL_MARKS) {
      const baseName = dropTrailingA(conjunctBase);
      const name = vowel.suffix ? baseName + vowel.suffix : baseName;

      combinations.push({
        name,
        fullName: `${name}-${namespace}`,
        type: vowel.suffix === 'a' ? 'conjunct' : 'conjunct-sign',
        sequence: conjunctSequence + vowel.char,
        components: vowel.name ? [firstName, 'alSign', 'zwj', secondName, vowel.name] : [firstName, 'alSign', 'zwj', secondName],
      });
    }
  }

  return combinations;
}

/**
 * Generate ALL rakaransaya + vowel mark combinations (complete set)
 */
export function generateCompleteRakaransayaCombinations(namespace: string = 'sinh'): GeneratedGlyph[] {
  const combinations: GeneratedGlyph[] = [];
  const rakaransaya = '්‍ර';

  // Consonant + rakaransaya + all vowels
  for (const consonant of ALL_CONSONANTS) {
    const raBase = dropTrailingA(consonant.name) + 'ra';
    const raSequence = consonant.char + rakaransaya;

    for (const vowel of ALL_VOWEL_MARKS) {
      // Skip inherent 'a' for rakaransaya (it already ends in 'a')
      if (vowel.suffix === 'a') {
        combinations.push({
          name: raBase,
          fullName: `${raBase}-${namespace}`,
          type: 'rakaransaya',
          sequence: raSequence,
          components: [consonant.name, 'raSign'],
        });
      } else {
        const baseName = dropTrailingA(raBase);
        const name = vowel.suffix ? baseName + vowel.suffix : baseName;

        combinations.push({
          name,
          fullName: `${name}-${namespace}`,
          type: 'rakaransaya-sign',
          sequence: raSequence + vowel.char,
          components: [consonant.name, 'raSign', vowel.name],
        });
      }
    }
  }

  // Conjunct + rakaransaya + all vowels
  for (const [first, second] of CONJUNCT_PAIRS) {
    const firstName = CONSONANT_CHAR_MAP.get(first) || first;
    const secondName = CONSONANT_CHAR_MAP.get(second) || second;

    const conjunctBase = dropTrailingA(firstName) + secondName.charAt(0).toUpperCase() + secondName.slice(1);
    const conjunctSequence = first + AL_LAKUNA + ZWJ + second;
    const raBase = dropTrailingA(conjunctBase) + 'ra';
    const raSequence = conjunctSequence + rakaransaya;

    for (const vowel of ALL_VOWEL_MARKS) {
      if (vowel.suffix === 'a') {
        combinations.push({
          name: raBase,
          fullName: `${raBase}-${namespace}`,
          type: 'rakaransaya',
          sequence: raSequence,
          components: [firstName, 'alSign', 'zwj', secondName, 'raSign'],
        });
      } else {
        const baseName = dropTrailingA(raBase);
        const name = vowel.suffix ? baseName + vowel.suffix : baseName;

        combinations.push({
          name,
          fullName: `${name}-${namespace}`,
          type: 'rakaransaya-sign',
          sequence: raSequence + vowel.char,
          components: [firstName, 'alSign', 'zwj', secondName, 'raSign', vowel.name],
        });
      }
    }
  }

  return combinations;
}

/**
 * Generate ALL touching cluster + vowel mark combinations (complete set)
 */
export function generateCompleteTouchingCombinations(namespace: string = 'sinh'): GeneratedGlyph[] {
  const combinations: GeneratedGlyph[] = [];

  for (const [first, second] of TOUCHING_PAIRS) {
    const firstName = CONSONANT_CHAR_MAP.get(first) || first;
    const secondName = CONSONANT_CHAR_MAP.get(second) || second;

    const touchBase = dropTrailingA(firstName) + secondName.charAt(0).toUpperCase() + secondName.slice(1) + 'Touch';
    const touchSequence = first + ZWJ + AL_LAKUNA + second;

    for (const vowel of ALL_VOWEL_MARKS) {
      const baseName = dropTrailingA(touchBase);
      const name = vowel.suffix ? baseName + vowel.suffix : baseName;

      combinations.push({
        name,
        fullName: `${name}-${namespace}`,
        type: vowel.suffix === 'a' ? 'touching-cluster' : 'touching-cluster-sign',
        sequence: touchSequence + vowel.char,
        components: vowel.name ? [firstName, 'zwj', 'alSign', secondName, vowel.name] : [firstName, 'zwj', 'alSign', secondName],
      });
    }
  }

  return combinations;
}

/**
 * Generate ALL possible glyph combinations (complete set like the chart)
 */
export function generateCompleteGlyphs(namespace: string = 'sinh'): GeneratedGlyph[] {
  return [
    ...generateCompleteConsonantCombinations(namespace),
    ...generateCompleteConjunctCombinations(namespace),
    ...generateCompleteRakaransayaCombinations(namespace),
    ...generateCompleteTouchingCombinations(namespace),
  ];
}

/**
 * Get counts for complete generation
 */
export function getCompleteGeneratedCounts(namespace: string = 'sinh'): Record<string, number> {
  const consonants = generateCompleteConsonantCombinations(namespace).length;
  const conjuncts = generateCompleteConjunctCombinations(namespace).length;
  const rakaransaya = generateCompleteRakaransayaCombinations(namespace).length;
  const touching = generateCompleteTouchingCombinations(namespace).length;

  return {
    consonantCombinations: consonants,
    conjunctCombinations: conjuncts,
    rakaransayaCombinations: rakaransaya,
    touchingCombinations: touching,
    total: consonants + conjuncts + rakaransaya + touching,
  };
}
