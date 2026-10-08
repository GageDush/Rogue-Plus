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
