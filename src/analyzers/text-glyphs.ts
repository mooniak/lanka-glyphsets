/**
 * Text-to-glyph-names analyzer
 *
 * Parses Sinhala text and extracts the glyph names needed to render it,
 * following the Lanka Glyphsets naming convention.
 *
 * Cluster parsing rules:
 * - C + al + ZWJ + ra  → rakaransaya (e.g., tra, pra)
 * - C + al + ZWJ + ya  → yansaya (e.g., kya, dya)
 * - C + al + ZWJ + C   → ligated conjunct (e.g., kSsa, tTha)
 * - C + al (+ non-consonant) → pure consonant (e.g., k, t, n)
 * - C + vowelSign       → consonant-vowel ligature (e.g., ki, taa)
 * - C (bare)            → base consonant with inherent vowel (e.g., ka, ta)
 */

import { loadGlyphsetsCumulative } from '../core/parser.js';
import { VOWEL_SIGNS } from '../generators/vowels.js';

function dropTrailingA(name: string): string {
  return name.endsWith('a') ? name.slice(0, -1) : name;
}

// Build consonant lookup maps from YAML (level 3 = full coverage)
// Only include Letters in the consonant Unicode range (0x0D9A–0x0DC6)
const _consonantGlyphs = loadGlyphsetsCumulative(3).filter(
  g => g.category === 'Letters' && g.unicode !== undefined &&
       g.unicode >= 0x0D9A && g.unicode <= 0x0DC6
);

// Unicode codepoints
const AL_LAKUNA_CP = 0x0DCA;
const ZWJ_CP = 0x200D;
const ANUSVARA_CP = 0x0D82;
const VISARGA_CP = 0x0D83;

const CHAR_TO_CONSONANT = new Map<string, string>();
for (const g of _consonantGlyphs) {
  CHAR_TO_CONSONANT.set(String.fromCodePoint(g.unicode!), g.name);
}

const SIGN_CHAR_INFO = new Map<string, { name: string; suffix: string }>();
for (const v of VOWEL_SIGNS) {
  if (v.char) {
    SIGN_CHAR_INFO.set(v.char, { name: v.name, suffix: v.suffix });
  }
}

// Independent vowels (Unicode codepoint → glyph name)
const INDEPENDENT_VOWELS: Record<number, string> = {
  0x0D85: 'a', 0x0D86: 'aa', 0x0D87: 'ae', 0x0D88: 'aae',
  0x0D89: 'i', 0x0D8A: 'ii', 0x0D8B: 'u', 0x0D8C: 'uu',
  0x0D8D: 'vocalicr', 0x0D8E: 'vocalicrr',
  0x0D8F: 'vocalicl', 0x0D90: 'vocalicll',
  0x0D91: 'e', 0x0D92: 'ee', 0x0D93: 'ai',
  0x0D94: 'o', 0x0D95: 'oo', 0x0D96: 'au',
};

// Common punctuation
const PUNCTUATION: Record<string, string> = {
  '.': 'period', ',': 'comma', '!': 'exclam', '?': 'question',
  ':': 'colon', ';': 'semicolon', '"': 'quotedbl', "'": 'quotesingle',
  '(': 'parenleft', ')': 'parenright', '-': 'hyphen', '/': 'slash',
  '\\': 'backslash', '[': 'bracketleft', ']': 'bracketright',
  '_': 'underscore', '*': 'asterisk', '+': 'plus', '<': 'less',
  '>': 'greater', '=': 'equal', '#': 'numbersign', '%': 'percent',
};

function isConsonant(cp: number): boolean {
  return cp >= 0x0D9A && cp <= 0x0DC6;
}

function isIndependentVowel(cp: number): boolean {
  return cp >= 0x0D85 && cp <= 0x0D96;
}

function isVowelSign(cp: number): boolean {
  return (cp >= 0x0DCF && cp <= 0x0DDF) || cp === 0x0DF2 || cp === 0x0DF3;
}

