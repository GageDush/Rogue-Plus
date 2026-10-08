# DOCS-01 verification evidence

Verified locally on 2026-10-08. Documentation and project tooling only; no companion application files are included in this change.

## Acceptance results

- AC1 PASS: README and generated status lead with explicit task counts and navigation. Task acceptance criteria, dependencies, guidance, capability limits and evidence links remain accessible in expandable sections. File inventory is grouped and linked.
- AC2 PASS: inspected SVG renders at 390px width for milestone counts, local account data flow and verification/release distinction. Header rendered at 600px with original R+ bitmap unchanged. Corrected overflowing text before final review. The image includes accessible title/description; Markdown retains corresponding text and counts. Planned storage separation is explicitly labeled planned; no upload or write-back is implied.
- AC3 PASS: Node built-in suite passes 15 tests. Generator determinism, task-count updates, XML escaping, evidence guards and stale Markdown/SVG detection are covered. Regeneration and freshness check pass against the staged file inventory.
- REVIEWED: AGENTS.md, DECISIONS.md and PROJECT_WORKFLOW.md. Workflow updated for eight generated reports and presentation module ownership. Accepted product direction and exclusions preserved.

## Tooling fingerprints (SHA-256)

| File | SHA-256 |
| --- | --- |
| scripts/project-tracking.mjs | 137a523f9ae80eaf7402e5caafb2a977a4d76aada05b33bdc2481bad7c42a4c6 |
| scripts/project-tracking.test.mjs | 959b007399cf0e37fa7b8671ee8f077872c4d1afb7b4070edd9fbc53dd902554 |
| scripts/project-report-layout.mjs | d5c053fc474021203487e994f1f7acaf7be16cf83c6837d5f6e545de45562ec8 |
| scripts/project-illustrations.mjs | 1801367e38e4179df07189458f679c4e7273e7d4ba8c5217a2d179c2a36e4789 |
| docs/assets/rogue-header.svg | 267ed294504b57199a98cfbbf50b0f1b3765400cd1662409ee5fc3ceef5de5e9 |

## Limits

SVG previews were inspected locally with Inkscape; this is not a complete GitHub/browser interaction or accessibility audit. Remote CI must be checked at the resulting PR head. Verified task counts describe this ledger, not total product completion. No merge, deployment, product theme adoption or site redesign is claimed.
