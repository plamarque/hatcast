# Story UX — Dialog close patterns (Phase 4)

Status: done

## Story

En tant que **développeur**,  
je veux **des composants garde-fou pour les dismiss de modales**,  
afin de **ne pas réintroduire ✕ header ou libellés incohérents**.

## Acceptance Criteria

1. **Given** un dialog standard, **when** un dismiss est ajouté, **then** utiliser `app-hatcast-dialog-dismiss` avec clé typée.
2. **Given** un picker filtre, **when** l’en-tête est rendu, **then** utiliser `app-hatcast-picker-header` (`surface` sheet \| dialog).
3. **Given** `FRONTEND_UI.md`, **when** Phase 4 livrée, **then** anti-patterns et chemin `dialog-chrome/` documentés.

---

## Tasks / Subtasks

- [x] `dialog-chrome.types.ts` — clés dismiss
- [x] `hatcast-dialog-dismiss` + tests
- [x] `hatcast-picker-header` + tests
- [x] Migration pickers + 4 dialogs référence
- [x] FRONTEND_UI + spec UX
