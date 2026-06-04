# Triage du deferred work HatCast V2 — juin 2026 (DOC-1)

**Date :** 2026-06-05 (MAJ — **DW-111** fermé PO)  
**Sources :** [`deferred-work.md`](deferred-work.md) (actif), [`deferred-work-archive.md`](deferred-work-archive.md), [`sprint-status.yaml`](sprint-status.yaml), [`PLAN.md`](../../PLAN.md).  
**Fichier actif :** ~**16** puces actionnables (après clôtures 3.22, 6.17, ops-8, ops-10, 19.1).

---

## 1. Résumé

| Action | Statut |
|--------|--------|
| DOC-1 archive + actif condensé | 2026-06-04 |
| Hygiène 2026-06-05 | Revues ops-10 / 6-17 / 19-1 → archive ; tableau fermé mis à jour |
| Volume actif | **3× P0**, **8× P1**, **3× P2**, **1× meta** |

---

## 2. Fermé depuis juin 2026 (ne pas rouvrir)

| ID / item | Clôture | Preuve |
|-----------|---------|--------|
| **DW-101**, **DW-102** | 2026-06-04 | Story **3.22** done |
| **DW-103** | accepté | Story 3.22 AC4–5 — pas backfill |
| **6.17** (partiel **DW-108**) | 2026-06-04 | `lastNotifiedAt`, dispatch `event` ; comptage dispatch réel → reporté |
| **ops-8** | 2026-06-04 | `hatcast.app` live — sprint-status |
| **ops-10** | 2026-06-05 | Email staging recette OK |
| **19.1** | 2026-06-04 | SPEC/ADR tirage — doc |
| **DW-111** | 2026-06-05 | ≥3 replays migration — gate `validate-replay --min=3` (PLAN **E2** [x]) |
| Revues ops-10 / 19-1 / 6-17 (D) | 2026-06-05 | Archive append § hygiène 2026-06-05 |
| H1 mai (DW-079, 068, 044, 054, 085, …) | 2026-05–06 | Voir §2 triage mai |

---

## 3. Tableau actif (DW-101+)

| ID | Thème | Risque | Priorité | Statut |
|----|-------|--------|----------|--------|
| **DW-104** | Auth Firebase orphelin | Comptes fantômes | **P0** | ouvert |
| **DW-109** | MIG-3 validation champs | Transaction load KO | **P0** | ouvert |
| **DW-110** | MIG-3 orphelins re-run | Données incohérentes | **P0** | ouvert |
| **DW-112** | Deploy env-vars CSV | Deploy cassé | **P0** | ouvert |
| **DW-106** | `COMPOSITION_SHARED` → category | Mauvaises prefs | **P1** | ouvert |
| **DW-107** | Rappels membres désactivés | Spam | **P1** | ouvert |
| **DW-108** | `notifiedCount` ≠ dispatch SENT | Transparence | **P1** | partiel (6.17) |
| **DW-105** | deleteUser in-tx | DB / rollback | **P1** | ouvert |
| **DW-113** | Super-admin prefs troupe | 403 UX | **P1** | ouvert |
| **DW-114** | reinclude race | Roster | **P1** | ouvert |
| **DW-118** | V38 backfill | Audit | **P1** | ouvert |
| **DW-119** | Slugs exotiques import | URLs | **P1** | ouvert |
| **DW-115** | Grant orga race | 500 | **P2** | ouvert |
| **DW-116** | Picker 250 | UX | **P2** | ouvert |
| **DW-117** | glance concurrent | UX | **P2** | ouvert |
| **DW-120** | Suite web rouge | CI | **P2** | ouvert |

**Retirés du actif :** DW-101, DW-102, DW-103 (accepté), **DW-111**, sections revue 6-17/ops-10/19-1.

---

## 4. Hors fichier actif

| Type | Destination |
|------|-------------|
| Réserve historique ligue (DW-020–021) | PLAN § iso-V1 |
| Epic 19.10+ (formules tirage) | `sprint-status.yaml` epic-19 |
| Polish D (timeouts ops-10, tests Mailpit) | Archive 2026-06-05 |

---

## 5. Prochaines actions (ordre suggéré)

1. ~~**DW-111**~~ — **Fermé** (≥3 replays + gate replay).
2. **DW-112** — Hardening workflow deploy (ou story OPS courte).
3. **DW-109–110** — Durcissement scripts MIG-3 (défense en profondeur ; replay gate déjà passé).
4. **DW-104** — Story auth orphan cleanup.
5. **P1** — DW-108 suite (6.18?) si PO exige comptage dispatch exact ; sinon DW-107 / DW-106.
