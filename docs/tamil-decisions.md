# Tamil decisions

Decisions D1–D7 from the [Tamil parity plan](tamil-plan.md), as applied in the
Tamil glyphsets (`tamil-0-kernel.yaml`, `tamil-1-core.yaml`, `tamil-2-pro.yaml`)
at **standard 1.0.0**.

Phase 1 was done with the plan's recommended option for each decision. That
makes them **working decisions**, not signed-off ones: change them here and in
the YAML together. Where Phase 1 had to fill a gap the plan left open, it is
marked **clarified** below.

| | Decision | Status |
|---|---|---|
| D1 | Dot-suffix goes after the namespace (`isign-taml.ka`) | Working. **Caveat:** Sinhala tooling composes it the other way (see D1) |
| D2 | ன is `nnna` | Working |
| D3 | Alternates are named by shape group | Working; **clarified** (plain-sign rule) |
| D4 | Three Tamil levels; a form can be met in either of two ways | Working; **needs Tamil type specialist sign-off**, especially Grantha ு/ூ |
| D5 | Anchors are named after the sign they attach | Working; **clarified** (the set of anchors) |
| D6 | Feature conventions | Working; **clarified** (`ss09`) |
| D7 | Tamil design tools live in sinhala-font-tools | Not touched by Phase 1 |

## D1: suffix after the namespace

A variant keeps the namespace on the base name and appends the variant after it:
`isign-taml.ka`, `usign-taml.pa`, `ra-taml.alt`. This is what
[naming-standard.md](naming-standard.md) already said for Sinhala
(`isign-sinh.ka`), and what Ralex and Vineetha do.

In the YAML the key is the **bare** name: `isign.ka`, `ra.alt`. A reader inserts
the namespace before the first dot.

**Caveat — Sinhala disagrees with its own prose.** The glyph-name engine
(`lankaglyphset-map.js`) and the TypeScript parser append the namespace last, so
the Sinhala data produces `usign.rasign-sinh` and `daa._c-sinh`, while the
naming standard's text says `usign-sinh.rasign`. Yaldevi's Sinhala follows the
engine; Ralex's follows the prose. Tamil follows the prose.

**Phase 2** made the composition a per-script setting (`dotSuffix` in
`src/core/scripts.ts`, mirrored in `build-glyphset.js`): Tamil is `after`, and
Sinhala stays `before`, so no Sinhala name or output changed. Switching Sinhala
is one line in each place plus the rename, but it is another MAJOR change and
the decision is not made. Whether Sinhala should change, or the prose should be
corrected, is undecided and not a Tamil question.

## D2: ன is `nnna`

`nna2` becomes `nnna` (U+0BA9 is TAMIL LETTER NNA, ண is `nna`). Dropping the
`a` then works like every other consonant: `nnnI`, `nnnU`, `nnnAa`. The
"Provisional" category is gone.

## D3: alternates by shape group

A sign alternate is named for the group of consonants it is drawn for. The
groups, and the members the standard assumes:

| Alternate | Members |
|---|---|
| `isign-taml.ka` | ka ta |
| `isign-taml.ca` | ca |
| `isign-taml.na` | nya na |
| `isign-taml.pa` | nga pa ya va |
| `isign-taml.ma` | ja ma rra zha sha ha |
| `isign-taml.la` | la sa |
| `isign-taml.ssa` | ssa kSsa |
| `iisign-taml.la` | la sa |
| `usign-taml.pa` | nga pa ya va |
| `aisign-taml.la` | nna nnna la lla |

These match Ralex exactly. Yaldevi's differ in two places: its `ma` group is
ma sha ha (ja, rra and zha are ligatures there), and its `pa` group has no ya
(also a ligature). A font may use a smaller group if it covers the rest with
ligatures.

**Clarified — the plain sign.** A consonant that is in no group of a sign takes
the plain sign glyph. That is how Yaldevi and Ralex already handle ண ன ர ள with
ி, and every consonant except ட ல ஸ with ீ. It needs no glyph in the standard.

Group members are checked in the data (`groups:` in each tier file). Each group
member has a form entry, so a tool can ask "is `kI` there, or `isign-taml.ka`?"

## D4: levels

| | Kernel | Core | Pro |
|---|---|---|---|
| Unicode block U+0B80–0BFF | all 72 assigned characters | | |
| Shaping and punctuation | space, ZWJ, ZWNJ, dotted circle, the 34 punctuation glyphs Sinhala's Kernel lists | | |
| ி / ீ | ட + ி / ீ (always a glyph) | every consonant that has a shape group: 19 ி forms, 2 ீ forms | |
| ு / ூ | the 18 native consonants (36 forms) | Grantha: ஜ ஷ ஸ ஹ and க்ஷ (10 forms) | |
| Conjuncts | க்ஷ, ஸ்ரீ / ஶ்ரீ | க்ஷ + ி | |
| Traditional orthography | | | ணா னா றா; ணை னை லை ளை; alternate ra |
| Entries | 150 | 31 | 8 |

### The either/or rule

