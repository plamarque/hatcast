---
feature_branch: feat/11-2-posthog-identify-person-properties-m4-cutover
baseline_commit: 7d3f2acbdf3e667903ef39d8e7125f53a7ed41eb
---

# Story 11.2 : PostHog identify enrichi — cutover M4 La Malice

Status: done

**Story ID:** 11.2  
**Story key:** `11-2-posthog-identify-person-properties-m4-cutover`  
**Priority:** P0 M4 (audience ~30 membres La Malice)  
**PLAN:** [PLAN.md](../../PLAN.md) § Gate M4 / § backlog **11.x**  
**Runbook:** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7.5 (extend)  
**Epic alignment:** Epic **11** (FR47 opérateurs) — complète **OPS-9** / **11.1** pour l’exploitation humaine du cutover  
**Depends on:** [ops-9-posthog-hatcast-app.md](ops-9-posthog-hatcast-app.md) (done) — SDK + FR47 baseline  
**Related:** [ops-m4-1-v1-cutover-banner.md](ops-m4-1-v1-cutover-banner.md) (comms V1) ; Epic **11** dashboards troupe (post-MVP)

---

## Story

En tant qu’**opérateur produit**,  
je veux que PostHog associe chaque membre La Malice à son **email et nom affiché** dans les profils People (tout en gardant `distinct_id` = UUID interne),  
afin de **suivre individuellement** l’adoption V2 pendant le cutover M4 (~30 utilisateurs) sans support analytics dans l’app.

---

## Acceptance Criteria

### Identify & person properties (cutover M4)

1. **Given** PostHog est activé (`posthogApiKey` non vide) et `GET /v1/auth/me` retourne une session valide, **when** `AuthApiService` applique le corps de session (`applySessionBody`), **then** `identify` est appelé avec **`distinct_id` = `user.id`** (UUID HatCast) — inchangé par rapport à OPS-9. [Source: OPS-9 AC12 baseline ; PO M4 2026-06-19]

2. **Given** la même session, **when** `identify` est émis, **then** les **person properties** incluent au minimum :
   - `email` ← `user.email` (si non null / non vide)
   - `name` ← `user.displayName` (si non null / non vide)  
   **Ne pas** envoyer `avatarUrl`, slug, ou commentaires dispo comme propriétés personne. [Source: PO M4 ; NFR-S2 dérogation cutover]

3. **Given** `email` ou `displayName` est absent (`null` / vide), **when** `identify` est appelé, **then** seules les propriétés disponibles sont envoyées ; l’appel n’est pas bloqué. [Source: robustesse session partielle]

4. **Given** un changement de session (logout, `reset()` PostHog), **when** un autre utilisateur se connecte, **then** le nouvel `identify` met à jour le profil sans fusionner les personnes (comportement `posthog.reset()` OPS-9 conservé). [Source: OPS-9 auth lifecycle]

5. **Given** PostHog désactivé (clé vide — local, CI, staging par défaut), **when** la session est établie, **then** aucun `identify` ni propriété personne est émis (no-op existant). [Source: OPS-9 AC4]

### Dérogation OPS-9 AC12 & gouvernance

6. **Given** OPS-9 AC12 (« UUID seul, jamais email/name en person properties »), **when** cette story est livrée, **then** le fichier [ops-9-posthog-hatcast-app.md](ops-9-posthog-hatcast-app.md) est **amendé** : AC12 reste la règle par défaut ; **dérogation explicite M4** — person properties `email` + `name` autorisées **uniquement** pour le cutover La Malice, avec **accès projet PostHog EU restreint** (opérateurs produit / PO, pas admins troupe). [Source: PO 2026-06-19]

7. **Given** la runbook ops, **when** un mainteneur lit §7.5, **then** la politique identify est documentée : `distinct_id` UUID ; dérogation M4 ; **ne pas** exporter person properties vers événements FR47 ; filtre dashboard `is_demo_troupe != true` inchangé. [Source: DEPLOY_V2_CLOUD_RUN §7.5]

### Tests

8. **Given** l’implémentation, **when** `npm run test -w @hatcast/web -- --watch=false` cible `product-analytics.service.spec.ts`, **then** les tests couvrent : identify avec person properties (`email`, `name`) quand activé ; omission des propriétés vides ; no-op quand désactivé ; `distinct_id` UUID seul dans le premier argument. [Source: OPS-9 AC13 pattern]

### Documentation & tracking

