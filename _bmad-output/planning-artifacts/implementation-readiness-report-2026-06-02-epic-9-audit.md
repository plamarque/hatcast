---
stepsCompleted:
  - document-discovery
  - prd-analysis
  - epic-coverage-validation
  - ux-alignment
  - architecture-alignment
  - epic-quality-review
  - final-assessment
project: hatcast
assessmentDate: '2026-06-02'
assessmentScope: Epic 9 — Audit trail (FR35) — stories 9.0, 9.1, 9.2
workflowType: implementation-readiness
overallReadiness: NOT READY
readinessByStory:
  '9.0': NOT READY
  '9.1': NOT READY
  '9.2': NOT READY
productDecisions:
  mepScope: capture-backend-only
  uiScope: post-mep-initial
  mepStory: '9.0'
  scpReference: sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md
inputDocuments:
  prd: _bmad-output/planning-artifacts/prd.md
  epics: _bmad-output/planning-artifacts/epics.md
  plan: PLAN.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  domain: DOMAIN.md
  spec: SPEC.md
  arch: ARCH.md
  scp-mep: _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md
  v1-audit: docs/v1/technical/AUDIT.md
  sprint-status: _bmad-output/implementation-artifacts/sprint-status.yaml
priorPartialHooks:
  - services/api/.../EventAvailabilityEntity.kt (recorded_by_user_id, V23)
  - services/api/.../EventCompositionDeclineEntity.kt (declinedByUser_id)
---

# Implementation Readiness Assessment — Epic 9 Audit (2026-06-02)

**Date:** 2026-06-02  
**Project:** hatcast V2  
**Assessor:** IR workflow (scoped Epic 9)  
**Scope:** Readiness to implement **Epic 9** — **9.0** (MEP capture), **9.1** / **9.2** (post-MEP UI)

---

## Executive Summary

| Scope | Readiness | Gate |
|-------|-----------|------|
| **Story 9.0** (backend capture, MEP P0) | **NOT READY** | Create story file + schema/ADR + action taxonomy before dev |
| **Story 9.1** (admin/orga audit UI) | **NOT READY** | Post-MEP; blocked on **9.0** + UX/API spec |
| **Story 9.2** (member self-history UI) | **NOT READY** | Post-MEP; blocked on **9.0** (+ **9.1** reco.) |

**Overall:** **NOT READY** to start **9.0** implementation today — planning is **sound** (PRD → epics → PLAN split capture/UI), but **delivery artifacts** (story file, V2 schema, normative doc updates, hook inventory) are missing. Expected effort to reach **READY WITH CAVEATS** for **9.0 only**: **1–2 prep sessions** (`bmad-create-story` + ADR/schema draft).

**PO phasing (accepted):** MEP = **write path only** (**9.0**); consultation UI (**9.1**, **9.2**) post initial prod — aligns with SCP 2026-06-02. Note: PRD **FR35** wording emphasizes *view*; epic split is documented in PLAN/epics, not yet reflected in PRD/SPEC.

---

## Document Discovery

| Document | Role | Status |
|----------|------|--------|
| `prd.md` (FR35, FR17/26 auditability) | Requirements | ✓ FR35 complete at requirement level |
| `epics.md` § Epic 9 (9.0–9.2) | Delivery | ✓ Stories + AC added 2026-06-02 |
| `PLAN.md` § Epic 9 | Order / DoD | ✓ Capture matrix + hook hints |
| `sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md` | PO decision | ✓ MEP vs post-MEP |
| `architecture.md` | Technical planning | ⚠️ Audit **themes** only — no `audit_events` schema, API, or recorder pattern |
| `DOMAIN.md` | Normative domain | ❌ **Drift** — still describes V1 `auditLogs` / Firestore |
| `SPEC.md` | Functional spec | ❌ **Drift** — references `auditClient.js` / Firestore triggers (V1) |
| `ARCH.md` | Runtime topology | ❌ **V1-only** audit client + Functions |
| `docs/v1/technical/AUDIT.md` | Reference | ✓ Rich V1 action taxonomy — **not mapped** to V2 |
| Story files `9-0-*`, `9-1-*`, `9-2-*` | Implementation | ❌ **None** |
| UX specs (audit UI) | UX | ❌ **None** for 9.1/9.2 (acceptable for 9.0) |
| OpenAPI audit endpoints | Contract | ❌ None (OK for 9.0; required for 9.1) |

**Duplicates:** None blocking.

**Sharded docs:** N/A — whole documents used.

---

## PRD ↔ Epic Coverage (FR35)

