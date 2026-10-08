# Rogue+ agent instructions

## Start here

Read this file, docs/STATUS.md, docs/NEXT_TASK.md, docs/DECISIONS.md and the authorized task in project/tasks.json. Then read only relevant architecture/design/reference guidance and changed source. docs/CURRENT_STATE.md is a dated audit, not a live progress source; docs/REDESIGN_PLAN.md is a dated proposal. If the recorded branch baseline changed, review its relevant diff before reusing conclusions.

Current user instructions control scope. Inspected source and actual checks establish implemented behavior; accepted decisions establish product contracts. The pre-chat Rogue+ handoff/repository guidance is the product baseline. The selected warm field-guide Home/Dex direction and U1 light/dark foundation were approved 2026-10-08; see DECISIONS. Approval of a direction does not approve unrelated feature packets. Project tracking was authorized separately. Merge and deployment need separate authorization.

## Preserve contracts

- Mobile-first, local-first React/TypeScript/Vite companion, Cloudflare Workers host; no rewrite or dependency on optional Play.
- Read-only local .prsv import/decryption/validation/normalization and Rogue+ backup/restore. No re-encryption, edited game-save export, uploads to PokéRogue or save-upload API.
- Target independent profile AccountState, RunState and cross-profile UserContent. Multiple profiles, Inventory/rules-legal Sandbox Builds and individual Build sharing are accepted future requirements, not shipped capabilities.
- Primary Home/Dex/Build/Run/Goals; secondary Trainer/History/Fusion/Modules/Import & Settings. teams/hunt/changes internals are aliases.
- app owns composition; features do not import other features; domain stays pure; import owns raw decoding; storage owns versioned persistence; reference owns pinned public facts; ui owns reusable primitives/artwork. Reuse domain facade and sprite resolver.
- No mechanics, score weights, reference pins, schema/storage keys or routing changes inside a presentation packet. Guest Play stays separately versioned/gated.
- Preset is not active run; unknown is not zero; derived ranking is not game fact. Use source/visual/interaction evidence labels accurately.
- Never commit real saves, private account facts/backups/screenshots or secrets. Use synthetic fixtures. Filename scanning is not a content/history review.

## Mandatory task workflow

One approved, independently testable task per packet. Set status in_progress and activeTask before work. Record actual acceptance results/evidence, review all affected guidance, and update factual docs in the same PR. Material decision changes require DECISIONS records with approval source; never silently adopt proposals.

Use ready_for_review while criteria or signoff are pending. Verified requires all criteria passed with evidence, all dependencies verified, all declared guidance reviewed and verifiedOn recorded. Record working branch/PR/merge/deployed SHA separately. Clear activeTask after active work. Do not claim unrun checks passed or preview work released.

Stage new/deleted paths before running the generator. Run:

```sh
node scripts/project-tracking.mjs
node --test scripts/project-tracking.test.mjs
node scripts/project-tracking.mjs --check
```

Include project/tasks.json, sanitized evidence, changed guidance and generated docs/README in the PR. Do not edit generated STATUS/ROADMAP/NEXT_TASK/FILE_MAP or the README progress block manually. See docs/PROJECT_WORKFLOW.md for commands and schema. An AI closing message alone does not complete a task.

## Verification and efficiency

Use rg; avoid repeated unchanged-file reads, node_modules/dist/generated-reference/vendored exploration. Existing application checks: repository privacy validator, module-boundary check, companion test/typecheck/build. Run checks appropriate to the change; tracking-only work uses built-in Node tests and no app install.

For authorized UI work inspect matching states at 320/390px and a considered desktop width; test applicable long content, empty/loading/error/partial data, artwork fallback, focus and real phone interactions. Source, screenshots and interactions prove different things.

Release/migration gates include failed-load preservation, strict backup validation, isolated actual-user backup restoration, privacy/history review, offline update/device checks and approved rollback/rollout. Legacy v2 data remains recoverable. Do not merge the Play experiment into the companion stack incidentally.
