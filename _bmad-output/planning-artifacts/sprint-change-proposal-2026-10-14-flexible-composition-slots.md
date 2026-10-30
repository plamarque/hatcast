# Sprint Change Proposal — Flexible composition slots

**Date:** 2026-10-14  
**Author:** Correct Course (BMad), with UX review by Sally  
**Approver:** Patrice (product) — incremental approvals, 2026-10-13/14  
**Trigger:** CN-1/CN-2 revealed that editing needs in **Infos** and editing the cast in **Équipe** creates avoidable reconciliation work and forces organizers to switch tabs.  
**Change scope:** **Major** — product-flow, UX, backlog, and API/UI behavior; no implementation authorized by this proposal.

---

## 1. Issue summary

The current flow treats `templateType` and `roleSlots` as an event-information edit, while organizers assign people in a separate composition screen. Applying a changed template can make persisted assignments fall outside the newly configured needs. CN-1 preserves these assignments safely; CN-2 attempted to expose and regularize the resulting exception.

This is a symptom of the split editing surface, not a desirable organizer workflow. An organizer composing a cast should configure its structure, fill it, and adjust it in one place. A format is a useful starting template, not a permanent constraint that requires a separate reconciliation experience.

Concrete user evidence:

- organizers must leave **Équipe** for **Infos** solely to change composition needs;
- CN-2 adds special-purpose actions and wording to compensate for that detour;
- an assigned slot removed by a template must never silently disappear, while empty obsolete slots do not need to survive;
- an organizer needs arbitrary additional roles (for example, two DJs) without inventing a new template.

## 2. Approved product contract

### 2.1 One organizer editing surface

**Équipe** is the sole editing surface for format/template, role-slot structure, assignments, and draw. **Infos** displays a read-only summary of the effective format and role counts.

`roleSlots` remains the canonical persisted role-need model. This preserves availability-by-role, drawing, and statistics contracts; moving the UI does not create a second source of truth.

### 2.2 Format application

Selecting a format whose template differs from current needs requires confirmation, as it does today. Once confirmed, the system:

1. creates missing empty slots required by the template;
2. removes empty slots absent from the template;
3. retains assigned slots absent from the template and marks them **Hors modèle** with a neutral/grey semantic treatment.

The system must never silently delete an assignment. The retained assigned slot remains in its role group and has the normal assignment and structural actions.

### 2.3 Free slot editing

`+ Ajouter un rôle` does **not** create one button per role. It creates one provisional, unassigned slot with no role. The organizer chooses its role, then may assign a person or leave it empty. Only choosing the role updates persisted `roleSlots`.

| Action | Meaning |
|---|---|
| Cross in the assignee area | Unassign the person from the role; the required slot remains. Tooltip: `Désassigner cette personne de ce rôle`. |
| Bin on a slot | Delete the structural slot. For an assigned slot, require explicit confirmation because its assignment is also removed. |
| `+ Ajouter un rôle` | Add an empty, role-less provisional slot, then choose its role. |

### 2.4 Order, mobile, and focus

The composition remains grouped by role. The provisional row appears immediately above the bottom `+ Ajouter un rôle` action. Once a role is chosen, it moves after the final slot in that role group; within a group, creation order is stable. Manual reordering is out of scope.

On mobile, after role selection closes its picker, scroll the newly placed slot into view and move focus to `Affecter une personne`. On desktop, only scroll when the final slot is outside the visible region. The flow is therefore continuous: add, choose a role, assign a person.

## 3. Impact analysis

| Area | Impact |
|---|---|
| CN-1 | Retain the server safety invariant and member-safe projections. It becomes infrastructure for template application rather than a separately marketed workflow. Revalidate it against this contract. |
| CN-2 | Supersede its dedicated organizer regularization UX. Do not integrate its current story-worktree implementation as the product solution. |
| Story 17.14 | Supersede the placement decision that makes Infos the editor for type and roles. Preserve its removal of these controls from `EventFormDialog`. |
| DOMAIN.md | Clarify that format seeds defaults, `roleSlots` is editable from Équipe, and a template may leave assigned slots outside its current needs. |
| SPEC / epics | Add the flexible-slot behavior and acceptance criteria; remove the expectation of a separate reconciliation surface. |
| API / projections | Keep the existing no-silent-delete, organizer-only detail, and member-redaction boundaries. Add explicit operations/tests for provisional-slot creation, role selection, structural deletion, and template application. |
| Activity / notifications | Reassess CN-3 separately: a confirmed deletion of an assigned slot may be a removal event; an assigned slot merely becoming Hors modèle is not. |

