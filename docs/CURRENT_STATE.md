# Rogue+ current state

This is dated audit evidence. Ongoing task progress and delivery are generated in [STATUS.md](STATUS.md) from project/tasks.json. Scope/decision corrections are recorded in [DECISIONS.md](DECISIONS.md); this historical snapshot does not grant redesign authorization.

Audit date: 2026-10-08. Status: audit and plan complete; redesign not started. This is a dated source/interaction snapshot, not a claim every deployed byte matches a Git commit. Read AGENTS.md for scope and authority and REDESIGN_PLAN.md for proposed work.

## Verified repository and branch stack

Repository: https://github.com/GageDush/Rogue-Plus . Public; default branch main.

| Branch | Verified head | Purpose / PR |
|---|---|---|
| main | 1fe923af979466cfa4d785127a69d9e3ae6edf9d | Production baseline described by handoff and STATUS |
| alpha/companion-foundation | ccd258e3bf1b7606c7f04cb38cf1dea560ff94ea | Draft #2 into main; extracted screens and safeguards |
| design/hybrid-shell-v1 | 1a823e422fc3c41439c3ba66d66ef6eec1b52cc3 | Draft #3 into alpha/companion-foundation; shell/nav/tokens |
| alpha/play-integration | 6f4992b5532bcf5074f9bd9e9728fbabb0e4ec53 | Draft #1 into main; independent game experiment |
| refactor/source-driven-references | 8aa3ba6c959ee93e33650ff9f3248f2ef81539b5 | Earlier reference work; no detailed review needed for redesign |

All five heads and three open/draft PR relationships matched the supplied handoff. These are the pre-audit implementation heads; the documentation review branch is additive.

Preserve the stack main -> foundation -> hybrid. Base redesign packets on a verified hybrid descendant; do not rebuild from main or merge the Play branch into it.

Production: https://rogue-plus.gagedush-bff.workers.dev/
Hybrid preview: https://design-hybrid-shell-v1-rogue-plus.gagedush-bff.workers.dev/
Experimental Play: https://alpha-play-integration-rogue-plus.gagedush-bff.workers.dev/play/

Production and hybrid origins were opened in this audit. Production entry showed legacy Teams/Hunt/More navigation. Hybrid showed the canonical navigation and expected extracted-screen UI. Exact deployment SHA parity was not independently proven by a deployment manifest. Production private account data was not imported or inspected.

## Dependencies and hosting

Source-observed companion/package.json on hybrid:
- Runtime: React/react-dom ^19.0.0, crypto-js ^4.2.0, lucide-react ^0.469.0.
- Development: Vite ^6.0.0, TypeScript ^5.7.0, Vitest ^3.2.4, @vitejs/plugin-react ^4.3.0, Tailwind ^3.4.0, PostCSS ^8.4.0, Autoprefixer ^10.4.0 and type packages.
- Optional Linux Rollup binary ^4.0.0.
- These are declared ranges, not verified installed versions. No npm/yarn/pnpm dependency lockfile is committed in the inspected tree.
- main has no Vitest/test/typecheck scripts; foundation/hybrid add them.
- CI installs with npm install; Node 24. Browser runner imports Playwright and CI installs it separately.

React SPA with Vite base './'. Cloudflare Workers serves companion/dist through wrangler.jsonc assets with SPA fallback; hybrid has no application backend or Worker business logic. Account processing is browser-local. The unused Pages/AppDeploy deployments are historical context, not targets.

## Architecture and actual navigation

main App.tsx is 997 lines and contains ten screen implementations. hybrid App.tsx is 313 lines, coordinates account state, storage effects, navigation, search/filter, selected Pokémon and selected preset, and renders twelve extracted screen components.

