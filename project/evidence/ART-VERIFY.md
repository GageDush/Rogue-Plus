# ART-VERIFY — pinned artwork transport and rendering

Verified 2026-10-09 on design/profile-candy-overview for draft PR #8. Packet 1 of the user-authorized expanded Dex reference work. No merge or production deployment.

## Implemented behavior

Shared PokemonSprite now waits for real PNG decode and matching atlas dimensions before announcing loaded artwork. JSON/PNG requests are bounded at 15 seconds; failures show the existing accessible ID fallback and failed session caches are evicted for later mounts. Atlas frame bounds are validated. Atlas key, actual shiny tier, fallback tier and asset revision have distinct attributes. Account facts, artwork/game pins, URL conventions and storage are unchanged.

## Actual verification

- `companion/scripts/check-artwork.mjs`: four fresh synthetic fixtures at 320×720 Light, 390×844 Dark, 1100×390 Light and 1600×900 Dark passed. Each renders 15 requests: nine generations, canonical Thundurus, Galarian Articuno, Bloodmoon Ursaluna, and Pikachu tiers 1/2/3. Resolved metadata matches rendered tier/atlas attributes. Actual cross-origin image decoding and canvas alpha reads prove real public pinned PNG pixels and usable CORS, beyond metadata-only checks. JSON and PNG HTTP 200 responses were also observed in the initial transport probe. Phone captures visually inspected for authentic sprites, distinct shiny variants and readable framing in both themes. These fixtures contain no private state.
- Separate fresh contexts deliberately abort JSON or PNG requests, with service workers blocked so cached responses cannot bypass the failure injection. Accessible `icon unavailable` and visible #ID fallback passed, with no false loaded attributes.
- Six synthetic unit cases cover exact pin/frame, concurrent request deduplication, rejected atlas retry, missing/rotated/out-of-bounds metadata, labelled shiny fallback, PNG failure/retry/dimensions, and bounded unresponsive decode.
- `cd companion && ./node_modules/.bin/vitest run`: 55 tests across nine files passed. `npm run typecheck` passed. `./node_modules/.bin/vite build` passed using the existing generated reference file; no game-reference source or pin changed in this packet.
- `checkDex`: all eight viewport/theme cases passed (320/390/1100×390/1600), including Grid/List/scope, filter/sort/range drafts, long/empty/partial data, focus and detail/menu round trips.
- Existing `checkTheme` and `checkRecovery` passed against the local production preview: five primary routes, Light/Dark/System/reload/reset/safe-area behavior, and actual React startup retry/reload/cancel/reset preservation.
- Module boundaries: 51 source files / ten screens passed. Repository validator and Git whitespace check passed. Tracking regeneration, 15 tracking tests and freshness check passed (recorded after generation).

Browser setup: a temporary headless Chromium executable with GPU disabled and Playwright ran in the same sandbox network namespace as Vite. Actual external requests used the workspace proxy. Chromium required `--ignore-certificate-errors` for the workspace interception certificate; this is test configuration only, absent from application code. No dependency/lockfile changes were made. Standard reproduction: start local Vite dev server, with Playwright installed separately run `ROGUE_PLUS_BASE_URL=http://127.0.0.1:5173/ node companion/scripts/check-artwork.mjs`. Exported `checkArtwork` accepts an existing browser for environment-specific setup.

## Guidance and limits

Reviewed DEX_HANDOFF, DATA_SOURCES, ARCHITECTURE and DECISIONS. Updated current transport/readiness and eight-packet authorization guidance; accepted product direction unchanged. Shared sprite consumers include Dex/detail, Home/Goals widgets, Fusion and Build via TeamMemberSprite. Existing shared theme/navigation regressions pass; this packet does not establish every Build/Fusion interaction or every frame in all atlases.

Verified public pinned fetching and rendering in this test environment, not production/preview byte parity, real-device coverage, complete asset licensing, every form/variant, or cold-start offline caching/update behavior. Historical U4A screenshots remain dated fallback captures; this packet supplies separate actual artwork evidence. Successful image/atlas cache entries stay session-local. Recovery on later mount is supported; no automatic retry UI or asset refresh infrastructure is added. Reference expansion remains in subsequent separately recorded packets.
