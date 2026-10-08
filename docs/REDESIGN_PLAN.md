# Rogue+ proposed redesign plan

Date: 2026-10-08. Approval status: awaiting user direction approval. Documentation only; all implementation packets below are unstarted.

## Recommended direction

Warm, bright, premium Pokémon companion with neutral off-white space, dark legible ink, restrained matte orange actions and authentic pinned artwork. Preserve hybrid task density: concise Home/Trainer/Goals and expressive, readable Dex/rosters/detail. Do not carry over the dark default, copy game-menu chrome or convert every fact into a card/button.

Home should answer account progress, what changed and what to do next. It should have no featured Pokémon hero. A preset strategy may appear with honest sample/preset labeling, subordinate to useful next actions.

Start with the package's proposed palette/type values for review; record actual adoption explicitly. Exact fonts and dimensions are not already approved. Secondary dark mode can wait.

## Comparison and judgment

| Area | Previous direction | Current code/live evidence | v1.1 package | Recommendation / packet |
|---|---|---|---|---|
| Canvas/brand | Dark hybrid; matte orange/white | Dark tokens and shell; typeset brand | Approved warm light; real mark | Adopt light visual character; retain #FF6A35; authentic icon in dark tile U1/U2 |
| Typography | Precise dense data | Inter/system; frequent 7–11px metadata | Humanist body/subtle rounded headings; proposed fonts | Review Rubik + Source Sans 3; readable scale and tabular metrics U1 |
| Navigation | Home/Dex/Build/Run/Goals accepted | Canonical registry, five mobile tabs, secondary sidebar/More | Earlier Teams/Hunt examples plus selected-state rules | Preserve current destinations; filled/tinted active state U2 |
| Home | Compact overview | Correct counters/changes; false current-run preset label | Trainer-oriented useful overview; no art hero | Keep calculations; improve hierarchy/provenance and label preset U3 |
| Dex/detail | Richer imagery | Search/filter/detail works; dense statuses | Comfortable rows, contextual accents, progressive detail | Preserve existing filters/results; rebalance readable rows and fields U4 |
| Build | Editable Inventory/Sandbox target | Read-only strategies, account checks and in-run notes | Purposeful roster/readiness compositions | Redesign preset viewer first; editor is a later feature U5/B0 |
| Goals | Fixed rankings now; intelligent later | Derived score and reason, 80-row cap | Explain actions, subordinate score | Preserve ordering; identify derived score; improve scan/reason U6 |
| Fusion | Separate advanced module target | Recipes and inheritance uncertainty | Clear participants and limits | Keep caveats; restyle existing recipe UI U7 |
| Trainer/History | Accurate stats/change review | Counts, progress and change records | Numeric hierarchy, baseline/source honesty | Normalize stat/progress/change patterns U7 |
| Run/Modules | Future core/optional capabilities | Planned landing screens; external Play link | No invented features | Keep explicit readiness; no fake session widgets/toggles U7 |
| Settings | Local recovery/privacy | Working operations; transient errors | Clear source, persistent errors | Restyle controls; recovery behavior in explicit safety packet S0/S1/U8 |
| Offline/storage | Local-first and offline target | v2 combined state and partial SW caching | Preserve functional/data truth | Keep UI-only packets schema-neutral; separate O0/V0 |

Strongly recommended: brighter approved character, hierarchy before microtext, authentic mark, semantic tokens, clear provenance and purpose-built Pokémon patterns.
Recommended with changes: typography/palette defaults, selectively filled navigation icons, progressive detail only when existing facts/actions remain reachable.
Optional: secondary dark mode and additional motion.
Defer: new filters, sort modes, persisted browse context, editor controls, profiles, custom goals, real runs and module lifecycle.
Not recommended: a full rewrite, a generic all-purpose card, blanket recoloring, invented types/art, new URL routing disguised as styling, or a generalized plugin backend.

## Component specification and ownership

Keep primitives in ui/components, shared semantic tokens in ui/styles; feature compositions stay within their feature folders. App owns orchestration. Avoid features importing each other.

