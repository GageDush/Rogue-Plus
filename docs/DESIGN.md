# Rogue+ active design reference

Mobile-first is confirmed. Preserve the five bottom destinations, useful stat grids, authentic sprites and six-member overview. Hybrid means task-adaptive density and purposeful Pokémon compositions.

The selected warm field-guide Home/Dex direction and shared light/dark foundation are approved; see DES-001–004 in DECISIONS. The v1.1 package provides supporting guidance; downstream feature packets retain their own acceptance gates. The package's older Teams/Hunt examples must map to actual Build/Goals labels, not create duplicate pages.

Keep #FF6A35 and the approved matte icon. Group information before enlarging every row. Shared buttons, input/search/filter patterns, navigation, metrics/progress, identity rows, roster entries and feedback belong under ui; feature-specific compositions belong in their feature. Open sections and selective containment can improve the current card-heavy views.

Proposed refinements: next actions before the bundled preset on Home; honest preset labels; readable role/readiness notes; explanatory Goals rankings; compact ordered Fusion participants; persistent actionable import/storage errors. Preserve algorithms, reference pins, imported fields and existing actions. New disclosures, filters, sorting and remembered scroll are separately scoped interactions.

S0 adds a narrowly scoped persistent startup-recovery state in the existing dark styling: clear error/reason, paused-autosave explanation, retry and explicitly confirmed destructive reset. This implements failed-load feedback only; it does not adopt the candidate theme or establish redesigned import/restore flows. Recovery controls use at least 44px targets and wrap at 320px. Browser checks do not constitute real-iPhone/Safari release signoff.

## Candidate v1.1 choices

The supplied package records: balanced playful/premium tone; rounded headings/clean body; moderate geometry; subtle layers/shadows; mostly neutral UI; restrained motion; adaptive density; authentic artwork/modern chrome; subtly rounded headings; humanist body; warm off-white canvas; limited orange; outline icons with filled selection; contextual type colors; quiet borders/elevation; verified milestone celebration; balanced spacing; open sections/selective cards; orange primary/neutral secondary actions; tinted active navigation; numbers/meaningful slim bars; comfortable rows; quick chips and only supported advanced filters; brief success/persistent errors.

The selected U1 foundation adopts these semantic light values: canvas #FBF8F2, surface #FFFFFF, ink #202A36, secondary #52606B, line #E5DFD6, orange-soft #FFF0E9. Preferred type: Rubik headings/Source Sans 3 body, system fallbacks and tabular numeric columns. Foundation spacing 4/8/12/16/20/24/32/48, radii 10/16/22, body/support/rare metadata 16/14/12px and frequent touch targets about 44px.

Use dark ink on brand-orange controls; validate actual focus/pressed/disabled states and rendered contrast. No Home featured Pokémon hero, neon/glows, generic SaaS card grid, excessive badges or microtext used to force layout fit. Type/shiny/form signals require supported data. Unknown is not zero; progress bars need real denominators.

## Evidence and acceptance

Phone widths first: 320px stress and 390px representative; desktop composition also reviewed. Match account/demo state and viewport in before/after comparisons. Include relevant long-name, empty, loading, failure, partial-data and artwork-fallback states. Screenshots establish appearance; interactions, keyboard/phone safe areas and persistence require their own checks. Do not call full-page supplied captures an interactive iPhone signoff.

The dated REDESIGN_PLAN retains the detailed comparison and original packets. Current packet authorization/results live only in project/tasks.json; update this reference when accepted design decisions change.

## Light/dark foundation (U1)

`ui/styles/tokens.css` owns both palettes. `ui/theme.ts` owns independent UI preference resolution, OS/tab notifications and safe persistence; `ui/useTheme.ts` exposes it to feature UI. The small pre-render bootstrap in index.html must keep its key and normalization consistent with theme.ts (tested). Default follows system. Settings offers System / Light / Dark with pressed states and 44px targets. No theme preference is part of an imported account, local account reset or account backup.

