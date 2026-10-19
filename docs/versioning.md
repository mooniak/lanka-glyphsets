# Versioning

This repo ships **two independently versioned things**. They are related but
move on their own cadence — a fix to one does not force a release of the other.

| # | Component | Version lives in | Published as |
|---|-----------|------------------|--------------|
| 1 | **The standard** (the glyphset data itself) | [`glyphsets/manifest.yaml`](../glyphsets/manifest.yaml) → `version` | — (the thing fonts pin to) |
| 2 | **npm package** — TS CLI + registry, bundles the standard | [`package.json`](../package.json) → `version` | `@mooniak/lankaglyphsets` |

The **standard** in `glyphsets/` is the single source of truth. The npm package
*embeds a copy* of it, so a change to the naming standard lands in
`glyphsets/*.yaml` first, then the package picks it up.

The PyPI package **`mnik-lankafea`** (feature generator + validator) used to be
a third component here. It now lives, and is versioned and released, in
[sinhala-font-tools](https://github.com/mooniak/sinhala-font-tools) (`tools/feature-generator/`). It
still embeds this standard: its `setup.py` copies `glyphsets/*.yaml` from a
sibling checkout of this repo into the wheel at build time, so `manifest.yaml`
— and the standard version — travels with the installed package.

## The model: standard-anchored, independent SemVer

The package versions on its own, and **records which standard version it
embeds** so downstream consumers can check compatibility: npm records it as
`standardVersion` in `package.json`, and bundles `glyphsets/` (including
`manifest.yaml`) in its tarball.

### What each version number means

**Standard version** (`glyphsets/manifest.yaml`) — SemVer with data semantics:

- **MAJOR** — breaking: a glyph is renamed or removed, or a name→unicode mapping
  changes. Fonts/tools built against the old version may break.
- **MINOR** — additive: new glyphs or conjuncts added to a tier. Existing fonts
  stay valid.
- **PATCH** — metadata / comment / spelling fix only; no glyph-identity change.

**Package versions** — ordinary SemVer for that package's own API/CLI surface.
Bump a package when *either* its own code **or** its embedded data changed.

## The one rule that keeps it honest: no drift

Several tracked files are **generated** from `glyphsets/*.yaml`. If you edit the
YAMLs but forget to regenerate, the packages ship stale data. One command
regenerates everything:

```sh
npm run sync
```

It rebuilds, in dependency order:

1. `tools/glyphname-unicode-converter/lankaglyphset-map.js` — the name↔unicode engine
2. `tools/_generated/shaping-exceptions.js` — depends on (1)
3. `tools/_generated/lanka-glyph-data.js` — the CLI's `export-json` output

`npm run check:drift` runs the same regeneration and then **fails** if any
committed artifact changed, or if `package.json`'s `standardVersion` disagrees
with `manifest.yaml`. It runs in [CI](../.github/workflows/ci.yml) and as
`prepublishOnly`, so a publish can never ship stale data.

**Workflow when you change the standard:** edit `glyphsets/*.yaml` →
`npm run sync` → commit the YAMLs *and* the regenerated artifacts together.

## Cutting a release (Tier 1, manual — active today)

1. Make sure the tree is synced: `npm run sync` and commit any changes.
2. Bump the version(s) that actually changed:
   - Standard: edit `version` in `glyphsets/manifest.yaml`. If a package now
     embeds it, also bump that package's `standardVersion`.
   - npm: `npm version <patch|minor|major>` (updates `package.json`).
3. Tag per component so history is unambiguous:
   ```sh
   git tag standard@0.1.0
   git tag lankaglyphsets@0.1.0
   git push --tags
   ```
4. Publish (when ready):
   - `npm publish` (runs `prepublishOnly` → `check:drift` first)

## Enabling Tier 2 (Release Please — staged, currently off)

The automation is already committed but **inert**:

- [`release-please-config.json`](../release-please-config.json) +
  [`.release-please-manifest.json`](../.release-please-manifest.json) — declare
  the npm package and its current version.
- [`.github/workflows/release-please.yml`](../.github/workflows/release-please.yml)
  — gated on a repo variable, so it does nothing until you opt in.

To turn it on:

1. Start writing [Conventional Commits](https://www.conventionalcommits.org)
   (`feat:`, `fix:`, `feat!:` / `BREAKING CHANGE:` for majors).
2. In the repo: **Settings → Secrets and variables → Actions → Variables** →
   add `ENABLE_RELEASE_PLEASE` = `true`.

Once on, each push to `main` opens/updates a **release PR** that
bumps the version and writes the CHANGELOG. Merging it tags the release. To also
auto-publish, add a job triggered on the release tag:

```yaml
# in .github/workflows/release-please.yml, after the release-please step
# (npm — needs an NPM_TOKEN secret):
  publish-npm:
    needs: release-please
    if: ${{ needs.release-please.outputs['--release_created'] }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }
      - run: npm ci && npm publish
        env: { NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} }
```

> Note: the standard itself (`glyphsets/manifest.yaml`) is **not** managed by
> Release Please — it has no package to publish. Bump its `version` by hand as
> part of the change that touches the YAMLs, and tag it `standard@x.y.z`.
