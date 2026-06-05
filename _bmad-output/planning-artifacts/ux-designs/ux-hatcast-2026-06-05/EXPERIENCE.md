---
name: HatCast V2 — Event Infos calendar & maps
status: final
sources:
  - _bmad-output/implementation-artifacts/investigations/event-calendar-maps-v1-v2-parity-investigation.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-infos-tab
  - SPEC.md (event full-screen — add-to-calendar, maps in Infos)
updated: 2026-06-05
party-mode-review: 2026-06-05
---

# HatCast V2 — Event Infos calendar & maps — Experience Spine

> Brownfield parity feature: restore V1 add-to-calendar and venue navigation on the **Infos** tab of event detail. Visual specs: paired `DESIGN.md` in this folder. Implementation target: `app-event-infos-tab`.

## Foundation

- **Form factor:** mobile-first web PWA (`apps/web/`), desktop fully supported.
- **UI system:** Angular Material 3 — `mat-menu`, `mat-icon`, `MatSnackBar`, tokens `var(--mat-sys-*)`. Checklist: `docs/v2/technical/FRONTEND_UI.md`.
- **Scope surface:** Event detail → tab **Infos** only. No change to Dispos / Équipe / header gear.
- **Out of scope:** embedded map iframe, Maps API key, editing date/lieu from these rows (admin still uses existing edit flows), confirmed-team block in calendar export, `X-ALT-DESC` HTML extension in ICS (V1 Microsoft extension removed).

## Information Architecture

| Surface | Reached from | Purpose |
| ------- | ------------ | ------- |
| Event detail — Infos | Agenda card, deep link, hub actions | Metadata; **Date** and **Lieu** rows gain outbound actions |
| Calendar menu (overlay) | Tap Date row | Export to Google / Outlook / Apple (.ics) |
| Maps menu (overlay) | Tap Lieu row (when location set) | Open Google Maps or Waze in new tab |

Closure: every user who can view Infos can use calendar export and maps links — **including organizers on draft events** (PO 2026-06-05). No role gate.

## Parent → tab data contract (normative)

**Decision B1 (PO 2026-06-05):** slugs are passed via **`@Input()` from `event-detail` parent** — **not** via `ActivatedRoute` inside `EventInfosTab` (same convention as `EventDisposTab`, `EventEquipeTab`).

| Input | Type | Source (parent) | Used for |
| ----- | ---- | --------------- | -------- |
| `troupeSlug` | `string` | `routeTroupeSlug()` | `buildEventUrls` |
| `seasonSlug` | `string` | `slug()` (season) | `buildEventUrls` |
| `event` | `EventResponse` | loaded event | `event.slug`, `startsAt`, metadata |

- Do **not** reuse `troupeId` / `seasonId` (UUID) for URL building.
- **`origin`:** parent or tab obtains via `inject(DOCUMENT).location.origin` — never hardcode `window.location` in pure export utils (testability).
- **Guard:** if `event.slug` is empty or `startsAt` is invalid → calendar row **disabled** (no menu); maps row follows `location` rules only.

## Voice and Tone

Microcopy — brand voice unchanged (French, direct, no exclamation spam).

| Context | Copy |
| ------- | ---- |
| Calendar menu heading | *Ajouter à votre agenda :* |
| Calendar items | *Google* · *Outlook* · *Apple* |
| Maps items | *Ouvrir dans Google Maps* · *Ouvrir dans Waze* |
| Snackbar — ICS (navigateur standard) | *Fichier .ics téléchargé. Importez-le dans votre agenda.* |
| Snackbar — ICS (iOS / Safari détection UA) | *Agenda iOS ouvert pour confirmation.* |
| Snackbar — Google | *Google Calendar ouvert dans un nouvel onglet.* |
| Snackbar — Outlook | *Outlook ouvert dans un nouvel onglet.* |
| Snackbar — popup bloquée (calendrier) | *Ouverture bloquée. Autorisez les pop-ups pour ce site, puis réessayez.* |
| Snackbar — popup bloquée (carte) | *Ouverture bloquée. Autorisez les pop-ups pour ce site, puis réessayez.* |
| Snackbar — erreur générique calendrier | *Erreur lors de l'ajout au calendrier.* |
| Snackbar — événement passé (calendrier) | *Cet événement est passé — l'entrée sera ajoutée dans votre historique de calendrier.* |
| Empty lieu | *Non renseigné* (unchanged) |
| `aria-label` Date row | *Ajouter à votre agenda* |
| `aria-label` Lieu row | *Ouvrir le lieu dans une appli de navigation* |
| `aria-label` Calendar menu panel | *Options d'agenda* |

## Component Patterns

Behavioral. Visual: `DESIGN.md` → `event-infos-action-row`.

| Component | Use | Behavioral rules |
| --------- | --- | ---------------- |
| Date action row | Infos — DATE field | Whole row + picto is one `<button>` opening calendar `mat-menu`. Shows formatted `startsAt` (Europe/Paris). Disabled when `startsAt` invalid or `event.slug` missing. |
| Calendar menu | Overlay | Three items; each closes menu then runs export **synchronously** in click handler (see Implementation constraints). |
| Lieu action row | Infos — LIEU field | Shown **only** when `location` non-null/non-empty. Same button pattern as Date. `title` attribute = full location string (tooltip on truncate). |
| Maps menu | Overlay | Two external links; menu closes on selection; new tab. Final URL must start with `https://`. |
| Lieu static empty | Infos — LIEU | When no location: static text block, **not** a button. |
| Snackbar | After calendar/maps action | See Voice and Tone; ICS uses `politeness: 'assertive'` where side-effect needs announcement. Duration 3.5–4 s. |
| Chevron trailing | Date & Lieu rows | `expand_more` rotates **180°** when menu open (**Decision B3**, PO 2026-06-05). |

### Affordance (mobile)

Action rows must be **visually distinguishable at rest** from read-only fields (Titre, Description):

- Background slightly stronger than static fields (e.g. `color-mix(in srgb, var(--mat-sys-on-surface) 8%, transparent)` vs 6% for read-only).
- Trailing chevron uses `{colors.on-surface}` (not muted variant) on interactive rows.

See `DESIGN.md` → `event-infos-action-row` for token values.

### Calendar export payload (normative)

| Field | Rule |
| ----- | ---- |
| Title | Event `title` |
| Start | `startsAt` — **UTC ISO 8601 instant from API** (suffix `Z`) |
| End | **`startsAt + 4 hours`** (same instant arithmetic; survives DST) |
| Location | `location` if set — RFC 5545 escaped |
| Description | (1) `description` or empty · (2) *Type : {emoji} {label}* · (3) *Détails : {eventUrl}* — all RFC 5545 escaped |
| Event URL | `buildEventUrls(origin, troupeSlug, seasonSlug, event.slug).eventUrl` |
| Confirmed team | **Omitted** (PO decision) |
| `UID` | `{event.id}@{hostname}` where `hostname = new URL(origin).hostname` |
| `PRODID` | `-//HatCast//V2//FR` |

**Timezone / ICS format:**

- UI display: Europe/Paris (`formatDate` unchanged).
- ICS `DTSTART` / `DTEND`: UTC form with `Z` suffix (not floating `TZID` in v1).
- Google Calendar URL `dates=` parameter: UTC instants derived from same `startsAt` / +4h.

**RFC 5545 compliance (mandatory):**

- Escape `\`, `;`, `,` and newlines in `SUMMARY`, `DESCRIPTION`, `LOCATION`.
- Fold lines longer than **75 octets** with `CRLF + SPACE`.
- **No** `X-ALT-DESC` HTML field (removed vs V1).

Implementation: pure functions in `apps/web/src/app/core/events/event-calendar-export.ts` + unit tests in `event-calendar-export.spec.ts`.

### External URL patterns (maps)

| Provider | URL |
| -------- | --- |
| Google Maps | `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(location)}` |
| Waze | `https://waze.com/ul?q={encodeURIComponent(location)}` |

**Location string:** raw API value encoded — **no geocoding validation**. Free-text venues (e.g. *« Arrière-boutique de Marie »*) are passed as-is; search result quality depends on the provider. Acceptable for parity.

