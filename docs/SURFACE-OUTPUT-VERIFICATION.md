# Surface convex output v2: verification

This update changes the browser Surface preview and its hub description only. The verified Python runtime, original Tap/Surface repositories, releases and Zenodo deposits remain unchanged.

## Checks completed

- Pure-model tests cover continuous layers, inward/outward closed crossings, wobble, unresolved endpoints, priority, finite-value rejection, indirect rhythm placement, detached pattern copies and tilt math.
- The full previews checker verifies JavaScript syntax, local routes and assets, prior harness fixture boundaries and independent Sentinel hashes.
- Desktop browser input exercised all four fixtures, pointer crossing, keyboard excitation and Escape stop.
- Web Audio reached a running context, scheduled oscillators and produced non-zero PCM through an analyser used by the test harness only.
- Mute and Stop cancelled active sound; Clear destroyed the sixteen-cell pattern and traces.
- Mobile touch seeded the loop; manual altitude validation, tempo and output level worked.
- Permission-denied, simulated-granted tilt events, disabling tilt and hidden-page cleanup were exercised.
- Traces stayed within the 24-trace bound and expired after six seconds even in reduced-motion mode after stopping.
- A 320px phone-width check found no horizontal page overflow; desktop and phone light/dark screenshots were inspected.
- No page-script errors occurred during these checks.

## Deliberate limitations

Phone layout was tested in Chromium with mobile/touch emulation, not on a physical iPhone or Safari. Device-orientation grant and values were simulated for permission/lifecycle testing, not measured from real hardware. Audio scheduling and PCM were checked; there is no claim of calibrated sound level or hardware listening quality.

Output classes encode declared chart rules, not measured Earth-layer violations. The app does not reconstruct radius/origin/interior, certify hidden balance, detect collider effects, record sound or connect to a live Tap engine. Derived traces and rhythm cells remain data and are not guaranteed anonymous or externally unrecordable.
