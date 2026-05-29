# ADR-0015: V2 production Demo troupe — product bootstrap via Flyway migration

- **Status:** Accepted
- **Date:** 2026-05-28
- **Context:**
  - HatCast V2 needs a **shared onboarding sandbox** — troupe **Démo**, season **Saison 2026-2027**, ~20 pedagogical events, fictitious participants — joinable by any authenticated user (FR61, FR64; Epic 18).
  - [ADR-0014](0014-v2-preprod-migration-no-seed.md) disables `classpath:db/seed` on the **`cloud`** profile (Cloud Run staging/production). Dev/test fiction lives under `db/seed` only.
  - Three troupe names must not be conflated (product decision 2026-05-28):
    - **Les Improbots** — local/CI dev seed (`db/seed`, UUID `…000001`).
    - **Démo** — production onboarding sandbox (`is_demo = true`, UUID `…000099`).
    - **La Malice** — Patrice's **real** troupe after V1→V2 migration; **not** Flyway seed.
  - Staging/pre-prod that mirrors **real** V1 data ([ADR-0014](0014-v2-preprod-migration-no-seed.md)) must **not** receive Les Improbots seed rows; it may optionally receive the **Démo** bootstrap if product wants onboarding on staging (same migration, no PII).
- **Decision:**
  1. **Product bootstrap in `db/migration`:** Demo troupe data is delivered by **idempotent** SQL scripts in `classpath:db/migration` (e.g. `Vxx__bootstrap_demo_troupe.sql`), using `INSERT … SELECT … WHERE NOT EXISTS` (or equivalent) on **fixed UUIDs**:
     - Troupe Démo: `a0000001-0000-4000-8000-000000000099` (`slug: demo`, `is_demo: true`, `join_policy: OPEN` once columns exist — Story 18.1).
     - Season: `b0000001-0000-4000-8000-000000000099` (`slug: saison-2026-2027`, 2026-06-01 → 2027-05-31).
     - Events, fictitious season participants, availability, and composition states per FR64 pedagogical matrix (Story 18.3).
  2. **Runs on all profiles** that apply `db/migration`, including **`cloud`**. This is intentional **product reference data**, not developer fiction.
  3. **Not in `db/seed`:** Demo bootstrap must **never** be placed only under `db/seed` — that would exclude production per ADR-0014.
  4. **Les Improbots stays in `db/seed`:** Rich dev dataset (30+ events, MVP pilot, context switcher) remains dev/test-only; renamed from legacy label « La Malice » (Story 18.0) to avoid confusion with real migration troupe.
  5. **Analytics:** Rows with `is_demo = true` are excluded from pilot-troupe adoption KPIs (FR64 / FR47); filter documented in Story 18.3 Dev Notes.
  6. **Super-admin maintenance:** Demo content and composition states are maintained by platform administrators (`hatcast.auth.super-admin-emails`); self-join creates `MEMBER` only.
- **Consequences:**
  - **Positive:** Prod deploy automatically provisions onboarding sandbox; aligns UI « Rejoindre la troupe de démonstration » with real data; clear separation Improbots / Démo / La Malice.
  - **Negative:** `db/migration` now contains **some** product data, not pure schema — reviewers must distinguish bootstrap scripts from DDL.
  - **Operational:** Neon reset + redeploy recreates Démo from migration; staging with real migrated troupes coexists with Démo (different UUIDs).
  - **Schema dependency:** Bootstrap migrations that set `join_policy` / `is_demo` require Story **18.1** columns; order migrations accordingly.
- **Alternatives considered:**
  - **B — Separate Flyway location `db/product-bootstrap` on cloud only:** Rejected for MVP — extra profile wiring; Option A (same folder, clearly named scripts) is simpler.
  - **C — Manual ops script after deploy:** Rejected — not repeatable on Neon reset; drift risk.
  - **Put Démo in `db/seed` and enable seed on cloud:** Rejected — violates ADR-0014 and would load Les Improbots fiction on staging.
