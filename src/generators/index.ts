/**
 * Generators module — generates glyph combinations from YAML definitions.
 * YAML is the single source of truth. Consonants, conjuncts, and touching
 * clusters are all read from the glyphset YAML files.
 */

import { loadGlyphsetsCumulative } from '../core/parser.js';
import { SCRIPTS } from '../core/scripts.js';
import { TAMIL_SIGNS, TAMIL_SIGN_BY_NAME, TAMIL_VIRAMA } from '../core/tamil.js';
import type {
  Glyph, GlyphsetLevel, GeneratedGlyph, GeneratedGlyphType, Script,
} from '../types/index.js';

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

/** What differs between scripts when combining a consonant with a sign. */
interface GenConfig {
  namespace: string;
  /** Character that follows the first consonant of a ligated conjunct */
  virama: string;
  /** Joiner between virama and second consonant ('' where none is used) */
  joiner: string;
  /** Signs to combine with this consonant */
  signsFor(consonant: Glyph): string[];
  /** Glyph-name suffix for a sign, or undefined to skip it */
  suffix(sign: string): string | undefined;
  /** Unicode sequence for a sign, or undefined to skip it */
  sequence(sign: string): string | undefined;
}

function configFor(script: Script, namespace: string | undefined): GenConfig {
  const ns = namespace ?? SCRIPTS[script].namespace;
  if (script === 'tamil') {
    // Every Tamil consonant takes every sign, so the full consonant × sign grid
    // is generated, not only the signs listed under `signs:` (those are anchors).
    return {
      namespace: ns,
      virama: TAMIL_VIRAMA,
      joiner: '',
      signsFor: () => TAMIL_SIGNS.map(s => s.name),
      suffix: sign => TAMIL_SIGN_BY_NAME.get(sign)?.suffix,
      sequence: sign => TAMIL_SIGN_BY_NAME.get(sign)?.char,
    };
  }
  return {
    namespace: ns,
    virama: AL_LAKUNA,
    joiner: ZWJ,
    signsFor: consonant => consonant.signs ?? [],
    suffix: sign => SIGN_SUFFIX_MAP[sign],
    sequence: sign => SIGN_SEQUENCE_MAP[sign],
  };
}

/**
 * Tamil: record, for each generated glyph, whether the standard enumerates its
 * name and which shape-group alternate (if any) also meets it. Other scripts
 * are returned untouched.
 */
function decorate(
  generated: GeneratedGlyph[], glyphs: Glyph[], script: Script
): GeneratedGlyph[] {
  if (script !== 'tamil') return generated;
  const byName = new Map(glyphs.map(g => [g.name, g]));
  for (const g of generated) {
    const known = byName.get(g.name);
    g.canonical = known !== undefined;
    if (known) g.level = known.level;
    if (known?.alternate) g.alternate = known.alternate;
  }
  return generated;
}

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

export function generateBaseGlyphs(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): GeneratedGlyph[] {
  const cfg = configFor(script, namespace);
  const glyphs = loadGlyphsetsCumulative(level, script);
  const consonants = getConsonants(glyphs);
  return decorate(consonants.map(c => ({
    name: c.name,
    fullName: `${c.name}-${cfg.namespace}`,
    type: 'base' as GeneratedGlyphType,
    sequence: String.fromCodePoint(c.unicode ?? 0),
    components: [c.name],
  })), glyphs, script);
}

export function generateConsonantSignCombinations(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): GeneratedGlyph[] {
  const cfg = configFor(script, namespace);
  const glyphs = loadGlyphsetsCumulative(level, script);
  const consonants = getConsonants(glyphs);
  const result: GeneratedGlyph[] = [];

  for (const consonant of consonants) {
    if (!consonant.signs) continue;
    const baseChar = String.fromCodePoint(consonant.unicode ?? 0);

    for (const signName of cfg.signsFor(consonant)) {
      if (signName === 'repha') continue;  // prefix form, not a suffix ligature

      const suffix = cfg.suffix(signName);
      const signSeq = cfg.sequence(signName);
      if (suffix === undefined || !signSeq) continue;

      const base = dropTrailingA(consonant.name);
      const name = suffix ? base + suffix : base;
      const type: GeneratedGlyphType = signName === 'rasign' ? 'rakaransaya' : 'consonant-sign';

      result.push({
        name,
        fullName: `${name}-${cfg.namespace}`,
        type,
        sequence: baseChar + signSeq,
        components: [consonant.name, signName],
      });
    }
  }
  return decorate(result, glyphs, script);
}

