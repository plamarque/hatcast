# Story 4.1: Public troupe directory (Annuaire)

Status: done

<!-- bmad-create-story:validate — 2026-06-01 — OK ready-for-dev ; public API + /troupes anonymous browse + hub gate -->

## Story

As a **visitor without an account**,
I want to **browse the public troupe directory** in the **Découvrir** section on `/troupes`,
so that **I can discover troupes listed publicly** (FR32, iso-V1 MEP).

## Acceptance Criteria

1. **Given** troupes marked **listed in the public directory** (`listed_in_directory = true`, not demo), **when** a visitor opens `/troupes` **without signing in**, **then** section **Découvrir** shows a responsive card grid of **only** those troupes (name, member count, troupe-wide upcoming spectacle count, logo fallback) — **no login required** to view the list (NFR-S2, FR32). [Source: epics 4.1 AC1; SCP 2026-06-02 §4.1]
2. **Given** the same public list rules, **when** the API serves directory data, **then** `GET /v1/public/troupes` is **unauthenticated**, returns a **reduced DTO** (no membership, email, join policy, or participant data) and **excludes** `is_demo = true` and `listed_in_directory = false` rows (NFR-S2). [Source: architecture §API security FR32–FR33; FR32 freemium default listed]
3. **Given** a signed-in user with troupe memberships, **when** they open `/troupes`, **then** section **Mes troupes** still loads via `GET /v1/troupes` (authenticated) **and** **Découvrir** lists public troupes **excluding** troupes they already belong to (no duplicate cards). [Source: epics 4.1 + UX Screen 2b; Story 17.3]
4. **Given** a visitor **not signed in**, **when** they activate a discover card CTA (**Voir** / primary action), **then** the app stores post-login return **`/troupes/:slug`** and navigates to **`/connexion`** (same pattern as `rememberCurrentUrlForPostLogin`). [Source: epics 4.1 AC2; `auth-redirect.helper.ts`]
5. **Given** a signed-in user **without** active membership (and not platform admin) for a discover troupe, **when** they open that troupe from **Découvrir** (after login redirect or direct click), **then** they see a **clear access-denied state** on `/troupes/:slug` — not the hub content — with copy such as « Tu n’es pas membre de cette troupe. » and links back to **`/troupes#decouvrir`** and **`/agenda`**; **no** self-join / join-request flow (SCP: out of MEP). [Source: epics 4.1 AC3; SCP 2026-06-02]
6. **Given** a signed-in **member or troupe admin** (or **platform admin** resolving the slug), **when** they open a discover card for that troupe, **then** they reach the existing hub at `/troupes/:slug` with current hub behaviour unchanged. [Source: epics 4.1 AC3; Story 17.4]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, `npm run build -w @hatcast/web`, and `./gradlew test` (API integration tests for public endpoint + authz), **then** they pass; tests cover anonymous `/troupes` discover grid, login redirect on card click, member vs non-member hub access, and public DTO leakage checks. [Source: NFR-P1; repo norms]

**Product coverage:** FR32 ; NFR-P1 ; NFR-S2. **Out of MEP:** FR33 / Story **4.2** public season/event pages ; join wizard ; admin UI to toggle directory visibility (DB default only).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** discover cards and empty states, **when** rendered, **then** reuse **`app-troupe-card`** with `mat-card`, `mat-flat-button` / `mat-stroked-button` for CTAs — no custom clickable divs for primary actions. [Source: FRONTEND_UI.md ; Story 17.3]

**M3-2. Tokens & thème** — **Given** new or touched SCSS in `troupes-list` / `troupe-card`, **when** colours are applied, **then** only `var(--mat-sys-*)` tokens (match existing `troupes-list.scss`). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** discover cards and CTAs render, **then** tap targets **≥ 48×48 dp**; card primary action has French **`aria-label`** when visible text is icon-only. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** `/troupes` remains a member surface when authenticated, **when** this story changes chrome, **then** do **not** add bottom app bar ; keep breadcrumb **Accueil › Troupes** pattern from Story 17.3 / 17.29. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — public read API, `/troupes` anonymous browse, discover cards, hub access gate refinement

### API — schema + public endpoint (AC: 1, 2, 7)

