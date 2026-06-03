# Plan / delivery tracking (HatCast)

**Location:** Repository root. This is the single place for "when" and "in which order"; kept at root so it is easy to open with AGENTS, SPEC, and ARCH.

Slices are incremental deliverables to stabilise and evolve the repo. SPEC.md describes *what*; this plan describes *when* and *how* to get there.

---

## Current status summary

- **Normative docs (v0.1):** AGENTS.md, SPEC.md, DOMAIN.md, ARCH.md, PLAN.md, DEVELOPMENT.md, and `docs/adr/` are in place. Align code and behaviour with them over time.
- **Monorepo:** Vue 3 SPA (V1) lives under **`legacy/`**; **`apps/web/`** and **`services/api/`** are reserved for the V2 stack. See [docs/shared/technical/MONOREPO.md](docs/shared/technical/MONOREPO.md) and [docs/shared/technical/BRANCH_ENVIRONMENTS.md](docs/shared/technical/BRANCH_ENVIRONMENTS.md).
- **Application:** Firebase backend (Functions, Firestore); CI deploys the **legacy** client build to Firebase Hosting (staging/production). Tests: Playwright + custom runners under `legacy/tests/`; some envs require `test:with-server` when dev server cannot be started by Playwright.
- **Known gaps:** Some docs in `docs/` are topic-heavy and not yet cross-referenced with SPEC/DOMAIN. No formal "definition of done" for feature work beyond "tests pass and deploy works."
- **V2 deploy (Cloud Run + Neon):** Déploiement **development** (push `v2`) en place. Slice **MEP iso-V1** largement **done** (`sprint-status.yaml`). **Prochaine vague :** § **Wave V2.0.0** — polish PWA/compte/modales, pipeline **tag-based** staging→prod, domaine prod **`hatcast.app`** (**OPS-8**), puis **M4** cutover. SCP : [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) (amendement domaine **2026-06-03**). Guide actuel (branche `production-v2`) : [DEPLOYMENT_WORKFLOW.md](docs/v2/technical/DEPLOYMENT_WORKFLOW.md) — **OPS-4/5** le remplaceront par deploy sur **tags semver**. Domaine **enregistré chez Cloudflare** (2026-06-03).

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
- [x] Step 2 consistency report done: see `docs/meta/STEP2-CONSISTENCY.md` (contradictions, OPEN QUESTIONS, recommended next slice). Quick doc fixes are deferred to Slice 1.

**DoD:** All normative files exist; ADR index lists 6 ADRs; no production code changed.

---

### Slice 1: Align README and one-time doc fixes

- [x] Update README: remove or correct Netlify/Vercel sentence; set deployment authority to Firebase + CI.
- [x] Update README structure section: replace Grille.vue with GridBoard.vue and current views/ structure (see `src/main.js`, `src/views/`, `src/components/GridBoard.vue`).
- [x] Add a short "Docs for agents and maintainers" paragraph in README linking to AGENTS.md, SPEC.md, ARCH.md, PLAN.md, DEVELOPMENT.md.
- [x] Fix audit doc link (README → docs/v1/technical/AUDIT.md). Add normative-docs pointer in docs/README.md.

**DoD:** README matches current entrypoints and deployment; links to normative docs work. No behaviour change.

---

### Slice 2: Consistency and open questions

- [x] Run Step 2 checks: list contradictions between new docs and code; list OPEN QUESTIONS that could not be inferred from code. (Done in `docs/meta/STEP2-CONSISTENCY.md`; updated post-Slice 1.)
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

- [x] **Route and layout:** When the route is `/season/:slug/event/:eventId`, show event details as a **full screen** (header + content + footer), not as a modal. Do not open the event-details modal when `route.params.eventId` is set; use the same content block in-page. Support query params: `tab`, `showConfirm`, `showAvailability`, `notificationSuccess` (+ email, playerName, eventId), `action=desist&player=...` as specified in SPEC.
- [x] **Header (event mode):** SeasonHeader receives event context (e.g. `isEventScreen`, `eventTitle`, `eventIcon`). Back chevron navigates to `/season/:slug`; left shows event icon; center shows event title; right unchanged (admin + account).
- [x] **Navigation:** Replace all “open event details” actions (grid, timeline, admin, player modal, etc.) with navigation to `/season/:slug/event/:eventId` (with query if needed). Back from event screen goes to `/season/:slug` (no Fermer in content). Redirect `/season/:slug?event=...&modal=event_details` to the canonical event URL.
- [x] **Links sent (client):** Update every event-URL producer to use canonical form: GridBoard (share/copy), MessagePreview (eventDirectLink, confirmUrl), SeasonAdminPage, PlayerModal, emailService (eventUrl, directConfirmUrl), calendarService, MagicLink, notificationActivation, notificationsService. See SPEC and the specification plan for the full list.
- [x] **Links sent (Cloud Functions):** In `functions/index.js`, ensure all event links (reminders, availability reminders, etc.) use `{baseUrl}/season/{slug}/event/{eventId}` (and query when needed). Templates in `functions/emailTemplates.js` receive the new URL from callers.
- [x] **WhatsApp / copy-paste:** MessagePreview and text templates use canonical event URL and confirm URL with `?tab=compo&showConfirm=true` where applicable so shared messages remain functional.
- [x] **Design (full-screen event):** Full-width black content area; no card frame or close button; status badge and event actions (three-dots) in Infos tab only; no footer "Composition Équipe" button (Équipe tab only); SeasonHeader title truncation on mobile; E2E tests updated.

**DoD:** SPEC “Event details as full screen (specification)” satisfied; all acceptance criteria in that section pass; no event link is sent in the old form; build succeeds; existing tests pass or are updated.

---

### Slice 11: Event-details Équipe tab – compact mobile layout

- [x] In [GridBoard.vue](src/components/GridBoard.vue), change the composition slots grid from `grid-cols-1` to `grid-cols-2` at the smallest breakpoint (mobile) so that **two slots per line** are shown on small viewports, matching the Dispos tab pattern in `EventRoleGroupingView.vue`. Keep `sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` (or adjust for consistency). No change to `CompositionSlot` content or behaviour.

**DoD:** On mobile viewports, the Équipe tab shows two composition slots per row; all existing information and interactions (click, confirm/decline, status) remain; build succeeds; existing tests pass.

