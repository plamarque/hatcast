---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-hatcast-v2.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - ARCH.md
uxReferenceNote: "Continuity with HatCast V1: see ux-design-hatcast-v2.md (+ ux-references/*.png); live V1 + legacy/src components remain references."
workflowType: architecture
project_name: hatcast
user_name: Patrice
date: '2026-04-11'
lastStep: 8
status: complete
completedAt: '2026-04-12'
sprintChangeApproved: '2026-04-18'
frontendStackNote: 'V2 target client: Angular 21 + Angular Material (approved sprint change); legacy V1 remains Vue until migration.'
repoStructureNote: 'Monorepo as implemented: legacy/ (Vue V1), apps/web/ (Angular V2 client), services/api/ (Spring V2). Normative repo layout: root ARCH.md, docs/technical/MONOREPO.md.'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## UX continuity with HatCast V1 (stakeholder intent)

- **Layout:** Keep **layouts and navigation patterns** from V1 screens that remain satisfactory as the **primary UX reference** for the rewrite (historical V1: Vue + PrimeVue). **V2 implementation** uses **Angular 21 + Angular Material**; **structure and familiar placement** of key actions remain explicit goals where chosen.
- **Visual style:** Preserve the **overall look and feel** of V1 (density, contrast, typography mood, component “personality”) as a **baseline**, reconciled through **Angular Material theming** (and design tokens)—not by copying ad-hoc utility styling as the main layer.
- **Sources of truth for designers/impl:** The **running V1 app**, **`ux-design-hatcast-v2.md`** (screen-by-screen continuity + captures under `ux-references/`), **legacy V1 Vue components** under **`legacy/src/`** (e.g. grid, event views, headers) until replaced, and **SPEC/PLAN slices** that describe behaviour.
- **PRD alignment:** This complements the PRD (Angular Material–first, avoid Tailwind as the primary styling surface) by stating **continuity** as a product/architecture constraint, not a mandate to port legacy CSS verbatim.

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

The PRD defines **41 functional requirements (FR1–FR41)** spanning: authentication and session (FR1–FR5); troupe membership, roles, display name and avatar (FR6–FR10); seasons and events configuration and viewing (FR11–FR14); availability and role-level candidacy, including organizer acting on behalf of members with audit (FR15–FR18); organizer visibility of candidates, weighted draw, manual assignment, draft vs validated composition, explainability of odds (FR19–FR24); member and admin confirmation flows, gap handling, lifecycle states (FR25–FR28); push/email notification preferences and delivery (FR29–FR31); public directory and read-only discovery (FR32–FR33); organizer scope and audit trail (FR34–FR35); account management (FR36–FR37); guest invites and non-default selection modes (FR38–FR39); PWA install and post-deploy client update (FR40–FR41). Architecturally, this implies a **coherent domain model** for seasons, events, roles, availability, casts/composition, draws, and notifications, with **permission boundaries** and **audit** crossing multiple modules.

**Non-Functional Requirements:**

NFRs drive: **performance** under mobile conditions and bounded list loads (NFR-P1–P2); **security and privacy** (TLS, least-privilege data exposure, GDPR-oriented expectations) (NFR-S1–S3); **reliability** via coupled staging/prod deploys of frontend and backend and safe async notification handling (NFR-R1–R2); **scalability** without redesigning core partitioning (NFR-SC1); **accessibility** baseline for core tasks (NFR-A1); **integration** robustness for Google sign-in and email (NFR-I1).

**Scale & Complexity:**

- **Primary domain:** Mobile-first **web application** (SPA + PWA) with a **REST API** and **relational persistence** as per target stack in the PRD.
- **Complexity level:** **Medium–high** — rich interaction model (grid, event detail tabs, draw animation, share/announce flows), multi-role permissions, guest paths, and **brownfield migration** from the existing Firebase-centric implementation described in `ARCH.md`.
- **Estimated architectural components (high level):** client SPA; API layer; relational database; auth/identity integration; notification dispatch (web push + email); audit logging; optional public/read models for directory; background or queue workers as required for async delivery.

