## Deferred from: code review of 3-2-spectacles-dans-la-saison-et-liste-pour-les-membres.md (2026-04-21)

- Revue limitée au diff non commité : périmètre incomplet vs story (API événements, UI `season-home`, migrations, tests unitaires PATCH hors `SeasonControllerIntegrationTest`) — valider sur la branche `v2` ou l’historique de commits avant merge.

- Contrôle d’accès lecture/écriture non différencié (modèle membre/admin provisoire avant epic-2) dans `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`.
- Résolution de saison par `slug` basée sur la première troupe côté web (acceptable tant que seed unique), dans `apps/web/src/app/pages/season-home/season-home.ts`.
- Modèle d’accès lecture membre vs gestion admin non séparé (dépend d’epic-2 / matrice permissions), dans `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`.
