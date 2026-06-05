# Investigation: Event Infos — calendar export & venue map (V1 → V2 parity)

## Hand-off Brief

1. **What happened.** V1 exposes **interactive** date (add-to-calendar: Google, Outlook, Apple/ICS) and venue (Google Maps, Waze, embedded map) on the event Infos tab; V2 renders the same fields **read-only** with non-clickable Material icons — a **confirmed parity gap** against `SPEC.md`, UX spec, and product brief, deliberately deferred at story **6.2**.
2. **Where the case stands.** **Concluded** — static code audit complete; no runtime repro required. Open product decisions: embedded map vs links-only in V2; calendar end-time rule; whether to include confirmed team in export description.
3. **What's needed next.** Run **`bmad-ux`** (M3 menus on date/place pictos) then **`bmad-create-story`** under epic 6, using the **Story input contract** section below as the normative delta.

## Case Info

| Field            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Ticket           | N/A (parity request — calendar + maps on event Infos)                 |
| Date opened      | 2026-06-05                                                            |
| Status           | Concluded                                                             |
| System           | HatCast monorepo — V1 `legacy/`, V2 `apps/web/` (Angular)             |
| Evidence sources | Source code (primary), `SPEC.md`, UX spec, story 6.2 (secondary)      |

## Problem Statement

User request: restore V1 ability to **save events to personal calendars** and **open venue maps** by clicking pictos on the event Infos tab in V2. Premise to verify: V1 behaviour is documented and reproducible from code; V2 gap is intentional deferral, not a spec change.

## Evidence Inventory

| Source | Status | Notes |
| ------ | ------ | ----- |
| `legacy/src/services/calendarService.js` | Available | ICS, Google, Outlook link builders |
| `legacy/src/components/GridBoard.vue` | Available | Infos UI, dropdowns, map embed |
| `apps/web/.../event-infos-tab.{html,ts}` | Available | V2 read-only Infos |
| `apps/web/.../event-urls.ts` | Available | V2 canonical URL builder |
| `SPEC.md` § event full-screen | Available | Requires add-to-calendar + maps in Infos |
| `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` § Infos | Available | Dropdown affordance on DATE/LIEU |
| Story `6-2-detail-evenement-...md` | Available | AC8 read-only; no calendar/maps story filed |
| `functions/index.js` `getGoogleMapsApiKey` | Available | **Commented out** — prod embed key path inactive |
| V1 production runtime / manual QA | Missing | Static audit sufficient for parity spec |
| V2 Google Maps env / API proxy | Missing | No `GOOGLE_MAPS_*` in `apps/web/` today |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --------------- | -------- | ------ | ----- |
| 1 | V1 calendarService + GridBoard handlers | High | Done | Full export matrix |
| 2 | V2 event-infos-tab + event-detail composition | High | Done | Parent has composition signal |
| 3 | Maps API key / embed infra V2 | Medium | Done | No V2 infra yet |
| 4 | Manual V1 click test (calendar buttons) | Low | Blocked | Template refs `addToGoogleCalendar` undefined in script — see Side Finding 1 |

## Timeline of Events

| Time | Event | Source | Confidence |
| ---- | ----- | ------ | ---------- |
| V1 shipped | Calendar export + map UI on event Infos | `GridBoard.vue`, `calendarService.js` | Confirmed |
| Story 6.2 (done) | V2 Infos: read-only DATE/LIEU, decorative icons | `6-2-...md` AC8, `event-infos-tab.html` | Confirmed |
| SPEC (normative) | Infos must include add-to-calendar + maps | `SPEC.md:156,241,257` | Confirmed |
| 2026-06-05 | Parity investigation opened | This case file | Confirmed |

## Confirmed Findings

### Finding 1: V1 calendar export — three channels, shared description builder

**Evidence:** `legacy/src/services/calendarService.js:78-264`

**Detail:**

| Channel | Mechanism | User feedback (V1) |
| ------- | --------- | ------------------- |
| **Google** | `window.open` → `calendar.google.com/calendar/render?action=TEMPLATE&...` | Toast: « Google Calendar ouvert dans un nouvel onglet » |
| **Outlook** | `window.open` → `outlook.live.com/calendar/0/deeplink/compose?...` | Toast: « Outlook ouvert dans un nouvel onglet » |
| **Apple** | `downloadICSFile` → Blob `.ics` download | Toast: « Fichier .ics téléchargé ! Importez-le dans votre agenda » |

**ICS payload includes:** `SUMMARY` (title), `DESCRIPTION`, optional `LOCATION`, `DTSTART`/`DTEND`, `UID`, 1h `VALARM`, categories, Microsoft busy-status extensions (`calendarService.js:101-131`).

