---
title: 'Open Christmas preview on staging and celebrate'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Allow the existing authorized private preview to open the December 25 Christmas recap early on staging and production, without requiring previous gifts. Keep ordinary members restricted; preserve priority reveals and identify early scores as provisional. Celebrate entry into the Christmas scene with a lively confetti burst, respecting reduced motion and mobile accessibility. Keep podium names; do not associate elf portraits.

</frozen-after-approval>

## Implementation Notes

The authorized preview uses the existing server authorization in both staging and production; ordinary users retain the date gate. The scene uses scoped CSS confetti and respects reduced motion. The podium continues to show names. The intent was amended explicitly by the user to include production preview.

Verification: focused API game and security suites passed; 227 Angular component tests passed; the Chromium podium test passed at mobile and desktop widths, including reduced-motion and animation presence. The browser test uses synthetic API data and does not prove a staging deployment.

## Review Triage Log

- medium — Preview calendar authorization and interaction required coverage; added server security and client click tests, with existing priority handling preserved.
- medium — Confetti could disperse beyond the scene on narrow or wide viewports; constrained the displacement and exercised the responsive scene.
- medium — Advent contracts omitted the new exception and celebration; updated experience, design, and architecture.
- low — The architecture paragraph initially appeared under isolated test ranking; moved it to a separate private-preview section.
