# Story 17.37 : Détail spectacle — rangée titre + statut

Status: done

<!-- Shipped 2026-06-06 — UX amendment après tests mobile ; fige E7–E11 pour revues futures -->

## Story

En tant que **membre ou organisateur** sur le détail d’un spectacle,  
je veux **voir le titre du spectacle lisiblement à côté du statut de composition**, sans qu’il soit tronqué dans le fil d’Ariane ni répété dans l’onglet Infos,  
afin de **m’orienter immédiatement** sur mobile et desktop.

## Acceptance Criteria

1. **Given** un spectacle chargé sur `/saison/:slug/event/:eventSlug`, **when** le chrome s’affiche, **then** le fil d’Ariane contient **troupe + saison uniquement** (pas de titre spectacle) sur desktop et mobile ; la saison reste cliquable vers le workspace. [Source: [ux-design-event-detail-title-row-2026-06-06.md](../planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md) E8 ; amendement 17.1]
2. **Given** le spectacle chargé, **when** le contenu principal s’affiche, **then** une rangée `event-detail__context-row` au-dessus des onglets montre le **titre** (`h1`, `aria-current="page"`) à gauche et le **badge statut composition** + picto d’aide à droite (si statut disponible). [Source: E7, E9]
3. **Given** le panneau d’aide statut ouvert, **when** rendu, **then** il s’affiche en pleine largeur sous la rangée titre + badge. [Source: E9]
4. **Given** une bannière brouillon composition visible, **when** rendue, **then** elle occupe la ligne au-dessus du titre + badge sans chevauchement. [Source: E9]
5. **Given** l’onglet **Infos**, **when** affiché, **then** il n’y a **pas** de champ « Titre » ; la description n’a **pas** de libellé de section et le bloc est **absent** si `description` vide ou blanc ; le badge statut n’est **pas** dans l’onglet. [Source: E10]
6. **Given** n’importe quel onglet, **when** le corps de l’onglet s’affiche, **then** un espacement **≥ 1.5rem** sépare la barre d’onglets du premier contenu. [Source: E11]
7. **Given** chargement, échec résolveur ou spectacle introuvable, **when** la page réagit, **then** la rangée titre n’apparaît pas ; le gear header et les règles E1–E3 de [ux-design-event-detail-chrome-alignment.md](../planning-artifacts/ux-design-event-detail-chrome-alignment.md) restent inchangées. [Source: chrome alignment E1–E3]
8. **Given** une sous-page admin spectacle (ex. Participants), **when** le breadcrumb event layout s’affiche, **then** le titre spectacle **reste** dans le fil (pattern `mobileOmitLeaf` / leaf admin) — **hors** périmètre omit. [Source: 17.11 ; admin-event-participants]
9. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` cible les specs touchées, **then** les tests passent pour breadcrumb omit, context row, Infos description. [Source: repo norms]

**Couverture produit :** [ux-design-event-detail-title-row-2026-06-06.md](../planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md) E7–E11 ; [ux-design-journey-league-agenda.md](../planning-artifacts/ux-design-journey-league-agenda.md) Screen 6.

**Depends on:** **17.1** (breadcrumb), **17.2** (gear header), chrome alignment **E1–E3** (2026-05-31).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Badge statut et aide via `app-composition-equipe-status-header` (`mat-icon-button`, `mat-icon` help_outline) ; onglets `mat-tab-group` inchangés. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — Styles dans `event-detail.scss`, `composition-equipe-status-header.scss` : `var(--mat-sys-*)` / `color-mix` uniquement. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — Titre lisible avec retour à la ligne ; picto aide ≥ 40×40 dp (`composition-equipe-status__help`) ; breadcrumb mobile logo-only + saison. [Source: FRONTEND_UI.md ; E7–E8]

**M3-4. Navigation membre** — Pas de bottom app bar M2 ; gear dans `event-detail-header` breadcrumb row (E1–E2 inchangé). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — Checklist M3 parcourue ; spec [ux-design-event-detail-title-row-2026-06-06.md](../planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md) référencée dans FRONTEND_UI.md. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Breadcrumb** (AC: 1, 8)
  - [x] `omitEventFromBreadcrumb` sur `app-context-breadcrumb` (desktop trail + mobile row)
  - [x] `event-detail-header.html` — `[omitEventFromBreadcrumb]="true"`

- [x] **Title row** (AC: 2, 3, 4)
  - [x] `event-detail__context-row` + `event-detail__event-title` (`h1`)
  - [x] `inlineInEventContext` sur `app-composition-equipe-status-header`
  - [x] Grille CSS + `display: contents` pour panneau aide pleine largeur

- [x] **Infos tab** (AC: 5)
  - [x] Retrait champ Titre ; description conditionnelle sans label

- [x] **Tabs spacing** (AC: 6)
  - [x] `padding-top: 1.5rem` sur `.mat-mdc-tab-body-content`

- [x] **Docs UX** (AC: product)
  - [x] `ux-design-event-detail-title-row-2026-06-06.md`
  - [x] Amendements journey Screen 6, scope admin Screen 2, chrome alignment, 17.1 change log, FRONTEND_UI.md

- [x] **Tests** (AC: 9)
  - [x] `context-breadcrumb.spec.ts`, `event-detail.spec.ts`, `event-infos-tab.spec.ts`

---

## Dev Notes

### Product and UX rules

- **Supersède partiellement** [ux-design-event-detail-chrome-alignment.md](../planning-artifacts/ux-design-event-detail-chrome-alignment.md) **E4–E6** (titre dans breadcrumb, badge centré Infos).
- **Ne pas régresser** E1–E3 : gear header toutes tabs ; pas de ⋮ agenda.
- **Admin event sub-pages** : conserver titre spectacle dans breadcrumb (`omitEventFromBreadcrumb` **false** par défaut).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Breadcrumb | `omitEventFromBreadcrumb` input — **ne pas** confondre avec `mobileOmitLeaf` |
| Title row | `event-detail.html` — une seule instance status header (pas deux onglets) |
| Infos | Pas de placeholder « Non renseignée » pour description vide |
| Réutilisation | Pattern proche `admin-event-participants__mobile-context` mais unifié tous breakpoints |

### Explicit non-goals

- Changer le breadcrumb **workspace saison** (saison reste feuille)
- Modifier SPEC.md section legacy V1 modal
- Renommer classes BEM `event-detail__*` (déjà shipées)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.1** | done | Breadcrumb composant ; AC2 historique amendé pour détail spectacle |
| **17.2** | done | Gear `app-scope-admin-menu` |
| Chrome alignment | approved | E1–E3 toujours valides |

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor) — session 2026-06-06

### Completion Notes List

- Titre sorti du breadcrumb (mobile + desktop) ; rangée titre + badge au-dessus des onglets.
- Infos allégé : pas de titre redondant ; description optionnelle sans label.
- Input renommé `mobileOmitEvent` → `omitEventFromBreadcrumb` pour clarté API.
- Spec UX et story 17.37 figent le comportement pour revues futures.

### File List

- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts
- apps/web/src/app/pages/event-detail/event-detail-header.html
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail.scss
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.html
- apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts
- apps/web/src/app/shared/composition/composition-equipe-status-header.ts
- apps/web/src/app/shared/composition/composition-equipe-status-header.scss
- _bmad-output/planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md
- _bmad-output/planning-artifacts/ux-design-event-detail-chrome-alignment.md
- _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
- _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
- _bmad-output/implementation-artifacts/17-1-breadcrumb-contexte-responsive.md
- docs/v2/technical/FRONTEND_UI.md

### Change Log

- 2026-06-06 : Story 17.37 — title row, breadcrumb omit, Infos cleanup, rename `omitEventFromBreadcrumb`, docs UX.
