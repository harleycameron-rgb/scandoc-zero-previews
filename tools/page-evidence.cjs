const assert = require('node:assert/strict');

const REPOSITORY = 'harleycameron-rgb/scandoc-zero-previews';
const PAGE_PATH = 'harness/index.html';
const PUBLIC_URL = 'https://harleycameron-rgb.github.io/scandoc-zero-previews/harness/';
const LEGS = ['tap', 'surface', 'science', 'communicate', 'manifest', 'display'];
const MAX_REVIEW_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const TRUSTED_DEPLOYMENT_SOURCES = new Set();
const TRUSTED_FIRING_PRODUCERS = new Set();

const unavailable = () => ({
  firing: 'PENDING',
  deployment: 'UNVERIFIED',
  sixLegCompletion: 'PENDING',
});
const keysAre = (value, keys) =>
  value && typeof value === 'object' && !Array.isArray(value) &&
  JSON.stringify(Object.keys(value).sort()) === JSON.stringify(keys.slice().sort());
const timestamp = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;
const publicSource = (source) => {
  if (!keysAre(source, ['id', 'url', 'reviewed_at'])) return false;
  if (typeof source.id !== 'string' || !/^[A-Za-z0-9._:-]{1,100}$/.test(source.id)) return false;
  if (!timestamp(source.reviewed_at) || typeof source.url !== 'string') return false;
  try {
    const url = new URL(source.url);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (url.hostname === 'github.com' || url.hostname.endsWith('.github.io'));
  } catch {
    return false;
  }
};
const reviewedRecently = (source, now) => {
  const age = now.getTime() - Date.parse(source.reviewed_at);
  return age >= 0 && age <= MAX_REVIEW_AGE_MS;
};

function assess(record, expected, now = new Date()) {
  if (record == null) return unavailable();
  try {
    assert.ok(keysAre(record, ['schema', 'status', 'artifact', 'deployment', 'firing']));
    assert.equal(record.schema, 'scandoc-zero-page-evidence/1');
    assert.ok(keysAre(record.artifact, ['repository', 'path', 'revision', 'html_sha256', 'built_at']));
    assert.ok(keysAre(record.deployment, ['status', 'public_url', 'succeeded_at', 'source']));
    assert.ok(keysAre(record.firing, ['status', 'event_at', 'producer', 'completed_legs', 'source', 'local_stub']));
    assert.equal(record.artifact.repository, REPOSITORY);
    assert.equal(record.artifact.path, PAGE_PATH);

    if (record.status === 'unavailable') {
      assert.equal(record.artifact.revision, null);
      assert.equal(record.artifact.html_sha256, null);
      assert.equal(record.artifact.built_at, null);
      assert.deepEqual(record.deployment, {
        status: 'unavailable',
        public_url: null,
        succeeded_at: null,
        source: null,
      });
      assert.deepEqual(record.firing, {
        status: 'unavailable',
        event_at: null,
        producer: null,
        completed_legs: [],
        source: null,
        local_stub: false,
      });
      return unavailable();
    }

    assert.equal(record.status, 'reviewed');
    assert.match(record.artifact.revision, /^[a-f0-9]{40}$/);
    assert.match(record.artifact.html_sha256, /^[a-f0-9]{64}$/);
    assert.ok(timestamp(record.artifact.built_at));
    assert.equal(record.deployment.status, 'successful');
    assert.equal(record.deployment.public_url, PUBLIC_URL);
    assert.ok(timestamp(record.deployment.succeeded_at));
    assert.ok(publicSource(record.deployment.source));
    assert.equal(record.firing.status, 'successful');
    assert.ok(timestamp(record.firing.event_at));
    assert.equal(typeof record.firing.producer, 'string');
    assert.match(record.firing.producer, /^[A-Za-z0-9._:-]{1,100}$/);
    assert.ok(Array.isArray(record.firing.completed_legs));
    assert.deepEqual(record.firing.completed_legs, LEGS);
    assert.equal(typeof record.firing.local_stub, 'boolean');
    assert.ok(publicSource(record.firing.source));

    if (
      record.artifact.revision !== expected.revision ||
      record.artifact.html_sha256 !== expected.html_sha256
    ) {
      return { firing: 'BLOCKED', deployment: 'BLOCKED', sixLegCompletion: 'BLOCKED' };
    }
    const builtAt = Date.parse(record.artifact.built_at);
    const deployedAt = Date.parse(record.deployment.succeeded_at);
    const firedAt = Date.parse(record.firing.event_at);
    if (
      builtAt > deployedAt ||
      deployedAt > firedAt ||
      Date.parse(record.deployment.source.reviewed_at) < deployedAt ||
      Date.parse(record.firing.source.reviewed_at) < firedAt
    ) {
      return { firing: 'BLOCKED', deployment: 'BLOCKED', sixLegCompletion: 'BLOCKED' };
    }

    const sources = [record.deployment.source, record.firing.source];
    if (sources.some((source) => !reviewedRecently(source, now))) {
      return { firing: 'BLOCKED', deployment: 'BLOCKED', sixLegCompletion: 'BLOCKED' };
    }
    if (
      record.firing.local_stub ||
      !TRUSTED_DEPLOYMENT_SOURCES.has(record.deployment.source.id) ||
      !TRUSTED_FIRING_PRODUCERS.has(record.firing.producer)
    ) {
      return {
        firing: 'UNVERIFIED',
        deployment: 'UNVERIFIED',
        sixLegCompletion: 'UNVERIFIED',
      };
    }
    return { firing: 'FIRED', deployment: 'VERIFIED', sixLegCompletion: 'VERIFIED' };
  } catch {
    return { firing: 'BLOCKED', deployment: 'BLOCKED', sixLegCompletion: 'BLOCKED' };
  }
}

module.exports = { assess, LEGS, PAGE_PATH, PUBLIC_URL, REPOSITORY };
