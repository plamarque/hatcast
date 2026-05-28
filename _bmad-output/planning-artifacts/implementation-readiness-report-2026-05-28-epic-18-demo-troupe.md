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
assessmentDate: '2026-05-28'
assessmentScope: Epic 18 — Troupe Démo & join_policy (FR61–FR64, V2 prod onboarding)
workflowType: implementation-readiness
overallReadiness: READY WITH CAVEATS
readinessByStory:
  '18.1': READY
  '18.2': READY WITH CAVEATS
  '18.3': READY WITH CAVEATS
  '18.4': READY WITH CAVEATS
  '18.5': READY WITH CAVEATS
productDecisions:
  demoProdBootstrap: option-a-migration-idempotent
  demoProdBootstrapDecided: '2026-05-28'
  devSeedTroupeName: Les Improbots
  devSeedTroupeSlug: les-improbots
  devSeedEmailDomain: seed.improbots.test
  realMigrationTroupeName: La Malice
  prodOnboardingTroupeName: Démo
inputDocuments:
  prd: _bmad-output/planning-artifacts/prd.md
  epics: _bmad-output/planning-artifacts/epics.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  domain: DOMAIN.md
  arch: ARCH.md
  adr-0014: docs/adr/0014-v2-preprod-migration-no-seed.md
  deploy: docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md
  ux-troupes: _bmad-output/implementation-artifacts/17-3-page-troupes-mes-troupes-decouvrir.md
  code-join: services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt
priorAssessment: _bmad-output/planning-artifacts/implementation-readiness-report-2026-05-24-league.md
---

# Implementation Readiness Assessment — Epic 18 Demo troupe (2026-05-28)

**Date:** 2026-05-28  
**Project:** hatcast V2  
**Assessor:** John (PM) / IR workflow  
**Scope:** Readiness to implement **Epic 18** (FR61–FR64) before **V2 production** launch with onboarding sandbox

---

## Executive Summary

| Scope | Readiness | Gate |
|-------|-----------|------|
| **Story 18.1** (schema `join_policy` + `is_demo`) | **READY** | Can start dev |
| **Story 18.2** (self-join OPEN + super-admin PATCH) | **READY WITH CAVEATS** | Resolve admin API shape + season enrollment design first |
| **Story 18.3** (seed prod Démo ~20 events) | **NOT READY** | **ADR-0014 conflict** must be decided before implementation |
| **Story 18.4** (UX join + badge Démo) | **READY WITH CAVEATS** | Depends 18.2–18.3; minor UX gap on badge placement |
| **Story 18.5** (config prod + tests) | **NOT READY** | Blocked by 18.3 delivery mechanism |

**Overall:** **READY WITH CAVEATS** — Patrice decided **Option A** (Demo prod via idempotent `db/migration`) on **2026-05-28**. Dev seed troupe will be renamed **Les Improbots** (distinct from real **La Malice** migration troupe and prod **Démo**). Remaining caveats: ADR-0015 draft, DOMAIN sync, dev seed rename chore, season enrollment on self-join.

---

## Document Discovery

| Document | Role | Status |
|----------|------|--------|
| `prd.md` (FR61–FR64, Journey 8, 2026-05-28) | Requirements | ✓ Complete for Epic 18 |
| `epics.md` (Epic 18, stories 18.1–18.5) | Delivery | ✓ Mapped |
| `DOMAIN.md` | Normative domain | ⚠️ **Drift** — still says self-join limited to seed/demo troupe only (§ Business rules) |
| `architecture.md` | Technical planning | ❌ No `join_policy`, `is_demo`, Demo seed, or admin troupe API |
| `ARCH.md` | Runtime topology | ⚠️ Mentions demo self-join via seed-troupe-id; not updated for FR61–64 |
| `ADR-0014` | Flyway cloud = migration only | ✓ Accepted — **conflicts** with Epic 18.3 wording « Flyway seed production » |
| `DEPLOY_V2_CLOUD_RUN.md` §5.5 | Ops | ✓ Confirms no `db/seed` on cloud |
| `17-3-page-troupes` (done) | UX | ✓ Empty state + join demo button exists |
| OpenAPI `seasons.yaml` | Contract | ⚠️ Still documents seed-troupe-only join |
| Code `TroupeController.joinTroupe` | Runtime | ⚠️ Uses `isSeedTroupe()` — expected until 18.2 |

**Duplicates:** None blocking. **Three troupe names (decided 2026-05-28):**

| Troupe | Environment | Source |
|--------|---------------|--------|
| **Les Improbots** | Local dev / CI test | `db/seed` (rename from legacy « La Malice » seed label) |
| **Démo** | Production onboarding | `db/migration` idempotent bootstrap (Option A) |
| **La Malice** | Staging/prod after V1 migration | Real data import — **not** Flyway seed |

