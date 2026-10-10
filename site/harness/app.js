'use strict';
const $ = (id) => document.getElementById(id),
  names = ['Tap', 'Surface', 'Science', 'Communicate', 'Manifest', 'Display'];
const roles = [
  'Independent contact instrument: reduced encounter and origin binding. A Tap record alone is incomplete at the paired-v2 boundary.',
  'Independent response instrument: tangent flow, retained normal residue and a scoped state receipt. No Tap means unsupported, not autonomous validation.',
  'Knowledge-only study role: retain uncertainty, controls and counterexamples. No reward, social score or conformity criterion.',
  'Non-cash resource-accounting role: keep dependency and budget scope. This harness issues no credits, burns or refunds.',
  'Evidence Gate presentation: bind declared scope and receipt dependencies, without authenticating the author or claiming truth.',
  'Modular Topology presentation: expose identities, allowed relations and diagnostic traces. Appearance is not authority.',
];
let fixture = null,
  mode = 'planar',
  frame = 0,
  active = false,
  busy = false,
  timer = null,
  history = [],
  samples = [],
  lastPoints = [],
  lastMetrics = null;
let A = new SentinelDot.SentinelLog({ sender: 'sentinel_dot_A_simulation' }),
  B = new SentinelDot.SentinelLog({ sender: 'sentinel_dot_B_simulation' });
const canvas = $('shell'),
  ctx = canvas.getContext('2d');
let w = 1,
  h = 1;
document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light';
const sub = (a, b) => a.map((v, i) => v - b[i]),
  add = (a, b) => a.map((v, i) => v + b[i]),
  norm = (a) => Math.hypot(...a),
  dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const fixed = (x) => (Math.abs(x) < 1e-12 ? '0.000' : x.toFixed(3)),
  vec = (v) => v.map(fixed).join(', ');
