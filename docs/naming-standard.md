# LankaGlyphset naming standard

> This document is **normative**. It defines how glyph names are formed for the
> Sinhala and Tamil glyphsets in `glyphsets/*.yaml`. A reference implementation
> of every rule below (both name→Unicode and Unicode→name) lives in
> [`tools/glyphname-unicode-converter/lankaglyphset-map.js`](../tools/glyphname-unicode-converter/lankaglyphset-map.js) —
> reuse it, don't reimplement these rules.

## Principles of the naming standard

1. Encode the visual forms of the glyphs in names instead of phonetic data.
2. Do not repeat data.
3. Keep it simple, explain and provide examples.
4. An underscore (_) joins existing glyphs to form a ligature of those glyphs, while a dot (.) appends a suffix to an existing glyph to form a variant of that glyph.

## Sinhala

### 1. Namespaces
Glyphs are suffixed with the script namespace using a hyphen:
- `-sinh` — Sinhala
- `-taml` — Tamil

Example: `ka-sinh` (Sinhala ka), `ka-taml` (Tamil ka)

A variant of a glyph appends a dot-suffix **after** the namespace: `isign-sinh.ka`,
`isign-taml.ka`. In the glyphset YAML the key is the bare name (`isign.ka`); the
namespace goes before the first dot.

