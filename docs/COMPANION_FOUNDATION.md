# Companion foundation — protected refactor

This is the separate `alpha/companion-foundation` branch. It is based on the last verified `main` production code and does **not** deploy to the production Worker.

## Data-safety rules
- No real `.prsv` saves, account values, browser backups, or local data leave the device.
- All UI module extraction must preserve the existing import, storage, and backup behavior byte-for-byte.
- Do not change schema versions or IndexedDB keys during UI extraction.
- Baseline `main` and the separate `alpha/play-integration` game preview remain unchanged.
- Before applying a future storage migration, export a real backup on the production site and verify restore using a **separate** browser profile or device.

## Release gates
1. Synthetic encrypted save test.
2. Backup round-trip and malformed/future schema rejection tests.
3. Companion production build (including pinned reference generator).
4. TypeScript check once baseline errors, if any, are triaged.
5. Each existing screen loads with the same interactions on desktop/mobile.
6. External preview QA with a synthetic test account, then an opt-in user test.
7. No PR merge into `main` without backup/restore verification.

This branch is the companion-only modularization work. It must not absorb the experimental PokéRogue game client.
