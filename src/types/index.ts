/**
 * Type definitions for Lanka Glyphsets
 */

/**
 * Glyphset level (0=kernel, 1=core, 2=plus, 3=pro)
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
}
