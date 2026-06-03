# Sprint Change Proposal — V2.0.0 cutover scope & release pipeline

**Date:** 2026-06-02  
**Author:** Correct Course (BMad) — PO decision capture  
**Approver:** Patrice (product) — session `/bmad-correct-course`  
**Trigger:** Iso-V1 MEP slice largely **done** (`sprint-status.yaml`) ; PO tour écrans pré-cutover identifie **polish UX**, **compte/sécurité**, **PWA/release**, **modales annonces** et **pipeline release par tags** avant bascule prod **V2.0.0**  
**Change scope:** **Major** (PLAN + backlog + OPS + docs deploy ; supersedes parts of SCP [iso-V1 MEP scope](sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md))

---

## 1. Issue Summary

### Context

V2 is **functionally close to V1 iso** for La Malice (epics 2–6, 12, 16, 17, 18 ; MIG-4 ; 4.1 ; 9.0 ; 8.1/8.3 ; 3.21 ; 6.10b). Before **production cutover**, PO wants a **final V2.0.0 wave** covering:

1. **PWA & release UX** — install assets, update detection, post-update changelog, contextual install aids (iOS/Android), notification opt-in path, **new PWA icon** (HatCast 2 visual signal).
2. **Mon compte** — tabbed layout, consolidated preferences entry points, **sign-up recette (1.2)** + **dedicated sign-up UX (1.2b)**, **email change**, **password change** (logged-in), **forgot-password recette** (1.3), **account deletion** (1.7 — previously deferred).
3. **Announcement modals** — M3 consistency, larger editable message (copy/WhatsApp), simplified manual notify (email + push), anti-spam guard when auto-notifs already sent.
4. **Version & changelog** — visible version (Mon compte or About), clickable changelog modal (also shown after PWA update).
5. **Release pipeline** — staging versioned by **tag** (release script) ; prod deploys **same tagged artifact** (no long-lived prod branch) ; rule: **no prod tag without prior staging deploy of that tag**.
6. **Branch cutover (post-prod)** — archive V1 on `v1` + `staging-v1` ; rename `v2` → `main` (dev) ; `staging-v2` → `staging` ; replay full V1 migration before prod switch.

### Problem statement

The **MEP remainder SCP (2026-06-02)** closed the functional gap list but **under-scoped** account security (1.6/1.7), PWA polish beyond 10.2, announcement modal UX (6.10 shipped but UX debt), release governance (branch-based `production-v2`), and the **V2.0.0** branding/cutover ceremony.

### Evidence

- PO walkthrough notes (2026-06-02 session): PWA install/update/changelog, compte length, pop-up style inconsistency, manual notify verbosity, release workflow preference.
- `sprint-status.yaml`: **10.2**, **10.3**, **1.6**, **1.7** still **backlog** ; **1.3** **done** (recette gate open).
- V1 references: `PWAInstallModal.vue`, `ChangelogModal.vue`, `MessagePreview.vue`, `AppFooter.vue` version link.
- Current deploy: [DEPLOYMENT_WORKFLOW.md](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md) — merge to `production-v2` branch.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **1** Auth & account | **1.6**, **1.7** promoted **P0 V2.0.0** ; **1.3** recette gate only |
| **6** Composition | New **6.15** — refonte modales annonces (builds on **6.10**, **6.10b**) |
| **8** Notifications | **8.1/8.3/8.2** done ; **6.15** wires manual send UX ; **10.6** post-install opt-in prompt |
| **10** PWA | **10.2**, **10.3** P0 ; new **10.4–10.7** (recette manifest, install aids, notif prompt, icon) |
| **17** Hub/navigation | New **17.34** — Mon compte tabs / security layout |
| **OPS** (PLAN backlog) | **OPS-4–7** — tag-based staging/prod, branch cutover ; **OPS-8–10** — domaine prod, PostHog, e-mail (amendement **2026-06-03**) |
| **4**, **7**, **9.2**, **11**, **13** | **11** analytics détaillé post-V2.0.0 sauf baseline **OPS-9** (G-005) |

