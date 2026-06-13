---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
lastUpdated: 2026-06-04
updateMode: incremental
status: ready-for-development
ceRevision: '2026-06-04 — Epic 19 Wave D: formules, politiques par catégorie, choix orga au tirage'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/plan-v2-league-journey.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-05-23.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24-league-views-stats-deplacement.md
  - docs/adr/0011-league-model-and-user-agenda.md
  - docs/adr/0012-league-views-travel-leagues-member-stats.md
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md
  - _bmad-output/design-thinking-2026-05-25.md
  - SPEC.md
  - DOMAIN.md
---

# hatcast - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for **hatcast**, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories. Normative behaviour for the live product remains **SPEC.md** and **DOMAIN.md**; this file tracks **delivery** structure.

## Requirements Inventory

### Functional Requirements

- FR1: A user can sign in with **Google** in MVP. Additional third-party identity options may be added later using the same account-linking rules.
- FR2: A user can sign in with email address and password.
- FR3: A user can request a password reset and complete password recovery via email.
- FR4: A user can stay signed in across visits when **"remember me"** (or equivalent) is selected. In MVP, a remembered session remains valid for **at least 30 days** or until the user signs out, changes password, or deletes the account—whichever occurs first.
- FR5: A signed-in user can sign out.
- FR6: A user can belong to a troupe as a member with a member profile for that troupe. Active troupe members have default access to **active seasons** for that troupe.
- FR7: A **troupe administrator** can manage which users are members and their baseline troupe roles. Troupe membership is distinct from season/event participation records.
- FR8: A user can navigate between troupes they belong to (when multiple membership exists).
- FR9: A member can edit a **troupe-specific display name (pseudo)** that the application uses as their visible name when identifying them **within that troupe**.
- FR10: A user can upload or replace a **profile avatar** image (accepted formats: **JPEG, PNG, WebP**; maximum **2 MB**). A user who signs in with **Google** can **import the Google profile photo once** from account settings or at first Google sign-in; after import, the user may replace it with a custom upload at any time.
- FR11: An administrator can create, edit, and archive seasons for a troupe.
- FR12: An administrator can create, edit, and archive events (spectacles) within a season. Each event includes at minimum: **title**, **date and time** (or start/end window), **location or venue label**, **description** (optional), **event type**, and **lifecycle status** (active vs inactive/archived). Inactive or archived events are hidden from ordinary members and visitors; administrators and authorized organizers retain access.
- FR13: Active troupe members can view **active** seasons and events for their troupe by default. Inactive or archived events are not listed on member and visitor surfaces. Authorized season/event participants who are not troupe members can access only the active season or event scope granted to them, according to the permission model.
- FR14: An administrator can configure event types and required/optional roles for events according to troupe rules, including whether **volunteer availability is mandatory** when a participant marks a play role as available.
- FR15: A **linked participant** can record availability per event as **available**, **unavailable**, or **unknown**, within their authorized season or event scope.
- FR16: A linked participant can indicate role-level availability when the event type requires role choices. When a play role is marked available and the event type has **mandatory volunteer coverage** configured (FR14), volunteer availability is recorded as available for that event unless the participant explicitly marks volunteer unavailable.
- FR17: A **season organizer, event organizer, or troupe administrator** can record or adjust availability on behalf of a participant in their authorized scope, including name-only or not-yet-linked participants, with auditability of who acted.
- FR18: In MVP, a linked participant can add an optional free-text **availability comment** (maximum **500 characters**) on their availability submission for an event. A **season organizer, event organizer, or troupe administrator** (same scope as FR17) can add or edit the same field on behalf of a participant. Comments appear to organizers and administrators on the event availability view; they are not shown on public discovery pages.
- FR19: An organizer can view eligible participants who are available for each role for an event.
- FR20: An organizer can run a weighted random draw to fill roles according to troupe/event eligibility rules.
- FR21: A **season organizer, event organizer, or troupe administrator** can manually assign or reassign participants to roles for events in their scope. A single participant **may hold multiple roles** on the same event; role-stacking is **allowed by default** per event type unless an administrator disables it in event-type configuration (FR14).
- FR22: An organizer can save a **draft composition** that is **hidden from ordinary troupe members by default**. The organizer **publishes** the draft via an explicit action to make it visible to members; until published, only organizers and administrators see draft slot assignments.
- FR23: An organizer can **validate (lock)** a composition **before confirmation requests are sent** to participants. A **season organizer, event organizer, or troupe administrator** can **unlock or invalidate** a validated composition to return it to an **organizer-visible editable draft** (`validatedAt` cleared). **Unlock preserves** each assigned slot's participation status (`confirmed`, `declined`, `pending`). **Draft edits** (manual assign, replace, clear, draw on a slot) set **`pending`** on slots whose **assignee changes**; unchanged slots keep their status. **Re-validation** after unlock sends confirmation intents only to assignees who are **not `confirmed`** at re-validation time (and to **newly assigned** participants). Ordinary troupe members **do not see** slot assignments after unlock until the composition is validated again, regardless of `publishedAt`.
- FR24: For events using weighted draw, included participants can view **per-role selection odds** (or equivalent explainability summary) on the event composition view **after the organizer publishes the draft (FR22)** or **after validation (FR23)**. Odds are not shown for events or roles excluded from the draw model (e.g. direct-assignment slots).
- FR25: A linked participant can confirm or decline participation for their assigned role **after the composition is validated (FR23)** and while the event is in **awaiting confirmations** or **gaps to fill** (FR28).
- FR26: A **season organizer, event organizer, or troupe administrator** can confirm, decline, or reset to pending on behalf of a participant in their authorized scope, including name-only or not-yet-linked participants, with auditability — **including while the composition is in organizer draft** (`validatedAt` null). Proxy participation in draft is **not notified** to the subject until composition **validation or re-validation** (FR31). **Linked members** may still confirm or decline **only after validation** (FR25).
- FR27: When a participant withdraws or declines during **awaiting confirmations** or **gaps to fill** (FR28), organizers see the resulting **open slot(s)** on the event composition view and can: **view gap details**, **manually assign a replacement**, **run a partial weighted draw** for the open role(s), and **trigger a targeted confirmation notification** to affected participants.
- FR28: The product represents composition lifecycle states consistently for each event using at minimum: **preparing** (availability collection), **draft composition** (editable, not yet validated), **awaiting confirmations** (validated lineup), **gaps to fill** (open slots after decline/withdrawal), and **complete** (all required roles confirmed or explicitly waived by a **season organizer, event organizer, or troupe administrator**).
- FR29: In MVP, a user can **opt in or out of browser push notifications globally** (same scope as FR30). Per-category push preferences are post-MVP.
- FR30: In MVP, users can opt in or out of browser push notifications **globally**. Category-level preferences (e.g. availability vs confirmation) are **deferred post-MVP**; global push opt-in governs all notification types that use push.
- FR31 *(member intents)*: **MEP:** availability opened on **event publish** (not draft create); confirmation request on validate (**assignees only**). **P1:** roster FYI opt-out, presence reminders, removal/re-confirm. Channels: push (FR29), email (troupe policy). See SCP [2026-06-01 notifications](sprint-change-proposal-2026-06-01-notifications-epic8-scope.md).
- FR31b *(organizer ops — P2)*: Draft/create alerts, draft compo orga-only, SLA open dispos, compo incomplete cadence, team-complete orga signal. Cascade: event org → season admin → troupe admin.
- FR32: A visitor **without a HatCast account** can browse the **public troupe directory**. Freemium troupes are **listed by default** (non-opt-out); a troupe administrator can hide a troupe from the directory.
- FR33: A visitor **without a HatCast account** can view **public** season and event pages for troupes listed in the directory. Content marked non-public is not shown on visitor surfaces.
- FR34: A troupe administrator can designate **season-level organizers** and **event-level organizers**. Season organizers can manage all events in the season; event organizers can manage only assigned events. Delegation does not grant troupe-administration rights unless the user also holds troupe administrator role.
- FR35: A **troupe administrator, season organizer, or event organizer** can view an audit trail with **actor identity**, **subject identity** (when acting for another participant), **action type**, and **timestamp to second precision**. Tracked actions include at minimum: availability create/update/delete, availability comments, confirmations and withdrawals, composition draft/validate/unlock changes, **manual vs lottery slot assignments**, **slot removals**, and proxy actions on behalf of participants. Property-level **before/after values** are recorded at minimum for **availability status**, **role selections**, and **composition slot assignments**.
- FR36: A user can update account-level profile fields (display name, avatar per FR10) and **change password** when signed in with email/password. A user can initiate **email change with verification** when email/password auth is used. Google-only users manage profile fields not sourced from Google per product rules.
- FR37: A user can **request account deletion** from account settings. The product requires **explicit confirmation**, then **anonymizes or deletes personal data** per retention policy, **revokes active sessions**, and **preserves non-personal audit records** required for troupe governance. Deletion does not remove historical troupe audit entries that reference anonymized actor identifiers.
- FR38: **(Growth / post-MVP.)** After a troupe administrator **enables self-service guest invitations** for the troupe, an organizer can send an invitation for a **specific role and event scope** so an external contributor can onboard without prior troupe membership. MVP managed participants remain covered by FR43–FR45.
- FR39: **(Growth / post-MVP.)** External contributors invited under FR38 can be assigned using **organizer direct pick** or **last-resort/joker** modes configured per event. They are **excluded from the default weighted draw pool** unless an administrator explicitly includes them for that event. Basic admin-created season/event participants remain covered by FR43–FR45.
- FR40: A user can install or add the web application for quick access on supported platforms (PWA installability).
- FR41: After the organization deploys a new client version, users receive updated client behaviour without being expected to perform a technical manual cache-clear as the only remedy.
- FR42: A **troupe administrator** can export and import troupe member lists in a documented CSV format to support HatCast V1-to-V2 migration, migration from one troupe to another, and rapid initialization of a new troupe.

### Participation scopes

- FR43: A season administrator can manage a season participant roster that includes troupe members by default and can also include non-member participants. A non-member participant may be a name-only managed participant, an existing HatCast user, or an email-prelinked participant awaiting first login.
- FR44: An event administrator can add or manage participants for a single event without making them troupe members or season-wide participants. Event participants may be name-only, linked to an existing HatCast user, or prelinked by email awaiting first login.
- FR45: When an administrator provides an email for a season or event participant, the product attempts to link the participant to an existing user account with that email. If no activated account exists, the participant remains usable as a managed participant and is **linked automatically on first successful sign-in** with the same email. Email is optional.
- FR46: When a troupe member has configured **preferred roles** for the troupe, the availability form for applicable event types **pre-selects** those roles; the member can change selections before submitting.

### Product analytics & observability (product-level)

- FR47: The product records **anonymized workflow analytics events** sufficient to compute Success Criteria leading indicators: time from participant availability window open to first submission, time from composition validation to full required confirmations, and notification link follow-through when canonical event URLs are present. In MVP, analytics access is limited to **product operators**; troupe-visible analytics dashboards are post-MVP.

### Member journey & leagues (ADR 0011)

- FR48: A signed-in member can view a **personal user agenda** listing **upcoming events** from every **league where they are a league participant**, across all troupes, with **filtering by troupe and by league** (paginated, default ≤ 50 rows).
- FR49: After sign-in, routing priority: deep link → last visited league workspace → `/agenda` → empty guidance; no stub home screen.
- FR50: When creating a league, an administrator chooses **all active troupe members** or **manual roster** as initial league participants.
- FR51: From event detail, authorized users navigate to **league workspace** and **troupe hub**.
- FR52: From troupe hub, members view leagues (active/archived filter), pseudo, admin, and public directory entry.

### League workspace views, travel leagues & personal glance (ADR 0012)

