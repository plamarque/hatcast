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
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
  - step-e-04-complete
  - step-e-01-discovery
  - step-e-03-edit
date: '2026-05-23'
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
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-05-23.md
workflowType: prd
lastEdited: '2026-05-23'
editHistory:
  - date: '2026-05-23'
    workflow: bmad-validate-prd
    changes: 'Fix Executive Summary typo non-meimportmbers → non-members'
  - date: '2026-05-23'
    workflow: bmad-edit-prd
    changes: 'Add FR42 troupe member CSV import/export, NFR-S4 data safety, MVP admin journey, migration note (Correct Course 2026-05-23)'
  - date: '2026-05-23'
    workflow: bmad-edit-prd
    changes: 'Apply approved participation-scope correction: distinguish troupe members, season participants, event participants, optional email/user linking, and managed name-only participants'
  - date: '2026-05-23'
    workflow: bmad-edit-prd
    changes: 'Address PRD validation findings: measurable NFRs, traceability matrix, Open Product Decisions, SMART refinements for flagged FRs, brief-coverage gaps (volunteer rule, role stacking, inactive events, composition unlock, notification intents, audit granularity, preferred roles, analytics instrumentation)'
  - date: '2026-05-23'
    workflow: bmad-validate-prd
    changes: 'Simple fixes from validation: tighten FR4 remember-me duration, FR22 draft visibility default, FR28 lifecycle states, FR29 MVP global push opt-in only'
  - date: '2026-05-23'
    workflow: bmad-validate-prd
    changes: 'Second simple-fix pass: remove conditional FR wording in FR1, FR6–FR7, FR15–FR17, FR21, FR23, FR26, FR35, FR40, FR42'
  - date: '2026-05-23'
    workflow: bmad-validate-prd
    changes: 'Third simple-fix pass: align FR18 proxy scope, FR22–FR25 confirmation/publish chain, FR31 notification intents/channels, MVP scoping admin wording'
  - date: '2026-05-23'
    workflow: bmad-validate-prd
    changes: 'Fourth simple-fix pass: tighten FR10 avatar rules, FR32–FR33 public discovery predicates, FR38–FR39 growth scope, FR47 analytics access'
  - date: '2026-05-24'
    workflow: bmad-edit-prd
    changes: 'League model (FR48–FR52, ADR 0011): user agenda, post-login routing, multi-active leagues, troupe hub; traceability matrix and MVP scope aligned'
  - date: '2026-05-24'
    workflow: bmad-edit-prd
    changes: 'League workspace split (FR53–FR60, ADR 0012): Agenda/Historique/Statistiques, travel leagues for déplacements, personal season glance route, separate exports, cross-scope filters'
  - date: '2026-05-28'
    workflow: bmad-edit-prd
    changes: 'Demo troupe onboarding (FR61–FR64): shared sandbox, join_policy OPEN|INVITE_ONLY, platform-admin join-policy control, production seed spec with pedagogical event matrix; Journey 8; MVP prod scope'
lastEdited: '2026-05-28'
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

HatCast is a **mobile-first web application** (Angular SPA, PWA) delivered as **SaaS** for **improvisation troupes**: it supports **leagues** (*ligues*; V2 API: seasons) and **shows (spectacles)**, collects **availability by role**, lets organizers **compose lineups** manually or via a **weighted random draw**, runs a **validation and confirmation** workflow, and uses **notifications** with tracking of **confirmations and withdrawals**. The product targets **troupe members**, **league/event participants**, **organizers**, and **administrators**; a **public directory** lists freemium troupes (non-opt-out) so non-members can discover leagues and events—read scope for private content remains a future premium hypothesis.

**Member entry (V2 target):** Signed-in members land on a **personal user agenda** (all upcoming events across leagues where they participate) or resume a **last visited league workspace**—not an intermediate home screen. A troupe may run **several active leagues** at once (e.g. leisure vs show circuit). **Inter-troupe matches** appear as **separate events** in the agenda, each labelled by troupe and league (ADR 0011).

**Onboarding (V2 prod):** New users with **no troupe membership** can **self-join a shared Demo troupe** (*Démo*) seeded in production—a realistic sandbox with fictitious participants, varied event types, and composition lifecycle states—before creating their own troupe. Demo join is **product onboarding**, not a dev-only seed hack (FR61–FR64).

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

- **Members and participants** can state availability and role intent for upcoming shows **without** repeated back-and-forth outside the app; when a participant is not linked to a HatCast user, an authorized organizer/admin can manage their availability and participation status with actor/subject clarity.
- **Organizers** can move a show through **availability → composition → validation → confirmations** with clear **state** (“preparing”, gaps, declined slots) and can **recover** from withdrawals without rebuilding the entire plan from scratch.
- **Administrators** can configure seasons/events/roles, manage troupe members separately from season/event participants, and **audit** “acted for another subject” actions with **actor vs subject** clarity.
- **Visitors** can **discover** freemium troupes via the directory and browse **public** seasons/events as defined by the freemium rules (private/premium remains out of initial V1 scope per brief).

### Business Success

- **Adoption:** New troupes can onboard and run at least **one season** with **core flows** (events, availability, composition path) in production; freemium listing remains **non-opt-out** for listed troupes as a deliberate growth/trust trade (hypothesis to validate in interviews). **Leading onboarding metric:** a signed-in user with zero memberships can reach **first availability submission on a Demo event** within **one session** after choosing “Rejoindre la troupe de démonstration” (FR61, FR64).
- **Engagement:** Organizers return across multiple shows per season (repeat use of composition, notifications, gap-filling workflows). **Initial pilot target:** at least **70%** of pilot troupe organizers run **≥2 composition cycles** per active season within **90 days** of troupe onboarding; measured via FR47 workflow analytics and validated or revised after the first pilot cohort.
- **Monetization (post-V1):** Premium hypotheses (private seasons/events, advanced lottery, guests, etc.) remain **explicitly not V1**; success first is **proving core value** and directory transparency, not immediate ARPU.

### Technical Success

- **Reliability (target stack):** Core domain operations are enforced by the **API and PostgreSQL-backed** model with **development / staging / production** parity (Neon branches per environment); coupled **GitHub Actions** releases reduce client/API drift.
- **Deliverability:** Email and **web push** paths meet “good enough” operational standards (failures observable; no silent mass loss of user-visible actions).
- **Client quality:** **PWA** installability and **post-deploy self-update**; **mobile-first** layouts; critical routes covered by automated tests per **NFR-Q1** without disabling tests to ship.
- **Legacy note:** Until migration completes, production may still reflect `ARCH.md` (Firebase); success criteria above describe the **intended end state** on Kotlin/Spring Boot + Neon.

### Measurable Outcomes

- **Leading:** Time-to-first-availability submission or admin-managed availability entry after participant creation/invite (measured via **FR47**); time from “composition validated” to “all required confirmations received” (measured via **FR47**); notification click-through to canonical event URLs when links are standardized per SPEC slices (measured via **FR47**).
- **Lagging:** Reduction in organizer-reported “manual rework” after withdrawals (qualitative survey, **≤15-minute** structured interview per pilot organizer at season end); troupe retention across seasons measured as **≥60%** of pilot troupes starting a second season within **12 months** (baseline to be recalibrated after first measurement window).

