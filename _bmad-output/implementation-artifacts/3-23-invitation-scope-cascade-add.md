# Story 3.23: Invitation scope and upward inclusion on add

---
baseline_commit: 6b7bbc1e308dadf084de27cbfd3a746142e8637a
---

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer adding a guest at season or event level**,  
I want the system to **upsert carnet + roster rows with the correct invitation scope**,  
so that **Laetitia (season-scope MC) and Ruben (one-shot DJ) workflows work without a separate Membres step** (**ADR-0021** P2, **FR43–FR45**).

**Plan source:** [sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md](../planning-artifacts/sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md) — approved 2026-06-06.

## Acceptance Criteria

1. **Given** the participant schema, **when** migrated, **then** `season_participants.invitation_scope` (`SEASON` | `EVENT`, nullable) exists with Flyway **V60** and is exposed on OpenAPI `SeasonParticipantAdmin` + optional `ParticipantCreateRequest.invitationScope`. [Source: epics 3.23 AC1; ADR-0021 §3]
2. **Given** a season participant add for a **non-troupe-member** (free-text name or email, not an existing `MEMBER`/`TROUPE_ADMIN` membership selection), **when** `POST .../participants` succeeds, **then** the API upserts an active **`EXTERNE`** carnet row (match order: linked user → normalized email → inactive externe display name) **and** creates/reactivates a `season_participants` row with `invitation_scope = SEASON`, `troupe_membership_id` set to the carnet row, and stable IDs on re-inclusion. [Source: epics 3.23 AC2; ADR-0021 §4.2 Laetitia]
3. **Given** an event-scoped participant add (spectacle admin), **when** `POST .../events/{eventId}/participants` succeeds with default body, **then** the API upserts **`EXTERNE`** carnet + creates/reactivates **`event_participants`** for that spectacle; **does not** create a season roster row unless opt-in (AC4); Ruben has carnet + event history without season-wide dispos eligibility. [Source: epics 3.23 AC3; ADR-0021 §4.1 Ruben]
4. **Given** the event add dialog/API, **when** organizer opts in **« Ajouter aussi à la saison »** (`addToSeasonRoster: true`, default **false**), **then** upsert `season_participants` with `invitation_scope = EVENT` linked to the same carnet, and link the new `event_participants.season_participant_id` to that row. [Source: SCP §4.6 UI copy matrix; ADR-0021 §4.1 optional season row]
5. **Given** re-inclusion of the same person (removed season/event row or inactive externe carnet), **when** add is submitted again, **then** reuse stable IDs (`troupe_membership_id`, `season_participant_id`, `event_participant_id`) — **forbidden** to mint new UUIDs. [Source: epics 3.23 AC4; SCP 2026-05-31 §2.1; ADR-0021 §4.4]
6. **Given** a troupe **`MEMBER`/`TROUPE_ADMIN`** selected via typeahead (existing membership), **when** season add succeeds, **then** behaviour is **unchanged** — no carnet upsert, no `invitation_scope`, membership sync semantics preserved. [Source: story **3.8c** non-regression]
7. **Given** `SEASON`-scoped season participant and an event exclusion, **when** building event roster, **then** exclusion behaviour is **unchanged** (local hide only). [Source: SCP story 3.23 AC6 summary; ADR-0021 §3]
8. **Given** an externe carnet `displayName` or email is updated, **when** linked `season_participants` rows exist for that `troupe_membership_id`, **then** propagate name/email/user link to those rows (closes 2.21 deferred review item). [Source: 2-21 Review Findings defer → 3.23]
9. **Given** implementation complete, **when** tests run, **then** integration tests cover: season externe cascade (name-only + email-linked); event one-shot (carnet + event, no season row); event opt-in season row (`EVENT` scope); re-inclusion stable IDs; MEMBER typeahead add regression; `ParticipantKind` / DTO correctness for externe-linked rows. [Source: SCP §7 success criteria]

**Product coverage:** FR43, FR44, FR45; ADR-0021 P2; SCP §4.6 French labels.

