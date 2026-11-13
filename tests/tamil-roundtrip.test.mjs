// Round-trip every Tamil glyph name: name → text → name, with the expected text
// derived from the raw YAML and the Unicode signs, not from the code under test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGlyphsetsCumulative, TAMIL_SIGNS } from '../dist/index.js';
import { engine, rawGlyphset, TAMIL_FILES, chr } from './helpers.mjs';

const TIER = ['kernel', 'core', 'pro'];
const glyphs = loadGlyphsetsCumulative(2, 'tamil');

// Oracle: consonant name → its character, from the raw YAML.
const consonantChar = new Map();
for (const file of TAMIL_FILES) {
  for (const [name, meta] of Object.entries(rawGlyphset(file).categories.Letters ?? {})) {
    if (meta?.signs) consonantChar.set(name, chr(meta.unicode));
  }
}
const signBy = new Map(TAMIL_SIGNS.map(s => [s.suffix, s]));

/** Expected text for a consonant + sign form name, found by trying every consonant stem. */
function expectedFormText(name) {
  const bases = [...consonantChar.keys(), 'kSsa'];
  for (const base of bases) {
    const stem = base.endsWith('a') ? base.slice(0, -1) : base;
    if (!name.startsWith(stem)) continue;
    const suffix = name.slice(stem.length);
    const sign = signBy.get(suffix);
    if (!sign) continue;
    const baseText = base === 'kSsa' ? chr(0x0B95, 0x0BCD, 0x0BB7) : consonantChar.get(base);
    return baseText + sign.char;
  }
  return undefined;
}

const NAMED = new Set(['Orthographical conjuncts', 'ss09 Traditional orthography', 'Ligated consonant conjuncts']);

test('every encoded Tamil glyph round-trips: name → text → name', () => {
  let checked = 0;
  for (const g of glyphs) {
    if (g.unicode === undefined || g.category === 'Punctuation') continue;
    const text = chr(g.unicode);
    const forward = engine.nameToUnicode(g.fullName, { script: 'tamil' });
    assert.equal(forward.unicode, text, `${g.fullName} → text`);
    assert.equal(forward.canonical, true, `${g.fullName} canonical`);
    assert.equal(forward.tier, TIER[g.level], `${g.fullName} tier`);
    const back = engine.unicodeToName(text, { script: 'tamil' });
    assert.equal(back.name, g.fullName, `${text} → name`);
    checked++;
  }
  assert.equal(checked, 75, 'encoded glyphs: 72 in the block + ZWJ, ZWNJ, dotted circle');
});

test('every consonant + sign form in the glyphset round-trips', () => {
  let checked = 0;
  for (const g of glyphs) {
    if (g.category !== 'Orthographical conjuncts') continue;
    const text = expectedFormText(g.name);
    assert.ok(text, `no expected text for ${g.name}`);
    const forward = engine.nameToUnicode(g.fullName);
    assert.equal(forward.unicode, text, `${g.fullName} → text`);
    assert.equal(forward.canonical, true);
    assert.equal(forward.tier, TIER[g.level]);
    const back = engine.unicodeToName(text);
    assert.equal(back.name, g.fullName, `${text} → name`);
    assert.equal(back.canonical, true);
    // The engine and the glyphset agree on which alternate (if any) also meets the form.
    const alt = g.alternate ? g.alternate.replace(/^(\w+)\./, '$1-taml.') : undefined;
    assert.equal(back.alternate, alt, `${g.fullName} alternate`);
    checked++;
  }
  assert.equal(checked, 69, 'form count'); // 38 Kernel + 31 Core
});

test('the Pro tier forms round-trip, and ra.alt is an alternate of ர', () => {
  for (const name of ['nnAa', 'nnnAa', 'rrAa', 'nnAi', 'nnnAi', 'lAi', 'llAi']) {
    const g = glyphs.find(x => x.name === name);
    assert.ok(g, name);
    const text = expectedFormText(name);
    assert.equal(engine.nameToUnicode(g.fullName).unicode, text, name);
    assert.equal(engine.unicodeToName(text).name, g.fullName, name);
    assert.equal(engine.nameToUnicode(g.fullName).tier, 'pro');
  }
  const alt = engine.nameToUnicode('ra-taml.alt');
  assert.equal(alt.unicode, 'ர');
  assert.equal(alt.variant, 'alt');
  assert.equal(alt.tier, 'pro');
});

test('conjuncts: க்ஷ round-trips, and ஸ்ரீ / ஶ்ரீ are one glyph', () => {
  assert.equal(engine.nameToUnicode('kSsa-taml').unicode, 'க்ஷ');
  assert.equal(engine.unicodeToName('க்ஷ').name, 'kSsa-taml');
  assert.equal(engine.nameToUnicode('shree-taml').unicode, 'ஶ்ரீ');
  assert.equal(engine.unicodeToName('ஶ்ரீ').name, 'shree-taml');
  assert.equal(engine.unicodeToName('ஸ்ரீ').name, 'shree-taml');
});

