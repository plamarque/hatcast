# Story 9.0 — Capture backend de la piste d'audit

Status: done

**PLAN:** [PLAN.md](../../PLAN.md) § Epic 9 — table **9.0** (P0, MEP, bloquant **M4**)
**SCP:** [sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md) § 3 « 9-0 — Audit event capture »
**Readiness:** [implementation-readiness-report-2026-06-02-epic-9-audit.md](../planning-artifacts/implementation-readiness-report-2026-06-02-epic-9-audit.md)
**Epics:** [epics.md](../planning-artifacts/epics.md) § Epic 9 — Story 9.0
**Epic:** 9 — Audit et historique des changements significatifs (write path FR35 ; UI = 9.1 / 9.2 post-MEP)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

En tant qu'**opérateur produit / administrateur troupe**,
je veux que **chaque changement significatif** — **disponibilités**, **spectacles**, **rosters participants**, **droits membres/organisateurs**, **composition** et **confirmations** (y compris actions proxy) — soit **enregistré automatiquement** dans un **journal append-only unifié** avec acteur, sujet, type d'action, horodatage seconde, valeurs avant/après et identifiants de scope (`troupe_id`, `season_id`, `event_id` quand applicable),
afin de **corréler** l'historique (ex. changement de date → retrait roster → dispos modifiées) et garantir la **gouvernance FR35 dès la MEP V2**, même sans UI de consultation (9.1 / 9.2).

---

## Acceptance Criteria

### Disponibilités (FR35 — create / update / delete)

1. **Given** une création, mise à jour ou **« delete » (passage à inconnu / UNSET)** de disponibilité — self **ou** proxy (**5.5**) — , **when** la transaction `AvailabilityService.setMyStatus` / `setParticipantStatus` **réussit et commit**, **then** une entrée `audit_events` est persistée avec `actor_user_id`, le **sujet** (`subject_user_id` **ou** `subject_season_participant_id` **ou** `subject_event_participant_id`), `action_type` ∈ {`AVAILABILITY_CREATED`, `AVAILABILITY_UPDATED`, `AVAILABILITY_DELETED`}, `occurred_at` (UTC, précision seconde), **`event_id`** (spectacle concerné), et `before` / `after` couvrant **au minimum** `status`, `roleKeys`, `comment`. [Source: epics 9.0 AC1 ; PLAN § Epic 9 matrice ; FR35 ; FR17]

### Spectacles / événements (corrélation timeline — extension PO 2026-06-02)

2. **Given** la **création** d'un spectacle (`EventService.create`), **when** la transaction réussit, **then** une entrée `EVENT_CREATED` est persistée avec `actor_user_id`, `troupe_id`, `season_id`, `event_id`, et `after` couvrant les champs métier : `title`, `slug`, `startsAt`, `location`, `description`, `templateType`, `roleSlots`, `category`, `archived`. [Source: PO extension ; parité V1 `event_added` ; corrélation avec dispos/composition]

3. **Given** la **modification** d'un spectacle (`EventService.update` — date/heure, titre, lieu, description, type, rôles, slug, catégorie, ou tout autre champ mutable), **when** au moins un champ change et la transaction réussit, **then** **une** entrée `EVENT_UPDATED` capture un snapshot **`before` / `after`** des champs **effectivement modifiés** (minimum : tout champ présent dans le PATCH). Si aucun champ ne change (idempotence), **aucune** entrée. [Source: PO extension ; parité V1 `event_modified`]

4. **Given** l'**archivage** ou le **désarchivage** d'un spectacle (`EventService.archive` / `unarchive`), **when** l'état `archived` bascule et la transaction réussit, **then** une entrée `EVENT_ARCHIVED` ou `EVENT_UNARCHIVED` enregistre `before.archived` / `after.archived` plus les identifiants scope (`event_id`, `season_id`, `troupe_id`, `title` en metadata pour lisibilité). [Source: PO extension ; parité V1 `event_archived` / `event_unarchived`]

### Rosters participants (extension PO 2026-06-02 — Stories 3.8, 3.19)

5. **Given** l'**ajout**, la **modification** ou le **retrait** d'un participant **saison** (`SeasonParticipantService.create` / `update` / `remove`, incl. réactivation via `create` ou `reinclude`), **when** la transaction réussit, **then** une entrée `action_type` ∈ {`SEASON_PARTICIPANT_ADDED`, `SEASON_PARTICIPANT_REACTIVATED`, `SEASON_PARTICIPANT_UPDATED`, `SEASON_PARTICIPANT_REMOVED`} enregistre `actor_user_id`, `season_id`, `troupe_id`, le **sujet** (`subject_season_participant_id` + snapshot `displayName` / email en metadata), et `before` / `after` pour `status`, `displayName`, `normalizedEmail`, `userId` (lien compte). [Source: Story 3.8 ; 3.19 ; FR34]

