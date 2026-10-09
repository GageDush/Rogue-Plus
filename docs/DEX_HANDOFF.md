# Rogue+ Dex implementation handoff

Prepared 2026-10-09. This is a scoped handoff, not a second status ledger. Read AGENTS.md, DECISIONS.md and project/tasks.json first. U4A and all eight authorized reference packets, including standard selection and facade/UI integration, are implemented on the draft branch. Plain-text reference/option matching is implemented; expression grammar, candy reservation and runtime reference updates remain separate pending tasks.

## Working source and delivery

- Repository: GageDush/Rogue-Plus. Continue design/profile-candy-overview, draft PR #8: https://github.com/GageDush/Rogue-Plus/pull/8 . Check actual head before editing.
- Published reference integration head: 3f64539ae165e03800dd8ec8739d6a99b15b1822; selection head: d7a1bd30b32e585b178118b3ad42a58b7b9c4e0a. Later documentation closure may produce a later head; reconcile the live PR branch before editing.
- Preview: https://design-profile-candy-overview-rogue-plus.gagedush-bff.workers.dev/ . Cloudflare build b3323a94-9b0a-412b-afca-710a8bbfa91f successfully deployed 8c6f43fc9bdd1ec7a2b685f18cc6d7e85373166a on 2026-10-09 at 19:00:39 UTC, including reference/UI integration and the S1/O0 fixes. All three workflows passed at this application head. Preview delivery is separate from production release.
- main baseline recorded by the original handoff: 1fe923af979466cfa4d785127a69d9e3ae6edf9d. No production merge/deploy in this work.
- Local application/browser/tracking checks and sanitized evidence are in project/evidence/DEX-REF-INTEGRATE.md. Final remote CI is checked on PR #8 separately. The user reported all five requested checks passing in the installed iPhone app and standard Safari on 2026-10-09; see project/evidence/U1-SAFE.md for scope. Larger-text behavior was not covered. The release audit's strict nested backup validation and offline startup/update gaps are addressed by S1/O0; see their evidence for local verification and remaining native offline/update signoff. Production release remains separate.
- Current workspace is a real Git checkout on design/profile-candy-overview with origin and history. Local originals are retained on checkpoint/reference-packets-3-6 and checkpoint/reference-packets-7-8. Connected GitHub publication produced equivalent trees with different commit metadata/SHAs; the active local branch is synced to the remote history. Shell Git lacks write credentials, so any authorized publication uses explicit changed paths, expected-head checks and exact tree verification through the connector.

## Accepted Dex direction

User messages 2026-10-09 establish these product requirements; implementation/release authorization remains separate in the task ledger.

- Default Grid, optional List. Three columns on mobile; desktop scales with available content width, maximum eight. Long names remain readable, artwork authentic, both themes supported.
- One Dex with Collected / All Pokémon scope, default Collected. Collected matches only currently starter-selectable moves and unlocked abilities/passives. All broadens to possible reference unlocks, visibly marked locked; it does not mean all options are unlocked.
- Filters, Sorting and Advanced toggle. Search bar has an advanced-search guide explaining inclusion, exclusion and numeric ranges. Applied conditions must be visible and removable.
- Preserve search, filters and scroll through detail and More dismissal. Phone filters use bounded bottom sheet; desktop panel sits near trigger, including short windows. Keep keyboard, focus and camera/home-indicator clearance.
- Reserve candy for upgrades toggle. Reserve missing eligible passive and remaining starter reductions before calculating eggs affordable; show both raw and reserved budgets. No candy spending or game-state mutation.
- Reliable official-source candy pricing, eligibility, hatch discounts and exceptions. Starter discounts and egg-price discounts are separate.

## Proposed interaction grammar — finalize in its packet

Examples: type:grass, -type:poison, cost:1-3; ability:"Skill Link"; move:"Bitter Blade"; speed:>=100; iv31:4-6. Proposal: comma means AND, | means OR, minus excludes, quotes preserve phrases, field ranges are inclusive. Across filter groups use AND; within multiselect group use OR. Define precedence/parentheses before parser implementation; do not silently guess or ignore invalid syntax. Show human-readable explanation and matching reason. Filters and expressions must share one typed query model. Distinguish base Speed, IV Speed and move base power.

Core filter candidates: generation/type, shiny tier, passive status/affordability, reduction count/affordability, egg moves 0–4, perfect IVs 0–6, hidden ability, candy opportunities, Classic completion and local favorites. Advanced candidates: named moves/abilities, forms/natures, individual IVs, cost/stat ranges, categories, encounter biome and counters. These menus are proposals, not individually approved implementation claims.

Sort candidates: Dex number, name, current cost, luck, candy, perfect IVs, egg-move count, egg affordability; advanced BST/individual stats/counters. Explicit direction, deterministic species-ID ties. Define highest shiny tier versus any owned matching tier visibly.

## Data ownership and coverage

| Owner | Values and work |
| --- | --- |
| import | Normalize candy, friendship progress, IVs, reduction count, Classic wins and seen/caught/hatched counts; preserve unknown vs zero |
| domain decoding | Interpret shiny, ability/passive, nature and egg-move masks; fuller form/gender support needs verified masks |
| reference | Bundle pinned names, types, generations, stats/BST, base costs, abilities/passives, named egg moves, learnsets, evolution/forms, biome data and candy rules |
| domain calculations | Current cost, pricing/eligibility, affordability/shortfall, hatch discounts, IV/egg/nature counts, collection gaps and search matching |
| storage/UserContent | Local favorites/tags/searches and display/reserve preferences, independent from imported account facts |
| history | Compare dated imports; reference updates never fabricate changed account facts |