9. **Given** la story close, **when** on consulte [PLAN.md](../../PLAN.md), **then** § Gate M4 ou § backlog **11.x** référence **11.2** (identify enrichi pre-M4) et le lien vers cette story. [Source: PO tracking]

10. **Given** sprint tracking, **when** la story est `ready-for-dev`, **then** `sprint-status.yaml` contient `11-2-posthog-identify-person-properties-m4-cutover` avec statut cohérent. [Source: BMad workflow]

### Optionnel P1 — première session migration

11. **(P1 optionnel)** **Given** un utilisateur identifié pour la **première fois** sur V2 prod après déploiement de cette story, **when** `identify` réussit, **then** capturer **une fois** l’événement `v2_migration_first_session` avec `user_id` (= UUID, même valeur que distinct_id) et `first_seen_at` (ISO client). Dédupe via `localStorage` clé stable par `user.id` (ex. `hatcast:v2-migration-first-session:{userId}`). **Ne pas** ajouter email/name sur cet événement. [Source: PO optionnel M4]

**Explicit non-goals :** UI analytics membre ; session replay ; person properties sur événements FR47 ; élargir la dérogation au-delà du cutover M4 sans nouvelle story ; changement de `distinct_id` (email comme id).

**Product coverage:** FR47 (opérateurs) ; NFR-S2 (dérogation documentée). **UI : N/A.**

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — Instrumentation invisible ; aucun changement chrome Material.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + docs — pas d’API Spring
- [x] **PostHog client & facade (AC: 1–5)** — `posthog-browser.client.ts`
  - [x] Étendre `PostHogBrowserFacade.identify(distinctId, personProperties?)` → `posthog.identify(distinctId, props)`
  - [x] Ne passer que `email` / `name` (clés fixes) ; filtrer null/trim vide
- [x] **ProductAnalyticsService (AC: 1–5, 11)** — `product-analytics.service.ts`
  - [x] `identifyUser(userId, { email?, displayName? })` ou objet `UserSummary` partiel
  - [x] Mapper `displayName` → person property `name`
  - [x] *(P1)* `captureV2MigrationFirstSession(userId)` + dédupe localStorage
- [x] **Auth wiring (AC: 1–4)** — `auth-api.service.ts`
  - [x] Dans `applySessionBody` : `identifyUser(data.user.id, { email: data.user.email, displayName: data.user.displayName })`
  - [x] Appeler capture P1 après identify si optionnel inclus
- [x] **Tests (AC: 8)** — `product-analytics.service.spec.ts`
  - [x] Identify avec `{ email, name }` ; propriétés partielles ; disabled no-op
- [x] **Docs OPS-9 AC12 amend (AC: 6)** — `ops-9-posthog-hatcast-app.md` § AC12 + note dérogation M4
- [x] **Runbook (AC: 7)** — `DEPLOY_V2_CLOUD_RUN.md` §7.5 : identify, person properties, accès restreint EU, recette People
- [x] **PLAN.md (AC: 9)** — § Gate M4 checklist ou tableau **11.x** : ligne **11.2**
- [x] **Sprint status (AC: 10)** — `sprint-status.yaml` → `done` après review uniquement

### Review Findings

- [x] [Review][Patch] Protéger `localStorage` dans `captureV2MigrationFirstSession` [`product-analytics.service.ts:55-61`] — `getItem`/`setItem` sans `try/catch` : un `SecurityError` ou `QuotaExceededError` (Safari privé, storage bloqué) peut remonter via `identifyUser` → `applySessionBody` et perturber l’établissement de session.
- [x] [Review][Patch] `resetSession()` au changement d’utilisateur sans logout [`auth-api.service.ts:140`] — `applySessionBody` invalide déjà les caches quand `previousUserId !== data.user.id`, mais n’appelle pas `productAnalytics.resetSession()` ; risque de fuite traits PostHog entre comptes sur le même appareil (AC4).
- [x] [Review][Defer] Dédupe `localStorage` écrite avant `capture()` [`product-analytics.service.ts:60`] — deferred, P1 at-most-once ; même pattern que `sessionStorage` FR47 all-confirmations.
- [x] [Review][Defer] Pas de test intégration logout → reset → re-identify [`auth-api.service.ts:278`] — deferred, hors périmètre AC8 ; code AC4 correct.
- [x] [Review][Defer] Course multi-onglets sur première session [`product-analytics.service.ts:57`] — deferred, P1 acceptable pour cutover ~30 users.
- [x] [Review][Defer] Props personne obsolètes si email/name effacés côté API [`product-analytics.service.ts:168`] — deferred, cas rare ; PostHog ne reçoit pas d’unset explicite.
- [x] [Review][Defer] `identifyUser` no-op si PostHog pas encore initialisé [`product-analytics.service.ts:42`] — deferred, comportement OPS-9 préexistant.
- [x] [Review][Defer] Sémantique `v2_migration_first_session` = premier identify navigateur, pas première session V2 absolue — deferred, P1 documenté ; choix PO.

