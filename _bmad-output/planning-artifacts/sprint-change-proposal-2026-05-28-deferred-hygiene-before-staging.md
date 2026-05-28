# Sprint Change Proposal — Hygiene H1 before staging (deferred triage)

**Date:** 2026-05-28  
**Author:** Correct Course (BMad)  
**Approver:** Patrice (product) — **approved 2026-05-28**  
**M1 gate:** **Option B** — **M1** after **OPS-2** only; remainder of Hygiene H1 may run in parallel with **M1**; complete **5-7**, **2-10**, **12-7**, **6-13** before first full **MIG-2** import.  
**Trigger:** PO request to reorder work using [deferred-triage-2026-05.md](../implementation-artifacts/deferred-triage-2026-05.md) before **M1** staging and before the **iso-V1** wave  
**Change scope:** **Moderate** (PLAN execution order + new hygiene backlog items; no code in this step)

**Inputs:** [deferred-triage-2026-05.md](../implementation-artifacts/deferred-triage-2026-05.md), [PLAN.md](../../PLAN.md) § Pre-prod V2 + migration, [sprint-status.yaml](../implementation-artifacts/sprint-status.yaml), [growth-backlog.md](growth-backlog.md) (G-003), [AGENTS.md](../../AGENTS.md) (SPEC vs PLAN separation)

---

## 1. Context — why now

| Factor | Detail |
|--------|--------|
| **App coherence** | MVP pilot gate is **done** (2026-05-25); Epic 17 hub/navigation stories through **17.23** are largely **done**; **17.24** is in **review**. The product surface is stable enough to aim at **real data** on staging, not seed-only recette. |
| **Deferred package** | ~97 atomic items in [deferred-work.md](../implementation-artifacts/deferred-work.md) were triaged (2026-05-28): **~28 % obsolete (A)**, **~15–20 % actionable** before/at staging (H1 + G + partial C), remainder **H2 / post-staging / iso-V1 / archive**. |
| **Obsolescence risk** | Continuing feature waves without closing H1 items (CI confidence, read-on-write on dispos summary, auth race, slug import edge) increases the chance that **MIG-2** recette and **M1** deploy expose issues already documented in code reviews. |
| **PO direction (challengeable)** | Run a **small Hygiene H1** wave → **M1** + **MIG-2+** → **iso-V1** (curated list, not raw deferred) → **H2** + growth backlog. |

**Not in scope of this SCP:** changing MVP functional scope in **SPEC.md**; implementing hygiene or staging in this step.

---

## 2. What does not change

| Area | Unchanged |
|------|-----------|
| **MVP definition** | Pilot DoD and gates in **PLAN.md** (MVP navigation, composition, pilote) remain **done**; no reopening of closed MVP stories except via explicit new hygiene stories. |
| **SPEC / DOMAIN** | No requirement edits; hygiene addresses **quality, perf, and ops confidence** already noted in reviews and **ISSUES**/growth notes, not new capabilities. |
| **Post-MVP epics** | Epics **4, 7–11, 13–15** stay backlog per PLAN § Explicitly hors MVP V2. |
| **M0 / OPS-1 / MIG-1** | Completed; **M2/M3** runbook status unchanged. |
| **ADR 0013 / 0014** | Troupe-first navigation and no seed on `cloud` remain authoritative. |
| **Epic 13.6** | Travel-league creation **cancelled** (ADR 0013); do not reopen via deferred. |

---

## 3. Hygiene wave — mini-epics (max 4)

Hygiene items are **PLAN-only** slices (ops/tech debt), not SPEC features. IDs below are proposed backlog keys until promoted via `bmad-create-story`.

### H-ARCHIVE — Deferred registry hygiene

| Field | Value |
|-------|--------|
| **Scope** | Apply triage §7: add **Archive / closed (triage 2026-05-28)** header to `deferred-work.md`; IDs **DW-018, DW-022–024, DW-029–030, DW-037, DW-040–041, DW-070, DW-073, DW-075, DW-028** (obsolete pgcrypto note). Consolidate duplicate clusters per triage §6 (H2/pgcrypto, `data[0]`, LIMIT-002→17.11). |
| **Suggested stories** | **DOC-1** (chore): one documentation PR — no product AC. |
| **DoD** | Header + pointer to triage live; no silent deletion of historical bullets; active deferred unchanged below the fold. |
| **Risks** | Low — doc-only; risk is **desync** if future reviews append without DW IDs (mitigation: reference triage in AGENTS/PLAN hygiene note). |

