# ISSUES

This document is the **factual issue registry** for the project. It tracks bugs, defects, limitations, and anomalous behaviors discovered during development, testing, or usage.

This is **not** a planning document. Fixing an issue may result in a task in PLAN.md or be handled opportunistically during a slice. ISSUES.md is **informational (non-normative)**; SPEC, PLAN, and ARCH remain the normative sources for requirements, delivery, and architecture.

**When adding an issue:** use a unique ID (e.g. BUG-002), and include at least: Status, Severity, Affected area, Observed behavior, Expected behavior, Notes/context. Optional: Cause, Fix, Repro.

---

## Open Issues

### LIMIT-006 — Fresh Git worktrees need live validation of BMad provisioning
- **ID**: LIMIT-006
- **Status**: Fixed (2026-08-25; live provisioning installed and verified the required skills)
- **Severity**: Medium (development workflow / parallel story isolation)
- **Affected area**: BMad local installation and fresh Git worktrees
- **Observed behavior**: A worktree created from `v2` contains tracked BMad customizations but not ignored local skills, so its runtime could not be verified reproducibly.
- **Expected behavior**: A dedicated story worktree can validate the project-standard manual BMad runtime without copying an untracked developer installation by hand.
- **Cause**: A fresh Git worktree contains the tracked BMad manifest, so BMad 6.11.0 treats it as an existing installation. The bootstrap passed `--action install`, which that state rejects before writing the ignored IDE skill files.
- **Fix**: `scripts/v2/story-worktree-bootstrap.sh` invokes the pinned `bmad-method` installer only in the requested clean unit and verifies the real `bmad-create-story`, `bmad-dev-story`, and `bmad-code-review` skills with `_bmad/scripts/memlog.py` and tracked custom policy. It uses BMad's update flow for a worktree containing the tracked manifest, then restores only the tracked `_bmad/` files so the ignored IDE skills are added without rewriting project-owned runtime configuration. A network download requires explicit `HATCAST_BMAD_ALLOW_NETWORK=1`; tests inject a local provisioner. `story-branch.sh start` preserves the unit for inspection if bootstrap fails. A live approved run on 2026-08-25 passed BMad 6.11.0 verification.

### BUG-014 — Mobile remembered session lost when the browser closes
- **ID**: BUG-014
- **Status**: Fixed (2026-08-24)
- **Severity**: High (authentication — returning mobile user)
- **Affected area**: V2 API Spring Session JDBC / `HATCAST_SESSION`; Angular Google and Identity Platform recovery paths
- **Observed behavior**: `rememberMe=true` selected the 30-day server inactivity interval but emitted a browser-session `HATCAST_SESSION` cookie. Closing a mobile browser removed the only Google GIS authentication handle, so `/v1/auth/me` could not restore the session.
- **Expected behavior**: A remembered Google or Identity Platform connection keeps a secure HttpOnly handle with `Max-Age=30 days` from its issuance or reissue; reopening within that still-valid cookie window restores the session when the sliding 30-day server inactivity limit has not expired. A non-remembered connection keeps its 30-minute server interval and browser-session cookie (no `Max-Age` / `Expires`). Browser session restoration can retain that latter cookie across a restart; HatCast does not add a client-side forced logout merely to override this user-agent behaviour.
- **Cause**: Spring Session cookie configuration had no per-sign-in persistence decision; the front-end boolean is not a credential and Google GIS intentionally does not establish a Firebase client session.
- **Fix**: `HatcastSessionCookieSerializer` uses the existing `rememberMe` request decision to issue `Max-Age=2592000` only for remembered sign-ins, while preserving `HttpOnly`, `SameSite=Lax`, and Cloud `Secure`. Omitted `rememberMe` remains `true`. Identity Platform can still re-exchange an existing Firebase user token after a missing cookie; Google relies on the persistent HatCast cookie and otherwise signs in again. Web Push delivery remains subscription-based, not session-based.
- **Evidence**: API integration and serializer tests assert both Google/IdP intervals and cookie attributes; Angular tests distinguish Google’s no-Firebase fallback from the Identity Platform fallback; `WebPushNotificationSenderTest` verifies the sender reads `user_push_subscriptions` by user ID without an `HttpSession`.

