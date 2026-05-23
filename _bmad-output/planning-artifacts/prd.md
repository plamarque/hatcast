---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: brownfield
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-hatcast-v2.md
  - SPEC.md
  - DOMAIN.md
  - ARCH.md
  - PLAN.md
  - AGENTS.md
workflowType: prd
lastEdited: '2026-05-23'
editHistory:
  - date: '2026-05-23'
    workflow: bmad-validate-prd
    changes: 'Fix Executive Summary typo non-meimportmbers → non-members'
  - date: '2026-05-23'
    workflow: bmad-edit-prd
    changes: 'Add FR42 troupe member CSV import/export, NFR-S4 data safety, MVP admin journey, migration note (Correct Course 2026-05-23)'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 5
---

# Product Requirements Document - hatcast

**Author:** Patrice
**Date:** 2026-04-11

## Executive Summary

HatCast is a **mobile-first web application** (Angular SPA, PWA) delivered as **SaaS** for **improvisation troupes**: it supports **seasons** and **shows (spectacles)**, collects **availability by role**, lets organizers **compose lineups** manually or via a **weighted random draw**, runs a **validation and confirmation** workflow, and uses **notifications** with tracking of **confirmations and withdrawals**. The product targets **troupe members**, **organizers**, and **administrators**; a **public directory** lists freemium troupes (non-opt-out) so non-members can discover seasons and events—read scope for private content remains a future premium hypothesis.

The underlying need is not "another signup form" but **trust and clarity** when building teams under time pressure: people change plans, slots open, and groups need a **single system of record** for availability, composition state, and who decided what—**including when someone acts on behalf of someone else**, with **auditability**.

**Success looks like** troupes running seasons with less coordination friction: fewer ad-hoc spreadsheets and chat threads, **fairer-feeling** selections that participants can **understand** (odds, explanations), and organizers who can **recover from churn** (withdrawals, gaps) without restarting from zero.

### What Makes This Special

- **Fairness + pedagogy:** Weighted draws with **transparent odds** and **explainable** mechanics—not only "random names," but a selection model users can **reason about** (including role-specific pools and replacement rules as configured per show).
- **End-to-end troupe workflow:** One product spans **availability → draft composition (restricted visibility) → validation → locked composition → confirmations/declines → gap filling** (manual or partial lottery) with consistent **status semantics** across the lifecycle.
- **Brownfield + forward vision:** **HatCast V1 is in production** on **Firebase** (Firestore, Auth, Cloud Functions); this PRD aligns **product intent** with existing normative specs (**SPEC / DOMAIN / ARCH / PLAN**) while capturing **V2 directions** from the product brief (freemium directory, expanded role/event model, analytics depth, premium hypotheses **explicitly out of initial V1 scope** where noted).

## Project Classification


| Dimension                                | Value                                                                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project type**                         | **Web application** — SPA + PWA, browser-first, responsive                                                                                                             |
| **Domain**                               | **General software** (non-regulated vertical); product sub-domain: **live performance / improvisation troupe coordination**                                            |
| **Complexity (regulatory / compliance)** | **Low** — standard security, privacy, UX, and performance expectations; no default assumption of HIPAA/PCI-style regimes                                               |
| **Project context**                      | **Brownfield** — existing production system and repository documentation; PRD informs evolution and rewrite planning without replacing normative repo specs by default |


## Success Criteria

### User Success

- **Members** can state availability and role intent for upcoming shows **without** repeated back-and-forth outside the app; they understand **why** a draw landed where it did when odds/explanations are surfaced (trust + reduced disputes).
- **Organizers** can move a show through **availability → composition → validation → confirmations** with clear **state** (“preparing”, gaps, declined slots) and can **recover** from withdrawals without rebuilding the entire plan from scratch.
- **Administrators** can configure seasons/events/roles and, where applicable, **audit** “acted for another user” actions with **actor vs subject** clarity.
- **Visitors** can **discover** freemium troupes via the directory and browse **public** seasons/events as defined by the freemium rules (private/premium remains out of initial V1 scope per brief).

