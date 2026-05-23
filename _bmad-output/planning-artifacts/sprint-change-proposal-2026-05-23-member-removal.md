# Sprint Change Proposal — Explicit Troupe Member Removal

**Date:** 2026-05-23  
**Project:** hatcast  
**Trigger:** Stakeholder request: administrators must be able to remove members after confirmation. Removing a member must not delete the HatCast user account; it only removes the person from the troupe.

## 1. Issue Summary

The current delivery artifacts already define the correct backend/domain behavior in Story 2.2: removing a troupe member soft-deactivates the `troupe_memberships` row (`status = INACTIVE`) and revokes access to that troupe, without deleting the `users` row.

However, the approved UX-DR10 admin screen focuses on active/inactive toggling and does not explicitly lock a visible **Retirer** action with a confirmation dialog for troupe members. This creates a product/UX gap: administrators need an intentional, confirm-before-action affordance that communicates the difference between **removing from the troupe** and **deleting the user account**.

## 2. Impact Analysis

### Epic Impact

- **Epic 2 — Troupes, adhésion et profil membre:** affected. The change fits directly within member administration and does not alter epic sequencing.
- **Epic 3 — Saisons, spectacles et gouvernance organisateur:** minor indirect impact only, because removing a troupe member may remove their default member access. Season/event participant roster behavior remains separate and is not changed by this proposal.
- No new epic is required.

### Story Impact

- **Story 2.2 — Administration des membres et rôles de base:** already contains the backend/domain semantics. It should be clarified as the source of truth for “remove from troupe, not user deletion.”
- **Story 2.8 — Admin Membres Route UI (UX-DR10):** must add an explicit member row action **Retirer** with confirmation and route it to the existing soft-deactivation behavior.
- **Story 1.7 — Suppression de compte:** unchanged. This proposal explicitly separates member removal from account deletion.
- **Future Story 3.8 — Rosters participants saison et événement:** unchanged. Removing troupe membership must not be described as removing historical season/event participation records unless that lifecycle is later specified.

### Artifact Conflicts

- **PRD:** no major PRD change required. FR7 already says troupe administrators manage members, and FR37 separately covers account deletion. Optional wording clarification may reduce ambiguity.
- **Epics:** add explicit acceptance detail to Story 2.8; optionally clarify Story 2.2 wording in the epic source.
- **UX Design:** `ux-design-specification.md` and `ux-design-hatcast-v2.md` should add the **Retirer** row action and confirmation copy for the Membres tab.
- **Architecture:** no architecture change required. Existing soft-deactivation and last-admin guard remain valid.

### Technical Impact

- Frontend: add a visible **Retirer** action on each active member row in `/saison/:slug/admin/membres`.
- Confirmation: use existing Material confirm dialog pattern before calling the removal endpoint.
- API: expected to reuse existing member removal endpoint/soft-deactivate path from Story 2.2 (`DELETE /v1/troupes/{troupeId}/members/{membershipId}` or equivalent existing service method).
- Data: no hard delete of `users`; no deletion of historical audit/composition/availability data.
- Permissions: only `canManageMembers` / troupe admin path. Existing last-active-admin guard applies.

## 3. Recommended Approach

**Path:** Direct Adjustment.

This is a minor scope correction, not a replan. The correct domain behavior already exists in the implementation story; the missing piece is an explicit admin UI affordance and UX copy that prevents confusion with account deletion.

**Effort estimate:** Low.  
**Risk level:** Low to medium. The main risk is accidental confusion between “Retirer de la troupe”, “Désactiver”, and account deletion. The confirmation copy and tests should make this clear.

## 4. Detailed Change Proposals

### Story 2.8 — Acceptance Criteria

**Current relevant text:**

> Given the Membres tab, when the admin uses the screen, then: toolbar has search [...]; compact rows with avatar initial, inline display-name edit, read-only email, role chip+menu auto-save, `mat-slide-toggle` Actif auto-save; inactive rows at 60% opacity when shown; no `createdAt`/`updatedAt` in list; Nommer organisateur·ice de saison row action when permitted.

**Proposed replacement:**

