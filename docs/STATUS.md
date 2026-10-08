# Rogue+ Integration Status

- Baseline: the sanitized companion source lives on `main`, whose first commit has no previous history.
- Reference catalog: generated from a pinned upstream revision, not committed as player data.
- Work branch: `alpha/play-integration`; not deployed or verified in a live game session.
- Source of truth: `GageDush/Rogue-Plus` (private).
- Upstream game revision: `e2cbf33b1f33686c63ef8e8c314273b9e5fd287d`.
- Goal: build Rogue+ companion at `/` and PokéRogue from source at `/play/` with a small extension bridge.
- Unknown: whether a custom-hosted frontend can authenticate/save on the live official backend.
- Original AppDeploy deployment remains unchanged.

**Do not mark the game as playable until actual browser boot, battle, and save tests pass.**

## 2026-10-08 Alpha Preview (isolated)
- Cloudflare Workers preview uses `wrangler preview`, `previews: {}`, and the dedicated `/play/` game route.
- Initial live experiment runs upstream's built-in Guest mode (`VITE_BYPASS_LOGIN=1`) to avoid cross-origin account API restrictions.
- Guest saves are stored in browser localStorage and **do not sync** with the official PokéRogue account or Rogue+ companion save imports.
- Only `/play/images/*` uses the read-only, pinned immutable upstream image proxy. No account or save endpoints are proxied.
- PR #1 remains draft; do not merge without browser QA and verifying legal/licensing obligations.
