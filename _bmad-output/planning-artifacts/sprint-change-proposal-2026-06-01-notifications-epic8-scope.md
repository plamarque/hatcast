# Sprint Change Proposal — Notifications model & Epic 8 scope (post-brainstorm)

**Date:** 2026-06-01  
**Author:** Correct Course (BMad) — from brainstorming session + PO validation  
**Approver:** Patrice (product) — **approved 2026-06-01**  
**Trigger:** Brainstorm session [`brainstorming-session-2026-06-01-notifications-epic8.md`](../brainstorming/brainstorming-session-2026-06-01-notifications-epic8.md) — notification vs inbox, event publish gate, organizer ops family, 6.10 manual nudge  
**Change scope:** **Major** (domain + PRD FR31 + Epic 3/8 story split + PLAN resequencing)  
**Supersedes partially:** SCP iso-V1 § **8.3** intent list (2026-06-02) — narrows MEP **8.3** and adds prerequisites  
**Applied:** 2026-06-01 — `epics.md`, `prd.md`, `PLAN.md`, `sprint-status.yaml`

---

## 1. Issue Summary

### Trigger

While preparing Epic **8.3** (FR31 milestone delivery), product discovery clarified that the current spec conflates:

- **Member action notifications** vs **organizer ops signals**
- **Push/email channels** vs **in-app inbox (pull)**
- **Event creation** vs **publication / open-for-availability** as notification triggers
- **Manual announce (6.10)** vs **automatic cron/SLA reminders**

The existing FR31 bundles four intents aimed largely at **members**, but brainstorming validated different **audiences** per lifecycle step (e.g. draft composition → organizers only; team complete → organizers only).

### Core problem

**Category:** New requirement emerged from stakeholder/product design (not a failed implementation).

**Problem statement:** HatCast cannot deliver coherent FR31 notifications without (1) an explicit **event draft → publish** domain gate, (2) a **notification intent catalog** with audience + channel rules, and (3) a **phased MEP slice** that does not attempt full V1 parity in a single **8.3** story.

### Evidence

- Brainstorm morphological matrix + role storming + reverse principles (18 ideas, 8 anti-patterns → principles).
- PO decisions **Q1–Q3:** draft/publish = **P0**; validate MEP = **assignees only**; orga auto reminders = **P2**.
- **8.1** already shipped (global push opt-in); **17.21** inbox done — principles require inbox ≠ notification log.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **Epic 3** (seasons/events) | **New story required** — event `draft` / `open_for_availability` (or equivalent) before member availability + member notifs. **P0 MEP blocker for 8.3.** |
| **Epic 8** | **Split and extend:** narrow **8.3 MEP**; add **8.4+** organizer ops; reprioritize **8.2** categories for **P1**; optional **8.5** member extensions. |
| **Epic 6** | **6.10** extension (manual availability nudge + recent-send guard) — **P1**, not MEP. |
| **Epic 10** | PWA **inbox badge** — **P2** (cross-cut with 17.21). |
| **Epic 17** | **No change** to inbox API; document pull/push separation in UX spec. |

### Story impact

| Story | Status today | Change |
|-------|--------------|--------|
| **8.1** | done | No rollback. |
| **8.2** | ready-for-dev | Reprioritize **P1** (categories needed for FYI opt-out, presence reminders) — not MEP blocker. |
| **8.3** | backlog P0 | **Narrow MEP AC** — see §4. Depends on new **3.x** publish gate. |
| **NEW 3.x** | — | Event draft + publish/open dispos — **P0**, before **8.3**. |
| **NEW 8.4** | — | Organizer ops auto notifications (SLA, J-7 daily, draft alerts, team complete orga) — **P2**. |
| **NEW 8.5** | — | Member notification extensions (FYI roster, J-7/J-1 presence, removal, re-confirm) — **P1**. |
| **NEW 6.10b** or **8.6** | — | Manual availability nudge + recent-send guard — **P1**. |

### Artifact conflicts

