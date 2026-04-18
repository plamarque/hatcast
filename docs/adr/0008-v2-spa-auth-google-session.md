# ADR-0008: V2 SPA authentication — Google OIDC and server-side sessions

- **Status:** Accepted
- **Context:** The target stack ([`_bmad-output/planning-artifacts/architecture.md`](../../_bmad-output/planning-artifacts/architecture.md)) is an Angular SPA (`apps/web/`) calling a Kotlin Spring Boot API (`services/api/`) on Google Cloud Run, with PostgreSQL (Neon). FR1 requires “Sign in with Google” without relying on Firebase Auth for V2. The PRD also requires email/password, password reset, and long-lived sessions (FR2–FR5); this ADR focuses on **Google** only; local credentials and reset will be covered by follow-on ADRs or the same session mechanism once email/password is implemented.

- **Decision:**
  1. **Google sign-in (OIDC):** Use Google’s **OAuth 2.0 / OpenID Connect** with an **OAuth 2.0 Client ID** (type **Web application**) created in **Google Cloud Console** (APIs & Services → Credentials). No Firebase Auth and no GCP Identity Platform are **required** for this path; the ID tokens are issued by Google (`iss` = `https://accounts.google.com`) and validated by the API using Google’s JWKS.
  2. **Browser → Google:** Obtain a Google **ID token** (JWT) in the browser via **Google Identity Services** (GIS) / FedCM-capable flows, using the **same** Web client ID as configured for the backend `aud` validation.
  3. **Browser → API:** Send `POST /v1/auth/google` with JSON body `{ "idToken": "<JWT>" }` (see [`services/api/openapi/auth.yaml`](../../services/api/openapi/auth.yaml)).
  4. **API validation:** Spring (or equivalent) validates the ID token: signature (JWKS), issuer, audience (`aud` = Web client ID), expiry, and (as needed) hosted domain / `email_verified` policy. On success, **upsert** the user record in PostgreSQL (subject identifier = stable Google `sub` + email).
  5. **Session model:** Establish a **server-side session** (opaque session ID), persisted server-side (e.g. Spring Session backed by JDBC or Redis — implementation detail), and return it to the browser as an **`HttpOnly` + `Secure` + `SameSite=Lax`** cookie (name to be fixed in implementation, e.g. `HATCAST_SESSION`). **Do not** store access tokens in `localStorage` for session establishment (NFR-S1 alignment).
  6. **Authenticated requests:** The SPA sends cookies automatically for same-site requests to the API origin; API routes require a valid session unless public.
  7. **CSRF:** For state-changing requests from the SPA that use cookie authentication, use a **defense in depth** strategy: `SameSite=Lax` for the session cookie, plus either **Double Submit Cookie** (synchronizer token exposed to JS and sent in `X-CSRF-Token`) or **Spring Security’s CSRF** integration for SPA patterns — exact wiring is an implementation detail, but the choice must be documented in the security configuration when code lands.
  8. **CORS:** The API allows **credentialed** requests (`Access-Control-Allow-Credentials: true`) only from **explicit** Angular origins (dev: `https://localhost:4200` or tooling default; staging/prod: GitHub Pages / custom domain per environment). Wildcard `*` is forbidden with credentials.
  9. **API versioning:** Auth and domain endpoints live under **`/v1/...`** to match the product REST baseline.
  10. **Deployment coupling (NFR-R1):** CI must deploy SPA and API together when either changes the auth contract or cookie/CORS behaviour; version skew between client and `/v1` contract is avoided by coordinated releases.

- **Consequences:**
  - **Positive:** Familiar pattern for Spring; easy server-side logout (session invalidation); no long-lived JWT in browser storage for the HatCast session; Google tokens are short-lived and only handled during login.
  - **Negative:** Requires careful CORS + cookie + CSRF configuration; cross-domain hosting (SPA on one origin, API on another) must use explicit allowed origins and consistent HTTPS.
  - **Operational:** OAuth Web client must list correct **JavaScript origins** and (if redirect flows are added later) **redirect URIs** per environment.

- **Alternatives considered:**
  - **HatCast-issued JWT access/refresh tokens after Google login:** Rejected as the default for V1 of V2 auth — more moving parts (refresh rotation, revocation lists) while the product already wants server-enforced sessions for “stay signed in” semantics; can be revisited if scale or multi-service mandates stateless APIs.
  - **Authorization Code + PKCE only (no ID token POST):** Valid and common; rejected as **default** to keep the first vertical slice minimal (GIS ID token → API is well-supported). May be added later for stricter OAuth-only flows.
  - **Firebase Auth / Identity Platform:** Rejected for V2 Google sign-in to avoid duplicating identity providers and to stay aligned with “Spring + Postgres as system of record” for the new stack.
