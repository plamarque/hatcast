# Pre-production V2 — reset Neon staging and migrate from V1 production

Operational runbook for **HatCast V2 staging** (Cloud Run + Neon branch `staging`).  
Normative policy: [ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md).  
Tracking: [PLAN.md](../../../PLAN.md) § « Pre-prod V2 + migration V1 ».

## Scope

| In scope (today) | Out of scope (documented gap) |
|------------------|-------------------------------|
| Flyway **schema only** on staging (no dev seeds) | Firebase Auth bulk import (optional, separate) |
| Export users + members from **V1 Firestore production** (`(default)`) | Production cutover / DNS / Hosting switch |
| CSV import via V2 admin UI (Story 2.3) | Full season/league model migration |
| **Events + mapping manifest** export/load (**MIG-2**, ADR-0016) | |
| **`template_type=deplacement` → `category=deplacements`** (**MIG-4**) | |
| **Availability + compositions** export/load (**MIG-3**, ADR-0016) | |
| Repeatable Neon staging reset | |

> **MIG-4 (post-2026-06-01):** `transformEvents()` sets `category='deplacements'` for V1
> `templateType=deplacement`; `load.sql` also idempotently seeds `troupe_categories` for the
> target troupe. Staging branches migrated **before** MIG-4 need a full Procedure C replay — no
> separate backfill script.

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
| Firestore DB | — | **`(default)`** (production) |
| Postgres | Neon `staging` | — |
| Flyway seeds | **Off** | — |

Do **not** use `--database=staging` or `--database=development` for pre-prod migration exports.

> **Firestore default database id (BUG-DOC-001).** The production database id is the literal **`(default)`**, not `default`. The migration scripts (`getDb` in `scripts/replay/loadSeasonData.js`) now **normalize** `--database=default` (and an empty value) to `(default)`, so both forms work. Passing `--database='(default)'` explicitly is always safe.

## Procedure A — First-time staging setup

1. Provision Neon branch `staging` and GitHub secrets (see DEPLOY_V2_CLOUD_RUN §5).
2. Push or merge to **`staging`** → CI deploys Cloud Run.
3. Confirm health: SPA loads, `GET /v1/auth/me` returns 401 without session.
4. Confirm DB is empty of seed data: no users with `@seed.improbots.test` (SQL or admin check).
5. Continue with **Procedure B** (migrate).

## Procedure B — Migrate from V1 production

Replace `SEASON_ID` and `TROUPE_ID` (V2 UUID of the target troupe).

### Script unique (MIG-6, recommended)

One command from repo root after **Procedure C** Neon reset (and staging deploy with migration API key — [ADR-0017](../../adr/0017-v2-migration-api-key.md)):

**One-time:** add to `.env.local` — `NEON_STAGING_URL`, `HATCAST_MIGRATION_API_KEY`, Firebase Admin (see [.env.example](../../../.env.example)).

```bash
./scripts/migrate-from-v1.sh --target=staging   # défaut si --target omis
# or: npm run migrate:from-v1
```

**Cibles** (`--target=`) : `local` | `development` | `staging` | `production`. URLs Neon et API résolues depuis `.env.local` via `scripts/v2/resolve-migrate-target.mjs` (voir [.env.example](../../../.env.example) § migration V1). Config optionnelle par cible : `export/malice/migrate.config.<target>.json`.

Exemple cloud dev — **cycle reset + deploy + migration** (branche Neon `development`, `hatcast-v2-dev`) :

1. **Neon** : reset de la branche `development` (base vide).
2. **Cloud Run** : déployer ou redémarrer `hatcast-v2-dev` → Flyway applique **`db/migration` uniquement** (schéma + bootstrap produit Démo dans les migrations ; **pas** les seeds `db/seed` Les Improbots — profil `cloud`, ADR-0014).
3. **Migration V1** (crée troupe **La Malice**, saison **Malice 2025-2026**, spectacles **publiés** via fin de `load-ac.sql`) :

