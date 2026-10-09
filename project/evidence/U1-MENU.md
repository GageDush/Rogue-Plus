# U1-MENU — More pop-out and mk3 review

Authorized by the user on 2026-10-08. Inspected mk3 landscape captures and the portrait keyboard/search screenshot; private screenshots are not committed.

## Change

Shared nonmodal navigation pop-out preserves the mounted feature on open/close. Outside pointer, repeated toggle, close button, Escape and focus leaving dismiss it. Close/toggle/Escape restore trigger focus without scrolling; outside click keeps ordinary focus. Destination selection uses existing navigation and closes the panel. Internal scrolling and safe-area bounds keep the slim menu usable on short screens. Header and bottom navigation are compact below 500px height on phone layouts. Search has one outer focus ring; Dex result count uses singular for one result.

## Checks

Local TypeScript and build passed. Browser regression adds open/repeated-toggle/outside/Escape, aria-expanded, page/search/scroll preservation in both themes at 320/390/desktop; landscape menu bounds with simulated camera insets. Existing destination, storage, theme and recovery checks remain. Results require resulting-head CI inspection. Physical iPhone keyboard/landscape menu interaction remains not_tested. No account data, mechanics, storage, imports or cache policy changed.

## Delivery

Draft PR #8 on design/profile-candy-overview; separate live branch preview. No production merge or deploy.
