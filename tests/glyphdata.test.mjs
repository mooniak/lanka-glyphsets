// GlyphData.xml for Glyphs.app: script attribute, sign subcategories, categories.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGlyphsetsCumulative, formatAsGlyphData } from '../dist/index.js';

function parse(xml) {
  const out = new Map();
  for (const m of xml.matchAll(/<glyph ([^>]*)\/>/g)) {
    const attrs = Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map(a => [a[1], a[2]]));
    out.set(attrs.name, attrs);
  }
  return out;
}

const tamilXml = formatAsGlyphData(loadGlyphsetsCumulative(2, 'tamil'), 'taml', 'tamil');
const tamil = parse(tamilXml);
const sinhala = parse(formatAsGlyphData(loadGlyphsetsCumulative(3), 'sinh'));

test('every Tamil glyph is written with script="tamil"; Sinhala keeps "sinhala"', () => {
  assert.ok(tamil.size > 190);
  for (const [name, a] of tamil) assert.equal(a.script, 'tamil', name);
  for (const [name, a] of sinhala) assert.equal(a.script, 'sinhala', name);
});

test('Tamil nonspacing signs are exactly the Unicode Mn ones: ஂ ீ ்', () => {
  const signs = [...tamil.values()].filter(a => a.category === 'Mark' && a.unicode);
  assert.ok(signs.length >= 14);
  const mn = signs.filter(a => a.subCategory === 'Nonspacing').map(a => a.unicode).sort();
  assert.deepEqual(mn, ['0B82', '0BC0', '0BCD']);
  for (const a of signs) {
    const ch = String.fromCodePoint(parseInt(a.unicode, 16));
    const expected = /\p{Mn}/u.test(ch) ? 'Nonspacing' : /\p{Mc}/u.test(ch) ? 'Spacing Combining' : undefined;
    assert.equal(a.subCategory, expected, `${a.name} U+${a.unicode}`);
  }
});

test('a sign alternate follows the sign it varies', () => {
  assert.equal(tamil.get('isign-taml.ka').subCategory, 'Spacing Combining');
  assert.equal(tamil.get('iisign-taml.la').subCategory, 'Nonspacing');
  assert.equal(tamil.get('usign-taml.pa').category, 'Mark');
  assert.equal(tamil.get('aisign-taml.la').subCategory, 'Spacing Combining');
});

test('visargaya (aytham) is a letter, not a mark', () => {
  assert.equal(tamil.get('visargaya-taml').category, 'Letter');
  assert.equal(tamil.get('visargaya-taml').subCategory, undefined);
});

test('letters, numerals, symbols, controls', () => {
  assert.equal(tamil.get('ka-taml').category, 'Letter');
  assert.equal(tamil.get('ka-taml').anchors, 'virama, isign, iisign, usign, uusign');
  assert.equal(tamil.get('zero-taml').category, 'Number');
  assert.equal(tamil.get('hundred-taml').category, 'Number');
  assert.equal(tamil.get('om-taml').category, 'Letter');                // Lo, not a symbol
  assert.equal(tamil.get('signday-taml').category, 'Symbol');
  assert.equal(tamil.get('indianrupee-taml').category, 'Symbol');
  assert.equal(tamil.get('indianrupee-taml').subCategory, 'Currency');
  assert.equal(tamil.get('zerowidthnonjoiner').category, 'Separator');
  assert.equal(tamil.get('dottedCircle').category, 'Symbol');
  assert.equal(tamil.get('dottedCircle').unicode, '25CC');
});

test('ligatures are ligatures; a variant of a letter is not', () => {
  for (const n of ['kI-taml', 'ttI-taml', 'kSsa-taml', 'shree-taml', 'nnAa-taml']) {
    assert.equal(tamil.get(n).category, 'Letter', n);
    assert.equal(tamil.get(n).subCategory, 'Ligature', n);
    assert.equal(tamil.get(n).unicode, undefined, n);
  }
  assert.equal(tamil.get('ra-taml.alt').category, 'Letter');
  assert.equal(tamil.get('ra-taml.alt').subCategory, undefined);
});

test('decompositions are written with the namespace', () => {
  assert.equal(tamil.get('osign-taml').decompose, 'esign-taml, aasign-taml');
  assert.equal(tamil.get('au-taml').decompose, 'o-taml, aulengthmark-taml');
});

test('Sinhala GlyphData is unchanged by the Tamil work', () => {
  assert.equal(sinhala.get('candrabindu-sinh').subCategory, 'Nonspacing');
  assert.equal(sinhala.get('aasign-sinh').subCategory, 'Spacing Combining');
  assert.equal(sinhala.get('yasign-sinh').subCategory, 'Spacing Combining');
});