export interface GlyphOccurrence {
  name: string;
  type: 'vowel' | 'consonant' | 'consonant-vowel' | 'pure-consonant' |
        'rakar' | 'yansaya' | 'conjunct' | 'sign' | 'punctuation' | 'space';
  sequence: string;
}

interface ClusterResult {
  occurrences: GlyphOccurrence[];
  nextIndex: number;
}

/**
 * Extract all glyph name occurrences from Sinhala text
 */
export function extractGlyphNames(text: string): GlyphOccurrence[] {
  const norm = text.normalize('NFC');
  const chars = [...norm];
  const occurrences: GlyphOccurrence[] = [];
  let i = 0;

  while (i < chars.length) {
    const char = chars[i];
    const cp = char.codePointAt(0)!;

    // Space
    if (char === ' ' || char === '\n' || char === '\t' || char === '\u00A0') {
      occurrences.push({ name: 'space', type: 'space', sequence: char });
      i++;
      continue;
    }

    // Independent vowel
    if (isIndependentVowel(cp)) {
      const name = INDEPENDENT_VOWELS[cp];
      if (name) {
        occurrences.push({ name, type: 'vowel', sequence: char });
      }
      i++;
      continue;
    }

    // Anusvara
    if (cp === ANUSVARA_CP) {
      occurrences.push({ name: 'anusvara', type: 'sign', sequence: char });
      i++;
      continue;
    }

    // Visarga
    if (cp === VISARGA_CP) {
      occurrences.push({ name: 'visarga', type: 'sign', sequence: char });
      i++;
      continue;
    }

    // Consonant — start of a syllable cluster
    if (isConsonant(cp)) {
      const result = parseConsonantCluster(chars, i);
      occurrences.push(...result.occurrences);
      i = result.nextIndex;
      continue;
    }

    // Punctuation
    if (PUNCTUATION[char]) {
      occurrences.push({ name: PUNCTUATION[char], type: 'punctuation', sequence: char });
      i++;
      continue;
    }

    // Skip unknown characters (ZWJ fragments, etc.)
    i++;
  }

  return occurrences;
}

/**
 * Parse a consonant cluster starting at the given index
 */