| FR / theme | Epic / Story | Coverage | Notes |
|------------|--------------|----------|-------|
| FR35 view trail | 9.1, 9.2 | ✓ Mapped | Post-MEP per PO |
| FR35 capture (implicit in FR17/26 + PRD action list) | **9.0** | ✓ Mapped | PLAN matrix matches PRD minimum actions |
| FR17 proxy availability audit | 5.5 (done) + **9.0** | ⚠️ Partial | `recorded_by_user_id` only — not unified journal |
| FR26 proxy confirm audit | 6.8 (done) + **9.0** | ⚠️ Partial | `declinedByUserId` on decline row — not full FR35 |
| FR37 account deletion + audit preservation | 1.7 (deferred) | ⚠️ Open | Anonymization of `actor_user_id` in audit — policy not in 9.0 AC |

**PRD gaps (for implementation):**

1. **FR35** bundles *record* and *view* — PO split is in PLAN, not PRD amendment (informational, not blocking if stories are source of truth for phasing).
2. **Availability delete** in FR35 — V2 may model as status reset (`UNSET`) rather than row DELETE; **9.0** must define which mutations emit audit (clarify in story Dev Notes).
3. **V1 audit migration** — not in FR35/epics; assume **no backfill** of Firestore `auditLogs` unless PO adds MIG-* slice.

**Verdict:** FR coverage **complete at epic level** for MEP capture; **implementation design** missing.

---

## UX Alignment

| Surface | Spec | Code today | Status |
|---------|------|------------|--------|
| Admin/orga audit list | **9.1** (post-MEP) | None | ❌ Not started — **no wireframe** |
| Member « Mon historique » | **9.2** (post-MEP) | None | ❌ Not started |
| Declined list / participation UX | `ux-design-hatcast-v2.md` | Shipped (6.7) | ✓ Separate from audit UI |
| Dev audit CLI (V1) | `docs/v1/technical/AUDIT.md` | V1 scripts only | ⚠️ Reference for action labels, not V2 UI |

**UX gaps:**

1. **9.1** — No M3 screen spec (filters: event, user, date range; diff presentation). AC in epics sufficient to **start UX later**; not blocking **9.0**.
2. **9.2** — Entry point undefined (Mon compte? Event detail?); defer until post-MEP.
3. **Operator/debug** — V1 had CLI + dev toggle; V2 MEP may need **SQL/admin read** or structured logs for recette — not in 9.0 AC (recommend Dev Notes: integration tests + optional admin-only GET behind flag for staging).

**Verdict:** UX **N/A for 9.0 gate**; **blocking for 9.1** when scheduled.

---

## Architecture Alignment

| Topic | `architecture.md` | PLAN / epics | Code | Status |
|-------|-------------------|--------------|------|--------|
| Append-only audit store | Mentioned generically | `audit_events` table | ❌ No migration | **Gap** |
| Actor / subject on proxy | ✓ FR17/26/35 | ✓ 9.0 AC | Partial columns | **Gap** |
| Same-transaction vs async write | NFR-R2 async notifs | « after successful commit » | — | � Prefer **same transaction** as domain write or immediate afterCommit |
| Hook points | High-level | Lists 5 services | Services exist | ✓ Inventory OK |
| Public API | — | 9.0: no GET | — | ✓ |
| Authorization for read | FR34 scope | 9.1 | — | Deferred |

**V2 runtime today:**

- No `AuditEventRecorder` (or equivalent).
- No Flyway migration for audit table.
- Partial actor fields on domain tables — **must not** be mistaken for FR35 compliance.

**V1 reference (`AUDIT.md`):** ~30+ action types — V2 should define a **controlled enum** (subset FR35 minimum first) rather than copy all V1 types (login, client_error, etc.) unless PO wants parity.

**Recommended architecture decisions (pre-9.0):**

1. Table `audit_events` (append-only): `id`, `occurred_at`, `actor_user_id`, `subject_user_id`, `subject_season_participant_id`, `subject_event_participant_id`, `action_type`, `troupe_id`, `season_id`, `event_id`, `before_json`, `after_json`, optional `metadata_json`.
2. Service `AuditEventRecorder.record(...)` called from domain services — **not** from controllers directly.
3. Index: `(troupe_id, occurred_at DESC)`, `(event_id, occurred_at DESC)`, `(subject_user_id, occurred_at DESC)` for future 9.1/9.2.
4. **ADR candidate** (0016 or appendix to existing): V2 audit model vs V1 Firestore — link from ARCH when merged.

**Verdict:** Architecture **NOT READY** — needs schema + recorder pattern documented before coding.

---

## Epic Quality Review (9.0 / 9.1 / 9.2)

### Story 9.0 — Capture backend

| Criterion | Assessment |
|-----------|------------|
| User story + AC | ✓ Clear in `epics.md` |
| Testable DoD | ✓ PLAN: integration tests on dispo + validate + confirm/decline |
| Dependencies | ✓ Epics 5, 6 done |
| Dev Notes / hook list | ❌ **Missing** in story file |
| Action type catalog | ❌ **Missing** |
| Subject identity rules (name-only participants) | ⚠️ **Ambiguous** — need `seasonParticipantId` / `eventParticipantId` in payload |
| Story file | ❌ **Missing** |

