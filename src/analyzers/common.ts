/**
 * Pieces shared by the per-script text analyzers.
 */

export interface GlyphOccurrence {
  name: string;
  type: 'vowel' | 'consonant' | 'consonant-vowel' | 'pure-consonant' |
        'rakar' | 'yansaya' | 'conjunct' | 'sign' | 'punctuation' | 'space' |
        'number' | 'symbol' | 'control';
  sequence: string;
  /**
   * Tamil: the glyphs that make up a consonant + sign form when it has no glyph
   * of its own, e.g. kI → ['ka', 'isign'].
   */
  components?: string[];
  /**
   * Tamil: the shape-group alternate that also meets this form, as a bare name
   * (e.g. "isign.ka"). The form is met by its own glyph OR this alternate.
   */
  alternate?: string;
  /**
   * Tamil: true if the standard enumerates this name. A form that is not
   * enumerated (kAa) needs no glyph of its own: its components are enough.
   */
  canonical?: boolean;
  /** Tamil: the lowest level (0 = Kernel) whose glyphset enumerates this name. */
  level?: number;
}

/** Common punctuation → glyph name. */
export const PUNCTUATION: Record<string, string> = {
  '.': 'period', ',': 'comma', '!': 'exclam', '?': 'question',
  ':': 'colon', ';': 'semicolon', '"': 'quotedbl', "'": 'quotesingle',
  '(': 'parenleft', ')': 'parenright', '-': 'hyphen', '/': 'slash',
  '\\': 'backslash', '[': 'bracketleft', ']': 'bracketright',
  '_': 'underscore', '*': 'asterisk', '+': 'plus', '<': 'less',
  '>': 'greater', '=': 'equal', '#': 'numbersign', '%': 'percent',
};

export function isSpaceChar(char: string): boolean {
  return char === ' ' || char === '\n' || char === '\t' || char === ' ';
}
