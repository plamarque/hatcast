---
title: UX — Barre d’onglets capsule M3 (pill tab bar)
author: Sally (UX) + Paige (Tech Writer) + Patrice
date: '2026-06-09'
status: approved
relatedArtifacts:
  - apps/web/src/styles/_hatcast-pill-tab-bar.scss
  - apps/web/src/app/pages/event-detail/event-detail.scss
  - apps/web/src/app/pages/account-placeholder/account-placeholder.scss
  - apps/web/src/app/pages/troupe-settings/troupe-settings.scss
  - _bmad-output/planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - docs/v2/technical/FRONTEND_UI.md
stakeholderSignOff: '2026-06-09 — Patrice (preview Sally validée ; mixin partagé livré)'
supersedesPartially:
  - ux-design-hatcast-v2.md#tab-bar-below-header
  - ux-design-event-detail-chrome-alignment.md#target-chrome--event-detail
---

# UX — Barre d’onglets capsule M3

**Purpose:** Figurer le pattern **barre d’onglets capsule** (coque sombre + pastille active violette) pour éviter les régressions visuelles lors de nouvelles surfaces à onglets ou de refactors SCSS.

**Trigger:** Preview UX Sally 2026-06-09 (détail spectacle Infos · Dispos · Équipe) — remplace l’ancien style « pastilles isolées + fond blanc 10 % + opacité 0,75 ».

**Implémentation canonique :** mixin SCSS [`_hatcast-pill-tab-bar.scss`](../../apps/web/src/styles/_hatcast-pill-tab-bar.scss) — **ne pas dupliquer** les règles dans les composants.

---

## User story

> En tant que **membre ou orga**,  
> je veux **repérer d’un coup d’œil l’onglet actif dans une barre compacte et lisible**,  
> afin de **naviguer entre sections sans lire une ligne Material générique**.

---

## Design decisions

| ID | Decision |
|----|----------|
| **PT1** | **Coque capsule unique** englobant tous les onglets : fond `--mat-sys-surface-container-high`, `border-radius: 999px`, padding interne `0.25rem`. |
| **PT2** | **Onglet actif** = pastille interne `--mat-sys-primary-container` ; texte + icône `--mat-sys-on-primary-container`. |
| **PT3** | **Onglet inactif** = fond **transparent** (pas de coque individuelle) ; texte `--mat-sys-on-surface-variant`. **Pas** d’`opacity` réduite sur l’onglet entier. |
| **PT4** | **Pas d’indicateur Material** (`.mdc-tab-indicator` masqué) — la pastille active suffit. |
| **PT5** | Chaque onglet : **`mat-icon` + libellé français sur une ligne** (`inline-flex`, gap `0.35rem`) ; icône `aria-hidden="true"`. |
| **PT6** | **Tokens M3 uniquement** — pas de `rgba(255,255,255,0.1)`, pas de hex ad hoc sur les features. |
| **PT7** | **Mixin obligatoire** — `@include pill-tabs.group()` ou `@include pill-tabs.nav-bar()` depuis `_hatcast-pill-tab-bar.scss`. |
| **PT8** | **Centrage** configurable : `group($centered: true)` pour barres courtes (détail spectacle) ; `false` pour barres pleine largeur (Mon compte, paramètres troupe). |
| **PT9** | **Espacement contenu** sous la barre (détail spectacle) : conserver **E11** — `padding-top: 1.5rem` sur `.mat-mdc-tab-body-content` ([ux-design-event-detail-title-row-2026-06-06.md](./ux-design-event-detail-title-row-2026-06-06.md)). |
| **PT10** | **Hors périmètre** — nav membre (`member-nav` rail / bottom bar), switcher saison (Agenda · Historique · Stats), segmented controls (`mat-button-toggle`), chips rôles : **autres patterns** — ne pas forcer ce mixin. |

---

## Anatomie

```
┌─────────────────────────────────────────────────────────────┐
│  surface-container-high — border-radius 999px — pad 0.25rem │
│  ┌──────────┐ ┌─────────────────┐ ┌──────────┐              │
│  │  inactif │ │ ACTIF           │ │  inactif │              │
│  │  variant │ │ primary-container│ │  variant │              │
│  └──────────┘ └─────────────────┘ └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

| Zone | Token / règle | Valeur impl. |
|------|----------------|--------------|
| Coque | `--mat-sys-surface-container-high` | `@mixin pill-tab-header-shell` |
| Gap entre onglets | — | `0.125rem` |
| Onglet — hauteur min. | tactile | `2.5rem` (40 dp — waiver documenté : barre compacte ; ripple Material complète la zone) |
| Onglet — largeur min. | lisibilité | `5.5rem` (Mon compte mobile scroll : `3rem` — voir § Surfaces) |
| Onglet — coins | — | `border-radius: 999px` (+ ripple arrondi) |
| Actif — fond | `--mat-sys-primary-container` | `@mixin pill-tab-item-active` |
| Actif — texte/icône | `--mat-sys-on-primary-container` | idem |
| Inactif — texte | `--mat-sys-on-surface-variant` | `@mixin pill-tab-item-base` |

---

## Variantes mixin

| Mixin | Composant Angular | Usage |
|-------|-------------------|--------|
| `pill-tabs.group($centered: true)` | `mat-tab-group` | Contenu onglets embarqué ; header centré si `$centered: true` |
| `pill-tabs.nav-bar($centered: false)` | `mat-tab-nav-bar` | Routes enfants (`mat-tab-link` + `routerLinkActive`) |

**Import type :**

```scss
@use '../../../styles/hatcast-pill-tab-bar' as pill-tabs;