### Story impact (new / reprioritized)

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| **10.2** | PWA update detection + user-triggered reload | P0 | backlog |
| **10.3** | App version + changelog dialog | P0 | backlog (story file TBD) |
| **10.4** | PWA manifest/icons/SW recette | P0 | backlog (create story) |
| **10.5** | Contextual install aids (iOS/Android/desktop) | P0 | backlog (create story) |
| **10.6** | Notification opt-in prompt (post-install / standalone) | P0 | backlog (create story) |
| **10.7** | HatCast 2 PWA icon set | P0 | backlog (create story) |
| **1.2** | Sign-up email/password | P0 recette | done (code) | Recette gate cutover — link on `/connexion` |
| **1.2b** | Dedicated sign-up UX (V1 parity) | P0 | backlog (create story) |
| **1.6** | Email change + logged-in password change | P0 | backlog |
| **1.7** | Account deletion (sensitive zone) | P0 | backlog |
| **1.3** | Forgot-password flow | P0 recette | done |
| **6.15** | Announcement modals UX + manual notify simplified | P0 | backlog (create story) |
| **17.34** | Mon compte — tabs, preferences entry, About/version | P0 | backlog (create story) |
| **OPS-4** | `release-staging.sh` — tag RC on staging-v2 | P0 | backlog |
| **OPS-5** | Prod deploy from semver tag (no prod branch) | P0 | backlog |
| **OPS-6** | Version/changelog pipeline coupling | P0 | backlog |
| **OPS-7** | Branch cutover runbook + doc updates | P0 | backlog (execute post-cutover) |
| **OPS-8** | Prod `hatcast.app` — Cloud Run `europe-west1`, domain mapping, Cloudflare orange, OAuth/CORS | P0 | backlog |
| **OPS-9** | PostHog EU + reverse proxy `e.hatcast.app` | P1 | backlog (non bloquant M4) |
| **OPS-10** | E-mail `@hatcast.app` (`noreply@`, `info@`) — DNS, FROM prod | P1 | backlog (non bloquant M4) |
| **MIG-E2** | Migration replay × ≥3 from scratch | P0 gate | open |
| **M4** | Production cutover on `hatcast.app` | P0 gate | open |

### Artifact conflicts

| Artifact | Change needed |
|----------|---------------|
| **PLAN.md** | New § **Wave V2.0.0** ; update gates ; close MEP remainder statuses |
| **deferred-triage §5** | Align iso-V1 list with V2.0.0 scope |
| **sprint-status.yaml** | Register new story IDs |
| **DEPLOYMENT_WORKFLOW.md** | Tag-based staging/prod (OPS-4/5) — **after** script work |
| **DEPLOY_V2_CLOUD_RUN.md** | § prod custom domain `hatcast.app` (OPS-8) |
| **BRANCH_ENVIRONMENTS.md** | Post-cutover branch map (OPS-7) |
| **ARCH.md** / **ADR** | Optional ADR for tag-only prod deploy |
| **ux-design-mon-compte.md** | Extend with tab structure (**17.34**) |
| **PRD / epics.md** | No FR change — phasing only ; **1.7** moves from post-MEP to V2.0.0 |
| **SPEC.md** | No change (behaviour already in FR36/FR37/FR40/FR41) |

### Technical impact

- **Angular:** `@angular/pwa` SW update service, `ShareAnnounceDialog` refactor, account page structure, `changelog.json` fetch.
- **API:** Identity Platform flows for 1.6/1.7 ; account deletion policy endpoint.
- **CI:** GitHub Actions trigger on tag `v*.*.*` for production ; staging deploy from RC tag.
- **Assets:** New icon set under `apps/web/public/` (192, 512, maskable, favicon).

---

## 3. Recommended Approach

**Selected: Option 1 — Direct Adjustment (Hybrid with OPS track)**