A consonant + sign form is met in **either** of two ways:

1. a dedicated glyph named by the form (`kI-taml`), or
2. the sign alternate of the consonant's shape group (`isign-taml.ka`), placed
   with an anchor.

This applies to a form only if its consonant is in a group of that sign. Four
Kernel forms use it: ஙு பு யு வு (via `usign-taml.pa`). Forms with no group are
dedicated glyphs only: ட + ி / ீ, the other 14 native ு forms, all 18 ூ forms,
and the Grantha ு/ூ forms.

### What changed from the old `tamil.yaml`

The old file copied Abhaya's inventory. These **stop being required** (they stay
valid names, and Abhaya keeps them):

- ி on ண ர ள (`nnI` `rI` `llI`), and ன (`nna2-i`). The plain sign covers them.
- ீ on every consonant except ட ல ஸ: `kIi` `cIi` `jIi` `tIi` `nIi` `nnIi` `nyIi`
  `ngIi` `pIi` `mIi` `yIi` `rIi` `llIi` `vIi` `shIi` `ssIi` `hIi` `zhIi` `rrIi`
  `kSsIi`, and ன (`nna2-ii`).
- Of the 44 ி/ீ ligatures that were all "Required", 22 still are (as a glyph or a
  group alternate) and 22 are not.

These are **new requirements**: `ngU` `yU` `vU` (met by `usign-taml.pa`), `sUu`,
`ra.alt`, ZWNJ, dotted circle, and the Kernel punctuation.

These **moved level**: the pre-1978 forms went from required to Pro. The
Grantha ு/ூ forms are Core, not Kernel.

Left out on purpose:

- **ஶு ஶூ.** ஶ is used almost only in ஶ்ரீ, which is already a Kernel ligature.
- **`rI.alt` `rIi.alt`** (Yaldevi has them): commented out in `tamil-2-pro.yaml`
  until a Tamil specialist says whether the alternate ra needs its own ி/ீ forms.
- **The Tamil Supplement block** (U+11FC0–11FFF). Open question 3 in the plan;
  not guessed.

## D5: anchors

An anchor is named after the sign it attaches, and the sign glyph carries the
same name with a leading underscore: `isign` / `_isign`.

