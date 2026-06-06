---
stepsCompleted:
  - trace-phase-1
  - automate-e2e-full
lastSaved: 2026-06-06
inputDocuments:
  - _bmad-output/implementation-artifacts/3-25-externe-guest-scoped-access.md
story: 3-25-externe-guest-scoped-access
---

# Test Design: Story 3.25 — Guest scoped access (EXTERNE / ADR-0021)

**Date:** 2026-06-06  
**Status:** Automated — gate **PASS** (API + E2E + Vitest toolbar)  
**Stack:** Spring integration + Playwright (`e2e` profile) + Angular Vitest

---

## Scope

Linked **EXTERNE** guests with invitation scope **SEASON** or **EVENT** : partial workspace, filtered agenda, composition read, multi-season navigation, non-regression membres.

**Out of scope:** Epic 7 self-service invite, notification deep-link E2E (covered API), staging T2 (profil `e2e` only).

---

## Test levels

| Level | Role | Files |
|-------|------|-------|
| **API integration** | Business rules, guards, aggregation | `GuestInvitationAccessIntegrationTest`, `UserAgendaIntegrationTest` |
| **Playwright E2E** | Navigation, UI filters, empty states | `recette-3-25.spec.ts` + fixture `POST /v1/e2e/fixtures/story-3-25/reset` |
| **Vitest** | Toolbar tabs per `guestSeasonWorkspaceMode` | `season-view-toolbar.spec.ts` |
| **Manual** | M3 mobile 480px, visual polish | Patrice recette 2026-06-06 ✅ |

---

## E2E matrix (`recette-3-25.spec.ts`)

| ID | Persona | Assertion |
|----|---------|-----------|
| 3.25-E2E-01 | CarnetOnly | Empty participation agenda |
| 3.25-E2E-02 | Laetitia | Personal agenda = published season events |
| 3.25-E2E-03 | Laetitia | Workspace Agenda tab only |
| 3.25-E2E-04 | Laetitia | Season agenda filtered |
| 3.25-E2E-05 | Ruben | Personal agenda = 1 future invited |
| 3.25-E2E-06 | Ruben | Workspace Agenda + Historique, no Stats |
| 3.25-E2E-07 | Ruben | History = invited past only |
| 3.25-E2E-08 | Ruben | Breadcrumb season → workspace |
| 3.25-E2E-09 | Ruben | Hub season card → workspace |
| 3.25-E2E-10 | Ruben | Accueil « Ma saison » shortcut |
| 3.25-E2E-11 | Ruben | Dispos write on invited event |
| 3.25-E2E-12 | Ruben | Équipe empty state (no 403 error) |
| 3.25-E2E-13 | Ruben | Non-invited event → `/agenda` |
| 3.25-E2E-14 | Piotrix | Season A visible, B blocked |
| 3.25-E2E-15 | Multi | Agenda aggregates SEASON + EVENT invites |
| 3.25-E2E-16 | Laetitia | Improbots not in Découvrir |
| 3.25-E2E-17 | Angie | Full workspace tabs (regression) |
| 3.25-E2E-18 | Ruben | Validated composition read-only |

---

## Fixture personas (tokens)

| Token | Scope |
|-------|-------|
| `e2e-guest-carnet-only` | Carnet ACTIVE, no invitation |
| `e2e-guest-laetitia` | `SEASON` on `guest-325-laetitia` |
| `e2e-guest-ruben` | `EVENT` on `guest-325-ruben` |
| `e2e-guest-piotrix` | `EVENT` on `guest-325-piotrix-a` only |
| `e2e-guest-multi` | `SEASON` laetitia + `EVENT` ruben future |
| `e2e-member` | Angie — member regression |

---

## Run

```bash
cd apps/web
npm run test:e2e -- --project=chromium-3-25
```

CI: included in `npm run test:e2e` / `e2e-smoke.yml`.

---

## Verdict

**PASS** — 18 E2E scenarios + existing API integration + Vitest toolbar guardrails. Manual recette Patrice (Piotrix multi-troupes) aligned with automated matrix.
