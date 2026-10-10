// Compile DOI panels into static HTML. Runtime experiments stay local.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const file = path.join(site, 'benchmarks.json');
function validate(value) {
  assert.equal(value.schema, 'scandoc-zero-benchmark-registry/1');
  assert.match(value.revision, /^[A-Za-z0-9._-]{1,100}$/);
  assert.match(value.reviewed_at, /^\d{4}-\d{2}-\d{2}$/);
  for (const field of ['demonstrated_agi', 'external_llm_inference', 'canonical_sphere', 'physical_validation'])
    assert.equal(value.claims[field], false, `Unsupported release claim: ${field}`);
  assert.equal(value.modules.length, 8);
  const ids = new Set(), records = new Map();
  for (const r of value.records) {
    assert.ok(!records.has(r.id), 'Duplicate record');
    assert.match(r.doi, /^10\.5281\/zenodo\.\d+$/);
    assert.equal(r.url, 'https://zenodo.org/records/' + r.doi.split('.').at(-1));
    assert.match(r.source_commit, /^[a-f0-9]{40}$/);
    assert.ok(['published-report','published-provisional','related-published-report'].includes(r.evidence_status));
    assert.equal(r.canonical, false, 'Canonical promotion is unsupported');
    records.set(r.id, r);
  }
  for (const m of value.modules) {
    assert.ok(!ids.has(m.id), 'Duplicate module');
    assert.ok(['tap','surface','science','communicate','manifest','display','harness','hub'].includes(m.id));
    assert.equal(m.route, m.id === 'hub' ? './' : m.id + '/');
    ids.add(m.id);
    for (const ref of m.references) {
      assert.ok(records.has(ref.record), 'Unknown DOI reference');
      assert.ok(typeof ref.relation === 'string' && ref.relation.length > 4);
    }
  }
  assert.equal(ids.size, 8);
  return value;
}
const escape = (s) => String(s).replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function panel(registry, module) {
  const records = new Map(registry.records.map(r => [r.id, r]));
  const references = module.references.map(ref => {
    const r = records.get(ref.record);
    return `<li style="margin:10px 0"><a href="https://doi.org/${escape(r.doi)}" target="_blank" rel="noopener noreferrer">${escape(r.doi)}</a>
      <span> · ${escape(r.title)} (${escape(r.version)})</span><br>
      <small>${escape(ref.relation)}. ${escape(r.access)}. ${escape(r.scope)}</small></li>`;
  }).join('');
  const updates = module.id === 'hub' ? `
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
      <button type="button" id="benchmark-refresh">Check evidence update</button>
      <label><input type="checkbox" id="benchmark-auto"> Optional visible-page checks every 15 minutes</label>
    </div>
    <p id="benchmark-update-status" role="status">Embedded snapshot. No automatic network polling unless enabled.</p>
    <div id="benchmark-update-links"></div>
    <script defer src="benchmark-updates.js"></script>` : '';
  return `<!-- BEGIN BENCHMARK EVIDENCE -->
<section class="benchmark-evidence" aria-label="Scoped benchmark and DOI evidence" data-benchmark-revision="${escape(registry.revision)}"
 style="margin:24px 0;padding:16px;border:1px solid currentColor;border-radius:6px;line-height:1.5;overflow-wrap:anywhere">
 <details${module.id === 'hub' ? ' open' : ''}><summary><strong>Benchmark evidence · ${escape(module.title)}</strong></summary>
 <p>${escape(module.scope)}</p>
 <p><strong>Status:</strong> local browser/software checks, not AGI or physical validation. DOI reports below retain their own source and scope.</p>
 ${references ? `<ul style="padding-left:20px">${references}</ul>` : '<p>No directly underpinning published DOI benchmark is assigned. Do not invent one.</p>'}
 <p><small>Registry ${escape(registry.revision)} · reviewed ${escape(registry.reviewed_at)}.
 The archived snapshot is immutable; later benchmark settings update the live site only.
 Updated evidence does not silently replace a running fixture or promote the sphere.</small></p>
 ${updates}
 </details>
</section>
<!-- END BENCHMARK EVIDENCE -->`;
}
function build() {
  const registry = validate(JSON.parse(fs.readFileSync(file, 'utf8')));
  for (const m of registry.modules) {
    const htmlFile = path.join(site, m.id === 'hub' ? 'index.html' : m.id + '/index.html');
    let html = fs.readFileSync(htmlFile, 'utf8');
    html = html.replace(/<!-- BEGIN BENCHMARK EVIDENCE -->[\s\S]*?<!-- END BENCHMARK EVIDENCE -->\s*/g, '');
    if (m.id === 'tap') {
      // Tap is a full-screen instrument; keep evidence inside its existing HUD.
      const anchor = '<div id="controls">';
      const pos = html.indexOf(anchor), hudEnd = html.lastIndexOf('</div>', pos);
      assert.ok(pos > 0 && hudEnd > 0, 'Tap HUD anchor missing');
      html = html.slice(0, hudEnd) + panel(registry, m).replace('margin:24px 0', 'margin:8px 0;max-width:210px;pointer-events:auto') + '\n' + html.slice(hudEnd);
    } else {
      assert.ok(html.includes('</main>'), 'Main container missing');
      html = html.replace('</main>', panel(registry, m) + '\n</main>');
    }
    fs.writeFileSync(htmlFile, html.replace(/[ \t]+$/gm, '').trimEnd() + '\n');
  }
  console.log(`PASS: eight scoped DOI panels compiled from ${registry.revision}.`);
}
if (require.main === module) build();
module.exports = { validate, panel, build };
