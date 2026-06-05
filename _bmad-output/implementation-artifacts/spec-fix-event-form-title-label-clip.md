---
title: 'Fix event form title label clip'
type: 'bugfix'
created: '2026-06-05'
status: 'done'
route: 'one-shot'
---

# Fix event form title label clip

## Intent

**Problem:** In the "Nouveau spectacle" dialog, the floating label "Titre" on the first `mat-form-field` is vertically clipped because `mat-dialog-content` scrolls with `overflow: auto` and the form had no top padding.

**Approach:** Add `padding-top: 0.5rem` on `.form`, matching other HatCast form dialogs (`season-form-dialog`, `create-troupe-dialog`).

## Suggested Review Order

1. [event-form-dialog.scss](../../apps/web/src/app/pages/season-home/event-form-dialog.scss) — confirm `.form` padding matches sibling dialogs
2. [event-form-dialog.html](../../apps/web/src/app/pages/season-home/event-form-dialog.html) — first field is `mat-form-field` with `Titre` label
3. Manual: open "Nouveau spectacle" from season home, focus title field — label fully readable
