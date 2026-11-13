// The Tamil glyphsets as the package reads them.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadGlyphset, loadGlyphsetsCumulative, createRegistry, getGlyphsetPath,
  SCRIPTS, resolveScript, composeName,
} from '../dist/index.js';
import { rawGlyphset, TAMIL_FILES } from './helpers.mjs';

const tamil = (level) => loadGlyphsetsCumulative(level, 'tamil');
const byName = (glyphs) => new Map(glyphs.map(g => [g.name, g]));

test('each Tamil tier has the entries the standard defines (plus its sign alternates)', () => {
  // Kernel 150 entries + 1 alternate (usign.pa); Core 31 + 8 (7 isign, 1 iisign); Pro 8 + 1 (aisign.la)
  assert.equal(loadGlyphset(0, 'tamil').length, 151);
  assert.equal(loadGlyphset(1, 'tamil').length, 39);
  assert.equal(loadGlyphset(2, 'tamil').length, 9);
});

test('Tamil has levels 0-2 only', () => {
  assert.equal(SCRIPTS.tamil.maxLevel, 2);
  assert.throws(() => getGlyphsetPath(3, 'tamil'), /no level 3/);
  assert.equal(SCRIPTS.sinhala.maxLevel, 3);
});

test('script names resolve, with aliases', () => {
  assert.equal(resolveScript(undefined), 'sinhala');
  assert.equal(resolveScript('Tamil'), 'tamil');
  assert.equal(resolveScript('taml'), 'tamil');
  assert.equal(resolveScript('si'), 'sinhala');
  assert.throws(() => resolveScript('klingon'), /Unknown script/);
});

test('dot-suffixes go after the namespace for Tamil (D1) and stay legacy for Sinhala', () => {
  assert.equal(composeName('isign.ka', SCRIPTS.tamil), 'isign-taml.ka');
  assert.equal(composeName('ra.alt', SCRIPTS.tamil), 'ra-taml.alt');
  assert.equal(composeName('kI', SCRIPTS.tamil), 'kI-taml');
  // Sinhala: undecided (docs/tamil-decisions.md D1), so unchanged from before Tamil.
  assert.equal(composeName('usign.rasign', SCRIPTS.sinhala), 'usign.rasign-sinh');
  assert.equal(composeName('daa._c', SCRIPTS.sinhala), 'daa._c-sinh');
});

test('names read from the YAML get the right full names', () => {
  const g = byName(tamil(2));
  assert.equal(g.get('ka').fullName, 'ka-taml');
  assert.equal(g.get('isign.ka').fullName, 'isign-taml.ka');
  assert.equal(g.get('ra.alt').fullName, 'ra-taml.alt');
  // No namespace on the shared glyphs
  assert.equal(g.get('dottedCircle').fullName, 'dottedCircle');
  assert.equal(g.get('zerowidthnonjoiner').fullName, 'zerowidthnonjoiner');
  assert.equal(g.get('space').fullName, 'space');
});

test('the 23 consonants carry the five signs; the five Grantha letters are flagged', () => {
  const letters = tamil(0).filter(g => g.category === 'Letters' && g.signs);
  assert.equal(letters.length, 23);
  for (const c of letters) assert.deepEqual(c.signs, ['virama', 'isign', 'iisign', 'usign', 'uusign']);
  const grantha = tamil(0).filter(g => g.grantha).map(g => g.name);
  assert.deepEqual(grantha, ['ja', 'sha', 'ssa', 'sa', 'ha']);
});

test('visargaya is a letter, not a sign', () => {
  const v = byName(tamil(0)).get('visargaya');
  assert.equal(v.category, 'Letters');
  assert.equal(v.unicode, 0x0B83);
});

test('signs decompose into their Unicode parts', () => {
  const g = byName(tamil(0));
  assert.deepEqual(g.get('osign').decompose, ['esign', 'aasign']);
  assert.deepEqual(g.get('oosign').decompose, ['eesign', 'aasign']);
  assert.deepEqual(g.get('ausign').decompose, ['esign', 'aulengthmark']);
  assert.deepEqual(g.get('au').decompose, ['o', 'aulengthmark']);
});

test('shape-group alternates are expanded from groups:, one glyph per group', () => {
  const alts = tamil(2).filter(g => g.category === 'Sign alternates');
  assert.deepEqual(alts.map(g => g.fullName).sort(), [
    'aisign-taml.la', 'iisign-taml.la',
    'isign-taml.ca', 'isign-taml.ka', 'isign-taml.la', 'isign-taml.ma', 'isign-taml.na',
    'isign-taml.pa', 'isign-taml.ssa', 'usign-taml.pa',
  ]);
  const pa = alts.find(g => g.fullName === 'usign-taml.pa');
  assert.equal(pa.variantOf, 'usign');
  assert.deepEqual(pa.group, ['nga', 'pa', 'ya', 'va']);
});

test('a form is marked with the alternate that also meets it — and only where a group applies', () => {
  const g = byName(tamil(2));
  // Group members
  assert.equal(g.get('kI').alternate, 'isign.ka');
  assert.equal(g.get('tI').alternate, 'isign.ka');
  assert.equal(g.get('kSsI').alternate, 'isign.ssa');
  assert.equal(g.get('lIi').alternate, 'iisign.la');
  assert.equal(g.get('nnAi').alternate, 'aisign.la');
  // The four Kernel forms that the usign hook can also make
  for (const n of ['ngU', 'pU', 'yU', 'vU']) assert.equal(g.get(n).alternate, 'usign.pa', n);
  // Dedicated-glyph-only forms
  for (const n of ['kU', 'ttI', 'ttIi', 'kUu', 'jU', 'kSsU', 'nnAa']) {
    assert.equal(g.get(n).alternate, undefined, n);
  }
});

test('every group member has a form entry, in the same file as its group', () => {
  const abbr = { isign: 'I', iisign: 'Ii', usign: 'U', uusign: 'Uu', aisign: 'Ai' };
  for (const file of TAMIL_FILES) {
    const doc = rawGlyphset(file);
    const forms = new Set(Object.values(doc.categories).flatMap(c => Object.keys(c ?? {})));
    for (const [sign, groups] of Object.entries(doc.groups ?? {})) {
      for (const [group, members] of Object.entries(groups)) {
        for (const m of members) {
          const stem = m.endsWith('a') ? m.slice(0, -1) : m;
          assert.ok(forms.has(stem + abbr[sign]), `${file}: ${sign}.${group} member ${m} has no form entry`);
        }
      }
    }
  }
});

test('a consonant is in at most one group per sign', () => {
  const seen = new Map();
  for (const file of TAMIL_FILES) {
    for (const [sign, groups] of Object.entries(rawGlyphset(file).groups ?? {})) {
      for (const [group, members] of Object.entries(groups)) {
        for (const m of members) {
          const key = `${sign}/${m}`;
          assert.ok(!seen.has(key), `${key} is in both ${seen.get(key)} and ${group}`);
          seen.set(key, group);
        }
      }
    }
  }
});

test('the registry works for Tamil and keeps scripts apart', () => {
  const r = createRegistry(2, 'tamil');
  assert.equal(r.size, 198);
  assert.ok(r.getByFullName('kI-taml'));
  assert.ok(!r.getByFullName('kI-sinh'));
  assert.ok(createRegistry(1, 'sinhala').getByFullName('kSsa-sinh'));
});
