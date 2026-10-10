const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { validate, panel } = require('./build-evidence.cjs');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../site/benchmarks.json'), 'utf8'));
validate(data);
function reject(change) {
  const bad = structuredClone(data);
  change(bad);
  assert.throws(() => validate(bad));
}
reject(v => v.claims.demonstrated_agi = true);
reject(v => v.claims.external_llm_inference = true);
reject(v => v.records[1].canonical = true);
reject(v => v.records[0].url = 'https://example.com');
reject(v => v.records[0].source_commit = 'latest');
reject(v => v.modules[0].references[0].record = 'unknown');
reject(v => v.modules[0].route = '../private/');
reject(v => v.modules[1].id = v.modules[0].id);
const malicious = structuredClone(data);
malicious.modules[0].scope = '<script>alert(1)</script>';
assert.ok(panel(malicious, malicious.modules[0]).includes('&lt;script&gt;'));
assert.ok(!panel(data, data.modules.find(m => m.id === 'science')).includes('<script'));
assert.equal(data.modules.find(m => m.id === 'communicate').references.length, 0);
assert.equal(data.records.find(r => r.id === 'sphere-checkpoint').canonical, false);
assert.equal(data.records.find(r => r.id === 'planar-session').source_commit,
  JSON.parse(fs.readFileSync(path.join(__dirname, '../site/harness/fixture.json'), 'utf8')).source_revision);
console.log('PASS: registry pins, DOI matching, fail-closed scope, route allowlist, escaping, no Science polling and no invented Communicate DOI.');