| Artifact | Conflict | Action |
|----------|----------|--------|
| **PRD FR31** | Draft compo + team complete described as member-facing | **Split** FR31 → member intents (MEP subset) + FR31b organizer ops (post-MEP) |
| **epics.md Epic 8.3** | Implies all FR31 intents in one story | Rewrite AC; add stories **3.x**, **8.4**, **8.5** |
| **PLAN.md** | Order **8.1 → 8.3** insufficient | Insert **3.x** before **8.3**; document P1/P2 waves |
| **Architecture** | No unified notification dispatcher model | Add ADR or ARCH section: Intent → Audience → Channel |
| **UX (Share & announce)** | 6.10 = generic broadcast | P1: manual dispo nudge + guard UX |
| **SPEC/DOMAIN** | Event lifecycle may not define publish gate | Add draft/open states + notification principles |
| **sprint-status.yaml** | Missing new story keys | Update after approval (§6) |

### Technical impact

- **Domain:** Event entity + API + UI for draft vs published/open-for-availability.
- **API:** Notification dispatcher service; `NotificationIntent` enum; organizer recipient resolution cascade (`event_organizer` → `season_admin` → `troupe_admin`).
- **No rollback** of 8.1 push infrastructure.
- **8.3 MEP** can ship email + push on unified dispatcher for **two member intents** only.

---

## 3. Recommended Approach

**Selected:** **Hybrid — Option 1 (Direct Adjustment) + Option 3 (MVP Review phasing)**

- **Do not rollback** 8.1 or inbox work.
- **Add** Epic 3 story for publish gate (**P0**).
- **Narrow** 8.3 MEP to minimal member intents.
- **Defer** organizer ops auto, roster FYI, presence reminders, 6.10 nudge to **P1/P2** with explicit story IDs.

| Option | Viable? | Notes |
|--------|---------|-------|
| Direct adjustment | **Yes** | New stories + FR31 split — primary path |
| Rollback | **No** | 8.1/17.21 remain valid |
| MVP review | **Yes** | MEP still includes FR31 **core loop** (dispos + confirm), not full V1 notif matrix |

**Effort:** **High** (domain + dispatcher + 8.3) for MEP slice; **Medium** additional for P1/P2 waves.  
**Risk:** **Medium** — Epic 3 publish gate touches event CRUD, agenda, dispos entry points.  
**Timeline:** **8.3 MEP blocked** until **3.x** draft/publish lands (estimate 1 story before 8.3).

---

## 4. Detailed Change Proposals

### 4.1 PRD — FR31 split

**Section:** Notifications — FR31

**OLD (summary):**
> Four distinct member intents: availability opened, draft composition shared, confirmation request, team-confirmed recap. Push if opt-in; email if troupe policy.

**NEW (proposed):**

**FR31 (Member notification intents — MEP subset):**
- **AVAILABILITY_OPENED** — when organizer **publishes** event / opens availability (not on draft create). Channels: push (FR29), email (troupe policy). Audience: concerned roster participants.
- **CONFIRMATION_REQUEST** — on composition **validate**. Audience: **assigned** participants only. Channels: push, email.

**FR31 (Member — post-MEP initial, P1):**
- **TEAM_VALIDATED_FYI** — on validate; roster non-assigned; **opt-out** category (FR30/8.2).
- **ASSIGNEE_PRESENCE_REMINDER** — J-7 and J-1 for confirmed assignees (readiness + comp info + decline CTA).
- **REMOVED_FROM_COMPOSITION** — mandatory when assignee slot removed after validate.
- **RECONFIRMATION_REQUEST** — when remodel requires new confirmation.

**FR31b (Organizer ops notifications — post-MEP, P2):**
- Draft event created (opt-in pref).
- Draft composition shared (orga circle only).
- SLA: open availability when event < 1 month away.
- Composition incomplete: weekly → daily from J-7.
- Team complete closure signal (orga only).

**Rationale:** Brainstorm validated audience matrix; FR31 as written over-notifies members at draft/complete stages.

---

### 4.2 PRD — FR30 note (optional clarifier)

Add one sentence: category preferences (8.2) apply per **intent** and **channel** (push vs email) on a single enum — not separate ad-hoc flags.

---

### 4.3 Epic 3 — NEW Story 3.21 (proposed id)

**Title:** Event draft and publish — open for availability

