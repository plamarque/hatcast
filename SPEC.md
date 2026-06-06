# Functional specification (HatCast)

**Location:** Repository root. Functional intent is global; root keeps SPEC easy to find for both humans and agents.

This document defines **what** the system does today and what must remain true. It does not specify implementation order or tasks (see PLAN.md).

---

## Vision (short)

HatCast is a web application for organising improvisation shows: managing **seasons**, **events**, and **players**; letting players indicate **availability**; running a **fair, weighted draw** to form **casts** (who plays for each event); and notifying participants. Data and auth are backed by Firebase (Firestore, Auth, Cloud Functions). The app is a single-page application (Vue 3) with PWA support and optional push notifications.

---

## Administration — required capabilities (V2 target)

Normative intent for **administration** flows: **visual design is not prescribed** (Angular Material–typical or equivalent is acceptable). The product **must** expose the following capabilities to users with the appropriate roles (exact labels and routes in DOMAIN / permissions):

1. **Members** — manage **members** and their **roles** (organizer, admin, participant, etc. as defined in DOMAIN).
2. **Spectacles** — manage **spectacles** (events: lifecycle, metadata, attachment to a season) for the relevant scope.
3. **Troupe and seasons** — manage **troupe** identity and **seasons**; **at most one season may be active at a time** within a given **troupe** (or product-defined scope)—activation must be **explicit** (see DOMAIN invariant).

**UX reference (non-pixel):** [_bmad-output/planning-artifacts/ux-design-hatcast-v2.md_ — Admin surfaces (functional scope)](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope).

This section complements the **legacy** admin behaviour described elsewhere in this document (e.g. `/season/:slug/admin`); where they differ, **migration** is handled in PLAN / ARCH for the target stack.

---

## Organizer share and announce (V2 target)

Normative intent for organizers with **`canManageComposition`** (exact routes and UI chrome in [_bmad-output/planning-artifacts/ux-design-share-announce-6-15.md_](_bmad-output/planning-artifacts/ux-design-share-announce-6-15.md) and DOMAIN glossary). Applies to the Angular + Spring V2 stack.

### Purpose

Give organizers **transparent control** over manual event communication: who can be reached automatically, who was **already** reached on which channel, who must be contacted manually, and whether a **resend** is reasonable — especially when **several organizers** administer the same event.

### Availability announcement vs reminder (single path)

- **Availability announcement** and **availability reminder** are the **same capability** from the organizer’s perspective: open the share dialog, edit the message, optionally Notifier / Copier / WhatsApp.
- **Reminder** = any **subsequent** send of the availability-request family on the same event after at least one prior send of that family (including the automatic notification at publication, when it occurs).
- The product **may** adapt **dialog title** and **default message template** on a reminder so it is clearly a relance, not the first announcement.
- **Automatic send at publication** (`AVAILABILITY_OPENED` when availability opens) is the **first** system-initiated availability notification; it counts toward “already notified” for transparency but does not replace the manual share dialog for custom copy / WhatsApp / optional manual Notifier.

**Recipient sets (decided 2026-06-04):** **Annoncer** = full active season roster; **Relance dispos** = participants with **`unknown`** availability only. Two menu entries (UX D12) — see DOMAIN.md and [_tech-spec-share-announce-transparency-6-17.md_](_bmad-output/planning-artifacts/tech-spec-share-announce-transparency-6-17.md).

### Other send families (same transparency rules)

Draw share, composition announce, and future manual sends must follow the **same organizer transparency model** once HatCast performs real dispatch:

- Per-recipient **channel eligibility** (email / push / none → manual contact).
- Per-channel **notified** state when a successful delivery is logged.
- **Last successful send** information exposed to organizers (date/time per channel or per send — exact UX in UX spec; required for anti-spam judgment).
- **Anti-spam:** soft guard (e.g. confirm if a recent send of the **same send family** on the same event) so a second organizer does not unknowingly spam; aligned with `lastManualNotifyAt` / delivery log history.

### Recipient detail (organizer)

When the organizer expands recipient detail in the share dialog:

- **Given** GET share-recipients succeeds, **when** detail is shown, **then** each row shows display name and per-channel status: **absent** (not eligible), **pending** (eligible, not yet successfully notified for the relevant intent(s)), **notified** (successful delivery logged on that channel).
- **Given** a recipient has no eligible channel, **when** detail is shown, **then** the UI indicates **manual contact** (no channel pills).
- **Given** a participant joined the roster **after** an earlier send, **when** detail is shown, **then** they appear as eligible but not notified until a new send reaches them.

### Notified semantics (normative)

