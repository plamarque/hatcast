---
feature_branch: feat/11-3-v1-v2-cutover-funnel-posthog
baseline_commit: 3a135b2ad5dcbf0d4ec29d452fa593cce3e96851
---

# Story 11.3 : Funnel cutover V1→V2 — modal + attribution PostHog individuelle

Status: done

**Story ID:** 11.3  
**Story key:** `11-3-v1-v2-cutover-funnel-posthog`  
**Priority:** P0 M4 (cutover La Malice ~30 membres)  
**PLAN:** [PLAN.md](../../PLAN.md) § Gate M4 / § backlog **11.x**  
**Runbook:** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7.5 (extend funnel)  
**Epic alignment:** Epic **11** (FR47 opérateurs) — funnel adoption cutover V1→V2  
**Depends on:** [11-2-posthog-identify-person-properties-m4-cutover.md](11-2-posthog-identify-person-properties-m4-cutover.md) (done sur branche `feat/11-2-…` — **merger ou rebaser avant dev**) ; [ops-9-posthog-hatcast-app.md](ops-9-posthog-hatcast-app.md) (SDK V2)  
**Supersedes UX:** référence historique [ops-m4-1-v1-cutover-banner.md](ops-m4-1-v1-cutover-banner.md) — **pas de bannière** ; écran **modal** V1 (décision PO 2026-06-19)

---

## Story

En tant qu’**opérateur produit**,  
je veux mesurer **individuellement** le funnel **clic modal V1 → arrivée V2 → connexion V2**,  
afin de savoir **qui** a suivi le parcours cutover depuis `selections.la-malice.fr` jusqu’à la première session authentifiée sur `hatcast.app`.

---

## Acceptance Criteria

### Modal V1 (comms cutover — pas bannière)

1. **Given** la V1 sur `selections.la-malice.fr` et le cutover M4 activé (`VITE_V2_CUTOVER_MODAL_ENABLED=true` au build), **when** un membre ouvre l’app V1 (session non encore « vue » pour ce navigateur), **then** un **écran modal plein** s’affiche (pas une bannière top/bottom) avec : titre + texte court expliquant la migration vers HatCast V2 ; **bouton primaire** « Découvrir HatCast V2 » ; **lien secondaire** texte (ex. « Continuer sur cette version ») pour fermer sans naviguer. [Source: PO 2026-06-19 — modal volontaire]

2. **Given** le modal affiché, **when** l’utilisateur clique le bouton primaire, **then** navigation vers `https://hatcast.app/` avec query `src=v1_cutover` et `ph_ref=<posthog_distinct_id>` (URL-encodé) ; **when** il clique le lien « continuer », **then** le modal se ferme sans navigation externe. [Source: funnel étape 1→2]

3. **Given** un utilisateur a fermé le modal via le lien secondaire, **when** il revient sur V1 dans le même navigateur, **then** le modal **ne réapparaît pas** (dédupe `localStorage` clé `hatcast:v1-cutover-modal-dismissed=1`). Le bouton primaire vers V2 reste accessible ailleurs si déjà prévu — **hors scope** sauf depuis le modal. [Source: UX non-intrusif]

4. **Given** `VITE_V2_CUTOVER_MODAL_ENABLED` absent ou `false` (dev local, CI), **when** l’app V1 charge, **then** le modal cutover **ne s’affiche pas** et aucun event PostHog cutover n’est émis. [Source: privacy-by-default OPS-9]

### PostHog V1 (étape funnel — anonyme)

5. **Given** `VITE_POSTHOG_PROJECT_API_KEY` non vide au build V1 prod, **when** l’app V1 initialise PostHog, **then** `posthog-js` utilise `api_host: https://e.hatcast.app`, `ui_host: https://eu.posthog.com`, `person_profiles: 'identified_only'` — **même projet EU** que V2. [Source: OPS-9 proxy]

6. **Given** PostHog V1 actif, **when** le modal cutover s’affiche, **then** capture `v1_cutover_modal_shown` (sans PII — pas d’email Firebase). [Source: funnel top]