### Business Success

- **Adoption:** New troupes can onboard and run at least **one season** with **core flows** (events, availability, composition path) in production; freemium listing remains **non-opt-out** for listed troupes as a deliberate growth/trust trade (hypothesis to validate in interviews).
- **Engagement:** Organizers return across multiple shows per season (repeat use of composition, notifications, gap-filling workflows)—exact targets **TBD** with product analytics once instrumentation is agreed.
- **Monetization (post-V1):** Premium hypotheses (private seasons/events, advanced lottery, guests, etc.) remain **explicitly not V1**; success first is **proving core value** and directory transparency, not immediate ARPU.

### Technical Success

- **Reliability (target stack):** Core domain operations are enforced by the **API and PostgreSQL-backed** model with **development / staging / production** parity (Neon branches per environment); coupled **GitHub Actions** releases reduce client/API drift.
- **Deliverability:** Email and **web push** paths meet “good enough” operational standards (failures observable; no silent mass loss of user-visible actions).
- **Client quality:** **PWA** installability and **post-deploy self-update**; **mobile-first** layouts; critical routes covered by automated tests (**Playwright** and unit tests, e.g. **Jest** with Angular or the test runner chosen in the Angular workspace) without disabling tests to ship.
- **Legacy note:** Until migration completes, production may still reflect `ARCH.md` (Firebase); success criteria above describe the **intended end state** on Kotlin/Spring Boot + Neon.

### Measurable Outcomes

- **Leading:** Time-to-first-availability submission after invite; time from “composition validated” to “all required confirmations received” (where trackable); notification click-through to canonical event URLs (when links are standardized per SPEC slices).
- **Lagging:** Reduction in organizer-reported “manual rework” after withdrawals (qualitative until survey instrument exists); troupe retention across seasons (**TBD** baseline).

## Product Scope

### MVP - Minimum Viable Product

Must preserve and stabilize what **SPEC** marks as **Must have** today: seasons/events/players; availability; weighted draw; casts and confirmation/decline; auth flows; admin boundaries; audit hooks; responsive UI + PWA baseline; multi-select participant/event selectors where specified.

**PRD-oriented MVP for evolution:** Canonical **event URL** and **event-details** behaviour where already sliced in **PLAN/SPEC** (full-screen event, tabs, inline composition) is treated as **product delivery scope** when those slices are scheduled—not as speculative fluff.

### Growth Features (Post-MVP)

- Deeper **fairness analytics** and season history views described in the brief (stats, “demand satisfaction”, expanded UX for lottery pedagogy).
- **Premium** packaging experiments (private content, guests, advanced lottery) **after** core adoption signals—aligned with brief’s “validate via interviews / in-app tests.”

### Vision (Future)

- **Premium tier** with validated paywalls; richer **guest** flows; optional **multi-tenant** org features beyond current troupe model—only where validated against user research and business goals.

## User Journeys

### 1) Léa — Troupe member (happy path)

**Opening:** Léa joue dans une troupe avec une saison chargée. Avant HatCast, elle oubliait les dates et négociait ses rôles dans cinq fils de messages.

**Rising action:** Elle installe la PWA, reçoit une annonce “spectacle prêt” pour les dispos, ouvre l’événement sur mobile, renseigne **dispo / indispo** et coche les **rôles** demandés par le type de spectacle. Après le tirage, elle consulte la **composition**, voit les **cotes / explications** si affichées, et comprend pourquoi elle est sur un rôle plutôt qu’un autre.

**Climax:** Elle **confirme** sa participation depuis le flux prévu (lien / onglet Équipe) sans relance manuelle interminable.

**Resolution:** Moins de friction cognitive ; la troupe avance vers “équipe confirmée” avec un fil d’état clair. **Requirements surfaced:** notifications + deep links canoniques vers l’événement, disponibilités par rôle, affichage composition et confirmation.

