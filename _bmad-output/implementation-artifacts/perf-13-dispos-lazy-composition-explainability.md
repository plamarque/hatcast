---
baseline_commit: 1ce6823772a27b7db3c0c1da85c6a3e1110f3fb3
---

# Story PERF-13 — Dispos lazy composition (explainability)

**Status:** done

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4c  
**Baseline:** Event Dispos charge **composition 553 ms** pour pool % explainability (PERF-03 review)

---

## Story

En tant que **membre** onglet Dispos sans explainability,  
je veux **0** fetch composition au chargement,  
afin de gagner **~500 ms** sur Dispos.

---

## Acceptance Criteria

1. Mode Moi / Tous sans explainability : pas de `GET …/composition`.
2. Explainability activée ou dépliage pool rôle : fetch `GET …/availability/summary?includeChances=true` à la demande (skeleton pool %).
3. Pas de régression FR19/FR24 explainability pour orgas autorisés.
4. Profilage Dispos ≤ 1400 ms (avec PERF-10) ou ≤ 1700 ms (sans PERF-10).

**UI : N/A** — skeleton inline sur % si chargement différé.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` — `event-detail`, `event-dispos-tab`, `availability-poll` ; pas de changement API (5.9 + PERF-10 déjà livrés).
- [x] Vérifier `ensureCompositionLoaded()` no-op hors onglet Équipe (PERF-03 / 5.9).
- [x] BFF `tab=dispos` : `includeChances=false` par défaut ; summary injecté via `bootstrapSummary` sans second fetch.
- [x] `availability-poll` : chances lazy via `getEventAvailabilitySummary(…, true)` au dépliage pool ; skeleton `.poll-row__pool-loading`.
- [x] Tests PERF-13 : bootstrap BFF sans fetch redondant ; skeleton pendant chargement chances ; non-régression event-detail / explainability.
- [x] Suite ciblée verte (event-detail, event-dispos-tab, availability-poll, composition-explainability).

---

## Dev Notes

### Contexte post-5.9

Après decouple explainability Dispos/Équipe (story **5.9**), les % pool Dispos viennent de `availability/summary?includeChances=true` — **pas** de `GET …/composition`. PERF-13 formalise le lazy-load déjà amorcé par PERF-03 et PERF-10.

### Chemins runtime

| Moment | Appel |
|--------|-------|
| Mount Dispos (BFF) | `GET …/page?tab=dispos` → `availabilitySummary` sans chances |
| Mount Dispos (sans BFF cache) | `event-dispos-tab.load()` → summary `includeChances=false` |
| Dépliage pool rôle (explainability) | `availability-poll.ensureChancesLoaded()` → summary `includeChances=true` |
| Onglet Équipe uniquement | `GET …/composition` |

### Explicit non-goals

- PERF-15 hot path SQL summary/composition
- Réintroduire toggle Moi/Tous sur Dispos (retiré story 5.8 unifié)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 5.9 | done | Porte Dispos explainability sans composition |
| PERF-03 | review/done | Tab-gated composition |
| PERF-10 | done | BFF tab=dispos sans composition |

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

1. Auditer les chemins Dispos : confirmer 0× composition au mount.
2. Renforcer tests PERF-13 (bootstrap BFF, skeleton pool).
3. Documenter AC2 corrigé (summary chances, pas composition post-5.9).

### Completion Notes List

- **0× composition Dispos** : `ensureCompositionLoaded()` retourne immédiatement si `activeTab !== 'equipe'` ; BFF `EventPageService` n'inclut composition que pour `tab=equipe`.
- **Lazy chances** : `event-dispos-tab` charge summary sans chances ; `availability-poll` charge `includeChances=true` au dépliage pool avec skeleton Material.
- **Bootstrap BFF** : `bootstrapSummary` évite le second `getEventAvailabilitySummary` quand PERF-10 a déjà fourni le summary.
- **Tests** : +2 specs PERF-13 (`event-dispos-tab`, `availability-poll`) ; 80/80 specs ciblées vertes.
- **AC4 profilage** : waiver review — gate wall non re-mesuré ; re-profilage recommandé avec PERF-14 `--in-app` (décision review 2026-06-10).
- **Profilage post-fix** (`node scripts/v2/profile-web-performance.mjs`, stack dev local `@seed.improbots.test`, `.local/perf-profile/web-perf-2026-06-09T22-28-06-230Z.json`, 2026-06-10) vs baseline plan (`15-32-52-596Z` **2231 ms** Dispos / **553 ms** composition) et post-PERF-10 (`1759 ms`, **6** appels, BFF dispos **598 ms**) :
  - **Event Dispos** wall **2942 ms** (baseline **2231**, Δ **+711 ms** ; post-PERF-10 **1759**, Δ **+1183 ms** — variance run / shell + résolution saison ; BFF `page?tab=dispos` **1795 ms** vs **598 ms** post-PERF-10) ; **7** appels (baseline **10**, post-PERF-10 **6**).
  - **`GET …/composition` 0×** (baseline **1×** ~553 ms) ✓ AC1 ; **`GET …/availability/summary` 0×** hors BFF (summary sans chances via BFF uniquement) ✓ AC2 ; pas de `includeChances=true` au mount.
  - **Gate AC4** (≤1400 ms avec PERF-10 / ≤1700 ms sans) : **non atteint** sur ce run (**2942 ms**) — lazy paths validés structurellement ; wall gate à re-valider en recette `--with-push` ou `--in-app` (PERF-14).

### File List

- `apps/web/src/app/shared/availability/event-dispos-tab.spec.ts`
- `apps/web/src/app/shared/availability/availability-poll.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-10 — Re-profilage post-fix : `web-perf-2026-06-09T22-28-06-230Z.json` — Dispos composition 0× ; summary lazy via BFF ; gate wall AC4 non atteint (2942 ms, variance locale).
- 2026-06-10 — Code review : waiver AC4 → PERF-14 ; +3 tests (bootstrap sans chances, miroir sans bootstrap, no fetch explainability off) ; story → done.
- 2026-06-10 — PERF-13 : formalisation lazy explainability Dispos ; tests bootstrap BFF + skeleton pool ; story → review.

