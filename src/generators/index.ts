/**
 * Generators module — generates glyph combinations from YAML definitions.
 * YAML is the single source of truth. Consonants, conjuncts, and touching
 * clusters are all read from the glyphset YAML files.
 */

import { loadGlyphsetsCumulative } from '../core/parser.js';
import type { Glyph, GlyphsetLevel, GeneratedGlyph, GeneratedGlyphType } from '../types/index.js';

export { VOWEL_SIGNS, COMPOUND_SIGNS } from './vowels.js';

const AL_LAKUNA = '්';
const ZWJ = '\u200D';

/** Sign name → glyph name suffix */
const SIGN_SUFFIX_MAP: Record<string, string> = {
  virama:     '',    // pure consonant (drop trailing 'a', no suffix)
  aasign:     'aa',
  aesign:     'ae',
  aaesign:    'aae',
  isign:      'I',
  iisign:     'Ii',
  usign:      'U',
  uusign:     'Uu',
  esign:      'e',
  eesign:     'ee',
  osign:      'o',
  oosign:     'oo',
  aisign:     'ai',
  ausign:     'au',
  rasign:     'Ra',  // rakaransaya: kRa, nRa …
  repha:      '',    // repaya — prefix form, handled separately
  yasign:     'ya',  // yansaya
};

/** Sign name → Unicode character sequence */
const SIGN_SEQUENCE_MAP: Record<string, string> = {
  virama:     '්',
  aasign:     'ා',
  aesign:     'ැ',
  aaesign:    'ෑ',
  isign:      'ි',
  iisign:     'ී',
  usign:      'ු',
  uusign:     'ූ',
  esign:      'ෙ',
  eesign:     'ේ',
  osign:      'ො',
  oosign:     'ෝ',
  aisign:     'ෛ',
  ausign:     'ෞ',
  rasign:     '්‍ර',  // al + ZWJ + ra
  repha:      'ර්‍',  // ra + al + ZWJ
  yasign:     '්‍ය',  // al + ZWJ + ya
};

/** Drop trailing 'a' from a glyph name to get its base form */
function dropTrailingA(name: string): string {
  return name.endsWith('a') ? name.slice(0, -1) : name;
}

/** Return consonants from a loaded glyph list (Letters with a signs list) */
function getConsonants(glyphs: Glyph[]): Glyph[] {
  return glyphs.filter(g => g.category === 'Letters' && g.signs && g.signs.length > 0);
}

// ---------------------------------------------------------------------------
// YAML-driven generators
// ---------------------------------------------------------------------------

export function generateBaseGlyphs(level: GlyphsetLevel = 1, namespace = 'sinh'): GeneratedGlyph[] {
  const consonants = getConsonants(loadGlyphsetsCumulative(level));
  return consonants.map(c => ({
    name: c.name,
    fullName: `${c.name}-${namespace}`,
    type: 'base' as GeneratedGlyphType,
    sequence: String.fromCodePoint(c.unicode ?? 0),
    components: [c.name],
  }));
}

export function generateConsonantSignCombinations(level: GlyphsetLevel = 1, namespace = 'sinh'): GeneratedGlyph[] {
  const consonants = getConsonants(loadGlyphsetsCumulative(level));
  const result: GeneratedGlyph[] = [];

  for (const consonant of consonants) {
    if (!consonant.signs) continue;
    const baseChar = String.fromCodePoint(consonant.unicode ?? 0);

    for (const signName of consonant.signs) {
      if (signName === 'repha') continue;  // prefix form, not a suffix ligature

      const suffix = SIGN_SUFFIX_MAP[signName];
      const signSeq = SIGN_SEQUENCE_MAP[signName];
      if (suffix === undefined || !signSeq) continue;

      const base = dropTrailingA(consonant.name);
      const name = suffix ? base + suffix : base;
      const type: GeneratedGlyphType = signName === 'rasign' ? 'rakaransaya' : 'consonant-sign';

      result.push({
        name,
        fullName: `${name}-${namespace}`,
        type,
        sequence: baseChar + signSeq,
        components: [consonant.name, signName],
      });
    }
  }
  return result;
}

