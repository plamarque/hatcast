---
title: 'Restore the personal Christmas summary'
type: 'bugfix'
created: '2026-11-07'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Show each member their personal score and available rank on the actual Christmas recap, including zero scores and excluded or unranked members, without inventing a rank. Preserve the existing podium, priority reveal, provisional preview, confetti, privacy and navigation. Supply a local fictional ranking recipe so the user can inspect the populated podium and personal summary.

</frozen-after-approval>

## Implementation Notes

The recap displays the ranking response's score and nullable rank, including a zero score and unranked excluded operators. Corrected fictional fixtures to identify the current player and removed a fabricated first place in the empty fixture. Local isolated test controls offer the existing fictional podium variants without altering shared scores. The mockup itself does not contain the personal panel; the experience contract requires the score and the user requested the rank.

Verification: 228 Angular component tests passed; the Chromium fictional ranking journey passed with mocked API data, including personal score and rank. Local seed authentication, authorized test capability, simulated clock, ranking endpoint, front, proxy and Tailscale route were checked separately.

## Review Triage Log

- medium — The zero-score fixture fabricated rank one; changed to null.
- medium — A populated local podium required a usable recipe; enabled the existing isolated test controls and verified their server capability.
- medium — A positive score loaded via the calendar needed direct coverage; added a component assertion and exercised the fictional podium journey in Chromium.