## Product Scope

### MVP - Minimum Viable Product

Must preserve and stabilize what **SPEC** marks as **Must have** today: seasons/events/players; availability; weighted draw; casts and confirmation/decline; auth flows; admin boundaries; audit hooks; responsive UI + PWA baseline; multi-select participant/event selectors where specified.

**PRD-oriented MVP for evolution:** Canonical **event URL** and **event-details** behaviour where already sliced in **PLAN/SPEC** (full-screen event, tabs, inline composition) is treated as **product delivery scope** when those slices are scheduled—not as speculative fluff. MVP administration includes the core participation-scope model: troupe members are distinct from season participants and event-only participants; season/event participants can be name-only, optionally email-prelinked, or linked to a HatCast user.

**V2 production launch (onboarding):** A **Demo troupe** (*Démo*, slug `demo`) with season **Saison 2026-2027** (2026-06-01 → 2027-05-31), **~20 pedagogical events**, fictitious season participants, and varied composition states is **seeded in production** and joinable by any authenticated user (FR61, FR64). **Join policy** (`OPEN` | `INVITE_ONLY`) is modeled at troupe level from MVP; **platform administrators** may change join policy; troupe admins may not (FR62–FR63). Premium paywall for closed troupes is **explicitly deferred**—`INVITE_ONLY` is a data model and permission hook only until packaging is defined.

### Growth Features (Post-MVP)

- Deeper **fairness analytics** and season history views described in the brief (stats, “demand satisfaction”, expanded UX for lottery pedagogy).
- **Premium** packaging experiments (private content, advanced guest invitation/self-service flows, advanced lottery modes) **after** core adoption signals—aligned with brief’s “validate via interviews / in-app tests.”

### Vision (Future)

- **Premium tier** with validated paywalls; richer **guest** flows beyond admin-managed participants; optional **multi-tenant** org features beyond current troupe model—only where validated against user research and business goals.

## Open Product Decisions

The following items remain explicitly open; downstream architecture, UX, and epic planning must not assume a default without product sign-off.

| Decision | Options / notes | Default for planning |
| --- | --- | --- |
| **Visitor MVP surface during cutover** | Full public directory + public season/event pages vs reduced read-only troupe landing during early pilot | Full freemium discovery unless a pilot troupe opts into reduced visibility |
| **REST URL versioning** | Path prefix (e.g. `/v1`) vs header-based vs unversioned with coupled releases | Path prefix `/v1` documented in OpenAPI; breaking changes require version bump |
| **Accessibility conformance target** | WCAG 2.1 Level A vs AA vs AA with documented exceptions | **WCAG 2.1 Level AA** for core member and organizer flows; exceptions logged in UX/accessibility checklist |
| **Fairness explainability MVP depth** | Odds only vs odds + narrative “why this outcome” vs full season history | Per-role odds on composition view for draw-mode events (FR24); richer history in growth |
| **Analytics baseline & privacy** | Product-only vs troupe-visible dashboards; retention of raw events | Anonymized workflow events per FR47; troupe-visible analytics deferred to growth |
| **Team capacity (program)** | Squad size and skill mix for V2 rewrite | Assumption: **2–4** engineers (full-stack or paired front/back) plus part-time design/PM until validated |
| **Demo troupe for V2 prod onboarding** | Shared sandbox vs per-user clone; dev seed vs dedicated Demo | **Shared Demo troupe** in prod via **`db/migration` Option A** (**decided 2026-05-28**) |
| **Dev seed troupe naming** | La Malice vs fictional name | **Les Improbots** (`les-improbots`, `@seed.improbots.test`) — **La Malice** reserved for real V1 migration (**decided 2026-05-28**) |
| **Join policy default for user-created troupes** | All new troupes `OPEN` vs `INVITE_ONLY` until premium | **`OPEN` by default**; premium packaging for closed troupes deferred (**decided 2026-05-28**) |
| **Who may change join policy** | Troupe admin vs platform admin only | **Platform administrator only** in MVP (**decided 2026-05-28**) |

## User Journeys

### 1) Léa — Troupe member (happy path)

**Opening:** Léa joue dans une troupe avec une saison chargée. Avant HatCast, elle oubliait les dates et négociait ses rôles dans cinq fils de messages.

**Rising action:** Elle installe la PWA, se connecte (Google ou email), et arrive sur **son agenda personnel** (tous spectacles à venir des ligues où elle participe) ou reprend sa **dernière ligue** visitée (FR48, FR49). Elle filtre par troupe si besoin (FR8). Elle règle son **pseudo** visible dans chaque troupe et son **avatar** si besoin (FR9, FR10, FR36). Elle ouvre un événement depuis l’agenda, renseigne **dispo / indispo** et coche les **rôles** — ses **rôles préférés** sont pré-cochés (FR46). Après le tirage, elle consulte la **composition** depuis le détail événement (FR24).

**Climax:** Elle **confirme** sa participation depuis le flux prévu (lien / onglet Équipe) sans relance manuelle interminable.

**Resolution:** Moins de friction cognitive ; la troupe avance vers “équipe confirmée” avec un fil d’état clair. **Requirements surfaced:** auth (FR1–FR5, FR36), **user agenda and entry routing** (FR48, FR49), multi-troupe context (FR8), pseudo and avatar (FR9, FR10), preferred roles (FR46), notifications + deep links to event, availability by role, composition and confirmation.

### 2) Marc — Organizer (composition, gap after withdrawal)

**Opening:** Marc prépare un match dans deux semaines. Un participant confirmé **se désiste** après validation initiale.

**Rising action:** Il voit l’état **À compléter / trous** (ou équivalent métier), identifie le slot libre, **remplit** manuellement ou lance un **tirage partiel** selon les règles du spectacle. Il renvoie une **notification** ciblée pour débloquer les confirmations restantes.

**Climax:** Il ne repart pas d’un tableur vierge : la **composition reste l’objet central**, l’historique et les statuts l’aident à décider vite.

**Resolution:** La soirée peut rester viable sans recomposer toute la saison depuis zéro. **Requirements surfaced:** statuts de composition, désistements, remplissage de slots, loterie partielle, canaux de notification cohérents avec URLs d’événement.

### 3) Amira — Season / troupe admin (configuration + audit)

**Opening:** Amira gère la structure de la troupe et de ses **ligues** : types de spectacles, rôles requis, organisateurs par spectacle.

**Rising action:** Depuis le **hub troupe**, elle voit **plusieurs ligues actives** (ex. loisir + compétition), en crée une nouvelle en choisissant **tous les membres actifs** ou un **roster vide** à compléter (FR50). Elle crée/édite des **spectacles** dans une ligue, assigne des **permissions** (ligue / spectacle), **importe ou exporte la liste des membres de troupe** (CSV documenté) pour migrer depuis HatCast V1, initialiser une nouvelle troupe, ou déplacer des membres entre troupes. Elle ajoute aussi des **participants de ligue ou d'événement** qui ne sont pas forcément membres de la troupe : nom simple, email optionnel, ou lien vers un compte HatCast existant/futur. Lorsqu'une organisatrice **modifie la dispo** d'un participant, Amira consulte la **piste d'audit** (acteur vs sujet, horodatage).