---

## PRD ↔ Epic Coverage (FR61–FR64)

| FR | Epic / Story | Coverage | Notes |
|----|--------------|----------|-------|
| FR61 | 18.2, 18.4, 18.5 | ✓ Mapped | Season participant enrollment on join is **18.2 AC3** — not in code today |
| FR62 | 18.1, 18.2 | ✓ Mapped | Default OPEN on create — 18.1 AC3 |
| FR63 | 18.2 | ✓ Mapped | Endpoint path TBD (`/v1/admin/troupes/{id}` proposed) |
| FR64 | 18.3, 18.5 | ⚠️ Partial | Content spec strong; **delivery mechanism** missing |

**PRD gaps (minor):**

- FR47 exclusion of `is_demo` from adoption KPIs — mentioned in 18.3 Dev Notes only; **no FR/story** for analytics filter implementation (acceptable deferral if documented in 18.3/18.5).
- FR49 empty-agenda copy — covered by 18.4 AC5; verify `/accueil` hub empty state too (Epic 17.19) to avoid inconsistent guidance.

**Verdict:** FR coverage **complete** at epic level; one **implementation prerequisite** (cloud seed strategy) is architectural, not PRD missing.

---

## UX Alignment

| Surface | Spec | Code today | Status |
|---------|------|------------|--------|
| `/troupes` empty state + « Rejoindre la troupe de démonstration » | Story 17.3 (done) | `troupes-list.html` | ✓ Shipped |
| Post-join redirect to agenda / ligue Démo | 18.4 | Partial — reload troupes only | ⚠️ To implement |
| Badge / copy « Démo » (bac à sable) | 18.4 AC3 | Not present | ⚠️ No wireframe — AC sufficient for M3 story |
| Section « Découvrir » stub | 17.3 | Present | ✓ Out of Epic 18 scope |
| Context switcher when user has Démo + own troupe | FR8 | Epic 17.23 | ✓ Compatible |

**UX gaps (non-blocking for 18.1–18.2):**

1. **Placement** of badge « Démo » — context selector vs troupe card vs app bar subtitle (pick one in 18.4 Dev Notes).
2. **Empty agenda** (`/agenda`, `/accueil`) — confirm same CTA as `/troupes` (18.4 AC5 + cross-check 17.19).

**Sally verdict:** Sufficient to **create story file 18.4**; no new UX doc required if AC3 copy is validated by Patrice during dev.

---

## Architecture & Code Alignment

| Topic | PRD / Epic 18 | Current runtime | Gap severity |
|-------|---------------|-----------------|--------------|
| Self-join gate | `join_policy = OPEN` | `TroupeAccessService.isSeedTroupe()` + env UUID | **MAJOR** — 18.2 |
| DB columns | `join_policy`, `is_demo` | `troupes(id, name, slug, created_at)` only | **MAJOR** — 18.1 |
| Season roster on join | FR61 enrolls league participant | `ensureActiveMembership` = membership only | **MAJOR** — 18.2 AC3 |
| Platform admin PATCH join policy | FR63 | `PlatformAdminService` exists; **no troupe admin API** | **MAJOR** — 18.2 |
| Demo UUID | `…000099` | `demoTroupeId` = La Malice `…000001` | **MAJOR** — 18.5 |
| Prod Demo data | FR64 seed ~20 events | **No seed on `cloud` profile** (ADR-0014) | **CRITICAL** — 18.3 |
| Super-admin TROUPE_ADMIN on Démo | 18.3 AC7 | Requires users by email in prod DB | **MINOR** — runbook / post-signup script |
| OpenAPI honesty | OPEN troupe join | « seed/démonstration only » | **MINOR** — part of 18.2 |

### CRITICAL: ADR-0014 vs Story 18.3

[ADR-0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md) and `application-cloud.yml` explicitly disable `classpath:db/seed` on Cloud Run. Story 18.3 AC1 says « Flyway seed **production** » — **these cannot both be true** without a decision.

**Recommended options (product sign-off required):**

| Option | Mechanism | Pros | Cons |
|--------|-----------|------|------|
| **A (recommended)** | New migration(s) under `db/migration/` e.g. `Vxx__product_demo_troupe.sql` — idempotent INSERT … WHERE NOT EXISTS | Runs on cloud; versioned; repeatable empty DB bootstrap | Blurs « schema vs product data »; amend ADR-0014 with exception for **product bootstrap** rows |
| **B** | New Flyway location `db/product-bootstrap` included in **cloud** profile only for Demo | Keeps migration folder pure | New profile config; ops must understand two folders |
| **C** | One-time ops script / GitHub Action after deploy | No ADR change | Not repeatable on Neon reset; drift risk |
| **D** | Admin UI « bootstrap Demo » (super-admin only) | Flexible | Heavy; overkill for MVP |

