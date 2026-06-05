# Story 2.12c: Gender-based avatar fallback (letter + tone)

Status: done

baseline_commit: 9e989a31

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want a **distinct default avatar** (letter + tone) when I have no profile photo,  
so that I am **visually recognizable** across troupe surfaces (V1 parity intent, V2 M3 design).

## Acceptance Criteria

1. **Given** no custom avatar and no loadable Google/upload photo, **when** `app-user-avatar` renders for a linked user with known gender, **then** the fallback is the **first letter** of the display name with tone **purple** (`male`), **orange** (`female`), or **grey** (`non_specified`) via `--hatcast-member-gender-*` tokens. [Source: [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) § Avatar fallback ; [EXPERIENCE.md](../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md) ; epics 2.12c]
2. **Given** a valid `avatarUrl` that loads successfully, **when** the avatar renders, **then** the photo is shown and **no** gender tone class applies to the image (gender tone only on letter fallback). [Source: epics 2.12c AC2 ; story **2.6**]
3. **Given** `avatarUrl` is present but the image fails to load (404, corrupt, storage missing), **when** `(error)` fires on `<img>`, **then** the component falls back to letter + gender tone (existing `imageFailed` signal). [Source: `user-avatar.spec.ts` ; story **2.6**]
4. **Given** every operational surface listed in [member-gender-surfaces.md](../../docs/v2/technical/member-gender-surfaces.md) with type `avatar`, **when** a participant/member row has `gender` on its DTO (or viewer self via preferences), **then** the template passes `[gender]` into `app-user-avatar` and the host has the matching `user-avatar--tone-*` class when no photo. [Source: SCP §4.3 ; registry § Surface inventory]
5. **Given** the signed-in viewer's own avatar on chrome surfaces (`member-account-menu`, `account-profile-tab`, and any legacy header menus still using `app-user-avatar` without row DTO), **when** gender is saved or previewed on Mon profil, **then** tone follows `MemberDisplayNameService.avatarGender()` (preview before save). [Source: story **2.12** UX Screen 1 frozen]
6. **Given** API responses that include `avatarUrl` for participant/member rows, **when** `users.avatarUpdatedAt` is set but stored bytes are missing, **then** the API returns `avatarUrl: null` so the client shows letter+tone — use `ParticipantRowPresentation.avatarUrl()` (storage guard), not bare `AvatarService.publicAvatarUrl()`. **Applies to:** availability summary, troupe admin list, **member profile GET**, **season glance GET**. [Source: registry ; code review 2026-06-05]
7. **Given** `gender` is null, unknown wire value, or absent on a row, **when** avatar fallback renders, **then** tone is **neutral** (`non_specified`). [Source: `effectiveMemberGender()` in `member-gender.ts`]
8. **Given** implementation complete, **when** tests run, **then** `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass for story scope. [Source: AGENTS.md]

**Avatar fallback table (normative V2):**

| `gender` | Letter | Host class | Tokens |
|----------|--------|------------|--------|
| `male` | First char of display name (uppercase) | `user-avatar--tone-male` | `--hatcast-member-gender-male-bg/fg` |
| `female` | Same | `user-avatar--tone-female` | `--hatcast-member-gender-female-bg/fg` |
| `non_specified` / unknown | Same | `user-avatar--tone-neutral` | `--hatcast-member-gender-neutral-bg/fg` |

**Product coverage:** FR10 ; V1 parity Wave B (SCP G-011). **Priority:** P1. **Depends:** **2.12** (done), **2.6** (done), **2.12b** (review — DTO `gender` on operational rows). **Blocks:** none. **Enables:** visual consistency before **6.21** / **16.3**.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** this story touches only `app-user-avatar` and existing templates, **when** no new controls are added, **then** no custom avatar buttons — reuse existing `mat-*` shells unchanged. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** gender tones on letter fallback, **when** SCSS applies colors, **then** only `var(--hatcast-member-gender-*)` and `var(--mat-sys-*)` — **no** stereotypical blue/pink hex ; photo path unchanged. [Source: DESIGN.md § Colors — gender]

**M3-3. Mobile & tactile** — **Given** avatar sizes vary (24–48px), **when** `clickable` avatars render, **then** existing touch targets on parent controls remain ≥ **48dp** ; avatar itself is decorative unless `clickable=true`. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** self-avatar on rail/menu uses tone, **when** implemented, **then** no new chrome — align with **17.25** menu trigger pattern. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md checklist M3 ; run manual regression checklist in `member-gender-surfaces.md` § Regression. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + `services/api/` (avatar URL guard only) — **not** role labels (**2.12b**), parity strip (**6.21**), emoji fallback, gender on `/v1/auth/me`

### Web — verify & complete `[gender]` wiring (AC: 1, 4, 5, 7, 8)

- [x] **Audit** all `app-user-avatar` usages (`rg 'app-user-avatar' apps/web`) against [member-gender-surfaces.md](../../docs/v2/technical/member-gender-surfaces.md) — every row with a linked user must pass `[gender]`.
- [x] **Known gap — self chrome without DTO gender:**
  - [`seasons-list.html`](../../apps/web/src/app/pages/seasons-list/seasons-list.html): bind `[gender]="memberDisplayName.avatarGender()"` ; inject `MemberDisplayNameService` ; call `loadFromApi()` on init (same pattern as [`member-account-menu-trigger.ts`](../../apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.ts)).
  - `home-signed-in` uses inline redirect template only — no avatar surface.
- [x] **Confirm already-wired surfaces** (do not regress — spot-check only):
  - Dispos: `availability-subject-selector`, `availability-tous-panel`
  - Équipe: `event-equipe-tab`, `composition-slot-picker-dialog`
  - Admin: `admin-participants`, `admin-event-participants`, `membres-tab`
  - Stats/filters: `season-statistics`, `filter-participant-picker`
  - Profil: `member-profile-dialog`, `account-profile-tab`, `member-account-menu-trigger`
  - Audit: `audit-line-view`
- [x] At each boundary, normalize API strings with `effectiveMemberGender()` before passing to `[gender]` (`user-avatar` host class).

### Web — `UserAvatarComponent` hardening (AC: 1, 2, 3, 8)

- [x] [`user-avatar.ts`](../../apps/web/src/app/shared/user-avatar/user-avatar.ts): `toneClass` uses `effectiveMemberGender(this.gender())`.
- [x] [`user-avatar.spec.ts`](../../apps/web/src/app/shared/user-avatar/user-avatar.spec.ts): null + unknown wire → neutral.
- [x] Surface specs: `availability-tous-panel.spec.ts`, `season-statistics.spec.ts` (pre-existing) ; `seasons-list.spec.ts` added for self chrome tone.

### API — avatar URL storage guard (AC: 6, 8)

- [x] [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) `toEligibleRow()` → `ParticipantRowPresentation.avatarUrl(avatarService, user)`.
- [x] [`TroupeDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt) `TroupeMemberAdminDto.from(entity, avatarService)`.
- [x] Reuse [`ParticipantRowPresentation.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRowPresentation.kt).
- [x] Integration tests: availability summary + troupe admin member list (`avatarUrl` null when bytes missing).

### Documentation (AC: 4)

- [x] [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) § Avatar fallback — letter + tone normative ; V1 emoji legacy reference only.
- [x] SPEC.md, DOMAIN.md, epics 2.12c, SCP §4.3 — aligned to tone (2026-06-05).
- [x] [member-gender-surfaces.md](../../docs/v2/technical/member-gender-surfaces.md): guard fixes + `seasons-list` row.

### Explicit non-goals (do not implement in 2.12c)

- [x] **V1 emoji fallback** — out of scope ; V2 uses letter + tone only.
- [x] **Role labels** — story **2.12b**.
- [x] **New `gender` DTO fields** — already delivered in **2.12b**.
- [x] **`gender` on `/v1/auth/me`** — privacy from **2.12** AC6.
- [x] **Mon profil gender editor** — story **2.12**.
- [x] **Parity strip / season stats card** — **6.21** / **16.3**.
- [x] **Custom avatar upload / Google import** — story **2.6**.

---

## Dev Notes

### Why this story exists (Wave B — avatars)

| Context | Detail |
|---------|--------|
| **SCP G-011 Wave B** | After **2.12** stores gender and **2.12b** exposes it on operational DTOs, avatars must visually reflect gender when no photo — same mnemonic tones as Mon profil toggle (grey / orange / purple). |
| **V1 reference** | `legacy/src/components/PlayerAvatar.vue` + `playerAvatars.js` — parity of **intent** (distinct fallback by gender) ; V2 uses letter + M3 tone tokens. |
| **UX frozen** | [ux-design-member-gender-parity.md](../planning-artifacts/ux-design-member-gender-parity.md) Cross-surface § **2.12c** ; [DESIGN.md](../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/DESIGN.md). |
| **Registry** | [member-gender-surfaces.md](../../docs/v2/technical/member-gender-surfaces.md) — authoritative per-surface checklist. |

### Normative docs (aligned 2026-06-05)

`member-gender.md`, SPEC.md, DOMAIN.md, epics 2.12c, and SCP §4.3 all specify **letter + gender tone** — not V1 emoji. Do not add emoji to `user-avatar.html`.

### Current state (READ before coding)

| File | Today | This story |
|------|-------|------------|
| [`user-avatar.ts`](../../apps/web/src/app/shared/user-avatar/user-avatar.ts) | Letter + `[gender]` tone classes ; image with error fallback | Verify all call sites ; harden null/unknown gender |
| [`user-avatar.scss`](../../apps/web/src/app/shared/user-avatar/user-avatar.scss) | `--hatcast-member-gender-*` on `:host(.user-avatar--tone-*)` | No new tokens unless contrast fix |
| [`member-display-name.service.ts`](../../apps/web/src/app/core/account/member-display-name.service.ts) | `avatarGender()` for self + preview | Reuse on any self-avatar chrome missing it |
| [`ParticipantRowPresentation.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRowPresentation.kt) | `avatarUrl()` with storage read guard | Extend usage to availability + troupe admin list |
| [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) | `gender` on summary rows ✅ ; `avatarUrl` without guard ⚠️ | Fix guard only |
| [`TroupeMemberAdminDto`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt) | `gender` ✅ ; `avatarUrl` without guard ⚠️ | Fix guard only |
| Most operational templates | `[gender]` wired per registry ✅ | Audit + `seasons-list` gap |

