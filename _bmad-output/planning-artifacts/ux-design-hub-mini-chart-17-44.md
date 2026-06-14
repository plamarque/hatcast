---
title: UX — Hub troupe mini-chart saison (Story 17.44 / MT15)
author: Sally (UX) + Patrice
date: '2026-06-14'
status: approved
stakeholderSignOff: '2026-06-14 — Patrice (mockups mobile + desktop) ; amend. 2026-06-14 — couleurs statut agenda + CTA stats (Patrice)'
relatedStories:
  - '17.44'
  - '17.42'
  - '3.6'
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-ma-troupe-hub.md
  - _bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md
  - _bmad-output/planning-artifacts/ux-design-hub-section-headers.md
  - _bmad-output/implementation-artifacts/17-44-hub-troupe-mini-chart-saison.md
  - apps/web/src/app/shared/member-profile/member-profile-panel.html
  - apps/web/src/app/shared/member-profile/member-profile-dialog.scss
  - docs/v2/technical/FRONTEND_UI.md
visualReferences:
  - mockup mobile (session design 2026-06-14)
  - mockup desktop (session design 2026-06-14)
supersedesPartially:
  - ux-design-ma-troupe-hub.md#phase-2--mini-chart-mois-mt15
---

# UX Design — Hub troupe : mini-chart mois saison (MT15)

**Purpose:** Spec d’implémentation pour **Story 17.44** — bandeau **mois par mois** dans la **carte saison** du hub Ma troupe. Complète **MT15** dans [ux-design-ma-troupe-hub.md](./ux-design-ma-troupe-hub.md) (phase 2).

**Principe:** Même **grammaire visuelle** que **Mes Stats** (`member-profile-panel`), mais lecture **collective** (1 bloc = 1 spectacle passé) — pas un second tableau de stats, pas un agenda.

---

## User story

**Léa**, membre des Improbots, ouvre **Ma troupe**. Elle voit déjà les chiffres de la saison (spectacles, compos confirmées, personnes). Sous ces tuiles, une **bande de petits carrés par mois** lui montre d’un coup d’œil que mars et avril ont été denses — les couleurs reprennent celles des **badges Équipe** de l’agenda (collecte, préparation, confirmé…). Elle survole un bloc : *« Veille générale mai — Confirmé — 8 participations »*. Un tap l’emmène sur la fiche du spectacle ; le bouton **Voir toutes les stats** ouvre la **grille stats** de la saison.

---

## Design decisions

| ID | Sujet | Décision |
|----|--------|----------|
| **MC1** | **Placement** | **Dans** `.troupe-hub__season-card`, **sous** les 3 tuiles métriques, **au-dessus** du lien « Saisons archivées ». **Pas** de titre de section (pas de « En un clin d’œil »). |
| **MC2** | **Seuil d’affichage** | Bandeau visible **iff** ≥ **3 spectacles passés** dans la saison sélectionnée. Sinon : carte identique à **17.42** (tuiles seules). |
| **MC3** | **Périmètre temporel** | **Spectacles passés uniquement** (`startsAt` &lt; now, Europe/Paris). Les à venir restent dans **Prochains spectacles**. |
| **MC4** | **Unité visuelle** | **1 bloc = 1 spectacle** (pas 1 participation). Empilement vertical par mois, comme Mes Stats. |
| **MC5** | **Couleur des blocs** | **Statut Équipe agenda** — même palette que `composition-status-badge` (`teamStatusBadge.tone` : `draft`, `collecting`, `preparing`, `confirmed`). Source : `StatisticsEvent.teamStatusBadge` sur `GET /v1/seasons/:id/statistics` (enrichissement identique à l’agenda). **Pas** de couleur par rôle de participation individuelle. |
| **MC6** | **Emoji / icône** | **Aucun** emoji rôle sur le bloc (contrairement au profil membre). |
| **MC7** | **Tooltip** | 3 lignes : `{eventTitle}` ; `{teamStatusBadge.shortLabel}` (ex. Confirmé, Collecte, Préparation, Brouillon) ; `{n} participation` / `{n} participations` (singulier si n = 1). **Pas** de date, **pas** de libellé de rôle joueur. |
| **MC8** | **Participations (définition)** | Compte des participants dont le statut sur l’événement est **`selected`** ou **`pending`** (assigné, confirmé ou en attente d’ack). |
| **MC9** | **Interaction** | Tap / clic / Entrée sur un bloc → **détail spectacle** (`/saison/:troupeSlug/:seasonSlug/event/:eventSlug`). |
| **MC10** | **Scroll** | Horizontal **dans la carte** si &gt; ~12 colonnes mois visibles ; `overflow-x: auto`, scroll tactile. |
| **MC11** | **Chargement** | Pendant le load stats : **pas de bandeau** (éviter flash vide). Erreur stats : **pas de bandeau** ; tuile Compos affiche déjà « — ». |
| **MC12** | **Changement de saison** | Switcher saison → bandeau recalculé ; pas de données périmées (même garde async que **17.42**). |
| **MC13** | **Invité·e / EXTERNE** | Même dataset que stats saison filtrées (comme section Personnes) — pas de surcouche UX. |
| **MC14** | **Accessibilité** | Bloc focusable ; `aria-label` FR = contenu tooltip ; `matTooltip` Material. |
| **MC15** | **Desktop ≥ 840 px** | Bandeau **pleine largeur** de la carte ; hauteur légèrement plus généreuse (+~1 rem) ; **plus de mois visibles** sans scroll. Sections **Personnes | Prochains spectacles** restent en **2 colonnes** **sous** la carte (inchangé **17.42**). |
| **MC16** | **CTA stats saison** | Sous le bandeau (visible **iff** bandeau visible) : bouton **`mat-stroked-button`** centré **« Voir toutes les stats »** → workspace saison avec **`?view=stats`** (grille stats **3.6**, ex. `/saison/les-improbots/les-improbots-2026-2027?view=stats`). Même pattern de lien que **Voir tous les spectacles** (17.42). |

