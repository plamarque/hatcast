---
baseline_commit: f65b21262f9db02c3d0d5cf949cc4efd361ed145
---

# Story MIG-7: Backfill `users.gender` — production V1 import + dev/demo seeds

Status: done

<!-- Scope extended 2026-06-06: dev/demo seed backfill (ex-6.21 recette) bundled with production V1 backfill -->

**Type:** Migration / tooling + seed data (PLAN.md § Pre-prod V2 + V1 migration, **iso-V1 gate**). Not a product UI story.  
**Depends:** **2.12** (done) — `users.gender` column, CSV export, import plumbing.  
**SCP:** [G-011](../planning-artifacts/sprint-change-proposal-2026-06-05-member-gender-parity.md) — explicit follow-up when backfill beyond stub CSV import is required.  
**Scope extension (2026-06-06):** Dev/demo seed gender backfill (written for **6.21** recette) is **in scope** — same NULL-only rule, single commit with production hardening.

## Story

As a **migration operator and developer**,  
I want **`users.gender` backfilled everywhere it is still `NULL`** — from V1 CSV on staging/prod **and** on local dev/demo seed rosters,  
so that **V1 members recover their gender without re-entry**, **seed personas enable parity/mixité recette (6.21)**, and **Mon compte choices are never overwritten**.

## Scope — two delivery tracks, one commit

| Track | Audience | Mechanism | Status |
|-------|----------|-----------|--------|
| **A — Production / staging** | Malice, preprod Neon | Re-export V1 `users.csv` → troupe admin CSV import ; NULL-only API guard | **To implement** |
| **B — Dev / demo seeds** | Local H2/Postgres, `@seed.demo.test`, Improbots roster | `V57` Flyway + `generate-improbots-seed-sql.js` inference | **Done in working tree** — re-label comments, commit with A |

**Universal rule:** update `users.gender` **only when `gender IS NULL`**. Never overwrite `male` / `female` / `non_specified` already persisted (Mon compte or prior import).

**Out of this commit:** `apps/web/**/changelog*` (story **10.3**, unrelated).

## Acceptance Criteria

### Track A — Production V1 backfill

1. **Given** a V1 `users.csv` with `gender` column, **when** backfill runs via user CSV import, **then** each row updates `users.gender` for the matching email **if and only if** V2 `gender IS NULL`. [Source: member-gender.md ; 2.12 AC4]
2. **Given** a V2 user **activated** (`activated_at IS NOT NULL`) and `gender IS NULL`, **when** backfill runs, **then** V1 gender is persisted and `display_name` is **unchanged**. [Source: existing test `troupe admin import users csv backfills gender on activated user`]
3. **Given** a user with `gender` already set (Mon compte or prior import), **when** backfill runs with conflicting CSV gender, **then** existing value is **preserved** (row skipped, no overwrite). [Source: product rule — **bug in current code**: uses `!=` instead of `== null`]
4. **Given** multiple V1 `players` per email, **when** export resolves gender, **then** V1 rule applies (most recent non-`non_specified` by `updatedAt`). [Source: `scripts/v1/troupeMembersCsv.js`]
5. **Given** invalid V1→V2 CSV value, **when** import runs, **then** persist `non_specified`. [Source: `MemberGender.fromV1Csv`]
6. **Given** staging Malice after backfill, **when** smoke SQL runs, **then** `COUNT(*) WHERE gender IS NOT NULL` meets documented threshold vs V1 export. [Source: iso-V1 gate]
7. **Given** migration runbooks, **when** operator follows post-2.12 procedure, **then** steps cover re-import timing and distinct import row messages for gender backfill. [Source: preprod-reset-and-migrate.md ; v1-troupe-members-csv-recipe.md]

### Track B — Dev / demo seed backfill

8. **Given** Flyway migrations on H2 (tests) and Postgres (dev), **when** `V57` runs, **then** 8 `@seed.demo.test` personas (`d0000001`…`d0000008`) receive inferred `male`/`female` **only if** `gender IS NULL`. [Source: `V57__bootstrap_demo_roster_gender.sql`]
9. **Given** Improbots dev/demo seed regeneration, **when** `buildImprobotsDevDemoSql` runs, **then** user INSERTs include `gender` and a NULL-only UPDATE block covers all roster members with known first-name inference. [Source: `generate-improbots-seed-sql.js`]
10. **Given** `DemoBootstrapIntegrationTest` and `generate-malice-seed-sql.test.js`, **when** tests run, **then** demo personas and all 32 Improbots seed members have resolvable gender (not `non_specified`). [Source: seed recette gate for **6.21**]

### Cross-cutting

11. **Given** implementation complete, **when** tests run, **then** `./gradlew test`, `node --test scripts/v1/troupeMembersCsv.test.js`, and `node --test scripts/v2/generate-malice-seed-sql.test.js` pass. [Source: AGENTS.md]
12. **Given** all SQL/generator comments, **when** committed, **then** attribution reads **MIG-7** (not Story 6.21). [Source: scope extension]

