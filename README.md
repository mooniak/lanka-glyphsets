# Lanka glyphsets by Mooniak (WIP)

Lanka Glyphsets project by Mooniak aims to define glyphsets for fonts targeting Sri Lankan users and audiences. This is a work-in-progress project.

## Four levels

- Sinhala-0: Kernel — Minimal character set with essential consonants, vowels, and basic signs for fundamental Sinhala text display.
- Sinhala-1: Core — Standard coverage for mobile devices with common ligatures and basic conjuncts like ක්‍ෂ.
- Sinhala-2: Plus — Extended support with common ligated conjuncts (සංයෝග අකුරු) for general documents and books.
- Sinhala-3: Pro — Complete coverage including historical forms, rare conjuncts, and full Pali/Sanskrit support for classical texts.


The Lanka Glyphsets levels (Sinhala 0-3) correspond directly to ICTA's classification: Sinhala 1, 2, and 3 map to ICTA Level 1, 2, and 3 respectively. Sinhala 0 (Kernel) is an additional minimal level introduced by this project for basic character support.

### Sinhala Glyphset Comparison

| Feature | Sinhala 0 — Kernel | Sinhala 1 — Core | Sinhala 2 — Plus | Sinhala 3 — Pro |
|---------|-------------------|------------------|------------------|-----------------|
| **Target Use** | Basic text display | Mobile devices | Documents & books | Classical texts |
| **Base Characters** | Consonants (41), Independent vowels (16), Semi-consonants (2) | Full Sinhala Unicode block | *Inherits from Core* | *Inherits from Plus* |
| **Pillam (Modifier Signs)** | 13 basic signs | ✓ | ✓ | ✓ |
| **Special Signs** | rakaransaya, yansaya, repaya | ✓ | ✓ | ✓ |
| **Consonant-Vowel Ligatures** | — | Required ligatures | ✓ | ✓ |
| **Touching Clusters** | — | Via `dist` feature | ✓ | බැඳි අකුරු (bandi akuru) |
| **Basic Conjuncts** | — | ක්‍ෂ | ✓ | ✓ |
| **Common Ligated Conjuncts** | — | — | සංයෝග අකුරු (sanyoga akuru) | ✓ |
| **Rare Ligated Conjuncts** | — | — | — | ඞ්‍ග, ච්‍ච, ඤ්‍ච, ඤ්‍ඡ, ඤ්‍ජ, ණ්‍ඩ, බ්‍බ, ම්‍බ |
| **da-like Below-base Forms** | — | — | — | දා දැ ඳෝ ද්‍ය ද්‍යා ඤා ඤැ ඥැ ඥෝ |
| **Historical Forms** | — | — | — | Fa form (පf), Historical kombuwa |
| **Punctuation** | — | Kundaliya | ✓ | ✓ |
| **Archaic Numbers** | — | — | — | 20 glyphs |
| **Astrological Numbers** | — | — | — | 10 glyphs |

### Glyph Categories

**Required ligature glyphs**
  - Consonant-vowel ligatures

**Other glyphs**
  - Rakar consonant clusters + modifier signs
  - Ligated conjuncts + modifier signs
  - Touching consonants + modifier signs
  - Complex forms

***

## PRINCIPLES OF NAMING STANDARD

1. Encode the visual forms of the glyphs in names instead of phonetic data.
2. Do not repeat data.
3. Keep it simple, explain and provide examples.
4. An underscore (_) joins existing glyphs to form a ligature of those glyphs, while a dot (.) appends a suffix to an existing glyph to form a variant of that glyph. Exception: Touching conjuncts use the `Touch` suffix (see Section 6).

### 1. Namespaces
- `sinh` — Sinhala
- `taml` — Tamil

### 2. Sinhala Pillam (Vowel Signs / Matras)
Pillam are referred to as `signs` and indicated by the suffix `Sign`.

Examples:
- `aSign` — ැ (aeda-pilla)
- `aaSign` — ා (aela-pilla)
- `aaeSign` — ෑ (diga aeda-pilla)
- `iSign` — ි (is-pilla)
- `iiSign` — ී (diga is-pilla)
- `uSign` — ු (paa-pilla)
- `uuSign` — ූ (diga paa-pilla)
- `eSign` — ෙ (kombuwa)
- `eeSign` — ේ (kombu deka)
- `oSign` — ො (kombuwa + aela-pilla)
- `ooSign` — ෝ (kombu deka + aela-pilla)
- `aiSign` — ෛ (kombu deka + gayanukitta)
- `auSign` — ෞ (kombuwa + gaetta-pilla)

#### Required special signs
- `uSign.rakar` — ්‍රු (u-sign after rakar)
- `uuSign.rakar` — ්‍රූ (uu-sign after rakar)
- `ooSign.half` — ෝ් (kombu deka + aela-pilla + al-lakuna)

#### Alternative signs
When ligatures are formed using GPOS instead of composite ligature glyphs, designers might need to have multiple alternative versions of the same sign.

