---
assessmentScope: story-2-2
storyId: '2.2'
storyKey: 2-2-administration-des-membres-et-roles-de-base
storyFile: null
assessmentDate: '2026-05-23'
assessor: BMad Implementation Readiness Workflow
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
overallReadiness: NOT READY
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-23  
**Project:** hatcast  
**Scope:** Story 2.2 — Administration des membres et rôles de base (FR7)

## Document Discovery

### Files Used for Assessment

| Document | Path | Status |
|----------|------|--------|
| PRD | `_bmad-output/planning-artifacts/prd.md` | ✓ |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | ✓ |
| Epics | `_bmad-output/planning-artifacts/epics.md` | ✓ Story 2.2 section only |
| UX Design | `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` | ✓ Admin Membres |
| Story 2.1 (dependency) | `_bmad-output/implementation-artifacts/2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md` | ✓ `done` |
| Story 3.5 (related) | `_bmad-output/implementation-artifacts/3-5-delegation-des-organisateurs-perimetre-saison-evenement.md` | ✓ `review` |
| Story 2.3 (downstream) | `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md` | ✓ blocked on 2.2 |
| Sprint status | `_bmad-output/implementation-artifacts/sprint-status.yaml` | ✓ |
| DOMAIN / SPEC | `DOMAIN.md`, `SPEC.md` | ✓ (legacy + V2 admin intent) |

**Critical missing artifact:** No implementation story file (`2-2-*.md` **does not exist**).

**Duplicates:** None.

---

## PRD Analysis (Story 2.2 scope)

### Functional Requirement

**FR7:** A troupe administrator can manage which users are members and their **baseline roles** for that troupe, within the permission model.

Implied capabilities (from PRD admin journey + MVP):

- Add/remove or deactivate members
- Assign baseline troupe roles
- Permission-gated; coherent API/UI denial (NFR-S2)

### Non-Functional Requirements

| NFR | Relevance |
|-----|-----------|
| **NFR-S2** | Member list and role data visible only to authorized identities |
| **NFR-S1** | Baseline (TLS, session) |

### PRD Completeness (FR7)

**Partial.** FR7 names capability but does **not** define:

- Baseline role enum (admin / organizer / member / …)
- Invite vs join-only flows
- Deactivate vs hard remove semantics

These belong in story + DOMAIN alignment — **not yet documented for V2 Postgres model**.

---

## Epic Coverage Validation

| FR | PRD | Epics Story 2.2 | Implementation story file | Status |
|----|-----|-----------------|---------------------------|--------|
| FR7 | ✓ | ✓ (2 ACs) | **Missing** | ❌ Not dev-ready |

**Coverage in epics map:** FR6–FR10, FR42 → Epic 2 — FR7 assigned to Story 2.2 ✓

### Epic AC vs UX/SPEC gap

`epics.md` Story 2.2 has **only 2 acceptance criteria** (role change + 403). UX and SPEC require broader **Membres** admin:

| Capability (UX / SPEC) | In epics AC? |
|------------------------|--------------|
| List members | ❌ |
| Invite / add member | ❌ |
| Remove / deactivate | ❌ (only "retire" implied in FR text) |
| Assign baseline roles | ✓ partial |
| Admin UI (UX-DR10) | Referenced, not specified |
| Permission-gate admin chrome | ❌ (deferred from 2.1 code review) |

---

## UX Alignment Assessment

### UX Document Status

**Found** — Admin surfaces / **Membres** (`ux-design-hatcast-v2.md`).

### Alignment

| Check | Status | Notes |
|-------|--------|-------|
| PRD ↔ UX | ✓ | Admin manages members + roles |
| Epics ↔ UX | ❌ | Epics too thin vs UX table (invite, remove, roles) |
| Architecture ↔ UX | Partial | Auth model mentions troupe-scoped roles; **no schema** yet |
| Story 2.1 ↔ UX | ⚠️ | 2.1 review deferred: admin actions visible to non-admins until 2.2 |

### Warnings

- No wireframe or route IA for **Membres** admin screen (acceptable per UX-DR10 — Material defaults OK).
- CSV import/export (FR42) is on same Membres surface — Story 2.2 should **reserve navigation slot** even if 2.3 implements CSV later.

---

## Epic Quality Review (Story 2.2)

### User value

✓ User-centric — troupe admin controls membership and access.

### Dependencies

| Dependency | Status | Assessment |
|------------|--------|--------------|
| **Story 2.1** | `done` | ✓ `troupe_memberships`, join API, member gating satisfied |
| **Story 3.5** | `review` | Uses **provisional** `TroupeAccessService` — 2.2 must **replace** seed-only admin with real troupe admin without breaking organizer delegation |