**Out of scope (later stories):** typeahead carnet pool (**3.8d**); guest scoped dispos/agenda (**3.25**); self-service invite (Epic **7**); enforcing scope in availability guards (3.25 — document only in Dev Notes).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** add-dialog changes, **when** scope UI is added, **then** reuse existing dialog shell: `mat-dialog`, `mat-form-field` outline, `mat-checkbox` for event opt-in « Ajouter aussi à la saison », paragraph hints (not `mat-hint`) — mirror [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts) and [`add-event-participant-dialog.ts`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts). [Source: FRONTEND_UI.md; story **3.8c**]

**M3-2. Tokens & thème** — **Given** new scope labels and checkbox, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** add dialogs render scope copy + checkbox, **then** dialog width `min(100vw - 2rem, 28rem)`; checkbox row touch target ≥ 48dp; `aria-label` French if icon-only controls added. [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** — admin-only participant dialogs; no member chrome.

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked; waived items noted in Dev Notes.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — **do not modify** `legacy/`.
- [x] **Flyway V60** `V60__season_participant_invitation_scope.sql` (AC: 1)
  - Add nullable column `invitation_scope VARCHAR(16) CHECK (invitation_scope IN ('SEASON', 'EVENT'))` on `season_participants`.
  - Backfill: leave **NULL** for existing rows (member-synced and legacy explicit participants).
  - Optional partial index on `(season_id, invitation_scope) WHERE status = 'ACTIVE'` if query patterns need it — not required for MVP.
- [x] **Domain enum + entity** (AC: 1, 2–5)
  - New `InvitationScope` enum (`SEASON`, `EVENT`) in `services/api/.../participant/`.
  - [`SeasonParticipantEntity`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt) — add `invitationScope: InvitationScope?`.
  - Fix [`SeasonParticipantEntity.kind()`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt): when `troupeMembership?.baselineRole == EXTERNE` → return new or existing kind (prefer extend `ParticipantKind` with **`EXTERNE`** or map to `MANAGED` with `invitationScope` on DTO — **must not** label externes as `MEMBER`).
- [x] **Carnet upsert helper** (AC: 2–5) — extract reusable logic from [`TroupeMembershipService.addExterne`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt):
  - New `TroupeExterneCarnetService.upsertActiveExterne(troupeId, displayName, email?, actorUserId?)` — same match/reactivation order as `findInactiveExterneForReactivation` (user → email → inactive display name).
  - Callable from participant services **without** troupe-admin permission (organizer participant-admin is sufficient); pass `actorUserId` for audit.
  - **Do not** duplicate email validation — reuse `TroupeExterneEmailSupport`.
- [x] **Season create cascade** (AC: 2, 5, 6) — [`SeasonParticipantService.create`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt):
  - If request resolves to existing **MEMBER/TROUPE_ADMIN** active membership (via typeahead `troupeMembershipId` future or userId match) → **existing path**, no carnet.
  - Else (name-only / managed guest): call carnet upsert → set `troupeMembership`, `invitationScope = SEASON`, link user/email from carnet.
  - Re-inclusion: extend `findReactivatableRemoved` to also match by `troupe_membership_id` when carnet exists.
  - Preserve gender write path ([`ParticipantGenderWriteSupport`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantGenderWriteSupport.kt)).
- [x] **Event create cascade** (AC: 3–5) — [`EventParticipantService.create`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt):
  - Always upsert carnet for non-member adds.
  - Default: event-only row (`seasonParticipant = null`); EVENT scope **implicit** (no season row) per ADR-0021 §3.
  - When `addToSeasonRoster == true`: upsert/reactivate season row with `invitationScope = EVENT`, link event row.
  - Re-inclusion: match removed event rows by user/email/name **and** carnet membership id.
- [x] **Carnet rename propagation** (AC: 8) — [`TroupeMembershipService.updateMember`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) or sync hook:
  - On EXTERNE displayName/email/user update → update linked `season_participants` where `troupe_membership_id = membership.id` and `status = ACTIVE`.
- [x] **OpenAPI** [`participants.yaml`](../../services/api/openapi/participants.yaml) (AC: 1)
  - `InvitationScope` enum schema.
  - `SeasonParticipantAdmin.invitationScope` nullable.
  - `ParticipantCreateRequest`: optional `invitationScope`, `addToSeasonRoster` (event-only, default false).
- [x] **Angular** (AC: 3–4, M3)
  - [`participant-api.service.ts`](../../apps/web/src/app/core/participants/participant-api.service.ts) — extend create bodies.
  - **Season add** [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts): add read-only scope hint paragraph **« Externe saison — disponibilités sur toute la saison »** when submit is for non-member (no selected troupe MEMBER/ADMIN); hide hint when typeahead selected a member/admin.
  - **Event add** [`add-event-participant-dialog.ts`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts):
    - Replace intro copy (remove « sans effet sur le roster saison » — contradicts cascade).
    - Add `mat-checkbox` **« Ajouter aussi à la saison »** (default unchecked) → `addToSeasonRoster`.
    - Scope hint **« Externe spectacle — ce spectacle seulement »** (default).
  - Regenerate or hand-update OpenAPI client types if project uses codegen (else extend TS interfaces manually).
- [x] **Tests** (AC: 9)
  - API integration: `ParticipantControllerIntegrationTest` or dedicated `ParticipantExterneCascadeIntegrationTest`.
  - Unit: `SeasonParticipantEntity.kind()` for EXTERNE membership.
  - Web: dialog specs — checkbox default off; season hint visibility; submit payload includes flags.
  - Regression: `./gradlew test --tests '*Participant*' --tests '*TroupeMembership*'` ; `npm run test -w @hatcast/web -- --run add-participant-dialog add-event-participant-dialog`.

---

## Dev Notes

### Product and UX rules

- **Three layers (ADR-0021):** Carnet (A) alone grants nothing; invitation scope (B) defines dispos/agenda (enforced in **3.25**); account (C) enables self-service.
- **French labels (locked, SCP §4.6):**

  | Surface | Label |
  |---------|-------|
  | Season add scope | Externe saison |
  | Event add scope (default) | Externe spectacle |
  | Event opt-in checkbox | Ajouter aussi à la saison |

- **Laetitia path:** Season admin add → carnet + `SEASON` scope season row.
- **Ruben path:** Event admin add → carnet + event row only; no season-wide dispos until **3.25** enforces scope in guards (today all roster rows may still appear in dispos UI — acceptable; note in handoff).
- **Member typeahead path:** Selecting active `MEMBER`/`TROUPE_ADMIN` → **no** carnet upsert; existing membership-sync row or explicit create with `troupe_membership_id` pointing to member membership — `invitation_scope` stays NULL.
- **Stable identity:** Reuse IDs on reactivation — align with [`SeasonParticipantService.findReactivatableRemoved`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) and carnet reactivation in [`TroupeMembershipService.findInactiveExterneForReactivation`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt).

### Current state (must read before coding)

| Area | Today | This story changes |
|------|-------|-------------------|
| `season_participants` | No `invitation_scope`; externe adds don't upsert carnet | Column + cascade on create |
| `SeasonParticipantEntity.kind()` | Any `troupeMembership != null` → `MEMBER` | Branch on `baselineRole == EXTERNE` |
| `SeasonParticipantService.create` | Plain row, no carnet | Upsert carnet for guest adds |
| `EventParticipantService.create` | Plain event-only row | Upsert carnet + optional season row |
| `ensureMembershipParticipants` | Skips EXTERNE (2.21) | **Preserve** — no auto-sync externes |
| Event add dialog intro | « sans effet sur le roster saison » | Update — cascade upserts carnet |
| Typeahead pool | MEMBER/ADMIN only (`participant-member-suggestions.ts`) | **No change** (3.8d) |

### Schema decision

```sql
-- V60 (illustrative)
ALTER TABLE season_participants
  ADD COLUMN invitation_scope VARCHAR(16) NULL
  CHECK (invitation_scope IS NULL OR invitation_scope IN ('SEASON', 'EVENT'));
```

| Row type | `troupe_membership_id` | `invitation_scope` |
|----------|------------------------|--------------------|
| Synced troupe member | MEMBER/ADMIN membership | NULL |
| Season externe (Laetitia) | EXTERNE membership | SEASON |
| Season row for event-only opt-in | EXTERNE membership | EVENT |
| Legacy explicit name-only (pre-migration) | NULL | NULL until re-added |
| Event-only Ruben (no season row) | — | implicit EVENT via event_participants |

### API design notes

**Extend `ParticipantCreateRequest`:**

```kotlin
data class ParticipantCreateRequest(
    val displayName: String,
    val email: String? = null,
    val gender: String? = null,
    val invitationScope: InvitationScope? = null, // server default by endpoint
    val addToSeasonRoster: Boolean = false,       // event create only
    val troupeMembershipId: UUID? = null,         // optional explicit carnet pick (prep 3.8d)
)
```

**Server defaults:**

- Season `POST`: guest → `SEASON`; member path → ignore scope.
- Event `POST`: guest → carnet + event row; if `addToSeasonRoster` → also season row `EVENT`.

**Authorization:** Reuse existing `requireCanManageSeasonParticipants` / `requireCanManageEventParticipants` — carnet upsert is a side effect, not a separate Membres permission.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| **Dialog shell** | Keep `.participant-form-dialog`, `overflow: visible` on `mat-dialog-content` (3.8c regression) |
| **Checkbox** | `mat-checkbox` with label « Ajouter aussi à la saison »; bind signal, default `false` |
| **Member detection** | `selectedMember()?.baselineRole === 'MEMBER' \|\| === 'TROUPE_ADMIN'` → skip scope hints |
| **API client** | Extend interfaces in `participant-api.service.ts`; map checkbox to `addToSeasonRoster` |
| **Do not extend typeahead** | `participant-member-suggestions.ts` unchanged — story **3.8d** |

### Explicit non-goals

- Typeahead including `EXTERNE` carnet (**3.8d**).
- Scoped dispos / `/agenda` for linked externes (**3.25**).
- `invitation_scope` on `event_participants` table (implicit EVENT when no season row).
- Guest self-service invite (Epic **7**).
- Changing downward removal cascade (SCP 2026-05-31).
- Auto-promotion `EXTERNE` → `MEMBER`.

### Dependencies

| Story / artifact | Status | Relationship |
|------------------|--------|----------------|
| **2.21** | done | **Required** — `EXTERNE` carnet, sync skip, guards |
| **3.8** | done | Participant CRUD foundation |
| **3.8c** | done | Add dialogs + typeahead — extend, do not reopen CR |
| **3.19** | done | Re-inclusion / stable IDs pattern |
| **ADR-0021** | accepted | Normative scope + cascade |
| **SCP 2026-06-06** | approved | UI copy + phasing P2 |
| **3.8d** | backlog | **Blocked by this story** — carnet typeahead |
| **3.25** | backlog | **Blocked by this story** — scope enforcement in app access |

### Architecture compliance

- Monorepo V2: Flyway under `services/api/src/main/resources/db/migration/`; OpenAPI source [`participants.yaml`](../../services/api/openapi/participants.yaml).
- Next migration version: **V60** (V59 = externe carnet).
- Auth: session + CSRF on mutations.
- Authorization at **API** — UI hints are not security gates (**NFR-S2**).
- [`ensureMembershipParticipants`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) must continue skipping `EXTERNE` ([`SeasonParticipantMembershipSync`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt) line 26).

### File structure (expected touch list)

| File | Action |
|------|--------|
| `services/api/src/main/resources/db/migration/V60__season_participant_invitation_scope.sql` | NEW |
| `services/api/.../participant/InvitationScope.kt` | NEW |
| `services/api/.../participant/ParticipantEntities.kt` | UPDATE |
| `services/api/.../participant/ParticipantKind.kt` (or inline enum) | UPDATE if adding EXTERNE kind |
| `services/api/.../participant/dto/ParticipantDtos.kt` | UPDATE |
| `services/api/.../participant/SeasonParticipantService.kt` | UPDATE |
| `services/api/.../participant/EventParticipantService.kt` | UPDATE |
| `services/api/.../troupe/TroupeExterneCarnetService.kt` | NEW (extract upsert) |
| `services/api/.../troupe/TroupeMembershipService.kt` | UPDATE (propagation + delegate upsert) |
| `services/api/openapi/participants.yaml` | UPDATE |
| `apps/web/.../participants/participant-api.service.ts` | UPDATE |
| `apps/web/.../admin-participants/add-participant-dialog.ts` | UPDATE |
| `apps/web/.../admin-event-participants/add-event-participant-dialog.ts` | UPDATE |
| `apps/web/.../*add-participant-dialog.spec.ts` | UPDATE |
| `services/api/src/test/.../Participant*Test*.kt` | NEW/UPDATE |

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **Integration** | Season guest → carnet EXTERNE + SEASON scope; event guest → carnet + event only; event + checkbox → season EVENT row; re-add same person same IDs; member typeahead unchanged |
| **Unit** | `kind()` for externe-linked rows; DTO maps `invitationScope` |
| **Component** | Event checkbox default off; season scope hint; payloads |
| **Regression** | 3.8c typeahead; 2.21 sync skip; 3.19 reactivation |

### Previous story intelligence

**From story 2.21 (done):**

- Carnet upsert logic lives in `TroupeMembershipService.addExterne` — **extract**, don't reimplement match order.
- `ensureMembershipParticipants` / `SeasonParticipantMembershipSync` **skip EXTERNE** — must remain.
- Deferred: « Renommage externe ne propage pas vers season_participants » → **implement in 3.23** (AC8).
- Name-only carnet: nullable `user_id` on `troupe_memberships` (V59).

**From story 3.8c (done):**

- Add dialogs share shell; typeahead selects troupe members by `userId`.
- `filterTroupeMemberSuggestions` excludes rows with `userId == null` — externes without account won't appear until **3.8d**.
- Free-text submit still valid — this story makes free-text trigger server-side carnet upsert.

**From story 3.8 (done):**

- Event roster merges season rows + event-only rows ([`EventRosterService.buildRoster`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt)).
- Event exclusions unchanged for SEASON-scoped participants.

### Git intelligence

| Commit | Relevance |
|--------|-----------|
| `a627e86d` | Story 2.21 — EXTERNE carnet, V59, Membres UI |
| `2392adae` | Story 3.8c — typeahead baseline |
| `115776cd` | SCP + ADR-0021 approved; story 3.23 backlog |
| `6b7bbc1e` | Latest participant work (2.12d gender) — touch same modules |

### Latest tech notes

- **Flyway V60** — nullable enum column; no breaking change for existing rows.
- **Spring `@Transactional`** — carnet upsert + participant create in one transaction per request.
- **Angular 21** signals — match existing dialog `signal()` / `computed()` patterns.
- **OpenAPI nullable** — expose `invitationScope` as optional on admin DTOs.
- **ParticipantKind extension** — if adding `EXTERNE`, update OpenAPI enum + web TypeScript union + any switch statements (grep `ParticipantKind`).

### Project context reference

- [project-context.md](../../project-context.md)
- [docs/adr/0021-troupe-externes-carnet-invitations.md](../../docs/adr/0021-troupe-externes-carnet-invitations.md)
- [DOMAIN.md](../../DOMAIN.md) — invitation scope glossary
- [3-8-rosters-participants-saison-et-evenement.md](./3-8-rosters-participants-saison-et-evenement.md)
- [2-21-troupe-externes-carnet.md](./2-21-troupe-externes-carnet.md)
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)

