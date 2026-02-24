/**
 * Sinhala consonant definitions
 * Based on attested data by Pushpananda Ekanayake and Pathum Egodawatta
 */

/** Consonant definition with Unicode character and glyph name */
export interface ConsonantDef {
  char: string;
  name: string;
}

/**
 * All 41 Sinhala consonants in Unicode order
 * Maps Unicode character to glyph name following naming convention
 */
export const CONSONANTS: ConsonantDef[] = [
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

/** Map from Unicode character to consonant definition */
export const CONSONANT_MAP = new Map<string, ConsonantDef>(
  CONSONANTS.map(c => [c.char, c])
);

/** Map from glyph name to consonant definition */
export const CONSONANT_NAME_MAP = new Map<string, ConsonantDef>(
  CONSONANTS.map(c => [c.name, c])
);

/** Get consonant name from Unicode character */
export function getConsonantName(char: string): string | undefined {
  return CONSONANT_MAP.get(char)?.name;
}

/** Get Unicode character from consonant name */
export function getConsonantChar(name: string): string | undefined {
  return CONSONANT_NAME_MAP.get(name)?.char;
}

/**
 * Drop trailing 'a' from consonant name to get base form
 * e.g., 'ka' -> 'k', 'tta' -> 'tt'
 */
export function dropTrailingA(name: string): string {
  return name.endsWith('a') ? name.slice(0, -1) : name;
}