function parseConsonantCluster(chars: string[], startIndex: number): ClusterResult {
  let i = startIndex;
  const c1 = chars[i];
  const c1Name = CHAR_TO_CONSONANT.get(c1) || 'unknown';
  i++;

  if (i >= chars.length) {
    return bare(c1Name, c1, i);
  }

  const nextCp = chars[i].codePointAt(0)!;

  // Vowel sign on base consonant
  if (isVowelSign(nextCp)) {
    return consonantWithSign(c1Name, c1, chars, i);
  }

  // Al-lakuna
  if (nextCp === AL_LAKUNA_CP) {
    i++; // consume al-lakuna

    // Check for ZWJ → ligated conjunct / rakar / yansaya
    if (i < chars.length && chars[i].codePointAt(0) === ZWJ_CP) {
      i++; // consume ZWJ

      if (i < chars.length && isConsonant(chars[i].codePointAt(0)!)) {
        const c2 = chars[i];
        const c2Name = CHAR_TO_CONSONANT.get(c2) || 'unknown';
        i++;

        // Rakaransaya: C + al + ZWJ + ra
        if (c2Name === 'ra' && c1Name !== 'ra') {
          return finalizeWithOptionalSign(
            chars, i, dropTrailingA(c1Name) + 'Ra', 'rakar',
            c1 + '්\u200D' + c2
          );
        }

        // Yansaya: C + al + ZWJ + ya
        if (c2Name === 'ya') {
          return finalizeWithOptionalSign(
            chars, i, dropTrailingA(c1Name) + 'ya', 'yansaya',
            c1 + '්\u200D' + c2
          );
        }

        // Repaya: ra + al + ZWJ + C
        if (c1Name === 'ra') {
          const rephOcc: GlyphOccurrence = {
            name: 'repha', type: 'sign',
            sequence: c1 + '්\u200D'
          };
          // Continue parsing from c2 as the new base consonant
          const subResult = finalizeContinuation(chars, i, c2Name, c2);
          return {
            occurrences: [rephOcc, ...subResult.occurrences],
            nextIndex: subResult.nextIndex
          };
        }

        // Ligated conjunct: C1 + al + ZWJ + C2
        const conjunctBase = dropTrailingA(c1Name) +
          c2Name.charAt(0).toUpperCase() + c2Name.slice(1);
        const conjunctSeq = c1 + '්\u200D' + c2;

        // Check for further al + ZWJ + ra/ya on the conjunct
        if (i < chars.length && chars[i].codePointAt(0) === AL_LAKUNA_CP) {
          const savedI = i;
          i++; // consume al
          if (i < chars.length && chars[i].codePointAt(0) === ZWJ_CP) {
            i++; // consume ZWJ
            if (i < chars.length && isConsonant(chars[i].codePointAt(0)!)) {
              const c3 = chars[i];
              const c3Name = CHAR_TO_CONSONANT.get(c3) || 'unknown';
              i++;
              if (c3Name === 'ra') {
                // Conjunct + rakaransaya
                return finalizeWithOptionalSign(
                  chars, i, dropTrailingA(conjunctBase) + 'Ra', 'rakar',
                  conjunctSeq + '්\u200D' + c3
                );
              }
              if (c3Name === 'ya') {
                return finalizeWithOptionalSign(
                  chars, i, dropTrailingA(conjunctBase) + 'ya', 'yansaya',
                  conjunctSeq + '්\u200D' + c3
                );
              }
            }
          }
          // Not a further conjunct, treat conjunct + al as pure conjunct form
          return {
            occurrences: [{
              name: dropTrailingA(conjunctBase),
              type: 'conjunct',
              sequence: conjunctSeq + '්'
            }],
            nextIndex: i
          };
        }

        return finalizeWithOptionalSign(
          chars, i, conjunctBase, 'conjunct', conjunctSeq
        );
      }

      // ZWJ not followed by consonant — pure consonant
      return {
        occurrences: [{
          name: dropTrailingA(c1Name), type: 'pure-consonant',
          sequence: c1 + '්'
        }],
        nextIndex: i
      };
    }

    // Al-lakuna without ZWJ → pure consonant
    return {
      occurrences: [{
        name: dropTrailingA(c1Name), type: 'pure-consonant',
        sequence: c1 + '්'
      }],
      nextIndex: i
    };
  }

  // Bare consonant with inherent vowel
  return bare(c1Name, c1, i);
}

/**
 * Parse a continuation from a base consonant (used after repaya detection)
 */
function finalizeContinuation(
  chars: string[], i: number, baseName: string, baseChar: string
): ClusterResult {
  if (i >= chars.length) {
    return bare(baseName, baseChar, i);
  }

  const nextCp = chars[i].codePointAt(0)!;

  if (isVowelSign(nextCp)) {
    return consonantWithSign(baseName, baseChar, chars, i);
  }

  if (nextCp === AL_LAKUNA_CP) {
    i++;
    return {
      occurrences: [{
        name: dropTrailingA(baseName), type: 'pure-consonant',
        sequence: baseChar + '්'
      }],
      nextIndex: i
    };
  }

  return bare(baseName, baseChar, i);
}

/**
 * Finalize a cluster with an optional vowel sign or al-lakuna
 */
