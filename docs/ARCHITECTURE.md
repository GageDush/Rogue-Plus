# Rogue+ target architecture

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
