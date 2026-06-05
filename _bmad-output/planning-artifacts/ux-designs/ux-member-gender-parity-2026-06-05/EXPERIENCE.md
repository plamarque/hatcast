---
name: HatCast V2 — Member gender & team parity
status: final
sources:
  - _bmad-output/specs/spec-member-gender-parity/SPEC.md
  - _bmad-output/specs/spec-member-gender-parity/member-gender.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
updated: 2026-06-06
screen1_status: frozen
---

# HatCast V2 — Member gender & team parity — Experience Spine

> V1 parity: optional account gender, adapted role labels, avatar fallback, organizer parity awareness. Visual specs: `DESIGN.md` in this folder. Stories **2.12**, **2.12b**, **2.12c**, **6.21**, **16.3**.

## Foundation

- **Form factor:** mobile-first PWA (`apps/web/`).
- **UI system:** Angular Material 3 — checklist [FRONTEND_UI.md](../../../../docs/v2/technical/FRONTEND_UI.md).
- **Surfaces:** Mon compte → **Mon profil** ; Event detail → **Équipe** ; Statistiques ligue (16.3).
- **Out of scope:** draw weighting (**19.11**), admin member list gender column, mandatory gender.

## Information Architecture

| Surface | Route / component | Purpose |
|---------|-------------------|---------|
| Mon profil | `/compte` → `account-profile-tab` | Set optional gender (segmented control + shared save) |
| Dispos / Équipe / confirmations | various | Show gender-aware labels (**2.12b**) |
| Avatars | `app-user-avatar` | Letter + tone fallback by gender (**2.12** / **2.12c**) |
| Équipe guidances (mixité) | `event-equipe-tab` → `composition-guidances` | Team-level organizer hints; mixité pill (**6.21**) |
| Statistiques ligue | season stats view | Season aggregate parity (**16.3**) |

Closure: self-service gender on Mon profil; derived presentation everywhere else; organizer sees aggregate on Équipe without per-person gender badge.

## Voice and Tone

Respectful, optional, never prescriptive about balance. **V2 posture:** HatCast **guides** organizers as guardrails; they may **ignore** low-priority hints like parity.

| Context | Copy |
|---------|------|
| Gender question | **Quel genre utiliser pour me désigner ?** |
| Toggle — Féminin | **Féminin** · `aria-label`: *Féminin (ex: une improvisatrice)* |
| Toggle — Non spéc. | **Non spéc.** · `aria-label`: *Non spécifié (ex: un.e improvisateur.trice)* |
| Toggle — Masculin | **Masculin** · `aria-label`: *Masculin (ex: un improvisateur)* |
| Save (shared) | **Enregistrer** |
| Snackbar success | *Profil enregistré* |
| Snackbar error | *Enregistrement impossible* |
| Parity — bon | *Mixité équilibrée* |
| Parity — acceptable | *Mixité acceptable* |
| Parity — faible | *Mixité faible* |
| Parity — hidden (unknown gender in compo) | *(hidden)* |
| Parity — tooltip detail (optional) | *{f} F · {m} H* (only when `u = 0`) |
| Parity — hidden | No player slots filled |
| Season card title (16.3) | **Mixité sur scène (Comédien·ne)** |
| Season card body | *{f} femmes · {m} hommes sur {total} sélections connues ({pct} % femmes)* |
| `aria-label` gender group | Question text via `aria-labelledby="account-gender-label"` |

**Removed copy (2026-06-05):** pseudo hint *Nom affiché dans toutes vos troupes.* ; gender hint *Personnalise les libellés…* — deemed redundant on Mon profil.

`{pct}` = rounded integer 0–100. `{f}`, `{m}` use **F** / **H** abbreviations in strip (space-efficient).

## Component Patterns

### Gender field (story 2.12) — **FROZEN 2026-06-05**

