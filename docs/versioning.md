# Versioning

This repo ships **three independently versioned things**. They are related but
move on their own cadence — a fix to one does not force a release of the others.

| # | Component | Version lives in | Published as |
|---|-----------|------------------|--------------|
| 1 | **The standard** (the glyphset data itself) | [`glyphsets/manifest.yaml`](../glyphsets/manifest.yaml) → `version` | — (the thing fonts pin to) |
| 2 | **npm package** — TS CLI + registry, bundles the standard | [`package.json`](../package.json) → `version` | `@mooniak/lankaglyphsets` |
| 3 | **PyPI package** — `lankafea` validator + feature generator | [`tools/feature-generator/pyproject.toml`](../tools/feature-generator/pyproject.toml) → `version` (mirrored in [`__init__.py`](../tools/feature-generator/src/lankafea/__init__.py)) | `mnik-lankafea` |

The **standard** in `glyphsets/` is the single source of truth. Both packages
*embed a copy* of it, so a change to the naming standard lands in
`glyphsets/*.yaml` first, then the packages pick it up.

## The model: standard-anchored, independent SemVer

Each package versions on its own, and **records which standard version it
embeds** so downstream consumers can check compatibility:

- npm records it as `standardVersion` in `package.json`, and bundles
  `glyphsets/` (including `manifest.yaml`) in its tarball.
- lankafea bundles `glyphsets/*.yaml` into its wheel at build time (see
  [`setup.py`](../tools/feature-generator/setup.py)), so `manifest.yaml` — and
  therefore the standard version — travels with the installed package.

### What each version number means

**Standard version** (`glyphsets/manifest.yaml`) — SemVer with data semantics:

- **MAJOR** — breaking: a glyph is renamed or removed, or a name→unicode mapping
  changes. Fonts/tools built against the old version may break.
- **MINOR** — additive: new glyphs or conjuncts added to a tier. Existing fonts
  stay valid.
- **PATCH** — metadata / comment / spelling fix only; no glyph-identity change.

**Package versions** — ordinary SemVer for that package's own API/CLI surface.
Bump a package when *either* its own code **or** its embedded data changed. A
CLI-only fix does not require a lankafea release, and vice versa.

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

> The lankafea copy of the YAMLs is **not** in this list: its `setup.py` copies
> `glyphsets/*.yaml` into the wheel at build time and the on-disk copy is
> gitignored, so it is drift-proof by construction.

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
   - lankafea: edit `version` in `pyproject.toml` **and** `__version__` in
     `src/lankafea/__init__.py` (keep them equal).
3. Tag per component so history is unambiguous:
   ```sh
   git tag standard@0.1.0
   git tag lankaglyphsets@0.1.0
   git tag lankafea@0.2.0
   git push --tags
   ```
4. Publish (when ready):
   - `npm publish` (runs `prepublishOnly` → `check:drift` first)
   - lankafea: `cd tools/feature-generator && python -m build && twine upload dist/*`

## Enabling Tier 2 (Release Please — staged, currently off)

The automation is already committed but **inert**:

- [`release-please-config.json`](../release-please-config.json) +
  [`.release-please-manifest.json`](../.release-please-manifest.json) — declare
  the two packages (node + python) and their current versions.
- [`.github/workflows/release-please.yml`](../.github/workflows/release-please.yml)
  — gated on a repo variable, so it does nothing until you opt in.

To turn it on:

1. Start writing [Conventional Commits](https://www.conventionalcommits.org)
   (`feat:`, `fix:`, `feat!:` / `BREAKING CHANGE:` for majors).
2. In the repo: **Settings → Secrets and variables → Actions → Variables** →
   add `ENABLE_RELEASE_PLEASE` = `true`.

Once on, each push to `main` opens/updates a **release PR per package** that
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
# PyPI is best done with Trusted Publishing (OIDC, no stored token) — configure
# the publisher at https://pypi.org/manage/project/mnik-lankafea/settings/publishing/
```

> Note: the standard itself (`glyphsets/manifest.yaml`) is **not** managed by
> Release Please — it has no package to publish. Bump its `version` by hand as
> part of the change that touches the YAMLs, and tag it `standard@x.y.z`.
