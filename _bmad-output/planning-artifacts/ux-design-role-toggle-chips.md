---
title: UX — Chips rôles d'événement (toggle + lecture seule)
author: Sally (UX) + Patrice
date: '2026-06-08'
status: approved
relatedArtifacts:
  - apps/web/src/app/shared/event-roles/role-toggle-chip-set/role-toggle-chip-set.ts
  - apps/web/src/app/shared/event-roles/role-display-chip-set/role-display-chip-set.ts
  - apps/web/src/app/shared/event-roles/role-action-chip/role-action-chip.ts
  - apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts
  - apps/web/src/app/pages/admin-membres/membres-tab.html
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
stakeholderDecisions:
  - preferred-roles-use-toggle-chips-not-checkbox-grid
---

# UX Design — Chips toggle pour rôles d'événement

**Purpose:** Définir le pattern **sélection multi-valeurs** de rôles d'événement (emoji + libellé inclusif) via `mat-chip` Material 3, pour un rendu compact mobile-first et une future unification avec d'autres surfaces « rôle ».

**Première adoption :** onglet **Préférences** de Mon compte (`MemberPreferencesForm`).

---

## Problème

| Point | Constat |
|-------|---------|
| **Densité** | Grille `mat-checkbox` en colonne unique : 9 lignes, scroll excessif sur mobile. |
| **Espace** | Large marge vide à droite dans le panneau Préférences. |
| **Cohérence** | Chips déjà utilisés ailleurs (filtres admin, participation) mais pas pour la sélection de rôles métier. |

---

## Pattern retenu

### Composant partagé

`app-role-toggle-chip-set` — [`role-toggle-chip-set.ts`](../../apps/web/src/app/shared/event-roles/role-toggle-chip-set/role-toggle-chip-set.ts)

| Élément | Règle |
|---------|-------|
| **Conteneur** | `mat-chip-set` avec `aria-label` explicite (français). |
| **Chip** | `mat-chip` + `[highlighted]` pour l'état sélectionné. |
| **Interaction** | `(click)` sur le chip — pas de `mat-chip-listbox` (hors scope M3 actuel du repo). |
| **Contenu** | Emoji (`aria-hidden="true"`) + libellé via `getRoleLabel(key, gender)`. |
| **État verrouillé** | `lockVolunteer=true` (défaut) : bénévole non désélectionnable + tooltip préférences. `lockVolunteer=false` : `(chipToggled)` délégué au parent. |
| **Accessibilité** | `aria-pressed` sur chaque chip ; cible tactile `min-height: 2.75rem` (44 dp). |
| **Layout** | `flex-wrap` — les chips passent à la ligne sur petit écran. |

### Référence antérieure (filtre admin)

Le pattern `[highlighted]` + `(click)` est déjà validé sur [`membres-tab.html`](../../apps/web/src/app/pages/admin-membres/membres-tab.html) (filtres Tous / Membre / Admin / Externe). Le chip set rôles **réutilise la même mécanique** avec contenu métier (emoji + libellé rôle).

---

## Quand utiliser ce pattern

| Contexte | Utiliser `RoleToggleChipSet` ? | Alternative |
|----------|-------------------------------|-------------|
| **Préférences — rôles préférés** (compte global) | **Oui** — as-shipped 2026-06-08 | — |
| **Profil membre troupe** (dialog `MemberProfilePanel`) | **Oui** — as-shipped 2026-06-08 | — |
| **Saisie disponibilité — dialog agenda** (cellule participation) | **Oui** — as-shipped 2026-06-08 | `lockVolunteer=false` + `chipToggled` — règles bénévole contextuelles dans `AvailabilityForm` |
| **Saisie disponibilité — onglet Dispos** (story 5.8) | **Non** | `app-availability-poll` — cases à cocher + jauge collective (spec [ux-design-dispos-poll-2026-06-09.md](ux-design-dispos-poll-2026-06-09.md)) |
| **Affichage lecture seule** (résumé Infos, favoris stats, participation) | **Non** — utiliser `RoleDisplayChipSet` | Voir § lecture seule |
| **Filtre single-select** (admin) | **Non** | Chips filtres locaux (`highlighted` + un seul actif) |
| **Slot équipe — pill rôle** (ouvre pool tirage) | **Oui** — `RoleActionChip` | `interactive` + `actionClick` ; `density=equipe` |
| **Badge rôle participation** (admin roster) | **Non** | Chip menu / readonly — sémantique différente |

---

## Règles métier (inchangées)