function finalizeWithOptionalSign(
  chars: string[], i: number, baseName: string,
  type: GlyphOccurrence['type'], seqSoFar: string
): ClusterResult {
  if (i >= chars.length) {
    return {
      occurrences: [{ name: baseName, type, sequence: seqSoFar }],
      nextIndex: i
    };
  }

  const nextCp = chars[i].codePointAt(0)!;

  // Vowel sign
  if (isVowelSign(nextCp)) {
    const signChar = chars[i];
    const info = SIGN_CHAR_INFO.get(signChar);
    i++;
    if (info && info.suffix) {
      const name = dropTrailingA(baseName) + info.suffix;
      return {
        occurrences: [{ name, type, sequence: seqSoFar + signChar }],
        nextIndex: i
      };
    }
  }

  // Al-lakuna (pure form)
  if (nextCp === AL_LAKUNA_CP) {
    i++;
    const name = dropTrailingA(baseName);
    return {
      occurrences: [{ name, type, sequence: seqSoFar + '්' }],
      nextIndex: i
    };
  }

  // Inherent vowel
  return {
    occurrences: [{ name: baseName, type, sequence: seqSoFar }],
    nextIndex: i
  };
}

/**
 * Bare consonant (inherent vowel)
 */
function bare(name: string, char: string, nextIndex: number): ClusterResult {
  return {
    occurrences: [{ name, type: 'consonant', sequence: char }],
    nextIndex
  };
}

/**
 * Consonant + vowel sign
 */
function consonantWithSign(
  consonantName: string, consonantChar: string,
  chars: string[], signIndex: number
): ClusterResult {
  const signChar = chars[signIndex];
  const info = SIGN_CHAR_INFO.get(signChar);
  const i = signIndex + 1;

  if (info) {
    const base = dropTrailingA(consonantName);
    const name = info.suffix ? base + info.suffix : base;
    return {
      occurrences: [{
        name,
        type: info.suffix ? 'consonant-vowel' : 'pure-consonant',
        sequence: consonantChar + signChar
      }],
      nextIndex: i
    };
  }

  // Unknown sign — treat as bare consonant
  return bare(consonantName, consonantChar, signIndex);
}

/**
 * Get unique glyph names from text, sorted by type then name
 */
