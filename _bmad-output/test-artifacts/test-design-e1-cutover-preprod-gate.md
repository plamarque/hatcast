---
stepsCompleted:
  - step-01-detect-mode
  - step-02-load-context
  - step-03-risk-and-testability
  - step-04-coverage-plan
  - step-05-generate-output
lastStep: step-05-generate-output
lastSaved: 2026-06-05
poAddendum: 2026-06-12-ma-troupe-nav-p0
inputDocuments:
  - _bmad-output/implementation-artifacts/e1-cutover-screen-tour-staging-v2.0.0.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md
  - docs/v2/technical/DEPLOYMENT_WORKFLOW.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/e2e/README.md
  - _bmad-output/test-artifacts/test-design-epic-3.19.md
constraintsFromPO:
  - Preprod gate before prod promote (nominal product paths)
  - Mobile responsive viewport is blocking on failure (not optional sample)
  - Desktop Chromium parallel for admin/orga-oriented scenarios
  - P0 member: personal stats (Mes Stats) + spectacle Activité tab + **Ma troupe** bottom tab (E1-MEM-040)
  - P0 orga/desktop: season Statistiques view + audit journal (saison + troupe)
---

# Test Design: E1 Cutover — Preprod nominal gate (mobile + desktop)

**Date:** 2026-06-05  
**Author:** Patrice (with Murat / TEA Test Design)  
**Status:** Implemented (TA 2026-06-05) — 20/20 Playwright green locally (E1 + 3.19)  
**Mode:** Epic-level gate (Wave V2.0.0 **E1** + preprod promote)  
**Stack:** Fullstack (Spring/Kotlin + Angular V2 Playwright)

---

## Executive Summary

**Goal:** Replace reliance on a one-shot manual E1 sign-off with **repeatable, blocking automation** that proves **nominal member and orga journeys** work on **preprod (staging Cloud Run)** before **prod tag promote**, while respecting HatCast **mobile-first** (≤480px is a **hard fail**, not a waiver bucket).

**Strategy — two execution surfaces in parallel:**

| Surface | Playwright project | Viewport / device | Primary E1 scope | Gate severity |
| ------- | ------------------ | ----------------- | ---------------- | ------------- |
| **Mobile nominal** | `e1-mobile-member` | **390×844** (Pixel 5 class) or `devices['Pixel 5']` — aligns with FRONTEND_UI ≤480px | §0, §3 (**stats perso**), §4 (**onglet Activité**), §8 (+ §1.1 login smoke) | **BLOCKING** |
| **Desktop orga** | `e1-desktop-orga` | `Desktop Chrome` | §5 (compo), **stats saison**, **audit saison/troupe**, §4.4 proxy | **BLOCKING** |

**Strategy — two environments (unchanged from prior Murat advice, now specified):**

| Tier | Environment | Purpose | When it runs |
| ---- | ----------- | ------- | ------------ |
| **T1 — CI regression** | Local/webServer: API `e2e` + `https://localhost:4200` | Fast, deterministic nominal + extend `recette-3.19` | Every PR; **staging-v2 deploy gate** (existing `e2e-smoke.yml`) |
| **T2 — Preprod gate** | `PLAYWRIGHT_BASE_URL` = staging `hatcast-v2-staging-*.run.app` | Real Neon + Identity Platform + migrated troupe (**La Malice** or dedicated E2E troupe) | **After** `promote-to-staging` / RC tag; **before** `promote-tag-to-prod` |

**Risk summary:**

| Metric | Value |
| ------ | ----- |
| Total risks | **12** |
| High (≥6) | **4** (R-E01 layout, R-E02 compo, R-E03 env drift, **R-E11 stats/audit empty or 403**) |
| Critical categories | **BUS** (cannot run season), **OPS** (wrong DB / auth on staging) |

**Coverage summary (target after TA):**