**Climax:** Elle peut expliquer à la troupe *qui* a fait *quoi*, sans ambiguïté.

**Resolution:** Gouvernance acceptable pour une communauté bénévole. **Requirements surfaced:** hub troupe et ligues multiples (FR52, FR50), admin UI, rôles et granularité, import/export membres CSV (migration V1→V2 et réutilisation inter-troupes), participants ligue/événement distincts des membres de troupe, audit consultable, cohérence avec le modèle de permissions V2.

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

### 6) Camille — Organizer, missing DJ, adding an event participant

**Opening:** Camille verrouille presque la compo d’un spectacle alors qu’il **manque un DJ** : personne dans la troupe n’est dispo ou qualifié pour ce créneau.

**Rising action:** Elle ajoute un **participant d'événement** non membre de la troupe : un nom suffit, l'email est optionnel. Si l'email correspond à un compte HatCast existant, le participant peut être lié ; sinon il reste administré par les organisateurs jusqu'à une éventuelle première connexion. Les parcours d'invitation self-service et les règles avancées restent des extensions de croissance.

**Climax:** Camille peut gérer la dispo/confirmation du DJ si la personne n'a pas encore de compte, ou laisser le DJ répondre directement si le participant est lié à un utilisateur. Elle **assigne** le slot sans casser le cycle de validation du spectacle.

**Resolution:** La soirée peut combler un rôle critique sans élargir toute la gouvernance de la troupe à un inconnu. **Requirements surfaced:** participant événement, nom simple, email optionnel, liaison utilisateur optionnelle, traçabilité, accès borné au spectacle.

### 7) Alex — Managed participant / guest (availability without default lottery)

**Opening:** Alex n’appartient pas à la troupe mais est sollicité·e pour une saison ou un spectacle précis (ex. DJ ponctuel, renfort scène).

**Rising action:** Alex peut d'abord exister comme **participant géré** (nom, email optionnel) afin que les administrateurs l'incluent dans l'équipe. Si un parcours self-service est activé plus tard, Alex reçoit une invitation à **déposer des dispos** sur **un ou plusieurs** événements. Les règles peuvent alors différer des membres : **hors pool de tirage par défaut**, **joker / dernier recours**, ou **choix explicite** par l’organisateur.

**Climax:** L’organisateur voit clairement **comment** ce profil peut être retenu (mécanique transparente), et Alex sait **jusqu’où** son engagement va (quel spectacle, quel rôle, quelles attentes de confirmation).

**Resolution:** Flexibilité pour les **contributions ponctuelles** sans diluer la logique “membre” ni créer de zone grise sur le **fairness** perçu. **Requirements surfaced:** participants saison/événement administrés en MVP ; modèle de **sélection invité** avancé (exclusion loterie / joker / assignation directe), préférences et contraintes par événement, notifications et audit adaptés en croissance.

### 8) Sam — New user (try before you commit via Demo troupe)

**Opening:** Sam découvre HatCast via un ami ou une recherche. Il hésite à créer une troupe sans savoir si l’outil lui convient.

**Rising action:** Il crée un compte, ouvre **Mes troupes**, voit l’état vide, et clique **Rejoindre la troupe de démonstration**. Il est adhérent **membre** (pas admin) de la troupe **Démo**, inscrit automatiquement à la ligue **Saison 2026-2027**, et voit un agenda déjà peuplé de **participants fictifs** avec dispos variées. Il ouvre un spectacle à venir, saisit **dispo / indispo** et ses **rôles**, consulte un autre événement en état **validations en attente** ou **équipe complète** pour comprendre le cycle de vie.

**Climax:** Sam comprend le produit **en contexte réaliste** sans attendre une invitation ni fabriquer une saison vide.

**Resolution:** Il crée sa propre troupe quand il est prêt, ou reste dans la Démo pour continuer à explorer. **Requirements surfaced:** FR61 (self-join OPEN), FR64 (seed Demo), FR49 (empty guidance), FR15–FR16 (availability), FR28 (lifecycle visibility), FR6/FR8 (membership context). **Out of scope for Sam:** premium closed troupes, public directory browse without account (Journey 4).

### Journey Requirements Summary

- **Collaboration:** disponibilités, composition brouillon vs validée, confirmations/désistements, notifications.
- **Fairness UX:** pondération, transparence des chances, tirage complet ou partiel pour les participants éligibles ; règles distinctes lorsque les non-membres ne participent pas au tirage standard.
- **Core participation model:** troupe members, season participants, and event participants remain distinct; participants can be name-only, email-prelinked, or linked to a HatCast user.
- **Growth guest flows:** invitation ciblée par rôle et par spectacle ; dispos self-service sur un sous-ensemble d’événements ; modes de **sélection** configurables (hors tirage, joker, choix direct).
- **Governance:** rôles admin/organisateur, audit acteur/sujet, frontière claire membre / participant / invité avancé.
- **Growth:** stats de saison / “demand satisfaction” (brief), au-delà du MVP fonctionnel listé dans le scope.
- **Public discovery:** annuaire + lecture publique freemium (hypothèses premium pour contenu privé plus tard).
- **Onboarding sandbox:** shared Demo troupe, self-join, fictitious roster, pedagogical event matrix (FR61, FR64).

### Account lifecycle (cross-cutting)

**Opening:** Un utilisateur souhaite quitter HatCast ou mettre à jour ses identifiants après une migration de troupe.

**Rising action:** Il met à jour email/mot de passe ou avatar depuis les paramètres compte (FR36). S'il quitte définitivement le produit, il lance une **suppression de compte** avec confirmation explicite (FR37).

**Resolution:** Données personnelles traitées selon la politique de rétention ; sessions révoquées ; traces d'audit troupe préservées avec identifiants anonymisés si requis. **Requirements surfaced:** FR36, FR37, NFR-S3.

## Requirement Traceability

Mini matrix linking primary journeys to functional and non-functional requirements. Growth-only behaviours are marked **(G)**.

