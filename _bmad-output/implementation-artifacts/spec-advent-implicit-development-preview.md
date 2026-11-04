---
title: 'Allow implicit future gifts for development testers'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Authorized development testers can open, answer, revisit and personally replay future quiz gifts without enabling test mode, and see a neutral confirmation until their personal result is revealed at Paris midnight after the gift’s day. This capability is implicit and verified server-side on every request; it never enables simulated time, shared reset or the test toolbar. Preserve production and ordinary-member restrictions, current-day secrecy, existing member entry dates, personal isolation and missing-content handling; authorized development testers may open the day 25 recap early. The existing explicit test mode remains available for its other controls. This decision supersedes the mode-on requirement in story 25.19.

</frozen-after-approval>

## Implementation Notes

Reuse the isolated operator authorization `canControl` in `AdventMemberController.kt` as a separate future-gift capability, not as production preview and not as `activeMode`. Update all future quiz, result and personal replay endpoints without permitting shared controls or late-day disclosure. Propagate the existing server-issued capability in `advent-test.ts` for future gift selection, result display and replay, without enabling the test toolbar. Review authorization, session changes, modes, provisional scoring, replay and ordinary/production denial with API, Angular and real offline browser tests. Update relevant Advent UX and architecture documentation and story 25.19 to reflect the user's revised decision; keep all data and the currently running user stack intact until a controlled restart is needed for the correction.

Server authorization now derives future access from the existing isolated operator capability while explicit test controls retain their own guard. The client uses the server-issued capability and exposes personal replay for future gifts. The existing production preview and ordinary member projections remain separate.

Verification: 47 focused API tests, 164 Angular tests and one mocked mobile Chromium scenario including personal replay passed. A real offline H2 browser login verified day 2 is enabled with test mode off without answering it. The stack remains running for human testing; actual cloud development and production were not changed.

## Review Triage Log

- medium — The initial change removed the second-answer HTTP regression; restored the original end-to-end replay sequence.
- medium — The initial change removed another-operator isolation assertions; restored them.
- medium — Ordinary-member mutation denial needed retained assertions; restored existing confirmation and acknowledgement guards, alongside reserve and replay denial.
- medium — Both explicit test mode and implicit future access require coverage; the restored HTTP sequence exercises both.
- medium — The no-mode result and replay UI needed coverage; the mobile Chromium scenario now exercises both with a mocked API.
- low — Dedicated browser coverage for reloading an already-played future gift remains absent; the existing service and previous full-stack revisit cover the underlying path, and the current UI reuses it.
- false — Current-day disclosure and shared controls remain guarded by the existing date and active-mode paths; the API security suite verifies reset and other member boundaries.

Superseding decision: the user approved delayed revelation for development testers; the later delayed-result specification governs this behavior. Earlier implementation and review notes below are historical.
