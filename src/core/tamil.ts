/**
 * Tamil sign tables.
 *
 * The glyph inventory itself comes from glyphsets/tamil-*.yaml; this file holds
 * only what the naming rule needs on top of it: each sign's character and its
 * capital-letter abbreviation (docs/naming-standard.md, Tamil §4).
 */

export interface TamilSign {
  /** Sign glyph name, as in the YAML (e.g. "isign") */
  name: string;
  /** The Unicode character */
  char: string;
  /** Abbreviation used in consonant + sign names ('' for the virama) */
  suffix: string;
}

/** Virama (pulli) first, then the vowel signs in Unicode order. */
export const TAMIL_SIGNS: TamilSign[] = [
  { name: 'virama', char: '்', suffix: '' },
  { name: 'aasign', char: 'ா', suffix: 'Aa' },
  { name: 'isign', char: 'ி', suffix: 'I' },
  { name: 'iisign', char: 'ீ', suffix: 'Ii' },
  { name: 'usign', char: 'ு', suffix: 'U' },
  { name: 'uusign', char: 'ூ', suffix: 'Uu' },
  { name: 'esign', char: 'ெ', suffix: 'E' },
  { name: 'eesign', char: 'ே', suffix: 'Ee' },
  { name: 'aisign', char: 'ை', suffix: 'Ai' },
  { name: 'osign', char: 'ொ', suffix: 'O' },
  { name: 'oosign', char: 'ோ', suffix: 'Oo' },
  { name: 'ausign', char: 'ௌ', suffix: 'Au' },
];

export const TAMIL_VIRAMA = '்';
export const TAMIL_SIGN_BY_NAME = new Map(TAMIL_SIGNS.map(s => [s.name, s]));
export const TAMIL_SIGN_BY_CHAR = new Map(TAMIL_SIGNS.map(s => [s.char, s]));

/** Shared format-control and placeholder codepoints. */
export const ZWJ = '‍';
export const ZWNJ = '‌';
export const DOTTED_CIRCLE = '◌';

/** The name a consonant (or conjunct) gives its forms: `ka` → `k`, `kSsa` → `kSs`. */
export function tamilStem(name: string): string {
  return name.endsWith('a') ? name.slice(0, -1) : name;
}

/** Name of a consonant + sign form: (`ka`, `isign`) → `kI`; (`ka`, `virama`) → `k`. */
export function tamilFormName(consonant: string, signName: string): string {
  const sign = TAMIL_SIGN_BY_NAME.get(signName);
  if (!sign) throw new Error(`Unknown Tamil sign "${signName}"`);
  return tamilStem(consonant) + sign.suffix;
}

/** The Tamil consonants live in U+0B95–U+0BB9. */
export function isTamilConsonant(cp: number): boolean {
  return cp >= 0x0B95 && cp <= 0x0BB9;
}

/** Independent vowels U+0B85–U+0B94, plus the aytham U+0B83 (a letter). */
export function isTamilVowelLetter(cp: number): boolean {
  return (cp >= 0x0B85 && cp <= 0x0B94) || cp === 0x0B83;
}

/** Unicode Mn (nonspacing) signs in the Tamil block: ஂ ீ ். Every other sign is Mc. */
export const TAMIL_NONSPACING = new Set([0x0B82, 0x0BC0, 0x0BCD]);
