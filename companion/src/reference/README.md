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

## Populated species fundamentals

DEX-REF-SPECIES statically reads TypeScript syntax at the unchanged game pin, including nested explicit form constructors. The generated `dex-reference.v1.json` represents all 1,084 non-NONE species IDs and 1,500 form records: official English names, types, generation, six base stats/BST and original starter costs. English names use the game gitlink locale revision `0696f674f631b47f208f5d687b427ed3e7cd81b0`, not a moving locale branch. `dex-coverage.v1.json` records source SHA-256 digests and exact boundaries. Generated outputs remain ignored and rebuildable. No downloaded code executes. Unexpected selected expressions, duplicate IDs/forms, missing names and inconsistent stats fail generation. Existing starter roster consumers stay unchanged. Roots, abilities, moves and selection remain explicitly unavailable until their packets; no rich search is enabled.

## Ability/passive coverage

DEX-REF-ABILITIES resolves 317 officially named ability IDs, ordinary/hidden slots for all 1,500 forms and form-specific passives. Declared NONE is null; the game constructor's second-slot alias is left for selection compatibility. Passive lookup reproduces the pinned registry's form-zero fallback. Official unnamed ABILITY_314/ABILITY_317 enum placeholders are excluded and coverage is partial; referenced unknown names fail generation. These public facts contain no unlocked/enabled ownership. Reference CI installs TypeScript before extraction; application CI now runs extractor tests.
