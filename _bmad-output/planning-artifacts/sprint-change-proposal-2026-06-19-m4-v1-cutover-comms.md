# Sprint Change Proposal — M4 V1 cutover announcement (HatCast 2)

**Date:** 2026-06-19  
**Author:** Correct Course (BMad) — PO decision capture  
**Approver:** Patrice (product) — session `/bmad-correct-course`  
**Trigger:** M4 gate **open** but **deferred** (~Aug 2026) ; PO wants to **refine cutover plan** with a **V1-side comms feature** announcing HatCast 2 and linking to prod `https://hatcast.app` ; **PO schedules V1 deploy** independently  
**Change scope:** **Moderate** (PLAN § M4 + new OPS story + V1 `legacy/` implementation ; no V2 product change)

---

## 1. Issue Summary

### Context

- **V2 prod** is live at **`https://hatcast.app`** (OPS-8 [x], E3 [x], release train validated).
- **M4** (audience cutover — comms, V1 wind-down, OPS-7) is **deferred** until end of V1 season (~4 spectacles, ~Aug 2026) and stakeholder agreement.
- SCP [v2.0.0-cutover-scope](sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) lists M4 as « user comms » but **does not specify** a V1 in-app announcement.
- V1 (`selections.la-malice.fr`) already has a **PWA SW update banner** in `legacy/src/App.vue` (« Une nouvelle version est disponible » → reload same app). That pattern is **not** suitable for redirecting users to V2.

### Problem statement

Before M4, members still use V1 daily. Without an in-app pointer to HatCast 2, the cutover risks being **invisible** until the hard switch. PO wants a **controlled, deployable-on-demand** V1 feature to announce the new version and surface the prod URL — **without** waiting for the M4 date to be fixed.

### Evidence

- PLAN.md § M4 amend. 2026-06-05: « Pas encore : bascule audience (**comms membres**…) ».
- Gate M4 checklist: « reste : décision PO + … + **comms** ».
- V1 banner pattern exists but triggers on **service worker update** only (`updateAvailable && isPwaInstalled()`), CTA = `updateApp()` reload — not external link.
- V1 prod deploy: [docs/v1/technical/DEPLOYMENT.md](../../docs/v1/technical/DEPLOYMENT.md) — PO-operated `release-version.sh` / GitHub Actions.

---

## 2. Impact Analysis

### Epic impact

| Epic / track | Impact |
|--------------|--------|
| **OPS (M4 gate)** | **New story OPS-M4-1** — V1 cutover announcement banner |
| **M4 / E4** | M4 go-live checklist gains explicit **pre-M4 comms** step ; OPS-7 unchanged (still **after** M4) |
| **V2 epics (1–19)** | **No impact** — V2 code not involved |
| **Legacy V1** | One UI feature in `legacy/` ; optional env flag for enable/disable at build |

### Story impact

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| **OPS-M4-1** | V1 cutover announcement banner → HatCast 2 URL | **P0 M4** | **backlog** (create story) |

### Artifact conflicts

| Artifact | Change needed |
|----------|---------------|
| **PLAN.md** | § Wave E / M4 gate — add OPS-M4-1 + pre-M4 comms step in session order |
| **sprint-status.yaml** | Register `ops-m4-1-v1-cutover-announcement-banner: backlog` |
| **SCP v2.0.0 cutover** | Cross-reference this SCP § M4 comms (no rewrite of closed waves) |
| **docs/v1/technical/DEPLOYMENT.md** | Short § « Cutover announcement » — env vars + PO deploy timing |
| **PRD / SPEC / DOMAIN** | **No change** — comms/ops, not new product capability |
| **ARCH.md** | **No change** — no runtime topology change |

### Technical impact

- **`legacy/src/App.vue`** — new top banner (reuse install-banner visual pattern).
- **Build-time config** — `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED`, `VITE_V2_PROD_URL` (default `https://hatcast.app`).
- **Dismiss persistence** — `localStorage` key scoped to announcement version string (re-show on copy/URL bump).
- **Coexistence** — cutover banner **independent** of PWA SW update banner ; if both visible, cutover banner **above** install/update banners (higher z-index or single stacked order).
- **Analytics (optional P2)** — audit log event `v2_cutover_announcement_*` if trivial ; not blocking.
- **Deploy** — V1 prod via existing pipeline ; **PO schedules** (out of V2 `deploy_prod.sh` scope).

---

## 3. Recommended Approach

**Selected: Option 1 — Direct Adjustment (Hybrid OPS + legacy)**

Add **one OPS-M4-1 story** under the existing M4 gate ; implement in `legacy/` ; PO enables via env at build and deploys when ready.

| Criterion | Assessment |
|-----------|------------|
| Effort | **Low** (~0.5–1 day dev + PO deploy) |
| Risk | **Low** — additive UI ; feature-flagged off until PO enables |
| Timeline | **Does not block** M4 date decision ; can ship **weeks before** M4 |
| Rollback | Disable env flag + redeploy V1 |

**Not chosen:**

- **Option 2 Rollback** — N/A (no completed work to revert).
- **Option 3 MVP review** — N/A (no PRD scope change).

**Rationale:** Smallest path that closes the « comms » gap in M4 planning without coupling to V2 release train or fixing the M4 calendar.

---

## 4. Detailed Change Proposals

### 4.1 PO decisions (proposed defaults — confirm at story creation)

