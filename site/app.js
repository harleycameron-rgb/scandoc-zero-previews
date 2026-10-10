'use strict';
const $ = (id) => document.getElementById(id);
const LEGS = {
  zero: {
    kind: 'Common topology junction',
    title: 'Scandoc Zero',
    purpose:
      'Six distinct legs, with different roles, meet at the same junction. Choose a leg here or enter directly from the map.',
    scopeTitle: 'What this entrance does',
    scope:
      'Opens the existing previews. It does not combine their local sessions, infer AGI, transfer credit balances or change the released baseline.',
    note: 'The original app and exploratory previews keep their own scopes.',
  },
  tap: {
    kind: 'Original browser instrument',
    title: 'Tap',
    purpose:
      'Contact drives the forward and mirror moiré gates. Phase convergence produces relocation rings, sound and a local action record.',
    scopeTitle: 'An instrument, not the whole system',
    scope:
      'The original Tap app remains separate. Optional motion permission belongs to Tap; this navigation page captures no sensors.',
    note: 'Opens the existing original-app preview in a separate tab.',
  },
  surface: {
    kind: 'Instrument-layer HTML preview',
    title: 'Surface',
    purpose:
      'Gesture contact leaves a trace across an illustrative field and produces a local placeholder wobble-state stream.',
    scopeTitle: 'Visual response is not a verified invariant',
    scope:
      'Surface’s current HTML preview represents its scaffold. The mesh is illustrative, and its labels are not cryptographic proof or a live engine connection.',
    note: 'Opens the existing Surface preview in a separate tab.',
  },
  science: {
    kind: 'Knowledge-only environment',
    title: 'Science',
    purpose:
      'Keep questions, run synthetic planar comparisons and retain observations without asking knowledge to earn a reward.',
    scopeTitle: 'No incentive layer',
    scope:
      'Science has no wallet, reward gate or social score. Its sample experiments are bounded demonstrations, not general invariant proofs or live AGI.',
    note: 'Opens the existing Science preview in a separate tab.',
  },
  communicate: {
    kind: 'Provisional credit model · v2',
    title: 'Communicate',
    purpose:
      'Explore reserve → check → settle, working-module bonuses and rule-bound admission revocation.',
    scopeTitle: 'Simulated credits, not promised returns',
    scope:
      'A double return requires a recorded simulated host fault and fixture review. Burns preserve the hash, bonuses cannot stack with compensation, and no real account is funded.',
    note: 'Opens the revised Communicate model in a separate tab.',
  },
  manifest: {
    kind: 'Contract and evidence leg',
    title: 'Manifest',
    purpose:
      'Bind declarations, source lineage and scoped synthetic evidence into a portable local record.',
    scopeTitle: 'Binding is not source authentication',
    scope:
      'Manifest preserves declared-only, sample-supported and counterexample states. A content digest and local receipt bind data; they do not prove its source or the hidden core.',
    note: 'Export a single Manifest preview JSON to inspect it in Display.',
  },
  display: {
    kind: 'Topology and inspection leg',
    title: 'Display',
    purpose:
      'Inspect the declared relation map, transformation traces and Manifest-linked evidence without turning appearance into authority.',
    scopeTitle: 'Inspect the claim’s exact scope',
    scope:
      'Display checks imported content digests and recomputes synthetic samples. It does not authenticate provenance, verify previous receipt continuity or validate the sphere.',
    note: 'Opens the existing Display preview; Manifest’s JSON can be read locally there.',
  },
};
let selected = 'zero';
document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';
function choose(id) {
  if (!LEGS[id]) return;
  selected = id;
  const leg = LEGS[id];
  $('inspect').value = id;
  $('leg-kind').textContent = leg.kind.toUpperCase();
  $('leg-title').textContent = leg.title;
  $('leg-purpose').textContent = leg.purpose;
  $('scope-title').textContent = leg.scopeTitle;
  $('scope-detail').textContent = leg.scope;
  $('open-note').textContent = leg.note;
  const open = $('open-leg');
  if (id === 'zero') {
    open.href = '#directory';
    open.textContent = 'Explore all six legs';
    open.removeAttribute('target');
    open.removeAttribute('rel');
    $('route-label').textContent = 'Zero → choose a leg';
  } else {
    open.href = document.querySelector(`.leg-node[data-leg="${id}"]`).href;
    open.textContent = 'Open ' + leg.title + ' ↗';
    open.target = '_blank';
    open.rel = 'noopener noreferrer';
    $('route-label').textContent = 'Scandoc Zero → ' + leg.title;
  }
  for (const a of document.querySelectorAll('.leg-node'))
    a.classList.toggle('selected', a.dataset.leg === id);
  draw();
}
const canvas = $('wires'),
  ctx = canvas.getContext('2d'),
  map = $('map');
let width = 1,
  height = 1;
function draw() {
  const s = getComputedStyle(document.documentElement),
    color = (k) => s.getPropertyValue('--' + k).trim();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color('bg');
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = color('grid');
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.45;
  for (let x = 0; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const m = map.getBoundingClientRect(),
    z = $('zero').getBoundingClientRect(),
    cx = z.left - m.left + z.width / 2,
    cy = z.top - m.top + z.height / 2;
  for (const a of document.querySelectorAll('.leg-node')) {
    const b = a.getBoundingClientRect(),
      x = b.left - m.left + b.width / 2,
      y = b.top - m.top + b.height / 2;
    ctx.strokeStyle = color(a.dataset.leg === selected ? 'amber' : 'accent');
    ctx.lineWidth = a.dataset.leg === selected ? 2 : 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = color('accent');
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.45 - i * 0.1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, z.width / 2 + 10 + i * 11, z.height / 2 + 8 + i * 10, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function resize() {
  const r = map.getBoundingClientRect(),
    d = Math.min(devicePixelRatio || 1, 2);
  width = r.width;
  height = r.height;
  canvas.width = Math.round(width * d);
  canvas.height = Math.round(height * d);
  ctx.setTransform(d, 0, 0, d, 0, 0);
  draw();
}
new ResizeObserver(resize).observe(map);
$('theme').onclick = () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  draw();
};
$('inspect').onchange = () => choose($('inspect').value);
$('zero').onclick = () => choose('zero');
for (const a of document.querySelectorAll('.leg-node')) {
  a.addEventListener('focus', () => choose(a.dataset.leg));
  a.addEventListener('mouseenter', () => choose(a.dataset.leg));
  a.addEventListener('click', () => choose(a.dataset.leg));
}
choose('zero');
