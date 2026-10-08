# Rogue+ agent specification

## Scope and authority

Rogue+ is a local-first PokéRogue companion. Preserve the working application; do not restart it or fold the experimental game into companion work.

Read `docs/CURRENT_STATE.md` first, then the relevant packet in `docs/REDESIGN_PLAN.md`. This documentation records the 2026-10-08 audit. It does not authorize redesign implementation. The user must approve the direction before implementation begins; subsequent work follows the user's approved scope. Never infer merge or production-deployment authorization from an implementation request.

Authority is split:
- Current user instruction controls scope.
- Inspected source and tested behavior establish functional truth.
- The supplied RoguePlus Design System v1.1 records the latest approved visual character.
- Designer-selected measurements remain proposals.
- Historical saves and strategy conversations do not establish current account state or current game mechanics.

The v1.1 warm/light default supersedes older handoff and ROADMAP dark-default language. Preserve the hybrid concept as task-adaptive density, not as a requirement for dark surfaces. The design guide's old Teams/Hunt navigation examples are historical; use the actual canonical navigation registry.

## Confirmed product decisions, with implementation still pending where noted

- Local-first, browser-local import and private player data.
- Independent account profiles and histories; never silently merge accounts.
- Builds independent of active profile and reusable across profiles.
- Inventory checks actual availability; Sandbox permits supported rules-legal configurations only, without changing the real save.
- One shared Build schema; individually portable, validated, versioned JSON and copy/paste codes before shareable URLs.
- Core features plus optional reviewed, bundled modules with explicit dependencies and limited capabilities. Avoid remote-script plugins and premature generalized infrastructure.
- Offline companion functionality is a target, not a fully verified capability.
- Cloudflare Workers is the deployment target. Internal assets/links remain origin/base-relative; optional external Play endpoint is in app/config.ts.
- Source reserve mirrors only validated releases; private backups never enter public repositories.

## Visual character recorded as approved by Design System v1.1

Bright, warm, premium, approachable Pokémon companion; modern independently branded chrome with authentic PokéRogue assets. Mobile-first with a considered desktop composition. Keep the supplied matte mark and exact brand orange #FF6A35.

The package records these 24 choices:
1. Balanced playful/premium tone.
2. Rounded headings and clean body type.
3. Moderate rounded geometry.
4. Subtle shadows and layered surfaces.
5. Mostly neutral UI with contextual accents.
6. Restrained playful motion.
7. Task-adaptive density.
8. PokéRogue artwork with modern UI.
9. Subtly rounded headings, not bubbly.
10. Humanist readable body type.
11. Warm off-white default canvas.
12. Orange reserved for primary actions and branding.
13. Rounded-outline icons; selected icons filled.
14. Contextual type colors.
15. Quiet borders and soft shadows where elevation helps.
16. Subtle celebration only for verified milestones.
17. Balanced spacing.
18. Open sections with selective cards.
19. Solid orange primary and neutral secondary actions.
20. Filled icon and gently tinted active navigation.
21. Numeric progress plus meaningful slim bars.
22. Comfortable mobile rows.
23. Quick-filter chips; advanced controls only when the capability exists.
24. Brief success feedback and persistent actionable errors.

Exclude a featured/pinned/rotating Pokémon hero on Home. Artwork belongs in useful identity/roster/action contexts. Avoid neon, glows, glass, rainbow shells, nested cards and routine microtext.

## Proposed values, not individually approved

Starting light palette: canvas #FBF8F2, surface #FFFFFF, muted surface #F5F1E9, ink #202A36, secondary #52606B, line #E5DFD6, orange-soft #FFF0E9. Proposed fonts: Rubik headings and Source Sans 3 body, with system fallbacks. Validate licensing, rendering and offline font availability before adoption.

Proposed spacing: 4/8/12/16/20/24/32/48px. Proposed radii: controls 10px, cards 16px, sheets 22px. Start with 16px body, 14px supporting copy and rare 12px metadata; reflow before shrinking. Frequent controls should target about 44px.

