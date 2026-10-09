# PokéRogue Command Center source contract

The current runtime consumes generated pinned starter IDs/names/costs and static mechanics/asset references. Build generation also produces expanded pinned species/forms/roots/abilities/moves through `dex-contract.ts`, with source digests and declared coverage. Selection compatibility, runtime facade integration and rich reference search remain pending.

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

## Move/egg/learnset coverage

DEX-REF-MOVES generates 920 official move identities with type, PHYSICAL/SPECIAL/STATUS category and declared base power. The upstream -1 power sentinel is preserved for status/variable-power moves; it is not calculated damage. Four ordered egg slots resolve through 571 source tables with explicit `eggMoveSourceId` (including Pikachu → Pichu and evolved species associations). Each form's level moves combine base rows and its form-key rows exactly as the pinned registry does; EVOLVE_MOVE=0 and RELEARN_MOVE=-1 remain source sentinels. The pack has 26,219 rows across 1,500 forms. This is learnability data, not starter-selectable-now claims. Egg ownership/replacement/challenge selection rules remain packet 7. No search/UI or account behavior changes.

## Standard starter selection compatibility

`domain/starter-selection.ts` derives per-form standard starter options from pinned facts plus imported source masks. Eligible caught form bits use DEFAULT_FORM (128) shifted by form index. Starting moves use levels 1–5 only; 0/-1 sentinels and later levels are excluded. Egg slots require a table owned by the selected starter; Pikachu's inherited Pichu reference does not create Pikachu starter egg options. Ordinary second NONE aliases first; duplicate names retain individual slot states. Passive availability uses UNLOCKED independently of ENABLED. Invalid/missing masks or incompatible reference revisions stay unknown. Nonstarters point to associated starter roots rather than becoming independent starters. Active challenge/Fresh Start modification and saved choice preferences are not modeled by an account export. Public starterSelectable/obtainable flags and source ownership constants are generated separately from caught flags. UI integration remains the next packet.

The generated Dex pack is now exported through `reference/index.ts` and consumed by the domain catalog/facade. Dex cards/detail and plain-text typed queries use public facts plus read-only source masks; reference-only species never become imported records. Runtime downloaded packs and expression grammar remain separate work.