**Description composition (all channels):**

1. Event `description` (or empty)
2. If composition **confirmed** (`confirmedByAllPlayers` or legacy `confirmed`): append `✅ ÉQUIPE CONFIRMÉE : {names}` with role suffix for non-player roles (`calendarService.js:13-72,88-92`)
3. Append event type emoji + label (`EVENT_TYPE_ICONS`, `ROLE_TEMPLATES`)
4. Append canonical link: `{origin}/season/{seasonSlug}/event/{event.id}` (`calendarService.js:97-99,176-178`)

**Time model (V1 — important delta vs V2):**

- Uses **`event.date`** (date-only), **not** stored hour from Firestore
- Hardcodes **19:00 → 23:00** local via `setHours(19,0)` / `setHours(23,0)` then ISO UTC (`calendarService.js:79-83,158-162`)
- V2 stores **`startsAt`** ISO datetime with real hour (`event-api.service.ts:14`, `event-infos-tab.ts:118-127`)

**Event URL (V1):** `/season/{seasonSlug}/event/{eventId}` — season-only prefix, UUID id (`calendarService.js:98,177`).

### Finding 2: V1 venue — external links + embedded map (API key dependent)

**Evidence:** `legacy/src/components/GridBoard.vue:923-958,7708-7779,3104-3109`

**Detail:**

**When `location` is set:**

- **Trigger:** whole row is a `<button>` (pin + truncated address + chevron); `title="Ouvrir {location} dans Google Maps"`
- **Dropdown:** two external links (new tab, `noopener`):
  - Google Maps search: `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(location)}` (`GridBoard.vue:941`)
  - Waze: `https://waze.com/ul?q={encodeURIComponent(location)}` (`GridBoard.vue:942`)
- **Embedded preview:** `<iframe>` h-48, `loading="lazy"`, src from `getGoogleMapsEmbedUrl(location)` (`GridBoard.vue:946-955`)
- Embed URL: `https://www.google.com/maps/embed/v1/search?key={API_KEY}&q={location}&zoom=15` (`GridBoard.vue:7726-7729`)
- **API key resolution:**
  - **Dev:** `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`; if missing → empty iframe (`GridBoard.vue:7716-7722`)
  - **Prod:** Firebase callable `getGoogleMapsApiKey` — **function commented out** in `functions/index.js:1027-1047`
- **Watcher:** `loadGoogleMapsEmbedUrl(newEvent.location)` on `selectedEvent` change (`GridBoard.vue:3104-3109`)

**When `location` is empty:**

- Copy: *« Aucun lieu renseigné »* (italic grey) — **no** map block, **no** dropdown (`GridBoard.vue:958`)

**UI parity:** Same blocks exist in compact mobile Infos and full desktop Infos tab (`GridBoard.vue:396-397` vs `897-959`).

### Finding 3: V2 Infos — display only, no calendar or map actions

**Evidence:** `apps/web/src/app/pages/event-detail/event-infos-tab.html:18-35`, `event-infos-tab.ts:118-128`

**Detail:**

- **DATE:** `mat-icon` `event` + `formatDate(startsAt)` in Europe/Paris — **not** a button, **no** menu
- **LIEU:** `mat-icon` `place` + text or *« Non renseigné »* — **not** clickable, **no** iframe, **no** external links
- No `calendarService` equivalent under `apps/web/`
- No Google Maps references in `apps/web/` env or services (grep 2026-06-05)

### Finding 4: Gap is normative (SPEC + UX), intentionally sliced out of 6.2

**Evidence:** `SPEC.md:156,241,257`; `ux-design-hatcast-v2.md:527-528`; `6-2-...md:28`

**Detail:** Story **6.2** AC8 explicitly delivered **read-only** labeled fields with calendar/pin icons only. Full-screen shell + tabs were in scope; **add-to-calendar** and **maps** were not listed in 6.2 out-of-scope table but were **not implemented** — they remain **SPEC debt**. No dedicated story exists in `sprint-status.yaml` (grep 2026-06-05).

### Finding 5: V2 canonical event URL differs from V1 calendar links

**Evidence:** `apps/web/src/app/core/messaging/event-urls.ts:1-11` vs `calendarService.js:97-98`

| | V1 (calendarService) | V2 (buildEventUrls) |
| --- | --- | --- |
| Path | `/season/{seasonSlug}/event/{eventId}` | `/saison/{troupeSlug}/{seasonSlug}/event/{eventSlug}` |
| Id | UUID | Slug |
| Prefix | `season` | `saison` + troupe segment |

**Requirement:** New V2 calendar service **must** use `buildEventUrls` (or equivalent) — SPEC still references legacy path in prose but V2 runtime uses `/saison/...` (ADR 0013 league journey).