export function generateConjuncts(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): GeneratedGlyph[] {
  const cfg = configFor(script, namespace);
  const glyphs = loadGlyphsetsCumulative(level, script);
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
        fullName: `${name}-${cfg.namespace}`,
        type: 'conjunct',
        sequence: firstChar + cfg.virama + cfg.joiner + String.fromCodePoint(second.unicode ?? 0),
        components: cfg.joiner
          ? [consonant.name, 'virama', 'zwj', secondName]
          : [consonant.name, 'virama', secondName],
      });
    }
  }

  // Tamil ஸ்ரீ is a four-character ligature that no `conjunct:` pair describes.
  if (script === 'tamil' && glyphs.some(g => g.name === 'shree')) {
    const spellings = ['\u0BB6', '\u0BB8'].map(c => c + cfg.virama + '\u0BB0\u0BC0');
    result.push({
      name: 'shree',
      fullName: `shree-${cfg.namespace}`,
      type: 'conjunct',
      sequence: spellings[0],
      sequences: spellings,
      components: ['sha', 'virama', 'ra', 'iisign'],
    });
  }
  return decorate(result, glyphs, script);
}

export function generateConjunctSignCombinations(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): GeneratedGlyph[] {
  const cfg = configFor(script, namespace);
  const glyphs = loadGlyphsetsCumulative(level, script);
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
      const conjunctSeq = firstChar + cfg.virama + cfg.joiner + secondChar;
      const conjunctBase = dropTrailingA(consonant.name) +
        secondName.charAt(0).toUpperCase() + secondName.slice(1);

      for (const signName of cfg.signsFor(second)) {
        if (signName === 'repha') continue;

        const suffix = cfg.suffix(signName);
        const signSeq = cfg.sequence(signName);
        if (suffix === undefined || !signSeq) continue;

        const base = dropTrailingA(conjunctBase);
        const name = suffix ? base + suffix : base;
        const type: GeneratedGlyphType = signName === 'rasign' ? 'rakaransaya' : 'conjunct-sign';

        result.push({
          name,
          fullName: `${name}-${cfg.namespace}`,
          type,
          sequence: conjunctSeq + signSeq,
          components: cfg.joiner
            ? [consonant.name, 'virama', 'zwj', secondName, signName]
            : [consonant.name, 'virama', secondName, signName],
        });
      }
    }
  }
  return decorate(result, glyphs, script);
}

export function generateTouchingClusters(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): GeneratedGlyph[] {
  const cfg = configFor(script, namespace);
  const glyphs = loadGlyphsetsCumulative(level, script);
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
        fullName: `${name}-${cfg.namespace}`,
        type: 'touching-cluster',
        sequence: firstChar + ZWJ + AL_LAKUNA + String.fromCodePoint(second.unicode ?? 0),
        components: [consonant.name, 'zwj', 'virama', secondName],
      });
    }
  }
  return decorate(result, glyphs, script);
}

export function generateAllGlyphs(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): GeneratedGlyph[] {
  return [
    ...generateBaseGlyphs(level, namespace, script),
    ...generateConsonantSignCombinations(level, namespace, script),
    ...generateConjuncts(level, namespace, script),
    ...generateConjunctSignCombinations(level, namespace, script),
    ...generateTouchingClusters(level, namespace, script),
  ];
}

export function getGeneratedCounts(
  level: GlyphsetLevel = 1, namespace?: string, script: Script = 'sinhala'
): Record<string, number> {
  const base          = generateBaseGlyphs(level, namespace, script).length;
  const consonantSign = generateConsonantSignCombinations(level, namespace, script).length;
  const conjuncts     = generateConjuncts(level, namespace, script).length;
  const conjunctSign  = generateConjunctSignCombinations(level, namespace, script).length;
  const touching      = generateTouchingClusters(level, namespace, script).length;
  return {
    base, consonantSign, conjuncts, conjunctSign,
    touchingClusters: touching,
    total: base + consonantSign + conjuncts + conjunctSign + touching,
  };
}
