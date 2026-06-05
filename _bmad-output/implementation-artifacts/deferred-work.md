# Deferred work (actif)

**Hygiène DOC-1** — MAJ **2026-06-05** (DW-111 fermé). Items **P0–P2** encore actionnables. Historique revues : [`deferred-work-archive.md`](deferred-work-archive.md). Triage : [`deferred-triage-2026-06.md`](deferred-triage-2026-06.md) (DW-101+), [`deferred-triage-2026-05.md`](deferred-triage-2026-05.md) (DW-001–097).

**Règle :** nouvelle revue → puce ici si **P0–P2** ; sinon archive + ligne triage juin.

---

## Fermé récemment (ne pas rouvrir sans régression)

| ID / story | Clôture | Note |
|------------|---------|------|
| **3.22** | 2026-06-04 | **DW-101**, **DW-102** — coach match API + seeds |
| **DW-103** | accepté | Pas de backfill matchs historiques `coach: 0` |
| **6.17** | 2026-06-04 | `lastNotifiedAt`, dispatch Annoncer `event`, anti-spam ; **DW-108** partiel (voir P1) |
| **ops-8** | 2026-06-04 | Prod `https://hatcast.app` — gate M4 prérequis |
| **ops-10** | 2026-06-05 | Email `@hatcast.app` staging recette OK |
| **19.1** | 2026-06-04 | SPEC/ADR moteur tirage V1 — doc only |
| **DW-111** | 2026-06-05 | Replay migration × **≥3** — `migrate-from-v1.sh` + gate `validate-replay --min=3` (PO ; log hors git : `export/malice/replay-log.jsonl`) |

---

## Meta — qualité / CI

- **DW-120** — Suite `npm run test -w @hatcast/web` : échecs pré-existants (`event-detail.spec.ts`, `event-dispos-tab.spec.ts` « 100 % », mocks Firebase). Traiter via gate CI ou **ISSUES.md** — pas une section par story.

---

## P0 — Migration prod & déploiement

- **DW-109** — MIG-3 transform : `comment` > 500 / `role_key` > 64 non rejetés avant load → échec transaction entière. [`maliceAvailabilityCompositions.js`](../../scripts/v1/maliceAvailabilityCompositions.js)
- **DW-110** — Rejeu MIG-3 sans reset : orphelines `ON CONFLICT DO UPDATE` si données V1 changent entre runs.
- **DW-112** — Deploy Cloud Run : `--set-env-vars` CSV fragile (`,` / `=` dans secrets). *(ops-5 review)*

---

## P0 — Auth

- **DW-104** — Compte Firebase orphelin si `signInWithIdentityPlatformIdToken` échoue après `createUserWithEmailAndPassword`. *(1.2b)*

---

## P1 — Notifications & annonces

- **DW-106** — `COMPOSITION_SHARED` sans branche dans `NotificationIntent.toCategory()`. *(8-2)*
- **DW-107** — Rappels présence : membres troupe désactivés avec slot `CONFIRMED` encore notifiés. *(8-5 W3)*
- **DW-108** — `notifiedCount` POST = preview `notifiableCount`, **pas** le nombre réel de livraisons SENT/PARTIAL du dispatcher (**NFR-R2**). **6.17** a livré transparence `lastNotifiedAt` + dispatch Annoncer ; écart comptage dispatch **reporté** (review 6.17, pattern 6.10b). Suite possible : **6.18** ou story dédiée.

---

## P1 — Compte, admin plateforme, roster

- **DW-105** — Suppression compte : `FirebaseAuth.deleteUser` dans `@Transactional` — post-commit listener. [`AccountDeletionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/account/AccountDeletionService.kt)
- **DW-113** — Super-admin : prefs troupe sans adhésion → `PATCH memberships/me` échoue. [`troupe-hub-preferences-sheet.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts)
- **DW-114** — `reinclude` vs adhésion INACTIVE concurrente. *(3-19)*
- **DW-118** — V38 : backfill `removal_source` sur REMOVED préexistants avant prod. *(3-19)*

---

## P1 — Import / slugs

- **DW-119** — Slug import : `translate` SQL vs `slugify` Kotlin/NFD sur titres exotiques. *(17-6 / DW-031)*

---

## P2 — Concurrence & UX

- **DW-115** — Grant organisateur : race check-then-insert. [`OrganizerAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt)
- **DW-116** — Event picker max 250 sans signal. *(17-28)*
- **DW-117** — `member-season-glance` : `loadGlance()` sans token génération. *(17-27)*

---

## Deferred from: code review (6-18-aide-contextuelle-statut-composition.md — 2026-06-05)

- Pas de gestion du focus à l’ouverture du panneau reveal — hors AC story 6.18 ; amélioration a11y disclosure (pattern ARIA).

---

## Deferred from: code review of 6-19-export-calendrier-et-navigation-lieu-onglet-infos (2026-06-05)

- `::ng-deep` sur `.event-infos__menu-panel` pour `max-height` safe-area — waiver M3-5 documenté ; alternative `overlayPanelClass` globale reportée (pattern overlay existant dans le repo).

---

## Deferred from: code review of 2-12-genre-optionnel-profil-membre-api-mon-compte (2026-06-05)

- OpenAPI preferences schema not updated — story marks OpenAPI optional (17.33 precedent).
- Concurrent PATCH last-write-wins — no `@Version` on `UserEntity`; pre-existing pattern.
- NULL vs persisted `non_specified` in DB — both read as `non_specified` via `MemberGender.effective`; acceptable Wave A.
- V1 export gender dedupe tie-break order-dependent on equal `updatedAt` — low migration risk.

## Deferred from: code review of 2-12b-libelles-roles-adaptes-genre (2026-06-05)

- Couplage `rolePillLabel` → `auditRoleDisplay` pour pills de slots vides — pattern pré-existant ; refactor séparé si souhaité.

## Deferred from: code review of 2-12b + 2-12c combined (2026-06-05)

- Tables de libellés dupliquées web (`event-roles.ts`) / API (`RoleLabels.kt`) — pas de divergence constatée ; synchronisation manuelle à prévoir si tables évoluent.
- `context-breadcrumb` modifié dans le working tree — hors périmètre 2.12b/2.12c ; committer séparément.
- Couleurs hex de repli dans `user-avatar.scss` — fallbacks M3 préexistants sous les tokens genre (2.12c).
