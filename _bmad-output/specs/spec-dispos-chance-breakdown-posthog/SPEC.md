---
id: SPEC-dispos-chance-breakdown-posthog
companions:
  - measurement-contract.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Dispos chance-breakdown measurement in PostHog

## Why

Operators need to know whether people consult the explanation behind a draw chance in **Dispos** and **Équipe**. Session Replay can show the interaction, but SPA overlay heatmaps attribute activity to the page below; a bounded explicit event is needed to filter replays to panels that were actually displayed.

## Capabilities

- **CAP-1**
  - **intent:** A visitor can create one measurement when a requested chance-breakdown panel is actually shown from Dispos or Équipe.
  - **success:** A successful `ChanceBreakdownSheet` opening from an approved caller sends exactly one `chance_breakdown_opened` event; a failed load, blocked overlay, or unavailable chance sends none.

- **CAP-2**
  - **intent:** An operator can distinguish the approved Dispos and Équipe entry points and mobile/desktop presentation of each recorded opening without learning who was consulted.
  - **success:** Each opening has only the bounded dimensions in the measurement contract, including a documented `entry_point` and `presentation=bottom_sheet|dialog`; no target-person data is present.

- **CAP-3**
  - **intent:** An operator can find only the session replays in which a Dispos or Équipe chance explanation appeared.
  - **success:** PostHog Session Replay filtered on `chance_breakdown_opened` and an approved `entry_point` returns the corresponding sessions for any chosen date range.

- **CAP-4**
  - **intent:** An operator can distinguish opening a chance explanation from voluntarily opening its general drawing help.
  - **success:** `chance_breakdown_help_opened` is emitted only when the user activates **Comprendre le tirage en général** from a tracked breakdown, retaining its bounded entry point.

## Constraints

- Use `ProductAnalyticsService` and its whitelisted safe event context; feature components must not call PostHog directly.
- Do not transmit display name, email, target user or participant ID, raw URL, free text, raw chance, factor labels or values, replay content, raw user-agent, fingerprint, or new People properties.
- Emit only after the chance-breakdown request succeeds and the overlay is opened. Do not emit for rejected requests, failed data loads, or an overlay gate refusal.
- Keep analytics a no-op without a configured PostHog key, as it is in local, CI, development, and unconfigured staging.
- The entry-point enum is closed to the approved callers listed in the measurement contract. New `ChanceBreakdownService` callers do not gain telemetry implicitly.

## Non-goals

- Heatmaps or automatic interpretation of reading, scrolling, hover, or gaze inside the overlay.
- A HatCast analytics UI, PostHog dashboard creation, or changes to replay privacy settings.
- Measuring the person whose chance is being viewed or correlating panel openings with their identity.
- Capturing equivalent openings from an unlisted future surface.

## Success signal

An operator can filter PostHog Session Replay by `chance_breakdown_opened` and an approved entry point, then inspect only sessions in which the chance-explanation panel appeared. Event properties remain bounded and contain no consulted-person information.

## Assumptions

- The described mobile bottom-up panel is `ChanceBreakdownSheet`: it opens from a person in the Dispos chance pool and displays draw-explanation statistics.