- [x] Flyway migration (next `V41__…`): add `listed_in_directory BOOLEAN NOT NULL DEFAULT TRUE` on `troupes`; backfill existing rows `TRUE`. Document in KDoc: FR32 freemium default listed ; admin opt-out UI deferred. [Source: PRD FR32]
- [x] Extend `TroupeEntity` + map column; new `PublicTroupeDirectoryItemDto` (`id`, `name`, `slug`, `activeMemberCount`, `upcomingEventCount`) — **no** membership/joinPolicy/isDemo in response.
- [x] **`upcomingEventCount` (public cards):** troupe-wide count of distinct non-archived events with `startsAt >= AgendaTimeBoundary.startOfTodayInclusive()` in non-archived seasons of that troupe — **not** user-scoped (contrast `TroupeListStatsRepository` user filter in 17.3). Add batch query on `TroupeListStatsRepository` or sibling repo.
- [x] `PublicTroupeController` (or `TroupePublicController`) at **`GET /v1/public/troupes`**: list where `listed_in_directory = true AND is_demo = false`, ordered by `name` (stable, predictable).
- [x] [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt): `permitAll()` for **`GET /v1/public/troupes` only** — keep all other `/v1/troupes/**` authenticated.
- [x] OpenAPI: document path + public DTO in [`seasons.yaml`](../../services/api/openapi/seasons.yaml) (or dedicated public fragment).
- [x] Integration tests: anonymous GET returns only listed non-demo troupes; seeded demo (`is_demo`) absent; `listed_in_directory = false` absent; response JSON has no `membership` / `email` keys.

### Web — `/troupes` page split (AC: 1, 3, 4, 7)

- [x] Refactor [`TroupesList`](../../apps/web/src/app/pages/troupes-list/troupes-list.ts): **remove** hard session gate on `ngOnInit` for the whole page.
  - Always load **Découvrir** via new `TroupeApiService.listPublicTroupes()` (no credentials required).
  - Load **Mes troupes** only when `ensureHatcastSession()` succeeds; if anonymous, show Mes troupes empty state with **Se connecter** CTA (stroked) — **do not** redirect entire page to `/connexion` on load (AC1).
- [x] Replace Découvrir stub copy in [`troupes-list.html`](../../apps/web/src/app/pages/troupes-list/troupes-list.html) with card grid using `app-troupe-card` `mode="discover"`.
- [x] Filter discover list client-side: exclude slugs present in authenticated `listMyTroupes()` result (AC3).
- [x] Loading / error states for discover independent of Mes troupes (spinner + retry).

### Web — discover card actions (AC: 4, 5, 6)

- [x] Update [`troupe-card`](../../apps/web/src/app/shared/troupe-card/): discover mode primary CTA **Voir** (not disabled « Bientôt »).
  - Inputs: optional `discoverAction: 'login' | 'open' | 'denied'` or derive in parent.
  - **login:** `(click)` → `rememberCurrentUrlForPostLogin` + navigate `/connexion` with target `/troupes/:slug`.
  - **open:** `routerLink` → `troupeHubPath(slug)` for members.
  - **denied:** navigate to hub with query `?from=discover` **or** handle via hub state — prefer explicit **`accessDenied`** signal on hub when slug resolves publicly but user lacks membership (AC5).
- [x] Extend [`TroupeHub`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts): distinguish **`accessDenied`** (known slug, no membership) from **`notFound`** (unknown slug). French copy per AC5; links to `/troupes#decouvrir` and `/agenda`.
  - Optional lightweight **`GET /v1/public/troupes/{slug}`** or filter public list client-side to know slug exists — avoid leaking private troupe existence: only slugs **in public list** get « not member » ; unknown slug stays « introuvable ».

### Explicit non-goals (scope guard)

- [x] Do **not** implement Story **4.2** public season/event pages (FR33).
- [x] Do **not** add self-join, join-request, or « Rejoindre » on discover cards (Epic 7 / FR53 — post-MVP).
- [x] Do **not** add troupe-admin UI to toggle `listed_in_directory` (column + default only ; platform PATCH deferred).
- [x] Do **not** change `GET /v1/troupes` auth contract or membership aggregation rules from Story 17.3.
- [x] Do **not** reintroduce hub footer « Explorer d'autres troupes » ([ux-design-troupe-hub.md](../planning-artifacts/ux-design-troupe-hub.md) T12 removed).

### Tests & build (AC: 7)

- [x] `troupes-list.spec.ts`: anonymous render shows discover cards without redirect ; authenticated still shows Mes troupes ; discover excludes member troupes.
- [x] `troupe-card.spec.ts` (add if missing): discover CTA login vs open.
- [x] `troupe-hub.spec.ts`: access-denied copy for non-member + public slug.
- [x] `troupe-api.service.spec.ts`: `listPublicTroupes()` no credentials.
- [x] Run web tests + build + API tests.

### Review Findings