### BUG-013 — Neon Launch bill ~$78/mo while scale-to-zero enabled (Hikari pool)
- **ID**: BUG-013
- **Status**: Fixed (2026-08-04 — OPS-12)
- **Severity**: High (ops cost — ~$78/mo with near-zero product traffic)
- **Affected area**: V2 API Spring datasource / HikariCP defaults ; Neon compute (ADR-0009)
- **Observed behavior**: After leaving Neon Free for Launch, invoice ≈ **$78/month** despite scale-to-zero enabled and little/no app usage. Matches ~1 CU always-on compute (`730 h × $0.106`).
- **Expected behavior**: After ~5 minutes without SQL activity, Neon compute reaches **Idle** and compute charges approach **$0** (Free plan quota or Launch pay-per-use).
- **Cause**: HikariCP defaults (`minimumIdle` = `maximumPoolSize` ≈ 10) recreate connections after Neon suspends, preventing sustained Idle. Secondary wake: Spring Session JDBC cleanup cron default (**every minute**). No explicit `spring.datasource.hikari.*` / session cleanup override in cloud/dev YAML.
- **Fix**: OPS-12 (`ops-12-neon-hikari-scale-to-zero`) — `minimum-idle: 0`, `idle-timeout: 60s`, `connection-timeout: 20s`, `maximum-pool-size: 5`; `management.health.db.enabled: false`; `spring.session.jdbc.cleanup-cron` daily; docs Free CU-h + `--offline`. Verified Idle on Neon branche `local` with JVM still running.
- **Notes/context**: Cold start latency acceptable (PO). Related: [ADR-0009](docs/adr/0009-neon-postgres-environments.md); story `_bmad-output/implementation-artifacts/ops-12-neon-hikari-scale-to-zero.md`.

### BUG-012 — Chance breakdown showed false cross-category penalty (equity_tag line)
- **ID**: BUG-012
- **Status**: Fixed (2026-06-23)
- **Severity**: Medium (UX — misleading explainability; draw weights were already correct)
- **Affected area**: V2 API `ChanceBreakdownCalculator` ; UI `app-chance-breakdown-sheet` (story **19.7** / **19.8**)
- **Observed behavior**: Waterfall displayed « Compté dans un autre type de spectacle » with a negative delta (e.g. −23 pt) when a participant had validated selections in another event category (déplacements, etc.), implying a penalty on principal draws.
- **Expected behavior**: Category compartments isolate history; déplacements must not appear as a breakdown penalty on principal events. Only category-scoped `past_participation` should appear (e.g. « Déjà Comédienne 5 fois »).
- **Cause**: Story **19.8** explainability step simulated unscoped history as a separate waterfall factor (`compartmentExplainabilityPercent`).
- **Fix**: Skip `CategoryCompartmentFactor` in breakdown adjustments; tests + E2E guard. Spec: `_bmad-output/implementation-artifacts/spec-fix-breakdown-no-equity-tag-line.md`.
- **Repro**: Member with déplacement history → open Dispos/Équipe chance breakdown on principal match → previously showed equity_tag line (Patrice, 2026-06-23).

### BUG-010 — Participant add typeahead shows internal option key in name field
- **ID**: BUG-010
- **Status**: Fixed (2026-06-06)
- **Severity**: Medium (UX — confusing display; submit could still work via `selectedSuggestion`)
- **Affected area**: V2 `apps/web` — `add-participant-dialog`, `add-event-participant-dialog` (story **3.8d**)
- **Observed behavior**: After selecting a typeahead suggestion, the **Nom affiché** input displayed the internal mat-option value (e.g. `m:e0000001-0000-4000-8000-000000000018`) instead of the participant display name.
- **Expected behavior**: Input shows the human-readable name (e.g. `Max`) after selection.
- **Cause**: `mat-autocomplete` option `[value]` is the stable suggestion key; input used one-way `[value]` binding without `[displayWith]`.
- **Fix**: `[displayWith]="displaySuggestionLabel"` + `findParticipantAddSuggestionByKey()` lookup.
- **Repro**: Manual recette 3.8d scénario C (2026-06-06, Patrice).

