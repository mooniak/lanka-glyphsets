#!/usr/bin/env node
// Regenerates shaping-exceptions.js from glyphsets/shaping-exceptions.yaml.
// Source of truth: glyphsets/shaping-exceptions.yaml (glyph names).
// Converts names back to Sinhala Unicode strings via the authoritative
// glyphname-unicode-converter engine, so the generated file matches the
// standard by construction.
"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const { nameToUnicode } = require("../glyphname-unicode-converter/lankaglyphset-map.js");

const ROOT = path.join(__dirname, "..", "..");
const SRC = path.join(ROOT, "glyphsets", "shaping-exceptions.yaml");
const OUT = path.join(__dirname, "shaping-exceptions.js");

const doc = yaml.parse(fs.readFileSync(SRC, "utf8"));

function toUnicodeList(names) {
  return names.map((name) => {
    const r = nameToUnicode(name);
    if (r.error) {
      throw new Error(`shaping-exceptions.yaml: cannot resolve "${name}": ${r.error}`);
    }
    return r.unicode;
  });
}

const DATA = {
  rakaransaya: toUnicodeList(doc.rakaransaya || []),
  repaya: toUnicodeList(doc.repaya || []),
  yansaya: toUnicodeList(doc.yansaya || []),
};

const banner = `/*
 * shaping-exceptions.js — GENERATED, DO NOT EDIT BY HAND.
 * Regenerate with: node tools/_generated/build-shaping-exceptions.js
 * Source of truth: glyphsets/shaping-exceptions.yaml
 */
`;

const body = `(function (root) {
  "use strict";
  var DATA = ${JSON.stringify(DATA, null, 2)};
  var EXPORTS = {
    rakaransayaExceptions: new Set(DATA.rakaransaya),
    repayaExceptions: new Set(DATA.repaya),
    yansayaExceptions: new Set(DATA.yansaya)
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = EXPORTS;
  } else {
    root.LankaShapingExceptions = EXPORTS;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
`;

fs.writeFileSync(OUT, banner + body);
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
