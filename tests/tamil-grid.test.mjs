// The full Tamil consonant × vowel-sign grid: 24 rows (23 consonants + க்ஷ) ×
// 13 columns (inherent a, pulli, and the 11 vowel signs) = 312 cells.
// Each cell is checked through the text analyzer, the engine and the generators.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractGlyphNames, getUniqueGlyphNames, generateAllGlyphs, loadGlyphsetsCumulative, TAMIL_SIGNS,
} from '../dist/index.js';
import { engine, rawGlyphset, TAMIL_FILES, chr } from './helpers.mjs';

// ── oracle, from the raw YAML ───────────────────────────────────────────────
const consonants = [];            // [{ name, char }]
for (const file of TAMIL_FILES) {
  for (const [name, meta] of Object.entries(rawGlyphset(file).categories.Letters ?? {})) {
    if (meta?.signs) consonants.push({ name, char: chr(meta.unicode) });
  }
}
const rows = [...consonants, { name: 'kSsa', char: chr(0x0B95, 0x0BCD, 0x0BB7) }];

// Enumerated names, and group membership, from the raw YAML.
const enumerated = new Map();                  // bare name -> level
TAMIL_FILES.forEach((file, level) => {
  for (const members of Object.values(rawGlyphset(file).categories)) {
    for (const name of Object.keys(members ?? {})) if (!enumerated.has(name)) enumerated.set(name, level);
  }
});
const groupOf = new Map();                     // "sign/consonant" -> group
for (const file of TAMIL_FILES) {
  for (const [sign, groups] of Object.entries(rawGlyphset(file).groups ?? {})) {
    for (const [group, members] of Object.entries(groups)) for (const m of members) groupOf.set(`${sign}/${m}`, group);
  }
}

// Columns: bare, then the 12 signs (pulli + 11 vowel signs) — 13 in all.
const columns = [{ name: null, char: '', abbr: '' }, ...TAMIL_SIGNS.map(s => ({ name: s.name, char: s.char, abbr: s.suffix }))];

const stem = (n) => (n.endsWith('a') ? n.slice(0, -1) : n);
const cells = [];
for (const row of rows) {
  for (const col of columns) {
    cells.push({
      row: row.name, sign: col.name,
      text: row.char + col.char,
      name: col.name === null ? row.name : stem(row.name) + col.abbr,
    });
  }
}

test('the grid is 24 × 13 = 312 cells, with distinct names', () => {
  assert.equal(rows.length, 24);
  assert.equal(columns.length, 13);
  assert.equal(cells.length, 312);
  assert.equal(new Set(cells.map(c => c.name)).size, 312, 'two cells share a name');
  assert.equal(new Set(cells.map(c => c.text)).size, 312, 'two cells share a text');
});

test('the analyzer reads each cell as one cluster with the expected name', () => {
  for (const c of cells) {
    const occ = extractGlyphNames(c.text, 'tamil');
    assert.equal(occ.length, 1, `${c.text} (${c.name}) → ${occ.map(o => o.name)}`);
    assert.equal(occ[0].name, c.name, c.text);
    assert.equal(occ[0].sequence, c.text.normalize('NFC'));
  }
});

test('the engine names each cell the same way', () => {
  for (const c of cells) {
    const r = engine.unicodeToName(c.text);
    assert.equal(r.name, `${c.name}-taml`, c.text);
    assert.equal(engine.nameToUnicode(`${c.name}-taml`).unicode, c.text.normalize('NFC'), c.name);
  }
});

test('whether a cell is enumerated, and its level, agree with the YAML', () => {
  for (const c of cells) {
    const occ = extractGlyphNames(c.text, 'tamil')[0];
    const level = enumerated.get(c.name);
    assert.equal(occ.canonical, level !== undefined, `${c.name} canonical`);
    if (level !== undefined) assert.equal(occ.level, level, `${c.name} level`);
    assert.equal(engine.unicodeToName(c.text).canonical, level !== undefined, `${c.name} engine canonical`);
  }
});

test('the alternate offered for a cell is the one the shape groups give', () => {
  for (const c of cells) {
    if (c.sign === null || c.sign === 'virama') continue;
    const occ = extractGlyphNames(c.text, 'tamil')[0];
    const group = groupOf.get(`${c.sign}/${c.row}`);
    // The data only marks an alternate on forms the glyphset enumerates.
    const expected = group && enumerated.has(c.name) ? `${c.sign}.${group}` : undefined;
    assert.equal(occ.alternate, expected, c.name);
    assert.equal(engine.unicodeToName(c.text).alternate, expected && expected.replace(/^(\w+)\./, '$1-taml.'), c.name);
  }
});

test('a cell has its components: the consonant and the sign', () => {
  for (const c of cells) {
    if (c.sign === null) continue;
    const occ = extractGlyphNames(c.text, 'tamil')[0];
    assert.deepEqual(occ.components, [c.row, c.sign], c.name);
  }
});