```bash
cp scripts/v2/migrate.config.development.example.json export/malice/migrate.config.development.json
# Ajuster .env.local : NEON_DEVELOPMENT_URL, HATCAST_MIGRATE_API_BASE_DEVELOPMENT, HATCAST_MIGRATION_*
./scripts/migrate-from-v1.sh --target=development
```

Après succès : saison Malice visible (organisateur + membres), spectacles sans badge brouillon (`availability_opened_at` renseigné). La troupe **Démo** Flyway coexiste ; ce n’est pas la saison migrée.

The script loads `.env.local`, checks deps (`pg`, `psql`, `gh` si redeploy GitHub), creates `export/malice/migrate.config.json` from the example if missing. On a **Neon reset cycle** it:

1. Prompts you to reset the Neon branch for the target in the console (manual).
2. Restarts the API (`local` : prompt ; `development` : `gcloud run services update` ; `staging` : GitHub Actions `staging-v2` ; `production` : manuel).
3. Waits for `/actuator/health` and migration API preflight (201).
4. Runs the full pipeline (`--yes --record-cycle`).

Requires `gh auth login` for `staging`. Pour **`--target=development`**, le script active automatiquement `HATCAST_MIGRATION_API_*` sur `hatcast-v2-dev` via `gcloud` (`.env.local` : clé + `HATCAST_MIGRATION_OPERATOR_EMAIL`). No Google sign-in after reset (operator stub — ADR-0017).

Options:

```bash
./scripts/migrate-from-v1.sh --dry-run              # export + SQL only (smoke skipped)
./scripts/migrate-from-v1.sh --no-prompt-reset      # skip Neon prompt + redeploy
./scripts/migrate-from-v1.sh --skip-redeploy        # Neon reset only; you restarted API yourself
./scripts/migrate-from-v1.sh --i-reset-neon --skip-redeploy   # reprise après reset + restart déjà faits
./scripts/migrate-from-v1.sh --skip-staging-redeploy  # alias of --skip-redeploy
./scripts/migrate-from-v1.sh --help
```

**Publication des spectacles migrés (Story 3.21) :** `load-ac.sql` (MIG-3) se termine par un `UPDATE events SET availability_opened_at = created_at` pour la `seasonV2Id` du manifest — les spectacles V1 ne doivent **pas** rester en brouillon. Après un correctif pipeline, **rejouer sur une base vierge** (reset Neon + script ci-dessus) ; ne pas se contenter d’un `load-ac.sql` généré avant le correctif — relancer au minimum `migrate:malice:transform:ac` ou tout le `migrate-from-v1.sh`.

Validate the ≥ 3 cycles gate:

```bash
npm run migrate:v2:validate-replay -- --path=export/malice/replay-log.jsonl --min=3
```

**Gate CI staging (T3)** — après migration complète sur Neon, valider les golden MIG-E2E (KPIs Patrice, historique) sans bloquer les deploys :

1. GitHub → **Actions** → **Migration staging gate (Malice)** → **Run workflow**
2. Voir [DEPLOYMENT_WORKFLOW.md](../technical/DEPLOYMENT_WORKFLOW.md) § Gate migration staging (T3)

Le gate **E1 preprod (T2)** reste couplé au deploy mais n’inclut plus les tests golden migration — vous pouvez reset/rejouer la migration puis redeployer sans être bloqué par MIG-E2E-003.

### Orchestrateur npm (MIG-5, advanced / troubleshooting)

Lower-level entry point — same pipeline, more flags:

```bash
npm run migrate:v2:run -- --config=export/malice/migrate.config.json --i-reset-neon --yes --record-cycle
```

Resume from a step (`export/malice-runs/<runId>/state.json`):

```bash
npm run migrate:v2:run -- --config=export/malice/migrate.config.json --from-step=b4 --yes --run-id=<previous-run-id>
```

`--expect-host=auto` derives the Neon branch marker from the JDBC URL (see `migrate-malice-load.mjs`). Manual steps below remain valid as **fallback** if the orchestrator is unavailable.

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