### Avatar selection rules (web)

```
if (avatarUrl loads) → show <img> (no letter)
else → show initial letter + tone from effectiveMemberGender(gender)
```

**Self (no row DTO):** `MemberDisplayNameService.avatarGender()` — loads from `/v1/me/preferences`, respects unsaved preview.

**Other participants:** `row.gender` / `participantGender` / `candidate.gender` from API (story **2.12b**).

### API design guardrails

- **Do not** add `gender` to new endpoints — consume existing fields.
- **Do not** expose gender on public glance beyond what **2.12b** already allows.
- Avatar guard: `avatarUpdatedAt != null` **and** `avatarService.readAvatarContent(user) != null` before emitting URL — see `ParticipantRowPresentation.avatarUrl()`.
- Batch avatar resolution for composition already uses participant services — leave unchanged unless guard missing.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Import | `effectiveMemberGender` from `core/account/member-gender.ts` at DTO boundaries |
| Component | Never fork avatar — always `app-user-avatar` with `displayName`, `avatarUrl`, `gender`, `size` |
| Self chrome | `MemberDisplayNameService.loadFromApi()` early in page init when showing self avatar |
| Tokens | Tone classes only — no inline `style.background` for gender |
| Photo precedence | Never show letter under successful image load |

### Traps / regressions