- Add stories within epics **1**, **6**, **10**, **17** and OPS backlog.
- **No rollback** of shipped features.
- **MVP / iso-V1** goal unchanged ; **V2.0.0** is the **named release** for prod cutover.

| Criterion | Assessment |
|-----------|------------|
| Effort | **Medium–High** (~3–4 weeks focused) |
| Risk | **Medium** (Identity Platform recette, PWA iOS, pipeline change) |
| Timeline | Blocks **M4** until V2.0.0 wave + replay complete |

**Rationale:** PO confirmed functional parity is near ; remaining work is **release readiness** and **UX polish** that affects user trust at cutover (PWA icon, changelog, account security, orga announce flow).

**Explicitly deferred (unchanged):** **4.2**, **7.x**, **9.2**, **11.x**, **13.x**.

---

## 4. Detailed Change Proposals

### 4.1 PO decisions vs SCP iso-V1 MEP (2026-06-02)

| Theme | SCP 2026-06-02 | V2.0.0 (this SCP) |
|-------|----------------|-------------------|
| **1.7** account deletion | Out | **In P0** |
| **1.6** email + password (logged-in) | Placeholder UX | **In P0** |
| PWA install | 10.1 done | **+ 10.4–10.6** recette & aids |
| Announcement modals | 6.10 done | **6.15** UX refonte |
| Prod deploy | `production-v2` branch | **Tag artifact** (OPS-5) |
| App icon | — | **10.7** HatCast 2 |
| Prod URL | `*.run.app` (west9) | **`https://hatcast.app`** (**OPS-8**, registrar Cloudflare) |
| PostHog / mail @domain | — | **OPS-9**, **OPS-10** (P1, post-M4) |

### 4.2 Wave structure (PLAN § Wave V2.0.0)

#### Wave A — PWA, client release & visual identity

| Story | Acceptance summary |
|-------|-------------------|
| **10.4** | Verify `manifest.webmanifest`, icons, `ngsw-config`, `version.txt` ; smoke on staging |
| **10.2** | SW detects update ; M3 banner « Mettre à jour » ; reload on click only (FR41) |
| **10.3** | Version visible ; click → changelog modal (`/changelog.json`) |
| **10.2 + 10.3** | After successful update reload → auto-open changelog for new version (once per version) |
| **10.5** | Parity V1 `PWAInstallModal` : detect iOS/Android/desktop ; up-to-date copy ; menu + banner entry |
| **10.6** | After PWA install or first standalone session : prompt to enable push (links to 8.1 flow) |
| **10.7** | Distinct HatCast 2 icons ; users can tell migrated PWA from V1 |

#### Wave B — Mon compte & security

| Story | Acceptance summary |
|-------|-------------------|
| **1.2** | Recette gate : sign-up email/password E2E on staging then prod (`/connexion` → « Créer un compte ») ; Identity Platform ; post-login ; generic errors |
| **1.2b** | Dedicated sign-up UX (V1 parity) : separate screen or mode « Inscription » ; « Créer mon compte » CTA ; password confirmation ; M3 auth chrome ; link from login |
| **17.34** | Tabbed/section layout : Identité · Sécurité · Notifications · Préférences · Zone sensible · À propos ; shorter page ; M3 checklist |
| **1.6** | Change email (with verification) ; change password while logged in ; Google + email/password coexist |
| **1.3** | Recette gate : forgot-password E2E on staging Identity Platform |
| **1.7** | Account deletion with strong confirmation ; documented data handling (FR37) |

#### Wave C — Announcement modals

| Story | Acceptance summary |
|-------|-------------------|
| **6.15** | Unified M3 shell for draw / compo / availability intents ; larger textarea ; copy + WhatsApp |
| **6.15** | Manual notify : single action ; post-send summary « N personnes notifiées » |
| **6.15** | Anti-spam : confirm if recent send or duplicate intent ; warn when auto-notif already sent (3.21/8.3) |

#### Wave D — Release pipeline (OPS)

