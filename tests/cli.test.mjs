// The CLI, end to end.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cli } from './helpers.mjs';

test('list --script tamil', () => {
  const r = cli('list', '--script', 'tamil', '-l', '0');
  assert.equal(r.status, 0);
  const names = r.stdout.trim().split('\n');
  assert.ok(names.includes('ka-taml'));
  assert.ok(names.includes('ttI-taml'));
  assert.ok(!names.includes('kI-taml'), 'kI is Core');
  assert.ok(!names.some(n => n.endsWith('-sinh')));
});

test('list -l 1 adds Core, including the sign alternates', () => {
  const names = cli('list', '-s', 'tamil', '-l', '1').stdout.trim().split('\n');
  assert.ok(names.includes('kI-taml'));
  assert.ok(names.includes('isign-taml.ka'));
  assert.ok(!names.includes('ra-taml.alt'), 'ra.alt is Pro');
});

test('list --no-namespace keeps the dot-suffix', () => {
  const names = cli('list', '-s', 'tamil', '-l', '2', '--no-namespace').stdout.trim().split('\n');
  assert.ok(names.includes('isign.ka'));
  assert.ok(names.includes('ra.alt'));
});

test('categories and info take --script', () => {
  const info = cli('info', '-s', 'tamil', '-l', '2').stdout;
  assert.match(info, /Script: tamil/);
  assert.match(info, /Total glyphs: 198/);
  assert.match(info, /Sign alternates: 10/);
  assert.match(cli('categories', '-s', 'tamil', '-l', '2').stdout, /ss09 Traditional orthography \(8 glyphs\)/);
});

test('Sinhala output has no script line and is otherwise as before', () => {
  const info = cli('info', '-l', '1').stdout;
  assert.ok(!/Script:/.test(info));
  assert.match(info, /Total glyphs: /);
});

test('Tamil has no level 3; an unknown script is an error', () => {
  const lvl = cli('list', '-s', 'tamil', '-l', '3');
  assert.equal(lvl.status, 1);
  assert.match(lvl.stderr, /Level must be between 0 and 2/);
  const bad = cli('list', '-s', 'klingon');
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /Unknown script "klingon"/);
  // Sinhala still stops at 3
  assert.equal(cli('list', '-l', '4').status, 1);
});

test('a default level is clamped to the script\'s highest', () => {
  // glyph-data and export-json default to level 3, which Tamil does not have.
  assert.equal(cli('glyph-data', '-s', 'tamil').status, 0);
  assert.equal(cli('export-json', '-s', 'tamil').status, 0);
});

test('generate --script tamil -f json carries the alternate, level and canonical flag', () => {
  const r = cli('generate', '-s', 'tamil', '-l', '2', '-f', 'json');
  assert.equal(r.status, 0);
  const all = JSON.parse(r.stdout);
  assert.equal(all.length, 313);
  const by = Object.fromEntries(all.map(g => [g.name, g]));
  assert.deepEqual(by['kI-taml'], {
    name: 'kI-taml', type: 'consonant-sign', sequence: 'கி',
    alternate: 'isign-taml.ka', canonical: true, level: 1,
  });
  assert.deepEqual(by['kAa-taml'], { name: 'kAa-taml', type: 'consonant-sign', sequence: 'கா', canonical: false });
  assert.deepEqual(by['shree-taml'].sequences, ['ஶ்ரீ', 'ஸ்ரீ']);
  // without the namespace the alternate loses it too
  const bare = JSON.parse(cli('generate', '-s', 'tamil', '-l', '2', '-f', 'json', '--no-namespace').stdout);
  assert.equal(bare.find(g => g.name === 'kI').alternate, 'isign.ka');
});

test('generate-info counts the Tamil grid', () => {
  const out = cli('generate-info', '-s', 'tamil', '-l', '2').stdout;
  assert.match(out, /Base consonants:\s+23/);
  assert.match(out, /Consonant \+ signs:\s+276/);
  assert.match(out, /Total:\s+313/);
});

test('text-glyphs --script tamil', () => {
  const names = cli('text-glyphs', '-s', 'tamil', '-t', 'கிளி நீ ஸ்ரீ', '-f', 'names').stdout.trim().split('\n');
  assert.deepEqual(names.sort(), ['kI', 'llI', 'nIi', 'shree']);
  const json = JSON.parse(cli('text-glyphs', '-s', 'tamil', '-t', 'கி', '-f', 'json').stdout);
  assert.deepEqual(json, [{
    name: 'kI', type: 'consonant-vowel', sequence: 'கி',
    components: ['ka', 'isign'], alternate: 'isign.ka', canonical: true, level: 1,
  }]);
  // Sinhala JSON keeps its two-field shape
  const si = JSON.parse(cli('text-glyphs', '-t', 'කි', '-f', 'json').stdout);
  assert.deepEqual(si, [{ name: 'kI', type: 'consonant-vowel' }]);
});

test('export-json --script tamil: groups and Grantha, no touching clusters', () => {
  const d = JSON.parse(cli('export-json', '-s', 'tamil').stdout);
  assert.deepEqual(d.conjunctPairs, [['ka', 'ssa']]);
  assert.deepEqual(d.touchPairs, []);
  assert.deepEqual(d.grantha, ['ja', 'sha', 'ssa', 'sa', 'ha']);
  assert.deepEqual(d.groups.usign, { pa: ['nga', 'pa', 'ya', 'va'] });
  assert.deepEqual(Object.keys(d.groups.isign), ['ka', 'ca', 'na', 'pa', 'ma', 'la', 'ssa']);
  // Sinhala's export has neither key
  const si = JSON.parse(cli('export-json').stdout);
  assert.ok(!('groups' in si) && !('grantha' in si));
});

test('export-json --format js uses its own global for Tamil', () => {
  assert.match(cli('export-json', '-s', 'tamil', '-f', 'js').stdout, /root\.LankaGlyphDataTamil = DATA/);
  assert.match(cli('export-json', '-f', 'js').stdout, /root\.LankaGlyphData = DATA/);
});
