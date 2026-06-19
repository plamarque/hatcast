---
baseline_commit: a7393d774ea27f46cd1cdea0e5ca1deeec3fad24
---

# Story OPS-9 : PostHog on `hatcast.app` (FR47 baseline)

Status: done

**Story ID:** OPS-9  
**Story key:** `ops-9-posthog-hatcast-app`  
**Priority:** P1 (V2.0.0 — **non bloquant M4**, post-**OPS-8**)  
**Growth:** [G-005](../planning-artifacts/growth-backlog.md)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave F (step 10)  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) § Wave F  
**Epic alignment:** Epic **11.1** (FR47 subset only — not full Epic 11)  
**Runbook:** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7.4–7.5 (extend)  
**Depends on:** [ops-8-prod-domain-hatcast-app.md](ops-8-prod-domain-hatcast-app.md) (`https://hatcast.app` live)  
**Related (out of scope):** [ops-10-email-hatcast-app.md](ops-10-email-hatcast-app.md), Epic **11** dashboards for troupes

---

## Story

As a **product operator**,  
I want **anonymized workflow analytics** captured via **PostHog EU** behind **`https://e.hatcast.app`**,  
so that **FR47 leading indicators** (availability delay, confirmation delay, notification follow-through) can be measured on production without exposing PII to troupe admins or ad-blocked direct calls to `posthog.com`.

---

## Acceptance Criteria

### Infrastructure & SDK bootstrap

1. **Given** a **PostHog Cloud EU** project exists, **when** ops configures the org **managed reverse proxy**, **then** subdomain **`e.hatcast.app`** is registered in PostHog and a **CNAME** in Cloudflare points to PostHog’s generated `*.proxy-eu.posthog.com` (or equivalent EU target shown in PostHog UI). [Source: SCP § OPS-9; DEPLOY_V2_CLOUD_RUN §7.4]

2. **Given** the CNAME for `e`, **when** saved in Cloudflare, **then** the record is **DNS only (grey cloud)** — **not** proxied orange — until PostHog reports proxy status **live** (managed proxy SSL). [Source: SCP; PostHog managed reverse proxy docs]

3. **Given** production build on **`https://hatcast.app`**, **when** `posthogApiKey` is injected at build time, **then** `posthog-js` initializes with **`api_host: 'https://e.hatcast.app'`** and **`ui_host: 'https://eu.posthog.com'`** (EU UI/toolbar). [Source: PostHog reverse proxy docs]

4. **Given** `posthogApiKey` is **empty** (local dev, CI unit tests, or staging without key), **when** the SPA boots, **then** PostHog **does not** initialize and **no** network calls are made to `e.hatcast.app` or `posthog.com`. [Source: privacy-by-default; NFR-S2]

5. **Given** maintainers read ops docs, **when** they follow the runbook, **then** `DEPLOY_V2_CLOUD_RUN.md` documents: EU project creation, managed proxy steps, grey-cloud rule, GitHub secret **`HATCAST_POSTHOG_PROJECT_API_KEY`**, build-arg wiring, dashboard access, and staging vs prod policy. [Source: ops-6 doc AC pattern]

### FR47 event catalog (client-side baseline)

6. **Given** availability window is open (`availabilityOpenedAt` set) and a member submits availability for the **first time** on that event (self or proxy), **when** `PUT …/availability` succeeds, **then** capture event **`availability_first_submission`** with properties: `event_id`, `season_id`, `troupe_id`, `is_demo_troupe` (boolean), `is_proxy` (boolean), `opened_at` (ISO from event), `submitted_at` (client ISO). **Do not** send email, display name, or comment text. [Source: Epic 11.1 AC1; FR47]

7. **Given** an organizer validates composition, **when** `POST …/composition/validate` (or equivalent client success path) returns OK, **then** capture **`composition_validated`** with `event_id`, `season_id`, `troupe_id`, `is_demo_troupe`, `validated_at` (client ISO). [Source: Epic 11.1 AC2 partial; FR47]

