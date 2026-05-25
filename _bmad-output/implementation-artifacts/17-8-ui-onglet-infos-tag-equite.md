# Story 17.8: UI onglet Infos — tag d’équité optionnel

Status: backlog

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](../planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md) (2026-05-25 — tag déplacé hors `EventFormDialog`)

## Story

As a **troupe admin or organizer** with rights to manage the spectacle,  
I want to **set or clear an optional equity tag on the Infos tab** of the event detail,  
so that **draws and stats partition correctly** without overloading the create/edit dialog.

## Acceptance Criteria

1. **Given** event detail with **Infos** tab and `canManageEvents` (or equivalent manage right for the event), **when** the tab loads, **then** a **Tag (optionnel)** control is shown (not in `EventFormDialog`).
2. **Given** troupe glossary, **when** the user types in the tag field, **then** autocomplete suggests entries from `GET /v1/troupes/{troupeId}/equity-tags` (API **17.7**).
3. **Given** an unknown tag string, **when** saved per product policy, **then** glossary may be extended (same rules as API 17.7).
4. **Given** clear action (`×`) or empty value, **when** saved, **then** `equity_tag` is null (principal equity); UI does **not** show a « principal » option.
5. **Given** inline help, **when** visible, **then** it explains that tagged participations count in a separate pool (chances/draw/stats) — Screen 6b journey.
6. **Given** save, **when** PATCH succeeds, **then** event detail and header refresh; errors use Material feedback (snackbar / field error).
7. **Given** season agenda list, **when** event has a tag, **then** optional discrete badge on the row (MVP).
8. **Given** create/edit spectacle dialog, **when** opened, **then** it does **not** contain the equity tag field.

## Non-goals

- Slug UI, type/roles, organizers, participants form cleanup → **17.12–17.15**
- Draw/stats partitioning → **17.9**, **17.10**
- Blocking `templateType=deplacement` in API (UI hint in 17.8 may document preference for tag `deplacements`)

## Tasks / Subtasks

- [ ] Extend `event-infos-tab` (and parent `event-detail` for PATCH + troupeId) with tag field, autocomplete, clear, help.
- [ ] Wire `EventApiService` PATCH `equityTag` (nullable).
- [ ] Load glossary via troupe id from season/event context.
- [ ] Optional badge on `season-agenda` / event cards when `equityTag` set.
- [ ] Tests: `event-infos-tab` or `event-detail.spec.ts`, API mock PATCH.
- [ ] Update `event-form-dialog` specs — no tag field.

## Dev Notes

- **Depends:** **17.7** (done) — `equity_tag` on event, troupe glossary endpoints.
- **UX:** [`ux-design-journey-league-agenda.md`](../planning-artifacts/ux-design-journey-league-agenda.md) Screen 6b (Infos tab, not event form).
- **Permissions:** Same as Modifier spectacle / manage event.
- **Create flow:** New events get tag only **after** creation, from Infos tab (or default null until set).

## References

- [17-7-api-tag-equite-glossaire-troupe.md](17-7-api-tag-equite-glossaire-troupe.md)
- [ux-backlog-event-form-dialog.md](../planning-artifacts/ux-backlog-event-form-dialog.md)