---

## Dev Notes

### Why this story exists now

**OPS-9** a posé PostHog FR47 avec **identify UUID seul** (AC12) pour minimiser PII dans PostHog. Pour le **cutover M4 La Malice** (~30 membres), le PO doit **reconnaître les personnes** dans PostHog People (support, adoption individuelle) sans UI in-app. La dérogation est **temporaire et gouvernée** : projet PostHog EU à accès restreint, pas exposition aux admins troupe.

### Current code state (READ before edit)

| Fichier | État actuel | Changement story |
|---------|-------------|------------------|
| [`posthog-browser.client.ts`](../../apps/web/src/app/core/analytics/posthog-browser.client.ts) | `identify(distinctId)` seul | Passer person properties au SDK |
| [`product-analytics.service.ts`](../../apps/web/src/app/core/analytics/product-analytics.service.ts) | `identifyUser(userId)` | + email/name après `/v1/auth/me` |
| [`auth-api.service.ts`](../../apps/web/src/app/core/auth/auth-api.service.ts) | `identifyUser(data.user.id)` ligne ~146 | Passer `UserSummary` champs |
| [`product-analytics.service.spec.ts`](../../apps/web/src/app/core/analytics/product-analytics.service.spec.ts) | Test UUID seul | + tests person properties |

**Session flow (à préserver) :**

```
ensureHatcastSession / getMe → fetchMe → applySessionBody
  → sessionUserSignal.set
  → productAnalytics.identifyUser(id)  ← enrichir ici
logout → productAnalytics.resetSession()
```

`UserSummary` ([`auth-api.service.ts`](../../apps/web/src/app/core/auth/auth-api.service.ts)) : `id`, `email`, `displayName` déjà disponibles — **pas** de nouvel appel API.

### PostHog identify (SDK)

```typescript
posthog.identify(user.id, {
  email: user.email ?? undefined,  // omit if empty
  name: user.displayName ?? undefined,
})
```

- **`distinct_id`** : toujours `user.id` (UUID) — **ne pas** utiliser l’email comme distinct_id (fusion comptes, régressions OPS-9).
- **Person properties** vs **event properties** : email/name **uniquement** sur `identify` ; les captures FR47 restent ids + timestamps (OPS-9).
- `person_profiles: 'identified_only'` déjà configuré — profil créé au premier `identify` enrichi.

### OPS-9 AC12 amendment (texte suggéré)

Ajouter sous AC12 dans `ops-9-posthog-hatcast-app.md` :

> **Dérogation M4 (Story 11.2)** : pour le cutover La Malice, person properties `email` et `name` (depuis `displayName`) sont envoyées via `identify` après `/v1/auth/me`, avec accès projet PostHog EU limité aux opérateurs produit. Règle par défaut post-cutover : réévaluer retrait des person properties dans une story de durcissement si l’audience PostHog s’élargit.

### Recette dashboard PostHog (opérateur — Dev Notes)

**Prérequis :** prod `https://hatcast.app` avec clé PostHog ; membre La Malice connecté ; filtre global **`is_demo_troupe != true`** sur insights workflow.

| Objectif | Où dans PostHog EU | Filtres / config |
|----------|-------------------|------------------|
| **Voir les ~30 membres** | **People** | Colonnes `email`, `name` ; recherche par email ; vérifier `distinct_id` = UUID |
| **Adoption navigation** | **Web analytics** ou **Live events** | Événement `$pageview` ; breakdown **Device type** (mobile vs desktop) |
| **Workflow dispo** | **Insights → Funnel** | Étape 1 : `$pageview` ; étape 2 : `availability_first_submission` ; fenêtre 7 j ; filtre troupe La Malice si property disponible sur events |
| **Première session V2** *(si AC11)* | **Live events** | `v2_migration_first_session` — compter personnes uniques par jour |
| **Santé install** | **Web analytics → Installation Health** | `$pageview` vert (déjà OPS-9) |