**Decision (2026-05-28):** **Option A** — Patrice approved. Next: **ADR-0015** (or ADR-0014 amendment): *product bootstrap data* (Demo troupe only, fixed UUIDs, no PII) in `db/migration` with `WHERE NOT EXISTS`; dev seed stays in `db/seed` under troupe name **Les Improbots** (not La Malice).

---

## Epic Quality Review (18.1–18.5)

| Criterion | Assessment |
|-----------|------------|
| Story sizing | ✓ Each story completable by one dev agent |
| Dependency order | ✓ 18.1 → 18.2 → 18.3 ∥ 18.4 → 18.5 |
| No forward dependencies | ✓ |
| Acceptance criteria testable | ✓ |
| AC independence | ✓ |
| Database creation discipline | ✓ 18.1 creates columns only; 18.3 creates Demo rows when run |

**Quality issues to fix in stories (before dev):**

1. **18.3** — Replace « Flyway seed production » with chosen ADR option (migration vs product-bootstrap folder).
2. **18.2 AC3** — Specify service method: e.g. `ensureSeasonParticipantForSelfJoin(userId, seasonId)` using FR50 « all active members » pattern or explicit Demo season id.
3. **18.2 AC4** — Confirm REST namespace: prefer `/v1/admin/troupes/{id}` with `@PreAuthorize` platform admin vs overloading existing controllers.
4. **18.3 AC7** — Document that Patrice/impropick accounts must **exist in prod** before admin membership seed; link by `normalized_email` at deploy or manual SQL step.

---

## Normative Doc Conflicts (must report per AGENTS.md)

| Conflict | Location | Resolution needed |
|----------|----------|-----------------|
| Self-join scope | `DOMAIN.md` L71 « limited to seed/demo troupe » | Update to **`join_policy = OPEN`** after 18.2 |
| Demo troupe identity | `environment.ts` comment « La Malice » | 18.5 |
| ARCH.md demo join | References seed-troupe-id hack | Update when 18.2 ships |
| OpenAPI join description | `seasons.yaml` L102–127 | Update in 18.2 |

---

## Prerequisites Already Met (green lights)

- Epic **1** (auth) — self-join requires authenticated session ✓
- Epic **2.1** — membership API + UI join button ✓
- Epic **3.x** — events, types, compositions for seed content ✓
- Epic **6.x** — lifecycle states for pedagogical matrix ✓
- Epic **17.3** — `/troupes` empty state ✓
- `PlatformAdminService` + `hatcast.auth.super-admin-emails` ✓
- Rich **dev seed patterns** (La Malice V6/V17/V22) as implementation reference ✓

---

## Summary and Recommendations

### Overall Readiness Status

**READY WITH CAVEATS** — Option A and **Les Improbots** dev naming are decided. Epic 18 can proceed; ship gate = ADR-0015 + dev seed rename + stories 18.1–18.5.

### Critical Issues Requiring Immediate Action

1. **ADR-0015:** Document Option A (Demo bootstrap in `db/migration`). **Blocks 18.3 merge to prod.**
2. **Dev seed rename:** « La Malice » → **Les Improbots** (`les-improbots`, `@seed.improbots.test`) across `db/seed` + generator scripts — **before or with 18.1** to avoid continued confusion.
3. **DOMAIN.md drift:** Update self-join business rule with 18.2.
4. **Season participant on self-join:** implement in 18.2 (FR61).

### Recommended Next Steps

1. **Draft ADR-0015** (Option A product bootstrap for Démo only).
2. **Chore story 18.0 or prep task:** rename dev seed to **Les Improbots** (UUIDs unchanged).
3. **Start Story 18.1** (`join_policy`, `is_demo`).
4. **Update Epic 18.3 AC1** to « idempotent `db/migration` bootstrap » (not `db/seed`).
5. **Create story files** `18-1` … `18-5`.

### Final Note

This assessment identified **3 critical** and **5 major** gaps across **architecture**, **normative docs**, and **code**. None invalidate the product direction — they are **expected** one day after EP/CE. With the ADR decision, readiness moves to **READY WITH CAVEATS** for the full epic within one sprint.

---

## Readiness Gate Summary

| Gate | Action |
|------|--------|
| Start **18.1** now? | **Yes** |
| Start **18.2** now? | **Yes**, after sketching admin endpoint + season enrollment |
| Start **18.3** now? | **Yes**, after ADR-0015 draft + AC1 wording update |
| Rename dev seed → Les Improbots? | **Yes** — chore before/during 18.1 |
| Ship Epic 18 to **prod V2**? | After 18.1–18.5 + ADR-0015 + Improbots rename |

**Implementation Readiness complete.** Next: ADR-0015 + dev **18.1** / seed rename.
