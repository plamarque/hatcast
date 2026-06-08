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

**UI : N/A** — pas de changement visuel ; correction comportementale du dialog existant (déjà M3).

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` uniquement — pas de changement API
- [x] Retirer `detectTemplateFromRoles` de `onRoleCountChange` dans `event-type-roles-dialog.ts`
- [x] Test `event-type-roles-dialog.spec.ts` : personnalisation match → `templateType` reste `match`
- [x] Vérifier `event-infos-tab.spec.ts` — pas de changement requis (dialog result déjà testé)
- [x] Clôturer DW-103 dans `deferred-work-archive.md`
- [x] Mettre à jour `sprint-status.yaml`

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

- SCP 2026-06-08 approuvé par Patrice.
- Retrait de `detectTemplateFromRoles` dans `onRoleCountChange` ; format stable lors de la personnalisation.
- Tests dialog : 6/6 verts (`ng test --include='**/event-type-roles-dialog.spec.ts'`).

### File List

- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts`
- `apps/web/src/app/pages/event-detail/event-type-roles-dialog.spec.ts`
