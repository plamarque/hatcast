---
feature_branch: codex/story-22-2-edition-libre-slots
baseline_commit: 4765ae1545d612f50236f39dff704dd09f96c5ee
---

# Story 22.2 : Équipe — édition libre de la structure des slots

Status: done — human smoke validated 2026-10-14; closure approved without generated tracker entry

## Story

En tant qu'**organisateur·ice**,
je veux **ajouter, affecter, désaffecter et supprimer explicitement des slots**,
afin d'**adapter librement la composition aux besoins réels du spectacle**.

## Acceptance Criteria

1. **Given** un organisateur ayant `canManageComposition` et une composition éditable, **when** il active **« Ajouter »**, **then** un unique slot provisoire, vide et sans rôle apparaît immédiatement comme une nouvelle ligne en bas de la liste ; son icône de rôle ouvre le choix du rôle et sa poubelle annule cet ajout local. Aucun `roleSlots` persistant ne change à cette étape. [Source: Epic 22.2 AC1 ; amendement PO 2026-10-14]
2. **Given** ce slot provisoire, **when** l'organisateur sélectionne un rôle connu, **then** le besoin persistant correspondant augmente d'une unité et le slot rejoint la fin de son groupe ; il peut ensuite rester libre ou recevoir une affectation. [Source: Epic 22.2 AC2 ; DOMAIN.md « Format »]
3. **Given** une personne affectée à un slot requis, **when** l'organisateur active la croix dans sa zone d'affectation, **then** seule cette personne est désassignée ; le slot et le besoin persistent. La croix porte le tooltip exact **« Libérer la place »**. [Source: Epic 22.2 AC3 ; amendement PO 2026-10-14]
4. **Given** l'action structurelle de poubelle d'un slot, **when** l'organisateur l'utilise puis confirme explicitement, **then** le slot est supprimé et son besoin diminue ; si le slot est affecté, son affectation est retirée dans cette même mutation. La confirmation explique que le spectacle demandera une personne de moins pour ce rôle, même si le format le prévoit ; annuler ne change rien. [Source: Epic 22.2 AC4 ; amendement PO 2026-10-14]
5. **Given** plusieurs slots pour le même rôle, **when** la composition est rendue après ajout ou suppression, **then** elle reste groupée par rôle et l'ordre interne conserve l'ordre relatif de création ; aucun glisser-déposer ou autre réordonnancement manuel n'est proposé. [Source: Epic 22.2 AC5]
6. **Given** un utilisateur sans `canManageComposition`, **when** il consulte Équipe, **then** aucune action d'ajout, de choix de rôle, de désassignation ou de suppression structurelle n'est exposée. [Source: Epic 22.1 AC4 ; Epic 22.2]
7. **Given** une mutation structurelle de cette story, **when** elle réussit, **then** elle n'envoie aucune notification de retrait ; la décision CN-3 reste exclusivement dans 22.4. [Source: Epic 22.4 AC2 ; scope approuvé]