test('the generator yields exactly the grid (plus shree)', () => {
  const generated = generateAllGlyphs(2, undefined, 'tamil');
  const names = generated.map(g => g.name);
  assert.equal(new Set(names).size, names.length, 'duplicate generated names');
  assert.deepEqual(new Set(names.filter(n => n !== 'shree')), new Set(cells.map(c => c.name)));
  assert.ok(names.includes('shree'));
  // Each generated sequence is the cell's text
  const text = new Map(cells.map(c => [c.name, c.text]));
  for (const g of generated.filter(x => x.name !== 'shree')) assert.equal(g.sequence, text.get(g.name), g.name);
});

test('the generator flags what the glyphset enumerates, with level and alternate', () => {
  const generated = new Map(generateAllGlyphs(2, undefined, 'tamil').map(g => [g.name, g]));
  assert.equal(generated.get('kI').canonical, true);
  assert.equal(generated.get('kI').alternate, 'isign.ka');
  assert.equal(generated.get('kI').level, 1);
  assert.equal(generated.get('ttI').level, 0);
  assert.equal(generated.get('kAa').canonical, false);
  assert.equal(generated.get('kAa').alternate, undefined);
  // At level 0 the Core forms are not yet enumerated
  const kernel = new Map(generateAllGlyphs(0, undefined, 'tamil').map(g => [g.name, g]));
  assert.equal(kernel.get('kI').canonical, false);
  assert.equal(kernel.get('pU').alternate, 'usign.pa');
});

test('shree has both spellings', () => {
  const shree = generateAllGlyphs(0, undefined, 'tamil').find(g => g.name === 'shree');
  assert.deepEqual(shree.sequences, ['ஶ்ரீ', 'ஸ்ரீ']);
});

test('every Tamil glyph the grid needs exists in the glyphset', () => {
  const all = new Set(loadGlyphsetsCumulative(2, 'tamil').map(g => g.name));
  for (const r of rows.filter(r => r.name !== 'kSsa')) assert.ok(all.has(r.name), r.name);
  for (const s of TAMIL_SIGNS.filter(s => s.name !== 'virama')) assert.ok(all.has(s.name), s.name);
  assert.ok(all.has('virama'));
});

// ── text analysis ───────────────────────────────────────────────────────────
test('text-glyphs reads a Tamil sentence', () => {
  const text = 'தமிழ் மொழி கிளி, நீ ஸ்ரீ க்ஷேத்திரம் ௧௨௩ ஃபூ ஔவை ௹ ஜூன் னூல்.';
  const unique = getUniqueGlyphNames(text, 'tamil');
  const by = Object.fromEntries(unique.map(g => [g.name, g]));
  for (const n of ['au', 'visargaya']) assert.equal(by[n].type, 'vowel', n);
  for (const n of ['kI', 'llI', 'mO', 'nIi', 'nnnUu', 'pUu', 'jUu', 'tI', 'zhI', 'vAi']) {
    assert.equal(by[n].type, 'consonant-vowel', n);
  }
  for (const n of ['l', 'm', 'nnn', 't', 'zh']) assert.equal(by[n].type, 'pure-consonant', n);
  assert.equal(by.shree.type, 'conjunct');
  assert.equal(by.kSsEe.type, 'conjunct');
  for (const n of ['one', 'two', 'three']) assert.equal(by[n].type, 'number', n);
  assert.equal(by.indianrupee.type, 'symbol');
  assert.deepEqual(by.kI.components, ['ka', 'isign']);
  assert.equal(by.kI.alternate, 'isign.ka');
  assert.equal(by.llI.canonical, false);        // plain isign is enough
  assert.equal(by.pUu.canonical, true);
  assert.equal(by.pUu.alternate, undefined);    // uusign has no hook
});

test('Tamil text analysis keeps ZWJ / ZWNJ / dotted circle as controls', () => {
  const names = extractGlyphNames('க‌ஂ◌', 'tamil').map(o => [o.name, o.type]);
  assert.deepEqual(names, [['ka', 'consonant'], ['zerowidthnonjoiner', 'control'], ['anusvaraya', 'sign'], ['dottedCircle', 'control']]);
});

test('NFC: decomposed ொ gives the same cluster as the encoded one', () => {
  assert.equal(extractGlyphNames('கொ', 'tamil')[0].name, 'kO');
  assert.equal(extractGlyphNames('கொ', 'tamil')[0].name, 'kO');
});

test('Tamil pulli + consonant is two clusters, except க்ஷ', () => {
  assert.deepEqual(extractGlyphNames('க்க', 'tamil').map(o => o.name), ['k', 'ka']);
  assert.deepEqual(extractGlyphNames('க்ஷ', 'tamil').map(o => o.name), ['kSsa']);
  assert.deepEqual(extractGlyphNames('க்ஷ்', 'tamil').map(o => o.name), ['kSs']);
});
