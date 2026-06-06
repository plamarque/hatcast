# Architecture (HatCast)

**Location:** Repository root. Architecture is project-wide; root keeps it discoverable for onboarding and evolution decisions.

Describes the system architecture **as-is** and principles for evolving safely. For "why" decisions, see `docs/adr/`.

### Évolution V2 (contrats — prod utilisateur V1 inchangée)

La cible documentée (Angular SPA sous [`apps/web/`](apps/web/), API Kotlin/Spring sous [`services/api/`](services/api/), PostgreSQL sur **Neon**, Cloud Run) est décrite dans [`docs/shared/technical/MONOREPO.md`](docs/shared/technical/MONOREPO.md) et les artefacts `_bmad-output/planning-artifacts/`. **Déploiement V2 validé** sur l’environnement **development** (branche `v2`) ; staging/production Cloud Run sont **reportés** (voir [`docs/shared/technical/BRANCH_ENVIRONMENTS.md`](docs/shared/technical/BRANCH_ENVIRONMENTS.md)). Persistance V2 : **ADR-0009** ([docs/adr/0009-neon-postgres-environments.md](docs/adr/0009-neon-postgres-environments.md)). Authentification V2 :

- **Décision cible :** [docs/adr/0010-v2-auth-identity-platform.md](docs/adr/0010-v2-auth-identity-platform.md) (**Google Cloud Identity Platform** — pas Firebase comme backend V1 ; confort proche de l’auth managée historique : Google + email/mot de passe, reset, multi-appareils ; Postgres reste le référentiel métier).
- **Implémentation actuelle (slice historique, en attendant migration) :** [docs/adr/0008-v2-spa-auth-google-session.md](docs/adr/0008-v2-spa-auth-google-session.md) — **Deprecated** ; OIDC Google direct + session serveur.
- **Contrat HTTP (fragment) :** [services/api/openapi/auth.yaml](services/api/openapi/auth.yaml).
- **Configuration GCP / OAuth (opérateur, slice Google OIDC) :** [docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md](docs/v2/technical/V2_GOOGLE_OAUTH_SETUP.md).
- **Implémentation slice testable :** API Spring sous [services/api/](services/api/) (`./gradlew bootRun`, `./gradlew test`) ; client Angular sous [apps/web/](apps/web/) (`ng serve`, port **4200** par défaut). Voir [DEVELOPMENT.md](DEVELOPMENT.md) section « V2 ». **Config auth client :** dev → `environment.development.ts` ; recette prod locale (`./scripts/start-dev.sh --with-push` → `environment.production.local.ts`, gitignored) et Cloud Run → [`inject-google-client-id.mjs`](apps/web/scripts/inject-google-client-id.mjs) (`HATCAST_FIREBASE_*`, Client ID OAuth) dans `environment.ts` au build Docker.
- **Autorisation V2 troupe :** les lectures troupe passent par `TroupeAccessService.requireActiveMember` (contourné pour les **admins plateforme** — accès lecture/admin sans adhésion) ; les mutations de membres, saisons, événements et délégations passent par une adhésion active `troupe_memberships.baseline_role = TROUPE_ADMIN`, ou par le statut admin plateforme (`PlatformAdminService`). Navigation directe par URL pour super-admin : `GET /v1/admin/troupes/by-slug/{slug}`, `GET /v1/admin/seasons/by-slug/{slug}` (front : `TroupeContextService.resolveTroupeBySlug`). **`GET /troupes`** reste limité aux adhésions actives.
- **Contrat membres V2 :** `services/api/openapi/seasons.yaml` documente `/v1/troupes/{troupeId}/members*`, l’export/import CSV admin (`/members/export`, `/members/import`), la désactivation soft (`status = INACTIVE`), la garde dernier admin actif, les exigences CSRF et la limite demo self-join (`MEMBER` uniquement). Contrat CSV v1 : `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md`. **Externes troupe (carnet, scope invitation, cascade à l’ajout) :** normatif [ADR-0021](docs/adr/0021-troupe-externes-carnet-invitations.md) — **non implémenté** au runtime (enum `EXTERNE` et garde-fous à venir).
- **Pre-prod V2 & migration V1 :** [ADR-0014](docs/adr/0014-v2-preprod-migration-no-seed.md) — Flyway `db/migration` (schéma) vs `db/seed` (dev/test uniquement) ; staging Neon sans seeds ; exports V1 depuis Firestore **`default`** (prod). Runbook : [docs/v2/migration/preprod-reset-and-migrate.md](docs/v2/migration/preprod-reset-and-migrate.md). Migration CLI : `./scripts/migrate-from-v1.sh` (MIG-6) ; orchestrateur bas niveau [ADR-0017](docs/adr/0017-v2-migration-api-key.md) (`npm run migrate:v2:run`). Ordre d’exécution : [PLAN.md](PLAN.md) § Pre-prod V2 + migration V1. **Bootstrap troupe sur env vide :** `POST /v1/troupes` (Story 2.11) — pas d’insert SQL manuel ni seed Flyway sur profil `cloud`.
- **Brouillon spectacle (Story 3.21) :** colonne `events.availability_opened_at` (NULL = brouillon) ; `POST …/events/{id}/actions/open-availability` et `close-availability` ; listes filtrées pour membres ; détail spectacle lisible par lien direct en brouillon ; seeds **V48** (backfill post-seed dispos). UX : [`ux-event-draft-publish-3-21.md`](_bmad-output/planning-artifacts/ux-event-draft-publish-3-21.md).
- **Audit V2 (write path, Story 9.0 ; read path, Story 9.1) :** migration `V43__audit_events.sql` ; module `com.hatcast.api.audit` (`AuditEventRecorder`, enum `AuditActionType`, **`GET /v1/audit/events`** paginé avec autorisation troupe/saison/spectacle) ; hooks dans les services domaine (dispos, événements, rosters, droits, composition, participation) + **`COMPOSITION_LIFECYCLE_CHANGED`** (acteur null). Écriture **dans la même transaction** que la mutation (contraste avec notifications after-commit, story 6-13). UI admin/orga : pages **Journal d'audit** (troupe, saison) + onglet **Activité** (spectacle). Consultation membre « me concernant » : story **9.2**. Voir [ADR-0018](docs/adr/0018-v2-audit-events-postgres.md).
- **Notifications V2 (Stories 8.1–8.6) :** module `com.hatcast.api.notification` — **`NotificationDispatcher`** après commit transaction domaine (listeners Spring sur `EventAvailabilityOpenedEvent`, validate composition, **proxy dispo/participation** (`ProxyAvailabilityRecordedEvent` / `ProxyParticipationRecordedEvent`), etc.) ; intents membre **`PROXY_AVAILABILITY_RECORDED`** / **`PROXY_CONFIRMATION_RECORDED`** (story **8.6**, accusé orga→sujet lié uniquement) ; canaux **Web Push** (`nl.martijndwars:web-push` + provider JCE **BouncyCastle** obligatoire) et **email** (Spring Mail auto-config, pas de `pushQueue` Firestore V1) ; journal `notification_delivery_log` ; abonnements push en Postgres (`user_push_subscriptions`, story 8.1). Opt-in client : `/compte` + service worker (`custom-sw.js`). Recette locale push / PWA / auth email prod-like : `./scripts/start-dev.sh --with-push` (injecte `environment.ts` depuis `.env` puis build Angular production + watch + serve `dist/` HTTPS). Cloud Run : secrets `HATCAST_WEB_PUSH_VAPID_*`, `HATCAST_FIREBASE_*`, `HATCAST_NOTIFICATION_*`, `SPRING_MAIL_*` — voir [DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md). Handoff impl. : [_bmad-output/implementation-artifacts/8-3-notifications-mep-dispos-et-confirmation-assignes.md](_bmad-output/implementation-artifacts/8-3-notifications-mep-dispos-et-confirmation-assignes.md).
- **Routes saison V2 (canonique, ADR 0013 amend. 2026-06-03) :** workspace **`/saison/:troupeSlug/:seasonSlug`** (+ sous-routes admin et **`/event/:eventSlug`**) ; slug saison unique **par troupe** ; alias legacy **`/saison/:seasonSlug`** → composant **`SaisonLegacyRedirect`** ; builders et parseurs : **`apps/web/src/app/core/navigation/troupe-routes.ts`** ; visibilité du chrome membre (rail Accueil · Agenda · Stats) : **`member-shell-nav-visibility.ts`** — motifs legacy **et** canoniques requis.