> **Genre (story 2.12 + MIG-7):** l’export `users.csv` inclut la colonne `gender` depuis V1. L’import met à jour `users.gender` **uniquement si la valeur V2 est encore `NULL`** (stubs et comptes activés) — jamais d’écrasement d’un genre déjà renseigné (Mon compte). Messages de ligne distincts : *« Genre complété depuis l'import V1. »* (succès), *« Compte déjà actif — genre déjà renseigné. »* (ignoré). Voir **B2b** pour un re-import ciblé sur staging déjà migré.

### B2b — Gender backfill (MIG-7)

Use when staging was loaded **before** MIG-7 or when activated users still have `users.gender IS NULL` after the initial B2 import.

1. Re-export V1 users (or reuse the latest `users.csv` if V1 data unchanged):

```bash
npm run export:v1-users:prod -- --season=SEASON_ID --output=./export/users.csv
```

2. Sign in as **troupe admin** on staging → **Membres** → **Importer utilisateurs CSV** → same `users.csv`.
3. Review row outcomes: success rows show *« Genre complété depuis l'import V1. »* ; conflicting CSV gender on accounts that already have a genre shows *« Compte déjà actif — genre déjà renseigné. »* (skipped, no overwrite).

**Smoke SQL (staging/prod):**

```sql
SELECT COUNT(*) AS with_gender FROM users WHERE gender IS NOT NULL;
SELECT gender, COUNT(*) FROM users GROUP BY gender;
```

Compare `with_gender` to the V1 export row count (minus emails without resolvable gender). Expect `male` / `female` / `non_specified` distribution aligned with V1 `players.gender` resolution rules.

### B3 — Post-migration smoke test (members)

- [ ] Member count matches export (minus rejected rows).
- [ ] At least one `TROUPE_ADMIN` can open admin surfaces.
- [ ] Test user can sign in with Google and sees expected troupe membership.
- [ ] Document any manual steps still required (create season/league in UI if not migrated).

### B4 — Migrate events + mapping manifest (MIG-2, ADR-0016)

Three replayable phases (`extract → transform → load`), each writing a diffable,
timestamped artifact under `export/malice/<ts>/` (**out of git** — PII). Run after
members are imported (B2) and the V2 season exists.

```bash
# 1) Extract (read-only Firestore). Default season = o0kD2IJekMdGdiJeIg4O (Malice 2025-2026).
npm run migrate:malice:extract -- --season=SEASON_ID --database='(default)'
#   → export/malice/<ts>/raw.json  (season meta + ALL events + players)

# 2) Export the target season_participants from Neon (resolves the manifest by email):
psql "$STAGING_URL" -A --csv \
  -c "SELECT id AS \"seasonParticipantId\", user_id AS \"userId\", normalized_email AS \"normalizedEmail\"
      FROM season_participants WHERE season_id = 'V2_SEASON_UUID' AND status = 'ACTIVE'" \
  | python3 -c 'import csv,json,sys; print(json.dumps(list(csv.DictReader(sys.stdin))))' \
  > export/malice/<ts>/participants.json

# 3) Transform → load.sql + manifest.json + rejects.json
npm run migrate:malice:transform -- \
  --raw=export/malice/<ts>/raw.json \
  --season-v2=V2_SEASON_UUID \
  --participants=export/malice/<ts>/participants.json
#   Default starts_at time for date-only V1 events: 19:00 local (override with --default-time=HH:mm).

# 4) Load — DRY-RUN by default (prints SQL, writes nothing):
npm run migrate:malice:load -- --sql=export/malice/<ts>/load.sql

#   Apply on STAGING (later switch to prod with the same load.sql):
npm run migrate:malice:load -- --sql=export/malice/<ts>/load.sql \
  --database-url="$NEON_STAGING_URL" --target=staging --yes --expect-host=auto

#   Apply on PRODUCTION (typed confirmation + host assertion both required):
npm run migrate:malice:load -- --sql=export/malice/<ts>/load.sql \
  --database-url="$NEON_PROD_URL" --target=prod --confirm-prod=prod --expect-host=prod
#   Connection: --database-url=URL or env HATCAST_MIGRATE_DATABASE_URL / DATABASE_URL. Requires psql.
```