## Dev Agent Record

### Agent Model Used

_(dev-story agent)_

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (2026-06-06).
- **Implemented:** V60 `invitation_scope`; `InvitationScope` enum; `ParticipantKind.EXTERNE`; `TroupeExterneCarnetService.upsertActiveExterne`; season/event create cascades; carnet→season propagation on externe update; OpenAPI + Angular dialogs (scope hints, `addToSeasonRoster` checkbox).
- **Tests:** `./gradlew test --tests '*Participant*' --tests '*TroupeMembership*'` (118 OK); web dialog specs 35 OK.
- **Dispos enforcement deferred:** Scope column persisted; guards in **3.25** (dispos UI may still show all roster rows).
- **M3 waiver:** Dialog width kept at `min(24rem, …)` per 3.8c shell — story M3-3 cites 28rem; no layout regression.
- **Manual recette (2026-06-06, Patrice, seed Les Improbots):** A–D, G OK ; E comportement attendu (voir recette corrigée) ; F fonctionnel, dette UX carnet externes.

### Manual Recette — seed Les Improbots (dev local)

**Prérequis:** `./scripts/start-dev.sh` ; Flyway V60+ ; connexion admin **Les Improbots** (`patrice.lamarque@gmail.com`, `impropick@gmail.com` ou `patrice@seed.improbots.test`) ; contexte **Les Improbots 2026-2027** (`/saison/les-improbots/les-improbots-2026-2027`).