Le client V1 sous [`legacy/`](legacy/) reste la référence runtime actuelle pour la production Firebase décrite ci-dessous jusqu’à bascule explicite.

---

## High-level component map

| Component | Responsibility | Location / entry |
|-----------|----------------|------------------|
| **Frontend SPA** | UI, routing, auth state, calls to Firestore and callable functions | [legacy/index.html](legacy/index.html), [legacy/src/main.js](legacy/src/main.js), [legacy/src/App.vue](legacy/src/App.vue), [legacy/src/views/](legacy/src/views/), [legacy/src/components/](legacy/src/components/) |
| **Firestore (client)** | All server persistence from the client; multi-database | [legacy/src/services/firestoreService.js](legacy/src/services/firestoreService.js), [legacy/src/services/storage.js](legacy/src/services/storage.js) |
| **Auth (client)** | Firebase Auth (email, Google, magic link, anonymous); session | [legacy/src/services/firebase.js](legacy/src/services/firebase.js), [legacy/src/services/authState.js](legacy/src/services/authState.js) |
| **Config** | Environment (test/dev/staging/prod), Firestore database name, API roots | [legacy/src/services/configService.js](legacy/src/services/configService.js) |
| **Permissions** | Super Admin + season admin checks; calls callable for Super Admin | [legacy/src/services/permissionService.js](legacy/src/services/permissionService.js) |
| **Domain services** | Casts, selection (draw), chances (weights), availability, players, seasons | [legacy/src/services/castService.js](legacy/src/services/castService.js), [legacy/src/services/selectionService.js](legacy/src/services/selectionService.js), [legacy/src/services/chancesService.js](legacy/src/services/chancesService.js), [legacy/src/services/playerAvailabilityService.js](legacy/src/services/playerAvailabilityService.js), [legacy/src/services/players.js](legacy/src/services/players.js), [legacy/src/services/seasons.js](legacy/src/services/seasons.js) |
| **Notifications (client)** | Push (FCM), reminders; write to pushQueue/reminderQueue | [legacy/src/services/notifications.js](legacy/src/services/notifications.js), [legacy/src/services/pushService.js](legacy/src/services/pushService.js), [legacy/src/services/reminderService.js](legacy/src/services/reminderService.js) |
| **Audit (client, V1 legacy)** | Log actions and errors to Firestore / callable | [legacy/src/services/auditClient.js](legacy/src/services/auditClient.js) |
| **Audit (V2 API write + read path)** | Append-only `audit_events` journal ; `GET /v1/audit/events` (Story 9.1) | [services/api/src/main/kotlin/com/hatcast/api/audit/](services/api/src/main/kotlin/com/hatcast/api/audit/) — [ADR-0018](docs/adr/0018-v2-audit-events-postgres.md) |
| **Notifications (V2 API)** | After-commit dispatch push/email ; delivery log Postgres ; pas de queue Firestore | [services/api/src/main/kotlin/com/hatcast/api/notification/](services/api/src/main/kotlin/com/hatcast/api/notification/) — story **8.3** |
| **Cloud Functions** | Auth (custom token), audit triggers/queries, mail, reminders, push, admin, roles | [functions/index.js](functions/index.js), [functions/](functions/) |
| **Firestore (server)** | Triggers (audit, mail, reminder, push); admin DB access | [functions/](functions/) using `admin.firestore()` |
| **Hosting** | Serve static `legacy/dist`; SPA fallback | [firebase.json](firebase.json) hosting, [.github/workflows/](.github/workflows/) |

