# Story 1.7: Account deletion — Mon compte (explicit confirmation & consequences)

Status: review

baseline_commit: 8d4868aa629123e5bfa83f10289664034fd6e279

<!-- bmad-create-story — 2026-06-03 — P0 V2.0.0 ; user constraint: confirmation dialog must clearly explain consequences -->

## Story

As a **signed-in** HatCast user,  
I want to **delete my account** from **Mon compte → Sécurité → Zone sensible**, after a **clear, multi-step confirmation** that explains **all consequences**,  
so that my **personal data is handled per product policy (FR37)** and I understand this is **different from troupe admin “Retirer”** (membership-only removal).

## Acceptance Criteria

1. **Enable delete action (FR37, UX C6):** Given an authenticated user on **`/compte/securite`**, when the shell has loaded session data, then **`Supprimer mon compte`** is **enabled** (no **Bientôt** badge, no disabled wrapper). Preserve stable `data-testid="account-delete"`. Email/password rows follow story **1.6** state (enabled when **1.6** is done). [Source: epics 1.7 ; [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) § Zone sensible ; story **17.34**]

2. **Multi-step confirmation — consequences first (NFR-S3, user constraint):** Given the user taps **Supprimer mon compte**, when the flow starts, then a **`MatDialog`** (dedicated component, not a single generic confirm) presents **step 1 — information** with **French copy** listing at minimum:
   - **Immediate sign-out** and **no future sign-in** with this HatCast account.
   - **Personal data removed/anonymized:** email, display name, member pseudo, avatar, notification preferences and push subscriptions.
   - **All active troupe memberships deactivated** (loss of troupe app access) — **without** removing the person from season statistics (see AC 10).
   - **Season statistics preserved:** past participations (selections, dispos, declines) **remain counted** for the troupe under the **participant’s display name** already stored on the season roster — only **identifiable account data** (email, profile link, avatar) is removed.
   - **Historical troupe data preserved in anonymized form:** past availabilities, compositions, and **audit journal entries** stay for troupe governance (FR37) — actor/subject labels fall back to **« Utilisateur anonymisé »** (existing [`AuditIdentityResolver`](../../services/api/src/main/kotlin/com/hatcast/api/audit/AuditIdentityResolver.kt)).
   - **Distinct from admin “Retirer”:** admin troupe removal sets season participants to **`REMOVED`** and **drops them from stats**; account deletion **does not** — it only kills login + PII (FR7 vs FR37 ; story **2.8** / **membres-tab** copy).
   - **Irreversible** action.
   Primary action on step 1: **Continuer** (not destructive yet) ; secondary: **Annuler**. [Source: FR37 ; ux-design-mon-compte.md « dialog confirmation multi-étape » ; PRD FR37]

3. **Multi-step confirmation — explicit consent:** Given step 1 was acknowledged, when step 2 renders, then the user must **type the exact phrase `SUPPRIMER`** (case-sensitive) in a **`mat-form-field`** before the destructive button enables. The dialog shows a short recap title, e.g. *« Confirmer la suppression définitive »*. Destructive confirm label: **Supprimer mon compte définitivement** (`mat-flat-button`, `color="warn"`). [Source: NFR-S3 explicit confirmation ; seasons-list delete pattern for destructive styling]

4. **Re-authentication before API call (NFR-S1):** Given step 2 phrase is valid, when the user confirms, then the client obtains **proof of recent identity** before calling the API:
   - **Email/password (Identity Platform):** prompt for **current password** in the same dialog (step 2 or step 3), call `reauthenticateWithCredential` + `getIdToken(true)` via [`FirebaseAuthService`](../../apps/web/src/app/core/auth/firebase-auth.service.ts).
   - **Google-only (`hasGoogleAccount`, no password):** trigger **Google Identity Services** re-sign-in (same GIS callback pattern as [`login.ts`](../../apps/web/src/app/pages/login/login.ts)) to obtain a **fresh Google ID token** (proves account control).
   On re-auth failure (`auth/wrong-password`, `auth/requires-recent-login`, GIS cancel), show **French, user-safe** messages via [`auth-user-message.ts`](../../apps/web/src/app/core/auth/auth-user-message.ts) — do not call delete API. [Source: ADR-0010 ; story **1.6** re-auth pattern]

