---
feature_branch: codex/story-22-1-equipe-format-needs
baseline_commit: ff6548769ccab08b523e70ab1b2979f608a6d22f
---

# Story 22.1 : Équipe — format et besoins au même endroit

Status: done — human smoke validated 2026-10-14

## Story

En tant qu'**organisateur·ice**,
je veux **choisir et appliquer le format d'un spectacle depuis Équipe**,
afin de **configurer puis composer l'équipe sans quitter mon contexte de travail**.

## Acceptance Criteria

1. **Given** `canManageComposition`, **when** l'onglet Équipe est ouvert, **then** il affiche le format courant et une action pour le modifier ; l'onglet Infos affiche le même format et le résumé des besoins, en lecture seule et sans CTA d'édition. [Source: Epic 22.1 AC1 ; SPEC.md « Flexible event composition »]
2. **Given** un organisateur choisit un format dont le template diffère des `roleSlots` normalisés, **when** il le sélectionne, **then** une confirmation explicite est demandée avant toute mutation ; l'annulation conserve le format et les besoins actuels. [Source: Epic 22.1 AC2 ; SCP §2.2]
3. **Given** cette confirmation, **when** le format est appliqué, **then** la mutation envoie ensemble `templateType` et le template de `roleSlots`, crée les positions requises manquantes dans la représentation de la composition, retire les positions vides devenues inutiles, et ne supprime jamais une affectation existante silencieusement. [Source: Epic 22.1 AC3 ; SCP §2.2]
4. **Given** une affectation dont la position sort des besoins, **when** le format est appliqué, **then** CN-1 la conserve et la réserve aux organisateur·ices ; les projections membre, agenda, destinataires et statistiques n'exposent que les positions requises. [Source: DOMAIN.md Format ; SPEC.md ; CN-1]
5. **Given** un utilisateur sans `canManageComposition`, **when** il consulte Équipe ou Infos, **then** aucune action de format ou de structure n'est présente. [Source: Epic 22.1 AC4]

**Couverture produit :** FR12, FR14, UX-DR11 ; `DOMAIN.md` « Format » ; `SPEC.md` « Flexible event composition » ; [SCP flexible composition slots](../planning-artifacts/sprint-change-proposal-2026-10-14-flexible-composition-slots.md).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** le changement de format, **when** les contrôles sont rendus, **then** le sélecteur utilise `mat-form-field` / `mat-select` et la confirmation `MatDialog` existante ; les actions utilisent `mat-button` ou `mat-flat-button`, sans contrôle HTML équivalent personnalisé. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** les styles touchés, **when** un état visuel est ajouté ou déplacé, **then** il utilise les tokens `var(--mat-sys-*)` ou `color-mix`, sans hex/rgb dans la feature. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** un viewport max-width `480px`, **when** le contrôle de format et la confirmation s'affichent, **then** ils restent lisibles, sans chevauchement, avec des cibles tactiles d'au moins `48×48 dp` et des libellés/`aria-label` français si le texte est absent. [Source: FRONTEND_UI.md ; NFR-A1]

