---
title: 'Preferred roles — toggle chip set'
type: 'feature'
created: '2026-06-08'
status: 'done'
baseline_commit: 'b121066b6875be1e4bbdce17e508d33dfc9f709f'
context:
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The account Preferences tab lists nine preferred roles in a single-column checkbox grid, wasting horizontal space and forcing excessive vertical scroll on mobile.

**Approach:** Introduce a shared `RoleToggleChipSet` component (`mat-chip` + `[highlighted]` toggle pattern, aligned with admin membres filters) and adopt it on `MemberPreferencesForm`. Document the pattern for future unification with other role chip surfaces.

## Boundaries & Constraints

**Always:** M3 tokens only; French UI copy; `volunteer` stays non-deselectable (V1 parity via `canDisablePreferredRole`); no API changes; mobile-first wrap layout; touch targets ≥ 44 dp on chips.

**Ask First:** Migrating availability form or member-profile panel to chips (deferred).

**Never:** Tailwind as primary styling; new bottom navigation; changing preferred-roles API contract; removing save button (explicit save retained).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | User toggles role chips and taps Enregistrer | PATCH `/v1/me/preferences` with updated `preferredRoleKeys`; success snack | N/A |
| LOCKED_VOLUNTEER | User taps Bénévole chip | Selection unchanged; optional tooltip | N/A |
| LOAD_FAIL | GET preferences fails | Save disabled; error snack | Existing behavior |
| PATCH_FAIL | PATCH fails | Error snack; local selection unchanged until reload | Existing behavior |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/shared/event-roles/role-toggle-chip-set/` -- new shared toggle chip set for event roles (emoji + inclusive label)
- `apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts` -- adopt chip set; compact layout; full-width save on mobile
- `apps/web/src/app/shared/member-preferences-form/member-preferences-form.spec.ts` -- chip interaction tests
- `_bmad-output/planning-artifacts/ux-design-role-toggle-chips.md` -- normative UX pattern (when to use, a11y, future unification)
- `docs/v2/technical/FRONTEND_UI.md` -- link pattern in code references
- `_bmad-output/planning-artifacts/ux-design-mon-compte.md` -- amend C2b (chips not checkbox grid)

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/shared/event-roles/role-toggle-chip-set/` -- create component + unit tests
- [x] `apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts` -- replace checkbox grid with chip set
- [x] `_bmad-output/planning-artifacts/ux-design-role-toggle-chips.md` -- document pattern and usage rules
- [x] `docs/v2/technical/FRONTEND_UI.md` -- add reference under good patterns
- [x] `_bmad-output/planning-artifacts/ux-design-mon-compte.md` -- amend Préférences tab spec (C2b)

**Acceptance Criteria:**
- Given the Préférences tab on viewport ≤ 480 px, when roles render, then chips wrap on multiple lines and the panel height is visibly shorter than the previous single-column list.
- Given loaded preferences, when the user toggles a non-volunteer chip, then selection updates locally and Enregistrer enables.
- Given the volunteer chip, when the user taps it, then it stays selected and cannot be deselected.
- Given unchanged selection, when Enregistrer is shown, then it stays disabled.
- Given a successful save, when PATCH completes, then snack « Préférences enregistrées » appears.

## Design Notes

Reference implementation: `membres-tab` role filters (`[highlighted]` + `(click)`). Chip content: emoji (aria-hidden) + `getRoleLabel(key, gender)`.

```html
<mat-chip [highlighted]="selected" (click)="toggle(key)">
  <span aria-hidden="true">🎭</span> Comédien
</mat-chip>
```

## Verification

**Commands:**
- `cd apps/web && npm test -- --include='**/role-toggle-chip-set.spec.ts' --include='**/member-preferences-form.spec.ts'` -- expected: all pass

**Manual checks:**
- Open `/compte/preferences` at 390 px width: chips wrap, no large empty right margin, save button full width.