**Product coverage:** N/A (tooling + seeds). PLAN **MIG-7** ; completes **2.12** AC4 for already-migrated environments ; unblocks **6.21** recette on local seeds.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/`. Admin CSV import UI exists (story **2.3**); only import row messages may change.

---

## Tasks / Subtasks

### Track A — Production backfill (to implement)

#### A1. NULL-only gender rule (AC: 1, 3)

- [x] **Périmètre :** [`UserAccountService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserAccountService.kt)
- [x] Replace `existing.gender != gender` with **`existing.gender == null`** on activated **and** non-activated branches.
- [x] Activated: never touch `display_name` ; set gender only when `existing.gender == null && gender != null`.

#### A2. Import outcome clarity (AC: 2, 7)

- [x] [`UserImportService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserImportService.kt) — distinct row messages:
  - Activated + gender set from NULL → *« Genre complété depuis l'import V1. »* (`success`)
  - Activated + gender already set → *« Compte déjà actif — genre déjà renseigné. »* (`skipped`)
  - Activated + nothing to do → *« Compte déjà actif — inchangé. »* (`skipped`)
- [x] Keep `UserImportResultDto` shape unchanged (message-only differentiation).

#### A3. Tests (AC: 1–3, 11)

- [x] [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt):
  - Activated user `gender = FEMALE` + CSV `male` → stays `FEMALE`, row `skipped`.
- [x] Keep `troupe admin import users csv backfills gender on activated user` green.

#### A4. Runbooks (AC: 6, 7)

- [x] [`preprod-reset-and-migrate.md`](../../docs/v2/migration/preprod-reset-and-migrate.md) — fix stale B2 note ; add **Procedure C — Gender backfill (MIG-7)** + smoke SQL.
- [x] [`v1-troupe-members-csv-recipe.md`](../../docs/v2/migration/v1-troupe-members-csv-recipe.md) — NULL-only rule paragraph.

```sql
-- Smoke (staging/prod)
SELECT COUNT(*) AS with_gender FROM users WHERE gender IS NOT NULL;
SELECT gender, COUNT(*) FROM users GROUP BY gender;
```

### Track B — Dev/demo seeds (done in working tree — finalize & commit)

- [x] [`V57__bootstrap_demo_roster_gender.sql`](../../services/api/src/main/resources/db/migration/V57__bootstrap_demo_roster_gender.sql)
- [x] [`generate-improbots-seed-sql.js`](../../scripts/v2/generate-improbots-seed-sql.js) — `inferSeedGenderFromDisplayName`, `firstTokenFromDisplayName`, gender INSERT + backfill block
- [x] [`R__seed_improbots_dev_demo.sql`](../../services/api/src/main/resources/db/seed-postgresql/R__seed_improbots_dev_demo.sql) regenerated
- [x] [`DemoBootstrapIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/DemoBootstrapIntegrationTest.kt)
- [x] [`generate-malice-seed-sql.test.js`](../../scripts/v2/generate-malice-seed-sql.test.js)
- [x] Re-label comments `Story 6.21` → `MIG-7` in V57, generator, and regen seed if needed (AC: 12)
- [x] Verify: `./gradlew test --tests DemoBootstrapIntegrationTest` and `node --test scripts/v2/generate-malice-seed-sql.test.js`

### Explicit non-goals

- No Firestore-direct production backfill (CSV re-import via UI is the mechanism).
- No sync to `troupe_memberships` (account-level only — 2.12).
- No `apps/web/**/changelog*` in this commit.
- No overwrite of Mon compte gender choices.

---

## Dev Notes

### Current state — READ BEFORE CODING

| Artifact | Track | Status | Action |
|----------|-------|--------|--------|
| `V56__users_gender.sql` | — | done | none |
| `V57__bootstrap_demo_roster_gender.sql` | B | **done** (WT) | re-label ; commit |
| `generate-improbots-seed-sql.js` + regen seed | B | **done** (WT) | re-label ; commit |
| `DemoBootstrapIntegrationTest` + seed tests | B | **done** (WT) | commit |
| `UserAccountService.importMigrationUser` | A | **partial** | NULL-only fix |
| `UserImportService` messages | A | **partial** | distinct copy |
| `TroupeMembershipIntegrationTest` no-overwrite | A | missing | add test |
| Runbooks | A | stale | Procedure C |

### Critical bug — Track A

