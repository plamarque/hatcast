---
title: HatCast V2 — UX continuity & screen references
status: draft
source: V1 screenshots + stakeholder input
related_pr: _bmad-output/planning-artifacts/prd.md
---

# HatCast V2 — UX continuity & screen references

This document captures **layout, navigation, and visual intent** from HatCast **V1** that should carry into **V2** (**Angular 21** + **Angular Material**, new API). It does **not** prescribe pixel-perfect porting; it is a **reference** for designers and developers.

**Principles (from architecture + PRD):**

- Preserve **familiar structure** and **overall visual mood** where stakeholders are satisfied with V1.
- Implement with **Angular Material** and a **token/theme** layer (Material theming + design tokens)—not by copying ad-hoc utility CSS as the primary approach.
- UI copy may remain **French** as in V1 unless product decides otherwise.

---

## Screen: Seasons list (`/seasons`) {#screen-seasons-list-seasons}

### Purpose

Let the user see **all seasons they can access**, choose one to enter, or **create a new season**. The screen is **card-driven** and **tap/click-first**.

### Reference capture

- **File:** [`ux-references/seasons-list-v1.png`](ux-references/seasons-list-v1.png) (V1 screenshot, repository-relative path under `_bmad-output/planning-artifacts/`).

### Global chrome (applies to this screen)

| Zone | Behaviour | V1 pattern to preserve |
|------|-----------|-------------------------|
| **Top-left** | Navigate **back** to the **marketing / landing** entry of the site | Small **chevron/back** control |
| **Top-right** | Access **account / user menu** | **Avatar** (or avatar placeholder) opening user menu |
| **Page title** | Clear screen title | **“Saisons”** (large, bold) |
| **Subtitle** | Short helper text | e.g. *« Rejoins une saison existante ou crée la tienne »* |

### Primary action

- **“Nouvelle saison”** — high-emphasis **pill / rounded** button with **icon + label** (e.g. `+`), placed **below** title/subtitle, centered in the header block.
- **Continuity:** keep **one obvious primary CTA** in the header cluster, not buried in a toolbar.

### Season cards (main content)

**Layout**

- **Responsive grid/row** of **cards**; each card is a **single clickable** target (whole card navigates to the season), with optional **secondary** actions on a **kebab/overflow** menu.

**Card contents (top → bottom)**

1. **Overflow** — top-right: **⋮** menu for season-level actions (edit, archive, etc.—exact actions are product-defined).
2. **Troupe logo** — **circular** image, centered in upper area.
3. **Season title** — bold, e.g. `Malice 2025-2026`, may include emoji in name.
4. **Short description** — 2–3 lines, muted/smaller text, centered.
5. **Divider** — thin horizontal rule.
6. **Stats row** — two metrics, **side by side**:
   - **Événements** + numeric count  
   - **Participants** + numeric count  

**Interaction**

- **Card body:** primary click → **open season** (same intent as V1).
- **⋮ menu:** secondary actions without stealing the whole-card click (use click/stop propagation as appropriate in implementation).

### Visual style (V1 mood to reconcile in V2)

- **Background:** diagonal **purple → deep blue** gradient; calm, “night” feel.
- **Cards:** **rounded** corners, **semi-transparent** dark panels, **subtle** border; readable on gradient.
- **Accent:** **pink → purple** gradient for **primary** buttons (e.g. Nouvelle saison).
- **Typography:** **sans-serif**, white/light text; clear hierarchy (title > subtitle > card title > meta).

**V2 note:** Map these to **design tokens** (background, surface, border, accent gradient, text primary/secondary) and **Angular Material** theme overrides—avoid hardcoding one-off colors in components.

### Acceptance hints (for QA / design review)

- [ ] Back control returns to **landing**, not an arbitrary history entry (unless product specifies otherwise).
- [ ] User menu remains **top-right**; season creation remains **visually primary** vs cards.
- [ ] Cards remain **scannable**: logo, title, two stats, one overflow affordance.
- [ ] Touch targets for card and primary button meet mobile usability expectations.

---

## Screen: Season calendar / event list (inside a season) {#screen-season-calendar}

### Purpose

