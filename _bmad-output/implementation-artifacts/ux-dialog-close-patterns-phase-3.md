# Story UX — Dialog close patterns (Phase 3)

Status: done

## Story

En tant que **membre filtrant l’agenda**,  
je veux **des pickers cohérents mobile/desktop**,  
afin de **reconnaître abandon (Annuler / ✕) et validation (Appliquer)** selon la surface.

## Acceptance Criteria

1. **Given** un picker en **bottom sheet** (mobile), **when** il s’ouvre, **then** poignée drag visible + ✕ header + footer sans Annuler.
2. **Given** un picker en **dialog** (desktop), **when** il s’ouvre, **then** pas de ✕ header + **Annuler** texte dans le footer.
3. **Given** `filter-single-picker` desktop, **when** affiché, **then** footer **Annuler** seul (apply au clic ligne).
4. **Given** la spec UX-DR23 § Phase 3, **when** livré, **then** tableau mobile/desktop documenté.

---

## Tasks / Subtasks

- [x] Poignée drag sheet (`filter-picker-shell__drag-handle`)
- [x] ✕ conditionnel `isBottomSheet` sur 4 pickers + filter-panel
- [x] Annuler footer desktop sur pickers multi-sélection
- [x] Single-picker desktop footer Annuler
- [x] Footers pickers dans `_hatcast-dialog-actions.scss`