| Journey | Primary FRs | Supporting NFRs |
| --- | --- | --- |
| **1 — Léa (member)** | FR1–FR5, FR8–FR10, FR13, FR15–FR16, FR24–FR25, FR29, FR40–FR41, FR46, **FR48–FR49, FR51, FR55, FR58–FR59** | NFR-P1, NFR-A1, NFR-S2 |
| **2 — Marc (organizer)** | FR19–FR23, FR25–FR28, FR31, FR34 | NFR-P1, NFR-R2 |
| **3 — Amira (admin)** | FR6–FR7, FR11–FR14, FR34–FR35, FR42–FR45, **FR50, FR52** | NFR-S4, NFR-S5 |
| **4 — Julien (visitor)** | FR32–FR33, **FR52** (discovery link from troupe hub) | NFR-P1, NFR-P2 |
| **5 — Edge (fairness)** | FR20, FR24 **(G:** season history analytics) | NFR-A1 |
| **6 — Camille (event participant)** | FR43–FR45, FR17, FR19, FR21, FR26 | NFR-S5 |
| **7 — Alex (managed guest)** | FR43–FR45, FR38–FR39 **(G)** | NFR-S5 |
| **Account lifecycle** | FR36–FR37 | NFR-S3 |
| **8 — Sam (Demo onboarding)** | FR61, FR64, FR49, FR15–FR16, FR28, FR6, FR8 | NFR-S2 |
| **Success / instrumentation** | FR47 | NFR-Q1 |
| **Platform delivery** | FR40–FR41 | NFR-R1 |
| **Platform governance (join policy)** | FR62–FR63 | NFR-S2 |

**Traceability notes:** FR47 supports Business Success engagement metrics and Measurable Outcomes leading indicators. NFR-Q1 supports Technical Success automated-test expectation. Journey 5 growth analytics remain intentionally under-specified until post-MVP epic planning. **FR48–FR52** (League journey, ADR 0011) trace primarily to Journeys 1 and 3; FR51 also supports organizer navigation from events. **FR53–FR60** (league views, travel leagues, personal glance, ADR 0012) trace to Journeys 1 and 3 and league workspace UX. Troupe join requests beyond directory browse remain **Epic 4** (FR32), not a separate FR. **FR61–FR64** (Demo troupe, join policy) trace to Journey 8 and V2 prod onboarding; premium packaging for `INVITE_ONLY` troupes remains growth scope.

## Innovation & Novel Patterns

### Detected Innovation Areas

- **Explainable fairness UX:** Surfacing draw odds and “why this outcome” narratives for volunteer troupes—positioning transparency as a first-class collaboration feature, not an afterthought.
- **Lifecycle-native composition:** Treating show state (draft vs validated cast, gaps, withdrawals, partial redraws) as a coherent model rather than ad-hoc spreadsheet edits.
- **Scoped participation without forced account creation:** Season/event participants can exist as managed names, optional email-prelinked records, or linked users—reducing friction without collapsing troupe membership, participant identity, and organizer permissions.

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
- **Scope creep on guests:** Keep the core managed-participant model in MVP; gate advanced invitations, self-service onboarding, and alternate guest selection modes behind clear growth/premium decisions.
- **Over-building pedagogy:** Ship minimum explainability that is truthful; expand visualization in growth iterations.

## Web Application Specific Requirements

### Project-Type Overview

The product is an **Angular 21** SPA using **Angular Material** as the primary UI layer (**avoid Tailwind as the main styling approach**; utilities may exist but must not drive layout/visual design). The backend is implemented in **Kotlin** on **Spring Boot** (Spring ecosystem; use the **latest stable** Spring Boot release line at implementation time), exposes a **RESTful HTTP API**, and persists to **PostgreSQL** hosted on **Neon**. **Firebase Hosting is not part of the target architecture.**

### Technical Architecture Considerations

- **Frontend:** Angular SPA consuming **only** the public **REST API**; **Angular Material** for responsive, consistent components.
- **Backend:** **Spring Boot** (Kotlin) services packaged as **Docker** images deployed to **Google Cloud Run**.
- **Database:** **PostgreSQL** on **Neon** (managed Postgres). Connection from Cloud Run uses **per-environment** Neon branch connection strings; credentials live in **GitHub Environments secrets** (and optionally GCP Secret Manager), not in the repository—see repository ADR-0009 and `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`.
- **Frontend hosting:** Static SPA may be served from **GitHub Pages** or bundled with the API in a **single Cloud Run** container (documented option A: Nginx + Angular + Spring); SPA deep-link routing must be supported in either case.
- **API contract:** Publish **OpenAPI** (or equivalent) as the integration source of truth; URL versioning follows the decision in **Open Product Decisions** (default: path prefix `/v1`).

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

- Target **WCAG 2.1 Level AA** for core member and organizer tasks; documented exceptions allowed for non-critical admin-only surfaces until remediated.

### Implementation Considerations

- **CORS:** The SPA origin(s) for each environment (e.g. Cloud Run URL when the SPA is served from the same service, or GitHub Pages URL) must be allowed to call the API; build-time configuration of API base URL per environment.
- **Secrets:** GitHub Actions authenticates to GCP for deploy; runtime secrets in GCP (Secret Manager or equivalent).
- **Migration from V1:** `ARCH.md` describes **Firebase**; this section describes the **target** stack. Migration (data, auth cutover, replacing FCM-based flows with Web Push) is a **program**, not a single PRD bullet. **Troupe member onboarding** for cutover includes a **documented CSV import/export** path (FR42) so administrators can migrate member lists from HatCast V1 and reuse the capability for troupe-to-troupe moves or rapid troupe initialization.

### REST API Expectations (product-level)

- Resource-oriented REST; consistent error payloads; **idempotency** for sensitive writes (invites, confirmations) where appropriate.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** **Platform + problem-solving MVP** on the **target stack**: prove that a **Kotlin / Spring Boot + PostgreSQL (Neon) + REST** backend and an **Angular 21 + Angular Material** frontend can support the **core troupe loop** (availability → composition → validation → confirmations) with **development / staging / production** parity (Neon branches), **coupled CI/CD**, and **non-negotiable UX baselines** (auth simplicity, push, PWA self-update). Include basic managed season/event participants because real teams include non-members; defer deep self-service guest/premium mechanics until core adoption is validated.

**Resource Requirements:** Team skills spanning **Angular/TypeScript**, **Kotlin + Spring Boot**, **PostgreSQL (Neon)**, **GCP Cloud Run**, **GitHub Actions**—see **Open Product Decisions** for capacity assumption (2–4 engineers until validated).

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Troupe **member**: sign in (Google or email/password, reset, long session); land on **user agenda** or last league workspace (FR48–FR49); set availability, view composition and odds where the product surfaces them, confirm or decline participation, receive **web push** (opt-in); filter agenda by troupe/league when in multiple contexts.
- League/event **participant**: appear in availability and composition workflows at the granted scope; if linked to a user, interact directly; if name-only or not yet linked, be managed by authorized admins/organizers.
- **Organizer**: compose and validate lineups, handle gaps and withdrawals using manual or partial draw paths as scoped for MVP; navigate from event to league or troupe context (FR51).
- **Admin**: administer **multiple active leagues** per troupe, events, troupe members, and league/event participant rosters from **troupe hub** and league workspaces (FR50, FR52); **export and import troupe member lists** (documented CSV) as **troupe administrator** (FR42); consult **audit** trails for sensitive actions per FR35.
- **Visitor** (as scoped for MVP): **public discovery** of troupes and public seasons/events per freemium rules—or a **deliberately reduced** surface if the program stages cutover (**delivery decision**).
- **New member (no troupe yet):** self-join the **production Demo troupe**, explore a pre-populated season, submit availability on demo events (Journey 8; FR61, FR64).

**Must-Have Capabilities:**