| Trap | Mitigation |
|------|------------|
| Reintroducing V1 emoji | Letter + tone only per normative docs |
| Tone on `<img>` path | Tone on `:host` is invisible under photo — OK ; verify letter path shows tone |
| Missing `[gender]` on new surface | Update registry + template in same PR |
| Broken `avatarUrl` without guard | User sees broken img icon — fix API guard (AC6) |
| Using `/v1/auth/me` for gender | Use preferences service for self |
| Re-implementing labels | Out of scope — **2.12b** |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **2.12** Optional gender profile | done | `users.gender` + Mon profil preview |
| **2.6** Avatar upload/Google | done | Photo precedence rules |
| **2.12b** Role labels + DTO gender | review | **Depends** — operational rows expose `gender` |
| **6.21** Parity strip | backlog | Independent |
| **16.3** Season parity stats | backlog | Independent |

### Previous story intelligence (2.12b)

- `ParticipantGenderResolver` + `gender` / `participantGender` on composition, availability, admin, stats, audit DTOs — **reuse fields for avatar tone**, do not add new API shape.
- Privacy: gender absent on `/v1/auth/me` — self avatar uses `MePreferencesApiService` via `MemberDisplayNameService`.
- `effectiveMemberGender()` normalizes wire values at all boundaries.
- Code review pattern: align story AC to frozen UX when epic text lags ; add integration tests for operational-only exposure.

### Previous story intelligence (2.12)

- `--hatcast-member-gender-*` tokens in [`_hatcast-semantic-colors.scss`](../../apps/web/src/styles/_hatcast-semantic-colors.scss).
- Live preview: `setGenderPreview` + `avatarGender()` on menu trigger — extend same service to any self-avatar chrome.
- M3 gender toggle frozen — **do not** modify Mon profil layout in **2.12c**.

### Git intelligence

