# U4A — Dex Grid/List, scope and imported-field queries

Date: 2026-10-09. User explicitly authorized U4A in this session. Working source is a real clean checkout of `design/profile-candy-overview` at `5446cb17c5b582e88faf406c17ce656b419ed4ae`, confirmed against GitHub PR #8 and remote branch before editing. The handoff's materialized-workspace note describes its old workspace, not this checkout.

## Implemented scope

Default Grid and Collected; optional List and All Pokémon scope. Three phone columns, content-width desktop breakpoints through eight. All covers starter records present in the normalized snapshot and labels locked ownership; it explicitly discloses the dependency for full species/evolution coverage.

Pure `domain/dex-query.ts` unifies plain name/gap search, supported imported-field predicates, inclusive ranges and sorting. Predicates combine with AND; numeric unknowns fail ranges and sort last. Ascending/descending order uses deterministic ID ties without modifying input records. Conditions cover core gaps, owned red shiny, passive not unlocked, bundled-team IDs, incomplete perfect IVs, unlocked hidden ability and no Classic wins. Ranges cover current starter cost, candy, perfect IV slots and unlocked egg slots. Sort covers ID/name/current cost/luck/candy/perfect IVs/egg slots.

Filters, Sort and Advanced use drafts: Apply commits; Cancel/Escape/backdrop discard. Panels bound their height, scroll internally and return focus to their trigger. Native modal dialogs plus explicit first/last Tab wrapping retain keyboard focus. Chips remove conditions individually; Clear all clears text/predicates/ranges, retaining scope/layout/sort. Detail return restores search, filters, sorting, layout, reveal count and saved scroll/card focus. More continues to leave the feature mounted.

## Actual verification

- Pinned reference generation: `node scripts/generate-game-references.mjs` — 572 starter records from unchanged game pin `e734a202a912cc969409c84111b5ab6a15fc7774`. No reference pin or generated reference content change committed.
- `npm run typecheck` in companion — pass.
- `./node_modules/.bin/vitest run` in companion — 49 tests / 8 files pass, including 4 new synthetic query tests for scope, inclusive AND conditions, missing-versus-zero, mutation safety, stable sorting and empty input. Existing candy/Goals, appearance/navigation and storage/recovery tests also pass.
- `./node_modules/.bin/vite build` in companion — pass, 1709 transformed modules. Uses the generated pinned reference bundle above; skips only the already-completed npm prebuild network regeneration.
- `node scripts/check-module-boundaries.mjs` — pass, 50 source files and 10 feature routes.
- `node scripts/validate-repository.mjs` — pass on staged source. This is tracked-source validation, not a full public-history privacy review.
- `git diff --check` — pass.
- Existing tracking tests: `node --test scripts/project-tracking.test.mjs` — 15 pass. Generator and final freshness check run with the packet staged.

### Browser interaction evidence

`companion/scripts/check-dex.mjs` is a reusable local-dev-server synthetic browser check. Each fresh context seeds only synthetic fixture records, including one long name, missing numbers/progress/passive status and a locked starter. All eight final cases pass:

| Viewport | Themes | Grid columns |
| --- | --- | --- |
| 320 × 720 | Light, Dark | 3 |
| 390 × 844 | Light, Dark | 3 |
| 1100 × 390 | Light, Dark | 5 |
| 1600 × 900 | Light, Dark | 8 |

Assertions cover defaults, Grid/List and no horizontal overflow, long-name wrapping, partial/unknown labels, Collected/All and locked labeling, actual red-owned results, Apply/Cancel/Escape/backdrop behavior, explicit sort direction, invalid inclusive ranges retaining drafts, removable chips, Clear all, empty results, dialog Tab wrapping, trigger-focus restoration, and detail return preserving active hidden-ability condition, search, sort, layout, scroll and card focus. Phone/short-desktop More dismissal also preserves query and scroll. The final matrix also rotates the 390px contexts to 844×390 in both themes and verifies the sheet stays inside simulated 59px camera side insets and 21px home-indicator clearance.

Visual inspection: phone Grid in both themes, phone Advanced sheet, and bounded desktop Advanced panel in a 390px-high window. Matched synthetic captures: [phone](../../docs/assets/dex-u4a-phone.jpg), [desktop](../../docs/assets/dex-u4a-desktop.jpg). Captures show the existing artwork-unavailable fallback because this browser environment could not load upstream atlas assets; authentic artwork resolver and pins remain unchanged. No claim that these captures validate upstream artwork fetching.

Existing exported `checkTheme` and `checkRecovery` browser suites pass against the final local production build at 320/390/1330px. They cover live system appearance, explicit overrides, reload/reset isolation, all five primary routes, More/window-height behavior, safe-area simulation, startup rejected-byte preservation/retry/reload/cancel/reset and keyboard/recovery layouts. The theme script now checks the Dex toolbar rather than the removed legacy quick-filter row.

Environment notes: normal Playwright Chromium download returned truncated files; cloud browser blocked the local URL. Verification succeeded using a registry-installed `@sparticuz/chromium` headless executable with Playwright, GPU disabled, against local Vite servers launched in the same sandbox network namespace. Runtime packages were temporary and are not project dependency or lockfile changes. Initial checks caught Sort accessible-label ambiguity and final-Tab focus escape; both were corrected and the complete eight-case matrix rerun successfully.

Reproduction with standard Chromium and Playwright installed separately (as existing UI scripts do): start `npm --prefix companion run dev`, then `ROGUE_PLUS_BASE_URL=http://127.0.0.1:5173/ node companion/scripts/check-dex.mjs`. Optional `ROGUE_PLUS_CAPTURE_DIR` writes synthetic captures. The new check's fixture-module imports require the dev server; existing theme/recovery checks run against the production preview.

## Guidance and preserved consumers

Reviewed DECISIONS, DEX_HANDOFF, ARCHITECTURE and DESIGN. Updated current Dex facts in the latter three; accepted decisions, proposed grammar and downstream reference/candy/update architecture remain distinct. Shared App wiring retains existing primary routes, More behavior and non-detail navigation; CSS changes are scoped to Dex. Reused PokemonSprite. Import/storage/account backup formats, ownership masks, scoring, candy formulas, reference pins and other feature owners are unchanged.

## Limitations and delivery

This verifies U4A foundations, not full reference searching, named unlock availability, evolution-root matching, candy reservation, update infrastructure or release gates. Session preferences are not persisted across reload. Blank/unknown progress descriptions do not match the missing-core-progress condition. Unknown presentation/query safeguards do not change existing importer normalization semantics. Physical iPhone/Safari/keyboard/safe-area signoff remains the separately tracked U1-SAFE gate.

Delivery targets the existing development branch and draft PR #8. No merge, manual deployment, production release or preview byte-parity claim. Next scoped implementation is DEX-REF, still pending separate authorization. The final GitHub commit/check state is reported separately from the dated baseline above.

### Closing safe-area refinement

Remote baseline, project-tracking and full Companion UI regression passed at `8b37a6aaba8b9b679430320c0d509aa383e13acd`. A final source review then found fixed 12px sheet side margins did not honor landscape camera insets. U4A was reopened in the same authorized packet; the sheet now uses shared safe-left/right/top/bottom variables. The added two-theme landscape assertions and full eight-case Dex matrix pass after that correction. The final CSS production build, Node syntax check, tracking tests/freshness and tracked-source validation are checked again with this refinement. Earlier screenshot compositions show native-zero-inset contexts and remain representative of those layouts; the added landscape evidence is interaction/bounds evidence, not physical-device signoff. Remote checks for the final refinement commit are reported separately.