### 2) Marc — Organizer (composition, gap after withdrawal)

**Opening:** Marc prépare un match dans deux semaines. Un joueur confirmé **se désiste** après validation initiale.

**Rising action:** Il voit l’état **À compléter / trous** (ou équivalent métier), identifie le slot libre, **remplit** manuellement ou lance un **tirage partiel** selon les règles du spectacle. Il renvoie une **notification** ciblée pour débloquer les confirmations restantes.

**Climax:** Il ne repart pas d’un tableur vierge : la **composition reste l’objet central**, l’historique et les statuts l’aident à décider vite.

**Resolution:** La soirée peut rester viable sans recomposer toute la saison depuis zéro. **Requirements surfaced:** statuts de composition, désistements, remplissage de slots, loterie partielle, canaux de notification cohérents avec URLs d’événement.

### 3) Amira — Season / troupe admin (configuration + audit)

**Opening:** Amira gère la structure de la saison : types de spectacles, rôles requis, organisateurs par spectacle.

**Rising action:** Elle crée/édite des **spectacles**, assigne des **permissions** (saison / spectacle), **importe ou exporte la liste des membres** (CSV documenté) pour migrer depuis HatCast V1, initialiser une nouvelle troupe, ou déplacer des membres entre troupes, et règle un cas où une organisatrice a **modifié la dispo** d’un membre : elle consulte la **piste d’audit** (acteur vs sujet, horodatage).

**Climax:** Elle peut expliquer à la troupe *qui* a fait *quoi*, sans ambiguïté.

**Resolution:** Gouvernance acceptable pour une communauté bénévole. **Requirements surfaced:** admin UI, rôles et granularité, import/export membres CSV (migration V1→V2 et réutilisation inter-troupes), audit consultable, cohérence avec le modèle de permissions V2.

### 4) Julien — Anonymous visitor (directory → public discovery)

**Opening:** Julien cherche une troupe locale pour assister à des cabarets.

**Rising action:** Il parcourt l’**annuaire** (cartes troupes : nom, logo, description courte, stats publiques), ouvre une troupe **freemium** et parcourt **saisons / spectacles publics** sans compte selon les règles actuelles.

**Climax:** Il trouve une date qui l’intéresse et un point d’entrée clair vers les infos spectacle (lien partageable).

**Resolution:** La troupe gagne en visibilité sans travail manuel de “site vitrine” séparé. **Requirements surfaced:** listing public non désactivable pour freemium, pages saison/spectacle lisibles, SEO/perf raisonnables (niveau à préciser hors PRD technique).

### 5) Edge — “Why not me?” (trust + recovery)

**Opening:** Un membre conteste implicitement le tirage (“je suis toujours sur la touche”).

**Rising action:** Il ouvre l’explication des **chances**, compare avec ses dispos passées ; s’il se **désiste**, l’organisateur suit le parcours Marc (slot libre).

**Climax:** Soit il accepte la transparence, soit l’organisateur a des **données** (audit, historique) pour clarifier.

**Resolution:** Conflit désamorcé par **pédagogie + traçabilité**, pas par messages opaques. **Requirements surfaced:** UX de pédagogie du tirage, historique/analytics plus riches en **growth** (pas nécessairement MVP entier).

### 6) Camille — Organizer, missing DJ, inviting a non-member

**Opening:** Camille verrouille presque la compo d’un spectacle alors qu’il **manque un DJ** : personne dans la troupe n’est dispo ou qualifié pour ce créneau.

**Rising action:** Elle utilise un flux **inviter un contributeur externe** (non membre de la troupe) : lien ou invitation ciblée **rôle DJ**, **périmètre** limité à ce spectacle (ou à une liste d’événements définie par la troupe). Le système doit distinguer **membre** vs **invité** pour les permissions, les notifications et l’audit.

