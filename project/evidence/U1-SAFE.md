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

## User device report — 2026-10-08

User confirmed phone keyboard functionality was tested and worked. This satisfies the reported keyboard interaction subcheck; it does not independently establish every portrait/landscape or camera/browser chrome condition in the broader physical-device criterion.

## Installed iPhone acceptance — 2026-10-09

At 13:33 America/Chicago, the user replied “1–5 pass” to the following Home Screen app checks against the current branch preview:

1. Dex search with Garchomp: Return/Done dismisses the keyboard and results remain accessible.
2. Detail return retains search, filters, List layout and scroll position.
3. Portrait detail final content clears bottom navigation; all navigation controls respond.
4. Landscape detail and More remain accessible without clipped content, overlapping controls or notch-blocked buttons.
5. Returning to portrait keeps the page usable and retains selections.

Evidence is the user's interaction report, not an automated physical-device observation. Earlier supplied portrait/landscape images are private and remain outside Git. This closes the five requested installed-app checks. A separate Safari browser-mode run and larger-text review were not requested in this checklist and remain untested; AC2 retains ready_for_review coverage until its full installed/Safari scope is established. Full offline, backup-validation, privacy and production release gates are unaffected.

The tested branch preview was deployed at 5caad52e8e0780a291802f0408b62b93f3bf79b9. Cloudflare build 613d6f9e-859a-47ef-9492-011af674de3e succeeded on 2026-10-09 at 17:36:39 UTC; subsequent live desktop interaction checks confirmed theme persistence, detail-return search/layout/card focus and restored synthetic starter options surviving reload. Synthetic backup checks are not an actual-user backup restoration signoff. The bundled sample has zero caught-form source bits despite unlocked summary flags, so option availability was checked with a consistent synthetic backup instead. No application code changed during this acceptance update.
