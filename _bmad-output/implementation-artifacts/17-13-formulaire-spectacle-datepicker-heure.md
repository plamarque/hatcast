# Story 17.13: Formulaire spectacle — date et heure Material

Status: backlog

**Source:** [ux-backlog-event-form-dialog.md](../planning-artifacts/ux-backlog-event-form-dialog.md) #2 · SCP 2026-05-25

## Story

As an **organizer**,  
I want **a calendar and time pickers** when scheduling a spectacle,  
so that **date/time entry is clearer** than `datetime-local`.

## Acceptance Criteria

1. **Given** `EventFormDialog`, **when** setting start time, **then** `MatDatepicker` (or project-standard date control) + hour/minute inputs replace `type="datetime-local"`.
2. **Given** save, **when** submitted, **then** same instant semantics as today (`startsAt` ISO).
3. **Given** tests, **when** CI runs, **then** form specs updated and green.

## References

- Pattern: [`season-form-dialog.ts`](../../apps/web/src/app/pages/seasons-list/season-form-dialog.ts)