### Finding 6: Confirmed-team block in export needs composition context (available on parent)

**Evidence:** `event-detail.ts:161-162,778-787`; `event-infos-tab` has no composition `@Input`

**Detail:** V1 passes `casts.value[eventId]` + `players` into `addToCalendar`. V2 parent `event-detail` already loads `CompositionResponse` via `CompositionApiService.getComposition`. Infos tab would need `@Input()` composition + participant display names (or a shared util) to parity the `✅ ÉQUIPE CONFIRMÉE` block — only when team is fully confirmed (V1: `confirmedByAllPlayers || confirmed`).

## Deduced Conclusions

### Deduction 1: Minimum V2 parity = client-only feature in `event-infos-tab`

**Based on:** Findings 1–3, 5

**Reasoning:** All V1 calendar/map behaviour is browser-side (URL generation, file download, iframe). No V2 API change required unless choosing server-proxied Maps API key.

**Conclusion:** Story scope = `apps/web/` (+ optional env doc for Maps embed key).

### Deduction 2: Calendar times should follow `startsAt`, not V1 19:00 default

**Based on:** Finding 1 vs V2 data model

**Reasoning:** V2 event form captures real start time (`startsAt`). Blind copy of V1 `setHours(19,0)` would **regress** accuracy.

**Conclusion:** Use `startsAt` for `DTSTART`; define end as **`startsAt + 4h`** (V1 duration) or **`startsAt + 2h`** — **PO decision** (see Open Questions).

### Deduction 3: Embedded map is optional for MVP if external links suffice

**Based on:** Finding 2, Missing Maps infra in V2

**Reasoning:** Dropdown links work without API key. Embed requires `VITE_GOOGLE_MAPS_API_KEY` (dev) or new V2 secret/proxy (prod). V1 prod embed path is **likely broken** (Firebase function commented).

**Conclusion:** Story can ship **Phase A:** Google Maps + Waze links only; **Phase B:** iframe embed + key management.

## Hypothesized Paths

### Hypothesis 1: User premise « V1 had working calendar buttons » is fully true

**Status:** **Refuted** (partial)

**Theory:** Template handlers `addToGoogleCalendar`, `addToOutlookCalendar`, `addToAppleCalendar` invoke working wrappers.

**Would confirm:** Function definitions in `GridBoard.vue` script.

**Would refute:** Absence of definitions — only `handleAddToCalendar(type, event)` exists (`GridBoard.vue:9030-9040`).

**Resolution:** Grep repo-wide — **no script definitions** for the three `addTo*Calendar` names. Intended wiring is `handleAddToCalendar('google'|'outlook'|'ics', event)`. **Possible V1 runtime bug** on calendar menu clicks; `calendarService.js` itself is complete. V2 implementation should call a typed helper directly, not replicate the broken indirection.

### Hypothesis 2: V2 deliberately removed maps/calendar as out-of-scope MVP

**Status:** **Confirmed**

**Theory:** 6.2 scoped shell only.

**Resolution:** AC8 read-only fields + no follow-up story in sprint tracker.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| Manual V1 calendar click on production | Confirm/refute Hypothesis 1 in live V1 | PO click test on legacy deploy |
| PO preference: embed vs links-only | Scope story AC | `bmad-ux` session |
| End time rule for calendar export | ICS/Google/Outlook correctness | PO + DOMAIN (spectacle duration) |
| Confirmed team in export (Y/N for MVP) | Description parity | PO — privacy/noise tradeoff |

## Source Code Trace

| Element | Detail |
| ------- | ------ |
| V1 calendar origin | `legacy/src/services/calendarService.js` — `addToCalendar`, `generateICSFile`, link builders |
| V1 calendar trigger | `GridBoard.vue` date section button → dropdown → intended `handleAddToCalendar` |
| V1 map trigger | `GridBoard.vue` lieu button → dropdown links; iframe via `loadGoogleMapsEmbedUrl` |
| V2 gap location | `apps/web/src/app/pages/event-detail/event-infos-tab.html:18-35` |
| V2 URL builder | `apps/web/src/app/core/messaging/event-urls.ts:buildEventUrls` |
| Composition for export | `apps/web/src/app/pages/event-detail/event-detail.ts` — `composition` signal |

## V1 → V2 parity matrix (story input contract)

### Calendar export

