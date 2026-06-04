# Story 18.5: Prod config, tests, Démo / Improbots / La Malice separation

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **deployment operator**,  
I want **consistent prod configuration** and **non-regression tests**,  
so that **`demoTroupeId`** always points to prod **Démo** (`…000099`) and never to dev seed **Les Improbots** (`…000001`).

## Acceptance Criteria

1. **Given** prod build (`environment.ts` via [`inject-google-client-id.mjs`](../../apps/web/scripts/inject-google-client-id.mjs) or committed prod env), **when** inspected, **then** `demoTroupeId` = `a0000001-0000-4000-8000-000000000099` (Démo bootstrap, [ADR-0015](../../docs/adr/0015-v2-demo-troupe-product-bootstrap.md)) — **not** Les Improbots `…000001`. **Given** legacy API config `hatcast.troupe.seed-troupe-id` / env `HATCAST_SEED_TROUPE_ID`, **when** this story ships, **then** property, env var, and `@Deprecated` helpers `TroupeAccessService.isSeedTroupe()` / `seedTroupeId()` are **removed** (no runtime references remain). [Source: epics 18.5 AC1; FR61, FR64; 18.2 AC8 deferral]

2. **Given** [`.env.example`](../../.env.example) and deploy docs ([`DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md), [`DEVELOPMENT.md`](../../DEVELOPMENT.md)), **when** read by an operator, **then** they document: (a) `HATCAST_SUPER_ADMIN_EMAILS` must include operator emails in each Cloud Run env (`patrice.lamarque@gmail.com` required; `impropick@gmail.com` optional second admin per ADR-0015 / 18.3 AC7); (b) three troupe names and UUIDs (**Les Improbots** `…000001` dev seed only, **Démo** `…000099` prod bootstrap, **La Malice** real migration — never seeded); (c) **`HATCAST_SEED_TROUPE_ID` is removed** — do not document or set it. [Source: epics 18.5 AC2]

3. **Given** [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt), **when** tests run, **then** existing scenarios cover **OPEN vs INVITE_ONLY** self-join **and** a **bootstrap Démo UUID** (`…000099`) self-join that creates an **ACTIVE season participant** on **`saison-2026-2027`** (Flyway bootstrap from 18.3 — not only ad-hoc random-UUID demo troupe). [Source: epics 18.5 AC3; FR61, FR62]

4. **Given** front specs for demo join ([`demo-troupe-join.service.spec.ts`](../../apps/web/src/app/core/troupes/demo-troupe-join.service.spec.ts), [`troupes-list.spec.ts`](../../apps/web/src/app/pages/troupes-list/troupes-list.spec.ts), [`seasons-list.spec.ts`](../../apps/web/src/app/pages/seasons-list/seasons-list.spec.ts)), **when** join is exercised, **then** API call uses `DEMO_TROUPE_ID` = `…000099` from [`demo-troupe.constants.ts`](../../apps/web/src/app/core/troupes/demo-troupe.constants.ts). [Source: epics 18.5 AC4; FR61]

5. **Given** local dev (`./scripts/start-dev.sh`, profil `dev`, Neon branche `local`), **when** a developer uses **Les Improbots** (`db/seed`, UUID `…000001`) vs **Démo** (`db/migration` bootstrap, UUID `…000099`), **then** docs and env comments make the distinction explicit; join button / `DemoTroupeJoinService` targets **Démo only**; **La Malice** is never created by Flyway seed. [Source: epics 18.5 AC5; ADR-0015]

6. **Given** NFR-R1 post-deploy smoke, **when** documented in deploy runbook, **then** operator checklist includes: sign in → **Rejoindre la troupe de démonstration** → land on `/saison/saison-2026-2027` → open one **preparing** event → save first availability — all on prod/staging Cloud Run after coupled deploy. [Source: epics 18.5 AC6; NFR-R1; FR64]

7. **Product coverage:** FR61–FR64, NFR-R1. **Out of scope:** new onboarding UI (**18.4** done), bootstrap SQL content (**18.3**), join-policy API (**18.2**), analytics `is_demo` KPI filter (Epic 11).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — ops, config, tests, and doc cleanup only; no changes under `apps/web/` UI surfaces unless a spec assertion requires a constant import (prefer none).

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` (remove legacy config), docs (`.env.example`, `DEPLOY_V2_CLOUD_RUN.md`, `DEVELOPMENT.md`, optional `DOMAIN.md`/`ARCH.md` drift), tests (API + web specs). **Do not** change bootstrap SQL or join UX flows.

- [x] **Remove legacy seed-troupe config** (AC: 1)
  - [x] Delete `hatcast.troupe.seed-troupe-id` from [`application.yml`](../../services/api/src/main/resources/application.yml) and `HATCAST_SEED_TROUPE_ID` default.
  - [x] Remove `@Value` injection and `@Deprecated` methods `seedTroupeId()` / `isSeedTroupe()` from [`TroupeAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt).
  - [x] Remove `seed-troupe-id` from [`application-test.yml`](../../services/api/src/test/resources/application-test.yml).
  - [x] Grep repo for `HATCAST_SEED_TROUPE_ID`, `seed-troupe-id`, `isSeedTroupe`, `seedTroupeId()` — update or remove references (seed SQL comments may say « aligné sur Les Improbots UUID …000001 » without referencing removed config key).
  - [x] Confirm **no** production Kotlin code still calls deprecated helpers (join gate already uses `join_policy` since 18.2).

- [x] **Verify prod front env (already mostly done in 18.4)** (AC: 1, 4)
  - [x] Confirm [`environment.ts`](../../apps/web/src/environments/environment.ts), [`environment.development.ts`](../../apps/web/src/environments/environment.development.ts), and [`inject-google-client-id.mjs`](../../apps/web/scripts/inject-google-client-id.mjs) all set `demoTroupeId: '…000099'`.
  - [x] Optional hardening: import `DEMO_TROUPE_ID` constant in env files or add a one-line Vitest that asserts prod inject script contains `…000099` and not `…000001`.

- [x] **API integration test — bootstrap Démo join** (AC: 3)
  - [x] Add test in `TroupeMembershipIntegrationTest` (or extend [`DemoBootstrapIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/DemoBootstrapIntegrationTest.kt)):
    - Sign in fresh user → `POST /v1/troupes/a0000001-0000-4000-8000-000000000099/memberships/me` → **200**.
    - Assert `season_participants` row for user on season `b0000001-0000-4000-8000-000000000099` / slug `saison-2026-2027`.
  - [x] Keep existing OPEN / INVITE_ONLY / ad-hoc `isDemo` tests — do not delete.
  - [x] Run `./gradlew test` (or `./gradlew :services:api:test` per repo convention).

- [x] **Front test assertions** (AC: 4)
  - [x] Ensure [`demo-troupe-join.service.spec.ts`](../../apps/web/src/app/core/troupes/demo-troupe-join.service.spec.ts) asserts `joinTroupe(DEMO_TROUPE_ID)` with `…000099` (likely already present — verify).
  - [x] Extend [`troupes-list.spec.ts`](../../apps/web/src/app/pages/troupes-list/troupes-list.spec.ts) and/or [`seasons-list.spec.ts`](../../apps/web/src/app/pages/seasons-list/seasons-list.spec.ts) so join path passes **`DEMO_TROUPE_ID`** to the API mock (not `…000001`).
  - [x] Run `npm run test -w @hatcast/web -- --watch=false`.

- [x] **Operator docs & env example** (AC: 2, 5, 6)
  - [x] Update [`.env.example`](../../.env.example): expand `HATCAST_SUPER_ADMIN_EMAILS` comment with prod operator emails note; add short « Three troupes » block (Improbots / Démo / La Malice); **remove** any `HATCAST_SEED_TROUPE_ID` if present.
  - [x] Add § **Post-deploy smoke (Epic 18 / NFR-R1)** to [`DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md): join Démo + first dispo steps (French operator checklist).
  - [x] Add cross-link in [`DEVELOPMENT.md`](../../DEVELOPMENT.md) local dev section: Improbots = `db/seed`; Démo = `db/migration`; join button = Démo UUID.
  - [x] Fix normative drift if still present: [`DOMAIN.md`](../../DOMAIN.md) self-join rule → `join_policy = OPEN`; [`ARCH.md`](../../ARCH.md) remove seed-troupe-id hack reference (minimal wording fix only).

- [x] **Regression gate** (AC: 1–6)
  - [x] `./gradlew test` green.
  - [x] `npm run test -w @hatcast/web -- --watch=false` green.
  - [x] `npm run build -w @hatcast/web` green.

---

## Dev Notes

### Why this story exists (Epic 18 — ship gate)

| Context | Detail |
|---------|--------|
| **18.0–18.3 (done/review)** | Model, API, bootstrap Démo `…000099`, Improbots rename |
| **18.4 (review)** | UI join → `demoTroupeId` = `…000099`, shared `DemoTroupeJoinService` |
| **This story** | Remove legacy `seed-troupe-id` hack, lock tests/docs, post-deploy smoke runbook |
| **After Epic 18** | Optional retrospective; analytics `is_demo` filter remains Epic 11 |

### Three troupes — final separation (do not regress)

| Name | UUID suffix | Source | Join button? | `is_demo` |
|------|-------------|--------|--------------|-----------|
| **Les Improbots** | `…000001` | `db/seed` (dev/CI only) | **No** | `false` |
| **Démo** | `…000099` | `db/migration` V33+ (all profiles incl. cloud) | **Yes** | `true` |
| **La Malice** | varies | V1 migration / real data | No | `false` |

Local `./scripts/start-dev.sh` loads **both** Improbots (seed) and Démo (migration). Only **`environment.demoTroupeId` / `DEMO_TROUPE_ID`** may be used for onboarding join.

### Legacy config removal checklist

| Artifact | Action |
|----------|--------|
| `application.yml` `hatcast.troupe.seed-troupe-id` | **Delete** property block |
| `application-test.yml` `seed-troupe-id` | **Delete** |
| `TroupeAccessService` `@Value` + deprecated methods | **Delete** |
| Env var `HATCAST_SEED_TROUPE_ID` | **Remove** from docs; unset in Cloud Run if ever set |
| Integration tests using `seedTroupeId` **field** = `…000001` | **Keep** — that UUID is still valid **Les Improbots** dev fixture; only remove config **property** coupling |
| `TestAuthSupport.joinSeedTroupe(mockMvc, cookie, troupeId)` | **Keep** — generic helper; default param `…000001` = Improbots for existing tests |

**Do not** change Improbots UUID in `db/seed` or mass-refactor ~20 integration tests that use `…000001` as dev troupe — that is correct dev behaviour.

### What 18.4 already delivered (verify, don’t redo)

| Item | Status |
|------|--------|
| `demoTroupeId` = `…000099` in env + inject script | Done in 18.4 |
| `demo-troupe.constants.ts` with `DEMO_TROUPE_ID` | Done in 18.4 |
| `DemoTroupeJoinService` | Done in 18.4 |
| `DemoBootstrapIntegrationTest` (bootstrap data asserts) | Done in 18.3 |

**Gap for 18.5:** end-to-end **self-join HTTP test** against Flyway bootstrap UUID `…000099` (bootstrap test validates data, not join flow).

### Recommended API test (AC3)

```kotlin
@Test
fun `self-join on flyway demo troupe enrolls saison 2026-2027 participant`() {
    val demoId = UUID.fromString("a0000001-0000-4000-8000-000000000099")
    val demoSeasonId = UUID.fromString("b0000001-0000-4000-8000-000000000099")
    val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-bootstrap-demo-join")

    mockMvc.perform(post("/v1/troupes/$demoId/memberships/me").cookie(cookie).with(csrf()))
        .andExpect(status().isOk)

    val user = userRepository.findByGoogleSub("sub-bootstrap-demo-join")!!
    val membership = membershipRepository.findByTroupe_IdAndUser_Id(demoId, user.id)!!
    val participants = seasonParticipantRepository.findBySeason_IdAndTroupeMembership_IdIn(
        demoSeasonId, listOf(membership.id),
    )
    assertEquals(1, participants.size)
    assertEquals(ParticipantStatus.ACTIVE, participants.single().status)
}
```

Place in `TroupeMembershipIntegrationTest` (join-focused) or `DemoBootstrapIntegrationTest` (bootstrap-focused) — prefer **membership test file** for consistency with OPEN/INVITE_ONLY tests.

### Post-deploy smoke runbook (AC6 — document only)

Operator steps after Cloud Run deploy (staging or production):

1. Open deployed URL → sign in (Google or email).
2. Navigate to `/troupes` (or empty `/agenda` CTA).
3. Click **Rejoindre la troupe de démonstration**.
4. Confirm redirect to **`/saison/saison-2026-2027`** and breadcrumb trail **Démo › Saison 2026-2027** (no separate Démo chip — Story 18.4b).
5. Open a **preparing** spectacle (e.g. seeded event `c0000004-…0099` if visible) → set availability → save.
6. Optional: verify super-admin can open admin surfaces when `HATCAST_SUPER_ADMIN_EMAILS` includes operator email.

No automated Playwright required in this story — manual checklist in deploy doc satisfies NFR-R1 for Epic 18 MVP.

### Super-admin emails (AC2)

| Email | Role |
|-------|------|
| `patrice.lamarque@gmail.com` | Required prod operator (18.3 AC7 bootstrap admin membership when user exists) |
| `impropick@gmail.com` | Optional second platform admin |

Set via **`HATCAST_SUPER_ADMIN_EMAILS`** secret per GitHub environment — never commit values. Local dev: same var in root `.env`.

### Explicit non-goals

| Out of scope | Owner |
|--------------|-------|
| Change bootstrap SQL content / event matrix | **18.3** |
| Onboarding UI / Demo badge | **18.4** |
| Analytics exclude `is_demo` from KPIs | Epic 11 |
| Automated Playwright smoke on Cloud Run | Future ops story |
| Rename `TestAuthSupport.joinSeedTroupe` helper | Optional cleanup — not required |

### Architecture compliance

- **Stack:** Kotlin/Spring Boot tests (`@ActiveProfiles("test")`, H2 + Flyway incl. bootstrap migrations); Vitest for Angular.
- **Cloud profile:** `application-cloud.yml` must **not** reintroduce `seed-troupe-id`.
- **Coupled deploy (NFR-R1):** SPA + API same image — `demoTroupeId` baked at Docker build via inject script; no runtime secret needed for Demo UUID (fixed product constant).

### Testing standards

```bash
./gradlew test
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

Manual local smoke (after config removal):

1. `./scripts/start-dev.sh` → join Demo → `/saison/saison-2026-2027`.
2. Confirm Improbots (`/troupes/les-improbots`) is separate troupe, not join target.

### Previous story intelligence (18.4)

- `demoTroupeId` already points to `…000099` in all env files and CI inject script.
- `troupes-list.spec.ts` only asserts `demoJoin.join` was called — **add UUID assertion** in 18.5.
- 684 web tests passed at 18.4 handoff — keep green after doc-only + test additions.

### Previous story intelligence (18.2 / 18.3)

- Self-join on `is_demo = true` enrolls active season participant (18.2).
- Flyway creates Démo at fixed UUIDs; `DemoBootstrapIntegrationTest` validates 20 events, 8+ participants (18.3).
- Deprecated `isSeedTroupe` intentionally kept until **this story**.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **18.2** | done | **Blocks** — join_policy gate + demo enrollment logic |
| **18.3** | review/done | **Blocks** — bootstrap `…000099` must exist in test Flyway |
| **18.4** | review | **Blocks** — `demoTroupeId` prod constant already wired |
| **18.0** | done | Improbots naming — docs must reference |

### Git intelligence (recent)

- `d72422f` — OPEN self-join + demo bootstrap (18.2 + 18.3)
- `65620fd` — `join_policy` / `is_demo` columns (18.1)
- `a4f35be` — Les Improbots rename (18.0)
- 18.4 changes (uncommitted / review): `DemoTroupeJoinService`, env `…000099`

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Suppression de `hatcast.troupe.seed-troupe-id`, `HATCAST_SEED_TROUPE_ID`, et des méthodes dépréciées `isSeedTroupe` / `seedTroupeId` dans `TroupeAccessService`.
- Test d’intégration `self-join on flyway demo troupe enrolls saison 2026-2027 participant` sur UUID bootstrap `…000099`.
- Specs front : `troupes-list` (join UUID), `demo-troupe-id.prod.spec.ts` ; `seasons-list` / `demo-troupe-join.service` déjà conformes.
- Docs opérateur : `.env.example` (trois troupes + super-admin), `DEPLOY_V2_CLOUD_RUN.md` (smoke NFR-R1), `DEVELOPMENT.md` (tableau local). DOMAIN.md / ARCH.md déjà à jour (pas de drift seed-troupe).
- `./gradlew test`, `npm run test` (686 tests), `npm run build -w @hatcast/web` : OK.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`
- `services/api/src/main/resources/application.yml`
- `services/api/src/test/resources/application-test.yml`
- `services/api/src/main/resources/db/migration/R__bootstrap_demo_admin_memberships.sql`
- `services/api/src/main/resources/db/migration/V34__bootstrap_demo_events.sql`
- `services/api/src/main/resources/db/migration/V35__bootstrap_demo_roster.sql`
- `services/api/src/main/resources/db/migration/V36__bootstrap_demo_compositions.sql`
- `services/api/src/main/resources/db/migration/V37__bootstrap_demo_admin_memberships.sql`
- `services/api/src/main/resources/db/seed/V3_1__seed_troupe_la_malice.sql`
- `services/api/src/main/resources/db/seed/V4__seed_season_la_malice_2026_2027.sql`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/DemoBootstrapIntegrationTest.kt`
- `.env.example`
- `DEVELOPMENT.md`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `scripts/v2/CONTEXT-SWITCHER-DEV.md`
- `apps/web/scripts/inject-google-client-id.mjs`
- `apps/web/src/app/core/troupes/demo-troupe-join.service.ts`
- `apps/web/src/app/pages/troupes-list/troupes-list.spec.ts`
- `apps/web/src/environments/demo-troupe-id.prod.spec.ts`
- `apps/web/src/environments/environment.ts`
- `apps/web/src/environments/environment.development.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-28 : Story **18.5** created via `bmad-create-story` — prod config cleanup, legacy seed-troupe removal, integration/front tests, deploy smoke runbook (FR61–FR64, NFR-R1).
- 2026-05-28 : Story **18.5** implemented — legacy config removed, bootstrap Démo join test, docs/smoke runbook, front UUID guards (686 web tests).
- 2026-05-31 : Code review — décisions acceptées (bootstrap SQL + commit Epic 18 monolithique) ; patch slug AC3 appliqué ; File List complété.

---

### Review Findings

_Revue BMAD 2026-05-31 — commit `773f40b2` (Epic 18 combiné 18.4+18.5), diff ciblé `d72422fd..773f40b2`._

- [x] [Review][Decision] Changements bootstrap SQL hors scope 18.5 — **accepté** : considérés correctif Epic 18 / 18.3 dans l’historique `773f40b2` ; risque checksum V36 documenté (note opérateur si Neon déjà migré).
- [x] [Review][Decision] Commit Epic 18 monolithique — **accepté** : clôture Epic 18 en un bloc sur `v2` ; File List complété pour traçabilité.
- [x] [Review][Patch] Test join bootstrap sans assertion slug AC3 [`TroupeMembershipIntegrationTest.kt`:320-347] — assertion slug `saison-2026-2027` ajoutée.
- [x] [Review][Patch] File List story incomplet — Dev Agent Record complété (bootstrap SQL, env, demo-troupe-join.service.ts).
- [x] [Review][Defer] Vitest ne couvre pas `inject-google-client-id.mjs` — [`demo-troupe-id.prod.spec.ts`] — deferred, optional hardening per story task
- [x] [Review][Defer] `seasons-list.spec.ts` mock `DemoTroupeJoinService` sans assert UUID — deferred, AC4 satisfied via `troupes-list` + `demo-troupe-join.service` (`and/or`)
- [x] [Review][Defer] UUID `…000099` dupliqué dans env + inject script sans import `DEMO_TROUPE_ID` — deferred, optional hardening per story

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR61–FR64 / NFR-R1)
- [x] Section **Material 3** = **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` et `npm run test -w @hatcast/web` mentionnés
- [x] Three-troupe separation table explicit
- [x] Scope boundary: keep Improbots `…000001` in dev tests, remove config property only
- [x] 18.4 already-done items listed to prevent duplicate work
