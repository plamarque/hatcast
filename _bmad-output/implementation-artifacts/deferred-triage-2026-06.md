# Triage deferred work — juin 2026 (risque × bénéfice × impact)

**Date :** 2026-06-08 (MAJ T0 clôturés ; T1 par coût/bénéfice)  
**Sources :** [`deferred-work.md`](deferred-work.md), [`deferred-work-archive.md`](deferred-work-archive.md), [`sprint-status.yaml`](sprint-status.yaml), [`PLAN.md`](../../PLAN.md), [`ISSUES.md`](../../ISSUES.md).  
**Contexte :** M4 reporté ; release train V2.0.x OK ; vague 2.1.0 en cours.

---

## 1. Résumé

| Métrique | Valeur |
|----------|--------|
| Entrées actives | **14** (DW-105–106, DW-108–125, hors fermés) |
| **T0** (agir tôt) | **0** |
| **T1** (coût vs bénéfice) | **3** — ordre : DW-106 → DW-105 → DW-114 |
| **T2** (avant M4) | 4 |
| **T3** (backlog) | 7 + meta |
| Fermés cette passe | **DW-104**, **DW-107**, **DW-113** (obsolète 17.29) |
| Volume archive | +§ hygiène 2026-06-08 |

---

## 2. Fermé / accepté depuis 2026-06-05

| ID / lot | Clôture | Risque résiduel |
|----------|---------|-----------------|
| DW-111 | 2026-06-05 | — |
| **DW-104** | 2026-06-08 | Story **1.8** — retry signup + recovery |
| **DW-107** | 2026-06-08 | Story **8.5b** — garde rappels membres inactifs |
| **DW-113** | 2026-06-08 | Obsolète — prefs troupe retirées du hub (**17.29**) |
| **DW-112** | 2026-06-07 | `env-vars-file` YAML — obsolète CSV |
| 2.12, 2.12b/c/d, 2.21 | 2026-06-05/06 | D → archive |
| 3.8c, 3.8d, 3.23, 3.24, 3.25 | 2026-06-06 | D → archive |
| 6.18, 6.19, 6.21, 6.22 | 2026-06-05/07 | D → archive |
| mig-7 | 2026-06-06 | D → archive |
| Équipe SCSS refactor | 2026-06-06 | DW-125 optionnel seul |
| spec-changelog, spec-about-pwa | 2026-06-06 | D → archive |
| + fermés 2026-06-04/05 | voir §2 triage précédent | 3.22, 6.17, ops-8/10, 19.1 |

---

## 3. Matrice active (DW-101+)

Légende **Impact** : `L` large, `M` modéré, `N` niche. **Bénéfice** : `↑` fort, `→` modéré, `↓` faible.

| ID | Coût | Bénéfice | Risque | Impact | Tier | Action |
|----|------|----------|--------|--------|------|--------|
| **DW-106** | **XS** | Modéré (latent) | Modéré si trigger | N | **T1** (#1) | `toCategory()` + test Epic 8 |
| **DW-105** | **M** | Modéré | Modéré | N | **T1** (#2) | IdP delete post-commit |
| **DW-114** | **M–L** | Modéré | Modéré | N | **T1** (#3) | Verrou `reinclude` ou accepté |
| **DW-109** | M | ↑ | Élevé si trigger | M | **T2** | Rejects transform MIG-3 |
| **DW-110** | M | → | Modéré | M | **T2** | Doc / purge orphelines |
| **DW-118** | S | → | Faible | N | **T2** | SQL backfill V38 |
| **DW-119** | S | → | Faible | N | **T2** | Vérif titres exotiques MIG-2 |
| **DW-108** | — | ↓ | Faible | N | **T3** | Accepté post-6.17 sauf PO |
| **DW-115** | S | ↓ | Faible | N | **T3** | UPSERT grant orga |
| **DW-116** | S | → | Faible | N | **T3** | Signal picker 250 |
| **DW-117** | XS | ↓ | Faible | N | **T3** | Token `loadGlance` |
| **DW-120** | L | → | Modéré | M | **T3** | ISSUES + CI gate |
| **DW-121** | L | ↓ | Faible | N | **T3** | Sass @use (pré-3.0) |
| **DW-122** | S | ↓ | Faible | N | **T3** | Perf dev only |
| **DW-123** | M | → | Faible | L | **T3** | Lazy / tree-shake |
| **DW-124** | M | ↓ | Faible | N | **T3** | SCSS budgets |
| **DW-125** | M | ↓ | Faible | N | **T3** | Refactor optionnel |

---

## 4. Ordre recommandé (2.1.0 → M4)

1. **T1** (ROI décroissant) — **DW-106** (minutes, latent Epic 8) → **DW-105** (refactor suppression compte) → **DW-114** (edge roster ; faible urgence).
2. **T2** — DW-109/110/118/119 avant fenêtre M4 (~août).
3. **T3** — DW-120, DW-123, DW-121–125 selon capacité ; **DW-108** seulement si PO exige NFR-R2 strict.

**T0 :** vide — DW-104 (**1.8**) et DW-107 (**8.5b**) clôturés 2026-06-08.

---

## 5. Hors deferred actif

| Type | Destination |
|------|-------------|
| Revues code stories **done** (3.23, 2.12d, …) | Archive § 2026-06-07 |
| LIMIT-004 seed Apérock auto-sync | **ISSUES.md** |
| BUG-008 push prefs refresh | **ISSUES.md** |
| Epic 19.10+ | `sprint-status.yaml` — reporté |
| DW-020–021 historique ligue | PLAN iso-V1 |
