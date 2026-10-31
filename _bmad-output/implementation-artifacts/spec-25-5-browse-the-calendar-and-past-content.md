---
title: 'Browse the calendar and past content'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: 'bd24f91bfde35bed5df6b23c031e62f48954acc7'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Members cannot browse Advent days or revisit permitted discoveries, and the Christmas view is incomplete.

**Approach:** Add a protected calendar and personal history to the existing single Advent journey, including the Christmas presentation and continued access through 15 January.

## Boundaries & Constraints

**Always:** Display days 1–24 and 25 in an ordered four-column grid, including on mobile, with accessible states for played, past unplayed, today, locked future and missing cases; never use color alone. Preserve priority unseen revelation before calendar access. Authorize every read, enforce Paris date and account boundaries server-side, use private no-store responses and prevent sensitive client, service-worker or cross-account cache reuse. On verified isolated development, retain the authorized operator's per-tab simulated date, shared game, and existing personal replay exception; members may explicitly answer an unplayed past day once for zero points. Preserve current test ranking exception and production pending-score secrecy. Apply the isolated Advent visual contracts, Material 3 behavior and French copy.

**Never:** Reveal future content, correct answers, points or derived clues before their authorized time; expose private content in assets, logs or tests. Do not replay celebration on historical views, a second journey, automatic HatCast entry, notifications, production deployment or remote data mutation. Do not add content versioning or locks for the accepted exceptional edit risk.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Played | Before reveal / after reveal | Neutral pending only / personal choice, false statement and points, read-only, without celebration. |
| Past unplayed | Revealed quiz / absent content | Gift, quiz and one explicit late answer with immediate personal result and zero points / “Il n’y a rien ici. Reviens plus tard !”. |
| Publishing | Content appears during its day / after its day | Playable normally until Paris midnight / playable explicitly for zero points after its day. |
| Future | Production UI, direct API or portrait URL | Locked with no future content or hints. |
| Christmas | 25 December–15 January, including zero answers | Christmas message, personal score, decorative Santa and box; calendar and final ranking available; no quiz or automatic opening. Access ends 16 January. |
| Identity and cache | Two accounts, direct navigation, reset or date change | Only the current member's permitted state appears; stale sensitive data is not reused. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — `/v1/advent` membership, isolated operator simulation and session generation; reuse authorization on calendar endpoints.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` — locked server-time evaluation, state, personal results, ranking and private portrait handling; add minimal permitted calendar and past-content projections. `AdventNoStoreFilter.kt` protects sensitive responses.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, `.scss` — single journey, priority reveal, focus, no-store fetches and provisional Christmas state. Reuse `advent-result.scss` and `shared/advent/_foundation.scss` without historical celebration or ordinary replay.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` and `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts` — extend existing game, authorization, clock, portrait, UI and browser coverage with fictional content.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/` — add authorized, consistent calendar and history projections and protected portrait access, preserving reveal, lock, session and operator boundaries.
- [x] `apps/web/src/app/pages/advent-test/` — implement accessible four-column calendar, historical states, missing content and Christmas presentation with navigation and focus, retaining existing journey priorities.
- [x] `services/api/src/test/kotlin/com/hatcast/api/advent/`, `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts` — test the matrix and direct API/URL, two-account and cache boundaries, including real and simulated dates.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md` and Advent contracts as appropriate — reconcile delivered behavior without altering unrelated decisions.

**Acceptance Criteria:**
- Given an eligible member, when browsing the calendar, then each day has an accessible state and only content permitted for that member and server date is readable.
- Given a pending priority revelation, when returning to Advent, then the revelation is shown before calendar navigation and acknowledgment semantics remain intact.
- Given keyboard, screen reader, reduced motion, mobile width and enlarged text, when using the calendar and Christmas views, then navigation, state and content remain usable; Advent styling does not alter HatCast.
- Given the Material 3 checklist M3-1–M3-5, when reviewing the story, then applicable component, theme, responsive, accessibility and copy requirements are met or explicitly recorded as waived.

## Implementation Notes

Patrice validated the local recipe on 2026-10-31. Afterwards the provisional Christmas illustration was replaced with a new Advent-style Santa and the existing La Malice logo; Patrice approved this illustration on 2026-10-31. Mode-test controls, individual closing of a played case, the three header actions and the permitted late-answer flow reflect decisions made during the recipe. Offline Tailscale Serve CORS is corrected for standard HTTPS and port 4200; production configuration is unchanged.

## Spec Change Log

- 2026-10-31: In verified isolated development, an operator may close their own played calendar case without leaving the calendar. The answer and its attempts are cleared with a stale-token fence; no scored replay permission is created, and priority revelation still wins.

- 2026-10-31: User revised past-unplayed cases to allow one explicit zero-point late answer with immediate personal result. Previously played cases open their personal result without celebration. Ordinary reservations crossing Paris midnight remain closed.

## Review Triage Log

- **medium — patch:** Missing and past-unplayed doors have the same visible treatment; add a non-color sign for missing content while retaining the accessible label.
- **medium — patch:** A failure loading the Christmas score after choosing day 25 can leave the calendar and quiz cleared with no reliable retry; keep the calendar and present a retryable error.
- **false:** Historical result replay token is loaded and fenced in `showResult` using both answer state and matching result identity before the result is rendered.
- **high — patch:** A priority result returned by ranking while the calendar is displayed, or by calendar while the ranking is displayed, can remain hidden behind the previous view; close the previous view before presenting it.
- **medium — patch:** Edge-case review independently identified the Christmas score failure and the absence of a safe recovery; same root cause as the Christmas finding above.
- **medium — patch:** HTTP-level late-answer deserialization and zero-point confirmation lack an automated end-to-end controller test; add an authenticated late flow through reconciliation, reservation, confirmation and result.
- **medium — patch:** HTTP projection of an unplayed historical case lacks an automated assertion that the false answer and result are absent; add a controller-level privacy test.

## Verification

Post-review: all five retained findings were fixed. Angular (79 tests), focused H2 server suites including authenticated late-answer and history privacy coverage, four Chromium scenarios and the production build passed again. The Christmas score failure retains the calendar and offers retry, priority results replace previous views, and a missing case has a distinct visible sign.

2026-10-31: 79 focused Angular tests passed; the focused H2 member-game, member-security, date, private-portrait and offline CORS suites passed. Three disposable PostgreSQL tests passed, including additive V79 migration preservation and transaction locking. Four Chromium member scenarios passed; they use mocked APIs. A separate real local H2/Tailscale browser run verified an unplayed past quiz through immediate zero-point result and reopening; another real Tailscale run reproduced and then confirmed correction of the HTTP 403 on quiz reconciliation. A local production PWA build with an active service worker was exercised with two fictional accounts: account-specific calendar state differed, sensitive responses were private no-store, and no /v1 entries appeared in Cache Storage. Patrice approved both the local recipe and the newer Christmas illustration.

Mobile, reduced-motion, keyboard semantics, 200% text and responsive overflow were checked in the existing browser scenarios, and 390px screenshots and videos were inspected. At 320 px, the 25 door controls had accessible names and measured at least 63 × 72 px with no horizontal overflow; 200% text also had no horizontal overflow. Measured text contrast for past, current and locked door samples was 8.37:1, 8.92:1 and 6.47:1 respectively. A comprehensive hands-on screen-reader and full-surface contrast audit was not performed; automated names, role semantics and state labels are not a substitute for a full assistive-technology audit. Patrice explicitly accepted documenting this screen-reader limitation for this story. Production deployment and live production data were not tested. The production build succeeds with existing Sass deprecation and CSS-budget warnings, including the Advent stylesheet. The exact Logo source is the existing La Malice site asset.

Run focused Advent game, security, portrait and date tests including disposable PostgreSQL where applicable; Angular unit tests and production build; Playwright against real local API with fictional users, two accounts and no-store checks. Inspect 320 px, enlarged text, keyboard, screen-reader semantics, reduced motion, contrast, Advent isolation and 25 December/15–16 January boundaries. Record actual coverage and provide a recorded demonstration.