**Couverture produit :** FR14, FR21, FR35, UX-DR11 ; `DOMAIN.md` « Format » ; `SPEC.md` « Flexible event composition » ; [Epic 22](../planning-artifacts/epics.md#epic-22--composition-flexible-pilotee-par-slots).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** les actions de structure, **when** elles sont rendues, **then** l'ajout utilise un bouton Material, le choix de rôle un `mat-menu` déclenché par une icône, les actions icône des `mat-icon-button` avec `aria-label` français, et la confirmation destructive le `ConfirmDialog` (`MatDialog`) existant ; aucun contrôle HTML équivalent personnalisé. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** les styles de la ligne provisoire, de la poubelle ou du feedback sont ajoutés, **when** couleurs et fonds sont appliqués, **then** ils utilisent uniquement `var(--mat-sys-*)` et, si nécessaire, `color-mix` ; aucun hex/rgb spécifique à la feature. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** un viewport de 480 px ou moins, **when** les contrôles de slot sont affichés, **then** ils restent lisibles et non chevauchants ; ajout, croix et poubelle ont des cibles de préférence `48×48 dp` (minimum documenté `40×40` pour une icône dense si nécessaire) et des libellés accessibles en français. [Source: FRONTEND_UI.md ; NFR-A1]

**M3-4. Confirmation destructive** — **Given** une poubelle sur un slot vide ou affecté, **when** la confirmation s'ouvre, **then** elle suit le pattern dialog standard : une seule affordance d'annulation textuelle et une action primaire explicite ; elle identifie le rôle, la réduction du besoin et, le cas échéant, la personne concernée. [Source: ux-design-dialog-patterns.md ; FRONTEND_UI.md]

**M3-5. Revue** — **Given** l'implémentation terminée, **when** elle est relue, **then** la checklist M3 de `FRONTEND_UI.md` est parcourue et tout écart volontaire est consigné dans cette story ou dans `ISSUES.md`. [Source: AGENTS.md]

---

## Plan d'implémentation proposé

1. **Modèle d'interaction local (AC1–AC2, M3-1–M3-3).** Dans `EventEquipeTab`, conserver le slot sans rôle dans un signal local, une seule ligne à la fois, directement dans la grille sous les slots existants. `Ajouter` révèle cette ligne ; toucher son icône de rôle ouvre le choix. La sélection appelle le PATCH d'événement existant avec un `roleSlots` normalisé dont ce rôle gagne une unité ; aucune écriture n'a lieu avant ce choix. À la réponse, propager l'événement mis à jour puis recharger la projection de composition comme le fait 22.1.
2. **Actions distinctes sur les lignes (AC3–AC6, M3-1–M3-3).** Conserver l'affectation via `CompositionApiService.assignCompositionSlot`; renommer et rendre accessible la croix existante comme désassignation seulement. Ajouter une poubelle structurelle séparée, visible seulement aux organisateurs tant que la composition est éditable. Elle n'introduit ni drag-and-drop ni modification de la tabulation de participation existante.
3. **Suppression structurelle atomique (AC4–AC5, AC7).** Ajouter une commande API dédiée de suppression ciblée par `roleKey` et `slotIndex` (retourne l'événement mis à jour). Dans une transaction : vérifier l'autorisation et que la composition n'est pas verrouillée, supprimer l'affectation éventuelle, diminuer le compteur `roleSlots`, puis compacter les indices strictement postérieurs du même rôle en préservant leur ordre relatif. Cette commande remplace le couplage non atomique « désassigner puis PATCH ». Elle enregistre un audit before/after adéquat mais n'émet aucune notification CN-3.
4. **Confirmation et rafraîchissement (AC4, M3-4).** Toute poubelle ouvre `ConfirmDialog`; seul son résultat positif appelle la commande atomique. Le message explique la réduction du besoin et identifie aussi la personne quand le slot est affecté. Après succès, rafraîchir l'événement et la composition sans laisser une réponse ancienne remplacer l'état courant.
5. **Validation.** Ajouter des tests Angular pour le provisoire sans écriture, le choix de rôle, les deux actions distinctes, l'annulation/confirmation, droits et ordre de rendu. Ajouter des tests Spring d'intégration pour le retrait vide/affecté, l'autorisation, le verrouillage, la compaction stable, l'atomicité et l'absence de dispatch de notification. Exécuter les tests ciblés, le build web et la recette manuelle full stack `./scripts/start-dev.sh --offline` avant de réclamer une validation humaine.

## Tasks / Subtasks

- [x] **AC1–AC2, M3-1–M3-3 — Frontend :** ajouter la ligne provisoire locale et l'action `Ajouter` dans `event-equipe-tab.*`; réutiliser les rôles connus et la mutation `EventApiService.updateEvent` après choix explicite.
- [x] **AC3, M3-1–M3-3 — Frontend :** scinder visuellement et sémantiquement la croix de désassignation et la poubelle de structure; appliquer le tooltip requis.
- [x] **AC4–AC5, AC7 — API :** créer l'opération transactionnelle de suppression structurelle ciblée, avec contrôle `canManageComposition`, garde de verrouillage, compaction stable, réponse événement et audit sans notification.
- [x] **AC4, M3-4 — Frontend :** raccorder la confirmation `ConfirmDialog` à toute suppression structurelle, expliciter la réduction du besoin, puis synchroniser événement + composition après succès.
- [x] **AC1–AC7, M3-1–M3-5 — Tests :** compléter `event-equipe-tab.spec.ts`, les tests API d'événements/composition et les vérifications ciblées; achever par build et smoke full stack offline.

## Dev Notes

### Product and UX rules

- `roleSlots` demeure le contrat persistant des besoins. Un slot provisoire est exclusivement local jusqu'au choix de rôle.
- Le slot ajouté rejoint la fin du groupe choisi. La suppression compacte les indices sans modifier l'ordre relatif des slots survivants ; il n'existe aucun réordonnancement manuel.
- Désassigner une personne conserve le slot. Supprimer un slot le retire structurellement ; toute suppression est explicitement confirmée et atomique, y compris sur un slot vide.
- La confirmation de suppression n'est pas une décision de notification : aucun `REMOVED_FROM_COMPOSITION` ou envoi CN-3 dans cette story.

### Existing implementation seams

| Concern | Reuse / change |
|---|---|
| Lignes Équipe | `apps/web/src/app/pages/event-detail/event-equipe-tab.{ts,html,scss}` — `slotRows()`, `clearSlot()` et la zone sous la grille. |
| Affectation existante | `CompositionApiService.assignCompositionSlot()` + `CompositionSlotAssignmentService`; conserver pour la croix seule. |
| Besoins persistants | `EventApiService.updateEvent()` + `EventService.updateEvent()` pour l'ajout après choix de rôle. |
| Suppression atomique | Nouveau chemin ciblé côté contrôleur/service événement-composition, plutôt que deux mutations client. |
| Confirmation | `ConfirmDialog` de `pages/seasons-list`; respecter le pattern de fermeture M3. |
| Rafraîchissement parent | `eventUpdated` dans `event-detail.*`, déjà utilisé par 22.1 pour réaligner événement et composition. |

### Explicit non-goals

- **22.3 :** slots affectés Hors modèle après application de template, ainsi que scroll/focus mobile après sélection du rôle.
- **22.4 / CN-3 :** retrait du prototype CN-2, décision de notification sur suppression affectée, ou dispatch de notification.
- Modification du format, application de template, réconciliation autonome, glisser-déposer, ordre manuel, migration de données, changement de permissions, commit, merge, push ou déploiement.

### Dependencies

| Story | Status | Relationship |
|---|---|---|
| CN-1 | delivered locally on `v2` | Préservation/redaction existante à conserver sans l'étendre. |
| 22.1 | done | Fournit la surface Équipe et le rafraîchissement format/besoins. |
| 22.3 | backlog | Porte Hors modèle et le scroll/focus explicitement exclus ici. |
| 22.4 / CN-3 | backlog / undecided | Porte l'audit CN-2 et toute décision de notification. |

## Dev Agent Record

### Completion Notes List

- 2026-10-14 : story et plan préparés depuis le contrat approuvé ; aucune modification de code de production ni appel mutant n'a été effectué.
- 2026-10-14 : implémentation réalisée dans `4f59a1c7` : ajout local de rôle, désassignation distincte, suppression atomique auditée sans notification, API et tests ciblés.
- 2026-10-14 : retour recette mobile : les actions structurelles possèdent une colonne dédiée ; toute suppression requiert désormais une confirmation qui explicite la réduction du besoin du spectacle. `Ajouter` est affiné en ligne provisoire dans la grille, avec choix du rôle depuis son icône.
- 2026-10-14 : validation humaine mobile reçue ; espace entre emoji et rôle, et poubelle de la place provisoire confirmés. Clôture locale autorisée sans entrée 22.2 dans le tracker généré.
- Revue M3 : composants Material et `ConfirmDialog` réutilisés ; actions icône `40×40` documentées par M3-3, séparées du pourcentage ; tokens système employés. Validation humaine mobile en cours.

### File List

- `_bmad-output/implementation-artifacts/22-2-equipe-edition-libre-slots.md`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.{ts,html,scss,spec.ts}`
- `apps/web/src/styles/_hatcast-equipe-composition.scss`
- `apps/web/src/app/core/composition/composition-api.service.ts`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotStructureService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt`

### Change Log

- 2026-10-14 : draft for product approval.
- 2026-10-14 : implementation and product-validation refinements.

---

### Validation before implementation

- [x] AC métier numérotés, sourcés et bornés à 22.2
- [x] Section Material 3 adaptée au périmètre UI
- [x] Plan séparant mutation de besoin, désassignation et suppression structurelle
- [x] Non-goals 22.3 / 22.4-CN-3 explicites
- [ ] Approbation produit avant toute modification de code