**M3-4. Revue** — **Given** l'implémentation terminée, **when** elle est relue, **then** la checklist M3 de `FRONTEND_UI.md` est parcourue ; les écarts volontaires sont consignés ici ou dans `ISSUES.md`. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **AC1, AC5 — Équipe et Infos :** déplacer l'entrée de changement de format de `EventInfosTab` vers `EventEquipeTab`; conserver dans Infos le rendu de format et des `RoleDisplayChipSet` sans import, méthode ou CTA d'édition.
- [x] **AC2, AC3 — Dialog et persistance :** réduire le dialog déplacé à la sélection/application de template (l'édition libre de compteurs et de slots appartient à 22.2), conserver sa confirmation, puis appeler `EventApiService.updateEvent` avec le couple atomique `templateType` + `applyTemplate(templateType)`.
- [x] **AC3, AC4 — Rafraîchissement :** faire remonter l'événement mis à jour et recharger la composition parent afin que ses besoins et sa projection CN-1 correspondent au même état.
- [x] **AC1–AC5, M3-1–M3-4 — Tests :** déplacer/adapter les tests Infos, ajouter les parcours organisateur, annulation, template identique, non-organisateur et rafraîchissement ; exécuter les tests Angular ciblés, puis le build web.

## Dev Notes

### Product and UX rules

- `roleSlots` est le modèle persistant canonique. Un format est un template de départ, pas une contrainte permanente.
- Ne pas réintroduire l'édition de compteurs, le slot provisoire, le choix libre de rôle, la désassignation structurelle ou la suppression de slot : ils relèvent de 22.2.
- Ne pas introduire de notifications CN-3. Une affectation seulement conservée hors besoins n'est pas une suppression notifiable.
- Ne pas intégrer le prototype CN-2 ni une surface autonome « À régulariser ».

### Scope boundary — decided 2026-10-14

CN-1 expose déjà les affectations conservées dans `CompositionResponseDto.reconciliationItems` pour les seuls organisateurs. Le client les ignore aujourd'hui : `CompositionResponse` ne les déclare pas et `EventEquipeTab.slotRows()` construit seulement les positions requises par `roleSlots`.

L'état neutre/gris **Hors modèle** et son rendu dans les groupes de rôle sont explicitement l'AC 22.3. Décision produit : **attendre 22.3**. La story 22.1 s'arrête donc à la mutation sûre CN-1 ; elle ne rend ni nouvelle surface de régularisation, ni état Hors modèle.

### Existing implementation seams

| Concern | Reuse / change |
|---|---|
| Format dialog | `event-type-roles-dialog.*` — conserver `mat-select` et confirmation ; retirer les chips de compteurs de 22.2. |
| Équipe | `event-equipe-tab.*` — nouvelle entrée organisateur, mutation et signal de rafraîchissement. |
| Infos | `event-infos-tab.*` — résumé `RoleDisplayChipSet` seulement ; supprimer l'éditeur et ses dépendances. |
| Event state | `event-detail.*` — après mise à jour, synchroniser l'événement puis recharger la composition partagée. |
| CN-1 | `CompositionService.buildResponse()` et `EventCompositionSlotEntity.isRequiredBy()` — conserver la redaction membre, sans réécriture. |

### Explicit non-goals

- Story 22.2 : ajout de slot provisoire, choix libre de rôle, édition structurelle, désassignation et suppression explicite.
- Story 22.3 : rendu complet Hors modèle, scroll/focus post-picker, concurrence dédiée et extension des projections/tests associés.
- Story 22.4 : retrait/audit CN-2 et décision de notification CN-3.
- Migration Firestore, modification de permissions, push, merge, déploiement ou démonstration locale avant approbation du plan.

### Dependencies

| Story | Status | Relationship |
|---|---|---|
| CN-1 | delivered locally on `v2` | Préservation backend et projection membre sûre à conserver. |
| 17.14 | done, placement superseded | Son extraction de `EventFormDialog` reste ; son éditeur Infos est remplacé. |
| 22.2 | backlog | Ne pas anticiper l'édition libre de structure. |
| 22.3 | backlog | Porte le rendu complet Hors modèle, explicitement reporté par décision produit. |
| 22.4 / CN-3 | backlog / undecided | Aucune notification dans cette story. |

## Dev Agent Record

### Agent Model Used

GPT-5

### Completion Notes List

- 2026-10-14 : l'édition de format a été déplacée dans Équipe ; Infos est devenue un résumé sans CTA. Le dialog n'applique plus que des templates ; l'édition libre attend 22.2 et Hors modèle 22.3.
- 2026-10-14 : une génération de requête de composition empêche une réponse antérieure de remplacer la projection post-changement de format.
- 2026-10-14 : validation automatisée — 168 tests Angular ciblés et `npm run build` passent. Smoke humain validé : format éditable dans Équipe, Infos en lecture seule, confirmation de remplacement visible.

### File List

- `_bmad-output/implementation-artifacts/22-1-equipe-format-besoins.md`
- `apps/web/src/app/pages/event-detail/event-detail.{html,spec.ts,ts}`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.{html,scss,spec.ts,ts}`
- `apps/web/src/app/pages/event-detail/event-infos-tab.{html,spec.ts,ts}`
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.{html,scss,spec.ts,ts}`

### Change Log

- 2026-10-14 : first draft.
- 2026-10-14 : implemented, reviewed and human-smoke validated.

---

### Validation

- [x] AC métier numérotés et sourcés
- [x] Section Material 3 adaptée au périmètre UI
- [x] Tasks référencent AC et frontière de scope
- [x] Liens vers seams code existants
- [x] 168 tests Angular ciblés passent
- [x] `npm run build` passe (avertissements Sass et budgets CSS préexistants)
- [x] Smoke humain organisateur validé sur stack locale offline