| Priority | Scenarios | Mobile | Desktop | Est. new effort |
| -------- | --------- | ------ | ------- | --------------- |
| P0 | **21** | **12** | **9** | ~16–24 h |
| P1 | 7 | 2 | 4 | ~6–10 h |
| P2/P3 | 8 | 2 | 4 | ~4–6 h (mostly manual/API) |
| **Total** | **36** | — | — | **~28–40 h** (~4–5 dev-days) |

**PO addendum (2026-06-05):** Stats & audit are **first-class P0**, not nice-to-have P1.

**PO addendum (2026-06-12):** **E1-MEM-040** (onglet **Ma troupe** → hub dernier slug) is **P0 blocking** on `e1-mobile-member` (story **17.41**). E1-MEM-041–042 remain **P1** (fallback + seed href).

**PO constraint encoded:** Any P0 scenario **failing on `e1-mobile-member`** blocks preprod→prod regardless of desktop green.

---

## Source of truth & traceability

| Artifact | Role |
| -------- | ---- |
| [e1-cutover-screen-tour-staging-v2.0.0.md](../implementation-artifacts/e1-cutover-screen-tour-staging-v2.0.0.md) | Requirement checklist (signed 2026-06-04) |
| [DEPLOYMENT_WORKFLOW.md](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md) § Checklist staging | Insert **T2 gate** after step 2.6 |
| [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) | Mobile ≤480px, 48dp targets, `aria-label` when label hidden |
| `recette-3.19.spec.ts` | Already covers deep **admin roster** vertical — **keep**, do not duplicate in E1 orga suite except cross-links |

---

## Not in scope (explicit)

| E1 section | Reason | Mitigation |
| ---------- | ------ | ---------- |
| §1.3–1.4 full sign-up | Identity Platform + disposable accounts; flaky in CI | Manual/quarterly on staging; optional synthetic auth probe |
| §1.5 Google OAuth real | No mock on staging | T2: smoke login with **dedicated test Google account** (1 test) or skip with waiver |
| §1.6 password reset email | Mailbox dependency | Manual staging recette |
| §2.3–2.5 account security / delete / push toggles | Side effects; BUG-008 waived | Manual; ISSUES.md |
| §6 full migration parity vs V1 | Not UI — counts on real Malice | **API/script gate** `e1-migration-assert.ts` (not browser) |
| §7.4 PWA “Mettre à jour” two-revision | Needs two deploys | Manual or dedicated ops job |
| §7.5 install help | Optional in E1 | Manual |
| Real device lab (iOS Safari) | Out of Playwright scope for T1/T2 | PO spot-check before M4 if needed |

---

## Risk assessment

### High-priority (score ≥6)

| Risk ID | Category | Description | P | I | Score | Mitigation |
| ------- | -------- | ----------- | - | - | ----- | ---------- |
| R-E01 | BUS | Mobile viewport: agenda/event chrome overlap, tabs unusable (E1 §8) | 2 | 3 | **6** | All P0 member paths on `e1-mobile-member`; assert visible tabs, no horizontal overflow on key routes |
| R-E02 | BUS | Orga cannot complete tirage/validate/confirm on real event (E1 §5) | 2 | 3 | **6** | Desktop P0 on fixture or staging MVP/Malice event with open dispos |
| R-E03 | OPS | T2 runs against wrong URL, stale revision, or seed troupe instead of migrated data | 2 | 3 | **6** | Pin `PLAYWRIGHT_BASE_URL`; assert season title/count API; document Malice slug in workflow env |

### Medium (3–4)

| Risk ID | Category | Description | Score | Mitigation |
| ------- | -------- | ----------- | ----- | ---------- |
| R-E04 | TECH | Flaky timing on composition confirm / snackbars | 4 | `expect` with role+name; `data-testid` only where missing today |
| R-E05 | DATA | T1 fixture diverges from staging Malice shapes | 4 | T1 uses **e1-cutover fixture** mirroring MVP labels; T2 uses stable slugs from env |
| R-E06 | PERF | Staging cold start / 403 Cloud Run | 4 | Retry 1 in CI; health pre-check §0 |
| R-E07 | BUS | Announce modal broken on narrow width | 4 | Mobile test §8.3 + desktop §5.5 |
| R-E11 | BUS | Stats or audit APIs return empty/403 while UI looks “fine” — false green gate | 2 | 3 | **6** | Assert non-empty table OR explicit empty-state copy; audit list ≥1 row on fixture event |