### Story 9.1 — Admin UI

| Criterion | Assessment |
|-----------|------------|
| AC | ✓ Aligned FR35 read path |
| Depends 9.0 | ✓ |
| API contract | ❌ Not specified |
| UX | ❌ Not specified |
| Authorization matrix vs FR34 | ⚠️ Needs explicit mapping (troupe admin vs season vs event orga) |

### Story 9.2 — Member UI

| Criterion | Assessment |
|-----------|------------|
| AC | ✓ Scoped to actor/subject |
| Priority P2 post-MEP | ✓ Consistent with PO |
| Entry point | ❌ Undefined |

**Cross-story notes from done epics (consistent deferral to Epic 9):**

- 5.5, 6.5, 6.7, 6.8, 6.9, 6.3 — all reference Epic 9 for full FR35; no conflict.

---

## Normative Doc Conflicts (AGENTS.md)

| Conflict | Location | Resolution |
|----------|----------|------------|
| Audit storage V1 Firestore | `DOMAIN.md` § Audit log | Update when **9.0** merges — PostgreSQL `audit_events` |
| Audit client V1 | `SPEC.md` | Add V2 pointer or section when capture ships |
| ARCH audit components | `ARCH.md` | Add V2 API audit module post-9.0 |
| FR35 read vs write phasing | PRD only | Optional PRD footnote — PLAN/epics authoritative for MEP |

---

## Prerequisites Already Met

- Epic **5** (availability + proxy 5.5) ✓
- Epic **6** (composition lifecycle, confirm/decline, draw, gap-fill) ✓
- Epic **2** (membership / identity resolution) ✓
- **OPS-2** CI Postgres tests ✓ — suitable for audit integration tests
- PLAN MEP ordering: **9.0** is next after **4.1** ✓

---

## Risks & Open Questions

| ID | Risk / question | Impact | Mitigation |
|----|-----------------|--------|------------|
| R1 | Lottery draw emits **many** slot changes — one audit row or batch? | Payload size / noise | Story Dev Note: prefer **one `composition.draw.completed` event** with full before/after snapshot |
| R2 | Name-only participants — subject identity | FR35 subject | Store participant ids + display name snapshot in `metadata_json` |
| R3 | No explicit availability **DELETE** API | FR35 « delete » | Audit **UNSET** / clear as `availability.updated` with empty after |
| R4 | Cutover without 9.0 | No prod audit from day 1 | **MEP blocker** — PO already prioritized |
| R5 | 9.0 without staging read path | Hard recette | Temporary admin SQL or gated GET in 9.0 Dev Notes |
| R6 | FR37 anonymization | Future 1.7 | Document in 9.0: actor id may become anonymized token — schema allows nullable display |

---

## Summary and Recommendations

### Overall Readiness Status

**NOT READY** — Epic 9 planning is **coherent**; **9.0** needs prep artifacts before `dev-story`.

### Critical Issues (before 9.0 dev)

1. **`bmad-create-story`** for `9-0-capture-backend-piste-audit.md` with Dev Notes: hook inventory, action enum, subject rules, transaction boundary.
2. **Flyway schema draft** + optional **ADR** for V2 audit model (vs V1 `auditLogs`).
3. **Clarify** availability delete semantics vs UNSET in story AC.

### Recommended Next Steps

1. Create story **9.0** file (`ready-for-dev`).
2. Draft migration `Vxx__audit_events.sql` + `AuditEventRecorder` interface in story tasks.
3. Map V1 action types → V2 minimum enum (reference `docs/v1/technical/AUDIT.md`).
4. Implement **9.0** hooks in order: availability → confirm/decline → validate/unlock → manual assign → draw.
5. Integration tests (extend existing composition/availability test classes).
6. Update **DOMAIN.md** + **ARCH.md** in same PR as 9.0 (normative sync).
7. Schedule **9.1** UX + OpenAPI after 9.0 done; **9.2** after PO prioritization post-MEP.

### Final Note

Epic 9 is **well-scoped for MEP** (capture first, UI later). The gap is **engineering specification**, not product ambiguity. After story file + schema draft, readiness becomes **READY WITH CAVEATS** for **9.0** only.

---

## Readiness Gate Summary

| Gate | Action |
|------|--------|
| Start **9.0** dev now? | **No** — create story + schema first |
| Start **9.0** after story + ADR draft? | **Yes** |
| Start **9.1** / **9.2**? | **No** — post-MEP; after **9.0** + UX/API spec |
| Block M4 without **9.0**? | **Yes** (per PLAN MEP gate) |

**Implementation Readiness complete (Epic 9 scope).** Next: `bmad-create-story` → **9.0**.