const base = () => (mode === 'planar' ? fixture.planar_points : fixture.sphere.points);
const center = (k) => (mode === 'planar' ? [k * 0.06, 0, 0] : [k * 0.035, 0, 0]);
function geometry(k, fault = 'none') {
  const c = center(k),
    angle = k * 0.08;
  return base().map((p, i) => {
    let q =
      mode === 'planar'
        ? add(p, c)
        : add(
            [
              p[0] * Math.cos(angle) - p[1] * Math.sin(angle),
              p[0] * Math.sin(angle) + p[1] * Math.cos(angle),
              p[2],
            ],
            c,
          );
    if (i === 1 && fault === 'normal')
      q = add(q, mode === 'planar' ? [0, 0, 0.12] : sub(q, c).map((x) => x * 0.18));
    if (i === 1 && fault === 'shear') q = add(q, [0.22, 0, 0]);
    return q;
  });
}
function inspect(points, k, prev) {
  const originals = base(),
    c = center(k);
  let metric = 0,
    radius = 0;
  for (let i = 0; i < 6; i++) {
    if (mode === 'sphere') radius = Math.max(radius, Math.abs(norm(sub(points[i], c)) - 1));
    for (let j = 0; j < i; j++)
      metric = Math.max(
        metric,
        Math.abs(norm(sub(points[i], points[j])) - norm(sub(originals[i], originals[j]))),
      );
  }
  const rows = points.map((p, i) => {
    const v = k === 0 ? [0, 0, 0] : sub(p, prev[i]).map((x) => x / 0.1);
    const n = mode === 'planar' ? [0, 0, 1] : sub(p, c).map((x) => x / norm(sub(p, c)));
    const moving =
      k === 0
        ? [0, 0, 0]
        : sub(
            v,
            sub(center(k), center(k - 1)).map((x) => x / 0.1),
          );
    const normal = n.map((x) => x * dot(moving, n)),
      tangent = sub(moving, normal);
    return { id: names[i], point: p, tangent, normal, world_velocity: v };
  });
  const median = [0, 1, 2].map((i) => {
    const sorted = rows.map((r) => r.tangent[i]).sort((a, b) => a - b);
    return (sorted[2] + sorted[3]) / 2;
  });
  return {
    metric,
    radius,
    pass: Math.max(metric, radius) <= 1e-9,
    rows,
    median,
    normal: Math.max(...rows.map((r) => norm(r.normal))),
  };
}
function cloneLog(log) {
  const copy = new SentinelDot.SentinelLog({ sender: log.sender });
  copy.entries = structuredClone(log.entries);
  copy.lines = log.lines.slice();
  return copy;
}
function votes(m, fault) {
  return [
    { name: 'Geometry', ok: m.pass, detail: 'Sampled radius / chord or rigid-translation metric' },
    {
      name: 'Harmonic',
      ok: fault !== 'disagree',
      detail: 'Scripted compatible-focus declaration; no harmonic solver',
    },
    {
      name: 'Provenance',
      ok: fixture.source_revision === '56f072bef29003b4c730e6e7cf221ff87b801362',
      detail: 'Bundled fixture pin present; not authorship authentication',
    },
  ];
}
function showAgents(v) {
  $('agents').replaceChildren(
    ...v.map((a) => {
      const d = document.createElement('div');
      d.className = 'agent';
      const t = document.createElement('strong');
      t.textContent = a.name + ' / ' + (a.ok ? 'fixture accepts' : 'fixture rejects');
      t.className = a.ok ? 'pass' : 'fail';
      const s = document.createElement('span');
      s.textContent = a.detail;
      d.append(t, s);
      return d;
    }),
  );
}
function stop() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  $('play').textContent = 'Play slowly';
}
function buttons() {
  const cap = frame >= 64;
  $('ignite').disabled = busy || active || !fixture;
  $('step').disabled = busy || !active || cap;
  $('play').disabled = busy || !active || cap;
  $('reset').disabled = busy || !fixture;
  $('mode').disabled = busy || active;
  $('fault').disabled = busy;
  $('verify').disabled = busy || !A.entries.length;
  $('export').disabled = busy || !A.entries.length;
}
function report(text, fail = false) {
  $('status').textContent = text;
  $('status').dataset.fail = String(fail);
}
async function event(ignition = false) {
  if (busy || !fixture || (!ignition && !active) || frame >= 64) return;
  busy = true;
  buttons();
  try {
    const next = ignition ? 0 : frame + 1,
      fault = $('fault').value,
      points = geometry(next, fault),
      m = inspect(points, next, ignition ? points : lastPoints),
      v = votes(m, fault);
    showAgents(v);
    if (!v.every((a) => a.ok) && fault === 'disagree') {
      stop();
      report(
        'Ignition / step blocked: scripted adapter disagreement. No A/B receipts or trajectory frame committed.',
        true,
      );
      return;
    }
    if (ignition && !m.pass) {
      report(
        'Ignition blocked by the negative control. Restore compatible movement before ignition.',
        true,
      );
      return;
    }
    const stagedA = cloneLog(A),
      stagedB = cloneLog(B);
    const params = {
      schema: 'scandoc-derived-encounter-simulation/1',
      cycle: next,
      mode,
      original_payload_retained: false,
      baseline: fixture.source_revision,
      fault,
      points_micro: points.map((p) => p.map((x) => Math.round(x * 1e6))),
      core_balance: 'not_measured',
    };
    const ar = await stagedA.action(
      ignition ? 'simulation_ignition_input' : 'synthetic_contact',
      params,
    );
    const output = {
      schema: 'scandoc-derived-response-simulation/1',
      cycle: next,
      mode,
      input_A_hash: ar.entry_hash,
      input_A_sequence: ar.seq,
      previous_B_hash: stagedB.head()[1],
      metric_error_nano: Math.round(m.metric * 1e9),
      radius_error_nano: Math.round(m.radius * 1e9),
      normal_velocity_micro: Math.round(m.normal * 1e6),
      invariant_sample_pass: m.pass,
      topology: 'six-stable-identities-declared-around-zero',
      world_feedback: 'pending',
      sphere_canonical: false,
      external_llm_inference: false,
    };
    if (m.pass)
      await stagedB.action(ignition ? 'simulation_ignition_output' : 'surface_derived', output);
    else await stagedB.reject('false_invariant', 'sampled-metric-counterexample', output);
    const av = await stagedA.verify(),
      bv = await stagedB.verify();
    if (!av.ok || !bv.ok) throw new Error('staged-chain-integrity');
    A = stagedA;
    B = stagedB;
    frame = next;
    active = true;
    lastPoints = points;
    lastMetrics = m;
    samples.push({ cycle: frame, points: structuredClone(points), diagnostic_only: !m.pass });
    history.push({
      cycle: frame,
      kind: ignition ? 'ignition' : m.pass ? 'compatible sample' : 'counterexample retained',
      A: ar.entry_hash,
      B: B.head()[1],
    });
    render();
    report(
      m.pass
        ? ignition
          ? 'Simulation ignited: local A/B receipts bound; six identities retained. World feedback remains pending.'
          : 'Compatible sampled step: shared transformation preserves the declared metric; hidden balance remains unmeasured.'
        : 'False invariant detected: declared identities persist, but the geometric claim fails. B records rejection; the red trajectory is diagnostic only.',
      !m.pass,
    );
    if (!m.pass || frame >= 64) stop();
  } catch (error) {
    stop();
    report('Operation not committed: ' + error.message, true);
  } finally {
    busy = false;
    buttons();
  }
}
function render() {
  const m = lastMetrics;
  $('frame').textContent = frame + ' / 64';
  $('metric').textContent = m ? m.metric.toExponential(2) : '—';
  $('normal').textContent = m ? m.normal.toFixed(4) : '—';
  $('integrity').textContent = A.entries.length ? 'Bound locally' : 'No event yet';
  $('a-head').textContent = A.entries.length
    ? `sequence ${A.head()[0] - 1}\n${A.head()[1]}`
    : 'No receipt';
  $('b-head').textContent = B.entries.length
    ? `sequence ${B.head()[0] - 1}\n${B.head()[1]}`
    : 'No receipt';
  $('events').textContent = history.length
    ? history
        .slice()
        .reverse()
        .map((e) => `${e.cycle} / ${e.kind}\nA ${e.A}\nB ${e.B}`)
        .join('\n\n')
    : 'No events';
  $('rows').replaceChildren(
    ...names.map((name, i) => {
      const tr = document.createElement('tr'),
        row = m?.rows[i];
      [
        name,
        vec(row?.tangent || [0, 0, 0]),
        vec(row?.normal || [0, 0, 0]),
        m ? (m.pass ? 'sample pass' : 'global claim fails') : 'unstarted',
      ].forEach((text, j) => {
        const td = document.createElement('td');
        td.textContent = text;
        td.dataset.label = ['Leg', 'Tangent velocity', 'Normal velocity', 'Metric status'][j];
        if (j === 3 && m) td.className = m.pass ? 'pass' : 'fail';
        tr.append(td);
      });
      return tr;
    }),
  );
  $('flow').textContent =
    mode === 'planar'
      ? 'Tangent / normal outputs are relative to the translating plane, as in the current contract. Shared world translation is removed; no ergonomic correction is applied.'
      : 'Sphere diagnostic uses endpoint radial normals and finite differences. Discrete chord velocity can have normal residue even on an exact sphere. This is not the planar runtime’s estimator.';
  $('mode-label').textContent =
    mode === 'planar' ? 'CURRENT PLANAR CONTRACT' : 'QUARANTINED SPHERE EVENT';
  $('leg-title').textContent = names[Number($('leg').value)];
  $('leg-role').textContent = roles[Number($('leg').value)];
  draw();
  buttons();
}
function reset() {
  stop();
  frame = 0;
  active = false;
  history = [];
  samples = [];
  lastMetrics = null;
  mode = $('mode').value;
  A = new SentinelDot.SentinelLog({ sender: 'sentinel_dot_A_simulation' });
  B = new SentinelDot.SentinelLog({ sender: 'sentinel_dot_B_simulation' });
  lastPoints = geometry(0);
  $('verify-result').textContent =
    'In-memory session only. Reset destroys this run after optional export.';
  showAgents(votes(inspect(lastPoints, 0, lastPoints), 'none'));
  report('Ready: choose a scope, then ignite the synthetic harness. No world contact is asserted.');
  render();
}
function draw() {
  if (!fixture) return;
  const s = getComputedStyle(document.documentElement),
    color = (k) => s.getPropertyValue('--' + k).trim();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color('bg');
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color('grid');
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const c = center(frame),
    scale = Math.min(w * 0.22, h * 0.25),
    cx = w / 2,
    cy = h / 2;
  const project = (p) => {
    const q = sub(p, c);
    return [cx + scale * (q[0] + q[2] * 0.35), cy - scale * (q[1] + q[2] * 0.45)];
  };
  ctx.strokeStyle = color('accent');
  ctx.globalAlpha = 0.45;
  ctx.setLineDash([4, 5]);
  ctx.strokeRect(cx - scale * 1.2, cy - scale * 1.2, scale * 2.4, scale * 2.4);
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  if (mode === 'sphere') {
    ctx.strokeStyle = color('muted');
    ctx.globalAlpha = 0.4;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, scale, scale * (0.3 + k * 0.3), 0.25 * k, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  const labelPos = [
      [0.18, 0.13],
      [0.82, 0.13],
      [0.15, 0.5],
      [0.85, 0.5],
      [0.18, 0.87],
      [0.82, 0.87],
    ],
    selected = Number($('leg').value);
  names.forEach((name, i) => {
    const pos = project(lastPoints[i]),
      bad = lastMetrics && !lastMetrics.pass && i === 1;
    ctx.strokeStyle = color(bad ? 'danger' : i === selected ? 'amber' : 'accent');
    ctx.lineWidth = i === selected ? 2 : 1;
    if (samples.length > 1) {
      ctx.beginPath();
      samples.forEach((sample, j) => {
        const p = project(sample.points[i]);
        j ? ctx.lineTo(...p) : ctx.moveTo(...p);
      });
      ctx.stroke();
    }
    const lx = labelPos[i][0] * w,
      ly = labelPos[i][1] * h;
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(...pos);
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color(bad ? 'danger' : i === selected ? 'amber' : 'accent');
    ctx.beginPath();
    ctx.arc(...pos, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '500 12px Satoshi, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = color('panel');
    ctx.fillRect(lx - 47, ly - 14, 94, 28);
    ctx.fillStyle = color('ink');
    ctx.fillText(name, lx, ly + 4);
  });
  ctx.fillStyle = color('panel');
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color('accent');
  ctx.stroke();
  ctx.fillStyle = color('ink');
  ctx.font = '700 12px Satoshi, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ZERO', cx, cy - 1);
  ctx.font = '400 12px Satoshi, sans-serif';
  ctx.fillText('concealed', cx, cy + 15);
}
function resize() {
  const r = canvas.getBoundingClientRect(),
    d = Math.min(devicePixelRatio || 1, 2);
  w = r.width;
  h = r.height;
  canvas.width = Math.round(w * d);
  canvas.height = Math.round(h * d);
  ctx.setTransform(d, 0, 0, d, 0, 0);
  draw();
}
new ResizeObserver(resize).observe(canvas);
$('theme').onclick = () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  draw();
};
$('mode').onchange = reset;
$('leg').onchange = render;
$('fault').onchange = () => {
  stop();
  report('Negative control changed. It will be evaluated at the next ignition or step.');
};
$('ignite').onclick = () => event(true);
$('step').onclick = () => event();
$('play').onclick = () => {
  if (timer !== null) {
    stop();
    return;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    report('Reduced motion is enabled. Use Step to advance deliberately.');
    return;
  }
  timer = setInterval(() => event(), 700);
  $('play').textContent = 'Pause';
};
$('reset').onclick = reset;
$('verify').onclick = async () => {
  busy = true;
  stop();
  buttons();
  try {
    const av = await A.verify(),
      bv = await B.verify();
    const linked =
      A.entries.length === B.entries.length &&
      B.entries.every(
        (e, i) =>
          e.parameters.input_A_hash === A.entries[i].entry_hash &&
          e.parameters.input_A_sequence === i &&
          e.parameters.cycle === A.entries[i].parameters.cycle &&
          e.parameters.previous_B_hash === e.prev_log_hash,
      );
    $('verify-result').textContent =
      av.ok && bv.ok && linked
        ? 'Both hashes, sequences, previous heads and A→B references verify locally. No authorship or truth verified.'
        : 'Receipt validation failed.';
    $('integrity').textContent = av.ok && bv.ok && linked ? 'Verified locally' : 'Failed';
  } catch (error) {
    $('verify-result').textContent = 'Verification error: ' + error.message;
  } finally {
    busy = false;
    buttons();
  }
};
$('export').onclick = () => {
  const run = {
    schema: 'scandoc-six-leg-harness-simulation/1',
    limits: {
      external_llm_inference: false,
      core_balance: 'not_measured',
      world_feedback: 'pending',
      sphere_canonical: false,
      raw_input_retained: false,
      upstream_ignition_rerun: false,
    },
    fixture,
    mode,
    samples,
    A: A.entries,
    B: B.entries,
  };
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' }),
    ),
    a = document.createElement('a');
  a.href = url;
  a.download = 'Scandoc-Zero-derived-harness-run.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
fetch('fixture.json')
  .then((r) => {
    if (!r.ok) throw new Error('source-fixture-unavailable');
    return r.json();
  })
  .then((value) => {
    fixture = value;
    const summaries = [
      ['Current paired-v2', fixture.planar.result.pair_status],
      ['Tap without Surface', fixture.planar.tap_only],
      ['Surface without Tap', fixture.planar.surface_only],
      ['Normal residue fixture', 'derived; residue retained, not silently erased'],
      ['Sphere positive control', fixture.sphere.check.passed ? 'sample passed' : 'failed'],
      [
        'Sphere negative control',
        fixture.sphere.negative_control.passed ? 'unexpected pass' : 'counterexample detected',
      ],
      ['Historical ignition', 'recorded roles; no fresh upstream run'],
    ];
    $('fixtures').replaceChildren(
      ...summaries.map(([name, value]) => {
        const d = document.createElement('div');
        d.className = 'fixture';
        const b = document.createElement('strong');
        b.textContent = name;
        const span = document.createElement('span');
        span.textContent = value;
        d.append(b, span);
        return d;
      }),
    );
    reset();
  })
  .catch((error) => {
    report('Source fixture could not load: ' + error.message, true);
  });
