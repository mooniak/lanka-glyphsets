/**
 * Script registry: what differs between the scripts the standard covers.
 */

import type { GlyphsetLevel, Script } from '../types/index.js';

export interface ScriptDef {
  key: Script;
  /** Namespace suffix without the hyphen */
  namespace: string;
  /** Tier files, indexed by level */
  files: string[];
  /** Highest level this script has */
  maxLevel: GlyphsetLevel;
  /**
   * Where a dot-suffix goes relative to the namespace.
   *   'after'  → isign-taml.ka   (the rule in docs/naming-standard.md)
   *   'before' → usign.rasign-sinh (what the Sinhala data has always produced)
   * Sinhala keeps 'before' until its suffix position is decided; see
   * docs/tamil-decisions.md, D1.
   */
  dotSuffix: 'before' | 'after';
  /** Accepted spellings on the command line */
  aliases: string[];
}

export const SCRIPTS: Record<Script, ScriptDef> = {
  sinhala: {
    key: 'sinhala',
    namespace: 'sinh',
    files: [
      'sinhala-0-kernel.yaml',
      'sinhala-1-core.yaml',
      'sinhala-2-plus.yaml',
      'sinhala-3-pro.yaml',
    ],
    maxLevel: 3,
    dotSuffix: 'before',
    aliases: ['sinhala', 'sinh', 'si'],
  },
  tamil: {
    key: 'tamil',
    namespace: 'taml',
    files: ['tamil-0-kernel.yaml', 'tamil-1-core.yaml', 'tamil-2-pro.yaml'],
    maxLevel: 2,
    dotSuffix: 'after',
    aliases: ['tamil', 'taml', 'ta'],
  },
};

/** Resolve a user-supplied script name; throws on an unknown one. */
export function resolveScript(name: string | undefined): Script {
  if (name === undefined || name === '') return 'sinhala';
  const wanted = name.trim().toLowerCase();
  for (const def of Object.values(SCRIPTS)) {
    if (def.aliases.includes(wanted)) return def.key;
  }
  throw new Error(`Unknown script "${name}" (expected sinhala or tamil)`);
}

/** The script a glyphset definition belongs to, from its namespace. */
export function scriptOfNamespace(namespace: string): Script {
  for (const def of Object.values(SCRIPTS)) {
    if (def.namespace === namespace) return def.key;
  }
  return 'sinhala';
}

/**
 * Full glyph name from a bare name: `ka` → `ka-taml`; `isign.ka` → `isign-taml.ka`
 * for a script whose dot-suffix goes after the namespace.
 */
export function composeName(bare: string, def: ScriptDef): string {
  const dot = bare.indexOf('.');
  if (def.dotSuffix === 'after' && dot > 0) {
    return `${bare.slice(0, dot)}-${def.namespace}${bare.slice(dot)}`;
  }
  return `${bare}-${def.namespace}`;
}
