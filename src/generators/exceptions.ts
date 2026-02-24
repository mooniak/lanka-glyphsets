/**
 * Exception sets for special compound forms
 * Based on attested data by Pushpananda Ekanayake and Pathum Egodawatta
 */

/**
 * Consonants that cannot take rakaransaya (්‍ර)
 * These are either phonetically incompatible or not attested in usage
 */
export const RAKARANSAYA_EXCEPTIONS = new Set([
  'ඞ',   // ngga
  'ඟ',   // nnga
  'ඡ',   // cha
  'ජ',   // ja
  'ඤ',   // nya
  'ඥ',   // jnya
  'ඨ',   // ttha
  'ඪ',   // ddha
  'ණ',   // nna
  'ඬ',   // nndda
  'ථ',   // tha
  'න',   // na
  'ඳ',   // nda
  'ඵ',   // pha
  'ඹ',   // mba
  'ය',   // ya
  'ර',   // ra (cannot have double ra)
  'ල',   // la
  'ළ',   // lla
  'ඞ්‍ග', // ngga conjunct
]);

/**
 * Consonants/conjuncts that cannot take repaya (ර්‍)
 */
export const REPAYA_EXCEPTIONS = new Set([
  'ඤ',     // nya
  'ඬ',     // nndda
  'ර',     // ra
  'ක්‍ෂ',  // kSsa conjunct
  'ඞ්‍ග',  // nggGa conjunct
]);

/**
 * Consonants/conjuncts that cannot take yansaya (්‍ය)
 */
export const YANSAYA_EXCEPTIONS = new Set([
  'ඥ',     // jnya
  'ඹ',     // mba
  'ඤ්‍ජ',  // nyJa conjunct
]);

/**
 * Check if a consonant can take rakaransaya
 */
export function canTakeRakaransaya(char: string): boolean {
  return !RAKARANSAYA_EXCEPTIONS.has(char);
}

/**
 * Check if a consonant can take repaya
 */
export function canTakeRepaya(char: string): boolean {
  return !REPAYA_EXCEPTIONS.has(char);
}

/**
 * Check if a consonant can take yansaya
 */
export function canTakeYansaya(char: string): boolean {
  return !YANSAYA_EXCEPTIONS.has(char);
}
