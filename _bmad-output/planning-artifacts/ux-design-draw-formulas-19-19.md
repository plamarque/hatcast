---
title: UX — Formules de tirage (admin catalogue)
author: Sally (UX) + Patrice
date: '2026-06-16'
status: draft
relatedArtifacts:
  - _bmad-output/implementation-artifacts/19-19-ui-admin-editeur-formules.md
  - _bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md
  - docs/v2/technical/draw-formulas-policies-spec.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/pages/troupe-settings/
stories:
  - '19.19'
stakeholderDecisions:
  - mat-dialog-editor-parite-17-40
  - masquer-facteurs-reserves-en-coming-soon
  - equity-tag-non-desactivable
  - pas-de-preview-pourcentages-mvp
---

# UX Design — Formules de tirage · admin catalogue (Story 19.19)

**Purpose:** Permettre aux **admins troupe** de **composer, nommer et publier** des recettes de tirage (facteurs + paramètres) dans le catalogue, **sans code**, en extension directe de la page **Paramètres troupe** (**17.40**).

**Contexte :** API CRUD **19.17** (done) · spec normative [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) · Wave D **Demo 1**. Politiques (**19.20**) et choix orga (**19.21**) = stories suivantes.

**Preview visuelle :**

- HTML multi-écrans : [`_bmad-output/previews/draw-formulas-19-19-mockup.html`](../previews/draw-formulas-19-19-mockup.html)
- Canvas interactif : [`draw-formulas-19-19-preview.canvas.tsx`](/Users/patrice/.cursor/projects/Users-patrice-GitHub-hatcast/canvases/draw-formulas-19-19-preview.canvas.tsx)

---

## Problème

| Point | Constat |
|-------|---------|
| **Gap spec UX** | Wave D a documenté le modèle produit (**19.15**) et l’API (**19.17**), mais aucun wireframe admin n’existait avant cette spec. |
| **Modèle mental admin** | « Formule » = **recette nommée** (comme une recette de cuisine), pas une équation. Copy **jamais** « pipeline », « multiplicateur », « poids » sur cette surface. |
| **Parité shell** | **17.39/17.40** a posé Paramètres troupe + onglet Catégories ; Formules doit **s’intégrer** sans réinventer chrome, breadcrumb, gating admin. |
| **Facteurs futurs** | Parité genre, mix, prestige = stories **19.11–19.14** ; l’éditeur ne doit **pas** laisser croire qu’ils sont activables aujourd’hui. |
| **Preview %** | Endpoint preview API **waivé** Demo 1 — pas de simulateur de cotes dans l’éditeur MVP. |

---

## Principes de design

1. **Extension 17.40** — 2ᵉ onglet **Formules de tirage** ; même page, même `mat-tab-group` capsule M3 ([`ux-design-pill-tab-bar.md`](./ux-design-pill-tab-bar.md)).
2. **Liste + dialog** — CRUD liste sur l’onglet ; create/edit en **`MatDialog`** (parité `troupe-category-form-dialog`).
3. **Ton admin, pas pédagogique orga** — hints courts par facteur ; lien « Comprendre les cotes » vers doc produit (optionnel, footer intro).
4. **Formule système visible** — ligne **V1 standard (système)** toujours listée, **sans** edit/archive ; badge **Système**.
5. **États explicites** — chips **Brouillon** / **Publiée** / **Archivée** ; actions cohérentes par statut.
6. **Erreurs API = feedback inline** — 400 validation → message sous section facteurs ou snackbar ; 409 politique → dialog ou snackbar actionnable.
7. **Material 3** — checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) ; tokens `--mat-sys-*`.

---

## Surfaces

| ID | Surface | Rôle | Composant |
|----|---------|------|-----------|
| **F1** | Paramètres · onglet **Formules de tirage** | Liste catalogue + CTA créer | `TroupeDrawFormulasTab` |
| **F2** | Dialog **Éditeur de formule** | Create / edit user formula | `TroupeDrawFormulaEditorDialog` |
| **F3** | Dialog **Archiver** | Confirmation soft-delete | `TroupeDrawFormulaArchiveDialog` ou `ConfirmDialog` |
| **F4** | Snackbar / inline erreur | 409 politique, 400 publish | — |

**Route :** `/troupes/:troupeSlug/admin/parametres?tab=formulas`

**Entrées :**

| Origine | Action |
|---------|--------|
| Hub gear → **Paramètres** | Ouvre paramètres ; onglet par défaut **Catégories** (inchangé **17.40**) |
| Deep link direct | `?tab=formulas` active l’onglet Formules |
| *(Futur 19.20)* | Lien « Gérer le catalogue » depuis écran politique → `?tab=formulas` |

---

## F1 — Onglet Formules de tirage (liste)

### Wireframe mobile (≤ 480 px)

