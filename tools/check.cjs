const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const files = [];
const { assess } = require('./page-evidence.cjs');

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p) : files.push(p);
  }
}
walk(site);
require('./surface-model.test.cjs');
require('./benchmark-registry.test.cjs');
require('./page-evidence.test.cjs');

const harnessEvidence = JSON.parse(
  fs.readFileSync(path.join(site, 'harness/evidence.json'), 'utf8'),
);
const harnessHtml = fs.readFileSync(path.join(site, 'harness/index.html'));
const checkedRevision =
  process.env.GITHUB_SHA ||
  spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
assert.match(checkedRevision, /^[a-f0-9]{40}$/);
assert.deepEqual(
  assess(
    harnessEvidence,
    {
      revision: checkedRevision,
      html_sha256: crypto.createHash('sha256').update(harnessHtml).digest('hex'),
    },
  ),
  { firing: 'PENDING', deployment: 'UNVERIFIED', sixLegCompletion: 'PENDING' },
  'Public firing, deployment and six-leg status must remain unverified without trusted sources',
);
const harnessPage = harnessHtml.toString('utf8');
for (const label of [
  'Firing: PENDING.',
  'Deployment: UNVERIFIED.',
  'Final six-symbol completion: PENDING.',
  'local browser clock; observation only',
]) {
  assert.ok(harnessPage.includes(label), `Missing fail-closed harness evidence label: ${label}`);
}
const researchVerification = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/RESEARCH-VERIFICATION.json'), 'utf8'),
);
const recordedHarnessCheck = researchVerification.functionalChecks.find(
  (check) => check.module === 'Harness',
);
assert.equal(recordedHarnessCheck.simulationIgnition, true);
assert.equal(recordedHarnessCheck.externalFiring, false);
assert.equal(recordedHarnessCheck.sixLegCompletion, 'pending');

let links = 0;
for (const file of files) {
  if (file.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  if (!file.endsWith('.html')) continue;
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (
      /\bsrc=/.test(match[1]) ||
      /\btype=["'](?:application\/ld\+json|importmap)["']/.test(match[1])
    )
      continue;
    new vm.Script(match[2], { filename: file });
  }
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (/^(?:https?:|data:|mailto:|#)/.test(value)) continue;
    const target = path.resolve(path.dirname(file), value.split(/[?#]/)[0]);
    assert.ok(
      target === site || target.startsWith(site + path.sep),
      `Route outside site: ${value}`,
    );
    assert.ok(fs.existsSync(target), `Missing route or asset: ${file} → ${value}`);
    if (fs.statSync(target).isDirectory()) {
      assert.ok(
        fs.existsSync(path.join(target, 'index.html')),
        `Missing directory entry: ${value}`,
      );
    }
    links++;
  }
}

const hub = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
for (const name of ['tap', 'surface', 'science', 'communicate', 'manifest', 'display', 'harness']) {
  assert.ok(hub.includes(`href="./${name}/"`), `Missing hub route ${name}`);
}
assert.ok(!hub.includes('www.perplexity.ai/computer/a/'), 'Hub routes must be independent');
const worker = fs.readFileSync(path.join(site, 'tap/sw.js'), 'utf8');
assert.ok(worker.includes('k.startsWith(PREFIX)'), 'Tap cleanup must not delete sibling caches');
assert.ok(
  worker.includes('url.pathname.startsWith(scope.pathname)'),
  'Tap fetch scope must be bounded',
);
const fixture = JSON.parse(fs.readFileSync(path.join(site, 'harness/fixture.json'), 'utf8'));
assert.equal(fixture.source_revision, '56f072bef29003b4c730e6e7cf221ff87b801362');
assert.equal(fixture.planar.result.pair_status, 'surface_derived');
assert.equal(fixture.planar.tap_only, 'incomplete');
assert.equal(fixture.planar.surface_only, 'unsupported');
assert.equal(fixture.sphere.canonical, false);
assert.equal(fixture.sphere.check.passed, true);
assert.equal(fixture.sphere.negative_control.passed, false);
assert.ok(
  fixture.normal_residue.result.numerical.residue_field.some(
    (r) => r.id === 'surface' && r.normal[2] === 0.4,
  ),
);

async function checkSentinels() {
  const api = require(path.join(site, 'harness/sentinel_dot.js'));
  const a = new api.SentinelLog({ sender: 'A-test' });
  const b = new api.SentinelLog({ sender: 'B-test' });
  for (let cycle = 0; cycle < 3; cycle++) {
    const input = await a.action('synthetic_input', { cycle, raw_retained: false });
    await b.action('synthetic_output', {
      cycle,
      input_A_hash: input.entry_hash,
      previous_B_hash: b.head()[1],
    });
  }
  assert.equal((await a.verify()).ok, true);
  assert.equal((await b.verify()).ok, true);
  for (const log of [a, b]) {
    let previous = api.GENESIS_HASH;
    for (const [i, entry] of log.entries.entries()) {
      const { entry_hash, ...body } = entry;
      assert.equal(entry.seq, i);
      assert.equal(entry.prev_log_hash, previous);
      assert.equal(
        crypto.createHash('sha256').update(api.canonicalJson(body)).digest('hex'),
        entry_hash,
      );
      previous = entry_hash;
    }
  }
  b.entries.forEach((e, i) => {
    assert.equal(e.parameters.input_A_hash, a.entries[i].entry_hash);
    assert.equal(e.parameters.previous_B_hash, e.prev_log_hash);
  });
  b.entries[1].parameters.cycle = 99;
  assert.equal((await b.verify()).ok, false, 'Tampered receipt must fail');
  console.log(
    `PASS: ${files.length} static assets; ${links} local routes; fixture controls; fail-closed page evidence; independent SHA-256 and A/B linkage; tamper rejection.`,
  );
}
checkSentinels().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
