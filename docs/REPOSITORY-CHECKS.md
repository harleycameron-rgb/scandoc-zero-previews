# Repository migration checks

The migration preserves the earlier previews and makes their routes independent of Perplexity hosting. It does not rerun the full Python runtime test suite or claim new production verification.

## Completed checks

- 32 static application assets imported, without nested `.git` directories or source JPEGs.
- All JavaScript files and inline HTML scripts passed syntax checks.
- 37 local route/asset references resolved within `site/`.
- The hub exposes all six apps and the Zero Harness Observatory.
- Current fixture controls preserve paired / incomplete / unsupported distinctions.
- Sphere positive and negative controls remain non-canonical.
- Sentinel hash chains and A/B references verified independently with SHA-256; mutation failed verification.
- All eight browser entry points loaded with no page-script errors.
- The migrated harness ignited and verified its local receipt chains.
- A hub route opened the local Surface app rather than a Perplexity destination.
- Desktop hub and harness entrance screenshots were inspected.
- Manifest's exported record was accepted by the migrated Display app.
- Tap's installed worker preserved an unrelated Science cache and removed only its own obsolete namespaced cache.
- Phone page width matched the 375px viewport without horizontal overflow.

## Publication boundary

Public source and GitHub Pages publication were explicitly approved by the owner on 2026-10-10. Site changes committed to `main` now trigger checks and deployment; documentation-only changes do not. This approval applies to the previews repository, not the released runtime or other repositories.