> Implementation note: the name↔Unicode engine and the TypeScript parser still
> append the namespace last (`usign.rasign-sinh`). Making them follow this rule is
> tracked in [tamil-decisions.md](tamil-decisions.md#d1-suffix-after-the-namespace).

### 2. Sinhala Pillam (Vowel Signs / Matras)
Pillam are referred to as `signs` and indicated by the suffix `sign`.

Examples:
- `aesign-sinh` — ැ (aeda-pilla)
- `aasign-sinh` — ා (aela-pilla)
- `aaesign-sinh` — ෑ (diga aeda-pilla)
- `isign-sinh` — ි (is-pilla)
- `iisign-sinh` — ී (diga is-pilla)
- `usign-sinh` — ු (paa-pilla)
- `uusign-sinh` — ූ (diga paa-pilla)
- `esign-sinh` — ෙ (kombuwa)
- `eesign-sinh` — ේ (kombu deka)
- `osign-sinh` — ො (kombuwa + aela-pilla)
- `oosign-sinh` — ෝ (kombu deka + aela-pilla)
- `aisign-sinh` — ෛ (kombu deka + gayanukitta)
- `ausign-sinh` — ෞ (kombuwa + gaetta-pilla)

#### Required special signs
- `usign-sinh.rasign` — ්‍රු (u-sign after rasign)
- `uusign-sinh.rasign` — ්‍රූ (uu-sign after rasign)

#### Alternative signs
When ligatures are formed using GPOS instead of composite ligature glyphs, designers might need to have multiple alternative versions of the same sign.

Context-specific variants use the base consonant name as suffix:
- `isign-sinh.ka` — ි (variant for ka)
- `isign-sinh.da` — ි (variant for da)
- `isign-sinh.ya` — ි (variant for ya)
- `iisign-sinh.ka` — ී (variant for ka)
- `iisign-sinh.da` — ී (variant for da)
- `iisign-sinh.ya` — ී (variant for ya)

Style variants use dot suffixes:
- `esign-sinh._ui` — ෙ (UI/alternate style)
- `esign-sinh._ui._alt` — ෙ (alternate of UI style)
- `aisign-sinh._ui` — ෛ (UI/alternate style)

Virama length variants:
- `virama-sinh._long` — ් (long form)
- `virama-sinh._medium` — ් (medium form)
- `virama-sinh._short` — ් (short form)
- `virama-sinh._c` — ් (contextual form)

#### Special signs
- `virama-sinh` — ් Al-lakuna (vowel killer, similar to virama, halant)
- `rasign-sinh` — ්‍ර Rakaransaya (post-base `ra`)
- `repha-sinh` — ර්‍ Repaya (pre-base `ra`)
- `yasign-sinh` — ්‍ය Yansaya (post-base `ya`)
- `anusvaraya-sinh` — ං (binduwa)
- `visargaya-sinh` — ඃ (visargaya)

Shaping exceptions — bases where the rakaransaya/repaya/yansaya combination is
an attested exception form requiring individual design review — are recorded
in [`glyphsets/shaping-exceptions.yaml`](../glyphsets/shaping-exceptions.yaml).

### 3. Pure Consonant Ligatures (ligatures with virama)
These ligatures are composed by dropping the trailing `a` of the base glyphname to represent the consonant with virama (්), removing the inherent vowel.

- `k-sinh` — ක් (ka + virama)
- `kh-sinh` — ඛ් (kha + virama)
- `g-sinh` — ග් (ga + virama)
- `gh-sinh` — ඝ් (gha + virama)
- `ng-sinh` — ඞ් (nga + virama)
- `c-sinh` — ච් (ca + virama)
- `ch-sinh` — ඡ් (cha + virama)
...

### 4. Consonant-Vowel Ligatures
These ligatures are composed by dropping the trailing `a` of the base glyphname and combining the sign name. `I` = isign, `Ii` = iisign, `U` = usign, `Uu` = uusign.

කි = `kI-sinh` (ka + isign)

- `nI-sinh` — නි (na + isign)
- `nIi-sinh` — නී (na + iisign)
- `nU-sinh` — නු (na + usign)
- `nUu-sinh` — නූ (na + uusign)

### 5. Rakar Ligatures
Rakar ligatures are composed by adding a `R` indicating the *ra* in the encoded visual cluster.

- `kRa-sinh` — ක්‍ර (ka + rasign)
- `kRI-sinh` — ක්‍රි (ka + rasign + isign)
- `kRIi-sinh` — ක්‍රී (ka + rasign + iisign)
- `kR-sinh` — ක්‍ර් (ka + rasign + virama)
- `pRa-sinh` — ප්‍ර (pa + rasign)
- `tRa-sinh` — ත්‍ර (ta + rasign)

U/Uu combinations after rasign are handled by the special contextual signs `usign-sinh.rasign` and `uusign-sinh.rasign`.

### 6. Ligated Conjuncts (Sanyoga Akuru)
Ligated conjuncts are named by dropping the trailing `a` of the first base glyphname and combining it with the second base, capitalising the first letter of the second base.

- `kSsa-sinh` — ක්‍ෂ (ka + ssa)
- `tTha-sinh` — ත්‍ථ (ta + tha)
- `nDa-sinh` — න්‍ද (na + da)
- `nDha-sinh` — න්‍ධ (na + dha)
- `dVa-sinh` — ද්‍ව (da + va)

More complex ligatures formed with ligated conjuncts + signs:

- `nDa-sinh` — න්‍ද (na + da)
- `nDRa-sinh` — න්‍ද්‍ර (na + da + rasign)
- `nDRI-sinh` — න්‍ද්‍රි (na + da + rasign + isign)
- `nDRIi-sinh` — න්‍ද්‍රී (na + da + rasign + iisign)
- `nDU-sinh` — න්‍දු (na + da + usign)
- `nDUu-sinh` — න්‍දූ (na + da + uusign)

### 7. Touching Conjuncts (Bendi Akuru)
Touching conjuncts follow the same naming pattern as ligated conjuncts (Section 6). The `touch-sinh` glyph is a special reference/spacing glyph. Touching is primarily handled via the `dist` feature at the font level rather than as distinct atomic glyphs.

- `dVa-sinh` — ද්ව (touching da + va)
- `dVI-sinh` — ද්වි (touching da + va + isign)
- `dVIi-sinh` — ද්වී (touching da + va + iisign)
- `kVa-sinh` — ක්ව (touching ka + va)
- `tVa-sinh` — ත්ව (touching ta + va)

### 8. Historical and Stylistic Alternates
- `fa-sinh.001` — ෆ (historical Fa form)
- `esign-sinh._ui` — ෙ (alternate kombuwa style)

### 9. `da` and `da-like` ligatures with below-base forms of vowel signs
Below-base forms of vowel signs for `da`-like consonants are represented as contextual variants of the signs using the `._c` suffix:

- `aasign-sinh._c` — ා (aasign, below-base / contextual form for da-like consonants)
- `aesign-sinh._ui` — ැ (aesign, alternate form)
- `esign-sinh._c` — ෙ (esign, contextual form)

Yasign combinations with signs use underscore to join:
- `yasign_isign-sinh` — ්‍යි (yasign + isign)
- `yasign_iisign-sinh` — ්‍යී (yasign + iisign)
- `yasign_usign-sinh` — ්‍යු (yasign + usign)
- `yasign_uusign-sinh` — ්‍යූ (yasign + uusign)
- `yasign_virama-sinh` — ්‍ය් (yasign + virama)
- `aasign_virama-sinh` — ා් (aasign + virama)

### 10. Numerals
Sinhala has two encoded numeral sets, both in the Pro tier. Neither replaces the Western digits (`zero`…`nine`), which stay outside the `-sinh` namespace.

**Lith digits** (ලිත් ඉලක්කම්) — the astrological/almanac digits, prefixed `lith`: `lithzero-sinh` … `lithnine-sinh` (U+0DE6–U+0DEF). Positional decimal, so a zero exists.

**Archaic numbers** (පුරාණ ඉලක්කම්) — prefixed `archaic`, in the Sinhala Archaic Numbers block (U+111E1–U+111F4):

- `archaicone-sinh` … `archaicnine-sinh` (U+111E1–U+111E9)
- `archaicten-sinh`, `archaictwenty-sinh` … `archaicninety-sinh` (U+111EA–U+111F2)
- `archaiconehundred-sinh` (U+111F3), `archaiconethousand-sinh` (U+111F4)

The system is additive rather than positional, so there is no `archaiczero-sinh`, and each multiple of ten has its own sign. Multi-word values are written as one lowercase run (`onehundred`, `onethousand`), matching the Tamil `hundred-taml` / `thousand-taml` convention.

### Some complex examples

TODO: Add complex naming examples

## Anchor naming

A base glyph carries one anchor for each sign in its `signs:` list. The anchor is
named after the sign, and the sign glyph carries the same name with a leading
underscore.

| Sign | Base anchor | Sign anchor | Placed | Scripts |
|---|---|---|---|---|
| `virama` | `virama` | `_virama` | above | Sinhala, Tamil |
| `isign` | `isign` | `_isign` | above | Sinhala, Tamil |
| `iisign` | `iisign` | `_iisign` | above | Sinhala, Tamil |
| `repha` | `repha` | `_repha` | above | Sinhala |
| `usign` | `usign` | `_usign` | below | Sinhala, Tamil |
| `uusign` | `uusign` | `_uusign` | below | Sinhala, Tamil |
| `rasign` | `rasign` | `_rasign` | below | Sinhala |

- Shape-group alternates and stylistic alternates of a sign (`isign-taml.ka`,
  `esign-sinh._ui`) reuse the sign's anchor. There is no per-group anchor name.
- A font needs an anchor only for a sign it attaches. A sign that a font always
  draws as part of a ligature (`kI`) needs no anchor on that consonant.
- Sinhala's `iisign` anchor is optional.
- Fonts that use other anchor names (`tm_halant`, `MatraI.altN`, `Anchor-N`, the
  Noto names) rename them together with their glyphs.

---

## Tamil

Tamil glyphs use the `-taml` namespace and the same principles as Sinhala. The
glyph set is defined in three cumulative levels:
`glyphsets/tamil-0-kernel.yaml`, `tamil-1-core.yaml` and `tamil-2-pro.yaml` (see
[levels.md](levels.md)). The reasoning behind each choice below is in
[tamil-decisions.md](tamil-decisions.md).

### 1. Letters
Independent vowels and consonants keep their plain names: `a-taml` (அ),
`ka-taml` (க), `nna-taml` (ண, U+0BA3), `na-taml` (ந, U+0BA8), `nnna-taml` (ன,
U+0BA9). The aytham ஃ (U+0B83) is a letter, not a sign: `visargaya-taml`.

The Grantha letters are `ja-taml` (ஜ), `sha-taml` (ஶ, U+0BB6), `ssa-taml` (ஷ,
U+0BB7), `sa-taml` (ஸ) and `ha-taml` (ஹ).

### 2. Vowel signs
Vowel signs use the `sign` suffix, as in Sinhala:

- `aasign-taml` — ா (U+0BBE)
- `isign-taml` — ி (U+0BBF)
- `iisign-taml` — ீ (U+0BC0)
- `usign-taml` — ு (U+0BC1)
- `uusign-taml` — ூ (U+0BC2)
- `esign-taml` — ெ (U+0BC6)
- `eesign-taml` — ே (U+0BC7)
- `aisign-taml` — ை (U+0BC8)
- `osign-taml` — ொ (U+0BCA) = `esign` + `aasign`
- `oosign-taml` — ோ (U+0BCB) = `eesign` + `aasign`
- `ausign-taml` — ௌ (U+0BCC) = `esign` + `aulengthmark`
- `aulengthmark-taml` — ௗ (U+0BD7)

The same decomposition applies to ஔ: `au-taml` = `o` + `aulengthmark`. A sign is
built from its parts, never the reverse.

### 3. Special signs
- `virama-taml` — ் pulli (U+0BCD)
- `anusvaraya-taml` — ஂ (U+0B82)

### 4. Consonant + vowel-sign forms
A form is named by dropping the trailing `a` of the consonant and adding the
capitalised sign abbreviation:

| Sign | Abbreviation | Sign | Abbreviation |
|---|---|---|---|
| `aasign` ா | `Aa` | `eesign` ே | `Ee` |
| `isign` ி | `I` | `aisign` ை | `Ai` |
| `iisign` ீ | `Ii` | `osign` ொ | `O` |
| `usign` ு | `U` | `oosign` ோ | `Oo` |
| `uusign` ூ | `Uu` | `ausign` ௌ | `Au` |
| `esign` ெ | `E` | `virama` ் | *(none: `k`)* |

Only some forms are glyphs the standard asks for (the glyphset files list them). The
rest, such as `kAa` or `kE`, are valid by the same rule and need no glyph of their own:
the consonant and the plain sign are enough.

- `kI-taml` — கி (ka + isign)
- `pU-taml` — பு (pa + usign)
- `nnnUu-taml` — னூ (nnna + uusign)
- `ttI-taml` — டி (tta + isign)

A form can be met in either of two ways: by its own glyph (`kI-taml`), or by the
sign alternate of the consonant's shape group (`isign-taml.ka`, section 5). The
glyphset files say which forms each level needs, and the either/or applies
where the consonant belongs to a group of that sign. A consonant in no group of a
sign takes the plain sign glyph.

### 5. Shape-group alternates
A sign alternate is named for the group of consonants it is drawn for: the sign,
then the group after the namespace.

| Alternate | Consonants |
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

These are the standard's default members (the `groups:` blocks in the glyphset
files). A font may use a smaller group when it draws the rest as ligatures.

