# Story 17.37 : Format stable lors de la personnalisation des rôles

Status: done

**Sprint Change Proposal:** [_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-format-stable-role-customization.md](../planning-artifacts/sprint-change-proposal-2026-06-08-format-stable-role-customization.md) (approved 2026-06-08)

## Story

En tant qu'**organisateur**,  
je veux **personnaliser les effectifs par rôle sans changer le format du spectacle**,  
afin qu'**un Match à 4 joueurs ou sans coach reste un Match** (icône, stats, sémantique).

## Acceptance Criteria

1. **Given** un spectacle avec `templateType = match`, **when** l'organisateur modifie les compteurs de rôles dans `EventTypeRolesDialog` sans changer le sélecteur Format, **then** l'enregistrement persiste `templateType = match` et les `roleSlots` mis à jour. [Source: SCP 2026-06-08 ; DOMAIN.md Format]
2. **Given** le sélecteur Format, **when** l'organisateur choisit un autre format et confirme l'écrasement, **then** `templateType` et les slots preset sont mis à jour (comportement inchangé). [Source: story 17.14]
3. **Given** ouverture du dialog, **when** initialisé depuis l'API, **then** `templateType` API est prioritaire ; `detectTemplateFromRoles` sert **uniquement** de fallback si la valeur API n'est pas un `EventTypeId` connu. [Source: amendement 17.14 AC3]
4. **Given** tests, **when** `npm run test -w @hatcast/web -- --watch=false`, **then** nouveaux specs passent et régressions 17.14 / event-infos-tab restent vertes. [Source: repo norms]
5. **Given** DW-103, **when** story done, **then** entrée résolue dans `deferred-work-archive.md`. [Source: SCP §4.4]

**Couverture produit :** FR14 ; amendement 17.14 ; clôture DW-103

---

## Acceptance Criteria — Material 3 (UI)

**M3-1** — `mat-dialog`, `mat-form-field`, `mat-select`, `mat-spinner` (Infos tab), chips custom avec boutons natifs ± (pas de div cliquable custom).  
**M3-2** — tokens `--mat-sys-*` / `color-mix` dans `role-slot-chip-set` et dialog SCSS.  
**M3-3** — stepper 40×40 px ; libellés français ; 1 colonne mobile pour lisibilité.  
**M3-5** — revue faite ; scroll parasite dialog corrigé (`overflow: visible`, wrapper interne).

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + artefacts BMad (SCP, DOMAIN, DW-103) — pas de changement API
- [x] Retirer `detectTemplateFromRoles` de `onRoleCountChange` dans `event-type-roles-dialog.ts`
- [x] Test `event-type-roles-dialog.spec.ts` : personnalisation match → `templateType` reste `match`
- [x] Vérifier `event-infos-tab.spec.ts` — spinner `savingTypeRoles` (commit `e703888b`, prérequis UX)
- [x] Ajouter `RoleSlotChipSet` — chips + stepper compact ; remplacer grille `mat-form-field`
- [x] Corriger overflow dialog (scroll horizontal/vertical parasite, libellé Format masqué)
- [x] Clôturer DW-103 dans `deferred-work-archive.md`
- [x] Amendement AC3 story 17.14
- [x] Mettre à jour `sprint-status.yaml` → **done**

## Dev Notes

### Product and UX rules

- **Format (`templateType`)** = identité du spectacle ; **ne change pas** lors d'une personnalisation des slots.
- **Slots (`roleSlots`)** = besoins effectifs de ce spectacle ; peuvent diverger du preset.
- Données existantes `template_type = custom` avec slots « match-like » : pas de backfill automatique.

### Explicit non-goals

- Pas de migration Flyway ni script ops de correction des formats.
- Pas de badge UI « personnalisé » sur le résumé des rôles (hors scope).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 17.14 | done | AC3 amendé par SCP |
| 3.22 | done | DW-103 résolu |
| 3.4 | done | Clarification format vs slots |

## Dev Agent Record

### Agent Model Used

Composer (Correct Course handoff)

### Completion Notes List

- SCP 2026-06-08 approuvé par Patrice ; story **done** 2026-06-08.
- Retrait de `detectTemplateFromRoles` sur édition des slots ; `templateType` stable.
- `RoleSlotChipSet` : édition compacte mobile-first (1 col. sous 36rem).
- Spinner Infos tab pendant PATCH : livré en prérequis (`e703888b`).
- Tests : `event-type-roles-dialog.spec.ts` 6/6 ; `role-slot-chip-set.spec.ts` 3/3.
- Commit : `e1b82dff` — `feat(web): Stabilize format role slot dialog UX`.

### File List

- `DOMAIN.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-format-stable-role-customization.md`
- `_bmad-output/implementation-artifacts/17-14-onglet-infos-type-roles-modales.md` (AC3 amendé)
- `_bmad-output/implementation-artifacts/deferred-work-archive.md` (DW-103 résolu)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts`
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.html`
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.scss`
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.spec.ts`
- `apps/web/src/app/shared/event-roles/role-slot-chip-set/*`
