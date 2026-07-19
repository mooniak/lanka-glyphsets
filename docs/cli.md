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
```
Types: `all` (default), `base`, `signs`, `conjuncts`, `conjunct-signs`, `touching`

### `generate-info` — counts of generated combinations
```bash
glyphsets generate-info -l 2
```

### `text-glyphs` — extract glyph names required for a piece of text
```bash
glyphsets text-glyphs -t "කවිය"
glyphsets text-glyphs -i input.txt -f names -o glyphs.txt
echo "කවිය" | glyphsets text-glyphs
```
Formats: `txt` (default), `names` (one per line), `json`

### `glyph-data` — generate `GlyphData.xml` for Glyphs app
Produces a `GlyphData.xml` from the YAML glyphsets. Glyph names are used exactly as defined (e.g. `ka-sinh`, `kVI-sinh`). Unicode, decompose, and sign anchors are included where defined.
```bash
glyphsets glyph-data -o tools/GlyphData.xml       # all levels (default: 3)
glyphsets glyph-data -l 1 -o MyFont/GlyphData.xml
```

Place the output file in `~/Library/Application Support/Glyphs 3/Info/GlyphData.xml`.
