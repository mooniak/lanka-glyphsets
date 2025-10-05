# Lanka glyphsets by Mooniak (WIP)

Lanka Glyphsets project by Mooniak aims to define glyphsets for fonts made targeting Sri Lankan users and audeinces. This is a work-in-progress project.


## PRINCIPALS


## NAMING STANDARD

1. Encode the visual forms of the glyphs in names instead of phonetic data.
   (`ka-i` represents the visual forms ක + ි as opposed to its phonetic or Unicode reresentation of `ක් + ි`)
2. An underscore (_) joins existing glyphs to form a ligature of those glyphs, while a dot (.) appends a suffix to an existing glyph to form a variant of that glyph.

< TODO ADD EXAMPLE >

An underscore (_) joins existing glyphs to form a ligature of those glyphs, while a dot (.) appends a suffix to an existing glyph to form a variant of that glyph.

## Glyph Naming Convention

### 1. Namespaces
- `sinh` — Sinhala
- `taml` — Tamil

### 2. Sinhala Pillam (Vowel Signs / Matras)
Pillam are called `signs` and indicated with the phonetic indicator suffixed by `-sign`.

Examples:
- `aa-sign` — (aela-pilla)
- `aae-sign` — (diga aeda-pilla)
- `i-sign` — (is-pilla)
- `ae-sign` — (aeda-pilla)
- `ii-sign` — (diga is-pilla)
- ...

#### Requierd signs

- `u-sign.rakar` — (u-sign after rakar)
- `uu-sign.rakar` — (uu-sign after rakar)
- `aa-sign.al` -  (` ා + ්`)

#### Alternative signs
When ligaturs are formed using GPOS instead of composite ligature glyphs, designer might need to have multiple alternative versions of same sign.

- `i-sign.alt1`
- `ii-sign.alt2`
- `i-sign.alt2`
- `ii-sign.alt1`
- `al-sign.alt2`
- `i-sign.midm`
- `i-sign.long`
- `i-sign.shrt`
- `i-sign.shrt`
- ...

#### Special signs
- `al-sign` — Al-lkuna (vowel killer, similar to virama, halant)
- `rakar-sign` — Rakaransaya (post-base `ra`)
- `repha-sign` — Repaya (pre-base `ra`)
- `yansa-sign` — Yansaya (post-base `ya`)

### 4. Consonant-Vowel Ligatures
- `ka-i`
- `na-ii`
- `na-u`
- `pa-uu`

### 5. Rakar Ligatures
- `ka-rakar`
- `ka-rakar-ii`
- `ma-rakar`
- `ma-rakar-i`

### 6. Ligated Conjuncts (Sanyoga Akuru)
- `ka_ssa`
- `na_da`
- `da_va`
- `ba_ba`
- `na_da-i`
- `na_da-rakar-ii`

### 7. Touching Conjuncts (Bendi Akuru)
- `da_va.touch`
- `da_va-ii.touch`
- `ba_ba.touch`

### 8. Historical and Stylistic Alternates
- `fa.hist` — Historical Fa form (පf)
- `e-sign.hist`

### 9. `da` and `da-like` ligatures with below base forms of pillam 
- `da_aa-sign.belw`
- `da_yansa-sign.belw`


### Some complex examples
- `na_da-rakar-i`
- `na_da-rakar-i`
- `da_va-rakar-ii`
- `ssa-reph-ii` 
- `da-rakar-i-sinh`
- `da-rakar-ii-sinh`
- `ka_va-al`
- `ka_ssa-rakar-ii`
- `da_va-repha-ii`


## Anchor naming

- Below base
    - uSign
    - rakar

- Above base 
    - alSign
    - iSign
    - iiSign (optional)
    - repha


### Sinhala Glyphset

**Requierd ligature glyphs** 
  - Consonant-vowel ligatures

**Other glyphs** 
  - Rakar consonant clusters + modifier signs  
  - Ligated conjuncts + modifier signs
  - Touching consonants + modifier signs
  - Complex forms

### Sinhala 0 — Kernal
  - Consonants 41
  - Independent vowels 16
  - Semi Consonants  2
  - Sinhala Pillam (Consonants modifier signs) 13					
  - Signs (Unicode Named sequesnces) rakaransaya, yanasaya, repaya

### Sinhala 1 — Core
- Sinhala Unicode block 
- Requierd ligature glyphs
- Touching consonant clusters implemented with dist feature
- ක්‍ෂ 

- Kundaliya (Sinhala puncuation sign)

### Sinhala 2 — Plus
  - Common ligated conjuncts (සංයෝග අකුරු sanyoga akuru)

### Sinhala 3 — Pro
  - `da` and `da-like` ligatures with below base forms of pillam (දා දැ දැ ඳෝ ද්‍ය ද්‍ය ද්‍යා ඤා ඤැ ඤැ ඥැ ඥැ ඥෝ) 
  - Historical Fa form (පf)
  - Historical kombuwa
  - Rare ligated conjuncts (සංයෝග අකුරු sanyoga akuru) ඞ්‍ග, ච්‍ච, ඤ්‍ච, ඤ්‍ඡ, ඤ්‍ජ, ණ්‍ඩ, බ්‍බ, ම්‍බ
  - Sinhala Archaic Numbers   - 20
  — Sinhala Astrological Numbers - 10
  - Touching consonant clusters (බැඳි අකුරු bandi akuru)

***

## Sinhala fonts level definition by ICTA
Sinhala fonts are standardized into three different levels by ICTA, but this definition is only based on the functionality and it does not provide a clear identification of number of glyphs or coverage. We will try to define these here.			

Qoted from ICTA documentation 
TODO: Add links

```
**Level 1 fonts**
These fonts commonly used vowels, consonants and consonants with modifiers and they are intended to be used in mobile devices. This level supports special characters such as yansaya,rakaransaya and repaya and “ක්ෂ”**

**Level 2 fonts** 
These fonts shall have all the features of level one font and additionally support existing combination of Sinhala consonants with repaya. These fonts are intended for general applications such as documents and books.  

**Level 3 fonts**
These fonts support special characters and all combinations of strokes with conjuncts including “repaya+ispilla” combinations and touching conjuncts. These fonts fully support Pali and Sanskrit langauges and are intended for historic or classical Sinhala documents.
```