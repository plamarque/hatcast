# Story 6.14: Draw-time chance % snapshot (slice 2)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

**Slice context:** **Slice 1** (committed `fix(availability): Align Dispos chance % with V1 draw`) aligned live % with V1 multi-draw formula and introduced **`SelectionHistoryMode`** (`OPERATIONAL` vs `RETROSPECTIVE`) as an interim rule for **past** events without persisted draw memory. **Slice 2** (this story) **persists** odds at draw time and **reads** them on **past-event Dispos**, with a labelled fallback for **V1-migrated** data.

**Not yet in** [`epics.md`](../planning-artifacts/epics.md) — extension of Epic 6 explainability (**FR19**, **FR24**); add epic row when running `correct-course` if desired.

---

## Story

As a **member or organizer** viewing **Dispos** on a **past** event that had a weighted draw,  
I want **chance percentages to reflect what was shown at draw time**,  
so that **post-hoc history changes** (later validations, new events, compartment rules) **do not rewrite** the fairness narrative participants remember.

As an **organizer** running **`POST …/composition/draw`**,  
I want the server to **persist** the computed **`chancePercent`** (and minimal context) per role/candidate at draw time,  
so that **Équipe explainability** and **Dispos passées** stay consistent with the actual lottery.

---

## Acceptance Criteria

1. **Given** an organizer runs **`POST /v1/seasons/{seasonId}/events/{eventId}/composition/draw`** (full or fill-empty) successfully, **when** the transaction commits, **then** the server **persists** a draw-time snapshot for every **scored candidate** in each draw step: at minimum **`chancePercent`**, **`pastSelectionCount`**, **`requiredCount`**, **`candidateCount`** (pool size for that step), keyed by **`(eventId, roleKey, participantId)`** — values taken from the same `AvailabilityChanceCalculator.scoreCandidates` output used in `steps[]` (**no second formula**). [Source: slice 2 product decision; FR20; FR24]

2. **Given** a **full** draw (`mode=full`), **when** snapshots are written, **then** any previous snapshot rows for that **`eventId`** are **replaced** (not merged with stale participants). [Source: 6.4 full redraw semantics]

3. **Given** a **fill-empty** draw on a draft, **when** only new slots are filled, **then** snapshots for **`(eventId, roleKey, participantId)`** touched in that request are **upserted**; untouched role/participant rows from an earlier draw on the same event **remain** unless the role was cleared by a later full draw. [Source: 6.9 partial fill; 6.4]

4. **Given** an event with **`startsAt < now`** (past) **and** at least one snapshot row exists for the event, **when** any authorized caller requests **`GET …/availability/summary?includeChances=true`**, **then** each **`SummaryRoleCandidateDto.chancePercent`** comes from the **snapshot** when a row exists for that `(roleKey, participantId)`; **`SelectionHistoryMode.RETROSPECTIVE` live recalc is not used** for those cells. [Source: FR19; slice 1 interim behaviour]