```
┌─────────────────────────────────────┐
│ ← Les Improbots                     │  breadcrumb (layout troupe)
├─────────────────────────────────────┤
│ Paramètres                          │  H1 mobile
│                                     │
│ Paramètres troupe                   │
│ Les formules définissent comment…   │  intro (1–2 lignes)
│                                     │
│ ( Catégories ) ( Formules de tirage )│  pill tab bar — Formules actif
│ ─────────────────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ V1 standard (système)    Système│ │  row read-only, border primary subtle
│ │ Compartiment · Participations   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ V1 + aspirations rôle   Publiée │ │  chip status
│ │ Compartiment · Participations · │ │
│ │ Aspirations                     │ │  factor summary (enabled labels)
│ │                          ✎  🗑 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Match test              Brouillon│ │
│ │ Compartiment · Participations   │ │
│ │                          ✎  🗑 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [ + Nouvelle formule ]              │  mat-stroked-button
└─────────────────────────────────────┘
```

### Wireframe desktop (≥ 840 px)

Même contenu ; `max-width: 56rem` centré (aligné `troupe-settings.scss`). Pas de rail supplémentaire — chrome membre existant.

### Règles liste

| Élément | Règle |
|---------|-------|
| **Ordre** | API `name ASC` ; formule **système** peut apparaître en tête (alphabet « V1… ») |
| **Nom** | `name` API ; typo `font-weight: 500` |
| **Résumé facteurs** | Labels FR des facteurs **enabled** uniquement, séparés par « · » |
| **Chip statut** | `DRAFT` → **Brouillon** ; `PUBLISHED` → **Publiée** ; `ARCHIVED` → **Archivée** (ton muted) |
| **Badge système** | `isSystem` → pill **Système** ; pas d’actions ✎/🗑 |
| **Éditer** | `mat-icon-button` `edit` → ouvre **F2** |
| **Archiver** | `mat-icon-button` `delete` → **F3** ; masqué si `isSystem` ou `ARCHIVED` |
| **CTA** | **+ Nouvelle formule** → **F2** (`formulaId = null`) |
| **Loading** | `mat-spinner` centré |
| **Erreur load** | « Impossible de charger les formules. » |

### Intro copy (F1)

> Les formules définissent comment HatCast calcule les cotes et le tirage. Les politiques (par saison ou catégorie) seront configurées ensuite.

Lien optionnel (text button) : **Comprendre les cotes** → doc produit (nouvel onglet).

---

## F2 — Dialog éditeur de formule

**Pattern :** `MatDialog` large mobile (`max-width: min(480px, 100vw - 2rem)`) ; scroll interne si contenu long.

### Wireframe

```
┌─────────────────────────────────────┐
│ Nouvelle formule                 ✕  │
├─────────────────────────────────────┤
│ Nom *                               │
│ [ V1 + aspirations rôle          ]  │  mat-form-field
│                                     │
│ Description (optionnel)             │
│ [ Bonus pour les membres qui…    ]  │  textarea, max 2000
│                                     │
│ ─── Facteurs ─────────────────────  │
│                                     │
│ Compartiment par catégorie    [ON]  │  slide-toggle DISABLED (always on)
│ ℹ Sépare l'historique par type…     │  hint 1 ligne
│                                     │
│ Participations passées        [ON]  │
│ ℹ Plus un·e membre a déjà joué…     │
│                                     │
│ Rejouer immédiatement         [OFF] │
│ ℹ Pénalise ou exclut…               │
│   Mode  [ Exclure ▾ ]               │  mat-select visible si toggle ON
│                                     │
│ Aspirations de rôle           [ON]  │
│ ℹ Bonus pour les membres qui…       │
│                                     │
│ ─── Bientôt ──────────────────────  │
│ Parité genre                  Bientôt │  row disabled, no toggle
│ Bonus bénévole                Bientôt │
│ Mix d'expérience              Bientôt │
│ Prestige                      Bientôt │
│                                     │
│ ⚠ Au moins un facteur doit être…    │  inline error (400 publish)
│                                     │
│        Annuler  Enregistrer  Publier│  stroked / flat primary
└─────────────────────────────────────┘
```

### Champs & validation

| Champ | Règle |
|-------|-------|
| **Nom** | Requis, trim, max 255 ; erreur inline si vide |
| **Description** | Optionnel, max 2000 |
| **equity_tag** | Toujours `enabled: true` ; toggle visuel **désactivé** (non off) |
| **immediate_replay** | Si ON → `params.mode` requis : **Exclure** (`EXCLUDE`) \| **Malus** (`MALUS`) ; défaut **Exclure** |
| **Payload save** | Envoyer les **4 facteurs implémentés** dans `factorConfig` ; ordre stable : equity → past → replay → role_request |
| **Reserved** | Affichés section **Bientôt** ; **exclus** du payload ou `enabled: false` |

### Actions dialog

| Bouton | Comportement |
|--------|--------------|
| **Annuler** | Ferme sans save |
| **Enregistrer brouillon** | `POST`/`PATCH` `status: DRAFT` ; snackbar **Formule enregistrée** |
| **Publier** | `status: PUBLISHED` ; snackbar **Formule publiée** ; disabled pendant submit |