5. **API — delete account (FR37):** Given valid session + CSRF + re-auth token, when the client calls **`DELETE /v1/auth/me`** with body `{ "idToken": "<fresh Google or IdP token>" }`, then the server (new **`AccountDeletionService`**):
   - Verifies the token matches the **current session user** (`google_sub` or `idp_uid` / email per auth path).
   - **Rejects (409)** if the user is the **sole active `TROUPE_ADMIN`** of any troupe (reuse last-admin logic from [`TroupeMembershipService.ensureLastAdminRemains`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) — message lists affected troupe name/slug when possible).
   - **Rejects (409)** if account already deleted (`deleted_at` not null).
   - In one transaction: set **`users.deleted_at`**, **anonymize PII** on `users` row (clear `email`, `display_name`, `member_display_name`, `google_sub`, `idp_uid`, `avatar_url`, `avatar_updated_at`; reset `push_notifications_enabled=false`, `notification_preferences={}`; keep **`id`** and **`slug`** for FK integrity).
   - Sets **all active troupe memberships** to **`INACTIVE`** (revokes app access) — **do not** call [`SeasonParticipantMembershipSync.removeForMembershipAcrossTroupe`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt) (that path sets `season_participants.status = REMOVED` and **excludes the row from stats** — wrong for account delete).
   - **Anonymizes linked roster rows (AC 10):** for each `season_participants` / `event_participants` linked to the user, clear **`normalized_email`**, set **`user_id = NULL`** (schema allows `ON DELETE SET NULL`), **keep `display_name`** and **`status = ACTIVE`** so [`SeasonStatisticsService`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) still includes the row (`findBySeason_IdAndStatus… ACTIVE`). Historical availabilities/compositions/slots remain keyed by **`season_participant_id`** / anonymized **`users.id`** — counts unchanged.
   - Deletes stored avatar binary if present ([`AvatarService`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt)).
   - Clears push subscriptions ([`UserPushSubscriptionService`](../../services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionService.kt)).
   - Deletes Identity Platform user via **`FirebaseAuth.getInstance().deleteUser(idpUid)`** when `idp_uid` present (best-effort ; log failure, still complete HatCast anonymization).
   - Records audit event **`ACCOUNT_DELETED`** (new [`AuditActionType`](../../services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionType.kt)) with `actor_user_id` = self, metadata `{ "initiatedBy": "self" }`.
   - Invalidates server session (same as logout).
   Returns **204 No Content**. OpenAPI documented in [`auth.yaml`](../../services/api/openapi/auth.yaml). Register route + CSRF in [`SecurityConfig`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt). [Source: FR37 ; DOMAIN.md audit retention ; ADR-0010 Admin SDK]

6. **Block re-login after deletion:** Given a user row with **`deleted_at` set**, when they attempt **Google** or **IdP** sign-in, then [`AuthUserLinkService`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt) returns **403** with message *« Ce compte a été supprimé. »* — no new session. [Source: FR37 revoke authentication]

7. **Client completion UX:** Given API returns **204**, when deletion succeeds, then the client runs full logout chain ([`AuthApiService.logout()`](../../apps/web/src/app/core/auth/auth-api.service.ts) — IdP `signOut` when applicable), shows snackbar *« Votre compte a été supprimé. »*, and navigates to **`/connexion`** (no return to `/compte`). On **409** (last admin or already deleted), show dialog/snackbar with server message — user stays signed in. [Source: story **1.5** logout pattern]

