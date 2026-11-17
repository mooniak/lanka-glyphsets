# Tamil parity plan: standard, features and tooling

> Status: **in progress** (2026-11-13). **Phases 0 (hotfixes), 1 (standard data
> and docs), 2 (standard tooling) and 3 (lankafea)** are done; see §3. Phase 1
> applied the recommended option for D1–D6 as *working decisions* (see
> [tamil-decisions.md](tamil-decisions.md)); D4 still needs sign-off from a Tamil
> type specialist. Nothing from Phase 4 onward is implemented yet.

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
  where Ralex returns `kSsataml`. **Fixed** (Phase 0).
- **Yaldevi's old-orthography lookups are unreachable.** No feature references
  `taml-stylistic_alternates_1–4`, and the font has no `tml2` language system.
  **Fixed** (Phase 0).
- **Ralex has no outlines for 8 Tamil symbols:** ௰ ௲ ௵ ௶ ௷ ௸ ௹ ௺. The glyphs
  are empty and don't export. **Open**; carried to Phase 4 (Ralex).

Minor: Abhaya's `osign`, `oosign` and `ausign` composites include a
`dottedCircle` component. In Ralex, `aulengthmark` references `ausign`, which
is the reverse of the Unicode decomposition (ௌ = ெ + ௗ). Checked in Phase 0:
HarfBuzz decomposes ொ ோ ௌ before glyph lookup, so Abhaya's composites never
appear in shaped text. Left as is.

### 1.2 The standard (this repo)

- **`glyphsets/tamil.yaml` (replaced in Phase 1) was Abhaya's inventory
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

### Phase 0: Hotfixes (hours, no dependencies) — done 2026-11-13

- **Yaldevi:** done, in `yaldevi-font` commit `20214d95` (on `dev`, not pushed).
  - `taml-akhands` moved under `script taml;`, and `tml2` added to `akhn`,
    `abvs` and `psts` (plus `languagesystem tml2 dflt;`). `taml` and `tml2` now
    carry identical lookups in GSUB and GPOS.
  - The four old-orthography lookups are wired to `salt` and `ss01`–`ss04`,
    the same way Ralex does it. The sets are unnamed, and D6 may renumber them.
  - `kSsa-taml` had stale anchor names (`MatraIi.alt1`, `virama`), so ீ and the
    pulli landed on the க half of the conjunct once it became reachable.
    Renamed to `MatraIi` and `tm_halant`, with `tm_halant` placed on the ஷ half.
  - Checked with `hb-shape`: க்ஷ gives `kSsa-taml`, and ஸ்ரீ and ஶ்ரீ give
    `shree-taml`, in the static Regular and the variable font. Across a
    323-cluster grid, only those 16 க்ஷ / ஸ்ரீ items changed. Unreachable
    Tamil lookups went from 7 to 0.
- **Abhaya Libre:** checked, no change. The same grid is clean, with no
  unreachable lookups and `taml` = `tml2`. The `dottedCircle` note under §1.1
  has no effect on shaped text.
- **Ralex:** the 8 empty symbols (௰ ௲ ௵ ௶ ௷ ௸ ௹ ௺) are **not being drawn**
  (decided 2026-11-17): the coverage claim is dropped. They are already
  non-exporting stubs, so nothing ships; Ralex does not meet Tamil-0 Kernel's
  "full Unicode block" and should not be described as doing so.

### Phase 1: Standard data and docs (lanka-glyphsets, ~2–3 days plus review) — done 2026-11-13

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

**Done**, uncommitted. The standard is now **1.0.0**. Details are in
[tamil-decisions.md](tamil-decisions.md). What Phase 1 settled that the plan
left open, and what it found:

