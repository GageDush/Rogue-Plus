# Rogue+ development tracking

## One editable progress source

`project/tasks.json` owns task status, acceptance results, dependencies, recorded delivery and capability observations. The registry is versioned alongside code. `docs/STATUS.md`, `docs/ROADMAP.md`, `docs/NEXT_TASK.md`, `docs/FILE_MAP.md` and the marked README block are generated views; do not edit them manually.

The registry is an evidence ledger, not a detector of completed features. An AI updates actual results; the generator checks consistency and renders reports. Tests passing cannot prove visual signoff, correct mechanics or deployment parity. URLs and local evidence paths are validated structurally, not authenticated as truthful by the generator.

## Start a task

1. Read AGENTS, generated STATUS/NEXT_TASK, DECISIONS and relevant architecture/design/data contracts.
2. Verify the actual branch/ref and relevant changes against the dated baseline. Do not repeatedly inspect unchanged source or generated dependencies.
3. Select an authorized task with verified dependencies. Keep one active task per branch. Record status `in_progress`, activeTask, working branch and scope.
4. Preserve accepted product intent and private browser state. Approval to implement does not imply approval to merge or deploy.

## Completion procedure (required for every feature)

1. Implement one independently testable task; update its affected paths when necessary.
2. Run appropriate checks. For UI work capture matched states at 320/390px and a considered desktop width; verify the applicable interactions separately.
3. Record each acceptance result as `not_tested`, `pass` or `fail`. Every pass needs a tracked, sanitized evidence document or a public HTTPS evidence URL. Never commit private account screenshots or saves.
4. Review every document in the task's guidance list. Update changed factual guidance in the same PR; record reviewed documents in docsReviewed even when no change was necessary. Do not silently rewrite approved decisions.
5. Mark `ready_for_review` while criteria remain untested or review is pending. Mark `verified` only when every criterion passed, affected guidance was reviewed, and dependencies are verified; record verifiedOn.
6. Clear activeTask after finishing active work. Record PR/merge/deployment separately; never infer production release from verified code or a closed PR.
7. Stage new/deleted tracked paths, then regenerate and validate:

```sh
git add project scripts docs AGENTS.md README.md .github/workflows/project-tracking.yml
node scripts/project-tracking.mjs
node --test scripts/project-tracking.test.mjs
node scripts/project-tracking.mjs --check
git add docs README.md
```

8. Include registry, evidence, guidance and generated reports in the feature PR. Report remaining limits succinctly. CI does not commit on your behalf.

## Record shape and transitions

Task states: planned / in_progress / ready_for_review / verified / blocked. Blocked requires a reason. Authorization is approved / pending and is independent of product-intent approval.

Delivery: not_started / working_branch / pr_open / merged / deployed_verified. PR delivery needs its URL. Merged needs the real merge SHA. Deployed verification needs a full deployed SHA and deployment evidence. Reopen a verified task and reset outdated criteria when later changes invalidate its evidence; retain the old evidence as dated history.

Acceptance records contain id, description, result and evidence. Tasks contain scope, exclusions, class, milestone, dependencies, affected paths, guidance, docsReviewed, authorization and delivery. Dates use YYYY-MM-DD. Dependency cycles, unknown task IDs, missing tracked paths, unsupported enum values and evidence-free completion fail validation.

## Guidance changes and history

DECISIONS owns accepted contracts and unresolved proposals. A material decision change records previous direction, replacement, reason, approval source and affected tasks. The generator never accepts a new decision or rewrites architecture from code guesses.

The original STATUS, ROADMAP and NEXT_TASK editions are preserved in docs/history. CURRENT_STATE and REDESIGN_PLAN are dated audit/proposal evidence. Existing companion/src/architecture JSON audits are historical artifacts, not a second active task ledger. Personal save-editing work, re-encryption and uploading saves to PokéRogue are excluded. Local read-only .prsv analysis and local Rogue+ backup/restore remain supported.

ChatGPT ZIPs are static handoffs. Exported references must name their date, branch and commit; future sessions check the repository rather than assuming uploads update automatically.

## Automation

The project-tracking GitHub Actions workflow runs the Node built-in tests and freshness check on pushes and pull requests with read-only permissions, no companion installation and no upstream network fetch. It can be promoted to a required check separately if repository administration is available; adding a workflow does not itself enable branch protection. Ordinary application checks still apply when application code changes.

FILE_MAP uses the Git index (git ls-files), includes tracked configuration and feature files, and never walks node_modules, generated bundles or private untracked data. Add new tracked paths before regenerating. Outputs are deterministic: no current clock time, running branch name or current commit hash is inserted, so generation does not create endless commit churn.

The README and generated Markdown form the initial dashboard. A richer dashboard can later render this same registry without introducing another writable source of status.
