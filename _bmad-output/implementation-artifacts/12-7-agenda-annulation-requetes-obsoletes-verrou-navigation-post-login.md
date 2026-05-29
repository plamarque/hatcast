# Story 12.7 — Agenda : annulation requêtes obsolètes + verrou navigation post-login

**Status:** done

**PLAN:** [PLAN.md](../../PLAN.md) § Hygiene H1 backlog **12-7**  
**SCP:** [sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md](../planning-artifacts/sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md)  
**Triage:** [deferred-triage-2026-05.md](deferred-triage-2026-05.md) — **DW-044**, **DW-054**  
**Epic:** 12 — Parcours membre & agenda utilisateur (hygiene slice, hors epics.md MVP)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

En tant que **membre connecté**,  
je veux que **les chargements d’agenda et la navigation post-connexion ignorent les réponses ou appels obsolètes**,  
afin de **ne pas voir un filtre incorrect après des clics rapides** ni **être redirigé deux fois** après OAuth ou double soumission login.

---

## Acceptance Criteria

1. **Given** l’utilisateur change rapidement les filtres troupe/ligue sur `/agenda` (ou efface les filtres), **when** plusieurs appels `loadAgenda()` sont en vol, **then** seule la **dernière** requête met à jour `items`, `participationFilters`, `filterBarVisible`, `noParticipation`, `loadError` et `loadingAgenda` ; les réponses plus lentes des requêtes antérieures sont **ignorées**. [Source: DW-044 ; Story 12.3 review defer]

2. **Given** une requête agenda obsolète est ignorée, **when** une requête plus récente est encore en cours, **then** `loadingAgenda` reste **true** jusqu’à la fin de la dernière requête (pas de flash « chargé » avec des données périmées). [Source: DW-044]

3. **Given** `loadAgenda()` est déclenché depuis `ngOnInit`, `applyFilterChange`, `onClearFilters`, ou `reconcileFiltersWithCatalog`, **when** l’implémentation applique l’annulation, **then** le même mécanisme couvre **tous** ces chemins (pas seulement les handlers de filtres). [Source: `user-agenda.ts`]

4. **Given** deux appels concurrents à `PostLoginNavigationService.navigateAfterSignIn()` (double-clic login, Google OAuth callback + email submit, ou `AuthRedirect` + `Login` dans la même fenêtre), **when** les deux s’exécutent avant la fin du premier, **then** **une seule** navigation effective a lieu ; le second appel **attend ou réutilise** la promesse in-flight et ne déclenche pas une seconde `Router.navigate` / `navigateByUrl` concurrente. [Source: DW-054 ; Stories 2.9, 12.5 review defer]

5. **Given** la navigation post-login réussit, **when** le verrou in-flight se libère, **then** le comportement existant est préservé : priorité deep link → last member entry → last league → `/agenda` ; `clearPendingPostLoginRedirect()` uniquement après navigation réussie (Story 12.5). [Source: FR49 ; Story 12.5]

6. **Given** story **12-7** done, **when** les tests web passent, **then** au moins un test prouve la race agenda (réponse lente ignorée) et un test prouve le mutex post-login ; `npm run test -w @hatcast/web -- --watch=false` et `npm run build -w @hatcast/web` réussissent. [Source: NFR-Q1 ; Hygiene H1 gate]

