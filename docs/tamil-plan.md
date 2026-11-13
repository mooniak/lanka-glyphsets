# Tamil parity plan: standard, features and tooling

> Status: **proposal** (2026-11-13). Nothing here is implemented yet. Decisions
> D1–D7 below need sign-off before Phase 1 starts.

This plan brings Tamil up to the level of support Sinhala has across the
LankaGlyphset standard (this repo), lankafea and the design tools
(`sinhala-font-tools`), and mnik (`mooniak-font-tools`).

It is based on:

- the Tamil glyphs, anchors and features in the sources of **Abhaya Libre**,
  **Yaldevi** and **Ralex**, plus **Vineetha** and **Lankaverse Sans**, which
  also carry Tamil;
- `lankafea validate --script tamil` run on the three main sources;
- `hb-shape` runs on the built fonts;
- a survey of the Sinhala pipeline in all three repos.

## 1. What exists today

### 1.1 The fonts

| | Abhaya Libre | Yaldevi | Ralex |
|---|---|---|---|
| Tamil glyphs | 182 | 145 | 124 (8 are empty and don't export) |
| Suffix position | before the namespace (`isign.alt1-taml`) | mixed (`nnAa.alt-taml` and `nnnAa-taml.alt`) | after the namespace (`isign-taml.alt1`) |
| Name for ன | `nna2` | `nnna` | `nna2` |
| How ி / ீ are done | a precomposed glyph for every consonant (mostly components: base + `isign.altN`) | 8 `isign.altN` alternates picked by class, plus some ligatures | 7 `isign.altN` alternates picked by class |
| How ு / ூ are done | ligatures, plus `usign.alt1` for ங ப ய வ | ligatures, plus `usign.alt1` | ligatures, plus `usign.alt1` positioned in GPOS |
| Anchor names | `tm_halant` | `tm_halant`, `MatraI.altN`, `MatraIi`, `MatraU`… | `Anchor-0` … `Anchor-4` |
| Tamil features | hand-written (`taml` + `tml2`); old orthography in `ss09` | hand-written | hand-written GSUB plus a VOLT-style GPOS export; `ss01`–`ss04` and `salt` |

What the three have in common, and where they drift:

- **They share one lookup template.** All three use the same skeleton:
  `akhands`, `above_base_sub`, `post_base_sub`, `stylistic_alternates_1–4`,
  and the `@TA_MATRA_I_n` classes. A generator can reproduce it.
- **`.altN` numbers mean different things in different fonts.** Abhaya's
  `isign.alt1` covers {ங ப ய வ}; in Ralex and Yaldevi that same group is
  `alt7`. The class members also differ: Ralex's `alt2` is
  {ja ma rra zha sha ha}, Yaldevi's is {ma sha ha}, because Yaldevi draws ja,
  rra and zha + ி as ligatures.
- **No font has a ligature glyph for ஙு, யு or வு, and only Abhaya has பு.**
  The others build all four from the `usign.alt1` hook.
- **Vineetha** is a copy of Ralex's Tamil (same 124 names). **Lankaverse Sans**
  uses old-style names (`tmKA`, `tmmI`) for 71 glyphs.

Consonant + vowel-sign forms present as glyphs (A = Abhaya, Y = Yaldevi,
R = Ralex; `*` = listed in the current `tamil.yaml`):

```
       I         Ii        U         Uu        Aa        Ai
k      A..*      A..*      AYR*      AYR*      ...       ...
ng     AY.*      A..*      ...       AYR*      ...       ...
c      A..*      A..*      AYR*      AYR*      ...       ...
j      AY.*      A..*      A..*      A..*      ...       ...
ny     A..*      A..*      AYR*      AYR*      ...       ...
tt     AYR*      AYR*      AYR*      AYR*      ...       ...
nn     A..*      A..*      AYR*      AYR*      A..*      A..*
t      A..*      A..*      AYR*      AYR*      ...       ...
n      A..*      A..*      AYR*      AYR*      ...       ...
nnna   A..*      A..*      AYR*      AYR*      A..*      A..*
p      AY.*      A..*      A..*      AYR*      ...       ...
m      A..*      A..*      AYR*      AYR*      ...       ...
y      AY.*      A..*      ...       AYR*      ...       ...
r      A..*      A..*      AYR*      AYR*      ...       ...
rr     AY.*      A..*      AYR*      AYR*      A..*      ...
l      AYR*      A..*      AYR*      AYR*      ...       A..*
ll     A..*      A..*      AYR*      AYR*      ...       A..*
zh     AY.*      A..*      AYR*      AYR*      ...       ...
v      AY.*      A..*      ...       AYR*      ...       ...
sh     A..*      A..*      ...       ...       ...       ...
ss     A..*      A..*      AY.*      AY.*      ...       ...
s      AY.*      AY.*      AY.*      .Y.       ...       ...
h      A..*      A..*      A..*      A..*      ...       ...
kSs    A..*      A..*      AY.*      AY.*      ...       ...
```

Glyphs found in a font but not in the standard: `iisign.alt2`, `iisign.alt3`,
`isign.alt8`, `isign.stylalt1`, `iisign.stylalt1` (Yaldevi, Ralex);
`nnAa.alt`, `rrAa.alt`, `nnnAa.alt` / `nna2-aa.alt` (old-orthography
alternates, Yaldevi and Ralex); `ra.alt`, `rI.alt`, `rIi.alt` (Yaldevi);
`sUu` (Yaldevi).

**Shipping bugs (confirmed):**

- **Yaldevi doesn't form க்ஷ or ஸ்ரீ.** Its `taml-akhands` lookup is
  registered under `script sinh;`. `hb-shape` on
  `fonts/ttf/Yaldevi-Regular.ttf` returns `uni0B95|uni0BCD|uni0BB7` for க்ஷ,
  where Ralex returns `kSsataml`.
- **Yaldevi's old-orthography lookups are unreachable.** No feature references
  `taml-stylistic_alternates_1–4`, and the font has no `tml2` language system.
- **Ralex has no outlines for 8 Tamil symbols:** ௰ ௲ ௵ ௶ ௷ ௸ ௹ ௺. The glyphs
  are empty and don't export.

Minor: Abhaya's `osign`, `oosign` and `ausign` composites include a
`dottedCircle` component. In Ralex, `aulengthmark` references `ausign`, which
is the reverse of the Unicode decomposition (ௌ = ெ + ௗ).

### 1.2 The standard (this repo)

- **[`glyphsets/tamil.yaml`](../glyphsets/tamil.yaml) is Abhaya's inventory
  copied 182-for-182.** So it treats Abhaya's way of building the font as the
  requirement:
  - All 44 consonant + ி/ீ ligatures are "Required", even though Yaldevi and
    Ralex correctly use alternates instead.
  - The pre-1978 forms (ணா றா ணை லை ளை) are "Required", though they're a
    traditional style.
  - The Grantha + ு/ூ forms (ஜு ஷு ஸு ஹு க்ஷு) are "Required".
  - `pU` is listed but `ngU`, `yU` and `vU` aren't.
- **Schema gaps:**
  - The list is flat: no `signs:` lists and no `decompose:` entries.
  - There's one level, unlike Sinhala's four.
  - There's no punctuation, ZWJ, ZWNJ or dotted circle.
  - `visargaya` is filed under Signs, but U+0B83 is a letter (Unicode
    category Lo).
  - `nna2` is still marked provisional.
- **Contradiction in [`naming-standard.md`](naming-standard.md):** the Tamil
  section puts the suffix before the namespace (`isign.alt1-taml`), but the
  Sinhala rule puts it after (`isign-sinh.ka`).
- **No tooling reads Tamil:**
  - [`src/core/parser.ts`](../src/core/parser.ts) only loads the Sinhala files.
  - [`src/formatters/glyphdata.ts`](../src/formatters/glyphdata.ts) hard-codes
    `script="sinhala"`.
  - `src/analyzers/text-glyphs.ts`, `tools/font-coverage/font_coverage.py` and
    `tools/glyphname-unicode-converter/lankaglyphset-map.js` handle Sinhala
    only.
  - `npm run sync` produces no Tamil files.

### 1.3 lankafea (`sinhala-font-tools/tools/feature-generator`)

It has a `tamil_profile()`, but it's the Sinhala model with a few switches
turned off. Satisfiable rules out of about 8,200 candidates:

| Font | Satisfiable |
|---|---|
| Abhaya | 104 |
| Yaldevi | 68 |
| Ralex | 34 |

What's wrong with it for Tamil:

- **It generates rules Tamil doesn't have:**
  - 529 consonant + consonant conjuncts (`kKa-taml`…)
  - 1,932 ligatures on the pre-base signs ெ ே ை
  - ு is routed to `blws`; all three fonts correctly use `psts`
- **Naming bug:** the stem `nna2` + `a` gives `nna2a-taml`. That missing name
  is the top blocker in all three fonts (57 rules each).
- **Wrong anchor names:** it checks for the Sinhala/Noto names (`alSign`,
  `uvowel`, `iiVowel`), so every Tamil font fails the check.
- **No shape groups:** it doesn't know the ி/ு groups, so it reports every
  Ralex alternate as unselectable.
- **Mixed-script sources:** item R1 on its roadmap (writing generated features
  back into a source that has both Sinhala and Tamil) blocks Abhaya and
  Yaldevi.

### 1.4 Design tools and mnik

There is **no Tamil** in design-stages, the spacing tools (model, map,
workbench, plugin), the composite tools (model, map, Glyph Builder),
glyphs-filters, glyph-chart, or the test generator and its corpus.

Tamil test texts already exist (`tamil-alphabet`, `tamil-kern-pairs`,
`tamil-numerals`, `tamil-pangram`, `tamil-prose`), and mnik's proof PDFs use
them without any stage gating. mnik's `doctor` and registry coverage numbers
are Sinhala-only.

## 2. Decisions needed first (recommendation listed first)

- **D1: Suffix after the namespace** (`isign-taml.ka`). This matches the
  Sinhala rule, Ralex/Vineetha and how Glyphs handles suffixes. It's a rename
  for Abhaya and Yaldevi.
- **D2: Name ன `nnna`.** That's its Unicode name, Yaldevi already uses it,
  and dropping the `a` works cleanly: `nnnI`, `nnnU`, `nnnAa`. This removes
  the "Provisional" category.
- **D3: Name alternates by shape group, as Sinhala does:**
  - `isign-taml.ka` {ka ta}
  - `.ca` {ca}
  - `.na` {nya na}
  - `.pa` {nga pa ya va}
  - `.ma` {ja ma rra zha sha ha}
  - `.la` {la sa}
  - `.ssa` {ssa kSsa}
  - plus `iisign-taml.la`, `usign-taml.pa` and `aisign-taml.la`

  The standard sets default group members; a font can override them.
- **D4: Tamil levels.** Needs sign-off from a Tamil type specialist,
  especially on Grantha ு/ூ.
  - **Tamil-0 Kernel:** the full Unicode block; punctuation, ZWJ, ZWNJ and
    dotted circle; டி டீ; the 36 native consonant + ு/ூ forms; க்ஷ; ஸ்ரீ.
  - **Tamil-1 Core:** the ி/ீ mechanism, Grantha ு/ூ forms, and க்ஷ + vowel
    signs.
  - **Tamil-2 Pro:** traditional pre-1978 orthography, alternate ra forms, and
    possibly the Tamil Supplement block (U+11FC0–11FFF).

  The schema needs one new idea: a requirement that can be met either way.
  `kI` counts as present if the font has `kI-taml` **or** `isign-taml.ka`.
- **D5: Name anchors after the signs they attach:** `virama`/`_virama`,
  `iisign`/`_iisign`, `usign`/`_usign`. The Sinhala anchor section is still
  marked TODO, so fill it in the same pass.
- **D6: Feature conventions:**
  - Register both `taml` and `tml2`.
  - `akhn`: க்ஷ and ஸ்ரீ, accepting both the ஶ and ஸ spellings.
  - `abvs`: ி/ீ forms. `psts`: ு/ூ and ா forms.
  - One fixed `ssNN` for traditional orthography. Abhaya uses `ss09`; Ralex
    splits it across `ss02` and `ss04`.
  - A real `ra-taml.alt` glyph. Ralex and Yaldevi currently swap ர for
    `aasign-taml`, which is a mark glyph, so its GDEF class is wrong for a
    base letter.
- **D7: Where the Tamil design tools live.** sinhala-font-tools is partway
  through a rename to sinhala-font-design. Recommendation: make the tools work
  for either script and keep the data in a `model/tamil/` folder in that repo.
  A separate Tamil repo would mean copying the JS tools and maintaining two
  versions.

## 3. Phases

Sizes are rough estimates.

### Phase 0: Hotfixes (hours, no dependencies)

- **Yaldevi:**
  - Move `taml-akhands` under `script taml;`.
  - Add `tml2`.
  - Connect the old-orthography lookups to a stylistic set, or delete them.
  - Check with `hb-shape` that க்ஷ gives `kSsa`, and ஸ்ரீ and ஶ்ரீ give
    `shree`.
- **Ralex:** draw the 8 empty symbols, or stop claiming them in coverage.

### Phase 1: Standard data and docs (lanka-glyphsets, ~2–3 days plus review)

1. Write up the decisions in `docs/tamil-decisions.md`, with an old → new
   rename table.
2. Replace `tamil.yaml` with `tamil-0-kernel.yaml`, `tamil-1-core.yaml` and
   `tamil-2-pro.yaml`, using the same kind of schema as Sinhala:
   - a `signs:` list on each consonant
   - a `groups:` block for the shape groups
   - a flag for Grantha letters
   - the either/or requirement from D4
   - `decompose:` entries: ொ = ெ+ா, ோ = ே+ா, ௌ = ெ+ௗ, ஔ = ஒ+ௗ
3. Update [`glyphsets/manifest.yaml`](../glyphsets/manifest.yaml) and make a
   MAJOR version bump, as its policy requires for renames.
4. Rewrite the Tamil sections of `naming-standard.md`, `levels.md` and
   `adopting-the-standard.md`.

### Phase 2: Standard tooling (lanka-glyphsets, ~3–4 days)

- **Reader and CLI:** add a script setting to the types and parser, and
  `--script tamil` to `list`, `info`, `generate`, `glyph-data`,
  `export-json` and `text-glyphs`. Add Tamil sign tables to the generators.
- **`glyphdata.ts`:** write `script="tamil"`; treat {U+0B82, U+0BC0, U+0BCD}
  as nonspacing; make visargaya a letter. Build on the `signSubCategory`
  change in that file.
- **Name ⇄ Unicode converter:** add a Tamil engine to `lankaglyphset-map.js`
  and a script toggle in the web UI.
- **Coverage:** add Tamil to `text-glyphs.ts` (mnik needs it for coverage
  numbers) and Tamil cluster tables to `font_coverage.py`.
- **Sync:** add the Tamil outputs to `scripts/sync-standard.mjs` so the drift
  check covers them.
- **Tests:** round-trip every Tamil name (name → text → name), and run the
  full consonant × vowel-sign grid (24 rows × 13 columns).

### Phase 3: lankafea for Tamil (~4–6 days)

1. **A Tamil candidate model** instead of the Sinhala one:
   - `akhn`: க்ஷ and ஸ்ரீ
   - `abvs`: ி/ீ ligatures or group-picked alternates
   - `psts`: ு/ூ forms, the hook group, and ா forms
   - `ssNN`: traditional orthography
   - no `pres` rules and no consonant + consonant conjuncts

   Expected: a few hundred candidates instead of about 8,200.
2. **Either/or requirements:** a font that does ி with ligatures shouldn't be
   told it's missing the alternate route, and the reverse.
3. **Naming:** fix the `nna2a` bug (`nnna` if D2 is accepted), and route
   ு/ூ to `psts`.
4. **Anchors:** a Tamil anchor profile, with aliases for the old names
   (`tm_halant`, `Anchor-N`, `Matra*`).
5. **Roadmap items:** finish R1 (mixed-script sources) and R2 (both suffix
   positions plus per-font alias tables).
6. **Acceptance test:** for each font, shape the full grid plus the
   `tamil-*.md` texts with the hand-written features and with the generated
   ones. Every difference must either match or be explained as a bug fix, as
   the Yaldevi `akhn` one would be. Add Tamil fixtures to `tests/`, and add
   Tamil to the Lanka Features plugin.

### Phase 4: Migrating the fonts (each font's own repo; ~1 day per font, 2–3 days for Abhaya)

Order:

1. Ralex: separate Tamil feature block, and its Sinhala is already
   lankafea-generated.
2. Vineetha: nearly free once Ralex is done.
3. Yaldevi
4. Abhaya: the largest, and needs R1.
5. Lankaverse Sans: map its old names through Unicode (strategy B).

For each font:

- a rename macro with a dry-run mode
- anchor renames
- generated features, with the font's own style lookups added through
  `--inject`
- the parity check
- an mnik build, QA and proof

### Phase 5: Design tools (sinhala-font-tools)

- **Quick wins once Phase 1 lands (~3 days):**
  - a Tamil glyph chart: consonant × vowel-sign grid with toggles for old
    orthography and stylistic sets
  - a "MNIK Tamil" sidebar filter for Glyphs
  - Tamil default strings in font-comparison
- **The models (needs designer input; weeks rather than days):**
  - **Composites.** `tamil-composites.yaml`, plus Tamil in composite-map and
    the Glyph Builder catalogue. Abhaya's components already make a usable
    first draft:
    - கி = ka + isign
    - ஔ = o + lla
    - ொ = esign + aasign
    - the numerals: ௧ = ka, ௭ = e
  - **Spacing.** `tamil-spacing.yaml`, with the spacing map, workbench and
    plugin generalised to both scripts.
  - **Design stages.** `tamil-design-dependencies.yaml` plus the stages
    viewer. This is the largest research task, and it's what mnik needs to
    gate Tamil proofs.
  - **Test generator.** Tamil grapheme splitting and a Tamil corpus (the UCSC
    corpus it uses is Sinhala).

### Phase 6: mnik

- Tamil coverage numbers in `doctor` and the registry, using
  `text-glyphs --script tamil`.
- Gate the Tamil proof sections once a Tamil `stages.json` exists. Until then,
  leave them ungated as they are now.

## 4. Dependencies

| Phase | Depends on |
|---|---|
| 0 Hotfixes | nothing |
| 1 Standard data and docs | D1–D6 |
| 2 Standard tooling | 1 |
| 3 lankafea | 1 (2 helps for tests) |
| 4 Font migrations | 1, 3 |
| 5 Design tools | 1 (quick wins); D7 and designer input (models) |
| 6 mnik | 2 (coverage); 5 design stages (proof gating) |

Phases 0 and 1 don't depend on D7.

## 5. Open questions

- Who signs off on what Sri Lankan Tamil requires? This matters most for
  Grantha ு/ூ and whether the pre-1978 forms are optional.
- Where does a Tamil text corpus come from for the test generator?
- Should the Tamil Supplement block be in scope for Tamil-2 Pro?