Actual normalized fields: companion/src/domain/types.ts and import/normalize.ts. Current reference: reference-sources.lock.json, companion/src/reference/mechanics.v1.json and source-manifest.v1.json. Game pin e734a202a912cc969409c84111b5ab6a15fc7774; assets pin 056a1f408f26a3be4fef243f7462cb43608c7928. Do not bump incidentally.

Before U4A, Dex had name/gap search, six quick filters and bounded list reveal. U4A replaces that presentation/query foundation with Grid/List, explicit Collected/All scope, imported-field conditions/ranges and sorting. Completed reference integration expands All to public species and adds plain-text related-name/option matching; expression grammar remains unimplemented. Current domain/candy-actions.ts already prioritizes affordable passives/reductions/eggs using bundled hatch discount tables, but full eligibility/exception handling and reserve are not verified. Use this code as evidence, not as a complete pricing specification.

Starter-selectable moves require verified starter selection rules, applicable form/learnset and unlocked egg slots. A level-up/evolution move is not necessarily selectable now. Map ability slots to species/form names; unlocked passive differs from enabled. Forms caught, starter-selectable and obtainable later are distinct. Friendship progress is not universal happiness percentage. Pseudo-legendary/trio groupings require maintained definitions, not guessed flags.

## Reference update direction — later architecture packet

Accepted direction: bundled fallback plus validated, versioned reference packs checked on launch/resume, with atomic activation, cached offline operation and rollback. This replaces bundled-only as a future target; runtime is still bundled-only today.

Detection must establish the released game revision; do not assume development branch commits or tags equal live release. Scheduled generation compares official revisions, produces change report, validates schema/IDs/prices/coverage/slot semantics, then initially uses reviewed publication. Automatic publication of supported balance-only changes is a later candidate. Never download executable game/plugin scripts. Unsupported formula/save-semantic changes require app/importer changes.

Current rules can recalculate prices; dated save still owns candy/unlocks. Move replacement can remap unlocked slot only when verified upstream ownership semantics stay compatible. Current/imported-save rules selector is proposed only; it needs historical coverage and compatibility checks. Manifest integrity/trust design and release detection remain unresolved implementation details.

## Community research to reuse

- Sandstorm SearchDex: https://sandstormer.github.io/PokeRogue-Dex/ . Tested Garchomp returning forms and Related to: Gible. Borrow reference search/evolution association; avoid phone-wide dense tables.
- Admiral Billy app: https://github.com/Admiral-Billy/Pokerogue-App . Game wrapper with linked tools, including SearchDex; not an independent Dex dataset.
- Calendar: https://editor.p5js.org/RedstonewolfX/full/jF3kUNbY8 . Legendary gacha calendar also supports Pokérus per community wiki. Optional later tool, not current focus.
- Offline RogueDex 6.04 workbook: rich collection/daily/form/ribbon tracking; Google Sheets scripts/upload setup and Excel cached REF errors limit portability. Do not commit the workbook or private screenshots.
- GUI screenshots: Gen/Type/Caught/Unlocks/Misc/Sort; useful unlockability labels and anchored menus. Avoid copying tiny controls/cycling states directly.
- Sources: https://wiki.pokerogue.net/community:tools ; https://wiki.pokerogue.net/starters:starters ; official balance API https://pagefaultgames.github.io/pokerogue/main/modules/src_data_balance_starters.html . Live docs inform research; pinned source establishes implementation rules.

## Next session

Use rogue-plus-navigate; reconcile actual head and read this handoff once. All eight authorized packets are verified in project/tasks.json; no task is active. DEX-SEARCH expression grammar/guide, DEX-CANDY pricing/reserve and DEX-UPDATES runtime architecture remain separately scoped tasks with approval/dependencies in the ledger. Already implemented plain-text option matching and type/generation controls must be preserved when later grammar extends the shared typed model. Do not restart U4A or reference extraction, and do not implement downstream work merely because dependencies are complete.

Before close: meaningful synthetic tests, UI 320/390 and desktop/window-height cases, existing baseline/module-boundary checks, docs/evidence update and tracking regeneration. No saves/backups/private player facts committed. No save re-encryption, edited game-save export, upload API or PokéRogue writeback. Merge/deployment remain separately authorized.

## U4A implementation continuation

Authorized by the user on 2026-10-09. Query and panel behavior are documented in DESIGN and ARCHITECTURE; task status and acceptance evidence remain solely in project/tasks.json. Names/gaps are plain text, not the proposed advanced grammar. All scope is limited to starter records in the snapshot and states its dependency on expanded reference coverage. No reference pins, ownership decoding, candy formulas, storage schemas or account facts were changed. Continue DEX-REF only after its separate implementation authorization; do not begin downstream work merely because U4A is complete.

## Expanded reference continuation

The user authorized eight sequential packets on 2026-10-09: artwork transport verification, reference contract, species fundamentals, evolution/roots, abilities/passives, moves/learnsets, starter-selection rules, and integration. Their individual states and evidence live only in project/tasks.json. Downstream expression grammar, candy reservation and runtime reference-pack updates remain outside these packets. ART-VERIFY corrects PNG readiness/failure handling without changing artwork pins or imported visual ownership.

The expanded reference contract is implemented in `reference/dex-contract.ts`: known/null/empty values remain distinct from unavailable coverage, and public facts carry provenance without ownership. Species/forms, relationships, named abilities/passives and move/egg/learnset facts are now generated through this contract; selection compatibility and domain/UI integration are now implemented. Its interface is an implementation choice inside the authorized contract packet, not approval of the proposed advanced-search grammar.

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