| Story | Acceptance summary |
|-------|-------------------|
| **OPS-4** | Staging release script tags `vX.Y.Z-rc.N` on `staging-v2` ; bumps version + CHANGELOG |
| **OPS-5** | Prod promotes **same semver tag** ; CI deploys artifact ; **no** required `production-v2` branch |
| **OPS-6** | `version.txt`, `changelog.json`, root + web `package.json` stay in sync |
| **OPS-7** | Post-cutover : archive `v1`, `staging-v1` ; rename branches ; update workflows |

#### Wave F — Prod domain `hatcast.app` (amendment 2026-06-03)

| Story | Acceptance summary |
|-------|-------------------|
| **OPS-8** | Domain **`hatcast.app`** registered at Cloudflare ; prod service **`hatcast-v2`** deployed in **`europe-west1`** (GitHub env `production` only) ; **domain mapping** + DNS CF (grey → cert → **orange** proxy) ; SSL **Full (strict)** ; cache bypass `/v1/*` ; `HATCAST_CORS_ALLOWED_ORIGINS=https://hatcast.app` ; OAuth + Firebase **Authorized domains** ; recette login, session, `/v1`, PWA smoke on prod URL ; **staging/dev cloud unchanged** (west9) |
| **OPS-9** | PostHog **EU** project ; `posthog-js` in `apps/web` ; `api_host` via **`e.hatcast.app`** (CF **DNS only**) ; FR47-aligned events ; doc runbook |
| **OPS-10** | **`noreply@hatcast.app`** as `HATCAST_NOTIFICATION_EMAIL_FROM` with valid SPF/DKIM ; **`info@`** receive via CF Email Routing → Gmail (or Workspace) ; test notification + auth email paths ; doc in DEPLOY |

**Target flow:**

```
v2 (dev cloud) → promote-to-staging → release-staging.sh → tag rc → staging deploy
→ validate → promote-tag-to-prod vX.Y.Z → prod deploy (same tag)
```

#### Wave E — Migration & cutover gates

| Gate | Condition |
|------|-----------|
| **E1** | Screen tour checklist signed off on staging |
| **E2** | `./scripts/migrate-from-v1.sh` replay × **≥3** from scratch on Neon staging |
| **E3** | Tag **v2.0.0** staging then prod |
| **M4** | Live traffic on **`hatcast.app`** ; OAuth/push prod ; user comms ; requires **OPS-8** |
| **E4** | Execute OPS-7 branch rename |

### 4.3 Execution order

| # | Work | Rationale |
|---|------|-----------|
| 0 | **OPS-8** (infra prod URL) | Unblocks **M4** ; parallel with Wave A once prod env secrets ready |
| 1 | **10.4** → **10.2** + **10.3** + **10.7** | Release hygiene first |
| 2 | **1.2b** + **17.34** skeleton + **1.6** | Sign-up UX + account before cutover |
| 3 | **6.15** | High orga visibility |
| 4 | **10.5** + **10.6** | PWA install polish |
| 5 | **Recette 1.2** + **1.3** + **1.7** | Sign-up + reset + deletion security gates |
| 6 | **OPS-4** → **OPS-6** (parallel from step 2 if capacity) | Pipeline before prod tag |
| 7 | **E1** tour + **E2** replay | Pre-cutover validation |
| 8 | **E3** tag v2.0.0 staging/prod | Release |
| 9 | **M4** + **OPS-7** | Cutover + branch cleanup |
| 10 | **OPS-9** + **OPS-10** | Analytics + branded mail (after M4 or if capacity) |

**Parallelism:** **OPS-8** can start immediately (domain bought) ; OPS-4–6 parallel from step 2 ; **6.15** parallel with **10.x** after **10.4** audit.

---

## 5. Implementation Handoff

### Scope classification: **Major**

| Role | Responsibility |
|------|----------------|
| **PO (Patrice)** | Approve SCP ; sign screen tour ; cutover window |
| **Dev (`bmad-create-story` + `bmad-dev-story`)** | Stories 10.x, **1.2b**, 1.6, 1.7, 6.15, 17.34, OPS-4–6 |
| **Ops / Dev** | **OPS-8** before M4 ; OPS-7 after M4 ; **OPS-9/10** post-M4 ; ADR if needed |
| **Recette** | **1.2**, 1.3, PWA iOS+Android, migration replay |

