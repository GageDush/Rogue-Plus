# Release audit — 2026-10-09

User authorized available release checks and reported their backup restores correctly, the loaded installed app works offline while retained in recent apps, and checks 1–5 also pass in standard Safari. No feature implementation, merge, history rewrite or production rollout was performed. Working source: design/profile-candy-overview, application baseline 5caad52e8e0780a291802f0408b62b93f3bf79b9 plus documentation-only local commit 228596c.

## Passing checks

- `npm test`: 72 application tests pass, including startup/read recovery, storage round trips, theme, artwork, reference, query and navigation checks.
- `npm run typecheck` and `npm run build`: pass. Vite retains the 2,697.50 kB / 326.58 kB gzip JavaScript chunk warning.
- `node --test scripts/dex-reference-extractor.test.mjs`: 12 pass.
- Repository validator: 175 tracked files pass; module-boundary validator: 54 source files / 10 routed screens pass.
- Tracking: 15 tests and freshness pass before recording this audit; regenerated views checked again with this evidence.
- Remote baseline CI: Companion UI regression 37967400188, Project tracking 37967399852 and Companion baseline 37967399837 all completed successfully at 5caad52.
- User reports passing the same five keyboard, detail-return, portrait/landscape clearance and rotation checks in both installed app and standard Safari. This completes U1-SAFE's installed/Safari clearance criterion. Larger-text review is not established by that report and is not represented as tested.
- User reports their actual backup restores correctly. This is real-user functional restoration evidence, but does not establish an independently observed isolated before/after comparison of every snapshot/history row.

## Recovery/validation finding

Executed current schema.ts through TypeScript's CommonJS transpilation in a Node VM with only the current reference-version constant and actual storage/types.ts imports. No player data was used. `parseBackup` accepted a schema-v2 current snapshot containing only `{schemaVersion: 2}`, history rows `[null, 17]`, missing stateSchemaVersion and negative stateSchemaVersion. A future backupSchemaVersion was rejected. Existing tests cover top-level/future rejection and round trips but not strict nested validation. App.handleBackup sets restored state before rendering; accepting structurally incomplete nested records can therefore replace usable account state. S1 AC1 fails. Failed-load preservation's existing tests still pass; the combined release gate fails because strict backup validation does not.

## Offline/update finding

Source review and an isolated Node VM service-worker harness establish that install precaches only `./`, index.html, manifest.webmanifest and icon.svg. Running install with a synthetic Cache API, then requesting the actual built JavaScript entry with network fetch rejecting, fails: the built JS/CSS dependencies are not part of install precaching. This is a worker-unit lifecycle result, not an observed native Safari cold start. Runtime fetch can cache already requested assets, so the user's retained loaded-app offline result remains valid. Cache writes are asynchronous outside fetch-event waitUntil, shell cache naming is unchanged between releases, and skipWaiting/clients.claim provide no controlled update handshake. Coherent startup/update guarantees remain unverified and require O0 work; do not advertise reliable cold offline launch from the retained-app result.

## Privacy review and limits

Fetched all current remote branch refs. Reviewed 11 remote branches, 84 reachable commits and 595 unique reachable blobs with path/content patterns for private save files, known personal account markers, credential material and populated private snapshot token/identity fields. No hits in those categories. Source review of import, persistence and backup composition confirms local processing; supplied private uploads and synthetic browser downloads remain outside Git. Existing fixtures are declared synthetic; public reference generation uses pinned upstream facts.

This is broader than the tracked-filename validator but is not proof that every possible personal value is detectable. GitHub PR attachments, Actions logs/artifacts, unreachable old GitHub objects, caches and previously cloned copies were not exhaustively inspected or deleted. docs/PRIVACY.md records earlier public-history exposure and remains controlling. D0's findings criterion passes; full source/log/artifact release signoff remains pending. No sensitive values are reproduced in this report.

## Release recommendation

Hold public production rollout for strict nested backup validation and reliable offline/update handling. Device checks and current regression tests pass. Isolated real-user restoration and historical artifact review retain their exact coverage limits; no release authorization is inferred from check completion. The inconsistent built-in demo caught-form masks are a known separate fixture issue recorded in U1-SAFE evidence.

## Authorized fix follow-up

The user subsequently authorized “Fix those two.” S1 now rejects malformed nested/envelope values before replacement and preserves supported unknown/legacy fields. O0 generates complete versioned offline precaches and waiting updates. See S1.md and O0.md for actual tests and limits. These fixes supersede the audit's source-level blockers; native cold-launch/update rollout and publication/CI results remain separate evidence rather than being inferred from the fixes.