.my-page__tabs {
  @include pill-tabs.group(); // ou nav-bar()
}
```

---

## Surfaces livrées (2026-06-09)

| Surface | Fichier SCSS | Mixin | Centré | Notes |
|---------|--------------|-------|--------|-------|
| **Détail spectacle** | [`event-detail.scss`](../../apps/web/src/app/pages/event-detail/event-detail.scss) | `group()` | oui | Shell `event-detail__tabs-shell` flex center ; onglets Infos · Dispos · Équipe · Activité |
| **Mon compte** | [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss) | `nav-bar()` | non | 4 onglets ; scroll horizontal ≤ 480 px ; icônes C13 |
| **Paramètres troupe** | [`troupe-settings.scss`](../../apps/web/src/app/pages/troupe-settings/troupe-settings.scss) | `group($centered: false)` | non | Shell prêt pour onglets futurs (Catégories MVP) |

### Icônes — détail spectacle

| Onglet | `mat-icon` | Spec complémentaire |
|--------|------------|---------------------|
| Infos | `info` | — |
| Dispos | `ballot` | [ux-design-dispos-poll D22](./ux-design-dispos-poll-2026-06-09.md) |
| Équipe | `groups` | — |
| Activité | `history` | [ux-design-audit-journal-9-1.md](./ux-design-audit-journal-9-1.md) |

### Mon compte — mobile (≤ 480 px)

Conserve les règles [ux-design-mon-compte.md](./ux-design-mon-compte.md) **C13** + scroll :

- `overflow-x: auto` sur `.account-page__tabs`
- `min-width: 3rem` / `min-height: 3rem` sur `.mat-mdc-tab-link` (waiver tactile local — barre scrollable, libellés visibles)

---

## Anti-patterns (régression)

| Éviter | Faire à la place |
|--------|------------------|
| Pastilles sans coque externe | Coque `surface-container-high` + pastille active interne |
| `opacity: 0.75` sur onglets inactifs | Couleur `on-surface-variant` à opacité 1 |
| `background: rgba(255,255,255,0.1)` sur actif | `--mat-sys-primary-container` |
| Styles tab dupliqués par page | Mixin `_hatcast-pill-tab-bar.scss` |
| Soulignement Material visible | `.mdc-tab-indicator { display: none }` (dans le mixin) |
| Appliquer à `member-nav` | Garder le chrome hub existant ([ux-hub-a-faire.md](./ux-hub-a-faire.md)) |
| Onglet icône seule | Icône + libellé français (sauf waiver documenté ailleurs) |

---

## Acceptance criteria — garde-fous régression

### Visuel & tokens

- [ ] **PT-AC-01** Coque capsule visible autour de **tous** les onglets (fond distinct du `surface` page).
- [ ] **PT-AC-02** Onglet actif : fond `primary-container`, texte/icône `on-primary-container`.
- [ ] **PT-AC-03** Onglets inactifs : pas de fond pill individuel ; couleur `on-surface-variant`.
- [ ] **PT-AC-04** Aucun indicateur souligné Material sous les labels.
- [ ] **PT-AC-05** Aucune couleur hex/rgb ad hoc sur la barre (audit SCSS feature).

### Implémentation

- [ ] **PT-AC-06** Nouvelle barre d’onglets page → `@use` + `@include` depuis `_hatcast-pill-tab-bar.scss`.
- [ ] **PT-AC-07** Détail spectacle : barre **centrée** ; `padding-top: 1.5rem` sous la barre (E11).
- [ ] **PT-AC-08** Mon compte : 4 liens avec icônes C13 ; scroll horizontal mobile conservé.

### Revue story UI

- [ ] **PT-AC-09** Story touchant une barre d’onglets : référencer ce doc en Dev Notes ou AC M3 ; parcourir checklist FRONTEND_UI § barre capsule.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants** — `mat-tab-group` ou `mat-tab-nav-bar` + `mat-tab-link` ; pas de barre HTML custom.

**M3-2. Tokens** — PT1–PT3 ; mixin partagé.

**M3-3. Mobile** — Mon compte scroll ; détail spectacle centré ≤ 480 px sans chevauchement icône/label.

**M3-4. Nav membre** — **N/A** pour ce pattern (PT10).

**M3-5. Revue** — PT-AC-01 … PT-AC-09 + checklist FRONTEND_UI.

---

## Explicit non-goals

- Refonte de la navigation membre (rail / shortcuts bas).
- Switcher vue saison (Agenda / Historique / Statistiques) — pattern distinct.
- Segmented controls formulaire (`mat-button-toggle`, Moi/Tous historique Dispos).
- Animation de glissement entre onglets (Material default indicator) — remplacée par pastille statique.

---

## Revision history

| Date | Auteur | Change |
|------|--------|--------|
| 2026-06-09 | Sally + Paige + Patrice | Spec initiale post-preview ; mixin `_hatcast-pill-tab-bar.scss` ; surfaces event-detail, compte, troupe-settings |