| Shared family | Required anatomy and states | Responsive / verification contract |
|---|---|---|
| Button/IconButton | Verb label, optional icon; primary/secondary/tertiary/destructive; focus/pressed/disabled/busy | About 44px frequent targets; dark ink on brand orange; stable busy dimensions; labels for clear/back/icon actions |
| Text/Input/FilterChip | Persistent accessible context, value, active state and result count | Readable phone input; preserve one-filter semantics; no invented advanced control |
| AppNavigation/Brand | Existing registry, label, active state, authentic logo | Five bottom tabs with safe area; intentional light sidebar; detail highlights Dex; same destinations |
| Metric/Progress | Value, unit/denominator, label, relevant source context | Numbers first; slim bars only for positive known total; unknown never becomes zero |
| Status/Provenance | Imported/sample/preset/derived/planned/unverified labels | Text plus semantic color; avoid competing badge clusters; sample label persists |
| PokemonIdentity/Row | Existing resolver, name, essential progression, limited statuses | Preserve sprite ratio and pixel rendering; comfortable wrapping; no speculative type/form badge |
| RosterMember | Species, role, preset target, account evidence and in-run caveat | Phone readable rows/cards; desktop roster then aligned notes; never imply selected active run |
| DataLine/ChangeRow | Grouped fields, aligned values; baseline or before/after context | Readable stacks on phone and columns on desktop; long source names wrap |
| Empty/Error/Notification | Specific cause, available next action; brief success, persistent actionable error | Preserve real state semantics; storage-load failure blocks autosave; no success Check icon for errors |
| Surface/Section | Clear topic; open default, card only for bounded entity/action | Tokenized borders/radii/shadows; no universal nested-card shell |

Only define dialog/sheet patterns when a scoped interaction needs one; there is no current reusable modal system to preserve. Native confirmations can remain until an approved interaction packet replaces them.

## Small implementation packets

Each row is a reviewable PR or smaller change. No row implies authorization. Design approval enables agreed packets, not automatic merging or production deployment.

| ID / priority | Scope / class | Dependencies | Independently testable definition of done |
|---|---|---|---|
| S0 / first | Failed-load recovery guard; interaction/data safety | Direction/scope approval; no schema migration | Failed/future/corrupt load leaves stored bytes unchanged and exposes persistent recovery. No autosave until successful load or deliberate valid recovery; synthetic effect-level regression |
| S1 / before release | Strict backup validation; data safety | S0; current schemas | Reject malformed nested snapshots and invalid/future versions before setState; preserve valid v1/legacy round trips; invalid restore cannot overwrite current state |
| I0 / early | Dependency lock/reproducible CI; infrastructure | Known successful baseline | Commit reviewed npm lock; clean npm ci, existing typecheck/test/build pass without unrelated upgrades |
| U1 / first visual | Semantic light tokens, typography, basic buttons | S0 baseline; approved token/font selection | Map legacy variable bridge deliberately; no global theme flash; brand orange unchanged; representative 320/390/1440 states readable; no import/storage/domain diff |
| U2 | Shell/nav/authentic logo; presentation | U1; approved supplied icon available | Existing primary/secondary paths and active detail state intact; safe-area tabs do not overlap; real mark, no CSS filters; desktop/mobile screenshots |
| U3 | Home hierarchy and provenance; presentation + scoped error/demo state | U1/U2 | Four existing KPIs/change data preserved; no hero; fixed team visibly preset; persistent demo label; next actions have real destinations; baseline remains honest |
| U4a | Dex rows/search/filter treatment; presentation | U1/U2 | Same six filter choices, query matching and 90-item reveal; long names/statuses wrap; empty/search/partial-data captures; existing query survives detail return |
| U4b | Pokémon detail; presentation | U4a primitives | Every existing fact/action retained; grouped readable IV/progression fields; related strategies labeled bundled; asset fallback intact |
| U5 | Preset Build library; presentation | U1/U4b identity patterns | Six-member roster readable; cost/cap, luck, target checks and in-run uncertainty unchanged; no narrow account-note column; editor remains explicitly planned |
| U6 | Goals; presentation | U1/U4a row patterns | Same order, score weights and 80-item bound; recommendation visible; score labeled derived; missing/affordable source context preserved |
| U7a | Trainer and History; presentation | U1 metrics/change rows | Numeric totals/deltas/source unchanged; bars use real bounds; first-import baseline and long records readable |
| U7b | Fusion, More, Run, Modules; presentation | U2/U5 | Existing links/recipes/caveats retained; planned features unmistakable; no fake controls; separate Guest origin stated |
| U8 | Settings polish and error recovery UX; presentation/interaction | S0/S1; U1 controls | Import/export/restore/clear are reachable; disabled states and consequences explicit; actionable errors persist; synthetic backup smoke pass |
| O0 | PWA cache/update reliability; infrastructure | Stable UI asset set | Precache required shell/bundles/fonts; coherent update strategy; warmed-art offline routes/export/restore tested; old/new cache upgrade and rollback evidence |
| R0 / release | Privacy, real restore, responsive signoff and rollout gate | All selected packets + O0 | Synthetic suite/build green; content/history review; user backup restored locally in isolated device/profile; iPhone/desktop signoff; approved release/rollback, then tag/deploy |
| V0 / later | Profiles/UserContent/Run contracts then storage v3 | Independently approved feature scope; recovery/real backup gates | Separate ownership, reversible migration and rollback; new import/reset cannot erase Builds |
| B0 / later | Build schema/editor/legality/sharing | V0; expanded verified form/move/rules reference | Six editable slots; Inventory/Sandbox same schema; illegal combinations rejected; versioned JSON/code contain no account identity |
| G0 / later | Build-aware Goals | B0 and profile ownership | Explain deficits from active profile/Build; deterministic recommendations; no imported-save mutation |
| P0 / later | Run imports and Play adapter | V0; explicit game/reference compatibility | Separate system/run/Guest/official ownership; pinned adapter tests; no hidden official sync |
| M0 / later | Optional advanced modules | Narrow stable contracts; verified mechanics | Each module independently tested, scoped dependencies/read capabilities; real min/max damage not inferred from one sample |