8. **Given** a validated composition, **when** all **required** assigned slots reach confirmed state (same condition as UI “complete confirmations” / lifecycle complete for confirmations), **then** capture **`composition_all_confirmations_received`** once per event with `event_id`, `season_id`, `troupe_id`, `is_demo_troupe`, `validated_at` (from composition if available), `completed_at` (client ISO). [Source: Epic 11.1 AC2; FR47]

9. **Given** a user lands on event detail from a **notification deep link** (URL patterns already emitted by API: `/saison/:seasonSlug/event/:eventSlug` with `?tab=dispos`, `?tab=equipe`, or `?showConfirm=true`), **when** the route activates, **then** capture **`notification_link_opened`** once per navigation with `event_id`, `season_id`, `troupe_id`, `is_demo_troupe`, `link_tab` (`dispos` | `equipe` | `confirm` | `other`). **Do not** add new query params to email templates in this story unless required for detection. [Source: `NotificationPayloadBuilder.kt`; Epic 11.1 AC3; FR47]

10. **Given** `is_demo_troupe === true` (troupe id equals `environment.demoTroupeId`), **when** any FR47 event fires, **then** events are still sent (for debugging) but **`is_demo_troupe: true`** is set so PostHog dashboards **exclude** demo from pilot KPIs (document filter: `is_demo_troupe != true`). [Source: FR64; Story 18.3 AC8; ADR-0015]

11. **Given** a troupe **ordinary member**, **when** they use the app, **then** there is **no** in-app analytics UI and **no** new API exposing analytics (MVP: operators use PostHog project only). [Source: Epic 11.1 AC4; FR47]

### Privacy & quality

12. **Given** PostHog person profiles, **when** identifying users, **then** use **opaque** `distinct_id` = internal `userId` UUID only — **never** email, name, avatar URL, or availability comment as person properties. [Source: NFR-S2; FR47 anonymized]

    > **Dérogation M4 (Story 11.2)** : pour le cutover La Malice, person properties `email` et `name` (depuis `displayName`) sont envoyées via `identify` après `/v1/auth/me`, avec accès projet PostHog EU limité aux opérateurs produit. Règle par défaut post-cutover : réévaluer retrait des person properties dans une story de durcissement si l’audience PostHog s’élargit.

13. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` runs, **then** unit tests cover: disabled init without key, capture helpers no-op when disabled, demo flag on capture, and at least one FR47 hook (mock PostHog client). [Source: project-context.md]

14. **Given** production deploy, **when** operator smoke-tests, **then** browser network tab shows events to **`https://e.hatcast.app`** (not `eu.i.posthog.com` directly) and PostHog **Live events** receives test captures. Record steps in Dev Agent Record. [Source: SCP acceptance]

**Explicit non-goals (this story):** Session replay, feature flags, server-side PostHog, troupe-visible dashboards (Epic 11 remainder), bulk import of legacy V1 `navigationTracker` events, changing notification URL schema.

**Product coverage:** FR47 baseline (G-005); defers full Epic **11** to post-V2.0.0.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — No new member-facing screens. Instrumentation is invisible (no banners, toggles, or chrome). Existing Material surfaces unchanged except hooking analytics in existing flows.

---

## Tasks / Subtasks

- [x] **PostHog EU project & proxy (AC: 1–2, 5, 14)** — manual ops (can run before code merge)
  - [ ] Create **EU** cloud project; note project API key (public ingest key). *(opérateur — voir §7.5)*
  - [ ] Organization → **Proxy** → **New managed proxy** → subdomain `e.hatcast.app` (subdomain label `e` only in DNS). *(opérateur)*
  - [ ] Cloudflare CNAME `e` → PostHog target; **grey cloud** until status **live**. *(opérateur)*
  - [x] Document in `DEPLOY_V2_CLOUD_RUN.md` §7.5 (new subsection after §7.4).

