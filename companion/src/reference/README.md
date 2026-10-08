# PokéRogue Command Center source contract

Pass 1 establishes sources only; runtime behavior is intentionally unchanged until Pass 2.

## Rules
- Mutable imported player state is not game reference data.
- UI pages do not interpret raw save fields.
- UI pages do not construct Pokémon asset URLs.
- Versioned team/fusion definitions are user-data sources, not game-source facts.
- Bundled game reference data is versioned and never fetched live during normal app use.
- Production validates generic account invariants rather than using real user save expectations.
- Private regression values must remain outside Git and the published browser bundle.
- Current IndexedDB snapshots are preserved as legacy. One fresh .prsv import will establish schema-v2 state after Pass 2/4 migration work.
