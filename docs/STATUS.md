# Rogue+ current project status — 2026-10-08

## Production
- Cloudflare Workers companion: https://rogue-plus.gagedush-bff.workers.dev/
- Production source: `main`, commit `1fe923af979466cfa4d785127a69d9e3ae6edf9d`.
- System .prsv import, Dex, Trainer, fixed Build presets, Hunt priorities, snapshots/history, and local backup exports work. Storage is still the combined schema-v2 IndexedDB implementation.
- Real-user backup **exported by user**, but isolated restore of that exact file has **not** been verified.
- Do not claim multiple-account ownership or editable Builds work yet.

## In-development branches
- `alpha/companion-foundation`, draft PR #2: ten screens extracted; synthetic backup tests, TypeScript checks, production build, module import-boundary checks, desktop/mobile browser tests passing. Not merged to `main`.
- `alpha/play-integration`, draft PR #1: separately deployed Guest-mode upstream game preview, simulated Damage Preview and image proxy. User validated a battle on iPhone, including status-move handling. Guest saves are independent of official accounts.
- `design/hybrid-shell-v1`: design-system and canonical navigation work based on the foundation branch; no production release yet.

## Other systems
- Reserve-Rogue-Plus: public, verified sanitized snapshots of three original source branches as of 2026-10-08; not an automatic mirror yet.
- Cloudflare Pages project exists but its original deployment was stuck queued; **Workers** is authoritative. Domain switch is not scheduled.
- Project source and docs may have old references to a private repo or untested Play. This file is the current truth.

## Release gates
1. No actual player saves or identifiable account fixtures in source, history or CI.
2. Privacy audit + synthetic import/backup regression tests + type check + build.
3. Desktop/mobile browser checks for navigation, save persistence and restore.
4. Restore the user's exported backup in a separate browser/device before a storage migration.
5. Obtain explicit production rollout approval; do not merge design/game prototype together.
