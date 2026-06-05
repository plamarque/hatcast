---
name: HatCast V2 — Member gender & team parity
status: final
sources:
  - _bmad-output/specs/spec-member-gender-parity/SPEC.md
  - _bmad-output/specs/spec-member-gender-parity/member-gender.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
updated: 2026-06-05
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
| Équipe parity strip | `event-equipe-tab` | Organizer F/M summary on `player` slots (**6.21**) |
| Statistiques ligue | season stats view | Season aggregate parity (**16.3**) |

Closure: self-service gender on Mon profil; derived presentation everywhere else; organizer sees aggregate on Équipe without per-person gender badge.

## Voice and Tone

Respectful, optional, never prescriptive about balance.

| Context | Copy |
|---------|------|
| Gender question | **Quel genre utiliser pour me désigner ?** |
| Toggle — Féminin | **Féminin** · `aria-label`: *Féminin (ex: une improvisatrice)* |
| Toggle — Non spéc. | **Non spéc.** · `aria-label`: *Non spécifié (ex: un.e improvisateur.trice)* |
| Toggle — Masculin | **Masculin** · `aria-label`: *Masculin (ex: un improvisateur)* |
| Save (shared) | **Enregistrer** |
| Snackbar success | *Profil enregistré* |
| Snackbar error | *Enregistrement impossible* |
| Parity strip — counts | *Joueurs : {f} F · {m} H* |
| Parity strip — with ratio | *Joueurs : {f} F · {m} H ({pct} % femmes)* |
| Parity strip — no known gender | *Parité : genre non renseigné pour les comédiens·nes assigné·e·s* |
| Parity strip — no player slots filled | *(hidden)* |
| Season card title (16.3) | **Parité sur scène (Comédien·ne)** |
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

### Composition parity strip (story 6.21)

| Rule | Behavior |
|------|----------|
| Audience | Users with `canManageComposition` / edit slots on Équipe (organizers) |
| Position | Above slot grid (see `DESIGN.md`) |
| Data | Client-side from slots + participant `gender` on composition DTO, or server field `compositionGenderParity` |
| Role filter | Count only `roleKey === 'player'` filled slots |
| Ratio | Show `% femmes` only when `f + m > 0` |
| `u > 0` | Append « · {u} non renseigné(s) » when at least one assigned player has `non_specified` |
| Updates | Same refresh as slot assign/clear/draw |
| Tone | Informational — **no** modal, **no** disable validate/draw |

**Distinct from 6.20:** consecutive warning is per-slot, warning color, role-specific; parity strip is global summary, primary tint.

### Season parity card (story 16.3)

- Placement: Statistiques ligue — summary cards row or dedicated subsection (PO OQ-2).
- Read-only aggregate; no drill-down to individuals.
- Hidden when season has zero validated `player` selections with known gender.

## State Patterns

| State | Gender field | Parity strip |
|-------|--------------|--------------|
| Loading | Spinner replaces profile block | Hidden until composition loaded |
| Default | **Non spéc.** segment selected (centre) | — |
| Dirty | Enregistrer enabled when pseudo or gender changed | — |
| Saving | Spinner in Enregistrer button | — |
| Error | Revert pseudo + gender to last saved; snackbar error | — |
| Empty player slots | — | Hidden |
| f+m=0, slots filled | — | « genre non renseigné… » copy |
| f+m>0 | — | Counts + optional % |

## Interaction Primitives

1. **Edit profile** — adjust pseudo and/or gender → tap **Enregistrer** → PATCH → *Profil enregistré*.
2. **Compose team** — assign players → strip recalculates live.
3. **View season stats** — open Statistiques → see aggregate card (16.3).

## Accessibility Floor

- Gender question visible (`#account-gender-label`); toggle group `aria-labelledby`.
- Toggle segments ≥ 48dp touch height; wrap allowed on narrow screens.
- Parity strip: `role="status"`; icon decorative; full sentence in text node.
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
2. Strip shows *Joueurs : 1 F · 3 H (25 % femmes)* after assignments.
3. Marie assigns another woman → strip updates to *2 F · 3 H (40 % femmes)*.
4. **Climax:** Marie voit l’équilibre sans blocage; elle valide quand elle veut.

## Responsive & Platform

- Gender toggle: horizontal segments, wrap on ≤ 480px.
- Parity strip: single line desktop; wrap allowed mobile; abbreviations F/H conserve space.
- Season card: stacks with other stat cards on mobile.

## Inspiration & Anti-patterns

**From V1 (`PlayerModal`):** question copy and inclusive `aria-label` examples — **without** the long explanatory hint (removed as clutter).

**Anti-patterns**

- Separate Enregistrer buttons for pseudo and gender.
- Immediate PATCH on every toggle tap (surprising vs pseudo).
- Vertical radio list or dropdown for gender.
- Forcing gender at signup.
- Red/green « good/bad » parity gauge.
- Showing « Homme/Femme » badge on other members’ avatars.
- Parity strip in Dispos tab (out of scope 6.21).

## API expectations (UI)

```typescript
// Profile
gender?: 'male' | 'female' | 'non_specified'

// Composition participant (for labels + parity)
participantGender?: 'male' | 'female' | 'non_specified'

// Optional server-computed (6.21)
interface CompositionGenderParity {
  female: number
  male: number
  unspecified: number
  femaleShare: number | null // 0–1 when female+male > 0
}
```

## Open questions (UX)

| ID | Question | UX assumption |
|----|----------|-------------|
| OQ-UX-1 | Match-only strip? | All events — strip when `player` slots exist |
| OQ-UX-2 | Snackbar on profile save? | **Resolved:** shared *Profil enregistré* ; error always snackbar |