**Climax:** Le DJ invité accepte, renseigne ce qui est attendu (dispos / confirmation selon le workflow), et Camille **assigne** le slot sans casser le cycle de validation du spectacle.

**Resolution:** La soirée peut combler un rôle critique sans élargir toute la gouvernance de la troupe à un inconnu. **Requirements surfaced:** invitations rôle-scopées, statut “guest”, traçabilité, cohérence avec modèle d’accès (souvent aligné **premium** / phase ultérieure dans le brief).

### 7) Alex — Guest / non-member (availability without default lottery)

**Opening:** Alex n’appartient pas à la troupe mais est sollicité·e pour un ou plusieurs spectacles (ex. DJ ponctuel, renfort scène).

**Rising action:** Alex reçoit une invitation à **déposer des dispos** sur **un ou plusieurs** événements. Les règles ne sont **pas** forcément celles des membres : le produit doit supporter des modes tels que — **hors pool de tirage par défaut**, **joker / dernier recours** si le slot reste vide, ou **choix explicite** par l’organisateur pour un spectacle donné (sans passer par le même tirage pondéré que les membres).

**Climax:** L’organisateur voit clairement **comment** ce profil peut être retenu (mécanique transparente), et Alex sait **jusqu’où** son engagement va (quel spectacle, quel rôle, quelles attentes de confirmation).

**Resolution:** Flexibilité pour les **contributions ponctuelles** sans diluer la logique “membre” ni créer de zone grise sur le **fairness** perçu. **Requirements surfaced:** modèle de **sélection invité** (exclusion loterie / joker / assignation directe), préférences et contraintes par événement, notifications et audit adaptés ; **découpage MVP vs premium** à trancher (le brief place souvent les invités avancés hors V1).

### Journey Requirements Summary

- **Collaboration:** disponibilités, composition brouillon vs validée, confirmations/désistements, notifications.
- **Fairness UX:** pondération, transparence des chances, tirage complet ou partiel **pour les membres** ; parcours distinct pour **invités** lorsque les règles diffèrent.
- **Guests / non-members:** invitation ciblée par rôle et par spectacle ; dispos sur un sous-ensemble d’événements ; modes de **sélection** configurables (hors tirage, joker, choix direct).
- **Governance:** rôles admin/organisateur, audit acteur/sujet, frontière claire membre / invité.
- **Growth:** stats de saison / “demand satisfaction” (brief), au-delà du MVP fonctionnel listé dans le scope.
- **Public discovery:** annuaire + lecture publique freemium (hypothèses premium pour contenu privé plus tard).

## Innovation & Novel Patterns

### Detected Innovation Areas

- **Explainable fairness UX:** Surfacing draw odds and “why this outcome” narratives for volunteer troupes—positioning transparency as a first-class collaboration feature, not an afterthought.
- **Lifecycle-native composition:** Treating show state (draft vs validated cast, gaps, withdrawals, partial redraws) as a coherent model rather than ad-hoc spreadsheet edits.
- **Guest / non-member contribution patterns:** Role-scoped invites and selectable placement modes (outside default lottery, joker/last-resort, organizer pick) for occasional contributors (e.g. DJs)—reducing friction without collapsing member vs guest semantics.

### Market Context & Competitive Landscape

- Generic **calendars**, **polls**, and **chat** lack structured fairness mechanics and audit-friendly team formation for recurring performance groups.
- **Sports/league** schedulers optimize different constraints; **theatre/improv troupes** need role-aware availability, cultural norms around perceived fairness, and lightweight admin overhead.
- **Assumption:** Few products combine **public troupe discovery (freemium)** with **deep cast workflow** in this niche; validation should compare against spreadsheets, WhatsApp, and horizontal event tools.

### Validation Approach

- **Qualitative:** Organizer/member interviews on trust after draws; observe “dispute moments” and whether explanations reduce tension.
- **Quantitative (when instrumented):** Time-to-fill slots after withdrawals; confirmation completion rate; optional A/B on explanation depth.
- **Prototype tests:** Sequenced draw UX and guest-invite flows as isolated usability sessions before full build-out (especially if premium-scoped).

