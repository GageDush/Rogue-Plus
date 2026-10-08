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

## Visual proposals awaiting redesign direction approval

- DES-001: Earlier Rogue+ guidance uses near-black surfaces, precise geometric/system typography and restrained borders. The supplied Design System v1.1 records a warm/light premium direction and 24 selected preferences. It is the candidate design reference; its existence is not permission to implement. The user requested a comparison against the pre-chat Rogue+ baseline and has not authorized redesign code in this session.
- DES-002: Recommended meeting point: preserve mobile task structure, hybrid density, functional contracts and branding; improve legibility, hierarchy and component consistency. Warm/off-white is the proposed next direction for review, not a silently adopted code change.
- DES-003: Exact #FBF8F2 canvas, Rubik/Source Sans 3, spacing/radii, shadows and motion measurements remain proposals. Review representative Home/Dex phone states first. Keep existing logo on an intentional dark tile if used on a light canvas; do not recolor/reconstruct it incidentally.

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
