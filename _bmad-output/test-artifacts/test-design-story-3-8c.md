---
stepsCompleted:
  - automate-guardrail-expansion
lastSaved: 2026-06-06
inputDocuments:
  - _bmad-output/implementation-artifacts/3-8c-participant-add-typeahead.md
---

# Test Design: Story 3.8c — Participant add typeahead (Lot A)

**Date:** 2026-06-06  
**Status:** Guardrails automated  
**Stack:** Frontend (Vitest component + unit)

---

## Scope

Client-side typeahead on **Nom affiché** in season and event-only participant add dialogs. No API contract changes.

---

## Automated scenarios

| ID | Priority | Level | Description | File |
|----|----------|-------|-------------|------|
| 3.8c-UNT-001 | P0 | Unit | Empty query → no suggestions | `participant-member-suggestions.spec.ts` |
| 3.8c-UNT-002 | P0 | Unit | Filter by name or email | same |
| 3.8c-UNT-003 | P0 | Unit | Exclude roster userIds | same |
| 3.8c-UNT-004 | P0 | Unit | Exclude normalized display names | same |
| 3.8c-UNT-005 | P0 | Unit | Ignore INACTIVE memberships | same |
| 3.8c-UNT-006 | P1 | Unit | Cap at 8 suggestions | same |
| 3.8c-CMP-S01 | P0 | Component | Load troupe members on init | `add-participant-dialog.spec.ts` |
| 3.8c-CMP-S02 | P0 | Component | Exclude ACTIVE season participants | same |
| 3.8c-CMP-S03 | P0 | Component | Filter by query (+ gender on row) | same |
| 3.8c-CMP-S04 | P0 | Component | Selection prefills email | same |
| 3.8c-CMP-S05 | P1 | Component | Clear email on member without email | same |
| 3.8c-CMP-S06 | P1 | Component | Free typing clears selection | same |
| 3.8c-CMP-S07 | P0 | Component | Free-text submit (name-only) | same |
| 3.8c-CMP-S08 | P0 | Component | Selected member submit with email | same |
| 3.8c-CMP-S09 | P1 | Component | `mat-autocomplete` on name field | same |
| 3.8c-CMP-S10 | P1 | Component | Load season participants for exclusion | same |
| 3.8c-CMP-S11 | P1 | Component | Empty name validation | same |
| 3.8c-CMP-S12 | P1 | Component | API 409 → French message | same |
| 3.8c-CMP-S13 | P1 | Component | API 403 → French message | same |
| 3.8c-CMP-S14 | P1 | Component | Avatar in overlay options | same |
| 3.8c-CMP-S15 | P2 | Component | Notifications hint copy (AC4) | same |
| 3.8c-CMP-E01 | P0 | Component | Load members + exclude roster userIds | `add-event-participant-dialog.spec.ts` |
| 3.8c-CMP-E02 | P0 | Component | Exclude roster by display name without userId | same |
| 3.8c-CMP-E03 | P0 | Component | Filter + select + submit with email | same |
| 3.8c-CMP-E04 | P0 | Component | Free-text submit | same |
| 3.8c-CMP-E05 | P1 | Component | Event-only intro hint preserved | same |
| 3.8c-CMP-E06 | P1 | Component | Load event roster for exclusion | same |
| 3.8c-CMP-E07 | P1 | Component | Autocomplete + avatar overlay | same |
| 3.8c-CMP-E08 | P1 | Component | Empty name / 409 / 403 errors | same |
| 3.8c-CMP-E09 | P2 | Component | Notifications hint copy | same |
| 3.8c-CMP-P01 | P1 | Component | Season page passes `troupeId` in dialog data | `admin-participants.spec.ts` (pre-existing) |
| 3.8c-CMP-P02 | P1 | Component | Event page passes `troupeId` in dialog data | `admin-event-participants.spec.ts` (pre-existing) |

---

## Manual / waived

| Item | Reason |
|------|--------|
| Mobile 480px tactile review | M3-3 — story Dev Notes / FRONTEND_UI checklist |
| Dialog overflow / label clip | Regression guard via shipped UX doc `570ce4b0` |
| Playwright E2E add flow | P3 — unit guardrails deemed sufficient for Lot A |

---

## Verdict

**Automated guardrails: PASS** — 33 Vitest cases cover P0/P1 paths for story 3.8c. Residual risk is visual/layout-only (M3 manual check).
