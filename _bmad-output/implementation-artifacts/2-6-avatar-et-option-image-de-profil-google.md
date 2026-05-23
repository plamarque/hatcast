# Story 2.6: Profile Avatar and Google Photo Import

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **HatCast user**,
I want to **set or update my profile avatar, including optionally using my Google account photo when I sign in with Google**,
so that **I am visually recognizable across the interface (user menu, member lists, and future profile surfaces)**.

## Acceptance Criteria

1. **Given** an authenticated user uploads a valid avatar file (JPEG, PNG, or WebP; ≤ **2 MB**), **when** the upload succeeds, **then** `users.avatar_url` (or equivalent storage pointer) is persisted, returned on `GET /v1/auth/me` / sign-in responses as `user.avatarUrl`, and the image renders in all MVP avatar surfaces listed in Dev Notes. [Source: `_bmad-output/planning-artifacts/prd.md` FR10; `_bmad-output/planning-artifacts/epics.md#story-26--avatar-et-option-image-de-profil-google`]
2. **Given** an invalid file (wrong MIME/extension, corrupt payload, or size > 2 MB), **when** upload is attempted, **then** the API returns **400** with French user-safe copy (e.g. *« Format non pris en charge »*, *« Fichier trop volumineux (2 Mo max.) »*) and the previous avatar is unchanged. [Source: FR10]
3. **Given** a user signed in with **Google** (`users.google_sub` not null) and a Google profile picture available (`picture` claim in ID token or equivalent client-provided URL validated server-side), **when** they choose **« Utiliser ma photo Google »** on `/compte` **or** accept the first-sign-in prompt (see AC4), **then** the Google photo becomes the stored avatar and displays like a custom upload. [Source: FR10]
4. **Given** a **first successful Google sign-in** (`POST /v1/auth/google`) for a user with **no avatar yet**, **when** the ID token contains a `picture` claim, **then** the client may show a **one-time** dialog offering to import the Google photo (*Oui* → import, *Non* / dismiss → skip); declining must not block navigation. Re-showing the prompt on later sign-ins is **out of scope** once dismissed or an avatar exists. [Source: FR10 — *« from account settings or at first Google sign-in »*]
5. **Given** a user already has a custom avatar, **when** they upload a new file or import Google photo from `/compte`, **then** the new image **replaces** the previous one (including deleting/replacing the prior stored blob if applicable). [Source: FR10 — *« replace »*]
6. **Given** a user removes their avatar (optional `DELETE` or explicit *« Supprimer »* control on `/compte`), **when** confirmed, **then** `avatar_url` is cleared and UI falls back to **initial letter** derived from troupe pseudo (when in troupe context) or account display name / email — same rules as today’s text-only menus. [Source: UX-DR8 initial-or-photo pattern; Story 2.5 display label helper]
7. **Given** avatar is **account-level** (not troupe-scoped), **when** the same user belongs to multiple troupes, **then** one avatar is shared across all troupes and contexts. [Source: FR10 vs FR9 troupe pseudo in Story 2.5]
8. **Given** a troupe **admin** views the **Membres** tab, **when** member rows render, **then** each member shows photo when `avatarUrl` is present, otherwise the existing **initial** fallback (`membres-tab.avatarInitial`). [Source: UX-DR10; Story 2.8 row layout]
9. **Given** a user without a valid session, **when** they call avatar mutation endpoints, **then** **401**; a user cannot change another user’s avatar (**403** if ever exposed). Avatar bytes/URLs for other members are visible only in **authenticated troupe contexts** already gated by membership admin APIs (NFR-S2). [Source: NFR-S2]
10. **Given** this story is complete, **when** tests run, **then** API integration tests cover upload validation, Google import, replace, delete, and auth; web tests cover avatar component, `/compte` flows, and at least one header/menu surface; `cd services/api && ./gradlew test`, `npm run test -w @hatcast/web -- --watch=false`, and `npm run build -w @hatcast/web` succeed. [Source: `_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries`]

## Tasks / Subtasks

- [x] **Database migration** (AC: 1, 5, 6, 7)
  - [x] Add Flyway `V12__user_avatar.sql`: `users.avatar_url VARCHAR(2048) NULL`, `users.avatar_updated_at TIMESTAMPTZ NULL` (no separate per-troupe column).
  - [x] Extend `UserEntity` + map in repositories; no JPA exposure via controllers.

