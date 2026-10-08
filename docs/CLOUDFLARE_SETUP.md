# Cloudflare Pages Deployment — Rogue+

## State as of 2026-10-08

- Repository: `GageDush/Rogue-Plus` (public; privacy-source checks enabled)
- Baseline `main` GitHub Actions build: passed
- `alpha/play-integration`: separate experimental branch, not production
- Cloudflare Pages project `rogue-plus` created and connected to GitHub on 2026-10-08. Assigned site URL: https://rogue-plus.pages.dev/. First production deployment must be verified separately.
- The original AppDeploy production URL remains unchanged.

## Initial Pages project

Cloudflare Pages project `rogue-plus` is linked to the **GitHub** repository `GageDush/Rogue-Plus`. This table records the existing build configuration:

| Setting | Value |
| --- | --- |
| Project name | `rogue-plus` |
| Git repo | `GageDush/Rogue-Plus` |
| Production branch | `main` |
| Root directory | `companion` |
| Framework preset | `Vite` or `React (Vite)` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | None required for the baseline |
| Build image | Current Pages standard build image |
| Production custom domain | None until Pages preview is verified |

Production is restricted to `main`, with automatic Git-based deployments enabled. The experimental Play branch is excluded from automatic deployments.


## Verification

1. Confirm the first Cloudflare deployment finishes with no build errors.
2. Visit the generated `https://rogue-plus.pages.dev/` URL (verify the actual assigned Pages subdomain, do not assume it exists).
3. Verify mobile and desktop rendering.
4. Import a demo save only, check account details, Dex navigation, sprites, History.
5. Test refresh and offline behavior, including service-worker registration.
6. Export a backup; restore it on a **different test browser profile**, never overwrite your primary browser data.
7. Only after verification consider production domain association; note that IndexedDB data is per origin and does not migrate automatically.

## Experimental Play integration

Do **not** deploy `alpha/play-integration` as production. The `/play/` combined-build path currently requires upstream game build and in-browser QA. Cloudflare previews should be enabled after this build is verified and Play path service-worker scope is tested.

Build the companion baseline from `companion/` first. When moving to the combined alpha, change the Pages build command to the root orchestrated build only after it has passed CI and demonstrated a real game boot, login, session save, and Damage Preview.