### Technical Constraints & Dependencies

- **Brownfield:** Current production architecture (Vue SPA under **`legacy/`** + Firestore + Auth + Cloud Functions) is documented in repository **ARCH.md** (monorepo: `legacy/`, `apps/web/`, `services/api/`); the PRD targets **Kotlin/Spring Boot on Cloud Run**, **PostgreSQL on Neon**, **GitHub Pages** (or equivalent static host) for the **V2** frontend — architecture must address **migration strategy**, **API contract (e.g. OpenAPI)**, and **environment parity** (staging vs production).
- **Deployment:** Coupled CI releases for client and API per environment (NFR-R1) to avoid version skew.
- **UX stack:** **Angular Material** (on **Angular 21**) as primary UI layer; continuity constraints documented in `ux-design-hatcast-v2.md` and existing `architecture.md` UX section.

### Cross-Cutting Concerns Identified

- **Identity & authorization:** Troupe-scoped roles, season/event organizers, guest vs member, Super Admin patterns — must align API and UI consistently.
- **Auditability:** Actor vs subject for proxy actions; integration with admin and support stories (FR17, FR26, FR35).
- **Composition lifecycle:** Draft → validated → confirmations → withdrawals and gap filling — single source of truth and clear state transitions.
- **Fairness & explainability:** Weighted draw, odds display, partial redraws — shared logic between “Dispos” aggregates and “Équipe” flows.
- **Notifications & deep links:** Canonical event URLs, push/email, share/announce modal pattern — require stable routing and template generation.
- **Public vs private:** Directory and freemium read models vs member-only data (FR32–FR33, privacy NFRs).

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web application:** **Angular 21** SPA for the client (to live under **`apps/web/`**); Kotlin/Spring Boot REST API on the server (under **`services/api/`**); PostgreSQL persistence — aligned with the PRD target stack and brownfield migration from Firebase (see `ARCH.md`). **Legacy V1** remains **Vue + Vite** in **`legacy/`** until replaced; **V2** targets **Angular CLI** workspace + **Angular Material** in **`apps/web/`**.

### Starter Options Considered

