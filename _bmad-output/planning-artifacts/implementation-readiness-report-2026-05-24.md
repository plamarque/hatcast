---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
project: hatcast
assessmentDate: '2026-05-24'
assessmentScope: Full V2 (FR1–FR60, Epics 1–16, ADR 0011–0012)
workflowType: implementation-readiness
overallReadiness: READY WITH CAVEATS
assessor: BMAD check-implementation-readiness
inputDocuments:
  prd: _bmad-output/planning-artifacts/prd.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics: _bmad-output/planning-artifacts/epics.md
  ux-primary: _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  ux-journey: _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  ux-excluded: _bmad-output/planning-artifacts/ux-design-specification.md
  plan: _bmad-output/planning-artifacts/plan-v2-league-journey.md
  adr:
    - docs/adr/0011-league-model-and-user-agenda.md
    - docs/adr/0012-league-views-travel-leagues-member-stats.md
priorAssessments:
  - _bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23.md
  - _bmad-output/planning-artifacts/implementation-readiness-report-2026-05-24-league.md
---

# Implementation Readiness Assessment Report

**Date:** 2026-05-24  
**Project:** hatcast  
**Scope:** Full V2 product (FR1–FR60, Epics 1–16, League journey + ADR 0012 delta)

---

## Document Discovery

### Inventory (confirmed 2026-05-24)

| Type | File | Size | Modified | Role |
|------|------|------|----------|------|
| PRD | `prd.md` | 63 KB | 2026-05-24 15:39 | FR1–FR60, traceability updated |
| Architecture | `architecture.md` | 37 KB | 2026-05-24 15:39 | Routes, `/v1/me/agenda`, multi-active leagues |
| Epics | `epics.md` | 92 KB | 2026-05-24 15:42 | Epics 1–16, FR coverage map |
| UX (primary) | `ux-design-hatcast-v2.md` | 57 KB | 2026-05-24 15:37 | Event detail, dispos, équipe, stats; `/seasons` superseded note |
| UX (journey) | `ux-design-journey-league-agenda.md` | 12 KB | 2026-05-24 15:06 | Post-login, `/agenda`, troupe hub (UX-DR13–18) |
| UX (excluded) | `ux-design-specification.md` | 17 KB | 2026-05-24 01:05 | Pre-V2; superseded for navigation |
| Plan | `plan-v2-league-journey.md` | 6 KB | 2026-05-24 15:42 | Waves 0–4 sequencing |
| ADR | `0011`, `0012` | — | 2026-05-24 | League model + workspace views |

**Sharded documents:** None (no `*/index.md` folders).

**Duplicates:** No whole/sharded conflicts. Three UX markdown specs coexist; assessment uses **hatcast-v2 + journey**; excludes **ux-design-specification.md** unless comparing admin Membres history.

**Related prior reports:** `implementation-readiness-report-2026-05-24-league.md` (League-only delta); this report supersedes it as the **full-scope** assessment.

---

## PRD Analysis

### Functional Requirements