### Low (1–2)

| Risk ID | Description | Action |
| ------- | ----------- | ------ |
| R-E08 | Annuaire `/troupes` regression | P1 mobile |
| R-E09 | Breadcrumb wrong troupe/saison | P1 both surfaces |
| R-E10 | `check-pwa.sh` drift | Keep separate HTTP job in T2 |

---

## Test architecture — Playwright projects (parallel)

### Target `playwright.config.ts` shape

```ts
// Conceptual — implement in TA
projects: [
  { name: 'setup-admin', testMatch: /auth\.setup\.ts/ },
  { name: 'setup-member', testMatch: /auth-member\.setup\.ts/ },

  {
    name: 'e1-mobile-member',
    dependencies: ['setup-member'],
    testMatch: /e1\/.*\.mobile\.spec\.ts/,
    use: {
      ...devices['Pixel 5'], // 390×664 viewport — within ≤480px policy
      storageState: 'e2e/.auth/member.json',
    },
  },
  {
    name: 'e1-desktop-orga',
    dependencies: ['setup-admin'],
    testMatch: /e1\/.*\.desktop\.spec\.ts/,
    use: {
      ...devices['Desktop Chrome'],
      storageState: 'e2e/.auth/admin.json',
    },
  },
  {
    name: 'chromium-legacy-3-19',
    dependencies: ['setup-admin'],
    testMatch: /recette-3\.19\.spec\.ts/,
    use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
  },
]
```

**Parallelism:**

| Context | `workers` | Notes |
| ------- | --------- | ----- |
| CI T1 | `2` | `e1-mobile-member` ∥ `e1-desktop-orga` after setups (setups serial) |
| T2 staging | `2` | Same; longer timeouts (60s navigation) |

**Mobile blocking rule (enforced in workflow):**

- Job `e1-preprod-gate` fails if **any** `e1-mobile-member` test fails.
- Job may warn (not fail) on optional P1 desktop-only waivers — **none** for P0.

**Responsive assertion helpers** (shared `e2e/helpers/e1-layout.ts`):

- Viewport width ≤ 480 at test start.
- `expect(locator).toBeVisible()` on primary CTA (agenda row, tab Dispos/Équipe/Infos).
- Optional: `page.evaluate` → `document.documentElement.scrollWidth <= clientWidth + 1` on `/agenda` and event detail.

---

## Personas & auth

### T1 (profile `e2e`)

| Persona | Token / setup | Role |
| ------- | ------------- | ---- |
| `e2e-admin` | existing | Troupe admin + orga (Improbots seed today) |
| **`e2e-member`** (new) | Add to `E2eGoogleIdTokenService` | Plain member, no troupe admin — **required for mobile member suite** |

Fixture endpoint (new): `POST /v1/e2e/fixtures/e1-cutover/reset`

- Troupe + season with 3 events: `[E1] dispos open`, `[E1] compo draft`, `[E1] compo pending confirm`
- 4–6 members with dispos seeded (reuse MVP pilot pattern from `MVP-PILOT-RECETTE.md`)
- **≥1 audit row** on `[E1] dispos open` (dispo change or notify) so **Activité** tab and season audit are non-empty
- Member persona linked to season + event (for `linkedParticipantId` → tab **Activité** visible)
- Season-level stats aggregates seeded (non-zero dispo/selection counts for `season-statistics` table)
- Idempotent reset per run (like story-3-19)

### T2 (staging)