| Rule | Behavior |
|------|----------|
| Placement | Inside `.account-page__profile-block`: pseudo field → gender toggle → **one** Enregistrer |
| Control | `mat-button-toggle-group`, 3 segments, horizontal (wrap on narrow) |
| Order | **Féminin** (left) · **Non spéc.** (centre) · **Masculin** (right) |
| Default | **Non spéc.** pre-selected when API null / absent / `non_specified` |
| Binding | `ngModel` on group (not `[value]` alone — async mount) |
| Save | **Shared** with pseudo: user taps **Enregistrer** ; PATCH sends only dirty fields |
| Dirty state | Button enabled when pseudo or gender differs from last saved values |
| Loading | Spinner replaces profile block until preferences load |
| Saving | Spinner inside Enregistrer button ; block duplicate submit |
| Hints | **None** under pseudo or gender |
| Live preview | Avatar letter + tone on Mon profil reflects current toggle (even before save) |
| Visibility | Signed-in user on own Mon profil only |
| Privacy | Other members **do not** see this control or raw value on `/membre` |

### Avatar fallback (story 2.12 / 2.12c)

When no `avatarUrl` and no Google photo:

| Gender | Letter | Tone |
|--------|--------|------|
| `non_specified` | First letter of display name | Grey (neutral) |
| `female` | First letter | Orange (tertiary container) |
| `male` | First letter | Purple (primary container) |

Selected toggle segment uses the **same** tone tokens. Custom/Google photo unchanged.

V1 used gender emoji (`playerAvatars.js`) — **V2 normative behaviour is letter + tone only** (all surfaces, not only Mon profil).

### Gender-aware labels (story 2.12b)

| Surface | Behavior |
|---------|----------|
| Équipe slot row | Role label in hints uses **participant** gender |
| Empty slot placeholder | Event role label only (no participant) — inclusive or event-default |
| Dispos cells | Participant name row + role chips use participant gender |
| Confirmation dialogs | Assigned role label uses participant gender |

Fallback: `non_specified` → inclusive tables (`Comédien·ne`, …).

### Composition guidances — team level (story 6.21+)

| Rule | Behavior |
|------|----------|
| Audience | `canManageComposition` only |
| Position | **`composition-guidances`** strip above slot grid (see `DESIGN.md`) — not lifecycle status badge; not per-slot row |
| Extensibility | Same strip hosts future team-level hints (e.g. originality vs previous show) |
| vs slot warnings | **6.20** / multi-role stay **under each slot row** — different level |

### Composition parity indicator (story 6.21)

| Rule | Behavior |
|------|----------|
| Audience | `canManageComposition` only |
| Position | One **pill** inside `composition-guidances` — not standalone orphan line |
| Data | Client-side from filled `player` slots + `participantGender` |
| Score | Only when **all** filled `player` slots have known gender (`u = 0`) and `n = f + m ≥ 2`. **écart** `= |f − m|`: **bon** if `écart = 0`; **acceptable** if `écart = 1`; **faible** if `écart ≥ 2`. If `u > 0` → **hidden** (cannot pronounce on mixité) |
| Colors | **Bon** green · **Acceptable** grey · **Faible** orange — semantic tokens in DESIGN.md |
| Main line | Qualitative label only — **no** F/H counts |
| Detail | Optional tooltip/tap with `{f} F · {m} H` when indicator visible |
| Updates | Same refresh as slot assign/clear/draw |
| Blocking | **Never** — indicator only; orgas may ignore |
| Event flag | **None** in 6.21 — no « spectacle cherche la parité » |
| Cross-team | **Out of scope** — bi-team match/catch parity deferred (Epic 15 rencontre) |

**Distinct from 6.20:** consecutive warning is per-slot, warning amber; parity is a **team-level** pill in guidances strip with score colors (green / grey / orange).

### Season parity card (story 16.3)

- Placement: Statistiques ligue — summary cards row or dedicated subsection (PO OQ-2).
- Read-only aggregate; no drill-down to individuals.
- Hidden when season has zero validated `player` selections with known gender.

## State Patterns

