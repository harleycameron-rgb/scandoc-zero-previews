const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { assess, LEGS, PAGE_PATH, PUBLIC_URL, REPOSITORY } = require('./page-evidence.cjs');

const unavailableRecord = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../site/harness/evidence.json'), 'utf8'),
);
const expected = { revision: 'a'.repeat(40), html_sha256: 'b'.repeat(64) };
const now = new Date('2026-10-12T00:00:00.000Z');

assert.deepEqual(assess(null, expected, now), {
  firing: 'PENDING',
  deployment: 'UNVERIFIED',
  sixLegCompletion: 'PENDING',
});
assert.deepEqual(assess(unavailableRecord, expected, now), {
  firing: 'PENDING',
  deployment: 'UNVERIFIED',
  sixLegCompletion: 'PENDING',
});

function candidate() {
  return {
    schema: 'scandoc-zero-page-evidence/1',
    status: 'reviewed',
    artifact: {
      repository: REPOSITORY,
      path: PAGE_PATH,
      revision: expected.revision,
      html_sha256: expected.html_sha256,
      built_at: '2026-10-01T00:00:00.000Z',
    },
    deployment: {
      status: 'successful',
      public_url: PUBLIC_URL,
      succeeded_at: '2026-10-01T01:00:00.000Z',
      source: {
        id: 'synthetic-deployment-source',
        url: 'https://github.com/example/public-evidence',
        reviewed_at: '2026-10-11T00:00:00.000Z',
      },
    },
    firing: {
      status: 'successful',
      event_at: '2026-10-02T00:00:00.000Z',
      producer: 'synthetic-firing-producer',
      completed_legs: LEGS.slice(),
      source: {
        id: 'synthetic-firing-source',
        url: 'https://github.com/example/public-evidence',
        reviewed_at: '2026-10-11T00:00:00.000Z',
      },
      local_stub: false,
    },
  };
}
const blocked = { firing: 'BLOCKED', deployment: 'BLOCKED', sixLegCompletion: 'BLOCKED' };
const unverified = {
  firing: 'UNVERIFIED',
  deployment: 'UNVERIFIED',
  sixLegCompletion: 'UNVERIFIED',
};

const revisionMismatch = candidate();
revisionMismatch.artifact.revision = 'c'.repeat(40);
assert.deepEqual(assess(revisionMismatch, expected, now), blocked);

const digestMismatch = candidate();
digestMismatch.artifact.html_sha256 = 'c'.repeat(64);
assert.deepEqual(assess(digestMismatch, expected, now), blocked);

const timestampMismatch = candidate();
timestampMismatch.firing.event_at = '2026-09-30T00:00:00.000Z';
assert.deepEqual(assess(timestampMismatch, expected, now), blocked);

const stale = candidate();
stale.firing.source.reviewed_at = '2026-08-01T00:00:00.000Z';
assert.deepEqual(assess(stale, expected, now), blocked);

const malformed = candidate();
malformed.firing.completed_legs = ['tap', 'surface'];
assert.deepEqual(assess(malformed, expected, now), blocked);

const localStub = candidate();
localStub.firing.local_stub = true;
assert.deepEqual(assess(localStub, expected, now), unverified);

const untrustedSources = candidate();
assert.deepEqual(assess(untrustedSources, expected, now), unverified);

console.log(
  'PASS: missing evidence stays pending/unverified; malformed, stale and mismatched evidence fails closed; local stubs and untrusted sources cannot claim six-leg firing.',
);
