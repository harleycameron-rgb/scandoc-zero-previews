# Scandoc Zero previews

Eight editable static previews: the six-leg navigation hub, six distinct apps and the Harness Observatory at Zero. This repository is separate from the verified WaxTablet software baseline and contains no live AGI, shared account, paid inference service or production integration.

## Edit from GitHub

For a small change, open a file and use GitHub's pencil editor. For a larger change, open this repository in [GitHub's browser-based code editor](https://github.dev/harleycameron-rgb/scandoc-zero-previews), edit the files, then commit your changes. The browser editor is available free on GitHub according to [GitHub's documentation](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor); it is an editor, not a running preview server.

All HTML, CSS and JavaScript is formatted for reading. There is no framework, install step or build command for the apps.

| Area        | Start here                                           | Function                                                   |
| ----------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Six-leg hub | [site/index.html](site/index.html)                   | Local routes to all six apps and the harness               |
| Tap         | [site/tap/index.html](site/tap/index.html)           | Original browser instrument                                |
| Surface     | [site/surface/index.html](site/surface/index.html)   | Illustrative instrument scaffold                           |
| Science     | [site/science/index.html](site/science/index.html)   | Knowledge-only experiments                                 |
| Communicate | [site/communicate/core.js](site/communicate/core.js) | Simulated credit and burn policy                           |
| Manifest    | [site/manifest/core.js](site/manifest/core.js)       | Contract declarations and local bindings                   |
| Display     | [site/display/core.js](site/display/core.js)         | Imported-record inspection                                 |
| Harness     | [site/harness/app.js](site/harness/app.js)           | Scripted adapters, A/B receipts and trajectory diagnostics |

Use `index.html` for wording and layout, CSS files for visual style, and JS files for logic. Surface and Tap include much of their logic inside their HTML. Manifest and Display each contain a copy of `core.js`; if changing their common record schema, update both and test the handoff.

## Run and check locally

Serve only the `site/` folder using any local static HTTP server, then open its URL. Do not double-click the HTML files: the harness loads a JSON fixture and cryptographic features require a secure browser context such as HTTPS or localhost.

With Node.js 20 or later installed, run:

```sh
node tools/check.cjs
```

This checks JavaScript syntax, local routes and assets, fixture boundaries, independent Sentinel hash verification and the A/B relationship. It does not replace browser interaction tests or certify production security.

## Hosting status

Public publication was approved on 2026-10-10. The repository and its source are public; the previews are hosted through GitHub Pages.

The workflow at `.github/workflows/pages.yml` checks and publishes changes to `site/`, `tools/check.cjs` or the workflow when they are committed to `main`. You can also trigger it manually. Documentation-only commits do not redeploy. A failed check prevents the new deployment; check the repository's Actions tab before assuming an edit is live.

The hosted entry point is `site/index.html`. All navigation uses relative routes and does not depend on Perplexity preview URLs. The remote Fontshare font is optional; browser fallback fonts keep the pages usable.

## Boundaries and editing safeguards

- **Independent instruments:** Tap and Surface retain separate app identities while sharing the paired state/receipt contract at Zero.
- **Science:** Knowledge-only; no reward gate or social score.
- **Communicate:** Non-cash usage-credit simulation; no deposits, payment service or promised returns. Read [the current rules](docs/communicate-credit-and-burn-rules.md) before altering accounting.
- **Harness:** Scripted stand-ins, not independent LLM inference. Browser geometry is an explanatory reproduction; source fixtures were computed separately against the pinned Python baseline.
- **Sphere:** Quarantined, provisional and non-canonical. It does not define organism placement or validate the hidden nexus.
- **Zero-data:** No uploaded JPEGs, raw source contact, private alignment catalogue, credentials or keys are bundled. Derived coordinates and receipts remain data.
- **Receipts:** Local integrity is not authorship, source authentication or truth. Keep snapshots detached and hashed before committing them.
- **Baseline:** Do not use this repository to merge, rewrite, release or change the verified runtime.

Tap's service worker is scoped to its folder and cache namespace. If publishing changed Tap assets, bump `VERSION` in `site/tap/sw.js`; see [the migration notes](docs/MIGRATION.md).

Imported-source hashes and scope notes are in [the provenance record](docs/import-provenance.json). This repository does not grant a new blanket license to every imported file; preserved upstream notices and ownership still apply.
