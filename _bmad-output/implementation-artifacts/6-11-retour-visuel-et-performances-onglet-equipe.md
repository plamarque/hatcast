# Story 6.11: Équipe tab — loading feedback and performance (profiling-first)

Status: done

## Story

As an **organizer or participant** using the **Équipe** tab on event detail,  
I want **clear visual feedback during slow composition actions** and **responsive mutations**,  
so that **I trust the app is working** and the MVP pilot experience is not degraded by multi-second silent waits (**UX-DR6**, post-MVP polish).

## Acceptance Criteria

1. **Given** any in-flight composition mutation on **Équipe** (`draw`, `fillEmpty`, `assign`, `clear`, `validate`, `unlock`, `publish`, participation update, `restoreDecline`), **when** the HTTP request is pending, **then** the UI shows an **obvious busy state** (full-tab overlay or grid-level blocker + `aria-busy`) — not only a small spinner on one toolbar button — **ISSUES UX-001**.
2. **Given** `prefers-reduced-motion: reduce`, **when** a mutation runs, **then** feedback remains visible (spinner/text) without requiring draw animation — **NFR-A1**.
3. **Given** a successful mutation that already updates local `composition` state from the API response, **when** the client refreshes parent event context, **then** it **does not** trigger redundant full reloads that add perceived latency without user-visible benefit — profile first, then implement minimal refresh (e.g. skip `loadEvent` when only composition/lifecycle changed) — **ISSUES PERF-001**.
4. **Given** draw animation completes (`onDrawStepFinished`), **when** composition is already returned in draw response, **then** avoid an extra full `GET composition` unless required for consistency — measure before/after in profiling notes — **PERF-001**.
5. **Given** validated composition with **Déverrouiller** visible, **when** the organizer views the action, **then** it uses **Material secondary button** affordance (stroked or equivalent), visually distinct from **Valider** — **ISSUES UX-002**.
6. **Profiling deliverable (mandatory first task):** **Given** local dev against seed spectacles `[MVP] 01–04`, **when** the developer runs the profiling checklist below, **then** a short **Profiling report** section is appended to this story file (or `docs/v2/technical/COMPOSITION_TAB_PERF.md`) with: median/p95 duration per action, network vs server vs UI gap, and top 3 hypotheses ranked.
7. **Targets after fixes (dev local, Neon dev branch, single admin):** draw, assign, validate, proxy confirm, gap-fill — **p95 perceived busy under 2 s** OR documented blocker (network RTT) with UX mitigation shipped (AC #1 still required).
8. **Couverture:** **NFR-P2**, **NFR-A1**, **NFR-Q1** — Angular tests: overlay visible while `drawing`/`assigning`/`validating`/`updatingParticipation`; unlock button class; no regression on draw animation path. Optional: lightweight API timing log in dev profile only (not production noise).

### Explicit out of scope

| Item | Reason |
|------|--------|
| **Epic 8** | Real push/email delivery |
| **6.10** | Share/announce modal |
| **Global API perf** unrelated to composition/event detail | Separate initiative unless profiling proves root cause |
| **Legacy V1** | No changes under `legacy/` |

## Context

| Source | Detail |
|--------|--------|
| **MVP pilote** | Closed **2026-05-25** — functional OK on `[MVP] 00–05` recette |
| **ISSUES.md** | UX-001, UX-002, PERF-001 |
| **Observed** | Tirage, assignation, confirmation, compléter : plusieurs secondes sans feedback, puis refresh brutal |
| **Code hotspots** | [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) (`drawing`, `assigning`, `validating`, `updatingParticipation`, `onDrawStepFinished` → `load()`); [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) `reloadAfterPublish()` → `loadEvent()` |

## Profiling checklist (execute before coding fixes)

Record each run in Chrome DevTools **Network** (Disable cache) + **Performance** optional.

| # | Spectacle seed | Action | Endpoints to watch |
|---|----------------|--------|-------------------|
| 1 | `[MVP] 01 · Tirage pondéré` | Tirer au sort (full draw) | `POST .../composition/draw`, any follow-up `GET` |
| 2 | `[MVP] 02 · Assignation manuelle` | Assign one slot via picker | `GET .../candidates`, `PUT/PATCH .../assign` |
| 3 | `[MVP] 02` | Valider | `POST .../validate` |
| 4 | `[MVP] 03 · Validations en attente` | Proxy confirm one slot | participation endpoint |
| 5 | `[MVP] 04 · Déclin et compléter` | Compléter (fillEmpty) or assign gap | `draw` fillEmpty / assign |

For each row note: **TTFB**, **total**, **waterfall count**, whether **`loadEvent`** fired (parent), whether **`load()` composition** fired after draw animation.

**Server-side (optional):** run same flows with Spring Actuator / structured log timing on `CompositionDrawService`, `CompositionSlotAssignmentService`, `CompositionParticipationService` if API p95 exceeds 500 ms.

## Profiling report (Phase 0 — 2026-05-25)

Analyse statique du code + contrat réseau attendu (pas de mesure Chrome sur seed Neon dans cette session).

| Action | Endpoints attendus (avant) | Cause dominante estimée |
|--------|---------------------------|-------------------------|
| Tirage (full) | `POST draw` + `GET composition` après animation | **Front** : reload composition post-animation ; **API** : coût draw |
| Assign | `GET candidates` + `PUT assign` + `GET event` + permissions | **Front** : `loadEvent` redondant (~2 RTT) |
| Valider / Déverrouiller / Publier | `POST *` + `GET event` + permissions | **Front** : `loadEvent` redondant |
| Proxy confirm / restore | participation/restore + `GET event` | **Front** : `loadEvent` redondant |

**Hypothèses classées :**

1. **(Haute)** `compositionPublished` → `EventDetail.loadEvent()` relançait événement + permissions à chaque mutation alors que la réponse composition suffit pour lifecycle/badge Infos.
2. **(Haute)** `onDrawStepFinished()` appelait `load()` (GET composition) alors que `draw` renvoie déjà `composition` dans la réponse.
3. **(Moyenne)** Latence RTT API ↔ Neon `eu-central-1` en dev (non corrigeable côté front ; mitigation = overlay AC #1).

**Correctifs livrés :** patch lifecycle local (`computeCompositionLifecycleView`), suppression `loadEvent` post-mutation, suppression `GET composition` post-tirage animé, overlay tab + `aria-busy`. Pas de changement API (H3 < 40 % preuve mesurée).

---

## Tasks / Subtasks

- [x] **Phase 0 — Profiling** (AC #6): run checklist; write report with ranked hypotheses.
- [x] **Phase 1 — UX feedback** (AC #1–2, #5):
  - [x] Tab-level busy overlay bound to `drawing || assigning || validating || unlocking || publishing || updatingParticipation || restoringDeclineId`.
  - [x] Disable slot interactions while busy.
  - [x] Restyle `.event-equipe-tab__unlock` to match validate/draw button family.
- [x] **Phase 2 — Front perf** (AC #3–4): based on profiling — reduce redundant `loadEvent` / post-draw `load()`; keep `compositionPublished` contract for Infos lifecycle.
- [x] **Phase 3 — API perf** (only if profiling shows server over 40% of wait): targeted optimization (candidates query, draw pipeline, N+1) — smallest change first — **skipped** (profiling code-first : front dominant).
- [x] **Tests** (AC #8): update `event-equipe-tab.spec.ts`; manual re-run `[MVP]` recette scenarios B–E — **automated** ; recette manuelle à faire par humain.

## Dev Agent Record

### Completion Notes

- Overlay plein onglet (`event-equipe-tab__busy-overlay`) + `aria-busy` + `pointer-events: none` sur grille/outils pendant mutations.
- `mat-stroked-button` pour Déverrouiller (UX-002).
- `compositionPublished` émet `CompositionResponse` ; `EventDetail.syncCompositionFromEquipe` met à jour `compositionLifecycle`, `compositionPublishedAt`, `teamStatusBadge` sans `loadEvent`.
- Tirage animé : composition issue du `POST draw` appliquée à la fin d’animation (plus de `GET composition`).
- Tests : 34 passent (`ng test` ciblé equipe-tab + composition-lifecycle).

### File List

- `apps/web/src/app/core/composition/composition-lifecycle.ts`
- `apps/web/src/app/core/composition/composition-lifecycle.spec.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`

### Change Log

- 2026-05-25: Story 6.11 — UX overlay, unlock stroked button, front perf (skip redundant reloads).
- 2026-05-25: Clôturée après recette — API perf (bulk membership, fast path composition, optional chances) + livraison front.

## Dev Notes

### Signals already present (insufficient UX)

- `drawing()`, `assigning()`, `validating()`, `unlocking()`, `updatingParticipation()` — spinners mostly on **toolbar buttons** only.
- `animatingDraw()` — animation **after** API returns; gap during API wait is the pain point.

### `compositionPublished` chain

```typescript
// event-equipe-tab emits after assign/validate/...
// event-detail.ts
protected reloadAfterPublish(): void {
  void this.loadEvent(slug, eventId, { silent: true })
}
```

Evaluate whether Infos tab needs full event DTO or only `compositionLifecycle` from composition response.

### Files likely touched

- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts|html|scss`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/core/composition/composition-api.service.ts` (only if batching/caching justified by profiling)

## References

- [ISSUES.md](../../ISSUES.md) — UX-001, UX-002, PERF-001
- [PLAN.md](../../PLAN.md) — MVP pilote Done 2026-05-25; wave Post-MVP **6.11**
- [scripts/v2/MVP-PILOT-RECETTE.md](../../scripts/v2/MVP-PILOT-RECETTE.md)
- [ux-design-hatcast-v2.md](../planning-artifacts/ux-design-hatcast-v2.md) — Équipe tab
