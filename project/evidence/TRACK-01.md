# TRACK-01 verification evidence

Verified locally on 2026-10-08 using Node 24.19.0 and Git 2.51.1. This record establishes project tooling behavior, not application runtime or deployment quality. Public fixtures are generic; no actual player data was used.

## Results

- PASS: node --test scripts/project-tracking.test.mjs — 13 tests, zero failures.
- PASS: generation and --check against the seeded 32-task registry and Git-index inventory.
- PASS: an isolated real-Git fixture changes one task to verified and refreshes STATUS, ROADMAP, NEXT_TASK and README; adding a staged source path updates FILE_MAP.
- PASS: each generated report's stale content is rejected; --check leaves files unchanged; regeneration repairs reports and preserves README text outside its marked block.
- PASS: missing acceptance evidence, unreviewed guidance, incomplete/cyclic dependencies, unapproved work, unsupported schema/status, invalid verification dates, missing tracked paths, active-task inconsistency and unsupported delivery claims are rejected.
- PASS: untracked private fixture/dependency files are omitted; fixture source/private bytes remain unchanged.
- REVIEWED: workflow uses read-only contents permission, Node built-in tests and no npm/upstream/game install. Required branch protection has not been configured.
- REVIEWED: original STATUS/ROADMAP/NEXT_TASK/AGENTS retained as dated history; accepted product requirements preserved; visual adoption remains pending and excluded save-write-back scope is explicit.

## Tested tooling fingerprints (SHA-256)

| File | SHA-256 |
| --- | --- |
| scripts/project-tracking.mjs | 8554705af513abc64d83ced92399b353600168fb1cc3bc5693bcba112ea095d9 |
| scripts/project-tracking.test.mjs | cef042c8bcbf171572cd375a5a8fb9870b1ffaa9a3cc0097867d97d6a2c59c6c |
| .github/workflows/project-tracking.yml | 6c00fd0c5d6769a640fb7b2498840679d80336d93a22f7ed4a37c344fe4ae147 |

## Limits

The validator checks recorded evidence structure, not the truth of a remote URL or the meaning of an AI's statement. Deployment status is explicitly recorded with evidence, not discovered automatically. Task counts are work-plan counts, not a percentage of the whole product. GitHub CI results should be checked at the eventual PR head; this local record does not claim remote checks passed. The full app build/test suite was not rerun locally because no app runtime code/dependencies changed.
