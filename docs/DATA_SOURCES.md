# Rogue+ data ownership

**Public GitHub holds source code, build recipes, exact upstream revision pins, and default strategy templates. It does not hold private Pokémon save exports or historical account snapshots.**

| Domain | Owner | Source | Runtime |
| --- | --- | --- | --- |
| Game species IDs, names, starter costs | Official PokéRogue | Pinned `reference-sources.lock.json` | Generated build-time JSON, bundled offline |
| Game battle damage | Official PokéRogue | Game source pinned separately | Calculated by the game bridge, not duplicate formulas |
| Assets | Official PokéRogue asset project | Pinned revision | Browser cache; license/source audit required |
| Game balance tables | Official PokéRogue | Pinned source | Legacy `mechanics.v1.json` remains a versioned static reference pending an extractor |
| User's collection, achievements and statistics | User's imported save | In-memory after browser-local decrypt | IndexedDB only |
| Saved builds, notes, goals, custom presets | User | Rogue+ UI | IndexedDB (migration of existing shipped presets is pending) |
| Source-owned starter roster/goal templates | Rogue+ maintainers | `user-data/*.json` legacy | Public sample presets; must not masquerade as user saves |
| API keys/secrets | User/service | Secrets manager or ignored local env | Never bundled or committed |

## Build-time reference generation

1. `reference-sources.lock.json` pins upstream Git SHA.
2. `scripts/generate-game-references.mjs` reads only that immutable commit's species enum and nine generation species tables.
3. Generator rejects inconsistent counts, missing IDs and out-of-range costs; historical parity was verified across 572 starters and all names and costs.
4. `npm run build` within `companion/` executes its `prebuild` generator and uses the generated file from `companion/src/reference/generated/` (ignored by Git).
5. The application uses the generated file locally and offline; it never depends on the remote GitHub API during play.
6. Version upgrades require a reviewed change to the lockfile and passing CI.

**CI needs network access** to fetch the pinned official sources. If upstream is inaccessible, fail the build rather than silently use an unknown fallback.

## Follow-up migrations

- Mechanic constants/candy costs and asset metadata remain version-pinned handwritten snapshots. Replace them with verified upstream extractors in subsequent focused changes.
- The existing strategy preset JSONs are public sample strategies, not your stored user-defined Builds. Separate them during UserContent work.
- When the Play module's game revision changes, check reference compatibility explicitly.