test('every shape-group alternate resolves to the sign it is an alternate of', () => {
  const alts = glyphs.filter(g => g.category === 'Sign alternates');
  assert.equal(alts.length, 10);
  const signChar = new Map(TAMIL_SIGNS.map(s => [s.name, s.char]));
  for (const g of alts) {
    const r = engine.nameToUnicode(g.fullName);
    assert.equal(r.unicode, signChar.get(g.variantOf), g.fullName);
    assert.equal(r.variant, g.name.slice(g.variantOf.length + 1));
    assert.equal(r.canonical, true);
  }
});

test('the shared controls resolve when the script is given', () => {
  assert.equal(engine.nameToUnicode('zerowidthnonjoiner', { script: 'tamil' }).unicode, '‌');
  assert.equal(engine.nameToUnicode('dottedCircle', { script: 'tamil' }).unicode, '◌');
  assert.equal(engine.unicodeToName('‌', { script: 'tamil' }).name, 'zerowidthnonjoiner');
  assert.equal(engine.unicodeToName('◌', { script: 'tamil' }).name, 'dottedCircle');
});

test('forms the standard does not enumerate are valid by rule, and say no glyph is needed', () => {
  const r = engine.unicodeToName('கா');       // ka + aasign
  assert.equal(r.name, 'kAa-taml');
  assert.equal(r.canonical, false);
  assert.equal(r.tier, 'derived');
  assert.match(r.note, /no dedicated glyph needed/);
  assert.equal(engine.nameToUnicode('kAa-taml').unicode, 'கா');
});

test('a form met by an alternate says so', () => {
  const r = engine.unicodeToName('கி');
  assert.equal(r.name, 'kI-taml');
  assert.equal(r.alternate, 'isign-taml.ka');
  assert.match(r.note, /isign-taml\.ka/);
});

test('decomposed two-part vowel signs normalise to the encoded one', () => {
  assert.equal(engine.unicodeToName('கொ').name, 'kO-taml');       // ெ + ா → ொ
  assert.equal(engine.unicodeToName('ஔ').name, 'au-taml');            // ஒ + ௗ → ஔ
});

test('things that are not one cluster do not resolve', () => {
  for (const s of ['க்க', 'ஒள', 'கிி', 'கஙு']) {
    assert.ok(engine.unicodeToName(s).error, s);
  }
  assert.ok(engine.nameToUnicode('nope-taml').error);
});

test('script detection: Tamil text and -taml names go to Tamil, the rest stays Sinhala', () => {
  assert.equal(engine.unicodeToName('කි').name, 'kI-sinh');
  assert.equal(engine.nameToUnicode('ka').unicode, 'ක');                      // bare name = Sinhala
  assert.equal(engine.nameToUnicode('ka', { script: 'tamil' }).unicode, 'க');
  assert.equal(engine.nameToUnicode('ka-taml').unicode, 'க');
});

test('the engine\'s sign table equals the package\'s', () => {
  assert.deepEqual(
    engine.TAMIL_SIGNS.map(([name, cp, suffix]) => ({ name, char: chr(cp), suffix })),
    TAMIL_SIGNS.map(({ name, char, suffix }) => ({ name, char, suffix })),
  );
});

test('every Tamil entry in the engine\'s embedded table matches the glyphset', () => {
  const expected = new Map(glyphs.filter(g => g.category !== 'Punctuation').map(g => [g.fullName, g]));
  for (const [name, g] of expected) {
    const e = engine.GLYPHSET[name];
    assert.ok(e, `${name} missing from GLYPHSET — run npm run sync`);
    assert.equal(e.tier, TIER[g.level], name);
    if (g.unicode !== undefined) assert.equal(e.unicode, 'U+' + g.unicode.toString(16).toUpperCase().padStart(4, '0'));
  }
  // …and nothing Tamil in the table that the glyphset lacks.
  for (const name of Object.keys(engine.GLYPHSET)) {
    if (/-taml(\.|$)/.test(name)) assert.ok(expected.has(name), `${name} is in GLYPHSET but not in the glyphset`);
  }
});

test('Sinhala is unchanged: legacy dot-suffix order and known names', () => {
  assert.ok('usign.rasign-sinh' in engine.GLYPHSET);
  assert.ok('daa._c-sinh' in engine.GLYPHSET);
  assert.equal(engine.nameToUnicode('kSsa-sinh').unicode, 'ක්‍ෂ');
  assert.equal(engine.unicodeToName('දා').name, 'daa._c-sinh');
});
