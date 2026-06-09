---
baseline_commit: 005db2bcaa8b9bc087e15d4e70e689b11613e0ea
---

# Story PERF-14 — Script profilage navigation in-app

**Status:** done

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4d

---

## Story

En tant qu’**équipe**,  
je veux mesurer les 5 pages à fort trafic via **navigation Router** (pas `page.goto` reload),  
afin de valider PERF-04/09 et le ressenti réel.

---

## Acceptance Criteria

1. `profile-web-performance.mjs --in-app` : login → accueil → agenda → event (3 tabs) via clics/`router.navigate`.
2. Rapport JSON séparé `web-perf-inapp-*.json`.
3. Documenté dans plan Vague 2 §5.

**UI : N/A** — script Node/Playwright uniquement.

---

## Tasks / Subtasks

- [x] **Périmètre :** `scripts/v2/` — mode `--in-app` dans `profile-web-performance.mjs`
- [x] Extraire helpers testables (`parseCliArgs`, `buildReportFilename`, `buildInAppSteps`)
- [x] Flux in-app : login → nav Accueil → nav Agenda → clic event → onglets Dispos / Équipe
- [x] Rapport JSON `web-perf-inapp-*.json` avec `mode: "in-app"` et `navigation: "in-app"` par step
- [x] Tests unitaires `profile-web-performance.test.mjs`
- [x] Documentation plan Vague 2 §5 (modes goto vs in-app)
- [x] Validation manuelle : `node scripts/v2/profile-web-performance.mjs --in-app` contre stack dev local

## Dev Notes

### Product and UX rules

- Mesure le parcours membre réel (PERF-04 cache session, PERF-09 bootstrap shell) sans reload SPA.
- Viewport desktop 1280×900 pour nav rail + onglets event visibles.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| PERF-04 | done | Cache session visible en mode in-app |
| PERF-09 | done | Bootstrap shell — auth/troupes une fois |

## Dev Agent Record

### Agent Model Used

Claude (Cursor agent)

### Implementation Plan

- Refactoriser le tracking API (`attachApiListeners`) partagé entre modes `goto` et `in-app`.
- `profileInAppStep` : timer autour d’une action de navigation (clic nav / carte agenda / onglet) + `networkidle`.
- Clics : `a[href="/accueil"]`, `a[href="/agenda"]`, `.agenda-card__clickable`, `getByRole('tab')` avec libellés français (Équipe).

### Completion Notes List

- Mode `--in-app` livré : 5 steps (Accueil, Agenda, Event Infos/Dispos/Équipe) sans `page.goto` intermédiaire.
- Rapport exemple (pré-patches) : `.local/perf-profile/web-perf-inapp-2026-06-09T22-15-49-339Z.json` — Event Équipe 56 ms / 0 appels API (cache in-app post-Dispos).
- Tests : `node --test scripts/v2/profile-web-performance.test.mjs` — 5/5 pass.
- Revue code 2026-06-10 : patches appliqués (me/agenda, nav scopée, longTasks par step, skippedSteps, doc viewport).
- **Re-run post-patches (2026-06-10)** : `.local/perf-profile/web-perf-inapp-2026-06-09T22-28-46-079Z.json` — contexte aligné `me/agenda` (`cabaret-du-printemps`, saison `les-improbots-2026-2027`), `skippedSteps: []`. Delta `wallMs` vs snapshot 22-15-49 (pré-patches, contexte incohérent `aaaa-2`/Apérock) :

  | Step | Avant | Après | Δ | API calls avant → après |
  |------|------:|------:|--:|-------------------------|
  | Accueil todo | 42 ms | 1060 ms | +1018 ms | 0 → 1 (`GET /v1/me/inbox` 492 ms) |
  | Agenda membre | 25 ms | 20 ms | −5 ms | 0 → 0 |
  | Event Infos | 1373 ms | 1374 ms | +1 ms | 2 → 1 |
  | Event Dispos | 4143 ms | 4616 ms | +473 ms | 3 → 4 (max endpoint ~1785 → ~1889 ms) |
  | Event Équipe | 56 ms | 54 ms | −2 ms | 0 → 0 |

  Interprétation : le snapshot post-patches mesure le **bon** événement (URL rapport = page réelle) ; l’écart Accueil (+1 s) reflète surtout un appel inbox comptabilisé sur la nav Accueil. Event Équipe reste ~54 ms / 0 API (cache session in-app). `longTaskMs` = 0 sur tous les steps (filtrage par step OK).

### File List

- `scripts/v2/profile-web-performance.mjs`
- `scripts/v2/profile-web-performance.test.mjs`
- `package.json`
- `_bmad-output/planning-artifacts/perf-improvement-plan-v2-wave2.md`

### Change Log

- 2026-06-10 : PERF-14 — mode `--in-app`, rapport `web-perf-inapp-*.json`, doc plan §5.
- 2026-06-10 : Revue code — 8 patches (me/agenda, nav scopée, longTasks par step, skippedSteps, doc viewport).

### Review Findings

- [x] [Review][Patch] Scope member nav clicks to `app-member-nav` [`scripts/v2/profile-web-performance.mjs:229`]
- [x] [Review][Patch] Click agenda card matching `ctx.eventSlug`, not `.first()` [`scripts/v2/profile-web-performance.mjs:268`]
- [x] [Review][Patch] Discover upcoming event via `/v1/me/agenda` (aligned with agenda UI) [`scripts/v2/profile-web-performance.mjs:126`]
- [x] [Review][Patch] Event Infos step: assert `tab=infos` after navigation [`scripts/v2/profile-web-performance.mjs:270`]
- [x] [Review][Patch] Report `skippedSteps` / warning when event steps omitted [`scripts/v2/profile-web-performance.mjs:402`]
- [x] [Review][Patch] Reset or filter `longTasks` per in-app step (avoid cross-step accumulation) [`scripts/v2/profile-web-performance.mjs:210`]
- [x] [Review][Patch] Document viewport 1280×900 in plan Vague 2 §5 [`perf-improvement-plan-v2-wave2.md:175`]
- [x] [Review][Patch] Add `package.json` to story File List [`perf-14-profiling-script-in-app-nav.md`]
- [x] [Review][Defer] `loginEmail` and default seed credentials in JSON report [`scripts/v2/profile-web-performance.mjs:19`] — deferred, pre-existing
- [x] [Review][Defer] `attachApiListeners` pending-map leak / query-string endpoint merge [`scripts/v2/profile-web-performance.mjs:42`] — deferred, pre-existing
- [x] [Review][Defer] `networkidle` timeout swallowed in `waitForReady` [`scripts/v2/profile-web-performance.mjs:149`] — deferred, pre-existing
- [x] [Review][Defer] `isMain` path compare fragile on Windows [`scripts/v2/profile-web-performance.mjs:427`] — deferred, pre-existing
- [x] [Review][Defer] No Playwright E2E for `--in-app` flux (manual validation only) — deferred, out of story scope
- [x] [Review][Defer] UI selector coupling (French tab labels, CSS classes) — deferred, acceptable for internal perf gate

---