**Edit formule publiée :** même dialog ; **Publier** re-valide publish rules (peut PATCH draft intermédiaire si PO préfère — MVP : PATCH direct avec status).

### Copy facteurs (normatif)

| factorId | Label UI | Hint |
|----------|----------|------|
| `equity_tag` | Compartiment par catégorie | Sépare l'historique et les stats par type de spectacle. |
| `past_participation` | Participations passées | Plus un·e membre a déjà joué ce rôle, plus sa cote baisse. |
| `immediate_replay` | Rejouer immédiatement | Pénalise ou exclut les membres tirés au spectacle précédent. |
| `role_request` | Aspirations de rôle | Bonus pour les membres qui se proposent souvent sans être tirés. |
| `gender_parity` | Parité genre | *(section Bientôt)* |
| `volunteer_bonus` | Bonus bénévole | *(section Bientôt)* |
| `class_mix` | Mix d'expérience | *(section Bientôt)* |
| `prestige` | Prestige | *(section Bientôt)* |

---

## F3 — Dialog archivage

```
┌─────────────────────────────────────┐
│ Archiver « V1 + aspirations rôle »?│
├─────────────────────────────────────┤
│ Cette formule ne sera plus         │
│ proposée dans les politiques.        │
│ Les tirages passés ne sont pas       │
│ modifiés.                            │
│                                     │
│              Annuler    Archiver     │  Archiver = warn flat-button
└─────────────────────────────────────┘
```

**409 response :** remplacer body par :

> Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.

Bouton unique **OK** ou **Compris** (ferme dialog, liste inchangée).

---

## États & edge cases

| Cas | Comportement UI |
|-----|-----------------|
| Catalogue vide (hors système) | Liste = système seule ; CTA **Nouvelle formule** visible |
| Formule `ARCHIVED` | Ligne muted ; pas d’edit ; option filtre « Masquer archivées » = **waivable** MVP |
| Non-admin | Redirect hub + snackbar **Accès non autorisé** (shell **17.40**) |
| Network error | Snackbar **Impossible de…** ; retry manuel (recharger page) |
| Double submit | Désactiver boutons pendant `fetch` |

---

## Accessibilité & M3

| Élément | Exigence |
|---------|----------|
| Icon buttons | `aria-label` FR : `Modifier {name}`, `Archiver {name}` |
| Toggles | Label associé + hint lisible |
| Dialog | `role="dialog"`, focus trap CDK, titre = « Nouvelle formule » / « Modifier {name} » |
| Cibles | ≥ 48×48 dp icon buttons mobile |
| Chips | Contraste via tokens M3 |

**Checklist :** § « Checklist M3 HatCast » — FRONTEND_UI.md ; écarts dans Dev Agent Record story **19.19**.

---

## Test hooks (suggestion dev)

| Hook | Élément |
|------|---------|
| `data-testid="draw-formulas-tab"` | Onglet Formules |
| `data-testid="draw-formula-row-{id}"` | Ligne liste |
| `data-testid="draw-formula-add"` | CTA nouvelle formule |
| `data-testid="draw-formula-editor-dialog"` | Dialog F2 |
| `data-testid="draw-formula-factor-{factorId}"` | Ligne facteur |
| `data-testid="draw-formula-publish"` | Bouton Publier |
| `data-testid="draw-formula-archive-dialog"` | Dialog F3 |

---

## Périmètre livraison

| Lot | Contenu |
|-----|---------|
| **MVP 19.19** | F1 liste + F2 éditeur + F3 archivage + erreurs 400/409 |
| **Hors scope** | Preview % ; politiques (**19.20**) ; sélecteur orga Équipe (**19.21**) ; facteurs réservés activables |

---

## Acceptance Criteria — Material 3 (cross-ref story)

Aligné sur story **19.19** AC M3-1…M3-5 : `mat-tab-group`, `mat-slide-toggle`, `MatDialog`, chips statut, tokens `--mat-sys-*`, pas de hex ad hoc.

---

## Open questions

| ID | Question | Recommandation Sally |
|----|----------|---------------------|
| OQ-F1 | Afficher formules **ARCHIVED** dans la liste ? | **Oui** en MVP, style muted ; filtre optionnel post-demo |
| OQ-F2 | **Publier** depuis brouillon vs toggle statut séparé ? | Un bouton **Publier** explicite (clarté admin) |
| OQ-F3 | Lien hub gear → onglet Formules ? | **Non** en 19.19 — gear reste on Catégories ; deep link `?tab=formulas` suffit |

---

## Handoff dev

1. Lire cette spec + preview HTML/Canvas avant `dev-story`.
2. Réutiliser `troupe-settings/` patterns (**17.40**).
3. Constantes facteurs : `apps/web/src/app/core/draw/draw-factor-catalog.ts` (story **19.19**).
4. Mettre à jour Dev Notes story si OQ résolues par PO.
