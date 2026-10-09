# Safari official API access diagnostic

2026-10-09. User authorized a narrow diagnostic deployment with “Do it”. This isolated packet is based on production main 1fe923af979466cfa4d785127a69d9e3ae6edf9d, which has no project/tasks.json workflow; it does not modify the parallel DEX branch or create a second task ledger. Port acceptance observations into the active ledger when integrating there.

## Scope

Serve /diagnostics/pokerogue-access and its .js from the existing Rogue+ origin. Only user-clicked unauthenticated GET requests to https://api.pokerogue.net/account/info. credentials: omit. Second probe uses Content-Type, PKR-Client-Version (explicit diagnostic placeholder) and a deliberately invalid Authorization value to test header preflight. No login, token entry, response-body reads, save endpoints, storage, telemetry, proxy, wrapper or local Play.

Readable HTTP responses establish browser transport only. Unavailable responses cannot distinguish CORS, network, browser blocking or a security challenge. Authenticated profile access, embedded official play and Phaser hooks remain unproven. Actual iPhone Safari and installed-web-app checks await user results.

## Deployment contract

Existing assets-only Worker rogue-plus version 488ee37e-1c43-4897-a487-a51ad7560c19 is the rollback baseline. Preserve its asset manifest, SPA not-found behavior and compatibility date 2026-10-08. Upload module with keep_assets:true, ASSETS binding, and assets.config.run_worker_first limited to /diagnostics/pokerogue-access, /diagnostics/pokerogue-access/ and /diagnostics/pokerogue-access.js. Other requests delegate to ASSETS. A future ordinary assets-only deployment will remove the diagnostic; port this module and routing intentionally if retaining it. Do not redeploy this branch's older companion over current DEX work.

## Acceptance so far

Node assertions passed: root and static-asset delegation, all three diagnostic paths, no-store, HEAD, POST rejection. Live browser verification and user Safari evidence must be recorded separately; never infer account integration from a successful page load.