export function generateConjuncts(level: GlyphsetLevel = 1, namespace = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const consonantMap = new Map(consonants.map(c => [c.name, c]));
  const result: GeneratedGlyph[] = [];

  for (const consonant of consonants) {
    if (!consonant.conjunct) continue;
    const firstChar = String.fromCodePoint(consonant.unicode ?? 0);

    for (const secondName of consonant.conjunct) {
      const second = consonantMap.get(secondName);
      if (!second) continue;

      const name = dropTrailingA(consonant.name) +
        secondName.charAt(0).toUpperCase() + secondName.slice(1);

      result.push({
        name,
        fullName: `${name}-${namespace}`,
        type: 'conjunct',
        sequence: firstChar + AL_LAKUNA + ZWJ + String.fromCodePoint(second.unicode ?? 0),
        components: [consonant.name, 'virama', 'zwj', secondName],
      });
    }
  }
  return result;
}

export function generateConjunctSignCombinations(level: GlyphsetLevel = 1, namespace = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const consonantMap = new Map(consonants.map(c => [c.name, c]));
  const result: GeneratedGlyph[] = [];

  for (const consonant of consonants) {
    if (!consonant.conjunct) continue;
    const firstChar = String.fromCodePoint(consonant.unicode ?? 0);

    for (const secondName of consonant.conjunct) {
      const second = consonantMap.get(secondName);
      if (!second?.signs) continue;

      const secondChar = String.fromCodePoint(second.unicode ?? 0);
      const conjunctSeq = firstChar + AL_LAKUNA + ZWJ + secondChar;
      const conjunctBase = dropTrailingA(consonant.name) +
        secondName.charAt(0).toUpperCase() + secondName.slice(1);

      for (const signName of second.signs) {
        if (signName === 'repha') continue;

        const suffix = SIGN_SUFFIX_MAP[signName];
        const signSeq = SIGN_SEQUENCE_MAP[signName];
        if (suffix === undefined || !signSeq) continue;

        const base = dropTrailingA(conjunctBase);
        const name = suffix ? base + suffix : base;
        const type: GeneratedGlyphType = signName === 'rasign' ? 'rakaransaya' : 'conjunct-sign';

        result.push({
          name,
          fullName: `${name}-${namespace}`,
          type,
          sequence: conjunctSeq + signSeq,
          components: [consonant.name, 'virama', 'zwj', secondName, signName],
        });
      }
    }
  }
  return result;
}

export function generateTouchingClusters(level: GlyphsetLevel = 1, namespace = 'sinh'): GeneratedGlyph[] {
  const glyphs = loadGlyphsetsCumulative(level);
  const consonants = getConsonants(glyphs);
  const consonantMap = new Map(consonants.map(c => [c.name, c]));
  const result: GeneratedGlyph[] = [];

  for (const consonant of consonants) {
    if (!consonant.touch) continue;
    const firstChar = String.fromCodePoint(consonant.unicode ?? 0);

    for (const secondName of consonant.touch) {
      const second = consonantMap.get(secondName);
      if (!second) continue;

      const name = dropTrailingA(consonant.name) +
        secondName.charAt(0).toUpperCase() + secondName.slice(1) + 'Touch';

      result.push({
        name,
        fullName: `${name}-${namespace}`,
        type: 'touching-cluster',
        sequence: firstChar + ZWJ + AL_LAKUNA + String.fromCodePoint(second.unicode ?? 0),
        components: [consonant.name, 'zwj', 'virama', secondName],
      });
    }
  }
  return result;
}

export function generateAllGlyphs(level: GlyphsetLevel = 1, namespace = 'sinh'): GeneratedGlyph[] {
  return [
    ...generateBaseGlyphs(level, namespace),
    ...generateConsonantSignCombinations(level, namespace),
    ...generateConjuncts(level, namespace),
    ...generateConjunctSignCombinations(level, namespace),
    ...generateTouchingClusters(level, namespace),
  ];
}

export function getGeneratedCounts(level: GlyphsetLevel = 1, namespace = 'sinh'): Record<string, number> {
  const base          = generateBaseGlyphs(level, namespace).length;
  const consonantSign = generateConsonantSignCombinations(level, namespace).length;
  const conjuncts     = generateConjuncts(level, namespace).length;
  const conjunctSign  = generateConjunctSignCombinations(level, namespace).length;
  const touching      = generateTouchingClusters(level, namespace).length;
  return {
    base, consonantSign, conjuncts, conjunctSign,
    touchingClusters: touching,
    total: base + consonantSign + conjuncts + conjunctSign + touching,
  };
}
