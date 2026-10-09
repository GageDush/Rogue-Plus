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

## Artwork transport verification

ART-VERIFY uses the unchanged immutable asset pin and exercises real CORS-compatible JSON/PNG fetching and pixel decoding separately from synthetic failure tests. Image metadata alone is not evidence that artwork rendered. Shared sprite rendering now checks PNG decode/dimensions and exposes a readable ID fallback for missing/failed artwork; failed session-cache entries can retry on later mounts. See project/evidence/ART-VERIFY.md for exact browser coverage and limits. This is not an asset-pin update, a complete licensing audit, or proof of cold-start offline availability.

## Expanded Dex reference contract

`reference/dex-contract.ts` defines a bundled-only public-fact boundary: species/form identities, named reference IDs, base stats/BST, declared ability slots, ordered egg moves, level-move entries, explicit starter associations and per-area coverage/provenance. `ReferenceValue` distinguishes known facts (including null, empty lists and zero) from unavailable facts with a reason. Starter-selectable/obtainable facts and selection coverage are separate from caught/unlocked account masks. Base move power, species base stats and imported IVs remain distinct. The build-pack index rejects duplicate identities and unpinned provenance; it is not a downloaded-pack validator.

This packet adds contracts and synthetic index tests only. The current generated starter roster remains unchanged; the expanded contract is not populated or connected to Dex search yet. Exact parser syntax, runtime reference updates and account compatibility remain later work. See project/evidence/DEX-REF-CONTRACT.md.