### H-CI-TEST — Integration test confidence (staging gate)

| Field | Value |
|-------|--------|
| **Scope** | **DW-099**, **DW-001**, **DW-004** — validate `./gradlew test` / CI on **Postgres** (or documented test profile); close Flyway H2 / `V3_1` seed narrative after green CI. Optional: document `application-test.yml` + `gen_random_uuid` (replaces obsolete pgcrypto deferred text). |
| **Suggested stories** | **OPS-2** — CI integration tests on Postgres (P0 hygiene). |
| **DoD** | CI green for integration tests previously blocked on H2 seed; `deferred-work` cluster C items marked closed in archive section; no **M1** blocker from “unknown red CI”. |
| **Risks** | Medium effort if CI lacks Postgres job today; **low product risk**. Triage: **does not block M1 infra** except **confidence** — PO may still want this before first staging recette. |

### H-PERF-RACE — Perf and concurrency (H1 subset)

| Field | Value |
|-------|--------|
| **Scope** | **DW-079** + **G-003** (read path must not write on `GET …/availability/summary`); **DW-068** (N+1 `GET /members`); **DW-044** (agenda `loadAgenda` race); **DW-054** (post-login navigation mutex); **DW-085** (`publishComposition` notifications in-transaction — prep Epic 8). |
| **Suggested stories** | **5-7** — Decouple availability summary read from `ensureMembershipParticipants` (align **G-003**, **PERF** track). **2-10** — Members list query: eliminate N+1 emails. **12-7** — Agenda load: abort stale responses + login navigation lock (bundle **DW-044** + **DW-054** if one story preferred). **6-13** — Publish: defer notifications out of transaction (**DW-085**). |
| **DoD** | Measurable: summary endpoint read-only on hot path; members list ≤1 round-trip for emails at troupe scale; no double navigation after OAuth on staging; publish path documented or fixed for post-commit notifications. |
| **Risks** | **5-7** touches hot dispos path — needs profiling baseline (triage + **6.11** pattern). **6-13** small change, high leverage before notifications epic. |

### H-MIG-READY — Migration/staging smoke (H1 tail)

| Field | Value |
|-------|--------|
| **Scope** | **DW-031** — slug backfill parity (`translate` vs `slugify` NFD) verified for **MIG-2** exotic titles; **DW-002** — `check-pwa.sh` with parametric **V2 staging** `BASE_URL`. |
| **Suggested stories** | **MIG-2-prep-slugs** (script/validation task under MIG backlog, or subtask of **MIG-2** story when created); **OPS-3** — PWA smoke on staging URL (optional, small). |
| **DoD** | Checklist item on MIG-2 runbook for slug edge cases; one successful PWA manifest check against staging host. |
| **Risks** | **DW-031** is data-dependent — failure appears only with prod import, not seed MVP. |

**H1 cap (triage):** 8–10 actions — map to **OPS-2**, **5-7**, **2-10**, **12-7**, **6-13**, **DOC-1**, **OPS-3**, **MIG-2 slug check** (not all need separate stories; PO may merge **12-7**).

**Explicitly not H1 (→ H2 / post-staging):** DW-017 formula parity, DW-088 slots API filter, Epic 13, bulk 17.x polish, **DW-038–039** dispos spec (after **5-7**).

---

## 4. Impact on PLAN.md

**Applied 2026-05-28** (PO option **B**). Sections below were the proposed diff; see [PLAN.md](../../PLAN.md) § Pre-prod, backlog ops, Hygiene H1, Execution order revised.

### Proposed diff — new subsection after “Execution waves (revised)”

