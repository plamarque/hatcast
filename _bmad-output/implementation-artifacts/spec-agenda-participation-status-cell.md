---
title: Companion spec — Agenda participation status cell
status: approved
date: 2026-06-07
relatedStories:
  - 12-2-ecran-mon-agenda
  - 3-3-vue-calendrier-agenda-saison
relatedFRs:
  - FR25
  - FR48
relatedUX:
  - UX-DR2
  - UX-DR14
normativeRefs:
  - SPEC.md § Agenda participation status cell
  - DOMAIN.md § Participant focus summary
  - ux-design-hatcast-v2.md § Season calendar
  - ux-design-journey-league-agenda.md Screen 2
implementation:
  - apps/web/src/app/shared/participation/agenda-participation-status.*
  - apps/web/src/app/shared/composition/open-agenda-participation-dialog.ts
  - apps/web/src/app/pages/user-agenda/user-agenda.ts
  - apps/web/src/app/pages/season-home/season-agenda.ts
  - services/api/src/main/kotlin/com/hatcast/api/event/EventParticipantFocusService.kt
---

# Companion spec — Agenda participation status cell

**Purpose:** Traceability artifact for a **brownfield behaviour delta** (2026-06-07): agenda status cells become actionable for confirmation, and **declined** state persists on the card after déclin.

**Normative contract:** Root [SPEC.md](../../SPEC.md) § Agenda participation status cell wins on conflict; this file is implementation detail and test traceability.

---

## Behaviour summary

| Viewer state (`participantFocus`) | Cell UI | Upcoming agenda tap |
|-----------------------------------|---------|---------------------|
| `inTeam: false`, no decline | Dispo / Pas dispo / Non renseigné | Availability dialog |
| `inTeam: true`, `pending` | Role + pending (⏳) | Participation confirmation dialog |
| `inTeam: true`, `confirmed` | Role + selected (violet) | Participation confirmation dialog |
| `slotParticipationStatus: declined` + `compositionRoleKey` | Role + declined (orange) | **None** (read-only) |

**Historique:** all cells read-only.

---

## API contract (unchanged)

`participantFocus` on event list and `GET /v1/me/agenda`:

```json
{
  "availabilityStatus": "available",
  "compositionRoleKey": "player",
  "inTeam": false,
  "slotParticipationStatus": "declined"
}
```

After decline, server prefers `event_composition_declines` over active slots (`EventParticipantFocusService.pickPrimaryDecline`).

---

## UI rules

1. **Display priority:** declined focus → in-team → availability (see `agenda-participation-status.utils.ts`).
2. **Click isolation:** `stopPropagation` on cell button — card navigation unaffected.
3. **Post-dialog refresh:** optimistic `participantFocus` patch + list reload on successful participation API.
4. **Declined guard:** `isDeclinedParticipationFocus()` blocks availability editing on the card.

---

## Out of scope

- Proxy participation from agenda (organizer Équipe tab only).
- Member participation POST while `validatedAt` is null (409).
- E2E implementation (see `_bmad-output/test-artifacts/test-design-agenda-participation-cell.md`).

---

## Verification (unit — existing)

- `agenda-participation-status.utils.spec.ts` — declined when `inTeam: false`
- `season-participant-focus.spec.ts` — `applyParticipationUpdateToAgendaEvent` declined
- `season-agenda.spec.ts` — `participationClick` emission
- API: `CompositionParticipationIntegrationTest` — list `participantFocus` after decline
