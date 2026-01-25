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

- **Event-details tabs – Info as first tab**
  - The content currently shown in the collapsible "details" block (date, location, description, map, add-to-calendar, navigation links) becomes the content of a **first tab**, e.g. "Info" or "Détails".
  - The event-details view has **two or three tabs**: (1) **Info** (first), (2) **Disponibilités**, (3) **Composition** (shown only when a composition exists for the event).
  - **Default tab:** When opening the event-details modal **without** a tab specified in the URL, the **first tab (Info)** is displayed.
  - **URL parameter:** A query parameter (e.g. `tab`) allows opening a specific tab when opening event details via URL (e.g. `tab=info`, `tab=team`, `tab=compo`), so deep links can target Info, Disponibilités, or Composition.
  - No other change to existing behaviour (availability popup, composition display, permissions) is specified by this slice.

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