**Product coverage:** fiabilité UX hot paths — pas de changement SPEC fonctionnel. Gate recette staging OAuth (**M1** DoD, SCP § Follow-on).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de nouveau composant ni style ; corrections de concurrence uniquement sous `apps/web/src/app/pages/user-agenda/` et `core/navigation/post-login-navigation.service.ts`.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` uniquement — pas de changement API Spring.
- [x] **Agenda — token de génération** (AC: 1–3)
  - [x] Dans `user-agenda.ts`, ajouter un compteur `loadGeneration` (pattern identique à `LastVisitedSeasonShortcutService.refreshGeneration`).
  - [x] Incrémenter au début de chaque `loadAgenda()` ; capturer la génération locale ; après `await this.api.listAgenda(...)`, **return early** si `generation !== this.loadGeneration`.
  - [x] Ne mettre `loadingAgenda` à `false` que si la génération correspond encore (évite AC2 flash).
  - [x] Ne pas introduire de second état loading parallèle — réutiliser `loadingAgenda` signal existant.
- [x] **Post-login — verrou in-flight** (AC: 4–5)
  - [x] Dans `post-login-navigation.service.ts`, extraire la logique actuelle de `navigateAfterSignIn` dans une méthode privée.
  - [x] Conserver une promesse `navigateAfterSignInInFlight: Promise<boolean> | null` ; si non null, retourner la même promesse.
  - [x] Réinitialiser le verrou dans `finally` après résolution (succès ou échec navigation).
  - [x] **Ne pas** verrouiller `resolveAuthenticatedEntryUrl()` seul — les tests unitaires l’appellent directement ; seul le point d’entrée navigation doit être mutex.
- [x] **Tests** (AC: 6)
  - [x] `user-agenda.spec.ts` : mock `listAgenda` avec délais contrôlés — 1er appel lent (filtre A), 2e rapide (filtre B) ; assert UI reflète B après settle.
  - [x] `post-login-navigation.service.spec.ts` : deux `navigateAfterSignIn()` concurrents sans await entre les deux ; `router.navigate` / `navigateByUrl` appelé **une fois**.
  - [x] Exécuter suite web + build.
- [x] Mettre à jour `sprint-status.yaml` → **done** via workflow dev-story / code-review (hors scope create-story).

---

## Dev Notes

### Problem statement

| ID | Symptôme | Cause racine |
|----|----------|--------------|
| **DW-044** | Filtres agenda « qui reviennent en arrière » après clics rapides | `loadAgenda()` sans token ; dernière réponse HTTP gagne, pas la dernière **intention** utilisateur |
| **DW-054** | Double navigation / URL instable après OAuth Google en recette staging | `navigateAfterSignIn()` sans mutex ; `Login`, `AuthRedirect`, `HomeSignedIn`, `ResetPassword` appellent tous le service |

Stories **12.3** et **12.5** ont **volontairement defer** ces points (« pre-existing async pattern acceptable for MVP »). Hygiene **H1** les remonte avant premier import **MIG-2** complet.

### Scope boundaries

| In scope (12.7) | Out of scope |
|-----------------|--------------|
| Mutex `navigateAfterSignIn` | Refonte priorité FR49 (Story 12.5 done) |
| Generation token `loadAgenda` | **DW-045** — 2 requêtes SQL catalogue par load |
| Tests Vitest race + mutex | **DW-046** — sync filtres via `router.events` |
| | **AbortController** sur `fetch` (optionnel ; generation suffit si pas de cancel réseau) |
| | Pagination agenda (**DW-052**) |
| | Backend / OpenAPI changes |
| | Legacy `legacy/` |

### Technical guardrails — agenda (DW-044)

**Preferred pattern (match codebase):** generation counter — voir `last-visited-season-shortcut.service.ts` :

```typescript
// Pattern reference — NOT copy-paste verbatim
private loadGeneration = 0

protected async loadAgenda(): Promise<void> {
  const generation = ++this.loadGeneration
  this.loadingAgenda.set(true)
  this.loadError.set(false)
  const r = await this.api.listAgenda({ /* current params */ })
  if (generation !== this.loadGeneration) {
    return // stale — do not touch signals
  }
  this.loadingAgenda.set(false)
  // ... existing success/error handling
}
```

**Why not AbortController first?** `UserAgendaApiService.listAgenda` utilise `fetch` sans signal aujourd’hui ; le generation counter corrige le bug UX visible sans refactor API. Ajouter `AbortSignal` est un plus (annule le réseau) mais **non requis** si AC1–2 passent.

**Call sites that must stay covered:**

| Method | Triggers loadAgenda |
|--------|---------------------|
| `ngOnInit` | initial load |
| `applyFilterChange` | troupe/league change |
| `onClearFilters` | clear + reload |
| `reconcileFiltersWithCatalog` | invalid stored filters → reload |

**Anti-pattern:** ne pas dupliquer la logique de merge dans chaque handler — centraliser dans `loadAgenda()` uniquement.

### Technical guardrails — post-login (DW-054)

**Entry points calling `navigateAfterSignIn` (do not change call sites unless tests require):**

| File | Trigger |
|------|---------|
| `login.ts` | email sign-in + Google ID token |
| `reset-password.ts` | post-reset auto sign-in |
| `auth-redirect.ts` | `/` authenticated |
| `home-signed-in.ts` | `/accueil` shim |

**Mutex sketch:**

```typescript
private navigateAfterSignInInFlight: Promise<boolean> | null = null

async navigateAfterSignIn(router: Router = this.router): Promise<boolean> {
  if (this.navigateAfterSignInInFlight) {
    return this.navigateAfterSignInInFlight
  }
  this.navigateAfterSignInInFlight = this.executeNavigateAfterSignIn(router)
  try {
    return await this.navigateAfterSignInInFlight
  } finally {
    this.navigateAfterSignInInFlight = null
  }
}
```

**Preserve:** `clearPendingPostLoginRedirect()` only after successful navigation (Story 12.5 review patch). Mutex must not clear redirect on the duplicate waiter if the first navigation failed.

### Architecture compliance

- **Stack:** Angular 21 standalone, Vitest, signals — `apps/web/`.
- **No backend changes.**
- **No legacy edits.**
- **Navigation routes:** post-login targets use `saisonWorkspacePath` / deep links — unchanged from Story 12.6+ refactors (`troupe-routes.ts`).
- **Security:** open-redirect rules unchanged (Story 12.5).

### File structure requirements

```
apps/web/src/app/pages/user-agenda/
  user-agenda.ts              # MODIFY — loadGeneration
  user-agenda.spec.ts         # MODIFY — race test