`field-guide.css` deliberately bridges legacy selectors using semantic tokens. Home now follows DES-005–007: Profile overview, Home-only header Import, affordable candy recommendations with egg sorting, and progress bars with small counts. Goals retains the full long-term ranking. Dex now uses the U4A imported-field query controls described below. Type badges shown in the concept are deferred until source-backed data is exposed. No invented data; the separately authorized U1-CANDY planner uses pinned prices without changing Goals weights. Broader feature layouts remain in their existing packets. Brand mark is the supplied PNG unchanged; fonts use local system fallback until a separate self-hosted font packet.

## Profile overview follow-up

Use real collection denominators for starters, passives, egg moves and red-shiny starter count (not all-tier count). Share CollectionProgress with Trainer/detail. Red stars accompany plain labels; color alone conveys no meaning. Home candy rows disclose price and available candy and open Pokémon detail. Show three by default, with Show all/Show fewer and two egg ordering options. Every displayed action is candy-affordable from the imported snapshot; egg purchases remain random and capacity is not inferred.

## Device safe areas

The final field-guide stylesheet owns top, bottom and landscape side insets after legacy rules and breakpoints. Edge-to-edge backgrounds remain; header controls, content, navigation, recovery screens and notifications reserve system-control clearance. Tests simulate insets because desktop automation reports zero native values. Physical installed iPhone/Safari portrait, landscape, keyboard and larger-text verification remain pending under U1-SAFE.

## Candy browsing and visible phone filters

Home shows three candy priorities. Browse all expands a searchable, action-filtered view on Home, rendering up to 20 rows initially and adding 20 per request. Filters/search reset the batch; collapsing resets browsing controls. Egg order appears with visible egg recommendations or the egg category, and budget detail uses an expandable disclosure. Domain ordering and affordability remain unchanged. Dex filters and strategy selectors wrap so options stay visible on phone widths.

## More pop-out navigation

More toggles a slim nonmodal pop-out over the mounted feature rather than navigating away. Outside pointer, repeated toggle, close button, Escape and focus leaving the pop-out dismiss it. Toggle/Escape/close return focus without scrolling; outside interaction keeps normal focus behavior. Selecting a destination closes the pop-out and uses existing navigation. Header triggers remain reachable above the backdrop. Safe-area-aware height and internal scrolling accommodate short landscapes. Search uses one outer focus ring; short phone screens use a compact header/navigation.

### Desktop navigation fit

At desktop widths (980px+), windows at least 720px high expose all secondary destinations directly and omit More. Shorter windows show More in the sidebar and position its bounded pop-out beside the trigger. Resize closes the panel if its trigger becomes hidden. Phone navigation remains header More plus five primary bottom destinations.

## U4A Dex foundations

Grid is the default, with three phone columns; desktop uses content-width container breakpoints to grow from three through eight. List uses the same results and controls. Collected defaults to imported unlocked starters. All Pokémon exposes every starter record present in the current normalized snapshot with locked labels; full species/evolution coverage remains DEX-REF work.

Filters offers missing core progress, owned red shiny, passive not unlocked, bundled-team membership, missing perfect IVs, unlocked hidden ability and no Classic wins. All selected conditions combine with AND. Advanced offers inclusive current-cost, candy, perfect-IV-slot and unlocked-egg-slot ranges; blank bounds are open, invalid ranges retain the draft and show feedback. Sort supports number/name/current cost/luck/candy/perfect IVs/egg slots, with explicit direction, ID ties and unknown values last.

All three panels edit drafts. Apply commits; Cancel, Escape and backdrop dismissal discard. Phone uses a bounded bottom sheet, desktop anchors near the triggering control with internal scrolling in short windows. Native modal dialogs plus explicit Tab wrapping keep keyboard focus within the panel; closing returns focus to the trigger. Applied search/filter/range chips remove conditions individually; Clear all clears those conditions while retaining scope, layout and sort. Search is visibly plain name/gap text; reference expression grammar is not implemented.

App retains query, layout and reveal count through detail. Returning restores the Dex scroll position and selected card focus. More dismissal retains the mounted feature and its state. Unknown fields display Unknown or Progress unavailable rather than fabricated numeric zeros. Reuse the unchanged authentic artwork resolver and its fallback; no new type/move badges are inferred.
