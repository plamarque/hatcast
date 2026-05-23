---
assessmentScope: story-2-3
storyId: '2.3'
storyKey: 2-3-import-export-csv-des-membres-de-troupe
storyFile: _bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md
assessmentDate: '2026-05-23'
assessor: BMad Implementation Readiness Workflow
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
overallReadiness: NEEDS WORK
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-23  
**Project:** hatcast  
**Scope:** Story 2.3 — Troupe Member CSV Import and Export (FR42)

## Document Discovery

### Files Used for Assessment

| Document | Path | Status |
|----------|------|--------|
| PRD | `_bmad-output/planning-artifacts/prd.md` | ✓ Whole |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | ✓ Whole |
| Epics | `_bmad-output/planning-artifacts/epics.md` | ✓ Whole |
| UX Design | `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` | ✓ Whole |
| Story 2.3 | `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md` | ✓ |
| Story 2.1 | `_bmad-output/implementation-artifacts/2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md` | ✓ |
| Sprint status | `_bmad-output/implementation-artifacts/sprint-status.yaml` | ✓ |
| Sprint change proposal | `_bmad-output/implementation-artifacts/sprint-change-proposal-2026-05-23.md` | ✓ Approved |
| PRD validation | `_bmad-output/planning-artifacts/prd-validation-report.md` | ✓ |

**Duplicates:** None (no sharded PRD/epics/UX conflicts).

**Missing for full UI path:** Story 2.2 implementation file (`2-2-*.md` not present).

---

## PRD Analysis (Story 2.3 scope)

### Functional Requirements

**FR42:** A troupe administrator can export and import troupe member lists in a documented CSV format, within the permission model, to support HatCast V1-to-V2 migration, migration from one troupe to another, and rapid initialization of a new troupe.

**Related FRs (dependency context):**

- **FR6** — membership exists (Story 2.1)
- **FR7** — admin manages members/roles (Story 2.2)

### Non-Functional Requirements

| NFR | Relevance to 2.3 |
|-----|------------------|
| **NFR-S2** | Personal data exposed only to allowed roles — export/import admin-only |
| **NFR-S4** | Safe CSV handling: documented fields, validation before persist, row-level outcomes |
| **NFR-P1** | Bounded loads — export must not transfer unbounded rows (story tasks mention streaming) |
| **NFR-S1** | TLS in transit (baseline, no story-specific gap) |

### PRD Completeness (FR42)

**Adequate for planning.** FR42 states capability and use cases; CSV schema detail correctly delegated to story/architecture. PRD MVP and Amira admin journey reference import/export.

---

## Epic Coverage Validation

### FR42 Traceability

| FR | PRD | Epics Story | Implementation story file | Status |
|----|-----|-------------|---------------------------|--------|
| FR42 | ✓ | Story 2.3 (Epic 2) | `2-3-import-export-csv-des-membres-de-troupe.md` | ✓ Covered |

**Coverage:** FR42 fully mapped. No orphan requirement.

### Epic vs story file drift

`epics.md` Story 2.3 lists **5** acceptance criteria; the implementation story file has **7** ACs plus a detailed **Member CSV contract v1**. The implementation file is **richer and authoritative for dev** — recommend syncing `epics.md` ACs with the story file (idempotency AC5, unknown-user AC6, OpenAPI AC7).

---

## UX Alignment Assessment

### UX Document Status

**Found** — `ux-design-hatcast-v2.md` Admin surfaces / Membres updated (Correct Course).

### Alignment

| Check | Status | Notes |
|-------|--------|-------|
| PRD ↔ UX | ✓ | CSV import/export on Membres admin area |
| Story ↔ UX | Partial | Story references UX-DR10; **no wireframe** for upload/download or import results table |
| Architecture ↔ UX | Partial | API-first feasible; UI depends on Story 2.2 admin shell |

### Warnings

- **UX-DR10** covers admin functional scope but not CSV-specific interaction (file picker, error table, export filename).
- Story allows **API-only** partial delivery — acceptable if documented in sprint notes, but **full FR42 UX** needs Membres admin route from 2.2.

---

## Epic Quality Review (Story 2.3)

### User value

✓ User-centric: admin migrates/initializes troupe members — not a technical milestone epic.

### Dependencies

| Dependency | Sprint status | Code reality | Assessment |
|------------|---------------|--------------|------------|
| **Story 2.1** | `review` | `V9__troupe_memberships.sql`, `TroupeMembershipService`, join API, access gating | **Mostly satisfied** — wait for 2.1 `done` before starting 2.3 |
| **Story 2.2** | `backlog` | No admin role model; no Membres UI; `TroupeAccessService.requireCanManageTroupe` = seed troupe + active member only | **Blocks full story**; partial API slice needs interim admin rule |

