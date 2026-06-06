---
stepsCompleted:
  - test-design
author: Murat (Test Architect)
date: 2026-06-07
inputDocuments:
  - SPEC.md § Agenda participation status cell
  - DOMAIN.md § Participant focus summary
  - _bmad-output/implementation-artifacts/spec-agenda-participation-status-cell.md
  - apps/web/e2e/e1/member-agenda.mobile.spec.ts
  - apps/web/e2e/e1/orga-composition.desktop.spec.ts
risk: P1
status: designed — automation pending
---

# Test Design: Agenda participation status cell

**Date:** 2026-06-07  
**Owner:** Murat (TEA)  
**Stack:** Playwright (`e2e` profile) + Vitest (already covered) + API integration (regression guard)

---

## Risk assessment

| Risk | Score | Mitigation |
|------|-------|------------|
| Member cannot confirm from agenda (FR25 regression) | P1 | E2E-02 |
| Declined state shows dispo (user confusion + wrong edit path) | P1 | E2E-03 |
| Cell click navigates away instead of opening modal | P2 | E2E-01, E2E-02 URL assertion |
| Season agenda vs user agenda divergence | P2 | E2E-04 mirrors E2E-02 on workspace |
| Flaky reload race after modal | P2 | Assert cell class after `networkidle` + API poll |

---

## Test levels

| Level | Role | Status |
|-------|------|--------|
| **Vitest** | Utils + component emit | ✅ Done |
| **API integration** | `participantFocus` after decline | ✅ `CompositionParticipationIntegrationTest` |
| **Playwright E2E** | Member journey on real stack | 🔲 To implement (`bmad-qa-generate-e2e-tests`) |

---

## Fixture strategy

**Option A (preferred):** Extend E1 staging fixture with a **validated composition + pending assignee** event.

- Reuse `e2e/helpers/staging-member-bootstrap.ts` pattern.
- New fixture endpoint or seed step: `POST /v1/e2e/fixtures/agenda-participation-cell/reset` (or piggyback on existing composition seed used by `orga-composition.desktop.spec.ts`).
- Personas:
  - `e2e-member-assigned` — linked participant with `pending` slot on `event-confirm-slug`
  - Same member after decline action in E2E-03 (stateful within spec — order tests or separate reset)

**Option B (local dev):** Document manual seed in test README if fixture deferred.

**Data assertions via API (setup hook):**

```http
GET /v1/me/agenda → content[].participantFocus.inTeam === true
GET /v1/seasons/{id}/events?scope=upcoming → same
```

---

## E2E matrix

| ID | Surface | Steps | Assertions |
|----|---------|-------|------------|
| **APC-E2E-01** | `/agenda` | Open agenda; find event with `unknown` dispo; click `.agenda-participation-status__trigger` | `AvailabilityDialog` visible (`h2` *Disponibilité* or `Choix de disponibilité`); URL still `/agenda` |
| **APC-E2E-02** | `/agenda` | Event with pending in-team cell; click status cell | Dialog *Confirmer ma participation*; tap Confirmer; cell becomes `.participation-event-cell--selected` (or role label visible) |
| **APC-E2E-03** | `/agenda` | Same event, pending; open dialog; Décliner + confirm destructive dialog | Cell `.participation-event-cell--declined`; **not** `.participation-event-cell--available`; `GET /v1/me/agenda` shows `slotParticipationStatus: declined` |
| **APC-E2E-04** | `/saison/:troupe/:season` Agenda tab | Mirror APC-E2E-02 on league workspace | Same modal + cell update |
| **APC-E2E-05** | `/agenda` | Click card body (not cell) with pending cell | Navigates to event detail (`/saison/.../event/...`) |
| **APC-E2E-06** | Historique | Past event with participation focus | No `.agenda-participation-status__trigger` (static cell only) |

---

## Selectors (stable)

| Element | Selector |
|---------|----------|
| Status cell button | `.agenda-participation-status__trigger` |
| Pending cell | `.participation-event-cell--pending` |
| Selected cell | `.participation-event-cell--selected` |
| Declined cell | `.participation-event-cell--declined` |
| Available cell | `.participation-event-cell--available` |
| Participation dialog title | `role=heading` name=/Confirmer ma participation/i |
| Availability dialog | `getByLabel('Choix de disponibilité')` or availability form status buttons |

---

## Suggested file layout

```
apps/web/e2e/
  recette-agenda-participation-cell.spec.ts   # new
  helpers/agenda-participation-cell.ui.ts     # click cell, wait modal, assert state
  fixtures/agenda-participation-cell.constants.ts
```

**Project:** new Playwright project `chromium-agenda-participation` or extend `chromium-e1` if fixture shared.

---

## Run (once implemented)

```bash
cd apps/web
npm run test:e2e -- --project=chromium-e1 e2e/recette-agenda-participation-cell.spec.ts
```

---

## Next workflow step

**[QA] QA Automation Test** — `bmad-qa-generate-e2e-tests`  
Prompt: *« Implement APC-E2E-01 through APC-E2E-06 from test-design-agenda-participation-cell.md »*

Optional prior step: fixture endpoint if E1 seed lacks validated+pending event.

---

## Traceability

| AC (companion spec) | Test IDs |
|---------------------|----------|
| Availability cell → dialog | APC-E2E-01 |
| In-team → confirmation | APC-E2E-02, APC-E2E-04 |
| Declined persists | APC-E2E-03 |
| Card body navigation | APC-E2E-05 |
| Historique read-only | APC-E2E-06 |

**Gate:** PASS when P1 scenarios (01–03) green on staging `e2e` profile.