- FR53: League workspace exposes **Agenda**, **Historique** (past events chronology), and **Statistiques** (participation stats grid) as **distinct views**.
- FR54: Single **Statistiques** CSV export via season admin menu (organizers/admins; full season). Historique: no export.
- FR55: Cross-scope surfaces (user agenda, personal season glance, cross-league Statistiques) expose troupe/league filters; **hidden** when exactly one troupe or one league in scope (RES-001).
- FR56: Away shows (**déplacements**) are managed in a **dedicated travel league** per troupe; new events must not use legacy `deplacement` template on show leagues.
- FR57: Weighted draw runs **within a single league**; cross-league fairness is post-MVP.
- FR58: Personal **season glance** (*Ma saison en un clin d'œil*) via route e.g. `/membre/:userSlug` from member area, with optional troupe/league filters.
- FR59: Authorized members may open **another participant's** season glance via the same URL (V1 transparency).
- FR60: In Statistiques, travel-league events count toward **DEPLACEMENT**; show-league events never do; legacy `deplacement` type until migrated.

### Demo troupe onboarding & join policy (V2 production — PRD 2026-05-28)

- FR61: Signed-in user can **self-join** troupes with **`join_policy = OPEN`** (including production **Demo**); creates/reactivates **`MEMBER`** only; enrolls in Demo season roster; rejected for **`INVITE_ONLY`**.
- FR62: Troupe **`join_policy`**: **`OPEN`** | **`INVITE_ONLY`**; **default `OPEN`** for new troupes; premium paywall deferred.
- FR63: **Platform administrator** (super-admin email allowlist) can **read/update** join policy; **troupe administrators cannot** in MVP.
- FR64: **Production seed**: troupe **Démo** (`slug: demo`, `is_demo`), season **Saison 2026-2027** (2026-06-01 → 2027-05-31), ~20 pedagogical events, fictitious participants + dispos, varied composition states; distinct from dev La Malice seed.

### NonFunctional Requirements

- **NFR-P1:** Primary interactive flows (season grid, event view, availability submit, composition open) remain responsive on mobile networks — **≤ 3 s p95 TTI** on Fast 3G–equivalent profile; list views use paging (default **≤ 50** rows). Context: troupes up to **100 members**, **50 events** per active season.
- **NFR-P2:** Common read operations — server-side read latency **≤ 500 ms p95** for season list, event detail, and availability summary under nominal load (**10 concurrent organizers**, **50 concurrent members**).
- **NFR-S1:** **100%** auth/API traffic over **TLS 1.2+**; no credentials in client logs; session tokens with httpOnly/secure cookie or equivalent.
- **NFR-S2:** **0** unauthorized cross-troupe/cross-role data exposures in permission test suite; **100%** protected endpoints enforce role checks in automated API tests. Context: email, avatar, pseudo, participant names/emails, availability, composition data.
- **NFR-S3:** Account deletion completes within **30 days** of confirmed request; export/deletion runbook documented; **100%** deletion requests logged (GDPR-oriented processes at organizational level).
- **NFR-S4:** Member import/export — only troupe administrators; exports contain only documented fields; imports reject invalid rows with row-level error reporting; **0** data leaks to unauthorized roles (FR42).
- **NFR-S5:** Season/event participant administration protects optional email and linking data — participant email visible only to authorized admin/organizer roles; name-only participants function without email in **100%** of MVP test scenarios (FR43–FR45).
- **NFR-R1:** **0** known P0 defects from client/server version skew lasting **> 24 h** after coupled deploy; post-deploy smoke tests pass on **100%** of production releases.
- **NFR-R2:** Push/email send failures logged with correlation ID; core writes remain consistent (**0** orphaned confirmation states in integration tests); retry or dead-letter path documented.
- **NFR-SC1:** Staging load test supports **50 troupes × 100 members × 50 events/season** with NFR-P2 still met at p95.
- **NFR-A1:** Core member and organizer tasks meet **WCAG 2.1 Level AA** baseline — **0** critical axe-core violations on primary flows; contrast **≥ 4.5:1**; keyboard operability for availability submit, composition view, and confirmation actions.
- **NFR-I1:** Auth provider success rate **≥ 99%** over rolling 7 days (excluding user-caused errors); failed auth surfaces user-actionable message in **100%** of tested error codes.
- **NFR-Q1:** **≥ 80%** line coverage on domain-critical backend modules; **100%** of FR1–FR5, FR15–FR16, FR19–FR23, FR25, FR32, **FR48–FR49** auth/availability/composition/**agenda entry** paths covered by at least one automated test; **0** disabled tests to merge without explicit waiver.

### Additional Requirements

_From `architecture.md` — technical constraints for implementation planning:_

- **Target stack:** **Angular 21** SPA with **Angular Material**; **Kotlin** + **Spring Boot** REST API; **PostgreSQL** on **Neon** (branches per environment); **OpenAPI** as API contract; SPA on **GitHub Pages** and/or **Cloud Run** (bundled image); API on **Google Cloud Run**; **coupled CI** deploys for development/staging/production (NFR-R1).
- **Brownfield:** Legacy **Firebase** (Firestore, Auth, Functions) remains until migration slices in PLAN; dual paths per feature must stay explicit in stories.
- **Data:** PostgreSQL as system of record for target stack; **multiple active leagues per troupe** (ADR 0011 / DOMAIN); **travel leagues** for déplacements (ADR 0012); migration strategy via PLAN/ADRs.
- **Member routes (ADR 0011–0012):** `/agenda`, `/ligue/:slug` (Agenda | Historique | Statistiques), `/membre/:userSlug` (season glance).
- **Participation model (V2):** `troupe_memberships` grants troupe access and baseline governance. **Season participants** (`season_participants`) and **event participants** (`event_participants`) are separate domain identities — optional link to `users`, optional `troupe_membership_id`, optional normalized email, display name, status. Availability and composition reference **participant identities**, not raw users or memberships alone (FR43–FR45; sprint-change-proposal 2026-05-23).
- **Authorization (participants):** Troupe admins manage troupe members and all participant scopes. Season admins manage season participants. Event admins manage event-only participants. Organizer permissions grant workflow scope; they do not create troupe membership.
- **API:** REST `/v1/...`; **RFC 7807** Problem Details (or single documented envelope); **camelCase** JSON; **ISO 8601 UTC** dates; audit fields on proxy actions (FR17, FR26, FR35).
- **Persistence ADR:** JPA vs JDBC (or equivalent) — decide before complex persistence stories.
- **Auth ADR:** Session vs bearer token for SPA↔API — décision actuelle : [Identity Platform](../../docs/adr/0010-v2-auth-identity-platform.md) pour la cible V2 (voir ADR).
- **Parité V1 (auth) :** Inscription email/mot de passe ; menu utilisateur (Mon compte, Déconnexion) ; changement de mot de passe **connecté** (distinct du reset par lien — stories 1.6 vs 1.3).
- **Observability:** Health/readiness for Cloud Run; structured logging; no secrets in logs.
- **Backend layout:** Spring Initializr baseline under `backend/`; layered packages (`api`, application, domain, infrastructure).

### UX Design Requirements

_Actionable items from `ux-design-hatcast-v2.md` (UX continuity V1 → V2, Angular Material):_

- **UX-DR1:** **Seasons list** (`/seasons`): card grid, primary CTA "Nouvelle saison", card click + kebab; back to landing; user menu top-right — implement with tokens (dark gradient, pill buttons).
- **UX-DR2:** **Season calendar / agenda:** header (back, troupe logo, season title, settings, avatar); participant + event filters; view switcher (**Agenda** | **Historique** | **Statistiques**); month-grouped event rows with date column, composition status, user dispo/role pill; card navigates to event detail.
- **UX-DR3:** **Availability modal:** three states (Dispo / Pas dispo / Non renseigné), optional comment, title shows whose availability; admin vs self copy — align with **MatDialog** (Angular Material).
- **UX-DR4:** **Event detail** full screen: tabs **Infos / Dispos / Équipe**; header type icon + title + date; composition status + org actions on Infos; canonical URL behaviour per SPEC.
- **UX-DR5:** **Dispos tab:** subject selector for org/admin; Moi/Tous; role candidacy when Dispo; Tous shows per-role grids with %; transparency rules.
- **UX-DR6:** **Équipe tab:** slots per role; manual pick from ordered list; draw animation (proportional bar + cursor); draft vs validated; declined section; participation modal (Confirmer / Décliner / À confirmer); share/validate/announce flows per spec.
- **UX-DR7:** **Share & announce modal:** editable generated message, WhatsApp, push/email recipient list — reusable for spectacle / tirage / compo.
- **UX-DR8:** **Personal season glance** (`/membre/:userSlug`): V1 *Ma saison en un clin d'œil* — summary cards, month grid, favourite roles; optional troupe/league filters (FR55); Planning CTA; avatar shortcuts navigate here. Popover optional shortcut only.
- **UX-DR9:** **League Statistiques view:** role columns (JEU, DECORUM, DEPLAC., BÉNÉVOLE) + monthly columns; expand/collapse; **Masquer/Détails** on toolbar; stats CSV **Exporter** in season admin menu (organizers/admins).
- **UX-DR19:** **League Historique view:** past events only, month-grouped chronological list (no stats grid); no CSV export.
- **UX-DR20:** **Travel league:** déplacements as dedicated league per troupe; no `deplacement` template on new show-league events (FR56).
- **UX-DR10:** **Admin surfaces:** Route **`/saison/:slug/admin/membres`** (menu **Membres**) — troupe **members** + season **organizers**; compact list, search, add modal, active **slide toggle**, inactive **hidden by default**, CSV **Exporter** + **Importer ▾**. Label **Participants** reserved for season/event participant rosters (Story 3.8). Spec: [ux-design-specification.md](./ux-design-specification.md), [ux-design-hatcast-v2.md § Admin Membres](./ux-design-hatcast-v2.md#screen-admin-membres).
- **UX-DR11:** **Theming:** Angular Material + design tokens; do not use Tailwind as primary styling surface (PRD); preserve V1 mood where referenced.
- **UX-DR12:** **Agenda content scope:** Agenda lists **non-archived** events with start date on **today or future** (civil-day boundary, timezone explicit — user or Europe/Paris); past/archived events excluded from Agenda (→ **Historique** chronology, not Statistiques). Same rule enforced **API-side** (e.g. `scope=upcoming`) and UI-side.
- **UX-DR13:** **Post-login routing** — no stub home; `/agenda` or last league / deep link. Spec: [ux-design-journey-league-agenda.md](./ux-design-journey-league-agenda.md).
- **UX-DR14:** **User agenda** (`/agenda`) — cross-league upcoming events; filters **only when >1 troupe or >1 league** (RES-001); one row per event.
- **UX-DR15:** **Event context strip** — troupe + ligue badges; links to league workspace and troupe hub.
- **UX-DR16:** **Troupe hub** (`/troupe/:slug`) — leagues list, pseudo, admin, directory link.
- **UX-DR17:** **League creation** — initial roster: all active members vs manual.
- **UX-DR18:** **Multi-active leagues** — several active leagues visible on troupe hub.

### FR Coverage Map

| FR | Epic | Résumé |
|----|------|--------|
| FR1 | Epic 1 | Connexion Google (MVP) |
| FR2 | Epic 1 | Connexion email/mot de passe |
| FR3 | Epic 1 | Reset mot de passe par email |
| FR4 | Epic 1 | Session persistante (« se souvenir de moi ») |
| FR5 | Epic 1 | Déconnexion |
| FR6 | Epic 2 | Adhésion troupe + accès saisons actives |
| FR7 | Epic 2 | Admin membres troupe et rôles de base |
| FR8 | Epic 2 | Navigation multi-troupes |
| FR9 | Epic 2 | Pseudo affiché par troupe |
| FR10 | Epic 2 | Avatar (upload + import Google) |
| FR11 | Epic 3 | CRUD saisons |
| FR12 | Epic 3 | CRUD spectacles |
| FR13 | Epic 3 | Consultation saisons/événements (membres + participants autorisés) |
| FR14 | Epic 3 | Types d’événement et rôles requis/optionnels |
| FR15 | Epic 5 | Saisie disponibilité (Dispo / Pas dispo / Non renseigné) |
| FR16 | Epic 5 | Disponibilité par rôle + bénévolat obligatoire |
| FR17 | Epic 5 | Proxy disponibilité (organisateur/admin) |
| FR18 | Epic 5 | Commentaire disponibilité (500 car.) |
| FR19 | Epic 5 | Vue organisateur dispos par rôle |
| FR20 | Epic 6 | Tirage aléatoire pondéré |
| FR21 | Epic 6 | Assignation manuelle / multi-rôles |
| FR22 | Epic 6 | Composition brouillon + publication |
| FR23 | Epic 6 | Validation / déverrouillage composition |
| FR24 | Epic 6 | Explainability cotes (post-publication/validation) |
| FR25 | Epic 6 | Confirmation/declinaison participant lié |
| FR26 | Epic 6 | Confirmation/declinaison proxy |
| FR27 | Epic 6 | Créneaux vacants et actions de suivi |
| FR28 | Epic 6 | États cycle de vie composition |
| FR29 | Epic 8 | Opt-in push global (MVP) |
| FR30 | Epic 8 | Préférences notification (catégories post-MVP) |
| FR31 | Epic 8 (+ **3.21**) | Intents membre (MEP: dispos publish + confirm assignés ; P1/P2 extensions) |
| FR31b | Epic 8 (**8.4** P2) | Intents orga ops (post-MEP) |
| FR32 | Epic 4 | Annuaire public troupes |
| FR33 | Epic 4 | Pages publiques saison/événement |
| FR34 | Epic 3 | Organisateurs saison / événement |
| FR35 | Epic 9 | Piste d’audit |
| FR36 | Epic 1 | Mon compte (email, mot de passe connecté) |
| FR37 | Epic 1 | Suppression compte |
| FR38 | Epic 7 | Invitations self-service *(post-MVP)* |
| FR39 | Epic 7 | Modes sélection alternatifs invités *(post-MVP)* |
| FR40 | Epic 10 | Installabilité PWA |
| FR41 | Epic 10 | Mise à jour client sans « vide le cache » |
| FR42 | Epic 2 | Import/export CSV membres troupe |
| FR43 | Epic 3 | Roster participants saison |
| FR44 | Epic 3 | Participants événement-only |
| FR45 | Epic 3 | Liaison email optionnelle → compte utilisateur |
| FR46 | Epic 5 | Pré-sélection rôles favoris |
| FR47 | Epic 11 | Analytics workflow anonymisés |
| FR48 | Epic 12 | Agenda utilisateur multi-ligues |
| FR49 | Epic 12 | Routage post-connexion |
| FR50 | Epic 13 | Roster ligue à la création |
| FR51 | Epic 12 | Navigation événement → ligue/troupe |
| FR52 | Epic 17 *(was Epic 14)* | Hub troupe |
| FR53–FR54 | Epic 3 | Workspace ligue : Agenda / Historique / Statistiques + exports |
| FR55 | Epics 12, 16 | Filtres troupe/ligue (masqués si un seul) |
| FR56–FR57 | Epic 13 | Ligues déplacements ; tirage par ligue |
| FR58–FR59 | Epic 16 | Route *clin d'œil* membre + transparence |
| FR60 | Epic 3 | Stats : DEPLAC. = ligue déplacements |
| FR61 | Epic 18 | Self-join troupes OPEN (+ Demo) |
| FR62 | Epic 18 | Modèle join_policy troupe |
| FR63 | Epic 18 | Super-admin change join_policy |
| FR64 | Epic 18 | Seed prod Démo + saison pédagogique |

**NFR (adressées au fil des epics / transverses) :** NFR-P1/P2 (perf, pagination) — surtout Epics 3, 5, 6, 10, **12** ; NFR-S1/S2/S3/S4/S5 — Epics 1, 2, 3, 9 ; NFR-R1/R2 — Epics 8, 10 + pipeline ; NFR-SC1 — architecture ; NFR-A1 — Epics 1–9, **12–14** (UI) ; NFR-I1 — Epic 1 ; NFR-Q1 — transverse CI/tests.

**UX-DR :** UX-DR1–3 → Epics 3, 5 ; UX-DR4–7 → Epic 6 ; UX-DR5 aussi Epic 5 ; UX-DR8–9 → Epics 5, 6 ; UX-DR10 → Epics 2, 3 ; UX-DR11 → transverse ; UX-DR12 → Epic 3 (Story 3.3) + **Epic 12** ; **UX-DR13–18 → Epics 12–14** (voir [plan-v2-league-journey.md](./plan-v2-league-journey.md)).

## Epic List

### Epic 1 — Compte et authentification

Les utilisateurs peuvent **créer un compte** et se connecter (**Google** ou **email/mot de passe**), utiliser **mot de passe oublié** (hors session), **rester connectés** (option type « se souvenir de moi »), **se déconnecter**, accéder à **Mon compte** depuis un **menu utilisateur** (alignement V1), et gérer **changement d’email**, **changement de mot de passe** (connecté), et **suppression** du compte.

**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR36, FR37 — plus **parité fonctionnelle V1** sur l’inscription email/mot de passe et le menu compte (voir stories 1.2, 1.5, 1.6).

### Epic 2 — Troupes, adhésion et profil membre

Les personnes peuvent appartenir à une ou plusieurs troupes, avec gestion des membres et rôles de base par les admins, **import/export CSV des membres** (migration V1→V2 et administration), navigation entre troupes, pseudo par troupe, **genre optionnel sur le profil compte** (libellés de rôles et avatars adaptés, V1 parity — stories **2.12–2.12d**), et avatar (y compris image Google).

**FRs couverts :** FR6, FR7, FR8, FR9, FR10, FR42

### Epic 3 — Saisons, spectacles et gouvernance organisateur

Les administrateurs gèrent saisons et spectacles (CRUD, archivage), configurent types d’événements et rôles requis/optionnels, désignent organisateurs saison/événement, et **administrent les rosters participants** (saison et événement, y compris participants gérés sans compte HatCast) ; les membres et participants autorisés voient les événements de leur périmètre et les **vues ligue** Agenda / Historique / Statistiques.

**FRs couverts :** FR11, FR12, FR13, FR14, FR34, FR43, FR44, FR45, **FR53–FR54, FR60**

### Epic 4 — Découverte publique (annuaire et pages visiteur)

Un visiteur sans adhésion peut parcourir l’annuaire public des troupes et consulter saisons/événements marqués publics.

**FRs couverts :** FR32, FR33

### Epic 5 — Disponibilités (participants et organisations)

Les **participants** (membres troupe liés, participants saison/événement, y compris gérés sans compte) enregistrent leur disponibilité par événement (y compris par rôle, commentaire, et **pré-sélection des rôles favoris**), les orgas/admins peuvent agir pour autrui avec traçabilité ; les organisateurs voient qui est disponible par rôle.

**FRs couverts :** FR15, FR16, FR17, FR18, FR19, FR46

### Epic 6 — Tirage, composition et cycle de vie des confirmations

Les organisateurs utilisent tirage pondéré et assignation manuelle, brouillon vs composition validée, états de cycle de vie, transparence des cotes ; les **participants liés** confirment ou déclinent ; gestion des retraits et créneaux à combler.

**FRs couverts :** FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28

### Epic 7 — Invitations self-service et contributeurs externes (post-MVP)

**Growth / post-MVP :** une fois FR43–FR45 en place, les organisateurs peuvent activer des **invitations self-service** et des modes de sélection alternatifs (direct pick, joker) pour contributeurs externes — distincts de l’administration basique des participants gérés.

**FRs couverts :** FR38, FR39 *(post-MVP)*

### Epic 8 — Notifications (push, email, préférences)

L’utilisateur active les notifications navigateur et les préférences ; le produit notifie les jalons métier (dispos, composition, confirmations) avec livraison asynchrone robuste.

**FRs couverts :** FR29, FR30, FR31

### Epic 9 — Audit et historique des changements significatifs

Journal unifié des mutations métier (FR35) : **capture backend** à la MEP ; **consultation UI** post-MEP (admin puis membre).

**FRs couverts :** FR35 — *capture via **9.0** ; consultation via **9.1** / **9.2***

### Epic 10 — PWA et déploiement sans friction côté client

Installation/raccourci PWA et garantie que les déploiements de nouvelle version client ne reposent pas sur un « vide le cache » comme seul recours.

**FRs couverts :** FR40, FR41

### Epic 11 — Analytics workflow (opérateurs produit)

Le produit enregistre des événements analytics anonymisés pour mesurer les indicateurs avancés (délai dispos, délai confirmations, suivi des liens de notification). Accès MVP réservé aux opérateurs produit.

**FRs couverts :** FR47

### Epic 12 — Parcours membre & agenda utilisateur

Agenda personnel multi-ligues, routage post-connexion, navigation événement → ligue/troupe, filtres cross-scope (FR55).

**FRs couverts :** FR48, FR49, FR51, **FR55** (filtres agenda)

### Epic 13 — Modèle League (multi-active, roster, déplacements)

Plusieurs ligues actives par troupe, modes de roster à la création, **ligues déplacements** dédiées.

**FRs couverts :** FR11 (étendu), FR50, **FR56–FR57**

### Epic 14 — Hub troupe & découverte *(SUPERSEDED — Epic 17)*

> **Status (2026-06-01):** **Superseded** by **Epic 17** ([ADR 0013](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)). Do **not** schedule stories **14.x**. SCP : [sprint-change-proposal-2026-06-01-epic14-superseded-by-epic17.md](./sprint-change-proposal-2026-06-01-epic14-superseded-by-epic17.md).
>
> | 14.x | → Epic 17 (or related) |
> |------|-------------------------|
> | 14.1 hub | **17.4**, **17-29** |
> | 14.2 ligues archivées | **17.4** |
> | 14.3 pseudo | **17.4**, **2.5** |
> | 14.4 `/seasons` redirect | **17.5** |
> | 14.5 lien annuaire | **17.3** ; public directory = **Epic 4** |

Hub troupe (ligues, pseudo, admin), annuaire, démotion de `/seasons` pour les membres — *intent preserved under Epic 17 routes `/troupes`*.

**FRs couverts :** FR52, FR9, FR32 — *trace via Epic **17** (+ **4** for public annuaire)*

### Epic 16 — Profil membre & saison en un clin d'œil

Route dédiée pour le récap personnel et la transparence V1 (navigation entre joueurs).

**FRs couverts :** FR55, FR58, FR59

### Epic 15 — Rencontres liées *(post-MVP)*

Liaison optionnelle entre événements inter-troupes.

**FR :** PRD note post-MVP (encounter entity)

### Epic 17 — Navigation troupe-first, tags d’équité, slugs événements

Remplace le hub `/seasons`, introduit `/troupes` et `/troupes/:slug`, breadcrumb responsive, admin par scope, **tag d’équité** optionnel sur spectacle, URLs slug.

**FRs couverts :** FR51 (navigation), FR52 (troupe hub), FR8 ; étend FR11–FR12 (saison + événement)  
**ADR :** [0013](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)  
**Design :** [_bmad-output/design-thinking-2026-05-25.md](../design-thinking-2026-05-25.md) ; **UX :** [ux-design-journey-league-agenda.md](./ux-design-journey-league-agenda.md) (amended 2026-05-25, UX-DR19–21)  
**Supersedes :** **Epic 14** (hub troupe — stories 14.1–14.5), ADR 0012 §3 (travel league), Story **13.6** (reportée)

### Epic 18 — Troupe Démo & politique d’adhésion (onboarding prod V2)

Sandbox partagée **Démo** en production, seed pédagogique (~20 spectacles), participants fictifs, **self-join** pour tout utilisateur authentifié, modèle **`join_policy`** (`OPEN` | `INVITE_ONLY`), gouvernance **super-admin** uniquement pour changer la politique. Remplace le branchement provisoire « seed troupe = La Malice » (Story 2.1).

**FRs couverts :** FR61, FR62, FR63, FR64 — étend FR49 (guidance vide), FR6 (adhésion)

**Priorité livraison :** **P0 prod V2** — avant ou avec la première mise en production utilisateurs réels.

**Hors scope Epic 18 :** paywall premium, annuaire « Découvrir », clone sandbox par utilisateur, invitation self-service (Epic 7).

### Epic 19 — Moteur de tirage pondéré (parité V1, facteurs, formules & politiques)

Verrouiller la **parité V1**, documenter et tester le tirage, refactorer vers un **pipeline de facteurs**, puis permettre aux **admins troupe/saison** de **composer des formules** (facteurs + paramètres), de définir des **politiques** (formule imposée ou choix orga), et aux **organisateurs** d’appliquer la politique au tirage d’un spectacle.

**Complète Epic 6 (livraison)** — ne remplace pas **6.4** / **6.14** (done). **Étend** FR19/FR20/FR24.

**Vision Wave D :** catalogue de **plusieurs formules** par troupe ; **politiques** troupe/saison avec règles **par catégorie de spectacle** (`category`, glossaire **17.7**) ; résolution au **niveau événement** (catégorie du spectacle) ; si la règle applicable autorise **plusieurs formules**, l’**opérateur choisit au tirage** ; snapshot formule + paramètres (**19.22**). Ex. : catégorie **match** → formule « parité genre » imposée ou proposée.

**FRs couverts :** FR19, FR20, FR24 ; partition tag via **19.8** (ex-**17.9**). **Wave D** → extension SPEC/DOMAIN (**19.15**) — croissance produit, pas MEP V2.0.0.

**Priorité :** Wave **A–B** P1 ; Wave **C–D** P2+ product-gated.

**SCP :** [sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md](./sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md)

**Hors scope Epic 19 :** modifier `legacy/` ; UI animation tirage (Epic **6**, UX-DR6) ; éditeur de formule « langage libre » / scripts custom (MVP = facteurs catalogués + paramètres).

### Epic 20 — Prestige des spectacles (étoiles, stats, lien tirage)

Permettre aux organisateurs de renseigner un **prestige optionnel** (1–5 étoiles) sur tout spectacle, de l’**afficher** (fiche + agenda), d’**agréger** les points de prestige par participant sur la saison, puis — via **19.13** — d’utiliser ce total comme **2ᵉ critère de malus** au tirage (après le nb de sélections).

**Règles PO (2026-06-05) :** étoiles sur **tous** les spectacles ; **optionnel** (null → 0 point) ; crédit à la **validation composition** ; **JEU** 100 %, **DECORUM** 50 %, **BÉNÉVOLE** 0 ; formule de malus tirage calibrée dans **19.13**.

**Complète Epic 3** (métadonnée événement) et **3.6** (stats) — **19.13** consomme **20.6**.

**Priorité :** Waves **1–2** P2 (post-MEP) ; intégration tirage **19.13** P2+ après **19.6** + **20.6**.

**SCP :** [sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md](./sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md)

**Hors scope Epic 20 :** notation artistique / avis ; prestige imposé par catégorie ; crédit bénévole ; formule de tirage (→ **19.13**).

---

**Dépendances naturelles (ordre de valeur) :** Epic 1 → 2 → 3 (Stories **3.6**, **3.6b**, **3.8** avant Epic 5) ; Epic 5 → 6 ; **Epic 12** done ; **Epic 18** après **2.1** (membership) et **3.x** (events/composition) — **avant prod V2** ; **18.1→18.2** avant **18.3** (seed) et **18.4** (UI) ; **Epic 17.1→17.5** (navigation) ; **3.6** puis **17.10** (filtre compartiments stats) ; **17.7→19.8** (partition category — ex-**17.9**) ; **Epic 19.1→19.3** avant **19.5** ; **19.5→19.6** avant **19.8+** et Wave **D** ; **20.1→20.2** avant **20.3–20.5** ; **20.6** avant **20.7** et **19.13** ; **19.13** après **19.6** + **20.6** ; **19.15→19.18** avant UI **19.19–19.21** ; chrome admin **17.2** recommandé ; **MIG-4** après import prod (`deplacement` → tag) ; **17.12–17.15** après **17.8** ; **17.18→17.22** (hub membre) ; **Epic 13** (sans 13.6) ; **Epic 16** après 12.3 ; Epic 15 post-MVP ; Epics 8–11 transverses.

---

## User stories (détail)

Chaque story est dimensionnée pour une implémentation incrémentale ; l’ordre **N.M** respecte les prérequis au sein de l’epic (aucune story ne dépend d’une story ultérieure du même epic). Les critères d’acceptation sont vérifiables ; les références **SPEC** / **DOMAIN** priment sur ce document en cas d’écart.

### Epic 1 — Compte et authentification

#### Story 1.1 : Connexion avec fournisseur OAuth (Google)

En tant qu’utilisateur,  
je veux me connecter avec « Se connecter avec Google » (ou équivalent),  
afin d’accéder à l’application sans créer un nouveau mot de passe HatCast.

**Acceptance Criteria**

- **Given** un utilisateur non authentifié sur l’écran de connexion, **when** il choisit la connexion Google et complète le flux OAuth avec succès, **then** une session applicative conforme au modèle d’auth retenu est établie et il est redirigé vers l’expérience connectée.
- **And** en cas d’échec ou d’annulation côté fournisseur, un message clair est affiché (NFR-I1) sans exposer de détails sensibles (NFR-S1).
- **And** les jetons/sessions sont gérés selon les bonnes pratiques (NFR-S1).

**Couverture :** FR1 ; NFR-I1, NFR-S1 (partiel).

---

#### Story 1.2 : Inscription et connexion email / mot de passe

En tant qu’utilisateur,  
je veux **créer un compte** avec email et mot de passe puis **me connecter** avec ces identifiants,  
afin d’utiliser HatCast sans compte Google (parité avec la V1).

**Acceptance Criteria**

- **Given** un visiteur sans compte email/mot de passe, **when** il complète le flux **d’inscription** avec des données valides (règles de mot de passe produit), **then** un compte est créé et il peut accéder à l’app (session établie ou invitation à se connecter selon le flux retenu — à documenter, aligné Identity Platform / fournisseur).
- **Given** un compte email/mot de passe existant, **when** l’utilisateur soumet identifiants corrects sur l’écran de connexion, **then** la session est établie et l’utilisateur accède à l’app.
- **Given** des identifiants incorrects à la connexion, **when** la tentative a lieu, **then** un message générique approprié est affiché (pas d’énumération d’utilisateurs).
- **And** l’écran de connexion / inscription expose les chemins **Google** (story 1.1) et **email** de façon cohérente avec la V1.
- **Couverture :** FR2 ; NFR-S1 ; parité V1 (inscription + connexion email).

---

#### Story 1.3 : Mot de passe oublié — récupération par email (hors session)

En tant qu’utilisateur **non connecté** qui a oublié son mot de passe,  
je veux demander une réinitialisation et définir un nouveau mot de passe via un lien email,  
afin de récupérer l’accès (flux « mot de passe oublié » — **distinct** du changement de mot de passe depuis Mon compte, story 1.6).

**Acceptance Criteria**

- **Given** un email associé à un compte, **when** l’utilisateur lance la demande depuis le parcours **mot de passe oublié** (sans être authentifié), **then** un email (ou flux équivalent documenté) est déclenché et une confirmation UI indique que la suite se fait par boîte mail.
- **Given** un lien de reset valide et non expiré, **when** l’utilisateur définit un nouveau mot de passe conforme aux règles produit, **then** il peut se connecter avec ce mot de passe.
- **Given** un lien invalide ou expiré, **when** il est utilisé, **then** un message clair invite à redemander un reset (NFR-I1).
- **Hors périmètre de cette story :** changement de mot de passe **en étant déjà connecté** → story 1.6.
- **Couverture :** FR3 ; NFR-I1.

---

#### Story 1.4 : Session persistante (« se souvenir de moi »)

En tant qu’utilisateur,  
je veux rester connecté sur un appareil de confiance lorsque l’option est proposée (ex. **case à cocher** sur l’écran de connexion, comme en V1),  
afin de ne pas resaisir mes identifiants à chaque visite.

**Acceptance Criteria**

- **Given** l’option « se souvenir de moi » (ou équivalent) **cochée** à la connexion, **when** l’utilisateur revient dans la fenêtre de validité définie, **then** la session est restaurée sans nouvelle saisie complète des identifiants (selon politique du fournisseur / implémentation — ex. persistance refresh côté Identity Platform).
- **Given** l’option **non** cochée, **when** la session expire ou le navigateur est fermé (selon règles), **then** une nouvelle authentification est requise.
- **Couverture :** FR4 ; NFR-S1.

---

#### Story 1.5 : Déconnexion et accès depuis le menu utilisateur

En tant qu’utilisateur connecté,  
je veux **me déconnecter** explicitement depuis le **menu utilisateur** (parité V1),  
afin de terminer ma session sur cet appareil ou navigateur.

**Acceptance Criteria**

- **Given** une session active, **when** l’utilisateur choisit **« Se déconnecter »** (depuis le menu compte / avatar), **then** la session côté client et mécanisme serveur / fournisseur associé est invalidée conformément au modèle d’auth.
- **And** l’utilisateur ne peut plus accéder aux écrans membres sans se reconnecter.
- **And** le shell connecté expose un **menu utilisateur** avec au minimum une entrée menant à **la déconnexion** et une entrée vers **Mon compte** (écran ou route défini en story 1.6 — peut être un lien placeholder jusqu’à 1.6 si livraison incrémentale, mais le pattern UI V1 doit être prévu).
- **Couverture :** FR5 ; UX menu compte (alignement UX-DR1 « user menu » au besoin).

---

#### Story 1.6 : Mon compte — email, mot de passe (connecté), champs supportés

En tant qu’utilisateur authentifié,  
je veux accéder à **Mon compte** pour mettre à jour mon **adresse email** (en conservant le même compte), **changer mon mot de passe** lorsque je suis déjà connecté, et les autres champs de compte prévus,  
afin de garder mes identifiants à jour (parité V1 — **sans confondre** avec le reset « mot de passe oublié » de la story 1.3).

**Acceptance Criteria**

- **Given** un utilisateur connecté, **when** il ouvre **Mon compte**, **then** il peut lancer un **changement d’email** avec validation (vérification par email / reconnexion selon règles produit et fournisseur).
- **Given** un utilisateur connecté, **when** il change son **mot de passe** depuis Mon compte (saisie ancien mot de passe ou re-auth selon politique), **then** le nouveau mot de passe s’applique et les sessions non désirées peuvent être invalidées selon le modèle retenu.
- **Given** les autres champs supportés par le produit, **when** l’utilisateur modifie une valeur valide, **then** le compte reflète la modification après validation.
- **Given** une modification soumise avec erreur de validation, **when** la sauvegarde est tentée, **then** des messages d’erreur exploitables sont affichés.
- **Non-objectif de cette story :** parcours **mot de passe oublié** sans session → story 1.3.
- **Couverture :** FR36 ; NFR-S2, NFR-S3 (processus compte).

---

#### Story 1.7 : Suppression de compte

En tant qu’utilisateur,  
je veux supprimer mon compte lorsque le produit le permet,  
afin que mes données personnelles soient traitées selon la politique annoncée.

**Acceptance Criteria**

- **Given** le parcours de suppression activé, **when** l’utilisateur confirme la suppression selon les garde-fous produit (confirmation, délai, etc.), **then** le compte est désactivé/supprimé selon le modèle documenté et l’utilisateur ne peut plus s’authentifier.
- **And** les attentes GDPR/niveau org sont respectées dans la mesure du périmètre produit (NFR-S3).
- **Couverture :** FR37 ; NFR-S3.

---

### Epic 2 — Troupes, adhésion et profil membre

#### Story 2.1 : Adhésion à une troupe et profil membre minimal

En tant qu’utilisateur authentifié,  
je veux appartenir à une troupe avec un profil membre pour cette troupe,  
afin de participer aux saisons et spectacles.

**Acceptance Criteria**

- **Given** une invitation ou un flux d’ajout conforme au modèle de permissions, **when** l’utilisateur rejoint une troupe, **then** un enregistrement de membership actif existe et le contexte troupe est accessible.
- **And** les données exposées respectent le modèle de permissions (NFR-S2).
- **Couverture :** FR6 ; NFR-S2.

---

#### Story 2.2 : Administration des membres et rôles de base

En tant qu’administrateur de troupe,  
je veux gérer la liste des membres et leurs rôles de base dans les limites du modèle de permissions,  
afin de contrôler qui accède à quoi au sein de la troupe.

**Acceptance Criteria**

- **Given** des droits administrateur sur la troupe, **when** l’admin ajoute, retire ou ajuste un rôle de base autorisé, **then** l’état persisté reflète le changement et l’UI des membres est à jour.
- **And** retirer un membre exige une confirmation explicite et ne supprime jamais le compte utilisateur HatCast ; seule l’adhésion troupe est désactivée / retirée.
- **Given** une action non autorisée, **when** elle est tentée, **then** elle est refusée avec retour API/UI cohérent (NFR-S2).
- **Note :** cette story couvre **uniquement l’adhésion troupe** (`troupe_memberships`), pas les rosters participants saison/événement (Story 3.8).
- **Couverture :** FR7 ; UX-DR10 (surfaces admin membres troupe) ; NFR-S2.

---

#### Story 2.3 : Import/export CSV des membres de troupe

En tant qu’administrateur de troupe,  
je veux exporter et importer la liste des membres au format CSV documenté,  
afin de migrer depuis HatCast V1, initialiser rapidement une nouvelle troupe, ou déplacer des membres entre troupes.

**Acceptance Criteria**

- **Given** des droits administrateur sur la troupe, **when** l’admin lance un export, **then** un fichier CSV est produit avec **uniquement** les champs documentés (contrat CSV — voir story) et sans données accessibles aux non-admins (NFR-S4).
- **Given** un fichier CSV conforme au contrat, **when** l’admin lance un import, **then** les lignes valides créent ou mettent à jour les memberships selon les règles documentées ; les lignes invalides sont rejetées **sans** persister de données partielles incohérentes.
- **Given** un import terminé, **when** l’admin consulte le résultat, **then** un rapport actionnable par ligne (succès, ignoré, erreur + motif) est affiché ; aucune fuite de données personnelles vers des utilisateurs non autorisés (NFR-S4).
- **Given** une tentative par un utilisateur sans droits admin troupe, **when** export ou import est demandé, **then** l’action est refusée (403) avec retour API/UI cohérent (NFR-S2).
- **Couverture :** FR42 ; UX-DR10 (surfaces admin membres) ; NFR-S2, NFR-S4.

**Dépendances :** Story 2.1 (membership PostgreSQL) ; Story 2.2 recommandée (rôles de base et UI admin membres) avant livraison UI complète.

**Notes :** Distinct de la story 3.6 (export CSV historique de participation). Le contrat CSV (colonnes, encodage, mapping V1) est documenté dans cette story et référencé depuis l’architecture.

---

#### Story 2.8 : Route admin Membres (UX-DR10)

En tant qu’administrateur de troupe ou organisateur·ice de saison autorisé·e,  
je veux gérer membres de troupe et organisateur·ices de saison depuis une route admin unique,  
afin de suivre l’expérience approuvée (liste compacte, recherche, CSV en barre d’outils) sans modales séparées.

**Acceptance Criteria**

- **Given** des droits `canManageMembers` et/ou `canManageSeasonOrganizers`, **when** l’utilisateur ouvre `/saison/:slug/admin/membres`, **then** l’écran conforme à [ux-design-specification.md](./ux-design-specification.md) s’affiche (onglets, toolbar, liste compacte, modales d’ajout uniquement).
- **Given** aucun droit admin people, **when** la route est accédée, **then** redirection agenda + message (NFR-S2).
- **Given** les API Stories 2.2 / 2.3 existantes, **when** l’UI est utilisée, **then** aucune régression sur CRUD membres ni import/export CSV ; la liste Membres expose une action **Retirer** avec confirmation, qui retire uniquement l’adhésion troupe sans supprimer l’utilisateur.
- **Couverture :** FR7, FR42 (UI) ; UX-DR10 ; NFR-S2.

**Dépendances :** Stories 2.2, 2.3, 3.5 (organisateurs).

**Notes :** Remplace l’UI modale livrée en 2.2/2.3 ; backend inchangé. Voir [sprint-change-proposal-2026-05-23-ux-dr10.md](./sprint-change-proposal-2026-05-23-ux-dr10.md).

---

#### Story 2.4 : Navigation entre troupes

En tant que membre de plusieurs troupes,  
je veux basculer de troupe en troupe,  
afin de gérer chaque contexte séparément.

**Acceptance Criteria**

- **Given** au moins deux adhésions actives, **when** l’utilisateur sélectionne une autre troupe, **then** le contexte courant (données, navigation) correspond à la troupe choisie.
- **Couverture :** FR8.

---

#### Story 2.5 : Pseudo affiché par troupe

En tant que membre,  
je veux définir un pseudo visible dans cette troupe,  
afin d’être reconnu avec le nom d’usage de la troupe.

**Acceptance Criteria**

- **Given** un membre authentifié dans une troupe, **when** il enregistre un pseudo conforme aux règles (longueur/caractères), **then** ce pseudo est utilisé pour l’affichage intra-troupe (DOMAIN/SPEC).
- **Couverture :** FR9 ; NFR-S2.

---

#### Story 2.6 : Avatar et option image de profil Google

En tant qu’utilisateur,  
je veux définir ou mettre à jour mon avatar, y compris utiliser la photo du compte Google si je me connecte ainsi,  
afin d’être visuellement identifié dans l’interface.

**Acceptance Criteria**

- **Given** un fichier ou source d’avatar valide, **when** l’utilisateur enregistre son choix, **then** l’avatar s’affiche aux endroits prévus.
- **Given** une connexion Google avec photo disponible, **when** l’utilisateur choisit d’utiliser cette photo, **then** elle devient l’avatar affiché (ou les règles produit prime sur préférence custom — documenté dans l’UI).
- **Couverture :** FR10 ; NFR-S2.

---

#### Story 2.7 : Popover profil membre (stats saison, grille mensuelle, rôles favoris)

**Note (ADR 0012) :** le *clin d'œil* complet migre vers **Story 16.1** (`/membre/:userSlug`). Story 2.7 **done** couvre la popover V1 ; les avatars doivent **lier** vers 16.1 quand implémenté.

En tant que membre,  
je veux ouvrir un aperçu profil depuis un avatar avec statistiques de saison, grille mensuelle et rôles favoris, avec un accès rapide au planning,  
afin de comprendre mon activité dans la saison.

**Acceptance Criteria**

- **Given** un avatar cliquable dans le contexte saison (SPEC), **when** l’utilisateur ouvre le popover, **then** les blocs prévus (stats, grille, rôles favoris) s’affichent avec données cohérentes avec le domaine.
- **Given** le périmètre produit pour les rôles favoris troupe, **when** le membre configure ses rôles favoris depuis le popover ou l’écran associé, **then** ces préférences sont persistées et utilisées pour la pré-sélection en Story 5.2 (FR46).
- **Given** le CTA « Planning » (ou libellé équivalent), **when** l’utilisateur l’active, **then** il est conduit au flux agenda/liste prévu.
- **Couverture :** UX-DR8 (interim popover) ; **FR58–FR59 → Story 16.1** ; FR46 ; FR9/FR10.

---

#### Story 2.12 : Genre optionnel — profil membre, API, Mon compte *(P1 — SCP 2026-06-05 G-011)*

En tant que **membre**,  
je veux **déclarer optionnellement mon genre** sur mon profil compte,  
afin que l’application puisse **personnaliser libellés et avatars** tout en laissant **Non précisé** pour la notation inclusive.

**Acceptance Criteria**

1. **Given** un utilisateur connecté, **when** il ouvre **Mon compte → Mon profil**, **then** un contrôle **Genre** propose **Homme**, **Femme**, **Non précisé** (défaut).
2. **Given** un enregistrement, **when** l’API persiste, **then** `users.gender` vaut `male` | `female` | `non_specified`.
3. **Given** genre absent ou `non_specified`, **when** un libellé de rôle est affiché, **then** la forme inclusive actuelle est conservée.
4. **Given** import V1, **when** backfill s’exécute, **then** mapping V1 → V2 documenté dans la story (voir SCP G-011).
5. **Couverture :** FR9/FR10 ; parité V1. **Priorité :** P1. **Depends :** **17.36** (done). **Blocks :** **2.12b**, **19.11**. **UX :** [ux-design-member-gender-parity.md](ux-design-member-gender-parity.md). **SCP :** [sprint-change-proposal-2026-06-05-member-gender-parity.md](sprint-change-proposal-2026-06-05-member-gender-parity.md).

---

#### Story 2.12b : Libellés de rôles adaptés au genre *(P1 — SCP 2026-06-05)*

En tant que **membre ou organisateur**,  
je veux des **libellés de rôles accordés au genre déclaré** (ex. Comédienne),  
afin d’éviter la notation avec point médian quand le genre est connu.

**Acceptance Criteria**

1. **Given** les tables V1 portées côté web, **when** `getRoleLabel(role, gender)` est appelé, **then** le résultat correspond à V1 `storage.js` pour tous les `RoleKeys.ALL`.
2. **Given** dispos, équipe, confirmations, **when** le genre participant est connu, **then** les libellés utilisent ce genre.
3. **Given** `non_specified`, **when** affichage, **then** libellés inclusifs inchangés.
4. **Couverture :** parité V1. **Priorité :** P1. **Depends :** **2.12**.

---

#### Story 2.12c : Avatars de repli selon le genre *(P1 — SCP 2026-06-05)*

En tant que **membre**,  
je veux un **avatar par défaut distinct** selon mon genre quand je n’ai pas de photo,  
afin d’être identifiable visuellement (parité V1).

**Acceptance Criteria**

1. **Given** pas d’avatar custom ni Google, **when** rendu, **then** initiale du nom sur teinte selon genre (violet / orange / gris — `app-user-avatar` + `--hatcast-member-gender-*` ; parité d’intention V1, pas les emoji `playerAvatars.js`).
2. **Given** photo custom ou Google, **when** affichage, **then** photo affichée — pas de teinte genre sur l’image.
3. **Couverture :** FR10. **Priorité :** P1. **Depends :** **2.12**, **2.6** (done).

---

#### Story 2.12d : Genre participant — saisie orga et cascade Mon compte *(P2 — SCP 2026-06-06)*

En tant qu’**organisateur**,  
je veux **renseigner le genre** sur une ligne participant (ajout ou édition) lorsque le compte lié n’a pas M/F,  
afin que la **mixité** (**6.21**) et les libellés genrés fonctionnent pour les invités et les membres sans genre Mon compte.

**Acceptance Criteria**

1. **Given** ajout manuel **non reconnu** (name-only), **when** l’orga choisit **Féminin** et enregistre, **then** `participant.gender = female` et le genre effectif est `female` sur roster, composition et dispos.
2. **Given** utilisateur **reconnu avec M/F** sur Mon compte, **when** ajout ou édition participant, **then** genre affiché depuis le compte (lecture seule) ; PATCH participant n’accepte pas d’override.
3. **Given** utilisateur reconnu **sans M/F** (Non spéc. / unset), **when** ajout au roster, **then** l’orga peut renseigner le genre sur la ligne participant.
4. **Given** participant name-only `female` sur un slot `player` rempli et tous les autres slots `player` ont un genre effectif connu, **when** onglet Équipe, **then** pill mixité visible (**6.21**).
5. **Given** membre PATCH Mon compte **M ↔ F**, **when** sauvegardé, **then** toutes les lignes participant liées synchronisées au nouveau genre compte.
6. **Given** membre PATCH Mon compte vers **Non spéc.**, **when** sauvegardé, **then** lignes participant liées effacées (`non_specified`) ; l’orga peut re-saisir sur le roster (Option B).
7. **Couverture :** extension parité genre / mixité. **Priorité :** P2. **Depends :** **2.12** (done), **6.21** (done), **3.8** (done). **Blocks :** —. **UX :** toggle Mon compte réutilisé ([ux-design-member-gender-parity.md](ux-design-member-gender-parity.md) Screen 1). **SCP :** [sprint-change-proposal-2026-06-06-participant-gender-lot-b.md](sprint-change-proposal-2026-06-06-participant-gender-lot-b.md). **ADR :** [0020](../../docs/adr/0020-participant-gender-organizer-operational.md). **Plan :** Lot B phase 1 — [plan-participant-roster-ux-enhancements.md](plan-participant-roster-ux-enhancements.md).

---

#### Story 2.21 : Troupe externes — carnet `EXTERNE` *(P1 — ADR-0021, SCP 2026-06-06)*

En tant qu’**administrateur de troupe**,  
je veux gérer des **Externes** dans la même UI Membres (name-only autorisé, email optionnel),  
afin de conserver un **carnet de contacts** réutilisable sans accorder l’accès membre complet.

**Acceptance Criteria**

1. **Given** le modèle troupe, **when** `TroupeBaselineRole` est étendu, **then** `EXTERNE` est persisté (Flyway + OpenAPI).
2. **Given** Membres admin, **when** l’admin ajoute un externe, **then** nom affiché requis, email optionnel ; chip/filtre **Externe** visible.
3. **Given** retrait du carnet, **when** confirmé, **then** `troupe_memberships.status = INACTIVE` ; historique saison/événement conservé.
4. **Given** sync membership → saison, **when** `ensureMembershipParticipants` s’exécute, **then** les lignes `EXTERNE` ne sont **pas** auto-ajoutées comme les `MEMBER`.
5. **Given** un compte lié `EXTERNE` seul, **when** accès membre, **then** pas de hub troupe / lecture membre équivalente `MEMBER`.
6. **Couverture :** ADR-0021 P1. **Priorité :** P1. **Depends :** **2.2**, **2.8** (done). **Blocks :** **3.23**, **3.8d**. **SCP :** [sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md](sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md). **ADR :** [0021](../../docs/adr/0021-troupe-externes-carnet-invitations.md).

### Epic 3 — Saisons, spectacles et gouvernance organisateur

#### Story 3.1 : Gestion des saisons (création, édition, archivage) et liste saisons

En tant qu’administrateur,  
je veux créer, modifier et archiver des saisons, avec une liste de cartes saisons,  
afin d’organiser le travail par ligue/saison (plusieurs ligues actives par troupe autorisées depuis ADR 0011 — voir Epic 13 pour lever la contrainte d’activation unique livrée en 3.1).

**Acceptance Criteria**

- **Given** droits admin sur la troupe, **when** l’admin crée ou modifie une saison avec champs requis, **then** la saison apparaît dans la liste et est persistée.
- **Given** une action d’archivage, **when** elle est confirmée, **then** l’état archived est reflété et la liste/accès suivent SPEC/DOMAIN. *(Note : l’activation unique par troupe de la livraison 3.1 est remplacée par plusieurs ligues actives — Epic 13.)*
- **Given** la vue liste `/seasons`, **when** l’utilisateur consulte l’écran, **then** la grille de cartes, le CTA « Nouvelle saison » et les actions carte/kebab sont disponibles conformément à UX-DR1 (Angular Material + tokens).
- **Couverture :** FR11 ; UX-DR1 ; NFR-P1 (pagination si liste longue).

---

#### Story 3.2 : Spectacles dans la saison et liste pour les membres et participants

En tant qu’administrateur, membre ou **participant autorisé**,  
je veux gérer les spectacles (CRUD côté admin) et voir la liste des **événements actifs** de la saison,  
afin de planifier et consulter l’agenda de la troupe.

**Acceptance Criteria**

- **Given** une saison existante, **when** un admin crée ou modifie un spectacle avec les champs requis (titre, date/heure, lieu, type, statut actif/inactif — FR12), **then** l’événement est persisté.
- **Given** un événement **inactif ou archivé**, **when** un membre ordinaire ou visiteur consulte les listes, **then** il n’apparaît pas (FR12, FR13).
- **Given** un membre troupe actif ou participant autorisé (FR13), **when** il ouvre la liste des événements actifs, **then** il voit les spectacles de son périmètre, sans chargement illimité (pagination, NFR-P1).
- **Couverture :** FR12, FR13 ; NFR-P1, NFR-P2.

---

#### Story 3.3 : Vue calendrier / agenda saison (filtres, bascule agenda / historique)

En tant que membre ou organisateur,  
je veux une vue agenda avec en-tête (retour, logo, titre saison, réglages, avatar), filtres participants/événements et bascule agenda vs historique,  
afin de parcourir les spectacles par mois avec statut de composition et accès au détail.

**Acceptance Criteria**

- **Given** une saison avec événements, **when** l’utilisateur ouvre la vue agenda, **then** les lignes groupées par mois affichent date, titre, statut de composition, pastille dispo/rôle selon UX-DR2.
- **Given** un clic sur une ligne/carte, **when** l’utilisateur navigue, **then** il accède au détail événement (route canonique SPEC).
- **Couverture :** UX-DR2, UX-DR12 ; appuie FR12, FR13.

---

#### Story 3.4 : Types d’événement et rôles requis / optionnels

En tant qu’administrateur,  
je veux configurer les types de spectacles et les rôles requis ou optionnels selon les règles de la troupe,  
afin que les dispos et compositions respectent le métier.

**Acceptance Criteria**

- **Given** un type d’événement éditable, **when** l’admin associe des rôles requis/optionnels, **then** ces contraintes pilotent les écrans dispo/composition (DOMAIN).
- **Couverture :** FR14 ; UX-DR10 (admin spectacles).

---

#### Story 3.5 : Délégation des organisateurs (périmètre saison / événement)

En tant qu’administrateur de troupe,  
je veux configurer qui peut agir comme organisateur au niveau saison ou événement lorsque le modèle le permet,  
afin de répartir l’organisation sans élargir les droits admin.

**Acceptance Criteria**

- **Given** le modèle de permissions (SPEC), **when** l’admin affecte ou retire des organisateurs sur le périmètre supporté, **then** les capacités organisateur (dispos, composition) suivent cette configuration.
- **Note :** l’affectation organisateur cible des **utilisateurs** (`users`) pour les permissions — distinct de l’ajout de participants (Story 3.8).
- **Couverture :** FR34 ; NFR-S2.

---

#### Story 3.6 : Vue ligue « Statistiques » (colonnes rôles / mois, export, masquage)

En tant que membre ou organisateur,  
je veux une vue **Statistiques** avec colonnes par rôle et par mois, expansion des détails et options d’export ou masquage,  
afin d’analyser la participation sur la ligue (FR53–FR54, FR60).

**Acceptance Criteria**

- **Given** des données disponibles pour la ligue, **when** l’utilisateur ouvre **Statistiques** depuis le workspace ligue, **then** la grille colonnes rôles × mois est affichée avec lignes expand/collapse (UX-DR9) — **pas** la liste chronologique des événements passés.
- **Given** les colonnes stats (JEU, DECORUM, DEPLAC., BÉNÉVOLE) et mois, **when** dispos et sélections existent, **then** chaque cellule affiche le ratio **sélectionné/disponible** avec **pourcentage arrondi** (ex. `2/7 (29%)`) — règles détaillées SPEC slice 12 et story file 3.6.
- **Given** l’action **Exporter** (menu admin saison), **when** un organisateur ou admin télécharge le CSV, **then** le format suit SPEC (stats/mois `sel/avail (%)`, cellules événement) — export **saison complète** (FR54).
- **Given** la toolbar Statistiques, **when** rendue, **then** **Détails/Masquer** est affiché et **Exporter** ne l’est **pas**.
- **Given** les actions « masquer », **when** l’utilisateur les déclenche, **then** le comportement suit SPEC (formats, permissions).
- **Couverture :** FR53–FR54, FR60 ; UX-DR9 ; NFR-P1.

**Story file:** `3-6-vue-historique-colonnes-roles-mois-export-masquage.md` *(nom fichier legacy ; scope = Statistiques)*

---

#### Story 3.6b : Vue ligue « Historique » (chronologie événements passés)

En tant que membre ou organisateur,  
je veux une vue **Historique** listant les événements passés de la ligue par mois,  
afin de parcourir le programme passé sans la grille de statistiques (FR53).

**Acceptance Criteria**

- **Given** des événements passés non archivés pour la ligue, **when** l’utilisateur ouvre **Historique**, **then** une liste chronologique groupée par mois s’affiche (cartes légères, statut composition, rôle utilisateur) — **sans** grille JEU/DECORUM (UX-DR19).
- **Couverture :** FR53 ; UX-DR19.

**Story file:** `3-6b-vue-historique-ligue-chronologie-export.md`

---

#### Story 3.7 : Suppression de saisons (admin troupe ou admin plateforme)

En tant qu’**administrateur de troupe** ou **administrateur de la plateforme**,  
je veux **supprimer définitivement** une saison (avec confirmation et garde-fous),  
afin de nettoyer les erreurs de saisie ou les jeux de test sans n’en rester qu’à l’archivage.

**Acceptance Criteria**

- **Given** un utilisateur autorisé (admin de la troupe concernée **ou** admin plateforme), **when** il confirme la suppression après dialogue explicite, **then** la saison est retirée côté serveur et l’UI reflète l’état ; les non autorisés reçoivent un refus cohérent (NFR-S2).
- **Couverture :** extension de FR11 ; détail des prérequis métier (données liées, saison active, audit) dans [_bmad-output/implementation-artifacts/requirements-season-delete.md](../implementation-artifacts/requirements-season-delete.md).

---

#### Story 3.8 : Rosters participants saison et événement

En tant qu’**administrateur de saison ou d’événement** autorisé,  
je veux ajouter et gérer des **participants** au niveau saison ou événement — y compris personnes **name-only** et personnes **pré-liées par email** —  
afin d’inclure membres troupe, contributeurs externes et participants ponctuels **sans** leur accorder l’adhésion troupe.

**Acceptance Criteria**

- **Given** un administrateur de saison, **when** il ajoute un participant saison avec nom affiché et email optionnel, **then** le participant apparaît dans les sélecteurs saison et peut être utilisé par les flux dispos/composition selon permissions (FR43).
- **Given** un administrateur d’événement, **when** il ajoute un invité **scope spectacle**, **then** le système upsert un carnet **`EXTERNE`**, une ligne roster événement, et un scope **`EVENT`** par défaut — sans accès membre ni dispos saison entière sauf opt-in explicite (FR44, ADR-0021). *(Amendé SCP 2026-06-06.)*
- **Given** un email correspondant à un utilisateur HatCast existant, **when** le participant est créé, **then** il est lié à cet utilisateur où permis (FR45).
- **Given** un email sans compte activé, **when** le participant est créé, **then** il reste un participant géré et peut être lié automatiquement à la **première connexion** avec le même email (FR45).
- **Given** aucun email, **when** le participant est créé, **then** il reste name-only et admin-géré (FR45).
- **Given** un utilisateur non autorisé, **when** il liste les participants, **then** les emails privés ne sont pas exposés (NFR-S5).
- **Given** un admin retire un participant, **then** l’historique dispos/composition/audit est préservé selon la politique de cycle de vie documentée.
- **Non-objectif :** CSV import/export participants (reste sur membres troupe — Story 2.3) ; invitations self-service (Epic 7 post-MVP).

**Dépendances :** Story 2.2 (permissions admin troupe) ; Story 3.5 (organisateurs saison/événement). **Doit être livrée avant Stories 5.1–5.5 et 6.4–6.9.**

**Couverture :** FR43, FR44, FR45 ; UX-DR10 ; NFR-S5.

---

#### Story 3.23 : Scope d’invitation et cascade à l’ajout *(P2 — ADR-0021, SCP 2026-06-06)*

En tant qu’**organisateur** ajoutant un invité au niveau saison ou spectacle,  
je veux que le système upsert carnet + roster avec le **scope d’invitation** correct,  
afin que les parcours Laetitia (saison) et Ruben (spectacle) fonctionnent sans étape Membres séparée.

**Acceptance Criteria**

1. **Given** le schéma participant, **when** migré, **then** `season_participants.invitation_scope` (`SEASON` | `EVENT`) est exposé (Flyway + OpenAPI).
2. **Given** ajout saison, **when** externe créé, **then** carnet `EXTERNE` + ligne saison scope **`SEASON`**.
3. **Given** ajout spectacle, **when** invité one-shot, **then** carnet + ligne événement scope **`EVENT`** par défaut ; pas de dispos saison entière sans opt-in.
4. **Given** ré-inclusion, **when** même personne, **then** réutilisation des IDs stables (membership, season_participant, event_participant).
5. **Couverture :** FR43, FR44, FR45 ; ADR-0021 P2. **Priorité :** P1. **Depends :** **2.21**, **3.8** (done). **Blocks :** **3.8d**, **3.25**. **SCP :** [sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md](sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md).

---

#### Story 3.8d : Typeahead ajout participant — pool carnet *(P3 — ADR-0021, Lot A-ext)*

En tant qu’**organisateur** sur « Ajouter un participant »,  
je veux des suggestions incluant les **Externes** et lignes roster pertinentes,  
afin de ré-inviter Ruben ou Laetitia sans ressaisie.

**Acceptance Criteria**

1. **Given** le dialog ajout, **when** l’orga tape un nom, **then** suggestions = `MEMBER` + `TROUPE_ADMIN` + `EXTERNE` actifs + roster saison selon contexte.
2. **Given** sélection carnet, **when** soumis, **then** nom/email préremplis ; scope défini via UI **3.23**.
3. **Given** aucune suggestion, **when** nom libre soumis, **then** création name-only inchangée (FR45).
4. **Couverture :** FR43–FR45 ; plan Lot A-ext. **Priorité :** P2. **Depends :** **2.21**, **3.23**. **Extends :** **3.8c** (done, pas de réouverture CR).

---

#### Story 3.25 : Accès invité scopé pour externes liés *(P4 — ADR-0021)*

En tant qu’**invité externe** avec compte HatCast lié,  
je veux dispos et agenda **uniquement** sur les événements de mon scope d’invitation,  
afin de participer sans accès hub membre troupe.

**Acceptance Criteria**

1. **Given** `EXTERNE` + scope **`SEASON`**, **when** compte lié, **then** agenda utilisateur inclut les événements saison publiés ; dispos sur ces événements ; pas d’espace saison membre complet.
2. **Given** `EXTERNE` + scope **`EVENT`**, **when** compte lié, **then** agenda + dispos uniquement sur le(s) spectacle(s) invité(s).
3. **Given** carnet seul, **when** pas d’invitation active, **then** pas d’accès app membre.
4. **Couverture :** FR48 ; ADR-0021 P4, ADR-0011. **Priorité :** P2. **Depends :** **3.23**, Epic **12** (`/agenda`). **Blocks :** Epic **7** self-service (soft).

---

#### Story 3.21 : Brouillon événement et publication — ouverture aux disponibilités *(SCP 2026-06-01 — P0 MEP)*

En tant qu’**organisateur saison ou événement**,  
je veux que les spectacles démarrent en **brouillon** et soient **publiés** lorsque je suis prêt à collecter les disponibilités,  
afin de configurer lieu, description, roster et pré-affectations compo **sans** notifier les membres ni accepter de dépôts de dispos prématurés.

**Acceptance Criteria**

- **Given** un nouvel événement, **when** il est créé, **then** l’état par défaut est **brouillon** (`availabilityOpenedAt` null) — pas de dépôt de disponibilité membre, pas d’intent **AVAILABILITY_OPENED** (FR31).
- **Given** un événement brouillon, **when** l’organisateur **publie le spectacle** (`POST …/actions/open-availability`), **then** les participants concernés peuvent déposer leurs dispos ; l’intent membre **AVAILABILITY_OPENED** devient éligible (Story **8.3**).
- **Given** un événement **publié**, **when** l’organisateur **remet en brouillon** (`POST …/actions/close-availability`, ex. modale Modifier), **then** l’événement disparaît des agendas **membre** ; les dispos sont fermées ; la fiche reste consultable via lien direct avec bandeau d’avertissement (membre sans CTA publish).
- **Given** brouillon, **when** l’organisateur configure lieu, description, roster, slots compo pré-remplis, **then** c’est autorisé ; les **membres** ne voient pas le spectacle dans les **listes** (agenda saison, Mon agenda).
- **Given** UI workspace événement, **when** brouillon vs publié, **then** bandeau **au-dessus des onglets** (chip *Brouillon* + **« Publier le spectacle »** pour orgas) ; agendas orga : carte `agenda-card--draft` — voir [ux-event-draft-publish-3-21.md](./ux-event-draft-publish-3-21.md).
- **Couverture :** prépare FR31 MEP ; croise FR12, FR22 (prep compo) ; **bloque Story 8.3**.

**Priorité :** **P0 MEP** — avant **8.3**.  
**Depends :** 3.2, 3.4, 3.8.  
**SCP :** [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md](./sprint-change-proposal-2026-06-01-notifications-epic8-scope.md)

---

### Epic 4 — Découverte publique (annuaire et pages visiteur)

#### Story 4.1 : Annuaire public des troupes

En tant que visiteur sans compte,  
je veux parcourir l’annuaire des troupes listées publiquement,  
afin de découvrir les troupes ouvertes.

**Acceptance Criteria**

- **Given** des troupes marquées publiques, **when** un visiteur consulte l’annuaire (section **Découvrir** sur `/troupes`), **then** seules les entrées publiques sont listées en cartes, **sans exiger de connexion** pour la consultation (NFR-S2, FR32).
- **Given** un visiteur non connecté, **when** il clique sur une carte troupe, **then** il est redirigé vers la connexion avec retour prévu vers la troupe ciblée.
- **Given** un utilisateur connecté, **when** il ouvre une troupe depuis l’annuaire, **then** il accède au hub `/troupes/:slug` **uniquement s’il est membre ou administrateur** de cette troupe ; sinon l’accès est **refusé** avec un message clair (pas de parcours d’adhésion complexe dans cette story).
- **Couverture :** FR32 ; NFR-P1 ; NFR-S2.

---

#### Story 4.2 : Pages publiques saison et événements

En tant que visiteur,  
je veux consulter les informations publiques de saison et de spectacles pour un contenu marqué public,  
afin de m’informer sans adhésion.

**Acceptance Criteria**

- **Given** une troupe/saison/événement publics, **when** le visiteur ouvre la page dédiée, **then** les champs publics s’affichent et les données membres restreintes ne fuient pas (NFR-S2).
- **Couverture :** FR33 ; NFR-S2.

---

### Epic 5 — Disponibilités (participants et organisations)

#### Story 5.1 : Saisie de disponibilité par événement (états Dispo / Pas dispo / Non renseigné)

En tant que **participant lié** (membre troupe ou participant saison/événement avec compte),  
je veux enregistrer ma disponibilité pour chaque spectacle avec les trois états prévus,  
afin que les organisateurs planifient la présence.

**Acceptance Criteria**

- **Given** un spectacle auquel j’ai accès en tant que participant autorisé, **when** j’ouvre la modale de disponibilité (UX-DR3, **MatDialog**), **then** je peux choisir Dispo / Pas dispo / Non renseigné et enregistrer.
- **And** le titre de la modale indique clairement pour qui porte la saisie lorsque pertinent.
- **Couverture :** FR15 ; UX-DR3 ; NFR-A1 (focus clavier sur dialog).

---

#### Story 5.2 : Disponibilité par rôle et rôles favoris pré-sélectionnés

En tant que **participant lié**,  
je veux indiquer ma disponibilité au niveau des rôles requis, avec **pré-sélection de mes rôles favoris** troupe lorsque configurés,  
afin de signaler rapidement sur quels postes je peux jouer.

**Acceptance Criteria**

- **Given** un type d’événement avec choix de rôles (DOMAIN), **when** je suis « Dispo », **then** je peux exprimer la candidature par rôle conformément aux règles (FR16).
- **Given** des rôles favoris troupe configurés (FR46), **when** j’ouvre le formulaire pour un type d’événement applicable, **then** ces rôles sont **pré-cochés** et je peux les modifier avant soumission.
- **Given** couverture bénévole obligatoire (FR14), **when** un rôle jeu est marqué Dispo, **then** le bénévolat est enregistré Dispo sauf décochage explicite.
- **Couverture :** FR16, FR46 ; UX-DR5 (candidature rôle si Dispo).

---

#### Story 5.3 : Vue organisateur — disponibilités par rôle et vues Moi / Tous

En tant qu’organisateur,  
je veux voir qui est disponible pour chaque rôle, avec sélecteur de sujet (moi/autre) et bascule Moi/Tous,  
afin de préparer la composition.

**Acceptance Criteria**

- **Given** un événement avec dispos saisies, **when** l’organisateur ouvre l’onglet Dispos, **then** les grilles par rôle et pourcentages/transparence suivent UX-DR5 et SPEC.
- **Couverture :** FR19 ; UX-DR5.

---

#### Story 5.4 : Commentaire optionnel sur la disponibilité

En tant que **participant lié**,  
je veux ajouter un commentaire facultatif (max **500 caractères**) à ma disponibilité,  
afin de préciser des contraintes utiles aux organisateurs.

**Acceptance Criteria**

- **Given** le champ commentaire activé, **when** je sauvegarde une dispo avec texte **≤ 500 caractères**, **then** le commentaire est stocké et visible aux orgas/admins sur la vue dispos — **pas** sur les pages publiques (FR18).
- **Given** un texte > 500 caractères, **when** je tente de sauvegarder, **then** une erreur de validation est affichée.
- **Couverture :** FR18 ; NFR-S2.

---

#### Story 5.5 : Saisie de disponibilité pour un autre participant (proxy) avec audit

En tant qu’organisateur ou administrateur autorisé,  
je veux saisir ou ajuster la disponibilité pour le compte d’un **participant** (y compris name-only ou non encore lié),  
afin de corriger des cas réels tout en laissant une trace d’audit.

**Acceptance Criteria**

- **Given** les permissions proxy (SPEC), **when** l’orga enregistre une dispo pour un participant cible (membre lié, participant géré, etc.), **then** l’enregistrement inclut l’identité de l’acteur réel pour audit (FR35 lié, FR17).
- **Given** un utilisateur sans droit proxy, **when** il tente l’action, **then** elle est refusée.
- **Couverture :** FR17 ; prépare FR35 ; NFR-S2.

---

#### Story 5.9 : Portes explainability Dispos vs Équipe *(SCP 2026-06-09)*

En tant que **membre** sur un spectacle publié,  
je veux **voir pool, % et breakdown sur Dispos** pendant la collecte des dispos,  
afin de **comprendre mes chances sans voir le brouillon de composition sur Équipe**.

**Acceptance Criteria**

1. **Given** spectacle **publié** sans composition, **when** membre `includeChances=true`, **then** `chancePercent` renvoyé (FR24 Dispos).
2. **Given** même membre, **when** GET composition, **then** slots masqués (FR22).
3. **Given** orga brouillon compo, **when** Dispos ou Équipe explainability, **then** autorisé.
4. **Given** membre post-déverrouillage (FR23), **when** Dispos, **then** pool/% visibles ; Équipe slots masqués.
5. **Given** spectacle brouillon/archivé, **when** membre `includeChances`, **then** refusé (**3.21**).
6. **Couverture :** FR24 ; ADR 0019 §2b ; stories **5.8**, **6.3**, **19.7**. **Depends :** **5.8**, **19.7** (done). **SCP :** [sprint-change-proposal-2026-06-09-explainability-gates-dispos-equipe.md](./sprint-change-proposal-2026-06-09-explainability-gates-dispos-equipe.md).

---

### Epic 6 — Tirage, composition et cycle de vie des confirmations

#### Story 6.1 : États de cycle de vie de composition et cohérence UI

En tant qu’utilisateur autorisé,  
je veux voir un état de composition cohérent (préparation, attente confirmations, terminé, etc.) sur un événement,  
afin de comprendre où en est le processus.

**Acceptance Criteria**

- **Given** un événement dans la saison, **when** tout utilisateur autorisé consulte l’écran, **then** l’état affiché correspond au modèle de cycle de vie (FR28, SPEC).
- **Couverture :** FR28 ; UX-DR4 (bandeau / zone statut sur Infos).

---

#### Story 6.2 : Détail événement plein écran — onglets Infos / Dispos / Équipe

En tant que membre ou organisateur,  
je veux un écran détail avec onglets Infos, Dispos et Équipe et une URL canonique,  
afin de naviguer clairement dans le spectacle.

**Acceptance Criteria**

- **Given** un événement accessible, **when** j’ouvre le détail, **then** les trois onglets sont présents avec contenu pertinent et l’URL respecte SPEC (UX-DR4).
- **Couverture :** UX-DR4 ; s’appuie sur Epic 5 pour Dispos.

---

#### Story 6.3 : Composition brouillon, publication et visibilité

En tant qu’organisateur,  
je veux enregistrer une composition en **brouillon** invisible aux membres ordinaires, puis la **publier** explicitement,  
afin d’itérer en privé avant de rendre la proposition visible (FR22).

**Acceptance Criteria**

- **Given** une composition en draft, **when** un membre ordinaire consulte l’événement, **then** il ne voit pas les assignations draft (FR22).
- **Given** un organisateur, **when** il consulte l’onglet Équipe, **then** il voit le draft.
- **Given** un brouillon prêt, **when** l’organisateur exécute l’action **« Publier »**, **then** la composition devient visible aux membres autorisés et déclenche l’intent notification « draft composition shared » si configuré (FR22, FR31).
- **Couverture :** FR22 ; UX-DR6 (draft vs validée).

---

#### Story 6.4 : Tirage aléatoire pondéré et affichage des cotes (explainability)

En tant qu’organisateur,  
je veux lancer un tirage pondéré pour remplir les rôles parmi les **participants éligibles** et voir les informations de cotes/explicabilité lorsque le produit les affiche,  
afin d’alléger le travail manuel tout en restant transparent.

**Acceptance Criteria**

- **Given** des dispos et règles de tirage (DOMAIN), **when** l’organisateur lance le tirage, **then** les rôles sont pourvus selon les règles et le résultat est persisté pour des **identités participant** (FR20).
- **Given** un participant autorisé, **when** il consulte les cotes sur **Dispos**, **then** elles sont visibles sur spectacle publié (FR24 Dispos). **When** il consulte les cotes sur **Équipe** (slots assignés), **then** elles suivent publication ou validation de la composition (FR24 Équipe).
- **Couverture :** FR20, FR24 ; UX-DR6 (animation barre proportionnelle + curseur si applicable).

---

#### Story 6.5 : Assignation manuelle et réassignation des rôles

En tant qu’organisateur,  
je veux assigner ou réassigner manuellement des **participants** aux rôles depuis les listes ordonnées (membres, participants saison/événement),  
afin d’ajuster le tirage ou gérer des cas particuliers.

**Acceptance Criteria**

- **Given** des candidats éligibles pour un rôle, **when** l’organisateur sélectionne un participant pour un créneau, **then** la composition reflète le choix ; un même participant peut occuper **plusieurs rôles** sauf interdiction par type d’événement (FR21).
- **Couverture :** FR21 ; UX-DR6 (sélection dans liste ordonnée).

---

#### Story 6.6 : Validation (verrouillage) et déverrouillage de la composition

En tant qu’organisateur,  
je veux **valider/verrouiller** la composition avant envoi des demandes de confirmation, et **déverrouiller** si nécessaire,  
afin de figer ou rouvrir la proposition officielle (FR23).

**Acceptance Criteria**

- **Given** une composition prête, **when** l’organisateur **valide**, **then** l’état passe en « validé » / awaiting confirmations et l’intent notification confirmation request est émis si configuré (FR23, FR28, FR31).
- **Given** une composition validée, **when** un organisateur autorisé **déverrouille**, **then** `validatedAt` est effacé, les assignations restent, les statuts de participation **sont préservés**, la composition redevient éditable pour les orgas/admins, et les membres ordinaires ne voient plus les slots (FR23).
- **Given** une composition en brouillon orga post-déverrouillage, **when** l'organisateur **remplace l'assigné** d'un slot, **then** le nouveau assigné passe à `pending` ; les slots non modifiés conservent leur statut (FR23).
- **Couverture :** FR23, FR28.

---

#### Story 6.7 : Confirmation ou déclinaison de participation (participant lié)

En tant que **participant lié** avec un rôle assigné en phase de confirmation,  
je veux confirmer ou décliner ma participation **après validation de la composition**,  
afin de verrouiller mon engagement ou signaler mon indisponibilité.

**Acceptance Criteria**

- **Given** une composition **validée** en phase confirmation ou gaps to fill, **when** le participant lié choisit Confirmer ou Décliner, **then** l’état de participation est mis à jour et visible aux rôles autorisés (FR25).
- **Couverture :** FR25 ; UX-DR6 (modale participation).

---

#### Story 6.8 : Confirmation ou déclinaison pour le compte d’un participant (proxy)

En tant qu’organisateur ou administrateur autorisé,  
je veux confirmer ou décliner pour le compte d’un **participant** (y compris name-only) avec traçabilité,  
afin de débloquer la situation lorsque le participant n’a pas de compte ou ne peut pas agir lui-même.

**Acceptance Criteria**

- **Given** les permissions proxy, **when** l’orga enregistre une décision pour un participant, **then** l’audit enregistre acteur et sujet (FR26, lien FR35).
- **Given** une composition en brouillon orga (`validatedAt` null), **when** l’orga proxy confirme/décline/remet en attente, **then** le statut est mis à jour sans notification membre jusqu’à validation/re-validation (FR26, FR31 ; SCP 2026-06-06).
- **Couverture :** FR26.

---

#### Story 6.9 : Créneaux vacants après déclin et actions de suivi

En tant qu’organisateur,  
je veux voir les créneaux ouverts après déclin/retrait et agir (**assignation manuelle**, **tirage partiel**, **notification ciblée**),  
afin de compléter l’équipe.

**Acceptance Criteria**

- **Given** un déclin ou retrait en phase awaiting confirmations / gaps to fill, **when** l’organisateur consulte l’événement, **then** les gaps sont mis en évidence et les actions supportées sont proposées (FR27).
- **Couverture :** FR27.

---

#### Story 6.11 : Retour visuel et performances — onglet Équipe (profilage)

En tant qu’organisateur ou participant sur l’onglet **Équipe**,  
je veux un **retour visuel clair** pendant les actions lentes et des **mutations plus réactives**,  
afin que l’expérience post-pilote MVP reste utilisable (ISSUES UX-001, UX-002, PERF-001).

**Acceptance Criteria**

- **Given** une mutation composition en cours, **when** l’utilisateur attend la réponse API, **then** un état busy visible couvre l’onglet (pas seulement un spinner sur un bouton).
- **Given** le profilage documenté sur spectacles seed `[MVP]`, **when** les causes de lenteur sont identifiées, **then** appliquer les correctifs minimaux (front reloads redondants, puis API si nécessaire).
- **Couverture :** NFR-P2, NFR-A1 ; story file [`6-11-retour-visuel-et-performances-onglet-equipe.md`](../implementation-artifacts/6-11-retour-visuel-et-performances-onglet-equipe.md).

---

#### Story 6.10 : Partage et annonce (message éditable, canaux)

En tant qu’organisateur,
je veux ouvrir une modale de partage/annonce avec message généré éditable et envoi vers canaux supportés (ex. WhatsApp, liste push/email),
afin de communiquer sur le spectacle ou la composition.

**Acceptance Criteria**

- **Given** un événement ou jalons composition, **when** l’organisateur ouvre « partager / annoncer », **then** le texte est prérempli, éditable et les actions de canal disponibles suivent SPEC (UX-DR7).
- **Couverture :** UX-DR7 ; croise FR31 pour canaux.

---

#### Story 6.10b : Rappel manuel de disponibilité + garde anti-spam *(P1 — SCP 2026-06-01)*

En tant qu’**organisateur**,  
je veux envoyer en un clic un **rappel de disponibilité** personnalisable lorsque des réponses manquent,  
afin de relancer sans attendre les rappels automatiques, tout en évitant le spam involontaire.

**Acceptance Criteria**

- **Given** un événement publié avec dispos insuffisantes, **when** l’organisateur déclenche « Rappel dispos », **then** message éditable + **Copier / WhatsApp** ; transparence via GET `share-recipients` (story **6.23** — remplace envoi bulk UI et intent **MANUAL_AVAILABILITY_NUDGE** via Notifier).
- **Given** un rappel déjà envoyé récemment, **when** l’organisateur retente, **then** ~~l’UI avertit (« rappel envoyé il y a X jours ») et demande confirmation explicite~~ **N/A UI 6.23** — garde anti-spam POST conservée API seulement ; orga voit qui est *déjà notifié* dans la ligne compacte.
- **Couverture :** UX-DR7 ; P1 post-MEP ; complète intents auto (**8.4**).

---

#### Story 6.20 : Avertissement rejeu spectacle précédent (même rôle, même compartiment) *(P2 — SCP 2026-06-05)*

En tant qu’**organisateur** constituant l’équipe,  
je veux un **avertissement visible mais non bloquant** sur un créneau lorsque la personne assignée occupait **déjà le même rôle** au **spectacle validé chronologiquement précédent** dans le **même compartiment** (catégorie),  
afin de **décider en connaissance de cause** de maintenir ou changer ce choix.

**Acceptance Criteria**

1. **Given** la position chronologique et le compartiment (`SpectacleCategory.slug`) de l’événement courant, **when** le système résout le prédécesseur immédiat, **then** c’est le dernier événement antérieur de la saison dans le **même compartiment** avec composition **validée** (non archivé).
2. **Given** aucun prédécesseur, **when** un créneau est assigné, **then** aucun avertissement.
3. **Given** un prédécesseur P et une assignation (participant X, rôle R), **when** X occupait R sur P (slot validé, non `DECLINED`), **then** le créneau affiche un hint inline avec **titre** et **date** de P (FR, sans modale).
4. **Given** P dans un **compartiment différent**, **when** assignation, **then** **pas** d’avertissement (ex. déplacement puis apéro/principal).
5. **Given** une composition **brouillon**, **when** l’assignation déclenche l’avertissement, **then** il reste visible pour les orgas (prévention avant validation).
6. **Given** assignation **manuelle** ou **tirage auto**, **when** les slots sont persistés, **then** même comportement après refresh API.
7. **Given** un avertissement affiché, **when** l’orga retire ou remplace le slot, **then** l’avertissement disparaît ou se met à jour.
8. **Given** le hint UI, **when** rendu, **then** tokens Material 3 warning ; checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) ; pas de modale.
9. **Couverture :** FR21 (UX assignation) ; complète sans implémenter **19.9** (facteur tirage). **Priorité :** P2. **Depends :** **6.5**, **17.7**. **UX :** [ux-design-composition-consecutive-show-warning.md](ux-design-composition-consecutive-show-warning.md). **SCP :** [sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md](sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md).

---

#### Story 6.21 : Hint parité de genre sur composition (rôle player) *(P2 — SCP 2026-06-05 G-011)*

En tant qu’**organisateur** constituant l’équipe,  
je veux un **résumé compact de parité F/H** sur les créneaux **Comédien·ne** (`player`) du brouillon,  
afin de **voir l’équilibre** sans que mes choix soient bloqués.

**Acceptance Criteria**

1. **Given** un brouillon avec créneaux `player` remplis, **when** l’onglet Équipe s’affiche, **then** une bande informative montre les effectifs F/M (genres connus uniquement).
2. **Given** aucun genre connu sur les `player` assignés, **when** affichage, **then** pas de ratio ou copy « parité non calculable » (UX spec).
3. **Given** modification des slots, **when** refresh API, **then** le hint se met à jour.
4. **Given** le hint, **when** rendu, **then** ton informatif M3 ; pas de modale ; non bloquant.
5. **Couverture :** FR21. **Priorité :** P2. **Depends :** **2.12**, **6.5** (done). **UX :** [ux-design-member-gender-parity.md](ux-design-member-gender-parity.md) § Équipe parity strip. **SCP :** [sprint-change-proposal-2026-06-05-member-gender-parity.md](sprint-change-proposal-2026-06-05-member-gender-parity.md).

---

### Epic 7 — Invitations self-service et contributeurs externes (post-MVP)

#### Story 7.1 : Invitations self-service pour contributeurs externes *(post-MVP)*

En tant qu’organisateur,  
je veux envoyer une **invitation self-service** pour un rôle et un périmètre d’événements lorsque la troupe a activé cette capacité,  
afin de faire onboarder un contributeur externe **sans** adhésion `MEMBER` préalable (s’appuie sur carnet **EXTERNE** + FR43–FR45 — ADR-0021).

**Acceptance Criteria**

- **Given** la capacité self-service activée pour la troupe, **when** l’organisateur crée une invitation avec rôle et périmètre, **then** l’invité reçoit le flux prévu (lien, email, etc.) et l’invitation est traçable.
- **Couverture :** FR38 *(post-MVP)* ; NFR-S2. **Depends :** **2.21**, **3.23** (carnet + scope avant self-service).

---

#### Story 7.2 : Modes de sélection alternatifs pour contributeurs externes *(post-MVP)*

En tant qu’organisateur,  
je veux configurer des modes alternatifs (direct pick, joker) pour les contributeurs invités sous FR38, **exclus du tirage pondéré par défaut** sauf inclusion explicite,  
afin de respecter le cadre convenu avec la troupe.

**Acceptance Criteria**

- **Given** une invitation valide sous FR38, **when** l’organisateur constitue l’équipe, **then** les règles FR39 sont respectées (exclusion du pool de tirage par défaut sauf configuration explicite).
- **Couverture :** FR39 *(post-MVP)* ; aligné DOMAIN/SPEC.

---

### Epic 8 — Notifications (push, email, préférences)

#### Story 8.1 : Opt-in global aux notifications push navigateur

En tant qu’utilisateur,  
je veux activer ou désactiver les **notifications push du navigateur globalement**,  
afin d’être informé des événements importants (MVP : pas de préférences par catégorie).

**Acceptance Criteria**

- **Given** un navigateur supporté, **when** l’utilisateur accepte les permissions push, **then** l’inscription push est enregistrée côté serveur et l’état UI reflète l’opt-in global (FR29).
- **Given** l’utilisateur refuse ou révoque les permissions, **then** aucune notification push n’est envoyée (FR29/FR30).
- **Couverture :** FR29, FR30 ; NFR-R2 (gestion erreurs livraison).

---

#### Story 8.2 : Préférences de notification *(post-MVP pour catégories)*

En tant qu’utilisateur,  
je veux gérer mes préférences pour les types de notifications lorsque le produit les expose au-delà de l’opt-in global,  
afin de réduire le bruit *(catégories différées post-MVP — FR30)*.

**Acceptance Criteria**

- **Given** les types exposés par le produit (post-MVP catégories), **when** l’utilisateur modifie ses préférences, **then** seuls les canaux/types autorisés sont modifiés et appliqués aux envois futurs (FR30).
- **MVP :** l’opt-in global (Story 8.1) gouverne tous les types push ; catégories activées en **P1** avec **8.5** (FYI opt-out, rappels) — voir SCP 2026-06-01.
- **Couverture :** FR30 *(post-MVP catégories)*.

---

#### Story 8.3 : Notifications MEP — ouverture dispos et confirmation assignés *(SCP 2026-06-01 — P0 MEP)*

En tant que **membre concerné**,  
je veux **recevoir des notifications** à l’**ouverture des disponibilités** (publication événement) et à la **demande de confirmation** lorsque je suis **assigné** à une composition validée,  
afin de **ne pas rater une étape** sans dépendre uniquement du passage dans l’app.

**Acceptance Criteria**

- **Given** publication / ouverture dispos (Story **3.21**), **when** le jalon se produit, **then** les participants roster concernés **éligibles** reçoivent **AVAILABILITY_OPENED** sur push (FR29/8.1) et/ou email (politique troupe) ; pas de notif à la création brouillon.
- **Given** validate composition (FR23), **when** le jalon se produit, **then** **seuls les assignés** reçoivent **CONFIRMATION_REQUEST** — pas le roster entier en MEP.
- **Given** brouillon compo partagé ou transition **complete**, **when** 8.3 MEP, **then** **aucune** notif membre (intents orga → **8.4** P2 ; FYI roster → **8.5** P1).
- **Given** éligibilité (opt-in push, email, prefs globales), **when** canal indisponible, **then** pas d’erreur domaine ; échec async observable (NFR-R2).
- **Given** inbox membre (17.21), **when** push émis, **then** inbox **≠** log d’envoi — actions dérivées de l’état métier uniquement.
- **Couverture :** FR31 MEP ; NFR-R2 ; **Depends:** **8.1**, **3.21** ; manuel 6.10 / 6.10b séparé.

**Priorité :** **P0 MEP**. **Out of MEP scope:** intents orga (**8.4**), extensions membre (**8.5**), catégories 8.2 (sauf global 8.1).

---

#### Story 8.4 : Notifications ops organisateurs *(post-MEP P2 — SCP 2026-06-01)*

En tant qu’**organisateur ou admin saison**,  
je veux recevoir des **signaux ops automatiques** (brouillon créé, brouillon compo, SLA dispos, compo incomplète, équipe bouclée),  
afin de piloter la troupe sans tout surveiller manuellement.

**Acceptance Criteria**

- **Given** les intents **FR31b** (catalogue SCP), **when** le jalon se produit, **then** destinataires via cascade : orga événement → admin saison → admin troupe si orga événement absent.
- **Given** brouillon compo partagé, **when** notif émise, **then** **orga only** — pas roster ni assignés.
- **Given** transition **complete**, **when** notif émise, **then** **orga only** — pas assignés confirmés ni roster.
- **Couverture :** FR31b ; NFR-R2.

**Priorité :** **P2** post-MEP. **Depends:** **8.3** dispatcher, **3.21**.

---

#### Story 8.5 : Extensions notifications membre *(P1 — SCP 2026-06-01)*

En tant que **membre**,  
je veux des notifications **complémentaires** (FYI équipe validée opt-out, rappels J-7/J-1, retrait compo, re-confirmation),  
afin d’être informé sans spam.

**Acceptance Criteria**

- **Given** validate, **when** FYI roster activé, **then** non-assignés reçoivent listing équipe — **opt-out** catégorie (**8.2**).
- **Given** assigné confirmé, **when** J-7 / J-1, **then** rappels présence avec infos compo + CTA décliner.
- **Given** retrait slot / remodel, **when** règles produit (removal alert, re-confirm), **then** intents correspondants émis.
- **Couverture :** FR31 P1 ; croise **8.2**.

**Priorité :** **P1** post-MEP initial. **Depends:** **8.3**, **8.2** (catégories).

---

#### Story 8.6 : Notifications proxy — confirmation au membre concerné *(P1 — SCP 2026-06-01)*

En tant que **membre dont la disponibilité ou la participation a été saisie par un organisateur en mon nom** (proxy **5.5** / **6.8**),  
je veux **recevoir une notification indiquant qu’un administrateur a enregistré ma dispo ou ma décision de confirmation**,  
afin de **valider que l’app reflète mon intention réelle** (ex. réponse WhatsApp) et **détecter une erreur de saisie** sans devoir ouvrir l’app régulièrement.

**Acceptance Criteria**

- **Given** une mise à jour de disponibilité **proxy** (`actor ≠ subject`, Story **5.5**), **when** la transaction réussit, **then** le **sujet** (participant lié à un `user_id`) reçoit l’intent **`PROXY_AVAILABILITY_RECORDED`** sur push (FR29) et/ou email — **pas** le roster entier, **pas** l’acteur proxy.
- **Given** une confirmation ou déclinaison **proxy** (Story **6.8**), **when** la transaction réussit, **then** le **sujet** reçoit **`PROXY_CONFIRMATION_RECORDED`** avec la décision enregistrée (confirmé / décliné) — **distinct** de **`CONFIRMATION_REQUEST`** (8.3) qui **demande** une action, pas un **accusé** d’enregistrement proxy.
- **Given** une action **non proxy** (`actor = subject` ou membre agit pour lui-même), **when** la mutation réussit, **then** **aucune** notif proxy n’est émise.
- **Given** un participant **sans compte lié** (name-only), **when** proxy réussit, **then** pas de notif (skip silencieux) ; l’audit **9.0** reste la trace pour l’orga.
- **Given** le payload, **when** la notif est construite, **then** elle inclut **nom de l’acteur** (orga), **titre + date événement**, **résumé du changement** (ex. statut dispo avant→après, rôle concerné, confirmé/décliné) et **deep link** vers l’onglet dispos ou équipe de l’événement.
- **Given** éligibilité (**8.1**, email, **8.2** si catégories), **when** canal indisponible, **then** pas d’erreur domaine ; échec async loggé (NFR-R2).
- **Given** journal audit (**9.0** / UI **9.2**), **when** 8.6 est livré, **then** la notif **complète** la piste d’audit (signal proactif) — **ne remplace pas** la consultation « changements me concernant ».
- **Couverture :** FR31 P1 ; prolonge FR17, FR26 ; croise FR35 (audit déjà en place).

**Priorité :** **P1** post-MEP initial (même vague que **8.5** — workflow WhatsApp → proxy orga très fréquent). **Depends:** **8.3** (dispatcher), **5.5**, **6.8**, **9.0**. **Out of scope:** notif à l’orga (→ **8.4**), rappels J-7/J-1 (→ **8.5**).

---

### Epic 9 — Audit et historique des changements significatifs

Journal unifié FR35 : **9.0** enregistre à chaque mutation ; **9.1** / **9.2** exposent la consultation UI (post-MEP initial).

#### Story 9.0 : Capture backend de la piste d’audit *(MEP — PLAN § Epic 9)*

En tant qu’**opérateur produit / administrateur troupe**,  
je veux que **chaque changement significatif** soit **enregistré automatiquement** avec acteur, horodatage et valeurs avant/après,  
afin de garantir la gouvernance dès la mise en production V2 même sans UI de consultation.

**Acceptance Criteria**

- **Given** une création, mise à jour ou **suppression** de disponibilité (y compris proxy **5.5**), **when** la transaction métier réussit, **then** une entrée d’audit est persistée avec `actor`, `subject` si proxy, `action_type`, `occurred_at` (seconde), **`event_id`**, `before` / `after` pour au minimum `status`, `roleKeys`, `comment` (FR35).
- **Given** la **création**, **modification** (date/heure, titre, lieu, description, type, rôles, slug, catégorie…) ou **archivage/désarchivage** d’un spectacle (`EventService`), **when** la transaction réussit, **then** une entrée d’audit `EVENT_*` capture acteur, scope (`troupe_id`, `season_id`, `event_id`) et `before` / `after` des champs modifiés.
- **Given** l’**ajout**, **modification**, **retrait** ou **ré-inclusion** d’un participant roster (saison, événement, exclusion event), **when** la transaction réussit, **then** une entrée d’audit `SEASON_PARTICIPANT_*`, `EVENT_PARTICIPANT_*` ou `EVENT_ROSTER_*` capture acteur, sujet participant et `before` / `after`.
- **Given** l’**ajout**, **modification**, **désactivation** d’un membre troupe ou l’**octroi/révocation** d’un rôle organisateur (saison/événement), **when** la transaction réussit, **then** une entrée d’audit `TROUPE_MEMBER_*` ou `*_ORGANIZER_*` capture acteur, sujet user et droits avant/après (FR34).
- **Given** une mutation de composition (publish brouillon, validate, unlock, assignation manuelle, tirage, retrait de slot), **when** elle réussit, **then** une entrée d’audit capture l’état composition / slots avant et après (FR35).
- **Given** une confirmation, déclinaison ou retrait (membre ou proxy **6.8**), **when** elle réussit, **then** une entrée d’audit enregistre acteur, sujet et statut avant/après (FR35).
- **Given** le journal append-only, **when** une entrée est écrite, **then** elle n’est **ni modifiée ni supprimée** par les flows applicatifs standard (rétention / anonymisation = politique séparée, ex. **1.7**).
- **Couverture :** FR35 write path ; prolonge FR17, FR26 ; **UI = Story 9.1** ; pas d’API GET requise dans cette story.

---

#### Story 9.1 : Consultation de la piste d’audit pour utilisateurs autorisés *(post-MEP initial)*

En tant qu’**administrateur troupe, organisateur saison ou organisateur événement** autorisé,  
je veux consulter une piste d’audit des changements significatifs avec **acteur**, **sujet**, **type d’action**, **horodatage à la seconde** et **valeurs avant/après** pour dispos et composition,  
afin de comprendre ce qui s’est passé (FR35).

**Acceptance Criteria**

- **Given** des événements d’audit enregistrés, **when** un utilisateur autorisé ouvre la vue audit, **then** chaque entrée affiche acteur, sujet (si proxy), type d’action, horodatage (FR35).
- **Given** une modification de disponibilité, sélection de rôle ou assignation de créneau, **when** l’entrée est consultée, **then** les valeurs **avant/après** minimales requises sont visibles (FR35).
- **Given** un utilisateur non autorisé, **when** il tente l’accès, **then** il est refusé (NFR-S2).
- **Couverture :** FR35 ; prolonge FR17, FR26 ; NFR-S2.

---

#### Story 9.2 : Consultation audit — changements me concernant *(post-MEP initial)*

En tant que **membre**,  
je veux consulter l’historique des changements qui **me concernent** (où je suis sujet ou acteur),  
afin de comprendre qui a modifié ma dispo, ma confirmation ou ma place en composition.

**Acceptance Criteria**

- **Given** des entrées **9.0** où l’utilisateur est sujet ou acteur, **when** il ouvre la vue « Mon historique », **then** il voit acteur, type, horodatage et before/after pertinents (FR35, périmètre membre).
- **Given** un utilisateur sans entrée le concernant, **when** il ouvre la vue, **then** un état vide explicite s’affiche.
- **Given** un membre ordinaire, **when** il tente d’accéder à la vue admin **9.1** hors périmètre, **then** accès refusé (NFR-S2).
- **Couverture :** FR35 (lecture self-service) ; **Depends :** **9.0** ; **9.1** recommandé pour composants partagés.

---

### Epic 10 — PWA et déploiement sans friction côté client

#### Story 10.1 : Installabilité PWA (raccourci / ajouter à l’écran d’accueil)

En tant qu’utilisateur,  
je veux installer ou ajouter l’application web pour un accès rapide sur les plateformes supportées,  
afin d’ouvrir HatCast comme une app.

**Acceptance Criteria**

- **Given** un manifest et service worker conformes au périmètre produit, **when** l’utilisateur suit le flux d’installation du navigateur/plateforme, **then** le raccourci est créé et ouvre l’app (FR40).
- **Couverture :** FR40.

---

#### Story 10.2 : Détection de mise à jour client + action utilisateur (rechargement au clic)

En tant qu’utilisateur,  
je veux être **informé clairement** lorsqu’une **nouvelle version** du client est disponible après déploiement, avec un **bouton bien visible** pour appliquer la mise à jour,  
afin de **passer au nouveau comportement** sans devoir vider le cache manuellement ni subir un rechargement surprise au milieu d’une action.

**Acceptance Criteria**

- **Given** un nouveau bundle client déployé (service worker / stratégie PWA conforme à **@angular/pwa** ou à la config retenue), **when** l’app détecte automatiquement qu’une mise à jour est prête, **then** une **zone ou bannière visible** (non discrète : contraste, placement fixe ou pattern **Material** équivalent) indique qu’une mise à jour est disponible (FR41).
- **Given** cette indication affichée, **when** l’utilisateur **clique sur le bouton** dédié (libellé explicite du type « Mettre à jour » / « Charger la nouvelle version »), **then** **seulement à ce moment** la page (ou l’app PWA) **se recharge** pour activer le nouveau client — pas de rechargement forcé avant le clic, sauf règle produit exceptionnelle documentée.
- **Given** aucune nouvelle version en attente, **when** l’utilisateur utilise l’app, **then** aucune bannière de mise à jour intrusive n’apparaît.
- **And** le déploiement du client reste **aligné** avec le pipeline **couplé** front/API décrit pour NFR-R1 (voir `architecture.md`) : pas de divergence volontaire entre bundle déployé et API sur un même environnement.
- **Couverture :** FR41 ; NFR-R1 (gouvernance release) ; accessibilité : bouton utilisable clavier + libellé clair (NFR-A1).

---

### Epic 11 — Analytics workflow (opérateurs produit)

#### Story 11.1 : Événements analytics anonymisés pour indicateurs Success Criteria

En tant qu’**opérateur produit**,  
je veux que l’application enregistre des **événements analytics anonymisés** sur les jalons workflow clés,  
afin de mesurer les indicateurs avancés (délai première dispo, délai confirmations complètes, suivi des liens notification).

**Acceptance Criteria**

- **Given** l’ouverture d’une fenêtre de disponibilités pour un événement, **when** un participant soumet sa première dispo, **then** un événement permettant de calculer le délai ouverture→première soumission est enregistré (FR47).
- **Given** une composition validée, **when** toutes les confirmations requises sont obtenues, **then** un événement permettant de calculer le délai validation→confirmations complètes est enregistré (FR47).
- **Given** une notification avec URL canonique événement, **when** le destinataire suit le lien, **then** un événement de follow-through est enregistré si applicable (FR47).
- **Given** un utilisateur troupe ordinaire, **when** il tente d’accéder aux analytics, **then** l’accès est refusé (MVP : opérateurs produit uniquement).
- **And** les événements sont **anonymisés** conformément à la politique produit (NFR-S2/S3).
- **Couverture :** FR47 ; NFR-S2.

---

### Epic 12 — Parcours membre & agenda utilisateur

Les membres ont un **agenda personnel** multi-ligues et multi-troupes, un **routage post-connexion** sans écran intermédiaire, et une **navigation claire** depuis le détail événement vers la ligue et la troupe.

**FRs couverts :** FR48, FR49, FR51, **FR55**  
**Plan :** [plan-v2-league-journey.md](./plan-v2-league-journey.md) Wave 1  
**UX :** UX-DR13–15, UX-DR14

#### Story 12.1 : API agenda utilisateur

En tant que **membre**, je veux que l’API expose mes **événements à venir** agrégés par ligue participant, afin d’alimenter Mon agenda sans N appels par ligue.

**Acceptance Criteria**

- **Given** un utilisateur participant à N ligues, **when** `GET /v1/me/agenda` est appelé, **then** la réponse liste les événements à venir (UX-DR12) avec **troupeId**, **troupeName**, **leagueId**, **leagueSlug**, **leagueTitle**, statut dispo utilisateur si applicable, **`filterBarVisible`**, et **`noParticipation`**.
- **Given** un événement inter-troupes (deux events distincts), **when** l’utilisateur est participant des deux ligues, **then** **deux entrées** distinctes sont retournées.
- **Given** aucune participation ligue/événement, **when** l’API répond, **then** `content` vide, `filterBarVisible: false`, **`noParticipation: true`**. **Given** participation ACTIVE sans événement à venir, **then** `noParticipation: false`.
- **Couverture :** FR48, FR49 ; NFR-P1/P2.

#### Story 12.2 : Écran Mon agenda (`/agenda`)

**Acceptance Criteria**

- **Given** un membre connecté, **when** il ouvre `/agenda`, **then** la liste groupée par mois affiche troupe + ligue par ligne (UX-DR14).
- **Given** aucun événement, **when** l’écran s’affiche, **then** empty state actionnable.
- **Couverture :** FR48, UX-DR14.

#### Story 12.3 : Filtres troupe et ligue

**Acceptance Criteria**

- **Given** l’utilisateur participe à **plus d’une troupe** ou **plus d’une ligue**, **when** `/agenda` s’affiche, **then** la barre de filtres troupe/ligue est visible (UX-DR14, RES-001).
- **Given** **exactement une troupe** et **exactement une ligue** (participant), **when** `/agenda` s’affiche, **then** la barre de filtres est **masquée** ; les badges troupe + ligue restent sur chaque ligne.
- **Given** plusieurs troupes/ligues et filtres visibles, **when** l’utilisateur filtre, **then** seuls les événements correspondants s’affichent ; effacer filtres restaure la vue complète.
- **Couverture :** FR48, FR8, UX-DR14.

#### Story 12.4 : Bandeau contexte sur détail événement

**Acceptance Criteria**

- **Given** un détail événement, **when** l’écran s’affiche, **then** bandeau **Ligue · Troupe** avec liens **Voir la ligue** / **Voir la troupe** (UX-DR15).
- **Couverture :** FR51.

#### Story 12.5 : Finaliser routage post-connexion vers agenda

**Acceptance Criteria**

- **Given** connexion réussie, **when** aucun deep link, **then** `/agenda` ou dernière ligue visitée ; **jamais** `/accueil`.
- **Couverture :** FR49, UX-DR13. **Suite de Story 2.9.**

#### Story 12.6 : Alias route `/ligue/:slug`

**Acceptance Criteria**

- **Given** `/ligue/:slug`, **when** navigué, **then** même comportement que `/saison/:slug` (alias).
- **Couverture :** UX-DR13.

---

### Epic 13 — Modèle League (multi-active & roster)

Les administrateurs gèrent **plusieurs ligues actives** par troupe et définissent le **roster initial** à la création.

**FRs couverts :** FR11 (étendu), FR50, **FR56–FR57**  
**Plan :** Wave 2  
**ADR :** [0011](../../docs/adr/0011-league-model-and-user-agenda.md), [0012](../../docs/adr/0012-league-views-travel-leagues-member-stats.md)

#### Story 13.1 : Migration multi-active leagues

**Acceptance Criteria**

- **Given** contrainte single-active existante, **when** migration appliquée, **then** plusieurs ligues non archivées peuvent être actives par troupe (ADR 0011).

#### Story 13.2 : API activation sans désactivation globale

**Acceptance Criteria**

- **Given** ligue A active, **when** ligue B est activée, **then** A reste active.

#### Story 13.3 : Roster initial — tous membres vs manuel

**Acceptance Criteria**

- **Given** création ligue, **when** admin choisit « tous membres actifs », **then** participants ligue créés pour chaque membership ACTIVE.
- **Given** choix manuel, **when** ligue créée, **then** roster vide ; ajout unitaire (FR45).

#### Story 13.4 : UI création ligue + liste multi-active

**Acceptance Criteria**

- **Given** hub troupe ou admin, **when** admin crée une ligue, **then** modal UX-DR17 ; liste montre toutes ligues actives (UX-DR18).

#### Story 13.5 : Retest flows archivage/activation Epic 3

**Acceptance Criteria**

- **Given** suite de tests Epic 3, **when** exécutée post-13.2, **then** green ; AC single-active retirés.

#### Story 13.6 : Ligues déplacements (création et conventions) — *reportée / remplacée par Epic 17*

> **2026-05-25 (ADR 0013) :** Ne pas implémenter comme ligue dédiée. Utiliser **17.7–17.10** (tags d’équité). Story conservée pour trace ; statut **deferred**.

En tant qu’**administrateur de troupe**,  
je veux créer et gérer une **ligue déplacements** distincte des ligues spectacle,  
afin d’y planifier les bus et spectacles à l’extérieur sans type `deplacement` sur la ligue principale (FR56, UX-DR20).

**Acceptance Criteria**

- **Given** création de ligue, **when** l’admin choisit le modèle **Ligue déplacements** (ou libellé produit équivalent), **then** la ligue est créée avec les mêmes capacités qu’une ligue standard (roster FR50, événements, dispos, composition).
- **Given** une ligue spectacle, **when** l’admin crée un nouvel événement, **then** le type **`deplacement`** n’est **pas** proposé (legacy lecture seule sur données existantes).
- **Given** documentation admin, **when** affichée, **then** elle explique que les déplacements vivent dans la ligue dédiée et peuvent être filtrés sur l’agenda (FR55).
- **Given** tirage sur une ligue déplacements, **when** exécuté, **then** les règles s’appliquent **sans** branche spéciale `isDeplacement` sur template spectacle (FR57).
- **Couverture :** FR56–FR57 ; UX-DR20.

**Story file:** [13-6-ligues-deplacements-creation-conventions.md](../implementation-artifacts/13-6-ligues-deplacements-creation-conventions.md)

---

### Epic 14 — Hub troupe & découverte *(SUPERSEDED — Epic 17, 2026-06-01)*

> **Do not implement 14.x.** See mapping in Epic list § Epic 14 and SCP [sprint-change-proposal-2026-06-01-epic14-superseded-by-epic17.md](./sprint-change-proposal-2026-06-01-epic14-superseded-by-epic17.md).

Les utilisateurs accèdent au **hub troupe** (ligues, pseudo, admin) et à l’**annuaire** depuis un parcours cohérent — **livré sous Epic 17** (`/troupes`, `/troupes/:slug`, **17.5** redirects).

**FRs couverts :** FR52, FR9 (pseudo), FR32 (lien) — *via Epic **17** + **4***

#### Story 14.1 : Page hub troupe *(superseded → **17.4**, **17-29**)*

**Acceptance Criteria**

- **Given** membre d’une troupe, **when** `/troupe/:slug` ouvert, **then** UX-DR16 (identité, ligues, admin gated).

#### Story 14.2 : Ligues actives et archivées *(superseded → **17.4**)*

**Acceptance Criteria**

- **Given** ligues archivées, **when** toggle « Afficher archivées », **then** liste complète.

#### Story 14.3 : Pseudo sur hub troupe *(superseded → **17.4**, **2.5**)*

**Acceptance Criteria**

- **Given** membre, **when** édition pseudo, **then** FR9 persisté scope troupe.

#### Story 14.4 : Redirection `/seasons` *(superseded → **17.5**)*

**Acceptance Criteria**

- **Given** membre non-admin, **when** `/seasons`, **then** redirect `/agenda` ou hub troupe unique si applicable.

#### Story 14.5 : Lien annuaire public *(superseded → **17.3** ; annuaire = **Epic 4**)*

**Acceptance Criteria**

- **Given** hub troupe, **when** « Explorer d’autres troupes », **then** `/troupes` (Epic 4).

---

### Epic 16 — Profil membre & saison en un clin d'œil

Les membres accèdent à **Ma saison en un clin d'œil** via une **route dédiée**, avec filtres troupe/ligue et **transparence** pour consulter les autres participants (V1 parity).

**FRs couverts :** FR55, FR58, FR59  
**Plan :** [plan-v2-league-journey.md](./plan-v2-league-journey.md) Wave 1b  
**UX :** UX-DR8  
**Depends :** Epic 12.3 (filtres), Story 3.6 (formules stats)

#### Story 16.1 : Route `/membre/:userSlug` + filtres

En tant que **membre**,  
je veux ouvrir ma **saison en un clin d'œil** (cartes récap, grille mensuelle, rôles favoris) depuis l'espace membre et via les avatars, avec filtres optionnels,  
afin de suivre ma participation et consulter celle des autres membres autorisés (FR58–FR59).

**Acceptance Criteria**

- **Given** un utilisateur connecté, **when** il ouvre `/membre/:userSlug`, **then** l'écran affiche avatar, nom, trois cartes Disponibilités / Sélections / Désistements (% + tooltips V1), grille mensuelle *Ma saison en un clin d'œil*, rôles favoris, CTA **Planning** vers agenda filtré si supporté (UX-DR8, `PlayerModal.vue`).
- **Given** plusieurs troupes ou ligues, **when** l'écran charge, **then** filtres troupe/ligue visibles ; **masqués** si un seul contexte (FR55, RES-001).
- **Given** un autre participant visible dans la ligue, **when** un membre autorisé ouvre `/membre/{autreSlug}`, **then** le même écran s'affiche pour ce participant (FR59).
- **Given** un avatar en workspace ligue, **when** clic, **then** navigation vers `/membre/:userSlug` (query troupe/ligue optionnelle).
- **Given** agrégation stats, **when** filtres ligue appliqués, **then** compteurs cohérents avec ligues sélectionnées ; ligue déplacements incluse si sélectionnée (FR60 — cartes récap).
- **Couverture :** FR55, FR58–FR59 ; UX-DR8.

**Story file:** [_bmad-output/implementation-artifacts/16-1-route-membre-saison-clin-oeil-filtres.md](../implementation-artifacts/16-1-route-membre-saison-clin-oeil-filtres.md)

---

#### Story 16.3 : Statistiques de parité de genre (saison, rôle player) *(P2 — SCP 2026-06-05 G-011)*

En tant que **membre ou organisateur**,  
je veux voir des **statistiques agrégées de parité F/H** sur les participations **Comédien·ne** validées dans la saison,  
afin de **suivre l’équilibre** de la troupe sans identifier les individus.

**Acceptance Criteria**

1. **Given** compositions validées, **when** stats saison sont calculées, **then** l’API retourne effectifs F/M et part F sur rôle `player` (genres connus seulement).
2. **Given** affichage UI (surface PO : Statistiques ligue ou profil), **when** rendu, **then** agrégat clairement libellé ; pas de fiche individuelle par genre.
3. **Couverture :** extension FR60. **Priorité :** P2. **Depends :** **2.12**, infra stats **3.6** (done). **SCP :** [sprint-change-proposal-2026-06-05-member-gender-parity.md](sprint-change-proposal-2026-06-05-member-gender-parity.md).

---

### Epic 17 — Navigation troupe-first, tags d’équité, slugs événements

**ADR :** [0013](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)

#### Story 17.1 : Breadcrumb contexte (responsive)

En tant qu’**utilisateur connecté**,  
je veux voir **à quelle troupe et quelle saison** j’appartiens sur les écrans saison et spectacle,  
afin de naviguer sans repasser par `/seasons`.

**Acceptance Criteria**

- **Given** desktop, **when** écran saison ou spectacle, **then** fil d’Ariane : logo + nom troupe (lien hub) › titre saison › titre spectacle (feuille non cliquable).
- **Given** mobile, **when** même écrans, **then** seul le **logo troupe** est dans la barre supérieure (lien hub) ; titres saison/spectacle sous le header.
- **Given** header global (fil d’Ariane + compte), **when** any screen, **then** pas d’icône ⚙ dans cette ligne (admin via menu engrenage dans la toolbar de la vue — 17.2).
- **Couverture :** ADR 0013 §2 ; design-thinking wireframes P2–P3.

#### Story 17.2 : Menu administration par scope (icône engrenage)

En tant qu’**organisateur ou admin**,  
je veux accéder aux actions d’administration **du niveau courant** (troupe, saison, spectacle) via une **icône engrenage** et un **menu déroulant**,  
afin de ne pas confondre avec la navigation contextuelle ni consommer une ligne dédiée sous le header.

**Acceptance Criteria**

- **Given** hub `/troupes/:slug`, **when** `TROUPE_ADMIN`, **then** icône engrenage (menu) avec au moins **Membres** vers admin troupe ; pas de bandeau pleine largeur.
- **Given** `/saison/:slug`, **when** droits saison, **then** engrenage **dans la toolbar** (à droite des vues Agenda | Historique) ouvrant un menu (Participants, Organisateur·ices, …).
- **Given** détail spectacle, **when** droits événement, **then** engrenage unique sur l’onglet **Infos** (haut droite), menu fusionnant admin scope + Modifier/Archiver ; pas sur Dispos/Équipe.
- **Given** fil d’Ariane + compte, **when** écran saison ou spectacle, **then** **pas** d’engrenage dans cette ligne header (17.1).
- **Given** membre sans droit, **when** page chargée, **then** contrôle admin absent.

#### Story 17.3 : Page `/troupes` (Mes troupes + Découvrir)

En tant qu’**membre**,  
je veux lister mes troupes en **cartes** puis découvrir d’autres troupes,  
afin de ne plus utiliser `/seasons` comme hub.

**Acceptance Criteria**

- **Given** utilisateur avec adhésions, **when** `/troupes`, **then** section **Mes troupes** : cards logo, nb membres, nb spectacles à venir, CTA Ouvrir.
- **Given** même page, **when** scroll, **then** section **Découvrir** (autres troupes, même layout) — actions non-membre **OPEN** (placeholder OK).
- **Given** breadcrumb, **when** page chargée, **then** parent cohérent (`/agenda` › Troupes).
- **Given** API, **when** liste, **then** compteurs spectacles à venir par troupe (agrégation documentée).

#### Story 17.4 : Hub `/troupes/:slug`

En tant qu’**membre d’une troupe**,  
je veux une **page d’accueil troupe** (logo, saisons, admin, préférences),  
afin de centraliser la vie de la troupe hors liste des saisons globale.

**Acceptance Criteria**

- **Given** membre, **when** `/troupes/:slug`, **then** logo + nom, liste saisons actives/archivées, CTA nouvelle saison si admin.
- **Given** membre, **when** clic préférences (icône secondaire), **then** pseudo troupe + rôles préférés (FR9, AC10).
- **Given** lien depuis spectacle, **when** clic nom/logo troupe, **then** arrive sur ce hub (pas admin membres direct).
- **Route :** `/troupes/:slug` ; admin membres `/troupes/:slug/admin/membres`.

#### Story 17.5 : Redirects et fin de `/seasons` comme hub

**Acceptance Criteria**

- **Given** `/seasons`, **when** GET, **then** redirect `/troupes` (query `scope=mine` si utile).
- **Given** `/ligue/:slug`, **when** GET, **then** redirect `/saison/:slug` (et event paths).
- **Given** agenda membre, **when** lien « Mes troupes », **then** `/troupes`.
- **Given** `event-context-strip` retiré ou simplifié, **when** breadcrumb actif, **then** pas de duplication troupe·saison.

#### Story 17.11 : Fil d’Ariane sur pages admin back-office

En tant qu’**organisateur ou admin** sur les écrans **Participants** (saison ou spectacle) ou **Membres** (troupe),  
je veux le **même fil d’Ariane** que sur les écrans membre (sans chevron retour legacy),  
afin d’**aligner la navigation** avec l’Epic 17 (ADR 0013).

**Acceptance Criteria**

- **Given** `/saison/:slug/admin/participants`, **when** contexte résolu, **then** fil d’Ariane troupe › saison › Participants (feuille) ; **pas** de chevron retour agenda.
- **Given** admin participants **spectacle**, **when** chargé, **then** fil d’Ariane troupe › saison › spectacle › Participants ; **pas** de chevron retour.
- **Given** `/troupes/:slug/admin/membres` (ou alias `/troupe/...`), **when** page admin membres, **then** fil d’Ariane cohérent avec le hub troupe ; **pas** de chevron vers `/seasons`.
- **Given** mobile, **when** ces écrans, **then** règles responsive **17.1** (logo troupe dans le header).
- **Given** implémentation terminée, **when** recette, **then** **LIMIT-002** peut être clôturé. [Source: ISSUES.md]

**Story file:** [_bmad-output/implementation-artifacts/17-11-breadcrumb-pages-admin-back-office.md](../implementation-artifacts/17-11-breadcrumb-pages-admin-back-office.md)

#### Story 17.6 : Slug événement dans les URLs

**Acceptance Criteria**

- **Given** migration Flyway, **when** appliquée, **then** `events.slug` unique par `(season_id, slug)`.
- **Given** création spectacle, **when** titre saisi, **then** slug alloué côté API (déduplication `-2`, …) ; **non éditable** dans le formulaire web (17.12).
- **Given** URL UUID legacy, **when** slug existe, **then** redirect 301 vers `/saison/:slug/event/:eventSlug`.
- **Given** OpenAPI, **when** publié, **then** routes documentées.

#### Story 17.7 : API tag d’équité et glossaire troupe

**Acceptance Criteria**

- **Given** événement, **when** PATCH/POST, **then** `equity_tag` nullable, **une seule** valeur ; validation rejet multi-tags.
- **Given** troupe, **when** admin liste tags, **then** glossaire (ex. `deplacements`, `aperock`) extensible.
- **Given** tag inconnu à la saisie, **when** politique produit activée, **then** création entrée glossaire troupe (ou normalisation slug).
- **Given** champ vide, **when** lecture API, **then** équité **principale** (null).

#### Story 17.8 : UI onglet Infos — tag d’équité optionnel

> **2026-05-25 (SCP event-form UX) :** Tag saisi sur l’**onglet Infos** du détail spectacle, **pas** dans `EventFormDialog`. Voir [sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](sprint-change-proposal-2026-05-25-epic17-event-form-ux.md).  
> **2026-06-08 (UX amend.) :** libellé **Catégorie** ; help inline ; chip **Spectacle ordinaire** par défaut — spec normative à jour : [ux-design-journey-league-agenda.md](ux-design-journey-league-agenda.md) § Screen 6b (remplace CTA « Mettre dans un groupe » / « Choisir une catégorie » ci-dessous).

**Acceptance Criteria**

- **Given** onglet **Infos** et droit de gestion du spectacle, **when** affichage, **then** section **Groupe de spectacles** : chip du tag (si présent) ou CTA **« Mettre dans un groupe »** (lien primaire) → modale autocomplete + aide ; `×` sur le chip efface le tag.
- **Given** `EventFormDialog` (création ou édition), **when** ouvert, **then** **pas** de champ tag d’équité / groupe de spectacles.
- **Given** aucun tag, **when** affichage, **then** pas de mention « principal » ; un seul groupe possible par spectacle.
- **Given** tag saisi, **when** sauvegarde, **then** persisté via API 17.7 (PATCH événement).
- **Given** liste agenda saison, **when** tag présent, **then** badge discret sur la ligne (optionnel MVP).

**Story file:** [_bmad-output/implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md](../implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md)

#### Story 17.9 : Tirage et chances par tag *(durcissement → Epic 19.8)*

> **2026-06-04 (SCP Epic 19) :** **Implémentation livrée** (compartiment `category` / `SpectacleCategory` dans `CompositionSelectionHistoryService`). **19.8** = extraction en facteur pipeline + tests golden de non-régression — ne pas re-dev **17.9** en parallèle.

**Acceptance Criteria**

- **Given** tirage auto sur événement taggé, **when** calcul chances, **then** historique filtré `(season_id, equity_tag)` aligné sur le tag (null = principal).
- **Given** événement principal, **when** tirage, **then** n’inclut pas participations des seuls événements taggés autres.
- **Given** tests d’intégration, **when** scénario Malice déplacement, **then** régression couverte.

**Story file (implementation) :** voir **19.8** dans § Epic 19.

#### Story 17.10 : Statistiques — filtre par groupes de spectacles (compartiments)

> **2026-05-25 (PO + UX) :** Pas de bandeau colonnes DEPLACEMENT. Les compartiments (`equity_tag`, dont principal = null) sont un **filtre multi** sur les événements inclus dans la grille et l’export. Backfill `template_type = deplacement` → tag : **MIG-4** (phase import V1→V2), pas cette story.

**Acceptance Criteria**

- **Given** vue Statistiques (3.6), **when** affichage, **then** grille **JEU / DECORUM / BÉNÉVOLE** uniquement (pas de bandeau DEPLACEMENT / `deplacementJeu` exposé).
- **Given** filtre **Groupes de spectacles**, **when** l’utilisateur coche un ou plusieurs compartiments (**Spectacles ordinaires** + tags du glossaire troupe **17.7**), **then** seuls les événements dont `equity_tag` correspond (null = spectacles ordinaires) entrent dans l’agrégat et les colonnes mensuelles.
- **Given** option **Tous les spectacles** (défaut), **when** sélectionnée, **then** tous les compartiments sont inclus (équivalent à tout cocher).
- **Given** seul le tag `deplacements` coché, **when** stats calculées, **then** les totaux reflètent uniquement les spectacles de ce groupe (mêmes colonnes JEU/DECORUM que pour les spectacles ordinaires).
- **Given** export CSV, **when** déclenché, **then** même périmètre d’événements que le filtre groupes actif (+ filtres Membres / Spectacle existants).
- **Given** événement legacy `template_type = deplacement` sans `equity_tag`, **when** agrégation avant **MIG-4**, **then** traité comme compartiment `deplacements` pour le filtre uniquement (règle de lecture documentée).
- **Given** aucun groupe coché (hors « Tous »), **when** affichage, **then** état vide explicite invitant à sélectionner au moins un groupe.
- **Given** Story **13.6**, **when** planification, **then** reste **deferred/cancelled** (ligue déplacements remplacée par tags + filtre).
- **Hors scope :** migration DB / import prod `deplacement` → tag (**MIG-4**) ; tirage partitionné (**17.9**).
- **Couverture :** ADR 0013 §5 ; UX [ux-design-stats-equity-compartment-filter-17-10.md](ux-design-stats-equity-compartment-filter-17-10.md). Libellé UI compartiment null : **Spectacles ordinaires**.

**Story file:** [_bmad-output/implementation-artifacts/17-10-statistiques-filtre-groupes-spectacles.md](../implementation-artifacts/17-10-statistiques-filtre-groupes-spectacles.md)

#### Story 17.12 : Slug spectacle — sans saisie dans le formulaire

> **2026-05-25 (SCP event-form UX) :** Retrait du champ slug UI ; allocation auto à la création (API 17.6).

**Acceptance Criteria**

- **Given** `EventFormDialog`, **when** création ou édition, **then** **pas** de champ « Identifiant URL » éditable.
- **Given** création, **when** titre saisi, **then** slug alloué côté API (dédoublonnage `-2`, …).
- **Given** édition, **when** titre modifié, **then** slug stable (comportement 17.6).

**Story file:** [_bmad-output/implementation-artifacts/17-12-slug-spectacle-sans-saisie-formulaire.md](../implementation-artifacts/17-12-slug-spectacle-sans-saisie-formulaire.md)

#### Story 17.13 : Formulaire spectacle — date et heure Material

**Acceptance Criteria**

- **Given** `EventFormDialog`, **when** saisie de la date/heure de début, **then** datepicker Material + sélecteur heure/minute (plus `datetime-local`).
- **Given** enregistrement, **when** soumis, **then** même sémantique `startsAt` qu’aujourd’hui.

**Story file:** [_bmad-output/implementation-artifacts/17-13-formulaire-spectacle-datepicker-heure.md](../implementation-artifacts/17-13-formulaire-spectacle-datepicker-heure.md)

#### Story 17.14 : Onglet Infos — type de spectacle et rôles (modales)

**Acceptance Criteria**

- **Given** onglet Infos, **when** chargé, **then** type et résumé des rôles visibles ; CTA ouvre modale(s) de personnalisation.
- **Given** `EventFormDialog`, **when** création/édition, **then** type, confirmation changement de modèle et grille rôles **retirés** (noyau : titre, date/heure, lieu, description).

**Story file:** [_bmad-output/implementation-artifacts/17-14-onglet-infos-type-roles-modales.md](../implementation-artifacts/17-14-onglet-infos-type-roles-modales.md)

#### Story 17.15 : Onglet Infos — organisateur·ices ; retrait participants du formulaire

**Acceptance Criteria**

- **Given** onglet Infos et droits, **when** gestion organisateur·ices, **then** résumé + modale dédiée (hors `EventFormDialog`).
- **Given** `EventFormDialog` édition, **when** ouvert, **then** **pas** de sections organisateur·ices ni participants du spectacle (parcours menu admin inchangé).

**Story file:** [_bmad-output/implementation-artifacts/17-15-onglet-infos-organisateurs-retrait-participants-formulaire.md](../implementation-artifacts/17-15-onglet-infos-organisateurs-retrait-participants-formulaire.md)

#### Story 17.18 : Raccourcis croisés agenda ↔ saison (app bar)

En tant que **membre**,  
je veux accéder en **un tap** à **Mon agenda** depuis l’espace saison/spectacle et à **ma saison** depuis l’agenda,  
afin de ne plus passer par le menu compte pour ces deux destinations.

**Acceptance Criteria**

- **Given** `/saison/:slug` ou détail spectacle, **when** header membre affiché, **then** action **Mon agenda** visible (bouton texte ou icône + label) → `/agenda`.
- **Given** `/agenda`, **when** `lastVisitedSeason` valide, **then** chip ou bouton **Ma saison · {titre}** → `/saison/:slug` ; si slug absent ou invalide, **Choisir une saison** → `/troupes` (ou liste saisons selon UX).
- **Given** `/membre/:userSlug` (self), **when** écran chargé, **then** liens **Mon agenda** et **Ma saison** (même règles que ci-dessus) en surface, pas seulement menu compte.
- **Given** post-login, **when** connexion réussie, **then** **aucun changement** : remember last visit inchangé (Story 2.9 / 12.5).
- **Couverture :** [ux-hub-a-faire.md](./ux-hub-a-faire.md) phase 1 ; UX-DR13 (complément discoverability).

**Priorité :** P1 — livrable isolé.  
**Depends :** 17.1 (chrome header), 12.2 (`/agenda`).  
**Story file:** [_bmad-output/implementation-artifacts/17-18-raccourcis-croises-agenda-saison.md](../implementation-artifacts/17-18-raccourcis-croises-agenda-saison.md)

#### Story 17.19 : Hub membre `/accueil` — À faire (MVP)

En tant que **membre**,  
je veux un écran **À faire** listant mes **actions urgentes**, mon **prochain spectacle** et des **accès rapides**,  
afin de savoir quoi traiter sans parcourir tout l’agenda.

**Acceptance Criteria**

- **Given** utilisateur connecté, **when** `/accueil`, **then** écran réel (plus redirect `HomeSignedIn` vers post-login) : titre **À faire**, menu compte, sections **Actions requises** (si ≥1), **Prochain spectacle**, **Accès rapides**.
- **Given** `GET /me/agenda`, **when** chargement, **then** actions **dispo à renseigner** = événements à venir avec `myAvailabilityStatus === unknown` (fenêtre **30 jours** ; badge **Bientôt** si ≤7 jours) ; tap → détail spectacle (onglet Dispos ou flux dispo existant).
- **Given** agenda, **when** prochain événement existe, **then** carte **Prochain spectacle** (réutiliser style `agenda-card`) ; sinon empty section dédié.
- **Given** accès rapides, **when** affichés, **then** liens distincts : **Mon agenda** → `/agenda` ; **Ma saison** → `lastVisitedSeason` ou fallback ; **Saison en un clin d’œil** → `/membre/:slug` ; **Mes troupes** → `/troupes`.
- **Given** 0 action et 0 événement à venir, **when** affichage, **then** empty « Tout est à jour » + CTAs cohérents (spec hub).
- **Given** `/agenda`, **when** hub livré, **then** **pas** de duplication du bloc actions sur l’agenda (liste chronologique seule).
- **Given** post-login, **when** connexion, **then** **pas** de défaut forcé vers `/accueil` (remember last visit — 2.9 / 12.5).
- **Couverture :** [ux-hub-a-faire.md](./ux-hub-a-faire.md) ; FR15 (rappel dispo), FR48–FR49 (navigation membre, partiel).

**Priorité :** P1.  
**Depends :** 12.2, 17.18 recommandé (raccourcis déjà en place sur agenda/saison).  
**Story file:** [_bmad-output/implementation-artifacts/17-19-hub-accueil-a-faire-mvp.md](../implementation-artifacts/17-19-hub-accueil-a-faire-mvp.md)

#### Story 17.20 : Remember last visit — `lastMemberEntryPath` *(optionnel)*

En tant que **membre**,  
je veux revenir après connexion sur **le dernier écran membre** visité (agenda, accueil, saison),  
afin que le remember last visit couvre tout mon usage quotidien, pas seulement la saison.

**Acceptance Criteria**

- **Given** navigation vers `/agenda`, `/accueil`, ou `/saison/:slug` (workspace), **when** sortie de l’écran, **then** persistance `lastMemberEntryPath` (localStorage, même famille que `lastVisitedSeason`).
- **Given** post-login sans deep link, **when** `lastMemberEntryPath` valide et revalidé, **then** navigation vers cette route ; sinon fallback actuel (`lastVisitedSeason` → saison, puis `/agenda`).
- **Given** deep link en attente, **when** connexion, **then** priorité inchangée sur `lastMemberEntryPath`.
- **Couverture :** [ux-hub-a-faire.md](./ux-hub-a-faire.md) ; UX-DR13.

**Priorité :** P2 — peut attendre **17.22** si la nav bar est prioritaire.  
**Depends :** 17.19 (route `/accueil` réelle).  
**Story file:** [_bmad-output/implementation-artifacts/17-20-remember-last-member-entry-path.md](../implementation-artifacts/17-20-remember-last-member-entry-path.md)

#### Story 17.21 : API `GET /me/inbox` — confirmations et résumé hub

En tant que **membre**,  
je veux que le hub **À faire** inclue les **compositions à confirmer** sans charger chaque événement,  
afin de compléter la file d’actions (FR25).

**Acceptance Criteria**

- **Given** `GET /me/inbox` (ou nom retenu), **when** membre authentifié, **then** payload : `actions[]` (types `availability_unknown` | `composition_confirm_pending`), `nextEvent` (nullable), métadonnées raccourcis (`lastSeasonSlug`, filtres clin d’œil optionnels).
- **Given** slot assigné au viewer, compo **validée**, `participationStatus === pending`, **when** agrégation, **then** action `composition_confirm_pending` avec `deepLink` incluant `showConfirm=true` si applicable.
- **Given** hub `/accueil`, **when** chargement, **then** utilise **inbox** pour actions (remplace dérivation client-only dispo) ; agenda API reste pour carte prochain spectacle ou délégué à `nextEvent` inbox.
- **Given** OpenAPI, **when** publié, **then** fragment documenté ; tests intégration scénarios pending + unknown dispo.
- **Couverture :** FR25, FR28 (état awaiting confirmations) ; [ux-hub-a-faire.md](./ux-hub-a-faire.md) phase 3.

**Priorité :** P1 pour valeur hub complète ; **peut suivre 17.19** (MVP dispo-only d’abord).  
**Depends :** 6.7 (participation membre), 17.19.  
**Story file:** [_bmad-output/implementation-artifacts/17-21-api-me-inbox-hub-membre.md](../implementation-artifacts/17-21-api-me-inbox-hub-membre.md)

#### Story 17.22 : Shell navigation bar M3 (À faire · Agenda · Saison)

En tant que **membre**,  
je veux une **navigation bar** persistante sur les écrans membre principaux,  
afin d’alterner entre **À faire**, **Agenda** et **Saison** sans menu caché.

**Acceptance Criteria**

- **Given** mobile, **when** routes shell (`/accueil`, `/agenda`, `/saison/:slug` — pas admin, pas `/connexion`), **then** **navigation bar** M3 en bas : **À faire**, **Agenda**, **Saison** (dernière saison mémorisée ; tap long ou fallback si absente documenté).
- **Given** desktop (breakpoint documenté, ex. ≥840px), **when** mêmes routes, **then** **navigation rail** à gauche (mêmes 3 destinations).
- **Given** actions en attente sur inbox, **when** ≥1, **then** badge sur onglet **À faire** (cap affichage « 9+ »).
- **Given** tokens Material, **when** rendu, **then** styles via `--mat-sys-*` ; pas de bottom app bar M2.
- **Given** event detail ou routes admin, **when** navigation, **then** bar **masquée** ou réduite (décision documentée dans story file — défaut : masquée hors shell).
- **Couverture :** [ux-hub-a-faire.md](./ux-hub-a-faire.md) phase 4 ; [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).

**Priorité :** P2 — après hub + idéalement inbox.  
**Depends :** 17.19 ; 17.21 recommandé (badge utile) ; 17.20 optionnel.  
**Story file:** [_bmad-output/implementation-artifacts/17-22-navigation-bar-m3-membre.md](../implementation-artifacts/17-22-navigation-bar-m3-membre.md)

#### Story 17.23 : Sélecteur de contexte troupe · saison (fil + menu)

En tant qu’**organisateur ou membre actif** multi-troupes ou multi-saisons,  
je veux **changer de troupe ou de saison en un ou deux taps** depuis le workspace saison ou le détail spectacle,  
afin de **compléter le fil d’Ariane** sans repasser systématiquement par le hub troupe.

**Acceptance Criteria**

- **Given** desktop sur `/saison/:slug` ou détail spectacle, **when** au moins deux troupes ou deux saisons listables, **then** segment saison = bouton **{titre} ▾** (`mat-menu`) ; fil conserve logo + troupe (lien hub) › sélecteur › spectacle (feuille).
- **Given** menu ouvert, **when** affiché, **then** sections Troupes + Saisons (troupe courante) + liens `/troupes` et hub troupe.
- **Given** choix autre saison, **when** sélection, **then** navigation `/saison/:slug` + mémorisation `lastVisitedSeason`.
- **Given** choix autre troupe, **when** sélection, **then** dernière saison mémorisée de cette troupe si valide, sinon hub `/troupes/:slug`.
- **Given** une troupe et une saison seules, **when** header, **then** pas de sélecteur (comportement 17.1).
- **Given** mobile, **when** sélecteur requis, **then** ligne titre ▾ à côté du logo ; pas de H1 saison dupliqué.
- **Given** header contextuel, **when** rendu, **then** pas d’engrenage admin ; raccourcis 17.18 conservés.
- **Couverture :** ADR 0013 §2 (complément) ; wireframes UX 2026-05-27.

**Priorité :** P2 — après 17.18 ; utile orga multi-saisons.  
**Depends :** 17.1, 17.3, 17.4.  
**Story file:** [_bmad-output/implementation-artifacts/17-23-selecteur-contexte-troupe-saison.md](../implementation-artifacts/17-23-selecteur-contexte-troupe-saison.md)

#### Story 17.25 : Menu compte — rail footer (desktop) · avatar shell (mobile)

En tant que **membre connecté**,  
je veux accéder à **Mon compte**, **Installer l'app** et **Se déconnecter** depuis un **emplacement stable** sans encombrer les titres de page,  
afin de **libérer l’en-tête** tout en gardant le compte accessible.

**Acceptance Criteria**

- **Given** `shouldShowMemberNav(url)` et viewport **≥ 840 px**, **when** le shell s’affiche, **then** trigger **Menu compte** en **bas du rail** (avatar + nom tronqué + chevron) ; **pas** de menu compte dupliqué dans les headers de page concernés.
- **Given** mêmes routes et viewport **< 840 px**, **when** le shell s’affiche, **then** trigger **avatar seul** en haut à droite du **shell** ; headers sans doublon.
- **Given** ouverture du menu, **when** affiché, **then** entrées [`app-user-account-menu-items`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) (Mon compte, Installer l'app, Déconnexion) — comportement inchangé.
- **Given** `/compte`, **when** navigation, **then** **aucun** trigger shell/rail (déconnexion dans la page — [ux-design-mon-compte.md](./ux-design-mon-compte.md)).
- **Given** routes sans nav globale, **when** header local existait, **then** pas de régression.
- **Given** tokens Material, **when** styles, **then** `--mat-sys-*` uniquement.
- **Couverture :** [ux-hub-a-faire.md](./ux-hub-a-faire.md) § Menu compte (2026-05-28) ; complète **17.22**.

**Priorité :** P2 — après **17.22** ; compatible **17.24** (page compte).  
**Depends :** 17.22, 2.6 (avatar).  
**Story file:** [_bmad-output/implementation-artifacts/17-25-menu-compte-rail-desktop-avatar-mobile.md](../implementation-artifacts/17-25-menu-compte-rail-desktop-avatar-mobile.md)

**UX spec hub :** [ux-hub-a-faire.md](./ux-hub-a-faire.md) (décisions 2026-05-27 : route `/accueil` dédiée, post-login = remember last visit ; 2026-05-28 : menu compte rail / avatar shell).

#### Story 17.27 : Panneau de filtres unifié (icône + chips)

> **2026-05-31 (PO + UX) :** Remplace les barres de filtres inline (`mat-stroked-button` + menus) par un **trigger `filter_list`**, un **panneau** (bottom sheet mobile / dialog desktop) et une **rangée de chips** pour le feedback actif. **RES-001** inchangé ; **pas de `matBadge`** sur l’icône en MVP (phase 2 optionnelle).

En tant que **membre** multi-troupes, multi-saisons ou avec vues saison filtrables,  
je veux **une icône filtre discrète** ouvrant toutes les dimensions de filtre de l’écran, avec **des chips** sous la barre d’outils quand un filtre est actif,  
afin de **garder le filtrage accessible sans rangées permanentes de pulldowns** pour les utilisateurs mono-contexte.

**Acceptance Criteria**

- **Given** exactement **1 troupe + 1 saison** sur `/agenda` ou `/membre/:userSlug`, **when** API `filterBarVisible: false`, **then** **aucune** icône filtre, chip ni barre sticky (RES-001 inchangé).
- **Given** `filterBarVisible: true` sur agenda ou glance, **when** page chargée, **then** seul un **`mat-icon-button`** `filter_list` (pas de pulldowns inline, **pas de badge** MVP).
- **Given** filtre troupe ou saison actif (surfaces cross-troupe), **when** affichage, **then** rangée de **chips** amovibles + **Tout effacer** sous le header ; icône sans badge.
- **Given** workspace saison Agenda/Historique avec **>1** option participant ou spectacle, **when** toolbar, **then** pulldowns inline retirés ; trigger + chips ; toggles de vue et engrenage admin inchangés.
- **Given** vue Statistiques, **when** toolbar, **then** **Détails/Masquer** **hors** panneau ; filtre groupes (17.10) **dans** le panneau (checkboxes, **Tous les spectacles**) ; export CSV **Exporter** dans le menu admin saison (17.32, FR54).
- **Given** viewport **≤ 480px**, **when** tap sur l’icône, **then** **`MatBottomSheet`** titre **Filtres**, sections par dimension, footer **Réinitialiser** + **Appliquer**.
- **Given** viewport **≥ 481px**, **when** tap, **then** **`MatDialog`** même contenu ; single-select appliqué immédiatement ; multi-select catégories via footer **Appliquer** si besoin.
- **Given** tout chrome filtre, **when** styles, **then** checklist M3 (`--mat-sys-*`, `aria-label` FR, cible tactile ≥ 48 dp sur le trigger).
- **Given** catégories stats `{ kind: 'none' }`, **when** Statistiques, **then** contour d’erreur sur le trigger (`--mat-sys-error`) ; message vide stats inchangé (17.10 F9).
- **Given** changement de filtre, **when** navigation, **then** persistance inchangée (`user-agenda-filters-storage`, `member-glance-filters-storage`, état toolbar saison) — **chrome seul**, pas de changement API.
- **Hors scope :** badge numérique sur l’icône (phase 2) ; déplacer Exporter, Détails, toggles ou gear dans le panneau.
- **Couverture :** **UX-DR22** — [ux-design-unified-filter-panel.md](./ux-design-unified-filter-panel.md) (2026-05-31) ; remplace wireframes inline dans journey, historique/stats, hatcast-v2 et placement 17.10.

**Priorité :** P2 — après **12.1/12.3** (RES-001), **16.1** (glance), **17.10** (catégories stats), **17.22/17.25** (chrome header).  
**Depends :** 12.1, 12.3, 16.1, 17.10, 17.22, 17.25.  
**Story file:** [_bmad-output/implementation-artifacts/17-27-panneau-filtres-unifie.md](../implementation-artifacts/17-27-panneau-filtres-unifie.md)

**Amendment (2026-05-31):** Field feedback → **UX-DR22.1** hub + individual pickers, filter right, gear in breadcrumb. Corrective story **17.28** — [_17-28-filtres-hub-pickers.md_](../implementation-artifacts/17-28-filtres-hub-pickers.md).

---

#### Story 17.28 : Filtres hub + pickers individuels (correctif UX-DR22.1)

En tant que **membre ou organisateur** sur une saison avec de nombreux participants et spectacles,  
je veux un **hub filtre léger** ouvrant des **pickers searchable multi-sélection** par critère, avec **chips à côté du bouton filtre**,  
afin que **le filtrage scale** sans mega-dialog et retrouve **l’ergonomie V1**.

**Acceptance Criteria**

- **Given** workspace saison avec **>1** participant ou spectacle, **when** ouverture filtre, **then** **hub** avec lignes résumé uniquement (pas de listes dépliées).
- **Given** tap **Membre**, **when** picker ouvert, **then** **Filtrer les participants** : recherche + cases multi-sélection (V1).
- **Given** tap **Spectacle**, **when** picker ouvert, **then** **Filtrer les événements** : recherche + multi-sélection + toggles **Passés** / **Archivés**.
- **Given** filtres actifs, **when** toolbar, **then** chips **colonne droite** (adjacentes au trigger), pas row isolée à gauche.
- **Given** desktop saison, **when** chrome, **then** gear dans **breadcrumb row** ; filtre **à droite** des toggles de vue.
- **Given** Statistiques, **when** catégories, **then** picker **17.10** isolé depuis hub (inchangé sémantiquement).
- **Given** `/agenda` / glance multi-contexte, **when** hub, **then** Troupe + Saison en pickers **single-select** compacts.
- **Given** implémentation, **when** tests + build web, **then** OK.
- **Couverture :** **UX-DR22.1** — [ux-design-unified-filter-panel.md](./ux-design-unified-filter-panel.md) (2026-05-31).

**Priorité :** P2 — correctif post-**17.27**.  
**Depends :** 17.27, 17.10, 17.2.  
**Story file:** [_bmad-output/implementation-artifacts/17-28-filtres-hub-pickers.md](../implementation-artifacts/17-28-filtres-hub-pickers.md)

---

#### Story 17.31 : Modifier la saison — gear workspace *(FR11 gap post-17.5)*

En tant qu’**administrateur de troupe**,  
je veux **modifier la saison courante** depuis le menu engrenage du workspace `/saison/:slug`,  
afin de **éditer titre, description et dates** sans l’ancienne liste `/seasons`.

**Acceptance Criteria (résumé)**

- **Given** `canManageSeasons`, **when** workspace saison, **then** gear inclut **Modifier** → `SeasonFormDialog` edit (mêmes champs que création).
- **Given** save OK, **when** titre change le slug, **then** redirect `/saison/:newSlug` (`replaceUrl`) + snack *Saison mise à jour*.
- **Given** sans `canManageSeasons`, **then** pas d’entrée **Modifier** (organisateur·ice saison exclus).
- **Given** ordre menu, **then** **Modifier** → **Nouveau spectacle** → **Participants** → **Organisateur·ices**.
- **Couverture :** **FR11** ; amendement [ux-design-scope-admin-menu-epic17.md](./ux-design-scope-admin-menu-epic17.md) Screen 1 ; ferme gap [17-5](../implementation-artifacts/17-5-redirects-fin-seasons-hub-troupe.md).

**Priorité :** P2 — correctif discoverability admin.  
**Depends :** 3.1, 17.2, 17.28.  
**Hors scope :** archiver / supprimer saison (G-007 / hub cartes).  
**Story file:** [_17-31-modifier-saison-gear-workspace.md_](../implementation-artifacts/17-31-modifier-saison-gear-workspace.md)

---

#### Story 17.32 : Exporter statistiques — menu admin saison *(FR54 Correct Course 2026-06-01)*

En tant qu’**organisateur ou administrateur de saison**,  
je veux **Exporter** les statistiques complètes depuis le menu administration,  
afin d’obtenir le CSV sans bouton dans la toolbar membre.

**Acceptance Criteria (résumé)**

- **Given** accès menu admin saison, **when** **Exporter**, **then** CSV saison complète (`statistiques-{slug}-{date}.csv`).
- **Given** toolbar Historique ou Statistiques, **then** pas de bouton **Exporter** ; **Détails** reste sur Stats.
- **Given** export Historique, **then** supprimé.
- **Couverture :** **FR54** ; [sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md](./sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md).

**Story file:** [_17-32-season-stats-export-admin-menu.md_](../implementation-artifacts/17-32-season-stats-export-admin-menu.md)

---

#### Story 17.37 : Détail spectacle — rangée titre + statut *(UX polish 2026-06-06)*

En tant que **membre ou organisateur**,  
je veux **le titre du spectacle lisible à côté du statut de composition**, hors fil d'Ariane,  
afin de **ne pas perdre le contexte** sur mobile et desktop.

**Acceptance Criteria (résumé)**

- **Given** détail spectacle, **then** breadcrumb = troupe + saison seulement ; titre + badge au-dessus des onglets (`event-detail__context-row`).
- **Given** onglet Infos, **then** pas de champ Titre ; description sans label si renseignée.
- **Couverture :** [ux-design-event-detail-title-row-2026-06-06.md](./ux-design-event-detail-title-row-2026-06-06.md) E7–E11 ; amendement partiel chrome alignment E4–E6.

**Story file:** [_17-37-event-detail-title-row.md_](../implementation-artifacts/17-37-event-detail-title-row.md)

---

#### Story 17.41 : Nav shell — onglet Ma troupe + `lastVisitedTroupeSlug` *(UX 2026-06-10)*

En tant que **membre**,  
je veux un onglet **Ma troupe** dans la navigation globale,  
afin d’**accéder en un tap** au hub de ma troupe (dernière visitée).

**Acceptance Criteria (résumé)**

- **Given** shell membre, **when** nav affichée, **then** **4 onglets** : Accueil · **Mon agenda** · **Ma troupe** · Mes stats (icône `groups` → `/troupes/{lastVisitedTroupeSlug}` ou `/troupes`).
- **Given** visite hub troupe ou workspace saison canonique, **when** chargement OK, **then** persistance `lastVisitedTroupeSlug`.
- **Given** post-login, **then** pas de défaut forcé vers Ma troupe.
- **Couverture :** [ux-design-ma-troupe-hub.md](./ux-design-ma-troupe-hub.md) MT1–MT3 ; amendement ux-hub 4ᵉ onglet.

**Priorité :** P1 — prérequis **17.42** (dashboard hub).  
**Depends :** 17.22, 17.4.  
**Statut :** done (2026-06-12).  
**Hors scope :** contenu hub, chrome événement.  
**Story file:** [_17-41-nav-shell-ma-troupe.md_](../implementation-artifacts/17-41-nav-shell-ma-troupe.md)

---

#### Story 17.42 : Hub troupe — dashboard collectif *(UX 2026-06-10)*

En tant que **membre**,  
je veux un **hub troupe** centré sur la **saison en cours** (métriques, participants, prochains spectacles),  
afin de **voir « chez nous »** sans dupliquer Mon agenda.

**Acceptance Criteria (résumé)**

- **Given** `/troupes/:slug`, **when** chargé, **then** première section titrée `{season.title}` ; tuiles **Spectacles · Compos · Personnes** (sans CTA carte — amend. 2026-06-12) ; switcher si >1 saison active.
- **Given** sections suivantes, **then** **Personnes** (avatars wrap + **+N**) ; **Prochains spectacles** (max 3 + **Voir tous les spectacles** centré).
- **Given** ≥2 troupes, **then** lien **Voir les autres troupes** → `/troupes` ; absent en mono-troupe.
- **Given** saisons archivées, **then** lien discret **Saisons archivées (N)** sous la carte — pas de grille saisons active en page principale.
- **Couverture :** [ux-design-ma-troupe-hub.md](./ux-design-ma-troupe-hub.md) MT6–MT14.

**Priorité :** P1.  
**Depends :** 17.41 (done).  
**Hors scope :** mini-chart mois (**17.44**), chrome événement (**17.43**).  
**Story file :** [_17-42-hub-troupe-dashboard-collectif.md_](../implementation-artifacts/17-42-hub-troupe-dashboard-collectif.md)

---

#### Story 17.43 : Détail spectacle — contexte Infos + retrait breadcrumb *(UX 2026-06-10)*

En tant que **membre**,  
je veux le **titre du spectacle** en premier plan et le contexte troupe/saison dans **Infos**,  
afin de **ne pas perdre de place** au breadcrumb sur mobile.

**Acceptance Criteria (résumé)**

- **Given** détail spectacle, **then** **pas** de `app-context-breadcrumb` ; chevron **Retour** (`history.back()` + fallback `lastMemberEntryPath` / `/agenda`, incl. `/troupes/:slug`) ; titre **inline** dans le header (même ligne que chevron, ellipsis mobile) — **pas** de badge statut dans le header.
- **Given** onglet **Infos**, **then** section **Saison** (**dernier** bloc) : chips cliquables `{troupeName}` + `{seasonTitle}` → hub / workspace (centrés).
- **Given** onglet **Équipe**, **then** badge statut composition + aide **`?`** en tête du tab (ED5) — absent des autres onglets et du header.
- **Couverture :** [ux-design-ma-troupe-hub.md](./ux-design-ma-troupe-hub.md) ED1–ED5 ; amendement [ux-design-event-detail-title-row-2026-06-06.md](./ux-design-event-detail-title-row-2026-06-06.md) (2026-06-12).

**Priorité :** P1.  
**Depends :** 17.41.  
**Story file :** [_17-43-event-detail-contexte-infos.md_](../implementation-artifacts/17-43-event-detail-contexte-infos.md)

---

#### Story 17.44 : Hub troupe — mini-chart mois saison *(UX phase 2)*

En tant que **membre**,  
je veux un **aperçu visuel de l'année** dans la carte saison du hub,  
afin de **voir la densité des spectacles** comme sur Mes Stats.

**Acceptance Criteria (résumé)**

- **Given** hub troupe carte saison, **when** ≥3 spectacles passés, **then** bandeau mois par mois (grammaire `member-profile-panel`) sous les tuiles métriques.
- **Given** <3 spectacles passés, **then** tuiles chiffrées seules (comportement 17.42).
- **Couverture :** [ux-design-ma-troupe-hub.md](./ux-design-ma-troupe-hub.md) MT15.

**Priorité :** P2.  
**Depends :** 17.42.  
**Story file :** *(à créer via `bmad-create-story 17.44`)*

---

### Epic 18 — Troupe Démo & politique d’adhésion (onboarding prod V2)

**Décisions produit (2026-05-28) :** sandbox **partagée** ; admin contenu par **super-admin** ; participants fictifs obligatoires ; `join_policy` sans paywall premium ; **Démo prod** via **`db/migration` idempotent (Option A)** ; seed dev renommé **Les Improbots** (slug `les-improbots`, emails `@seed.improbots.test`) — **La Malice** réservée à la migration V1 prod réelle.

**Trois troupes (ne pas confondre) :**

| Nom | Environnement | Rôle |
|-----|---------------|------|
| **Les Improbots** | Local / CI (`db/seed`) | Fictive — dev & tests |
| **Démo** | Prod (`db/migration` bootstrap) | Onboarding public |
| **La Malice** | Staging/prod post-migration | Vraie troupe — import V1 |

**UUID réservés (implémentation) :**

| Entité | UUID |
|--------|------|
| Troupe Démo | `a0000001-0000-4000-8000-000000000099` |
| Saison Saison 2026-2027 | `b0000001-0000-4000-8000-000000000099` |

Seed dev **Les Improbots** garde UUID `…000001` (renommage label only — Story **18.0**). **La Malice** = migration V1 prod, hors seed.

#### Story 18.0 : Renommer le seed dev → Les Improbots *(chore)*

En tant que **développeur**,  
je veux que la troupe fictive locale s’appelle **Les Improbots**,  
afin de **ne pas confondre** seed dev, **Démo** prod et **La Malice** migration.

**Acceptance Criteria**

1. Troupe seed `…000001` → nom **Les Improbots**, slug **`les-improbots`** (UUID inchangé).
2. Saison principale → **Les Improbots 2026-2027** (`les-improbots-2026-2027`).
3. Emails seed → **`@seed.improbots.test`**.
4. Scripts/docs/`environment.development.ts` alignés ; plus de référence « La Malice » pour le seed dev.
5. **UI :** N/A. **Priorité :** P0, parallèle ou avant **18.1**.

#### Story 18.1 : Modèle `join_policy` et flag `is_demo` (persistance)

En tant que **développeur**,  
je veux persister **`join_policy`** et **`is_demo`** sur les troupes,  
afin de **remplacer le hack `isSeedTroupe()`** par des règles métier explicites.

**Acceptance Criteria**

1. **Given** migration Flyway, **when** appliquée, **then** colonnes `join_policy` (`OPEN` \| `INVITE_ONLY`, défaut `OPEN`) et `is_demo` (bool, défaut `false`) existent sur `troupes`.
2. **Given** une troupe existante sans valeur, **when** migration backfill, **then** `join_policy = OPEN`, `is_demo = false`.
3. **Given** création troupe via API existante, **when** `POST /v1/troupes`, **then** nouvelle troupe a `join_policy = OPEN` et `is_demo = false`.
4. **Given** DTO liste/détail troupe, **when** exposé, **then** `joinPolicy` et `isDemo` sont documentés dans OpenAPI (`seasons.yaml` ou schéma troupe dédié).
5. **Couverture :** FR62, FR64 (prérequis).

**Priorité :** P0 — bloque 18.2–18.5.  
**Depends :** Story 2.1 (table `troupes`).  
**UI :** N/A.  
**Story file:** [_bmad-output/implementation-artifacts/18-1-modele-join-policy-is-demo.md](../implementation-artifacts/18-1-modele-join-policy-is-demo.md)

---

#### Story 18.2 : Self-join OPEN + API super-admin join policy

En tant que **membre authentifié**,  
je veux **rejoindre une troupe OPEN** (dont la Démo) sans invitation,  
afin de **découvrir le produit** ; en tant que **super-admin**, je veux **modifier la join policy** d’une troupe.

**Acceptance Criteria**

1. **Given** troupe `join_policy = OPEN`, **when** `POST /v1/troupes/{id}/memberships/me`, **then** adhésion active **`MEMBER`** (création ou réactivation) — jamais `TROUPE_ADMIN`.
2. **Given** troupe `join_policy = INVITE_ONLY`, **when** même appel, **then** **403** avec message français cohérent.
3. **Given** self-join sur troupe **Démo** (`is_demo = true`), **when** succès, **then** utilisateur inscrit comme **season participant** sur la saison active seed **Saison 2026-2027** (roster ligue, pas seulement membership troupe).
4. **Given** utilisateur **platform admin** (`PlatformAdminService`), **when** `PATCH /v1/admin/troupes/{id}` (ou endpoint équivalent) avec `{ "joinPolicy": "INVITE_ONLY" }`, **then** politique mise à jour.
5. **Given** utilisateur **troupe admin** non platform admin, **when** tentative changement join policy, **then** **403**.
6. **Given** passage `OPEN` → `INVITE_ONLY`, **when** appliqué, **then** adhésions actives existantes **conservées**.
7. **Given** implémentation, **when** revue, **then** `TroupeController.joinTroupe` n’utilise plus `isSeedTroupe()` seul — autorise toute troupe `OPEN` (Démo incluse).
8. **Given** config legacy `hatcast.troupe.seed-troupe-id`, **when** documenté, **then** déprécié au profit de `is_demo` + UUID Démo en env prod (voir 18.5).
9. **Couverture :** FR61, FR62, FR63 ; remplace contrat provisoire Story 2.1.

**Priorité :** P0.  
**Depends :** 18.1.  
**UI :** N/A.

---

#### Story 18.3 : Seed production — troupe Démo, saison, ~20 spectacles, participants fictifs

En tant que **nouvel utilisateur**,  
je veux une **saison Démo déjà peuplée**,  
afin de **voir des dispos et des statuts de composition crédibles** avant de créer ma troupe.

**Acceptance Criteria**

1. **Given** script **`db/migration/`** idempotent (Option A — s’exécute aussi en prod cloud, pas `db/seed`), **when** migration, **then** troupe **Démo** (`slug: demo`, `is_demo: true`, `join_policy: OPEN`, UUID `a0000001-0000-4000-8000-000000000099`).
2. **Given** seed, **when** appliqué, **then** saison **Saison 2026-2027** (`slug: saison-2026-2027`, dates 2026-06-01 → 2027-05-31, UUID `b0000001-0000-4000-8000-000000000099`), `is_active` approprié.
3. **Given** matrice pédagogique PRD (FR64), **when** comptage events actifs, **then** **~20** événements couvrant : preparing (3–4), historique complete (2–3), draft (2), awaiting confirmations (2), gaps (1), complete upcoming (1), longform/travel (2–3), archived/inactive (1–2).
4. **Given** events, **when** seed, **then** `template_type` et `role_slots` variés (cabaret, match, longform, déplacement/travel).
5. **Given** **≥ 8 participants fictifs** (prénoms génériques, **sans email réel**), **when** seed roster saison, **then** participants `ACTIVE` avec **disponibilités pré-remplies** sur un sous-ensemble d’événements.
6. **Given** sous-ensemble d’événements, **when** seed compositions, **then** états FR28 variés (brouillon, validé/en attente, trous, complet) — **sans** verrouiller toute la saison (les joiners peuvent encore saisir leurs dispos sur events « preparing »).
7. **Given** comptes super-admin prod, **when** seed ou runbook post-deploy, **then** `patrice.lamarque@gmail.com` et optionnellement `impropick@gmail.com` ont **`TROUPE_ADMIN`** sur Démo (adhésion seed, pas via self-join).
8. **Given** analytics FR47, **when** documenté dans Dev Notes, **then** événements/métriques issus de `is_demo = true` **exclus** des KPI adoption pilote (filtre documenté).
9. **Couverture :** FR64 ; réutiliser patterns seed **Les Improbots** (ex-V6/V17) comme référence ; **ADR-0015** requis.

**Priorité :** P0 prod.  
**Depends :** 18.1, ADR-0015, Epic 3, Epic 6.  
**UI :** N/A.

---

#### Story 18.4 : UX onboarding — rejoindre la Démo, contexte, redirection

En tant que **nouvel utilisateur sans troupe**,  
je veux un parcours clair **Rejoindre la troupe de démonstration**,  
afin d’**atterrir sur l’agenda Démo** et comprendre que c’est un bac à sable.

**Acceptance Criteria**

1. **Given** `/troupes` sans adhésion, **when** clic **Rejoindre la troupe de démonstration**, **then** appel API vers UUID Démo (`environment.demoTroupeId` = `…000099`).
2. **Given** join réussi, **when** fin flux, **then** rechargement contexte troupe + redirection vers **agenda** ou **ligue Démo** (`/ligue/saison-2026-2027` ou équivalent) avec snackbar de succès.
3. **Given** contexte troupe Démo, **when** membre navigue, **then** indicateur discret **« Démo »** / copy d’aide (« bac à sable — crée ta troupe quand tu es prêt·e ») sur hub ou sélecteur contexte — **Material 3**, tokens `--mat-sys-*`.
4. **Given** `demoTroupeId` absent en env, **when** clic join, **then** message « Troupe de démonstration indisponible » (comportement actuel préservé).
5. **Given** FR49 empty agenda, **when** aucune participation, **then** guidance mentionne **rejoindre la Démo** (aligné PRD).
6. **Couverture :** FR61, FR64, FR49 ; écrans `troupes-list`, `seasons-list` si encore utilisés.

**Acceptance Criteria — Material 3 (UI)**

**M3-1 à M3-5** : conformes [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) ; pas de bottom app bar M2.

**Priorité :** P0.  
**Depends :** 18.2, 18.3.  
**Story file:** `_bmad-output/implementation-artifacts/18-4-ux-onboarding-rejoindre-demo.md` (à créer au dev).

---

#### Story 18.5 : Configuration prod, tests, séparation Démo / Improbots / La Malice

En tant que **opérateur déploiement**,  
je veux une **config prod cohérente** et des **tests de non-régression**,  
afin que **`demoTroupeId`** pointe vers **Démo** prod et jamais vers le seed dev **Les Improbots**.

**Acceptance Criteria**

1. **Given** `environment.ts` / prod secrets, **when** build prod, **then** `demoTroupeId` = UUID Démo `…000099` ; `HATCAST_SEED_TROUPE_ID` (si conservé) documenté ou retiré.
2. **Given** `.env.example` / docs deploy, **when** lus, **then** `hatcast.auth.super-admin-emails` inclut les emails opérateur ; note pour second compte admin `impropick@gmail.com`.
3. **Given** tests intégration `TroupeMembershipIntegrationTest`, **when** self-join, **then** scénarios OPEN vs INVITE_ONLY + Démo enrollment saison.
4. **Given** tests front `troupes-list.spec.ts`, **when** join demo, **then** mock UUID `…000099`.
5. **Given** dev local, **when** développeur utilise **Les Improbots** (`db/seed`), **then** distinct de **Démo** prod ; **La Malice** = migration réelle uniquement.
6. **Couverture :** FR61–FR64, NFR-R1 (smoke post-deploy : join Démo + première dispo).

**Priorité :** P0.  
**Depends :** 18.2, 18.3, 18.4.  
**UI :** N/A.

---

### Epic 15 — Rencontres liées *(post-MVP)*

**FR :** Rencontre inter-troupes optionnelle (PRD post-MVP note).

#### Story 15.1 : Entité Encounter + lien events

#### Story 15.2 : UI admin liaison rencontre

---

### Epic 2 — story addition (Wave 0)

#### Story 2.9 : Post-login et dernière ligue visitée (V1 parity)

En tant que **membre connecté**, je veux **reprendre ma dernière ligue** après connexion, afin d’éviter un écran d’accueil inutile.

**Acceptance Criteria**

- **Given** connexion, **when** slug mémorisé valide, **then** `/saison/:slug` (puis `/ligue/:slug`).
- **Given** `/accueil`, **when** accédé connecté, **then** redirect.
- **Couverture :** FR49 (partiel), UX-DR13. Finalisé en Story 12.5.

---

### Couverture UX-DR (contrôle croisé)

| UX-DR | Story(s) principale(s) |
|-------|-------------------------|
| UX-DR1 | 3.1 |
| UX-DR2, UX-DR12 | 3.3 |
| UX-DR3 | 5.1 |
| UX-DR4 | 6.1, 6.2 |
| UX-DR5 | 5.2, 5.3 |
| UX-DR6 | 6.3–6.7 |
| UX-DR7 | 6.10 |
| UX-DR8 | 16.1 (ex-2.7 popover → route) |
| UX-DR9 | 3.6 |
| UX-DR19 | 3.6b |
| UX-DR20 | 13.6 |
| UX-DR10 | 2.2, 2.3, **2.8**, 3.4, 3.5, **3.8** |
| UX-DR11 | (critères transverses NFR-A1 + Angular Material + tokens — intégrer en revue/recette par epic UI) |
| UX-DR13 | 2.9, 12.5 |
| UX-DR14 | 12.2, 12.3 |
| UX-DR15 | 12.4 |
| UX-DR16 | 17.4 *(was 14.1)* |
| UX-DR17 | 13.3, 13.4 |
| UX-DR18 | 13.4, 17.4 *(was 14.2)* |
| UX-DR20 | 13.6 |

---

### Couverture FR53–FR60 (contrôle croisé — ADR 0012)

| FR | Story(s) principale(s) |
|----|-------------------------|
| FR53 | 3.3 (switcher), 3.6, 3.6b |
| FR54 | 3.6, 3.6b |
| FR55 | 12.3, 16.1 |
| FR56–FR57 | 13.6 ; Epic 6 draw ; partition tag → **19.8** (ex-17.9) |
| FR19/FR20/FR24 (draw hardening) | **19.1–19.7** (V1 lock + pipeline) ; facteurs **19.8–19.14** ; formules & politiques **19.15–19.22** |
| FR58–FR59 | 16.1 |
| FR60 | 3.6, 13.6 |

### Couverture FR61–FR64 (contrôle croisé — Demo onboarding)

| FR | Story(s) principale(s) |
|----|-------------------------|
| FR61 | 18.2, 18.4, 18.5 |
| FR62 | 18.1, 18.2 |
| FR63 | 18.2 |
| FR64 | 18.3, 18.5 |

---

### Epic 19 — Moteur de tirage pondéré (parité V1, facteurs, formules & politiques)

**Contexte (2026-06-04) :** Epic **6** a livré le tirage MVP (**6.4**) et le snapshot des % (**6.14**). Epic **19** verrouille la parité V1, teste, factorise, puis vise un **catalogue de formules** administrables et des **politiques** troupe/saison imposant ou laissant le choix aux organisateurs.

**V1 normatif (Wave A — ne pas inventer) :**

```
malus = 1 / (1 + pastSelectionCount)
weight = malus × requiredCountForRole
selection: random ∈ [0, Σ weights) — marche cumulative
display %: exactSelectionProbability(places, candidates, index) — port V1
```

**Références code :** V1 `legacy/src/services/chancesService.js` ; replay `scripts/replay/chancesLogic.js` ; V2 `AvailabilityChanceCalculator.kt`, `CompositionDrawService.kt`.

**Waves :**

| Wave | Stories | Objectif |
|------|---------|----------|
| **A** | 19.1–19.4 | Doc + ADR + golden tests + doc orga |
| **B** | 19.5–19.7 | Pipeline facteurs ; malus historique = seul facteur actif |
| **C** | 19.8–19.14 | Facteurs optionnels (1 story = 1 critère) |
| **D** | 19.15–19.22 | Formules configurables, politiques, UI admin + orga, snapshot formule au tirage |

**Modèle produit Wave D (aperçu) :**

| Entité | Rôle |
|--------|------|
| **DrawFormula** | Recette nommée (catalogue troupe) : facteurs + paramètres ; **plusieurs** formules coexistent (ex. « V1 standard », « Match — parité genre ») |
| **DrawPolicy** | Périmètre `troupe` \| `saison` ; règle **par défaut** + **règles par `category`** (slug glossaire **17.7** ; `null` = spectacles ordinaires) ; chaque règle : `MANDATORY` (1 formule) ou `CHOICE` (≥1 formule autorisée) |
| **Résolution événement** | `GET effective draw rule(event)` : politique **saison** prime sur **troupe** ; matcher `event.category` → règle catégorie ; sinon règle défaut ; à défaut formule système V1 |
| **Tirage (onglet Équipe)** | `MANDATORY` ou `CHOICE` avec 1 seule formule → appliquée sans dialogue ; `CHOICE` avec **≥2 formules** → **sélecteur obligatoire** au moment du tirage ; serveur valide `formulaId` |
| **Snapshot** | **19.22** : formule + règle résolue (`category`, mode, scope politique) + % (**6.14**) |

**Exemple PO :** politique saison — catégorie `match` → `MANDATORY` formule « Parité genre » ; catégorie `cabaret` → `CHOICE` entre « V1 » et « Mix équipe » ; défaut troupe → `CHOICE` toutes formules publiées.

**Questions ouvertes (stakeholder — ne bloquent pas Wave A) :** clé de règle `category` vs `template_type` (**OQ-19-01**) ; politique par événement persistée (**OQ-19-02**) ; gouvernance éditeurs politique saison (**OQ-19-05**). Détail : SCP §5b. **Premier jet** — amendable via `correct-course` après atelier métier.

**SCP :** [sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md](./sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md)

---

#### Story 19.1 : Spécification normative V1 et ADR 0019

En tant que **équipe produit / dev**,  
je veux une **spécification normative** du tirage V1 et un **ADR**,  
afin que **toute évolution** (facteurs, partition tag) parte d’un contrat clair et auditable.

**Acceptance Criteria**

1. **Given** le comportement V1 observé (`chancesService.js`, `drawMultiRoles`), **when** la spec est rédigée, **then** elle couvre : formule de poids, comptage `pastSelectionCount` (validé, non archivé, non décliné, même saison, même `role_key`), tirage sans remise intra-rôle, exclusion cross-rôle, sémantique full vs partial redraw, calcul des **% affichés** (`exactSelectionProbability` + approximation documentée).
2. **Given** la spec, **when** comparée à V2 **6.4**, **then** écarts listés explicitement (ex. partition `templateType` déplacement — report **19.8** / **MIG-4**).
3. **Given** ADR **0019** (`docs/adr/0019-draw-weight-engine.md`), **when** publié, **then** décrit objectif pipeline facteurs, invariant **« % = tirage »**, stratégie de non-régression, lien **6.14** snapshots, et **esquisse Wave D** (formules + politiques — détail **19.15**).
4. **Given** DOMAIN/SPEC, **when** mis à jour, **then** renvoient vers ADR 0019 sans dupliquer la formule complète.
5. **Couverture :** FR19, FR20, FR24 ; NFR-Q1. **UI :** N/A. **Priorité :** P1. **Depends :** 6.4, 6.14.

---

#### Story 19.2 : Suite golden V1 JS ↔ Kotlin

En tant que **développeur**,  
je veux des **tests golden** comparant V1 et V2 sur poids, % et tirage,  
afin de **détecter toute dérive** lors des refactors.

**Acceptance Criteria**

1. **Given** fixtures JSON (`services/api/src/test/resources/draw/golden/`), **when** `./gradlew test`, **then** tests Kotlin valident poids et `chancePercent` vs valeurs de référence générées depuis la logique V1 (`chancesLogic.js` ou export script documenté).
2. **Given** `performWeightedDraw` avec **`Random` seedé**, **when** scénarios à candidat unique ou poids dominants, **then** sélection **déterministe** assertée.
3. **Given** cas multi-places (ex. 5 places / 8 candidats, poids égaux), **when** `exactSelectionProbability`, **then** % alignés V1 à **±1 point** (tolérance documentée dans ADR 0019).
4. **Given** CI, **when** PR touche `AvailabilityChanceCalculator` ou `CompositionDrawService`, **then** suite golden exécutée (module API).
5. **Couverture :** NFR-Q1. **UI :** N/A. **Priorité :** P1. **Depends :** 19.1.

---

#### Story 19.3 : Fixtures d’orchestration (draw complet)

En tant que **développeur**,  
je veux des scénarios de test pour **l’orchestration** du tirage multi-rôles,  
afin de verrouiller les règles **6.4** au-delà du calcul de poids isolé.

**Acceptance Criteria**

1. **Given** scénarios seedés (intégration ou tests service), **when** full redraw, **then** slots existants du rôle entièrement remplacés ; partial redraw conserve assignés et remplit indices vides.
2. **Given** un participant assigné au rôle A, **when** tirage continue sur rôle B, **then** il est **exclu** du pool B (cross-role).
3. **Given** historique validé sur d’autres événements, **when** draw + summary, **then** poids draw = % summary (même `pastSelectionCount`).
4. **Given** draw réussi, **when** snapshot **6.14** lu, **then** `chancePercent` snapshot = valeur calculée au tirage.
5. **Couverture :** FR20, FR24. **Priorité :** P1. **Depends :** 19.2.

---

#### Story 19.4 : Documentation orga / membre — comprendre les cotes

En tant qu **organisateur ou membre**,  
je veux une **explication lisible** de ce que signifient les pourcentages,  
afin de **faire confiance** au tirage sans lire le code.

**Acceptance Criteria**

1. **Given** doc produit (`docs/v2/` ou section help in-app — choix en dev notes), **when** publiée, **then** explique en français : rôle des participations passées, multi-places, différence brouillon / publié / validé pour la visibilité des % (**6.4** / **6.14**).
2. **Given** doc, **when** relue par PO, **then** **aucune promesse** sur facteurs non livrés (Wave C).
3. **Given** lien depuis UI explainability (optionnel minimal), **when** implémenté, **then** ouvre la doc ou panneau aide — sinon lien doc seul acceptable MVP story.
4. **Couverture :** FR24. **Priorité :** P1. **Depends :** 19.1.

---

#### Story 19.5 : Pipeline `DrawWeightFactor` (sans nouveau facteur)

En tant que **développeur**,  
je veux un **pipeline de facteurs** composant le poids final,  
afin d’**activer des règles** une par une sans toucher au cœur du tirage.

**Acceptance Criteria**

1. **Given** interface `DrawWeightFactor` (contexte : événement, rôle, candidat, historique), **when** pipeline exécuté, **then** `finalWeight = base × Π factorMultiplier` (ou somme log documentée dans ADR) avec **facteurs configurables**.
2. **Given** config troupe/événement par défaut, **when** aucun facteur Wave C activé, **then** comportement **identique** aux golden tests **19.2** (régression 0).
3. **Given** `performWeightedDraw` et `scoreCandidates`, **when** refactor, **then** **un seul** chemin de calcul des poids.
4. **Couverture :** NFR-Q1. **UI :** N/A. **Priorité :** P1. **Depends :** 19.3.

---

#### Story 19.6 : Facteur `PastParticipationFactor` (= V1)

En tant que **développeur**,  
je veux migrer le malus **participations passées** vers le pipeline,  
afin que le **seul facteur actif par défaut** reste strictement V1.

**Acceptance Criteria**

1. **Given** `PastParticipationFactor`, **when** activé (défaut), **then** multiplicateur = `1/(1+pastSelectionCount)` ; `requiredCount` appliqué comme aujourd’hui.
2. **Given** règles d’exclusion historique **6.4** / `CompositionSelectionHistoryService`, **when** comptage, **then** inchangé sauf extension explicite **19.8**.
3. **Given** golden suite **19.2**, **when** exécutée, **then** **100 % green** sans modification des fixtures.
4. **Couverture :** FR19, FR20. **Priorité :** P1. **Depends :** 19.5.

---

#### Story 19.7 : Breakdown explicabilité par facteur *(optionnel MVP pipeline)*

En tant qu **organisateur**,  
je veux voir **comment chaque facteur** influence les cotes *(si produit l’active)*,  
afin d’**expliquer** des écarts entre candidats.

**Acceptance Criteria**

1. **Given** pipeline actif, **when** API composition/summary expose explainability, **then** champs optionnels `factorBreakdown[]` : `{ factorId, multiplier, label }` par candidat/rôle.
2. **Given** seul `PastParticipationFactor` actif, **when** affichage, **then** breakdown cohérent avec `pastSelectionCount`.
3. **Given** les **deux portes** explainability (Dispos vs Équipe, story **5.9**), **when** un utilisateur **sans** droit sur la surface appelée, **then** pas de fuite de breakdown (**403** ou champs absents).
4. **Given** orga avec `canManageComposition`, **when** GET breakdown depuis **Équipe** ou **Dispos**, **then** accès autorisé. **Given** membre et spectacle **publié**, **when** GET breakdown / `includeChances` depuis **Dispos**, **then** autorisé **sans** composition. **Given** membre, **when** composition non publiée (slots masqués FR22), **then** pas de breakdown **Équipe**. **Given** membre, **when** composition publiée ou validée, **then** breakdown **Équipe** autorisé sur slots visibles.
5. **Couverture :** FR24. **Priorité :** P2. **Depends :** 19.6, **5.9** (gates). **UI :** panneau détail cotes (Material 3) ou extension popup Dispos — waivable si API seule.

---

#### Story 19.8 : Facteur historique partitionné par `category` *(durcissement ex-17.9)*

En tant que **développeur**,  
je veux que la **partition par compartiment** (`category`, ex-`equity_tag`) soit un **facteur explicite** du pipeline avec tests golden,  
afin de **préserver** le comportement **17.9** lors des refactors Epic 19.

**Acceptance Criteria**

1. **Given** comportement actuel `CompositionSelectionHistoryService` + `SpectacleCategory`, **when** **19.8** livré, **then** partition `(season_id, category)` **identique** (golden **19.2** / **19.3**).
2. **Given** événement principal (`category` null), **when** tirage, **then** participations sur catégories exclusives **non** comptées (AC **17.9**).
3. **Given** scénario régression Malice/déplacements, **when** tests intégration, **then** couvert.
4. **Given** facteur mappé dans le pipeline, **when** seul facteur historique + partition actifs, **then** poids = V1/V2 actuel.
5. **Couverture :** ADR 0013 §5 ; FR20. **Priorité :** P2. **Depends :** 19.6 (**17.9** done). **Ne pas** réécrire la requête SQL sans golden vert.

---

#### Story 19.9 : Facteur « rejouer immédiatement »

En tant qu **organisateur**,  
je veux **pénaliser ou interdire** de retirer quelqu’un qui vient de jouer au spectacle précédent,  
afin de **rotations** plus équitables.

**Note (SCP 2026-06-05):** même définition de « spectacle précédent » / compartiment que **6.20** (avertissement UX informatif) — réutiliser le resolver SQL ; **6.20** ne pénalise pas le tirage.

**Acceptance Criteria**

1. **Given** config troupe (seuil / ban), **when** candidat a joué l’événement chronologiquement précédent (même saison, même compartiment si **19.8**), **then** multiplicateur malus ou **exclusion** du pool.
2. **Given** facteur **off**, **when** tirage, **then** golden **19.2** inchangé.
3. **Given** SPEC/DOMAIN mis à jour **avant dev**, **when** livré, **then** règle métier approuvée PO.
4. **Priorité :** P2 backlog. **Depends :** 19.6.

---

#### Story 19.10 : Facteur nombre de demandes de rôle

En tant qu **organisateur**,  
je veux un malus si un membre a **souvent demandé** ce rôle sans être tiré (ou inverse — à cadrer SPEC),  
afin d’**équilibrer** les aspirations.

**Acceptance Criteria**

1. **Given** métrique « demandes » définie en SPEC, **when** facteur activé, **then** multiplicateur documenté appliqué.
2. **Given** facteur off, **when** tirage, **then** pas d’impact.
3. **Priorité :** P2 backlog. **Depends :** 19.6, données dispo/rôle (**5.2**).

---

#### Story 19.11 : Facteur parité de genre

En tant qu **organisateur**,  
je veux un **bonus/malus** pour tendre vers la parité de genre sur le rôle ou l’équipe,  
afin d’**équilibrer** la composition.

**Acceptance Criteria**

1. **Given** genre membre disponible (`gender` / non spécifié), **when** facteur activé avec cible PO, **then** multiplicateur appliqué sans exclure « non spécifié » sauf règle SPEC.
2. **Given** facteur off, **when** tirage, **then** V1 strict.
3. **Priorité :** P2 backlog. **Depends :** 19.6, **2.12** (genre profil membre).

---

#### Story 19.12 : Facteur mix équipe (éviter mêmes co-équipiers)

En tant qu **organisateur**,  
je veux **diversifier** les binômes/trio récurrents,  
afin de **renouveler** les dynamiques de jeu.

**Acceptance Criteria**

1. **Given** historique co-sélections sur N événements, **when** facteur activé, **then** malus si candidat partage trop de co-équipiers déjà assignés sur le spectacle courant ou récents (règle SPEC).
2. **Given** facteur off, **when** tirage, **then** V1 strict.
3. **Priorité :** P2 backlog. **Depends :** 19.6.

---

#### Story 19.13 : Facteur historique prestige (`PrestigeHistoryFactor`)

En tant qu **organisateur**,  
je veux un **malus au tirage** basé sur le **total de points de prestige** accumulés par un membre sur la saison,  
afin de **répartir** les spectacles prestigieux (2ᵉ critère d’équité, après le nb de sélections).

**Acceptance Criteria**

1. **Given** données **20.6** (`prestigePointsTotal` par participant, règles crédit PO : JEU 100 %, DECORUM 50 %, bénévole 0, événement sans étoiles → 0), **when** facteur activé dans une formule, **then** multiplicateur **malus** appliqué au poids du candidat selon son total prestige passé (même saison ; même compartiment `category` que l’historique tirage si **19.8** actif).
2. **Given** facteur **off** (défaut), **when** tirage, **then** golden **19.2** inchangé (seul `PastParticipationFactor` actif = V1).
3. **Given** implémentation, **when** spec formule rédigée dans la story, **then** courbe de malus documentée + fixtures golden (calibration PO — recherche à l’implémentation ; pas de formule figée dans Epic 20).
4. **Given** explainability (**19.7**), **when** facteur actif, **then** `factorBreakdown` inclut `PrestigeHistoryFactor` avec total prestige et multiplicateur.
5. **Couverture :** FR20 ; croissance équité. **Priorité :** P2 backlog. **Depends :** **19.6**, **20.6**. **UI :** N/A (comportement via % Dispos / tirage).

---

#### Story 19.14 : Facteur bonus/malus bénévole

En tant qu **organisateur**,  
je veux **récompenser** (ou ajuster) les membres selon leur engagement **bénévole** hors jeu,  
afin d’**inciter** l’aide logistique.

**Acceptance Criteria**

1. **Given** statistiques bénévolat définies en SPEC (rôle `volunteer`, validations, …), **when** facteur activé, **then** multiplicateur appliqué au tirage ou rôle bénévole uniquement (cadrage PO).
2. **Given** facteur off, **when** tirage, **then** V1 strict.
3. **Priorité :** P2 backlog. **Depends :** 19.6, stats **3.6** / dispos bénévole.

---

#### Story 19.15 : Spécification formules de tirage et politiques (SPEC + ADR)

En tant que **PO / architecte**,  
je veux un **modèle normatif** des formules et politiques de tirage,  
afin que **admins et orgas** sachent qui configure quoi et comment la formule effective est résolue.

**Acceptance Criteria**

1. **Given** extension SPEC/DOMAIN (approuvée PO), **when** publiée, **then** définit : `DrawFormula` (catalogue multi-formules troupe), `DrawPolicy` avec **`defaultRule`** + **`categoryRules[]`** (`category` slug \| null, `mode`, `mandatoryFormulaId?`, `allowedFormulaIds[]`), résolution **saison > troupe > système V1**, et moment du **choix opérateur** (au tirage sur l’événement, pas de politique persistée par événement en MVP).
2. **Given** ADR 0019 amendé, **when** lu, **then** décrit persistance, versioning formule, validation (facteur inconnu, formule hors liste politique, catégorie inconnue → règle défaut), et lien **`event.category`** (**17.7** / **17.8**).
3. **Given** droits, **when** documentés, **then** troupe admin = formules + politique troupe ; admin saison = politique saison ; orga spectacle = **choix formule au tirage** si règle résolue = `CHOICE` avec **≥2** formules.
4. **Given** exemple métier documenté, **when** catégorie `match`, **then** politique peut imposer formule incluant facteur parité genre (**19.11**) — sans mélanger exigence politique et implémentation facteur.
5. **Given** formule modifiée après coup, **when** tirage passé relu, **then** snapshot **19.22** reste source de vérité.
6. **Couverture :** croissance FR20/FR24. **Priorité :** P2. **Depends :** 19.1, 19.5, **17.7**. **UI :** N/A.

---

#### Story 19.16 : Persistance formules + formule système V1

En tant que **développeur**,  
je veux persister les **formules de tirage** et une **formule système par défaut**,  
afin de **materialiser** le catalogue troupe.

**Acceptance Criteria**

1. **Given** migration Flyway, **when** appliquée, **then** tables `draw_formulas` (…) et `draw_policies` (scope troupe \| saison, `default_rule` JSON, `category_rules` JSON array) ; seed formule système V1.
2. **Given** `category_rules`, **when** validé, **then** chaque entrée référence `category` du glossaire troupe (**17.7**) ou `null` ; formules référencées ∈ catalogue même troupe.
3. **Given** troupe sans politique explicite, **when** résolution, **then** formule système V1 via règle défaut implicite.
4. **Couverture :** NFR-Q1. **UI :** N/A. **Priorité :** P2. **Depends :** 19.15, 19.6, **17.7**.

---

#### Story 19.17 : API admin — CRUD formules de tirage

En tant qu **admin troupe**,  
je veux **créer, éditer, archiver** des formules dans le catalogue de ma troupe,  
afin de **proposer** des recettes de tirage aux saisons.

**Acceptance Criteria**

1. **Given** `TROUPE_ADMIN`, **when** `GET/POST/PATCH/DELETE /v1/troupes/{id}/draw-formulas`, **then** CRUD avec validation factor_config ; **403** pour non-admin.
2. **Given** formule référencée par une politique active, **when** DELETE, **then** **409** ou archivage soft-only (choix documenté OpenAPI).
3. **Given** preview optionnel `POST …/draw-formulas/{id}/preview`, **when** body événement/candidats fixture, **then** retourne poids/% sans persister tirage (facultatif MVP — waivable en **19.19** UI seule).
4. **Couverture :** NFR-S2. **Priorité :** P2. **Depends :** 19.16.

---

#### Story 19.18 : API admin — politiques de tirage (troupe / saison)

En tant qu **admin troupe ou saison**,  
je veux définir une **politique** qui impose ou restreint le choix de formule,  
afin d’**aligner** les spectacles sur la politique d’équité de la troupe.

**Acceptance Criteria**

1. **Given** politique **troupe**, **when** `PUT /v1/troupes/{id}/draw-policy`, **then** persist `{ defaultRule, categoryRules[] }` (shape **19.15**).
2. **Given** politique **saison**, **when** `PUT /v1/seasons/{id}/draw-policy`, **then** même shape ; **prime** sur troupe pour résolution événement.
3. **Given** `GET /v1/seasons/{seasonId}/events/{eventId}/draw-policy/effective`, **when** appelé par orga autorisé, **then** retourne règle résolue pour `event.category` (mode, formules autorisées ou formule imposée, libellés).
4. **Given** règle `MANDATORY`, **when** `POST …/composition/draw`, **then** serveur applique `mandatoryFormulaId` ; `formulaId` client ignoré ou doit matcher (**400** si mismatch — choix documenté).
5. **Given** règle `CHOICE` avec **≥2** formules, **when** draw sans `formulaId`, **then** **400** ; avec id hors liste, **403**.
6. **Given** règle `CHOICE` avec **exactement 1** formule, **when** draw sans `formulaId`, **then** formule unique appliquée (pas de sélecteur UI requis).
7. **Given** membre sans droit admin, **when** mutation politique, **then** **403**.
8. **Couverture :** NFR-S2. **Priorité :** P2. **Depends :** 19.17, **3.5**, **17.7**, **17.8**.

---

#### Story 19.19 : UI admin — éditeur de formules de tirage

En tant qu **admin troupe**,  
je veux une **interface** pour composer une formule (facteurs + paramètres),  
afin de **configurer** le tirage sans toucher au code.

**Acceptance Criteria**

1. **Given** route admin troupe (menu **17.2** ou hub troupe), **when** « Formules de tirage », **then** liste + création/édition Material 3 (**UX-DR11**).
2. **Given** éditeur, **when** facteurs affichés, **then** toggles + champs paramètres (seuils, coefficients) avec aide contextuelle ; facteurs non implémentés (**19.8+** backlog) **masqués** ou désactivés avec libellé « bientôt ».
3. **Given** sauvegarde, **when** config invalide, **then** erreurs inline ; succès → snackbar.
4. **Given** archivage, **when** formule utilisée par politique, **then** message blocage cohérent API **19.17**.
5. **Couverture :** UX-DR11. **Priorité :** P2. **Depends :** 19.17, **17.2** recommandé.

---

#### Story 19.20 : UI admin — politiques de tirage (troupe / saison)

En tant qu **admin troupe ou saison**,  
je veux **définir la politique** (imposée vs choix) et les formules autorisées,  
afin que **les orgas** sachent quelles règles s’appliquent.

**Acceptance Criteria**

1. **Given** écran politique troupe ou saison, **when** édition, **then** section **Règle par défaut** + tableau **Règles par catégorie** (autocomplete catégories glossaire **17.7**, mode, formule(s)).
2. **Given** ajout règle catégorie `match`, **when** mode `MANDATORY`, **then** sélecteur **une** formule (ex. « Parité genre — match ») ; aide contextuelle PO.
3. **Given** mode `CHOICE`, **when** ≥2 formules cochées, **then** copy « l’organisateur choisira au tirage » ; preview liste formules autorisées pour un spectacle exemple (optionnel).
4. **Given** admin saison, **when** écran, **then** surcharge troupe + bandeau héritage ; conflit catégorie saison **remplace** entrée troupe pour cette catégorie.
5. **Given** politique `MANDATORY` pour catégorie courante, **when** orga ouvre Équipe (sans tirage), **then** formule imposée visible en lecture seule avec libellé catégorie.
6. **Couverture :** UX-DR11. **Priorité :** P2. **Depends :** 19.18, 19.19, **17.7**.

---

#### Story 19.21 : UI orga — choix de formule au tirage (résolution par catégorie événement)

En tant qu **organisateur** avec `canManageComposition`,  
je veux **voir la politique applicable** à mon spectacle et **choisir une formule** si plusieurs sont autorisées,  
afin d’**appliquer** la bonne recette (ex. parité genre sur un **match**).

**Acceptance Criteria**

1. **Given** ouverture onglet Équipe, **when** politique effective chargée (`GET …/draw-policy/effective`), **then** bandeau : catégorie spectacle, mode, formule imposée **ou** « choix au tirage » + noms formules autorisées.
2. **Given** règle `CHOICE` avec **≥2** formules, **when** orga clique **Tirer au sort**, **then** modale sélecteur **obligatoire** (Material 3) avant confirmation ; une ligne par formule (nom + résumé facteurs).
3. **Given** règle `MANDATORY` ou `CHOICE` à 1 formule, **when** tirage, **then** **pas** de modale ; formule appliquée directement (animation **6.4**).
4. **Given** `POST …/composition/draw` avec `formulaId`, **when** serveur valide, **then** poids Dispos **Tous** recalculés avec **même formule** pour cohérence FR19 (documenté OpenAPI).
5. **Given** spectacle sans catégorie (`null`), **when** résolution, **then** règle **défaut** de la politique effective.
6. **Given** `prefers-reduced-motion`, **when** tirage, **then** comportement **6.4** inchangé.
7. **Couverture :** FR19, FR20, UX-DR6. **Priorité :** P2. **Depends :** 19.18, **6.4**, **17.8**.

---

#### Story 19.22 : Snapshot formule au tirage (audit & explainability)

En tant qu **membre ou orga**,  
je veux que le tirage **enregistre quelle formule** a produit les % snapshotés,  
afin que **l’explicabilité** reste cohérente si les politiques changent plus tard.

**Acceptance Criteria**

1. **Given** draw réussi, **when** snapshot **6.14** écrit, **then** stocke `drawFormulaId`, version/hash config, `policyScope`, `policyMode`, **`eventCategory`**, **`resolvedRuleSource`** (default \| category), `chosenByOrganizer` (bool).
2. **Given** événement passé, **when** Dispos/Équipe lit snapshot, **then** % depuis snapshot ; libellé formule + catégorie visible orga (membre post-publish si FR24).
3. **Given** full redraw, **when** snapshot remplacé, **then** métadonnées formule mises à jour (nouvelle formule si choix différent).
4. **Couverture :** FR24, FR35 (hook audit optionnel). **Priorité :** P2. **Depends :** 19.21, **6.14**.

---

### Couverture FR19–FR24 / Epic 19 (contrôle croisé)

| FR | Story(s) principale(s) |
|----|-------------------------|
| FR19 | 5.3, 6.14, **19.2**, **19.3**, **19.6**, **19.21** |
| FR20 | 6.4, **19.3**, **19.6**, **19.8+**, **19.18**, **19.21** |
| FR24 | 6.4, **19.4**, **19.7**, **19.22** |

---

### Epic 20 — Prestige des spectacles (étoiles, stats, lien tirage)

**Contexte (2026-06-05) :** Les organisateurs veulent signaler le prestige d’un spectacle (1–5 étoiles, **optionnel**), l’afficher aux membres, agréger un **score saison** par participant, puis — via **19.13** — pénaliser au tirage ceux qui ont accumulé le plus de prestige (2ᵉ critère après le nb de sélections).

**Règles métier PO (normatives — détail DOMAIN/SPEC en 20.1) :**

| Règle | Valeur |
|-------|--------|
| Périmètre | Tous spectacles, toutes catégories |
| Optionnalité | `prestigeStars` null → événement ne crédite personne |
| Moment | Slot **validé** (composition validée) |
| Crédit JEU (`player`) | `+P` (100 % des étoiles) |
| Crédit DECORUM | `+P × 0,5` |
| Bénévole | `+0` |
| Tirage | Malus sur total prestige passé → **19.13** (formule calibrée là) |

**Waves :**

| Wave | Stories | Objectif |
|------|---------|----------|
| **1** | 20.1–20.5 | Spec, API, formulaire, fiche Infos, agenda |
| **2** | 20.6–20.7 | Stats API + UI score saison |
| **3** | **19.13** | Facteur tirage (Epic 19) — after **19.6** + **20.6** |

**SCP :** [sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md](./sprint-change-proposal-2026-06-05-epic20-prestige-spectacles.md)

---

#### Story 20.1 : SPEC + DOMAIN — modèle prestige spectacle

En tant que **PO / architecte**,  
je veux un **modèle normatif** du prestige spectacle et des crédits participant,  
afin que **API, UI et tirage** partagent les mêmes règles.

**Acceptance Criteria**

1. **Given** amendement **DOMAIN.md** + **SPEC.md** (approuvé PO), **when** publié, **then** définit : `prestigeStars` (entier 1–5 \| null) sur événement ; sémantique indicatif (pas note artistique) ; règles de crédit JEU/DECORUM/BÉNÉVOLE ; agrégat `prestigePointsTotal` ; lien vers **19.13** pour malus tirage (sans formule chiffrée ici).
2. **Given** alignement stats, **when** lu, **then** réutilise taxonomie rôles **DOMAIN** (JEU / DECORUM / BÉNÉVOLE) — pas de crédit bénévole.
3. **Couverture :** extension FR12 (métadonnée événement). **Priorité :** P2. **UI :** N/A.

---

#### Story 20.2 : API — `prestigeStars` sur événement

En tant qu **organisateur**,  
je veux **enregistrer ou effacer** le prestige d’un spectacle via l’API,  
afin de **persister** le choix 1–5 étoiles ou l’absence de prestige.

**Acceptance Criteria**

1. **Given** migration Flyway, **when** appliquée, **then** colonne nullable `prestige_stars` (CHECK 1–5 ou NULL) sur `events`.
2. **Given** create/update event, **when** `prestigeStars` fourni, **then** validé (1–5) ; omission ou null → pas de prestige.
3. **Given** GET event / list events, **when** réponse, **then** champ `prestigeStars` exposé (OpenAPI mis à jour).
4. **Given** permissions existantes création/édition événement, **when** PATCH prestige, **then** mêmes garde-fous orga/admin.
5. **Couverture :** FR12. **Priorité :** P2. **Depends :** 20.1. **UI :** N/A.

---

#### Story 20.3 : UI orga — sélecteur étoiles (formulaire spectacle)

En tant qu **organisateur**,  
je veux **choisir optionnellement** le prestige (1–5 étoiles) à la création ou édition d’un spectacle,  
afin de **qualifier** un format exigeant sans obligation.

**Acceptance Criteria**

1. **Given** `EventFormDialog`, **when** orga ouvre create/edit, **then** contrôle M3 « Prestige » (étoiles 1–5 + état « Aucun » / clear) — **optionnel**, pas de valeur par défaut imposée.
2. **Given** save, **when** soumis, **then** body API inclut `prestigeStars` ou null.
3. **Given** edit, **when** événement a déjà un prestige, **then** contrôle pré-rempli.
4. **Given** brouillon (**3.21**), **when** non publié, **then** prestige éditable ; visibilité membre alignée règles publication (OQ-20-01).
5. **Couverture :** FR12, UX-DR11. **Priorité :** P2. **Depends :** 20.2, **17.13**.

---

#### Story 20.4 : UI — étoiles sur fiche événement (Infos)

En tant qu **membre ou orga**,  
je veux **voir le prestige** d’un spectacle sur sa fiche,  
afin de **repérer** un format prestigieux.

**Acceptance Criteria**

1. **Given** événement avec `prestigeStars`, **when** onglet Infos, **then** affichage étoiles (Material 3, `aria-label` explicite) à côté titre ou métadonnées date/lieu.
2. **Given** `prestigeStars` null, **when** Infos, **then** **aucun** bloc étoiles (pas de « 0 étoile »).
3. **Given** visiteur autorisé (scope événement), **when** lecture, **then** même affichage read-only.
4. **Couverture :** FR13. **Priorité :** P2. **Depends :** 20.2. **UI :** checklist M3.

---

#### Story 20.5 : UI — étoiles sur agenda et listes saison

En tant qu **membre**,  
je veux **voir les étoiles** sur l’agenda et les listes d’événements à venir,  
afin d’**anticiper** les spectacles prestigieux.

**Acceptance Criteria**

1. **Given** ligne agenda (**3.3**, **12.x**), **when** `prestigeStars` non null, **then** icônes étoiles compactes (max 5) sans casser la mise en page mobile.
2. **Given** null, **when** rendu, **then** pas d’espace réservé vide.
3. **Given** filtres agenda existants, **when** appliqués, **then** étoiles conservées sur lignes visibles.
4. **Couverture :** FR13, UX-DR12. **Priorité :** P2. **Depends :** 20.2, **3.3**.

---

#### Story 20.6 : API — points de prestige participant / saison

En tant qu **membre ou orga**,  
je veux le **total de points de prestige** accumulés par participant sur une saison,  
afin d’alimenter **stats** et le futur facteur tirage **19.13**.

**Acceptance Criteria**

1. **Given** slots validés sur événements avec `prestigeStars = P`, **when** agrégation, **then** crédit par slot selon rôle : JEU `+P`, DECORUM `+P×0.5`, bénévole `+0` ; événement sans étoiles ignoré.
2. **Given** endpoint stats saison (extension **3.6** ou dédié), **when** GET, **then** `prestigePointsTotal` par `participantId` (nombre décimal ou demi-entiers documentés).
3. **Given** même règles compartiment que tirage si applicable, **when** documenté en 20.1, **then** comportement explicite pour stats filtrées **17.10** (TBD OQ-20-02 — défaut : total saison complet).
4. **Given** tests intégration, **when** seed avec mix rôles/étoiles, **then** totaux assertés.
5. **Couverture :** stats croissance. **Priorité :** P2. **Depends :** 20.1, 20.2, **3.6**. **UI :** N/A.

---

#### Story 20.7 : UI — score prestige dans les statistiques saison

En tant qu **membre**,  
je veux **voir mon score de prestige** (et celui des autres) dans les stats saison,  
afin de **suivre** la répartition des spectacles prestigieux.

**Acceptance Criteria**

1. **Given** stats saison (**3.6** / **17.10**), **when** grille chargée, **then** colonne ou indicateur « Prestige » affichant `prestigePointsTotal` (format lisible, ex. demi-points pour decorum).
2. **Given** filtre compartiments **17.10**, **when** appliqué, **then** comportement aligné spec **20.6** / OQ-20-02.
3. **Given** participant sans crédit, **when** affichage, **then** `0` ou tiret cohérent avec autres colonnes numériques.
4. **Couverture :** FR13 stats. **Priorité :** P2. **Depends :** 20.6, **17.10**. **UI :** checklist M3.

---

### Couverture Epic 20 (contrôle croisé)

| Besoin | Story(s) |
|--------|----------|
| Modèle normatif | **20.1** |
| Persistance + API event | **20.2** |
| Saisie orga | **20.3** |
| Affichage fiche / agenda | **20.4**, **20.5** |
| Agrégat stats | **20.6**, **20.7** |
| Malus tirage | **19.13** (Epic 19, after **20.6**) |