- **Notified** on a channel means at least one **`notification_delivery_log`** row for that `(event_id, user_id, channel)` with status **`SENT` or `PARTIAL`** for the notification intent(s) mapped to the current send family — **including manual organizer sends**, not only automatic publication.
- Applies to **all** send families once real dispatch exists (availability, draw, composition, …).
- Failed or skipped attempts do **not** count as notified.

### Non-goals (this spec section)

- Exact API intent names, menu labels, or implementation order (PLAN / UX artifacts).
- Tooltip copy *« Notifié le … »* vs inline date — UX choice; **last-send date for organizers is in scope** as a requirement, presentation is not fixed here.

**Runtime note:** Manual `event` announce and per-channel `lastNotifiedAt` are implemented (story **6.17**). `draw` / `composition` POST dispatch remains stub until story **6.18**.

---

## Member gender & team parity (V2 target)

Normative intent for **optional member gender** on the account profile and **gender-aware presentation** (V1 parity). Full contract: [_bmad-output/specs/spec-member-gender-parity/SPEC.md_](_bmad-output/specs/spec-member-gender-parity/SPEC.md) + companion [_member-gender.md_](_bmad-output/specs/spec-member-gender-parity/member-gender.md). Stories **2.12–2.12c**, **6.21**, **16.3**; draw factor **19.11** is downstream.

### Purpose

Let members **optionally** declare gender (Homme / Femme / Non précisé) so HatCast can:

1. Show **natural role labels** when gender is known (e.g. Comédienne vs Comédien·ne).
2. Use **distinct fallback avatars** when no custom/Google photo exists.
3. Help organizers see **player-role gender balance** on a composition (informational hint).
4. Optionally expose **season-level aggregate parity** on validated `player` participations.

Gender is **never required**; workflows must not block when unset.

### Profile (member self-service)

- **Given** a signed-in user, **when** they edit **Mon compte → Mon profil**, **then** they can set gender to Homme, Femme, or Non précisé (default).
- **Given** gender is saved, **when** the API persists, **then** `users.gender` is `male` | `female` | `non_specified`.
- **Given** gender is unset or Non précisé, **when** role labels render, **then** inclusive middot forms remain (current V2 behaviour).

### Labels and avatars

- **Given** a participant's gender is known, **when** a role label is shown in dispos, équipe, or confirmation flows, **then** labels follow the V1 gender tables (see companion).
- **Given** no custom or Google avatar, **when** avatar renders, **then** fallback is the display-name initial on a gender tone (purple / orange / grey per `member-gender.md`) — not V1 emoji.

### Composition parity hint (organizer)

- **Given** a composition draft with filled `player` slots, **when** an organizer views the Équipe tab, **then** a **non-blocking** inline summary shows F/M counts among slots with known gender (story **6.21**).
- **Given** imbalance or partial data, **when** the hint is shown, **then** assign, draw, and validate remain allowed.

### Season parity statistics (optional expose)

- **Given** validated compositions in a season, **when** aggregate parity is requested, **then** counts and female share are computed on `player` slots only, excluding `non_specified` from the ratio (story **16.3**).

### Non-goals (this spec section)

- Mandatory gender; admin editing another member's gender (Wave A); blocking on imbalance; draw weighting (**19.11**).

---

## Actors / personas

- **Anonymous visitor:** Can view public content (e.g. landing, help). Cannot access season data that requires auth.
- **Player (participant):** Has a **player** profile linked to a season (via claim or invite). Can set availability per event, view casts, and confirm or decline presence in a cast. May authenticate via email/password, magic link, or Google (observed in `legacy/src/services/firebase.js`, auth flows).
- **Season creator / admin:** Can create and edit a season, its events, and its players; run the draw; announce casts; manage invitations. Access is controlled by Firestore `seasons/{id}/admins` and/or Super Admin (Cloud Function) (observed in `legacy/src/services/permissionService.js`, `main.js` router guard).
- **Super Admin:** Global admin (e.g. for support). Granted via Cloud Function; can access any season admin (observed in `permissionService.js`, `functions/adminFunctions.js`).

---

## Core user journeys (high-level, testable)

1. **View seasons and events:** User opens the app, sees or navigates to a season, sees a list of events and players (grid). No auth required for read in current rules (Firestore read public for seasons and subcollections).
2. **Join a season (player):** User follows a join/invite link (e.g. `/season/:slug/join` or `/accept-invitation`), authenticates if needed, claims or is assigned a player, then can set availability.
3. **Set availability:** Authenticated player selects events and sets availability (e.g. available / unavailable). Data stored in Firestore under the season (e.g. `availability` or player subcollections); observed in `legacy/src/services/storage.js`, `playerAvailabilityService.js`.
4. **Run draw and announce cast:** Season admin runs the selection (weighted random draw based on past participation). System produces a **cast** per event (who is selected). Admin can announce; players can see cast and confirm/decline. Observed in `selectionService.js`, `castService.js`, `chancesService.js`.