- **`volunteer` (Bénévole)** : toujours sélectionné, non désélectionnable (`canDisablePreferredRole`).
- **Ordre** : `orderedRoleKeys()` / `ROLE_DISPLAY_ORDER`.
- **Labels** : inclusifs selon `MemberGender` du viewer.
- **Sauvegarde** : explicite (bouton Enregistrer) sur Préférences — pas d'auto-save au toggle.

---

## Wireframe — Préférences (mobile)

```
┌─────────────────────────────────────┐
│ Rôles préférés                      │
│ Pré-cochés par défaut à la saisie…  │
│                                     │
│ [🎭 Comédien ✓] [🎧 DJ] [🎤 MC]    │
│ [🤝 Bénévole ✓] [⚖️ Arbitre]       │
│ [👥 Assistant ✓] [💡 Lumière] …     │
│                                     │
│ [ Enregistrer — pleine largeur ]    │
└─────────────────────────────────────┘
```

---

## Piste d'unification (future)

### Mode délégué (`lockVolunteer=false`)

Pour les surfaces où le bénévole n'est pas verrouillé (saisie de disponibilité) :

- Passer `[roleKeys]` filtré (rôles de l'événement uniquement).
- Écouter `(chipToggled)` et appliquer la normalisation métier côté parent.
- Ne pas utiliser `(selectionChange)` sur ces écrans.

Surfaces as-shipped : `availability-form` (dialog agenda) ; onglet Dispos → `availability-poll` (story 5.8).

---

## Pattern lecture seule — `RoleDisplayChipSet`

Composant : [`role-display-chip-set`](../../apps/web/src/app/shared/event-roles/role-display-chip-set/role-display-chip-set.ts)

| Élément | Règle |
|---------|-------|
| **Usage** | Récapitulatif non interactif — pas de `[highlighted]`, pas de `(click)`. |
| **Données** | `RoleDisplayChipItem[]` via helpers `roleDisplayChipItems`, suffixes `roleSlotCountSuffix` (`: 2`) ou `roleFavoriteCountSuffix` (` (3)`). |
| **Vide** | `emptyMessage` optionnel (ex. « Aucun besoin renseigné »). |
| **Style** | `pointer-events: none` sur les chips — pas confondre avec un toggle. |

| Contexte | As-shipped |
|----------|------------|
| Infos spectacle — besoins rôles | `event-infos-tab` |
| Dialog format & besoins — résumé | `event-type-roles-dialog` |
| Profil membre — rôles favoris (stats) | `member-profile-panel` |
| Dialog confirmation participation | `composition-participation-dialog` (1 chip) |

---

## Pattern action — `RoleActionChip`

Composant atomique (1 rôle) : [`role-action-chip`](../../apps/web/src/app/shared/event-roles/role-action-chip/role-action-chip.ts)

| Élément | Règle |
|---------|-------|
| **Usage** | Chip **cliquable** ou lecture seule — ouvre une action (pool, modale), pas une sélection multi. |
| **Libellé** | `hasAssignee=true` → `getRoleLabel(key, gender)` ; sinon baseline inclusive (`roleLabelSingular`). Helper `roleActionChipDisplayText` pour aria-labels. |
| **États** | `interactive`, `active` (pool ouvert), `ariaExpanded`, `ariaLabel`. |
| **Layout équipe** | `density="equipe"` — pleine largeur colonne grille, tokens `--equipe-*`. |

Surfaces as-shipped : `event-equipe-tab` (slots + liste déclinés).

---

## Anti-patterns

| Éviter | Faire |
|--------|-------|
| Colonne unique de checkboxes pour 6+ rôles | Chip set wrap ou grille 2 col. |
| Chip sans `aria-pressed` | `aria-pressed` + `aria-label` sur le set |
| Désactiver visuellement le bénévole (`disabled` grisé) | Chip highlighted + locked + tooltip |
| Auto-save silencieux sur Préférences | Bouton Enregistrer + état dirty |
| Pills / spans custom emoji+label pour rôles événement | `RoleDisplayChipSet` ou `RoleToggleChipSet` |
| `RoleDisplayChipSet` cliquable | `RoleActionChip` (action) ou `RoleToggleChipSet` (sélection) |
| Pill CSS custom emoji+rôle dans équipe | `RoleActionChip` + `density=equipe` |

---

## Amendement Mon compte

Voir [ux-design-mon-compte.md](./ux-design-mon-compte.md) — **C2b** mis à jour : chips toggle au lieu de grille `mat-checkbox`.
