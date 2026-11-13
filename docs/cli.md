# CLI reference

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

## Scripts: `--script`

Every command takes `-s, --script <sinhala|tamil>` (default `sinhala`; `sinh`/`si` and
`taml`/`ta` also work). Sinhala has levels 0–3; **Tamil has levels 0–2**. A level you
don't give defaults per command (`list` 1, `glyph-data` and `export-json` the highest);
for Tamil a default above 2 is clamped to 2, so `glyph-data --script tamil` means all of
Tamil. An explicit level the script doesn't have is an error.

```bash
glyphsets list --script tamil -l 1        # Kernel + Core, including the sign alternates
glyphsets info -s tamil -l 2
```

## Commands

### `list` — list glyph names
```bash
glyphsets list -l 1                    # level 0–1 glyphs (default: 1)
glyphsets list -l 2 -c "Letters"       # filter by category
glyphsets list -l 3 -f json            # output as JSON
glyphsets list -l 1 -o glyphs.txt      # write to file
```
Formats: `txt` (default), `json`, `json-full`

### `categories` — list categories at a level
```bash
glyphsets categories -l 2
```

### `info` — glyph counts by category
```bash
glyphsets info -l 3
```

### `generate` — generate all glyph combinations from YAML
Produces consonant+sign, conjunct+sign, rakar, and touching cluster combinations derived from the `signs`, `conjunct`, and `touch` fields in the YAML.
```bash
glyphsets generate -l 2               # all types
glyphsets generate -l 2 -t signs      # only consonant-sign combinations
glyphsets generate -l 2 -f json -o out.json
glyphsets generate -s tamil -l 2 -f json     # the Tamil consonant × sign grid
```
Types: `all` (default), `base`, `signs`, `conjuncts`, `conjunct-signs`, `touching`

**Tamil.** Every Tamil consonant takes every sign, so `generate -s tamil` produces the full grid: 24 rows (23 consonants and க்ஷ) × 13 columns (inherent *a*, pulli and 11 vowel signs), plus `shree`. That is more than the five signs listed under `signs:` in the YAML, which are the anchors. With `-f json` each entry also says how the standard lets it be met:

| Field | Meaning |
|---|---|
| `canonical` | `true` if the glyphset enumerates the name at the level asked for. A name that is not (`kAa`, `k`) needs no glyph of its own: the consonant and the plain sign are enough |
| `level` | The lowest level (0 Kernel, 1 Core, 2 Pro) that enumerates it |
| `alternate` | The shape-group alternate that also meets the form (`isign-taml.ka` for `kI-taml`). A form is met by its own glyph **or** this alternate |
| `sequences` | Other spellings of the same glyph (`shree`: ஶ்ரீ and ஸ்ரீ) |

### `generate-info` — counts of generated combinations
```bash
glyphsets generate-info -l 2
```

### `text-glyphs` — extract glyph names required for a piece of text
```bash
glyphsets text-glyphs -t "කවිය"
glyphsets text-glyphs -i input.txt -f names -o glyphs.txt
echo "කවිය" | glyphsets text-glyphs
glyphsets text-glyphs -s tamil -t "கிளி நீ ஸ்ரீ" -f json
```
Formats: `txt` (default), `names` (one per line), `json`

**Tamil.** Text is read as clusters: consonant + sign (`kI`), consonant + pulli (`k`), `க்ஷ` + sign (`kSsI`), and `ஸ்ரீ` / `ஶ்ரீ` (`shree`). Any other consonant + pulli + consonant is two clusters. Numerals, symbols, ஃ, ZWJ/ZWNJ and the dotted circle are listed too. The `json` entries carry `sequence`, `components` (`["ka","isign"]`), `alternate`, `canonical` and `level`, with the meanings above, so a coverage check can follow the same rules as the standard. The `txt` and `names` formats stay plain names.

### `glyph-data` — generate `GlyphData.xml` for Glyphs app
Produces a `GlyphData.xml` from the YAML glyphsets. Glyph names are used exactly as defined (e.g. `ka-sinh`, `kVI-sinh`). Unicode, decompose, and sign anchors are included where defined. Signs get the Unicode subcategory: ි ී ු ූ ් and the attaching rasign/repha are `Nonspacing`; the vowel signs that advance (ා ැ ෑ ෘ ෙ–ෟ ෲ ෳ), ං ඃ and yansaya are `Spacing Combining`, which is what makes Glyphs set them after the base in auto-aligned composites.
```bash
glyphsets glyph-data -o tools/GlyphData.xml       # all levels (default: 3)
glyphsets glyph-data -l 1 -o MyFont/GlyphData.xml
glyphsets glyph-data -s tamil -o TamilGlyphData.xml   # all of Tamil, script="tamil"
```

For Tamil only ீ, ஂ and ் (Unicode `Mn`) are `Nonspacing`; the other vowel signs are `Spacing Combining`. The aytham ஃ is a letter, ௐ is a letter, ௹ is a `Symbol` / `Currency`, and the dotted circle is a `Symbol`. A shape-group alternate (`isign-taml.ka`) takes the subcategory of the sign it varies.

Place the output file in `~/Library/Application Support/Glyphs 3/Info/GlyphData.xml`.

### `export-json` — shared inventory for the browser tools
Emits the conjunct and touching-cluster maps and the letter table that the standalone tools use.
```bash
glyphsets export-json -f js -o tools/_generated/lanka-glyph-data.js
glyphsets export-json -s tamil -f js -o tools/_generated/lanka-glyph-data-tamil.js
```
The Tamil export sets `LankaGlyphDataTamil` (Sinhala sets `LankaGlyphData`) and adds two keys: `groups` (`sign → group → consonants`; the alternate for a group is `<sign>-taml.<group>`) and `grantha` (`ja sha ssa sa ha`).

## Tests

```bash
npm test      # builds, then runs tests/ with node --test
```
