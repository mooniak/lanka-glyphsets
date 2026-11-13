#!/usr/bin/env node
/*
 * build-glyphset.js
 * =================
 * Regenerate the embedded GLYPHSET table in lankaglyphset-map.js from the
 * authoritative tier YAMLs in the repo's glyphsets/ directory:
 *   glyphsets/sinhala-{0-kernel,1-core,2-plus,3-pro}.yaml
 *   glyphsets/tamil-{0-kernel,1-core,2-pro}.yaml
 *
 * GLYPHSET maps each full glyph name (with its "-sinh" / "-taml" namespace,
 * except Punctuation / Format controls / Placeholders) to
 *   { tier, category, unicode?, decompose? }.
 * Tamil `groups:` blocks are expanded into one "Sign alternates" entry per
 * group (isign-taml.ka), which also carries { variantOf, group }.
 * Run this whenever the YAMLs change:  node build-glyphset.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const ROOT = path.resolve(__dirname, "..", "..", "glyphsets");
const ENGINE = path.join(__dirname, "lankaglyphset-map.js");

// [filename, tier label, script]. Sinhala is listed first so a name shared by
// both scripts (space, zerowidthjoiner …) keeps its Sinhala entry.
const SINHALA = { ns: "-sinh", dotAfter: false };   // Sinhala keeps the legacy "usign.rasign-sinh" order
const TAMIL = { ns: "-taml", dotAfter: true };      // docs/naming-standard.md: isign-taml.ka
const TIERS = [
  ["sinhala-0-kernel.yaml", "kernel", SINHALA], ["sinhala-1-core.yaml", "core", SINHALA],
  ["sinhala-2-plus.yaml", "plus", SINHALA], ["sinhala-3-pro.yaml", "pro", SINHALA],
  ["tamil-0-kernel.yaml", "kernel", TAMIL], ["tamil-1-core.yaml", "core", TAMIL],
  ["tamil-2-pro.yaml", "pro", TAMIL]
];
const ATTRS = new Set(["unicode", "decompose", "signs", "conjunct", "touch"]);
const NO_NS = new Set(["Format controls", "Punctuation", "Placeholders"]);

function ns(name, cat, script) {
  if (NO_NS.has(cat)) return name;
  const dot = name.indexOf(".");
  if (script.dotAfter && dot > 0) return name.slice(0, dot) + script.ns + name.slice(dot);
  return name + script.ns;
}
function isGlyph(v) {
  if (v === null || v === undefined || typeof v !== "object") return true;
  return Object.keys(v).every(function (k) { return ATTRS.has(k); });
}
function hex(v) {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v
    : (/^0x/i.test(String(v).trim()) ? parseInt(String(v).trim(), 16)
                                     : parseInt(String(v).trim(), 10));
  return isNaN(n) ? undefined : "U+" + n.toString(16).toUpperCase().padStart(4, "0");
}

const glyphset = {};
function walk(node, cat, tier, script, file) {
  for (const [key, val] of Object.entries(node)) {
    if (ATTRS.has(key)) continue;
    if (isGlyph(val)) {
      const full = ns(key, cat, script);
      if (!(full in glyphset)) {
        glyphset[full] = { tier: tier, category: cat };
        const u = val && hex(val.unicode); if (u) glyphset[full].unicode = u;
        if (val && val.decompose) glyphset[full].decompose = val.decompose;
      }
    } else {
      // A nested group has only glyph names as keys. A mix of glyph attributes and
      // anything else means a new attribute this builder does not know — fail loudly
      // rather than registering the attribute as a glyph.
      const keys = Object.keys(val);
      if (keys.some(function (k) { return ATTRS.has(k); })) {
        throw new Error(file + ": '" + key + "' has unknown attribute(s) " +
          JSON.stringify(keys.filter(function (k) { return !ATTRS.has(k); })) +
          " — add them to ATTRS in build-glyphset.js and in the readers");
      }
      walk(val, cat, tier, script, file);
    }
  }
}

// groups: sign -> group -> [consonants]  =>  one "Sign alternates" glyph per group.
function expandGroups(groups, tier, script) {
  for (const [sign, byGroup] of Object.entries(groups || {})) {
    for (const [group, members] of Object.entries(byGroup)) {
      const full = ns(sign + "." + group, "Sign alternates", script);
      if (full in glyphset) throw new Error("duplicate sign alternate " + full);
      glyphset[full] = { tier: tier, category: "Sign alternates", variantOf: sign, group: members };
    }
  }
}

for (const [fn, tier, script] of TIERS) {
  const doc = YAML.parse(fs.readFileSync(path.join(ROOT, fn), "utf8"), { uniqueKeys: false });
  for (const [cat, members] of Object.entries(doc.categories || {})) {
    if (members && typeof members === "object") walk(members, cat, tier, script, fn);
  }
  expandGroups(doc.groups, tier, script);
}

const literal = JSON.stringify(glyphset);
let js = fs.readFileSync(ENGINE, "utf8");
const re = /var GLYPHSET = \{[\s\S]*?\};\n(\s*var CANONICAL_LIST)/;
if (!re.test(js)) { console.error("Could not find the GLYPHSET block in lankaglyphset-map.js"); process.exit(1); }
js = js.replace(re, "var GLYPHSET = " + literal + ";\n$1");
fs.writeFileSync(ENGINE, js);
console.log("GLYPHSET regenerated: " + Object.keys(glyphset).length + " glyph names embedded into lankaglyphset-map.js");