**Monorepo:** V1 client lives under [`legacy/`](legacy/); future V2 client under [`apps/web/`](apps/web/); API V2 under [`services/api/`](services/api/). See [docs/shared/technical/MONOREPO.md](docs/shared/technical/MONOREPO.md).

No separate API server; backend is Firebase (Firestore + Auth + Functions).

---

## Runtime topology

```
[Browser / PWA]
  ├── Vue SPA (Vite dev or static dist)
  ├── Firebase JS SDK (Auth, Firestore, Functions, Storage, Messaging)
  └── Service worker (PWA; legacy/src/service-worker.js)

[Firebase]
  ├── Firebase Hosting (serves legacy/dist)
  ├── Firebase Auth
  ├── Firestore (databases: default, staging, development)
  ├── Cloud Functions (Node 20; same project, region per config)
  └── (Storage, Messaging used where configured)
```

- **Local dev:** `npm run dev` at repo root → Vite dev server for `legacy/` (default port 5173; optional HTTPS via cert paths in [`legacy/vite.config.js`](legacy/vite.config.js)). App talks to Firebase project (and optionally emulators) via env.
- **Deploy:** CI (e.g. push to `staging` / `main`) builds the legacy client (`npm run build` → `legacy/dist`), then `firebase deploy` for hosting (+ functions). Two hosting targets (production, staging) in `firebase.json`; which one is used depends on CI workflow and Firebase project/target.
- **Multi-environment:** Environment is derived from hostname or `VITE_ENVIRONMENT`; Firestore database name from `VITE_FIRESTORE_DATABASE` (see `configService.js`). Functions run in one backend project per deployment; database selection is client-side via Firestore SDK initialisation.

