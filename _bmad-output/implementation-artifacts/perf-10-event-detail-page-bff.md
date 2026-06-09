# Story PERF-10 — BFF bootstrap event-detail par onglet

**Status:** review

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
- [ ] Re-run `node scripts/v2/profile-web-performance.mjs` — delta Completion Notes.

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