---

### Work in progress (checkpoint for release – to resume later)

- **Algorithm replay simulation (WIP):** Headless script `npm run replay` to replay season draws with default, Bruno, Bruno2 algorithms. Loads data from Firestore dev; first event uses real cast; generates JSON with metrics (consecutive plays, participation std dev, unique pairs). See `scripts/replay/`. **Not yet done:** equity score based on participation/availability ratio; integration in UI; analysis tooling for output files.

---

### Slice 12: Composition history stats – selected/available and optional %

- **Spec:** SPEC.md, slice « Composition history statistics – selected vs available (Play, Decorum, Volunteer) ».
- **Summary:** In CastsView stats columns (Play, Decorum, Volunteer), display selected/available (e.g. 2/7) and optionally a rounded percentage below. Enables comparison of how often players were selected vs how often they were available.
- **V1 (main 0.48):** Implemented — `StatRatioDisplay`, CSV export sel/dispo, cherry-picked to `legacy/` on branch `v2`.
- **V2:** Scheduled in story 3.6 — [_bmad-output/implementation-artifacts/3-6-vue-historique-colonnes-roles-mois-export-masquage.md](_bmad-output/implementation-artifacts/3-6-vue-historique-colonnes-roles-mois-export-masquage.md).

---

### Slice 13: Composition history – availability cells with role emojis

- **Spec:** SPEC.md, slice « Composition history – availability cells with role emojis (upcoming events) ».
- **Summary:** In CastsView availability cells for upcoming events, show roles with emojis + percentages instead of full textual labels, for a more visual and compact display.
- No development plan yet; to be scheduled later.

---

### Slice 14: Event-details Équipe tab – message déclinés compact et liste sur demande

- **Spec:** SPEC.md, slice « Event-details Équipe tab – message déclinés compact et liste sur demande ».
- **Summary:** In the Équipe tab, replace the current long message and always-visible "Personnes ayant décliné" block with a **compact clickable badge** below the slots showing the number of people who declined (e.g. "4 personnes ont décliné"). Clicking the badge toggles the "Personnes ayant décliné" section open/closed for a more compact layout.
- **Implemented:** [SelectionModal.vue](src/components/SelectionModal.vue): badge just below slots (centred), section hidden by default, toggle on click; declined list in 2 columns, no top separator; action buttons in two rows (Simuler/Envoyer, Valider/Effacer) with homogeneous width; when no selection, Tirage and Simuler on one centred row. E2E test in [event-details-tabs.spec.js](tests/event-details-tabs.spec.js) (declined badge toggle, skipped when no declined players).

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

These could not be inferred from code alone; they are tracked here and in `docs/meta/STEP2-CONSISTENCY.md`. Resolve when making related changes or when product decisions are needed.

- **Super Admin:** Where the list is stored (Firebase project config, Firestore doc, or code) and how it is updated. Code shows a callable or server-side check; the list itself is not in repo.
- **Offline behaviour:** Whether the product intends full offline support for draw/admin or only cache-for-read. Code has offline listeners and cache but no explicit "offline mode" guarantee in comments.
- **GitHub Pages:** Whether `pages.yml` and the `deploy` script (gh-pages) are still supported or legacy. firebase.json defines two hosting targets; pages.yml is workflow_dispatch-only.
- **Invitation lifecycle:** Expiry and single-use semantics for `invitations` and accept flow. Logic is in code but not summarised in one place.
- **Exact availability schema:** Subcollection path and field names for availability are used in `storage.js` and `playerAvailabilityService.js` but not declared in a single schema doc; DOMAIN mentions the ambiguity.

---

## V2 delivery track (BMAD)

**Added:** 2026-05-24 — ordre d’exécution V2 Angular + API Spring. Les slices legacy (V1 Firebase) ci-dessus restent inchangées.

**Détail des epics :** [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md)  
**Vision ligue (long terme) :** [_bmad-output/planning-artifacts/plan-v2-league-journey.md](_bmad-output/planning-artifacts/plan-v2-league-journey.md)  
**Suivi sprint :** [_bmad-output/implementation-artifacts/sprint-status.yaml](_bmad-output/implementation-artifacts/sprint-status.yaml)  
**ADR :** [0011](docs/adr/0011-league-model-and-user-agenda.md), [0012](docs/adr/0012-league-views-travel-leagues-member-stats.md), [0013](docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)  
**Design Thinking (2026-05-25) :** [_bmad-output/design-thinking-2026-05-25.md](_bmad-output/design-thinking-2026-05-25.md)

---

### V2 MVP — definition (2026-05-24)

**Objectif produit :** un pilote troupe peut enchaîner, sans contournement :

1. **Connexion → agenda personnel** (`/agenda`, FR48–FR49) — pas d’écran intermédiaire, pas de liste `/seasons` comme hub membre.
2. **Navigation depuis un événement** vers la ligue et l’administration troupe/ligue (FR51) — bandeau contexte + routes existantes (`/saison/:troupeSlug/:seasonSlug`, admin participants/membres).
3. **Composition complète** : remplir les rôles **à la main ou par tirage**, **valider**, **confirmer** (ou décliner + combler un trou) jusqu’à l’état **complete** (FR20–FR28).

**Stories MVP (ordre de valeur, deux pistes parallélisables) :**

| Piste | Stories | FR / UX |
|-------|---------|---------|
| **Navigation & entrée** | **12.1** → **12.2** → **12.5** → **12.4** ; puis **12.3** si multi-troupe/ligue ; **12.6** optionnel | FR48–FR49, FR51, UX-DR13–15 |
| **Composition** | **6.5** → **6.6** → **6.7** → **6.4** → **6.9** | FR20–FR28, UX-DR6 |

**Prérequis déjà livrés (baseline) :** Epics 1–2 (auth, troupe), Epic 3 stories **3.1–3.5**, **3.8**, Epic 5 **5.1–5.3**, Epic 6 **6.1–6.3**. Story **2.9** = parité partielle post-login ; **12.5** la finalise vers `/agenda`.

**Definition of Done MVP :**

