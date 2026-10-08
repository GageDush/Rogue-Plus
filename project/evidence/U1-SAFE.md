# U1-SAFE — device safe areas

Authorized by the user after review of installed iPhone screenshots on 2026-10-08. Those private screenshots and the backup are not committed.

## Change

Final shared CSS reserves env-based top/bottom/side insets after all legacy overrides. Dynamic viewport height is used with existing 100vh fallback. Header and content gutters respond to phone/desktop breakpoints. Both themes reuse the same layout. No data, storage, mechanics or routes changed.

## Verification

Automated regression now simulates 59px top/34px bottom portrait insets at 320/390px in both themes across the five primary routes; landscape checks simulate side insets at 844x390. These are regression fixtures, not measurements of every device. CI results must be inspected at the resulting commit. Physical installed iPhone/Safari, keyboard, larger text and actual last-row clearance are not_tested.

## Delivery

Draft PR #8 on design/profile-candy-overview. Cloudflare branch preview automatically builds this branch with the corrected companion-only build command. Preview is separate from production; no merge authorized or performed.

## Passed checks and preview observation

Implementation commit: 334a5c23a94840003c77e3d9f29b1a2f1a989a0c. Local build/typecheck, module boundaries, repository validator, 15 tracking tests and generated-report freshness passed. GitHub companion baseline, UI regression (including simulated safe-area checks) and tracking all passed:

- https://github.com/GageDush/Rogue-Plus/actions/runs/37861879125
- https://github.com/GageDush/Rogue-Plus/actions/runs/37861879122
- https://github.com/GageDush/Rogue-Plus/actions/runs/37861879019

Cloudflare build f3f44bac-539d-41fe-a01d-1400cbe75949 succeeded for that commit. Public preview opened successfully and loaded assets/index-BfLMlHa-.css, matching this build. Desktop browser reports zero native top inset, so this confirms deployed stylesheet and runtime, not physical camera clearance.

Preview: https://design-profile-candy-overview-rogue-plus.gagedush-bff.workers.dev/

AC2 remains not_tested; task remains ready_for_review. Production remains unchanged.
