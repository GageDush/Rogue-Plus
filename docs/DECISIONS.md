# Rogue+ accepted decisions and pending proposals

Reviewed 2026-10-08. Product baseline: the pre-chat RoguePlus source library, later development handoff and repository guidance. Current user instructions control scope. Status is generated separately from project/tasks.json.

## Accepted product and architecture

- DEC-001: Local-first, mobile-first companion; preserve the React/TypeScript/Vite application and Cloudflare Workers delivery. Browser-local read-only import/decryption/validation/normalization, private account facts and local Rogue+ backup export/restore remain supported. Re-encryption, modified game-save export and uploading saves to PokéRogue are outside this project scope (user instruction, 2026-10-08).
- DEC-002: Independent account profiles/history; cross-profile reusable Builds; one shared Build schema with real Inventory availability and hypothetical rules-legal Sandbox configurations. Individual validated/versioned Build JSON and copy/paste codes precede share URLs. These are accepted future capabilities, not implementation claims.
- DEC-003: Separate target AccountState, RunState and UserContent ownership. Import/reset must not erase user-authored Builds/notes/goals. Existing combined v2 storage stays recoverable until a separately approved, verified migration.
- DEC-004: Keep Home/Dex/Build/Run/Goals primary and Trainer/History/Fusion/Modules/Import & Settings secondary. Preserve the hybrid idea: compact analytics and richer Pokémon identity/roster compositions. Keep authentic pinned artwork, approved matte logo and #FF6A35. Existing bundled presets are not active runs.
- DEC-005: Offline companion after successful setup/caching is a tested target; optional Guest Play remains separate, source-pinned and gated. No Rogue+ save-upload endpoint, downloaded-script plugins, central player database or login requirement for the companion.
- DEC-006: Preserve feature/import/domain/storage/reference/UI boundaries. Generate/version public reference data; do not infer mechanics from strategy notes. Public source uses synthetic fixtures; private player data never enters GitHub.
- DEC-007: User approved project tracking/generation/CI setup with "Go for it" on 2026-10-08. This authorizes the tracking packet, not redesign implementation, feature expansion, merge or deployment. Separate task verification from release status; evidence-backed updates ship in the same PR.

## Accepted visual direction

- DES-001 (accepted 2026-10-08): User selected the first displayed warm field-guide Home/Dex mockup by reattaching it and asking for implementation with light and dark modes from the start. This supersedes the previously pending overall warm/light direction; it does not approve future feature behavior, merge or deployment.
- DES-002 (accepted): Both modes share layouts, routes, real metrics, algorithms, original artwork and the five-tab navigation. Light uses warm ivory/white/ink; dark uses near-black/slate with readable semantic colors. The matte white/orange R+ remains unchanged on a dark tile. Brand orange fill and text accent are separate for contrast.
- DES-003 (accepted U1 scope): System-following default, explicit Light/Dark choices under Import / Settings → Appearance, remembered in independent `rogue-plus-appearance-v1` preference. Startup resolves appearance before rendering; OS changes follow live only in System mode. No account-schema change or theme value inside backups. Storage-denied browsers can switch for the session.
- DES-004 (implementation limit): U1 establishes semantic tokens and a representative shared Home/Dex bridge, not every page-specific redesign. Existing Dex lacks species type fields; do not invent type chips from the generated mockup. Generated counts/scores are illustrative; production retains domain-derived values. Rubik/Source Sans 3 remain preferred font names with system fallbacks; no network font requirement has been introduced. Full font packaging, per-page compositions and physical phone signoff remain separate packets.

Approval source: user message 2026-10-08, “I like this one the best, Could you implement a light mode and dark mode from the start,” with the selected mockup attached. Affects U1 and downstream visual tasks.

## Historical reconciliation

The pre-chat library's earlier architecture audit mentions AppDeploy/Pages and a proposed server import route; the later handoff/repository guidance establish Workers hosting and browser-local processing. The standalone integration document's /api/pokerogue/import transport is historical and conflicts with DEC-001/005. Preserve versioned read-only bridge research without reviving that endpoint.

docs/history retains original STATUS/ROADMAP/NEXT_TASK wording. CURRENT_STATE is dated audit evidence and REDESIGN_PLAN is a dated proposal. Previously generated AGENTS wording that treated the visual change as already superseding the baseline is clarified by DES-001/002; it does not establish additional approval.

## Decision change template

ID / status: accepted, proposed or superseded.
Previous direction / replacement:
Reason and evidence:
Approval source and date:
Affected tasks and guidance:

Routine status or path updates need evidence, not a new product decision. Material architecture/design/scope changes use this record and explicit task authorization.