- [x] **Dependency & env contract (AC: 3–4, 5)**
  - [x] Add `posthog-js` to `apps/web/package.json` (pin current stable; record version in Dev Agent Record).
  - [x] Extend `environment.ts` / `environment.development.ts` with:
    - `posthogApiKey: string` (empty default in dev)
    - `posthogApiHost: string` (default `'https://e.hatcast.app'` in prod template; empty or localhost-safe in dev)
    - `posthogUiHost: string` (default `'https://eu.posthog.com'`)
  - [x] Extend [`apps/web/scripts/inject-google-client-id.mjs`](../../apps/web/scripts/inject-google-client-id.mjs) to inject `HATCAST_POSTHOG_PROJECT_API_KEY` → `posthogApiKey` (optional — empty skips init).
  - [x] Docker / CI: add build-arg + secret `HATCAST_POSTHOG_PROJECT_API_KEY` on **production** (and optionally **staging** if PO wants staging project — default **prod only**).
  - [x] `.env.example` — comment-only lines for local optional key (no values).

- [x] **Analytics module (AC: 3–4, 12)**
  - [x] Create `apps/web/src/app/core/analytics/posthog-browser.client.ts` — lazy `import('posthog-js')`, init once, `capture()`, `identify(userId)`, `reset()` on logout.
  - [x] Create `apps/web/src/app/core/analytics/product-analytics.service.ts` — `@Injectable({ providedIn: 'root' })` facade used by features; guards when disabled.
  - [x] Create `apps/web/src/app/core/analytics/fr47-event-names.ts` — constants for event names above.
  - [x] Wire init in `app.config.ts` via `provideAppInitializer` **or** `App` constructor — **after** auth is unnecessary for anonymous capture, but call `identify` when session user id becomes available (subscribe in service).

- [x] **FR47 hooks (AC: 6–10)**
  - [x] **AC6** — [`availability-form.ts`](../../apps/web/src/app/shared/availability/availability-form.ts): after successful `putAvailability`, if first submission for this event+subject, capture `availability_first_submission` (detect via prior state or API response flag).
  - [x] **AC7** — composition validate success path (e.g. [`event-equipe-tab`](../../apps/web/src/app/pages/event-detail/) or composition API wrapper): `composition_validated`.
  - [x] **AC8** — when UI detects all required confirmations complete (reuse lifecycle helper used for équipe tab status): `composition_all_confirmations_received` — **dedupe** with in-memory or session flag per `eventId`.
  - [x] **AC9** — [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts): on init, parse `tab` / `showConfirm` query params → `notification_link_opened` once.
  - [x] Pass `troupeId` / `is_demo_troupe` from season/event context in all captures.

- [x] **Auth lifecycle (AC: 12)**
  - [x] On login/session established: `identify(userId)` only.
  - [x] On logout: `posthog.reset()` (clear distinct_id).

- [x] **Tests (AC: 13)**
  - [x] `product-analytics.service.spec.ts` — mock posthog client.
  - [x] Optional: thin test on query-param detection for AC9.

- [x] **Docs & tracking (AC: 5, 14)**
  - [x] Update `DEPLOY_V2_CLOUD_RUN.md`, `scripts/README.md` if inject script changes.
  - [x] Set `sprint-status.yaml` `ops-9-posthog-hatcast-app` → `done` only after review.

---

## Dev Notes

### Why this story exists now

**G-005** promoted PostHog for FR47. **OPS-8** delivers `hatcast.app`, enabling branded subdomain **`e.hatcast.app`** for PostHog’s **managed** reverse proxy (grey cloud). **Epic 11.1** remains the functional spec; **OPS-9** implements the **minimum** instrumented path in `apps/web` only — no Spring dependency.

### Architecture compliance

| Topic | Requirement |
|--------|-------------|
| Region | **EU** PostHog project + `eu.posthog.com` ui_host |
| Proxy | **Managed** proxy on `e.hatcast.app`; grey cloud on CNAME |
| Ad blockers | Subdomain `e` is acceptable (avoid `analytics`, `tracking`, `posthog`) |
| PII | UUID `distinct_id` only; event properties = ids + booleans + timestamps |
| Demo | `is_demo_troupe` on every event; dashboard filter documented |
| Observability | PostHog ≠ Cloud Run logs / Neon metrics — do not merge concerns |

### File structure requirements