FR1: Sign in with Google (MVP).  
FR2: Sign in with email and password.  
FR3: Password reset via email.  
FR4: Persistent session (“remember me”) ≥ 30 days until sign-out/password change/account deletion.  
FR5: Sign out.  
FR6: Troupe membership with profile; active members get troupe admin + league creation; **league roster** determines user agenda events (FR48).  
FR7: Troupe admin manages members/roles; remove member after confirmation (membership only, not account deletion).  
FR8: Navigate between multiple troupes.  
FR9: Edit troupe-specific pseudo.  
FR10: Upload/replace avatar (JPEG/PNG/WebP, ≤ 2 MB); one-time Google photo import.  
FR11: Create/edit/archive **leagues** (multiple non-archived active per troupe).  
FR12: Create/edit/archive events with title, datetime, location, description, type, lifecycle status.  
FR13: View active seasons/events; inactive hidden from members/visitors.  
FR14: Configure event types, roles, mandatory volunteer coverage.  
FR15: Linked participant records availability (available/unavailable/unknown).  
FR16: Role-level availability; mandatory volunteer when configured.  
FR17: Organizer/admin proxy availability with audit.  
FR18: Optional availability comment (≤ 500 chars); proxy editable.  
FR19: Organizer views eligible participants per role.  
FR20: Weighted random draw.  
FR21: Manual assign/reassign; multi-role stacking per event type config.  
FR22: Draft composition hidden by default; explicit publish.  
FR23: Validate (lock) before confirmations; unlock returns to editable.  
FR24: Per-role odds after publish or validation (draw events).  
FR25: Linked participant confirm/decline after validation.  
FR26: Proxy confirm/decline with audit.  
FR27: Gap handling (manual assign, partial draw, targeted notification).  
FR28: Composition lifecycle states (preparing → draft → awaiting → gaps → complete).  
FR29: Global browser push opt-in/out (MVP).  
FR30: Global push preferences; per-category post-MVP.  
FR31: Distinct notification intents (dispos, draft shared, confirmation, recap).  
FR32: Public troupe directory (freemium default).  
FR33: Public season/event pages for listed troupes.  
FR34: Season/event organizer delegation.  
FR35: Audit trail (actor, subject, action, timestamp; before/after for key fields).  
FR36: Account profile, password change, email change with verification.  
FR37: Account deletion with confirmation and anonymization.  
FR38: **(Post-MVP)** Self-service guest invitations.  
FR39: **(Post-MVP)** External contributor selection modes.  
FR40: PWA installability.  
FR41: Post-deploy client update without cache-clear as sole remedy.  
FR42: Troupe member CSV import/export.  
FR43: Season participant roster (members + non-members).  
FR44: Event-only participants.  
FR45: Optional email linking → auto-link on first sign-in.  
FR46: Preferred roles pre-selected on availability form.  
FR47: Anonymized workflow analytics (product operators only, MVP).  
FR48: Personal user agenda (upcoming, paginated ≤ 50, troupe/league filters, separate inter-troupe rows).  
FR49: Post-login routing: deep link → last league → `/agenda` → empty guidance.  
FR50: League creation roster mode (all active members vs empty manual).  
FR51: Event detail → league workspace + troupe hub navigation.  
FR52: Troupe hub (leagues, pseudo, admin, directory).  
FR53: League workspace three views: Agenda, Historique, Statistiques.  
FR54: Separate CSV exports for Historique and Statistiques.  
FR55: Cross-scope filters; hidden when exactly one troupe or one league (RES-001).  
FR56: Travel league for déplacements; no new `deplacement` template on show leagues.  
FR57: Draw within single league; cross-league fairness post-MVP.  
FR58: Personal season glance route `/membre/:userSlug` with filters.  
FR59: View another participant's season glance (transparency).  
FR60: DEPLACEMENT stats from travel leagues only; legacy template until migrated.

**Total FRs: 60** (58 MVP + 2 post-MVP FR38–FR39)

### Non-Functional Requirements

NFR-P1: TTI ≤ 3 s p95 on Fast 3G for primary flows; lists ≤ 50 rows.  
NFR-P2: Read latency ≤ 500 ms p95 for season list, event detail, availability summary.  
NFR-S1: TLS 1.2+; secure session storage; no credentials in logs.  
NFR-S2: 0 unauthorized cross-troupe/role exposures; 100% protected endpoints tested.  
NFR-S3: Account deletion within 30 days; documented runbook.  
NFR-S4: CSV import/export admin-only; row-level errors; no data leaks.  
NFR-S5: Participant email admin-only; name-only without email works 100%.  
NFR-R1: 0 P0 version-skew defects > 24 h; coupled deploy smoke tests.  
NFR-R2: Async notification failures logged; 0 orphaned confirmation states.  
NFR-SC1: Load test 50 troupes × 100 members × 50 events with NFR-P2 met.  
NFR-A1: WCAG 2.1 AA baseline on core flows; axe 0 critical; keyboard operable.  
NFR-I1: Auth provider ≥ 99% success over 7 days.  
NFR-Q1: ≥ 80% backend coverage; 100% of critical FR paths tested; 0 disabled tests without waiver.

**Total NFRs: 12**

### Additional Requirements

- Brownfield: Firebase V1 production until migration slices complete.
- Open product decisions: REST versioning (`/v1`), WCAG AA default, analytics privacy.
- Cross-troupe encounter linking: post-MVP (Epic 15); MVP uses independent labelled events.
- Troupe join **requests** referenced in FR52 have no dedicated FR — relies on Epic 4 directory browse.

### PRD Completeness Assessment

**Strong.** FR1–FR60 numbered with measurable NFRs, journey traceability matrix updated for FR48–FR60, MVP scope paragraph aligned with League journey. Minor residual: FR52 “request joining” is implicit via FR32/Epic 4, not explicit.

---

## Epic Coverage Validation

### Epic FR Coverage Extracted

All FR1–FR60 mapped in `epics.md` § FR Coverage Map:

