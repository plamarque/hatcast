# Story UX — Dialog close patterns (Phase 0+1)

Status: done

## Story

En tant que **membre ou orga utilisant les modales V2**,  
je veux **une fermeture cohérente et explicite des dialogs**,  
afin de **ne pas hésiter entre croix et bouton texte et de rester aligné Material 3**.

## Acceptance Criteria

1. **Given** la spec [`ux-design-dialog-patterns.md`](../planning-artifacts/ux-design-dialog-patterns.md), **when** un dev ou agent implémente une modale standard, **then** la taxonomie (formulaire / consultation / picker) et les libellés dismiss sont documentés et référencés depuis `FRONTEND_UI.md`.
2. **Given** `member-profile-dialog`, **when** le dialog est ouvert, **then** il n’y a **pas** de `mat-icon-button` close en header ; la fermeture passe par le footer (**Fermer** + action secondaire).
3. **Given** `share-announce-dialog`, **when** le dialog est ouvert, **then** pas de croix header ; footer **Fermer** (`mat-button`) seul pour dismiss.
4. **Given** `changelog-dialog`, **when** l’utilisateur ferme, **then** le bouton **Fermer** est un `mat-button` (pas `mat-flat-button`).
5. **Given** `event-organizers-dialog`, **when** l’utilisateur abandonne sans ajouter, **then** le libellé dismiss est **Annuler** (formulaire avec saisie).

**Couverture produit :** UX-DR23 ; FRONTEND_UI.md checklist fermeture dialog.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Dismiss via `mat-button` / actions via `mat-flat-button` ; pas de contrôle custom pour fermer.

**M3-2. Tokens & thème** — Aucun changement couleur ; retrait SCSS position absolute close share-announce.

**M3-3. Mobile & tactile** — Footer actions inchangées (cibles ≥ 48 dp sur boutons dialog).

**M3-4. Navigation membre** — N/A (dialogs contextuels uniquement).

**M3-5. Revue** — Checklist FRONTEND_UI § fermeture dialog ajoutée ; écarts pickers filtres reportés Phase 3.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + docs — spec UX + FRONTEND_UI + 4 dialogs
- [x] Créer `ux-design-dialog-patterns.md`
- [x] Mettre à jour `FRONTEND_UI.md` (lien spec + checklist)
- [x] `member-profile-dialog` — retirer ✕ header
- [x] `share-announce-dialog` — retirer ✕ header
- [x] `changelog-dialog` — `mat-button` pour Fermer
- [x] `event-organizers-dialog` — Annuler
- [x] Tests unitaires ajustés si nécessaire

## Dev Notes

### Product and UX rules

- Pickers filtre gardent la croix header (exception UX-DR22.1 / picker sheet-like).
- Phase 2 = harmonisation globale Annuler/Fermer (hors scope).

### Explicit non-goals

- Pas de composant `dialog-shell` partagé (Phase 4).
- Pas de modification des bottom sheets filtre.

## Dev Agent Record

### Completion Notes List

- Spec UX-DR23 publiée ; quick wins sur 4 dialogs visibles membres/orgas.
- Double affordance supprimée sur profil membre et partage d’annonce.