- [x] **Avatar storage service** (AC: 1, 2, 5, 6)
  - [x] Introduce `AvatarStorage` port + implementations:
    - **`LocalAvatarStorage`** — filesystem under configurable path (default `${java.io.tmpdir}/hatcast-avatars`) for **local dev and integration tests**.
    - **`GcsAvatarStorage`** (or defer with feature flag) — bucket object key `avatars/{userId}/{uuid}.{ext}`; document env vars in `services/api/README.md` (`HATCAST_AVATAR_STORAGE`, `HATCAST_GCS_AVATAR_BUCKET`).
  - [x] On replace/delete, remove prior blob when it was stored by HatCast (do not DELETE external Google URLs).
  - [x] Validate: allowed content types `image/jpeg`, `image/png`, `image/webp`; max **2_097_152** bytes; reject empty files.

- [x] **Backend API — profile avatar** (AC: 1–3, 5, 6, 9)
  - [x] Add `ProfileController` or extend `AuthController` under `/v1/auth/me/avatar`:
    - `POST` `multipart/form-data` field `file` — upload/replace custom avatar.
    - `POST` `application/json` `{ "pictureUrl": "..." }` or server-side read from session — **Google import** (validate host `*.googleusercontent.com`, fetch/copy bytes into HatCast storage; do not persist external URL only — avoids broken/expired Google links per V1 lessons in `docs/v1/technical/GOOGLE_AVATAR_SYNC.md`).
    - `DELETE` — clear avatar (optional but recommended for AC6).
  - [x] Session cookie + **CSRF** on mutations (same as troupe PATCH/import).
  - [x] Return updated `UserSummaryDto` including `avatarUrl` (absolute URL or same-origin path like `/v1/auth/me/avatar/content` — pick **one** pattern and document in OpenAPI).

- [x] **Serve avatar bytes** (AC: 1, 8, 9)
  - [x] Either public CDN/GCS URL stored in `avatar_url`, **or** `GET /v1/users/{userId}/avatar` (session required; caller must share troupe membership with target user OR `userId` = self). Prefer **same-origin GET** for MVP to avoid new public bucket policy.
  - [x] Cache headers: `Cache-Control: private, max-age=3600` (avatar changes invalidate via URL version query or updated timestamp).

- [x] **Extend auth/session DTOs** (AC: 1, 3, 4)
  - [x] Add `avatarUrl: String?` to `UserSummaryDto`, OpenAPI `UserSummary`, and Angular `UserSummary`.
  - [x] Optionally capture Google `picture` during `POST /v1/auth/google` in `AuthUserLinkService` / controller (store transiently in session or return in response metadata for first-sign-in prompt — **do not auto-import** without user consent per FR10).

- [x] **Admin member list — avatar field** (AC: 8)
  - [x] Add `avatarUrl` to `TroupeMemberAdmin` DTO (join `users` on export/list queries).
  - [x] Update `services/api/openapi/seasons.yaml` and `TroupeApiService` TypeScript interface.

- [x] **Angular — shared avatar component** (AC: 1, 6, 8)
  - [x] Create `UserAvatarComponent` (standalone): inputs `displayName`, `avatarUrl`, `size`; circular `<img>` with `loading="lazy"`; fallback initial letter (reuse logic from `membres-tab.avatarInitial`); handle `error` → fallback.
  - [x] Do **not** use `mat-icon account_circle` when `avatarUrl` is set.

- [x] **Angular — `/compte` avatar section** (AC: 1–3, 5, 6)
  - [x] Add card **« Photo de profil »** above pseudo section in `account-placeholder.*`.
  - [x] Show current avatar preview via `UserAvatarComponent`.
  - [x] Actions: *« Choisir une image »* (`input type="file" accept="image/jpeg,image/png,image/webp"`), *« Utiliser ma photo Google »* (visible only when account has Google provider — detect via optional flag from API e.g. `hasGoogleAccount: Boolean` on session user, or infer from login method stored client-side), *« Supprimer »* when avatar exists.
  - [x] Client-side pre-check file size ≤ 2 MB before upload; snack success *« Photo enregistrée »* / errors aligned with API messages.
  - [x] After save, refresh auth session user (`GET /v1/auth/me`) so headers update without full reload.

- [x] **Angular — first Google sign-in prompt** (AC: 4)
  - [x] After successful `signInWithGoogleIdToken`, if response indicates `avatarUrl == null` and `googlePictureUrl` (or parse from GIS credential decode client-side **only for UI prompt** — import still via API), show `MatDialog` once per browser (localStorage key `hatcast.googleAvatarPromptDismissed` or server flag if added).
  - [x] *Oui* calls Google import endpoint then navigates; *Non* sets dismissed flag.

