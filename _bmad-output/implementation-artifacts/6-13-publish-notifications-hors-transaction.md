# Story 6.13 — Publish : notifications hors transaction

**Status:** done

**PLAN:** [PLAN.md](../../PLAN.md) § Hygiene H1 backlog **6-13**  
**SCP:** [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](../planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md)  
**Triage:** [deferred-triage-2026-05.md](deferred-triage-2026-05.md) — **DW-085** ; deferred-work **D1** (story 6-3 review)  
**Epic:** 6 — Tirage, composition et cycle de vie (hygiene slice, prep Epic 8)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

En tant que **produit / opérateur** préparant la livraison réelle des notifications (Epic 8),  
je veux que l’intent **`draft composition shared`** (FR31) soit émis **après commit** de la publication,  
afin que **un rollback transactionnel n’envoie jamais de notification** et que la persistance `publishedAt` soit garantie avant tout side-effect externe (**NFR-R2**).

---

## Acceptance Criteria

1. **Given** un organisateur publie un brouillon pour la **première fois** (`publishedAt` était null), **when** `POST …/composition/publish` réussit et la transaction est **commitée**, **then** `CompositionNotificationPort.publishDraftCompositionShared(eventId, seasonId, actorUserId)` est invoqué **exactement une fois** — plus **jamais** à l’intérieur du corps `@Transactional` de `publishComposition`. [Source: DW-085 ; FR22/FR31 ; Story 6-3 AC5 ; NFR-R2]

2. **Given** une composition **déjà publiée**, **when** l’organisateur rappelle publish (idempotence 6-3 AC6), **then** **aucun** nouvel appel notification n’est émis. [Source: Story 6-3 AC6 ; 6-5 fix D2]

3. **Given** la transaction publish **rollback** (erreur après `save` composition ou avant commit — cas simulé en test), **when** la requête échoue, **then** `publishDraftCompositionShared` **n’est pas** appelé. [Source: NFR-R2 — async notifications must not corrupt domain state]

4. **Given** le comportement observable API inchangé (200 + DTO, 403, 409), **when** les tests d’intégration composition existants passent, **then** aucune régression sur visibilité, idempotence publish, ou lifecycle — `./gradlew test` vert. [Source: CompositionIntegrationTest ; CompositionSlotAssignmentIntegrationTest]

5. **Given** story **6-13** done, **when** hygiene H1 est revue, **then** **DW-085** / deferred-work **D1** sont couverts ; le mécanisme choisi est **documenté** en Dev Notes pour qu’Epic 8 branche la livraison push/email sur le même port **sans** réintroduire d’appels in-tx. [Source: SCP H1 ; Epic 8 prep]

**Product coverage:** fiabilité infra notification — pas de changement SPEC fonctionnel visible en MVP (adapter no-op inchangé côté logs).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; le front continue d’appeler `CompositionApiService.publishComposition` sans modification.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` uniquement — pas de changement Angular, pas de `legacy/`.
- [x] **Événement domaine + listener after-commit** (AC: 1, 3, 5)
  - [x] Introduire un événement Spring (ex. `DraftCompositionSharedEvent`) portant `eventId`, `seasonId`, `actorUserId`.
  - [x] Dans `CompositionService.publishComposition`, **retirer** l’appel direct à `notificationPort.publishDraftCompositionShared` ; publier l’événement **uniquement** dans la branche `!alreadyPublished` (après `compositionRepository.save`).
  - [x] Créer un listener dédié (ex. `CompositionNotificationEventListener`) avec `@TransactionalEventListener(phase = AFTER_COMMIT)` qui délègue au `CompositionNotificationPort` existant.
  - [x] **Ne pas** activer `@Async` dans cette story — exécution synchrone post-commit suffit tant que l’adapter reste no-op ; Epic 8 pourra asyncifier le listener ou l’impl du port.
- [x] **Tests** (AC: 1–4)
  - [x] Étendre ou ajouter un test d’intégration avec `@MockBean` / spy sur `CompositionNotificationPort` : premier publish → `verify` 1 appel ; second publish → `verify` toujours 1 appel total.
  - [x] Test rollback : service ou listener test avec transaction qui échoue après publish d’événement — assert port **never** called (unit `@DataJpaTest` + `@TransactionalEventListener` ou test `@SpringBootTest` avec `@Transactional` + exception forcée sur un bean test-only).
  - [x] `./gradlew test` — suite composition + régression globale.
- [x] Mettre à jour `sprint-status.yaml` → **done** via dev-story / code-review (hors scope create-story).

---

## Dev Notes

### Problem statement

| ID | Symptôme / risque | Cause racine |
|----|-------------------|--------------|
| **DW-085** / **D1** | Futur envoi push/email alors que `publishedAt` n’est pas commité | `notificationPort.publishDraftCompositionShared(...)` appelé **dans** `@Transactional publishComposition` **avant** commit |
| **NFR-R2** | Side-effects externes incohérents avec l’état DB | Même pattern que l’architecture : notifications **out of band** après persistance domaine |

**État actuel (spot-check 2026-05-28, toujours vrai) :**

```kotlin
// CompositionService.kt L71-103 — À CORRIGER
@Transactional
fun publishComposition(...) {
    // ...
    if (!alreadyPublished) {
        composition.publishedAt = now
        compositionRepository.save(composition)
        notificationPort.publishDraftCompositionShared(eventId, seasonId, principal.userId) // ← in-tx
    }
}
```

L’adapter [`NoOpCompositionNotificationAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt) masque le bug (log DEBUG seulement) — acceptable en 6-3, **bloquant** avant Epic 8.

