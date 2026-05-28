# OPS-2 — CI integration tests (API gate for M1)

**Status:** done

**PLAN:** [PLAN.md](../../PLAN.md) § Pre-prod V2 (gate **M1** option B), backlog ops **OPS-2**  
**SCP:** [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](../planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md)  
**Triage:** [deferred-triage-2026-05.md](deferred-triage-2026-05.md) — **DW-099**, **DW-001**, **DW-004**, **H-CI-TEST**  
**Predecessor:** [ops-1-flyway-seed-split-preprod.md](ops-1-flyway-seed-split-preprod.md) (done)

---

## Story

As a **platform maintainer**,  
I want **API integration tests to run reliably in CI with a documented test database strategy**,  
so that **staging deploy (M1) and migration recette are not blocked by unknown-red `./gradlew test` and deferred integration tests are validated**.

---

## Acceptance Criteria

1. **Given** a pull request or push that touches `services/api/**`, `services/api/build.gradle.kts`, or the new workflow file, **when** GitHub Actions runs, **then** a dedicated workflow executes `./gradlew test` in `services/api/` and fails the check on test failure.

2. **Given** the workflow from AC1, **when** it completes successfully on the default branch workflow path, **then** these integration suites are included in the run (no `@Disabled` added to pass CI): `MemberSeasonGlanceIntegrationTest`, `ShareRecipientsIntegrationTest`, and the full existing `@SpringBootTest` integration set under `services/api/src/test/kotlin/`.

3. **Given** `./gradlew test` today uses profile `test` + H2 ([`application-test.yml`](../services/api/src/test/resources/application-test.yml)), **when** this story is done, **then** [`services/api/README.md`](../services/api/README.md) documents: (a) local command, (b) H2 vs production Postgres (Neon), (c) Flyway `migration` + `seed` locations in test, (d) known H2 shims (`TIMESTAMPTZ` domain, `gen_random_uuid` per V23 comment), (e) how CI runs tests.

4. **Given** triage **DW-028–030–037** (obsolete pgcrypto deferred text), **when** documentation is updated, **then** add a short note in README or [`deferred-work.md`](deferred-work.md) archive header (if **DOC-1** not done yet): V23 uses `gen_random_uuid`; H2 alias is test-profile only — **no** `CREATE EXTENSION pgcrypto` in migrations.

5. **Postgres parity (minimum):** **Given** production runs on PostgreSQL (Neon), **when** implementing CI, **then** either:
   - **(A — preferred if green):** CI uses existing H2 `test` profile and a follow-up issue is **not** required; README states H2 is the CI default and lists SQL portability rules, **or**
   - **(B):** Add a second CI job (or replace H2) using **GitHub Actions `services: postgres`** (Postgres 15+) **or** Testcontainers, with `application-test-postgres.yml` (migration only, **no** `db/seed` unless required for integration fixtures), and `./gradlew test` passing on both profiles **or** only on Postgres if H2 is retired.

   **PO gate:** Option A is acceptable for **M1** if AC1–3 are met and integration tests are green in CI; Option B is still valuable before **MIG-2** if H2/SQL drift is found.

6. **Given** OPS-2 is **done**, **when** updating hygiene tracking, **then** mark **OPS-2** `[x]` in PLAN backlog ops and close deferred items **DW-001**, **DW-004**, **DW-099** cluster in triage notes (archive pointers in deferred-work when **DOC-1** lands).

**Product coverage:** PLAN hygiene / M1 gate — not a SPEC feature.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/`; backend CI and documentation only.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/`, `.github/workflows/`, docs — no Angular changes.
- [x] Audit: confirm `./gradlew test` passes locally on current branch (baseline).
- [x] Add workflow `.github/workflows/api-test.yml` (name TBD): JDK 21, cache Gradle, `working-directory: services/api`, `./gradlew test --no-daemon`; triggers on `pull_request` + `push` to `v2` / `main` (align with [apps-web.yml](../../.github/workflows/apps-web.yml)); `paths` filter `services/api/**` and workflow file.
- [x] If monorepo PRs need it: optional `workflow_dispatch` for manual rerun.
- [x] Fix any test/Flyway/seed failure exposed in CI (e.g. `V3_1` seed portability — already without `ON CONFLICT` per OPS-1).
- [x] Update `services/api/README.md` § Tests per AC3–4.
- [x] (Optional AC5B) Add `application-test-postgres.yml` + Postgres service job; document env vars `HATCAST_DATASOURCE_*` for local postgres docker if useful. — **Skipped** (AC5 option A).
- [x] Update PLAN.md: **OPS-2** statut `[x]` when complete.
- [x] Update `sprint-status.yaml`: `ops-2-ci-integration-tests-postgres: review` (dev-story completion gate).
- [x] Append closure note to `deferred-work.md` for DW-001 / DW-004 (or wait for DOC-1 archive block).

---

## Dev Notes

### Problem statement

- **No** GitHub Actions job today runs `./gradlew test` for `services/api` (only deploy workflows reference `services/api/**`).
- Deferred reviews (**16-1**, **6-10**) could not run integration tests locally when Flyway/H2/seed failed; **OPS-1** fixed seed split; local `./gradlew test` is **green** (2026-05-28) on H2.
- **M1** (staging infra) is gated on **OPS-2** per PO option **B** — this story unblocks staging deploy confidence, not Neon schema itself.

