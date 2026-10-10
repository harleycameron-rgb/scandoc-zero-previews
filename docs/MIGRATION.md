# Migration to an independently editable repository

## What changed

The existing previews were copied into `site/`, without copying their nested Git history. The six-leg hub is the root entry point, its app routes now point to sibling folders, and its new Harness Observatory entrance sits at Zero rather than becoming a seventh leg.

The harness's return route now points to the local hub. Tap's offline worker uses a scope-qualified cache namespace, deletes only obsolete caches in that namespace, and intercepts only GET requests inside Tap's own folder. These are hosting changes, not changes to the instrument mathematics or the released runtime.

Source formatting is mechanical. The initial source SHA-256 values in `import-provenance.json` bind the original imports before routing, service-worker isolation and formatting changes; they are not checksums of every current editable file.

## Source pins

- WaxTablet paired/session/sphere reference: `56f072bef29003b4c730e6e7cf221ff87b801362`.
- InvariantTap original source and Sentinel writer: `f3a3f39134c05c01c836ad228eef031e855d3303`.
- Invariant Surface source scaffold: `91007b22fcb2b266865a1bf65428e965f7f1e025`.

Each remote main matched its local source pin when the harness was prepared. That check is historical, not a promise that remote branches never advance.

## Deliberate non-changes

No source repository, production branch, PR, release, tag or Zenodo deposit was altered. The source JPEGs and private quarantine/provenance ledger are absent. No new actual-model invocation, credit account, cash reward, full VelocitySplat kernel or upstream engine ignition is introduced.

GitHub's browser file view displays source code, not a live executable preview. Hosting remains a separate visibility and publication decision.
