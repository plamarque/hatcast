---
title: 'Balance mobile navigation spacing'
type: 'bugfix'
created: '2026-11-08'
status: 'done'
route: 'oneshot'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Navigation icons and labels are too close to the top of the mobile bar on the reported Pixel 9 and iPhone 17.

**Approach:** Balance the visual spacing while retaining touch targets and native bottom safe-area handling, and verify mobile renderings including an iPhone simulation if available.

</frozen-after-approval>

## Implementation Notes

- Reduced the existing upward visual offset from 10 px to 4 px; the bottom safe-area padding and full tab targets remain unchanged.
- The 29 member navigation unit tests pass. Chromium and WebKit mobile emulations measured approximately 10 px above the first icon, with zero and an artificially applied 34 px bottom inset. The iOS Simulator was booted but its interface was not accessible; physical-device and dark-theme validation remain pending.
- Follow-up: the user validated Safari on the simulated iPhone and the dark theme on a physical Pixel 9a. The issue is tracked as BUG-112 after an identifier collision on integration.

## Review Triage Log

- Low: no permanent geometry regression test; the small visual adjustment is covered by focused browser measurements, but the existing unit tests do not enforce spacing.
- Medium: the offset needed visual evidence; browser measurements and captures were checked with zero and simulated 34 px bottom padding. Real iOS and Pixel verification remain pending.
