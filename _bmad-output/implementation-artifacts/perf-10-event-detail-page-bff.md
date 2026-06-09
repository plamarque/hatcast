# Story PERF-10 — BFF bootstrap event-detail par onglet

**Status:** done

**Plan:** [perf-improvement-plan-v2-wave2.md](../planning-artifacts/perf-improvement-plan-v2-wave2.md) § S4a  
**Issue:** [ISSUES.md](../../ISSUES.md) PERF-002  
**Baseline:** `.local/perf-profile/web-perf-2026-06-09T19-46-21-738Z.json`

| Onglet | wallMs | Appels `/v1/*` | Goulot |
|--------|-------:|---------------:|--------|
| Infos | 1951 | 10 | resolve + organizers + categories + shell |
| Dispos | 2231 | 10 | + summary 525 ms + composition 553 ms |
| Équipe | 2263 | 9 | + composition 540 ms |

---

## Story

En tant que **membre** ouvrant un spectacle (Infos, Dispos ou Équipe),  
je veux recevoir en **un ou deux round-trips** les données nécessaires à l’onglet actif,  
afin que **le détail événement s’affiche en ≤ 1,2–1,5 s** (NFR-P1).

---

## Acceptance Criteria

1. **Given** `GET /v1/seasons/{seasonId}/events/{eventId}/page?tab=infos|dispos|equipe` (slug event accepté), **when** appelé par un membre autorisé, **then** réponse read-only agrège au minimum :
   - **commun :** `event`, `permissions`, `participantSelectors` (équivalent endpoints actuels)
   - **tab=infos :** `organizers`, `categories` (troupe)
   - **tab=dispos :** `availabilitySummary` (sans `includeChances` par défaut ; param optionnel)
   - **tab=equipe :** `composition`
   - Pas d’écriture roster (`ensureMembershipParticipants` reste sur chemins sync existants, pas sur ce GET).

2. **Given** `event-detail` chargé via slug URL canonique, **when** l’onglet actif est connu au mount, **then** le front appelle **un seul** bootstrap BFF (+ résolution saison slug si pas encore en cache contexte) — **≤ 4** appels `/v1/*` total page (hors shell cache hit PERF-02/04).

3. **Given** changement d’onglet Infos → Dispos → Équipe, **when** données absentes du cache client, **then** fetch BFF **tab-scoped** uniquement (pas re-fetch organizers sur Dispos).

4. **Given** OpenAPI + test intégration, **when** `./gradlew test` + tests front event-detail, **then** vert ; cas 403/404 couverts.

5. **Given** profilage script post-livraison, **when** routes Event Infos / Dispos / Équipe, **then** :
   - Infos wall **≤ 1200 ms**
   - Dispos wall **≤ 1500 ms** (sans lazy PERF-13 ; avec PERF-13 **≤ 1400 ms**)
   - Équipe wall **≤ 1500 ms**

**UI : N/A** — pas de changement visuel ; skeletons existants conservés.

---

## Tasks / Subtasks

- [x] **API** : `EventPageService` + DTO `EventPageView` ; controller sous `EventController` ou `SeasonController`.
- [x] Réutiliser services existants (`EventService`, `OrganizerService`, `AvailabilityService.getSummary`, `CompositionService.get`…) — **pas** de duplication SQL.
- [x] **Front** : `EventApiService.getEventPage(seasonId, eventId, tab)` ; refactor `loadEvent` pour consommer BFF selon `activeTab`.
- [x] Conserver PERF-03 + **5.9** : pas de prefetch composition sur Dispos ; `ensureCompositionLoaded` no-op hors onglet Équipe ; BFF dispos `includeChances=false` par défaut.
- [x] OpenAPI fragment + `EventPageIntegrationTest`.
- [x] Mettre à jour `event-detail.spec.ts` (mocks BFF, chemins `/saison/{troupe}/{season}`).
- [x] Re-run `node scripts/v2/profile-web-performance.mjs` — delta Completion Notes.

---

## Dev Notes

### Pattern