### BUG-011 — Re-adding excluded season member via event typeahead lands in Externes section
- **ID**: BUG-011
- **Status**: Fixed (2026-06-06)
- **Severity**: High (functional — wrong roster section / duplicate event-only row)
- **Affected area**: V2 `apps/web` — `add-event-participant-dialog` ; API `EventParticipantService.createMemberEventParticipant` (unchanged — front now routes correctly)
- **Observed behavior**: After excluding a **troupe member** (e.g. Angie) from a spectacle roster, re-adding via typeahead created an **event-only** participant row (`source: EVENT`) shown under **Externes** instead of re-including the season row under **Membres**.
- **Expected behavior**: Re-add should call `POST …/participants/roster/season/{id}` (`includeSeasonParticipantOnEvent`) — same as reversing an exclusion.
- **Fix**: Event add dialog detects troupe-member selection with an ACTIVE season row and calls `includeSeasonParticipantOnEvent` instead of `createEventParticipant`.
- **Repro**: Manual recette 3.8d scénario H alternative Angie (2026-06-06, Patrice).

### LIMIT-004 — Apérock 2026 seed roster empty until first admin list (auto-sync)
- **ID**: LIMIT-004
- **Status**: Open (by design — `ensureMembershipParticipants`)
- **Severity**: Low (dev recette / test data only)
- **Affected area**: API `SeasonParticipantService.ensureMembershipParticipants` ; seed `V30` (`aperock-2026`, `participant_count: 0`)
- **Observed behavior**: First visit to admin participants (or any code path listing season participants) on **Apérock 2026** auto-creates ACTIVE rows for **all** troupe members. Recette 3.8d scénario C assumed an empty roster — requires removing members first or using **retirer + ré-ajouter** on the main season (story 3.23 option A).
- **Expected behavior**: Documented in recette ; E2E should use fixture reset or explicit single-member removal, not assume persistent empty roster.
- **Notes/context**: Manual recette 3.8d (2026-06-06). Not a product bug for organizers — new seasons intentionally sync membership.

### BUG-008 — Push opt-in does not refresh notification preference toggles until tab revisit
- **ID**: BUG-008
- **Status**: Open
- **Severity**: Low (UX — confusing but not blocking; accepted at E1 cutover 2026-06-04)
- **Affected area**: V2 `apps/web` — Mon compte → onglet **Notifications** ; global push activation vs per-category email/push switches
- **Observed behavior**: After enabling browser push from the account hub, the per-category push toggles in the Notifications tab do not update visually immediately; leaving the tab and returning shows they were enabled automatically in the background.
- **Expected behavior**: Toggles reflect the new push subscription state without requiring navigation away from the tab (or show a brief loading/sync state).
- **Notes/context**: Found during gate **E1** staging screen tour ([e1-cutover-screen-tour-staging-v2.0.0.md](_bmad-output/implementation-artifacts/e1-cutover-screen-tour-staging-v2.0.0.md) §2.4). PO accepted for V2.0.0 cutover; fix can wait until post-M4 unless prioritized.

### BUG-009 — changelog.json user notes wrong on first RC of a semver line
- **ID**: BUG-009
- **Status**: Fixed (2026-06-04)
- **Severity**: High (PWA « Nouveautés » — misleading release notes)
- **Affected area**: `scripts/lib/version-changelog.sh` (`hatcast_staging_changelog_range`), `scripts/generate-changelog.js`, `apps/web/public/changelog.json`
- **Observed behavior**: For `vX.Y.Z-rc.1`, the changelog range fell back to bare `git log HEAD` (~entire repo history) when tag `vX.Y.Z` did not exist yet. OpenAI then produced generic HatCast bullets (Dispos, modales, Saisons…) unrelated to the actual RC delta. `CHANGELOG.md` sections for `2.0.1`–`2.0.2` were similarly inflated.
- **Expected behavior**: Range = previous RC tag or latest **production** tag strictly older than the target version; empty `changes[]` when the diff has no user-facing commits; OpenAI must not invent features absent from the source commit list.
- **Fix**: `hatcast_latest_prod_tag_before` + RC fallback on prior patch line; fail fast instead of `HEAD`; skip OpenAI when no feat/fix commits; stricter prompt; corrected `changelog.json` entries for `2.0.1`–`2.0.3`.