8. **Schema migration:** Flyway migration adds **`users.deleted_at TIMESTAMPTZ NULL`** (+ index for lookup). No hard `DELETE FROM users` (audit FK [`audit_events_actor_fk`](../../services/api/src/main/resources/db/migration/V43__audit_events.sql)). [Source: FR37 preserve audit ; epic-9 readiness note R6]

9. **Out of scope:** GDPR export/portability runbook (NFR-S3 ops doc — note in Dev Notes only) ; admin-initiated deletion ; delayed 30-day queue (MVP = immediate on confirm) ; `legacy/` changes ; troupe-visible analytics (FR47).

10. **Statistics integrity after delete (FR37, DOMAIN):** Given a user with past season participations (validated compositions, availabilities, declines) who completes account deletion, when an authorized member loads **`GET /v1/seasons/{id}/statistics`**, then:
    - The participant row **still appears** in `rows` with the **same numeric totals** (selections, dispos, declines) as before deletion.
    - `displayName` on the stats row reflects the **denormalized `season_participants.display_name`** (unchanged unless product chooses a generic label — default: keep stored name).
    - `userSlug` and `avatarUrl` are **absent** (`null`) — no link to `/membre/:slug` for a deleted account.
    - The deleted user **cannot** access stats or any member surface (membership `INACTIVE`, sign-in blocked).
    **Regression guard:** account delete must **not** invoke the admin-membership path that sets `season_participants.status = REMOVED`. [Source: [`SeasonStatisticsService.loadStatistics`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) ACTIVE filter ; DOMAIN.md three-level removal ; stakeholder amendement 2026-06-03]