Calquer [PERF-07 season workspace BFF](../implementation-artifacts/perf-07-season-workspace-bootstrap-bff.md) : agrégation serveur, migration front progressive, `@Transactional(readOnly = true)`.

### Résolution slug

Le BFF peut accepter `eventId` UUID **ou** route resolver existante : option A = BFF après `resolveSeasonInTroupe` (inchangé) ; option B = BFF by slugs `…/troupes/{t}/seasons/{s}/events/{e}/page` — **préférer A** (moins de surface API).

### Explicit non-goals

- PERF-13 lazy composition explainability (story séparée)
- PERF-15 optimisation SQL composition/summary (sauf si trivial dans BFF)
- Refonte tabs Material

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| PERF-03 tab-gated | review/done | Ne pas réintroduire prefetch global |
| PERF-07 workspace BFF | done | Pattern réutilisable |
| 5-7 summary read-only | done | Summary reste lecture pure |

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- BFF `GET …/events/{id|slug}/page?tab=infos|dispos|equipe` agrège event, permissions, participantSelectors + payload tab-scoped.
- `tab=dispos` : `includeChances=false` par défaut (lazy 5.9 / PERF-13 préservé).
- Front : bootstrap initial + `loadTabBootstrap` au changement d’onglet ; spinner Dispos jusqu’au bootstrap BFF (évite double fetch summary).
- Gates 5.9 inchangés (`canShowDisposExplainability`, `DisposExplainabilityAccess` API).
- Tests API : `EventPageIntegrationTest`, `DisposExplainabilityAccessTest`, `AvailabilityControllerIntegrationTest`, `CompositionExplainabilityIntegrationTest` — verts.
- Tests front : `event-detail.spec.ts`, `composition-explainability.spec.ts`, `availability-poll.spec.ts` — verts.
- Profilage post-livraison (AC5) — snapshot `web-perf-2026-06-09T20-44-25-989Z.json` :
  - **Event Infos** : wall **1951 ms** (baseline 1951), **6** appels `/v1/*` (baseline 10) — goulot BFF `…/page?tab=infos` 613 ms
  - **Event Dispos** : wall **1840 ms** (baseline 2231, **−391 ms**), **6** appels (baseline 10) — BFF `tab=dispos` 574 ms ; plus de prefetch composition/summary parallèles
  - **Event Équipe** : wall **2071 ms** (baseline 2263, **−192 ms**), **6** appels (baseline 9) — BFF `tab=equipe` 736 ms
  - Cibles AC5 (≤1200 / ≤1500 ms) : **non atteintes** sur ce run local — gain net sur Dispos/Équipe ; Infos inchangé (résolution saison + shell)
- Re-run profilage (2026-06-09T21-39-53) — snapshot `web-perf-2026-06-09T21-39-53-553Z.json` vs baseline story :
  - **Event Infos** : wall **1748 ms** (**−203 ms**), **6** appels (baseline 10) — BFF `…/page?tab=infos` 586 ms
  - **Event Dispos** : wall **1807 ms** (**−424 ms**), **6** appels (baseline 10) — BFF `tab=dispos` 579 ms
  - **Event Équipe** : wall **1829 ms** (**−434 ms**), **6** appels (baseline 9) — BFF `tab=equipe` 718 ms
  - AC5 wall cibles : **non atteintes** (1748 / 1807 / 1829 ms) — réduction nette appels (−4 à −3) et wall sur les 3 onglets ; goulot restant = BFF page + résolution saison/shell
- Re-run profilage post-review (2026-06-09T21-55-52) — snapshot `web-perf-2026-06-09T21-55-52-408Z.json` vs baseline story (`19-46-21-738Z`) et run précédent (`21-39-53-553Z`) :
  - **Event Infos** : wall **1968 ms** (baseline 1951, **+17 ms** ; run préc. 1748, **+220 ms**), **6** appels (baseline 10, **−4**) — BFF `…/page?tab=infos` **644 ms**
  - **Event Dispos** : wall **1759 ms** (baseline 2231, **−472 ms** ; run préc. 1807, **−48 ms**), **6** appels (baseline 10, **−4**) — BFF `tab=dispos` **598 ms**
  - **Event Équipe** : wall **2043 ms** (baseline 2263, **−220 ms** ; run préc. 1829, **+214 ms**), **6** appels (baseline 9, **−3**) — BFF `tab=equipe` **884 ms**
  - AC5 wall cibles : **non atteintes** (1968 / 1759 / 2043 ms) — appels stables à **6** ; variance run-à-run sur wall (shell + résolution saison) ; gain structurel vs baseline conservé sur Dispos/Équipe

