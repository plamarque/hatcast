# ADR-0017: V2 pre-prod migration CLI — API key authentication

- **Status:** Accepted
- **Date:** 2026-05-29
- **Context:**
  - [ADR-0014](0014-v2-preprod-migration-no-seed.md) and [ADR-0016](0016-v1-v2-availability-compositions-migration-pipeline.md) define a repeatable **Procedure B** (users/members CSV, MIG-2/MIG-3 SQL pipeline) for Neon staging rehearsals before production cutover.
  - The manual runbook ([preprod-reset-and-migrate.md](../v2/migration/preprod-reset-and-migrate.md)) requires **~15 operator steps**, including browser UI (troupe/season creation, CSV import) and many shell commands.
  - Before production, operators must replay **≥ 3 clean cycles** (reset Neon → migrate → smoke). Manual steps do not scale and are error-prone (e.g. `psql -t` dropping CSV headers, wrong `--expect-host` marker).
  - The V2 API already exposes the required mutations (`POST /v1/troupes`, CSV import multipart, season create/activate) behind **session + CSRF** (Story 2.11, 2.3).
- **Decision:**
  1. Add an optional **migration API key** for headless CLI orchestration:
     - Server env: `HATCAST_MIGRATION_API_ENABLED=true`, `HATCAST_MIGRATION_API_KEY`, `HATCAST_MIGRATION_OPERATOR_EMAIL` (existing user, typically platform super-admin).
     - Client header: `X-Hatcast-Migration-Key`.
     - Valid key → authenticate as the operator user (`SessionUserPrincipal`); **CSRF skipped** for those requests (same class of trust as `/v1/auth/google`).
     - If the operator email is not yet in Postgres (e.g. after Neon reset), the API **auto-provisions a migration stub** via `UserAccountService.ensureUserByEmail` — no browser Google sign-in required before CLI runs.
  2. **Default off** (`api-enabled=false`). Production enables only with explicit env + secret; Neon prod load remains guarded by `migrate-malice-load` (`--confirm-prod`, `--expect-host`).
  3. Implement orchestrator **`npm run migrate:v2:run`** (Node) that chains bootstrap, B1–B5, SQL/API checks, and structured logging — see [PLAN.md](../../PLAN.md) **MIG-5**.
  4. Operator entry point **`./scripts/migrate-from-v1.sh`** (MIG-6) — loads `.env.local`, preflight, Neon reset prompt, invokes orchestrator with `--yes --record-cycle`.
  4. Do **not** add duplicate `/v1/internal/migration/*` endpoints in v1; reuse existing REST surface.
- **Consequences:**
  - **Positive:** Fully scriptable replays; CI-friendly; no browser; same business rules as UI imports.
  - **Negative:** Long-lived shared secret on staging; must rotate and scope to recette envs.
  - **Operational:** GitHub env `staging` stores migration key + operator email; document in [DEPLOY_V2_CLOUD_RUN.md](../v2/technical/DEPLOY_V2_CLOUD_RUN.md).
- **Alternatives considered:**
  - **Exported browser session cookie:** rejected — brittle, expires, hard in CI.
  - **Firebase email/password in CLI:** rejected — duplicates client auth; password in env.
  - **Direct SQL bootstrap only:** rejected — bypasses import validation and membership sync rules.
