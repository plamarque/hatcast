# Story UX — Dialog close patterns (Phase 2)

Status: done

## Story

En tant que **utilisateur des modales V2**,  
je veux **des libellés et styles de fermeture homogènes**,  
afin de **reconnaître immédiatement abandon vs fin de consultation**.

## Acceptance Criteria

1. **Given** un dialog **formulaire** ou **confirmation**, **when** l’utilisateur abandonne, **then** le libellé dismiss est **Annuler** en `mat-button`.
2. **Given** un dialog **consultation** ou **aide**, **when** l’utilisateur termine, **then** le libellé dismiss est **Fermer** en `mat-button` (pas `mat-flat-button`).
3. **Given** l’audit Phase 2 dans [`ux-design-dialog-patterns.md`](../planning-artifacts/ux-design-dialog-patterns.md), **when** la story est livrée, **then** les 6 écarts `mat-flat-button` / `mat-stroked-button` sur dismiss sont corrigés et l’inventaire conforme est documenté.

**Couverture produit :** UX-DR23 Phase 2.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1** — Dismiss `mat-button` partout (sauf actions primaires nommées).

**M3-2** — N/A tokens.

**M3-3** — N/A layout.

**M3-4** — N/A navigation.

**M3-5** — Inventaire + checklist FRONTEND_UI référencée.

---

## Tasks / Subtasks

- [x] Audit `mat-dialog-actions` + footers sheet
- [x] Corriger 6 dismiss non conformes (style)
- [x] Documenter inventaire dans spec UX
- [x] Test `member-profile-dialog` (Fermer non flat)

## Dev Agent Record

### Completion Notes List

- Libellés Annuler/Fermer déjà corrects sur la majorité des dialogs post Phase 0+1 ; Phase 2 = normalisation `mat-button` sur dismiss restants.
