# Rogue+ Dex implementation handoff

Prepared 2026-10-09. This is a scoped handoff, not a second status ledger. Read AGENTS.md, DECISIONS.md and project/tasks.json first. New Dex work below is not implemented.

## Working source and delivery

- Repository: GageDush/Rogue-Plus. Continue design/profile-candy-overview, draft PR #8: https://github.com/GageDush/Rogue-Plus/pull/8 . Check actual head before editing.
- Pre-handoff documentation head: 126182cebb84e3955b5fb5ea5a31c96060881b26. Implementation/test head: 0c77db9a979d7b7243255664556e9e05596fbff3. This documentation packet produces a later head; do not treat this snapshot as current forever.
- Preview: https://design-profile-candy-overview-rogue-plus.gagedush-bff.workers.dev/ . Last recorded application preview head: 8efd69313c5d96835e434cd8b123e9c0e4ecacff; later application-test changes did not change UI bytes. No byte-parity claim for later heads.
- main baseline: 1fe923af979466cfa4d785127a69d9e3ae6edf9d. No production merge/deploy by this handoff.
- Baseline/UI/tracking workflows passed on implementation/test head; see project/evidence/U1-NAVFIT.md. Physical safe-area gate remains pending despite successful user keyboard testing.
- Current workspace is a materialized source with a seeded Git index, no HEAD/remotes/history. Its whole-tree status is not a publishable diff. Use real checkout or connector with explicit changed paths and expected-head check.

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

Current Dex remains name/gap search, six quick filters and bounded list reveal, without the proposed Grid, sorting or richer reference search. Current domain/candy-actions.ts already prioritizes affordable passives/reductions/eggs using bundled hatch discount tables, but full eligibility/exception handling and reserve are not verified. Use this code as evidence, not as a complete pricing specification.

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

Use rogue-plus-navigate; reconcile actual head and read this handoff once. First packet U4A: Grid/List, scope and filter/sort access plus supported imported-field query foundation. No fake type/move filters before reference coverage. U4A replaces old presentation-only preservation criteria by explicit accepted requirements; other feature owners must be regression checked.

Then DEX-REF (reference coverage), DEX-SEARCH (grammar/available-vs-possible search), DEX-CANDY (pricing/reserve), DEX-UPDATES (reference update architecture). Task dependencies and pending approvals live only in project/tasks.json. Do not implement all five at once.

Before close: meaningful synthetic tests, UI 320/390 and desktop/window-height cases, existing baseline/module-boundary checks, docs/evidence update and tracking regeneration. No saves/backups/private player facts committed. No save re-encryption, edited game-save export, upload API or PokéRogue writeback. Merge/deployment remain separately authorized.
