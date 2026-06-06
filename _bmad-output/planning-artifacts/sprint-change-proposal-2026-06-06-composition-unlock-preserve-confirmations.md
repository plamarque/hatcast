# Sprint Change Proposal — Composition unlock preserves participation status

**Date:** 2026-06-06  
**Author:** Product / Correct Course — investigation conversation (unlock → reset `pending` vs V1 `playerStatuses` preservation)  
**Approver:** Patrice (product) — **approved 2026-06-06**  
**Trigger:** Unlocking a validated composition resets all slot participation statuses to `pending`, forcing full re-confirmation cycles and blocking organizer proxy confirm in draft; contradicts V1 behaviour, the 2026-06-06 notification matrix intent, and day-to-day organizer workflow.  
**Change scope:** **Moderate** (normative FR23/FR26 + story amendments **6.6**, **6.8**, **8.5**; companion spec; implementation story TBD via `bmad-create-story`)

**Companion spec (implementation kernel):** [`spec-composition-unlock-preserve-confirmations.md`](../implementation-artifacts/spec-composition-unlock-preserve-confirmations.md)

---

## 1. Issue Summary

| Topic | Current V2 behaviour | Problem |
|-------|---------------------|---------|
| **Unlock** | Clears `validatedAt` **and** sets every assigned slot to `pending` | Loses who had already confirmed or declined |
| **V1 reference** | `unconfirmCast` preserved all `playerStatuses` | V2 story **6.6** deliberately diverged (FR23 read as global reset) |
| **Organizer proxy (FR26)** | `CompositionParticipationService` rejects when `validatedAt == null` | Orgs must validate → unlock → edit → revalidate for small fixes |
| **Notifications (2026-06-06)** | Revalidate → `RECONFIRMATION_REQUEST` for non-`confirmed` only | Undermined: unlock wipes `confirmed`, so everyone is re-notified |
| **Member visibility** | After unlock, members see **no slots** (`visibility: none`) even if `publishedAt` set | No leak of draft edits or preserved statuses to members — **keep as-is** |

**Stakeholder decisions (locked 2026-06-06, pending SCP approval):**

| # | Decision |
|---|----------|
| D1 | On **unlock**, **preserve** `participationStatus` (`confirmed`, `declined`, `pending`) for each slot whose assignee is unchanged |
| D2 | On **draft edit** (post-unlock), **reset to `pending`** only for slots whose **assignee changes** (assign / replace / draw on that slot); unchanged slots keep status |
| D3 | **Organizer/admin proxy** confirm / decline / pending (**FR26**) is allowed in **organizer draft** (`validatedAt == null`), **without member notification** until re-validation |
| D4 | **Member self-service** confirm/decline (**FR25**) remains **validated-only** — unchanged |
| D5 | **Member visibility** after unlock unchanged — ordinary members do not see slot assignments until re-validation |
| D6 | **Notifications** unchanged from [`spec-composition-notify-on-validate-only.md`](../implementation-artifacts/spec-composition-notify-on-validate-only.md) matrix, now **reachable** because statuses survive unlock |
| D7 | **Resolve G-014** (proxy confirm in draft) — move from deferred to **in scope** for this change |

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| **FR23** (PRD, epics) | Wording change — unlock preserves statuses; targeted reset on draft slot mutation |
| **FR26** (PRD) | Clarify proxy participation applies in organizer draft (audit only; no dispatch until validate/revalidate) |
| **FR25, FR28, FR31** | No change to member-facing rules; revalidate notification matrix **works as designed** once unlock stops wiping statuses |
| **Story 6.6** | AC4 + unlock semantics section — amend (was: reset all to `pending`) |
| **Story 6.8** | Extend AC — proxy in organizer draft |
| **Story 8.5** | Cross-reference amendment; revalidate removal notification for assignees dropped in draft (if not already implemented) |
| **spec-composition-notify-on-validate-only** | Amend matrix row « Unlock »; close **G-014** |
| **OpenAPI** | `composition/unlock` + `participation` descriptions |
| **Code** | `CompositionService.unlockComposition` (remove status reset loop); `CompositionParticipationService` (allow proxy when draft); tests per companion spec |
| **UX / six-state badge** | Draft (`En préparation`) may show mixed statuses to organizers — badge rules unchanged (states 2–5 require `validatedAt != null`) |
| **Audit (FR35)** | Slot assign + participation proxy already traced — no new audit types required |
| **ADR** | None required — restores V1-aligned semantics; supersedes 6.6 deliberate divergence note |

**Not in scope:**

- PIN gate before unlock (still deferred per 6.6)
- Changing `publishedAt` behaviour on unlock
- Member self-confirm in draft
- Auto `TEAM_VALIDATED_FYI` on validate (still G-012)

---

## 3. Recommended Approach

**Option 1: Direct Adjustment** — amend normative docs + one implementation story (suggested id **6.6b** or **6.22**).