### BUG-007 — Member shell chrome hidden on canonical saison URLs
- **ID**: BUG-007
- **Status**: Fixed (2026-06-03)
- **Severity**: Medium (UX — rail Accueil · Agenda · Stats and mobile account trigger missing)
- **Affected area**: V2 `apps/web` — `member-shell-nav-visibility.ts` after canonical routes `/saison/:troupeSlug/:seasonSlug/…`
- **Observed behavior**: Workspace, event, and admin pages under canonical saison URLs rendered without member navigation chrome (patterns only matched legacy `/saison/:seasonSlug/…`).
- **Expected behavior**: Same chrome as legacy routes; query params (`?view=agenda`, `?tab=equipe`) must not affect path matching.
- **Fix**: Extended `MEMBER_NAV_PATH_PATTERNS` for canonical paths; admin breadcrumb `seasonSlug` param reads `seasonSlug` route param (not legacy `slug`).

### BUG-006 — MIG-3 left migrated spectacles as drafts (availability_opened_at)
- **ID**: BUG-006
- **Status**: Fixed (2026-06-02) — pipeline `load-ac.sql` backfill; manual SQL in preprod-reset-and-migrate.md for existing loads
- **Severity**: High (functional — whole migrated season invisible in member agenda)
- **Affected area**: V1→V2 migration (MIG-2/MIG-3), Story 3.21 event draft gate
- **Observed behavior**: After `migrate-from-v1`, all spectacles of migrated season (e.g. La Malice 2025-2026) showed as **brouillon** (`availabilityOpenedAt` null). Manual publish was slow and could show « Publication impossible » while the server had applied open-availability.
- **Expected behavior**: Migrated V1 events are **published** (open for availability / visible in agendas), matching V1 where events were already public.
- **Cause**: MIG-2 `INSERT INTO events` did not set `availability_opened_at`; Flyway V45 backfill runs only on schema migrate, before data load.
- **Fix**: `buildMigratedEventsOpenAvailabilityBackfillSql` appended to `load-ac.sql` (rejouer migration sur base vierge) ; front `openAvailabilityResilient` for slow open-availability responses.

### BUG-005 — Archived events unreachable for reactivation in season workspace
- **ID**: BUG-005
- **Status**: Fixed (2026-06-01)
- **Severity**: High (functional dead-end for organizers)
- **Affected area**: Season workspace spectacle picker (`filter-event-picker`), agenda filtering (`season-home`), event detail admin menu, API events lifecycle
- **Observed behavior**: After archiving an event, it disappeared from the agenda and did not appear in the spectacle picker when checking « Inactifs » (especially archived past events). There was no API/UI path to unarchive.
- **Expected behavior**: Picker « Inactifs » lists all inactive events (V1 GridBoard matrix); selecting an inactive event shows it in the agenda/history grid; organizers can **Réactiver** from event detail to restore it to the agenda.
- **Fix**: V1 filter matrix in `filterEventPickerVisibleOptions`; pinned fetch of selected out-of-scope events in `season-home`; `POST …/actions/unarchive` + menu **Réactiver** on inactive event detail.

### LIMIT-001 — E2E tests depend on live base state; need fixture re-architecture
- **ID**: LIMIT-001
- **Status**: Open (V1 legacy) / **mitigated for V2** (2026-05-31 — TEST-1)
- **Severity**: Medium (tests are runnable but flaky / high maintenance, not blocking delivery)
- **Affected area**: E2E tests (Playwright); fixtures / test data
- **Observed behavior**: State-dependent E2E tests (e.g. composition status flows, event-details tabs, undo/transition scenarios) are unstable and difficult to pass. They rely heavily on the current state of the database (seasons, events, composition status, casts). Results vary with data; many tests end up skipped or failing depending on the base.
- **Expected behavior** (future): A fixture system that allows injecting known data sets (or using a dedicated test DB/emulator with seeded data) so E2E tests can assert transitions and statuses reliably without depending on live content.
- **Notes/context**: **V2 (2026-05-31):** infra E2E under `apps/web/e2e/` + API profile `e2e` (H2 + seeds + mock Google auth + `POST /v1/e2e/fixtures/story-3-19/reset`) + smoke 3.19 green target in CI (`e2e-smoke.yml`). Legacy V1 Playwright (`legacy/tests/`) still state-dependent — not migrated in this slice. See PLAN **TEST-1**, ARCH.md § Testing V2.