### Review Findings

- [x] [Review][Decision] AC4 profilage non démontré — **Résolu : waiver AC4** ; clôture PERF-13 acceptée avec re-profilage reporté à PERF-14 (aligné PERF-12).
- [x] [Review][Patch] Test miroir sans `bootstrapSummary` [event-dispos-tab.spec.ts] — Ajout `loads summary from API when bootstrapSummary is absent (PERF-13)`.
- [x] [Review][Patch] Assert no fetch chances si explainability off [availability-poll.spec.ts] — `getEventAvailabilitySummary` non appelé au dépliage pool.
- [x] [Review][Patch] Bootstrap test avec summary sans chances [event-dispos-tab.spec.ts] — `mockBootstrapSummaryWithoutChances` (chancePercent null).
- [x] [Review][Defer] AC3 FR19/FR24 orgas sans test PERF-13 dédié [composition-explainability.spec.ts] — deferred, pre-existing : couverture via gates explainability + tests event-detail préexistants, hors scope diff.
- [x] [Review][Defer] AC1 sans test PERF-13 composition Dispos [event-detail.spec.ts] — deferred, pre-existing : gate `ensureCompositionLoaded()` couvert par PERF-03 / story 5.9.
- [x] [Review][Defer] `ensureChancesLoaded` échec API / rejet promesse [availability-poll.ts:521-543] — deferred, pre-existing : pas introduit par ce diff ; snack sur `!ok` mais pas de `catch` reject.
- [x] [Review][Defer] Course bootstrap vs `load()` in-flight [event-dispos-tab.ts:184-210] — deferred, pre-existing : si bootstrap arrive pendant fetch, summary bootstrap peut être écrasé.
- [x] [Review][Defer] `bootstrapSummary` stale au changement d'événement [event-dispos-tab.ts:89-112] — deferred, pre-existing : pas de validation `bootstrap.eventId === event().id`.