The TARGET database is whatever `--database-url` resolves to — the `--target`
label only drives the guard. **`--expect-host=<marker>`** cross-checks the actual
connection host **or** branch/database name (Neon usually carries the env name in
the branch), and the loader **refuses to write** if it doesn't match. It is
**mandatory for a prod write** and recommended for staging, so a correct label
pointing at the wrong URL is rejected.

The SQL is idempotent (`INSERT … ON CONFLICT (id) DO UPDATE`) and applied in a
**single transaction**, so the whole MIG-2 step is safe to replay (Procedure C)
and to **re-run unchanged against the production branch** at cutover. Review
`rejects.json` (events with an invalid date, players with no V2 match) — it never
aborts the run. The `manifest.json` is the **input contract for MIG-3**.

#### B4 smoke test (events)

- [ ] `events` row count matches `manifest.json.counts.events` (and non-rejected V1 events).
- [ ] Each migrated event has a unique `slug` within the season.
- [ ] `manifest.json.players[]` resolves expected members; review any `PLAYER_UNRESOLVED` rejects.
- [ ] **MIG-4:** `manifest.json.counts.deplacements` matches V1 `templateType=deplacement` count in `raw.json`.
- [ ] **MIG-4:** after load, `SELECT COUNT(*) FROM events WHERE season_id = '<V2_SEASON_UUID>' AND category = 'deplacements'` equals `manifest.json.counts.deplacements` (Malice: **7** expected).
- [ ] **MIG-4:** `troupe_categories` contains `{ slug: 'deplacements', label: 'Déplacements' }` for the target troupe when `counts.deplacements > 0`.

Compare V1 deplacement count:

```bash
node -e "const r=require('./export/malice/<ts>/raw.json'); console.log(r.events.filter(e=>e.templateType==='deplacement').length)"
```

Post-load SQL:

```sql
SELECT COUNT(*)::int FROM events
WHERE season_id = '<V2_SEASON_UUID>' AND category = 'deplacements';
```

### B5 — Migrate availability + compositions (MIG-3, ADR-0016)

Run **after MIG-2** (`manifest.json` exists). Uses the same `raw.json` from extract
(which now includes flat `availability[]` and `casts[]`).

```bash
# 1) Transform availability + compositions (requires manifest from B4 step 3)
npm run migrate:malice:transform:ac -- \
  --raw=export/malice/<ts>/raw.json \
  --manifest=export/malice/<ts>/manifest.json
#   → load-ac.sql, rejects-ac.json

# 2) Load — DRY-RUN by default (apply events + availability/compositions together):
npm run migrate:malice:load -- \
  --sql=export/malice/<ts>/load.sql \
  --sql=export/malice/<ts>/load-ac.sql

# 3) Apply on STAGING:
npm run migrate:malice:load -- \
  --sql=export/malice/<ts>/load.sql \
  --sql=export/malice/<ts>/load-ac.sql \
  --database-url="$NEON_STAGING_URL" --target=staging --yes --expect-host=auto

# 4) Apply on PRODUCTION (same SQL files, typed confirmation):
npm run migrate:malice:load -- \
  --sql=export/malice/<ts>/load.sql \
  --sql=export/malice/<ts>/load-ac.sql \
  --database-url="$NEON_PROD_URL" --target=prod --confirm-prod=prod --expect-host=prod
```

Review `rejects-ac.json` (unmapped player/event, empty slot). The run never aborts
on rejects — fix manifest or source data, then replay.

#### B5 smoke test (availability + compositions)