| Ressource | Slug / valeur |
|-----------|----------------|
| Troupe | `les-improbots` |
| Saison principale | `les-improbots-2026-2027` |
| Saison roster vide (optionnel) | `aperock-2026` |
| Spectacle « Ruben » | **Match vs Bruxelles** — `match-vs-bruxelles` |
| Admin participants saison | `/saison/les-improbots/les-improbots-2026-2027/admin/participants` |
| Admin participants spectacle | `…/event/match-vs-bruxelles/admin/participants` |
| Carnet externes | `/troupes/les-improbots/admin/membres` (onglet Externes) |

#### A — Laetitia (externe saison, AC2)

1. Admin participants **saison** → **Ajouter** : `Laetitia`, email `laetitia.mc@example.com`, sans typeahead membre.
2. **Attendu UI:** hint *« Externe saison — disponibilités sur toute la saison »*.
3. **Attendu données:** roster saison (section invités/externes, kind Externe) ; carnet **Externes** avec Laetitia ; API `invitationScope: SEASON`, `troupeMembershipId` renseigné.

#### B — Ruben (externe spectacle seul, AC3)

1. Admin participants **Match vs Bruxelles** → **Ajouter** : `Ruben`, checkbox *« Ajouter aussi à la saison »* **décochée**.
2. **Attendu UI:** *« Externe spectacle — ce spectacle seulement »*.
3. **Attendu données:** Ruben sur roster **événement** uniquement ; absent du roster **saison** ; entrée carnet EXTERNE.

