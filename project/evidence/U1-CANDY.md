# U1-CANDY · Profile overview and affordable candy planning

User approval: 2026-10-08 refinements to naming, Import placement, next actions, shiny language and graphical completion; user authorized implementation. Materialized source based on design/light-dark-foundation at efa2c3d380e7a904c10f66102b47c0db1c75e5da. Explicit allowlist publication; no whole-tree seeded-index diff.

## Implemented contract

Home is Profile overview; header Import is Home-only. More → Import / Settings retains local imports. Home, Trainer completion and Pokémon-detail ratios use accessible CollectionProgress bars with smaller counts and rounded percentages that never claim early 100%. Plain yellow/blue/red shiny display formatting preserves internal keys and historical data. Home next actions are read-only candy recommendations. Passive first if affordable, otherwise affordable next reduction, otherwise incomplete egg-improvable species eggs. Global upgrade groups precede eggs; each species has one recommendation, avoiding double-spend. Egg ordering uses most affordable eggs or least progress (moves, perfect IV slots, natures, hidden ability, red shiny). Goals scores remain unchanged and are labeled long-term targets.

## Primary reference evidence

Existing pin unchanged: e734a202a912cc969409c84111b5ab6a15fc7774.

- https://github.com/pagefaultgames/pokerogue/blob/e734a202a912cc969409c84111b5ab6a15fc7774/src/data/balance/starters.ts — exact passive/reduction costs, ten egg-price rows and hatch thresholds.
- https://github.com/pagefaultgames/pokerogue/blob/e734a202a912cc969409c84111b5ab6a15fc7774/src/ui/utils/starter-select-ui-utils.ts — affordable species eggs based on candy, base starter price and hatch count; no passive-unlocked prerequisite.
- https://github.com/pagefaultgames/pokerogue/blob/e734a202a912cc969409c84111b5ab6a15fc7774/src/ui/handlers/starter-select-ui-handler.ts — purchases check capacity 99 and subtract candy in game. Rogue+ performs neither operation.

Normalized snapshots do not retain egg inventory. Budget floor(candy/current price) excludes free slots, future discount changes and random hatch results; UI discloses this. Fully maxed means complete egg moves, perfect IV slots, all natures, hidden ability and red shiny, not ribbons/wins or friendship. No raw-save parsing/schema change.

## Verification

- 45 companion tests passed: 14 new synthetic candy-price/eligibility/ordering/immutability cases, 2 accessible progress/unknown-denominator cases, existing appearance/storage/startup/navigation regressions.
- TypeScript and production build pass. Boundary check passes: 48 source files and 10 routed screens.
- Cloud browser with synthetic demo only: Home no overflow at 320 in both modes and desktop 1330; 390 light/dark screenshot review; four accessible Home progress bars; detail four bars/Trainer six bars at 320 dark; red-shiny filter returns four sample starters. Sort changes order (least progress Nincada before Calyrex, most eggs Calyrex first). Header Import absent on Dex; More retains Import / Settings; action opens detail. Keyboard/native select interactions preserved.
- Scoped App diff against actual remote parent is only conditional header Import (recovery/autosave untouched).
- docs/assets/profile-candy-modes.jpg captures a prior synthetic demo (egg-only recommendations); fresh synthetic demo includes an affordable Nincada passive and adjusted passive total. No user account data in evidence.
- Expanded existing CI theme browser check covers 320/390/1330, Home-only header Import, progress accessibility, Show all, both egg sorts, detail/back and prior persistence/reset checks. Remote result pending initial PR creation.

## Limits and delivery

No physical iPhone/Safari signoff, live-save freshness guarantee, automatic purchasing, real save restoration, merge or deployment. Existing per-page polish stays tracked separately. Source guidance and generated progress refreshed in this packet; previous U1 evidence remains dated history.
