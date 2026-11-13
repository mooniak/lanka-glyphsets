/**
 * Type definitions for Lanka Glyphsets
 */

/**
 * Script a glyphset describes.
 */
export type Script = 'sinhala' | 'tamil';

/**
 * Glyphset level. Sinhala: 0=kernel, 1=core, 2=plus, 3=pro. Tamil: 0=kernel,
 * 1=core, 2=pro (no level 3).
 */
export type GlyphsetLevel = 0 | 1 | 2 | 3;

/**
 * Raw YAML glyph metadata as it appears in the definition files
 */
export interface GlyphMetadata {
  unicode?: string | number;
  decompose?: string[];
  signs?: string[];
  conjunct?: string[];
  touch?: string[];
}

/**
 * Raw YAML glyphset definition structure
 */
export interface GlyphsetDefinition {
  languages: string[];
  description: string;
  namespace: string;
  'Exclude namespace from'?: string[];
  categories: Record<string, Record<string, GlyphMetadata | null>>;
  /**
   * Shape groups (Tamil): sign -> group -> consonants. The sign alternate for a
   * group is named `<sign>.<group>` (e.g. isign.ka). Each tier file lists only
   * the groups it introduces.
   */
  groups?: Record<string, Record<string, string[]>>;
  /** Grantha letters (Tamil), by glyph name. */
  grantha?: string[];
}

/**
 * Processed glyph representation
 */
export interface Glyph {
  /** Short name (e.g., "ka", "ki") */
  name: string;
  /** Full name with namespace (e.g., "sinh.ka") */
  fullName: string;
  /** Unicode codepoint as number */
  unicode?: number;
  /** Category from YAML definition */
  category: string;
  /** Glyphset level this glyph belongs to */
  level: GlyphsetLevel;
  /** Component glyphs for composite forms */
  decompose?: string[];
  /** Applicable vowel signs */
  signs?: string[];
  /** Consonants this can form conjuncts with */
  conjunct?: string[];
  /** Consonants this can form touching clusters with */
  touch?: string[];
  /**
   * Tamil: another way to meet this consonant + sign form — the shape-group
   * alternate of the sign, as a bare name (e.g. "isign.ka"). The form is met by
   * its own glyph OR by this alternate.
   */
  alternate?: string;
  /** Tamil sign alternates: the sign this is an alternate of (e.g. "isign"). */
  variantOf?: string;
  /** Tamil sign alternates: the consonants the alternate is drawn for. */
  group?: string[];
  /** Tamil: true for a Grantha letter. */
  grantha?: boolean;
}

/**
 * Options for loading glyphsets
 */
export interface LoadOptions {
  /** Include namespace prefix in glyph names */
  includeNamespace?: boolean;
  /** Glyphset level to load (cumulative) */
  level?: GlyphsetLevel;
  /** Filter by category */
  category?: string;
}

/**
 * Output format options
 */
export interface OutputOptions {
  /** Output format */
  format?: 'txt' | 'json';
  /** Include namespace prefix */
  includeNamespace?: boolean;
}

/**
 * Type of generated glyph
 */
export type GeneratedGlyphType =
  | 'base'
  | 'consonant-sign'
  | 'conjunct'
  | 'conjunct-sign'
  | 'touching-cluster'
  | 'touching-cluster-sign'
  | 'rakaransaya'
  | 'rakaransaya-sign';

/**
 * Generated glyph representation (for programmatically created glyphs)
 */
export interface GeneratedGlyph {
  /** Short name (e.g., "kVa", "kKaTouch") */
  name: string;
  /** Full name with namespace (e.g., "kVa-sinh") */
  fullName: string;
  /** Type of generated glyph */
  type: GeneratedGlyphType;
  /** Unicode sequence for this glyph */
  sequence: string;
  /** Component Unicode characters */
  components: string[];
  /** Other spellings that form the same glyph (e.g. Tamil ஸ்ரீ and ஶ்ரீ) */
  sequences?: string[];
  /** Tamil: the shape-group alternate that also meets this form, as a bare name */
  alternate?: string;
  /**
   * Tamil: true if the standard enumerates this name at the loaded level. A form
   * that is not enumerated needs no glyph of its own — its components suffice.
   */
  canonical?: boolean;
  /** Tamil: the lowest level (0 = Kernel) whose glyphset enumerates this name */
  level?: number;
}
