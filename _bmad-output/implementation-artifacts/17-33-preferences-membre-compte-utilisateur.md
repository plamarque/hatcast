# Story 17.33: Préférences membre au niveau compte utilisateur

Status: done

## Story

En tant que **membre HatCast**,  
je veux **un pseudo et des rôles préférés stockés une seule fois sur mon compte**,  
afin de **ne plus les dupliquer ni les synchroniser manuellement troupe par troupe**.

## Contexte / motivation

Story **17.29** a déplacé l’UI des préférences vers Mon compte en **propageant** pseudo et rôles sur chaque adhésion active via `PATCH …/memberships/me` et `PUT …/preferred-roles` (solution interim). Revue code 17.29 (2026-06-01) : persistance non atomique et rôles divergents inter-troupes → **nouvelle story requise** pour un modèle compte unique.

## Acceptance Criteria

1. **Given** un utilisateur authentifié, **when** il modifie pseudo ou rôles préférés sur `/compte`, **then** une **seule** source de vérité persiste au niveau **compte utilisateur** (colonne(s) ou table dédiée), pas N appels par troupe.
2. **Given** le modèle compte en place, **when** l’utilisateur rejoint ou consulte une troupe, **then** le pseudo affiché et les rôles pré-cochés proviennent du compte (éventuellement surcharge locale future — hors scope initial).
3. **Given** migration depuis le modèle interim 17.29, **when** déployé, **then** stratégie documentée pour données existantes (consensus, dernière modification, ou première troupe active) sans perte silencieuse.
4. **Given** endpoints troupe `displayName` / `preferred-roles` par membership, **when** cette story est terminée, **then** chemins obsolètes retirés ou dépréciés ; UI Mon compte ne boucle plus sur les troupes actives.
5. **Given** implémentation terminée, **when** tests web + API + migration, **then** ils passent ; specs 17.29 interim (`MemberPreferencesForm` propagation) adaptées ou remplacées.

**Couverture produit :** Remplace l’interim propagation de 17.29 ; amends FR9 / pseudo global mentionné en Dev Notes 17.29.

**UI : N/A** pour la conception API/migration seule ; inclure section Material 3 si changements `apps/web/`.

---

## Tasks / Subtasks

- [x] **Domaine & API** — modèle `users.member_display_name` (ou équivalent) + preferred roles compte ; endpoints `GET/PATCH /v1/me/preferences` (ou similaire).
- [x] **Migration** — script/consolidation depuis `troupe_memberships.display_name` et preferred roles par troupe.
- [x] **Web Mon compte** — `MemberPreferencesForm` lit/écrit le compte, supprime la boucle multi-troupes.
- [x] **Cleanup** — déprécier ou retirer propagation per-troupe ; ADR optionnel.
- [x] **Tests** — unit/integration ; cas divergence legacy.

### Review Findings

- [x] [Review][Patch] Mettre à jour le test d’intégration legacy qui attend encore un pseudo par troupe [services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt:450]
- [x] [Review][Patch] Empêcher les chemins admin/import/réactivation de recréer des pseudos locaux divergents du compte utilisateur [services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt:230]
- [x] [Review][Patch] Lire les rôles préférés compte dans le clin d’œil saison membre self, pas depuis l’adhésion [services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt:97]
- [x] [Review][Patch] Marquer les endpoints troupe `memberships/me` et `preferred-roles` comme dépréciés ou les retirer explicitement [services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileController.kt:30]
- [x] [Review][Patch] Ajouter une couverture dédiée de migration V40 pour la consolidation des données 17.29 divergentes [services/api/src/main/resources/db/migration/V40__user_member_preferences.sql:12]

## Dependencies

| Story | Relationship |
|-------|--------------|
| 17.29 | Interim UI + propagation — remplacé par 17.33 |
| 17.24 | Mon compte shell |

## Dev Agent Record

### Agent Model Used

Composer

### Implementation Plan

- Colonnes `users.member_display_name` et `users.preferred_role_keys` (Flyway V40, SQL portable H2/PostgreSQL).
- `UserMemberPreferencesService` : lecture/écriture compte + synchronisation atomique des adhésions `ACTIVE`.
- `GET` / `PATCH` `/v1/me/preferences` ; endpoints troupe `preferred-roles` et `PATCH memberships/me` délèguent au compte (rétrocompatibilité).
- Front : `MePreferencesApiService` + formulaire Mon compte sans boucle troupes.

### Completion Notes List

- ✅ Source de vérité compte avec propagation membership en une transaction.
- ✅ Migration documentée : dernière adhésion active modifiée (`updated_at`), puis harmonisation inter-troupes.
- ✅ Tests API `MeMemberPreferencesIntegrationTest` + web `MemberPreferencesForm` (773 tests web OK).
- ℹ️ Endpoints troupe conservés (délégation compte) — pas de breaking change pour `member-profile-dialog` / hub troupe.
- ✅ Revue code : chemins membership legacy alignés compte, clin d’œil saison self corrigé, endpoints legacy dépréciés, test migration V40 ajouté.

### File List

- services/api/src/main/resources/db/migration/V40__user_member_preferences.sql
- docs/v2/migration/user-member-preferences-17-33.md
- services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserMemberPreferencesService.kt
- services/api/src/main/kotlin/com/hatcast/api/user/MePreferencesController.kt
- services/api/src/main/kotlin/com/hatcast/api/user/dto/UserMemberPreferencesDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/MemberDisplayNameResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt
- services/api/src/test/kotlin/com/hatcast/api/user/MeMemberPreferencesIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/MemberDisplayNameResolverTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt
- apps/web/src/app/core/account/me-preferences-api.service.ts
- apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts
- apps/web/src/app/shared/member-preferences-form/member-preferences-form.spec.ts

### Change Log

- 2026-06-01 : Story créée depuis revue code 17.29 (décisions persistance compte vs per-troupe).
- 2026-06-01 : Implémentation — modèle compte, API `/v1/me/preferences`, migration V40, UI Mon compte.
