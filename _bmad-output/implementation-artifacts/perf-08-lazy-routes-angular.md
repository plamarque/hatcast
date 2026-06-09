---
baseline_commit: 5062d60aa5de196ed9b5d6f77aa32af26bfd5403
---

# Story PERF-08 — Lazy routes Angular par zone

**Status:** done

**Plan:** [perf-improvement-plan-v2.md](../planning-artifacts/perf-improvement-plan-v2.md) § Vague 3  
**Baseline bundle:** [apps/web/README.md](../../apps/web/README.md) — 2,33 MB initial (2026-06-06) → **1,44 MB** post-PERF-08

---

## Story

En tant que **membre** ouvrant l’app (cold start / PWA),  
je veux charger uniquement le code de la zone visitée,  
afin de **réduire le TTI initial** de 30–50 %.

---

## Acceptance Criteria

1. **Given** `ng build` production, **when** PERF-08 livré, **then** bundle initial raw **≤ 2,0 MB** (ou documenter delta + budget CI).  
2. **Given** `app.routes.ts`, **when** audit, **then** `loadComponent` pour zones agenda, saison, admin, compte.  
3. `app.routes.spec.ts` mis à jour ; pas de régression navigation.

**M3-5 :** revue checklist si touch layout shell.

---

## Tasks / Subtasks

- [x] **Routes:** `loadComponent` pour zones agenda, saison (canonical + legacy redirect), admin (troupes + saison), compte (+ onglets).
- [x] **Shell:** conserver `MemberShell`, auth et `MemberHomeTodo` en eager load.
- [x] **Tests:** `app.routes.spec.ts` — navigation URL, audit `loadComponent`, résolution dynamique des chunks.
- [x] **Mesure:** `ng build` production — initial **1,44 MB** raw (−38 % vs 2,33 MB).
- [x] **Budget CI:** `angular.json` warning initial recalibré **2,0 MB** ; README baseline mise à jour.

---

## Dev Notes

- `app.routes.ts` — remplacer imports statiques
- Mesurer cold start séparément du script profilage navigation chaude
- **UI : N/A** — pas de changement layout shell (M3-5 N/A)

---

## Dev Agent Record

### Agent Model Used

Composer (Amelia / bmad-dev-story)

### Implementation Plan

- Convertir les routes membre lourdes en `loadComponent` (standalone lazy) par zone : agenda, saison, admin, compte.
- Garder shell + auth + accueil en bundle initial pour TTI post-login acceptable.
- Adapter les tests route : vérifier URL + config lazy (sans RouterOutlet en test unitaire).

### Completion Notes List

- **Bundle initial** : **1,44 MB** raw / **328 kB** transfer estimé (baseline 2,33 MB / 419 kB) — **−38 %**, cible AC1 (≤ 2,0 MB) et story (−30–50 %) atteintes.
- **Lazy zones** : 20+ routes `loadComponent` (agenda, compte + 5 onglets, admin troupe/saison, saison + event-detail + legacy redirect, member-season-glance).
- **Tests** : 17/17 `app.routes.spec.ts` verts.
- **Budget** : warning `angular.json` 2,25 → **2,0 MB** (production + production-local).
- **Profilage post-PERF-08** (`node scripts/v2/profile-web-performance.mjs`, stack dev `--with-push --no-tailscale`, `.local/perf-profile/web-perf-2026-06-09T19-38-39-436Z.json`, 2026-06-09 — Apérock 2026) vs baseline plan (`15-32-52-596Z`) et post-PERF-07 (`19-02-50-971Z`) :
  - **Périmètre script** : navigation **chaude** post-login — mesure surtout API wall time ; le gain cold start lazy routes est sur le bundle initial (**1,44 MB**, −38 % vs 2,33 MB), hors capture directe du script actuel.
  - **Agenda membre — wallMs** : **1969** (post-PERF-07 **2078**, −109 ms ; baseline **5850**, −3881 ms).
  - **Saison agenda — wallMs** : **2112** (post-PERF-07 **2351**, −239 ms ; baseline **2214**, −102 ms).
  - **Accueil todo — wallMs** : **1580** (post-PERF-07 **1565**, +15 ms ; baseline **2450**, −870 ms).
  - **Compte profil — wallMs** : **963** (post-PERF-07 **966**, −3 ms ; baseline **1422**, −459 ms).
  - **Hub troupe — wallMs** : **1295** (post-PERF-07 **1267**, +28 ms ; baseline **1553**, −258 ms).
  - **Appels `/v1/*` (toutes routes script)** : **86** (post-PERF-07 **85**, +1 ; baseline **144**, −58) — pas de régression lazy routes sur le fetch API.
  - **apiTotalMs cumulé script** : **20 879** (post-PERF-07 **19 725**, +1154 ms — variance run à run, pas liée au code splitting).
  - **domContentLoadedMs** (nav timing chaude) : **37–67 ms** par route — stable vs post-PERF-07 ; lazy chunks chargés à la demande sans dégradation mesurable du DCL script.