**Security:** before `window.open`, assert constructed URL `startsWith('https://')`.

### Implementation constraints (architecture)

| Rule | Rationale |
| ---- | --------- |
| Google/Outlook URL builders are **pure synchronous functions** | Avoid popup blockers (`window.open` must run in same click callstack — no `await` before open) |
| ICS generation is synchronous | Apple path: build blob + trigger download in click handler |
| Export logic **not** inlined in component | `event-calendar-export.ts` (+ optional `event-maps.ts` for map URL builders) |
| `window.open` return value checked | `null` → snackbar popup-blocked copy (not generic error only) |

## State Patterns

| State | Surface | Treatment |
| ----- | ------- | --------- |
| Event loading | Infos | Existing spinner at page level; action rows not rendered until event present. |
| Date ready | Date row | Interactive; menu available if `startsAt` + `event.slug` valid. |
| Date invalid / no slug | Date row | Button **disabled**; no menu. |
| Lieu set | Lieu row | Interactive; maps menu + truncate + `title` tooltip with full address. |
| Lieu empty | Lieu field | Static *Non renseigné* — no menu, no chevron. |
| **Draft event** | Infos | **Calendar and maps menus remain available** (**Decision B2**, PO 2026-06-05). Organizer may export a link to an unpublished spectacle; link may 403/404 for members until publish — accepted. |
| **Past event** (`startsAt < now`) | Date row | Menu **available**; on calendar export show warning snackbar (*événement passé…*) before or after action (once per session optional — implementer may show on each export for clarity). |
| Menu open | Date or Lieu | `aria-expanded="true"` on trigger; chevron rotated 180°; backdrop dismiss per Material. |
| Calendar error | Snackbar | Distinguish popup blocked vs generic error (see Voice and Tone). |
| Maps error | Snackbar | Popup blocked copy or generic open failure. |
| Archived event | Infos | Calendar/maps remain available (same as V1). |

## Interaction Primitives

- **Tap** action row → open `mat-menu` (not navigate away).
- **Tap** menu item → close menu → side effect (new tab or download) **without async gap before `window.open`**.
- **External links:** always new tab + `noopener noreferrer`.
- **Keyboard:** trigger focusable; menu keyboard nav per Material; Enter/Space opens menu.
- **Chevron:** CSS `transform: rotate(180deg)` when menu open class on trigger.
- **Banned for this feature:** iframe embed, second modal layer, bottom sheet for calendar options, div-only click targets, `ActivatedRoute` in `EventInfosTab`, async chain before `window.open`.

## Accessibility Floor

- Date and Lieu action rows: native `<button>` with French `aria-label` (see Voice and Tone — short labels, no duplicate of visible label text).
- Decorative `mat-icon`: `aria-hidden="true"`.
- Calendar `<mat-menu>`: `aria-label="Options d'agenda"` on panel.
- Menu items: visible text labels (no icon-only items).
- Touch targets: row min-height **48px**; full row width tappable.
- Focus visible: M3 focus ring on button (`:focus-visible`).
- Snackbar after ICS download: `{ politeness: 'assertive', announcementMessage: <copy FR> }` where supported.
- External navigation: snackbar confirms action when popup succeeds.

## Responsive & Platform

- **≤ 480 px:** primary design target; full-width rows; location truncates with ellipsis.
- **Menu positioning:** `mat-menu` below trigger, start-aligned; on mobile apply `overlayPanelClass` so panel `max-height: calc(100dvh - env(safe-area-inset-bottom) - 8px)` — both map items fully visible on 375×667 without clipping.
- **Desktop:** same interaction (menu, not hover-only for primary actions); hover background lift allowed.
- **PWA / iOS Safari:** ICS may open native Calendar sheet — use iOS-specific snackbar copy when UA indicates iOS/Safari.

## Inspiration & Anti-patterns

- **Lifted from V1 (`GridBoard.vue` Infos):** date/lieu as clickable rows; calendar tri-choice; Google Maps + Waze links.
- **Rejected — embedded map (V1 iframe):** PO chose links-only.
- **Rejected — équipe confirmée in export:** PO chose leaner personal calendar entry.
- **Rejected — picto-only hit target:** PO requires full row + picto.
- **Rejected — `ActivatedRoute` in tab:** breaks tab testing convention (B1).
- **Rejected — disabling menus on draft:** PO wants export available for organizers (B2).