- [x] Membre connecté arrive sur **`/agenda`** (ou dernière ligue visitée si slug valide).
- [x] Liste d’événements à venir agrégée (`GET /v1/me/agenda`).
- [x] Détail événement : bandeau **Ligue · Troupe** avec liens navigation + admin (⚙ existant).
- [x] Orga : assignation manuelle **ou** tirage pondéré sur un spectacle.
- [x] Orga : validation de la composition ; membre : confirmation ; état **complete** atteignable (y compris après un déclin + action 6.9).

**Pilote validé :** 2026-05-25 — recette admin seul sur spectacles seed `[MVP] 00–05` (La Malice 2026-2027). Réserves UX/perfs pilote : **Story 6.11** clôturée 2026-05-27 (**ISSUES.md** UX-001, UX-002, PERF-001 fermées).

### Pre-prod V2 + migration V1 (itérative)

**Added:** 2026-05-25 — [ADR-0014](docs/adr/0014-v2-preprod-migration-no-seed.md), runbook [preprod-reset-and-migrate.md](docs/v2/migration/preprod-reset-and-migrate.md).  
**Objectif :** déployer V2 en **staging** (sans données seed), alimenter Neon depuis **Firestore V1 production** (`default`), pouvoir **reset + rejouer** la migration jusqu’à la bascule prod (date non fixée).

**Hygiène & ordre d’exécution (2026-05-28, MAJ 2026-06-01) :** [deferred-triage-2026-05.md](_bmad-output/implementation-artifacts/deferred-triage-2026-05.md), SCP [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md). **Hygiene H1 :** **done** (OPS-2, 5-7, 2-10, 12-7, 6-13). **Migration staging :** recette Malice 2025-26 **stats + dispos + compos** validée V1=V2 ; **≥3 cycles** replay déjà joués — **à rejouer from scratch** avant prod (évolutions schéma/data depuis). **Gate prod :** replay frais + **MIG-4** + iso-V1 (§ Wave iso-V1 ci-dessous).

| Slice | Statut | Livrable | DoD |
|-------|--------|----------|-----|
| **M0** Décision & garde-fous | [x] | ADR-0014 ; Flyway `db/seed` hors profil `cloud` | Deploy staging n’insère pas `@seed.improbots.test` |
| **M1** Infra pre-prod | [x] | Env GitHub `staging`, Neon branch, deploy `staging-v2` | SPA + API + Flyway OK ; E2E gate TEST-1 sur staging |
| **M2** Playbook migration (périmètre actuel) | [x] doc | Runbook + scripts `export:v1-*:prod` ; imports CSV 2.3 | Users + membres prod → staging |
| **M3** Boucle reset / rejouer | [x] doc | Procédure C du runbook | ≥ 1 cycle reset documenté (cible : 3 avant cutover) |
| **M4** Cutover production | [ ] | **`hatcast.app`** + **OPS-8** + checklist merge / go-live | Gate V2.0.0 |

**Backlog ops (PLAN, pas SPEC) :**

| ID | Titre | Priorité | Statut |
|----|-------|----------|--------|
| **OPS-1** | Séparer Flyway schema / seed (profils dev vs cloud) | P0 | [x] |
| **OPS-2** | CI : tests d’intégration API (H2, `api-test.yml`) / profil test documenté (**DW-099**) | P0 | [x] | **Gate M1** — workflow `api-test.yml`, profil H2 documenté |
| **OPS-3** | Smoke PWA — `BASE_URL` staging V2 (**DW-002**) | P2 | backlog | |
| **TEST-1** | Infra E2E V2 — Playwright (`apps/web/e2e/`) + profil API `e2e` (auth mock + fixtures hybrides) + smoke 3.19 (S2–S5) + workflow `e2e-smoke.yml` | P1 | [x] | Clôture **LIMIT-001** (V2) ; palier 2 CI ; gate deploy Cloud Run **staging-v2** via `e2e-smoke` dans `deploy-v2-cloud-run.yml` (pas dev cloud `v2`) |
| **MIG-1** | Runbook reset Neon staging | P0 | [x] |
| **MIG-0** | Bootstrap troupe sur staging/prod vide (sans `db/seed`) | P0 | [x] | Story **2.11** — prérequis import CSV [preprod-reset-and-migrate.md](docs/v2/migration/preprod-reset-and-migrate.md) |
| **MIG-2** | Export V1 → import V2 : saisons + événements **+ `manifest.json`** | P1 | [x] | Story [mig-2](_bmad-output/implementation-artifacts/mig-2-export-v1-seasons-events-and-mapping-manifest.md) ; recette staging OK |
| **MIG-3** | Dispos / compositions (`extract → transform → load`) | P1 | [x] | Story [mig-3](_bmad-output/implementation-artifacts/mig-3-availability-compositions-migration-pipeline.md) ; recette staging OK |
| **MIG-4** | Import : `template_type=deplacement` → **`category=deplacements`** (+ retrait progressif format `deplacement`) | **P1** | [x] | **Gate iso-V1 / prod** — recette staging OK |
| **MIG-5** | Orchestrateur headless `migrate:v2:run` + clé API migration (ADR-0017) | P1 | [x] | Bootstrap API → B1–B5 → smoke ; reprise `--from-step` ; gate replay `migrate:v2:validate-replay` |
| **MIG-6** | Script unique `./scripts/migrate-from-v1.sh` + auto-provision opérateur + CLI `.mjs` | P1 | [x] | Charge `.env.local` ; prompt reset Neon ; `npm run migrate:from-v1` ; dry-run sans faux échec smoke |

**Hygiene H1 (PLAN, pas SPEC) — stories à créer via BMad :**

| ID | Titre | Priorité | Statut | Source triage |
|----|-------|----------|--------|---------------|
| **5-7** | Summary dispos : lecture sans écriture sur GET (`ensureMembershipParticipants`) | P0 | done | **G-003**, DW-079 — story [5-7](_bmad-output/implementation-artifacts/5-7-summary-dispos-lecture-sans-ecriture.md) |
| **2-10** | Liste membres : corriger N+1 emails | P1 | done | DW-068 |
| **12-7** | Agenda : annulation requêtes obsolètes + verrou navigation post-login | P1 | done | DW-044, DW-054 |
| **6-13** | Publish : notifications hors transaction | P2 | done | DW-085 |
| **DOC-1** | Archive deferred (en-tête + IDs triage 2026-05-28) | P2 | backlog | H-ARCHIVE |

