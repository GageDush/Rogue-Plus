# Next verified work packet — hybrid shell v1

**Branch:** `design/hybrid-shell-v1`, based on `alpha/companion-foundation` (not `main`).

## In scope
- Canonical navigation: Home / Dex / Build / Run / Goals; secondary Trainer / History / Fusion / Modules / Import & Settings.
- Keep static Build presets clearly marked as presets. Run and module availability must be honestly marked planned/experimental.
- Introduce design tokens, refactor shell/primary navigation and shared surface styling; make Dex/Build a more visual companion while Home retains information density.
- Add tests for navigation registry, domain portability and static route behavior; extend mobile and desktop browser QA.
- Refresh documentation and run privacy scanner. No actual user .prsv or account backup in source/tests.

## Out of scope
- Storage v3, editing Builds, account profiles, real session import, official login, production release or reserve mirror (latter only on validated release).

## Release gates
- Existing synthetic backup/restore and import checks green.
- Build, strict TypeScript, module-boundary and route tests green.
- Mobile and desktop navigate all working screens, and distinguish planned from functional screens.
- External preview and iPhone signoff before merge/production. Personal backup isolated restore must be validated before future migration.

## Decision record
Visual C (hybrid); Sandbox A (rules legal, all supported options hypothetically available); sharing A (single Build JSON and portable code v1).