#### C — Opt-in saison EVENT (AC4)

1. Même spectacle → `DJ Opt-in`, checkbox **cochée**.
2. **Attendu:** ligne événement + ligne saison `invitationScope: EVENT` ; un seul carnet.

#### D — Ré-inclusion IDs stables (AC5)

1. Retirer Laetitia du roster saison → ré-ajouter (même nom/email).
2. **Attendu:** même `season_participant_id` et `troupeMembership_id`.
3. **Note recette:** pas de typeahead carnet pour retrouver Laetitia — **hors scope 3.23** ; story **3.8d** (pool typeahead incluant EXTERNE).

#### E — Membre typeahead, non-régression 3.8c (AC6)

**Prérequis corrigé:** sur **Les Improbots 2026-2027**, Angie/Max/Sophie sont **déjà** au roster → **pas** de suggestion typeahead (exclusion voulue, story 3.8c).

1. **Option A (saison principale):** retirer **Angie** du roster saison → **Ajouter** → taper `Ang` → Angie suggérée → ajouter.
2. **Attendu:** pas de hint « Externe saison » ; pas de nouvelle entrée carnet EXTERNE ; kind membre synchronisé.
3. **Option B:** saison **Apérock 2026** (roster vide au départ) — mêmes attentes si membre pas encore sur ce roster.

