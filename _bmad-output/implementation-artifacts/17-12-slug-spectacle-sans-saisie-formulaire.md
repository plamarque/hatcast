# Story 17.12: Slug spectacle — sans saisie dans le formulaire

Status: backlog

**Source:** [ux-backlog-event-form-dialog.md](../planning-artifacts/ux-backlog-event-form-dialog.md) #1 · SCP 2026-05-25

## Story

As an **organizer**,  
I want **shareable event URLs generated automatically** without editing a slug field,  
so that **create/edit stays simple** and links stay stable.

## Acceptance Criteria

1. **Given** `EventFormDialog` (create or edit), **when** opened, **then** there is **no** editable « Identifiant URL » field.
2. **Given** create with title, **when** saved, **then** API allocates unique slug (existing 17.6 rules).
3. **Given** edit, **when** only title changes, **then** slug unchanged (API 17.6).
4. **Given** docs/epics 17.6 AC, **when** updated, **then** UI no longer claims « slug éditable » (product amendment noted in SCP).

## Non-goals

- Server-side auto-rewrite slug on title change.