### LIMIT-003 — PWA install blocked on Tailscale dev URL (self-signed TLS)
- **ID**: LIMIT-003
- **Status**: Open (dev environment)
- **Severity**: Low (dev/recette only; production uses trusted certs)
- **Affected area**: PWA install (Story 10.1) — Chrome desktop on `*.ts.net` (Tailscale Serve) with Angular basic-ssl / self-signed certificate
- **Observed behavior**: Chrome shows « Not Secure » despite `https://`. Install banner and address-bar ⊕ icon appear, but clicking **Installer** or the native install control does nothing ( `beforeinstallprompt.prompt()` may hang ).
- **Expected behavior**: On trusted HTTPS (production) or `https://localhost:4200`, native install works. On dev Tailscale URL, native install is skipped (manual steps dialog only); limitation documented for developers in [DEVELOPMENT.md](DEVELOPMENT.md) and this issue — not shown to end users in production.
- **Notes/context**: Discovered 2026-06-02 during Story 10.2 recette. Workaround: test desktop PWA install via `https://localhost:4200` with `--with-push`. Mobile tailnet install may work if cert is accepted on device.

### LIMIT-002 — API integration suite shares one DB; `TroupeMembershipIntegrationTest` flaky in full run
- **ID**: LIMIT-002
- **Status**: Open
- **Severity**: Low (not blocking; targeted runs are green, only the full-suite run is affected)
- **Affected area**: `services/api` Spring integration tests — `@SpringBootTest` with a shared `test` H2 database; `TroupeMembershipIntegrationTest` (platform-admin / join-policy / active-member-count cases).
- **Observed behavior**: `./gradlew test` (full suite) intermittently fails ~1–3 methods in `TroupeMembershipIntegrationTest` with `expected:<200> but was:<409>`. The same suite passes when run in isolation (`--tests '*TroupeMembershipIntegrationTest*'`). Reproduced on `v2` **without** any participant-service changes (baseline 2026-05-31), so it is pre-existing and independent of Story 3.19.
- **Expected behavior**: Deterministic results regardless of execution order — per-test isolation (transactional rollback / `@DirtiesContext` / unique fixtures) so shared seed-troupe state cannot leak between tests.
- **Notes/context**: Likely cross-test state accumulation on the shared seed troupe / reused `sub-platform-members-admin` identity. Discovered 2026-05-31 while validating the re-add reactivation work. Recommend isolating the suite or resetting state between tests before relying on the full-suite gate in CI.

---

## Fixed

### BUG-004 — Season `event_count` drift after bulk import and archive
- **ID**: BUG-004
- **Status**: Fixed
- **Severity**: Medium (misleading hub troupe season cards; data trust)
- **Affected area**: `seasons.event_count` denormalized column; V1→V2 migration SQL load; `EventService.archive`; `app-season-card` / troupe hub
- **Observed behavior**: After troupe/season import (bulk `INSERT INTO events`), season list cards show **0 spectacles** while the season workspace agenda lists events. Creating events via API increments the counter; archiving does not decrement it. Seeds manually run `UPDATE seasons SET event_count = COUNT(*)` but migration pipeline does not.
- **Expected behavior**: `SeasonResponse.eventCount` matches the number of **non-archived** events for the season, including after import and after archive/unarchive lifecycle changes.
- **Fix**: Story **17-30** — `SeasonEventCountSync.recountEvents()` on archive; reconcile SQL appended to MIG-2 `load.sql`; migration pipeline smoke reconciles and asserts `season_event_count`; admin script `scripts/v2/reconcile-season-event-counts.mjs` for imported troupes. Canonical rule: non-archived events only (seeds V6/V26/V34 aligned).
- **Notes/context**: Discovered 2026-05-31 on imported troupe (La Malice). UX spec [ux-design-troupe-hub.md](_bmad-output/planning-artifacts/ux-design-troupe-hub.md) T14.

### BUG-003 — Dispos « Tous » hint « estimés » trompeur après tirage multi-rôles
- **ID**: BUG-003
- **Status**: Fixed
- **Severity**: Medium (recette manuelle 2026-05-31)
- **Affected area**: `CompositionDrawService` ; `AvailabilityService` ; UI `availability-tous-panel`
- **Observed behavior**: Après tirage sur événement passé **AAAA**, hint global **« estimés »** alors que la majorité des % étaient capturés ; candidats multi-rôles (Max mc, Sophie dj) sans snapshot **player**.
- **Expected behavior**: Snapshots à l'**ouverture** du tirage par rôle ; hint **« capturés »** si snapshots existent ; avertissement **par rôle** seulement en cas de repli partiel.
- **Cause**: Snapshots pris par itération de slot avec `crossRoleExcluded` cumulatif (ordre dj→mc→player) ; `chanceSource` global `estimated` dès un candidat sans snapshot.
- **Fix**: `captureOpeningDrawSnapshots()` ; `chanceSource=snapshot` si snapshots ; `hasPartialEstimatedChances` + icône/tooltip par rôle.
- **Notes/context**: Story **6.14** ; re-draw nécessaire sur événements déjà tirés pour régénérer les snapshots.

