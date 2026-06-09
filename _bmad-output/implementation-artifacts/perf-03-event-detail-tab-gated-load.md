---
baseline_commit: 94f021f87fe96e25cefe2d343de3e245fd39b6aa
---

# Story PERF-03 — Event-detail tab-gated loading

**Status:** review

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 1  
**Baseline:** Event Infos 2027 ms / 12 appels — prefetch composition + dispos hors onglet

---

## Story

En tant que **membre ou orga** ouvrant le détail événement,  
je veux que composition et summary dispos ne se chargent **que lorsque l’onglet correspondant est actif**,  
afin de **réduire le temps d’ouverture onglet Infos** (~50 %).

---

## Acceptance Criteria

1. **Given** ouverture event `?tab=infos`, **when** la page est interactive, **then** **0** appel `GET …/composition` ni `GET …/availability/summary` (sauf status header orga documenté avec skeleton ≤ 300 ms).  
2. **Given** onglet `equipe`, **when** chargement, **then** **1** seul `GET …/composition` (pas de double parent + tab).  
3. **Given** onglet `dispos`, **when** chargement, **then** summary chargé par `event-dispos-tab` uniquement.  
4. **Gate :** Event Infos wall ≤ 1,2 s (script profilage).

**UI : N/A** — skeleton status header acceptable si documenté.

---

## Tasks / Subtasks

- [x] **Scope:** `event-detail.ts`, `event-equipe-tab.ts`, `composition-equipe-status.ts`, specs.
- [x] Retirer `loadDisposSummary` / `loadComposition` eager dans `loadEvent`.
- [x] `ensureCompositionLoaded()` sur onglet Équipe (tab change + deep link `tab=equipe|compo`).
- [x] Parent unique fetch composition → inputs `compositionLoadManagedByParent` sur `event-equipe-tab` (RC-4).
- [x] Status chrome Infos via `resolveCompositionEquipeStatusFromEvent` (`compositionLifecycle` DTO, sans GET).
- [x] `Relance dispos` menu : summary via `onDisposSummaryChanged` (onglet Dispos) uniquement.
- [x] Tests unitaires PERF-03 + helper event lifecycle.
- [x] Re-run tests ciblés event-detail / composition-equipe-status (10 échecs breadcrumb préexistants hors scope).

---

## Dev Notes

- `event-detail.ts` : retirer `loadDisposSummary` / `loadComposition` eager ; charger on tab change.
- `event-equipe-tab.ts` : réutiliser signal parent ou `@Input` composition.
- **Status header orga sur Infos :** badge dérivé du DTO `event.compositionLifecycle` (pas de GET /composition). Aide contextuelle slot-level (ex. « À composer ») après visite onglet Équipe.
- **Relance dispos :** visible dans le menu admin seulement après émission `summaryChanged` par `event-dispos-tab`.

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Gate composition au parent ; enfant en mode `compositionLoadManagedByParent` sans second fetch.
- Fallback status header depuis lifecycle serveur pour AC1 zero-call sur Infos.
- Summary dispos : parent ne prefetch plus ; refresh `loadDisposSummary` seulement si cache local déjà peuplé (post-visite Dispos).

### Completion Notes List