| State | Gender field | Parity indicator |
|-------|--------------|------------------|
| Loading | Spinner replaces profile block | Hidden until composition loaded |
| Default | **Non spéc.** segment selected (centre) | — |
| Dirty | Enregistrer enabled when pseudo or gender changed | — |
| Saving | Spinner in Enregistrer button | — |
| Error | Revert pseudo + gender to last saved; snackbar error | — |
| Empty player slots | — | Hidden |
| Any assigned player with unknown gender (`u > 0`) | — | Hidden |
| All known, `n < 2` | — | Hidden |
| All known, `n ≥ 2` | — | Score line bon / acceptable / faible (colored) |

## Interaction Primitives

1. **Edit profile** — adjust pseudo and/or gender → tap **Enregistrer** → PATCH → *Profil enregistré*.
2. **Compose team** — assign players → indicator recalculates (often *acceptable* on odd counts).
3. **View season stats** — open Statistiques → see aggregate card (16.3).

## Accessibility Floor

- Gender question visible (`#account-gender-label`); toggle group `aria-labelledby`.
- Toggle segments ≥ 48dp touch height; wrap allowed on narrow screens.
- Parity indicator: `role="status"`; icon decorative; qualitative label in text node; score color is supplementary to copy.
- Contrast ≥ 4.5:1 on strip text (NFR-A1).
- Gender tone difference is supplementary — segment label always in text.

## Key Flows

### Flow A — Alex déclare son genre (Mon profil)

1. Alex opens **Mon compte** → onglet **Mon profil**.
2. Scrolls past avatar, e-mail ; **Non spéc.** is already selected on the toggle.
3. Taps **Féminin** — avatar letter turns orange (preview).
4. Taps **Enregistrer** → snackbar *Profil enregistré*.
5. **Climax:** On prochain spectacle, sa ligne dispo affiche **Comédienne** (**2.12b**).

### Flow B — Sam garde Non spécifié

1. Sam never touches the toggle; **Non spéc.** stays selected (centre, grey tone).
2. All labels remain inclusive; avatar letter stays grey.
3. **Climax:** Aucune friction — aucun prompt pour « compléter le profil ».

### Flow C — Organisateur Marie compose un match

1. Marie opens spectacle → **Équipe**, composition brouillon.
2. After assigning five players (2 F · 3 H), line shows *Mixité acceptable* in **grey**.
3. She swaps to 1 F · 4 H → line updates to *Mixité faible* in **orange** — she may ignore and validate anyway.
4. **Climax:** Signal visible, zero friction, no blocking.

## Responsive & Platform

- Gender toggle: horizontal segments, wrap on ≤ 480px.
- Guidances strip: pills wrap on ≤ 480px.
- Season card: stacks with other stat cards on mobile.

## Inspiration & Anti-patterns

**From V1 (`PlayerModal`):** question copy and inclusive `aria-label` examples — **without** the long explanatory hint (removed as clutter).

**Anti-patterns**

- Separate Enregistrer buttons for pseudo and gender.
- Immediate PATCH on every toggle tap (surprising vs pseudo).
- Vertical radio list or dropdown for gender.
- Forcing gender at signup.
- Red/green « good/bad » blocking gauge.
- Full-width bandeau consuming vertical space.
- Exact F/H counts in main line (use tooltip instead).
- Parity indicator in Dispos tab (out of scope 6.21).
- Cross-team parity enforcement on match/catch (future).

## API expectations (UI)

```typescript
// Profile
gender?: 'male' | 'female' | 'non_specified'

// Composition participant (for labels + parity)
participantGender?: 'male' | 'female' | 'non_specified'

// Optional tooltip detail (6.21)
interface CompositionPlayerGenderParity {
  female: number
  male: number
  unspecified: number
  score: 'bon' | 'acceptable' | 'faible' | null  // null → hidden (u > 0, n < 2, or no players)
  label: string
  detailLabel: string | null
}
```

## Open questions (UX)

| ID | Question | UX assumption |
|----|----------|-------------|
| OQ-UX-1 | Match-only indicator? | **Resolved:** all events with filled `player` slots when orga |
| OQ-UX-3 | Mixité rencontre bi-équipes | **Deferred** — Epic 15 / future ; 6.21 = single composition only |
| OQ-UX-2 | Snackbar on profile save? | **Resolved:** shared *Profil enregistré* ; error always snackbar |
