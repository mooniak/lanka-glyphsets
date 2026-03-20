/**
 * Sinhala vowel sign (pillam) definitions
 * Character-level data needed for text parsing and Unicode sequence generation.
 */

export interface VowelSignDef {
  char: string;
  name: string;
  /** Suffix used in glyph naming (e.g. 'I' for isign → khI-sinh) */
  suffix: string;
}

/**
 * Vowel signs (pillam) with their Unicode characters, new-convention names, and naming suffixes.
 * First entry is the inherent vowel 'a' (no sign character).
 */
export const VOWEL_SIGNS: VowelSignDef[] = [
  { char: '',  name: 'inherent',     suffix: 'a'   }, // Inherent vowel (no sign)
  { char: 'ා', name: 'aasign',       suffix: 'aa'  }, // aela-pilla
  { char: 'ැ', name: 'aesign',       suffix: 'ae'  }, // aeda-pilla
  { char: 'ෑ', name: 'aaesign',      suffix: 'aae' }, // diga aeda-pilla
  { char: 'ි', name: 'isign',        suffix: 'I'   }, // is-pilla
  { char: 'ී', name: 'iisign',       suffix: 'Ii'  }, // diga is-pilla
  { char: 'ු', name: 'usign',        suffix: 'U'   }, // paa-pilla
  { char: 'ූ', name: 'uusign',       suffix: 'Uu'  }, // diga paa-pilla
  { char: 'ෘ', name: 'vocalicrsign', suffix: 'Ru'  }, // gaetta-pilla (vocalic r)
  { char: 'ෙ', name: 'esign',        suffix: 'e'   }, // kombuwa
  { char: 'ේ', name: 'eesign',       suffix: 'ee'  }, // diga kombuwa
  { char: 'ෛ', name: 'aisign',       suffix: 'ai'  }, // kombu deka
  { char: 'ො', name: 'osign',        suffix: 'o'   }, // kombuwa + aela-pilla
  { char: 'ෝ', name: 'oosign',       suffix: 'oo'  }, // diga kombuwa + aela-pilla
  { char: 'ෞ', name: 'ausign',       suffix: 'au'  }, // kombuwa + gaetta-pilla
  { char: 'ෟ', name: 'vocalicrrsign',suffix: 'Ruu' }, // diga gaetta-pilla (vocalic rr)
  { char: '්', name: 'virama',       suffix: ''    }, // al-lakuna
];

/** Special compound signs */
export const COMPOUND_SIGNS = {
  rakaransaya: '්‍ර',  // al + ZWJ + ra
  repaya:      'ර්‍',  // ra + al + ZWJ
  yansaya:     '්‍ය',  // al + ZWJ + ya
};

/** Map from Unicode character to vowel sign definition */
export const VOWEL_SIGN_MAP = new Map<string, VowelSignDef>(
  VOWEL_SIGNS.filter(v => v.char).map(v => [v.char, v])
);

/** Map from sign name to vowel sign definition */
export const VOWEL_SIGN_NAME_MAP = new Map<string, VowelSignDef>(
  VOWEL_SIGNS.map(v => [v.name, v])
);

/** Get the naming suffix for a given sign name */
export function getVowelSuffix(signName: string): string {
  return VOWEL_SIGN_NAME_MAP.get(signName)?.suffix ?? '';
}