```markdown
### Execution order revised (2026-05-28 — SCP hygiene-before-staging)

| Phase | Scope | Outcome |
|-------|--------|---------|
| **Hygiene H1** | H-ARCHIVE, H-CI-TEST (**OPS-2**), H-PERF-RACE (5-7, 2-10, 12-7, 6-13), H-MIG-READY tail | CI trust + recette-ready perf/auth; deferred archive |
| **M1** | Infra pre-prod | Staging env live (SPA + API + Flyway) |
| **MIG-2 → MIG-4** | V1 export/import loop on staging | Real troupe data; tag migration |
| **Iso-V1 wave** | Curated product gaps (§ iso-V1 in triage) | Parity track separate from deferred reviews |
| **Hygiene H2 + growth** | Cluster C remainder, D polish, G-005/006 ideas | Post-staging hardening |

**Gate:** **M1** SHOULD NOT wait on full H1 cosmetic closure; MUST wait on **OPS-2** (CI Postgres) per triage unless PO waives (see Open question).
```

### Proposed diff — backlog ops table (append rows)

| ID | Title | Priority | Statut |
|----|-------|----------|--------|
| **OPS-2** | CI: integration tests on Postgres / test profile doc | P0 | backlog |
| **OPS-3** | PWA smoke script — staging `BASE_URL` (**DW-002**) | P2 | backlog |

### Proposed diff — cross-reference

Add one line under **Pre-prod V2 + migration**:

> Hygiene backlog and deferred triage: [deferred-triage-2026-05.md](_bmad-output/implementation-artifacts/deferred-triage-2026-05.md), SCP [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md).

---

## 5. Impact on deferred-work.md — future governance

| Rule | Action |
|------|--------|
| **When to archive** | After each code-review story **done**: triage bucket **A** or **B→A** within 2 weeks; batch quarterly if volume low. |
| **Triage link** | New reviews append to `deferred-work.md` (append-only); assign **DW-###** at next triage or inline `DW-xxx` in the bullet. |
| **Authoritative sort** | [deferred-triage-2026-05.md](../implementation-artifacts/deferred-triage-2026-05.md) is the **2026-05** snapshot; next triage → `deferred-triage-YYYY-MM.md` without rewriting history. |
| **Active vs closed** | Closed IDs listed in header **Archive / closed** (per triage §7); optional future `deferred-work-archive.md` only if PO wants physical split. |
| **PLAN vs SPEC** | Hygiene priorities live in **PLAN** and SCPs; do not move deferred bullets into **SPEC.md**. |
| **Growth backlog** | **G-003** stays in [growth-backlog.md](growth-backlog.md); implementation tracked by story **5-7** (or ISSUES **PERF-002** when opened). |

---

## 6. Iso-V1 wave (separate from hygiene)

Use **§5 Liste iso-V1** in [deferred-triage-2026-05.md](../implementation-artifacts/deferred-triage-2026-05.md) — **not** the raw deferred code-review list.

| Theme | PLAN / sprint anchor | Notes |
|-------|----------------------|-------|
| Historique ligue — compositions passées, consultation mode | **3.6b** reserve (**DW-020–021**) | Product F, not H1 |
| **Mon compte** hub | **17.24** `review`, **17.25** `done` | Finish 17.24 before or in iso-V1 wave |
| Compte MAJ / suppression | **1.6**, **1.7** backlog | Legal/product timing |
| Annuaire / pages publiques | **Epic 4** | Marketing parity |
| Notifications, audit, invités | **Epics 8, 9, 7** | Post-staging |
| PWA client update | **10.2** | Post-staging |
| Multi-saisons / roster ligue | **Epic 13** (not **13.6**) | Post-staging / **MIG-4** alignment |
| Export migration | **MIG-2/3/4** | **G** bucket — runs with staging, not hygiene |
| Catalogue rôles par troupe | **G-006** | Post-iso idea |
| Changelog / navigation polish | Epic **17** backlog rows in PLAN | Schedule inside iso-V1, not deferred D items |

**Mixing rule:** Do not schedule iso-V1 items as “hygiene” solely because they appear in `deferred-work.md` product reserve sections (**F** bucket).

---

## 7. Explicitly deferred / Won’t fix pre-staging

| Bucket | Treatment pre-staging |
|--------|-------------------------|
| **A** (obsolete) | Archive only — no dev |
| **D** (cosmetic, test gaps, commit hygiene) | **Won’t fix** pre-staging unless regression in CI |
| **F** (product reserve) | Route to **iso-V1** or post-MVP epics — **not** H1 |
| **B** (promoted to story) | Close in archive when story **done** |
| **H2 cluster C** (OpenAPI merge, etc.) | Post-staging |
| **Epic 13.6** | Won’t fix (ADR 0013) |
| **Large E items** (ACL matrix **DW-057**, RFC 7807 **DW-067**, composition locks **DW-050**, etc.) | Post-staging unless staging recette proves blocker |