**V2 draw engine (Angular + Spring):** Weighted draw semantics, display % (`exactSelectionProbability`), and the **displayed % = draw weights** invariant are defined in [ADR 0019](docs/adr/0019-draw-weight-engine.md) and the normative spec [draw-weight-engine-v1-spec.md](docs/v2/technical/draw-weight-engine-v1-spec.md). This SPEC does not duplicate the formula. Runtime: `AvailabilityChanceCalculator` + `CompositionDrawService`.
5. **Account and auth:** User signs in (email/password, magic link, Google) or uses password reset. Optional: link account to a player (claim), manage preferences. Observed in auth views and `authState.js`, `magicLinks.js`.
6. **Season admin:** Admin opens `/season/:slug/admin`, manages season, events, players, invitations. Guarded by router + permission check (observed in `main.js` router.beforeEach, `permissionService.js`).
7. **Notifications (optional):** Push (FCM) and/or email reminders. User opts in; app writes to `pushQueue` / `reminderQueue`; Cloud Functions process. Observed in `functions/index.js`, `notifications.js`, `reminderService.js`.

**Code references (critical flows):** Draw/selection → [legacy/src/services/selectionService.js](legacy/src/services/selectionService.js), [legacy/src/services/chancesService.js](legacy/src/services/chancesService.js). Cast read/write → [legacy/src/services/castService.js](legacy/src/services/castService.js), [legacy/src/services/storage.js](legacy/src/services/storage.js). Availability → [legacy/src/services/playerAvailabilityService.js](legacy/src/services/playerAvailabilityService.js), [legacy/src/services/storage.js](legacy/src/services/storage.js). Auth → [legacy/src/services/firebase.js](legacy/src/services/firebase.js), [legacy/src/services/authState.js](legacy/src/services/authState.js). Admin guard → [legacy/src/main.js](legacy/src/main.js) (router.beforeEach), [legacy/src/services/permissionService.js](legacy/src/services/permissionService.js).

---

## Non-functional constraints (observed)

- **Online-first:** App assumes network; Firestore has offline cache but critical flows (auth, draw, admin) expect connectivity. No hard offline-only mode specified in code.
- **Hosting:** Deployed to Firebase Hosting (production and staging targets); build is static `dist` from Vite (see `firebase.json`, CI workflows).
- **Devices:** Responsive UI; mobile and desktop. PWA install supported (manifest, service worker in `legacy/src/service-worker.js`, [`legacy/vite.config.js`](legacy/vite.config.js)).
- **Environment:** Multiple Firestore databases (default, staging, development) and env-specific config via `configService.js` (hostname and env vars).
- **Language:** UI and docs are primarily French (observed in labels, routes, and existing docs).

---

## Scope (MoSCoW, from what exists)

**Must have (in use today):**

- Seasons, events, players; availability per player/event; weighted draw; casts and cast status (pending/confirmed/declined).
- **Event-details Availability tab (Disponibilités):** When the list of players is shown (all players or grouped by role), the availability status cell is not displayed. The availability-choices popup is opened by clicking the player row (name, avatar, or the full highlighted box). Clicking the chance-percentage numbers (in the by-role view) opens the chance-detail popup(s) only, not the availability popup.
- Auth (email/password, magic link, Google); password reset; season join and accept invitation; player claim.
- Season admin (CRUD season, events, players; run draw; invitations); access control via admins + Super Admin.
- Firestore persistence with current security rules; multi-database support for environments.
- Audit trail of significant actions (e.g. via Firestore triggers and `auditClient.js`).
- Responsive web UI; PWA (install, service worker, manifest).
- **Participant and event selectors (multi-select):** Header dropdowns filter the displayed participants and events. Clic sur une ligne = sélection simple immédiate + fermeture. Cases à cocher (à droite de chaque ligne) permettent la multi-sélection : cocher plusieurs participants ou spectacles, fermer la popup → affichage filtré à ceux cochés. L'entrée « Tous » a une case pour tout cocher/décocher ; son clic sur la ligne garde le comportement actuel (fermeture + afficher tous). Code : [PlayerSelectorModal.vue](legacy/src/components/PlayerSelectorModal.vue), [EventSelectorModal.vue](legacy/src/components/EventSelectorModal.vue), [ViewHeader.vue](legacy/src/components/ViewHeader.vue).
- **Event “past” for UI filters and styling:** The event date is a calendar day (typically `YYYY-MM-DD` from the date picker). An event is treated as **past** (hidden when “past” is off, ⏰ styling, etc.) only **after the end of that calendar day in `Europe/Paris`**, not immediately after UTC midnight of the stored date. Implementation: [eventPastParis.js](legacy/src/utils/eventPastParis.js).

**Should have (present in codebase):**