- [x] **Wire avatar into existing headers** (AC: 1, 6)
  - [x] Replace `account_circle` icon with `UserAvatarComponent` in: `home-signed-in.html`, `season-header.html`, `admin-membres.html` user menu triggers.
  - [x] Update `membres-tab.html` row avatar span to use `UserAvatarComponent` with `member.avatarUrl` + `member.displayName`.

- [x] **OpenAPI** (AC: 1–3, 6, 8)
  - [x] Extend `services/api/openapi/auth.yaml` (avatar endpoints + `UserSummary.avatarUrl`).
  - [x] Extend `seasons.yaml` `TroupeMemberAdmin.avatarUrl`.

- [x] **Tests** (AC: 1–10)
  - [x] API: `ProfileAvatarIntegrationTest` or extend auth tests — upload happy path, oversize 400, bad MIME 400, delete, Google import mock fetch, unauthorized 401.
  - [x] Web: `user-avatar.component.spec.ts`, extend `account-placeholder.spec.ts`, header spec proving image vs initial.
  - [x] Run full API + web test suites and web build.

## Dev Notes

### Scope boundaries

- **In scope:** Account-level avatar storage (FR10), upload/replace/delete, optional Google import (settings + first-sign-in prompt), `avatarUrl` on session user + admin member list, shared avatar component, user-menu/header/membres-tab display.
- **Out of scope:** Member profile **popover** with stats/chart (Story **2.7** / UX-DR8 — reuse `UserAvatarComponent` only); avatar on season agenda participant rows / event dispos grids (later epics); account email/password/display name editing (Story **1.6** / FR36); image cropping/recording; Gravatar; syncing avatar into legacy Firestore `players.photoURL`; troupe-scoped avatars (pseudo stays troupe-scoped per Story 2.5); automatic Google import **without** user action.
- **Do not modify `legacy/`.**

### Current system snapshot (critical — nothing exists yet)

| Area | Today | Gap for FR10 |
|------|--------|----------------|
| DB | `users` has `id`, `google_sub`, `idp_uid`, `email`, `display_name`, timestamps — **no avatar columns** | Migration V12 |
| API DTOs | `UserSummaryDto` = `id`, `email`, `displayName` only | Add `avatarUrl` |
| Auth Google | JWT parsed for `sub`, `email`, `name` — **`picture` ignored** (`AuthController.signInWithGoogle`) | Capture for import offer |
| Storage | No GCS/local avatar config in `application.yml` | New `hatcast.avatar.*` config |
| Web UI | `mat-icon account_circle` + initial letter in admin list | `UserAvatarComponent` |
| `/compte` | Pseudo par troupe (Story 2.5) only | Add avatar card |

### Product rules (locked — from PRD FR10)

| Rule | Value |
|------|--------|
| Formats | JPEG, PNG, WebP |
| Max size | **2 MB** |
| Scope | **Account-level** (one avatar per user, all troupes) |
| Google import | User-initiated from `/compte` **or** one-time prompt at **first** Google sign-in |
| After Google import | Custom upload **may replace** at any time |
| Display fallback | Initial letter from visible name (troupe pseudo in troupe context via `TroupeContextService.currentUserDisplayLabel`) |

### Recommended API shape

```http
POST /v1/auth/me/avatar
Content-Type: multipart/form-data
X-XSRF-TOKEN: …

file=<binary>
→ 200 { "user": { "id", "email", "displayName", "avatarUrl" } }

POST /v1/auth/me/avatar/google
Content-Type: application/json
X-XSRF-TOKEN: …

{}
→ 200 same body (server uses latest validated Google picture URL from token/session)

DELETE /v1/auth/me/avatar
X-XSRF-TOKEN: …
→ 200 or 204 with updated user summary
```

**Alternative:** single `GET /v1/auth/me/avatar/content` streams bytes for `<img src>` when `avatar_url` stores an internal key — avoids exposing bucket names. Document chosen approach in OpenAPI.

### Storage decision (MVP)

Architecture doc does **not** yet ADR-file storage. For this story:

1. **Implement `AvatarStorage` abstraction** — do not inline filesystem calls in controllers.
2. **Tests + local dev:** `LocalAvatarStorage` only (no GCS credentials required in CI).
3. **Production:** wire `GcsAvatarStorage` when `HATCAST_AVATAR_STORAGE=gcs` and bucket env set; otherwise fall back to local with loud startup warning in non-test profiles.

Copy Google image bytes into HatCast storage on import (V1 stored external URLs on `players` — V2 account avatar should **not** depend on long-lived Google hotlinking).

### Google picture sanitization (from V1)