### BUG-002 — Member glance stats ignore decline-only compositions (V1 parity gap)
- **ID**: BUG-002
- **Status**: Fixed
- **Severity**: Medium (post-migration recette: stats « Mes stats » diverge from V1 prod)
- **Affected area**: V2 API `SeasonGlanceStatsProvider` (`services/api/.../memberprofile/`); member profile UI (`apps/web/.../member-profile/`). **Not** MIG-3 load — declines are in `event_composition_declines`.
- **Observed behavior**: After La Malice migration cycle 1 (2026-05-29), member stats on staging show **0 désistements** and fewer **sélections** than V1 prod for the same user (e.g. Patrice: V1 3 declines / 10 selections vs V2 0 / 8). Disponibilités match. Decline rows exist in migrated SQL (`load-ac.sql`).
- **Expected behavior**: V1 parity (`GridBoard.vue` `getPlayerStats`): a player who was selected then declined counts toward **initial selections** and **désistements** even when they appear only in `cast.declined` (no slot in `cast.roles`). V2 should treat `event_composition_declines` without a matching slot the same way.
- **Cause**: `hasInitialSelection()` only considers `event_composition_slots` and excludes declined slots; decline-only migrated records are ignored. `chartBlockForEvent` may show decline-only as unavailable instead of declined.
- **Fix**: `SeasonGlanceStatsProvider` — `hasDeclineOnlyInitialSelection()` for MIG-3 decline-only rows; `hasSlottedInitialSelection()` kept for effective availability (V1 `countEffectiveAvailability`); `chartBlockForEvent` surfaces decline-only as `declined`. Tests: `SeasonGlanceStatsProviderTest`.
- **Notes/context**: Documented in `_bmad-output/implementation-artifacts/migration-recette-malicie-cycle-1-findings.md` (FINDING-001). Discovered during manual migration recette; **does not fail** automated migrate smoke.

### BUG-DOC-001 — V1 export docs/scripts use `--database=default` instead of `(default)`
- **ID**: BUG-DOC-001
- **Status**: Fixed
- **Severity**: Medium (blocked V1 production exports/migration until the correct id is used)
- **Affected area**: Migration tooling — `docs/v2/migration/preprod-reset-and-migrate.md`, `scripts/v1-export-*.js`, `scripts/replay/loadSeasonData.js`, ADR-0014
- **Observed behavior**: Running V1 export/inspection against production with `--database=default` fails with gRPC `5 NOT_FOUND`. `firebase-admin` `getFirestore(app, 'default')` looks for a database literally named `default`, which does not exist.
- **Expected behavior**: Production Firestore default database id is `(default)`. Commands must pass `--database='(default)'` (or scripts should normalize `default` → `(default)`).
- **Cause**: Docs/scripts conflate the human label "default" with the Firestore default database id `(default)` (already noted correctly in ADR-0002/ADR-0014 context).
- **Fix**: Story **MIG-2** — added `normalizeDatabaseId()` in `scripts/replay/loadSeasonData.js`; `getDb` now maps `default`/empty → `(default)`, so both `--database=default` and `--database='(default)'` work. Runbook `preprod-reset-and-migrate.md` updated (matrix + note).
- **Notes/context**: Discovered 2026-05-29 while profiling La Malice for MIG-3 (ADR-0016); fixed same day with MIG-2.

### UX-001 — Onglet Équipe : mutations lentes sans retour visuel global
- **ID**: UX-001
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: V2 `apps/web` — `event-equipe-tab`
- **Observed behavior** (recette MVP pilote, 2026-05-25) : mutations composition sans feedback visible global.
- **Expected behavior**: Retour immédiat pendant appels API et rechargements.
- **Fix**: Story **6.11** — overlay onglet pour mutations courantes ; tirage : panneau « Nous préparons le tirage… », animation visible, slots remplis progressivement ; plus de `loadEvent` redondant.
- **Notes/context**: Recette validée 2026-05-27. Clôture story **6.11**.