### Acceptance criteria quality

| AC | Testable | Gap |
|----|----------|-----|
| Export admin-only CSV | ✓ | Export columns defined in contract |
| Import valid rows | ✓ | — |
| Row-level import results | ✓ | DTO shape specified in tasks |
| Non-admin 403 | ✓ | **No troupe-admin auth yet** except provisional seed rule |
| Idempotent duplicate | ✓ | In story file only (not in epics.md) |
| Unknown user by email | ⚠️ | **Decision open** — invite vs reject (AC6) |
| OpenAPI documentation | ✓ | No export/import in OpenAPI today |

### Best practices violations

#### 🔴 Critical (blockers before `ready-for-dev`)

1. **Authorization model undefined for non-seed troupes** — FR42 requires *troupe administrator*; current code only allows provisional admin on seed troupe (`TroupeAccessService`). Story 2.2 not started.
2. **Story 2.1 not complete** — dependency in `review`, not `done`.

#### 🟠 Major

3. **AC6 unresolved** — V1 migration rows keyed by email when user has no V2 account; story says "document or reject" but no product decision recorded.
4. **V1 export recipe missing** — story requires documented path from legacy to CSV v1; no script/doc in repo yet.
5. **`baselineRole` column** depends on Story 2.2 role enum — contract allows omit/ignore; clarify for migration CSV from V1.
6. **Epics vs story file AC mismatch** — sync recommended.

#### 🟡 Minor

7. Story status `backlog` — not `ready-for-dev` (no validate-create-story run recorded).
8. No UX mock for import results UI.
9. Optional audit hook for export (Epic 9) — fine to defer.

### Distinction from Story 3.6

✓ Correctly documented — 3.6 is participation history CSV; 2.3 is member list CSV.

---

## Runtime / Code Readiness Snapshot

| Capability | Present |
|------------|---------|
| `troupe_memberships` table | ✓ V9 migration |
| Membership CRUD/join | ✓ Story 2.1 scope |
| `GET/POST .../memberships/me` | ✓ |
| Troupe admin role check (FR7/FR42) | ✗ Provisional seed only |
| `GET .../members/export` | ✗ |
| `POST .../members/import` | ✗ |
| OpenAPI export/import | ✗ |
| Admin Membres UI | ✗ (Story 2.2) |

---

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK** — Story 2.3 is **well specified** for FR42 but **not ready to start** as a complete vertical slice. **Conditional:** API-only slice may start after Story 2.1 is `done` if an **interim troupe-admin authorization rule** is explicitly documented (e.g. extend provisional seed admin pattern or stub `requireTroupeAdmin` pending 2.2).

### Critical Issues Requiring Immediate Action

1. **Complete Story 2.1** — move to `done` after review.
2. **Resolve admin authorization** — implement Story 2.2 baseline roles *or* document interim admin gate for CSV endpoints (seed troupe only is insufficient for FR42 troupe-to-troupe / multi-troupe migration).
3. **Decide AC6** — import row for unknown email: **reject** (MVP) vs **pending invite** (stretch).

### Recommended Next Steps

1. **Before dev:** Run `validate-create-story` on `2-3-import-export-csv-des-membres-de-troupe.md`; set status `ready-for-dev` when dependencies clear.
2. **Product decision:** Record AC6 and V1→CSV v1 mapping (short doc or script under `scripts/` — not full Firestore ETL).
3. **Sequencing:** Finish **2.1** → **2.2** (admin + roles) → **2.3** for full FR42; or split 2.3 into **2.3a API** / **2.3b UI** if migration deadline pressures API first.
4. **Sync** `epics.md` Story 2.3 ACs with implementation story file.
5. **Optional UX:** Add minimal admin Membres wireframe (export button, import upload, results table).

### Readiness Gate Checklist

- [x] FR42 in PRD
- [x] FR42 in epics + story file
- [x] NFR-S4 reflected in story ACs
- [x] CSV contract v1 in story file
- [x] Architecture pointer to story contract
- [x] UX admin Membres mentions CSV
- [ ] Story 2.1 done
- [ ] Troupe admin authorization (2.2 or interim)
- [ ] AC6 product decision
- [ ] V1 export recipe documented
- [ ] Story `ready-for-dev`
- [ ] OpenAPI stub for export/import

### Final Note

This assessment found **2 critical**, **4 major**, and **3 minor** issues for Story 2.3. Planning artifacts from Correct Course are solid; **implementation readiness** is gated primarily by **Epic 2 foundation** (2.1 review, 2.2 not started) and **one open product decision** (unknown email on import). Address critical items before assigning dev; API-first is viable only with explicit scope and auth interim.

**Assessed by:** Implementation Readiness Workflow (BMad)  
**Stakeholder:** Patrice