### Risk Mitigation

- **Fairness skepticism:** Keep algorithms and parameters documented for organizers; avoid black-box messaging.
- **Scope creep on guests:** Gate advanced guest rules behind clear MVP vs premium decisions (per product brief).
- **Over-building pedagogy:** Ship minimum explainability that is truthful; expand visualization in growth iterations.

## Web Application Specific Requirements

### Project-Type Overview

The product is an **Angular 21** SPA using **Angular Material** as the primary UI layer (**avoid Tailwind as the main styling approach**; utilities may exist but must not drive layout/visual design). The backend is implemented in **Kotlin** on **Spring Boot** (Spring ecosystem; use the **latest stable** Spring Boot release line at implementation time), exposes a **RESTful HTTP API**, and persists to **PostgreSQL** hosted on **Neon**. **Firebase Hosting is not part of the target architecture.**

### Technical Architecture Considerations

- **Frontend:** Angular SPA consuming **only** the public **REST API**; **Angular Material** for responsive, consistent components.
- **Backend:** **Spring Boot** (Kotlin) services packaged as **Docker** images deployed to **Google Cloud Run**.
- **Database:** **PostgreSQL** on **Neon** (managed Postgres). Connection from Cloud Run uses **per-environment** Neon branch connection strings; credentials live in **GitHub Environments secrets** (and optionally GCP Secret Manager), not in the repository—see repository ADR-0009 and `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`.
- **Frontend hosting:** Static SPA may be served from **GitHub Pages** or bundled with the API in a **single Cloud Run** container (documented option A: Nginx + Angular + Spring); SPA deep-link routing must be supported in either case.
- **API contract:** Publish **OpenAPI** (or equivalent) as the integration source of truth; URL versioning strategy **TBD** (e.g. `/v1`).

### Data & environments

- **Development:** A dedicated **development** integration environment (e.g. deploys from branch `v2`) uses a **Neon branch** (e.g. `development` or `dev`) separate from staging and production data.
- **Staging:** A dedicated **staging** environment is required. Use a **Neon database branch** for **staging** data, separate from production and development.
- **Production:** Neon **primary** branch + Cloud Run production service; SPA origin per deployment model (GitHub Pages or same Cloud Run URL as the API when using the bundled image).
- **Deployment alignment:** **GitHub Actions** must deploy **frontend and backend together** per environment (single workflow or explicitly coordinated jobs with shared versioning) so **API and UI do not drift**—no environment where one side updates without the other when changes are interdependent. Apply the same **coupled** principle to **development** and **staging** releases.

### Authentication & Sessions (product-level, V1-like simplicity)

Users must be able to sign in with **Google** or **email + password**. Required flows:

- **Forgot password / password reset**
- **Long-lived sessions** consistent with a **“remember me”** expectation on trusted devices (comparable in simplicity to HatCast V1). Exact token/cookie mechanics are architecture decisions, not fixed in this PRD.

### Push notifications (web)

- The product **requires browser push notifications** for time-sensitive troupe workflows (exact event types follow functional priorities), with **explicit opt-in** and **preferences** by notification type where the product defines them.
- In the **target stack** (Kotlin/Spring Boot REST + PostgreSQL—not Firebase Cloud Messaging as the long-term backbone), use **Web Push**: **service worker** subscription, **VAPID** (or equivalent) keys managed outside the repo, **subscription records** in PostgreSQL, and server-side send paths—details belong in architecture; this PRD **requires push as a capability** on supported browsers.

### PWA updates (self-service)