S0/S1 are release safety work, not excuses to bundle storage v3 into the redesign. U4 and U7 are deliberately split so screen changes can be assessed separately. I0 can proceed independently after approval.

## Existing milestone reconciliation

| Handoff milestone | Audit status | Missing / prerequisite | Completion boundary / order |
|---|---|---|---|
| A Foundation | Screen extraction and checks present, unmerged | Recovery guard, real restore, release checks | Verified preserved behavior; foundation/hybrid stack retained; S0/S1/R0 |
| B Hybrid design | Shell/navigation/token scaffolding present | New visual character and consistent screen patterns | U1-U8 plus matching-state screenshots |
| C Module contracts | Canonical nav and import guard partial | Companion lifecycle/capabilities absent | Narrow typed contracts when first real module needs them; avoid premature framework |
| D Privacy/source hygiene | Filename scanner and cleaned-ref claims | Content/history audit, dependency lock, release mirror | I0/R0; mirror sanitized validated release only |
| E Storage v3 | Not implemented | Independent ownership/reversible migration | V0 after real restore and separate feature approval |
| F Build editor | Read-only presets only | Full legality reference, Build schema, storage/sharing | B0 after V0; keep viewer redesign independent |
| G Intelligent Goals | Fixed priorities exist | Build-aware explanation and targets | G0 after B0 |
| H Offline/alpha release | PWA scaffolding exists | Full cache/update/recovery/mobile proof | O0/R0; release current capabilities without waiting for every later feature |
| I Run/Play | Planned companion screen; separate experiment | Session schema and versioned bridge | P0 after V0; isolated validation |
| J Advanced tools | Recipes and damage experiment only | Stable contracts and verified mechanics | M0, separate modules; no blanket roadmap completion claim |

## Critical contradictions, limits and decisions

1. Warm light versus dark default: recommend v1.1 visual authority; retain density/brand. The user approves this audit's direction before code work.
2. Guide old navigation versus hybrid: use verified canonical registry; do not resurrect Teams/Hunt or remove Run just because the guide describes an older source.
3. Approved white logo versus light canvas: use authentic mark in a small dark tile. No new logo variant is needed to start.
4. Package offers no new rendered app mockup. Its PDF is a process illustration. Exact typography/token adoption should receive one representative Home/Dex review, not an unreviewed wholesale rewrite.
5. Storage startup risk and incomplete backup validation block safe rollout; they do not block documentation or visual specification.
6. Actual user backup restore, interactive mobile signoff, offline updates, full asset variants, history hygiene and exact deploy-SHA parity remain unverified. User-supplied phone images have now been reviewed.
7. Companion and Play pin different game commits; integrating them requires a compatibility contract, not silent unification.

No unanswered product question blocks the proposed existing-feature redesign. The remaining required decision is approval of the warm/light direction and first packet scope. Recommend starting S0, then U1/U2 with S1 and I0 in separate changes. Keep deeper feature work on hold.

## Future task template

Task: [packet ID and exact target].
Evidence: CURRENT_STATE baseline SHA plus relevant current diff/screenshots.
Class: presentation / interaction / feature / data.
Preserve: explicit working actions and contracts.
Deliver: small implementation diff, relevant checks, matched-state mobile/desktop screenshots, updated status.
Stop: before merge/production unless separately authorized; do not absorb adjacent unfinished features.

## Mobile-first refinement from supplied phone views

Mobile-first is a confirmed requirement. Design each packet at phone width first, then adapt to larger screens. Preserve the existing five-tab task structure, useful stat grids and party overview.

- U3: put actionable recommendations ahead of the bundled preset; correct Current run build and ALL TIERS labels without changing calculations.
- U4a/U6: improve legible name, reason and status hierarchy within the existing list behavior. Sticky controls, disclosure, grouping or new list navigation require an explicitly scoped interaction change; they are proposals, not existing functionality.
- U5: retain the six-member roster overview, make role/readiness notes readable and remove unnecessary repetition. Optional disclosures need separate interaction acceptance.
- U7a: retain numeric progress and meaningful bars.
- U7b: reduce Fusion participant-panel height, preserve first/second semantics and source-owned status, and verify a discoverable scrolling tab strip.

Each selected packet needs matched phone states at 320px and 390px, long-name/wrapping checks and a real phone interaction review before release. The supplied full-page images establish current visual structure; they do not prove viewport fit, touch behavior or safe-area correctness. No implementation has started.
