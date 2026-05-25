# Story 17.14: Onglet Infos — type de spectacle et rôles (modales)

Status: backlog

**Source:** [ux-backlog-event-form-dialog.md](../planning-artifacts/ux-backlog-event-form-dialog.md) #3 · SCP 2026-05-25

## Story

As an **organizer**,  
I want **event type and role requirements on the Infos tab** with dedicated modals to customize them,  
so that **the create/edit dialog stays focused on scheduling**.

## Acceptance Criteria

1. **Given** event detail Infos tab, **when** loaded, **then** type and role summary are visible (read).
2. **Given** manage rights, **when** user chooses customize, **then** a **dedicated dialog** edits template type and role counts (behavior parity with current form).
3. **Given** `EventFormDialog`, **when** create/edit, **then** template type, template-change confirm, and role grid are **removed**.
4. **Given** save from Infos modals, **when** success, **then** detail + équipe tab reflect new slots.

## Depends

- Stories **3.4**, **6.2** (existing type/role logic).