Use dark ink on #FF6A35 primary actions; do not assume white labels are readable. A darker orange for white text is a separate variant, not a global redefinition. Exact shadows, timings and dark-theme tokens remain proposed; secondary dark mode is deferred.

The white logo needs a small dark neutral brand tile on light surfaces until an authentic approved dark-ink variant exists. Do not filter/recolor/reconstruct it. The clean icon was supplied outside the repository; the distressed wordmark raster is not a polished replacement asset.

## Architecture and reusable contracts

- `reference/`: pinned public reference inputs and generated starter data.
- `import/`: local decrypt, validation and normalization.
- `domain/`: calculations and planning; keep runtime dependencies out of UI/storage.
- `storage/` and `store.ts`: existing schema-v2 persistence and backup adapters.
- `features/`: screen ownership; no cross-feature imports.
- `app/` and `App.tsx`: composition and navigation.
- `ui/`: shared primitives, sprite components, view models and styles.

Reuse PokemonSprite, TeamMemberSprite, the asset resolver, domain facade, import/backup logic, metrics, readiness and snapshot comparison. Do not change mechanics, score weights, reference pins or storage keys during presentation packets.

Navigation is React state, not URL routing. Primary: Home/Dex/Build/Run/Goals. Secondary: Trainer/History/Fusion/Modules/Import & Settings; detail belongs to Dex. Internal teams/hunt/changes names are aliases, not missing pages. Do not add /dex deep-link behavior as an incidental style change.

## Evidence and data integrity

Label evidence SOURCE OBSERVED, VISUALLY OBSERVED, INTERACTION VERIFIED, DERIVED RISK or UNKNOWN. Distinguish imported fact, derived ranking, sample preset, user-owned selection and unverified mechanics.

A bundled 5850 Cheese preset is not an active run. Demo status must stay visible after a toast expires. Unknown is not zero. Progress bars need a real denominator; derived priority is not a game statistic. Preserve in-run readiness caveats and fusion uncertainty.

Never commit real saves, normalized player records, backup archives, account fingerprints or private screenshots. Use synthetic fixtures for tests. The filename privacy checker is not a content/history audit.

## Efficient session workflow

1. Read this file and CURRENT_STATE once.
2. Check working tree, relevant branch head and changed paths.
3. If the baseline SHA is unchanged, inspect only files relevant to the approved packet. If it changed, review the diff and refresh the summary before extending conclusions.
4. Use rg; exclude node_modules, dist, generated references and vendored game trees from exploratory reads.
5. Implement one independently testable packet; classify changes as presentation, interaction, feature or data.
6. Update CURRENT_STATE and packet status with actual evidence. Do not claim unrun tests passed.

No package installation, upstream update, broad refactor or new capability is needed for another documentation-only audit.

## Verification and release

Baseline uses Node 24 in CI. Existing checks:
- `node scripts/validate-repository.mjs`
- `node scripts/check-module-boundaries.mjs`
- `npm --prefix companion test`
- `npm --prefix companion run typecheck`
- `npm --prefix companion run build`

Reference generation runs before dev/build/test and requires network initially. No committed npm dependency lock exists at the audit baseline; resolve reproducibility in its own packet. The browser regression runner uses Playwright installed separately by CI.

For authorized UI work verify matching states at 390 and 1440px, with 320px stress coverage; include loading, empty, error, partial-data and long-content states relevant to the packet. Preserve desktop keyboard focus, labels, comfortable targets and reduced-motion behavior. Do not claim a full accessibility pass from screenshots.

Release blockers at baseline: failed-load autosave risk, shallow backup validation, incomplete privacy/history review, and unverified isolated restoration of the user's exported backup. Do not migrate storage or release until the applicable gates pass and rollout is approved. Keep PR #1 game integration separate from the #2 -> #3 companion stack.