- Push notifications (FCM) and reminder queue (email).
- Magic links and account-related flows.
- Navigation/preference tracking (e.g. `userNavigation`).
- Player protection (e.g. lock player to account).

**Could have / minimal presence:**

- GitHub Pages deploy (workflow exists but secondary to Firebase Hosting).
- Optional features (e.g. filters, scroll behaviour) documented in `docs/v1/user/`.

**Won't (out of scope for this spec):**

- Features not present in the repo or explicitly requested. No inference of future product roadmap.

---

## Recorded slices (planned capabilities)

Slices below describe desired behaviour to be implemented later. Implementation order and tasks will be defined in PLAN.md when a slice is scheduled.

- **Event details as full screen (canonical URL)**
  - Event details are shown as a **full screen** (not a modal), at the canonical URL `/season/:slug/event/:eventId`. Layout: same as the grid (header, content, footer). Header in “event mode”: back chevron goes to the season; icon and title are the event’s; admin and account actions unchanged.
  - **All links that lead to an event** (emails, push notifications, WhatsApp-shared messages, calendar links, in-app share, Cloud Functions sending reminders or cast notifications) **must use this URL format**. No backward compatibility for the old query format (`?event=...&modal=event_details`); old links may redirect to the canonical URL.
  - **Query parameters** on the event page preserve behaviour: e.g. `tab=compo`, `showConfirm=true`, `showAvailability=true`, `notificationSuccess=1` (+ email, playerName, eventId), and any `action` used by magic links or reminders. The event screen reads these and opens the right tab or modal as today.
  - **Full specification:** See the dedicated section « Event details as full screen » below in this document.

- **Event-details tabs – Info as first tab**
  - The content currently shown in the collapsible "details" block (date, location, description, map, add-to-calendar, navigation links) becomes the content of the **first tab**, labeled **Infos**. The Infos tab presents this in **three stacked sections** (Description, Date, Lieu with map), same layout on mobile and desktop. Tabs are displayed as centered pill-style buttons (aligned with the main view switcher and Tous/Moi availability selector).
  - The event-details view has **three tabs**, labeled in the UI: (1) **Infos** (first), (2) **Dispos**, (3) **Équipe**. The Équipe tab is always visible for logged-in users; when there is no draw yet it shows an empty state (e.g. “Aucun tirage pour le moment”). URL and code use `tab=info`, `tab=team`, `tab=compo`.
  - **Default tab:** When opening the event-details modal **without** a tab specified in the URL, the **first tab (Infos)** is displayed.
  - **URL parameter:** A query parameter (e.g. `tab`) allows opening a specific tab when opening event details via URL (e.g. `tab=info`, `tab=team`, `tab=compo`), so deep links can target Infos, Dispos, or Équipe.
  - No other change to existing behaviour (availability popup, composition display, permissions) is specified by this slice.
  - **Code reference:** Event-details tabs UI → [legacy/src/components/GridBoard.vue](legacy/src/components/GridBoard.vue).