| FR range | Epic(s) |
|----------|---------|
| FR1–FR5, FR36–FR37 | Epic 1 |
| FR6–FR10, FR42 | Epic 2 |
| FR11–FR14, FR34, FR43–FR45, FR53–FR54, FR60 | Epic 3 |
| FR32–FR33 | Epic 4 |
| FR15–FR19, FR46 | Epic 5 |
| FR20–FR28 | Epic 6 |
| FR38–FR39 | Epic 7 (post-MVP) |
| FR29–FR31 | Epic 8 |
| FR35 | Epic 9 |
| FR40–FR41 | Epic 10 |
| FR47 | Epic 11 |
| FR48–FR49, FR51, FR55 (agenda) | Epic 12 |
| FR11 (extended), FR50, FR56–FR57 | Epic 13 |
| FR52 | Epic 14 |
| FR55, FR58–FR59 | Epic 16 |
| Encounter linking | Epic 15 (post-MVP) |

### FR Coverage Analysis

| FR | PRD | Epic Coverage | Status |
|----|-----|---------------|--------|
| FR1–FR47. | … | Epics 1–12 | ✓ Covered |
| FR49–FR52 | League journey | Epics 12–14 | ✓ Covered |
| FR53–FR60 | ADR 0012 | Epics 3, 13, 16 | ✓ Covered |
| FR38–FR39 | Post-MVP | Epic 7 | ✓ Marked post-MVP |

### Missing FR Coverage

**None.** All 60 PRD FRs have an epic assignment.

### Text Drift (non-blocking)

| FR | PRD nuance | Epics inventory text | Severity |
|----|------------|----------------------|----------|
| FR6 | League roster → agenda | “active seasons” access | Minor — update epics inventory for consistency |
| FR7 | Remove after confirmation | Shorter summary | Minor |
| FR11 | Multiple concurrent leagues | “seasons for a troupe” | Minor — epic body correct |

### Coverage Statistics

- Total PRD FRs: **60**
- FRs covered in epics: **60**
- Coverage percentage: **100%**

---

## UX Alignment Assessment

### UX Document Status

**Found** — two active specs + one legacy:

1. **`ux-design-hatcast-v2.md`** — event detail, dispos, équipe, Statistiques/Historique patterns, admin Membres. `/seasons` marked **superseded for members** (2026-05-24).
2. **`ux-design-journey-league-agenda.md`** — UX-DR13–18: post-login, `/agenda`, filters RES-001, troupe hub, league creation.
3. **`ux-design-specification.md`** — excluded from primary assessment (older; partial overlap with v2 admin).

### Alignment Issues

| Area | PRD | UX | Architecture | Status |
|------|-----|-----|--------------|--------|
| Member hub | FR48–FR49 `/agenda` | UX-DR13–14 | Route table ✓ | ✓ Aligned |
| League workspace split | FR53 | UX-DR9, UX-DR19 | `/ligue/:slug` tabs ✓ | ✓ Aligned |
| Filters RES-001 | FR55 | Journey doc + UX-DR14 | `filterBarVisible` API ✓ | ✓ Aligned |
| Season glance route | FR58–FR59 | UX-DR8 | `/membre/:userSlug` ✓ | ✓ Aligned |
| Travel leagues | FR56 | UX-DR20 | **Thin** — routes yes, data model not detailed | ⚠️ Gap |
| `/seasons` back nav | — | v2 still references `/seasons` in some screen flows | Demote in Epic 14 | ⚠️ Residual refs in v2 |
| Story 3.3 (done) | FR53 three views | May predate 3.6b split | — | ⚠️ Regression risk until 3.6b ships |

### Warnings

1. **Dual UX period ending** — v2 supersession note exists; remaining `/seasons` back-links in v2 should be batch-updated when Epic 14 lands.
2. **Travel league (FR56)** — UX-DR20 and Story 13.6 defined; architecture lacks explicit travel-league schema/conventions section (see ADR 0012 only by reference).
3. **Stakeholder sign-off** on `ux-design-journey-league-agenda.md` still recommended before Epic 12 UI polish (process, not spec gap).

---

## Epic Quality Review

### Epic Structure Validation

| Epic | User value? | Independent? | Notes |
|------|-------------|--------------|-------|
| 1–6 | ✓ | Sequential chain OK | Core product loop |
| 7 | ✓ (post-MVP) | After 3.8 | Growth |
| 8–9 | ✓ (members/admins) | Transverse | Acceptable |
| 10 | ✓ | After core routes | PWA/update |
| 11 | Borderline | Transverse | Operator analytics — acceptable for FR47 |
| 12–14 | ✓ | Wave deps documented | League journey |
| 15 | ✓ (post-MVP) | Optional | Placeholder OK |
| 16 | ✓ | Depends 12.3, 3.6 | Backward deps only ✓ |

**No pure technical-milestone epics** (no “Setup Database” epic).

### Story Quality — Critical / Major / Minor

#### 🔴 Critical Violations

