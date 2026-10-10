const assert = require('node:assert/strict'),
  M = require('../site/surface/model.js');
const at = (r) => ({ x: r, y: 0 });
assert.equal(M.classify(at(0.2)).kind, 'continuous');
assert.equal(M.classify(at(0.7), at(0.55)).kind, 'sawtooth');
assert.equal(M.classify(at(0.55), at(0.7)).kind, 'sawtooth');
assert.equal(M.classify(at(0.645)).kind, 'wobble');
assert.equal(M.classify(at(0.5), at(0.55), { x: 0.05, y: 0 }).kind, 'wobble');
assert.equal(M.classify(at(1.2), at(0.5)).kind, 'endpoint');
assert.throws(() => M.classify({ x: NaN, y: 0 }));
const cells = Array.from({ length: 16 }, () => ({ kind: 'continuous', energy: 0, severity: 0 }));
const input = { kind: 'sawtooth', energy: 0.7, severity: 0.8, band: 2 };
const seeded = M.seed(cells, input, 3);
assert.equal(seeded[7].kind, 'sawtooth');
assert.equal(seeded[7].energy, 0.7);
assert.equal(cells[7].energy, 0);
assert.equal(M.seed(seeded, { ...input, kind: 'endpoint' }, 3)[7].energy, 0);
assert.deepEqual(M.level(0, 0), { x: 0, y: 0, faceUp: true });
assert.equal(M.level(180, 0).faceUp, false);
assert.throws(() => M.level(Infinity, 0));
assert.ok(Math.abs(M.level(0, 30).x - 0.5) < 1e-12);
assert.equal(M.LIMITS.traces, 24);
assert.equal(M.LIMITS.steps, 16);
console.log(
  'PASS: Surface priority, crossings, ambiguity, silent endpoints, indirect rhythm, detached patterns and tilt math.',
);
