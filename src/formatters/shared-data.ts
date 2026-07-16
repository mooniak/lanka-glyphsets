/**
 * Shared-data formatter
 *
 * Emits the inventory data that the standalone browser tools (sinhala-glyph-chart,
 * glyphname-unicode-converter) need, derived from the YAML glyphsets so that the
 * YAML stays the single authored source of truth. Previously the chart tool
 * hand-maintained this same inventory (conjunct / touching-cluster maps) as a
 * separate copy that could drift.
 */

import type { Glyph } from '../types/index.js';

/** A [first, second] consonant pair, expressed as glyph names (e.g. ["ka","va"]). */
export type NamePair = [string, string];

export interface SharedData {
  /** Glyph name -> the single Sinhala character it represents (letters only). */
  letters: Record<string, string>;
  /** Ligated-conjunct pairs as glyph names, in YAML order. */
  conjunctPairs: NamePair[];
  /** Touching-cluster pairs as glyph names, in YAML order. */
  touchPairs: NamePair[];
  /** Ligated-conjunct map keyed by leading Sinhala character (chart-ready). */
  conjunctMap: Record<string, string[]>;
  /** Touching-cluster map keyed by leading Sinhala character (chart-ready). */
  touchingClusterMap: Record<string, string[]>;
}

/**
 * Build the shared inventory data from parsed glyphs (typically loaded
 * cumulatively up to level 3 so every consonant relationship is present).
 *
 * Throws if a conjunct/touch relationship references a glyph name that has no
 * single-codepoint character — that would mean the YAML is inconsistent and we
 * must not silently emit a partial map.
 */
export function buildSharedData(glyphs: Glyph[]): SharedData {
  // name -> Sinhala character, for every glyph that maps to a single codepoint.
  const letters: Record<string, string> = {};
  for (const g of glyphs) {
    if (g.unicode !== undefined) {
      letters[g.name] = String.fromCodePoint(g.unicode);
    }
  }

  const toChar = (name: string): string => {
    const ch = letters[name];
    if (ch === undefined) {
      throw new Error(
        `Cannot resolve glyph "${name}" to a character: it is referenced in a ` +
          `conjunct/touch relationship but has no unicode codepoint in the YAML.`
      );
    }
    return ch;
  };

  const conjunctPairs: NamePair[] = [];
  const touchPairs: NamePair[] = [];
  const conjunctMap: Record<string, string[]> = {};
  const touchingClusterMap: Record<string, string[]> = {};

  for (const g of glyphs) {
    if (g.conjunct?.length) {
      conjunctMap[toChar(g.name)] = g.conjunct.map(toChar);
      for (const second of g.conjunct) conjunctPairs.push([g.name, second]);
    }
    if (g.touch?.length) {
      touchingClusterMap[toChar(g.name)] = g.touch.map(toChar);
      for (const second of g.touch) touchPairs.push([g.name, second]);
    }
  }

  return { letters, conjunctPairs, touchPairs, conjunctMap, touchingClusterMap };
}

/** Serialize shared data as pretty-printed JSON. */
export function formatSharedDataAsJson(data: SharedData): string {
  return JSON.stringify(data, null, 2) + '\n';
}

/**
 * Serialize shared data as a browser+Node dual module: it assigns
 * `globalThis.LankaGlyphData` when loaded via a plain <script> tag, and sets
 * `module.exports` when required under Node. This mirrors how the existing
 * tool files (lankaglyphset-map.js, sinhala-definitions.js) are consumed.
 */
export function formatSharedDataAsJsModule(data: SharedData): string {
  const literal = JSON.stringify(data, null, 2);
  return `/*
 * lanka-glyph-data.js  — GENERATED, DO NOT EDIT BY HAND.
 * Regenerate with:  npm run build && node dist/cli/index.js export-json --format js -o <path>
 * Source of truth:  glyphsets/*.yaml
 */
(function (root) {
  "use strict";
  var DATA = ${literal};
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DATA;
  } else {
    root.LankaGlyphData = DATA;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
`;
}
