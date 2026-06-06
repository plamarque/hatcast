# UX — Participant roster admin & Dispos subject selector (as-built)

**Status:** As-built reference (2026-06-06)  
**Commits:** `0af82cb3` (Dispos selector), `570ce4b0` (participant dialogs)  
**Backlog:** [plan-participant-roster-ux-enhancements.md](./plan-participant-roster-ux-enhancements.md) (Lots A/B)  
**Normative refs:** FR17, FR43–FR45, UX-DR5, stories **3.8**, **5.3**, **5.5**, **5.7**, **17.16**

---

## Purpose

Capture the **intended product behaviour** after demo fixes so future work (Lot A typeahead, Lot B gender) does not regress or contradict shipped UX/API contracts.

---

## 1. Dispos — subject selector (organizer proxy)

### As-built behaviour

| Aspect | Rule |
|--------|------|
| **Who sees it** | Users with `canManageComposition` on the event, **Moi** view only (`UX-DR5`) |
| **Options source** | **`GET …/availability/summary`** participants list for **this event** — same eligible roster as **Tous** (season ACTIVE + event-only ACTIVE, minus event exclusions) |
| **Not used for dropdown** | `GET …/seasons/{id}/participants/selectors` (season-wide; omits event-only guests) |
| **Display** | `mat-select` + `app-user-avatar` per row (`availability-subject-selector`) |
| **Edit path** | Select in dropdown **or** tap person in **Tous** → switches to **Moi** with proxy form (**5.5** AC6) |
| **Name-only / event-only** | Must appear in dropdown when eligible for the event (**5.5** AC3, FR43–FR45) |

### Roster sync (story 5.7)

- **Summary GET** remains read-only (no `ensureMembershipParticipants`) — unchanged.
- **Membership sync** on event open still runs via **`event-detail.ts`** parallel `listSeasonParticipantSelectors` (resolves linked participant for chrome / Activité tab).
- **Dispos tab** no longer duplicates the selectors fetch; one less API call on tab load.

### Conformity

| Source | Verdict |
|--------|---------|
| **FR17 / 5.5** | ✅ Aligns — fixes gap where proxy was impossible for event-only / name-only rows |
| **UX-DR5 / ux-design-hatcast-v2 § Dispos** | ✅ Aligns — subject switch for org/admin unchanged; pool corrected |
| **5.3 story Dev Notes** (line « `participants/selectors` + permissions ») | ⚠️ **Stale** — implementation uses summary roster; update story note, not behaviour |
| **5.7 AC3** (dispos-tab parallel selectors) | ⚠️ **Wording stale** — sync preserved via **event-detail** parent load; dispos-tab no longer parallel |

---

## 2. Participant add / edit dialogs

### Surfaces

| Dialog | Route / entry |
|--------|----------------|
| Add season participant | `/saison/:slug/admin/participants` → **Ajouter** |
| Add event-only participant | `/saison/:slug/event/:eventSlug/admin/participants` → **Ajouter** |
| Edit participant | Season or event admin list → row action |

### As-built layout (M3)

| Element | Spec |
|---------|------|
| Structure | `mat-dialog-title` → `mat-dialog-content` → inner **`.participant-form-dialog`** grid (not class on `mat-dialog-content`) |
| Fields | `mat-form-field` **outline** + **`subscriptSizing="dynamic"`** |
| Nom affiché | Required; autofocus on add |
| Email | Optional; placeholder `participant@example.com` |
| Hint (email) | **Paragraph** below fields — not `mat-hint` (avoids clipped labels + spurious scroll) |
| Event-only add | Extra hint paragraph: *« Personne présente uniquement pour ce spectacle… »* |
| Content overflow | `mat-dialog-content`: `overflow: visible`, `max-height: none` for these short forms |
| Errors | `var(--mat-sys-error)` ; inline `role="alert"` |

### Copy (FR)

| Context | Hint |
|---------|------|
| Season + event add | *Si l'email correspond à un compte HatCast, le participant sera lié automatiquement.* |
| Edit | *Si l'email correspond à un compte HatCast, le participant sera lié et pourra devenir organisateur·ice.* |

### Conformity

| Source | Verdict |
|--------|---------|
| **FR43–FR45** | ✅ Unchanged semantics (name-only, optional email, auto-link) |
| **17.16** (dialog pattern, hint reuse) | ✅ Preserved; layout only |
| **FRONTEND_UI.md checklist M3** | ✅ Improved (`subscriptSizing`, tokens) |
| **Lot A (typeahead)** | 🔜 Will extend **Nom affiché** field — this dialog shell is the target surface |

---

## 3. What future work must not undo

| Shipped intent | Lot A / B guardrail |
|----------------|---------------------|
| Dispos dropdown = **event roster** | Do not revert to season-only selectors |
| Event-only guests in Dispos proxy | Keep summary-sourced options |
| Name-only create without email | Typeahead **optional**; free-text submit still valid |
| Email field optional | Keep for link + future invite (Epic 8) |
| Dialog: no label clip / no ghost scroll | Preserve inner wrapper + overflow rules when adding autocomplete |

---

## 4. Doc drift — recommended amendments (non-blocking)

| Document | Action |
|----------|--------|
| `5-3-…md` Dev Notes table | Replace « `participants/selectors` » with « summary eligible roster (+ event-detail selectors for sync) » |
| `5-7-…md` AC3 | Note sync via `event-detail.ts`; dispos-tab no longer calls selectors |
| `ux-design-hatcast-v2.md` § Dispos toolbar | Add row: dropdown options = **eligible event roster** (same as Tous) |
| `plan-participant-roster-ux-enhancements.md` | Mark dialog layout + dispos fix as **shipped** |

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-06 | Initial as-built after commits `0af82cb3`, `570ce4b0` |
