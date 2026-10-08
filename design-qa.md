# U1 theme-foundation design QA

Scope: shared light/dark/system foundation and representative Home/Dex bridge. This is not the full downstream per-page redesign or production release.

Source visual truth: docs/assets/u1-selected-reference.jpg (normalized from the user-selected warm field-guide image, originally 1328×1184px; two screens). Implementation: docs/assets/u1-home-light.jpg, u1-home-dark.jpg, u1-dex-light.jpg and u1-appearance-dark.jpg. Browser renders used a 390×844 CSS iframe at 1× density, plus 320×844 and 1330×844 checks. Captures were cropped from 1363×936 browser screenshots to the app-owned 390×844 content. No device chrome was included.

Full-view comparison: docs/assets/u1-home-comparison.jpg. The reference's Home half was uniformly scaled to 390px width, retaining its approximately 733px height; implementation remains 844px. These are deliberately different synthetic collections: the reference uses illustrative 340/572 and baseline-only data; application uses the existing eight-species demo with two real synthetic deltas. This is a hierarchy/palette comparison, not a same-data pixel-parity claim. Focused typography/header/metrics/row regions were directly inspected within that comparison; no extra crops were required to read them.

## Required surfaces

- Typography: 16px base, 14px controls/support, 12px metadata, system fallback for preferred Source Sans 3/Rubik names; headings/numbers are bold. Self-hosted font packaging remains follow-up, not silently network-loaded.
- Spacing: open 2×2 collection metrics, three primary action rows before change history/preset, comfortable search/filter rail, five fixed mobile tabs. Existing data determines content heights; full feature density refinement remains U2–U4.
- Colors: warm ivory/ink and near-black/slate use one semantic token contract. Text/secondary/semantic foregrounds measured at least 4.78:1 against light canvas and 7.51:1 against dark canvas. Orange fill uses dark ink; text accent has independent readable colors.
- Assets: exact original matte R+ PNG on an intentional dark tile; existing pinned sprite resolver retained. No regenerated brand or substituted Pokémon art. Missing-art fallback remains functional.
- Content: persistent sample label, honest bundled preset label, actual counts/rankings preserved, all six real Dex filters retained. Generated type badges are intentionally deferred because current records lack type fields; no fabricated types.

## Comparison history

Initial review found hidden More text at 390px, hard-coded monospace metric labels, a potentially crowded detail header, and clipping risk for long totals. Fixes: restore More label, apply body font, hide redundant brand text on detail, allow KPI wrapping, and reduce narrow-header padding. Follow-up browser checks confirmed detail and all five destinations fit 320px in light mode; all five also fit in dark. Representative 390px captures and 1330px composition reviewed.

## Interactions / errors

Cloud browser verified Light/Dark pressed state, System selection, explicit dark persistence across reload, keyboard Tab moving Light → Dark, Home/Dex/Build/Run/Goals, Dex search/filter/detail/back, and desktop settings. Unit checks additionally cover OS changes, storage denial, cross-tab updates, legacy media listeners and early bootstrap agreement. CI-only isolated theme checks cover account reset independence and both modes at all three widths; their result is recorded separately in U1 evidence.

Console inspection found browser-extension metadata errors; no observed application error. Physical iPhone/Safari, full backup validation, offline update release and full mockup parity remain outside this packet.

Follow-up polish: package fonts locally and complete downstream page compositions without inventing reference-backed data.

final result: passed