- **REST API** with a published contract baseline; **PostgreSQL on Neon**; **Spring Boot** backend on **Cloud Run**; frontend as static assets (**GitHub Pages** and/or **same-origin** in the Cloud Run image per deployment choice); **development, staging, and production** with isolated **Neon branches** and **coupled** front/back deployments per environment.
- **Authentication:** Google and email/password, forgot password, remember-me-style long sessions.
- **PWA:** manifest and service worker with **automatic update** behaviour after deploy.
- **Web Push:** opt-in, server-side subscription storage, send path integrated with the backend.
- **Core domain:** seasons, events, scoped participants, availability, weighted draw / cast workflow, confirmations—aligned with SPEC intent, delivered on the new stack (full **UI parity** with legacy is not assumed for the first cut).
- **Season/event participant rosters:** authorized admins can add participants at season or event scope using a display name, optional email, and optional user linkage; this does not grant troupe membership.
- **Troupe member import/export (MVP-enabling):** authorized administrators can export and import troupe member lists in a documented CSV format to support V1→V2 cutover and ongoing troupe administration (FR42).
- **Demo troupe (V2 prod):** Flyway (or equivalent) **production seed** for troupe **Démo**, season **Saison 2026-2027**, ~20 events, fictitious participants, varied composition states; `demoTroupeId` / `HATCAST_SEED_TROUPE_ID` (or successor config) points to Demo UUID—not dev-only La Malice seed (FR64).
- **Join policy (MVP hook):** troupe-level `OPEN` | `INVITE_ONLY`; default **OPEN** for newly created troupes; self-join API for `OPEN` troupes; **platform administrators** may change join policy; troupe administrators may not (FR62–FR63).

### Post-MVP Features

**Phase 2 (Growth):**

- Richer **guest / non-member** flows (self-service invites, joker/direct pick modes) and **premium** experiments per product brief.
- Deeper **fairness analytics**, season history, directory and SEO refinements.
- Operational hardening: observability, rate limits, backup/restore runbooks for Neon.

**Phase 3 (Expansion):**

- Broader **premium** packaging; optional **multi-tenant** org features; advanced integrations—only after validation.

### Risk Mitigation Strategy

**Technical Risks:** **Big-bang rewrite risk**—mitigate with **staging-first** workflows, **contract-first API**, incremental vertical slices, and explicit **parity checkpoints** against SPEC for critical journeys. **Neon + Cloud Run** (and optional **GitHub Pages** if used): validate **CORS**, **per-environment secrets**, and **coupled releases** early.

**Market Risks:** Troupes may stay on legacy workflows until the new stack proves value—mitigate with **pilot troupes** and measurable **time-to-compose / time-to-confirm**.

**Resource Risks:** If capacity drops, **narrow MVP** to a **single troupe archetype** and one primary organizer path, while keeping **auth + push + PWA update + coupled deploy** as platform hygiene.

## Functional Requirements

Requirements are listed in numeric order (FR1–FR52).

### Authentication & sessions

- FR1: A user can sign in with **Google** in MVP. Additional third-party identity options may be added later using the same account-linking rules.
- FR2: A user can sign in with email address and password.
- FR3: A user can request a password reset and complete password recovery via email.
- FR4: A user can stay signed in across visits when **“remember me”** (or equivalent) is selected. In MVP, a remembered session remains valid for **at least 30 days** or until the user signs out, changes password, or deletes the account—whichever occurs first.
- FR5: A signed-in user can sign out.

### Troupe & membership

- FR6: A user can belong to a troupe as a member with a member profile for that troupe. Active troupe members have default access to **troupe administration and league creation**; **league participation** (roster) determines which league events appear on the member's **user agenda** (FR48).
- FR7: A **troupe administrator** can manage which users are members and their baseline troupe roles, including removing a user from the troupe after confirmation. Removing a member revokes that troupe membership only; it does not delete the user account. Troupe membership is distinct from season/event participation records.
- FR8: A user can navigate between troupes they belong to when multiple membership exists.

### Profile & representation

- FR9: A member can edit a **troupe-specific display name (pseudo)** that the application uses as their visible name when identifying them **within that troupe**.
- FR10: A user can upload or replace a **profile avatar** image (accepted formats: **JPEG, PNG, WebP**; maximum **2 MB**). A user who signs in with **Google** can **import the Google profile photo once** from account settings or at first Google sign-in; after import, the user may replace it with a custom upload at any time.

### Seasons & events

- FR11: An administrator can create, edit, and archive **leagues** (*ligues*; V2 API: seasons) for a troupe. A troupe may have **multiple non-archived active leagues** concurrently (ADR 0011).
- FR12: An administrator can create, edit, and archive events (spectacles) within a season. Each event includes at minimum: **title**, **date and time** (or start/end window), **location or venue label**, **description** (optional), **event type**, and **lifecycle status** (active vs inactive/archived). Inactive or archived events are hidden from ordinary members and visitors; administrators and authorized organizers retain access.
- FR13: Active troupe members can view **active** seasons and events for their troupe by default. Inactive or archived events are not listed on member and visitor surfaces. Authorized season/event participants who are not troupe members can access only the active season or event scope granted to them, according to the permission model.
- FR14: An administrator can configure event types and required/optional roles for events according to troupe rules, including whether **volunteer availability is mandatory** when a participant marks a play role as available.

### Availability

- FR15: A linked participant can record availability per event as **available**, **unavailable**, or **unknown**, within their authorized season or event scope.
- FR16: A linked participant can indicate role-level availability when the event type requires role choices. When a play role is marked available and the event type has **mandatory volunteer coverage** configured (FR14), volunteer availability is recorded as available for that event unless the participant explicitly marks volunteer unavailable.
- FR17: A **season organizer, event organizer, or troupe administrator** can record or adjust availability on behalf of a participant in their authorized scope, including name-only or not-yet-linked participants, with auditability of who acted.
- FR18: In MVP, a linked participant can add an optional free-text **availability comment** (maximum **500 characters**) on their availability submission for an event. A **season organizer, event organizer, or troupe administrator** (same scope as FR17) can add or edit the same field on behalf of a participant. Comments appear to organizers and administrators on the event availability view; they are not shown on public discovery pages.

### Composition & draw

- FR19: An organizer can view eligible participants who are available for each role for an event.
- FR20: An organizer can run a weighted random draw to fill roles according to troupe/event eligibility rules.
- FR21: A **season organizer, event organizer, or troupe administrator** can manually assign or reassign participants to roles for events in their scope. A single participant **may hold multiple roles** on the same event; role-stacking is **allowed by default** per event type unless an administrator disables it in event-type configuration (FR14).
- FR22: An organizer can save a **draft composition** that is **hidden from ordinary troupe members by default**. The organizer **publishes** the draft via an explicit action to make it visible to members; until published, only organizers and administrators see draft slot assignments.
- FR23: An organizer can **validate (lock)** a composition **before confirmation requests are sent** to participants. A **season organizer, event organizer, or troupe administrator** can **unlock or invalidate** a validated composition to return it to an editable state, which re-opens confirmation requirements for affected slots.
- FR24: For events using weighted draw, included participants can view **per-role selection odds** (or equivalent explainability summary) on the event composition view **after the organizer publishes the draft (FR22)** or **after validation (FR23)**. Odds are not shown for events or roles excluded from the draw model (e.g. direct-assignment slots).

