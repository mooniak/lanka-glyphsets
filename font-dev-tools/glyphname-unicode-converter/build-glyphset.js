#!/usr/bin/env node
/*
 * build-glyphset.js
 * =================
 * Regenerate the embedded GLYPHSET table in lankaglyphset-map.js from the
 * authoritative tier YAMLs at the repo root:
 *   sinhala-{0-kernal,1-core,2-plus,3-pro}.yaml
 *
 * GLYPHSET maps each full glyph name (with the "-sinh" namespace, except
 * Punctuation / Format controls) to { tier, category, unicode?, decompose? }.
 * Run this whenever the YAMLs change:  node build-glyphset.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const ROOT = path.resolve(__dirname, "..", "..");
const ENGINE = path.join(__dirname, "lankaglyphset-map.js");
const TIERS = [
  ["sinhala-0-kernal.yaml", "kernal"], ["sinhala-1-core.yaml", "core"],
  ["sinhala-2-plus.yaml", "plus"], ["sinhala-3-pro.yaml", "pro"]
];
const ATTRS = new Set(["unicode", "decompose", "signs", "conjunct", "touch"]);
const NO_NS = new Set(["Format controls", "Punctuation"]);

function ns(name, cat) { return NO_NS.has(cat) ? name : name + "-sinh"; }
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
function walk(node, cat, tier) {
  for (const [key, val] of Object.entries(node)) {
    if (ATTRS.has(key)) continue;
    if (isGlyph(val)) {
      const full = ns(key, cat);
      if (!(full in glyphset)) {
        glyphset[full] = { tier: tier, category: cat };
        const u = val && hex(val.unicode); if (u) glyphset[full].unicode = u;
        if (val && val.decompose) glyphset[full].decompose = val.decompose;
      }
    } else walk(val, cat, tier);
  }
}

for (const [fn, tier] of TIERS) {
  const doc = YAML.parse(fs.readFileSync(path.join(ROOT, fn), "utf8"), { uniqueKeys: false });
  for (const [cat, members] of Object.entries(doc.categories || {})) {
    if (members && typeof members === "object") walk(members, cat, tier);
  }
}

const literal = JSON.stringify(glyphset);
let js = fs.readFileSync(ENGINE, "utf8");
const re = /var GLYPHSET = \{[\s\S]*?\};\n(\s*var CANONICAL_LIST)/;
if (!re.test(js)) { console.error("Could not find the GLYPHSET block in lankaglyphset-map.js"); process.exit(1); }
js = js.replace(re, "var GLYPHSET = " + literal + ";\n$1");
fs.writeFileSync(ENGINE, js);
console.log("GLYPHSET regenerated: " + Object.keys(glyphset).length + " glyph names embedded into lankaglyphset-map.js");
