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

Blocked startup exposes a persistent recovery screen with retry and explicitly confirmed local-account reset. Ordinary import/demo/restore controls remain inaccessible while blocked. Retry/reload do not write rejected data. A failed IndexedDB reset cannot be reported as a successful localStorage-only reset. Successful deliberate reset clears account keys and permits a fresh account; cached artwork is unaffected. S0 added no automatic quarantine, schema migration, raw recovery export or PokéRogue save write-back. See project/evidence/S0.md for exact tests and release limitations.

### Nested state and backup validation (S1)

Storage validation checks every current/historical snapshot, Pokémon record, account metric/voucher/stat, change row and optional source/visual record before a state can be restored, migrated or saved. Versions are numeric and supported, metadata timestamps are validated, and malformed numeric/boolean/array fields or duplicate Pokémon IDs reject the whole payload. Validation does not coerce or repair data. Older complete records may omit source/visual details; absence remains unknown. Legacy raw backups and schema-v1 backup envelopes containing state-v2 remain supported without changing storage keys or versions. Rejected nested startup data retains S0's paused-saving recovery path; rejected restores do not reach setState. See project/evidence/S1.md.

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
- Mobile uses five primary destinations: Home / Dex / Build / Run / Goals, with secondary navigation in a slim More pop-out triggered from the header. App owns the open state; the shared MorePopover leaves the current feature mounted and dismisses on repeated toggle, outside pointer, Escape or focus leaving. Legacy MorePage remains an internal compatibility screen.
- A "Planned" UI must be clearly labeled; it may not claim a non-existent editor, module or data source is functional.


## Implemented appearance boundary (U1)

UI appearance is independent of combined-v2 account persistence. `ui/theme.ts` resolves System/Light/Dark and writes only `rogue-plus-appearance-v1` in localStorage; account imports/backups/reset continue using existing repositories unchanged. `index.html` applies the initial palette before React, then the UI controller handles media-query and cross-tab preference updates. React observes the controller with useSyncExternalStore. Semantic CSS variables serve every route including recovery. Private account loading/autosave phases remain unchanged.

## Candy planning ownership

`domain/candy-actions.ts` supplies pure read-only affordable actions through the domain facade. It owns no purchase or persistence mechanism. `reference/mechanics.v1.json` includes hatch-based egg prices from the unchanged pinned source and provenance. Home owns the local sort/expansion state; legacy Goals scoring remains independent. Shared `ui/components/AppWidgets.tsx` owns accessible completion bars and unavailable-denominator presentation. UI formatters translate historical shiny shorthand without rewriting stored/imported facts.

Desktop navigation visibility uses viewport-height media queries (720px threshold). MorePopover receives the actual trigger element, measures its bounds on open/resize, and positions beside it on desktop. Mobile retains safe-area CSS positioning. A hidden trigger on resize dismisses the panel.

## Dex query ownership (U4A)

`domain/dex-query.ts` owns a pure typed imported-field query, numeric ranges, deterministic sorting and explicit scope. It does not parse expressions, fetch reference packs, calculate candy prices or persist account changes. Missing numeric facts fail range conditions and sort last; blank progress descriptions do not imply missing progress. `App.tsx` owns query/layout/reveal state and the detail-return scroll/focus checkpoint; `features/dex/DexPage.tsx` owns presentation and disposable panel drafts. CSS is scoped under the Dex browser so other roster consumers retain their layouts. UI preferences are session-local and do not enter account snapshots or backups. Future search syntax must extend this shared model rather than introduce an independent filter engine.

## Shared artwork readiness

`PokemonSprite` resolves pinned atlas metadata through the existing resolver, then `ui/artwork.ts` deduplicates browser image decoding and checks actual PNG dimensions before displaying the CSS frame. JSON and PNG requests are bounded at 15 seconds. Rejected requests leave the accessible ID fallback and are evicted from session caches so later mounts can retry; this does not add an automatic retry loop or rewrite account visuals. Frame bounds are validated before cropping. Cancellation prevents a superseded request from replacing the current sprite. `data-asset-revision` carries the pin; atlas and actual/fallback shiny tiers have separate attributes.

## Expanded Dex public facts

`reference/dex-contract.ts` owns typed bundled reference values, immutable pack interfaces, provenance and bounded coverage descriptions. Its index is account-independent and has no I/O. Known absence (`null`/empty lists) and unknown coverage are distinct; facts carry no imported ownership or local preferences. Reference API exports are available through `reference/index.ts`, while existing STARTER_ROOTS consumers retain their original shape. Species/form/relationship/ability/move facts are now generated in a separate ignored pack. Selection compatibility and facade/UI integration are implemented below; expression grammar remains a separate packet.

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