| Behaviour | V1 | V2 target |
| --------- | -- | --------- |
| Entry point | Click date row (📆 + formatted date + chevron) | Click date row / `event` picto (`mat-menu` M3) |
| Menu label | « Ajouter à votre agenda : » | Same FR copy |
| Google | New tab, Google Calendar template URL | Same |
| Outlook | New tab, Outlook deeplink | Same |
| Apple | Download `.ics` | Same |
| Success feedback | Toast 3s | `MatSnackBar` (align 6.x patterns) |
| Description body | description + optional équipe confirmée + type + lien | Same semantics; V2 URL via `buildEventUrls` |
| Location field in export | If `event.location` | If `event.location` |
| Start/end time | **19:00–23:00** from date-only | **`startsAt`** + agreed duration |
| Composition data | `casts[eventId]` when confirmed | `CompositionResponse` from parent when team confirmed |

### Venue / map

| Behaviour | V1 | V2 target |
| --------- | -- | --------- |
| Entry point | Click lieu row (📍 + address + chevron) | Click `place` picto / row (`mat-menu`) |
| Google Maps | External search link | Same URL pattern |
| Waze | External deeplink | Same |
| Embedded map | iframe 192px (`h-48`) if API key | **Optional** — PO/UX |
| No location | *« Aucun lieu renseigné »* | Keep *« Non renseigné »* (V2 copy OK); **hide** menu and map |
| API key | `VITE_GOOGLE_MAPS_API_KEY` / Firebase (disabled) | New env + doc, or defer embed |

### Non-goals (keep out of story unless PO expands)

- Editing date/location from picto (admin uses existing `EventFormDialog` / gear)
- Backend calendar feed / subscription
- Replacing Waze with Apple Maps

## Conclusion

**Confidence:** **High**

V1 **calendarService** and **map UI patterns** in **GridBoard Infos** are fully auditable. V2 **deliberately** shipped read-only Infos (story 6.2) while **SPEC and UX still require** interactive calendar and map affordances. The gap is **confirmed parity debt**, not a missing product decision. Implementation is **front-end only** with one structural choice (embedded map + API key) and two product choices (end time rule, confirmed-team in description).

## Recommended Next Steps

### Fix direction

1. **`bmad-ux`** — M3 spec: `mat-menu` on date/place; mobile ≥48dp; `aria-label` « Ajouter à l'agenda », « Ouvrir le lieu »; decide embed vs links-only.
2. **`bmad-create-story`** — Epic 6 (e.g. `6-19-event-infos-calendar-maps-parity`): AC from parity matrix above + M3 checklist.
3. **Implementation sketch:** new `apps/web/src/app/core/events/event-calendar-export.ts` (port logic from `calendarService.js` with V2 types/URLs); extend `event-infos-tab` with menus; optional `event-maps.ts` for link builders; pass composition `@Input` from `event-detail`.

### Diagnostic

- PO manual test on V1 legacy: confirm whether calendar dropdown currently errors (Hypothesis 1).
- If embed required: decide V2 key strategy (public embed key + domain restriction vs links-only).

## Reproduction Plan

**V1 reference (legacy dev):**

1. Open `/season/{slug}/event/{id}` → Infos tab.
2. Click date row → expect menu Google / Outlook / Apple.
3. Event with location → click lieu → Google Maps + Waze; iframe if `VITE_GOOGLE_MAPS_API_KEY` set.
4. Event without location → italic empty copy, no map.

**V2 gap repro:**

1. Open `/saison/{troupe}/{season}/event/{slug}` → Infos.
2. Date and lieu icons are decorative — no menu, no navigation.

**V2 acceptance (post-story):**

1. Same user flows as V1 with M3 menus.
2. Exported calendar event link resolves to V2 canonical URL.
3. ICS `DTSTART` matches displayed `startsAt` (Europe/Paris).

## Side Findings

- **Side Finding 1 (Confirmed):** `GridBoard.vue` template calls `addToGoogleCalendar` / `addToOutlookCalendar` / `addToAppleCalendar` but **no script definitions** exist — only `handleAddToCalendar`. Likely **latent V1 bug** on menu click (`GridBoard.vue:915-917` vs `:9030`).
- **Side Finding 2 (Confirmed):** `mobileMapEmbedUrl` is populated but **never used** in template; iframe always uses `mapEmbedUrl` (`GridBoard.vue:7705-7779`).
- **Side Finding 3 (Confirmed):** Firebase `getGoogleMapsApiKey` is **commented out** (`functions/index.js:1027-1047`) — V1 prod embed may show blank iframe even with location set.

## Open Questions for PO / UX

1. **Embedded map in V2?** Links-only MVP vs iframe + API key management.
2. **Calendar end time:** `startsAt + 4h` (V1 duration) vs fixed 2h vs all-day flag.
3. **Include confirmed team names** in calendar description (V1 yes, when composition confirmed)?
4. **Click target:** picto only vs entire date/lieu row (V1 = entire row)?
