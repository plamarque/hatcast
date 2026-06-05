# UX — Member gender & team parity (Epic 2.12 / 6.21 / 16.3)

**Status:** **Approved — Screen 1 frozen** (2026-06-05) · **Screen 2 approved** (2026-06-05, Patrice) · **Screen 2 placement amended** (2026-06-06, guidances strip) · Screen 3 pending **16.3**  
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

Avatar remains **first letter** of display name on a **gender tone** — no V1 emoji fallback (all surfaces including Mon profil / account menu).

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

### Parity indicator (story **6.21**) — **approved 2026-06-05**

### Posture produit

- **Indicateur** pour orgas — garde-fou, **ignorable** ; HatCast V2 **guide** sans chercher la solution optimale.
- **Non bloquant** : jamais de désactivation Valider / Tirer / Compléter.
- Pas de notion « ce spectacle cherche la parité » en 6.21 (match/catch bi-équipes = futur rencontre / Epic 15).

### Audience

Organizers with `canManageComposition` only.

### Placement — **amended 2026-06-06** (Patrice, recette 6.21)

**Bloc « Guidances composition »** (`composition-guidances`) au-dessus de la grille, sous l’animation de tirage — **pas** à côté du badge d’état lifecycle (« À compléter », etc.) dans le chrome événement.

| Niveau | Contenu | Exemple |
|--------|---------|---------|
| **Équipe** (guidances) | Signaux agrégés, garde-fous ignorable | Mixité (**6.21**) ; futurs indicateurs (ex. originalité compo) |
| **Créneau** (sous la ligne slot) | Alertes contextuelles par assignation | Rejeu possible (**6.20**), deux rôles le même soir |

- Conteneur discret : fond `surface-container-high` léger, bordure `outline-variant`, pills en `flex-wrap`.
- Chaque signal = pill score-colored (`event-equipe-tab__guidance`) — **pas** bandeau pleine largeur.
- Section masquée quand aucun signal équipe actif.

### Score (genres connus sur `player` assignés, `n = f + m`)

**Écart** (PO confirmé 2026-06-05) : `écart = |f − m|` — calculé uniquement quand **tous** les `player` assignés ont un genre connu (`u = 0`) et `n = f + m ≥ 2`. Si `u > 0` → **rien n'est affiché** (mixité non calculable).

| Score | Règle (`écart`) | Couleur sémantique |
|-------|-----------------|-------------------|
| **Bon** | `écart = 0` | Vert |
| **Acceptable** | `écart = 1` | Gris |
| **Faible** | `écart ≥ 2` | Orange |

Exemples : 2 F · 3 H → écart 1 → acceptable ; 2 F · 2 H → écart 0 → bon ; 1 F · 4 H → écart 3 → faible ; 0 F · 3 H → écart 3 → faible.

Effectifs impairs (3, 5…) : le score « acceptable » est le cas le plus fréquent.

### Visual (M3)

| Element | Spec |
|---------|------|
| Form | Single line, `body-small`, optional `mat-icon` `groups` (18px, decorative) |
| **Bon** | Tokens vert participation (`--hatcast-participation-available-badge-*`) |
| **Acceptable** | Tokens gris neutre (`--hatcast-participation-neutral-badge-*`) |
| **Faible** | Tokens orange tertiary (`--hatcast-participation-declined-badge-*`) — **not** warning amber (**6.20**) |
| Chiffres | **Not** in main line ; optional tap/tooltip : *{f} F · {m} H* (uniquement si tous les genres assignés sont connus) |

### Copy (FR) — ligne principale

| Score / état | Template |
|--------------|----------|
| Bon | *Mixité équilibrée* |
| Acceptable | *Mixité acceptable* |
| Faible | *Mixité faible* |
| Aucun `player` rempli | *(hidden)* |
| Au moins un `player` rempli avec genre **inconnu** (`u > 0`) | *(hidden — on ne se prononce pas)* |
| Tous genres connus mais `n = f + m < 2` | *(hidden)* |

---

## Screen 3 — Statistiques ligue (story 16.3)

Outlined `mat-card` in season stats summary:

- **Title:** Mixité sur scène (Comédien·ne)
- **Body:** *{f} femmes · {m} hommes sur {total} sélections connues ({pct} % femmes)*

Hidden when no validated `player` selections with known gender.

---

## Cross-surface — labels & avatars

- **2.12b:** `getRoleLabel(role, gender)` on dispos, équipe, confirmations — see [member-gender.md](../specs/spec-member-gender-parity/member-gender.md).
- **2.12c:** Letter + tone fallback in `app-user-avatar` when no photo (Screen 1 tones above) on all operational surfaces.

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
