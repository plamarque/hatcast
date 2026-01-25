# Plan / delivery tracking (HatCast)

**Location:** Repository root. This is the single place for "when" and "in which order"; kept at root so it is easy to open with AGENTS, SPEC, and ARCH.

Slices are incremental deliverables to stabilise and evolve the repo. SPEC.md describes *what*; this plan describes *when* and *how* to get there.

---

## Current status summary

- **Normative docs (v0.1):** AGENTS.md, SPEC.md, DOMAIN.md, ARCH.md, PLAN.md, DEVELOPMENT.md, and `docs/adr/` are in place. Align code and behaviour with them over time.
- **Application:** Single Vue 3 SPA; Firebase backend; CI deploys to Firebase Hosting (staging/production). Tests: Playwright + custom runners; some envs require `test:with-server` when dev server cannot be started by Playwright.
- **Known gaps:** Some docs in `docs/` are topic-heavy and not yet cross-referenced with SPEC/DOMAIN. No formal "definition of done" for feature work beyond "tests pass and deploy works."

---

## Slices (incremental deliverables)

### Slice 0: Normative docs baseline (current)

- [x] AGENTS.md created
- [x] SPEC.md created
- [x] DOMAIN.md created
- [x] ARCH.md created
- [x] docs/adr/ index + 6 ADRs created
- [x] PLAN.md created
- [x] DEVELOPMENT.md created
- [x] Step 2 consistency report done: see `docs/STEP2-CONSISTENCY.md` (contradictions, OPEN QUESTIONS, recommended next slice). Quick doc fixes are deferred to Slice 1.

**DoD:** All normative files exist; ADR index lists 6 ADRs; no production code changed.

---

### Slice 1: Align README and one-time doc fixes

- [x] Update README: remove or correct Netlify/Vercel sentence; set deployment authority to Firebase + CI.
- [x] Update README structure section: replace Grille.vue with GridBoard.vue and current views/ structure (see `src/main.js`, `src/views/`, `src/components/GridBoard.vue`).
- [x] Add a short "Docs for agents and maintainers" paragraph in README linking to AGENTS.md, SPEC.md, ARCH.md, PLAN.md, DEVELOPMENT.md.
- [x] Fix audit doc link (README → docs/technical/AUDIT.md). Add normative-docs pointer in docs/README.md.

**DoD:** README matches current entrypoints and deployment; links to normative docs work. No behaviour change.

---

### Slice 2: Consistency and open questions

- [x] Run Step 2 checks: list contradictions between new docs and code; list OPEN QUESTIONS that could not be inferred from code. (Done in `docs/STEP2-CONSISTENCY.md`; updated post-Slice 1.)
- [x] For each contradiction: either update the doc or open a tracked issue/task; do not silently change behaviour. (Contradictions 1–2 resolved in Slice 1; 3 resolved by extending `.env.example` and README→DEVELOPMENT link.)
- [x] Add a "Known open questions" section to PLAN (below) for visibility.

**DoD:** Contradictions documented and resolved or tracked; OPEN QUESTIONS visible in a normative doc.

---

### Slice 3: Test and CI baseline (minimal, no refactor)

- [x] Ensure default `npm test` runs a minimal smoke set: `tests/basic.spec.js` (home page load, navigation, route `/seasons`). Document in DEVELOPMENT.md how to run tests with existing server (`test:with-server`) and that deploy workflows do not run Playwright.
- [x] No disabling or removing of existing tests; no behaviour change to "fix" CI.
- [x] Add one spec-compliance check: route `/seasons` returns 200 and body visible (`tests/basic.spec.js`).

**DoD:** DEVELOPMENT.md describes test commands, minimal smoke, and CI note; one critical-route test added; no new flakiness introduced.

---

### Slice 4: Doc–code cross-links (lightweight)

- [x] In SPEC and DOMAIN, add short "Code references" lines for critical flows (selection, cast, availability, auth, admin) pointing to key files.
- [x] In ARCH, make component table "Location / entry" cells use markdown links to files/dirs.
- [x] docs/README.md already has full normative docs pointer (AGENTS, SPEC, DOMAIN, ARCH, PLAN, DEVELOPMENT) from Slice 1.

**DoD:** Readers can jump from normative docs to code for main flows and components; docs/README does not contradict root normative set.

---

### Slice 5: Event-details Availability tab – row click to open availability popup

