# Story 17.15: Onglet Infos — organisateur·ices ; retrait participants du formulaire

Status: backlog

**Source:** [ux-backlog-event-form-dialog.md](../planning-artifacts/ux-backlog-event-form-dialog.md) #4–#5 · SCP 2026-05-25

## Story

As an **organizer**,  
I want **event organizers managed from Infos** and **event participants only via the admin menu**,  
so that **the edit dialog is not duplicated** across surfaces.

## Acceptance Criteria

1. **Given** Infos tab and rights, **when** viewing organizers, **then** summary + CTA opens **dedicated modal** (parity with current organizer section in form).
2. **Given** `EventFormDialog` edit mode, **when** opened, **then** **no** « Organisateur·ices du spectacle » section.
3. **Given** `EventFormDialog` edit mode, **when** opened, **then** **no** « Participants du spectacle » section.
4. **Given** scope admin menu, **when** user manages event participants, **then** existing route/action unchanged (**3.8**).
5. **Given** story **3.8** trace, **when** docs updated, **then** AC11 superseded by this story for form placement.

## References

- `event-detail` — `openEventOrganizersAdmin`, participants menu items.