- [ ] `event_availability` row count ≈ `manifest` players × events minus rejects (Malice: ~1227).
- [ ] `event_compositions` row count matches non-rejected casts (Malice: ~32).
- [ ] Spot-check: `confirmed` cast → `validated_at` + `published_at`; `incomplete` → draft (both NULL).
- [ ] Spot-check: declined player → row in `event_composition_declines` with self-decline (`declined_by_user_id` = player's user id).

## Procedure C — Reset staging and replay

Use when migration rules change, imports failed, or you need a clean rehearsal before production cutover.

### C1 — Reset Neon data

**Option 1 (recommended):** Neon console → branch `staging` → **Reset** from parent (empty schema) or delete/recreate branch → update `HATCAST_DATASOURCE_URL` if the host changed.

**Option 2:** Drop all tables in staging (destructive; only if reset unavailable).

### C2 — Reapply schema (restart staging API)

After a Neon reset the running Cloud Run revision may still point at an empty DB without `spring_session` / Flyway. **`./scripts/migrate-from-v1.sh`** restarts Cloud Run via **`gcloud run services update`** (nouvelle révision, Flyway sur la branche Neon reset) — sans rebuild ni gate E2E T1. Override : `--restart=github` pour déclencher le workflow **Deploy V2 (Cloud Run)** sur `staging-v2` (rebuild + smoke avant deploy). Manual alternative: GitHub Actions → Run workflow on `staging-v2`, or redeploy via `promote-to-staging.sh` when `services/api/` changed.

### C3 — Replay migration

Run **Procedure B** again from the same V1 production exports (re-export if V1 data changed).

**Script:** `./scripts/migrate-from-v1.sh` (or `npm run migrate:from-v1`)

**Manuel:** follow Procedure B steps B1–B5.

### C4 — Gate before production cutover

Record each replay in a simple log (date, season id, row counts, issues). Target: **≥ 3 successful** reset → migrate → smoke cycles without undocumented manual fixes.

#### Cycle log format (MIG-3 gate, ADR-0016 §Decision.6)

Keep a file outside git (e.g. `export/malice/replay-log.jsonl`). One JSON object per line per cycle:

```json
{"date":"2026-05-29","seasonV1":"o0kD2IJekMdGdiJeIg4O","seasonV2":"<uuid>","artifactDir":"export/malice/<ts>","counts":{"events":55,"availability":1227,"casts":32,"compositionSlots":298,"declines":35},"rejects":{"mig2":0,"mig3":0},"smoke":"pass","notes":""}
```

| Field | Meaning |
|-------|---------|
| `artifactDir` | Timestamped dump used for this cycle |
| `counts.*` | Loaded row counts (from SQL report or post-load SQL) |
| `rejects.mig2` / `rejects.mig3` | Entries in `rejects.json` / `rejects-ac.json` |
| `smoke` | `pass` / `fail` after B3 + B4 + B5 checklists |
| `notes` | Manual fixes still required (should be empty before prod) |

Gate: **≥ 3 lines** with `smoke: "pass"` and `rejects.mig3: 0` (or documented, accepted rejects) before any production load.

Validate with:

```bash
npm run migrate:v2:validate-replay -- --path=export/malice/replay-log.jsonl --min=3
```

#### Operator checklist (staging, ≥ 3 cycles)

Each cycle: **Procedure C1–C2** (Neon reset + redeploy if needed) → `./scripts/migrate-from-v1.sh`.

| Cycle | Expected smoke counts | Notes |
|-------|----------------------|-------|
| 1–3 | **Auto** from artifacts (`manifest.json` + `rejects-ac.json` counts) | No manual `events`/`compositions` in config — live V1 export drives expectations |
| Rejects ceiling | `thresholds.rejectsMig2` / `rejectsMig3` in config (optional max) | Raise only if you accept mapping rejects |

**Preflight API:** `migrate-from-v1.sh` checks `GET /v1/auth/me` with the migration key (no `POST /v1/troupes`). Older runs may have left a troupe named `migrate-from-v1 preflight` on staging — remove manually in Neon/SQL if it pollutes the annuaire (no delete-troupe API yet).

If counts drift between cycles, that is expected (V1 prod is live); each cycle re-exports and re-derives expectations from its artifact folder.

## Security notes

- Exports read **production PII**; store CSV outside git; restrict file permissions.
- Prefer a dedicated Firebase Admin SA with **read-only** Firestore for exports.
- Staging must use a **separate** Identity Platform / OAuth audience from production when configured — do not point staging SPA at prod auth unless intentional.

## References

- [v1-troupe-members-csv-recipe.md](v1-troupe-members-csv-recipe.md)
- [ADR-0009](../../adr/0009-neon-postgres-environments.md)
- [ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md)
- [BRANCH_ENVIRONMENTS.md](../../shared/technical/BRANCH_ENVIRONMENTS.md)
