# LankaGlyphset ⇄ Unicode Converter

A **bidirectional converter** between LankaGlyphset glyph names (`kRa-sinh`,
`kSsa-sinh`, `daa._c-sinh`, `kI-taml`, `isign-taml.ka` …) and the **Unicode string**
each renders — for Sinhala and Tamil, as a browser tool and a reusable JS engine. It
implements the naming standard defined by the glyphset YAMLs in `glyphsets/`
(`sinhala-{0-kernel,1-core,2-plus,3-pro}.yaml` and `tamil-{0-kernel,1-core,2-pro}.yaml`).

This is standard tooling — it is font-agnostic. To migrate a specific font's
glyph names, see [`docs/adopting-the-standard.md`](../../docs/adopting-the-standard.md)
for how to author a conversion script on top of this engine.

## The web tool

Open **`index.html`** in a browser (no server, no build).

- **Script** — the toggle at the top switches between Sinhala and Tamil: samples,
  placeholders and wording follow it, and a bare name (`kI`) is read in that script.
- **Unicode → Name** — paste text, one cluster per line, get the
  LankaGlyphset name, codepoints and glyphset tier. For a Tamil form that a
  shape-group alternate can also meet, the note says so (`or the alternate isign-taml.ka`).
- **Name → Unicode** — paste names (`-sinh` / `-taml` optional), get the Unicode string.
  A Tamil alternate (`isign-taml.ka`) shows the glyph it varies and is marked as an alternate.
- Names in the authoritative glyphset show their tier
  (`kernel`/`core`/`plus`/`pro`); well-formed names not enumerated there are
  marked `derived`. Click any row to copy.

## The engine — `lankaglyphset-map.js`

Shared by the browser and Node.

```js
const L = require("./lankaglyphset-map.js");
L.unicodeToName("ක්‍ර");      // { name: "kRa-sinh", tier: "derived", canonical: false }
L.nameToUnicode("kSsa-sinh"); // { unicode: "ක්‍ෂ", hex: "U+0D9A U+0DCA U+200D U+0DC2", ... }
L.unicodeToName("கி");        // { name: "kI-taml", tier: "core", canonical: true,
                              //   alternate: "isign-taml.ka", note: "or the alternate isign-taml.ka" }
L.nameToUnicode("isign-taml.ka"); // { unicode: "ி", variant: "ka", canonical: true, tier: "core", ... }
```

- `unicodeToName(str, opts?)` — decompose any cluster to its LankaGlyphset name.
- `nameToUnicode(name, opts?)` — the reverse, over the productive syllabary + conjuncts,
  generated self-contained from the standard's building blocks.
- `opts.script` (`"sinhala"` or `"tamil"`) forces the script. Without it, any Tamil
  character selects Tamil, and a name ending `-taml` (or with `-taml.` in it) selects
  Tamil; everything else is Sinhala. **A bare name is Sinhala unless the script is
  given:** `nameToUnicode("ka")` is `ක`, `nameToUnicode("ka", { script: "tamil" })` is `க`.
- `GLYPHSET` — the authoritative name → `{ tier, unicode?, decompose? }` map for both
  scripts, embedded (not loaded at runtime, so the browser tool needs no server). Tamil
  shape-group alternates are listed with `variantOf` and `group`.
- `TAMIL_SIGNS` — `[sign name, codepoint, name abbreviation]`, the one part of the Tamil
  naming rule written out in the engine (a test keeps it equal to `src/core/tamil.ts`).

Naming rules follow the LankaGlyphset standard; codepoint tables mirror
`../font-coverage/font_coverage.py`.

### Regenerating the embedded glyphset

Re-embed `GLYPHSET` after the YAMLs change:

```bash
node build-glyphset.js   # rewrites the GLYPHSET literal in lankaglyphset-map.js
```

The repo root is an ESM package; the local `package.json` scopes this folder to
CommonJS so `require()` works.

## Tamil

The Tamil inventory (letters, signs, numerals, symbols, alternates) is read from `GLYPHSET`,
so only the sign abbreviations are written out. Cluster rules: a Tamil syllable never needs a
joiner.

- Consonant + vowel sign is `kI`, `nnnUu`, `kAa` (abbreviations `Aa I Ii U Uu E Ee Ai O Oo Au`);
  consonant + pulli drops the `a` (`k`, `nnn`).
- `க்ஷ` is `kSsa` and takes the same signs (`kSsI`, `kSs`); `ஸ்ரீ` and `ஶ்ரீ` are both `shree`
  (`shree` converts back to `ஶ்ரீ`).
- Any other consonant + pulli + consonant is two clusters, so it does **not** resolve as one
  name (`க்க` is `k` + `ka`).
- A name the glyphset does not enumerate (`kAa`, `k`) is `derived`: the consonant and the plain
  sign are enough, and the `note` says so.
- A form that a shape-group alternate can also meet (`kI`, `pU`) reports it as `alternate`.
  `nameToUnicode` of an alternate (`isign-taml.ka`, `ra-taml.alt`) returns the glyph it varies,
  with `variant` set.
- Input is NFC-normalised, so `ெ` + `ா` is `ொ`. `zerowidthjoiner`, `zerowidthnonjoiner` and
  `dottedCircle` carry no namespace, so convert them with `{ script: "tamil" }`.

## Naming notes / edge cases

- Ligating vowel signs I/Ii/U/Uu attach to every consonant (`kI`, `dU`); the
  spacing/below vowels (aa/ae/e/o/…) generally do **not** ligate — such names are
  valid by rule but tagged `derived`, not enumerated in the glyphset.
- Below-base "da-shape" letters (`da`, `nda`, `nya`, `jnya` and their conjuncts)
  take the `._c` form with a post-base spacing vowel (`daa._c`, `nyaa._c`);
  pre-base vowels never do (`dE`, `dEe`, like `kE`, `kEe`); `ra` + ae/aae
  ligate as `rAe`/`rAae`.
- Repaya `ර්‍` + a consonant, in Unicode order (`ර්‍ක`), is `ka_repha`: ra-led
  conjuncts are always set as repaya. `ra` + `ra` / `ya` stay rakaransaya /
  yansaya on ra (`rRa`, `rya`). `ka_repha` maps back to `ර්‍ක`.
- `kunddaliya` (෴) is a Punctuation glyph and carries **no** `-sinh` namespace.
