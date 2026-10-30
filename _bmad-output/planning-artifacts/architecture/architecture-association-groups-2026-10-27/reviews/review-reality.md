# Revue de réalité — architecture association-groups

Verdict : **à renforcer avant finalisation**. La stack et les principaux constats brownfield sont vérifiés sur le checkout ; plusieurs frontières de transition et de présentation nécessitent une règle explicite.

## Élevé — état sélectionné et lecteurs existants

`EventCompositionSlotEntity.kt` persiste un enum JPA de trois états ; les contrats `services/api/openapi/me-agenda.yaml` et les types Angular ne connaissent que `pending`, `confirmed`, `declined`. `CompositionLifecycleService.kt:88` et `apps/web/src/app/core/composition/composition-lifecycle.ts:108` ne considèrent complet que `confirmed`; le badge API émet encore « Équipe confirmée ». Une version API historique peut aussi échouer en lisant une nouvelle valeur d'enum. AD-12 et AD-15 doivent imposer : compléter la sélection sur les deux états d'engagement, étiqueter les badges et parcours sans attribuer une confirmation inexistante, coordonner lecteurs/écrivains et clients persistants (PWA/rollback) avant d'écrire le nouvel état. Interdire les actions/API de confirmation sur l'événement sans confirmation, y compris proxy et agenda.

## Élevé — zéro probabilité et candidats manuels

`CompositionSlotAssignmentService.kt:79-179` calcule le pipeline, scores et pourcentages dans le service de candidats utilisé par l'affectation manuelle. AD-13 interdit le tirage et ses simulations mais ne fixe pas explicitement les réponses de candidats, breakdowns, historiques calculés ou l'appel direct aux endpoints de chances pour un événement sans tirage. Imposer une projection/API sans données de chance et sans sélection de formule, tout en gardant l'accès à une liste de candidats exploitable en manuel ; appliquer les gardes sur tous les chemins et pas seulement sur les boutons ou l'exécution du tirage.

## Élevé — rôle personnalisé absent des énumérations existantes

`EventRoleSlots.kt:149-150` sélectionne exclusivement `RoleKeys.PRIORITY_ORDER`; les validateurs et règles statistiques sont à listes fermées. AD-8 promet qu'un nouveau rôle participe au tirage mais ne définit pas l'ordre déterministe des nouveaux rôles ni la garantie que l'énumération les couvre ; deux stories conformes pourraient l'ignorer ou appliquer des ordres incompatibles. Fixer une convention commune déterministe de couverture et de priorité, avec maintien de l'ordre historique et intégration explicite de tous les rôles actifs offerts ; traiter le stockage d'identités et la compatibilité des facteurs.

## Moyen — préférences et anciennes versions

`UserMemberPreferencesService.kt:104,117-121` expose les rôles globalement et les recopie dans toutes les adhésions ; `PreferredRoleKeys.kt:12-17` interprète une liste vide comme « tous » et rejette les rôles inconnus. AD-6/15 identifient l'objectif mais devraient explicitement fermer ou adapter l'ancien chemin global d'écriture afin qu'il ne réécrive jamais les adhésions après migration, y compris par d'anciens clients ; conserver la sémantique wildcard et un traitement groupé des rôles archivés.

## Moyen — rappels et formulation des notifications

`AssigneePresenceReminderJob.kt:90` cible uniquement `CONFIRMED`. AD-12 interdit à juste titre les rappels de confirmation pour `sélectionné`, mais le document laisse les rappels informatifs ouverts. Il faut que leur contenu et action ne supposent pas une confirmation antérieure et que l'implémentation ne crée pas de seconde demande ; expliciter dans les critères de vérification. La décision d'étendre ou non le rappel aux sélectionnés peut rester différée si elle ne bloque aucune autre unité.

## Observations confirmées

- `apps/web/package.json` déclare Angular 21.2 et Material 21.2 ; `services/api/build.gradle.kts` déclare Kotlin 2.0.21 et Spring Boot 3.4.1 ; le projet utilise PostgreSQL/Flyway et H2 local. Ces constats proviennent des fichiers du dépôt, pas d'une vérification d'installations ou de déploiements réels.
- `EventRoleSlots.kt` définit types et rôles fermés et leurs modèles ; `EventEntity.kt` stocke déjà des références de type et des besoins par rôle ; `EventCompositionSlotEntity.kt` conserve la clé de rôle.
- Le calcul de parité UI `composition-player-gender-parity.ts:27` cible explicitement `player`. `gender_parity` est une option réservée, pas un facteur de tirage actuellement implémenté (`DrawFormulaPipelineAssembler.kt`).
- Le type `deplacement` a une sémantique historique spéciale de catégorie dans `EventCompositionSlotRepository.kt:33-34,63-64`; la préservation des clés/du comportement doit inclure cette logique pour les anciens événements et les types ajoutés ne doivent pas y être assimilés implicitement.