**Pre-prod / migration (PLAN, pas SPEC) — story produit :**

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **2.11** | Création d’une troupe (API + UI minimale) | **P0** | [x] | **Gate MIG-0** ; créateur → `TROUPE_ADMIN` ; slug unique ; remplace bootstrap SQL manuel |
| **3.19** | Retrait roster saison (sans désactivation troupe) | **P1** | [x] | SCP [2026-05-31 participant removal](../planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md) ; recette manuelle PASS ; E2E `recette-3.19.spec.ts` gate `staging-v2` (TEST-1) |

**Explicitement hors MVP V2 (backlog post-pilote) :**

| Epics / stories | Raison |
|-----------------|--------|
| **3.6**, **3.6b** | Statistiques / Historique ligue (FR53–54) |
| **Epic 13** (13.1–13.5 ; **13.6 reporté**) | Multi-saisons actives, roster — **13.6 ligue déplacements** remplacé par tags (ADR 0013) |
| **Epic 14** (14.1–14.5) | **Superseded** par **Epic 17** — SCP [2026-06-01](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-epic14-superseded-by-epic17.md) ; ne pas planifier 14.x |
| **Epic 17** (17.1–17.15) | Navigation troupe-first, catégories spectacle, slugs, polish formulaire/Infos — [ADR 0013](docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md) ; détail § Epic 17 |
| **Epic 16** (16.1) | Clin d’œil `/membre/:slug` |
| **Epic 4**, **7**, **8**, **9**, **10**, **11**, **15** | Voir § **Wave iso-V1 — MEP remainder (2026-06-02)** — **4.1**, **8.1/8.3**, **9-0**, **10.2/10.3** **in** MEP ; **9.1**, **4.2**, **7**, **11**, **15** post-MEP |
| **5.4**, **5.5**, **6.8**, **6.10** | Commentaire dispo, proxy dispo, proxy confirmation, partage WhatsApp |

---

### Execution waves (revised)

Les waves **MVP** et **expansion** remplacent l’ancien enchaînement 0→4 où stats et multi-ligues bloquaient la composition.

