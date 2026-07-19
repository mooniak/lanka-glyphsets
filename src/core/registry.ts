/**
 * Glyph registry for storing and querying glyphs
 */

import type { Glyph, GlyphsetLevel } from '../types/index.js';
import { loadGlyphsetsCumulative } from './parser.js';

/**
 * Central registry for managing glyphs
 */
export class GlyphRegistry {
  private glyphs: Map<string, Glyph> = new Map();
  private byCategory: Map<string, Glyph[]> = new Map();
  private byLevel: Map<GlyphsetLevel, Glyph[]> = new Map();

  /**
   * Register a glyph in the registry
   */
  register(glyph: Glyph): void {
    this.glyphs.set(glyph.fullName, glyph);

    // Index by category
    if (!this.byCategory.has(glyph.category)) {
      this.byCategory.set(glyph.category, []);
    }
    this.byCategory.get(glyph.category)!.push(glyph);

    // Index by level
    if (!this.byLevel.has(glyph.level)) {
      this.byLevel.set(glyph.level, []);
    }
    this.byLevel.get(glyph.level)!.push(glyph);
  }

  /**
   * Register multiple glyphs
   */
  registerAll(glyphs: Glyph[]): void {
    for (const glyph of glyphs) {
      this.register(glyph);
    }
  }

  /**
   * Get a glyph by its full name
   */
  getByFullName(fullName: string): Glyph | undefined {
    return this.glyphs.get(fullName);
  }

  /**
   * Get all glyphs in a category
   */
  getByCategory(category: string): Glyph[] {
    return this.byCategory.get(category) || [];
  }

  /**
   * Get all glyphs at a specific level (non-cumulative)
   */
  getByLevel(level: GlyphsetLevel): Glyph[] {
    return this.byLevel.get(level) || [];
  }

  /**
   * Get all registered glyphs
   */
  getAll(): Glyph[] {
    return Array.from(this.glyphs.values());
  }

  /**
   * Get all glyph names (full names)
   */
  getAllNames(includeNamespace: boolean = true): string[] {
    return this.getAll().map(g => includeNamespace ? g.fullName : g.name);
  }

  /**
   * Get all category names
   */
  getCategories(): string[] {
    return Array.from(this.byCategory.keys());
  }

  /**
   * Get the number of registered glyphs
   */
  get size(): number {
    return this.glyphs.size;
  }

  /**
   * Clear the registry
   */
  clear(): void {
    this.glyphs.clear();
    this.byCategory.clear();
    this.byLevel.clear();
  }

  /**
   * Iterator support
   */
  *[Symbol.iterator](): IterableIterator<Glyph> {
    yield* this.glyphs.values();
  }
}

/**
 * Create a registry loaded with glyphs up to the specified level
 */
export function createRegistry(maxLevel: GlyphsetLevel = 1): GlyphRegistry {
  const registry = new GlyphRegistry();
  const glyphs = loadGlyphsetsCumulative(maxLevel);
  registry.registerAll(glyphs);
  return registry;
}