5. **Given** a **past** event **without** snapshot rows (typical **MIG-3** compositions: slots exist, no V2 draw audit), **when** `includeChances=true`, **then** the API returns **`chancePercent`** from **`RETROSPECTIVE`** recalc (slice 1) and sets **`chanceSource: "estimated"`** on the summary response (role-level or top-level — pick one shape, document in OpenAPI). [Source: migration recette CCAS #1; FR19 transparency]

6. **Given** a **future** event (`startsAt >= now`), **when** `includeChances=true`, **then** behaviour stays **`OPERATIONAL`** live recalc (**unchanged** from slice 1); **`chanceSource: "live"`** (or omit field defaulting to live). [Source: slice 2 scope guard]

7. **Given** a filled composition slot and explainability visible per **6.4** (`publishedAt` / `validatedAt` / organizer draft), **when** the event is **past** and a snapshot exists for **`(roleKey, assignee participantId)`**, **then** **`CompositionSlotDto.chancePercent`** (and optional **`pastSelectionCount`**) prefer the **snapshot** over live `buildExplainabilityLookup` recalc. [Source: FR24]

8. **Given** manual assign/clear/reassign (**6.5**) **without** a subsequent draw, **when** reading explainability or Dispos on a past event, **then** snapshot % for unaffected participants **remain**; newly manual-only slots **may** have no snapshot row → fall back to **estimated** (AC5) or null % per existing rules — **do not** fabricate snapshot on manual assign in this story. [Source: scope guard]

9. **Given** draw uses **`SelectionHistoryMode.OPERATIONAL`** for weighting (current `CompositionDrawService`), **when** snapshots are stored, **then** stored **`pastSelectionCount`** reflects that operational count at draw time (auditable even if later season history changes). [Source: 17.9 compartment partitioning unchanged]

10. **Given** integration tests, **when** `./gradlew -q test` (API module) runs, **then** new tests cover: draw persists snapshots; past summary reads snapshot; migrated-style past event without snapshot returns **`estimated`**; future event still uses live mode; full redraw replaces snapshots. [Source: repo norms; 6.4 test patterns]

11. **Couverture:** **FR19**, **FR24**; depends on **5.3**, **6.4**, **6.5**, **17.9**, slice 1 **`SelectionHistoryMode`**; does **not** change draw algorithm, compartment rules, or weight formula.

### Explicit out of scope

| Item | Reason |
|------|--------|
| Re-run draw animation from DB | UI keeps using `steps[]` from live `POST draw` only |
| Snapshot on every availability edit | Only draw persists |
| Epic 9 full audit trail | Slice 2 is fairness memory, not actor audit |
| Backfill snapshots for all MIG-3 rows | AC5 **estimated** fallback is enough |
| `legacy/` changes | V2 only |
| Change `SelectionHistoryModeResolver` rules for future events | Slice 1 operational path frozen |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the API exposes `chanceSource === 'estimated'` for a past event summary, **when** the **Tous** panel renders role candidates, **then** display a discrete **`mat-hint`** or `matListItemLine` secondary text on the role panel (French): *« Pourcentages estimés (spectacle migré ou tirage antérieur sans archive) »* — not a blocking dialog. [Source: FRONTEND_UI.md; FR19]

**M3-2. Tokens & thème** — **Given** new hint/line styles, **when** colors are applied, **then** only `var(--mat-sys-on-surface-variant)` or existing `--hatcast-chance-*` — no new hex in feature SCSS. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **UI : N/A** for new interactive controls (copy-only).

**M3-4. Navigation membre** — **UI : N/A**

**M3-5. Revue** — **Given** implementation complete, **when** validating, **then** checklist FRONTEND_UI.md § M3; note if hint is waived for lack of `estimated` in dev seed.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` (primary) + `apps/web/` (hint for `estimated` only) — no `legacy/`.
- [x] **Flyway** (AC: 1–2)
  - [x] Add migration **`V39__event_draw_chance_snapshots.sql`** (V38 already taken — next free version):
    - Table `event_draw_chance_snapshots` (`event_id`, `role_key`, `participant_id`, `chance_percent`, `past_selection_count`, `required_count`, `candidate_count`, `snapshotted_at`, PK `(event_id, role_key, participant_id)`, FK to `events` / `season_participants` as appropriate).
    - Optional: `event_compositions.draw_snapshotted_at` if useful for AC4 fast path — else infer snapshot presence via `EXISTS` on snapshot table.
  - [x] JPA entity + repository (`EventDrawChanceSnapshotEntity`, `EventDrawChanceSnapshotRepository`).
- [x] **Persist on draw** (AC: 1–3, 9)
  - [x] In [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt), after each scored pool / step, collect candidate rows; on commit boundary **`saveAll`** snapshots.
  - [x] **Full draw:** `deleteByEventId` then bulk insert.
  - [x] **Fill-empty:** upsert only participants present in `steps[]` for that request.
  - [x] Extract a small **`CompositionDrawChanceSnapshotService`** if draw method grows — avoid duplicating score logic.
- [x] **Read path — Dispos** (AC: 4–6)
  - [x] Extend [`AvailabilityService.getSummary`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt): if `SelectionHistoryModeResolver.forEvent(event) == RETROSPECTIVE` **and** snapshots exist → map candidates from snapshot; else if retrospective without snapshots → score with `RETROSPECTIVE` + set response `chanceSource`.
  - [x] Extend [`AvailabilityDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt) + [`openapi/availability.yaml`](../../services/api/openapi/availability.yaml) with optional `chanceSource` enum (`live` | `snapshot` | `estimated`).