| Secret | Usage |
| ------ | ----- |
| `HATCAST_E2E_STAGING_BASE_URL` | `PLAYWRIGHT_BASE_URL` |
| `HATCAST_E2E_MEMBER_EMAIL` / `HATCAST_E2E_MEMBER_PASSWORD` | Mobile member login (email/password **or** Google test user) |
| `HATCAST_E2E_ORGA_EMAIL` / `HATCAST_E2E_ORGA_PASSWORD` | Desktop orga |
| `HATCAST_E2E_SEASON_SLUG` | e.g. Malice 2025-2026 slug |
| `HATCAST_E2E_EVENT_DISPOS_SLUG` | Known event with open availability |

**No** `e2e` API profile on staging — tests hit **real** `/v1` only.

---

## E1 → test coverage matrix

Legend: **M** = mobile project (blocking) · **D** = desktop orga · **API** = non-UI script · **👁** = manual residual · **✅** = exists

| E1 | Requirement | P | Surface | Test ID | Status |
| -- | ----------- | - | ------- | ------- | ------ |
| 0 | SPA loads, no 403 | P0 | M+D | E1-SAN-001 | ❌ |
| 0 | Post-login troupe + season visible | P0 | M | E1-SAN-002 | ❌ |
| 1.1 | Email login → member space | P0 | M | E1-AUTH-001 | ❌ (T2); T1 via mock |
| 1.2 | Link to `/inscription` | P1 | M | E1-AUTH-002 | ❌ |
| 1.3–1.6 | Sign-up / Google / reset | P3 | — | — | 👁 |
| 2.1 | Account tabs navigation | P1 | M | E1-ACC-001 | ❌ |
| 2.2 | Profile read | P2 | M | E1-ACC-002 | ❌ |
| 2.3–2.5 | Security / notif / delete | P3 | — | — | 👁 |
| 3.1 | `/agenda` upcoming events | P0 | **M** | E1-MEM-001 | ❌ |
| 3.2 | Agenda month navigation | P1 | **M** | E1-MEM-002 | ❌ |
| 3.3 | Annuaire La Malice / troupe card | P1 | **M** | E1-MEM-003 | ❌ |
| 3.4 | Workspace season chip/link | P0 | **M** | E1-MEM-004 | ❌ |
| 3.5 | Breadcrumb troupe › saison | P1 | M+D | E1-NAV-001 | ❌ |
| 3.6 | **Mes Stats** `/membre/{slug}` — KPIs + panel (E1 §3.6) | **P0** | **M** | E1-MEM-020 | ❌ |
| 3.6b | Nav **Mes stats** (bottom tab mobile) → même page | **P0** | **M** | E1-MEM-021 | ✅ |
| 3.6c | Nav **Ma troupe** → hub dernier slug visité | **P0** | **M** | E1-MEM-040 | ✅ |
| 3.6d | Nav **Ma troupe** fallback liste + seed href | **P1** | **M** | E1-MEM-041–042 | ✅ |
| 3.7 | Stats spot-check vs V1 | P3 | — | — | 👁 |
| 4.5 | Spectacle **Activité** — journal « Moi » (membre inscrit) | **P0** | **M** | E1-MEM-022 | ❌ |
| 4.1 | Dispos tab: change subject / states | P0 | **M** | E1-MEM-010 | ❌ |
| 4.2 | Roles + save | P0 | **M** | E1-MEM-011 | ❌ |
| 4.3 | Équipe tab read | P0 | **M** | E1-MEM-012 | ❌ |
| 4.4 | Confirm pending slot | P0 | M (member) / **D** (proxy) | E1-MEM-013 / E1-ORG-006 | ❌ |
| 5.1 | Tirage or assign → slots filled | P0 | **D** | E1-ORG-001 | ❌ |
| 5.2 | Validate composition | P0 | **D** | E1-ORG-002 | ❌ |
| 5.3 | Confirm participants → complete | P0 | **D** | E1-ORG-003 | ❌ |
| 5.4 | Admin gear in event header | P1 | **D** | E1-ORG-004 | ❌ |
| 5.5 | Share/announce modal opens + copy | P0 | **D** (+ M layout) | E1-ORG-005 / E1-MOB-020 | ❌ |
| 5.6 | Manual notify no spam | P2 | **D** | E1-ORG-007 | ❌ |
| 5.7 | Saison vue **Statistiques** — tableau membres charge | **P0** | **D** | E1-ORG-010 | ❌ |
| 5.8 | **Journal d'audit** saison — liste + filtre type | **P0** | **D** | E1-ORG-011 | ❌ |
| 5.9 | **Journal d'audit** troupe — liste accessible admin troupe | **P0** | **D** | E1-ORG-012 | ❌ |
| 5.10 | Spectacle **Activité** — orga « Tous » + lignes audit | **P0** | **D** | E1-ORG-013 | ❌ |
| 6.1–6.4 | Migration counts / V1 compare | P0 gate | **API** | E1-MIG-001–004 | ❌ |
| 7.1–7.3 | PWA manifest / version / changelog | P1 | — | E1-PWA-* | `check-pwa.sh` partial ✅ |
| 7.4–7.5 | SW update / install help | P3 | — | — | 👁 |
| 8.1 | Agenda mobile chrome | P0 | **M** | E1-MOB-001 | ❌ (extends E1-MEM-001) |
| 8.2 | Event tabs usable | P0 | **M** | E1-MOB-002 | ❌ |
| 8.3 | Announce modal scroll (mobile) | P0 | **M** | E1-MOB-003 | ❌ |
| 3.19 pyramid | Season/troupe removal | P0 | **D** | 3.19-* | ✅ `recette-3.19.spec.ts` |