- [x] In `EventRoleGroupingView.vue`, remove the `AvailabilityCell` from both layouts (all players and by role).
- [x] Make the whole player row/card open the availability modal (reuse existing `openAvailabilityModal`); build the same payload as the cell would emit for `show-availability-modal`.
- [x] In the by-role layout, ensure the two percentage elements use `@click.stop` so they open the chance-detail popup(s) only and do not trigger the row’s availability open.
- [x] Respect disabled state when event is archived; protected players keep existing permission checks when the modal is opened.

**DoD:** SPEC behaviour satisfied (Availability tab has no availability cell; row click opens availability popup; percentage clicks open chance popup only); existing tests pass.

---

### Slice 6: Event-details Info tab – three tabs, default Info

- [x] In [src/components/GridBoard.vue](src/components/GridBoard.vue), turn the collapsible "details" block (content currently controlled by `showEventDetailsSection`) into the content of a **first tab** (e.g. "Info" or "Détails"). Remove the "Plus de détails" / "Masquer les détails" toggle; details are always available in the Info tab.
- [x] Reorder/add tabs in the event-details modal: (1) **Info** (first), (2) **Disponibilités**, (3) **Composition**. (Slice 8 made the Composition tab always visible with an empty state when no draw.)
- [x] When opening the event-details modal **without** a `tab` query parameter, show the **Info** tab by default (replace current logic that defaults to composition or team via `getDefaultTabForEvent()`).
- [x] Support URL query parameter `tab` so that opening event details via URL (e.g. `?event=...&modal=event_details&tab=info|team|compo`) opens the requested tab; align with existing `forceTab` / `tabParam` handling and extend for `info` if needed.
- [x] Update URL when user switches tabs (if the app already syncs tab to URL) so that `tab` reflects the active tab for sharing/bookmarking.
- [x] No change to existing behaviour: availability popup, composition display, permissions, and content of Disponibilités/Composition tabs remain as today.

**DoD:** SPEC "Event-details tabs – Info as first tab" behaviour satisfied; default tab is Info when no `tab` param; `tab` param selects Info, Disponibilités, or Composition; existing tests pass; build succeeds.

---

### Slice 7: Slot click in composition modal – open participation confirmation

- [x] In [SelectionModal.vue](src/components/SelectionModal.vue): Make the **filled slot content** (avatar + name + role) clickable. On click, **emit** an event (e.g. `slot-confirmation-click`) with slot payload: playerName, playerId, roleKey (e.g. `slot.role`), roleLabel, roleEmoji, playerGender (e.g. `getPlayerGenderFromName(slot.player)`), selectionStatus (e.g. `getPlayerSelectionStatus(slot.player)`). Do not trigger this when the user clicks the "×" (clear) button — keep `@click.stop` on the clear button so only the slot area triggers the new behaviour.
- [x] In [GridBoard.vue](src/components/GridBoard.vue): **Listen** for the new event on `SelectionModal` (e.g. `@slot-confirmation-click="handleSelectionModalSlotConfirmationClick"`). In the handler: use `selectionModalEvent` for event id/title/date; call `canModifyConfirmationStatus(slotData.playerName, slotData.playerId, selectionModalEvent.id)`; if false, show the same error message as in `handleCompositionSlotClick`; if true, get `getAvailabilityData(slotData.playerName, selectionModalEvent.id)` for the comment, build the same confirmation payload as in `handleCompositionSlotClick` (playerName, playerId, playerGender, eventId, eventTitle, eventDate, assignedRole, availabilityComment, currentStatus, seasonId), and call `openConfirmationModal(data)`.
- [x] Reuse existing [ConfirmationModal](src/components/ConfirmationModal.vue) and handlers in GridBoard (`handleConfirmationConfirm`, `handleConfirmationDecline`, `handleConfirmationPending`); no change to ConfirmationModal. After the user confirms/declines/pending, cast data updates via existing flow and SelectionModal receives updated `current-selection` via props.

**DoD:** In the composition modal, clicking a filled slot opens the participation confirmation popup when the user is admin or the slot is their own; otherwise an error is shown. Behaviour matches the Composition tab. Build succeeds; existing tests pass or are updated as needed.

---

### Slice 8: Always show Composition tab in event details

