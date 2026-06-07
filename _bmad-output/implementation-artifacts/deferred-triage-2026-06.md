# Triage deferred work — juin 2026 (coût vs bénéfice)

**Date :** 2026-06-09 (T0/T1 clôturés ; T2/T3 repriorisés)  
**Sources :** [`deferred-work.md`](deferred-work.md), [`deferred-work-archive.md`](deferred-work-archive.md), [`sprint-status.yaml`](sprint-status.yaml), [`PLAN.md`](../../PLAN.md), [`ISSUES.md`](../../ISSUES.md).  
**Contexte :** M4 reporté (~août 2026) ; release train V2.0.x OK ; vague 2.1.0 en cours.

---

## 1. Résumé

| Métrique | Valeur |
|----------|--------|
| Entrées actives | **10** (DW-108–125, hors fermés) |
| **T0** | **0** |
| **T1** | **0** |
| **T2** (avant M4) | **3** — ordre : DW-119 → DW-109 → DW-110 |
| **T3** (backlog) | **9** actionnables + **DW-108** accepté |
| Fermés cette passe | **DW-118** (audit SQL, pas de migration) |
| Volume archive | +§ hygiène 2026-06-09 |

---

## 2. Fermé / accepté (cumul)

| ID / lot | Clôture | Note |
|----------|---------|------|
| **DW-105** | 2026-06-07 | IdP delete post-commit |
| **DW-106** | 2026-06-07 | `COMPOSITION_SHARED` intent + mapping |
| **DW-114** | 2026-06-07 | `reinclude` post-save re-check |
| **DW-118** | 2026-06-07 | Audit SQL staging + prod : 0 row — pas de backfill V61 |
| **DW-104**, **DW-107**, **DW-113** | 2026-06-08 | T0 + obsolète 17.29 |
| **DW-112** | 2026-06-07 | `env-vars-file` YAML |
| **DW-111** | 2026-06-05 | Replay migration × ≥3 |
| + lots stories done | 2026-06-04–07 | voir [`deferred-work.md`](deferred-work.md) § Fermé |

---

## 3. Matrice active — T2 (avant M4)

| # | ID | Coût | Bénéfice | Risque | Impact | Action |
|---|-----|------|----------|--------|--------|--------|
| 1 | **DW-119** | **S** | Modéré | Faible | N | Vérif slugs MIG-2 |
| 2 | **DW-109** | **M** | Élevé si trigger | Élevé si trigger | M | Rejects transform MIG-3 |
| 3 | **DW-110** | **M** | Modéré | Modéré | M | Doc / purge orphelines MIG-3 |

---

## 4. Matrice active — T3 (backlog)

| # | ID | Coût | Bénéfice | Risque | Impact | Action |
|---|-----|------|----------|--------|--------|--------|
| 1 | **DW-117** | **XS** | Faible | Faible | N | Token `loadGlance` |
| 2 | **DW-116** | **S** | Modéré | Faible | N | Signal picker 250 |
| 3 | **DW-115** | **S** | Faible | Faible | N | UPSERT grant orga |
| 4 | **DW-122** | **S** | Faible | Faible | N | Perf dev prebundle |
| 5 | **DW-123** | **M** | Modéré | Faible | **L** | Lazy / tree-shake bundle |
| 6 | **DW-124** | **M** | Faible | Faible | N | SCSS budgets composants |
| 7 | **DW-125** | **M** | Faible | Faible | N | Refactor `event-equipe-tab` |
| 8 | **DW-121** | **L** | Faible | Faible | N | Sass @use (pré-3.0) |
| 9 | **DW-120** | **L** | Modéré | Modéré | M | ISSUES + CI gate |
| — | **DW-108** | — | ↓ | Faible | N | Accepté post-6.17 |

---

## 5. Ordre recommandé (2.1.0 → M4)

1. **T2** (ROI décroissant) — **DW-119** (quick win migration) → **DW-109** (défense données) → **DW-110** (staging).
2. **T3** (si capacité) — **DW-117** / **DW-116** (XS–S UX) → **DW-123** (bundle prod) → reste selon sprint.
3. **DW-108** — ne pas planifier sauf demande PO **NFR-R2**.
4. **8.4** — dispatch brouillon partagé (mapping DW-106 déjà en place).

**T0 / T1 :** vides (clôturés 2026-06-07/08).

---

## 6. Hors deferred actif

| Type | Destination |
|------|-------------|
| Revues specs **dw-105/106** | Archive § 2026-06-09 |
| LIMIT-004 seed Apérock auto-sync | **ISSUES.md** |
| BUG-008 push prefs refresh | **ISSUES.md** |
| Epic 19.10+ | `sprint-status.yaml` — reporté |
| DW-020–021 historique ligue | PLAN iso-V1 |
| `SeasonStatisticsService` gap (DW-114 résiduel) | **ISSUES.md** si terrain |