### UX-002 — Bouton « Déverrouiller » peu identifiable comme action
- **ID**: UX-002
- **Status**: Fixed
- **Severity**: Low
- **Affected area**: V2 `event-equipe-tab`
- **Observed behavior**: Déverrouiller peu distinct de Valider.
- **Expected behavior**: Bouton secondaire Material (`mat-stroked-button`).
- **Fix**: Story **6.11** — `mat-stroked-button` sur Déverrouiller.
- **Notes/context**: Recette validée 2026-05-27.

### PERF-001 — Actions composition (API + rechargements) anormalement lentes en dev
- **ID**: PERF-001
- **Status**: Fixed (accepted residual)
- **Severity**: Medium
- **Affected area**: V2 API composition + front `event-detail`
- **Observed behavior**: Mutations composition ressenties lentes en recette MVP.
- **Expected behavior**: Réduire allers-retours front ; latence API acceptable pour opérations peu fréquentes.
- **Fix**: Story **6.11** — suppression rechargements redondants (`loadEvent`, GET composition post-tirage) ; fast path API mutations (commit `a92d260`). Résiduel ~1 s sur `POST /composition/draw` en dev : **pas de profiling serveur supplémentaire** (décision produit 2026-05-27, tirage non fréquent).
- **Notes/context**: Perçu acceptable après panneau préparation + animation.

### PERF-002 — Lenteur globale pages membre V2 (sur-fetch API)
- **ID**: PERF-002
- **Status**: Open (Vague 1 done — Vague 2 in progress)
- **Severity**: Medium
- **Affected area**: V2 `apps/web` — agenda, season-home, event-detail, member-shell, accueil
- **Observed behavior** (dev local `--with-push`, 2026-06-09): Pages membre ressenties lentes malgré peu de données ; baseline Playwright agenda **5,9 s** / **37** appels `/v1/*` (32× preferences).
- **Post Vague 1** (`.local/perf-profile/web-perf-2026-06-09T19-46-21-738Z.json`, pages prioritaires) : Accueil **1501 ms**, Agenda **1940 ms**, Event Infos **1951 ms**, Dispos **2231 ms**, Équipe **2263 ms** — au-dessus des cibles ; goulots : `me/agenda` ~900 ms, bootstrap event ~10 appels, composition+summary ~1 s Dispos.
- **Expected behavior**: Pages prioritaires ≤ **1,0–1,5 s** ; NFR-P1/P2 ([perf-improvement-plan-v2-wave2.md](_bmad-output/planning-artifacts/perf-improvement-plan-v2-wave2.md)).
- **Fix**: Epic **perf-v2** — Vague 1 **PERF-01…08** done ; Vague 2 **PERF-09…15** (BFF event-detail, API agenda, accueil progressif, lazy dispos).
- **Notes/context**: Script `page.goto` sur-estime vs navigation in-app — PERF-14 prévu.

### LIMIT-002 — Admin back-office pages still use legacy header (chevron back, no breadcrumb)
- **ID**: LIMIT-002
- **Status**: Fixed
- **Severity**: Low (UX inconsistency; navigation works)
- **Affected area**: V2 `apps/web` — admin chrome on `/saison/:slug/admin/participants`, `/troupes/:slug/admin/membres` (and legacy aliases)
- **Observed behavior** (recette post–Story 17.2, 2026-05-25): These screens kept a **chevron back** and **no** `app-context-breadcrumb`.
- **Expected behavior**: Breadcrumb (troupe › saison › … › admin leaf) and **no** redundant back chevron; consistent with member-facing deep screens (ADR 0013).
- **Fix**: Story **17.11** — extended `app-context-breadcrumb` with `leafTitle`, `layout="troupe"`, and event admin link support; refactored `AdminParticipants` and `AdminMembres` headers (breadcrumb + account menu, mobile page title). Event-scoped participant admin: route `/saison/:troupeSlug/:seasonSlug/event/:eventSlug/admin/participants` (**17.16**); dialog removed.
- **Notes/context**: Closed 2026-05-25 with Story 17.11.

