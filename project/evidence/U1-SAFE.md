# U1-SAFE — device safe areas

Authorized by the user after review of installed iPhone screenshots on 2026-10-08. Those private screenshots and the backup are not committed.

## Change

Final shared CSS reserves env-based top/bottom/side insets after all legacy overrides. Dynamic viewport height is used with existing 100vh fallback. Header and content gutters respond to phone/desktop breakpoints. Both themes reuse the same layout. No data, storage, mechanics or routes changed.

## Verification

Automated regression now simulates 59px top/34px bottom portrait insets at 320/390px in both themes across the five primary routes; landscape checks simulate side insets at 844x390. These are regression fixtures, not measurements of every device. CI results must be inspected at the resulting commit. Physical installed iPhone/Safari, keyboard, larger text and actual last-row clearance are not_tested.

## Delivery

Draft PR #8 on design/profile-candy-overview. Cloudflare branch preview automatically builds this branch with the corrected companion-only build command. Preview is separate from production; no merge authorized or performed.
