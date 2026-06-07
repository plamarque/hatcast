# Deferred work (actif)

**Hygiène DOC-1** — MAJ **2026-06-08**. Backlog trié **risque × bénéfice × impact** ; **T1** ordonné **coût vs bénéfice** — voir [`deferred-triage-2026-06.md`](deferred-triage-2026-06.md) §3–4. Historique : [`deferred-work-archive.md`](deferred-work-archive.md).

**Contexte PLAN :** release train **V2.0.x** OK ; **M4** audience reportée (~août 2026) ; vague **2.1.0** (démo commission) en cours.

**Règle :** nouvelle revue → entrée ici si **T0–T2** ; sinon archive + ligne triage.

---

## Fermé / accepté (ne pas rouvrir)

| ID / story | Clôture | Note |
|------------|---------|------|
| **DW-101/102** | 2026-06-04 | Story **3.22** — coach match API + seeds |
| **DW-103** | accepté | Pas de backfill matchs historiques |
| **DW-111** | 2026-06-05 | Replay migration × ≥3 (PO) |
| **DW-112** | 2026-06-07 | Deploy : `--env-vars-file` YAML (`deploy-v2-cloud-run.yml`) — plus de CSV `--set-env-vars` |
| **DW-104** | 2026-06-08 | Story **1.8** — retry signup + login recovery (compte Firebase orphelin) |
| **DW-107** | 2026-06-08 | Story **8.5b** — garde éligibilité `AssigneePresenceReminderJob` (membre inactif / participant retiré) |
| **DW-113** | 2026-06-08 | **Obsolète** — hub sans « Préférences dans cette troupe » (story **17.29**) |
| **6.17** | 2026-06-04 | Annonces + `lastNotifiedAt` ; **DW-108** partiel |
| **ops-8**, **ops-10** | 2026-06-04/05 | Prod domaine + email |
| **19.1**, **mig-7** | 2026-06-04/06 | ADR tirage + backfill genre V1 |
| **2.12***, **2.21** | 2026-06-05/06 | Genre + carnet externes |
| **3.8c/d**, **3.23–3.25** | 2026-06-06 | Roster UX + invitations scope |
| **6.18**, **6.19**, **6.21**, **6.22** | 2026-06-05/07 | Aide statut, calendrier, mixité, unlock |
| **Équipe SCSS** | 2026-06-06 | Budget `anyComponentStyle` OK (`f418887e`) |

*Détail revues D → archive § hygiène 2026-06-07 ; clôtures T0 + defers 1.8/8.5b → § 2026-06-08.*

---

## Matrice rapide (risque × bénéfice × impact)

| Tier | Quand agir | IDs |
|------|------------|-----|
| **T0** | — | *(vide — DW-104, DW-107 clôturés)* |
| **T1** | Coût **faible** → bénéfice **net** (ordre § ci-dessous) | **DW-106** → **DW-105** → **DW-114** |
| **T2** | Avant **M4** / prochain load prod (défense) | **DW-109**, **DW-110**, **DW-118**, **DW-119** |
| **T3** | Faible risque ou niche — backlog 2.1.0+ | **DW-108**, **DW-115–117**, **DW-120**, **DW-121–125** |

---

## T1 — Coût vs bénéfice (ordre d’exécution)

| # | ID | Coût | Bénéfice | Notes |
|---|-----|------|----------|-------|
| 1 | **DW-106** | **XS** | Modéré (latent) | ~1 branche `NotificationIntent.toCategory()` + test — à câbler avec intent brouillon partagé Epic 8 |
| 2 | **DW-105** | **M** | Modéré | `@TransactionalEventListener` post-commit pour `deleteIdentityPlatformUser` — [`AccountDeletionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt) |
| 3 | **DW-114** | **M–L** | Modéré | Verrou / concurrence `reinclude` vs adhésion `INACTIVE` — [`SeasonParticipantService.reinclude`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) ; auto-réparé au list |

### DW-106 — `COMPOSITION_SHARED` → `toCategory()`

- **Risque :** prefs push/email **fausses** si intent activé (latent aujourd’hui).
- **Fichier :** [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt).

### DW-105 — `deleteUser` IdP dans `@Transactional`

- **Risque :** transaction DB longue, échec Firebase = rollback ambigu.
- **Impact :** rare ; sensible RGPD (story 1.7).

### DW-114 — `reinclude` vs adhésion INACTIVE

- **Risque :** modéré — état roster incohérent transitoire si désactivation concurrente.
- **Alternative :** documenter accepté si aucun retour terrain.

---

## T2 — Avant prochaine migration prod (M4 ~août)

### DW-109 — Validation MIG-3 (`comment`, `role_key`)

- **Risque :** élevé **si** données V1 aberrantes ; **bénéfice :** rejets ciblés vs transaction entière KO.
- **Impact :** pipeline migration uniquement.
- **Fichier :** [`maliceAvailabilityCompositions.js`](../../scripts/v1/maliceAvailabilityCompositions.js)

### DW-110 — Orphelines re-run MIG-3 sans reset

- **Risque :** modéré (replay gate déjà passé ; prod = apply unique).
- **Bénéfice :** confiance re-import staging.
- **Impact :** ops migration.

### DW-118 — V38 backfill `removal_source`

- **Risque :** faible si aucune row REMOVED pré-MIG ; **bénéfice :** audit retrait saison.
- **Impact :** données importées.

### DW-119 — Slugs exotiques (`translate` vs `slugify` NFD)

- **Risque :** faible (titres atypiques) ; **bénéfice :** URLs cohérentes post-import.
- **Impact :** MIG-2 edge.

---

## T3 — Backlog confort (2.1.0+)

### Annonces & transparence

- **DW-108** — `notifiedCount` ≠ livraisons SENT réelles (**NFR-R2**). **6.17** a livré `lastNotifiedAt` + dispatch ; écart comptage **accepté** sauf demande PO. Bénéfice marginal vs effort.

### Concurrence & UX

- **DW-115** — Race grant organisateur (500 vs 200).
- **DW-116** — Event picker 250 sans signal.
- **DW-117** — `loadGlance()` sans token génération.

### Qualité & perf dev

- **DW-120** — Suite web globale rouge → **ISSUES.md** / gate CI (ne pas dupliquer par story).
- **DW-121** — Sass `@import` → `@use` (Dart Sass 3.0).
- **DW-122** — Prebundling cache dev (`ng serve` e2e).
- **DW-123** — Budget bundle **initial** prod (~2,33 MB).
- **DW-124** — SCSS composants lourds (`member-home-todo`, `member-nav`, …).
- **DW-125** — Découpage optionnel `event-equipe-tab` (maintenance).

---

## Liens normatifs

| Sujet | Où tracer |
|-------|-----------|
| Bugs confirmés | [`ISSUES.md`](../../ISSUES.md) (ex. BUG-008 push prefs) |
| Réserve produit historique | PLAN § iso-V1, DW-020–021 (triage mai) |
| Epic 19 formules tirage | `sprint-status.yaml` — **reporté** post-2.1.0 |
