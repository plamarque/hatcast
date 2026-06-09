---
title: UX — Patterns de fermeture des modales (MatDialog / bottom sheet)
author: Sally (UX) + Patrice
date: '2026-06-09'
status: approved
stakeholderSignOff: '2026-06-09 — Phase 0+1 : spec normative + quick wins (profil membre, partage annonce, changelog, orgas)'
relatedArtifacts:
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/planning-artifacts/ux-design-unified-filter-panel.md
  - _bmad-output/implementation-artifacts/ux-dialog-close-patterns-phase-0-1.md
uxDr: UX-DR23
---

# UX Design — Fermeture des modales HatCast V2

**Purpose:** Une seule référence pour **comment l’utilisateur ferme** une surface modale (`MatDialog`, `MatBottomSheet`) — libellés, placement, styles M3 — afin d’éviter le mélange croix header / texte footer sans règle.

**Contexte (Patrice, 2026-06-09) :** Certaines modales affichent une croix en haut à droite, d’autres un bouton texte en bas ; parfois les deux. Ce document fixe la taxonomie et les gabarits.

**Référence Material 3 :** [Dialogs — Material Design](https://m3.material.io/components/dialogs) ; Angular Material [`MatDialog`](https://material.angular.dev/components/dialog).

---

## Principes M3 retenus pour HatCast

1. **Dialog standard** (alerte, confirmation, formulaire court, consultation) → actions **textuelles en bas** (`mat-dialog-actions`). **Pas de croix** en header.
2. **Dialog plein écran** (flux multi-étapes non encore livré en V2) → croix ou retour en haut ; hors périmètre Phase 0+1.
3. **Bottom sheet / picker** (filtres mobile, fiche explicative) → croix header **ou** swipe + footer d’actions ; pattern documenté à part (cf. UX-DR22.1).
4. **Une seule affordance de dismiss explicite** par surface — jamais croix header **et** « Fermer » / « Annuler » footer sur le même dialog standard.
5. **Dismiss** = `mat-button` (text button dialog). **Action primaire** = `mat-flat-button color="primary"` à droite.

Fermeture implicite (clic backdrop, Échap) : autorisée sauf `disableClose: true` (opt-in critique, confirmation destructive multi-étapes).

---

## Taxonomie des surfaces modales

| Type | Exemples HatCast | Dismiss footer | Croix header |
|------|------------------|----------------|--------------|
| **Formulaire** | `event-form-dialog`, `add-member-dialog`, `event-organizers-dialog` | **Annuler** + action nommée | Non |
| **Confirmation** | `confirm-dialog`, `account-delete-dialog` | **Annuler** + action nommée | Non |
| **Consultation / info** | `changelog-dialog`, `availability-dialog`, `draw-chances-help` | **Fermer** | Non |
| **Opt-in / promo** | `push-opt-in-dialog`, `pwa-install-instructions-dialog` | **Plus tard** / **Pas maintenant** (pas « Annuler » générique) | Non |
| **Choix binaire** | `google-avatar-prompt-dialog` | Libellés explicites (**Non** / **Oui**) | Non |
| **Picker filtre** | `filter-*-picker`, `filter-panel-content` | **Appliquer** + **Réinitialiser** ; ✕ = abandon sans appliquer | **Oui** (sheet-like) |
| **Bottom sheet métier** | `chance-breakdown-sheet` | **Fermer** (`mat-stroked-button` ou `mat-button`) | Non (swipe) |

---

## Règles de libellé (copy FR)

| Situation | Libellé dismiss |
|-----------|-----------------|
| Saisie ou modification de données | **Annuler** |
| Confirmation destructive | **Annuler** |
| Lecture seule, changelog, aide | **Fermer** |
| Opt-in notifications / PWA | **Plus tard** (ou variante story) |
| Picker filtre — abandon | ✕ header (équivalent Annuler, `aria-label="Fermer"`) |
| Picker filtre — commit | **Appliquer** (`mat-flat-button`) |

Ordre des actions en footer (align `end`) : `[Dismiss texte]` puis `[Action primaire]` — dismissive à gauche de l’affirmative.

---

## Gabarits (wireframes texte)

### A — Dialog standard (formulaire)

```text
┌──────────────────────────────────────┐
│ Titre (mat-dialog-title)             │
├──────────────────────────────────────┤
│ Contenu (mat-dialog-content)         │
│   champs, texte…                     │
├──────────────────────────────────────┤
│              [Annuler]  [Enregistrer]│  ← mat-dialog-actions align="end"
└──────────────────────────────────────┘
```

### B — Dialog consultation

```text
┌──────────────────────────────────────┐
│ Titre                                │
├──────────────────────────────────────┤
│ Contenu informatif                   │
├──────────────────────────────────────┤
│                        [Fermer]      │  ← mat-button uniquement
└──────────────────────────────────────┘
```

### C — Picker filtre (mobile sheet / desktop dialog)

```text
┌──────────────────────────────────────┐
│ Titre du filtre                  [✕] │  ← mat-icon-button, aria-label Fermer
├──────────────────────────────────────┤
│ Recherche + liste sélectionnable     │
├──────────────────────────────────────┤
│     [Réinitialiser]      [Appliquer] │
└──────────────────────────────────────┘
```

Exception documentée : pas un dialog standard — la croix abandonne le brouillon ; **Appliquer** commit.

### D — Dialog avec action secondaire (profil membre)

```text
┌──────────────────────────────────────┐
│ [avatar] Nom                         │  ← pas de ✕
├──────────────────────────────────────┤
│ Panneau profil                       │
├──────────────────────────────────────┤
│ [Voir dans mon agenda]      [Fermer] │  ← secondaire stroked + dismiss texte
└──────────────────────────────────────┘
```

---

## Anti-patterns (rejeter en revue)

| Éviter | Faire à la place |
|--------|------------------|
| ✕ header + « Fermer » footer sur dialog standard | Une seule affordance (footer texte) |
| `mat-flat-button` pour le seul bouton dismiss | `mat-button` pour dismiss |
| « Fermer » sur un formulaire avec saisie | **Annuler** |
| Croix sur formulaire admin / membre | Footer **Annuler** + primaire |

---

## Phase 0+1 — périmètre livré (2026-06-09)

| Fichier | Changement |
|---------|------------|
| `member-profile-dialog` | Retrait ✕ header ; footer inchangé |
| `share-announce-dialog` | Retrait ✕ header ; footer **Fermer** |
| `changelog-dialog` | **Fermer** : `mat-button` (plus `mat-flat-button`) |
| `event-organizers-dialog` | **Fermer** → **Annuler** |

---

## Phase 2 — harmonisation libellés & styles dismiss (2026-06-09)

Audit mécanique de tous les `mat-dialog-actions` / footers sheet. Règle : **dismiss = `mat-button`** ; libellé selon taxonomie § Règles de libellé.

### Corrections livrées

| Fichier | Avant | Après |
|---------|-------|-------|
| `member-profile-dialog` | `mat-flat-button` **Fermer** | `mat-button` **Fermer** |
| `account-change-email-dialog` (état envoyé) | `mat-flat-button` **Fermer** | `mat-button` **Fermer** |
| `account-change-password-dialog` (état envoyé) | `mat-flat-button` **Fermer** | `mat-button` **Fermer** |
| `import-results-dialog` | `mat-flat-button` **Fermer** | `mat-button` **Fermer** |
| `draw-chances-help-dialog` | `mat-flat-button` **Fermer** | `mat-button` **Fermer** |
| `chance-breakdown-sheet` | `mat-stroked-button` **Fermer** | `mat-button` **Fermer** |

### Inventaire conforme (aucun changement Phase 2)

| Dialog | Type | Dismiss |
|--------|------|---------|
| `event-form-dialog`, `season-form-dialog`, `create-troupe-dialog`, `troupe-edit-dialog` | Formulaire | Annuler |
| `event-type-roles-dialog`, `event-organizers-dialog`, `composition-slot-picker-dialog` | Formulaire | Annuler |
| `add-member-dialog`, `edit-troupe-member-dialog`, `add-participant-dialog`, `add-event-participant-dialog`, `edit-participant-dialog` | Formulaire | Annuler |
| `troupe-category-form-dialog`, `troupe-category-delete-dialog`, `confirm-dialog` | Formulaire / confirmation | Annuler |
| `account-delete-dialog` (étape 1) | Confirmation | Annuler |
| `composition-participation-dialog` | Actions in-content | Annuler |
| `changelog-dialog`, `availability-dialog`, `share-announce-dialog`, `pwa-install-instructions-dialog` | Consultation / instruction | Fermer |
| `import-results-dialog` | Rapport lecture seule | Fermer |
| `draw-chances-help-dialog`, `chance-breakdown-sheet` | Aide / explication | Fermer |
| `member-profile-dialog` | Consultation + action secondaire | Fermer |
| `push-opt-in-dialog` | Opt-in | Plus tard |
| `google-avatar-prompt-dialog` | Choix binaire | Non / Oui |
| `account-change-email-dialog` (reconnexion) | Blocage session | Fermer + Se reconnecter |
| `account-change-*` (formulaire actif) | Formulaire | Annuler |
| `filter-*-picker` | Picker (exception) | ✕ header + Appliquer |

---

## Phase 2b — rendu visuel unifié (2026-06-09)

**Décision PO :** dismiss = **`mat-button` texte primary** (pas tonal plein, pas stroked) ; primaire = **`mat-flat-button`** ; actions métier dans le contenu = **`mat-button` + icône** (classe `.hatcast-dialog-content-actions`).

### Livrables

| Élément | Action |
|---------|--------|
| `styles/_hatcast-dialog-actions.scss` | Cibles 3 rem, gap, tokens text dismiss pour `mat-dialog-actions`, sheets aide, push opt-in |
| `account-change-*` | E-mail affiché en `mat-form-field` outline readonly (plus bloc custom caps) |
| `share-announce-dialog` | Copier / WhatsApp / Réessayer : `mat-button` (plus stroked) |
| Overrides locaux | Retrait `changelog-dialog__close`, `account-security-dialog__actions button`, `create-troupe-dialog` footer |

### Hors scope 2b (volontaire)

- `member-profile` : **Voir dans mon agenda** reste `mat-stroked-button` (action secondaire nommée)
- Pickers filtre : pattern sheet (Phase 3)

---

## Suivi (hors Phase 0–2b)

| Phase | Contenu | Story cible |
|-------|---------|-------------|
| **3** | Picker filtre : poignée drag sheet mobile ; desktop dialog sans ✕ + Annuler texte ? | 17.28+ |
| **4** | Composant / directive garde-fou (optionnel) | Dette préventive |

---

## Références code (bons patterns post Phase 0+1)

- Formulaire : [`event-form-dialog.html`](../../apps/web/src/app/pages/season-home/event-form-dialog.html)
- Consultation : [`changelog-dialog.html`](../../apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html)
- Picker : [`filter-event-picker.html`](../../apps/web/src/app/shared/filters/filter-event-picker.html)
- Profil : [`member-profile-dialog.html`](../../apps/web/src/app/shared/member-profile/member-profile-dialog.html)