| Commit | Relevance |
|--------|-----------|
| `ea9bde32` feat(account): optional member gender | **2.12** — `user-avatar` gender input + tokens + Mon profil preview |
| `9e989a31` / `4c338621` composition equipe | Slot rows use avatars — verify `[gender]` on equipe tab after pull |
| Working tree (2026-06-05) | Large **2.12b** diff already wires `[gender]` on most surfaces + API resolvers — **2.12c** finishes gaps (registry ⚠️, `seasons-list`, API guard), not greenfield component |

### Architecture compliance

- **Stack:** Angular 21.2 + Material 21.2 ; Kotlin Spring Boot ; PostgreSQL Flyway.
- **Auth:** No new routes ; avatar bytes still gated by existing membership rules (**2.6**).
- **OpenAPI:** No schema change required — `gender` and `avatarUrl` already on affected DTOs.
- **Privacy:** Avatar tone reveals no more than gender-aware labels already shown in operational UI (**2.12b**).

### Testing requirements

| Layer | Tests |
|-------|-------|
| Web unit | `user-avatar.spec.ts` tones + null/unknown ; surface specs (`availability-tous-panel`, `season-statistics`, `membres-tab`) |
| API integration | Availability summary `avatarUrl: null` when storage empty ; troupe members same |
| Manual | Registry § Regression checklist (Mon profil preview, Dispos Tous tones, Équipe avatars, admin lists, account menu) |
| Commands | `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false` |

### Manual recette (quick)

1. User A (**Féminin**, no photo): letter **orange** on Dispos Tous, Équipe slot, admin participants, stats grid, account menu.
2. User B (**Masculin**, no photo): letter **purple** on same surfaces.
3. User C (**Non spéc.**): letter **grey** everywhere.
4. User A uploads photo: photo shows ; tone hidden ; delete photo → orange letter returns.
5. API: user with stale `avatarUpdatedAt` but deleted blob → no broken image ; letter+tone shows.
6. `seasons-list` header menu: self avatar tone matches saved gender.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Closure pass after **2.12b** anticipation: cross-surface `[gender]` already wired ; this story closed gaps only.
- `seasons-list` self avatar uses `MemberDisplayNameService.avatarGender()`.
- API `avatarUrl` guard unified via `ParticipantRowPresentation` on availability summary + troupe admin list.
- `user-avatar` normalizes gender through `effectiveMemberGender()`.
- Normative docs (SPEC, DOMAIN, member-gender.md, epics, SCP) aligned to letter + tone — not V1 emoji.
- Story-scoped tests pass ; full web suite has pre-existing unrelated failures.

### File List

- apps/web/src/app/shared/user-avatar/user-avatar.ts
- apps/web/src/app/shared/user-avatar/user-avatar.spec.ts
- apps/web/src/app/pages/seasons-list/seasons-list.ts
- apps/web/src/app/pages/seasons-list/seasons-list.html
- apps/web/src/app/pages/seasons-list/seasons-list.spec.ts
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt
- docs/v2/technical/member-gender-surfaces.md
- _bmad-output/specs/spec-member-gender-parity/member-gender.md
- SPEC.md, DOMAIN.md, epics.md, sprint-change-proposal (SCP)
- _bmad-output/implementation-artifacts/2-12c-avatars-repli-selon-genre.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-05 : Story created (`bmad-create-story` for 2.12c).
- 2026-06-05 : Normative docs amended — V2 avatar fallback is letter + tone (not V1 emoji).
- 2026-06-05 : Closure implementation — seasons-list gender, API avatar guard, tests (`bmad-dev-story` closure).
- 2026-06-05 : Code review combinée — garde `avatarUrl` étendue à profil/glance ; `home-signed-in` mort supprimé ; status `done`.

---

### Review Findings

- [x] [Review][Patch] Garde `avatarUrl` profil + glance — `ParticipantRowPresentation.avatarUrl()` + tests intégration.
- [x] [Review][Patch] `home-signed-in` — fichiers template morts supprimés (redirect inline ; N/A avatar).
- [x] [Review][Decision] `gender` profil/glance — **D2:A** (voir 2.12b) ; troupe authentifiée uniquement.
- [x] [Review][Defer] Couleurs hex de repli dans `user-avatar.scss` (`#e8def8`, `#1d192b`) — fallbacks M3 préexistants sous les tokens genre.

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP / UX frozen)
- [x] Section **Material 3** remplie (avatar/tone UI story)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés
- [x] Non-goals explicites (V1 emoji, labels, parity, auth/me gender)
- [x] Normative docs aligned to letter + tone (SPEC, DOMAIN, member-gender.md, epics, SCP)
