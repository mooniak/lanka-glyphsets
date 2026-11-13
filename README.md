# Lanka glyphsets by Mooniak (WIP)

Lanka Glyphsets project by Mooniak aims to define glyphsets for fonts targeting Sri Lankan users and audiences. This is a work-in-progress project.

It publishes one package from this repo:

- **`@mooniak/lankaglyphsets`** (npm) — the glyphset data reader + CLI, from `src/`.

Sinhala/Tamil OpenType feature generation and glyph-dependency validation
(**`mnik-lankafea`** on PyPI, plus the Lanka Features Glyphs plugin) now live in
[sinhala-font-tools](https://github.com/mooniak/sinhala-font-tools) under `tools/feature-generator/`, which reads
the standard from a sibling checkout of this repo.

## The standard

Four cumulative Sinhala levels (Kernel / Core / Plus / Pro), mapped to ICTA's
Level 1–3 classification, and three cumulative Tamil levels (Kernel / Core / Pro)
— defined in `glyphsets/*.yaml`. See [docs/levels.md](docs/levels.md) for the full
level comparison, and [docs/tamil-decisions.md](docs/tamil-decisions.md) for the
reasoning behind the Tamil levels.

Glyph names encode visual form rather than phonetics (e.g. `kRa-sinh` for ක්‍ර,
`kSsa-sinh` for ක්‍ෂ). The full normative naming rules are in
[docs/naming-standard.md](docs/naming-standard.md); if you're renaming an
existing font's glyphs to this standard, start at
[docs/adopting-the-standard.md](docs/adopting-the-standard.md).

## Repo map

```
glyphsets/                     the standard: 4 Sinhala + 3 Tamil tier YAMLs, manifest, shaping-exceptions.yaml
src/, dist/                    TypeScript reader + CLI (@mooniak/lankaglyphsets)
docs/                          naming standard, levels, CLI reference, adoption guide
tests/                         node --test suite (npm test): Tamil round-trip + grid, CLI, GlyphData
tools/
  glyphname-unicode-converter/ reference implementation: name <-> Unicode, + web UI
  font-coverage/                shaping-based conformance checker (HarfBuzz)
  _generated/                   exported data, vendored by downstream tools (e.g.
                                sinhala-font-tools/tools/glyph-chart)
```

## CLI

```bash
npm install
npm run build
node dist/cli/index.js list -l 1
node dist/cli/index.js text-glyphs -t "කවිය"
```

Full command reference: [docs/cli.md](docs/cli.md).
