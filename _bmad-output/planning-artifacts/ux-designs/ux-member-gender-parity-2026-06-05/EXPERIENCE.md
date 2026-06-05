---
name: HatCast V2 — Member gender & team parity
status: final
sources:
  - _bmad-output/specs/spec-member-gender-parity/SPEC.md
  - _bmad-output/specs/spec-member-gender-parity/member-gender.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
updated: 2026-06-05
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
| Mon profil | `/compte` → `account-profile-tab` | Set optional gender |
| Dispos / Équipe / confirmations | various | Show gender-aware labels (**2.12b**) |
| Avatars | `app-user-avatar` | Emoji fallback by gender (**2.12c**) |
| Équipe parity strip | `event-equipe-tab` | Organizer F/M summary on `player` slots (**6.21**) |
| Statistiques ligue | season stats view | Season aggregate parity (**16.3**) |

Closure: self-service gender on Mon profil; derived presentation everywhere else; organizer sees aggregate on Équipe without per-person gender badge.

## Voice and Tone

Respectful, optional, never prescriptive about balance.

| Context | Copy |
|---------|------|
| Fieldset legend | **Genre** |
| Radio — Homme | **Homme** |
| Radio — Femme | **Femme** |
| Radio — Non précisé | **Non précisé** |
| Hint under gender | *Personnalise les libellés de rôles (ex. Comédienne) et l’avatar par défaut. Vous pouvez laisser Non précisé.* |
| Snackbar success (optional) | *Genre enregistré* |
| Snackbar error | *Impossible d’enregistrer le genre. Réessayez.* |
| Parity strip — counts | *Joueurs : {f} F · {m} H* |
| Parity strip — with ratio | *Joueurs : {f} F · {m} H ({pct} % femmes)* |
| Parity strip — no known gender | *Parité : genre non renseigné pour les comédiens·nes assigné·e·s* |
| Parity strip — no player slots filled | *(hidden)* |
| Season card title (16.3) | **Parité sur scène (Comédien·ne)** |
| Season card body | *{f} femmes · {m} hommes sur {total} sélections connues ({pct} % femmes)* |
| `aria-label` gender group | *Genre pour les libellés et l’avatar* |

`{pct}` = rounded integer 0–100. `{f}`, `{m}` use **F** / **H** abbreviations in strip (space-efficient).

## Component Patterns

### Gender field (story 2.12)

| Rule | Behavior |
|------|----------|
| Placement | After pseudo block, before « Modes de connexion » |
| Control | `mat-radio-group`, vertical, 3 options |
| Default | **Non précisé** when API null / `non_specified` |
| Save | **Immediate** on `change` → `PATCH` profile; disable radios while saving |
| Loading | Show group disabled + spinner on first load from API |
| Visibility | Signed-in user on own Mon profil only |
| Privacy | Other members **do not** see this control or raw value on `/membre` |

### Gender-aware labels (story 2.12b)

| Surface | Behavior |
|---------|----------|
| Équipe slot row | Role label in hints uses **participant** gender |
| Empty slot placeholder | Event role label only (no participant) — inclusive or event-default |
| Dispos cells | Participant name row + role chips use participant gender |
| Confirmation dialogs | Assigned role label uses participant gender |

Fallback: `non_specified` → inclusive tables (`Comédien·ne`, …).

### Avatar fallback (story 2.12c)

When no `avatarUrl` and no Google photo: 👨 / 👩 / 👤 per `DESIGN.md` companion spec. Custom/Google photo unchanged.

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
| Loading | Spinner, radios disabled | Hidden until composition loaded |
| Default | Non précisé selected | — |
| Saving | Radios disabled, inline spinner | — |
| Error | Revert selection or keep UI; snackbar error | — |
| Empty player slots | — | Hidden |
| f+m=0, slots filled | — | « genre non renseigné… » copy |
| f+m>0 | — | Counts + optional % |

## Interaction Primitives

1. **Select gender** — tap radio → PATCH → optional snackbar.
2. **Compose team** — assign players → strip recalculates live.
3. **View season stats** — open Statistiques → see aggregate card (16.3).

## Accessibility Floor

- Fieldset `legend` visible; radio group labelled.
- Radio rows ≥ 48dp touch height.
- Parity strip: `role="status"`; icon decorative; full sentence in text node.
- Contrast ≥ 4.5:1 on strip text (NFR-A1).
- No information conveyed by color alone for parity (counts always in text).

## Key Flows

### Flow A — Alex déclare son genre (Mon profil)

1. Alex opens **Mon compte** → onglet **Mon profil** (déjà connecté).
2. Scrolls past avatar, e-mail, pseudo.
3. Reads hint under **Genre**; selects **Femme**.
4. Brief spinner; optional snackbar *Genre enregistré*.
5. **Climax:** On prochain spectacle, sa ligne dispo affiche **Comédienne** au lieu de **Comédien·ne**.

### Flow B — Sam garde Non précisé

1. Sam never touches Genre; default stays **Non précisé**.
2. All labels remain inclusive; avatar fallback 👤.
3. **Climax:** Aucune friction — aucun prompt pour « compléter le profil ».

### Flow C — Organisateur Marie compose un match

1. Marie opens spectacle → **Équipe**, composition brouillon.
2. Strip shows *Joueurs : 1 F · 3 H (25 % femmes)* after assignments.
3. Marie assigns another woman → strip updates to *2 F · 3 H (40 % femmes)*.
4. **Climax:** Marie voit l’équilibre sans blocage; elle valide quand elle veut.

## Responsive & Platform

- Gender radios: full-width stack on ≤ 480px.
- Parity strip: single line desktop; wrap allowed mobile; abbreviations F/H conserve space.
- Season card: stacks with other stat cards on mobile.

## Inspiration & Anti-patterns

**From V1 (`PlayerModal`):** explanatory hint for why gender matters — adapted to shorter M3 hint.

**Anti-patterns**

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
| OQ-UX-2 | Snackbar on gender save? | Optional subtle success; error always snackbar |