**Smoke identify (post-déploiement) :**

1. Login membre test sur prod.
2. PostHog → **People** → ouvrir la personne → vérifier `distinct_id` UUID + `email` + `name`.
3. Logout → login autre compte → deux personnes distinctes.

### Architecture compliance

| Topic | Requirement |
|--------|-------------|
| PII | Person properties limitées à `email` + `name` ; pas sur events FR47 |
| Access | PostHog EU projet restreint ; pas d’UI troupe |
| Demo | Filtre `is_demo_troupe != true` sur KPI workflow inchangé |
| Disabled | Clé vide → aucun identify (staging/local/CI) |

### File structure requirements

| Action | Path |
|--------|------|
| **UPDATE** | `apps/web/src/app/core/analytics/posthog-browser.client.ts` |
| **UPDATE** | `apps/web/src/app/core/analytics/product-analytics.service.ts` |
| **UPDATE** | `apps/web/src/app/core/analytics/product-analytics.service.spec.ts` |
| **UPDATE** | `apps/web/src/app/core/auth/auth-api.service.ts` |
| **UPDATE** | `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` §7.5 |
| **UPDATE** | `_bmad-output/implementation-artifacts/ops-9-posthog-hatcast-app.md` (AC12 amend) |
| **UPDATE** | `PLAN.md` (§ M4 / 11.x) |
| **UPDATE** | `_bmad-output/implementation-artifacts/sprint-status.yaml` (à `done` post-review) |
| **OPTIONAL** | `fr47-event-names.ts` ou constante locale si AC11 |

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false product-analytics.service.spec.ts
npm run test -w @hatcast/web -- --watch=false
```

### Previous story intelligence

| Story | Learning |
|-------|----------|
| **OPS-9** | Lazy `posthog-js` ; `ProductAnalyticsService` facade ; identify UUID ; `reset()` logout ; tests mock facade |
| **OPS-9 AC12** | Règle stricte UUID — **cette story amende** pour M4 seulement |
| **18.3** | `is_demo_troupe` sur events — ne pas confondre avec person properties |

### Explicit non-goals

- Retrait automatique des person properties post-M4 (future story)
- Person properties sur captures FR47
- Backend PostHog / server-side identify
- Dashboards in-app pour troupes (Epic 11 reste opérateur-only)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| OPS-9 | done | SDK, init, FR47, identify UUID baseline |
| 11-1 | backlog | Spec fonctionnelle FR47 ; OPS-9 + 11.2 couvrent l’essentiel opérateur |
| OPS-M4-1 | backlog | Comms V1 parallèle ; pas bloquant code |

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- `PostHogBrowserFacade.identify` accepte des person properties optionnelles (`email`, `name`).
- `ProductAnalyticsService.identifyUser(userId, { email?, displayName? })` filtre les valeurs vides et mappe `displayName` → `name`.
- P1 : `v2_migration_first_session` capturé une fois par utilisateur (dédupe `localStorage` `hatcast:v2-migration-first-session:{userId}`) ; pas d’email/name sur l’événement.
- `AuthApiService.applySessionBody` passe email + displayName après `/v1/auth/me`.
- Tests : 11/11 verts sur `product-analytics.service.spec.ts` (`ng test --watch=false --include='**/product-analytics.service.spec.ts'`).
- Docs : amend OPS-9 AC12 (dérogation M4), runbook §7.5, PLAN.md Gate M4 + tableau 11.x.
- Suite complète web : 76 échecs préexistants sur la branche (hors périmètre story) ; aucune régression sur les tests analytics.

### File List

- `apps/web/src/app/core/analytics/posthog-browser.client.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.spec.ts`
- `apps/web/src/app/core/analytics/fr47-event-names.ts`
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `_bmad-output/implementation-artifacts/ops-9-posthog-hatcast-app.md`
- `PLAN.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-19 : Story created (ready-for-dev) — identify enrichi M4 La Malice ; amend OPS-9 AC12 ; runbook §7.5.
- 2026-06-19 : Implementation complete — identify email/name, v2_migration_first_session P1, tests + docs.
- 2026-06-19 : Code review approved — patches: localStorage try/catch, resetSession on user switch.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (PO M4 / OPS-9 / FR47)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants à modifier
- [x] `npm run test` mentionné