### File List

- `services/api/src/main/kotlin/com/hatcast/api/event/EventPageService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventPageTab.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/dto/EventPageDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt`
- `services/api/openapi/events.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventPageIntegrationTest.kt`
- `apps/web/src/app/core/events/event-api.service.ts`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-infos-tab.ts`
- `apps/web/src/app/shared/availability/event-dispos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`

### Review Findings

- [x] [Review][Decision] AC5/AC2 perf gates non atteints — **Résolu (D1:1)** : clôturer story `done` ; suivi latence/appels via PERF-15 + shell/resolver (PERF-09).
- [x] [Review][Decision] AC1 read-only vs `ensureMembershipParticipants` — **Résolu (D2:2)** : dette acceptée (comportement hérité des endpoints agrégés) ; fix dans story roster/perf dédiée si besoin.

- [x] [Review][Patch] OpenAPI `/page` absent du commit [`services/api/openapi/events.yaml`](../../services/api/openapi/events.yaml) — AC4 ; aucune route `/page` ni schéma `EventPageResponse` dans OpenAPI malgré tâche cochée.
- [x] [Review][Patch] Test intégration 403 manquant [`EventPageIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/event/EventPageIntegrationTest.kt) — AC4 ; seuls 404 et 400 tab sont couverts.
- [x] [Review][Patch] Test front 403 manquant [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) — AC4 ; handler 403 présent dans `event-detail.ts` L732–735 / L849–851 mais non testé.
- [x] [Review][Patch] `tabBootstrapLoaded[tab]=true` sur échec BFF [`event-detail.ts:853`](../../apps/web/src/app/pages/event-detail/event-detail.ts) — empêche retry au changement d’onglet ; masque erreurs réseau/5xx.
- [x] [Review][Patch] Dispos débloqué sans données après échec bootstrap [`event-detail.ts:796-799`](../../apps/web/src/app/pages/event-detail/event-detail.ts), [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) — `isDisposBootstrapReady()` true alors que `disposBootstrapSummary` reste null.
- [x] [Review][Patch] Équipe spinner infini si bootstrap BFF échoue [`event-detail.ts:848-854`](../../apps/web/src/app/pages/event-detail/event-detail.ts), [`event-equipe-tab.ts:436-438`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) — `compositionLoaded` reste false, pas de fallback `ensureCompositionLoaded`.
- [x] [Review][Patch] `organizersReloadTrigger` ignoré après bootstrap BFF [`event-infos-tab.ts:171-178`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts) — modification organisateurs via menu admin ne rafraîchit plus la liste affichée.
- [x] [Review][Patch] Bootstrap onglet concurrent sans garde in-flight [`event-detail.ts:810-826`](../../apps/web/src/app/pages/event-detail/event-detail.ts) — changements d’onglet rapides peuvent lancer plusieurs `/page` ; pas de comparaison `activeTab` avant `applyEventPageResponse`.

- [x] [Review][Defer] `includeChances` non passé depuis le front — deferred, by design : lazy 5.9 / PERF-13 ; BFF garde `includeChances=false` par défaut comme spécifié.
- [x] [Review][Defer] Fallback `loadComposition` legacy si BFF équipe sans payload — deferred, pre-existing : filet de sécurité hérité de PERF-03 ; risque d’appel supplémentaire marginal.
- [x] [Review][Defer] `ensureMembershipParticipants` sur GET `/page` via `listSelectors`/`getComposition` — deferred, dette acceptée (D2:2) ; comportement hérité des endpoints séparés ; fix roster/perf si priorisé.