#### F — Propagation carnet → roster (AC8)

1. Laetitia active en roster saison.
2. **Membres → Externes** : renommer (ex. `Laetitia Dupont`).
3. **Attendu:** nom/email propagés sur la ligne `season_participants` sans édition participant.
4. **Dette UX (recette):** édition inline dans la grille Membres — pas de bouton/modale « Éditer » comme ailleurs ; **à traiter avant matrice de tests auto (Murat)**.

#### G — Retrait roster sans désactivation carnet

1. Retirer Laetitia du roster saison.
2. **Attendu:** absente du roster actif ; carnet externe **toujours actif**.

**Limitation connue:** scope dispos/agenda non appliqué en UI (**3.25**).

#### Résultats recette manuelle (2026-06-06)

| Scénario | Résultat | Commentaire |
|----------|----------|-------------|
| A | OK | |
| B | OK | |
| C | OK | |
| D | OK | IDs stables ; typeahead carnet absent → **3.8d**, pas bug 3.23 |
| E | OK (recette corrigée) | Étape « Apérock sans retrait » était un faux KO : exclusion roster actif = normal |
| F | OK (UX à améliorer) | Propagation OK ; édition carnet peu discoverable (inline vs modale) |
| G | OK | |

**Verdict story 3.23:** recette manuelle **suffisante pour clôture** ; pas de blocant fonctionnel signalé. Suites : **code-review** ; **3.8d** (typeahead carnet) ; UX Membres/externes avant tests Murat ; **3.25** (garde-fous dispos).