- The app remains a **PWA** (manifest + service worker). After each **frontend** deployment (Pages or Cloud Run bundle), users must **receive new frontend versions** without relying on manual “hard refresh” habits.
- **Requirement:** a **service worker update strategy** that **automatically activates** new builds on a predictable trigger (e.g. next navigation, app focus, or periodic checks). Goal: **stale clients do not linger** after release. Exact UX (silent vs rare prompt) is an implementation choice (e.g. **@angular/pwa** / Angular service worker), aligned with **coupled front/back releases**.

### Browser Matrix

- **Primary:** Evergreen Chromium and Safari on **iOS** and **Android**; desktop Chrome/Edge/Firefox/Safari for admin-heavy workflows.

### Responsive & Mobile-First Design

- **Angular Material**–first layouts; mobile-first member flows; admin may optimize for larger screens while staying usable on tablet.

### Performance Targets

- REST list endpoints should use **pagination** and avoid chatty N+1 patterns. DB indexing for hot paths (season/event/cast) is addressed in architecture.

### SEO Strategy

- Public/directory surfaces remain SEO-relevant where content is public; the choice of static host does not change that intent.

### Accessibility Level

- Prefer **Angular Material** patterns and semantic HTML; formal WCAG audit level **TBD**.

### Implementation Considerations

- **CORS:** The SPA origin(s) for each environment (e.g. Cloud Run URL when the SPA is served from the same service, or GitHub Pages URL) must be allowed to call the API; build-time configuration of API base URL per environment.
- **Secrets:** GitHub Actions authenticates to GCP for deploy; runtime secrets in GCP (Secret Manager or equivalent).
- **Migration from V1:** `ARCH.md` describes **Firebase**; this section describes the **target** stack. Migration (data, auth cutover, replacing FCM-based flows with Web Push) is a **program**, not a single PRD bullet. **Troupe member onboarding** for cutover includes a **documented CSV import/export** path (FR42) so administrators can migrate member lists from HatCast V1 and reuse the capability for troupe-to-troupe moves or rapid troupe initialization.

### REST API Expectations (product-level)

- Resource-oriented REST; consistent error payloads; **idempotency** for sensitive writes (invites, confirmations) where appropriate.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** **Platform + problem-solving MVP** on the **target stack**: prove that a **Kotlin / Spring Boot + PostgreSQL (Neon) + REST** backend and an **Angular 21 + Angular Material** frontend can support the **core troupe loop** (availability → composition → validation → confirmations) with **development / staging / production** parity (Neon branches), **coupled CI/CD**, and **non-negotiable UX baselines** (auth simplicity, push, PWA self-update). Defer deep **guest/premium** mechanics until core adoption is validated.

**Resource Requirements:** Team skills spanning **Angular/TypeScript**, **Kotlin + Spring Boot**, **PostgreSQL (Neon)**, **GCP Cloud Run**, **GitHub Actions**—exact headcount **TBD**.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Troupe **member**: sign in (Google or email/password, reset, long session), set availability, view composition and odds where the product surfaces them, confirm or decline participation, receive **web push** (opt-in).
- **Organizer**: compose and validate lineups, handle gaps and withdrawals using manual or partial draw paths as scoped for MVP.
- **Admin**: administer seasons, events, and members within the permission model; **export and import troupe member lists** (documented CSV) when authorized—to support HatCast V1→V2 migration, troupe-to-troupe moves, or rapid initialization of a new troupe; consult **audit** trails for sensitive actions where implemented.
- **Visitor** (as scoped for MVP): **public discovery** of troupes and public seasons/events per freemium rules—or a **deliberately reduced** surface if the program stages cutover (**delivery decision**).

**Must-Have Capabilities:**