- [x] [Review][Patch] Discover CTA does not use Material buttons as required [apps/web/src/app/shared/troupe-card/troupe-card.html:3]
- [x] [Review][Patch] Discover can briefly show joined troupes before authenticated memberships finish loading [apps/web/src/app/pages/troupes-list/troupes-list.ts:54]
- [x] [Review][Patch] Public directory lookup failure is rendered as `notFound` on the troupe hub [apps/web/src/app/pages/troupe-hub/troupe-hub.ts:193]
- [x] [Review][Patch] Async slug resolution can apply stale hub state after route changes [apps/web/src/app/pages/troupe-hub/troupe-hub.ts:174]
- [x] [Review][Patch] AC7 evidence records targeted API test only, not full `./gradlew test` [4-1-annuaire-public-des-troupes.md:217]

---

## Dev Notes

### Product and UX rules

- **MEP intent:** Minimal iso-V1 win — anonymous can **see** public troupe cards on `/troupes#decouvrir`; clicking leads to login then **hub only if member** (SCP 2026-06-02). Matches V1 « annuaire » parity without full Epic 4.
- **Vocabulary:** UI **Troupe**, **spectacle(s) à venir** on cards (Story 17.3).
- **Découvrir vs Mes troupes:** Same route, same card component; different data sources and CTAs (UX Screen 2b / Screen 9).
- **Demo troupe:** Always **hidden** from public directory (`is_demo = true`) — onboarding stays via explicit « Rejoindre la troupe de démonstration » (Story 18.4).

### Public listing predicate (FR32)

| Rule | Detail |
|------|--------|
| Default | `listed_in_directory = TRUE` for all troupes (freemium non-opt-out) |
| Exclude from API | `is_demo = true` OR `listed_in_directory = false` |
| Admin opt-out | Column only in 4.1 — no settings UI ; future story may add troupe-admin toggle |

### API contract summary

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /v1/public/troupes` | None | Directory cards for Découvrir |
| `GET /v1/troupes` | Session | Mes troupes (unchanged) |

**Security (NFR-S2):** Public DTO exposes only directory-safe fields. Never expose member emails, avatars, availability, or join policy on public endpoint.

### `/troupes` load behaviour (critical — avoid regression)

**Today (17.3):** `ensureHatcastSession()` failure → redirect whole page to `/connexion`.

**Target (4.1):**

```
Visitor (anonymous):
  └─ Découvrir: GET /v1/public/troupes → cards
  └─ Mes troupes: login prompt (no redirect on page load)

Member (authenticated):
  └─ Mes troupes: GET /v1/troupes
  └─ Découvrir: public list minus my slugs
```

### Hub access (Story 17.4 interaction)

**Today:** `TroupeContextService.resolveTroupeBySlug` returns `null` for non-members → hub shows « Troupe introuvable » (misleading for discover flow).

**Target:** After login from discover, non-member sees **access denied** state (AC5). Members/admins/platform admin keep current hub.

Edge case from UX journey: season participant without troupe membership — **still denied** on hub in 4.1 (no change to season access).

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`apps/web/src/app/shared/troupe-card/`](../../apps/web/src/app/shared/troupe-card/) | Card layout ; extend discover CTA |
| [`apps/web/src/app/pages/troupes-list/`](../../apps/web/src/app/pages/troupes-list/) | Page shell, `#decouvrir`, grid CSS |
| [`TroupeMembershipRepository.countActiveMembersByTroupeIds`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt) | `activeMemberCount` batch |
| [`AgendaTimeBoundary.startOfTodayInclusive()`](../../services/api/src/main/kotlin/com/hatcast/api/agenda/AgendaTimeBoundary.kt) | Upcoming boundary |
| [`rememberCurrentUrlForPostLogin`](../../apps/web/src/app/core/navigation/auth-redirect.helper.ts) | Discover card → login |
| [`troupeHubPath`](../../apps/web/src/app/core/navigation/troupe-routes.ts) | Member navigation |

### Implementation guardrails

- **Route order:** Keep `path: 'troupes'` before `troupes/:slug` in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts).
- **CSRF:** GET public endpoint needs no CSRF token ; do not send credentials on `listPublicTroupes()` unless CORS requires — use `{ credentials: 'omit' }` or default omit for anonymous fetch.
- **CORS:** Public GET must work from SPA origin without session cookie.
- **Performance (NFR-P1):** Single public list query + batched counts ; avoid N+1.
- **Deep link:** Preserve `id="decouvrir"` for `/troupes#decouvrir` links from [`member-home-todo`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.html) and [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md).

### Previous story intelligence (Epic 17 — directory stub)

Story **17.3** deliberately shipped Découvrir stub because no public API existed:

