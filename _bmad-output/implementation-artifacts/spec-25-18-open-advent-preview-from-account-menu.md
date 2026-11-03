---
title: 'Open the private Advent preview from the account menu'
type: 'feature'
created: '2026-11-03'
status: 'in-review'
route: 'dispatch'
baseline_commit: '3c2f7a86a828a6b9dca21dca6c04b2a375164911'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The installed PWA has no address bar for entering the private production preview URL.

**Approach:** Offer Patrice and Toinou an account-menu entry, “Prévisualiser l’Avent”, opening the existing private preview.

## Boundaries & Constraints

**Always:** Determine visibility through server authorization using the existing verified identity, configured identities and active membership checks. Deny silently when authorization or networking fails. Clear capability on identity change and reject stale responses. Retain authorization on every sensitive request, private no-store behavior and existing personal preview semantics. Use the shared Material account menu on mobile and desktop. Preserve the Advent surprise for ordinary members before opening. Apply `docs/v2/technical/FRONTEND_UI.md`, Advent DESIGN, EXPERIENCE and AD-7.

**Never:** Hard-code identities in the client; grant access through the link alone; simulate time, enable isolated test controls, reset shared data, or alter other members' answers. Do not deploy or modify production data.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Authorized organizer | Server confirms preview capability | Menu entry opens `/avent?preview=1` | Existing preview authorization remains effective |
| Ordinary member | Capability denied | No Advent menu entry or cue | Silent |
| Request fails | Network error, unauthorized, missing configuration | Entry hidden | Silent and fail closed |
| Account changes | Earlier capability request resolves late | Previous capability is cleared and cannot affect new account | Ignore stale result |
| Direct access | Unauthorized account requests preview | Existing server checks deny preview | No sensitive content |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts`: shared Material menu items, used by member mobile/rail and seasons list. Add link using Angular router query parameters.
- `apps/web/src/app/core/auth/auth-api.service.ts`: reactive session identity; scope capability requests to current identity and invalidate on changes.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt`: `session`, `authorize`, `canPreview` implement existing authorization. A lightweight capability endpoint can reuse them without `game.session()` initialization. Maintain no-store response policy.
- `apps/web/src/app/pages/advent-test/advent-test.ts`: existing `preview=1` handling and per-request preview header; preserve it.
- `apps/web/src/app/shared/user-account-menu/user-account-menu-items.spec.ts`, `member-account-menu-trigger.spec.ts`, Advent controller tests: cover actual behavior and account transitions.
- `ARCH.md`, Advent UX contracts: document the additional entry point and preserve established privacy and visual constraints.

## Tasks & Acceptance

**Execution:**
- [ ] Add a lightweight server capability check using the existing preview authorization and no-store policy, without initializing or mutating a game session.
- [ ] Add the shared account-menu entry with account-scoped, fail-closed capability loading and stale-response protection.
- [ ] Test authorization, denial, errors, identity changes, late responses, navigation and existing sensitive API protection; verify mobile and keyboard menu use.
- [ ] Update relevant normative documentation for the new entry and record Material 3 checklist results.

**Acceptance Criteria:**
- Given either authorized account, when its user menu opens, then the private preview is reachable without entering a URL.
- Given an ordinary member or unavailable authorization, when the user menu opens, then it shows no Advent entry or error.
- Given an account switch or logout, when an earlier request completes, then it cannot expose the entry to the new account.
- Given an unauthorized direct request, when preview content is requested, then the server still denies it.

## Implementation Notes

- The capability is rechecked when the menu opens and each request is scoped to the current identity generation. Failed requests hide the entry silently.
- Material 3: existing Material menu and French label reused; keyboard navigation and a 375 px viewport were verified in Chromium with intercepted fictional API responses. The measured menu item height was 43.3 CSS px, within the documented 40 px minimum but below the preferred 48 px; this is a story-specific waiver for the existing menu density. No global theme or Advent styles changed. Dialogs and tabs are not applicable.
- Real installed PWA, actual production identities and deployment remain unverified. The story is recorded in the epic and the controller-owned sprint tracker with status review.


## Spec Change Log

## Review Triage Log

- medium — Capability did not refresh after network recovery or server-side revocation; fixed by checking on every menu opening and invalidating overlapping requests.
- medium — Mocked identity generation left real session transitions untested; added an integration test with the real authentication service.
- medium — Seasons-list test stubs omitted the new session signals; corrected and tested.
- false — Navigation from the account menu within `/avent` could fail to activate preview: the account menu is excluded by the member navigation visibility rules on this route.
- low — Real mobile PWA and keyboard behavior lacked browser evidence; Chromium verified the mobile viewport and keyboard with fictional intercepted API responses; installed PWA and real accounts remain unverified.
- maybe-false — A pre-existing stale authentication request could restore a session after cache invalidation; assessing the authentication lifecycle independently requires a separate investigation and is not established by this diff.


## Verification

- `AdventMemberSecurityTest` passed; targeted Angular suites passed (38 tests after review corrections), and the web build passed after corrections.
- Chromium at 375 × 812 with fictional intercepted API responses: menu opened by keyboard, preview link received focus and Enter navigated to `/avent?preview=1`. This does not prove a real installed PWA or server authorization on production.
- `git diff --check` passed. The browser development server used for this check was stopped.


Run targeted API and Angular tests, a web build and `git diff --check`; verify the menu on a mobile viewport and report whether an installed PWA and real accounts were tested.