6. **Given** l'**ajout**, la **modification** ou le **retrait** d'un participant **événement-only** (`EventParticipantService.create` / `update` / `remove`), **when** la transaction réussit, **then** une entrée `action_type` ∈ {`EVENT_PARTICIPANT_ADDED`, `EVENT_PARTICIPANT_UPDATED`, `EVENT_PARTICIPANT_REMOVED`} enregistre `actor_user_id`, **`event_id`**, `season_id`, `troupe_id`, sujet (`subject_event_participant_id`), et `before` / `after` (`status`, `displayName`, `normalizedEmail`, `userId`). [Source: Story 3.8 ; FR44]

7. **Given** l'**exclusion** ou la **ré-inclusion** d'un participant saison sur le roster d'un spectacle (`EventRosterService.excludeSeasonParticipant` / `includeSeasonParticipant`), **when** la transaction réussit, **then** une entrée `EVENT_ROSTER_EXCLUDED` ou `EVENT_ROSTER_INCLUDED` enregistre `actor_user_id`, **`event_id`**, `subject_season_participant_id`, et metadata (`displayName`). [Source: Story 3.8 roster manuel]

### Droits utilisateurs (extension PO 2026-06-02 — Stories 2.2, 3.5, FR34)

8. **Given** l'**ajout**, la **modification** ou la **désactivation** d'un membre de troupe (`TroupeMembershipService.addMemberByEmail`, `selfJoin`, `updateMember`, `deactivateMember`), **when** la transaction réussit, **then** une entrée `action_type` ∈ {`TROUPE_MEMBER_ADDED`, `TROUPE_MEMBER_UPDATED`, `TROUPE_MEMBER_DEACTIVATED`} enregistre `actor_user_id`, `troupe_id`, **sujet** `subject_user_id` (membre concerné ; self-join ⇒ acteur = sujet), et `before` / `after` pour `status`, `baselineRole`, `displayName`. Si la désactivation entraîne un retrait roster saison en cascade (`membershipSync`), inclure en `metadata` les `seasonParticipantIds` impactés (pas d'entrée séparée par sync interne). [Source: Story 2.2 ; 18.2 self-join ; FR6–FR7]

9. **Given** l'**octroi** ou la **révocation** d'un rôle **organisateur saison ou événement** (`OrganizerAccessService.grantSeasonOrganizer` / `revokeSeasonOrganizer`, `grantEventOrganizer` / `revokeEventOrganizer`), **when** la transaction réussit, **then** une entrée `action_type` ∈ {`SEASON_ORGANIZER_GRANTED`, `SEASON_ORGANIZER_REVOKED`, `EVENT_ORGANIZER_GRANTED`, `EVENT_ORGANIZER_REVOKED`} enregistre `actor_user_id`, scope (`season_id` et/ou **`event_id`**, `troupe_id`), **sujet** `subject_user_id` (utilisateur délégué), et `before` / `after` (présence du rôle). Idempotence : grant déjà existant ⇒ **aucune** nouvelle entrée. [Source: Story 3.5 ; FR34]

### Composition (FR35)

10. **Given** une mutation de cycle de vie composition — `publishComposition`, `validateComposition`, `unlockComposition` — , **when** elle réussit et commit, **then** une entrée d'audit capture `action_type` ∈ {`COMPOSITION_PUBLISHED`, `COMPOSITION_VALIDATED`, `COMPOSITION_UNLOCKED`}, le scope (`event_id`, `season_id`, `troupe_id`), l'acteur, et `before` / `after` du **lifecycle** (`publishedAt` / `validatedAt` ou état dérivé). [Source: epics 9.0 ; PLAN matrice ; FR35]

11. **Given** une **assignation manuelle** ou un **vidage de slot** (`CompositionSlotAssignmentService.assignSlot`), **when** elle réussit, **then** une entrée d'audit `SLOT_ASSIGNED` ou `SLOT_CLEARED` capture rôle (`roleKey`, `slotIndex`), sujet (participant assigné/retiré) et `before` / `after` de l'assignation. [Source: epics 9.0 ; PLAN matrice]

12. **Given** un **tirage** (`CompositionDrawService.drawComposition`, mode FULL ou FILL_EMPTY), **when** il réussit, **then** **une seule** entrée d'audit `COMPOSITION_DRAW_COMPLETED` est persistée avec un **snapshot agrégé** des assignations par rôle **avant** et **après** (pas une ligne par slot). [Source: Readiness R1 ; PLAN matrice]

### Confirmations (FR35)

13. **Given** une confirmation, déclinaison, retrait (remise en `PENDING`) ou restauration de déclin — membre **ou** proxy (**6.8**) — , **when** elle réussit, **then** une entrée d'audit `action_type` ∈ {`PARTICIPATION_CONFIRMED`, `PARTICIPATION_DECLINED`, `PARTICIPATION_RESET`, `DECLINE_RESTORED`} enregistre `actor_user_id`, le **sujet** participant, **`event_id`**, et le statut de participation **avant/après** par slot. [Source: epics 9.0 ; FR26 ; FR35]

### Transversal

14. **Given** une entrée écrite dans `audit_events`, **when** les flows applicatifs standard s'exécutent, **then** l'entrée **n'est ni modifiée ni supprimée** : aucune route/service applicatif n'expose `UPDATE` ou `DELETE` sur `audit_events` (rétention / anonymisation FR37 = politique séparée, ex. **1.7**, hors story). [Source: epics 9.0 ; FR37]

15. **Given** une mutation domaine qui **échoue / rollback**, **when** la transaction est annulée, **then** **aucune** entrée d'audit n'est persistée (l'écriture audit participe à la **même transaction** que la mutation domaine). [Source: Readiness § Architecture ; NFR-R2]

16. **Given** plusieurs entrées partageant un scope commun (`event_id`, `season_id` ou `troupe_id`), **when** on interroge `audit_events` ordonné par `occurred_at`, **then** la timeline permet de corréler (ex. `EVENT_UPDATED.startsAt` → `EVENT_ROSTER_EXCLUDED` → `AVAILABILITY_UPDATED` sur le même `event_id`). [Source: PO corrélation ; index `(event_id|season_id|troupe_id, occurred_at DESC)`]

17. **Given** la story 9.0 livrée, **when** `./gradlew test` s'exécute, **then** des tests d'intégration couvrent **au minimum** : dispo CRUD (self + proxy), event create/update/archive, **season participant remove**, **organizer grant/revoke**, validate composition, confirm/decline ; **aucune régression**. [Source: PLAN DoD 9.0 ; OPS-2]

**Couverture produit :** FR35 (write path) ; prolonge FR17, FR26 ; **UI = Story 9.1 / 9.2** (post-MEP) ; **pas d'API GET requise** dans cette story.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — story 100 % `services/api/` (schéma Flyway + service `AuditEventRecorder` + hooks domaine + tests). Aucun changement sous `apps/web/`, aucune route REST GET, aucun écran. La consultation est livrée par **9.1** (admin/orga) et **9.2** (membre), post-MEP.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` uniquement — pas d'Angular, pas de `legacy/`, **pas** d'endpoint GET audit (réservé 9.1).

- [x] **Schéma — migration `V43__audit_events.sql`** (AC: 1–15)
  - [x] Créer la table **append-only** `audit_events` (voir Dev Notes § Schéma). Types alignés sur l'existant : `UUID`, `TIMESTAMPTZ`, `gen_random_uuid()` (alias H2 déjà enregistré, cf. V23).
  - [x] **Ne pas** utiliser `jsonb` : stocker `before` / `after` / `metadata` en **`TEXT`** (sérialisé JSON via `AttributeConverter`) — le profil test tourne sur **H2** (`MODE=PostgreSQL`), pas de Postgres natif (cf. V23/V21, [`RoleKeysJsonConverter`](../../services/api/src/main/kotlin/com/hatcast/api/availability/RoleKeysJsonConverter.kt)).
  - [x] Index : `(troupe_id, occurred_at DESC)`, `(season_id, occurred_at DESC)`, `(event_id, occurred_at DESC)`, `(subject_user_id, occurred_at DESC)` (corrélation + 9.1 / 9.2).
  - [x] FK `actor_user_id` → `users(id)` (nullable pour acteur système / acteur anonymisé futur FR37). **Pas** de FK sur les ids sujet participant (lignes participant supprimables ; conserver un snapshot d'identité en `metadata`).

- [x] **Entité + repository JPA** (AC: 1–6)
  - [x] `AuditEventEntity` (PK `UUID`) ; converters JSON `TEXT` (réutiliser le pattern Jackson `AttributeConverter` du repo, **pas** `@JdbcTypeCode`).
  - [x] `AuditEventRepository : JpaRepository<AuditEventEntity, UUID>` — **insert only** (pas de méthode de mutation/suppression exposée).

- [x] **Service `AuditEventRecorder`** (AC: 1–15)
  - [x] Méthode `record(...)` appelée **depuis les services domaine** (jamais les contrôleurs), **dans** la `@Transactional` de la mutation (rollback ⇒ pas d'audit, AC15).
  - [x] Enum **contrôlée** `AuditActionType` (liste fermée, cf. Dev Notes § Taxonomie) — **ne pas** recopier les ~30 types V1 (`docs/v1/technical/AUDIT.md`).
  - [x] Helper de construction du **sujet** (user lié vs name-only) + snapshot `metadata` (displayName, ids).

- [x] **Hooks domaine** (ordre recommandé — AC: 1–13)
  - [x] **Dispos** — `AvailabilityService` → AVAILABILITY_* ; **`event_id` obligatoire**. [AC1]
  - [x] **Événements** — `EventService` → EVENT_*. [AC2–4]
  - [x] **Roster saison** — `SeasonParticipantService` → SEASON_PARTICIPANT_* (distinguer REACTIVATED vs ADDED). [AC5]
  - [x] **Roster événement** — `EventParticipantService` → EVENT_PARTICIPANT_* ; `EventRosterService` → EVENT_ROSTER_EXCLUDED/INCLUDED. [AC6–7]
  - [x] **Droits troupe** — `TroupeMembershipService` → TROUPE_MEMBER_* (`addMemberByEmail`, `selfJoin`, `updateMember`, `deactivateMember`). [AC8]
  - [x] **Organisateurs** — `OrganizerAccessService` → SEASON_ORGANIZER_* / EVENT_ORGANIZER_*. [AC9]
  - [x] **Composition** — `CompositionService`, `CompositionSlotAssignmentService`, `CompositionDrawService`. [AC10–12]
  - [x] **Participation** — `CompositionParticipationService`, `CompositionDeclineRestoreService`. [AC13]

- [x] **Tests d'intégration** (AC: 17)
  - [x] Étendre les suites existantes — voir Dev Notes § Tests.
  - [x] Cas minimum : dispo self + proxy ; event create/update/archive ; **season participant remove** ; **organizer grant+revoke** ; validate ; confirm/decline.
  - [x] Test **corrélation** (AC16) : même `event_id` → ≥2 types d'entrées.
  - [x] Test **rollback** (AC15).
  - [x] `./gradlew test` vert.

- [x] **Synchronisation docs normatives** (même PR — AGENTS.md)
  - [x] `DOMAIN.md` § Audit log : remplacer description V1 Firestore `auditLogs` par modèle V2 `audit_events` (PostgreSQL).
  - [x] `ARCH.md` : ajouter module audit V2 (write path) ; retirer/annoter le client V1 `auditClient.js`.
  - [x] **ADR** (candidat) : modèle audit V2 vs V1 Firestore — créer sous `docs/adr/` et lier depuis ARCH si jugé structurant.

- [x] Mettre à jour `sprint-status.yaml` → **done** (via dev-story / code-review, hors create-story).

### Review Findings

- [x] [Review][Patch] `DECLINE_RESTORED` ne capture pas de `before` / `after` malgré l'AC13. [`services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt:118`]
- [x] [Review][Patch] `PARTICIPATION_DECLINED` enregistre un `after.participationStatus = pending` après avoir vidé le slot, au lieu de représenter le déclin métier demandé par l'AC13. [`services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt:128`]
- [x] [Review][Patch] Les grants organisateur n'enregistrent que `after = granted(true)` et omettent le `before = granted(false)` requis par l'AC9. [`services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt:128`]
- [x] [Review][Patch] `SLOT_CLEARED` peut écrire un participant événement dans `subjectSeasonParticipantId`, car le snapshot de slot ne conserve qu'un `participantId` générique. [`services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt:230`]
- [x] [Review][Patch] Les assignations/vidages de slot peuvent auditer des no-op (réassignation identique, slot déjà vide) au lieu d'émettre seulement les changements réels. [`services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt:190`]
- [x] [Review][Patch] Les mises à jour de disponibilité idempotentes produisent `AVAILABILITY_UPDATED` sans diff métier sur `status`, `roleKeys` ou `comment`. [`services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt:453`]
- [x] [Review][Patch] `addMemberByEmail` peut modifier le `displayName` d'un membre actif existant sans entrée `TROUPE_MEMBER_UPDATED`, alors que l'AC8 inclut `displayName` dans les champs audités. [`services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt:336`]
- [x] [Review][Patch] La couverture AC17 ne teste pas le CRUD complet des disponibilités self + proxy : seuls des chemins create sont assertés, sans update ni delete/UNSET. [`services/api/src/test/kotlin/com/hatcast/api/audit/AuditEventIntegrationTest.kt:143`]

---

## Dev Notes

### Périmètre capture — vue d'ensemble

| Domaine | Service | Actions audit | Scope ids | Before/after (min.) |
|---------|---------|---------------|-----------|---------------------|
| **Disponibilités** | `AvailabilityService` | CREATED / UPDATED / DELETED | event, season, troupe | `status`, `roleKeys`, `comment` |
| **Spectacles** | `EventService` | CREATED / UPDATED / ARCHIVED / UNARCHIVED | event, season, troupe | champs `EventEntity` |
| **Roster saison** | `SeasonParticipantService` | ADDED / REACTIVATED / UPDATED / REMOVED | season, troupe | `status`, `displayName`, email, `userId` |
| **Roster événement** | `EventParticipantService` | ADDED / UPDATED / REMOVED | event, season, troupe | idem |
| **Roster event (excl.)** | `EventRosterService` | EXCLUDED / INCLUDED | event, season, troupe | participant saison exclu/ré-inclus |
| **Droits troupe** | `TroupeMembershipService` | ADDED / UPDATED / DEACTIVATED | troupe | `status`, `baselineRole`, `displayName` |
| **Organisateurs** | `OrganizerAccessService` | GRANTED / REVOKED (saison ou event) | season/event, troupe | délégation orga |
| **Composition** | `CompositionService` + slots + draw | PUBLISHED / VALIDATED / … | event, season, troupe | lifecycle, slots |
| **Participation** | `CompositionParticipationService` | CONFIRMED / DECLINED / … | event, season, troupe | statut slot |

**Corrélation :** filtrer par `event_id` (timeline spectacle), `season_id` (roster/droits ligue), ou `troupe_id` (membres).

### Cartographie des points d'accroche (vérifiée 2026-06-02)

> ⚠️ **Le service dispos s'appelle `AvailabilityService`** (package `com.hatcast.api.availability`), **pas** `EventAvailabilityService`. L'**entité** est `EventAvailabilityEntity`.

| # | Domaine | Service (chemin) | Méthode `@Transactional` | Action(s) audit |
|---|---------|------------------|--------------------------|-----------------|
| 1 | **Dispos** | [`availability/AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) | `setMyStatus` (L61), `setParticipantStatus` (L82) | AVAILABILITY_CREATED/UPDATED/DELETED |
| 2 | **Événements** | [`event/EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) | `create`, `update`, `archive`, `unarchive` | EVENT_* |
| 3 | **Roster saison** | [`participant/SeasonParticipantService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) | `create`, `update`, `remove`, `reinclude` (+ `reactivateRemoved`) | SEASON_PARTICIPANT_* |
| 4 | **Roster événement** | [`participant/EventParticipantService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt) | `create`, `update`, `remove` | EVENT_PARTICIPANT_* |
| 5 | **Roster excl.** | [`participant/EventRosterService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt) | `excludeSeasonParticipant`, `includeSeasonParticipant` | EVENT_ROSTER_* |
| 6 | **Droits troupe** | [`troupe/TroupeMembershipService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) | `addMemberByEmail`, `selfJoin`, `updateMember`, `deactivateMember` | TROUPE_MEMBER_* |
| 7 | **Organisateurs** | [`organizer/OrganizerAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) | `grant/revoke Season/Event Organizer` | *_ORGANIZER_* |
| 8 | Lifecycle | [`composition/CompositionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) | `publishComposition`, `validateComposition`, `unlockComposition` | COMPOSITION_* |
| 9 | Slots | [`composition/CompositionSlotAssignmentService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt) | `assignSlot` | SLOT_* |
| 10 | Tirage | [`composition/CompositionDrawService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) | `drawComposition` | COMPOSITION_DRAW_COMPLETED |
| 11 | Participation | [`composition/CompositionParticipationService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) | `updateParticipation` | PARTICIPATION_* |
| 11 | Restore | [`composition/CompositionDeclineRestoreService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt) | `restoreDecline` | DECLINE_RESTORED |

**Toutes** ces méthodes ont déjà une frontière `@Transactional` propre ⇒ appeler `auditRecorder.record(...)` **à la fin** du corps transactionnel. Pas de `afterCommit` (audit atomique, AC15).

**Sync interne membership → roster :** `SeasonParticipantMembershipSync` / `membershipSync.removeForMembershipAcrossTroupe` — **ne pas** auditer séparément ; refléter l'impact en `metadata` sur l'entrée `TROUPE_MEMBER_*` déclenchante (AC8).

### Résolution acteur / sujet

- **Acteur** : il n'existe pas de helper `CurrentUser` dans les services. L'utilisateur courant arrive via `@AuthenticationPrincipal principal: SessionUserPrincipal` ([`auth/SessionUserPrincipal.kt`](../../services/api/src/main/kotlin/com/hatcast/api/auth/SessionUserPrincipal.kt), `val userId: UUID`). **Propager `principal.userId`** en paramètre jusqu'au `record(...)` (le pattern existant le passe déjà aux services). `actor_user_id` nullable pour un futur acteur système.
- **Sujet dispos** : type scellé `AvailabilitySubject` (`LinkedUser` / `SeasonParticipant` / `EventParticipant`, `AvailabilityService.kt` L319+). Mapper vers exactement **un** des `subject_user_id` / `subject_season_participant_id` / `subject_event_participant_id`.
- **Sujet déclin / participation** : le slot porte `seasonParticipantId` / `eventParticipantId` ; le déclin enregistre déjà `declinedByUserId` ([`EventCompositionDeclineEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionDeclineEntity.kt)). **Ne pas** confondre ces colonnes partielles avec FR35 (cf. ci-dessous).
- **Proxy** : self ⇒ `actor == subject (user)` ; proxy ⇒ acteur orga + sujet participant. Pour les **name-only**, conserver `displayName` dans `metadata` (le participant peut être supprimé plus tard — pas de FK sujet, cf. R2).

### État partiel à **remplacer** (ne pas prendre pour de la conformité FR35)

- `recorded_by_user_id` sur dispos proxy (**5.5**, migration [`V23`](../../services/api/src/main/resources/db/migration/V23__event_availability_proxy_audit.sql)) — dernier rédacteur **uniquement**, pas de before/after ni d'historique.
- `declined_by_user_id` sur le déclin (**6.8**, [`V21`](../../services/api/src/main/resources/db/migration/V21__composition_participation_declines.sql)) — acteur du déclin courant, pas un journal.

Ces colonnes **restent** (utilisées par le domaine) ; 9.0 **ajoute** le journal unifié `audit_events` par-dessus. Pas de suppression de colonnes existantes.

### Schéma proposé (`V43__audit_events.sql`)

```sql
CREATE TABLE audit_events (
    id UUID NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    actor_user_id UUID NULL,                  -- nullable: système / acteur anonymisé (FR37)
    subject_user_id UUID NULL,
    subject_season_participant_id UUID NULL,
    subject_event_participant_id UUID NULL,
    action_type VARCHAR(64) NOT NULL,         -- enum contrôlée AuditActionType
    troupe_id UUID NULL,
    season_id UUID NULL,
    event_id UUID NULL,
    before_json TEXT NULL,                    -- PAS jsonb (H2 test) — AttributeConverter
    after_json TEXT NULL,
    metadata_json TEXT NULL,                  -- snapshot displayName, roleKey/slotIndex, etc.
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT audit_events_actor_fk FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

CREATE INDEX idx_audit_events_troupe_time   ON audit_events (troupe_id, occurred_at DESC);
CREATE INDEX idx_audit_events_season_time   ON audit_events (season_id, occurred_at DESC);
CREATE INDEX idx_audit_events_event_time    ON audit_events (event_id, occurred_at DESC);
CREATE INDEX idx_audit_events_subject_user  ON audit_events (subject_user_id, occurred_at DESC);
```

> Pas de CHECK XOR strict sur le sujet (certains events composition n'ont pas de sujet unique — ex. publish). Le sujet peut être nul ; pour les events participant, exactement un id sujet est renseigné côté service.

### Taxonomie d'action (enum contrôlée)

**Disponibilités :** `AVAILABILITY_CREATED`, `AVAILABILITY_UPDATED`, `AVAILABILITY_DELETED`

**Spectacles :** `EVENT_CREATED`, `EVENT_UPDATED`, `EVENT_ARCHIVED`, `EVENT_UNARCHIVED`

**Roster saison :** `SEASON_PARTICIPANT_ADDED`, `SEASON_PARTICIPANT_REACTIVATED`, `SEASON_PARTICIPANT_UPDATED`, `SEASON_PARTICIPANT_REMOVED`

**Roster événement :** `EVENT_PARTICIPANT_ADDED`, `EVENT_PARTICIPANT_UPDATED`, `EVENT_PARTICIPANT_REMOVED`, `EVENT_ROSTER_EXCLUDED`, `EVENT_ROSTER_INCLUDED`

**Droits :** `TROUPE_MEMBER_ADDED`, `TROUPE_MEMBER_UPDATED`, `TROUPE_MEMBER_DEACTIVATED`, `SEASON_ORGANIZER_GRANTED`, `SEASON_ORGANIZER_REVOKED`, `EVENT_ORGANIZER_GRANTED`, `EVENT_ORGANIZER_REVOKED`

**Composition :** `COMPOSITION_PUBLISHED`, `COMPOSITION_VALIDATED`, `COMPOSITION_UNLOCKED`, `COMPOSITION_DRAW_COMPLETED`, `SLOT_ASSIGNED`, `SLOT_CLEARED`

**Participation :** `PARTICIPATION_CONFIRMED`, `PARTICIPATION_DECLINED`, `PARTICIPATION_RESET`, `DECLINE_RESTORED`

Référence libellés V1 (à titre indicatif) : [`docs/v1/technical/AUDIT.md`](../../docs/v1/technical/AUDIT.md) — `availability_changed`, `event_added`, `event_modified`, `event_archived` mappés ci-dessus ; types hors FR35 MEP (`login`, `navigation`, etc.) **exclus**.

### Sémantiques à trancher (cf. Risks readiness)

| Réf. | Décision attendue dans l'implémentation |
|------|------------------------------------------|
| **R1** | Tirage = **1 seule** entrée `COMPOSITION_DRAW_COMPLETED` avec snapshot avant/après agrégé (pas 1/slot). `drawComposition` persiste les slots en batch (`slotRepository.saveAll`, L285) → construire le diff avant/après autour de cette section. |
| **R3** | Dispo « delete » = passage à **inconnu/UNSET** (le body mappe `status` → `null`, `AvailabilityService` L529-537, `delete(existing)` L404-408). Émettre `AVAILABILITY_DELETED` avec `after` vide. |
| **R2** | Name-only : pas de FK sujet ; stocker `displayName` + ids dans `metadata_json`. |
| **R6** | FR37 anonymisation : `actor_user_id` nullable + libellé possible dans `metadata` ; politique réelle = story **1.7** (hors 9.0). |

### Frontière transactionnelle (vs 6-13)

- **Audit = même transaction** que la mutation (AC7) — l'inverse des notifications (story [6-13](6-13-publish-notifications-hors-transaction.md) qui passe en `@TransactionalEventListener(AFTER_COMMIT)` car side-effect **externe**).
- Conforme [architecture.md](../planning-artifacts/architecture.md) L365 : « audit written on **same transaction** or follow-up event » et § Domain events L263 (past tense / `XxxOccurred` si un event interne est introduit — non requis ici).
- L'écriture audit doit être **légère** (un insert) ; ne pas appeler de service externe.

### Tests (conventions repo — H2, pas de Testcontainers)

> Le gate **OPS-2** désigne les tests d'intégration ; en pratique la suite tourne sur **H2 en mémoire `MODE=PostgreSQL`** ([`application-test.yml`](../../services/api/src/test/resources/application-test.yml)), **pas** Testcontainers. ⇒ migrations & types doivent rester **H2-compatibles** (raison du `TEXT` au lieu de `jsonb`).

| Domaine | Suite existante à étendre |
|---------|---------------------------|
| **Dispos + proxy** | [`AvailabilityControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt) |
| **Événements** | [`EventControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt) |
| **Roster + droits** | [`ParticipantControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt), [`OrganizerControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt), [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt) |
| Validate / unlock | [`CompositionValidateUnlockIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionValidateUnlockIntegrationTest.kt) |
| Draw | [`CompositionDrawIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt) |
| Assign / clear | [`CompositionSlotAssignmentIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentIntegrationTest.kt) |
| Confirm / decline / proxy | [`CompositionParticipationIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt) |

Auth de test : [`TestAuthSupport.kt`](../../services/api/src/test/kotlin/com/hatcast/api/support/TestAuthSupport.kt) (`memberSessionCookieFromGoogleSignIn`, `testPrincipal`).

### Recette / staging sans UI (R5)

Aucune API GET en MEP. Pour la recette staging : lecture **SQL directe** sur `audit_events` (ou tests d'intégration). **Option** non requise : un GET admin-only derrière flag pourrait être ajouté si la recette l'exige — à arbitrer, **pas** dans le DoD 9.0.

### Explicit non-goals

- **Aucune** API GET / route de consultation (= **9.1** / **9.2**).
- **Aucun** écran Angular, aucun composant `apps/web/`.
- **Pas** de backfill de l'historique V1 Firestore `auditLogs` (aucune slice MIG-* demandée).
- **Pas** d'anonymisation / rétention (FR37 = story **1.7**, deferred).
- **Pas** d'audit des envois de notifications (story séparée post-MEP, cf. PLAN ordre).
- **Pas** de message queue / outbox.
- **Import CSV membres** (`TroupeMemberCsvImportService`) : hors DoD strict — optionnel d'émettre `TROUPE_MEMBER_*` par ligne importée réussie ; sinon story post-MEP.
- **Pas** de refactor des colonnes partielles `recorded_by_user_id` / `declined_by_user_id`.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **5.5** | done | Proxy dispo + `recorded_by_user_id` (V23) — sujet/acteur à journaliser |
| **2.2** | done | Admin membres — `TroupeMembershipService` |
| **3.5** | done | Délégation organisateurs — `OrganizerAccessService` |
| **3.8** | done | Rosters saison/événement |
| **3.19** | done | Retrait roster saison |
| **3.2** | done | CRUD spectacles — `EventService` |
| **6.8** | done | Proxy confirm/decline + `declined_by_user_id` (V21) — sujet/acteur à journaliser |
| **6.13** | done | Pattern after-commit notifications — **contraste** (audit = même tx) |
| **6.4 / 6.5 / 6.6 / 6.9** | done | Draw, assign, validate/unlock, gap-fill — points d'accroche |
| **OPS-2** | done | CI tests intégration (H2) |
| **9.1** | backlog | Consommera `audit_events` (API GET + UI admin) — **dépend de 9.0** |
| **9.2** | backlog | Vue membre « me concernant » — **dépend de 9.0** |
| **1.7** | deferred | Anonymisation FR37 — politique de rétention sur `audit_events` |

### Architecture compliance

- **FR35** ([prd.md](../planning-artifacts/prd.md)) : acteur, sujet (si proxy), type, horodatage seconde, before/after sur status/roleKeys/assignations.
- [architecture.md](../planning-artifacts/architecture.md) L128/L281/L365 : actor vs subject sur chaque mutation proxy ; audit écrit dans la **même transaction**.
- **NFR-S2** : pas d'exposition lecture en 9.0 (consultation = 9.1 avec scope autorisation).
- Conventions persistance : `UUID` PK, `TIMESTAMPTZ`, FK explicites, JSON en `TEXT` via `AttributeConverter` (jamais `jsonb`).

### Project context reference

- Tests API : `./gradlew test` depuis la racine monorepo ([project-context.md](../../project-context.md)).
- Conflits docs normatifs (DOMAIN/SPEC/ARCH décrivent encore l'audit V1 Firestore) : signalés par le rapport de readiness — **mettre à jour DOMAIN.md + ARCH.md dans la même PR** (AGENTS.md § « Updating docs when code changes »).
- Pas de feature inventée — story tracée PLAN § Epic 9 + SCP 2026-06-02 + epics.md.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 9.0)

### Debug Log References

(none)

### Completion Notes List

- Module `com.hatcast.api.audit` : migration V43, entité JPA, `AuditActionType`, `AuditEventRecorder`, `AuditSnapshots`, `JsonMapConverter`.
- Hooks dans 11 services domaine (dispos → participation) ; écriture dans la même transaction que la mutation.
- Suite `AuditEventIntegrationTest` (7 tests) : dispos self/proxy, event lifecycle, roster remove, organizer grant/revoke, validate/confirm/decline, corrélation `event_id`, rollback sur 404.
- `./gradlew test` vert (suite complète API).
- Docs : `DOMAIN.md`, `ARCH.md`, ADR-0018.

### File List

- `services/api/src/main/resources/db/migration/V43__audit_events.sql`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionType.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventRecorder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditSnapshots.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/JsonMapConverter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/audit/AuditEventIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt`
- `DOMAIN.md`
- `ARCH.md`
- `docs/adr/0018-v2-audit-events-postgres.md`
- `docs/adr/README.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-02 : Story créée (create-story 9.0, write path FR35 / MEP — SCP iso-V1).
- 2026-06-02 : Extension PO — audit spectacles (EVENT_*) + corrélation `event_id` ; AC dispos restructurés.
- 2026-06-02 : Extension PO — audit rosters (SEASON/EVENT_PARTICIPANT_*, EVENT_ROSTER_*) + droits (TROUPE_MEMBER_*, *_ORGANIZER_*).
- 2026-06-01 : Implémentation dev-story — module audit V2, hooks domaine, tests intégration, docs + ADR-0018.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics 9.0 / FR35 / PLAN / readiness)
- [x] Section **Material 3** → **UI : N/A** (backend-only)
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser (services, migrations, tests)
- [x] `./gradlew test` mentionné
- [x] Point critique H2 vs `jsonb` documenté
- [x] Frontière transactionnelle (même tx) explicitée vs 6-13