---

## Comparaison Mes Stats vs hub saison

| Aspect | Mes Stats (`member-profile-panel`) | Hub saison (MT15) |
|--------|-----------------------------------|-------------------|
| Contexte | Moi, une saison | **Nous**, saison courante du hub |
| Bloc | 1 participation | 1 **spectacle** |
| Couleur | Statut / rôle (violet, ambre, etc.) | **Statut Équipe** (badges agenda) |
| Emoji | Rôle si sélection | **Non** |
| Tooltip | Titre + date + rôle/statut | Titre + **statut Équipe** + nb participations |
| Tap | Event detail | Event detail |
| Conteneur | Section titrée « En un clin d'œil » | Bandeau **compact**, sans titre |
| Hauteur bandeau | ~12,5 rem | **~6–8 rem** mobile ; **~7–9 rem** desktop |
| Seuil | — | ≥ 3 spectacles **passés** |

Réf. couleurs badges Équipe : [`composition-status-badge.scss`](../../apps/web/src/app/shared/composition/composition-status-badge.scss) — tons `draft` / `collecting` / `preparing` / `confirmed`. Couleurs participation individuelles ([ux-design-participation-semantic-colors.md](./ux-design-participation-semantic-colors.md)) : **hors scope** hub (MC5).

---

## Wireframes

### Mobile (≤ 839 px)

```text
┌─────────────────────────────────────┐
│  [logo] Les Improbots          [⚙]  │
├─────────────────────────────────────┤
│  Saison 2025-26              [▾]    │
│  ┌─────────────────────────────┐   │
│  │  45       11       37         │   │
│  │ Spectacles Compos Personnes   │   │
│  │ ┌─ mini-chart ────────────►  │   │
│  │ │ JAN FEV MAR AVR MAI JUN …  │   │
│  │ │  ▢   ▢  ▢▢▢ ▢▢   ▢         │   │
│  │ └────────────────────────────┘   │
│  │     [ Voir toutes les stats ]    │
│  └─────────────────────────────┘   │
│  Saisons archivées (2)              │
├─────────────────────────────────────┤
│  PERSONNES                          │
│  [avatars wrap] [+N]                │
├─────────────────────────────────────┤
│  PROCHAINS SPECTACLES               │
│  [agenda-card × ≤3]                 │
│      [ Voir tous les spectacles ]   │
└─────────────────────────────────────┘
```

### Desktop (≥ 840 px)

```text
┌── rail ─┬──────────────────────────────────────────────────────────┐
│ …       │  Hero troupe                                             │
│ Ma      │  Saison 2025-26                                   [▾]    │
│ troupe ●│  ┌────────────────────────────────────────────────────┐ │
│         │  │ tuiles métriques (3 colonnes)                      │ │
│         │  │ mini-chart full width — mois SEP→JUN visibles      │ │
│         │  │     [ Voir toutes les stats ]                        │ │
│         │  └────────────────────────────────────────────────────┘ │
│         │  ┌─────────────────────┬──────────────────────────────┐  │
│         │  │ PERSONNES           │ PROCHAINS SPECTACLES       │  │
│         │  └─────────────────────┴──────────────────────────────┘  │
└─────────┴──────────────────────────────────────────────────────────┘
```

**Règle desktop (MC15):** ne **pas** placer le chart en colonne latérale ; il reste **dans** la carte saison, au-dessus du split Personnes / Spectacles.

---

## Anatomie du bandeau

```text
.troupe-hub__season-chart  (conteneur compact)
└── .member-profile__chart  (réutilisation grammaire layout)
    └── .member-profile__chart-month  (× N mois)
        ├── .member-profile__chart-blocks
        │   └── .troupe-hub__season-chart-block--{draft|collecting|preparing|confirmed}  (× M spectacles)
        └── .member-profile__chart-month-label  (JAN, FEV, …)
.troupe-hub__season-stats-cta  (lien « Voir toutes les stats », sous bandeau)
```