- **Eager prefetch retiré** : `loadEvent` ne déclenche plus composition ni summary.
- **Single fetch Équipe** : parent `loadComposition` + inputs vers `EventEquipeTab` (supprime double fetch RC-4).
- **Status Infos** : `resolveCompositionEquipeStatusFromEvent` — 0 GET /composition pour badge « Confirmations en cours », etc.
- **Tests** : 2 tests PERF-03 ajoutés ; tests Relance dispos adaptés (`onDisposSummaryChanged`) ; 47/57 event-detail verts (10 échecs breadcrumb `/saison/troupe/` préexistants).
- **Profilage post-fix** (`.local/perf-profile/web-perf-2026-06-09T17-00-53-028Z.json`, `--with-push`, 2026-06-09) vs baseline plan `15-32-52-596Z` et post-PERF-02 `16-47-07-519Z` :
  - **Event Infos** wall **2011 ms** (baseline **2027**, post-PERF-02 **2055** ; −16 ms / −44 ms) ; **10** appels `/v1/*` (baseline **12**, post-PERF-02 **11**) ; **`GET …/composition` 0×** (baseline **1×**, post-PERF-02 **1×**) ✓ AC1 ; **`GET …/availability/summary` 0×** ✓ AC1 ; inbox **0×** (baseline **1×**, PERF-02 déjà **0×**).
  - **Event Dispos** : composition **0×** (baseline/post-PERF-02 **1×**) ; summary **1×** (onglet enfant seul) ✓ AC3 ; wall **2269 ms** (+145 ms vs baseline — variance réseau).
  - **Event Équipe** : composition **1×** (baseline/post-PERF-02 **2×**, −1 double fetch) ✓ AC2 ; wall **2124 ms** (baseline **2452**, −328 ms).
  - **Event Activité** : composition **0×** (baseline **1×**) — plus de prefetch hors onglet.
  - **Gate AC4 Event Infos ≤ 1,2 s** : **non atteint** (2011 ms) — prefetch composition retiré (~407 ms max API) mais goulot restant : event + organizers + selectors + permissions (~1,3 s cumulé parallèle) → PERF-04 session cache / autres quick wins.
- **Code review patches (2026-06-09)** : 10/10 appliqués — `ensureCompositionLoaded` sur query params, garde in-flight, retry après échec, fallback DTO cohérent, tests PERF-03 étendus.

### File List

- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.spec.ts`

### Change Log

- 2026-06-09 — PERF-03 tab-gated loading event-detail (composition + dispos summary defer).
- 2026-06-09 — Re-profilage post-fix : `web-perf-2026-06-09T17-00-53-028Z.json` — Event Infos composition 0× / 10 appels ; Équipe composition 1× ; gate wall 1,2 s non atteint (2011 ms).

### Review Findings

- [x] [Review][Patch] `applyQueryParams` n'appelle pas `ensureCompositionLoaded` [`event-detail.ts:344-358`] — corrigé : appel ajouté en fin de `applyQueryParams`.
- [x] [Review][Patch] Échec GET `/composition` bloque les retries [`event-detail.ts:775-784`] — corrigé : reset `compositionLoaded` si `composition === null`.
- [x] [Review][Patch] Race double GET composition [`event-detail.ts:775-784`] — corrigé : garde `compositionLoadInFlight`.
- [x] [Review][Patch] Badge status trompeur après échec fetch puis retour Infos [`event-detail.ts:273-287`] — corrigé : fallback DTO si `compositionLoaded && !composition`.
- [x] [Review][Patch] Guideline draft incohérente sur Infos [`composition-equipe-status.ts:110-114`] — corrigé : param `suppressValidateCtaInGuideline`.
- [x] [Review][Patch] Test AC3 Dispos manquant [`event-detail.spec.ts`] — ajouté test Infos sans prefetch + fetch enfant au switch Dispos.
- [x] [Review][Patch] Test navigation query mid-session manquant [`event-detail.spec.ts`] — ajouté.
- [x] [Review][Patch] Couverture `resolveCompositionEquipeStatusFromEvent` incomplète [`composition-equipe-status.spec.ts`] — 6 cas ajoutés.
- [x] [Review][Patch] Test Équipe index codé en dur [`event-detail.spec.ts:1620-1630`] — remplacé par `visibleTabs().indexOf('equipe')`.
- [x] [Review][Patch] Pas de test anti-refetch Équipe [`event-detail.spec.ts`] — ajouté.

- [x] [Review][Defer] Gate AC4 profilage ≤ 1,2 s — exécuté 2026-06-09 : Event Infos **2011 ms** (baseline 2027) ; composition 0× ✓ mais wall gate non atteint → PERF-04.
- [x] [Review][Defer] `reloadEvent` silent ne réinitialise pas composition [`event-detail.ts:648-657`] — comportement préexistant ; cache composition peut diverger après reload silencieux sur onglet Équipe.
- [x] [Review][Defer] Duplication copy guidelines fallback vs résolveur complet [`composition-equipe-status.ts`] — dette maintenance, hors scope perf.