- **REST API** with a published contract baseline; **PostgreSQL on Neon**; **Spring Boot** backend on **Cloud Run**; frontend as static assets (**GitHub Pages** and/or **same-origin** in the Cloud Run image per deployment choice); **development, staging, and production** with isolated **Neon branches** and **coupled** front/back deployments per environment.
- **Authentication:** Google and email/password, forgot password, remember-me-style long sessions.
- **PWA:** manifest and service worker with **automatic update** behaviour after deploy.
- **Web Push:** opt-in, server-side subscription storage, send path integrated with the backend.
- **Core domain:** seasons, events, players, availability, weighted draw / cast workflow, confirmations—aligned with SPEC intent, delivered on the new stack (full **UI parity** with legacy is not assumed for the first cut).
- **Troupe member import/export (MVP-enabling):** authorized administrators can export and import troupe member lists in a documented CSV format to support V1→V2 cutover and ongoing troupe administration (FR42).

### Post-MVP Features

**Phase 2 (Growth):**

- Richer **guest / non-member** flows (invites, joker/direct pick modes) and **premium** experiments per product brief.
- Deeper **fairness analytics**, season history, directory and SEO refinements.
- Operational hardening: observability, rate limits, backup/restore runbooks for Neon.

**Phase 3 (Expansion):**

- Broader **premium** packaging; optional **multi-tenant** org features; advanced integrations—only after validation.

### Risk Mitigation Strategy

**Technical Risks:** **Big-bang rewrite risk**—mitigate with **staging-first** workflows, **contract-first API**, incremental vertical slices, and explicit **parity checkpoints** against SPEC for critical journeys. **Neon + Cloud Run** (and optional **GitHub Pages** if used): validate **CORS**, **per-environment secrets**, and **coupled releases** early.

**Market Risks:** Troupes may stay on legacy workflows until the new stack proves value—mitigate with **pilot troupes** and measurable **time-to-compose / time-to-confirm**.

**Resource Risks:** If capacity drops, **narrow MVP** to a **single troupe archetype** and one primary organizer path, while keeping **auth + push + PWA update + coupled deploy** as platform hygiene.

## Functional Requirements

### Authentication & sessions

- FR1: A user can sign in with an OAuth identity provider associated with “sign in with Google” (or equivalent) where offered.
- FR2: A user can sign in with email address and password.
- FR3: A user can request a password reset and complete password recovery via email.
- FR4: A user can stay signed in across visits on a trusted device when “remember me” (or equivalent) is selected.
- FR5: A signed-in user can sign out.

### Troupe & membership

- FR6: A user can belong to a troupe as a member with a member profile for that troupe.
- FR7: A troupe administrator can manage which users are members and their baseline roles for that troupe, within the permission model.
- FR8: A user can navigate between troupes they belong to (when multiple membership exists).
- FR42: A troupe administrator can export and import troupe member lists in a documented CSV format, within the permission model, to support HatCast V1-to-V2 migration, migration from one troupe to another, and rapid initialization of a new troupe.

### Profile & representation

- FR9: A member can edit a **troupe-specific display name (pseudo)** that the application uses as their visible name when identifying them **within that troupe**.
- FR10: A user can add or change a **profile avatar** image shown in the interface; when the user signs in with Google, they can **use the Google account profile image** as their avatar (or keep a custom image, according to product rules).

### Seasons & events

- FR11: An administrator can create, edit, and archive seasons for a troupe.
- FR12: An administrator can create, edit, and archive events (spectacles) within a season, including scheduling and venue-related information as supported by the product.
- FR13: A member can view the list of events in a season they belong to.
- FR14: An administrator can configure event types and required/optional roles for events according to troupe rules.

### Availability

- FR15: A member can record availability (available / unavailable / unknown as applicable) per event.
- FR16: A member can indicate role-level availability when the event type requires role choices.
- FR17: An organizer or administrator can record or adjust availability on behalf of a member when permitted, with auditability of who acted.
- FR18: A member can add an optional comment on availability when the product provides that field.

### Composition & draw

- FR19: An organizer can view who is available for each role for an event.
- FR20: An organizer can run a weighted random draw to fill roles according to troupe/event rules.
- FR21: An organizer can manually assign or reassign players to roles when permitted.
- FR22: An organizer can save a draft composition that is not yet visible to ordinary members when the workflow defines draft visibility.
- FR23: An organizer can validate (lock) a composition when the workflow requires validation before confirmations.
- FR24: A member can view explainability information for selection odds when the product surfaces it for that event.