| Token / mesure | Mobile | Desktop |
|----------------|--------|---------|
| Bloc min | 32×32 dp | 32×32 dp |
| Gap colonnes mois | 0,6 rem | 0,6–0,75 rem |
| Fond bandeau | `surface-container-low` + bordure `outline-variant` | idem |
| Fond bloc | Tons badge Équipe (MC5) — voir `composition-status-badge--*` | idem |
| Labels mois | JAN…DEC (3 lettres, FR) | idem |
| Scroll hint | fade / overflow à droite si scrollable | souvent inutile (saison ≤ 12 mo) |

---

## États

| État | UI |
|------|-----|
| **Default (≥ 3 passés)** | Bandeau sous tuiles |
| **Saison jeune (&lt; 3 passés)** | Pas de bandeau |
| **Loading stats** | Pas de bandeau ; spinners sur tuiles Spectacles/Compos |
| **Erreur stats** | Pas de bandeau ; Compos = « — » |
| **Saison vide / aucune active** | Empty state **17.42** — pas de carte |
| **Hover desktop** | Tooltip MC7 |
| **Focus clavier** | Outline focus visible ; Entrée = navigation MC9 |
| **Switch saison** | Bandeau remplacé ou masqué selon nouveau seuil |

---

## Critères d’acceptation UX (MT15-AC)

- [ ] **MT15-AC1** : Bandeau sous tuiles, dans carte saison, sans titre de section.
- [ ] **MT15-AC2** : Masqué si &lt; 3 spectacles passés.
- [ ] **MT15-AC3** : Blocs = spectacles passés uniquement ; ordre mois = `monthKeys` API.
- [ ] **MT15-AC4** : Tooltip titre + statut Équipe + participations (MC7–MC8).
- [ ] **MT15-AC5** : Tap → détail spectacle (slug canonique **17.6**).
- [ ] **MT15-AC6** : Scroll horizontal si besoin (MC10).
- [ ] **MT15-AC7** : Pas de bandeau en loading / erreur stats (MC11).
- [ ] **MT15-AC8** : Blocs colorés par statut Équipe agenda ; sans emoji rôle (MC5–MC6).
- [ ] **MT15-AC9** : Desktop — pleine largeur carte ; split Personnes/Spectacles inchangé (MC15).
- [ ] **MT15-AC10** : CTA **Voir toutes les stats** → `?view=stats` sur workspace saison (MC16).

### Material 3

- [ ] **M3-1** : `matTooltip` ; blocs focusables ; libellés FR.
- [ ] **M3-2** : Couleurs blocs alignées sur `composition-status-badge` (tons MC5) ; surfaces bandeau `var(--mat-sys-*)` / `color-mix` — pas de hex ad hoc sur feature SCSS.
- [ ] **M3-3** : Cibles ≥ 32 dp ; scroll tactile.

---

## Implémentation — notes dev

| Zone | Action |
|------|--------|
| Template | `troupe-hub.html` — insert after `.troupe-hub__metrics` |
| Styles | SCSS partagé avec `member-profile-dialog.scss` ; modifier `.troupe-hub__season-chart` |
| Données | Dériver de `loadStatistics` (**17.42**) — incl. `teamStatusBadge` par event (API stats, enrichissement lifecycle agenda) |
| Nav bloc | `saisonEventPath` + `StatisticsEvent.slug` (**17.6**) |
| Nav CTA | `saisonWorkspacePath` + `queryParams: { view: 'stats' }` |
| Tests | `troupe-hub.spec.ts` + util `buildSeasonHubMonthlyChart` |

Story technique : [_17-44-hub-troupe-mini-chart-saison.md_](../implementation-artifacts/17-44-hub-troupe-mini-chart-saison.md).

---

## Hors scope

- Légende ou filtre par catégorie de spectacle
- Spectacles **à venir** dans le bandeau
- Couleur par **rôle de participation** individuelle (Mes Stats) — distinct du statut Équipe collectif (MC5)
- Duplication du chart sur workspace saison (la grille complète reste sur `?view=stats`)
- Nouvelle story nav / hero / bouton admin

---

## Sign-off

| Question | Réponse |
|----------|---------|
| Bandeau dans la carte saison, sous tuiles ? | Oui (MC1) |
| Seuil 3 spectacles passés ? | Oui (MC2) |
| Grammaire Mes Stats, blocs = spectacles ? | Oui (MC4) |
| Couleur = statut Équipe agenda (pas neutre) ? | Oui (MC5, amend. 2026-06-14) |
| Tooltip titre + statut + participations ? | Oui (MC7) |
| CTA « Voir toutes les stats » → `?view=stats` ? | Oui (MC16, amend. 2026-06-14) |
| Desktop : chart full width, sections 2 col en dessous ? | Oui (MC15) |

**Statut :** `approved` (2026-06-14 — Patrice, mockups mobile + desktop ; **amend. 2026-06-14** — couleurs statut agenda + CTA stats).