### Confirmations & withdrawals

- FR25: A linked participant can confirm or decline participation for their assigned role **after the composition is validated (FR23)** and while the event is in **awaiting confirmations** or **gaps to fill** (FR28).
- FR26: A **season organizer, event organizer, or troupe administrator** can confirm or decline on behalf of a participant in their authorized scope, including name-only or not-yet-linked participants, with auditability.
- FR27: When a participant withdraws or declines during **awaiting confirmations** or **gaps to fill** (FR28), organizers see the resulting **open slot(s)** on the event composition view and can: **view gap details**, **manually assign a replacement**, **run a partial weighted draw** for the open role(s), and **trigger a targeted confirmation notification** to affected participants.
- FR28: The product represents composition lifecycle states consistently for each event using at minimum: **preparing** (availability collection), **draft composition** (editable, not yet validated), **awaiting confirmations** (validated lineup), **gaps to fill** (open slots after decline/withdrawal), and **complete** (all required roles confirmed or explicitly waived by a **season organizer, event organizer, or troupe administrator**).

### Notifications

- FR29: In MVP, a user can **opt in or out of browser push notifications globally** (same scope as FR30). Per-category push preferences are post-MVP.
- FR30: In MVP, users can opt in or out of browser push notifications **globally**. Category-level preferences (e.g. availability vs confirmation) are **deferred post-MVP**; global push opt-in governs all notification types that use push.
- FR31 *(member notification intents)*: The product delivers **member-facing notification intents** on a unified dispatcher (push if FR29 opt-in; email if troupe policy). **MEP minimum:** **(1)** **availability collection opened** — only when the organizer **publishes** the event / opens availability (not on draft create; see Story 3.21); **(2)** **confirmation request** — on composition **validate** (FR23), **assigned participants only**. **Post-MEP initial (P1):** optional **team-validated FYI** to non-assigned roster (opt-out category FR30/8.2); **assignee presence reminders** (e.g. J-7, J-1); **removed from composition** alert; **re-confirmation** after remodel; **proxy action acknowledgment** — when a season organizer, event organizer, or troupe administrator records availability (FR17) or confirmation/decline (FR26) **on behalf of** a linked participant, notify the **subject only** with actor identity and change summary (Stories **5.5**, **6.8**, **8.6**). Category preferences (FR30) filter by intent and channel on a single enum.
- FR31b *(organizer ops notifications — post-MEP P2)*: The product may deliver **organizer-facing ops intents** (e.g. draft event created opt-in, draft composition shared to organizer circle only, SLA nudge to open availability, composition-incomplete cadence, team-complete closure to organizers). Recipients resolve via cascade: **event organizers** → **season organizers/admins** → **troupe administrators** when event organizers are unset (FR34). These intents do **not** replace the in-app **inbox** for member actions (Epic 12/17).

### Public discovery

- FR32: A visitor **without a HatCast account** can browse the **public troupe directory**. Freemium troupes are **listed by default** (non-opt-out); a troupe administrator can hide a troupe from the directory.
- FR33: A visitor **without a HatCast account** can view **public** season and event pages for troupes listed in the directory. Content marked non-public is not shown on visitor surfaces.

### Administration & audit

- FR34: A troupe administrator can designate **season-level organizers** and **event-level organizers**. Season organizers can manage all events in the season; event organizers can manage only assigned events. Delegation does not grant troupe-administration rights unless the user also holds troupe administrator role.
- FR35: A **troupe administrator, season organizer, or event organizer** can view an audit trail with **actor identity**, **subject identity** (when acting for another participant), **action type**, and **timestamp to second precision**. Tracked actions include at minimum: availability create/update/delete, availability comments, confirmations and withdrawals, composition draft/validate/unlock changes, **manual vs lottery slot assignments**, **slot removals**, and proxy actions on behalf of participants. Property-level **before/after values** are recorded at minimum for **availability status**, **role selections**, and **composition slot assignments**.

### Account & profile (account-level)

- FR36: A user can update account-level profile fields (display name, avatar per FR10) and **change password** when signed in with email/password. A user can initiate **email change with verification** when email/password auth is used. Google-only users manage profile fields not sourced from Google per product rules.
- FR37: A user can **request account deletion** from account settings. The product requires **explicit confirmation**, then **anonymizes or deletes personal data** per retention policy, **revokes active sessions**, and **preserves non-personal audit records** required for troupe governance. Deletion does not remove historical troupe audit entries that reference anonymized actor identifiers.

### Guest & external contributors (advanced / phased)

- FR38: **(Growth / post-MVP.)** After a troupe administrator **enables self-service guest invitations** for the troupe, an organizer can send an invitation for a **specific role and event scope** so an external contributor can onboard without prior troupe membership. MVP managed participants remain covered by FR43–FR45.
- FR39: **(Growth / post-MVP.)** External contributors invited under FR38 can be assigned using **organizer direct pick** or **last-resort/joker** modes configured per event. They are **excluded from the default weighted draw pool** unless an administrator explicitly includes them for that event. Basic admin-created season/event participants remain covered by FR43–FR45.

### Application delivery to users

- FR40: A user can **install or add the web application to the home screen** on supported mobile and desktop browsers when the platform exposes an install or add-to-home-screen prompt (PWA installability).
- FR41: After the organization releases a new app version, users receive updated behaviour without being expected to perform a technical manual refresh or troubleshooting action as the only remedy.

### Troupe member migration (administration)

- FR42: A **troupe administrator** can export and import troupe member lists in a documented CSV format to support HatCast V1-to-V2 migration, migration from one troupe to another, and rapid initialization of a new troupe.

### Participation scopes

- FR43: A season administrator can manage a season participant roster that includes troupe members by default and can also include non-member participants. A non-member participant may be a name-only managed participant, an existing HatCast user, or an email-prelinked participant awaiting first login.
- FR44: An event administrator can add or manage participants for a single event. Adding an event-scoped guest **upserts a troupe carnet entry** (`EXTERNE` membership — display name required; email and account optional) and an event roster row with **invitation scope `EVENT`** by default, so the guest can be recalled later without granting **full troupe membership** (`MEMBER`) or **season-wide availability** unless the organizer explicitly opts in to season roster inclusion with appropriate scope. Event participants may be name-only, linked to an existing HatCast user, or prelinked by email awaiting first login. Carnet removal does not destroy historical participation data. *(Amended SCP 2026-06-06 — ADR-0021.)*
- FR45: When an administrator provides an email for a season or event participant, the product attempts to link the participant to an existing user account with that email. If no activated account exists, the participant remains usable as a managed participant and is **linked automatically on first successful sign-in** with the same email. Email is optional.
- FR46: When a troupe member has configured **preferred roles** for the troupe, the availability form for applicable event types **pre-selects** those roles; the member can change selections before submitting.

