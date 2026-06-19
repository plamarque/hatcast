# UX — Choix formule orga (onglet Équipe) — Story 19.21

**Status:** approved (PO Patrice, 2026-06-19)  
**Story:** [19-21-ui-orga-choix-formule-tirage.md](../implementation-artifacts/19-21-ui-orga-choix-formule-tirage.md)  
**Mockup:** [draw-formula-chip-19-21-mockup.html](../previews/draw-formula-chip-19-21-mockup.html) (v2 overflow-only)  
**Normative backend:** [draw-formulas-policies-spec.md § Organizer Équipe UI](../../docs/v2/technical/draw-formulas-policies-spec.md#organizer-equipe-ui-story-1921)

**Supersedes:** epics 19.21 AC bandeau + modale obligatoire ; UX **W16** bandeau sous pool ([ux-design-factor-breakdown-19-7.md](./ux-design-factor-breakdown-19-7.md)).

---

## Principes PO

| Règle | Détail |
|-------|--------|
| **Flux tirage** | « Tirer au sort » = **immédiat** — jamais de modale, jamais de bandeau, jamais de chip visible par défaut |
| **Choix rare** | La politique / formule est configurée par l’admin ; l’orga change presque jamais |
| **Défaut silencieux** | Au chargement : `selectedFormulaId = effectiveFormulaId` (serveur) ; `%` et tirage utilisent cette formule |
| **Visibilité minimale** | Formule imposée ou unique → **aucun** contrôle UI formule |
| **Changement optionnel** | ≥2 formules autorisées → entrées **uniquement** dans le menu overflow **`more_vert`** existant |

**Interdit sur l’onglet Équipe :** bandeau politique, chip formule, hint ligne « Formule : … », modale avant tirage, copy « Choix au tirage », affichage catégorie spectacle pour la politique.

---

## Surfaces

| Persona | Onglet Équipe |
|---------|----------------|
| Membre / orga sans `canManageComposition` | Inchangé — pas de formule UI |
| Orga `canManageComposition` | Voir tableau ci-dessous |

### Visibilité UI formule (orga)

| `selectorVisible` | UI |
|-------------------|-----|
| `false` (MANDATORY, CHOICE 1 formule, implicit single) | **Rien** — formule appliquée côté serveur |
| `true` (CHOICE ≥2) | Section dans menu **⋮** seulement |

### Menu overflow (`composition-actions-overflow`)

Réutiliser [`event-equipe-tab.html`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html) — `mat-menu` sur `more_vert`.

**Visibilité bouton ⋮ :** `equipeToolbar().overflow.length > 0` **OU** `selectorVisible`.

**Structure menu (quand formules + overflow) :**

```
Partager                    ← actions overflow existantes
─────────────────
FORMULE DE TIRAGE           ← libellé section (subheader / item disabled)
✓ Équité saison             ← mat-menu-item + check sur sélection courante
  Parité match
  V1 système
```

- Une ligne = **nom de formule** seul (pas de résumé critères dans le menu MVP).
- Tap ligne → met à jour `selectedFormulaId`, ferme menu, recharge pool preview / `%` opérationnels si ouverts.
- **Pas** de snackbar au changement.

**Tooltip** sur ⋮ : « Autres actions » (défaut) — **ne pas** afficher le nom de formule sur la toolbar.

---

## Tirage

1. Clic **Tirer au sort** → `POST …/composition/draw` avec `{ mode, formulaId: selectedFormulaId }` si requis par API.
2. Animation **6.4** inchangée (`prefers-reduced-motion` inchangé).

---

## Wireframes

### Toolbar fermée (cas le plus fréquent — CHOICE ≥2)

```
Proposition automatique selon les dispos…

[Tirer au sort]  [Valider]  [⋮]
```

### Menu ouvert (cas rare)

```
                    ┌─────────────────────┐
                    │ Partager            │
                    │ ─────────────────── │
                    │ FORMULE DE TIRAGE   │
                    │ ✓ Équité saison     │
                    │   Parité match      │
                    └─────────────────────┘
[Tirer au sort]  [Valider]  [⋮]
```

### Formule imposée — aucun contrôle

```
[Tirer au sort]  [Valider]
```

(pas de ⋮ si overflow vide et `selectorVisible === false`)

---

## Material 3

| Élément | Composant |
|---------|-----------|
| Overflow | `mat-icon-button` + `mat-icon` `more_vert` |
| Liste formules | `mat-menu` + `mat-menu-item` ; `mat-icon` `check` sur ligne active |
| Tokens | `var(--mat-sys-*)` ; pas de couleur hex feature |

Cibles : ⋮ ≥ 48×48 dp ; items menu ≥ 48dp. `aria-label` ⋮ : « Autres actions ».

---

## Test hooks

| Hook | Élément |
|------|---------|
| `composition-draw-formula-menu` | Section menu (wrapper ou premier item section) |
| `composition-draw-formula-option-{id}` | `mat-menu-item` par formule |
| `composition-actions-overflow` | Bouton ⋮ (existant) |

**Absent volontairement :** `composition-draw-formula-chip`, `composition-draw-policy-band`, `composition-draw-formula-picker-dialog`.

---

## Hors scope

- Bandeau politique / catégorie sur Équipe (**19.20** admin)
- Modale sélecteur au tirage
- Chip ou libellé formule sur toolbar
- Résumé critères dans le menu (admin F1 seulement)
- Membres : libellé formule post-tirage → **19.22**

---

## Références

- [draw-formulas-policies-spec.md](../../docs/v2/technical/draw-formulas-policies-spec.md)
- [SPEC.md § Draw formulas & policies](../../SPEC.md)
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3