> Given the Membres tab, when the admin uses the screen, then: toolbar has search [...]; compact rows with avatar initial, inline display-name edit, read-only email, role chip+menu auto-save, `mat-slide-toggle` Actif auto-save, and a visible **Retirer** row action for active memberships. The **Retirer** action opens a confirmation dialog explaining that the member will be removed from the troupe but the HatCast user account will not be deleted. On confirmation, the UI calls the existing member removal endpoint/soft-deactivation behavior; the member disappears from the default active list and appears only when inactive members are shown. Inactive rows appear at 60% opacity when shown; no `createdAt`/`updatedAt` in list; Nommer organisateur·ice de saison row action appears when permitted.

**Rationale:** Makes the requested destructive-looking action explicit and confirms the exact data effect.

### Story 2.8 — Tasks

**Add tasks:**

- Add **Retirer** action to active member rows on `MembresTab`.
- Use existing confirm dialog with copy:
  - Title: `Retirer ce membre de la troupe ?`
  - Body: `Cette action retire le membre de la troupe et lui enlève l'accès associé. Son compte HatCast n'est pas supprimé.`
  - Confirm: `Retirer`
  - Cancel: `Annuler`
- On confirmation, call the existing soft-deactivation/remove API and refresh members + permissions.
- Preserve last-active-admin handling: if API returns 409, revert/refresh and show `La troupe doit conserver au moins un administrateur actif.`
- Add component tests for confirmed removal, canceled removal, non-deletion copy, and last-admin error.

### UX Specification — Membres Tab

**Current row interactions table has:** display name, email, baseline role, active toggle, Nommer orga saison.

**Add row:**

| Element | Interaction | Persistence |
| --- | --- | --- |
| **Retirer** | Text button or icon button on active memberships; opens confirmation dialog | On confirm, soft-deactivates troupe membership only; does not delete `users` |

**Add behavior note:**

Removing a member is distinct from account deletion. The confirmation dialog must explicitly state that the HatCast user account is not deleted. Removed members are hidden by default because inactive memberships are hidden by default.

### PRD FR7 — Optional Clarification

**Current:**

> FR7: A troupe administrator can manage which users are members and their baseline troupe roles. Troupe membership is distinct from season/event participation records.

**Proposed clarification:**

> FR7: A troupe administrator can manage which users are members and their baseline troupe roles, including removing a user from the troupe after confirmation. Removing a member revokes that troupe membership only; it does not delete the user account. Troupe membership is distinct from season/event participation records.

**Rationale:** Optional but useful because it directly resolves the stakeholder ambiguity.

## 5. Checklist Findings

- [x] 1.1 Triggering story identified: Story 2.8, with existing semantics from Story 2.2.
- [x] 1.2 Core problem defined: UX requirement gap / stakeholder clarification, not a new architecture constraint.
- [x] 1.3 Evidence gathered: Story 2.2 already supports soft-deactivation; UX-DR10 lacks explicit member removal confirmation.
- [x] 2.1 Current epic can still complete as planned.
- [x] 2.2 No new epic required; direct story/UX adjustment only.
- [x] 2.3 Future epics mostly unaffected; participant rosters remain distinct.
- [x] 3.1 PRD conflict low; optional FR7 clarification recommended.
- [x] 3.2 Architecture conflict none.
- [x] 3.3 UX update needed on Admin Membres row actions and confirmation copy.
- [x] 3.4 Testing updates needed for frontend behavior.
- [x] 4.1 Direct Adjustment viable, low effort.
- [x] 4.2 Rollback not viable/needed.
- [x] 4.3 MVP review not needed.
- [x] 4.4 Recommended path: Direct Adjustment.

## 6. Implementation Handoff

**Scope classification:** Minor.

**Route to:** Developer agent.

**Implementation success criteria:**

- A troupe admin sees a **Retirer** action on active member rows in `/saison/:slug/admin/membres`.
- Clicking **Retirer** opens confirmation before any mutation.
- Confirmation copy clearly says the user account is not deleted.
- Confirming removes only the troupe membership by soft-deactivation; default active list no longer shows the member.
- Canceling makes no API call.
- Last-active-admin protection still blocks removal.
- Tests cover confirmed removal, canceled removal, confirmation copy, and last-admin failure.

**Recommended test commands:**

- `npm run test -w @hatcast/web -- --watch=false admin-membres`
- `npm run build -w @hatcast/web`

## 7. Approval Request

Approve this proposal to proceed with implementation as a minor direct adjustment.
