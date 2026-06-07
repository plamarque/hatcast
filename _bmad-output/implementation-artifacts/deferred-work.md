# Deferred work (actif)

**Hygiène DOC-1** — MAJ **2026-06-09**. **T0** et **T1** clôturés ; restant ordonné **coût vs bénéfice** — voir [`deferred-triage-2026-06.md`](deferred-triage-2026-06.md) §3–4. Historique : [`deferred-work-archive.md`](deferred-work-archive.md).

**Contexte PLAN :** release train **V2.0.x** OK ; **M4** audience reportée (~août 2026) ; vague **2.1.0** (démo commission) en cours.

**Règle :** nouvelle revue → entrée ici si **T0–T2** ; sinon archive + ligne triage.

---

## Fermé / accepté (ne pas rouvrir)

| ID / story | Clôture | Note |
|------------|---------|------|
| **DW-101/102** | 2026-06-04 | Story **3.22** — coach match API + seeds |
| **DW-103** | accepté | Pas de backfill matchs historiques |
| **DW-104** | 2026-06-08 | Story **1.8** — retry signup + login recovery |
| **DW-105** | 2026-06-07 | Spec **dw-105** — IdP `deleteUser` post-commit (`AFTER_COMMIT`) |
| **DW-106** | 2026-06-07 | Spec **dw-106** — intent `COMPOSITION_SHARED` + `toCategory()` ; dispatch **8.4** reste à câbler |
| **DW-107** | 2026-06-08 | Story **8.5b** — garde `AssigneePresenceReminderJob` |
| **DW-111** | 2026-06-05 | Replay migration × ≥3 (PO) |
| **DW-112** | 2026-06-07 | Deploy `--env-vars-file` YAML |
| **DW-113** | 2026-06-08 | **Obsolète** — hub sans prefs troupe (**17.29**) |
| **DW-114** | 2026-06-07 | Post-save re-check `reinclude` → 409 ; fenêtre commit-edge acceptée |
| **6.17** | 2026-06-04 | Annonces + `lastNotifiedAt` ; **DW-108** partiel |
| **ops-8**, **ops-10** | 2026-06-04/05 | Prod domaine + email |
| **19.1**, **mig-7** | 2026-06-04/06 | ADR tirage + backfill genre V1 |
| **2.12***, **2.21** | 2026-06-05/06 | Genre + carnet externes |
| **3.8c/d**, **3.23–3.25** | 2026-06-06 | Roster UX + invitations scope |
| **6.18**, **6.19**, **6.21**, **6.22** | 2026-06-05/07 | Aide statut, calendrier, mixité, unlock |
| **Équipe SCSS** | 2026-06-06 | Budget `anyComponentStyle` OK (`f418887e`) |

*Clôtures T0/T1 + defers specs → archive § hygiène 2026-06-09.*

---

## Matrice rapide

| Tier | Quand agir | IDs (ordre coût/bénéfice) |
|------|------------|---------------------------|
| **T0** | — | *(vide)* |
| **T1** | — | *(vide)* |
| **T2** | Avant **M4** (~août) | **DW-118** → **DW-119** → **DW-109** → **DW-110** |
| **T3** | Backlog 2.1.0+ | **DW-117** → **DW-116** → **DW-115** → **DW-122** → **DW-123** → **DW-124** → **DW-125** → **DW-121** → **DW-120** ; **DW-108** accepté |

---

## T2 — Avant M4 (coût vs bénéfice)

| # | ID | Coût | Bénéfice | Notes |
|---|-----|------|----------|-------|
| 1 | **DW-118** | **S** | Modéré | SQL backfill `removal_source` (V38) — livrable court, audit retrait saison |
| 2 | **DW-119** | **S** | Modéré | Vérif titres exotiques MIG-2 (`translate` vs `slugify` NFD) — script/doc |
| 3 | **DW-109** | **M** | Élevé si trigger | Rejects ciblés MIG-3 (`comment`, `role_key`) — évite transaction entière KO |
| 4 | **DW-110** | **M** | Modéré | Orphelines re-run MIG-3 sans reset — confiance staging ; prod = apply unique |

### DW-118 — V38 backfill `removal_source`

- **Fichier :** migration Flyway V38 (à confirmer en base).
- **Risque :** faible si aucune row `REMOVED` pré-MIG.

### DW-119 — Slugs exotiques

- **Risque :** faible (titres atypiques) ; **impact :** URLs post-import MIG-2.

### DW-109 — Validation MIG-3

- **Fichier :** [`maliceAvailabilityCompositions.js`](../../scripts/v1/maliceAvailabilityCompositions.js).

### DW-110 — Orphelines re-run MIG-3

- Replay gate déjà passé ; priorité **après** DW-109/118/119.

---

## T3 — Backlog confort (coût vs bénéfice)

| # | ID | Coût | Bénéfice | Notes |
|---|-----|------|----------|-------|
| 1 | **DW-117** | **XS** | Faible | Token `loadGlance()` sans génération — quick fix |
| 2 | **DW-116** | **S** | Modéré | Signal UX event picker à 250 résultats |
| 3 | **DW-115** | **S** | Faible | Race grant organisateur (500 vs 200) — UPSERT |
| 4 | **DW-122** | **S** | Faible | Prebundling cache dev (`ng serve` e2e) — perf dev only |
| 5 | **DW-123** | **M** | Modéré | Budget bundle initial prod (~2,33 MB) — impact **large** |
| 6 | **DW-124** | **M** | Faible | SCSS composants lourds (`member-home-todo`, `member-nav`, …) |
| 7 | **DW-125** | **M** | Faible | Découpage optionnel `event-equipe-tab` |
| 8 | **DW-121** | **L** | Faible | Sass `@import` → `@use` (échéance Dart Sass 3.0 lointaine) |
| 9 | **DW-120** | **L** | Modéré | Suite web globale rouge → **ISSUES.md** / gate CI |
| — | **DW-108** | — | ↓ | **Accepté** post-6.17 — `notifiedCount` ≠ SENT ; rouvrir seulement si PO exige **NFR-R2** strict |

---

## Liens normatifs

| Sujet | Où tracer |
|-------|-----------|
| Bugs confirmés | [`ISSUES.md`](../../ISSUES.md) (ex. BUG-008 push prefs) |
| Réserve produit historique | PLAN § iso-V1, DW-020–021 (triage mai) |
| Epic 19 formules tirage | `sprint-status.yaml` — **reporté** post-2.1.0 |
| Dispatch brouillon partagé | Story **8.4** (hors DW-106 — mapping prefs déjà fait) |
