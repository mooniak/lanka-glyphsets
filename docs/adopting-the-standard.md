# Authoring font → LankaGlyphset conversion scripts

This repo defines the **LankaGlyphset naming standard** (the glyphset YAMLs at the
repo root). It intentionally holds **no font-project-specific files**. When you
need to rename an existing Sinhala font's glyphs to LankaGlyphset names, author a
one-off conversion script **in that font's own repo**, using the standard and the
tooling described here. This document is written so an AI coding tool can produce
that script correctly without further context.

## The standard in one screen

- **Namespace.** Sinhala glyphs are `name-sinh`; Tamil glyphs are `name-taml`.
  Punctuation and Format-control glyphs carry **no** namespace (`space`, `comma`,
  `kunddaliya`, `zerowidthjoiner`).
- **Authoritative glyph set + Unicode** lives in the repo-root YAML tiers:
  `sinhala-0-kernel.yaml` (essential), `sinhala-1-core.yaml`,
  `sinhala-2-plus.yaml`, `sinhala-3-pro.yaml`, and `tamil.yaml`. A glyph's key is
  its name; `unicode:` (atomic glyphs only) and `decompose:` are attributes.
- **Naming rules** (Sinhala; how a cluster's name is formed — full detail in
  [naming-standard.md](naming-standard.md)):

  | Form | Rule | Example |
  |---|---|---|
  | base consonant | keep inherent `a` | ක → `ka` |
  | pure consonant (virama) | drop the `a` | ක් → `k` |
  | conjunct (`c1්‍c2`) | drop c1's `a`, Capitalise c2's full name | ක්‍ෂ → `kSsa`, න්‍ද → `nDa` |
  | rakaransaya (`c්‍ර`) | drop `a`, add `R`, then vowel/`a` | ක්‍ර → `kRa`, ක්‍රි → `kRI` |
  | repaya (`cර්‍`) | join with `_repha` | කර්‍ → `ka_repha` |
  | yansaya (`c්‍ය`) | drop `a`, add `y` | ්‍ය → `yasign`, ද්‍ය → `dya` |
  | vowel sign I/Ii/U/Uu | drop `a`, add Capital suffix | කි → `kI`, දු → `dU` |
  | below/spacing vowel on "da-shape" bases (`da nda nya jnya` + conjuncts) | `._c` form, lowercase vowel | දා → `daa._c`, ඤා → `nyaa._c` |
  | `ra` + ae/aae | Capital suffix | රැ → `rAe`, රෑ → `rAae` |
  | standalone signs | fixed names | ා `aasign`, ් `virama`, ්‍ර `rasign`, ර්‍ `repha`, ්‍ය `yasign`, ං `anusvaraya` |

  Full, tested implementations of these rules (both directions) live in
  `tools/glyphname-unicode-converter/lankaglyphset-map.js` — **reuse it, don't
  reimplement.**

## Two conversion strategies

Pick by how the source font names its glyphs.

### A. Source names are structured (rule-based rename)
If the old names encode their meaning (e.g. `ka-sinh`, `ka_ssa`, `yansa-sign`, or
`sinKa`, `sinKSsa`, `sinMatraI`), write a `convert(old_name) -> new_name`
function that maps the old scheme to the standard by rule. This is how the
AbhayaLibre and YaldeviPro migrations were done.

### B. Source names are arbitrary (Unicode-bridge)
If the old names are meaningless (e.g. FontMatics: `bullet.020`, `quotedblright.040`),
rules can't apply — use the **Unicode string as the bridge**:

```
old glyph name  →  Unicode string  →  LankaGlyphset name
                (from the font's      (unicodeToName() in
                 cmap / a provided     lankaglyphset-map.js)
                 name↔unicode list)
```

```js
const L = require("lanka-glyphsets/tools/glyphname-unicode-converter/lankaglyphset-map.js");
L.unicodeToName("ක්‍ර");   // { name: "kRa-sinh", tier: "derived", canonical: false }
```

Join every source glyph to its name this way to produce an
`old_name → lankaglyphset_name` map.

## Assigning Unicode

Assign a cmap codepoint **only to atomic encoded glyphs** (independent vowels,
base consonants, signs — the YAML entries that carry a `unicode:`). Ligatures and
conjuncts stay **unencoded**; they are formed by GSUB at shaping time. The
`GLYPHSET` export in the engine gives the atomic name → unicode map.

## The Glyphs.app rename macro (skeleton)

Whichever strategy, apply the rename with a macro that is safe to re-run:

1. `DRY_RUN = True` first — write a TSV report, change nothing.
2. **Collision detection** — if two source glyphs map to the same name (alternate
   designs), skip both and list them for manual resolution (e.g. `.alt`).
3. **Two-stage rename** — move each glyph to a unique temp name, then to its final
   name, to avoid transient name clashes.
4. **Preserve/assign Unicode** — snapshot each glyph's Unicode before renaming and
   restore it; fall back to the atomic name→unicode table.
5. **Rewrite OpenType feature code, classes and prefixes** to the new names
   (Glyphs does not do this for manual code).
6. Write a report; only after review set `DRY_RUN = False`.

## Related tooling in this repo

- `tools/glyphname-unicode-converter/` — the name ⇄ Unicode engine + web UI.
- `tools/font-coverage/` — check which orthographic units a built font renders.
- `tools/feature-generator/` (lankafea) — Sinhala/Tamil OpenType feature
  generation + glyph-dependency validation, gated on glyphs actually present.
