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
