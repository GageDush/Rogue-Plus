# Next chunk: verify combined Play build

1. Install Node >=24.9, pnpm 10, Git. `cd companion && npm install && npm run build`.
2. Run `npm run setup:upstream`, then `pnpm install` inside `upstream/`.
3. Run `npm run patch`, then `npm test`, then `npm run build`.
4. Confirm `dist/index.html` and `dist/play/index.html` render through a static server.
5. Test actual game startup, controller input, login, session saving, and damage preview in browser.
6. Inspect root and `/play/` service-worker scopes/cache behavior.
7. Publish only after preview testing. Cloudflare Pages is not connected yet.

Do not upload private saves or clear existing browser storage during this chunk.
