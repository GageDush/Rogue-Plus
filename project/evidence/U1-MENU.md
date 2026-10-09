# U1-MENU — More pop-out and mk3 review

Authorized by the user on 2026-10-08. Inspected mk3 landscape captures and the portrait keyboard/search screenshot; private screenshots are not committed.

## Change

Shared nonmodal navigation pop-out preserves the mounted feature on open/close. Outside pointer, repeated toggle, close button, Escape and focus leaving dismiss it. Close/toggle/Escape restore trigger focus without scrolling; outside click keeps ordinary focus. Destination selection uses existing navigation and closes the panel. Internal scrolling and safe-area bounds keep the slim menu usable on short screens. Header and bottom navigation are compact below 500px height on phone layouts. Search has one outer focus ring; Dex result count uses singular for one result.

## Checks

Local TypeScript and build passed. Browser regression adds open/repeated-toggle/outside/Escape, aria-expanded, page/search/scroll preservation in both themes at 320/390/desktop; landscape menu bounds with simulated camera insets. Existing destination, storage, theme and recovery checks remain. Baseline and tracking CI passed at fe22462f071c166044533709a9045cdb7efbf4ab. The first new UI run exposed a test setup race with smooth scrolling; the test now positions the page instantly before recording its scroll offset and selects the visible desktop sidebar toggle. Final UI CI is checked separately before recording acceptance. Physical iPhone keyboard/landscape menu interaction remains not_tested. No account data, mechanics, storage, imports or cache policy changed.

## Live interaction evidence

The Cloudflare preview at https://design-profile-candy-overview-rogue-plus.gagedush-bff.workers.dev/ was inspected with synthetic sample data. In Pokédex, entering `Ninc`, opening More, repeating the toggle and clicking outside each retained the Pokédex page and search query; the one-result label displayed `1 starter`. The panel was visually inspected in light mode on desktop. Cloudflare build df2a211a-3504-46c6-a184-80b766e34a8e succeeded for e9e0d8dacc4391e66d6c2b86893ed9ca72d008c7; later commits change test setup only. Native iPhone keyboard behavior is not established by cloud-browser checks.

## Delivery

Draft PR #8 on design/profile-candy-overview; separate live branch preview. No production merge or deploy.

## Final automated acceptance

At 41194e623033ac861beb32bda9bd50273fe01c3f, all three workflows passed: Companion baseline (run 37868916782), Project tracking (37868916820), and Companion UI regression (37868916814). UI checks establish repeated-toggle/outside/Escape dismissal, aria-expanded, unchanged page/search/scroll at 320/390/1330px in light and dark themes; safe menu bounds at 844×390 with simulated camera insets; existing destination navigation, backup/restore, reload and recovery. Local tracking tests passed 15/15 and generated reports passed freshness. AC1 and AC2 pass within these automated criteria. Physical iPhone keyboard, camera and browser chrome behavior remains a separate device review limitation; U1-SAFE retains its physical-device gate.

CI: https://github.com/GageDush/Rogue-Plus/actions/runs/37868916814
