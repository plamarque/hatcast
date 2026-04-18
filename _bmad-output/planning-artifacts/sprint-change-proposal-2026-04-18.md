# Sprint Change Proposal — Frontend stack pivot (Vue/PrimeVue → Angular 21 + Angular Material)

**Project:** hatcast  
**Author:** Correct Course workflow (BMad)  
**Date:** 2026-04-18  
**Trigger (user):** Revisit architecture — adopt **Angular 21** with **Angular Material** for the frontend instead of the currently documented **Vue 3 + Vite + PrimeVue** stack.

---

## 1. Issue Summary

### Problem statement

The planning artifacts (PRD, architecture, UX design, epics) consistently specify a **Vue 3 + Vite** SPA with **PrimeVue** as the primary UI layer. The product owner now wants to **standardize the frontend on Angular 21 and Angular Material**. This is a **technology-stack pivot** for the client tier; it does not change core domain goals (seasons, availability, composition, API-backed model) but it **invalidates numerous explicit decisions and acceptance criteria** that name Vue, Vite, PrimeVue, Pinia, and PrimeVue-specific UX patterns.

### Context / discovery

- No single implementation story is required as the unique “trigger”; this is a **strategic / architectural decision** before or during solutioning.
- **Evidence:** Current documents bind the MVP and NFRs to Vue + PrimeVue (e.g. `prd.md` § target stack; `architecture.md` starter templates, frontend structure, component naming; `ux-design-hatcast-v2.md` and `epics.md` reference PrimeVue throughout).

### Issue type (checklist 1.2)

- **Strategic pivot** (preferred framework and UI library change) with optional overlap with **failed approach** only if the team had already committed heavy Vue-only work—in that case, sunk cost should be assessed in implementation planning.

---

## 2. Impact Analysis

### 2.1 Epic impact

| Area | Assessment |
|------|------------|
| **Domain epics (seasons, events, availability, etc.)** | **Functional scope unchanged.** Stories remain valid at the *user-outcome* level. |
| **Technical implementation** | **Widely impacted.** Any story that cites **PrimeVue**, **Vue SFC**, **Pinia**, **Vite**, or **create-vue** must be rewritten to **Angular**, **Angular Material**, **RxJS/signals/NgRx or chosen state approach**, and **Angular CLI / application builder**. |
| **Epic completion “as originally planned”** | **No** at the wording/AC level — acceptance criteria must be updated so reviews are not blocked by obsolete tech references. |

### 2.2 Story impact

- **All stories** that mention **PrimeVue**, **Dialog**, **DataTable**, **Tag**, **toast** mapped to PrimeVue, or **Vue Router / Pinia** need **targeted edits** to Angular Material (e.g. `MatDialog`, `MatTable`, `MatSnackBar`) and Angular routing/state idioms.
- **New or split stories** may be needed for: **Angular workspace setup**, **Angular Material theming** (replacing PrimeVue + tokens narrative), **migration or greenfield** boundary if the repo still contains a Vue SPA.

### 2.3 Artifact conflicts

| Artifact | Conflict / update needed |
|----------|---------------------------|
| **PRD (`prd.md`)** | Describes **Vue SPA**, **PrimeVue**, **Vue/TypeScript** skills, MVP proof on **Vue + PrimeVue**. Must be updated to **Angular 21 + Angular Material**, adjust hosting/build notes (still static deploy e.g. GitHub Pages if applicable, but **not** Vite-centric). |
| **Architecture (`architecture.md`)** | Entire **frontend** sections: starter (`create-vue`, PrimeVue install), runtime stack, **Frontend Architecture**, naming (`.vue` → Angular components), structure (`features/`, composables → Angular modules/standalone, services), testing (Vitest vs Jest/Karma/Jest for Angular — align with team choice), error mapping to **Material** snackbars/dialogs. **Brownfield** paragraph must state whether the existing **Vue** codebase is **replaced** or **frozen** during migration. |
| **UX (`ux-design-hatcast-v2.md`)** | Heavy **PrimeVue** mapping; should shift to **Material Design** language (components, density, theming) while **preserving layout/continuity** goals from V1. |
| **Epics (`epics.md`)** | Global assumptions (PrimeVue, PrimeVue Dialog, etc.) and many **Given/Then** lines must be reconciled with **Angular Material**. |
| **Implementation readiness report** | Historical snapshot; **regenerate or addendum** after PRD/UX/architecture/epics are updated (`bmad-check-implementation-readiness`). |

### 2.4 Technical / repo impact

- **Build:** Angular CLI / `ng build`, SSR optional — not Vite unless using custom tooling (unlikely as primary).
- **CI/CD:** Still **coupled frontend + backend** (NFR-R1); workflow steps change (Angular build artifacts, cache, tests).
- **Brownfield:** Repository today may still be **Vue** per `architecture.md`; adopting Angular 21 implies **new client package**, **incremental strangler**, or **big-bang** — **must be decided** and recorded (ADR or architecture section).

---

## 3. Recommended Approach

### Selected path: **Direct adjustment** (Option 1) — with **major** documentation and implementation scope

- **Rationale:** The product requirements at the **business level** are stable. The change is **replaceable implementation technology** on the client. The correct move is to **update PRD, architecture, UX, and epics** to Angular 21 + Angular Material and add **explicit migration/parallel-run** decisions for any existing Vue code.
- **Rollback (Option 2):** Only relevant if **substantial Vue V2 code** was already merged for the new stack; then rolling back Vue-specific stories could reduce duplication of effort. Assess in a **spike**, not assumed here.
- **MVP review (Option 3):** **Not required** for domain scope unless Angular migration **extends timeline** so much that scope must be cut — flag as **risk**, not automatic scope cut.

