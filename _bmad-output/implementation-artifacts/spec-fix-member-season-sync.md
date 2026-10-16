---
title: Synchroniser les membres actifs avec les rosters de saison
status: in-progress
route: oneshot
---

# Correctif BUG-033 — synchronisation membre / saison

## Problème

Les projections Accueil et agenda reposent sur `season_participants`. Une adhésion de troupe active créée par ajout administratif, import CSV ou self-join pouvait ne créer aucune participation de saison. Le membre pouvait alors ne voir que les spectacles d'une autre troupe déjà synchronisée, notamment la démo.

## Décision

Après toute création ou réactivation d'adhésion membre active, appeler le synchroniseur central sur l'ensemble des saisons de la troupe. Un ré-ajout administratif ou une ligne CSV identique déclenche également cette synchronisation pour guérir une donnée historique manquante. Pour les imports CSV qui inactivent un membre, appeler le retrait central correspondant. Conserver les garde-fous du synchroniseur : un externe n'est pas ajouté et un retrait explicite de saison reste préservé.

## Portée

- Ajout direct par un administrateur.
- Import CSV, création et transition active/inactive.
- Self-join d'une troupe ouverte.
- Tests unitaires et d'intégration des voies ci-dessus, y compris une adhésion historiquement incomplète ré-ajoutée ou réimportée sans autre changement, avec isolation des scénarios de conversion existants.

## Hors portée

- Écriture dans Neon de production pour réparer les adhésions historiques : elle réclame un rapport de détection en lecture seule et une autorisation explicite distincte.
- Changement du modèle agrégé de l'accueil : il reste fondé sur les participations de saison accessibles.

## Vérification

Commande ciblée :

```text
cd services/api && ./gradlew test --tests com.hatcast.api.troupe.TroupeMembershipServiceTest --tests com.hatcast.api.troupe.TroupeMembershipIntegrationTest --tests com.hatcast.api.troupe.TroupeMembershipLifecycleIntegrationTest --tests com.hatcast.api.participant.SeasonParticipantMembershipSyncTest
```

Résultat : 63 tests réussis le 2026-10-14.