### BUG-001 — Unlock composition clears all player confirmation statuses
- **ID**: BUG-001
- **Status**: Fixed
- **Severity**: Medium
- **Affected area**: Composition / Storage
- **Observed behavior**: When an administrator clicks "Déverrouiller" (unlock) on a composition, all players who had confirmed (or declined) are reset to "à confirmer" (pending). The information about who had already confirmed is lost.
- **Expected behavior**: Unlocking should only clear the organizer's lock (`confirmed` / `confirmedByAllPlayers`). Individual player statuses (confirmed, declined, pending) should be preserved so that admins do not lose that information and are not forced to ask everyone to confirm again.
- **Cause**: In [src/services/storage.js](src/services/storage.js), `unconfirmCast` reads current data from the subcollection **`selections`** to preserve `playerStatuses`, but the cast data (including `playerStatuses`) is stored in the **`casts`** subcollection. The read therefore typically returns no or wrong data; `preservedPlayerStatuses` is empty and the update overwrites `playerStatuses` with an empty object.
- **Fix**: In `unconfirmCast`, use `getDocument('seasons', seasonId, 'casts', eventId)` instead of `getDocument('seasons', seasonId, 'selections', eventId)` when reading the current cast to preserve `playerStatuses`. The rest of the logic (copying current `playerStatuses` into the update) already intends to preserve them.
- **Notes/context**: Code comments and variable names in `unconfirmCast` explicitly state the intent to preserve player statuses; this is an implementation bug (wrong collection name), not a deliberate design choice. **Fixed:** Read in `unconfirmCast` was switched from `selections` to `casts` so preserved statuses are applied correctly.

---

## Deferred / Accepted Issues

### LIMIT-005 — Pas de bascule membre → externe après import V1 (ex. Laetitia Landelle)
- **ID**: LIMIT-005
- **Status**: Resolved — story **2.26** + [ADR-0022](docs/adr/0022-season-participation-mode-role-lifecycle.md) (2026-07-12)
- **Severity**: Low (workaround manuel possible ; friction orga)
- **Affected area**: V1→V2 migration (`export:v1-members` / import CSV 2.3) ; admin **Membres** (`edit-troupe-member-dialog`, `add-member-dialog`) ; API `TroupeMembershipService.updateMember` / `TroupeMemberCsvImportService` ; ADR-0021 (carnet `EXTERNE`)
- **Observed behavior** (2026-07-12, Patrice, prod `hatcast.app` — La Malice) : après migration M4, **Laetitia Landelle** apparaissait comme **membre** troupe (import V1). L’organisateur souhaitait la traiter comme **externe** sur la saison passée et la nouvelle saison, mais **aucun parcours UI** ne permettait de basculer un membre existant vers le carnet Externe (LIMIT-005).
- **Resolution (2026-07-12, story 2.26) :** chip rôle **Membres** admin (*Membre* / *Administrateur·ice* / *Externe*) ; conversion bidirectionnelle + **season participation mode** ([ADR-0022](docs/adr/0022-season-participation-mode-role-lifecycle.md)).
- **Cause (historique, by design before 2.26) :**
  - Export V1 `members.csv` : `baselineRole` ∈ `{ MEMBER, TROUPE_ADMIN }` seulement — pas de statut externe V1 ([`scripts/v1/troupeMembersCsv.js`](scripts/v1/troupeMembersCsv.js)).
  - API refuse `MEMBER` → `EXTERNE` via `PATCH` membre et via import CSV membre : *« Utilisez l'ajout Externe pour les entrées carnet. »* ([`TroupeMembershipService.kt`](services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt), [`TroupeMemberCsvImportService.kt`](services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMemberCsvImportService.kt)).
  - UI édition membre : pas de changement de rôle vers Externe ([`edit-troupe-member-dialog.ts`](apps/web/src/app/pages/admin-membres/edit-troupe-member-dialog.ts)).
- **Notes/context** : Investigation 2026-07-12 → [member-externe-conversion-investigation.md](_bmad-output/implementation-artifacts/investigations/member-externe-conversion-investigation.md). **Décision produit :** conversion bidirectionnelle + **mode de participation par saison** ([ADR-0022](docs/adr/0022-season-participation-mode-role-lifecycle.md)). **Livré :** story **2.26** (recette OK 2026-07-12).