- « L'annuaire public arrive bientôt » placeholder — **replace** in 4.1, do not duplicate a second discover section.
- `GET /v1/troupes` must remain membership-only (17.3 Dev Notes security).
- Review deferred: session redirect test pattern — when adding anonymous browse tests, assert **no** redirect on anonymous `/troupes` load.

### Git intelligence

Recent related commits:

- `f208dfc0` — member preferences (hub/account patterns).
- `8fef9252` — hub refactor (17.29) ; `/troupes` breadcrumb uses Accueil icon.
- Epic 18 join policy — **OPEN** self-join exists but is **explicitly out of scope** for discover card actions in 4.1 (SCP: no join wizard).

Follow standalone components, signals, Vitest + `TestBed`, Kotlin integration test patterns from Epic 17/18 stories.

### Project Structure Notes

**New / touch API:**

- `services/api/src/main/resources/db/migration/V41__troupe_listed_in_directory.sql`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeController.kt` (name as implemented)
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt` — add public DTO
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/test/kotlin/.../PublicTroupeIntegrationTest.kt`

**Touch web:**

- `apps/web/src/app/core/troupes/troupe-api.service.ts` (+ spec)
- `apps/web/src/app/pages/troupes-list/*`
- `apps/web/src/app/shared/troupe-card/*`
- `apps/web/src/app/pages/troupe-hub/*` (+ spec)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 4.1]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md` — §4.1]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR32, NFR-P1, NFR-S2]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — public read APIs, FR32–FR33]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 2b, Screen 9]
- [Source: `_bmad-output/implementation-artifacts/17-3-page-troupes-mes-troupes-decouvrir.md` — stub to replace]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §1 `/troupes` + Découvrir]
- [Source: `PLAN.md` — Wave iso-V1 MEP remainder story 4.1]

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

- `./gradlew test --tests PublicTroupeIntegrationTest` — BUILD SUCCESSFUL
- `npm run test -w @hatcast/web -- --watch=false` — 782 tests passed
- `npm run build -w @hatcast/web` — OK
- `npm run test -w @hatcast/web -- --watch=false` — 790 tests passed after review fixes
- `npm run build -w @hatcast/web` — OK after review fixes
- `(cd services/api && ./gradlew test)` — FAILED before test execution on unrelated `V42__troupe_logo_description.sql` H2 syntax error (Story 4.3 worktree)
- `(cd services/api && ./gradlew clean test)` — FAILED after V42 refresh with 4 test identity conflicts (`platform-members-admin@hatcast.test` used with two Google subs)
- `(cd services/api && ./gradlew test)` — BUILD SUCCESSFUL after aligning platform admin test identity

### Completion Notes List

- API: `GET /v1/public/troupes` (unauthenticated), DTO réduit, migration `listed_in_directory`, comptages batch membres + spectacles à venir (troupe-wide).
- Web: `/troupes` charge Découvrir sans session ; Mes troupes avec CTA Se connecter si anonyme ; cartes discover avec Voir (login → `/troupes/:slug` post-login).
- Hub: état `accessDenied` distinct de `notFound` pour slug public sans adhésion ; liens `/troupes#decouvrir` et `/agenda`.
- Redirect post-login: chemins `/troupes` et `/troupes/:slug` autorisés dans `post-login-redirect-storage`.
- M3 checklist: mat-card / mat-flat-button / mat-stroked-button ; tokens existants ; pas de bottom app bar ; breadcrumb inchangé — aucune dérogation.

### File List

- `services/api/src/main/resources/db/migration/V41__troupe_listed_in_directory.sql`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeListStatsRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/PublicTroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/PublicTroupeIntegrationTest.kt`
- `services/api/openapi/seasons.yaml`
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.spec.ts`
- `apps/web/src/app/core/navigation/post-login-redirect-storage.ts`
- `apps/web/src/app/core/navigation/post-login-redirect-storage.spec.ts`
- `apps/web/src/app/pages/troupes-list/troupes-list.ts`
- `apps/web/src/app/pages/troupes-list/troupes-list.html`
- `apps/web/src/app/pages/troupes-list/troupes-list.spec.ts`
- `apps/web/src/app/shared/troupe-card/troupe-card.ts`
- `apps/web/src/app/shared/troupe-card/troupe-card.html`
- `apps/web/src/app/shared/troupe-card/troupe-card.spec.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`

### Change Log

- 2026-06-01 : Story 4.1 created (`bmad-create-story`) — public directory minimal MEP scope.
- 2026-06-01 : Story 4.1 implemented (`bmad-dev-story`) — public API, anonymous Découvrir, hub access-denied gate.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** remplie (UI story)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