- **Inline composition in event-details Composition tab (no separate popup)**
  - Composition management is done **only** in the **Composition** tab of the event-details modal. There is **no separate composition popup** (SelectionModal is no longer opened as an overlay).
  - The Composition tab is **always available** in event details for the event (e.g. always show the tab, including when there is no cast yet), so users can run a draw or view empty state from the tab. Visibility of the tab may still depend on user role or context where event details are shown (e.g. logged-in only, as today for the tabs block).
  - The Composition tab contains **all** composition features that currently exist in the composition popup: run draw (Tirage), simulations (Simuler + algorithm choice), validate (Valider), unlock (Déverrouiller), announce (Annoncer la compo), send via WhatsApp (Envoyer), reset (Effacer), fill cast (Remplir), manual slot edit, declined-players handling, status badges, PIN when required, and opening of EventAnnounceModal / DrawAnnounceModal / HowItWorks as needed. Same permission and state rules apply (e.g. `canManageCompositionValue`, `canCasterEditManually`, confirmation/organizer state).
  - **Consecutive-show warning (organizer UX, Story 6.20):** When an organizer assigns or draws a participant into a slot, a **non-blocking inline hint** on that slot warns if they already held the **same role** on the **immediately preceding validated show** in the **same category compartment** (see DOMAIN.md). Members do not see this hint.
  - **Multi-role on same event (organizer UX):** When a participant holds **more than one role** on the **current** event (typically via manual assign per FR21), a **non-blocking inline hint** on each affected slot lists the **other** role(s) on that event (see DOMAIN.md). Members do not see this hint. Assign, draw, and validate remain allowed.
  - **Auto-draw cross-role rule:** A weighted draw must **never** assign the same participant to two roles on one event. Pre-existing assignees on the draft composition count toward cross-role exclusion before roles are processed in priority order (see DOMAIN.md and [draw-weight-engine-v1-spec.md](docs/v2/technical/draw-weight-engine-v1-spec.md)).
  - **Gender parity hint (organizer UX, Story 6.21):** A **non-blocking** summary of female/male counts among filled **`player`** slots with known gender (see SPEC § Member gender & team parity). Distinct from consecutive-show warning.
  - **Composition validate & unlock participation (V2, FR23):** **Unlock** clears structural validation only — assignees and each slot's participation status are **preserved**. **Validate** (first or revalidate) sets **non-`confirmed`** assignees to `pending` before notification dispatch; **`confirmed`** slots stay confirmed and are excluded from `CONFIRMATION_REQUEST` / `RECONFIRMATION_REQUEST`. Organizer **proxy** in organizer draft may update status without notification until validate. See DOMAIN.md and [`spec-composition-unlock-preserve-confirmations.md`](_bmad-output/implementation-artifacts/spec-composition-unlock-preserve-confirmations.md).
  - **Composition organizer draft zone (V2 UX):** While composition is organizer draft, orga/admin see a **violet draft zone** inside the **Équipe** tab (not global event chrome) with chip *Brouillon* and coordination copy; **Partager** is visible in the action grid alongside **Valider** and **Tirer au sort**. See [_ux-design-hatcast-v2.md_ § Pattern: Composition organizer draft zone](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-composition-organizer-draft-zone).
  - **Composition actions** (Tirage, Simuler, Valider, Déverrouiller, Annoncer, Effacer, Remplir, Envoyer, clear slot) are visible and usable only for users who can manage composition (Super Admin, Season Admin, Event Admin, or Caster). **Manual selection** (click on an empty slot to choose a player) is reserved for **administrators only** (Season Admin, Event Admin, Super Admin); casters cannot fill slots manually.
  - Slot click in the Composition tab continues to open the confirmation flow (confirm/decline) for the selected player as today; no change to that behaviour.
  - Entry points that previously opened a composition popup now open or focus **event details with the Composition tab selected**: on the full-screen event view there is no footer "Composition Équipe" button — users open the Composition tab via the **Équipe** tab; TimelineView and similar triggers open event details on the Composition tab; URL `modal=selection` is treated like opening event details with `tab=compo`. No separate modal layer for composition.
  - User experience is a single place (event details) with one tab (Composition) where users see and perform only the actions their permissions allow.

- **Slot click in composition (Composition tab) for participation confirmation**
  - In the **Composition tab** of event details (inline composition UI), clicking on a filled slot (a person in the composition) opens the **participation confirmation** popup.
  - **Permissions:** An **administrator** (e.g. can edit the event) can open the confirmation popup for any slot (to confirm, decline, or set to pending for any player). The **concerned player** can open it only for **their own** slot (to confirm or decline their own participation). Other users do not open the popup (or see an error if they try).
  - Behaviour and UI of the confirmation popup are unchanged (confirm / decline / pending); the entry point is slot click in the Composition tab.

- **Event-details Équipe tab – compact layout on mobile**
  - In the event-details **Équipe** (Composition) tab, the list of composition slots is displayed in a **more compact layout on mobile**: **two slots per line** instead of one slot per line.
  - Behaviour and information shown for each slot are unchanged (avatar, player name, role, status, click for confirmation, etc.). Only the grid/layout is adjusted so that on small viewports (mobile), two slots sit side by side per row, similar to the Dispos tab.
  - Reference: the Dispos tab already uses this pattern in `EventRoleGroupingView` (e.g. `grid-cols-2` at base); the Composition slots grid in GridBoard currently uses `grid-cols-1` for the smallest breakpoint.

- **Event-details Équipe tab – message déclinés compact et liste sur demande**
  - In the event-details **Équipe** (Composition) tab, do **not** display a large always-visible message or "Personnes ayant décliné" block. **Evolution:** Show a **compact clickable badge** just below the composition slots that indicates how many people have declined (e.g. "4 personnes ont décliné" or "1 personne a décliné"). When the user **clicks** the badge, the "Personnes ayant décliné" section (heading, subtitle, list with avatars, roles, "Remettre en composition" where applicable) is shown below; clicking the badge again (or an equivalent control) closes it. The badge is the only always-visible element for declined; the list is on demand. Scope and display conditions unchanged (composition validated, declined players, empty slots where relevant); no change to business behaviour. Code reference: [SelectionModal.vue](legacy/src/components/SelectionModal.vue) (inline in Équipe tab via [GridBoard.vue](legacy/src/components/GridBoard.vue)).

- **Composition status messages (Équipe tab)**
  - In the Composition tab, a **status badge** and a **hint message** indicate the current composition state. The displayed status is one of six; the **order of evaluation** matters (first matching condition wins).
  - **Definitions (logical conditions):** *hasSelection* — at least one player in the composition. *hasEmptySlots* — at least one slot has no player. *hasDeclinedPlayersInSlots* — at least one slot is filled by a player whose status is declined. *allFilledSlotsConfirmedLocally* — composition is validated by the organizer, there are no empty slots, and every filled slot has player status confirmed (derived from cast data). *isSelectionConfirmedByOrganizer* — the composition has been locked/validated by the organizer.
  - **Status table (evaluation order):** (1) **À composer** — no player in composition. (2) **Équipe complète** — validated, no empty slots, no declined in slots, all filled slots confirmed. (3) **À compléter** — validated and at least one empty slot. (4) **À vérifier** — validated and at least one slot has a declined player (and no empty slots). (5) **Confirmations en cours** — validated, no empty slots, no declined in slots, not all confirmed. (6) **En préparation** — has selection but not validated (message differs for managers vs non-managers).
  - **Priority rule:** If there is any empty slot, the status is À compléter (evaluated before À vérifier).
  - **Full message strings and source of truth:** See [docs/v1/technical/composition-status-messages.md](docs/v1/technical/composition-status-messages.md). Implementation: [SelectionModal.vue](legacy/src/components/SelectionModal.vue) (`compositionStatus` computed).

- **Composition history statistics – selected vs available (Play, Decorum, Volunteer)**
  - In the **composition history view** (CastsView: table of players × events with optional stats columns), the **Play (Jeu)**, **Decorum**, and **Volunteer** stats columns today show only the **number of times** the player was selected in each category.
  - **Evolution:** Each of these columns will also show the **number of times the player was available** for that category, in the form **selected/available** (e.g. `2/7`). Example: "2/7" = selected twice out of 7 times they were available for play.
  - **Optional:** When space allows, display below the fraction a **rounded percentage** (e.g. ~29%) so users can compare how often expectations (game, decorum, or volunteer) were met relative to availability.
  - **Denominator (available):** For each category, "available" is the number of (non-archived) events where the player had indicated availability for that category: for **Play**, availability for role `player`; for **Decorum**, availability for at least one of mc, dj, referee, assistant_referee, coach; for **Volunteer**, availability for role `volunteer`. Event scope (e.g. only events with a confirmed cast, or all non-archived) must align with the current selection-count scope when implemented.
  - **CSV export (composition history):** The **Exporter** button in CastsView downloads a CSV aligned with the on-screen stats and event grid. **Annual stats columns** and **month columns** use `selections/available (rounded %)` when the player had at least one availability in that category (e.g. `2/7 (29%)`); empty when both counts are zero. **Per-event columns** show the full role label when the player was selected; otherwise `Dispo (J, DJ, MC, …)` with role abbreviations (distinct from selection labels: J=Joueur, A=Arbitre, AA=Assistant arbitre, B=Bénévole, C=Coach, L=Lumière, R=Régisseur, etc. — see `ROLE_EXPORT_ABBREVIATIONS` in [legacy/src/services/storage.js](legacy/src/services/storage.js)) when the player declared availability (including past events and confirmed casts where the grid shows `-`); `Décliné (MC, …)` when the player declined a proposed role (from `cast.declined`, same abbreviations); `Non dispo`; or `-` when not answered.
  - **Code reference:** Stats table and `calculatePlayerRoleStats` → [legacy/src/components/CastsView.vue](legacy/src/components/CastsView.vue). Availability and roles → [legacy/src/services/playerAvailabilityService.js](legacy/src/services/playerAvailabilityService.js). Export: `exportToExcel` in CastsView.

- **Composition history – availability cells with role emojis (upcoming events)**
  - In the **composition history view** (CastsView), the **availability cells** for **upcoming events** ("Spectacle à venir") currently show dispos in a **purely textual** summary: e.g. "Dispo pour : Bénévole (34%), Assistant.e (11%), Régisseur.euse (33%)" (role labels and percentages).
  - **Evolution:** Use a **mix of text and emojis**. For each role, display the **emoji** that corresponds to that role (e.g. 🎭 for player, 🤝 for volunteer, 🎤 for MC, 🎧 for DJ, etc.) instead of the full role label in text; keep the **percentages** (chances). The result is more **compact**, **easier to read**, and **visually recognizable** while still showing availability roles and percentages.
  - Exact format (e.g. "Dispo pour : 🤝 34% 💁 11% 🎬 33%" or emoji + short label where space allows) and accessibility (tooltip with role names) to be defined at implementation time; the intent is a more visual and compact display than the current all-text line.
  - **Code reference:** Availability cell content for roles and chances → [legacy/src/components/SelectionCell.vue](legacy/src/components/SelectionCell.vue) (block "Dispo pour :" with `rolesAndChances`). Role → emoji mapping → [legacy/src/services/storage.js](legacy/src/services/storage.js) (`ROLE_EMOJIS`).

---

## Event details as full screen (specification)

This section specifies the **event details as full screen** slice in full. It describes required behaviour and contracts so that a future development plan can be derived without ambiguity. Implementation order is not defined here (see PLAN.md when the slice is scheduled).

### Purpose and scope

- **Goal:** Replace the current event-details **modal** (popup) with a **full-screen view** at a stable, shareable URL. The same content is shown in-page, with the same global layout as the season grid (header above, footer below). Users and notifications can link directly to an event.
- **Scope:** Route and URL contract; layout and header behaviour; content and entry points; all producers of event links (in-app, email, push, WhatsApp, calendar, Cloud Functions). **No backward compatibility** for the old URL form (`?event=...&modal=event_details`); old links may redirect to the new URL.

### Route and URL contract

- **Canonical path:** `/season/:slug/event/:eventId` (path only; no required query).
- **Optional query parameters** (semantics the event screen must honour):
  - `tab=compo` — open or focus the Composition tab.
  - `tab=team` (or equivalent) — open or focus the Disponibilités tab.
  - `showConfirm=true` — when used with composition context: open or emphasise the participation confirmation flow (e.g. for “Confirmer ma participation” links in emails/WhatsApp).
  - `showAvailability=true` — open or focus the Disponibilités tab and/or availability entry (e.g. from magic link or reminder).
  - `notificationSuccess=1`, `email`, `playerName`, `eventId` — show the existing “notification activated” success toast when present.
  - `action=desist&player=...` — if used by reminder or magic flows: handle as specified for that flow (e.g. open event and optionally prefill or open desist action).
- **Redirection:** If the user reaches `/season/:slug` with `?event=:id&modal=event_details` (or equivalent old form), the app must redirect to `/season/:slug/event/:id`, preserving any other query parameters that still apply.

### Screen layout

- **Structure:** Same as the season grid: one **header** (sticky or fixed as today), one **main content** area (event details), one **footer** (same AppFooter as on the grid). No overlay or modal chrome around the event content.
- **Header in “event mode”** (when the active route is the event screen):
  - **Back control (chevron):** Navigates to the **season** (`/season/:slug`), not to the seasons list. One level up in hierarchy.
  - **Left area (icon):** Shows the **event type icon** (same semantic as the current event-type badge in the modal), not the season logo. Optional: click may navigate to season or do nothing; product decision.
  - **Center (title):** Shows the **event title**, not the season name.
  - **Right area:** Unchanged — for admins, the administration entry; for all users, the account/profile entry (same as on the season grid).
- **Header when not on event route:** Unchanged — current SeasonHeader behaviour (back to seasons list, season logo, season name).

### Content of the event screen

- **Content:** The same functional content as the current event-details **modal** (event title and icon in the header only — not duplicated in the main area; status badge and event actions menu (three-dots: Share, Notifications, Announce, Edit, Archive, Delete) in the **Infos** tab only; date/location, description, add-to-calendar, maps in Infos; tabs Infos / Dispos / Équipe; composition or EventRoleGroupingView in Équipe/Dispos). No modal chrome: full-width black content area, no close button in content (back is in header).
- **Primary actions:** Back chevron in the header navigates to the season (`/season/:slug`). There is no "Fermer" button in the event content. Composition is reached only via the **Équipe** tab (no footer "Composition Équipe" button on the full-screen event view).
- **Tabs and focus:** On load, the active tab and any auto-opened modal (e.g. confirmation) must respect the URL query parameters above.

### Entry points (opening event details)

- **In-app:** Any action that currently opens the event-details **modal** (e.g. click on an event in grid/timeline/events list, “See event” from player modal, “Open event” from admin) must instead **navigate** to `/season/:slug/event/:eventId`, with optional query (e.g. `tab=compo`, `showAvailability=true`) when the current UX expects a specific tab or state.
- **Direct link / share:** Copy-link and share actions must produce the canonical URL (with optional query). No production of the old `?event=...&modal=event_details` form.

### Links sent externally (emails, push, WhatsApp, calendar, Cloud Functions)

