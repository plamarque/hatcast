# Story 2.10 — Liste membres : corriger N+1 emails

**Status:** done

**PLAN:** [PLAN.md](../../PLAN.md) § Hygiene H1 backlog **2-10**  
**SCP:** [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](../planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md)  
**Triage:** [deferred-triage-2026-05.md](deferred-triage-2026-05.md) — **DW-068**  
**Predecessor:** [2-2-administration-des-membres-et-roles-de-base.md](2-2-administration-des-membres-et-roles-de-base.md) (review defer N+1)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

> **Note ID :** L’**Story 2.10 originale** (chrome global troupe) est **reportée** (Phase C / Epic 11–14). L’identifiant **2-10** est **réutilisé** dans PLAN pour cette hygiene **H1** perf API — ne pas implémenter le switcher troupe global de l’ancien epic.

---

## Story

En tant qu’**administrateur de troupe** ouvrant la liste Membres (`GET /v1/troupes/{id}/members` ou export CSV),  
je veux que le serveur charge les emails utilisateur **en une requête batch** par page,  
afin de **respecter NFR-P2** et d’éviter une dégradation linéaire (N+1) sur les troupes importées en recette staging (**M2**).

---

## Acceptance Criteria

1. **Given** un admin autorisé et une troupe avec **N** memberships (N ≥ 2), **when** `GET /v1/troupes/{troupeId}/members?page=0&size=25` est exécuté, **then** Hibernate n’émet **pas** N requêtes lazy-load supplémentaires sur `users` — au plus **2** requêtes SQL liées à la liste (count + fetch page) ou équivalent documenté (two-step ID + `JOIN FETCH`). [Source: DW-068 ; NFR-P2 ; PRD « avoid chatty N+1 »]

2. **Given** la réponse paginée existante, **when** la requête réussit, **then** le contrat JSON **reste inchangé** (`PagedTroupeMembersResponse`, champs `email`, `userSlug`, `avatarUrl`, pagination `page`/`size`/`totalElements`/`totalPages`) — aucune modification OpenAPI obligatoire si shape identique. [Source: Story 2.2 ; `seasons.yaml` `/troupes/{troupeId}/members`]

3. **Given** `exportActiveMembersCsv`, **when** l’admin exporte les membres actifs, **then** le parcours batch paginé n’introduit **pas** de N+1 sur `user.email` (même pattern JOIN FETCH ou requête dédiée). [Source: `TroupeMemberCsvCodec.formatExport` accède à `membership.user.email`]

4. **Given** les tests d’intégration troupe existants, **when** `./gradlew test` passe, **then** `TroupeMembershipIntegrationTest` reste vert ; **ajouter** un test dédié prouvant l’absence de N+1 sur GET members (Hibernate `Statistics` en `@Transactional` test, ou assertion du nombre de statements SQL ≤ seuil fixé pour une page de 2+ membres seed). [Source: OPS-2 gate ; pattern test G-003 story 5-7]

5. **Given** story **2-10** done, **when** hygiene est mise à jour, **then** référencer **DW-068** en Dev Notes ; ne pas corriger **DW-063** (organisateurs) ni RFC 7807 (**DW-067**) dans ce périmètre. [Source: SCP H1 cap]