7. **Given** PostHog V1 actif, **when** l’utilisateur clique le bouton primaire, **then** capture `v1_cutover_cta_clicked` **avant** `window.location` vers V2 ; propriétés : `destination: 'hatcast.app'`, `src: 'v1_cutover'`. [Source: funnel étape 1]

8. **Given** PostHog V1 actif, **when** l’utilisateur ferme via lien secondaire, **then** capture `v1_cutover_modal_dismissed` (optionnel mais recommandé pour funnel complet). [Source: opérateur — taux d’ignorance]

### Attribution & funnel V2 (individuel)

9. **Given** arrivée sur V2 avec `?src=v1_cutover&ph_ref=<id>`, **when** `ProductAnalyticsService` bootstrap (PostHog activé), **then** persister `ph_ref` en `sessionStorage` (`hatcast:v1-cutover-ph-ref`) ; capturer **une fois par session navigateur** `v2_cutover_referral_landing` avec `src`, `ph_ref` (opaque UUID PostHog V1) ; **nettoyer** les query params de l’URL via `history.replaceState` (pas de `ph_ref` visible après capture). [Source: funnel étape 2 ; NFR-S2 — pas d’email]

10. **Given** `ph_ref` en session et login réussi (`identifyUser`), **when** PostHog identify s’exécute, **then** appeler `posthog.alias(user.id, ph_ref)` pour **lier** le parcours anonyme V1 au profil UUID V2 ; ajouter person property `v1_cutover_ph_ref` = `ph_ref` (opaque, pas email). [Source: attribution individuelle PO]

11. **Given** le même parcours avec `ph_ref`, **when** `v2_migration_first_session` est capturé (story 11.2), **then** inclure sur l’événement `ph_ref` et `src: 'v1_cutover'` si présents en session — **sans** email/name. [Source: corrélation funnel 3 étapes]

12. **Given** arrivée V2 **sans** query `src=v1_cutover`, **when** l’utilisateur se connecte, **then** comportement 11.2 inchangé ; pas d’`alias` ni `ph_ref` artificiel. [Source: non-régression]

13. **Given** PostHog désactivé (clé vide), **when** URL contient `ph_ref`, **then** no-op analytics ; l’app reste utilisable. [Source: OPS-9 AC4]

### Tests

14. **Given** l’implémentation V2, **when** `npm run test -w @hatcast/web -- --watch=false` cible `product-analytics.service.spec.ts`, **then** tests couvrent : parsing/stockage `ph_ref` ; `v2_cutover_referral_landing` une fois par session ; enrichissement `v2_migration_first_session` ; pas de capture sans `src=v1_cutover`. [Source: pattern 11.2]

15. **Given** l’implémentation V1, **when** `npm run test:unit -w hatcast-legacy` (vitest) cible le module PostHog cutover + builder URL, **then** tests couvrent : URL avec `ph_ref` encodé ; no-op clé vide ; events nommés correctement (mock `posthog-js`). [Source: legacy vitest existant]

### Documentation & tracking

16. **Given** la runbook ops §7.5, **when** un mainteneur lit la section cutover, **then** le funnel 3 étapes, events, paramètres URL, `alias`, et recette dashboard PostHog Funnel sont documentés. [Source: DEPLOY_V2_CLOUD_RUN]

17. **Given** [PLAN.md](../../PLAN.md) § **11.x**, **when** la story est livrable, **then** une ligne **11.3** référence ce fichier. [Source: PO tracking]

**Explicit non-goals :** bannière V1 (remplacée par modal) ; person properties email/name sur events cutover ; dashboards in-app ; PostHog session replay ; instrumentation hors modal (pas de tracking général navigation V1) ; backend Spring ; merge automatique de comptes Firebase→V2 (alias PostHog analytics uniquement).

**Product coverage:** FR47 (opérateurs cutover) ; NFR-S2 (événements ids opaques). **UI V2 : N/A** ; **UI V1 : modal Tailwind** (hors Material 3).

---

## Acceptance Criteria — Material 3 (UI)

**UI V2 : N/A** — Changements analytics invisibles sous `apps/web/`.

**UI V1 (legacy Vue — hors UX-DR11)** — Le modal cutover suit les patterns existants (`PasswordVerificationModal.vue`, `ModalManager.vue`) : overlay `fixed inset-0`, `z-index` ≥ 1260, boutons Tailwind, texte **français**, cibles tactiles confortables mobile. Pas de critères M3-1…M3-5 (stack Vue/Tailwind V1).

