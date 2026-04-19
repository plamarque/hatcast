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

### À composer (type: none)

- **Label:** À composer
- **Hint (full):** 🫵 À composer : Cliquez dans les emplacements pour sélectionner un participant ou ✨ Tirez au sort pour faire une sélection automatique.

### Équipe complète (type: complete)

- **Label:** Équipe complète
- **Hint (full):** 🎉 Équipe complète : 📢 Annoncez la compo définitive ou 🔓 Déverrouillez pour faire des changements.

### À compléter (type: slots_to_complete)

- **Label:** À compléter
- **Hint (full):** ⚠️ À compléter :  La composition a été validée mais certains emplacements sont vides. Finalisez la compo en cliquant dans un emplacement vide ou sur le bouton 🔧 Compléter pour un choix aléatoire.

### À vérifier (type: has_declined)

- **Label:** À vérifier
- **Hint (full):** ⚠️ À vérifier : La composition de l'équipe contient des personnes désistées, vérifiez que tout le monde est toujours disponible.

### Confirmations en cours (type: pending_confirmation)

- **Label:** Confirmations en cours
- **Hint (full):** ⏳ Confirmations : 📢 Annoncez la compo, puis récoltez les confirmations des participants. ⚠️ La compo actuelle est visible de tous. 🔒 Déverrouillez pour la masquer.

### En préparation (type: draft)

- **Label:** En préparation
- **Hint (manager):** 🧠 En préparation : ⚠️ Seuls les administrateurs peuvent voir la compo actuelle. Partagez la aux responsables si vous le désirez et lorsque vous serez prêt cliquez sur ✅ Valider pour la rendre visible à tout le monde.
- **Hint (non-manager):** Une composition est en cours de préparation par les sélectionneurs.

---

## Display

- The **badge** shows the label. The **hint** is displayed in a paragraph below the slots (grey text) for all statuses except Équipe complète; for Équipe complète the same hint is shown in a green banner. The hint may include HTML (e.g. `<strong>…</strong>` for the part before the colon); the plain strings above are the tooltip/canonical text.
