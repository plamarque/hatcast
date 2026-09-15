---
feature_branch: feat/19-20-ui-admin-politiques-tirage
baseline_commit: f3ba26c025f14c72b0d637612242f0c5a9670f9c
---

# Story 19.20 : UI admin — imposer une formule par catégorie (Appliquée à)

Status: done

**UX baseline (normatif, PO 2026-09-15) :** [_memlog.md](../planning-artifacts/ux-designs/ux-hatcast-2026-09-15/.memlog.md) · maquette [_key-politiques-tirage-troupe.html](../planning-artifacts/ux-designs/ux-hatcast-2026-09-15/.working/key-politiques-tirage-troupe.html)

**Spec BMad :** [spec-19-20-ui-admin-politiques-tirage.md](./spec-19-20-ui-admin-politiques-tirage.md)

**Périmètre réduit (Patrice 2026-09-15) :** pas le 3ᵉ onglet Politiques ni les AC epics 19.20 #1–#4 (écran politique, CHOICE, bandeau saison). Surface = onglet Formules existant.

## Story

En tant qu’**admin troupe**,  
je veux **imposer une formule de tirage à tous les spectacles d’une catégorie**,  
afin de **ne pas choisir la formule à chaque tirage**.

## Acceptance Criteria

1. **Given** un `TROUPE_ADMIN` sur `/troupes/:slug/admin/parametres?tab=formulas`, **when** la liste est chargée, **then** chaque formule **publiée** non système affiche une ligne **Appliquée à** avec puces des catégories assignées et **+ Catégorie**. [Source: memlog 2026-09-15]
2. **Given** la formule V1 système, **when** affichée, **then** **Appliquée à** est le texte **le reste (spectacles ordinaires et catégories sans formule)** — pas de puces, pas dans le menu. [Source: maquette]
3. **Given** **+ Catégorie**, **when** le `mat-menu` s’ouvre, **then** il liste les catégories du glossaire troupe encore libres (pas déjà collées à une autre formule, pas `principal` / spectacles ordinaires). Pas de frappe, pas d’autocomplete, pas de création. [Source: memlog ; anti-pattern 17.39]
4. **Given** un tap sur une entrée du menu, **when** l’API réussit, **then** la puce apparaît tout de suite et `PUT /v1/troupes/{troupeId}/draw-policy` persiste une règle `MANDATORY` + `mandatoryFormulaId` pour ce slug. [Source: 19.18]
5. **Given** × sur une puce, **when** l’API réussit, **then** l’assignation est retirée ; la catégorie rebascule sur le fallback V1 (`defaultRule` inchangé). [Source: memlog]
6. **Given** une catégorie, **when** une formule est imposée, **then** elle n’apparaît plus dans les autres menus (une catégorie = au plus une formule imposée). [Source: memlog]
7. **Given** brouillon ou archivée, **when** listée, **then** pas de ligne **Appliquée à** éditable. [Source: user 2026-09-15 — tranche simple]
8. **Given** intro Formules, **when** affichée, **then** plus de « les politiques seront configurées ensuite » ; phrase d’assignation par catégorie (maquette). [Source: maquette]
9. **Given** spectacle dont la catégorie a une formule `MANDATORY`, **when** orga ouvre Équipe, **then** pas de menu formule (déjà **19.21** / résolution effective). [Source: epics 19.20 AC5]
10. **Given** GET politique **404**, **when** l’onglet charge, **then** `categoryRules` vides ; copy V1 « le reste » affichée.

