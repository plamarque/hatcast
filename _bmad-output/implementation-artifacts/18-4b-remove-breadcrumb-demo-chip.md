# Story 18.4b: Retirer le chip « Démo » du fil d'Ariane

Status: done

<!-- UX refinement post–Story 18.4 (2026-06-04). Le chip `mat-chip` à côté du nom « Démo » est redondant et alourdit le chrome. -->

## Story

En tant que **membre dans la troupe Démo**,  
je veux un **fil d'Ariane épuré** sans badge répétitif,  
afin de **me repérer sans bruit visuel** tout en comprenant toujours que je suis dans le bac à sable.

## Acceptance Criteria

1. **Given** contexte troupe Démo (`isDemo === true`, nom affiché « Démo »), **when** le membre consulte une surface avec `app-context-breadcrumb` (saison, spectacle, admin feuille), **then** le fil d'Ariane affiche **uniquement** le nom de troupe (logo + « Démo ») — **pas** de `mat-chip` « Démo » adjacent (desktop ni mobile). [Source: amendement 18.4 AC3 ; revue UX Patrice 2026-06-04]
2. **Given** le chip retiré, **when** le statut bac à sable doit rester explicite, **then** il est porté par les surfaces **déjà livrées** : bandeau hub *« Bac à sable — crée ta troupe quand tu es prêt·e »* (`troupe-hub`), suffixe **« (Démo) »** dans le menu `context-switcher`, et nom de troupe « Démo » dans le fil d'Ariane. [Source: 18.4 AC3 ; epics 18.4 AC3]
3. **Given** `troupeIsDemo` n'est plus consommé par le breadcrumb, **when** implémentation terminée, **then** l'input `troupeIsDemo` et son câblage (`season-header`, `event-detail-header`, `season-home`, `event-detail`) sont **supprimés** ; `troupeAriaLabel` ne répète plus « troupe Démo » lorsque le nom visible suffit. [Source: simplification composant]
4. **Given** smoke post-deploy Epic 18 (NFR-R1), **when** opérateur valide le join Démo, **then** la checklist vérifie le fil d'Ariane **« Démo › Saison 2026-2027 »** (sans chip), pas un badge séparé. [Source: 18.5 AC6 ; DEPLOY_V2_CLOUD_RUN.md]
5. **Couverture :** amendement FR64 affordances sandbox ; surfaces `context-breadcrumb`, docs deploy. **Hors scope :** switcher `(Démo)`, hub hint, join flow — inchangés.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** retrait du chip, **when** breadcrumb rendu, **then** pas de `mat-chip` orphelin ; retirer `MatChipsModule` de `context-breadcrumb` si plus utilisé. [Source: FRONTEND_UI.md]

**M3-2. Tokens & thème** — **Given** styles chip supprimés, **when** SCSS nettoyé, **then** retirer `.context-breadcrumb__demo-chip*` ; pas de régression sur tokens existants du trail. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** breadcrumb mobile (logo seul + titre saison), **then** pas de chip à côté du logo ; `aria-label` du lien troupe reste en **français** avec nom + segments contexte (`Troupe : Démo, Saison 2026-2027`). [Source: 17.1 ; NFR-A1]

**M3-4. Navigation membre** — **Given** chrome header inchangé, **when** story appliquée, **then** top app bar M3 seulement — pas de nouveau pattern nav. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implémentation terminée, **when** validée, **then** checklist M3 parcourue ; waivers notés ci-dessous si besoin.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + docs deploy uniquement.
- [x] [`context-breadcrumb.html`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html) : retirer blocs `@if (troupeIsDemo())` desktop + mobile.
- [x] [`context-breadcrumb.ts`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts) : supprimer input `troupeIsDemo`, simplifier `troupeAriaLabel`, retirer `MatChipsModule`.
- [x] [`context-breadcrumb.scss`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.scss) : supprimer styles `.context-breadcrumb__demo-chip*`.
- [x] [`season-header.ts|html`](../../apps/web/src/app/pages/season-home/season-header.ts), [`event-detail-header.ts|html`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts), [`season-home.ts|html`](../../apps/web/src/app/pages/season-home/season-home.ts), [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) : retirer prop/signal `troupeIsDemo` et bindings.
- [x] [`context-breadcrumb.spec.ts`](../../apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts) : remplacer test chip par assertion absence chip + aria-label sans duplication « troupe Démo ».
- [x] [`DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) § Post-deploy smoke : « fil d'Ariane Démo › saison » sans chip.
- [x] Run `npm run test -w @hatcast/web -- --watch=false` (context-breadcrumb specs minimum).

---

## Dev Notes

### Décision UX (Sally, 2026-06-04)

| Surface | Rôle sandbox | Action |
|---------|--------------|--------|
| **Fil d'Ariane** | Wayfinding | Nom « Démo » suffit — **retirer chip** |
| **Hub troupe** | Explication bac à sable | **Conserver** bandeau hint |
| **Context switcher** | Désambiguïsation multi-troupes | **Conserver** suffixe `(Démo)` |

### Amendement Story 18.4

L'AC3 détaillé et la tâche « Demo badge & copy » de [18-4-ux-onboarding-rejoindre-demo.md](./18-4-ux-onboarding-rejoindre-demo.md) restent valides pour hub + switcher ; la ligne **« `context-breadcrumb` `mat-chip` »** du tableau *Badge placement* est **supersédée** par cette story.

### Explicit non-goals

- Pas de nouveau badge ailleurs pour compenser.
- Pas de changement backend / `is_demo`.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 18.4 | done | Source du chip retiré |
| 17.1 | done | Breadcrumb layout mobile |
| 18.5 | done | Smoke runbook à aligner |

## Dev Agent Record

### Agent Model Used

Claude (Cursor agent)

### Completion Notes List

- Chip « Démo » retiré du breadcrumb desktop et mobile ; `MatChipsModule` et styles associés supprimés.
- Câblage `troupeIsDemo` retiré de season-home, event-detail et headers intermédiaires.
- Hub hint et suffixe switcher `(Démo)` inchangés.
- Test unitaire mis à jour ; 6 échecs préexistants sur hrefs saison (format `/saison/:troupeSlug/:seasonSlug`) non liés à cette story.

### File List

- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.scss
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/event-detail/event-detail-header.ts
- apps/web/src/app/pages/event-detail/event-detail-header.html
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md
- _bmad-output/implementation-artifacts/18-4-ux-onboarding-rejoindre-demo.md
- _bmad-output/implementation-artifacts/18-5-configuration-prod-tests-separation-demo.md
- _bmad-output/implementation-artifacts/18-4b-remove-breadcrumb-demo-chip.md