apps/web/src/app/core/navigation/
  post-login-navigation.service.ts       # MODIFY — in-flight mutex
  post-login-navigation.service.spec.ts  # MODIFY — concurrent navigate test
```

Optional (only if implementing AbortSignal): `user-agenda-api.service.ts`.

### Testing requirements

**Agenda race test recipe:**

1. Configure `listAgenda` mock with two implementations via `mockImplementationOnce` + delayed `Promise`.
2. First call: delay 50ms, return content for troupe A.
3. Second call: immediate, return content for troupe B.
4. Trigger filter change before first resolves.
5. After `settle()`, assert displayed items match troupe B only.

**Post-login mutex test recipe:**

1. Spy `Router.navigate` / `navigateByUrl` with a deferred promise (manual resolve).
2. Start `navigateAfterSignIn()` without awaiting.
3. Start second `navigateAfterSignIn()` immediately.
4. Resolve router once ; await both promises.
5. Expect exactly **one** navigation call.

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Previous story intelligence

- **Story 12.3** — filtres troupe/ligue ; review defer **DW-044** explicit at `user-agenda.ts:loadAgenda`. Filter bar stays visible during reload (patch applied) — do not regress.
- **Story 12.5** — FR49 chain finalized ; defer **DW-054** at `Login` / service level. Deep-link clear-on-success semantics must remain.
- **Story 12.6** — route helpers migrated to `troupe-routes.ts` / `saisonWorkspacePath` ; post-login tests may assert `/saison/` paths — unchanged by 12.7.
- **Story 2.9** — original defer note for concurrent navigation ; same root cause as DW-054.

### Git intelligence

Recent hygiene precedent: Story **5-7** (read-only GET, generation-less backend fix). For 12.7, follow same **minimal diff** discipline.

Suggested commit message: `fix(web): Abort stale agenda loads and lock post-login navigation`

### Explicit non-goals

- Perf SQL agenda catalogue (**DW-045**, H2).
- Sticky filter bar CSS (**DW-047**).
- OAuth provider-side double callback prevention (Google SDK) — client mutex only.
- Recording new ISSUES.md entries unless spot-check reveals a **new** defect beyond DW-044/054.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 12.3 | done | Filtres agenda — source du race |
| 12.5 | done | Post-login priority — mutex must preserve |
| 12.6 | done | Route helpers — no change expected |
| 2.9 | done | Original defer DW-054 |
| MIG-2 | backlog | H1 gate — complete 12-7 before first full import |

### References

- [Source: `PLAN.md` § Hygiene H1 **12-7**]
- [Source: `deferred-triage-2026-05.md` — DW-044, DW-054]
- [Source: `sprint-change-proposal-2026-05-28-deferred-hygiene-before-staging.md`]
- [Source: `_bmad-output/implementation-artifacts/12-3-filtres-troupe-ligue-agenda.md` — Review defer DW-044]
- [Source: `_bmad-output/implementation-artifacts/12-5-routage-post-connexion-agenda.md` — defer navigateAfterSignIn lock]
- [Source: `_bmad-output/implementation-artifacts/2-9-post-login-et-derniere-ligue-visitee-v1-parity.md`]
- [Source: `apps/web/src/app/pages/user-agenda/user-agenda.ts`]
- [Source: `apps/web/src/app/core/navigation/post-login-navigation.service.ts`]
- [Source: `apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts` — generation pattern]

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- Added `loadGeneration` counter in `UserAgenda.loadAgenda()` — stale HTTP responses no longer overwrite signals; `loadingAgenda` cleared only for the latest generation (DW-044).
- Added in-flight promise mutex on `PostLoginNavigationService.navigateAfterSignIn()` via private `executeNavigateAfterSignIn()` — concurrent callers share one navigation (DW-054); `resolveAuthenticatedEntryUrl()` unchanged for direct unit tests.
- Vitest: race test on filter churn; mutex test with deferred `navigateByUrl`.
- `npm run test -w @hatcast/web -- --watch=false` — 688 passed; `npm run build -w @hatcast/web` — OK.

### File List

- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`
- `apps/web/src/app/core/navigation/post-login-navigation.service.ts`
- `apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-29: Story 12.7 — agenda load generation token + post-login navigation mutex (DW-044, DW-054).
- 2026-05-29: Code review — clean ; 1 defer (test AC2 loadingAgenda optionnel).

---

### Review Findings

- [x] [Review][Defer] Test AC2 `loadingAgenda` pendant la course [`user-agenda.spec.ts:588`] — deferred, pré-existant / nice-to-have : le test race prouve que les données périmées sont ignorées (AC6) ; l’implémentation respecte AC2 (early return avant `loadingAgenda.set(false)`) mais le test ne vérifie pas explicitement l’absence de flash loading=false entre deux requêtes.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (PLAN / DW-044 / DW-054 / FR49)
- [x] Section **Material 3** — **UI : N/A** explicite
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants + pattern generation/mutex
- [x] `npm run test` / build web mentionnés
