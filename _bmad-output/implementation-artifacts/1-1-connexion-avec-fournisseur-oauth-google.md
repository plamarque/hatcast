# Story 1.1: Sign in with Google (OAuth)

Status: ready-for-dev

<!-- Validation: optional — run create-story validate action before dev-story. -->

## Story

As an unauthenticated user,  
I want to sign in with “Sign in with Google” (or equivalent),  
so that I can access HatCast without creating a new HatCast-specific password.

## Acceptance Criteria

1. **Happy path:** Given an unauthenticated user on the sign-in experience, when they choose Google sign-in and complete the OAuth flow successfully, then an application session consistent with the project’s auth model is established and they are taken to the signed-in experience (home or intended return route).
2. **Failure / cancel:** Given the provider flow fails or the user cancels, when control returns to the app, then a clear, user-safe message is shown (NFR-I1) without leaking sensitive implementation details (NFR-S1).
3. **Token / session handling:** Sessions or tokens are handled according to current security practices for the chosen stack (NFR-S1) — no long-lived secrets in localStorage without an explicit product/architecture decision.

## Tasks / Subtasks

- [ ] **Scope gate (mandatory first):** Confirm whether this increment targets (A) the **current production stack** (Vue 3 + Firebase Auth — see root `PLAN.md`, `ARCH.md`) or (B) the **V2 target stack** (Angular 21 + Spring Boot + PostgreSQL — see `_bmad-output/planning-artifacts/architecture.md`). If both docs conflict and no ADR resolves it, record the decision in an ADR or `PLAN.md` before large code changes.
- [ ] **Track A — Legacy Vue + Firebase (brownfield):**
  - [ ] Verify end-to-end: `signInWithGoogle()` in `legacy/src/services/firebase.js`, UI entry in `legacy/src/components/AccountLoginModal.vue`, post-login routing and `authState` behaviour in `legacy/src/services/authState.js`.
  - [ ] Align UX copy and error mapping with AC (popup closed, popup blocked, account-exists-with-different-credential, generic failures).
  - [ ] Ensure audit hooks remain consistent (`AuditClient.logLogin` / failure actions) with `docs/technical/GOOGLE_AUTH_SETUP.md`.
  - [ ] Extend or add Playwright coverage if gaps exist (e.g. visibility of Google entry point, mocked or documented limitations for real OAuth in CI).
- [ ] **Track B — V2 Angular + Spring (greenfield / parallel app):**
  - [ ] Follow `_bmad-output/planning-artifacts/architecture.md` § Authentication: Google OAuth + email/password; industry-standard SPA↔API session or JWT (finalize via ADR).
  - [ ] Implement Google OAuth on the API (authorization code or equivalent; server-side validation of tokens); expose login/session contract documented in OpenAPI when the API exists.
  - [ ] Angular client: “Sign in with Google” using official Google Identity / OAuth patterns aligned with Material primary actions; map errors to Material snackbar/dialog per architecture error guidelines.
  - [ ] Coupled deploy awareness (NFR-R1): client and API revisions must not drift — see architecture “Coupled deploy” section.

## Dev Notes

### Scope and brownfield reality

- **Product outcome** is FR1 (`prd.md`), with NFR-I1 and partial NFR-S1 (`epics.md` Story 1.1).
- **Repository today:** Google sign-in is **already integrated** via Firebase (`GoogleAuthProvider`, `signInWithPopup`) in `legacy/src/services/firebase.js` and wired from `AccountLoginModal.vue`. Treat this as **reference implementation** for Track A, not as proof that every AC is covered by tests or docs.
- **Planning architecture** describes a **future** Angular + Kotlin/Spring + PostgreSQL stack and a phased Firebase migration. Do **not** assume a big-bang rewrite is in scope for this single story unless explicitly decided.

### Architecture compliance

| Source | Relevance |
|--------|-----------|
| Root `ARCH.md` | As-is stack: Vue SPA, Firebase Auth, `firebase.js`, `authState.js`. |
| `_bmad-output/planning-artifacts/architecture.md` | Target V2: Angular 21, Material, Spring Boot REST, PostgreSQL, OAuth/session ADR. |
| `AGENTS.md` | Normative docs vs code; update SPEC/DOMAIN/ARCH when behaviour changes. |
| `docs/technical/GOOGLE_AUTH_SETUP.md` | Firebase console steps, domains, user flow — keep in sync if behaviour changes. |

### Technical requirements (guardrails)

- **Do not** introduce a second parallel auth stack in the same SPA without an explicit migration plan (strangler / feature flag / separate host).
- **Error messages:** Reuse existing `cleanError` pattern in `firebase.js` (user-facing French strings, stable `code` for analytics/audit where applicable).
- **Security:** Avoid logging access tokens; existing code logs uid/email at info — keep PII handling aligned with audit helpers (`AuditClient.obfuscateEmail` where applicable).
- **NFR-I1:** User-visible failures must be actionable (e.g. popup blocked → explain enabling popups).

### Library / framework requirements

- **Track A:** `firebase` auth APIs already in use — stay on supported Firebase JS SDK patterns used in repo; no speculative migration to modular v9+ style unless repo already standardizes it (check existing imports in `firebase.js`).
- **Track B:** Angular 21 + Angular Material per planning architecture; Spring Security or equivalent for OAuth — exact libraries to be fixed in ADR / backend scaffold story.

### File structure (Track A touchpoints)

- `legacy/src/services/firebase.js` — `signInWithGoogle`, `signUpWithGoogle`
- `legacy/src/components/AccountLoginModal.vue` — Google button, loading/error, audit
- `legacy/src/services/authState.js` — session lifecycle after sign-in
- `docs/technical/GOOGLE_AUTH_SETUP.md` — operator-facing setup
- `tests/auth.spec.js` — extend if asserting Google entry (data-testid for Google button if missing)

### Testing requirements

- **Playwright:** Prefer stable selectors (`data-testid`); document if real Google OAuth cannot run in CI (use mocks or smoke-only).
- **Vitest:** Only if extracting pure helpers (e.g. error code → message mapping).
- **Manual:** Verify on `localhost` with Firebase project where Google provider is enabled; confirm authorized domains in Firebase Console match `GOOGLE_AUTH_SETUP.md`.

### Previous story intelligence

- Not applicable — first story in Epic 1.

### Git intelligence (recent commits)

- Recent work is mostly docs/planning and tooling; no conflicting auth refactors in the last five commits. Auth behaviour should be validated against **current** `main`, not assumed from commit titles alone.

### Latest technical notes (Track A)

- Firebase Auth Google provider uses popup flow (`signInWithPopup`). Alternatives (redirect) would be a deliberate change — document if product requires it (e.g. mobile Safari quirks).

### Project context reference

- No `project-context.md` in repo root; use `ARCH.md`, `SPEC.md` (auth-related sections), and `DOMAIN.md` for vocabulary.
- BMad planning artifacts live under `_bmad-output/planning-artifacts/`.

## Dev Agent Record

### Agent Model Used

_(To be filled by dev agent)_

### Debug Log References

### Completion Notes List

### File List

## Story completion status

- **Status:** ready-for-dev  
- **Note:** Ultimate context engine analysis completed — comprehensive developer guide created. Resolve **Track A vs Track B** before implementation to avoid wrong-stack work.