---

## Data flows (read/write paths)

- **Read:** Client → Firestore (via `firestoreService` / `storage`). Queries use collection paths and (where defined) indexes in `firestore.indexes.json`. Subcollections under `seasons/{id}` for events, players, casts, availability, admins.
- **Write (client):** Client → Firestore (add/update/delete) where rules allow. Batches and transactions used for consistency (e.g. in `storage.js`). Queues: client writes to `mail`, `reminderQueue`, `pushQueue`; no client read.
- **Write (server):** Functions triggered by Firestore (onCreate, etc.) or invoked via httpsCallable. Triggers: audit, processMail, processReminderQueue, processPushQueue. Callables: createCustomTokenForEmail, audit queries, admin, role-related. Functions use `admin.firestore()` (default database unless specified).
- **Auth:** Client ↔ Firebase Auth; custom tokens issued by callable `createCustomTokenForEmail` for magic-link-like flows. No direct DB of passwords; reset via Firebase Auth.

---

## Config strategy

- **Client:** All config comes from Vite env: `import.meta.env.VITE_*`. Keys observed in CI and config: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`, `VITE_ENVIRONMENT`, `VITE_FIRESTORE_DATABASE`, `VITE_STORAGE_PREFIX`. Optional: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_HTTPS_CERT_PATH`, `VITE_HTTPS_KEY_PATH` (see `.env.example`, [`legacy/vite.config.js`](legacy/vite.config.js), deploy workflows).
- **Secrets:** Not committed. Local: `.env.local` or `.env` (gitignored). CI: GitHub Actions secrets (e.g. `FIREBASE_API_KEY`, ...`) mapped into `.env` at build time.
- **Functions:** Use Firebase project config and, if defined, `defineSecret` / params (e.g. commented `GOOGLE_MAPS_API_KEY` in `functions/index.js`). No env file for functions in repo; secrets in Firebase/Google Cloud.
- **Single source of env detection:** `configService.detectEnvironment()` and `getFirestoreDatabase()` drive which DB and feature flags apply. Add new env vars in one place and document in DEVELOPMENT.md and/or ARCH.

---

## Static assets (public)

- **Location:** Static images and files that must be served as-is (no Vite bundling) go under **`legacy/public/img/`**.
- **Reference in code:** Use the **`/img/`** URL prefix (no `public` in the path). Example: `src="/img/slide-1.jpg"`.
- **Rationale:** Vite and Firebase Hosting serve `legacy/public/` at the site root; these files are not hashed or processed at build time.
- **Existing assets:** `legacy/public/icons/` and `legacy/public/logos/` remain unchanged; new product/images (e.g. explanation slides) use `legacy/public/img/` for a single place for generic images.

---

## Testing strategy (as-is + minimal improvements)

### V1 (legacy)

- **E2E (Playwright):** Default test runner. Config: [`legacy/playwright.config.js`](legacy/playwright.config.js); baseURL from env or `legacy/playwright.config.local.js`. Runs full app against a URL (dev server started by Playwright or existing server with `SKIP_WEBSERVER=1`). Specs in [`legacy/tests/*.spec.js`](legacy/tests/). Global setup/teardown in [`legacy/tests/global-setup.js`](legacy/tests/global-setup.js), [`legacy/tests/global-teardown.js`](legacy/tests/global-teardown.js).
- **Custom runners:** [`legacy/tests/run-tests.js`](legacy/tests/run-tests.js), `run-manual.js`, email interceptor for flows that need controlled email/push behaviour. Not part of default `npm test`.
- **CI:** `test:ci` uses `BASE_URL=http://localhost:5173`; Playwright typically starts the dev server unless disabled.
- **Unit (Vitest):** Logic tests in [`legacy/tests/unit/*.spec.js`](legacy/tests/unit/). Run with `npm run test:unit`. Playwright ignores `tests/unit/**` via `testIgnore`.

### V2 (Angular + Spring — cible)

- **Unit (Vitest):** `apps/web` — `ng test` / Vitest component tests (`*.spec.ts`).
- **API integration (H2):** `services/api` — `./gradlew test`, profil Spring `test`, CI [`api-test.yml`](.github/workflows/api-test.yml) (palier 1 PR).
- **E2E (Playwright):** `apps/web/e2e/` + [`playwright.config.ts`](apps/web/playwright.config.ts). Playwright démarre l’API en profil **`e2e`** (H2 + seeds Flyway, **CSRF désactivé**, auth Google mockée via `E2eGoogleIdTokenService`, fixtures hybrides `POST /v1/e2e/fixtures/story-3-19/reset`) et le front `ng serve` (TLS). Auth Playwright : `storageState` (`e2e/.auth/admin.json`). Recette 3.19 : `recette-3.19.spec.ts` (S1–S9, hors M1/M2 manuels). CI palier 2 : [`.github/workflows/e2e-smoke.yml`](.github/workflows/e2e-smoke.yml). Voir [`apps/web/e2e/README.md`](apps/web/e2e/README.md) et `services/api/README.md` § Profil `e2e`.
- **Hors scope E2E V2 :** porter `legacy/tests/` tel quel ; exécuter E2E contre Neon prod / troupe La Malice (données migration réelles).
- **Gate deploy staging Cloud Run :** sur branche `staging-v2` uniquement, [`deploy-v2-cloud-run.yml`](.github/workflows/deploy-v2-cloud-run.yml) appelle [`e2e-smoke.yml`](.github/workflows/e2e-smoke.yml) (`workflow_call`) avant le déploiement ; **pas** de gate E2E sur `v2` (dev cloud) ni `production-v2`. Le workflow standalone `e2e-smoke.yml` reste actif sur PR / push `v2` (palier 2 CI).

- **Improvements (minimal, non-invasive):** Keep a single "smoke" suite that loads home and one season route; avoid disabling tests to fix CI; document test:with-server and env requirements in DEVELOPMENT.md. No refactor of test architecture required for v0.1.

---

## Key seams / extension points

- **Firestore abstraction:** `firestoreService.js` + `storage.js`. New collections or paths should go through these (or an agreed wrapper) so multi-database and rules stay consistent. Changing DB shape or adding indexes: update DOMAIN, firestore.rules, and firestore.indexes.json.
- **Permission boundary:** All admin checks go through `permissionService.js`. New "admin-only" features should use it; new roles or Super Admin logic belong in Functions + this service.
- **Callable functions:** New server actions should be added in `functions/index.js` (and optionally in separate modules); client calls via `callCloudFunction` in `firebase.js`. CORS and callable context are the integration contract.
- **Queue-based side effects:** Mail, reminders, push go through Firestore queues + triggers. To add a new kind of notification, add a collection (and rules), a trigger, and client code that writes to the queue.
- **Routes:** Add new routes in [`legacy/src/main.js`](legacy/src/main.js) (routes array and guards). Admin routes under `/season/:slug/admin` are already guarded; replicate the pattern for other protected areas.
- **PWA:** Manifest and service worker are configured in `vite.config.js` and `legacy/src/service-worker.js`. Changes to offline behaviour or push subscription touch these and possibly `notifications.js`.
