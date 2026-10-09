# Safari official API access diagnostic

2026-10-09. User authorized this diagnostic and deployment with “Do it”. Isolated production-baseline packet: main 1fe923af979466cfa4d785127a69d9e3ae6edf9d. This baseline has no project/tasks.json tracking workflow. No separate task ledger was introduced and the parallel DEX branch was not changed. Import these observations into its existing ledger when integrating. Status: diagnostic deployed; real Safari and account integration unverified.

## Scope and accepted direction

Serve /diagnostics/pokerogue-access, its trailing-slash alias and .js from the existing Rogue+ origin. User-clicked unauthenticated GET requests only to https://api.pokerogue.net/account/info; credentials: omit. The second probe uses Content-Type, PKR-Client-Version (explicit diagnostic placeholder) and a deliberately invalid Authorization value to exercise header preflight. No login, token entry, cookies, response-body reads, save endpoints, storage, telemetry, proxy, wrapper or local Play. Official progression only; profile direction is PokéRogue → Rogue+. No companion writeback.

Readable HTTP responses establish transport for that request only. Unavailable responses cannot distinguish CORS, network, content blocking or a security challenge. Dummy headers and omitted credentials do not establish real authenticated behavior. Login, profile sync, official game embedding and Phaser hooks remain unproven.

## Actual deployment

Cloudflare Worker rogue-plus version a96a0dd3-54ec-4b70-8604-b30138c8156b. Module source diagnostics/pokerogue-access-worker.mjs unchanged from Git commit 854a6c7696c70854e0f72f841c92a70bd10b34e2. Assets retained with keep_assets:true; ASSETS binding added; compatibility date 2026-10-08. Asset SPA fallback remains unchanged.

Important observed API behavior: keep_assets:true retained the old routing configuration and ignored the requested assets.config.run_worker_first change. Initial live URL returned the existing SPA. The successful correction used compatibility_flags:["assets_navigation_has_no_effect"] and omitted assets.config, allowing unmatched paths to reach the Worker; it handles only the diagnostic paths and delegates everything else to ASSETS. This adds Worker invocations for unmatched navigation paths. Static asset matches continue direct serving. A first correction request timed out; deployment state was inspected before a single targeted retry succeeded.

Preferred permanent integration: retain diagnostic module and configure narrow assets.run_worker_first path rules in an intentional full asset deployment, then remove this temporary compatibility flag. Do not redeploy this branch's older companion over ongoing DEX work. A normal assets-only deployment removes the diagnostic.

Rollback: deploy original assets-only version 488ee37e-1c43-4897-a487-a51ad7560c19 at 100%. Check current deployment before rollback to avoid overwriting newer work.

## Evidence

- Node assertions passed: root/static-asset delegation, three diagnostic paths, no-store, HEAD response, POST rejection.
- Synthetic Node VM handler checks passed for readable 401, TypeError and AbortError outcomes; no requests before click, exactly two credential-free GETs, button recovery. These are synthetic, not Safari evidence.
- Live cloud Chromium page renders correct heading, Run test button, ready state and interpretation guidance at https://rogue-plus.gagedush-bff.workers.dev/diagnostics/pokerogue-access.
- Root URL reloaded after final deployment and retained the original app/import landing view.
- API deployment metadata confirmed retained SPA assets, ASSETS binding and temporary navigation flag.
- No live API calls made by this page in cloud Chromium. An earlier direct OPTIONS probe in this environment returned a Cloudflare security page; no attempts were made to bypass it.
- Actual iPhone Safari, installed web-app behavior, mobile viewport visual review, authenticated account access and profile transfer: NOT TESTED. User must run diagnostic on device. Safe-area CSS is implemented but physical camera-island behavior is not verified.

## Phone test

Open the live route in Safari and tap Run test; send the result text or screenshot. If testing standalone mode, launch the diagnostic in a home-screen web app and check the report's standalone field. Merely opening this link from a home-screen app can launch ordinary Safari; confirm the field rather than assume standalone. No passwords, tokens or saves should be shared.
