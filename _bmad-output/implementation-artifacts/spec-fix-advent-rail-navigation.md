---
title: 'Keep desktop navigation usable with the Advent gift'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: 'f312d35de20f3def4ae50d0f146b50c83ea6aaa4'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The desktop gift's Material focus indicator covers the rail and prevents clicking navigation links, blocking the required staging test and member navigation when Advent is visible.

**Approach:** Confine the indicator to its button while preserving the gift's appearance and accessible focus; verify real pointer and keyboard navigation with the gift visible. Record the observed issue and retain all release checks.

</frozen-after-approval>

## Implementation Notes

The desktop gift now establishes its own positioning context. A browser regression covers its focus and a real click on the agenda rail link with the gift visible. BUG-079 records the failure.

Verification: five focused mobile/desktop scenarios passed, including the original failures. A further browser run passed real Tab navigation and keyboard activation, as well as pointer activation of the gift and agenda.

## Review Triage Log

- medium — The first regression used programmatic focus without keyboard activation; it now tests Tab and Enter through the rail.
- medium — The first regression did not click the gift; it now verifies both pointer and keyboard activation.