**Product coverage:** perf hot path admin Membres — pas de changement SPEC fonctionnel (FR7 inchangé).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; `AdminMembres` continue d’appeler `TroupeApiService.listMembers`.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` uniquement — repository + service ; **pas** de changement Angular.
- [x] **Repository** — remplacer l’usage nu de `findByTroupe_Id` dans `listMembersForAdmin` :
  - Option recommandée : **two-step pagination** (IDs paginés sans fetch user, puis `JOIN FETCH m.user WHERE m.id IN :ids` + réordonnancement en Kotlin pour conserver `displayName ASC`).
  - **Ne pas** appliquer `JOIN FETCH` directement sur une requête paginée Hibernate (pagination en mémoire / count incorrect).
  - Réutiliser le pattern existant `findByTroupe_IdAndStatusIn` (`JOIN FETCH m.user`) comme référence dans le même fichier.
- [x] **Export CSV** — corriger `exportActiveMembersCsv` : remplacer `findByTroupe_IdAndStatusOrderByDisplayNameAsc` par une variante avec `JOIN FETCH m.user` (batch paginé ou liste si volume export ≤ batch size documenté).
- [x] **Service** — `listMembersForAdmin` appelle la nouvelle API repository ; `@Transactional(readOnly = true)` inchangé ; mapping `TroupeMemberAdminDto.from` inchangé.
- [x] **Tests** — test N+1 ou statement count sur GET members ; régression export + liste admin ; `./gradlew test` vert.
- [x] Mettre à jour `sprint-status.yaml` et `PLAN.md` backlog **2-10** → done après implémentation.

### Review Findings

- [x] [Review][Patch] Le test N+1 n'exerce pas l'endpoint GET demandé par l'AC4 [`services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`:553]
- [x] [Review][Patch] L'export CSV ne réapplique pas `troupeId`/`ACTIVE` lors du fetch batch final [`services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`:303]
- [x] [Review][Patch] L'absence de N+1 sur l'export CSV n'est pas couverte par un test de statistiques [`services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`:870]
- [x] [Review][Patch] Le tracking mélange l'état 2-10 et une mise à jour hors périmètre [`_bmad-output/implementation-artifacts/sprint-status.yaml`:68]

---

## Dev Notes

### Problem statement

- Review **Story 2.2** (2026-05-23) : `listMembersForAdmin` appelle `membershipRepository.findByTroupe_Id` sans fetch de `user` ; `TroupeMemberAdminDto.from` lit `entity.user.email`, `slug`, `avatarUpdatedAt` → **1 + N** requêtes SQL.
- **DW-068** classé **H1** : charge réelle attendue après import troupe prod (**MIG-2** / recette staging).
- Endpoint consommé par **`/saison/:slug/admin/membres`** (Story **2.8**) — latence liste + export CSV.

### Root cause (code actuel)

```122:128:services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
        val p =
            membershipRepository.findByTroupe_Id(
                troupeId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "displayName")),
            )
        return PagedTroupeMembersResponse(
            content = p.content.map(TroupeMemberAdminDto::from),
```

```88:92:services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
        fun from(entity: TroupeMembershipEntity): TroupeMemberAdminDto {
            val slug =
                entity.user.slug?.trim()?.takeIf { it.isNotEmpty() }
                    ?: throw IllegalStateException("User ${entity.user.id} has no slug")
            return TroupeMemberAdminDto(
```

`TroupeMembershipEntity.user` est `@ManyToOne(fetch = LAZY)` — accès email déclenche un SELECT par ligne.

### Technical guardrails

| Topic | Action |
|--------|--------|
| Hot path | `TroupeMembershipService.listMembersForAdmin` + `exportActiveMembersCsv` |
| Pattern repo | Copier l’esprit de `findByTroupe_IdAndStatusIn` (JOIN FETCH user) — adapter à la pagination |
| Pagination | Default `size=25`, max `100` (inchangé) — NFR-P1 |
| Perf cible | NFR-P2 : p95 ≤ 500 ms lecture liste sous charge nominale |
| DTO / API | Ne pas changer les champs exposés ; pas de breaking change front |
| Non-goals | N+1 organisateurs (**DW-063**) ; Problem Details (**DW-067**) ; prefetch UI ; index DB supplémentaires (sauf preuve profiler) |

### Implementation sketch (recommended)

1. `TroupeMembershipRepository` :
   - `@Query("SELECT m.id FROM TroupeMembershipEntity m WHERE m.troupe.id = :troupeId")` + `Pageable` → `Page<UUID>`
   - `@Query("SELECT m FROM TroupeMembershipEntity m JOIN FETCH m.user WHERE m.id IN :ids")` → `List<TroupeMembershipEntity>`
2. `listMembersForAdmin` : page IDs → fetch batch → trier la liste retournée selon l’ordre des IDs (HashMap + reorder).
3. Export : soit réutiliser `findByTroupe_IdAndStatusIn(troupeId, listOf(ACTIVE))` si acceptable pour troupes ≤ limite export, soit boucle batch avec nouvelle requête JOIN FETCH par page (EXPORT_BATCH_SIZE = 500).

### Hibernate pitfall (must read)

- **`JOIN FETCH` + `Pageable` sur une seule requête** : Hibernate peut paginer en mémoire après join → **interdit** pour cette story.
- **`@EntityGraph(attributePaths = ["user"])`** sur `findByTroupe_Id` : acceptable **si** vérifié en test (souvent 2 requêtes : count + select) ; préférer two-step si doute.

### Testing standards

- Fichier principal : `TroupeMembershipIntegrationTest.kt` (déjà couvre GET/PATCH/DELETE members, export, import, pagination helper `findMemberInAdminList`).
- Activer stats Hibernate dans le test dédié uniquement :

```kotlin
@Test
fun `list members does not N+1 user email`() {
  val stats = sessionFactory.unwrap(SessionFactoryImpl::class.java).statistics
  stats.clear()
  // GET /v1/troupes/{id}/members avec admin cookie
  assertTrue(stats.prepareStatementCount <= 3) // ajuster après mesure baseline seed
}
```

- Ajuster le seuil après mesure locale ; documenter la baseline dans le test (commentaire).
- `./gradlew test` depuis la racine monorepo.

### Architecture compliance

- **Stack:** Kotlin, Spring Boot, JPA/Hibernate, Flyway — pas de nouvelle dépendance.
- **Auth:** inchangé — `requireCanManageTroupeMembers` avant liste.
- **OpenAPI:** `services/api/openapi/seasons.yaml` — pas de changement si contrat identique.
- **Legacy:** ne pas modifier `legacy/`.

### Explicit non-goals

- Changer permissions ou règles last-admin (Story 2.2).
- Optimiser `findMemberInAdminList` côté tests (helper client-side pagination OK).
- Corriger N+1 sur autres endpoints (organizers, selectors, inbox).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 2.2 | done | Introduced GET `/members` + DTO admin |
| 2.3 | done | Export/import CSV — export path in scope |
| 2.8 | done | UI consumer — no change expected |
| 5-7 | done | Hygiene H1 sibling — same SCP wave |
| OPS-2 | done | CI PostgreSQL/H2 gate |

### Previous story intelligence

- **Story 2.2** review a **explicitement defer** le N+1 — cette story le ferme (**DW-068**).
- **Story 2.8** AC10 : pas de changement backend sauf bug bloquant — ici perf, pas de changement contrat.
- **Story 5-7** : modèle hygiene H1 — API-only, test d’intégration prouvant le fix, mise à jour PLAN + sprint-status.

### Git intelligence (recent patterns)

- Commits récents : hygiene **5-7** (`test(availability): …`), Epic **18** demo/onboarding.
- Message commit suggéré : `perf(api): Fix N+1 user fetch on troupe members list` (Conventional Commits, scope `api` ou `troupe`).

### References

- [deferred-work.md](deferred-work.md) § review 2-2 — DW-068
- [PLAN.md](../../PLAN.md) § Hygiene H1
- [epics.md](../planning-artifacts/epics.md) Story 2.2 — FR7
- [prd.md](../planning-artifacts/prd.md) — NFR-P1, NFR-P2
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `apps/web/src/app/core/troupes/troupe-api.service.ts` — `listMembers`

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- **DW-068** : N+1 corrigé sur `listMembersForAdmin` et `exportActiveMembersCsv` via pagination two-step (IDs paginés + `JOIN FETCH m.user` batch).
- Repository : `findIdsByTroupe_Id`, `findIdsByTroupe_IdAndStatus`, `findByIdInWithUser` ; helper `fetchMembershipPageWithUsers` dans le service.
- Test `list members does not N+1 user email` : 9 membres seed, seuil ≤ 6 statements Hibernate (baseline 4 mesurée sur H2).
- Revue BMAD : test N+1 liste passé par l'endpoint GET, test stats export ajouté, fetch export resserré sur `troupeId` + `ACTIVE`, tracking 2-10 synchronisé.
- `./gradlew test` vert (suite complète API).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `services/api/src/test/resources/application-test.yml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `PLAN.md`

### Change Log

- 2026-05-29 : Story créée (hygiene H1 / SCP 2026-05-28 / DW-068).
- 2026-05-29 : Implémentation two-step pagination + test N+1 ; status → review.
- 2026-05-29 : Revue BMAD patches appliqués ; status → done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / DW-068 / NFR-P2)
- [x] Section **Material 3** — **UI : N/A** explicite
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné
