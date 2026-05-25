# Design Thinking Session: HatCast V2 Navigation

**Date:** 2026-05-25
**Facilitator:** Patrice
**Design Challenge:** Reconcile troupe / league / event / agenda navigation for orga vs member journeys and converge on a target route model.

---

## 🎯 Design Challenge

HatCast V2 must serve two mental models at once: the **member** who wants upcoming shows across troupes, and the **organizer** who manages troupe identity, leagues, events, and rosters. Today the app mixes legacy vocabulary (`saison`, `/seasons`), transitional aliases (`/ligue`, `/saison`), and a partially shipped target IA (`/agenda` as member hub). The design challenge is to make navigation **predictable, deep-linkable, and role-aware** without forcing members through admin-oriented screens.

### Challenge statement

**How might we design HatCast V2 routes and wayfinding so that members land in action (`/agenda` → event), organizers reach troupe/league admin in ≤2 taps from any event, and the URL vocabulary (troupe / ligue / événement) matches user language while legacy paths remain safe during transition?**

---

## 👥 EMPATHIZE: Understanding Users

### User Insights

**Patrice (product owner, 2026-05-25):**

- `/seasons` feels wrong: troupe administration should not live on a page titled "Saisons". Expected model: **`/troupes`** (directory, default filter = my troupes, optional discovery) → **`/troupes/:slug`** (troupe home: members admin, programme list, create/edit programmes, troupe settings, future stats).
- **Neither "saison" nor "ligue"** fits: real need is flexible **internal groupings** (La Malice: déplacements + saison; others: débutant, loisir, cabaret, ados…). Multiple concurrent groupings are normal.
- **Saison** may be a **temporal dimension** (equity/fairness window), not the main navigation object.
- **Ligue** evokes inter-troupe championship — out of scope; HatCast stays troupe-local spectacle organization.
- Groupings might be **stat/equity axes** or **filters**, not only permanent containers — e.g. déplacements separate; future **Aperock** separate mid-year without full reconfiguration.
- **Navigation chrome:** On league workspace and event detail, user lacks **where am I** (troupe identity). Wants **breadcrumb**: troupe logo → programme name; remove back-to-`/seasons`. Event strip links troupe name to **admin membres** today — should link **troupe hub**.
- Back chevron on `ligue/:slug` → `/seasons` reinforces the wrong mental model.

### Key Observations

| Theme | Say / Think | Do | Feel |
|-------|-------------|-----|------|
| `/seasons` | "Why is troupe admin here?" | Uses page for season CRUD + Membres link | Confused ownership of screens |
| Programme naming | "Ligue sounds like external competition" | Uses "groupe", "déplacements", "Aperock" in conversation | Needs vocabulary that scales per troupe |
| Equity | "Déplacements count apart; maybe Aperock too" | Wants mid-year rule change without dev | Anxious about rigidity |
| Wayfinding | "I don't see which troupe this league is" | Clicks troupe name → lands on wrong screen | Lost in nested admin URLs |
| IA target | `/troupes` + `/troupes/:slug` | — | Aligned with Epic 14 intent, not current routes |

**Code-grounded friction (2026-05-25):**

- `SeasonsList` (`/seasons`): title "Saisons", troupe switcher, **Administration troupe** block → `/troupe/:slug/admin/membres`, grid of seasons/leagues.
- `SeasonHeader`: back hardcoded to `/seasons`; shows league title only, generic icon (no troupe logo/name).
- `event-context-strip`: troupe link → `/troupe/:slug/admin/membres` (admin shortcut, not hub).

### Empathy Map Summary

```
         SAY                          THINK
  "Pas saison ni ligue"        "Un groupe = participants + spectacles
  "Breadcrumb troupe > …"       + dispos + compo + stats, variable par troupe"
  "Aperock à part comme dépl."  "Équité = règles configurables, pas du code"

         DO                           FEEL
  Admin via /seasons            Frustration (mauvais hub)
  Cherche troupe sur écran ligue  Besoin d'ancrage visuel (logo)
  Clique nom troupe → admin       Surprise (mauvaise destination)
```

---

## 🎨 DEFINE: Frame the Problem

### Point of View Statement

**Troupe administrators and active members** need **persistent, visible context** (which troupe, which programme) and **entry points that match responsibilities** (`/agenda` for shows, `/troupes/:slug` for troupe life, programme workspace for spectacle lists) because the legacy **`/seasons` hub conflates troupe admin with programme listing** and **misleading labels (saison/ligue)** hide the real domain: **flexible programmes and configurable stat scopes** inside a troupe.

### How Might We Questions

1. **HMW** replace `/seasons` with a **`/troupes` directory** that defaults to "my troupes" but supports discovery — without breaking admin workflows?
2. **HMW** name and model **programme containers** so La Malice can run "déplacements + saison" and another troupe runs "ados + cabaret" without implying inter-troupe leagues?
3. **HMW** separate **calendar/equity time windows** from **programme membership** so fairness rules can span or split periods independently?
4. **HMW** let organizers define **stat compartments** (déplacements, Aperock, …) mid-season via configuration, not deploys?
5. **HMW** use a **single breadcrumb pattern** (troupe logo → programme → event) on all deep screens so back chevrons to `/seasons` become unnecessary?
6. **HMW** route every "troupe name" click to **`/troupes/:slug`** and reserve `/admin/membres` for explicit admin actions from that hub?

### Key Insights

1. **Three layers emerging** (not two): **Troupe** (identity, members) → **Programme** (roster, events, draws — name TBD) → **Stat/equity scope** (may be programme-bound, tag-bound, or time-bound).
2. **ADR 0011 "Ligue"** solved multi-active containers but **overloaded** "saison" semantics; stakeholder feedback **reopens vocabulary** — plan as **domain + ADR amendment**, not only UI rename.
3. **Navigation fix is partly IA, partly chrome**: Epic 14 hub + breadcrumb component; quick win = fix links and header (stop `/seasons` as back target for members).
4. **Configurable compartments** is the riskiest open design — MVP may stay "one programme = one stat bucket" (separate programmes for déplacements/Aperock) until a **rules engine** slice is scheduled.

### Domain refinement — Equity tag (Patrice, 2026-05-25, revised)

**Decision direction (session):**

| Concept | Role | Navigable? |
|---------|------|------------|
| **Troupe** | Identity, members, settings | Yes — `/troupes`, `/troupes/:slug` |
| **Saison** | First-class in troupe: temporal bounds, stable participant roster, event list, draws | Yes — `/saison/:slug` |
| **Tag d'équité** (`equity_tag`, optional on event) | Splits chance/draw/stat **assiette**; troupe-defined glossary + creatable | **No** (filter later) |

**Rules:**

- At most **one** tag per event.
- **Empty** → **équité principale** (system default; **not shown in UI**).
- **Set** (e.g. `deplacements`, `aperock`) → separate pool for chances + auto-draw + stats.
- UI: optional **autocomplete**; unknown input **creates** troupe tag; **×** clears tag.
- Inline help explains chance-calculation impact.
- **La Malice:** one main saison + tags `deplacements`, `aperock` — not separate saisons.
- Other troupes may still run **multiple concurrent saisons** when rosters differ.

**Distinction from `templateType`:** format vs equity bucket; migrate `templateType=deplacement` → tag `deplacements`.

**Conflict with ADR 0012:** travel leagues → superseded by tags within saison.

**Event URLs:** add `events.slug` unique per season → `/saison/:slug/event/:eventSlug` (UUID redirect).

---

## 💡 IDEATE: Generate Solutions

### Selected Methods

Brainstorming + SCAMPER on navigation IA; domain model validated via stakeholder walkthrough.

### Generated Ideas

**Navigation & IA**

1. `/troupes` — annuaire, default tab « Mes troupes », secondary « Découvrir »
2. `/troupes/:slug` — hub troupe (programmes, membres, paramètres, stats troupe future)
3. `/saison/:slug` — workspace saison (agenda, historique, stats) — **keep saison in URL**
4. `/saison/:slug/event/:id` — détail spectacle
5. `/agenda` — hub membre cross-saisons
6. Breadcrumb component: `[logo troupe] › [Saison title]` / `[logo] › [saison] › [event]`
7. Remove `routerLink="/seasons"` back; breadcrumb troupe → `/troupes/:slug`
8. Event context strip: troupe link → hub not admin
9. Redirect `/seasons` → `/troupes` (301) + `/troupes?scope=mine`
10. Redirect `/ligue/:slug` → `/saison/:slug` (alias only)
11. Admin membres only from hub: `/troupes/:slug/admin/membres`
12. Post-login: `/agenda` or last `/saison/:slug` (not `/seasons`)
13. Season header: troupe logo from API, click → hub
14. Optional filter on stats: « Compartiment » dropdown (post-MVP)
15. Badge on event row in agenda: small tag icon if compartment ≠ principal

**Domain / equity**

16. DB: `events.equity_compartment` nullable enum (troupe-extensible later)
17. Troupe-level config table `equity_compartments` (slug, label, active) — add Aperock without deploy
18. Draw service: partition eligible pool by compartment + saison bounds
19. Stats: DEPLACEMENT column driven by compartment=deplacements, not templateType
20. Migration: map `template_type=deplacement` → compartment deplacements, keep template as match/custom
21. Chances: separate counters per compartment within saison date range
22. Validation: API rejects second compartment field; UI radio not multi-select
23. Default principal compartment implicit — no DB value required
24. Personal glance `/membre/:slug` — filter by compartment optional
25. Inter-troupe: two events, same compartment rules per troupe's saison
26. Document: saison = temporal + roster; compartment = stat axis only
27. ADR 0013 (proposed): equity compartment model, supersedes 0012 travel league
28. Epic 13 multi-active saisons **still valid** for multi-roster troupes, orthogonal to tags
29. Event form: compartment selector under « Type de spectacle » with help text
30. Reporting export CSV includes compartment column

### Top Concepts

| # | Concept | Summary |
|---|---------|---------|
| **A** | **IA « Troupe-first »** | `/troupes` + `/troupes/:slug` hub; `/saison/:slug` workspace; breadcrumb everywhere; kill `/seasons` as hub |
| **B** | **Saison + compartiment d'équité** | One optional tag per event; principal by default; troupe-configurable compartment list; amend ADR 0012 |
| **C** | **Phased delivery** | Phase 1: navigation + links (no schema). Phase 2: `equity_compartment` + draw/stats. Phase 3: troupe-config compartments |

---

## 🛠️ PROTOTYPE: Make Ideas Tangible

### Prototype Approach

**Methods:** Storyboarding (3 critical journeys) + paper-style ASCII wireframes + route map (no code in this step).

**Fidelity:** Low — enough to test wayfinding and domain comprehension with Patrice + 1–2 orgas Malice.

**What we fake:** Troupe hub `/troupes/:slug` (Epic 14 not built); `equityCompartment` on API (Phase 2).

**What we learn:**

- Do users find troupe admin without landing on `/seasons`?
- Is breadcrumb clearer than back chevron?
- Is « Comptage pour les chances » understood vs « compartiment d'équité »?
- Do they assume déplacement = type de spectacle or separate fairness bucket?

### Prototype Description

#### Route map (target — Phase 1 navigation)

```
/connexion
/agenda                          ← member root
/troupes                          ← directory (default: mine)
/troupes/:troupeSlug              ← troupe hub (NEW)
/troupes/:troupeSlug/admin/membres
/saison/:slug                     ← season workspace (canonical; /ligue alias redirect)
/saison/:slug/event/:eventSlug    ← human slug (unique per season); UUID alias redirect during migration
/saison/:slug/admin/participants
/compte

Event slug generation: from title on create (dedupe suffix `-2`…); editable in form; stable for sharing.

Redirects:
  /seasons     → /troupes?scope=mine
  /ligue/:slug → /saison/:slug
  /saison/:slug/event/:uuid → /saison/:slug/event/:eventSlug (301)
  /accueil     → /agenda
```

**Note:** `events` table currently has **no slug** (UUID routes only) — Phase 1b or 2 migration adds `events.slug` + unique `(season_id, slug)`.

#### Shared component: `app-context-breadcrumb`

Replaces left chevron + orphan context strip on season/event screens.

**Desktop (≥ breakpoint `md`):**

```
┌──────────────────────────────────────────────────────────────┐
│ [logo] La Malice  ›  Saison 2025-26  ›  Match BIM    [avatar] │
└──────────────────────────────────────────────────────────────┘
```

**Mobile:** troupe **logo only** (tap → `/troupes/:slug`); saison + event titles live in page heading below — avoids horizontal overflow.

- Logo = troupe `logoUrl` or fallback icon; `aria-label` includes full path for screen readers.
- No link on current leaf segment.
- **No ⚙ in header** — admin entry moved to contextual strip (see below).
- **Remove** `event-context-strip` duplicate line once breadcrumb ships.

#### Shared component: `app-scope-admin-bar` (below header, role-gated)

Placed on **main canvas** of troupe hub, season workspace, and event detail — not in top chrome.

```
┌──────────────────────────────────────────────────────────────┐
│ [⚙ Administration de la troupe ▾]   (TROUPE_ADMIN only)      │
│   → Membres · Paramètres · …                                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [⚙ Administration de la saison ▾]   (season orga perms)    │
│   → Participants · Organisateur·ices · …                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ [⚙ Administration du spectacle ▾]   (event-level perms)      │
│   → Participants · Organisateur·ices · …                     │
└──────────────────────────────────────────────────────────────┘
```

One scope visible per screen (troupe | saison | spectacle).

#### Wireframe P1 — `/troupes` (replaces `/seasons` list semantics)

```
┌ [logo?] Mon espace troupes ─────────────────────── [avatar ▾] ┐
│  breadcrumb: « Mon agenda › Troupes » (desktop) or title only │
├────────────────────────────────────────────────────────────────┤
│  ## Mes troupes                                                │
│  ┌──────── card ────────┐  ┌──────── card ────────┐           │
│  │ [logo] La Malice     │  │ [logo] Les Impros    │           │
│  │ 34 membres           │  │ 12 membres           │           │
│  │ 5 spectacles à venir │  │ 1 spectacle à venir  │           │
│  │ [ Ouvrir ]           │  │ [ Ouvrir ]           │           │
│  └──────────────────────┘  └──────────────────────┘           │
├────────────────────────────────────────────────────────────────┤
│  ## Découvrir                                                │
│  (cards same layout — other troupes; actions TBD)              │
│  OPEN: non-member → read-only spectacles? join request? later  │
└────────────────────────────────────────────────────────────────┘
```

- **Breadcrumb** on this screen too (parent: `/agenda` or account root).
- **Mes troupes:** memberships only; **card grid** with logo, member count, upcoming event count.
- **Découvrir:** separate section below; same card visual language; membership actions **OPEN QUESTION**.

#### Wireframe P2 — `/troupes/malice` (troupe hub — NEW)

```
┌ breadcrumb: Troupes › La Malice ────────────────── [avatar ▾] ┐
│  (mobile: logo troupe only in breadcrumb slot)                 │
├────────────────────────────────────────────────────────────────┤
│         [ large logo ]                                         │
│         La Malice                                              │
├────────────────────────────────────────────────────────────────┤
│  [ ⚙ Administration de la troupe ▾ ]  (admin, below fold)    │
├────────────────────────────────────────────────────────────────┤
│  Saisons                              [ + Nouvelle saison ]    │
│  ┌ Saison 2025-26 · active ─────────────────── [ Ouvrir ] ─┐  │
│  └─────────────────────────────────────────────────────────┘  │
│  [ Voir les saisons archivées ]                                │
├────────────────────────────────────────────────────────────────┤
│  [ ♡ Préférences dans cette troupe ]  (icon, secondary)        │
│      → drawer: pseudo troupe, rôles préférés                    │
├────────────────────────────────────────────────────────────────┤
│  [ Explorer d'autres troupes ]  → /troupes#decouvrir           │
└────────────────────────────────────────────────────────────────┘
```

- **Breadcrumb** required (`/troupes` › troupe name).
- **Hero:** logo + name; no inline pseudo block.
- **⚙** troupe admin strip under hero — not in header.
- **Préférences** (icon): pseudo + preferred roles — low prominence.
- **Membres** via ⚙ menu → `/troupes/malice/admin/membres`.

#### Wireframe P3 — `/saison/2025-26` (season workspace)

```
┌ breadcrumb: [logo] La Malice › Saison 2025-26 ───────── [av.] ┐
├────────────────────────────────────────────────────────────────┤
│  [ ⚙ Administration de la saison ▾ ]                           │
├────────────────────────────────────────────────────────────────┤
│  [ Agenda ● ] [ Historique ]                                   │
│  ┌ 30 mai · Match BIM ─────────────────────── [tag dépl.] ─┐  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

- Back chevron **removed**; troupe logo (mobile) / full breadcrumb (desktop).
- Event rows link to `/saison/:slug/event/:eventSlug` when slugs exist.
- Tag badge on row if `equityTag` set (Phase 2).

#### Wireframe P4 — Event form dialog (Phase 2 — equity tag)

Existing: titre, date, lieu, description, **type de spectacle** (templateType).

**Add** (optional field):

```
Tag (optionnel)                                    [ × effacer ]
┌─────────────────────────────────────────────────────────────┐
│ dépl…                                                        │  ← autocomplete
└─────────────────────────────────────────────────────────────┘
  Suggestions: déplacements · aperock · …
  Tape un nom inconnu pour créer un tag troupe.

ℹ️ Aide : Sans tag, le spectacle compte dans l’équité principale de la
   saison (comportement par défaut). Avec un tag, les participations
   comptent dans un compartiment séparé pour les chances et tirages auto.
   Un seul tag par spectacle.

```

**Rules (Patrice refinement):**

- **Principal compartment:** system default when field empty — **not shown** in UI (no radio « Principal »).
- **Optional** autocomplete; creatable tags per troupe vocabulary.
- **Clear** control (`×`) removes tag → back to principal.
- At most **one** tag per event (single autocomplete value, not multi-select).
- DB/API: `equity_tag` nullable string (or FK to `troupe_equity_tags`); distinct from `templateType`.
- Troupe admin UI (later): manage tag glossary + help text template.

#### Storyboard — Journey A (member Léa)

1. Login → `/agenda`
2. Tap event row → `/saison/:slug/event/:id`
3. Breadcrumb: tap **La Malice** → `/troupes/malice` (not admin membres)
4. Tap **Saison 2025-26** → `/saison/:slug` agenda tab

#### Storyboard — Journey B (orga Amira)

1. `/agenda` → link **Mes troupes** → `/troupes`
2. Open **La Malice** → hub
3. **+ Nouvelle saison** or **Ouvrir** existing
4. Create event → choose **Apérock** compartment → save
5. Run auto-draw → verify pool excludes principal-only history for aperock-tagged past events (Phase 2 Wizard-of-Oz: spreadsheet mock acceptable)

#### Storyboard — Journey C (deep link)

1. Notification URL `/saison/x/event/y` → event loads
2. Breadcrumb visible without prior `/seasons` visit
3. No dead-end back to `/seasons`

### Key Features to Test

| # | Assumption | Test task | Pass signal |
|---|------------|-----------|-------------|
| T1 | `/troupes` is the right admin entry | « Tu veux gérer les membres de La Malice » — where do you click? | Lands on hub → Membres, not `/seasons` |
| T2 | Breadcrumb beats chevron | On event screen, go to troupe home | Uses troupe logo/name, not browser back |
| T3 | Saison = navigable programme | « Ouvre la saison en cours » | Opens `/saison/:slug`, not a filter |
| T4 | Tag + autocomplete clear | Add tag « aperock » for chances | Understands optional; not spectacle type |
| T5 | Principal invisible | Create regular match | Leaves tag empty; no principal option shown |
| T6 | Remove tag | Clear tag on edit | Returns to default equity |
| T8 | Mobile breadcrumb | Open event on phone | Troupe logo visible; no clipped text |
| T9 | Admin gear placement | Find season participants admin | Uses ⚙ strip on season page, not header |
| T10 | Event URL | Share link | Readable `/event/match-bim-30-mai` slug |
| T7 | Legacy redirect | Open bookmark `/seasons` | Arrives `/troupes` without confusion |

---

## ✅ TEST: Validate with Users

### Testing Plan

**Format:** 5 moderated sessions (30–40 min) — mix paper wireframes (Figma optionnel) + walkthrough of current app pain points.

**Participants (target 5–7):**

| # | Profile | Troupe | Device |
|---|---------|--------|--------|
| 1 | Patrice | La Malice | desktop + phone |
| 2 | Troupe admin | La Malice | phone |
| 3 | Active member (non-admin) | La Malice | phone |
| 4 | Troupe admin | autre troupe si dispo | desktop |
| 5 | Dual-troupe member | 2 troupes | phone |

**Materials:** printed wireframes P1–P4 from Prototype section; task script below; feedback grid (Likes / Questions / Ideas / Changes).

**Session flow:**

1. Context (2 min) — no leading questions about `/seasons`.
2. **Current app** task T0: « Montre-moi comment tu gères les membres » — observe natural path (baseline).
3. **Wireframe** tasks T1–T10 (think-aloud).
4. **Tag concept** (5 min): show event form mock; explain empty = principal invisible.
5. Feedback grid debrief.

**Task script (French):**

| ID | Prompt | Observe |
|----|--------|---------|
| T0 | Gérer les membres de ta troupe | `/seasons` vs autre? confusion? |
| T1 | Où cliques-tu pour la troupe? | hub vs admin direct |
| T2 | Depuis ce spectacle, retour à la troupe | logo vs back navigateur |
| T3 | Ouvrir la saison en cours | URL mentale `/saison/...` |
| T4 | Spectacle compté à part pour les chances (Apérock) | tag autocomplete vs type |
| T5 | Spectacle normal sans exception | champ tag vide |
| T6 | Enlever un tag sur un spectacle existant | bouton × visible |
| T7 | Vieux favori `/seasons` | compréhension redirect |
| T8 | (mobile) Ouvre le spectacle | logo seul suffisant? |
| T9 | Ajouter un participant à la saison | trouve ⚙ sous header |
| T10 | Partager le lien du spectacle | réaction au slug lisible |

**Capture:** screen recording optional; note verbatim quotes; mark pass/fail per row.

**Prototype fidelity for T4–T6:** Wizard-of-Oz acceptable — paper form or clickable Figma, no API.

### User Feedback

_Status: **planned** — execute sessions and fill grid below._

#### Feedback capture grid (template)

| | Session 1 | Session 2 | … |
|---|-----------|-----------|---|
| **Likes** | | |
| **Questions** | | |
| **Ideas** | | |
| **Changes** | | |

#### Assumptions tracker (pre-test)

| Assumption | Risk if false |
|------------|---------------|
| Logo-only mobile breadcrumb is enough | Users lost without saison name in chrome |
| ⚙ below fold is discoverable | Admins revert to hidden menus / support ping |
| Tag optional + invisible principal is understood | Users demand explicit « principal » radio |
| Cards on `/troupes` beat list | Scanning harder on small screens |
| Event slugs worth migration cost | Low sharing value; UUID OK |

### Key Learnings

_Pre-test synthesis from design session (Patrice); to validate or invalidate in user tests._

1. **`/seasons` conflates roles** — validated by stakeholder; expect T0 to show same confusion in admins.
2. **Saison stays first-class; ligue label abandoned** — no tester should need « ligue » if copy is consistent.
3. **Equity = optional tag, not programme** — highest risk area (T4–T6); watch confusion with `templateType`.
4. **Navigation chrome separate from admin** — ⚙ placement is a deliberate bet (T9).
5. **Découvrir section** — defer membership rules; test only comprehension of two blocks (Mes / Découvrir).

**Invalidation triggers → loop back:**

- If T8 fails → show saison abbreviation on mobile (e.g. subtitle under page title).
- If T9 fails → add ⚙ to overflow menu **and** strip.
- If T4 fails → rename field + stronger inline example (« ex: déplacements »).

---

## 🚀 Next Steps

### Refinements Needed

1. ~~Update ux-design-journey-league-agenda.md~~ — **Done 2026-05-25** (UX-DR19–21, Screens 2b/6b).
2. **ADR 0013** — [accepted](../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md).
3. Align `league-routes.ts` → `season-routes.ts` vocabulary in code (paths stay `/saison`).
4. Define OPEN: non-member actions on Découvrir cards (post-MVP).

### Action Items

| Priority | Story / task | Phase | Depends |
|----------|--------------|-------|---------|
| — | Usability sessions (skipped — no participants) | — | — |
| P0 | **17.1** Breadcrumb + mobile logo-only + remove header ⚙ | Nav | — |
| P0 | **17.2** `app-scope-admin-bar` on troupe/saison/event | Nav | 17.1 |
| P0 | **17.3** `/troupes` page (cards Mes + Découvrir stub) | Nav | API troupe list + event counts |
| P0 | **17.4** `/troupes/:slug` hub (logo, saisons, préférences drawer) | Nav | 17.3 |
| P0 | **17.5** Redirects `/seasons`, `/ligue`; fix event troupe link | Nav | 17.4 |
| P1 | **17.6** `events.slug` migration + routes + redirects | Nav | API |
| P1 | **17.7** `equity_tag` + troupe tag glossary API | Domain | ADR 0013 |
| P1 | **17.8** Event form tag autocomplete + help | Domain | 17.7 |
| P2 | **17.9** Draw/chances partition by tag | Domain | 17.7 |
| P2 | **17.10** Stats columns driven by tags not travel league | Domain | 17.9 |
| P2 | Découvrir non-member flows | Discovery | Epic 4 |

_Tracked as **Epic 17** in PLAN.md (Epic 15 = Rencontres liées). ADR [0013](../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)._

### Success Metrics

| Metric | Target | How to measure |
|--------|--------|----------------|
| Admin trouve Membres | ≤2 taps depuis hub troupe | T1 pass rate ≥4/5 |
| Plus de landings `/seasons` comme hub | −90% pageviews `/seasons` (admins) | Analytics 30j post-ship |
| Contexte troupe sur écran saison | T2 pass ≥4/5 | Usability |
| Tag compris sans formation | T4–T5 pass ≥4/5 | Usability |
| Liens partagés lisibles | T10 positive ≥4/5 | Usability |
| Zero régression post-login membre | 100% arrive `/agenda` or deep link | E2E smoke |
| Support tickets « où est ma troupe » | ↓ vs baseline | Qualitative 60j |

**Definition of done (navigation phase):** `/seasons` redirects; hub troupe live; breadcrumb on troupe/saison/event; event→troupe link correct; no ⚙ in global header.

**Definition of done (domain phase):** tag on event persists; draw uses tag partition; Malice déplacements migrated from `templateType=deplacement` to tag.

---

## Appendix — Context gathered (Step 1)

### Primary users / stakeholders

| Persona | Job to be done | Primary surfaces |
|---------|----------------|------------------|
| **Léa** (member) | See what's next; set availability; confirm cast | `/agenda`, event detail |
| **Amira** (troupe admin) | Manage troupe, leagues, members; create events | Hub troupe (target), league workspace, admin routes |
| **Organisateur ligue** | Manage league events, participants, draws | `/ligue/:slug`, admin participants/membres |

### Constraints (from product + codebase)

- **Approved UX:** [ux-design-journey-league-agenda.md](../planning-artifacts/ux-design-journey-league-agenda.md) (UX-DR13–18)
- **Transition:** `/saison/:slug` aliases `/ligue/:slug`; `/seasons` to be demoted (Epic 14)
- **Stack:** Angular routes in `apps/web/src/app/app.routes.ts`; helpers in `league-routes.ts` (`ligue` canonical)
- **Post-login:** `/agenda` or last league if slug resolves (`PostLoginNavigationService`)
- **Not yet built:** `/troupe/:slug` hub (Epic 14.1), `/troupes` annuaire, `/ligue/:slug/historique` as distinct route

### Current route inventory (runtime)

| Route | Component | Notes |
|-------|-----------|-------|
| `/agenda` | UserAgenda | Member primary hub (shipped) |
| `/seasons` | SeasonsList | Legacy list; link "Mes troupes" from agenda |
| `/ligue/:slug` | SeasonHome | League workspace (agenda/history tabs in-page) |
| `/saison/:slug` | SeasonHome | Alias (same component) |
| `/ligue/:slug/event/:id` | EventDetail | Canonical event URL |
| `/troupe/:troupeSlug/admin/membres` | AdminMembres | Troupe-scoped admin |
| `/ligue/:slug/admin/*` | Admin | League-scoped admin |

### Known friction themes (validated 2026-05-25 with Patrice)

1. **`/seasons` is the wrong hub** — mixes troupe admin + programme list; should become `/troupes` + `/troupes/:slug`
2. **Vocabulary** — `saison` / `ligue` rejected; need **Programme** (working) + optional **période d'équité** + **compartiments stats**
3. **Missing troupe context in chrome** — league header has no troupe logo/breadcrumb
4. **Wrong deep links** — event troupe link → admin membres, not troupe hub; league back → `/seasons`
5. **Stat flexibility** — déplacements/Aperock-style splits may need config, not only new DB rows

### Success criteria (draft)

- Member: sign-in → actionable list without visiting `/seasons`
- Orga: from any event, reach troupe admin or league admin in ≤2 taps
- URLs shareable; notifications deep-link to `/ligue/:slug/event/:id`
- Legacy bookmarks redirect without 404

---

_Generated using BMAD Creative Intelligence Suite - Design Thinking Workflow_