### Product analytics & observability (product-level)

- FR47: The product records **anonymized workflow analytics events** sufficient to compute Success Criteria leading indicators: time from participant availability window open to first submission, time from composition validation to full required confirmations, and notification link follow-through when canonical event URLs are present. In MVP, analytics access is limited to **product operators**; troupe-visible analytics dashboards are post-MVP.

### Member journey & leagues (V2 target — ADR 0011)

- FR48: A signed-in member can view a **personal user agenda** listing **upcoming events** from every **league where they are a league participant**, across all troupes. **Upcoming** uses the same civil-day boundary as league agendas (today or future in the user's or product default timezone, e.g. Europe/Paris); archived or past events are excluded. The response is **paginated or bounded** (default page size ≤ **50** events). The agenda supports **filtering by troupe and by league**. Each **inter-troupe encounter** appears as **separate event rows** (one per troupe's event), each labelled with **troupe and league** context.
- FR49: After sign-in, the product **does not require an intermediate home screen**. Routing priority is: **(1)** a valid **stored deep link** (e.g. notification URL); **(2)** **last visited league workspace** when the slug is still valid for an active membership; **(3)** **user agenda** (`/agenda`); **(4)** if the user has no league participations, an **empty agenda** with guidance to **create a troupe**, **join the Demo troupe** (FR61), or **discover the directory** (FR32) when available.
- FR50: When creating a league, an administrator chooses whether **all active troupe members** are enrolled as initial league participants **or** the roster starts **empty for manual addition** (participants may be existing users, name-only, or email-prelinked per FR45).
- FR51: From an **event detail** view, an authorized user can navigate to the **league workspace** for that event's league and to the **troupe hub** for that event's troupe.
- FR52: From a **troupe hub**, a member can view **all leagues** for that troupe (active by default; **archived** via explicit filter), manage **troupe-scoped pseudo** (FR9), access **troupe administration** (e.g. members), and reach the **public troupe directory** to discover or request joining other troupes (FR32).

### Cross-troupe encounters *(post-MVP product option)*

- **(Post-MVP.)** An administrator may **link** two or more HatCast events that represent the same real-world encounter (e.g. inter-troupe match) via a shared **encounter** reference for convenience. MVP satisfies FR48 with **independent events** and clear troupe/league labelling only.

### League workspace views, exports & cross-scope filters (ADR 0012)

- FR53: Within a **league workspace**, the product exposes **three distinct views**: **Agenda** (upcoming events only, per UX-DR12), **Historique** (past, non-archived events in a **chronological**, month-grouped list — **no** participation-statistics grid), and **Statistiques** (V1-style participation statistics grid per DOMAIN.md § Statistiques de composition). A view switcher keeps the user in league context.
- FR54: The season workspace provides a **single CSV export** of **Statistiques** data (participation grid per SPEC § CSV export). Export is available from the **season administration menu** (⚙) to **season organizers and administrators** only; it reflects the **full season** dataset. **Historique** has **no** CSV export.
- FR55: Member surfaces that aggregate **multiple troupes or leagues** — **user agenda** (FR48), **personal season glance** (FR58), and any **cross-league Statistiques** view — expose **troupe** and **league** filters. **Filter controls are hidden** when the signed-in user has exactly **one** troupe or exactly **one** league in scope (RES-001).

### Travel (déplacement) leagues

- FR56: Away shows (**déplacements**) are managed in a **dedicated travel league** within the troupe (e.g. *Ligue Déplacements*), separate from show-circuit leagues. Travel leagues use the same league lifecycle, roster, events, availability, composition, and per-league statistics as other leagues. **New** events must **not** rely on a special `deplacement` spectacle template type; legacy `deplacement` events remain readable (and migratable) until retired.
- FR57: Weighted draw and chance calculations run **within a single league** scope. **Cross-league** fairness rules (e.g. balancing travel vs local shows in one draw) are **post-MVP** unless explicitly specified later.

### Personal season glance & transparency