### Success criteria (V2.0.0 cutover)

- [ ] All P0 stories **done** + M3 checklist where UI
- [ ] Staging **v2.0.0-rc** validated ; prod **v2.0.0** from same tag lineage
- [ ] PWA : install, update, changelog, new icon on device home screen
- [ ] Mon compte : **sign-up recette (1.2)** + **1.2b** UX ; email, password, deletion ; forgot-password recette green
- [ ] Announcement modals : M3, manual notify, anti-spam
- [ ] Migration replay ×3 green
- [ ] V1 preserved on `v1` / `staging-v1` after cutover
- [ ] **OPS-8** : prod served on **`https://hatcast.app`** (Cloudflare orange → Cloud Run `europe-west1`)
- [ ] **OPS-9** / **OPS-10** : done or explicitly deferred post-release (P1)

### Next BMad steps

1. `bmad-create-story` — **10.3**, **10.4**, **10.5**, **10.6**, **10.7**, **6.15**, **17.34**
2. `bmad-dev-story` — start **10.2** (story exists in epics)
3. Update **DEPLOYMENT_WORKFLOW.md** when OPS-4/5 land

---

## 6. Approval

- [x] PO confirmed scope (2026-06-02) — **approved**
- [x] SCP written ; PLAN.md § Wave V2.0.0 updated
- [x] `sprint-status.yaml` updated with new story placeholders
- [x] `deferred-triage-2026-05.md` §5 aligned
- [x] Amendement **2026-06-03** : **OPS-8/9/10**, Wave F, domaine `hatcast.app` (Cloudflare)
- [x] Amendement **2026-06-03** : Wave B — **1.2** recette gate + **1.2b** UX inscription dédiée

---

## 7. Amendment 2026-06-03 — Domain `hatcast.app`

**Trigger:** PO registered **`hatcast.app`** at **Cloudflare Registrar** (prod cutover URL).

**Decisions:**

1. **Canonical prod URL:** `https://hatcast.app` (not `*.europe-west9.run.app`).
2. **Prod Cloud Run region:** **`europe-west1`** (Belgium) — enables **Cloud Run domain mapping** ; avoids regional HTTPS LB in Paris.
3. **Staging + dev cloud:** remain **`europe-west9`** / existing `*.run.app` URLs — **no migration**.
4. **Edge:** **Cloudflare proxied (orange)** in front of mapped domain ; **Full (strict)** TLS.
5. **Follow-ups in V2.0.0 scope (P1, non-blocking M4):** **OPS-9** PostHog (promote growth **G-005**) ; **OPS-10** `noreply@` / `info@` on domain.

**Artifacts updated:** `PLAN.md` § Wave F ; `sprint-status.yaml` ; `deferred-triage-2026-05.md` §5 ; `growth-backlog.md` G-005 ; `DEPLOY_V2_CLOUD_RUN.md` ; story stubs **ops-8/9/10**.

---

## 8. Amendment 2026-06-03 — Sign-up in Wave B

**Trigger:** PO review — Wave B omitted **account creation** despite « Créer un compte » link on `/connexion`.

**Context:** Story **1.2** code is **done** (`createUserWithEmailAndPassword` on login page) but uses the **same form** as sign-in (V1 had dedicated `AccountCreationModal`).

**Decisions:**

1. **1.2 recette gate** — P0 cutover : E2E sign-up on staging then prod (Identity Platform, post-login, generic errors).
2. **1.2b** — P0 dev : dedicated sign-up UX (screen or mode « Inscription », « Créer mon compte » CTA, password confirmation, M3 chrome).

**Artifacts updated:** `PLAN.md` § Wave B ; `sprint-status.yaml` ; `deferred-triage-2026-05.md` §5 ; this SCP §6 approval log.
