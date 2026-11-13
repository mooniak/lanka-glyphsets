/**
 * Shared-data formatter
 *
 * Emits the inventory data that standalone browser tools need (the
 * sinhala-font-tools glyph-chart, this repo's glyphname-unicode-converter),
 * derived from the YAML glyphsets so that the YAML stays the single authored
 * source of truth. Previously the chart tool hand-maintained this same
 * inventory (conjunct / touching-cluster maps) as a separate copy that could
 * drift.
 */

import type { Glyph, Script } from '../types/index.js';

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
  /**
   * Tamil only: shape groups, sign -> group -> consonant names. The alternate
   * glyph for a group is `<sign>.<group>` (isign.ka → isign-taml.ka).
   */
  groups?: Record<string, Record<string, string[]>>;
  /** Tamil only: the Grantha letters, by glyph name. */
  grantha?: string[];
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

  const data: SharedData = { letters, conjunctPairs, touchPairs, conjunctMap, touchingClusterMap };

  // Shape groups and Grantha letters exist only in the Tamil glyphsets; leave the
  // keys out entirely otherwise so the Sinhala export is unchanged.
  const groups: Record<string, Record<string, string[]>> = {};
  for (const g of glyphs) {
    if (g.variantOf && g.group) {
      const groupName = g.name.slice(g.variantOf.length + 1);
      (groups[g.variantOf] ??= {})[groupName] = g.group;
    }
  }
  if (Object.keys(groups).length) data.groups = groups;
  const grantha = glyphs.filter(g => g.grantha).map(g => g.name);
  if (grantha.length) data.grantha = grantha;

  return data;
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
export function formatSharedDataAsJsModule(data: SharedData, script: Script = 'sinhala'): string {
  const literal = JSON.stringify(data, null, 2);
  const tamil = script === 'tamil';
  const file = tamil ? 'lanka-glyph-data-tamil.js' : 'lanka-glyph-data.js';
  const flag = tamil ? ' --script tamil' : '';
  const global = tamil ? 'LankaGlyphDataTamil' : 'LankaGlyphData';
  return `/*
 * ${file}  — GENERATED, DO NOT EDIT BY HAND.
 * Regenerate with:  npm run build && node dist/cli/index.js export-json${flag} --format js -o <path>
 * Source of truth:  glyphsets/*.yaml
 */
(function (root) {
  "use strict";
  var DATA = ${literal};
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DATA;
  } else {
    root.${global} = DATA;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
`;
}
