## Deferred from: code review of 3-2-spectacles-dans-la-saison-et-liste-pour-les-membres.md (2026-04-21)

- Revue limitée au diff non commité : périmètre incomplet vs story (API événements, UI `season-home`, migrations, tests unitaires PATCH hors `SeasonControllerIntegrationTest`) — valider sur la branche `v2` ou l’historique de commits avant merge.

- Contrôle d’accès lecture/écriture non différencié (modèle membre/admin provisoire avant epic-2) dans `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`.
- Résolution de saison par `slug` basée sur la première troupe côté web (acceptable tant que seed unique), dans `apps/web/src/app/pages/season-home/season-home.ts`.
- Modèle d’accès lecture membre vs gestion admin non séparé (dépend d’epic-2 / matrice permissions), dans `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`.

## Deferred from: code review of 3-4-types-devenement-et-roles-requis-optionnels.md (2026-05-23)

- Seed events (V6) keep `custom`/zero slots — agenda icons stay ❓ for titled spectacles (migration scope only; optional follow-up seed script to infer types from titles).

## Deferred from: code review of 3-5-delegation-des-organisateurs-perimetre-saison-evenement.md (2026-05-23)

- Race condition check-then-insert on concurrent organizer grant (composite PK may surface 500 instead of idempotent 200), in `OrganizerAccessService.kt`.
- FK `granted_by_user_id` without `ON DELETE SET NULL` — deleting a grantor user may be blocked, in `V8__season_and_event_organizers.sql`.
- Potential N+1 on user fetch when listing organizers (no JOIN FETCH on repository queries).
- Super-admin stub not wired in `canManageComposition` (documented placeholder until config/epic-2).
- Minimal email validation (`contains("@")` only) in `resolveUserByEmail`.
- Shared `organizerSaving` flag allows parallel remove clicks before DOM disables buttons.

## Deferred from: code review of 2-2-administration-des-membres-et-roles-de-base.md (2026-05-23)

- Erreurs API sans RFC 7807 Problem Details malgré AC5 — le repo utilise `ResponseStatusException` partout ; alignement global hors périmètre story 2.2.
- N+1 lazy-load `user.email` sur `GET /members` (`findByTroupe_Id` sans JOIN FETCH), dans `TroupeMembershipRepository.kt`.
- Retest produit Story 3.5 (organisateurs) non documenté après remplacement de la règle admin provisoire seed-troupe.

## Deferred from: code review of 2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md (2026-05-23)

- Multi-troupe route resolution still uses the first membership (`tr.data[0]`) in `season-home` and event detail pages; deferred to Story 2.4 navigation/troupe switching.
- Admin CRUD actions are still visible for non-admin troupe members; deferred to Story 2.2 role/permission UI while backend enforcement remains authoritative.

## Deferred from: code review of 2-3-import-export-csv-des-membres-de-troupe.md (2026-05-23)

- Limite taille upload multipart non documentée — pattern Spring global préexistant, pas introduit par cette story.

## Deferred from: code review of 2-8-admin-membres-route-ui-ux-dr10.md (2026-05-23)

- Multi-troupe route resolution uses the first membership in `AdminMembres.loadPage`; deferred to Story 2.4 because multi-troupe switching is explicitly out of scope for Story 2.8.

## Deferred from: code review of 2-4-navigation-entre-troupes.md (2026-05-23)

- localStorage indisponible : `selectTroupe` met à jour le signal en mémoire mais si `writeStoredTroupeId` échoue, un `load()` ultérieur peut restaurer une préférence périmée depuis le stockage — edge case navigateurs durcis, commentaire déjà présent dans le service.

## Deferred from: code review of 2-5-pseudo-affiche-par-troupe.md (2026-05-23)

- Correction email dupliqué dans `EventControllerIntegrationTest` (email fixe `event@example.com` remplacé par email par sub) — correctif flaky test hors périmètre story 2.5, conservé dans le diff.

## Deferred from: code review of 2-6-avatar-et-option-image-de-profil-google.md (2026-05-23)

- `AvatarConfig` lève `IllegalStateException` si `HATCAST_AVATAR_STORAGE=gcs` au lieu d’un warning au démarrage comme suggéré dans Dev Notes — prod GCS hors périmètre MVP.

## Deferred from: code review of 3-8-rosters-participants-saison-et-evenement.md (2026-05-24)

- GET list/selectors mutate DB via `ensureMembershipParticipants` on every call — intentional per Dev Notes (sync on GET); revisit if caching or read replicas are introduced.
- Admin DTO exposes normalized (lowercase) email instead of user-entered casing — cosmetic UX only.

## Deferred from: code review of 5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige.md (2026-05-24)

- Silent empty pre-check when preferred-roles API fails — user sees no role pre-selection without feedback; same error-handling gap pattern as other dialog API calls.
