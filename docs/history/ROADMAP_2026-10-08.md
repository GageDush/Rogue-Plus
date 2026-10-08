# Rogue+ roadmap — accepted product decisions

This roadmap distinguishes current behavior from future work.

1. **Foundation RC:** finish verification of PR #2, validate rollback and separate-profile restore, merge only with production approval.
2. **Hybrid redesign:** analytic/command-center dashboard, visually richer Dex/Build/Run screens; reusable tokens, components, accessible mobile navigation. Rename Hunt to **Goals**, Teams to **Build**. Show unfinished features as planned rather than faking them.
3. **Application module contracts:** typed navigation/module registry, capability scopes, feature-to-feature dependency guard and safe lifecycle. Core navigation plus optional Modules area; no arbitrary downloaded code execution.
4. **Privacy and source hygiene:** audit code, fixtures, docs, generated bundles and reachable Git history; replace any personal fingerprints; source backup mirror on validated release, never include account backups.
5. **Storage v3:** independent per-profile AccountState, RunState, shared UserContent. Reversible migrations; account import/reset cannot erase user Builds.
6. **Build Editor v1:** reusable six-slot Builds; **Inventory** checks real unlocked selections; **Sandbox** allows *all rules-legal* supported Pokémon, forms, abilities, passives, egg moves, shiny tiers, natures/IVs and reductions, without mutating a game save. Clone immutable presets. Individual JSON export/import and copy/paste Build codes; no share URL requirement in v1.
7. **Goals v1:** explainable Build-aware priorities and candy targets, derived from active profile and Build, not immutable imported facts.
8. **Offline/PWA and Alpha v0.1:** fully functional companion offline after install; safe cache upgrades, backup recovery, versioned release, iPhone/desktop QA.
9. **Run and Play:** independent session data; integrate pinned upstream game's Guest preview behind a versioned read-only bridge; official login/sync only if supported and authorized.
10. **Advanced optional modules:** full damage ranges, fusion planning, challenges and other independently tested modules.

## Product defaults
- Multiple profiles, independent collection histories.
- User-created Builds usable across profiles, with profile-specific ownership status.
- Hybrid visual direction: precise dark dashboard, rich Pokémon-centric screens; Rogue+ white / matte orange identity.
- Cloudflare Workers; origin-relative internal routes, absolute service endpoints confined to configuration.
- Source reserve mirrors happen on *validated releases*, not every experimental commit.
- Private browser state and exported .prsv/JSON must never enter either public GitHub repository.