| Wave | Scope | Stories | Outcome |
|------|--------|---------|---------|
| **MVP-A** | Entrée membre | **12.1**, **12.2**, **12.5** | `/agenda` live ; post-login corrigé |
| **MVP-B** | Navigation événement | **12.4** ; **12.3** si besoin filtres | FR51 ; admin atteignable depuis l’événement |
| **MVP-C** | Composition (// avec A dès baseline OK) | **6.5**, **6.6**, **6.7**, **6.4**, **6.9** | Boucle compo complète |
| **Polish MVP** | Confort | **12.6** ; **12.3** si reporté | Alias `/ligue/:slug` |
| **Post-MVP** | Navigation troupe-first | **Epic 17** **17.1→17.5** | `/troupes`, hub, breadcrumb (ADR 0013) |
| **Post-MVP** | URLs & catégories | **Epic 17** **17.6→17.15** | Slugs, `category`, tirages/stats, UX formulaire/Infos |
| **Post-MVP** | Multi-saisons | **Epic 13** (sans **13.6** travel) | Activation concurrente |
| **Post-MVP** | Clin d’œil | **Epic 16** | `/membre/:slug` |
| **Post-MVP** | Stats & exports | **3.6**, **3.6b**, **17.10** | Statistiques / Historique (ADR 0012) ; filtre compartiments (**17.10**) |
| **Post-MVP** | Polish compo (pilote) | **6.11** | Feedback visuel + perfs onglet Équipe (profilage) |
| **Post-MVP** | Transverse | **5.4+**, **6.10**, **Epics 4**, **7–11**, **15** | Selon priorité produit ; **5.5**, **6.8** livrés pour pilote |

**Ordre de session suggéré (2 stories max — règle retro) :**

1. **12.1** + **12.2**  
2. **12.5** + **12.4**  
3. **6.5** + **6.6**  
4. **6.7** + **6.4** (ou **6.4** avant **6.7** si tirage prioritaire)  
5. **6.9** + **12.3** ou **12.6**  
6. Puis backlog post-MVP (17.x navigation, 3.6, …)

### Execution order revised (2026-06-02)

**Done since 2026-06-01:** **[CR]** **17-29**, **17-28**, **3-20** ; **MIG-4** ; hygiene H1 ; migration recette Malice ; **4.1** (+ **4.3** cartes troupe) annuaire public.

| Phase | Scope | Outcome |
|-------|--------|---------|
| **Clôture epics** | **3**, **17** → done | Hub / stats / filtres stabilisés |
| **MEP iso-V1** | § **Wave iso-V1 — MEP remainder** | **Done** — gate closed |
| **V2.0.0 cutover** | § **Wave V2.0.0** | Polish + release pipeline + **M4** |
| **Replay prod gate** | Reset Neon → `./scripts/migrate-from-v1.sh` × **≥3** | Après slice MEP ; schéma stable |
| **M4 cutover** | `hatcast.app`, OAuth, push, comms | **OPS-8** + gate E3 |

**Ordre de session actuel — SCP [V2.0.0 cutover](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) (MAJ domaine 2026-06-03) :**

0. **OPS-8** — prod Cloud Run **`europe-west1`** + domain mapping **`hatcast.app`** + Cloudflare orange (staging/dev cloud restent **`europe-west9`** / `*.run.app`)  
1. ~~**MEP iso-V1 slice**~~ — **done** (4.1, 9.0, 3.21, 8.1, 8.3, 6.10b, 8.2, 8.5, 8.6, 9.1 — voir `sprint-status.yaml`)  
2. **10.4** → **10.2** + **10.3** + **10.7** — PWA recette, MAJ client, version/changelog, icône HatCast 2  
3. **1.2b** + **17.34** + **1.6** — UX inscription dédiée + Mon compte (onglets) + email / MDP connecté  
4. **6.15** — modales annonces (M3, notify manuel, anti-spam)  
5. **10.5** + **10.6** — aides install contextuelles + opt-in notifs post-install  
6. **Recette 1.2** + **1.3** + **1.7** — inscription + reset MDP gates + suppression compte  
7. **OPS-4** → **OPS-6** — release staging par tag ; prod depuis artefact taggué  
8. Tour écrans staging + replay migration × **≥3**  
9. Tag **v2.0.0** staging → prod → **M4** (trafic **`hatcast.app`**) → **OPS-7** (branches `v1` / `staging-v1`, rename `main` / `staging`)  
10. **OPS-9** (PostHog) + **OPS-10** (`@hatcast.app` mail) — **P1**, après **M4** ou en fin de vague si capacité (non bloquant cutover)

*(Historique MEP : SCP [2026-06-02 iso-V1](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md).)*

### Execution order revised (2026-06-01) — historique

| Phase | Scope | Outcome |
|-------|--------|---------|
| **Stabilisation hub** | **[CR]** **17-29**, **17-28**, **3-20** → done | Hub / filtres / stats UI alignés post-refonte |
| **MIG-4** | Déplacements V1 → `category=deplacements` à l’import | Stats/tirage « Déplacements » corrects après migration |
| **Iso-V1** | § Wave iso-V1 (gaps restants) | Parité produit V1 pour cutover La Malice |
| **Replay prod gate** | Reset Neon → `./scripts/migrate-from-v1.sh` × **≥3** cycles | Après MIG-4 + schéma stable ; `migrate:v2:validate-replay --min=3` |
| **M4 cutover** | production-v2, DNS, bascule | Décision PO |

~~**Ordre de session actuel (2 stories max) :**~~ *(remplacé par § 2026-06-02)*

~~1. **`bmad-code-review`** — **17-29**, puis **17-28**, puis **3-20**~~  
~~2. **`bmad-create-story` + dev** — **MIG-4**~~  
~~3. Gaps iso-V1 restants~~  
~~4. Replay migration~~  
~~5. **M4** cutover~~

### Wave iso-V1 (2026-06-01) — état epics

Objectif : parité **usage troupe type La Malice** sur V2 (pas feature parity exhaustive V1 Firebase). Réf. triage [§5](_bmad-output/implementation-artifacts/deferred-triage-2026-05.md).

| Statut | Epics / slices | Action PLAN |
|--------|----------------|-------------|
| **Done — clôturer epic** | **2**, **5**, **6**, **12**, **16**, **17**, **18** ; **4.1** (+ **4.3**) ; MIG-0/2/3/4/5/6 ; hygiene H1 | Marquer epics **done** ; **epic-3** **in-progress** (**3.21** SCP 2026-06-01) ; **epic-4** **in-progress** (**4.2** post-MEP) |
| **Archiver / ne pas rouvrir** | **14** (**superseded** → **17.x**, SCP 2026-06-01), **13.6** (ADR 0013) | Retirer du chemin iso-V1 ; voir `epics.md` |
| **Post-iso explicite** | **7**, **11**, **13** (multi-active sans 13.6), **15**, **1.7**, **9.1** + **9.2** (UI audit), **4.2** | Invitations, analytics, suppression compte, pages publiques saison/événement |
| **Réserve produit (SPEC)** | Historique compositions passées (DW-020–021) | Story dédiée si exigé pour iso — pas dans MVP actuel |

### Wave iso-V1 — MEP remainder (2026-06-02)

**Décision PO :** SCP [sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md). **Bloquant M4** sauf mention contraire.

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **4.1** | Annuaire public des troupes (cartes publiques ; hub gated) | **P0** | [x] | Story [4-1](../_bmad-output/implementation-artifacts/4-1-annuaire-public-des-troupes.md) ; **4.3** cartes logo/description |
| **9.0** | Audit — capture backend (append-only, before/after, acteur) | **P0** | done | § Epic 9 |
| **3.21** | Brouillon événement + publication / ouverture dispos | **P0** | done | SCP [2026-06-01 notifications](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md) |
| **8.1** | Opt-in global push navigateur | **P0** | done | Prérequis push pour **8.3** |
| **8.3** | Notifications MEP (dispos publish + confirm assignés) | **P0** | done | **8.5**/**8.4** post-MEP |
| **8.5** | Extensions notifs membre (FYI, J-7/J-1, retrait…) | **P1** | done | Après **8.3** ; **8.2** catégories |
| **8.6** | Accusé proxy dispo / participation (orga → sujet lié) | **P1** | done | Stories **5.5** / **6.8** ; complète audit **9.0** |
| **6.10b** | Rappel manuel dispos + garde anti-spam | **P1** | done | Extension 6.10 |
| **8.4** | Notifications ops organisateurs (FR31b) | **P2** | backlog | Post-V2.0.0 |
| **10.2** | Détection mise à jour client PWA (FR41) | **P0** | backlog | → § **Wave V2.0.0** |
| **10.3** | Version app + changelog (footer / dialog) | **P0** | backlog | → § **Wave V2.0.0** |
| **1.3** | Reset mot de passe par email | P0 recette | done | Recette gate — § **Wave V2.0.0** |

**Hors MEP initial (SCP 2026-06-02) — repris en V2.0.0 :** **1.6**, **1.7** (voir § Wave V2.0.0). **Toujours post-V2.0.0 :** **9.2** audit membre ; **4.2** pages publiques saison/événement.

**Gate MEP iso-V1 :** **Closed 2026-06-02** — slice fonctionnelle livrée ; gate prod = **§ Wave V2.0.0** + replay migration.

---

### Wave V2.0.0 — cutover prod (2026-06-02)

**Décision PO :** SCP [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md). **Objectif :** release nommée **v2.0.0** — polish UX + sécurité compte + pipeline release par **tags** + bascule prod (**M4**).

#### Wave A — PWA, release client & identité visuelle

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **10.4** | Recette manifest / icons / SW / `version.txt` | **P0** | backlog | Story à créer |
| **10.2** | Détection MAJ client + bannière « Mettre à jour » (FR41) | **P0** | backlog | Reload au clic ; post-update → changelog |
| **10.3** | Version app + dialog changelog (`changelog.json`) | **P0** | backlog | Story à créer ; parité V1 `ChangelogModal` |
| **10.5** | Aides install contextuelles (iOS / Android / desktop) | **P0** | backlog | Parité V1 `PWAInstallModal` ; contenu à jour |
| **10.6** | Opt-in notifications post-install / standalone | **P0** | backlog | Chemin explicite vers flow **8.1** |
| **10.7** | Icône PWA HatCast 2 (192/512/maskable/favicon) | **P0** | backlog | Signal visuel migration V2 |

#### Wave B — Mon compte & sécurité

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **1.2** | Inscription email / mot de passe | P0 recette | done | Code livré (**1-2**) ; **recette gate** cutover (staging → prod) — lien « Créer un compte » sur `/connexion` |
| **1.2b** | UX inscription dédiée (parité V1) | **P0** | backlog | Routes `/connexion` + `/inscription` — spec [ux-design-auth-inscription-1-2b.md](_bmad-output/planning-artifacts/ux-design-auth-inscription-1-2b.md) |
| **17.34** | Mon compte — onglets / sections, raccourcis prefs | **P0** | backlog | UX [ux-design-mon-compte.md](_bmad-output/planning-artifacts/ux-design-mon-compte.md) |
| **1.6** | Changement email + mot de passe connecté | **P0** | backlog | FR36 ; Google + email/password |
| **1.3** | Reset mot de passe (mot de passe oublié) | P0 recette | done | Gate E2E staging Identity Platform |
| **1.7** | Suppression de compte (zone sensible) | **P0** | backlog | FR37 ; exclu MEP → **in** V2.0.0 |

#### Wave C — Modales annonces

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **6.15** | Refonte modales annonces + notify manuel simplifié | **P0** | backlog | M3 ; copy/WhatsApp ; anti-spam (pattern **6.10b**) ; intents draw/compo/dispos |

#### Wave D — Pipeline release (OPS)

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **OPS-4** | Release staging par tag (`vX.Y.Z-rc.N`) | **P0** | done | Script `release-staging.sh` |
| **OPS-5** | Prod depuis artefact taggué (sans branche prod dédiée) | **P0** | backlog | Règle : tag prod = tag validé staging |
| **OPS-6** | Couplage version / CHANGELOG / `changelog.json` / `version.txt` | **P0** | backlog | Réutilise `version-changelog.sh` |
| **OPS-7** | Cutover branches post-M4 | **P0** | backlog | `v1`, `staging-v1` archives ; `v2`→`main` ; `staging-v2`→`staging` |

#### Wave F — Domaine prod `hatcast.app` (2026-06-03)

**Décision PO :** domaine **`hatcast.app`** acheté chez **Cloudflare Registrar** ; prod V2 sur URL canonique **`https://hatcast.app`** ; **staging** et **dev cloud** inchangés (`hatcast-v2-staging` / `-dev` en **`europe-west9`**, URLs `*.run.app`).

| ID | Titre | Priorité | Statut | Notes |
|----|-------|----------|--------|-------|
| **OPS-8** | Prod `hatcast.app` — Cloud Run **`europe-west1`**, domain mapping, CF proxy orange, OAuth/CORS/Firebase | **P0** | backlog | Gate **M4** ; doc [DEPLOY_V2_CLOUD_RUN.md](docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) § prod custom domain ; story [ops-8](_bmad-output/implementation-artifacts/ops-8-prod-domain-hatcast-app.md) |
| **OPS-9** | PostHog EU — SDK + reverse proxy (`e.hatcast.app`, nuage **gris**) | **P1** | backlog | Promote **G-005** ; FR47 ; **non bloquant M4** ; story [ops-9](_bmad-output/implementation-artifacts/ops-9-posthog-hatcast-app.md) |
| **OPS-10** | Adresses `@hatcast.app` (`noreply@`, `info@`) — DNS mail, FROM prod, recette | **P1** | backlog | Réception : CF Email Routing → Gmail ; envoi : SPF/DKIM (Workspace ou SMTP domaine) ; **non bloquant M4** ; story [ops-10](_bmad-output/implementation-artifacts/ops-10-email-hatcast-app.md) |

**Dev local inchangé :** Neon branche **`local`** + `./scripts/start-dev.sh`. **Dev cloud inchangé :** push **`v2`** → **`europe-west9`**.

**Flux cible :**

```
v2 → promote-to-staging.sh → release-staging.sh → tag rc → deploy staging
→ recette → promote-tag-to-prod v2.0.0 → deploy prod (même tag)
```

#### Wave E — Gates cutover

| ID | Titre | Condition |
|----|-------|-----------|
| **E1** | Tour écrans staging | Checklist parcours membre + orga signée PO |
| **E2** | Replay migration | Reset Neon → `./scripts/migrate-from-v1.sh` × **≥3** |
| **E3** | Release v2.0.0 | Tag staging validé → tag prod |
| **M4** | Bascule prod | Trafic **`https://hatcast.app`** ; OAuth/CORS/push VAPID ; comms utilisateurs ; prérequis **OPS-8** vert |
| **E4** | Renommage branches | **OPS-7** après M4 |

**Gate V2.0.0 / cutover :** **OPS-8** done + Waves **A–D** done + **E1** + **E2** + recette **1.2** + **1.3** + tag **v2.0.0** staging puis prod.

**P1 fin de vague (non bloquant M4) :** **OPS-9** (PostHog), **OPS-10** (e-mail `@hatcast.app`). Epic **11** analytics détaillé reste **post-V2.0.0** sauf périmètre **OPS-9**.

**Hors V2.0.0 (inchangé) :** **4.2**, **7.x**, **9.2**, **11.x** (hors **OPS-9**), **13.x**, **8.4** (ops orga).


### Execution order revised (2026-05-28) — historique

| Phase | Scope | Outcome |
|-------|--------|---------|
| **Hygiene H1** | **OPS-2** (gate) ; **DOC-1** ; **5-7**, **2-10**, **12-7**, **6-13** ; **OPS-3** ; validation slugs **MIG-2** (DW-031) | CI fiable ; recette staging sans dette H1 bloquante sur import |
| **M1** | Infra pre-prod | Staging live — **dès OPS-2 vert** (option B PO) |
| **MIG-0** | Story **2.11** — première troupe + admin sur env `cloud` | Import CSV 2.3 possible |
| **MIG-2 → MIG-4** | Export / import V1 sur Neon staging | Données réelles ; tags déplacement |
| **Iso-V1** | Liste §5 [deferred-triage-2026-05.md](_bmad-output/implementation-artifacts/deferred-triage-2026-05.md) (pas le deferred brut) | Parité produit ciblée ; ex. **17.24**, Epic **4** |
| **Hygiene H2 + growth** | Deferred D/C restant, [growth-backlog.md](_bmad-output/planning-artifacts/growth-backlog.md) | Post-staging |

~~**Ordre de session actuel (2 stories max) :**~~ *(remplacé par § 2026-06-01)*

~~1. **OPS-2** (+ **DOC-1** si doc seul)~~  
~~2. **M1** (ops, dès gate CI) en parallèle possible avec **5-7**~~  
~~3. **5-7** + **2-10**~~  
~~4. **12-7** + **6-13** (avant premier **MIG-2** complet)~~  
~~5. **2.11** (création troupe) — **avant** import migration staging~~  
~~6. **MIG-2** (exports + import) puis **MIG-3** / **MIG-4**~~  
~~7. Vague **iso-V1** puis **H2**~~

---

### Epic 17 — Navigation troupe-first, tags d’équité, slugs événements

**Added:** 2026-05-25 — [ADR 0013](docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md), session Design Thinking (sans tests utilisateurs prototype).

**Objectif :** Remplacer `/seasons` comme hub, exposer **/troupes** + **/troupes/:slug**, breadcrumb responsive, admin par scope ; puis **tag d’équité** optionnel sur spectacle et **slugs** dans les URLs.

**Note numérotation :** les stories **15.x** du livrable Design Thinking sont **17.x** ici — **Epic 15** reste *Rencontres liées* (encounters inter-troupes).

| Story | Titre | Priorité | Depends |
|-------|-------|----------|---------|
| **17.1** | Breadcrumb contexte (desktop complet, mobile = logo troupe) ; retirer ⚙ du header global | P0 | — |
| **17.2** | Menu `app-scope-admin-menu` — engrenage + dropdown (troupe / saison / spectacle) | P0 | 17.1 |
| **17.3** | Page `/troupes` — sections Mes troupes + Découvrir, cards (logo, membres, spectacles à venir) | P0 | API compteurs |
| **17.4** | Hub `/troupes/:slug` — logo, saisons, ⚙ admin, préférences (pseudo, rôles) | P0 | 17.3 |
| **17.5** | Redirects `/seasons`, `/ligue/*` ; liens événement → hub troupe ; breadcrumb sur `/troupes` | P0 | 17.4 |
| **17.11** | Breadcrumb pages admin (Participants saison/spectacle, Membres troupe) — clôture LIMIT-002 | P1 | 17.1, 17.2 ; 17.5 recommandé |
| **17.6** | `events.slug` — migration, API, routes `/saison/:troupeSlug/:seasonSlug/event/:eventSlug`, redirect UUID | P1 | — |
| **17.7** | `category` + glossaire catégories par troupe (API) | P1 | ADR 0013 |
| **17.8** | Onglet **Infos** — tag optionnel, autocomplete, aide (pas dans modale spectacle) | P1 | 17.7 |
| **17.9** | Tirage / chances partitionnés par `(saison, category)` | P2 | 17.7 |
| **17.10** | Stats : filtre multi **groupes de spectacles** (principal + tags) ; retrait bandeau DEPLACEMENT ; export aligné ; lecture legacy `deplacement` sans backfill DB | P2 | 3.6, 17.7, 17.8 ; 17.9 recommandé avant |
| **17.12** | Slug spectacle auto — retirer champ « Identifiant URL » du formulaire | P2 | 17.6 |
| **17.13** | Formulaire spectacle — datepicker + heure/minute Material | P2 | — |
| **17.14** | Infos — type + rôles en modales ; alléger `EventFormDialog` | P2 | 17.8 recommandé |
| **17.15** | Infos — organisateur·ices en modale ; retirer participants du formulaire | P2 | 17.14 recommandé |
| **17.16** | Route admin participants **événement** (breadcrumb, hors dialog) | P1 | 17.11 — fichier story existant |
| **17.17** | Chip organisateur + Promouvoir listes admin | P2 | — — fichier story existant |
| **17.18** | Raccourcis app bar agenda ↔ saison | P1 | 17.1, 12.2 |
| **17.19** | Hub `/accueil` À faire (MVP, agenda API) | P1 | 12.2 ; 17.18 reco. |
| **17.20** | `lastMemberEntryPath` post-login *(optionnel)* | P2 | 17.19 |
| **17.21** | API `GET /me/inbox` (confirmations + actions) | P1 | 6.7, 17.19 |
| **17.22** | Navigation bar M3 membre (3 onglets) | P2 | 17.19 ; 17.21 reco. |
| **17.26** | Hub troupe — onglets **Saisons / Membres** ; édition/archive saison sur cartes ; embed admin membres ; retrait gear troupe | P2 | 17.4, 17.11, 2.2 ; idée [G-007](_bmad-output/planning-artifacts/growth-backlog.md) |

**Wave hub membre (2026-05-27) :** livrer **17.18** seul en premier si besoin rapide ; puis **17.19** ; **17.21** avant ou en parallèle de **17.22** ; **17.20** si remember last visit doit inclure `/accueil`. Spec : [_ux-hub-a-faire.md_](_bmad-output/planning-artifacts/ux-hub-a-faire.md).

**DoD phase navigation (17.1–17.5) :** plus de hub `/seasons` ; breadcrumb sur troupe/saison/événement ; admin troupe depuis hub ; lien nom de troupe sur événement → hub.

**Story 17.11** (P1) — aligne le chrome des pages admin Participants / Membres (LIMIT-002) ; fichier story prêt pour dev après **17.5** recommandé.

**DoD phase domaine (17.7–17.10) :** tag persisté (saisie Infos **17.8**) ; tirage respecte compartiments (**17.9**) ; stats filtrables par compartiment(s), sans colonnes DEPLACEMENT dédiées (**17.10**). Migration données `deplacement` → tag : **MIG-4**, pas 17.10.

**UX filtre compartiments (17.10) :** [_bmad-output/planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md](_bmad-output/planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md) ; amendement [ux-design-season-historique-statistiques.md](_bmad-output/planning-artifacts/ux-design-season-historique-statistiques.md) (D9).

**DoD polish formulaire (17.12–17.15) :** modale spectacle = noyau planning ; gouvernance (type, rôles, orgas) sur Infos ; participants spectacle hors modale. SCP : [sprint-change-proposal-2026-05-25-epic17-event-form-ux.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-epic17-event-form-ux.md).

**UX spec :** [_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md](_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md) (amended 2026-05-25).  
**Détail stories :** [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) § Epic 17.

### Epic 9 — Audit et historique des changements significatifs

**Added:** 2026-06-02 — SCP [iso-V1 MEP scope](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md).  
**Objectif :** **FR35** — traçabilité horodatée (acteur, sujet si proxy, type d’action, valeurs avant/après) sur les mutations métier sensibles. **MEP = capture backend** ; **UI = post-MEP initial**.

**État actuel (partiel, pré-9.0) :** `recorded_by_user_id` sur dispos proxy (**5.5**, migration V23) ; acteur sur déclin (**6.8**) — **insuffisant** pour FR35 complet (pas de journal unifié, pas de before/after systématique, pas de delete dispo / tirage / validate).

| Story | Titre | Priorité | Phase | Depends |
|-------|-------|----------|-------|---------|
| **9.0** | Capture backend — journal append-only `audit_events` | **P0** | **MEP** | — |
| **9.1** | UI admin/orga — consultation piste audit (scope autorisation) | P1 | Post-MEP | **9.0** |
| **9.2** | UI membre — historique des changements **me concernant** | P2 | Post-MEP | **9.0**, **9.1** reco. |

**Périmètre capture **9.0** (minimum FR35, une entrée par mutation) :**

| Domaine | Actions tracées | Before/after (min.) |
|---------|-----------------|---------------------|
| **Disponibilités** | create, update, **delete** | `status`, `roleKeys`, `comment` |
| **Spectacles / événements** | create, update (tout champ), archive, unarchive | `title`, `slug`, `startsAt`, `location`, `description`, `templateType`, `roleSlots`, `category`, `archived` |
| **Roster saison** | add, update, remove, reinclude | `status`, `displayName`, email, lien user |
| **Roster événement** | add, update, remove ; exclude/include sur roster event | idem + exclusion |
| **Droits troupe** | add, update rôle/statut, deactivate, self-join | `status`, `baselineRole`, `displayName` |
| **Organisateurs** | grant/revoke saison ou événement | délégation (userId) |
| **Composition** | draft publish, validate, unlock, manual assign, lottery draw, slot clear | `lifecycleState`, slot assignments par rôle |
| **Confirmations** | confirm, decline, withdraw (membre + proxy **6.8**) | statut confirmation par slot |
| **Proxy** | dispo (**5.5**), confirmation (**6.8**) | acteur + sujet explicites |

**Corrélation :** toutes les entrées liées à un spectacle partagent **`event_id`** (+ `season_id`, `troupe_id`) — timeline unifiée pour recette et UI **9.1**.

**Chaque entrée :** `occurred_at` (UTC, seconde), `actor_user_id`, `subject_*` (participant / user si pertinent), `action_type`, `scope` (troupe / saison / event ids), `before` / `after` (JSON).

**Points d’accroche code (indicatif) :** `AvailabilityService`, `EventService`, `SeasonParticipantService`, `EventParticipantService`, `EventRosterService`, `TroupeMembershipService`, `OrganizerAccessService`, `CompositionService`, … — **dans** la transaction métier.

**DoD **9.0** (MEP) :** table + service `AuditEventRecorder` ; tests intégration sur au moins **dispo CRUD** + **event create/update** + **season participant remove** + **organizer grant/revoke** + validate compo + confirm/decline ; **pas** d’API GET publique requise pour MEP.

**DoD **9.1** :** route/API filtrée par scope orga/admin ; liste paginée avec acteur, sujet, horodatage, diff lisible.

**DoD **9.2** :** membre voit uniquement les entrées où il est **sujet** ou **acteur** ; admins conservent **9.1**.

**Ordre :** **9.0** → **8.3** (optionnel : audit des envois notif en story séparée post-MEP) → **9.1** → **9.2**.

**Détail stories :** [epics.md](_bmad-output/planning-artifacts/epics.md) § Epic 9.

### Gates

| Gate | Status | Condition |
|------|--------|-----------|
| UX journey (Epic 12) | **Done 2026-05-24** | [ux-design-journey-league-agenda.md](_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md) approuvé |
| **MVP navigation** | **Done 2026-05-25** | **12.1** + **12.2** + **12.5** done |
| **MVP composition** | **Done 2026-05-25** | **6.5** + **6.6** + **6.7** done (minimum) |
| **MVP pilote** | **Done 2026-05-25** | DoD MVP validée (recette `[MVP]` ; admin seul) |
| Post-MVP Epic 13 | Open | Après MVP pilote — priorité produit |
| **Migration staging recette** | **Done 2026-06** | Malice 2025-26 : stats + dispos + compos V1=V2 |
| **Hub / stats reviews** | **Done 2026-06** | **17-28**, **17-29**, **3-20** |
| **MIG-4** | **Done 2026-06** | Import `deplacement` → `category=deplacements` |
| **Annuaire public (4.1)** | **Done 2026-06** | Découvrir sans login ; hub gated membre/admin |
| **Iso-V1 / MEP gate** | **Closed 2026-06-02** | Slice fonctionnelle done — voir `sprint-status.yaml` |
| **V2.0.0 / cutover gate** | **Open** | § Wave V2.0.0 : **OPS-8**, **10.x**, **1.2b**, **1.6/1.7**, **6.15**, **17.34**, **OPS-4–6**, replay ×3, recette **1.2** + **1.3** ; **OPS-9/10** P1 post-M4 |
| **Domaine prod** | **Registered 2026-06-03** | **`hatcast.app`** — Cloudflare Registrar |

### PRD / UX references (V2)

- PRD **FR48–FR52** (agenda, routing, navigation) ; **FR20–FR28** (composition).
- UX : [ux-design-journey-league-agenda.md](_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md) (**amended 2026-05-25**, UX-DR13–21, Epic 17) ; [ux-design-hatcast-v2.md](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md) (onglets événement — dispos, équipe ; complète Screen 6).
- Correct Course stats/déplacements (post-MVP) : [sprint-change-proposal-2026-05-24-league-views-stats-deplacement.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24-league-views-stats-deplacement.md).
