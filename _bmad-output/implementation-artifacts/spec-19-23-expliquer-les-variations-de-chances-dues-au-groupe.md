---
title: 'Explain group effects on draw chances'
type: 'bugfix'
created: '2026-11-14'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A replay adjustment can increase a candidate's displayed chance because other candidates are penalized, while its label falsely says that the candidate played the previous event. Historical snapshot reconciliation can also assign an unrelated delta to a factor.

**Approach:** Explain replay adjustments truthfully for the target and for group effects, and label any snapshot reconciliation independently. Preserve draw weights, probabilities, policy, access, and historical recorded values; no precision change.

</frozen-after-approval>

## Implementation Notes

- Added a group-effect label for a target who did not hold the previous role.
- For recorded draw odds, current factor details are omitted and a snapshot line shows the recorded difference from the currently calculated reference. This avoids claiming present-day factors caused the historical odds. The historical pool reference and rank remain a separate limitation.
- Verified `./gradlew test --tests 'com.hatcast.api.availability.draw.ChanceBreakdownCalculatorTest' --tests 'com.hatcast.api.availability.draw.ImmediateReplayFactorTest'`: BUILD SUCCESSFUL.

## Review Triage Log

- Medium, defer: the reference for a recorded draw uses the current pool, which may differ from the historical snapshot; resolve along with historical context availability.
- Medium, defer: a historical target chance is ranked against current peer chances, so the resulting rank can combine different contexts.
- Low, reject: when the target did play, the personal history label is factually true; the group effect can be material but the proposed extra wording would add complexity to an already long label.
- Medium, defer: a role-request factor can attribute a pool-wide negative delta to a target with no role requests; this pre-existing related factor is outside the immediate replay correction.

## Mobile Recipe Copy Follow-up

- Use short role labels for past assignments, immediate replay and unfulfilled requests. Show the configured history category when available. Name other candidates explicitly when the target has no personal replay or request adjustment.
- Mobile acceptance approved by Patrice after the demonstration of eight cases. 65 focused Kotlin tests passed before local integration.