None blocking full assessment. **Epic 13 migration (Story 13.1)** remains the highest delivery risk: Story 3.1 shipped with single-active invariant; 13.5 retest mandatory before closing Epic 13.

#### 🟠 Major Issues

1. **Epic 12 — no story files** — `12-1` through `12-6` exist only in `epics.md`; not `ready-for-dev`. Blocks Wave 1 dev beyond API sketch.
2. **Story 13.1–13.2 AC thin** — migration and multi-active API need expanded AC in dedicated story files (per prior league assessment; still open).
3. **Story 14.5 forward dependency** — troupe hub directory link blocked until Epic 4 (FR32) — documented, plan accordingly.
4. **Story 3.6 filename legacy** — file `3-6-vue-historique-...` vs scope Statistiques; 3.6b split adds confusion risk for devs.

#### 🟡 Minor Concerns

1. FR6/FR11 wording/com inventory wording drift vs PRD (cosmetic).
2. Story 16.1 file exists; Epic 12 stories do not — uneven story-file maturity.
3. `ux-design-specification.md` still referenced from UX-DR10 in epics — prefer hatcast-v2 as sole admin reference.

### Best Practices Compliance Summary

| Check | Result |
|-------|--------|
| Epics deliver user value | ✓ (11 borderline but OK) |
| Epic independence (no N requires N+1) | ✓ with documented wave order |
| Stories appropriately sized | ✓ mostly; 13.x needs enrichment |
| No forward within-epic dependencies | ✓ |
| Clear acceptance criteria | ✓ for done stories; thin for 13.x |
| FR traceability maintained | ✓ |

---

## Summary and Recommendations

### Overall Readiness Status

**READY WITH CAVEATS**

| Track | Status | Rationale |
|-------|--------|-----------|
| **Core loop (Epics 1–3, 5–6 partial)** | **READY WITH CAVEATS** | Epics 1–2 largely done; 3.8 done; continue 5.4+, 6.4+ |
| **Wave 0 (Story 2.9)** | **READY** | Story 2.9 **done**; post-login routing implemented |
| **Wave 1 (Epic 12 — user agenda)** | **READY WITH CAVEATS** | Architecture + PRD aligned; need `create-story` for 12.1–12.6 |
| **ADR 0012 (3.6b, 13.6, 16.1)** | **READY WITH CAVEATS** | Story files for 3.6b, 13.6, 16.1 exist or ready-for-dev |
| **Wave 2 (Epic 13 — multi-active + travel)** | **NOT READY** | Migration 13.1 design + retest 13.5 before production |
| **Wave 3 (Epic 14 — troupe hub)** | **NOT READY** | Depends Wave 1–2; 14.5 blocked on Epic 4 |
| **Full League vision (12–14 + 13 + 16)** | **NOT READY** | Expected — planning complete, implementation pending |

**Improvement since 2026-05-24 league delta report:** architecture updated (multi-active, `/agenda` API), PRD traceability fixed, sprint-status includes Epics 12–14/16, Story 2.9 done, UX v2 supersession note added.

### Critical Issues Requiring Immediate Action

1. **`create-story` for Epic 12.1** — OpenAPI response shape for `GET /v1/me/agenda` before UI work.
2. **Story 13.1 migration design** — Flyway + rollback plan before enabling multi-active leagues in production.
3. **Ship 3.6b** — Historique/Statistiques split (FR53) to avoid conflating views still implied by Story 3.3 delivery.

### Recommended Next Steps

1. Run **`bmad-create-story`** for **12.1** (API agenda) then **12.2–12.5** in wave order.
2. Continue **Epic 5.4+ / 6.4+** in parallel (core loop) per PLAN gate awareness.
3. Implement **3.6** and **3.6b** (already `ready-for-dev`) to close ADR 0012 league workspace gap.
4. Enrich **13.1–13.2** story files with migration AC; schedule **13.5** retest checklist before closing Epic 13.
5. Add **travel league** subsection to `architecture.md` (FR56 / ADR 0012) — schema flag or league `kind`, DEPLACEMENT aggregation rules.
6. Optional: deprecate or archive **`ux-design-specification.md`** pointer in epics UX-DR10 → hatcast-v2 only.

### Final Note

This assessment identified **8 issues** across **4 categories** (UX residual refs, architecture depth, story-file maturity, Epic 13 migration risk). **No FR coverage gaps.** The product is **ready to continue implementation** on the core loop and **Wave 1 (Epic 12)** after story file creation. The **full League member journey** (Epics 12–14, 16 + Epic 13 migration) remains **not ready** until Wave 2–3 complete — which is expected after the 2026-05-24 planning pivot.

---

*Assessor: BMAD `bmad-check-implementation-readiness` workflow — full scope run 2026-05-24*