- `iSign.alt1` — ි (alternate 1)
- `iSign.alt2` — ි (alternate 2)
- `iiSign.alt1` — ී (alternate 1)
- `iiSign.alt2` — ී (alternate 2)
- `alSign.alt2` — ් (alternate 2)
- `iSign.midm` — ි (medium width)
- `iSign.long` — ි (long/wide variant)
- `iSign.shrt` — ි (short/narrow variant)
- `iiSign.shrt` — ී (short/narrow variant)

#### Special signs
- `alSign` — ් Al-lakuna (vowel killer, similar to virama, halant)
- `raSign` — ්‍ර Rakaransaya (post-base `ra`)
- `rephSign` — ර්‍ Repaya (pre-base `ra`)
- `yaSign` — ්‍ය Yansaya (post-base `ya`)
- `anusvara` — ං (binduwa)
- `visarga` — ඃ (visargaya)

### 3. Consonant-Vowel Ligatures
These ligatures are composed by dropping the trailing `a` of the base glyphname and combining the sign name.

කි = `ki` (ka + iSign) -> `ki`

- `ni` — නි (na + iSign)
- `nii` — නී (na + iiSign)
- `nu` — නු (na + uSign)
- `nuu` — නූ (na + uuSign)
- `pe` — පෙ (pa + eSign)
- `pee` — පේ (pa + eeSign)
- `po` — පො (pa + oSign)
- `poo` — පෝ (pa + ooSign)

### 4. Rakar Ligatures
Rakar ligatures are composed by adding a `r` indicating the *ra* in the encoded visual cluster.

- `kra` — ක්‍ර (ka + raSign)
- `kri` — ක්‍රි (ka + raSign + iSign)
- `kru` — ක්‍රු (ka + raSign + uSign)
- `kruu` — ක්‍රූ (ka + raSign + uuSign)
- `pra` — ප්‍ර (pa + raSign)
- `tra` — ත්‍ර (ta + raSign)

### 5. Ligated Conjuncts (Sanyoga Akuru)
Ligated conjuncts are named by dropping the trailing `a` of the first base glyphname and combining it with the second base, capitalising the first letter of the second base.

- `kSsa` — ක්‍ෂ (ka + ssa)
- `tTha` — ත්‍ථ (ta + tha)
- `nDa` — න්‍ද (na + da)
- `nDha` — න්‍ධ (na + dha)
- `dVa` — ද්‍ව (da + va)
- `bBa` — බ්‍බ (ba + ba)
- `mBa` — ම්‍බ (ma + ba)

More complex ligatures formed with ligated conjuncts + signs:

- `nDa` — න්‍ද (na + Da)
- `nDra` — න්‍ද්‍ර (na + Da + raSign)
- `nDri` — න්‍ද්‍රි (na + Da + raSign + iSign)
- `nDrii` — න්‍ද්‍රී (na + Da + raSign + iiSign)


### 6. Touching Conjuncts (Bendi Akuru)
If touching conjuncts are designed as atomic glyphs, they are named using the `Touch` suffix:
- `dVaTouch` — ද්ව (touching da + va)
- `dViTouch` — ද්වි (touching da + va + iSign)
- `dViiTouch` — ද්වී (touching da + va + iiSign)
- `bBaTouch` — බ්බ (touching ba + ba)
- `bBraTouch` — බ්බ්‍ර (touching ba + ba + raSign)

### 7. Historical and Stylistic Alternates
- `fa.alt` — ෆ (historical Fa form)
- `eSign.hist` — ෙ (historical kombuwa)

### 8. `da` and `da-like` ligatures with below base forms of vowel signs
- `daa` — දා (da + aaSign with below-base form)
- `dae` — දැ (da + aSign with below-base form)
- `daae` — දෑ (da + aaeSign with below-base form)
- `dya` — ද්‍ය (da + yaSign)
- `dyaa` — ද්‍යා (da + yaSign + aaSign)
- `dyo` — ද්‍යො (da + yaSign + oSign)
- `dyoo` — ද්‍යෝ (da + yaSign + ooSign)
- `nyaa` — ඤා (nya + aaSign with below-base form)
- `nyae` — ඤැ (nya + aSign with below-base form)


### Some complex examples

TODO: Add complex naming examples

## Anchor naming

- Below base
    - uSign
    - raSign

- Above base
    - alSign
    - iSign
    - iiSign (optional)
    - repha


**A word about Sinhala fonts level definitions by ICTA** Sinhala fonts are standardized into three different levels by ICTA, but this definition is only based on the functionality and it does not provide a clear identification of number of glyphs or coverage. We will try to define these here.

Quoted from ICTA documentation
TODO: Add links

```
**Level 1 fonts**
These fonts commonly used vowels, consonants and consonants with modifiers and they are intended to be used in mobile devices. This level supports special characters such as yansaya,rakaransaya and repaya and "ක්ෂ"**

**Level 2 fonts**
These fonts shall have all the features of level one font and additionally support existing combination of Sinhala consonants with repaya. These fonts are intended for general applications such as documents and books.

**Level 3 fonts**
These fonts support special characters and all combinations of strokes with conjuncts including "repaya+ispilla" combinations and touching conjuncts. These fonts fully support Pali and Sanskrit languages and are intended for historic or classical Sinhala documents.
```