---

## P0 detail — implementation notes

### Product surfaces (code anchors)

| Feature | Route / UI | Component | Who |
| ------- | ---------- | ----------- | --- |
| Stats perso | `/membre/:userSlug` + nav **Mes stats** | `MemberSeasonGlance` + `MemberProfilePanel` | Membre (self) |
| Hub troupe | `/troupes/:slug` + nav **Ma troupe** | `TroupeHub` + `LastVisitedTroupeShortcutService` | Membre |
| Activité spectacle | Event detail tab **Activité** | `EventActiviteTab` + `AuditJournalList` | Membre (`linkedParticipantId`) ; orga (`canViewAuditEvent`, toggle **Tous**) |
| Stats saison | `/saison/...` view **Statistiques** | `SeasonStatistics` via `season-view-toolbar` | Orga / admin saison |
| Audit saison | `/saison/:troupeSlug/:seasonSlug/admin/audit` | `AdminAudit` `auditScope: season` | `canViewAuditSeason` |
| Audit troupe | `/troupes/:slug/admin/audit` | `AdminAudit` `auditScope: troupe` | `canViewAuditTroupe` |

### Mobile member (`e1/*.mobile.spec.ts`)

| ID | Steps (abbrev.) | Assertions |
| -- | --------------- | ---------- |
| E1-SAN-001 | `goto /agenda` | Not 403/5xx; **four** shell tabs visible (Accueil · Mon agenda · Ma troupe · Mes stats); no horizontal overflow |
| E1-SAN-002 | Login as member | Text/troupe season from env or fixture |
| E1-MEM-001 | Open agenda | ≥1 event card; date readable at 390px width |
| E1-MEM-004 | Tap season workspace | URL `/saison/...` or `/ligue/...` per routing |
| **E1-MEM-020** | `goto /membre/{slug}` or tap bottom nav **Stats** | Heading **Mes Stats**; stats block visible (Disponibilités / Sélections / Désistements **or** explicit empty-state copy — not spinner forever) |
| **E1-MEM-021** | From mobile nav: **Mes stats** tab | Lands on same profile; `aria-current="page"` on Mes stats tab |
| **E1-MEM-040** | Visit season workspace then **Ma troupe** tab | **P0** — URL `/troupes/{slug}`; `app-troupe-hub` visible; tab `aria-current="page"` |
| **E1-MEM-041** | Clear `lastVisitedTroupeSlug` → **Ma troupe** | **P1** — URL `/troupes` list; tab **not** active |
| **E1-MEM-042** | Seed slug in storage → check href | **P1** — Tab links to `/troupes/{slug}` |
| **E1-MEM-022** | Open `[E1] dispos open` → tab **Activité** | Tab visible; journal list renders (≥1 row **or** empty label from `audit-journal-list`, no error banner); mode **Moi** |
| E1-MEM-010–012 | Open `[E1] dispos open` event | Tabs Dispos/Équipe/Infos visible; toggle dispo; save |
| E1-MEM-013 | Event with pending confirm | Confirm as member |
| E1-MOB-001–002 | Agenda + event tabs | No horizontal overflow; **Activité** tab tappable at 390px (**E1-MOB-002** includes Activité) |
| E1-MOB-003 | Announce modal (orga path) | Optional if §5.5 covered on desktop only |