[`UserAccountService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserAccountService.kt):

```kotlin
// WRONG — overwrites Mon compte
if (gender != null && existing.gender != gender) {

// REQUIRED
if (gender != null && existing.gender == null) {
```

### Track B — seed gender inference

- `inferSeedGenderFromDisplayName(displayName)` — first-token lookup against `SEED_FEMALE_FIRST_NAMES` / `SEED_MALE_FIRST_NAMES` whitelists in [`generate-improbots-seed-sql.js`](../../scripts/v2/generate-improbots-seed-sql.js).
- Demo personas: fixed UUIDs `d0000001`…`d0000008` in [`V57`](../../services/api/src/main/resources/db/migration/V57__bootstrap_demo_roster_gender.sql).
- Improbots: 32 members — gender on INSERT + redundant NULL-only UPDATE block for idempotent re-runs.
- **Origin:** written to unblock **6.21** parity hint recette ; **ownership → MIG-7**.

### Fresh replay vs incremental (Track A)

| Scenario | Action |
|----------|--------|
| Neon reset + migrate **after** 2.12 | Export includes `gender` ; stubs at import ; re-import for activated NULL |
| Neon already loaded (staging Malice) | `npm run export:v1-users:prod` + **Importer utilisateurs CSV** |

### Architecture compliance

| Concern | Rule |
|---------|------|
| Stack | Kotlin Spring Boot ; Flyway `V57` for demo seeds only |
| Auth | Troupe admin for CSV import |
| Enum | Reuse `MemberGender` + `fromV1Csv` — no duplicate mapping |
| Seeds | Regenerate `R__seed_improbots_dev_demo.sql` via generator after JS changes |

### Testing requirements

| Layer | Command |
|-------|---------|
| API import/backfill | `./gradlew test --tests TroupeMembershipIntegrationTest` |
| Demo bootstrap | `./gradlew test --tests DemoBootstrapIntegrationTest` |
| V1 export | `node --test scripts/v1/troupeMembersCsv.test.js` |
| Seed generator | `node --test scripts/v2/generate-malice-seed-sql.test.js` |
| Full API | `./gradlew test` |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **2.12** | done | Prerequisite |
| **6.21** | review | Consumer of seed genders (not in this commit's UI) |
| **16.3** | backlog | Consumer |

### References

- [`member-gender.md`](../specs/spec-member-gender-parity/member-gender.md)
- [`scripts/v1/troupeMembersCsv.js`](../../scripts/v1/troupeMembersCsv.js)
- [`docs/v2/migration/v1-troupe-members-csv-recipe.md`](../../docs/v2/migration/v1-troupe-members-csv-recipe.md)
- [`docs/v2/migration/preprod-reset-and-migrate.md`](../../docs/v2/migration/preprod-reset-and-migrate.md)

---

## Dev Agent Record

### Agent Model Used

(create-story + scope extension 2026-06-06)

### Completion Notes List

- Track A : `UserAccountService.importMigrationUser` — règle NULL-only (`existing.gender == null`) ; outcomes `GENDER_BACKFILLED`, `SKIPPED_GENDER_ALREADY_SET`, `SKIPPED_ACTIVE_UNCHANGED`.
- Track A : `UserImportService` — messages distincts par outcome (AC7).
- Track A : test no-overwrite activated + runbooks B2/B2b + recipe NULL-only.
- Track B : commentaires MIG-7 (V57, générateur, seed regénéré) ; tests DemoBootstrap + generate-malice-seed-sql verts.
- Fix collatéral : `TroupeMemberAdminDto.gender` pour test avatar-guard déjà sur branche (6.21 recette).

### File List

**Track A — production:**

- `services/api/src/main/kotlin/com/hatcast/api/user/UserAccountService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserImportService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `docs/v2/migration/preprod-reset-and-migrate.md`
- `docs/v2/migration/v1-troupe-members-csv-recipe.md`

**Track B — dev/demo seeds:**

- `services/api/src/main/resources/db/migration/V57__bootstrap_demo_roster_gender.sql`
- `scripts/v2/generate-improbots-seed-sql.js`
- `services/api/src/main/resources/db/seed-postgresql/R__seed_improbots_dev_demo.sql`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/DemoBootstrapIntegrationTest.kt`
- `scripts/v2/generate-malice-seed-sql.test.js`

**Collatéral (test suite):**

- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`

**Story / tracking:**

- `_bmad-output/implementation-artifacts/mig-7-backfill-users-gender-from-v1.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-06 : Story created (ready-for-dev).
- 2026-06-06 : Implémentation two-track (A prod NULL-only + B seeds MIG-7) ; sprint → review.
- 2026-06-06 : Code review — 3 patches appliqués, AC6 defer ; sprint → done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés
- [x] **UI : N/A** explicite
- [x] Tasks par track (A implémenter, B done WT)
- [x] Liens fichiers + commandes test
- [x] Exclusion changelog documentée

### Review Findings

- [x] [Review][Defer] AC6 — seuil smoke SQL non chiffré dans le runbook — comparaison manuelle suffisante pour l'iso-V1 gate ; pas de seuil numérique imposé (décision opérateur 2026-06-06).

- [x] [Review][Patch] Faux positif `SKIPPED_GENDER_ALREADY_SET` sans colonne gender [`UserAccountService.kt:34-36`] — corrigé : conflit uniquement si `gender != null && existing.gender != null`.

- [x] [Review][Patch] Parser seed fragile pour INSERT avec `gender = NULL` [`generate-improbots-seed-sql.js:1152-1163`] — regex étendue pour `NULL` ; test unitaire ajouté.

- [x] [Review][Patch] Test manquant pour `SKIPPED_ACTIVE_UNCHANGED` [`TroupeMembershipIntegrationTest.kt`] — 2 tests ajoutés (gender NULL et gender déjà renseigné, CSV sans colonne gender).
