# PokéRogue Command Center source contract

The current bundle provides generated pinned starter IDs/names/costs and static mechanics/asset references. `dex-contract.ts` defines expanded public-fact types and an account-independent build-pack index; it does not yet populate expanded data or enable rich reference search.

## Rules
- Mutable imported player state is not game reference data.
- UI pages do not interpret raw save fields.
- UI pages do not construct Pokémon asset URLs.
- Versioned team/fusion definitions are user-data sources, not game-source facts.
- Bundled game reference data is versioned and never fetched live during normal app use.
- Production validates generic account invariants rather than using real user save expectations.
- Private regression values must remain outside Git and the published browser bundle.
- Current IndexedDB snapshots are preserved as legacy. One fresh .prsv import will establish schema-v2 state after Pass 2/4 migration work.