- [x] **Read path — Équipe explainability** (AC: 7–8)
  - [x] Update [`CompositionService.buildExplainabilityLookupInner`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) to consult snapshots for past events before live scoring.
- [x] **Angular** (AC: M3-1–2)
  - [x] [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts) — type `chanceSource`.
  - [x] [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) / [`availability-tous-panel.html`](../../apps/web/src/app/shared/availability/availability-tous-panel.html) — show hint when `estimated`.
  - [x] Tests: `event-dispos-tab.spec.ts`, `availability-tous-panel` if needed.
- [x] **Tests** (AC: 10)
  - [x] Unit: snapshot service replace/upsert rules.
  - [x] Integration: extend [`CompositionDrawIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt) — after draw, mutate later season validation, assert past summary % **unchanged** vs snapshot.
  - [x] Integration: [`AvailabilityControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt) — past event without snapshot → `chanceSource=estimated`.
  - [x] `./gradlew test` + targeted `ng test` for touched specs.

---

## Dev Notes

### Problem statement (why slice 2 exists)

| Symptom | Root cause |
|---------|------------|
| CCAS #1 past Dispos show % that **drift** after new season draws / validations | Live **`RETROSPECTIVE`** recalc rewrites history |
| « Le tiré avait X % » not auditable after the fact | **`POST draw`** returns `steps[]` but **nothing persisted** except slot assignees |
| MIG-3 events have composition but **no** draw steps in V2 | Need **`estimated`** label, not fake snapshot |