### 6. Ligated conjuncts
Named as in Sinhala, by dropping the trailing `a` of the first base and
capitalising the first letter of the second:

- `kSsa-taml` — க்ஷ (ka + ssa); with signs: `kSsI`, `kSsU`, `kSsUu`
- `shree-taml` — ஸ்ரீ and ஶ்ரீ. One glyph serves both spellings

### 7. Traditional orthography (Pro)
The pre-1978 forms are in the stylistic set `ss09`:

- `nnAa-taml` — ணா, `nnnAa-taml` — னா, `rrAa-taml` — றா
- `nnAi-taml` — ணை, `nnnAi-taml` — னை, `lAi-taml` — லை, `llAi-taml` — ளை
- `ra-taml.alt` — the alternate ர, a base glyph (not the `aasign` mark)

### 8. Numerals
Tamil numerals use plain names: `zero-taml` … `nine-taml` (U+0BE6–0BEF),
`ten-taml` (U+0BF0), `hundred-taml` (U+0BF1), `thousand-taml` (U+0BF2).

### 9. Symbols
- `om-taml` — ௐ (U+0BD0)
- Calendar and clerical marks use the `sign<name>` form: `signday-taml` (௳),
  `signmonth-taml` (௴), `signyear-taml` (௵), `signdebit-taml` (௶),
  `signcredit-taml` (௷), `signasabove-taml` (௸), `signnumber-taml` (௺)
- `indianrupee-taml` — ௹ Tamil rupee sign (U+0BF9)

### 10. Shared glyphs
Punctuation, `space`, `zerowidthjoiner` (U+200D), `zerowidthnonjoiner` (U+200C) and
`dottedCircle` (U+25CC) carry no namespace.
