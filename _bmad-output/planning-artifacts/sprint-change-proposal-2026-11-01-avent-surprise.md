# Sprint change proposal: Advent surprise and production preview

Status: Approved by Patrice for implementation — 2026-11-01

## Trigger and objective

Patrice wants to deploy the Advent code before 1 December without revealing the surprise, while Patrice and Toinou check the actual production portraits, questions and result text. Development and production use separate databases, so a staging check alone cannot establish which content is present in production. This is a new production access requirement, not evidence of a completed deployment.

## Proposed decisions

- Before 1 December 2026 00:00 Europe/Paris, ordinary member navigation must not reveal Advent: no gift, automatic welcome or Advent-specific error, including network and server failures. Maintain normal date and future-content restrictions for other members after opening.
- Through the direct URL, only Patrice and Toinou, authenticated and authorized by the server with active membership, may open future gifts and inspect actual production content. Knowing the URL grants no privilege. Apply equivalent access protection to portraits, API responses and caches.
- They may submit their own answer and immediately see their personal result and its explanatory text for a future quiz. Their responses and progression may persist in production. A recorded answer remains final; define and test the resulting personal state without enabling replay or deletion commands.
- Their accounts remain excluded from the ranking: their answers must not alter other members' scores or ranks. Their production answers may be included in future participation totals and PostHog; isolated development tests remain excluded. Do not transmit anecdotes, choices, correctness or unrevealed scores to analytics.
- Production continues to reject test resets, replay controls and simulated dates, including for the two privileged users. Access to future content must not move the shared clock or alter other members' state.

## Impact and proposed edits

**PRD FR-1, FR-4, FR-10 and FR-13:** retain the ordinary member and production safety rules; add a narrowly authorized production preview exception for the two accounts, including future answer submission and immediate personal result. Do not call this the existing isolated development test mode. Update privacy and success-signal wording as needed.

**Architecture AD-2, AD-3, AD-4, AD-6 and direct-entry clarifications:** document server-side identity and membership verification, the limited content and result exception, user-scoped persistence, future production answers in participation totals, no shared-clock modification, and continued denial of reset/replay/simulation. Keep future content and results private from all other users. Define how pending-answer secrecy and private portrait access apply to this exception.

**Epic 25 and stories:** add a separately tracked implementation story without rewriting completed delivery history. Reconcile FR-1, FR-4, FR-10 and FR-13 and the production exceptions in 25.1, 25.3a, 25.5 and 25.6. Update backlog 25.9 so production answers by the two excluded ranking accounts can be counted while isolated development tests remain excluded. Ensure 25.7 notifications do not reveal the surprise or affect other members due to the preview.

**UX EXPERIENCE and DESIGN:** describe access through the direct URL, opening future gifts, submitting and viewing the immediate personal result, and the persisted final-answer state. Preserve accessibility, existing Advent visual contracts and isolation from HatCast. An error on ordinary navigation must not identify Advent before launch.

**Operations and delivery:** verify that automated checks actually run and block the relevant delivery path; do not assume change-based test selection provides coverage. Avoid secret content in logs or public release notes before launch. Verify the deployed revision and configuration separately from local test results.

## Acceptance and verification

1. API tests exercise 30 November 23:59:59 and 1 December 00:00 Paris using a controlled server clock in an isolated environment. Verify future content and portraits are refused to ordinary members, including direct requests and manipulated headers.
2. For both authorized accounts, verify access to actual future quiz content, answer submission, immediate personal result and persisted state; verify a third account and unauthenticated or inactive users are denied. Verify one user's result is inaccessible to other members and no shared time or other user state changes.
3. Verify ranking results for ordinary members remain unchanged after both privileged users answer; check production totals can include their answers and development data is excluded when 25.9 is implemented.
4. In production-equivalent configuration, deny reset, replay and simulated-date requests for all users, including privileged accounts. Verify configured production ignores development clock offsets.
5. Browser tests cover ordinary desktop and mobile navigation, refresh, reconnection, automatic welcome and errors including 404, 5xx, timeout and network failure; no Advent cue appears before opening. Verify gift and eligible welcome at opening; cover authorization and the privileged calendar journey.
6. Check sensitive data and cached responses across accounts and sessions; cover notifications, analytics, service worker and relevant release notes. Use synthetic isolated fixtures for automated tests. A human checks the real production content only after an independently authorized deployment.
7. Make the relevant checks mandatory on every change and release path until launch; record what actually ran. Manually check the full local stack and a production-equivalent pre-release environment, then the actual deployed revision and discreet ordinary-member experience.

## Approach and handoff

Recommended: direct adjustment within Epic 25, followed by `bmad-build`; no rollback or MVP reduction. Scope: moderate due to a production privacy exception, cross-artifact changes and delivery gates. Effort: medium to high, estimate to be refined after technical analysis; release is gated by successful verification rather than an assumed duration. Risks include accidental disclosure, cross-account leakage, unintended mutations, incorrect participation totals and stale caches.

Build must settle any implementation details not already decided, update applicable normative documentation and tracking, implement the scoped changes, run meaningful tests and report remaining evidence. This approval does not authorize a deployment or production data operation.
