# Pre-production V2 — reset Neon staging and migrate from V1 production

Operational runbook for **HatCast V2 staging** (Cloud Run + Neon branch `staging`).  
Normative policy: [ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md).  
Tracking: [PLAN.md](../../../PLAN.md) § « Pre-prod V2 + migration V1 ».

## Scope

| In scope (today) | Out of scope (documented gap) |
|------------------|-------------------------------|
| Flyway **schema only** on staging (no dev seeds) | Automated import of events, availability, compositions |
| Export users + members from **V1 Firestore production** (`default`) | Firebase Auth bulk import (optional, separate) |
| CSV import via V2 admin UI (Story 2.3) | Production cutover / DNS / Hosting switch |
| Repeatable Neon staging reset | Full season/league model migration |

## Prerequisites

- GitHub environment **`staging`** configured ([DEPLOY_V2_CLOUD_RUN.md](../technical/DEPLOY_V2_CLOUD_RUN.md)).
- Neon branch **`staging`** with JDBC URL in `HATCAST_DATASOURCE_*` secrets.
- V2 deployed from branch **`staging`** (`HATCAST_SPRING_PROFILE=cloud` → no `db/seed`).
- Firebase Admin credentials in `.env.local` with **read access to production Firestore** (`(default)` database):
  - `FIREBASE_PROJECT_ID` (or `VITE_FIREBASE_PROJECT_ID`)
  - `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` **or** `gcloud auth application-default login`
- V1 **season document id** to migrate (one season ≈ one troupe in current playbook).
- V2 **troupe** on staging: created via **Story 2.11** ([PLAN.md](../../../PLAN.md) **MIG-0**) or equivalent product flow — **not** Flyway `db/seed` on `cloud` ([ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md)). Manual SQL bootstrap is deprecated once **2.11** is done.

## Environment matrix

| Layer | Pre-prod staging | V1 source for exports |
|-------|------------------|------------------------|
| Git branch | `staging` | — |
| Firestore DB | — | **`default`** (production) |
| Postgres | Neon `staging` | — |
| Flyway seeds | **Off** | — |

Do **not** use `--database=staging` or `--database=development` for pre-prod migration exports.

## Procedure A — First-time staging setup

1. Provision Neon branch `staging` and GitHub secrets (see DEPLOY_V2_CLOUD_RUN §5).
2. Push or merge to **`staging`** → CI deploys Cloud Run.
3. Confirm health: SPA loads, `GET /v1/auth/me` returns 401 without session.
4. Confirm DB is empty of seed data: no users with `@seed.improbots.test` (SQL or admin check).
5. Continue with **Procedure B** (migrate).

## Procedure B — Migrate from V1 production

Replace `SEASON_ID` and `TROUPE_ID` (V2 UUID of the target troupe).

### B1 — Export from Firestore production

From repo root, with `.env.local` pointing at the **production** Firebase project:

```bash
npm run export:v1-users:prod -- --season=SEASON_ID --output=./export/users.csv
npm run export:v1-members:prod -- --season=SEASON_ID --output=./export/members.csv
```

Equivalent explicit form:

```bash
npm run export:v1-users -- --season=SEASON_ID --database=default --output=./export/users.csv
npm run export:v1-members -- --season=SEASON_ID --database=default --output=./export/members.csv
```

Review script warnings (emails in `roles` without player doc, etc.).

### B2 — Import into V2 staging

1. Sign in as **troupe admin** on the staging Cloud Run URL.
2. Open **Membres** for troupe `TROUPE_ID`.
3. **Importer utilisateurs CSV** → `users.csv`.
4. **Importer membres CSV** → `members.csv` (after users; `USER_NOT_FOUND` if order reversed).

See [v1-troupe-members-csv-recipe.md](v1-troupe-members-csv-recipe.md) for auth linking (Google first login, optional Identity Platform import).

### B3 — Post-migration smoke test

- [ ] Member count matches export (minus rejected rows).
- [ ] At least one `TROUPE_ADMIN` can open admin surfaces.
- [ ] Test user can sign in with Google and sees expected troupe membership.
- [ ] Document any manual steps still required (create season/league in UI if not migrated).

## Procedure C — Reset staging and replay

Use when migration rules change, imports failed, or you need a clean rehearsal before production cutover.

### C1 — Reset Neon data

**Option 1 (recommended):** Neon console → branch `staging` → **Reset** from parent (empty schema) or delete/recreate branch → update `HATCAST_DATASOURCE_URL` if the host changed.

**Option 2:** Drop all tables in staging (destructive; only if reset unavailable).

### C2 — Reapply schema

Redeploy V2 (push to `staging` or re-run workflow). Flyway runs **migration** scripts only; database ends at latest schema version with **no seed rows**.

### C3 — Replay migration

Run **Procedure B** again from the same V1 production exports (re-export if V1 data changed).

### C4 — Gate before production cutover

Record each replay in a simple log (date, season id, row counts, issues). Target: **≥ 3 successful** reset → migrate → smoke cycles without undocumented manual fixes.

## Security notes

- Exports read **production PII**; store CSV outside git; restrict file permissions.
- Prefer a dedicated Firebase Admin SA with **read-only** Firestore for exports.
- Staging must use a **separate** Identity Platform / OAuth audience from production when configured — do not point staging SPA at prod auth unless intentional.

## References

- [v1-troupe-members-csv-recipe.md](v1-troupe-members-csv-recipe.md)
- [ADR-0009](../../adr/0009-neon-postgres-environments.md)
- [ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md)
- [BRANCH_ENVIRONMENTS.md](../../shared/technical/BRANCH_ENVIRONMENTS.md)
