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
4. An underscore (_) joins existing glyphs to form a ligature of those glyphs, while a dot (.) appends a suffix to an existing glyph to form a variant of that glyph.

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

## CLI Tools

Install dependencies and build:

```bash
npm install
npm run build
```

Run commands via:
```bash
node dist/cli/index.js <command> [options]
# or after npm link / install:
glyphsets <command> [options]
```

### Commands

#### `list` — list glyph names
```bash
glyphsets list -l 1                    # level 0–1 glyphs (default: 1)
glyphsets list -l 2 -c "Letters"       # filter by category
glyphsets list -l 3 -f json            # output as JSON
glyphsets list -l 1 -o glyphs.txt      # write to file
```
Formats: `txt` (default), `json`, `json-full`

#### `categories` — list categories at a level
```bash
glyphsets categories -l 2
```

#### `info` — glyph counts by category
```bash
glyphsets info -l 3
```

#### `generate` — generate all glyph combinations from YAML
Produces consonant+sign, conjunct+sign, rakar, and touching cluster combinations derived from the `signs`, `conjunct`, and `touch` fields in the YAML.
```bash
glyphsets generate -l 2               # all types
glyphsets generate -l 2 -t signs      # only consonant-sign combinations
glyphsets generate -l 2 -f json -o out.json
```
Types: `all` (default), `base`, `signs`, `conjuncts`, `conjunct-signs`, `touching`

#### `generate-info` — counts of generated combinations
```bash
glyphsets generate-info -l 2
```

#### `text-glyphs` — extract glyph names required for a piece of text
```bash
glyphsets text-glyphs -t "කවිය"
glyphsets text-glyphs -i input.txt -f names -o glyphs.txt
echo "කවිය" | glyphsets text-glyphs
```
Formats: `txt` (default), `names` (one per line), `json`

#### `glyph-data` — generate `GlyphData.xml` for Glyphs app
Produces a `GlyphData.xml` from the YAML glyphsets. Glyph names are used exactly as defined (e.g. `ka-sinh`, `kVI-sinh`). Unicode, decompose, and sign anchors are included where defined.
```bash
glyphsets glyph-data -o tools/GlyphData.xml       # all levels (default: 3)
glyphsets glyph-data -l 1 -o MyFont/GlyphData.xml
```

Place the output file in `~/Library/Application Support/Glyphs 3/Info/GlyphData.xml`.

---

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
