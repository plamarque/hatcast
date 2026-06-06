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

> **Superseded for members (2026-05-24):** Primary signed-in hub is **`/agenda`** (user agenda, FR48). **`/seasons`** is demoted to admin/legacy; see [ux-design-journey-league-agenda.md](./ux-design-journey-league-agenda.md). This section remains reference for card layout until troupe hub (UX-DR16) ships.

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

After the user **opens a season** (from `/seasons`), show a **time-ordered** list of **spectacles** (events) for that season, **grouped by month**, in a **calendar-style** layout. On the **Agenda** view specifically, the list is **upcoming-only** (see **Agenda content scope** below); **past** shows belong to [**Historique**](#screen-league--historique-chronology) (chronological list only), not the Agenda list. The user scans upcoming shows, sees **composition status** and **their own availability/role** at a glance, and **opens detail** by tapping a card. **Filters** narrow the view by **people** and/or **events**; a control switches to **three league workspace views** — **Agenda**, **Historique** (past events), and **Statistiques** (participation stats grid, V1 parity) — available to **all** users with league access.

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

> **Amended 2026-05-31:** Inline filter dropdowns superseded — [ux-design-unified-filter-panel.md](./ux-design-unified-filter-panel.md) (**UX-DR22.1**). **`filter_list` icon** opens **hub** → individual pickers (search + multi-select at scale); **chips anchored to trigger**; season **gear in breadcrumb row**; **no chrome** when mono-context (RES-001).

- **Participant filter** — inside filter panel; default **Tous**; future avatar + name when multi-member.
- **Event filter** — inside filter panel; default **Tous**.
- **View switcher** — tabs or pills: **Participants**, **Spectacles**, **Agenda**, **Historique**, **Statistiques** (ADR 0012). **Agenda** = [calendar / upcoming list](#screen-season-calendar); **Historique** = [past events chronology](#screen-league--historique-chronology); **Statistiques** = [participation statistics table](#screen-league--statistiques-participation).

**Continuity:** one compact toolbar row — **filter icon** (when needed) + view switch + gear; no permanent pulldown row on mobile.

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
3. **User status / role** — square **participation cell** (`app-agenda-participation-status`) for the **connected user** (same component on **Mon agenda** `/agenda`):
   - **Unavailable / not selected** — red-tinted (*Pas dispo*).
   - **In team** — purple gradient (confirmed) or amber/gold (**pending** ⏳) with role label (*Comédien·ne*, *DJ*, …).
   - **Available, not selected** — green (*Dispo*).
   - **Declined role** — orange decline gradient with role label — **even after the slot is freed** (`inTeam: false`); must **not** fall back to dispo.

**Interaction**

- **Card body** (date, title, composition badge) navigates to **spectacle detail** (primary).
- **Status cell** (secondary control, **upcoming Agenda only**):
  - **Dispo / Pas dispo / Non renseigné** → tap opens **availability dialog** (does not navigate).
  - **Pending / confirmed in team** → tap opens **participation confirmation** dialog (same as Équipe self-service, FR25).
  - **Declined** → read-only on agenda (no dispo edit from cell).
- **Historique** rows: status cell **read-only**.
- Filters and view switcher **do not** require leaving the season context.

> **Normative detail (2026-06-07):** SPEC § Agenda participation status cell; companion [_spec-agenda-participation-status-cell.md_](../implementation-artifacts/spec-agenda-participation-status-cell.md).

### Visual style (V1 mood)

- **Background:** dark **navy / charcoal** (may differ slightly from `/seasons` gradient—still **dark theme** family).
- **Functional colours:** participation states use **V1 gradient pairs** (see [Participation semantic colors](ux-design-participation-semantic-colors.md)) — **purple→pink** (selection), **orange→yellow** (pending), **red→orange** (decline), **green→emerald** (dispo), **red** (indispo). Lifecycle badges (e.g. « en préparation ») may use pending gradient tokens.
- **Cards:** rounded, separated by **gaps**; readable hierarchy (date → title → badges).

### Acceptance hints (for QA / design review)

- [ ] Back returns to **`/seasons`**, not landing (unless product overrides).
- [ ] Header shows **logo + season name + user avatar**; **settings** visible when user has permission.
- [ ] Events are **grouped by month** with a clear month header.
- [ ] Each card shows **date**, **title**, **composition status**, and **current user’s** dispo/role summary.
- [ ] Card body opens **event detail**; **status cell** opens availability or confirmation modal without navigating (upcoming only).
- [ ] After **decline**, status cell stays **declined** (not dispo).
- [ ] Filters and view switcher behave without losing season scope.
- [ ] **Historique** and **Statistiques** are reachable from the **view switcher** without ambiguity ([Historique](#screen-league--historique-chronology), [Statistiques](#screen-league--statistiques-participation)).
- [ ] **Agenda** liste uniquement spectacles **non archivés** et **à partir d’aujourd’hui** (jour civil inclus), conformément à **Agenda content scope** ci-dessus.

---

## Screen: League — Historique (past events chronology) {#screen-league--historique-chronology}

> **Refined mockups (2026-05-25):** See [ux-design-season-historique-statistiques.md](ux-design-season-historique-statistiques.md) for implementation-ready wireframes, toolbar layout, and decisions D1–D12 (supersedes ambiguous chrome notes below).

### Purpose

In addition to the [**Agenda**](#screen-season-calendar), **every user** with access to the league can open **Historique**: a **chronological list** of **past** (non-archived) events, **grouped by month**, using the same card vocabulary as Agenda (date, title, composition status, user role summary). It answers *what happened* and *in what order* — **not** participation statistics (those live in [**Statistiques**](#screen-league--statistiques-participation)).

### Toolbar

- **Participant** and **event** filters (same family as Agenda when applicable).
- **Exporter** — CSV of the **visible chronology** (distinct from Statistiques export).

### Acceptance hints

- [ ] **No** JEU/DECORUM/DEPLAC. summary columns on this screen.
- [ ] Past events only (civil-day boundary aligned with Agenda inverse).
- [ ] Card tap → event detail.

---

## Screen: League — Statistiques (participation stats) {#screen-league--statistiques-participation}

> **Refined mockups (2026-05-25):** See [ux-design-season-historique-statistiques.md](ux-design-season-historique-statistiques.md) for grid layout, filters, Exporter/Masquer placement, and mobile behaviour.

### Purpose

**Every user** with access to the league can open **Statistiques**: a **data-dense** view of **participation statistics** and **per-person, month-by-month** drill-down (V1 Historique grid). It answers *how often* each member contributed in **broad role families** (jeu, décorum, déplacement, bénévolat). Events in a **travel league** feed **DEPLAC.** columns; show leagues never mix déplacements into JEU/DECORUM (FR60, ADR 0012).

### Reference captures

| File | What it shows |
|------|----------------|
| [`ux-references/season-history-summary-v1.png`](ux-references/season-history-summary-v1.png) | **Summary** grid — per-member rows; **JEU**, **DECORUM**, **DEPLAC.**, **BÉNÉVOLE** columns with count + %; **month** columns (e.g. Septembre–Novembre 2025); **Exporter** + **Masquer**; filters **Tous**. |
| [`ux-references/season-history-jeu-expanded-v1.png`](ux-references/season-history-jeu-expanded-v1.png) | **JEU** expanded — sub-columns **JEU MATCH**, **JEU CAB**, **JEU LONG**, **JEU AUTRE**, **TOTAL JEU**; *« masquer les détails »* / *« voir les détails »* toggles. |
| [`ux-references/season-history-month-detail-v1.png`](ux-references/season-history-month-detail-v1.png) | **Month drill-down** — event row in cell (e.g. *Cab CCAS #1*, date, *Équipe confirmée*); role chips (*Joueur* / *Joueuse*); **—** when not involved; tooltip *« Sélectionné - en attente de confirmation »*. |

### Global chrome (same season shell)

Same **header** as Agenda: **back** → `/seasons`, **troupe logo**, **season title**, **settings**, **user menu**. **Tabs** on the right (or equivalent): **Participants**, **Spectacles**, **Agenda**, **Historique**, **Statistiques** — **Statistiques** active when on this screen.

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

## Pattern: Event draft & publish (spectacle brouillon) {#pattern-event-draft-publish}

**Story 3.21** — spec détaillée : [ux-event-draft-publish-3-21.md](./ux-event-draft-publish-3-21.md).

Résumé : spectacles créés en **brouillon** ; **publication** ouvre la collecte des dispos ; **remise en brouillon** temporaire pour orgas ; bandeau entre header et onglets sur la fiche ; cartes agenda violettes (`agenda-card--draft`) **uniquement** pour les vrais brouillons (orgas). Ne pas confondre avec le brouillon **composition** (onglet Équipe).

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

### Structure (cible M3 — story 6.15 ; D10 statut canal 2026-06-04)

**Spec détaillée :** [**ux-design-share-announce-6-15.md**](./ux-design-share-announce-6-15.md).

**Header**

- **Title** — contextual (e.g. *« Annonce de spectacle »*, *« Partager le tirage »*) ; **subtitle** = event name — date (`--mat-sys-on-surface-variant`).
- **Close** — `mat-icon-button` top-right, `aria-label="Fermer"`.

**Message block**

- `mat-form-field appearance="outline"` + `textarea matInput` (autosize) ; default text editable (emojis, roles, deep link).

**Actions (une rangée, sous le message)**

- **Notifier X personnes** — `mat-flat-button color="primary"` (premier).
- **Copier** — `mat-stroked-button` ; label court *Copier* ; `aria-label="Copier le message"`.
- **WhatsApp** — `mat-stroked-button` ; ouvre WhatsApp avec le texte courant.

**Notifications**

- Résumé N/X/Y ; liste nominative **repliée** (`mat-expansion-panel`) **sous** la rangée d’actions.
- **Détail (D10) :** pastilles **email / push** par destinataire — absent · gris · coloré ; **sans** email obfusqué ; légende sous la liste.
- Garde anti-spam : **ConfirmDialog au clic Notifier** seulement — **pas** de bandeau dans le dialog.

**Footer**

- **Fermer** seul (`mat-dialog-actions`).

**Après envoi (snack ~5 s)**

- Nudge réel → *« X notifications envoyées. »*
- Intents stub (`draw` / `composition` / `event`) → *« Demande enregistrée. »*
- Nudge sans canal auto → *« Message prêt — partage-le via Copier ou WhatsApp. »*

### Entry points (non-exhaustive)

| Surface | Typical title / intent |
|---------|-------------------------|
| **Spectacle / event** | Post-publish banner **ou** menu gear · **Annoncer** → *Annonce de spectacle* (`event`). |
| **Tirage au sort** | Équipe grille **Partager** en brouillon compo ; overflow si ≥ 4 actions (`draw`). |
| **Composition (Équipe)** | **Annoncer la compo** (`composition`). |
| **Relance dispos** | Menu gear événement · **Relance dispos** → *Rappel disponibilité* (`availability_nudge`) — story **6.10c** ; **plus** de bouton toolbar Dispos. |

Helper : [`share-announce-open.ts`](../../apps/web/src/app/shared/share-announce/share-announce-open.ts).

### Visual style

- Shell **Material 3** standard — voir [**ux-design-share-announce-6-15.md**](./ux-design-share-announce-6-15.md) (remplace le mood « carte sombre V1 » de 6.10).
- **Référence capture V1 :** ton et contenu message ; pas le chrome couleur.
- Tokens `--mat-sys-*` uniquement ; pas de boutons HTML verts V1.

### Acceptance hints (for QA / design review)

- [x] **Same** modal shell M3 for **spectacle**, **tirage**, **compo**, **nudge** ; copy et defaults diffèrent.
- [x] Default message **editable** ; Copier / WhatsApp / notify utilisent le texte courant.
- [x] Rangée **Notifier · Copier · WhatsApp** ; footer = Fermer.
- [ ] **Recipient** X/Y counts match backend ; manual cases explained in summary.
- [ ] **Push** and **email** dispatch where SPEC requires (stub intents until Epic 8).

---

## Screen: Personal season glance (`/membre/:userSlug`) {#screen-personal-season-glance}

### Purpose

V1 *« Ma saison en un clin d'œil »* (`PlayerModal`) becomes a **dedicated route** from the **member area** and from avatar shortcuts in league workspace (FR58–FR59). Shows **identity**, three **summary cards** (dispo / sélections / désistements), **monthly participation chart**, and **favourite roles**. Optional **troupe** and **league** filters when multiple contexts exist (FR55); hidden when only one troupe or league applies.

**Transparency:** any member who can see league participation may open **`/membre/{slug}`** for another participant (same as V1). URL is shareable/bookmarkable.

### Reference

- V1: [`legacy/src/components/PlayerModal.vue`](../../legacy/src/components/PlayerModal.vue)
- Story: **16.1** (evolves Story 2.7)

---

## Pattern: Member profile (avatar shortcut) {#pattern-member-profile}

### Purpose

Tapping a **person’s avatar** in league workspace **navigates** to [**Personal season glance**](#screen-personal-season-glance) (`/membre/:userSlug`), optionally passing troupe/league filter query params. A **popover** may remain as a lightweight preview only if product keeps it — **canonical surface is the route**.

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
| **Disponibilités** (green→emerald gradient) | Count + **%** of **dispo** responses in the season; **tooltip** explains the formula (e.g. *« Nombre de dispos. Taux = (25 ÷ 37) × 100 »*). |
| **Sélections** (purple→pink gradient) | Count + **%** — times the person was **selected** / in team for spectacles (definition in SPEC). |
| **Désistements** (red→orange gradient) | Count + **%** — **withdrawals** / declined after commitment (definition in SPEC). |

Percentages are **season-scoped** and **consistent** with DOMAIN definitions (numerator/denominator).

**Season chart — « un clin d’œil »**

- **Horizontal axis:** months of the season (V1: **SEP** → **AOÛ**).
- **Per month:** a **vertical stack** of **square blocks** — **one block per spectacle** in that month (density shows activity at a glance).
- **Block colour** encodes **status** for that person on that event (V1 parity — see [**Participation semantic colors**](ux-design-participation-semantic-colors.md)):
  - **Green→emerald gradient** — available (dispo only, no selection).
  - **Purple→pink gradient** — selected / confirmed in team.
  - **Orange→yellow gradient** — pending confirmation.
  - **Red→orange gradient** — declined / désistement.
  - **Red gradient** — unavailable (pas dispo).
  - **Grey gradient** — no response / neutral.
- **Icons inside blocks** (optional) — **role** emoji (e.g. 🎭 joueur·se, 🤝 bénévole) when slotted.

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
| **Member dropdown** (left) | **Avatar + name** (e.g. *Patrice*). Lets **organizer/admin** switch **subject** to view or edit **that person’s** dispo for **this event**. Options = **eligible event roster** (same pool as **Tous**: season participants minus exclusions, plus event-only guests). For a normal member, expect **self only** or no switching—align with permissions. *As-built 2026-06-06:* sourced from availability **summary**, not season-wide `/participants/selectors`. See [ux-design-participant-roster-admin.md](./ux-design-participant-roster-admin.md). |
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
- [ ] **Material 3** — voir [Revue M3 — onglet Dispos](#revue-m3-onglet-dispos) (composants, tokens, chances, commentaire).

---

## Revue Material 3 — onglet Dispos {#revue-m3-onglet-dispos}

**Date :** 2026-05-27 · **Périmètre :** `/saison/:slug/event/:eventId?tab=dispos` (et modal agenda partageant `availability-form`).  
**Références normatives :** [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) (checklist M3, UX-DR11), stories **5.3** (done), **5.5** (proxy, done), implémentation [`apps/web/src/app/shared/availability/`](../../apps/web/src/app/shared/availability/).  
**Story d’implémentation :** [_bmad-output/implementation-artifacts/5-6-dispos-onglet-material-3-et-commentaire.md](../implementation-artifacts/5-6-dispos-onglet-material-3-et-commentaire.md).

### Contexte du challenge

Le parcours métier (**Moi / Tous**, trichotomie Dispo, candidature par rôle, transparence des chances, sélecteur de sujet orga) reste **valide** et aligné UX-DR5 / FR19. L’écart principal est **visuel et structurel** : l’onglet repose encore sur des patterns **V1** (couleurs hex/rgba, accordéon HTML, pourcentages optionnels) alors que le shell applicatif est en **thème M3** (`mat.theme()`, `color-scheme: light dark`).

### Décisions produit (post-challenge)

| Sujet | Décision cible V2 | Rationale |
|-------|-------------------|-----------|
| **Chances en vue Tous** | **Affichées par défaut** pour tout membre autorisé sur l’onglet (spec originale § « Tous »). | Transparence tirage (FR19) ; le bouton actuel « Afficher les chances » est un contournement perf (cf. [G-003](growth-backlog.md)) — à remplacer par chargement initial `includeChances=true` + **skeleton** sur les cellules % si l’API est lente, pas par un état sans %. |
| **Masquage des chances** | **Optionnel** : action secondaire « Masquer les chances » (`mat-stroked-button`) seulement si le PO valide le besoin terrain ; sinon retirer le toggle. | Éviter deux modèles mentaux ; priorité à la spec transparence. |
| **Couleurs sémantiques dispo** | **Tokens de thème** nommés (pas de `#` / `rgb()` dans les features). | M3 + modes clair/sombre ; conserver la lecture verte / rouge / gris via tokens documentés. |
| **Commentaire (FR18)** | **Même champ** dans la [modal](#pattern-availability-modal-overlay) et le panneau **Moi** (`availability-form`), max **500** caractères, auto-save comme le statut. | Spec modal + onglet ; story epic **5.4** — livrée dans la story **5.6** (pas de divergence de copy). |
| **États dispo (3)** | Conserver **trois actions exclusives** ; implémentation cible : **`mat-button-toggle-group`** (une ligne) ou **`mat-chip-listbox`** `selection="single"` plutôt que trois `mat-flat-button` surchargés en CSS. | Meilleure annonce a11y (exclusivité) et états M3 (selected / unselected). |

### Composants Material cibles

| Zone actuelle | Cible M3 |
|---------------|----------|
| Toolbar **Moi / Tous** | `mat-button-toggle-group` (conservé) — état actif via **`--mat-sys-primary-container`** / **`--mat-sys-on-primary-container`**, pas `rgba(147, 51, 234, …)`. |
| Sélecteur sujet | `mat-form-field` + `mat-select` (conservé). |
| **3 états** + rôles | `mat-button-toggle-group` ou chips single-select + `mat-checkbox` (rôles) ; `mat-form-field` + `textarea` (commentaire). |
| Accordéon **Tous** | **`mat-accordion`** / **`mat-expansion-panel`** par rôle ; chevron **`mat-icon`** `expand_more` (rotation), pas caractères ▶/▼. |
| Grille candidats | **`mat-nav-list`** ou `mat-list` avec `matListItemAvatar` + meta pour le **%** (ou skeleton). |
| Chargement | `mat-spinner` (conservé) ; skeleton inline pour % en attente. |

### Tokens de thème (à définir dans `apps/web/src/styles.scss`)

Exposer des variables **globales** (mood « spectacle » autorisé par FRONTEND_UI si centralisé) :

| Token | Usage |
|-------|--------|
| `--hatcast-availability-available` | Fond / bordure état **Dispo** (dérivé de `tertiary` ou `color-mix` sur `--mat-sys-tertiary`). |
| `--hatcast-availability-unavailable` | État **Pas dispo** (`--mat-sys-error` / mix). |
| `--hatcast-availability-unknown` | État **Non renseigné** (`--mat-sys-surface-variant`, `--mat-sys-on-surface-variant`). |
| `--hatcast-chance-high` / `--medium` / `--low` | % en vue **Tous** — échelle sémantique (éviter `#34d399`, `#fbbf24`, `#fb7185` en feature SCSS). |

Surfaces accordéon / cartes : **`--mat-sys-surface-container-low`**, **`--mat-sys-outline-variant`** — pas `rgba(255,255,255,0.08)` en dur.

### Vue « Moi »

- **Feedback** sous les états : typo **`--mat-sys-body-small`**, couleur **`--mat-sys-on-surface-variant`**.
- **Bloc rôles** : conteneur avec bordure token ; titre en **title-small** ou **body-large** token.
- **Cibles tactiles** : hauteur minimale **48 dp** sur les trois choix de statut (breakpoint ≤ 480 px : conserver grille 3 colonnes si lisible, sinon empiler).
- **Proxy / lecture seule** : bandeau existant conservé ; en **proxy** (orga édite pour un autre), commentaire **éditable** comme le statut (**FR18**) ; en consultation sans proxy, commentaire **lecture seule**.

### Vue « Tous »

- En-tête de rôle : **icon rôle + libellé FR + ratio `(candidats/places)`** dans le `mat-expansion-panel-header`.
- **%** : tri descendant inchangé (algorithme V1 / API) ; affichage **dès le premier rendu** de l’onglet en mode Tous (avec skeleton si chargement).
- Clic personne (orga) : **`aria-label`** du type *« Modifier la disponibilité de {nom} »* quand édition autorisée ; *« Voir la disponibilité de {nom} »* en lecture seule — le `title` seul ne suffit pas (a11y).
- Grille : **2 colonnes** ≤ 480 px ; **3 colonnes** optionnelles ≥ 600 px (densité desktop sans changer le modèle).

### Toolbar (sous les onglets événement)

Ordre recommandé (mobile, colonne) : **sujet** (si visible) → **Moi / Tous** → action chances (si conservée). Focus clavier cohérent.

### Aide contextuelle (optionnel — lien G-002)

Icône **`help_outline`** (`mat-icon`) à côté du ratio `(n/m)` et/ou du libellé des chances : **dialog** ou **tooltip** Material expliquant le calcul (malus sélections passées × places). Hors scope minimal de la story **5.6** sauf temps restant.

### Non-objectifs (story 5.6)

- Refonte perf API `summary` / `ensureMembershipParticipants` (rester dans [G-003](growth-backlog.md) / epic perf).
- Bottom app bar, rail hub, onglets Infos / Équipe.
- Affichage du commentaire sur pages **publiques** (interdit FR18).

### Acceptance hints — Material 3 (revue / QA)

- [ ] Aucune couleur **hex/rgb** en dur dans `event-dispos-tab`, `availability-form`, `availability-tous-panel`, `availability-subject-selector` (hors `styles.scss`).
- [ ] Onglet lisible en **mode clair** et **sombre** (`prefers-color-scheme`).
- [ ] Accordéon rôles = **`mat-expansion-panel`** ; liste candidats = **`mat-list`** (ou équivalent documenté).
- [ ] **%** visibles par défaut en **Tous** (ou skeleton explicite pendant chargement).
- [ ] **Commentaire** présent dans modal + onglet ; validation **≤ 500** caractères.
- [ ] Contrôles interactifs principaux **≥ 48 dp** ; `aria-label` FR si libellé masqué.
- [ ] Checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) parcourue en fin de story ; écarts dans Dev Notes ou `ISSUES.md`.

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

**Normative layout (V2 — validated 2026-06-05):** [_ux-design-composition-equipe-slot-rows.md_](ux-design-composition-equipe-slot-rows.md).

**Layout**

- **One slot row per required role** — e.g. DJ, MC, several **Comédien·ne** as configured.
- **Fixed 3-column grid:** role **pill** (emoji + label, same family as Activité audit pills) | **avatar + name** or **« À pourvoir »** | **×** clear when editable.
- **Role pill always visible** — filled or empty; vacant copy is muted **« À pourvoir »** (no inner dashed box; gap-empty rows keep a **dashed row border** after declines).
- **Organizer hints** (consecutive show **6.20**, multi-role same event) — compact pill on a **second line**, left edge aligned with the **avatar**; detail in `matTooltip` on tap.

**Interaction — organizers / administrators**

- **Tap the whole row** (pill + body) → **candidate list** with **%** (Dispos family).
- **×** clears the assignee (does not open the picker); allowed **until validation**.

**Interaction — members (post-publish rules)**

- **Tap their row** (pill + body) → [**Confirmer ma participation**](#pattern-confirm-participation-modal). **Organizers/admins** may open confirmation for managed slots; **members** only for **their** assignment (SPEC).

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
| **Draft / compo editable** | Composition editable; **only org/admin** may see the **current** draft until **Valider**. | Orange/brown **filled** slots; status *« À composer »* or *« En préparation »*; **draft zone** in Équipe tab (see below) — not a global header banner. |
| **Validated (structural lock)** | Lineup **locked** for casual edits; **visible** to participants; **respond** via modal. | **No** clearing / reassignment **without Déverrouiller** (or equivalent); **« Annoncer la compo »** available. |
| **Validated but incomplete** | **Valider** applied yet **one or more slots** still **empty** — org must **fill** (manual or **Compléter** random). | **Warning** *« À compléter : … »*; actions **Compléter**, **Annoncer**, **Déverrouiller** (see capture). |

**Unlock** — **« Déverrouiller »** returns to an **editable** composition state (SPEC: who may unlock, audit). Participation statuses (`confirmed`, `pending`, `declined`) are **preserved** on unlock; first validate and revalidate only reset **non-`confirmed`** assignees to `pending` before notifications (DOMAIN.md, SCP 2026-06-07).

### Pattern: Composition organizer draft zone {#pattern-composition-organizer-draft-zone}

When the composition is in **organizer draft** (`validatedAt` null) and the viewer has `canManageComposition`:

- **Placement** — **Équipe tab only** (`event-equipe-tab__composition-body--draft`), **not** the global event-detail status chrome. Toolbar actions (Valider, Tirer au sort, Partager, …) stay **outside** the colored zone.
- **Visual language** — Same family as [`app-event-detail-draft-banner`](../../apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts): `primary-container` background, chip *Brouillon*, body copy for orga-only visibility.
- **Copy (normative FR)** — *« Cette composition est actuellement visible uniquement par les organisateur·ices et administrateur·ices. Vous pouvez la partager si nécessaire avant de la valider. »*
- **Contents inside zone** — Gender parity hint (if shown), slot grid, declined collapsible. Status badge + `(?)` help remain in **global chrome** per [composition status help](ux-design-composition-status-help.md).

### Primary controls (organizer/admin toolbar)

**V2 implementation (story 6.12):** compact **2-column grid** at the bottom of the Équipe tab; **one** Material 3 **filled** button (`mat-flat-button`, `color="primary"`) per state; all other visible actions use **outlined** (`mat-stroked-button`). **No** per-button rainbow gradients (V1 mood deprecated for this toolbar).

| Composition state | Primary (filled) | Grid secondaries (outlined) | Overflow (`⋯` → menu) |
|-------------------|------------------|-----------------------------|------------------------|
| À composer | **Tirer au sort** | — | — |
| En préparation (draft) | **Valider** | Tirer au sort, **Partager** | — (overflow only if **≥ 4** visible actions) |
| Confirmations en cours / complète / à vérifier | **Annoncer la compo** | Déverrouiller | — |
| À compléter (validated, empty slots) | **Compléter** | Annoncer, Déverrouiller | — |

- **Partager** / **Annoncer** — open the shared [**Share & announce**](#pattern-share-announce) modal. **Partager** is **outlined in the grid** during composition draft (alongside **Valider** + **Tirer au sort**) so organizers can coordinate before validate without opening the overflow menu. Overflow (`⋯`) appears only when **four or more** secondary actions would be visible.
- **Valider** — commits visibility and locks editing; when **Valider** is available, the status hint **does not** repeat the validate CTA (short admin-only copy + dedicated **actions lead** above the toolbar).
- **Toolbar** — `role="toolbar"`, `aria-label="Actions de composition"`; stable `data-testid` hooks for E2E (`composition-action-*`). **Sticky** at the bottom of the tab scroll area on long grids (mobile).
- **Effacer** / **Simuler** — not in V2 yet (separate stories if requested).

**After validation:** no casual edit / clear / redraw except **Déverrouiller** (always **outlined**, never primary). **Annoncer** stays **primary** whenever shown with unlock.

### Pattern: “Confirmer ma participation” (modal) {#pattern-confirm-participation-modal}

**When:** A **member** (or admin acting in a defined way) opens **their** role slot to **respond** to the assignment.

**Structure**

- **Title:** *« Confirmer ma participation »*; **close** ×.
- **Event** — title + date (same as other modals).
- **Rôle assigné** — recap card, e.g. *« Joueuse »* with emoji — **reminder** of what they are answering for.

**Responses (three large buttons — V1 diagonal gradients, 135°)**

| Action | Gradient (V1) | Purpose |
|--------|---------------|---------|
| **Confirmer** | Purple `#a855f7` → pink `#ec4899` | Accept the role. Token: `--hatcast-participation-selected-gradient-strong`. |
| **Décliner** | Red `#ef4444` → orange `#f97316` | Refuse. **Frees the slot**; decline **recorded** under [Personnes ayant décliné](#declines-audit). Token: `--hatcast-participation-declined-gradient-strong`. |
| **À confirmer** | Orange `#f97316` → yellow `#eab308` | Explicit **pending** — user will decide later. Token: `--hatcast-participation-pending-gradient-strong`. |

**Colour continuity:** each state’s **gradient** maps to the **Équipe** slot row, Mes Stats chart block, and stat counters — same `-gradient-strong` token per state ([spec](ux-design-participation-semantic-colors.md)).

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

- [ ] Every **role** required for the event has a **slot row**; role **pill** + empty/filled body are **obvious** ([slot-rows spec](ux-design-composition-equipe-slot-rows.md)).
- [ ] **Whole row** opens **ordered** candidate list with **%**; **×** clears when **editable** (independent of row tap).
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
| **Membres & organisateurs** | **Manage troupe members** from route **`/troupe/:troupeSlug/admin/membres`** (entry on **`/seasons`**, legacy alias **`/troupe/admin/membres`**); **season organizers** on second tab. Legacy alias **`/saison/:slug/admin/membres?onglet=organisateurs`** for season-only organizers. **Export** + **Importer ▾** toolbar; add via modal; search; compact list; **slide toggle** active; **Retirer** with confirmation (removes troupe membership only, not the user account); **inactive hidden by default** (*Afficher les inactifs*); no dates; **Nommer orga saison** shortcut. **Participants** (season/event rosters, Story 3.8) via season ⚙ menu — label **Participants**, not Membres. |
| **Spectacles** | **Manage spectacles** (CRUD, dates, types, venues, status) for the relevant scope (season / troupe). |
| **Troupe & saisons** | **Manage troupe** identity and **seasons**: create, rename, archive; **at most one season active at a time** for a given troupe context (activate/deactivate explicitly—rules in DOMAIN/SPEC). |

---

## Screen: Admin Membres (`/troupe/:troupeSlug/admin/membres`) {#screen-admin-membres}

### Purpose

Unified **troupe members** (tab **Membres**) and **season organizers** (tab **Organisateur·ices**) inside the season context. Replaces separate modals from the settings menu.

**Vocabulary (locked):** **Membres** = troupe scope; **Participants** = season/event participant rosters (Story 3.8, future screen).

**Stakeholder sign-off (2026-05-23):** one route; CSV via **Exporter** + **Importer ▾**; compact list; slide toggle; hide dates; add via modal; search; inactive filtered by default; **Nommer orga saison** shortcut.

### Entry

- **`/seasons`** → **Membres** → route (default tab Membres).
- Season header **⚙** → **Participants** ; **Organisateur·ices** (orga saison sans admin troupe) → legacy `/saison/:slug/admin/membres?onglet=organisateurs`.
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
