# font_coverage.py

Report which Sinhala orthographic units a **font** can actually render, by
shaping each candidate Unicode string with HarfBuzz and inspecting the result.

This answers the question "what Unicode text rendering does this font support,
orthographically?" — and distinguishes the two failure modes that matter during
font development:

| Status                 | Meaning |
|------------------------|---------|
| `SUPPORTED`            | Renders correctly. For ligature candidates the expected precomposed glyph is actually formed. |
| `GLYPH_PRESENT_NO_FEA` | The precomposed glyph exists in the font, but no OpenType feature (GSUB / `.fea`) forms it — the shaper falls back to components. |
| `PARTIAL`              | Renders without `.notdef`, but the conjunct/ligature is not formed (components shown separately). |
| `UNSUPPORTED`          | A base codepoint has no glyph (`.notdef`). |

`GLYPH_PRESENT_NO_FEA` is exactly the "`kSsa` glyph is there but the fea isn't"
case.

## Install

```bash
pip install uharfbuzz fonttools
```

## Usage

```bash
# Supported Unicode strings, one per line (built-in Sinhala syllabary)
python3 tools/font_coverage.py MyFont.ttf

# Full breakdown with a summary
python3 tools/font_coverage.py MyFont.ttf --report

# Everything that renders legibly (formed ligatures + decomposed-but-no-notdef)
python3 tools/font_coverage.py MyFont.ttf --status SUPPORTED,PARTIAL

# Feed your own candidate set: output of `glyphsets generate -f json`
python3 tools/font_coverage.py MyFont.ttf --candidates candidates.json

# Or a plain text list (one sequence per line; optional `name<TAB>sequence`
# enables GLYPH_PRESENT_NO_FEA detection)
python3 tools/font_coverage.py MyFont.ttf --candidates words.txt
```

Notes:
- Ligature detection relies on the glyph-naming convention `name-sinh`
  (override with `--namespace`).
- Default output prints only `SUPPORTED`. Use `--status all` or a comma list to
  widen it. Consonant + vowel-sign combinations that a font renders via mark
  positioning (rather than a precomposed glyph) appear as `PARTIAL` — that is
  still correct orthography, so include `PARTIAL` if you want those too.
