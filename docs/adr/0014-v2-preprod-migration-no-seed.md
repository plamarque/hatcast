# ADR-0014: V2 pre-production — schema without dev seeds, V1 production as migration source

- **Status:** Accepted
- **Date:** 2026-05-25
- **Context:**
  - HatCast V2 persists in **PostgreSQL on Neon** per environment ([ADR-0009](0009-neon-postgres-environments.md)).
  - **Development** relies on Flyway **seed** data (fictional troupe **Les Improbots**, spectacles `[MVP]`, etc.) for local recette and integration tests.
  - **Pre-production** (GitHub environment `staging`, Neon branch `staging`, branch git `staging`) must reflect **real troupe data** migrated from **V1 production Firestore**, not seed rows.
  - The cutover date from V1 (Firebase Hosting) to V2 is **not fixed**; pre-prod must support **resetting Neon staging and replaying migration** until production cutover is approved.
  - V1 production uses Firestore database id **`(default)`** ([ADR-0002](0002-multi-database-firestore.md), `configService.js` prod profile) — not the `staging` or `development` Firestore databases.
- **Decision:**
  1. **Flyway split:** `classpath:db/migration` = schema and **product bootstrap** (Demo troupe per [ADR-0015](0015-v2-demo-troupe-product-bootstrap.md)); `classpath:db/seed` = dev/test seed SQL (**Les Improbots**, MVP pilot, etc.).
  2. **Profiles:**
     - `dev` and `test` → Flyway locations `db/migration` + `db/seed`.
     - `cloud` (Cloud Run staging/production) → Flyway locations **`db/migration` only** (`application-cloud.yml`).
  3. **Pre-prod data source:** V1 → V2 export scripts run against Firestore **`--database=default`** (production data). Operators use `npm run export:v1-users:prod` / `export:v1-members:prod` or explicit `--database=default`.
  4. **Pre-prod content:** After deploy, Postgres staging contains **only** schema + data imported via documented CSV/API migration (today: users + troupe members per [v1-troupe-members-csv-recipe.md](../v2/migration/v1-troupe-members-csv-recipe.md)). No `@seed.improbots.test` accounts unless manually imported. Optional **Démo** bootstrap from migration ([ADR-0015](0015-v2-demo-troupe-product-bootstrap.md)) may coexist.
  5. **Reset loop:** Neon staging branch may be reset (or recreated) to empty; redeploy V2 applies schema; operators replay the migration runbook. V1 Firestore production remains the **source of truth** until cutover.
  6. **Production cutover** (Neon primary, branch `main`) is **out of scope** of this ADR — separate checklist when a go-live date is chosen ([MERGE_V2_TO_MAIN_CHECKLIST.md](../shared/technical/MERGE_V2_TO_MAIN_CHECKLIST.md)).
- **Consequences:**
  - **Positive:** Staging mirrors real membership; repeatable migration drills; dev seeds unchanged for local/CI.
  - **Negative:** Existing Neon staging DBs that already ran seed migrations need a **one-time reset** after this ADR ships. La branche Neon **`development`** (cloud dev) ne doit **pas** partager le poste local : seeds sur branche **`local`** uniquement ([ADR-0009](0009-neon-postgres-environments.md)).
  - **Operational:** Export scripts require **production-grade** Firebase Admin credentials (read-only service account recommended); exports must not target `development` Firestore for pre-prod.
  - **Gap (explicit):** Events, availability, compositions, and season/league structure are **not** automated in the current migration playbook — manual admin setup or future MIG-* slices in PLAN.md.
- **Alternatives considered:**
  - **Single Flyway folder with conditional SQL:** Rejected — not portable across profiles without fragile branching.
  - **Disable Flyway on staging:** Rejected — schema drift risk.
  - **Use Firestore `staging` database for pre-prod exports:** Rejected — user requirement: pre-prod must reflect **production** V1 data.
