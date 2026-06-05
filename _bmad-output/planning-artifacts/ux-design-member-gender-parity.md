# UX — Member gender & team parity (Epic 2.12 / 6.21 / 16.3)

**Status:** **Approved — Screen 1 frozen** (2026-06-05, Patrice sign-off) · Screens 2–3 unchanged pending stories **6.21** / **16.3**  
**Spines:** [DESIGN.md](ux-designs/ux-member-gender-parity-2026-06-05/DESIGN.md) · [EXPERIENCE.md](ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md)  
**Normative:** [spec-member-gender-parity](../specs/spec-member-gender-parity/SPEC.md)

---

## Goal

Restore **optional gender** on Mon profil (V1 parity) and surface **gender-aware labels**, **avatars**, and **non-blocking parity awareness** for organizers.

---

## Screen 1 — Mon profil (`account-profile-tab`) — **FROZEN**

> **As-built** after UX iteration (2026-06-05). Supersedes earlier radio + immediate-PATCH wireframes in this file and in story **2.12** Dev Notes where they diverge.

### Placement

Single **profile block** after avatar/e-mail row, before **Modes de connexion** (amend [ux-design-mon-compte.md](ux-design-mon-compte.md) C1 — no new tab).

Contents in order: **Pseudo** field → **Gender** segmented control → **one Enregistrer** button.

### Copy (FR — V1 `PlayerModal` parity)

| Element | Copy |
|---------|------|
| Pseudo label | **Pseudo** |
| Pseudo hint | *(none — removed 2026-06-05)* |
| Gender question | **Quel genre utiliser pour me désigner ?** |
| Toggle — left | **Féminin** · `aria-label`: *Féminin (ex: une improvisatrice)* |
| Toggle — centre | **Non spéc.** · `aria-label`: *Non spécifié (ex: un.e improvisateur.trice)* |
| Toggle — right | **Masculin** · `aria-label`: *Masculin (ex: un improvisateur)* |
| Gender hint | *(none — removed 2026-06-05)* |
| Save | **Enregistrer** (shared) |
| Success snack | *Profil enregistré* |
| Error snack | *Enregistrement impossible* |

**Do not show** legacy labels « Genre », « Homme », « Femme », « Non précisé » on this screen.

### Control

| Element | Spec |
|---------|------|
| Component | `mat-button-toggle-group` — **3 exclusive states** (same pattern as Moi/Tous) |
| Order (L → R) | **Féminin** · **Non spéc.** · **Masculin** |
| Default | **Non spéc.** selected when API null / absent / `non_specified` |
| Binding | `ngModel` on group (reliable pre-selection after async load) |
| Indicator | `hideSingleSelectionIndicator` |
| Save model | **One** `mat-flat-button` for **pseudo + gender** ; PATCH only dirty fields |
| Save `data-testid` | `account-profile-save` |
| Gender `data-testid` | `account-gender-group`, `account-gender-female`, `account-gender-non-specified`, `account-gender-male` |
| Loading | Spinner replaces profile block until `GET /v1/me/preferences` completes |

### Selected-state & avatar tones (M3 — not blue/pink)

Shared tokens `--hatcast-member-gender-*` (see DESIGN.md):

| Value | Toggle selected | Avatar letter fallback (no photo) |
|-------|-----------------|-----------------------------------|
| `non_specified` | Grey (neutral participation surface) | Same grey |
| `female` | Orange (`tertiary-container`) | Same orange |
| `male` | Purple (`primary-container`) | Same purple |

Avatar remains **first letter** of display name — no emoji fallback on Mon profil / account menu (story **2.12c** scope may extend elsewhere).

Live preview: avatar on Mon profil and rail/menu account trigger reflect **unsaved** gender selection (letter + tone).

### Wireframe (as-built)

```
[ avatar | email + edit ]
[ displayName if distinct ]

Pseudo [____________]

Quel genre utiliser pour me désigner ?
[ Féminin | Non spéc. | Masculin ]   ← centre selected by default

[ Enregistrer ]

── Modes de connexion ──
```

### Accessibility

- Question text → `id="account-gender-label"` ; group `aria-labelledby`.
- Each toggle has full `aria-label` (V1 examples).
- Toggle segments ≥ **44×48 dp** on mobile (`min-height: 2.75rem`, wrap allowed).
- FRONTEND_UI checklist mandatory.

---

## Screen 2 — Équipe (`event-equipe-tab`)

**Slot row layout (grid, role pill, whole-row tap):** [_ux-design-composition-equipe-slot-rows.md_](ux-design-composition-equipe-slot-rows.md). Role labels in pills use `auditRoleDisplay`; assignee-specific copy uses `getRoleLabel(role, participantGender)` (story **2.12b**).

### Parity strip (story **6.21**)

### Audience

Organizers with composition edit rights — same class as consecutive-show warnings.

### Placement

**Above** the slot grid, below draw animation.

### Visual (M3)

| Element | Token |
|---------|--------|
| Background | `color-mix(in srgb, var(--mat-sys-primary) 10%, transparent)` |
| Icon | `groups`, 18px, `aria-hidden` |
| Text | `body-small` |
| Tone | **Info** — not warning (contrast with **6.20**) |

### Copy (FR)

| Condition | Template |
|-----------|----------|
| f+m > 0 | *Joueurs : {f} F · {m} H ({pct} % femmes)* |
| f+m > 0, u > 0 | append *· {u} non renseigné(s)* |
| slots filled, f+m = 0 | *Parité : genre non renseigné pour les comédiens·nes assigné·e·s* |
| no player slots filled | hidden |

---

## Screen 3 — Statistiques ligue (story 16.3)

Outlined `mat-card` in season stats summary:

- **Title:** Parité sur scène (Comédien·ne)
- **Body:** *{f} femmes · {m} hommes sur {total} sélections connues ({pct} % femmes)*

Hidden when no validated `player` selections with known gender.

---

## Cross-surface — labels & avatars

- **2.12b:** `getRoleLabel(role, gender)` on dispos, équipe, confirmations — see [member-gender.md](../specs/spec-member-gender-parity/member-gender.md).
- **2.12c:** Letter + tone fallback in `app-user-avatar` when no photo (Screen 1 tones above); emoji mapping deprecated for V2 Mon profil.

---

## Out of scope

- Gender on signup
- Admin editing others’ gender
- Parity in Dispos tab
- Draw factor UI (**19.21** / **19.11**)

---

## Story mapping

| Story | UX deliverable |
|-------|----------------|
| **2.12** | Screen 1 (**frozen**) |
| **2.12b** | Cross-surface labels |
| **2.12c** | Avatar fallback (letter + tone) |
| **6.21** | Screen 2 |
| **16.3** | Screen 3 |