After the user **opens a season** (from `/seasons`), show a **time-ordered** list of **spectacles** (events) for that season, **grouped by month**, in a **calendar-style** layout. On the **Agenda** view specifically, the list is **upcoming-only** (see **Agenda content scope** below); **past** shows belong to [**Historique**](#screen-season--historique-participation-stats), not the Agenda list. The user scans upcoming shows, sees **composition status** and **their own availability/role** at a glance, and **opens detail** by tapping a card. **Filters** narrow the view by **people** and/or **events**; a control switches to **other season views** — notably **Historique** (stats + month-by-month history), available to **all** users alongside **Agenda**.

### Reference capture

- **File:** [`ux-references/season-calendar-v1.png`](ux-references/season-calendar-v1.png) (V1 screenshot, example season **“Malice 2025-2026”**).
- **V2 reminder (Agenda, upcoming list):** [`ux-references/season-agenda-v2-upcoming-malice-2026.png`](ux-references/season-agenda-v2-upcoming-malice-2026.png) — month grouping, cards, badges composition, avatars (align implementation with this mood).

### Agenda content scope (product rule)

**Vue Agenda — quoi afficher**

- **Uniquement** des spectacles **non archivés** (`archived` / équivalent métier = faux pour l’événement).
- **Uniquement** des spectacles dont la **date/heure de début** n’est **pas dans le passé** par rapport au **moment présent**, **en incluant toute la journée « aujourd’hui »** : un spectacle prévu **le jour courant** doit apparaître (tant qu’il n’est pas archivé), même si l’heure est déjà passée ou à venir dans la journée — la borne est le **jour civil**, pas l’instant exact, sauf décision produit contraire documentée.
- **Implémentation :** appliquer la même règle **côté API** (query param dédié, ex. `scope=upcoming`, ou endpoint agenda) **et** côté UI pour éviter les divergences ; trancher explicitement le **fuseau** utilisé pour « aujourd’hui » (recommandation : fuseau **utilisateur** ou **Europe/Paris** pour HatCast — à figer dans le code / config et les tests).

**Ce qui est exclu de l’Agenda**

- Spectacles **archivés** (visibilité admin ailleurs si besoin).
- Spectacles **passés** (jour civil strictement avant aujourd’hui) → **Historique** ou vues dédiées, pas la liste Agenda.

### Global chrome (season header)

| Zone | Behaviour | V1 pattern to preserve |
|------|-----------|-------------------------|
| **Left** | **Back** to the **season list** (`/seasons`) | **Chevron** `<` (not the marketing landing—**in-app hierarchy**). |
| **Left (next to back)** | **Troupe logo** (square/rounded thumbnail) | Reinforces **which troupe** this season belongs to. |
| **Center** | **Season title** | Bold, e.g. **“Malice 2025-2026”**. |
| **Right** | **Settings** (season/admin entry) | **Cog** icon (season-level settings where permitted). |
| **Right** | **User menu** | **Avatar** (same pattern as `/seasons`). |

### Filter and view controls (below header)

- **Participant filter** — dropdown showing **current user** (avatar + name) or “focus” selection for **who** the grid reflects (e.g. self vs other member when applicable). Elsewhere, tapping a **member avatar** opens the [**Member profile**](#pattern-member-profile) popover (season stats + chart).
- **Event filter** — dropdown, e.g. **“Tous”** (all events) vs subset of spectacles.
- **View switcher** — tabs or pills (V1: **Participants**, **Spectacles**, **Agenda**, **Historique**) to move between **season workspaces**; **Agenda** = this [calendar / event list](#screen-season-calendar); **Historique** = [participation statistics table](#screen-season--historique-participation-stats).

**Continuity:** keep **one compact toolbar row** under the header so filters + view switch stay **visible without scrolling** on mobile.

### Main content: events by month

**Month grouping**

- Each month has a **centered label** (e.g. **“mai 2026”**) in a **pill** on a **horizontal divider**—clear **chronological** scanning.

**Event row / card (one per spectacle)**

Each row is a **single primary click** → **event detail** (full screen or route per SPEC).

**Layout (three columns, left → right)**

1. **Date column** — large **day number**; smaller **weekday** (e.g. *mardi*); subtle **vertical separator** before the middle column.
2. **Event info** — **type icon** (spectacle type), **title** (e.g. *Apérock Mai*, *Match vs …*), **status pill** for the **composition**:
   - e.g. **orange** — *Équipe en préparation*
   - e.g. **green** — *Équipe confirmée*
3. **User status / role** — prominent **pill or box** for the **connected user**:
   - **Unavailable / not selected** — red-tinted (*Pas dispo*, subtext *tu n'es pas disponible* / *tu n'es pas sélectionné* as applicable).
   - **In team** — purple gradient, role label (*Joueur*, *Assistant*, …) + positive subtext (*tu es dans l'équipe!*).
   - **Available, not selected** — green (*Dispo*, *tu n'es pas sélectionné*).

**Interaction**

- **Whole card** navigates to **spectacle detail** (primary).
- Filters and view switcher **do not** require leaving the season context.

### Visual style (V1 mood)

- **Background:** dark **navy / charcoal** (may differ slightly from `/seasons` gradient—still **dark theme** family).
- **Functional colours:** **orange** (in progress), **green** (confirmed / available), **red** (blocked/unavailable), **purple gradient** (assigned role)—map to **semantic tokens** in V2.
- **Cards:** rounded, separated by **gaps**; readable hierarchy (date → title → badges).

### Acceptance hints (for QA / design review)

- [ ] Back returns to **`/seasons`**, not landing (unless product overrides).
- [ ] Header shows **logo + season name + user avatar**; **settings** visible when user has permission.
- [ ] Events are **grouped by month** with a clear month header.
- [ ] Each card shows **date**, **title**, **composition status**, and **current user’s** dispo/role summary.
- [ ] Card click opens **event detail**; filters and view switcher behave without losing season scope.
- [ ] **Historique** is reachable from the **view switcher** without ambiguity ([spec](#screen-season--historique-participation-stats)).
- [ ] **Agenda** liste uniquement spectacles **non archivés** et **à partir d’aujourd’hui** (jour civil inclus), conformément à **Agenda content scope** ci-dessus.

---

## Screen: Season — Historique (participation stats) {#screen-season--historique-participation-stats}

### Purpose

In addition to the [**Agenda**](#screen-season-calendar), **every user** with access to the season can open **Historique**: a **data-dense** view of **participation statistics** and **per-person, month-by-month** history. It answers *how often* each member contributed in **broad role families** (jeu, décorum, déplacement, bénévolat) and *what happened* in each month (spectacles, roles, status).

### Reference captures

| File | What it shows |
|------|----------------|
| [`ux-references/season-history-summary-v1.png`](ux-references/season-history-summary-v1.png) | **Summary** grid — per-member rows; **JEU**, **DECORUM**, **DEPLAC.**, **BÉNÉVOLE** columns with count + %; **month** columns (e.g. Septembre–Novembre 2025); **Exporter** + **Masquer**; filters **Tous**. |
| [`ux-references/season-history-jeu-expanded-v1.png`](ux-references/season-history-jeu-expanded-v1.png) | **JEU** expanded — sub-columns **JEU MATCH**, **JEU CAB**, **JEU LONG**, **JEU AUTRE**, **TOTAL JEU**; *« masquer les détails »* / *« voir les détails »* toggles. |
| [`ux-references/season-history-month-detail-v1.png`](ux-references/season-history-month-detail-v1.png) | **Month drill-down** — event row in cell (e.g. *Cab CCAS #1*, date, *Équipe confirmée*); role chips (*Joueur* / *Joueuse*); **—** when not involved; tooltip *« Sélectionné - en attente de confirmation »*. |

### Global chrome (same season shell)

Same **header** as Agenda: **back** → `/seasons`, **troupe logo**, **season title**, **settings**, **user menu**. **Tabs** on the right (or equivalent): **Participants**, **Spectacles**, **Agenda**, **Historique** — **Historique** active.

### Toolbar

- **Two dropdown filters** — e.g. both **« Tous »** (subset of members, teams, or event types—exact dimensions in SPEC).
- **Exporter** — export current table (format & PII rules in SPEC).
- **Masquer** — hide/show columns or UI chrome (V1 purple button).

### Main grid

**Rows**

- **One row per participant** — **sticky** left column: **avatar** + **name** (tap avatar → [**Member profile**](#pattern-member-profile) if consistent with app rules).

**Columns — role families (summary)**

Colour-coded **vertical bands** (V1: **yellow** — JEU, **purple** — DECORUM, **green** — DEPLAC., **teal/grey** — BÉNÉVOLE):

- Each cell shows **count** and **%** (e.g. `2 (40%)`) — meaning of % = **participation vs availability** or **selection rate** per DOMAIN (must match tooltip/math elsewhere).
- Header links **« voir les détails »** / **« masquer les détails »** expand **nested** columns where defined (e.g. **JEU** → MATCH / CAB / LONG / AUTRE + **TOTAL JEU**).

**Columns — calendar (month by month)**

- **One column group per month** (e.g. *Septembre 2025*, *Octobre 2025*, …) — **« voir les détails »** can reveal **per-spectacle** cells: **event title**, **date**, **composition status**, **role** chip or **—**, tooltips for intermediate states (e.g. *« Sélectionné - en attente de confirmation »*).

**Scrolling**

- Expect **horizontal scroll** for many months; **sticky** row header + **sticky** first column.

### Visual style (V1 mood)

- **Dark** navy background; **banded** headers for role families; high **contrast** for readability of small numbers.
- **Angular Material** `mat-table` (or equivalent) with **column groups**, **sticky** columns, and **responsive** fallbacks for narrow viewports (SPEC).

### Acceptance hints (for QA / design review)

- [ ] **Historique** is available to **all** season members (not admin-only) unless SPEC restricts.
- [ ] **JEU / DECORUM / DEPLAC. / BÉNÉVOLE** stats use **definitions** aligned with DOMAIN; **%** denominator is documented and **consistent** with tooltips.
- [ ] **Month** columns support **summary** numbers and optional **detail** (events, roles, statuses).
- [ ] **Exporter** and **Masquer** behave per product rules.
- [ ] **Avatar** in row opens **profile popover** when applicable.

---

## Pattern: Availability modal (overlay) {#pattern-availability-modal-overlay}

### Purpose

Let the **connected user** (or an **administrator acting on their behalf**, per permissions) set **availability** for **one event**: **available**, **not available**, or **unknown / not set**. Optionally add an **explanatory comment**. The pattern is opened from **availability affordances** across the app (notably **agenda / calendar** views and other surfaces that show dispo).

### Reference capture

- **File:** [`ux-references/availability-modal-v1.png`](ux-references/availability-modal-v1.png)

### Structure

**Header**

- **Title** — e.g. **“Disponibilité de &lt;prénom&gt;”** (must reflect **whose** availability is being edited—self vs member when admin).
- **Close** — **×** top-right; dismisses without saving or uses the app’s standard cancel/save rules.
- **Context block** — **event title** (bold) + **date** (e.g. *mardi 5 mai 2026*) on separate lines.
- **Separator** — thin line before the action area.

**Primary choices (three equal actions)**

- **Dispo** — **green** button (positive / available).
- **Pas dispo** — **red/coral** button (unavailable); **selected state** shows **checkmark** + optional **focus ring / glow** so the active choice is obvious.
- **Non renseigné** — **neutral grey** (explicit “unknown” / cleared intent).

**Feedback line**

- Short **centered** sentence under the buttons reflecting the current selection, e.g. *« Tu n'es pas disponible pour cet événement. »* — keep **plain language** and **second person** for self-editing; adjust copy when an **admin** edits someone else’s row (actor vs subject per DOMAIN/audit).

**Comment (optional)**

- **Label:** **« Commentaire (optionnel) »**
- **Text area** — multiline, dark field, light border, **placeholder** giving an example (e.g. time constraints, setup help).

### Interaction & permissions

- **Entry:** tap/click on a **dispo** cell or chip wherever the grid/agenda exposes it.
- **Self vs admin:** same modal shell; title and audit trail must distinguish **who** is the **subject** of the availability when an admin edits another member (FR/NFR: actor vs subject).

### Visual style (V1 mood)

- **Modal:** rounded rectangle, **dark navy** panel, **thin light border**, **dimmed backdrop** behind (focus on modal).
- **Buttons:** large touch targets, side-by-side on wide enough width; stack or scroll on very narrow if needed.
- **Semantics:** green = available, red = unavailable, grey = unknown—align **token names** in V2 (`--availability-*` or Material palette / custom severity).

### Acceptance hints (for QA / design review)

- [ ] All **three** states are reachable and **visually distinct**; selected state is obvious (checkmark + contrast).
- [ ] Event **title + date** always visible in header for orientation.
- [ ] Comment is **optional**; placeholder gives a realistic example.
- [ ] Admin path (if applicable) updates **title/copy** and **audit** expectations without confusing “who” is being edited.
- [ ] Close/dismiss behaviour matches app rules (unsaved changes warning if implemented).

---

## Pattern: Share & announce (modal) {#pattern-share-announce}

### Purpose

Several surfaces in the app let organizers **communicate** about a **spectacle**, a **tirage au sort**, or a **composition** (among others). The **same interaction model** should be reused everywhere:

1. **Message** — **pre-generated** by the app from context (event title, date, roles, link, etc.) but **fully editable** before sending.
2. **WhatsApp** — one action to **open WhatsApp** with the message (or a prepared share intent), e.g. *« Envoyer par WhatsApp »* with tooltip *« Ouvrir WhatsApp pour partager le message »*.
3. **Notifications** — **push** and **email** to a **recipient list** derived from the situation (e.g. everyone in the compo), with a clear summary of who can be reached automatically vs **manually**.

Implement once as a **shared modal (or wizard step)**; only **title**, **default message template**, and **recipient resolution** change per entry point.

### Reference capture

- **File:** [`ux-references/pattern-share-announce-modal-v1.png`](ux-references/pattern-share-announce-modal-v1.png) — example **« Annoncer Compo »** for *Apérock Mai*.

### Structure

**Header**

- **Title** — contextual, e.g. *« Annoncer Compo »* (emoji in title optional); **subtitle** = **event name — date** (muted accent colour).
- **Close** — × top-right.

**Message block**

- **Label** — e.g. *« Annoncez la compo avec ce message : »* (wording adapts per flow: spectacle, tirage, compo).
- **Text area** — large, **dark** field; **default text** includes emojis, line breaks, **role lines** (DJ, MC, Joueur·ses, …), and a **link** to the app (deep link / event URL). User may **edit** freely before sharing.

**WhatsApp**

- **Primary** green button *« Envoyer par WhatsApp »* + WhatsApp icon; tooltip clarifies **opens WhatsApp** to share the **current** editor content.

**Notifications — « Personnes à prévenir »**

- **Section title** with optional help (?) — who will receive **push** / **email**.
- **Summary line** — e.g. *« N personnes à prévenir. X peuvent être notifiées, Y devront être prévenues manuellement. »* (exact rules in SPEC: missing email, opt-out, etc.).
- **Recipient grid** — small **cards** (name, **obfuscated** contact e.g. `edo••@gm••.com`, **status** icon such as green ✓ when channel available).
- **CTA** — e.g. *« Envoyer les notifications »* (bell icon) to trigger **push + email** per product rules.

### Entry points (non-exhaustive)

| Surface | Typical title / intent |
|---------|-------------------------|
| **Spectacle / event** | Share event info or call to action. |
| **Tirage au sort** | Share outcome or invite people to view the draw. |
| **Composition (Équipe)** | **Annoncer la compo** — same modal family as capture. |

### Visual style (V1 mood)

- **Dark** modal, **purple** subtitle accent, **green** for WhatsApp and notification primary actions.
- **Angular Material**–friendly: `MatDialog`, form fields, button variants, optional `MatCard` for recipients.

### Acceptance hints (for QA / design review)

- [ ] **Same** modal shell and **sections** (message → WhatsApp → notifications) for **spectacle**, **tirage**, and **compo** flows; only **copy** and **defaults** differ.
- [ ] Default message is **editable**; shared content reflects **latest** text (WhatsApp + notifications).
- [ ] **WhatsApp** does not silently strip required info; user sees what will be shared.
- [ ] **Recipient** list and **X / Y** counts match backend rules; **manual** cases are explained.
- [ ] **Push** and **email** are both covered where SPEC requires (opt-in, failures, retries in NFR).

---

## Pattern: Member profile popover {#pattern-member-profile}

### Purpose

Throughout the app, tapping or clicking a **person’s avatar** opens a **compact profile popover** (overlay / dialog) scoped to the **current season**. It gives **identity**, **participation statistics**, and a **season-at-a-glance** chart so users can judge **availability**, **selection**, and **outcomes** without leaving the flow.

### Reference capture

- **File:** [`ux-references/pattern-member-profile-popover-v1.png`](ux-references/pattern-member-profile-popover-v1.png) — example member **Angie**.

### Structure

**Header**

- **Large avatar** — circular; initial or photo.
- **Name** — bold; optional **chevron** if the name expands extra actions (e.g. rename display—product-defined).
- **Badge** — e.g. **« Protégé »** with lock icon (privacy / visibility—align with DOMAIN).
- **Close** — × top-right.

**Statistics row (three metric cards)**

| Card (V1 colours) | Meaning |
|-------------------|---------|
| **Disponibilités** (green) | Count + **%** of **dispo** responses in the season; **tooltip** explains the formula (e.g. *« Nombre de dispos. Taux = (25 ÷ 37) × 100 »*). |
| **Sélections** (purple) | Count + **%** — times the person was **selected** / in team for spectacles (definition in SPEC). |
| **Désistements** (reddish) | Count + **%** — **withdrawals** / declined after commitment (definition in SPEC). |

Percentages are **season-scoped** and **consistent** with DOMAIN definitions (numerator/denominator).

**Season chart — « un clin d’œil »**

- **Horizontal axis:** months of the season (V1: **SEP** → **AOÛ**).
- **Per month:** a **vertical stack** of **square blocks** — **one block per spectacle** in that month (density shows activity at a glance).
- **Block colour** encodes **status** for that person on that event, e.g.:
  - **Green** — available / positive participation context.
  - **Red** — unavailable or withdrawal as applicable.
  - **Grey** — no response / neutral / not applicable.
- **Icons inside blocks** (optional) — **role** or status emoji (e.g. 🎭 joueur·se, 🤝 bénévole) linking to **actual roles** from history.

**Rôles favoris**

- **Pill tags** — role label + emoji + **count** in parentheses (e.g. *« Joueuse (4) »*, *« Bénévole (2) »*) — **aggregated** over the season or lifetime per product.

**Footer actions**

- **Planning** — navigates to a **deeper** planning / calendar view for this person (route in SPEC).
- **Fermer** — dismisses the popover.

### Entry points

Any **avatar** or **person chip** that represents a **member** in context (agenda rows, Dispos grids, Équipe slots, filters, etc.) should open this **same** popover with **season** = **active season** unless context overrides (e.g. viewing another season—future).

### Visual style (V1 mood)

- **Dark** panel, **rounded** corners, **card** metrics, **MatChip** (or equivalent) for favourite roles.
- Chart is **dense but scannable**; ensure **touch** targets on blocks if they become tappable (event detail).

### Acceptance hints (for QA / design review)

- [ ] **Avatar** click opens popover; **outside click** or **Fermer** / **×** dismisses.
- [ ] **Three** stat cards show **consistent** math; **tooltips** match backend definitions.
- [ ] **Chart** maps **every** spectacle in the month to a **block**; colours match **dispo vs sélection vs désistement** semantics in SPEC.
- [ ] **Favourite roles** counts match **chart** / history or documented rules.
- [ ] **Protégé** (or absence) reflects **privacy** settings.

---

## Screen: Event detail — “Infos” tab (`/season/:slug/event/:eventId` or equivalent) {#screen-event-detail-infos-tab}

### Purpose

When the user **opens a spectacle** (from the **agenda** or elsewhere), they land on the **event detail** view. This is the **canonical** place for **metadata** about the show, **composition status**, and **organizer/admin actions**. **Three tabs** structure the screen: **Infos** (this section), **Dispos** ([see below](#screen-event-detail-dispos-tab)), **Équipe** ([see below](#screen-event-detail-equipe-tab)).

### Reference capture

- **File:** [`ux-references/event-detail-infos-tab-v1.png`](ux-references/event-detail-infos-tab-v1.png) (example: **Apérock Mai**).

### Header (differs from season agenda)

| Zone | Behaviour | V1 pattern to preserve |
|------|-----------|-------------------------|
| **Left** | **Back** returns to the **season agenda / calendar** view (not `/seasons`, not marketing landing). | **Chevron** `<`. |
| **Next to back** | **Event type** glyph | **Square icon** with the spectacle-type artwork (e.g. circus tent), not the troupe logo. |
| **Center** | **Spectacle title** (bold) + **date** on second line (smaller). | e.g. **Apérock Mai** / *mardi 5 mai 2026*. |
| **Right** | **Settings** + **user menu** | **Cog** (event/season tools as per permissions) + **avatar**. |

**Continuity:** header identity switches from **troupe + season** (agenda) to **type + spectacle + date** (event context).

### Tab bar (below header)

Three **pill tabs**, centered:

| Tab | Icon hint | Role |
|-----|-----------|------|
| **Infos** | “i” in circle | **Selected** by default in reference; metadata & status. |
| **Dispos** | puzzle piece | Availability: self/others, **Moi** vs **Tous**, role candidacy ([screenshots below](#screen-event-detail-dispos-tab)). |
| **Équipe** | theatre masks | Slots, tirage, validation — [spec below](#screen-event-detail-equipe-tab). |

Selected tab: **lighter** pill background vs unselected.

### “Infos” tab content

**Status row**

- **Left:** **Composition status badge** — e.g. **orange** *« Équipe en préparation »* vs **green** *« Équipe confirmée »* (semantic colours per SPEC). **« Confirmée »** only when **every** assignee in filled slots has **confirmed**; otherwise **« en préparation »** ([Équipe tab rules](#composition-lifecycle-status)).
- **Right:** **Kebab (⋮)** for **organizer/admin** actions: **announce**, **edit**, **archive**, **delete**, and other entries as product defines—visibility **role-gated**.

**Fields (label above value, form-like)**

- **TITRE** — single-line value (editable in admin flows if applicable).
- **DESCRIPTION** — multi-line; may hold format/rules text.
- **DATE** — row with **calendar** icon, human-readable date, **dropdown** affordance (change date where permitted).
- **LIEU** — **map pin** + address string, **dropdown** affordance (map / edit location per product).
- **Large text area** — additional notes or long description continuation (empty in capture; border only).

Labels: **small caps / muted** (e.g. grey); values sit in **rounded** fields **slightly lighter** than page background.

### Visual style (V1 mood)

- **Background:** very **dark navy**; **white** primary text, **grey** labels.
- **Chrome:** consistent **rounded** corners on fields, tabs, badges.
- **Status:** **orange** for “preparing team” in example—align with **composition status** tokens in SPEC/PRD.

### Acceptance hints (for QA / design review)

- [ ] Back from event returns to **agenda** (season list view), not seasons home, unless product specifies a different stack.
- [ ] Header shows **type icon + title + date**; **user** and **settings** remain top-right.
- [ ] **Three tabs** visible; **Infos** shows title, description, date, place, extra area, and **composition badge**.
- [ ] **⋮** exposes **privileged** actions only when the user may perform them.
- [ ] **Dispos** and **Équipe** tabs exist as navigation targets (**Dispos** [below](#screen-event-detail-dispos-tab); **Équipe** [below](#screen-event-detail-equipe-tab)).

---

## Screen: Event detail — “Dispos” tab {#screen-event-detail-dispos-tab}

### Purpose

The **Dispos** tab is the **in-context** counterpart to the [**Availability modal**](#pattern-availability-modal-overlay): same **three availability states**, **optional comment**, and **orientation** (which member is the subject). It **adds**:

1. **Subject selector** — pick **which person**’s availability is shown or edited. **Organizers and administrators** may select **another member** to view or change their dispo **for this event**; members without that privilege work on **themselves** only (selector may be fixed to self or hidden—product rule).
2. **Moi / Tous** — switch between **editing or viewing your own** row (**Moi**) and a **read-oriented overview** of **all candidates per role** (**Tous**).
3. **Role candidacy** — when the user sets status to **Dispo**, the UI lists the **roles required for this event** so they can tick **for which roles** they wish to be a **candidate** at this spectacle (e.g. DJ, MC, Joueur).
4. **Public lottery transparency** — in **Tous**, everyone sees **all people who are candidates (available)** per role, with an **estimated percentage** reflecting **chance of being drawn** for that role—**visible to all** so participants can **gauge their odds** fairly.

**Relationship to the modal:** reuse **labels, colours, and field semantics** (Dispo / Pas dispo / Non renseigné, commentaire) so behaviour stays predictable whether the user opened a **modal from the agenda** or the **Dispos** tab on the event.

### Reference captures

| File | What it shows |
|------|----------------|
| [`ux-references/event-detail-dispos-moi-unset-v1.png`](ux-references/event-detail-dispos-moi-unset-v1.png) | **Moi** active; **Non renseigné** selected; feedback *« Tu n'as pas renseigné de dispo. »*; comment empty. |
| [`ux-references/event-detail-dispos-moi-dispo-roles-v1.png`](ux-references/event-detail-dispos-moi-dispo-roles-v1.png) | **Moi**; **Dispo** selected (green + check); prompt *« Choisis les rôles pour lesquels tu es disponible »*; **role checkboxes** (icons per role, e.g. Joueur checked). |
| [`ux-references/event-detail-dispos-tous-v1.png`](ux-references/event-detail-dispos-tous-v1.png) | **Tous** active; **accordion sections per role** with ratio *(candidats / places)*; **two-column grid** of people with **%** (green/orange); tooltip *« Cliquer pour modifier la disponibilité »* (privileged path). |

### Inherited chrome

Same **event header** and **three tab pills** as [Event detail — Infos](#screen-event-detail-infos-tab): back → agenda, **type icon** + **title** + **date**, **settings** + **user menu**.

### Toolbar (below tabs)

| Control | Role |
|---------|------|
| **Member dropdown** (left) | **Avatar + name** (e.g. *Patrice*). Lets **organizer/admin** switch **subject** to view or edit **that person’s** dispo for **this event**. For a normal member, expect **self only** or no switching—align with permissions. |
| **Tous** / **Moi** | **Segmented control** or toggle pair: **Tous** (people icon) = aggregate view by role; **Moi** (person icon) = personal editing surface. **Purple** highlight on the active mode in V1. |

### “Moi” panel (personal availability)

**State buttons (same trichotomy as modal)**

- **Dispo** — green.
- **Pas dispo** — red.
- **Non renseigné** — grey; selected state may show **checkmark** on the neutral option.

**Feedback line** — short sentence under the buttons (e.g. *« Tu n'as pas renseigné de dispo. »*) keyed to the current state; adjust copy when the **subject is not** the connected user (admin editing someone else).

**Role candidacy (when Dispo is selected)**

- Intro line with optional emoji lead-in (e.g. sparkle) — *« Choisis les rôles pour lesquels tu es disponible »* — then **one row per role** required for **this** event: **icon + label + checkbox**.
- User checks **only** roles they want to **run for** as a candidate for the draw. Unchecked roles = not candidat for that hat, even if globally “Dispo” for the event (product: confirm vs DOMAIN).

**Comment (optional)**

- **« Commentaire (optionnel) »** + multiline field; placeholder example for time / setup constraints — same intent as the [modal](#pattern-availability-modal-overlay).

### “Tous” panel (everyone’s odds)

**Scope**

- **Not** a private editing surface for bulk edits; it is a **read-mostly** dashboard for **who is in the hat per role**, with **estimated draw probability** per person.

**Layout**

- **Accordion (or collapsible section) per role** — header shows **role name**, icon, and **counts** e.g. **DJ (6/1)** meaning **6 candidates** for **1 slot** (wording/format per product).
- **Body:** **dense grid** (e.g. two columns on mobile) of **avatar + name + percentage**. Colours: **green** vs **orange** (and similar) to encode **higher vs lower** chance at a glance.
- **Interactivity:** tapping a **person** may open **detail** or the **same dispo editor** for **that** subject when the viewer has **organizer/admin** rights (V1 tooltip: *« Cliquer pour modifier la disponibilité »*). Read-only users may get **no** edit affordance or a **view-only** sheet.

**Transparency rule**

- **All authenticated participants** who can open the event may see **Tous** and the **%** estimates (subject to any future privacy rule in SPEC—if restricted, document exception here).

### Permissions summary

| Capability | Who |
|------------|-----|
| Change **own** dispo + role candidacy | Member (subject = self). |
| Change **another member’s** dispo for this event | **Organizer** / **admin** (subject selector + same controls as Moi). |
| View **Tous** + percentages | **Everyone** with event access (per stakeholder input). |

### Visual style (V1 mood)

- **Dark** canvas, **large** rounded state buttons, **purple** accent on **Moi**/**Tous** selection.
- **Role rows:** iconography per role (headphones, mic, masks); selected checkbox can use **strong** contrast (e.g. red tick on dark strip in capture).
- **Tous:** compact **cards/tiles**; **%** typography prominent; optional **badges** on avatars (e.g. warning, star) for edge states—define in DOMAIN/SPEC.

### Acceptance hints (for QA / design review)

- [ ] **Dispos** reuses **modal semantics** (3 states + optional comment); no contradictory labels vs [Availability modal](#pattern-availability-modal-overlay).
- [ ] **Subject dropdown** only allows **other people** when the user has **organizer/admin** rights; otherwise **self** only.
- [ ] **Dispo** reveals **role checklist** for **this event’s** required roles; **Pas dispo** / **Non renseigné** behaviour vis-à-vis role candidacy is **defined** (clear or reset—document in SPEC).
- [ ] **Tous** lists **candidates per role** with **ratio** and **%**; percentages are **visible to all** viewers of the tab unless SPEC says otherwise.
- [ ] **Moi** vs **Tous** switching does not lose **unsaved** changes if the product requires a save model (or auto-saves per field—align with API).
- [ ] Privileged **edit via Tous** (click person) is **gated**; tooltip matches actual permission.

---

## Screen: Event detail — “Équipe” tab {#screen-event-detail-equipe-tab}

### Purpose

The **Équipe** tab is where **organizers and administrators** **build and adjust** the **cast/crew composition** for the spectacle—**one slot per role** to fill (DJ, MC, Joueur·se, …). **Members** use the same tab to **view** the published lineup (when allowed) and **confirm or decline** their own assignment via a **dedicated modal**. The tab must support:

- **Manual assignment** — tap a **slot** to open a **candidate list** (**ordered**, with **%** chances) for easy picking.
- **Automated draw** — **« Tirer au sort »** runs the **current lottery algorithm** with a **step-by-step animation** per role.
- **Simulation** — **« Simuler »** (with options per product) to **test** outcomes **without** committing the same way as a final draw (exact rules in SPEC).
- **Draft vs validated** — until **validation**, the composition is **editable** (clear slots, redraw, partial changes). **Validation** **locks** the lineup for **structural** changes and controls **who** sees it; **announcement** remains available while **editing** is blocked unless an **explicit unlock** path exists (security against accidental edits after communication).
- **Team status vs composition lock** — **structural validation** (slots fixed) is separate from **« équipe confirmée »** on the event ([Infos](#screen-event-detail-infos-tab) badge): the latter requires **every assigned person** to **confirm** participation; until then the team stays **« équipe en préparation »**.
- **Decline** — **Décliner** in the [participation modal](#pattern-confirm-participation-modal) **frees the slot**; the system **retains a record** of who declined, **shown on the Équipe tab** for **transparency** and **statistics**.

### Reference captures

| File | What it shows |
|------|----------------|
| [`ux-references/event-detail-equipe-compose-empty-v1.png`](ux-references/event-detail-equipe-compose-empty-v1.png) | **À composer** — empty **dashed** slots (+ role + emoji), **Tirer au sort** + **Simuler**, helper copy + *« Comment ça marche ? »*. |
| [`ux-references/event-detail-equipe-draw-animation-v1.png`](ux-references/event-detail-equipe-draw-animation-v1.png) | **Sélection en cours** — banner; **MC** step with **proportional segments** (candidate names), **moving cursor** stopping on the winner; other slots still empty. |
| [`ux-references/event-detail-equipe-draft-validate-v1.png`](ux-references/event-detail-equipe-draft-validate-v1.png) | **Draft** — filled slots in **orange/brown** (pending); admin-only notice; **Partager**, **Valider**, **Effacer**, **Tirer au sort**, **Simuler**. |
| [`ux-references/event-detail-equipe-confirm-participation-modal-v1.png`](ux-references/event-detail-equipe-confirm-participation-modal-v1.png) | **Confirmer ma participation** — role recap, **Confirmer** / **Décliner** / **À confirmer**, optional note for organizer. |
| [`ux-references/event-detail-equipe-declined-validated-incomplete-v1.png`](ux-references/event-detail-equipe-declined-validated-incomplete-v1.png) | **Validated** compo **incomplete** (one empty slot); **declined** collapsible + list; warning *« À compléter »*; **Compléter**, **Annoncer la compo**, **Déverrouiller**. |

### Inherited chrome

Same **event header** and **tab bar** as [Infos](#screen-event-detail-infos-tab) / [Dispos](#screen-event-detail-dispos-tab): back → agenda, **type icon**, **title** + **date**, **settings** + **user menu**. **Équipe** tab is active (e.g. **theatre masks** icon).

### Slot grid (roles)

**Layout**

- **One slot per required role** for this event — e.g. **+ DJ**, **+ MC**, several **+ Joueur·se** as configured.
- **Empty slot:** **dashed** rounded rectangle, **+** prefix, **role label** + **emoji** — clearly a **placeholder**.
- **Filled slot:** **avatar**, **name**, **role icon**; **×** (or equivalent) to **clear** the slot **while composition is not validated**.

**Interaction — organizers / administrators**

- **Tap slot** → surface **candidates** for that role in an **ordered list** with **percentage** (same family of odds as [Dispos → Tous](#screen-event-detail-dispos-tab)) so **manual assignment** is quick and informed.
- **Clear** removes the assignee; slot returns to **empty**; allowed **until validation** (full or partial reset—see **Effacer** below).

**Interaction — members (post-publish rules)**

- **Tap their own slot** (the one that concerns them) to open [**Confirmer ma participation**](#pattern-confirm-participation-modal) — **not** every member taps every slot: **organizers/admins** may open **confirmation for any slot** they manage; **normal members** interact with **their assignment** only (permissions in SPEC).

### Actions: draw and simulate

| Control | Intent |
|---------|--------|
| **Tirer au sort** | Run the **real** lottery using the **current** draw algorithm; fills slots (typically **one role at a time** or in sequence per product); results appear in **pending** styling until member confirmation / final validation rules apply. |
| **Simuler** | **Dry-run** / preview behaviour (**dropdown** in capture)—does **not** replace governance in SPEC (e.g. whether simulation writes draft slots or only previews). |

Helper line (V1): invite users to **click slots** for manual pick **or** use **Tirer au sort** for automatic selection.

### Draw animation (lottery UX)

When **Tirer au sort** runs:

1. **Context banner** — e.g. *« Sélection en cours »* with short copy: random draw among **available** candidates; result is a **proposal** and can be adjusted.
2. **Per-role step** — for the role being drawn, show a **horizontal bar** split into **segments** whose **widths match relative probabilities** (same basis as % in Dispos).
3. **Cursor** — a **vertical indicator** moves across the bar and **stops** in the segment of the **selected** person—makes **fairness** and **weights** **visible**.
4. After each step, the **winner** appears in the **slot** with **pending** styling; proceed to next role until done or cancelled.

**Accessibility / reduced motion:** offer a non-animated path or shortened animation (NFR).

### Composition lifecycle (structural) vs team status (confirmations) {#composition-lifecycle-status}

**Two concepts** must stay distinct in UI and data:

| Concept | Meaning |
|---------|---------|
| **Composition validated** (structural lock) | Org/admin has clicked **Valider** — slots are **fixed** for editing rules; members may see assignments and must **respond** per permissions. May still have **empty slots** (incomplete) or **unconfirmed** assignees. |
| **Équipe confirmée** (event-level badge on [Infos](#screen-event-detail-infos-tab)) | **All** people currently **assigned to a filled slot** have **confirmed** participation. If **any** assignee is still **pending** (incl. **À confirmer**) or **any** required slot is **empty**, the event stays **« équipe en préparation »** (align edge cases with SPEC). |

**Rule (stakeholder):** **Every assigned member** must **confirm** for the composition to reach **« équipe confirmée »**; otherwise it remains **« équipe en préparation »** (align exact wording with DOMAIN/SPEC).

### Declines: freeing slots + audit trail {#declines-audit}

When someone taps **Décliner** in [**Confirmer ma participation**](#pattern-confirm-participation-modal):

1. **Slot effect** — their **slot is freed** immediately (same as clearing an assignee) so another person can be chosen.
2. **Record** — the system **keeps a trace** of the decline (who, for which role/event, when—detail in DOMAIN).
3. **Équipe tab UI** — a **collapsible** area (e.g. *« N personne(s) a/ont décliné ▼ »*) expands to **« Personnes ayant décliné »** with a note such as *« (ne comptent pas dans la composition) »* and **rows** (avatar, name, role icon) styled distinctly (e.g. **reddish** tint). **Purpose:** **transparency** for the troupe and **statistics** downstream.

### Visual states: pending vs locked

| State | Meaning | V1 cue |
|-------|---------|--------|
| **Draft / compo editable** | Composition editable; **only org/admin** may see the **current** draft (per capture: warning that **only admins** see the draft until **Valider**). | Orange/brown **filled** slots; status *« À composer »* or *« En préparation »* with explainer. |
| **Validated (structural lock)** | Lineup **locked** for casual edits; **visible** to participants; **respond** via modal. | **No** clearing / reassignment **without Déverrouiller** (or equivalent); **« Annoncer la compo »** available. |
| **Validated but incomplete** | **Valider** applied yet **one or more slots** still **empty** — org must **fill** (manual or **Compléter** random). | **Warning** *« À compléter : … »*; actions **Compléter**, **Annoncer**, **Déverrouiller** (see capture). |

**Unlock** — **« Déverrouiller »** returns to an **editable** composition state (SPEC: who may unlock, audit).

### Primary controls (organizer/admin toolbar)

Typical row (see draft capture):

- **Partager** / **Annoncer** — opens the shared [**Share & announce**](#pattern-share-announce) modal (message + WhatsApp + notifications).
- **Valider** — **commits** visibility and **locks** composition editing as above; triggers **member** visibility and **confirmation** flows.
- **Effacer** — **wipes** current composition (**whole** or **partial** per product—capture suggests **full** clear); only **before** validation (or after unlock).
- **Tirer au sort** / **Simuler** — remain available **while editable**.

**After validation:** UI should **not** offer casual **edit** / **clear** / **redraw** except through **Déverrouiller**. **« Annoncer la compo »** opens the [**Share & announce**](#pattern-share-announce) modal (editable message, WhatsApp, push/email). If slots are still **empty**, show **« Compléter »** (e.g. random fill for remaining slots) and the **« À compléter »** warning from the [incomplete validated capture](ux-references/event-detail-equipe-declined-validated-incomplete-v1.png).

### Pattern: “Confirmer ma participation” (modal) {#pattern-confirm-participation-modal}

**When:** A **member** (or admin acting in a defined way) opens **their** role slot to **respond** to the assignment.

**Structure**

- **Title:** *« Confirmer ma participation »*; **close** ×.
- **Event** — title + date (same as other modals).
- **Rôle assigné** — recap card, e.g. *« Joueuse »* with emoji — **reminder** of what they are answering for.

**Responses (three large buttons, distinct colours)**

| Action | Purpose |
|--------|---------|
| **Confirmer** | Accept the role (e.g. **purple** in capture). |
| **Décliner** | Refuse (e.g. **brown/terracotta**). **Frees the slot** for that role; decline is **recorded** and appears under [Personnes ayant décliné](#declines-audit). |
| **À confirmer** / later | Explicit **pending** choice — **orange** + check/hourglass in V1; user will decide later. |

**Colour continuity:** each state’s **colour** should **map to the slot** (border, badge, or fill) so **scanning** the grid shows who **confirmed**, **declined**, or is **still pending**—define **tokens** in SPEC (`--participation-confirmed`, etc.).

**Note (optional)**

- **« Ajouter une note (optionnel) »** — textarea; hint *« Visible par l’organisateur·ice. »*

### Permissions summary

| Capability | Who |
|------------|-----|
| Fill/clear slots, draw, simulate, validate, effacer, share | **Organizer** / **admin** (per SPEC). |
| View **draft** composition | Often **restricted** to org/admin until **Valider** (V1 copy). |
| View **validated** composition | **All** relevant members (at minimum). |
| Open **participation** modal | **Assigned person** for **their** slot; **admins** may assist **all** slots if product allows. |

### Visual style (V1 mood)

- **Dark** background; **gradient** CTAs (pink/purple draw, cyan simulate, green share, blue validate, red/coral clear).
- **Slots:** **dashed** when empty; **warm orange/brown gradient** when assigned **pending confirmation** at team/member level.
- **Typography:** short **instructional** blocks under the grid (emoji + bold lead-ins).

### Acceptance hints (for QA / design review)

- [ ] Every **role** required for the event has a **slot**; empty vs filled states are **obvious**.
- [ ] **Slot** opens **ordered** candidate list with **%** for manual pick; **×** clears when **editable**.
- [ ] **Tirer au sort** shows **segmented bar + cursor** animation reflecting **weights**; **Simuler** behaves per SPEC (non-destructive vs draft).
- [ ] **Orange/pending** styling distinguishes **not-yet-final** assignments from **confirmed** (green or other—align SPEC).
- [ ] **Valider** **locks** slot edits and **reveals** composition to non–org/admin as designed; **no** accidental edit after share without **unlock**.
- [ ] **Effacer** only when allowed; **validated** state hides destructive controls or routes through **unlock**.
- [ ] **Participation modal** offers **three** responses + optional note; **colours** sync with **slot** indicators; **Décliner** **frees** the slot and **logs** the decline.
- [ ] **Infos** badge **« équipe confirmée »** appears only when **all** assignees have **confirmed**; otherwise **« équipe en préparation »**.
- [ ] **Declined** section lists people who **declined** (not counted in active compo); data usable for **stats**.
- [ ] **Validated** + **empty slots** shows **À compléter** + **Compléter** / **Annoncer la compo** / **Déverrouiller** per capture.
- [ ] **Partager** / **Annoncer la compo** uses the shared [**Share & announce**](#pattern-share-announce) pattern.

---

## Admin surfaces (functional scope) {#admin-functional-scope}

### Purpose

**Back-office / settings** flows (gear icons, `/seasons` management, etc.) do **not** require pixel-level continuity with HatCast **V1** member-facing screens. **Visual design** may follow **Angular Material** defaults and product **tokens** without matching the dark “spectacle” mood—**clarity** and **task completion** come first.

**Normative mirror:** [SPEC.md](../../SPEC.md#administration--required-capabilities-v2-target) (required capabilities) and [DOMAIN.md](../../DOMAIN.md) (glossary **Troupe**, invariant **single active season**).

**Detailed people admin spec:** [ux-design-specification.md](./ux-design-specification.md) (Stories 2.2, 2.3, 3.5).

### Required capabilities

Stakeholders expect administrators (and roles defined in SPEC) to be able to:

| Area | Capability |
|------|------------|
| **Membres & organisateurs** | **Manage troupe members** from route `/saison/:slug/admin/membres` (menu **Membres**); **season organizers** on second tab. **Export** + **Importer ▾** toolbar; add via modal; search; compact list; **slide toggle** active; **Retirer** with confirmation (removes troupe membership only, not the user account); **inactive hidden by default** (*Afficher les inactifs*); no dates; **Nommer orga saison** shortcut. **Participants** (season/event rosters, Story 3.8) use label **Participants**, not Membres. |
| **Spectacles** | **Manage spectacles** (CRUD, dates, types, venues, status) for the relevant scope (season / troupe). |
| **Troupe & saisons** | **Manage troupe** identity and **seasons**: create, rename, archive; **at most one season active at a time** for a given troupe context (activate/deactivate explicitly—rules in DOMAIN/SPEC). |

---

## Screen: Admin Membres (`/saison/:slug/admin/membres`) {#screen-admin-membres}

### Purpose

Unified **troupe members** (tab **Membres**) and **season organizers** (tab **Organisateur·ices**) inside the season context. Replaces separate modals from the settings menu.

**Vocabulary (locked):** **Membres** = troupe scope; **Participants** = season/event participant rosters (Story 3.8, future screen).

**Stakeholder sign-off (2026-05-23):** one route; CSV via **Exporter** + **Importer ▾**; compact list; slide toggle; hide dates; add via modal; search; inactive filtered by default; **Nommer orga saison** shortcut.

### Entry

- Season header **⚙** → **Membres** → route (default tab Membres).
- Tabs: **Membres** | **Organisateur·ices** (hide tab bar if only one permitted).

### Chrome

| Zone | Behaviour |
|------|-----------|
| **Back** | → season agenda |
| **H1** | Active tab name |
| **Style** | Material defaults |

### Toolbar (Membres tab)

Search · **Ajouter** · **Exporter** · **Importer ▾** (utilisateurs \| membres)

Filter: *Afficher les inactifs* (default off) between toolbar and list.

### Membres tab

Compact rows: avatar, inline name edit, email, role chip+menu, active toggle, **Retirer** with confirmation, **Nommer orga saison** link. Auto-save. Last admin protected. **Retirer** soft-deactivates the troupe membership only; it never deletes the HatCast user account.

### Organisateur·ices tab

Compact list; add modal with autocomplete; Retirer + confirm.

Full spec: [ux-design-specification.md](./ux-design-specification.md).

---

## Future sections (to extend)

- Admin **spectacles** and **troupe/saisons** screens once visual direction is chosen. Same structure: **purpose → reference image → chrome → blocks → style → acceptance hints**.
