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

### Some complex examples

TODO: Add complex naming examples

## Anchor naming
<TODO>
- Below base
    - usign
    - rasign

- Above base
    - virama
    - isign
    - iisign (optional)
    - repha

---

## Tamil

Tamil glyphs use the `-taml` namespace and follow the same naming principles as Sinhala (encode visual forms, join ligatures with the same rules). The full Tamil glyphset, with Unicode values, is defined in `glyphsets/tamil.yaml`.

### 1. Letters
Independent vowels and consonants keep their plain names: `a-taml` (அ), `ka-taml` (க), `nna-taml` (ண), `na-taml` (ந). The alveolar n ன (U+0BA9) is named `nna2-taml`.

### 2. Vowel signs (Pulli / Matras)
Vowel signs use the `sign` suffix, as in Sinhala:

- `aasign-taml` — ா (U+0BBE)
- `isign-taml` — ி (U+0BBF)
- `iisign-taml` — ீ (U+0BC0)
- `usign-taml` — ு (U+0BC1)
- `uusign-taml` — ூ (U+0BC2)
- `esign-taml` — ெ (U+0BC6)
- `eesign-taml` — ே (U+0BC7)
- `aisign-taml` — ை (U+0BC8)
- `osign-taml` — ொ (U+0BCA)
- `oosign-taml` — ோ (U+0BCB)
- `ausign-taml` — ௌ (U+0BCC)
- `aulengthmark-taml` — ௗ (U+0BD7)

### 3. Special signs
- `virama-taml` — ் pulli / virama (U+0BCD)
- `anusvaraya-taml` — ஂ (U+0B82)
- `visargaya-taml` — ஃ aytham (U+0B83)

### 4. Consonant–vowel ligatures
Composed by dropping the trailing `a` of the consonant and adding the capitalised sign abbreviation (`I` = isign, `Ii` = iisign, `U` = usign, `Uu` = uusign, `Aa` = aasign, `Ai` = aisign):

- `kI-taml` — கி (ka + isign)
- `nIi-taml` — நீ (na + iisign)
- `pU-taml` — பு (pa + usign)
- `nnAa-taml` — ணா (nna + aasign)
- `lAi-taml` — லை (la + aisign)

Note: ligatures of `nna2` (ன) keep provisional hyphenated names (`nna2-i-taml`, `nna2-aa-taml`, …) pending a naming decision, since the base has no trailing `a` to drop.

### 5. Ligated conjuncts
Named by dropping the trailing `a` of the first base and capitalising the first letter of the second base (same rule as Sinhala):

- `kSsa-taml` — க்ஷ (ka + ssa); with signs: `kSsI`, `kSsIi`, `kSsU`, `kSsUu`
- `shree-taml` — ஶ்ரீ (shri)

### 6. Numerals
Tamil numerals use plain names: `zero-taml` … `nine-taml` (U+0BE6–0BEF), `ten-taml` (U+0BF0), `hundred-taml` (U+0BF1), `thousand-taml` (U+0BF2).

### 7. Symbols
- `om-taml` — ௐ (U+0BD0)
- Calendar / clerical marks use the `sign<name>` form: `signday-taml` (௳), `signmonth-taml` (௴), `signyear-taml` (௵), `signdebit-taml` (௶), `signcredit-taml` (௷), `signasabove-taml` (௸), `signnumber-taml` (௺)
- `indianrupee-taml` — ௹ Tamil rupee sign (U+0BF9)

### 8. Stylistic alternates
Alternate sign forms append a dot-suffix before the namespace: `isign.alt1-taml` … `isign.alt7-taml`, `iisign.alt-taml`, `iisign.alt1-taml`, `usign.alt1-taml`, `aisign.alt-taml`.