**Precondition E1-MEM-022:** fixture links `e2e-member` as season participant on the target event (see `showActiviteTab()` in `event-detail.ts`).

### Desktop orga (`e1/*.desktop.spec.ts`)

| ID | Steps | Assertions |
| -- | ----- | ---------- |
| E1-ORG-001 | Event `[E1] dispos open` → Équipe → Tirage **or** Assign | 5 slots filled |
| E1-ORG-002 | Validate | State badge / label “validée” or equivalent |
| E1-ORG-003 | Confirm all (proxy OK) | Team complete |
| E1-ORG-005 | Share/announce | Dialog visible; textarea non-empty template |
| E1-ORG-006 | Proxy confirm on `[E1] pending` event | Slot leaves pending |
| **E1-ORG-010** | Workspace saison → toggle **Statistiques** | `app-season-statistics` visible; ≥1 participant row in table (not perpetual spinner) |
| **E1-ORG-011** | Menu admin → **Journal d'audit** (saison) or direct `/saison/.../admin/audit` | Not forbidden; `admin-audit` list or filters visible; apply filter **Type d'action** → still 200 UI |
| **E1-ORG-012** | `/troupes/{slug}/admin/audit` (from troupe hub menu) | Same as 011 for troupe scope; breadcrumb **troupe** layout |
| **E1-ORG-013** | Event → tab **Activité** → toggle **Tous** | ≥1 audit row (fixture); subject selector if `canSwitchSubject` |

Reuse helpers from `scripts/v2/MVP-PILOT-RECETTE.md` scenarios 01–03 (tirage, assign, confirm).

**Suggested spec split:**

- `e1/member-stats.mobile.spec.ts` — E1-MEM-020, E1-MEM-021  
- `e1/member-troupe-nav.mobile.spec.ts` — **E1-MEM-040 (P0 blocking)**, E1-MEM-041, E1-MEM-042 (P1)
- `e1/member-event-activite.mobile.spec.ts` — E1-MEM-022 (+ layout E1-MOB-002)  
- `e1/orga-season-stats-audit.desktop.spec.ts` — E1-ORG-010, 011, 012  
- `e1/orga-event-activite.desktop.spec.ts` — E1-ORG-013 (can merge with compo spec if shorter CI)

### API migration gate (T2 only, parallel job)

| ID | Check |
| -- | ----- |
| E1-MIG-001 | `GET` season events count ≈ **55** (tolerance ±2) |
| E1-MIG-002 | Category `deplacements` count ≈ **7** |
| E1-MIG-003 | One deplacement event in agenda filter |

Run as `node scripts/v2/e1-staging-migration-assert.mjs` with service account or orga session token — **not** Playwright.

---

## Execution order

### T1 — CI (<15 min target)

1. `setup-admin` + `setup-member` (serial)
2. **Parallel:** `e1-mobile-member` + `e1-desktop-orga` + `recette-3.19` (desktop)
3. On failure: upload Playwright HTML report (existing artifact step)

### T2 — Preprod gate (<25 min target)

