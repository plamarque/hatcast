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

## Deferred from: code review of 2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md (2026-05-23)

- Multi-troupe route resolution still uses the first membership (`tr.data[0]`) in `season-home` and event detail pages; deferred to Story 2.4 navigation/troupe switching.
- Admin CRUD actions are still visible for non-admin troupe members; deferred to Story 2.2 role/permission UI while backend enforcement remains authoritative.
