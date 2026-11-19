---
feature_branch: feat/19-25-masquer-les-chances-apres-selection
baseline_commit:
---

# Story 19.25 : Masquer les chances après sélection

Status: backlog

## Story

En tant que **membre d'une troupe**,  
je veux **voir les chances tant qu'une sélection reste à faire, mais pas sur une attribution déjà faite**,  
afin de **ne pas confondre une estimation avec un résultat connu**.

## Acceptance Criteria

1. **Given** une personne déjà sélectionnée pour un rôle, manuellement ou par tirage, **when** elle est affichée pour ce rôle dans les onglets **Équipe ou Dispos**, **then** aucun pourcentage de chance, actuel ou enregistré, ni commande ouvrant son détail ne sont affichés pour cette personne et ce rôle. Cela couvre notamment la ligne du poste dans Équipe et les vues de Dispos, dont Tous. [Source : décision produit du 19 novembre 2026 ; epic 19.25]
2. **Given** une personne candidate à un rôle dont la sélection est encore à faire, **when** ses chances sont accessibles selon les règles existantes, **then** le pourcentage et sa fiche explicative restent disponibles, y compris dans l'aperçu du pool et pendant une étape de tirage. [Source : epic 19.25]
3. **Given** une personne sélectionnée pour un rôle et encore candidate à un autre, **when** les deux rôles sont consultés, **then** la règle s'applique séparément à chacun : son attribution ne montre pas de chances, ses chances de candidate à l'autre rôle restent disponibles selon les règles existantes. [Source : epic 19.25]
4. **Given** une sélection annulée ou une attribution retirée, **when** la personne redevient candidate pour ce rôle, **then** ses chances redeviennent accessibles selon les règles existantes. [Source : epic 19.25]
5. **Given** des pourcentages historiques enregistrés ou absents, **when** la sélection est affichée, **then** le résultat visuel est identique ; les snapshots et autres données historiques, les calculs, les règles de tirage et les permissions restent inchangés. Aucune distinction de mode de sélection n'est déduite ou exposée par cet affichage. [Source : epic 19.25]
6. **Given** les vues et points d'entrée des chances de l'onglet Dispos, dont Dispos → Tous, **when** une personne déjà sélectionnée pour le rôle y apparaît, **then** masquer son pourcentage et l'accès à son détail, sans retirer les candidats non sélectionnés ni modifier le pool de calcul. Vérifier que le statut de sélection est fiable sur chaque vue. [Source : epic 19.25]

**Couverture produit :** epic 19.25 ; UX-DR11.

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants et thème** — Réutiliser les composants Material et les tokens du thème existants pour tout contrôle ou style modifié ; ne pas introduire de couleur en dur. [Source : FRONTEND_UI.md ; UX-DR11]

**M3-2. Mobile et accessibilité** — Sur mobile et desktop, les lignes restent lisibles et utilisables ; aucun contrôle invisible ou focusable ni libellé d'accessibilité annonçant un pourcentage masqué ne subsiste. Les contrôles modifiés respectent les cibles tactiles du projet. [Source : FRONTEND_UI.md]

**M3-3. Revue** — Parcourir la checklist M3 de FRONTEND_UI.md et signaler les éventuels écarts. [Source : AGENTS.md]

## Tasks / Subtasks

- [ ] Cartographier les points d'entrée et les états de sélection par rôle, y compris Équipe et Dispos → Tous ; vérifier les états avant, pendant et après tirage. (AC 1–6)
- [ ] Adapter l'affichage et les interactions en réutilisant l'état fiable de l'attribution ; conserver les chances des candidats et ne pas modifier les données ou le calcul. (AC 1–6, M3-1–2)
- [ ] Ajouter des tests ciblés couvrant sélection manuelle et tirée, absence de snapshot, annulation, rôles distincts, accès aux explications avant sélection et absence de commande accessible après sélection. (AC 1–6, M3-2)
- [ ] Exécuter les tests web pertinents et `npm run test` selon les conventions du projet ; vérifier visuellement sur mobile et desktop, puis parcourir la checklist M3. (M3-2–3)

## Dev Notes

### Product and UX rules

- Le pourcentage ne doit pas être remplacé par une autre indication révélant si la sélection était manuelle ou aléatoire.
- La disparition concerne l'attribution d'une personne à un rôle, pas tous ses rôles ni l'ensemble du spectacle. Pendant le tirage, les informations du pool précédant la sélection restent utiles.
- Vérifier les différents états réels du modèle avant de choisir le prédicat ; ne pas déduire la sélection de la présence d'un pourcentage historique.
- Point de départ : `apps/web/src/app/pages/event-detail/event-equipe-tab.html` et `event-equipe-tab.ts` (`showSlotTrailing`, `openSlotChanceBreakdown`), `apps/web/src/app/shared/availability/availability-tous-panel.ts` et `apps/web/src/app/shared/composition/chance-breakdown-sheet/`. Vérifier les autres usages avant modification.
- Lire `docs/v2/technical/FRONTEND_UI.md` avant implémentation. Mettre à jour l'aide utilisateur si son texte devient inexact.

### Explicit non-goals

- Modifier les probabilités, les règles de tirage ou la composition des pools.
- Supprimer, recalculer ou migrer les données historiques ; changer le modèle ou les API sans nécessité démontrée.
- Modifier les droits d'accès ou créer un affichage du mode de sélection.

### Dependencies

- Story 19.23 : explications des variations de chances ; les conserver pour les candidats concernés.

## Dev Agent Record

### Agent Model Used

À compléter à l'implémentation.

### Completion Notes List

- À compléter à l'implémentation.

### File List

- À compléter à l'implémentation.

### Change Log

- 2026-11-19 : création de la story ; périmètre explicité pour les onglets Équipe et Dispos.