**User story:** As a **season or event organizer**, I want events to start in **draft** and **publish** when ready to collect availability, so that members are not notified or able to deposit availability during preparation.

**Acceptance criteria (draft):**
1. **Given** a new event, **when** created, **then** default state is **draft** — no member availability deposits, no AVAILABILITY_OPENED notification.
2. **Given** draft event, **when** organizer **publishes** / **opens availability**, **then** concerned roster may deposit availability; AVAILABILITY_OPENED intent becomes eligible (8.3).
3. **Given** draft, **when** organizer edits venue, description, roster, pre-seeded compo slots, **then** allowed without member visibility for dispos.
4. **UI :** clear draft vs published indicator; publish action in event workspace.

**Depends:** existing 3.2/3.4 event model. **Blocks:** **8.3** MEP.

---

### 4.4 Epic 8 — Story 8.3 (narrow MEP)

**OLD AC (implicit):** All FR31 intents including draft shared, team recap, broad member notify.

**NEW MEP scope:**

| In MEP 8.3 | Out of MEP 8.3 |
|------------|----------------|
| Unified async dispatcher (push + email) | Organizer ops intents (→ 8.4) |
| AVAILABILITY_OPENED on publish (needs 3.21) | Draft compo member notify |
| CONFIRMATION_REQUEST on validate (assignees) | TEAM_VALIDATED_FYI roster (→ 8.5 P1) |
| NFR-R2 failure observability | J-7/J-1 presence (→ 8.5) |
| Eligibility: 8.1 push + global flag; email troupe policy stub | Removal / re-confirm (→ 8.5) |
| No-op default when channel unavailable | Category prefs beyond global (8.2 optional for MEP) |

**Add AC:**
- **Given** validate, **when** notifications emit, **then** only **assigned** participants receive CONFIRMATION_REQUEST (not full roster).
- **Given** draft composition publish, **when** 8.3 MEP, **then** **no** member push/email (orga intent deferred to 8.4).

**Rationale:** PO Q2; reduces 8.3 to shippable MEP core loop.

---

### 4.5 Epic 8 — NEW Story 8.4 (P2)

**Title:** Organizer ops notifications (automatic)

Covers FR31b intents: draft event alert, draft compo orga-only, SLA open dispos, compo incomplete cadence, team complete orga signal. Recipient cascade: event organizers → season admins → troupe admins.

---

### 4.6 Epic 8 — NEW Story 8.5 (P1)

**Title:** Extended member notifications

FYI roster opt-out (needs 8.2 categories), J-7/J-1 presence reminders, removal alert, re-confirmation. Implements remaining member intents post-MEP initial.

---

### 4.7 Epic 6 — Story 6.10 extension (P1)

**Title:** Manual availability reminder + anti-spam guard

One-click « waiting for your availability » from event context; customizable message; warn if reminder sent within N days. Complements auto reminders (8.4), does not replace.

---

### 4.8 Architecture / ADR (proposed)

**Title:** ADR-00XX Notification intent dispatch model

**Decisions:**
1. Inbox (`GET /me/inbox`) = derived **domain state**, not notification send log.
2. One `NotificationIntent` enum; channels filtered per user prefs + eligibility.
3. Publish-before-ping for members.
4. Manual sends record `last_manual_nudge_at` for guard UX.

---

### 4.9 UX — principles (ux-hub-a-faire.md addendum)

- Hub **À faire** = member **actions**, not notification history.
- Organizer tasks stay in season/event workspace (existing rule reinforced).
- 6.10 evolves toward send hub in P1 — not required for MEP.

---

### 4.10 PLAN.md — execution order update

**OLD fragment:**
> 3. **8.1** → **4. **8.3**

**NEW fragment:**

| # | Work | Priority |
|---|------|----------|
| — | **8.1** push opt-in | **Done** |
| **3a** | **3.21** Event draft + publish / open dispos | **P0 MEP** — **blocks 8.3** |
| **3b** | **8.3** Member intents (AVAILABILITY_OPENED + CONFIRMATION_REQUEST assignees) | **P0 MEP** |
| **4** | **10.2** + **10.3** | P0 MEP (parallel OK) |
| **5** | **8.5** + **8.2** categories + **6.10b** manual nudge | **P1** |
| **6** | **8.4** organizer ops auto | **P2** |