**Clarified.** The plan names three pairs. The standard names one per sign in
the consonant's `signs:` list: `virama`, `isign`, `iisign`, `usign`, `uusign`.
Shape-group and stylistic alternates reuse the sign's anchor; there is no
per-group anchor name (Yaldevi's `MatraI.altN` become `isign`). Sinhala's list
is filled in from the same rule: see "Anchor naming" in
[naming-standard.md](naming-standard.md).

lankafea checks these anchors. It accepts the legacy names (`tm_halant`, `MatraI.altN`,
`MatraIi`, `MatraU`), reads an `Anchor-N` from the sign glyph's own `_Anchor-N`, and says
which anchors should be renamed. Only a consonant with no dedicated glyph for a sign needs
the anchor, since a ligature carries its own mark position.

### Sign abbreviations

**Clarified.** The standard defined `Aa I Ii U Uu Ai`. The text analyzer, the engine
and `generate` also have to name the pre-base signs, so Phase 2 wrote the rest by
analogy with Sinhala: `E` (ெ), `Ee` (ே), `O` (ொ), `Oo` (ோ), `Au` (ௌ); see the table
in [naming-standard.md](naming-standard.md). None of these forms is a glyph the
standard asks for; they are valid names, and the consonant and the plain sign are
enough.

## D6: features

- Register both `taml` and `tml2`, with identical lookups.
- `akhn`: க்ஷ and ஸ்ரீ, accepting both ஶ and ஸ.
- `abvs`: ி / ீ forms. `psts`: ு / ூ and ா forms.
- A real `ra-taml.alt` base glyph for the alternate ra (GDEF base class).
  Ralex and Yaldevi swap in `aasign-taml`, which is a mark.

**Clarified — `ss09`.** The plan asks for "one fixed `ssNN`" and doesn't pick it.
Phase 1 picked **`ss09`**, which is what Abhaya uses, and which doesn't collide
with Sinhala's `ss01`–`ss03`. The category in `tamil-2-pro.yaml` is named
`ss09 Traditional orthography`. Yaldevi's Phase 0 fix uses `ss01`–`ss04` and
Ralex splits it across `ss02` and `ss04`; both move to `ss09` in Phase 4.

## D7

Unchanged. Phase 1 adds nothing to sinhala-font-tools.

## What the YAML adds to the Sinhala schema

Everything Sinhala already has still works (`unicode`, `decompose`, `signs`,
`conjunct`, `Exclude namespace from`). Tamil adds:

| Where | What |
|---|---|
| top level `groups:` | `sign → group → [members]`. Each tier file lists only the groups it introduces; readers merge them. The alternate's name is `<sign>.<group>` |
| top level `grantha:` | The Grantha letters: `ja sha ssa sa ha`. Their ு/ூ forms are Core |
| `signs:` on a consonant | Every Tamil consonant: `[virama, isign, iisign, usign, uusign]`. As in Sinhala, this is the set of signs it combines with, and the anchors it carries |
| `decompose:` | `au` `osign` `oosign` `ausign`, following the Unicode decompositions |
| category `Placeholders` | `dottedCircle` (U+25CC). No namespace |
| category `ss09 Traditional orthography` | Same style as Sinhala's `ss02 Fa` |

`groups:` and `grantha:` are top-level on purpose: both existing readers
(the TypeScript parser and lankafea's loader) ignore unknown top-level keys, so
the three files loaded with no reader change, and give the same glyph counts as
above. The entries use only attributes the readers already know.

**Phase 2** teaches this repo's readers about them: the parser expands `groups:`
into the "Sign alternates" glyphs and marks each form with the alternate that also
meets it (`Glyph.alternate`); `grantha:` becomes `Glyph.grantha`; the engine's
`build-glyphset.js` does the same, and now **fails** on an unknown per-glyph
attribute instead of registering it as a glyph. lankafea's loader still needs the
same (Phase 3).

## Rename table: old → new

### In the standard

The old `tamil.yaml` had 182 names. All are accounted for:

| Outcome | Count | Names |
|---|---|---|
| Unchanged | 140 | Letters, signs, numerals, symbols, `kSsa`, `shree`, and the forms still required |
| Moved category | 1 | `visargaya`: Signs → Letters |
| Renamed | 10 | `nna2`→`nnna`, `nna2-i`→`nnnI`, `nna2-ii`→`nnnIi`, `nna2-u`→`nnnU`, `nna2-uu`→`nnnUu`, `nna2-aa`→`nnnAa`, `nna2-ai`→`nnnAi`, `usign.alt1`→`usign-taml.pa`, `iisign.alt1`→`iisign-taml.la`, `aisign.alt`→`aisign-taml.la` |
| Replaced by group alternates | 7 | `isign.alt1` … `isign.alt7`: see the table below, the numbering differs per font |
| No equivalent | 1 | `iisign.alt`: Abhaya's component inside seven ீ ligatures. Keep it as a font-specific glyph |
| No longer required | 23 | See D4. Two more, `nnnI` and `nnnIi`, are counted in the Renamed row |

### In each font

Every dotted name moves its suffix after the namespace (D1). Beyond that:

- **Alternate numbering → group names.** Verified from the font sources, except
  Abhaya's alt3–alt7 (no feature or component uses them; check the drawn shape
  against the group's members in the Phase 4 dry run).

  | New | Ralex, Vineetha | Yaldevi | Abhaya |
  |---|---|---|---|
  | `isign-taml.ssa` | `isign-taml.alt1` | `isign.alt1-taml` | unverified |
  | `isign-taml.ma` | `alt2` | `alt2` | `alt2` (used by `mI` `zhI`) |
  | `isign-taml.la` | `alt3` | `alt3` | unverified |
  | `isign-taml.ca` | `alt4` | `alt4` | unverified |
  | `isign-taml.ka` | `alt5` | `alt5` | unverified |
  | `isign-taml.na` | `alt6` | `alt6` | unverified |
  | `isign-taml.pa` | `alt7` | `alt7` | `alt1` |

- **ன.** Abhaya, Ralex and Vineetha: `nna2-taml` → `nnna-taml`, `nna2-u-taml` →
  `nnnU-taml`, and so on (Abhaya's provisional `nna2-i` …). Yaldevi already uses
  `nnna`; its `nnnAa-taml.alt` becomes `nnnAa-taml`.
- **Old-orthography glyphs.** Yaldevi and Ralex name them as alternates:
  `nnAa.alt`, `rrAa.alt`, `nnnAa.alt` / `nna2-aa.alt` → `nnAa-taml`,
  `rrAa-taml`, `nnnAa-taml`. They are the same glyph the standard now names
  directly. Yaldevi's `ra.alt` → `ra-taml.alt`.
- **Other alternates.** `usign.alt1` → `usign-taml.pa`; `iisign.alt1` (Yaldevi,
  Ralex) → `iisign-taml.la`; `aisign.alt` → `aisign-taml.la`.
- **Not in the standard; keep, but move the suffix:** `isign.alt8`,
  `isign.stylalt1`, `iisign.stylalt1`, `iisign.alt2`, `iisign.alt3`.
- **Lankaverse Sans.** Its old-style names (`tmKA`, `tmmI`) are not renamed by
  rule; map them through Unicode (strategy B in
  [adopting-the-standard.md](adopting-the-standard.md)).

## Open questions

- **Sign-off on D4**, from a Tamil type specialist: which Grantha ு/ூ forms are
  required, and whether the pre-1978 forms stay optional.
- **Sinhala suffix position** (D1 caveat).
- **`rI.alt` / `rIi.alt`**: required in Pro, or left to the font?
- **Tamil Supplement block**: in scope for Pro?
- **Dotted circle** is now in the Tamil Kernel; Sinhala's Kernel doesn't list it.
  Add it there too (MINOR)?
- **`ss09`**: confirm, or pick another number.