## Key Flows

### Flow 1 — Add spectacle to personal calendar (Léa, membre, dans le métro)

1. Léa opens a spectacle from l'agenda → onglet **Infos** (default).
2. She reads the date in the **DATE** block (chevron visible — row looks tappable).
3. She taps anywhere on the date row (icon, text, or chevron).
4. Menu *Ajouter à votre agenda :* appears; chevron points up.
5. She chooses **Google**.
6. **Climax:** Google Calendar opens in a new tab with correct UTC-based times (+4 h), lieu if any, and *Détails* link — snackbar confirms.

Failure: popup blocked → *Ouverture bloquée…* snackbar; retry or Apple (.ics).

### Flow 2 — Open venue in maps (Marc, organisateur, before load-in)

1. Marc opens the spectacle → **Infos**.
2. **LIEU** shows *Local Malice, Lille* (truncated; full text in `title`).
3. He taps the lieu row.
4. Menu offers Google Maps and Waze.
5. He picks **Waze**.
6. **Climax:** Waze opens with encoded location query.

Failure: no location → *Non renseigné*; no menu.

### Flow 3 — Export draft as organizer (Patrice, brouillon)

1. Patrice opens a **draft** spectacle he is admin on → **Infos**.
2. Date and Lieu rows are **enabled** (same as published).
3. He exports to Google Calendar with canonical URL.
4. **Climax:** Calendar entry created; link works for him; members without access may not open until publish — **accepted** (B2).

## Story acceptance criteria (preview for `bmad-create-story`)

Normative checklist — copy into story **6-19** (or equivalent):

| ID | Criterion |
| -- | --------- |
| AC-01 | `EventInfosTab` receives `troupeSlug` + `seasonSlug` via `@Input` from `event-detail`; no `ActivatedRoute` in tab. |
| AC-02 | `origin` from `DOCUMENT` token; export utils are pure functions taking `origin` param. |
| AC-03 | ICS conforms RFC 5545: escape, line fold, `UID`, no `X-ALT-DESC`. |
| AC-04 | Unit tests: `startsAt` UTC +4h across DST boundaries (summer, winter, midnight cross). |
| AC-05 | `event-infos-tab.spec.ts`: menus, `window.open`, ICS download, snackbars, lieu absent/present. |
| AC-06 | `window.open === null` → popup-blocked snackbar (calendar + maps). |
| AC-07 | Logic in `event-calendar-export.ts` (+ tests); not inlined in component. |
| AC-08 | `PRODID` V2; `UID` uses event id + hostname. |
| AC-09 | Draft events: calendar/maps menus **visible** (not disabled). |
| AC-10 | Lieu button `title` = full location when truncated. |
| AC-11 | Past event: warning snackbar on calendar export. |
| AC-12 | Mobile menu not clipped (375×667); action row affordance at rest. |
| AC-13 | Chevron rotates 180° when menu open. |
| AC-14 | Map URLs validated `https://` before open. |

## Open Questions

_All resolved 2026-06-05 — see `.decision-log.md`._

| ID | Question | Resolution |
| -- | -------- | ------------ |
| B1 | Slugs via `@Input` or `ActivatedRoute`? | **@Input from parent** |
| B2 | Menus on draft events? | **Yes — visible** |
| B3 | Animated chevron? | **Yes — rotate 180° when open** |

## Handoff to implementation

| Next step | Skill / artifact |
| --------- | ---------------- |
| Story file | `bmad-create-story` (epic 6, e.g. `6-19-event-infos-calendar-maps`) — use AC preview above + M3 checklist |
| Export util | `apps/web/src/app/core/events/event-calendar-export.ts` |
| Map URLs | `apps/web/src/app/core/events/event-maps.ts` (or same module) |
| UI | `event-infos-tab` + bindings in `event-detail.html` |
| Design delta | Amend `DESIGN.md` affordance + chevron tokens if not already aligned |

Mock coverage: **spine-only** — layout follows existing Infos fields.