export function getUniqueGlyphNames(text: string): { name: string; type: string }[] {
  const occurrences = extractGlyphNames(text);
  const seen = new Map<string, string>();

  for (const occ of occurrences) {
    if (!seen.has(occ.name)) {
      seen.set(occ.name, occ.type);
    }
  }

  const typeOrder: string[] = [
    'vowel', 'consonant', 'consonant-vowel', 'pure-consonant',
    'rakar', 'yansaya', 'conjunct', 'sign', 'punctuation', 'space'
  ];

  return Array.from(seen.entries())
    .map(([name, type]) => ({ name, type }))
    .sort((a, b) => {
      const aOrder = typeOrder.indexOf(a.type);
      const bOrder = typeOrder.indexOf(b.type);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
}

// Build set of valid consonant bases (consonant name with trailing 'a' dropped)
const VALID_CONSONANT_BASES = new Set<string>();
for (const g of _consonantGlyphs) {
  VALID_CONSONANT_BASES.add(dropTrailingA(g.name));
}

// Suffix list sorted longest-first for correct matching
// Exclude 'inherent' (suffix 'a') as it's the absence of a sign
const SORTED_SUFFIXES = VOWEL_SIGNS
  .filter(v => v.suffix && v.suffix !== '' && v.name !== 'inherent')
  .sort((a, b) => b.suffix.length - a.suffix.length)
  .map(v => ({ name: v.name, suffix: v.suffix }));

function matchSignSuffix(glyphName: string): string | null {
  for (const { name, suffix } of SORTED_SUFFIXES) {
    if (glyphName.endsWith(suffix)) {
      const base = glyphName.slice(0, -suffix.length);
      // Validate that the remaining base matches a known consonant base
      if (base.length > 0 && VALID_CONSONANT_BASES.has(base)) {
        return name;
      }
    }
  }
  return null;
}

/**
 * Match a sign suffix on a compound glyph name (rakar/yansaya/conjunct)
 * where the base includes a compound marker (e.g., 'r' for rakar, 'y' for yansaya)
 */
function matchCompoundSign(glyphName: string, marker: string): string | null {
  // Find the marker position — the compound base ends with the marker
  // e.g., "dri" → marker 'r' at pos 1, suffix 'i' after it
  for (const { name, suffix } of SORTED_SUFFIXES) {
    if (glyphName.endsWith(marker + suffix)) {
      return name;
    }
  }
  return null;
}

/**
 * Infer component sign glyphs needed based on occurrences
 */
export function getRequiredSigns(text: string): string[] {
  const occurrences = extractGlyphNames(text);
  const signs = new Set<string>();

  for (const occ of occurrences) {
    switch (occ.type) {
      case 'consonant-vowel': {
        const matched = matchSignSuffix(occ.name);
        if (matched) signs.add(matched);
        break;
      }
      case 'pure-consonant':
        signs.add('virama');
        break;
      case 'rakar': {
        signs.add('rasign');
        // Rakar names: base + 'Ra' (inherent) or base + 'R' + signSuffix
        if (!occ.name.endsWith('Ra')) {
          const rakarSign = matchCompoundSign(occ.name, 'R');
          if (rakarSign) signs.add(rakarSign);
        }
        break;
      }
      case 'yansaya': {
        signs.add('yasign');
        // Yansaya names: base + 'ya' (inherent) or base + 'y' + signSuffix
        if (!occ.name.endsWith('ya')) {
          const yaSign = matchCompoundSign(occ.name, 'y');
          if (yaSign) signs.add(yaSign);
        }
        break;
      }
      case 'sign':
        if (occ.name === 'repha') signs.add('repha');
        break;
    }
  }

  return Array.from(signs).sort();
}

/**
 * Infer component base consonant glyphs needed
 */
export function getRequiredBaseConsonants(text: string): string[] {
  const occurrences = extractGlyphNames(text);
  const bases = new Set<string>();

  for (const occ of occurrences) {
    if (occ.type === 'consonant') {
      bases.add(occ.name);
    } else if (occ.type === 'consonant-vowel' || occ.type === 'pure-consonant') {
      // Infer base consonant from ligature name
      for (const g of _consonantGlyphs) {
        const base = dropTrailingA(g.name);
        if (occ.name === base || occ.name.startsWith(base)) {
          bases.add(g.name);
          break;
        }
      }
    }
  }

  return Array.from(bases).sort();
}

/**
 * Format results as grouped text output
 */
export function formatGlyphAnalysis(text: string): string {
  const glyphs = getUniqueGlyphNames(text);
  const signs = getRequiredSigns(text);

  const groups = new Map<string, string[]>();
  for (const g of glyphs) {
    if (!groups.has(g.type)) {
      groups.set(g.type, []);
    }
    groups.get(g.type)!.push(g.name);
  }

  const typeLabels: Record<string, string> = {
    'vowel': 'Independent vowels',
    'consonant': 'Consonants (with inherent vowel)',
    'consonant-vowel': 'Consonant + vowel sign ligatures',
    'pure-consonant': 'Pure consonant forms (al-lakuna)',
    'rakar': 'Rakar forms (rakaransaya)',
    'yansaya': 'Yansaya forms',
    'conjunct': 'Ligated conjuncts',
    'sign': 'Signs',
    'punctuation': 'Punctuation',
    'space': 'Space',
  };

  const typeOrder = [
    'vowel', 'consonant', 'consonant-vowel', 'pure-consonant',
    'rakar', 'yansaya', 'conjunct', 'sign', 'punctuation', 'space'
  ];

  const lines: string[] = [];

  for (const type of typeOrder) {
    const names = groups.get(type);
    if (!names || names.length === 0) continue;

    lines.push(`# ${typeLabels[type] || type} (${names.length})`);
    for (const name of names) {
      lines.push(name);
    }
    lines.push('');
  }

  if (signs.length > 0) {
    lines.push(`# Required component signs (${signs.length})`);
    for (const s of signs) {
      lines.push(s);
    }
    lines.push('');
  }

  // Summary
  const total = glyphs.filter(g => g.type !== 'space').length;
  lines.push(`# Total unique glyphs: ${total}`);

  return lines.join('\n');
}