| Topic | Proposal | PO override |
|-------|----------|-------------|
| **Surface** | Fixed top banner (same chrome as install/update banners) | Modal alternative → story AC |
| **Audience** | All V1 users (browser + PWA) | Troupe-only filter → defer |
| **Copy (FR)** | Title: **HatCast** — Body: *Une nouvelle version de HatCast est disponible. Retrouvez vos saisons et spectacles sur HatCast 2.* | Edit in `bmad-create-story` |
| **CTA** | **Découvrir HatCast 2** → `https://hatcast.app` (`target="_blank"`, `rel="noopener noreferrer"`) | Same-tab → story AC |
| **Dismiss** | Close button ; persist dismiss in `localStorage` per `announcementVersion` | TTL 7d vs until M4 → PO |
| **Enable** | `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED=true` at V1 **prod build** only when PO ready | PO controls timing |
| **URL** | `VITE_V2_PROD_URL` default `https://hatcast.app` | Override for staging recette |
| **SW update banner** | **Unchanged** — separate concern (same-app PWA reload) | — |
| **Timing vs M4** | Deploy **when PO chooses** ; recommended **2–4 weeks before** M4 window | PO schedules |

### 4.2 Story OPS-M4-1 — acceptance summary (for `bmad-create-story`)

| # | Acceptance criterion |
|---|---------------------|
| 1 | When `VITE_V2_CUTOVER_ANNOUNCEMENT_ENABLED=true`, V1 shows a **dismissible top banner** on all routes with proposed FR copy and CTA to `VITE_V2_PROD_URL`. |
| 2 | When flag is `false` or unset, **no banner** (zero regression). |
| 3 | Dismiss persists for current `announcementVersion` (constant in code or env) ; bumping version **re-shows** banner for users who dismissed. |
| 4 | Banner does **not** replace or hijack PWA SW update flow (`updateApp` unchanged). |
| 5 | Stacking: if install/update banners also visible, layout remains usable (no overlap hiding CTAs). |
| 6 | `data-testid` hooks for E2E: `v2-cutover-announcement`, `v2-cutover-announcement-cta`, `v2-cutover-announcement-dismiss`. |
| 7 | [docs/v1/technical/DEPLOYMENT.md](../../docs/v1/technical/DEPLOYMENT.md) documents env vars and PO deploy checklist. |
| 8 | Recette: enable on **V1 staging** (`hatcast-staging.web.app`) before prod ; PO validates copy + link. |

### 4.3 PLAN.md edits (§ Wave E — Gates cutover)

**OLD (M4 row / gate text):**

> **M4** | Bascule audience prod | **Reporté** — … comms + critères go-live

**NEW:**

> **M4** | Bascule audience prod | **Reporté** — … comms + critères go-live ; **pre-M4:** **OPS-M4-1** V1 announcement banner (PO deploy)

**Add to session order (step 4 area):**

| Step | Work |
|------|------|
| **4a** | **OPS-M4-1** — implement + recette V1 staging ; PO enables prod deploy when ready (independent of M4 date) |
| **4b** | Décision fenêtre **M4** — date, critères go/no-go |

### 4.4 M4 go-live checklist (new subsection — PLAN or runbook)

| # | Item | Owner |
|---|------|-------|
| 1 | OPS-M4-1 deployed on V1 prod with announcement enabled | PO |
| 2 | Link `https://hatcast.app` smoke-tested from mobile + desktop | PO |
| 3 | Commission spectacle / orga briefed (optional email/WhatsApp — out of scope OPS-M4-1) | PO |
| 4 | Fresh migration replay on Neon prod window | Ops |
| 5 | V2 prod release at agreed tag | Dev |
| 6 | DNS / traffic: members directed to `hatcast.app` as primary | PO + Ops |
| 7 | **OPS-7** branch rename **after** M4 | Dev |

### 4.5 sprint-status.yaml entry

```yaml
ops-m4-1-v1-cutover-announcement-banner: backlog  # P0 M4 — V1 comms → https://hatcast.app ; PO schedules deploy
```

---

## 5. Implementation Handoff

### Scope classification: **Moderate**

| Role | Responsibility |
|------|----------------|
| **PO (Patrice)** | Approve SCP ; validate copy ; enable flag + **schedule V1 prod deploy** |
| **Dev (`bmad-create-story` → `bmad-dev-story` or `bmad-quick-dev`)** | Story file + `legacy/` implementation + staging recette |
| **Ops** | No infra change ; V1 uses existing Firebase Hosting pipeline |

### Success criteria

- [ ] SCP approved
- [ ] Story **OPS-M4-1** created and implemented
- [ ] V1 staging recette: banner + link + dismiss OK
- [ ] PO deploys V1 prod when ready (announcement enabled)
- [ ] PLAN.md + sprint-status.yaml updated
- [ ] M4 checklist references OPS-M4-1 as **pre-M4** comms step

### Next BMad steps

1. **Approve this SCP** (yes / no / revise)
2. `bmad-create-story` — **OPS-M4-1** (fresh context recommended)
3. `bmad-dev-story` or `bmad-quick-dev` — implement in `legacy/`
4. PO — V1 staging then prod deploy per [DEPLOYMENT.md](../../docs/v1/technical/DEPLOYMENT.md)

---

## 6. Checklist summary (Correct Course)

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done — M4 comms gap, PO request |
| 2 Epic impact | [x] Done — OPS-M4-1 only |
| 3 Artifact conflicts | [x] Done — PLAN, sprint-status, V1 DEPLOYMENT |
| 4 Path forward | [x] Done — Direct Adjustment |
| 5 Proposal components | [x] Done |
| 6 Approval | [x] Done — PO approved 2026-06-19 |

---

## 7. Approval

- [x] PO confirmed scope (2026-06-19)
- [x] SCP written
- [x] PLAN.md § M4 updated (2026-06-19)
- [x] `sprint-status.yaml` updated (2026-06-19)