- [x] In [GridBoard.vue](src/components/GridBoard.vue), remove the `v-if="hasCompositionForSelectedEvent"` condition from the Composition tab **button** (around line 1013) so the Composition tab is always visible whenever the tabs block is shown (i.e. when `currentUser`). Leave the tabs block itself conditioned on `currentUser` so anonymous users are unchanged.
- [x] Change the Composition tab **content** wrapper so it renders when the Composition tab is active: use `v-if="eventDetailsActiveTab === 'composition'"` (and no longer require `hasCompositionForSelectedEvent` for the outer wrapper).
- [x] Add an explicit **empty state** when there is no composition yet (`!hasCompositionForSelectedEvent`): display a neutral message (e.g. "Aucun tirage pour le moment" or "La composition s'affichera ici une fois le tirage effectué") for both admin and non-admin. No slots, no action buttons in this state; admins continue to use the footer "Composition" button to open the composition modal and run the draw.
- [x] Keep all **existing** content branches when `hasCompositionForSelectedEvent` is true: (1) composition not validated and non-admin: "La composition n'est pas encore validée par l'organisateur"; (2) admin or validated: composition slots grid; (3) existing info banners. No change to permissions or to the Disponibilités tab.

**DoD:** For a logged-in user, the Composition tab is always visible in event details. When there is no draw yet, the tab shows the empty-state message. When a composition exists, behaviour is unchanged (same messages and slots as today). Anonymous users still do not see the tabs block. Build succeeds; existing tests pass or are updated as needed.

---

### Slice 9: Inline composition – move composition into event-details tab, remove popup

- [x] Make the **Composition tab** in the event-details modal host the full composition UI (draw, simulate, validate, unlock, announce, WhatsApp, reset, fill, manual edit, declined section, status, PIN, sub-modals). Reuse or embed the logic and UI currently in [SelectionModal.vue](src/components/SelectionModal.vue) (e.g. as an inline component or by inlining its content into [GridBoard.vue](src/components/GridBoard.vue) Composition tab). Preserve all permission checks and state handling.
- [x] **Always show** the Composition tab in event details (remove the condition that only shows it when `hasCompositionForSelectedEvent`), so users can open the tab and run a first draw or see empty state. Keep visibility of the tabs block itself as today (e.g. when `currentUser`).
- [x] Remove the **composition popup** flow: stop opening SelectionModal as an overlay. Remove or repurpose the "Composition Équipe" / "Composition" buttons in the event-details footer (desktop and mobile) so they no longer open a modal; e.g. remove them or make them switch to the Composition tab.
- [x] Update **entry points**: (1) TimelineView and any other caller of `show-composition-modal` / `openSelectionModal` should open event details with the Composition tab active instead of opening the popup. (2) URL `modal=selection` should be handled by opening event details with the Composition tab (e.g. same as `modal=event_details&tab=compo`). (3) After a draw triggered from outside the modal (e.g. drawProtected), do not reopen SelectionModal; refresh event details / Composition tab if it is open.
- [x] Ensure **slot click** in the Composition tab still opens the confirmation modal (confirm/decline) with the same permissions and data as today. Sub-modals (EventAnnounceModal, DrawAnnounceModal, HowItWorksModal, PIN) remain available from the Composition tab as today.
- [x] Remove or deprecate the **SelectionModal** component as a popup (delete the component only if its content is fully inlined or moved to a dedicated inline component; otherwise keep the component but use it inline inside the tab without overlay).

**DoD:** No composition popup is ever shown; all composition actions are available in the event-details Composition tab with the same permissions and behaviour; Composition tab is always visible in event details; entry points (footer, TimelineView, URL) open event details on Composition tab; existing tests updated or added as needed; build succeeds.

---

### Slice 10: Event details as full screen (canonical URL)

Specification: SPEC.md, section **« Event details as full screen (specification) »**. Detailed requirements and inventory for implementation: plan file `event_details_as_full_screen_a1e84a5e.plan.md` (specification plan, not a step-by-step dev plan). When scheduling this slice, derive the development plan from that document and from SPEC.

- [ ] **Route and layout:** When the route is `/season/:slug/event/:eventId`, show event details as a **full screen** (header + content + footer), not as a modal. Do not open the event-details modal when `route.params.eventId` is set; use the same content block in-page. Support query params: `tab`, `showConfirm`, `showAvailability`, `notificationSuccess` (+ email, playerName, eventId), `action=desist&player=...` as specified in SPEC.
- [ ] **Header (event mode):** SeasonHeader receives event context (e.g. `isEventScreen`, `eventTitle`, `eventIcon`). Back chevron navigates to `/season/:slug`; left shows event icon; center shows event title; right unchanged (admin + account).
- [ ] **Navigation:** Replace all “open event details” actions (grid, timeline, admin, player modal, etc.) with navigation to `/season/:slug/event/:eventId` (with query if needed). “Fermer” and back from event screen go to `/season/:slug`. Redirect `/season/:slug?event=...&modal=event_details` to the canonical event URL.
- [ ] **Links sent (client):** Update every event-URL producer to use canonical form: GridBoard (share/copy), MessagePreview (eventDirectLink, confirmUrl), SeasonAdminPage, PlayerModal, emailService (eventUrl, directConfirmUrl), calendarService, MagicLink, notificationActivation, notificationsService. See SPEC and the specification plan for the full list.
- [ ] **Links sent (Cloud Functions):** In `functions/index.js`, ensure all event links (reminders, availability reminders, etc.) use `{baseUrl}/season/{slug}/event/{eventId}` (and query when needed). Templates in `functions/emailTemplates.js` receive the new URL from callers.
- [ ] **WhatsApp / copy-paste:** MessagePreview and text templates use canonical event URL and confirm URL with `?tab=compo&showConfirm=true` where applicable so shared messages remain functional.