## 4. Recommended approach

**Selected path: Hybrid direct adjustment plus targeted replacement epic.**

Create a new epic, provisionally **Epic 22 — Flexible composition slots**, then mark CN-2 superseded and amend Story 17.14. CN-1 remains as a constrained backend compatibility/safety capability, not as the organizer-facing feature. Do not roll back or delete CN-1 solely because the UX changes: its preservation and privacy guarantees are required by the new format-application behavior.

### Proposed stories

1. **22.1 — Équipe owns format and role-slot editing**: move format selector/confirmation to Équipe; Infos becomes read-only summary.
2. **22.2 — Free structural slot editing**: provisional add-slot flow, role selection, role-group placement, delete semantics, and M3/a11y affordances.
3. **22.3 — Safe template application**: create/remove empty slots, preserve and grey assigned out-of-template slots, mobile scroll/focus behavior, projection and concurrency coverage.
4. **22.4 — Migration and retirement audit**: revalidate CN-1 dependencies, remove/supersede CN-2-only code and documentation, decide CN-3 removal-notification semantics.

## 5. Explicit artifact changes proposed for approval

| Artifact | Proposed change |
|---|---|
| `DOMAIN.md` | Amend Format / role-slots semantics and document retained assigned out-of-template slots. |
| `SPEC.md` | Add organizer composition-structure capability; no task ordering. |
| `_bmad-output/planning-artifacts/epics.md` | Add Epic 22 with the four stories; amend 17.14; preserve historical CN references with superseded mapping. |
| `PLAN.md` | Add the scheduled Epic 22 order/dependencies and link this proposal. |
| `ux-design-composition-equipe-slot-rows.md` or a new dedicated UX document | Record control placement, role grouping, template confirmation, grey Hors modèle state, mobile scroll/focus, tooltips, and M3 checklist. |
| `spec-composition-needs-safety/*` | Amend delivery plan / story status: CN-1 safety retained, CN-2 superseded, CN-3 pending a separate notification decision. |
| CN-2 worktree | Do not merge current product code. Preserve it for audit until a separate cleanup decision. |

## 6. Risks and guards

| Risk | Guard |
|---|---|
| A format application deletes a person | Transactional preservation of assigned slots; test occupied and empty cases separately. |
| Members see organizer-only out-of-model data | Preserve CN-1 member projections/redaction tests. |
| Mobile focus is lost after moving the provisional row | E2E/mobile test asserts scroll target and focus on `Affecter une personne`. |
| Two competing structure edits | Use the existing version/concurrency boundary and return a visible conflict without partial mutation. |
| Structural delete is mistaken for unassign | Separate icon, label, tooltip, and confirmation for occupied slots. |

## 7. Implementation handoff and success criteria

**Classification:** Major — Product Owner, UX Designer, and Developer coordination required before implementation.

Success means an organizer can complete a custom composition entirely from Équipe; apply a changed format without losing any assigned person; add an arbitrary role without a template; and understand the distinct outcomes of unassigning a person versus deleting a structural slot. Infos accurately summarizes, but does not edit, the effective composition needs.

## 8. Approval

- [x] Product contract approved incrementally by Patrice (2026-10-13/14).
- [x] Backlog reorganization approved incrementally by Patrice (2026-10-13/14).
- [x] Technical model and mobile ordering/focus behavior approved incrementally by Patrice (2026-10-13/14).
- [x] Approve this complete Sprint Change Proposal to update normative planning artifacts and create the replacement epic. (Patrice, 2026-10-14)
- [ ] Separately authorize implementation work in a new prepared story worktree.
