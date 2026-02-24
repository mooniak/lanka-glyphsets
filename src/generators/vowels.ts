/**
 * Sinhala vowel sign (pillam) definitions
 * Based on attested data by Pushpananda Ekanayake and Pathum Egodawatta
 */

/** Vowel sign definition */
export interface VowelSignDef {
  char: string;
  name: string;
  /** Suffix used when combining with consonants (e.g., 'i' for ki, 'ii' for kii) */
  suffix: string;
}

/**
 * Vowel signs (pillam) in order
 * First entry is empty string representing inherent vowel 'a'
 */
export const VOWEL_SIGNS: VowelSignDef[] = [
  { char: '', name: 'inherent', suffix: 'a' },      // Inherent vowel (no sign)
  { char: 'ා', name: 'aaSign', suffix: 'aa' },      // aela-pilla
  { char: 'ැ', name: 'aeSign', suffix: 'ae' },      // aeda-pilla
  { char: 'ෑ', name: 'aaeSign', suffix: 'aae' },    // diga aeda-pilla
  { char: 'ි', name: 'iSign', suffix: 'i' },        // is-pilla
  { char: 'ී', name: 'iiSign', suffix: 'ii' },      // diga is-pilla
  { char: 'ු', name: 'uSign', suffix: 'u' },        // paa-pilla
  { char: 'ූ', name: 'uuSign', suffix: 'uu' },      // diga paa-pilla
  { char: 'ෘ', name: 'ruSign', suffix: 'ru' },      // gaetta-pilla
  { char: 'ෙ', name: 'eSign', suffix: 'e' },        // kombuwa
  { char: 'ේ', name: 'eeSign', suffix: 'ee' },      // diga kombuwa
  { char: 'ෛ', name: 'aiSign', suffix: 'ai' },      // kombu deka
  { char: 'ො', name: 'oSign', suffix: 'o' },        // kombuwa + aela-pilla
  { char: 'ෝ', name: 'ooSign', suffix: 'oo' },      // diga kombuwa + aela-pilla
  { char: 'ෞ', name: 'auSign', suffix: 'au' },      // kombuwa + gaetta-pilla
  { char: 'ෟ', name: 'ruuSign', suffix: 'ruu' },    // diga gaetta-pilla
  { char: '්', name: 'alSign', suffix: '' },        // al-lakuna (virama)
];

/** Special compound signs */
export const COMPOUND_SIGNS = {
  rakaransaya: '්‍ර',  // al + ZWJ + ra
  repaya: 'ර්‍',       // ra + al + ZWJ
  yansaya: '්‍ය',      // al + ZWJ + ya
};

/** Map from Unicode character to vowel sign */
export const VOWEL_SIGN_MAP = new Map<string, VowelSignDef>(
  VOWEL_SIGNS.filter(v => v.char).map(v => [v.char, v])
);

/** Map from sign name to vowel sign */
export const VOWEL_SIGN_NAME_MAP = new Map<string, VowelSignDef>(
  VOWEL_SIGNS.map(v => [v.name, v])
);

/** Get vowel sign suffix for consonant-vowel ligature naming */
export function getVowelSuffix(signName: string): string {
  return VOWEL_SIGN_NAME_MAP.get(signName)?.suffix ?? '';
}