### Recommended implementation (normative)

**Préférer `@TransactionalEventListener(AFTER_COMMIT)`** plutôt que dupliquer la logique inline :

| Étape | Fichier / action |
|-------|------------------|
| Event POJO | `com.hatcast.api.composition.DraftCompositionSharedEvent` (data class, champs UUID) |
| Publish event | `CompositionService` — injecter `ApplicationEventPublisher` ; `publishEvent(...)` après save |
| Listen + notify | `CompositionNotificationEventListener` — `@Component`, `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` → `notificationPort.publishDraftCompositionShared` |
| Port inchangé | `CompositionNotificationPort` + `NoOpCompositionNotificationAdapter` — Epic 8 remplace l’impl, pas le contrat |

**Pattern alternatif déjà dans le repo :** [`SeasonService.delete`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt) utilise `TransactionSynchronizationManager.registerSynchronization { afterCommit() }` pour du **logging** post-commit. Pour les intents notification (extensibles Epic 8), l’événement Spring + listener dédié est **plus propre** (testable, plusieurs listeners futurs).

**Ne pas** appeler le port depuis `CompositionService` après refactor — un seul chemin : listener after-commit.

### Scope boundaries

| In scope (6-13) | Out of scope |
|-----------------|--------------|
| Intent **publish** / `publishDraftCompositionShared` | **`validateComposition`** → `requestCompositionConfirmation` (même anti-pattern in-tx — story séparée ou bundle Epic 8) |
| | `requestConfirmationForAssignees`, `requestManualAnnouncement` (draw, gap-fill, share) |
| | Livraison push/email réelle (Epic 8) |
| | Changement OpenAPI / contrat REST |
| | Audit trail FR35 |
| | Front Angular |
| | Legacy `legacy/` |

### Technical guardrails

| Topic | Action |
|--------|--------|
| Idempotence | Événement émis **seulement** si `!alreadyPublished` — aligné 6-3 AC6 |
| Ordre | Commit DB **puis** notification — jamais l’inverse |
| Erreurs listener | Si le port lève une exception post-commit, la transaction publish reste commitée ; documenter qu’Epic 8 devra try/catch + retry/queue (hors 6-13) |
| `@EnableAsync` | **Non** requis pour cette story |
| Tests existants | [`CompositionIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt) — publish, idempotence, 409, 403 ; [`CompositionSlotAssignmentIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentIntegrationTest.kt) — idempotent publish after slot clear (6-5 D2) |
| Mock pattern | Suivre [`CompositionGapFillIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionGapFillIntegrationTest.kt) — `@MockBean CompositionNotificationPort` + `verify` |

### Architecture compliance

- **NFR-R2** ([architecture.md](../planning-artifacts/architecture.md)) : async notification handling — domain state committed first.
- **Data flow** : Browser → REST → Postgres ; notifications out of band.
- **Domain events** ([architecture.md](../planning-artifacts/architecture.md) § naming) : past tense / `XxxOccurred` — `DraftCompositionSharedEvent` acceptable.
- **FR31** : intent hook preserved ; delivery reste stub jusqu’à Epic 8.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **6-3** | done | Introduced port + publish ; deferred D1 |
| **6-5** | done | Idempotent publish when slots cleared — must not regress |
| **6-6** | done | Validate uses separate notification intent — out of scope |
| **Epic 8** | backlog | Will replace no-op adapter ; depends on after-commit hook from 6-13 |
| **12-7**, **5-7** | done | Sibling Hygiene H1 stories — same gate before MIG-2 |

### Explicit non-goals

- Refactor all composition notification call sites in one PR.
- Introduce message queue / outbox pattern (Epic 8+ if needed).
- Change observable HTTP responses or UI copy.

### Previous story intelligence (6-12)

Story **6-12** (toolbar Équipe) est **front-only** — le bouton **Publier** appelle déjà `CompositionApiService.publishComposition` sans changement requis. Pattern race post-await documenté en 6-3 review (`eventId` capturé) — ne pas rouvrir.

### Git intelligence

Commits récents Hygiene H1 : **12-7** (mutex navigation), **5-7** (read-only GET summary). Même discipline : petit diff API, tests ciblés, pas de scope front.

### Project context reference

- Tests API : `./gradlew test` depuis la racine monorepo ([project-context.md](../../project-context.md)).
- Pas de feature inventée — lier DW-085 / PLAN H1.

---

## Dev Agent Record

### Agent Model Used

Claude (Cursor agent)

### Completion Notes List

- `DraftCompositionSharedEvent` + `CompositionNotificationEventListener` (`@TransactionalEventListener(AFTER_COMMIT)`) : seul chemin vers `publishDraftCompositionShared` après commit DB.
- `CompositionService.publishComposition` publie l'événement après `save` dans la branche `!alreadyPublished` ; appel direct au port retiré.
- Tests `CompositionPublishNotificationIntegrationTest` : 1 appel au premier publish, idempotence (toujours 1), rollback via `PublishCompositionRollbackProbe` (exception post-publish → port jamais appelé).
- `./gradlew test` vert (suite complète API).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/DraftCompositionSharedEvent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionPublishNotificationIntegrationTest.kt`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-29 : Story créée (create-story 6-13, Hygiene H1 / DW-085).
- 2026-05-29 : Implémentation after-commit pour `publishDraftCompositionShared` (DW-085 / D1) ; tests notification timing.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / DW-085)
- [x] Section **Material 3** → **UI : N/A**
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné
