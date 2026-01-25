# Functional specification (HatCast)

**Location:** Repository root. Functional intent is global; root keeps SPEC easy to find for both humans and agents.

This document defines **what** the system does today and what must remain true. It does not specify implementation order or tasks (see PLAN.md).

---

## Vision (short)

HatCast is a web application for organising improvisation shows: managing **seasons**, **events**, and **players**; letting players indicate **availability**; running a **fair, weighted draw** to form **casts** (who plays for each event); and notifying participants. Data and auth are backed by Firebase (Firestore, Auth, Cloud Functions). The app is a single-page application (Vue 3) with PWA support and optional push notifications.

---

## Actors / personas

- **Anonymous visitor:** Can view public content (e.g. landing, help). Cannot access season data that requires auth.
- **Player (participant):** Has a **player** profile linked to a season (via claim or invite). Can set availability per event, view casts, and confirm or decline presence in a cast. May authenticate via email/password, magic link, or Google (observed in `src/services/firebase.js`, auth flows).
- **Season creator / admin:** Can create and edit a season, its events, and its players; run the draw; announce casts; manage invitations. Access is controlled by Firestore `seasons/{id}/admins` and/or Super Admin (Cloud Function) (observed in `src/services/permissionService.js`, `main.js` router guard).
- **Super Admin:** Global admin (e.g. for support). Granted via Cloud Function; can access any season admin (observed in `permissionService.js`, `functions/adminFunctions.js`).

---

## Core user journeys (high-level, testable)

1. **View seasons and events:** User opens the app, sees or navigates to a season, sees a list of events and players (grid). No auth required for read in current rules (Firestore read public for seasons and subcollections).
2. **Join a season (player):** User follows a join/invite link (e.g. `/season/:slug/join` or `/accept-invitation`), authenticates if needed, claims or is assigned a player, then can set availability.
3. **Set availability:** Authenticated player selects events and sets availability (e.g. available / unavailable). Data stored in Firestore under the season (e.g. `availability` or player subcollections); observed in `src/services/storage.js`, `playerAvailabilityService.js`.
4. **Run draw and announce cast:** Season admin runs the selection (weighted random draw based on past participation). System produces a **cast** per event (who is selected). Admin can announce; players can see cast and confirm/decline. Observed in `selectionService.js`, `castService.js`, `chancesService.js`.
5. **Account and auth:** User signs in (email/password, magic link, Google) or uses password reset. Optional: link account to a player (claim), manage preferences. Observed in auth views and `authState.js`, `magicLinks.js`.
6. **Season admin:** Admin opens `/season/:slug/admin`, manages season, events, players, invitations. Guarded by router + permission check (observed in `main.js` router.beforeEach, `permissionService.js`).
7. **Notifications (optional):** Push (FCM) and/or email reminders. User opts in; app writes to `pushQueue` / `reminderQueue`; Cloud Functions process. Observed in `functions/index.js`, `notifications.js`, `reminderService.js`.

**Code references (critical flows):** Draw/selection → [src/services/selectionService.js](src/services/selectionService.js), [src/services/chancesService.js](src/services/chancesService.js). Cast read/write → [src/services/castService.js](src/services/castService.js), [src/services/storage.js](src/services/storage.js). Availability → [src/services/playerAvailabilityService.js](src/services/playerAvailabilityService.js), [src/services/storage.js](src/services/storage.js). Auth → [src/services/firebase.js](src/services/firebase.js), [src/services/authState.js](src/services/authState.js). Admin guard → [src/main.js](src/main.js) (router.beforeEach), [src/services/permissionService.js](src/services/permissionService.js).

---

## Non-functional constraints (observed)

- **Online-first:** App assumes network; Firestore has offline cache but critical flows (auth, draw, admin) expect connectivity. No hard offline-only mode specified in code.
- **Hosting:** Deployed to Firebase Hosting (production and staging targets); build is static `dist` from Vite (see `firebase.json`, CI workflows).
- **Devices:** Responsive UI; mobile and desktop. PWA install supported (manifest, service worker in `src/service-worker.js`, `vite.config.js`).
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

**Should have (present in codebase):**

- Push notifications (FCM) and reminder queue (email).
- Magic links and account-related flows.
- Navigation/preference tracking (e.g. `userNavigation`).
- Player protection (e.g. lock player to account).

**Could have / minimal presence:**

- GitHub Pages deploy (workflow exists but secondary to Firebase Hosting).
- Optional features (e.g. filters, scroll behaviour) documented in `docs/user/`.

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
  - The event-details view has **two or three tabs**, labeled in the UI: (1) **Infos** (first), (2) **Dispos**, (3) **Équipe** (shown only when a composition exists for the event). URL and code still use `tab=info`, `tab=team`, `tab=compo`.
  - **Default tab:** When opening the event-details modal **without** a tab specified in the URL, the **first tab (Infos)** is displayed.
  - **URL parameter:** A query parameter (e.g. `tab`) allows opening a specific tab when opening event details via URL (e.g. `tab=info`, `tab=team`, `tab=compo`), so deep links can target Infos, Dispos, or Équipe.
  - No other change to existing behaviour (availability popup, composition display, permissions) is specified by this slice.
  - **Code reference:** Event-details tabs UI → [src/components/GridBoard.vue](src/components/GridBoard.vue).

- **Inline composition in event-details Composition tab (no separate popup)**
  - Composition management is done **only** in the **Composition** tab of the event-details modal. There is **no separate composition popup** (SelectionModal is no longer opened as an overlay).
  - The Composition tab is **always available** in event details for the event (e.g. always show the tab, including when there is no cast yet), so users can run a draw or view empty state from the tab. Visibility of the tab may still depend on user role or context where event details are shown (e.g. logged-in only, as today for the tabs block).
  - The Composition tab contains **all** composition features that currently exist in the composition popup: run draw (Tirage), simulations (Simuler + algorithm choice), validate (Valider), unlock (Déverrouiller), announce (Annoncer la compo), send via WhatsApp (Envoyer), reset (Effacer), fill cast (Remplir), manual slot edit, declined-players handling, status badges, PIN when required, and opening of EventAnnounceModal / DrawAnnounceModal / HowItWorks as needed. Same permission and state rules apply (e.g. `canManageCompositionValue`, `canCasterEditManually`, confirmation/organizer state).
  - Slot click in the Composition tab continues to open the confirmation flow (confirm/decline) for the selected player as today; no change to that behaviour.
  - Entry points that today open the composition popup instead open or focus **event details with the Composition tab selected**: e.g. "Composition Équipe" in the event-details footer is removed (no button that opens a popup); TimelineView and similar triggers open event details on the Composition tab; URL `modal=selection` is treated like opening event details with `tab=compo` (or equivalent). No separate modal layer for composition.
  - User experience is a single place (event details) with one tab (Composition) where users see and perform only the actions their permissions allow.

- **Slot click in composition modal for participation confirmation**
  - In the **composition modal** (SelectionModal), clicking on a filled slot (a person in the composition) opens the **participation confirmation** popup (same as in the event-details Composition tab).
  - **Permissions:** An **administrator** (e.g. can edit the event) can open the confirmation popup for any slot (to confirm, decline, or set to pending for any player). The **concerned player** can open it only for **their own** slot (to confirm or decline their own participation). Other users do not open the popup (or see an error if they try).
  - Behaviour and UI of the confirmation popup are unchanged (confirm / decline / pending); only the entry point (slot click in the modal) is added.

- **Event-details Équipe tab – compact layout on mobile**
  - In the event-details **Équipe** (Composition) tab, the list of composition slots is displayed in a **more compact layout on mobile**: **two slots per line** instead of one slot per line.
  - Behaviour and information shown for each slot are unchanged (avatar, player name, role, status, click for confirmation, etc.). Only the grid/layout is adjusted so that on small viewports (mobile), two slots sit side by side per row, similar to the Dispos tab.
  - Reference: the Dispos tab already uses this pattern in `EventRoleGroupingView` (e.g. `grid-cols-2` at base); the Composition slots grid in GridBoard currently uses `grid-cols-1` for the smallest breakpoint.

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

- **Content:** The same functional content as the current event-details **modal** (title, status badge, date/location, description, add-to-calendar, maps, tabs Composition / Disponibilités, composition slots or EventRoleGroupingView, availability list, actions such as Share, Notifications, and for admins: Announce, Edit, Archive, Delete). No reduction or addition of features; only the container changes (in-page instead of modal).
- **Primary actions:** “Fermer” (or equivalent) must navigate back to the season (`/season/:slug`). “Composition Équipe” (or equivalent) continues to open the composition flow (tab or modal as today); entry point may be in the event screen’s footer or body.
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
- **Given** the user is on the event screen, **when** they click the back chevron or “Fermer”, **then** they are taken to `/season/:slug`.

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