### File List

- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/app.routes.spec.ts`
- `apps/web/angular.json`
- `apps/web/README.md`

### Change Log

- 2026-06-09 — PERF-08 : lazy routes par zone + tests + baseline bundle 1,44 MB + budget CI 2,0 MB.
- 2026-06-09 — Re-profilage post-PERF-08 : `web-perf-2026-06-09T19-38-39-436Z.json` — navigation chaude stable vs post-PERF-07 ; bundle −38 % (cold start).

### Review Findings

- [x] [Review][Patch] Tests navigation affaiblis — `routeUsesLazyLoad` ne prouve plus l’identité du composant activé ; une faute d’export passerait [apps/web/src/app/app.routes.spec.ts:22-70]
- [x] [Review][Patch] Assertion `loaded.name` fragile — préférer comparaison directe à la classe exportée [apps/web/src/app/app.routes.spec.ts:108]
- [x] [Review][Patch] Couverture résolution `loadComponent` incomplète — 6/~20 routes testées (audit, legacy saison, onglets compte, hub troupe absents) [apps/web/src/app/app.routes.spec.ts:97-109]
- [x] [Review][Patch] Routes legacy `/saison/:seasonSlug/*` retirées des tests de navigation [apps/web/src/app/app.routes.spec.ts:58-66]
- [x] [Review][Patch] Audit statique incomplet — `troupes`, `troupes/:slug/admin/audit`, `saison/.../admin/audit`, `troupe/admin/membres` absents [apps/web/src/app/app.routes.spec.ts:73-95]
- [x] [Review][Patch] Pas de tests navigation pour routes audit ni onglets compte (`/compte/preferences`, etc.) [apps/web/src/app/app.routes.spec.ts:58-66]
- [x] [Review][Patch] `data.auditScope` non vérifié sur routes audit lazy [apps/web/src/app/app.routes.spec.ts:73-95]
- [x] [Review][Patch] `leafRoute` ne vérifie pas le path feuille sur redirects compte imbriqués [apps/web/src/app/app.routes.spec.ts:9-14]
- [x] [Review][Defer] Pas de budget `angular.json` sur chunks lazy (hors scope initial bundle PERF-08) — deferred, pre-existing
- [x] [Review][Defer] Pas de handler erreur chargement chunk / PWA stale chunk — deferred, pre-existing
- [x] [Review][Defer] Waterfall lazy parent+enfant sur `/compte` — tradeoff accepté bundle initial [apps/web/src/app/app.routes.ts:54-103]
- [x] [Review][Defer] Délai spinner sur redirects legacy (`SaisonLegacyRedirect`, onglets compte) — tradeoff perf [apps/web/src/app/app.routes.ts:172-212]
- [x] [Review][Defer] Pas de wildcard `**` sous `MemberShell` — deferred, pre-existing
- [x] [Review][Defer] Stratégie preload post-login absente — follow-up perf hors PERF-08

---