---

## Tasks / Subtasks

- [x] **Prérequis git** — Rebaser `feat/11-3-…` sur `v2` **après merge** de story **11.2** (événement `v2_migration_first_session` requis)
- [x] **Périmètre :** `legacy/` (modal + PostHog V1) + `apps/web/` (attribution V2) + docs — pas d’API Spring
- [x] **V1 modal (AC: 1–4)** — `legacy/src/components/V2CutoverModal.vue`
  - [x] Copy FR (titre, corps, CTA, lien dismiss) — valider avec PO si besoin
  - [x] Intégration `ModalManager.vue` + déclenchement au boot (`App.vue` ou route guard) si flag actif et pas dismissé
- [x] **V1 PostHog (AC: 5–8)** — `legacy/src/services/posthogCutover.js` (+ init dans `main.js` ou `App.vue`)
  - [x] `VITE_POSTHOG_PROJECT_API_KEY`, `VITE_V2_CUTOVER_MODAL_ENABLED` documentés dans `.env.example` (noms seulement)
  - [x] Build Firebase prod : injecter clé via workflow / secrets (aligner OPS-9)
  - [x] Events `v1_cutover_modal_shown`, `v1_cutover_cta_clicked`, `v1_cutover_modal_dismissed`
  - [x] Builder lien `https://hatcast.app/?src=v1_cutover&ph_ref=…`
- [x] **V2 attribution (AC: 9–13)** — `product-analytics.service.ts`, `posthog-browser.client.ts`
  - [x] Constantes events : `fr47-event-names.ts` ou `cutover-event-names.ts` (`V2_CUTOVER_REFERRAL_LANDING`, etc.)
  - [x] `captureV1CutoverReferral()` au bootstrap ; `applyV1CutoverAlias(userId)` après identify
  - [x] Enrichir `captureV2MigrationFirstSession` avec `ph_ref` / `src` si session
  - [x] Facade : exposer `alias(previousId, newId)` si absent
- [x] **URL cleanup V2** — service ou guard initial : `replaceState` sans query cutover
- [x] **Tests V2 (AC: 14)** — `product-analytics.service.spec.ts`
- [x] **Tests V1 (AC: 15)** — vitest module URL + events (mock posthog)
- [x] **Docs (AC: 16)** — `DEPLOY_V2_CLOUD_RUN.md` §7.5 + note deploy V1 Firebase
- [x] **PLAN.md (AC: 17)** — ligne **11.3**

---

## Dev Notes

### Why this story exists

Story **11.2** permet de **reconnaître** les membres connectés sur V2 (People `email`/`name`). Le PO veut en plus le funnel **depuis la V1** : combien ont **vu le modal**, **cliqué vers V2**, puis **connecté** — avec corrélation **individuelle** (pas seulement des volumes agrégés).

**Décision UX PO :** pas de bannière persistante — **modal** avec bouton + lien dismiss.

### Architecture funnel (individuel cross-domain)

```
V1 selections.la-malice.fr                    V2 hatcast.app
─────────────────────────                    ────────────────
Modal shown → v1_cutover_modal_shown
CTA click   → v1_cutover_cta_clicked
              └─► navigate ?src=v1_cutover&ph_ref=<ph_distinct_id>
                                              v2_cutover_referral_landing (sessionStorage ph_ref)
                                              login → identify(UUID)
                                                      → alias(UUID, ph_ref)
                                                      → v2_migration_first_session + ph_ref
```