**DoD:** SPEC “Event details as full screen (specification)” satisfied; all acceptance criteria in that section pass; no event link is sent in the old form; build succeeds; existing tests pass or are updated.

---

### Slice 11: Event-details Équipe tab – compact mobile layout

- [x] In [GridBoard.vue](src/components/GridBoard.vue), change the composition slots grid from `grid-cols-1` to `grid-cols-2` at the smallest breakpoint (mobile) so that **two slots per line** are shown on small viewports, matching the Dispos tab pattern in `EventRoleGroupingView.vue`. Keep `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (or adjust for consistency). No change to `CompositionSlot` content or behaviour.

**DoD:** On mobile viewports, the Équipe tab shows two composition slots per row; all existing information and interactions (click, confirm/decline, status) remain; build succeeds; existing tests pass.

---

### Slice 12: Composition history stats – selected/available and optional %

- **Spec:** SPEC.md, slice « Composition history statistics – selected vs available (Play, Decorum, Volunteer) ».
- **Summary:** In CastsView stats columns (Play, Decorum, Volunteer), display selected/available (e.g. 2/7) and optionally a rounded percentage below. Enables comparison of how often players were selected vs how often they were available.
- No development plan yet; to be scheduled later.

---

### Slice 13: Composition history – availability cells with role emojis

- **Spec:** SPEC.md, slice « Composition history – availability cells with role emojis (upcoming events) ».
- **Summary:** In CastsView availability cells for upcoming events, show roles with emojis + percentages instead of full textual labels, for a more visual and compact display.
- No development plan yet; to be scheduled later.

---

## Definition of Done / quality gates (per slice)

- **Doc-only slices:** No production code or config change; only markdown and links. Lint/format markdown if the project has a markdown rule.
- **Slices that touch config or tests:** `npm run build` still succeeds; existing Playwright (or agreed) test suite still passes; no new secrets committed.
- **Any slice:** No removal or rewriting of normative content without updating AGENTS/SPEC/DOMAIN/ARCH/PLAN consistently. Conflicts: report and resolve (see AGENTS.md).

---

## Risks / unknowns

- **Playwright web server start:** In some environments (e.g. sandboxed CI or agents), starting the dev server on a port may fail (EPERM). Mitigation: document and use `test:with-server` with a pre-running server; or run tests in an environment that allows port binding.
- **Firestore indexes:** Adding new queries may require new composite indexes; deploy may fail until `firestore.indexes.json` is updated and deployed. Unknown: whether all prod queries are already covered.
- **Super Admin list:** Location and update process (code vs Firebase/backend config) are not fully documented in repo; changes may require code or console access.
- **GitHub Pages:** Role unclear (secondary deploy or legacy). If deprecated, consider removing or archiving `pages.yml` and deploy script references to avoid confusion.

---

## Known open questions

These could not be inferred from code alone; they are tracked here and in `docs/STEP2-CONSISTENCY.md`. Resolve when making related changes or when product decisions are needed.

- **Super Admin:** Where the list is stored (Firebase project config, Firestore doc, or code) and how it is updated. Code shows a callable or server-side check; the list itself is not in repo.
- **Offline behaviour:** Whether the product intends full offline support for draw/admin or only cache-for-read. Code has offline listeners and cache but no explicit "offline mode" guarantee in comments.
- **GitHub Pages:** Whether `pages.yml` and the `deploy` script (gh-pages) are still supported or legacy. firebase.json defines two hosting targets; pages.yml is workflow_dispatch-only.
- **Invitation lifecycle:** Expiry and single-use semantics for `invitations` and accept flow. Logic is in code but not summarised in one place.
- **Exact availability schema:** Subcollection path and field names for availability are used in `storage.js` and `playerAvailabilityService.js` but not declared in a single schema doc; DOMAIN mentions the ambiguity.