| Action | Path |
|--------|------|
| **NEW** | `apps/web/src/app/core/analytics/*` |
| **UPDATE** | `apps/web/src/app/app.config.ts` (initializer) |
| **UPDATE** | `apps/web/src/environments/environment*.ts` |
| **UPDATE** | `apps/web/scripts/inject-google-client-id.mjs` |
| **UPDATE** | `apps/web/package.json` + lockfile |
| **UPDATE** | `.github/workflows/deploy-v2-cloud-run.yml` (build-arg prod) |
| **UPDATE** | `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` §7.5 |
| **UPDATE** | `.env.example` (names only) |
| **DO NOT** | `services/api/` unless a follow-up story adds server events |

### Instrumentation map (reuse existing flows)

```
availabilityOpenedAt set (organizer)     →  (optional future: availability_window_opened)
First successful PUT availability/me     →  availability_first_submission  (AC6)
validateComposition OK                   →  composition_validated            (AC7)
All required slots confirmed             →  composition_all_confirmations_received (AC8)
EventDetail with ?tab= | ?showConfirm=   →  notification_link_opened       (AC9)
```

Notification URLs today (no template change): see [`NotificationPayloadBuilder.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) — paths under `/saison/{seasonSlug}/event/{eventSlug}`.

### Cloudflare alternative (document only)

If **zone hold** blocks managed proxy: PostHog documents **Cloudflare Worker** proxy with **orange** cloud + Page Rules Host override — **out of scope** unless managed proxy fails; note in runbook as fallback, not default.

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web   # verify posthog-js bundles (check budget vs apps/web/README.md)
```

Manual prod smoke (AC14): login on `https://hatcast.app` → submit test availability on non-demo event → verify Live events in PostHog EU.

### Previous story intelligence

| Story | Learning |
|-------|----------|
| **OPS-8** | Prod domain + Cloudflare patterns; `e` is **separate** from apex orange proxy — grey only for PostHog CNAME |
| **OPS-6** | Build-time injection via `inject-google-client-id.mjs` + GitHub secrets is the established pattern |
| **18.3** | Demo troupe UUID `a0000001-0000-4000-8000-000000000099` — use `environment.demoTroupeId` for `is_demo_troupe` |
| **10.3** | Public ingest keys in front bundles are acceptable (same class as Firebase apiKey) |

### Git intelligence summary

Recent work: **OPS-11** release CLI, **OPS-6** changelog pipeline, staging **v2.0.0-rc.*** — follow **ops** commit scope `ops(v2):` or `feat(web):` for analytics code; docs `docs(v2):`.

### Library / framework requirements

| Package | Notes |
|---------|--------|
| `posthog-js` | Official browser SDK; use dynamic import to avoid bloating initial chunk if bundle budget tight |
| Angular **21.2** | `provideAppInitializer` from `@angular/core` |
| **No** `@angular/fire` analytics | Firebase `measurementId` in `.env.example` is V1 legacy — unrelated |

PostHog init reference (EU):

```typescript
posthog.init(apiKey, {
  api_host: 'https://e.hatcast.app',
  ui_host: 'https://eu.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: 'history_change', // SPA Angular — $pageview for Web analytics health + FR47 workflow events
  persistence: 'localStorage+cookie',
})
```

### Latest technical information (2026)

- PostHog **managed reverse proxy** is free on Cloud Cloud; requires **grey cloud** on DNS provider when using managed mode.
- Must set **both** `api_host` (your subdomain) and `ui_host` (EU app host).
- Subdomain must avoid blocker keywords (`analytics`, `tracking`, `posthog`, `ph`).
- EU ingest may use `eu-proxy-direct.i.posthog.com` only for **self-hosted** CF Worker mode — **prefer managed proxy** per PLAN/SCP.

### Project context reference

- [project-context.md](../../project-context.md) — scope, tests, commits
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — N/A for invisible instrumentation
- [prd.md](../planning-artifacts/prd.md) FR47, FR64, NFR-S2
- [epics.md](../planning-artifacts/epics.md) Epic 11.1

### Explicit non-goals

- Epic **11** dashboards for troupe admins
- PostHog session replay, surveys, feature flags
- Backend/server-side capture
- GDPR DPIA / DPA legal sign-off (ops product decision — document EU region only)
- Changing email/push URL schemes for `src=notif` tracking

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| OPS-8 | done | Prod domain live ; `e.hatcast.app` CNAME configured |
| 11.1 | backlog | Functional spec; OPS-9 implements subset |
| 18.3 | done | Demo exclusion rules |

---

## Dev Agent Record

### Agent Model Used

Composer (bmad-dev-story)

### Completion Notes List

- `posthog-js` **^1.379.2** ; lazy init via `posthog-browser.client.ts` ; `ProductAnalyticsService` facade.
- FR47 events wired : `availability_first_submission`, `composition_validated`, `composition_all_confirmations_received` (session dedupe), `notification_link_opened`.
- Build inject : `HATCAST_POSTHOG_PROJECT_API_KEY` → `environment.posthogApiKey` ; Docker + `deploy-v2-cloud-run.yml` build-arg.
- Runbook **DEPLOY_V2_CLOUD_RUN.md §7.5** (EU project, managed proxy, grey cloud, secrets, smoke AC14).
- Tests : `analytics/*` + `auth-api` (17 tests ciblés OK). Suite web complète : échecs préexistants (~79) ; pas de régression identifiée sur le périmètre analytics.
- Build prod : OK ; budget initial +28 kB (posthog-js).
- **AC14 smoke prod** : à exécuter par l’opérateur après merge + secret GitHub `HATCAST_POSTHOG_PROJECT_API_KEY` + CNAME `e` live (étapes §7.5).

### File List

- `apps/web/src/app/core/analytics/fr47-event-names.ts`
- `apps/web/src/app/core/analytics/posthog-browser.client.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.ts`
- `apps/web/src/app/core/analytics/product-analytics.service.spec.ts`
- `apps/web/src/app/core/analytics/notification-link-tab.ts`
- `apps/web/src/app/core/analytics/notification-link-tab.spec.ts`
- `apps/web/src/app/app.config.ts`
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/shared/availability/availability-form.ts`
- `apps/web/src/app/shared/availability/availability-moi-panel.ts`
- `apps/web/src/app/shared/availability/availability-moi-panel.html`
- `apps/web/src/app/shared/availability/event-dispos-tab.html`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `apps/web/src/environments/environment.ts`
- `apps/web/src/environments/environment.development.ts`
- `apps/web/scripts/inject-google-client-id.mjs`
- `apps/web/package.json`
- `package-lock.json`
- `Dockerfile`
- `.github/workflows/deploy-v2-cloud-run.yml`
- `.env.example`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `scripts/README.md`
- `_bmad-output/implementation-artifacts/ops-9-posthog-hatcast-app.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-04 : Story created (ready-for-dev) from stub + PLAN/SCP/Epic 11.1/ops patterns.
- 2026-06-04 : Implementation complete — PostHog FR47 baseline (web SDK, hooks, CI/docs) ; status → review.
- 2026-06-04 : Code review — AC9 MVP documenté ; AC6 agenda (availabilityOpenedAt) ; status → done.
- 2026-06-06 : `capture_pageview: 'history_change'` (était `false`) — fix Installation Health `$pageview` ; runbook §7.5 mis à jour.

---

### Review Findings

- [x] [Review][Decision] `notification_link_opened` sans signal « notification » — **Résolu (MVP)** : comportement conservé ; limite documentée dans `DEPLOY_V2_CLOUD_RUN.md` §7.5.
- [x] [Review][Patch] AC6 incomplet via modale agenda — `availabilityOpenedAt` propagé dans `AvailabilityDialog`, `openAgendaAvailabilityDialog`, `user-agenda`, `season-home`.
- [x] [Review][Defer] Bruit `package-lock.json` (version racine `0.47.1` → `2.0.0`) — hors périmètre OPS-9, à isoler au prochain bump version monorepo.
- [x] [Review][Defer] Prod sans secret `HATCAST_POSTHOG_PROJECT_API_KEY` — build réussit mais analytics désactivés silencieusement ; couvert par runbook §7.5, pas de garde CI demandée dans cette story.

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants à modifier
- [x] `npm run test` / build web mentionnés