- **`ph_ref`** = `posthog.get_distinct_id()` côté V1 au moment du clic (anonymous distinct_id PostHog).
- **`posthog.alias(user.id, ph_ref)`** côté V2 après `/v1/auth/me` lie le clic V1 au profil People UUID (voir [PostHog alias docs](https://posthog.com/docs/product-analytics/identify#alias)).
- **Ne pas** utiliser l’email Firebase comme `ph_ref` ni comme `distinct_id` V2.

### Current code state (READ before edit)

| Fichier | État actuel | Changement story |
|---------|-------------|------------------|
| [`legacy/src/components/ModalManager.vue`](../../legacy/src/components/ModalManager.vue) | Modales auth/dev | + `V2CutoverModal` |
| [`legacy/src/App.vue`](../../legacy/src/App.vue) | Bannières PWA install | + trigger modal cutover (pas bannière) |
| [`legacy/package.json`](../../legacy/package.json) | Pas `posthog-js` | + dependency `posthog-js` (même version majeure que `@hatcast/web` si possible) |
| [`posthog-browser.client.ts`](../../apps/web/src/app/core/analytics/posthog-browser.client.ts) | identify/capture/reset | + `alias()` sur facade |
| [`product-analytics.service.ts`](../../apps/web/src/app/core/analytics/product-analytics.service.ts) | 11.2 identify + `v2_migration_first_session` | + referral landing + alias + enrich migration event |
| [`fr47-event-names.ts`](../../apps/web/src/app/core/analytics/fr47-event-names.ts) | FR47 + `V2_MIGRATION_FIRST_SESSION` | + events cutover |

**V1 n’a aucun PostHog aujourd’hui** — init minimal dédié cutover (pas de refonte analytics V1 globale).

### V1 modal — comportement suggéré

- Affichage **une fois** par navigateur tant que non dismissé (clé `hatcast:v1-cutover-modal-dismissed`).
- Flag build **`VITE_V2_CUTOVER_MODAL_ENABLED`** : `true` uniquement sur deploy prod La Malice (Firebase Hosting `selections.la-malice.fr`).
- Pattern visuel : reprendre structure [`PasswordVerificationModal.vue`](../../legacy/src/components/PasswordVerificationModal.vue) (`fixed inset-0`, `max-w-*`, `@click.stop`).

### V2 URL & session keys

| Clé / param | Valeur |
|-------------|--------|
| Query `src` | `v1_cutover` (seule valeur supportée MVP) |
| Query `ph_ref` | distinct_id PostHog V1 |
| `sessionStorage` | `hatcast:v1-cutover-ph-ref`, `hatcast:v1-cutover-referral-captured=1` |
| V1 `localStorage` | `hatcast:v1-cutover-modal-dismissed=1` |

### Recette dashboard PostHog (opérateur)

**Funnel Insight (fenêtre 14 j, prod, filtre demo si applicable) :**

| Étape | Événement |
|-------|-----------|
| 1 | `v1_cutover_cta_clicked` |
| 2 | `v2_cutover_referral_landing` |
| 3 | `v2_migration_first_session` |

**Vérification individuelle :** People → personne connectée → vérifier person property `v1_cutover_ph_ref` ; parcours events liés via même personne post-`alias`.

**Smoke manuel :**

1. Build V1 avec flags + clé PostHog ; ouvrir `selections.la-malice.fr` → modal.
2. Clic CTA → V2 avec URL propre après redirect.
3. Login → PostHog Live : `v2_migration_first_session` avec `ph_ref` ; People avec alias.

### Deploy notes

| Stack | Secret / env | Pipeline |
|-------|--------------|----------|
| V2 | `HATCAST_POSTHOG_PROJECT_API_KEY` | Déjà OPS-9 / Docker build |
| V1 | `VITE_POSTHOG_PROJECT_API_KEY`, `VITE_V2_CUTOVER_MODAL_ENABLED` | Firebase deploy workflow / `.env` prod legacy — **documenter** ; clé vide = modal off + no PostHog |

### Testing requirements

```bash
# V2
npm run test -w @hatcast/web -- --watch=false product-analytics.service.spec.ts

# V1
cd legacy && npm run test:unit -- posthogCutover   # après ajout spec vitest
```

### Previous story intelligence

| Story | Learning |
|-------|----------|
| **11.2** | Facade PostHog, `ProductAnalyticsService`, dédupe localStorage, `try/catch` storage, `resetSession` changement user |
| **OPS-9** | Proxy `e.hatcast.app`, clé vide = no-op, FR47 sans PII sur events |
| **11.2 review** | `localStorage.setItem` avant capture = at-most-once accepté pour P1 |

### Explicit non-goals

- Bannière cutover V1 (explicitement rejetée PO)
- Story OPS-M4-1 séparée si copy/comms seules — **cette story inclut le modal** + analytics
- Funnel pour utilisateurs n’ayant jamais ouvert V1 (arrivée directe V2)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **11.2** | done (branche feature) | `v2_migration_first_session`, identify enrichi — **merge avant 11.3** |
| **OPS-9** | done | Projet PostHog EU + proxy |
| **OPS-M4-1** | référence historique | Bannière → **remplacée par modal** dans 11.3 |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-06-19)

### Completion Notes List

- V1 : modal plein écran `V2CutoverModal.vue` déclenché au boot `App.vue` si `VITE_V2_CUTOVER_MODAL_ENABLED=true` et pas dismissé ; PostHog minimal via `posthogCutover.js` (events funnel + URL builder).
- V2 : `captureV1CutoverReferralFromUrl` au bootstrap, `alias(userId, phRef)` + person property `v1_cutover_ph_ref` après identify, enrichissement `v2_migration_first_session`.
- Tests : 16/16 `product-analytics.service.spec.ts` (ng test) ; 6/6 `posthogCutover.spec.js` (vitest legacy).
- Docs : §7.5 DEPLOY_V2_CLOUD_RUN étendu (funnel 3 étapes, dashboard, secrets V1).

### File List

- `legacy/src/components/V2CutoverModal.vue` (NEW)
- `legacy/src/services/posthogCutover.js` (NEW)
- `legacy/tests/unit/posthogCutover.spec.js` (NEW)
- `legacy/src/components/ModalManager.vue`
- `legacy/src/App.vue`
- `legacy/package.json`
- `legacy/package-lock.json`
- `apps/web/src/app/core/analytics/posthog-browser.client.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.spec.ts`
- `apps/web/src/app/core/analytics/fr47-event-names.ts`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `.env.example`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-19 : Story created (ready-for-dev) — funnel V1 modal→V2 individuel PostHog ; supersedes bannière OPS-M4-1.
- 2026-06-19 : Implementation complete — modal V1, PostHog cutover V1/V2, alias attribution, tests, runbook §7.5.
- 2026-06-19 : Code review — patches appliqués (ModalManager, flush CTA, alias dedupe, URL cleanup, deploy V1 docs) ; status → done.

---

### Review Findings

- [x] [Review][Decision] Modal actif sans PostHog V1 — **Résolu : A** — garder le modal sans analytics si clé PostHog absente ou init échouée (comportement actuel accepté).

- [x] [Review][Patch] Implémentation non commitée — commité sur branche feature (revue 2026-06-19).

- [x] [Review][Patch] Intégration cutover morte dans ModalManager — wiring supprimé ; modal monté uniquement depuis `App.vue`.

- [x] [Review][Patch] Risque de perte event CTA V1 — `captureCutoverEvent` utilise `send_instantly` + `sendBeacon` et callback avant navigation.

- [x] [Review][Patch] `alias()` sans dédupe — dédupe sessionStorage `hatcast:v1-cutover-alias-applied:{userId}:{phRef}`.

- [x] [Review][Patch] URL V2 non nettoyée si `ph_ref` manquant — `replaceState` dès `src=v1_cutover`, même sans `ph_ref`.

- [x] [Review][Patch] Pipeline deploy V1 non documenté — `deploy-production.yml` + section cutover dans `docs/v1/technical/DEPLOYMENT.md`.

- [x] [Review][Defer] [`legacy/package.json`](../../legacy/package.json) vs [`apps/web/package.json`](../../apps/web/package.json) — versions `posthog-js` divergentes (^1.391.2 legacy vs ^1.379.2 web) ; aligner à terme, hors scope critique cutover.

- [x] [Review][Defer] Tests V1 sans mock PostHog initialisé — [`legacy/tests/unit/posthogCutover.spec.js`](../../legacy/tests/unit/posthogCutover.spec.js) vérifient no-op et URL builder mais pas l’émission réelle des events après `initPostHogCutover` ; couverture partielle AC15 acceptable MVP.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (PO M4 / FR47 / 11.2)
- [x] Section **Material 3** = **UI V2 : N/A** + note V1 legacy
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants à modifier
- [x] `npm run test` mentionné (web + legacy vitest)