**Product coverage:** FR37 ; NFR-S1, NFR-S3 ; P0 V2.0.0 ([sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md)).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the delete flow, **when** rendered, **then** use **`MatDialog`** + **`mat-form-field`** + **`mat-flat-button`/`mat-button`** (warn for final confirm) — not custom full-page forms or div buttons. Reuse or extend [`ConfirmDialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) only if insufficient for multi-step ; prefer dedicated `account-delete-dialog`. List row stays **`mat-list-item`**. [Source: ux-design-mon-compte.md ; FRONTEND_UI.md]

**M3-2. Tokens & thème** — **Given** danger zone + dialog, **when** styled, **then** use [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss) tokens (`--mat-sys-error`, `outline-variant`) ; consequence list readable on mobile (no hex). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** dialog open, **then** content scrolls inside `mat-dialog-content` ; actions wrap ; destructive confirm ≥ **48dp** ; French **`aria-label`** on icon-only close. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** post-delete redirect, **when** landing on `/connexion`, **then** no account chrome on deleted session ; no new global nav. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` + Flyway + OpenAPI ; **no** `legacy/`.
- [x] **AC 8 — Migration** — `V53__users_deleted_at.sql` (or next id): `deleted_at`, partial index `WHERE deleted_at IS NULL` optional ; map field on [`UserEntity`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt).
- [x] **AC 5–6 — API** — `AccountDeletionService` + `DELETE` handler on [`AuthController`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt) or `MeAccountController` ; DTO `AccountDeletionRequest { idToken }` ; `AuditActionType.ACCOUNT_DELETED` + label in [`AuditActionLabels`](../../services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionLabels.kt) ; guard `AuthUserLinkService` for deleted users ; SecurityConfig + CSRF for `DELETE /v1/auth/me`.
- [x] **AC 5, 10 — Tests API** — Integration tests: happy path anonymization ; 409 last-admin ; 409 already deleted ; re-login blocked ; audit row written ; **stats row still present with same counts after delete** (seed composition + availability, delete, re-fetch statistics). Assert `season_participants.status` stays **`ACTIVE`**, not `REMOVED`. Pattern: [`AuthControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt), [`TroupeMembershipIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt), composition/availability integration tests.
- [x] **AC 1–4, 7 — UI dialog** — New `account-delete-dialog.ts/html` : step 1 consequences (bulleted `mat-list` or `<ul>`), step 2 typed `SUPPRIMER` + re-auth fields ; wire [`account-security-tab`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts).
- [x] **AC 4, 7 — Client API** — `AuthApiService.deleteAccount(idToken)` → `DELETE /v1/auth/me` with CSRF ; handle 204/409.
- [x] **AC 1, 7 — Tests web** — Update [`account-placeholder.spec.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts): delete enabled ; dialog opens ; phrase gate ; mock API success → logout redirect. Unit test dialog with mocked auth.
- [x] **AC 9 — Docs** — Short operator note in story Dev Agent Record or `docs/v2/` pointer: IdP `deleteUser` requires Firebase Admin credentials (same as token verify).

---

## Dev Notes

### Product and UX rules

- Normative UX: [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) — **tap → dialog confirmation multi-étape (NFR-S3)**.
- **User constraint (Patrice, 2026-06-03):** confirmation must **explain consequences clearly** — step 1 is mandatory informational content, not a single « Are you sure? ».
- **V1 reference:** [`AccountMenu.vue`](../../legacy/src/components/AccountMenu.vue) had a red button + one-line warning ; V2 is **strictly stronger** (multi-step + typed phrase + re-auth). V1 full delete was **not implemented** (`GridBoard.handleAccountDeleteAccount` → alert placeholder).
- **Contrast with troupe removal:** [`membres-tab`](../../apps/web/src/app/pages/admin-membres/membres-tab.ts) uses [`ConfirmDialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) with *« Son compte HatCast n'est pas supprimé. »* — account delete copy must **mirror the inverse** to prevent confusion (FR7 vs FR37).

### Account delete vs troupe removal — stats (normative)

| | Admin **Retirer** (FR7) | **Suppression compte** (FR37) |
|--|-------------------------|-------------------------------|
| `troupe_memberships.status` | `INACTIVE` | `INACTIVE` |
| `season_participants.status` | `REMOVED` (via sync) | **`ACTIVE`** (unchanged) |
| Stats grid row | **Hidden** | **Kept** (same counts) |
| `users` row | Unchanged | **Anonymized** (`deleted_at`) |
| Re-login | Possible | **Blocked** |

**Why:** [`SeasonStatisticsService`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) loads only **`ACTIVE`** season participants. Calling `removeForMembershipAcrossTroupe` on account delete would **alter troupe statistics** (under-count participations) while historical slot/availability rows still exist — unacceptable for season governance.

**Implementation:** dedicated path in `AccountDeletionService` — set memberships `INACTIVE` **directly** (or via a new `deactivateMembershipsForAccountDeletion(userId)` that **skips** season sync), then anonymize roster PII as in AC 5/10.

### Suggested consequence copy (step 1 — adapt in implementation)

Use a titled dialog *« Supprimer mon compte HatCast ? »* with bullets similar to:

- Vous serez **déconnecté immédiatement** et ne pourrez **plus vous connecter** avec ce compte.
- Votre **adresse e-mail, nom, pseudo membre, photo et préférences de notification** seront **supprimés ou anonymisés**.
- Vous serez **retiré de toutes vos troupes** (adhésions désactivées — plus d’accès à l’application).
- Vos **statistiques de saison** (participations, disponibilités, déclins) **restent comptabilisées** pour la troupe sous le **nom déjà enregistré** sur les saisons ; seules vos **données personnelles identifiables** (e-mail, lien profil, photo) sont effacées.
- L’**historique des spectacles** (disponibilités, compositions, journal d’audit) **reste visible pour les organisateurs** sous forme **anonymisée**, conformément à la gouvernance des troupes.
- **Ce n’est pas** un simple retrait par un administrateur de troupe (qui vous retire aussi des statistiques) : l’action est **définitive** pour **votre compte HatCast**, pas pour l’historique chiffré de la troupe.
- Si vous êtes le **dernier administrateur actif** d’une troupe, la suppression sera **refusée** — transférez d’abord le rôle admin.

### Current state (READ before coding)

| File | Today | This story |
|------|-------|------------|
| [`account-security-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html) | Delete row **disabled** + **Bientôt** | Enable ; `(click)` → open delete dialog |
| [`account-security-tab.ts`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts) | Static tooltips | Inject `MatDialog`, `AuthApiService`, `Router`, `MatSnackBar` |
| [`auth.yaml`](../../services/api/openapi/auth.yaml) | No delete account path | Add `DELETE /auth/me` |
| [`UserEntity`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt) | No `deletedAt` | Add column + anonymization helper |
| [`AuthUserLinkService`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt) | Links on sign-in | Reject deleted accounts |

### Backend implementation guardrails

| Concern | Action |
|--------|--------|
| Anonymization vs delete | **Never** `DELETE FROM users` — FK from `audit_events.actor_user_id` |
| Last admin | Scan **all** active admin memberships for user before delete |
| IdP cleanup | `FirebaseAuth.deleteUser` only when `idp_uid` set ; Google GIS-only users rely on HatCast `deleted_at` + sign-in block |
| Session | Call logout invalidation in same request after mutation |
| Avatar | Reuse `AvatarService` delete path before nulling `avatar_url` |
| Membership vs stats | Set memberships **`INACTIVE` only** — **never** `removeForMembershipAcrossTroupe` on account delete |
| Season roster | Keep `season_participants.status = ACTIVE` ; clear email ; `user_id = NULL` ; keep `display_name` |
| Stats lookup | Availabilities resolve via `season_participant_id` when `user_id` is null ([`StatisticsAvailabilityIndex`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt)) |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Dialog steps | `@if (step === 1)` / `step === 2` in one component or `MatDialogRef` state — keep testable |
| GIS re-auth | Extract minimal callback from login page or open GIS button inside dialog for Google-only |
| Password re-auth | `EmailAuthProvider.credential(email, password)` — email from `AccountPageContext.user()` |
| After success | `logout()` then `router.navigate(['/connexion'])` — clear `AccountPageContext` |
| Loading | Disable confirm + show `mat-spinner` during API call |

### Explicit non-goals

- HatCast API accepting raw password without IdP re-auth token.
- Hard-deleting audit rows or availability history.
- Deleting another user’s account (admin tool).
- V1 Firestore account deletion.
- 30-day deferred deletion job (document as future ops if needed for NFR-S3 formal compliance).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **1.5** | done | Logout + `/compte` routes |
| **1.6** | ready-for-dev | Sécurité tab ; delete row was explicitly left for **1.7** |
| **17.34** | done | Tab shell, `account-delete` testid |
| **2.8** | done | Inverse copy reference (troupe removal ≠ account delete) |
| **9.0** | done | Audit append-only ; anonymized actor display |

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false
./gradlew test --tests '*AccountDeletion*' --tests '*AuthController*'
```

Minimum cases:

- Web: delete button **enabled** ; opens dialog ; step 1 shows consequence keywords ; step 2 blocks confirm until `SUPPRIMER` typed.
- Web: successful delete → logout + navigate `/connexion`.
- API: user anonymized, `deleted_at` set, memberships inactive, audit `ACCOUNT_DELETED` exists.
- API: **`season_participants` still `ACTIVE`** ; statistics totals unchanged after delete ; `userSlug`/`avatarUrl` null on stats row.
- API: sole admin → 409, user unchanged.
- API: second sign-in → 403.

Manual recette:

- Create test user with email/password → delete from Sécurité → verify cannot sign in.
- User with past validated composition → delete → open season **Statistiques** as another member → row still present, counts unchanged, no profile link.
- User sole admin of troupe → verify blocked with clear message.
- Google-only user → GIS re-auth path → delete → GIS sign-in blocked at API.

### Previous story intelligence (1.6)

- Sécurité tab structure and `data-testid` values are stable — only activate delete row.
- Re-auth patterns established for email change (`requires-recent-login`) — reuse for delete.
- After **1.6** lands, specs asserting email/password **enabled** must coexist with delete tests.

### Previous story intelligence (1.5)

- Full logout clears Firebase + server session — **required** after successful delete.

### Git intelligence (recent)

- `03a893ca` — Mon compte tabs: **`account-security-tab`** is the direct touch point.
- Follow `ConfirmDialog` + `seasons-list` destructive confirm patterns from recent web commits.

### Latest technical notes

- **Firebase Admin `deleteUser(uid)`** — same SDK as [`FirebaseIdpIdTokenVerifier`](../../services/api/src/main/kotlin/com/hatcast/api/auth/FirebaseIdpIdTokenVerifier.kt) ; requires service account with Identity Platform admin role.
- **Client `reauthenticateWithCredential`** — Firebase modular auth v9+ (same package as login/signup).
- **Google GIS** — fresh `credential` JWT for `/v1/auth/google` validation on delete endpoint (server verifies `sub` matches session `google_sub`).

### Project context reference

- [project-context.md](../../project-context.md) — Material 3, tests mandatory.
- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) — IdP owns credentials ; Admin SDK for verify/delete.
- [DOMAIN.md](../../DOMAIN.md) § Audit write V2 — retention/anonymisation = story **1.7**.
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — M3 checklist.

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Implemented self-service account deletion end-to-end: `DELETE /v1/auth/me` with re-auth token, anonymization, membership deactivation (no season `REMOVED` cascade), audit `ACCOUNT_DELETED`, IdP `deleteUser` best-effort.
- UI: multi-step `AccountDeleteDialog` (consequences → typed `SUPPRIMER` → password or GIS re-auth), enabled delete row on Sécurité tab.
- `SeasonStatisticsService` hides `userSlug`/`avatarUrl` for deleted accounts (fresh DB lookup) while preserving stat counts.
- **Ops:** Firebase Admin `deleteUser(uid)` requires the same service account as ID token verify (`GOOGLE_APPLICATION_CREDENTIALS`); skipped in test profile when Firebase not initialized.
- **M3 checklist:** M3-1–M3-4 validated ; M3-5 self-check done (dialog scroll/actions ≥48dp mobile, French copy, Material components).
- **Auth identifiers:** `google_sub` retained on deleted row for sign-in block (AC 6); `idp_uid` cleared after best-effort `deleteUser`.
- Tests: `./gradlew test --tests 'com.hatcast.api.auth.AccountDeletionIntegrationTest'` ; web `account-placeholder.spec.ts` + `account-delete-dialog.spec.ts` (21 tests).

### File List

- `services/api/src/main/resources/db/migration/V53__users_deleted_at.sql`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/dto/AccountDeletionRequest.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionType.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionLabels.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/openapi/auth.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/auth/AccountDeletionIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsServiceTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsEventCellTest.kt`
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-user-message.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.ts`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.html`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.scss`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.spec.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts` (fix compile: `loadTroupeAndSeason` arity)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-7-suppression-de-compte.md`

### Change Log

- 2026-06-03 : Story created (`bmad-create-story`) — P0 V2.0.0 ; multi-step confirmation with explicit consequences (user constraint).
- 2026-06-03 : Amendement — preserve season statistics on delete (anonymize account, keep `season_participants` ACTIVE ; no `removeForMembershipAcrossTroupe` cascade).
- 2026-06-03 : Implementation complete — API + UI + tests ; status → review.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR37 / ux-design-mon-compte)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés

## Story completion status

- **Status:** review
- **Sprint key:** `1-7-suppression-de-compte`
- **Note:** Ultimate context engine analysis completed — includes stats preservation on delete (anonymize user, do not REMOVED season participants).