### Technical guardrails

| Topic | Action |
|--------|--------|
| Test profile | `@ActiveProfiles("test")` on integration tests; config in `src/test/resources/application-test.yml`. |
| Flyway | Test loads `classpath:db/migration,classpath:db/seed` — same as dev; cloud profile excludes seed (ADR-0014). |
| Do not | Point CI at Neon staging/prod credentials. |
| Do not | Weaken tests (`@Disabled`, delete integration tests) to green CI. |
| SQL portability | Migrations must stay H2-compatible for default CI unless AC5B moves CI to Postgres-only. |
| Integration count | ~20 `@SpringBootTest` classes — full suite must run in CI. |

### Reference files

| File | Role |
|------|------|
| [`services/api/build.gradle.kts`](../services/api/build.gradle.kts) | Java 21, Spring Boot, H2 testRuntime |
| [`services/api/src/test/resources/application-test.yml`](../services/api/src/test/resources/application-test.yml) | H2 in-memory DSN |
| [`services/api/src/main/resources/db/seed/V3_1__seed_troupe_la_malice.sql`](../services/api/src/main/resources/db/seed/V3_1__seed_troupe_la_malice.sql) | Seed used by glance tests (`seedTroupeId` constants) |
| [`MemberSeasonGlanceIntegrationTest.kt`](../services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceIntegrationTest.kt) | DW-001 |
| [`ShareRecipientsIntegrationTest.kt`](../services/api/src/test/kotlin/com/hatcast/api/share/ShareRecipientsIntegrationTest.kt) | DW-004 |
| [`.github/workflows/apps-web.yml`](../.github/workflows/apps-web.yml) | Pattern for path-filtered PR checks |

### Suggested CI skeleton (implementer may adjust)

```yaml
name: services/api (tests)
on:
  pull_request:
    paths: ['services/api/**', '.github/workflows/api-test.yml']
  push:
    branches: [v2, main]
    paths: ['services/api/**', '.github/workflows/api-test.yml']
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: gradle
      - run: ./gradlew test --no-daemon
        working-directory: services/api
```

For AC5B, add `services.postgres` and a second Gradle task or `-Dspring.profiles.active=test-postgres` only if H2 proves insufficient.

### Explicit non-goals

- Deploy **M1** (staging Neon, GitHub environment) — separate ops task.
- Frontend `npm test` / Playwright — out of scope.
- Fixing hygiene stories **5-7**, **2-10**, etc.
- Mandatory Testcontainers dependency **unless** AC5B path B is chosen.

### Dependencies

| Artifact | Status | Relationship |
|----------|--------|--------------|
| **OPS-1** | done | Seed/migration split — prerequisite context |
| **M1** | blocked on this story | Consumer of CI gate |
| **DOC-1** | backlog | May consolidate deferred archive text |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story OPS-2)

### Completion Notes List

- Baseline `./gradlew test` green locally (H2, ~22 `@SpringBootTest` classes).
- Added `.github/workflows/api-test.yml` — JDK 21, Gradle cache, `workflow_dispatch`, path filters aligned with `apps-web.yml`.
- **AC5 option A** : CI reste sur profil `test`/H2 ; pas de job Postgres/Testcontainers (documenté comme option avant MIG-2).
- README § Tests étendu (local, H2 vs Neon, Flyway seed, shims, CI).
- PLAN **OPS-2** `[x]` ; triage DW-001/004/099 fermés ; en-tête archive `deferred-work.md`.
- **CI GitHub Actions :** run `26564531586` (**échec** sur `188148b` — 2 tests composition, flake H2 `TIMESTAMPTZ` nanosecondes) ; commit `b7dd808` stabilise les assertions ; run `26564855831` (**succès**, branche `v2`).

### File List

- `.github/workflows/api-test.yml` (new)
- `services/api/README.md`
- `PLAN.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/deferred-triage-2026-05.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/ops-2-ci-integration-tests-postgres.md`
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt` (follow-up `b7dd808` — CI green)
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionValidateUnlockIntegrationTest.kt` (follow-up `b7dd808`)

### Review Findings

- [x] [Review][Patch] PLAN gate text says « CI Postgres vert » while OPS-2 ships H2 (`api-test.yml`) — align `PLAN.md` hygiene line and OPS-2 backlog title with H2/CI wording [`PLAN.md`:263, `:278`]
- [x] [Review][Patch] Story completion omits CI evidence and follow-up commit — document run `26564855831` (success) after failed `26564531586` on `188148b`; note `b7dd808` fixes H2 `TIMESTAMPTZ` nanosecond flake in composition idempotency tests [`ops-2-ci-integration-tests-postgres.md`:142-149]
- [x] [Review][Patch] Gradle cache may miss in monorepo — add `cache-dependency-path` to `setup-java` in `api-test.yml` [`.github/workflows/api-test.yml`:24-28]
- [x] [Review][Defer] Required status check / branch protection for `services/api (tests)` not verified in repo settings — deferred, ops outside diff

---

## Change Log

| Date | Change |
|------|--------|
| 2026-05-28 | Story created (`bmad-create-story`) — hygiene H1 gate for M1 option B |
| 2026-05-28 | Implemented: CI workflow, README, PLAN/triage/deferred closure; AC5A |
| 2026-05-28 | Code review: PLAN H2 wording, CI run notes, `cache-dependency-path` in workflow |
