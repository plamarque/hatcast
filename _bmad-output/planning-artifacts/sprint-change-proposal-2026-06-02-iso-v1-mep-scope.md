# Sprint Change Proposal — Iso-V1 MEP scope (annuaire, audit, notifications, release UX)

**Date:** 2026-06-02  
**Author:** Correct Course (BMad) — PO decision capture  
**Approver:** Patrice (product) — `/bmad-agent-pm` session  
**Trigger:** Reviews **17-28/29**, **3-20** and **MIG-4** done ; PO defines **remaining iso-V1** before **M4 cutover**  
**Change scope:** **Moderate** (PLAN + triage ; new story placeholders **9-0**, **10-3** via `bmad-create-story`)

---

## 1. Issue Summary

Iso-V1 gate was open on **MIG-4** and hub/stats reviews. Those are **done**. PO now clarifies what **must** ship for **initial V2 production (MEP)** vs **post-MEP initial**.

**PO decisions (2026-06-02):**

| Theme | MEP (iso-V1) | Post-MEP initial |
|-------|----------------|------------------|
| **Public troupe directory** | **In** — parity V1 ; **no** complex self-join flow | Full Epic **4.2** public season/event pages if needed later |
| **Audit** | **Backend capture** — every significant change logged (timestamp, actor, before/after) | **UI** for members (own changes) + admins (all) — Epic **9.1** |
| **Account deletion (1.7)** | **Out** | Later |
| **Password reset (1.3 / FR3)** | **In** — recette gate (story marked **done** ; verify on staging) | — |
| **Notifications email + push (FR31)** | **In** — Epic **8.1** + **8.3** | **8.2** category prefs remain post-MVP |
| **PWA client update (10.2 / FR41)** | **In** | — |
| **Version + changelog in UI** | **In** — new **10.3** (V1 parity footer) | — |

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **Epic 4** | **4.1 only** promoted to iso-V1 P0 ; **4.2** stays post-iso unless PO reopens |
| **Epic 9** | Split: **9-0** capture (MEP) vs **9.1** UI (post-MEP) — FR35 partially satisfied at MEP |
| **Epic 8** | **8.1**, **8.3** promoted to iso-V1 P0 ; **8.2** unchanged (post-MVP categories) |
| **Epic 10** | **10.2** + new **10.3** on MEP path |
| **Epic 1** | **1.7** explicitly **deferred** ; **1.3** recette only |
| **Epics 3, 17** | Close after reviews (done) |
| **PLAN.md** | New § **Wave iso-V1 — MEP remainder** + execution order |
| **deferred-triage §5** | Align iso-V1 list |
| **SPEC** | No change — FR35/FR31/FR32 already in PRD ; MEP = implementation phasing |

---

## 3. Story scope notes

### 4.1 — Annuaire public (minimal iso)

- **In:** Anonymous visitor can browse **public troupe cards** on `/troupes` (section **Découvrir**) — no login required to **see** the list (NFR-S2, FR32).
- **On card click:** redirect to **login** if not authenticated; after login, navigate to troupe hub **only if** user is **member or admin** of that troupe — otherwise **access denied** (clear message, no join wizard).
- **Out of this slice:** Self-service join flows, **4.2** public season/event pages, public hub content without membership.
- **Likely touch:** public `GET` for discoverable troupes ; `/troupes` without forced login on load ; hub route guard + post-login redirect with membership check.

### 9-0 — Audit event capture (backend, MEP)

**Append-only audit log** for FR35 minimum at write time:

| Domain event | Before/after (minimum) |
|--------------|------------------------|
| Availability create/update/**delete** | Status, role selections, comment |
| Composition draft / validate / unlock | Lifecycle state |
| Manual slot assign / **lottery draw** / slot removal | Slot assignments |
| Confirm / decline / withdraw | Confirmation status |
| Proxy actions (5.5, 6.8) | Actor + subject |

Each row: **actor** (`user_id` or system), **subject** (participant when proxy), **action type**, **timestamp** (second precision), **payload** (JSON before/after).

**Out of MEP:** Query API + UI (**9.1**).

### 8.1 + 8.3 — Notifications

- **8.1:** Global push opt-in + server registration.
- **8.3:** FR31 intents on async delivery (email if troupe policy ; push if opt-in): availability opened, draft published, confirmation request, team complete recap.
- **8.2:** Still post-MVP (category prefs).

### 10.2 + 10.3 — Release UX

- **10.2:** SW update detection + visible « Mettre à jour » banner (FR41).
- **10.3:** Display **app version** + **changelog** dialog (reuse `changelog.json` / release pipeline pattern from V1).

---

## 4. Recommended execution order (PO)

| # | Work | Rationale |
|---|------|-----------|
| **0** | Close epics **3**, **17** ; mark **MIG-4** + **4.1** done in PLAN | Hygiene — gate moved forward |
| **1** | ~~**4.1** Annuaire public~~ | **Done** |
| **2** | **9.0** Audit capture backend | **Before prod cutover** — every post-MEP change must be logged ; hooks all domain writes |
| **3** | **8.1** Push opt-in | Prerequisite for push leg of **8.3** |
| **4** | **8.3** Email + push jalons | Highest user-visible gap vs V1 ops ; depends on **8.1** for push |
| **5** | **10.2** + **10.3** PWA update + version/changelog | Release hygiene before M4 ; can parallel **8.x** if two dev tracks |
| **6** | **1.3** recette gate | Story **done** — verify forgot/reset on staging + prod Identity Platform |
| **7** | Replay migration × ≥3 + **M4** cutover | After iso slice ; fresh Neon from V1 prod |

**Parallelism:** **10.2/10.3** can run alongside **8.3** after **9.0** is merged (audit should not wait on notifs).

**Explicitly not on MEP path:** **1.7**, **9.1**, **9.2**, **4.2**, **7** (invitations), **11** (analytics).

---

## 5. Artifact updates

| File | Change |
|------|--------|
| `PLAN.md` | MEP remainder wave, gates, backlog tables |
| `deferred-triage-2026-05.md` | §5 iso-V1 list |
| This SCP | Decision record |

**Next BMad steps:** `bmad-create-story` for **9-0-capture-backend-piste-audit**, **10-3-version-changelog-footer**.

---

## 6. Approval

- [x] PO confirmed scope (2026-06-02)
- [x] Apply PLAN / triage updates
