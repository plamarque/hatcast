# Deferred work (actif)

**Hygiène DOC-1 — 2026-06-04.** Ce fichier ne contient que les items **P0–P2** encore actionnables. Tout le reste (revues code ~avr–juin 2026, ~90 sections) est dans [`deferred-work-archive.md`](deferred-work-archive.md). Triage : [`deferred-triage-2026-05.md`](deferred-triage-2026-05.md) (DW-001–097), [`deferred-triage-2026-06.md`](deferred-triage-2026-06.md) (DW-101+, fermetures H1).

**Règle :** nouvelles revues → une puce ici **si P0–P2** ; sinon directement archive + ligne dans le triage juin.

---

## Deferred from: code review of 6-17-dispatch-annonce-manuelle-transparence-dates (2026-06-04)

- Guard confirm copy refactor (`formatManualNotifyGuardAge`, event title in `guardConfirmMessage`) — hors scope story 6.17 ; tests verts ; aligner UX D7 si PO le souhaite.
- `notifiedCount` preview vs dispatch réel (DW-108 / NFR-R2) — pattern hérité 6.10b, conservé volontairement en 6.17.

---

## Meta — qualité / CI

- **DW-120** — Suite `npm run test -w @hatcast/web` : échecs pré-existants documentés dans plusieurs revues (`event-detail.spec.ts` routes canoniques, `event-dispos-tab.spec.ts` « 100 % », mocks Firebase compte). Ne pas dupliquer par story ; traiter via gate CI ou ISSUES.

---

## P0 — Migration prod & déploiement

- **DW-111** — Gates opérationnels migration : ≥3 cycles `migrate:v2:validate-replay` avec preuves (`replay-log.jsonl`) ; MIG-4 AC5/AC8 (count deplacements, Procedure C post-import). Code MIG-4 **done** — risque = process, pas régression code. *(mig-3, mig-4 reviews)*
- **DW-109** — Transform MIG-3 : champs `comment` > 500 / `role_key` > 64 non rejetés avant load → peut faire échouer toute la transaction. [`scripts/v1/maliceAvailabilityCompositions.js`](../../scripts/v1/maliceAvailabilityCompositions.js)
- **DW-110** — Rejeu MIG-3 sans reset : `ON CONFLICT DO UPDATE` laisse orphelines (slots/declines/availability) si données V1 changent entre runs.
- **DW-112** — Workflow deploy Cloud Run : construction `--set-env-vars` CSV fragile si valeur contient `,` ou `=`. *(ops-5 review)*

---

## P0 — Données template « match » (API + seeds)

→ **Story [3-22-match-template-coach-api-seeds.md](3-22-match-template-coach-api-seeds.md)** (`done` — DW-101/102 fermés 2026-06-04 ; seeds consolidés `R__seed_improbots_dev_demo.sql`)

- **DW-103** — Matchs déjà en base : écart template/slots → `detectTemplateFromRoles` → `custom` après édition d’un slot — **hors backfill massif** (AC4–5 story 3.22, accepté). *(spec-match 2026-06-04)*

---

## P0 — Auth

- **DW-104** — Compte Firebase orphelin si `signInWithIdentityPlatformIdToken` échoue après `createUserWithEmailAndPassword`. *(1.2b review)*

---

## P1 — Notifications & annonces

- **DW-106** — `COMPOSITION_SHARED` sans branche dans `NotificationIntent.toCategory()` — prefs catégorie incorrectes si intent activé. *(8-2)*
- **DW-107** — Job rappel présence : pas de garde statut participant ; membre troupe désactivé avec slot `CONFIRMED` reçoit encore des rappels. *(8-5 W3)*
- **DW-108** — `notifiedCount` sur POST annonce = preview GET, pas résultat dispatcher (**NFR-R2**, pattern 6.10b). *(6-15)* — voir aussi tech-spec 6-17 si planifié.

---

## P1 — Compte, admin plateforme, roster

- **DW-105** — Suppression compte : `FirebaseAuth.deleteUser` dans méthode `@Transactional` — optimiser post-commit (`@TransactionalEventListener`). [`AccountDeletionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/account/AccountDeletionService.kt) *(1-7)*
- **DW-113** — Super-admin sans adhésion : sheet **« Préférences dans cette troupe »** appelle `PATCH …/memberships/me` → échec. Masquer ou adapter. [`troupe-hub-preferences-sheet.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts)
- **DW-114** — Course `reinclude` participant vs désactivation adhésion concurrente : participant ACTIVE + adhésion INACTIVE possible sans verrou ; réparation au list. *(3-19)*
- **DW-118** — Migration V38 : backfill `removal_source` sur lignes REMOVED préexistantes avant prod. *(3-19)*

---

## P1 — Import / slugs

- **DW-119** — Backfill SQL slug (`translate`) vs `slugify` Kotlin/NFD — écart possible titres exotiques à l’import V1. *(17-6 / DW-031 mai)*

---

## P2 — Concurrence & UX retenus

- **DW-115** — Grant organisateur : race check-then-insert → 500 possible au lieu de 200 idempotent. [`OrganizerAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) *(3-5)*
- **DW-116** — Event picker historique plafonné à 250 (`EVENT_PICKER_MAX`) sans signal utilisateur. *(17-28)*
- **DW-117** — `member-season-glance` : `loadGlance()` sans token de génération — courses concurrentes possibles. *(17-27)*