---

## 5. Implementation Handoff

### Scope classification: **Major**

Requires PO + architect sign-off on FR31 split and Epic 3 publish gate before dev continues on **8.3**.

### Handoff recipients

| Role | Responsibility |
|------|----------------|
| **PO / PM** | Approve SCP; update PRD + epics.md |
| **Architect** | ADR notification model; Epic 3 state design |
| **Dev** | `bmad-create-story` for **3.21**, revise **8.3** story file, then implement in order |
| **UX** | Draft/publish UI; 6.10 nudge wireframes (P1) |

### Success criteria

- [ ] **3.21** done: members cannot deposit dispos on draft; publish fires domain event for 8.3.
- [ ] **8.3 MEP** sends only two member intents on correct triggers.
- [ ] Inbox unchanged; no duplicate rows on push send.
- [ ] PLAN + sprint-status reflect new story keys.
- [ ] FR31/FR31b documented; no silent spec/code drift.

### Recommended immediate next steps (after approval)

1. Apply edits to `epics.md`, `PLAN.md`, `PRD.md` (or schedule `bmad-edit-prd`).
2. Run **`bmad-create-story 3.21`** (or next free 3.x id).
3. **`bmad-create-story 8.3`** refresh — replace existing backlog story file with narrowed MEP AC.
4. Update `sprint-status.yaml` with **3.21**, **8.4**, **8.5** backlog entries.
5. Defer **8.2** implementation until P1 wave unless categories needed earlier.

---

## 6. Checklist summary (Correct Course)

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done — brainstorm + PO Q1–Q3 |
| 2 Epic impact | [x] Done — Epic 3, 6, 8, 10, 17 |
| 3 Artifact conflicts | [x] Done — PRD FR31, epics, PLAN, ARCH, UX |
| 4 Path forward | [x] Hybrid direct + MVP phasing |
| 5 Proposal components | [x] This document |
| 6 User approval | [x] **Approved** 2026-06-01 (Patrice) |
| 6.4 sprint-status update | [x] Done |
| 6.5 Handoff | [x] Defined above |

---

## Appendix A — Notification intent catalog (reference)

### Member intents

| Intent | Trigger | Audience | MEP? |
|--------|---------|----------|------|
| AVAILABILITY_OPENED | Publish / open dispos | Roster concerned | **P0** |
| CONFIRMATION_REQUEST | Validate | Assignees | **P0** |
| TEAM_VALIDATED_FYI | Validate | Roster non-assigned | P1 |
| ASSIGNEE_PRESENCE_REMINDER | J-7, J-1 | Confirmed assignees | P1 |
| REMOVED_FROM_COMPOSITION | Slot removed | Former assignee | P1 |
| RECONFIRMATION_REQUEST | Remodel | Re-added assignee | P1 |

### Organizer intents (FR31b)

| Intent | Trigger | Audience | Phase |
|--------|---------|----------|-------|
| EVENT_DRAFT_CREATED | Create draft | Orga (opt-in) | P2 |
| DRAFT_COMPOSITION_SHARED | Publish draft compo | Orga circle | P2 |
| SLA_OPEN_AVAILABILITY | T-1 month, dispos closed | Orga cascade | P2 |
| COMPOSITION_INCOMPLETE_WEEKLY | Approaching date | Orga cascade | P2 |
| COMPOSITION_INCOMPLETE_DAILY_J7 | J-7 incomplete | Orga cascade | P2 |
| TEAM_COMPLETE | → complete state | Orga cascade | P2 |

### Manual (6.10 family)

| Intent | Trigger | Phase |
|--------|---------|-------|
| MANUAL_AVAILABILITY_NUDGE | Orga click | P1 |

---

## Appendix B — Normative principles (from brainstorm)

1. Pull/push separation — shared domain source, different UX surfaces.  
2. Intent → audience → channels — stable enum.  
3. Publish before ping (members).  
4. Orga early, member late.  
5. Silence after confirm, except presence / removal / re-confirm.  
6. Manual sends guarded.  
7. MEP honesty — 8.3 = minimal slice.