### File List

- services/api/src/main/resources/db/migration/V60__season_participant_invitation_scope.sql
- services/api/src/main/kotlin/com/hatcast/api/participant/InvitationScope.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEnums.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeExterneCarnetService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt
- services/api/openapi/participants.yaml
- services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantEntityKindTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantExterneCascadeIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt
- apps/web/src/app/core/participants/participant-api.service.ts
- apps/web/src/app/pages/admin-participants/add-participant-dialog.ts
- apps/web/src/app/pages/admin-participants/add-participant-dialog.spec.ts
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts
- apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.spec.ts

### Review Findings

- [x] [Review][Patch] API `removable` false for EXTERNE-linked rows [`ParticipantDtos.kt:61`] — DTO uses `troupeMembership == null`; externes have a carnet link → API lies; front workaround in `admin-participants.ts` only.
- [x] [Review][Patch] Event POST can create duplicate ACTIVE rows [`EventParticipantService.kt:128`] — externe path checks REMOVED reactivation only; no ACTIVE duplicate guard (season path has CONFLICT on same carnet).
- [x] [Review][Patch] Event reactivation clears season link when opt-in unchecked [`EventParticipantService.kt:289`] — `existing.seasonParticipant = seasonRow` sets null when `addToSeasonRoster=false`, dropping prior season link on re-add.
- [x] [Review][Patch] Event scope hint shown for member typeahead and empty form [`add-event-participant-dialog.ts:48`] — `eventScopeHint()` always rendered; season dialog uses `showSeasonScopeHint()` (M3-1 / AC6 parity).
- [x] [Review][Patch] Scope hint font-weight inconsistent between dialogs [`add-participant-dialog.ts`] — event dialog sets `.participant-form-dialog__scope-hint { font-weight: 500 }`; season dialog missing equivalent rule.
- [x] [Review][Patch] `admin-participants.spec.ts` fixtures still use `NAME_ONLY` [`admin-participants.spec.ts`] — API now returns `EXTERNE`; no test for remove via `kind === 'EXTERNE'` + `removable: false`.
- [x] [Review][Patch] AC9 integration test gaps [`ParticipantExterneCascadeIntegrationTest.kt`] — missing: event→season link (AC4), event re-inclusion stable IDs (AC5), carnet row proof on event-only add (AC3), propagation test (AC8), member add on event endpoint (AC6).

- [x] [Review][Defer] M3-3 dialog width 24rem vs 28rem [`add-*-participant-dialog.ts`] — deferred, waiver documented in Dev Notes (3.8c shell).
- [x] [Review][Defer] Typeahead submit omits `troupeMembershipId` [`add-participant-dialog.ts:258`] — deferred, pre-existing 3.8c; members without email fall through to externe carnet path.
- [x] [Review][Defer] Member event POST duplicate ACTIVE rows [`EventParticipantService.createMemberEventParticipant`] — deferred, pre-existing before 3.23 refactor.
- [x] [Review][Defer] Carnet homonym collision on name-only match [`TroupeExterneCarnetService.kt:127`] — deferred, inherited 2.21 carnet match order.
- [x] [Review][Defer] No e2e helpers for Laetitia/Ruben/opt-in scenarios [`apps/web/e2e/`] — deferred, manual recette deemed sufficient for story closure.
- [x] [Review][Defer] No audit when upsert updates already-ACTIVE externe [`TroupeExterneCarnetService.kt:55`] — deferred, minor observability gap.

### Change Log

- 2026-06-06: Story created (`bmad-create-story`) — ADR-0021 P2 scope + cascade.
- 2026-06-06: Code review patches applied — removable DTO, event duplicate guard, UI hints, tests.
- 2026-06-06: Implementation complete — cascade add, invitation scope, UI hints, tests green.
- 2026-06-06: Manual recette Les Improbots (Patrice) — A–G OK ; E recette corrigée ; F dette UX carnet notée ; D typeahead → 3.8d.
- 2026-06-06: TEA traceability (Murat) — matrix PASS ; +4 API gap tests ; 14/14 cascade + 122 participant suite + 37 web specs green ; story closed.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / ADR / FR)
- [x] Section **Material 3** remplie (add-dialog scope UI)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test -w @hatcast/web` mentionnés