---

## 8. Recommended approach

**Path:** **Direct adjustment** — insert **Hygiene H1** phase in PLAN execution order; add **OPS-2** + targeted stories; keep **M1** and **MIG-*** sequence intact after H1 gate.

| Option | Pros | Cons |
|--------|------|------|
| **A — Full H1 then M1** (PO default) | Highest confidence on first staging recette | Delays M1 days/weeks |
| **B — M1 after OPS-2 only** (triage-aligned) | Staging infra early; parallel H1 perf | First recette may hit known perf/auth issues |
| **C — M1 parallel with H1** | Fastest calendar | Ops/debugging noise on staging |

**Recommendation:** **B** — treat **OPS-2** as the **hard gate** for **M1**; run **5-7** + **2-10** in parallel with M1 deploy if capacity allows; complete **12-7**, **6-13**, **DOC-1**, **OPS-3** before **MIG-2** first full import.

**Effort (order of magnitude):** H1 ≈ 1–2 dev weeks (1–2 stories at a time per retro rule); M1 ops ≈ depends on CI/Neon setup (existing backlog).

**Risk:** Low scope creep if hygiene stays tied to **DW-xxx** / **G-003** IDs; **medium** if iso-V1 scope is mixed into H1.

---

## 9. Implementation handoff

| Classification | **Moderate** — PLAN + backlog reorg; PO approves gate **M1 vs H1** |
|----------------|---------------------------------------------------------------------|

| Role | Action |
|------|--------|
| **PO** | Approve SCP; decide **Option A vs B** for M1 gate; prioritize iso-V1 vs **17.24** review |
| **Dev** | `bmad-create-story` for **OPS-2**, **5-7**, **2-10** (order below); `bmad-dev-story` after files exist |
| **PM** | No epic renumbering; add **OPS-2/3** to PLAN backlog ops when approved |
| **Architect** | Consult only if **OPS-2** requires new CI Postgres service |

**Success criteria:**

1. PLAN shows **Hygiene H1 → M1 → MIG-2+ → Iso-V1 → H2** execution order.
2. `deferred-work.md` has triage archive header.
3. **OPS-2** green in CI.
4. **M1** DoD met with staging URL documented for **OPS-3** / OAuth recette (**DW-054**).

---

## 10. Next actions — three BMad stories (proposed IDs)

Execute in order after PO approval:

| # | Command | Story ID (proposed) | Title | Source |
|---|---------|---------------------|-------|--------|
| 1 | `bmad-create-story` → `bmad-dev-story` | **OPS-2** | CI integration tests on Postgres / test profile | **DW-099**, H-CI-TEST |
| 2 | `bmad-create-story` → `bmad-dev-story` | **5-7** | Availability summary: read-only hot path (no write on GET) | **DW-079**, **G-003**, H-PERF-RACE |
| 3 | `bmad-create-story` → `bmad-dev-story` | **2-10** | Members list: fix N+1 user email fetch | **DW-068**, H-PERF-RACE |

**Follow-on (same wave, not the “next 3”):** **DOC-1** (archive header), **12-7**, **6-13**, **OPS-3**, MIG-2 slug validation (**DW-031**).

**Parallel product track:** Close **17-24** (`review` in [sprint-status.yaml](../implementation-artifacts/sprint-status.yaml)) as iso-V1 entry, not hygiene.

---

## 11. Checklist (Correct Course — condensed)

| Item | Status |
|------|--------|
| Trigger documented | [x] |
| PRD/Epics impact | [N/A] — no SPEC change |
| PLAN impact proposed | [x] §4 |
| sprint-status impact | [!] Add **OPS-2**, **5-7**, **2-10** when stories created |
| deferred-work governance | [x] §5 |
| Implementation routed | [x] §9–10 |

---

## 12. Approval

- [x] PO approves execution order and M1 gate — **Option B**
- [x] Apply PLAN.md **Proposed diff** sections
- [x] Run `bmad-create-story` for **OPS-2** → [ops-2-ci-integration-tests-postgres.md](../implementation-artifacts/ops-2-ci-integration-tests-postgres.md)
