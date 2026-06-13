# Composition status messages (Équipe tab)

**Source of truth:** [src/components/SelectionModal.vue](src/components/SelectionModal.vue) — `compositionStatus` computed. This document is the canonical reference for conditions and message copy; it must stay aligned with the implementation.

---

## Definitions (logical conditions)

| Term | Definition |
|------|------------|
| **hasSelection** | At least one player is in the composition (currentSelection has at least one role filled). |
| **hasEmptySlots** | At least one slot in the composition has no player assigned. |
| **hasDeclinedPlayersInSlots** | At least one slot is filled by a player whose status in the cast is `declined`. |
| **allFilledSlotsConfirmedLocally** | Composition is validated by the organizer, there are no empty slots, and every filled slot has player status `confirmed` (derived from cast `playerStatuses`). |
| **isSelectionConfirmedByOrganizer** | The composition has been locked/validated by the organizer (cast flag). |

---

## Status evaluation order and conditions

The first matching row in the table below determines the displayed status. Order matters.

| Order | Type (internal) | Label (badge) | Condition |
|-------|-----------------|---------------|-----------|
| 1 | none | À composer | No player in composition (`!hasSelection`) |
| 2 | complete | Équipe complète | Validated, no empty slots, no declined in slots, and `allFilledSlotsConfirmedLocally` |
| 3 | slots_to_complete | À compléter | Validated and at least one empty slot |
| 4 | has_declined | À vérifier | Validated and at least one slot has a declined player (no empty slots, per evaluation order) |
| 5 | pending_confirmation | Confirmations en cours | Validated, no empty slots, no declined in slots, not all confirmed |
| 6 | draft | En préparation | Has selection but not validated (manager vs non-manager message) |

**Priority rule:** À compléter is evaluated before À vérifier. If there is any empty slot, the status is À compléter, not À vérifier.

---

## Exact message strings (plain text, for badge tooltip and assertions)

**V2 (Angular — `composition-equipe-status.ts`):** guidelines cite toolbar labels via `EQUIPE_ACTION_LABELS` (`Valider`, `Tirer au sort`, `Annoncer la compo`, `Compléter`, `Déverrouiller`, `Partager`) in French quotes — no emoji prefixes. Legacy V1 (`SelectionModal.vue`) may still use the older emoji copy below until deprecated.

### À composer (type: none)

- **Label:** À composer
- **Hint (V2):** À composer : Cliquez dans un emplacement pour choisir un participant, ou utilisez « Tirer au sort » pour une proposition automatique.
- **Hint (V1 legacy):** 🫵 À composer : Cliquez dans les emplacements pour sélectionner un participant ou ✨ Tirez au sort pour faire une sélection automatique.

### Équipe complète (type: complete)

- **Label:** Équipe complète
- **Hint (V2):** Équipe complète : Utilisez « Annoncer la compo » pour la diffusion, ou « Déverrouiller » pour modifier la composition.
- **Hint (V1 legacy):** 🎉 Équipe complète : 📢 Annoncez la compo définitive ou 🔓 Déverrouillez pour faire des changements.

### À compléter (type: slots_to_complete)

- **Label:** À compléter
- **Hint (V2):** À compléter : La composition est validée mais certains emplacements sont vides. Cliquez dans un emplacement vide ou utilisez « Compléter » pour un tirage sur les créneaux restants.
- **Hint (V1 legacy):** ⚠️ À compléter : La composition a été validée mais certains emplacements sont vides. Finalisez la compo en cliquant dans un emplacement vide ou sur le bouton 🔧 Compléter pour un choix aléatoire.

### À vérifier (type: has_declined)

- **Label:** À vérifier
- **Hint (V2):** À vérifier : Des participants ont décliné. Vérifiez les disponibilités et ajustez la composition si besoin.
- **Hint (V1 legacy):** ⚠️ À vérifier : La composition de l'équipe contient des personnes désistées, vérifiez que tout le monde est toujours disponible.

### Confirmations en cours (type: pending_confirmation)

- **Label:** Confirmations en cours
- **Hint (V2):** Confirmations en cours : Utilisez « Annoncer la compo » pour informer les participants et recueillir leurs confirmations. La composition est visible par tous. « Déverrouiller » permet de revenir en édition.
- **Hint (V1 legacy):** ⏳ Confirmations : 📢 Annoncez la compo, puis récoltez les confirmations des participants. ⚠️ La compo actuelle est visible de tous. 🔒 Déverrouillez pour la masquer.

### En préparation (type: draft)

- **Label:** En préparation
- **Hint (manager, V2 — validate visible in toolbar):** En préparation : Seuls les organisateur·ices et administrateur·ices voient cette composition. Partagez-la via « Partager » si besoin, puis « Valider » pour la rendre visible à tous.
- **Hint (manager, V2 — validate in toolbar lead, `suppressValidateCtaInGuideline`):** En préparation : Seuls les organisateur·ices et administrateur·ices voient cette composition. Partagez-la aux responsables si vous le désirez.
- **Hint (manager, V1 legacy):** 🧠 En préparation : ⚠️ Seuls les administrateurs peuvent voir la compo actuelle. Partagez la aux responsables si vous le désirez et lorsque vous serez prêt cliquez sur ✅ Valider pour la rendre visible à tout le monde.
- **Hint (non-manager):** Une composition est en cours de préparation par les sélectionneurs.

---

## Display

- The **badge** shows the composition status label at the **top of the Équipe tab** on event detail (`event-equipe-tab__status`), **not** in the sticky header and **not** on Infos/Dispos tabs. For organizers, a **`help_outline` icon button** toggles a **reveal panel** with the full manager guideline (`managerGuideline` from `resolveCompositionEquipeStatus`) — not a `MatTooltip`, not a paragraph under the slot grid. The panel uses `data-testid="composition-status-hint"` for the guideline text. Members see the badge only (no help trigger). For **Équipe complète**, the open panel may use a success surface variant. Toolbar action hints on the Équipe tab (validate lead, draw hint, fill gaps) remain separate from the status reveal panel.