### Effort / risk / timeline

| Dimension | Level | Notes |
|-----------|--------|------|
| **Documentation** | Medium | Many files; systematic find/replace insufficient — need conceptual pass (Material vs PrimeVue). |
| **Implementation** | **High** | New framework; team skills must include **Angular**; brownfield Vue increases migration cost. |
| **Risk** | Medium–High | Framework churn; ensure **one** source of truth for UI patterns (Material theming + accessibility). |

### Classification

- **Change scope:** **Major** — affects foundational technical decisions across PRD, architecture, UX, and most UI-related stories; likely **Product Manager / Architect** alignment before dev sprints proceed at full speed.

---

## 4. Detailed Change Proposals (high level)

Documents should be edited in **`document_output_language` (English)** for consistency with existing artifacts.

### 4.1 PRD (`prd.md`)

- Replace **Vue SPA** with **Angular 21** SPA (wording: single-page application delivered by Angular).
- Replace **PrimeVue** with **Angular Material** as the **primary UI layer**; retain constraint **avoid Tailwind as the primary styling surface** (still valid; Material theming + SCSS/CSS variables as needed).
- Update **resource requirements** from **Vue/TypeScript** to **Angular/TypeScript**.
- Update **MVP approach** sentence to prove **Kotlin/Spring Boot + PostgreSQL + Angular + Angular Material** (not Vue + PrimeVue).
- Review **PWA / service worker** bullets — Angular has its own PWA/ngsw story; ensure consistency.

### 4.2 Architecture (`architecture.md`)

- Replace **create-vue** / **PrimeVue** starter narrative with **Angular CLI** (`ng new`) or workspace policy; document **Angular Material** installation and **theming** approach.
- Update **target runtime stack** line to **Angular 21 + Angular Material**.
- **Frontend structure:** Angular **standalone components** (recommended modern default) or NgModules — pick one and document; feature folders under `src/app/...` aligned with Angular style guide.
- **State:** Replace Pinia with **signals + injectable services**, **NgRx**, or other chosen pattern — **decision required**.
- **Testing:** Align with Angular defaults (**Jest** or **Karma/Jasmine** per project choice) and **Playwright** for E2E per PRD.
- **Brownfield:** Explicit paragraph: legacy **Vue** assets vs new **Angular** app — coexistence strategy.

### 4.3 UX design (`ux-design-hatcast-v2.md`)

- Global replace of “implement with PrimeVue” with **Angular Material** components where applicable (`MatTable`, `MatDialog`, `MatButton`, chips, etc.).
- Preserve **V1 continuity** goals (layout, density, tokens); map tokens to **Material theme** customization.

### 4.4 Epics (`epics.md`)

- Update **global stack** and **UX-DR** references that name PrimeVue.
- For each story with **PrimeVue** in **Given/Then**, substitute **Angular Material**-equivalent behavior (or neutral “per UX design and Material components”).

### 4.5 Example story edit (pattern)

**Story:** (e.g. availability modal — Epic 5)  
**Section:** Acceptance criteria  

**OLD:**  
`... PrimeVue Dialog ...`

**NEW:**  
`... Angular Material dialog (MatDialog) ...`

**Rationale:** Stack pivot; AC must match implementable technology.

---

## 5. Implementation Handoff

| Role | Responsibility |
|------|----------------|
| **Product / planning** | Approve stack change; accept potential timeline impact. |
| **Architect / tech writer** | Run **`bmad-create-architecture`** (or equivalent) to refresh architecture doc; add ADRs for **state management** and **Vue→Angular migration**. |
| **PM / PO** | Schedule **`bmad-edit-prd`** or manual PRD update; sync **`bmad-create-ux-design`** or UX doc pass for Material. |
| **Dev** | After docs are consistent, scaffold Angular 21 app + Material; align CI; implement stories. |

### Success criteria

- [x] PRD, architecture, UX, and epics **no longer contradict** Angular 21 + Angular Material (updated 2026-04-18).  
- [ ] **`bmad-check-implementation-readiness`** re-run passes or lists only non-stack gaps.  
- [x] Repo strategy (greenfield Angular vs migration) is **documented** in `architecture.md` (brownfield / legacy Vue + illustrative `hatcast-web/` Angular tree).  

### Sprint status file

- `sprint-status.yaml` was **not found** under `_bmad-output`. When sprint tracking exists, update epic/story entries per approved changes (checklist item 6.4).

---

## 6. Checklist status (summary)

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done — strategic pivot to Angular 21 + Material |
| 2 Epic impact | [x] Done — broad AC updates; domain epics stable |
| 3 Artifacts | [x] Done — PRD, architecture, UX, epics, readiness report |
| 4 Path forward | [x] Done — Direct adjustment + Major scope |
| 5 Proposal components | [x] Done |
| 6 Final review | [x] Done — user approved; planning artifacts updated **2026-04-18** |

### Post-approval artifact updates (2026-04-18)

The following files were aligned with **Angular 21 + Angular Material**: `prd.md`, `architecture.md`, `ux-design-hatcast-v2.md`, `epics.md`; `implementation-readiness-report-2026-04-18.md` annotated for stack pivot. `sprint-status.yaml` not present — N/A.

---

## 7. User approval

**Status:** **APPROVED** by Patrice on **2026-04-18** (response: oui).

**Next steps (post-approval):**

1. ~~Update planning artifacts~~ — **Done** (2026-04-18).  
2. Run **`bmad-check-implementation-readiness`** when you want a fresh alignment report.  
3. For code: **`bmad-quick-dev`** or **`bmad-dev-story`** to scaffold the Angular 21 + Material app and align CI pipelines.

---

_Correct Course workflow — proposal complete._
