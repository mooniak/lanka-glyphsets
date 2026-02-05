# Lanka glyphsets by Mooniak (WIP)

Lanka Glyphsets project by Mooniak aims to define glyphsets for fonts targeting Sri Lankan users and audiences. This is a work-in-progress project.

## Sinhala fonts level definition by ICTA
Sinhala fonts are standardized into three different levels by ICTA, but this definition is only based on the functionality and it does not provide a clear identification of number of glyphs or coverage. We will try to define these here.			

Quoted from ICTA documentation 
TODO: Add links

```
**Level 1 fonts**
These fonts commonly used vowels, consonants and consonants with modifiers and they are intended to be used in mobile devices. This level supports special characters such as yansaya,rakaransaya and repaya and “ක්ෂ”**

**Level 2 fonts** 
These fonts shall have all the features of level one font and additionally support existing combination of Sinhala consonants with repaya. These fonts are intended for general applications such as documents and books.  

**Level 3 fonts**
These fonts support special characters and all combinations of strokes with conjuncts including "repaya+ispilla" combinations and touching conjuncts. These fonts fully support Pali and Sanskrit languages and are intended for historic or classical Sinhala documents.
```

The Lanka Glyphsets levels (Sinhala 0-3) correspond directly to ICTA's classification: Sinhala 1, 2, and 3 map to ICTA Level 1, 2, and 3 respectively. Sinhala 0 (Kernel) is an additional minimal level introduced by this project for basic character support.

### Sinhala Glyphset

**Required ligature glyphs** 
  - Consonant-vowel ligatures

**Other glyphs** 
  - Rakar consonant clusters + modifier signs  
  - Ligated conjuncts + modifier signs
  - Touching consonants + modifier signs
  - Complex forms

### Sinhala 0 — Kernel
  - Consonants 41
  - Independent vowels 16
  - Semi Consonants  2
  - Sinhala Pillam (Consonants modifier signs) 13					
  - Signs (Unicode Named sequences) rakaransaya, yansaya, repaya

### Sinhala 1 — Core
- Sinhala Unicode block 
- Required ligature glyphs
- Touching consonant clusters implemented with dist feature
- ක්‍ෂ 

- Kundaliya (Sinhala punctuation sign)

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
- `aaSign` — (aela-pilla)
- `aaeSign` — (diga aeda-pilla)
- `iiSign` — (is-pilla)
- ...

#### Required special signs
- `uSign.rakar` — (u-sign after rakar)
- `uuSign.rakar` — (uu-sign after rakar)
- `ooSign.half` -  (` ා + ්`)

#### Alternative signs
When ligatures are formed using GPOS instead of composite ligature glyphs, designers might need to have multiple alternative versions of the same sign.

- `iSign.alt1`
- `iiSign.alt2`
- `iSign.alt2`
- `iiSign.alt1`
- `alSign.alt2`
- `iSign.midm`
- `iSign.long`
- `iSign.shrt`
- `iiSign.shrt`
- ...

#### Special signs
- `alSign` — Al-lakuna (vowel killer, similar to virama, halant)
- `raSign` — Rakaransaya (post-base `ra`)
- `rephSign` — Repaya (pre-base `ra`)
- `yaSign` — Yansaya (post-base `ya`)
- `anusvara` - 
- `visarga` - 

### 3. Consonant-Vowel Ligatures
These ligatures are composed by dropping the trailing `a` of the base glyphname and combining the sign name. 

කි = `ki` (ka + iiSign) -> `ki`

- `nii`
- `nu`
- `puu`

### 4. Rakar Ligatures
Rakar ligatures are composed by adding a `r` indicating the *ra* in the encoded visual cluster.

- ක්‍ර = `kra`
- ක්‍රි = `kri`

### 5. Ligated Conjuncts (Sanyoga Akuru)
Ligated conjuncts are named by dropping the trailing `a` of the first base glyphname and combining it with the second base, capitalising the first letter of the second base. 

-  ක්‍ෂ = `ka + ssa -> kSsa`
- ත්‍ථ = tTha
- න්‍ද `nDa`
- `dVa`
- `bBa`

More complex ligatures formed with ligated conjuncts + signs;

- `naDra`
- `naDrii` 


### 6. Touching Conjuncts (Bendi Akuru)
If touching conjuncts are designed as atomic glyphs, they are named using the `Touch` suffix:
- `dVaTouch`
- `dViiTouch`
- `bBraTouch`

### 7. Historical and Stylistic Alternates
- `fa.alt` — Historical Fa form (පf)
- `e-sign.hist`

### 8. `da` and `da-like` ligatures with below base forms of vowel signs  
- `daa` 
- `dya`
- `dyoo`


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