**Slice 1 comment in code** ([`SelectionHistoryMode.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/SelectionHistoryMode.kt)): *RETROSPECTIVE = approximation until slice 2 snapshots exist* — this story **supersedes** retrospective for events **with** snapshots.

### Product rules (normative)

| Event time | Has snapshot? | Dispos `includeChances` | Équipe explainability |
|------------|---------------|-------------------------|------------------------|
| Future | n/a | Live **OPERATIONAL** | Live (organizer draft / post-publish rules unchanged) |
| Past | Yes | **Snapshot** per role/candidate | Prefer snapshot for assigned slots |
| Past | No | **RETROSPECTIVE** + `estimated` | Live retrospective or omit — match 6.4 visibility rules |

**Draw weighting at draw time:** keep **`SelectionHistoryMode.OPERATIONAL`** inside `CompositionDrawService` (already at L102–106). Snapshots **freeze** that operational view.

**Multi-slot same role:** each draw step may produce different `%` as pool shrinks. Persist **per step**; when collapsing to one row per `(event, role, participant)`, use the **last** step in that draw request where the participant appeared (document in code comment). Integration test should assert stable choice.

### Schema recommendation

Prefer **dedicated table** over widening `event_composition_slots`:

- Slots = assignees only; Dispos **Tous** needs **all** candidates’ % at draw time.
- Avoid nullable columns on slot rows that manual assign never sets.

```sql
-- Illustrative — implement in Flyway V38
CREATE TABLE event_draw_chance_snapshots (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    role_key VARCHAR(64) NOT NULL,
    participant_id UUID NOT NULL,
    chance_percent INT NOT NULL CHECK (chance_percent BETWEEN 0 AND 100),
    past_selection_count INT NOT NULL DEFAULT 0,
    required_count INT NOT NULL,
    candidate_count INT NOT NULL,
    snapshotted_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (event_id, role_key, participant_id)
);
```

### Backend implementation guardrails

| Concern | Pattern |
|--------|---------|
| Single formula | Only `AvailabilityChanceCalculator.scoreCandidates` outputs persisted % |
| Transaction | Snapshot writes in same `@Transactional` as draw slot upserts |
| Compartment | History at draw already partitioned (**17.9**); snapshot does not store compartment slug (implicit via event) |
| Performance | One bulk read `findByEventId` when serving past summary; index PK sufficient |
| OpenAPI | Document `chanceSource`; optional `chancePercent` null when not a candidate |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Default load | Keep `includeChances=true` on Dispos (**5.6**) |
| Hint visibility | Show **only** when `chanceSource === 'estimated'` (not on every past event) |
| % display | No change to `--hatcast-chance-*` scale |
| Équipe | No UI change if API returns same numeric fields |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 5.3 | done | Dispos Tous + summary API |
| 5.6 | done | `includeChances=true` by default |
| 6.4 | done | Draw + `steps[]` + explainability |
| 6.5 | done | Manual assign — no snapshot write |
| 6.9 | done | fill-empty draw mode |
| 17.9 | done | Compartment-scoped history at draw |
| Slice 1 commit | done | `SelectionHistoryMode`, exact % formula |
| MIG-3 | done | Compositions without snapshots → AC5 |

### Previous story intelligence (6.13)

- **After-commit** side effects: snapshot persistence is **in-transaction** with draw (domain data), unlike notifications in 6.13.
- Keep draw orchestration readable — extract snapshot helper if `CompositionDrawService` exceeds ~300 lines.

### Git intelligence (recent)

- `0e227fe2` — slice 1 chance % + history modes (base for this story).
- `66ca6ce4` / `15171534` — V1 parity context; do not regress Dispos/Équipe layout.

### Testing commands

```bash
cd services/api && ./gradlew test --tests '*CompositionDraw*' --tests '*Availability*'
cd apps/web && npm run test -- --include='**/event-dispos-tab.spec.ts'
```

### Manual recette (post-dev)

1. Future spectacle: note % in **Tous** → run draw → change another event’s validation → revisit future event: % **may** change (live).
2. Same season **past** spectacle with draw: % **stable** after step 1.
3. MIG past event (composition, never drawn in V2): hint **estimation** visible, % retrospective only.
4. Full redraw on past event draft (if unlocked): snapshots replaced; % match new draw `steps[]`.

---

### Review Findings

_Code review 2026-05-31 (adversarial 3 layers: Blind Hunter, Edge Case Hunter, Acceptance Auditor)._

- [x] [Review][Patch] Libellé `chanceSource` global à l'événement → résolution par (rôle, candidat) : snapshot si présent, sinon recalcul rétrospectif ; `chanceSource = "snapshot"` seulement si aucun repli n'a été utilisé, sinon `"estimated"` → plus de % vides, hint cohérent. [AvailabilityService.kt:202-308]
- [x] [Review][Patch] Candidats sans snapshot Dispos vs Équipe → désormais alignés : les deux endpoints préfèrent le snapshot puis repli rétrospectif (corrigé par le patch précédent ; `CompositionService.buildExplainabilityLookupInner` faisait déjà ce repli). [AvailabilityService.kt / CompositionService.kt:360-405]
- [x] [Review][Patch] Redraw FULL sur rôle partiellement rempli → `replaceForFullDraw(eventId, fullyRedrawnRoleKeys, …)` ne supprime que les rôles entièrement re-tirés ; les assignés conservés gardent leur % figé. [CompositionDrawService.kt:122-141,282-289 / CompositionDrawChanceSnapshotService.kt:30-49 / EventDrawChanceSnapshotRepository.kt]
- [x] [Review][Patch] Redraw FULL avec pool vide → garde : on ne supprime un rôle que s'il produit de nouvelles lignes (`fullyRedrawnRoleKeys ∩ rolesWithFreshRows`) → un rôle sans candidat ne wipe plus son snapshot. [CompositionDrawChanceSnapshotService.kt:30-49]
- [x] [Review][Patch] Helper de test renommé `setAvailabilityForMember` + paramètre `admin` mort supprimé. [AvailabilityControllerIntegrationTest.kt:865]
- [x] [Review][Defer] Participant assigné manuellement hors du pool courant omis de l'explainability (`scoredByParticipant[id]?.let{}` sans `else`) — gap pré-existant du chemin live, non introduit par le snapshot. [CompositionService.kt:393-404] — deferred, pre-existing
- [x] [Review][Defer] Pas de FK/cascade sur `participant_id` dans V39 — lignes orphelines au retrait d'un participant (croise la story 3-19 en cours). Faible impact car les chemins d'affichage joignent sur les candidats courants. [V39__event_draw_chance_snapshots.sql:11-12] — deferred, cross-story

_Dismissed as noise (5): hint M3-1 via `<p>` stylé plutôt que `mat-hint`/`matListItemLine` (déviation acceptée, fonctionnellement conforme) ; upsert fill-empty écrase les % figés des candidats encore en lice (conforme AC3 « rows touched upserted ») ; fill-empty ne purge jamais les lignes obsolètes (conforme AC3 « untouched remain ») ; frontière `startsAt == now` → live (1 instant, négligeable) ; littéraux `live`/`snapshot`/`estimated` dupliqués sur 3 couches + DTO `String?` au lieu d'enum (acceptable, aligné au contrat OpenAPI)._

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 6-14)

### Completion Notes List

- Table `event_draw_chance_snapshots` (Flyway **V39** — V38 déjà pris par `season_participant_removal_source`).
- `CompositionDrawChanceSnapshotService` : replace (full draw) / upsert (fill-empty) ; dernière étape gagne par `(roleKey, participantId)`.
- `AvailabilityService.getSummary` : `chanceSource` = `live` | `snapshot` | `estimated` selon passé/futur et présence de snapshots.
- `CompositionService.buildExplainabilityLookupInner` : snapshot prioritaire sur slots assignés passés ; repli rétrospectif pour assignations manuelles sans snapshot.
- UI : hint discret dans `availability-tous-panel` quand `chanceSource === 'estimated'`.
- Tests : `./gradlew test` OK ; `availability-tous-panel.spec.ts` + régression `event-dispos-tab.spec.ts` OK.

### File List

- services/api/src/main/resources/db/migration/V39__event_draw_chance_snapshots.sql
- services/api/src/main/kotlin/com/hatcast/api/composition/EventDrawChanceSnapshotEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/EventDrawChanceSnapshotRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawChanceSnapshotService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/SelectionHistoryMode.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt
- services/api/openapi/availability.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- apps/web/src/app/core/availability/availability-api.service.ts
- apps/web/src/app/shared/availability/event-dispos-tab.html
- apps/web/src/app/shared/availability/availability-tous-panel.ts
- apps/web/src/app/shared/availability/availability-tous-panel.html
- apps/web/src/app/shared/availability/availability-tous-panel.scss
- apps/web/src/app/shared/availability/availability-tous-panel.spec.ts

### Change Log

- 2026-05-31: Story created (ready-for-dev) — slice 2 snapshot chances at draw.
- 2026-05-31: Implemented slice 2 — persist draw snapshots, read paths, UI hint, tests (status → review).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (FR19/FR24, slice 2)
- [x] Section **Material 3** remplie (hint `estimated`)
- [x] Tasks référencent AC + fichiers existants
- [x] Tests et recette manuelle mentionnés
- [x] Statut **ready-for-dev**