- **Requirement:** Every link that is intended to bring the user **directly to an event** must use the canonical form `{origin}/season/{slug}/event/{eventId}` and may append any of the query parameters defined above so that behaviour (tab, confirmation, availability) is preserved.
- **Channels to cover:**
  - **Email:** Availability request, reminder, cast/selection notification, confirmed-team notification, notification activation, and any other email that contains an event link. Templates receive `eventUrl` (and where relevant `confirmUrl`) from callers; callers must pass the canonical URL (and e.g. `confirmUrl` = event URL + `?tab=compo&showConfirm=true`).
  - **Push notifications (FCM):** Payloads that include a URL for the event must use the canonical URL (and query if needed). Decast or other “no” flows that today use a different URL (e.g. magic) remain valid; only the “main” event link must be canonical.
  - **WhatsApp (and copy-paste) messages:** The pre-filled message (event announcement, availability, cast, confirmed team) must include the canonical event URL; “Confirmer” links must use the event URL with `?tab=compo&showConfirm=true` (or equivalent).
  - **Calendar (Google, Outlook, Apple):** The “details” or “more info” link in the added calendar event must point to the canonical event URL.
  - **Cloud Functions:** Any function that sends email, push, or other notification containing an event link (e.g. reminders, availability reminders, cast notifications) must build the URL as `{baseUrl}/season/{slug}/event/{eventId}` (and add query when the template expects it). No use of the old query-based form for the main event link.
- **Inventory for implementation:** The following areas produce or consume event URLs and must be updated to emit or handle only the new form: GridBoard (share/copy, open-details), MessagePreview (eventDirectLink, confirmUrl, WhatsApp text), SeasonAdminPage (open event), PlayerModal (link to event), emailService (eventUrl, directConfirmUrl, noUrl for push if applicable), calendarService (event link in description), MagicLink (redirect after magic flow), notificationActivation, notificationsService; and in Cloud Functions: `functions/index.js` (reminders, availability reminders, any email/push that includes eventUrl), with templates in `functions/emailTemplates.js` receiving the new URL from callers.

### Acceptance criteria (event details as full screen)

- **Given** a valid season slug and event id, **when** the user opens `/season/:slug/event/:eventId`, **then** the event details are shown in a full screen (header + content + footer), with no modal overlay; the header shows event icon and title, and the back chevron goes to the season.
- **Given** the same URL with `tab=compo` (or `showConfirm=true`), **when** the page loads, **then** the Composition tab is active (and the confirmation flow is opened or emphasised if `showConfirm=true`).
- **Given** the same URL with `showAvailability=true`, **when** the page loads, **then** the Disponibilités tab or availability entry is focused as specified by current modal behaviour.
- **Given** any email or push notification that contains a link to an event, **when** the user follows that link, **then** the link is of the form `/season/:slug/event/:eventId` (and optional query) and the user lands on the event screen with the correct tab/state.
- **Given** a user on the season grid or timeline, **when** they click to open an event’s details, **then** the app navigates to `/season/:slug/event/:eventId` (no modal).
- **Given** the user is on the event screen, **when** they click the back chevron in the header, **then** they are taken to `/season/:slug`.

---

## Acceptance criteria (critical flows, Given/When/Then style)

**AC1 – Home and season access**

- **Given** the app is deployed and reachable, **when** a user opens `/`, **then** the app loads and the user can navigate (e.g. to seasons or help) without error.
- **Given** a valid season slug, **when** a user opens `/season/:slug`, **then** the season grid (events, players) is visible according to Firestore rules (public read in current rules).

**AC2 – Admin guard**

- **Given** a user is not authenticated, **when** they request `/season/:slug/admin`, **then** they are redirected to 404 (or equivalent) and do not see admin data (observed in `main.js` router guard).
- **Given** a user is authenticated but not admin for that season and not Super Admin, **when** they request `/season/:slug/admin`, **then** they are redirected to 404 (or equivalent).

**AC3 – Draw and cast**

- **Given** a season has events and players with availability, **when** an admin runs the selection (draw), **then** a cast is produced per event and stored (e.g. in `casts` subcollection); players can see and update their cast status (confirm/decline).

**AC4 – Auth**

- **Given** valid credentials (or magic link), **when** the user signs in, **then** they are authenticated and can access auth-only features (e.g. set availability, admin if permitted).

---

## OPEN QUESTIONS + ASSUMPTIONS

- **ASSUMPTION:** "Super Admin" is determined server-side (e.g. Cloud Function or stored list); the exact list and lifecycle are not fully inferred from repo scan.
- **OPEN QUESTION:** Intended behaviour when Firestore is unreachable (e.g. full offline) for draw and admin is not specified.
- **ASSUMPTION:** Current Firestore rules (public read on seasons and subcollections) are intentional for "view seasons and events" without login; any lock-down would be a product/security decision.
- **OPEN QUESTION:** Whether GitHub Pages is still a supported deploy target or legacy; deployment authority is Firebase Hosting per CI and firebase.json.
- **Resolved (2026-06-04):** Availability reminder audience = non-responders (`unknown`) only; announcement = full roster — see DOMAIN.md and tech spec **6.17**.
- **ASSUMPTION (V2 share/announce):** Multiple organizers on the same event share the same visibility into delivery log / last-send state; no per-organizer private send history.