When copying from Google, normalize URL size suffix like V1 (`docs/v1/technical/GOOGLE_AVATAR_SYNC.md`): replace `=s\d+-c` with `=s96` before fetch if using URL-based import helper.

### UI guidance (`/compte`)

- **French copy:** section *« Photo de profil »*; helper *« Visible dans l’application (menu compte, listes de membres). Formats : JPEG, PNG, WebP — 2 Mo max. »*; button *« Utiliser ma photo Google »*; *« Supprimer la photo »*.
- Keep existing pseudo section unchanged (Story 2.5).
- Material: `mat-stroked-button` / `mat-flat-button`; hidden file input pattern; show `mat-spinner` on upload.

### Display surfaces (MVP checklist)

| Surface | File | Change |
|---------|------|--------|
| Home user menu | `home-signed-in.html` | Avatar component in trigger |
| Season header menu | `season-header.html` | Same |
| Admin header menu | `admin-membres.html` | Same |
| Admin member rows | `membres-tab.html` | Photo or initial |
| Account settings | `account-placeholder.html` | Editor card |

**Not in this story:** season agenda participant filter avatar, event detail grids, profile popover (2.7).

### Architecture and guardrails

- REST `/v1`, camelCase JSON, snake_case DB, session cookie + CSRF on mutations. [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- Authorization: only `SessionUserPrincipal.userId` may mutate own avatar (NFR-S2).
- Reuse `csrfHeaders()` from `apps/web/src/app/core/http/hatcast-csrf.ts` for POST/DELETE (pattern from `troupe-api.service.ts` CSV import).
- Multipart precedent: `TroupeController.importMembers` (`@RequestParam("file") MultipartFile`).
- Angular: standalone components, signals, Material — match `account-placeholder` / `season-header` styling.
- Extend `AuthApiService` (or add `ProfileApiService`) — keep fetch + credentials pattern.

### Previous story intelligence

- **Story 2.5 (done):** `/compte` already loads troupes and pseudo editor; **add avatar card above pseudo section**; use `TroupeContextService.currentUserDisplayLabel()` for fallback initial text; refresh session user after avatar change (similar to `patchMembershipDisplayName` pattern but on auth user).
- **Story 2.8 (done):** Admin membres rows use `avatarInitial()` — extend to photo when `avatarUrl` present; do not break inline pseudo edit.
- **Story 1.1 (done):** Google GIS on login page; extend post-login flow for optional import dialog (AC4).
- **Story 2.5 explicitly deferred avatar** — this story owns FR10 end-to-end.

### Git intelligence

Recent Epic 2 commits to preserve:

- `2a69ed2 feat(troupe): Add self-service display name` — `/compte` structure and header label helpers; extend, do not rewrite pseudo flow.
- `c2f6ba7 feat(web): Add multi-troupe context switching` — avatar is account-level; same photo in all troupe contexts.
- `e7868f1 feat(web): Add admin members route` — membres-tab row layout is the admin avatar consumer.

### V1 reference (behaviour only — do not port Firestore)

- V1 synced Google `photoURL` to season **player** documents (`legacy/src/services/playerAvatars.js`) — V2 stores on **`users`** only; season participant avatars for managed players without accounts remain Story 3.8+.
- V1 `UserAvatar.vue` / `PlayerAvatar.vue`: lazy img load, error → emoji/initial fallback — mirror error fallback in `UserAvatarComponent`.

### Testing commands

- API: `cd services/api && ./gradlew test`
- Focused: `./gradlew test --tests '*ProfileAvatar*'` (or chosen test class name)
- Web: `npm run test -w @hatcast/web -- --watch=false`
- Build: `npm run build -w @hatcast/web`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-26--avatar-et-option-image-de-profil-google`]
- [Source: `_bmad-output/planning-artifacts/prd.md` FR10, FR36, NFR-S2]
- [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- [Source: `_bmad-output/planning-artifacts/architecture.md#authentication--security`]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` — user menu avatar, member profile initial-or-photo]
- [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` — Avatar: initial or photo]
- [Source: `docs/v1/technical/GOOGLE_AVATAR_SYNC.md`]
- [Source: `docs/v1/technical/GOOGLE_AVATAR_IMPLEMENTATION.md`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt`]
- [Source: `services/api/openapi/auth.yaml`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt` — multipart pattern]
- [Source: `apps/web/src/app/core/auth/auth-api.service.ts`]
- [Source: `apps/web/src/app/pages/account-placeholder/account-placeholder.ts`]
- [Source: `apps/web/src/app/pages/season-home/season-header.html`]
- [Source: `apps/web/src/app/pages/admin-membres/membres-tab.ts`]
- [Source: `apps/web/src/app/core/troupes/troupe-context.service.ts`]
- [Source: `_bmad-output/implementation-artifacts/2-5-pseudo-affiche-par-troupe.md`]
- [Source: `_bmad-output/implementation-artifacts/2-8-admin-membres-route-ui-ux-dr10.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- Flyway V12 : H2 ne supporte pas `ADD COLUMN …, …` ni `TIMESTAMPTZ` — migration scindée en deux `ALTER` avec `TIMESTAMP`.

### Completion Notes List

- Backend : migration V12, `AvatarStorage` + `LocalAvatarStorage`, endpoints `/v1/auth/me/avatar` (POST/DELETE), `/v1/auth/me/avatar/google`, `GET /v1/users/{id}/avatar` avec contrôle troupe commune.
- DTOs : `UserSummaryDto.avatarUrl`, `hasGoogleAccount`, `AuthSessionResponse.googlePictureUrl` ; `TroupeMemberAdminDto.avatarUrl`.
- Front : `UserAvatarComponent`, section `/compte`, dialog première connexion Google, menus header + lignes membres.
- Tests : `ProfileAvatarIntegrationTest` (127 tests API OK), web 120 tests OK, build OK.

### File List

- services/api/src/main/resources/db/migration/V12__user_avatar.sql
- services/api/src/main/kotlin/com/hatcast/api/avatar/*.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
- services/api/src/main/resources/application.yml
- services/api/src/test/resources/application-test.yml
- services/api/src/test/kotlin/com/hatcast/api/avatar/ProfileAvatarIntegrationTest.kt
- services/api/openapi/auth.yaml
- services/api/openapi/seasons.yaml
- services/api/README.md
- apps/web/src/app/shared/user-avatar/*
- apps/web/src/app/core/auth/auth-api.service.ts
- apps/web/src/app/core/auth/auth-api.service.spec.ts
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/pages/account-placeholder/*
- apps/web/src/app/pages/login/login.ts
- apps/web/src/app/pages/login/google-avatar-prompt-dialog.ts
- apps/web/src/app/pages/home-signed-in/*
- apps/web/src/app/pages/season-home/season-header.*
- apps/web/src/app/pages/season-home/season-header.spec.ts
- apps/web/src/app/pages/admin-membres/admin-membres.*
- apps/web/src/app/pages/admin-membres/membres-tab.*

## Change Log

- 2026-05-23 — Story 2.6 : avatars compte (upload, import Google, suppression), affichage menus et admin membres.
- 2026-05-23 — Code review : 7 patches appliqués (imageFailed reset, localStorage scopé, googleSub guard, magic bytes, fetch size limit, test 403).

### Review Findings

- [x] [Review][Patch] `UserAvatarComponent` ne réinitialise pas `imageFailed` quand `avatarUrl` change — après une erreur de chargement, un nouvel upload/import sur `/compte` reste bloqué sur l’initiale [`apps/web/src/app/shared/user-avatar/user-avatar.ts:13-26`]
- [x] [Review][Patch] Clé `localStorage` du prompt Google non scopée à l’utilisateur — un refus sur le compte A supprime le prompt pour le compte B sur le même navigateur (AC4) [`apps/web/src/app/pages/login/login.ts:27,237`]
- [x] [Review][Patch] Import Google sans contrôle `googleSub` côté API — tout utilisateur authentifié peut importer via une URL `*.googleusercontent.com` (AC3, NFR-S2) [`services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt:82-98`]
- [x] [Review][Patch] Upload ne valide que le MIME, pas les magic bytes — fichier corrompu / spoofé avec `Content-Type` image accepté (AC2) [`services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt:126-138`]
- [x] [Review][Patch] `detectContentType` retombe sur `image/jpeg` pour octets non reconnus après fetch Google [`services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt:151-176`]
- [x] [Review][Patch] `GooglePictureFetcher` sans plafond de taille sur la réponse HTTP — risque mémoire / DoS [`services/api/src/main/kotlin/com/hatcast/api/avatar/GooglePictureFetcher.kt:13-24`]
- [x] [Review][Patch] Test d’intégration manquant : `GET /v1/users/{id}/avatar` → 403 sans troupe commune (AC9, AC10) [`services/api/src/test/kotlin/com/hatcast/api/avatar/ProfileAvatarIntegrationTest.kt`]
- [x] [Review][Defer] `AvatarConfig` lève `IllegalStateException` si `HATCAST_AVATAR_STORAGE=gcs` au lieu d’un warning au démarrage comme suggéré dans Dev Notes — deferred, prod GCS hors périmètre MVP [`services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarConfig.kt:15-18`]
