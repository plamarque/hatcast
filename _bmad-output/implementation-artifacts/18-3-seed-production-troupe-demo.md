# Story 18.3: Seed production — Demo troupe, season, ~20 events, fictitious participants

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **new user**,  
I want a **pre-populated Demo season**,  
so that **I can see credible availability and composition states** before creating my own troupe.

## Acceptance Criteria

1. **Given** an **idempotent** script under **`db/migration/`** (Option A — [ADR-0015](../../docs/adr/0015-v2-demo-troupe-product-bootstrap.md); runs on **`cloud`** profile, **not** `db/seed`), **when** Flyway applies migrations, **then** troupe **Démo** exists: `slug = demo`, `is_demo = true`, `join_policy = OPEN`, UUID `a0000001-0000-4000-8000-000000000099`. [Source: epics 18.3 AC1; FR64; ADR-0015]
2. **Given** the bootstrap, **when** applied, **then** season **Saison 2026-2027** exists: `slug = saison-2026-2027`, dates **2026-06-01 → 2027-05-31**, UUID `b0000001-0000-4000-8000-000000000099`, **`is_active = true`**. [Source: epics 18.3 AC2; FR64]
3. **Given** the pedagogical matrix ([PRD FR64](../../_bmad-output/planning-artifacts/prd.md#demo-season-pedagogical-event-matrix-planning-default)), **when** active (non-archived) events are counted, **then** **~20** events cover: preparing (3–4), historical complete (2–3), draft (2), awaiting confirmations (2), gaps (1), complete upcoming (1), longform/travel (2–3), archived/inactive (1–2). [Source: epics 18.3 AC3; FR64]
4. **Given** seeded events, **when** inspected, **then** `template_type` and `role_slots` vary (cabaret, match, longform, deplacement/travel). [Source: epics 18.3 AC4; FR64]
5. **Given** **≥ 8 fictitious participants** (generic first names, **no real emails**), **when** roster is seeded, **then** `season_participants` rows are **`ACTIVE`** with **pre-filled `event_availability`** on a subset of events. [Source: epics 18.3 AC5; FR64]
6. **Given** a subset of events, **when** compositions are seeded, **then** FR28 lifecycle states vary (draft, awaiting confirmations, gaps, complete) — **without** locking the whole season (joiners can still submit availability on **preparing** events). [Source: epics 18.3 AC6; FR64; Epic 6]
7. **Given** prod super-admin accounts, **when** bootstrap or post-deploy runbook runs, **then** `patrice.lamarque@gmail.com` and optionally `impropick@gmail.com` receive **`TROUPE_ADMIN`** on Démo **if** matching `users` rows exist (seeded membership — **not** via self-join). [Source: epics 18.3 AC7; ADR-0015 §6]
8. **Given** analytics FR47, **when** documented in Dev Notes, **then** metrics from `is_demo = true` troupes are **excluded** from pilot-troupe adoption KPIs (filter documented; implementation deferred to Epic 11). [Source: epics 18.3 AC8; FR47]
9. **Product coverage:** FR64; reuse Les Improbots seed patterns (V6/V17/V19/V26) as reference; **UI : N/A** — no changes under `apps/web/`.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — backend-only story (`services/api/` Flyway bootstrap); no user-visible Angular changes. Material 3 section omitted intentionally.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/src/main/resources/db/migration/` (+ optional generator under `scripts/v2/`) — idempotent product bootstrap only; **never** `db/seed`

- [x] **Migration numbering** (AC: 1, 2)
  - [x] Next version after **V32** (`join_policy` / `is_demo`) — use **`V33__bootstrap_demo_troupe.sql`** (or split V33–V36 if file size > ~400 lines; keep order: troupe → season → events → roster → compositions).
  - [x] **Idempotent pattern:** `INSERT … SELECT … WHERE NOT EXISTS (SELECT 1 FROM … WHERE id = ?)` — portable H2 + PostgreSQL (same as [`V3_1__seed_troupe_la_malice.sql`](../../services/api/src/main/resources/db/seed/V3_1__seed_troupe_la_malice.sql)); **no** `ON CONFLICT` (H2 test profile).
  - [x] Troupe INSERT sets **`join_policy = 'OPEN'`**, **`is_demo = true`** explicitly (columns exist since V32).
  - [x] Season INSERT: `is_active = true`, `archived = false`, `start_date = DATE '2026-06-01'`, `end_date = DATE '2027-05-31'`.

- [x] **~20 pedagogical events** (AC: 3, 4)
  - [x] UUID namespace: `c0000001-0000-4000-8000-000000000099` … `c0000020-…` (suffix **`…000099`**, season `b0000001-…-000099`) — **do not** reuse Improbots `…000001` event IDs.
  - [x] Include **`slug`** on each event (V24 column required in prod).
  - [x] Set `template_type` + `role_slots` JSON on INSERT (see [`V17`](../../services/api/src/main/resources/db/seed/V17__seed_malice_members_events_availability.sql) UPDATE pattern or inline on INSERT like [`V26`](../../services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql)).
  - [x] **Reference date for mix:** treat **2026-05-28** as “today” — place 2–3 events **before** (historical complete), majority **after** (preparing / draft / confirmations).
  - [x] Mark **1–2** events `archived = true` (admin-visible inactive).
  - [x] Update `seasons.event_count` / `participant_count` after inserts.

- [x] **Fictitious roster + availability** (AC: 5)
  - [x] **≥ 8** generic personas (e.g. Alex, Camille, Jordan, Léa, Marco, Noémie, Sam, Zoé) — **not** real operator emails.
  - [x] **`event_availability` requires `user_id`** ([`V15`](../../services/api/src/main/resources/db/migration/V15__event_availability.sql)) — create lightweight `users` rows with obfuscated emails **`@seed.demo.test`** (distinct from `@seed.improbots.test`).
  - [x] Chain: `users` → `troupe_memberships` (`MEMBER`) → `season_participants` (`ACTIVE`, linked) → partial `event_availability` on preparing + draft events.
  - [x] UUID prefix: `d0000001-…-000099` (users), `e0000001-…-000099` (memberships), `f0000001-…-000099` (season participants).

- [x] **Composition lifecycle seed** (AC: 6)
  - [x] Map pedagogical intent → DB rows using [`CompositionLifecycleService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt) rules:

    | Target lifecycle | Minimum DB shape |
    |------------------|------------------|
    | **preparing** | No `event_compositions` row **or** row with `validated_at IS NULL` and zero assigned slots |
    | **draft** | `event_compositions` + slots with `participant_id` set, `validated_at IS NULL` |
    | **awaitingConfirmations** | `validated_at` set, all required slots assigned, at least one slot `participation_status = 'PENDING'` |
    | **gapsToFill** | `validated_at` set + empty required slot **or** `DECLINED` assignee |
    | **complete** (historique / upcoming) | `validated_at` set, all required slots `CONFIRMED` or `waived = true` |

  - [x] Reuse slot INSERT patterns from [`V19__seed_malice_composition_drafts.sql`](../../services/api/src/main/resources/db/seed/V19__seed_malice_composition_drafts.sql) and validated rows from [`V26`](../../services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql).
  - [x] Leave **3–4 preparing events** without validated composition so self-joiners (Story **18.2**) can submit fresh availability.

- [x] **Super-admin memberships** (AC: 7)
  - [x] Final section (same or follow-up migration): `INSERT INTO troupe_memberships … SELECT … FROM users u WHERE u.email IN ('patrice.lamarque@gmail.com', 'impropick@gmail.com') AND NOT EXISTS (…)` — **no-op** if user absent (fresh Neon before first login).
  - [x] Role **`TROUPE_ADMIN`**; also ensure matching `season_participants` rows for active season.
  - [x] Document in Dev Notes / [`DEVELOPMENT.md`](../../DEVELOPMENT.md) one-liner: “First prod login → re-run admin membership SQL or wait for next deploy if bootstrap ran before signup.”

- [x] **Optional generator** (maintainability)
  - [x] Consider `scripts/v2/generate-demo-bootstrap-sql.js` (adapt [`generate-improbots-seed-sql.js`](../../scripts/v2/generate-improbots-seed-sql.js)) emitting **`db/migration/`** output — commit generated SQL; document regenerate command in script header. *(Waived: SQL écrit directement en V33–V37.)*

- [x] **Integration test** (AC: 1–6)
  - [x] Add `DemoBootstrapIntegrationTest.kt`: after Flyway, assert troupe `…000099` has `isDemo = true`, `joinPolicy = OPEN`; season active; event count 18–22; ≥ 8 season participants; at least one event each for lifecycles **preparing**, **draft**, **complete** (via API list or repository + `CompositionLifecycleService`).
  - [x] Verify **Les Improbots** (`…000001`) unchanged — still `isDemo = false` (no cross-contamination).

- [x] **Analytics note** (AC: 8)
  - [x] Add Dev Notes bullet + optional comment in migration header: KPI queries must `WHERE troupes.is_demo = false` (FR47); no analytics code in this story.

---

## Dev Notes

### Why this story exists (Epic 18 — prod sandbox data)

| Context | Detail |
|---------|--------|
| **18.1 (done)** | `join_policy`, `is_demo` columns on `troupes` |
| **18.2 (review)** | Self-join OPEN + demo season participant enrollment when `isDemo && active season` |
| **This story** | Inserts prod **Démo** row + pedagogical season via **`db/migration`** per ADR-0015 |
| **18.4 next** | Frontend « Rejoindre la troupe de démonstration » → UUID `…000099` |
| **18.5 next** | `demoTroupeId` env + deprecate `seed-troupe-id` |

### ADR-0015 delivery (critical — do not use `db/seed`)

| Rule | Detail |
|------|--------|
| **Location** | `services/api/src/main/resources/db/migration/V33__*.sql` (and optional V34–V36) |
| **Profiles** | Runs on **all** profiles including **`cloud`** ([ADR-0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md) disables only `db/seed`) |
| **Idempotency** | Fixed UUIDs + `WHERE NOT EXISTS` — safe on Neon reset / redeploy |
| **Never** | Put Démo bootstrap only under `db/seed` — prod would miss it |

### Three troupes — do not conflate

| Name | UUID suffix | Flyway location | After 18.3 |
|------|-------------|-----------------|------------|
| **Les Improbots** | `…000001` | `db/seed` (dev/CI) | Unchanged — rich dev dataset |
| **Démo** | `…000099` | **`db/migration`** (prod bootstrap) | **This story** |
| **La Malice** | varies | V1 migration (real data) | Unaffected |

Local dev will have **both** Improbots (seed) and Démo (migration) after `./gradlew test` or dev startup — intentional; different UUIDs.

### Reserved UUIDs (implementation)

| Entity | UUID |
|--------|------|
| Troupe Démo | `a0000001-0000-4000-8000-000000000099` |
| Season Saison 2026-2027 | `b0000001-0000-4000-8000-000000000099` |
| Events | `c0000001-0000-4000-8000-000000000099` … `c0000020-0000-4000-8000-000000000099` |
| Fictitious users | `d0000001-0000-4000-8000-000000000099` … (≥ 8) |
| Memberships | `e0000001-0000-4000-8000-000000000099` … |
| Season participants | `f0000001-0000-4000-8000-000000000099` … |

### Pedagogical matrix (PRD default → event plan)

| Count | Intent | Suggested implementation |
|-------|--------|--------------------------|
| 3–4 | Availability learning | Upcoming cabaret/match, **no** validated composition |
| 2–3 | Past context | `starts_at` before 2026-05-28, **complete** compositions |
| 2 | Draft workflow | `event_compositions`, slots partial, `validated_at NULL` |
| 2 | Confirmations | `validated_at` set, mixed `PENDING` / `CONFIRMED` |
| 1 | Gap recovery | `validated_at` set, one `DECLINED` or empty required slot |
| 1 | Fully confirmed upcoming | All slots `CONFIRMED` |
| 2–3 | Format variety | longform + deplacement templates |
| 1–2 | Archived | `events.archived = true` |

Exact French titles/locations are implementation choice — keep generic/credible (no PII, no real venue contracts).

### Fictitious participants vs real joiners

| Actor | How they appear |
|-------|-----------------|
| **Seed personas** | `users` + `@seed.demo.test` emails; `MEMBER` memberships; pre-filled availability |
| **Self-join user** (18.2) | Real Google account → `POST /memberships/me` → new membership + season participant on active season |
| **Super-admin** (AC7) | Real prod email → `TROUPE_ADMIN` only if `users` row exists at migration time |

Self-joiners **must not** receive `TROUPE_ADMIN` from bootstrap or join flow.

### Super-admin membership (AC7 runbook)

Prod accounts may not exist when Flyway first runs on empty Neon. Pattern:

```sql
INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at)
SELECT gen_random_uuid(), 'a0000001-0000-4000-8000-000000000099', u.id, 'ACTIVE', 'TROUPE_ADMIN', u.display_name, '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u
WHERE lower(u.email) IN ('patrice.lamarque@gmail.com', 'impropick@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM troupe_memberships tm
    WHERE tm.troupe_id = 'a0000001-0000-4000-8000-000000000099' AND tm.user_id = u.id
  );
```

Use fixed UUIDs instead of `gen_random_uuid()` if H2 test lacks pgcrypto — follow existing seed style. Add matching `season_participants` via same `WHERE NOT EXISTS` pattern.

**Follow-up:** optional **`V37__bootstrap_demo_admin_memberships.sql`** re-applies admin links idempotently after operators sign up (same SQL).

### Reference seeds (copy patterns, not UUIDs)

| File | Reuse for |
|------|-----------|
| [`V3_1`](../../services/api/src/main/resources/db/seed/V3_1__seed_troupe_la_malice.sql) | Idempotent troupe INSERT |
| [`V4`](../../services/api/src/main/resources/db/seed/V4__seed_season_la_malice_2026_2027.sql) | Season shape |
| [`V6`](../../services/api/src/main/resources/db/seed/V6__seed_events_la_malice_2026_2027.sql) | ~20 event volume, titles |
| [`V17`](../../services/api/src/main/resources/db/seed/V17__seed_malice_members_events_availability.sql) | Roster + availability density |
| [`V19`](../../services/api/src/main/resources/db/seed/V19__seed_malice_composition_drafts.sql) | Draft compositions |
| [`V26`](../../services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql) | Historical complete + validated slots |

### Explicit non-goals (scope guard)

| Out of scope | Owner |
|--------------|-------|
| Frontend join button / `demoTroupeId` | **18.4** |
| Remove `HATCAST_SEED_TROUPE_ID` | **18.5** |
| Self-join / join policy API changes | **18.2** (done) |
| Analytics query implementation (FR47 filter) | Epic 11 — document only |
| Les Improbots seed changes | **18.0** (done) |
| ~30+ events (Improbots volume) | Keep ~20 per FR64 |
| Premium / `INVITE_ONLY` on Démo | Démo stays **OPEN** |

### Architecture compliance

- **Stack:** Flyway SQL only; no new Kotlin dependencies unless integration test added.
- **H2 tests:** Spring `@ActiveProfiles("test")` applies `db/migration` + `db/seed` — confirm bootstrap SQL runs without PostgreSQL-only syntax.
- **Schema deps:** V32 columns required; events need `slug` (V24), `template_type`/`role_slots` (V7), composition tables (V18).
- **ADR-0015:** Product data in migration folder — name scripts clearly (`bootstrap_demo_*`).

### Testing standards

```bash
cd services/api && ./gradlew test
```

- New `DemoBootstrapIntegrationTest` — repository assertions + optional `GET /v1/seasons/{seasonId}/events` lifecycle check (session auth from [`TestAuthSupport.kt`](../../services/api/src/test/kotlin/com/hatcast/api/support/TestAuthSupport.kt)).
- Existing Improbots / membership tests must stay green (two troupes coexist in test DB).

### Analytics exclusion (AC8 — documentation only)

Pilot adoption KPIs (FR47) must exclude:
- Troupe rows where `is_demo = true`
- Events/participants under those troupes

Example filter: `JOIN troupes t ON … WHERE t.is_demo = false`. No SQL view required in 18.3 — note for Epic 11 / ops dashboards.

### Previous story intelligence (18.2)

- Demo self-join enrolls season participant when `troupe.isDemo && findByTroupe_IdAndIsActiveTrue` — **requires `is_active = true`** on Demo season (AC2).
- Integration tests in 18.2 create inline demo troupe — **still valid**; bootstrap is additive for prod + full-stack local.
- `./gradlew test` green after 18.2.

### Previous story intelligence (18.1)

- Migration **V32** adds columns; CHECK `troupes_join_policy_chk` validated on H2.
- Les Improbots remains `is_demo = false` — bootstrap must not UPDATE `…000001`.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **18.1** | done | **Blocks** — `join_policy`, `is_demo` columns |
| **18.2** | review | Self-join consumes active Demo season once bootstrap exists |
| Epic 3 / 6 | done | Events, availability, composition lifecycle |
| **ADR-0015** | accepted | **Blocks** — delivery mechanism |
| **18.4** | backlog | UI points to `…000099` |
| **18.5** | backlog | Env config + smoke tests |

### Git intelligence (recent)

- `65620fd` — V32 join_policy / is_demo (18.1 merged).
- `a4f35be` — Les Improbots rename; seed UUID `…000001` stable.
- Rich seed generators under `scripts/v2/generate-improbots-seed-sql.js` — adapt for Demo bootstrap output path.

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Bootstrap prod **Démo** livré en **V33–V37** (`db/migration`, idempotent, profil `cloud`). Troupe `…000099` (`demo`, `OPEN`, `is_demo=true`) + saison active `saison-2026-2027`.
- **20** événements pédagogiques (3 historiques complets, 4 preparing, 2 draft, 2 awaiting, 1 gaps, 1 complete upcoming, longform/déplacement, 2 archivés) ; 8 personas `@seed.demo.test`.
- `V37` + `R__bootstrap_demo_admin_memberships.sql` rattache `patrice.lamarque@gmail.com` / `impropick@gmail.com` en `TROUPE_ADMIN` si comptes présents (repeatable à chaque migrate).
- `DemoBootstrapIntegrationTest` + `./gradlew test` verts. Note FR47 dans en-tête V33 + `DEVELOPMENT.md`.
- Code review : composition historique `c0000002` complétée ; tests AC4–AC6 renforcés.

### File List

- `services/api/src/main/resources/db/migration/V33__bootstrap_demo_troupe.sql`
- `services/api/src/main/resources/db/migration/V34__bootstrap_demo_events.sql`
- `services/api/src/main/resources/db/migration/V35__bootstrap_demo_roster.sql`
- `services/api/src/main/resources/db/migration/V36__bootstrap_demo_compositions.sql`
- `services/api/src/main/resources/db/migration/V37__bootstrap_demo_admin_memberships.sql`
- `services/api/src/main/resources/db/migration/R__bootstrap_demo_admin_memberships.sql`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/DemoBootstrapIntegrationTest.kt`
- `DEVELOPMENT.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-28 : Story **18.3** created via `bmad-create-story` — prod Démo bootstrap via idempotent `db/migration` (FR64, ADR-0015).
- 2026-05-28 : Story **18.3** implemented — Flyway V33–V37, integration test, docs.
- 2026-05-28 : Code review fixes — `c0000002` slots, `R__` admin memberships, tests AC4–AC6.

### Review Findings

- [x] [Review][Patch] Composition historique `c0000002` incomplète — slots match complétés dans `V36`.
- [x] [Review][Decision] AC7 re-run post-signup — migration repeatable `R__bootstrap_demo_admin_memberships.sql` + doc `DEVELOPMENT.md`.
- [x] [Review][Patch] Couverture test insuffisante — lifecycles historiques, templates, dispos dans `DemoBootstrapIntegrationTest`.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR64 / ADR-0015)
- [x] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers seed/migration existants à réutiliser
- [x] `./gradlew test` mentionné (API)
- [x] ADR-0014 vs `db/seed` conflict resolved (Option A in story)
- [x] Composition lifecycle mapping to `CompositionLifecycleService` specified
- [x] Super-admin AC7 no-op-when-user-missing pattern documented