**Trigger:** `workflow_dispatch` or job after staging deploy success.

1. `curl -f $BASE_URL/actuator/health` (via API public URL if exposed)
2. `BASE_URL=... ./scripts/check-pwa.sh` (E1 §7 partial)
3. `node scripts/v2/e1-staging-migration-assert.mjs` (E1 §6)
4. Playwright T2 config (`PLAYWRIGHT_REUSE_SERVERS=1`, no webServer):
   - **Parallel** mobile member + desktop orga
5. **Gate decision:** PASS only if steps 3–4 P0 all green; mobile failures = **FAIL** (block prod promote)

### Manual residual (quarterly / before M4)

- §1.5–1.6 auth provider
- §2.3–2.5 account
- §6.4 V1 side-by-side
- §7.4 two-deploy SW

---

## CI/CD changes (for **CI** workflow)

| Item | Action |
| ---- | ------ |
| `.github/workflows/e2e-smoke.yml` | Add projects `e1-mobile-member`, `e1-desktop-orga`; increase timeout to 35 min if needed |
| New `.github/workflows/e1-preprod-gate.yml` | `workflow_call` + manual; secrets; no `e2e` profile |
| `deploy-v2-cloud-run.yml` | Optional: call `e1-preprod-gate` after staging deploy (in addition to T1 smoke) |
| `DEPLOYMENT_WORKFLOW.md` | Step 2.6: « E1 automated preprod gate green » |

**Prod deploy:** Keep current policy (no E2E block on tag prod) unless PO promotes T2 to prod smoke later.

---

## Entry / exit criteria

### Entry (T2)

- [ ] Staging deploy green
- [ ] E2 migration replay `validate-replay --min=3` still valid (E2 gate)
- [ ] E2E secrets configured in GitHub `staging` environment
- [ ] Test accounts not locked / passwords rotated documented

### Exit (preprod → prod)

- [ ] **100%** P0 on `e1-mobile-member` (incl. **E1-MEM-020–022** stats + activité)
- [ ] **100%** P0 on `e1-desktop-orga` (incl. **E1-ORG-010–013** stats saison + audit)
- [ ] `recette-3.19` green on T1 (regression)
- [ ] E1-MIG-001–003 green on staging (API)
- [ ] `check-pwa.sh` PASSED
- [ ] No open R-E01–R-E03 without waiver signed PO

---

## Resource estimates

| Phase | Hours |
| ----- | ----- |
| API: `e2e-member` + `e1-cutover/reset` fixture (+ audit seed) | 5–8 |
| Playwright: mobile P0 suite (10–11 tests, incl. stats + activité) | 8–10 |
| Playwright: desktop orga P0 (8–9 tests, incl. stats saison + audit) | 6–8 |
| T2 workflow + staging secrets + migration script | 4–6 |
| Docs + DEPLOYMENT_WORKFLOW | 1–2 |
| **Total** | **~28–40 h** |

---

## Quality gate (preprod)

| Metric | Threshold |
| ------ | --------- |
| P0 mobile | **100%** — failure blocks promote |
| P0 desktop orga | **100%** |
| P1 | ≥95% or documented waiver |
| Flake rate | <2% over 5 staging runs; else quarantine + fix |
| R-E01–R-E03 | Mitigated or PO waiver |

---

## Follow-on workflows

| Code | When |
| ---- | ---- |
| **TA** | Implement fixture + `e1/*.mobile.spec.ts` + `e1/*.desktop.spec.ts` + config projects |
| **CI** | `e1-preprod-gate.yml` + wire staging |
| **TR** | Trace matrix E1 rows → test IDs after TA |
| **RV** | Review flakiness after 3 staging runs |

---

## Approval

**Test design approved:**

- [ ] PO (Patrice): ____  
- [ ] Dev lead: ____  

**Comments:**

---

**Generated by:** BMad TEA — Test Design (`bmad-testarch-test-design`)  
**Version:** 4.0 (BMad v6)