- **`ss09`** is the stylistic set for the traditional orthography (D6 asked for
  one but didn't pick).
- **Anchors** are one per sign in the consonant's `signs:` list: `virama`,
  `isign`, `iisign`, `usign`, `uusign` (D5 named three).
- **The either/or rule** applies only where a consonant is in a shape group of
  that sign. Consonants in no group take the plain sign, so ி on ண ன ர ள and ீ on
  all but ட ல ஸ need no glyph. That drops 22 of the old 44 ி/ீ requirements.
- **New required names:** `ngU` `yU` `vU` (met by `usign-taml.pa`), `sUu`,
  `ra.alt`. ஶு and ஶூ are deliberately left out.
- **`groups:` and `grantha:` are top-level keys**, so the three files already
  load in the TypeScript parser and lankafea's loader with no changes.
- **D1 is not what Sinhala does.** The Sinhala engine composes `usign.rasign-sinh`,
  while the naming standard says `usign-sinh.rasign`. Tamil follows the text.
  See the D1 caveat in tamil-decisions.md.
- **Not committed:** the npm package version and CHANGELOG (a release-time step
  under [versioning.md](versioning.md)) and the git tag `standard@1.0.0`.
  `package.json` `standardVersion` is updated so `npm run check:drift` passes.

**Hand-off to Phase 2:**

- Compose dotted names with the namespace before the first dot (D1), for both
  scripts. *(Phase 2 did this for Tamil only; see the Phase 2 notes.)*
- Read `groups:` (merge across the three files) and expand each group into its
  `<sign>-taml.<group>` alternate. Read `grantha:`.
- `build-glyphset.js` treats any entry whose keys are not all in `ATTRS` as a
  nested category, and lankafea's loader does the same with `_METADATA_KEYS`.
  Tamil entries use only the existing attributes, so this does not bite yet; keep
  it that way or extend both lists.
- Support the `Placeholders` category and `dottedCircle` (no namespace).

**Hand-off to Phase 3:** lankafea's `tamil_profile()` has
`yaml_files=("tamil.yaml",)`, and its test asserts that file exists. That file is
gone, so Tamil in lankafea breaks as soon as its bundled copy of the glyphsets is
rebuilt, or when it runs from the sibling checkout. (Today the bundled
`src/lankafea/data/glyphsets/`, git-ignored and copied in at build time, still
has the old file and takes priority.) The profile needs the three new filenames,
and the `nna2` stem in the Tamil table in `scripts.py` needs to become `nnna`.

### Phase 2: Standard tooling (lanka-glyphsets, ~3–4 days) — done 2026-11-13

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

**Done**, uncommitted. All of the above, with these differences and findings:

- **Sinhala is unchanged.** Every Sinhala CLI output (89 files: all commands and
  levels) is byte-identical to before, and the three Sinhala generated artifacts
  did not change. In particular the D1 hand-off ("compose dotted names the same
  way for both scripts") was **not** applied to Sinhala: that would rename
  `usign.rasign-sinh` and friends, and the decision is open (D1 caveat). The
  composition is a per-script setting (`dotSuffix`), so it is one line each in
  `src/core/scripts.ts` and `build-glyphset.js` when it is made.
- **The grid is generated, not read from `signs:`.** Every Tamil consonant takes
  every sign, so `generate -s tamil` gives 24 × 13 = 312 forms plus `shree` (313);
  the YAML's five `signs:` are the anchors.
- **Pre-base signs needed names.** `E Ee O Oo Au` were added by analogy with
  Sinhala, for forms the standard does not ask for (naming-standard.md §4).
- **`text-glyphs` and `generate` say how a name may be met** (Tamil only):
  `canonical`, `level`, `alternate`, `components`. This is the either/or rule in
  data, so mnik can compute coverage the way the standard defines it. The
  Sinhala JSON keeps its shape.
- **`font_coverage.py --script tamil`** reads `tamil-candidates.json`, generated
  from the standard by `npm run sync`, so there is no second Tamil table to keep
  in step. `--level 0|1|2` checks a font against one level. **Its name matching
  now also tries the hyphen-stripped form** (`kItaml`), because built fonts drop
  hyphens; without it no built Tamil font could match. That also changes Sinhala
  results on built fonts, only upward: on Yaldevi's Sinhala 17 candidates moved
  from `GLYPH_PRESENT_NO_FEA` to `SUPPORTED` (the ligature was formed) and one from
  `PARTIAL` to `GLYPH_PRESENT_NO_FEA`.
- **Not done:** the browser tool `font-coverage.html` is still Sinhala only.
- **First tests in this repo:** `tests/` (63, `node --test`; `npm test`), run in CI.
  They found one bug before it shipped (the Pro `ai` forms were not marked with
  their alternate).
- **`build-glyphset.js` now fails on an unknown per-glyph attribute**, so a new YAML
  attribute can no longer be silently registered as a glyph.
- **Other:** `formatAsGlyphData` is now exported from the package.
- **Vendored copy:** `sinhala-font-tools/tools/glyphname-unicode-converter/` is an
  older copy of the converter and has not been re-synced.

**Hand-off to Phase 3:** `tamil-candidates.json` and `export-json --script tamil`
(`groups`, `grantha`) are the standard's Tamil model in a form lankafea can read;
its `tamil_profile()` can use `generate --script tamil` as the list of forms and
the either/or rule instead of the Sinhala model.

### Phase 3: lankafea for Tamil (~4–6 days) — done 2026-11-13

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

**Done**, in `sinhala-font-tools/tools/feature-generator` (uncommitted; 127 tests). What
it found, and where it differs from the list above:

- **A Tamil model of its own** (`tamil.py`), about 141 candidate rules. A form is met by its
  own glyph **or** its shape-group alternate; a resolver decides from the font's glyphs which
  route applies, so the route not taken is never reported. Only the forms the standard
  enumerates are *required* (by `--level` 0–2); the rest are generated when the font has them
  and never reported when it doesn't. `ss09` holds the traditional forms, kept out of the
  default features. ு/ூ go to `psts`; `nna2a` is `nnna`.
- **Acceptance** (the 24 × 13 grid, both ஸ்ரீ spellings and the five Tamil test texts, 1,108
  strings per font, hand-written build against generated):

  | Font | Default features | Traditional | Unexplained |
  |---|---|---|---|
  | Abhaya Libre | 1108 / 1108 identical | 1108 / 1108 (`ss09`) | 0 |
  | Ralex | 1099 / 1108 | matches (`ss02`+`ss04` vs `ss09`) | 0 |
  | Yaldevi | 1067 / 1108 | not comparable: the built TTF registers no `ss`/`salt` | 0 |

  Every difference is a glyph the font **already has that its hand-written features never
  form**: Ralex's `lI-taml`; Yaldevi's `sI sIi sU sUu ssU ssUu kSsU kSsUu`, and `kSsa` /
  `shree` in its stale build (the Phase 0 `akhn` bug, the case this plan named). The
  generated features reach them. Whether each glyph is wanted is a design decision for Phase 4.
- **What each font still lacks** (the standard's requirements it does not meet): Ralex 11 —
  `jU jUu ssU ssUu sU sUu hU hUu kSsU kSsUu` and `ra.alt`; Yaldevi 4 — `jU jUu hU hUu`;
  Abhaya 2 — `sUu` and `ra.alt`. This is Phase 4's to-do list per font.
- **R1 and R2 are done.** Both scripts in one source can be generated one after the other
  (script-tagged ownership, per-script class manifest and `Languagesystems`, collisions keyed
  on tag and script, `script taml;`-scoped bodies); the Glyphs plugin shares the rules. Both
  positions of a dot-suffix and `.NNN` variants are recognised. For R2's "per-font alias
  tables": `--aliases FILE` names a font's own glyphs, and `--adopt-legacy-names` finds the
  deterministic renames (`nna2`, the dot-suffix side). Which numbered `isign.altN` is which
  group is per font and cannot be derived; tables for Ralex and Yaldevi are in
  `tests/fixtures/tamil-aliases/` (verified against their classes), Abhaya's alt3–alt7 stay
  unverified.
- **Anchors:** a Tamil profile that accepts the legacy names, reads `Anchor-N` from the mark
  glyph itself, and only expects an anchor on a consonant with no dedicated glyph for the sign.
- **Not done:** a Tamil glyph-info (Mark/Spacing) check; running the plugin inside Glyphs (its
  writeback is tested against a stand-in API, and it generates one script at a time);
  Vineetha and Lankaverse Sans in the acceptance run.
- **Side effect worth knowing:** the (gitignored) bundled glyphsets in lankafea were stale and
  held the removed `tamil.yaml`; `setup.py` now deletes files the standard no longer has.
- **R2 changes Sinhala output, on purpose.** Compared against the committed code on real
  fonts: Abhaya Libre generates the same `.fea`; Maname, Dinamina and Aggnni gain `aalt` and
  `ss01`–`ss03`, because their alternates are named after the namespace (`fa-sinh.alt`) and
  the old parser built unmatchable names (`fa-sinh-sinh`) from them, dropping them silently
  and listing them as blockers. Orphan detection also reports more glyphs (`rasign-sinh.long`,
  `ka_repha-sinh.001`). That is the bug R2 described, fixed; a Sinhala font that hand-writes
  those features keeps them (a collision keeps the designer's code).

**Hand-off to Phase 4:** the alias tables above are the rename macro's starting point;
`lankafea validate --script tamil --adopt-legacy-names --aliases …` is the per-font parity
check, and it should report every font's gaps (above) and no unexplained difference.

### Phase 4: Migrating the fonts (each font's own repo; ~1 day per font, 2–3 days for Abhaya)

Order:

1. Ralex: **migrated 2026-11-17** (branch `tamil-standard-names`, commit
   `e1a43c3`, not pushed). See "Ralex" below.
2. Vineetha: nearly free once Ralex is done.
3. Yaldevi
4. Abhaya: the largest, and needs R1.
5. Lankaverse Sans: map its old names through Unicode (strategy B).

**Ralex, done 2026-11-17** (`python -m lankafea.migrate`, new in
`sinhala-font-tools/tools/feature-generator`):

- 16 glyphs renamed (listing in the commit message), anchors `Anchor-0/2/3/4`
  → `virama`, `usign`+`uusign`, `iisign`, `usign`. The hand-written Tamil GSUB
  is replaced by generated `akhn abvs psts ss09`. Ralex's own `ss01` (ர as ா),
  `ss03` (flatter ி ீ) and `salt` are kept in `sources/tamil-styles.fea`
  (raw `.fea` via `--inject-file`). The hand-written Tamil GPOS (`abvm`/`blwm`)
  is kept with renamed glyphs; lankafea does not generate GPOS.
- **Parity** (same 1,108 strings as Phase 3, migrated source compiled against the
  committed build): default features 1099/1108, traditional (`ss02`+`ss04` vs
  `ss09`) 1099/1108, `ss01` and `ss03` 1099/1108. The 9 differences are all லி:
  the font's own `lI-taml` ligature is now formed where the hand-written features
  left `la` + `isign-taml.la`. **Design decision open:** keep the ligature, or
  draw/remove it.
- **User-visible feature changes:** the old `ss02` and `ss04` are now both in
  `ss09`; `salt` still applies everything.
- **Still open for Ralex:** the 11 missing forms (`jU jUu ssU ssUu sU sUu hU hUu
  kSsU kSsUu`, `ra.alt`); the `ra`-as-`aasign` hack in `ss01` (D6 wants a real
  `ra.alt`); a font **build, QA and proof** (not run; the committed
  `fonts/ttf` still has the old names, so the Ralex acceptance test now skips);
  the 2 consonants missing a `virama` anchor (ja, nya) and the mark anchors on
  `isign-taml.ca/.ka` etc.
- **Found on the way:** lankafea's package writer renamed glyphs with a leading
  dot (`.part.al_comp`), leaving a duplicate file; fixed.

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