| Attribute | Value |
|-----------|-------|
| Effort | **Small–medium** (unlock 1-line removal + participation gate + assign/revalidate tests) |
| Risk | **Low** — aligns code with existing notification matrix and V1 |
| Rollback | Revert unlock status preservation (single code path) |

**Rationale for change vs status quo:** The global reset was a conservative V2 interpretation of FR23 (« re-opens confirmation requirements »). With audit granularity and validate-only notifications, **targeted** invalidation (slot assignee change only) is sufficient and matches organizer intent.

---

## 4. Detailed Change Proposals

### 4.1 `prd.md` — FR23

**OLD:**

> FR23: An organizer can **validate (lock)** a composition **before confirmation requests are sent** to participants. A **season organizer, event organizer, or troupe administrator** can **unlock or invalidate** a validated composition to return it to an editable state, which re-opens confirmation requirements for affected slots.

**NEW:**

> FR23: An organizer can **validate (lock)** a composition **before confirmation requests are sent** to participants. A **season organizer, event organizer, or troupe administrator** can **unlock or invalidate** a validated composition to return it to an **organizer-visible editable draft** (`validatedAt` cleared). **Unlock preserves** each assigned slot's participation status (`confirmed`, `declined`, `pending`). **Draft edits** (manual assign, replace, clear, draw on a slot) set **`pending`** on slots whose **assignee changes**; unchanged slots keep their status. **Re-validation** after unlock sends confirmation intents only to assignees who are **not `confirmed`** at re-validation time (and to **newly assigned** participants). Ordinary troupe members **do not see** slot assignments after unlock until the composition is validated again, regardless of `publishedAt`.

---

### 4.2 `prd.md` — FR26

**OLD:**

> FR26: A **season organizer, event organizer, or troupe administrator** can confirm or decline on behalf of a participant in their authorized scope, including name-only or not-yet-linked participants, with auditability.

**NEW:**

> FR26: A **season organizer, event organizer, or troupe administrator** can confirm, decline, or reset to pending on behalf of a participant in their authorized scope, including name-only or not-yet-linked participants, with auditability — **including while the composition is in organizer draft** (`validatedAt` null). Proxy participation in draft is **not notified** to the subject until composition **validation or re-validation** (FR31). **Linked members** may still confirm or decline **only after validation** (FR25).

---

### 4.3 `epics.md` — FR23 bullet (Epic 6 header)

**OLD:**

> FR23: … unlock … return it to an editable state, which re-opens confirmation requirements for affected slots.

**NEW:** Same text as **§4.1 FR23 NEW** (keep epics FR block aligned with PRD).

---

### 4.4 `epics.md` — Story 6.6 acceptance criteria

**OLD (AC2 excerpt):**

> **Given** une composition validée, **when** un organisateur autorisé **déverrouille/invalide**, **then** la composition redevient éditable et les exigences de confirmation sont réouvertes pour les créneaux affectés (FR23).

**NEW:**

> **Given** une composition validée, **when** un organisateur autorisé **déverrouille**, **then** `validatedAt` est effacé, les assignations restent, les statuts de participation **sont préservés**, la composition redevient éditable pour les orgas/admins, et les membres ordinaires ne voient plus les slots (FR23).  
> **Given** une composition en brouillon orga post-déverrouillage, **when** l'organisateur **remplace l'assigné** d'un slot, **then** le nouveau assigné passe à `pending` ; les slots non modifiés conservent leur statut (FR23).

---

### 4.5 Story file `6-6-validation-verrouillage-de-la-composition.md` — amendments

**Replace AC4:**

**OLD AC4:**

> … all assigned slots' **`participationStatus` reset to `pending`** (re-open confirmations per **FR23**) …

**NEW AC4:**

> … **`validatedAt` is cleared**, assigned slots **remain**, **`participationStatus` is preserved** on unlock (confirmed / declined / pending unchanged), draw/manual assign/clear become available again, members lose validated visibility until re-validated — **FR23**. Draft slot mutations reset **`pending` only when the assignee changes**.

**Replace « Unlock semantics (normative) » bullet:**

**OLD:**

> - **Reset** `participationStatus` → **`PENDING`** on assigned slots (re-open confirmation requirements).  
> V1 **preserved** `playerStatuses` on unlock … V2 **resets to pending** per FR23 …

**NEW:**

> - **Preserve** `participationStatus` on unlock (align V1 `unconfirmCast`).  
> - **Targeted reset:** draft assign/replace/clear/draw on a slot sets **`pending`** for that slot when assignee changes.  
> - **Supersedes** 2026-05 V2 global reset — SCP 2026-06-06.

**Add amendment footer:**

```markdown
## Amendment 2026-06-06 (SCP composition-unlock-preserve-confirmations)

- Unlock no longer resets all slots to `pending`.
- See companion spec: spec-composition-unlock-preserve-confirmations.md
- Implementation: story TBD (6.6b / 6.22)
```

---

### 4.6 Story `6-8` — proxy in draft (add AC)

**ADD:**

