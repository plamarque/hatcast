# UX — Member gender & team parity (Epic 2.12 / 6.21 / 16.3)

**Status:** Spec for stories **2.12**, **2.12b**, **2.12c**, **6.21**, **16.3** — SCP [G-011](sprint-change-proposal-2026-06-05-member-gender-parity.md)  
**Spines:** [DESIGN.md](ux-designs/ux-member-gender-parity-2026-06-05/DESIGN.md) · [EXPERIENCE.md](ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md)  
**Normative:** [spec-member-gender-parity](../specs/spec-member-gender-parity/SPEC.md)

---

## Goal

Restore **optional gender** on Mon profil (V1 parity) and surface **gender-aware labels**, **avatars**, and **non-blocking parity awareness** for organizers.

---

## Screen 1 — Mon profil (`account-profile-tab`)

### Placement

After **Pseudo** block, before **Modes de connexion** (amend [ux-design-mon-compte.md](ux-design-mon-compte.md) C1 — no new tab).

### Control

| Element | Spec |
|---------|------|
| Component | `mat-radio-group` vertical |
| Legend | **Genre** |
| Options | **Homme** · **Femme** · **Non précisé** (default) |
| Hint | *Personnalise les libellés de rôles (ex. Comédienne) et l’avatar par défaut. Vous pouvez laisser Non précisé.* |
| Save | Immediate on change (`PATCH`) |
| testids | `account-gender-group`, `account-gender-male`, `account-gender-female`, `account-gender-non-specified` |

### Wireframe

```
Pseudo [____________] [Enregistrer]

Genre
( ) Homme
( ) Femme
(•) Non précisé
Personnalise les libellés…

── Modes de connexion ──
```

---

## Screen 2 — Équipe parity strip (`event-equipe-tab`)

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
- **2.12c:** 👨 / 👩 / 👤 fallback in `app-user-avatar` when no photo.

---

## Accessibility

- Fieldset + legend; radio rows ≥ 48dp.
- Parity strip `role="status"`; full counts in text.
- FRONTEND_UI checklist mandatory per story.

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
| **2.12** | Screen 1 |
| **2.12b** | Cross-surface labels |
| **2.12c** | Avatar fallback |
| **6.21** | Screen 2 |
| **16.3** | Screen 3 |

**Next:** `bmad-create-story` for **2.12** (fresh context).
