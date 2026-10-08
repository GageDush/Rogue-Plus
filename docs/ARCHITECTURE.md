# Rogue+ target architecture

## Development tracking ownership

project/tasks.json owns ongoing task state and evidence; scripts/project-tracking.mjs generates STATUS, ROADMAP, NEXT_TASK, FILE_MAP and the README progress block. DECISIONS owns accepted contracts and pending changes. CURRENT_STATE and earlier companion architecture JSON audits are dated evidence. No generator changes application schemas or accepts design decisions automatically. Local read-only analysis and Rogue+ backup/restore remain in scope; re-encryption, modified game-save export and uploads to PokéRogue are excluded.

## Immutable boundaries
- `reference/`: version-pinned public PokéRogue starter/mechanics data. Offline bundle.
- `import/`: decrypts and validates a user-supplied file locally; discards trainer-secret fields before normalizing.
- `domain/`: pure rules, Build legality, ownership checks, goal recommendations; no UI or storage imports.
- `storage/`: repositories and versioned migration/backup adapters; no React dependencies.
- `features/`: UI screens and feature-local hooks, consuming typed domain/repository contracts, not importing other features.
- `app/`: navigation, module registry, shell, shared state composition, controlled capability grants.
- `ui/`: tokens and shared accessible primitives. Components must not import features.

## Target persistence
`AccountState[profileId]`: imported, timestamped system snapshots, never overwritten by user editing.
`RunState[profileId, runId]`: independent session data; guest and official runs explicitly distinguished.
`UserContent`: reusable Builds, user Goals, notes, UI settings; independent of active account or import/reset.

Legacy combined schema-v2 state must remain recoverable until v3 import validation passes. No silent data deletion, rollback on incomplete migration. JSON backup must be schema-versioned and previewed before restoration; individual Build JSON/code formats must not leak player account identity.

### Failed-load recovery (S0)

Startup uses loading/ready/blocked phases; only ready enables the React autosave effect. A rejected current envelope never falls back to a legacy migration that would replace it. Malformed localStorage JSON remains an error, not absent state. A present IndexedDB API with a failed read blocks startup rather than assuming its inaccessible database is empty. Both current storage values must pass envelope validation when present: a usable localStorage fallback cannot hide rejected IndexedDB bytes. After validation, localStorage fallback values take precedence because successful IndexedDB writes remove that fallback key. When the IndexedDB API is absent, localStorage remains supported.

Blocked startup exposes a persistent recovery screen with retry and explicitly confirmed local-account reset. Ordinary import/demo/restore controls remain inaccessible while blocked. Retry/reload do not write rejected data. A failed IndexedDB reset cannot be reported as a successful localStorage-only reset. Successful deliberate reset clears account keys and permits a fresh account; cached artwork is unaffected. No automatic quarantine, schema migration, nested backup-validation overhaul, raw recovery export or PokéRogue save write-back is added. See project/evidence/S0.md for exact tests and release limitations.

## Module capability model
- Stable module IDs, versions, dependency and compatibility declarations; explicit read-only game-state and storage capability scopes.
- Core features appear in main navigation. Experimental/optional modules appear in Modules, with truthful availability status.
- Plugins are bundled, reviewed and tested; no remote-script injection or generic access to browser storage.

## Domain portability
- Internal UI routes and static assets resolve from the current origin/base path, never a hard-coded workers.dev hostname.
- All external services, including the optional Play preview URL, live in a single `app/config.ts`.
- Custom domain migration should require DNS/Cloudflare configuration and, if needed, one external configuration change, not edits across screens.

## UI design
- Hybrid: Home/Trainer/Goals compact analytic surfaces; Dex/Build/Run use richer visual hierarchy and Pokémon imagery.
- Shared typography, radius, spacing, neutral panels, and orange accent via tokens; feature components cannot create their own inconsistent palette.
- Mobile uses five primary destinations: Home / Dex / Build / Run / Goals, with secondary navigation in the header and More screen.
- A "Planned" UI must be clearly labeled; it may not claim a non-existent editor, module or data source is functional.


## Implemented appearance boundary (U1)

UI appearance is independent of combined-v2 account persistence. `ui/theme.ts` resolves System/Light/Dark and writes only `rogue-plus-appearance-v1` in localStorage; account imports/backups/reset continue using existing repositories unchanged. `index.html` applies the initial palette before React, then the UI controller handles media-query and cross-tab preference updates. React observes the controller with useSyncExternalStore. Semantic CSS variables serve every route including recovery. Private account loading/autosave phases remain unchanged.

## Candy planning ownership

`domain/candy-actions.ts` supplies pure read-only affordable actions through the domain facade. It owns no purchase or persistence mechanism. `reference/mechanics.v1.json` includes hatch-based egg prices from the unchanged pinned source and provenance. Home owns the local sort/expansion state; legacy Goals scoring remains independent. Shared `ui/components/AppWidgets.tsx` owns accessible completion bars and unavailable-denominator presentation. UI formatters translate historical shiny shorthand without rewriting stored/imported facts.
