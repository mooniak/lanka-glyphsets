// font_coverage.py's classification of Tamil candidates, with no font and no
// HarfBuzz: the shaping is replaced by a fake probe.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT } from './helpers.mjs';

const python = spawnSync('python3', ['--version']);
const skip = python.status === 0 ? false : 'python3 not available';

const PY = `
import json, sys
sys.path.insert(0, ${JSON.stringify(resolve(ROOT, 'tools/font-coverage'))})
import font_coverage as fc

class Probe(fc.FontProbe):
    def __init__(self, glyph_order, shaped, namespace="taml"):
        self.namespace = namespace
        self.glyph_order = set(glyph_order)
        self.cmap = set()
        self._shaped = shaped
    def shape(self, text):
        names = self._shaped
        return [1] * len(names), names

def run(shaped, cand, level=None, glyph_order=()):
    return fc.classify(Probe(glyph_order, shaped), cand, level)[0]

C = fc.Candidate
out = {}
kI = dict(name="kI-taml", sequence="கி", ligature=True, alternates=("isign-taml.ka",), canonical=True, level=1)
out["own glyph"]        = run(["kI-taml"], C(**kI))
out["alternate"]        = run(["ka-taml", "isign-taml.ka"], C(**kI))
out["alternate, built"] = run(["kataml", "isigntaml.ka"], C(**kI))               # hyphen-stripped production names
out["own, built"]       = run(["kItaml"], C(**kI))
out["composed, required"] = run(["ka-taml", "isign-taml"], C(**kI))
out["composed, not required"] = run(["ka-taml", "aasign-taml"], C(name="kAa-taml", sequence="கா", ligature=True, canonical=False))
out["required only above level"] = run(["ka-taml", "isign-taml"], C(**kI), level=0)
out["required at level"]  = run(["ka-taml", "isign-taml"], C(**kI), level=1)
out["glyph there, unused"] = run(["ka-taml", "isign-taml"], C(**kI), glyph_order=["kI-taml"])
out["sinhala unchanged"]  = run(["ka-sinh", "isign-sinh"], C(name="kI", sequence="කි", ligature=True))
print(json.dumps(out))
`;

test('Tamil candidates are met by their own glyph or by the shape-group alternate', { skip }, () => {
  const r = spawnSync('python3', ['-I', '-B', '-c', PY], { encoding: 'utf8' });   // -B: no __pycache__ in tools/
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), {
    'own glyph': 'SUPPORTED',
    'alternate': 'SUPPORTED',
    'alternate, built': 'SUPPORTED',
    'own, built': 'SUPPORTED',
    'composed, required': 'PARTIAL',
    'composed, not required': 'SUPPORTED',
    'required only above level': 'SUPPORTED',
    'required at level': 'PARTIAL',
    'glyph there, unused': 'GLYPH_PRESENT_NO_FEA',
    'sinhala unchanged': 'PARTIAL',
  });
});

test('tamil-candidates.json is the generator\'s output (the sync check keeps it fresh)', () => {
  const json = JSON.parse(readFileSync(resolve(ROOT, 'tools/font-coverage/tamil-candidates.json'), 'utf8'));
  assert.equal(json.length, 313);
  assert.ok(json.every(c => c.name.endsWith('-taml')));
  const kI = json.find(c => c.name === 'kI-taml');
  assert.equal(kI.alternate, 'isign-taml.ka');
});
