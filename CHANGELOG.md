# Changelog

All notable changes to the **`@mooniak/lankaglyphsets`** npm package are
documented here. Once Tier 2 (Release Please) is enabled, entries below are
generated from Conventional Commits — see [docs/versioning.md](docs/versioning.md).

## Unreleased

- Embeds the LankaGlyphset standard `2.0.0` (breaking): the ss02 Fa glyphs, ෆ written as
  ප + f, are renamed `fPa`, `fPI`, `fPIi` → `fpa`, `fpI`, `fpIi`. Their other forms follow
  the usual rules from `fpa` (`fp`, `fpU`, `fpRa`, `fpa_repha` …); see
  docs/naming-standard.md. The converter map and generated data are regenerated.

## 0.2.0

- Embeds the LankaGlyphset standard `0.3.0`: the 30 Sinhala numerals in the Pro
  tier (10 lith digits, 20 archaic numbers) now carry Unicode values, so the
  name↔unicode engine resolves `lithzero-sinh` … `archaiconethousand-sinh`.

## 0.1.0

- Initial version: TypeScript glyphset registry, generators, and the `glyphsets`
  CLI. Embeds the LankaGlyphset standard `0.1.0` (`glyphsets/`).
