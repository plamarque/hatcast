# Triage deferred work — juin 2026 (risque × bénéfice × impact)

**Date :** 2026-06-07  
**Sources :** [`deferred-work.md`](deferred-work.md), [`deferred-work-archive.md`](deferred-work-archive.md), [`sprint-status.yaml`](sprint-status.yaml), [`PLAN.md`](../../PLAN.md), [`ISSUES.md`](../../ISSUES.md).  
**Contexte :** M4 reporté ; release train V2.0.x OK ; vague 2.1.0 en cours.

---

## 1. Résumé

| Métrique | Valeur |
|----------|--------|
| Entrées actives | **17** (DW-104 → DW-125, hors fermés) |
| **T0** (agir tôt) | 2 |
| **T1** (valeur nette) | 4 |
| **T2** (avant M4) | 4 |
| **T3** (backlog) | 7 + meta |
| Fermés cette passe | **DW-112** ; ~**15** stories done archivées (§2) |
| Volume archive | +§ hygiène 2026-06-07 (~20 sections revue) |

---

## 2. Fermé / accepté depuis 2026-06-05

| ID / lot | Clôture | Risque résiduel |
|----------|---------|-----------------|
| DW-111 | 2026-06-05 | — |
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

| ID | Risque | Bénéfice | Impact | Tier | Action |
|----|--------|----------|--------|------|--------|
| **DW-104** | Élevé | ↑ | L | **T0** | Story auth orphan |
| **DW-107** | Élevé | ↑ | M | **T0** | Garde rappels 8.5 |
| **DW-106** | Modéré (latent) | ↑ (effort faible) | N | **T1** | 1 branche `toCategory()` |
| **DW-105** | Modéré | → | N | **T1** | `@TransactionalEventListener` |
| **DW-113** | Faible | → | N | **T1** | Masquer prefs super-admin |
| **DW-114** | Modéré | → | N | **T1** | Verrou ou doc accepté |
| **DW-109** | Élevé si trigger | ↑ | M | **T2** | Rejects transform MIG-3 |
| **DW-110** | Modéré | → | M | **T2** | Doc / purge orphelines |
| **DW-118** | Faible | → | N | **T2** | SQL backfill V38 |
| **DW-119** | Faible | → | N | **T2** | Vérif titres exotiques MIG-2 |
| **DW-108** | Faible | ↓ | N | **T3** | Accepté post-6.17 sauf PO |
| **DW-115** | Faible | ↓ | N | **T3** | UPSERT grant orga |
| **DW-116** | Faible | → | N | **T3** | Signal picker 250 |
| **DW-117** | Faible | ↓ | N | **T3** | Token `loadGlance` |
| **DW-120** | Modéré | → | M | **T3** | ISSUES + CI gate |
| **DW-121** | Faible | ↓ | N | **T3** | Sass @use (pré-3.0) |
| **DW-122** | Faible | ↓ | N | **T3** | Perf dev only |
| **DW-123** | Faible | → | L | **T3** | Lazy / tree-shake |
| **DW-124** | Faible | ↓ | N | **T3** | SCSS budgets |
| **DW-125** | Faible | ↓ | N | **T3** | Refactor optionnel |

---

## 4. Ordre recommandé (2.1.0 → M4)

1. **T0** — DW-104, DW-107 (intégrité utilisateur).
2. **T1 quick wins** — DW-106 (minutes), DW-113 si super-admin actif.
3. **T1** — DW-105, DW-114 si retours roster.
4. **T2** — DW-109/110/118/119 avant fenêtre M4 (~août).
5. **T3** — DW-120, DW-123, DW-121–125 selon capacité ; **DW-108** seulement si PO exige NFR-R2 strict.

---

## 5. Hors deferred actif

| Type | Destination |
|------|-------------|
| Revues code stories **done** (3.23, 2.12d, …) | Archive § 2026-06-07 |
| LIMIT-004 seed Apérock auto-sync | **ISSUES.md** |
| BUG-008 push prefs refresh | **ISSUES.md** |
| Epic 19.10+ | `sprint-status.yaml` — reporté |
| DW-020–021 historique ligue | PLAN iso-V1 |