> **Given** a composition in **organizer draft** (`validatedAt` null) with assigned slots, **when** an authorized organizer records confirm / decline / pending for an assignee via proxy, **then** the slot `participationStatus` updates, audit records actor + subject, and **no** composition workflow notification is dispatched until validate/revalidate — **FR26**, **FR31**.

---

### 4.7 `spec-composition-notify-on-validate-only.md` — amendments

**Update matrix row « Unlock »:**

| Trigger | State | Dispatch | Forbidden |
|---------|-------|----------|-----------|
| Unlock | validated → organizer draft | — | Any composition workflow intent; **must not** mutate participation statuses |

**Update « Revalidate » row (clarify precondition):**

| Revalidate | organizer draft → validated | `RECONFIRMATION_REQUEST` (assignees with status ≠ `confirmed` at validate time) | `CONFIRMATION_REQUEST` (if prior validate audit exists), `TEAM_VALIDATED_FYI` |

**Remove / resolve deferred:**

- ~~**G-014** — proxy confirm in draft~~ → **In scope** (SCP 2026-06-06)

**Add cross-reference:**

> Participation status preservation on unlock: [`spec-composition-unlock-preserve-confirmations.md`](spec-composition-unlock-preserve-confirmations.md)

---

### 4.8 `8-5-extensions-notifications-membre.md` — AC5 footnote

**ADD after AC5:**

> **Amendment 2026-06-06:** « Unaffected confirmed assignees » requires unlock **not** to reset `confirmed` → see SCP composition-unlock-preserve-confirmations. Former assignees removed during draft post-unlock may receive `REMOVED_FROM_COMPOSITION` on **revalidate** (implementation story).

---

### 4.9 OpenAPI `composition.yaml` (descriptions only)

**`POST …/composition/unlock`:** document that participation statuses are **preserved**; visibility returns to organizer draft for managers.

**`POST …/composition/slots/…/participation`:** document organizer proxy allowed when `validatedAt` is null; member self-service requires `validatedAt` set.

---

## 5. Behaviour matrix (normative — recette target)

| Event | `validatedAt` | Slot statuses | Member sees slots | Notifications |
|-------|---------------|---------------|-------------------|---------------|
| Validate (first) | set | non-`confirmed` → `pending` then dispatch; `confirmed` preserved | yes | `CONFIRMATION_REQUEST` non-`confirmed` assignees only |
| Member confirms | set | that slot → `confirmed` | yes | — |
| **Unlock** | cleared | **preserved** | **no** | — |
| Org proxy confirm in draft | null | updated per action | no | — |
| Draft replace Alice→Bob | null | Bob → `pending`; other slots unchanged | no | — |
| Revalidate | set | non-confirmed → `pending` before dispatch | yes | `RECONFIRMATION_REQUEST` to non-`confirmed` only |
| Revalidate + Alice was removed in draft | set | — | yes | Alice → `REMOVED_FROM_COMPOSITION` (if in scope impl) |

---

## 6. Implementation Handoff

| Scope | **Moderate** (small code delta, test matrix expansion) |
|-------|--------------------------------------------------------|
| **Route to** | Approve SCP → `bmad-create-story` → `bmad-dev-story` |
| **Suggested story id** | **6.6b** or **6.22** — « Unlock preserve participation + proxy draft » |
| **Deliverables** | Kotlin unlock + participation gate; integration tests listed in companion spec |
| **Depends on** | **6.6** (done), **6.8** (done), **8.5** / notify spec (done 2026-06-06) |
| **Success criteria** | See companion spec acceptance criteria |

**Test cases for implementation story (preview — not executed in this SCP):**

1. Unlock with mixed confirmed/pending/declined → statuses unchanged; member visibility `none`
2. Unlock → org proxy confirm slot → status updated; no notification
3. Unlock → replace assignee → new assignee `pending`; untouched slots keep `confirmed`
4. Unlock → edit → revalidate → `RECONFIRMATION_REQUEST` only to non-confirmed; confirmed silent
5. Regression: first validate sends `CONFIRMATION_REQUEST` only to non-`confirmed` assignees; proxy-confirmed in draft stay `confirmed`; draft assign still silent

---

## 7. Checklist Summary

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done |
| 2 Stakeholder decisions | [x] Locked — Patrice 2026-06-06 |
| 3 Epic / FR impact | [x] Done — FR23, FR26; stories 6.6, 6.8, 8.5 |
| 4 Artifact proposals (OLD/NEW) | [x] Done |
| 5 Behaviour matrix | [x] Done |
| 6 Implementation handoff | [x] Done — story TBD |
| 7 Patrice approval | [x] **Approved 2026-06-06** |
| 8 Apply normative edits to PRD/epics/stories | [x] Done |
| 9 `bmad-create-story` | [ ] Next — story **6.6b** / **6.22** |

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-06 | Draft SCP + companion spec from unlock investigation |
| 2026-06-06 | Patrice approved; normative edits applied (PRD, epics, 6.6, 6.8, 8.5, notify spec, OpenAPI) |
