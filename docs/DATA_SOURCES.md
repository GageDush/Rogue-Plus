# Rogue+ data ownership

**Public GitHub holds source code, build recipes, exact upstream revision pins, and default strategy templates. It does not hold private Pokémon save exports or historical account snapshots.**

| Domain | Owner | Source | Runtime |
| --- | --- | --- | --- |
| Game species IDs, names, starter costs | Official PokéRogue | Pinned `reference-sources.lock.json` | Generated build-time JSON, bundled offline |
| Game battle damage | Official PokéRogue | Game source pinned separately | Calculated by the game bridge, not duplicate formulas |
| Assets | Official PokéRogue asset project | Pinned revision | Browser cache; license/source audit required |
| Game balance tables | Official PokéRogue | Pinned source | Legacy `mechanics.v1.json` remains a versioned static reference pending an extractor |
| User's collection, achievements and statistics | User's imported save | In-memory after browser-local decrypt | IndexedDB only |
| Saved builds, notes, goals, custom presets | User | Rogue+ UI | IndexedDB (migration of existing shipped presets is pending) |
| Source-owned starter roster/goal templates | Rogue+ maintainers | `user-data/*.json` legacy | Public sample presets; must not masquerade as user saves |
| API keys/secrets | User/service | Secrets manager or ignored local env | Never bundled or committed |

## Build-time reference generation

1. `reference-sources.lock.json` pins upstream Git SHA.
2. `scripts/generate-game-references.mjs` reads only that immutable commit's species enum and nine generation species tables.
3. Generator rejects inconsistent counts, missing IDs and out-of-range costs; historical parity was verified across 572 starters and all names and costs.
4. `npm run build` within `companion/` executes its `prebuild` generator and uses the generated file from `companion/src/reference/generated/` (ignored by Git).
5. The application uses the generated file locally and offline; it never depends on the remote GitHub API during play.
6. Version upgrades require a reviewed change to the lockfile and passing CI.

**CI needs network access** to fetch the pinned official sources. If upstream is inaccessible, fail the build rather than silently use an unknown fallback.

## Follow-up migrations

- Mechanic constants/candy costs and asset metadata remain version-pinned handwritten snapshots. Replace them with verified upstream extractors in subsequent focused changes.
- The existing strategy preset JSONs are public sample strategies, not your stored user-defined Builds. Separate them during UserContent work.
- When the Play module's game revision changes, check reference compatibility explicitly.

## Artwork transport verification

ART-VERIFY uses the unchanged immutable asset pin and exercises real CORS-compatible JSON/PNG fetching and pixel decoding separately from synthetic failure tests. Image metadata alone is not evidence that artwork rendered. Shared sprite rendering now checks PNG decode/dimensions and exposes a readable ID fallback for missing/failed artwork; failed session-cache entries can retry on later mounts. See project/evidence/ART-VERIFY.md for exact browser coverage and limits. This is not an asset-pin update, a complete licensing audit, or proof of cold-start offline availability.

## Expanded Dex reference contract

`reference/dex-contract.ts` defines a bundled-only public-fact boundary: species/form identities, named reference IDs, base stats/BST, declared ability slots, ordered egg moves, level-move entries, explicit starter associations and per-area coverage/provenance. `ReferenceValue` distinguishes known facts (including null, empty lists and zero) from unavailable facts with a reason. Starter-selectable/obtainable facts and selection coverage are separate from caught/unlocked account masks. Base move power, species base stats and imported IVs remain distinct. The build-pack index rejects duplicate identities and unpinned provenance; it is not a downloaded-pack validator.

The initial contract packet added types/index tests. Packets 3–6 now populate species/forms, roots, abilities/passives and moves/egg slots/learnsets in an ignored build-generated pack; the existing starter roster keeps its original shape. Packet 7 adds compatibility; packet 8 adds the Dex projection and UI. Expression grammar and runtime reference updates remain later work. See project/evidence/DEX-REF-CONTRACT.md.

## Populated species fundamentals

DEX-REF-SPECIES statically reads TypeScript syntax at the unchanged game pin, including nested explicit form constructors. The generated `dex-reference.v1.json` represents all 1,084 non-NONE species IDs and 1,500 form records: official English names, types, generation, six base stats/BST and original starter costs. English names use the game gitlink locale revision `0696f674f631b47f208f5d687b427ed3e7cd81b0`, not a moving locale branch. `dex-coverage.v1.json` records source SHA-256 digests and exact boundaries. Generated outputs remain ignored and rebuildable. No downloaded code executes. Unexpected selected expressions, duplicate IDs/forms, missing names and inconsistent stats fail generation. Existing starter roster consumers stay unchanged. Later completed packets populate roots, abilities, moves and standard selection; exact coverage boundaries remain explicit.

