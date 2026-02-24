/**
 * Lanka Glyphsets
 *
 * Standardized glyph sets and tools for Sinhala font development
 */

// Export types
export type {
  Glyph,
  GlyphsetLevel,
  GlyphMetadata,
  GlyphsetDefinition,
  LoadOptions,
  OutputOptions,
  GeneratedGlyph,
  GeneratedGlyphType,
} from './types/index.js';

// Export core functionality
export {
  parseGlyphsetFile,
  parseGlyphs,
  loadGlyphset,
  loadGlyphsetsCumulative,
  getGlyphsetPath,
} from './core/parser.js';

export {
  GlyphRegistry,
  createRegistry,
} from './core/registry.js';

// Export formatters
export {
  formatAsTxt,
  formatNamesAsTxt,
  formatAsJson,
  formatGlyphsAsJson,
} from './formatters/txt.js';

// Export analyzers
export {
  extractGlyphNames,
  getUniqueGlyphNames,
  getRequiredSigns,
  getRequiredBaseConsonants,
  formatGlyphAnalysis,
} from './analyzers/text-glyphs.js';

// Export generators
export {
  CONSONANTS,
  VOWEL_SIGNS,
  generateAllGlyphs,
  generateBaseGlyphs,
  generateConsonantSignCombinations,
  generateConjuncts,
  generateConjunctSignCombinations,
  generateTouchingClusters,
  getGeneratedCounts,
} from './generators/index.js';