### Confirmations & withdrawals

- FR25: A member can confirm or decline participation for their assigned role when a composition is in the confirmation phase.
- FR26: An organizer or administrator can confirm or decline on behalf of a member when permitted, with auditability.
- FR27: When a member withdraws or declines, organizers can see resulting gaps and take follow-up actions supported by the product (e.g. refill slot).
- FR28: The product can represent composition lifecycle states (e.g. preparing, awaiting confirmations, complete) consistently for an event.

### Notifications

- FR29: A user can opt in to browser push notifications globally or per relevant categories when offered.
- FR30: A user can manage notification preferences when the product defines notification types.
- FR31: The product can deliver notifications for key workflow events (e.g. availability open, composition ready, confirmation prompts) according to policy.

### Public discovery

- FR32: A visitor without membership can browse the public troupe directory when the troupe is listed publicly.
- FR33: A visitor can view public season and event information for troupes and content marked public.

### Administration & audit

- FR34: A troupe administrator can configure who may act as organizer at season or event scope when the model supports it.
- FR35: An authorized user can view an audit trail of significant changes (including availability and composition changes and impersonation-style actions) with actor and timestamp.

### Account & profile (account-level)

- FR36: A user can update account credentials and profile fields supported by the product (e.g. email change flow).
- FR37: A user can delete their account when the product supports account deletion.

### Guest & external contributors (post-MVP / phased)

- FR38: An organizer can invite a non-member to contribute to a specific role for a specific event or set of events when that capability is enabled for the troupe.
- FR39: An invited non-member can submit availability for the invited scope without being subject to the same default draw rules as full members when the troupe configures alternative selection modes (e.g. organizer pick, last-resort/joker).

### Application delivery to users

- FR40: A user can install or add the web application for quick access on supported platforms (PWA installability).
- FR41: After the organization deploys a new client version, users receive updated client behaviour without being expected to perform a technical manual cache-clear as the only remedy.

## Non-Functional Requirements

### Performance

- **NFR-P1:** Primary interactive flows (season grid, event view, submit availability, open composition) remain usable on typical mobile network conditions; list views use paging or equivalent so loads do not transfer unbounded rows in one request.
- **NFR-P2:** API responses for common read operations stay within an acceptable interactive window for expected troupe sizes (numeric thresholds belong in service-level objectives outside this PRD).

### Security & privacy

- **NFR-S1:** Credentials and session tokens are protected in transit (TLS) and handled on client and server according to current best practices.
- **NFR-S2:** Personal data (email, avatar, troupe display names, participation data) is exposed only to identities and roles allowed by the permission model.
- **NFR-S3:** Account deletion and personal-data handling support expectations for EU users (e.g. GDPR-oriented processes at the organizational level—detailed in privacy policy and operations).
- **NFR-S4:** Member import/export handles personal data safely: only authorized administrators can access it; exports include only documented fields; imports validate input before persistence; import results expose actionable row-level outcomes without leaking data to unauthorized users.

### Reliability & operations

- **NFR-R1:** For each promoted environment (**development**, **staging**, **production**), **frontend and backend** deploy together so client and API versions do not drift unintentionally.
- **NFR-R2:** Asynchronous delivery (web push, email) fails gracefully: failures are observable and do not leave core domain state inconsistent.

### Scalability

- **NFR-SC1:** The system supports growth from a small number of troupes to a larger base without a redesign of core domain partitioning (horizontal scaling details are architectural).

### Accessibility

- **NFR-A1:** Core member and organizer tasks are operable with keyboard where applicable, with semantic structure and visible focus; contrast meets a pragmatic baseline (formal WCAG level **TBD**).

### Integration

- **NFR-I1:** Google sign-in and email used for password reset integrate reliably with provider behaviour; failures surface clearly to the user.

