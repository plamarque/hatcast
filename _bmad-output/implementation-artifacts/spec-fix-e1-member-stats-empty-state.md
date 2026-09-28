---
title: 'Accept no-participation state in member stats E2E'
type: 'bugfix'
created: '2026-09-28'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The staging-release E2E check for Mes Stats rejects the valid
no-participation page introduced by the active-seasons feature. This blocks a
release even though the page correctly guides a member who has no season.

**Approach:** Extend only the E2E success assertion to recognize the existing
“Aucune saison disponible” state alongside the KPI and existing empty-stats
states.

</frozen-after-approval>

## Implementation Notes

- Extended E1-MEM-020 only: it now accepts the existing no-participation
  heading, without changing the fixture or member-stats runtime behavior.
- Kept the E2E gate meaningful by checking the no-participation guidance and
  its troupe-list destination; aligned the E1 test design with that state.

## Review Triage Log

- medium — The E1 test design omitted the valid no-participation state; updated
  its E1-MEM-020 acceptance assertion to retain documentation/test parity.
- medium — The heading-only assertion could accept incomplete guidance; added
  assertions for the explanatory text and the /troupes CTA destination.