- FR58: A signed-in member can open a **personal season glance** (*Ma saison en un clin d'œil*, V1 parity: summary cards, monthly participation chart, preferred roles) from the **member area** via a stable route (e.g. `/membre/:userSlug`). Optional **troupe** and/or **league** filters apply when multiple contexts exist (FR55).
- FR59: Any member authorized to view a league's participation data may open **another participant's** season glance via the same URL pattern (V1 **transparency**). Shortcuts from league workspace (e.g. avatar tap) **navigate** to this route; the popover is not the sole surface.
- FR60: In **Statistiques**, events in **travel leagues** contribute to **DEPLACEMENT** role-family columns; events in show leagues never count toward DEPLACEMENT. Legacy `deplacement` template events count toward DEPLACEMENT until migrated. Cross-league Statistiques honour FR55 filters and aggregate only selected leagues.

### Demo troupe onboarding & join policy (V2 production)

- FR61: A **signed-in user** with no prior membership can **self-join** any troupe whose **join policy is `OPEN`**, including the production **Demo** troupe, via an explicit in-app action (e.g. “Rejoindre la troupe de démonstration” on `/troupes`). Self-join **creates or reactivates** an active troupe membership with baseline role **`MEMBER` only**—never `TROUPE_ADMIN`. Self-join **enrolls the member as a season participant** in active leagues configured for Demo onboarding (minimum: **Saison 2026-2027** on the Demo troupe). Self-join is **rejected** for troupes with **`INVITE_ONLY`** join policy.
- FR62: Each troupe has a **join policy**: **`OPEN`** (authenticated self-join permitted per FR61) or **`INVITE_ONLY`** (membership only via troupe administrator invitation or admin-managed add flows). **Newly created troupes default to `OPEN`**. Premium tier packaging that restricts **`INVITE_ONLY`** to paid plans is **deferred**; FR62 establishes the model and permissions only.
- FR63: A **platform administrator** (super-admin email allowlist, V1 parity via `hatcast.auth.super-admin-emails`) can **read and update** a troupe's **join policy**. **Troupe administrators cannot** change join policy in MVP—even for their own troupe. Changing join policy from **`OPEN`** to **`INVITE_ONLY`** does **not** remove existing active memberships.
- FR64: **Production** deployments seed a dedicated **Demo** troupe (**name:** *Démo*; **slug:** `demo`; flagged **`is_demo = true`**) distinct from **dev/recette** seeds (e.g. La Malice). The Demo troupe includes one primary season **Saison 2026-2027** (**start:** 2026-06-01; **end:** 2027-05-31), **approximately 20 active events** spanning event types and role-slot configurations (cabaret, match, longform, travel/deplacement patterns), and **fictitious season participants** (generic first names, no real emails) with **pre-seeded availability** sufficient to render a credible agenda and composition views. Event **composition lifecycle states** must cover at minimum the pedagogical mix below. **Platform administrators** maintain Demo content and composition states; self-joining users may submit **their own** availability but **must not** gain organizer or troupe-admin powers. Real user memberships in the Demo troupe **must not** be counted in product analytics as pilot-troupe adoption unless explicitly filtered (FR47).

#### Demo season pedagogical event matrix (planning default)

| Count | Pedagogical intent | Event types (examples) | Composition / lifecycle target |
| --- | --- | --- | --- |
| 3–4 | Learn availability + role selection | cabaret, match | **preparing** — no validated composition |
| 2–3 | Past season context | mixed | **complete** (historique) |
| 2 | Upcoming draw workflow | match | **draft composition** (organizer-visible) |
| 2 | Confirmation flow | cabaret | **awaiting confirmations** |
| 1 | Gap recovery | match | **gaps to fill** |
| 1 | Fully confirmed team | cabaret | **complete** (upcoming) |
| 2–3 | Format variety | longform, travel/deplacement | mixed states |
| 1–2 | Archived / inactive | any | archived or inactive (admin-visible) |

Exact titles, dates, and UUIDs are **implementation** concerns (Flyway seed); this matrix is the **acceptance benchmark** for FR64.

## Non-Functional Requirements

Each NFR states **criterion**, **metric**, **measurement method**, and **context**.

### Performance

- **NFR-P1**
  - **Criterion:** Primary interactive flows remain responsive on mobile networks.
  - **Metric:** Time to interactive for season grid, event view, availability submit, and composition open ≤ **3 seconds** at **p95** on a **Fast 3G–equivalent** throttled profile.
  - **Measurement method:** Automated performance tests in staging plus synthetic monitoring on release candidates.
  - **Context:** Troupes up to **100 members** and **50 events** per active league; **user agenda** may aggregate across multiple leagues and troupes (default page size ≤ **50** rows per request).

- **NFR-P2**
  - **Criterion:** Common read operations feel immediate for typical troupe sizes.
  - **Metric:** Server-side read latency ≤ **500 ms** at **p95** for season list, event detail, and availability summary endpoints under nominal load.
  - **Measurement method:** APM traces on staging/production; load test with **10 concurrent organizers** and **50 concurrent members**.
  - **Context:** Nominal load defined above; excludes cold-start spikes beyond **5 s** on first request after idle scale-to-zero.

### Security & privacy

- **NFR-S1**
  - **Criterion:** Authentication data is protected in transit and at rest per industry baseline.
  - **Metric:** **100%** of auth and API traffic over **TLS 1.2+**; no credentials in client logs; session tokens stored with httpOnly/secure cookie or equivalent pattern.
  - **Measurement method:** Security checklist on release; automated TLS scan; code review of auth paths.
  - **Context:** All environments (development, staging, production).

- **NFR-S2**
  - **Criterion:** Personal data is visible only to authorized identities.
  - **Metric:** **0** unauthorized cross-troupe or cross-role data exposures in permission test suite; **100%** of protected endpoints enforce role checks in automated API tests.
  - **Measurement method:** Automated authorization tests per resource type; periodic penetration test on staging.
  - **Context:** Email, avatar, pseudo, participant names/emails, availability, composition data.

- **NFR-S3**
  - **Criterion:** Account deletion and data subject requests are handled within regulatory expectations.
  - **Metric:** Account deletion completes within **30 days** of confirmed request; export/deletion runbook documented; **100%** of deletion requests logged.
  - **Measurement method:** Operational audit of deletion tickets; privacy policy alignment review quarterly.
  - **Context:** EU users (GDPR-oriented processes at organizational level).

- **NFR-S4**
  - **Criterion:** Member import/export handles personal data safely.
  - **Metric:** Only troupe administrators can import/export; exports contain only documented fields; imports reject invalid rows with row-level error reporting; **0** data leaks to unauthorized roles in test scenarios.
  - **Measurement method:** Automated tests for FR42 permission boundaries and malformed CSV handling.
  - **Context:** V1→V2 migration and inter-troupe member moves.

- **NFR-S5**
  - **Criterion:** Season/event participant administration protects optional email and linking data.
  - **Metric:** Participant email visible only to authorized admin/organizer roles; name-only participants function without email in **100%** of MVP test scenarios.
  - **Measurement method:** Authorization tests on participant roster APIs and admin UI role matrix.
  - **Context:** Managed participants without forced account creation.

### Reliability & operations

- **NFR-R1**
  - **Criterion:** Coupled releases do not strand users on incompatible client/server pairs.
  - **Metric:** **0** known P0 defects from version skew lasting > **24 hours** after a coupled deploy; post-deploy smoke tests pass on **100%** of production releases.
  - **Measurement method:** Release checklist with paired front/back deploy verification; incident tracking.
  - **Context:** Development, staging, and production coupled deploy policy.

- **NFR-R2**
  - **Criterion:** Asynchronous delivery failures are observable and do not corrupt domain state.
  - **Metric:** Push/email send failures logged with correlation ID; core write operations remain consistent (**0** orphaned confirmation states in integration tests); retry or dead-letter path documented.
  - **Measurement method:** Integration tests simulating provider failure; monitoring alerts on error rate > **5%** over 15 minutes.
  - **Context:** Web push and email notification paths.

### Scalability

- **NFR-SC1**
  - **Criterion:** Core domain model supports growth without redesign.
  - **Metric:** Staging load test supports **50 troupes × 100 members × 50 events/season** with NFR-P2 still met at p95.
  - **Measurement method:** Annual load test before major season peaks; review partition/index strategy when threshold exceeded.
  - **Context:** SaaS freemium growth hypothesis; no multi-region requirement in MVP.

### Accessibility

- **NFR-A1**
  - **Criterion:** Core member and organizer tasks meet WCAG 2.1 Level AA baseline.
  - **Metric:** **0** critical (Level A) axe-core violations on primary flows; contrast ratio ≥ **4.5:1** for normal text; keyboard operability for availability submit, composition view, and confirmation actions.
  - **Measurement method:** Automated axe checks in CI on primary routes; manual keyboard pass before major releases; documented exception list for admin-only secondary screens.
  - **Context:** Core flows defined in Journey 1 and Journey 2; target aligns with **Open Product Decisions**.

### Integration

- **NFR-I1**
  - **Criterion:** Google sign-in and email/password reset integrate reliably.
  - **Metric:** Auth provider success rate ≥ **99%** over rolling 7 days excluding user-caused errors; failed auth surfaces user-actionable message in **100%** of tested error codes.
  - **Measurement method:** Auth success/failure metrics dashboard; synthetic login probe every **15 minutes** in staging/production.
  - **Context:** Google OAuth and transactional email provider.

### Quality & testability

- **NFR-Q1**
  - **Criterion:** Critical product paths have automated regression coverage.
  - **Metric:** **≥80%** line coverage on domain-critical backend modules; **100%** of FR1–FR5, FR15–FR16, FR19–FR23, FR25, FR32, **FR48–FR49** auth/availability/composition/**agenda entry** paths covered by at least one automated test (unit and/or E2E); **0** disabled tests to merge without explicit waiver.
  - **Measurement method:** CI coverage report; Playwright (or equivalent) smoke suite on staging before production promote.
  - **Context:** Supports Technical Success automated-test expectation; scope excludes growth-only FR38–FR39 until implemented.
