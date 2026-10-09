# DEX-REF-CONTRACT — expanded public-fact boundary

Packet 2, authorized 2026-10-09, branch design/profile-candy-overview, draft PR #8. Baseline after verified ART-VERIFY: 111ac96d1427a9ca42a71b9cba05cb56599af361. No merge or production deployment.

## Implemented

Added typed readonly public-fact pack/species/form/ability/move/coverage/provenance contracts and an account-independent index. Known zero, known absence (null/empty), and unavailable with reason are separate states. Species base stats, imported IVs and official move base power are distinct concepts. Declared ability NONE can be null; game aliasing/selection remains derived separately. Official starter-root associations and ordered egg slots require actual reference extraction. Form caught, starter-selectable and obtainable are distinct; this contract stores only official public facts, not account masks.

The index rejects duplicate identities in every table and requires pinned revision/source-path provenance. It accepts partial coverage without fabricating missing records. This helper indexes typed build-generated input; it is explicitly not a general runtime downloaded-pack validator. Existing starter records, importer/storage, facade output and all UI remain unchanged. No populated expanded dataset or search filter is claimed.

## Checks

- `cd companion && ./node_modules/.bin/vitest run`: all 59 tests across ten files passed. Four new synthetic tests cover known absence versus unavailable/zero, duplicate table identities, invalid pin/missing source paths and partial pack lookup without mutation/invented facts.
- `npm run typecheck`: passed. `./node_modules/.bin/vite build`: passed using unchanged existing generated starter data.
- Module-boundary check: 52 source files / ten screens passed. Whitespace and repository validation passed.
- Tracking regenerated, 15 tests and freshness check passed after staging all new paths.
- Existing reference consumers inspected: normalization, scoring/team/fusion names and UI remain on unchanged STARTER_* exports. No additional visual/browser matrix was necessary for an unused pure contract. Packet 1 contains the actual artwork and shared-screen browser evidence.

Reviewed DEX_HANDOFF, DATA_SOURCES, ARCHITECTURE, reference README and DECISIONS; current contract facts updated without changing accepted product decisions. Sources inspected read-only at unchanged game pin: generation-01.ts and pokemon-species.ts. No downloaded code executed. Inspection confirms named constructor fields, separate form constructors, NONE ability aliasing, explicit starter associations and level-move tables; source files remain temporary/public inspection material rather than vendored runtime code.

## Recovery boundary and remaining work

This packet is complete; no task is active after closure. Remaining authorized packets 3–8 stay planned in the sole ledger. The next task is DEX-REF-SPECIES. Before it starts, recommend GPT-6.1 High: extracting nested species/form constructors must preserve enum/form keys, names/localization, base-stat meanings and constructor defaults while rejecting unsupported source expressions without executing game code. The current small contract does not solve that compatibility problem.

Recover the branch using `git fetch origin design/profile-candy-overview && git switch design/profile-candy-overview && git pull --ff-only`; verify actual HEAD against the exact commit recorded in PR #8's recovery section. Read project/tasks.json and relevant source guidance. Next implementation action, after the model checkpoint, is to set DEX-REF-SPECIES in_progress/activeTask, then extend scripts/generate-game-references.mjs with a fail-closed static extractor for pinned species/forms and synthetic malformed/expression/default tests. Do not use the current starter-only regular expressions as a general constructor parser. No extraction or integration has started; no hidden failed application checks remain. Further full UI/real-device/offline/reference-selection checks remain for their applicable packets.