## Profile and candy refinements (accepted 2026-10-08)

DES-005 supersedes the Command Center label and ubiquitous header Import: Home becomes Profile overview; header Import appears on Home only, with Import / Settings reachable through More on every route. Primary tab labels/routes stay unchanged. Approval: user requested these refinements and authorized implementation. Affects U1-CANDY and later shell/Home packets.

DES-006 supersedes Home score-ranked mixed next actions: show only candy-affordable recommendations, one per species. Choose an affordable passive first, otherwise an affordable next cost reduction, otherwise species eggs for incomplete egg-improvable collection fields. Across species, passives precede reductions and eggs; upgrades sort by candy price then species ID. Eggs sort by available candy budget (default) or least progress, with deterministic ties. Least progress equally considers egg moves, perfect IV slots, natures, hidden ability and red shiny; excludes Classic ribbons/wins and friendship that buying eggs cannot directly complete. No game action, candy spending or snapshot mutation occurs in Rogue+. Existing Goals scores remain unchanged and labeled long-term targets.

Egg costs/discounts are added from the already-pinned official source at e734a202a912cc969409c84111b5ab6a15fc7774, without changing the reference pin. Counts are floor(candy/current hatch-based egg price), not guaranteed unlocks, predicted hatch discounts or purchases against free slots. The normalized snapshot has no egg inventory; UI explicitly excludes capacity and states random outcomes. Imported facts remain dated.

DES-007 replaces large completion ratios with accessible progress bars, a percentage and smaller counts on Home, Trainer completion and Pokémon detail. Unavailable totals show unknown; rounding never reports 100% early. Replace displayed T1/T2/T3 shorthand with yellow/blue/red shiny labels and a red star where appropriate; internal keys and historical source terminology remain unchanged.

## DES-008 — bounded candy browsing (2026-10-08)

Previous: unbounded Show all list and horizontally clipped phone filters. Replacement: a searchable, filtered Home expansion in batches of 20, with wrapping Dex/strategy controls. Reason: mk2 phone review shows 419 recommendations; preserve a short default Home and avoid new route complexity. Approval: user requested review and necessary changes. Applies to U1-POLISH; a dedicated candy route remains a future option.

## DES-009 — dismissible More pop-out (2026-10-08)

Previous: More replaced the current feature with a full library page. Replacement: slim overlay navigation toggled by More, dismissed outside or by repeated toggle/Escape/close, preserving current feature/search/scroll. Selecting an item still navigates normally. Reason/approval: user explicitly requested a slim pop-out and return to the same page. Affects U1-MENU; existing secondary destinations and internal page identifiers remain intact.

## DES-010 — Desktop navigation follows available height (2026-10-08)

User approved replacing the redundant tall-desktop More control with all secondary destinations directly in the sidebar. Below 720px viewport height, desktop secondary destinations collapse into More; its panel opens beside the actual sidebar trigger and stays within the viewport. Mobile retains the header trigger. This replaces DES-009’s universal top-right position for desktop. Applies to U1-NAVFIT; no feature or route change.

## DEX-001 — Grid, scope and available-option searching (2026-10-09)

Accepted product direction from user: default three-column mobile Grid, desktop width-responsive Grid up to eight columns, optional List; one Collected/All Pokémon Dex defaulting to Collected. Collected searches starter-selectable moves and unlocked abilities; All includes possible unlocks with locked labels. This supersedes U4A’s presentation-only requirement to retain the same six filters/query behavior. Filtering, sorting, Advanced toggle and an advanced-search guide are accepted requirements. Exact syntax/menu details remain proposed in DEX_HANDOFF. Affects U4A, DEX-REF and DEX-SEARCH; feature implementation is not claimed.

## DEX-002 — Candy reservation and verified pricing (2026-10-09)

User explicitly requested Reserve candy for upgrades. Planned reserve covers missing eligible passive and remaining starter reductions; show raw and reserved egg budgets without changing account candy. Pricing joins original base cost, hatch count, unlock/reduction state and verified official rules, including exceptions. Preserve DES-006’s priorities and random-outcome labels. Affects DEX-CANDY and shared Home consumers.

## DEX-003 — Reference update target (2026-10-09)

User accepted versioned reference-update direction with “Sounds good.” Future bundled fallback plus validated cached packs, atomic activation and rollback replaces bundled-only target, not current runtime. Official released-revision detection, trust/schema compatibility and reviewed publication must be designed before implementation; automatic publication and historical rules selector remain proposals. No executable downloads or account-state mutation. Affects DEX-UPDATES; implementation/release authorization remains separate.
