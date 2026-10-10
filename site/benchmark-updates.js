'use strict';
// Hub-only metadata check. Science, instruments and credit ledger never poll.
(() => {
  const panel = document.querySelector('.benchmark-evidence');
  const status = document.getElementById('benchmark-update-status');
  const button = document.getElementById('benchmark-refresh');
  const auto = document.getElementById('benchmark-auto');
  const links = document.getElementById('benchmark-update-links');
  if (!panel || !status || !button || !auto) return;
  const initial = panel.dataset.benchmarkRevision;
  let etag = null, busy = false, controller = null;
  async function check() {
    if (busy || document.hidden) return;
    busy = true;
    button.disabled = true;
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(), 8000);
    try {
      const response = await fetch('benchmarks.json', {
        signal: controller.signal, cache: 'no-cache',
        headers: etag ? { 'If-None-Match': etag } : {},
      });
      if (response.status === 304) {
        status.textContent = 'Evidence unchanged · conditional response, no catalogue body.';
        return;
      }
      if (!response.ok) throw Error('HTTP ' + response.status);
      const declaredLength = Number(response.headers.get('Content-Length') || 0);
      if (declaredLength > 65536) throw Error('Catalogue exceeds 64 KB limit.');
      // Bound streaming response too; do not trust Content-Length.
      const reader = response.body.getReader();
      let length = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > 65536) { await reader.cancel(); throw Error('Catalogue exceeds 64 KB limit.'); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const value = JSON.parse(new TextDecoder().decode(bytes));
      if (value.schema !== 'scandoc-zero-benchmark-registry/1' ||
          typeof value.revision !== 'string' || value.revision.length > 100 ||
          !Array.isArray(value.records) || value.records.length > 32 ||
          !Array.isArray(value.modules) || value.modules.length !== 8)
        throw Error('Unsupported evidence catalogue.');
      for (const flag of ['demonstrated_agi','external_llm_inference','canonical_sphere','physical_validation'])
        if (value.claims?.[flag] !== false) throw Error('Unsupported scope promotion.');
      for (const record of value.records) {
        if (!/^10\.5281\/zenodo\.\d+$/.test(record.doi) || record.canonical !== false ||
            typeof record.title !== 'string' || record.title.length > 240 ||
            !['published-report','published-provisional','related-published-report'].includes(record.evidence_status))
          throw Error('Invalid DOI evidence record.');
      }
      etag = response.headers.get('ETag');
      if (value.revision === initial) {
        status.textContent = 'Evidence snapshot is current · ' + length + ' bytes checked.';
        links.replaceChildren();
      } else {
        status.textContent = 'New evidence snapshot: ' + value.revision +
          '. Review the linked deposits; reload to see the new scoped panels. Running simulations remain pinned.';
        links.replaceChildren(...value.records.map(record => {
          const p = document.createElement('p'), a = document.createElement('a');
          a.href = 'https://doi.org/' + record.doi;
          a.textContent = record.doi + ' · ' + record.title;
          a.target = '_blank'; a.rel = 'noopener noreferrer';
          p.append(a);
          return p;
        }));
      }
    } catch (error) {
      status.textContent = 'Update check unavailable; embedded evidence retained. ' + error.message;
    } finally {
      clearTimeout(timeout);
      controller = null; busy = false; button.disabled = false;
    }
  }
  button.addEventListener('click', check);
  auto.addEventListener('change', () => { if (auto.checked) check(); });
  const timer = setInterval(() => { if (auto.checked && !document.hidden) check(); }, 900000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) controller?.abort(); });
  window.addEventListener('pagehide', () => { clearInterval(timer); controller?.abort(); });
})();
