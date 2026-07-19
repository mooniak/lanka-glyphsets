# LankaGlyphset ⇄ Unicode Converter

A **bidirectional converter** between LankaGlyphset glyph names (`kRa-sinh`,
`kSsa-sinh`, `daa._c-sinh` …) and the Sinhala **Unicode string** each renders —
as a browser tool and a reusable JS engine. It implements the naming standard
defined by the repo-root glyphset YAMLs (`sinhala-{0-kernel,1-core,2-plus,3-pro}.yaml`).

This is standard tooling — it is font-agnostic. To migrate a specific font's
glyph names, see [`docs/adopting-the-standard.md`](../../docs/adopting-the-standard.md)
for how to author a conversion script on top of this engine.

## The web tool

Open **`index.html`** in a browser (no server, no build).

- **Unicode → Name** — paste Sinhala text, one cluster per line, get the
  LankaGlyphset name, codepoints and glyphset tier.
- **Name → Unicode** — paste names (`-sinh` optional), get the Unicode string.
- Names in the authoritative glyphset show their tier
  (`kernel`/`core`/`plus`/`pro`); well-formed names not enumerated there are
  marked `derived`. Click any row to copy.

## The engine — `lankaglyphset-map.js`

Shared by the browser and Node.

```js
const L = require("./lankaglyphset-map.js");
L.unicodeToName("ක්‍ර");      // { name: "kRa-sinh", tier: "derived", canonical: false }
L.nameToUnicode("kSsa-sinh"); // { unicode: "ක්‍ෂ", hex: "U+0D9A U+0DCA U+200D U+0DC2", ... }
```

- `unicodeToName(str)` — decompose any Sinhala cluster to its LankaGlyphset name.
- `nameToUnicode(name)` — the reverse, over the productive syllabary + conjuncts,
  generated self-contained from the standard's building blocks.
- `GLYPHSET` — the authoritative name → `{ tier, unicode?, decompose? }` map,
  embedded (not loaded at runtime, so the browser tool needs no server).

Naming rules follow the LankaGlyphset standard; codepoint tables mirror
`../font-coverage/font_coverage.py`.

### Regenerating the embedded glyphset

Re-embed `GLYPHSET` after the YAMLs change:

```bash
node build-glyphset.js   # rewrites the GLYPHSET literal in lankaglyphset-map.js
```

The repo root is an ESM package; the local `package.json` scopes this folder to
CommonJS so `require()` works.

## Naming notes / edge cases

- Ligating vowel signs I/Ii/U/Uu attach to every consonant (`kI`, `dU`); the
  spacing/below vowels (aa/ae/e/o/…) generally do **not** ligate — such names are
  valid by rule but tagged `derived`, not enumerated in the glyphset.
- Below-base "da-shape" letters (`da`, `nda`, `nya`, `jnya` and their conjuncts)
  take the `._c` form with a spacing vowel (`daa._c`, `nyaa._c`); `ra` + ae/aae
  ligate as `rAe`/`rAae`.
- `kunddaliya` (෴) is a Punctuation glyph and carries **no** `-sinh` namespace.