| Layer | Option | Notes |
|-------|--------|--------|
| **Frontend (greenfield equivalent)** | **Angular CLI** (`ng new`) | Official **Angular 21** application scaffold ([Angular CLI overview](https://angular.dev/tools/cli)). Enable **routing**, **SCSS** (or CSS per team choice), **strict** mode; add **standalone components** as default. **HatCast today** still ships the **Vue + Vite** client from **`legacy/`**; new work scaffolds into **`apps/web/`** — this row documents the **V2** baseline. |
| **UI library** | **Angular Material** | Add with `ng add @angular/material`; configure theme (prebuilt or custom) per [Angular Material guides](https://material.angular.io/guide/getting-started). |
| **Backend (new service)** | **Spring Initializr** ([start.spring.io](https://start.spring.io/)) | Generate **Kotlin** + **Gradle (Kotlin DSL)** project. Select **Spring Boot** version from the **current stable** line offered by the UI at generation time (PRD: use latest stable Spring Boot line when implementing). Typical dependencies: Spring Web, validation, data access (JDBC or JPA as chosen in ADRs), PostgreSQL driver, Actuator; add **OpenAPI** (e.g. springdoc-openapi) in implementation stories. |
| **CLI alternative (backend)** | `curl https://start.spring.io/starter.zip` with parameters | Same output as the web UI; use for automation in CI once coordinates are fixed. |

### Selected Approach (not a single monolithic starter)

**Rationale:** The product is **brownfield**. The frontend needs **documented alignment** with **Angular CLI** + **Angular Material** for **V2** SPA work, while **legacy Vue** assets may coexist until migration slices land. The backend target is a **new** Spring Boot service — **Spring Initializr** is the standard, maintained entry point; exact dependencies are finalized in step 4+ (decisions).

**Frontend initialization (greenfield reference):**

```bash
npm install -g @angular/cli@21
# Scaffold the Angular 21 app into apps/web/ (ng new …) per Angular CLI docs; keep npm workspace @hatcast/web at repo root.
cd apps/web
ng add @angular/material
ng serve
```

**Backend initialization (reference — adjust dependencies in IDE or Initializr UI):**

- Open [https://start.spring.io](https://start.spring.io/), choose **Kotlin**, **Gradle - Kotlin**, **Jar**, Java **17** or **21** (LTS) as supported by the selected Spring Boot line, add **Spring Web** and other dependencies per API ADRs, generate and unzip — or use the Initializr **curl** API with the same parameters.

**Architectural decisions provided by these choices**

- **Frontend:** **Angular application builder** (`ng build`), **standalone** or NgModule-based components per project policy; **Angular Router**; **Angular Material** for components + theming; **Playwright** for E2E (PRD). Client state: **injectable services**, **signals**, and optionally **NgRx** or similar—**ADR** where shared state grows.
- **Backend:** Spring Boot conventions (auto-configuration, executable JAR), Kotlin-first Gradle build, embeddable server suitable for **Cloud Run** container deployment.

**Note:** Scaffolding `ng new` applies when creating the **Angular** tree under **`apps/web/`** (or a subfolder agreed in PLAN); migrating from the **legacy Vue** app in **`legacy/`** may follow **incremental** slices per PLAN (strangler or parallel app). **No imports** from `apps/web/` into `legacy/src/` except documented shared contracts (prefer HTTP/OpenAPI over code sharing).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical (block implementation if unset):**

- **Target runtime stack:** **Angular 21** SPA with **Angular Material** as the primary UI layer; **Kotlin** + **Spring Boot** REST API; **PostgreSQL** on **Neon**; API exposed for SPA-only consumption; **OpenAPI** as contract source of truth (PRD).
- **Deployment topology:** API on **Google Cloud Run** (container); SPA either on **GitHub Pages** or **bundled** with the API (Nginx + static Angular + Spring—documented option A); **development**, **staging**, and **production** each map to a **Neon database branch** and a Cloud Run service; **GitHub Actions** deploy **frontend and backend together** per environment to avoid version skew (NFR-R1). See **ADR-0009** (`docs/adr/0009-neon-postgres-environments.md`).
- **Data ownership:** Relational model in PostgreSQL is the system of record for the target stack; **migration** from legacy Firebase is **phased** (coexistence / dual-write / cutover to be detailed in PLAN and ADRs—not decided here at wire level).

**Important (shape the system):**

- **API style:** **REST** over HTTPS; resource-oriented URLs; **versioning** strategy (e.g. `/v1`) to be fixed before public consumers beyond the SPA (PRD).
- **Validation:** Server-side validation on commands and DTOs (Bean Validation / equivalent); align error response shape for the **Angular** client.
- **Authentication:** Support **Google OAuth** and **email/password** (and flows implied by FR1–FR5); implementation uses **industry-standard** token/session handling for SPA + API (exact mechanism: session vs JWT—**ADR**); password reset and “remember me” per PRD.
- **Authorization:** Troupe-, season-, and event-scoped roles; organizer vs admin vs member; audit of **actor vs subject** for proxy actions (FR17, FR26, FR35)—enforce at API boundary consistently with DOMAIN/SPEC.
- **Frontend structure:** **Angular Router** for SPA routes including **canonical event URLs** per SPEC; **injectable services** / **signals** / optional **NgRx** for shared client state where complexity warrants—document choice in ADR.
- **Observability:** Health/readiness for Cloud Run; structured logging; failures on async channels (push/email) observable without corrupting domain state (NFR-R2).

**Deferred / ADR-level:**

- **ORM vs JDBC:** Spring Data **JPA** vs **JdbcTemplate**/jOOQ—choose under performance and team preference (not fixed in PRD).
- **Web push / FCM vs web-standard push** for the new stack: product requires web push (FR29–FR31); provider integration **TBD** in implementation.
- **WCAG level:** NFR-A1 marks formal level **TBD**.

### Data Architecture

- **Database:** **PostgreSQL** (Neon), one project with **three branches** aligned to **development**, **staging**, and **production** (isolated data per environment; PRD).
- **Modeling:** Normalized relational schema for seasons, events, troupes, members, availability, casts, draws, audit—aligned with DOMAIN; **single active season per troupe** invariant (SPEC/DOMAIN).
- **Migration:** From Firestore → PostgreSQL via planned migration steps (ETL, parallel run, or slice-by-slice)—**execution plan in PLAN**, not duplicated here.
- **Caching:** Start **without** mandatory distributed cache; use HTTP caching headers and DB tuning first; add Redis or similar only if NFR-P1/P2 require it (defer).

### Authentication & Security

- **Transport:** TLS everywhere; secrets in CI/GCP/Neon—not in repo (PRD, NFR-S1).
- **API security:** Authenticated calls for member data; public **read** endpoints only where PRD allows directory/public events (FR32–FR33); rate limiting and abuse controls **TBD** by environment.
- **Privacy:** Least exposure of PII (NFR-S2); GDPR-oriented processes for EU users (NFR-S3).

### API & Communication Patterns

- **Style:** **REST** + **OpenAPI** published for the SPA and integrators.
- **Errors:** Consistent problem+json or project envelope; map to **Angular Material** snackbar/dialog patterns on the client.
- **Inter-service:** Single API service for v1; no requirement for synchronous service mesh in MVP.

### Frontend Architecture

- **UI:** **Angular Material** + theme tokens / Material theming; avoid Tailwind as the **primary** styling layer (PRD).
- **Performance:** Code-splitting, lazy routes for large views; list virtualization or paging for large grids (NFR-P1).
- **PWA:** Installability (FR40) and **update UX** (FR41): detect a pending new client build (service worker / bundler plugin), show a **visible** in-app control so the user **reloads on demand**—no cache-clear as sole remedy, avoid silent forced reload mid-task unless explicitly product-approved.

### Infrastructure & Deployment

- **API:** **Docker** image → **Cloud Run**; config via env/secrets per **GitHub Environment**; Neon connection strings (prefer pooler endpoint for runtime where Neon recommends it) compatible with serverless scale-to-zero.
- **Client:** Static build deployed with the API (**same container**) or to **GitHub Pages** depending on product ops; SPA fallback for deep links including **canonical event URLs**.
- **CI/CD:** One pipeline (or explicitly coupled jobs) versioning client + API together per **development / staging / production** (see `.github/workflows/deploy-v2-cloud-run.yml`).

#### Coupled deploy (NFR-R1) — requirements for GitHub Actions

**Goal:** No environment (**development**, **staging**, **production**) must drift into a state where the **SPA** and **API** were deployed from **independent, unrelated** release decisions. Coupling is **governance + automation**, not “same second” timestamp.

**Minimum rules to implement in CI:**

1. **One workflow per environment line** or one workflow with **GitHub Environments** (`development`, `staging`, `production`) where **both** artifacts for that promotion are built and deployed in a **single run** triggered by the **same event** (e.g. push to `v2` → development; push to `staging` → staging; push to `main` → production for V2 Cloud Run).
2. **Fail closed:** if the API image push / Cloud Run deploy fails, **do not** complete a partial release (e.g. do not publish a standalone static upload if the pipeline is split; with a **single** Cloud Run image bundling SPA + API, the deploy step is already atomic). Use **job dependencies** (`needs:`) or a single job with ordered steps so the pipeline outcome reflects **both** sides when they are separate artifacts.
3. **Shared version label:** expose the same **git SHA** (and optionally short ref or tag) as **build metadata** for both client and API builds (e.g. env var `GIT_SHA` baked into client build + API image label or OTEL resource) so support can confirm **what** is live on each side.
4. **No solo client deploy** to an environment for changes that alter the API contract: such changes go through the **same** coupled workflow; hotfix policy (if ever) is documented in repo ops docs, not ad-hoc static uploads.

**FR41 interaction:** The client may show an in-app **update** CTA when a new SW/bundle is detected; coupled deploy ensures that when users accept the update, they receive a client build that matches the **intended** API revision for that environment.

### Decision Impact Analysis

**Implementation sequence (high level):** (1) Schema + API skeleton + auth; (2) core season/event/availability; (3) draw/composition; (4) notifications; (5) directory/public reads; (6) migration cutover from Firebase.

**Cross-component dependencies:** Composition and draw logic depend on availability and role model; notifications depend on stable **event URLs** and user preferences; audit depends on stable **identity** and **role** resolution on every mutating call.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical conflict points addressed:** naming (DB, REST, code), JSON shapes, dates, errors, test layout, logging—areas where implementers or AI agents could otherwise diverge.

### Naming Patterns

**Database (PostgreSQL):**

- Tables and columns: **`snake_case`** (e.g. `season_id`, `created_at`).
- Foreign keys: `{referenced_table}_id` where applicable.
- Indexes: `idx_{table}_{columns}` (e.g. `idx_events_season_id_starts_at`).

**REST API:**

- Resource paths: **plural nouns**, **kebab-case** if multi-word (e.g. `/v1/seasons`, `/v1/events`, `/v1/troupes`).
- Path parameters: UUID or opaque string IDs as defined in DOMAIN—**no** auto-increment integers in public URLs unless explicitly documented.
- Query parameters: align with JSON convention—recommended **`camelCase`** for query + body from browser clients; document in OpenAPI.

**Code — Kotlin (backend):**

- Types and functions: **PascalCase** / **camelCase** per Kotlin conventions.
- Packages: lowercase, segmented (e.g. `com.hatcast.api.season`).

**Code — Angular (frontend):**

- Components: **PascalCase** class names; selector kebab-case per [Angular style guide](https://angular.dev/style-guide); file names like `event-detail.component.ts` / `.html` / `.scss`.
- Services: **`XxxService`** suffix for injectables; state via **signals** or chosen store—align across features.

### Structure Patterns

**Backend:** Layer by responsibility—`api` (controllers), `application` or `service` (use cases), `domain` (entities/value objects), `infrastructure` (persistence, adapters). Tests: **`src/test/kotlin`** mirroring package structure.

**Frontend:** Prefer **feature-oriented** folders under `src/app/` (e.g. `features/season`, `features/event`) with shared `components/`, `services/`; align with Angular CLI layout when migrating from legacy Vue.

**E2E / unit tests:** **Playwright** for E2E (PRD); **Jest** or **Karma/Jasmine** per Angular workspace defaults—specs alongside components or under `src/` per `angular.json` (document once in repo README).

### Format Patterns

**JSON API:**

- **camelCase** property names in request/response bodies for SPA ergonomics (unless OpenAPI explicitly defines otherwise).
- **Dates/times:** **ISO 8601** strings in **UTC** (e.g. `2026-05-05T18:30:00Z`); avoid ambiguous local strings in payloads.
- **Nulls:** Omit optional fields vs explicit `null`—**one convention** per resource type, documented in OpenAPI.

**Errors:**

- Prefer **RFC 7807 Problem Details** (`application/problem+json`) or a single documented error envelope; always include a **stable `type` URI or code** and human-readable `detail` for the client to map to **Material** snackbars or dialogs.
- HTTP status: **4xx** client, **5xx** server; do not use **200** with error payload for failures.

**Success responses:** Direct resource DTO or `{ "data": ... }`—**one** pattern per API version; document in OpenAPI.

### Communication Patterns

**Browser ↔ API:** Stateless requests; auth via header/cookie per ADR—**do not** mix ad-hoc token query params for mutations.

**Domain events (in-process):** If used, name past tense or `XxxOccurred` in Kotlin; async jobs: idempotent where possible.

**Frontend state:** Prefer **clear** service APIs and **immutable** data where using **signals** or **NgRx**; action names **verb + entity** (e.g. `loadSeason`, `submitAvailability`).

### Process Patterns

**Loading:** Named flags per async domain action (e.g. `isSavingAvailability`) or a small set of global busy states—avoid unbounded ad-hoc booleans.

**Errors:** Central API client interceptor to normalize Problem Details → toast/dialog; log correlation id if provided by API.

**Logging (backend):** Structured JSON logs; **never** log secrets or full tokens; include **request id** when available.

### Enforcement Guidelines

**All implementers MUST:**

- Follow OpenAPI as the contract; regenerate or validate client types when the spec changes.
- Use the same casing rules for DB, JSON, and URLs as in this section (adjust once in ADR if an exception is required).
- Map audit fields (`actor_id`, `subject_id`, timestamps) on every proxy action per FR17/FR26/FR35.

**Verification:** CI runs lint/test; OpenAPI diff reviewed on PRs; optional contract tests against staging API.

### Pattern Examples

**Good:** `GET /v1/seasons/{seasonId}/events` — 200 + list of camelCase DTOs; 404 Problem Detail for unknown season.

**Anti-patterns:** Mixed `userId` and `user_id` in the same response; silent 200 on validation failure; storing local times without timezone in JSON.

## Project Structure & Boundaries

### Complete Project Directory Structure

**As-is monorepo** (aligned with root `ARCH.md` and `docs/technical/MONOREPO.md`): **V1** client is isolated under **`legacy/`**; **V2** client targets **`apps/web/`**; **V2** API targets **`services/api/`**. Firebase Hosting currently serves **`legacy/dist`**.

```
hatcast/
├── .github/workflows/          # CI/CD — coupled frontend + API deploys per PRD (NFR-R1); path filters for V1 vs V2
├── _bmad-output/               # Planning artifacts (PRD, architecture, UX references)
├── apps/web/                   # V2 Angular 21 SPA (scaffold when implementing V2) — npm workspace @hatcast/web
│   └── (angular.json, src/app/ … when created)
├── legacy/                     # V1 Vue 3 + Vite + PWA — reference / current production client build
│   ├── src/                    # components/, views/, services/, …
│   ├── public/                 # Static assets for Vite (URLs served at site root after build)
│   ├── tests/                  # Playwright E2E + Vitest unit (legacy/tests/unit)
│   ├── package.json            # workspace: hatcast-legacy
│   ├── vite.config.js
│   ├── playwright.config.js
│   └── dist/                   # Vite build output → Firebase Hosting (see firebase.json)
├── services/api/               # V2 Kotlin + Spring Boot API (Neon, Cloud Run) — scaffold per Spring Initializr + ADRs
│   └── src/
│       ├── main/kotlin/com/hatcast/…
│       └── test/kotlin/…
├── backend/                    # Optional / legacy stub if present; prefer services/api/ for V2 API per repo convention
├── docs/                       # ADRs, technical docs, user docs (incl. docs/technical/MONOREPO.md)
├── functions/                  # Firebase Cloud Functions (current production; audit imports may reference legacy/src)
├── scripts/                    # DB / maintenance / replay (see AGENTS.md)
├── package.json                # Root npm workspaces: legacy, apps/web
├── package-lock.json
├── firebase.json               # Hosting public: legacy/dist; functions, Firestore, Storage rules at repo root
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── ARCH.md, SPEC.md, DOMAIN.md, PLAN.md, AGENTS.md
└── README.md
```

*Notes:* (1) Exact files under **`services/api/`** appear when the Spring Boot project is generated; package root **`com.hatcast`** is illustrative. (2) **`backend/`** at repo root is not the canonical V2 API home unless explicitly chosen in PLAN — **`services/api/`** matches the documented monorepo layout.

### Architectural Boundaries

**API boundaries:**

- **External HTTP API:** Spring Boot on Cloud Run exposes `/v1/...` to the SPA and (later) other clients; **OpenAPI** is the contract.
- **Legacy:** Until cutover, the V1 SPA under **`legacy/`** may still call **Firestore** and **callable functions** via **`legacy/src/services/`** — boundary is **per feature slice** in PLAN (dual-write vs read-only migration).

**Component boundaries (frontend):**

- **Views** route-level pages; **components** reusable UI; **services** isolate storage/API — no direct Firestore access from views (keep in services layer).

**Data boundaries:**

- **Target:** PostgreSQL (Neon) owned exclusively by **`services/api/`** persistence layer.
- **Legacy:** Firestore schema under `seasons/...` remains documented in DOMAIN/ARCH until migrated.

### Requirements to Structure Mapping

| Area (FR groups) | Primary location |
|------------------|------------------|
| FR1–FR5 Auth | `legacy/src/services/` (firebase.js, auth flows) → migrate to **`services/api/`** security + SPA token/session handling |
| FR6–FR14 Troupe / seasons / events | `legacy/src/views/`, `legacy/src/services/seasons.js`, … → **`services/api/`** domain modules `troupe`, `season`, `event` |
| FR15–FR24 Availability & draw | `legacy/src/services/playerAvailabilityService.js`, selection services → **`services/api/`** + shared draw logic |
| FR25–FR28 Composition lifecycle | Event detail / GridBoard (`legacy/src/components/`) → API resources for casts |
| FR29–FR31 Notifications | `functions/`, client queues → **`services/api/`** async + provider adapters |
| FR32–FR33 Public directory | Public routes + read APIs with reduced DTOs |
| FR34–FR35 Audit | `legacy/src/services/auditClient.js` → persistent audit in PostgreSQL via API |

### Integration Points

**Internal:** **Angular** services in **`apps/web/`** (or legacy Vue services in **`legacy/src/`**) call either Firestore (legacy) or **REST** (`HttpClient`/generated client) to **`services/api/`** — only one path per feature after migration.

**External:** Neon (Postgres), GCP Cloud Run, GitHub Pages, OAuth providers, email/push providers — configured via env/secrets, never committed.

**Data flow:** Browser → REST API → Postgres; async notifications out of band; audit written on same transaction or follow-up event per NFR-R2.

### File Organization Patterns

**Configuration:** Angular `environment.ts` / build-time replacement for frontend; Spring `application.yml` + env for backend; `.env.example` at repo root documents names only.

**Tests:** Playwright **`legacy/tests/*.spec.js`**; backend **`services/api/src/test/kotlin`**; Angular unit tests under **`apps/web/`** per `angular.json` when scaffolded.

**Assets (V1):** `legacy/public/img/` per root ARCH.md for unbundled static files served by Vite/Firebase Hosting.

### Development Workflow Integration

**Dev:** `npm run dev` at repo root (legacy Vue via workspace **hatcast-legacy**); `ng serve` or `npm run dev -w @hatcast/web` once **`apps/web/`** is scaffolded; backend `./gradlew bootRun` or IDE from **`services/api/`** once present.

**Build:** `ng build` in **`apps/web/`** → configured `dist/`; **`npm run build`** at root → **`legacy/dist/`** (current production client); `./gradlew build` in **`services/api/`** → JAR/Docker image for Cloud Run.

**Deploy:** GitHub Actions build both artifacts and deploy in a **coupled** workflow per environment.

## Architecture Validation Results

### Coherence Validation

**Decision compatibility:** The target stack (**Angular 21** + **Angular Material** + Kotlin/Spring Boot + PostgreSQL/Neon + Cloud Run + GitHub Pages + coupled CI) is internally consistent. Legacy Firebase paths and **legacy Vue** client are explicitly bounded until migration; no contradiction with PRD technical success criteria.

**Pattern consistency:** Naming (snake_case DB, camelCase JSON, plural REST), error (Problem Details), and date (ISO 8601 UTC) rules align with Spring and **Angular** norms and reduce agent drift.

**Structure alignment:** **`legacy/`** (Vue V1), **`apps/web/`** (Angular V2), **`services/api/`** (Spring), **`functions/`** (Firebase), **`legacy/tests/`** for Playwright matches brownfield reality and target boundaries (see root **ARCH.md**).

### Requirements Coverage Validation

**Functional requirements:** FR1–FR41 are mappable to API + SPA + async notification layers; guest flows (FR38–FR39) and directory (FR32–FR33) are supported at architecture level; detailed product rules remain in SPEC/DOMAIN.

**Non-functional requirements:** Performance (bounded loads, paging), security (TLS, least privilege), coupled deploys (NFR-R1), async failure handling (NFR-R2), scalability (NFR-SC1), and accessibility baseline (NFR-A1, level TBD) are addressed; numeric SLOs belong outside this document.

### Implementation Readiness Validation

**Decision completeness:** Critical stack and deployment decisions are set; **deferred** items (JPA vs JDBC, JWT vs session cookie, push provider, WCAG level) are explicitly flagged for ADRs—acceptable if tracked before coding those slices.

**Structure completeness:** Repository layout is concrete enough for agents; **`services/api/`** Gradle tree to be generated per Initializr (or ADR if `backend/` is used instead).

**Pattern completeness:** Naming, formats, errors, logging, and audit expectations are documented with examples.

### Gap Analysis Results

| Priority | Gap | Mitigation |
|----------|-----|------------|
| **Important** | Persistence style (JPA vs JDBC) undecided | ADR before first complex query paths |
| **Important** | SPA auth mechanism vs API (session vs bearer) undecided | ADR + security review |
| **Important** | Web push provider for new stack | Story + spike |
| **Minor** | Formal WCAG target | Product decision + audit pass |
| **Minor** | OpenAPI URL versioning detail | Document in first API release |

### Architecture Completeness Checklist

**Requirements analysis:** [x] Context, scale, constraints, cross-cutting concerns — covered in **Project Context Analysis**.

**Architectural decisions:** [x] Stack, deployment, data ownership, API style, authz/audit themes — covered in **Core Architectural Decisions**; deferred items listed.

**Implementation patterns:** [x] Naming, structure, formats, communication, process — covered in **Implementation Patterns & Consistency Rules**.

**Project structure:** [x] Directories, boundaries, FR mapping — covered in **Project Structure & Boundaries**.

### Architecture Readiness Assessment

**Overall status:** **READY** to drive implementation with ADRs for flagged gaps.

**Confidence level:** **Medium–high** — strong alignment with PRD; migration complexity is the main residual risk (managed via PLAN slices, not ignored).

**Key strengths:** Single API + SPA contract; explicit brownfield/legacy boundary; coupled release model; audit and fairness concerns called out early.

**Areas for future enhancement:** Caching layer if NFR-P1/P2 require it; contract tests; expanded observability dashboards.

### Implementation Handoff

**AI agent guidelines:** Follow this document, `SPEC.md`, `DOMAIN.md`, and `ux-design-hatcast-v2.md`; use OpenAPI as the API source of truth; respect implementation patterns on every PR.

**First implementation priorities:** (1) Generate and commit **`services/api/`** skeleton from Spring Initializr + Dockerfile for Cloud Run; (2) publish initial OpenAPI for health + one vertical slice (e.g. season read); (3) add SPA API client module and env wiring under **`apps/web/`**; (4) align first migration story with PLAN.

## Architecture Workflow Completion

This **Architecture Decision Document** was produced through the `bmad-create-architecture` workflow (steps 1–8). **Status:** `complete` (see frontmatter `completedAt`). Use it alongside **PRD**, **SPEC**, **DOMAIN**, and **UX** references for implementation and reviews.