## Evolution and form relationships

DEX-REF-ROOTS populates every species' official `starter` association, direct deduplicated evolution IDs, ordered `evolutionLinks` and `formChangeLinks`. Links preserve source/target form keys and target species IDs; absent restrictions use null. The official empty target key is retained even when the first target form has a gendered name. This is a relationship graph, not an evolution eligibility/condition evaluator. Generation rejects missing/unpriced roots, missing species targets and unknown nonempty form targets. No account ownership or search changes.

## Ability/passive coverage

DEX-REF-ABILITIES resolves 317 officially named ability IDs, ordinary/hidden slots for all 1,500 forms and form-specific passives. Declared NONE is null; the game constructor's second-slot alias is left for selection compatibility. Passive lookup reproduces the pinned registry's form-zero fallback. Official unnamed ABILITY_314/ABILITY_317 enum placeholders are excluded and coverage is partial; referenced unknown names fail generation. These public facts contain no unlocked/enabled ownership. Reference CI installs TypeScript before extraction; application CI now runs extractor tests.

## Move/egg/learnset coverage

DEX-REF-MOVES generates 920 official move identities with type, PHYSICAL/SPECIAL/STATUS category and declared base power. The upstream -1 power sentinel is preserved for status/variable-power moves; it is not calculated damage. Four ordered egg slots resolve through 571 source tables with explicit `eggMoveSourceId` (including Pikachu → Pichu and evolved species associations). Each form's level moves combine base rows and its form-key rows exactly as the pinned registry does; EVOLVE_MOVE=0 and RELEARN_MOVE=-1 remain source sentinels. The pack has 26,219 rows across 1,500 forms. This is learnability data, not starter-selectable-now claims. Packet 7 supplies standard selected-starter ownership rules; active challenges remain outside account-only compatibility. Packet 8 exposes these facts without changing account records.

## Standard starter selection compatibility

`domain/starter-selection.ts` derives per-form standard starter options from pinned facts plus imported source masks. Eligible caught form bits use DEFAULT_FORM (128) shifted by form index. Starting moves use levels 1–5 only; 0/-1 sentinels and later levels are excluded. Egg slots require a table owned by the selected starter; Pikachu's inherited Pichu reference does not create Pikachu starter egg options. Ordinary second NONE aliases first; duplicate names retain individual slot states. Passive availability uses UNLOCKED independently of ENABLED. Invalid/missing masks or incompatible reference revisions stay unknown. Nonstarters point to associated starter roots rather than becoming independent starters. Active challenge/Fresh Start modification and saved choice preferences are not modeled by an account export. Public starterSelectable/obtainable flags and source ownership constants are generated separately from caught flags. The domain catalog and Dex UI now expose these states, described below.

## Reference facade and UI integration

Packet 8, explicitly authorized including UI on 2026-10-09, exports the generated pinned pack/index and adds a read-only `domain/dex-catalog.ts` projection to the existing facade. All Pokémon covers 1,084 public species plus any imported IDs outside reference coverage; Collected requires an imported unlocked starter. Reference-only rows never become account records, history, candy recommendations or strategy readiness. Public coverage/ownership remain separate. No account/storage migration or source-pin change.

Cards show base-form types/generation and explain related-name or starter-option matches. Detail offers reference forms, six base stats/BST separately from imported IVs, associated-starter navigation and named standard moves/abilities/passives with available/locked/unknown states. Duplicate ability names retain per-slot states; passive enabled is separate. Missing ownership and incompatible revisions remain unknown. Nonstarters expose public facts and associations rather than independent starter options.

The same typed query supports type/generation groups (OR within each, AND across controls), generation/BST/base-Speed sorts, and plain text names, related evolutions, base types, collection gaps and named starter options. Collected matches only available options and type filters use caught eligible forms; All includes possible locked/unknown starter options and any reference form for type filtering. Numeric stat sorting uses the base form; unknown values sort last. This is not expression grammar or evolution eligibility. Panels retain Apply/Cancel drafts and detail round trips preserve query/layout/reveal/scroll/card focus, including associated-starter navigation.

The full bundled reference increases the production JavaScript bundle to approximately 2.70 MB / 327 kB gzip. Runtime remains bundled-only; code splitting/update-pack architecture is outside this packet. Physical Safari/iPhone and complete form artwork/offline release verification remain separate. See `project/evidence/DEX-REF-INTEGRATE.md` for actual local and browser acceptance evidence.