| Layer | Actual responsibility |
|---|---|
| app/navigation.ts | Page union, display labels, primary/secondary groups and readiness metadata |
| App.tsx | State composition, callbacks, in-memory navigation, import/backup orchestration |
| features/* | Home, Dex/detail, teams, hunt, fusion, trainer, history, more, settings, runs, modules screens |
| domain/* | Account metrics, costs/luck, readiness, priorities, comparisons, bitfields, sprite resolution |
| import/* | AES decrypt, raw schema parsing, normalization and snapshot/history creation |
| storage/* + store.ts | IndexedDB/localStorage adapters, state envelope, backup/legacy adapters |
| reference/* + presets/* | Pinned public facts, generated starters, legacy mechanics/assets and sample strategies |
| ui/* | Shared sprites/widgets/navigation, view models, tokens and CSS |

No React Router, URL-to-page dispatch or browser-history synchronization exists. setPage changes local React state and resets scroll to top. Search/filter survive a detail round trip in the current mounted app; this was interaction-verified for the Calyrex search. No durable route/scroll restoration is claimed.

| UI label | Page ID / source | Actual status |
|---|---|---|
| Home | home / home/HomePage | Collection metrics, import baseline/changes, next actions, bundled strategy banner |
| Dex | dex / dex/DexPage | Search, one selected quick filter, 90-at-a-time reveal, detail navigation |
| Pokémon detail | detail / dex/DetailPage | Progress, IVs, collection, strategy references |
| Build | build / teams/TeamsPage | Four bundled read-only strategies; account/in-run readiness distinctions |
| Run | run / runs/RunPage | Planned landing screen; account metadata and external Guest Play link |
| Goals | goals / hunt/HuntPage | Fixed derived rankings, maximum 80 displayed; no custom or Build-aware goals |
| Trainer | trainer / trainer/TrainerPage | Career, vouchers and collection progress |
| History | changes / history/ChangesPage | Import/change records; not a full interactive snapshot comparison editor |
| Fusion | fusion / fusion/FusionPage | Bundled recipes with version-sensitive inheritance caveats |
| Modules | modules / modules/ModulesPage | Planned informational screen; no companion enable/disable registry |
| Import / Settings | settings / settings/SettingsPage | Local import, export/restore, clear, status and self-test |
| More | more / more/MorePage | Secondary navigation |

Readiness metadata is honest on Build/Run/Goals/Modules, but Home's fixed preset banner still says Current run build. Home picks data.teams[1], not a saved active run. That contradiction is SOURCE OBSERVED and VISUALLY OBSERVED.

## Persistence and account privacy

- IndexedDB name pokerogue-command-center, version 2, object store state, key app-state-v2; legacy app-state is supported.
- Fallback: localStorage using the same state keys.
- State envelope schema 2; backup kind pokerogue-command-center-backup, backup schema 1 and state schema 2.
- AppState combines current snapshot, snapshots and history. No independent profile, RunState, UserContent or persisted editable Build repository.
- Imports retain up to 30 snapshots and 5,000 history records.
- Import parser constructs consumed sections and excludes trainerId/secretId; raw decrypted content is not persisted by the inspected path.
- Versioned and legacy raw JSON backups are accepted. Backup restore currently sets AppState directly; no restore preview or transactional v3 migration exists.
- Clearing removes account state/history/snapshots and retains the separate artwork cache.
- Origin storage is independent; a custom-domain change needs a backup-transfer UX, not just relative links.
- The real-user backup was reported exported in the handoff; this audit did not possess or restore it.

## Reference and artwork boundaries

Companion game pin: e734a202a912cc969409c84111b5ab6a15fc7774.
Asset pin: 056a1f408f26a3be4fef243f7462cb43608c7928.
Build generator reads the pinned species enum and generation tables, validates 572 starters, and writes ignored bundled generated data before dev/build/test.

Preserve PokemonSprite, TeamMemberSprite and domain/assets.ts. They resolve pinned atlas frames, scale pixel artwork and expose a loading/unavailable fallback. Complete form/shiny correctness and distribution rights were not exhaustively verified in this audit. The starter reference does not supply every move/form/type configuration required by a legal Sandbox editor.

Legacy mechanics.v1.json, asset metadata and strategy presets remain versioned snapshots, not fully source-generated rules. priorityScore is Rogue+'s derived weighted ranking with preset membership bonuses; do not describe it as a game statistic.

## Styling and supplied design authority

main.tsx loads tokens.css -> index.css -> shell.css. The token file defines a near-black default and Inter/system type; index.css remains roughly 32 KB with 7–11px labels, hardcoded accents and legacy surfaces; shell.css overrides portions. The shared component library is partial.

Navigation Brand is typeset R+/ROGUE+, not the provided artwork. The supplied clean white/orange icon was successfully inspected despite the initial attachment-path error message. The wordmark raster contains distressed artifacts.

Design System v1.1 records a newer warm/light default and 24 approved choices. Exact #FBF8F2 canvas, Rubik/Source Sans 3, spacing, radii, shadows and timings remain proposed. Its six Markdown files carry v1.1 changes; its unchanged ten-page PDF is a v1.0 process overview, not a current UI mockup.

Conflict resolution: retain approved hybrid density and canonical navigation, adopt the package's newer visual character as the proposed redesign direction, and preserve verified functional contracts. Older dark-default docs and guide Teams/Hunt examples are historical. Direction still awaits the user's implementation approval.

## Evidence collected and verification limits

Fresh desktop captures, about 1363x936 CSS pixels (scrollbar captures 1348x926):
1. Hybrid no-data entry.
2. Hybrid Home using the app's built-in eight-record synthetic sample.
3. Hybrid Dex sample.
4. Calyrex detail.
5. Build preset library.
6. Import / Settings sample.
7. Production no-data entry.

Observed interactions: built-in sample loading on the isolated preview, navigation, Calyrex search, opening detail, returning with query retained, and planned Run messaging. No real save upload, backup restore, destructive reset, Play battle or offline scenario was performed during this audit.

Latest hybrid-head Actions were successful:
- Companion baseline: runs 37792684686 and 37792678763.
- Companion UI regression: 37792678720.
- Hybrid preview browser QA: 37792678906.

Tests inspected: five storage/import tests and three navigation/config tests. CI browser checks exercise synthetic data, desktop navigation, IndexedDB reload, exported backup import in an isolated 390px context, planned screens, same-origin requests and one overflow check. They do not establish complete visual quality, real-user restore, offline upgrade correctness or every malformed nested payload.

This audit ran the read-only module-boundary check: PASS, 45 source files and ten extraction checks. It did not install dependencies or rerun the entire build/test suite. User-supplied phone screenshots were subsequently reviewed as documented below. No fresh interactive iPhone signoff, full accessibility audit, Git-history audit or reserve parity check is claimed.

## Critical findings

| Priority | Evidence | Finding and consequence | Next packet |
|---|---|---|---|
| P0 release risk | SOURCE + DERIVED; App.tsx boot catch and autosave effect, also present in main | A rejected local load sets emptyState and loaded=true; the save effect then writes the empty envelope. A corrupt/future envelope can be overwritten. No real user loss was observed or deliberately reproduced. | S0 recovery guard |
| P1 release risk | SOURCE; storage/schema.ts | Backup validation checks outer shapes but not all nested snapshot fields or finite/supported version values. A malformed accepted backup can reach the domain facade. | S1 backup validation |
| P1 trust | SOURCE + VISUAL; HomePage | Bundled strategy labeled Current run build; demo indicator primarily depends on toast and lower source metadata. | U3 Home |
| P1 design | VISUAL + SOURCE; Dex/Build/detail | Very small status/support text; Build account-check notes wrap into a narrow column. | U4/U5 |
| P1 release gap | Handoff + no fresh verification | Real-user isolated backup restoration remains unverified. | R0 |
| P2 maintainability | SOURCE | No dependency lock; split CSS ownership; boundary scanner does not enforce every target architecture rule. | I0/U1 |
| P2 offline | SOURCE; public/sw.js | Hashed JS/CSS are fetched/cache-filled opportunistically, not fully install-precached; same shell cache name persists and upgrades are not transactional. | O0 |

Nothing in this audit changes implementation code, reference pins, private saves or deployments.

## User-supplied phone evidence (2026-10-08)

Seven screenshots show Home, Dex, Build, Goals, More, Trainer and Fusion. These are visual evidence supplied by the user, not an interactive device test or deployment-SHA verification. Full-page captures do not establish the first visible viewport or exact CSS dimensions. Private account values and source filenames are deliberately omitted from this public document.

Preserve the five-tab navigation, two-by-two metric grids, six-member roster overview, authentic sprites and numeric progress bars. The current application already has a coherent phone structure.

| Screen | Observed finding | Proposed response |
|---|---|---|
| Home | Preset appears before next actions and is called Current run build | Prioritize next actions; label the bundled preset honestly |
| Home | ALL TIERS appears beneath the red-shiny count | Source account.ts defines allShinyTiers as entries with t1 AND t2 AND t3; label All three tiers unlocked, preserving calculation |
| Dex / Goals | Long uninterrupted result lists | Improve row hierarchy and result context first; preserve existing search/filter/reveal and ranking semantics |
| Build | Six-member overview works; supporting role/readiness text and repeated notes are dense | Keep roster overview; increase supporting-text readability and group notes |
| Trainer / More | Clear progress and comfortable secondary navigation rows | Preserve these patterns while adopting the supplied visual system |
| Fusion | Tall participant panels contain substantial empty space; recipe tabs extend beyond the visible right edge | Compact paired identities, preserve first/second order and caveats; make horizontal tab scrolling discoverable |

Screenshot review closes the missing phone-image evidence gap. Keyboard, touch interaction, safe-area behavior, tab scrolling, offline updates and actual-user backup restoration remain unverified. Do not publish these private-account screenshots in the public repository.

## More navigation update — 2026-10-08

On the design/profile-candy-overview branch, More opens a shared nonmodal pop-out instead of replacing the current feature. Dismissal preserves page state; choosing a destination uses existing navigation. The older More screen described in the audit remains a compatibility component. Short phone landscape uses compact header and bottom navigation, retaining safe-area padding. Native keyboard and physical iPhone interaction still require device review; this branch update does not establish production parity. See project/evidence/U1-MENU.md.