### Acceptance criteria quality (epics.md only)

| Issue | Severity |
|-------|----------|
| Only 2 BDD criteria — insufficient for API + UI + migration from provisional admin | 🔴 Critical |
| No role enum / permission matrix | 🔴 Critical |
| No list/add/remove endpoints | 🟠 Major |
| No OpenAPI / test expectations | 🟠 Major |
| No explicit refactor of `requireCanManageTroupe` | 🟠 Major |

### Cross-story / permission model risks

1. **Three layers to align:**
   - **Troupe baseline roles** (FR7 — Story 2.2)
   - **Season/event organizers** (FR34 — Story 3.5)
   - **Provisional seed-troupe admin** (`TroupeAccessService` — temporary)

2. **Story 3.5 explicitly defers** “Season admin CRUD, invitations, member list” to **Epic 2**. Story 2.2 is the **intended owner** of troupe admin identity.

3. **Legacy V1** uses season-scoped `roles.users` / `roles.admins` in Firestore — V2 needs explicit **mapping** (troupe membership role vs season admin vs organizer).

4. **Downstream blocker:** Story **2.3** (CSV) and full **FR42** require troupe admin from 2.2.

### Database / entity readiness

Current `troupe_memberships` (V9):

```
id, troupe_id, user_id, status, display_name, created_at, updated_at
```

**No `baseline_role` (or equivalent) column** — required for FR7.

### Code readiness snapshot

| Capability | Present |
|------------|---------|
| Membership table + join | ✓ Story 2.1 |
| List members API (admin) | ✗ |
| Add/remove/deactivate member API | ✗ |
| Role assignment on membership | ✗ |
| `requireTroupeAdmin()` (real) | ✗ — only `requireCanManageTroupe` (seed + member) |
| Admin Membres UI route | ✗ |
| Hide admin chrome from non-admins | ✗ (2.1 defer) |
| OpenAPI member admin endpoints | ✗ |

---

## Summary and Recommendations

### Overall Readiness Status

**NOT READY** — Story 2.2 is **defined at epic level only**. It cannot enter development until a **full implementation story** is created (`bmad-create-story`) and key product/technical decisions are recorded.

**Positive:** Story 2.1 is **done**; membership foundation exists. Story 2.2 is the **correct next Epic 2 slice** before 2.3 (CSV) or replacing provisional admin across Epic 3.

### Critical Issues Requiring Immediate Action

1. **Create story file** `2-2-administration-des-membres-et-roles-de-base.md` via create-story workflow (AC, tasks, dev notes, API contract).
2. **Define baseline role enum** and permission matrix (troupe admin vs member; relationship to season/event organizers from 3.5).
3. **Extend schema** — e.g. `baseline_role` on `troupe_memberships` (Flyway V10+) + migration note for seed troupe admins.

### Recommended Next Steps

1. **Run `/bmad-create-story` for 2-2** — expand beyond epics’ 2 ACs; include:
   - `GET/PATCH/DELETE /v1/troupes/{id}/members` (or equivalent)
   - Role assignment rules
   - Refactor `TroupeAccessService.requireCanManageTroupe` → troupe-admin check
   - Membres admin UI (Angular Material)
   - Fix 2.1 defer: hide admin actions for non-admins
   - Integration tests + OpenAPI
2. **Document V2 role model** — short addition to `DOMAIN.md` (troupe baseline roles vs organizer delegation) when implementing.
3. **Coordinate with 3.5** — when 2.2 lands, update `OrganizerAccessService` to use troupe admin instead of provisional seed rule; regression-test 3.5.
4. After story file + validate-create-story: set sprint status **`ready-for-dev`**.

### Readiness Gate Checklist

- [x] FR7 in PRD
- [x] FR7 mapped to Epic 2 Story 2.2 in epics
- [x] UX Membres admin scope documented
- [x] Story 2.1 done (dependency)
- [ ] Implementation story file exists
- [ ] Baseline role enum decided
- [ ] DB migration planned
- [ ] API + OpenAPI specified
- [ ] Permission refactor from provisional admin specified
- [ ] Acceptance criteria cover list/add/remove/role + 403 + UI
- [ ] Story `ready-for-dev`

### Final Note

This assessment found **3 critical**, **4 major**, and **2 minor** gaps. Story 2.2 is the **permission keystone** for Epic 2 and unblocks Story 2.3 (CSV migration). **Do not start 2.3** until 2.2 story spec and troupe-admin authorization exist. Recommended immediate action: **`/bmad-create-story` 2-2**.

**Assessed by:** Implementation Readiness Workflow (BMad)  
**Stakeholder:** Patrice
