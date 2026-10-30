---
feature_branch: feat/{story-key}
baseline_commit:
---

# Story CN.1 : Réconcilier les affectations après changement de besoins

Status: done

## Story

En tant qu’**organisateur·ice**, je veux **modifier les besoins d’un spectacle sans perdre silencieusement les personnes déjà affectées**, afin de **pouvoir régulariser la composition en toute sécurité**.

## Acceptance Criteria

1. Étant donné une affectation hors positions requises après une réduction ou suppression de rôle, quand les besoins sont enregistrés, alors l’affectation est préservée comme élément à régulariser pour les organisateur·ices/admins. [Source: SPEC CAP-1, CAP-2]
2. Étant donné un membre ordinaire, quand il consulte l’équipe ou ses projections associées, alors il ne voit que les positions correspondant aux besoins actuels. [Source: SPEC CAP-2]
3. Étant donné une augmentation de besoins ou une édition sans affectation touchée, quand elle est enregistrée, alors aucun élément à régulariser n’est créé. [Source: SPEC CAP-1]
4. Étant donné un échec de mise à jour, quand la transaction est annulée, alors besoins et affectations restent inchangés. [Source: SPEC CAP-1]

**UI : N/A** — contrat API/domaine et projections ; l’UI est traitée par CN-2.

## Tasks / Subtasks

- [x] Définir le modèle de réconciliation permission-gated (AC 1–3).
- [x] Protéger les projections membre, agenda, destinataires et statistiques (AC 2).
- [x] Ajouter tests API/domain transactionnels et d’autorisation (AC 1–4).

## Dev Notes

- Réutiliser `EventService`, `CompositionService` et les règles de visibilité ; ne pas faire inférer un état masqué par le client.
- Non-goal : suppression, réaffectation ou notification automatique.
- Dépendance : SPEC `spec-composition-needs-safety`.
