# Triage du deferred work HatCast V2 — juin 2026 (DOC-1)

**Date :** 2026-06-04  
**Sources :** [`deferred-work-archive.md`](deferred-work-archive.md) (snapshot verbatim pré-hygiène), [`deferred-triage-2026-05.md`](deferred-triage-2026-05.md), spot-check code, [`PLAN.md`](../../PLAN.md) § Hygiene H1.  
**Fichier actif :** [`deferred-work.md`](deferred-work.md) — **P0–P2 uniquement**, regroupé par thème.

---

## 1. Résumé

| Action DOC-1 | Statut |
|--------------|--------|
| Archive verbatim (~485 lignes, 90 sections revue) | `deferred-work-archive.md` |
| Actif condensé (~25 puces) | `deferred-work.md` |
| Triage mai (DW-001–097) | Inchangé — référence historique |
| Fermetures H1 (stories 5-7, 2-10, 12-7, 6-13) | IDs **DW-079, DW-068, DW-044, DW-054, DW-085** → archive |

**Volume actif :** ~20 entrées actionnables (vs ~150+ puces dans l’archive).

---

## 2. Fermé depuis triage mai (ne pas rouvrir sans régression)

| ID mai | Fermeture | Preuve |
|--------|-----------|--------|
| DW-001, DW-004, DW-099 | CI API H2 | `api-test.yml`, OPS-2 done |
| DW-028, DW-030, DW-037 | pgcrypto obsolète | `gen_random_uuid` V23 |
| DW-079, G-003 | GET summary sans écriture | Story **5-7** done |
| DW-068 | N+1 membres | Story **2-10** — `JOIN FETCH` |
| DW-044, DW-054 | Agenda + post-login | Story **12-7** — `loadGeneration`, mutex `navigateAfterSignIn` |
| DW-085 | Publish in-tx | Story **6-13** — `CompositionNotificationEventListener` |
| **DW-101** | Template match | `RoleTemplates.slotsFor("match")` sans `coach` | Story **3.22** — `coach: 1` API |
| **DW-102** | Template match | Seeds demo / Malice `coach: 0` | Story **3.22** — V17/V26/V34 + générateur |
| DW-070, DW-073, DW-041, DW-018, … | Voir §3 triage mai | Stories 2.4, 17.5, 3.6b, etc. |
| 17-29 (multi-troupe prefs) | Story **17.33** done | Endpoint compte unique |
| 4-3 logo cartes | Résolu clôture 4.3 | ~~barré~~ dans archive |
| 1-6 « Supprimer » disabled | Story **1.7** done | |

---

## 3. Tableau actif (DW-101+)

| ID | Thème | Résumé | Risque | Priorité | Source archive |
|----|-------|--------|--------|----------|----------------|
| **DW-101** | Template match | `RoleTemplates.slotsFor("match")` sans `coach` (API) | Données / presets faux | **P0** | → story **3.22** **done** |
| **DW-102** | Template match | Seeds demo / Malice `coach: 0` | Recette dev ≠ prod nouveaux matchs | **P0** | → story **3.22** **done** |
| **DW-103** | Template match | Matchs historiques → `detectTemplateFromRoles` = `custom` | Confusion édition slots | **P1** | story **3.22** AC4–5 (pas backfill) — **ouvert / accepté** |
| **DW-104** | Auth | Compte Firebase orphelin si API échoue après signup email | Comptes fantômes | **P0** | 1.2b |
| **DW-105** | Auth | `deleteUser` dans `@Transactional` (1.7) | Transaction longue / rollback | **P1** | 1-7 |
| **DW-106** | Notifications | `COMPOSITION_SHARED` absent de `toCategory()` | Mauvaises prefs push/email | **P1** | 8-2 |
| **DW-107** | Notifications | Rappels aux membres désactivés (8-5 W3) | Spam / confiance | **P1** | 8-5 |
| **DW-108** | Annonces | `notifiedCount` = preview GET, pas dispatch (NFR-R2) | Transparence orga | **P1** | 6-15 |
| **DW-109** | Migration | MIG-3 : `comment`/`role_key` non validés au transform | Échec transaction entière | **P0** | mig-3 |
| **DW-110** | Migration | MIG-3 : orphelins si re-run sans reset (`ON CONFLICT DO UPDATE`) | Données incohérentes | **P1** | mig-3 |
| **DW-111** | Migration | Gates replay ≥3 cycles + `replay-log.jsonl` / MIG-4 preuves | **Gate prod** | **P0** | mig-3, mig-4 |
| **DW-112** | Ops | `--set-env-vars` CSV fragile (`,`, `=`) | Deploy Cloud Run cassé | **P0** | ops-5 |
| **DW-113** | Admin plateforme | Hub prefs troupe sans adhésion réelle (`PATCH memberships/me`) | 403 super-admin | **P1** | platform admin 2026-05-31 |
| **DW-114** | Participants | `reinclude` vs adhésion INACTIVE concurrente (3-19) | État roster incohérent | **P1** | 3-19 |
| **DW-115** | Organisateurs | Race grant organisateur check-then-insert (3-5) | 500 vs 200 idempotent | **P2** | 3-5 |
| **DW-116** | UX / perf | Event picker max 250 silencieux | Filtres historique tronqués | **P2** | 17-28 |
| **DW-117** | UX / perf | `member-season-glance` sans `loadGeneration` | Courses concurrentes glance | **P2** | 17-27 |
| **DW-118** | Migration données | V38 backfill `removal_source` NULL sur REMOVED | Audit retrait saison | **P1** | 3-19 |
| **DW-119** | Slugs import | Backfill SQL `translate` vs `slugify` NFD (17-6) | Slugs exotiques MIG-2 | **P1** | 17-6 (DW-031 mai) |
| **DW-120** | CI / qualité | Suite web globale rouge (hors stories) | Confiance merge | **P2** | meta 6-10c, 17-35, 17-2… |

---

## 4. Hors fichier actif (où tracer)

| Type | Destination |
|------|-------------|
| Réserve produit historique ligue (DW-020–021) | PLAN § iso-V1 / `deferred-triage-2026-05.md` §5 |
| Polish UX, tests manquants, `afterClosed()` | Archive — story dédiée si régression |
| OPS cosmétique (PostHog lockfile, dry-run lent, changelog JSON) | Archive ou backlog OPS |
| Epic 13 multi-saisons | PLAN — pas deferred |

---

## 5. Prochaines actions suggérées

1. **P0 avant cutover :** DW-111 (replay), DW-109–110 (MIG-3), DW-112 (deploy). ~~story 3.22 (DW-101–102)~~ **done 2026-06-04**.  
2. ~~**Implémentation :** [3-22-match-template-coach-api-seeds.md](3-22-match-template-coach-api-seeds.md)~~ — en **review**.  
3. **Story / 6-17 :** transparence annonces (DW-108).  
4. **Ne pas ré-archiver** sans mettre à jour ce fichier et l’en-tête de `deferred-work.md`.