**Couverture produit :** UX-DR11 ; 19.18 runtime ; 19.19c liste formules. **Hors scope :** politique saison, CHOICE multi-formules, imposer une formule custom aux spectacles ordinaires, 3ᵉ onglet.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** l’UI Appliquée à, **when** chips / menu / actions, **then** `mat-chip` (retrait), `mat-menu` / `mat-menu-item`, `mat-button` ou `mat-stroked-button` pour **+ Catégorie** — pas de `<button>` custom pour le même rôle. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** SCSS de l’onglet, **when** couleurs, **then** uniquement `var(--mat-sys-*)` / `color-mix`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport max-width 480px, **when** puces et **+ Catégorie**, **then** cibles ≥ 48×48 dp (ou ≥ 40×40 justifié) ; `aria-label` FR sur × si le seul texte visible est l’icône. [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** — pas de chrome hub.

**M3-5. Revue** — checklist M3 FRONTEND_UI.md parcourue ; écarts notés en Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` (API 19.18 déjà là)
- [x] GET/PUT troupe sur `DrawPolicyApiService` (AC 4–5, 10)
- [x] UI invert + persist sur `TroupeDrawFormulasTab` (AC 1–8, M3-1–3)
- [x] Tests unit + E2E si pattern 19.19c (AC 1–6)
- [x] Vérifier Équipe MANDATORY (AC 9)
- [x] `sprint-status.yaml`

## Dev Notes

### Product and UX rules

- Inverser la politique côté UI ; pas de binding sur le CRUD formules.
- PUT = document complet ; conserver `defaultRule`.
- Menu : glossaire `listCategories` ; exclure slugs déjà dans `categoryRules` et `principal`.

### Explicit non-goals

- 3ᵉ onglet Politiques ; CHOICE ; politique saison ; créer une catégorie ici.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 19.18 | done | GET/PUT / validation |
| 19.19c | done | Onglet Formules |
| 19.21 | done | Masquer menu Équipe si MANDATORY |

## Dev Agent Record

### Agent Model Used

Cursor Grok 4.6 (bmad-build step-03)

### Completion Notes List

- Appliquée à on Formules tab: invert GET `categoryRules`, persist-on-tap MANDATORY PUT, V1 rest-copy, no third tab.
- GET troupe 404 → empty rules + implicit CHOICE `defaultRule` (published + system ids).
- Checklist M3: `mat-chip` + `matChipRemove` + `mat-menu`; tokens `--mat-sys-*`; + Catégorie 48 dp ; × 40 dp (`min` 2.5rem).
- Code review 2026-09-15 : puces Material, cibles tactiles, CHOICE non occupant, loadError glossaire, tests GET 200/5xx, `defaultRule` unassign, `saving` + `finally`.
- Equipe unchanged; existing 19.21 `selectorVisible: false` tests still pass.
- PLAN.md has no 19.20 status line.

### File List

- `apps/web/src/app/core/draw/draw-policy-api.service.ts`
- `apps/web/src/app/core/draw/draw-policy-api.service.spec.ts`
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.ts`
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html`
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.scss`
- `apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.spec.ts`
- `apps/web/src/app/pages/troupe-settings/troupe-settings.spec.ts`
- `apps/web/e2e/helpers/story-19-19c.ui.ts`
- `apps/web/e2e/recette-19-20.spec.ts`
- `apps/web/playwright.config.ts`
- `_bmad-output/implementation-artifacts/spec-19-20-ui-admin-politiques-tirage.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-09-15 : draft from reduced UX (Patrice)
- 2026-09-15 : implement Appliquée à + troupe draw-policy client
- 2026-09-15 : code review patches (mat-chip, tactile, CHOICE menu, tests)
- 2026-09-15 : re-run review patches (policyLoadWarning block, MANDATORY-only unassign, tests CSRF/E2E unassign)

### Review Findings

- [x] [Review][Patch] Puces Appliquée à en `mat-chip` + `matChipRemove` [troupe-draw-formulas-tab.html:82]
- [x] [Review][Patch] Cibles tactiles + Catégorie 48 dp et × ≥40 dp [troupe-draw-formulas-tab.scss:180]
- [x] [Review][Patch] Slugs CHOICE existants ne doivent pas occulter le menu [troupe-draw-formulas-tab.ts:49]
- [x] [Review][Patch] Échec `listCategories` → `loadError` [troupe-draw-formulas-tab.ts:286]
- [x] [Review][Patch] Tests GET troupe 200/5xx + `loadError` onglet [draw-policy-api.service.spec.ts]
- [x] [Review][Patch] Assert `defaultRule` inchangé sur PUT unassign [troupe-draw-formulas-tab.spec.ts]
- [x] [Review][Patch] Désactiver persist pendant `saving` + `finally` [troupe-draw-formulas-tab.ts:247]
- [x] [Review][Patch] `categoryRules` défensif si absent [troupe-draw-formulas-tab.ts:84]
- [x] [Review][Patch] Code Map chemins `troupes/` et `event-category.constants` [spec-19-20-ui-admin-politiques-tirage.md]

### Review Findings — Re-run 2026-09-15 (post Bugbot)

**Résolu depuis la 1ʳᵉ revue :** mat-chip Appliquée à, ordre `allowedFormulaIds` (publiées asc + V1), dégradation GET politique (404/5xx), tests GET 200/500, `defaultRule` unassign.

- [x] [Review][Patch] Bloquer assign/unassign si `policyLoadWarning` (risque écrasement PUT) [troupe-draw-formulas-tab.ts:241]
- [x] [Review][Patch] `withoutCategoryRule` ne retire que les règles `MANDATORY` [troupe-draw-formulas-tab.ts:103]
- [x] [Review][Patch] Test CSRF sur `putTroupeDrawPolicy` [draw-policy-api.service.spec.ts]
- [x] [Review][Patch] Assert `defaultRule.allowedFormulaIds` complet au 1er assign (404) [troupe-draw-formulas-tab.spec.ts]
- [x] [Review][Patch] Assert disparition puce DOM après unassign [troupe-draw-formulas-tab.spec.ts]
- [x] [Review][Patch] Test garde `saving()` (un seul PUT) [troupe-draw-formulas-tab.spec.ts]
- [x] [Review][Patch] E2E unassign × + GET policy vide [recette-19-20.spec.ts]
- [x] [Review][Patch] Sync spec `status: done` [spec-19-20-ui-admin-politiques-tirage.md]

- [x] [Review][Defer] E2E AC9 Formules→Équipe — couverture 19.21 existante (`event-equipe-tab.spec.ts`, `draw-formula-choice.spec.ts`) — deferred, hors diff 19.20
- [x] [Review][Defer] Note UX maquette (footnote catégorie unique) — deferred, non AC
- [x] [Review][Defer] `defaultRule` non realigné après publish formule — deferred, follow-up
- [x] [Review][Dismiss] Badges statut en `<span>` vs `mat-chip` — aligné maquette HTML
- [x] [Review][Dismiss] « + Catégorie » masqué quand glossaire saturé — comportement spec (catégories libres uniquement)
